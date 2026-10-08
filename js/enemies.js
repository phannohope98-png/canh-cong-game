/* =========================================================
 * enemies.js – Quái vật
 * Đi theo đường → gặp lính thì đứng lại đánh → tới lối ra thì trừ mạng.
 * Quân bay bỏ qua lính. Cung thủ Orc bắn lính trong tầm.
 * Vua Troll đập đất làm choáng lính.
 * ========================================================= */
(function () {
  // quái dùng lại mô hình của quái khác (boss phóng to): ArtChars[loại] trỏ tới hình gốc, kể cả các hướng nhìn
  for (const k in CONFIG.enemies) { const src = CONFIG.enemies[k].art; if (!src || !window.ArtChars || !ArtChars[src]) continue; for (const s of ['', '_b', '_f', '_s', '_a0', '_a1', '_a2', '_a3', '_a4', '_a5', '_a6', '_a7']) if (ArtChars[src + s] && !ArtChars[k + s]) ArtChars[k + s] = ArtChars[src + s]; }
  let uid = 0; const tmp = {}; const K_glow = (...a) => ArtKit.glow(...a);
  class Enemy {
    constructor(type, pathIndex, hpMul) {
      const d = CONFIG.enemies[type], art = ArtChars[type];
      this.uid = ++uid; this.type = type; this.def = d; this.name = d.name;
      this.maxHp = Math.round(d.hp * (hpMul || 1)); this.hp = this.maxHp;
      this.armor = d.armor; this.mres = d.mres; this.speed = d.speed * CONFIG.match.enemySpeedScale; this.radius = d.radius;
      this.flying = !!d.flying; this.boss = !!d.boss; this.reward = d.reward;
      this.art = type; this.pathIndex = pathIndex; this.rateMul = 1; this.speedMul = 1; this.chargeT = 0;
      this.scale = d.radius / art.dr * (CONFIG.unitScale || 1); this.height = (art.tall ? art.tall * 0.95 : art.box[3] * 0.78) * this.scale + (this.flying ? 18 : 0);
      this.path = Game.map.paths[pathIndex]; this.dist = 0; this.lat = (Math.random() - 0.5) * CONFIG.pathWidth * 0.5;
      this.alive = true; this.state = 'walk'; this.cd = 0.4; this.atk = -1; this.flash = 0; this.slow = 0;
      this.walk = Math.random(); this.anim = Math.random() * 3; this.face = 1; this.slamT = d.slam ? d.slam.every : 0; this.shootCd = 1;
      this.place();
    }
    place() {
      const p = this.path.pointAt(this.dist, tmp);
      this.x = p.x + p.nx * this.lat; this.y = p.y + p.ny * this.lat;
      if (Math.abs(p.tx) > 0.25) this.face = p.tx > 0 ? 1 : -1;
      this.tdx = p.tx; this.tdy = p.ty;
    }
    /** Kỹ năng riêng: sói lao tới, boss triệu hồi, đổi giai đoạn */
    abilities(dt) {
      const d = this.def, hpR = this.hp / this.maxHp;
      if (d.charge) {
        if (this.chargeT > 0) { this.chargeT -= dt; if (Math.random() < dt * 20) Effects.particle(this.x - this.face * 14, this.y, -this.face * 40, -20, 0.4, '#d8c8a8', 5); }
        else { this.chargeCd = (this.chargeCd === undefined ? Math.random() * d.charge.every : this.chargeCd) - dt; if (this.chargeCd <= 0) { this.chargeCd = d.charge.every; this.chargeT = d.charge.time; Effects.burst(this.x, this.y, '#d8c8a8', 8, 120, 0.4, 5, 200); } }
      }
      if (d.phase2 && !this.p2 && hpR < d.phase2) { this.p2 = true; this.art = this.type + '2'; this.rateMul = 0.65; Effects.comic(this.x, this.y - this.height - 20, 'GRAAH!', '#ff4a3a', true); Effects.shake(8, 0.5); Effects.ring(this.x, this.y, 10, 90, 0.5, '#ff3a3a', 6); }
      if (d.summon) { this.sumT = (this.sumT === undefined ? d.summon.every * 0.6 : this.sumT) - dt; if (this.sumT <= 0) { this.sumT = d.summon.every; this.summon([[d.summon.type, d.summon.n]]); } }
      if (d.lord) {
        if (!this.p2 && hpR < 0.66) { this.p2 = true; this.sumT = 1; Effects.comic(this.x, this.y - this.height - 20, 'QUÂN TA ĐÂU!', '#c08aff', true); }
        if (this.p2) { this.sumT -= dt; if (this.sumT <= 0) { this.sumT = 8; this.summon([['goblin', 3], ['orc', 2]]); } }
        if (!this.p3 && hpR < 0.33) { this.p3 = true; this.art = 'darkLord3'; this.speedMul = 1.9; this.rateMul = 0.65; Effects.comic(this.x, this.y - this.height - 20, 'CUỒNG NỘ!', '#ff3a2a', true); Effects.shake(12, 0.7); Effects.flash(this.x, this.y - 40, 160, '#ff3a2a'); }
      }
    }
    summon(list) {
      let i = 0;
      for (const [type, n] of list) for (let k = 0; k < n; k++, i++) {
        const m = new Enemy(type, this.pathIndex, Waves.hpMul); m.dist = Math.max(0, this.dist - 30 - i * 14); m.lat = (Math.random() - 0.5) * CONFIG.pathWidth * 0.6; m.place(); m.alpha = 0;
        Enemies.list.push(m); Effects.burst(m.x, m.y - 10, '#3a1a4a', 10, 120, 0.5, 7, -60);
      }
      Effects.ring(this.x, this.y, 10, 110, 0.6, '#7a2ab0', 7); Effects.flash(this.x, this.y - 30, 120, '#5a1a8a'); AudioSys.play('boss');
    }
    /** Vị trí sau t giây (để pháo bắn đón đầu) */
    predict(t) { if (this.state !== 'walk') return { x: this.x, y: this.y }; const p = this.path.pointAt(this.dist + this.speed * t, {}); return { x: p.x + p.nx * this.lat, y: p.y + p.ny * this.lat }; }

    update(dt) {
      if (this.flash > 0) this.flash -= dt;
      this.anim += dt;
      if (this.def.regen && this.hp < this.maxHp) this.hp = Math.min(this.maxHp, this.hp + this.def.regen * dt);
      if (this.dots) { // độc / cháy từ vật phẩm trụ
        for (const k in this.dots) { const d = this.dots[k]; if (d.t <= 0) continue; d.t -= dt; d.acc += d.dps * dt; if (d.acc >= 1) { const n = Math.floor(d.acc); d.acc -= n; Combat.hitEnemy(this, n, 'true'); if (!this.alive) return; } }
      }
      if (this.atk >= 0) { this.atk += dt / 0.5; if (this.atk >= 1) this.atk = -1; }
      this.cd -= dt;
      if (this.slowT > 0) { this.slowT -= dt; if (this.slowT <= 0) this.slowMul = 1; }
      if (this.stunT > 0) { this.stunT -= dt; this.state = 'idle'; return; }
      this.abilities(dt);

      // Trùm đập đất
      if (this.def.slam) {
        this.slamT -= dt;
        if (this.slamT <= 0) {
          this.slamT = this.def.slam.every; this.atk = 0;
          const s = this.def.slam; let n = 0;
          for (const u of Units.list) if (u.active && Math.hypot(u.x - this.x, u.y - this.y) < s.radius) { Combat.hitUnit(u, s.damage); u.stun = 2; n++; }
          Effects.ring(this.x, this.y, 10, s.radius, 0.5, '#d8c8a8', 8); Effects.shake(10, 0.4); AudioSys.play('explode');
        }
      }

      // Bị chặn bởi lính?
      if (!this.flying) {
        // ưu tiên đứng lại với lính đang nhắm vào mình (để 2 bên đánh nhau thật, không ai đứng nhìn)
        let blocker = null, bk = -1;
        for (const u of Units.list) {
          if (!u.active || u.alpha < 0.5) continue;
          const r = this.radius + u.radius + 6;
          if (Math.abs(u.x - this.x) < r && Math.abs(u.y - this.y) < r && Math.hypot(u.x - this.x, u.y - this.y) < r) { const k = u.tUid === this.uid ? 2 : 1; if (k > bk) { bk = k; blocker = u; } }
        }
        this.blocker = blocker;
        if (blocker) {
          this.state = 'fight'; this.face = blocker.x >= this.x ? 1 : -1;
          if (this.cd <= 0) {
            this.cd = this.def.rate * this.rateMul; this.atk = 0;
            if (this.chargeT > 0) { this.chargeT = 0; Combat.hitUnit(blocker, [this.def.damage[0] * 2, this.def.damage[1] * 2]); Effects.comic(blocker.x, blocker.y - 40, 'HÚC!', '#ff9a3a', true); Effects.shake(3, 0.15); }
            else Combat.hitUnit(blocker, this.def.damage);
            Effects.hit(blocker.x, blocker.y - 14, '#ffb0a0'); if (blocker.hitT !== undefined) blocker.hitT = 0.2;
          }
          return;
        }
      }
      // Cung thủ: bắn lính trong tầm khi đang đi
      if (this.def.ranged) {
        this.shootCd -= dt;
        if (this.shootCd <= 0) {
          let best = null, bd = this.def.ranged;
          for (const u of Units.list) { if (!u.active) continue; const d = Math.hypot(u.x - this.x, u.y - this.y); if (d < bd) { bd = d; best = u; } }
          if (best) { this.shootCd = this.def.rate * 1.4; this.atk = 0; Combat.fire('enemyArrow', this.x, this.y - this.height * 0.6, best, { damage: this.def.damage }); }
          else this.shootCd = 0.3;
        }
      }
      this.state = 'walk';
      const step = this.speed * (this.slowMul || 1) * this.speedMul * (this.chargeT > 0 ? this.def.charge.mul : 1) * dt;
      this.dist += step; this.walk += step / (window.ArtStylized?.stride(this.art,this.height)||this.radius*2.8);
      if (this.dist >= this.path.length) { Game.enemyEscaped(this); return; }
      this.place();
    }

    get drawY() { return this.y; }
    draw(ctx) {
      const fy = this.y + this.radius * 0.5;
      if (this.boss) ArtKit.glow(ctx, this.x, fy - this.height * 0.5, this.radius * 3.2, '#c01e3a', 0.3 + Math.sin(this.anim * 4) * 0.08);
      const mode = this.atk >= 0 ? 'atk' : this.state === 'walk' ? 'walk' : 'idle';
      if (this.alpha !== undefined && this.alpha < 1) { this.alpha = Math.min(1, this.alpha + 0.04); ctx.globalAlpha = this.alpha; }
      if (this.p3 || (this.p2 && this.def.phase2)) K_glow(ctx, this.x, fy - this.height * 0.5, this.radius * 3, '#ff2a1a', 0.35 + Math.sin(this.anim * 8) * 0.15);
      const aim = mode === 'walk' ? Math.atan2(this.tdy || 0, this.tdx || 1) : (this.face > 0 ? 0.35 : Math.PI - 0.35);
      let art = this.art, face = this.face; const dk = window.Art3D && Art3D.dirKey && Art3D.dirKey(art, aim); if (dk) { art = dk; face = 1; }
      Painter.char(ctx, art, this.x, fy, this.scale, face, mode, mode === 'atk' ? this.atk : mode === 'walk' ? this.walk : this.anim);
      ctx.globalAlpha = 1;
      if (this.flash > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.min(0.75, this.flash * 7); Painter.char(ctx, art, this.x, fy, this.scale, face, mode, mode === 'atk' ? this.atk : mode === 'walk' ? this.walk : this.anim); ctx.restore(); }
      if (this.slowT > 0) ArtKit.glow(ctx, this.x, fy - this.height * 0.4, this.radius * 2.2, '#8fe0ff', 0.45);
      if (this.dots) { if (this.dots.poison && this.dots.poison.t > 0) ArtKit.glow(ctx, this.x, fy - this.height * 0.45, this.radius * 1.9, '#7aff4a', 0.4); if (this.dots.burn && this.dots.burn.t > 0) { ArtKit.glow(ctx, this.x, fy - this.height * 0.45, this.radius * 1.9, '#ff7a2a', 0.45); if (Math.random() < 0.2) Effects.particle(this.x + (Math.random() - 0.5) * this.radius, fy - this.height * 0.6, 0, -40, 0.4, '#ffb04a', 4); } }
      if (this.stunT > 0) for (let i = 0; i < 3; i++) { const a = this.anim * 6 + i * 2.1; ArtKit.dot(ctx, this.x + Math.cos(a) * this.radius * 0.7, fy - this.height - 4 + Math.sin(a) * 3, 2.2, '#ffe58a'); }
    }
    drawBar(ctx) {
      if (this.boss || this.hp >= this.maxHp) return;
      hpBar(ctx, this.x, this.y + this.radius * 0.5 - this.height - 10, Math.max(24, this.radius * 2), this.hp / this.maxHp, '#e8463a');
    }
  }

  function hpBar(ctx, cx, y, w, r, col) {
    const x = cx - w / 2, h = 5;
    ctx.fillStyle = '#1d1220'; ctx.fillRect(x - 1.5, y - 1.5, w + 3, h + 3);
    ctx.fillStyle = '#4a1e24'; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = col; ctx.fillRect(x, y, Math.max(0, w * r), h);
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(x, y, Math.max(0, w * r), 1.6);
  }

  const Enemies = {
    list: [],
    clear() { this.list.length = 0; },
    /** sát thương theo thời gian (giữ mức mạnh nhất, làm mới thời gian) */
    dot(e, kind, dps, t) { const D = e.dots || (e.dots = {}), d = D[kind] || (D[kind] = { dps: 0, t: 0, acc: 0 }); if (d.t <= 0 || dps > d.dps) d.dps = dps; d.t = Math.max(d.t, t); },
    spawn(type, pathIndex, hpMul) { const e = new Enemy(type, pathIndex, hpMul); this.list.push(e); if (e.boss) Game.onBoss(e); return e; },
    update(dt) {
      for (let i = this.list.length - 1; i >= 0; i--) { const e = this.list[i]; if (e.alive) e.update(dt); if (!e.alive) this.list.splice(i, 1); }
    },
    boss() { return this.list.find(e => e.boss && e.alive) || null; }
  };
  window.Enemies = Enemies; window.hpBar = hpBar;
})();
