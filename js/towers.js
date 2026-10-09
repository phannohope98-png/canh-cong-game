/* =========================================================
 * towers.js – 4 loại trụ trên các ô xây
 * Trụ không bị tấn công. Nâng cấp đổi hình dạng (4 cấp).
 * ========================================================= */
(function () {
  const TS = 1.15; // trụ lớn, rõ hơn trên bản đồ gọn
  const FALL = 0.32, SQUASH = 0.22, DROP_H = 65; // xây trụ: rơi từ trên trời xuống, đập đất rồi nảy
  const TARGET = {
    first(T, air) { let b = null, bd = -1; for (const e of Enemies.list) if (e.alive && (air || !e.flying) && T.inRange(e) && e.dist > bd) { bd = e.dist; b = e; } return b; },
    densest(T) {
      let b = null, bc = -1; const r = T.stats.aoe;
      for (const e of Enemies.list) { if (!e.alive || e.flying || !T.inRange(e)) continue; let c = 0; for (const o of Enemies.list) if (o.alive && !o.flying && Math.abs(o.x - e.x) < r && Math.abs(o.y - e.y) < r) c++; if (c > bc || (c === bc && e.dist > b.dist)) { bc = c; b = e; } }
      return b;
    }
  };

  class Tower {
    constructor(type, spot) {
      this.type = type; this.def = CONFIG.towers[type]; this.spot = spot; this.x = spot.x; this.y = spot.y;
      this.level = 1; this.spent = this.def.cost[0]; this.cd = 0.5; this.shots = 0; this.t = Math.random() * 5;
      this.anim = { a: -1, face: 1, k: 0, door: 0 }; this.pulse = 0.4; this.pending = null; this.born = 1; this.drop = 0; this.landed = false;
      if (this.def.kind === 'barracks') {
        let best = null;
        Game.map.paths.forEach((p, i) => { const n = p.nearest(this.x, this.y); if (!best || n.perp < best.perp) best = { perp: n.perp, dist: n.dist, i }; });
        this.rallyPath = best.i; this.rallyDist = best.dist;
      }
    }
    get stats() {
      const lv = this.def.levels[this.level - 1], M = Items.mods(this.type);
      const dm = (1 + M.damage), rm = (1 + M.range), am = (1 + M.aoe);
      return { damage: lv.damage ? [lv.damage[0] * dm, lv.damage[1] * dm] : null, range: (lv.range || 0) * rm, rate: (lv.rate || 1) / (1 + M.rate), aoe: (lv.aoe || 0) * am, special: null,
        crit: M.crit, poison: M.poison, root: M.root, slow: M.slow, pen: M.pen, burn: M.burn, stun: M.stun };
    }
    get nextCost() { return this.level >= 4 ? null : this.def.cost[this.level]; }
    get refund() { return Math.floor(this.spent * CONFIG.match.sellRefund); }
    inRange(e) { const r = this.stats.range + e.radius, dx = e.x - this.x, dy = (e.y - this.y) * 1.15; return dx * dx + dy * dy <= r * r; }
    muzzle() {
      const T = ArtTowers, f = this.anim.face;
      if(window.PaintedWorld?.enabled){
        const L=PaintedWorld.layout(this.type,this.level,TS),c=L.crew;if(L.muzzle)return{x:this.x+L.muzzle[0]*f,y:this.y+L.base+L.muzzle[1]};
        if(c)return{x:this.x+c[1]+(L.mx||14)*f*TS,y:this.y+L.base+c[2]-(L.my||20)*TS};
        return{x:this.x,y:this.y+L.base-L.h*.6};
      }
      if (this.type === 'archer') return { x: this.x + ((this.anim.k % 2 ? 9 : -9) + 10 * f) * TS, y: this.y + (T.ARCH_TOP[this.level] - 14) * TS };
      if (this.type === 'mage') return { x: this.x + 6 * f * TS, y: this.y + (T.MAGE_TOP[this.level] - 30) * TS };
      return { x: this.x + 15 * TS, y: this.y + (T.ART_Y[this.level] - 24 - this.level) * TS };
    }
    update(dt) {
      this.t += dt; this.born += dt; if (this.pulse > 0) this.pulse -= dt; if (this.anim.door > 0) this.anim.door -= dt;
      if (this.drop < FALL + SQUASH) this.drop += dt;
      if (!this.landed) { if (this.drop < FALL) return; this.land(); }
      if (this.def.kind === 'barracks') return;
      const A = this.anim, st = this.stats;
      if (A.a >= 0) { const prev = A.a; A.a += dt / (this.type === 'artillery' ? 1.05 : this.type === 'mage' ? .95 : .8); const releaseAt=this.type==='mage'?2/3:.5;if(prev<releaseAt&&A.a>=releaseAt)this.release(); if (A.a >= 1) A.a = -1; }
      if (this.burstN > 0) { this.burstT -= dt; if (this.burstT <= 0) { const tg = TARGET.first(this, true); if (tg) { A.k++; this.shootArrow(tg, this.muzzle()); } this.burstN--; this.burstT = 0.09; } }
      this.cd -= dt;
      if (this.cd > 0 || A.a >= 0) return;
      const tg = this.type === 'artillery' ? TARGET.densest(this) : TARGET.first(this, this.def.targetsAir);
      if (!tg) { this.cd = 0.1; return; }
      this.pending = tg; A.face = tg.x >= this.x ? 1 : -1; A.aim = Math.atan2(tg.y - this.y, tg.x - this.x); A.a = 0; A.k++; this.cd = st.rate;
    }
    /** chạm đất sau khi rơi: bụi tung, rung màn hình, lính mới bước ra */
    land() {
      this.landed = true; const x = this.x, y = this.y;
      const soil=Game.map.theme.dirt; Effects.burst(x-24,y+5,soil,7,70,.4,4,70);Effects.burst(x+24,y+5,soil,7,70,.4,4,70);
      // The permanent foundation supplies the soil contact.
      Effects.shake(2, 0.15); AudioSys.play('build');
      if (this.def.kind === 'barracks' && !Units.list.some(u => u.tower === this)) Units.createFor(this);
    }
    /** Elf bắn 1 mũi tên; 15% chí mạng: mũi tên phát sáng, sát thương gấp đôi */
    shootArrow(t, m) {
      const st = this.stats, crit = Math.random() < 0.15 + st.crit;
      Combat.fire('arrow', m.x, m.y, t, { damage: crit ? [st.damage[0] * 2, st.damage[1] * 2] : st.damage, type: 'physical', pierce: crit, poison: st.poison, root: st.root });
      if (crit) Effects.comic(t.x, t.y - 46, 'CHÍ MẠNG!', '#ffe14a');
      AudioSys.play('arrow');
    }
    release() {
      const t = this.pending, st = this.stats; if (!t || !t.alive) return;
      const m = this.muzzle();
      if (this.type === 'archer') {
        this.shots++;
        this.shootArrow(t, m);
      } else if (this.type === 'orc') {
        this.shots++;
        const stun = st.special === 'stun' && this.shots % 3 === 0, tx = t.x, ty = t.y;
        Combat.splash(tx, ty, st.aoe, st.damage, 'physical');
        if (stun) for (const e of Enemies.list) if (e.alive && !e.flying && Math.hypot(e.x - tx, (e.y - ty) * 1.25) <= st.aoe + e.radius) e.stunT = Math.max(e.stunT || 0, 1.0);
        Effects.hit(tx, ty - t.height * 0.4, stun ? '#ffe58a' : '#fff4d0'); Effects.ring(tx, ty, 8, st.aoe, 0.3, stun ? '#ffe58a' : '#e8d8b0', 4);
        Effects.burst(tx, ty, '#c8b890', 6, 90, 0.35, 5, 180); Effects.shake(2.5, 0.12); AudioSys.play('sword');
      } else if (this.type === 'mage') {
        this.shots++;
        Combat.fire('bolt', m.x, m.y, t, { damage: st.damage, type: 'magic', aoe: st.aoe, pen: st.pen, slow: st.slow }); AudioSys.play('magic');
  
      } else {
        Combat.fire('bomb', m.x, m.y, t, { damage: st.damage, aoe: st.aoe, cluster: false, burn: st.burn, stun: st.stun }); AudioSys.play('cannon');
        Effects.burst(m.x, m.y, '#e8e0d8', 8, 80, 0.5, 7, -30);
      }
    }
    get drawY() { return this.y + 14; }
    draw(ctx) {
      if(window.PaintedWorld?.foundation)PaintedWorld.foundation(ctx,this.x,this.y,this.type,this.level,this.drop);
      const k = this.pulse > 0 ? 1 + Math.sin(this.pulse / 0.4 * Math.PI) * 0.08 : 1;
      if (this.drop < FALL + SQUASH) { // rơi từ trời: tăng tốc dần, bóng dưới đất lớn dần; chạm đất thì bẹp xuống rồi nảy lại
        const gx = this.x, gy = this.y + 2;
        if (this.drop < FALL) {
          const u = this.drop / FALL, off = -DROP_H * (1 - u * u);
          ctx.save(); ctx.globalAlpha = 0.15 + 0.4 * u; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(gx, gy, 20 + 34 * u, 8 + 12 * u, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
          ctx.save(); ctx.translate(gx, gy + off); ctx.scale(0.94, 1.08); ctx.translate(-gx, -gy);
          Painter.tower(ctx, this.type, this.level, this.x, this.y, TS, this.t, this.anim); ctx.restore();
          ctx.save(); ctx.globalAlpha = 0.35 * (1 - u); ctx.strokeStyle = '#fff6d8'; ctx.lineWidth = 3; for (const dx of [-26, 0, 26]) { ctx.beginPath(); ctx.moveTo(gx + dx, gy + off - 160); ctx.lineTo(gx + dx, gy + off - 260); ctx.stroke(); } ctx.restore();
          return;
        }
        const v = (this.drop - FALL) / SQUASH, sy = 1 - 0.055 * Math.cos(v * Math.PI * 2.4) * (1 - v) * (1 - v), sx = 1 / Math.sqrt(sy);
        ctx.save(); ctx.translate(gx, gy); ctx.scale(sx, sy); ctx.translate(-gx, -gy);
        Painter.tower(ctx, this.type, this.level, this.x, this.y, TS, this.t, this.anim); ctx.restore(); return;
      }
      if (this.born < 0.5) { // mọc lên từ mặt đất, nảy nhẹ (easeOutBack)
        const u = Math.min(1, this.born / 0.5), c1 = 1.9, ey = 1 + (c1 + 1) * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2);
        ctx.save(); ctx.translate(this.x, this.y + 2); ctx.scale(1 + (1 - u) * 0.15, Math.max(0.05, ey)); ctx.translate(-this.x, -this.y - 2);
        Painter.tower(ctx, this.type, this.level, this.x, this.y, TS * k, this.t, this.anim); ctx.restore(); return;
      }
      Painter.tower(ctx, this.type, this.level, this.x, this.y, TS * k, this.t, this.anim);
      // Attachments travel with the building and are drawn by Painter.tower.
    }
    /** đồ đang gắn: huy hiệu nhỏ đúng vị trí lắp trên thân trụ (đỉnh, tầng trên, mặt trước, 2 cánh, nền) */
    topY() { if(window.PaintedWorld?.enabled)return (4.9-(94+this.level*14)*.7)*TS; const TP = window.Towers3D && Towers3D.TOPS && Towers3D.TOPS[this.type]; return -(TP ? TP[this.level] : this.type === 'barracks' ? 34 + this.level * 7 : 70) * TS; }
    drawItems(ctx) {
      const M = Items.mods(this.type); if (!M.list.some(Boolean)) return;
      const top = this.topY(), now = performance.now() / 1000;
      // vũ khí chính ở tầng trên (Cung Thần / Nòng Pháo / Sách Phép): xạ thủ trên trụ toả sáng theo màu bậc đồ
      const w = M.list[1]; if (w && this.type !== 'barracks' && w.r >= 1) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ArtKit.glow(ctx, this.x, this.y + top - 18, 30 + w.r * 3, Items.rar(w).col, 0.12 + w.r * 0.06 + Math.sin(now * 3) * 0.04); ctx.restore(); }
      CONFIG.items.slots.forEach((S, i) => {
        const it = M.list[i]; if (!it) return;
        const y = S.at === 'top' ? top + S.y : S.at === 'mid' ? top * 0.42 + S.y : S.y;
        Items.drawBadge(ctx, it, this.x + S.x * (S.at === 'mid' ? 0.95 : 1), this.y + y, 6.5, now);
      });
    }
    drawOverlay(ctx) {
      if (this.def.kind !== 'barracks') return;
      let i = 0;
      for (const u of Units.list) {
        if (u.tower !== this || u.state !== 'dead') continue;
        const p = 1 - u.respawnT / (u.respawnMax || this.def.respawn), x = this.x - 22 + i * 22, y = this.y + 22;
        ctx.fillStyle = 'rgba(29,18,32,0.85)'; ctx.beginPath(); ctx.arc(x, y, 9, 0, 7); ctx.fill();
        ctx.strokeStyle = '#ffe58a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 6.5, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2); ctx.stroke();
        i++;
      }
    }
  }

  const Towers = {
    TS, list: [], spots: [],
    init(map) { this.list = []; this.spots = map.spots.map(s => Object.assign({ tower: null }, s)); },
    spotAt(x, y) { for (const s of this.spots) if (Math.abs(s.x - x) < 46 && Math.abs(s.y - y + 12) < 44) return s; return null; },
    count(type) { return this.list.filter(t => t.type === type).length; },
    build(spot, type) {
      const cost = CONFIG.towers[type].cost[0];
      if (spot.tower || !Game.spend(cost)) return null;
      const T = new Tower(type, spot); spot.tower = T; this.list.push(T); // lính Người bước ra khi trụ chạm đất (Tower.land)
      AudioSys.play('build'); return T;
    },
    upgrade(T) {
      const c = T.nextCost; if (c === null || !Game.spend(c)) return false;
      T.level++; T.spent += c; T.pulse = 0.4; T.born = 0.12;
      if (T.def.kind === 'barracks') Units.refresh(T, false);
      Effects.ring(T.x, T.y, 10, 70, 0.5, '#ffe58a', 5); Effects.burst(T.x, T.y - 40, '#fff0a0', 22, 200, 0.6, 5, -60);
      AudioSys.play('build'); return true;
    },
    sell(T) {
      Game.addGold(T.refund, T.x, T.y - 30);
      Units.remove(T); this.list.splice(this.list.indexOf(T), 1); T.spot.tower = null;
      Effects.burst(T.x, T.y, '#b8a888', 16, 150, 0.5, 6, 220); AudioSys.play('sell');
    },
    setRally(T, x, y) {
      const p = Game.map.paths[T.rallyPath]; let best = null;
      Game.map.paths.forEach((pp, i) => { const n = pp.nearest(x, y); if (!best || n.perp < best.perp) best = { perp: n.perp, dist: n.dist, i }; });
      if (best.perp > 40) return 'path';
      const pt = Game.map.paths[best.i].pointAt(best.dist, {});
      if (Math.hypot(pt.x - T.x, pt.y - T.y) > T.def.rallyRange) return 'far';
      T.rallyPath = best.i; T.rallyDist = best.dist; Units.placePosts(T);
      Effects.ring(pt.x, pt.y, 4, 30, 0.4, '#8ac8ff', 3); return 'ok';
    },
    update(dt) { for (const T of this.list) T.update(dt); }
  };
  window.Towers = Towers;
})();
