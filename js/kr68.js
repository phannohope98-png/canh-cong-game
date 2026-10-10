/* Revision 68 – bản đồ kiểu Kingdom Rush.
 * - Đường rộng, cát ấm, viền đất đậm + nét mực, giữa sáng hơn, vệt bánh xe, sỏi, cỏ lấn mép.
 * - Nền tươi, loang màu lớn/nhỏ, cụm cỏ có viền, hoa, đá, đất mòn quanh đường, tối dần ra mép.
 * - Ô đặt trụ: bệ đất tròn có viền đá + biển gỗ, đặt sát đường ở khúc cua/ngã ba, theo cặp.
 * - Cây cối đóng khung bản đồ (mép trên/dưới/hai bên) + vài lùm giữa bãi trống, không che đường/trụ. */
(function () {
  const K = ArtKit, TAU = Math.PI * 2;
  CONFIG.pathWidth = 50;
  const PAL = {
    forest: { g: '#78a83a', gl: '#9ccb52', gd: '#55862a', tuft: '#3f6d22', tuftL: '#8cc145', dirt: '#a98a4e', flower: ['#ffffff', '#ffe25a', '#ff9db4'], stone: '#b3ae9c', road: '#e2bf76', roadL: '#f2d99a', roadRim: '#b88a4b', roadInk: '#5e3f22', rut: '#c49f5e' },
    castle: { g: '#8aae46', gl: '#a9cb5e', gd: '#668b31', tuft: '#4b7428', tuftL: '#a0c85a', dirt: '#ab8f58', flower: ['#ffffff', '#ffd75a', '#c9a6ff'], stone: '#b9b4a6', road: '#dcc08a', roadL: '#ecd9aa', roadRim: '#a9885a', roadInk: '#56402a', rut: '#bea16f' },
    desert: { g: '#e0b468', gl: '#f0cb86', gd: '#c3954d', tuft: '#8e7a32', tuftL: '#c3ad55', dirt: '#c58c52', flower: ['#f7e9b5'], stone: '#c9a77d', road: '#f3dba6', roadL: '#fdedc6', roadRim: '#c99858', roadInk: '#7a4f2a', rut: '#e0bd84' },
    ice: { g: '#e4eef3', gl: '#ffffff', gd: '#bfd3dd', tuft: '#8fabb9', tuftL: '#d0e2ea', dirt: '#b3c6d0', flower: ['#ffffff'], stone: '#9fb1bd', road: '#cbdbe3', roadL: '#e3edf2', roadRim: '#8eaab9', roadInk: '#4a6676', rut: '#b4c8d3' },
    lava: { g: '#5c4946', gl: '#76605a', gd: '#433331', tuft: '#33262a', tuftL: '#86685a', dirt: '#7a503e', flower: ['#ff8a3a', '#ffc35a'], stone: '#746866', road: '#8e7867', roadL: '#a18a77', roadRim: '#6c5244', roadInk: '#2a1e1c', rut: '#8d7562' },
    chaos: { g: '#5e567f', gl: '#7a709f', gd: '#443d61', tuft: '#353054', tuftL: '#9584c0', dirt: '#6b5e86', flower: ['#d9a8ff', '#9ff0ff'], stone: '#7e7799', road: '#a69dba', roadL: '#beb6cf', roadRim: '#6c6390', roadInk: '#272240', rut: '#9087a9' }
  };
  const pal = m => PAL[m.def.theme] || PAL.forest;
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; };
  const nearRoad = (m, x, y) => { let b = 1e9; for (const p of m.paths) b = Math.min(b, p.nearest(x, y).perp); return b; };

  function tuft(p, x, y, s, P) {
    p.fillStyle = P.tuft; p.beginPath(); p.moveTo(x - 5 * s, y); p.quadraticCurveTo(x - 5 * s, y - 4 * s, x - 7.5 * s, y - 8 * s); p.quadraticCurveTo(x - 2 * s, y - 5 * s, x - 1 * s, y - 10.5 * s);
    p.quadraticCurveTo(x + 1 * s, y - 5 * s, x + 6.5 * s, y - 9 * s); p.quadraticCurveTo(x + 4 * s, y - 4 * s, x + 5 * s, y); p.closePath(); p.fill();
    p.fillStyle = P.tuftL; p.beginPath(); p.moveTo(x - 2.6 * s, y - .8 * s); p.quadraticCurveTo(x - 2.2 * s, y - 4 * s, x - 4 * s, y - 6.2 * s); p.quadraticCurveTo(x - .6 * s, y - 4 * s, x, y - 7.5 * s); p.quadraticCurveTo(x + .6 * s, y - 3 * s, x + 2.6 * s, y - .8 * s); p.closePath(); p.fill();
  }
  function stone(p, x, y, r, P) {
    p.fillStyle = K.alpha(P.roadInk, .35); p.beginPath(); p.ellipse(x + .6, y + .9, r * 1.1, r * .7, 0, 0, TAU); p.fill();
    p.fillStyle = P.stone; p.strokeStyle = P.roadInk; p.lineWidth = .8; p.beginPath(); p.ellipse(x, y, r, r * .66, 0, 0, TAU); p.fill(); p.stroke();
    p.fillStyle = 'rgba(255,255,255,.45)'; p.beginPath(); p.ellipse(x - r * .3, y - r * .25, r * .4, r * .22, 0, 0, TAU); p.fill();
  }

  /* ---------- Nền ---------- */
  function ground(m, res) {
    const P = pal(m), W = m.W, H = m.H, PW = CONFIG.pathWidth, c = mk(W * res, H * res), p = c.getContext('2d'), rnd = K.seeded(m.index * 977 + 31);
    p.scale(res, res); p.fillStyle = P.g; p.fillRect(0, 0, W, H);
    const blob = (x, y, r, col, a) => { const gr = p.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, K.alpha(col, a)); gr.addColorStop(1, K.alpha(col, 0)); p.fillStyle = gr; p.fillRect(x - r, y - r, 2 * r, 2 * r); };
    for (let i = 0; i < 30; i++) blob(rnd() * W, rnd() * H, 55 + rnd() * 110, rnd() < .5 ? P.gl : P.gd, .5);
    for (let i = 0; i < 1100; i++) { const x = rnd() * W, y = rnd() * H; p.fillStyle = K.alpha(rnd() < .5 ? P.gl : P.gd, .2); p.beginPath(); p.ellipse(x, y, 3 + rnd() * 10, 1.5 + rnd() * 3.5, 0, 0, TAU); p.fill(); }
    const q = {};
    for (const path of m.paths) for (let d = 0; d < path.length; d += 9) { path.pointAt(d, q); for (const s of [-1, 1]) { if (rnd() < .45) continue; const off = PW / 2 + 3 + rnd() * 16, x = q.x + q.nx * off * s, y = q.y + q.ny * off * s; p.fillStyle = K.alpha(P.dirt, .2 + rnd() * .12); p.beginPath(); p.ellipse(x, y, 6 + rnd() * 13, 3 + rnd() * 5, 0, 0, TAU); p.fill(); } }
    const free = (x, y, r) => nearRoad(m, x, y) > PW / 2 + r && !MapArt.wetAt(m.feat, x, y, r);
    const TP = { tuft: K.shade(P.g, -.2), tuftL: K.shade(P.g, .12) };
    for (let i = 0; i < 95; i++) { const cx = rnd() * W, cy = rnd() * H; if (!free(cx, cy, 8)) continue; const n = 2 + (rnd() * 4 | 0); for (let j = 0; j < n; j++) { const x = cx + (rnd() - .5) * 24, y = cy + (rnd() - .5) * 10; if (free(x, y, 6)) tuft(p, x, y, .6 + rnd() * .5, TP); } }
    for (let i = 0; i < 45; i++) { const cx = rnd() * W, cy = rnd() * H; if (!free(cx, cy, 14)) continue; const col = P.flower[(rnd() * P.flower.length) | 0]; for (let j = 0; j < 5; j++) { const x = cx + (rnd() - .5) * 24, y = cy + (rnd() - .5) * 10; p.fillStyle = K.alpha(P.roadInk, .55); p.beginPath(); p.arc(x, y + .4, 1.9, 0, TAU); p.fill(); p.fillStyle = col; p.beginPath(); p.arc(x, y, 1.45, 0, TAU); p.fill(); } }
    for (let i = 0; i < 55; i++) { const x = rnd() * W, y = rnd() * H; if (free(x, y, 6)) stone(p, x, y, 1.6 + rnd() * 2.6, P); }
    const vg = p.createRadialGradient(W / 2, H / 2, H * .38, W / 2, H / 2, W * .64); vg.addColorStop(0, K.alpha(P.gd, 0)); vg.addColorStop(1, K.alpha(P.gd, .6)); p.fillStyle = vg; p.fillRect(0, 0, W, H);
    return c;
  }

  /* ---------- Đường ---------- */
  function road(g, m) {
    const P = pal(m), PW = CONFIG.pathWidth, rnd = K.seeded(m.index * 131 + 7), q = {}, theme = m.def.theme;
    const polys = m.paths.map(p => { const pts = []; for (let d = 0; d <= p.length; d += 4) { p.pointAt(Math.min(d, p.length), q); pts.push([q.x, q.y]); } p.pointAt(p.length, q); pts.push([q.x, q.y]); return pts; });
    const stroke = (w, col) => { g.strokeStyle = col; g.lineWidth = w; g.lineJoin = 'round'; g.lineCap = 'round'; for (const pts of polys) { g.beginPath(); pts.forEach((v, i) => i ? g.lineTo(v[0], v[1]) : g.moveTo(v[0], v[1])); g.stroke(); } };
    const bumps = [];
    for (const path of m.paths) for (let d = 6; d < path.length; d += 7) { path.pointAt(d, q); for (const s of [-1, 1]) if (rnd() < .55) bumps.push([q.x + q.nx * (PW / 2 + 1) * s, q.y + q.ny * (PW / 2 + 1) * s, 2 + rnd() * 4]); }
    g.save();
    g.save(); g.globalAlpha = .28; g.translate(0, 4); stroke(PW + 12, P.roadInk); g.restore();
    g.fillStyle = P.roadInk; for (const [x, y, r] of bumps) { g.beginPath(); g.arc(x, y, r + 2.4, 0, TAU); g.fill(); }
    stroke(PW + 8, P.roadInk);
    g.fillStyle = P.roadRim; for (const [x, y, r] of bumps) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
    stroke(PW + 3, P.roadRim);
    stroke(PW - 2, P.road);
    g.globalAlpha = .4; stroke(PW * .7, P.roadL); g.globalAlpha = .5; stroke(PW * .42, P.roadL); g.globalAlpha = 1;
    // inner = cách tâm con đường đủ xa mép
    const inside = (x, y, pad) => nearRoad(m, x, y) < PW / 2 - pad;
    if (!['lava', 'chaos'].includes(theme)) for (const path of m.paths) for (const off of [-.2, .2]) {
      g.strokeStyle = K.alpha(P.rut, .5); g.lineWidth = 2; g.beginPath(); let on = false;
      for (let d = 0; d <= path.length; d += 5) { path.pointAt(d, q); const x = q.x + q.nx * PW * off, y = q.y + q.ny * PW * off; if (inside(x, y, 4)) { on ? g.lineTo(x, y) : g.moveTo(x, y); on = true; } else on = false; }
      g.stroke();
    }
    for (const path of m.paths) for (let d = 0; d < path.length; d += 2.5) {
      path.pointAt(d, q); const off = (rnd() - .5) * PW * .86, x = q.x + q.nx * off, y = q.y + q.ny * off; if (!inside(x, y, 2)) continue;
      const dark = rnd() < .55; g.fillStyle = K.alpha(dark ? P.rut : P.roadL, dark ? .55 : .8); g.beginPath(); g.ellipse(x, y, .7 + rnd() * 1.4, .5 + rnd() * .8, 0, 0, TAU); g.fill();
      if (rnd() < .035) stone(g, x, y, 1.2 + rnd() * 1.6, P);
    }
    // cỏ lấn mép đường
    if (!['lava', 'chaos', 'desert'].includes(theme)) { const GP = { ...P, tuft: K.shade(P.g, -.25), tuftL: P.g }; for (const path of m.paths) for (let d = 8; d < path.length; d += 9) { path.pointAt(d, q); for (const s of [-1, 1]) { if (rnd() < .5) continue; const x = q.x + q.nx * (PW / 2 + 2) * s, y = q.y + q.ny * (PW / 2 + 2) * s; if (nearRoad(m, x, y) < PW / 2 - 1 || MapArt.wetAt(m.feat, x, y, 4)) continue; tuft(g, x, y, .5 + rnd() * .35, GP); } } }
    g.restore();
    return true;
  }

  /* ---------- Vị trí đặt trụ ---------- */
  function placeSpots(m) {
    const PW = CONFIG.pathWidth, W = m.W, H = m.H, want = m.def.spots || 8, q = {};
    const samples = []; for (const p of m.paths) for (let d = 0; d <= p.length; d += 10) { p.pointAt(d, q); if (q.x > -5 && q.x < W + 5 && q.y > -5 && q.y < H + 5) samples.push([q.x, q.y]); }
    const big = m.feat.props.filter(pr => ['castle', 'fort', 'portal', 'gateway', 'monument'].includes(pr.k) || pr.gate58 || pr.gate59);
    const fits = (x, y) => {
      if (x < 48 || x > W - 48 || y < 92 || y > H - 64) return false;
      for (const [dx, dy] of [[0, 0], [-32, 0], [32, 0], [-20, -9], [20, -9], [-20, 9], [20, 9], [0, 11], [0, -12]]) if (nearRoad(m, x + dx, y + dy) < PW / 2 + 4) return false;
      for (const [dx, dy] of [[-26, -30], [26, -30], [0, -46], [-16, -64], [16, -64]]) if (nearRoad(m, x + dx, y + dy) < PW / 2 - 6) return false;
      if (MapArt.wetAt(m.feat, x, y, 36) || MapArt.wetAt(m.feat, x, y - 40, 24)) return false;
      if (big.some(pr => Math.abs(pr.x - x) < 90 && pr.y > y - 60 && pr.y < y + 130)) return false;
      return true;
    };
    const ends = []; for (const p of m.paths) { let a = null, b = null; for (let d = 0; d <= p.length; d += 6) { p.pointAt(d, q); if (q.x >= 0 && q.x <= W && q.y >= 0 && q.y <= H) { if (!a) a = [q.x, q.y]; b = [q.x, q.y]; } } if (a) ends.push(a, b); }
    const cand = [], seen = new Set();
    for (const p of m.paths) for (let d = 30; d < p.length - 30; d += 8) {
      p.pointAt(d, q); for (const s of [-1, 1]) for (const off of [24, 32, 42, 54, 68]) {
        const x = q.x + q.nx * (PW / 2 + off) * s, y = q.y + q.ny * (PW / 2 + off) * s, key = Math.round(x / 8) + ',' + Math.round(y / 8);
        if (seen.has(key)) continue; seen.add(key); if (!fits(x, y) || ends.some(e => Math.hypot(e[0] - x, e[1] - y) < 125)) continue;
        const cov = []; samples.forEach((v, i) => { const dd = Math.hypot(v[0] - x, v[1] - y); if (dd < 128) cov.push(i); });
        cand.push({ x, y, near: nearRoad(m, x, y), cov });
      }
    }
    const spots = [], covered = new Float32Array(samples.length);
    for (const [gx, gy] of [[78, 62], [72, 54]]) {
      while (spots.length < want) {
        let best = null, bs = -1e9;
        for (const c of cand) {
          if (spots.some(s => Math.abs(s.x - c.x) < gx && Math.abs(s.y - c.y) < gy)) continue;
          let sc = 0; for (const i of c.cov) sc += 1 / (1 + covered[i] * 1.5);
          sc -= Math.max(0, c.near - PW / 2 - 26) * .3;
          const nb = spots.filter(s => Math.hypot(s.x - c.x, s.y - c.y) < 115).length; sc += nb === 1 ? 3.5 : nb > 1 ? -5 * (nb - 1) : 0;
          if (sc > bs) { bs = sc; best = c; }
        }
        if (!best) break;
        spots.push({ x: Math.round(best.x), y: Math.round(best.y) }); for (const i of best.cov) covered[i]++;
      }
    }
    return spots.length >= Math.min(want, 4) ? spots.sort((a, b) => a.x - b.x).map((s, id) => ({ ...s, id })) : m.spots;
  }

  /* ---------- Cây cối đóng khung ---------- */
  const MIX = {
    forest: { big: ['tree', 'tree', 'pine'], small: ['bush', 'bush', 'rock', 'stump', 'mush'] },
    castle: { big: ['tree', 'tree', 'pine'], small: ['bush', 'rock', 'bush', 'stump', 'hay'] },
    desert: { big: ['palm', 'mesa', 'palm'], small: ['rock', 'cactus', 'drybush', 'bones'] },
    ice: { big: ['snowpine', 'snowpine'], small: ['rock', 'icecrystal', 'rock'] },
    lava: { big: ['deadtree', 'spire'], small: ['rock', 'redcrystal', 'bones', 'rock'] },
    chaos: { big: ['deadtree', 'spire'], small: ['voidcrystal', 'rock', 'rune', 'rock'] }
  };
  function decor(m) {
    const W = m.W, H = m.H, PW = CONFIG.pathWidth, rnd = K.seeded(m.index * 613 + 5), mix = MIX[m.def.theme] || MIX.forest;
    const spotHit = (x, y, tall) => m.spots.some(s => Math.abs(s.x - x) < (tall ? 62 : 46) && y > s.y - 100 && y < s.y + (tall ? 105 : 26));
    const clear = (x, y, r, tall) => nearRoad(m, x, y) > PW / 2 + r && (!tall || (nearRoad(m, x, y - 35) > PW / 2 + 8 && nearRoad(m, x, y - 70) > PW / 2)) && !MapArt.wetAt(m.feat, x, y, r) && !spotHit(x, y, tall);
    const out = m.decor.filter(d => d.prop && !spotHit(d.x, d.y, true) && nearRoad(m, d.x, d.y) > PW / 2 + 12);
    const put = (k, x, y, s) => { if (out.some(d => Math.hypot(d.x - x, (d.y - y) * 1.7) < (mix.big.includes(k) ? 26 : 15))) return false; out.push({ k, x, y, s, v: rnd(), flip: rnd() < .5 ? -1 : 1 }); return true; };
    const pick = a => a[(rnd() * a.length) | 0];
    // 1) khung: dải dày ở mép trên, mép dưới và hai bên
    for (let i = 0; i < 900; i++) {
      const r = rnd(); let x, y;
      if (r < .38) { x = rnd() * W; y = 14 + rnd() * 52; } else if (r < .74) { x = rnd() * W; y = H - 26 + rnd() * 40; } else if (r < .87) { x = rnd() * 46; y = 60 + rnd() * (H - 60); } else { x = W - rnd() * 46; y = 60 + rnd() * (H - 60); }
      const tall = rnd() < .6; if (!clear(x, y, tall ? 22 : 12, tall)) continue; put(tall ? pick(mix.big) : pick(mix.small), x, y, (tall ? .72 : .8) + rnd() * .26);
    }
    // 2) vài lùm giữa bãi trống lớn
    let groves = 0;
    for (let i = 0; i < 400 && groves < 4; i++) {
      const x = 70 + rnd() * (W - 140), y = 100 + rnd() * (H - 170); if (nearRoad(m, x, y) < PW / 2 + 58 || !clear(x, y, 40, true)) continue;
      let n = 0; for (let j = 0; j < 6; j++) { const xx = x + (rnd() - .5) * 56, yy = y + (rnd() - .5) * 24, tall = j < 3; if (clear(xx, yy, tall ? 24 : 12, tall) && put(tall ? pick(mix.big) : pick(mix.small), xx, yy, .7 + rnd() * .2)) n++; }
      if (n) groves++;
    }
    // 3) điểm xuyết bụi/đá ven đường
    const q = {};
    for (const path of m.paths) for (let d = 20; d < path.length; d += 38) { path.pointAt(d, q); const s = rnd() < .5 ? -1 : 1, off = PW / 2 + 12 + rnd() * 16, x = q.x + q.nx * off * s, y = q.y + q.ny * off * s; if (rnd() < .5 && x > 10 && x < W - 10 && y > 20 && y < H - 6 && clear(x, y, 10, false)) put(pick(mix.small), x, y, .62 + rnd() * .2); }
    return out.sort((a, b) => a.y - b.y);
  }

  /* ---------- Ô đặt trụ ---------- */
  const padCache = new Map(), PADW = 100, PADH = 64, PZ = 3;
  function padArt(theme) {
    if (padCache.has(theme)) return padCache.get(theme);
    const P = PAL[theme] || PAL.forest, c = mk(PADW * PZ, PADH * PZ), g = c.getContext('2d'); g.scale(PZ, PZ); g.translate(PADW / 2, 44); g.lineJoin = 'round'; g.lineCap = 'round';
    g.fillStyle = 'rgba(30,20,10,.28)'; g.beginPath(); g.ellipse(1, 4, 37, 14, 0, 0, TAU); g.fill();
    g.fillStyle = P.roadInk; g.beginPath(); g.ellipse(0, 0, 35, 13.5, 0, 0, TAU); g.fill();
    g.fillStyle = P.roadRim; g.beginPath(); g.ellipse(0, .5, 33, 12, 0, 0, TAU); g.fill();
    g.fillStyle = P.road; g.beginPath(); g.ellipse(0, -.6, 30.5, 10, 0, 0, TAU); g.fill();
    g.fillStyle = K.alpha(P.roadL, .7); g.beginPath(); g.ellipse(-3, -2.2, 20, 5.5, 0, 0, TAU); g.fill();
    const r = K.seeded(theme.length * 17 + 3);
    for (let i = 0; i < 26; i++) { const a = r() * TAU, d = Math.sqrt(r()) * .8; g.fillStyle = K.alpha(r() < .5 ? P.rut : P.roadL, .6); g.beginPath(); g.ellipse(Math.cos(a) * 28 * d, Math.sin(a) * 8.5 * d - .6, .9 + r(), .6, 0, 0, TAU); g.fill(); }
    for (let i = 0; i < 11; i++) { const a = Math.PI * (.05 + i * .09) + (r() - .5) * .1; stone(g, Math.cos(a) * 33, Math.sin(a) * 12.5, 2.2 + r() * 1.4, P); }
    const GP = { ...P, tuft: K.shade(P.g, -.28), tuftL: P.g }; for (const x of [-30, -22, 24, 31]) tuft(g, x, -8 + Math.abs(x) * .06, .55, GP);
    // biển gỗ
    g.strokeStyle = P.roadInk; g.lineWidth = 4.2; g.beginPath(); g.moveTo(0, -1); g.lineTo(0, -22); g.stroke();
    g.strokeStyle = '#9a6a3a'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(0, -1.5); g.lineTo(0, -21.5); g.stroke();
    g.fillStyle = '#f3ead0'; g.strokeStyle = P.roadInk; g.lineWidth = 1.5; g.beginPath(); g.roundRect(-9, -33, 18, 12, 2); g.fill(); g.stroke();
    g.fillStyle = '#7a6a54'; g.beginPath(); g.moveTo(-4, -23.5); g.lineTo(-4, -29); g.lineTo(-2.5, -29); g.lineTo(-2.5, -30.5); g.lineTo(-.7, -30.5); g.lineTo(-.7, -29); g.lineTo(.7, -29); g.lineTo(.7, -30.5); g.lineTo(2.5, -30.5); g.lineTo(2.5, -29); g.lineTo(4, -29); g.lineTo(4, -23.5); g.closePath(); g.fill();
    padCache.set(theme, c); return c;
  }
  Painter.plot = function (g, x, y, on, t) {
    const theme = (window.Game && Game.map && Game.map.def.theme) || 'forest';
    g.drawImage(padArt(theme), x - PADW / 2, y - 44, PADW, PADH);
    if (on) { g.save(); g.globalAlpha = .65 + Math.sin((t || 0) * 6) * .3; g.strokeStyle = '#ffe58a'; g.lineWidth = 3; g.beginPath(); g.ellipse(x, y, 38, 15, 0, 0, TAU); g.stroke(); g.restore(); }
  };

  /* ---------- Gắn vào bộ dựng bản đồ ---------- */
  const oldTex = PaintedWorld.texture, oldRender = MapArt.render, gcache = new Map(); let cur = null, curRes = 1;
  PaintedWorld.texture = function (g, theme, n, size) {
    if (n !== 0 || !cur) return oldTex.apply(this, arguments);
    const key = cur.index + '|' + curRes + '|' + cur.W; let c = gcache.get(key); if (!c) { c = ground(cur, curRes); gcache.set(key, c); if (gcache.size > 3) gcache.delete(gcache.keys().next().value); }
    const pat = g.createPattern(c, 'no-repeat'); pat.setTransform(new DOMMatrix().scale(1 / curRes)); return pat;
  };
  MapArt.render = function (m, res) { cur = m; curRes = res; try { return oldRender.call(this, m, res); } finally { cur = null; } };
  const build = Level.build;
  Level.build = function (i) { const m = build.call(this, i); m.spots = placeSpots(m); m.decor = decor(m); return m; };
  window.KR68 = { road, ground, placeSpots, decor, PAL, version: 68 };
})();
