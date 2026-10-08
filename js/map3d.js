/* =========================================================
 * map3d.js – Vật trang trí & công trình trên bản đồ vẽ từ mô hình 3D (design/props3d.js)
 * Mặt đất, đường, sông vẫn là tranh vẽ tay (mapart.js); cây, đá, nhà, lâu đài… là 3D
 * được chụp thành sprite 1 lần cho mỗi mẫu / vùng / độ phân giải rồi đặt theo chiều sâu.
 * ========================================================= */
(function () {
  if (!window.Art3D || !window.Props3D || !window.MapArt) return;
  const cache = new Map();
  window.Map3D = {
    draw(g, d, T, theme, res) {
      if (!Art3D.enabled || !Art3D.available()) return false;
      const prop = d.prop ? d : null;
      if (!Props3D.has(d.k, !!prop)) return false;
      const vi = Math.min(2, (d.v * 3) | 0);
      const ppu = Math.min(4, Math.ceil(res * (prop ? 1.1 : 1.9) * 4) / 4);
      const key = (Art3D.lightTheme ? Art3D.lightTheme() + ':' : '') + (prop ? [d.k, d.theme, d.snow ? 1 : 0, d.dark ? 1 : 0].join('|') : d.k + '|' + theme + '|' + vi) + '@' + ppu;
      let sp = cache.get(key);
      if (sp === undefined) {
        Chars3D.setInk(0.35);
        const root = Props3D.build(d.k, prop ? (d.theme || theme) : theme, (vi + 0.5) / 3, prop);
        sp = root ? Art3D.sprite(root, ppu) : null;
        cache.set(key, sp);
      }
      if (!sp) return false;
      g.save(); g.translate(d.x, d.y);
      if (!prop) g.scale(d.s * d.flip, d.s);
      if (d.k !== 'monument' && d.k !== 'flowerbed' && d.k !== 'rune') ArtKit.shadow(g, sp.fw * 0.1, 2, sp.fw * 0.5, sp.fw * 0.16, 0.38);
      g.drawImage(sp.c, -sp.ox, -sp.oy, sp.w, sp.h);
      g.restore();
      return true;
    },
    clear() { cache.clear(); },

    /** Bản đồ chiến dịch: 6 vùng nối nhau, rải vật 3D theo vùng + công trình mốc (W×H đơn vị vẽ) */
    paintWorld(g, W, H, nodes) {
      if (!Art3D.enabled || !Art3D.available()) return false;
      const K = ArtKit, rnd = K.seeded(11), R = W / 6, res = g.getTransform().a;
      const TH = ['forest', 'castle', 'desert', 'ice', 'lava', 'chaos'];
      // nền: chuyển màu giữa các vùng + vân
      for (let i = 0; i < 6; i++) {
        const T = MapArt.TH[TH[i]], gr = g.createLinearGradient(i * R - R * 0.3, 0, (i + 1) * R + R * 0.3, 0);
        gr.addColorStop(0, K.alpha(T.g0, 0)); gr.addColorStop(0.25, T.g0); gr.addColorStop(0.75, T.g0); gr.addColorStop(1, K.alpha(T.g0, 0));
        g.fillStyle = gr; g.fillRect(i * R - R * 0.3, 0, R * 1.6, H);
      }
      const blot = (x, y, r, c, a) => { const q = g.createRadialGradient(x, y, 0, x, y, r); q.addColorStop(0, K.alpha(c, a)); q.addColorStop(1, K.alpha(c, 0)); g.fillStyle = q; g.fillRect(x - r, y - r, r * 2, r * 2); };
      for (let i = 0; i < 90; i++) { const x = rnd() * W, T = MapArt.TH[TH[Math.min(5, (x / R) | 0)]]; blot(x, rnd() * H, 25 + rnd() * 55, rnd() < 0.5 ? T.g1 : T.g2, 0.35); }
      if (true) { g.save(); g.beginPath(); g.rect(R * 5, 0, R, H); g.clip(); for (let i = 0; i < 70; i++) K.dot(g, R * 5 + rnd() * R, rnd() * H, 0.6 + rnd() * 1.2, 'rgba(255,255,255,.7)'); g.restore(); }
      // sông xanh vùng rừng, dung nham vùng núi lửa
      g.lineCap = 'round';
      g.strokeStyle = '#5a4a30'; g.lineWidth = 30; g.beginPath(); g.moveTo(R * 0.7, -10); g.bezierCurveTo(R * 0.95, 150, R * 0.55, 300, R * 1.05, 510); g.stroke(); g.strokeStyle = '#2f8fc0'; g.lineWidth = 22; g.stroke(); g.strokeStyle = 'rgba(160,230,255,0.6)'; g.lineWidth = 6; g.stroke();
      g.strokeStyle = '#1e1416'; g.lineWidth = 24; g.beginPath(); g.moveTo(R * 4.35, -10); g.bezierCurveTo(R * 4.7, 160, R * 4.25, 330, R * 4.6, 510); g.stroke(); g.strokeStyle = '#ff6a1a'; g.lineWidth = 16; g.stroke(); g.strokeStyle = '#ffd04a'; g.lineWidth = 5; g.stroke();
      // tránh nút màn chơi & đường nối
      const N = (nodes || []).map(n => [n[0] * W / 100, n[1] * H / 100]);
      const nearPath = (x, y) => { for (let i = 0; i < N.length; i++) { if (Math.hypot(N[i][0] - x, N[i][1] - y) < 70) return true; if (i) { const [ax, ay] = N[i - 1], [bx, by] = N[i], dx = bx - ax, dy = by - ay, t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy))); if (Math.hypot(ax + dx * t - x, ay + dy * t - y) < 34) return true; } } return false; };
      const items = [];
      const BIG = { forest: ['tree', 'tree', 'pine', 'bush', 'rock'], castle: ['tree', 'pine', 'bush', 'hay', 'rock'], desert: ['cactus', 'palm', 'rock', 'drybush', 'cactus'], ice: ['snowpine', 'snowpine', 'icecrystal', 'rock'], lava: ['spire', 'spire', 'rock', 'redcrystal', 'deadtree'], chaos: ['voidcrystal', 'deadtree', 'rock', 'voidcrystal'] };
      for (let reg = 0; reg < 6; reg++) for (let i = 0; i < 46; i++) {
        const x = reg * R + rnd() * R, y = 18 + rnd() * (H - 10), th = TH[reg];
        if (nearPath(x, y) || y < 14) continue;
        const ks = BIG[th]; items.push({ d: { k: ks[(rnd() * ks.length) | 0], x, y, s: 0.55 + rnd() * 0.3, v: rnd(), flip: rnd() < 0.5 ? -1 : 1 }, th });
      }
      const L = [['castle', 1, 0.62, 0.16, {}], ['house', 1, 0.15, 0.62, {}], ['cabin', 0, 0.75, 0.1, {}], ['monument', 0, 0.3, 0.92, { theme: 'forest' }], ['mesa', 2, 0.25, 0.14, {}], ['fort', 2, 0.72, 0.92, {}], ['monument', 2, 0.85, 0.55, { theme: 'desert' }],
        ['castle', 3, 0.3, 0.12, { snow: true }], ['house', 3, 0.8, 0.95, { snow: true }], ['fort', 4, 0.15, 0.95, { dark: true }], ['monument', 4, 0.7, 0.18, { theme: 'lava' }], ['portal', 5, 0.55, 0.22, {}], ['ruin', 5, 0.25, 0.95, { theme: 'desert' }]];
      for (const [k, reg, fx, fy, o] of L) items.push({ d: Object.assign({ k, prop: true, x: reg * R + fx * R, y: 30 + fy * (H - 40), s: 1, v: 0.5, flip: 1, theme: TH[reg] }, o), th: TH[reg], sc: k === 'monument' ? 0.42 : 0.5 });
      items.sort((a, b) => a.d.y - b.d.y);
      for (const it of items) {
        if (it.sc) { g.save(); g.translate(it.d.x, it.d.y); g.scale(it.sc, it.sc); const d = Object.assign({}, it.d, { x: 0, y: 0 }); this.draw(g, d, MapArt.TH[it.th], it.th, res * it.sc); g.restore(); }
        else this.draw(g, it.d, MapArt.TH[it.th], it.th, res);
      }
      const v = g.createRadialGradient(W / 2, H / 2, W * 0.3, W / 2, H / 2, W * 0.65); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(20,10,30,.4)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
      return true;
    }
  };
})();
