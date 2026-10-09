/* =========================================================
 * spells.js – 2 phép toàn bản đồ (giống Kingdom Rush)
 * Viện Binh: gọi 2 lính tạm thời ra chặn đường tại chỗ chạm.
 * Mưa Thiên Thạch: thiên thạch rơi xuống gây sát thương diện rộng.
 * Bấm nút phép → chạm lên bản đồ để thả. Bấm lại nút để huỷ.
 * ========================================================= */
(function () {
  const DEF = {
    reinforce: { name: 'Viện Binh', icon: 'swords', cd: 20, life: 20, hp: 140, damage: [7, 11], armor: 0.15, tip: 'Chạm lên con đường để gọi viện binh' },
    meteor: { name: 'Mưa Thiên Thạch', icon: 'fire', cd: 45, radius: 85, damage: [55, 85], count: 5, tip: 'Chạm lên bản đồ để thả thiên thạch' }
  };
  const tmp = {};

  const Spells = {
    DEF, cd: { reinforce: 0, meteor: 0 }, armed: null, rocks: [],

    reset() { this.cd.reinforce = 6; this.cd.meteor = 15; this.armed = null; this.rocks.length = 0; },

    arm(k) {
      if (Game.state !== 'playing') return;
      if (this.cd[k] > 0) { UI.toast(DEF[k].name + ' đang hồi: ' + Math.ceil(this.cd[k]) + 's'); AudioSys.play('error'); return; }
      this.armed = this.armed === k ? null : k;
      Game.sel = null; Game.heroSelected = false; Game.rallyFor = null; UI.closeRing();
      UI.tip(this.armed ? DEF[k].tip : null); AudioSys.play('click');
    },

    /** Gọi từ Game.onTap khi đang chọn phép. Trả true nếu đã xử lý cú chạm. */
    tap(x, y) {
      const k = this.armed; if (!k) return false;
      if (k === 'reinforce') {
        let best = null;
        Game.map.paths.forEach((p, i) => { const n = p.nearest(x, y); if (!best || n.perp < best.perp) best = { perp: n.perp, dist: n.dist, i }; });
        if (!best || best.perp > 60) { UI.toast('Hãy chạm lên con đường'); AudioSys.play('error'); return true; }
        const p = Game.map.paths[best.i];
        const arts = ['soldier', 'soldier']; // viện binh: 2 lính người, cùng hình & cỡ lính trụ Người
        [-1, 1].forEach((s, j) => {
          p.pointAt(Math.max(20, Math.min(p.length - 20, best.dist + s * 14)), tmp);
          const px = tmp.x + tmp.nx * s * 12, py = tmp.y + tmp.ny * s * 12, art = arts[j];
          const u = new Unit({ temp: true, life: DEF.reinforce.life, x: px, y: py - 40, postX: px, postY: py, state: 'move', alpha: 0, radius: 12, speed: 90, rate: 0.95, engage: 90,
            maxHp: DEF.reinforce.hp, hp: DEF.reinforce.hp, damage: DEF.reinforce.damage.slice(), armor: DEF.reinforce.armor, art, scale: 34 / 48, regen: 6 });
          Units.list.push(u);
          Effects.ring(px, py, 6, 34, 0.45, '#8ac8ff', 4); Effects.burst(px, py - 10, '#dfefff', 12, 140, 0.45, 5, -40);
        });
        AudioSys.play('holy');
      } else if (k === 'meteor') {
        const D = DEF.meteor;
        for (let i = 0; i < D.count; i++) {
          const a = Math.random() * Math.PI * 2, r = i === 0 ? 0 : 25 + Math.random() * 45;
          this.rocks.push({ x: x + Math.cos(a) * r, y: y + Math.sin(a) * r * 0.7, t: 0, delay: 0.15 + i * 0.22, fall: 0.55 });
        }
        Effects.ring(x, y, 10, D.radius, 0.6, '#ff8a3a', 4); AudioSys.play('rage');
      }
      this.cd[k] = DEF[k].cd; this.armed = null; UI.tip(null);
      return true;
    },

    update(dt) {
      for (const k in this.cd) if (this.cd[k] > 0) this.cd[k] = Math.max(0, this.cd[k] - dt);
      const D = DEF.meteor;
      for (let i = this.rocks.length - 1; i >= 0; i--) {
        const m = this.rocks[i]; m.t += dt;
        if (m.t >= m.delay + m.fall) {
          Combat.splash(m.x, m.y, m.r || D.radius * 0.7, m.dmg || D.damage, 'physical');
          Effects.explosion(m.x, m.y, 70, '#ff6a1a'); Effects.burst(m.x, m.y, '#3a2a22', 10, 160, 0.6, 6, 300);
          Effects.shake(6, 0.25); AudioSys.play('explode'); Effects.comic(m.x, m.y - 50, 'BOOM!', '#ff7a2a');
          this.rocks.splice(i, 1);
        }
      }
    },

    /** Thiên thạch đang rơi: quả cầu lửa + vệt đuôi + bóng mục tiêu */
    draw(ctx) {
      for (const m of this.rocks) {
        if (m.t < m.delay) continue;
        const k = (m.t - m.delay) / m.fall, sx = m.x - 260 * (1 - k), sy = m.y - 520 * (1 - k);
        ctx.save(); ctx.globalAlpha = 0.25 + k * 0.4; ctx.fillStyle = '#200a00';
        ctx.beginPath(); ctx.ellipse(m.x, m.y, 14 + k * 20, 5 + k * 7, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        const gr = ctx.createLinearGradient(sx - 130, sy - 260, sx, sy); gr.addColorStop(0, 'rgba(255,120,30,0)'); gr.addColorStop(1, 'rgba(255,170,60,0.85)');
        ctx.strokeStyle = gr; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(sx - 110, sy - 220); ctx.lineTo(sx, sy); ctx.stroke();
        ArtKit.glow(ctx, sx, sy, 34, '#ff8a2a', 0.9); ArtKit.glow(ctx, sx, sy, 16, '#fff0a0', 1);
        ctx.restore();
        if (!(window.Fx3D && Fx3D.draw(ctx, 'meteor', sx, sy, m.t * 3, 1.1))) { ArtKit.dot(ctx, sx, sy, 9, '#4a2a1a'); ArtKit.dot(ctx, sx - 2, sy - 2, 4, '#ff9a3a'); }
      }
    }
  };
  window.Spells = Spells;
})();
