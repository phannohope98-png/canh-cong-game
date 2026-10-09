/* =========================================================
 * mapart.js – Map chiến trường VẼ BẰNG CODE theo phong cách Kingdom Rush
 * Bố cục (đường đi, sông, hồ, dung nham, công trình) lấy từ thiết kế map của chủ game
 * (toạ độ ô map gốc trong maps-img.js), vẽ lại thành chiến trường thật:
 *   mặt đất vân màu + cỏ hoa · đường đất có mép, rãnh bánh xe, sỏi, đá viền, cỏ lấn
 *   sông/hồ có bờ, bọt sóng · dung nham phát sáng · cầu tự bắc chỗ đường cắt nước
 *   cây tán tròn viền mực dày, thông, đá, bụi… · lâu đài canh cổng cuối đường
 * ========================================================= */
(function () {
  const K = ArtKit, TAU = Math.PI * 2, INK = '#1b0f16', sh = K.shade, GOLD = '#f5c542';
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; };
  function F(g, b, col, o) { o = o || {}; K.cel(g, b, col, { s: o.s === undefined ? 1.6 : o.s, h: o.h === undefined ? 0.8 : o.h, lw: o.lw === undefined ? 1.8 : o.lw, ink: o.ink || INK, animeHeavy: true, noRim: true, dark: o.dark, light: o.light, flat: o.flat }); }
  const P_ = K.P, blob = p => P_.blob(p), poly = p => P_.poly(p), ell = (x, y, a, b) => P_.ell(x, y, a, b), circ = (x, y, r) => P_.circ(x, y, r);
  function line(g, x1, y1, x2, y2, col, w) { g.lineCap = 'round'; g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); }

  /* ---------------- Bảng màu theo vùng ---------------- */
  const TH = {
    forest: { g0: '#86a950', g1: '#597d3f', g2: '#b0c878', road: '#b6a386', roadD: '#a08d71', roadL: '#d0bb94', edge: '#796b52', water: '#247f96', waterL: '#94d7ce', bank: '#5a4a30',
      tree: ['#386449', '#739245', '#31543d'], flowers: ['#fff6a0', '#ffffff', '#ff9ab8', '#c8b0ff'], mix: [['tree', 0.5], ['pine', 0.14], ['bush', 0.15], ['rock', 0.1], ['stump', 0.05], ['mush', 0.06]] },
    castle: { g0: '#829975', g1: '#637c58', g2: '#aebe91', road: '#e2d6b8', roadD: '#b0a284', roadL: '#f4ecd6', edge: '#7a6e58', cobble: true, water: '#2f86b8', waterL: '#80cce8', bank: '#6a6458',
      tree: ['#386449', '#739245', '#31543d'], flowers: ['#fff6a0', '#ffffff', '#ff9ab8'], mix: [['tree', 0.36], ['bush', 0.2], ['rock', 0.14], ['pine', 0.1], ['barrel', 0.06], ['crate', 0.06], ['hay', 0.08]] },
    desert: { g0: '#dca85e', g1: '#c08440', g2: '#f2cc88', road: '#f6deae', roadD: '#d2aa70', roadL: '#fff2d4', edge: '#a8743e', water: '#2fa0b8', waterL: '#8ae0e8', bank: '#7a9a3a',
      tree: ['#6a9a3a', '#5a8a32', '#7aaa42'], flowers: ['#ffe080', '#ff8a5a'], mix: [['cactus', 0.24], ['rock', 0.3], ['deadtree', 0.1], ['bones', 0.1], ['palm', 0.08], ['drybush', 0.12], ['barrel', 0.06]] },
    ice: { g0: '#e4eef8', g1: '#bccee2', g2: '#ffffff', road: '#c4d8ea', roadD: '#98b0c8', roadL: '#e8f2fa', edge: '#7088a4', water: '#8ad0ee', waterL: '#e0f6ff', bank: '#9ab0c8',
      tree: ['#2f6a4a', '#3a7a56', '#285a40'], flowers: ['#ffffff'], mix: [['snowpine', 0.52], ['rock', 0.2], ['icecrystal', 0.16], ['bush', 0.08], ['deadtree', 0.04]] },
    lava: { g0: '#4c3a38', g1: '#2e2224', g2: '#6a5250', road: '#a8886a', roadD: '#7a5e48', roadL: '#c8a888', edge: '#3a2620', water: '#ff6a1a', waterL: '#ffd23a', bank: '#1e1416',
      tree: ['#3a2c2c', '#2e2222', '#4a3838'], flowers: [], mix: [['spire', 0.3], ['rock', 0.3], ['deadtree', 0.14], ['redcrystal', 0.1], ['bones', 0.1], ['brazier', 0.06]] },
    chaos: { g0: '#5a4a8a', g1: '#3a2c66', g2: '#7a6ab0', road: '#a898d8', roadD: '#7a6ab0', roadL: '#d4c8f4', edge: '#3a2c66', water: '#a050ff', waterL: '#e0b0ff', bank: '#2a1c52',
      tree: ['#4a3a7a', '#3a2c6a', '#5a4a8a'], flowers: ['#d8a0ff'], mix: [['voidcrystal', 0.34], ['rock', 0.24], ['deadtree', 0.2], ['rune', 0.12], ['bones', 0.1]] }
  };

  /* ---------------- Hình học ---------------- */
  function smooth(ctrl, step) {
    const P = ctrl.map(p => ({ x: p[0], y: p[1] })), out = [];
    for (let i = 0; i < P.length - 1; i++) {
      const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
      const n = Math.max(2, Math.ceil(Math.hypot(p2.x - p1.x, p2.y - p1.y) / step));
      for (let k = 0; k < n; k++) {
        const t = k / n, t2 = t * t, t3 = t2 * t;
        out.push({ x: 0.5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
          y: 0.5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3) });
      }
    }
    out.push({ x: P[P.length - 1].x, y: P[P.length - 1].y }); return out;
  }
  function distPoly(pts, x, y) {
    let b = Infinity;
    for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], c = pts[i + 1], dx = c.x - a.x, dy = c.y - a.y, l = dx * dx + dy * dy || 1; let t = ((x - a.x) * dx + (y - a.y) * dy) / l; t = Math.max(0, Math.min(1, t)); b = Math.min(b, Math.hypot(x - a.x - dx * t, y - a.y - dy * t)); }
    return b;
  }
  function polyPath(g, pts) { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)); }

  /** Đổi địa hình từ toạ độ ảnh gốc sang thế giới */
  function prepare(L, B, sc) {
    const f = L.feat || {}, cv = p => ({ x: (p[0] - B.x0) * sc, y: (p[1] - B.y0) * sc });
    return {
      void: !!f.void,
      rivers: (f.rivers || []).map(r => {
        const pts=smooth(r.pts.map(p=>{const q=cv(p);return[q.x,q.y];}),12), w=r.w*sc;
        const source=pts.map(p=>({...p}));
        for(let i=1;i<pts.length-1;i++){const dx=source[i+1].x-source[i-1].x,dy=source[i+1].y-source[i-1].y,L=Math.hypot(dx,dy)||1,bend=Math.sin(i*.22)*w*.12;pts[i].x-=dy/L*bend;pts[i].y+=dx/L*bend;}
        return{pts,w,kind:r.kind||'water'};
      }),
      lakes: (f.lakes || []).map(l => { const q = cv([l.x, l.y]); return { x: q.x, y: q.y, rx: l.rx * sc, ry: l.ry * sc, kind: l.kind || 'water' }; }),
      props: (f.props || []).map(p => Object.assign({}, p, cv([p.x, p.y])))
    };
  }
  const PROP_R = { monument: 190, castle: 230, fort: 190, gateway: 70, cabin: 80, house: 80, ruin: 75, tent: 60, mesa: 110, well: 40, portal: 150 };
  /** Loại nước/dung nham tại điểm (có lề m), hoặc null */
  function wetAt(F_, x, y, m) {
    for (const r of F_.rivers) if (distPoly(r.pts, x, y) < r.w / 2 + m) return r.kind;
    for (const l of F_.lakes) { const dx = (x - l.x) / (l.rx + m), dy = (y - l.y) / (l.ry + m * 0.6); if (dx * dx + dy * dy < 1) return l.kind; }
    return null;
  }
  function blocked(F_, x, y, m) {
    if (wetAt(F_, x, y, m)) return true;
    for (const p of F_.props) if (Math.hypot(x - p.x, (y - p.y) * 1.3) < (PROP_R[p.k] || 60) * 0.62 + m) return true;
    return false;
  }
  /** Ô xây hợp lệ: không nằm trên nước / công trình; map Hỗn Mang phải nằm trên đảo */
  function okSpot(F_, paths) {
    return (x, y) => { if (blocked(F_, x, y, 30)) return false; if (F_.void) { let d = Infinity; for (const p of paths) d = Math.min(d, p.nearest(x, y).perp); if (d > 125) return false; } return true; };
  }
  /** Rải đồ trang trí kiểu Kingdom Rush: khu chơi giữa thoáng, cây & nhà dày ở viền làm khung,
   *  cột đèn dọc đường, 1 quảng trường / tượng đài ở khoảng trống lớn nhất */
  function decor(F_, paths, spots, W, H, theme, seed) {
    const T = TH[theme] || TH.forest, r = K.seeded(seed), out = [], PW = CONFIG.pathWidth, tmp = {};
    const pick = () => { let a = 0, v = r(); for (const [k, p] of T.mix) { a += p; if (v < a) return k; } return T.mix[0][0]; };
    const BIG = new Set(['tree', 'pine', 'snowpine', 'palm', 'spire', 'mesa']);
    const SMALL = theme === 'ice' ? ['rock', 'bush', 'icecrystal'] : theme === 'lava' ? ['rock', 'bones', 'redcrystal'] : theme === 'desert' ? ['rock', 'drybush', 'cactus', 'bones'] : theme === 'chaos' ? ['rock', 'rune', 'voidcrystal'] : ['bush', 'rock', 'stump', 'mush', 'flowerbed', 'flowerbed'];
    const dpOf = (x, y) => { let d = Infinity; for (const p of paths) d = Math.min(d, p.nearest(x, y).perp); return d; };
    const nearSpot = (x, y, m) => { for (const s of spots) if (Math.hypot(s.x - x, (s.y - y) * 1.2) < m) return true; return false; };
    // 1) quảng trường / tượng đài
    if (!F_.void) {
      let best = null, bs = 0;
      for (let y = 140; y < H - 100; y += 30) for (let x = W * 0.18; x < W * 0.82; x += 30) {
        const d = dpOf(x, y); if (d < 160 || nearSpot(x, y, 150) || blocked(F_, x, y, 90)) continue;
        const sc = Math.min(d, 260) - Math.abs(x - W / 2) * 0.05; if (sc > bs) { bs = sc; best = { x, y }; }
      }
      if (best) { const p = { k: 'monument', x: best.x, y: best.y, theme }; F_.props.push(p); }
    }
    // 2) cột đèn dọc đường
    let side = 1;
    for (const p of paths) for (let d = 160; d < p.length - 120; d += 230 + r() * 80) {
      p.pointAt(d, tmp); side = -side; const o = side * (PW / 2 + 16), x = tmp.x + tmp.nx * o, y = tmp.y + tmp.ny * o;
      if (x < 40 || x > W - 40 || y < 50 || y > H - 20 || nearSpot(x, y, 58) || blocked(F_, x, y, 10) || dpOf(x, y) < PW / 2 + 10) continue;
      let clash = false; for (const q of out) if (q.k === 'lamp' && Math.hypot(q.x - x, q.y - y) < 150) clash = true; if (clash) continue;
      out.push({ k: 'lamp', x, y, s: 1, v: r(), flip: 1, theme });
    }
    // 3) cây cối & vật nhỏ
    const ph1 = r() * 9, ph2 = r() * 9, dens = (x, y) => 0.55 + 0.25 * Math.sin(x * 0.0042 + ph1) * Math.cos(y * 0.0061 + ph2) + 0.2 * Math.sin((x + y) * 0.0093 + ph2);
    for (let y = -30; y < H + 40; y += 34) for (let x = -30; x < W + 40; x += 34) {
      const jx = x + (r() - 0.5) * 30, jy = y + (r() - 0.5) * 30;
      const dp = dpOf(jx, jy);
      if (dp < PW / 2 + 22) continue;
      if (F_.void && dp > 140) continue;
      if (nearSpot(jx, jy, 66) || blocked(F_, jx, jy, 16)) continue;
      const edge = Math.min(jx, W - jx, (jy + 30) * 1.4, (H - jy) * 1.6), dn = dens(jx, jy);
      let k, ch;
      if (F_.void) { k = dp > 80 ? pick() : SMALL[(r() * SMALL.length) | 0]; ch = dp > 70 ? 0.28 : 0.08; }
      else if (edge < 120 && dp > 90) { k = pick(); ch = 0.95; }                       // khung viền: dày đặc
      else if (dp > 230) { k = pick(); ch = 0.42 * Math.max(0.15, dn * dn * 1.8); }       // xa đường: cụm cây thưa
      else if (dp > 120) { k = r() < 0.35 ? pick() : SMALL[(r() * SMALL.length) | 0]; ch = 0.16 * Math.max(0.2, dn * 1.6); }
      else { k = SMALL[(r() * SMALL.length) | 0]; ch = 0.07; }
      if (r() > ch) continue;
      if (dp < 150 && BIG.has(k)) k = SMALL[(r() * SMALL.length) | 0];
      out.push({ k, x: jx, y: jy, s: BIG.has(k) ? 1.3 + r() * 0.5 : 1.05 + r() * 0.35, v: r(), flip: r() < 0.5 ? -1 : 1 });
    }
    for (const p of F_.props) out.push(Object.assign({ prop: true, s: 1, v: 0.5, flip: 1 }, p));
    out.sort((a, b) => a.y - b.y);
    return out;
  }

  /* ---------------- Vân mặt đất (value noise) ---------------- */
  function patches(g, W, H, col, cell, amt, seed, lo, hi) {
    const cw = Math.ceil(W / cell) + 3, ch = Math.ceil(H / cell) + 3, c = mk(cw, ch), x = c.getContext('2d'), id = x.createImageData(cw, ch), r = K.seeded(seed), A = K.parse(col);
    for (let i = 0; i < cw * ch; i++) { const v = r(), t = Math.max(0, Math.min(1, (v - lo) / (hi - lo))); id.data[i * 4] = A[0]; id.data[i * 4 + 1] = A[1]; id.data[i * 4 + 2] = A[2]; id.data[i * 4 + 3] = t * t * (3 - 2 * t) * 255 * amt; }
    x.putImageData(id, 0, 0);
    g.save(); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.filter = 'blur(' + Math.round(cell * 0.35) + 'px)';
    g.drawImage(c, -cell, -cell, cw * cell, ch * cell); g.restore();
  }

  /* ---------------- Nước / băng / dung nham ---------------- */
  function drawWater(g, F_, T, rnd) {
    const items = F_.rivers.map(r => ({ r })).concat(F_.lakes.map(l => ({ l })));
    const shape = (it, grow) => { if (it.r) { polyPath(g, it.r.pts); return it.r.w + grow * 2; } g.beginPath(); g.ellipse(it.l.x, it.l.y, it.l.rx + grow, it.l.ry + grow * 0.6, 0, 0, TAU); return 0; };
    const paint = (it, grow, style, blur) => { g.save(); if (blur) g.filter = 'blur(' + blur + 'px)'; const w = shape(it, grow); if (it.r) { g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = w; g.strokeStyle = style; g.stroke(); } else { g.fillStyle = style; g.fill(); } g.restore(); };
    for (const it of items) {
      const kind = (it.r || it.l).kind;
      if (kind === 'lava') {
        paint(it, 12, '#1a1012', 3); paint(it, 7, '#3a1e14', 0);
        g.save(); g.globalCompositeOperation = 'lighter'; paint(it, 16, 'rgba(255,90,20,0.35)', 14); g.restore();
        paint(it, 0, '#e8460e', 0); paint(it, -4, '#ff8a1a', 2); paint(it, -(it.r ? it.r.w * 0.32 : 14), '#ffd23a', 4);
      } else if (kind === 'ice') {
        paint(it, 12, '#ffffff', 4); paint(it, 5, '#8aa4c0', 0); paint(it, 0, '#9ad6f0', 0); paint(it, -4, '#c8ecfa', 3);
      } else {
        paint(it,12,K.alpha(T.bank,.45),6);paint(it,5,K.alpha('#5b7762',.55),2);paint(it,1.5,'rgba(190,231,213,.40)',1);
        paint(it, 0, T.water, 0); paint(it, -(it.r ? it.r.w * 0.3 : 12), K.alpha(T.waterL, 0.55), 5);
      }
    }
    if(window.PaintedWorld?.enabled) for(const it of items){
      const water=(it.r||it.l),kind=water.kind;
      if(!it.r)continue;
      const points=it.r.pts,w=it.r.w;
      g.save();g.lineCap=g.lineJoin='round';
      polyPath(g,points);g.strokeStyle=kind==='lava'?'rgba(255,215,79,.38)':kind==='ice'?'rgba(236,252,255,.4)':'rgba(144,228,222,.32)';g.lineWidth=Math.max(1,w*.37);g.stroke();
      for(let i=5;i<points.length-5;i+=7){
        const a=points[i-1],p=points[i],b=points[i+1],dx=b.x-a.x,dy=b.y-a.y,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L;
        for(const side of[-1,1]){
          const x=p.x+nx*w*.46*side,y=p.y+ny*w*.46*side;
          g.strokeStyle=kind==='lava'?'rgba(255,166,49,.62)':'rgba(226,249,225,.5)';g.lineWidth=1.5;
          g.beginPath();g.moveTo(x-dx/L*4,y-dy/L*4);g.quadraticCurveTo(x+nx*side*2,y+ny*side*2,x+dx/L*5,y+dy/L*5);g.stroke();
        }
      }g.restore();
    }
    const surface=window.PaintedWorld?.texture(g,Object.keys(TH).find(k=>TH[k]===T)||'forest',2,256);
    if(surface)for(const it of items)paint(it,0,surface,0);
    // chi tiết bề mặt
    for (const it of items) {
      const kind = (it.r || it.l).kind;
      g.save(); shape(it, 0); if (it.r) { g.lineWidth = it.r.w; g.lineCap = 'round'; }
      const pts = []; if (it.r) for (let i = 0; i < it.r.pts.length; i += 3) pts.push(it.r.pts[i]); else for (let i = 0; i < 26; i++) pts.push({ x: it.l.x + (rnd() - 0.5) * it.l.rx * 1.5, y: it.l.y + (rnd() - 0.5) * it.l.ry * 1.4 });
      for (const p of pts) {
        const ox = it.r ? (rnd() - 0.5) * it.r.w * 0.6 : 0, oy = it.r ? (rnd() - 0.5) * it.r.w * 0.5 : 0, len = 6 + rnd() * 10;
        if (kind === 'lava') { g.fillStyle = 'rgba(40,16,10,0.7)'; g.beginPath(); g.ellipse(p.x + ox, p.y + oy, len * 0.5, len * 0.28, rnd(), 0, TAU); g.fill(); }
        else if (kind === 'ice') { line(g, p.x + ox - len * 0.5, p.y + oy, p.x + ox + len * 0.5, p.y + oy + (rnd() - 0.5) * 6, 'rgba(255,255,255,0.8)', 1.2); }
        else { line(g, p.x + ox - len * 0.5, p.y + oy, p.x + ox + len * 0.5, p.y + oy, 'rgba(255,255,255,0.55)', 1.6); }
      }
      g.restore();
    }
  }

  /* ---------------- Đường đi ---------------- */
  function drawRoad(g,map,T,res,rnd){
    const PW=CONFIG.pathWidth,theme=map.def.theme;
    // An irregular worn footprint with feathered dirt edges, never a forest pavement.
    for(const p of map.paths){
      const left=[],right=[],q={};for(let d=0;d<=p.length+6;d+=6){p.pointAt(Math.min(d,p.length),q);const w=PW*.5*(1+.09*Math.sin(d*.031)+.045*Math.sin(d*.083));left.push([q.x+q.nx*w,q.y+q.ny*w]);right.push([q.x-q.nx*w,q.y-q.ny*w]);}
      const path=()=>{g.beginPath();[...left,...right.reverse()].forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();};
      path();g.fillStyle=T.roadD;g.shadowColor=ArtKit.alpha(T.roadD,.42);g.shadowBlur=9;g.fill();g.shadowBlur=0;g.save();g.clip();
      const gr=g.createLinearGradient(0,0,0,map.H);gr.addColorStop(0,T.road);gr.addColorStop(1,T.roadD);g.fillStyle=gr;g.fillRect(0,0,map.W,map.H);
      // Broad brush variation, scattered soil only; stones belong to the city.
      const surface=theme==='castle'?window.PaintedWorld?.texture(g,theme,1,384):null;if(surface){g.globalAlpha=theme==='castle'?.45:.12;g.fillStyle=surface;g.fillRect(0,0,map.W,map.H);g.globalAlpha=1;}
      g.globalAlpha=.09;for(let d=18;d<p.length;d+=28){p.pointAt(d,q);g.fillStyle=T.roadL;g.beginPath();g.ellipse(q.x,q.y+(rnd()-.5)*PW*.45,12+rnd()*22,4+rnd()*5,0,0,TAU);g.fill();}g.globalAlpha=1;for(let d=20;d<p.length;d+=18){p.pointAt(d,q);const off=(rnd()-.5)*PW*.7;g.fillStyle=ArtKit.alpha(T.roadL,.22);g.beginPath();g.ellipse(q.x+q.nx*off,q.y+q.ny*off,1+rnd()*3,.7+rnd(),0,0,TAU);g.fill();}g.restore();
      if(['forest','castle'].includes(theme))for(let d=8;d<p.length;d+=19+rnd()*21){if(rnd()>.4)continue;p.pointAt(d,q);for(const side of [-1,1]){const w=PW*.5*(1+.09*Math.sin(d*.031)+.045*Math.sin(d*.083)),x=q.x+q.nx*(w-1)*side,y=q.y+q.ny*(w-1)*side;tuft(g,x,y,ArtKit.shade(T.g0,.04+rnd()*.13),.25+rnd()*.3);}}

    }
  }
  function tuft(g, x, y, col, s) {
    g.fillStyle = sh(col, -0.25);
    g.beginPath(); g.moveTo(x - 4 * s, y + 1); g.quadraticCurveTo(x - 4 * s, y - 5 * s, x - 6.5 * s, y - 9 * s); g.quadraticCurveTo(x - 1.5 * s, y - 5 * s, x, y - 11 * s);
    g.quadraticCurveTo(x + 1.5 * s, y - 5 * s, x + 6.5 * s, y - 8 * s); g.quadraticCurveTo(x + 4 * s, y - 4 * s, x + 4 * s, y + 1); g.closePath(); g.fill();
    g.fillStyle = col; g.beginPath(); g.moveTo(x - 2.5 * s, y); g.quadraticCurveTo(x - 2 * s, y - 5 * s, x - 3.5 * s, y - 7.5 * s); g.quadraticCurveTo(x, y - 4.5 * s, x + 0.5 * s, y - 9 * s); g.quadraticCurveTo(x + 1.5 * s, y - 4 * s, x + 2.5 * s, y); g.closePath(); g.fill();
  }

  /* ---------------- Cầu ---------------- */
  function drawBridges(g, map, T) {
    const PW = CONFIG.pathWidth, tmp = {}, theme = map.def.theme;
    for (const p of map.paths) {
      let start = -1;
      for (let d = 0; d <= p.length + 5; d += 4) {
        p.pointAt(Math.min(d, p.length), tmp); const wet = d <= p.length && wetAt(map.feat, tmp.x, tmp.y, 6);
        if (wet && start < 0) start = d;
        if ((!wet || d > p.length) && start >= 0) { bridge(g, p, Math.max(0, start - 14), Math.min(p.length, d + 10), PW, theme); start = -1; }
      }
    }
  }
  function bridge(g,p,d0,d1,PW,theme){
    

    const tmp = {}, half = PW / 2 + 9, stone = theme === 'castle' || theme === 'ice' || theme === 'chaos';
    const wood = theme === 'lava' ? '#4a3a36' : theme === 'desert' ? '#b88a52' : '#9a6a3a';
    const side = s => { const pts = []; for (let d = d0; d <= d1; d += 4) { p.pointAt(d, tmp); pts.push({ x: tmp.x + tmp.nx * half * s, y: tmp.y + tmp.ny * half * s }); } return pts; };
    const L = side(-1), R = side(1);
    // bóng & sàn
    g.save(); g.filter = 'blur(4px)'; g.beginPath(); L.forEach((q, i) => i ? g.lineTo(q.x + 4, q.y + 8) : g.moveTo(q.x + 4, q.y + 8)); for (let i = R.length - 1; i >= 0; i--) g.lineTo(R[i].x + 4, R[i].y + 8); g.closePath(); g.fillStyle = 'rgba(10,8,20,0.4)'; g.fill(); g.restore();
    if (stone) {
      F(g, c => { L.forEach((q, i) => i ? c.lineTo(q.x, q.y) : c.moveTo(q.x, q.y)); for (let i = R.length - 1; i >= 0; i--) c.lineTo(R[i].x, R[i].y); c.closePath(); }, theme === 'chaos' ? '#6a5aa0' : theme === 'ice' ? '#c8d4e2' : '#a8a296', { s: 2, h: 1 });
      for (let d = d0 + 6; d < d1 - 2; d += 8) { p.pointAt(d, tmp); line(g, tmp.x - tmp.nx * half, tmp.y - tmp.ny * half, tmp.x + tmp.nx * half, tmp.y + tmp.ny * half, 'rgba(40,30,40,0.3)', 1); }
      for (const S of [L, R]) for (let i = 0; i < S.length; i += 3) F(g, P_.rr(S[i].x - 4, S[i].y - 8, 8, 9, 1.5), theme === 'chaos' ? '#5a4a90' : '#8a8478', { s: 1, h: 0.5, lw: 1.4 });
    } else {
      for (let d = d0; d < d1; d += 6) { p.pointAt(d, tmp); const a = { x: tmp.x - tmp.nx * half, y: tmp.y - tmp.ny * half }, b = { x: tmp.x + tmp.nx * half, y: tmp.y + tmp.ny * half };
        F(g, poly([a.x - tmp.tx * 2.8, a.y - tmp.ty * 2.8, b.x - tmp.tx * 2.8, b.y - tmp.ty * 2.8, b.x + tmp.tx * 2.8, b.y + tmp.ty * 2.8, a.x + tmp.tx * 2.8, a.y + tmp.ty * 2.8]), (d / 6 | 0) % 2 ? wood : sh(wood, 0.08), { s: 0.6, h: 0.4, lw: 1.3 }); }
      for (const S of [L, R]) { g.lineCap = 'round'; g.lineJoin = 'round'; polyPath(g, S.map(q => ({ x: q.x, y: q.y - 8 }))); g.strokeStyle = INK; g.lineWidth = 5; g.stroke(); g.strokeStyle = sh(wood, -0.1); g.lineWidth = 2.6; g.stroke();
        for (let i = 0; i < S.length; i += 4) { line(g, S[i].x, S[i].y + 2, S[i].x, S[i].y - 9, INK, 5); line(g, S[i].x, S[i].y + 2, S[i].x, S[i].y - 9, wood, 2.8); } }
    }
  }

  function paintedBridge(g,p,d0,d1,PW,theme){
    const stone=['castle','ice','chaos','lava'].includes(theme),half=PW/2+8,q={};
    const color=theme==='chaos'?'#8374a9':theme==='ice'?'#b3c8d8':theme==='lava'?'#77716b':stone?'#bcb19a':'#a77745';
    const shade=ArtKit.shade,edge=[];
    for(let d=d0;d<=d1;d+=3){p.pointAt(d,q);edge.push({x:q.x-q.nx*half,y:q.y-q.ny*half});}
    p.pointAt(d1,q);edge.push({x:q.x-q.nx*half,y:q.y-q.ny*half});
    const far=[];for(let d=d0;d<=d1;d+=3){p.pointAt(d,q);far.push({x:q.x+q.nx*half,y:q.y+q.ny*half});}
    p.pointAt(d1,q);far.push({x:q.x+q.nx*half,y:q.y+q.ny*half});
    const polygon=(dy)=>{g.beginPath();edge.forEach((v,i)=>i?g.lineTo(v.x,v.y+dy):g.moveTo(v.x,v.y+dy));for(let i=far.length-1;i>=0;i--)g.lineTo(far[i].x,far[i].y+dy);g.closePath();};
    g.save();g.lineJoin='round';polygon(9);g.fillStyle='rgba(20,29,29,.28)';g.fill();
    polygon(5);g.fillStyle=shade(color,-.36);g.fill();polygon(0);g.fillStyle=color;g.fill();g.strokeStyle=shade(color,-.55);g.lineWidth=2;g.stroke();
    polygon(0);g.save();g.clip();
    for(let d=d0;d<d1;d+=stone?14:8){p.pointAt(d,q);
      const grad=g.createLinearGradient(q.x-q.nx*half,q.y-q.ny*half,q.x+q.nx*half,q.y+q.ny*half);
      grad.addColorStop(0,shade(color,.23));grad.addColorStop(.55,color);grad.addColorStop(1,shade(color,-.16));
      g.strokeStyle=grad;g.lineWidth=stone?12:6.5;g.beginPath();g.moveTo(q.x-q.nx*half,q.y-q.ny*half);g.lineTo(q.x+q.nx*half,q.y+q.ny*half);g.stroke();
      g.strokeStyle=shade(color,-.32);g.lineWidth=1;g.beginPath();g.moveTo(q.x-q.nx*half-q.tx*3,q.y-q.ny*half-q.ty*3);g.lineTo(q.x+q.nx*half-q.tx*3,q.y+q.ny*half-q.ty*3);g.stroke();
      if(!stone){g.strokeStyle='rgba(251,217,147,.25)';g.lineWidth=.65;for(const o of[-14,9]){g.beginPath();g.moveTo(q.x+q.nx*o,q.y+q.ny*o);g.lineTo(q.x+q.nx*(o+12),q.y+q.ny*(o+12));g.stroke();}}
    }
    const deck=window.PaintedWorld?.texture(g,theme,3,240);if(deck){g.fillStyle=deck;g.fillRect(0,0,4096,2048);}
    g.restore();
    for(const side of[-1,1]){
      const rail=[];
      for(let d=d0;d<=d1;d+=stone?20:24){p.pointAt(d,q);const x=q.x+q.nx*half*side,y=q.y+q.ny*half*side;rail.push({x,y:y-8});
        g.fillStyle=shade(color,-.3);g.fillRect(x-3,y-10,6,13);g.fillStyle=shade(color,.24);g.fillRect(x-3,y-11,5,3);
      }
      p.pointAt(d1,q);rail.push({x:q.x+q.nx*half*side,y:q.y+q.ny*half*side-8});
      polyPath(g,rail);g.strokeStyle=shade(color,-.47);g.lineWidth=stone?5:4;g.stroke();
      polyPath(g,rail.map(v=>({x:v.x-1,y:v.y-1})));g.strokeStyle=shade(color,.2);g.lineWidth=stone?2:1.4;g.stroke();
    }g.restore();
  }

  /* ---------------- Vật trang trí ---------------- */
  function shadow(g, rx, ry) { K.shadow(g, rx * 0.25, 2, rx, ry, 0.42); }
  const D = {
    lamp(g, T, v) { // cột đèn dọc đường (theo vùng)
      const th = T === TH.desert ? 'desert' : T === TH.ice ? 'ice' : T === TH.lava ? 'lava' : T === TH.chaos ? 'chaos' : 'town';
      shadow(g, 8, 3);
      if (th === 'desert' || th === 'lava') { // đuốc
        line(g, 0, 0, 0, -30, INK, 5.6); line(g, 0, 0, 0, -30, '#6a4426', 3); F(g, P_.rr(-4.5, -36, 9, 7, 2), '#3a3036', { s: 0.6, h: 0.3, lw: 1.4 });
        K.glow(g, 0, -42, 20, '#ff9a2a', 0.65); F(g, c => { c.moveTo(-4, -36); c.quadraticCurveTo(-5, -43, 0, -50); c.quadraticCurveTo(5, -43, 4, -36); c.closePath(); }, '#ff8a1a', { s: 0, h: 0.8, lw: 1.1, light: '#ffe060' });
        return;
      }
      const glow = th === 'ice' ? '#9ae0ff' : th === 'chaos' ? '#d08aff' : '#ffd060';
      F(g, P_.rr(-4, -4, 8, 5, 1.5), '#4a4a56', { s: 0.6, h: 0.3, lw: 1.4 });
      line(g, 0, -2, 0, -38, INK, 5); line(g, 0, -2, 0, -38, '#5a5a6a', 2.6); line(g, -1, -4, -1, -36, '#8a8a9a', 0.9);
      F(g, poly([-6, -38, 6, -38, 4, -50, -4, -50]), K.alpha(glow, 1), { s: 0, h: 0, lw: 1.6, flat: true });
      K.glow(g, 0, -44, 24, glow, 0.6);
      F(g, poly([-7.5, -50, 7.5, -50, 0, -57]), th === 'chaos' ? '#3a2c66' : '#3a3a48', { s: 0.6, h: 0.4, lw: 1.5 });
      F(g, P_.rr(-7, -39.5, 14, 2.6, 1), '#3a3a48', { s: 0.3, h: 0.2, lw: 1.2 });
      line(g, -3.5, -40, -3, -49, 'rgba(40,40,50,0.8)', 1); line(g, 3.5, -40, 3, -49, 'rgba(40,40,50,0.8)', 1);
    },
    flowerbed(g, T, v) {
      const cols = T.flowers.length ? T.flowers : ['#ff9ab8'];
      F(g, ell(0, 0, 16, 6.5), sh(T.g0, -0.2), { s: 1, h: 0.4, lw: 1.5 });
      for (let i = 0; i < 9; i++) { const a = i * 2.4 + v * 6, rr = (i % 3) * 4.2, x = Math.cos(a) * rr * 1.5, y = Math.sin(a) * rr * 0.5 - 2; K.dot(g, x, y, 2.6, INK); K.dot(g, x, y, 2, cols[(i + (v * 10 | 0)) % cols.length]); K.dot(g, x - 0.5, y - 0.6, 0.7, '#ffffff'); }
    },
    tree(g, T, v) {
      const c = T.tree[(v * 3) | 0], c2 = sh(c, 0.12);
      shadow(g, 30, 10);
      F(g, poly([-4, 2, -3, -16, 3, -16, 4, 2]), '#6a4426', { s: 1, h: 0.5 });
      const clumps = [[-14, -26, 15], [13, -27, 14], [0, -40, 17], [-8, -51, 12], [9, -50, 12]];
      for (const [x, y, r] of clumps) F(g, blob([x - r, y + r * 0.2, x - r * 0.8, y - r * 0.7, x, y - r, x + r * 0.8, y - r * 0.7, x + r, y + r * 0.2, x + r * 0.5, y + r * 0.8, x - r * 0.5, y + r * 0.8]), c, { s: r * 0.35, h: r * 0.15, lw: 2 });
      for (const [x, y, r] of clumps) { g.fillStyle = K.alpha(c2, 0.9); g.beginPath(); g.ellipse(x - r * 0.3, y - r * 0.4, r * 0.35, r * 0.22, -0.4, 0, TAU); g.fill(); }
      if (v > 0.8 && T.flowers.length) for (const [x, y] of [[-12, -30], [6, -44], [12, -28]]) K.dot(g, x, y, 1.8, T.flowers[2] || '#ff9ab8');
    },
    pine(g, T, v, snow) {
      const c = T.tree[(v * 3) | 0]; shadow(g, 22, 8);
      F(g, poly([-3, 2, -2.5, -10, 2.5, -10, 3, 2]), '#5a3a22', { s: 0.8, h: 0.4 });
      for (const [y, w, h] of [[-8, 20, 22], [-24, 16, 20], [-38, 11, 18]]) {
        F(g, poly([-w, y, 0, y - h, w, y, w * 0.4, y + 3, -w * 0.4, y + 3]), c, { s: 4, h: 1.5, lw: 1.9 });
        if (snow) F(g, c2 => { c2.moveTo(0, y - h); c2.quadraticCurveTo(-w * 0.45, y - h * 0.45, -w * 0.7, y - h * 0.25); c2.quadraticCurveTo(-w * 0.1, y - h * 0.4, w * 0.5, y - h * 0.3); c2.quadraticCurveTo(w * 0.25, y - h * 0.55, 0, y - h); c2.closePath(); }, '#ffffff', { s: 0.8, h: 0, lw: 1.3 });
      }
    },
    snowpine(g, T, v) { D.pine(g, T, v, true); },
    bush(g, T, v) { const c = sh(T.tree[(v * 3) | 0], 0.06); shadow(g, 16, 5); F(g, blob([-14, 0, -13, -10, -4, -16, 6, -15, 14, -8, 13, 1]), c, { s: 4, h: 1.6, lw: 1.8 }); if (T.flowers.length && v > 0.5) for (const [x, y] of [[-6, -9], [4, -11], [8, -5]]) K.dot(g, x, y, 1.7, T.flowers[(v * 10 | 0) % T.flowers.length]); if (T === TH.ice) F(g, blob([-11, -9, -4, -15, 6, -14, 12, -8, 0, -10]), '#ffffff', { s: 0.6, h: 0, lw: 1.2 }); },
    drybush(g) { shadow(g, 14, 4); g.strokeStyle = INK; g.lineWidth = 3; for (const a of [-1.2, -0.7, -0.2, 0.3, 0.8, 1.2]) { g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.sin(a) * 14, -Math.cos(a) * 13); g.stroke(); } g.strokeStyle = '#9a7a3a'; g.lineWidth = 1.5; for (const a of [-1.2, -0.7, -0.2, 0.3, 0.8, 1.2]) { g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.sin(a) * 14, -Math.cos(a) * 13); g.stroke(); } },
    rock(g, T, v) { const c = T === TH.lava ? '#3a2e2e' : T === TH.desert ? '#b8703c' : T === TH.chaos ? '#4a3a6a' : T === TH.ice ? '#8aa0b8' : '#9a96a0'; shadow(g, 18, 6);
      F(g, blob([-16, 1, -14, -9, -6, -15, 5, -13, 14, -7, 16, 2]), c, { s: 4, h: 1.6, lw: 1.9 }); F(g, blob([5, 2, 9, -5, 17, -4, 20, 3]), sh(c, -0.06), { s: 2, h: 1, lw: 1.6 });
      if (T === TH.ice) F(g, blob([-13, -9, -6, -15, 5, -13, 12, -8, 0, -10]), '#ffffff', { s: 0.6, h: 0, lw: 1.2 });
      if (T === TH.forest && v > 0.6) F(g, ell(-6, -12, 5, 2), '#5a9a3a', { s: 0.6, h: 0.3, lw: 1 }); },
    stump(g) { shadow(g, 12, 4); F(g, P_.rr(-8, -10, 16, 11, 3), '#7a4a26', { s: 1.4, h: 0.6 }); F(g, ell(0, -10, 8, 3.2), '#c89a5a', { s: 0.6, h: 0.4, lw: 1.5 }); },
    mush(g, T, v) { for (const [x, s] of [[-5, 1], [5, 0.75]]) { F(g, P_.rr(x - 1.6 * s, -7 * s, 3.2 * s, 7 * s, 1), '#f2e8d0', { s: 0.4, h: 0.3, lw: 1.2 }); F(g, c => { c.moveTo(x - 6 * s, -6 * s); c.quadraticCurveTo(x, -15 * s, x + 6 * s, -6 * s); c.closePath(); }, v > 0.5 ? '#d84a3a' : '#8a5ad8', { s: 1, h: 0.5, lw: 1.4 }); K.dot(g, x - 1.5 * s, -9 * s, 1, '#fff'); } },
    cactus(g, T, v) { shadow(g, 10, 4); const c = '#5a9a3a'; F(g, P_.rr(-4.5, -34, 9, 35, 4.5), c, { s: 2, h: 1 }); F(g, P_.rr(4, -22, 9, 5, 2.5), c, { s: 1, h: 0.5, lw: 1.5 }); F(g, P_.rr(9, -30, 5, 12, 2.5), c, { s: 1, h: 0.5, lw: 1.5 }); if (v > 0.4) { F(g, P_.rr(-13, -16, 9, 5, 2.5), c, { s: 1, h: 0.5, lw: 1.5 }); F(g, P_.rr(-14, -26, 5, 13, 2.5), c, { s: 1, h: 0.5, lw: 1.5 }); } if (v > 0.7) K.dot(g, 0, -35, 2.6, '#ff6a8a'); },
    palm(g, T) { shadow(g, 20, 6); g.lineCap = 'round'; line(g, 0, 0, 6, -44, INK, 7.5); line(g, 0, 0, 6, -44, '#8a6a3a', 4.5); for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * 0.6; F(g, c => { c.moveTo(6, -44); c.quadraticCurveTo(6 + Math.cos(a) * 14, -44 + Math.sin(a) * 10 - 8, 6 + Math.cos(a) * 26, -44 + Math.sin(a) * 14 + 6); c.quadraticCurveTo(6 + Math.cos(a) * 12, -44 + Math.sin(a) * 8, 6, -44); c.closePath(); }, '#4a9a3a', { s: 1, h: 0.5, lw: 1.5 }); } },
    deadtree(g, T) { shadow(g, 14, 4); const c = T === TH.chaos ? '#2a1e40' : T === TH.lava ? '#241a1a' : '#5a4636'; const br = [[0, 0, 0, -30], [0, -18, -12, -30], [0, -24, 10, -38], [-6, -24, -14, -26], [5, -32, 13, -32]]; for (const b of br) line(g, b[0], b[1], b[2], b[3], INK, 6); for (const b of br) line(g, b[0], b[1], b[2], b[3], c, 3.2); },
    bones(g) { for (const [x, y, a] of [[-6, -2, 0.4], [5, -1, -0.6]]) { g.save(); g.translate(x, y); g.rotate(a); F(g, P_.rr(-6, -1.2, 12, 2.4, 1.2), '#efe6d0', { s: 0.4, h: 0.3, lw: 1.1 }); for (const s of [-1, 1]) F(g, circ(s * 6, 0, 2), '#efe6d0', { s: 0.3, h: 0.2, lw: 1 }); g.restore(); } F(g, circ(0, -6, 4), '#efe6d0', { s: 0.8, h: 0.4, lw: 1.3 }); K.dot(g, -1.4, -6, 1, INK); K.dot(g, 1.4, -6, 1, INK); },
    barrel(g) { shadow(g, 9, 3); F(g, P_.rr(-7, -16, 14, 16, 4), '#9a6a3a', { s: 1.4, h: 0.6 }); for (const y of [-12, -4]) line(g, -7, y, 7, y, '#4a4a52', 1.6); F(g, ell(0, -16, 7, 2.6), '#b8864e', { s: 0.4, h: 0.3, lw: 1.3 }); },
    crate(g) { shadow(g, 10, 3); F(g, poly([-9, 0, -9, -14, 9, -14, 9, 0]), '#b8864e', { s: 1.4, h: 0.6 }); F(g, poly([9, 0, 14, -4, 14, -18, 9, -14]), '#8a6034', { s: 0.6, h: 0.3, lw: 1.5 }); F(g, poly([-9, -14, -4, -18, 14, -18, 9, -14]), '#d8a868', { s: 0.4, h: 0.3, lw: 1.5 }); line(g, -9, 0, 9, -14, 'rgba(60,30,10,0.6)', 1.4); },
    hay(g) { shadow(g, 14, 5); F(g, c => { c.moveTo(-14, 0); c.quadraticCurveTo(-14, -18, 0, -20); c.quadraticCurveTo(14, -18, 14, 0); c.closePath(); }, '#e2b84e', { s: 3, h: 1.2 }); for (const x of [-7, 0, 7]) line(g, x, -2, x * 0.6, -16, 'rgba(140,90,20,0.5)', 1); },
    spire(g, T, v) { shadow(g, 14, 5); const c = '#2e2426'; F(g, poly([-12, 2, -4, -46 - v * 16, 3, -30, 12, 2]), c, { s: 3, h: 1.4, lw: 1.9 }); g.save(); g.globalCompositeOperation = 'lighter'; line(g, -4, -8, -1, -26, 'rgba(255,110,30,0.8)', 1.5); g.restore(); },
    redcrystal(g, T, v) { shadow(g, 10, 4); for (const [x, h, a] of [[-5, 20, -0.2], [3, 28, 0.1], [9, 14, 0.4]]) { g.save(); g.translate(x, 0); g.rotate(a); F(g, poly([-3.5, 0, -3, -h * 0.75, 0, -h, 3, -h * 0.75, 3.5, 0]), T === TH.lava ? '#ff5a3a' : '#7fd0ff', { s: 1, h: 0.8, lw: 1.5, light: '#fff0d0' }); g.restore(); } K.glow(g, 2, -14, 18, T === TH.lava ? '#ff6a2a' : '#7fd0ff', 0.4); },
    icecrystal(g, T, v) { D.redcrystal(g, TH.ice, v); },
    voidcrystal(g, T, v) { shadow(g, 10, 4); K.glow(g, 0, -16, 22, '#b070ff', 0.45); for (const [x, h, a] of [[-5, 22, -0.25], [3, 32, 0.08], [10, 16, 0.4]]) { g.save(); g.translate(x, 0); g.rotate(a); F(g, poly([-3.5, 0, -3, -h * 0.75, 0, -h, 3, -h * 0.75, 3.5, 0]), '#a070f0', { s: 1, h: 0.8, lw: 1.5, light: '#f0e0ff' }); g.restore(); } },
    rune(g) { F(g, ell(0, -2, 12, 5), '#3a2c66', { s: 1, h: 0.5, lw: 1.5 }); g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(200,140,255,0.9)'; g.lineWidth = 1.4; g.beginPath(); g.ellipse(0, -2, 8, 3, 0, 0, TAU); g.moveTo(-5, -2); g.lineTo(5, -2); g.moveTo(0, -4.5); g.lineTo(0, 0.5); g.stroke(); g.restore(); },
    brazier(g) { shadow(g, 8, 3); line(g, 0, 0, 0, -16, INK, 5); line(g, 0, 0, 0, -16, '#4a3a2a', 2.6); F(g, P_.rr(-7, -21, 14, 6, 2), '#3a3036', { s: 0.8, h: 0.4, lw: 1.5 }); K.glow(g, 0, -28, 18, '#ff8a2a', 0.7); F(g, c => { c.moveTo(-5, -21); c.quadraticCurveTo(-6, -29, 0, -36); c.quadraticCurveTo(6, -29, 5, -21); c.closePath(); }, '#ff8a1a', { s: 0, h: 0.8, lw: 1.1, light: '#ffe060' }); }
  };

  /* ---------------- Công trình lớn ---------------- */
  function tH() { return ArtTowers.H; }
  const PROPS = {
    monument(g, p, T) { // quảng trường tròn lát đá + tượng đài ở giữa (như KR)
      const H = tH(), th = p.theme, stone = th === 'desert' ? '#e2c48e' : th === 'ice' ? '#d4e0ec' : th === 'lava' ? '#6a5a58' : '#c8c0b0';
      K.shadow(g, 0, 6, 120, 44, 0.25);
      F(g, ell(0, 0, 112, 42), sh(stone, -0.25), { s: 2, h: 0, lw: 2.2 });
      F(g, ell(0, -3, 106, 39), stone, { s: 3, h: 1.4, lw: 1.6 });
      g.save(); g.beginPath(); g.ellipse(0, -3, 106, 39, 0, 0, TAU); g.clip(); g.strokeStyle = K.alpha(sh(stone, -0.5), 0.5); g.lineWidth = 1.1;
      for (const rr of [30, 56, 82]) { g.beginPath(); g.ellipse(0, -3, rr, rr * 0.37, 0, 0, TAU); g.stroke(); }
      for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; g.beginPath(); g.moveTo(Math.cos(a) * 30, -3 + Math.sin(a) * 11); g.lineTo(Math.cos(a) * 106, -3 + Math.sin(a) * 39); g.stroke(); }
      g.restore();
      // bồn hoa / cỏ vòng trong
      F(g, ell(0, -3, 46, 17), th === 'lava' ? '#3a2a28' : th === 'ice' ? '#ffffff' : th === 'desert' ? '#c8a050' : '#6aa83e', { s: 2, h: 0.8, lw: 1.8 });
      if (th === 'forest' || th === 'castle') { // đài phun nước
        H.cyl(g, 0, 2, -8, 30, 30, '#b8b2a6', { rowH: 5, capCol: '#4aa8d8' });
        g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(160,230,255,0.5)'; g.beginPath(); g.ellipse(-6, -10, 14, 4, 0, 0, TAU); g.fill(); g.restore();
        H.cyl(g, 0, -8, -30, 7, 6, '#c8c2b6', { bricks: false });
        F(g, ell(0, -30, 16, 6), '#b8b2a6', { s: 1, h: 0.6, lw: 1.6 });
        H.cyl(g, 0, -30, -46, 4, 4, '#c8c2b6', { bricks: false });
        for (const s of [-1, 1]) { g.strokeStyle = 'rgba(200,240,255,0.9)'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(0, -48); g.quadraticCurveTo(s * 12, -60, s * 16, -32); g.stroke(); g.beginPath(); g.moveTo(0, -30); g.quadraticCurveTo(s * 22, -38, s * 26, -10); g.stroke(); }
        F(g, P_.circ(0, -50, 3.5), '#bfeaff', { s: 0, h: 0.4, lw: 1.2 });
      } else if (th === 'desert') { // tháp đá cổ (obelisk)
        H.cyl(g, 0, 2, -10, 20, 20, '#d2b07a', { rowH: 5 });
        F(g, poly([-9, -10, -6, -78, 0, -88, 6, -78, 9, -10]), '#e8c88e', { s: 3, h: 1.2 });
        for (const y of [-30, -50]) F(g, poly([-2, y, 0, y - 5, 2, y, 0, y + 5]), '#3ab0c8', { s: 0, h: 0.4, lw: 1 });
      } else if (th === 'ice') { // tượng pha lê băng
        H.cyl(g, 0, 2, -12, 22, 22, '#b8c8da', { rowH: 5 });
        K.glow(g, 0, -46, 40, '#9ae0ff', 0.5);
        for (const [x, h, a] of [[-10, 40, -0.25], [0, 62, 0], [10, 44, 0.25]]) { g.save(); g.translate(x, -12); g.rotate(a); F(g, poly([-6, 0, -5, -h * 0.75, 0, -h, 5, -h * 0.75, 6, 0]), '#9ad8f4', { s: 1.4, h: 1, lw: 1.6, light: '#ffffff' }); g.restore(); }
      } else { // núi lửa: bệ đá + lửa thiêng
        H.cyl(g, 0, 2, -14, 24, 22, '#4a3e44', { rowH: 6 });
        H.skull(g, 0, -6, 1.4);
        K.glow(g, 0, -34, 40, '#ff7a2a', 0.7);
        F(g, c => { c.moveTo(-14, -16); c.quadraticCurveTo(-18, -36, -2, -58); c.quadraticCurveTo(0, -42, 6, -48); c.quadraticCurveTo(16, -32, 14, -16); c.closePath(); }, '#ff7a1a', { s: 0, h: 1.2, lw: 1.4, light: '#ffe060' });
      }
    },
    castle(g, p, T) { // lâu đài canh cổng – cổng ngay trên đường (điểm cuối)
      const H = tH(), wall = p.snow ? '#d6dee8' : '#c4beb2', s = 1.25; g.save(); g.scale(s, s);
      K.shadow(g, 6, 4, 110, 26, 0.45);
      // tường thành 2 bên
      for (const side of [-1, 1]) {
        H.F(g, H.poly([side * 16, 2, side * 78, -6, side * 78, -46, side * 16, -40]), side > 0 ? sh(wall, -0.18) : wall, { s: 2, h: 1 });
        for (let i = 0; i < 5; i++) { const x = side * (22 + i * 12), top = -40 - (Math.abs(x) - 16) / 62 * 6; H.F(g, H.rr(x - 4, top - 7, 8, 8, 1), side > 0 ? sh(wall, -0.18) : wall, { s: 0.8, h: 0.5, lw: 1.4 }); }
      }
      // tháp 2 bên cổng
      for (const side of [-1, 1]) { H.cyl(g, side * 30, 4, -66, 15, 14, wall, { rowH: 7 }); H.cone(g, side * 30, -66, 18, 36, '#2a52c8', { tip: true }); H.win(g, side * 30, -30, 5, 10); H.banner(g, side * 30, -58, 9, 14, '#2a52c8', H.cross); }
      // tháp chính phía sau
      H.cyl(g, 62, -20, -96, 16, 15, wall, { rowH: 7 }); H.cone(g, 62, -96, 20, 40, '#2a52c8', { tip: true }); H.win(g, 62, -60, 5, 10);
      // cổng vòm
      H.F(g, H.poly([-16, 4, -16, -34, 16, -34, 16, 4]), wall, { s: 2, h: 1 });
      H.F(g, c => { c.moveTo(-11, 4); c.lineTo(-11, -18); c.arc(0, -18, 11, Math.PI, 0); c.lineTo(11, 4); c.closePath(); }, '#1c1218', { s: 0, h: 0, lw: 1.8, flat: true });
      for (let x = -9; x <= 9; x += 4.5) H.line(g, x, -26, x, 2, 'rgba(120,110,100,0.8)', 1.6);
      H.line(g, -11, -10, 11, -10, 'rgba(120,110,100,0.8)', 1.4);
      g.restore();
    },
    fort(g, p) { // pháo đài sa mạc / núi lửa
      const H = tH(), wall = p.dark ? '#4a3e44' : '#d8b07a', roof = p.dark ? '#7a1e1a' : '#c04a3a', s = 1.2; g.save(); g.scale(s, s);
      K.shadow(g, 6, 4, 100, 24, 0.45);
      for (const side of [-1, 1]) { H.F(g, H.poly([side * 16, 2, side * 70, -8, side * 70, -40, side * 16, -36]), side > 0 ? sh(wall, -0.18) : wall, { s: 2, h: 1 }); H.merlons && 0; }
      for (const side of [-1, 1]) { H.cyl(g, side * 32, 4, -58, 15, 13, wall, { rowH: 7 }); H.merlons(g, side * 32, -58, 13, wall, 5); H.banner(g, side * 32, -50, 9, 16, roof, null); }
      H.F(g, H.poly([-16, 4, -16, -40, 16, -40, 16, 4]), wall, { s: 2, h: 1 });
      H.F(g, c => { c.moveTo(-10, 4); c.lineTo(-10, -16); c.arc(0, -16, 10, Math.PI, 0); c.lineTo(10, 4); c.closePath(); }, '#1c1218', { s: 0, h: 0, lw: 1.8, flat: true });
      if (p.dark) K.glow(g, 0, -10, 16, '#ff6a2a', 0.45);
      g.restore();
    },
    gateway(g, p, T) { // cổng đá nơi quái tràn ra
      const H = tH(), c = '#8a8494';
      K.shadow(g, 4, 4, 46, 12, 0.4);
      for (const s of [-1, 1]) { H.F(g, H.rr(s * 30 - 7, -46, 14, 48, 2), s > 0 ? sh(c, -0.15) : c, { s: 2, h: 1 }); }
      H.F(g, c2 => { c2.moveTo(-37, -40); c2.quadraticCurveTo(0, -70, 37, -40); c2.lineTo(37, -30); c2.quadraticCurveTo(0, -58, -37, -30); c2.closePath(); }, c, { s: 2, h: 1 });
      H.skull(g, 0, -50, 1.2);
    },
    cabin(g, p) { const H = tH(); K.shadow(g, 6, 4, 46, 14, 0.4); H.house(g, 0, 0, 46, 26, 18, '#a8784a', '#c04a3a', { planks: true, roofH: 20 }); H.door(g, -6, 0, 11, 16, '#7a5232', false); H.win(g, 12, -10, 6, 8); },
    house(g, p) { const H = tH(); K.shadow(g, 6, 4, 46, 14, 0.4); H.house(g, 0, 0, 44, 28, 18, p.snow ? '#e0e6ee' : '#d4ccbc', p.snow ? '#6a7aa0' : '#b8483a', { bricks: true, roofH: 20 }); if (p.snow) H.F(g, H.poly([-25, -27, 0, -48, 25, -27, 20, -30, 0, -44, -20, -30]), '#ffffff', { s: 0.4, h: 0, lw: 1.3 }); H.door(g, -6, 0, 11, 16, '#7a5232', false); H.win(g, 12, -12, 6, 8); },
    ruin(g, p, T) { const H = tH(), c = T === TH.desert ? '#d8b07a' : T === TH.lava ? '#4a3e44' : '#a8a296'; K.shadow(g, 4, 4, 40, 12, 0.4);
      for (const [x, h] of [[-22, 40], [-6, 26], [12, 46], [26, 18]]) { H.cyl(g, x, 2, -h, 6, 6, c, { rowH: 6 }); }
      H.F(g, H.poly([-30, 4, -24, -8, 20, -6, 32, 4]), sh(c, -0.05), { s: 1.4, h: 0.6 }); for (const [x, y] of [[-34, 6], [30, 8]]) H.F(g, H.ell(x, y, 6, 3.6), c, { s: 1, h: 0.5, lw: 1.4 }); },
    tent(g, p) { const H = tH(), c = p.dark ? '#5a2a3a' : '#e8d8b8', st = p.dark ? '#2a1a20' : '#c04a3a'; K.shadow(g, 6, 4, 36, 11, 0.4);
      H.F(g, c2 => { c2.moveTo(-30, 2); c2.lineTo(0, -38); c2.lineTo(30, 2); c2.closePath(); }, c, { s: 3, h: 1.2 });
      for (const x of [-15, 15]) H.line(g, 0, -38, x * 1.6, 2, K.alpha(st, 0.8), 2.5);
      H.F(g, c2 => { c2.moveTo(-8, 2); c2.lineTo(0, -20); c2.lineTo(8, 2); c2.closePath(); }, '#2a1a14', { s: 0, h: 0, lw: 1.5, flat: true });
      H.line(g, 0, -38, 0, -50, INK, 3); H.line(g, 0, -38, 0, -50, '#7a4a26', 1.4); H.F(g, H.poly([0, -50, 12, -46, 0, -42]), st, { s: 0.6, h: 0.3, lw: 1.2 }); },
    mesa(g, p) { K.shadow(g, 10, 6, 70, 18, 0.45); const c = '#c07a40';
      F(g, poly([-62, 4, -56, -36, -30, -46, 30, -48, 58, -36, 66, 4]), c, { s: 6, h: 2 });
      F(g, ell(0, -44, 50, 10), '#e0a060', { s: 2, h: 1, lw: 1.6 });
      for (const y of [-26, -12]) line(g, -58, y, 62, y, 'rgba(90,40,10,0.45)', 2); },
    well(g) { const H = tH(); K.shadow(g, 3, 3, 18, 6, 0.4); H.cyl(g, 0, 2, -12, 13, 13, '#9a96a0', { rowH: 6, capCol: '#2a6a9a' }); for (const s of [-1, 1]) H.post(g, s * 12, -10, s * 12, -32, 2.4, '#7a4a26'); H.F(g, H.poly([-17, -30, 0, -42, 17, -30, 12, -28, 0, -36, -12, -28]), '#b8483a', { s: 0.8, h: 0.4, lw: 1.5 }); },
    portal(g) { const s = 1.3; g.save(); g.scale(s, s); K.shadow(g, 4, 4, 70, 16, 0.5);
      for (const side of [-1, 1]) F(g, poly([side * 30, 4, side * 44, -10, side * 40, -70, side * 26, -80, side * 22, -10]), '#3a2c5a', { s: 3, h: 1.2 });
      F(g, c => { c.moveTo(-40, -70); c.quadraticCurveTo(0, -120, 40, -70); c.lineTo(28, -66); c.quadraticCurveTo(0, -102, -28, -66); c.closePath(); }, '#3a2c5a', { s: 2, h: 1 });
      K.glow(g, 0, -40, 60, '#b070ff', 0.7);
      F(g, ell(0, -40, 22, 36), '#6a2ab0', { s: 0, h: 0, lw: 2, flat: true });
      g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 4; i++) { g.strokeStyle = K.alpha('#e0b0ff', 0.5 - i * 0.1); g.lineWidth = 3; g.beginPath(); g.ellipse(0, -40, 18 - i * 4, 31 - i * 7, 0, 0, TAU); g.stroke(); } g.restore();
      for (const side of [-1, 1]) F(g, poly([side * 36, -44, side * 42, -60, side * 48, -44, side * 42, -36]), '#c08aff', { s: 0.6, h: 0.6, lw: 1.3, light: '#f4e8ff' });
      g.restore(); }
  };

  /* ---------------- Map Hỗn Mang: đảo bay trên hư không ---------------- */
  function chaosGround(g, map, T, rnd) {
    const W = map.W, H = map.H;
    const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#0a0418'); sky.addColorStop(0.5, '#1a0c3a'); sky.addColorStop(1, '#2a1048'); g.fillStyle = sky; g.fillRect(0, 0, W, H);
    patches(g, W, H, '#7a2ab8', 180, 0.35, 91, 0.5, 1); patches(g, W, H, '#c03a9a', 130, 0.2, 92, 0.6, 1);
    for (let i = 0; i < 420; i++) K.dot(g, rnd() * W, rnd() * H, 0.5 + rnd() * 1.4, 'rgba(255,255,255,' + (0.3 + rnd() * 0.6) + ')');
    for (let i = 0; i < 22; i++) { const x = rnd() * W, y = rnd() * H, r = 14 + rnd() * 34; g.fillStyle = 'rgba(40,24,80,0.85)'; g.beginPath(); g.ellipse(x, y, r * 1.6, r * 0.45, 0, 0, TAU); g.fill(); g.beginPath(); g.moveTo(x - r * 1.5, y); g.lineTo(x, y + r * 1.6); g.lineTo(x + r * 1.5, y); g.closePath(); g.fillStyle = 'rgba(28,16,60,0.9)'; g.fill(); }
    const disc = (g2, R) => { g2.beginPath(); for (const p of map.paths) for (let i = 0; i < p.points.length; i += 2) { const q = p.points[i]; g2.moveTo(q.x + R, q.y); g2.arc(q.x, q.y, R, 0, TAU); } for (const pr of map.feat.props) { g2.moveTo(pr.x + 170, pr.y); g2.arc(pr.x, pr.y, 170, 0, TAU); } };
    // vách đá đảo
    g.save(); g.translate(0, 60); disc(g, 130); g.fillStyle = '#140a2a'; g.fill(); g.restore();
    g.save(); g.translate(0, 34); disc(g, 138); g.fillStyle = '#2a1a50'; g.fill(); g.restore();
    g.save(); g.translate(0, 14); disc(g, 144); g.fillStyle = '#3a2a6a'; g.fill(); g.restore();
    const gc = mk(W, H), gg = gc.getContext('2d'); gg.fillStyle = T.g0; gg.fillRect(0, 0, W, H);
    for (let i = 0; i < 220; i++) { const x = rnd() * W, y = rnd() * H, rr = 40 + rnd() * 110, col = rnd() < 0.55 ? T.g1 : T.g2, gr = gg.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, K.alpha(col, 0.45)); gr.addColorStop(1, K.alpha(col, 0)); gg.fillStyle = gr; gg.fillRect(x - rr, y - rr, rr * 2, rr * 2); }
    gg.strokeStyle = "rgba(210,160,255,0.18)"; gg.lineWidth = 1.2; for (let i = 0; i < 140; i++) { let x = rnd() * W, y = rnd() * H; gg.beginPath(); gg.moveTo(x, y); for (let k = 0; k < 3; k++) { x += (rnd() - 0.5) * 50; y += (rnd() - 0.5) * 34; gg.lineTo(x, y); } gg.stroke(); }
    g.save(); disc(g, 145); g.clip(); g.drawImage(gc, 0, 0); g.restore();
  }

  /* ---------------- VẼ TOÀN BỘ ---------------- */
  function render(map, res) {
    const W = map.W, H = map.H, T = TH[map.def.theme] || TH.forest, theme = map.def.theme, rnd = K.seeded(map.index * 97 + 13);
    let c = mk(W * res, H * res), g = c.getContext('2d'); g.scale(res, res); g.lineJoin = 'round'; g.lineCap = 'round';
    // 1) mặt đất
    const paintedGround=window.PaintedWorld?.texture(g,theme,0,640);
    if(paintedGround){g.fillStyle=paintedGround;g.fillRect(0,0,W,H);}
    else if (map.feat.void) chaosGround(g, map, T, rnd);
    else {
      g.fillStyle = T.g0; g.fillRect(0, 0, W, H);
      patches(g, W, H, T.g1, 170, 0.75, map.index * 5 + 1, 0.35, 1);
      patches(g, W, H, T.g2, 110, 0.5, map.index * 5 + 2, 0.55, 1);
      patches(g, W, H, T.g1, 45, 0.35, map.index * 5 + 3, 0.5, 1);
      patches(g, W, H, T.g2, 24, 0.25, map.index * 5 + 4, 0.6, 1);
      if (theme === 'desert') { g.strokeStyle = 'rgba(150,90,40,0.25)'; g.lineWidth = 1.4; for (let i = 0; i < 260; i++) { const x = rnd() * W, y = rnd() * H, w = 14 + rnd() * 26; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + w / 2, y - 4, x + w, y); g.stroke(); } }
      if (theme === 'lava') { g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 70; i++) { let x = rnd() * W, y = rnd() * H; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 4; k++) { x += (rnd() - 0.5) * 60; y += (rnd() - 0.5) * 40; g.lineTo(x, y); } g.strokeStyle = 'rgba(255,90,20,0.35)'; g.lineWidth = 4; g.stroke(); g.strokeStyle = 'rgba(255,170,60,0.8)'; g.lineWidth = 1.2; g.stroke(); } g.restore(); }
      if (theme === 'ice') for (let i = 0; i < 200; i++) K.dot(g, rnd() * W, rnd() * H, 0.8 + rnd() * 1.2, 'rgba(255,255,255,0.9)');
    }
    // 2) nước / dung nham
    drawWater(g, map.feat, T, rnd);
    // 3) chi tiết đất: cỏ, hoa, sỏi (tránh đường & nước) – có mặt đất 3D thì gom lại để dựng 3D thật
    const det = map.det = !window.PaintedWorld?.enabled && window.Terrain3D && Terrain3D.will(map) ? { tuft: [], flower: [], peb: [], kerb: [], slab: [], tc: theme === "ice" ? "#ffffff" : theme === "desert" ? "#c8a050" : sh(T.g0, 0.08) } : null;
    const PW = CONFIG.pathWidth;
    const free = (x, y, m) => { for (const p of map.paths) if (p.nearest(x, y).perp < PW / 2 + m) return false; return !wetAt(map.feat, x, y, 4); };
    if (!paintedGround&&theme !== 'chaos' && theme !== 'lava') {
      const tc = theme === 'ice' ? '#ffffff' : theme === 'desert' ? '#c8a050' : sh(T.g0, 0.08);
      for (let i = 0; i < 650; i++) { const x = rnd() * W, y = rnd() * H; if (!free(x, y, 8)) continue; if (det) det.tuft.push([x, y, 0.7 + rnd() * 0.6, i % 3 ? 0 : 1]); else tuft(g, x, y, i % 3 ? tc : sh(tc, -0.1), 0.7 + rnd() * 0.6); }
      for (let i = 0; i < 38 && T.flowers.length; i++) { const cx = rnd() * W, cy = rnd() * H; if (!free(cx, cy, 14)) continue; const col = T.flowers[(rnd() * T.flowers.length) | 0];
        for (let j = 0; j < 5; j++) { const x = cx + (rnd() - 0.5) * 30, y = cy + (rnd() - 0.5) * 16; if (det) { det.flower.push([x, y, col]); continue; } K.dot(g, x, y, 2.2, INK); K.dot(g, x, y, 1.6, col); K.dot(g, x - 0.4, y - 0.4, 0.6, '#ffffff'); } }
    }
    for (let i = 0; i < (paintedGround?30:160); i++) { const x = rnd() * W, y = rnd() * H; if (!free(x, y, 8)) continue; if (map.feat.void) { let d = Infinity; for (const p of map.paths) d = Math.min(d, p.nearest(x, y).perp); if (d > 130) continue; } if (det) { det.peb.push([x, y, 2 + rnd() * 2.5, 1.4 + rnd() * 1.2]); continue; } F(g, ell(x, y, 2 + rnd() * 2.5, 1.4 + rnd() * 1.2), theme === 'lava' ? '#2a2022' : theme === 'chaos' ? '#3a2a6a' : '#9a968e', { s: 0.6, h: 0.3, lw: 1 }); }
    // 4) đường đi + cầu
    drawRoad(g, map, T, res, rnd);
    const t3 = !window.PaintedWorld?.enabled && window.Terrain3D && Terrain3D.render(map, res, c, T); // mặt đất 3D: bờ sông dốc, đường trũng, cầu 3D
    if (t3) { c = t3; g = c.getContext('2d'); g.setTransform(res, 0, 0, res, 0, 0); g.lineJoin = 'round'; g.lineCap = 'round'; }
    else drawBridges(g, map, T);
    // 5) cây cối & công trình (theo chiều sâu)
    for (const d of map.decor) {
      if (t3 && d._in3d) continue; // đã dựng 3D cùng mặt đất (có bóng đổ thật)
      if (window.PaintedWorld?.enabled && PaintedWorld.prop(g,d,theme)) continue;
      if (!window.PaintedWorld?.enabled && window.Map3D && Map3D.draw(g, d, T, theme, res)) continue;
      g.save(); g.translate(d.x, d.y);
      if (d.prop) { if (PROPS[d.k]) PROPS[d.k](g, d, T); }
      else { g.scale(d.s * d.flip, d.s); if (D[d.k]) D[d.k](g, T, d.v); }
      g.restore();
    }
    // 6) cờ xuất phát & điểm phòng thủ
    const tmp = {};
    map.paths.forEach((p, i) => { p.pointAt(map.entry[i] - 30, tmp); Level.spawnFlag(g, tmp.x, tmp.y, theme); });
    if(map.def.map===5&&!map.feat.props.some(p=>p.gate58))Level.defendFlag(g,map.W-90,map.def.route.exit[1]+3,theme);
    // 7) ánh sáng
    g.save();g.globalAlpha=.35; g.globalCompositeOperation = 'soft-light';
    const sun = g.createLinearGradient(0, 0, W, H);
    if (theme === 'lava') { sun.addColorStop(0, 'rgba(255,120,60,0.45)'); sun.addColorStop(1, 'rgba(60,20,40,0.45)'); }
    else if (theme === 'chaos') { sun.addColorStop(0, 'rgba(200,120,255,0.3)'); sun.addColorStop(1, 'rgba(20,10,80,0.45)'); }
    else if (theme === 'ice') { sun.addColorStop(0, 'rgba(255,255,255,0.45)'); sun.addColorStop(1, 'rgba(40,80,160,0.35)'); }
    else { sun.addColorStop(0, 'rgba(255,236,170,0.5)'); sun.addColorStop(0.6, 'rgba(255,236,170,0)'); sun.addColorStop(1, 'rgba(30,40,100,0.35)'); }
    g.fillStyle = sun; g.fillRect(0, 0, W, H); g.restore();
    const vg = g.createRadialGradient(W * 0.5, H * 0.5, Math.min(W, H) * 0.45, W * 0.5, H * 0.5, Math.max(W, H) * 0.7);
    vg.addColorStop(0, 'rgba(15,8,30,0)'); vg.addColorStop(1, 'rgba(15,8,30,0.18)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
    return c;
  }

  window.MapArt = { TH, prepare, okSpot, decor, render, wetAt };
})();
