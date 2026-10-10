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
  const TUNE = { artillery: { dmg: .6, aoe: .82 }, mage: { dmg: .78, aoe: .86 }, archer: { dmg: 1.18 } };
  for (const [t, k] of Object.entries(TUNE)) for (const L of CONFIG.towers[t].levels) {
    if (k.dmg && L.damage) L.damage = L.damage.map(v => Math.max(1, Math.round(v * k.dmg)));
    if (k.aoe && L.aoe) L.aoe = Math.round(L.aoe * k.aoe);
  }
  CONFIG.items.rarities[4].k = 1.6; CONFIG.items.rarities[5].k = 2.4;

  window.Rev82 = { version: 82 };
})();
