/* Bộ dựng màn thiết kế tay cho Vương Quốc Người (6 map nối cốt truyện).
 * Mỗi map khai báo dữ liệu tách nhóm: terrain (biển/đất/vách/sông/hồ/thác), route (waypoint gameplay),
 * spots (ô xây trụ), props (công trình & vật thể), story/win/lose. Bộ vẽ dựng nền theo lớp:
 * nước → vách đá → đất & bãi cát → sông/hồ/thác → đường (cát/đá lát) → cầu (tự sinh ở chỗ đường cắt sông) & cầu tàu
 * → công trình & vật thể (theo chiều sâu) → mây → ánh sáng. Phong cách: tường trắng/đá, mái ngói xanh như tranh vùng. */
(function () {
  const K = ArtKit, TAU = Math.PI * 2, INK = '#33261a';
  const C = { wall: '#efe7d6', wallS: '#cfc3aa', stone: '#bdb5a5', stoneD: '#948b7b', roof: '#3d6fc8', roofD: '#2a4f98', roofL: '#6b97e6', wood: '#8a5a34', woodL: '#b07e4c', timber: '#6b4426' };
  const MAPS = {};
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; };
  const ink = (g, w) => { g.strokeStyle = INK; g.lineWidth = w || 1.4; g.lineJoin = g.lineCap = 'round'; };
  const shadow = (g, x, y, rx, ry, a) => { g.fillStyle = `rgba(30,20,10,${a || .28})`; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU); g.fill(); };
  const pat = (g, theme, n, size, res, rot) => { const p = window.Terrain69 && Terrain69.pattern(g, theme, n, size, res); if (p && rot) p.setTransform(new DOMMatrix().rotate(rot).scale(1 / res)); return p; };
  const shade = (c, k) => K.shade(c, k);
  const smoothPoly = (g, pts, closed) => { g.beginPath(); const n = pts.length; if (closed) { const a = pts[n - 1], b = pts[0]; g.moveTo((a[0] + b[0]) / 2, (a[1] + b[1]) / 2); for (let i = 0; i < n; i++) { const p = pts[i], q = pts[(i + 1) % n]; g.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2); } g.closePath(); } else { g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < n - 1; i++) { const p = pts[i], q = pts[i + 1]; g.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2); } g.lineTo(pts[n - 1][0], pts[n - 1][1]); } };
  const segDist = (px, py, ax, ay, bx, by) => { const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy || 1, t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / L)); return Math.hypot(px - ax - dx * t, py - ay - dy * t); };
  const polyDist = (pts, x, y) => { let b = 1e9; for (let i = 0; i < pts.length - 1; i++) b = Math.min(b, segDist(x, y, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1])); return b; };
  const inPoly = (pts, x, y) => { let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
  // nước: ngoài đất liền (nếu có biển), sông, hồ
  function wet(def, x, y, r = 0) {
    const T = def.terrain;
    if (T.land && !inPoly(T.land, x, y)) return true;
    if (T.land && r) for (const [a, b] of [[r, 0], [-r, 0], [0, r], [0, -r]]) if (!inPoly(T.land, x + a, y + b)) return true;
    for (const rv of T.rivers || []) if (polyDist(rv.pts, x, y) < rv.w / 2 + r) return true;
    for (const l of T.lakes || []) if (((x - l.x) / (l.rx + r)) ** 2 + ((y - l.y) / (l.ry + r)) ** 2 < 1) return true;
    return false;
  }

  /* ================= THƯ VIỆN CÔNG TRÌNH (tường trắng – mái xanh) ================= */
  const env = (g, n, x, y, h, flip) => PaintedWorld.blit(g, 'env-castle', n, x, y + 2, h, flip);
  function roofTiles(g, x0, y0, x1, y1, rows) { g.strokeStyle = C.roofD; g.lineWidth = .9; for (let k = 1; k < rows; k++) { const t = k / rows; g.beginPath(); g.moveTo(x0[0] + (x1[0] - x0[0]) * t, x0[1] + (x1[1] - x0[1]) * t); g.lineTo(y0[0] + (y1[0] - y0[0]) * t, y0[1] + (y1[1] - y0[1]) * t); g.stroke(); } }
  const D = {
    // —— sprite vẽ tay sẵn có (hàng lâu đài) ——
    bhouse(g, d) { env(g, 7, d.x, d.y, 80 * (d.s || .62), (d.flip || 1) < 0); },
    keep(g, d) { env(g, 9, d.x, d.y, 150 * (d.s || .6), false); },
    arch(g, d) { env(g, d.big ? 8 : 6, d.x, d.y, (d.big ? 95 : 55) * (d.s || .7), (d.flip || 1) < 0); },
    crates(g, d) { env(g, 10, d.x, d.y, 30 * (d.s || .8), (d.flip || 1) < 0); },
    lamp(g, d) { env(g, 11, d.x, d.y, 42 * (d.s || .75), (d.flip || 1) < 0); },
    tree(g, d) { env(g, d.v === 1 ? 1 : 0, d.x, d.y, 94 * (d.s || .72), (d.flip || 1) < 0); },
    pine(g, d) { env(g, 2, d.x, d.y, 99 * (d.s || .72), (d.flip || 1) < 0); },
    bush(g, d) { env(g, 3, d.x, d.y, 33 * (d.s || .8), (d.flip || 1) < 0); },
    rock(g, d) { env(g, 4, d.x, d.y, 35 * (d.s || .8), (d.flip || 1) < 0); },
    stump(g, d) { env(g, 5, d.x, d.y, 27 * (d.s || .8), (d.flip || 1) < 0); },
    humangate(g, d) { const sh = PaintedWorld.sheets.buildings58; if (!sh?.loaded) return; const f = sh.frames[0], h = d.h || 150, z = h / f.h; g.drawImage(sh.img, f.x, f.y, f.w, f.h, d.x - .5 * f.w * z, d.y - .9 * h, f.w * z, h); },
    // —— nhà lớn: tường trắng khung gỗ, chân đá, mái ngói xanh ——
    hall(g, d) {
      const w = d.w || 70, h = d.h || 36, dep = d.d || 26, rh = h * .66; g.save(); g.translate(d.x, d.y);
      g.fillStyle = 'rgba(30,20,10,.28)'; g.beginPath(); g.moveTo(-w / 2 - 2, 2); g.lineTo(w / 2 + dep * .7, 2); g.lineTo(w / 2 + dep * .7 + 8, -dep * .45); g.lineTo(-w / 2 + 6, -4); g.closePath(); g.fill();
      ink(g, 1.6); g.fillStyle = C.wallS; g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2 + dep * .6, -dep * .5); g.lineTo(w / 2 + dep * .6, -dep * .5 - h); g.lineTo(w / 2, -h); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = C.stoneD; g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2 + dep * .6, -dep * .5); g.lineTo(w / 2 + dep * .6, -dep * .5 - h * .26); g.lineTo(w / 2, -h * .26); g.closePath(); g.fill(); g.stroke();
      const gw = g.createLinearGradient(0, -h, 0, 0); gw.addColorStop(0, '#f8f2e4'); gw.addColorStop(1, C.wall); g.fillStyle = gw; g.fillRect(-w / 2, -h, w, h);
      g.fillStyle = C.stone; g.fillRect(-w / 2, -h * .26, w, h * .26); g.strokeStyle = C.stoneD; g.lineWidth = .8; for (let x = -w / 2; x < w / 2; x += 7) g.strokeRect(x, -h * .26, 7, h * .13), g.strokeRect(x + 3.5, -h * .13, 7, h * .13);
      g.strokeStyle = C.timber; g.lineWidth = 2; for (const x of [-w / 2 + 2, -w / 6, w / 6, w / 2 - 2]) { g.beginPath(); g.moveTo(x, -h * .26); g.lineTo(x, -h); g.stroke(); } g.beginPath(); g.moveTo(-w / 2, -h * .62); g.lineTo(w / 2, -h * .62); g.stroke();
      ink(g, 1.6); g.strokeRect(-w / 2, -h, w, h);
      if (!d.noDoor) { const dw = Math.min(18, w * .26); g.fillStyle = '#6a4326'; g.beginPath(); g.moveTo(-dw / 2, 0); g.lineTo(-dw / 2, -h * .5); g.quadraticCurveTo(0, -h * .66, dw / 2, -h * .5); g.lineTo(dw / 2, 0); g.closePath(); g.fill(); g.stroke(); g.strokeStyle = '#3b2616'; g.lineWidth = 1; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -h * .56); g.stroke(); }
      g.fillStyle = '#ffe9a6'; ink(g, 1.1); for (const x of [-w * .33, w * .33]) { g.beginPath(); g.rect(x - 4, -h * .86, 8, 8); g.fill(); g.stroke(); g.beginPath(); g.moveTo(x, -h * .86); g.lineTo(x, -h * .86 + 8); g.moveTo(x - 4, -h * .86 + 4); g.lineTo(x + 4, -h * .86 + 4); g.stroke(); }
      ink(g, 1.7); g.fillStyle = C.roofD; g.beginPath(); g.moveTo(w / 2 + 3, -h); g.lineTo(w / 2 + dep * .6 + 3, -dep * .5 - h); g.lineTo(w / 2 + dep * .6 - 2, -dep * .5 - h - rh); g.lineTo(w / 2 - 2, -h - rh); g.closePath(); g.fill(); g.stroke();
      const gr = g.createLinearGradient(0, -h - rh, 0, -h); gr.addColorStop(0, C.roofL); gr.addColorStop(1, C.roof); g.fillStyle = gr; g.beginPath(); g.moveTo(-w / 2 - 5, -h + 2); g.lineTo(w / 2 + 5, -h + 2); g.lineTo(w / 2 - 2, -h - rh); g.lineTo(-w / 2 + 2, -h - rh); g.closePath(); g.fill(); g.stroke();
      roofTiles(g, [-w / 2 - 5, -h + 2], [w / 2 + 5, -h + 2], [-w / 2 + 2, -h - rh], [w / 2 - 2, -h - rh], 4);
      g.strokeStyle = C.roofD; g.lineWidth = .8; for (let x = -w / 2; x < w / 2; x += 6) { g.beginPath(); g.moveTo(x, -h + 2); g.lineTo(x + 2, -h - rh); g.stroke(); }
      ink(g, 2.2); g.beginPath(); g.moveTo(-w / 2 + 2, -h - rh); g.lineTo(w / 2 - 2, -h - rh); g.lineTo(w / 2 + dep * .6 - 2, -dep * .5 - h - rh); g.stroke();
      if (d.chimney !== false) { ink(g, 1.4); g.fillStyle = C.stone; g.fillRect(w * .2, -h - rh - 6, 7, 14); g.strokeRect(w * .2, -h - rh - 6, 7, 14); }
      if (d.wheel) { g.save(); g.translate(-w / 2 - 6, -h * .3); ink(g, 1.6); g.fillStyle = C.woodL; g.beginPath(); g.arc(0, 0, 13, 0, TAU); g.fill(); g.stroke(); g.strokeStyle = C.timber; g.lineWidth = 1.6; for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * 13, Math.sin(a) * 13); g.stroke(); } g.fillStyle = 'rgba(220,245,255,.8)'; g.beginPath(); g.ellipse(-2, 13, 10, 3, 0, 0, TAU); g.fill(); g.restore(); }
      g.restore();
    },
    // —— tháp tròn đá, mái nón xanh, cờ ——
    tower(g, d) {
      const r = d.r || 13, h = d.h || 52, s = d.s || 1; g.save(); g.translate(d.x, d.y); g.scale(s, s); shadow(g, 3, 1, r + 8, 5);
      const gr = g.createLinearGradient(-r, 0, r, 0); gr.addColorStop(0, '#d9d0bd'); gr.addColorStop(.45, '#f3ecdc'); gr.addColorStop(1, '#a9a08e'); ink(g, 1.6); g.fillStyle = gr;
      g.beginPath(); g.moveTo(-r, 0); g.lineTo(-r, -h); g.lineTo(r, -h); g.lineTo(r, 0); g.ellipse(0, 0, r, r * .35, 0, 0, Math.PI); g.closePath(); g.fill(); g.stroke();
      g.strokeStyle = 'rgba(120,110,95,.6)'; g.lineWidth = .8; for (let y = -8; y > -h; y -= 8) { g.beginPath(); g.ellipse(0, y, r, r * .35, 0, .2, Math.PI - .2); g.stroke(); }
      g.fillStyle = '#3a3040'; for (const y of [-h * .45, -h * .75]) { g.beginPath(); g.roundRect(-2.2, y - 5, 4.4, 8, 2); g.fill(); }
      ink(g, 1.5); g.fillStyle = '#e4dccb'; for (let k = -2; k <= 2; k++) { g.beginPath(); g.rect(k * r * .42 - 2.6, -h - 6, 5.2, 6); g.fill(); g.stroke(); }
      const rg = g.createLinearGradient(-r, 0, r, 0); rg.addColorStop(0, C.roof); rg.addColorStop(.4, C.roofL); rg.addColorStop(1, C.roofD); g.fillStyle = rg; ink(g, 1.7);
      g.beginPath(); g.moveTo(-r - 4, -h - 4); g.lineTo(0, -h - r * 2.6); g.lineTo(r + 4, -h - 4); g.quadraticCurveTo(0, -h + 1, -r - 4, -h - 4); g.fill(); g.stroke();
      g.strokeStyle = C.roofD; g.lineWidth = .8; for (const k of [-.5, 0, .5]) { g.beginPath(); g.moveTo(k * r * 1.6, -h - 3); g.lineTo(0, -h - r * 2.5); g.stroke(); }
      ink(g, 1.6); g.beginPath(); g.moveTo(0, -h - r * 2.6); g.lineTo(0, -h - r * 2.6 - 12); g.stroke(); g.fillStyle = '#f1cf5a'; g.beginPath(); g.arc(0, -h - r * 2.6, 1.8, 0, TAU); g.fill(); ink(g, 1.1); g.fillStyle = '#2f5fb8'; g.beginPath(); g.moveTo(0, -h - r * 2.6 - 12); g.quadraticCurveTo(7, -h - r * 2.6 - 14, 13, -h - r * 2.6 - 10); g.lineTo(0, -h - r * 2.6 - 6); g.closePath(); g.fill(); g.stroke();
      g.restore();
    },
    // —— hải đăng ——
    lighthouse(g, d) {
      g.save(); g.translate(d.x, d.y); shadow(g, 2, 1, 16, 5); ink(g, 1.6);
      for (let i = 0; i < 4; i++) { const y0 = -i * 15, w0 = 11 - i * 1.4, w1 = 11 - (i + 1) * 1.4; g.fillStyle = i % 2 ? '#2f5fb8' : '#f3ecdc'; g.beginPath(); g.moveTo(-w0, y0); g.lineTo(-w1, y0 - 15); g.lineTo(w1, y0 - 15); g.lineTo(w0, y0); g.closePath(); g.fill(); g.stroke(); }
      g.fillStyle = '#5a5248'; g.fillRect(-8, -64, 16, 3); g.strokeRect(-8, -64, 16, 3);
      g.fillStyle = 'rgba(255,230,140,.35)'; g.beginPath(); g.arc(0, -71, 13, 0, TAU); g.fill(); g.fillStyle = '#ffe48a'; g.beginPath(); g.rect(-5, -76, 10, 12); g.fill(); g.stroke();
      g.fillStyle = C.roof; g.beginPath(); g.moveTo(-8, -76); g.lineTo(0, -88); g.lineTo(8, -76); g.closePath(); g.fill(); g.stroke(); g.restore();
    },
    // —— cối xay gió ——
    windmill(g, d) {
      const s = d.s || 1; g.save(); g.translate(d.x, d.y); g.scale(s, s); shadow(g, 3, 1, 20, 6); ink(g, 1.6);
      const gr = g.createLinearGradient(-14, 0, 14, 0); gr.addColorStop(0, '#d9d0bd'); gr.addColorStop(.5, '#f6f0e2'); gr.addColorStop(1, '#ada392'); g.fillStyle = gr;
      g.beginPath(); g.moveTo(-15, 0); g.lineTo(-10, -50); g.lineTo(10, -50); g.lineTo(15, 0); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = '#6a4326'; g.beginPath(); g.moveTo(-5, 0); g.lineTo(-5, -12); g.quadraticCurveTo(0, -17, 5, -12); g.lineTo(5, 0); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = '#ffe9a6'; g.beginPath(); g.rect(-3, -34, 6, 7); g.fill(); g.stroke();
      g.fillStyle = C.roof; g.beginPath(); g.moveTo(-14, -48); g.quadraticCurveTo(0, -72, 14, -48); g.closePath(); g.fill(); g.stroke();
      g.save(); g.translate(0, -50); g.rotate(d.rot || .4); for (let k = 0; k < 4; k++) { g.rotate(Math.PI / 2); ink(g, 2.2); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -36); g.stroke(); g.strokeStyle = C.woodL; g.lineWidth = 1.2; g.stroke(); ink(g, 1); g.fillStyle = '#f2e8cf'; g.beginPath(); g.rect(1.5, -35, 8, 26); g.fill(); g.stroke(); g.strokeStyle = '#b9a67c'; for (let y = -30; y < -10; y += 5) { g.beginPath(); g.moveTo(1.5, y); g.lineTo(9.5, y); g.stroke(); } }
      ink(g, 1.2); g.fillStyle = C.timber; g.beginPath(); g.arc(0, 0, 3, 0, TAU); g.fill(); g.stroke(); g.restore(); g.restore();
    },
    // —— tường thành có lỗ châu mai ——
    wall(g, d) {
      const h = d.h || 26, L = Math.hypot(d.x2 - d.x, d.y2 - d.y), n = Math.max(2, Math.round(L / 9)); g.save();
      const pts = []; for (let i = 0; i <= n; i++) pts.push([d.x + (d.x2 - d.x) * i / n, d.y + (d.y2 - d.y) * i / n]);
      g.fillStyle = 'rgba(30,20,10,.25)'; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y + 4) : g.moveTo(x, y + 4)); g.lineTo(d.x2, d.y2 - 2); g.lineTo(d.x, d.y - 2); g.fill();
      const gr = g.createLinearGradient(0, d.y - h, 0, d.y); gr.addColorStop(0, '#ece4d2'); gr.addColorStop(1, '#bfb5a0'); g.fillStyle = gr; ink(g, 1.6);
      g.beginPath(); g.moveTo(d.x, d.y); g.lineTo(d.x2, d.y2); g.lineTo(d.x2, d.y2 - h); g.lineTo(d.x, d.y - h); g.closePath(); g.fill(); g.stroke();
      g.strokeStyle = 'rgba(120,110,95,.55)'; g.lineWidth = .8; for (let r = 1; r < 4; r++) { const t = r / 4; g.beginPath(); g.moveTo(d.x, d.y - h * t); g.lineTo(d.x2, d.y2 - h * t); g.stroke(); }
      ink(g, 1.3); g.fillStyle = '#e4dccb'; for (let i = 0; i < n; i += 2) { const [x, y] = pts[i]; g.beginPath(); g.rect(x - 3, y - h - 6, 6, 6); g.fill(); g.stroke(); }
      g.fillStyle = '#e8e0cc'; g.beginPath(); g.moveTo(d.x, d.y - h); g.lineTo(d.x2, d.y2 - h); g.lineTo(d.x2 + 3, d.y2 - h - 3); g.lineTo(d.x + 3, d.y - h - 3); g.closePath(); g.fill(); g.stroke();
      if (d.banners) { for (let i = 2; i < n; i += 5) { const [x, y] = pts[i]; ink(g, 1.1); g.fillStyle = '#2f5fb8'; g.beginPath(); g.moveTo(x - 4, y - h + 2); g.lineTo(x + 4, y - h + 2); g.lineTo(x + 4, y - h * .35); g.lineTo(x, y - h * .45); g.lineTo(x - 4, y - h * .35); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#f1cf5a'; g.beginPath(); g.arc(x, y - h * .7, 1.6, 0, TAU); g.fill(); } }
      g.restore();
    },
    fountain(g, d) { g.save(); g.translate(d.x, d.y); shadow(g, 0, 2, 24, 8); ink(g, 1.6); g.fillStyle = C.stone; g.beginPath(); g.ellipse(0, -4, 22, 8, 0, 0, TAU); g.fill(); g.stroke(); g.fillRect(-22, -4, 44, 5); g.beginPath(); g.ellipse(0, 1, 22, 8, 0, 0, Math.PI); g.stroke(); g.fillStyle = '#5fc2e0'; g.beginPath(); g.ellipse(0, -4, 18, 6, 0, 0, TAU); g.fill(); g.fillStyle = C.stone; g.beginPath(); g.rect(-3, -22, 6, 18); g.fill(); g.stroke(); g.beginPath(); g.ellipse(0, -22, 8, 3, 0, 0, TAU); g.fill(); g.stroke(); g.strokeStyle = 'rgba(220,250,255,.95)'; g.lineWidth = 1.6; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(0, -26); g.quadraticCurveTo(s * 10, -32, s * 13, -8); g.stroke(); } g.fillStyle = 'rgba(255,255,255,.8)'; g.beginPath(); g.ellipse(0, -5, 8, 2, 0, 0, TAU); g.fill(); g.restore(); },
    stall(g, d) { g.save(); g.translate(d.x, d.y); g.scale(d.flip || 1, 1); shadow(g, 0, 1, 16, 4); ink(g, 1.4); g.fillStyle = C.woodL; g.beginPath(); g.rect(-13, -10, 26, 10); g.fill(); g.stroke(); for (const [x, c] of [[-8, '#e8483a'], [-2, '#f0c040'], [4, '#7dbb45'], [9, '#e88a3a']]) { g.fillStyle = c; g.beginPath(); g.arc(x, -11, 2.4, 0, TAU); g.fill(); } g.strokeStyle = INK; g.lineWidth = 2; for (const x of [-13, 13]) { g.beginPath(); g.moveTo(x, -10); g.lineTo(x, -26); g.stroke(); } for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? '#f3ecdc' : (d.col || '#3d6fc8'); g.beginPath(); g.moveTo(-15 + i * 5, -30); g.lineTo(-10 + i * 5, -30); g.lineTo(-10 + i * 5, -22); g.quadraticCurveTo(-12.5 + i * 5, -19, -15 + i * 5, -22); g.closePath(); g.fill(); } ink(g, 1.3); g.beginPath(); g.rect(-15, -30, 30, 8); g.stroke(); g.restore(); },
    tent(g, d) { g.save(); g.translate(d.x, d.y); g.scale(d.s || 1, d.s || 1); shadow(g, 2, 1, 20, 5); ink(g, 1.5); g.fillStyle = '#dcd2bb'; g.beginPath(); g.moveTo(-18, 0); g.lineTo(0, -28); g.lineTo(18, 0); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#2f5fb8'; g.beginPath(); g.moveTo(-18, 0); g.lineTo(-9, -14); g.lineTo(0, -28); g.lineTo(-4, 0); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#5a4430'; g.beginPath(); g.moveTo(-2, 0); g.lineTo(2, -14); g.lineTo(7, 0); g.closePath(); g.fill(); g.stroke(); ink(g, 1.4); g.beginPath(); g.moveTo(0, -28); g.lineTo(0, -36); g.stroke(); g.fillStyle = '#2f5fb8'; g.beginPath(); g.moveTo(0, -36); g.lineTo(7, -34); g.lineTo(0, -32); g.fill(); g.restore(); },
    campfire(g, d) { g.save(); g.translate(d.x, d.y); ink(g, 1.3); g.fillStyle = C.stoneD; for (let k = 0; k < 7; k++) { const a = k / 7 * TAU; g.beginPath(); g.ellipse(Math.cos(a) * 7, Math.sin(a) * 3, 2.4, 1.6, 0, 0, TAU); g.fill(); g.stroke(); } g.fillStyle = 'rgba(255,170,60,.35)'; g.beginPath(); g.arc(0, -4, 10, 0, TAU); g.fill(); g.fillStyle = '#ff8a2a'; g.beginPath(); g.moveTo(-4, 0); g.quadraticCurveTo(-5, -8, 0, -13); g.quadraticCurveTo(5, -8, 4, 0); g.closePath(); g.fill(); g.fillStyle = '#ffe066'; g.beginPath(); g.moveTo(-2, 0); g.quadraticCurveTo(-2, -5, 0, -8); g.quadraticCurveTo(2, -5, 2, 0); g.closePath(); g.fill(); g.restore(); },
    barricade(g, d) { g.save(); g.translate(d.x, d.y); g.scale(d.flip || 1, 1); shadow(g, 0, 1, 18, 4); for (let i = -2; i <= 2; i++) { g.save(); g.translate(i * 7, 0); g.rotate(-.5); ink(g, 1.3); g.fillStyle = '#9a6a3c'; g.beginPath(); g.moveTo(-2, 0); g.lineTo(-2, -18); g.lineTo(0, -22); g.lineTo(2, -18); g.lineTo(2, 0); g.closePath(); g.fill(); g.stroke(); g.restore(); } ink(g, 2.4); g.beginPath(); g.moveTo(-17, -6); g.lineTo(17, -6); g.stroke(); g.strokeStyle = C.woodL; g.lineWidth = 1.2; g.stroke(); g.restore(); },
    scarecrow(g, d) { g.save(); g.translate(d.x, d.y); ink(g, 2.2); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -26); g.moveTo(-10, -18); g.lineTo(10, -18); g.stroke(); g.strokeStyle = C.woodL; g.lineWidth = 1.2; g.stroke(); ink(g, 1.2); g.fillStyle = '#c0453a'; g.beginPath(); g.rect(-6, -20, 12, 10); g.fill(); g.stroke(); g.fillStyle = '#e7c27a'; g.beginPath(); g.arc(0, -24, 4, 0, TAU); g.fill(); g.stroke(); g.fillStyle = '#7a5230'; g.beginPath(); g.moveTo(-7, -26); g.lineTo(7, -26); g.lineTo(2, -32); g.lineTo(-2, -32); g.closePath(); g.fill(); g.stroke(); g.restore(); },
    statue(g, d) { g.save(); g.translate(d.x, d.y); shadow(g, 0, 1, 12, 4); ink(g, 1.5); g.fillStyle = C.stone; g.beginPath(); g.rect(-9, -12, 18, 12); g.fill(); g.stroke(); g.fillStyle = '#c9c2b2'; g.beginPath(); g.moveTo(-5, -12); g.lineTo(-4, -30); g.lineTo(4, -30); g.lineTo(5, -12); g.closePath(); g.fill(); g.stroke(); g.beginPath(); g.arc(0, -33, 4, 0, TAU); g.fill(); g.stroke(); g.beginPath(); g.moveTo(5, -28); g.lineTo(9, -42); g.stroke(); g.fillStyle = '#9fb8d8'; g.beginPath(); g.ellipse(-6, -21, 3.5, 6, 0, 0, TAU); g.fill(); g.stroke(); g.restore(); },
    ship(g, d) {
      const s = d.s || 1, enemy = d.kind === 'enemy'; g.save(); g.translate(d.x, d.y); g.scale(s * (d.flip || 1), s);
      g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 2.4; g.beginPath(); g.ellipse(0, -2, 64, 7, 0, 0, Math.PI); g.stroke(); shadow(g, 0, -2, 60, 8, .22);
      const hull = enemy ? '#3d3140' : '#8a5a34', trim = enemy ? '#9c2a2a' : '#c9a15a';
      ink(g, 2); g.fillStyle = hull; g.beginPath(); g.moveTo(-58, -26); g.lineTo(52, -26); g.quadraticCurveTo(70, -30, 76, -40); g.lineTo(62, -6); g.quadraticCurveTo(0, 6, -50, -4); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = shade(hull, .18); g.beginPath(); g.moveTo(-56, -26); g.lineTo(52, -26); g.lineTo(50, -20); g.lineTo(-55, -20); g.closePath(); g.fill();
      g.strokeStyle = trim; g.lineWidth = 2.4; g.beginPath(); g.moveTo(-54, -16); g.quadraticCurveTo(0, -12, 64, -18); g.stroke();
      g.fillStyle = enemy ? '#2a2229' : '#5b3a20'; for (let i = -40; i <= 40; i += 16) { g.beginPath(); g.arc(i, -12, 2.2, 0, TAU); g.fill(); }
      ink(g, 2); g.fillStyle = shade(hull, -.1); g.beginPath(); g.moveTo(-60, -26); g.lineTo(-62, -40); g.lineTo(-40, -40); g.lineTo(-38, -26); g.closePath(); g.fill(); g.stroke();
      const sail = enemy ? '#2b2632' : '#f5ecd2', sailD = enemy ? '#1d1a22' : '#dccfaa';
      for (const [mx, mh, sw] of [[-14, 96, 34], [26, 80, 28]]) {
        ink(g, 3); g.beginPath(); g.moveTo(mx, -26); g.lineTo(mx, -26 - mh); g.stroke(); g.strokeStyle = '#7a5230'; g.lineWidth = 1.6; g.stroke();
        ink(g, 1.6); g.fillStyle = sail; g.beginPath(); g.moveTo(mx - sw, -34 - mh * .78); g.quadraticCurveTo(mx, -40 - mh * .86, mx + sw, -34 - mh * .78); g.quadraticCurveTo(mx + sw + 6, -30 - mh * .45, mx + sw - 2, -32 - mh * .25); g.lineTo(mx - sw + 2, -32 - mh * .25); g.quadraticCurveTo(mx - sw - 6, -30 - mh * .45, mx - sw, -34 - mh * .78); g.fill(); g.stroke();
        g.strokeStyle = sailD; g.lineWidth = 1; for (const k of [-.4, 0, .4]) { g.beginPath(); g.moveTo(mx + sw * k, -36 - mh * .76); g.lineTo(mx + sw * k * 1.1, -34 - mh * .27); g.stroke(); }
        if (enemy) { g.fillStyle = '#c93030'; g.beginPath(); g.arc(mx, -30 - mh * .52, sw * .32, 0, TAU); g.fill(); g.fillStyle = '#f2e6cf'; g.beginPath(); g.ellipse(mx, -32 - mh * .53, sw * .17, sw * .15, 0, 0, TAU); g.fill(); g.fillStyle = '#2b2632'; g.beginPath(); g.arc(mx - sw * .07, -32 - mh * .53, 1.3, 0, TAU); g.arc(mx + sw * .07, -32 - mh * .53, 1.3, 0, TAU); g.fill(); }
        else { g.fillStyle = '#2f5fb8'; g.beginPath(); g.arc(mx, -30 - mh * .52, sw * .26, 0, TAU); g.fill(); g.fillStyle = '#f1cf5a'; g.beginPath(); g.arc(mx, -30 - mh * .52, sw * .1, 0, TAU); g.fill(); }
        g.fillStyle = enemy ? '#c93030' : '#3a6fc4'; ink(g, 1.2); g.beginPath(); g.moveTo(mx, -26 - mh); g.lineTo(mx + 14, -22 - mh); g.lineTo(mx, -18 - mh); g.closePath(); g.fill(); g.stroke();
      }
      ink(g, 1.2); for (const [a, b] of [[-62, -40], [70, -38]]) { g.beginPath(); g.moveTo(a, b); g.lineTo(-14, -122); g.stroke(); }
      if (d.crew && window.ArtStylized) for (const [px, id] of [[-30, 'goblin'], [-6, 'skeleton'], [40, 'goblin']]) { g.save(); g.translate(px, -26); if ((d.flip || 1) < 0) g.scale(-1, 1); ArtStylized.draw(g, id, { w: -1, a: -1, t: px }, 22); g.restore(); }
      g.restore();
    },
    islet(g, d) { const s = d.s || 1; g.save(); g.translate(d.x, d.y); g.scale(s, s); g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 2; g.beginPath(); g.ellipse(0, 0, 24, 6, 0, 0, TAU); g.stroke(); ink(g, 1.6); g.fillStyle = '#9a9384'; g.beginPath(); g.moveTo(-20, 0); g.lineTo(-14, -14); g.lineTo(-2, -22); g.lineTo(10, -16); g.lineTo(20, 0); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#b8b1a0'; g.beginPath(); g.moveTo(-12, -12); g.lineTo(-2, -20); g.lineTo(4, -10); g.closePath(); g.fill(); g.fillStyle = '#6aa34a'; g.beginPath(); g.ellipse(-3, -20, 7, 3, 0, 0, TAU); g.fill(); g.restore(); },
    rowboat(g, d) { g.save(); g.translate(d.x, d.y); g.scale(d.flip || 1, 1); g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 1.6; g.beginPath(); g.ellipse(0, 1, 17, 4, 0, 0, TAU); g.stroke(); ink(g, 1.5); g.fillStyle = '#8a5a34'; g.beginPath(); g.moveTo(-16, -5); g.quadraticCurveTo(0, 6, 16, -6); g.quadraticCurveTo(0, -2, -16, -5); g.fill(); g.stroke(); g.fillStyle = '#b7834e'; g.beginPath(); g.ellipse(0, -4, 13, 2.6, 0, 0, TAU); g.fill(); g.strokeStyle = '#6b4426'; g.lineWidth = 1.4; for (const x of [-5, 5]) { g.beginPath(); g.moveTo(x, -6); g.lineTo(x, -2); g.stroke(); } g.restore(); },
    barrels(g, d) { g.save(); g.translate(d.x, d.y); shadow(g, 1, 1, 13, 4); for (const [x, y] of [[-6, 0], [6, 0], [0, -1.5]]) { ink(g, 1.3); g.fillStyle = '#9a6a3c'; g.beginPath(); g.roundRect(x - 5, y - 13, 10, 13, 3); g.fill(); g.stroke(); g.strokeStyle = '#4b4b52'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x - 5, y - 4); g.lineTo(x + 5, y - 4); g.moveTo(x - 5, y - 9); g.lineTo(x + 5, y - 9); g.stroke(); g.fillStyle = '#c08a52'; g.beginPath(); g.ellipse(x, y - 13, 4.5, 1.6, 0, 0, TAU); g.fill(); } g.restore(); },
    sacks(g, d) { g.save(); g.translate(d.x, d.y); shadow(g, 1, 1, 14, 4); for (const [x, y, r] of [[-7, 0, 6], [6, 0, 6.5], [0, -6, 5.5]]) { ink(g, 1.2); g.fillStyle = '#d8c08e'; g.beginPath(); g.moveTo(x - r, y); g.quadraticCurveTo(x - r - 1, y - r * 1.6, x - 2, y - r * 1.7); g.lineTo(x + 2, y - r * 1.7); g.quadraticCurveTo(x + r + 1, y - r * 1.6, x + r, y); g.closePath(); g.fill(); g.stroke(); } g.restore(); },
    spill(g, d) { g.save(); g.translate(d.x, d.y); g.fillStyle = 'rgba(232,200,110,.9)'; for (let i = 0; i < 14; i++) { g.beginPath(); g.ellipse(Math.cos(i * 2.3) * (4 + i), Math.sin(i * 1.7) * 3, 1.6, 1, 0, 0, TAU); g.fill(); } g.rotate(.5); ink(g, 1.2); g.fillStyle = '#d8c08e'; g.beginPath(); g.ellipse(-6, -3, 6, 4, 0, 0, TAU); g.fill(); g.stroke(); g.rotate(-.9); g.fillStyle = '#b07a44'; g.fillRect(6, -10, 10, 8); g.strokeRect(6, -10, 10, 8); g.restore(); },
    net(g, d) { g.save(); g.translate(d.x, d.y); g.fillStyle = 'rgba(110,90,60,.25)'; g.beginPath(); g.ellipse(0, 0, 14, 5, 0, 0, TAU); g.fill(); g.strokeStyle = '#6c5a3e'; g.lineWidth = .9; for (let i = -12; i <= 12; i += 4) { g.beginPath(); g.moveTo(i, -4); g.lineTo(i + 4, 4); g.moveTo(i + 4, -4); g.lineTo(i, 4); g.stroke(); } ink(g, 1.4); g.beginPath(); g.ellipse(0, 0, 14, 5, 0, 0, TAU); g.stroke(); g.restore(); },
    banner(g, d) { g.save(); g.translate(d.x, d.y); shadow(g, 0, 0, 5, 2); ink(g, 3); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -34); g.stroke(); g.strokeStyle = '#8a6036'; g.lineWidth = 1.6; g.stroke(); ink(g, 1.3); g.fillStyle = '#2f5fb8'; g.beginPath(); g.moveTo(1, -33); g.lineTo(14, -33); g.lineTo(14, -18); g.lineTo(7.5, -21); g.lineTo(1, -18); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#f1cf5a'; g.beginPath(); g.moveTo(7.5, -30); g.lineTo(9.5, -26); g.lineTo(7.5, -23); g.lineTo(5.5, -26); g.closePath(); g.fill(); g.restore(); },
    skullflag(g, d) { g.save(); g.translate(d.x, d.y); ink(g, 3); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -40); g.stroke(); ink(g, 1.3); g.fillStyle = '#2b2632'; g.beginPath(); g.moveTo(-1, -39); g.lineTo(-20, -36); g.lineTo(-17, -28); g.lineTo(-21, -21); g.lineTo(-1, -23); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#efe6cf'; g.beginPath(); g.arc(-10, -30, 3.4, 0, TAU); g.fill(); g.restore(); },
    signpost(g, d) { g.save(); g.translate(d.x, d.y); shadow(g, 0, 0, 6, 2); ink(g, 3.2); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -26); g.stroke(); g.strokeStyle = '#9a6a3c'; g.lineWidth = 1.8; g.stroke(); ink(g, 1.3); const dir = d.dir || 1; g.scale(dir, 1); g.fillStyle = '#c9925a'; g.beginPath(); g.moveTo(-16, -25); g.lineTo(14, -25); g.lineTo(19, -20.5); g.lineTo(14, -16); g.lineTo(-16, -16); g.closePath(); g.fill(); g.stroke(); g.scale(dir, 1); g.fillStyle = INK; const t = d.text || ''; g.font = 'bold ' + (t.length > 8 ? 4 : 5.4) + 'px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(t, 0, -20.5); g.restore(); },
    cart(g, d) { g.save(); g.translate(d.x, d.y); g.scale(d.flip || 1, 1); shadow(g, 0, 1, 16, 4); ink(g, 1.4); g.beginPath(); g.moveTo(10, -6); g.lineTo(24, -2); g.stroke(); g.fillStyle = '#9a6a3c'; g.beginPath(); g.moveTo(-14, -14); g.lineTo(12, -14); g.lineTo(10, -5); g.lineTo(-12, -5); g.closePath(); g.fill(); g.stroke(); if (d.hay) { g.fillStyle = '#e7c158'; g.beginPath(); g.moveTo(-13, -14); g.quadraticCurveTo(-1, -26, 11, -14); g.closePath(); g.fill(); g.stroke(); } else { g.fillStyle = '#d8c08e'; for (const x of [-7, 2]) { g.beginPath(); g.ellipse(x, -16, 5, 4, 0, 0, TAU); g.fill(); g.stroke(); } } g.fillStyle = '#5b4030'; for (const x of [-8, 7]) { g.beginPath(); g.arc(x, -3, 4, 0, TAU); g.fill(); g.stroke(); } g.restore(); },
    well(g, d) { g.save(); g.translate(d.x, d.y); shadow(g, 0, 1, 12, 4); ink(g, 1.4); g.fillStyle = C.stone; g.beginPath(); g.ellipse(0, -4, 10, 4, 0, 0, TAU); g.fill(); g.stroke(); g.fillRect(-10, -4, 20, 4); g.beginPath(); g.moveTo(-10, -4); g.lineTo(-10, 0); g.moveTo(10, -4); g.lineTo(10, 0); g.stroke(); g.beginPath(); g.ellipse(0, 0, 10, 4, 0, 0, Math.PI); g.stroke(); g.fillStyle = '#2f4f66'; g.beginPath(); g.ellipse(0, -4, 7, 2.6, 0, 0, TAU); g.fill(); ink(g, 2.4); g.beginPath(); g.moveTo(-8, -4); g.lineTo(-8, -22); g.moveTo(8, -4); g.lineTo(8, -22); g.stroke(); ink(g, 1.4); g.fillStyle = C.roof; g.beginPath(); g.moveTo(-13, -20); g.lineTo(0, -29); g.lineTo(13, -20); g.closePath(); g.fill(); g.stroke(); g.restore(); },
    garden(g, d) { g.save(); g.translate(d.x, d.y); g.fillStyle = '#8a6440'; ink(g, 1.3); g.beginPath(); g.roundRect(-18, -12, 36, 24, 4); g.fill(); g.stroke(); for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) { const x = -13 + c * 6.5, y = -6 + r * 7; g.fillStyle = r === 1 ? '#e57a3a' : '#7dbb45'; g.beginPath(); g.arc(x, y, 2.4, 0, TAU); g.fill(); } g.restore(); },
    flowerbed(g, d) { g.save(); g.translate(d.x, d.y); for (let i = 0; i < 9; i++) { const x = (i - 4) * 3, y = Math.sin(i) * 2; g.fillStyle = '#4f8a2a'; g.beginPath(); g.arc(x, y, 2.4, 0, TAU); g.fill(); g.fillStyle = ['#ff8fb0', '#ffe066', '#ffffff'][i % 3]; g.beginPath(); g.arc(x, y - 1.6, 1.3, 0, TAU); g.fill(); } g.restore(); },
    reeds(g, d) { g.save(); g.translate(d.x, d.y); for (let i = -3; i <= 3; i++) { g.strokeStyle = '#4f7a2a'; g.lineWidth = 1.3; g.beginPath(); g.moveTo(i * 2.4, 0); g.quadraticCurveTo(i * 2.4 + 1, -7, i * 3, -12 - (i % 2) * 3); g.stroke(); if (i % 2) { g.fillStyle = '#7a5230'; g.beginPath(); g.ellipse(i * 3, -12 - 3, 1.2, 2.6, 0, 0, TAU); g.fill(); } } g.restore(); },
    gate(g, d) { g.save(); g.translate(d.x, d.y); for (const [px, py] of [[-10, -32], [14, 34]]) { shadow(g, px, py, 6, 2); ink(g, 4.4); g.beginPath(); g.moveTo(px, py); g.lineTo(px, py - 40); g.stroke(); g.strokeStyle = '#8a5a34'; g.lineWidth = 3; g.stroke(); } ink(g, 4); g.beginPath(); g.moveTo(-14, -70); g.lineTo(18, -4); g.stroke(); g.strokeStyle = '#a8763e'; g.lineWidth = 2.6; g.stroke(); g.restore(); },
    watchtower(g, d) { g.save(); g.translate(d.x, d.y); shadow(g, 0, 1, 20, 6); for (const x of [-11, 11]) { ink(g, 3.6); g.beginPath(); g.moveTo(x, 0); g.lineTo(x * .8, -38); g.stroke(); g.strokeStyle = '#8a5a34'; g.lineWidth = 2.2; g.stroke(); } g.strokeStyle = '#6b4426'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(-10, -4); g.lineTo(9, -30); g.moveTo(10, -4); g.lineTo(-9, -30); g.stroke(); ink(g, 1.5); g.fillStyle = '#a8763e'; g.beginPath(); g.rect(-15, -48, 30, 11); g.fill(); g.stroke(); ink(g, 1.5); g.fillStyle = C.roof; g.beginPath(); g.moveTo(-19, -48); g.lineTo(0, -66); g.lineTo(19, -48); g.closePath(); g.fill(); g.stroke(); ink(g, 2); g.beginPath(); g.moveTo(0, -66); g.lineTo(0, -80); g.stroke(); ink(g, 1.1); g.fillStyle = '#2f5fb8'; g.beginPath(); g.moveTo(0, -80); g.lineTo(11, -77); g.lineTo(0, -73); g.closePath(); g.fill(); g.stroke(); g.restore(); },
    pen(g, d) { g.save(); g.translate(d.x, d.y); g.fillStyle = 'rgba(160,130,80,.35)'; g.beginPath(); g.ellipse(0, 0, 24, 11, 0, 0, TAU); g.fill(); g.restore(); PaintedWorld.prop(g, { k: 'fence70', x: d.x - 24, y: d.y - 9, x2: d.x + 24, y2: d.y - 9 }, 'castle'); },
    smoke(g, d) { g.save(); g.translate(d.x, d.y); for (let i = 0; i < 5; i++) { g.fillStyle = `rgba(80,74,70,${.42 - i * .07})`; g.beginPath(); g.arc(Math.sin(i * 1.3) * 5 + i * 3, -i * 11, 6 + i * 2.4, 0, TAU); g.fill(); } g.restore(); },
    burnt(g, d) { g.save(); g.translate(d.x, d.y); g.fillStyle = 'rgba(40,30,25,.45)'; g.beginPath(); g.ellipse(0, 0, 16, 6, 0, 0, TAU); g.fill(); ink(g, 1.3); g.fillStyle = '#3a2c24'; for (const [x, a] of [[-6, -.4], [2, .3], [7, -.2]]) { g.save(); g.translate(x, -2); g.rotate(a); g.fillRect(-6, -2, 12, 4); g.strokeRect(-6, -2, 12, 4); g.restore(); } g.fillStyle = '#ff8a2a'; g.beginPath(); g.arc(0, -3, 2, 0, TAU); g.fill(); g.restore(); }
  };
  const TALL = new Set(['bhouse', 'keep', 'hall', 'tower', 'lighthouse', 'windmill', 'tree', 'pine', 'watchtower', 'humangate', 'arch', 'wall', 'ship', 'tent', 'statue', 'lamp', 'banner', 'gate', 'smoke']);
  const oldProp = PaintedWorld.prop;
  PaintedWorld.prop = function (g, d, theme) { if (d.hk && D[d.k]) { D[d.k](g, d); return true; } return oldProp.call(this, g, d, theme); };

  /* ================= VẼ NỀN ================= */
  function render(m, res) {
    const def = m.hand, T = def.terrain, W = m.W, H = m.H, PW = CONFIG.pathWidth, c = mk(W * res, H * res), g = c.getContext('2d'); g.scale(res, res); g.lineJoin = g.lineCap = 'round';
    const rnd = K.seeded(m.index * 991 + 7); let gr;
    const ground = World70.ground(m, res);
    if (T.land) {
      g.fillStyle = pat(g, 'castle', 2, 150, res) || '#3aa7c4'; g.fillRect(0, 0, W, H);
      gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(16,70,130,.42)'); gr.addColorStop(.35, 'rgba(16,70,130,.1)'); gr.addColorStop(1, 'rgba(16,70,130,.22)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      gr = g.createLinearGradient(0, 0, 0, 34); gr.addColorStop(0, 'rgba(235,248,255,.6)'); gr.addColorStop(1, 'rgba(235,248,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, 34);
      g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 1.4; for (let i = 0; i < 70; i++) { const x = rnd() * W, y = rnd() * H, w = 5 + rnd() * 9; g.beginPath(); g.moveTo(x - w, y); g.quadraticCurveTo(x, y - 3, x + w, y); g.stroke(); }
      smoothPoly(g, T.land, true); g.strokeStyle = 'rgba(140,230,225,.35)'; g.lineWidth = 46; g.stroke(); g.strokeStyle = 'rgba(170,240,232,.45)'; g.lineWidth = 22; g.stroke(); g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 5; g.stroke();
      if (T.seaCliff) { const e = T.land.slice(T.seaCliff); faces(g, e, 34, rnd, true); }
      g.save(); smoothPoly(g, T.land, true); g.clip(); g.drawImage(ground, 0, 0, W, H);
      if (T.beach) { const coast = T.land.slice(T.beach[0], T.beach[1] + 1); g.globalAlpha = .55; smoothPoly(g, coast, false); g.strokeStyle = '#efd9a0'; g.lineWidth = 52; g.stroke(); g.globalAlpha = 1; g.lineWidth = 34; g.strokeStyle = '#f0dba4'; g.stroke(); g.lineWidth = 12; g.strokeStyle = '#d9bd7c'; g.stroke(); }
      if (T.seaCliff) { smoothPoly(g, T.land.slice(T.seaCliff), false); g.strokeStyle = '#4f8a2a'; g.lineWidth = 6; g.stroke(); }
      g.restore(); smoothPoly(g, T.land, true); ink(g, 1.6); g.strokeStyle = 'rgba(90,70,40,.55)'; g.stroke();
    } else g.drawImage(ground, 0, 0, W, H);
    // vách đá bậc thềm trong đất liền
    for (const cl of T.cliffs || []) { faces(g, cl.pts, cl.h || 24, rnd, false); g.save(); g.globalAlpha = .25; smoothPoly(g, cl.pts.map(([x, y]) => [x, y + (cl.h || 24) + 6]), false); g.strokeStyle = '#2a3a1a'; g.lineWidth = 10; g.stroke(); g.restore(); }
    // hồ, sông, thác
    const water = pat(g, 'castle', 2, 90, res) || '#4ab0c8';
    for (const l of T.lakes || []) { g.fillStyle = '#4c7a3a'; g.beginPath(); g.ellipse(l.x, l.y + 1, l.rx + 5, l.ry + 3, 0, 0, TAU); g.fill(); g.fillStyle = water; g.beginPath(); g.ellipse(l.x, l.y, l.rx, l.ry, 0, 0, TAU); g.fill(); g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 1.4; g.beginPath(); g.ellipse(l.x, l.y, l.rx - 3, l.ry - 2, 0, 3.6, 5.6); g.stroke(); }
    for (const rv of T.rivers || []) { smoothPoly(g, rv.pts, false); g.strokeStyle = '#4c7a3a'; g.lineWidth = rv.w + 8; g.stroke(); g.strokeStyle = '#c9b27a'; g.lineWidth = rv.w + 3; g.stroke(); g.strokeStyle = water; g.lineWidth = rv.w; g.stroke(); g.strokeStyle = 'rgba(255,255,255,.45)'; g.lineWidth = 1.4; g.setLineDash([6, 9]); g.stroke(); g.setLineDash([]); }
    for (const f of T.falls || []) { const w = f.w || 14, h = f.h || 30; gr = g.createLinearGradient(0, f.y, 0, f.y + h); gr.addColorStop(0, '#bfeef5'); gr.addColorStop(1, '#ffffff'); g.fillStyle = gr; g.beginPath(); g.moveTo(f.x - w / 2, f.y - 2); g.lineTo(f.x + w / 2, f.y - 2); g.lineTo(f.x + w / 2 + 2, f.y + h); g.lineTo(f.x - w / 2 - 2, f.y + h); g.closePath(); g.fill(); g.strokeStyle = 'rgba(120,200,220,.8)'; g.lineWidth = 1; for (let k = -w / 2 + 3; k < w / 2; k += 4) { g.beginPath(); g.moveTo(f.x + k, f.y); g.lineTo(f.x + k * 1.1, f.y + h - 2); g.stroke(); } g.fillStyle = 'rgba(255,255,255,.85)'; for (let i = 0; i < 7; i++) { g.beginPath(); g.arc(f.x + (i - 3) * w / 6, f.y + h + 2 + Math.sin(i) * 2, 3 + (i % 2), 0, TAU); g.fill(); } }
    // đường
    const path = m.paths[0], q = {}, pts = []; for (let d = 0; d <= path.length; d += 4) { path.pointAt(d, q); pts.push([q.x, q.y, d]); }
    const onLand = pts.filter(([x, y]) => !(T.piers || []).some(p => x > p.x0 - 2 && x < p.x1 + 6 && Math.abs(y - p.y) < p.half + 6) && !(T.gangway && x > T.gangway[0] - 4));
    const strokePts = (ps, w, col) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); ps.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); };
    for (let k = 0; k < 5; k++) { g.globalAlpha = .08; strokePts(onLand, PW + 32 - k * 6, '#b48a4c'); } g.globalAlpha = 1;
    strokePts(onLand, PW + 3, '#9c6c30'); strokePts(onLand, PW, '#d3a454'); strokePts(onLand, PW - 7, '#ecc874'); g.globalAlpha = .5; strokePts(onLand, PW * .5, '#f6dc98'); g.globalAlpha = 1;
    const isCob = (x, y) => def.cobbleAll || (T.cobble || []).some(([x0, y0, x1, y1]) => x > x0 && x < x1 && y > y0 && y < y1);
    let run = []; const flush = () => { if (run.length > 2) { strokePts(run, PW - 4, pat(g, 'castle', 1, 58, res) || '#c9bfa8'); g.globalAlpha = .16; strokePts(run, PW - 4, '#f2e2b6'); g.globalAlpha = 1; } run = []; };
    for (const p of onLand) { if (isCob(p[0], p[1])) run.push(p); else flush(); } flush();
    // cầu đá tự sinh ở chỗ đường cắt sông
    const wetRiver = (x, y) => (T.rivers || []).some(rv => polyDist(rv.pts, x, y) < rv.w / 2 + 3);
    let seg = null; const bridges = []; for (const p of pts) { const w = wetRiver(p[0], p[1]); if (w && !seg) seg = [p]; else if (w) seg.push(p); else if (seg) { bridges.push(seg); seg = null; } } if (seg) bridges.push(seg);
    for (const b of bridges) bridge(g, path, Math.max(0, b[0][2] - 12), Math.min(path.length, b[b.length - 1][2] + 12), PW, def.woodBridge, res);
    // cầu tàu
    for (const p of T.piers || []) pier(g, p, res);
    if (T.gangway) { const [x0, y0, x1, y1] = T.gangway; ink(g, 1.6); g.fillStyle = '#b8864f'; g.beginPath(); g.moveTo(x0 - 12, y0); g.lineTo(x0 + 12, y0); g.lineTo(x1 + 10, y1); g.lineTo(x1 - 10, y1); g.closePath(); g.fill(); g.stroke(); g.strokeStyle = '#7a5230'; g.lineWidth = 1; for (let t = .1; t < 1; t += .1) { const x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t; g.beginPath(); g.moveTo(x - 11, y); g.lineTo(x + 11, y); g.stroke(); } }
    // vật thể theo chiều sâu
    for (const d of m.decor) { g.save(); PaintedWorld.prop(g, d, 'castle'); g.restore(); }
    if (T.land) { g.fillStyle = 'rgba(255,255,255,.9)'; for (const [x, y, s] of [[330, 6, 1], [520, 2, 1.2], [700, 10, .9], [610, 30, .6]]) { g.save(); g.translate(x, y); g.scale(s, s); g.beginPath(); for (const [a, b, r] of [[-18, 4, 10], [-4, 0, 13], [12, 3, 10], [24, 6, 7]]) { g.moveTo(a + r, b); g.arc(a, b, r, 0, TAU); } g.fill(); g.restore(); } }
    g.save(); g.globalAlpha = .3; g.globalCompositeOperation = 'soft-light'; gr = g.createLinearGradient(0, 0, W, H); gr.addColorStop(0, 'rgba(255,236,170,.6)'); gr.addColorStop(.6, 'rgba(255,236,170,0)'); gr.addColorStop(1, 'rgba(30,40,100,.4)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.restore();
    const vg = g.createRadialGradient(W * .5, H * .5, H * .5, W * .5, H * .5, W * .7); vg.addColorStop(0, 'rgba(15,8,30,0)'); vg.addColorStop(1, 'rgba(15,8,30,.18)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
    return c;
  }
  function faces(g, pts, h, rnd, sea) {
    const face = (dy, col) => { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); for (let i = pts.length - 1; i >= 0; i--) g.lineTo(pts[i][0], pts[i][1] + dy + (i % 2) * 3); g.closePath(); g.fillStyle = col; g.fill(); ink(g, 1.8); g.stroke(); };
    face(h, '#7f725f'); face(h * .6, '#a39580');
    g.strokeStyle = '#6d614f'; g.lineWidth = 1; for (let i = 0; i < pts.length - 1; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], L = Math.hypot(x1 - x0, y1 - y0); for (let t = 0; t < L; t += 10 + rnd() * 8) { const x = x0 + (x1 - x0) * t / L, y = y0 + (y1 - y0) * t / L; g.beginPath(); g.moveTo(x, y + 3); g.lineTo(x + 2, y + h * .55); g.stroke(); } }
    g.strokeStyle = '#5f9a33'; g.lineWidth = 4; smoothPoly(g, pts, false); g.stroke();
    if (sea) { g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 3; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y + h + 3) : g.moveTo(x, y + h + 3)); g.stroke(); }
  }
  function bridge(g, path, d0, d1, PW, wood, res) {
    const q = {}, half = PW / 2 + 5, L = [], R = []; for (let d = d0; d <= d1; d += 3) { path.pointAt(d, q); L.push([q.x - q.nx * half, q.y - q.ny * half]); R.push([q.x + q.nx * half, q.y + q.ny * half]); }
    const poly = (dy) => { g.beginPath(); L.forEach(([x, y], i) => i ? g.lineTo(x, y + dy) : g.moveTo(x, y + dy)); for (let i = R.length - 1; i >= 0; i--) g.lineTo(R[i][0], R[i][1] + dy); g.closePath(); };
    g.save(); poly(10); g.fillStyle = 'rgba(20,30,40,.3)'; g.fill(); poly(6); g.fillStyle = wood ? '#6b4426' : '#8f887a'; g.fill(); ink(g, 1.6); g.stroke();
    poly(0); g.fillStyle = wood ? (pat(g, 'forest', 3, 40, res) || '#a8763e') : (pat(g, 'castle', 1, 50, res) || '#bdb6a8'); g.fill(); g.stroke();
    const low = L.reduce((a, p) => a + p[1], 0) / L.length > R.reduce((a, p) => a + p[1], 0) / R.length ? L : R, high = low === L ? R : L;
    if (!wood) { // vòm cầu ở mặt phía nam
      const n = Math.max(1, Math.round((d1 - d0) / 26)); for (let k = 0; k < n; k++) { const a = low[Math.floor(k / n * (low.length - 1))], b = low[Math.floor((k + 1) / n * (low.length - 1))], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2; g.fillStyle = '#2d4f62'; g.beginPath(); g.ellipse(mx, my + 9, Math.hypot(b[0] - a[0], b[1] - a[1]) * .32, 5, 0, Math.PI, 0); g.fill(); }
    }
    for (const side of [low, high]) for (let i = 0; i < side.length; i += 3) { const [x, y] = side[i]; ink(g, 1.2); g.fillStyle = wood ? '#9a6a3c' : (side === low ? '#c9c2b2' : '#d8d1c1'); g.beginPath(); g.roundRect(x - 3.4, y - 6, 6.8, 7, 1.6); g.fill(); g.stroke(); }
    g.restore();
  }
  function pier(g, p, res) {
    const { x0, x1, y, half } = p; g.fillStyle = 'rgba(20,40,60,.35)'; g.fillRect(x0, y - half + 4, x1 - x0, half * 2 + 3);
    for (let x = x0 + 8; x <= x1; x += 16) for (const s of [-1, 1]) { ink(g, 3.2); g.beginPath(); g.moveTo(x, y + s * half); g.lineTo(x, y + s * half + 9); g.stroke(); g.strokeStyle = '#6b4426'; g.lineWidth = 1.8; g.stroke(); }
    g.fillStyle = pat(g, 'forest', 3, 46, res, 90) || '#a8763e'; ink(g, 1.6); g.beginPath(); g.rect(x0, y - half, x1 - x0, half * 2); g.fill(); g.stroke();
    g.strokeStyle = 'rgba(60,40,20,.5)'; g.lineWidth = 1; for (let x = x0 + 5; x < x1; x += 5) { g.beginPath(); g.moveTo(x, y - half); g.lineTo(x, y + half); g.stroke(); }
    for (const s of [-1, 1]) for (let x = x0 + 14; x < x1; x += 28) { ink(g, 1.2); g.fillStyle = '#5e4630'; g.fillRect(x - 2.5, y + s * (half - 2) - 4, 5, 4); g.strokeRect(x - 2.5, y + s * (half - 2) - 4, 5, 4); }
  }

  /* ================= GẮN VÀO GAME ================= */
  function footprintHit(s, d, tall) { return Math.abs(d.x - s.x) < 38 && d.y > s.y - 96 && d.y < s.y + (tall ? 90 : 16); }
  function register(def) {
    MAPS[def.level] = def; const L = CONFIG.levels[def.level];
    L.sub = def.name; L.story = def.story; L.spots = def.spots.length; L.ipaths = [def.route.map(p => p.slice())];
    L.feat.props = []; L.feat.rivers = []; L.feat.lakes = []; L.route = { ...L.route, lanes: 1, entry: def.route[0], exit: def.route[def.route.length - 1] };
  }
  const build = Level.build;
  Level.build = function (i) {
    const m = build.call(this, i), def = MAPS[i]; if (!def) return m;
    m.hand = def; m.spots = def.spots.map(([x, y], id) => ({ x, y, id }));
    const PW = CONFIG.pathWidth, p = m.paths[0], dropped = [];
    m.decor = def.props.map(d => ({ s: 1, flip: 1, v: .5, ...d, hk: !!D[d.k] })).filter(d => {
      if (d.free) return true;
      const tall = TALL.has(d.k), onRoad = p.nearest(d.x, d.y).perp < PW / 2 + 4 || (tall && d.k !== 'wall' && p.nearest(d.x, d.y - 26).perp < PW / 2 - 4);
      const under = m.spots.some(s => footprintHit(s, d, tall));
      if (onRoad || under) { dropped.push(d.k + '@' + d.x + ',' + d.y + (onRoad ? ' road' : ' tower')); return false; } return true;
    }).sort((a, b) => a.y - b.y);
    m.handDropped = dropped; return m;
  };
  const oldRender = MapArt.render;
  MapArt.render = function (m, res) { if (m.hand && window.World70) return render(m, res); return oldRender.call(this, m, res); };
  const oldWet = MapArt.wetAt; MapArt.wetAt = function (F, x, y, r) { const m = window.Game && Game.map; if (m && m.hand && F === m.feat) return wet(m.hand, x, y, r); return oldWet.apply(this, arguments); };
  const showResult = UI.showResult;
  UI.showResult = function (r) {
    const out = showResult.apply(this, arguments), def = MAPS[Game.levelIndex];
    if (def) setTimeout(() => { const rib = document.querySelector('.ribbon'); if (!rib) return; if (r.win) rib.insertAdjacentHTML('afterend', `<p class="levelup">${def.win}</p>`); else { const p = rib.nextElementSibling; if (p && p.tagName === 'P') p.textContent = def.lose; } }, 0);
    return out;
  };
  window.HumanKit = { register, MAPS, D, wet, render, polyDist };
})();
