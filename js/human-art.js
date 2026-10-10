/* Rev 76 – tranh vẽ tay Vương Quốc Người (3 bảng thiết kế của chủ dự án) gắn vào 6 map.
 * Atlas: human-buildings.webp (lâu đài, tháp, nhà mái xanh, tòa thị chính, 2 nhà tranh),
 *        human-harbor.webp (hải đăng, thuyền buôn, bến cảng, cầu tàu gỗ, cầu đá vòm, kè đá),
 *        human-nature.webp (ruộng lúa, ruộng đã gặt, bó lúa, đống rơm, sồi, thông, bụi, đá).
 * Các loại vật thể cũ (vẽ bằng code) được thay bằng hình vẽ tay; neo = chân vật thể. */
(function () {
  if (!window.HumanKit) return;
  const base = new URL('../assets/sprites/', document.currentScript.src);
  const ATL = {
    b: { file: 'human-buildings.webp', f: { tower: [4, 4, 214, 420], bluehouse: [222, 4, 411, 319], thatchB: [637, 4, 420, 316], castle: [1061, 4, 420, 307], hall: [1485, 4, 420, 304], thatchA: [4, 428, 377, 278] } },
    h: { file: 'human-harbor.webp', f: { lighthouse: [4, 4, 373, 400], ship: [381, 4, 400, 400], harbor: [785, 4, 400, 335], wooddock: [1189, 4, 400, 298], bridge: [1593, 4, 400, 286], quay: [4, 408, 400, 283] } },
    n: { file: 'human-nature.webp', f: { oak: [4, 4, 270, 300], oakB: [278, 4, 240, 300], pine: [522, 4, 144, 300], pineB: [670, 4, 137, 300], pineC: [811, 4, 129, 239], fieldcut: [944, 4, 300, 226], field: [1248, 4, 300, 211], haystack: [1552, 4, 260, 198], bush: [4, 308, 300, 186], sheafB: [308, 308, 151, 184], sheafA: [463, 308, 145, 182], rock: [612, 308, 236, 178], sheafC: [852, 308, 144, 164], rockB: [1000, 308, 160, 132] } }
  };
  // chiều rộng mặc định trên bản đồ (đơn vị thế giới) + vị trí chân (tỉ lệ chiều cao)
  const SPR = {
    castle: ['b', 230, .93], tower: ['b', 44, .95], bluehouse: ['b', 68, .9], hall: ['b', 104, .9], thatchA: ['b', 62, .9], thatchB: ['b', 64, .9],
    lighthouse: ['h', 74, .86], ship: ['h', 80, .9], harbor: ['h', 100, .8], wooddock: ['h', 84, .8], bridge: ['h', 150, .75], quay: ['h', 96, .78],
    oak: ['n', 62, .95], oakB: ['n', 52, .95], pine: ['n', 36, .96], pineB: ['n', 32, .96], pineC: ['n', 28, .95], field: ['n', 100, .6], fieldcut: ['n', 100, .6],
    haystack: ['n', 34, .92], sheafA: ['n', 16, .95], sheafB: ['n', 16, .95], sheafC: ['n', 15, .95], bush: ['n', 38, .9], rock: ['n', 30, .9], rockB: ['n', 22, .9]
  };
  const img = {}; let ready = 0;
  for (const [k, a] of Object.entries(ATL)) { const im = new Image(); im.onload = () => { ready++; if (ready === 3 && window.Game && Game.map && Game.map.hand && Game.renderBg) try { Game.renderBg(); } catch (e) { } }; im.src = new URL(a.file, base).href; img[k] = im; }
  const ok = k => { const s = SPR[k]; return s && img[s[0]].complete && img[s[0]].naturalWidth > 0; };
  function spr(g, k, x, y, w, flip) {
    if (!ok(k)) return false; const [a, , foot] = SPR[k], [sx, sy, sw, sh] = ATL[a].f[k], h = w * sh / sw;
    g.save(); g.translate(x, y); if (flip) g.scale(-1, 1);
    g.fillStyle = 'rgba(30,20,10,.18)'; g.beginPath(); g.ellipse(0, -h * (1 - foot) * .2, w * .42, Math.max(3, w * .1), 0, 0, Math.PI * 2); g.fill();
    g.drawImage(img[a], sx, sy, sw, sh, -w / 2, -h * foot, w, h); g.restore(); return true;
  }
  const D = HumanKit.D, orig = {};
  const use = (kind, pick) => { orig[kind] = D[kind]; D[kind] = function (g, d) { const r = pick(d); if (r && spr(g, r[0], d.x, d.y, r[1], r[2])) return; return orig[kind] && orig[kind](g, d); }; };
  const W = k => SPR[k][1];
  const hash = d => Math.abs(Math.round(d.x * 7 + d.y * 13)) % 3;
  use('tree', d => { const k = d.v === 1 ? 'oakB' : hash(d) === 2 ? 'oakB' : 'oak'; return [k, W(k) * (d.s || .72) / .72, (d.flip || 1) < 0]; });
  use('pine', d => { const k = ['pine', 'pineB', 'pineC'][hash(d)]; return [k, W(k) * (d.s || .72) / .72, (d.flip || 1) < 0]; });
  use('bush', d => ['bush', W('bush') * (d.s || .8) / .8, (d.flip || 1) < 0]);
  use('rock', d => { const k = hash(d) ? 'rock' : 'rockB'; return [k, W(k) * (d.s || .8) / .8, (d.flip || 1) < 0]; });
  use('bhouse', d => { const k = d.art || ['thatchA', 'thatchB', 'bluehouse'][hash(d)]; return [k, W(k) * (d.s || .6) / .6, (d.flip || 1) < 0]; });
  use('hall', d => { const k = d.art || ((d.w || 70) >= 64 ? 'hall' : 'bluehouse'); return [k, Math.max(W(k) * .8, (d.w || 70) * (k === 'hall' ? 1.35 : 1.15)), false]; });
  use('tower', d => ['tower', W('tower') * (d.s || 1), false]);
  use('lighthouse', d => ['lighthouse', W('lighthouse') * (d.s || 1), false]);
  use('keep', d => ['castle', W('castle') * (d.s || .6) / .6, false]);
  use('ship', d => d.kind === 'enemy' ? null : ['ship', 160 * (d.s || 1), (d.flip || 1) > 0]);
  for (const k of ['harbor', 'quay', 'wooddock', 'bridge', 'castle', 'field', 'fieldcut', 'haystack', 'sheafA', 'sheafB', 'sheafC'])
    D['hs_' + k] = function (g, d) { spr(g, k, d.x, d.y, d.w || W(k), (d.flip || 1) < 0); };
  // ruộng & rơm (kiểu world70) cho các map Vương Quốc Người
  const prop = PaintedWorld.prop;
  PaintedWorld.prop = function (g, d, theme) {
    if (window.Game && Game.map && Game.map.hand) {
      if (d.k === 'farm70' && spr(g, d.crop === 'green' ? 'fieldcut' : 'field', d.x, d.y + (d.h || 30) * .15, Math.max(70, (d.w || 80) * 1.1), false)) return true;
      if (d.k === 'hay70' && spr(g, hash(d) ? 'haystack' : 'sheafA', d.x, d.y, hash(d) ? 30 * (d.s || 1) : 16, false)) return true;
    }
    return prop.call(this, g, d, theme);
  };
  // ô trụ không được nằm trên nước / trên đường (sau mọi bước dời ô khác)
  const build = Level.build;
  Level.build = function (i) {
    const m = build.call(this, i); if (!m.hand) return m; const PW = CONFIG.pathWidth;
    const bad = (x, y) => HumanKit.wet(m.hand, x, y, 10) || HumanKit.wet(m.hand, x, y - 30, 6) || m.paths.some(p => p.nearest(x, y).perp < PW / 2 + 16) || x < 40 || x > m.W - 40 || y < 100 || y > m.H - 20;
    for (const s of m.spots) { if (!bad(s.x, s.y)) continue; let best = null, bd = 1e9;
      for (let dy = -90; dy <= 90; dy += 6) for (let dx = -90; dx <= 90; dx += 6) { const x = s.x + dx, y = s.y + dy, d = Math.hypot(dx, dy); if (d < bd && !bad(x, y) && m.spots.every(o => o === s || Math.hypot(o.x - x, (o.y - y) * 1.25) > 76)) { bd = d; best = [x, y]; } }
      if (best) { s.x = best[0]; s.y = best[1]; } }
    return m;
  };
  window.HumanArt = { ATL, SPR, spr, img };
})();
