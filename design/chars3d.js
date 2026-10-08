/* =========================================================
 * chars3d.js – Dựng nhân vật fantasy / anime 3D cho Canh Cổng (Three.js r147, không cần build)
 * Nhân vật dạng người: tỷ lệ cân đối, mặt anime, tóc từng lọn, giáp ôm thân; tô toon và viền mảnh
 * (inverted hull – xuất ra .glb vẫn giữ viền ở mọi engine).
 * Mỗi nhân vật = cây khớp có tên (root › hips › torso › head, armR/armL › vũ khí, legR/legL …)
 * + các clip hoạt ảnh (idle, walk, attack, skill, die) nướng sẵn từ hàm tư thế.
 * Bảng màu & chi tiết lấy đúng theo js/chibi.js (bản 2D trong game).
 * API: Chars3D.list, Chars3D.build(id, tier) → { root, clips, rig }, Chars3D.toExportable(root)
 * ========================================================= */
(function () {
  'use strict';
  const T = THREE, TAU = Math.PI * 2, S = Math.sin, C = Math.cos;
  T.ColorManagement.legacyMode = false; // màu hex = sRGB, xuất glTF đúng màu

  const INK = '#1b0f16', GOLD = '#f5c542', SKIN = '#ffd9b8', OUT = 0.018;
  let INKK = 1; // hệ số độ dày viền (trong trận dùng dày hơn cho rõ ở cỡ nhỏ)
  let BUILD_ID = null, SOFT_BUILD=false;
  let DET = 1; // mức chi tiết (trong trận < 1 cho nhẹ máy)
  const Q = n => Math.max(5, Math.round(n * DET));

  /* ---------- vật liệu toon ---------- */
  const GRAD = (() => {
    const d = new Uint8Array([92, 92, 92, 255, 155, 155, 155, 255, 224, 224, 224, 255]);
    const t = new T.DataTexture(d, 3, 1, T.RGBAFormat); t.minFilter = t.magFilter = T.NearestFilter; t.needsUpdate = true; return t;
  })();
  /* ---------- chất liệu nâng cao (vá shader toon) ----------
   * · vân bề mặt sinh ngay trong shader theo toạ độ riêng của từng khối (thuộc tính tpos/tnrm) → không cần ảnh / UV:
   *   gạch, đá hộc, đá lát, gỗ, ngói, tán lá, đá tảng, vỏ cây, vữa trát, rơm, xương rồng, vải
   * · viền sáng ven mép (rim) theo màu đèn vùng, kim loại có vệt bóng, chân vật tối dần (bóng tiếp đất)
   * tex: 'brick' | 'stone' | 'tile' | 'wood' | 'bark' | 'straw' | 'cactus' (trụ tròn) – thêm '.f' cho mặt phẳng (hộp, mái dốc);
   *      'flag' | 'leaf' | 'rock' | 'plaster' | 'cloth' */
  const TEXN = { brick: 1, stone: 2, flag: 3, wood: 4, tile: 5, leaf: 6, rock: 7, bark: 8, plaster: 9, straw: 10, cactus: 11, cloth: 12, hair: 13, fur: 14, cape: 15 };
  const FXON = { v: true };
  const FX = { uTime:{value:0}, uRim: { value: new T.Color(0xa8c4ff) }, uRimK: { value: 0.5 }, uAO: { value: 0.8 } };
  const SH_V = 'uniform float uTime;\nattribute vec3 tpos;\nattribute vec3 tnrm;\nvarying vec3 vTP;\nvarying vec3 vTN;\nvarying float vWY;\n';
  const SH_F = `varying vec3 vTP; varying vec3 vTN; varying float vWY;
uniform vec3 uRim; uniform float uRimK; uniform float uAO;
float h21(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h21(i),h21(i+vec2(1.,0.)),f.x),mix(h21(i+vec2(0.,1.)),h21(i+vec2(1.,1.)),f.x),f.y); }
float fbm(vec2 p){ return vn(p)*.55+vn(p*2.07+3.1)*.3+vn(p*4.3+7.7)*.15; }
float lodK(vec2 uv, float s){ float px=length(fwidth(uv)); return 1.-smoothstep(s*.22,s*.55,px); }
float blocks(vec2 uv, vec2 sz, float mort, float vari, float bev){
  float row=floor(uv.y/sz.y); uv.x+=fract(row*.5)*sz.x+h21(vec2(row,3.))*sz.x*.3;
  vec2 c=vec2(floor(uv.x/sz.x),row), f=fract(uv/sz), e=min(f,1.-f)*sz;
  float px=length(fwidth(uv))*.5, m=smoothstep(mort-px,mort+px,min(e.x,e.y));
  float t=1.+(h21(c)-.5)*vari+(f.y-.5)*bev;
  return mix(.58,t,m);
}
float surf(){
  vec3 p=vTP, n=normalize(vTN+vec3(1e-5)); bool top=abs(n.y)>.72;
  vec2 pl=abs(n.x)>abs(n.z)?p.zy:p.xy, cy=vec2(atan(p.x,p.z)*max(.04,length(p.xz)),p.y);
  vec2 sd=TCYL==1?cy:pl;
  float k=1.;
#if TEXK==1
  vec2 uv=top?p.xz:sd; k=mix(1.,blocks(uv,vec2(.19,.095),.011,.24,.14)*(.93+.14*fbm(uv*11.)),lodK(uv,.095));
#elif TEXK==2
  vec2 uv=top?p.xz:sd; k=mix(1.,blocks(uv,vec2(.27,.15),.013,.34,.18)*(.88+.24*fbm(uv*7.)),lodK(uv,.15));
#elif TEXK==3
  vec2 uv=top?p.xz:sd; k=mix(1.,blocks(uv,vec2(.24,.2),.012,.3,.0)*(.9+.2*fbm(uv*8.)),lodK(uv,.2));
#elif TEXK==4
  if(top){ vec2 uv=p.xz; k=mix(1.,blocks(vec2(uv.x,uv.y),vec2(.7,.085),.008,.2,.0)*(.86+.22*vn(vec2(uv.x*4.,uv.y*60.))),lodK(uv,.085)); }
  else if(TCYL==0){ vec2 uv=sd; k=mix(1.,blocks(vec2(uv.x,uv.y),vec2(.9,.075),.007,.22,.1)*(.88+.2*vn(vec2(uv.x*5.,uv.y*70.))),lodK(uv,.075)); }
  else { vec2 uv=sd; k=.84+.24*vn(vec2(uv.x*34.,uv.y*2.5))+.06*sin(uv.x*90.+vn(uv*6.)*6.); k=mix(1.,k,lodK(uv,.04)); }
#elif TEXK==5
  vec2 uv=top?p.xz:sd; float row=floor(uv.y/.07), fy=fract(uv.y/.07); float cx=fract(uv.x/.11+fract(row*.5));
  float sc=smoothstep(0.,.5,fy+.18*(1.-abs(cx*2.-1.)));
  k=mix(1.,(.7+.36*sc)*(.92+.16*h21(vec2(floor(uv.x/.11+fract(row*.5)),row))),lodK(uv,.07));
#elif TEXK==6
  vec2 uv=(p.xz+vec2(p.y*.8,-p.y*.6))*26.; float f=fbm(uv); k=f<.36?.74:f<.5?.9:f<.64?1.:1.13; k*=.88+.24*max(0.,n.y); k=mix(1.,k,lodK(uv/26.,.035));
#elif TEXK==7
  vec2 uv=(p.xy+p.zx*.7)*18.; float f=fbm(uv), cr=1.-smoothstep(.0,.045,abs(vn(uv*.45+9.)-.5)); k=(.8+.34*f)*(1.-cr*.4); k*=.9+.18*max(0.,n.y); k=mix(1.,k,lodK(uv/18.,.04));
#elif TEXK==8
  vec2 uv=sd; k=.78+.3*vn(vec2(uv.x*26.,uv.y*3.))+.06*vn(uv*40.); k=mix(1.,k,lodK(uv,.04));
#elif TEXK==9
  vec2 uv=top?p.xz:pl; k=.94+.1*fbm(uv*10.); k*=mix(.9,1.,smoothstep(-.2,.15,p.y)); k=mix(1.,k,lodK(uv,.06));
#elif TEXK==10
  vec2 uv=sd; float row=fract(uv.y/.06); k=(.8+.3*vn(vec2(uv.x*26.,uv.y*5.)))*mix(.82,1.06,smoothstep(0.,.6,row)); k=mix(1.,k,lodK(uv,.06));
#elif TEXK==11
  k=.8+.24*abs(sin(atan(p.x,p.z)*5.)); k=mix(1.,k,lodK(p.xy,.03));
#elif TEXK==12
  vec2 uv=sd*40.; k=.95+.08*fbm(uv)+.03*sin(uv.x*3.)*sin(uv.y*3.);
#elif TEXK==13
  float a=atan(p.x,p.z), st=vn(vec2(a*22.,p.y*2.))*.6+vn(vec2(a*47.,p.y*5.))*.4;
  float ring=smoothstep(.26,.38,n.y)*(1.-smoothstep(.5,.62,n.y))*smoothstep(-.3,.25,n.z);
  k=.84+.26*st+ring*(.26+.3*st); k=mix(1.,k,lodK(vec2(a*length(p.xz),p.y),.05));
#elif TEXK==15
  vec2 uv=pl*40.; k=.96+.05*fbm(uv);
#elif TEXK==14
  float a=atan(p.x,p.z); k=.8+.3*vn(vec2(a*20.,p.y*6.)); k=mix(1.,k,lodK(vec2(a*length(p.xz),p.y),.05));
#endif
  return k;
}
`;
  function enhance(m, tex) {
    const cartoon=!!m.userData.character;
    const base = tex ? tex.split('.')[0] : '', id = TEXN[base] || 0, cyl = tex && !/\.f$/.test(tex) ? 1 : 0, metal = m.userData.metal ? 1 : 0;
    m.extensions = { derivatives: true };
    m.userData.tex = tex || '';
    m.customProgramCacheKey = () => 'cc3|' + id + '|' + cyl + '|' + metal + '|' + cartoon;
    m.onBeforeCompile = sh => {
      if (!FXON.v) return;
      Object.assign(sh.uniforms, FX);
      sh.defines = Object.assign(sh.defines || {}, { TEXK: id, TCYL: cyl, CC_METAL: metal, CC_CARTOON:cartoon?1:0 });
      sh.vertexShader = SH_V + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvTP = tpos; vTN = tnrm; vWY = (modelMatrix * vec4(position, 1.0)).y;\n#if TEXK==6\ntransformed.x += sin(tpos.y*4.+uTime*1.6+tpos.z*3.)*.018;\n#elif TEXK==15\nfloat pin=clamp(-tpos.y,0.,1.); transformed.z+=sin(uTime*2.+tpos.x*7.+tpos.y*2.)*.022*pin*pin; transformed.x+=sin(uTime*1.5+tpos.y*4.)*.01*pin;\n#endif');
      sh.fragmentShader = SH_F + sh.fragmentShader
        .replace('#include <color_fragment>', '#include <color_fragment>\n#if TEXK>0\ndiffuseColor.rgb *= mix(vec3(1.0), vec3(surf()), CC_CARTOON==1 ? 0.16 : 1.0);\n#endif\ndiffuseColor.rgb *= mix(uAO, 1.0, smoothstep(0.0, 0.2, vWY));')
        .replace('#include <output_fragment>', `{ vec3 nv = normalize(normal); float fr = pow(clamp(1.0 - nv.z, 0.0, 1.0), 2.4) * clamp(dot(nv.xy, vec2(0.62, 0.78)) * 0.9 + 0.35, 0.0, 1.0);
  outgoingLight += uRim * uRimK * fr * diffuseColor.rgb * 0.65;
#if CC_METAL==1
  outgoingLight += vec3(1.0) * smoothstep(0.86, 0.95, dot(nv, normalize(vec3(-0.35, 0.55, 0.76)))) * 0.18;
#endif

#if CC_CARTOON==1
  vec3 base=max(diffuseColor.rgb,vec3(.025));
  float light=dot(outgoingLight/base,vec3(.2126,.7152,.0722));
  float bands=light<.48?.36:light<.86?.70:light<1.3?1.0:1.24;
  outgoingLight=mix(outgoingLight,base*bands,.60);
#endif
}
#include <output_fragment>`);
    };
    return m;
  }
  const mats = {};
  function mat(col, o) {
    o = o || {};
    const character=!!BUILD_ID;
    const k = character + '|' + col + '|' + (o.glow || 0) + '|' + (o.metal ? 1 : 0) + '|' + (o.op || 1) + '|' + (o.ds ? 1 : 0) + '|' + (o.tex || '');
    if (!mats[k]) {
      const m = new T.MeshStandardMaterial({color:col,roughness:o.metal?(character?.72:.28):/hair/.test(o.tex||'')?.48:/cloth|cape/.test(o.tex||'')?.92:.68,metalness:o.metal?(character?.12:.64):0});
      if (o.glow) { m.emissive = new T.Color(col); m.emissiveIntensity = o.glow; }
      if (o.op) { m.transparent = true; m.opacity = o.op; m.depthWrite = false; }
      if (o.ds) m.side = T.DoubleSide;
      m.userData.character=character; m.userData.metal = !!o.metal; m.userData.glow = o.glow || 0;
      mats[k] = enhance(m, o.tex);
    }
    return mats[k];
  }
  /** ghi toạ độ riêng của khối (để vân bề mặt bám theo khối kể cả sau khi gộp lưới) */
  function texCoords(geo) {
    if (!geo.attributes.tpos) { geo.setAttribute('tpos', geo.attributes.position.clone()); geo.setAttribute('tnrm', geo.attributes.normal.clone()); }
    return geo;
  }
  const inkMat = new T.MeshBasicMaterial({ color: INK });
  inkMat.userData.ink = true;

  /* ---------- viền mực: vỏ đẩy theo pháp tuyến (gộp theo vị trí) + đảo chiều tam giác ---------- */
  function hullGeo(geo, t) {
    const p = geo.attributes.position, n = geo.attributes.normal, N = p.count, acc = new Map(), keys = new Array(N);
    for (let i = 0; i < N; i++) {
      const k = keys[i] = Math.round(p.getX(i) * 400) + ',' + Math.round(p.getY(i) * 400) + ',' + Math.round(p.getZ(i) * 400);
      let a = acc.get(k); if (!a) acc.set(k, a = new T.Vector3());
      a.x += n.getX(i); a.y += n.getY(i); a.z += n.getZ(i);
    }
    acc.forEach(v => v.normalize());
    const out = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) { const v = acc.get(keys[i]); out[i * 3] = p.getX(i) + v.x * t; out[i * 3 + 1] = p.getY(i) + v.y * t; out[i * 3 + 2] = p.getZ(i) + v.z * t; }
    const src = geo.index ? geo.index.array : null, M = src ? src.length : N, idx = N > 65535 ? new Uint32Array(M) : new Uint16Array(M);
    for (let i = 0; i < M; i += 3) { idx[i] = src ? src[i] : i; idx[i + 1] = src ? src[i + 2] : i + 2; idx[i + 2] = src ? src[i + 1] : i + 1; } // đảo chiều tam giác
    const h = new T.BufferGeometry(); h.setAttribute('position', new T.BufferAttribute(out, 3)); h.setIndex(new T.BufferAttribute(idx, 1)); return h;
  }
  /** Một khối có màu + viền. o: { ink: độ dày | false, metal, glow, op, ds } */
  function part(geo, col, o) {
    o = o || {};
    // Sculpt large character surfaces before generating their matching outline.
    // Effects, eyes, props and tower geometry keep their original shapes.
    if (BUILD_ID && !SOFT_BUILD && !o.sculpted && geo.type === 'SphereGeometry' && !o.op && !o.glow && !o.tex) {
      geo.computeBoundingBox();
      const b = geo.boundingBox, size = b.getSize(new T.Vector3());
      if (Math.max(size.x, size.y, size.z) > 0.22) {
        const stone = /Golem|magmaLord/.test(BUILD_ID);
        const e = stone ? 0.42 : o.metal ? 0.48 : 0.78;
        const p = geo.attributes.position;
        for (let i = 0; i < p.count; i++) {
          const v = [p.getX(i), p.getY(i), p.getZ(i)];
          const d = [size.x, size.y, size.z];
          p.setXYZ(i, ...v.map((x, j) => Math.sign(x) * Math.pow(Math.abs(x / (d[j] / 2)), e) * d[j] / 2));
        }
        geo.computeVertexNormals();
      }
    }
    if (o.tex) texCoords(geo);
    const m = new T.Mesh(geo, mat(col, o));
    if (o.ink !== false && !o.op) { const h = new T.Mesh(hullGeo(geo, (o.ink || OUT) * INKK), inkMat); h.userData.hull = true; m.add(h); }
    return m;
  }
  function node(name, parent, x, y, z) { const g = new T.Group(); g.name = name; g.position.set(x || 0, y || 0, z || 0); if (parent) parent.add(g); return g; }
  function add(parent, obj, x, y, z, rx, ry, rz) { obj.position.set(x || 0, y || 0, z || 0); obj.rotation.set(rx || 0, ry || 0, rz || 0); parent.add(obj); return obj; }

  /* ---------- hình học (đã nướng tỉ lệ để viền dày đều) ---------- */
  const G = {
    ball: (r, sx, sy, sz, seg) => new T.SphereGeometry(r, Q(seg || 18), Math.max(4, Math.round(Q(seg || 18) * 0.7))).scale(sx || 1, sy || 1, sz || 1),
    cap: (r, len, seg) => new T.CapsuleGeometry(r, Math.max(0.001, len), Math.max(2, Math.round(5 * DET)), Q(seg || 12)),
    cyl: (rt, rb, h, seg) => new T.CylinderGeometry(rt, rb, h, seg && seg <= 6 ? seg : Q(seg || 14)),
    cone: (r, h, seg) => new T.ConeGeometry(r, h, seg && seg <= 6 ? seg : Q(seg || 12)),
    torus: (R, r, arc) => new T.TorusGeometry(R, r, 8, 26, arc || TAU),
    oct: (r, sy) => new T.OctahedronGeometry(r, 0).scale(1, sy || 1, 1),
    /** khối hộp bo tròn (siêu elip) – giáp, giày, ngực */
    sbox(w, h, d, e) {
      e = e === undefined ? 0.35 : e;
      const g = new T.SphereGeometry(1, Q(20), Q(14)), p = g.attributes.position;
      const f = v => Math.sign(v) * Math.pow(Math.abs(v), e);
      for (let i = 0; i < p.count; i++) p.setXYZ(i, f(p.getX(i)) * w / 2, f(p.getY(i)) * h / 2, f(p.getZ(i)) * d / 2);
      g.computeVertexNormals(); return g;
    },
    /** xoay biên dạng quanh trục Y; pts = [[bán kính, y], …] */
    lathe(pts, seg, sz) { const ordered = pts[0][1] > pts[pts.length - 1][1] ? pts.slice().reverse() : pts; const g = new T.LatheGeometry(ordered.map(q => new T.Vector2(q[0], q[1])), seg && seg <= 9 ? seg : Q(seg || 22)); if (sz) g.scale(1, 1, sz); return g; },
    /** đùn đa giác phẳng (mặt XY), dày theo Z, căn giữa */
    ext(pts, depth, bevel) {
      const s = pts instanceof T.Shape ? pts : (() => { const q = new T.Shape(); q.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) q.lineTo(pts[i], pts[i + 1]); return q; })();
      const g = new T.ExtrudeGeometry(s, { depth, bevelEnabled: !!bevel, bevelThickness: bevel || 0, bevelSize: bevel || 0, bevelSegments: 2, curveSegments: 10 });
      g.translate(0, 0, -depth / 2); return g;
    },
    tube(pts, r, seg) { return new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(q => new T.Vector3(q[0], q[1], q[2]))), Q(seg || 20), r, Q(8), false); },
    /** áo choàng cong, xoè ra ở dưới (khối kín để viền đủ) */
    cape(w, L, flare) {
      const s = new T.Shape(), n = 10, th = 0.035, bulge = w * 0.24;
      for (let i = 0; i <= n; i++) { const u = i / n * 2 - 1; i ? s.lineTo(u * w / 2, -bulge * (1 - u * u)) : s.moveTo(u * w / 2, -bulge * (1 - u * u)); }
      for (let i = n; i >= 0; i--) { const u = i / n * 2 - 1; s.lineTo(u * w / 2 * 0.98, -bulge * (1 - u * u) + th); }
      const g = new T.ExtrudeGeometry(s, { depth: L, bevelEnabled: false, steps: 6 }), p = g.attributes.position;
      for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = z / L; p.setXYZ(i, x * (1 + flare * k), -z, y * (1 + flare * 0.7 * k) - k * k * 0.06); }
      g.computeVertexNormals(); return g;
    },
    /** nón uốn cong ra sau (mũ phù thuỷ) */
    bentCone(r, h, bend) {
      const g = G.lathe([[0, 0], [r, 0], [r * 0.62, h * 0.35], [r * 0.3, h * 0.7], [0.012, h]], 18), p = g.attributes.position;
      for (let i = 0; i < p.count; i++) { const k = p.getY(i) / h; p.setZ(i, p.getZ(i) - bend * k * k * h); p.setY(i, p.getY(i) - bend * 0.35 * k * k * k * h); }
      g.computeVertexNormals(); return g;
    }
  };
  const flipY = g => g.rotateX(Math.PI); // đảo đầu nón

  /* ---------- quầng sáng (chỉ để xem, không xuất) ---------- */
  let glowTex = null;
  function glow(parent, x, y, z, size, col, op) {
    if (!glowTex) {
      const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
      const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(0, 0, 64, 64); glowTex = new T.CanvasTexture(c);
    }
    const sp = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: col, transparent: true, opacity: op || 0.8, blending: T.AdditiveBlending, depthWrite: false }));
    sp.scale.set(size, size, size); sp.position.set(x, y, z); sp.userData.noExport = true; parent.add(sp); return sp;
  }

  /* =================== MẶT =================== */
  /** gắn vật lên mặt cầu đầu: u = góc ngang (+ về bên trái nhân vật), v = góc dọc, k = hệ số bán kính */
  function onHead(head, R, obj, u, v, k, rz) {
    obj.position.set(S(u) * C(v) * R * k, S(v) * R * k, C(u) * C(v) * R * k);
    obj.rotation.set(-v, u, rz || 0, 'YXZ'); head.add(obj); return obj;
  }
  /** o: { iris, eye: 'cute'|'fierce'|'round'|'glow', brow, mouth: 'line'|'smile'|'grin'|'none', blush, eu, ev } */
  function face(head, R, o) {
    const eu = o.eu || 0.38, ev = o.ev === undefined ? -0.06 : o.ev, es = (o.es || 1) * (REAL.cur ? 1.1 : 1.3);
    for (const s of [-1, 1]) {
      const u = s * eu;
      if (o.eye === 'glow') {
        onHead(head, R, new T.Mesh(G.ball(R * 0.1 * es, 1.2, 0.7, 0.4), mat(o.iris, { glow: 2.2 })), u, ev, 0.99);
        const gp = new T.Vector3(S(u) * C(ev) * R * 1.05, S(ev) * R * 1.05, C(u) * C(ev) * R * 1.05);
        glow(head, gp.x, gp.y, gp.z, R * 0.9, o.iris, 0.9);
        continue;
      }
      const fy = o.eye === 'fierce' ? 0.72 : o.eye === 'round' ? 1.08 : 1;
      onHead(head, R, part(G.ball(R * 0.16 * es, 0.86, 1.1 * fy, 0.36), '#ffffff', { ink: 0.012 }), u, ev, 0.95);
      onHead(head, R, new T.Mesh(G.ball(R * 0.115 * es, 0.86, 1.05 * fy, 0.36), mat(o.iris)), u - s * 0.025, ev - 0.02, 0.985);
      onHead(head, R, new T.Mesh(G.ball(R * 0.062 * es, 0.86, 1.05 * fy, 0.36), mat(INK)), u - s * 0.028, ev - 0.02, 1.01);
      onHead(head, R, new T.Mesh(G.ball(R * 0.036 * es), mat('#ffffff', { glow: 0.6 })), u - s * 0.06, ev + 0.05 * fy, 1.035);
      if (o.brow) onHead(head, R, part(G.sbox(R * 0.36, R * 0.075, R * 0.09, 0.5), o.brow, { ink: 0.01 }), u, ev + (o.eye === 'fierce' ? 0.2 : 0.27), 1.0, s * (o.eye === 'fierce' ? 0.38 : -0.12));
      if (o.blush) onHead(head, R, new T.Mesh(G.ball(R * 0.1, 1.4, 0.7, 0.3), mat('#ff9a9a', { op: 0.75 })), s * 0.6, -0.26, 0.97);
    }
    const m = o.mouth || 'line';
    if (m === 'line') onHead(head, R, new T.Mesh(G.cap(R * 0.022, R * 0.16).rotateZ(Math.PI / 2), mat(INK)), 0, -0.36, 1.0);
    else if (m === 'smile') onHead(head, R, new T.Mesh(G.torus(R * 0.1, R * 0.022, Math.PI).rotateZ(Math.PI), mat(INK)), 0, -0.3, 0.99);
    else if (m === 'grin') onHead(head, R, new T.Mesh(G.ball(R * 0.16, 1.2, 0.55, 0.3), mat('#3a1a1a')), 0, -0.38, 0.96);
  }

  /* =================== KHUNG NGƯỜI =================== */
  /** Thân chibi: hông › thân › đầu, 2 tay (vai, cầm), 2 chân + giày. Mặt hướng +Z, cao ~2 đơn vị. */
  /** Tỉ lệ người thật thay cho chibi đầu to: chân/tay dài hơn (tham số), thân kéo cao, đầu thu nhỏ (hậu kỳ trong build) */
  const REAL = { v: true, cur: null };
  const RK = { soldier: {}, elf: {}, mage: {}, aldric: {}, lyra: {}, selene: {}, dwarf: { leg: 1.7, torso: 1.2, head: 0.55, arm: 1.35 }, borin: { leg: 1.7, torso: 1.2, head: 0.55, arm: 1.35 },
    imp: { leg: 1.65, torso: 1.2, head: 0.62, arm: 1.35 }, pharaoh: {}, goblin: { leg: 1.6, torso: 1.2, head: 0.58, arm: 1.35 }, orc: { head: 0.5 }, orcArcher: {}, skeleton: {}, deathKnight: { head: 0.5 }, bandit: {}, mummy: {}, voidWalker: { head: 0.5 },
    blackOrc: { head: 0.5 }, darkKnight: { head: 0.55, leg: 1.8, torso: 1.25 }, darkLord: { head: 0.55, leg: 1.7, torso: 1.2 } };
  function realK(id) { if (id === 'shade' || id === 'voidling') id = 'goblin'; if (/^soldierS/.test(id)) id = 'soldier'; if (!REAL.v || !RK[id]) return null; return Object.assign({ leg: 2.2, torso: 1.38, head: 0.5, arm: 1.55 }, RK[id]); }
  function realBody(o) {
    const k = REAL.cur; if (!k || o.real) return;
    o.legL = o.legL * k.leg + 0.04 * (k.leg - 1); o.legR *= 1.12; o.armL *= k.arm; o.armR *= 1.1; o.real = k;
  }
  /** kéo cao thân + thu đầu sau khi nhân vật đã gắn đủ đồ */
  function realize(rig) {
    const n = rig.n, o = rig.o, k = o && o.real; if (!k || !n.torso || !n.head) return;
    const ky = k.torso;
    for (const ch of n.torso.children) {
      ch.position.y *= ky;
      if (ch === n.head || /^arm/.test(ch.name)) continue;
      ch.scale.y *= ky;
    }
    n.head.scale.multiplyScalar(k.head);
    n.head.position.y = o.torsoH * ky + o.R * k.head * (o.neck || 0.8) + 0.04;
  }
  // A jaw and cheek planes replace the spherical skull while retaining the
  // forehead/eye surface used by onHead(), helmets and animation tracks.
  function skull(R) {
    if (/Golem|magmaLord/.test(BUILD_ID || '')) return G.sbox(R * 1.9, R * 1.8, R * 1.85, 0.3);
    if (/^treant/.test(BUILD_ID || '')) return G.lathe([[0, -R], [R * .58, -R], [R * .9, -R * .45], [R, R * .5], [R * .7, R], [0, R]], 9, .9);
    const g = G.ball(R, 1.04, 0.96, 1, 32), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i), lower = Math.max(0, -y / R);
      p.setXYZ(i, x * (1 - lower * 0.26), y, z > 0 ? z + R * 0.08 * lower : z);
    }
    g.computeVertexNormals(); return g;
  }
  // Continuous tapered limbs: broad upper segment, defined joint, narrower
  // wrist/ankle. Existing arm/leg pivots and weapon attachment points survive.
  function limb(r, len) {
    return G.lathe([[0, len / 2], [r * 0.82, len / 2],
      [r, len * 0.32], [r * 0.76, 0], [r * 0.9, -len * 0.19],
      [r * 0.58, -len / 2], [0, -len / 2]], 12, 0.88);
  }
  function humanoid(o) {
    const root = node('root'), n = {};
    realBody(o);
    o.hipY = o.legL + o.bootH;
    n.hips = node('hips', root, 0, o.hipY, 0);
    n.torso = node('torso', n.hips, 0, 0, 0);
    if (o.hunch) n.torso.rotation.x = o.hunch;
    n.head = node('head', n.torso, 0, o.torsoH + o.R * (o.neck || 0.8), o.headZ || 0);
    if (o.hunch) n.head.rotation.x = -o.hunch * 0.8;
    add(n.head, part(skull(o.R), o.skin, { sculpted: true }), 0, 0, 0);
    add(n.torso, part(G.cyl(o.R * 0.20, o.R * 0.24, o.R * 0.38), o.skin),
      0, o.torsoH + o.R * 0.09, 0);
    if (!/Knight|darkLord|Golem|treant|magmaLord/i.test(BUILD_ID || '')) {
      onHead(n.head, o.R, part(G.ext([-o.R * .07, 0, 0, o.R * .18, o.R * .07, 0], o.R * .13, .005), o.skin, { ink: .008 }), 0, -.16, 1.01);
      for (const side of [-1, 1]) add(n.head,
        part(G.sbox(o.R * .12, o.R * .30, o.R * .15, .6), o.skin),
        side * o.R * .99, -o.R * .05, 0);
    }
    const len = o.armL, sx = o.torsoW / 2 + o.armR * 0.5, sy = o.torsoH - o.armR * 1.15;
    for (const [s, k] of [[-1, 'R'], [1, 'L']]) {
      const arm = n['arm' + k] = node('arm' + k, n.torso, s * sx, sy, 0);
      arm.rotation.z = s * 0.14;
      add(arm,part(limb(o.armR,len*.5),o.sleeve,{tex:'cloth'}),0,-len*.25,0);
      const elbow=n['elbow'+k]=node('elbow'+k,arm,0,-len*.5,0);
      add(elbow,part(G.ball(o.armR*.8,1,.9,1,16),o.sleeve),0,0,0);
      add(elbow,part(limb(o.armR*.8,len*.5),o.sleeve,{tex:'cloth'}),0,-len*.25,0);
      const hand=n['hand'+k]=node('hand'+k,elbow,0,-len*.5,0);
      const skin=o.glove||o.skin;
      add(hand,part(G.ball(o.armR*.85,.85,1,.65,16),skin),0,-o.armR*.15,0);
      for(let digit=0;digit<4;digit++) add(hand,part(G.cap(o.armR*.14,o.armR*.6),skin,{ink:false}),(digit-1.5)*o.armR*.28,-o.armR*.85,o.armR*.13,-.4);
      add(hand,part(G.cap(o.armR*.20,o.armR*.65),skin,{ink:false}),s*o.armR*.7,-o.armR*.2,o.armR*.2,0,0,s*.6);
      const leg = n['leg' + k] = node('leg' + k, n.hips, s * o.torsoW * (o.real ? 0.27 : 0.22), 0.02, 0);
      add(leg,part(limb(o.legR,o.legL*.52),o.legs,{tex:'cloth'}),0,-o.legL*.26,0);
      const knee=n['knee'+k]=node('knee'+k,leg,0,-o.legL*.52,0);
      add(knee,part(G.ball(o.legR*.78,1,.85,1,16),o.legs),0,0,0);
      add(knee,part(limb(o.legR*.8,o.legL*.48),o.legs,{tex:'cloth'}),0,-o.legL*.24,0);
      add(knee,part(G.ball(o.legR,1.1,o.bootH/o.legR*.52,1.7,18),o.boots),0,-o.legL*.48-o.bootH*.4+.01,o.legR*.55);

    }
    return { root, n, o };
  }
  /** lưu tư thế nghỉ để hoạt ảnh cộng dồn */
  function freeze(rig) {
    Object.values(rig.n).forEach(nd => { nd.userData.r0 = nd.rotation.clone(); nd.userData.p0 = nd.position.clone(); nd.userData.s0 = nd.scale.clone(); });
  }

  /* =================== VŨ KHÍ (gốc = tay cầm, lưỡi theo +Y) =================== */
  const WEAP = {
    sword(len, w, blade, guard, o) {
      o = o || {}; const g = node('weapon');
      add(g, part(G.cyl(0.03, 0.03, 0.17), o.grip || '#4a2a1a'), 0, -0.07, 0);
      add(g, part(G.ball(0.048), o.pommel || GOLD, { metal: 1 }), 0, -0.17, 0);
      add(g, part(G.sbox(0.08, 0.06, w * 2.5, 0.5), guard, { metal: 1 }), 0, 0.03, 0);
      if (o.spikes) for (const s of [-1, 1]) add(g, part(G.cone(0.03, 0.12), guard), 0, 0.08, s * w * 1.3, s * 0.6, 0, 0);
      add(g, part(G.ext([-w / 2, 0, w / 2, 0, w / 2, len * 0.84, 0, len, -w / 2, len * 0.84], 0.032, 0.008).rotateY(Math.PI / 2), blade, { metal: 1, glow: o.glow }), 0, 0.05, 0);
      if (o.core) for (const s of [-1, 1]) add(g, new T.Mesh(G.sbox(0.006, len * 0.72, w * 0.22, 0.6), mat(o.core, { glow: 1.6 })), s * 0.026, 0.05 + len * 0.42, 0);
      if (o.halo) glow(g, 0, len * 0.55, 0, len * 1.1, o.halo, 0.35);
      return g;
    },
    shield(col, t, rim) {
      const g = node('shield'), sh = new T.Shape();
      sh.moveTo(-0.2, 0.24); sh.lineTo(0.2, 0.24); sh.quadraticCurveTo(0.22, -0.06, 0, -0.27); sh.quadraticCurveTo(-0.22, -0.06, -0.2, 0.24);
      add(g, part(G.ext(sh, 0.05, 0.018), rim || '#d8dce6', { metal: 1 }), 0, 0, 0);
      add(g, new T.Mesh(G.ext(sh, 0.05, 0.004).scale(0.86, 0.86, 1), mat(col)), 0, 0.005, 0.018);
      if (t >= 2) { add(g, part(G.sbox(0.05, 0.4, 0.03, 0.5), GOLD, { metal: 1, ink: 0.012 }), 0, -0.01, 0.06); add(g, part(G.sbox(0.3, 0.05, 0.03, 0.5), GOLD, { metal: 1, ink: 0.012 }), 0, 0.07, 0.06); }
      else add(g, part(G.ball(0.04, 1, 1, 0.6), '#c8c8c8', { metal: 1 }), 0, 0, 0.05);
      return g;
    },
    axe(c, double) {
      const g = node('weapon');
      add(g, part(G.cyl(0.03, 0.034, 0.85), '#5a3a24'), 0, 0.22, 0);
      for (const y of [0.0, 0.1]) add(g, new T.Mesh(G.torus(0.035, 0.008), mat('#3a2416')), 0, y, 0, Math.PI / 2);
      const bit = s => G.ext([0.02, 0.52, 0.16, 0.66, 0.28, 0.64, 0.25, 0.48, 0.28, 0.32, 0.16, 0.34, 0.02, 0.42], 0.04, 0.01).rotateY(-s * Math.PI / 2);
      add(g, part(bit(1), c, { metal: 1 }), 0, 0, 0);
      if (double) add(g, part(bit(-1), c, { metal: 1 }), 0, 0, 0);
      add(g, part(G.cone(0.03, 0.1), '#9aa0ac', { metal: 1 }), 0, 0.68, 0);
      return g;
    },
    warhammer(c) {
      const g = node('weapon');
      add(g, part(G.cyl(0.032, 0.036, 0.8), '#6a4026'), 0, 0.2, 0);
      add(g, part(G.sbox(0.22, 0.2, 0.36, 0.3), c, { metal: 1 }), 0, 0.62, 0);
      for (const s of [-1, 1]) add(g, part(G.sbox(0.24, 0.07, 0.06, 0.4), GOLD, { metal: 1 }), 0, 0.62, s * 0.19);
      add(g, new T.Mesh(G.ball(0.035), mat('#ff7a2a', { glow: 1.5 })), 0.115, 0.62, 0);
      return g;
    },
    knife(col) {
      const g = node('weapon');
      add(g, part(G.cyl(0.022, 0.022, 0.09), '#4a2e1a'), 0, -0.02, 0);
      add(g, part(G.ext([-0.035, 0, 0.035, 0, 0.02, 0.16, -0.01, 0.24, -0.04, 0.12], 0.02, 0.004).rotateY(Math.PI / 2), col || '#c8ccd4', { metal: 1, glow: col ? 0.5 : 0 }), 0, 0.03, 0);
      return g;
    },
    spear() {
      const g = node('weapon');
      add(g, part(G.cyl(0.024, 0.026, 1.35), '#6a4426'), 0, 0.3, 0);
      add(g, part(G.oct(0.07, 2.2).scale(1, 1, 0.4), '#c8ccd6', { metal: 1 }), 0, 1.1, 0);
      add(g, part(G.cone(0.05, 0.12), '#a8201a'), 0, 0.92, 0, Math.PI);
      return g;
    },
    staff(gem, t, n) {
      const g = node('staff');
      add(g, part(G.cyl(0.026, 0.032, 1.08), t >= 3 ? '#3a2a5a' : '#5a3a26'), 0, 0.17, 0);
      add(g, part(G.torus(0.045, 0.016), GOLD, { metal: 1 }), 0, 0.7, 0, Math.PI / 2);
      for (let i = 0; i < 3; i++) { const a = i / 3 * TAU; add(g, part(G.cone(0.02, 0.12), GOLD, { metal: 1, ink: 0.012 }), S(a) * 0.04, 0.76, C(a) * 0.04, C(a) * 0.5, 0, -S(a) * 0.5); }
      n.gem = node('gem', g, 0, 0.88, 0);
      add(n.gem, part(G.oct(0.085 + t * 0.008, 1.45), gem, { glow: 1.1, ink: 0.014 }), 0, 0, 0);
      glow(n.gem, 0, 0, 0, 0.5 + t * 0.08, gem, 0.75);
      return g;
    },
    bow(t, n, o) {
      const g = node('bow'), wood = (o && o.wood) || (t >= 3 ? GOLD : '#c89a3a');
      add(g, part(G.tube([[0, 0.14, -0.46], [0, 0.03, -0.27], [0, -0.04, 0], [0, 0.03, 0.27], [0, 0.14, 0.46]], 0.022), wood, { metal: t >= 3 }), 0, 0, 0);
      if (t >= 2) for (const s of [-1, 1]) add(g, new T.Mesh(G.tube([[0.02, 0.0, s * 0.08], [0.022, 0.035, s * 0.3]], 0.008, 6), mat('#3fae5a')), 0, 0, 0);
      add(g, part(G.cyl(0.032, 0.032, 0.12).rotateX(Math.PI / 2), '#5a3420'), 0, -0.04, 0);
      for (const s of [-1, 1]) add(g, part(G.ball(0.03), t >= 4 ? '#c8ffb0' : GOLD, { glow: t >= 4 ? 1.2 : 0 }), 0, 0.14, s * 0.46);
      add(g, new T.Mesh(G.cyl(0.005, 0.005, 0.92).rotateX(Math.PI / 2), mat('#f4f0e0')), 0, 0.14, 0);
      n.arrow = node('arrow', g, 0, 0.14, 0);
      add(n.arrow, part(G.cyl(0.011, 0.011, 0.5), '#d8b880', { ink: 0.012 }), 0, -0.2, 0);
      add(n.arrow, part(flipY(G.cone(0.03, 0.08)), t >= 4 ? '#c8ffb0' : '#dfe6f0', { metal: 1, ink: 0.012, glow: t >= 4 ? 1 : 0 }), 0, -0.48, 0);
      for (const s of [-1, 1]) add(n.arrow, new T.Mesh(G.sbox(0.004, 0.08, 0.04), mat('#f4f0e0')), 0, 0.02, s * 0.018);
      if (t >= 4) glow(g, 0, 0, 0, 0.7, '#c8ffb0', 0.35);
      return g;
    }
  };

  /* =================== NHÂN VẬT =================== */
  /** Kiếm sĩ Con Người (trụ Người) / Aldric (anh hùng) */
  function SOLDIER(t, o) {
    o = o || {};
    const HC = o.hair || '#1e1a22', CAPE = o.cape || '#6a1218';
    const armor = o.armor || (t === 1 ? '#aab0ba' : t === 2 ? '#c2c8d2' : '#dde2ea');
    const rig = humanoid({ R: 0.46, torsoH: 0.5, torsoW: 0.5, torsoD: 0.36, legL: 0.3, legR: 0.095, bootH: 0.13, armL: 0.37, armR: 0.092,
      skin: SKIN, legs: '#5a5e6a', boots: t >= 3 ? '#8a94a6' : '#3a2a20', sleeve: armor, glove: '#6a6e78' });
    const { n } = rig, d = rig.o, R = d.R;
    add(n.torso, part(G.sbox(d.torsoW, d.torsoH, d.torsoD, 0.32), armor, { metal: 1 }), 0, d.torsoH / 2, 0);
    add(n.torso, part(G.sbox(d.torsoW * 1.04, 0.07, d.torsoD * 1.04, 0.4), '#3a2216'), 0, 0.05, 0);
    add(n.torso, part(G.ext([-0.13, 0, 0.13, 0, 0.1, -0.2, 0, -0.25, -0.1, -0.2], 0.04, 0.01), CAPE), 0, 0.04, d.torsoD / 2 - 0.02);
    if (t >= 3) {
      add(n.torso, part(G.sbox(d.torsoW * 0.9, 0.04, 0.03, 0.5), GOLD, { metal: 1, ink: 0.012 }), 0, d.torsoH * 0.78, d.torsoD / 2);
      add(n.torso, part(G.ball(0.04, 1, 1, 0.6), '#c8202a', { glow: 0.3 }), 0, d.torsoH * 0.55, d.torsoD / 2 + 0.005);
    }
    for (const k of ['R', 'L']) add(n['arm' + k], part(G.ball(0.15, 1.15, 0.85, 1.05), t >= 4 ? GOLD : armor, { metal: 1 }), 0, 0.02, 0);
    n.cape = node('cape', n.torso, 0, d.torsoH - 0.03, -d.torsoD / 2 + 0.02);
    add(n.cape, part(G.cape(d.torsoW * 0.9, 0.42 + t * 0.07, 0.5), CAPE, { ds: true }), 0, 0, 0);
    // đầu
    face(n.head, R, { iris: o.iris || '#3a2a22', eye: 'fierce', brow: HC === '#1e1a22' ? INK : '#8a8ea0', mouth: 'line' });
    add(n.head, part(G.ball(R * 1.07, 1.04, 0.9, 1.04), HC, { tex: 'hair' }), 0, R * 0.22, -R * 0.13);
    for (const [x, z, rx, rz, h] of [[-0.55, -0.1, -0.2, 0.55, 0.42], [-0.05, 0.05, -0.35, 0.05, 0.46], [0.45, -0.05, -0.2, -0.5, 0.4], [0.05, -0.6, -0.9, 0.1, 0.42]])
      add(n.head, part(G.cone(R * 0.25, R * h), HC, { tex: 'hair' }), R * x, R * 0.95, R * z, rx, 0, rz);
    for (const [x, rz] of [[-0.4, 0.35], [0.05, 0], [0.42, -0.3]]) onHead(n.head, R, part(flipY(G.cone(R * 0.19, R * 0.34)), HC, { tex: 'hair' }), x * 0.9, 0.5, 0.97, rz);
    if (t >= 4 && !o.noCrown) {
      add(n.head, part(G.cyl(R * 0.5, R * 0.55, R * 0.16, 16), GOLD, { metal: 1 }), 0, R * 1.02, -R * 0.05);
      for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; add(n.head, part(G.cone(R * 0.09, R * 0.28), GOLD, { metal: 1, ink: 0.014 }), S(a) * R * 0.5, R * 1.22, C(a) * R * 0.5 - R * 0.05); }
    }
    // vũ khí
    let sw;
    if (o.weapon === 'greatsword') sw = WEAP.sword(0.78, 0.15, '#e8f4ff', GOLD, { core: o.wcol || '#9ae0ff', halo: o.wcol || '#9ae0ff', grip: '#3a2a4a' });
    else sw = WEAP.sword(0.7, 0.13, t >= 3 ? '#f0f4fa' : '#d4dae4', t >= 3 ? GOLD : '#8a8e98', { glow: t === 4 ? 0.25 : 0, halo: t === 4 ? '#ffe6a0' : null });
    add(n.handR, sw, 0, 0, 0, 1.15);
    if (o.shield !== false) { n.shield = WEAP.shield(o.shieldCol || '#8a1e24', o.shieldStyle || t, o.shieldRim || (t >= 3 ? GOLD : '#d8dce6')); add(n.handL, n.shield, 0.07, 0.14, 0.05, 0, 0.45, 0); if (o.shieldGlow) glow(n.shield, 0, 0, 0.06, 0.55, '#ffd060', 0.45); }
    return { rig, anim: { kind: 'melee', shield: o.shield !== false, skill: o.shield !== false ? 'block' : 'holy' } };
  }

  /** Cung thủ Elf / Lyra */
  function ELF(t, o) {
    o = o || {};
    const tunic = o.tunic || (t >= 4 ? '#5ac078' : '#3fa05a'), hairC = o.hair || (t >= 3 ? '#fff6dc' : '#f5d878'), cape = o.cape || (t >= 2 ? '#2f7a40' : null);
    const rig = humanoid({ R: 0.46, torsoH: 0.46, torsoW: 0.38, torsoD: 0.28, legL: 0.33, legR: 0.078, bootH: 0.12, armL: 0.36, armR: 0.072,
      skin: SKIN, legs: '#2f6a3a', boots: '#6a4a26', sleeve: tunic });
    const { n } = rig, d = rig.o, R = d.R;
    add(n.torso, part(G.lathe([[0, 0.48], [0.17, 0.48], [0.2, 0.36], [0.19, 0.2], [0.23, 0.02], [0.27, -0.1], [0, -0.1]], 20, 0.78), tunic), 0, 0, 0);
    add(n.torso, part(G.torus(0.2, 0.025).rotateX(Math.PI / 2).scale(1, 1, 0.8), '#6a4a26'), 0, 0.12, 0);
    if (t >= 2) add(n.torso, part(G.sbox(0.025, 0.36, 0.02), GOLD, { metal: 1, ink: 0.01 }), 0, 0.26, 0.15);
    for (const s of [-1, 1]) add(n.torso, part(G.ball(0.11, 1.3, 0.55, 1), t >= 3 ? GOLD : '#7acc6a', { metal: t >= 3 }), s * 0.2, 0.46, 0, 0, 0, -s * 0.35);
    // ống tên sau lưng
    const q = node('quiver', n.torso, -0.08, 0.3, -0.17); q.rotation.set(0.15, 0, -0.45);
    add(q, part(G.cyl(0.06, 0.055, 0.34), '#7a4a26'), 0, 0, 0);
    for (const x of [-0.025, 0.0, 0.025]) add(q, part(G.cone(0.025, 0.1), t >= 4 ? '#9affc8' : '#f4f0e0', { ink: 0.01 }), x, 0.22, 0);
    if (cape) { n.cape = node('cape', n.torso, 0, d.torsoH - 0.04, -d.torsoD / 2 + 0.02); add(n.cape, part(G.cape(d.torsoW * 0.85, 0.34, 0.4), cape, { ds: true }), 0, 0, 0); }
    face(n.head, R, { iris: '#2aa86a', eye: 'cute', brow: '#c8a040', mouth: 'smile', blush: true });
    add(n.head, part(G.ball(R * 1.07, 1.03, 0.9, 1.04), hairC, { tex: 'hair' }), 0, R * 0.21, -R * 0.13);
    add(n.head, part(G.ball(R * 0.75, 1.05, 1.55, 0.55), hairC, { tex: 'hair' }), 0, -R * 0.6, -R * 0.6, 0.15);
    for (const [x, rz] of [[-0.5, 0.5], [-0.15, 0.25], [0.3, -0.35]]) onHead(n.head, R, part(flipY(G.cone(R * 0.22, R * 0.5)), hairC, { tex: 'hair' }), x, 0.48, 0.96, rz);
    for (const s of [-1, 1]) add(n.head, part(G.cone(R * 0.15, R * 0.75).scale(1, 1, 0.5), SKIN), s * R * 1.08, R * 0.12, -R * 0.08, 0, 0, -s * (Math.PI / 2 - 0.45));
    if (t >= 3) {
      add(n.head, part(G.torus(R * 1.02, 0.018).rotateX(Math.PI / 2), GOLD, { metal: 1, ink: 0.012 }), 0, R * 0.42, 0, -0.12);
      onHead(n.head, R, part(G.oct(0.05, 1.3), '#7fffd0', { glow: 0.8, ink: 0.012 }), 0, 0.5, 1.03);
    }
    add(n.handL, WEAP.bow(t, n), 0, 0, 0.02);
    return { rig, anim: { kind: 'bow', skill: 'triple' } };
  }

  /** Phù thuỷ (trụ Phép) / Selene */
  function MAGE(t, o) {
    o = o || {};
    const robe = o.robe || '#4a3ec4', hairC = o.hair || '#d8d4f8', hatC = o.hat || '#3a2ea0', trimC = o.trim || '#7fd8ff', capeC = o.cape || '#2a2480';
    const rig = humanoid({ R: 0.46, torsoH: 0.44, torsoW: 0.36, torsoD: 0.3, legL: 0.2, legR: 0.07, bootH: 0.1, armL: 0.33, armR: 0.075,
      skin: SKIN, legs: '#2a2260', boots: '#22183a', sleeve: robe });
    const { n } = rig, d = rig.o, R = d.R;
    add(n.torso, part(G.lathe([[0, 0.46], [0.16, 0.46], [0.19, 0.3], [0.26, 0.05], [0.36, -0.2], [0.42, -0.28], [0, -0.28]], 22, 0.85), robe), 0, 0, 0);
    add(n.torso, part(G.torus(0.415, 0.022).rotateX(Math.PI / 2).scale(1, 1, 0.85), trimC, { ink: 0.012 }), 0, -0.27, 0);
    add(n.torso, part(G.torus(0.17, 0.045).rotateX(Math.PI / 2).scale(1, 1, 0.85), robe), 0, 0.45, 0);
    add(n.torso, part(G.sbox(0.03, 0.62, 0.02), trimC, { ink: 0.01 }), 0, 0.1, 0.2, -0.38);
    add(n.torso, part(G.torus(0.19, 0.022).rotateX(Math.PI / 2).scale(1, 1, 0.85), GOLD, { metal: 1, ink: 0.012 }), 0, 0.2, 0);
    if (t >= 3) add(n.torso, part(G.oct(0.05, 1.3).scale(1, 1, 0.5), trimC, { glow: 0.8, ink: 0.012 }), 0, 0.36, 0.15);
    for (const k of ['R', 'L']) add(n['arm' + k], part(G.cyl(0.07, 0.12, 0.16), robe), 0, -0.25, 0);
    n.cape = node('cape', n.torso, 0, d.torsoH - 0.04, -d.torsoD / 2 + 0.03);
    add(n.cape, part(G.cape(d.torsoW * 1.0, 0.62, 0.9), capeC, { ds: true }), 0, 0, 0);
    face(n.head, R, { iris: o.iris || '#7a5ae0', eye: 'cute', brow: '#9a90c8', mouth: 'smile', blush: true });
    add(n.head, part(G.ball(R * 1.07, 1.03, 0.92, 1.04), hairC, { tex: 'hair' }), 0, R * 0.17, -R * 0.13);
    add(n.head, part(G.ball(R * 0.78, 1.15, 1.5, 0.55), hairC, { tex: 'hair' }), 0, -R * 0.55, -R * 0.55, 0.12);
    for (const [x, rz] of [[-0.45, 0.4], [0.35, -0.4]]) onHead(n.head, R, part(flipY(G.cone(R * 0.24, R * 0.55)), hairC, { tex: 'hair' }), x, 0.38, 0.95, rz);
    // mũ phù thuỷ
    const hat = node('hat', n.head, 0, R * 0.62, -R * 0.04); hat.rotation.set(-0.08, 0, 0.06);
    add(hat, part(G.cyl(R * 1.72, R * 1.72, R * 0.09, 28), hatC), 0, 0, 0);
    add(hat, part(G.bentCone(R * 0.92, R * 2.4, 0.42), hatC), 0, R * 0.03, 0);
    add(hat, part(G.cyl(R * 0.86, R * 0.92, R * 0.22, 22), GOLD, { metal: 1 }), 0, R * 0.14, 0);
    for (const [x, y, z, r] of [[-0.35, 0.95, 0.5, 0.07], [0.3, 1.25, 0.33, 0.05], [0.05, 1.7, 0.08, 0.045]]) add(hat, part(G.oct(R * r * 1.6, 1).scale(1, 1, 0.5), '#fff6a0', { glow: 0.7, ink: 0.01 }), R * x, R * y, R * z, 0, 0, 0.4);
    const staff = WEAP.staff(o.wcol || '#9ae6ff', t, n); n.staff = staff;
    add(n.handR, staff, 0, 0, 0.02, 0.12);
    return { rig, anim: { kind: 'staff', skill: 'meteor' } };
  }

  /** Chiến binh Lùn (trụ Lùn) / Borin */
  function DWARF(t, o) {
    o = o || {};
    const steel = t >= 4 ? '#d8b860' : '#9ea4b0', beard = o.beard || '#d4581e', armor = o.armor || (t >= 3 ? '#8a92a0' : '#7a6a5a');
    const rig = humanoid({ R: 0.5, torsoH: 0.44, torsoW: 0.7, torsoD: 0.54, legL: 0.13, legR: 0.12, bootH: 0.15, armL: 0.34, armR: 0.12,
      skin: '#f8c4a0', legs: '#4a3428', boots: '#2a1c14', sleeve: armor, glove: '#3a2a20', neck: 0.62 });
    const { n } = rig, d = rig.o, R = d.R;
    add(n.torso, part(G.ball(0.4, 0.95, 0.68, 0.72), armor, { metal: t >= 3 }), 0, 0.22, 0);
    for (const y of [0.32, 0.17]) add(n.torso, new T.Mesh(G.torus(0.37, 0.012).rotateX(Math.PI / 2).scale(1.03, 1, 0.78), mat('#3a3028')), 0, y, 0);
    add(n.torso, part(G.cyl(0.38, 0.38, 0.1, 22).scale(1, 1, 0.78), '#3a2416'), 0, 0.04, 0);
    add(n.torso, part(G.sbox(0.13, 0.11, 0.05, 0.4), GOLD, { metal: 1 }), 0, 0.04, 0.3);
    for (const k of ['R', 'L']) {
      add(n['arm' + k], part(G.ball(0.19, 1.1, 0.8, 1.05), steel, { metal: 1 }), 0, 0.02, 0);
      if (t >= 2) for (const z of [-0.07, 0.07]) add(n['arm' + k], new T.Mesh(G.ball(0.022), mat('#e8e8f0')), 0, 0.17, z);
    }
    face(n.head, R, { iris: '#3a5ab8', eye: 'cute', brow: null, mouth: 'none', ev: 0.0, es: 0.85 });
    for (const s of [-1, 1]) onHead(n.head, R, part(G.sbox(R * 0.42, R * 0.13, R * 0.14, 0.5), beard, { ink: 0.012 }), s * 0.38, 0.2, 1.08, s * 0.22);
    onHead(n.head, R, part(G.ball(R * 0.2), '#f0a080', { ink: 0.014 }), 0, -0.2, 1.0);
    // râu khổng lồ
    add(n.head, part(G.ball(R * 0.78, 1.1, 1.1, 0.62), beard, { tex: 'fur' }), 0, -R * 0.95, R * 0.52);
    for (const s of [-1, 1]) {
      add(n.head, part(G.ball(R * 0.42, 0.8, 1.1, 0.8), beard, { tex: 'fur' }), s * R * 0.7, -R * 0.5, R * 0.3);
      add(n.head, part(G.cap(R * 0.1, R * 0.4).rotateZ(Math.PI / 2 - s * 0.35), sh(beard, 0.15)), s * R * 0.25, -R * 0.4, R * 0.96);
    }
    if (t >= 3) for (const s of [-1, 1]) add(n.head, part(G.cyl(R * 0.1, R * 0.1, R * 0.14), GOLD, { metal: 1, ink: 0.012 }), s * R * 0.3, -R * 1.6, R * 0.62);
    // mũ sắt
    add(n.head, part(G.ball(R * 1.09, 1.03, 0.72, 1.04), steel, { metal: 1 }), 0, R * 0.45, -R * 0.04);
    add(n.head, part(G.torus(R * 1.0, R * 0.08).rotateX(Math.PI / 2), sh(steel, -0.15), { metal: 1 }), 0, R * 0.48, -R * 0.03, -0.06);
    onHead(n.head, R, part(G.sbox(R * 0.16, R * 0.5, R * 0.12, 0.5), sh(steel, -0.1), { metal: 1, ink: 0.014 }), 0, 0.36, 1.07);
    if (t >= 3) for (const s of [-1, 1]) add(n.head, part(G.tube([[s * R * 0.8, R * 0.62, 0], [s * R * 1.4, R * 0.9, 0], [s * R * 1.5, R * 1.45, -R * 0.1], [s * R * 1.3, R * 1.9, -R * 0.15]], R * 0.12, 16), '#f2ead6'), 0, 0, 0);
    let w;
    if (o.weapon === 'warhammer') w = WEAP.warhammer(t >= 3 ? '#c4c8d4' : '#a8adb8');
    else w = WEAP.axe(t >= 4 ? '#f2d070' : t >= 3 ? '#d8dce6' : '#aeb2bc', true);
    add(n.handR, w, 0, 0, 0, 1.1);
    return { rig, anim: { kind: 'two', skill: 'slam' } };
  }
  function sh(hex, k) { const c = new T.Color(hex); const hsl = {}; c.getHSL(hsl); return '#' + new T.Color().setHSL(hsl.h, hsl.s, Math.max(0, Math.min(1, hsl.l + k * 0.5))).getHexString(); }

  /** Goblin (quái nhỏ) / Bóng Tối */
  function GOBLIN(o) {
    o = o || {}; const skin = o.skin || '#7cc23e', cloth = o.cloth || '#7a5232', eye = o.eye || '#ffd23a';
    const rig = humanoid({ R: 0.42, torsoH: 0.3, torsoW: 0.3, torsoD: 0.25, legL: 0.18, legR: 0.062, bootH: 0.08, armL: 0.27, armR: 0.058, hunch: 0.32, neck: 0.75, headZ: 0.06,
      skin, legs: sh(skin, -0.25), boots: '#4a3020', sleeve: skin });
    const { n } = rig, d = rig.o, R = d.R;
    add(n.torso, part(G.lathe([[0, 0.31], [0.13, 0.31], [0.16, 0.18], [0.2, 0.0], [0.17, -0.06], [0, -0.06]], 9, 0.85), cloth), 0, 0, 0);
    add(n.torso, part(G.torus(0.15, 0.02).rotateX(Math.PI / 2).scale(1, 1, 0.85), '#3a2416', { ink: 0.01 }), 0, 0.08, 0);
    if (o.glow) {
      face(n.head, R, { iris: eye, eye: 'glow', es: 1.2, mouth: o.horns ? 'grin' : 'none' });
      glow(n.torso, 0, 0.2, 0, 1.6, o.aura || '#7a3aff', 0.35);
    } else face(n.head, R, { iris: eye, eye: 'round', es: 1.15, brow: sh(skin, -0.4), mouth: 'grin', eu: 0.4 });
    if (!o.glow || o.horns) onHead(n.head, R, new T.Mesh(flipY(G.cone(R * 0.06, R * 0.12)), mat('#fffbe8')), 0.08, -0.36, 1.0);
    onHead(n.head, R, part(G.cone(R * 0.11, R * 0.36).rotateX(Math.PI / 2), skin), 0, -0.12, 0.98);
    for (const s of [-1, 1]) add(n.head, part(G.cone(R * 0.22, R * 1.3).scale(1, 1, 0.42), skin), s * R * 1.35, R * 0.18, -R * 0.05, 0, 0, -s * (Math.PI / 2 - 0.28));
    if (o.horns) for (const s of [-1, 1]) add(n.head, part(G.tube([[s * R * 0.35, R * 0.75, 0], [s * R * 0.6, R * 1.15, -R * 0.1], [s * R * 0.5, R * 1.5, -R * 0.35]], R * 0.1, 10), o.horns), 0, 0, 0);
    if (o.cracks) for (const [u, v] of [[-0.6, 0.3], [0.5, 0.45], [0.2, -0.55]]) onHead(n.head, R, new T.Mesh(G.sbox(R * 0.05, R * 0.3, R * 0.04), mat(o.cracks, { glow: 1.4 })), u, v, 1.0, 0.5);
    if (!o.glow) {
      add(n.head, part(G.ball(R * 1.05, 1.02, 0.62, 1.04), '#c8302a'), 0, R * 0.42, -R * 0.08);
      for (const s of [-1, 1]) add(n.head, part(G.cone(R * 0.12, R * 0.4), '#c8302a'), s * R * 0.12, R * 0.2, -R * 1.05, -2.0, 0, s * 0.4);
    }
    const kn = WEAP.knife(o.blade);
    add(n.handR, kn, 0, 0, 0, 1.2);
    return { rig, anim: { kind: 'stab', look: true, skill: null } };
  }

  /** Orc (quái) – biến thể 1..3 */
  function ORC(t) {
    const skin = '#81965a', leather = '#5c3426', steel = '#4b4642';
    const proportions=REAL.cur;REAL.cur=null;
    const rig = humanoid({ R: .34, torsoH: .60, torsoW: .82, torsoD: .44, legL: .43, legR: .15, bootH: .12, armL: .52, armR: .15,
      skin, legs: '#4a2e20', boots: '#2a1a14', sleeve: skin, glove: '#4a2e20' });
    REAL.cur=proportions;
    const { n } = rig, d = rig.o, R = d.R;
    add(n.torso, part(G.sbox(d.torsoW, d.torsoH, d.torsoD, 0.4), skin), 0, d.torsoH / 2, 0);
    add(n.torso, part(G.sbox(0.07, 0.72, 0.46, 0.5), '#3a2216', { ink: 0.014 }), 0, d.torsoH * 0.5, 0, 0, 0, 0.75);
    add(n.torso, part(G.sbox(d.torsoW * 1.06, 0.1, d.torsoD * 1.06, 0.4), leather), 0, 0.05, 0);
    add(n.torso, part(G.ext([-0.13, 0, 0.13, 0, 0.1, -0.22, -0.1, -0.22], 0.04, 0.01), '#b02a24'), 0, 0.02, d.torsoD / 2 - 0.02);
    add(n.armR, part(G.ball(0.19, 1.1, 0.8, 1.05), steel, { metal: 1 }), 0, 0.02, 0);
    if (t >= 2) add(n.armL, part(G.ball(0.17, 1.1, 0.8, 1.05), leather), 0, 0.02, 0);
    if (t >= 2) for (const z of [-0.08, 0.08]) add(n.armR, part(G.cone(0.04, 0.14), '#d8d8e0', { ink: 0.012 }), 0, 0.2, z);
    if (t >= 3) { // da sói trên vai
      add(n.torso, part(G.ball(0.36, 1.2, 0.4, 0.85), '#8a8a92'), 0, d.torsoH + 0.02, -0.02);
      for (const x of [-0.12, 0, 0.12]) add(n.torso, part(flipY(G.cone(0.03, 0.09)), '#f2f0e8', { ink: 0.01 }), x, d.torsoH - 0.06, 0.28);
    }
    face(n.head, R, { iris: '#ff5a2a', eye: 'fierce', brow: INK, mouth: 'grin' });
    for (const s of [-1, 1]) {
      onHead(n.head, R, part(G.cone(R * 0.075, R * 0.3), '#fff8e0', { ink: 0.012 }), s * 0.28, -0.4, 1.0);
      add(n.head, part(G.cone(R * 0.16, R * 0.5).scale(1, 1, 0.5), skin), s * R * 1.02, R * 0.08, -R * 0.05, 0, 0, -s * (Math.PI / 2 - 0.35));
    }

      add(n.head, part(G.ball(R * 1.06, 1.02, 0.8, 1.02), '#2a1e22'), 0, R * 0.22, -R * 0.16);
      add(n.head, part(G.ball(R * 0.32), '#2a1e22'), 0, R * 1.05, -R * 0.25);
      add(n.head, part(G.torus(R * 1.03, R * 0.07).rotateX(Math.PI / 2), '#b02a24'), 0, R * 0.3, -R * 0.06, -0.12);

    add(n.handR, WEAP.axe('#6c6660', true), 0, 0, 0, 1.1);
    return { rig, anim: { kind: 'melee', skill: null } };
  }

  /** Kỵ Sĩ Hắc Ám (boss giữa màn) – p2: áo choàng bay lên, kiếm rực đỏ */
  function DARKKNIGHT(p2, lord, p3, pal) {
    pal = pal || {};
    const armor = pal.armor || (p3 ? '#4a1e22' : '#2c2a36'), trim = pal.trim || (p3 ? '#ff4a2a' : lord ? '#8a2a3a' : '#5a2a3a'), light = pal.light || '#4a4658';
    const rig = humanoid({ R: 0.42, torsoH: 0.62, torsoW: 0.62, torsoD: 0.42, legL: 0.38, legR: 0.12, bootH: 0.14, armL: 0.44, armR: 0.12,
      skin: armor, legs: '#22202a', boots: '#16141c', sleeve: armor, glove: '#1a1820', neck: 0.85 });
    const { n } = rig, d = rig.o, R = d.R, gl = p3 ? 0.35 : 0;
    add(n.torso, part(G.sbox(d.torsoW, d.torsoH, d.torsoD, 0.3), armor, { metal: 1, glow: gl }), 0, d.torsoH / 2, 0);
    add(n.torso, part(G.sbox(0.05, d.torsoH * 0.85, 0.04, 0.5), trim, { ink: 0.012, glow: p3 ? 1 : 0 }), 0, d.torsoH / 2, d.torsoD / 2);
    add(n.torso, part(G.sbox(d.torsoW * 1.05, 0.09, d.torsoD * 1.05, 0.4), '#16141c'), 0, 0.05, 0);
    if (lord) add(n.torso, part(G.ext([-0.12, 0, 0.12, 0, 0, -0.2], 0.03, 0.008), trim, { glow: p3 ? 1.2 : 0.3 }), 0, d.torsoH * 0.82, d.torsoD / 2 + 0.01);
    for (const k of ['R', 'L']) {
      add(n['arm' + k], part(G.ball(0.2, 1.15, 0.85, 1.05), armor, { metal: 1, glow: gl }), 0, 0.03, 0);
      add(n['arm' + k], part(G.cone(0.06, 0.24), light, { metal: 1 }), 0, 0.26, 0, 0, 0, k === 'R' ? 0.35 : -0.35);
    }
    n.cape = node('cape', n.torso, 0, d.torsoH - 0.03, -d.torsoD / 2 + 0.02);
    if (p2 && !lord) n.cape.rotation.x = 0.85;
    add(n.cape, part(G.cape(d.torsoW * 1.0, lord ? 1.15 : 0.95, lord ? 1.1 : 0.8), pal.cape || '#141018', { ds: true }), 0, 0, 0);
    if (pal.tabard) add(n.torso, part(G.ext([-0.16, 0, 0.16, 0, 0.12, -0.3, 0, -0.36, -0.12, -0.3], 0.04, 0.01), pal.tabard), 0, 0.06, d.torsoD / 2 - 0.01);
    if (pal.plume) { add(n.head, part(G.ball(R * 0.3, 0.5, 1, 1.6), pal.plume), 0, R * 1.35, -R * 0.35, -0.5); }
    // mũ trụ kín
    onHead(n.head, R, new T.Mesh(G.sbox(R * 1.15, R * 0.3, R * 0.3, 0.4), mat('#0a080e')), 0, 0.02, 0.92);
    face(n.head, R, { iris: pal.eye || (p3 ? '#ffb04a' : '#ff2a1a'), eye: 'glow', ev: 0.02, eu: 0.3 });
    for (let i = 0; i < 3; i++) onHead(n.head, R, new T.Mesh(G.sbox(R * 0.05, R * 0.3, R * 0.06), mat('#0a080e')), (i - 1) * 0.2, -0.45, 0.98);
    add(n.head, part(G.cone(R * 0.22, R * 0.75), light, { metal: 1 }), 0, R * 1.1, -R * 0.1, -0.2);
    for (const s of [-1, 1]) add(n.head, part(G.cone(R * 0.16, R * 0.75), light, { metal: 1 }), s * R * 1.0, R * 0.6, -R * 0.05, 0, 0, -s * 0.8);
    add(n.head, part(G.torus(R * 1.02, R * 0.05).rotateX(Math.PI / 2), trim, { glow: p3 ? 1 : 0 }), 0, R * 0.36, 0, -0.06);
    if (lord) { // vương miện đen
      for (let i = 0; i < 7; i++) { const a = i / 7 * TAU; add(n.head, part(G.cone(R * 0.12, R * (i % 2 ? 0.45 : 0.7)), '#18141e', { metal: 1, ink: 0.016 }), S(a) * R * 0.8, R * 0.95, C(a) * R * 0.8, C(a) * 0.25, 0, -S(a) * 0.25); }
      for (const a of [-0.9, 0, 0.9]) add(n.head, new T.Mesh(G.ball(R * 0.08), mat(p3 ? '#ffd040' : '#c8202a', { glow: 1.4 })), S(a) * R * 0.88, R * 0.82, C(a) * R * 0.88);
    }
    const red = p2 || lord;
    const sw = WEAP.sword(lord ? 1.25 : 1.05, 0.21, pal.blade || '#26222e', pal.guard || '#2a2430', { spikes: true, grip: '#1a1418', pommel: '#5a1a22', core: pal.core || (red ? '#ff4a2a' : '#6a3a7a'), halo: pal.core || (red ? '#ff2a1a' : null) });
    add(n.handR, sw, 0, 0, 0, 1.15);
    if (lord) { // khói bóng tối sau lưng (chỉ để xem)
      const aura = node('aura', n.torso, 0, 0.3, -0.35); aura.userData.noExport = true; const puffs = [];
      for (let i = 0; i < 9; i++) { const m = new T.Mesh(G.ball(0.2, 1, 1, 1, 12), mat(p3 ? '#5a0e14' : '#1a1024', { op: 0.55 })); aura.add(m); puffs.push(m); }
      glow(aura, 0, 0.2, 0, 2.6, p3 ? '#ff2a1a' : '#6a1a8a', 0.4);
      aura.userData.tick = tt => puffs.forEach((m, i) => { const ph = (tt * 0.35 + i / puffs.length) % 1; m.position.set(S(i * 2.3 + tt) * 0.35 - ph * 0.1, ph * 1.4 - 0.2, -ph * 0.25); m.scale.setScalar(0.6 + ph * 1.2); m.material.opacity = (1 - ph) * 0.6; });
    }
    return { rig, anim: { kind: 'melee', still: !lord, heavy: true, skill: lord ? 'slam' : 'summon' } };
  }

  /** Orc cưỡi sói (quái) – khung riêng 4 chân */
  function WOLF(o) {
    o = o || {};
    const root = node('root'), n = {}, fur = o.fur || '#7a7680', furD = o.furD || '#4a4652', skin = '#7a9a62', W = o.big || 1;
    n.wolf = node('wolf', root, 0, 0.72, 0);
    add(n.wolf, part(limb(0.3, 1.1).rotateX(Math.PI / 2), fur), 0, 0, 0);
    add(n.wolf, new T.Mesh(G.ball(0.24, 1, 0.6, 1.4), mat(o.belly || '#c8c0c8')), 0, -0.14, 0.05);
    for (let i = 0; i < 4; i++) add(n.wolf, part(G.cone(0.07, 0.2), furD, { ink: 0.014 }), 0, 0.3, 0.3 - i * 0.16, -0.5);
    for (const [k, x, z] of [['wFL', 0.17, 0.36], ['wFR', -0.17, 0.36], ['wBL', 0.17, -0.38], ['wBR', -0.17, -0.38]]) {
      const lg = n[k] = node(k, n.wolf, x, -0.1, z);
      add(lg, part(limb(0.085, 0.5), k[2] === 'R' ? furD : fur), 0, -0.28, 0);
      add(lg, part(G.sbox(.10, .13, .12, .55), furD), 0, -.31, .035);
      add(lg, part(G.ball(0.09, 1.1, 0.7, 1.4), '#2a2630'), 0, -0.55, 0.04);
    }
    n.tail = node('tail', n.wolf, 0, 0.12, -0.6);
    add(n.tail, part(G.tube([[0, 0, 0], [0, 0.12, -0.2], [0, 0.32, -0.32], [0, 0.48, -0.3]], 0.06, 12), fur), 0, 0, 0);
    n.wHead = node('wHead', n.wolf, 0, 0.2, 0.62);
    add(n.wHead, part(G.ball(0.25, 1, 0.92, 1.05), fur), 0, 0, 0);
    add(n.wHead, part(G.sbox(0.2, 0.15, 0.3, 0.45), fur), 0, -0.04, 0.27);
    add(n.wHead, part(G.ball(0.045), '#1a1418'), 0, 0.01, 0.43);
    for (const s of [-1, 1]) {
      add(n.wHead, part(G.cone(0.08, 0.22).scale(1, 1, 0.5), furD), s * 0.13, 0.25, -0.04, -0.2, 0, -s * 0.25);
      add(n.wHead, new T.Mesh(G.ball(0.035, 1.2, 0.8, 0.5), mat(o.eye || '#ffd23a', { glow: 1.6 })), s * 0.11, 0.07, 0.21, 0, s * 0.5, 0);
    }
    n.jaw = node('jaw', n.wHead, 0, -0.1, 0.1);
    add(n.jaw, part(G.sbox(0.17, 0.07, 0.3, 0.45), furD), 0, 0, 0.17);
    for (const s of [-1, 1]) add(n.jaw, new T.Mesh(G.cone(0.016, 0.06), mat('#ffffff')), s * 0.06, 0.05, 0.28);
    if (o.noRider) { for (let i = 0; i < 5; i++) add(n.wolf, part(G.cone(0.06, 0.18), furD, { ink: 0.012 }), 0, 0.28, -0.05 - i * 0.12, -0.6); if (o.frost) for (let i = 0; i < 4; i++) add(n.wolf, part(G.oct(0.05, 1.8), '#bff0ff', { glow: 0.4, ink: 0.01 }), (i % 2 ? 0.1 : -0.1), 0.3, 0.2 - i * 0.15, -0.3); return { rig: { root, n, o: { hipY: 0.72, bodyH: 1.22 } }, anim: { kind: 'wolf', skill: null } }; }
    // orc trên lưng sói
    n.rider = node('rider', n.wolf, 0, 0.28, -0.08);
    for (const s of [-1, 1]) add(n.rider, part(G.cap(0.08, 0.26), '#4a2e20'), s * 0.26, -0.08, 0.04, 0.5, 0, s * 0.3);
    add(n.rider, part(G.sbox(0.4, 0.4, 0.3, 0.4), '#6a3e26'), 0, 0.2, 0);
    add(n.rider, part(G.sbox(0.06, 0.46, 0.34, 0.5), '#3a2216', { ink: 0.012 }), 0, 0.2, 0, 0, 0, 0.7);
    add(n.rider, part(G.ball(0.13, 1.1, 0.8, 1), '#8a8e98', { metal: 1 }), 0.22, 0.38, 0);
    n.rHead = node('rHead', n.rider, 0, 0.62, 0.02);
    const R = 0.3;
    add(n.rHead, part(G.ball(R, 1.04, 0.96, 1), skin), 0, 0, 0);
    face(n.rHead, R, { iris: '#ffcc22', eye: 'fierce', brow: INK, mouth: 'grin' });
    for (const s of [-1, 1]) {
      onHead(n.rHead, R, part(G.cone(R * 0.075, R * 0.3), '#fff8e0', { ink: 0.01 }), s * 0.28, -0.4, 1.0);
      add(n.rHead, part(G.cone(R * 0.16, R * 0.5).scale(1, 1, 0.5), skin), s * R * 1.02, R * 0.05, -R * 0.05, 0, 0, -s * (Math.PI / 2 - 0.35));
    }
    add(n.rHead, part(G.ball(R * 1.08, 1.03, 0.78, 1.04), '#8a8e98', { metal: 1 }), 0, R * 0.3, -R * 0.04);
    add(n.rHead, part(G.cone(R * 0.15, R * 0.55), '#c8302a'), 0, R * 1.05, -R * 0.1);
    n.rArm = node('rArm', n.rider, -0.26, 0.34, 0); n.rArm.rotation.set(-0.9, 0, -0.2);
    add(n.rArm, part(G.cap(0.08, 0.26), skin), 0, -0.15, 0); add(n.rArm, part(G.ball(0.1), skin), 0, -0.3, 0);
    add(n.rArm, WEAP.spear(), 0, -0.3, 0, 1.25);
    n.lArm = node('lArm', n.rider, 0.26, 0.34, 0); n.lArm.rotation.set(-1.2, 0, 0.25);
    add(n.lArm, part(G.cap(0.08, 0.22), skin), 0, -0.13, 0); add(n.lArm, part(G.ball(0.1), skin), 0, -0.27, 0);
    return { rig: { root, n, o: { hipY: 0.72 } }, anim: { kind: 'wolf', skill: 'charge' } };
  }

  /* =================== QUÁI THEO VÙNG =================== */
  function orcFace(n, R, skin, o) {
    o = o || {}; const k = o.tusk || 1;
    face(n.head, R, { iris: o.iris || '#ff5a2a', eye: o.eye || 'fierce', brow: INK, mouth: 'grin' });
    for (const s of [-1, 1]) {
      onHead(n.head, R, part(G.cone(R * 0.075 * k, R * 0.3 * k), '#fff8e0', { ink: 0.012 }), s * 0.28, -0.4, 1.0);
      add(n.head, part(G.cone(R * 0.16, R * 0.5).scale(1, 1, 0.5), skin), s * R * 1.02, R * 0.08, -R * 0.05, 0, 0, -s * (Math.PI / 2 - 0.35));
    }
  }
  function hornHelm(n, R, col, horn) {
    add(n.head, part(G.ball(R * 1.08, 1.03, 0.8, 1.04), col, { metal: 1 }), 0, R * 0.3, -R * 0.04);
    add(n.head, part(G.torus(R * 1.04, R * 0.07).rotateX(Math.PI / 2), sh(col, -0.15), { metal: 1 }), 0, R * 0.4, -R * 0.03, -0.05);
    for (const s of [-1, 1]) add(n.head, part(G.tube([[s * R * 0.8, R * 0.55, 0], [s * R * 1.5, R * 0.8, 0], [s * R * 1.55, R * 1.45, -R * 0.1], [s * R * 1.3, R * 1.85, -R * 0.2]], R * 0.12, 14), horn), 0, 0, 0);
  }
  function skullShield(col, rim) {
    const s = WEAP.shield(col, 1, rim);
    add(s, part(G.ball(0.085, 1, 0.95, 0.5), '#e8e2d0', { ink: 0.01 }), 0, 0.03, 0.05);
    for (const x of [-0.03, 0.03]) add(s, new T.Mesh(G.ball(0.022, 1, 1, 0.4), mat(INK)), x, 0.04, 0.088);
    return s;
  }
  function quiver(n, d, tip) {
    const q = node('quiver', n.torso, -0.08, d.torsoH * 0.65, -d.torsoD / 2 - 0.02); q.rotation.set(0.15, 0, -0.45);
    add(q, part(G.cyl(0.06, 0.055, 0.34), '#7a4a26'), 0, 0, 0);
    for (const x of [-0.025, 0.0, 0.025]) add(q, part(G.cone(0.025, 0.1), tip || '#f4f0e0', { ink: 0.01 }), x, 0.22, 0);
  }
  function wingGeo(pts, sgn, depth) { const p = []; for (let i = 0; i < pts.length; i += 2) p.push(pts[i] * sgn, pts[i + 1]); return G.ext(p, depth || 0.025, 0.006); }

  /** Cung Thủ Hắc Ám: orc trùm mũ trùm tím đen, cung gỗ sẫm */
  function ORCARCHER() {
    const skin = '#6a8a4a', hood = '#3a2a3a';
    const rig = humanoid({ R: 0.46, torsoH: 0.46, torsoW: 0.52, torsoD: 0.38, legL: 0.28, legR: 0.1, bootH: 0.12, armL: 0.38, armR: 0.1, skin, legs: '#3a3036', boots: '#2a1e14', sleeve: skin, glove: '#2a1a1a' });
    const { n } = rig, d = rig.o, R = d.R;
    add(n.torso, part(G.sbox(d.torsoW, d.torsoH, d.torsoD, 0.4), '#4a3a3a'), 0, d.torsoH / 2, 0);
    add(n.torso, part(G.sbox(d.torsoW * 1.06, 0.09, d.torsoD * 1.06, 0.4), '#2a1a1a'), 0, 0.05, 0);
    add(n.torso, part(G.ext([-0.12, 0, 0.12, 0, 0.09, -0.2, -0.09, -0.2], 0.04, 0.01), hood), 0, 0.02, d.torsoD / 2 - 0.02);
    add(n.torso, part(G.cyl(0.2, 0.36, 0.16, 16).scale(1, 1, 0.8), hood), 0, d.torsoH - 0.02, 0);
    quiver(n, d, '#ff8a5a');
    orcFace(n, R, skin);
    add(n.head, part(G.ball(R * 1.12, 1.05, 1.0, 1.0), hood), 0, R * 0.15, -R * 0.32);
    add(n.head, part(G.cone(R * 0.35, R * 0.7), hood), 0, R * 0.6, -R * 1.1, -1.9);
    add(n.handL, WEAP.bow(1, n, { wood: '#4a2a1a' }), 0, 0, 0.02);
    return { rig, anim: { kind: 'bow', skill: null } };
  }
  /** Hắc Orc: giáp đen cực dày, mũ sừng, mắt đỏ rực, rìu hai lưỡi + khiên đầu lâu */
  function BLACKORC() {
    const skin = '#4a6040', armor = '#3a3a48', plate = '#454556';
    const rig = humanoid({ R: 0.46, torsoH: 0.56, torsoW: 0.72, torsoD: 0.5, legL: 0.3, legR: 0.13, bootH: 0.14, armL: 0.44, armR: 0.13, skin, legs: '#26222a', boots: armor, sleeve: armor, glove: '#1a1418' });
    const { n } = rig, d = rig.o, R = d.R;
    add(n.torso, part(G.sbox(d.torsoW, d.torsoH, d.torsoD, 0.3), plate, { metal: 1 }), 0, d.torsoH / 2, 0);
    add(n.torso, part(G.ext([-0.15, 0, 0.15, 0, 0.12, -0.3, 0, -0.36, -0.12, -0.3], 0.04, 0.01), '#8a1a1a'), 0, 0.06, d.torsoD / 2 - 0.01);
    add(n.torso, part(G.sbox(d.torsoW * 1.06, 0.1, d.torsoD * 1.06, 0.4), '#1a1418'), 0, 0.05, 0);
    for (const k of ['R', 'L']) { add(n['arm' + k], part(G.ball(0.21, 1.15, 0.85, 1.05), armor, { metal: 1 }), 0, 0.03, 0); for (const z of [-0.08, 0.08]) add(n['arm' + k], part(G.cone(0.045, 0.16), '#a8a8b0', { metal: 1, ink: 0.012 }), 0, 0.23, z); }
    orcFace(n, R, skin, { eye: 'glow', iris: '#ff2a1a', tusk: 1.3 });
    hornHelm(n, R, armor, '#d8d0c0');
    onHead(n.head, R, part(G.sbox(R * 0.16, R * 0.5, R * 0.12, 0.5), sh(armor, -0.1), { metal: 1, ink: 0.014 }), 0, 0.3, 1.07);
    add(n.handR, WEAP.axe('#8a909c', true), 0, 0, 0, 1.1);
    n.shield = skullShield(armor, '#a02020'); add(n.handL, n.shield, 0.08, 0.14, 0.05, 0, 0.45, 0);
    return { rig, anim: { kind: 'melee', shield: true, heavy: true, skill: null } };
  }
  /** Troll / Vua Troll / Chúa Tể Hỗn Mang: khổng lồ khom lưng, đầu nhỏ, mũi to, nanh lớn */
  function TROLL(o) {
    const skin = o.skin;
    const rig = humanoid({ R: 0.42, torsoH: 0.74, torsoW: 0.86, torsoD: 0.62, legL: 0.38, legR: 0.17, bootH: 0.14, armL: 0.64, armR: 0.17, hunch: 0.25, headZ: 0.14, neck: 0.62,
      skin, legs: sh(skin, -0.12), boots: o.boots || sh(skin, -0.3), sleeve: skin, glove: skin });
    const { n } = rig, d = rig.o, R = d.R;
    add(n.torso, part(G.ball(0.5, 0.92, 0.82, 0.68), skin), 0, 0.38, 0);
    add(n.torso, part(G.ball(0.34, 1, 0.9, 0.5), sh(skin, 0.15), { ink: 0.012 }), 0, 0.3, 0.2);
    add(n.torso, part(G.lathe([[0, 0.12], [0.42, 0.12], [0.47, -0.05], [0.44, -0.2], [0, -0.2]], 16, 0.8), o.cloth), 0, 0, 0);
    add(n.torso, part(G.torus(0.43, 0.035).rotateX(Math.PI / 2).scale(1, 1, 0.8), '#5a3a22'), 0, 0.1, 0);
    if (o.chest) add(n.torso, part(G.ball(0.38, 1, 0.75, 0.42), o.chest, { metal: 1 }), 0, 0.5, 0.2);
    if (o.pauldron) for (const k of ['R', 'L']) { add(n['arm' + k], part(G.ball(0.26, 1.15, 0.8, 1.05), o.pauldron, { metal: 1 }), 0, 0.04, 0); for (const z of [-0.1, 0.1]) add(n['arm' + k], part(G.cone(0.05, 0.2), sh(o.pauldron, -0.2), { metal: 1, ink: 0.012 }), 0, 0.3, z); }
    if (o.cape) { n.cape = node('cape', n.torso, 0, d.torsoH - 0.05, -d.torsoD / 2 + 0.06); add(n.cape, part(G.cape(d.torsoW * 1.0, 0.9, 0.8), o.cape, { ds: true }), 0, 0, 0); }
    if (o.emblem) { add(n.torso, part(G.oct(0.07, 1.3).scale(1, 1, 0.5), o.emblem, { glow: 1.4, ink: 0.012 }), 0, 0.5, 0.33); glow(n.torso, 0, 0.5, 0.36, 0.5, o.emblem, 0.6); }
    if (o.cracks) for (const [x, y, r] of [[-0.2, 0.45, 0.6], [0.18, 0.3, -0.5], [0.05, 0.6, 0.2]]) add(n.torso, new T.Mesh(G.sbox(0.03, 0.2, 0.02), mat(o.cracks, { glow: 1.4 })), x, y, 0.36, 0, 0, r);
    face(n.head, R, { iris: o.iris, eye: o.glowEye ? 'glow' : 'fierce', brow: INK, mouth: 'grin', es: 0.85, ev: 0.05 });
    onHead(n.head, R, part(G.ball(R * 0.28, 1, 0.85, 1), sh(skin, -0.08), { ink: 0.014 }), 0, -0.18, 1.0);
    for (const s of [-1, 1]) {
      onHead(n.head, R, part(G.cone(R * 0.11, R * 0.5), '#fff8e0', { ink: 0.012 }), s * 0.32, -0.48, 1.0, -s * 0.2);
      add(n.head, part(G.cone(R * 0.17, R * 0.55).scale(1, 1, 0.5), skin), s * R * 1.0, R * 0.1, -R * 0.05, 0, 0, -s * (Math.PI / 2 - 0.3));
    }
    if (o.hair) for (const [x, rz] of [[-0.3, 0.4], [0, 0], [0.3, -0.4]]) add(n.head, part(G.cone(R * 0.16, R * 0.5), o.hair, { tex: 'hair' }), R * x, R * 0.95, -R * 0.1, -0.2, 0, rz);
    if (o.crown) {
      add(n.head, part(G.cyl(R * 0.62, R * 0.7, R * 0.22, 16), GOLD, { metal: 1 }), 0, R * 0.85, -R * 0.05);
      for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; add(n.head, part(G.cone(R * 0.1, R * 0.32), GOLD, { metal: 1, ink: 0.014 }), S(a) * R * 0.62, R * 1.1, C(a) * R * 0.62 - R * 0.05); }
      add(n.head, new T.Mesh(G.ball(R * 0.1), mat('#ff3a2a', { glow: 1.4 })), 0, R * 0.86, R * 0.62);
    }
    if (o.horns) for (const s of [-1, 1]) add(n.head, part(G.tube([[s * R * 0.6, R * 0.6, 0], [s * R * 1.3, R * 0.9, 0], [s * R * 1.5, R * 1.6, -R * 0.2], [s * R * 1.25, R * 2.1, -R * 0.35]], R * 0.14, 14), o.horns), 0, 0, 0);
    let w;
    if (o.pillar) {
      w = node('weapon');
      add(w, part(G.cyl(0.04, 0.04, 0.3), '#3a2a1a'), 0, -0.02, 0);
      add(w, part(G.sbox(0.24, 0.95, 0.24, 0.25), o.pillar), 0, 0.6, 0);
      for (const y of [0.25, 0.95]) add(w, part(G.sbox(0.28, 0.07, 0.28, 0.3), o.crown ? GOLD : '#b070ff', { metal: 1 }), 0, y, 0);
    } else {
      w = node('weapon');
      add(w, part(G.lathe([[0, -0.15], [0.045, -0.15], [0.05, 0.2], [0.12, 0.6], [0.14, 0.82], [0, 0.9]], 12), '#8a5a32'), 0, 0, 0);
      for (const [a, y] of [[0, 0.62], [2.1, 0.7], [4.2, 0.56], [1, 0.8]]) add(w, part(G.cone(0.03, 0.1), '#d8d0c0', { ink: 0.012 }), S(a) * 0.13, y, C(a) * 0.13, C(a) * 1.3, 0, -S(a) * 1.3);
    }
    add(n.handR, w, 0, 0, 0, 1.1);
    return { rig, anim: { kind: 'melee', heavy: true, skill: o.crown || o.horns ? 'slam' : null } };
  }
  /** Cây Ma: thân gỗ sần, tán lá trên đầu, mắt xanh phát sáng, tay cành */
  function TREANT() {
    const bark = '#7a5a38', dark = '#4a3420', leaf = '#4f9a3a', leaf2 = '#6ab84a';
    const rig = humanoid({ R: 0.4, torsoH: 0.8, torsoW: 0.66, torsoD: 0.56, legL: 0.36, legR: 0.16, bootH: 0.12, armL: 0.62, armR: 0.14, hunch: 0.14, headZ: 0.06, neck: 0.55,
      skin: bark, legs: '#6a4a2c', boots: dark, sleeve: bark, glove: dark });
    const { n } = rig, R = rig.o.R;
    add(n.torso, part(G.lathe([[0, 0.84], [0.26, 0.84], [0.3, 0.6], [0.34, 0.3], [0.4, 0.05], [0.46, -0.06], [0, -0.06]], 14, 0.85), bark), 0, 0, 0);
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + 0.3; add(n.torso, new T.Mesh(G.sbox(0.03, 0.55, 0.03), mat(dark)), S(a) * 0.33, 0.38, C(a) * 0.29, 0, a, 0.08); }
    add(n.torso, part(G.torus(0.39, 0.05).rotateX(Math.PI / 2).scale(1, 1, 0.85), leaf), 0, 0.1, 0);
    for (const k of ['R', 'L']) {
      add(n['arm' + k], part(G.ball(0.17, 1.2, 0.9, 1.1), leaf), 0, 0.06, 0);
      for (let i = 0; i < 3; i++) add(n['hand' + k], part(G.cone(0.03, 0.16), dark, { ink: 0.012 }), (i - 1) * 0.05, -0.08, 0.04, 0.3, 0, (i - 1) * 0.4 + Math.PI);
    }
    face(n.head, R, { iris: '#9aff6a', eye: 'glow', mouth: 'grin', ev: 0.05 });
    for (const s of [-1, 1]) onHead(n.head, R, part(G.sbox(R * 0.4, R * 0.12, R * 0.15, 0.5), dark, { ink: 0.012 }), s * 0.33, 0.25, 1.0, s * 0.3);
    for (const [x, y, z, r, c] of [[0, 1.05, -0.1, 0.62, leaf], [-0.55, 0.85, 0.05, 0.42, leaf2], [0.55, 0.85, 0.05, 0.42, leaf2], [0, 0.95, -0.6, 0.45, leaf2], [-0.3, 1.4, -0.2, 0.36, leaf2], [0.35, 1.35, -0.3, 0.34, leaf]])
      add(n.head, part(G.ball(R * r), c), R * x, R * y, R * z);
    for (const s of [-1, 1]) add(n.head, part(G.cone(R * 0.1, R * 0.8), bark), s * R * 0.95, R * 0.9, 0, 0, 0, -s * 0.7);
    const w = node('weapon');
    add(w, part(G.cyl(0.07, 0.1, 0.85), '#6a4a2c'), 0, 0.3, 0);
    add(w, part(G.ball(0.1), leaf2), 0.06, 0.62, 0.04);
    add(n.handR, w, 0, 0, 0, 1.1);
    return { rig, anim: { kind: 'melee', heavy: true, skill: null } };
  }
  /** Hiệp Sĩ Xương: bộ xương mắt xanh ma quái, mũ sắt, chuỳ xương + khiên đầu lâu */
  function SKELETON() {
    const bone = '#e8e2d0';
    const rig = humanoid({ R: 0.42, torsoH: 0.44, torsoW: 0.38, torsoD: 0.26, legL: 0.32, legR: 0.05, bootH: 0.1, armL: 0.38, armR: 0.05, skin: bone, legs: bone, boots: '#8a8478', sleeve: bone, glove: bone });
    const { n } = rig, R = rig.o.R;
    add(n.torso, part(G.cyl(0.035, 0.035, 0.44), bone, { ink: 0.012 }), 0, 0.22, -0.06);
    for (let i = 0; i < 4; i++) add(n.torso, part(G.torus(0.15 - i * 0.015, 0.022).rotateX(Math.PI / 2).scale(1, 1, 0.75), bone, { ink: 0.012 }), 0, 0.38 - i * 0.075, 0);
    add(n.torso, part(G.sbox(0.3, 0.1, 0.18, 0.4), bone), 0, 0.03, 0);
    add(n.torso, part(G.ext([-0.1, 0, 0.1, 0, 0.08, -0.24, -0.08, -0.24], 0.03, 0.008), '#3a2a4a'), 0, 0.02, 0.1);
    add(n.armL, part(G.ball(0.13, 1.15, 0.85, 1.05), '#5a5a6a', { metal: 1 }), 0, 0.02, 0);
    for (const s of [-1, 1]) {
      onHead(n.head, R, new T.Mesh(G.ball(R * 0.17, 0.9, 1.05, 0.4), mat('#1a1418')), s * 0.34, 0.0, 0.95);
      onHead(n.head, R, new T.Mesh(G.ball(R * 0.06), mat('#6af0d0', { glow: 2 })), s * 0.34, 0.0, 1.0);
    }
    glow(n.head, 0, 0, R * 1.0, R * 1.6, '#6af0d0', 0.5);
    onHead(n.head, R, new T.Mesh(flipY(G.cone(R * 0.07, R * 0.14)), mat('#1a1418')), 0, -0.2, 0.99);
    onHead(n.head, R, part(G.sbox(R * 0.5, R * 0.14, R * 0.08, 0.5), '#f4eed8', { ink: 0.01 }), 0, -0.45, 0.95);
    for (let i = -1; i <= 1; i++) onHead(n.head, R, new T.Mesh(G.sbox(R * 0.02, R * 0.14, R * 0.02), mat('#5a5048')), i * 0.1, -0.45, 1.0);
    add(n.head, part(G.ball(R * 1.08, 1.03, 0.7, 1.04), '#6a6a78', { metal: 1 }), 0, R * 0.5, -R * 0.04);
    add(n.head, part(G.torus(R * 0.98, R * 0.06).rotateX(Math.PI / 2), '#4a4a58', { metal: 1 }), 0, R * 0.5, -R * 0.03);
    const w = node('weapon');
    add(w, part(G.cyl(0.03, 0.03, 0.55), bone), 0, 0.18, 0);
    for (const x of [-0.04, 0.04]) add(w, part(G.ball(0.055), bone), x, 0.48, 0);
    add(n.handR, w, 0, 0, 0, 1.1);
    n.shield = skullShield('#4a4a58', '#8a8478'); add(n.handL, n.shield, 0.07, 0.14, 0.05, 0, 0.45, 0);
    return { rig, anim: { kind: 'melee', shield: true, skill: null } };
  }
  /** Cướp Sa Mạc: tóc gai đen, khăn trắng, áo gile nâu, đai đỏ, đao cong */
  function BANDIT() {
    const skin = '#e0b48a';
    const rig = humanoid({ R: 0.45, torsoH: 0.46, torsoW: 0.44, torsoD: 0.32, legL: 0.32, legR: 0.085, bootH: 0.12, armL: 0.36, armR: 0.08, skin, legs: '#c8b080', boots: '#6a4a2a', sleeve: '#e8d8b0', glove: skin });
    const { n } = rig, d = rig.o, R = d.R;
    add(n.torso, part(G.sbox(d.torsoW, d.torsoH, d.torsoD, 0.4), '#e8d8b0'), 0, d.torsoH / 2, 0);
    for (const s of [-1, 1]) add(n.torso, part(G.sbox(0.16, d.torsoH * 0.95, d.torsoD * 1.06, 0.4), '#8a5a34'), s * 0.15, d.torsoH / 2 + 0.01, 0);
    add(n.torso, part(G.torus(0.21, 0.04).rotateX(Math.PI / 2).scale(1.05, 1, 0.78), '#a83a2a'), 0, 0.07, 0);
    add(n.torso, part(G.ext([0, 0, 0.06, 0, 0.09, -0.22, 0.02, -0.2], 0.025, 0.006), '#a83a2a'), 0.14, 0.06, 0.12);
    face(n.head, R, { iris: '#3a2a1a', eye: 'fierce', brow: INK, mouth: 'grin' });
    onHead(n.head, R, new T.Mesh(G.sbox(R * 0.04, R * 0.32, R * 0.03), mat('#c8705a')), 0.55, -0.1, 1.0, 0.5);
    add(n.head, part(G.ball(R * 1.07, 1.03, 0.9, 1.04), '#2a1a10'), 0, R * 0.2, -R * 0.13);
    for (const [x, z, rx, rz] of [[-0.5, -0.1, -0.2, 0.6], [0, 0, -0.3, 0], [0.5, -0.1, -0.2, -0.6], [0, -0.6, -0.9, 0]]) add(n.head, part(G.cone(R * 0.22, R * 0.42), '#2a1a10'), R * x, R * 0.95, R * z, rx, 0, rz);
    add(n.head, part(G.torus(R * 1.04, R * 0.1).rotateX(Math.PI / 2), '#e8e0c8'), 0, R * 0.4, -R * 0.04, -0.15);
    for (const s of [-1, 1]) add(n.head, part(G.cone(R * 0.12, R * 0.45), '#e8e0c8'), s * R * 0.12, R * 0.25, -R * 1.05, -2.0, 0, s * 0.4);
    const w = node('weapon'), sh2 = new T.Shape();
    sh2.moveTo(-0.035, 0); sh2.lineTo(0.035, 0); sh2.quadraticCurveTo(0.1, 0.36, -0.02, 0.64); sh2.quadraticCurveTo(0.02, 0.32, -0.035, 0);
    add(w, part(G.cyl(0.028, 0.028, 0.15), '#4a2a1a'), 0, -0.07, 0);
    add(w, part(G.sbox(0.06, 0.05, 0.2, 0.5), GOLD, { metal: 1 }), 0, 0.02, 0);
    add(w, part(G.ext(sh2, 0.028, 0.006).rotateY(Math.PI / 2), '#e0e4ec', { metal: 1 }), 0, 0.04, 0);
    add(n.handR, w, 0, 0, 0, 1.15);
    return { rig, anim: { kind: 'melee', skill: null } };
  }
  /** Xác Ướp: quấn băng cổ, một mắt xanh phát sáng, tay chìa ra trước */
  function MUMMY() {
    const wrap = '#ece0c0', band = '#cdbf98';
    const rig = humanoid({ R: 0.44, torsoH: 0.5, torsoW: 0.46, torsoD: 0.34, legL: 0.36, legR: 0.09, bootH: 0.1, armL: 0.42, armR: 0.09, hunch: 0.18, skin: wrap, legs: wrap, boots: '#c8b890', sleeve: wrap, glove: wrap });
    const { n } = rig, d = rig.o, R = d.R;
    add(n.torso, part(G.sbox(d.torsoW, d.torsoH, d.torsoD, 0.45), wrap), 0, d.torsoH / 2, 0);
    for (const [y, r] of [[0.1, 0.1], [0.22, -0.15], [0.34, 0.12], [0.44, -0.08]]) add(n.torso, new T.Mesh(G.torus(0.25, 0.018).rotateX(Math.PI / 2).scale(1, 1, 0.75), mat(band)), 0, y, 0, 0, 0, r);
    add(n.torso, part(G.torus(0.24, 0.03).rotateX(Math.PI / 2).scale(1.02, 1, 0.76), '#8a6a3a'), 0, 0.04, 0);
    for (const k of ['R', 'L']) {
      for (const y of [-0.1, -0.24]) add(n['arm' + k], new T.Mesh(G.torus(0.1, 0.014).rotateX(Math.PI / 2), mat(band)), 0, y, 0, 0.2, 0, 0.15);
      add(n['arm' + k], part(G.sbox(0.05, 0.22, 0.015), wrap, { ink: 0.01 }), 0.05, -0.32, -0.04, 0.3);
      add(n['leg' + k], new T.Mesh(G.torus(0.1, 0.014).rotateX(Math.PI / 2), mat(band)), 0, -0.15, 0, 0.15);
    }
    n.armR.rotation.x = -1.2; n.armL.rotation.x = -1.1;
    n.cape = node('cape', n.torso, 0, d.torsoH - 0.03, -d.torsoD / 2 + 0.02); add(n.cape, part(G.cape(d.torsoW * 0.8, 0.4, 0.5), band, { ds: true }), 0, 0, 0);
    for (const [v, r] of [[0.45, 0.2], [0.15, -0.15], [-0.25, 0.1], [-0.55, -0.1]]) add(n.head, new T.Mesh(G.torus(R * Math.cos(v) * 1.01, R * 0.05).rotateX(Math.PI / 2), mat(band)), 0, R * Math.sin(v), 0, 0, 0, r);
    onHead(n.head, R, new T.Mesh(G.sbox(R * 0.5, R * 0.18, R * 0.1, 0.5), mat('#2a1e14')), 0.22, 0.0, 0.96, -0.15);
    onHead(n.head, R, new T.Mesh(G.ball(R * 0.08), mat('#5aff9a', { glow: 2 })), 0.32, 0.0, 1.0);
    glow(n.head, R * 0.3, 0, R * 1.0, R * 1.2, '#5aff9a', 0.6);
    return { rig, anim: { kind: 'fist', zombie: true, skill: null } };
  }
  /** Pharaoh Xác Ướp: mũ nemes sọc vàng-lam, rắn hổ mang vàng, vòng cổ vàng, mắt xanh rực */
  function PHARAOH() {
    const made = MUMMY(), { n, o } = made.rig, R = o.R, blue = '#2a4ab8';
    const nemes = node('nemes', n.head, 0, R * 0.2, -R * 0.05);
    add(nemes, part(G.ball(R * 1.12, 1.02, 0.85, 1.05), GOLD, { metal: 1 }), 0, 0, -R * 0.04);
    for (let i = 0; i < 4; i++) add(nemes, new T.Mesh(G.torus(R * (1.08 - i * 0.12), R * 0.05).rotateX(Math.PI / 2), mat(blue)), 0, R * (0.12 + i * 0.2), -R * 0.04);
    for (const s of [-1, 1]) { add(nemes, part(G.sbox(R * 0.42, R * 1.5, R * 0.18, 0.4), GOLD, { metal: 1 }), s * R * 0.9, -R * 0.75, R * 0.05, 0, 0, s * 0.08); for (let i = 0; i < 3; i++) add(nemes, new T.Mesh(G.sbox(R * 0.44, R * 0.1, R * 0.2), mat(blue)), s * R * 0.9, -R * (0.3 + i * 0.4), R * 0.06, 0, 0, s * 0.08); }
    add(nemes, part(G.tube([[0, R * 0.55, R * 0.95], [0, R * 0.85, R * 1.05], [0, R * 1.05, R * 0.95]], R * 0.09, 8), GOLD, { metal: 1 }), 0, 0, 0);
    add(nemes, new T.Mesh(G.ball(R * 0.07), mat('#ff3a2a', { glow: 1.5 })), 0, R * 1.05, R * 1.02);
    add(n.torso, part(G.cyl(o.torsoW * 0.62, o.torsoW * 0.7, 0.1, 18), GOLD, { metal: 1 }), 0, o.torsoH * 0.92, 0);
    add(n.torso, new T.Mesh(G.cyl(o.torsoW * 0.6, o.torsoW * 0.66, 0.04, 18), mat(blue)), 0, o.torsoH * 0.9, 0.01);
    const st = node('weapon', n.handR, 0, 0, 0); add(st, part(G.cyl(0.03, 0.03, 1.1), GOLD, { metal: 1 }), 0, 0.25, 0); add(st, part(G.torus(0.08, 0.025), GOLD, { metal: 1 }), 0, 0.85, 0); add(st, new T.Mesh(G.oct(0.07, 1.4), mat('#5aff9a', { glow: 1.6 })), 0, 0.85, 0);
    glow(n.torso, 0, 0.3, 0.3, 1.0, '#ffd060', 0.25);
    return made;
  }
  /** Vua Cây Ma: vương miện gai phát sáng, lá rực, vai mọc nấm */
  function TREANTKING() {
    const made = TREANT(), { n, o } = made.rig, R = o.R;
    for (let i = 0; i < 7; i++) { const a = i / 7 * TAU; add(n.head, part(G.cone(R * 0.12, R * (i % 2 ? 0.5 : 0.8)), '#c8ff6a', { glow: 0.8, ink: 0.014 }), S(a) * R * 0.75, R * 1.55, C(a) * R * 0.75 - R * 0.2, C(a) * 0.3, 0, -S(a) * 0.3); }
    add(n.head, part(G.torus(R * 0.78, R * 0.1).rotateX(Math.PI / 2), '#5a3a1a'), 0, R * 1.42, -R * 0.2);
    for (const k of ['R', 'L']) for (let i = 0; i < 3; i++) add(n['arm' + k], part(G.ball(0.05 + i * 0.015, 1.4, 0.6, 1.4), '#e84a3a', { ink: 0.01 }), (i - 1) * 0.08, 0.16 + i * 0.03, 0.05);
    glow(n.head, 0, R * 1.5, 0, R * 3.2, '#b8ff6a', 0.45);
    return made;
  }
  /** Chúa Tể Dung Nham: quái magma với vương miện lửa, sừng lớn, nứt dung nham rực */
  function MAGMALORD() {
    const made = GOLEM({ body: '#3a2a2a', light: '#5a4040', dark: '#1e1616', cracks: '#ffb02a', horn: '#1a1212', iris: '#fff07a' }), { n, o } = made.rig, R = o.R;
    for (let i = 0; i < 5; i++) { const a = (i - 2) * 0.45; add(n.head, part(G.cone(R * 0.16, R * (i === 2 ? 1.2 : 0.8)), '#ff7a1a', { glow: 1.2, ink: 0.014 }), S(a) * R * 0.7, R * 1.2, C(a) * R * 0.3, -0.2, 0, -a * 0.6); }
    for (const k of ['R', 'L']) for (let i = 0; i < 3; i++) add(n['arm' + k], part(G.cone(0.06, 0.2), '#2a1a1a', { ink: 0.012 }), (i - 1) * 0.1, 0.22, -0.05, -0.3, 0, (i - 1) * 0.4);
    glow(n.torso, 0, 0.5, 0.2, 1.5, '#ff7a1a', 0.55);
    return made;
  }
  /** Người Băng / Quái Magma: khối đá to, nắm đấm lớn, mắt phát sáng */
  function GOLEM(o) {
    const rig = humanoid({ R: 0.34, torsoH: 0.66, torsoW: 0.86, torsoD: 0.62, legL: 0.32, legR: 0.18, bootH: 0.16, armL: 0.58, armR: 0.2, hunch: 0.2, headZ: 0.2, neck: 0.4,
      skin: o.body, legs: o.dark, boots: o.dark, sleeve: o.body, glove: o.light });
    const { n } = rig, R = rig.o.R;
    add(n.torso, part(G.sbox(0.86, 0.66, 0.62, 0.25), o.body), 0, 0.33, 0);
    add(n.torso, part(G.sbox(0.56, 0.38, 0.12, 0.3), o.light), 0, 0.42, 0.3);
    for (const k of ['R', 'L']) {
      add(n['arm' + k], part(G.sbox(0.36, 0.3, 0.36, 0.3), o.light), 0, 0.04, 0, 0.2, 0.4, 0);
      add(n['arm' + k], part(G.sbox(0.3, 0.28, 0.3, 0.3), o.light), 0, -0.6, 0.02);
    }
    if (o.crystal) {
      for (const [x, y, z, rx, rz, s] of [[-0.3, 0.7, -0.15, -0.3, 0.4, 1], [0.32, 0.72, -0.1, -0.2, -0.5, 1.1], [0, 0.66, -0.3, -0.8, 0, 1.2], [-0.1, 0.5, -0.33, -1.2, 0.2, 0.8]])
        add(n.torso, part(G.oct(0.08 * s, 2.4), o.crystal, { glow: 0.35, ink: 0.014 }), x, y, z, rx, 0, rz);
      for (const s of [-1, 1]) add(n.head, part(G.oct(0.06, 2.4), o.crystal, { glow: 0.35, ink: 0.012 }), s * R * 0.6, R * 0.9, -R * 0.1, 0, 0, -s * 0.5);
    }
    if (o.cracks) {
      for (const [x, y, r] of [[-0.25, 0.35, 0.5], [0.2, 0.25, -0.4], [0.05, 0.5, 0.15], [0.28, 0.5, 0.9]]) add(n.torso, new T.Mesh(G.sbox(0.035, 0.24, 0.02), mat(o.cracks, { glow: 1.6 })), x, y, 0.37, 0, 0, r);
      for (const k of ['R', 'L']) add(n['arm' + k], new T.Mesh(G.sbox(0.03, 0.2, 0.02), mat(o.cracks, { glow: 1.6 })), 0, -0.6, 0.17, 0, 0, 0.4);
      glow(n.torso, 0, 0.4, 0.4, 0.8, o.cracks, 0.5);
      for (const s of [-1, 1]) add(n.head, part(G.tube([[s * R * 0.6, R * 0.5, 0], [s * R * 1.2, R * 0.8, 0], [s * R * 1.3, R * 1.4, -R * 0.2]], R * 0.14, 10), o.horn), 0, 0, 0);
    }
    face(n.head, R, { iris: o.iris, eye: 'glow', mouth: 'none', ev: 0.05 });
    onHead(n.head, R, part(G.sbox(R * 1.3, R * 0.25, R * 0.3, 0.4), o.light, { ink: 0.014 }), 0, 0.35, 0.92);
    onHead(n.head, R, part(G.sbox(R * 1.0, R * 0.4, R * 0.5, 0.4), o.dark, { ink: 0.014 }), 0, -0.55, 0.8);
    return { rig, anim: { kind: 'two', heavy: true, skill: null } };
  }
  /** Quỷ Lửa: quỷ đỏ tí hon bay bằng cánh dơi, tóc lửa, đuôi nhọn, dao lửa */
  function IMP() {
    const skin = '#d83a2a';
    const rig = humanoid({ R: 0.42, torsoH: 0.28, torsoW: 0.3, torsoD: 0.24, legL: 0.16, legR: 0.06, bootH: 0.07, armL: 0.26, armR: 0.06, skin, legs: skin, boots: '#4a1a14', sleeve: skin });
    const { n } = rig, d = rig.o, R = d.R;
    n.hips.position.y += 0.6; d.hipY += 0.6; d.float = 0.6;
    add(n.torso, part(G.lathe([[0, 0.3], [0.13, 0.3], [0.16, 0.16], [0.18, 0.0], [0, 0.0]], 12, 0.85), '#7a1a1a'), 0, 0, 0);
    n.tail = node('tail', n.hips, 0, 0.02, -0.1);
    add(n.tail, part(G.tube([[0, 0, 0], [0, -0.12, -0.15], [0, -0.1, -0.32], [0, 0.04, -0.42]], 0.025, 10), skin), 0, 0, 0);
    add(n.tail, part(G.cone(0.05, 0.1), '#7a1a1a', { ink: 0.012 }), 0, 0.08, -0.43);
    const W = [0, 0, 0.5, 0.28, 0.62, 0.06, 0.5, -0.04, 0.44, -0.2, 0.3, -0.1, 0.2, -0.24, 0.08, -0.1];
    for (const [k, s] of [['wingL', 1], ['wingR', -1]]) { n[k] = node(k, n.torso, s * 0.06, 0.24, -0.12); n[k].rotation.y = -s * 0.5; add(n[k], part(wingGeo(W, s), '#a82020', { ds: true }), 0, 0, 0); }
    face(n.head, R, { iris: '#ffd23a', eye: 'round', brow: '#7a1a1a', mouth: 'grin', es: 1.05 });
    for (const s of [-1, 1]) {
      add(n.head, part(G.cone(R * 0.18, R * 0.9).scale(1, 1, 0.42), skin), s * R * 1.2, R * 0.15, -R * 0.05, 0, 0, -s * (Math.PI / 2 - 0.3));
      add(n.head, part(G.cone(R * 0.1, R * 0.35), '#3a1010'), s * R * 0.45, R * 0.95, 0, 0, 0, -s * 0.35);
    }
    for (const [x, h, c] of [[-0.25, 0.5, '#ff7a2a'], [0, 0.7, '#ffb04a'], [0.25, 0.5, '#ff7a2a'], [0, 0.45, '#ffe06a']]) add(n.head, part(G.cone(R * 0.18, R * h), c, { glow: 0.8, ink: 0.012 }), R * x, R * 0.95, -R * 0.15, -0.2);
    glow(n.head, 0, R * 1.2, 0, R * 2, '#ff8a2a', 0.45);
    add(n.handR, WEAP.knife('#ffb04a'), 0, 0, 0, 1.2);
    rig.extra = (t, dur, name) => { const p = t * TAU * Math.max(1, Math.round(dur / 0.28)), f = name === 'die' ? t : 0, a = 0.6 * (1 - f); return { wingL: { rz: S(p) * a, ry: C(p) * 0.25 * (1 - f) }, wingR: { rz: -S(p) * a, ry: -C(p) * 0.25 * (1 - f) }, tail: { ry: S(p * 0.5) * 0.3 } }; };
    return { rig, anim: { kind: 'stab', fly: true, skill: null } };
  }
  /** Kẻ Dẫn Lối Hư Vô: pháp sư hư vô áo dài tím, mũ sừng, gậy cầu tím */
  function VOIDWALKER() {
    const skin = '#8a6ad8', robe = '#241640', plate = '#3a2a68', trim = '#5a3aa0', crack = '#c880ff';
    const rig = humanoid({ R: 0.44, torsoH: 0.5, torsoW: 0.4, torsoD: 0.32, legL: 0.3, legR: 0.08, bootH: 0.1, armL: 0.38, armR: 0.08, skin, legs: robe, boots: '#1a1230', sleeve: '#2c1e54' });
    const { n } = rig, d = rig.o, R = d.R;
    add(n.torso, part(G.lathe([[0, 0.5], [0.18, 0.5], [0.2, 0.3], [0.27, 0.05], [0.36, -0.25], [0.42, -0.38], [0, -0.38]], 20, 0.85), robe), 0, 0, 0);
    add(n.torso, part(G.torus(0.415, 0.022).rotateX(Math.PI / 2).scale(1, 1, 0.85), crack, { glow: 0.6, ink: 0.012 }), 0, -0.37, 0);
    add(n.torso, part(G.sbox(0.34, 0.3, 0.12, 0.4), plate, { metal: 1 }), 0, 0.35, 0.12);
    for (const [x, y, r] of [[-0.1, -0.05, 0.3], [0.12, -0.2, -0.4], [0.02, 0.12, 0.1]]) add(n.torso, new T.Mesh(G.sbox(0.025, 0.18, 0.02), mat(crack, { glow: 1.4 })), x, y, 0.26 + y * -0.2, -0.35, 0, r);
    for (const k of ['R', 'L']) { add(n['arm' + k], part(G.ball(0.13, 1.15, 0.85, 1.05), trim, { metal: 1 }), 0, 0.02, 0); add(n['arm' + k], part(G.cone(0.035, 0.14), trim, { ink: 0.012 }), 0, 0.15, 0); }
    n.cape = node('cape', n.torso, 0, d.torsoH - 0.04, -d.torsoD / 2 + 0.02); add(n.cape, part(G.cape(d.torsoW * 0.95, 0.72, 0.8), '#2a1a4a', { ds: true }), 0, 0, 0);
    face(n.head, R, { iris: '#ff8aff', eye: 'glow', mouth: 'none' });
    add(n.head, part(G.ball(R * 0.78, 1.15, 1.5, 0.55), '#1a1030'), 0, -R * 0.55, -R * 0.55, 0.12);
    hornHelm(n, R, plate, trim);
    const st = WEAP.staff('#d890ff', 3, n); n.staff = st; add(n.handR, st, 0, 0, 0.02, 0.12);
    return { rig, anim: { kind: 'staff', skill: null } };
  }
  /** Linh Ma: áo choàng ma bay lơ lửng, đuôi khói, mắt tím, tay xương */
  function WRAITH() {
    const root = node('root'), n = {}, cloak = '#5a4a7a', dark = '#2a1e40', eye = '#8a5aff', bone = '#e8e2d0';
    n.hips = node('hips', root, 0, 0.62, 0); n.torso = node('torso', n.hips, 0, 0, 0);
    add(n.torso, part(G.lathe([[0, 0.66], [0.2, 0.66], [0.27, 0.42], [0.31, 0.12], [0.25, -0.18], [0.12, -0.42], [0.01, -0.58], [0, -0.58]], 16, 0.85), cloak), 0, 0, 0);
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; add(n.torso, part(flipY(G.cone(0.06, 0.24)), dark, { ink: 0.012 }), S(a) * 0.24, -0.12, C(a) * 0.2); }
    add(n.torso, part(G.cyl(0.24, 0.3, 0.12, 16).scale(1, 1, 0.85), dark), 0, 0.64, 0);
    n.head = node('head', n.torso, 0, 0.9, 0.03); const R = 0.32;
    add(n.head, part(G.ball(R, 1.05, 1.0, 1.05), cloak), 0, 0, 0);
    add(n.head, part(G.cone(R * 0.4, R * 0.9), cloak), 0, R * 0.5, -R * 0.75, -1.8);
    onHead(n.head, R, new T.Mesh(G.ball(R * 0.6, 1.05, 1.05, 0.5), mat('#0a0610')), 0, -0.05, 0.75);
    for (const s of [-1, 1]) onHead(n.head, R, new T.Mesh(G.ball(R * 0.1, 1.3, 0.7, 0.5), mat(eye, { glow: 2.2 })), s * 0.3, 0.0, 1.02);
    glow(n.head, 0, 0, R, R * 2.2, eye, 0.6);
    for (const [s, k] of [[-1, 'R'], [1, 'L']]) {
      const arm = n['arm' + k] = node('arm' + k, n.torso, s * 0.27, 0.6, 0); arm.rotation.z = s * 0.2;
      add(arm, part(G.cyl(0.06, 0.12, 0.36), cloak), 0, -0.18, 0);
      add(arm, part(G.ball(0.055), bone), 0, -0.4, 0);
      for (let i = 0; i < 3; i++) add(arm, part(flipY(G.cone(0.014, 0.12)), bone, { ink: 0.008 }), (i - 1) * 0.03, -0.48, 0.02, 0, 0, (i - 1) * 0.3);
      n['hand' + k] = node('hand' + k, arm, 0, -0.4, 0);
    }
    glow(n.torso, 0, 0.1, 0, 1.6, eye, 0.3);
    return { rig: { root, n, o: { hipY: 0.62, torsoD: 0.3, bodyH: 1.45 } }, anim: { kind: 'fist', fly: true, skill: null } };
  }
  /** Bọ Cạp Cát: vỏ cứng cam cát, 6 chân, 2 càng, đuôi cong có ngòi */
  function SCORPION() {
    const root = node('root'), n = {}, shell = '#c8782a', dark = '#8a4a1a';
    n.body = node('body', root, 0, 0.3, 0);
    add(n.body, part(G.sbox(0.62, 0.26, 0.72, 0.35), shell), 0, 0, 0);
    for (let i = 0; i < 3; i++) add(n.body, new T.Mesh(G.sbox(0.6, 0.05, 0.08, 0.5), mat(dark)), 0, 0.12, 0.2 - i * 0.22);
    add(n.body, part(G.sbox(0.4, 0.2, 0.24, 0.4), shell), 0, -0.02, 0.42);
    for (const s of [-1, 1]) {
      add(n.body, new T.Mesh(G.ball(0.04), mat('#1a0e08')), s * 0.08, 0.08, 0.53);
      add(n.body, new T.Mesh(G.ball(0.02), mat('#ff5a2a', { glow: 1.5 })), s * 0.08, 0.1, 0.57);
      add(n.body, part(G.cone(0.025, 0.1).rotateX(Math.PI / 2), dark, { ink: 0.01 }), s * 0.06, -0.08, 0.58, 0, -s * 0.4, 0);
      for (let i = 0; i < 3; i++) {
        const k = 'l' + (s > 0 ? 'L' : 'R') + i, L = n[k] = node(k, n.body, s * 0.3, -0.02, 0.2 - i * 0.2); L.rotation.z = s * 1.0; L.rotation.y = s * (i - 1) * 0.35;
        add(L, part(G.cap(0.035, 0.22), shell), 0, -0.13, 0);
        const kn = node(k + 'k', L, 0, -0.26, 0); kn.rotation.z = -s * 1.4;
        add(kn, part(G.cap(0.03, 0.2), dark), 0, -0.12, 0);
      }
      const c = n['claw' + (s > 0 ? 'L' : 'R')] = node('claw' + (s > 0 ? 'L' : 'R'), n.body, s * 0.26, 0.0, 0.45); c.rotation.y = s * 0.35;
      add(c, part(G.cap(0.05, 0.26).rotateX(Math.PI / 2), shell), 0, 0, 0.16);
      add(c, part(G.sbox(0.17, 0.12, 0.22, 0.4), shell), 0, 0, 0.38);
      for (const x of [-0.04, 0.05]) add(c, part(G.cone(0.035, 0.18).rotateX(Math.PI / 2), dark, { ink: 0.012 }), x, 0, 0.55, 0, x * 3, 0);
    }
    let prev = n.body;
    for (let i = 1; i <= 5; i++) {
      const t = n['t' + i] = node('t' + i, prev, 0, i === 1 ? 0.08 : 0, i === 1 ? -0.36 : -0.17); t.rotation.x = i === 1 ? 0.5 : 0.55;
      add(t, part(G.ball(0.11 - i * 0.008, 1, 0.9, 1.25), i % 2 ? shell : sh(shell, -0.1)), 0, 0, -0.08);
      prev = t;
    }
    const st = node('sting', prev, 0, 0, -0.17);
    add(st, part(G.ball(0.08, 1, 1, 1.2), '#7a2a1a'), 0, 0, -0.03);
    add(st, part(G.cone(0.035, 0.16).rotateX(-Math.PI / 2), '#2a1010', { ink: 0.012 }), 0, -0.04, -0.12, 0.6);
    return { rig: { root, n, o: { hipY: 0.3, bodyH: 0.9 } }, anim: { kind: 'scorpion', skill: null } };
  }
  /** Rồng Lửa: rồng đỏ bay, cánh dơi lớn, sừng ngà, bụng vàng */
  function DRAKE() {
    const root = node('root'), n = {}, red = '#c8381e', dark = '#7a1a10', belly = '#f2c068', horn = '#f2ead6';
    n.body = node('body', root, 0, 1.25, 0);
    add(n.body, part(limb(0.3, 1.05).rotateX(Math.PI / 2), red), 0, 0, 0);
    for (let i = 0; i < 5; i++) add(n.body, part(G.sbox(.36 - Math.abs(i - 2) * .035, .035, .10, .5), belly, { ink: .008 }), 0, -.23, .30 - i * .14);
    add(n.body, part(G.ball(0.26, 1, 0.7, 1.4), belly, { ink: 0.012 }), 0, -0.1, 0.02);
    for (let i = 0; i < 5; i++) add(n.body, part(G.cone(0.05, 0.16), dark, { ink: 0.012 }), 0, 0.3, 0.3 - i * 0.16, -0.4);
    for (const [z, s] of [[0.2, 1], [0.2, -1], [-0.25, 1], [-0.25, -1]]) { add(n.body, part(G.cap(0.06, 0.18), red), s * 0.17, -0.28, z, 0.6); add(n.body, part(G.ball(0.06, 1.2, 0.6, 1.3), dark), s * 0.17, -0.4, z + 0.1); }
    n.neck = node('neck', n.body, 0, 0.1, 0.38); n.neck.rotation.x = 0.9;
    add(n.neck, part(G.cap(0.13, 0.28), red), 0, 0.17, 0);
    n.dHead = node('dHead', n.neck, 0, 0.38, 0); n.dHead.rotation.x = -0.9;
    add(n.dHead, part(G.sbox(0.32, 0.26, 0.32, 0.4), red), 0, 0, 0);
    add(n.dHead, part(G.sbox(0.22, 0.13, 0.28, 0.4), red), 0, -0.02, 0.24);
    for (const s of [-1, 1]) {
      add(n.dHead, part(G.tube([[s * 0.1, 0.1, -0.08], [s * 0.18, 0.22, -0.22], [s * 0.16, 0.3, -0.38]], 0.035, 10), horn), 0, 0, 0);
      add(n.dHead, new T.Mesh(G.ball(0.04, 1.3, 0.8, 0.5), mat('#ffd23a', { glow: 1.8 })), s * 0.12, 0.06, 0.15, 0, s * 0.5, 0);
      add(n.dHead, new T.Mesh(G.ball(0.015), mat('#1a0e08')), s * 0.05, 0.03, 0.38);
    }
    n.jaw = node('jaw', n.dHead, 0, -0.1, 0.05);
    add(n.jaw, part(G.sbox(0.18, 0.07, 0.3, 0.4), dark), 0, 0, 0.17);
    for (const s of [-1, 1]) add(n.jaw, new T.Mesh(G.cone(0.014, 0.05), mat('#ffffff')), s * 0.06, 0.05, 0.27);
    const W = [0, 0, 0.45, 0.32, 1.0, 0.22, 0.86, 0.0, 0.96, -0.22, 0.66, -0.16, 0.56, -0.36, 0.3, -0.22, 0.1, -0.26];
    for (const [k, s] of [['wingL', 1], ['wingR', -1]]) {
      n[k] = node(k, n.body, s * 0.22, 0.2, 0.05);
      add(n[k], part(wingGeo(W, s, 0.02).rotateX(Math.PI / 2), '#a83a20', { ds: true }), 0, 0, 0);
      add(n[k], part(G.tube([[0, 0, 0], [s * 0.45, 0.02, 0.32], [s * 1.0, 0, 0.22]], 0.03, 10), dark), 0, 0, 0);
    }
    n.dTail = node('dTail', n.body, 0, 0.02, -0.5);
    add(n.dTail, part(G.cone(0.15, 0.9, 12).rotateX(-Math.PI / 2), red), 0, 0, -0.42);
    add(n.dTail, part(G.ext([0, 0, 0.14, -0.1, 0, -0.28, -0.14, -0.1], 0.03, 0.006).rotateX(Math.PI / 2), dark), 0, 0, -0.86);
    glow(n.dHead, 0, 0, 0.3, 0.8, '#ff6a2a', 0.3);
    return { rig: { root, n, o: { hipY: 1.25, bodyH: 2.0 } }, anim: { kind: 'drake', skill: null } };
  }

  function scorpClips(rig) {
    const out = [], legs = ['lL0', 'lL1', 'lL2', 'lR0', 'lR1', 'lR2'], tail = [1, 2, 3, 4, 5];
    out.push(bake(rig, 'idle', 2.0, t => {
      const p = t * TAU, o = { body: { y: S(p) * 0.01 }, clawL: { ry: S(p) * 0.12 }, clawR: { ry: -S(p + 1) * 0.12 } };
      tail.forEach(i => { o['t' + i] = { rx: S(p + i * 0.5) * 0.05, ry: S(p) * 0.04 }; }); return o;
    }));
    out.push(bake(rig, 'walk', 0.5, t => {
      const p = t * TAU, o = { body: { y: Math.abs(S(p * 2)) * 0.015 }, t1: { ry: S(p) * 0.12 }, clawL: { ry: S(p) * 0.1 }, clawR: { ry: S(p) * 0.1 } };
      legs.forEach((k, i) => { const s = k[1] === 'L' ? 1 : -1, ph = p + (i % 3) * 2.1 + (s > 0 ? 0 : Math.PI); o[k] = { ry: S(ph) * 0.4, rz: s * Math.max(0, C(ph)) * 0.25 }; }); return o;
    }));
    out.push(bake(rig, 'attack', 0.8, t => {
      const o = { body: { z: kf(t, [[0, 0], [0.35, -0.05], [0.5, 0.1], [1, 0]]) }, clawL: { ry: kf(t, [[0, 0], [0.4, 0.4], [0.5, -0.2], [1, 0]]) }, clawR: { ry: kf(t, [[0, 0], [0.4, -0.4], [0.5, 0.2], [1, 0]]) } };
      tail.forEach(i => { o['t' + i] = { rx: kf(t, [[0, 0], [0.35, -0.18], [0.5, 0.3], [0.7, 0.25], [1, 0]]) }; }); return o;
    }));
    out.push(bake(rig, 'die', 1.0, t => {
      const o = { body: { rz: kf(t, [[0, 0], [0.6, 3.0], [1, 3.1]]), y: kf(t, [[0, 0], [0.3, 0.3], [0.7, 0.08], [1, 0.08]]) } };
      legs.forEach(k => { o[k] = { rz: (k[1] === 'L' ? -1 : 1) * kf(t, [[0, 0], [1, 0.6]]) }; }); return o;
    }, false));
    return out;
  }
  function drakeClips(rig) {
    const out = [], flap = (p, a) => ({ wingL: { rz: S(p) * a }, wingR: { rz: -S(p) * a } });
    out.push(bake(rig, 'idle', 1.2, t => { const p = t * TAU; return Object.assign(flap(p, 0.6), { body: { y: S(p + 1.6) * 0.06 }, dTail: { ry: S(p) * 0.2 }, neck: { rx: S(p) * 0.05 }, jaw: { rx: 0.05 } }); }));
    out.push(bake(rig, 'walk', 0.6, t => { const p = t * TAU; return Object.assign(flap(p, 0.8), { body: { y: S(p + 1.6) * 0.08, rx: 0.1 }, dTail: { ry: S(p) * 0.25, rx: 0.1 }, neck: { rx: -0.1 } }); }));
    out.push(bake(rig, 'attack', 0.9, t => Object.assign(flap(t * TAU * 2, 0.5), {
      neck: { rx: kf(t, [[0, 0], [0.35, -0.35], [0.5, 0.35], [0.7, 0.3], [1, 0]]) }, dHead: { rx: kf(t, [[0, 0], [0.35, -0.2], [0.5, 0.15], [1, 0]]) },
      jaw: { rx: kf(t, [[0, 0], [0.35, 0.1], [0.5, 0.65], [0.75, 0.55], [1, 0]]) }, body: { z: kf(t, [[0, 0], [0.35, -0.08], [0.5, 0.1], [1, 0]]) }
    })));
    out.push(bake(rig, 'die', 1.1, t => ({
      body: { y: kf(t, [[0, 0], [0.2, 0.1], [0.8, -0.8], [1, -0.8]]), rz: kf(t, [[0, 0], [0.8, 0.8], [1, 0.9]]) },
      wingL: { rz: kf(t, [[0, 0], [0.5, 0.8], [1, -0.4]]) }, wingR: { rz: kf(t, [[0, 0], [0.5, -0.8], [1, 0.4]]) }, neck: { rx: kf(t, [[0, 0], [1, 0.6]]) }, jaw: { rx: kf(t, [[0, 0], [0.4, 0.5], [1, 0.3]]) }
    }), false));
    return out;
  }

  /* =================== HOẠT ẢNH =================== */
  /** khoá hình mượt: pts = [[t, giá trị], …] */
  function kf(t, pts) {
    if (t <= pts[0][0]) return pts[0][1];
    for (let i = 1; i < pts.length; i++) if (t <= pts[i][0]) { const a = pts[i - 1], b = pts[i]; let k = (t - a[0]) / (b[0] - a[0] || 1); k = k * k * (3 - 2 * k); return a[1] + (b[1] - a[1]) * k; }
    return pts[pts.length - 1][1];
  }
  /** nướng hàm tư thế fn(t∈[0,1]) → { tênKhớp: { rx, ry, rz, x, y, z, s } } thành AnimationClip (cộng vào tư thế nghỉ) */
  function bake(rig, name, dur, fn, loop) {
    const N = Math.max(2, Math.round(dur * 30) + 1), frames = [], keys = new Set();
    for (let f = 0; f < N; f++) { const p = fn(f / (N - 1)); if(rig.n.kneeR){const c=S(f/(N-1)*TAU);Object.assign(p,{kneeR:{rx:name==='walk'?Math.max(0,-c)*.85:.03},kneeL:{rx:name==='walk'?Math.max(0,c)*.85:.03},elbowR:{rx:-.12},elbowL:{rx:-.12}});} if (rig.extra) Object.assign(p, rig.extra(f / (N - 1), dur, name)); frames.push(p); Object.keys(p).forEach(k => keys.add(k)); }
    const times = frames.map((_, f) => f / (N - 1) * dur), tracks = [], e = new T.Euler(), q = new T.Quaternion();
    keys.forEach(k => {
      const nd = rig.n[k]; if (!nd) return;
      const r0 = nd.userData.r0, p0 = nd.userData.p0, s0 = nd.userData.s0, qa = [], pa = [], sa = [];
      let hasP = false, hasS = false;
      frames.forEach(fr => {
        const v = fr[k] || {};
        e.set(r0.x + (v.rx || 0), r0.y + (v.ry || 0), r0.z + (v.rz || 0), r0.order); q.setFromEuler(e); qa.push(q.x, q.y, q.z, q.w);
        if (v.x || v.y || v.z) hasP = true; pa.push(p0.x + (v.x || 0), p0.y + (v.y || 0), p0.z + (v.z || 0));
        const s = v.s === undefined ? 1 : v.s; if (s !== 1) hasS = true; if(v.sy!==undefined&&v.sy!==1)hasS=true;sa.push(s0.x*s,s0.y*s*(v.sy===undefined?1:v.sy),s0.z*s);
      });
      tracks.push(new T.QuaternionKeyframeTrack(nd.name + '.quaternion', times, qa));
      if (hasP) tracks.push(new T.VectorKeyframeTrack(nd.name + '.position', times, pa));
      if (hasS) tracks.push(new T.VectorKeyframeTrack(nd.name + '.scale', times, sa));
    });
    const c = new T.AnimationClip(name, dur, tracks); c.userData = { loop: loop !== false }; return c;
  }

  function humanClips(rig, A) {
    const out = [], two = A.kind === 'two', bow = A.kind === 'bow', staff = A.kind === 'staff', hasCape = !!rig.n.cape, gem = !!rig.n.gem;
    const capeUp = rig.n.cape && rig.n.cape.userData.r0.x > 0.3;
    const armsRest = (o, b) => {
      if (two) { o.armR = { rx: -0.75 + b, rz: 0.4 }; o.armL = { rx: -0.75 + b, rz: -0.4 }; }
      if (bow) o.armL = { rx: -0.40 + b, rz: -.16 };
      if (staff) o.armR = { rx: -0.2 + b };
      if (A.shield) o.armL = { rx: -0.35 + b, rz: -0.1 };
      return o;
    };
    const capeFx = (o, base, amp, ph) => { if (hasCape) o.cape = { rx: (capeUp ? 0.15 : base) + S(ph) * (capeUp ? 0.12 : amp) }; return o; };
    const k = A.still ? 0.35 : 1;
    // ĐỨNG: thở, lắc đầu nhẹ (goblin nhìn trái phải)
    out.push(bake(rig, 'idle', 2.4, t => {
      const p = t * TAU, b = S(p);
      const o = { torso: { y: b * 0.012 * k, rx: b * 0.02 * k }, head: { rx: -b * 0.035 * k, rz: S(p + 1) * 0.035 * k, ry: A.look ? S(p) * 0.4 : 0 }, armR: { rx: b * 0.06 * k }, armL: { rx: -b * 0.06 * k } };
      armsRest(o, b * 0.04 * k); capeFx(o, 0.08, 0.035, p * 2);
      if (gem) o.gem = { y: S(p * 2) * 0.035, ry: t * TAU };
      return o;
    }));
    // ĐI: nhún nảy kiểu KR, vung tay ngược chân
    out.push(bake(rig, 'walk', A.heavy ? 1.08 : 0.86, t => {
      const p = t * TAU, s = S(p);
      const o = { hips: { y: (1-C(p*2))*.5 * (A.heavy ? 0.025 : 0.038), ry: s * 0.08, rz: s * 0.03 }, torso: { rx: 0.1 }, head: { rx: -0.08 + Math.abs(C(p)) * 0.04 },
        legR: { rx: s * 0.56 }, legL: { rx: -s * 0.56 }, armR: { rx: -s * 0.6 }, armL: { rx: s * 0.6 } };
      armsRest(o, s * 0.12); if (!two && !bow && !A.shield && !staff) { o.armR = { rx: -s * 0.6 }; o.armL = { rx: s * 0.6 }; }
      if (A.zombie) { o.armR = { rx: -s * 0.15 }; o.armL = { rx: s * 0.15 }; o.hips.y *= 0.4; }
      if (A.fly) { o.legR = { rx: 0.3 + s * 0.2 }; o.legL = { rx: 0.2 - s * 0.2 }; o.hips = { y: S(p) * 0.05 }; o.torso = { rx: 0.25 }; }
      if (staff) o.armR = { rx: -0.2 - s * 0.3 };
      capeFx(o, 0.4, 0.1, p * 2);
      if (gem) o.gem = { y: S(p * 2) * 0.03, ry: t * TAU };
      return o;
    }));
    // ĐÁNH
    if (A.kind === 'melee') out.push(bake(rig, 'attack', A.heavy ? 1.2 : 0.8, t => ({
      armR: { rx: kf(t, [[0, 0], [0.38, -2.6], [0.52, -0.45], [0.72, -0.55], [1, 0]]), rz: kf(t, [[0, 0], [0.38, -0.45], [0.52, 0.6], [0.72, 0.5], [1, 0]]) },
      armL: A.shield ? { rx: kf(t, [[0, -0.35], [0.38, -0.9], [0.52, -0.2], [1, -0.35]]), rz: -0.1 } : { rx: kf(t, [[0, 0], [0.38, 0.4], [0.52, -0.3], [1, 0]]) },
      torso: { ry: kf(t, [[0, 0], [0.38, -0.45], [0.52, 0.42], [1, 0]]), rx: kf(t, [[0, 0], [0.38, -0.1], [0.52, 0.18], [1, 0]]) },
      hips: { z: kf(t, [[0, 0], [0.38, -0.04], [0.52, 0.1], [1, 0]]), y: kf(t, [[0, 0], [0.38, 0.02], [0.55, -0.04], [1, 0]]) },
      legR: { rx: kf(t, [[0, 0], [0.52, -0.45], [1, 0]]) }, legL: { rx: kf(t, [[0, 0], [0.52, 0.3], [1, 0]]) },
      ...(hasCape ? { cape: { rx: kf(t, [[0, capeUp ? 0.1 : 0.08], [0.52, 0.5], [1, capeUp ? 0.1 : 0.08]]) } } : {})
    })));
    if (two) out.push(bake(rig, 'attack', 0.95, t => {
      const a = kf(t, [[0, -0.75], [0.42, -2.9], [0.56, -0.35], [0.75, -0.4], [1, -0.75]]);
      return { armR: { rx: a, rz: 0.4 }, armL: { rx: a, rz: -0.4 }, torso: { rx: kf(t, [[0, 0], [0.42, -0.22], [0.56, 0.35], [1, 0]]) },
        hips: { y: kf(t, [[0, 0], [0.42, 0.05], [0.56, -0.06], [1, 0]]) }, legR: { rx: kf(t, [[0, 0], [0.56, -0.3], [1, 0]]) }, legL: { rx: kf(t, [[0, 0], [0.56, 0.25], [1, 0]]) } };
    }));
    if (A.kind === 'stab') out.push(bake(rig, 'attack', 0.6, t => ({
      armR: { rx: kf(t, [[0, 0], [0.35, 0.7], [0.5, -1.7], [0.7, -1.6], [1, 0]]) }, armL: { rx: kf(t, [[0, 0], [0.35, -0.6], [0.5, 0.6], [1, 0]]) },
      hips: { z: kf(t, [[0, 0], [0.35, -0.06], [0.5, 0.18], [1, 0]]), y: kf(t, [[0, 0], [0.42, 0.06], [0.55, 0], [1, 0]]) },
      torso: { rx: kf(t, [[0, 0], [0.35, -0.15], [0.5, 0.25], [1, 0]]) }, legR: { rx: kf(t, [[0, 0], [0.5, -0.6], [1, 0]]) }, legL: { rx: kf(t, [[0, 0], [0.5, 0.5], [1, 0]]) }
    })));
    if (A.kind === 'fist') out.push(bake(rig, 'attack', A.heavy ? 1.08 : 0.86, t => ({ // đấm / cào thẳng tới
      armR: { rx: kf(t, [[0, 0], [0.35, 0.7], [0.5, -1.0], [0.7, -0.9], [1, 0]]) }, armL: { rx: kf(t, [[0, 0], [0.35, -0.4], [0.5, 0.4], [1, 0]]) },
      torso: { ry: kf(t, [[0, 0], [0.35, -0.35], [0.5, 0.4], [1, 0]]), rx: kf(t, [[0, 0], [0.35, -0.08], [0.5, 0.22], [1, 0]]) },
      hips: { z: kf(t, [[0, 0], [0.35, -0.04], [0.5, 0.1], [1, 0]]) }, legR: { rx: kf(t, [[0, 0], [0.5, -0.35], [1, 0]]) }, legL: { rx: kf(t, [[0, 0], [0.5, 0.25], [1, 0]]) }
    })));
    const shoot = (t, o) => {
      o.armL = { rx: kf(t, [[0, -0.40], [0.15, -1.55], [0.85, -1.55], [1, -0.40]]), rz: -0.05 };
      // tay phải bắt dây cung trước ngực rồi kéo về sau (tay thẳng nên vắt ngang ngực), buông dây thì bật ra sau
      o.armR = { rx: kf(t, [[0, 0], [0.15, -0.08], [0.6, -0.08], [1, 0]]), ry: kf(t, [[0, 0], [0.15, -0.76], [0.55, -0.6], [0.62, -0.28], [0.75, -0.3], [1, 0]]), rz: kf(t, [[0, 0], [0.15, 1.7], [0.55, 1.72], [0.62, 1.62], [0.75, 1.5], [1, 0]]) };
      o.torso = { ry: kf(t, [[0, 0], [0.15, -0.45], [0.85, -0.45], [1, 0]]) };
      o.arrow = { y: kf(t, [[0, 0], [0.55, 0.09], [0.6, 0.09], [0.61, 0], [1, 0]]), s: kf(t, [[0, 1], [0.6, 1], [0.61, 0.001], [0.9, 0.001], [1, 1]]) };
      return o;
    };
    if (bow) out.push(bake(rig, 'attack', 0.75, t => shoot(t, {})));
    if (staff) out.push(bake(rig, 'attack', 1.0, t => ({
      armR: { rx: kf(t, [[0, -0.2], [0.4, -2.65], [0.6, -2.45], [1, -0.2]]) }, staff: { rx: kf(t, [[0, 0], [0.4, 2.4], [0.6, 2.2], [1, 0]]) },
      armL: { rx: kf(t, [[0, 0], [0.5, -1.45], [0.72, -1.35], [1, 0]]) }, gem: { s: kf(t, [[0, 1], [0.45, 1.7], [0.6, 1], [1, 1]]), ry: t * TAU },
      torso: { rx: kf(t, [[0, 0], [0.4, -0.12], [0.6, 0.15], [1, 0]]) }, hips: { y: kf(t, [[0, 0], [0.4, 0.05], [0.6, 0], [1, 0]]) },
      ...(hasCape ? { cape: { rx: kf(t, [[0, 0.08], [0.6, 0.45], [1, 0.08]]) } } : {})
    })));
    // KỸ NĂNG
    if (A.skill === 'block') out.push(bake(rig, 'skill', 1.4, t => ({
      armL: { rx: kf(t, [[0, -0.35], [0.2, -1.35], [0.8, -1.35], [1, -0.35]]), rz: kf(t, [[0, -0.1], [0.2, 0.55], [0.8, 0.55], [1, -0.1]]) },
      shield: { rx: kf(t, [[0, 0], [0.2, 1.1], [0.8, 1.1], [1, 0]]), ry: kf(t, [[0, 0], [0.2, -0.45], [0.8, -0.45], [1, 0]]) },
      armR: { rx: kf(t, [[0, 0], [0.2, 0.35], [0.8, 0.35], [1, 0]]) }, hips: { y: kf(t, [[0, 0], [0.2, -0.06], [0.8, -0.06], [1, 0]]) },
      legR: { rx: kf(t, [[0, 0], [0.2, 0.3], [0.8, 0.3], [1, 0]]) }, legL: { rx: kf(t, [[0, 0], [0.2, -0.35], [0.8, -0.35], [1, 0]]) }, torso: { rx: kf(t, [[0, 0], [0.2, 0.12], [0.8, 0.12], [1, 0]]) }
    }), false));
    if (A.skill === 'holy' || A.skill === 'summon') out.push(bake(rig, 'skill', 1.5, t => ({
      armR: { rx: kf(t, [[0, 0], [0.3, -3.0], [0.75, -3.0], [1, 0]]), rz: kf(t, [[0, 0], [0.3, 0.15], [0.75, 0.15], [1, 0]]) },
      armL: { rx: kf(t, [[0, 0], [0.3, -1.3], [0.75, -1.3], [1, 0]]), rz: kf(t, [[0, 0], [0.3, 0.5], [0.75, 0.5], [1, 0]]) },
      torso: { rx: kf(t, [[0, 0], [0.3, -0.18], [0.75, -0.18], [1, 0]]) }, head: { rx: kf(t, [[0, 0], [0.3, -0.25], [0.75, -0.25], [1, 0]]) },
      hips: { y: kf(t, [[0, 0], [0.3, 0.05], [0.75, 0.05], [1, 0]]) }
    }), false));
    if (A.skill === 'triple') out.push(bake(rig, 'skill', 1.05, t => { const tt = (t * 3) % 1, o = shoot(tt, {}); o.armL = { rx: -1.55, rz: -0.05 }; o.torso = { ry: -0.45 }; return o; }));
    if (A.skill === 'meteor') out.push(bake(rig, 'skill', 1.6, t => ({
      armR: { rx: kf(t, [[0, -0.2], [0.3, -2.95], [0.8, -2.95], [1, -0.2]]) }, staff: { rx: kf(t, [[0, 0], [0.3, 2.85], [0.8, 2.85], [1, 0]]) },
      armL: { rx: kf(t, [[0, 0], [0.3, -2.9], [0.8, -2.9], [1, 0]]), rz: kf(t, [[0, 0], [0.3, -0.3], [0.8, -0.3], [1, 0]]) },
      gem: { s: kf(t, [[0, 1], [0.35, 1.5], [0.6, 2.1], [0.8, 1.4], [1, 1]]), ry: t * TAU * 2 },
      head: { rx: kf(t, [[0, 0], [0.3, -0.3], [0.8, -0.3], [1, 0]]) }, hips: { y: kf(t, [[0, 0], [0.3, 0.08], [0.8, 0.08], [1, 0]]) },
      ...(hasCape ? { cape: { rx: kf(t, [[0, 0.08], [0.4, 0.6], [0.8, 0.5], [1, 0.08]]) } } : {})
    }), false));
    if (A.skill === 'slam') out.push(bake(rig, 'skill', 1.2, t => {
      const a = kf(t, [[0, two ? -0.75 : 0], [0.35, -3.0], [0.55, -0.15], [0.8, -0.2], [1, two ? -0.75 : 0]]);
      const o = { armR: { rx: a, rz: two ? 0.4 : 0.1 }, torso: { rx: kf(t, [[0, 0], [0.35, -0.3], [0.55, 0.45], [0.8, 0.4], [1, 0]]) },
        hips: { y: kf(t, [[0, 0], [0.2, -0.06], [0.4, 0.3], [0.55, -0.08], [0.8, -0.06], [1, 0]]) },
        legR: { rx: kf(t, [[0, 0], [0.4, -0.4], [0.55, -0.5], [1, 0]]) }, legL: { rx: kf(t, [[0, 0], [0.4, 0.3], [0.55, 0.4], [1, 0]]) } };
      o.armL = two ? { rx: a, rz: -0.4 } : { rx: kf(t, [[0, 0], [0.35, -1.0], [0.55, 0.5], [1, 0]]) };
      return o;
    }, false));
    // NGÃ
    const fall = -(rig.o.hipY - (rig.o.torsoD || 0.3) * 0.5);
    out.push(bake(rig, 'die', 1.1, t => ({
      hips: { rx: kf(t, [[0, 0], [0.2, 0.2], [0.7, -1.5], [0.8, -1.38], [1, -1.45]]), y: kf(t, [[0, 0], [0.2, 0.05], [0.7, fall], [1, fall]]), z: kf(t, [[0, 0], [0.7, -0.15], [1, -0.15]]) },
      armR: { rx: kf(t, [[0, 0], [0.3, -2.0], [1, -1.7]]), rz: kf(t, [[0, 0], [1, -0.6]]) }, armL: { rx: kf(t, [[0, 0], [0.3, -1.8], [1, -1.5]]), rz: kf(t, [[0, 0], [1, 0.6]]) },
      legR: { rx: kf(t, [[0, 0], [0.6, 0.5], [1, 0.75]]) }, legL: { rx: kf(t, [[0, 0], [0.6, 0.2], [1, 0.55]]) }, head: { rx: kf(t, [[0, 0], [0.5, 0.35], [1, 0.2]]) }
    }), false));
    return out;
  }

  function wolfClips(rig) {
    const out = [];
    out.push(bake(rig, 'idle', 2.6, t => {
      const p = t * TAU, roar = kf(t, [[0, 0], [0.08, 0], [0.18, 1], [0.32, 1], [0.42, 0], [1, 0]]);
      return { wolf: { y: S(p) * 0.012, rx: -roar * 0.05 }, wHead: { rx: -roar * 0.4 + S(p) * 0.03 }, jaw: { rx: roar * 0.55 }, tail: { ry: S(p * 3) * 0.3, rx: S(p * 2) * 0.08 },
        rider: { y: S(p) * 0.01 }, rHead: { ry: S(p) * 0.15 }, rArm: { rx: S(p) * 0.04 } };
    }));
    const gallop = (name, dur, low) => bake(rig, name, dur, t => {
      const p = t * TAU, a = 0.85;
      return { wolf: { y: Math.abs(S(p)) * 0.09, rx: S(p) * 0.09 + (low ? 0.08 : 0) }, wFL: { rx: S(p) * a }, wFR: { rx: S(p + 0.5) * a }, wBL: { rx: S(p + Math.PI) * a }, wBR: { rx: S(p + Math.PI + 0.5) * a },
        wHead: { rx: -S(p) * 0.1 + (low ? 0.3 : 0) }, jaw: { rx: low ? 0.35 : 0.08 }, tail: { rx: 0.4 + S(p * 2) * 0.15 },
        rider: { y: S(p * 2) * 0.02, rx: -S(p) * 0.06 + (low ? 0.2 : 0) }, rArm: { rx: S(p) * 0.08 + (low ? -0.5 : 0) } };
    });
    out.push(gallop('walk', 0.55, false));
    out.push(bake(rig, 'attack', 0.85, t => ({
      wolf: { z: kf(t, [[0, 0], [0.3, -0.1], [0.5, 0.28], [1, 0]]), rx: kf(t, [[0, 0], [0.3, -0.12], [0.5, 0.12], [1, 0]]) },
      wHead: { rx: kf(t, [[0, 0], [0.3, -0.25], [0.5, 0.25], [1, 0]]) }, jaw: { rx: kf(t, [[0, 0], [0.4, 0.6], [0.55, 0.1], [1, 0]]) },
      wFL: { rx: kf(t, [[0, 0], [0.3, 0.5], [0.5, -0.8], [1, 0]]) }, wFR: { rx: kf(t, [[0, 0], [0.3, 0.4], [0.5, -0.7], [1, 0]]) },
      wBL: { rx: kf(t, [[0, 0], [0.3, -0.3], [0.5, 0.6], [1, 0]]) }, wBR: { rx: kf(t, [[0, 0], [0.3, -0.3], [0.5, 0.5], [1, 0]]) },
      rArm: { rx: kf(t, [[0, 0], [0.3, 0.5], [0.5, -0.7], [0.65, -0.6], [1, 0]]) }, rider: { rx: kf(t, [[0, 0], [0.3, -0.12], [0.5, 0.2], [1, 0]]) }
    })));
    out.push(gallop('skill', 0.4, true));
    out.push(bake(rig, 'die', 1.1, t => ({
      wolf: { rz: kf(t, [[0, 0], [0.2, -0.15], [0.7, 1.45], [1, 1.4]]), y: kf(t, [[0, 0], [0.2, 0.06], [0.7, -0.45], [1, -0.45]]) },
      wHead: { rx: kf(t, [[0, 0], [0.5, -0.3], [1, 0.2]]) }, jaw: { rx: kf(t, [[0, 0], [0.4, 0.5], [1, 0.3]]) },
      rider: { rz: kf(t, [[0, 0], [0.7, 0.4], [1, 0.5]]), x: kf(t, [[0, 0], [0.7, -0.2], [1, -0.25]]) },
      wFL: { rx: kf(t, [[0, 0], [1, -0.6]]) }, wBL: { rx: kf(t, [[0, 0], [1, 0.6]]) }
    }), false));
    return out;
  }

  /* =================== DANH SÁCH =================== */
  const pal = (...a) => a.map(([c, l]) => ({ c, l }));
  const LIST = [
    { id: 'soldier', name: 'Kiếm Sĩ Con Người', group: 'Trụ', role: 'Trụ Người · gọi 2 kiếm sĩ chặn đường', tiers: 4, tierName: 'Cấp trụ',
      desc: 'Tóc đen dựng gai, giáp bạc (cấp 3 viền vàng, cấp 4 vai vàng + vương miện), áo choàng đỏ sẫm, kiếm lớn + khiên đỏ thập tự vàng. Chém chéo vai; kỹ năng giơ khiên tạo lá chắn.',
      palette: pal(['#1e1a22', 'Tóc'], ['#dde2ea', 'Giáp bạc'], ['#6a1218', 'Áo choàng'], ['#8a1e24', 'Khiên'], [GOLD, 'Viền vàng']),
      make: t => SOLDIER(t, { shield: false }) },
    // lính cầm khiên khi trụ Người gắn vật phẩm Khiên – màu khiên theo bậc đồ (Tệ → Huyền thoại)
    ...[['#7a5a3a', '#5a5a5a', 1], ['#8a1e24', '#d8dce6', 1], ['#2a5ab8', '#dde2ea', 2], ['#6a2ab0', GOLD, 2], ['#e8a020', '#fff0a0', 2]].map(([c, rim, st], r) => ({ id: 'soldierS' + r, hidden: true, name: 'Kiếm Sĩ + Khiên (bậc ' + (r + 1) + ')', group: 'Trụ', role: 'Lính trụ Người cầm khiên', tiers: 4, tierName: 'Cấp trụ', palette: pal([c, 'Khiên'], [rim, 'Viền']),
      make: t => SOLDIER(t, { shieldCol: c, shieldRim: rim, shieldStyle: st, shieldGlow: r >= 4 }) })),
    { id: 'elf', name: 'Cung Thủ Elf', group: 'Trụ', role: 'Trụ Elf · bắn rất nhanh, chí mạng', tiers: 4, tierName: 'Cấp trụ',
      desc: 'Mảnh mai, tóc vàng dài (cấp 3 bạch kim + vòng vàng ngọc lục bảo), tai nhọn dài, áo xanh lá, ống tên sau lưng, cung vàng cong. Cấp 4 mũi tên phát sáng; kỹ năng bắn 3 mũi liên tiếp.',
      palette: pal(['#f5d878', 'Tóc'], ['#3fa05a', 'Áo'], ['#2f7a40', 'Áo choàng'], ['#c89a3a', 'Cung'], ['#2aa86a', 'Mắt']),
      make: t => ELF(t) },
    { id: 'mage', name: 'Phù Thủy', group: 'Trụ', role: 'Trụ Phép · cầu phép nổ lan', tiers: 4, tierName: 'Cấp trụ',
      desc: 'Dáng nhỏ trong áo choàng cực lớn, mũ nhọn uốn cong có sao vàng, tóc bạc-tím dài, gậy có viên pha lê bay lơ lửng và phát sáng. Kỹ năng giơ hai tay gọi mưa thiên thạch.',
      palette: pal(['#3a2ea0', 'Mũ'], ['#4a3ec4', 'Áo choàng'], ['#d8d4f8', 'Tóc'], ['#7fd8ff', 'Viền phép'], ['#9ae6ff', 'Pha lê']),
      make: t => MAGE(t) },
    { id: 'dwarf', name: 'Chiến Binh Lùn', group: 'Trụ', role: 'Trụ Lùn · rìu hai tay, đập đất gây choáng', tiers: 4, tierName: 'Cấp trụ',
      desc: 'Thấp, cực béo chắc, râu cam khổng lồ che miệng, mũ sắt có sống mũi (cấp 3 thêm sừng + khoen vàng ở râu), vai thép to, kính xanh và pháo đồng cầm tay. Kỹ năng nhảy lên bổ rìu xuống đất.',
      palette: pal(['#d4581e', 'Râu'], ['#9ea4b0', 'Mũ & vai'], ['#7a6a5a', 'Giáp da'], ['#aeb2bc', 'Rìu'], [GOLD, 'Khoá vàng']),
      make: t => DWARF(t) },
    { id: 'aldric', name: 'Aldric', group: 'Anh hùng', role: 'Hiệp sĩ · Thánh Quang', tiers: 4, tierName: 'Bậc trang bị',
      desc: 'Hiệp sĩ tóc bạch kim, giáp xanh hoàng gia, áo choàng xanh đậm, đại kiếm thánh có lõi sáng xanh (bậc cao sáng vàng). Kỹ năng giơ kiếm gọi Thánh Quang.',
      palette: pal(['#eef2f8', 'Tóc'], ['#3a5ab8', 'Giáp'], ['#1e3488', 'Áo choàng'], ['#9ae0ff', 'Lõi kiếm'], [GOLD, 'Chuôi']),
      make: t => SOLDIER(t, { hair: '#eef2f8', armor: '#3a5ab8', cape: '#1e3488', weapon: 'greatsword', shield: false, iris: '#3a8ad8', noCrown: true, wcol: t >= 3 ? '#ffe680' : '#9ae0ff' }) },
    { id: 'lyra', name: 'Lyra', group: 'Anh hùng', role: 'Xạ thủ Elf · Mưa Tên', tiers: 4, tierName: 'Bậc trang bị',
      desc: 'Xạ thủ tóc xanh ngọc, áo xanh rêu, áo choàng xanh biển sâu. Bắn liên hoàn 3 mũi; kỹ năng Mưa Tên.',
      palette: pal(['#6ae0c8', 'Tóc'], ['#2f8a6a', 'Áo'], ['#1f6a5a', 'Áo choàng'], ['#c89a3a', 'Cung']),
      make: t => ELF(t, { hair: '#6ae0c8', tunic: '#2f8a6a', cape: '#1f6a5a' }) },
    { id: 'selene', name: 'Selene', group: 'Anh hùng', role: 'Đại pháp sư · Bão Băng', tiers: 4, tierName: 'Bậc trang bị',
      desc: 'Đại pháp sư tóc trắng, mũ và áo xanh lam, pha lê băng xanh nhạt. Kỹ năng Bão Băng làm chậm cả vùng.',
      palette: pal(['#f4f6ff', 'Tóc'], ['#2a3aa0', 'Mũ'], ['#3a5ac8', 'Áo choàng'], ['#8ad8ff', 'Pha lê băng']),
      make: t => MAGE(t, { hair: '#f4f6ff', hat: '#2a3aa0', robe: '#3a5ac8', cape: '#22307a', wcol: '#8ad8ff', iris: '#3a8ad8' }) },
    { id: 'borin', name: 'Borin', group: 'Anh hùng', role: 'Chiến thần Lùn · Địa Chấn', tiers: 4, tierName: 'Bậc trang bị',
      desc: 'Chiến thần Lùn râu đỏ lửa, giáp thép xám, búa chiến đầu khối có lõi lửa. Kỹ năng Địa Chấn: nhảy lên nện búa làm choáng.',
      palette: pal(['#c8401e', 'Râu'], ['#6a6e7a', 'Giáp'], ['#a8adb8', 'Búa'], ['#ff7a2a', 'Lõi lửa']),
      make: t => DWARF(t, { beard: '#c8401e', armor: '#6a6e7a', weapon: 'warhammer' }) },
    { id: 'goblin', name: 'Yêu Tinh Goblin', group: 'Quái', role: 'Quái nhỏ · đi thành bầy', tiers: 1,
      desc: 'Tí hon, khom người, tai dài chìa ngang, mắt tròn to vàng đảo trái phải, khăn đỏ, dao nhỏ. Đánh: lao tới đâm.',
      palette: pal(['#7cc23e', 'Da'], ['#7a5232', 'Áo vải'], ['#c8302a', 'Khăn'], ['#ffd23a', 'Mắt']),
      make: () => GOBLIN() },
    { id: 'shade', name: 'Bóng Tối', group: 'Quái', role: 'Do Kỵ Sĩ Hắc Ám triệu hồi', tiers: 1,
      desc: 'Goblin bóng ma màu tím đen, mắt tím phát sáng, quầng tối quanh người.',
      palette: pal(['#5a4a8a', 'Da'], ['#1a1024', 'Áo'], ['#d080ff', 'Mắt sáng']),
      make: () => GOBLIN({ skin: '#5a4a8a', cloth: '#1a1024', eye: '#d080ff', glow: true }) },
    { id: 'orc', name: 'Chiến Binh Orc', group: 'Quái', role: 'Quái giáp vừa · phép khắc chế', tiers: 3, tierName: 'Biến thể',
      desc: 'Da xanh xám, búi tóc đen, nanh trắng, băng đô đỏ, đai da chéo ngực, khố đỏ, vai thép. Biến thể 3: mũ sừng + da sói trên vai (Hắc Orc).',
      palette: pal(['#7a9a62', 'Da'], ['#6a3e26', 'Da thuộc'], ['#b02a24', 'Khố đỏ'], ['#ff5a2a', 'Mắt']),
      make: t => ORC(t) },
    { id: 'wolfRider', name: 'Orc Cưỡi Sói', group: 'Quái', role: 'Quái nhanh · sói húc lính', tiers: 1,
      desc: 'Orc đội mũ sắt chóp đỏ cưỡi sói xám lớn, cầm giáo. Đứng: sói gầm. Đánh: lao tới đâm giáo. Kỹ năng: sói cúi đầu tăng tốc húc.',
      palette: pal(['#7a7680', 'Lông sói'], ['#4a4652', 'Bờm'], ['#7a9a62', 'Da orc'], ['#ffd23a', 'Mắt sói']),
      make: () => WOLF() },
    { id: 'orcArcher', name: 'Cung Thủ Hắc Ám', group: 'Quái', role: 'Rừng Xanh · bắn lính từ xa', tiers: 1,
      desc: 'Orc da xanh rêu trùm mũ trùm tím đen, áo choàng vai, cung gỗ sẫm, ống tên đầu lửa. Đánh: giương cung bắn.',
      palette: pal(['#6a8a4a', 'Da'], ['#3a2a3a', 'Mũ trùm'], ['#4a3a3a', 'Áo'], ['#4a2a1a', 'Cung']), make: () => ORCARCHER() },
    { id: 'warg', name: 'Sói Warg', group: 'Quái', role: 'Quái cực nhanh', tiers: 1,
      desc: 'Sói xám tím lông bờm dựng, mắt vàng. Phi nước đại, gầm và vồ cắn.',
      palette: pal(['#6a5a6a', 'Lông'], ['#4a3c4c', 'Bờm'], ['#b8a8b0', 'Bụng'], ['#ffd23a', 'Mắt']), make: () => WOLF({ noRider: true, fur: '#6a5a6a', furD: '#4a3c4c', belly: '#b8a8b0' }) },
    { id: 'treant', name: 'Cây Ma', group: 'Quái', role: 'Rừng Xanh · cực trâu, hồi máu', tiers: 1, scale: 1.3,
      desc: 'Cây cổ thụ hoá quỷ: thân gỗ sần có rãnh, tán lá trên đầu, mắt xanh lục phát sáng, tay cành, chuỳ khúc gỗ.',
      palette: pal(['#7a5a38', 'Vỏ cây'], ['#4f9a3a', 'Lá'], ['#9aff6a', 'Mắt sáng']), make: () => TREANT() },
    { id: 'skeleton', name: 'Hiệp Sĩ Xương', group: 'Quái', role: 'Thành Cổ · giáp dày', tiers: 1,
      desc: 'Bộ xương đội mũ sắt, hốc mắt xanh ngọc ma quái, sườn lộ, chuỳ xương và khiên đầu lâu.',
      palette: pal(['#e8e2d0', 'Xương'], ['#6a6a78', 'Mũ sắt'], ['#3a2a4a', 'Vạt áo'], ['#6af0d0', 'Mắt ma']), make: () => SKELETON() },
    { id: 'wraith', name: 'Linh Ma', group: 'Quái', role: 'Bay · kháng phép', tiers: 1,
      desc: 'Áo choàng ma tím xám bay lơ lửng, thân tan thành khói nhọn, mặt tối với 2 mắt tím rực, tay xương.',
      palette: pal(['#5a4a7a', 'Áo choàng'], ['#2a1e40', 'Bóng tối'], ['#8a5aff', 'Mắt']), make: () => WRAITH() },
    { id: 'deathKnight', name: 'Kỵ Sĩ Tử Thần', group: 'Quái', role: 'Thành Cổ · giáp rất dày', tiers: 1, scale: 1.2,
      desc: 'Hiệp sĩ chết hồi sinh: giáp đen ánh tím, chùm lông tím trên mũ, áo choàng tím, mắt xanh băng, kiếm lam.',
      palette: pal(['#2a2a3a', 'Giáp'], ['#6a4ae0', 'Lông mũ'], ['#3a1a5a', 'Áo choàng'], ['#6ae0ff', 'Mắt / kiếm']),
      make: () => DARKKNIGHT(false, false, false, { armor: '#2a2a3a', trim: '#6a4ae0', light: '#3a3a52', eye: '#6ae0ff', cape: '#3a1a5a', tabard: '#4a2a7a', plume: '#6a4ae0', blade: '#8a9ac8', guard: '#34344a', core: '#6ae0ff' }) },
    { id: 'bandit', name: 'Cướp Sa Mạc', group: 'Quái', role: 'Sa Mạc · nhanh nhẹn', tiers: 1,
      desc: 'Tóc gai đen, khăn trắng buộc đầu, vết sẹo, áo gile nâu, đai đỏ, đao cong sáng loáng.',
      palette: pal(['#e0b48a', 'Da'], ['#e8e0c8', 'Khăn'], ['#8a5a34', 'Gile'], ['#a83a2a', 'Đai']), make: () => BANDIT() },
    { id: 'mummy', name: 'Xác Ướp', group: 'Quái', role: 'Sa Mạc · tự hồi máu', tiers: 1,
      desc: 'Quấn băng cổ ngả vàng, băng lỏng phất phơ, một mắt xanh lục phát sáng, khom người tay chìa ra trước.',
      palette: pal(['#ece0c0', 'Băng'], ['#cdbf98', 'Băng cũ'], ['#5aff9a', 'Mắt']), make: () => MUMMY() },
    { id: 'pharaoh', name: 'Pharaoh Xác Ướp', group: 'Boss', role: 'Boss Sa Mạc · gọi Bọ Cạp, hồi máu', tiers: 1, scale: 1.25,
      desc: 'Vua xác ướp ngàn năm: mũ nemes sọc vàng-lam, rắn hổ mang vàng trên trán, vòng cổ vàng, gậy ngọc lục bảo.', palette: pal([GOLD, 'Vàng'], ['#2a4ab8', 'Lam'], ['#ece0c0', 'Băng vải']), make: () => PHARAOH() },
    { id: 'treantKing', name: 'Vua Cây Ma', group: 'Boss', role: 'Boss Rừng Xanh · rễ cây làm choáng', tiers: 1, scale: 1.4,
      desc: 'Cây cổ thụ nghìn năm hoá quỷ, đội vương miện gai phát sáng.', palette: pal(['#7a5a38', 'Vỏ cây'], ['#c8ff6a', 'Gai sáng']), make: () => TREANTKING() },
    { id: 'magmaLord', name: 'Chúa Tể Dung Nham', group: 'Boss', role: 'Boss Núi Lửa · đập đất, gọi Quỷ Lửa', tiers: 1, scale: 1.5,
      desc: 'Khối dung nham khổng lồ, vương miện lửa, nứt dung nham rực khắp thân.', palette: pal(['#3a2a2a', 'Đá'], ['#ffb02a', 'Dung nham']), make: () => MAGMALORD() },
    { id: 'scorpion', name: 'Bọ Cạp Cát', group: 'Quái', role: 'Sa Mạc · vỏ cứng như đá', tiers: 1,
      desc: 'Vỏ cam cát có đốt, 6 chân, 2 càng lớn, đuôi 5 đốt cong qua lưng với ngòi đỏ sẫm. Đánh: quất đuôi chích.',
      palette: pal(['#c8782a', 'Vỏ'], ['#8a4a1a', 'Đốt sẫm'], ['#7a2a1a', 'Ngòi']), make: () => SCORPION() },
    { id: 'frostWolf', name: 'Sói Tuyết', group: 'Quái', role: 'Băng Giá · lao như bão', tiers: 1,
      desc: 'Sói trắng xanh, lưng mọc tinh thể băng, mắt xanh băng phát sáng.',
      palette: pal(['#d4e4f2', 'Lông'], ['#8aa8c8', 'Bờm'], ['#bff0ff', 'Băng'], ['#6ae0ff', 'Mắt']), make: () => WOLF({ noRider: true, fur: '#d4e4f2', furD: '#8aa8c8', belly: '#f4faff', eye: '#6ae0ff', frost: true }) },
    { id: 'iceGolem', name: 'Người Băng', group: 'Quái', role: 'Băng Giá · khối băng sống', tiers: 1, scale: 1.35,
      desc: 'Khối băng xanh khổng lồ, nắm đấm tảng băng, tinh thể nhọn mọc trên vai và đầu, mắt trắng phát sáng. Đánh: nện hai tay.',
      palette: pal(['#9ad8f0', 'Băng'], ['#bfe8fa', 'Băng sáng'], ['#5aa0c8', 'Băng sẫm'], ['#d8f4ff', 'Tinh thể']),
      make: () => GOLEM({ body: '#9ad8f0', light: '#bfe8fa', dark: '#5aa0c8', crystal: '#d8f4ff', iris: '#e8ffff' }) },
    { id: 'imp', name: 'Quỷ Lửa', group: 'Quái', role: 'Núi Lửa · bay thành bầy', tiers: 1,
      desc: 'Quỷ đỏ tí hon tai dài, sừng nhỏ, tóc lửa, cánh dơi vỗ liên tục, đuôi nhọn, dao lửa.',
      palette: pal(['#d83a2a', 'Da'], ['#a82020', 'Cánh'], ['#ffb04a', 'Lửa'], ['#ffd23a', 'Mắt']), make: () => IMP() },
    { id: 'drake', name: 'Rồng Lửa', group: 'Quái', role: 'Núi Lửa · rồng bay', tiers: 1,
      desc: 'Rồng đỏ bay, bụng vàng, gai lưng sẫm, sừng ngà, cánh dơi lớn, đuôi mũi giáo. Đánh: vươn cổ há miệng phun lửa.',
      palette: pal(['#c8381e', 'Vảy'], ['#7a1a10', 'Gai / cánh'], ['#f2c068', 'Bụng'], ['#ffd23a', 'Mắt']), make: () => DRAKE() },
    { id: 'magmaGolem', name: 'Quái Magma', group: 'Quái', role: 'Núi Lửa · dung nham sống', tiers: 1, scale: 1.4,
      desc: 'Đá núi lửa đen nứt toác lộ dung nham cam phát sáng, sừng đá, nắm đấm khổng lồ.',
      palette: pal(['#4a3a3a', 'Đá'], ['#5a4a48', 'Đá sáng'], ['#ff7a2a', 'Dung nham'], ['#ffd23a', 'Mắt']),
      make: () => GOLEM({ body: '#4a3a3a', light: '#5a4a48', dark: '#2a2020', cracks: '#ff7a2a', horn: '#2a2020', iris: '#ffd23a' }) },
    { id: 'voidling', name: 'Quái Hỗn Mang', group: 'Quái', role: 'Cổng Hỗn Mang · kháng phép nhẹ', tiers: 1,
      desc: 'Sinh vật hư vô tím: tai dài, sừng nhỏ, vết nứt tím phát sáng, mắt hồng rực, dao tím.',
      palette: pal(['#6a4aa8', 'Da'], ['#2a1e4a', 'Áo'], ['#c880ff', 'Vết nứt'], ['#ff6aff', 'Mắt']),
      make: () => GOBLIN({ skin: '#6a4aa8', cloth: '#2a1e4a', eye: '#ff6aff', glow: true, horns: '#3a2a5a', aura: '#c880ff', cracks: '#c880ff', blade: '#c8a0ff' }) },
    { id: 'voidWalker', name: 'Kẻ Dẫn Lối Hư Vô', group: 'Quái', role: 'Cổng Hỗn Mang · giáp + kháng phép', tiers: 1,
      desc: 'Pháp sư hư vô: áo dài tím than nứt sáng, giáp ngực, mũ sừng, tóc đen dài, gậy cầu tím lơ lửng.',
      palette: pal(['#8a6ad8', 'Da'], ['#241640', 'Áo dài'], ['#5a3aa0', 'Viền'], ['#d890ff', 'Cầu phép']), make: () => VOIDWALKER() },
    { id: 'blackOrc', name: 'Hắc Orc', group: 'Quái', role: 'Giáp cực dày', tiers: 1, scale: 1.15,
      desc: 'Orc da xanh sẫm trong giáp đen gai, mũ sừng ngà, mắt đỏ rực, nanh dài, rìu hai lưỡi và khiên đầu lâu viền đỏ.',
      palette: pal(['#4a6040', 'Da'], ['#3a3a48', 'Giáp'], ['#8a1a1a', 'Vạt đỏ'], ['#ff2a1a', 'Mắt']), make: () => BLACKORC() },
    { id: 'troll', name: 'Troll Hang', group: 'Quái', role: 'Khổng lồ · tự hồi máu', tiers: 1, scale: 1.4,
      desc: 'Khổng lồ da xám xanh khom lưng, đầu nhỏ, mũi to, nanh lớn, chỏm tóc rêu, khố da, chuỳ gỗ đóng gai.',
      palette: pal(['#8aa0a8', 'Da'], ['#4a5a3a', 'Tóc'], ['#7a5a3a', 'Khố'], ['#8a5a32', 'Chuỳ']),
      make: () => TROLL({ skin: '#8aa0a8', cloth: '#7a5a3a', hair: '#4a5a3a', iris: '#ffc43a', boots: '#5a6a70' }) },
    { id: 'trollKing', name: 'Vua Troll Đá', group: 'Boss', role: 'Boss Núi Lửa · đập đất', tiers: 1, scale: 1.8,
      desc: 'Chúa tể vùng núi: troll xanh đá đội vương miện vàng, vai vàng gai, giáp ngực, áo choàng đỏ, ngọc lửa trên ngực, cột đá đai vàng. Kỹ năng: nện đất làm choáng.',
      palette: pal(['#7890a8', 'Da'], [GOLD, 'Vàng'], ['#5a1020', 'Áo choàng'], ['#ff6a2a', 'Ngọc lửa']),
      make: () => TROLL({ skin: '#7890a8', cloth: '#7a1a2a', chest: '#6a7e96', pauldron: GOLD, cape: '#5a1020', crown: true, glowEye: true, iris: '#ff5a2a', pillar: '#7a7480', emblem: '#ff6a2a', boots: '#4a5a6a' }) },
    { id: 'voidLord', name: 'Chúa Tể Hỗn Mang', group: 'Boss', role: 'Boss hư vô · choáng cả đội hình', tiers: 1, scale: 1.8,
      desc: 'Gã khổng lồ hư vô tím: sừng cong lớn, vai tím gai, vết nứt sáng khắp người, ngọc tím trên ngực, cột hư vô.',
      palette: pal(['#5a3a98', 'Da'], ['#b070ff', 'Vai'], ['#4a1a6a', 'Áo choàng'], ['#d890ff', 'Vết nứt']),
      make: () => TROLL({ skin: '#5a3a98', cloth: '#4a1a6a', chest: '#3a2268', pauldron: '#b070ff', cape: '#4a1a6a', horns: '#2a1a4a', glowEye: true, iris: '#ff5aff', pillar: '#6a4ab0', emblem: '#d070ff', cracks: '#d890ff', boots: '#2a1a4a' }) },
    { id: 'darkKnight', name: 'Kỵ Sĩ Hắc Ám', group: 'Boss', role: 'Boss giữa màn · 2 giai đoạn', tiers: 2, tierName: 'Giai đoạn', scale: 1.35,
      desc: 'Giáp đen kín người, không thấy mặt, mắt đỏ phát sáng sau khe mũ, áo choàng đen dài, kiếm đen khổng lồ có gai. Giai đoạn 2: áo choàng bay lên, kiếm rực đỏ. Kỹ năng: giơ kiếm triệu hồi bóng tối.',
      palette: pal(['#2c2a36', 'Giáp đen'], ['#5a2a3a', 'Viền'], ['#141018', 'Áo choàng'], ['#ff2a1a', 'Mắt / kiếm đỏ']),
      make: t => DARKKNIGHT(t >= 2) },
    { id: 'darkLord', name: 'Chúa Hắc Ám', group: 'Boss', role: 'Boss cuối · 3 giai đoạn', tiers: 3, tierName: 'Giai đoạn', scale: 1.8,
      desc: 'Khổng lồ, giáp đen, vương miện đen gắn ngọc đỏ, kiếm khổng lồ, khói bóng tối bốc sau lưng. Giai đoạn 3: toàn thân rực đỏ. Kỹ năng: cắm kiếm xuống đất.',
      palette: pal(['#26222e', 'Giáp'], ['#8a2a3a', 'Viền'], ['#4a1e22', 'Giáp G.Đ 3'], ['#ff4a2a', 'Rực đỏ'], ['#1a1024', 'Khói']),
      make: t => DARKKNIGHT(true, true, t >= 3) }
  ];

  /* Anime adventurers: deliberately authored silhouettes instead of a
   * proportional rescale of the old chibi primitive assemblies. */
  // Sculpted anime face. The front has cheek, orbital, muzzle and chin planes;
  // it is not a sphere with a flat eye sticker on top.
  function portraitSkull(R,female){
    const rings=[[-1.01,.08,.28],[-.91,.30,.48],[-.73,.53,.66],[-.51,.70,.79],[-.28,.88,.87],[0,.94,.87],[.24,.93,.85],[.49,.91,.77],[.73,.77,.57],[.94,.45,.30],[1.02,.04,.05]];
    const vertices=[],indices=[],segments=40;
    for(let j=0;j<rings.length;j++)for(let i=0;i<=segments;i++){
      const a=i/segments*TAU,[y,width,depth]=rings[j],front=Math.max(0,Math.cos(a));
      const cheek=Math.exp(-Math.pow((y+.27)/.24,2))*.045*Math.pow(front,3);
      const jaw=female?1:1.055;
      vertices.push(R*width*Math.sin(a)*(y<0?jaw:1),R*y,R*(depth*Math.cos(a)+cheek));
    }
    for(let j=0;j<rings.length-1;j++)for(let i=0;i<segments;i++){const a=j*(segments+1)+i,b=a+segments+1;indices.push(a,a+1,b,a+1,b+1,b);}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();return g;
  }
  // Closed tapered sweep with a curved centreline: pointed hair strands,
  // sculpted moustaches and fur follow their own direction and volume.
  function lockMesh(points,width,depth,color,texture){
    const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),frames=curve.computeFrenetFrames(20,false),p=[],idx=[];
    for(let j=0;j<=20;j++){
      const t=j/20,c=curve.getPointAt(t),r=Math.max(.0006,width*Math.pow(Math.sin(Math.PI*(.10+.90*t)),.72));
      for(let k=0;k<8;k++){const a=k/8*TAU,v=c.clone().addScaledVector(frames.normals[j],Math.cos(a)*r).addScaledVector(frames.binormals[j],Math.sin(a)*depth*r/width);p.push(v.x,v.y,v.z);}
    }
    for(let j=0;j<20;j++)for(let k=0;k<8;k++){const a=j*8+k,b=j*8+(k+1)%8;idx.push(a,b,a+8,b,b+8,a+8);}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setIndex(idx);g.computeVertexNormals();return part(g,color,{tex:texture===undefined?'hair.f':texture,ink:.0015});
  }
  function animeHair(head,R,color,long,dwarf){
    const cap=G.ball(R,1.025,1.05,.97,36),p=cap.attributes.position;
    // Clip the cap above the brows; no pumpkin-like full spherical helmet.
    for(let i=0;i<p.count;i++){const y=p.getY(i),a=Math.atan2(p.getX(i),p.getZ(i));if(y<0)p.setY(i,Math.max(y,R*(-.10-.60*(1-Math.cos(a))*.5)));}
    cap.computeVertexNormals();add(head,part(cap,color,{tex:'hair',ink:.002}),0,R*.10,-R*.10);
    const locks={};
    const norm=pts=>pts.map(p=>p.map(v=>v*R));
    // Asymmetric layered bangs: parting, swept tips, exposed eyes and brows.
    for(let i=0;i<7;i++){
      const x=(i-3)*.27,side=i<3?-1:1,tip=i===2?.23:i===3?.32:.15-Math.abs(i-3)*.035;
      const pts=[[x*.55,.91,.30],[x*.90,.62,.80],[x+side*.12,.20,.94],[x+side*.18,tip,.91]];
      add(head,lockMesh(norm(pts),R*(long?.16:.20),R*.065,color),0,0,0);
    }
    if(!long&&!dwarf)for(let i=0;i<8;i++){
      const a=i/8*TAU,x=Math.sin(a),z=Math.cos(a),y=.55+.16*Math.sin(i*1.7);
      add(head,lockMesh(norm([[x*.45,y,.10+z*.40],[x*.80,y+.45,z*.72],[x*1.08,y+.11,z*.88],[x*1.15,y-.12,z*.98]]),R*.17,R*.07,color),0,0,0);
    }
    for(const side of [-1,1]){
      const name=side<0?'hairR':'hairL',owner=locks[name]=node(name,head,side*R*.77,R*.20,0);
      for(let j=0;j<(long?3:2);j++)add(owner,lockMesh(norm([[side*.03,.45,.28],[side*.22,-.10,.32],[side*(.25+j*.10),long?-1.55:-.50,.12-j*.1],[side*(long?.42:.2),long?-3.15:-.72,-.08-j*.12]]),R*(long?.12:.09),R*.035,color),0,0,0);
    }
    if(long){
      const back=locks.hairBack=node('hairBack',head,0,R*.20,-R*.62);
      for(let j=0;j<7;j++){const x=(j-3)*.25;add(back,lockMesh(norm([[x*.5,.42,-.10],[x,-.70,-.33],[x*1.25,-1.8,-.49],[x*1.50,-4.15+Math.abs(j-4)*.18,-.42]]),R*.20,R*.075,color),0,0,0);}
    }
    if(dwarf){
      for(const side of [-1,1])add(head,lockMesh(norm([[side*.03,-.35,.85],[side*.40,-.29,1.02],[side*.69,-.37,.89],[side*.86,-.44,.7]]),R*.12,R*.07,color),0,0,0);
      for(let j=0;j<9;j++){const x=(j-4)*.15;add(head,lockMesh(norm([[x,-.48,.67],[x*1.2,-.87,.89],[x*.95,-1.35,.75],[x*.55,-1.82+Math.abs(j-4)*.14,.54]]),R*.14,R*.07,color),0,0,0);}
    }
    return locks;
  }
  function animeFace(head,R,female,iris){
    const eyes={},skin='#f3c6ac';
    for(const side of [-1,1]){
      const key=side<0?'eyeR':'eyeL',e=eyes[key]=node(key,head,side*R*.40,-R*.05,R*.91);e.rotation.y=side*.13;
      const w=R*(female?.53:.48),h=R*(female?.29:.25);
      const shape=new T.Shape();shape.moveTo(-w*.5,0);shape.quadraticCurveTo(-w*.15,h*.65,w*.5,h*.10);shape.quadraticCurveTo(w*.10,-h*.66,-w*.5,0);
      add(e,part(G.ext(shape,.008,.001),'#fcf5ed',{ink:false}),0,0,0);
      add(e,part(G.ball(h*.52,.83,1.1,.15,24),iris,{ink:false}),-side*w*.035,0,.010);
      add(e,part(G.ball(h*.30,.50,1.1,.15,20),'#132439',{ink:false}),-side*w*.035,0,.016);
      add(e,part(G.ball(h*.12,1,1,.2,12),'#fffef5',{ink:false}),-w*.08,h*.18,.021);
      add(e,part(G.tube([[-w*.5,0,.013],[-w*.18,h*.40,.013],[w*.19,h*.40,.013],[w*.5,h*.10,.013]],R*(female?.013:.010),18),'#3a2830',{ink:false}),0,0,0);
      add(e,part(G.tube([[-w*.43,-h*.08,.012],[0,-h*.27,.014],[w*.35,-h*.08,.012]],R*.0055,14),'#ad776a',{ink:false}),0,0,0);
      // Eyebrows have an arch and a tapered outside, instead of straight bars.
      add(head,lockMesh([[side*R*.18,R*.23,R*.81],[side*R*.36,R*.28,R*.84],[side*R*.59,R*.22,R*.74]],R*.045,R*.015,'#684535','hair.f'),0,0,0);
      const ear=node('ear',head,side*R*.92,-R*.09,0);
      add(ear,part(G.ball(R*.14,.65,1,.48,24),skin,{ink:false}),0,0,0);
      add(ear,part(G.ball(R*.08,.45,1,.35,18),'#d99d88',{ink:false}),0,0,R*.045);
    }
    // Nose bridge, tip, philtrum and subtle lips have depth and coherent scale.
    add(head,lockMesh([[0,R*.07,R*.85],[0,-R*.20,R*.93],[0,-R*.32,R*.96]],R*.030,R*.025,skin,''),0,0,0);
    add(head,part(G.ball(R*.055,1,.7,.7,20),'#edb49d',{ink:false}),0,-R*.30,R*.93);
    add(head,part(G.tube([[-R*.115,-R*.58,R*.83],[0,-R*.59,R*.86],[R*.11,-R*.565,R*.83]],R*.008,18),'#985b60',{ink:false}),0,0,0);
    add(head,part(G.ball(R*.075,1,.23,.16,18),'#e3a293',{ink:false}),0,-R*.63,R*.81);
    return eyes;
  }

  function drapedMantle(w,L,flare){
    const p=[],idx=[],rows=28,cols=22;
    for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){
      const t=j/rows,u=i/cols*2-1,fold=Math.cos(u*Math.PI*5+.18*Math.sin(t*4));
      p.push(u*w*.5*(1+flare*t),-L*t+.015*Math.sin(u*8)*t*t,-.045-.12*t*t+.018*fold*t+.045*(1-u*u));
    }
    for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const a=j*(cols+1)+i,b=a+cols+1;idx.push(a,b,a+1,a+1,b,b+1);}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setIndex(idx);g.computeVertexNormals();return g;
  }
  function costumeSculpt(n,o,{archer,caster,dwarf,cloth,trim,steel,tier}){
    const h=o.torsoH,w=o.torsoW*.5,front=o.torsoD*.57;
    if(archer){
      // Organic leaf cuirass and split green/ivory skirt panels from the reference.
      for(const side of [-1,1]){
        for(let j=0;j<4;j++){
          const leaf=G.ext([0,0,side*.04,.03,side*.12,-.07,side*.15,-.30,side*.035,-.25],.009,.002);
          add(n.torso,part(leaf,j%2?'#356d48':'#1d5b3d',{tex:'cloth',ds:true,ink:.001}),side*.025,.10-j*.022,front*.70,0,side*.27,side*(j*.14));
          add(n.torso,part(G.tube([[0,0,.007],[side*.065,-.10,.015],[side*.1,-.23,.014]],.003,14),trim,{metal:true,ink:false}),side*.025,.10-j*.022,front*.70,0,side*.27,side*(j*.14));
        }
        add(n.torso,part(G.ext([0,.03,side*.12,0,side*.14,-.42,side*.065,-.51],.007,.001),'#e1dcc4',{tex:'cloth',ds:true,ink:false}),side*.055,.055,-.035,0,0,side*.08);
        for(let j=0;j<3;j++)add(n['arm'+(side<0?'R':'L')],part(G.ext([0,.07,side*.12,.02,side*.17,-.09,side*.10,-.14,0,-.05],.009,.002),'#276c47',{ink:.001}),0,-j*.035,0,0,0,side*.18);
      }
      add(n.torso,part(G.oct(.035,1.2),'#6cab76',{glow:.15,ink:false}),0,h*.69,front+.027);
    }
    if(caster){
      // Separate flowing violet overskirt, ivory blouse and fitted corset.
      for(const side of [-1,1]){
        const panel=drapedMantle(.18,.64,.45);
        add(n.torso,part(panel,cloth,{tex:'cape',ds:true,ink:.001}),side*.145,.12,.03,0,side*.65,side*.1);
        add(n.torso,part(G.tube([[side*.075,h*.71,front],[side*.055,h*.53,front+.013],[side*.073,h*.35,front],[side*.09,.12,front*.90]],.004,22),trim,{metal:true,ink:false}),0,0,0);
        for(let j=0;j<3;j++)add(n.torso,part(G.tube([[side*.09,h*(.55-j*.04),front+.014],[-side*.05,h*(.51-j*.04),front+.015]],.002,5),trim,{ink:false}),0,0,0);
      }
      add(n.torso,part(G.ext([-.09,0,0,-.13,.09,0,.06,.1,-.06,.1],.012,.003),'#d8d4e6',{tex:'cloth',ink:false}),0,h*.82,front+.01);
      add(n.torso,part(G.oct(.025,1.2),'#ae6ddb',{glow:.2,ink:false}),0,h*.80,front+.026);
    }
    if(!caster&&!archer){
      // Overlapping plate segments with curved edges and narrow gold bindings.
      for(const side of [-1,1]){
        for(let j=0;j<2;j++){
          const pts=[[side*.03,.05,front],[side*w*.82,.03,front*.7],[side*w*.94,-.01,front*.6]];
          add(n.torso,part(G.tube(pts,.005,16),trim,{metal:true,ink:false}),0,h*(.39-j*.13),0);
        }
        for(let j=0;j<3;j++)add(n.torso,part(G.ext([0,.02,side*.13,.02,side*.15,-.07,side*.045,-.14,0,-.11],.020,.008),dwarf?'#42362f':steel,{metal:true,ink:.001}),side*.035,.08-j*.04,front*.8,0,side*.35,side*.12);
      }
    }
    if(n.shield){
      // Reference golden winged crest replaces the generic toy cross.
      n.shield.children.slice(2).forEach(c=>n.shield.remove(c));
      const crest=[0,.15,.034,.10,.09,.14,.073,.08,.14,.11,.094,.03,.16,.04,.075,-.015,.026,-.04,.018,-.13,0,-.17,-.018,-.13,-.026,-.04,-.075,-.015,-.16,.04,-.094,.03,-.14,.11,-.073,.08,-.09,.14,-.034,.10];
      add(n.shield,part(G.ext(crest,.013,.003),trim,{metal:true,ink:false}),0,0,.059);
      for(const side of [-1,1])for(let j=0;j<4;j++)add(n.shield,part(G.ball(.007),trim,{metal:true,ink:false}),side*(.17-j*.01),.17-j*.07,.054);
      n.shield.scale.set(1.02,1.18,1);
    }
    if(archer){
      const bow=n.handL.children.find(c=>c.name==='weapon');
      if(bow){bow.traverse(m=>{if(m.isMesh&&!m.material.userData.ink&&m.material.color){const hex=m.material.color.getHexString();if(hex==='947648')m.material=mat('#9b8c3b',{metal:true});}});}
    }
  }

  function ANIME(id, tier) {
    const archer = id === 'elf' || id === 'lyra', caster = id === 'mage' || id === 'selene';
    const dwarf = id === 'dwarf' || id === 'borin', female = archer || caster, hero = ['aldric','lyra','selene','borin'].includes(id);
    const cloth = id === 'aldric' || /^soldier/.test(id) ? '#245fc0' : id === 'lyra' ? '#2f6243' : id === 'selene' ? '#513979' : archer ? '#327b46' : caster ? '#7046b1' : dwarf ? '#584236' : '#76353b';
    const steel = dwarf ? '#343139' : '#c3cad4', trim = '#c99b42';
    const hair = id === 'aldric' ? '#70442d' : id === 'lyra' ? '#e8d18b' : caster ? '#8e6cbd' : archer ? '#dec489' : dwarf ? '#cd6427' : '#70442d';
    const o = {R:dwarf ? .28 : .275, torsoH:dwarf ? .48 : .56, torsoW:dwarf ? .65 : female ? .47 : .61, torsoD:dwarf ? .36 : .30,
      legL:dwarf ? .36 : .54, legR:dwarf ? .115 : .097, bootH:.125, armL:dwarf ? .46 : .51, armR:dwarf ? .105 : female ? .079 : .102,
      skin:'#f3c6ac',legs:archer ? '#303d35' : '#34333f',boots:'#302d34',sleeve:cloth,glove:caster||archer ? '#f3c6ac':'#48515e',neck:.76};
    const proportions = REAL.cur; REAL.cur = null;
    let rig; try { rig = humanoid(o); } finally { REAL.cur = proportions; }
    const n = rig.n, R = o.R;
    // Replace the generic base head and limb meshes. Named rig nodes remain
    // stable so existing battle animations and weapon attachments still work.
    for (const child of [...n.head.children]) n.head.remove(child);
    add(n.head,part(portraitSkull(R,female),o.skin,{sculpted:true,ink:.006}),0,0,0);
    Object.assign(n,animeFace(n.head,R,female,archer ? '#3f9164' : caster ? '#9561cd':'#3675ac'));
    Object.assign(n,animeHair(n.head,R,hair,female,dwarf));
    const w=o.torsoW/2, h=o.torsoH;
    add(n.torso,part(G.lathe([[0,h],[w*.73,h],[w,h*.84],[w*.91,h*.56],[w*.68,h*.29],[w*.76,.05],[w*.85,-.07],[0,-.07]],20,o.torsoD/o.torsoW),cloth,{tex:'cloth',ink:.009}),0,0,0);
    if (!caster) {
      // Fitted breastplate with sloping clavicles and waist, rather than a box.
      const plate=G.lathe([[0,h*.93],[w*.64,h*.93],[w*1.02,h*.79],[w*1.08,h*.63],[w*.92,h*.47],[w*.77,h*.22],[w*.72,.11],[0,.11]],24,o.torsoD/o.torsoW*1.08);
      add(n.torso,part(plate,archer?'#237347':steel,{metal:!archer,ink:.007}),0,0,0);
      add(n.torso,part(G.sbox(.026,h*.63,.012,.65),trim,{metal:true,ink:false}),0,h*.49,o.torsoD*.59);
      for (const side of [-1, 1]) add(n.torso,new T.Mesh(G.tube([[0,h*.60,o.torsoD*.56],[side*w*.36,h*.67,o.torsoD*.54],[side*w*.70,h*.75,o.torsoD*.42]],.005,8),mat(trim)),0,0,0);
    } else {
      add(n.torso,part(G.lathe([[0,.22],[w*.76,.22],[w*.92,0],[w*1.34,-.28],[w*1.6,-.55],[0,-.55]],22,.76),cloth,{tex:'cloth',ink:.009}),0,0,0);
      for(const side of [-1,1]) add(n.torso,part(G.ext([side*.01,.5,side*.045,.5,side*.12,-.52,side*.075,-.52],.012,.003),trim,{ink:false}),0,0,.17, -.12);
    }
    add(n.torso,part(G.cyl(w*.83,w*.83,.045,20).scale(1,1,o.torsoD/o.torsoW), '#44312c',{ink:.007}),0,.11,0);
    add(n.torso,part(G.sbox(.066,.047,.017,.4),trim,{metal:true,ink:.004}),0,.11,o.torsoD*.51);
    // Collar, cape clasp and split cloth skirt establish layered clothing.
    add(n.torso,part(G.torus(w*.58,.014).rotateX(Math.PI/2).scale(1,1,.7),trim,{metal:true,ink:.004}),0,h*.94,0);
    n.cape=node('cape',n.torso,0,h*.88,-o.torsoD*.45);
    add(n.cape,part(drapedMantle(o.torsoW*1.20,caster?1.02:archer?.74:.92,.65),caster?'#514088':archer?'#527d46':dwarf?'#583c2b':'#2256a5',{tex:'cape',ds:true,ink:.001}),0,0,0);
    if(!caster) for(const side of [-1,1]) add(n.torso,part(G.ext([0,0,side*.13,0,side*.15,-.24,side*.025,-.20],.012,.004),cloth,{tex:'cloth',ink:.006}),side*.015,.045,o.torsoD*.5);
    for(const [side,k] of [[-1,'R'],[1,'L']]) {
      const arm=n['arm'+k], leg=n['leg'+k];
      for(const child of [...arm.children]) arm.remove(child);
      add(arm,part(limb(o.armR,o.armL*.5),archer?o.skin:cloth,{tex:archer?'':'cloth',ink:.002}),0,-o.armL*.25,0);
      const elbow=n['elbow'+k]=node('elbow'+k,arm,0,-o.armL*.5,0); elbow.rotation.x=-.15;
      add(elbow,part(limb(o.armR*.82,o.armL*.5),caster||archer?o.skin:steel,{metal:!female,ink:.006}),0,-o.armL*.25,0);
      n['hand'+k]=node('hand'+k,elbow,0,-o.armL*.5,0);
      const hand=n['hand'+k];
      add(hand,part(G.ball(.038,.87,1,.62,16),o.glove,{ink:.002}),0,-.023,0);
      // Four curled digits and an opposed thumb retain the weapon grip pivot.
      for(let f=0;f<4;f++) {
        const finger=node('finger'+k+f,hand,(f-1.5)*.015,-.045,.004);
        const length=.029+(f===1||f===2?.009:0);
        add(finger,part(G.cap(.0065,length),o.glove,{ink:false}),0,-length*.42,.004,-.22);
        add(finger,part(G.cap(.0058,.019),o.glove,{ink:false}),0,-length-.004,.011,-.8);
      }
      add(hand,part(G.cap(.009,.035),o.glove,{ink:false}),side*.033,-.023,.012,-.5,0,side*.55);
      for(const digit of hand.children){digit.scale.multiplyScalar(1.35);digit.position.multiplyScalar(1.35);}
      add(elbow,part(G.ball(o.armR*.83,1,.8,.92,16),caster||archer?o.skin:steel,{ink:.003}),0,0,0);
      add(elbow,part(G.cyl(o.armR*.64,o.armR*.72,.035,16),trim,{metal:true,ink:.002}),0,-o.armL*.45,0);
      if(!caster) {
        const r=o.armR,edge=[[-r*1.1,0],[-r*.65,r*.75],[r*.20,r*.9],[r*1.55,r*.4],[r*1.72,-r*.35],[r*.7,-r*.72],[-r*.8,-r*.40]];
        const shoulder=G.ext(edge.flat(),r*1.75,.009);
        add(arm,part(shoulder,archer?'#2d6c47':dwarf?'#343239':cloth,{metal:!archer,ink:.0015}),side*.022,.012,0,0,0,-side*.20);
        const rimPts=edge.concat([edge[0]]).map(([x,y])=>[x,y,r*.9]);
        add(arm,part(G.tube(rimPts,.004,28),trim,{metal:true,ink:false}),side*.022,.012,0,0,0,-side*.20);
        add(arm,part(G.cyl(o.armR*1.05,o.armR*1.05,.024,12),trim,{metal:true,ink:.003}),0,-o.armL*.36,0);
      }
      for(const child of [...leg.children]) leg.remove(child);
      const thigh=o.legL*.52, calf=o.legL-thigh;
      add(leg,part(limb(o.legR,thigh),o.legs,{tex:'cloth',ink:.004}),0,-thigh*.5,0);
      const knee=n['knee'+k]=node('knee'+k,leg,0,-thigh,0);
      add(knee,part(G.ball(o.legR*.74,1,.85,.9,16),caster?cloth:steel,{ink:.003}),0,0,0);
      add(knee,part(limb(o.legR*.77,calf),o.boots,{ink:.004}),0,-calf*.5,0);
      add(knee,part(G.ball(o.legR,1.20,.65,2.1,18),o.boots,{ink:.003}),0,-calf+.018,o.legR*.53);
      add(knee,part(G.cyl(o.legR*.80,o.legR*.80,.018,16),trim,{metal:true,ink:false}),0,-calf*.12,0);
      if(!caster){
        add(knee,part(G.lathe([[0,.02],[o.legR*.77,.02],[o.legR*.96,-calf*.12],[o.legR*.74,-calf*.65],[o.legR*.62,-calf*.86],[0,-calf*.86]],20,.7),archer?'#325844':steel,{metal:!archer,ink:.003}),0,0,.014);
        for(const side of [-1,1])add(knee,new T.Mesh(G.tube([[side*o.legR*.63,-.02,o.legR*.67],[side*o.legR*.57,-calf*.4,o.legR*.68],[side*o.legR*.39,-calf*.77,o.legR*.56]],.004,12),mat(trim,{metal:true})),0,0,0);
      }

    }
    if(caster) {
      // Narrow crown and flowing pointed hat; no enormous toy brim.
      const hat=node('hat',n.head,0,R*.72,-R*.10);
      add(hat,part(G.cyl(R*2.0,R*2.05,.025,32),cloth,{tex:'cloth',ink:.007}),0,0,0);
      add(hat,part(G.bentCone(R*1.10,R*2.8,1.0),cloth,{tex:'cloth',ink:.008}),0,.015,0);
      add(hat,part(G.cyl(R*.77,R*.82,.035,20),trim,{metal:true,ink:.004}),0,.046,0);
      n.staff=WEAP.staff(id==='selene'?'#92c8dd':'#aaa1e0',tier,n);add(n.handR,n.staff,0,0,0,.45,0,.28);
    } else if(archer) {
      for(const side of [-1,1]) add(n.head,part(G.ext([0,.02,side*.11,.085,side*.035,-.045],.025,.004),o.skin,{ink:.004}),side*R*.91,0,-.012,0,side*.3);
      quiver(n,o,'#c7ad74');const bow=WEAP.bow(tier,n,{wood:'#b6a550'});bow.scale.setScalar(1.12);add(n.handL,bow,0,0,.08);
    } else if(dwarf) {
      // Reference identity: orange braided beard, blue goggles, portable cannon.
      for(const side of [-1,1]) {
        const goggles=node('goggle',n.head,side*R*.43,R*.74,R*.70);
        add(goggles,part(G.torus(R*.25,R*.065),trim,{metal:true,ink:.002}),0,0,0);
        add(goggles,part(G.cyl(R*.19,R*.19,.025,20).rotateX(Math.PI/2),'#327c9a',{metal:true,ink:false}),0,0,.008);
        for(let j=0;j<6;j++)add(n.head,part(G.ball(.034,.9,1.2,.75),hair,{tex:'hair',ink:.001}),side*.075,-R*.72-j*.034,R*.70+.008*Math.sin(j));
        add(n.head,part(G.cyl(.038,.038,.035,16),trim,{metal:true,ink:false}),side*.075,-R*.72-.18,R*.70);
      }
      const cannon=node('weapon',n.handR,0,0,0);cannon.rotation.x=1.1;
      add(cannon,part(G.cyl(.14,.17,.66,24).rotateX(Math.PI/2),'#343238',{metal:true,ink:.003}),0,.12,.22);
      add(cannon,part(G.cyl(.028,.028,.14,16),'#49392a',{ink:.001}),0,-.015,0);
      for(const z of [-.08,.10,.32,.54])add(cannon,part(G.torus(.15,.022),trim,{metal:true,ink:false}),0,.12,z);
      add(cannon,part(G.cyl(.108,.108,.012,24).rotateX(Math.PI/2),'#211918',{ink:false}),0,.12,.556);
      add(cannon,part(G.cyl(.077,.077,.014,24).rotateX(Math.PI/2),'#ffb542',{glow:1.3,ink:false}),0,.12,.565);
      for(let j=0;j<8;j++){const a=j/8*TAU;add(cannon,part(G.ball(.012),trim,{metal:true,ink:false}),Math.sin(a)*.13,.12+Math.cos(a)*.13,.54);}
    } else {
      add(n.handR,WEAP.sword(hero?.74:.65,hero?.145:.125,'#bac8d5',trim,{core:hero?'#9ac2dd':null,grip:'#40343a'}),0,0,0,1.15);
      const shield=id==='aldric'||/^soldier/.test(id);if(shield){n.shield=WEAP.shield(['#7a5a3a','#76353b','#355477','#665183','#ae8549'][+id.slice(-1)]||cloth,tier,trim);add(n.handL,n.shield,.045,.10,.03,0,.35);}
    }
    if(hero){
      const front=o.torsoD*.60;
      for(const side of [-1,1]){
        const path=[[side*w*.1,h*.77,front],[side*w*.34,h*.72,front+.008],[side*w*.52,h*.59,front],[side*w*.38,h*.48,front],[side*w*.13,h*.51,front]];
        add(n.torso,new T.Mesh(G.tube(path,.0048,18),mat(trim,{metal:true})),0,0,0);
        for(let i=0;i<3;i++)add(n.torso,part(G.ball(.008,1,1,.55,12),trim,{metal:true,ink:false}),side*w*(.55+i*.14),h*(.79-i*.15),front-.006);
        add(n.torso,part(G.ext([0,0,side*.055,-.035,side*.045,-.13,side*.015,-.17,0,-.11],.013,.005),trim,{metal:true,ink:.002}),side*w*.81,h*.83,front*.78);
      }
      for(const k of ['R','L']){
        const fore=n['elbow'+k];
        for(let j=0;j<3;j++)add(fore,part(G.cyl(o.armR*.86,o.armR*.92,.033,18).scale(1,1,.85),caster||archer?cloth:steel,{metal:!caster&&!archer,ink:.002}),0,-o.armL*(.26+j*.07),0);
      }
    }
    if(hero||tier>=3) add(n.torso,part(G.oct(.025,1.25).scale(1,1,.4),archer?'#8cb89c':caster?'#aba3d7':'#aa665f',{ink:.003}),0,h*.79,o.torsoD*.57);
    // Master reference motifs, built as geometry rather than painted billboards.
    if(archer){
      for(const side of [-1,1])for(let j=0;j<3;j++)add(n.head,part(G.ext([0,0,.028,.026,.012,.075,-.009,.034],.006,.001),'#588b40',{tex:'leaf',ds:true,ink:false}),side*R*.87,R*.5+j*.018,0,0,side*.6,side*(.6+j*.3));
      add(n.head,part(G.ball(.016), '#f8e9c0',{ink:false}),-R*.82,R*.58,.06);
      for(const side of [-1,1])for(let j=0;j<3;j++)add(n.torso,part(G.ext([0,0,side*.07,-.06,side*.1,-.22,side*.035,-.18],.007,.001),'#2b7046',{tex:'cloth',ds:true,ink:false}),side*.06,.09-j*.04,.13,0,0,side*.14);
    }
    if(caster){
      const hat=n.head.getObjectByName('hat');
      for(let j=0;j<7;j++)add(hat,part(G.ext([0,.018,.006,.006,.02,0,.006,-.006,0,-.018,-.006,-.006,-.02,0,-.006,.006],.003,0),trim,{metal:true,ink:false}),Math.sin(j*2.4)*R*.7,R*(.45+j*.18),R*.75*(1-j*.09));
      for(const side of [-1,1])add(n.staff,part(G.oct(.07,2.0),'#9561ed',{glow:.65,ink:false}),side*.12,.76,0,0,0,side*.35);
    }
    if(!female&&!dwarf){
      // Broad blue mantle and silver breastplate with the reference golden star.
      const star=[];for(let j=0;j<10;j++){const a=j*Math.PI/5,r=j%2?.023:.06;star.push(Math.sin(a)*r,Math.cos(a)*r);}
      add(n.torso,part(G.ext(star,.009,.002),trim,{metal:true,ink:false}),0,h*.72,o.torsoD*.60);
      for(const side of [-1,1])for(let j=0;j<3;j++)add(n['arm'+(side<0?'R':'L')],part(G.ext([0,0,side*.12,.03,side*.09,-.035,side*.015,-.08],.012,.002),cloth,{metal:true,ink:.002}),side*.012,-j*.037,0);
    }
    if(caster){
      const hat=n.head.getObjectByName('hat');
      add(hat,part(G.cyl(R*.97,R*1.02,.085,28),'#6b452d',{tex:'cloth',ink:.001}),0,.10,0);
      add(hat,part(G.ext([-.06,-.025,.06,-.025,.06,.025,-.06,.025],.014,.003),trim,{metal:true,ink:false}),0,.10,R*1.025);
      for(const side of [-1,1])add(n.staff,part(G.tube([[side*.04,.67,0],[side*.14,.79,0],[side*.13,.99,0],[side*.05,1.09,0]],.012,24),trim,{metal:true,ink:false}),0,0,0);
      if(n.gem){n.gem.children.filter(c=>c.isMesh).forEach(m=>{if(!m.userData.hull)m.material=mat('#9c62ed',{glow:.75});});}
    }
    if(dwarf){
      for(const side of [-1,1])add(n.head,lockMesh([[side*R*.14,R*.15,R*.93],[side*R*.40,R*.24,R*.94],[side*R*.64,R*.21,R*.79]],R*.045,R*.023,hair),0,0,0);
      add(n.head,part(G.ball(R*.15,1,.7,.6,24),'#e1a783',{ink:false}),0,-R*.25,R*.98);
    }
    costumeSculpt(n,o,{archer,caster,dwarf,cloth,trim,steel,tier});
    rig.extra = (t, dur, name) => {
      const cycle = S(t * TAU), strike = name === 'attack' || name === 'skill', blink=name==='idle'?1-.94*Math.exp(-Math.pow((t-.78)/.025,2)):1;
      return {...(dwarf&&name!=='die'?{armR:{rx:-.62-(strike?.08*Math.sin(t*Math.PI):0)},armL:{rx:-.65,rz:-1.05}}:{}),hairR:{rz:cycle*.035,rx:cycle*.035},hairL:{rz:-cycle*.035,rx:-cycle*.035},hairBack:{rx:cycle*.04,rz:cycle*.02},eyeR:{sy:blink},eyeL:{sy:blink}, elbowR: { rx: archer && strike ? -1.25 : strike ? -.45 * Math.sin(t * Math.PI) : -.12 + cycle * .035 },
        elbowL: { rx: archer ? -.08 : dwarf && strike ? -.5 * Math.sin(t * Math.PI) : -.18 + cycle * .025 },
        kneeR: {rx: name==='walk'?Math.pow(Math.max(0,-cycle),1.5)*1.05: strike?.18*Math.sin(t*Math.PI):.035},
        kneeL: {rx: name==='walk'?Math.pow(Math.max(0,cycle),1.5)*1.05: strike?.12*Math.sin(t*Math.PI):.035} };
    };
    return {rig,anim:{kind:caster?'staff':archer?'bow':dwarf?'fist':'melee',shield:!!n.shield,skill:caster?'meteor':archer?'triple':dwarf?'slam':n.shield?'block':'holy'}};
  }

  function ANIME_ENEMY(id, tier) {
    const made = ANIME('soldier', tier), n = made.rig.n, o = made.rig.o;
    if (id === 'bandit') {
      for (const child of [...n.head.children]) n.head.remove(child);
      add(n.head, part(skull(o.R), '#d6a783', { sculpted:true, ink:.006 }),0,0,0);
      Object.assign(n,animeFace(n.head,o.R,false,'#5a413a')); Object.assign(n,animeHair(n.head,o.R,'#302329',false,false));
      add(n.head,part(G.torus(o.R*.98,.018).rotateX(Math.PI/2),'#c6bba4',{ink:.004}),0,.07,0,-.08);
      if(n.shield){n.shield.removeFromParent();delete n.shield;}
      n.torso.traverse(m=>{if(m.isMesh&&!m.userData.hull&&m.material.userData.tex){const tex=m.material.userData.tex;if(tex==='cape')m.material=mat('#8b3432',{tex:'cape',ds:true});else if(tex==='cloth')m.material=mat('#67503b',{tex:'cloth'});}});
      made.anim.shield=false;made.anim.skill=null; return made;
    }
    const armor=id==='deathKnight'?'#36364e':tier>=3?'#532e39':'#31313f';
    const rim=id==='deathKnight'?'#b79751':'#745493', eye=id==='deathKnight'?'#d0aa54':'#ad5cf0';
    for(const ch of [...n.head.children]) n.head.remove(ch);delete n.eyeR;delete n.eyeL;delete n.hairR;delete n.hairL;delete n.hairBack;
    const R=o.R;
    add(n.head,part(G.lathe([[0,-R],[R*.68,-R],[R*.95,-R*.40],[R,R*.42],[R*.72,R*.91],[0,R*1.10]],16,.87),armor,{metal:true,ink:.009}),0,0,0);
    for(const side of [-1,1]) {
      add(n.head,part(G.ext([side*.008,.025,side*.14,.045,side*.14,.012,side*.018,-.004],.008,0),'#100f1b',{ink:false}),0,0,R*.91);
      add(n.head,new T.Mesh(G.sbox(.070,.011,.006,.7),mat(eye,{glow:.7})),side*.060,.021,R*.96);
      add(n.head,part(G.ext([0,0,side*.07,.08,side*.04,-.13,0,-.17],.024,.006),armor,{metal:true,ink:.004}),side*R*.64,-.016,R*.69);
    }
    add(n.head,part(G.sbox(.018,.22,.026,.6),rim,{metal:true,ink:.003}),0,.01,R*.93);
    if(id!=='deathKnight') for(const side of [-1,1]) add(n.head,part(G.tube([[side*R*.72,R*.65,0],[side*R*1.12,R*1.08,-.04],[side*R*1.02,R*1.65,-.13]],.024,12),rim,{ink:.005}),0,0,0);
    // Tint each material once; shared material instances are never mutated.
    const cache=new Map();
    for(const owner of [n.torso,n.armR,n.armL,n.legR,n.legL]) owner.traverse(mesh=>{
      if(!mesh.isMesh||mesh.material.userData.ink||mesh.parent===n.head)return;
      const old=mesh.material;if(!cache.has(old)){const m=mat(old.userData.metal?armor:/cloth|cape/.test(old.userData.tex)?'#352b3b':'#49414b',{metal:old.userData.metal,tex:old.userData.tex,glow:old.userData.glow});cache.set(old,m);} mesh.material=cache.get(old);
    });
    n.handR.children.slice().filter(ch=>ch.name==='weapon').forEach(ch=>n.handR.remove(ch));
    add(n.handR,WEAP.sword(id==='darkLord'?1.02:.86,.12,'#687083',rim,{core:eye,grip:'#30232c'}),0,0,0,1.15);
    made.anim.heavy=true;made.anim.still=id!=='darkLord';made.anim.skill=id==='darkLord'?'slam':id==='darkKnight'?'summon':null;
    return made;
  }

  function sculptCreature(rig,id){
    const {n,o}=rig,R=o.R||.3;
    if((id==='orc'||id==='blackOrc'||id==='goblin')&&n.head&&n.torso){
      // A continuous chest/waist silhouette replaces the old rectangular body.
      for(const m of [...n.torso.children])if(m.isMesh&&m.material.color&&m.material.color.equals(new T.Color(o.skin))){m.geometry.computeBoundingBox();if(m.geometry.boundingBox.max.x-m.geometry.boundingBox.min.x>o.torsoW*.70)n.torso.remove(m);}
      const w=o.torsoW*.5,h=o.torsoH;
      add(n.torso,part(G.lathe([[0,0],[w*.64,0],[w*.80,h*.18],[w*.99,h*.51],[w*1.08,h*.78],[w*.78,h],[0,h]],32,o.torsoD/o.torsoW),o.skin,{ink:.002}),0,0,0);
      // Remove the old solid fur collar that intersects the entire lower face.
      for(const m of [...n.torso.children])if(m.isMesh&&m.material.color&&['#8a8a92','#f2f0e8'].some(c=>m.material.color.equals(new T.Color(c))))n.torso.remove(m);
      for(const side of [-1,1]){const arm=n['arm'+(side<0?'R':'L')];for(const m of [...arm.children])if(m.isMesh&&m.geometry.type==='SphereGeometry'){m.geometry.computeBoundingBox();if(m.geometry.boundingBox.max.x-m.geometry.boundingBox.min.x>.30)arm.remove(m);}
        add(arm,part(G.ext([-.12,.03,-.08,.10,.09,.10,.19,.01,.12,-.07,-.09,-.04],.15,.008),'#4b4642',{metal:true,ink:.002}),0,0,0);
      }
      n.head.children.slice().forEach(m=>n.head.remove(m));
      const faceGeo=portraitSkull(R,false);if(id!=='goblin')faceGeo.scale(1.10,.88,1.10);
      add(n.head,part(faceGeo,o.skin,{ink:.002}),0,0,0);
      for(const side of [-1,1]){
        const eye=node('monster-eye',n.head,side*R*.42,-R*.03,R*(id==='goblin'?.88:1.01));
        add(eye,part(G.ball(R*.15,1.1,.48,.18,22),'#f1ddb1',{ink:false}),0,0,0);
        add(eye,part(G.ball(R*.077,.65,1,.18,18),'#ca9c39',{ink:false}),0,0,R*.026);
        add(eye,part(G.ball(R*.040,.40,1,.16,14),'#252019',{ink:false}),0,0,R*.043);
        add(n.head,lockMesh([[side*R*.18,R*.19,R*.89],[side*R*.39,R*.26,R*.91],[side*R*.65,R*.23,R*.78]],R*.07,R*.024,id==='goblin'?'#3e5831':'#39492c',''),0,0,0);
        add(n.head,part(G.ext([0,0,side*R*.42,R*.20,side*R*.19,-R*.23],R*.07,.003),o.skin,{ink:.001}),side*R*.89,R*.05,-R*.08,0,side*.18);
        add(n.head,lockMesh([[side*R*.10,-R*.23,R*.88],[side*R*.26,-R*.27,R*.98],[side*R*.38,-R*.45,R*.88]],R*.095,R*.05,o.skin,''),0,0,0);
      }
      add(n.head,lockMesh([[0,R*.15,R*.84],[0,-R*.16,R*1.0],[0,-R*.31,R*1.13]],R*.13,R*.055,o.skin,''),0,0,0);
      add(n.head,part(G.ball(R*.26,1,.38,.16,22),'#3a2722',{ink:false}),0,-R*.56,R*.87);
      for(let j=0;j<6;j++)add(n.head,part(G.sbox(R*.045,R*.08,R*.04,.65),'#e5d3ad',{ink:false}),(j-2.5)*R*.065,-R*.54,R*.91);
      for(const side of [-1,1])add(n.head,lockMesh([[side*R*.25,-R*.65,R*.83],[side*R*.31,-R*.49,R*1.01],[side*R*.33,-R*.24,R*.99]],R*(id==='goblin'?.035:.065),R*.045,'#dfd4b4',''),0,0,0);
      if(id!=='goblin')warriorHair(n.head,R);
      else{
        add(n.head,part(new T.SphereGeometry(R*1.04,24,14,0,TAU,0,Math.PI*.48).scale(1,.60,1),'#584329',{tex:'cloth',ink:.002}),0,R*.54,-R*.10);
        add(n.torso,part(drapedMantle(o.torsoW,.34,.25),'#8f3030',{tex:'cape',ds:true,ink:.001}),0,h*.87,-o.torsoD*.51);
      }
    }
    if(n.wolf&&n.wHead){
      // Layered directional mane and cheek fur, preserving four paws and jaw.
      for(let j=0;j<28;j++){
        const a=j*2.399,x=Math.sin(a)*.20,z=Math.cos(a)*.12-.13,y=.09+(j%4)*.035;
        add(n.wHead,lockMesh([[x*.7,y,z],[x,y-.09,z-.04],[x*1.25,y-.20,z-.11]],.035,.018,j%3?'#61616c':'#c5c0b8','fur'),0,0,0);
      }
    }
    if(id==='drake'&&n.body){
      // Overlapping scale plates run along the existing dragon torso.
      for(let row=0;row<10;row++)for(let col=0;col<7;col++){
        const a=(col-3)*.30,x=Math.sin(a)*.24,y=Math.cos(a)*.19,z=.35-row*.07;
        add(n.body,part(G.ext([0,.026,.025,0,0,-.030,-.025,0],.006,.001),row%2?'#a73f2b':'#bb4b2c',{metal:true,ink:false}),x,y,z,Math.PI/2,0,-a);
      }
    }
  }

  function warriorHair(head,R){
    add(head,part(new T.SphereGeometry(R*1.025,24,16,0,TAU,0,Math.PI*.40).scale(1,1,.94),'#252622',{tex:'hair',ink:.001}),0,R*.16,-R*.14);
    for(let j=0;j<9;j++){
      const x=(j-4)*R*.16;
      add(head,lockMesh([[x,R*.67,R*.72],[x*.95,R*1.30,R*.05],[x*.80,R*1.30,-R*.62],[x*.65,R*.92,-R*1.33]],R*.095,R*.045,'#252622'),0,0,0);
    }
    for(const side of [-1,1])add(head,lockMesh([[side*R*.85,R*.50,0],[side*R*.92,R*.17,-R*.10],[side*R*.88,-R*.14,-R*.16]],R*.08,R*.022,'#252622'),0,0,0);
  }
  function atelierSpecies(rig,id){
    const {n,o}=rig;
    if(n.wHead&&n.wolf){
      const snow=id==='frostWolf',coat=snow?'#d5dce1':'#686773',mane=snow?'#edf1ee':'#b7b5b6';
      for(const m of n.wHead.children)if(m.isMesh&&m.material.userData.glow&&m.position.z>.1)m.position.z=.27;
      // Tapered muzzle and visible lower jaw, keeping the same wolf anatomy.
      for(const m of [...n.wHead.children])if(m.isMesh&&m.geometry.type==='SphereGeometry'){
        m.geometry.computeBoundingBox();const b=m.geometry.boundingBox;
        if(b.max.z-b.min.z>.25&&m.position.z>.1){m.geometry.dispose();m.geometry=G.lathe([[0,-.16],[.075,-.16],[.11,-.07],[.09,.12],[.035,.19],[0,.20]],24,.73).rotateX(Math.PI/2);m.material=mat(coat,{tex:'fur'});m.children.filter(c=>c.userData.hull).forEach(c=>m.remove(c));}
      }
      for(const side of [-1,1]){
        add(n.wHead,lockMesh([[side*.10,.06,.21],[side*.16,.08,.22],[side*.22,.045,.13]],.022,.012,coat,'fur'),0,0,0);
        for(let j=0;j<10;j++)add(n.wHead,lockMesh([[side*.12,.10-j*.022,-.07],[side*(.22+j*.007),-.03-j*.025,-.13],[side*(.24+j*.007),-.16-j*.023,-.22]],.034,.014,j%3?coat:mane,'fur'),0,0,0);
      }
      for(const key of ['wFL','wFR','wBL','wBR']){
        const leg=n[key];if(!leg)continue;leg.children.slice().forEach(m=>leg.remove(m));
        add(leg,part(limb(.10,.25),coat,{tex:'fur',ink:.001}),0,-.14,0,.25);
        const joint=n[key+'Knee']=node(key+'Knee',leg,0,-.25,-.035);
        add(joint,part(limb(.055,.28),coat,{tex:'fur',ink:.001}),0,-.13,.015,-.12);
        add(joint,part(G.ball(.080,1,.55,1.35,20),coat,{tex:'fur',ink:.001}),0,-.29,.06);
        for(let j=0;j<3;j++)add(joint,part(G.cone(.012,.045).rotateX(Math.PI/2),'#d5d0c2',{ink:false}),(j-1)*.042,-.30,.145);
      }
      rig.extra=(t,dur,name)=>Object.fromEntries(['wFL','wFR','wBL','wBR'].map((k,j)=>[k+'Knee',{rx:name==='walk'?Math.max(0,Math.sin(t*TAU+(j%2?Math.PI:0)))*.6:.08}]));
      if(n.rHead){
        for(const m of [...n.rHead.children])if(m.isMesh&&m.material.color&&(m.material.color.equals(new T.Color('#8a8e98'))||m.material.color.equals(new T.Color('#c8302a'))))n.rHead.remove(m);
        warriorHair(n.rHead,.30);
        for(const side of [-1,1])for(let j=0;j<10;j++)add(n.rider,lockMesh([[side*.18,.40,-.04],[side*.26,.35,-.08],[side*.31,.22,-.11]],.035,.012,j%2?'#d6d0c2':'#aba59d','fur'),0,-j*.007,j*.013);
        for(const m of [...n.rArm.children])if(m.name==='weapon')n.rArm.remove(m);
        add(n.rArm,WEAP.axe('#746b60',true),0,-.30,0,1.15);
      }
    }
    if(/^treant/.test(id)&&n.head){
      for(const m of [...n.head.children])if(m.isMesh&&m.material.color&&['#4f9a3a','#6ab84a'].some(c=>m.material.color.equals(new T.Color(c))))n.head.remove(m);
      for(const side of [-1,1])add(n.head,part(G.tube([[side*.12,.18,-.12],[side*.22,.42,-.15],[side*.31,.60,-.10],[side*.26,.76,-.06]],.035,24),'#6c5433',{tex:'bark',ink:.001}),0,0,0);
      for(let j=0;j<44;j++){
        const a=j*2.399,x=Math.sin(a)*(.24+.03*(j%3)),y=.32+(j%7)*.051,z=-.12+Math.cos(a)*.22;
        add(n.head,part(G.ext([0,-.018,.035,.022,.018,.086,-.027,.035],.003,.001),j%3?'#50783b':'#789244',{tex:'leaf',ds:true,ink:false}),x,y,z,.4*Math.sin(a),a,.6*Math.cos(a));
      }
    }
    if(/Golem|magmaLord/.test(id))rig.root.traverse(m=>{
      if(!m.isMesh||m.userData.hull||m.material.userData.glow||m.material.userData.metal||m.geometry.type!=='SphereGeometry')return;
      m.geometry.computeBoundingBox();const size=m.geometry.boundingBox.getSize(new T.Vector3());if(Math.max(size.x,size.y,size.z)<.18)return;
      const g=new T.IcosahedronGeometry(1,2),p=g.attributes.position;
      for(let j=0;j<p.count;j++){const x=p.getX(j),y=p.getY(j),z=p.getZ(j),v=1+.07*Math.sin(x*11+y*9+z*13);p.setXYZ(j,x*size.x*.5*v,y*size.y*.5*v,z*size.z*.5*v);}
      g.computeVertexNormals();m.geometry.dispose();m.geometry=g;m.material=mat(m.material.color.getStyle(),{tex:'rock'});m.children.filter(c=>c.userData.hull).forEach(c=>m.remove(c));
    });
    if(id==='drake'&&n.neck){
      for(let j=0;j<6;j++)for(const side of [-1,1])add(n.neck,part(G.ext([0,.016,.025,0,0,-.026,-.02,0],.004,.001),j%2?'#a73520':'#cb502c',{ink:false}),side*.088,.04+j*.042,.069,0,side*.65);
      for(const side of [-1,1])add(n.dHead,part(G.tube([[side*.07,.08,.14],[side*.14,.12,.08],[side*.18,.06,-.02]],.023,18),'#922b1c',{ink:false}),0,0,0);
    }
  }

  function masterCreature(made,id){
    const {n,o}=made.rig;if(!n.head||!n.torso)return;
    const R=o.R||.3;
    if(id==='orc'||id==='blackOrc'){
      // White layered shoulder pelt, black topknot and red leather from the sheet.
      for(const side of [-1,1])for(let j=0;j<18;j++){
        const a=j*2.399,x=side*(o.torsoW*.46+Math.sin(a)*.09),y=o.torsoH*.97-Math.floor(j/6)*.04,z=Math.cos(a)*.18+.03;
        add(n.torso,lockMesh([[x,y,z],[x+side*.035,y-.075,z+.035],[x+side*.060,y-.14,z+.015]],.052,.025,j%3?'#d9d0bc':'#a8a394','fur'),0,0,0);
      }
      add(n.head,part(G.tube([[0,R*.45,-R*.4],[0,R*1.07,-R*.45],[0,R*.9,-R*.8]],R*.14,16),'#29272a',{tex:'hair',ink:.002}),0,0,0);
      for(const side of [-1,1])add(n.torso,part(G.ext([0,0,side*.12,-.02,side*.13,-.26,side*.035,-.20],.014,.002),'#932d30',{tex:'cloth',ink:.002}),side*.035,.04,o.torsoD*.54);
    }
    if(id==='deathKnight'){
      n.head.children.slice().forEach(c=>n.head.remove(c));
      add(n.head,part(skull(R).scale(1,.92,.82),'#d1b880',{tex:'stone',ink:.003}),0,0,0);
      for(const side of [-1,1])add(n.head,part(G.ball(R*.24,1,.8,.4),'#282019',{ink:false}),side*R*.35,R*.02,R*.72);
      add(n.head,part(G.ext([0,.015,.028,-.035,-.028,-.035],.012,0),'#38261b',{ink:false}),0,-R*.22,R*.77);
      for(let j=0;j<7;j++)add(n.head,part(G.sbox(.016,.032,.019,.25),'#e0c99a',{ink:false}),(j-3)*.02,-R*.51,R*.66);
      for(let j=0;j<5;j++)for(const side of [-1,1])add(n.torso,part(G.tube([[0,o.torsoH*(.78-j*.105),o.torsoD*.58],[side*o.torsoW*.32,o.torsoH*(.81-j*.105),o.torsoD*.60],[side*o.torsoW*.40,o.torsoH*(.75-j*.105),o.torsoD*.40]],.009,12),'#cdb886',{ink:false}),0,0,0);
    }
    if(id==='darkKnight'||id==='darkLord'){
      for(const side of [-1,1])for(let j=0;j<3;j++)add(n['arm'+(side<0?'R':'L')],part(G.cone(.028,.13+j*.025),'#4b355f',{metal:true,ink:.002}),side*(.07+j*.027),.05-j*.012,-.02,0,0,-side*.55);
    }
    if(id==='iceGolem'){
      for(const side of [-1,1])for(let j=0;j<5;j++)add(n.torso,part(G.oct(.055,2.6),'#75cfee',{metal:true,ink:.002}),side*(o.torsoW*.34+j*.017),o.torsoH*.85+j*.026,-.04,0,0,-side*(.2+j*.08));
    }
    if(id==='treant'||id==='treantKing'){
      for(let j=0;j<9;j++){const a=j*2.399;add(n.torso,part(G.tube([[Math.sin(a)*o.torsoW*.25,.04,o.torsoD*.5],[Math.sin(a+1)*o.torsoW*.34,o.torsoH*.45,o.torsoD*.56],[Math.sin(a+2)*o.torsoW*.3,o.torsoH*.85,o.torsoD*.4]],.014,16),'#665536',{tex:'wood',ink:.001}),0,0,0);}
    }
    if(id==='bandit'){
      add(n.head,part(G.torus(R*.99,.022).rotateX(Math.PI/2),'#e5d2a6',{tex:'cloth',ink:.002}),0,R*.32,0);
      add(n.head,part(G.ext([-.10,.03,.10,.03,.09,-.07,-.08,-.09],.012,.002),'#e7d5ac',{tex:'cloth',ink:.001}),0,-R*.38,R*.86);
    }
  }

  const ANIME_DESCRIPTIONS = {
    soldier: 'Kiếm sĩ tóc đen, giáp bạc ôm thân, vai giáp gọn, áo choàng đỏ và kiếm dài. Tỷ lệ người, mặt anime và khuỷu tay có khớp.',
    aldric: 'Hiệp sĩ tóc nâu, giáp bạc và xanh hoàng gia ôm thân với đường viền vàng, áo choàng xanh sẫm và kiếm thánh lõi lam.',
    elf: 'Cung thủ tai nhọn, tóc vàng dài từng lọn, giáp nhẹ xanh rêu, áo choàng ngắn và cung gỗ. Dáng mảnh, mắt anime.',
    lyra: 'Xạ thủ tóc vàng dài, giáp nhẹ xanh rêu và áo choàng xanh sẫm. Tay giương cung có khớp khuỷu.',
    mage: 'Pháp sư tóc bạc tím, váy áo nhiều lớp, mũ nhọn gọn, đường viền vàng và gậy pha lê.',
    selene: 'Pháp sư tóc bạc tím, áo lam nhiều lớp có eo, mũ nhọn và gậy pha lê băng. Mặt anime, tay có khớp khuỷu.',
    dwarf: 'Chiến binh lùn vai rộng, râu tết từng lọn, mũ sắt gọn, giáp ôm thân và kính xanh và pháo đồng cầm tay.',
    borin: 'Chiến thần lùn râu đỏ, mũ sắt và giáp nhiều lớp; đeo kính xanh, ôm pháo đồng lớn, tay có khớp khuỷu.',
    bandit: 'Cướp sa mạc dạng người, tóc đen từng lọn, khăn buộc đầu, giáp nhẹ, áo choàng và kiếm.',
    deathKnight: 'Kỵ sĩ tỷ lệ người với mũ kín có khe mắt lam, giáp tím đen ôm thân, áo choàng và kiếm ma thuật.',
    darkKnight: 'Kỵ sĩ hắc ám tỷ lệ người, mũ kín có sừng và khe mắt đỏ, giáp đen ôm thân, áo choàng và kiếm lõi đỏ.',
    darkLord: 'Chúa hắc ám khổng lồ với giáp đen ôm thân, mũ sừng kín có khe mắt đỏ, áo choàng dài và đại kiếm.'
  };
  LIST.forEach(def => { if (ANIME_DESCRIPTIONS[def.id]) def.desc = ANIME_DESCRIPTIONS[def.id]; });

  const MASTER_META={
    soldier:{desc:'Hiệp sĩ tóc nâu, mắt xanh, giáp bạc viền vàng, vai và áo choàng xanh hoàng gia; kiếm bạc và khiên xanh huy hiệu vàng.',palette:pal(['#70442d','Tóc'],['#3675ac','Mắt'],['#c3cad4','Giáp bạc'],['#245fc0','Áo choàng'],['#c99b42','Viền vàng'])},
    aldric:{desc:'Hiệp sĩ tóc nâu, giáp bạc và xanh hoàng gia, áo choàng xanh, kiếm bạc và khiên huy hiệu vàng.',palette:pal(['#70442d','Tóc'],['#3675ac','Mắt'],['#c3cad4','Giáp'],['#245fc0','Áo choàng'],['#c99b42','Viền'])},
    elf:{desc:'Elf tóc vàng dài, mắt xanh lá, tai nhọn, giáp lá xanh viền vàng, vạt vải trắng ngà, cung xanh và vàng.',palette:pal(['#dec489','Tóc'],['#3f9164','Mắt'],['#237347','Giáp lá'],['#e1dcc4','Vạt áo'],['#c99b42','Viền'])},
    lyra:{desc:'Elf tóc vàng dài, hoa trắng bên tai, mắt xanh lá, giáp lá xanh và cung vàng.',palette:pal(['#e8d18b','Tóc'],['#3f9164','Mắt'],['#237347','Giáp'],['#e1dcc4','Vạt áo'],['#c99b42','Viền'])},
    dwarf:{desc:'Người lùn râu cam tết, kính xanh gọng đồng, giáp tối màu và pháo đồng cầm tay.',palette:pal(['#cd6427','Râu'],['#327c9a','Kính'],['#343139','Giáp'],['#c99b42','Đồng'])},
    borin:{desc:'Người lùn râu cam tết, kính xanh gọng đồng, giáp da và kim loại tối, pháo đồng lớn.',palette:pal(['#cd6427','Râu'],['#327c9a','Kính'],['#343139','Giáp'],['#c99b42','Đồng'])}
  };
  LIST.forEach(def=>{if(MASTER_META[def.id])Object.assign(def,MASTER_META[def.id]);});
  const FRIENDLY_META={soldier:'Ki?m s? m? th?p tr?n, m?o xanh, gi?p li?n, khi?n xanh v? gi?y da. M?t t?i gi?n, d?ng g?n ?? nh?n r? trong tr?n.',aldric:'Hi?p s? m? th?p tr?n, gi?p xanh b?c v? khi?n v?ng, chuy?n ??ng c? kh?p.',elf:'Elf t?c v?ng th?nh m?ng, tai nh?n, ?o xanh l? v? gi?y da; m?t t?i gi?n.',lyra:'X? th? Elf t?c v?ng, ?o xanh l?, cung v?ng v? d?ng nh? g?n.',mage:'Ph? th?y t?c t?m, m? l?n, ?o t?m li?n v? g?y pha l?; m?t t?i gi?n.',selene:'Ph?p s? t?c t?m, m? cong, v?y ?o t?m m?m v? g?y ph?p.',dwarf:'Ng??i l?n r?u cam th?nh m?ng, k?nh xanh, ?o gi?p n?u v? ph?o ??ng.',borin:'Chi?n binh l?n r?u cam, k?nh xanh, gi?p n?u v? ph?o ??ng.',orc:'Orc xanh, t?c ?en, nanh tr?ng, l?ng vai v? v?t ??; m?t t?i gi?n.'};
  LIST.forEach(def=>{if(FRIENDLY_META[def.id])def.desc=FRIENDLY_META[def.id];});
  const SKILL_NAME = { trollKing: 'Nện đất', voidLord: 'Xé không gian', soldier: 'Giơ khiên', elf: '3 mũi tên', mage: 'Mưa thiên thạch', dwarf: 'Đập đất', aldric: 'Thánh Quang', lyra: 'Mưa Tên', selene: 'Bão Băng', borin: 'Địa Chấn', wolfRider: 'Sói húc', darkKnight: 'Triệu hồi bóng tối', darkLord: 'Cắm kiếm' };
  function readableSilhouette(rig,id){
    const n=rig.n;if(!n.head||!n.torso||!n.legR||!n.legL)return;
    if(/^(soldier|elf|mage|dwarf|aldric|lyra|selene|borin|bandit|deathKnight|darkKnight|darkLord)/.test(id))return;
    if(!/^(goblin|orc|blackOrc|skeleton|zombie)/.test(id))return;
    // Preserve monster anatomy and attachments, compress only the long legs.
    const height=rig.o.legL;if(!height)return;
    const shorter=.84;n.legR.scale.y*=shorter;n.legL.scale.y*=shorter;
    n.hips.position.y-=height*(1-shorter);rig.o.hipY=n.hips.position.y;
    n.head.scale.multiplyScalar(1.15);
    n.head.position.y+=rig.o.R*.11;
  }
  // A small-screen silhouette pass: soft continuous clothing, restrained faces
  // and a few large identity shapes. Existing joint and weapon nodes survive.
  function friendlyFinish(rig,id,tier){
    if(!/^(soldier(S[0-4])?|elf|mage|dwarf|aldric|lyra|selene|borin|orc)$/.test(id))return;
    SOFT_BUILD=true;
    const {n,o}=rig,elf=/elf|lyra/.test(id),mage=/mage|selene/.test(id),dwarf=/dwarf|borin/.test(id),orc=id==='orc';
    const cloth=elf?'#397b42':mage?'#7650a5':dwarf?'#59432f':orc?'#7b352b':'#3265ac';
    const skin=orc?'#879952':'#eec39d',hair=elf?'#dfc57c':mage?'#a18bc4':dwarf?'#bd602c':orc?'#34382e':'#70472e',R=o.R;
    // Keep the recognisable hat and animated side/back hair pivots. Replace the
    // sculpted face entirely: no layered iris, lashes, nose bridge or lips.
    const hat=n.head.getObjectByName('hat');
    for(const child of [...n.head.children])n.head.remove(child);
    for(const key of ['eyeR','eyeL','hairR','hairL','hairBack'])delete n[key];
    add(n.head,part(G.ball(R,1.04,.89,.91,28),skin,{sculpted:true,ink:.003}),0,0,0);
    for(const side of [-1,1]){
      const eye=n[side<0?'eyeR':'eyeL']=node(side<0?'eyeR':'eyeL',n.head,side*R*.34,-R*.07,R*.87);
      add(eye,part(G.ball(R*.052,.85,1.25,.35,12),'#302f2a',{ink:false}),0,0,0);
      if(elf)add(n.head,part(G.ext([0,-.045,side*R*.42,R*.15,side*R*.17,-R*.15],.025,.006),skin,{ink:.003}),side*R*.94,0,-.03);
    }
    if(!elf&&!mage&&!dwarf&&!orc){
      // Rounded steel helmet and broad blue crest read clearly at 40 pixels.
      const cap=new T.SphereGeometry(R*1.06,28,18,0,TAU,0,Math.PI*.53);cap.scale(1,.95,.97);
      add(n.head,part(cap,'#a6b8c6',{metal:true,ink:.005}),0,R*.15,-R*.05);
      for(const side of [-1,1])add(n.head,part(G.sbox(R*.23,R*.68,R*.39,.75),'#a6b8c6',{metal:true,ink:.003}),side*R*.95,-R*.10,-R*.08);
      add(n.head,part(G.tube([[-R*.95,R*.12,R*.4],[0,R*.29,R*.97],[R*.95,R*.12,R*.4]],R*.065,24),'#647787',{ink:false}),0,0,0);
      add(n.head,part(G.lathe([[0,0],[R*.18,0],[R*.19,R*.36],[R*.12,R*.64],[0,R*.72]],12,.72),'#3265ac',{tex:'cloth',ink:.004}),0,R*.94,-R*.19);
    }else{
      const cap=new T.SphereGeometry(R*1.04,24,16,0,TAU,0,Math.PI*.48);cap.scale(1,1,.97);
      add(n.head,part(cap,hair,{ink:.003}),0,R*.19,-R*.10);
      for(let j=0;j<3;j++){
        const x=(j-1)*R*.47;
        add(n.head,lockMesh([[x*.4,R*.93,R*.30],[x,R*.60,R*.84],[x+R*.12,R*.18,R*.90]],R*.24,R*.09,hair,''),0,0,0);
      }
      if(elf||mage){
        const back=n.hairBack=node('hairBack',n.head,0,R*.12,-R*.65);
        for(const side of [-1,0,1])add(back,lockMesh([[side*R*.50,R*.25,0],[side*R*.75,-R*1.0,-R*.22],[side*R*.94,-R*2.6,-R*.28]],R*.32,R*.12,hair,''),0,0,0);
      }
      if(hat)n.head.add(hat);
    }
    if(dwarf){
      add(n.head,part(G.lathe([[0,-R*1.34],[R*.32,-R*1.31],[R*.70,-R*.86],[R*.84,-R*.44],[R*.64,-R*.27],[0,-R*.27]],22,.63),hair,{ink:.004}),0,0,R*.57);
      for(const side of [-1,1]){
        add(n.head,part(G.ball(R*.30,1.25,.48,.48,16),hair,{ink:.002}),side*R*.32,-R*.30,R*.84);
        add(n.head,part(G.torus(R*.24,R*.057),'#c49848',{metal:true,ink:.003}),side*R*.40,R*.80,R*.61);
        add(n.head,part(G.ball(R*.18,1,1,.2,16),'#578494',{ink:false}),side*R*.40,R*.80,R*.64);
      }
    }
    if(orc){
      for(const side of [-1,1])add(n.head,part(G.cone(R*.07,R*.24),'#e9dfbf',{ink:.002}),side*R*.35,-R*.34,R*.77,0,0,-side*.12);
    }
    // Remove lace, rivets and overlapping torso plates. One broad upper body
    // and one belt establish a continuous, rounded character silhouette.
    for(const child of [...n.torso.children])if(child.isMesh)n.torso.remove(child);
    const w=o.torsoW*.5,h=o.torsoH,d=o.torsoD/o.torsoW;
    add(n.torso,part(G.lathe([[0,-.10],[w*.74,-.10],[w*.93,.02],[w*1.02,h*.27],[w,h*.65],[w*.81,h*.91],[w*.48,h],[0,h]],26,d),orc?skin:cloth,{ink:.004}),0,0,0);
    if(!elf&&!mage&&!orc)add(n.torso,part(G.lathe([[0,.12],[w*.70,.12],[w*.89,h*.40],[w*.84,h*.75],[w*.52,h*.89],[0,h*.89]],24,d*.60),dwarf?'#655342':'#a6b8c6',{metal:true,ink:.003}),0,0,o.torsoD*.24);
    add(n.torso,part(G.cyl(w*.95,w*.93,.075,24).scale(1,1,d),'#574432',{ink:.003}),0,.07,0);
    add(n.torso,part(G.sbox(.075,.068,.028,.75),'#d3af62',{metal:true,ink:.002}),0,.07,o.torsoD*.51);
    if(mage)add(n.torso,part(G.lathe([[0,.16],[w*.82,.16],[w*1.08,-.10],[w*1.42,-.41],[w*1.36,-.46],[0,-.46]],24,.80),cloth,{tex:'cloth',ink:.004}),0,0,0);
    if(elf)for(const side of [-1,1])add(n.torso,part(G.ext([0,.05,side*.13,.01,side*.18,-.25,side*.07,-.33],.02,.012),'#c5d596',{ink:.002}),side*.04,.03,.065,0,side*.1);
    // Compact mitts, continuous sleeves and broad leather boots; the elbow
    // and knee still articulate without shiny separate joint balls.
    if(!orc)for(const k of ['R','L']){
      const arm=n['arm'+k],elbow=n['elbow'+k],leg=n['leg'+k],knee=n['knee'+k];
      for(const child of [...arm.children])if(child.isMesh)arm.remove(child);
      for(const child of [...elbow.children])if(child.isMesh)elbow.remove(child);
      const upper=elf?skin:cloth,lower=elf||mage?skin:dwarf?'#655342':'#a6b8c6';
      add(arm,part(G.cap(o.armR*1.10,o.armL*.33),upper,{ink:.003}),0,-o.armL*.23,0);
      add(elbow,part(G.cap(o.armR*.93,o.armL*.32),lower,{metal:!elf&&!mage,ink:.003}),0,-o.armL*.24,0);
      add(arm,part(G.ball(o.armR*1.48,1,.80,1.08,20),cloth,{ink:.004}),0,-.03,0);
      const hand=n['hand'+k];for(const child of [...hand.children])if(child.isMesh||/^finger/.test(child.name))hand.remove(child);
      add(hand,part(G.ball(.055,1,.93,.82,16),elf||mage?skin:'#66523d',{ink:.003}),0,-.026,0);
      for(const child of [...leg.children])if(child.isMesh)leg.remove(child);
      for(const child of [...knee.children])if(child.isMesh)knee.remove(child);
      add(leg,part(G.cap(o.legR*1.06,o.legL*.40),mage?cloth:'#645340',{ink:.003}),0,-o.legL*.24,0);
      add(knee,part(G.cap(o.legR*1.02,o.legL*.33),elf?'#5b6a38':'#66523d',{ink:.003}),0,-o.legL*.23,0);
      add(knee,part(G.ball(o.legR*1.10,1.13,.74,1.78,20),elf?'#5b6a38':'#66523d',{ink:.003}),0,-o.legL*.48+.025,.047);
    }
    rig.root.userData.artStyle='friendly-tower-defense';SOFT_BUILD=false;
  }

  function build(id, tier) {
    const def = LIST.find(c => c.id === id) || LIST[0];
    const t = Math.max(1, Math.min(def.tiers, tier || def.tiers));
    REAL.cur = realK(def.id); BUILD_ID = def.id;
    let made;
    try { made = /^(soldier(S[0-4])?|elf|mage|dwarf|aldric|lyra|selene|borin)$/.test(def.id) ? ANIME(def.id, t) : /^(bandit|deathKnight|darkKnight|darkLord)$/.test(def.id) ? ANIME_ENEMY(def.id, t) : def.make(t); sculptCreature(made.rig,def.id);atelierSpecies(made.rig,def.id);masterCreature(made,def.id);realize(made.rig);readableSilhouette(made.rig,def.id);friendlyFinish(made.rig,def.id,t); }
    finally { REAL.cur = null; BUILD_ID = null; SOFT_BUILD=false; }
    const rig = made.rig;
    rig.root.name = 'root';
    if (def.scale) rig.root.scale.setScalar(def.scale);
    freeze(rig);
    const K = made.anim.kind, clips = K === 'static' ? [Object.assign(new T.AnimationClip('idle', 1, []), { userData: { loop: true } })] : K === 'wolf' ? wolfClips(rig) : K === 'scorpion' ? scorpClips(rig) : K === 'drake' ? drakeClips(rig) : humanClips(rig, made.anim);
    rig.root.userData.charId = def.id; rig.root.userData.tier = t;
    return { root: rig.root, clips, rig, def, tier: t, skill: made.anim.skill, skillName: SKILL_NAME[def.id] };
  }

  /** Bản sao sạch để xuất .glb: bỏ quầng sáng, đổi toon → PBR (emissive giữ nguyên) */
  function toExportable(root) {
    const c = root.clone(true), cache = new Map(), drop = [];
    c.traverse(o => {
      if (o.userData.noExport) { drop.push(o); return; }
      if (!o.isMesh) return;
      o.geometry=o.geometry.clone();
      for (const a of ["uv", "tpos", "tnrm"]) if (o.geometry.attributes[a]) o.geometry.deleteAttribute(a); // không dùng texture → bỏ UV / toạ độ vân cho nhẹ
      const m = o.material;
      if (m.userData.ink) return;
      if (!cache.has(m)) {
        const n = new T.MeshStandardMaterial({ color: m.color, roughness: m.userData.metal ? 0.42 : 0.85, metalness: m.userData.metal ? 0.55 : 0, transparent: m.transparent, opacity: m.opacity, side: m.side });
        if (m.userData.glow) { n.emissive = m.color.clone(); n.emissiveIntensity = Math.min(1, m.userData.glow); }
        n.name = '#' + m.color.getHexString();
        cache.set(m, n);
      }
      o.material = cache.get(m);
    });
    drop.forEach(o => o.parent && o.parent.remove(o));
    inkMat.name = 'ink_outline';
    return c;
  }

  window.Chars3D = { list: LIST, build, toExportable, INK, setInk: k => { INKK = k; }, setDetail: k => { DET = k; }, fx: FX, setFx: on => { FXON.v = !!on; }, real: REAL, kit: { part, G, add, node, mat, glow, sh, flipY, freeze, texCoords, GOLD, INK } };
})();
