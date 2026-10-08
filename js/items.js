/* =========================================================
 * items.js – Vật phẩm gắn trụ (5 bậc: Tệ → Huyền thoại)
 *  - Túi đồ + bộ đồ đang gắn cho từng loại trụ lưu trong Save (items, loadout)
 *  - Quy tắc lắp: mỗi trụ có 6 vị trí (CONFIG.items.slots); vị trí s của trụ t chỉ nhận đồ
 *    loại CONFIG.items.gear[t][s] → đồ mang sẵn (t, s) nên chỉ lắp được đúng 1 chỗ.
 *  - Quái chết có tỉ lệ rơi rương đồ (Loot), boss chắc chắn rơi đồ bậc cao.
 * ========================================================= */
(function () {
  const C = () => CONFIG.items;
  const TYPES = Object.keys(CONFIG.towers);
  const STATS = ['damage', 'range', 'rate', 'aoe', 'hp', 'armor', 'block', 'respawn', 'crit', 'poison', 'slow', 'pen', 'burn', 'stun', 'root'];
  let cache = {};

  const Items = {
    TYPES, STATS,
    def(it) { return C().gear[it.t][it.s]; },
    rar(it) { return C().rarities[it.r]; },
    name(it) { return this.def(it).name + ' ' + this.rar(it).suffix; },
    value(it) { return this.def(it).base * this.rar(it).k; },
    pct(v) { const p = v * 100; return (p < 10 ? Math.round(p * 10) / 10 : Math.round(p)) + '%'; },
    statText(it) { return '+' + this.pct(this.value(it)) + ' ' + this.def(it).text; },
    slotName(s) { return C().slots[s].name; },
    towerName(t) { return CONFIG.towers[t].name; },

    /* ---------- túi đồ ---------- */
    bag() { return Save.data.items; },
    find(u) { return Save.data.items.find(i => i.u === u) || null; },
    equippedAt(t, s) { const u = Save.data.loadout[t][s]; return u ? this.find(u) : null; },
    isEquipped(it) { return !!it && Save.data.loadout[it.t][it.s] === it.u; },
    add(t, s, r) {
      const it = { u: ++Save.data.itemN, t, s, r };
      Save.data.items.push(it);
      // túi đầy: phân rã món tệ nhất (không đang gắn) lấy Xu
      while (Save.data.items.length > C().bag) {
        let w = null; for (const i of Save.data.items) if (i !== it && !this.isEquipped(i) && (!w || i.r < w.r)) w = i;
        if (!w) break; this.salvage(w.u, true);
      }
      // vị trí còn trống thì tự gắn luôn cho tiện
      if (!Save.data.loadout[t][s]) Save.data.loadout[t][s] = it.u;
      this.dirty(); Save.save(); return it;
    },
    equip(u) { const it = this.find(u); if (!it) return false; Save.data.loadout[it.t][it.s] = it.u; this.dirty(); Save.save(); return true; },
    unequip(t, s) { Save.data.loadout[t][s] = 0; this.dirty(); Save.save(); },
    salvage(u, quiet) {
      const it = this.find(u); if (!it) return 0;
      if (this.isEquipped(it)) Save.data.loadout[it.t][it.s] = 0;
      Save.data.items.splice(Save.data.items.indexOf(it), 1);
      const coins = this.rar(it).salvage; Save.data.coins += coins;
      if (!quiet) { this.dirty(); Save.save(); }
      return coins;
    },
    /** ghép: 3 món cùng trụ, cùng vị trí, cùng bậc → 1 món bậc trên */
    fuseList(it) { return Save.data.items.filter(i => i.t === it.t && i.s === it.s && i.r === it.r); },
    canFuse(it) { return it && it.r < C().rarities.length - 1 && this.fuseList(it).length >= 3; },
    fuse(u) {
      const it = this.find(u); if (!this.canFuse(it)) return null;
      const same = this.fuseList(it).sort((a, b) => (this.isEquipped(a) ? 1 : 0) - (this.isEquipped(b) ? 1 : 0) || (a === it ? -1 : 0)).slice(0, 3);
      const wasEq = same.some(i => this.isEquipped(i));
      same.forEach(i => { if (this.isEquipped(i)) Save.data.loadout[i.t][i.s] = 0; Save.data.items.splice(Save.data.items.indexOf(i), 1); });
      const n = { u: ++Save.data.itemN, t: it.t, s: it.s, r: it.r + 1 }; Save.data.items.push(n);
      if (wasEq || !Save.data.loadout[n.t][n.s]) Save.data.loadout[n.t][n.s] = n.u;
      this.dirty(); Save.save(); return n;
    },
    /** gắn tự động món tốt nhất vào mọi vị trí */
    autoEquip(t) {
      for (let s = 0; s < 6; s++) { let b = null; for (const i of Save.data.items) if (i.t === t && i.s === s && (!b || i.r > b.r)) b = i; if (b) Save.data.loadout[t][s] = b.u; }
      this.dirty(); Save.save();
    },
    sortBag() { return Save.data.items.slice().sort((a, b) => b.r - a.r || TYPES.indexOf(a.t) - TYPES.indexOf(b.t) || a.s - b.s); },

    /* ---------- chỉ số cộng thêm cho 1 loại trụ ---------- */
    dirty() { cache = {}; },
    mods(t) {
      if (cache[t]) return cache[t];
      const m = { list: [] }; STATS.forEach(k => { m[k] = 0; });
      const lo = Save.data.loadout && Save.data.loadout[t];
      if (lo) for (let s = 0; s < 6; s++) { const it = lo[s] && this.find(lo[s]); m.list[s] = it || null; if (it) m[this.def(it).stat] += this.value(it); }
      return (cache[t] = m);
    },

    /* ---------- rơi đồ ---------- */
    region(levelIndex) { return Math.floor(levelIndex / 6); },
    rollRarity(region, boss) {
      const w = boss ? [0, 0, 46 - region * 4, 38, 16 + region * 4] : [Math.max(8, 46 - region * 7), 34, 13 + region * 3, 5 + region * 2.4, 1 + region * 1.1];
      let sum = w.reduce((a, b) => a + b, 0), x = Math.random() * sum;
      for (let i = 0; i < w.length; i++) { x -= w[i]; if (x < 0) return i; }
      return 0;
    },
    onKill(e) {
      if (!window.Loot || Game.state !== 'playing') return;
      const reg = this.region(Game.levelIndex);
      if (e.boss) { const n = e.def.lives >= 20 ? 2 : 1; for (let i = 0; i < n; i++) Loot.drop(e.x + (i - (n - 1) / 2) * 30, e.y, this.rollRarity(reg, true)); return; }
      if (Loot.normal >= C().maxPerMatch) return;
      const p = C().dropBase + (e.def.lives - 1) * C().dropPerLife;
      if (Math.random() < p) { Loot.normal++; Loot.drop(e.x, e.y, this.rollRarity(reg, false)); }
    },

    /* ---------- hình biểu tượng (3D chụp sẵn, không có thì vẽ 2D) ---------- */
    _img: {},
    img(icon) {
      if (this._img[icon] !== undefined) return this._img[icon];
      const url = window.Icons3D && Icons3D.has(icon) && Icons3D.url(icon);
      if (!url) return (this._img[icon] = null);
      const im = new Image(); im.src = url; return (this._img[icon] = im);
    },
    iconUrl(it) { return window.Icons3D && Icons3D.has(this.def(it).icon) ? Icons3D.url(this.def(it).icon) : null; },
    /** huy hiệu đồ vẽ trên chiến trường / trụ: đế tròn màu theo bậc + biểu tượng */
    drawBadge(ctx, it, x, y, r, t) {
      const R = this.rar(it), im = this.img(this.def(it).icon);
      if (it.r >= 3) ArtKit.glow(ctx, x, y, r * (2.2 + Math.sin((t || 0) * 4 + x) * 0.3), R.col, it.r >= 4 ? 0.75 : 0.5);
      ctx.save();
      ctx.fillStyle = '#1d1220'; ctx.beginPath(); ctx.arc(x, y, r + 1.6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = R.col; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(29,18,32,0.55)'; ctx.beginPath(); ctx.arc(x, y, r * 0.78, 0, Math.PI * 2); ctx.fill();
      if (im && im.complete && im.naturalWidth) ctx.drawImage(im, x - r * 1.05, y - r * 1.05, r * 2.1, r * 2.1);
      else { ctx.fillStyle = R.col; ctx.beginPath(); ctx.moveTo(x, y - r * 0.6); ctx.lineTo(x + r * 0.5, y); ctx.lineTo(x, y + r * 0.6); ctx.lineTo(x - r * 0.5, y); ctx.closePath(); ctx.fill(); }
      ctx.restore();
    }
  };

  /* ================= RƯƠNG ĐỒ RƠI TRÊN CHIẾN TRƯỜNG ================= */
  const Loot = {
    list: [], found: [], normal: 0,
    reset() { this.list.length = 0; this.found = []; this.normal = 0; },
    drop(x, y, r) {
      const t = TYPES[(Math.random() * TYPES.length) | 0], s = (Math.random() * 6) | 0, it = Items.add(t, s, r);
      this.found.push(it);
      this.list.push({ x, y, it, t: 0, vx: (Math.random() - 0.5) * 60 });
      const R = Items.rar(it);
      Effects.text(x, y - 70, Items.name(it), R.col, it.r >= 3 ? 20 : 16);
      if (it.r >= 3) { Effects.flash(x, y - 20, 90, R.col); Effects.comic(x, y - 96, it.r >= 4 ? 'HUYỀN THOẠI!' : 'ĐỒ XỊN!', R.col, true); }
      AudioSys.play(it.r >= 3 ? 'holy' : 'gold');
    },
    update(dt) {
      for (let i = this.list.length - 1; i >= 0; i--) { const L = this.list[i]; L.t += dt; L.x += L.vx * dt * Math.max(0, 1 - L.t * 2); if (L.t > 2.6) this.list.splice(i, 1); }
    },
    draw(ctx, now) {
      for (const L of this.list) {
        const R = Items.rar(L.it), up = L.t < 0.5 ? Math.sin(L.t / 0.5 * Math.PI) * 46 : 0, fade = L.t > 2.1 ? 1 - (L.t - 2.1) / 0.5 : 1;
        ctx.save(); ctx.globalAlpha = Math.max(0, fade);
        // cột sáng theo bậc đồ
        const g = ctx.createLinearGradient(0, L.y - 120, 0, L.y); g.addColorStop(0, ArtKit.alpha(R.col, 0)); g.addColorStop(1, ArtKit.alpha(R.col, 0.45));
        ctx.fillStyle = g; ctx.fillRect(L.x - 9, L.y - 120, 18, 120);
        ArtKit.shadow(ctx, L.x, L.y + 4, 13, 4, 0.35);
        Items.drawBadge(ctx, L.it, L.x, L.y - 14 - up, 11, now);
        ctx.restore();
      }
    }
  };
  window.Items = Items; window.Loot = Loot;
})();
