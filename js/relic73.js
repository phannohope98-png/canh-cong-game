/* Revision 73 – THẦN TÍCH: 24 mảnh Thiên Chung Bình Minh.
 * Thần thoại: trước khi có sáu thế giới chỉ có Thiên Chung treo giữa hư không; mỗi tiếng chuông sinh ra một thế giới.
 * Khi Hư Vô đánh vỡ chuông, 24 mảnh lõi sao rơi xuống và nhập vào vật dụng của những người giữ cổng.
 * Mỗi Thần Tích: chỉ số chính ×4 (Huyền Thoại ×1,8) + 2 thuộc tính phụ + 1 THẦN LỰC riêng.
 * Thần lực: regen (lính hồi máu ×N), aura (làm chậm quái trong tầm), execute (kết liễu quái thường dưới X% máu),
 * gold (thêm vàng từ quái do loại trụ này hạ), freeze (định kỳ đóng băng thời gian mọi quái trong tầm),
 * gRate/gRange/gDmg (tăng tốc đánh / tầm / sát thương cho TOÀN BỘ trụ trên sân), multi (bắn thêm mũi tên),
 * critX (hệ số chí mạng), chain (phép nảy), cluster (bom chùm), twin (bắn thêm 1 quả pháo). */
(function () {
  const K5 = 4;
  CONFIG.items.rarities[5].k = K5;
  const RELICS = {
    barracks: [
      ['Cờ Hiệu Bình Minh Vĩnh Cửu', { hp: .15, rate: .10 }, { regen: 3 }, 'Lính hồi máu nhanh gấp 3 lần',
        'Mảnh thứ nhất của Thiên Chung rơi xuống ngọn cờ của đội giữ cổng cuối cùng còn đứng vững. Từ đó lá cờ không bao giờ rách: chừng nào nó còn bay, những người lính dưới bóng cờ còn đứng dậy được. Người ta nói mỗi đường chỉ trên cờ là một tiếng hô của những người đã ngã xuống.'],
      ['Thiên Môn Bất Khả Xâm', { armor: .06, hp: .12 }, { aura: .2 }, 'Quái trong tầm doanh trại chậm 20%',
        'Mảnh thứ hai cắm sâu vào cánh cổng gỗ của một ngôi làng không tên. Đêm Hư Vô tràn qua, cánh cổng ấy là thứ duy nhất không đổ. Ánh sao trong thớ gỗ làm thời gian quanh nó đặc lại, mọi kẻ địch đến gần đều bước như đang lội bùn.'],
      ['Ấn Khai Thế', { rate: .12, hp: .10 }, { execute: .15 }, 'Lính kết liễu quái thường dưới 15% máu',
        'Ấn này đóng lên bản hiệp ước đầu tiên giữa năm chủng tộc. Khi mảnh thứ ba của Thiên Chung rơi trúng, nét khắc bừng sáng và mang luôn quyền phán quyết của tiếng chuông. Lưỡi kiếm nào được ấn này chạm vào đều kết thúc mọi trận đấu chỉ bằng một nhát.'],
      ['Vòm Trời Che Chở', { block: .08, armor: .05 }, { gold: .2 }, 'Quái do lính hạ rơi thêm 20% vàng',
        'Mảnh thứ tư hóa thành mái vòm che cho đoàn dân chạy nạn suốt bốn mươi ngày mưa lửa. Không một giọt lửa nào lọt qua. Dân làng đã dâng những đồng vàng cuối cùng để giữ lại tấm mái ấy, và từ đó nó luôn trả lại gấp đôi cho người bảo vệ họ.'],
      ['Tường Thành Sáng Thế', { hp: .15, block: .05 }, { freeze: 1.4 }, 'Mỗi 16 giây: ngưng đọng thời gian quanh doanh trại 1,4 giây',
        'Viên đá này từng là viên gạch đầu tiên của thế giới loài người, được đặt khi tiếng chuông đầu tiên còn vang. Mảnh thứ năm rơi vào và đánh thức ký ức của nó. Nó vẫn nhớ khoảnh khắc thời gian bắt đầu, và đôi khi tự kéo thời gian ngừng lại.'],
      ['Chuông Bình Minh Nguyên Thủy', { damage: .12, respawn: .10 }, { gRate: .10 }, 'TOÀN BỘ trụ trên sân đánh nhanh hơn 10%',
        'Đây là quả lắc của chính Thiên Chung, mảnh lớn nhất và cũng là mảnh cuối cùng còn rung. Khi nó vang lên, mọi chiến binh đều nghe thấy nhịp tim của thế giới và đánh theo nhịp ấy. Truyền thuyết nói khi đủ 24 mảnh, chuông sẽ vang lần nữa để sinh ra thế giới thứ bảy.']
    ],
    archer: [
      ['Chong Gió Thiên Hà', { rate: .10, crit: .05 }, { gRange: .06 }, 'TOÀN BỘ trụ trên sân tăng 6% tầm',
        'Mảnh thứ bảy cuốn theo những cơn gió sinh ra giữa các vì sao. Nó rơi vào chiếc chong chóng của một trinh sát Elf và từ đó chỉ quay theo gió vũ trụ. Ai đứng dưới nó đều nhìn thấy xa hơn những gì mắt thường cho phép.'],
      ['Cung Dải Ngân Hà', { crit: .06, rate: .08 }, { multi: 2 }, 'Mỗi phát bắn thêm 2 mũi tên vào mục tiêu khác',
        'Dây cung được se từ ánh sáng của dải Ngân Hà, nơi mảnh thứ tám rơi xuyên qua. Mỗi lần kéo dây, ba vì sao cùng lóe sáng. Người Elf gọi nó là "cây cung không bao giờ bắn một mình".'],
      ['Giá Tên Vạn Tinh', { damage: .12, range: .05 }, { execute: .10 }, 'Tên kết liễu quái thường dưới 10% máu',
        'Mảnh thứ chín vỡ thành vô số tia sáng và nằm lại trong giá tên của hội canh Suối Hoa. Mỗi mũi tên rút ra từ đó mang theo một ngôi sao băng. Kẻ địch đã kiệt sức không thể chống lại phán quyết của những vì sao.'],
      ['Đài Thiên Nhãn', { damage: .10, range: .06 }, { critX: 3.5 }, 'Chí mạng gây 350% sát thương (thay vì 200%)',
        'Từ trên đài này, mảnh thứ mười mở ra một con mắt nhìn thấu mọi điểm yếu của vạn vật. Cung thủ đứng gác đêm nhìn thấy cả nhịp đập trong tim kẻ thù. Một phát tên nhắm đúng chỗ ấy đủ để quật ngã những gã khổng lồ.'],
      ['Bồn Nhựa Cây Thế Giới', { rate: .08, root: .03 }, { aura: .15 }, 'Quái trong tầm chậm 15% vì nhựa cây lan',
        'Mảnh thứ mười một rơi vào rễ Cây Thế Giới, và nhựa cây chảy ra từ vết thương ấy mang ánh sáng sao. Người Elf hứng nhựa vào bồn gỗ để tẩm tên. Hơi nhựa lan ra mặt đất, làm chân quái vật nặng như đá.'],
      ['Rễ Cây Thế Giới', { poison: .10, damage: .08 }, { freeze: 1.2 }, 'Mỗi 16 giây: rễ thiêng trói mọi quái trong tầm 1,2 giây',
        'Đoạn rễ này nằm sâu nhất trong lòng đất, nơi mảnh thứ mười hai của chuông găm vào. Nó nghe được bước chân của mọi sinh vật trên mặt đất. Khi kẻ thù đông nhất, rễ trồi lên và giữ chặt tất cả chúng.']
    ],
    mage: [
      ['Lõi Tinh Vân', { aoe: .10, pen: .06 }, { chain: 1 }, 'Phép nảy sang 2 quái gần đó',
        'Mảnh thứ mười ba mang trong mình cả một tinh vân đang hình thành. Hội quan trắc Nguyệt Thạch giam nó vào lõi pha lê. Mỗi tia phép bắn ra đều mang sức hút của các vì sao và lôi kéo cả những kẻ đứng gần.'],
      ['Vòng Niệm Vô Cực', { damage: .12, range: .05 }, { gDmg: .08 }, 'TOÀN BỘ trụ và lính trên sân tăng 8% sát thương',
        'Mảnh thứ mười bốn uốn thành những vòng tròn không có điểm đầu và điểm cuối. Pháp sư đeo vòng niệm này nghe được câu thần chú đầu tiên của vũ trụ. Lời niệm ấy lan ra khắp chiến trường, tiếp sức cho mọi cánh tay cầm vũ khí.'],
      ['Ăng-ten Thiên Âm', { damage: .10, slow: .06 }, { aura: .18 }, 'Quái trong tầm chậm 18%',
        'Ăng-ten bắt được dư âm của tiếng chuông, thứ âm thanh vẫn còn vang giữa các vì sao. Mảnh thứ mười lăm phát lại âm vang ấy quanh tòa tháp. Quái vật đi vào vùng âm vang đều loạng choạng như đang mơ.'],
      ['Ống Băng Thời Không', { rate: .08, aoe: .08 }, { freeze: 1.5 }, 'Mỗi 16 giây: đóng băng thời gian mọi quái trong tầm 1,5 giây',
        'Mảnh thứ mười sáu rơi vào sông băng vĩnh cửu và làm đông cứng cả dòng thời gian quanh nó. Pháp sư dẫn hơi lạnh ấy vào ống băng. Định kỳ, tòa tháp giải phóng một luồng thời không tĩnh lặng, khiến mọi thứ xung quanh dừng hẳn.'],
      ['Thấu Kính Mặt Trăng Vỡ', { damage: .15, range: .04 }, { execute: .12 }, 'Phép kết liễu quái thường dưới 12% máu',
        'Khi trăng bị mũi giáo Hư Vô làm vỡ, mảnh thứ mười bảy rơi xuống cùng một mảnh ánh trăng. Thấu kính nhìn qua lớp phòng ngự bằng chính vết rạn ấy. Kẻ địch yếu ớt bị ánh trăng xóa sạch khỏi thế gian.'],
      ['Bản Khắc Tên Thật', { rate: .10, pen: .06 }, { gold: .25 }, 'Quái do trụ Phù Thủy hạ rơi thêm 25% vàng',
        'Mảnh thứ mười tám khắc lên đá tên thật của mọi vật trong vũ trụ. Biết tên thật của một kẻ là nắm được tất cả những gì nó mang theo. Mỗi con quái bị phù thủy hạ đều buộc phải trả lại toàn bộ chiến lợi phẩm.']
    ],
    artillery: [
      ['Ống Ngắm Đỉnh Cuối', { damage: .10, stun: .03 }, { twin: 1 }, 'Mỗi lượt bắn thêm 1 quả pháo vào mục tiêu khác',
        'Mảnh thứ mười chín rơi xuống đỉnh núi cao nhất, nơi thợ pháo Barun dựng trạm ngắm. Qua ống ngắm này, ông thấy hai mục tiêu cùng lúc như có hai đôi mắt. Mỗi lần khai hỏa, khẩu pháo gầm lên hai lần.'],
      ['Nòng Tim Núi', { aoe: .10, burn: .10 }, { cluster: 1 }, 'Đạn nổ tách thành 3 quả bom chùm',
        'Người Lùn rèn nòng pháo từ lõi quặng đỏ đập như tim, nơi mảnh thứ hai mươi đã ngủ yên hàng nghìn năm. Mỗi quả đạn bắn ra mang theo nhịp đập của ngọn núi. Khi chạm đất, nó vỡ thành ba tiếng nổ.'],
      ['Buồng Lửa Câm', { damage: .12, burn: .08 }, { gold: .2 }, 'Quái do trụ Người Lùn hạ rơi thêm 20% vàng',
        'Mảnh thứ hai mươi mốt bị khóa trong buồng nạp bằng đồng, cháy âm ỉ mà không phát ra tiếng. Ngọn lửa câm nung chảy giáp quái thành những thỏi kim loại quý. Đội pháo binh sống nhờ số chiến lợi phẩm ấy suốt cuộc chiến.'],
      ['Bánh Răng Lời Hứa', { damage: .10, range: .05 }, { gRate: .06 }, 'TOÀN BỘ trụ trên sân đánh nhanh hơn 6%',
        'Hai anh em thợ máy rèn bánh răng từ chiếc búa chung của cha, đúng đêm mảnh thứ hai mươi hai rơi xuống lò. Bánh răng ăn khớp với nhịp quay của vũ trụ. Mọi cỗ máy và chiến binh quanh nó đều chuyển động nhanh hơn một nhịp.'],
      ['Lò Tro Ngược Gió', { aoe: .08, rate: .06 }, { aura: .15 }, 'Khói nóng làm quái trong tầm chậm 15%',
        'Tro từ lò này không bay theo gió mà luôn quay ngược về lò, vì mảnh thứ hai mươi ba đang nằm trong ngọn lửa. Lớp tro nóng phủ kín chiến trường quanh tháp. Quái vật đi qua đều bỏng chân và chậm lại.'],
      ['Giằng Cầu Không Gãy', { damage: .10, aoe: .06 }, { freeze: 1.2 }, 'Mỗi 16 giây: chấn động làm choáng mọi quái trong tầm 1,2 giây',
        'Thanh giằng là phần duy nhất còn lại của cây cầu đã chở cả đoàn pháo qua đèo khi trời đất rung chuyển. Mảnh thứ hai mươi tư rơi trúng đúng lúc đó và giữ cầu đứng vững. Khi bệ pháo được neo bằng thanh giằng, mỗi phát bắn có thể làm cả mặt đất rung lên.']
    ]
  };
  const POWER_TEXT = {};
  for (const [t, list] of Object.entries(RELICS)) list.forEach(([name, bonus, power, ptext, lore], s) => {
    const g = CONFIG.items.gear[t][s]; if (!g) return;
    Object.assign(g, { relicName: name, relicBonus: bonus, relicPower: power, relicPowerText: ptext, lore: { ...(g.lore || {}), 5: lore } });
  });

  /* ---------- chỉ số ---------- */
  const STAT_TEXT = { damage: 'sát thương', range: 'tầm', rate: 'tốc đánh', aoe: 'vùng nổ', hp: 'máu lính', armor: 'giáp lính', block: 'giảm sát thương', respawn: 'hồi sinh nhanh', crit: 'chí mạng', poison: 'độc', slow: 'làm chậm', pen: 'xuyên kháng phép', burn: 'thiêu đốt', stun: 'choáng', root: 'trói chân' };
  const statText = Items.statText.bind(Items);
  Items.statText = function (it) {
    if (it.r !== 5) return statText(it);
    const d = this.def(it), b = d.relicBonus || {};
    return statText(it) + ' · ' + Object.entries(b).map(([k, v]) => '+' + this.pct(v) + ' ' + STAT_TEXT[k]).join(' · ') + (d.relicPowerText ? ' · THẦN LỰC: ' + d.relicPowerText : '');
  };
  const mods = Items.mods.bind(Items);
  Items.mods = function (t) {
    const m = mods(t); if (m.pow) return m;
    m.pow = {};
    for (const it of m.list) if (it && it.r === 5) { const d = this.def(it); for (const [k, v] of Object.entries(d.relicBonus || {})) m[k] = (m[k] || 0) + v; for (const [k, v] of Object.entries(d.relicPower || {})) m.pow[k] = (m.pow[k] || 0) + v; }
    return m;
  };
  const onField = t => Towers.list.some(T => T.type === t);
  function globals() { const g = { gRate: 0, gRange: 0, gDmg: 0 }; for (const t of Items.TYPES) { if (!CONFIG.towers[t] || !onField(t)) continue; const p = Items.mods(t).pow; for (const k in g) g[k] += p[k] || 0; } return g; }
  const pow = t => (t && CONFIG.towers[t] ? Items.mods(t).pow : {});

  /* ---------- gắn vào trụ ---------- */
  let ctx = null, firing = null;
  function patchTower(T) {
    const P = Object.getPrototypeOf(T); if (P.__relic73) return; P.__relic73 = true;
    const desc = Object.getOwnPropertyDescriptor(P, 'stats');
    Object.defineProperty(P, 'stats', { configurable: true, get() { const st = desc.get.call(this), G = globals(); if (st.damage) st.damage = [st.damage[0] * (1 + G.gDmg), st.damage[1] * (1 + G.gDmg)]; st.range *= 1 + G.gRange; st.rate /= 1 + G.gRate; st.pow = pow(this.type); return st; } });
    const release = P.release;
    P.release = function () {
      firing = this.type; try { release.apply(this, arguments); } finally { firing = null; }
      const p = pow(this.type), t = this.pending;
      if (p.multi && this.type === 'archer') { const st = this.stats, m = this.muzzle(); Enemies.list.filter(e => e.alive && e !== t && this.inRange(e)).sort((a, b) => b.dist - a.dist).slice(0, p.multi).forEach(e => { firing = 'archer'; try { Combat.fire('arrow', m.x, m.y, e, { damage: st.damage, type: 'physical', poison: st.poison, root: st.root }); } finally { firing = null; } }); }
      if (p.twin && this.type === 'artillery') { const st = this.stats, m = this.muzzle(), e = Enemies.list.find(e => e.alive && !e.flying && e !== t && this.inRange(e)); if (e) { firing = 'artillery'; try { Combat.fire('bomb', m.x, m.y, e, { damage: st.damage, aoe: st.aoe, burn: st.burn, stun: st.stun }); } finally { firing = null; } } }
    };
    const update = P.update;
    P.update = function (dt) {
      update.call(this, dt); const p = pow(this.type); if (!p.aura && !p.freeze) return;
      const R = this.def.kind === 'barracks' ? 140 : this.stats.range;
      const inR = e => e.alive && Math.hypot(e.x - this.x, (e.y - this.y) * 1.15) <= R + e.radius;
      if (p.aura) for (const e of Enemies.list) if (inR(e)) { e.slowT = Math.max(e.slowT || 0, .25); e.slowMul = Math.min(e.slowMul || 1, 1 - p.aura * (e.boss ? .5 : 1)); }
      if (p.freeze) { this._fz = (this._fz ?? 6) - dt; if (this._fz <= 0) { let n = 0; for (const e of Enemies.list) if (inR(e)) { e.stunT = Math.max(e.stunT || 0, p.freeze * (e.boss ? .4 : 1)); n++; } this._fz = n ? 16 : 1; if (n) { Effects.ring(this.x, this.y, 10, R, .7, '#7ff0e6', 5); Effects.text(this.x, this.y - 80, 'THẦN LỰC!', '#59eadc', 16); } } }
    };
  }
  const build = Towers.build;
  Towers.build = function () { const T = build.apply(this, arguments); const L = this.list[this.list.length - 1]; if (L) patchTower(L); return T; };

  /* ---------- đạn mang theo nguồn trụ ---------- */
  const fire = Combat.fire;
  Combat.fire = function (kind, x, y, target, o) {
    if (firing && o) { o.src = firing; const p = pow(firing);
      if (firing === 'archer' && o.pierce && p.critX) o.damage = [o.damage[0] / 2 * p.critX, o.damage[1] / 2 * p.critX];
      if (firing === 'mage' && p.chain) o.chain = true;
      if (firing === 'artillery' && p.cluster) o.cluster = true; }
    return fire.apply(this, arguments);
  };
  const impact = Combat.impact;
  Combat.impact = function (p) { const prev = ctx; ctx = p.o && p.o.src || null; try { return impact.apply(this, arguments); } finally { ctx = prev; } };
  const hit = Combat.hitEnemy;
  Combat.hitEnemy = function (e) {
    const amt = hit.apply(this, arguments), p = pow(ctx);
    if (p.execute && e.alive && !e.boss && e.hp > 0 && e.hp < e.maxHp * p.execute) { Effects.text(e.x, e.y - (e.height || 30) - 10, 'KẾT LIỄU', '#59eadc', 15); Game.killEnemy(e); }
    return amt;
  };
  const kill = Game.killEnemy;
  Game.killEnemy = function (e) {
    const was = e.alive; kill.apply(this, arguments); const p = pow(ctx);
    if (was && !e.alive && p.gold) { const n = Math.max(1, Math.round(e.reward * p.gold)); this.gold += n; Effects.text(e.x + 14, e.y - (e.height || 30) - 18, '+' + n, '#59eadc', 13); }
  };
  // lính: nguồn sát thương = trụ của lính; hồi máu thần lực; tăng sát thương toàn quân
  const U = window.Unit && Unit.prototype;
  if (U) { const up = U.update; U.update = function () { const prev = ctx; ctx = this.tower ? this.tower.type : null; try { return up.apply(this, arguments); } finally { ctx = prev; } }; }
  const refresh = Units.refresh;
  Units.refresh = function (T) {
    const r = refresh.apply(this, arguments), p = pow(T.type), G = globals();
    for (const u of this.list) if (u.tower === T) { if (p.regen) u.regen *= p.regen; if (G.gDmg && u.damage) u.damage = [u.damage[0] * (1 + G.gDmg), u.damage[1] * (1 + G.gDmg)]; if (G.gRate) u.rate /= 1 + G.gRate; }
    return r;
  };
  window.Relic73 = { RELICS, globals, pow };
})();
