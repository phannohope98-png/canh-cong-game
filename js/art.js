/* =========================================================
 * art.js – Painter: vẽ nhân vật/trụ từ bộ đệm khung hình
 * Mỗi khung vẽ 1 lần ở độ phân giải hiện tại rồi tái sử dụng.
 * ========================================================= */
(function () {
  const K = ArtKit, TAU = Math.PI * 2;
  const N = { walk: 24, atk: 20, idle: 32, die: 16 }, IDLE = 2.618;
  const BUCKETS = [0.35, 0.5, 0.7, 1, 1.4, 2, 2.4, 2.8, 3.4, 4];
  const bucket = v => { v = Math.min(v, (window.Painter && Painter.ppuCap) || 4); for (const b of BUCKETS) if (v <= b * 1.02) return b; return 4; }; // làm tròn LÊN: luôn thu nhỏ khi vẽ → nét
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; };
  const cache = new Map();
  let px = 0;
  function remember(key, c) { px += c.width * c.height; if (cache.size > 1600 || px > 60e6) { cache.clear(); px = c.width * c.height; } cache.set(key, c); return c; } // giới hạn ~240 MB ảnh đệm

  function charFrame(type, mode, i, ppu) {
    const key = 'c' + type + mode + i + '|' + ppu; let c = cache.get(key); if (c) return c;
    const d = ArtChars[type], [w, h, ox, oy] = d.box;
    c = mk(w * ppu, h * ppu); const g = c.getContext('2d');
    g.scale(ppu, ppu); g.translate(ox, oy); g.lineJoin = 'round'; g.lineCap = 'round';
    const P = { w: -1, a: -1, t: 0 };
    if (mode === 'walk') P.w = i / N.walk; else if (mode === 'atk') P.a = (i + 0.5) / N.atk; else if (mode === 'die') P.d = i / (N.die - 1); else P.t = i / N.idle * IDLE;
    if (!d.chibi) { // quái vẽ bộ cũ: thêm nảy + co giãn kiểu Kingdom Rush
      const tall = d.tall || 30; let sx = 1, sy = 1, by = 0, rot = 0;
      if (P.w >= 0) { const s = Math.abs(Math.sin(P.w * TAU)), land = Math.pow(1 - s, 3); by = -s * tall * 0.06; sy = 1 - land * 0.09 + s * 0.04; sx = 1 + land * 0.07; rot = Math.sin(P.w * TAU) * 0.05; }
      else if (P.a >= 0) { const a = P.a; if (a < 0.4) { const k = a / 0.4; sy = 1 - 0.1 * k; sx = 1 + 0.08 * k; rot = -0.12 * k; } else if (a < 0.6) { const k = (a - 0.4) / 0.2; sy = 0.9 + 0.16 * k; sx = 1.08 - 0.12 * k; rot = -0.12 + 0.3 * k; } else { const k = (a - 0.6) / 0.4; sy = 1.06 - 0.06 * k; sx = 0.96 + 0.04 * k; rot = 0.18 * (1 - k); } }
      else { const b = Math.sin(P.t * 3); sy = 1 + b * 0.03; sx = 1 - b * 0.02; }
      g.translate(0, by); g.rotate(rot); g.scale(sx, sy);
    }
    d.draw(g, P);
    return remember(key, c);
  }
  function towerStatic(type, tier, ppu) {
    const key = 't' + type + tier + '|' + ppu; let c = cache.get(key); if (c) return c;
    const d = ArtTowers[type], [w, h, ox, oy] = d.box;
    c = mk(w * ppu, h * ppu); const g = c.getContext('2d');
    g.scale(ppu, ppu); g.translate(ox, oy); g.lineJoin = 'round'; g.lineCap = 'round';
    d.static(g, tier);
    return remember(key, c);
  }
  function plotSprite(ppu) {
    const key = 'plot|' + ppu; let c = cache.get(key); if (c) return c;
    const W = 100, H = 70; c = mk(W * ppu, H * ppu); const g = c.getContext('2d');
    g.scale(ppu, ppu); g.translate(W / 2, H / 2 + 6); g.lineJoin = 'round';
    K.shadow(g, 3, 6, 46, 16, 0.35);
    K.cel(g, K.P.ell(0, 0, 40, 15), '#9a7448', { s: 4, h: 0, lw: 0, dark: '#7a5634' });
    g.save(); g.beginPath(); g.ellipse(0, 0, 40, 15, 0, 0, TAU); g.clip();
    const r = K.seeded(5); for (let i = 0; i < 30; i++) K.dot(g, (r() - 0.5) * 76, (r() - 0.5) * 28, 1 + r() * 2, r() < 0.5 ? 'rgba(60,30,10,0.3)' : 'rgba(255,230,180,0.25)');
    g.restore();
    for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; K.ell(g, Math.cos(a) * 40, Math.sin(a) * 15, 5.4 + (i % 3) * 0.8, 3.4, i % 2 ? '#b8b2a6' : '#a09a8e', { s: 1.4, h: 0.8, lw: 1.6 }); }
    // biển gỗ nhỏ
    K.limb(g, 26, -2, 26, -24, 2.4, '#7a4a26');
    K.rr(g, 15, -32, 22, 13, 2, '#c8965a', { s: 2, h: 1, lw: 1.8 });
    K.line(g, 21, -25.5, 31, -25.5, '#5a3418', 1.6); K.line(g, 26, -29, 26, -22, '#5a3418', 1.6);
    return remember(key, c);
  }

  const Painter = {
    res: 1,
    clear() { cache.clear(); px = 0; },
    char(ctx, type, x, y, scale, face, mode, phase, ppuOverride, aim) {
      if (aim !== undefined && window.Art3D && Art3D.dirKey) { const dk = Art3D.dirKey(type, aim); if (dk) { type = dk; face = 1; } }
      const d = ArtChars[type]; if (!d) return;
      const ppu = bucket(ppuOverride || scale * this.res);
      let i;
      if (mode === 'walk') i = Math.floor((((phase % 1) + 1) % 1) * N.walk);
      else if (mode === 'atk') i = Math.min(N.atk - 1, Math.max(0, Math.floor(phase * N.atk)));
      else if (mode === 'die') i = Math.min(N.die - 1, Math.max(0, Math.floor(phase * N.die)));
      else { mode = 'idle'; i = Math.floor((((phase / IDLE) % 1) + 1) % 1 * N.idle); }
      const img = charFrame(type, mode, i, ppu), [w, h, ox, oy] = d.box;
      if (face < 0) {
        ctx.save(); ctx.translate(x, y); ctx.scale(-1, 1);
        ctx.drawImage(img, -ox * scale, -oy * scale, w * scale, h * scale); ctx.restore();
      } else ctx.drawImage(img, x - ox * scale, y - oy * scale, w * scale, h * scale);
    },
    tower(ctx, type, tier, x, y, scale, t, st) {
      const d = ArtTowers[type], [w, h, ox, oy] = d.box;
      ctx.drawImage(towerStatic(type, tier, bucket(scale * this.res)), x - ox * scale, y - oy * scale, w * scale, h * scale);
      ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      const self = this;
      const CS = ArtTowers.CH || 1.3;
      d.fx(ctx, tier, t, st || {}, { char(ct, cx, cy, face, a, tt) { self.char(ctx, ct, cx, cy, CS, face, a >= 0 ? 'atk' : 'idle', a >= 0 ? a : tt, scale * CS * self.res, st && st.aim); } });
      ctx.restore();
    },
    plot(ctx, x, y, hi, t) {
      const img = plotSprite(bucket(this.res));
      ctx.drawImage(img, x - 50, y - 41, 100, 70);
      if (hi) { const p = 0.6 + Math.sin(t * 6) * 0.3; ctx.save(); ctx.globalAlpha = p; ctx.strokeStyle = '#ffe58a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(x, y, 44, 17, 0, 0, TAU); ctx.stroke(); ctx.restore(); }
    },
    /** Chân dung cho giao diện (canvas DOM) */
    towerPortrait(canvas, type, tier, fit) {
      const g = canvas.getContext('2d');
      const TOP = { archer: [0, 100, 108, 120, 134], mage: [0, 92, 106, 128, 146], barracks: [0, 60, 70, 92, 112], artillery: [0, 66, 74, 82, 96], orc: [0, 56, 62, 66, 92] }[type] || [0, 100, 100, 100, 100];
      g.clearRect(0, 0, canvas.width, canvas.height);
      const f = fit || 0.82, s = Math.min(canvas.width * f / 92, canvas.height * f / (TOP[tier] + 26));
      this.tower(g, type, tier, canvas.width / 2, canvas.height / 2 + (TOP[tier] - 26) * s / 2, s, 0.5, { a: -1, face: 1, portrait: true });
    },
    charPortrait(canvas, type, opts) {
      opts = opts || {};
      if (window.ArtImg && ArtImg.ready && !(ArtChars[type] && ArtChars[type].chibi) && ArtImg.portrait(canvas, type, opts)) return;
      const g = canvas.getContext('2d'), d = ArtChars[type], [w, h, ox, oy] = d.box;
      g.clearRect(0, 0, canvas.width, canvas.height);
      const z = opts.zoom || 1;
      if (opts.head) { // chân dung cận mặt: căn giữa đầu nhân vật
        const s = canvas.width / (d.tall * 0.62) * z / 2.1;
        this.char(g, type, canvas.width / 2 - d.tall * 0.04 * s, canvas.height * 0.5 + d.head * s, s, 1, opts.mode === 'atk' ? 'atk' : 'idle', opts.mode === 'atk' ? 0.55 : 0.4, s);
        return;
      }
      const s = Math.min(canvas.width / Math.max(d.tall * 1.15, d.wide || 0), canvas.height / (d.tall * 1.12)) * z;
      const md = opts.mode === 'atk' ? 'atk' : opts.mode === 'walk' ? 'walk' : 'idle';
      this.char(g, type, canvas.width / 2 - d.tall * 0.06 * s, canvas.height / 2 + d.tall * 0.52 * s, s, 1, md, md === 'atk' ? 0.5 : md === 'walk' ? 0.25 : 0.4, s);
    }
  };
  window.Painter = Painter;
})();
