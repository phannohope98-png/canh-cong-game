/* THẦN TÍCH & HUYỀN THOẠI (rev 75)
 * Thần Tích = 24 mảnh Thiên Chung Bình Minh. Chỉ số chính ×3 + 2 thuộc tính phụ + 1 THẦN LỰC có tên riêng
 * (thay đổi cách trận đấu diễn ra: hồi máu, vùng chậm, kết liễu, vàng, ngưng thời gian, buff toàn sân,
 * thêm tên/pháo, nảy phép, bom chùm). Huyền Thoại = chỉ số ×1,8 + 1 ĐẶC TÍNH dạng "khắc chế" (thêm sát thương
 * với một kiểu quái, xé giáp, lính kiên cường) – không trùng loại với Thần Lực.
 * Ghép 4 món giống nhau → 1 món bậc trên. Thần Tích rơi 0,1%. Trụ gắn Thần Tích phát hào quang. */
(function () {
  const RELIC = 5, LEG = 4, K5 = 3;
  CONFIG.items.rarities[RELIC].k = K5;
  CONFIG.items.mythicChance = .001;
  const FUSE_N = 4;

  /* ================= THẦN TÍCH ================= */
  // [tên, thuộc tính phụ, thần lực, tên thần lực, mô tả thần lực, truyền thuyết]
  const RELICS = {
    barracks: [
      ['Cờ Hiệu Bình Minh Vĩnh Cửu', { hp: .08, rate: .05 }, { regen: 2 }, 'Bất Tử Ca', 'Lính hồi máu nhanh gấp đôi.',
        'Mảnh thứ nhất của Thiên Chung rơi xuống ngọn cờ của đội giữ cổng cuối cùng còn đứng vững. Lá cờ không bao giờ rách: chừng nào nó còn bay, những người lính dưới bóng cờ còn đứng dậy được.'],
      ['Thiên Môn Bất Khả Xâm', { armor: .03, hp: .06 }, { aura: .12 }, 'Bùn Thời Gian', 'Quái quanh doanh trại chậm 12% (boss 6%).',
        'Mảnh thứ hai cắm vào cánh cổng gỗ của một ngôi làng không tên – thứ duy nhất không đổ trong đêm Hư Vô. Ánh sao trong thớ gỗ làm thời gian quanh nó đặc lại như bùn.'],
      ['Ấn Khai Thế', { rate: .06, hp: .05 }, { execute: .08 }, 'Phán Quyết', 'Lính kết liễu quái thường còn dưới 8% máu.',
        'Ấn này đóng lên hiệp ước đầu tiên của năm chủng tộc. Khi mảnh thứ ba rơi trúng, nét khắc mang luôn quyền phán quyết của tiếng chuông.'],
      ['Vòm Trời Che Chở', { block: .04, armor: .03 }, { gold: .12 }, 'Lộc Muôn Dân', 'Quái do lính hạ rơi thêm 12% vàng.',
        'Mảnh thứ tư hóa thành mái vòm che cho đoàn dân chạy nạn suốt bốn mươi ngày mưa lửa. Dân làng dâng những đồng vàng cuối cùng để giữ lại nó, và nó luôn trả ơn người bảo vệ họ.'],
      ['Tường Thành Sáng Thế', { hp: .08, block: .03 }, { freeze: 1 }, 'Khoảnh Khắc Đầu Tiên', 'Mỗi 22 giây: ngưng thời gian mọi quái quanh doanh trại 1 giây (boss 0,3 giây).',
        'Viên gạch đầu tiên của thế giới loài người, đặt khi tiếng chuông đầu tiên còn vang. Mảnh thứ năm đánh thức ký ức của nó, và đôi khi nó kéo thời gian ngừng lại.'],
      ['Chuông Bình Minh Nguyên Thủy', { damage: .06, respawn: .05 }, { gRate: .05 }, 'Nhịp Tim Thế Giới', 'Mọi trụ trên sân đánh nhanh hơn 5%.',
        'Quả lắc của chính Thiên Chung – mảnh lớn nhất và là mảnh cuối còn rung. Truyền thuyết nói khi đủ 24 mảnh, chuông sẽ vang lần nữa để sinh ra thế giới thứ bảy.']
    ],
    archer: [
      ['Chong Gió Thiên Hà', { rate: .05, crit: .03 }, { gRange: .04 }, 'Gió Giữa Các Vì Sao', 'Mọi trụ trên sân tăng 4% tầm.',
        'Mảnh thứ bảy cuốn theo gió sinh ra giữa các vì sao, rơi vào chong chóng của một trinh sát Elf. Ai đứng dưới nó đều nhìn xa hơn mắt thường cho phép.'],
      ['Cung Dải Ngân Hà', { crit: .03, rate: .04 }, { multi: 1 }, 'Song Tinh', 'Mỗi phát bắn thêm 1 mũi tên vào mục tiêu khác.',
        'Dây cung se từ ánh sáng dải Ngân Hà, nơi mảnh thứ tám rơi xuyên qua. Người Elf gọi nó là cây cung không bao giờ bắn một mình.'],
      ['Giá Tên Vạn Tinh', { damage: .06, range: .03 }, { execute: .06 }, 'Sao Băng Phán Xử', 'Tên kết liễu quái thường còn dưới 6% máu.',
        'Mảnh thứ chín vỡ thành vô số tia sáng nằm lại trong giá tên của hội canh Suối Hoa. Mỗi mũi tên rút ra mang theo một ngôi sao băng.'],
      ['Đài Thiên Nhãn', { damage: .05, range: .03 }, { critX: 2.8 }, 'Mắt Thấu Tim', 'Chí mạng gây 280% sát thương (thường là 200%).',
        'Mảnh thứ mười mở ra con mắt nhìn thấu điểm yếu của vạn vật. Cung thủ trên đài nhìn thấy cả nhịp đập trong tim kẻ thù.'],
      ['Bồn Nhựa Cây Thế Giới', { rate: .04, root: .015 }, { aura: .1 }, 'Nhựa Sao Lan Tỏa', 'Quái trong tầm chậm 10% (boss 5%).',
        'Mảnh thứ mười một rơi vào rễ Cây Thế Giới; nhựa chảy ra từ vết thương mang ánh sao, làm chân quái nặng như đá.'],
      ['Rễ Cây Thế Giới', { poison: .05, damage: .04 }, { freeze: 1 }, 'Rễ Thiêng Trỗi Dậy', 'Mỗi 22 giây: rễ trói mọi quái trong tầm 1 giây (boss 0,3 giây).',
        'Đoạn rễ sâu nhất, nơi mảnh thứ mười hai găm vào, nghe được bước chân của mọi sinh vật. Khi kẻ thù đông nhất, rễ trồi lên giữ chặt tất cả.']
    ],
    mage: [
      ['Lõi Tinh Vân', { aoe: .05, pen: .03 }, { chain: 1 }, 'Tinh Vân Hút', 'Phép nảy sang 2 quái gần đó (60% sát thương).',
        'Mảnh thứ mười ba mang trong mình cả một tinh vân đang hình thành, bị giam vào lõi pha lê của hội Nguyệt Thạch.'],
      ['Vòng Niệm Vô Cực', { damage: .06, range: .03 }, { gDmg: .05 }, 'Chân Ngôn Đầu Tiên', 'Mọi trụ và lính trên sân tăng 5% sát thương.',
        'Mảnh thứ mười bốn uốn thành vòng tròn không đầu không cuối. Người đeo nghe được câu thần chú đầu tiên của vũ trụ và lời niệm lan khắp chiến trường.'],
      ['Ăng-ten Thiên Âm', { damage: .05, slow: .03 }, { aura: .12 }, 'Dư Âm Thiên Chung', 'Quái trong tầm chậm 12% (boss 6%).',
        'Ăng-ten bắt được dư âm của tiếng chuông vẫn còn vang giữa các vì sao. Quái vật đi vào vùng âm vang đều loạng choạng như đang mơ.'],
      ['Ống Băng Thời Không', { rate: .04, aoe: .04 }, { freeze: 1 }, 'Thời Không Tĩnh', 'Mỗi 22 giây: đóng băng mọi quái trong tầm 1 giây (boss 0,3 giây).',
        'Mảnh thứ mười sáu rơi vào sông băng vĩnh cửu và làm đông cả dòng thời gian quanh nó.'],
      ['Thấu Kính Mặt Trăng Vỡ', { damage: .07, range: .02 }, { execute: .07 }, 'Ánh Trăng Xóa Bỏ', 'Phép kết liễu quái thường còn dưới 7% máu.',
        'Khi trăng bị giáo Hư Vô làm vỡ, mảnh thứ mười bảy rơi xuống cùng một mảnh ánh trăng. Kẻ yếu ớt bị ánh trăng xóa khỏi thế gian.'],
      ['Bản Khắc Tên Thật', { rate: .05, pen: .03 }, { gold: .15 }, 'Gọi Tên Thật', 'Quái do trụ Phù Thủy hạ rơi thêm 15% vàng.',
        'Mảnh thứ mười tám khắc tên thật của mọi vật. Biết tên thật của một kẻ là nắm được mọi thứ nó mang theo.']
    ],
    artillery: [
      ['Ống Ngắm Đỉnh Cuối', { damage: .05, stun: .015 }, { twin: 1 }, 'Hai Lần Sấm', 'Mỗi lượt bắn thêm 1 quả pháo (60% sát thương) vào mục tiêu khác.',
        'Mảnh thứ mười chín rơi xuống đỉnh núi cao nhất, nơi thợ pháo Barun dựng trạm ngắm. Qua ống ngắm, ông thấy hai mục tiêu cùng lúc.'],
      ['Nòng Tim Núi', { aoe: .05, burn: .05 }, { cluster: 1 }, 'Nhịp Tim Núi Lửa', 'Đạn vỡ thêm 3 quả bom chùm nhỏ.',
        'Nòng rèn từ lõi quặng đập như tim, nơi mảnh thứ hai mươi ngủ hàng nghìn năm. Khi chạm đất, mỗi quả đạn vỡ thành ba tiếng nổ.'],
      ['Buồng Lửa Câm', { damage: .06, burn: .04 }, { gold: .12 }, 'Lửa Luyện Vàng', 'Quái do trụ Người Lùn hạ rơi thêm 12% vàng.',
        'Mảnh thứ hai mươi mốt cháy âm ỉ trong buồng nạp bằng đồng, nung chảy giáp quái thành những thỏi kim loại quý.'],
      ['Bánh Răng Lời Hứa', { damage: .05, range: .03 }, { gRate: .04 }, 'Nhịp Quay Vũ Trụ', 'Mọi trụ trên sân đánh nhanh hơn 4%.',
        'Hai anh em thợ máy rèn bánh răng từ chiếc búa chung của cha, đúng đêm mảnh thứ hai mươi hai rơi xuống lò. Nó ăn khớp với nhịp quay của vũ trụ.'],
      ['Lò Tro Ngược Gió', { aoe: .04, rate: .03 }, { aura: .1 }, 'Tro Bỏng', 'Quái trong tầm chậm 10% (boss 5%).',
        'Tro từ lò này luôn bay ngược về lò vì mảnh thứ hai mươi ba nằm trong ngọn lửa. Quái đi qua lớp tro nóng đều bỏng chân.'],
      ['Giằng Cầu Không Gãy', { damage: .05, aoe: .03 }, { freeze: 1 }, 'Địa Chấn', 'Mỗi 22 giây: làm choáng mọi quái trong tầm 1 giây (boss 0,3 giây).',
        'Thanh giằng duy nhất còn lại của cây cầu chở đoàn pháo qua đèo khi trời đất rung chuyển. Mỗi phát bắn từ bệ neo bằng nó làm mặt đất rung lên.']
    ]
  };
  for (const [t, list] of Object.entries(RELICS)) list.forEach(([name, bonus, power, pname, ptext, lore], s) => {
    const g = CONFIG.items.gear[t] && CONFIG.items.gear[t][s]; if (!g) return;
    Object.assign(g, { relicName: name, relicBonus: bonus, relicPower: power, relicPowerName: pname, relicPowerText: ptext, lore: { ...(g.lore || {}), 5: lore } });
  });

  /* ================= HUYỀN THOẠI: đặc tính khắc chế ================= */
  const TRAITS = {
    fresh: ['Đòn Mở Màn', v => `+${v * 100}% sát thương lên quái còn trên 90% máu.`],
    big: ['Săn Khổng Lồ', v => `+${v * 100}% sát thương lên boss và quái lớn (≥ 500 máu).`],
    air: ['Đối Không', v => `+${v * 100}% sát thương lên quái bay.`],
    armor: ['Phá Giáp Dày', v => `+${v * 100}% sát thương lên quái có giáp hoặc kháng phép cao.`],
    shred: ['Xé Giáp', v => `Đòn đánh giảm ${v * 100}% giáp và kháng phép của quái trong 3 giây.`],
    guard: ['Kiên Cường', v => `Lính +${v * 100}% giáp khi máu dưới 50%.`]
  };
  const LEGEND = {
    barracks: [['fresh', .12], ['guard', .15], ['big', .12], ['guard', .15], ['shred', .1], ['armor', .12]],
    archer: [['air', .15], ['big', .12], ['fresh', .12], ['armor', .12], ['shred', .1], ['air', .15]],
    mage: [['big', .12], ['fresh', .12], ['shred', .1], ['air', .15], ['big', .12], ['armor', .12]],
    artillery: [['fresh', .12], ['big', .12], ['armor', .12], ['shred', .1], ['fresh', .12], ['big', .12]]
  };
  for (const [t, list] of Object.entries(LEGEND)) list.forEach(([k, v], s) => { const g = CONFIG.items.gear[t] && CONFIG.items.gear[t][s]; if (g) Object.assign(g, { legendTrait: k, legendValue: v }); });

  /* ================= chỉ số ================= */
  const STAT = { damage: 'Sát thương', range: 'Tầm', rate: 'Tốc đánh', aoe: 'Vùng nổ', hp: 'Máu lính', armor: 'Giáp lính', block: 'Giảm sát thương', respawn: 'Hồi sinh', crit: 'Chí mạng', poison: 'Độc', slow: 'Làm chậm', pen: 'Xuyên kháng phép', burn: 'Thiêu đốt', stun: 'Choáng', root: 'Trói chân' };
  const statText = Items.statText.bind(Items);
  Items.statText = function (it) { return statText(it); };            // dòng ngắn gọn: chỉ số chính
  Items.extraHtml = function (it) {
    const d = this.def(it); let h = '';
    if (it.r === RELIC) {
      h += '<div class="rx-chips">' + Object.entries(d.relicBonus || {}).map(([k, v]) => `<span>+${this.pct(v)} ${STAT[k]}</span>`).join('') + '</div>';
      h += `<div class="rx-power"><b>✦ Thần Lực · ${d.relicPowerName}</b><span>${d.relicPowerText}</span></div>`;
    } else if (it.r === LEG && d.legendTrait) {
      const T = TRAITS[d.legendTrait]; h += `<div class="rx-trait"><b>◆ Đặc tính · ${T[0]}</b><span>${T[1](d.legendValue)}</span></div>`;
    }
    return h;
  };
  const lore = Items.lore.bind(Items); Items.lore = function (it) { return lore(it).replace('0,2%', '0,1%'); };
  Items.tag = function (it) { const d = this.def(it); return it.r === RELIC ? '✦ ' + d.relicPowerName : it.r === LEG && d.legendTrait ? '◆ ' + TRAITS[d.legendTrait][0] : ''; };
  const mods = Items.mods.bind(Items);
  Items.mods = function (t) {
    const m = mods(t); if (m.pow) return m;
    m.pow = {}; m.trait = {};
    for (const it of m.list) if (it) { const d = this.def(it);
      if (it.r === RELIC) { for (const [k, v] of Object.entries(d.relicBonus || {})) m[k] = (m[k] || 0) + v; for (const [k, v] of Object.entries(d.relicPower || {})) m.pow[k] = (m.pow[k] || 0) + v; }
      if (it.r === LEG && d.legendTrait) m.trait[d.legendTrait] = (m.trait[d.legendTrait] || 0) + d.legendValue; }
    return m;
  };
  const onField = t => Towers.list.some(T => T.type === t);
  function globals() { const g = { gRate: 0, gRange: 0, gDmg: 0 }; for (const t of Items.TYPES) { if (!CONFIG.towers[t] || !onField(t)) continue; const p = Items.mods(t).pow; for (const k in g) g[k] += p[k] || 0; } return g; }
  const pow = t => (t && CONFIG.towers[t] ? Items.mods(t).pow : {});
  const trait = t => (t && CONFIG.towers[t] ? Items.mods(t).trait : {});
  const hasRelic = t => !!(CONFIG.towers[t] && Items.mods(t).list.some(it => it && it.r === RELIC));

  /* ================= ghép 4 → 1, không mất đồ Thần Tích ================= */
  Items.canFuse = function (it) { return !!it && it.r < LEG && this.fuseList(it).length >= FUSE_N; };
  Items.fuse = function (u) {
    const it = this.find(u); if (!this.canFuse(it)) return null;
    const same = this.fuseList(it).sort((a, b) => (this.isEquipped(a) ? 1 : 0) - (this.isEquipped(b) ? 1 : 0) || (a === it ? -1 : 0)).slice(0, FUSE_N);
    const wasEq = same.some(i => this.isEquipped(i));
    same.forEach(i => { if (this.isEquipped(i)) Save.data.loadout[i.t][i.s] = 0; Save.data.items.splice(Save.data.items.indexOf(i), 1); });
    const n = { u: ++Save.data.itemN, t: it.t, s: it.s, r: it.r + 1 }; Save.data.items.push(n);
    if (wasEq || !Save.data.loadout[n.t][n.s]) Save.data.loadout[n.t][n.s] = n.u;
    this.dirty(); Save.save(); return n;
  };

  /* ================= giao diện kho đồ ================= */
  let awaken = null;
  const equip = Items.equip;
  Items.equip = function (u) { const it = this.find(u), ok = equip.apply(this, arguments); if (ok && it && it.r === RELIC) { awaken = it.t; if (window.AudioSys) AudioSys.play('holy'); } return ok; };
  const render = UI.renderItems;
  UI.renderItems = function () {
    const out = render.apply(this, arguments), t = this.itemTower, stage = document.querySelector('#items-tower .it-stage');
    if (stage) { stage.classList.toggle('relic-on', hasRelic(t)); if (awaken === t) { stage.classList.remove('relic-awake'); void stage.offsetWidth; stage.classList.add('relic-awake'); this.toast('Thần Tích đã thức tỉnh!'); } }
    awaken = null;
    const bonus = document.querySelector('#items-tower .it-bonus');
    if (bonus) { const M = Items.mods(t); bonus.innerHTML = M.list.filter(Boolean).map(it => `<li style="--rc:${Items.rar(it).col}"><b>${Items.name(it)}</b> · ${Items.statText(it)}${Items.tag(it) ? ` <i class="rx-tag r${it.r}">${Items.tag(it)}</i>` : ''}</li>`).join('') || '<li>Chưa gắn đồ nào</li>'; }
    const sel = this.itemSel ? Items.find(this.itemSel) : null, st = document.querySelector('#items-bag .it-detail .it-stat');
    if (sel && st) { st.insertAdjacentHTML('afterend', Items.extraHtml(sel)); const lore = st.parentElement.querySelector('p.sub'); if (lore && sel.r >= LEG) lore.classList.add('rx-lore'); const det = st.closest('.it-detail'); det.classList.toggle('r5', sel.r === RELIC); }
    const fb = document.querySelector('#items-bag [data-action="it-fuse"]');
    if (fb && sel) { const n = Items.fuseList(sel).length; fb.classList.toggle('off', n < FUSE_N); fb.innerHTML = `<span>Ghép ${FUSE_N}→1 (${Math.min(n, FUSE_N)}/${FUSE_N})</span>`; }
    document.querySelectorAll('#items-bag .it-card').forEach(c => { const it = Items.find(+c.dataset.u); if (!it) return; c.classList.toggle('r5', it.r === RELIC); const tg = Items.tag(it); if (tg && !c.querySelector('.rx-tag')) c.querySelector('.st').insertAdjacentHTML('beforeend', ` <i class="rx-tag r${it.r}">${tg}</i>`); });
    document.querySelectorAll('#items-tower .islot.r5').forEach(b => b.classList.add('glow5'));
    return out;
  };
  const toast = UI.toast; UI.toast = function (m) { return toast.call(this, typeof m === 'string' ? m.replace('Cần 3 món', 'Cần 4 món') : m); };
  const overlay = UI.overlay; UI.overlay = function (h) { return overlay.call(this, typeof h === 'string' ? h.replace(/ghép 3 món/gi, 'ghép 4 món') : h, ...[].slice.call(arguments, 1)); };
  const css = document.createElement('style');
  css.textContent = `
  .rx-chips{display:flex;flex-wrap:wrap;gap:5px;margin:4px 0 6px}.rx-chips span{background:#fff8e6;border:2px solid var(--ink);border-radius:999px;padding:1px 8px;font-size:12px;font-weight:800;color:#3a2a1a}
  .rx-power,.rx-trait{display:flex;flex-direction:column;gap:2px;border:2px solid var(--ink);border-radius:12px;padding:6px 10px;margin:4px 0 6px;font-size:12.5px;line-height:1.3}
  .rx-power{background:linear-gradient(135deg,#123c45,#1d5f68);color:#e9fffb;box-shadow:0 0 12px #59eadc88}.rx-power b{color:#7ff7ea;font-size:13.5px;letter-spacing:.3px}
  .rx-trait{background:linear-gradient(135deg,#5a3510,#8a5a1c);color:#fff3d6}.rx-trait b{color:#ffd76a;font-size:13.5px}
  .rx-lore{font-style:italic;opacity:.92;border-left:3px solid var(--rc);padding-left:8px}
  .rx-tag{font-style:normal;font-weight:900;font-size:10.5px;padding:0 6px;border-radius:999px;white-space:nowrap}.rx-tag.r5{background:#1d5f68;color:#7ff7ea}.rx-tag.r4{background:#8a5a1c;color:#ffe08a}
  .it-detail.r5{box-shadow:0 0 18px #59eadc99}
  .it-card.r5{box-shadow:0 0 0 2px #59eadc,0 0 14px #59eadcaa;animation:rxPulse 2.4s ease-in-out infinite}
  .islot.glow5{animation:rxPulse 2.4s ease-in-out infinite}
  @keyframes rxPulse{0%,100%{filter:drop-shadow(0 0 3px #59eadc)}50%{filter:drop-shadow(0 0 12px #9ffff4)}}
  .it-stage.relic-on canvas{animation:rxStage 3s ease-in-out infinite}
  @keyframes rxStage{0%,100%{filter:drop-shadow(0 0 6px #59eadc) drop-shadow(0 0 2px #fff)}50%{filter:drop-shadow(0 0 18px #59eadc) drop-shadow(0 0 4px #e8fffb)}}
  .it-stage.relic-awake::after{content:'';position:absolute;inset:-6%;border-radius:50%;pointer-events:none;background:radial-gradient(circle,#ffffffcc 0,#7ff7ea88 25%,#59eadc22 55%,transparent 70%);animation:rxAwake 1.2s ease-out forwards}
  @keyframes rxAwake{0%{opacity:0;transform:scale(.3)}25%{opacity:1}100%{opacity:0;transform:scale(1.25)}}`;
  document.head.appendChild(css);

  /* ================= trận đấu ================= */
  let ctx = null, firing = null;
  const TAU = Math.PI * 2;
  function patchTower(T) {
    const P = Object.getPrototypeOf(T); if (P.__relic73) return; P.__relic73 = true;
    const desc = Object.getOwnPropertyDescriptor(P, 'stats');
    Object.defineProperty(P, 'stats', { configurable: true, get() { const st = desc.get.call(this), G = globals(); if (st.damage) st.damage = [st.damage[0] * (1 + G.gDmg), st.damage[1] * (1 + G.gDmg)]; st.range *= 1 + G.gRange; st.rate /= 1 + G.gRate; st.pow = pow(this.type); return st; } });
    const release = P.release;
    P.release = function () {
      firing = this.type; try { release.apply(this, arguments); } finally { firing = null; }
      const p = pow(this.type), t = this.pending;
      if (p.multi && this.type === 'archer') { const st = this.stats, m = this.muzzle(); Enemies.list.filter(e => e.alive && e !== t && this.inRange(e)).sort((a, b) => b.dist - a.dist).slice(0, p.multi).forEach(e => { firing = 'archer'; try { Combat.fire('arrow', m.x, m.y, e, { damage: st.damage, type: 'physical', poison: st.poison, root: st.root }); } finally { firing = null; } }); }
      if (p.twin && this.type === 'artillery') { const st = this.stats, m = this.muzzle(), e = Enemies.list.find(e => e.alive && !e.flying && e !== t && this.inRange(e)); if (e) { firing = 'artillery'; try { Combat.fire('bomb', m.x, m.y, e, { damage: [st.damage[0] * .6, st.damage[1] * .6], aoe: st.aoe, burn: st.burn, stun: st.stun, twin: true }); } finally { firing = null; } } }
    };
    const update = P.update;
    P.update = function (dt) {
      update.call(this, dt); const p = pow(this.type); if (!p.aura && !p.freeze) return;
      const R = this.def.kind === 'barracks' ? 130 : this.stats.range;
      const inR = e => e.alive && Math.hypot(e.x - this.x, (e.y - this.y) * 1.15) <= R + e.radius;
      if (p.aura) for (const e of Enemies.list) if (inR(e)) { e.slowT = Math.max(e.slowT || 0, .25); e.slowMul = Math.min(e.slowMul || 1, 1 - p.aura * (e.boss ? .5 : 1)); }
      if (p.freeze) { this._fz = (this._fz ?? 8) - dt; if (this._fz <= 0) { let n = 0; for (const e of Enemies.list) if (inR(e)) { e.stunT = Math.max(e.stunT || 0, e.boss ? .3 : p.freeze); n++; } this._fz = n ? 22 : 1; if (n) { Effects.ring(this.x, this.y, 10, R, .7, '#7ff0e6', 5); Effects.text(this.x, this.y - 84, Items.mods(this.type).list.find(it => it && it.r === RELIC && Items.def(it).relicPower.freeze) ? Items.def(Items.mods(this.type).list.find(it => it && it.r === RELIC && Items.def(it).relicPower.freeze)).relicPowerName : 'Thần Lực', '#59eadc', 14); } } }
    };
    // hào quang Thần Tích
    const draw = P.draw;
    P.draw = function (g) {
      if (hasRelic(this.type) && this.landed !== false) {
        const t = (window.Game && Game.time) || 0, pul = .5 + .5 * Math.sin(t * 2.4 + this.x * .05);
        g.save(); g.globalCompositeOperation = 'lighter';
        let gr = g.createRadialGradient(this.x, this.y + 4, 4, this.x, this.y + 4, 34); gr.addColorStop(0, `rgba(127,247,234,${.45 + .2 * pul})`); gr.addColorStop(.6, 'rgba(89,234,220,.16)'); gr.addColorStop(1, 'rgba(89,234,220,0)');
        g.fillStyle = gr; g.beginPath(); g.ellipse(this.x, this.y + 4, 34, 13, 0, 0, TAU); g.fill();
        g.strokeStyle = `rgba(160,255,245,${.35 + .35 * pul})`; g.lineWidth = 2; g.beginPath(); g.ellipse(this.x, this.y + 4, 24 + pul * 4, 9 + pul * 1.5, 0, 0, TAU); g.stroke();
        gr = g.createLinearGradient(0, this.y - 120, 0, this.y); gr.addColorStop(0, 'rgba(127,247,234,0)'); gr.addColorStop(1, `rgba(127,247,234,${.12 + .08 * pul})`); g.fillStyle = gr; g.fillRect(this.x - 24, this.y - 120, 48, 120);
        g.restore();
      }
      const r = draw.apply(this, arguments);
      if (hasRelic(this.type) && this.landed !== false) {
        const t = (window.Game && Game.time) || 0; g.save(); g.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 6; i++) { const ph = (t * .45 + i / 6 + this.x * .013) % 1, a = i * 1.7 + this.y, x = this.x + Math.sin(a + t) * 22, y = this.y - 8 - ph * 96, al = Math.sin(ph * Math.PI) * .9; g.fillStyle = `rgba(200,255,250,${al})`; g.beginPath(); g.moveTo(x, y - 3.6); g.lineTo(x + 1.3, y); g.lineTo(x, y + 3.6); g.lineTo(x - 1.3, y); g.closePath(); g.fill(); g.fillStyle = `rgba(89,234,220,${al * .5})`; g.beginPath(); g.arc(x, y, 4, 0, TAU); g.fill(); }
        g.restore();
      }
      return r;
    };
    const land = P.land;
    if (land) P.land = function () { const r = land.apply(this, arguments); if (hasRelic(this.type)) { Effects.ring(this.x, this.y, 8, 90, .9, '#7ff7ea', 6); Effects.burst(this.x, this.y - 40, '#bffff8', 26, 220, .9, 5, -90); Effects.text(this.x, this.y - 96, 'Thần Tích thức tỉnh', '#59eadc', 15); } return r; };
  }
  const build = Towers.build;
  Towers.build = function () { const T = build.apply(this, arguments); const L = this.list[this.list.length - 1]; if (L) patchTower(L); return T; };

  const fire = Combat.fire;
  Combat.fire = function (kind, x, y, target, o) {
    if (firing && o) { o.src = firing; const p = pow(firing);
      if (firing === 'archer' && o.pierce && p.critX) o.damage = [o.damage[0] / 2 * p.critX, o.damage[1] / 2 * p.critX];
      if (firing === 'mage' && p.chain) o.chain = true;
      if (firing === 'artillery' && p.cluster && !o.twin) o.cluster = true; }
    return fire.apply(this, arguments);
  };
  const impact = Combat.impact;
  Combat.impact = function (p) { const prev = ctx; ctx = p.o && p.o.src || null; try { return impact.apply(this, arguments); } finally { ctx = prev; } };
  const hit = Combat.hitEnemy;
  Combat.hitEnemy = function (e, dmg, type, pen) {
    const tr = trait(ctx);
    if (ctx && e && e.alive) {
      let mul = 1;
      if (tr.fresh && e.hp >= e.maxHp * .9) mul += tr.fresh;
      if (tr.big && (e.boss || e.maxHp >= 500)) mul += tr.big;
      if (tr.air && e.flying) mul += tr.air;
      if (tr.armor && ((e.armor || 0) >= .3 || (e.mres || 0) >= .3)) mul += tr.armor;
      if (e.shredT > (Game.time || 0)) { const s = e.shredV || 0; if (type === 'magic') pen = (pen || 0) + s; else if (type !== 'true') mul *= 1 + Math.min(.5, (e.armor || 0) > 0 ? s : 0); }
      if (mul !== 1) dmg = Array.isArray(dmg) ? [dmg[0] * mul, dmg[1] * mul] : dmg * mul;
      if (tr.shred) { e.shredT = (Game.time || 0) + 3; e.shredV = Math.max(e.shredV || 0, tr.shred); }
    }
    const amt = hit.call(this, e, dmg, type, pen), p = pow(ctx);
    if (p.execute && e.alive && !e.boss && e.hp > 0 && e.hp < e.maxHp * p.execute) { Effects.text(e.x, e.y - (e.height || 30) - 10, 'KẾT LIỄU', '#59eadc', 14); Game.killEnemy(e); }
    return amt;
  };
  const kill = Game.killEnemy;
  Game.killEnemy = function (e) {
    const was = e.alive; kill.apply(this, arguments); const p = pow(ctx);
    if (was && !e.alive && p.gold) { const n = Math.max(1, Math.round(e.reward * p.gold)); this.gold += n; Effects.text(e.x + 14, e.y - (e.height || 30) - 18, '+' + n, '#59eadc', 12); }
  };
  const U = window.Unit && Unit.prototype;
  if (U) { const up = U.update; U.update = function () { const prev = ctx; ctx = this.tower ? this.tower.type : null; if (this.tower) { const g = trait(this.tower.type).guard; if (g && this.maxHp) { if (this._baseArmor === undefined) this._baseArmor = this.armor; this.armor = Math.min(.85, this._baseArmor + (this.hp < this.maxHp * .5 ? g : 0)); } } try { return up.apply(this, arguments); } finally { ctx = prev; } }; }
  const refresh = Units.refresh;
  Units.refresh = function (T) {
    const r = refresh.apply(this, arguments), p = pow(T.type), G = globals();
    for (const u of this.list) if (u.tower === T) { u._baseArmor = u.armor; if (p.regen) u.regen *= p.regen; if (G.gDmg && u.damage) u.damage = [u.damage[0] * (1 + G.gDmg), u.damage[1] * (1 + G.gDmg)]; if (G.gRate) u.rate /= 1 + G.gRate; }
    return r;
  };
  window.Relic73 = { RELICS, LEGEND, TRAITS, globals, pow, trait };
})();
