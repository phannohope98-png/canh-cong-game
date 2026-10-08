/* =========================================================
 * terrain3d.js – Mặt đất bản đồ dựng 3D
 * Lưới mặt đất phủ bằng tranh vẽ tay (cỏ, đường, nước của mapart.js) rồi:
 *   · khoét lòng sông / hồ / dung nham thành bờ dốc thật, mặt nước trong suốt phủ lên
 *   · đường đi trũng nhẹ có gờ hai bên
 *   · đổ bóng theo độ dốc (3 tông kiểu toon) với cùng hướng nắng của nhân vật
 *   · cầu gỗ / cầu đá 3D bắc qua chỗ đường cắt nước
 * Kết quả được chụp 1 lần thành ảnh nền (chia ô ≤ 2048 điểm ảnh để vừa mọi máy).
 * ========================================================= */
(function () {
  if (!window.THREE || !window.Chars3D || !window.MapArt || !window.Art3D) return;
  const T = THREE, { part, G, add, node, mat } = Chars3D.kit, EL = 0.34, cE = Math.cos(EL), sE = Math.sin(EL);
  const WX = x => x / 40, WZ = y => y / (40 * sE);           // toạ độ màn hình (mặt đất) → mét
  const DEPTH = 0.32, WATER_Y = -0.11, ROAD = 0.035, RELIEF = 0.24;
  const LDIR = new T.Vector3(-1.5, 5, 4).normalize(), FLAT = LDIR.y, SDIR = new T.Vector3(-2.4, 3.2, -1.1).normalize();

  function bridge(scene, p, d0, d1, theme, PW) {
    const tmp = {}, stone = theme === 'castle' || theme === 'ice' || theme === 'chaos';
    const wood = theme === 'lava' ? '#4a3a36' : theme === 'desert' ? '#b88a52' : '#9a6a3a';
    const deck = stone ? (theme === 'chaos' ? '#6a5aa0' : theme === 'ice' ? '#c8d4e2' : '#a8a296') : wood;
    const half = (PW / 2 + 9), len = d1 - d0, g = node('bridge'); scene.add(g);
    // điểm 2 mép cầu tại khoảng cách d (tính trên màn hình rồi đổi sang mét để đúng phép chiếu)
    const at = d => { p.pointAt(d, tmp); const L = { x: WX(tmp.x - tmp.nx * half), z: WZ(tmp.y - tmp.ny * half) }, R = { x: WX(tmp.x + tmp.nx * half), z: WZ(tmp.y + tmp.ny * half) }; return { L, R, k: (d - d0) / len }; };
    const lift = k => 0.05 + Math.sin(Math.PI * k) * 0.1;
    for (let d = d0; d < d1; d += stone ? 9 : 6.5) {
      const a = at(d + 3), dx = a.R.x - a.L.x, dz = a.R.z - a.L.z, w = Math.hypot(dx, dz), ang = Math.atan2(-dz, dx);
      add(g, part(G.sbox(w, 0.05, stone ? 0.2 : 0.14, 0.3), (d / 6.5 | 0) % 2 && !stone ? Chars3D.kit.sh(wood, 0.08) : deck, { ink: 0.012 }), (a.L.x + a.R.x) / 2, lift(a.k), (a.L.z + a.R.z) / 2, 0, ang, 0);
    }
    for (const s of [-1, 1]) {
      let prev = null;
      for (let d = d0; d <= d1 + 0.01; d += (d1 - d0) / Math.max(2, Math.round(len / 26))) {
        const a = at(d), q = s < 0 ? a.L : a.R, px = q.x, pz = q.z, y = lift(a.k);
        if (stone) add(g, part(G.sbox(0.1, 0.16, 0.1, 0.3), theme === 'chaos' ? '#5a4a90' : '#8a8478', { ink: 0.012 }), px, y + 0.1, pz);
        else add(g, part(G.cyl(0.025, 0.03, 0.26, 6), wood, { ink: 0.01 }), px, y + 0.13, pz);
        if (prev) Towers3D.kit.beam(g, [prev[0], prev[1] + (stone ? 0.14 : 0.22), prev[2]], [px, y + (stone ? 0.14 : 0.22), pz], stone ? 0.035 : 0.022, stone ? '#8a8478' : Chars3D.kit.sh(wood, -0.1));
        prev = [px, y, pz];
      }
    }
  }

  /* ---------- chi tiết nhỏ dựng bằng khối 3D (vẽ theo lô – InstancedMesh, chỉ dựng 1 lần cùng mặt đất) ---------- */
  let TUFT = null;
  function tuftGeo() { // bụi cỏ: 6 lá nhọn xoè ra, cao ~0.3 m
    if (TUFT) return TUFT;
    const gs = [];
    for (let k = 0; k < 5; k++) {
      const a = k / 5 * Math.PI * 2 + (k % 2) * 0.4, h = 0.2 + (k % 3) * 0.05, w = 0.1;
      const s = new T.Shape(); s.moveTo(-w / 2, 0); s.quadraticCurveTo(-w * 0.2, h * 0.5, w * 0.15, h); s.quadraticCurveTo(w * 0.1, h * 0.45, w / 2, 0); s.lineTo(-w / 2, 0);
      const g = new T.ExtrudeGeometry(s, { depth: 0.012, bevelEnabled: false, curveSegments: 3 }).translate(0, 0, -0.006);
      g.rotateX(-0.45 - (k % 2) * 0.25); g.rotateY(a); g.translate(Math.sin(a) * 0.03, 0, Math.cos(a) * 0.03);
      gs.push(g.toNonIndexed ? g.toNonIndexed() : g);
    }
    TUFT = T.BufferGeometryUtils.mergeBufferGeometries(gs.map(g => { if (g.attributes.uv) g.deleteAttribute('uv'); return g; }), false);
    TUFT.computeVertexNormals(); TUFT.userData.raw = TUFT.clone();
    const n = TUFT.attributes.normal; for (let i = 0; i < n.count; i++) { const x = n.getX(i) * 0.3, y = n.getY(i) * 0.3 + 0.7, z = n.getZ(i) * 0.3 + 0.25, l = Math.hypot(x, y, z); n.setXYZ(i, x / l, y / l, z / l); } // pháp tuyến ngả lên trời: lá sáng đều như tranh vẽ
    return TUFT;
  }
  function batch(scene, geo, list, place, ink) {
    if (!list.length) return;
    const { part, mat } = Chars3D.kit, base = part(geo.userData.raw || geo, '#ffffff', { ink: ink || false });
    const m = new T.InstancedMesh(geo, mat('#ffffff'), list.length), hull = base.children[0], im = hull ? new T.InstancedMesh(hull.geometry, hull.material, list.length) : null;
    const M = new T.Matrix4(), q = new T.Quaternion(), e = new T.Euler(), P = new T.Vector3(), Sc = new T.Vector3(), c = new T.Color();
    list.forEach((it, i) => {
      const o = place(it, i); P.set(o.x, o.y, o.z); e.set(o.rx || 0, o.ry || 0, o.rz || 0); q.setFromEuler(e); Sc.set(o.sx, o.sy, o.sz);
      M.compose(P, q, Sc); m.setMatrixAt(i, M); if (im) im.setMatrixAt(i, M); m.setColorAt(i, c.set(o.c));
    });
    m.frustumCulled = false; scene.add(m);
    if (im) { im.frustumCulled = false; scene.add(im); }
  }
  function details(scene, det, hAt, TH, theme) {
    const K = window.ArtKit, sh = (c, v) => K.shade(c, v), rr = i => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
    const G = Chars3D.kit.G; Chars3D.setInk(0.35);
    // cỏ
    const tc = det.tc, tcs = [tc, sh(tc, -0.1), sh(tc, 0.08), sh(tc, -0.2)];
    batch(scene, tuftGeo(), det.tuft, (t, i) => { const s = t[2] * (theme === 'ice' ? 0.8 : 1); return { x: WX(t[0]), y: hAt(t[0], t[1]) - 0.01, z: WZ(t[1]), ry: rr(i) * 6.28, sx: s * 1.1, sy: s, sz: s * 1.1, c: t[4] ? tcs[3] : tcs[(t[3] ? 1 : 0) + (rr(i + 7) < 0.3 ? 2 : 0) & 3] }; }, 0.0045);
    // hoa: nụ tròn trên cuống ngắn
    batch(scene, G.ball(0.032, 1, 0.8, 1, 8), det.flower, t => ({ x: WX(t[0]), y: hAt(t[0], t[1]) + 0.05, z: WZ(t[1]), sx: 1, sy: 1, sz: 1, c: t[2] }), 0.008);
    batch(scene, G.cyl(0.006, 0.008, 0.06, 5), det.flower, t => ({ x: WX(t[0]), y: hAt(t[0], t[1]) + 0.02, z: WZ(t[1]), sx: 1, sy: 1, sz: 1, c: sh(tc, -0.25) }));
    // sỏi, đá viền đường, phiến đá lát
    const rockG = new T.DodecahedronGeometry(1, 0);
    const pc = theme === 'lava' ? '#2a2022' : theme === 'chaos' ? '#3a2a6a' : theme === 'desert' ? '#b89a72' : theme === 'ice' ? '#a8b8cc' : '#9a968e';
    batch(scene, rockG, det.peb, (t, i) => { const r = t[2] / 40; return { x: WX(t[0]), y: hAt(t[0], t[1]) + r * 0.15, z: WZ(t[1]), ry: rr(i) * 6.28, rx: rr(i + 3) * 0.6, sx: r, sy: r * 0.5, sz: r * 0.85, c: rr(i + 5) < 0.5 ? pc : sh(pc, 0.1) }; }, 0.006);
    const T2 = TH, kc = T2.cobble ? '#9a968c' : sh(T2.roadD, -0.05);
    batch(scene, rockG, det.kerb, (t, i) => { const r = t[2] / 40; return { x: WX(t[0]), y: hAt(t[0], t[1]) + r * 0.2, z: WZ(t[1]), ry: rr(i) * 6.28, sx: r, sy: r * 0.55, sz: r * 0.8, c: rr(i + 2) < 0.5 ? kc : sh(kc, 0.1) }; }, 0.007);
    batch(scene, G.sbox(1, 1, 1, 0.45), det.slab, (t, i) => { const r = t[2] / 40; return { x: WX(t[0]), y: hAt(t[0], t[1]) + 0.004, z: WZ(t[1]), ry: rr(i) * 3, sx: r * 1.7, sy: 0.02, sz: r * 1.35, c: rr(i + 1) < 0.5 ? sh(T2.road, -0.1) : sh(T2.roadD, 0.06) }; }, 0.004);
  }

  /** đặt vật trang trí (cây, đá, nhà, lâu đài…) vào cảnh mặt đất; mỗi mẫu dựng 1 lần rồi nhân bản (chung lưới) */
  function placeDecor(scene, map, hAt, theme) {
    const cache = new Map(), placed = [];
    for (const d of map.decor) {
      const prop = !!d.prop;
      if (!Props3D.has(d.k, prop)) continue;
      const vi = Math.min(2, (d.v * 3) | 0), key = prop ? [d.k, d.theme, d.snow ? 1 : 0, d.dark ? 1 : 0].join('|') : d.k + '|' + vi;
      let src = cache.get(key);
      if (src === undefined) {
        Chars3D.setInk(0.35);
        src = Props3D.build(d.k, prop ? (d.theme || theme) : theme, (vi + 0.5) / 3, prop ? d : null);
        if (src) {
          Art3D.optimize(src);
          src.traverse(o => { if (o.isMesh && !o.material.transparent && !o.material.userData.ink) o.castShadow = true; });
        }
        cache.set(key, src);
      }
      if (!src) continue;
      const o = src.clone();
      o.position.set(WX(d.x), hAt(d.x, d.y), WZ(d.y));
      if (!prop) { o.scale.setScalar(d.s); o.rotation.y = d.flip < 0 ? Math.PI * 0.35 * (d.v - 0.5) + Math.PI * 0.12 : Math.PI * 0.35 * (d.v - 0.5); }
      o.updateMatrixWorld(true);
      scene.add(o); placed.push(d);
    }
    return placed;
  }

  window.Terrain3D = {
    /** màn này có dựng mặt đất 3D không (để mapart.js biết mà gom chi tiết thay vì vẽ 2D) */
    will(map) { return !!(Art3D.enabled && Art3D.available()); },
    /** tex: canvas đã vẽ mặt đất + nước + đường (W*res × H*res) → canvas mới đã dựng 3D (hoặc null) */
    render(map, res, tex, TH) {
      if (!Art3D.enabled || !Art3D.available()) return null;
      const W = map.W, H = map.H, F_ = map.feat, PW = CONFIG.pathWidth, theme = map.def.theme;
      const renderer = Art3D.renderer(); if (!renderer) return null;
      const tA = performance.now();

      const scene = new T.Scene(), lp = Art3D.lights ? Art3D.lights() : null;
      scene.add(new T.HemisphereLight(lp ? lp[0] : 0xfff4e8, lp ? lp[1] : 0x5a4a6a, lp ? lp[2] : 0.85));
      const key = new T.DirectionalLight(lp ? lp[3] : 0xffffff, lp ? lp[4] : 1); key.position.copy(LDIR); scene.add(key);

      /* --- lưới mặt đất --- */
      const cell = 10, nx = Math.ceil(W / cell) + 1, ny = Math.ceil((H + 60) / cell) + 1, tmp0 = {};
      const pos = new Float32Array(nx * ny * 3), uv = new Float32Array(nx * ny * 2), idx = [];
      const hasWater = F_.rivers.length || F_.lakes.length;
      // trường khoảng cách "đóng dấu": mw = khoảng cách tới mép nước (âm = trong nước), mr = tới tim đường
      const mw = new Float32Array(nx * ny).fill(99), mr = new Float32Array(nx * ny).fill(999);
      const stamp = (arr, sx, sy, R, base) => {
        const i0 = Math.max(0, Math.floor(sx / cell - R / cell)), i1 = Math.min(nx - 1, Math.ceil(sx / cell + R / cell));
        const j0 = Math.max(0, Math.floor((sy + 30) / cell - R / cell)), j1 = Math.min(ny - 1, Math.ceil((sy + 30) / cell + R / cell));
        for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { const v = Math.hypot(i * cell - sx, -30 + j * cell - sy) - base, k = j * nx + i; if (v < arr[k]) arr[k] = v; }
      };
      for (const r of F_.rivers) for (let s = 0; s < r.pts.length - 1; s++) {
        const A = r.pts[s], B = r.pts[s + 1], ax = A.x !== undefined ? A.x : A[0], ay = A.y !== undefined ? A.y : A[1], bx = B.x !== undefined ? B.x : B[0], by = B.y !== undefined ? B.y : B[1], n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / 4));
        for (let q = 0; q < n; q++) stamp(mw, ax + (bx - ax) * q / n, ay + (by - ay) * q / n, r.w / 2 + 70, r.w / 2);
      }
      for (const l of F_.lakes) {
        const R = Math.max(l.rx, l.ry) + 70;
        for (let j = Math.max(0, Math.floor((l.y - R + 30) / cell)); j <= Math.min(ny - 1, Math.ceil((l.y + R + 30) / cell)); j++)
          for (let i = Math.max(0, Math.floor((l.x - R) / cell)); i <= Math.min(nx - 1, Math.ceil((l.x + R) / cell)); i++) {
            const dx = (i * cell - l.x) / l.rx, dy = (-30 + j * cell - l.y) / l.ry, e = Math.sqrt(dx * dx + dy * dy), v = (e - 1) * Math.min(l.rx, l.ry * 1.4), k = j * nx + i;
            if (v < mw[k]) mw[k] = v;
          }
      }
      for (const p of map.paths) for (let d = 0; d <= p.length; d += 6) { p.pointAt(d, tmp0); stamp(mr, tmp0.x, tmp0.y, PW / 2 + 92, 0); }
      // gò đất thoai thoải xa đường / nước / ô xây (cho mặt đất có khối, đổ sáng tối mềm)
      const ms = new Float32Array(nx * ny).fill(999);
      for (const s of (map.spots || [])) stamp(ms, s.x, s.y, 80, 0);
      const rl = (x, y) => (Math.sin(x * 0.011 + Math.sin(y * 0.007) * 2) * 0.5 + Math.sin(y * 0.013 + x * 0.004 + 1.7) * 0.35 + Math.sin((x - y) * 0.021 + 0.6) * 0.15);
      const sm = (a, b, v) => { const t = Math.max(0, Math.min(1, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
        const x = Math.min(W, i * cell), y = -30 + j * cell, k = j * nx + i, w = mw[k];
        let h = w < 0 ? -DEPTH : w < 22 ? -DEPTH * Math.pow(1 - w / 22, 2.2) : 0;
        if (h > -0.02 && mr[k] < PW / 2 + 6) h = -ROAD * Math.min(1, Math.max(0, (PW / 2 + 6 - mr[k]) / 10));
        else if (h === 0) h = RELIEF * rl(x, y) * sm(PW / 2 + 20, PW / 2 + 90, mr[k]) * sm(20, 70, w) * sm(40, 80, ms[k]);
        pos[k * 3] = WX(x); pos[k * 3 + 1] = h; pos[k * 3 + 2] = WZ(y);
        uv[k * 2] = x / W; uv[k * 2 + 1] = 1 - y / H;
        if (i < nx - 1 && j < ny - 1 && (!F_.void || mr[k]<100 || ms[k]<72)) idx.push(k, k + nx, k + 1, k + 1, k + nx, k + nx + 1);
      }
      const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(pos, 3)); geo.setAttribute('uv', new T.BufferAttribute(uv, 2)); geo.setIndex(idx);
      geo.computeVertexNormals();
      // Physical cliff sides, including floating islands in the void region.
      const walls=[],land=(i,j)=>i>=0&&j>=0&&i<nx-1&&j<ny-1&&(!F_.void||mr[j*nx+i]<100||ms[j*nx+i]<72);
      const corner=(i,j)=>{const k=j*nx+i;return[pos[k*3],pos[k*3+1],pos[k*3+2]];};
      const edge=(a,b)=>{const depth=F_.void?1.5:1.15,da=-depth-.16*Math.sin(a[0]*4+a[2]),db=-depth-.16*Math.sin(b[0]*4+b[2]);walls.push(...a,a[0],da,a[2],...b,...b,a[0],da,a[2],b[0],db,b[2]);};
      for(let j=0;j<ny-1;j++)for(let i=0;i<nx-1;i++)if(land(i,j)){
        if(!land(i-1,j))edge(corner(i,j+1),corner(i,j));if(!land(i+1,j))edge(corner(i+1,j),corner(i+1,j+1));
        if(!land(i,j-1))edge(corner(i,j),corner(i+1,j));if(!land(i,j+1))edge(corner(i+1,j+1),corner(i,j+1));
      }
      const cliffGeo=new T.BufferGeometry();cliffGeo.setAttribute('position',new T.Float32BufferAttribute(walls,3));cliffGeo.computeVertexNormals();
      scene.add(part(cliffGeo,theme==='chaos'?'#3b315b':theme==='desert'?'#b07849':theme==='ice'?'#8497ab':'#6a705f',{tex:'rock',ink:false}));
      const nrm = geo.attributes.normal, col = new Float32Array(nx * ny * 3);
      for (let k = 0; k < nx * ny; k++) { // đổ bóng theo độ dốc: bờ dốc gắt thì phân tông kiểu toon, gò thoải thì chuyển mềm
        const d = nrm.getX(k) * LDIR.x + nrm.getY(k) * LDIR.y + nrm.getZ(k) * LDIR.z, f = 1 + (d - FLAT) * 1.6;
        const q = f < 0.72 ? 0.66 : f < 0.86 ? 0.8 : Math.min(1.12, 0.8 + (f - 0.86) * 1.4);
        col[k * 3] = col[k * 3 + 1] = col[k * 3 + 2] = q;
      }
      geo.setAttribute('color', new T.BufferAttribute(col, 3));
      const tx = new T.CanvasTexture(tex); tx.encoding = T.sRGBEncoding; tx.anisotropy = 4;
      scene.add(new T.Mesh(geo, new T.MeshBasicMaterial({ map: tx, vertexColors: true })));
      /* --- chi tiết 3D trên mặt đất: cỏ, hoa, sỏi, đá viền & đá lát đường --- */
      const hAt = (x, y) => { const fi = Math.max(0, Math.min(nx - 1.001, x / cell)), fj = Math.max(0, Math.min(ny - 1.001, (y + 30) / cell)), i = fi | 0, j = fj | 0, u = fi - i, v = fj - j, P = (a, b) => pos[((j + b) * nx + i + a) * 3 + 1]; return (P(0, 0) * (1 - u) + P(1, 0) * u) * (1 - v) + (P(0, 1) * (1 - u) + P(1, 1) * u) * v; };
      if (map.det) details(scene, map.det, hAt, TH, theme);

      /* --- mặt nước / dung nham --- */
      if (hasWater) {
        const lava = theme === 'lava', waterPos=[];
        const step=4;
        for(let y=-30;y<H+30;y+=step) for(let x=0;x<W;x+=step) {
          if(!MapArt.wetAt(F_,x+step/2,y+step/2,-3)) continue;
          const a=WX(x),b=WX(Math.min(W,x+step)),c=WZ(y),d=WZ(y+step);
          waterPos.push(a,WATER_Y,c,a,WATER_Y,d,b,WATER_Y,c,b,WATER_Y,c,a,WATER_Y,d,b,WATER_Y,d);
        }
        const wg=new T.BufferGeometry();wg.setAttribute('position',new T.Float32BufferAttribute(waterPos,3));wg.computeVertexNormals();
        const waterMat=new T.MeshPhongMaterial({color:lava?'#e96e22':TH.water,transparent:true,opacity:lava?.88:.78,shininess:120,specular:lava?'#ffba77':'#c5edee',depthWrite:false});
        waterMat.onBeforeCompile=shader=>{shader.uniforms.uWaterTime={value:0};waterMat.userData.shader=shader;shader.vertexShader='uniform float uWaterTime;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.y += .012*sin(position.x*4.+uWaterTime*1.6)+.006*cos(position.z*5.-uWaterTime*1.2);');};
        const waterMesh=new T.Mesh(wg,waterMat);waterMesh.name='live-water';scene.add(waterMesh);
      }
      /* --- cầu 3D --- */
      const tmp = {}, Chars = Chars3D; Chars.setInk(1.0);
      if (hasWater) for (const p of map.paths) {
        let start = -1;
        for (let d = 0; d <= p.length + 5; d += 4) {
          p.pointAt(Math.min(d, p.length), tmp); const wet = d <= p.length && MapArt.wetAt(F_, tmp.x, tmp.y, 6);
          if (wet && start < 0) start = d;
          if ((!wet || d > p.length) && start >= 0) { bridge(scene, p, Math.max(0, start - 16), Math.min(p.length, d + 12), theme, PW); start = -1; }
        }
      }

      /* --- cây cối, đá, công trình: đặt thẳng vào cảnh 3D để đổ bóng thật xuống đất --- */
      const placed = map.decor && window.Props3D && Art3D.optimize ? placeDecor(scene, map, hAt, theme) : []; let sunL = null;
      if (placed.length) {
        const sm = new T.Mesh(geo, new T.ShadowMaterial({ color: lp && theme === 'lava' ? 0x2a0a08 : 0x140c2c, opacity: theme === 'ice' ? 0.26 : 0.34 }));
        sm.receiveShadow = true; sm.renderOrder = 1; scene.add(sm);
        const cx = WX(W) / 2, cz = WZ(H / 2), R = Math.hypot(WX(W), WZ(H + 60)) / 2 + 4;
        // nắng đổ bóng riêng (không chiếu sáng, chỉ tạo bóng): từ sau-trái → bóng đổ ra trước-phải, không bị vật che
        const sun = new T.DirectionalLight(0xffffff, 0); sun.castShadow = true; sun.position.set(cx + SDIR.x * 60, SDIR.y * 60, cz + SDIR.z * 60); sun.target.position.set(cx, 0, cz); scene.add(sun, sun.target);
        sunL = sun; const key = sun, sc = key.shadow.camera; sc.left = -R; sc.right = R; sc.top = R; sc.bottom = -R; sc.near = 1; sc.far = 140; sc.updateProjectionMatrix();
        const mx = Math.min(4096, renderer.capabilities.maxTextureSize || 2048); key.shadow.mapSize.set(mx, mx); key.shadow.bias = -0.0008; key.shadow.normalBias = 0.02;
        renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap; renderer.shadowMap.autoUpdate = false; renderer.shadowMap.needsUpdate = true;
        const rim = new T.DirectionalLight(lp ? lp[5] : 0xa8c4ff, lp ? lp[6] : 0.4); rim.position.set(3, 2.5, -4); scene.add(rim);
      }

      const tB = performance.now();
      /* --- chụp theo ô --- */
      const OW = Math.ceil(W * res), OH = Math.ceil(H * res), out = document.createElement('canvas'); out.width = OW; out.height = OH;
      const og = out.getContext('2d'), TILE = 2048, cam = new T.OrthographicCamera(0, 1, 0, -1, 0.1, 400);
      cam.position.set(0, sE * 150, cE * 150); cam.lookAt(0, 0, 0);
      for (let py = 0; py < OH; py += TILE) for (let px = 0; px < OW; px += TILE) {
        const tw = Math.min(TILE, OW - px), th = Math.min(TILE, OH - py);
        renderer.setSize(tw, th, false); renderer.setViewport(0, 0, tw, th); renderer.setScissorTest(false);
        cam.left = WX(px / res); cam.right = WX((px + tw) / res); cam.top = -(py / res) / 40; cam.bottom = -((py + th) / res) / 40; cam.updateProjectionMatrix();
        renderer.render(scene, cam);
        og.drawImage(renderer.domElement, px, py);
      }
      const retain=!!window.Battle3D;
      if(retain){
        Art3D.optimize(scene);
        scene.traverse(o=>{if(o.isMesh){o.castShadow=!o.material.transparent&&!o.material.isMeshBasicMaterial;o.receiveShadow=o.material.isShadowMaterial;}});
        map.live3d={scene,geo,tx,cam,hAt,sun:sunL,water:scene.getObjectByName('live-water'),merged:true};
      }else{scene.traverse(o=>{if(o.geometry)o.geometry.dispose();});tx.dispose();}
      if(renderer.shadowMap.enabled){renderer.shadowMap.enabled=false;renderer.shadowMap.autoUpdate=true;if(!retain&&sunL&&sunL.shadow.map){sunL.shadow.map.dispose();sunL.shadow.map=null;}}
      renderer.setScissorTest(false);renderer.setSize(256,256,false);
      placed.forEach(d => { d._in3d = true; }); // mapart.js khỏi vẽ lại các vật này
      Terrain3D.timing = { build: Math.round(tB - tA), render: Math.round(performance.now() - tB) };
      return out;
    }
  };
})();
