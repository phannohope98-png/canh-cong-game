/* =========================================================
 * lights.js – Ánh sáng động cho vùng tối (Núi Lửa, Hỗn Mang)
 * Cảnh được phủ một lớp tối màu (multiply); đèn, đuốc, vạc lửa, pha lê, dòng dung nham
 * là nguồn sáng tĩnh (vẽ sẵn 1 lần vào bản đồ sáng độ phân giải thấp); chớp nổ, tinh thể phép,
 * thiên thạch là nguồn sáng động mỗi khung → nhân vật đứng gần được rọi sáng thật.
 * ========================================================= */
(function () {
  const TAU = Math.PI * 2, SCALE = 0.25;
  const PRESET = {
    lava: { tint: '#9a6a62', glow: 0.55 },
    chaos: { tint: '#76689c', glow: 0.6 }
  };
  const LCOL = { lamp: null, brazier: '#ff9a3a', redcrystal: '#ff5a3a', voidcrystal: '#b070ff', icecrystal: '#8ae0ff', spire: '#ff7a2a', rune: '#c88cff' };
  window.Lights = {
    on: false,
    setup(map) {
      const P = PRESET[map.def.theme];
      this.on = !!P && !!(window.Art3D && Art3D.enabled); if (!this.on) return;
      const W = map.W, H = map.H, cw = Math.ceil(W * SCALE), ch = Math.ceil(H * SCALE);
      const src = [];
      const lampCol = map.def.theme === 'chaos' ? '#d08aff' : '#ffb04a';
      for (const d of map.decor) {
        if (d.prop) { if (d.k === 'monument' || d.k === 'portal') src.push([d.x, d.y - 40, d.k === 'portal' ? 260 : 220, d.k === 'portal' ? '#b070ff' : '#ff8a2a']); if (d.k === 'fort' && d.dark) src.push([d.x, d.y - 20, 160, '#ff6a2a']); continue; }
        if (!(d.k in LCOL)) continue;
        src.push([d.x, d.y - 30 * (d.s || 1), (d.k === 'lamp' || d.k === 'brazier' ? 150 : 95) * (d.s || 1), LCOL[d.k] || lampCol]);
      }
      for (const r of map.feat.rivers) { const pts = r.pts.map(q => q.x !== undefined ? q : { x: q[0], y: q[1] }); let acc = 0; for (let i = 1; i < pts.length; i++) { acc += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y); if (acc > 70) { acc = 0; src.push([pts[i].x, pts[i].y, r.w * 1.6 + 70, map.def.theme === 'chaos' ? '#a050ff' : '#ff6a1a']); } } }
      for (const l of map.feat.lakes) src.push([l.x, l.y, Math.max(l.rx, l.ry) * 1.5, map.def.theme === 'chaos' ? '#a050ff' : '#ff6a1a']);
      // lớp nhân (tối, chỗ có đèn thì trắng = không tối)
      const mk = () => { const c = document.createElement('canvas'); c.width = cw; c.height = ch; return c; };
      const mul = mk(), mg = mul.getContext('2d'); mg.fillStyle = P.tint; mg.fillRect(0, 0, cw, ch); mg.globalCompositeOperation = 'lighter';
      const add = mk(), ag = add.getContext('2d'); ag.globalCompositeOperation = 'lighter';
      for (const [x, y, r, col] of src) {
        const X = x * SCALE, Y = y * SCALE, R = r * SCALE;
        let g = mg.createRadialGradient(X, Y, 0, X, Y, R); g.addColorStop(0, 'rgba(255,240,220,0.75)'); g.addColorStop(1, 'rgba(255,240,220,0)'); mg.fillStyle = g; mg.fillRect(X - R, Y - R, R * 2, R * 2);
        g = ag.createRadialGradient(X, Y, 0, X, Y, R * 0.8); g.addColorStop(0, ArtKit.alpha(col, 0.35)); g.addColorStop(1, ArtKit.alpha(col, 0)); ag.fillStyle = g; ag.fillRect(X - R, Y - R, R * 2, R * 2);
      }
      this.mul = mul; this.add = add; this.W = W; this.H = H; this.P = P;
    },
    dyn(c, x, y, r, col, a) { const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, ArtKit.alpha(col, a)); g.addColorStop(1, ArtKit.alpha(col, 0)); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); },
    draw(c, t) {
      if (!this.on) return;
      c.save();
      c.globalCompositeOperation = 'multiply'; c.drawImage(this.mul, 0, 0, this.W, this.H);
      c.globalCompositeOperation = 'lighter'; c.globalAlpha = this.P.glow * (0.9 + Math.sin(t * 7) * 0.05 + Math.sin(t * 13) * 0.04); c.drawImage(this.add, 0, 0, this.W, this.H);
      c.globalAlpha = 1;
      // nguồn sáng động: chớp nổ, tinh thể phép, thiên thạch, tháp phép đang niệm
      for (const o of Effects.rings) if (o.glow) { const k = o.life / o.maxLife; this.dyn(c, o.x, o.y, o.r1 * 2.2, o.color || '#ffb347', 0.45 * k); }
      for (const p of Combat.shots) if (p.kind === 'bolt') this.dyn(c, p.x, p.y, 70, '#8fd0ff', 0.35);
      if (window.Spells && Spells.rocks) for (const m of Spells.rocks) if (m.t >= m.delay) { const k = (m.t - m.delay) / m.fall; this.dyn(c, m.x - 260 * (1 - k), m.y - 520 * (1 - k), 120, '#ff8a2a', 0.4); }
      for (const T of Towers.list) if (T.type === 'mage' && T.anim.a >= 0) this.dyn(c, T.x, T.y - 70, 120, '#b070ff', 0.3 * Math.sin(Math.min(1, T.anim.a) * Math.PI));
      c.restore();
    }
  };
})();
