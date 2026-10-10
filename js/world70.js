/* Revision 70 – bản đồ theo đúng lối Kingdom Rush.
 * Đường: cát phẳng sạch (giữa sáng, mép đậm dần, 1 nét nâu mảnh, quầng đất mòn, cỏ lấn mép) – không sỏi, không viền đen.
 * Nền: cỏ/tuyết/đất phẳng tươi, chỉ vài cụm cỏ nét bút. Ô trụ: bãi cát nhỏ + biển trắng.
 * Thế giới riêng mỗi vùng: cổng thành của tộc ở lối ra, làng/ruộng/hàng rào/cừu (người), vòm thường xuân/đèn/nấm (elf),
 * nhà phù thuỷ/pha lê (phù thuỷ), nhà tuyết/đường ray/xe quặng (người lùn), lều gai/xương/lửa (orc). */
(function () {
  if (!window.KR68) return;
  const K = ArtKit, TAU = Math.PI * 2, INK = '#3b2a1c';
  const PAL = {
    castle: { g: '#86bd3f', gl: '#9dcf4e', gd: '#68a032', tuft: '#4f8a2a', sand: '#ecc874', sandL: '#f6dc98', sandD: '#d3a454', line: '#9c6c30', dirt: '#b48a4c', stone: '#b9b4a6' },
    forest: { g: '#6fae3b', gl: '#8cc64b', gd: '#518d2c', tuft: '#3d7424', sand: '#e6c27a', sandL: '#f2d8a0', sandD: '#c99c58', line: '#8d6232', dirt: '#a48047', stone: '#b3ae9c' },
    chaos: { g: '#6a5e8c', gl: '#7f72a3', gd: '#4f4570', tuft: '#3f365e', sand: '#bfb2d3', sandL: '#d6cde4', sandD: '#9989b5', line: '#5b4c80', dirt: '#5c5080', stone: '#8d86a8' },
    ice: { g: '#e8f0f4', gl: '#ffffff', gd: '#c9d9e3', tuft: '#9fb8c6', sand: '#d2dfe7', sandL: '#eef4f8', sandD: '#aec2cf', line: '#73899b', dirt: '#b8c9d4', stone: '#9fb1bd' },
    lava: { g: '#6a4236', gl: '#7e5141', gd: '#4f2f27', tuft: '#3c231d', sand: '#c38a58', sandL: '#d6a06c', sandD: '#9d673c', line: '#5c3418', dirt: '#7d4a30', stone: '#7d6c66' },
    desert: { g: '#e2b66c', gl: '#efc888', gd: '#c99a52', tuft: '#9a8238', sand: '#f3dba8', sandL: '#fcecc8', sandD: '#d6b072', line: '#9a6e34', dirt: '#c8955a', stone: '#c9a77d' }
  };
  const pal = m => PAL[m.def.theme] || PAL.castle;
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; };
  const nearRoad = (m, x, y) => { let b = 1e9; for (const p of m.paths) b = Math.min(b, p.nearest(x, y).perp); return b; };
  const polysOf = m => { const q = {}; return m.paths.map(p => { const pts = []; for (let d = 0; d <= p.length; d += 4) { p.pointAt(Math.min(d, p.length), q); pts.push([q.x, q.y]); } p.pointAt(p.length, q); pts.push([q.x, q.y]); return pts; }); };
  const strokeAll = (g, polys, w, col) => { g.strokeStyle = col; g.lineWidth = w; g.lineJoin = 'round'; g.lineCap = 'round'; for (const pts of polys) { g.beginPath(); pts.forEach((v, i) => i ? g.lineTo(v[0], v[1]) : g.moveTo(v[0], v[1])); g.stroke(); } };
  const region = m => Math.min(5, Math.floor(m.index / 6));

  /* ---------- Cổng thành của tộc ở lối ra cho mọi màn ---------- */
  CONFIG.levels.forEach((L, i) => {
    if (i >= 36) return;
    const r = Math.floor(i / 6), gx = 680, ex = 606, old = L.feat.props.find(p => p.gate59);
    const ys = L.ipaths.map(path => path[path.length - 1][1]);
    const gy = old ? old.y : Math.max(150, Math.min(CONFIG.world.height - 80, ys.reduce((a, b) => a + b, 0) / ys.length));
    L.ipaths = L.ipaths.map(path => { const keep = path.filter(([x]) => x < ex - 20); return [...keep, [ex, gy], [gx, gy]]; });
    L.feat.props = L.feat.props.filter(p => !(p.k === 'castle' || p.gate59 || Math.hypot(p.x - gx, p.y - gy) < 120));
    L.feat.props.push({ k: 'castle', gate59: true, race: r < 5 ? r : 2, x: gx, y: gy, doorX: gx, doorY: gy, s: 1 });
    L.route = { ...L.route, exit: [gx, gy] };
  });

  /* ---------- Nền ---------- */
  function kTuft(p, x, y, s, col) { p.strokeStyle = col; p.lineWidth = 1.5 * s; p.lineCap = 'round'; p.beginPath(); p.moveTo(x - 2.6 * s, y); p.lineTo(x - 4 * s, y - 4.5 * s); p.moveTo(x, y); p.lineTo(x, y - 6 * s); p.moveTo(x + 2.6 * s, y); p.lineTo(x + 4.2 * s, y - 4.2 * s); p.stroke(); }
  function ground(m, res) {
    const P = pal(m), W = m.W, H = m.H, PW = CONFIG.pathWidth, c = mk(W * res, H * res), p = c.getContext('2d'), rnd = K.seeded(m.index * 977 + 31);
    p.scale(res, res); p.fillStyle = P.g; p.fillRect(0, 0, W, H);
    const blob = (x, y, r, col, a) => { const gr = p.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, K.alpha(col, a)); gr.addColorStop(1, K.alpha(col, 0)); p.fillStyle = gr; p.fillRect(x - r, y - r, 2 * r, 2 * r); };
    for (let i = 0; i < 22; i++) blob(rnd() * W, rnd() * H, 70 + rnd() * 120, rnd() < .5 ? P.gl : P.gd, .35);
    for (let i = 0; i < 260; i++) { const x = rnd() * W, y = rnd() * H; p.fillStyle = K.alpha(rnd() < .5 ? P.gl : P.gd, .22); p.beginPath(); p.ellipse(x, y, 6 + rnd() * 16, 2 + rnd() * 4, 0, 0, TAU); p.fill(); }
    const free = (x, y, r) => nearRoad(m, x, y) > PW / 2 + r && !MapArt.wetAt(m.feat, x, y, r);
    for (let i = 0; i < 80; i++) { const cx = rnd() * W, cy = rnd() * H; if (!free(cx, cy, 10)) continue; const n = 1 + (rnd() * 3 | 0); for (let j = 0; j < n; j++) { const x = cx + (rnd() - .5) * 22, y = cy + (rnd() - .5) * 9; if (free(x, y, 6)) kTuft(p, x, y, .8 + rnd() * .5, P.tuft); } }
    if (['castle', 'forest'].includes(m.def.theme)) for (let i = 0; i < 22; i++) { const cx = rnd() * W, cy = rnd() * H; if (!free(cx, cy, 14)) continue; const col = ['#ffffff', '#ffe066', '#ff9fc0'][(rnd() * 3) | 0]; for (let j = 0; j < 4; j++) { const x = cx + (rnd() - .5) * 18, y = cy + (rnd() - .5) * 8; p.fillStyle = col; p.beginPath(); p.arc(x, y, 1.4, 0, TAU); p.fill(); } }
    const vg = p.createRadialGradient(W / 2, H / 2, H * .45, W / 2, H / 2, W * .66); vg.addColorStop(0, K.alpha(P.gd, 0)); vg.addColorStop(1, K.alpha(P.gd, .5)); p.fillStyle = vg; p.fillRect(0, 0, W, H);
    return c;
  }

  /* ---------- Đường kiểu KR ---------- */
  function road(g, m) {
    const P = pal(m), PW = CONFIG.pathWidth, polys = polysOf(m), rnd = K.seeded(m.index * 131 + 7), q = {}, theme = m.def.theme;
    const bumps = []; for (const path of m.paths) for (let d = 5; d < path.length; d += 6) { path.pointAt(d, q); for (const s of [-1, 1]) if (rnd() < .5) bumps.push([q.x + q.nx * (PW / 2 - 1) * s, q.y + q.ny * (PW / 2 - 1) * s, 2 + rnd() * 3]); }
    const layer = (grow, col) => { g.fillStyle = col; for (const [x, y, r] of bumps) { g.beginPath(); g.arc(x, y, r + grow / 2, 0, TAU); g.fill(); } strokeAll(g, polys, PW + grow, col); };
    g.save();
    for (let k = 0; k < 5; k++) { g.globalAlpha = .09; strokeAll(g, polys, PW + 34 - k * 6, P.dirt); }   // quầng đất mòn
    g.globalAlpha = 1;
    layer(3, P.line);                      // nét nâu mảnh
    layer(0, P.sandD);                     // dải mép đậm
    strokeAll(g, polys, PW - 7, P.sand);   // mặt cát
    g.globalAlpha = .55; strokeAll(g, polys, PW * .55, P.sandL); g.globalAlpha = .45; strokeAll(g, polys, PW * .32, P.sandL); g.globalAlpha = 1;
    const inside = (x, y, pad) => nearRoad(m, x, y) < PW / 2 - pad;
    for (const path of m.paths) for (let d = 0; d < path.length; d += 6) { path.pointAt(d, q); const off = (rnd() - .5) * PW * .8, x = q.x + q.nx * off, y = q.y + q.ny * off; if (!inside(x, y, 5)) continue; g.fillStyle = K.alpha(P.sandD, .45); g.beginPath(); g.ellipse(x, y, 1 + rnd() * 2.4, .6 + rnd(), 0, 0, TAU); g.fill(); }
    if (!['lava', 'chaos'].includes(theme)) {
      const dark = K.shade(P.g, -.25), light = P.g;
      for (const path of m.paths) for (let d = 6; d < path.length; d += 7) {
        path.pointAt(d, q); for (const s of [-1, 1]) {
          if (rnd() < .45) continue; const px = q.x + q.nx * (PW / 2 + 1) * s, py = q.y + q.ny * (PW / 2 + 1) * s;
          if (m.paths.some(o => o.nearest(px, py).perp < PW / 2 - 2) || MapArt.wetAt(m.feat, px, py, 4)) continue;
          const z = .5 + rnd() * .4; g.fillStyle = dark; g.beginPath(); g.moveTo(px - 5 * z, py + 1); g.lineTo(px - 6 * z, py - 6 * z); g.lineTo(px - 2.5 * z, py - 2 * z); g.lineTo(px, py - 8 * z); g.lineTo(px + 2.5 * z, py - 2 * z); g.lineTo(px + 6 * z, py - 6 * z); g.lineTo(px + 5 * z, py + 1); g.closePath(); g.fill();
          g.fillStyle = light; g.beginPath(); g.moveTo(px - 3 * z, py); g.lineTo(px - 3.5 * z, py - 3.6 * z); g.lineTo(px - 1 * z, py - 1.4 * z); g.lineTo(px, py - 5.4 * z); g.lineTo(px + 1 * z, py - 1.4 * z); g.lineTo(px + 3.5 * z, py - 3.6 * z); g.lineTo(px + 3 * z, py); g.closePath(); g.fill();
        }
      }
    }
    g.restore(); return true;
  }

  /* ---------- Ô đặt trụ: bãi cát + biển trắng ---------- */
  const pads = new Map(), PADW = 96, PADH = 60, PZ = 3;
  function padArt(theme) {
    if (pads.has(theme)) return pads.get(theme);
    const P = PAL[theme] || PAL.castle, c = mk(PADW * PZ, PADH * PZ), g = c.getContext('2d'); g.scale(PZ, PZ); g.translate(PADW / 2, 42); g.lineJoin = g.lineCap = 'round';
    const r = K.seeded(theme.length * 13 + 1), blob = (rx, ry) => { g.beginPath(); for (let i = 0; i <= 20; i++) { const a = i / 20 * TAU, k = 1 + Math.sin(i * 2.7) * .05 + Math.cos(i * 1.3) * .04; g.lineTo(Math.cos(a) * rx * k, Math.sin(a) * ry * k); } g.closePath(); };
    g.fillStyle = K.alpha(P.dirt, .35); blob(36, 14.5); g.fill();
    g.fillStyle = P.line; blob(31, 12); g.fill();
    g.fillStyle = P.sandD; blob(29.5, 11); g.fill();
    g.fillStyle = P.sand; g.save(); g.translate(0, -.8); blob(26, 9); g.fill(); g.restore();
    g.fillStyle = K.alpha(P.sandL, .8); g.beginPath(); g.ellipse(-3, -2.5, 15, 4.2, 0, 0, TAU); g.fill();
    for (let i = 0; i < 9; i++) { g.fillStyle = K.alpha(P.sandD, .55); g.beginPath(); g.ellipse((r() - .5) * 40, (r() - .5) * 12, 1 + r() * 1.6, .7, 0, 0, TAU); g.fill(); }
    // biển trắng nhỏ
    g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -15); g.stroke();
    g.strokeStyle = '#a9773f'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(0, -.5); g.lineTo(0, -14.5); g.stroke();
    g.fillStyle = '#fbf6e8'; g.strokeStyle = INK; g.lineWidth = 1.4; g.beginPath(); g.moveTo(-7.5, -25); g.lineTo(7.5, -24); g.lineTo(7, -14.5); g.lineTo(-7, -15.5); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#6f6150'; g.beginPath(); g.moveTo(-3, -17); g.lineTo(-3, -21); g.lineTo(-1.8, -21); g.lineTo(-1.8, -22.2); g.lineTo(-.5, -22.2); g.lineTo(-.5, -21); g.lineTo(.6, -21); g.lineTo(.6, -22.2); g.lineTo(1.9, -22.2); g.lineTo(1.9, -21); g.lineTo(3, -21); g.lineTo(3, -17); g.closePath(); g.fill();
    pads.set(theme, c); return c;
  }
  Painter.plot = function (g, x, y, on, t) {
    const theme = (window.Game && Game.map && Game.map.def.theme) || 'castle';
    g.drawImage(padArt(theme), x - PADW / 2, y - 42, PADW, PADH);
    if (on) { g.save(); g.globalAlpha = .65 + Math.sin((t || 0) * 6) * .3; g.strokeStyle = '#ffe58a'; g.lineWidth = 3; g.beginPath(); g.ellipse(x, y, 34, 13, 0, 0, TAU); g.stroke(); g.restore(); }
  };

  /* ---------- Chi tiết vẽ tay theo thế giới ---------- */
  const ink = (g, w) => { g.strokeStyle = INK; g.lineWidth = w || 1.4; g.lineJoin = g.lineCap = 'round'; };
  const DRAW = {
    farm70(g, d) { const w = d.w, h = d.h; g.save(); g.translate(d.x, d.y); g.fillStyle = 'rgba(40,25,10,.25)'; g.beginPath(); g.roundRect(-w / 2 + 2, -h / 2 + 3, w, h, 6); g.fill(); g.fillStyle = '#a77b40'; ink(g, 1.6); g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, 6); g.fill(); g.stroke();
      g.save(); g.beginPath(); g.roundRect(-w / 2 + 2, -h / 2 + 2, w - 4, h - 4, 5); g.clip(); const rows = Math.max(3, Math.round(h / 7)); for (let i = 0; i < rows; i++) { const y = -h / 2 + 3 + i * (h - 6) / rows; g.fillStyle = d.crop === 'green' ? (i % 2 ? '#7db040' : '#94c64c') : (i % 2 ? '#e2b84a' : '#f0cf62'); g.beginPath(); g.roundRect(-w / 2 + 3, y, w - 6, (h - 6) / rows - 1.6, 2); g.fill(); g.strokeStyle = d.crop === 'green' ? '#5d8c2c' : '#c39432'; g.lineWidth = .8; for (let x = -w / 2 + 6; x < w / 2 - 4; x += 4) { g.beginPath(); g.moveTo(x, y + 1); g.lineTo(x + 1, y + (h - 6) / rows - 2.5); g.stroke(); } } g.restore(); g.restore(); },
    fence70(g, d) { const n = Math.max(2, Math.round(Math.hypot(d.x2 - d.x, d.y2 - d.y) / 9)); g.save(); for (const [col, w] of [[INK, 3.2], ['#a8763e', 1.6]]) { g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; for (const off of [-3.5, -7.5]) { g.beginPath(); g.moveTo(d.x, d.y + off); g.lineTo(d.x2, d.y2 + off); g.stroke(); } for (let i = 0; i <= n; i++) { const x = d.x + (d.x2 - d.x) * i / n, y = d.y + (d.y2 - d.y) * i / n; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - 10); g.stroke(); } } g.restore(); },
    hay70(g, d) { g.save(); g.translate(d.x, d.y); g.scale(d.s || 1, d.s || 1); g.fillStyle = 'rgba(40,25,10,.25)'; g.beginPath(); g.ellipse(1, 1, 12, 4, 0, 0, TAU); g.fill(); g.fillStyle = '#e7c158'; ink(g, 1.4); g.beginPath(); g.moveTo(-11, 0); g.quadraticCurveTo(-11, -15, 0, -16); g.quadraticCurveTo(11, -15, 11, 0); g.closePath(); g.fill(); g.stroke(); g.strokeStyle = '#c0963a'; g.lineWidth = .9; for (const x of [-6, -2, 2, 6]) { g.beginPath(); g.moveTo(x, -1); g.quadraticCurveTo(x * .8, -8, x * .4, -13); g.stroke(); } g.restore(); },
    sheep70(g, d) { g.save(); g.translate(d.x, d.y); g.scale(d.flip || 1, 1); g.fillStyle = 'rgba(40,25,10,.25)'; g.beginPath(); g.ellipse(0, 1, 7, 2.4, 0, 0, TAU); g.fill(); ink(g, 1.2); g.beginPath(); g.moveTo(-3, 0); g.lineTo(-3, -3); g.moveTo(2.5, 0); g.lineTo(2.5, -3); g.stroke(); g.fillStyle = '#ffffff'; g.beginPath(); for (const [x, y, r] of [[-3.5, -5, 3.2], [0, -6.4, 3.6], [3.4, -5, 3.1], [0, -4, 3.4]]) { g.moveTo(x + r, y); g.arc(x, y, r, 0, TAU); } g.fill(); g.stroke(); g.fillStyle = '#ffffff'; for (const [x, y, r] of [[-3.5, -5, 3.2], [0, -6.4, 3.6], [3.4, -5, 3.1], [0, -4, 3.4]]) { g.beginPath(); g.arc(x, y, r - .7, 0, TAU); g.fill(); } g.fillStyle = '#3a3330'; g.beginPath(); g.ellipse(6.4, -6, 2.3, 1.8, .3, 0, TAU); g.fill(); g.restore(); },
    mush70(g, d) { g.save(); g.translate(d.x, d.y); for (const [x, y, s] of [[0, 0, 1], [-6, 2, .7], [6, 1.5, .6]]) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = '#f2ead6'; ink(g, 1.2); g.beginPath(); g.roundRect(-1.8, -6, 3.6, 6, 1); g.fill(); g.stroke(); g.fillStyle = d.col || '#d8402c'; g.beginPath(); g.moveTo(-6.5, -5.5); g.quadraticCurveTo(0, -14, 6.5, -5.5); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#fff'; for (const [a, b] of [[-3, -8], [1, -10], [3.4, -7]]) { g.beginPath(); g.arc(a, b, .9, 0, TAU); g.fill(); } g.restore(); } g.restore(); },
    bloom70(g, d) { g.save(); g.translate(d.x, d.y); for (let i = 0; i < 6; i++) { const x = Math.cos(i * 2.4) * 8, y = Math.sin(i * 2.4) * 3; g.strokeStyle = '#3d7424'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - 5); g.stroke(); g.fillStyle = d.col || '#8fd8ff'; g.beginPath(); for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; g.ellipse(x + Math.cos(a) * 1.6, y - 6 + Math.sin(a) * 1.6, 1.3, 1.3, 0, 0, TAU); } g.fill(); g.fillStyle = '#fff6b0'; g.beginPath(); g.arc(x, y - 6, .9, 0, TAU); g.fill(); } g.restore(); },
    rails70(g, d) { g.save(); const dx = d.x2 - d.x, dy = d.y2 - d.y, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L; ink(g, 3.4); g.strokeStyle = '#6b4a2a'; for (let t = 0; t <= L; t += 7) { const x = d.x + dx * t / L, y = d.y + dy * t / L; g.strokeStyle = INK; g.lineWidth = 3.4; g.beginPath(); g.moveTo(x - nx * 6, y - ny * 6); g.lineTo(x + nx * 6, y + ny * 6); g.stroke(); g.strokeStyle = '#8a6036'; g.lineWidth = 2; g.stroke(); } for (const s of [-3.6, 3.6]) { g.strokeStyle = INK; g.lineWidth = 2.4; g.beginPath(); g.moveTo(d.x + nx * s, d.y + ny * s); g.lineTo(d.x2 + nx * s, d.y2 + ny * s); g.stroke(); g.strokeStyle = '#a9b3bb'; g.lineWidth = 1.1; g.stroke(); } g.restore(); },
    cart70(g, d) { g.save(); g.translate(d.x, d.y); g.fillStyle = 'rgba(30,20,10,.3)'; g.beginPath(); g.ellipse(0, 1, 12, 3.5, 0, 0, TAU); g.fill(); ink(g, 1.4); g.fillStyle = '#7a5434'; g.beginPath(); g.moveTo(-10, -12); g.lineTo(10, -12); g.lineTo(8, -2); g.lineTo(-8, -2); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#8b8f96'; for (const [x, y, r] of [[-5, -13, 3.2], [0, -15, 3.6], [5, -13, 3], [2, -12, 2.6]]) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.stroke(); } g.fillStyle = '#e8b94a'; g.beginPath(); g.arc(-1, -14, 1.2, 0, TAU); g.fill(); g.fillStyle = '#3a3a40'; for (const x of [-6, 6]) { g.beginPath(); g.arc(x, -1, 2.6, 0, TAU); g.fill(); g.stroke(); } g.restore(); },
    bones70(g, d) { g.save(); g.translate(d.x, d.y); g.fillStyle = '#efe6cf'; ink(g, 1.2); g.beginPath(); g.ellipse(0, -5, 5, 4.4, 0, 0, TAU); g.fill(); g.stroke(); g.beginPath(); g.roundRect(-2.6, -2.5, 5.2, 3.2, 1); g.fill(); g.stroke(); g.fillStyle = INK; g.beginPath(); g.arc(-1.8, -5.4, 1.1, 0, TAU); g.arc(1.8, -5.4, 1.1, 0, TAU); g.fill(); for (const s of [-1, 1]) { g.save(); g.translate(s * 9, -1); g.rotate(s * .5); g.fillStyle = '#efe6cf'; g.beginPath(); g.roundRect(-5, -1, 10, 2, 1); g.fill(); g.stroke(); g.restore(); } g.restore(); },
    spikes70(g, d) { const n = Math.max(2, Math.round(Math.abs(d.x2 - d.x) / 7)); g.save(); for (let i = 0; i <= n; i++) { const x = d.x + (d.x2 - d.x) * i / n, y = d.y + (d.y2 - d.y) * i / n; g.fillStyle = '#8a5a34'; ink(g, 1.3); g.beginPath(); g.moveTo(x - 2.4, y); g.lineTo(x - 2.4, y - 11); g.lineTo(x, y - 16 - (i % 2) * 3); g.lineTo(x + 2.4, y - 11); g.lineTo(x + 2.4, y); g.closePath(); g.fill(); g.stroke(); } g.strokeStyle = INK; g.lineWidth = 2.6; g.beginPath(); g.moveTo(d.x, d.y - 5); g.lineTo(d.x2, d.y2 - 5); g.stroke(); g.strokeStyle = '#6c4428'; g.lineWidth = 1.2; g.stroke(); g.restore(); },
    logs70(g, d) { g.save(); g.translate(d.x, d.y); for (const [x, y] of [[-5, 0], [5, 0], [0, -6]]) { g.fillStyle = '#9a6a3c'; ink(g, 1.3); g.beginPath(); g.roundRect(x - 9, y - 6, 18, 6, 3); g.fill(); g.stroke(); g.fillStyle = '#e2c08a'; g.beginPath(); g.ellipse(x + 9, y - 3, 2, 3, 0, 0, TAU); g.fill(); g.stroke(); } g.restore(); }
  };
  const oldProp = PaintedWorld.prop;
  PaintedWorld.prop = function (g, d, theme) { const f = DRAW[d.k]; if (f) { f(g, d); return true; } return oldProp.call(this, g, d, theme); };

  /* ---------- Bố cục thế giới ---------- */
  const FRAME = { castle: { big: ['tree', 'tree', 'pine'], small: ['bush', 'rock', 'bush', 'stump'] }, forest: { big: ['tree', 'tree', 'pine', 'tree'], small: ['bush', 'bush', 'rock', 'stump'] }, chaos: { big: ['tree', 'pine', 'tree'], small: ['bush', 'rock', 'stump'] }, ice: { big: ['snowpine', 'snowpine', 'tree'], small: ['rock', 'bush', 'rock'] }, lava: { big: ['deadtree', 'tree', 'pine'], small: ['rock', 'bush', 'stump'] }, desert: { big: ['palm', 'palm'], small: ['rock', 'cactus', 'drybush'] } };
  function decor(m) {
    const W = m.W, H = m.H, PW = CONFIG.pathWidth, theme = m.def.theme, R = region(m), rnd = K.seeded(m.index * 4111 + 9), fr = FRAME[theme] || FRAME.castle;
    const gate = m.feat.props.find(p => p.gate59);
    const out = m.feat.props.filter(p => p.gate59 || p.gate58).map(p => ({ ...p, prop: true }));
    const blocked = (x, y, rx, ry, tall) => {
      if (x - rx < -10 || x + rx > W + 10) return true;
      for (let a = -1; a <= 1; a++) for (let b = -1; b <= 0; b++) { if (nearRoad(m, x + a * rx, y + b * ry) < PW / 2 + 8) return true; }
      if (tall && (nearRoad(m, x, y - 40) < PW / 2 + 4 || nearRoad(m, x, y - 75) < PW / 2)) return true;
      if (MapArt.wetAt(m.feat, x, y, Math.max(rx, ry))) return true;
      if (m.spots.some(s => Math.abs(s.x - x) < 40 + rx && y > s.y - 100 - (tall ? 0 : ry) && y < s.y + 26 + (tall ? 90 : ry))) return true;
      if (gate && Math.abs(gate.x - x) < 78 + rx && y > gate.y - 150 && y < gate.y + 30 + (tall ? 80 : ry)) return true;
      return false;
    };
    const used = [];
    const taken = (x, y, rx, ry) => used.some(u => Math.abs(u.x - x) < u.rx + rx && Math.abs(u.y - y) < u.ry + ry);
    const put = (d, rx, ry, tall) => { if (blocked(d.x, d.y, rx, ry, tall) || taken(d.x, d.y, rx, ry)) return false; used.push({ x: d.x, y: d.y, rx, ry }); out.push({ s: 1, v: rnd(), flip: rnd() < .5 ? -1 : 1, ...d }); return true; };
    const pick = a => a[(rnd() * a.length) | 0];
    // 1) tìm bãi trống lớn cho cụm “thế giới”
    const sites = [];
    for (const [w, h] of [[200, 80], [160, 66], [120, 54], [90, 44]]) {
      const cand = []; for (let y = 96 + h / 2; y < H - 60 - h / 2; y += 12) for (let x = w / 2 + 50; x < W - w / 2 - 50; x += 14) cand.push([x, y, Math.hypot((x - W * .45) / W, (y - H * .5) / H) + rnd() * .08]); cand.sort((a, b) => a[2] - b[2]);
      for (const [x, y] of cand) {
        if (sites.some(s => Math.abs(s.x - x) < (s.w + w) / 2 + 30 && Math.abs(s.y - y) < (s.h + h) / 2 + 20)) continue;
        let ok = true; for (let a = -.5; a <= .5 && ok; a += .25) for (let b = -.5; b <= .5 && ok; b += .5) if (blocked(x + a * w, y + b * h, 8, 6, b < 0)) ok = false;
        if (ok) { sites.push({ x, y, w, h }); if (sites.length >= 4) break; }
      }
      if (sites.length >= 4) break;
    }
    // 2) dựng cụm theo tộc
    sites.forEach((s, k) => {
      const L = s.x - s.w / 2, T = s.y - s.h / 2, rr = (a, b) => a + rnd() * (b - a);
      const houses = () => { const n = s.w >= 150 ? 3 : s.w >= 110 ? 2 : 1; for (let i = 0; i < n; i++) put({ k: 'house', x: L + s.w * (i + .5) / n + rr(-6, 6), y: T + s.h * .45 + rr(-4, 4), s: rr(.62, .72) }, 22, 10, true); };
      if (R === 0) {
        if (k === 1 && s.w >= 110) { const fw = Math.min(90, s.w * .55), fh = Math.min(38, s.h * .6); out.push({ k: 'farm70', x: s.x - s.w * .12, y: s.y, w: fw, h: fh, crop: rnd() < .5 ? 'wheat' : 'green', prop: true }); used.push({ x: s.x - s.w * .12, y: s.y, rx: fw / 2, ry: fh / 2 }); out.push({ k: 'fence70', x: s.x - s.w * .12 - fw / 2, y: s.y + fh / 2 + 6, x2: s.x - s.w * .12 + fw / 2, y2: s.y + fh / 2 + 6, prop: true }); put({ k: 'hay70', x: s.x + s.w * .3, y: s.y + 4, s: 1 }, 10, 6); for (let i = 0; i < 3; i++) put({ k: 'sheep70', x: s.x + s.w * .25 + rr(-14, 14), y: s.y + rr(-10, 14) }, 6, 4); }
        else { houses(); put({ k: 'crate', x: L + 14, y: T + s.h * .85, s: .7 }, 10, 6); put({ k: 'lamp', x: L + s.w - 10, y: T + s.h * .9, s: .8 }, 5, 4, true); put({ k: 'hay70', x: L + s.w * .3, y: T + s.h * .98, s: .9 }, 10, 6); }
      } else if (R === 1) {
        if (k === 0) { put({ k: 'gateway', x: s.x, y: T + s.h * .6, s: .62 }, 28, 10, true); put({ k: 'lamp', x: s.x - 40, y: T + s.h * .8, s: .8 }, 5, 4, true); put({ k: 'lamp', x: s.x + 40, y: T + s.h * .8, s: .8 }, 5, 4, true); put({ k: 'bloom70', x: s.x - 20, y: T + s.h, col: '#8fd8ff' }, 10, 4); put({ k: 'bloom70', x: s.x + 22, y: T + s.h, col: '#f6a8ff' }, 10, 4); }
        else { put({ k: 'house', x: s.x, y: s.y, s: .66 }, 22, 10, true); put({ k: 'mush70', x: L + 14, y: T + s.h * .9 }, 10, 5); put({ k: 'mush70', x: L + s.w - 14, y: T + s.h * .8, col: '#e2a33a' }, 10, 5); put({ k: 'tree', x: L + 8, y: T + s.h * .5, s: .8 }, 18, 8, true); }
      } else if (R === 2 || R === 5) {
        houses(); put({ k: 'voidcrystal', x: L + 12, y: T + s.h * .95, s: .8 }, 10, 6); put({ k: 'lamp', x: L + s.w - 12, y: T + s.h * .9, s: .8 }, 5, 4, true); if (k === 0) put({ k: 'gateway', x: s.x + s.w * .3, y: T + s.h, s: .5 }, 22, 8, true);
      } else if (R === 3) {
        if (k === 0) { const y = T + s.h * .75; out.push({ k: 'rails70', x: L + 6, y, x2: L + s.w - 6, y2: y + rr(-6, 6), prop: true }); used.push({ x: s.x, y, rx: s.w / 2, ry: 8 }); put({ k: 'cart70', x: s.x + rr(-20, 20), y: y + 2 }, 12, 6); put({ k: 'house', x: s.x - s.w * .25, y: T + s.h * .35, s: .62 }, 22, 10, true); put({ k: 'crate', x: s.x + s.w * .25, y: T + s.h * .4, s: .7 }, 10, 6); }
        else { houses(); put({ k: 'lamp', x: L + 10, y: T + s.h * .9, s: .8 }, 5, 4, true); put({ k: 'logs70', x: L + s.w - 16, y: T + s.h * .95 }, 12, 6); }
      } else if (R === 4) {
        houses(); out.push({ k: 'spikes70', x: L + 4, y: T + s.h + 4, x2: L + s.w * .45, y2: T + s.h + 4, prop: true }); put({ k: 'bones70', x: L + s.w * .7, y: T + s.h * .95 }, 10, 5); put({ k: 'lamp', x: L + s.w - 8, y: T + s.h * .85, s: .8 }, 5, 4, true); put({ k: 'bones70', x: L + 14, y: T + s.h * .2 }, 10, 5);
      }
    });
    for (const s of sites) used.push({ x: s.x, y: s.y + s.h * .5 + 30, rx: s.w / 2 + 12, ry: s.h / 2 + 46 });
    // 3) khung cây ở mép (đều hơn, có khoảng thở)
    for (let i = 0; i < 700; i++) {
      const r = rnd(); let x, y;
      if (r < .4) { x = rnd() * W; y = 16 + rnd() * 46; } else if (r < .75) { x = rnd() * W; y = H - 22 + rnd() * 36; } else if (r < .88) { x = rnd() * 44; y = 60 + rnd() * (H - 60); } else { x = W - rnd() * 44; y = 60 + rnd() * (H - 60); }
      const tall = rnd() < .58; put({ k: tall ? pick(fr.big) : pick(fr.small), x, y, s: (tall ? .74 : .78) + rnd() * .22 }, tall ? 15 : 9, tall ? 7 : 4, tall);
    }
    // 4) điểm xuyết nhỏ giữa bãi cỏ + ven đường
    const q = {};
    for (const path of m.paths) for (let d = 30; d < path.length; d += 46) { path.pointAt(d, q); const s = rnd() < .5 ? -1 : 1, off = PW / 2 + 16 + rnd() * 14; const x = q.x + q.nx * off * s, y = q.y + q.ny * off * s; if (rnd() < .45) put({ k: R === 1 ? 'mush70' : rnd() < .5 ? 'rock' : 'bush', x, y, s: .6 + rnd() * .15 }, 9, 5); }
    return out.sort((a, b) => a.y - b.y);
  }

  /* ---------- Gắn vào bộ dựng ---------- */
  const oldTex = PaintedWorld.texture, oldRender = MapArt.render, gcache = new Map(); let cur = null, curRes = 1;
  PaintedWorld.texture = function (g, theme, n, size) {
    if (cur && n === 0) { const key = cur.index + '|' + curRes + '|' + cur.W; let c = gcache.get(key); if (!c) { c = ground(cur, curRes); gcache.set(key, c); if (gcache.size > 3) gcache.delete(gcache.keys().next().value); } const p = g.createPattern(c, 'no-repeat'); p.setTransform(new DOMMatrix().scale(1 / curRes)); return p; }
    return oldTex.apply(this, arguments);
  };
  MapArt.render = function (m, res) { const pc = cur, pr = curRes; cur = m; curRes = res; try { return oldRender.call(this, m, res); } finally { cur = pc; curRes = pr; } };
  KR68.road = road;
  const build = Level.build;
  Level.build = function (i) { const m = build.call(this, i); m.decor = decor(m); return m; };
  window.World70 = { PAL, decor, road, ground, version: 70 };
})();
