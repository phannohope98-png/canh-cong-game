/* =========================================================
 * water.js – Nước động trên nền 3D: vệt sáng trôi theo dòng sông, gợn sóng loang trên hồ,
 * dung nham sủi bọt & phập phồng ánh sáng. Vẽ mỗi khung, rất nhẹ (vài chục nét).
 * ========================================================= */
(function () {
  const TAU = Math.PI * 2;
  const P = q => (q.x !== undefined ? q : { x: q[0], y: q[1] });
  window.WaterFx = {
    items: null,
    setup(map) {
      const F = map.feat, r = ArtKit.seeded(map.index * 31 + 7), lavaMap = map.def.theme === 'lava', chaos = map.def.theme === 'chaos';
      const items = [];
      for (const rv of F.rivers) {
        const pts = rv.pts.map(P), cum = [0];
        for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
        const L = cum[cum.length - 1], lava = lavaMap || rv.kind === 'lava', n = Math.max(6, Math.round(L / (lava ? 70 : 46)));
        const fx = [];
        for (let i = 0; i < n; i++) fx.push({ s: r() * L, a: (r() - 0.5) * 0.7, sp: (lava ? 14 : 34) * (0.7 + r() * 0.6), len: 8 + r() * 12, ph: r() * TAU });
        items.push({ kind: 'river', pts, cum, L, w: rv.w, lava, chaos, fx });
      }
      for (const lk of F.lakes) {
        const lava = lavaMap || lk.kind === 'lava', fx = [], n = Math.max(3, Math.round(lk.rx * lk.ry / 2600));
        for (let i = 0; i < n; i++) { const a = r() * TAU, d = Math.sqrt(r()) * 0.75; fx.push({ x: lk.x + Math.cos(a) * lk.rx * d, y: lk.y + Math.sin(a) * lk.ry * d, ph: r(), sp: 0.22 + r() * 0.2 }); }
        items.push({ kind: 'lake', lk, lava, chaos, fx });
      }
      this.items = items.length ? items : null;
      this.mask=document.createElement('canvas');this.mask.width=map.W;this.mask.height=map.H;
      this.buffer=document.createElement('canvas');this.buffer.width=map.W;this.buffer.height=map.H;
      const m=this.mask.getContext('2d');m.strokeStyle=m.fillStyle='#fff';m.lineCap=m.lineJoin='round';
      for(const rv of F.rivers){m.lineWidth=Math.max(1,rv.w-9);m.beginPath();rv.pts.map(P).forEach((p,i)=>i?m.lineTo(p.x,p.y+3):m.moveTo(p.x,p.y+3));m.stroke();}
      for(const lk of F.lakes){m.beginPath();m.ellipse(lk.x,lk.y+3,Math.max(1,lk.rx-4),Math.max(1,lk.ry-4),0,0,TAU);m.fill();}
      // Bridges occlude the current and ripples just as they occlude the river.
      m.globalCompositeOperation='destination-out';m.lineWidth=CONFIG.pathWidth+20;
      for(const path of map.paths){m.beginPath();path.points.forEach((p,i)=>i?m.lineTo(p.x,p.y):m.moveTo(p.x,p.y));m.stroke();}

    },
    at(it, s, out) {
      const c = it.cum; let lo = 0, hi = c.length - 1;
      while (lo < hi - 1) { const m = (lo + hi) >> 1; if (c[m] <= s) lo = m; else hi = m; }
      const a = it.pts[lo], b = it.pts[hi], l = (c[hi] - c[lo]) || 1, k = (s - c[lo]) / l, tx = (b.x - a.x) / l, ty = (b.y - a.y) / l;
      out.x = a.x + (b.x - a.x) * k; out.y = a.y + (b.y - a.y) * k; out.tx = tx; out.ty = ty; return out;
    },
    draw(target, t) {
      const c=this.buffer&&this.buffer.getContext('2d');
      if(!c)return;c.clearRect(0,0,this.buffer.width,this.buffer.height);
      if (!this.items) return;
      const q = {};
      c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
      for (const it of this.items) {
        const hot = it.lava ? '255,190,80' : it.chaos ? '230,190,255' : '230,250,255';
        if (it.kind === 'river') {
          for (const f of it.fx) {
            const s = (f.s + t * f.sp) % it.L; this.at(it, s, q);
            const life = (s / 90 + f.ph) % 1, al = Math.sin(life * Math.PI) * (it.lava ? 0.5 : 0.45);
            const x = q.x - q.ty * it.w * f.a, y = q.y + q.tx * it.w * f.a + 3;
            if (it.lava) { const R = 2 + life * 5; c.strokeStyle = 'rgba(' + hot + ',' + al.toFixed(3) + ')'; c.lineWidth = 1.6; c.beginPath(); c.ellipse(x, y, R, R * 0.45, 0, 0, TAU); c.stroke(); }
            else { c.strokeStyle = 'rgba(' + hot + ',' + al.toFixed(3) + ')'; c.lineWidth = 2; c.beginPath(); c.moveTo(x - q.tx * f.len * 0.5, y - q.ty * f.len * 0.5); c.quadraticCurveTo(x - q.ty * 2, y + q.tx * 2, x + q.tx * f.len * 0.5, y + q.ty * f.len * 0.5); c.stroke(); }
          }
          if (it.lava) { const pulse = 0.05 + Math.sin(t * 1.7) * 0.04; c.strokeStyle = 'rgba(255,120,30,' + pulse.toFixed(3) + ')'; c.lineWidth = it.w * 0.8; c.beginPath(); it.pts.forEach((p, i) => i ? c.lineTo(p.x, p.y + 3) : c.moveTo(p.x, p.y + 3)); c.stroke(); }
        } else {
          for (const f of it.fx) {
            const k = (t * f.sp + f.ph) % 1, R = 4 + k * 26, al = (1 - k) * (it.lava ? 0.45 : 0.4);
            c.strokeStyle = 'rgba(' + hot + ',' + al.toFixed(3) + ')'; c.lineWidth = 1.6; c.beginPath(); c.ellipse(f.x, f.y + 3, R, R * 0.37, 0, 0, TAU); c.stroke();
          }
        }
      }
      c.restore();
      c.save();c.globalCompositeOperation='destination-in';c.drawImage(this.mask,0,0);c.restore();
      target.save();target.globalCompositeOperation='lighter';target.drawImage(this.buffer,0,0);target.restore();
    }
  };
})();
