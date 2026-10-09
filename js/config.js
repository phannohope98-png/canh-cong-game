/* =========================================================
 * CANH CỔNG – BẢO VỆ THẾ GIỚI · Cấu hình game (màn hình NGANG)
 * Mọi thông số cân bằng nằm ở đây.
 * Giáp (armor) & kháng phép (mres) tính theo % giảm sát thương (0 – 0.8).
 * ========================================================= */
window.CONFIG = {
  world: { width: 1280, height: 640 },
  pathWidth: 88,
  unitScale: 1.0,             // nhân vật rõ hơn trên màn hình điện thoại

  match: {
    lives: 20,
    timeScale: 0.85,           // nhịp trận chậm hơn ở chế độ 1x
    enemySpeedScale: 0.68,     // đường ngắn hơn nhưng có thêm thời gian chặn quái
    firstWaveDelay: 0,          // 0 = chờ người chơi bấm nút bắt đầu
    nextWaveDelay: 14,
    earlyCallBonusPerSec: 2,    // vàng thưởng / giây khi gọi đợt sớm
    sellRefund: 0.6,
    stars: { three: 18, two: 10 } // số mạng còn lại để đạt sao
  },

  /* ---------------- 5 TRỤ = 5 NHÂN VẬT ----------------
     cost[i] = giá xây (i=0) / giá nâng lên cấp i+1. Cấp 4 có kỹ năng đặc biệt. */
  towers: {
    orc: {
      name:'Orc',short:'Kỵ binh Orc',role:'TRỤ THÚ · TRIỆU HỒI ORC CƯỠI SÓI',icon:'axe',color:'#a24738',kind:'barracks',
      art:'orct',palette:['#56784a','#784c36','#a34f43','#d7cab0','#50545b'],soldiers:1,respawn:13,engage:110,rallyRange:190,
      cost:[100,130,180,250],tierNames:['Trại Sói','Đồn Chiến Thú','Thành Lũy Orc','Pháo Đài Huyết Nha'],
      levels:[{hp:160,damage:[8,12],armor:.10,rate:1.10,art:'wolfRider'},{hp:250,damage:[14,20],armor:.22,rate:1.02,art:'wolfRider'},{hp:380,damage:[23,31],armor:.35,rate:.95,art:'wolfRider'},{hp:560,damage:[34,46],armor:.48,rate:.9,art:'wolfRider',special:'slam'}],
      gear:['Rìu chiến','Giáp sắt','Áo lông thú','Chiến sói'],desc:'Triệu hồi một chiến binh Orc cưỡi sói ra giữ đường. Giáp sắt, rìu chiến và thú cưỡi có mô hình 3D; nâng cấp mở thêm tháp canh và cờ huyết nha.'
    },
    barracks: {
      name: 'Người', short: 'Kiếm sĩ', role: 'TRỤ NGƯỜI - TRIỆU HỒI 2 KIẾM SĨ', icon: 'shield', color: '#8a1e24', kind: 'barracks',
      art: 'soldier', palette: ['#6a1218', '#8a1e24', '#c8ccd6', '#1a1418', '#f2c14e'],
      soldiers: 2, respawn: 10, engage: 90, rallyRange: 170,
      cost: [70, 110, 160, 230],
      tierNames: ['Trại Kiếm Sĩ', 'Đồn Bộ Binh', 'Pháo Đài', 'Sảnh Hiệp Sĩ'],
      levels: [
        { hp: 90, damage: [5, 8], armor: 0.05, rate: 1.0, art: 'soldier1' },
        { hp: 150, damage: [9, 13], armor: 0.2, rate: 0.95, art: 'soldier2' },
        { hp: 240, damage: [15, 21], armor: 0.35, rate: 0.9, art: 'soldier3' },
        { hp: 370, damage: [24, 32], armor: 0.5, rate: 0.85, art: 'soldier4', special: 'shieldwall' }
      ],
      gear: ['Kiếm lớn', 'Khiên thép', 'Giáp bạc', 'Áo choàng đỏ sẫm'],
      desc: 'Gọi 2 kiếm sĩ giáp bạc, áo choàng đỏ sẫm ra chặn đường. Đứng chờ thì chống kiếm xuống đất, đánh bằng nhát chém ngang. Cấp 4: khi máu thấp giơ khiên tạo lá chắn, giảm một nửa sát thương trong 3 giây.'
    },
    archer: {
      name: 'Elf', short: 'Cung Elf', role: 'TRỤ ELF - BẮN NHANH, SÁT THƯƠNG CAO, TẦM TRUNG', icon: 'bow', color: '#3f9a52', kind: 'shooter',
      art: 'elf', palette: ['#2f7a44', '#3f8a4a', '#6ab85a', '#c8e0a0', '#f2e6b0'],
      projectile: 'arrow', targetsAir: true, damageType: 'physical',
      cost: [70, 110, 160, 230],
      tierNames: ['Chòi Canh', 'Tháp Gỗ', 'Tháp Ngân Lâm', 'Thánh Điện Thần Xạ'],
      levels: [
        { damage: [8, 12], range: 150, rate: 0.5 },
        { damage: [14, 19], range: 160, rate: 0.45 },
        { damage: [22, 30], range: 170, rate: 0.4 },
        { damage: [32, 42], range: 180, rate: 0.36, special: 'triple' }
      ],
      gear: ['Cung dài', 'Ống tên', 'Giáp nhẹ xanh', 'Áo choàng lá'],
      desc: 'Bắn tên rất nhanh, sát thương cao, tầm trung, trúng cả quân bay. 15% mũi tên phát sáng gây sát thương gấp đôi. Cấp 4: cứ 4 phát lại bắn 3 mũi tên liên tiếp.'
    },
    mage: {
      name: 'Phù Thủy', short: 'Phù thủy', role: 'TRỤ PHÙ THỦY - TẦM XA NHẤT, SÁT THƯƠNG LAN', icon: 'staff', color: '#5a4ac8', kind: 'shooter',
      art: 'mage', palette: ['#2a2a78', '#4a3ab8', '#7a6ae0', '#c8b8f8', '#7fd8ff'],
      projectile: 'bolt', targetsAir: true, damageType: 'magic',
      cost: [100, 140, 190, 260],
      tierNames: ['Tháp Tập Sự', 'Tháp Phù Thủy', 'Tháp Huyền Bí', 'Đài Tinh Tú'],
      levels: [
        { damage: [6, 10], range: 195, rate: 1.4, aoe: 48 },
        { damage: [11, 17], range: 210, rate: 1.35, aoe: 54 },
        { damage: [18, 27], range: 225, rate: 1.3, aoe: 60 },
        { damage: [28, 40], range: 240, rate: 1.25, aoe: 66, special: 'meteor' }
      ],
      gear: ['Gậy đá phát sáng', 'Sách phép', 'Áo choàng xanh tím', 'Mũ phù thủy'],
      desc: 'Tầm xa nhất. Quả cầu phép nổ thành vòng phép dưới chân quái, gây sát thương lan cả nhóm và xuyên giáp, nhưng mỗi phát yếu hơn Elf. Cấp 4: cứ 5 phát lại gọi mưa thiên thạch.'
    },
    artillery: {
      name: 'Người Lùn', short: 'Pháo thủ Lùn', role: 'PHÁO ĐÀI NGƯỜI LÙN - ĐẠI BÁC TẦM XA, NỔ LAN, BẮN CHẬM', icon: 'bomb', color: '#c0502a', kind: 'shooter',
      art: 'dwarf', palette: ['#a8481e', '#d8682a', '#e89050', '#6a6e78', '#f0c898'],
      projectile: 'bomb', targetsAir: false, damageType: 'physical',
      cost: [100, 140, 190, 250],
      tierNames: ['Ụ Pháo Gỗ', 'Pháo Đài Đá', 'Pháo Đài Sắt', 'Pháo Đài Tổ Tiên'],
      levels: [
        { damage: [17, 29], range: 215, rate: 2.6, aoe: 52 },
        { damage: [31, 48], range: 228, rate: 2.5, aoe: 58 },
        { damage: [50, 74], range: 242, rate: 2.4, aoe: 64 },
        { damage: [74, 108], range: 258, rate: 2.3, aoe: 72, special: 'cluster' }
      ],
      gear: ['Súng cối', 'Mũ sắt', 'Giáp nặng', 'Râu khổng lồ'],
      desc: 'Pháo thủ Lùn nã đại bác cầu vồng xa nhất trong các trụ, đạn nổ tung gây sát thương lan cả nhóm quái đi bộ. Mỗi phát rất mạnh nhưng nạp đạn lâu và không bắn được quân bay. Luôn nhắm vào chỗ quái đông nhất. Cấp 4: đạn chùm – nổ xong văng thêm 3 quả nhỏ.'
    }
  },

  /* ---------------- ANH HÙNG (chọn 1 trước khi vào trận) ----------------
     ranged: tầm bắn (có = bắn xa). skill.id: kỹ năng riêng. unlock = số Xu để mở khoá. */
  heroes: {
    aldric: {
      name: 'Aldric Tóc Bạc', title: 'Hiệp sĩ Bình Minh', role: 'Cận chiến · Hồi máu đồng đội', race: 'Con người',
      hp: 380, damage: [16, 24], armor: 0.4, speed: 95, attackRate: 0.9, regen: 12, respawn: 15, radius: 15, unlock: 0,
      skill: { id: 'holy', name: 'Thánh Quang', icon: 'sun', cooldown: 18, radius: 95, damage: 90, heal: 0.35 },
      desc: 'Hiệp sĩ cầm đại kiếm. Thánh Quang gây sát thương xung quanh và hồi máu cho quân ta.'
    },
    lyra: {
      name: 'Lyra Gió Bạc', title: 'Xạ thủ Elf', role: 'Bắn xa · Mưa tên diện rộng', race: 'Elf',
      hp: 260, damage: [14, 20], armor: 0.15, speed: 105, attackRate: 0.7, regen: 9, respawn: 14, radius: 14, unlock: 200, range: 175, proj: 'arrow', air: true,
      skill: { id: 'rain', name: 'Mưa Tên', icon: 'bow', cooldown: 20, radius: 130, damage: 130, ticks: 5 },
      desc: 'Bắn tên từ xa, trúng cả quân bay. Mưa Tên trút xuống một vùng, sát thương liên tục.'
    },
    selene: {
      name: 'Selene Nguyệt Quang', title: 'Đại pháp sư', role: 'Phép xa · Làm chậm kẻ địch', race: 'Phù thủy',
      hp: 230, damage: [18, 28], armor: 0.1, speed: 90, attackRate: 1.1, regen: 8, respawn: 15, radius: 14, unlock: 400, range: 160, proj: 'bolt', air: true, type: 'magic',
      skill: { id: 'frost', name: 'Bão Băng', icon: 'frost', cooldown: 22, radius: 135, damage: 85, slow: 0.55, slowTime: 4.5 },
      desc: 'Phép thuật xuyên giáp. Bão Băng gây sát thương phép và làm chậm cả nhóm quái.'
    },
    borin: {
      name: 'Borin Rìu Lửa', title: 'Chiến thần Người Lùn', role: 'Cận chiến · Choáng diện rộng', race: 'Người Lùn',
      hp: 520, damage: [20, 30], armor: 0.5, speed: 78, attackRate: 1.15, regen: 14, respawn: 16, radius: 16, unlock: 600,
      skill: { id: 'quake', name: 'Địa Chấn', icon: 'axe', cooldown: 20, radius: 120, damage: 70, stun: 2.4 },
      desc: 'Người Lùn thấp, béo chắc, râu khổng lồ, mũ sắt, giáp nặng, rìu hai tay. Địa Chấn: đập đất làm choáng toàn bộ quái xung quanh.'
    }
  },
  heroMax: 10, heroPerLevel: 0.08, heroLevelXp: [0, 120, 300, 560, 900, 1350, 1900, 2600, 3500, 4600],

  /* ---------------- TRANG BỊ: 4 ô × 3 bậc. Mua bằng Xu, mặc cho từng anh hùng. ---------------- */
  equipment: {
    weapon: { name: 'Vũ khí', icon: 'sword', items: [
      { name: 'Kiếm Sắt Rèn', cost: 120, dmg: 0.12, col: '#c8d0dc' },
      { name: 'Kiếm Bạc Nguyệt', cost: 320, dmg: 0.26, col: '#e8f4ff' },
      { name: 'Thánh Kiếm Bình Minh', cost: 700, dmg: 0.42, col: '#fff0a0', glow: '#ffe060' } ] },
    gloves: { name: 'Găng tay', icon: 'hammer', items: [
      { name: 'Găng Da Thuộc', cost: 100, rate: 0.08, col: '#9a6a3a' },
      { name: 'Găng Thép', cost: 280, rate: 0.17, col: '#aab4c4' },
      { name: 'Găng Vàng Thần', cost: 620, rate: 0.28, col: '#f2c14e' } ] },
    armor: { name: 'Giáp', icon: 'shield', items: [
      { name: 'Giáp Da Cứng', cost: 130, hp: 0.15, arm: 0.03, col: '#8a6a44' },
      { name: 'Giáp Bạc Hộ Mệnh', cost: 340, hp: 0.32, arm: 0.07, col: '#c6d0e0' },
      { name: 'Giáp Rồng Vàng', cost: 740, hp: 0.55, arm: 0.12, col: '#f2c14e' } ] },
    boots: { name: 'Giày', icon: 'fast', items: [
      { name: 'Giày Vải Gió', cost: 90, spd: 0.1, col: '#8a6a44' },
      { name: 'Giày Thép Nhẹ', cost: 240, spd: 0.2, col: '#aab4c4' },
      { name: 'Giày Gió Thần', cost: 560, spd: 0.32, col: '#7fe0ff' } ] }
  },
  startCoins: 200,

  /* ---------------- QUÁI ----------------
     lives: số mạng bị trừ khi lọt qua. flying: bay. ranged: bắn tên vào lính. */
  enemies: {
    goblin:    { name: 'Yêu Tinh',      hp: 55,   speed: 68, armor: 0,   mres: 0,   damage: [2, 4],   rate: 1.0, reward: 9,   lives: 1, radius: 12, desc: 'Goblin tí hon tai dài, mắt to, cầm dao nhỏ, chạy khom người. Yếu nhưng đi thành bầy rất đông.' },
    wolfRider: { name: 'Orc Cưỡi Sói', hp: 190, speed: 84, armor: 0.15, mres: 0, damage: [9, 14], rate: 1.0, reward: 26, lives: 1, radius: 17, charge: { every: 6, time: 1.3, mul: 2.2 }, desc: 'Orc da xanh xám cưỡi sói lớn, cầm giáo. Sói thỉnh thoảng tăng tốc lao tới, húc lính gây sát thương gấp đôi.' },
    shade: { name: 'Bóng Tối', hp: 70, speed: 72, armor: 0, mres: 0.2, damage: [4, 7], rate: 1.0, reward: 6, lives: 1, radius: 11, desc: 'Bóng ma do Kỵ Sĩ Hắc Ám triệu hồi.' },
    darkKnight: { name: 'Kỵ Sĩ Hắc Ám', hp: 1700, speed: 30, armor: 0.45, mres: 0.25, damage: [36, 54], rate: 1.6, reward: 260, lives: 6, radius: 20, boss: true, summon: { every: 11, type: 'shade', n: 2 }, phase2: 0.5, desc: 'Boss giữa màn. Giáp đen kín người, không thấy mặt, mắt đỏ rực, kiếm đen khổng lồ. Triệu hồi bóng tối. Dưới nửa máu: áo choàng bay lên, kiếm rực đỏ, chém nhanh hơn.' },
    darkLord: { name: 'Chúa Hắc Ám', hp: 11000, speed: 18, armor: 0.35, mres: 0.35, damage: [90, 130], rate: 2.2, reward: 900, lives: 20, radius: 34, boss: true, slam: { every: 8, radius: 120, damage: 70 }, lord: true, desc: 'Boss cuối khổng lồ: giáp đen, vương miện đen, kiếm khổng lồ, khói bóng tối sau lưng. Giai đoạn 2: triệu hồi Orc và Goblin. Giai đoạn 3: toàn thân rực đỏ, tốc độ tăng mạnh.' },
    orc:       { name: 'Chiến Binh Orc Hắc Ám', hp: 145, speed: 50, armor: 0.3, mres: 0, damage: [6, 10], rate: 1.1, reward: 20, lives: 1, radius: 15, desc: 'Giáp vừa. Pháp sư khắc chế tốt.' },
    orcArcher: { name: 'Cung Thủ Hắc Ám',  hp: 100,  speed: 52, armor: 0.1, mres: 0,   damage: [5, 8],   rate: 1.4, reward: 19,  lives: 1, radius: 14, ranged: 120, desc: 'Bắn tên vào lính ta từ xa.' },
    warg:      { name: 'Sói Warg',      hp: 85,  speed: 112, armor: 0,  mres: 0,   damage: [5, 8],   rate: 0.8, reward: 15,  lives: 1, radius: 16, desc: 'Cực nhanh. Cần lính chặn hoặc tháp cung.' },
    treant:    { name: 'Cây Ma',        hp: 440,  speed: 28, armor: 0.25, mres: 0,  damage: [18, 28], rate: 1.8, reward: 70,  lives: 2, radius: 22, regen: 4, desc: 'Cây cổ thụ hoá quỷ. Chậm nhưng cực trâu.' },
    skeleton:  { name: 'Hiệp Sĩ Xương', hp: 210,  speed: 46, armor: 0.45, mres: 0,  damage: [8, 12],  rate: 1.1, reward: 28,  lives: 1, radius: 15, desc: 'Giáp dày, sát thương vật lý yếu. Dùng phép.' },
    wraith:    { name: 'Linh Ma',       hp: 130,  speed: 54, armor: 0,   mres: 0.3, damage: [0, 0],   rate: 1.0, reward: 28,  lives: 1, radius: 13, flying: true, desc: 'Bay qua đầu lính. Pháo không bắn được, kháng phép.' },
    deathKnight: { name: 'Kỵ Sĩ Tử Thần', hp: 620, speed: 38, armor: 0.55, mres: 0.1, damage: [16, 24], rate: 1.3, reward: 62, lives: 2, radius: 18, desc: 'Hiệp sĩ chết hồi sinh, giáp rất dày.' },
    bandit:    { name: 'Cướp Sa Mạc',   hp: 95,   speed: 76, armor: 0.05, mres: 0, damage: [4, 7],   rate: 0.9, reward: 14,  lives: 1, radius: 13, desc: 'Nhanh nhẹn, đi thành đoàn.' },
    mummy:     { name: 'Xác Ướp',       hp: 310,  speed: 36, armor: 0.2, mres: 0,   damage: [10, 15], rate: 1.4, reward: 38,  lives: 1, radius: 16, regen: 5, desc: 'Quấn băng cổ xưa, tự hồi máu chậm.' },
    scorpion:  { name: 'Bọ Cạp Cát',    hp: 190,  speed: 62, armor: 0.5, mres: 0,   damage: [9, 14],  rate: 1.0, reward: 32,  lives: 1, radius: 16, desc: 'Vỏ cứng như đá. Dùng phép để hạ.' },
    frostWolf: { name: 'Sói Tuyết',     hp: 105,  speed: 118, armor: 0,  mres: 0.1, damage: [5, 9],   rate: 0.8, reward: 17,  lives: 1, radius: 16, desc: 'Lao như bão tuyết.' },
    iceGolem:  { name: 'Người Băng',    hp: 720,  speed: 32, armor: 0.35, mres: 0.2, damage: [24, 36], rate: 1.9, reward: 90, lives: 3, radius: 22, desc: 'Khối băng sống. Tập trung hoả lực.' },
    imp:       { name: 'Quỷ Lửa',       hp: 95,   speed: 66, armor: 0,   mres: 0.2, damage: [0, 0],   rate: 1.0, reward: 22,  lives: 1, radius: 12, flying: true, desc: 'Quỷ nhỏ biết bay, đi thành bầy.' },
    drake:     { name: 'Rồng Lửa',      hp: 540,  speed: 40, armor: 0.15, mres: 0.3, damage: [0, 0],  rate: 1.0, reward: 95,  lives: 3, radius: 22, flying: true, desc: 'Rồng bay trên cao. Cần cung và pháp sư.' },
    magmaGolem:{ name: 'Quái Magma',    hp: 1100, speed: 28, armor: 0.4, mres: 0.35, damage: [30, 44], rate: 2.0, reward: 125, lives: 3, radius: 24, regen: 6, desc: 'Dung nham sống. Giáp dày, kháng phép.' },
    voidling:  { name: 'Quái Hỗn Mang', hp: 165,  speed: 60, armor: 0.1, mres: 0.3, damage: [6, 10],  rate: 1.0, reward: 25,  lives: 1, radius: 13, desc: 'Sinh vật hư vô, kháng phép nhẹ.' },
    voidWalker:{ name: 'Kẻ Dẫn Lối Hư Vô', hp: 500, speed: 44, armor: 0.3, mres: 0.4, damage: [16, 24], rate: 1.3, reward: 58, lives: 2, radius: 17, desc: 'Giáp và kháng phép đều cao.' },
    blackOrc:  { name: 'Hắc Orc',       hp: 375,  speed: 42, armor: 0.6, mres: 0,   damage: [14, 20], rate: 1.3, reward: 45,  lives: 2, radius: 17, desc: 'Giáp cực dày. Dùng phép để hạ.' },
    troll:     { name: 'Troll Hang',    hp: 935, speed: 30, armor: 0.1, mres: 0.25, damage: [30, 45], rate: 2.0, reward: 112,  lives: 3, radius: 24, regen: 6, desc: 'Khổng lồ, tự hồi máu. Tập trung hoả lực.' },
    trollKing: { name: 'Vua Troll Đá',  hp: 5200, speed: 22, armor: 0.3, mres: 0.3, damage: [70, 100], rate: 2.2, reward: 500, lives: 20, radius: 30, boss: true, slam: { every: 8, radius: 110, damage: 60 }, desc: 'Chúa tể vùng núi. Đập đất làm choáng và gây sát thương cả nhóm lính.' },
    voidLord:  { name: 'Chúa Tể Hỗn Mang', hp: 9500, speed: 20, armor: 0.35, mres: 0.35, damage: [90, 130], rate: 2.2, reward: 900, lives: 20, radius: 32, boss: true, slam: { every: 7, radius: 125, damage: 80 }, desc: 'Boss cuối. Xé toạc không gian, choáng cả đội hình.' }
  },

  /* ---------------- VẬT PHẨM GẮN TRỤ ----------------
     Quái chết có tỉ lệ rơi đồ (boss chắc chắn rơi đồ xịn). Mỗi trụ có 6 VỊ TRÍ LẮP cố định;
     QUY TẮC: mỗi vị trí của 1 trụ chỉ nhận ĐÚNG 1 loại đồ của ĐÚNG trụ đó (khiên → tầng trên trụ Người…).
     Đồ gắn vào trụ áp dụng cho MỌI trụ cùng loại trong trận. Chỉ số = base × hệ số bậc (rarities[].k).
     stat: damage/range/rate/aoe/hp (+%), armor (+giáp), block (giảm sát thương lính nhận), respawn (hồi sinh nhanh),
           crit (tỉ lệ chí mạng), poison/burn (sát thương theo thời gian, % đòn đánh), slow (làm chậm), pen (xuyên kháng phép), stun/root (tỉ lệ choáng) */
  items: {
    rarities: [
      { name: 'Tệ', suffix: 'Cũ Nát', col: '#9c9c9c', k: 0.5, salvage: 4 },
      { name: 'Bình thường', suffix: 'Thường', col: '#e8e4d8', k: 1, salvage: 10 },
      { name: 'Cao', suffix: 'Tinh Xảo', col: '#4aa8ff', k: 1.7, salvage: 26 },
      { name: 'Cao cấp', suffix: 'Quý Hiếm', col: '#c070ff', k: 2.6, salvage: 64 },
      { name: 'Huyền thoại', suffix: 'Huyền Thoại', col: '#ffa024', k: 4, salvage: 160 }
    ],
    // 6 vị trí lắp trên thân trụ (vẽ đồ đúng chỗ): x lệch tâm, y tính từ đỉnh sàn trụ (top) hoặc từ chân (base)
    slots: [
      { name: 'Đỉnh tháp', at: 'top', x: 0, y: -46 },
      { name: 'Tầng trên', at: 'top', x: 0, y: -4 },
      { name: 'Mặt trước', at: 'mid', x: 0, y: 0 },
      { name: 'Cánh trái', at: 'mid', x: -34, y: -10 },
      { name: 'Cánh phải', at: 'mid', x: 34, y: -10 },
      { name: 'Nền móng', at: 'base', x: 0, y: 6 }
    ],
    gear: {
      barracks: [
        { name: 'Cờ Chiến', icon: 'flag', stat: 'respawn', base: 0.07, text: 'lính hồi sinh nhanh hơn' },
        { name: 'Khiên', icon: 'shield', stat: 'block', base: 0.05, text: 'giảm sát thương lính phải chịu (lính cầm khiên)' },
        { name: 'Kiếm', icon: 'sword', stat: 'damage', base: 0.07, text: 'sát thương lính' },
        { name: 'Mũ Giáp', icon: 'helm', stat: 'hp', base: 0.08, text: 'máu lính' },
        { name: 'Giáp Ngực', icon: 'armor', stat: 'armor', base: 0.03, text: 'giáp lính' },
        { name: 'Trống Trận', icon: 'drum', stat: 'rate', base: 0.04, text: 'tốc độ đánh của lính' }
      ],
      archer: [
        { name: 'Ngọc Gió', icon: 'gem', stat: 'range', base: 0.03, text: 'tầm bắn' },
        { name: 'Cung Thần', icon: 'bow', stat: 'damage', base: 0.07, text: 'sát thương' },
        { name: 'Ống Tên', icon: 'quiver', stat: 'rate', base: 0.04, text: 'tốc độ bắn' },
        { name: 'Lông Ưng', icon: 'feather', stat: 'crit', base: 0.03, text: 'tỉ lệ chí mạng' },
        { name: 'Lọ Độc', icon: 'potion', stat: 'poison', base: 0.08, text: 'tên tẩm độc (sát thương 3 giây, % đòn bắn)' },
        { name: 'Rễ Cổ Thụ', icon: 'tree', stat: 'root', base: 0.025, text: 'tỉ lệ trói chân quái 0,8 giây' }
      ],
      mage: [
        { name: 'Pha Lê', icon: 'crystal', stat: 'damage', base: 0.07, text: 'sát thương phép' },
        { name: 'Sách Phép', icon: 'book', stat: 'rate', base: 0.04, text: 'tốc độ niệm phép' },
        { name: 'Gậy Phép', icon: 'staff', stat: 'aoe', base: 0.05, text: 'vùng nổ phép' },
        { name: 'Bùa Băng', icon: 'frost', stat: 'slow', base: 0.05, text: 'làm chậm quái trúng phép 1,5 giây' },
        { name: 'Nhẫn Hư Không', icon: 'ring', stat: 'pen', base: 0.04, text: 'xuyên kháng phép' },
        { name: 'Vòng Rune', icon: 'rune', stat: 'range', base: 0.03, text: 'tầm phép' }
      ],
      artillery: [
        { name: 'Ống Ngắm', icon: 'scope', stat: 'range', base: 0.03, text: 'tầm bắn' },
        { name: 'Nòng Pháo', icon: 'cannon', stat: 'damage', base: 0.07, text: 'sát thương đạn' },
        { name: 'Thùng Thuốc Súng', icon: 'bomb', stat: 'aoe', base: 0.05, text: 'vùng nổ' },
        { name: 'Bánh Răng', icon: 'gear', stat: 'rate', base: 0.04, text: 'tốc độ nạp đạn' },
        { name: 'Đạn Lửa', icon: 'fire', stat: 'burn', base: 0.08, text: 'đốt cháy quái (sát thương 3 giây, % phát nổ)' },
        { name: 'Bệ Thép', icon: 'anvil', stat: 'stun', base: 0.025, text: 'tỉ lệ làm choáng quái 0,8 giây' }
      ]
    },
    dropBase: 0.035,     // tỉ lệ rơi đồ của quái thường
    dropPerLife: 0.03,   // + mỗi mạng quái lấy đi (quái to rơi đồ nhiều hơn)
    maxPerMatch: 8,      // tối đa đồ rơi / trận (không tính boss)
    bag: 80              // sức chứa túi đồ (đầy thì tự phân rã đồ tệ nhất lấy Xu)
  },

  /* ---------------- CHIẾN DỊCH: 6 vùng đất ----------------
     paths: các điểm điều khiển (đường cong mềm), thế giới 1800 × 900. Quái vào từ TRÁI, cổng thành ở PHẢI.
     waves: "loại:số[:giãn cách][/cửa]" cách nhau dấu phẩy. spots: số ô xây (tự đặt dọc đường). */
  levels: [
    { name: 'Rừng Xanh', theme: 'forest', diff: 'Dễ - Trung bình', gold: 350, spots: 13,
      story: 'Bầy yêu tinh và thú hoang tràn qua rừng xanh. Hãy dựng trụ giữ con đường về thành!',
      paths: [[[-80, 650], [160, 650], [330, 540], [340, 340], [560, 230], [790, 300], [860, 500], [720, 650], [790, 790], [1060, 800], [1250, 670], [1210, 480], [1390, 340], [1600, 370], [1700, 520], [1790, 520]]],
      waves: ['goblin:10', 'goblin:12,wolfRider:2', 'orc:4,goblin:10', 'wolfRider:4,orcArcher:3,goblin:6', 'treant:1,goblin:14', 'orc:6,wolfRider:4,orcArcher:3', 'treant:2,orc:6,goblin:10'] },
    { name: 'Thành Cổ', theme: 'castle', diff: 'Trung bình - Khó', gold: 520, spots: 14,
      story: 'Tàn quân linh ma chiếm thành cổ. Giữ vững các cây cầu đá và tường thành!',
      paths: [[[-80, 210], [200, 240], [420, 330], [420, 520], [250, 650], [300, 800], [620, 820], [810, 660], [770, 460], [960, 330], [1180, 300], [1300, 460], [1260, 640], [1430, 780], [1640, 700], [1790, 540]]],
      waves: ['skeleton:5', 'goblin:8,skeleton:4', 'wraith:4,skeleton:4', 'skeleton:7,orcArcher:4', 'darkKnight:1,skeleton:6', 'wraith:6,skeleton:8,wolfRider:3', 'deathKnight:2,wraith:5,skeleton:6', 'deathKnight:2,skeleton:10,wraith:6'] },
    { name: 'Sa Mạc', theme: 'desert', diff: 'Khó', gold: 580, spots: 14,
      story: 'Cướp sa mạc, xác ướp và bọ cạp khổng lồ trỗi dậy từ cồn cát.',
      paths: [[[-80, 450], [250, 420], [470, 260], [720, 300], [770, 520], [570, 660], [630, 800], [910, 780], [1110, 620], [1010, 420], [1210, 250], [1450, 300], [1510, 500], [1360, 640], [1510, 780], [1790, 640]]],
      waves: ['bandit:8', 'bandit:8,mummy:2', 'scorpion:5,bandit:6', 'mummy:4,bandit:8', 'scorpion:6,mummy:3', 'bandit:12,scorpion:6', 'mummy:5,scorpion:8', 'blackOrc:3,mummy:4,scorpion:6', 'blackOrc:3,bandit:12,mummy:5'] },
    { name: 'Băng Giá', theme: 'ice', diff: 'Khó - Rất khó', gold: 660, spots: 15,
      story: 'Hai lối đèo băng giá. Người băng và sói tuyết đang kéo xuống!',
      paths: [[[-80, 190], [250, 180], [450, 310], [610, 450], [820, 450], [1020, 300], [1220, 300], [1350, 480], [1220, 640], [1360, 780], [1560, 720], [1790, 530]],
              [[-80, 730], [250, 750], [450, 620], [610, 450], [820, 450], [1020, 300], [1220, 300], [1350, 480], [1220, 640], [1360, 780], [1560, 720], [1790, 530]]],
      waves: ['frostWolf:8', 'orc:6,frostWolf:5', 'iceGolem:1,frostWolf:6', 'wraith:6,frostWolf:6', 'darkKnight:1,orc:6', 'iceGolem:2,frostWolf:10,wraith:5', 'blackOrc:4,iceGolem:2', 'iceGolem:3,wraith:8,frostWolf:8', 'troll:1,iceGolem:3,frostWolf:10'] },
    { name: 'Núi Lửa', theme: 'lava', diff: 'Rất khó', gold: 740, spots: 15,
      story: 'Quỷ lửa và rồng lửa xổ lên từ miệng núi lửa. Vua Troll đích thân dẫn quân!',
      paths: [[[-80, 150], [300, 200], [500, 380], [400, 560], [640, 700], [900, 600], [1010, 400], [1250, 300], [1450, 450], [1350, 650], [1550, 760], [1790, 600]],
              [[-80, 820], [350, 820], [640, 700], [900, 600], [1010, 400], [1250, 300], [1450, 450], [1350, 650], [1550, 760], [1790, 600]]],
      waves: ['imp:8', 'blackOrc:2,imp:6', 'magmaGolem:1,imp:6', 'drake:2,imp:6', 'blackOrc:4,imp:8', 'magmaGolem:2,drake:2', 'drake:3,imp:10,blackOrc:3', 'magmaGolem:2,drake:3', 'trollKing:1,magmaGolem:1,imp:10'] },
    { name: 'Cổng Hỗn Mang', theme: 'chaos', diff: 'Boss cuối', gold: 860, hpMul: 0.9, spots: 16,
      story: 'Trận chiến cuối cùng bên rìa thế giới. Chúa Tể Hỗn Mang đang mở cổng!',
      paths: [[[-80, 450], [250, 450], [400, 250], [700, 200], [900, 350], [700, 520], [900, 660], [1200, 710], [1350, 530], [1200, 340], [1450, 200], [1650, 350], [1790, 450]],
              [[-80, 790], [250, 790], [500, 710], [700, 520], [900, 660], [1200, 710], [1350, 530], [1200, 340], [1450, 200], [1650, 350], [1790, 450]]],
      waves: ['voidling:10', 'voidling:8,voidWalker:2', 'wraith:4,voidWalker:3', 'voidWalker:4,voidling:12', 'drake:2,voidWalker:4', 'magmaGolem:2,voidWalker:4,voidling:8', 'iceGolem:3,drake:4,voidWalker:5', 'deathKnight:4,voidWalker:8,drake:4', 'darkLord:1,voidWalker:8,voidling:14,drake:2'] },
    /* ---------- CHƯƠNG 2: 6 vùng đất cũ, bố cục mới, quái mạnh hơn ---------- */
    { name: 'Thung Lũng Sương Mù', theme: 'forest', diff: 'Khó', gold: 600, spots: 15, chapter: 2, hpMul: 1.65,
      story: 'Hai đạo quân Orc men theo thung lũng sương mù. Chặn chúng ở ngã ba trước khi tới thành!',
      waves: ['goblin:14,warg:4', 'orc:6,warg:6', 'treant:2,goblin:12', 'orcArcher:6,wolfRider:5', 'troll:1,orc:6,warg:6', 'treant:3,orcArcher:6', 'wolfRider:8,warg:8', 'troll:2,treant:2,orc:8', 'blackOrc:4,wolfRider:6,orcArcher:6', 'troll:2,treant:3,warg:12'] },
    { name: 'Cầu Đá Hoàng Gia', theme: 'castle', diff: 'Khó', gold: 640, spots: 15, chapter: 2, hpMul: 1.3,
      story: 'Đạo quân xương khô vượt cầu đá vào kinh thành. Đừng để chúng qua sông!',
      waves: ['skeleton:10', 'wraith:6,skeleton:6', 'deathKnight:1,skeleton:10', 'orcArcher:6,wraith:6', 'darkKnight:1,deathKnight:1,skeleton:8', 'wraith:10,warg:8', 'deathKnight:3,skeleton:12', 'darkKnight:2,wraith:8', 'deathKnight:4,wraith:10,skeleton:10', 'darkKnight:2,deathKnight:4,wraith:10'] },
    { name: 'Ốc Đảo Bão Cát', theme: 'desert', diff: 'Rất khó', gold: 680, spots: 16, chapter: 2, hpMul: 1.85,
      story: 'Bão cát che mắt, cướp và xác ướp ập tới từ hai phía ốc đảo.',
      waves: ['bandit:12', 'scorpion:6,bandit:8', 'mummy:4,scorpion:5', 'bandit:14,mummy:3', 'blackOrc:3,scorpion:8', 'mummy:6,bandit:12', 'troll:1,scorpion:10', 'blackOrc:5,mummy:5', 'scorpion:12,bandit:14,mummy:4', 'troll:2,blackOrc:5,mummy:6'] },
    { name: 'Đỉnh Tuyết Vĩnh Cửu', theme: 'ice', diff: 'Rất khó', gold: 740, spots: 16, chapter: 2, hpMul: 1.3,
      story: 'Con đèo ngoằn ngoèo trên đỉnh tuyết. Vua Troll Đá đang xuống núi!',
      waves: ['frostWolf:12', 'iceGolem:2,frostWolf:8', 'wraith:8,frostWolf:8', 'iceGolem:3,orc:8', 'drake:2,frostWolf:10', 'troll:1,iceGolem:3', 'blackOrc:5,frostWolf:12', 'drake:3,iceGolem:3,wraith:6', 'troll:2,frostWolf:14', 'trollKing:1,iceGolem:4,frostWolf:12'] },
    { name: 'Lò Rèn Địa Ngục', theme: 'lava', diff: 'Cực khó', gold: 800, spots: 16, chapter: 2, hpMul: 1.25,
      story: 'Lò rèn của quỷ lửa giữa hồ dung nham. Hai đường hành quân đổ về một cây cầu.',
      waves: ['imp:12', 'drake:2,imp:8', 'magmaGolem:2,imp:8', 'blackOrc:5,imp:10', 'drake:4,magmaGolem:1', 'troll:2,imp:12', 'magmaGolem:3,drake:3', 'blackOrc:6,drake:4,imp:10', 'trollKing:1,magmaGolem:2,imp:12', 'trollKing:1,drake:5,magmaGolem:3'] },
    { name: 'Vực Thẳm Hư Không', theme: 'chaos', diff: 'Boss tối thượng', gold: 900, hpMul: 1.1, spots: 17, chapter: 2,
      story: 'Chúa Tể Hỗn Mang tự mình bước ra khỏi vực thẳm. Đây là trận chiến cuối cùng của thế giới!',
      waves: ['voidling:14', 'voidWalker:4,voidling:10', 'wraith:8,voidWalker:4', 'drake:4,voidling:12', 'magmaGolem:3,voidWalker:5', 'deathKnight:4,voidWalker:6', 'iceGolem:4,drake:4,voidling:12', 'darkKnight:2,voidWalker:8,drake:4', 'darkLord:1,voidWalker:8,voidling:14', 'voidLord:1,voidWalker:10,drake:5,voidling:16'] }

  ],

  spawnInterval: { goblin: 0.6, wolfRider: 1.2, shade: 0.5, darkKnight: 1, darkLord: 1, orc: 1.3, orcArcher: 1.3, warg: 0.7, treant: 3.5, skeleton: 1.2, wraith: 1.4, deathKnight: 3, bandit: 0.8, mummy: 2, scorpion: 1.1,
    frostWolf: 0.7, iceGolem: 4, imp: 0.8, drake: 3, magmaGolem: 4.5, voidling: 0.8, voidWalker: 2, blackOrc: 2.0, troll: 4.0, trollKing: 1, voidLord: 1 },

  /* Chủ đề từng vùng (màu nền, đường, cây...) */
  themes: {
    forest: { grass: '#6fb040', grass2: '#58963a', dirt: '#cfae78', dirtEdge: '#8d6e45', tree: ['#4f9a3a', '#3f8a32', '#62aa42'], rock: '#a09a8e', water: '#3fb0d8', sky: '#8ac8e8' },
    castle: { grass: '#7aa84e', grass2: '#62903f', dirt: '#b9b2a2', dirtEdge: '#6e6a62', tree: ['#4f8a3a', '#3f7a32', '#5f9a42'], rock: '#9a98a2', water: '#3a9ad0', sky: '#9ac0e8' },
    desert: { grass: '#d8a860', grass2: '#c89448', dirt: '#e6c890', dirtEdge: '#a8743a', tree: ['#6a9a3a', '#5a8a32', '#7aaa42'], rock: '#b8703c', water: '#3aa8c8', sky: '#f0c890' },
    ice:    { grass: '#e2eef8', grass2: '#c8dcec', dirt: '#a9bccc', dirtEdge: '#6a8098', tree: ['#3f7a52', '#2f6a46', '#4a8a5a'], rock: '#8aa0b8', water: '#7ac8f0', sky: '#bcdcf4' },
    lava:   { grass: '#4a3a3a', grass2: '#3a2c2c', dirt: '#7a5a48', dirtEdge: '#c0502a', tree: ['#3a2c2c', '#2e2222', '#4a3838'], rock: '#5a4a48', water: '#ff6a1a', sky: '#5a2a1a' },
    chaos:  { grass: '#3a2a5a', grass2: '#2c1e4a', dirt: '#6a5a9a', dirtEdge: '#b070ff', tree: ['#4a3a7a', '#3a2c6a', '#5a4a8a'], rock: '#4a3a6a', water: '#a050ff', sky: '#1a1030' }
  },

  audioFiles: { music: null }
};

CONFIG.towers=Object.fromEntries(['barracks','archer','artillery','mage','orc'].map(k=>[k,CONFIG.towers[k]]));
CONFIG.items.gear.orc=[
 {name:'Ng?c Huy?t Nha',icon:'gem',stat:'hp',base:.07,text:'m?u chi?n th?'},
 {name:'R?u Chi?n',icon:'axe',stat:'damage',base:.07,text:'s?t th??ng'},
 {name:'Gi?p S?t',icon:'armor',stat:'armor',base:.025,text:'gi?p'},
 {name:'?o L?ng Th?',icon:'helmet',stat:'block',base:.025,text:'ch?n s?t th??ng'},
 {name:'B?a S?i',icon:'potion',stat:'respawn',base:.04,text:'h?i sinh nhanh'},
 {name:'Tr?ng Orc',icon:'drum',stat:'rate',base:.04,text:'t?c ?? ??nh'}
];
