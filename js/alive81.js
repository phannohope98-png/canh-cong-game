/* Rev 81 – map sống động trên nền vẽ tay:
 * - trụ phóng theo cỡ ô đất của từng vùng (cả hào quang Thần Tích, nền móng cùng tỉ lệ);
 * - nước: vùng nước tự nhận theo màu ảnh, gợn sóng + vệt sáng trôi theo dòng, thác đổ, hơi nước chân thác;
 * - gió: tán cây đung đưa (cắt từ ảnh nền, viền mờ), lá và cánh hoa bay theo gió. */
(function () {
  'use strict';
  const TAU = Math.PI * 2, R = 1.5;

  /* ---------- cỡ trụ: chân trụ phủ kín vòng đá vẽ sẵn ---------- */
  // bề ngang vòng (đơn vị game) đo trên từng ảnh nền, theo chỉ số màn; chân trụ trung bình ở tỉ lệ 1 rộng ~66
  const RING = { 6: 53, 7: 53, 8: 60, 9: 63, 10: 67, 11: 63, 12: 57, 13: 60, 14: 60, 15: 57, 16: 77, 17: 90, 18: 57, 19: 63, 20: 50, 21: 50, 22: 50, 23: 73, 24: 55, 25: 55, 26: 55, 27: 57, 28: 55, 29: 60 };
  const painted = m => !!(m && (m.elf78 || m.witch79 || m.dwarf80 || m.orc81));
  const ringOf = m => painted(m) ? (RING[Game.levelIndex] || 56) : 0;
  const towerScale = m => { const r = ringOf(m); return r ? Math.max(.78, Math.min(1.3, r / 66)) : 1; };
  function patchTower(T) {
    const P = Object.getPrototypeOf(T); if (P.__alive81) return; P.__alive81 = true;
    const draw = P.draw;
    P.draw = function (g) {
      const k = towerScale(Game.map); if (k === 1) return draw.apply(this, arguments);
      g.save(); g.translate(this.x, this.y + ringOf(Game.map) * .12); g.scale(k, k); g.translate(-this.x, -this.y);
      try { return draw.apply(this, arguments); } finally { g.restore(); }
    };
  }
  const build = Towers.build;
  Towers.build = function () { const r = build.apply(this, arguments), L = this.list[this.list.length - 1]; if (L) patchTower(L); return r; };

  /* ---------- cấu hình cảnh (toạ độ theo pixel ảnh gốc) ---------- */
  // trees: [tâm x, tâm y, bán kính x, bán kính y, chân cây y, hoa?]; flows: vùng nước chảy [x0,y0,x1,y1, vx, vy]; falls: thác [x0,y0,x1,y1]
  const SCENES = {
    'elf78-1.webp': {
      trees: [[320, 85, 185, 100, 245], [612, 140, 92, 74, 250], [1535, 95, 135, 100, 290], [178, 165, 72, 58, 232], [742, 45, 90, 48, 120],
        [545, 545, 105, 66, 640], [722, 538, 88, 58, 615, 1], [402, 612, 66, 56, 680], [985, 765, 160, 108, 905], [1405, 690, 175, 88, 820], [1610, 655, 62, 78, 760]],
      flows: [[0, 0, 470, 944, 7, 3], [880, 0, 1330, 944, 0, 34]],
      falls: [[862, 92, 908, 142], [1083, 18, 1112, 82], [1083, 98, 1172, 205], [1203, 18, 1232, 62], [952, 532, 1002, 582], [1098, 652, 1152, 702], [1128, 828, 1168, 882], [1212, 788, 1272, 872]]
    }
  };

  /* ---------- tiện ích ---------- */
  function rnd(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
  function canvas(w, h) { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; }
  function causticTile(seed, n, wMin, wMax) {
    const S = 256, c = canvas(S, S), g = c.getContext('2d'), r = rnd(seed); g.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const x = r() * S, y = r() * S, len = 10 + r() * 26, a = r() * TAU, bend = (r() - .5) * 14;
      g.strokeStyle = `rgba(255,255,255,${.35 + r() * .5})`; g.lineWidth = wMin + r() * (wMax - wMin);
      for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) {
        const cx = x + ox, cy = y + oy, dx = Math.cos(a) * len / 2, dy = Math.sin(a) * len / 2 * .45;
        g.beginPath(); g.moveTo(cx - dx, cy - dy); g.quadraticCurveTo(cx - dy * 0 + bend, cy + bend * .3, cx + dx, cy + dy); g.stroke();
      }
    }
    return c;
  }
  function fallTile() {
    const c = canvas(64, 128), g = c.getContext('2d'), r = rnd(81);
    for (let i = 0; i < 26; i++) {
      const x = r() * 64, y = r() * 128, h = 18 + r() * 40, w = 1 + r() * 2.2;
      const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.5, `rgba(255,255,255,${.5 + r() * .5})`); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; for (const oy of [-128, 0, 128]) g.fillRect(x, y + oy, w, h);
    }
    return c;
  }

  /* ---------- dựng lớp động cho một map ---------- */
  let S = null; // trạng thái của map hiện tại
  function setup(m, img) {
    const d = m.elf78, cfg = SCENES[d.image] || {}, k = m.sc * R, W = Math.ceil(m.W * R), H = Math.ceil(m.H * R);
    const base = canvas(W, H), bg = base.getContext('2d', { willReadFrequently: true }); bg.drawImage(img, 0, 0, W, H);
    const st = { map: m, k, W, H, trees: [], falls: [], flows: [], leaves: [], mask: null, water: null, fx: canvas(W, H), last: 0 };
    const falls = (cfg.falls || []).map(([x0, y0, x1, y1]) => [x0 * k, y0 * k, x1 * k, y1 * k]);
    // mặt nạ nước theo màu: xanh lam/ngọc; trong khung thác lấy cả bọt trắng
    try {
      const id = bg.getImageData(0, 0, W, H), p = id.data, mk = new ImageData(W, H), q = mk.data;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4, r = p[i], gg = p[i + 1], b = p[i + 2];
        let on = b > 135 && b > r + 45 && gg > 85 && b >= gg - 25;
        if (!on && r > 165 && gg > 195 && b > 205) for (const f of falls) if (x >= f[0] && x <= f[2] && y >= f[1] && y <= f[3]) { on = true; break; }
        if (on) { q[i] = q[i + 1] = q[i + 2] = 255; q[i + 3] = 255; }
      }
      const mask = canvas(W, H); mask.getContext('2d').putImageData(mk, 0, 0);
      const blur = canvas(W, H), bgc = blur.getContext('2d'); bgc.filter = 'blur(1px)'; bgc.drawImage(mask, 0, 0); // viền mềm
      st.mask = blur;
      const water = canvas(W, H), wg = water.getContext('2d'); wg.drawImage(base, 0, 0); wg.globalCompositeOperation = 'destination-in'; wg.drawImage(blur, 0, 0);
      st.water = water;
    } catch (e) { console.warn('alive81: không đọc được ảnh nền', e); }
    st.flows = (cfg.flows || [[0, 0, d.size[0], d.size[1], 6, 3]]).map(([x0, y0, x1, y1, vx, vy]) => ({ x0: x0 * k, y0: y0 * k, x1: x1 * k, y1: y1 * k, vx: vx * R, vy: vy * R }));
    st.falls = falls;
    // tán cây: cắt từ ảnh, viền mờ dần để chồng khít lên ảnh tĩnh
    for (const [cx, cy, rx, ry, by, bloom] of cfg.trees || []) {
      const x0 = (cx - rx) * k, y0 = (cy - ry) * k, w = rx * 2 * k, h = ry * 2 * k, c = canvas(w, h), g = c.getContext('2d');
      g.drawImage(base, x0, y0, w, h, 0, 0, w, h);
      g.globalCompositeOperation = 'destination-in'; g.save(); g.translate(w / 2, h / 2); g.scale(1, ry / rx);
      const gr = g.createRadialGradient(0, 0, 0, 0, 0, w / 2); gr.addColorStop(0, '#000'); gr.addColorStop(.62, '#000'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(-w / 2, -w / 2, w, w); g.restore();
      st.trees.push({ c, x: x0 / R, y: y0 / R, w: w / R, h: h / R, cx: cx * m.sc, cy: cy * m.sc, base: by * m.sc, rx: rx * m.sc, ry: ry * m.sc, ph: (cx * 0.013 + cy * 0.007) % TAU, bloom: !!bloom });
    }
    return st;
  }
  const tiles = {};
  function tile(name) {
    if (!tiles[name]) tiles[name] = name === 'fall' ? fallTile() : name === 'a' ? causticTile(7, 80, 1.2, 2.6) : causticTile(19, 60, 1, 2);
    return tiles[name];
  }

  /* ---------- gió ---------- */
  const wind = t => .55 + .3 * Math.sin(t * .31) + .18 * Math.sin(t * 1.17 + 1) + .12 * Math.max(0, Math.sin(t * .13)) * Math.sin(t * 3.1);

  function drawWater(c, st, t) {
    if (!st.water) return;
    const sc = 1 / R, strip = 4;
    // gợn: dời từng dải ngang một chút
    for (let y = 0; y < st.H; y += strip) {
      const dx = Math.sin(y * .09 + t * 1.7) * 1.1 + Math.sin(y * .031 - t * .9) * .6;
      c.drawImage(st.water, 0, y, st.W, strip, dx * sc, y * sc, st.W * sc, strip * sc);
    }
    // vệt sáng trôi theo dòng + thác
    const fx = st.fx, g = fx.getContext('2d');
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, st.W, st.H);
    for (const [name, mul, al] of [['a', 1, .8], ['b', -.7, .55]]) {
      const pat = g.createPattern(tile(name), 'repeat');
      for (const f of st.flows) {
        const ox = f.vx * t * mul + (f.vy ? Math.sin(t * .8) * 3 : 0), oy = f.vy ? f.vy * t * (name === 'a' ? 1 : .72) : f.vy * t + Math.sin(t * .5) * 4 * mul;
        pat.setTransform(new DOMMatrix().translate(ox, oy).scale(name === 'a' ? 1 : 1.6));
        g.globalAlpha = al; g.fillStyle = pat; g.fillRect(f.x0, f.y0, f.x1 - f.x0, f.y1 - f.y0);
      }
    }
    if (st.falls.length) {
      const pat = g.createPattern(tile('fall'), 'repeat'); pat.setTransform(new DOMMatrix().translate(0, (t * 150) % 128));
      g.globalAlpha = 1; g.fillStyle = pat; for (const f of st.falls) g.fillRect(f[0], f[1], f[2] - f[0], f[3] - f[1]);
    }
    g.globalAlpha = 1; g.globalCompositeOperation = 'destination-in'; g.drawImage(st.mask, 0, 0);
    c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = .28 + .05 * Math.sin(t * 1.3); c.drawImage(fx, 0, 0, st.W * sc, st.H * sc); c.restore();
    // hơi nước chân thác
    c.save(); c.globalCompositeOperation = 'lighter';
    for (const f of st.falls) {
      const x = (f[0] + f[2]) / 2 * sc, y = f[3] * sc, w = (f[2] - f[0]) * sc;
      for (let i = 0; i < 3; i++) {
        const ph = (t * .6 + i / 3 + f[0] * .01) % 1, r = (w * .5 + 4) * (.6 + ph * .9), a = Math.sin(ph * Math.PI) * .22;
        const gr = c.createRadialGradient(x + (i - 1) * w * .25, y - ph * 6, 0, x + (i - 1) * w * .25, y - ph * 6, r);
        gr.addColorStop(0, `rgba(235,250,255,${a})`); gr.addColorStop(1, 'rgba(235,250,255,0)'); c.fillStyle = gr;
        c.beginPath(); c.arc(x + (i - 1) * w * .25, y - ph * 6, r, 0, TAU); c.fill();
      }
    }
    c.restore();
  }

  function drawTrees(c, st, t, dt) {
    const w = wind(t);
    for (const tr of st.trees) {
      const sway = (Math.sin(t * 1.25 + tr.ph) * .55 + Math.sin(t * 2.3 + tr.ph * 1.7) * .2 + .35) * w * .028;
      const breathe = 1 + Math.sin(t * 1.6 + tr.ph) * .006 * w;
      c.save(); c.translate(tr.cx, tr.base); c.transform(1, 0, -sway, breathe, 0, 0); c.translate(-tr.cx, -tr.base);
      c.drawImage(tr.c, tr.x, tr.y, tr.w, tr.h); c.restore();
      // lá / cánh hoa rơi
      if (st.leaves.length < 34 && Math.random() < dt * (tr.bloom ? 1.4 : .32) * w) {
        const a = Math.random() * TAU;
        st.leaves.push({ x: tr.cx + Math.cos(a) * tr.rx * .7, y: tr.cy + Math.sin(a) * tr.ry * .6, vy: 6 + Math.random() * 8, life: 0, max: 4 + Math.random() * 3, rot: Math.random() * TAU, sp: (Math.random() - .5) * 5, ph: Math.random() * TAU, pink: tr.bloom, s: .7 + Math.random() * .6 });
      }
    }
    for (let i = st.leaves.length - 1; i >= 0; i--) {
      const l = st.leaves[i]; l.life += dt; if (l.life > l.max) { st.leaves.splice(i, 1); continue; }
      l.x += (14 * w + Math.sin(l.life * 2.4 + l.ph) * 9) * dt; l.y += l.vy * dt; l.rot += l.sp * dt;
      const a = Math.min(1, l.life * 3, (l.max - l.life) * 1.5);
      c.save(); c.globalAlpha = a * .95; c.translate(l.x, l.y); c.rotate(l.rot); c.scale(l.s, l.s * (.55 + .45 * Math.abs(Math.sin(l.life * 4 + l.ph))));
      c.fillStyle = l.pink ? '#f6b6cf' : (l.ph > 3 ? '#9fcf55' : '#6fae3f'); c.strokeStyle = 'rgba(40,50,20,.55)'; c.lineWidth = .5;
      c.beginPath(); c.ellipse(0, 0, 2.6, 1.4, 0, 0, TAU); c.fill(); c.stroke(); c.restore();
    }
  }

  /* ---------- móc vào vòng vẽ (ngay sau ảnh nền, trước trụ & quân) ---------- */
  const waterDraw = WaterFx.draw;
  WaterFx.draw = function (c, now) {
    const r = waterDraw.apply(this, arguments), m = Game.map;
    if (!m?.elf78) { S = null; return r; }
    if (!S || S.map !== m) {
      S = { map: m, pending: true };
      const a = Elf78.load(m.elf78), st = S;
      a.ready.then(img => { if (S === st && Game.map === m) S = setup(m, img); }).catch(() => {});
    }
    if (S.pending) return r;
    const dt = Math.min(.1, Math.max(0, now - (S.last || now))); S.last = now;
    drawWater(c, S, now); drawTrees(c, S, now, dt);
    return r;
  };
  window.Alive81 = { SCENES, towerScale, RING, get state() { return S; } };
})();
