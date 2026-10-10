/* MAP 1 — CẢNG BIÊN GIỚI | VƯƠNG QUỐC NGƯỜI
 * Màn thiết kế tay: quân quái vật đổ bộ ở cảng đông nam, qua khu kho hàng, theo đường ven biển,
 * qua trạm gác và cầu đá, rồi lên đường đất về làng – lối ra tây bắc dẫn sang Map 2 (Làng Nông Dân).
 * Dữ liệu tách nhóm: TERRAIN (địa hình), ROUTE (waypoint gameplay), SPOTS (ô xây trụ), PROPS (vật thể).
 * Lớp vẽ nền: biển → nước nông → vách đá → đất liền/bãi cát → suối/thác → đường/đá lát → cầu tàu/cầu đá
 * → vật thể & công trình (theo chiều sâu) → mây → ánh sáng. Ô trụ, quái, hiệu ứng do game vẽ phía trên. */
(function () {
  const LEVEL = 0, K = ArtKit, TAU = Math.PI * 2, INK = '#3a2a1c';

  /* ================= DỮ LIỆU ================= */
  const TERRAIN = {
    // đất liền (theo chiều kim đồng hồ); ngoài đa giác là biển. Cạnh dưới là vách đá.
    land: [[0, 0], [205, 0], [224, 36], [262, 58], [330, 68], [400, 62], [470, 70], [540, 66], [605, 74], [652, 92], [682, 126], [692, 176], [688, 232], [682, 282], [688, 336], [698, 374], [690, 406], [660, 426], [600, 434], [520, 430], [440, 436], [360, 430], [280, 436], [200, 430], [120, 434], [40, 428], [0, 430]],
    cliffFrom: 17, // từ điểm này (theo thứ tự) đến hết là cạnh vách đá phía nam
    stream: [[292, 286], [282, 318], [270, 350], [262, 392], [258, 432]],
    pond: { x: 296, y: 280, rx: 22, ry: 11 },
    pier: { x0: 650, x1: 748, y: 319, half: 19 },        // cầu tàu chính (đường quái đi trên đó)
    pier2: { x0: 676, x1: 752, y: 236, half: 11 },       // cầu tàu phụ cho thuyền nhỏ
    bridge: { x0: 236, x1: 282 },                         // cầu đá trên suối (đoạn đường ven biển)
    cobble: { xMin: 455, xMax: 668 }                      // đoạn đá lát xuyên khu kho hàng
  };
  // Tuyến quái – waypoint gameplay theo đúng thứ tự (SPAWN trên boong tàu địch → EXIT tây bắc)
  const ROUTE = [[744, 414], [738, 372], [726, 322], [690, 319], [648, 319], [600, 318], [550, 292], [502, 252], [452, 240], [414, 264], [402, 312], [374, 366], [322, 392], [258, 396], [192, 392], [146, 360], [130, 300], [150, 246], [182, 200], [162, 150], [112, 120], [56, 100], [-30, 92]];
  // 10 ô xây trụ theo đoạn chiến thuật
  const SPOTS = [
    [655, 262], [622, 410],          // cầu tàu – chặn đổ bộ
    [536, 404], [452, 186], [470, 316], // kho hàng & khúc cua chữ S
    [330, 336], [214, 346],          // trạm gác / cầu đá
    [232, 276], [234, 182], [62, 178]   // đường lên làng
  ];
  // Vật thể đặt có chủ đích (k = loại; x,y = chân vật thể)
  const PROPS = [
    // —— Biển & tàu ——
    { k: 'ship', x: 430, y: 26, s: .45, kind: 'merchant' }, { k: 'ship', x: 575, y: 44, s: .52, kind: 'merchant', flip: -1 },
    { k: 'ship', x: 736, y: 190, s: .62, kind: 'enemy', flip: -1 },             // tàu quái đang áp sát
    { k: 'ship', x: 742, y: 456, s: 1, kind: 'enemy', docked: true, flip: -1 }, // tàu quái đã cập bến (SPAWN)
    { k: 'islet', x: 300, y: 30, s: .8 }, { k: 'islet', x: 650, y: 22, s: .6 }, { k: 'islet', x: 744, y: 96, s: .7 }, { k: 'islet', x: 720, y: 470, s: .6 },
    { k: 'rowboat', x: 716, y: 254 }, { k: 'rowboat', x: 742, y: 222, flip: -1 }, { k: 'rowboat', x: 708, y: 352, flip: -1 },
    // —— Cảng ——
    { k: 'crates', x: 728, y: 232 }, { k: 'barrels', x: 700, y: 234 }, { k: 'sacks', x: 668, y: 374 }, { k: 'net', x: 664, y: 354 },
    { k: 'lantern', x: 636, y: 284 }, { k: 'skullflag', x: 760, y: 392 },
    // —— Khu kho hàng (gần cảng) ——
    { k: 'warehouse', x: 566, y: 226, w: 74, d: 30, h: 40 }, { k: 'warehouse', x: 504, y: 186, w: 58, d: 24, h: 34 },
    
    { k: 'sacks', x: 612, y: 254 }, { k: 'cart', x: 526, y: 222 },
    { k: 'crates', x: 578, y: 426 }, { k: 'barrels', x: 484, y: 424 }, { k: 'sacks', x: 670, y: 420 }, { k: 'spill', x: 588, y: 348 }, { k: 'spill', x: 492, y: 356 },
     { k: 'banner', x: 540, y: 190 },
    // —— Trạm gác ven biển & cầu đá ——
    { k: 'watchtower', x: 424, y: 420 }, { k: 'banner', x: 390, y: 418 }, { k: 'lantern', x: 300, y: 429 }, { k: 'signpost', x: 220, y: 430, text: 'Cảng' },
    { k: 'fence70', x: 436, y: 380, x2: 452, y2: 420 },
    // —— Làng (xa khu bốc dỡ) ——
    { k: 'house', x: 46, y: 250, s: .6, row: 'env-forest' }, { k: 'house', x: 64, y: 330, s: .62, row: 'env-desert' }, { k: 'house', x: 38, y: 410, s: .58, row: 'env-forest' },
    { k: 'house', x: 106, y: 424, s: .56, row: 'env-desert' }, { k: 'well', x: 96, y: 372 }, { k: 'garden', x: 30, y: 290 }, { k: 'flowerbed', x: 92, y: 262 },
    { k: 'cart', x: 92, y: 300, hay: true }, { k: 'lantern', x: 98, y: 352 },
    // —— Đồng lúa mì, trang trại, chuồng gia súc (gần lối ra đất liền) ——
    { k: 'farm70', x: 322, y: 128, w: 92, h: 36, crop: 'wheat', prop: true }, { k: 'farm70', x: 330, y: 182, w: 80, h: 30, crop: 'wheat', prop: true },
    { k: 'garden', x: 292, y: 94 },
    { k: 'fence70', x: 272, y: 208, x2: 372, y2: 208, prop: true }, { k: 'hay70', x: 386, y: 116, s: 1 }, { k: 'hay70', x: 382, y: 192, s: .9 },
    { k: 'pen', x: 380, y: 160 }, { k: 'sheep70', x: 372, y: 156 }, { k: 'sheep70', x: 390, y: 162, flip: -1 }, { k: 'sheep70', x: 378, y: 168 },
    { k: 'cart', x: 362, y: 230, hay: true }, { k: 'house', x: 526, y: 104, s: .6, row: 'env-forest' },
    // —— Lối ra tây bắc ——
    { k: 'gate', x: 84, y: 112 }, { k: 'signpost', x: 132, y: 84, text: 'Làng Nông Dân' },
    // —— Thiên nhiên đóng khung ——
    { k: 'pine', x: 14, y: 46, s: .82 }, { k: 'tree', x: 150, y: 44, s: .8 }, { k: 'pine', x: 188, y: 30, s: .74 }, { k: 'tree', x: 22, y: 56, s: .66 }, { k: 'bush', x: 120, y: 56, s: .8 },
    { k: 'tree', x: 300, y: 238, s: .7 }, { k: 'bush', x: 348, y: 226, s: .66 },
    { k: 'tree', x: 14, y: 172, s: .78 }, { k: 'pine', x: 12, y: 360, s: .8 }, { k: 'bush', x: 146, y: 432, s: .7 }, { k: 'tree', x: 172, y: 438, s: .7 },
    { k: 'rock', x: 352, y: 80, s: .7 }, { k: 'rock', x: 470, y: 78, s: .6 }, { k: 'rock', x: 610, y: 86, s: .7 }, { k: 'rock', x: 676, y: 160, s: .7 }, { k: 'rock', x: 640, y: 428, s: .6 },
    { k: 'bush', x: 560, y: 92, s: .7 }, { k: 'bush', x: 400, y: 84, s: .66 }, { k: 'tree', x: 620, y: 132, s: .74 }, { k: 'pine', x: 655, y: 120, s: .7 },
    { k: 'seaweed', x: 300, y: 48 }, { k: 'seaweed', x: 640, y: 34 }, { k: 'seaweed', x: 700, y: 448 }
  ];
  window.Map1Harbor = { TERRAIN, ROUTE, SPOTS, PROPS };

  /* ================= GẮN DỮ LIỆU VÀO MÀN ================= */
  const L = CONFIG.levels[LEVEL];
  L.sub = 'Cảng Biên Giới'; L.spots = SPOTS.length; L.harbor = true;
  L.story = 'Quân đoàn quái vật từ biển cập bến cảng phía đông nam. Chúng đổ bộ qua cầu tàu, tràn qua khu kho hàng và con đường ven biển để tiến về làng. Hãy xây trụ dọc tuyến đường và chặn đứng chúng trước khi chúng thoát ra cổng tây bắc!';
  L.ipaths = [ROUTE.map(p => p.slice())];
  L.feat.props = []; L.feat.rivers = []; L.feat.lakes = [];
  L.route = { ...L.route, lanes: 1, entry: ROUTE[0], exit: ROUTE[ROUTE.length - 1] };
  if (CONFIG.levels[1]) CONFIG.levels[1].sub = 'Làng Nông Dân';

  const build = Level.build;
  Level.build = function (i) {
    const m = build.call(this, i); if (i !== LEVEL) return m;
    m.harbor = true; m.spots = SPOTS.map(([x, y], id) => ({ x, y, id }));
    m.decor = PROPS.map(p => ({ s: 1, flip: 1, v: .5, ...p })).sort((a, b) => a.y - b.y);
    return m;
  };

  /* ================= TIỆN ÍCH VẼ ================= */
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; };
  const poly = (g, pts) => { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); };
  const smoothPoly = (g, pts, closed) => { g.beginPath(); const n = pts.length; if (closed) { const a = pts[n - 1], b = pts[0]; g.moveTo((a[0] + b[0]) / 2, (a[1] + b[1]) / 2); for (let i = 0; i < n; i++) { const p = pts[i], q = pts[(i + 1) % n]; g.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2); } g.closePath(); } else { g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < n - 1; i++) { const p = pts[i], q = pts[i + 1]; g.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2); } g.lineTo(pts[n - 1][0], pts[n - 1][1]); } };
  const ink = (g, w) => { g.strokeStyle = INK; g.lineWidth = w || 1.4; g.lineJoin = g.lineCap = 'round'; };
  const shadow = (g, x, y, rx, ry, a) => { g.fillStyle = `rgba(30,20,10,${a || .28})`; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU); g.fill(); };
  const pat = (g, theme, n, size, res, rot) => { const p = window.Terrain69 && Terrain69.pattern(g, theme, n, size, res); if (p && rot) p.setTransform(new DOMMatrix().rotate(rot).scale(1 / res)); return p; };
  const shade = (c, k) => K.shade(c, k);

  /* ================= VẬT THỂ VẼ TAY ================= */
  const DRAW = {
    ship(g, d) {
      const s = d.s || 1, enemy = d.kind === 'enemy'; g.save(); g.translate(d.x, d.y); g.scale(s * (d.flip || 1), s);
      g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 2.4; g.beginPath(); g.ellipse(0, -2, 64, 7, 0, 0, Math.PI); g.stroke();
      shadow(g, 0, -2, 60, 8, .22);
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
        g.fillStyle = enemy ? '#c93030' : '#3a6fc4'; ink(g, 1.2); g.beginPath(); g.moveTo(mx, -26 - mh); g.lineTo(mx + 14, -22 - mh); g.lineTo(mx, -18 - mh); g.closePath(); g.fill(); g.stroke();
      }
      ink(g, 1.2); for (const [a, b] of [[-62, -40], [70, -38]]) { g.beginPath(); g.moveTo(a, b); g.lineTo(-14, -122); g.stroke(); }
      if (d.docked && window.ArtStylized) { for (const [px, id] of [[-30, 'goblin'], [-6, 'skeleton'], [40, 'goblin']]) { g.save(); g.translate(px, -26); if ((d.flip || 1) < 0) g.scale(-1, 1); ArtStylized.draw(g, id, { w: -1, a: -1, t: px }, 22); g.restore(); } }
      g.restore();
    },
    islet(g, d) { const s = d.s || 1; g.save(); g.translate(d.x, d.y); g.scale(s, s); g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 2; g.beginPath(); g.ellipse(0, 0, 24, 6, 0, 0, TAU); g.stroke(); ink(g, 1.6); g.fillStyle = '#9a9384'; g.beginPath(); g.moveTo(-20, 0); g.lineTo(-14, -14); g.lineTo(-2, -22); g.lineTo(10, -16); g.lineTo(20, 0); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#b8b1a0'; g.beginPath(); g.moveTo(-12, -12); g.lineTo(-2, -20); g.lineTo(4, -10); g.closePath(); g.fill(); g.fillStyle = '#6aa34a'; g.beginPath(); g.ellipse(-3, -20, 7, 3, 0, 0, TAU); g.fill(); g.restore(); },
    seaweed(g, d) { g.save(); g.translate(d.x, d.y); g.strokeStyle = '#2f7d5a'; g.lineWidth = 2; for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(i * 3, 0); g.quadraticCurveTo(i * 3 + 4, -5, i * 3, -9); g.stroke(); } g.restore(); },
    rowboat(g, d) { g.save(); g.translate(d.x, d.y); g.scale(d.flip || 1, 1); g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 1.6; g.beginPath(); g.ellipse(0, 1, 17, 4, 0, 0, TAU); g.stroke(); ink(g, 1.5); g.fillStyle = '#8a5a34'; g.beginPath(); g.moveTo(-16, -5); g.quadraticCurveTo(0, 6, 16, -6); g.quadraticCurveTo(0, -2, -16, -5); g.fill(); g.stroke(); g.fillStyle = '#b7834e'; g.beginPath(); g.ellipse(0, -4, 13, 2.6, 0, 0, TAU); g.fill(); g.strokeStyle = '#6b4426'; g.lineWidth = 1.4; for (const x of [-5, 5]) { g.beginPath(); g.moveTo(x, -6); g.lineTo(x, -2); g.stroke(); } g.strokeStyle = '#c9a15a'; g.beginPath(); g.moveTo(-8, -4); g.lineTo(-20, 2); g.stroke(); g.restore(); },
    crates(g, d) { g.save(); g.translate(d.x, d.y); shadow(g, 2, 1, 15, 4); const box = (x, y, w, h) => { ink(g, 1.3); g.fillStyle = '#b07a44'; g.fillRect(x, y - h, w, h); g.strokeRect(x, y - h, w, h); g.strokeStyle = '#7a5230'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y - h); g.lineTo(x + w, y); g.moveTo(x + w, y - h); g.lineTo(x, y); g.stroke(); g.fillStyle = '#c9925a'; g.fillRect(x, y - h, w, 2); }; box(-12, 0, 11, 10); box(0, 0, 12, 11); box(-6, -10, 11, 9); g.restore(); },
    barrels(g, d) { g.save(); g.translate(d.x, d.y); shadow(g, 1, 1, 13, 4); for (const [x, y] of [[-6, 0], [6, 0], [0, -1.5]]) { ink(g, 1.3); g.fillStyle = '#9a6a3c'; g.beginPath(); g.roundRect(x - 5, y - 13, 10, 13, 3); g.fill(); g.stroke(); g.strokeStyle = '#4b4b52'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x - 5, y - 4); g.lineTo(x + 5, y - 4); g.moveTo(x - 5, y - 9); g.lineTo(x + 5, y - 9); g.stroke(); g.fillStyle = '#c08a52'; g.beginPath(); g.ellipse(x, y - 13, 4.5, 1.6, 0, 0, TAU); g.fill(); } g.restore(); },
    sacks(g, d) { g.save(); g.translate(d.x, d.y); shadow(g, 1, 1, 14, 4); for (const [x, y, r] of [[-7, 0, 6], [6, 0, 6.5], [0, -6, 5.5]]) { ink(g, 1.2); g.fillStyle = '#d8c08e'; g.beginPath(); g.moveTo(x - r, y); g.quadraticCurveTo(x - r - 1, y - r * 1.6, x - 2, y - r * 1.7); g.lineTo(x + 2, y - r * 1.7); g.quadraticCurveTo(x + r + 1, y - r * 1.6, x + r, y); g.closePath(); g.fill(); g.stroke(); g.strokeStyle = '#a88f5c'; g.beginPath(); g.moveTo(x - 2, y - r * 1.55); g.lineTo(x + 2, y - r * 1.55); g.stroke(); } g.restore(); },
    spill(g, d) { g.save(); g.translate(d.x, d.y); g.fillStyle = 'rgba(232,200,110,.9)'; for (let i = 0; i < 14; i++) { g.beginPath(); g.ellipse(Math.cos(i * 2.3) * (4 + i), Math.sin(i * 1.7) * 3, 1.6, 1, 0, 0, TAU); g.fill(); } g.rotate(.5); ink(g, 1.2); g.fillStyle = '#d8c08e'; g.beginPath(); g.ellipse(-6, -3, 6, 4, 0, 0, TAU); g.fill(); g.stroke(); g.rotate(-.9); g.fillStyle = '#b07a44'; g.fillRect(6, -10, 10, 8); g.strokeRect(6, -10, 10, 8); g.restore(); },
    net(g, d) { g.save(); g.translate(d.x, d.y); g.fillStyle = 'rgba(110,90,60,.25)'; g.beginPath(); g.ellipse(0, 0, 14, 5, 0, 0, TAU); g.fill(); g.strokeStyle = '#6c5a3e'; g.lineWidth = .9; for (let i = -12; i <= 12; i += 4) { g.beginPath(); g.moveTo(i, -4); g.lineTo(i + 4, 4); g.moveTo(i + 4, -4); g.lineTo(i, 4); g.stroke(); } ink(g, 1.4); g.beginPath(); g.ellipse(0, 0, 14, 5, 0, 0, TAU); g.stroke(); g.fillStyle = '#e8d6a8'; for (const x of [-10, 2, 11]) { g.beginPath(); g.arc(x, -4, 1.6, 0, TAU); g.fill(); } g.restore(); },
    lantern(g, d) { g.save(); g.translate(d.x, d.y); shadow(g, 0, 0, 5, 2); ink(g, 3); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -24); g.lineTo(6, -24); g.stroke(); g.strokeStyle = '#7a5230'; g.lineWidth = 1.6; g.stroke(); g.fillStyle = 'rgba(255,214,110,.35)'; g.beginPath(); g.arc(6, -18, 7, 0, TAU); g.fill(); ink(g, 1.2); g.fillStyle = '#ffd36a'; g.beginPath(); g.roundRect(3.5, -22, 5, 7, 1.5); g.fill(); g.stroke(); g.restore(); },
    banner(g, d) { g.save(); g.translate(d.x, d.y); shadow(g, 0, 0, 5, 2); ink(g, 3); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -34); g.stroke(); g.strokeStyle = '#8a6036'; g.lineWidth = 1.6; g.stroke(); ink(g, 1.3); g.fillStyle = '#2f5fb8'; g.beginPath(); g.moveTo(1, -33); g.lineTo(14, -33); g.lineTo(14, -18); g.lineTo(7.5, -21); g.lineTo(1, -18); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#f1cf5a'; g.beginPath(); g.moveTo(7.5, -30); g.lineTo(9.5, -26); g.lineTo(7.5, -23); g.lineTo(5.5, -26); g.closePath(); g.fill(); g.restore(); },
    skullflag(g, d) { g.save(); g.translate(d.x, d.y); ink(g, 3); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -40); g.stroke(); ink(g, 1.3); g.fillStyle = '#2b2632'; g.beginPath(); g.moveTo(-1, -39); g.lineTo(-20, -36); g.lineTo(-17, -28); g.lineTo(-21, -21); g.lineTo(-1, -23); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#efe6cf'; g.beginPath(); g.arc(-10, -30, 3.4, 0, TAU); g.fill(); g.restore(); },
    signpost(g, d) { g.save(); g.translate(d.x, d.y); shadow(g, 0, 0, 6, 2); ink(g, 3.2); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -26); g.stroke(); g.strokeStyle = '#9a6a3c'; g.lineWidth = 1.8; g.stroke(); ink(g, 1.3); g.fillStyle = '#c9925a'; g.beginPath(); g.moveTo(-16, -25); g.lineTo(14, -25); g.lineTo(19, -20.5); g.lineTo(14, -16); g.lineTo(-16, -16); g.closePath(); g.fill(); g.stroke(); g.fillStyle = INK; g.font = 'bold ' + ((d.text || '').length > 8 ? 4 : 5.4) + 'px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(d.text || '', 0, -20.5); g.restore(); },
    cart(g, d) { g.save(); g.translate(d.x, d.y); shadow(g, 0, 1, 16, 4); ink(g, 1.4); g.strokeStyle = INK; g.beginPath(); g.moveTo(10, -6); g.lineTo(24, -2); g.stroke(); g.fillStyle = '#9a6a3c'; g.beginPath(); g.moveTo(-14, -14); g.lineTo(12, -14); g.lineTo(10, -5); g.lineTo(-12, -5); g.closePath(); g.fill(); g.stroke(); if (d.hay) { g.fillStyle = '#e7c158'; g.beginPath(); g.moveTo(-13, -14); g.quadraticCurveTo(-1, -26, 11, -14); g.closePath(); g.fill(); g.stroke(); } else { g.fillStyle = '#d8c08e'; for (const x of [-7, 2]) { g.beginPath(); g.ellipse(x, -16, 5, 4, 0, 0, TAU); g.fill(); g.stroke(); } } g.fillStyle = '#5b4030'; for (const x of [-8, 7]) { g.beginPath(); g.arc(x, -3, 4, 0, TAU); g.fill(); g.stroke(); g.fillStyle = '#b08a5a'; g.beginPath(); g.arc(x, -3, 1.2, 0, TAU); g.fill(); g.fillStyle = '#5b4030'; } g.restore(); },
    well(g, d) { g.save(); g.translate(d.x, d.y); shadow(g, 0, 1, 12, 4); ink(g, 1.4); g.fillStyle = '#a9a39a'; g.beginPath(); g.ellipse(0, -4, 10, 4, 0, 0, TAU); g.fill(); g.stroke(); g.fillRect(-10, -4, 20, 4); g.beginPath(); g.moveTo(-10, -4); g.lineTo(-10, 0); g.moveTo(10, -4); g.lineTo(10, 0); g.stroke(); g.beginPath(); g.ellipse(0, 0, 10, 4, 0, 0, Math.PI); g.stroke(); g.fillStyle = '#2f4f66'; g.beginPath(); g.ellipse(0, -4, 7, 2.6, 0, 0, TAU); g.fill(); ink(g, 2.4); g.beginPath(); g.moveTo(-8, -4); g.lineTo(-8, -22); g.moveTo(8, -4); g.lineTo(8, -22); g.stroke(); ink(g, 1.4); g.fillStyle = '#a8462e'; g.beginPath(); g.moveTo(-13, -20); g.lineTo(0, -29); g.lineTo(13, -20); g.closePath(); g.fill(); g.stroke(); g.restore(); },
    garden(g, d) { g.save(); g.translate(d.x, d.y); g.fillStyle = '#8a6440'; ink(g, 1.3); g.beginPath(); g.roundRect(-18, -12, 36, 24, 4); g.fill(); g.stroke(); for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) { const x = -13 + c * 6.5, y = -6 + r * 7; g.fillStyle = r === 1 ? '#e57a3a' : '#7dbb45'; g.beginPath(); g.arc(x, y, 2.4, 0, TAU); g.fill(); g.fillStyle = '#4f8a2a'; g.beginPath(); g.arc(x - .6, y - .8, 1, 0, TAU); g.fill(); } g.restore(); },
    flowerbed(g, d) { g.save(); g.translate(d.x, d.y); for (let i = 0; i < 9; i++) { const x = (i - 4) * 3, y = Math.sin(i) * 2; g.fillStyle = '#4f8a2a'; g.beginPath(); g.arc(x, y, 2.4, 0, TAU); g.fill(); g.fillStyle = ['#ff8fb0', '#ffe066', '#ffffff'][i % 3]; g.beginPath(); g.arc(x, y - 1.6, 1.3, 0, TAU); g.fill(); } g.restore(); },
    pen(g, d) { g.save(); g.translate(d.x, d.y); g.fillStyle = 'rgba(160,130,80,.35)'; g.beginPath(); g.ellipse(0, 0, 24, 11, 0, 0, TAU); g.fill(); g.restore(); PaintedWorld.prop(g, { k: 'fence70', x: d.x - 24, y: d.y - 9, x2: d.x + 24, y2: d.y - 9 }, 'castle'); },
    gate(g, d) { g.save(); g.translate(d.x, d.y); for (const [px, py] of [[-10, -32], [14, 34]]) { shadow(g, px, py, 6, 2); ink(g, 4.4); g.beginPath(); g.moveTo(px, py); g.lineTo(px, py - 40); g.stroke(); g.strokeStyle = '#8a5a34'; g.lineWidth = 3; g.stroke(); } ink(g, 4); g.beginPath(); g.moveTo(-14, -70); g.lineTo(18, -4); g.stroke(); g.strokeStyle = '#a8763e'; g.lineWidth = 2.6; g.stroke(); ink(g, 1.2); g.fillStyle = '#2f5fb8'; g.beginPath(); g.moveTo(-2, -50); g.lineTo(6, -32); g.lineTo(2, -24); g.lineTo(-4, -34); g.closePath(); g.fill(); g.stroke(); g.restore(); },
    watchtower(g, d) {
      g.save(); g.translate(d.x, d.y); shadow(g, 0, 1, 20, 6);
      for (const x of [-11, 11]) { ink(g, 3.6); g.beginPath(); g.moveTo(x, 0); g.lineTo(x * .8, -38); g.stroke(); g.strokeStyle = '#8a5a34'; g.lineWidth = 2.2; g.stroke(); }
      ink(g, 1.4); g.strokeStyle = '#6b4426'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(-10, -4); g.lineTo(9, -30); g.moveTo(10, -4); g.lineTo(-9, -30); g.stroke();
      ink(g, 1.5); g.fillStyle = '#a8763e'; g.beginPath(); g.rect(-15, -48, 30, 11); g.fill(); g.stroke(); g.strokeStyle = '#7a5230'; g.lineWidth = 1; for (let x = -10; x < 15; x += 5) { g.beginPath(); g.moveTo(x, -48); g.lineTo(x, -37); g.stroke(); }
      ink(g, 1.5); g.fillStyle = '#b4452e'; g.beginPath(); g.moveTo(-19, -48); g.lineTo(0, -66); g.lineTo(19, -48); g.closePath(); g.fill(); g.stroke(); g.strokeStyle = '#8a3220'; g.lineWidth = 1; g.beginPath(); g.moveTo(-9, -48); g.lineTo(0, -60); g.moveTo(9, -48); g.lineTo(0, -60); g.stroke();
      ink(g, 2); g.beginPath(); g.moveTo(0, -66); g.lineTo(0, -80); g.stroke(); ink(g, 1.1); g.fillStyle = '#2f5fb8'; g.beginPath(); g.moveTo(0, -80); g.lineTo(11, -77); g.lineTo(0, -73); g.closePath(); g.fill(); g.stroke();
      g.restore();
    },
    warehouse(g, d) {
      const { w, h } = d, dep = d.d || 26, rh = h * .62; g.save(); g.translate(d.x, d.y);
      g.fillStyle = 'rgba(30,20,10,.28)'; g.beginPath(); g.moveTo(-w / 2 - 2, 2); g.lineTo(w / 2 + dep * .7, 2); g.lineTo(w / 2 + dep * .7 + 8, -dep * .45); g.lineTo(-w / 2 + 6, -4); g.closePath(); g.fill();
      // tường hông (phải)
      ink(g, 1.6); g.fillStyle = '#7d5634'; g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2 + dep * .6, -dep * .5); g.lineTo(w / 2 + dep * .6, -dep * .5 - h); g.lineTo(w / 2, -h); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = '#8f8a80'; g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2 + dep * .6, -dep * .5); g.lineTo(w / 2 + dep * .6, -dep * .5 - h * .32); g.lineTo(w / 2, -h * .32); g.closePath(); g.fill(); g.stroke();
      // tường trước: chân đá + ván gỗ
      g.fillStyle = '#b07e4c'; g.fillRect(-w / 2, -h, w, h); g.strokeStyle = '#8a6036'; g.lineWidth = 1; for (let x = -w / 2 + 5; x < w / 2; x += 5) { g.beginPath(); g.moveTo(x, -h); g.lineTo(x, -h * .32); g.stroke(); }
      g.fillStyle = '#a9a398'; g.fillRect(-w / 2, -h * .32, w, h * .32); g.strokeStyle = '#7d776d'; for (let r = 0; r < 2; r++) for (let x = -w / 2 + (r ? 4 : 0); x < w / 2; x += 8) { g.strokeRect(x, -h * .32 + r * h * .16, 8, h * .16); }
      ink(g, 1.6); g.strokeRect(-w / 2, -h, w, h);
      // cửa lớn
      const dw = Math.min(22, w * .32); g.fillStyle = '#5e3c22'; g.beginPath(); g.moveTo(-dw / 2, 0); g.lineTo(-dw / 2, -h * .62); g.quadraticCurveTo(0, -h * .8, dw / 2, -h * .62); g.lineTo(dw / 2, 0); g.closePath(); g.fill(); g.stroke(); g.strokeStyle = '#3b2616'; g.lineWidth = 1; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -h * .7); g.moveTo(-dw / 2, -h * .3); g.lineTo(dw / 2, -h * .3); g.stroke();
      g.fillStyle = '#ffe9a6'; ink(g, 1.1); for (const x of [-w * .34, w * .34]) { g.beginPath(); g.rect(x - 4, -h * .78, 8, 7); g.fill(); g.stroke(); }
      // mái ngói nâu
      ink(g, 1.7); g.fillStyle = '#7a3f26'; g.beginPath(); g.moveTo(w / 2 + 3, -h); g.lineTo(w / 2 + dep * .6 + 3, -dep * .5 - h); g.lineTo(w / 2 + dep * .6 - 2, -dep * .5 - h - rh); g.lineTo(w / 2 - 2, -h - rh); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = '#9a5232'; g.beginPath(); g.moveTo(-w / 2 - 5, -h + 2); g.lineTo(w / 2 + 5, -h + 2); g.lineTo(w / 2 - 2, -h - rh); g.lineTo(-w / 2 + 2, -h - rh); g.closePath(); g.fill(); g.stroke();
      g.strokeStyle = '#7a3f26'; g.lineWidth = 1; for (let k = 1; k < 4; k++) { const y = -h + 2 - rh * k / 4; g.beginPath(); g.moveTo(-w / 2 - 5 + 7 * k / 4, y); g.lineTo(w / 2 + 5 - 7 * k / 4, y); g.stroke(); }
      for (let x = -w / 2; x < w / 2; x += 6) { g.beginPath(); g.moveTo(x, -h + 2); g.lineTo(x + 2, -h - rh); g.stroke(); }
      ink(g, 2.2); g.beginPath(); g.moveTo(-w / 2 + 2, -h - rh); g.lineTo(w / 2 - 2, -h - rh); g.lineTo(w / 2 + dep * .6 - 2, -dep * .5 - h - rh); g.stroke();
      g.restore();
    },
    house(g, d) { if (!PaintedWorld.blit(g, d.row || 'env-forest', 7, d.x, d.y + 2, 80 * (d.s || .6), (d.flip || 1) < 0)) return; }
  };
  const oldProp = PaintedWorld.prop;
  PaintedWorld.prop = function (g, d, theme) { if (Game.map && Game.map.harbor || d.harbor70) { const f = DRAW[d.k]; if (f) { f(g, d); return true; } } return oldProp.call(this, g, d, theme); };
  for (const p of PROPS) if (DRAW[p.k]) p.harbor70 = true;

  /* ================= VẼ NỀN BẢN ĐỒ ================= */
  function render(m, res) {
    const W = m.W, H = m.H, PW = CONFIG.pathWidth, T = TERRAIN, c = mk(W * res, H * res), g = c.getContext('2d'); g.scale(res, res); g.lineJoin = g.lineCap = 'round';
    const rnd = K.seeded(4242), land = T.land, coast = land.slice(1, T.cliffFrom + 1), cliffEdge = land.slice(T.cliffFrom - 1);
    // 1) biển
    g.fillStyle = pat(g, 'castle', 2, 150, res) || '#3aa7c4'; g.fillRect(0, 0, W, H);
    let gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(16,70,130,.42)'); gr.addColorStop(.35, 'rgba(16,70,130,.1)'); gr.addColorStop(1, 'rgba(16,70,130,.22)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    gr = g.createLinearGradient(0, 0, 0, 34); gr.addColorStop(0, 'rgba(235,248,255,.6)'); gr.addColorStop(1, 'rgba(235,248,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, 34);
    g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 1.4; for (let i = 0; i < 70; i++) { const x = rnd() * W, y = rnd() * H, w = 5 + rnd() * 9; g.beginPath(); g.moveTo(x - w, y); g.quadraticCurveTo(x, y - 3, x + w, y); g.stroke(); }
    // 2) nước nông quanh bờ
    g.save(); smoothPoly(g, land, true); g.strokeStyle = 'rgba(140,230,225,.35)'; g.lineWidth = 46; g.stroke(); g.strokeStyle = 'rgba(170,240,232,.45)'; g.lineWidth = 22; g.stroke(); g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 5; g.stroke(); g.restore();
    // 3) vách đá phía nam (nhiều tầng)
    const face = (pts, dy, col) => { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); for (let i = pts.length - 1; i >= 0; i--) g.lineTo(pts[i][0], pts[i][1] + dy + (i % 2) * 4); g.closePath(); g.fillStyle = col; g.fill(); ink(g, 1.8); g.stroke(); };
    face(cliffEdge, 34, '#7f725f'); face(cliffEdge, 20, '#9d8f78');
    g.strokeStyle = '#6d614f'; g.lineWidth = 1; for (let i = 0; i < cliffEdge.length - 1; i++) { const [x0, y0] = cliffEdge[i], [x1] = cliffEdge[i + 1]; for (let x = Math.min(x0, x1); x < Math.max(x0, x1); x += 11 + rnd() * 8) { g.beginPath(); g.moveTo(x, y0 + 3); g.lineTo(x + 2, y0 + 17); g.stroke(); } }
    g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 3; g.beginPath(); cliffEdge.forEach(([x, y], i) => i ? g.lineTo(x, y + 37) : g.moveTo(x, y + 37)); g.stroke();
    // 4) đất liền + bãi cát
    g.save(); smoothPoly(g, land, true); g.clip();
    const groundC = World70.ground(m, res); g.drawImage(groundC, 0, 0, W, H);
    g.globalAlpha = .55; smoothPoly(g, coast, false); g.strokeStyle = '#efd9a0'; g.lineWidth = 52; g.stroke(); g.globalAlpha = 1; g.lineWidth = 34; g.strokeStyle = '#f0dba4'; g.stroke(); g.lineWidth = 12; g.strokeStyle = '#d9bd7c'; g.stroke();
    for (let i = 0; i < 90; i++) { const p = coast[(rnd() * (coast.length - 1)) | 0], q = coast[Math.min(coast.length - 1, ((rnd() * (coast.length - 1)) | 0) + 1)], t = rnd(), x = p[0] + (q[0] - p[0]) * t + (rnd() - .5) * 20, y = p[1] + (q[1] - p[1]) * t + (rnd() - .5) * 16; g.fillStyle = rnd() < .5 ? 'rgba(200,170,110,.5)' : 'rgba(255,248,220,.6)'; g.beginPath(); g.arc(x, y, .8 + rnd(), 0, TAU); g.fill(); }
    smoothPoly(g, cliffEdge, false); g.strokeStyle = '#4f8a2a'; g.lineWidth = 6; g.stroke();
    g.restore();
    smoothPoly(g, land, true); ink(g, 1.6); g.strokeStyle = 'rgba(90,70,40,.55)'; g.stroke();
    // 5) ao + suối + thác
    const P = T.pond; g.fillStyle = '#4c7a3a'; g.beginPath(); g.ellipse(P.x, P.y + 1, P.rx + 4, P.ry + 3, 0, 0, TAU); g.fill(); g.fillStyle = pat(g, 'castle', 2, 90, res) || '#4ab0c8'; g.beginPath(); g.ellipse(P.x, P.y, P.rx, P.ry, 0, 0, TAU); g.fill();
    smoothPoly(g, T.stream, false); g.strokeStyle = '#4c7a3a'; g.lineWidth = 20; g.stroke(); g.strokeStyle = pat(g, 'castle', 2, 90, res) || '#4ab0c8'; g.lineWidth = 13; g.stroke(); g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 1.4; g.setLineDash([5, 7]); g.stroke(); g.setLineDash([]);
    const [fx, fy] = T.stream[T.stream.length - 1]; gr = g.createLinearGradient(0, fy, 0, fy + 40); gr.addColorStop(0, '#bfeef5'); gr.addColorStop(1, '#ffffff'); g.fillStyle = gr; g.beginPath(); g.moveTo(fx - 7, fy - 2); g.lineTo(fx + 7, fy - 2); g.lineTo(fx + 9, fy + 36); g.lineTo(fx - 9, fy + 36); g.closePath(); g.fill(); g.strokeStyle = 'rgba(120,200,220,.8)'; g.lineWidth = 1; for (const k of [-4, 0, 4]) { g.beginPath(); g.moveTo(fx + k, fy); g.lineTo(fx + k * 1.2, fy + 34); g.stroke(); }
    g.fillStyle = 'rgba(255,255,255,.85)'; for (let i = 0; i < 7; i++) { g.beginPath(); g.arc(fx + (i - 3) * 4, fy + 38 + Math.sin(i) * 2, 3 + (i % 2), 0, TAU); g.fill(); }
    // 6) đường (đất/cát) – phần trên đất liền
    const path = m.paths[0], q = {}, landPts = [], allPts = []; for (let d = 0; d <= path.length; d += 4) { path.pointAt(d, q); allPts.push([q.x, q.y]); if (q.x < T.pier.x0 + 6) landPts.push([q.x, q.y]); }
    const strokePts = (pts, w, col) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); };
    for (let k = 0; k < 5; k++) { g.globalAlpha = .08; strokePts(landPts, PW + 32 - k * 6, '#b48a4c'); } g.globalAlpha = 1;
    strokePts(landPts, PW + 3, '#9c6c30'); strokePts(landPts, PW, '#d3a454'); strokePts(landPts, PW - 7, '#ecc874'); g.globalAlpha = .5; strokePts(landPts, PW * .5, '#f6dc98'); g.globalAlpha = 1;
    g.strokeStyle = 'rgba(170,120,60,.35)'; g.lineWidth = 2; for (const off of [-.2, .2]) { g.beginPath(); let on = false; for (let d = 0; d <= path.length; d += 5) { path.pointAt(d, q); if (q.x > T.cobble.xMin && q.x < T.cobble.xMax + 10) { on = false; continue; } if (q.x > T.pier.x0) { on = false; continue; } const x = q.x + q.nx * PW * off, y = q.y + q.ny * PW * off; on ? g.lineTo(x, y) : g.moveTo(x, y); on = true; } g.stroke(); }
    // đá lát qua khu kho
    const cob = allPts.filter(([x]) => x > T.cobble.xMin && x < T.cobble.xMax);
    if (cob.length > 2) { g.save(); strokePts(cob, PW - 6, pat(g, 'castle', 1, 60, res) || '#c9bfa8'); g.globalAlpha = .18; strokePts(cob, PW - 6, '#e8d6a8'); g.restore(); }
    // 7) cầu tàu
    const pier = (pp, rot) => { const { x0, x1, y, half } = pp; g.fillStyle = 'rgba(20,40,60,.35)'; g.fillRect(x0, y - half + 4, x1 - x0, half * 2 + 3); for (let x = x0 + 8; x <= x1; x += 16) for (const s of [-1, 1]) { ink(g, 3.2); g.beginPath(); g.moveTo(x, y + s * half); g.lineTo(x, y + s * half + 9); g.stroke(); g.strokeStyle = '#6b4426'; g.lineWidth = 1.8; g.stroke(); } g.fillStyle = pat(g, 'forest', 3, 46, res, rot) || '#a8763e'; ink(g, 1.6); g.beginPath(); g.rect(x0, y - half, x1 - x0, half * 2); g.fill(); g.stroke(); g.strokeStyle = 'rgba(60,40,20,.5)'; g.lineWidth = 1; for (let x = x0 + 5; x < x1; x += 5) { g.beginPath(); g.moveTo(x, y - half); g.lineTo(x, y + half); g.stroke(); } for (const s of [-1, 1]) for (let x = x0 + 14; x < x1; x += 28) { ink(g, 1.2); g.fillStyle = '#7a5230'; g.beginPath(); g.ellipse(x, y + s * (half - 2), 2.6, 1.6, 0, 0, TAU); g.fill(); g.stroke(); g.fillStyle = '#5e4630'; g.fillRect(x - 2.5, y + s * (half - 2) - 4, 5, 4); g.strokeRect(x - 2.5, y + s * (half - 2) - 4, 5, 4); } };
    pier(T.pier2, 90); pier(T.pier, 90);
    // ván cầu nối tàu → cầu tàu
    ink(g, 1.6); g.fillStyle = '#b8864f'; g.beginPath(); g.moveTo(722, 338); g.lineTo(748, 338); g.lineTo(754, 404); g.lineTo(732, 404); g.closePath(); g.fill(); g.stroke(); g.strokeStyle = '#7a5230'; g.lineWidth = 1; for (let y = 344; y < 404; y += 6) { g.beginPath(); g.moveTo(722 + (y - 338) * .15, y); g.lineTo(748 + (y - 338) * .09, y); g.stroke(); }
    // 8) cầu đá qua suối
    const B = T.bridge; for (const s of [-1, 1]) { for (let x = B.x0; x <= B.x1; x += 7) { const y = 395 + s * (PW / 2 + 1); ink(g, 1.3); g.fillStyle = s < 0 ? '#bdb6a8' : '#a9a294'; g.beginPath(); g.roundRect(x - 3.4, y - 5, 6.8, 7, 1.6); g.fill(); g.stroke(); } }
    ink(g, 1.6); g.fillStyle = '#8f887a'; g.beginPath(); g.moveTo(B.x0 + 4, 424); g.quadraticCurveTo((B.x0 + B.x1) / 2, 404, B.x1 - 4, 424); g.lineTo(B.x1 - 4, 432); g.lineTo(B.x0 + 4, 432); g.closePath(); g.fill(); g.stroke();
    // 9) vật thể theo chiều sâu
    for (const d of m.decor) { g.save(); if (!PaintedWorld.prop(g, d, 'castle')) { } g.restore(); }
    // cờ SPAWN trên boong tàu địch
    // 10) mây ngoài khơi
    g.fillStyle = 'rgba(255,255,255,.9)'; for (const [x, y, s] of [[330, 6, 1], [520, 2, 1.2], [700, 10, .9], [610, 30, .6]]) { g.save(); g.translate(x, y); g.scale(s, s); g.beginPath(); for (const [a, b, r] of [[-18, 4, 10], [-4, 0, 13], [12, 3, 10], [24, 6, 7]]) { g.moveTo(a + r, b); g.arc(a, b, r, 0, TAU); } g.fill(); g.restore(); }
    // 11) ánh sáng ban ngày
    g.save(); g.globalAlpha = .3; g.globalCompositeOperation = 'soft-light'; gr = g.createLinearGradient(0, 0, W, H); gr.addColorStop(0, 'rgba(255,236,170,.6)'); gr.addColorStop(.6, 'rgba(255,236,170,0)'); gr.addColorStop(1, 'rgba(30,40,100,.4)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.restore();
    const vg = g.createRadialGradient(W * .5, H * .5, H * .5, W * .5, H * .5, W * .7); vg.addColorStop(0, 'rgba(15,8,30,0)'); vg.addColorStop(1, 'rgba(15,8,30,.18)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
    return c;
  }
  const oldRender = MapArt.render;
  MapArt.render = function (m, res) { if (m.harbor && window.World70) return render(m, res); return oldRender.call(this, m, res); };

  /* ================= THẮNG / THUA ================= */
  const showResult = UI.showResult;
  UI.showResult = function (r) {
    const out = showResult.apply(this, arguments);
    if (Game.levelIndex === LEVEL) setTimeout(() => {
      const rib = document.querySelector('.ribbon'); if (!rib) return;
      if (r.win) rib.insertAdjacentHTML('afterend', '<p class="levelup">Đã giải cứu Cảng Biên Giới! Mở khoá Map 2 — Làng Nông Dân.</p>');
      else { const p = rib.nextElementSibling; if (p && p.tagName === 'P') p.textContent = 'Quân quái vật đã chiếm cảng và tràn về làng... Hãy thử lại!'; }
    }, 0);
    return out;
  };
})();
