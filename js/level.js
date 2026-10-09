/* =========================================================
 * level.js – Dựng màn chơi (6 vùng đất, bản đồ NGANG 1280×640)
 *  - Đường đi: spline mềm; ô xây tự chọn theo độ phủ đường
 *  - Nền vẽ 1 lần: rừng, thành cổ, sa mạc, băng giá, núi lửa, cổng hỗn mang
 * ========================================================= */
(function () {
  const K = ArtKit, shade = K.shade, TAU = Math.PI * 2;

  class Path {
    constructor(points) {
      this.points = points; this.segLen = []; this.cum = [0];
      for (let i = 0; i < points.length - 1; i++) {
        const l = Math.hypot(points[i + 1].x - points[i].x, points[i + 1].y - points[i].y);
        this.segLen.push(l); this.cum.push(this.cum[i] + l);
      }
      this.length = this.cum[this.cum.length - 1];
    }
    pointAt(d, out) {
      out = out || {}; d = Math.max(0, Math.min(this.length, d));
      let lo = 0, hi = this.segLen.length - 1;
      while (lo < hi) { const m = (lo + hi + 1) >> 1; if (this.cum[m] <= d) lo = m; else hi = m - 1; }
      const i = lo, a = this.points[i], b = this.points[i + 1], l = this.segLen[i] || 1, t = Math.max(0, Math.min(1, (d - this.cum[i]) / l));
      // Interpolate knot tangents, so a lateral lane does not jump at segment seams.
      const prev=this.points[Math.max(0,i-1)],next=this.points[Math.min(this.points.length-1,i+2)];
      const al=Math.hypot(b.x-prev.x,b.y-prev.y)||1,bl=Math.hypot(next.x-a.x,next.y-a.y)||1;
      const tx=(b.x-prev.x)/al*(1-t)+(next.x-a.x)/bl*t,ty=(b.y-prev.y)/al*(1-t)+(next.y-a.y)/bl*t,tl=Math.hypot(tx,ty)||1;
      out.tx=tx/tl;out.ty=ty/tl;out.nx=-out.ty;out.ny=out.tx;
      out.x = a.x + (b.x - a.x) * t; out.y = a.y + (b.y - a.y) * t;
      return out;
    }
    nearest(x, y) {
      let best = Infinity, bestD = 0;
      for (let i = 0; i < this.segLen.length; i++) {
        const a = this.points[i], b = this.points[i + 1], l = this.segLen[i]; if (!l) continue;
        let t = ((x - a.x) * (b.x - a.x) + (y - a.y) * (b.y - a.y)) / (l * l); t = Math.max(0, Math.min(1, t));
        const dd = Math.hypot(x - (a.x + (b.x - a.x) * t), y - (a.y + (b.y - a.y) * t));
        if (dd < best) { best = dd; bestD = this.cum[i] + l * t; }
      }
      return { dist: bestD, perp: best };
    }
  }

  /** Catmull-Rom → đường gấp khúc mịn */
  function smooth(ctrl, step) {
    const P = ctrl.map(p => ({ x: p[0], y: p[1] })), out = [];
    for (let i = 0; i < P.length - 1; i++) {
      const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
      const n = Math.max(2, Math.ceil(Math.hypot(p2.x - p1.x, p2.y - p1.y) / step));
      for (let k = 0; k < n; k++) {
        const t = k / n, t2 = t * t, t3 = t2 * t;
        out.push({
          x: 0.5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
          y: 0.5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3)
        });
      }
    }
    out.push({ x: P[P.length - 1].x, y: P[P.length - 1].y });
    return out;
  }

  function distToPaths(paths, x, y) { let m = Infinity; for (const p of paths) m = Math.min(m, p.nearest(x, y).perp); return m; }
  /* ---------------- Trang trí kiểu nền anime ---------------- */
  const inkOf = c => K.mix(c, '#1a1424', 0.7);
  function leafBlob(g, x, y, r, seed) {
    const n = 9, rr = K.seeded(seed), pts = [];
    for (let i = 0; i < n; i++) { const a = i / n * TAU, k = 0.82 + rr() * 0.3; pts.push(x + Math.cos(a) * r * k, y + Math.sin(a) * r * k * 0.86); }
    return K.P.blob(pts);
  }
  /** Tán lá 3 tông: đáy tối, thân, đốm sáng trên trái + viền */
  function foliage(g, x, y, r, col, seed, hi) {
    const dark = shade(col, -0.28), light = shade(col, 0.3);
    g.save(); g.beginPath(); leafBlob(g, x, y, r, seed)(g); g.fillStyle = col; g.fill(); g.clip();
    g.fillStyle = dark; g.beginPath(); leafBlob(g, x + r * 0.28, y + r * 0.5, r * 0.95, seed + 3)(g); g.fill();
    g.fillStyle = light; for (let i = 0; i < 4; i++) { const a = -2.3 + i * 0.42; g.beginPath(); g.arc(x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.5, r * (0.3 - i * 0.03), 0, TAU); g.fill(); }
    if (hi) { g.fillStyle = K.alpha('#fffbe0', 0.35); g.beginPath(); g.arc(x - r * 0.38, y - r * 0.42, r * 0.18, 0, TAU); g.fill(); }
    g.restore();
    g.beginPath(); leafBlob(g, x, y, r, seed)(g); g.strokeStyle = inkOf(col); g.lineWidth = 1.4; g.lineJoin = 'round'; g.stroke();
  }
  function trunk(g, x0, y0, x1, y1, w, col) {
    g.lineCap = 'round'; g.strokeStyle = inkOf(col); g.lineWidth = w + 2.6; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
    g.strokeStyle = col; g.lineWidth = w; g.stroke();
    g.strokeStyle = shade(col, -0.3); g.lineWidth = w * 0.35; g.beginPath(); g.moveTo(x0 + w * 0.25, y0); g.lineTo(x1 + w * 0.25, y1); g.stroke();
  }
  const DECOR = {
    tree(g, th, v) {
      K.shadow(g, 6, 3, 26, 9, 0.42);
      trunk(g, 0, 3, 0, -16, 6, '#7a4e32'); trunk(g, 0, -10, -7, -18, 2.4, '#7a4e32'); trunk(g, 0, -12, 6, -20, 2.4, '#7a4e32');
      const c = th.tree[v % 3], sd = v * 13 + 5;
      foliage(g, -10, -21, 12, shade(c, -0.08), sd, false); foliage(g, 10, -22, 12, shade(c, -0.06), sd + 1, false); foliage(g, 0, -31, 15, c, sd + 2, true);
      if (th.flowers && v === 1) for (const [x, y] of [[-5, -36], [7, -28], [-11, -23], [3, -40]]) { K.dot(g, x, y, 2.1, '#ff6a7a'); K.dot(g, x - 0.6, y - 0.6, 0.7, '#ffe0e0'); }
    },
    pine(g, th, v) {
      K.shadow(g, 5, 3, 19, 6.5, 0.42);
      trunk(g, 0, 3, 0, -8, 4.6, '#6b4426');
      const c = th.tree[v % 3];
      const tier = (y, w, h, col) => {
        const path = cc => { cc.moveTo(-w, y); cc.quadraticCurveTo(-w * 0.45, y - h * 0.35, 0, y - h); cc.quadraticCurveTo(w * 0.45, y - h * 0.35, w, y); cc.quadraticCurveTo(w * 0.5, y - 3, 0, y + 1.5); cc.quadraticCurveTo(-w * 0.5, y - 3, -w, y); cc.closePath(); };
        g.save(); g.beginPath(); path(g); g.fillStyle = col; g.fill(); g.clip();
        g.fillStyle = shade(col, -0.25); g.beginPath(); g.moveTo(0, y - h); g.lineTo(w * 1.2, y); g.lineTo(w * 0.15, y + 3); g.closePath(); g.fill();
        g.fillStyle = shade(col, 0.26); g.beginPath(); g.moveTo(0, y - h); g.lineTo(-w * 0.75, y - 1); g.lineTo(-w * 0.45, y - 1); g.closePath(); g.fill();
        g.restore(); g.beginPath(); path(g); g.strokeStyle = inkOf(col); g.lineWidth = 1.3; g.stroke();
        if (th.snow) { g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(0, y - h); g.quadraticCurveTo(-w * 0.3, y - h * 0.55, -w * 0.4, y - h * 0.45); g.quadraticCurveTo(0, y - h * 0.62, w * 0.35, y - h * 0.45); g.quadraticCurveTo(w * 0.2, y - h * 0.6, 0, y - h); g.fill(); }
      };
      tier(-5, 17, 22, shade(c, -0.1)); tier(-16, 14, 21, c); tier(-27, 10.5, 20, shade(c, 0.06));
    },
    bush(g, th, v) {
      K.shadow(g, 3, 3, 16, 5, 0.38);
      const c = th.tree[(v + 1) % 3], sd = v * 7 + 2;
      foliage(g, -6, -5, 8, shade(c, -0.05), sd, false); foliage(g, 6, -5, 8, shade(c, -0.03), sd + 1, false); foliage(g, 0, -10, 9.5, c, sd + 2, true);
      if (th.flowers) { K.dot(g, -3, -12, 1.9, '#fff6a0'); K.dot(g, 5, -8, 1.9, '#ffb0c8'); K.dot(g, -7, -6, 1.7, '#ffffff'); }
      else if (v === 2) { K.dot(g, -2, -9, 1.6, '#d03a4a'); K.dot(g, 4, -6, 1.6, '#d03a4a'); }
    },
    rock(g, th, v) {
      K.shadow(g, 4, 3, 17, 5.5, 0.4);
      K.blob(g, [-14, 2, -12, -8, -4, -14, 7, -12, 14, -4, 12, 3], th.rock, { s: 4, h: 1.8, ink: inkOf(th.rock), animeHeavy: true, lw: 1.4 });
      K.line(g, -4, -10, -1, -4, K.alpha(shade(th.rock, -0.4), 0.6), 1);
      K.blob(g, [8, 4, 10, -2, 17, -1, 19, 4], shade(th.rock, -0.08), { s: 1.6, h: 0.8, ink: inkOf(th.rock), animeHeavy: true, lw: 1.2 });
      if (th.snow) K.flat(g, [-10, -8, -4, -13, 6, -11, 0, -9], '#ffffff');
      else if (!th.dead && v !== 1) { K.blob(g, [-12, -6, -6, -12, 0, -12, -4, -8, -10, -4], '#6aa84a', { s: 0.6, h: 0.4, lw: 0.9, ink: '#2e4a22', animeHeavy: true }); }
    },
    deadtree(g) {
      K.shadow(g, 3, 2, 14, 5, 0.35);
      trunk(g, 0, 2, 0, -24, 5, '#4a3a32'); trunk(g, 0, -16, -10, -30, 2.6, '#4a3a32'); trunk(g, 0, -12, 11, -24, 2.6, '#4a3a32'); trunk(g, 11, -24, 15, -23, 1.6, '#4a3a32');
    },
    crystal(g) {
      K.glow(g, 0, -10, 26, '#ff6a2a', 0.45);
      K.poly(g, [-7, 2, -9, -10, -3, -22, 2, 2], '#e0602a', { s: 2, h: 1.2 });
      K.poly(g, [0, 2, 4, -14, 9, -8, 8, 2], '#ff9a4a', { s: 1.6, h: 1 });
    },
    mushroom(g) {
      K.shadow(g, 2, 2, 10, 4, 0.35);
      K.rr(g, -2.5, -9, 5, 10, 2, '#f0e6d0', { s: 1, h: 0.5 });
      K.cel(g, c => { c.moveTo(-10, -8); c.quadraticCurveTo(0, -22, 10, -8); c.closePath(); }, '#c04a6a', { s: 2.4, h: 1 });
      K.dot(g, -3, -13, 1.6, '#fff'); K.dot(g, 4, -11, 1.3, '#fff');
      K.glow(g, 0, -12, 12, '#ff8ac0', 0.25);
    }
  };

  /* ---------------- Trang trí thêm theo vùng ---------------- */
  DECOR.cactus = function (g, th, v) {
    K.shadow(g, 4, 3, 16, 5, 0.4);
    const c = '#5a9a3a';
    K.rr(g, -4.5, -26, 9, 28, 4.4, c, { s: 2.2, h: 1.2, ink: inkOf(c), animeHeavy: true, lw: 1.3 });
    K.rr(g, -13, -19, 6, 4.4, 2.2, c, { s: 1, h: 0.6, ink: inkOf(c), animeHeavy: true, lw: 1.2 }); K.rr(g, -13, -27, 4.4, 12, 2.2, c, { s: 1, h: 0.6, ink: inkOf(c), animeHeavy: true, lw: 1.2 });
    if (v !== 1) { K.rr(g, 7, -14, 6, 4.4, 2.2, c, { s: 1, h: 0.6, ink: inkOf(c), animeHeavy: true, lw: 1.2 }); K.rr(g, 9, -22, 4.4, 11, 2.2, c, { s: 1, h: 0.6, ink: inkOf(c), animeHeavy: true, lw: 1.2 }); }
    g.strokeStyle = 'rgba(30,60,20,0.45)'; g.lineWidth = 0.8; for (const x of [-1.6, 1.6]) { g.beginPath(); g.moveTo(x, -24); g.lineTo(x, 0); g.stroke(); }
    K.dot(g, 0, -27, 2, '#ff7aa8');
  };
  DECOR.mesa = function (g, th, v) {
    K.shadow(g, 6, 4, 46, 13, 0.4);
    const c = th.rock, tiers = [[-36, 4, 36, 4, 32, -26, -30, -26], [-26, -22, 26, -22, 22, -48, -22, -48]];
    K.poly(g, [-40, 4, -34, -26, 32, -28, 42, 4], c, { s: 5, h: 2, ink: inkOf(c), animeHeavy: true, lw: 1.5 });
    K.poly(g, [-28, -26, -22, -52, 20, -54, 28, -28], shade(c, 0.08), { s: 4, h: 1.6, ink: inkOf(c), animeHeavy: true, lw: 1.5 });
    g.strokeStyle = 'rgba(80,30,10,0.35)'; g.lineWidth = 1; for (const y of [-12, -34]) { g.beginPath(); g.moveTo(-36, y); g.lineTo(38, y + 1); g.stroke(); }
    K.flat(g, [-22, -52, 20, -54, 22, -50, -20, -48], shade(c, 0.3));
  };
  DECOR.tent = function (g, th, v) {
    K.shadow(g, 4, 4, 30, 9, 0.4);
    const a = v % 2 ? '#c84a3a' : '#2f7ab0';
    K.poly(g, [-28, 3, 0, -34, 28, 3], '#f0e6cc', { s: 4, h: 1.6, ink: inkOf('#c8b890'), animeHeavy: true, lw: 1.4 });
    K.poly(g, [-14, 3, 0, -34, 14, 3], a, { s: 3, h: 1.2, ink: inkOf(a), animeHeavy: true, lw: 1.3 });
    K.poly(g, [-7, 3, 0, -10, 7, 3], '#3a2418', { s: 0, h: 0, lw: 1 });
    K.line(g, 0, -34, 0, -44, '#6b4426', 1.8); K.flat(g, [0, -44, 12, -41, 0, -37], a);
  };
  DECOR.house = function (g, th, v) {
    K.shadow(g, 6, 5, 40, 11, 0.42);
    const wall = '#eadcc0', roof = v % 2 ? '#b8402a' : '#3d6a9a';
    K.rr(g, -26, -22, 52, 26, 2, wall, { s: 4, h: 1.6, ink: inkOf('#a89878'), animeHeavy: true, lw: 1.4 });
    g.strokeStyle = 'rgba(90,50,30,0.55)'; g.lineWidth = 1.4; for (const x of [-26, -9, 9, 26]) { g.beginPath(); g.moveTo(x, -22); g.lineTo(x, 4); g.stroke(); } g.beginPath(); g.moveTo(-26, -9); g.lineTo(26, -9); g.stroke();
    K.poly(g, [-33, -20, 0, -50, 33, -20, 26, -18, -26, -18], roof, { s: 4, h: 1.8, ink: inkOf(roof), animeHeavy: true, lw: 1.5 });
    K.rr(g, -5, -9, 10, 13, 2, '#6a3e20', { s: 1.2, h: 0.6, animeHeavy: true, lw: 1.1 });
    for (const x of [-17, 15]) { K.rr(g, x - 3.5, -17, 7, 7, 1.2, '#ffe8a0', { s: 0, h: 0, ink: '#5a4a3a', animeHeavy: true, lw: 1 }); }
    K.rr(g, 12, -46, 7, 14, 1.4, '#a09a8e', { s: 1, h: 0.5, animeHeavy: true, lw: 1.1 });
  };
  DECOR.turret = function (g, th, v) {
    K.shadow(g, 5, 4, 28, 8, 0.42);
    const st = '#c6c0b4';
    K.rr(g, -15, -42, 30, 46, 3, st, { s: 4, h: 1.6, ink: inkOf(st), animeHeavy: true, lw: 1.4 });
    g.strokeStyle = 'rgba(60,40,60,0.3)'; g.lineWidth = 0.9; for (let y = -34, r = 0; y < 4; y += 8, r++) { g.beginPath(); g.moveTo(-15, y); g.lineTo(15, y); g.stroke(); for (let x = -15 + (r % 2) * 8; x < 15; x += 16) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 8); g.stroke(); } }
    K.poly(g, [-20, -40, 0, -76, 20, -40], '#3d6fc0', { s: 4, h: 1.6, ink: inkOf('#3d6fc0'), animeHeavy: true, lw: 1.4 });
    K.rr(g, -3, -32, 6, 11, 3, '#2a1830', { s: 0, h: 0, lw: 1 }); K.glow(g, 0, -26, 10, '#ffd070', 0.5);
    K.line(g, 0, -76, 0, -88, '#6b4426', 1.6); K.flat(g, [0, -88, 11, -85, 0, -81], '#e04848');
  };
  DECOR.wall = function (g, th, v) {
    K.shadow(g, 4, 4, 38, 8, 0.4);
    const st = '#b8b2a6';
    K.rr(g, -36, -14, 72, 16, 2, st, { s: 3, h: 1.4, ink: inkOf(st), animeHeavy: true, lw: 1.3 });
    for (let i = 0; i < 5; i++) K.rr(g, -36 + i * 15, -22, 11, 10, 1.4, shade(st, 0.06), { s: 1.4, h: 0.7, ink: inkOf(st), animeHeavy: true, lw: 1.1 });
  };
  DECOR.iceCrystal = function (g, th, v) {
    K.shadow(g, 3, 3, 20, 6, 0.35); K.glow(g, 0, -14, 28, '#9fe0ff', 0.4);
    K.poly(g, [-9, 2, -12, -14, -4, -34, 2, 2], '#9fe0ff', { s: 2.4, h: 1.4, light: '#ffffff', ink: '#2a5a8a', animeHeavy: true, lw: 1.3 });
    K.poly(g, [0, 3, 3, -22, 11, -12, 12, 3], '#7cc8f0', { s: 2, h: 1.2, light: '#e8faff', ink: '#2a5a8a', animeHeavy: true, lw: 1.3 });
    K.line(g, -6, -24, -8, -8, 'rgba(255,255,255,0.8)', 1.2);
  };
  DECOR.spire = function (g, th, v) {
    K.shadow(g, 4, 3, 22, 7, 0.45);
    const c = '#4a3a3c';
    K.poly(g, [-14, 3, -9, -26, -2, -44, 4, -24, 14, 3], c, { s: 3, h: 1.4, ink: '#1a0e10', animeHeavy: true, lw: 1.5 });
    K.glow(g, 0, -16, 24, '#ff6a1a', 0.35);
    g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = '#ff7a2a'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-2, -2); g.lineTo(1, -12); g.lineTo(-2, -20); g.lineTo(2, -30); g.stroke(); g.restore();
  };
  DECOR.brazier = function (g, th, v) {
    K.shadow(g, 3, 3, 14, 5, 0.4);
    K.limb(g, 0, 2, 0, -12, 3, '#4a3a2a'); K.rr(g, -7, -18, 14, 8, 3, '#3a3036', { s: 1.4, h: 0.7, animeHeavy: true, lw: 1.2 });
    K.glow(g, 0, -26, 22, '#ff8a2a', 0.7);
    K.cel(g, c => { c.moveTo(-5, -17); c.quadraticCurveTo(-6, -26, 0, -34); c.quadraticCurveTo(6, -26, 5, -17); c.closePath(); }, '#ff8a1a', { s: 0, h: 0.8, light: '#ffe060', lw: 1, ink: '#7a2a0a', animeHeavy: true });
  };
  DECOR.voidCrystal = function (g, th, v) {
    K.shadow(g, 3, 3, 22, 7, 0.4); K.glow(g, 0, -16, 34, '#b070ff', 0.5);
    K.poly(g, [-10, 3, -14, -12, -4, -38, 3, 3], '#a060f0', { s: 2.6, h: 1.4, light: '#f0d8ff', ink: '#2a1050', animeHeavy: true, lw: 1.3 });
    K.poly(g, [0, 4, 4, -26, 13, -14, 14, 4], '#7a40d0', { s: 2.2, h: 1.2, light: '#d8b8ff', ink: '#2a1050', animeHeavy: true, lw: 1.3 });
    K.line(g, -7, -28, -9, -10, 'rgba(255,255,255,0.8)', 1.2);
  };
  DECOR.rune = function (g, th, v) {
    K.shadow(g, 3, 3, 16, 5, 0.4);
    const c = '#5a4a8a';
    K.poly(g, [-9, 3, -10, -24, -3, -32, 6, -30, 10, -22, 9, 3], c, { s: 2.6, h: 1.2, ink: '#1a1030', animeHeavy: true, lw: 1.4 });
    K.glow(g, 0, -16, 16, '#c880ff', 0.5);
    g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = '#e0a0ff'; g.lineWidth = 1.3; g.beginPath(); g.moveTo(-3, -22); g.lineTo(3, -22); g.moveTo(0, -26); g.lineTo(0, -10); g.moveTo(-4, -14); g.lineTo(4, -17); g.stroke(); g.restore();
  };
  DECOR.bones = function (g, th, v) {
    K.shadow(g, 2, 2, 12, 4, 0.3);
    K.circ(g, -2, -4, 5, '#efe6d0', { s: 1.2, h: 0.6, animeHeavy: true, lw: 1, ink: '#6a5a4a' });
    K.dot(g, -4, -5, 1.2, '#2a1a14'); K.dot(g, 0, -5, 1.2, '#2a1a14');
    K.line(g, 6, -2, 15, 2, '#efe6d0', 2.2); K.line(g, 6, 1, 14, 5, '#efe6d0', 2);
  };
  DECOR.palm = function (g, th, v) {
    K.shadow(g, 5, 3, 22, 7, 0.4);
    const t = '#8a5a32'; g.lineCap = 'round'; g.strokeStyle = inkOf(t); g.lineWidth = 6.4; g.beginPath(); g.moveTo(0, 3); g.quadraticCurveTo(7, -18, 3, -38); g.stroke(); g.strokeStyle = t; g.lineWidth = 4; g.stroke();
    for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * 0.62, lx = 3 + Math.cos(a) * 26, ly = -38 + Math.sin(a) * 16 + 8;
      K.cel(g, c => { c.moveTo(3, -38); c.quadraticCurveTo(3 + Math.cos(a) * 14, -38 + Math.sin(a) * 14 - 6, lx, ly); c.quadraticCurveTo(3 + Math.cos(a) * 14, -38 + Math.sin(a) * 14 + 2, 3, -37); c.closePath(); }, '#4a9a3a', { s: 1, h: 0.6, ink: '#1e4a1a', animeHeavy: true, lw: 1.2 }); }
    K.dot(g, 1, -36, 2.4, '#7a4a22'); K.dot(g, 5, -35, 2.4, '#7a4a22');
  };

  /* ---------------- Đặc điểm từng màn: sông / dung nham / hồ ---------------- */
  const FEATURES = [
    { rivers: [[[1000, -60], [960, 180], [1040, 380], [1000, 560], [1080, 720], [1030, 960]]], kind: 'water' },                                   // Rừng Xanh
    { rivers: [[[-60, 430], [260, 440], [560, 430], [700, 400], [870, 390], [1000, 430], [1100, 520], [1180, 760], [1250, 960]]], kind: 'water' }, // Thành Cổ
    { rivers: [], kind: 'water', pond: [[1010, 130, 70], [250, 780, 50]] },                                                                         // Sa Mạc (ốc đảo)
    { rivers: [[[-60, 560], [260, 560], [540, 520], [700, 700], [900, 790], [1100, 960]]], kind: 'ice' },                                           // Băng Giá
    { rivers: [[[200, -60], [330, 300], [270, 520], [310, 960]], [[1100, 960], [1180, 700], [1110, 480], [1180, 200], [1150, -60]]], kind: 'lava' },  // Núi Lửa
    { rivers: [], kind: 'water' }                                                                                                                   // Hỗn Mang
  ];
  /* Bộ ký tự theo vùng cho cây cối / vật trang trí */
  const DECOR_MIX = {
    forest: [['tree', 0.46], ['pine', 0.2], ['bush', 0.16], ['rock', 0.12], ['mushroom', 0.06]],
    castle: [['tree', 0.34], ['bush', 0.22], ['rock', 0.2], ['pine', 0.14], ['wall', 0.1]],
    desert: [['cactus', 0.34], ['rock', 0.26], ['deadtree', 0.12], ['bones', 0.1], ['mesa', 0.12], ['bush', 0.06]],
    ice:    [['pine', 0.46], ['rock', 0.2], ['iceCrystal', 0.22], ['bush', 0.12]],
    lava:   [['rock', 0.34], ['spire', 0.26], ['deadtree', 0.16], ['crystal', 0.14], ['brazier', 0.1]],
    chaos:  [['voidCrystal', 0.34], ['rune', 0.2], ['deadtree', 0.2], ['rock', 0.18], ['crystal', 0.08]]
  };
  const pickKind = (mix, r) => { let a = 0; for (const [k, p] of mix) { a += p; if (r < a) return k; } return mix[0][0]; };

  /** Đọc màu ảnh map để biết chỗ nào là nước / dung nham / vực tối (không đặt ô xây) */
  function terrainProbe(img, W, H) {
    if (!img || !img.naturalWidth) return null;
    try {
      const S = 4, c = document.createElement('canvas'); c.width = Math.ceil(W / S); c.height = Math.ceil(H / S);
      const g = c.getContext('2d'); g.drawImage(img, 0, 0, c.width, c.height);
      const d = g.getImageData(0, 0, c.width, c.height).data, cw = c.width, ch = c.height;
      const bad = (x, y) => {
        const i = (Math.max(0, Math.min(ch - 1, Math.round(y / S))) * cw + Math.max(0, Math.min(cw - 1, Math.round(x / S)))) * 4, r = d[i], gg = d[i + 1], b = d[i + 2];
        const lum = 0.3 * r + 0.59 * gg + 0.11 * b, mx = Math.max(r, gg, b), sat = mx ? (mx - Math.min(r, gg, b)) / mx : 0;
        if (lum < 38) return true;                                        // vực tối / bóng sâu
        if (r > 190 && gg > 70 && gg < 190 && b < 90 && sat > 0.55) return true; // dung nham
        if (b > r + 35 && b > gg + 5 && sat > 0.35 && lum < 190) return true;    // nước / băng xanh đậm
        return false;
      };
      return (x, y) => { let n = 0; for (const [dx, dy] of [[0, 0], [-26, 0], [26, 0], [0, -12], [0, 12]]) if (bad(x + dx, y + dy)) n++; return n < 2; };
    } catch (e) { return null; } // file:// có thể chặn getImageData
  }

  function pickSpots(paths, rivers, count, W, H, PW, chaos, ok) {
    const samples = [], tmp = {};
    for (const p of paths) for (let d = 30; d < p.length; d += 36) { p.pointAt(d, tmp); samples.push({ x: tmp.x, y: tmp.y, c: 0 }); }
    const cand = [];
    for (const p of paths) for (let d = 110; d < p.length - 140; d += 30) {
      p.pointAt(d, tmp);
      for (const sd of [-1, 1]) for (const off of [PW / 2 + 46, PW / 2 + 76]) {
        const x = tmp.x + tmp.nx * off * sd, y = tmp.y + tmp.ny * off * sd;
        if (x < 70 || x > W - 150 || y < 100 || y > H - 80) continue;
        if (distToPaths(paths, x, y) < PW / 2 + 40) continue;
        let bad = false; for (const r of rivers) if (r.nearest(x, y).perp < 66) { bad = true; break; }
        if (!bad && ok && !ok(x, y)) bad = true;
        if (!bad) cand.push({ x, y });
      }
    }
    const spots = [];
    while (spots.length < count && cand.length) {
      let bi = -1, bs = -1;
      for (let i = 0; i < cand.length; i++) {
        const c = cand[i]; let near = false;
        for (const s of spots) if (Math.hypot(s.x - c.x, s.y - c.y) < 116) { near = true; break; }
        if (near) { cand.splice(i--, 1); continue; }
        let sc = 0; for (const s of samples) if (Math.hypot(s.x - c.x, s.y - c.y) < 175) sc += 1 / (1 + s.c * 1.6);
        if (sc > bs) { bs = sc; bi = i; }
      }
      if (bi < 0) break;
      const c = cand.splice(bi, 1)[0]; spots.push({ id: spots.length, x: Math.round(c.x), y: Math.round(c.y) });
      for (const s of samples) if (Math.hypot(s.x - c.x, s.y - c.y) < 175) s.c++;
    }
    return spots;
  }

  const Level = {
    Path, spawnFlag: (g, x, y, T) => spawnFlag(g, x, y, T), defendFlag: (g, x, y, T) => defendFlag(g, x, y, T),

    build(index) {
      const L = CONFIG.levels[index], PW = CONFIG.pathWidth, B = L.bg && L.ipaths ? L.bg : null;
      let W = CONFIG.world.width, H = CONFIG.world.height, sc = 1;
      // Map ảnh thật: thế giới cao 640, rộng theo tỉ lệ ảnh; đường đi đổi từ toạ độ ảnh gốc
      if (B) { sc = H / (B.y1 - B.y0); W = Math.round((B.x1 - B.x0) * sc); }
      const theme = CONFIG.themes[L.theme], legacyScale = H / 900, sourceF = FEATURES[index] || { rivers: [] };
      const F = B ? { rivers: [] } : Object.assign({}, sourceF, { rivers: sourceF.rivers.map(r => r.map(p => p.map(v => v * legacyScale))), pond: (sourceF.pond || []).map(p => p.map(v => v * legacyScale)) });
      const ctrl = B ? L.ipaths.map(c => c.map(p => [(p[0] - B.x0) * sc, (p[1] - B.y0) * sc])) : L.paths.map(c => c.map(p => p.map(v => v * legacyScale)));
      const paths = ctrl.map(c => new Path(smooth(c, 10)));
      const rivers = F.rivers.map(c => new Path(smooth(c, 12)));
      const chaos = L.theme === 'chaos';
      const coded = !!(B && CONFIG.mapStyle === 'coded' && window.MapArt), feat = coded ? MapArt.prepare(L, B, sc) : null;
      const probe = coded ? MapArt.okSpot(feat, paths) : B && window.ArtImg ? terrainProbe(ArtImg.bg(B.img), W, H) : null;
      const spots = pickSpots(paths, rivers, L.spots || 14, W, H, PW, chaos, probe);

      // ---- Cây cối / đá / vật trang trí (tránh đường, ô xây, sông) ----
      const decor = [], r2 = K.seeded(index * 31 + 7), mix = DECOR_MIX[L.theme] || DECOR_MIX.forest;
      const dense = L.theme === 'forest' ? 0.5 : L.theme === 'ice' ? 0.42 : 0.3, big = new Set(['mesa', 'wall']);
      const bigPts = [];
      for (let y = -10; y < H + 20; y += 44) for (let x = -10; x < W + 20; x += 44) {
        if (B) break;
        const jx = x + (r2() - 0.5) * 38, jy = y + (r2() - 0.5) * 38;
        const dp = distToPaths(paths, jx, jy);
        if (dp < PW / 2 + 32) continue;
        if (chaos && dp > 150) continue;
        if (jx > W - 130) continue;
        let near = false; for (const s of spots) if (Math.hypot(s.x - jx, s.y - jy) < 78) { near = true; break; }
        if (near) continue;
        let wet = false; for (const r of rivers) if (r.nearest(jx, jy).perp < 66) { wet = true; break; }
        if (wet) continue;
        for (const pd of (F.pond || [])) if (Math.hypot(pd[0] - jx, pd[1] - jy) < pd[2] + 36) wet = true;
        if (wet) continue;
        const edge = Math.min(jx, jy + 40, H - jy + 30) < 80, pChance = edge ? 0.9 : dp > 170 ? dense + 0.28 : dp > 110 ? dense * 0.7 : 0.06;
        if (r2() > pChance) continue;
        const kind = pickKind(mix, r2());
        if (big.has(kind)) { let clash = false; for (const b of bigPts) if (Math.hypot(b.x - jx, b.y - jy) < 130) { clash = true; break; } if (clash) continue; bigPts.push({ x: jx, y: jy }); }
        decor.push({ kind, x: jx, y: jy, s: (kind === 'tree' || kind === 'pine' ? 1.35 : 1.15) + r2() * 0.45, v: Math.floor(r2() * 3) });
      }
      // công trình đặc trưng theo vùng
      const extra = B ? [] : L.theme === 'castle' ?['house', 'turret', 'house', 'house', 'turret'] : L.theme === 'desert' ? ['tent', 'tent', 'tent'] : [];
      for (const kind of extra) {
        for (let tries = 0; tries < 80; tries++) {
          const x = 120 + r2() * (W - 330), y = 130 + r2() * (H - 260);
          if (distToPaths(paths, x, y) < PW / 2 + 80) continue;
          let bad = false; for (const s of spots) if (Math.hypot(s.x - x, s.y - y) < 110) { bad = true; break; }
          for (const b of decor) if (Math.hypot(b.x - x, b.y - y) < 60) { bad = true; break; }
          for (const r of rivers) if (r.nearest(x, y).perp < 80) bad = true;
          for (const b of bigPts) if (Math.hypot(b.x - x, b.y - y) < 120) bad = true;
          if (bad) continue; bigPts.push({ x, y }); decor.push({ kind, x, y, s: 1.2, v: Math.floor(r2() * 3) }); break;
        }
      }
      decor.sort((a, b) => a.y - b.y);

      const end = paths[0].points[paths[0].points.length - 1];
      // điểm đường đi bắt đầu lọt vào khung nhìn (cho nút gọi quái & cờ xuất phát)
      const entry = paths.map(p => { const q = {}; for (let d = 0; d < p.length; d += 8) { p.pointAt(d, q); if (q.x > 30 && q.y > 30 && q.x < W - 30 && q.y < H - 30) return d + 40; } return 70; });
      return { index, def: L, W, H, sc, image: B && !coded ? B.img : null, coded, feat, theme, paths, entry, river: rivers[0] || null, rivers, riverKind: F.kind, pond: F.pond || [], spots, decor: coded ? MapArt.decor(feat, paths, spots, W, H, L.theme, index * 31 + 7) : decor, exit: { x: end.x, y: end.y }, starts: paths.map(p => p.points[0]) };
    },

    /** Nền map ảnh thật: vẽ ảnh + cờ xuất phát + cờ phòng thủ ở cổng */
    renderImageBackground(map, res) {
      const W = map.W, H = map.H, T = map.def.theme;
      const c = document.createElement('canvas'); c.width = Math.ceil(W * res); c.height = Math.ceil(H * res);
      const g = c.getContext('2d'); g.scale(res, res); g.lineJoin = 'round'; g.lineCap = 'round';
      const im = window.ArtImg && ArtImg.bg(map.image, () => { if (window.Game && Game.map === map) Game.renderBg(); if (window.UI && UI._menuMap === map) { UI._menuBg = null; UI.paintMenu && UI.paintMenu(); } });
      if (im) { g.imageSmoothingQuality = 'high'; g.drawImage(im, 0, 0, W, H); }
      else { const th = map.theme, gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, shade(th.grass2, -0.3)); gr.addColorStop(1, shade(th.grass, -0.2)); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
      // viền tối nhẹ cho cảm giác chiều sâu
      const vg = g.createRadialGradient(W * 0.5, H * 0.5, Math.min(W, H) * 0.42, W * 0.5, H * 0.5, Math.max(W, H) * 0.72);
      vg.addColorStop(0, 'rgba(20,12,40,0)'); vg.addColorStop(1, 'rgba(20,12,40,0.32)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
      const tmp = {};
      map.paths.forEach((p, i) => { p.pointAt(map.entry[i] - 30, tmp); spawnFlag(g, tmp.x, tmp.y, T); });
      defendFlag(g, map.exit.x, map.exit.y, T);
      return c;
    },

    /* ================= VẼ NỀN ================= */
    renderBackground(map, res) {
      if (map.coded) return MapArt.render(map, res);
      if (map.image) return this.renderImageBackground(map, res);
      const W = map.W, H = map.H, th = map.theme, PW = CONFIG.pathWidth, T = map.def.theme;
      const c = document.createElement('canvas'); c.width = Math.ceil(W * res); c.height = Math.ceil(H * res);
      const g = c.getContext('2d'); g.scale(res, res); g.lineJoin = 'round'; g.lineCap = 'round';
      const rnd = K.seeded(map.index * 53 + 3), tmp = {};
      const blot = (x, y, r, col, a) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, K.alpha(col, a)); gr.addColorStop(1, K.alpha(col, 0)); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); };
      const drawPath = (p, w, col) => { g.beginPath(); p.points.forEach((pt, i) => i ? g.lineTo(pt.x, pt.y) : g.moveTo(pt.x, pt.y)); g.strokeStyle = col; g.lineWidth = w; g.stroke(); };

      /* 1) Mặt đất */
      if (T === 'chaos') groundChaos(g, map, th, rnd, blot);
      else {
        const base = g.createLinearGradient(0, 0, W * 0.3, H);
        base.addColorStop(0, shade(th.grass2, -0.08)); base.addColorStop(0.5, th.grass); base.addColorStop(1, shade(th.grass, 0.06));
        g.fillStyle = base; g.fillRect(0, 0, W, H);
        for (let i = 0; i < 80; i++) blot(rnd() * W, rnd() * H, 60 + rnd() * 160, rnd() < 0.5 ? th.grass2 : shade(th.grass2, -0.12), 0.55);
        for (let i = 0; i < 46; i++) blot(rnd() * W, rnd() * H, 50 + rnd() * 120, shade(th.grass, 0.28), 0.35);
        if (T === 'desert') groundDesert(g, W, H, th, rnd);
        else if (T === 'ice') groundIce(g, W, H, th, rnd);
        else if (T === 'lava') groundLava(g, W, H, th, rnd, blot);
        else groundGrass(g, W, H, th, rnd, T);
      }

      /* 2) Hồ / sông / dung nham (dưới đường) */
      for (const pd of map.pond) pond(g, pd[0], pd[1], pd[2], th, rnd);
      for (const r of map.rivers) river(g, r, map.riverKind, th, rnd, drawPath);

      /* 3) Đường đi */
      const pc = pathColors(T, th);
      for (const p of map.paths) drawPath(p, PW + 30, 'rgba(20,10,10,0.16)');
      for (const p of map.paths) drawPath(p, PW + 12, pc.edge);
      for (const p of map.paths) drawPath(p, PW + 4, shade(pc.fill, -0.1));
      for (const p of map.paths) drawPath(p, PW - 4, pc.fill);
      for (const p of map.paths) drawPath(p, PW * 0.62, K.alpha(shade(pc.fill, 0.14), 0.8));
      for (const p of map.paths) drawPath(p, PW * 0.3, K.alpha(shade(pc.fill, 0.24), 0.45));
      pathDetail(g, map, T, th, pc, rnd, tmp);
      if (T === 'chaos') for (const p of map.paths) { g.save(); g.globalCompositeOperation = 'lighter'; drawPath(p, PW + 6, 'rgba(176,112,255,0.28)'); drawPath(p, 3, 'rgba(235,200,255,0.8)'); g.restore(); }

      /* 4) Cầu bắc qua sông */
      for (const r of map.rivers) for (const p of map.paths) {
        let last = -999;
        for (let d = 0; d < p.length; d += 4) { p.pointAt(d, tmp); if (r.nearest(tmp.x, tmp.y).perp < 6 && d - last > 150) { last = d; drawBridge(g, tmp, PW, map.riverKind, T); } }
      }

      /* 5) Cây, đá, nhà */
      for (const d of map.decor) DECOR[d.kind] && (g.save(), g.translate(d.x, d.y), g.scale(d.s, d.s), DECOR[d.kind](g, th, d.v), g.restore());

      /* 6) Điểm xuất phát bên trái + cổng thành bên phải */
      for (const s of map.starts) spawnMark(g, s, T);
      paintGate(g, map, T);

      /* 7) Ánh sáng */
      g.save(); g.globalCompositeOperation = 'soft-light';
      const sun = g.createLinearGradient(0, 0, W, H * 0.8);
      if (T === 'lava') { sun.addColorStop(0, 'rgba(255,120,60,0.45)'); sun.addColorStop(1, 'rgba(60,20,80,0.4)'); }
      else if (T === 'chaos') { sun.addColorStop(0, 'rgba(200,120,255,0.35)'); sun.addColorStop(1, 'rgba(20,10,80,0.45)'); }
      else if (T === 'ice') { sun.addColorStop(0, 'rgba(255,255,255,0.5)'); sun.addColorStop(1, 'rgba(40,80,160,0.35)'); }
      else { sun.addColorStop(0, 'rgba(255,236,170,0.55)'); sun.addColorStop(0.55, 'rgba(255,236,170,0)'); sun.addColorStop(1, 'rgba(40,60,120,0.35)'); }
      g.fillStyle = sun; g.fillRect(0, 0, W, H); g.restore();
      g.save(); const vg = g.createRadialGradient(W * 0.5, H * 0.5, Math.min(W, H) * 0.35, W * 0.5, H * 0.5, Math.max(W, H) * 0.7);
      vg.addColorStop(0, 'rgba(20,12,40,0)'); vg.addColorStop(1, 'rgba(20,12,40,0.28)'); g.fillStyle = vg; g.fillRect(0, 0, W, H); g.restore();
      return c;
    }
  };

  /* ---------- Mặt đất theo vùng ---------- */
  function groundGrass(g, W, H, th, rnd, T) {
    g.save();
    for (let i = 0; i < 2600; i++) { const x = rnd() * W, y = rnd() * H; g.fillStyle = K.alpha(rnd() < 0.5 ? shade(th.grass, -0.2) : shade(th.grass, 0.22), 0.35); g.fillRect(x, y, 2.2, 1.1); }
    const tuftCols = [shade(th.grass, -0.22), shade(th.grass2, -0.12), shade(th.grass, 0.18)];
    for (let i = 0; i < 1700; i++) {
      const x = rnd() * W, y = rnd() * H, h = 4 + rnd() * 6, col = tuftCols[(rnd() * 3) | 0];
      g.fillStyle = col; g.beginPath(); g.moveTo(x - 3.4, y); g.quadraticCurveTo(x - 3, y - h * 0.6, x - 4.8, y - h); g.quadraticCurveTo(x - 1.2, y - h * 0.55, x, y - h * 1.2); g.quadraticCurveTo(x + 1, y - h * 0.5, x + 4.6, y - h * 0.9); g.quadraticCurveTo(x + 2.6, y - h * 0.4, x + 3.4, y); g.closePath(); g.fill();
    }
    const fc = ['#fff6a0', '#ffffff', '#ffb0c8', '#c8b0ff', '#ffd27a'];
    for (let i = 0; i < 90; i++) { const cx = rnd() * W, cy = rnd() * H, col = fc[(rnd() * fc.length) | 0], n = 3 + (rnd() * 6 | 0);
      for (let j = 0; j < n; j++) { const x = cx + (rnd() - 0.5) * 34, y = cy + (rnd() - 0.5) * 20; K.line(g, x, y + 4, x, y, shade(th.grass, -0.3), 1); for (let k = 0; k < 5; k++) { const an = k / 5 * TAU; K.dot(g, x + Math.cos(an) * 1.9, y + Math.sin(an) * 1.9, 1.5, col); } K.dot(g, x, y, 1.1, '#f2a83a'); } }
    if (T === 'castle') { // thảm đá lát quanh khu thành
      for (let i = 0; i < 18; i++) { const x = 150 + rnd() * (W - 400), y = 120 + rnd() * (H - 240), r = 24 + rnd() * 30; g.fillStyle = 'rgba(190,184,172,0.5)'; g.beginPath(); g.ellipse(x, y, r * 1.6, r, 0, 0, TAU); g.fill();
        g.strokeStyle = 'rgba(90,80,90,0.3)'; g.lineWidth = 1; for (let k = 0; k < 4; k++) { g.beginPath(); g.ellipse(x, y, r * 1.6 * (k + 1) / 4, r * (k + 1) / 4, 0, 0, TAU); g.stroke(); } }
    }
    g.restore();
  }
  function groundDesert(g, W, H, th, rnd) {
    for (let i = 0; i < 26; i++) { // cồn cát
      const x = rnd() * W, y = rnd() * H, r = 90 + rnd() * 170;
      g.save(); g.translate(x, y); g.scale(1.9, 0.5);
      g.fillStyle = K.alpha(shade(th.grass, -0.16), 0.5); g.beginPath(); g.arc(0, 18, r, Math.PI * 1.05, Math.PI * 1.95); g.fill();
      g.fillStyle = K.alpha(shade(th.grass, 0.3), 0.55); g.beginPath(); g.arc(-8, 0, r, Math.PI * 1.08, Math.PI * 1.7); g.fill(); g.restore();
    }
    g.strokeStyle = K.alpha(shade(th.grass, -0.25), 0.3); g.lineWidth = 1.2;
    for (let i = 0; i < 400; i++) { const x = rnd() * W, y = rnd() * H, w = 10 + rnd() * 22; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + w / 2, y - 3, x + w, y); g.stroke(); }
    for (let i = 0; i < 700; i++) K.dot(g, rnd() * W, rnd() * H, 0.8 + rnd() * 1.2, rnd() < 0.5 ? K.alpha(shade(th.grass, 0.4), 0.7) : K.alpha(shade(th.grass, -0.3), 0.5));
  }
  function groundIce(g, W, H, th, rnd) {
    for (let i = 0; i < 40; i++) { const x = rnd() * W, y = rnd() * H, r = 40 + rnd() * 100; g.fillStyle = K.alpha(rnd() < 0.5 ? '#a8d4f4' : '#ffffff', 0.28); g.beginPath(); g.ellipse(x, y, r * 1.5, r * 0.7, rnd(), 0, TAU); g.fill(); }
    g.strokeStyle = 'rgba(120,170,210,0.4)'; g.lineWidth = 1.1;
    for (let i = 0; i < 140; i++) { let x = rnd() * W, y = rnd() * H; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 4; k++) { x += (rnd() - 0.5) * 50; y += (rnd() - 0.3) * 30; g.lineTo(x, y); } g.stroke(); }
    for (let i = 0; i < 520; i++) K.dot(g, rnd() * W, rnd() * H, 0.9 + rnd() * 1.6, 'rgba(255,255,255,0.85)');
  }
  function groundLava(g, W, H, th, rnd, blot) {
    for (let i = 0; i < 60; i++) blot(rnd() * W, rnd() * H, 40 + rnd() * 100, '#1a0c0c', 0.5);
    g.lineCap = 'round';
    for (let i = 0; i < 70; i++) { // khe nứt phát sáng
      let x = rnd() * W, y = rnd() * H; const pts = [[x, y]];
      for (let k = 0; k < 5; k++) { x += (rnd() - 0.5) * 80; y += (rnd() - 0.5) * 60; pts.push([x, y]); }
      g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(255,90,20,0.25)'; g.lineWidth = 7; g.beginPath(); pts.forEach((p, k) => k ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke();
      g.strokeStyle = 'rgba(255,170,60,0.85)'; g.lineWidth = 1.6; g.stroke(); g.restore();
    }
    for (let i = 0; i < 30; i++) K.glow(g, rnd() * W, rnd() * H, 40 + rnd() * 40, '#ff5a1a', 0.18);
    for (let i = 0; i < 500; i++) K.dot(g, rnd() * W, rnd() * H, 0.8 + rnd() * 1.4, rnd() < 0.5 ? 'rgba(255,150,60,0.7)' : 'rgba(0,0,0,0.35)');
  }
  function groundChaos(g, map, th, rnd, blot) {
    const W = map.W, H = map.H;
    const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#0c0620'); sky.addColorStop(0.5, '#1e0e44'); sky.addColorStop(1, '#2a1250');
    g.fillStyle = sky; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 14; i++) blot(rnd() * W, rnd() * H, 120 + rnd() * 220, rnd() < 0.5 ? '#7a2ab8' : '#c03a9a', 0.22);
    for (let i = 0; i < 380; i++) K.dot(g, rnd() * W, rnd() * H, 0.5 + rnd() * 1.3, 'rgba(255,255,255,' + (0.3 + rnd() * 0.6) + ')');
    for (let i = 0; i < 26; i++) { // đảo bay xa
      const x = rnd() * W, y = rnd() * H, r = 18 + rnd() * 38;
      g.fillStyle = 'rgba(40,24,80,0.8)'; g.beginPath(); g.ellipse(x, y, r * 1.6, r * 0.5, 0, 0, TAU); g.fill();
      g.beginPath(); g.moveTo(x - r * 1.5, y); g.lineTo(x, y + r * 1.5); g.lineTo(x + r * 1.5, y); g.closePath(); g.fillStyle = 'rgba(28,16,60,0.9)'; g.fill();
    }
    // đảo chính = hợp các đĩa quanh đường
    const disc = () => { g.beginPath(); for (const p of map.paths) for (let i = 0; i < p.points.length; i += 2) { const q = p.points[i]; g.moveTo(q.x + 150, q.y); g.arc(q.x, q.y, 150, 0, TAU); } };
    g.save(); g.translate(0, 22); disc(); g.fillStyle = '#1a0e38'; g.fill(); g.restore();
    g.save(); g.translate(0, 12); disc(); g.fillStyle = '#35216a'; g.fill(); g.restore();
    disc(); const gr = g.createLinearGradient(0, 0, W, H); gr.addColorStop(0, '#6a58a8'); gr.addColorStop(1, '#46367e'); g.fillStyle = gr; g.fill();
    g.save(); disc(); g.clip();
    for (let i = 0; i < 90; i++) blot(rnd() * W, rnd() * H, 40 + rnd() * 90, rnd() < 0.5 ? '#8a78c8' : '#2c1e5a', 0.4);
    g.strokeStyle = 'rgba(200,140,255,0.22)'; g.lineWidth = 1.1;
    for (let i = 0; i < 120; i++) { let x = rnd() * W, y = rnd() * H; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 3; k++) { x += (rnd() - 0.5) * 50; y += (rnd() - 0.5) * 36; g.lineTo(x, y); } g.stroke(); }
    g.restore();
  }

  /* ---------- Đường đi ---------- */
  function pathColors(T, th) {
    if (T === 'castle') return { fill: '#b9b2a2', edge: '#6e6a62' };
    if (T === 'ice') return { fill: '#b8cadc', edge: '#6a8098' };
    if (T === 'lava') return { fill: '#8a6a58', edge: '#c0502a' };
    if (T === 'chaos') return { fill: '#7a6ab0', edge: '#b070ff' };
    return { fill: th.dirt, edge: th.dirtEdge };
  }
  function pathDetail(g, map, T, th, pc, rnd, tmp) {
    const PW = CONFIG.pathWidth;
    for (const p of map.paths) for (const off of [-PW * 0.2, PW * 0.2]) {
      g.beginPath(); let first = true;
      for (let d = 0; d < p.length; d += 8) { p.pointAt(d, tmp); const x = tmp.x + tmp.nx * off, y = tmp.y + tmp.ny * off; if (first) { g.moveTo(x, y); first = false; } else g.lineTo(x, y); }
      g.strokeStyle = K.alpha(shade(pc.fill, -0.22), T === 'castle' ? 0.2 : 0.3); g.lineWidth = 3.2; g.stroke();
    }
    for (const p of map.paths) for (let d = 0; d < p.length; d += 6) {
      p.pointAt(d, tmp);
      if (T === 'castle' && rnd() < 0.6) { // gạch lát
        g.save(); g.translate(tmp.x, tmp.y); g.rotate(Math.atan2(tmp.ty, tmp.tx)); g.strokeStyle = 'rgba(60,50,60,0.4)'; g.lineWidth = 1; g.strokeRect(-6, -PW / 2 + 5, 12, 14); g.strokeRect(-3, -4, 12, 14); g.strokeRect(-6, PW / 2 - 19, 12, 14); g.restore();
      }
      if (rnd() < 0.45) { const o = (rnd() - 0.5) * (PW - 12), x = tmp.x + tmp.nx * o, y = tmp.y + tmp.ny * o, r = 1.2 + rnd() * 2.6;
        g.fillStyle = K.alpha(shade(pc.fill, -0.35), 0.45); g.beginPath(); g.ellipse(x + 0.6, y + 0.8, r, r * 0.7, 0, 0, TAU); g.fill();
        g.fillStyle = rnd() < 0.5 ? shade(th.rock, 0.1) : shade(pc.fill, 0.25); g.beginPath(); g.ellipse(x, y, r, r * 0.68, 0, 0, TAU); g.fill(); }
      if (T === 'lava' && rnd() < 0.12) K.glow(g, tmp.x + (rnd() - 0.5) * PW * 0.7, tmp.y + (rnd() - 0.5) * PW * 0.7, 10, '#ff6a1a', 0.5);
      if (T === 'chaos' && rnd() < 0.06) { g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(230,190,255,0.7)'; g.lineWidth = 1.2; g.strokeRect(tmp.x - 4, tmp.y - 4, 8, 8); g.restore(); }
      if ((T === 'forest' || T === 'castle') && rnd() < 0.85) { const sd = rnd() < 0.5 ? -1 : 1, o = sd * (PW / 2 + 1 + rnd() * 5), x = tmp.x + tmp.nx * o, y = tmp.y + tmp.ny * o, h = 4 + rnd() * 6;
        g.fillStyle = rnd() < 0.5 ? th.grass : shade(th.grass, 0.12); g.beginPath(); g.moveTo(x - 4, y + 2); g.quadraticCurveTo(x - 3, y - h * 0.5, x - 5, y - h); g.quadraticCurveTo(x - 1, y - h * 0.4, x, y - h * 1.15); g.quadraticCurveTo(x + 1.2, y - h * 0.4, x + 5, y - h * 0.85); g.quadraticCurveTo(x + 3, y - h * 0.3, x + 4, y + 2); g.closePath(); g.fill(); }
    }
  }

  /* ---------- Sông / hồ ---------- */
  function river(g, r, kind, th, rnd, drawPath) {
    const tmp = {};
    if (kind === 'lava') {
      drawPath(r, 124, '#1a0c0c'); drawPath(r, 106, '#3a1810');
      drawPath(r, 92, '#e8480e'); drawPath(r, 64, '#ff8a1e'); drawPath(r, 30, '#ffd85a');
      g.save(); g.globalCompositeOperation = 'lighter'; drawPath(r, 150, 'rgba(255,90,20,0.16)'); g.restore();
      for (let d = 0; d < r.length; d += 22) { r.pointAt(d, tmp); const o = (rnd() - 0.5) * 60; K.line(g, tmp.x + tmp.nx * o - 10, tmp.y + tmp.ny * o, tmp.x + tmp.nx * o + 10, tmp.y + tmp.ny * o + 2, 'rgba(120,20,0,0.5)', 2.2); }
      return;
    }
    if (kind === 'ice') {
      drawPath(r, 120, '#7a98b0'); drawPath(r, 104, '#a8d0ea'); drawPath(r, 88, '#cfeaf8'); drawPath(r, 40, 'rgba(255,255,255,0.6)');
      g.strokeStyle = 'rgba(80,130,180,0.55)'; g.lineWidth = 1.2;
      for (let d = 0; d < r.length; d += 30) { r.pointAt(d, tmp); const o = (rnd() - 0.5) * 70; g.beginPath(); g.moveTo(tmp.x + tmp.nx * o, tmp.y + tmp.ny * o); g.lineTo(tmp.x + tmp.nx * o + 16, tmp.y + tmp.ny * o + (rnd() - 0.5) * 20); g.lineTo(tmp.x + tmp.nx * o + 30, tmp.y + tmp.ny * o + (rnd() - 0.5) * 10); g.stroke(); }
      return;
    }
    drawPath(r, 112, shade(th.dirt, 0.1)); drawPath(r, 98, shade(th.water, -0.25)); drawPath(r, 86, th.water); drawPath(r, 42, K.alpha(shade(th.water, 0.2), 0.6));
    for (let d = 0; d < r.length; d += 26) { r.pointAt(d, tmp); const o = (rnd() - 0.5) * 60; K.line(g, tmp.x + tmp.nx * o - 8, tmp.y + tmp.ny * o, tmp.x + tmp.nx * o + 8, tmp.y + tmp.ny * o, 'rgba(255,255,255,0.55)', 2); }
  }
  function pond(g, x, y, r, th, rnd) {
    g.fillStyle = '#c8a860'; g.beginPath(); g.ellipse(x, y, r * 1.5 + 12, r * 0.8 + 10, 0, 0, TAU); g.fill();
    g.fillStyle = shade(th.water, -0.2); g.beginPath(); g.ellipse(x, y, r * 1.5, r * 0.8, 0, 0, TAU); g.fill();
    g.fillStyle = th.water; g.beginPath(); g.ellipse(x - 4, y - 3, r * 1.35, r * 0.68, 0, 0, TAU); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.45)'; g.beginPath(); g.ellipse(x - r * 0.4, y - r * 0.2, r * 0.5, r * 0.12, 0, 0, TAU); g.fill();
    for (const [dx, dy] of [[-r * 1.5, -4], [r * 1.5, 3], [0, -r * 0.8]]) { g.save(); g.translate(x + dx, y + dy); DECOR.palm(g, th, 0); g.restore(); }
  }

  function drawBridge(g, p, PW, kind, T) {
    g.save(); g.translate(p.x, p.y); g.rotate(Math.atan2(p.ty, p.tx));
    const L = 132, w = PW + 8, wood = T === 'forest' || T === 'desert';
    const base = wood ? '#a87a46' : T === 'lava' ? '#5a4a48' : T === 'ice' ? '#bcd0e0' : '#b8a890', rail = wood ? '#7a5230' : T === 'lava' ? '#3a2c2c' : '#9a8e7a';
    K.shadow(g, 6, 10, L * 0.55, w * 0.5, 0.35);
    K.rr(g, -L / 2, -w / 2, L, w, 8, base, { s: 4, h: 2 });
    g.strokeStyle = 'rgba(40,20,20,0.35)'; g.lineWidth = 1.2;
    for (let x = -L / 2 + 12; x < L / 2; x += 12) { g.beginPath(); g.moveTo(x, -w / 2 + 3); g.lineTo(x, w / 2 - 3); g.stroke(); }
    for (const s of [-1, 1]) { K.rr(g, -L / 2 - 2, s * w / 2 - 5, L + 4, 10, 4, rail, { s: 2.4, h: 1 }); for (const x of [-L / 2, 0, L / 2]) K.rr(g, x - 6, s * w / 2 - 8, 12, 16, 4, shade(rail, -0.08), { s: 2.4, h: 1 }); }
    g.restore();
  }

  /* ---------- Điểm quái xuất hiện (trái) & cổng thành (phải) ---------- */
  function spawnMark(g, s, T) {
    const y = s.y, col = T === 'chaos' ? '#d070ff' : '#c02a3a';
    K.glow(g, 14, y, 110, col, 0.55);
    for (const sd of [-1, 1]) {
      const py = y + sd * 52; K.limb(g, 18, py + 6, 18, py - 40, 4, '#3a2a30');
      K.cel(g, c => { c.moveTo(20, py - 40); c.lineTo(46, py - 34); c.lineTo(36, py - 24); c.lineTo(46, py - 14); c.lineTo(20, py - 8); c.closePath(); }, T === 'chaos' ? '#6a2ab0' : '#8a1a22', { s: 2, h: 1, lw: 1.8 });
      K.dot(g, 33, py - 24, 3.4, '#f4e6c8');
    }
    g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = K.alpha(col, 0.8); g.lineWidth = 3; g.beginPath(); g.ellipse(10, y, 22, 54, 0, 0, TAU); g.stroke(); g.restore();
  }
  /* Cờ đỏ nơi quái xuất hiện (kiểu Kingdom Rush) */
  function spawnFlag(g, x, y, T) {
    const col = T === 'chaos' ? '#7a2ac0' : '#a8202a';
    g.save(); g.globalAlpha = 0.5; g.strokeStyle = col; g.lineWidth = 3; g.setLineDash([8, 6]); g.beginPath(); g.ellipse(x, y, 38, 15, 0, 0, TAU); g.stroke(); g.restore();
    K.shadow(g, x + 30, y - 8, 10, 4, 0.4);
    if (window.Fx3D && Fx3D.flag(g, x + 30, y - 4, 54, col, 0.6, 1, '#f4e6c8')) return;
    K.limb(g, x + 30, y - 6, x + 30, y - 58, 3, '#4a3020');
    K.cel(g, c => { c.moveTo(x + 31, y - 58); c.lineTo(x + 58, y - 52); c.lineTo(x + 48, y - 43); c.lineTo(x + 58, y - 34); c.lineTo(x + 31, y - 34); c.closePath(); }, col, { s: 2, h: 1, lw: 1.8 });
    K.dot(g, x + 42, y - 46, 4, '#f4e6c8'); K.dot(g, x + 40.5, y - 47, 1, '#2a1010'); K.dot(g, x + 43.5, y - 47, 1, '#2a1010');
  }
  /* Cờ xanh nơi cần bảo vệ (quái tới đây là mất mạng) */
  function defendFlag(g, x, y, T) {
    g.save(); g.globalAlpha = 0.55; g.strokeStyle = '#7ad0ff'; g.lineWidth = 3; g.beginPath(); g.ellipse(x, y, 34, 13, 0, 0, TAU); g.stroke(); g.restore();
    K.shadow(g, x - 26, y + 2, 10, 4, 0.4);
    if (window.Fx3D && Fx3D.flag(g, x - 26, y + 3, 59, '#2a5ab8', 0.3, 1, '#f2c14e')) return;
    K.limb(g, x - 26, y + 3, x - 26, y - 56, 3, '#4a3020');
    K.cel(g, c => { c.moveTo(x - 25, y - 56); c.lineTo(x + 2, y - 56); c.lineTo(x + 2, y - 36); c.lineTo(x - 11, y - 30); c.lineTo(x - 25, y - 36); c.closePath(); }, '#2a5ab8', { s: 2, h: 1, lw: 1.8 });
    K.cel(g, c => { c.moveTo(x - 17, y - 50); c.lineTo(x - 6, y - 50); c.lineTo(x - 6, y - 42); c.lineTo(x - 11.5, y - 38); c.lineTo(x - 17, y - 42); c.closePath(); }, '#f2c14e', { s: 1, h: 0.6, lw: 1.2 });
  }
  function paintGate(g, map, T) {
    const W = map.W, H = map.H, ey = map.exit.y, PW = CONFIG.pathWidth;
    const ST = T === 'lava' ? '#8a8490' : T === 'chaos' ? '#a89cc8' : T === 'ice' ? '#d4dce8' : '#c2bccc';
    const x0 = W - 92;
    K.shadow(g, x0 - 4, H / 2, 40, H * 0.55, 0.35);
    K.rr(g, x0, -12, 104, H + 24, 0, ST, { s: 8, h: 3 });
    g.save(); g.beginPath(); g.rect(x0, 0, 100, H); g.clip(); g.strokeStyle = 'rgba(40,20,50,0.28)'; g.lineWidth = 1.4;
    for (let r = 0, y = 12; y < H; y += 16, r++) { g.beginPath(); g.moveTo(x0, y); g.lineTo(W, y); g.stroke(); for (let x = x0 + (r % 2) * 18; x < W; x += 36) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 16); g.stroke(); } }
    g.restore();
    for (let y = 4; y < H; y += 40) K.rr(g, x0 - 16, y, 22, 24, 3, shade(ST, 0.08), { s: 3, h: 1.4 });
    // lối vào
    const gh = PW + 30;
    K.cel(g, c => { c.moveTo(x0 - 2, ey + gh / 2); c.lineTo(x0 - 2, ey - gh / 2 + 22); c.arc(x0 + 22, ey - gh / 2 + 22, 24, Math.PI, Math.PI * 1.5); c.lineTo(W, ey - gh / 2 - 2); c.lineTo(W, ey + gh / 2); c.closePath(); }, '#2a1828', { s: 0, h: 0, lw: 3 });
    K.glow(g, x0 + 40, ey, 60, '#ffc860', 0.5);
    g.strokeStyle = '#3a2418'; g.lineWidth = 4; for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(x0 + 6, ey + i * 14); g.lineTo(x0 + 50, ey + i * 14); g.stroke(); }
    // 2 tháp canh
    for (const sd of [-1, 1]) {
      const ty = ey + sd * (gh / 2 + 78);
      K.circ(g, W - 52, ty, 46, shade(ST, 0.05), { s: 8, h: 3 });
      for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; K.rr(g, W - 52 + Math.cos(a) * 40 - 6, ty + Math.sin(a) * 40 - 6, 13, 13, 2, shade(ST, 0.1), { s: 2, h: 1 }); }
      K.cel(g, c => { c.moveTo(W - 52 - 6, ty - 8); c.lineTo(W - 52 - 6, ty - 20); c.arc(W - 52, ty - 20, 6, Math.PI, 0); c.lineTo(W - 52 + 6, ty - 8); c.closePath(); }, '#ffd070', { s: 0, h: 1.6, light: '#fff6c0', lw: 2 });
      K.line(g, W - 52, ty - 28, W - 52, ty - 66, '#6b4426', 3);
      K.cel(g, c => { c.moveTo(W - 50, ty - 66); c.lineTo(W - 20, ty - 58); c.lineTo(W - 50, ty - 46); c.closePath(); }, '#3d6fc0', { s: 2, h: 1, lw: 2 });
    }
  }

  window.Level = Level;
})();
