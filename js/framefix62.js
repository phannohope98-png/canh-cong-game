/* Revision 62 – khung tranh nhân vật không bao giờ cắt hình.
 * Mỗi nhân vật / quái / tướng / lính có 1 khung cố định (box) để lưu đệm khung hình; nhát chém, vũ khí, áo choàng,
 * tư thế ngã thường vượt ra ngoài khung → bị cắt thẳng. Lần đầu vẽ 1 nhân vật, ta vẽ thử các tư thế
 * (đứng, đi, đánh, ngã) lên vùng nháp rộng gấp 3, đo đúng vùng có điểm ảnh rồi nới khung cho vừa. */
(function () {
  const POSES = [{ t: 0 }, { t: 1.3 }, { w: 0 }, { w: 0.17 }, { w: 0.33 }, { w: 0.5 }, { w: 0.67 }, { w: 0.83 }, { a: 0.1 }, { a: 0.3 }, { a: 0.45 }, { a: 0.55 }, { a: 0.7 }, { a: 0.9 }, { d: 0.3 }, { d: 0.6 }, { d: 1 }];
  function measure(d) {
    const [w, h, ox, oy] = d.box, S = 1, W = Math.ceil(w * 3), H = Math.ceil(h * 3), c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d', { willReadFrequently: true });
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const p of POSES) {
      g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H); g.setTransform(S, 0, 0, S, w + ox, h + oy);
      const P = { w: -1, a: -1, t: 0, ...p }; if (p.d === undefined) delete P.d;
      try { d.draw(g, P); } catch (e) { continue; }
      const im = g.getImageData(0, 0, W, H).data;
      for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) if (im[(y * W + x) * 4 + 3] > 12) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    }
    if (x0 === Infinity) return d.box;
    // toạ độ nhân vật (gốc = chân): trừ phần dời gốc w+ox, h+oy
    const L = x0 - (w + ox) - 4, R = x1 - (w + ox) + 4, T = y0 - (h + oy) - 4, B = y1 - (h + oy) + 4;
    const nox = Math.max(ox, -L), noy = Math.max(oy, -T), nw = Math.max(w, nox + R), nh = Math.max(h, noy + B);
    return [Math.ceil(nw), Math.ceil(nh), Math.ceil(nox), Math.ceil(noy)];
  }
  function fix(type) {
    const d = window.ArtChars && ArtChars[type]; if (!d || d.__box62 || !d.box || typeof d.draw !== 'function') return;
    d.__box62 = true;
    try { const b = measure(d); if (b[0] !== d.box[0] || b[1] !== d.box[1] || b[2] !== d.box[2] || b[3] !== d.box[3]) Object.defineProperty(d, 'box', { value: b, writable: true, configurable: true, enumerable: true }); } catch (e) { }
  }
  const orig = Painter.char;
  Painter.char = function (ctx, type, x, y, scale, face, mode, phase, ppu, aim) { fix(type); return orig.apply(this, arguments); };
  if (Painter.clear) Painter.clear(); // xoá đệm khung cũ (khung nhỏ) đã lỡ tạo trước khi nới
  window.FrameFix62 = { fix, measure };
})();
/* Ảnh gốc (atlas) có khung hình bị cắt sát mép (vũ khí, nhát chém, áo choàng chạm biên ảnh) → đường cắt thẳng.
 * Khi atlas tải xong: dò 4 cạnh của từng khung, cạnh nào còn điểm ảnh đặc thì làm mờ dần 12 px vào trong
 * (chỉ trong khung đó) để mép cắt tan tự nhiên. Chỉ xử lý atlas có khung bị cắt. */
(function () {
  if (!window.ArtStylized || !ArtStylized.atlases) return;
  const F = 12;
  function feather(entry) {
    const img = entry.img, r = entry.registration; if (!img || !img.naturalWidth || !r || entry.__feather62) return; entry.__feather62 = true;
    const W = img.naturalWidth, H = img.naturalHeight, c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0);
    let data; try { data = g.getImageData(0, 0, W, H).data; } catch (e) { return; }
    const A = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? 0 : data[(y * W + x) * 4 + 3];
    let changed = 0;
    g.globalCompositeOperation = 'destination-out';
    for (const f of r.frames) {
      const x0 = Math.round(f.x), y0 = Math.round(f.y), x1 = x0 + Math.round(f.w) - 1, y1 = y0 + Math.round(f.h) - 1;
      const edge = (n, get) => { let k = 0; for (let i = 0; i < n; i += 2) if (get(i) > 60) k++; return k > 2; };
      const L = edge(f.h, i => A(x0, y0 + i)), R = edge(f.h, i => A(x1, y0 + i)), T = edge(f.w, i => A(x0 + i, y0)), B = edge(f.w, i => A(x0 + i, y1));
      const fade = (gx0, gy0, gx1, gy1, rx, ry, rw, rh) => { const gr = g.createLinearGradient(gx0, gy0, gx1, gy1); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(rx, ry, rw, rh); changed++; };
      if (L) fade(x0, 0, x0 + F, 0, x0, y0, F, f.h);
      if (R) fade(x1 + 1, 0, x1 + 1 - F, 0, x1 + 1 - F, y0, F, f.h);
      if (T) fade(0, y0, 0, y0 + F, x0, y0, f.w, F);
      if (B && f.baseline < f.h - 2) fade(0, y1 + 1, 0, y1 + 1 - F, x0, y1 + 1 - F, f.w, F); // không làm mờ chân đứng trên mặt đất
    }
    if (changed) { entry.img = c; if (window.Painter && Painter.clear) Painter.clear(); }
  }
  const run = () => { for (const e of ArtStylized.atlases.values()) { if (e.loaded && e.img) feather(e); else if (e.ready) e.ready.then(() => feather(e)); } };
  (ArtStylized.ready || Promise.resolve()).then(run); run();
})();
