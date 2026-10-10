/* Revision 67 – dáng đi kiểu Kingdom Rush cho MỌI nhân vật (tướng, lính, quái, boss, lính trên trụ).
 * - Atlas đã được cắt lại (mỗi khung đúng 1 hình) và căn đầu/thân trùng nhau giữa các khung → hết gật/lắc.
 * - Vòng đi chỉ dùng các khung bước thật (bỏ khung đứng chen giữa → hết khựng mỗi chu kỳ).
 * - Chuyển khung gọn (chỉ hoà 25% cuối mỗi khung), thêm nhún 2 nhịp/chu kỳ + nén nhẹ khi chạm đất.
 * - Mỗi nhân vật nhớ trạng thái: không lật mặt qua lại liên tục, không nhấp nháy giữa đi ↔ đứng,
 *   đổi tư thế (đi/đứng/đánh) hoà mượt 0,1 giây. */
(function () {
  if (!window.ArtStylized || !window.PaintedMotion) return;
  const BASE = 128, TAU = Math.PI * 2, cache = new Map(), states = new WeakMap();
  const WALK = { voidling: [7, 8, 9, 10], voidLord: [7, 8, 9, 10] }, WALK_DEF = [7, 8, 9, 10, 11];
  const now = () => (window.Game && Game.time) || performance.now() / 1000;
  const smooth = u => { u = Math.max(0, Math.min(1, u)); return u * u * (3 - 2 * u); };

  function frame(e, n) {
    const key = e.id + ':' + n; let c = cache.get(key); if (c) return c;
    const r = e.registration, s = BASE / r.height; let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const f of r.frames) { const x = ((f.offset || 0) - r.pivot) * s, y = -f.baseline * s; x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x + f.w * s); y1 = Math.max(y1, y + f.h * s); }
    x0 = Math.floor(x0) - 2; y0 = Math.floor(y0) - 2;
    const cv = document.createElement('canvas'); cv.width = Math.ceil(x1 - x0) + 4; cv.height = Math.ceil(y1 - y0) + 4;
    const g = cv.getContext('2d'); g.translate(-x0, -y0); ArtStylized.blit(g, e, n, BASE);
    c = { canvas: cv, x: x0, y: y0 }; cache.set(key, c); if (cache.size > 420) cache.delete(cache.keys().next().value); return c;
  }

  function pose(id, e, P) {
    if (P.a >= 0) { // đánh: 6 khung 12..17, nhấn mạnh nhát chém
      const p = Math.min(.999, P.a) * 6, i = Math.floor(p), f = p - i;
      return { a: 12 + i, b: 12 + Math.min(5, i + 1), mix: smooth((f - .7) / .3), by: 0, sx: 1, sy: 1, rot: 0 };
    }
    if (P.w >= 0) { // đi: chỉ khung bước, nhịp đều theo quãng đường
      const L = WALK[id] || WALK_DEF, ph = ((P.w % 1) + 1) % 1, p = ph * L.length, i = Math.floor(p), f = p - i;
      const s = Math.abs(Math.sin(ph * TAU)), land = Math.pow(1 - s, 4);
      return { a: L[i], b: L[(i + 1) % L.length], mix: smooth((f - .75) / .25), by: -s * .016, sx: 1 + land * .018, sy: 1 - land * .028, rot: .025 };
    }
    const b = Math.sin((P.t || 0) * 2.1); // đứng thở
    return { a: 0, b: 0, mix: 0, by: 0, sx: 1 - b * .004, sy: 1 + b * .007, rot: 0 };
  }

  function paint(g, e, q, z, alpha) {
    g.save(); g.translate(0, q.by * BASE * z); g.rotate(q.rot); g.scale(q.sx * z, q.sy * z);
    const A = frame(e, q.a); g.globalAlpha = alpha * (1 - q.mix); g.drawImage(A.canvas, A.x, A.y);
    if (q.mix > .001) { const B = frame(e, q.b); g.globalAlpha = alpha * q.mix; g.drawImage(B.canvas, B.x, B.y); }
    g.restore();
  }

  function render(g, id, P, size, e) {
    if (P.d !== undefined || !e || !e.loaded) return false;
    const q = pose(id, e, P), z = size / BASE, alpha = g.globalAlpha, mode = P.a >= 0 ? 'atk' : P.w >= 0 ? 'walk' : 'idle';
    let prev = null, blend = 1; const actor = P._actor;
    if (actor && typeof actor === 'object') {
      const t = now(); let st = states.get(actor);
      if (!st || st.id !== id) { st = { id, mode, q }; states.set(actor, st); }
      if (st.mode !== mode) { st.from = st.q; st.since = t; st.mode = mode; }
      if (st.from) { const u = (t - st.since) / .1; if (u >= 1 || u < 0) st.from = null; else { blend = smooth(u); prev = st.from; } }
      st.q = q;
    }
    if (prev) paint(g, e, prev, z, alpha * (1 - blend));
    paint(g, e, q, z, alpha * (prev ? blend : 1));
    g.globalAlpha = alpha; return true;
  }

  // Ổn định hướng mặt + trạng thái đi/đứng cho từng nhân vật trước khi vẽ.
  const guard = new WeakMap(), prevChar = Painter.char;
  Painter.char = function (ctx, type, x, y, scale, face, mode, phase, ppu, aim) {
    const e = ArtStylized.atlases.get(ArtStylized.identify(type));
    if (!e || !e.loaded || mode === 'die') return prevChar.apply(this, arguments);
    const actor = ppu && typeof ppu === 'object' ? ppu : null;
    if (actor) {
      const t = now(); let s = guard.get(actor); if (!s) { s = { face, walkT: -9, phase: 0, flipT: 0 }; guard.set(actor, s); }
      if (mode === 'atk' || face === s.face) { s.face = face; s.flipT = 0; }
      else if (!s.flipT) s.flipT = t;
      else if (t - s.flipT > .14) { s.face = face; s.flipT = 0; }
      face = s.face;
      if (mode === 'walk') { s.walkT = t; s.phase = phase; }
      else if (mode === 'idle' && t - s.walkT < .14 && t >= s.walkT) { mode = 'walk'; phase = s.phase; }
    }
    const P = { w: mode === 'walk' ? phase : -1, a: mode === 'atk' ? phase : -1, t: mode === 'idle' ? phase : 0, _actor: actor };
    ctx.save(); ctx.translate(x, y); if (face < 0) ctx.scale(-1, 1); ArtStylized.draw(ctx, type, P, 48 * scale); ctx.restore();
  };

  // Dải bước chân khớp tốc độ di chuyển (không trượt chân): người ~0.9 chiều cao/chu kỳ, thú 4 chân dài hơn.
  const quad = new Set(['warg', 'frostWolf', 'wolfRider', 'scorpion', 'drake', 'voidling']);
  ArtStylized.stride = function (key, H = 48) { const id = this.identify(key); return H * (quad.has(id) ? 1.15 : CONFIG.enemies[id]?.boss ? 1 : ['treant', 'troll', 'iceGolem', 'magmaGolem'].includes(id) ? .95 : .88); };

  PaintedMotion.render = render;
  const clear0 = PaintedMotion.clear; PaintedMotion.clear = function () { cache.clear(); return clear0.apply(this, arguments); };
  PaintedMotion.warmFor = function (keys) {
    const queue = []; for (const id of [...new Set(keys)].slice(0, 10)) { const e = ArtStylized.atlases.get(ArtStylized.identify(id)); if (!e?.loaded) continue; for (const n of [0, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]) queue.push([e, n]); }
    (function batch() { const s0 = performance.now(); while (queue.length && performance.now() - s0 < 3) { const [e, n] = queue.shift(); frame(e, n); } if (queue.length) setTimeout(batch, 16); })();
  };
  window.Gait67 = { render, pose, frame };
})();
