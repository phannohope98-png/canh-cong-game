/* Rev 77 – bộ thiết kế Map 1 (Vương Quốc Người) của chủ dự án gắn vào 6 chặng theo ảnh tổng:
 * Cảng (tàu goblin đổ bộ, nhà cháy) → Làng Nông Dân (nông dân làm ruộng/bỏ chạy, nhà đổ nát) → Cầu Đá Bắc
 * → Phố Canh Gác (đèn đường, nhà cháy sau tường thủng) → Đường Tới Vương Thành → Cổng Vương Thành.
 * human-folk.webp: nông dân 4 hướng × (đứng/đi/làm ruộng), đèn đường 4 hướng × (tắt/sáng), 8 cỏ, 2 tàu goblin.
 * human-ruins.webp: nhà 4 hướng × (đổ nát/cháy/sập). human-dirt.webp: kết cấu đất phủ mặt đường.
 * Màn chọn chặng vùng 1 vẽ lộ trình 1→6 trên chính đảo Vương Quốc Người, từ cảng lên tòa tháp. */
(function () {
  if (!window.HumanKit) return;
  const base = new URL('../assets/sprites/', document.currentScript.src), TAU = Math.PI * 2;
  const FOLK = {"f_dong-dung":[4,4,130,260],"f_nam-dung":[138,4,149,260],"f_tay-dung":[291,4,129,260],"f_bac-dung":[424,4,143,260],"f_dong-di":[571,4,161,260],"f_nam-di":[736,4,141,260],"f_tay-di":[881,4,161,260],"f_bac-di":[1046,4,149,260],"f_nam-lam-ruong":[1199,4,175,260],"f_tay-lam-ruong":[1378,4,245,260],"f_bac-lam-ruong":[1627,4,243,260],"l_dong-tat":[1874,4,147,260],"l_nam-tat":[4,268,91,260],"l_tay-tat":[99,268,157,260],"l_bac-tat":[260,268,94,260],"l_dong-sang":[358,268,147,260],"l_nam-sang":[509,268,92,260],"l_tay-sang":[605,268,169,260],"l_bac-sang":[778,268,102,260],"ship_raider":[884,268,260,258],"f_dong-lam-ruong":[1148,268,260,251],"ship_war":[1412,268,260,245],"g_bui2":[1676,268,260,194],"g_bui4":[4,532,260,193],"g_bui3":[268,532,260,190],"g_bui1":[532,532,260,187],"g_tham2":[796,532,260,167],"g_tham4":[1060,532,260,160],"g_tham3":[1324,532,260,149],"g_tham1":[1588,532,260,140]}, RUIN = {"h_dong_chay":[4,4,278,280],"h_nam_chay":[286,4,255,280],"h_tay_chay":[545,4,278,280],"h_bac_chay":[827,4,263,280],"h_nam_do-nat":[1094,4,280,246],"h_dong_do-nat":[1378,4,280,231],"h_tay_do-nat":[1662,4,280,219],"h_bac_do-nat":[4,288,280,217],"h_nam_sap":[288,288,280,179],"h_dong_sap":[572,288,280,177],"h_tay_sap":[856,288,280,169],"h_bac_sap":[1140,288,280,164]};
  const img = {}, load = n => { const im = new Image(); im.src = new URL(n, base).href; return im; };
  img.f = load('human-folk.webp'); img.r = load('human-ruins.webp'); img.d = load('human-dirt.webp');
  let n = 0; for (const k of ['f', 'r', 'd']) img[k].onload = () => { if (++n === 3 && window.Game && Game.map && Game.map.hand && Game.renderBg) try { Game.renderBg(); } catch (e) { } };
  const ok = k => img[k].complete && img[k].naturalWidth > 0;
  function put(g, atl, key, x, y, w, foot = .92, flip = false, alpha = 1, byH = 0) {
    const T = atl === 'f' ? FOLK : RUIN, f = T[key]; if (!f || !ok(atl)) return false; if (byH) w = byH * f[2] / f[3]; const h = w * f[3] / f[2];
    g.save(); g.translate(x, y); if (flip) g.scale(-1, 1); if (alpha < 1) g.globalAlpha *= alpha; g.drawImage(img[atl], f[0], f[1], f[2], f[3], -w / 2, -h * foot, w, h); g.restore(); return true;
  }
  const D = HumanKit.D;
  D.ruin = (g, d) => { g.fillStyle = 'rgba(30,20,10,.22)'; g.beginPath(); g.ellipse(d.x, d.y - 2, 30 * (d.s || 1), 9 * (d.s || 1), 0, 0, TAU); g.fill(); put(g, 'r', 'h_' + (d.dir || 'nam') + '_' + (d.st || 'do-nat'), d.x, d.y, 70 * (d.s || 1), .82); };
  D.lamp2 = (g, d) => { if (d.lit !== false) { const gr = g.createRadialGradient(d.x, d.y - 30, 2, d.x, d.y - 30, 26); gr.addColorStop(0, 'rgba(255,214,120,.45)'); gr.addColorStop(1, 'rgba(255,214,120,0)'); g.fillStyle = gr; g.fillRect(d.x - 26, d.y - 56, 52, 52); } put(g, 'f', 'l_' + (d.dir || 'nam') + '-' + (d.lit === false ? 'tat' : 'sang'), d.x, d.y, 0, .95, false, 1, 36 * (d.s || 1)); };
  D.tuft = (g, d) => put(g, 'f', 'g_bui' + (d.v || 1), d.x, d.y, 30 * (d.s || 1), .85);
  D.patch = (g, d) => put(g, 'f', 'g_tham' + (d.v || 1), d.x, d.y, 64 * (d.s || 1), .55, false, .75);
  const ship0 = D.ship;
  D.ship = function (g, d) {
    if (d.kind === 'enemy' && ok('f')) { const war = !!(d.docked || d.crew); put(g, 'f', war ? 'ship_war' : 'ship_raider', d.x, d.y, war ? 150 * (d.s || 1) : 96 * Math.min(1.2, (d.s || 1) * 1.6), .86, (d.flip || 1) > 0); return; }
    return ship0(g, d);
  };
  window.HumanRoadTex = (g, res) => { if (!ok('d')) return null; const p = g.createPattern(img.d, 'repeat'); p.setTransform(new DOMMatrix().scale(.42)); return p; };

  /* ---------- vật thể theo cốt truyện từng chặng ---------- */
  const STORY = {
    0: [['ship', 742, 456, { kind: 'enemy', docked: 1, flip: -1, s: 1, free: 1 }], ['ship', 712, 70, { kind: 'enemy', flip: -1, s: .6, free: 1 }],
      ['ruin', 610, 440, { st: 'chay', dir: 'tay', s: .8 }], ['ruin', 470, 110, { st: 'do-nat', dir: 'nam', s: .75 }], ['ruin', 420, 440, { st: 'chay', dir: 'dong', s: .7 }],
      ['lamp2', 470, 300, { dir: 'nam' }], ['lamp2', 616, 292, { dir: 'tay' }], ['lamp2', 640, 360, { dir: 'dong' }], ['lamp2', 200, 360, { dir: 'nam' }]],
    1: [['ruin', 236, 150, { st: 'chay', dir: 'nam', s: .8 }], ['ruin', 470, 170, { st: 'do-nat', dir: 'tay', s: .78 }], ['ruin', 300, 440, { st: 'sap', dir: 'dong', s: .75 }], ['ruin', 120, 300, { st: 'chay', dir: 'dong', s: .72 }],
      ['lamp2', 100, 190, { dir: 'dong', lit: false }], ['lamp2', 360, 110, { dir: 'nam', lit: false }]],
    2: [['ruin', 110, 120, { st: 'do-nat', dir: 'dong', s: .75 }], ['ruin', 640, 400, { st: 'chay', dir: 'tay', s: .78 }], ['ruin', 250, 460, { st: 'sap', dir: 'nam', s: .72 }],
      ['lamp2', 290, 330, { dir: 'dong' }], ['lamp2', 460, 236, { dir: 'tay' }], ['lamp2', 520, 100, { dir: 'nam' }]],
    3: [['ruin', 300, 440, { st: 'chay', dir: 'nam', s: .8 }], ['ruin', 470, 440, { st: 'sap', dir: 'tay', s: .78 }], ['ruin', 40, 260, { st: 'do-nat', dir: 'dong', s: .72 }],
      ['lamp2', 160, 330, { dir: 'dong' }], ['lamp2', 360, 230, { dir: 'nam' }], ['lamp2', 450, 60, { dir: 'nam' }], ['lamp2', 520, 330, { dir: 'tay' }], ['lamp2', 700, 300, { dir: 'tay' }], ['lamp2', 240, 120, { dir: 'nam' }]],
    4: [['ruin', 40, 420, { st: 'sap', dir: 'dong', s: .72 }], ['ruin', 740, 400, { st: 'chay', dir: 'tay', s: .72 }],
      ['lamp2', 120, 360, { dir: 'dong' }], ['lamp2', 420, 250, { dir: 'nam' }], ['lamp2', 610, 100, { dir: 'nam' }], ['lamp2', 260, 110, { dir: 'nam' }]],
    5: [['lamp2', 300, 200, { dir: 'dong' }], ['lamp2', 460, 200, { dir: 'tay' }], ['lamp2', 330, 236, { dir: 'nam' }], ['lamp2', 430, 236, { dir: 'nam' }], ['lamp2', 120, 260, { dir: 'nam' }], ['lamp2', 640, 260, { dir: 'nam' }],
      ['ruin', 40, 440, { st: 'chay', dir: 'dong', s: .7 }], ['ruin', 740, 470, { st: 'sap', dir: 'tay', s: .7 }]]
  };
  const FOLKS = {
    0: [{ w: [[60, 230], [40, 300]] }, { x: 340, y: 140, work: 1, dir: 'dong' }, { x: 312, y: 190, work: 1, dir: 'tay' }],
    1: [{ x: 646, y: 180, work: 1, dir: 'dong' }, { x: 690, y: 160, work: 1, dir: 'nam' }, { x: 540, y: 70, work: 1, dir: 'tay' }, { x: 575, y: 58, work: 1, dir: 'dong' },
      { w: [[760, 120], [600, 110]] }, { w: [[30, 360], [90, 410]] }, { w: [[150, 420], [40, 450]] }],
    2: [{ w: [[60, 160], [140, 130]] }, { x: 700, y: 440, work: 1, dir: 'tay' }, { w: [[600, 440], [700, 420]] }],
    3: [{ w: [[60, 150], [110, 100]] }, { w: [[640, 60], [720, 110]] }],
    4: [{ w: [[60, 300], [120, 290]] }],
    5: []
  };
  const build = Level.build;
  Level.build = function (i) {
    const m = build.call(this, i); if (!m.hand) return m;
    const PW = CONFIG.pathWidth, P = m.paths, near = (x, y) => Math.min(...P.map(p => p.nearest(x, y).perp));
    const underSpot = (x, y, tall) => m.spots.some(s => Math.abs(s.x - x) < 42 && y > s.y - 96 && y < s.y + (tall ? 70 : 16));
    const free = (x, y, r, tall) => x > 6 && x < m.W - 6 && y > 10 && y < m.H + 6 && near(x, y) > PW / 2 + r && (!tall || near(x, y - 30) > PW / 2) && !HumanKit.wet(m.hand, x, y, r * .5) && !underSpot(x, y, tall);
    const add = [];
    for (const [k, x, y, o] of STORY[i] || []) if ((o && o.free) || free(x, y, k === 'ruin' ? 22 : 8, true)) add.push({ k, x, y, hk: true, ...(o || {}) });
    if (i === 0) m.decor = m.decor.filter(d => !(d.k === 'ship' && d.kind === 'enemy'));
    const rnd = ArtKit.seeded(i * 4111 + 77);
    for (let t = 0, c = 0; t < 900 && c < 46; t++) { const x = rnd() * m.W, y = 20 + rnd() * (m.H - 20), patch = rnd() < .45; if (!free(x, y, patch ? 26 : 10, false) || [...m.decor, ...add].some(d => Math.hypot(d.x - x, (d.y - y) * 1.6) < (patch ? 36 : 20))) continue; add.push({ k: patch ? 'patch' : 'tuft', x, y, v: 1 + (rnd() * 4 | 0), s: .75 + rnd() * .5, hk: true }); c++; }
    const patches = add.filter(d => d.k === 'patch').sort((a, b) => a.y - b.y), rest = [...m.decor, ...add.filter(d => d.k !== 'patch')].sort((a, b) => a.y - b.y);
    m.decor = [...patches, ...rest];
    m.folk = (FOLKS[i] || []).map(f => ({ ...f, t: rnd() * 10 })).filter(f => f.w ? f.w.every(([x, y]) => free(x, y, 8, false)) : free(f.x, f.y, 8, false));
    return m;
  };
  function drawFolk(g, m) {
    if (!m.folk || !ok('f')) return; const t = (window.Game && Game.time) || 0;
    for (const f of m.folk) {
      g.fillStyle = 'rgba(30,20,10,.25)';
      if (f.work) { const k = Math.sin((t + f.t) * 3.2), key = 'f_' + f.dir + (k > .2 ? '-lam-ruong' : '-dung'); g.beginPath(); g.ellipse(f.x, f.y, 7, 2.4, 0, 0, TAU); g.fill(); put(g, 'f', key, f.x, f.y, 0, .96, false, 1, 26); continue; }
      const [[x0, y0], [x1, y1]] = f.w, L = Math.hypot(x1 - x0, y1 - y0), per = L / 22, u = (((t + f.t * per) / per) % 2 + 2) % 2, fw = u < 1, q = fw ? u : 2 - u;
      const x = x0 + (x1 - x0) * q, y = y0 + (y1 - y0) * q, dx = (x1 - x0) * (fw ? 1 : -1), dy = (y1 - y0) * (fw ? 1 : -1);
      const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'dong' : 'tay') : (dy > 0 ? 'nam' : 'bac'), step = Math.floor((t + f.t) * 6) % 2;
      g.beginPath(); g.ellipse(x, y, 7, 2.4, 0, 0, TAU); g.fill();
      put(g, 'f', 'f_' + dir + (step ? '-di' : '-dung'), x, y - (step ? 1.2 : 0), 0, .96, false, 1, 26);
    }
  }
  const fx = Effects.draw;
  Effects.draw = function (c) { const r = fx.apply(this, arguments); try { if (window.Game && Game.map && Game.map.folk && Game.state !== 'menu') drawFolk(c, Game.map); } catch (e) { } return r; };

  /* ---------- màn chọn chặng: lộ trình trên đảo ---------- */
  const PINS = [[378, 372], [132, 252], [305, 238], [432, 232], [396, 166], [302, 146]];
  const LINE = [[378, 372], [340, 330], [300, 300], [210, 280], [132, 252], [210, 255], [305, 238], [370, 250], [432, 232], [420, 195], [396, 166], [350, 150], [302, 146]];
  const css = document.createElement('style');
  css.textContent = '.hroute{position:relative;width:min(100%,640px);aspect-ratio:560/460;margin:6px auto;border:3px solid var(--ink);border-radius:14px;overflow:hidden;background:url(' + new URL('worlds55.webp', base).href + ') 52.25% 0/274.3% auto no-repeat}.hroute svg{position:absolute;inset:0;width:100%;height:100%}.hpin{position:absolute;transform:translate(-50%,-100%);display:flex;flex-direction:column;align-items:center;gap:1px;background:none;border:0;padding:0;cursor:pointer}.hpin b{width:30px;height:30px;border-radius:50%;background:#2f5fb8;color:#fff;border:3px solid #fff;box-shadow:0 2px 0 var(--ink),0 0 10px #0008;display:grid;place-items:center;font-weight:900}.hpin.done b{background:#3a9a3a}.hpin.boss b{background:#b8302f}.hpin.locked b{background:#6a6a72}.hpin span{background:#fffbeee8;border:2px solid var(--ink);border-radius:8px;padding:0 6px;font-size:11px;font-weight:800;color:var(--ink);white-space:nowrap}.hpin small{font-size:10px;color:#ffd84a;text-shadow:0 1px 2px #000}';
  document.head.appendChild(css);
  const card = UI.regionCard;
  UI.regionCard = function (r) {
    if (r !== 0) return card.apply(this, arguments);
    const R = CONFIG.regions[0], pins = PINS.map(([x, y], s) => { const L = CONFIG.levels[s], lock = s >= Save.data.unlocked, st = Save.data.stars[s] || 0;
      return '<button class="hpin ' + (lock ? 'locked' : st ? 'done' : '') + ' ' + (L.boss ? 'boss' : '') + '" style="left:' + (x / 5.6) + '%;top:' + (y / 4.6) + '%" data-action="' + (lock ? 'map-locked' : 'level') + '" data-index="' + s + '"><span>' + (s + 1) + '. ' + L.sub + '</span><small>' + ('★'.repeat(st) || '&nbsp;') + '</small><b>' + (s + 1) + '</b></button>'; }).join('');
    const d = LINE.map(([x, y], i) => (i ? 'L' : 'M') + x + ' ' + y).join(' ');
    this.overlay('<div class="ribbon">' + R.name + ' · Từ cảng tới Vương Thành</div><div class="hroute"><svg viewBox="0 0 560 460"><path d="' + d + '" fill="none" stroke="#3a2a1a" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/><path d="' + d + '" fill="none" stroke="#fff1c4" stroke-width="3.4" stroke-dasharray="9 7" stroke-linecap="round"/></svg>' + pins + '</div><p class="rinfo">Quân goblin đổ bộ ở cảng phía nam. Giữ từng chặng trên đường lên Vương Thành.</p><button class="gbtn gray sm" data-action="overlay-ok">Đóng</button>');
    document.getElementById('overlay-panel').classList.add('wide');
  };
  window.HumanArt2 = { FOLK, RUIN, put, STORY, FOLKS };
})();
