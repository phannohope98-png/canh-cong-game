/* =========================================================
 * towers3d.js – 4 trụ × 4 cấp dựng 3D (đá / gỗ to chắc, viền mực kiểu Kingdom Rush)
 * Dùng chung bộ dựng hình của chars3d.js (Chars3D.kit). Gốc = tâm ô xây trên mặt đất, mặt trước +Z.
 * Đơn vị: 1 m = 40 đv game theo chiều ngang; chiều cao quy đổi theo góc nhìn (EL) để sàn trên đỉnh
 * khớp đúng chỗ nhân vật đứng của bản 2D (ARCH_TOP, MAGE_TOP… trong art-towers.js).
 * API: Towers3D.build(type, tier) → Group tĩnh
 * ========================================================= */
(function () {
  'use strict';
  if (!window.THREE || !window.Chars3D || !Chars3D.kit) return;
  const T = THREE, { part, G, add, node, mat, glow, sh } = Chars3D.kit, GOLD = Chars3D.kit.GOLD;
  const TAU = Math.PI * 2, S = Math.sin, C = Math.cos, EL = 0.34;
  const U = v => v / 40, HY = v => v / (40 * Math.cos(EL));

  /* ---------- khối dựng ---------- */
  function footing(g, rx, col) {
    add(g, part(G.cyl(U(rx), U(rx) + 0.03, 0.08, 28), col, { tex: 'flag' }), 0, 0.04, 0);
    const n = Math.round(rx / 2.4);
    for (let i = 0; i < n; i++) { const a = i / n * TAU; add(g, part(G.sbox(0.14, 0.08, 0.11, 0.45), i % 2 ? '#b8b2a6' : '#a09a8e', { ink: 0.014 }), S(a) * U(rx), 0.07, C(a) * U(rx), 0, a, 0); }
  }
  function tower(g, y0, y1, r0, r1, col, o) {
    add(g, part(G.cyl(r1, r0, y1 - y0, 26), col, Object.assign({ tex: 'brick' }, o)), 0, (y0 + y1) / 2, 0);
  }
  const rAt = (y0, y1, r0, r1) => y => r0 + (r1 - r0) * Math.max(0, Math.min(1, (y - y0) / (y1 - y0)));
  function onCyl(g, obj, r, y, a) { obj.position.set(S(a) * r, y, C(a) * r); obj.rotation.y = a; g.add(obj); return obj; }
  function win(g, r, y, a, w, h, col) {
    const f = node('win');
    add(f, part(G.sbox(w + 0.05, h + 0.05, 0.05, 0.4), '#5a4a3a', { ink: 0.014 }), 0, 0, 0);
    add(f, new T.Mesh(G.sbox(w, h, 0.04, 0.5), mat(col || '#ffd27a', { glow: 1.1 })), 0, 0, 0.012);
    add(f, new T.Mesh(G.sbox(w, 0.015, 0.045), mat('#3a2a1a')), 0, 0, 0.016);
    return onCyl(g, f, r, y, a);
  }
  function door(g, r, y, a, w, h, col) {
    const s = new T.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(w / 2, h - w / 2); s.absarc(0, h - w / 2, w / 2, 0, Math.PI, false); s.lineTo(-w / 2, 0);
    const f = node('door');
    add(f, part(G.ext(s, 0.05, 0.01), col, { tex: 'wood.f' }), 0, 0, 0);
    for (const x of [-w * 0.18, w * 0.18]) add(f, new T.Mesh(G.sbox(0.012, h * 0.8, 0.055), mat(sh(col, -0.35))), x, h * 0.42, 0);
    add(f, new T.Mesh(G.ball(0.02), mat(GOLD, { metal: 1 })), w * 0.3, h * 0.45, 0.03);
    return onCyl(g, f, r, y, a);
  }
  function banner(g, r, y, a, w, h, col, emblem) {
    const f = node('banner');
    add(f, part(G.ext([-w / 2, 0, w / 2, 0, w / 2, -h, 0, -h * 0.78, -w / 2, -h], 0.018, 0.004), col), 0, 0, 0);
    add(f, part(G.cyl(0.014, 0.014, w + 0.08).rotateZ(Math.PI / 2), '#6a4426', { ink: 0.008 }), 0, 0.01, 0.01);
    if (emblem) add(f, part(G.oct(w * 0.2, 1.25).scale(1, 1, 0.35), emblem, { metal: 1, ink: 0.008 }), 0, -h * 0.4, 0.016);
    return onCyl(g, f, r + 0.012, y, a);
  }
  function planks(g, y, rx, col) {
    col = col || '#9a6a3a'; const R = U(rx);
    add(g, part(G.cyl(R, R * 0.96, 0.08, 26), col, { tex: 'wood' }), 0, y - 0.04, 0);
    for (let i = -2; i <= 2; i++) { const x = i * R * 0.34; add(g, new T.Mesh(G.sbox(0.012, 0.004, 2 * Math.sqrt(R * R - x * x) * 0.98), mat(sh(col, -0.35))), x, y + 0.001, 0); }
  }
  function beam(g, a, b, r, col) {
    const A = new T.Vector3(a[0], a[1], a[2]), B = new T.Vector3(b[0], b[1], b[2]), d = B.clone().sub(A), L = d.length();
    const m = part(G.cyl(r, r, L, 8), col, { ink: 0.014, tex: 'wood' });
    m.position.copy(A).add(B).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), d.normalize()); g.add(m); return m;
  }
  function merlons(g, y, r, col, n) {
    for (let i = 0; i < n; i++) { const a = (i + 0.5) / n * TAU; add(g, part(G.sbox(0.2, 0.16, 0.14, 0.3), col, { ink: 0.016, tex: 'stone.f' }), S(a) * r, y + 0.08, C(a) * r, 0, a, 0); }
  }
  function house(g, x, z, w, h, d, wall, roof, roofH, o) {
    o = o || {}; h *= 1.2; roofH *= 0.7;
    add(g, part(G.sbox(w, h, d, 0.12), wall, { tex: o.wall || 'plaster' }), x, h / 2, z);
    const hd = d / 2 + 0.07;
    add(g, part(G.ext([-hd, 0, hd, 0, 0, roofH], w + 0.12, 0.012).rotateY(Math.PI / 2), roof, { tex: o.roof || 'tile.f' }), x, h - 0.02, z);
    add(g, part(G.cyl(0.03, 0.03, w + 0.16).rotateZ(Math.PI / 2), sh(roof, -0.25), { ink: 0.012 }), x, h + roofH - 0.02, z);
  }
  function stakes(g, rx, from, to, n, col) {
    for (let i = 0; i < n; i++) { const a = from + (to - from) * i / (n - 1), r = U(rx); add(g, part(G.cyl(0.035, 0.04, 0.32, 8), col, { ink: 0.012, tex: 'bark' }), S(a) * r, 0.16, C(a) * r); add(g, part(G.cone(0.035, 0.1, 8), sh(col, 0.1), { ink: 0.012 }), S(a) * r, 0.37, C(a) * r); }
  }
  const leafShape = (w, h) => G.ext([0, 0, w * 0.5, h * 0.4, 0, h, -w * 0.5, h * 0.4], 0.02, 0.006);

  /* =================== BỘ KHỐI LÂU ĐÀI CHIBI =================== */
  /** đế đá phình tròn + vòng tảng đá to quanh chân */
  function plinth(g, rx, col, h) {
    const R = U(rx); h = h || 0.12;
    add(g, part(G.lathe([[0, 0], [R + 0.02, 0], [R + 0.06, h * 0.45], [R + 0.03, h * 0.9], [R - 0.03, h], [0, h]], 30), col, { tex: 'stone' }), 0, 0, 0);
    const n = Math.round(rx / 3.2);
    for (let i = 0; i < n; i++) { const a = (i + 0.5) / n * TAU, w = 0.16 + (i % 3) * 0.03; add(g, part(G.sbox(w, 0.1, 0.13, 0.5), i % 2 ? sh(col, 0.1) : sh(col, -0.04), { ink: 0.016, tex: 'rock' }), S(a) * (R + 0.04), 0.05, C(a) * (R + 0.04), 0, a, 0); }
    return h;
  }
  /** thân tháp tròn hơi phình bụng (kiểu chibi) */
  function body(g, y0, y1, r0, r1, col, tex, belly) {
    const b = belly === undefined ? 0.035 : belly, ym = (y0 + y1) / 2;
    add(g, part(G.lathe([[0, y0], [r0, y0], [(r0 + r1) / 2 + b, ym], [r1, y1], [0, y1]], 28), col, { tex: tex || 'brick' }), 0, 0, 0);
  }
  function trim(g, y, r, col, th) { add(g, part(G.torus(r, th || 0.028).rotateX(Math.PI / 2), col || GOLD, { metal: 1, ink: 0.012 }), 0, y, 0); }
  /** mái chóp nhọn quá khổ, mép xoè, núm vàng */
  function spire(g, x, y, z, r, h, col, o) {
    o = o || {}; const s = node('spire'); s.position.set(x, y, z); g.add(s);
    add(s, part(G.lathe([[0, -0.03], [r * 1.12, -0.03], [r * 1.16, 0.02], [r * 0.78, h * 0.26], [r * 0.42, h * 0.58], [r * 0.12, h * 0.9], [0.012, h]], 24), col, { tex: 'tile' }), 0, 0, 0);
    if (o.trim !== false) add(s, part(G.torus(r * 1.12, 0.022).rotateX(Math.PI / 2), o.trimCol || GOLD, { metal: 1, ink: 0.01 }), 0, 0, 0);
    add(s, part(G.ball(0.045, 1, 1, 1, 10), GOLD, { metal: 1, ink: 0.01 }), 0, h + 0.02, 0);
    add(s, part(G.cone(0.02, 0.14, 6), GOLD, { metal: 1, ink: 0.008 }), 0, h + 0.12, 0);
    return s;
  }
  /** tháp con: thân + (mái chóp | lỗ châu mai) */
  function turret(g, x, z, y0, y1, r, wall, roof, roofH, o) {
    o = o || {}; const t = node('turret'); t.position.set(x, 0, z); g.add(t);
    body(t, y0, y1, r * 1.04, r, wall, o.tex || 'brick', 0.02);
    if (o.band !== false) trim(t, y1 - 0.02, r + 0.012, o.bandCol || sh(wall, -0.25), 0.024);
    if (roof) spire(t, 0, y1, 0, r * 1.05, roofH, roof, { trimCol: o.trimCol });
    else merlons(t, y1, r * 0.9, wall, Math.max(5, Math.round(r * 22)));
    if (o.win) win(t, r * 0.98, y0 + (y1 - y0) * 0.6, o.winA || 0, 0.07, 0.13, o.win);
    return t;
  }
  /** cờ treo có huy hiệu: 'cross' | 'leaf' | 'star' | 'hammer' */
  function crest(g, r, y, a, w, h, col, emblem, emCol) {
    const f = banner(g, r, y, a, w, h, col, null), ec = emCol || GOLD, z = 0.016, cy = -h * 0.42;
    add(f, part(G.sbox(w * 0.88, 0.022, 0.02, 0.5), ec, { metal: 1, ink: 0.006 }), 0, -0.035, z);
    if (emblem === 'cross') { add(f, part(G.sbox(w * 0.16, h * 0.46, 0.02, 0.5), ec, { metal: 1, ink: 0.008 }), 0, cy, z); add(f, part(G.sbox(w * 0.52, w * 0.16, 0.02, 0.5), ec, { metal: 1, ink: 0.008 }), 0, cy + h * 0.08, z); }
    else if (emblem === 'leaf') add(f, part(leafShape(w * 0.42, h * 0.5), ec, { metal: 1, ink: 0.008 }), 0, cy - h * 0.25, z);
    else if (emblem === 'star') add(f, part(G.ext(starShape(w * 0.3, w * 0.13), 0.02, 0.004), ec, { metal: 1, ink: 0.008 }), 0, cy, z);
    else if (emblem === 'hammer') { add(f, part(G.sbox(w * 0.1, h * 0.42, 0.02, 0.5), '#8a5a32', { ink: 0.008 }), 0, cy - h * 0.04, z); add(f, part(G.sbox(w * 0.46, w * 0.22, 0.03, 0.4), ec, { metal: 1, ink: 0.008 }), 0, cy + h * 0.14, z); }
    return f;
  }
  function starShape(r1, r2) { const p = []; for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? r2 : r1; p.push(C(a) * r, S(a) * r); } return p; }
  /** cửa vòm có khung đá + đai sắt */
  function gate(g, r, y, a, w, h, wood, stone) {
    const d = door(g, r, y, a, w, h, wood);
    const arc = node('arch'); add(arc, part(G.torus(w / 2 + 0.035, 0.035, Math.PI), stone || '#a8a4b0', { tex: 'stone.f' }), 0, h - w / 2, 0.01);
    for (const s of [-1, 1]) add(arc, part(G.sbox(0.07, h - w / 2, 0.07, 0.4), stone || '#a8a4b0', { tex: 'stone.f' }), s * (w / 2 + 0.035), (h - w / 2) / 2, 0.01);
    for (const yy of [h * 0.25, h * 0.6]) add(d, new T.Mesh(G.sbox(w * 0.96, 0.02, 0.06), mat('#3a3a44', { metal: 1 })), 0, yy, 0.01);
    onCyl(g, arc, r, y, a); return d;
  }
  /** đá chạm cửa sổ vòm phát sáng */
  function archWin(g, r, y, a, w, h, col) {
    const f = node('awin'), s = new T.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(w / 2, h - w / 2); s.absarc(0, h - w / 2, w / 2, 0, Math.PI, false); s.lineTo(-w / 2, 0);
    add(f, part(G.ext(s, 0.05, 0.012).scale(1.3, 1.15, 1), '#4a3a32', { ink: 0.012 }), 0, -0.02, 0);
    add(f, new T.Mesh(G.ext(s, 0.05, 0.004), mat(col || '#ffd27a', { glow: 1.2 })), 0, 0, 0.012);
    add(f, new T.Mesh(G.sbox(0.012, h * 0.9, 0.055), mat('#2a1a14')), 0, h * 0.45, 0.016);
    return onCyl(g, f, r, y - h / 2, a);
  }
  /** lan can trước (nhóm 'front' – vẽ đè lên chân nhân vật đứng trên trụ) */
  function frontParapet(g, y, r, col, o) {
    o = o || {}; const f = node('front'); g.add(f);
    const n = o.n || 5, from = o.from === undefined ? -1.15 : o.from, to = o.to === undefined ? 1.15 : o.to;
    if (o.wood) {
      for (let i = 0; i < n; i++) { const a = from + (to - from) * i / (n - 1); add(f, part(G.cyl(0.022, 0.022, o.h || 0.16, 6), col, { ink: 0.01, tex: 'wood' }), S(a) * r, y + (o.h || 0.16) / 2, C(a) * r); }
      const pts = []; for (let i = 0; i <= 12; i++) { const a = from + (to - from) * i / 12; pts.push([S(a) * r, y + (o.h || 0.16), C(a) * r]); }
      add(f, part(G.tube(pts, 0.024, 16), o.rail || sh(col, 0.08), { tex: 'wood' }), 0, 0, 0);
    } else for (let i = 0; i < n; i++) {
      const a = from + (to - from) * i / (n - 1);
      add(f, part(G.sbox(o.w || 0.17, o.h || 0.14, 0.12, 0.3), col, { ink: 0.014, tex: 'stone.f' }), S(a) * r, y + (o.h || 0.14) / 2, C(a) * r, 0, a, 0);
    }
    return f;
  }
  /** vòng tường thấp sau lưng (lỗ châu mai phía sau) */
  function backMerlons(g, y, r, col, n) { for (let i = 0; i < n; i++) { const a = Math.PI * 0.62 + i / (n - 1) * Math.PI * 0.76; add(g, part(G.sbox(0.17, 0.15, 0.12, 0.3), col, { ink: 0.014, tex: 'stone.f' }), S(a) * r, y + 0.075, C(a) * r, 0, a, 0); } }
  /** sàn trên đỉnh (đá lát hoặc ván) */
  function deck(g, y, r, col, tex) { add(g, part(G.cyl(r, r * 0.97, 0.07, 28), col, { tex: tex || 'flag' }), 0, y - 0.035, 0); }

  /* =================== TRỤ CUNG (ELF) – trắng ngà, mái xanh lá =================== */
  const ARCH_TOP = [0, 56, 66, 74, 82];
  function ARCHER(t) {
    const g = node('root'), H = HY(ARCH_TOP[t]), wood = '#8a5a32', wood2 = '#6e4426', leafG = '#3fa05a', ivory = t === 4 ? '#f2eee6' : '#d8d2c6';
    if (t <= 2) {
      plinth(g, 30, '#8a8494', 0.1);
      const base = t === 2 ? HY(24) : 0.1;
      if (t === 2) { body(g, 0.1, base, U(31), U(29), '#a8a2b0', 'stone'); trim(g, base, U(29) + 0.01, '#6a4426', 0.025); crest(g, U(30), base - 0.04, 0, 0.22, 0.32, leafG, 'leaf'); }
      for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) beam(g, [x * 0.44, base, z * 0.36], [x * 0.33, H - 0.05, z * 0.27], 0.05, wood);
      for (const z of [0.31, -0.31]) { beam(g, [-0.42, base + 0.12, z], [0.36, H * 0.78, z * 0.9], 0.026, wood2); beam(g, [0.42, base + 0.12, z], [-0.36, H * 0.78, z * 0.9], 0.026, wood2); }
      deck(g, H, U(33), '#a8783e', 'wood');
      add(g, part(G.torus(U(33), 0.028).rotateX(Math.PI / 2), wood2, { ink: 0.012, tex: 'wood' }), 0, H - 0.04, 0);
      // mái lá nhỏ che phía sau
      const pole = node('pole'); pole.position.set(-0.32, 0, -0.26); g.add(pole);
      add(pole, part(G.cyl(0.025, 0.03, H + 0.55, 6), wood2, { tex: 'wood' }), 0, (H + 0.55) / 2, 0);
      crest(pole, 0.03, H + 0.5, 0, 0.2, 0.3, leafG, 'leaf');
      frontParapet(g, H, U(32), wood, { wood: true, n: 6, h: 0.17 });
    } else {
      const four = t === 4, r0 = U(32), r1 = U(28);
      plinth(g, 34, four ? '#c8c4cc' : '#9a96a6', 0.12);
      body(g, 0.12, H - 0.08, r0, r1, ivory, 'brick');
      trim(g, H * 0.36, U(30.6) + 0.02, four ? GOLD : '#7a6a5a', 0.03);
      trim(g, H - 0.08, r1 + 0.03, four ? GOLD : '#7a6a5a', 0.034);
      add(g, part(G.cyl(r1 + 0.07, r1 + 0.02, 0.1, 28), sh(ivory, -0.12), { tex: 'stone' }), 0, H - 0.05, 0); // gờ đỡ sàn
      deck(g, H, r1 + 0.06, '#c8b088');
      gate(g, U(31.5), 0.12, 0, 0.3, 0.44, four ? '#3f9a50' : '#7a5232', ivory);
      archWin(g, U(30.5), H * 0.55, -0.42, 0.12, 0.2, four ? '#9affc8' : '#ffd27a'); archWin(g, U(30.3), H * 0.62, 0.45, 0.12, 0.2, four ? '#9affc8' : '#ffd27a');
      for (const s of [-1, 1]) crest(g, U(30.2), H * 0.84, s * 0.72, 0.2, 0.42, leafG, 'leaf');
      // dây leo
      for (const [a, y] of [[-0.95, 0.3], [-0.8, 0.55], [-1.05, 0.95], [0.9, 0.4], [1.0, 1.25]]) add(g, part(G.ball(0.09, 1.2, 0.8, 0.6, 8), '#4aa83a', { ink: 0.012, tex: 'leaf' }), S(a) * (U(31) + 0.02), y, C(a) * (U(31) + 0.02), 0, a, 0);
      // 2 tháp con mái xanh phía sau (không che lính)
      const th = H + (four ? 0.42 : 0.3), rr = four ? 0.15 : 0.13;
      for (const s of [-1, 1]) turret(g, s * (r1 - 0.02), -r1 * 0.55, H - 0.2, th, rr, ivory, leafG, four ? 0.62 : 0.5, { win: four ? '#9affc8' : '#ffd27a', bandCol: four ? GOLD : null });
      backMerlons(g, H, r1 + 0.02, ivory, 5);
      if (four) for (const s of [-1, 1]) add(g, part(leafShape(0.24, 0.6), GOLD, { metal: 1 }), s * (r0 + 0.04), H * 0.45, 0.05, 0, 0, -s * 0.5);
      frontParapet(g, H, r1 + 0.02, ivory, { n: 5, from: -1.1, to: 1.1, h: 0.13 });
    }
    return g;
  }

  /* =================== TRỤ PHÁP (PHÙ THỦY) – đá tím xám, mái tím =================== */
  const MAGE_TOP = [0, 54, 64, 74, 84];
  function MAGE(t) {
    const g = node('root'), H = HY(MAGE_TOP[t]), stone = t >= 4 ? '#9a8ec0' : t >= 3 ? '#8a84a4' : '#908ca2', roof = t >= 4 ? '#6a3ad0' : '#5a3ab8', glowC = '#b48aff';
    const r0 = U(27 + t), r1 = U(21 + t * 0.6);
    plinth(g, 31 + t, '#7a7488', 0.11);
    body(g, 0.11, H - 0.06, r0, r1, stone, 'stone', 0.05);
    trim(g, H - 0.06, r1 + 0.025, t >= 4 ? GOLD : '#5a4a8a', 0.03);
    add(g, part(G.cyl(r1 + 0.06, r1 + 0.01, 0.09, 26), '#5a4a8a', { tex: 'stone' }), 0, H - 0.045, 0);
    deck(g, H, r1 + 0.05, '#7a6aa0');
    // vòng chữ phép phát sáng
    const ry = H * 0.4, R = y => r0 + (r1 - r0) * (y - 0.11) / (H - 0.17);
    add(g, part(G.torus(R(ry) + 0.03, 0.026).rotateX(Math.PI / 2), '#9a6ae8', { glow: 0.6, ink: 0.012 }), 0, ry, 0);
    for (let i = 0; i < 7; i++) { const a = -1.2 + i * 0.4; onCyl(g, part(G.oct(0.04, 1.4).scale(1, 1, 0.4), '#d0b0ff', { glow: 1.2, ink: 0.008 }), R(ry) + 0.06, ry, a); }
    gate(g, R(0.12) + 0.01, 0.11, 0, 0.27, 0.4, '#5a3a8a', sh(stone, 0.1));
    archWin(g, R(H * 0.66) + 0.01, H * 0.66, 0.42, 0.1, 0.18, '#d0a0ff');
    if (t >= 2) { archWin(g, R(H * 0.74) + 0.01, H * 0.74, -0.4, 0.1, 0.18, '#d0a0ff'); for (const s of [-1, 1]) crest(g, R(H * 0.86) + 0.01, H * 0.86, s * 0.75, 0.18, 0.38, '#4a2aa8', 'star'); }
    // tháp chóp phía sau
    const tops = t === 1 ? [[0, -1, 0.12, 0.25, 0.45]] : t === 2 ? [[-1, -0.7, 0.12, 0.3, 0.55], [1, -0.7, 0.11, 0.22, 0.48]] : [[-1, -0.65, 0.13, 0.36, 0.62], [1, -0.65, 0.13, 0.36, 0.62], [0, -1, 0.15, 0.55, 0.72]];
    for (const [sx, sz, r, up, rh] of tops) turret(g, sx * r1 * 0.85, sz * r1 * 0.85, H - 0.25, H + up * (t >= 4 ? 1.25 : 1), r, stone, roof, rh * (t >= 4 ? 1.15 : 1), { tex: 'stone', win: '#d0a0ff', bandCol: t >= 4 ? GOLD : '#5a4a8a', trimCol: t >= 3 ? GOLD : '#c8b8f0' });
    backMerlons(g, H, r1 + 0.02, stone, 5);
    if (t >= 3) for (const s of [-1, 1]) { add(g, part(G.oct(0.12, 2.6), '#9a6ae8', { glow: 0.6, ink: 0.014 }), s * (r0 + 0.12), 0.32, 0.12, 0, 0, s * 0.15); add(g, part(G.oct(0.07, 2.2), '#c8a8ff', { glow: 0.6, ink: 0.012 }), s * (r0 + 0.24), 0.2, 0.0, 0, 0, s * 0.4); }
    if (t >= 4) { trim(g, H * 0.18, r0 + 0.02, GOLD, 0.03); const ring = add(g, part(G.torus(r1 + 0.32, 0.02).rotateX(Math.PI / 2 - 0.25), '#c8a8ff', { glow: 1.2, ink: false }), 0, H + 0.42, 0); ring.name = 'ring'; glow(g, 0, H + 0.42, 0, 1.4, glowC, 0.3); }
    frontParapet(g, H, r1 + 0.02, stone, { n: 5, from: -1.1, to: 1.1, h: 0.12 });
    return g;
  }

  /* =================== TRẠI LÍNH (CON NGƯỜI) – lâu đài đá, mái xanh lam, cờ thập tự vàng =================== */
  function BARRACKS(t) {
    const g = node('root'), blue = '#2f5ad0', banner = '#2a4ab0', stone = t >= 4 ? '#d8d6de' : '#bab6c4';
    if (t === 1) { // trại gỗ: hàng rào cọc + lều sọc + cổng gỗ
      plinth(g, 36, '#8a8494', 0.08);
      stakes(g, 36, Math.PI * 0.5, Math.PI * 1.5, 11, '#9a6a3a');
      const tent = node('tent'); tent.position.set(0, 0.08, -0.08); g.add(tent);
      add(tent, part(G.cone(U(30), HY(44), 8), '#e8dcc0', { tex: 'cloth' }), 0, HY(22), 0);
      for (let i = 0; i < 8; i += 2) { const a = i / 8 * TAU + Math.PI / 8; add(tent, new T.Mesh(new T.ConeGeometry(U(30) * 1.006, HY(44) * 1.006, 8, 1, true, a, TAU / 8), mat(blue, { ds: true })), 0, HY(22), 0); }
      add(tent, new T.Mesh(G.ext([-U(8), 0, U(8), 0, 0, HY(24)], 0.01, 0.002), mat('#2a1a14')), 0, 0, U(27));
      add(tent, part(G.cyl(0.02, 0.02, 0.3, 6), '#6a4426', { ink: 0.008 }), 0, HY(44) + 0.12, 0);
      crest(tent, 0.02, HY(44) + 0.26, 0, 0.18, 0.24, banner, 'cross');
      for (const s of [-1, 1]) { const rk = node('rack'); rk.position.set(s * 0.62, 0.08, 0.2); g.add(rk); beam(rk, [-0.08, 0, 0], [-0.08, 0.3, 0], 0.018, '#6a4426'); beam(rk, [0.08, 0, 0], [0.08, 0.3, 0], 0.018, '#6a4426'); beam(rk, [-0.1, 0.24, 0], [0.1, 0.24, 0], 0.016, '#6a4426'); add(rk, part(WEAPON(), '#c8ccd6', { metal: 1, ink: 0.008 }), 0, 0.2, 0.03, 0, 0, 0.12); }
      return g;
    }
    plinth(g, 38, '#8a8494', 0.1);
    if (t === 2) { // đồn đá: nhà đá mái xanh + tháp tròn mái chóp
      house(g, -0.08, -0.06, U(46), HY(26), U(32), stone, blue, HY(22), { wall: 'stone.f' });
      turret(g, U(19), -0.02, 0.1, HY(52), 0.15, stone, blue, 0.5, { win: '#ffd27a' });
      gate(g, U(16) - 0.05, 0.1, 0, 0.28, 0.4, '#7a5232', sh(stone, 0.06)).position.x = -0.1;
      crest(g, U(16) - 0.04, HY(26) * 1.2 - 0.02, 0, 0.2, 0.3, banner, 'cross').position.x = -0.42;
      return g;
    }
    // cấp 3–4: thành trì như tranh – khối thành vuông, tháp góc mái chóp xanh, cờ thập tự vàng
    const four = t === 4, W = U(four ? 50 : 46), D = U(32), h = HY(four ? 46 : 40);
    add(g, part(G.sbox(W, h, D, 0.1), stone, { tex: 'stone.f' }), 0, 0.1 + h / 2, -0.06);
    add(g, part(G.sbox(W + 0.06, 0.06, D + 0.06, 0.4), sh(stone, -0.18), { tex: 'stone.f' }), 0, 0.1 + h, -0.06);
    for (let i = 0; i < 5; i++) add(g, part(G.sbox(0.13, 0.13, 0.1, 0.3), stone, { ink: 0.014, tex: 'stone.f' }), -W / 2 + 0.08 + i * (W - 0.16) / 4, 0.1 + h + 0.09, D / 2 - 0.1);
    // nóc giữa: mái chóp lớn
    const keepTop = 0.1 + h + 0.03;
    body(g, keepTop, keepTop + HY(four ? 22 : 16), 0.2, 0.18, stone, 'brick', 0.01);
    spire(g, 0, keepTop + HY(four ? 22 : 16), -0.06, 0.22, four ? 0.82 : 0.66, blue);
    // tháp góc trước
    const th = HY(four ? 66 : 58);
    for (const s of [-1, 1]) {
      const tw = turret(g, s * (W / 2 + 0.02), D / 2 - 0.12, 0.1, th, four ? 0.17 : 0.155, stone, blue, four ? 0.62 : 0.54, { win: '#ffd27a', bandCol: four ? GOLD : sh(stone, -0.28) });
      crest(tw, (four ? 0.17 : 0.155) + 0.012, th - 0.12, s * 0.45, 0.13, 0.26, banner, 'cross');
    }
    if (four) { // tháp sau cao + viền vàng
      for (const s of [-1, 1]) turret(g, s * (W / 2 - 0.1), -D / 2 - 0.06, 0.1, HY(84), 0.14, stone, blue, 0.56, { bandCol: GOLD });
      add(g, part(G.sbox(W + 0.02, 0.04, 0.02, 0.5), GOLD, { metal: 1, ink: 0.01 }), 0, 0.1 + h - 0.05, D / 2 - 0.05);
    }
    // cửa + cờ lớn trên mặt thành
    gate(g, D / 2 - 0.06, 0.1, 0, 0.32, 0.46, '#7a5232', sh(stone, 0.06));
    for (const s of [-1, 1]) { const c = crest(g, D / 2 - 0.05, 0.1 + h - 0.08, 0, 0.17, 0.42, banner, 'cross'); c.position.x = s * 0.28; c.rotation.y = 0; }
    for (const s of [-1, 1]) { const w2 = archWin(g, D / 2 - 0.05, 0.1 + h * 0.36, 0, 0.08, 0.14, '#ffd27a'); w2.position.x = s * 0.28; w2.rotation.y = 0; }
    return g;
  }
  function WEAPON() { return G.ext([-0.02, 0, 0.02, 0, 0.02, 0.22, 0, 0.26, -0.02, 0.22], 0.012, 0.003); }

  /* =================== PHÁO ĐÀI NGƯỜI LÙN – đá granite, mái đỏ gỉ, súng cối =================== */
  const ART_TOP = [0, 24, 34, 40, 46];
  function mortar(g, y, t) {
    const m = node('mortar'); m.position.set(0.16, y, 0.02); g.add(m);
    const bc = t === 4 ? GOLD : t === 3 ? '#3a3a46' : t === 2 ? '#a87a3a' : '#9a6a32', R = 0.11 + t * 0.012, L = 0.3 + t * 0.03;
    add(m, part(G.sbox(0.32, 0.12, 0.26, 0.35), t >= 3 ? '#4a4a56' : '#6a4426', { tex: t >= 3 ? null : 'wood.f', metal: t >= 3 ? 1 : 0 }), 0, 0.06, 0); // giá
    for (const s of [-1, 1]) { add(m, part(G.cyl(0.07, 0.07, 0.04, 14).rotateX(Math.PI / 2), '#5a3a22', { tex: 'wood' }), -0.08, 0.06, s * 0.14); add(m, part(G.ball(0.022), GOLD, { metal: 1, ink: 0.006 }), -0.08, 0.06, s * 0.165); }
    const b = node('barrel'); b.position.set(0, 0.15, 0); b.rotation.z = -0.75; m.add(b);
    add(b, part(G.lathe([[0, -0.06], [R * 0.95, -0.06], [R * 1.05, 0.02], [R * 0.86, L * 0.65], [R * 1.02, L * 0.9], [R * 1.08, L], [R * 0.72, L], [R * 0.7, L * 0.7], [0, L * 0.68]], 18), bc, { metal: 1 }), 0, 0, 0);
    add(b, part(G.torus(R * 0.9, 0.016).rotateX(Math.PI / 2), sh(bc, -0.3), { metal: 1, ink: 0.006 }), 0, L * 0.35, 0);
    if (t >= 4) add(b, new T.Mesh(G.torus(R * 0.88, 0.012).rotateX(Math.PI / 2), mat('#ff9a3a', { glow: 1.6 })), 0, L * 0.6, 0);
    for (const [x, z] of [[-0.32, 0.16], [-0.38, 0.06], [-0.34, 0.1]]) add(g, part(G.ball(0.05, 1, 1, 1, 10), '#2e2e38', { metal: 1, ink: 0.01 }), x, y + 0.05, z);
    add(g, part(G.lathe([[0, 0], [0.08, 0], [0.095, 0.08], [0.08, 0.16], [0, 0.16]], 12), '#8a5a32', { tex: 'wood' }), -0.36, y, -0.12); // thùng thuốc súng
    return m;
  }
  function DWARFHALL(t) {
    const g = node('root'), Y = HY(ART_TOP[t]), red = t >= 4 ? '#b8401a' : '#a8481e', granite = t >= 4 ? '#9a94a6' : '#8a8494';
    if (t === 1) { // ụ pháo gỗ: sàn ván trên chân đá, bao cát
      plinth(g, 34, '#8a8494', 0.1);
      for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) add(g, part(G.cyl(0.05, 0.06, Y - 0.1, 8), '#6a4426', { tex: 'wood' }), x * 0.42, 0.1 + (Y - 0.1) / 2, z * 0.34);
      deck(g, Y, U(36), '#a8783e', 'wood');
      for (let i = 0; i < 7; i++) { const a = Math.PI * 0.55 + i / 6 * Math.PI * 0.9; add(g, part(G.sbox(0.2, 0.1, 0.13, 0.6), '#a88a5a', { ink: 0.012, tex: 'cloth' }), S(a) * U(33), Y + 0.05, C(a) * U(33), 0, a, 0); }
      mortar(g, Y, t);
      const f = node('front'); g.add(f);
      for (let i = 0; i < 6; i++) { const a = -1.1 + i * 0.44; add(f, part(G.sbox(0.19, 0.1, 0.12, 0.6), '#a88a5a', { ink: 0.012, tex: 'cloth' }), S(a) * U(34), Y + 0.05, C(a) * U(34), 0, a, 0); }
      crest(g, U(34), Y - 0.02, 0.8, 0.16, 0.24, red, 'hammer');
      return g;
    }
    const four = t === 4, r0 = U(36), r1 = U(32);
    plinth(g, 38, '#7a7480', 0.12);
    body(g, 0.12, Y - 0.06, r0, r1, granite, 'stone', 0.03);
    for (const y of [Y * 0.42, Y - 0.06]) trim(g, y, (y < Y * 0.5 ? (r0 + r1) / 2 + 0.03 : r1 + 0.02), four ? GOLD : '#4a4a56', 0.032);
    deck(g, Y, r1 + 0.04, '#8a8292');
    gate(g, r0 - 0.01, 0.12, 0, 0.3, Math.min(0.4, Y - 0.28), '#6a4426', sh(granite, 0.08));
    if (t >= 3) for (const s of [-1, 1]) archWin(g, r0 - 0.01, Y * 0.62, s * 0.62, 0.09, 0.15, '#ff9a3a');
    crest(g, r0, Y - 0.1, -0.85, 0.17, 0.3, red, 'hammer'); if (t >= 3) crest(g, r0, Y - 0.1, 0.85, 0.17, 0.3, red, 'hammer');
    if (t >= 3) { // ống khói lò rèn
      const ch = node('chim'); ch.position.set(-r1 * 0.7, 0, -r1 * 0.6); g.add(ch);
      body(ch, Y - 0.1, Y + 0.42, 0.075, 0.065, '#6a6470', 'brick', 0.005); trim(ch, Y + 0.42, 0.075, '#3a3a44', 0.02);
      add(ch, new T.Mesh(G.cyl(0.05, 0.05, 0.01, 10), mat('#ff8a2a', { glow: 1.6 })), 0, Y + 0.43, 0);
    }
    if (four) { // tháp sau mái đỏ + mặt đá râu + sừng vàng
      for (const s of [-1, 1]) turret(g, s * r1 * 0.9, -r1 * 0.55, Y - 0.2, Y + 0.38, 0.14, granite, red, 0.52, { tex: 'stone', bandCol: GOLD });
      const fy = Y * 0.62;
      add(g, part(G.ball(0.15, 1, 1, 0.6, 14), sh(granite, 0.08), { tex: 'rock' }), 0, fy + 0.1, r0 + 0.02);
      add(g, part(G.ball(0.16, 1, 1.2, 0.55, 14), '#c8c4cc', { tex: 'fur' }), 0, fy - 0.12, r0 + 0.04);
      for (const x of [-0.055, 0.055]) add(g, new T.Mesh(G.ball(0.022), mat('#ff9a3a', { glow: 1.8 })), x, fy + 0.13, r0 + 0.15);
      for (const s of [-1, 1]) add(g, part(G.tube([[s * 0.42, Y - 0.06, 0], [s * 0.88, Y + 0.08, 0], [s * 0.86, Y + 0.6, -0.08]], 0.06, 14), '#f2ead6'), 0, 0, 0);
    }
    backMerlons(g, Y, r1 + 0.02, granite, 5);
    mortar(g, Y, t);
    frontParapet(g, Y, r1 + 0.02, granite, { n: 5, from: -1.05, to: 1.05, h: 0.12 });
    return g;
  }

  /** Ô xây trống: bãi đất nện viền đá + biển gỗ */
  function PLOT() {
    const g = node('root');
    add(g, part(G.cyl(U(40), U(41), 0.06, 32), '#9a7448', { ink: 0.02, tex: 'rock' }), 0, 0.03, 0);
    for (const [x, z, r] of [[-0.4, 0.2, 0.05], [0.3, -0.25, 0.04], [0.1, 0.4, 0.035], [-0.2, -0.4, 0.04], [0.55, 0.15, 0.03]]) add(g, new T.Mesh(G.ball(r, 1, 0.4, 1, 8), mat('#7a5634')), x, 0.065, z);
    for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; add(g, part(G.sbox(0.17, 0.1, 0.12, 0.45), i % 2 ? '#b8b2a6' : '#a09a8e', { ink: 0.014 }), S(a) * U(40), 0.06, C(a) * U(40), 0, a, 0); }
    beam(g, [0.66, 0.04, -0.2], [0.66, 0.62, -0.2], 0.03, '#7a4a26');
    add(g, part(G.sbox(0.5, 0.3, 0.05, 0.25), '#c8965a', { tex: 'wood.f' }), 0.66, 0.66, -0.17);
    add(g, new T.Mesh(G.sbox(0.24, 0.035, 0.06), mat('#5a3418')), 0.66, 0.68, -0.15); add(g, new T.Mesh(G.sbox(0.035, 0.18, 0.06), mat('#5a3418')), 0.66, 0.68, -0.15);
    g.name = 'root'; return g;
  }
  function ORCDEN(t){
    const g=node('root'),stone='#5b5650',wood='#674a35',iron='#443f41',red='#7d2630',h=HY(37+t*8),R=U(26+t*2);
    footing(g,35,stone);
    add(g,part(G.cyl(R,R*1.07,h,16),stone,{tex:'brick',ink:.005}),0,h/2,0);
    for(let i=0;i<10;i++){const a=i/10*TAU;add(g,part(G.cap(U(2.6),h*.9),wood,{tex:'bark',ink:.003}),S(a)*R,h*.52,C(a)*R,0,a,0);}
    const roof=G.lathe([[0,0],[R*1.18,0],[R*1.12,.10],[R*.63,HY(22+t*3)],[0,HY(28+t*3)]],16);
    add(g,part(roof,'#513b31',{tex:'wood',ink:.006}),0,h,0);
    door(g,R+.012,0,0,U(18),HY(30),'#312727');
    for(const side of [-1,1]){
      const pts=[[side*R*.68,h*.6,R*.85],[side*R*.82,h*1.06,R*.86],[side*R*.66,h*1.34,R*.89],[side*R*.49,h*1.47,R*.92]];
      add(g,part(G.tube(pts,U(2.7),20),'#ddd2b3',{ink:.003}),0,0,0);
      add(g,part(G.sbox(U(4),HY(32+t*3),U(4),.3),iron,{metal:true,ink:.003}),side*U(24),h*.62,U(19));
    }
    const flag=node('war-banner',g,0,h*1.24,R*1.02);
    add(flag,part(G.ext([-U(10),0,U(10),0,U(8),-HY(23),0,-HY(28),-U(8),-HY(23)],.015,.004),red,{tex:'cloth',ds:true,ink:.003}),0,0,0);
    add(flag,part(G.ext([-U(4),-HY(8),0,-HY(13),U(4),-HY(8),U(3),-HY(17),0,-HY(20),-U(3),-HY(17)],.005,0),'#d9cba6',{ink:false}),0,0,.017);
    if(t>=3)for(const side of [-1,1]){
      const sub=node('watchtower',g,side*U(31),0,-U(5));tower(sub,0,h*.85,U(10),U(9),stone);merlons(sub,h*.85,U(9),stone,6);
      add(sub,part(G.cone(U(12),HY(19),12),red,{tex:'tile',ink:.005}),0,h*.85+HY(9.5),0);
    }
    for(const side of [-1,1]){add(g,part(G.cyl(U(1),U(1.4),HY(18),10),iron,{metal:true,ink:false}),side*U(31),HY(9),U(16));glow(g,side*U(31),HY(22),U(16),.28,'#ff9b37',.5);}
    return g;
  }

  const MAKERS = { orc:ORCDEN, archer: ARCHER, mage: MAGE, barracks: BARRACKS, artillery: DWARFHALL };
  function masterTower(root,type,tier){
    // Ornamental architecture from the master sheet; actual depth and materials.
    const H=HY(({barracks:[0,42,52,64,78],archer:ARCH_TOP,mage:MAGE_TOP,artillery:[0,44,55,67,80],orc:[0,42,54,66,80]}[type]||[0,45,55,65,75])[tier]);
    const stone=type==='mage'?'#a29ab4':type==='orc'?'#685448':'#c5c0aa';
    for(const side of [-1,1]){
      if(type==='barracks'||type==='mage'){
        const g=node('reference-buttress',root,side*.52,0,-.15);
        add(g,part(G.cyl(.09,.12,H*.85,18),stone,{tex:'brick',ink:.003}),0,H*.43,0);
        add(g,part(G.bentCone(.15,.42,.06),type==='mage'?'#5b378f':'#244f99',{tex:'roof',ink:.003}),0,H*.86+.20,0);
        add(g,part(G.cone(.02,.12),GOLD,{metal:true,ink:false}),0,H*.86+.45,0);
      }
      if(type==='archer'){
        add(root,part(G.tube([[side*.60,.08,-.1],[side*.42,H*.42,-.2],[side*.50,H*.86,-.22],[side*.25,H+.15,-.20]],.045,24),'#8a7846',{tex:'wood',ink:.003}),0,0,0);
        for(let j=0;j<8;j++)add(root,part(leafShape(.055,.16),'#497637',{tex:'leaf',ds:true,ink:false}),side*(.47+.07*S(j*2.4)),H*(.35+j*.065),-.12,0,side*.7,side*.5);
      }
    }
    if(type==='mage')for(let j=0;j<3+tier;j++){const a=j/(3+tier)*TAU;add(root,part(G.oct(.065,2.4),'#a165f0',{glow:.8,ink:false}),S(a)*.55,H+.18+C(a)*.08,C(a)*.55);}
  }
  function build(type, tier) { const f = MAKERS[type]; if (!f) return null; const r = f(Math.max(1, Math.min(4, tier || 1))); r.name = 'root'; masterTower(r,type,Math.max(1,Math.min(4,tier||1))); return r; }

  // đưa vào Xưởng 3D (nhóm "Công trình")
  const pal = (...a) => a.map(([c, l]) => ({ c, l }));
  const DEFS = [
    ['archer', 'Trụ Elf', 'Tháp gỗ → tháp đá dây leo → tháp trắng viền vàng, cửa sổ ngọc', pal(['#8a5a32', 'Gỗ'], ['#a8a4b4', 'Đá'], ['#eef0f2', 'Đá trắng'], ['#2f8a40', 'Cờ lá'])],
    ['mage', 'Trụ Phù Thủy', 'Tháp đá tím có vòng chữ phép phát sáng, pha lê tím ở chân (cấp 3+)', pal(['#8e8a9e', 'Đá'], ['#8a5ad8', 'Vòng phép'], ['#5a3ac0', 'Cờ'], ['#9a6ae8', 'Pha lê'])],
    ['barracks', 'Trại Lính', 'Nhà gỗ mái rơm → nhà gạch mái đỏ → lâu đài 2 tháp mái nhọn', pal(['#b8864e', 'Gỗ'], ['#c8c4cc', 'Tường'], ['#8a1e24', 'Mái đỏ'], ['#f5c542', 'Vàng'])],
    ['artillery', 'Sảnh Người Lùn', 'Cửa hầm mỏ → lò rèn đá → sảnh tròn có mặt đá râu dài, sừng vàng', pal(['#8a8290', 'Đá núi'], ['#6a5a52', 'Mái'], ['#ff9a3a', 'Lửa lò'], ['#f2ead6', 'Sừng'])]
  ];
  DEFS.push(['orc','Trại Chiến Thú','Trại sói với gỗ, giáp sắt, ngà và cờ đỏ; thêm tháp canh khi nâng cấp.',pal(['#674a35','Gỗ'],['#5b5650','Đá'],['#7d2630','Cờ'])]);
  DEFS.forEach(([type, name, desc, palette]) => Chars3D.list.push({ id: 'tower_' + type, name, group: 'Công trình', role: 'Trụ · 4 cấp', tiers: 4, tierName: 'Cấp trụ', desc, palette,
    make: t => ({ rig: { root: build(type, t), n: {}, o: {} }, anim: { kind: 'static' } }) }));

  window.Towers3D = { build, plot: PLOT, U, HY, TOPS: { archer: ARCH_TOP, mage: MAGE_TOP, artillery: ART_TOP }, kit: { plinth, body, trim, spire, turret, crest, gate, archWin, footing, tower, rAt, onCyl, win, door, banner, planks, beam, merlons, house, stakes, leafShape } };
})();
