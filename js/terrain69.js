/* Revision 69 – bề mặt bản đồ bằng ảnh vẽ tay (terrain-<vùng>-painted53.webp: cỏ/đường/nước/ván).
 * Nền cỏ, mặt đường sỏi, nước và bệ đặt trụ đều lấy từ kết cấu vẽ tay của từng vùng (giống Kingdom Rush),
 * code chỉ thêm viền, bóng mép đường, vệt đất ven đường, loang sáng-tối và tối dần ra mép. */
(function () {
  if (!window.KR68) return;
  const base = new URL('../assets/sprites/', document.currentScript.src), THEMES = ['forest', 'castle', 'desert', 'ice', 'lava', 'chaos'];
  const imgs = {}, tiles = new Map(), gcache = new Map(), TAU = Math.PI * 2, K = ArtKit;
  const CALM = { forest: .34, castle: .3, desert: .22, ice: .18, lava: .2, chaos: .26 };
  const SIZE = { ground: { forest: 165, castle: 160, desert: 210, ice: 210, lava: 185, chaos: 175 }, road: 105, water: 140 };
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; };
  for (const t of THEMES) {
    const im = new Image(); im.src = new URL('terrain-' + t + '-painted53.webp', base).href; imgs[t] = im;
    im.onload = () => { if (window.Game && Game.map && Game.map.def.theme === t && Game.renderBg) { gcache.clear(); try { Game.renderBg(); } catch (e) { } } };
  }
  const ready = t => imgs[t] && imgs[t].complete && imgs[t].naturalWidth > 0;
  function tile(theme, n, px) {
    px = Math.max(8, Math.round(px)); const key = theme + n + '|' + px; let c = tiles.get(key); if (c) return c;
    if (!ready(theme)) return null; const im = imgs[theme], q = im.naturalWidth / 2, I = 4;
    c = mk(px, px); const g = c.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(im, (n % 2) * q + I, (n >> 1) * q + I, q - 2 * I, q - 2 * I, 0, 0, px, px);
    tiles.set(key, c); if (tiles.size > 24) tiles.delete(tiles.keys().next().value); return c;
  }
  function pattern(g, theme, n, size, res) { const c = tile(theme, n, size * res); if (!c) return null; const p = g.createPattern(c, 'repeat'); p.setTransform(new DOMMatrix().scale(1 / res)); return p; }
  const polysOf = m => { const q = {}; return m.paths.map(p => { const pts = []; for (let d = 0; d <= p.length; d += 4) { p.pointAt(Math.min(d, p.length), q); pts.push([q.x, q.y]); } p.pointAt(p.length, q); pts.push([q.x, q.y]); return pts; }); };
  const strokeAll = (g, polys, w, col) => { g.strokeStyle = col; g.lineWidth = w; g.lineJoin = 'round'; g.lineCap = 'round'; for (const pts of polys) { g.beginPath(); pts.forEach((v, i) => i ? g.lineTo(v[0], v[1]) : g.moveTo(v[0], v[1])); g.stroke(); } };
  let cur = null, curRes = 1;

  function ground(m, res) {
    const theme = m.def.theme, P = KR68.PAL[theme] || KR68.PAL.forest, W = m.W, H = m.H, PW = CONFIG.pathWidth;
    const c = mk(W * res, H * res), p = c.getContext('2d'); p.scale(res, res);
    const pat = pattern(p, theme, 0, SIZE.ground[theme] || 170, res); if (!pat) return null;
    p.fillStyle = pat; p.fillRect(0, 0, W, H);
    p.fillStyle = K.alpha(P.g, CALM[theme] ?? .3); p.fillRect(0, 0, W, H); // dịu nền để đường & nhân vật nổi
    const rnd = K.seeded(m.index * 7331 + 17);
    const blob = (x, y, r, col, a) => { const gr = p.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, K.alpha(col, a)); gr.addColorStop(1, K.alpha(col, 0)); p.fillStyle = gr; p.fillRect(x - r, y - r, 2 * r, 2 * r); };
    // phá vỡ sự lặp lại của ô kết cấu
    for (let i = 0; i < 24; i++) blob(rnd() * W, rnd() * H, 70 + rnd() * 120, rnd() < .5 ? P.gl : P.gd, .26);
    // vệt đất mòn mềm hai bên đường
    const polys = polysOf(m);
    for (let k = 0; k < 5; k++) { p.globalAlpha = .07; strokeAll(p, polys, PW + 40 - k * 7, P.dirt); }
    p.globalAlpha = 1;
    const vg = p.createRadialGradient(W / 2, H / 2, H * .4, W / 2, H / 2, W * .66); vg.addColorStop(0, K.alpha(P.gd, 0)); vg.addColorStop(1, K.alpha(P.gd, .55)); p.fillStyle = vg; p.fillRect(0, 0, W, H);
    return c;
  }

  const oldRoad = KR68.road;
  KR68.road = function (g, m) {
    const theme = m.def.theme, P = KR68.PAL[theme] || KR68.PAL.forest, PW = CONFIG.pathWidth, W = m.W, H = m.H, res = curRes;
    if (!ready(theme)) return oldRoad.call(this, g, m);
    const polys = polysOf(m), rnd = K.seeded(m.index * 131 + 7), q = {}, bumps = [];
    for (const path of m.paths) for (let d = 6; d < path.length; d += 7) { path.pointAt(d, q); for (const s of [-1, 1]) if (rnd() < .5) bumps.push([q.x + q.nx * (PW / 2) * s, q.y + q.ny * (PW / 2) * s, 2 + rnd() * 3.5]); }
    const shape = (ctx, grow, col) => { ctx.fillStyle = col; for (const [x, y, r] of bumps) { ctx.beginPath(); ctx.arc(x, y, r + grow / 2, 0, TAU); ctx.fill(); } strokeAll(ctx, polys, PW + grow, col); };
    // bóng đổ + viền mực
    g.save(); g.globalAlpha = .3; g.translate(0, 4); shape(g, 8, P.roadInk); g.restore();
    shape(g, 5, P.roadInk);
    // mặt đường: kết cấu vẽ tay cắt theo hình con đường
    const c = mk(W * res, H * res), r = c.getContext('2d'); r.scale(res, res);
    shape(r, 0, '#000'); r.globalCompositeOperation = 'source-in'; r.fillStyle = pattern(r, theme, 1, SIZE.road, res); r.fillRect(0, 0, W, H);
    // bóng trong dọc mép (đường hơi trũng) + giữa sáng
    const e = mk(W * res, H * res), x = e.getContext('2d'); x.scale(res, res);
    shape(x, 0, '#000'); x.globalCompositeOperation = 'destination-out'; strokeAll(x, polys, PW - 12, '#000');
    for (let k = 1; k <= 3; k++) { x.globalAlpha = .35; strokeAll(x, polys, PW - 12 + k * 3, '#000'); }
    r.globalCompositeOperation = 'source-atop'; r.globalAlpha = .2; r.fillStyle = P.road; r.fillRect(0, 0, W, H); r.globalAlpha = .38; r.drawImage(e, 0, 0, W, H);
    r.globalAlpha = .16; strokeAll(r, polys, PW * .45, '#fff8e0'); r.globalAlpha = 1;
    g.drawImage(c, 0, 0, W, H);
    // cỏ lấn mép đường
    if (!['lava', 'chaos', 'desert'].includes(theme)) {
      const dark = K.shade(P.g, -.3), light = K.shade(P.g, .05);
      for (const path of m.paths) for (let d = 8; d < path.length; d += 8) {
        path.pointAt(d, q); for (const s of [-1, 1]) {
          if (rnd() < .55) continue; const px = q.x + q.nx * (PW / 2 + 1.5) * s, py = q.y + q.ny * (PW / 2 + 1.5) * s;
          if (m.paths.some(o => o.nearest(px, py).perp < PW / 2 - 1) || MapArt.wetAt(m.feat, px, py, 4)) continue;
          const z = .45 + rnd() * .35; g.fillStyle = dark; g.beginPath(); g.moveTo(px - 5 * z, py); g.quadraticCurveTo(px - 6 * z, py - 6 * z, px - 7 * z, py - 9 * z); g.quadraticCurveTo(px - 1.5 * z, py - 5 * z, px, py - 11 * z); g.quadraticCurveTo(px + 1.5 * z, py - 5 * z, px + 7 * z, py - 8 * z); g.quadraticCurveTo(px + 5 * z, py - 4 * z, px + 5 * z, py); g.closePath(); g.fill();
          g.fillStyle = light; g.beginPath(); g.moveTo(px - 2.5 * z, py - 1 * z); g.quadraticCurveTo(px - 3 * z, py - 5 * z, px - 4 * z, py - 6.5 * z); g.quadraticCurveTo(px - .5 * z, py - 4 * z, px, py - 8 * z); g.quadraticCurveTo(px + .8 * z, py - 3 * z, px + 2.5 * z, py - 1 * z); g.closePath(); g.fill();
        }
      }
    }
    return true;
  };

  // bệ đặt trụ: đất/sỏi vẽ tay trong viền đá + biển gỗ
  const pads = new Map(), PADW = 100, PADH = 64, PZ = 3, oldPlot = Painter.plot;
  function padArt(theme) {
    if (pads.has(theme)) return pads.get(theme); if (!ready(theme)) return null;
    const P = KR68.PAL[theme] || KR68.PAL.forest, c = mk(PADW * PZ, PADH * PZ), g = c.getContext('2d'); g.scale(PZ, PZ); g.translate(PADW / 2, 44); g.lineJoin = 'round'; g.lineCap = 'round';
    g.fillStyle = 'rgba(25,15,8,.32)'; g.beginPath(); g.ellipse(1, 4, 37, 14, 0, 0, TAU); g.fill();
    g.fillStyle = P.roadInk; g.beginPath(); g.ellipse(0, 0, 35, 13.5, 0, 0, TAU); g.fill();
    g.save(); g.beginPath(); g.ellipse(0, -.5, 32.5, 11.5, 0, 0, TAU); g.clip(); g.fillStyle = pattern(g, theme, 1, 70, PZ) || P.road; g.fillRect(-40, -20, 80, 40);
    const sh = g.createRadialGradient(0, -3, 6, 0, 0, 34); sh.addColorStop(0, 'rgba(255,248,220,.18)'); sh.addColorStop(.7, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(40,25,10,.45)'); g.fillStyle = sh; g.fillRect(-40, -20, 80, 40); g.restore();
    const r = K.seeded(theme.length * 31 + 5);
    for (let i = 0; i < 12; i++) { const a = Math.PI * (.02 + i * .087) + (r() - .5) * .08, x = Math.cos(a) * 33, y = Math.sin(a) * 12.5, s = 2.4 + r() * 1.5; g.fillStyle = K.alpha(P.roadInk, .45); g.beginPath(); g.ellipse(x + .5, y + 1, s * 1.1, s * .7, 0, 0, TAU); g.fill(); g.fillStyle = P.stone; g.strokeStyle = P.roadInk; g.lineWidth = .9; g.beginPath(); g.ellipse(x, y, s, s * .68, 0, 0, TAU); g.fill(); g.stroke(); g.fillStyle = 'rgba(255,255,255,.4)'; g.beginPath(); g.ellipse(x - s * .3, y - s * .25, s * .4, s * .22, 0, 0, TAU); g.fill(); }
    g.strokeStyle = P.roadInk; g.lineWidth = 4.2; g.beginPath(); g.moveTo(0, -1); g.lineTo(0, -22); g.stroke();
    g.strokeStyle = '#9a6a3a'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(0, -1.5); g.lineTo(0, -21.5); g.stroke();
    g.fillStyle = '#f3ead0'; g.strokeStyle = P.roadInk; g.lineWidth = 1.5; g.beginPath(); g.roundRect(-9, -33, 18, 12, 2); g.fill(); g.stroke();
    g.fillStyle = '#7a6a54'; g.beginPath(); g.moveTo(-4, -23.5); g.lineTo(-4, -29); g.lineTo(-2.5, -29); g.lineTo(-2.5, -30.5); g.lineTo(-.7, -30.5); g.lineTo(-.7, -29); g.lineTo(.7, -29); g.lineTo(.7, -30.5); g.lineTo(2.5, -30.5); g.lineTo(2.5, -29); g.lineTo(4, -29); g.lineTo(4, -23.5); g.closePath(); g.fill();
    pads.set(theme, c); return c;
  }
  Painter.plot = function (g, x, y, on, t) {
    const theme = (window.Game && Game.map && Game.map.def.theme) || 'forest', art = padArt(theme); if (!art) return oldPlot.apply(this, arguments);
    g.drawImage(art, x - PADW / 2, y - 44, PADW, PADH);
    if (on) { g.save(); g.globalAlpha = .65 + Math.sin((t || 0) * 6) * .3; g.strokeStyle = '#ffe58a'; g.lineWidth = 3; g.beginPath(); g.ellipse(x, y, 38, 15, 0, 0, TAU); g.stroke(); g.restore(); }
  };

  const oldTex = PaintedWorld.texture, oldRender = MapArt.render;
  PaintedWorld.texture = function (g, theme, n, size) {
    if (cur && n === 0) { const key = cur.index + '|' + curRes + '|' + cur.W; let c = gcache.get(key); if (!c) { c = ground(cur, curRes); if (c) { gcache.set(key, c); if (gcache.size > 3) gcache.delete(gcache.keys().next().value); } } if (c) { const p = g.createPattern(c, 'no-repeat'); p.setTransform(new DOMMatrix().scale(1 / curRes)); return p; } }
    if (cur && n === 2) { const p = pattern(g, theme, 2, SIZE.water, curRes); if (p) return p; }
    return oldTex.apply(this, arguments);
  };
  MapArt.render = function (m, res) { const pc = cur, pr = curRes; cur = m; curRes = res; try { return oldRender.call(this, m, res); } finally { cur = pc; curRes = pr; } };
  window.Terrain69 = { tile, pattern, ground, version: 69 };
})();
