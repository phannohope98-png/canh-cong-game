/* =========================================================
 * props3d.js – Vật trang trí & công trình bản đồ dựng 3D (cây, đá, xương rồng, pha lê,
 * đèn, thùng, lều, nhà, lâu đài cổng, tượng đài, pháo đài, cổng hư vô…)
 * Theo bảng màu từng vùng của mapart.js (MapArt.TH). Gốc = chân vật trên mặt đất, mặt trước +Z.
 * Đơn vị như towers3d: 1 m = 40 đv ngang, chiều cao quy đổi HY() theo góc nhìn.
 * API: Props3D.build(key, themeName, v, prop) → Group tĩnh (null nếu không có mẫu)
 * ========================================================= */
(function () {
  'use strict';
  if (!window.THREE || !window.Chars3D || !window.Towers3D) return;
  const T = THREE, { part, G, add, node, mat, glow, sh, flipY } = Chars3D.kit, GOLD = Chars3D.kit.GOLD;
  const { U, HY } = Towers3D, TK = Towers3D.kit;
  const TAU = Math.PI * 2, S = Math.sin, C = Math.cos;
  const th = name => (window.MapArt && MapArt.TH[name]) || (window.MapArt && MapArt.TH.forest) || { tree: ['#3f8a2e', '#4f9a34', '#2f7a2a'], flowers: [] };
  const rockGeo = (r, sx, sy, sz, detail) => new T.DodecahedronGeometry(r, detail || 0).scale(sx || 1, sy || 1, sz || 1);
  const ROCK = { lava: '#3a2e2e', desert: '#b8703c', chaos: '#4a3a6a', ice: '#8aa0b8' };
  const seeded = s => () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };

  /* ================= VẬT NHỎ / CÂY ================= */
  const D = {
    tree(g, P, v) {
      const c = P.tree[Math.min(2, (v * 3) | 0)];
      add(g, part(G.cyl(U(3.4), U(4.6), HY(20), 10), '#6a4426', { tex: 'bark' }), 0, HY(10), 0);
      for(const [x,y,z] of [[-15,30,4],[14,34,-3],[0,47,0]]) TK.beam(g,[0,HY(12),0],[U(x),HY(y),U(z)],U(2), '#70543d');
      for (const [j,x,y,z,r] of [[0,-14,30,4,16],[1,13,33,-2,15],[2,0,45,2,19],[3,-8,54,-4,13],[4,10,51,5,14]]) {
        const geo=G.ball(U(r),1.15,.85,1,24), a=geo.attributes.position;
        for(let i=0;i<a.count;i++) {const xx=a.getX(i),yy=a.getY(i),zz=a.getZ(i), f=1+.15*S(xx*19+v*7+j)*C(yy*17+zz*13);a.setXYZ(i,xx*f,yy*f,zz*f);}
        geo.computeVertexNormals();add(g,part(geo,sh(c,(j-2)*.035),{tex:'leaf',ink:.004}),U(x),HY(y),U(z));
      }
      for (const [x, y, z, r] of [[-12, 33, 12, 6], [6, 47, 12, 6]]) add(g, new T.Mesh(G.ball(U(r), 1, 0.7, 1, 10), mat(sh(c, 0.16))), U(x), HY(y), U(z));
      if (v > 0.8 && P.flowers.length) for (const [x, y, z] of [[-12, 30, 14], [6, 44, 14], [12, 28, 13]]) add(g, new T.Mesh(G.ball(U(2), 1, 1, 1, 6), mat(P.flowers[2] || '#ff9ab8')), U(x), HY(y), U(z));
    },
    pine(g, P, v, name, snow) {
      const c = P.tree[Math.min(2, (v * 3) | 0)];
      add(g, part(G.cyl(U(2.5), U(3.2), HY(12), 8), '#5a3a22', { tex: 'bark' }), 0, HY(6), 0);
      for (const [y, w, h] of [[8, 20, 22], [24, 16, 20], [38, 11, 18]]) {
        add(g, part(G.lathe([[0,0],[U(w)*.75,0],[U(w),HY(h)*.12],[U(w)*.66,HY(h)*.45],[U(w)*.26,HY(h)*.80],[0,HY(h)]],20),c,{tex:'leaf',ink:.004}),0,HY(y),0);
        if (snow) add(g, part(G.cone(U(w) * 0.6, HY(h) * 0.5, 9), '#ffffff', { ink: 0.012 }), 0, HY(y + h * 0.75) + 0.01, 0);
      }
    },
    snowpine(g, P, v) { D.pine(g, P, v, 'ice', true); },
    bush(g, P, v) {
      const c = sh(P.tree[Math.min(2, (v * 3) | 0)], 0.06);
      for (const [x, y, z, r] of [[-6, 7, 0, 9], [6, 8, -2, 9], [0, 12, 2, 8]]) add(g, part(G.ball(U(r), 1, 0.85, 1, 12), c, { tex: 'leaf' }), U(x), HY(y), U(z));
      if (P.flowers.length && v > 0.5) for (const [x, y] of [[-6, 13], [4, 16], [8, 9]]) add(g, new T.Mesh(G.ball(U(2), 1, 1, 1, 6), mat(P.flowers[0])), U(x), HY(y), U(8));
    },
    drybush(g) { for (const a of [-1.2, -0.7, -0.2, 0.3, 0.8, 1.2]) TK.beam(g, [0, 0, 0], [S(a) * U(14), HY(14) * C(a * 0.6), C(a * 3) * U(4)], U(1.1), '#8a6a3a'); },
    rock(g, P, v, name) {
      const c = ROCK[name] || '#9a96a0';
      add(g, part(rockGeo(U(15), 1, 0.65, 0.85, 1), c, { tex: 'rock' }), 0, HY(5), 0, 0, v * 3, 0);
      add(g, part(rockGeo(U(8), 1, 0.7, 0.9), sh(c, -0.06), { tex: 'rock' }), U(12), HY(3), U(4), 0, v * 5, 0);
      if (name === 'ice') add(g, part(G.ball(U(11), 1, 0.3, 0.8, 10), '#ffffff', { ink: 0.012 }), 0, HY(10), 0);
      if (name === 'forest' && v > 0.6) add(g, new T.Mesh(G.ball(U(6), 1, 0.35, 1, 8), mat('#5a9a3a')), -U(4), HY(10), U(2));
    },
    stump(g) {
      add(g, part(G.cyl(U(7.5), U(8.5), HY(10), 12), '#7a4a26', { tex: 'bark' }), 0, HY(5), 0);
      add(g, new T.Mesh(G.cyl(U(7.2), U(7.2), 0.01, 12), mat('#c89a5a')), 0, HY(10) + 0.005, 0);
      add(g, new T.Mesh(G.torus(U(4), U(0.5)).rotateX(Math.PI / 2), mat('#9a6a3a')), 0, HY(10) + 0.01, 0);
    },
    mush(g) {
      for (const [x, s] of [[-5, 1], [5, 0.75]]) {
        add(g, part(G.cyl(U(1.6) * s, U(2) * s, HY(7) * s, 8), '#f2e8d0', { ink: 0.01 }), U(x), HY(3.5) * s, 0);
        add(g, part(G.ball(U(6) * s, 1, 0.55, 1, 12), '#d83a2a', { ink: 0.012 }), U(x), HY(7) * s, 0);
        for (const a of [0.3, 2.2, 4.1]) add(g, new T.Mesh(G.ball(U(1.1) * s, 1, 0.6, 1, 6), mat('#ffffff')), U(x) + S(a) * U(3.6) * s, HY(8.4) * s, C(a) * U(3.6) * s);
      }
    },
    cactus(g) {
      const c = '#5a9a3a';
      add(g, part(G.cap(U(4.5), HY(28)), c, { tex: 'cactus' }), 0, HY(17), 0);
      add(g, part(G.cap(U(2.6), HY(8)), c), U(10), HY(24), 0); add(g, part(G.cap(U(2.4), U(6)).rotateZ(Math.PI / 2), c), U(6), HY(20), 0);
      add(g, part(G.cap(U(2.4), HY(6)), c), -U(9), HY(18), 0); add(g, part(G.cap(U(2.2), U(5)).rotateZ(Math.PI / 2), c), -U(6), HY(15), 0);
      add(g, new T.Mesh(G.ball(U(2.6), 1, 0.7, 1, 8), mat('#ff8ab8')), 0, HY(33), 0);
    },
    palm(g) {
      add(g, part(G.tube([[0, 0, 0], [U(2), HY(15), 0], [U(4), HY(30), 0], [U(6), HY(44), 0]], U(2.6), 12), '#8a6a3a', { tex: 'bark' }), 0, 0, 0);
      for (let i = 0; i < 7; i++) { const a = i / 7 * TAU; const l = node('leaf'); l.position.set(U(6), HY(44), 0); l.rotation.set(0, a, 0); g.add(l); add(l, part(TK.leafShape(0.22, 0.75).rotateX(Math.PI / 2 - 0.3), '#4a9a3a'), 0, 0, 0, 1.0, 0, 0); }
      for (const a of [0.5, 2.6, 4.4]) add(g, part(G.ball(U(2.4), 1, 1, 1, 8), '#6a4a26', { ink: 0.01 }), U(6) + S(a) * U(3), HY(41), C(a) * U(3));
    },
    deadtree(g, P, v, name) {
      const c = name === 'chaos' ? '#2a1e40' : name === 'lava' ? '#241a1a' : '#5a4636';
      add(g, part(G.cyl(U(2.2), U(3.6), HY(30), 8), c, { tex: 'bark' }), 0, HY(15), 0);
      for (const [a, y, l, up] of [[0.6, 18, 13, 12], [-0.8, 24, 12, 14], [2.4, 26, 10, 10], [-2.2, 14, 9, 7]]) TK.beam(g, [0, HY(y), 0], [S(a) * U(l), HY(y + up), C(a) * U(l) * 0.6], U(1.3), c);
    },
    bones(g) {
      for (const [x, z, a] of [[-6, 2, 0.4], [5, -2, -0.6]]) { const b = node('bone'); b.position.set(U(x), HY(1.2), U(z)); b.rotation.y = a; g.add(b); add(b, part(G.cyl(U(1.1), U(1.1), U(12), 6).rotateZ(Math.PI / 2), '#efe6d0', { ink: 0.008 }), 0, 0, 0); for (const s of [-1, 1]) add(b, part(G.ball(U(1.8), 1, 1, 1, 6), '#efe6d0', { ink: 0.008 }), s * U(6), 0, 0); }
      add(g, part(G.ball(U(4), 1, 0.9, 1, 10), '#efe6d0', { ink: 0.01 }), U(2), HY(3.5), U(6));
      for (const s of [-1, 1]) add(g, new T.Mesh(G.ball(U(1), 1, 1, 0.5, 6), mat('#2a1a14')), U(2) + s * U(1.4), HY(4), U(9.6));
    },
    barrel(g) {
      add(g, part(G.lathe([[0, 0], [U(6), 0], [U(7.2), HY(8)], [U(6), HY(16)], [0, HY(16)]], 14), '#9a6a3a', { tex: 'wood' }), 0, 0, 0);
      for (const y of [4, 12]) add(g, new T.Mesh(G.torus(U(6.9), U(0.6)).rotateX(Math.PI / 2), mat('#4a4a52')), 0, HY(y), 0);
    },
    crate(g) {
      add(g, part(G.sbox(U(18), HY(14), U(16), 0.15), '#b8864e', { tex: 'wood.f' }), 0, HY(7), 0);
      for (const s of [-1, 1]) add(g, new T.Mesh(G.sbox(U(18.2), HY(1.5), U(16.2)), mat('#7a5232')), 0, HY(7 + s * 5), 0);
      add(g, new T.Mesh(G.sbox(U(1.6), HY(15), U(16.4)), mat('#7a5232')), 0, HY(7), 0, 0, 0, 0.7);
    },
    hay(g) {
      add(g, part(G.lathe([[0, 0], [U(14), 0], [U(13), HY(10)], [U(8), HY(18)], [0, HY(20)]], 14), '#e2b84e', { tex: 'straw' }), 0, 0, 0);
      for (const y of [6, 13]) add(g, new T.Mesh(G.torus(U(13.5 - y * 0.25), U(0.6)).rotateX(Math.PI / 2), mat('#b88a2e')), 0, HY(y), 0);
    },
    spire(g, P, v) {
      const h = 46 + v * 16;
      add(g, part(G.cone(U(12), HY(h), 5), '#2e2426', { tex: 'rock' }), 0, HY(h / 2), 0, 0, v * 2, 0.05);
      add(g, part(G.cone(U(6), HY(h * 0.55), 5), '#3a2e30', { tex: 'rock' }), U(9), HY(h * 0.27), U(3), 0, 1, -0.12);
      add(g, new T.Mesh(G.sbox(U(1.6), HY(h * 0.5), U(1)), mat('#ff7a2a', { glow: 1.6 })), U(1), HY(h * 0.35), U(5.5), 0, 0, 0.15);
    },
    redcrystal(g, P, v, name, col) {
      col = col || '#e0402a';
      for (const [x, h, a] of [[-5, 20, -0.2], [3, 28, 0.1], [9, 14, 0.4]]) add(g, part(G.oct(U(4), HY(h) / U(8)), col, { glow: 0.5, ink: 0.012 }), U(x), HY(h * 0.4), 0, 0, 0, -a);
      glow(g, 0, HY(16), U(4), 0.9, col, 0.35);
    },
    icecrystal(g, P, v) { D.redcrystal(g, P, v, 'ice', '#9ad8f4'); },
    voidcrystal(g, P, v) { D.redcrystal(g, P, v, 'chaos', '#b070ff'); },
    rune(g) {
      add(g, part(G.cyl(U(12), U(12.5), HY(3), 16), '#3a2c66'), 0, HY(1.5), 0);
      add(g, new T.Mesh(G.torus(U(8), U(0.8)).rotateX(Math.PI / 2), mat('#c88cff', { glow: 1.6 })), 0, HY(3) + 0.005, 0);
      for (let i = 0; i < 4; i++) { const a = i / 4 * TAU; add(g, new T.Mesh(G.sbox(U(1), 0.005, U(3)), mat('#e0b0ff', { glow: 1.6 })), S(a) * U(5), HY(3) + 0.006, C(a) * U(5), 0, a, 0); }
      glow(g, 0, HY(4), 0, 0.6, '#b070ff', 0.4);
    },
    brazier(g) {
      add(g, part(G.cyl(U(1.4), U(1.8), HY(16), 8), '#4a3a2a'), 0, HY(8), 0);
      add(g, part(G.cyl(U(7), U(4.5), HY(6), 12), '#3a3036'), 0, HY(19), 0);
      for (const [x, h, c] of [[-2, 12, '#ff8a1a'], [2, 9, '#ffb04a'], [0, 7, '#ffe06a']]) add(g, part(G.cone(U(3.5), HY(h), 8), c, { glow: 0.9, ink: 0.01 }), U(x), HY(22 + h / 2), 0);
      glow(g, 0, HY(28), 0, 1.2, '#ff9a2a', 0.55);
    },
    lamp(g, P, v, name) {
      if (name === 'desert' || name === 'lava') {
        add(g, part(G.cyl(U(1.6), U(2), HY(32), 8), '#6a4426'), 0, HY(16), 0);
        add(g, part(G.cyl(U(4.5), U(3.5), HY(6), 10), '#3a3036'), 0, HY(34), 0);
        add(g, part(G.cone(U(4), HY(12), 8), '#ff8a1a', { glow: 1, ink: 0.01 }), 0, HY(43), 0);
        glow(g, 0, HY(42), 0, 1.3, '#ff9a2a', 0.6); return;
      }
      const lc = name === 'ice' ? '#9ae0ff' : name === 'chaos' ? '#d08aff' : '#ffd060';
      add(g, part(G.sbox(U(8), HY(5), U(8), 0.3), '#4a4a56'), 0, HY(2.5), 0);
      add(g, part(G.cyl(U(1.3), U(1.6), HY(36), 8), '#5a5a6a', { metal: 1 }), 0, HY(20), 0);
      add(g, part(G.cyl(U(4), U(5.5), HY(11), 6), lc, { glow: 1.3 }), 0, HY(44), 0);
      add(g, part(G.cone(U(7.5), HY(7), 6), name === 'chaos' ? '#3a2c66' : '#3a3a48'), 0, HY(53), 0);
      add(g, part(G.cyl(U(7), U(7), HY(2.5), 6), '#3a3a48'), 0, HY(38.5), 0);
      glow(g, 0, HY(44), 0, 1.4, lc, 0.6);
    },
    flowerbed(g, P, v) {
      const cols = P.flowers.length ? P.flowers : ['#ff9ab8'];
      add(g, part(G.cyl(U(16), U(17), HY(3), 16).scale(1, 1, 0.8), sh(P.g0 || '#6aa83e', -0.2)), 0, HY(1.5), 0);
      const r = seeded(Math.floor(v * 999) + 7);
      for (let i = 0; i < 11; i++) { const a = r() * TAU, rr = r() * U(12); add(g, new T.Mesh(G.ball(U(2.4), 1, 1, 1, 6), mat(cols[i % cols.length])), S(a) * rr, HY(4), C(a) * rr * 0.8); }
    }
  };

  /* ================= CÔNG TRÌNH LỚN ================= */
  function blueRoofTower(g, x, z, y0, y1, r, wall, roof, roofH) {
    const t = node('tw'); t.position.set(x, 0, z); g.add(t);
    TK.tower(t, y0, y1, r, r * 0.93, wall);
    add(t, part(G.cone(r * 1.25, roofH, 18), roof, { tex: 'tile' }), 0, y1 + roofH / 2, 0);
    add(t, part(G.sbox(0.04, 0.06, 0.04), GOLD, { metal: 1, ink: 0.008 }), 0, y1 + roofH + 0.02, 0);
    TK.win(t, r * 0.95, (y0 + y1) * 0.55, 0, 0.1, 0.2);
    return t;
  }
  function wallRun(g, x0, x1, z, h, d, col, merl) {
    const w = Math.abs(x1 - x0), cx = (x0 + x1) / 2;
    add(g, part(G.sbox(w, h, d, 0.12), col, { tex: 'stone.f' }), cx, h / 2, z);
    const n = Math.max(2, Math.round(w / 0.3));
    if (merl) for (let i = 0; i < n; i++) add(g, part(G.sbox(0.16, 0.16, d * 1.02, 0.3), col, { ink: 0.014, tex: 'stone.f' }), x0 + (i + 0.5) * (x1 - x0) / n, h + 0.08, z);
  }
  function arch(g, w, h, z, col) { // khung cổng vòm + lỗ tối + song sắt
    const s = new T.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(w / 2, h - w / 2); s.absarc(0, h - w / 2, w / 2, 0, Math.PI, false); s.lineTo(-w / 2, 0);
    add(g, new T.Mesh(G.ext(s, 0.02, 0.004), mat('#1c1218')), 0, 0, z);
    for (let i = -2; i <= 2; i++) add(g, part(G.cyl(0.012, 0.012, h * 0.7, 6), '#6a625a', { ink: 0.006 }), i * w * 0.18, h * 0.35 + 0.02, z + 0.02);
    add(g, part(G.cyl(0.012, 0.012, w * 0.95, 6).rotateZ(Math.PI / 2), '#6a625a', { ink: 0.006 }), 0, h * 0.4, z + 0.02);
    add(g, part(G.torus(w / 2 + 0.03, 0.035, Math.PI), col), 0, h - w / 2, z + 0.01);
  }
  const PROPS = {
    monument(g, p) {
      const t = p.theme, stone = t === 'desert' ? '#e2c48e' : t === 'ice' ? '#d4e0ec' : t === 'lava' ? '#6a5a58' : '#c8c0b0';
      add(g, part(G.cyl(U(112), U(114), 0.06, 40), sh(stone, -0.22), { tex: 'stone' }), 0, 0.03, 0);
      add(g, part(G.cyl(U(106), U(106), 0.04, 40), stone, { ink: 0.01, tex: 'flag' }), 0, 0.07, 0);
      for (const rr of [30, 56, 82]) add(g, new T.Mesh(G.torus(U(rr), 0.008, Math.PI * 2).rotateX(Math.PI / 2), mat(sh(stone, -0.4))), 0, 0.092, 0);
      for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; add(g, new T.Mesh(G.sbox(0.012, 0.004, U(76)), mat(sh(stone, -0.4))), S(a) * U(68), 0.092, C(a) * U(68), 0, a, 0); }
      add(g, part(G.cyl(U(46), U(46), 0.03, 32), t === 'lava' ? '#3a2a28' : t === 'ice' ? '#ffffff' : t === 'desert' ? '#c8a050' : '#6aa83e', { ink: 0.01 }), 0, 0.1, 0);
      if (t === 'forest' || t === 'castle') { // đài phun nước
        add(g, part(G.cyl(U(30), U(31), HY(10), 28), '#b8b2a6', { tex: 'stone' }), 0, HY(5) + 0.1, 0);
        add(g, new T.Mesh(G.cyl(U(27), U(27), 0.01, 28), mat('#4aa8d8', { glow: 0.25 })), 0, HY(10) + 0.1, 0);
        add(g, part(G.cyl(U(6), U(7), HY(22), 14), '#c8c2b6'), 0, HY(21), 0);
        add(g, part(G.cyl(U(16), U(10), HY(4), 18), '#b8b2a6'), 0, HY(33), 0);
        add(g, part(G.cyl(U(3.5), U(4), HY(14), 10), '#c8c2b6'), 0, HY(41), 0);
        add(g, part(G.ball(U(4), 1, 1, 1, 10), '#bfeaff', { glow: 0.6 }), 0, HY(50), 0);
        for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + 0.4; add(g, new T.Mesh(G.tube([[0, HY(49), 0], [S(a) * U(9), HY(56), C(a) * U(9)], [S(a) * U(15), HY(36), C(a) * U(15)]], U(1), 10), mat('#c8f0ff', { op: 0.75 })), 0, 0, 0); }
      } else if (t === 'desert') { // tháp đá cổ
        add(g, part(G.cyl(U(20), U(21), HY(12), 4), '#d2b07a'), 0, HY(6) + 0.1, 0, 0, Math.PI / 4, 0);
        add(g, part(G.cyl(U(3), U(9), HY(70), 4), '#e8c88e'), 0, HY(47), 0, 0, Math.PI / 4, 0);
        add(g, part(G.cone(U(3.4), HY(10), 4), GOLD, { metal: 1 }), 0, HY(87), 0, 0, Math.PI / 4, 0);
        for (const y of [32, 52]) add(g, part(G.oct(U(2.6), 1.4).scale(1, 1, 0.4), '#3ab0c8', { glow: 1, ink: 0.008 }), 0, HY(y), U(7.6 - y * 0.06));
      } else if (t === 'ice') { // tượng pha lê băng
        add(g, part(G.cyl(U(22), U(23), HY(12), 20), '#b8c8da'), 0, HY(6) + 0.1, 0);
        for (const [x, h, a] of [[-10, 40, -0.25], [0, 62, 0], [10, 44, 0.25]]) add(g, part(G.oct(U(6), HY(h) / U(12)), '#9ad8f4', { glow: 0.5, ink: 0.014 }), U(x), HY(12 + h * 0.45), 0, 0, 0, -a);
        glow(g, 0, HY(46), 0, 2.2, '#9ae0ff', 0.5);
      } else { // bệ lửa thiêng
        add(g, part(G.cyl(U(22), U(24), HY(14), 16), '#4a3e44'), 0, HY(7) + 0.1, 0);
        add(g, part(G.ball(U(5), 1, 0.9, 1, 10), '#f2ead6', { ink: 0.01 }), 0, HY(8), U(23));
        for (const [x, h, c] of [[-5, 34, '#ff7a1a'], [5, 26, '#ffb04a'], [0, 20, '#ffe060']]) add(g, part(G.cone(U(9), HY(h), 10), c, { glow: 1, ink: 0.012 }), U(x), HY(14 + h / 2), 0);
        glow(g, 0, HY(34), 0, 2.4, '#ff7a2a', 0.7);
      }
    },
    castle(g, p) { // lâu đài canh cổng cuối đường
      const wall = p.snow ? '#d6dee8' : '#c4beb2', k = 1.25, blue = '#2a52c8';
      for (const s of [-1, 1]) wallRun(g, s * U(16 * k), s * U(78 * k), -U(6), HY(42 * k), U(14), s > 0 ? sh(wall, -0.06) : wall, true);
      blueRoofTower(g, U(62 * k), -U(40), HY(10), HY(96 * k), U(16 * k), wall, blue, HY(40 * k));
      for (const s of [-1, 1]) { const tw = blueRoofTower(g, s * U(30 * k), U(4), 0, HY(66 * k), U(15 * k), wall, blue, HY(36 * k)); TK.banner(tw, U(15 * k), HY(58 * k), 0, 0.22, 0.34, blue, GOLD); }
      add(g, part(G.sbox(U(32 * k), HY(38 * k), U(18), 0.12), wall, { tex: 'stone.f' }), 0, HY(19 * k), U(4));
      arch(g, U(22 * k), HY(30 * k), U(13.2), wall);
      if (p.snow) for (const s of [-1, 1]) add(g, part(G.sbox(U(60 * k), 0.05, U(15), 0.5), '#ffffff', { ink: 0.01 }), s * U(47 * k), HY(42 * k) + 0.03, -U(6));
    },
    fort(g, p) {
      const wall = p.dark ? '#4a3e44' : '#d8b07a', roof = p.dark ? '#7a1e1a' : '#c04a3a', k = 1.2;
      for (const s of [-1, 1]) wallRun(g, s * U(16 * k), s * U(70 * k), -U(6), HY(38 * k), U(14), s > 0 ? sh(wall, -0.06) : wall, true);
      for (const s of [-1, 1]) { const t = node('tw'); t.position.x = s * U(32 * k); g.add(t); TK.tower(t, 0, HY(58 * k), U(15 * k), U(13 * k), wall); TK.merlons(t, HY(58 * k), U(13 * k), wall, 7); TK.banner(t, U(13.5 * k), HY(50 * k), 0, 0.2, 0.36, roof, GOLD); }
      add(g, part(G.sbox(U(32 * k), HY(40 * k), U(18), 0.12), wall, { tex: 'stone.f' }), 0, HY(20 * k), U(2));
      arch(g, U(20 * k), HY(26 * k), U(11.2), wall);
      if (p.dark) glow(g, 0, HY(10), U(14), 1.2, '#ff6a2a', 0.45);
    },
    gateway(g) {
      const c = '#8a8494';
      for (const s of [-1, 1]) add(g, part(G.sbox(U(14), HY(48), U(14), 0.2), s > 0 ? sh(c, -0.1) : c, { tex: 'stone.f' }), s * U(30), HY(24), 0);
      add(g, part(G.tube([[-U(30), HY(44), 0], [-U(18), HY(58), 0], [0, HY(62), 0], [U(18), HY(58), 0], [U(30), HY(44), 0]], U(6), 16), c), 0, 0, 0);
      add(g, part(G.ball(U(5), 1, 0.9, 0.8, 10), '#f2ead6', { ink: 0.01 }), 0, HY(56), U(5));
      for (const s of [-1, 1]) add(g, new T.Mesh(G.ball(U(1.3), 1, 1, 0.5, 6), mat('#ff3a2a', { glow: 1.5 })), s * U(1.8), HY(57), U(9));
    },
    cabin(g) { TK.house(g, 0, 0, U(46), HY(26), U(32), '#a8784a', '#c04a3a', HY(20)); TK.door(g, U(16), 0, 0, 0.26, 0.38, '#7a5232').position.x = -U(6); TK.win(g, U(16), HY(13), 0, 0.12, 0.17).position.x = U(12); },
    house(g, p) {
      // Timber frame, stone doorstep and chimney give cottages readable scale.
      for(const x of [-21,0,21]) add(g,part(G.sbox(U(2),HY(28),U(2),.2),'#66513e',{tex:'wood.f',ink:.003}),U(x),HY(14),U(16.2));
      for(const y of [3,26]) add(g,part(G.sbox(U(44),HY(2),U(2),.2),'#66513e',{ink:.003}),0,HY(y),U(16.3));
      for(let i=0;i<3;i++) add(g,part(G.sbox(U(16+i*3),HY(2),U(5),.3),'#aaa393',{tex:'stone.f',ink:.003}),0,HY(1-i*.3),U(18+i*4));
      add(g,part(G.sbox(U(7),HY(22),U(7),.15),'#998d7e',{tex:'brick.f',ink:.004}),U(13),HY(37),-U(6));
      add(g,part(G.sbox(U(9),HY(2),U(9),.2),'#b5a898',{ink:.003}),U(13),HY(49),-U(6));
      TK.house(g, 0, 0, U(44), HY(28), U(32), p.snow ? '#e0e6ee' : '#d4ccbc', p.snow ? '#6a7aa0' : '#b8483a', HY(20));
      if (p.snow) add(g, part(G.sbox(U(48), 0.05, U(36), 0.5), '#ffffff', { ink: 0.01 }), 0, HY(28) * 1.2 + HY(20) * 0.7 * 0.5, 0, 0.5);
      TK.door(g, U(16), 0, 0, 0.26, 0.4, '#7a5232'); for (const s of [-1, 1]) TK.win(g, U(16), HY(15), 0, 0.12, 0.17).position.x = s * U(13);
    },
    ruin(g, p) {
      const c = p.theme === 'desert' ? '#d8b07a' : p.theme === 'lava' ? '#4a3e44' : '#a8a296';
      for (const [x, h, z] of [[-22, 40, -4], [-6, 26, 4], [12, 46, -6], [26, 18, 2]]) { add(g, part(G.cyl(U(6), U(6.5), HY(h), 12), c, { tex: 'stone' }), U(x), HY(h / 2), U(z)); add(g, part(G.sbox(U(15), HY(4), U(15), 0.3), sh(c, 0.06), { ink: 0.012 }), U(x), HY(2), U(z)); }
      add(g, part(G.sbox(U(30), HY(5), U(10), 0.3), sh(c, -0.05)), U(4), HY(46), -U(5), 0, 0.2, -0.1);
      for (const [x, z, r] of [[-34, 8, 6], [30, 10, 5], [0, 14, 4]]) add(g, part(rockGeo(U(r), 1, 0.6, 1), c, { tex: 'rock' }), U(x), HY(2), U(z));
    },
    tent(g, p) {
      const c = p.dark ? '#5a2a3a' : '#e8d8b8', st = p.dark ? '#2a1a20' : '#c04a3a';
      add(g, part(G.cone(U(30), HY(40), 6), c, { tex: 'cloth' }), 0, HY(20), 0, 0, Math.PI / 6, 0);
      for (let i = 0; i < 6; i += 2) { const a = i / 6 * TAU + Math.PI / 6; add(g, new T.Mesh(new T.ConeGeometry(U(30) * 1.005, HY(40) * 1.005, 6, 1, true, a, TAU / 12), mat(st, { ds: true })), 0, HY(20), 0); }
      add(g, new T.Mesh(G.ext([-U(8), 0, U(8), 0, 0, HY(20)], 0.01, 0.002), mat('#2a1a14')), 0, 0, U(26));
      add(g, part(G.cyl(U(1), U(1), HY(14), 6), '#7a4a26', { ink: 0.008 }), 0, HY(46), 0);
      add(g, part(G.ext([0, 0, U(12), -HY(4), 0, -HY(8)], 0.01, 0.003), st, { ds: true }), 0, HY(53), 0);
    },
    mesa(g) {
      const c = '#c07a40';
      add(g, part(G.lathe([[0, 0], [U(64), 0], [U(60), HY(20)], [U(56), HY(38)], [U(48), HY(46)], [0, HY(46)]], 9, 0.45), c, { tex: 'rock' }), 0, 0, 0, 0, 0.3, 0);
      add(g, new T.Mesh(G.cyl(U(47), U(47), 0.01, 9).scale(1, 1, 0.45), mat('#e0a060')), 0, HY(46) + 0.006, 0, 0, 0.3, 0);
      for (const y of [14, 28]) add(g, new T.Mesh(G.torus(U(62 - y * 0.15), 0.012, TAU).rotateX(Math.PI / 2).scale(1, 1, 0.45), mat('#8a4a1a')), 0, HY(y), 0, 0, 0.3, 0);
    },
    well(g) {
      TK.tower(g, 0, HY(12), U(13), U(13), '#9a96a0');
      add(g, new T.Mesh(G.cyl(U(11), U(11), 0.01, 16), mat('#2a6a9a', { glow: 0.2 })), 0, HY(12) - 0.02, 0);
      for (const s of [-1, 1]) TK.beam(g, [s * U(12), HY(10), 0], [s * U(12), HY(32), 0], U(1.4), '#7a4a26');
      add(g, part(G.ext([-U(10), 0, U(10), 0, 0, HY(10)], U(30), 0.006).rotateY(Math.PI / 2), '#b8483a', { tex: 'tile.f' }), 0, HY(31), 0);
      add(g, part(G.cyl(U(3), U(2.6), HY(5), 8), '#7a5232'), 0, HY(22), 0);
    },
    portal(g) {
      const k = 1.3, st = '#3a2c5a';
      for (const s of [-1, 1]) add(g, part(G.cyl(U(6 * k), U(10 * k), HY(80 * k), 6), st), s * U(34 * k), HY(40 * k), 0, 0, 0, -s * 0.08);
      add(g, part(G.tube([[-U(34 * k), HY(72 * k), 0], [-U(22 * k), HY(100 * k), 0], [0, HY(110 * k), 0], [U(22 * k), HY(100 * k), 0], [U(34 * k), HY(72 * k), 0]], U(7), 16), st), 0, 0, 0);
      add(g, new T.Mesh(G.ball(U(26 * k), 1, HY(40 * k) / U(26 * k), 0.12, 24), mat('#6a2ab0', { glow: 0.9 })), 0, HY(44 * k), 0);
      for (let i = 0; i < 3; i++) add(g, new T.Mesh(G.torus(U((20 - i * 5) * k), U(1.2)).scale(1, HY(36 - i * 8) / U(20 - i * 5), 1), mat('#e0b0ff', { glow: 1.5, op: 0.8 - i * 0.15 })), 0, HY(44 * k), U(2));
      for (const s of [-1, 1]) add(g, part(G.oct(U(5), 1.8), '#c08aff', { glow: 0.8, ink: 0.012 }), s * U(42 * k), HY(52 * k), U(4));
      glow(g, 0, HY(44 * k), U(4), 3.2, '#b070ff', 0.6);
    }
  };

  function build(key, themeName, v, prop) {
    const g = node('root'), P = th(themeName);
    if (prop) { const f = PROPS[key]; if (!f) return null; f(g, prop); return g; }
    const f = D[key]; if (!f) return null;
    f(g, P, v || 0, themeName); return g;
  }
  window.Props3D = { build, has: (k, prop) => !!(prop ? PROPS[k] : D[k]) };
})();
