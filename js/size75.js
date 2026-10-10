/* Rev 75 – vóc dáng quái hợp lý (chiều cao hiển thị, đơn vị thế giới; lính người ≈ 32, tướng ≈ 38).
 * Nhỏ: yêu tinh, quỷ lửa, nấm, bọ. Trung bình: người/xương/orc. Lớn: troll, golem, cây ma. Boss to rõ rệt.
 * Bán kính va chạm co giãn theo chiều cao để quái nhỏ không chiếm cả lòng đường. */
(function () {
  const H = {
    goblin: 20, imp: 20, mushroomShaman: 21, scorpion: 19, shellGuard: 24, voidling: 24,
    warg: 24, frostWolf: 25, shade: 28, wraith: 30,
    bandit: 31, skeleton: 31, orcArcher: 32, mummy: 32, orc: 35, wolfRider: 36, drake: 36,
    voidWalker: 37, blackOrc: 40, deathKnight: 40,
    troll: 50, iceGolem: 50, treant: 52, magmaGolem: 52,
    darkKnight: 56, pharaoh: 58, voidLord: 62, darkLord: 64, trollKing: 66, magmaLord: 66, treantKing: 68
  };
  for (const [id, h] of Object.entries(H)) {
    const e = CONFIG.enemies[id]; if (!e) continue;
    const old = e.drawHeight || 34;
    e.drawHeight = h;
    e.radius = Math.max(8, Math.round(e.radius * Math.sqrt(h / old)));
  }
  window.Size75 = H;
})();
