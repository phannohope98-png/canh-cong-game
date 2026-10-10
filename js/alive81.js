/* Rev 81–82 – map sống động, chạy trên MỌI map (ảnh vẽ tay lẫn nền dựng bằng code):
 * - trụ phóng theo cỡ vòng đá vẽ sẵn của từng màn (cả hào quang Thần Tích, nền móng cùng tỉ lệ);
 * - đọc màu ảnh nền một lần khi vào màn → tự nhận nước, bọt sóng, thác, dung nham, lửa, đèn, pha lê, tán cây;
 * - mỗi khung: gợn nước + vệt sáng trôi, thác đổ + hơi nước, dung nham chảy + phập phồng, lửa bập bùng + tàn lửa,
 *   đèn & pha lê toả sáng, tán cây đung đưa theo gió giật, lá/cánh hoa bay; khí hậu từng vùng (tuyết, tro, bụi phép…).
 * Tất cả vẽ ngay sau ảnh nền (dưới trụ & quân), riêng hạt khí hậu vẽ đè lên trên. */
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

  /* ---------- cấu hình tay cho từng ảnh (toạ độ pixel ảnh gốc) – ưu tiên hơn nhận diện tự động ---------- */
  // trees: [tâm x, tâm y, bán kính x, bán kính y, chân cây y, hoa?]; flows: vùng nước chảy [x0,y0,x1,y1, vx, vy]
  const SCENES = {
    'elf78-1.webp': {
      trees: [[320, 85, 185, 100, 245], [612, 140, 92, 74, 250], [1535, 95, 135, 100, 290], [178, 165, 72, 58, 232], [742, 45, 90, 48, 120],
        [545, 545, 105, 66, 640], [722, 538, 88, 58, 615, 1], [402, 612, 66, 56, 680], [985, 765, 160, 108, 905], [1405, 690, 175, 88, 820], [1610, 655, 62, 78, 760]],
      flows: [[0, 0, 470, 944, 7, 3], [880, 0, 1330, 944, 0, 34]]
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
        g.beginPath(); g.moveTo(cx - dx, cy - dy); g.quadraticCurveTo(cx + bend, cy + bend * .3, cx + dx, cy + dy); g.stroke();
      }
    }
    return c;
  }
  function fallTile() {
    const c = canvas(64, 128), g = c.getContext('2d'), r = rnd(81);
    for (let i = 0; i < 30; i++) {
      const x = r() * 64, y = r() * 128, h = 18 + r() * 40, w = 1 + r() * 2.2;
      const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.5, `rgba(255,255,255,${.5 + r() * .5})`); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; for (const oy of [-128, 0, 128]) g.fillRect(x, y + oy, w, h);
    }
    return c;
  }
  const tiles = {};
  function tile(name) {
    if (!tiles[name]) tiles[name] = name === 'fall' ? fallTile() : name === 'a' ? causticTile(7, 80, 1.2, 2.6) : name === 'b' ? causticTile(19, 60, 1, 2) : causticTile(33, 46, 2, 4);
    return tiles[name];
  }
  // mặt nạ (Uint8Array 0/1) → canvas trắng có alpha
  function maskCanvas(mask, W, H, blur) {
    const c = canvas(W, H), g = c.getContext('2d'), id = g.createImageData(W, H), d = id.data;
    for (let i = 0, n = W * H; i < n; i++) if (mask[i]) { const j = i * 4; d[j] = d[j + 1] = d[j + 2] = d[j + 3] = 255; }
    g.putImageData(id, 0, 0); if (!blur) return c;
    const o = canvas(W, H), og = o.getContext('2d'); og.filter = `blur(${blur}px)`; og.drawImage(c, 0, 0); return o;
  }
  // nở mặt nạ theo bán kính rad (hộp vuông) bằng tổng tiền tố
  function dilate(mask, W, H, rad) {
    const tmp = new Uint8Array(W * H), out = new Uint8Array(W * H), row = new Int32Array(W + 1), col = new Int32Array(H + 1);
    for (let y = 0; y < H; y++) { row[0] = 0; for (let x = 0; x < W; x++) row[x + 1] = row[x] + mask[y * W + x]; for (let x = 0; x < W; x++) tmp[y * W + x] = row[Math.min(W, x + rad + 1)] - row[Math.max(0, x - rad)] > 0 ? 1 : 0; }
    for (let x = 0; x < W; x++) { col[0] = 0; for (let y = 0; y < H; y++) col[y + 1] = col[y] + tmp[y * W + x]; for (let y = 0; y < H; y++) out[y * W + x] = col[Math.min(H, y + rad + 1)] - col[Math.max(0, y - rad)] > 0 ? 1 : 0; }
    return out;
  }
  // độ dài đoạn dọc liên tục của mặt nạ tại mỗi điểm
  function vrun(mask, W, H) {
    const out = new Uint16Array(W * H);
    for (let x = 0; x < W; x++) { let y = 0; while (y < H) { if (!mask[y * W + x]) { y++; continue; } let e = y; while (e < H && mask[e * W + x]) e++; for (let k = y; k < e; k++) out[k * W + x] = e - y; y = e; } }
    return out;
  }

  /* ---------- phân tích ảnh nền ---------- */
  const WATER = 1, FOAM = 2, LAVA = 4, LIGHT = 16, CRYSTAL = 32, LEAF = 64, PINK = 128;
  function classify(px, N) {
    const cls = new Uint8Array(N);
    for (let i = 0; i < N; i++) {
      const j = i * 4, R_ = px[j], G = px[j + 1], B = px[j + 2]; let c = 0;
      if (B > 135 && B > R_ + 45 && G > 85 && B >= G - 25) c |= WATER;
      else if (R_ > 190 && G > 205 && B > 212) c |= FOAM;
      // "nóng" (dung nham, lửa): đỏ cam rất ít xanh dương, hoặc lõi vàng trắng; đá đỏ & sàn cát có B >= 85 nên bị loại
      if ((R_ > 238 && G >= 90 && G <= 215 && B <= 58) || (R_ > 225 && G >= 55 && G < 90 && B <= 45) || (R_ > 247 && G > 215 && B <= 150 && G - B > 60)) c |= LAVA;
      if (R_ > 240 && G > 200 && B >= 90 && B <= 150 && G - B >= 80) c |= LIGHT;
      if ((R_ > 175 && B > 215 && G < 175 && B > G + 50) || (G > 232 && B > 232 && R_ < 150)) c |= CRYSTAL;
      if (G > R_ + 14 && G > B + 8 && G > 55) c |= LEAF;
      else if (R_ > 215 && B > 165 && G < R_ - 35 && G > 110) c |= PINK;
      cls[i] = c;
    }
    return cls;
  }
  function regionOf(m) { return m.elf78 ? 'elf' : m.witch79 ? 'witch' : m.dwarf80 ? 'dwarf' : m.orc81 ? 'orc' : Game.levelIndex >= 30 ? 'chaos' : 'human'; }
  function setup(m, bg, src) {
    const r = Math.min(R, bg.width / m.W), W = Math.ceil(m.W * r), H = Math.ceil(m.H * r), N = W * H;
    // src là ImageBitmap chụp sẵn (bất đồng bộ): đọc điểm ảnh trực tiếp từ canvas nền giữa khung hình buộc GPU xả hết lệnh vẽ – đo được 6–7 s; qua ImageBitmap ~15 ms
    const base = canvas(W, H), bctx = base.getContext('2d', { willReadFrequently: true }); bctx.drawImage(src || bg, 0, 0, W, H);
    const st = { map: m, bg, r, W, H, region: regionOf(m), trees: [], leaves: [], emit: [], embers: [], air: [], last: 0, water: null, fx: null };
    let px; try { px = bctx.getImageData(0, 0, W, H).data; } catch (e) { console.warn('alive81: không đọc được ảnh nền', e); return st; }
    const cls = classify(px, N);
    const bit = b => { const a = new Uint8Array(N); for (let i = 0; i < N; i++) a[i] = cls[i] & b ? 1 : 0; return a; };
    const water = bit(WATER), nearW = dilate(water, W, H, Math.round(3 * r));
    // nguồn sáng nhỏ: lửa (không thuộc dung nham), đèn, pha lê – gom cụm trên lưới 3px
    const cs = 3, GW = Math.ceil(W / cs), GH = Math.ceil(H / cs);
    function clusters(test, minC, maxC, keep) {
      const cnt = new Uint8Array(GW * GH);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x; if (test(i)) cnt[((y / cs) | 0) * GW + ((x / cs) | 0)]++; }
      const seen = new Uint8Array(GW * GH), out = [], q = [];
      for (let s = 0; s < GW * GH; s++) {
        if (seen[s] || cnt[s] < 2) continue; q.length = 0; q.push(s); seen[s] = 1; let n = 0, sx = 0, sy = 0, cells = keep ? [] : null, x0 = 1e9, x1 = -1, y0 = 1e9, y1 = -1;
        while (q.length) { const c = q.pop(), cx = c % GW, cy = (c / GW) | 0; n++; if (cells) cells.push(c); sx += cx; sy += cy; x0 = Math.min(x0, cx); x1 = Math.max(x1, cx); y0 = Math.min(y0, cy); y1 = Math.max(y1, cy);
          for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const nx = cx + dx, ny = cy + dy; if (nx < 0 || ny < 0 || nx >= GW || ny >= GH) continue; const k = ny * GW + nx; if (!seen[k] && cnt[k] >= 2) { seen[k] = 1; q.push(k); } } }
        if (n >= minC && n <= maxC) out.push({ x: (sx / n + .5) * cs / r, y: (sy / n + .5) * cs / r, n, x0, x1, y0, y1, cells });
      }
      return out;
    }
    const lumAt = (gx, gy) => { const j = ((gy * cs) * W + gx * cs) * 4; return px[j] + px[j + 1] + px[j + 2]; };
    // độ sáng trong cụm trừ độ sáng vành quanh cụm (đèn/lửa thật nổi hẳn lên nền)
    const coreMax = c => { let mx = 0; for (let gy = c.y0; gy <= c.y1; gy++) for (let gx = c.x0; gx <= c.x1; gx++) for (let k = 0; k < cs; k++) { const y = gy * cs + k; if (y >= H) break; for (let q = 0; q < cs; q++) { const x = gx * cs + q; if (x >= W) break; const j = (y * W + x) * 4; mx = Math.max(mx, px[j] + px[j + 1] + px[j + 2]); } } return mx; };
    const contrast = c => { let a = 0, na = 0, b = 0, nb = 0; for (let gy = c.y0 - 3; gy <= c.y1 + 3; gy++) for (let gx = c.x0 - 3; gx <= c.x1 + 3; gx++) { if (gx < 0 || gy < 0 || gx >= GW || gy >= GH) continue; const l = lumAt(gx, gy); if (gx >= c.x0 && gx <= c.x1 && gy >= c.y0 && gy <= c.y1) { a += l; na++; } else { b += l; nb++; } } return a / Math.max(1, na) - b / Math.max(1, nb); };
    // nước + bọt sát nước
    const wet = new Uint8Array(N); let wetN = 0;
    for (let i = 0; i < N; i++) if (water[i] || (cls[i] & FOAM && nearW[i])) { wet[i] = 1; wetN++; }
    // thác: dải sáng chạy dọc trong vùng ướt
    const bright = new Uint8Array(N);
    for (let i = 0; i < N; i++) if (wet[i]) { const j = i * 4; if (px[j] + px[j + 1] + px[j + 2] > 600 && px[j + 2] >= px[j] + 4) bright[i] = 1; }
    const vb = vrun(bright, W, H), fall = new Uint8Array(N); let fallN = 0; const minFall = Math.round(11 * r);
    for (let i = 0; i < N; i++) if (vb[i] >= minFall) { fall[i] = 1; fallN++; }
    // dung nham (+ lõi vàng nằm trong dung nham), thác dung nham
    // cụm nóng lớn = dung nham, cụm nhỏ = lửa đuốc / chậu lửa
    const molten = new Uint8Array(N), fireC = []; let lavaN = 0;
    for (const c of clusters(i => cls[i] & LAVA, 2, 1e9, true)) {
      if (c.n <= 110) { fireC.push(c); continue; }
      for (const cell of c.cells) { const gx = cell % GW, gy = (cell / GW) | 0; for (let y = gy * cs; y < Math.min(H, gy * cs + cs); y++) for (let x = gx * cs; x < Math.min(W, gx * cs + cs); x++) { const i = y * W + x; if (cls[i] & LAVA) { molten[i] = 1; lavaN++; } } }
    }
    const vl = vrun(molten, W, H), lfall = new Uint8Array(N); let lfallN = 0;
    for (let i = 0; i < N; i++) if (vl[i] >= Math.round(14 * r)) { lfall[i] = 1; lfallN++; }
    const fr = Math.max(.6, r * .67), FW = Math.ceil(m.W * fr), FH = Math.ceil(m.H * fr); // lớp hiệu ứng ở độ phân giải thấp hơn
    const shrink = c => { const o = canvas(FW, FH); o.getContext('2d').drawImage(c, 0, 0, FW, FH); return o; };
    if (wetN > N * .004) {
      const wm = maskCanvas(wet, W, H, 1), wl = canvas(W, H), g = wl.getContext('2d');
      g.drawImage(base, 0, 0); g.globalCompositeOperation = 'destination-in'; g.drawImage(wm, 0, 0);
      st.water = wl; st.wetMask = shrink(wm);
    }
    if (fallN > 20) st.fallMask = shrink(maskCanvas(fall, W, H, 1));
    // hơi nước: đáy các dải thác (điểm thác mà ngay dưới không còn thác)
    if (fallN > 20) { const pts = [], step = Math.max(2, Math.round(6 * r)); for (let x = 0; x < W; x += step) for (let y = H - 2; y > 0; y--) { if (fall[y * W + x] && !fall[(y + 1) * W + x]) { pts.push({ x: x / r, y: y / r, ph: Math.random() }); break; } } st.mist = pts.filter((p, i, a) => !a.slice(0, i).some(q => Math.hypot(q.x - p.x, q.y - p.y) < 18)).slice(0, 18); }
    if (lavaN > N * .002) {
      st.lavaMask = shrink(maskCanvas(molten, W, H, 1));
      const glow = canvas(FW, FH), gg = glow.getContext('2d'); gg.filter = 'blur(6px)'; gg.drawImage(st.lavaMask, 0, 0); gg.filter = 'none';
      gg.globalCompositeOperation = 'source-in'; gg.fillStyle = '#ff7a1a'; gg.fillRect(0, 0, FW, FH); st.lavaGlow = glow;
      if (lfallN > 20) st.lavaFallMask = shrink(maskCanvas(lfall, W, H, 1));
    }
    if (st.wetMask || st.fallMask || st.lavaMask) st.fx = canvas(FW, FH);
    st.fw = FW; st.fh = FH; st.fr = fr;
    const wetAround = c => { let w = 0, t = 0; for (let gy = Math.max(0, c.y0 - 3); gy <= Math.min(GH - 1, c.y1 + 3); gy++) for (let gx = Math.max(0, c.x0 - 3); gx <= Math.min(GW - 1, c.x1 + 3); gx++) { t++; if (wet[(gy * cs) * W + gx * cs]) w++; } return w / Math.max(1, t); };
    const fires = fireC.filter(c => contrast(c) > 90 && coreMax(c) >= 640).sort((a, b) => b.n - a.n).slice(0, 26);
    const lights = clusters(i => cls[i] & LIGHT, 2, 60).filter(c => contrast(c) > 120 && wetAround(c) < .12).sort((a, b) => b.n - a.n).slice(0, 22);
    const crystals = clusters(i => cls[i] & CRYSTAL, 3, 160).filter(c => wetAround(c) < .3).sort((a, b) => b.n - a.n).slice(0, 30);
    const offRoad = c => { let d = Infinity; for (const p of m.paths) d = Math.min(d, p.nearest(c.x, c.y).perp); return d > 18; };
    const rr = rnd(m.index * 97 + 13);
    for (const c of fires.filter(offRoad)) st.emit.push({ k: 'fire', x: c.x, y: c.y, s: Math.min(16, 3 + Math.sqrt(c.n) * 1.6), ph: rr() * TAU, ember: 0 });
    for (const c of lights.filter(offRoad)) st.emit.push({ k: 'light', x: c.x, y: c.y, s: Math.min(14, 3 + Math.sqrt(c.n) * 1.5), ph: rr() * TAU });
    for (const c of crystals) st.emit.push({ k: 'crystal', x: c.x, y: c.y, s: Math.min(16, 3 + Math.sqrt(c.n) * 1.4), ph: rr() * TAU, col: (() => { const j = (Math.round(c.y * r) * W + Math.round(c.x * r)) * 4; return px[j + 1] > px[j] + 30 ? '120,235,255' : '205,140,255'; })() });
    // tán cây: tay (SCENES) hoặc tự dò theo ô lưới
    const cfg = m.elf78 ? SCENES[m.elf78.image] : null;
    const cutTree = (cx, cy, rx, ry, base_, bloom, sway) => {
      const x0 = Math.max(0, (cx - rx) * r), y0 = Math.max(0, (cy - ry) * r), w = Math.min(W - x0, rx * 2 * r), h = Math.min(H - y0, ry * 2 * r);
      if (w < 4 || h < 4) return; const c = canvas(w, h), g = c.getContext('2d');
      g.drawImage(base, x0, y0, w, h, 0, 0, w, h);
      g.globalCompositeOperation = 'destination-in'; g.save(); g.translate(w / 2, h / 2); g.scale(1, h / w);
      const gr = g.createRadialGradient(0, 0, 0, 0, 0, w / 2); gr.addColorStop(0, '#000'); gr.addColorStop(.58, '#000'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(-w / 2, -w / 2, w, w); g.restore();
      st.trees.push({ c, x: x0 / r, y: y0 / r, w: w / r, h: h / r, cx, cy, base: base_, rx, ry, ph: (cx * .013 + cy * .007) % TAU, bloom, sway });
    };
    if (cfg && cfg.trees) { const sc = m.sc; for (const [cx, cy, rx, ry, by, bl] of cfg.trees) cutTree(cx * sc, cy * sc, rx * sc, ry * sc, by * sc, !!bl, .028); }
    else {
      const cell = 30, cand = [], pads = m.spots || [];
      for (let gy = cell / 2; gy < m.H - cell / 2; gy += cell * .8) for (let gx = cell / 2; gx < m.W - cell / 2; gx += cell * .8) {
        let leaf = 0, pink = 0, t = 0, ls = 0, ls2 = 0; const X0 = Math.floor((gx - cell / 2) * r), Y0 = Math.floor((gy - cell / 2) * r), S = Math.floor(cell * r);
        for (let y = Y0; y < Y0 + S; y += 2) for (let x = X0; x < X0 + S; x += 2) { const i = y * W + x, c = cls[i], j = i * 4, l = (px[j] + px[j + 1] + px[j + 2]) / 3; t++; ls += l; ls2 += l * l; if (c & LEAF) leaf++; else if (c & PINK) pink++; }
        const f = (leaf + pink) / t, sd = Math.sqrt(Math.max(0, ls2 / t - (ls / t) ** 2)); if (f < .7 || sd < 24) continue; // cỏ phẳng đều màu ≠ tán lá lốm đốm
        let dp = Infinity; for (const p of m.paths) dp = Math.min(dp, p.nearest(gx, gy).perp); if (dp < cell * .9 + 6) continue;
        if (pads.some(s => Math.hypot(s.x - gx, (s.y - gy) * 1.3) < 44)) continue;
        cand.push({ gx, gy, f, pink: pink > leaf * .5 });
      }
      cand.sort((a, b) => b.f - a.f).slice(0, 80).forEach(c => cutTree(c.gx, c.gy, cell * .8, cell * .75, c.gy + cell * .7, c.pink, .02));
    }
    return st;
  }

  /* ---------- gió ---------- */
  const wind = t => .55 + .3 * Math.sin(t * .31) + .18 * Math.sin(t * 1.17 + 1) + .12 * Math.max(0, Math.sin(t * .13)) * Math.sin(t * 3.1);

  function passFx(st, g, maskC, painters) {
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.clearRect(0, 0, st.fw, st.fh);
    painters(g); g.globalAlpha = 1; g.globalCompositeOperation = 'destination-in'; g.drawImage(maskC, 0, 0);
  }
  function fillPattern(g, name, ox, oy, scale, alpha, rect) {
    const pat = g.createPattern(tile(name), 'repeat'); pat.setTransform(new DOMMatrix().translate(ox, oy).scale(scale));
    g.globalAlpha = alpha; g.fillStyle = pat; if (rect) g.fillRect(rect[0], rect[1], rect[2], rect[3]); else g.fillRect(0, 0, 4096, 4096);
  }
  function drawLiquids(c, st, t) {
    const m = st.map, k = 1 / st.r, fk = st.fr, fx = st.fx, g = fx && fx.getContext('2d');
    if (st.water) { // gợn: dời từng dải ngang một chút
      const strip = 4;
      for (let y = 0; y < st.H; y += strip) { const gy = y * k, dx = Math.sin(gy * .135 + t * 1.7) * .75 + Math.sin(gy * .046 - t * .9) * .4; c.drawImage(st.water, 0, y, st.W, strip, dx, gy, st.W * k, strip * k); }
    }
    if (!fx) return;
    const cfg = m.elf78 ? SCENES[m.elf78.image] : null, flows = cfg && cfg.flows ? cfg.flows.map(([x0, y0, x1, y1, vx, vy]) => [x0 * m.sc * fk, y0 * m.sc * fk, (x1 - x0) * m.sc * fk, (y1 - y0) * m.sc * fk, vx * fk, vy * fk]) : [[0, 0, st.fw, st.fh, 6 * fk, 3 * fk]];
    const lay = (alpha, op) => { c.save(); c.globalCompositeOperation = op || 'lighter'; c.globalAlpha = alpha; c.drawImage(fx, 0, 0, m.W, m.H); c.restore(); };
    if (st.wetMask) {
      passFx(st, g, st.wetMask, g => { for (const f of flows) { fillPattern(g, 'a', f[4] * t + (f[5] ? Math.sin(t * .8) * 3 : 0), f[5] * t + (f[5] ? 0 : Math.sin(t * .5) * 4), fk / 1.5, .8, f); fillPattern(g, 'b', -f[4] * t * .7, f[5] ? f[5] * t * .72 : Math.sin(t * .5) * -3, fk / 1.5 * 1.6, .55, f); } });
      lay(.26 + .05 * Math.sin(t * 1.3));
    }
    if (st.fallMask) { passFx(st, g, st.fallMask, g => fillPattern(g, 'fall', 0, (t * 150 * fk) % (128 * fk / 1.5 * 1.5), fk / 1.5 * 1.2, 1)); lay(.5); }
    if (st.lavaMask) {
      c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = .18 + .1 * Math.sin(t * 1.9) + .05 * Math.sin(t * 5.3); c.drawImage(st.lavaGlow, 0, 0, m.W, m.H); c.restore();
      passFx(st, g, st.lavaMask, g => { fillPattern(g, 'c', t * 4 * fk, t * 6 * fk, fk / 1.5 * 1.3, .9); fillPattern(g, 'b', -t * 3 * fk, t * 2 * fk, fk / 1.5 * 2, .6); });
      lay(.22, 'lighter');
      if (st.lavaFallMask) { passFx(st, g, st.lavaFallMask, g => fillPattern(g, 'fall', 0, (t * 70 * fk) % 256, fk / 1.5 * 1.4, 1)); lay(.35); }
    }
    if (st.mist) { c.save(); c.globalCompositeOperation = 'lighter';
      for (const p of st.mist) for (let i = 0; i < 2; i++) { const ph = (t * .5 + p.ph + i * .5) % 1, rad = 6 + ph * 12, a = Math.sin(ph * Math.PI) * .2, x = p.x + (i - .5) * 6, y = p.y - ph * 7; const gr = c.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, `rgba(235,250,255,${a})`); gr.addColorStop(1, 'rgba(235,250,255,0)'); c.fillStyle = gr; c.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
      c.restore(); }
  }

  function drawTrees(c, st, t, dt) {
    for (const tr of st.trees) {
      const w = wind(t - tr.cx / 320), sway = (Math.sin(t * 1.25 + tr.ph) * .55 + Math.sin(t * 2.3 + tr.ph * 1.7) * .2 + .35) * w * tr.sway;
      const breathe = 1 + Math.sin(t * 1.6 + tr.ph) * .006 * w;
      c.save(); c.translate(tr.cx, tr.base); c.transform(1, 0, -sway, breathe, 0, 0); c.translate(-tr.cx, -tr.base); c.drawImage(tr.c, tr.x, tr.y, tr.w, tr.h); c.restore();
      if (st.leaves.length < 30 && Math.random() < dt * (tr.bloom ? 1.2 : .14) * w) {
        const a = Math.random() * TAU;
        st.leaves.push({ x: tr.cx + Math.cos(a) * tr.rx * .7, y: tr.cy + Math.sin(a) * tr.ry * .6, vy: 6 + Math.random() * 8, life: 0, max: 4 + Math.random() * 3, rot: Math.random() * TAU, sp: (Math.random() - .5) * 5, ph: Math.random() * TAU, pink: tr.bloom, s: .7 + Math.random() * .6 });
      }
    }
    const w = wind(t);
    for (let i = st.leaves.length - 1; i >= 0; i--) {
      const l = st.leaves[i]; l.life += dt; if (l.life > l.max) { st.leaves.splice(i, 1); continue; }
      l.x += (14 * w + Math.sin(l.life * 2.4 + l.ph) * 9) * dt; l.y += l.vy * dt; l.rot += l.sp * dt;
      const a = Math.min(1, l.life * 3, (l.max - l.life) * 1.5);
      c.save(); c.globalAlpha = a * .95; c.translate(l.x, l.y); c.rotate(l.rot); c.scale(l.s, l.s * (.55 + .45 * Math.abs(Math.sin(l.life * 4 + l.ph))));
      c.fillStyle = l.pink ? '#f6b6cf' : (l.ph > 3 ? '#9fcf55' : '#6fae3f'); c.strokeStyle = 'rgba(40,50,20,.55)'; c.lineWidth = .5;
      c.beginPath(); c.ellipse(0, 0, 2.6, 1.4, 0, 0, TAU); c.fill(); c.stroke(); c.restore();
    }
  }

  // quầng sáng dùng chung (vẽ sẵn 1 lần)
  const halo = {};
  function haloOf(rgb) { if (halo[rgb]) return halo[rgb]; const c = canvas(64, 64), g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, `rgba(${rgb},1)`); gr.addColorStop(.35, `rgba(${rgb},.45)`); gr.addColorStop(1, `rgba(${rgb},0)`); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return (halo[rgb] = c); }
  function drawEmitters(c, st, t, dt) {
    c.save(); c.globalCompositeOperation = 'lighter';
    for (const e of st.emit) {
      if (e.k === 'fire') {
        const f = .55 + .25 * Math.sin(t * 9 + e.ph) + .15 * Math.sin(t * 23 + e.ph * 3) + .1 * Math.random(), s = e.s * (2.2 + .4 * f);
        c.globalAlpha = .55 * f; c.drawImage(haloOf('255,140,40'), e.x - s, e.y - s * 1.1, s * 2, s * 2);
        c.globalAlpha = .5 * f; const s2 = e.s * .9; c.drawImage(haloOf('255,230,140'), e.x - s2, e.y - s2 * 1.3, s2 * 2, s2 * 2);
        e.ember -= dt; if (e.ember <= 0 && st.embers.length < 60) { e.ember = .18 + Math.random() * .5; st.embers.push({ x: e.x + (Math.random() - .5) * e.s, y: e.y - e.s * .4, vx: (Math.random() - .5) * 8, vy: -14 - Math.random() * 16, life: 0, max: .9 + Math.random() * .9 }); }
      } else if (e.k === 'light') {
        const f = .75 + .25 * Math.sin(t * 1.6 + e.ph), s = e.s * 2.4;
        c.globalAlpha = .38 * f; c.drawImage(haloOf('255,214,120'), e.x - s, e.y - s, s * 2, s * 2);
      } else {
        const f = .6 + .4 * Math.sin(t * 2.1 + e.ph), s = e.s * 2.2;
        c.globalAlpha = .42 * f; c.drawImage(haloOf(e.col), e.x - s, e.y - s, s * 2, s * 2);
        const tw = (t * .35 + e.ph / TAU) % 1; if (tw < .12) { const a = Math.sin(tw / .12 * Math.PI), sx = e.x + Math.sin(e.ph * 7) * e.s * .5, sy = e.y - e.s * .6; c.globalAlpha = a; c.strokeStyle = '#fff'; c.lineWidth = 1; c.beginPath(); c.moveTo(sx - 4, sy); c.lineTo(sx + 4, sy); c.moveTo(sx, sy - 4); c.lineTo(sx, sy + 4); c.stroke(); }
      }
    }
    for (let i = st.embers.length - 1; i >= 0; i--) {
      const p = st.embers[i]; p.life += dt; if (p.life > p.max) { st.embers.splice(i, 1); continue; }
      p.x += (p.vx + Math.sin(p.life * 6 + i) * 6) * dt; p.y += p.vy * dt; const a = 1 - p.life / p.max;
      c.globalAlpha = a; c.fillStyle = a > .5 ? '#ffd27a' : '#ff8a3a'; c.fillRect(p.x - .8, p.y - .8, 1.6, 1.6);
    }
    c.restore();
  }

  /* ---------- khí hậu từng vùng: vẽ đè lên trên quân & trụ ---------- */
  const AIR = {
    dwarf: { n: 70, make: (W, H) => ({ x: Math.random() * W, y: Math.random() * H, vx: -6 - Math.random() * 6, vy: 14 + Math.random() * 14, s: .8 + Math.random() * 1.4, ph: Math.random() * TAU }), col: 'rgba(255,255,255,.85)' },
    orc: { n: 34, make: (W, H) => ({ x: Math.random() * W, y: Math.random() * H, vx: 8 + Math.random() * 8, vy: -6 - Math.random() * 8, s: .7 + Math.random(), ph: Math.random() * TAU }), col: 'rgba(255,150,70,.8)', glow: true },
    witch: { n: 28, make: (W, H) => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * 6, vy: -5 - Math.random() * 6, s: .8 + Math.random() * 1.2, ph: Math.random() * TAU }), col: 'rgba(214,170,255,.9)', glow: true, twinkle: true },
    elf: { n: 22, make: (W, H) => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * 8, vy: (Math.random() - .5) * 6, s: 1 + Math.random(), ph: Math.random() * TAU }), col: 'rgba(225,255,150,.95)', glow: true, twinkle: true, wander: true },
    chaos: { n: 30, make: (W, H) => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * 5, vy: -4 - Math.random() * 6, s: .8 + Math.random() * 1.3, ph: Math.random() * TAU }), col: 'rgba(190,140,255,.9)', glow: true, twinkle: true },
    human: { n: 14, make: (W, H) => ({ x: Math.random() * W, y: Math.random() * H, vx: 6 + Math.random() * 6, vy: (Math.random() - .5) * 4, s: .8 + Math.random() * .8, ph: Math.random() * TAU }), col: 'rgba(255,248,210,.85)', twinkle: true, wander: true }
  };
  function drawAir(c, st, t, dt) {
    const A = AIR[st.region], m = st.map; if (!A) return;
    while (st.air.length < A.n) st.air.push(A.make(m.W, m.H));
    c.save(); if (A.glow) c.globalCompositeOperation = 'lighter';
    for (const p of st.air) {
      const w = wind(t); p.x += (p.vx * (A.wander ? 1 : w) + (A.wander ? Math.sin(t * .9 + p.ph) * 7 : 0)) * dt; p.y += (p.vy + (A.wander ? Math.cos(t * 1.1 + p.ph) * 5 : 0)) * dt;
      if (p.x < -10) p.x += m.W + 20; if (p.x > m.W + 10) p.x -= m.W + 20; if (p.y < -10) p.y += m.H + 20; if (p.y > m.H + 10) p.y -= m.H + 20;
      const a = A.twinkle ? .35 + .65 * Math.max(0, Math.sin(t * 2.3 + p.ph * 3)) : 1;
      c.globalAlpha = a; c.fillStyle = A.col; c.beginPath(); c.arc(p.x, p.y, p.s, 0, TAU); c.fill();
      if (A.glow && a > .5) { c.globalAlpha = a * .35; c.beginPath(); c.arc(p.x, p.y, p.s * 3, 0, TAU); c.fill(); }
    }
    c.restore();
  }

  /* ---------- móc vào vòng vẽ ---------- */
  let S = null;
  // phân tích chạy ngoài vòng vẽ: chụp nền thành ImageBitmap (bất đồng bộ) rồi mới đọc điểm ảnh
  let job = null;
  function state() {
    const m = Game.map, bg = Game.bg; if (!m || !bg) return null;
    if (S && S.map === m && S.bg === bg) return S.broken ? null : S;
    if (job && job.map === m && job.bg === bg) return null;
    const d = m.elf78 || m.witch79 || m.dwarf80 || m.orc81;
    if (d && !d.__ready81) { // ảnh vẽ tay chưa tải xong thì nền đang là chữ "Đang tải…": chờ nền thật
      const L = m.elf78 && window.Elf78 ? Elf78.load(d) : null; if (L && !L.loaded) return null;
      if (!L && bg.width < 50) return null;
    }
    const j = job = { map: m, bg }, r = Math.min(R, bg.width / m.W), W = Math.ceil(m.W * r), H = Math.ceil(m.H * r);
    const run = src => { if (job !== j || Game.map !== m || Game.bg !== bg) return; try { S = setup(m, bg, src); } catch (e) { console.warn('alive81', e); S = { map: m, bg, broken: true }; } job = null; if (src && src.close) src.close(); };
    if (window.createImageBitmap) createImageBitmap(bg, { resizeWidth: W, resizeHeight: H, resizeQuality: 'medium' }).then(run, () => run(null));
    else setTimeout(() => run(null), 0);
    return null;
  }
  const waterDraw = WaterFx.draw;
  WaterFx.draw = function (c, now) {
    const r = waterDraw.apply(this, arguments), st = state(); if (!st) return r;
    const dt = Math.min(.1, Math.max(0, now - (st.last || now))); st.last = now;
    drawLiquids(c, st, now); drawTrees(c, st, now, dt); drawEmitters(c, st, now, dt);
    return r;
  };
  const atmo = Game.drawAtmosphere;
  Game.drawAtmosphere = function (c, t) {
    const r = atmo.apply(this, arguments), st = S && S.map === this.map && !S.broken ? S : null;
    if (st) { const dt = Math.min(.1, Math.max(0, t - (st.lastAir || t))); st.lastAir = t; drawAir(c, st, t, dt); }
    return r;
  };
  window.Alive81 = { SCENES, RING, towerScale, get state() { return S; }, reset() { S = null; } };
})();
