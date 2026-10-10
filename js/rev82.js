/* Rev 82 – bản hoàn thiện cho điện thoại: bản đồ tổng mặc định, thanh máu gọn, cân bằng sát thương,
 * quái mới theo vùng, vật phẩm & tướng có hiệu ứng riêng, giao diện thống nhất. Nạp sau main.js. */
(function () {
  'use strict';

  /* ===== 5. Bản đồ tổng: luôn dùng tranh 6 vùng mặc định (worlds56), không ghi đè ảnh từng thẻ ===== */
  const renderMap = UI.renderMap;
  UI.renderMap = function () {
    const out = renderMap.apply(this, arguments);
    document.querySelectorAll('.world-card').forEach(c => { c.style.backgroundImage = ''; c.style.backgroundSize = ''; c.style.backgroundPosition = ''; });
    return out;
  };

  /* ===== 6. Thanh máu gọn: mảnh, ngắn, sát đầu; quái trâu có vạch chia khúc ===== */
  function bar(g, cx, y, w, ratio, col, ticks) {
    const h = 1.8, x = cx - w / 2, r = Math.max(0, Math.min(1, ratio));
    g.fillStyle = 'rgba(20,12,22,.85)'; g.fillRect(x - .6, y - .6, w + 1.2, h + 1.2);
    g.fillStyle = '#55242a'; g.fillRect(x, y, w, h);
    g.fillStyle = r > .5 ? col : r > .25 ? '#f0a23a' : '#f05a3a'; g.fillRect(x, y, w * r, h);
    g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(x, y, w * r, .6);
    if (ticks > 1) { g.fillStyle = 'rgba(20,12,22,.7)'; for (let k = 1; k < ticks; k++) g.fillRect(x + w * k / ticks - .3, y, .6, h); }
  }
  const spawn = Enemies.spawn;
  Enemies.spawn = function () {
    const e = spawn.apply(this, arguments), P = e && Object.getPrototypeOf(e);
    if (P && !P.__bar82) {
      P.__bar82 = true;
      P.drawBar = function (g) {
        if (this.boss || this.hp >= this.maxHp || !this.alive) return;
        const w = Math.max(11, Math.min(22, this.radius * 1.15)), ticks = Math.min(5, Math.floor(this.maxHp / 400));
        bar(g, this.x, this.y + this.radius * .5 - this.height - 5, w, this.hp / this.maxHp, '#e8463a', ticks);
      };
    }
    return e;
  };
  Unit.prototype.drawBar = function (g) {
    if (this.state === 'dead' || this.hp >= this.maxHp) return;
    const s = CONFIG.unitScale || 1;
    bar(g, this.x, this.y + this.radius * .5 - (this.isHero ? 50 : 36) * s, this.isHero ? 15 : 9, this.hp / this.maxHp, this.isHero ? '#ffd24a' : '#6ad04a', 0);
  };

  /* ===== 7. Cân bằng sát thương trụ =====
   * Mô phỏng 60 giây, trụ cấp 4 bắn vào dòng quái liên tục (trước khi chỉnh): Lính 41 · Cung 44 · Đại bác 165 · Phù Thủy 86 sát thương/giây;
   * lắp đủ Thần Tích: Đại bác 890 (×5,4). Mục tiêu: đánh đám đông Đại bác ~75, Phù Thủy ~60, Cung ~52 (mạnh nhất khi đánh 1 mục tiêu/boss),
   * Lính ~41 nhưng giữ chân quái. Đồ Huyền thoại / Thần Tích vẫn mạnh nhưng không nhân quá ~3 lần. */
  const TUNE = { artillery: { dmg: .7, aoe: .85 }, mage: { dmg: .84, aoe: .9 }, archer: { dmg: 1.3 }, barracks: { dmg: 1.25, hp: 1.15 } };
  for (const [t, k] of Object.entries(TUNE)) for (const L of CONFIG.towers[t].levels) {
    if (k.dmg && L.damage) L.damage = L.damage.map(v => Math.max(1, Math.round(v * k.dmg)));
    if (k.aoe && L.aoe) L.aoe = Math.round(L.aoe * k.aoe);
    if (k.hp && L.hp) L.hp = Math.round(L.hp * k.hp);
  }
  CONFIG.items.rarities[4].k = 1.6; CONFIG.items.rarities[5].k = 2.4;

  /* ===== 8. Quái mới theo vùng – dựng từ hình vẽ tay sẵn có, mỗi loại một cơ chế riêng ===== */
  const E = CONFIG.enemies;
  // [id, hình gốc, tên, chỉ số ghi đè, mô tả]
  const NEW = [
    // Vương Quốc Người
    ['cutpurse', 'bandit', 'Kẻ Móc Túi', { hp: 85, speed: 96, armor: .05, reward: 9, thief: 25 }, 'Chạy rất nhanh. Lọt qua cổng sẽ cuỗm thêm 25 vàng của bạn.'],
    ['nightShade', 'shade', 'Bóng Đêm', { hp: 125, speed: 64, mres: .2, reward: 11, stealth: .5 }, 'Ẩn trong bóng tối: trụ chỉ gây 50% sát thương cho tới khi lính hoặc tướng chặn được nó.'],
    ['powderGoblin', 'goblin', 'Yêu Tinh Thuốc Nổ', { hp: 95, speed: 74, reward: 8, bomb: { r: 52, dmg: 45 }, size: 1.15 }, 'Ôm thùng thuốc súng. Khi chết phát nổ, gây sát thương lính và tướng đứng gần.'],
    // Rừng Cổ Elf
    ['shadowWarg', 'warg', 'Sói Bóng', { hp: 150, speed: 84, reward: 10, dodge: .3 }, 'Lẩn rất nhanh: né 30% mũi tên, đạn pháo và phép bắn từ trụ. Lính đánh trúng chắc chắn.'],
    ['thornBeetle', 'scorpion', 'Bọ Gai Rừng', { hp: 280, speed: 52, armor: .55, reward: 14, thorns: .25, size: 1.15 }, 'Vỏ đầy gai: lính và tướng đánh nó bị dội lại 25% sát thương.'],
    ['rootling', 'treant', 'Cây Ma Non', { hp: 240, speed: 40, armor: .2, reward: 12, split: { type: 'goblin', n: 2 }, size: .7 }, 'Khi gục, thân cây nứt ra hai Yêu Tinh nấp bên trong.'],
    // Cõi Phù Thủy
    ['crystalWraith', 'wraith', 'Hồn Pha Lê', { hp: 175, speed: 56, mres: .45, reward: 14, shield: 140 }, 'Bay. Vỏ pha lê hút 140 sát thương đầu tiên rồi mới vỡ.'],
    ['blinkShade', 'shade', 'Ma Ảnh Dịch Chuyển', { hp: 165, speed: 58, mres: .25, reward: 13, blink: { every: 5, dist: 58 }, size: 1.1 }, 'Cứ 5 giây lại dịch chuyển vọt lên phía trước, kể cả khi đang bị chặn.'],
    ['hexMummy', 'mummy', 'Xác Ướp Phép', { hp: 430, speed: 34, armor: .2, mres: .35, reward: 18, revive: .45 }, 'Gục lần đầu sẽ đứng dậy với 45% máu. Phải hạ hai lần.'],
    // Sơn Thành Người Lùn
    ['iceScorpion', 'scorpion', 'Bọ Cạp Băng', { hp: 310, speed: 50, armor: .6, reward: 15, frost: .7, size: 1.2 }, 'Càng băng làm lính bị đánh trúng chậm tay hẳn đi.'],
    ['yetiTroll', 'troll', 'Troll Tuyết', { hp: 1150, speed: 30, armor: .15, mres: .25, reward: 40, regen: 16, enrage: .4, size: 1.08 }, 'Hồi máu liên tục. Dưới 40% máu nổi điên: chạy và đánh nhanh gấp rưỡi.'],
    ['shardGolem', 'iceGolem', 'Người Băng Vỡ', { hp: 560, speed: 34, armor: .35, mres: .2, reward: 24, split: { type: 'frostWolf', n: 2 }, size: .85 }, 'Vỡ tan khi gục, thả ra hai Sói Tuyết.'],
    // Hoang Địa Orc
    ['berserker', 'blackOrc', 'Orc Cuồng Nộ', { hp: 430, speed: 44, armor: .45, reward: 20, enrage: .5, size: 1.06 }, 'Dưới 50% máu nổi điên: chạy và đánh nhanh gấp rưỡi.'],
    ['fireScorpion', 'scorpion', 'Bọ Cạp Lửa', { hp: 270, speed: 56, armor: .5, reward: 14, burn: 7, noBurn: true, size: 1.2 }, 'Đốt cháy lính trúng đòn (7 sát thương/giây trong 3 giây). Miễn nhiễm lửa đốt.'],
    ['warDrummer', 'orc', 'Orc Đánh Trống', { hp: 320, speed: 46, armor: .3, reward: 18, aura: { r: 85, dr: .2, sp: .25 } }, 'Tiếng trống thúc quân: quái quanh nó chạy nhanh hơn 25% và chịu ít hơn 20% sát thương.'],
    // Chiến Tuyến Liên Minh
    ['voidMummy', 'mummy', 'Xác Ướp Hư Vô', { hp: 520, speed: 34, armor: .25, mres: .5, reward: 22, revive: .5, size: 1.08 }, 'Gục lần đầu sẽ đứng dậy với 50% máu.'],
    ['riftShade', 'voidling', 'Kẻ Xé Không Gian', { hp: 230, speed: 58, mres: .35, reward: 16, blink: { every: 4, dist: 64 } }, 'Xé không gian để vọt lên phía trước mỗi 4 giây.'],
    ['voidPriest', 'voidWalker', 'Tư Tế Hư Vô', { hp: 560, speed: 40, armor: .3, mres: .45, reward: 26, healer: true, aura: { r: 80, dr: .2, sp: 0 } }, 'Hồi máu quái gần nó mỗi 4 giây và bọc chúng trong màn hư vô (giảm 20% sát thương).']
  ];
  const ROSTER = [[], [], [], [], [], []];
  NEW.forEach(([id, base, name, o, desc], i) => {
    const b = E[base]; E[id] = { ...b, name, desc, ...o, art: b.art || base, artFrom: base };
    if (o.size) E[id].radius = Math.round(b.radius * o.size);
    if (window.ArtChars && ArtChars[base] && !ArtChars[id]) ArtChars[id] = ArtChars[base];
    ROSTER[(i / 3) | 0].push(id);
  });
  // vẽ quái mới bằng hình gốc
  const pchar = Painter.char;
  Painter.char = function (g, art) { const d = E[art]; if (d && d.artFrom) arguments[1] = d.artFrom; return pchar.apply(this, arguments); };
  // trộn quái mới vào đợt của từng vùng: từ đợt 2 trở đi, số lượng tăng dần theo map và đợt
  CONFIG.levels.forEach((L, li) => {
    const types = ROSTER[Math.min(5, (li / 6) | 0)], s = li % 6; if (!types.length || !L.waves) return;
    L.waves = L.waves.map((w, wi) => {
      if (wi < 1) return w;
      const t = types[(wi + s) % types.length], big = E[t].hp > 600, n = big ? 1 + ((s + wi) / 6 | 0) : 1 + ((s + wi) / 3 | 0);
      return w + `, ${t}:${n}`;
    });
  });

  // ----- cơ chế -----
  let curEnemy = null, curUnit = null;
  function patchEnemy(e) {
    const P = Object.getPrototypeOf(e); if (P.__mech82) return; P.__mech82 = true;
    const upd = P.update;
    P.update = function (dt) {
      const d = this.def; this.age82 = (this.age82 || 0) + dt;
      if (d.enrage && !this.rage82 && this.hp < this.maxHp * d.enrage) { this.rage82 = true; this.speedMul *= 1.5; this.rateMul *= .66; Effects.comic(this.x, this.y - this.height - 14, 'NỔI ĐIÊN!', '#ff5a3a', true); }
      if (d.blink && this.alive) { this.blink82 = (this.blink82 ?? d.blink.every * (.5 + Math.random() * .5)) - dt; if (this.blink82 <= 0 && this.stunT <= 0) { this.blink82 = d.blink.every; Effects.burst(this.x, this.y - 10, '#b48cff', 10, 90, .35, 4, 0); this.dist = Math.min(this.path.length - 4, this.dist + d.blink.dist); this.blocker = null; this.state = 'walk'; this.place(); Effects.ring(this.x, this.y, 4, 26, .35, '#c8a8ff', 3); } }
      if (d.aura && this.alive) for (const o of Enemies.list) if (o !== this && o.alive && Math.hypot(o.x - this.x, o.y - this.y) < d.aura.r) { o.aura82T = .3; o.aura82 = d.aura; }
      if (this.aura82T > 0) this.aura82T -= dt;
      const prevSp = this.speedMul; if (this.aura82T > 0 && this.aura82.sp) this.speedMul = prevSp * (1 + this.aura82.sp);
      curEnemy = this; try { return upd.call(this, dt); } finally { curEnemy = null; this.speedMul = prevSp; }
    };
    const draw = P.draw;
    P.draw = function (g) {
      const d = this.def, fy = this.y + this.radius * .5;
      if (d.stealth && !this.blocker) { g.save(); g.globalAlpha = .42 + .12 * Math.sin(this.anim * 3); const r = draw.apply(this, arguments); g.restore(); return r; }
      if (d.aura) { const t = (this.anim * .8) % 1; g.save(); g.globalAlpha = .5 * (1 - t); g.strokeStyle = d.healer ? '#b48cff' : '#ff9a4a'; g.lineWidth = 1.5; g.beginPath(); g.ellipse(this.x, fy, d.aura.r * t, d.aura.r * t * .42, 0, 0, Math.PI * 2); g.stroke(); g.restore(); }
      if (this.rage82) ArtKit.glow(g, this.x, fy - this.height * .5, this.radius * 2.6, '#ff3a1a', .35 + Math.sin(this.anim * 9) * .12);
      if (d.burn) ArtKit.glow(g, this.x, fy - this.height * .4, this.radius * 2, '#ff8a2a', .3);
      if (d.frost) ArtKit.glow(g, this.x, fy - this.height * .4, this.radius * 2, '#9ae8ff', .3);
      const r = draw.apply(this, arguments);
      if (this.shield82 > 0) { g.save(); g.globalAlpha = .35 + .15 * Math.sin(this.anim * 5); g.strokeStyle = '#bff4ff'; g.fillStyle = 'rgba(160,230,255,.18)'; g.lineWidth = 1.4; g.beginPath(); g.ellipse(this.x, fy - this.height * .5, this.radius * 1.5, this.height * .62, 0, 0, Math.PI * 2); g.fill(); g.stroke(); g.restore(); }
      if (this.aura82T > 0) { g.save(); g.globalAlpha = .55; g.fillStyle = this.aura82 && this.aura82.sp ? '#ffb46a' : '#c8a8ff'; g.beginPath(); g.arc(this.x, fy - this.height - 2, 1.6, 0, Math.PI * 2); g.fill(); g.restore(); }
      return r;
    };
  }
  const spawnMech = Enemies.spawn;
  Enemies.spawn = function (type) {
    const e = spawnMech.apply(this, arguments); if (!e) return e;
    patchEnemy(e); const d = e.def;
    if (d.shield) e.shield82 = d.shield * (e.maxHp / d.hp);
    return e;
  };
  // trụ (không phải lính) bắn: né, ẩn thân; mọi đòn: khiên pha lê, hào quang, miễn lửa; lính đánh: gai phản
  const hit = Combat.hitEnemy;
  Combat.hitEnemy = function (e, dmg, type, pen) {
    if (!e || !e.alive) return 0;
    const d = e.def, melee = !!curUnit;
    let k = 1;
    if (!melee && d.dodge && Math.random() < d.dodge) { Effects.comic && Effects.comic(e.x, e.y - e.height - 6, 'NÉ!', '#d8f0ff'); return 0; }
    if (!melee && d.stealth && !e.blocker) k *= 1 - d.stealth;
    if (e.aura82T > 0 && e.aura82) k *= 1 - e.aura82.dr;
    if (k !== 1) dmg = Array.isArray(dmg) ? [dmg[0] * k, dmg[1] * k] : dmg * k;
    if (e.shield82 > 0) {
      const raw = this.roll(dmg), soak = Math.min(e.shield82, raw); e.shield82 -= soak;
      if (e.shield82 <= 0) Effects.burst(e.x, e.y - e.height * .5, '#bff4ff', 12, 110, .4, 4, 60);
      if (raw - soak <= 0) { e.flash = .06; return 0; }
      dmg = raw - soak;
    }
    const amt = hit.call(this, e, dmg, type, pen);
    if (melee && d.thorns && amt > 0 && curUnit.active) Combat.hitUnit(curUnit, amt * d.thorns);
    return amt;
  };
  // độc/cháy theo thời gian đi qua Enemies.dot → đánh dấu để Bọ Cạp Lửa miễn nhiễm lửa
  const dot = Enemies.dot;
  if (dot) Enemies.dot = function (e, kind) { if (kind === 'burn' && e.def.noBurn) return; return dot.apply(this, arguments); };
  // lính đánh quái: đánh dấu "cận chiến"
  const uUpd = Unit.prototype.update;
  Unit.prototype.update = function () { curUnit = this; try { return uUpd.apply(this, arguments); } finally { curUnit = null; } };
  // quái đánh lính: băng làm chậm tay, lửa đốt
  const hitUnit = Combat.hitUnit;
  Combat.hitUnit = function (u, dmg) {
    const r = hitUnit.apply(this, arguments), e = curEnemy;
    if (e && u && u.active) {
      if (e.def.frost) { u.cd = Math.max(u.cd || 0, (u.rate || 1) * (1 + e.def.frost)); u.frost82T = 2; }
      if (e.def.burn) { u.burn82 = { t: 3, dps: e.def.burn }; }
    }
    return r;
  };
  const uTick = Unit.prototype.update;
  Unit.prototype.update = function (dt) {
    if (this.burn82 && this.burn82.t > 0 && this.active) { this.burn82.t -= dt; this.burnAcc82 = (this.burnAcc82 || 0) + this.burn82.dps * dt; if (this.burnAcc82 >= 1) { const n = Math.floor(this.burnAcc82); this.burnAcc82 -= n; this.hp -= n; if (this.hp <= 0) Units.kill(this); } }
    return uTick.apply(this, arguments);
  };
  // chết: nổ, tách đôi, hồi sinh
  const kill = Game.killEnemy;
  Game.killEnemy = function (e) {
    const d = e.def;
    if (d.revive && !e.revived82) {
      e.revived82 = true; e.hp = Math.round(e.maxHp * d.revive); e.stunT = 1.4; e.flash = .3;
      Effects.ring(e.x, e.y, 6, 40, .6, '#e8d8a0', 4); Effects.comic && Effects.comic(e.x, e.y - e.height - 14, 'SỐNG LẠI!', '#e8d8a0', true); return;
    }
    const r = kill.apply(this, arguments);
    if (d.bomb) {
      Effects.burst(e.x, e.y - 8, '#ffb04a', 18, 160, .5, 6, 220); Effects.ring(e.x, e.y, 8, d.bomb.r, .4, '#ffcf6a', 5); Effects.shake && Effects.shake(4, .2); AudioSys.play('explode');
      for (const u of Units.list) if (u.active && Math.hypot(u.x - e.x, (u.y - e.y) * 1.25) < d.bomb.r) Combat.hitUnit(u, d.bomb.dmg);
    }
    if (d.split) for (let i = 0; i < d.split.n; i++) {
      const c = Enemies.spawn(d.split.type, e.pathIndex, Waves.hpMul * .55);
      c.dist = Math.max(0, e.dist + (i ? 8 : -8)); c.lat = (i ? 7 : -7); c.place(); c.reward = Math.max(1, Math.round(c.reward * .4)); c.alpha = .3;
    }
    return r;
  };
  // lọt cổng: kẻ móc túi cuỗm vàng
  const escaped = Game.enemyEscaped;
  Game.enemyEscaped = function (e) {
    const r = escaped.apply(this, arguments);
    if (e.def.thief) { const n = Math.min(this.gold, e.def.thief); this.gold -= n; if (n) UI.toast && UI.toast('Kẻ Móc Túi cuỗm mất ' + n + ' vàng!'); }
    return r;
  };

  /* ===== 10a. Bộ đồ trụ: ≥3 món bậc Cao cấp trở lên → +6% sát thương; đủ 6 món → hiệu ứng bộ riêng ===== */
  const SET_R = 3;
  const SETS = {
    archer: { name: 'Bộ Xạ Thủ Rừng Sâu', text: 'Mỗi mũi tên thứ 4 xuyên qua, trúng thêm 2 quái phía sau (60% sát thương).' },
    mage: { name: 'Bộ Pháp Sư Tinh Tú', text: 'Phép nảy sang 2 quái gần đó (40% sát thương phép).' },
    artillery: { name: 'Bộ Pháo Thủ Núi Lửa', text: 'Đạn để lại vùng lửa 2,5 giây, đốt 25% sát thương phát nổ mỗi giây.' },
    barracks: { name: 'Bộ Vệ Binh Hoàng Gia', text: 'Lính hút 25% sát thương gây ra thành máu và có khiên 3 giây mỗi lần hồi sinh.' }
  };
  const setCache = {};
  function setLevel(type) { // 0: không, 1: nửa bộ, 2: đủ bộ
    const now = performance.now(); const c = setCache[type]; if (c && now - c.t < 1000) return c.v;
    let n = 0; try { for (const it of Items.mods(type).list) if (it && it.r >= SET_R) n++; } catch (e) {}
    const v = n >= 6 ? 2 : n >= 3 ? 1 : 0; setCache[type] = { t: now, v }; return v;
  }
  const dirty = Items.dirty; if (dirty) Items.dirty = function () { for (const k in setCache) delete setCache[k]; return dirty.apply(this, arguments); };

  /* ===== 10b. Nội tại riêng của 10 tướng ===== */
  const PASSIVE = {
    aldric: ['Khiên Đồng Đội', 'Lính đứng trong 90 quanh Aldric chịu ít hơn 15% sát thương.'],
    lyra: ['Mắt Ưng', 'Mỗi đòn thứ 4 là chí mạng, gây 250% sát thương.'],
    selene: ['Dư Âm Tinh Tú', 'Đòn đánh làm chậm quái 30% trong 1,5 giây.'],
    borin: ['Kỹ Sư Chiến Trường', 'Trụ trong 120 quanh Borin bắn nhanh hơn 12%.'],
    nara: ['Mầm Sống', 'Đồng minh trong 100 quanh Nara hồi 1,2% máu mỗi giây.'],
    veyra: ['Búa Phá Giáp', 'Mỗi đòn xé 5% giáp mục tiêu (tối đa 15%) trong 4 giây – mọi trụ đều được lợi.'],
    thalen: ['Song Đao', '25% cơ hội chém thêm một nhát nữa.'],
    oria: ['Đèn Linh Hồn', 'Hạ quái thì một đốm linh hồn bay sang quái gần nhất, gây 40% sát thương phép.'],
    haldren: ['Địa Chấn', 'Mỗi đòn thứ 4 nện đất: sát thương lan 60% và choáng 0,8 giây.'],
    brakka: ['Khát Máu', 'Hồi máu bằng 20% sát thương gây ra.']
  };
  for (const [id, p] of Object.entries(PASSIVE)) if (CONFIG.heroes[id]) CONFIG.heroes[id].passive82 = p;
  const near = (a, b, r) => Math.hypot(a.x - b.x, a.y - b.y) < r;
  const liveHero = () => { const h = Units.hero; return h && h.active && h.state !== 'dead' ? h : null; };

  // gắn nguồn bắn (trụ / tướng) vào đạn
  let curTower = null, curShot = null;
  const fire = Combat.fire;
  Combat.fire = function (kind, x, y, target, o) {
    if (o && kind !== 'enemyArrow') { if (curTower) o.src82 = curTower; else if (curUnit && curUnit.isHero) o.hero82 = curUnit; }
    return fire.apply(this, arguments);
  };
  const impact = Combat.impact;
  Combat.impact = function (p) { curShot = p.o; try { return impact.apply(this, arguments); } finally { curShot = null; } };
  function patchTowerProto(T) {
    const P = Object.getPrototypeOf(T); if (P.__rev82) return; P.__rev82 = true;
    const rel = P.release; P.release = function () { curTower = this; try { return rel.apply(this, arguments); } finally { curTower = null; } };
    const upd = P.update; P.update = function (dt) { const h = liveHero(); if (h && h.heroId === 'borin' && near(h, this, 120)) this.cd -= dt * .12; return upd.apply(this, arguments); };
  }
  const tbuild = Towers.build;
  Towers.build = function () { const r = tbuild.apply(this, arguments); if (r) patchTowerProto(r); return r; };

  // vùng lửa của bộ Pháo Thủ
  const fires = [];
  const gUpd = Game.update;
  Game.update = function (dt) {
    const r = gUpd.apply(this, arguments);
    for (let i = fires.length - 1; i >= 0; i--) { const f = fires[i]; f.t -= dt; if (f.t <= 0) { fires.splice(i, 1); continue; } f.tick -= dt; if (f.tick <= 0) { f.tick = .5; for (const e of Enemies.list) if (e.alive && !e.flying && Math.hypot(e.x - f.x, (e.y - f.y) * 1.25) < f.r) hit.call(Combat, e, f.dps * .5, 'true'); } }
    const h = liveHero(); if (h && h.heroId === 'nara') for (const u of Units.list) if (u.active && u.hp < u.maxHp && near(h, u, 100)) u.hp = Math.min(u.maxHp, u.hp + u.maxHp * .012 * dt);
    for (const e of Enemies.list) if (e.shred82T > 0 && (e.shred82T -= dt) <= 0) { e.armor = e.armor82; e.shred82 = 0; }
    return r;
  };
  const fxDraw = Effects.drawDecals;
  Effects.drawDecals = function (g) {
    const r = fxDraw.apply(this, arguments);
    for (const f of fires) { const a = Math.min(1, f.t) * .55; g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r); gr.addColorStop(0, `rgba(255,150,40,${a})`); gr.addColorStop(1, 'rgba(255,80,20,0)'); g.fillStyle = gr; g.beginPath(); g.ellipse(f.x, f.y, f.r, f.r * .55, 0, 0, Math.PI * 2); g.fill(); g.restore(); if (Math.random() < .3) Effects.particle(f.x + (Math.random() - .5) * f.r, f.y, 0, -30, .5, '#ffb04a', 3); }
    return r;
  };
  if (Effects.clear) { const c = Effects.clear; Effects.clear = function () { fires.length = 0; return c.apply(this, arguments); }; }

  // hiệu ứng khi trúng đòn (sau khi đã trừ máu)
  const hit2 = Combat.hitEnemy;
  let inProc = false;
  Combat.hitEnemy = function (e, dmg, type, pen) {
    const before = e && e.alive;
    let mul = 1;
    const tw = curShot && curShot.src82, heroShot = curShot && curShot.hero82, h = curUnit && curUnit.isHero ? curUnit : heroShot;
    if (tw && !inProc && setLevel(tw.type) >= 1) mul *= 1.06;
    if (h && !inProc && h.heroId === 'lyra') { h.crit82 = (h.crit82 || 0) + 1; if (h.crit82 % 4 === 0) { mul *= 2.5; Effects.comic && Effects.comic(e.x, e.y - e.height - 8, 'CHÍ MẠNG!', '#ffe14a'); } }
    if (mul !== 1) dmg = Array.isArray(dmg) ? [dmg[0] * mul, dmg[1] * mul] : dmg * mul;
    const amt = hit2.call(this, e, dmg, type, pen);
    if (!before || inProc || !amt) return amt;
    inProc = true;
    try {
      if (tw && setLevel(tw.type) >= 2) {
        if (tw.type === 'archer' && tw.shots % 4 === 0) { let n = 0; for (const o of Enemies.list) if (o !== e && o.alive && n < 2 && Math.hypot(o.x - e.x, o.y - e.y) < 70) { hit2.call(this, o, amt * .6, 'physical'); Effects.hit(o.x, o.y - o.height * .5, '#e8ffd0'); n++; } }
        else if (tw.type === 'mage' && type === 'magic' && !curShot.chain82) { curShot.chain82 = true; let n = 0; for (const o of Enemies.list) if (o !== e && o.alive && n < 2 && Math.hypot(o.x - e.x, o.y - e.y) < 80) { hit2.call(this, o, amt * .4, 'magic'); Effects.ring(o.x, o.y - 14, 4, 18, .3, '#c8a8ff', 2); n++; } }
        else if (tw.type === 'artillery' && !curShot.fire82) { curShot.fire82 = true; fires.push({ x: e.x, y: e.y, r: Math.max(24, (curShot.aoe || 50) * .6), t: 2.5, tick: 0, dps: amt * .25 }); }
      }
      if (curUnit && !curUnit.isHero && curUnit.tower && setLevel('barracks') >= 2) curUnit.hp = Math.min(curUnit.maxHp, curUnit.hp + amt * .25);
      if (h) {
        const id = h.heroId;
        if (id === 'selene') { e.slowT = Math.max(e.slowT || 0, 1.5); e.slowMul = Math.min(e.slowMul || 1, .7); }
        else if (id === 'veyra' && e.alive) { if (!e.shred82) e.armor82 = e.armor; e.shred82 = Math.min(.15, (e.shred82 || 0) + .05); e.armor = Math.max(0, e.armor82 - e.shred82); e.shred82T = 4; }
        else if (id === 'thalen' && Math.random() < .25 && e.alive) hit2.call(this, e, dmg, type, pen);
        else if (id === 'haldren') { h.quake82 = (h.quake82 || 0) + 1; if (h.quake82 % 4 === 0) { for (const o of Enemies.list) if (o.alive && !o.flying && Math.hypot(o.x - e.x, (o.y - e.y) * 1.25) < 50) { if (o !== e) hit2.call(this, o, amt * .6, 'physical'); if (!o.boss) o.stunT = Math.max(o.stunT || 0, .8); } Effects.ring(e.x, e.y, 8, 50, .4, '#d8c8a8', 5); Effects.shake && Effects.shake(3, .15); } }
        else if (id === 'brakka') h.hp = Math.min(h.maxHp, h.hp + amt * .2);
        if (id === 'oria' && !e.alive) { let best = null, bd = 120; for (const o of Enemies.list) { const d = Math.hypot(o.x - e.x, o.y - e.y); if (o.alive && d < bd) { bd = d; best = o; } } if (best) { hit2.call(this, best, (h.damage ? h.damage[1] : 30) * .4, 'magic'); Effects.ring(best.x, best.y - 16, 3, 16, .35, '#9ad8ff', 3); } }
      }
    } finally { inProc = false; }
    return amt;
  };
  // Aldric che chắn; khiên hồi sinh của bộ Vệ Binh
  const hitU2 = Combat.hitUnit;
  Combat.hitUnit = function (u, dmg) {
    const h = liveHero();
    if (u && !u.isHero && h && h.heroId === 'aldric' && near(h, u, 90)) dmg = Array.isArray(dmg) ? [dmg[0] * .85, dmg[1] * .85] : dmg * .85;
    if (u && u.guard82 > 0) dmg = Array.isArray(dmg) ? [dmg[0] * .3, dmg[1] * .3] : dmg * .3;
    return hitU2.call(this, u, dmg);
  };
  const urev = Unit.prototype.respawn;
  if (urev) Unit.prototype.respawn = function () { const r = urev.apply(this, arguments); if (this.tower && setLevel('barracks') >= 2) this.guard82 = 3; return r; };
  const uT2 = Unit.prototype.update;
  Unit.prototype.update = function (dt) { if (this.guard82 > 0) this.guard82 -= dt; return uT2.apply(this, arguments); };

  // hiện nội tại trong màn Anh Hùng và hiệu ứng bộ trong Kho Đồ
  const rh = UI.renderHeroes;
  UI.renderHeroes = function () {
    const r = rh.apply(this, arguments), id = CONFIG.heroes[this.viewHero] ? this.viewHero : Progress.selectedHero(), p = CONFIG.heroes[id] && CONFIG.heroes[id].passive82;
    const pair = document.querySelector('#hero-detail .skill-pair');
    if (p && pair && !document.querySelector('#hero-detail .passive82')) pair.insertAdjacentHTML('afterend', `<div class="passive82"><b>NỘI TẠI · ${p[0]}</b><span>${p[1]}</span></div>`);
    return r;
  };
  const ri = UI.renderItems;
  UI.renderItems = function () {
    const r = ri.apply(this, arguments), t = this.itemTower, S = SETS[t], box = document.querySelector('#items-tower .it-bonus');
    if (S && box) { let n = 0; try { for (const it of Items.mods(t).list) if (it && it.r >= SET_R) n++; } catch (e) {}
      box.insertAdjacentHTML('beforeend', `<li class="set82 ${n >= 6 ? 'on' : n >= 3 ? 'half' : ''}"><b>${S.name} (${n}/6 món Cao cấp+)</b> · 3 món: +6% sát thương · 6 món: ${S.text}</li>`); }
    return r;
  };

  window.Rev82 = { version: 82, ROSTER, NEW, SETS, PASSIVE, setLevel };
})();
