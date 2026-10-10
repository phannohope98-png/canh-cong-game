/* VƯƠNG QUỐC NGƯỜI – 6 map nối cốt truyện (dữ liệu; bộ dựng ở human-kit.js)
 * 1 Cảng Biên Giới → 2 Làng Nông Dân → 3 Cầu Đá Bắc → 4 Phố Canh Gác → 5 Đường Tới Vương Thành → 6 Cổng Vương Thành (boss)
 * route = waypoint gameplay theo thứ tự (SPAWN → EXIT); spots = ô xây trụ; props = công trình/vật thể đặt có chủ đích. */
(function () {
  const R = HumanKit.register;

  /* ===== MAP 1 — CẢNG BIÊN GIỚI ===== */
  R({
    level: 0, name: 'Cảng Biên Giới',
    story: 'Quân đoàn quái vật từ biển cập bến cảng phía đông nam. Chúng đổ bộ qua cầu tàu, tràn qua khu kho hàng và con đường ven biển để tiến về làng. Hãy xây trụ dọc tuyến đường và chặn chúng trước cổng tây bắc!',
    win: 'Đã giải cứu Cảng Biên Giới! Mở khoá Map 2 — Làng Nông Dân.', lose: 'Quân quái vật đã chiếm cảng và tràn về làng... Hãy thử lại!',
    terrain: {
      land: [[0, 0], [205, 0], [224, 36], [262, 58], [330, 68], [400, 62], [470, 70], [540, 66], [605, 74], [652, 92], [682, 126], [692, 176], [688, 232], [682, 282], [688, 336], [698, 374], [690, 406], [660, 426], [600, 434], [520, 430], [440, 436], [360, 430], [280, 436], [200, 430], [120, 434], [40, 428], [0, 430]],
      beach: [1, 17], seaCliff: 16,
      rivers: [{ pts: [[292, 286], [282, 318], [270, 350], [262, 392], [258, 434]], w: 13 }], lakes: [{ x: 296, y: 280, rx: 22, ry: 11 }],
      falls: [{ x: 258, y: 434, w: 14, h: 36 }],
      piers: [{ x0: 676, x1: 752, y: 236, half: 11 }, { x0: 650, x1: 748, y: 319, half: 19 }], gangway: [736, 338, 744, 404],
      cobble: [[455, 150, 668, 345]]
    },
    route: [[744, 414], [738, 372], [726, 322], [690, 319], [648, 319], [600, 318], [550, 292], [502, 252], [452, 240], [414, 264], [402, 312], [374, 366], [322, 392], [258, 396], [192, 392], [146, 360], [130, 300], [150, 246], [182, 200], [162, 150], [112, 120], [56, 100], [-30, 92]],
    spots: [[655, 262], [622, 410], [536, 404], [452, 186], [470, 316], [330, 336], [214, 346], [232, 276], [234, 182], [62, 178]],
    props: [
      { k: 'ship', x: 430, y: 26, s: .45, kind: 'merchant', free: 1 }, { k: 'ship', x: 575, y: 44, s: .52, kind: 'merchant', flip: -1, free: 1 },
      { k: 'ship', x: 736, y: 190, s: .62, kind: 'enemy', flip: -1, free: 1 }, { k: 'ship', x: 742, y: 456, s: 1, kind: 'enemy', crew: 1, flip: -1, free: 1 },
      { k: 'islet', x: 300, y: 30, s: .8, free: 1 }, { k: 'islet', x: 650, y: 22, s: .6, free: 1 }, { k: 'islet', x: 744, y: 96, s: .7, free: 1 },
      { k: 'rowboat', x: 716, y: 254, free: 1 }, { k: 'rowboat', x: 742, y: 222, flip: -1, free: 1 }, { k: 'rowboat', x: 708, y: 352, flip: -1, free: 1 },
      { k: 'crates', x: 728, y: 232, free: 1 }, { k: 'barrels', x: 700, y: 234, free: 1 }, { k: 'sacks', x: 668, y: 374 }, { k: 'net', x: 664, y: 356 }, { k: 'skullflag', x: 760, y: 392, free: 1 },
      { k: 'lighthouse', x: 668, y: 150 },
      { k: 'hall', x: 566, y: 226, w: 74, d: 30, h: 40 }, { k: 'hall', x: 504, y: 186, w: 58, d: 24, h: 34 },
      { k: 'sacks', x: 612, y: 254 }, { k: 'cart', x: 526, y: 222 }, { k: 'crates', x: 578, y: 430 }, { k: 'barrels', x: 484, y: 424 }, { k: 'sacks', x: 670, y: 420 }, { k: 'spill', x: 575, y: 350 }, { k: 'spill', x: 492, y: 356 },
      { k: 'banner', x: 540, y: 190 }, { k: 'tower', x: 424, y: 422, s: .8 }, { k: 'banner', x: 392, y: 422 }, { k: 'signpost', x: 220, y: 430, text: 'Cảng' },
      { k: 'bhouse', x: 46, y: 272, s: .6 }, { k: 'bhouse', x: 64, y: 330, s: .62, flip: -1 }, { k: 'bhouse', x: 38, y: 410, s: .58 }, { k: 'bhouse', x: 106, y: 424, s: .56, flip: -1 },
      { k: 'well', x: 96, y: 372 }, { k: 'garden', x: 30, y: 290 }, { k: 'flowerbed', x: 92, y: 262 }, { k: 'cart', x: 92, y: 300, hay: true }, { k: 'lamp', x: 98, y: 352 },
      { k: 'farm70', x: 322, y: 128, w: 92, h: 36, crop: 'wheat' }, { k: 'farm70', x: 330, y: 182, w: 80, h: 30, crop: 'wheat' }, { k: 'garden', x: 292, y: 94 },
      { k: 'fence70', x: 272, y: 208, x2: 372, y2: 208 }, { k: 'hay70', x: 386, y: 116, s: 1 }, { k: 'hay70', x: 382, y: 192, s: .9 },
      { k: 'pen', x: 380, y: 160 }, { k: 'sheep70', x: 372, y: 156 }, { k: 'sheep70', x: 390, y: 162, flip: -1 }, { k: 'sheep70', x: 378, y: 168 },
      { k: 'cart', x: 362, y: 230, hay: true }, { k: 'bhouse', x: 526, y: 104, s: .58 },
      { k: 'gate', x: 84, y: 112, free: 1 }, { k: 'signpost', x: 132, y: 84, text: 'Làng Nông Dân' },
      { k: 'pine', x: 14, y: 46, s: .82 }, { k: 'tree', x: 150, y: 44, s: .8 }, { k: 'pine', x: 188, y: 30, s: .74 }, { k: 'tree', x: 22, y: 56, s: .66 }, { k: 'bush', x: 120, y: 56 },
      { k: 'tree', x: 300, y: 238, s: .7 }, { k: 'bush', x: 348, y: 226, s: .66 }, { k: 'tree', x: 14, y: 172, s: .78 }, { k: 'pine', x: 12, y: 360, s: .8 }, { k: 'bush', x: 146, y: 432 }, { k: 'tree', x: 172, y: 438, s: .7 },
      { k: 'rock', x: 352, y: 80, s: .7 }, { k: 'rock', x: 470, y: 78, s: .6 }, { k: 'rock', x: 610, y: 86, s: .7 }, { k: 'rock', x: 640, y: 428, s: .6 },
      { k: 'bush', x: 560, y: 92, s: .7 }, { k: 'bush', x: 400, y: 84, s: .66 }, { k: 'tree', x: 620, y: 132, s: .74 }, { k: 'tree', x: 640, y: 112, s: .6, v: 1 }
    ]
  });

  /* ===== MAP 2 — LÀNG NÔNG DÂN ===== */
  R({
    level: 1, name: 'Làng Nông Dân',
    story: 'Từ cảng, quân quái vật kéo vào vùng đồng lúa. Nông dân đã bỏ chạy, chỉ còn cối xay gió, đống rơm và những chiếc xe bỏ lại. Đội dân quân dựng chướng ngại ở lối ra – chặn quái trước khi chúng tới con sông và Cầu Đá Bắc!',
    win: 'Làng Nông Dân đã an toàn! Mở khoá Map 3 — Cầu Đá Bắc.', lose: 'Đồng lúa đã bị giày xéo, quái vật tràn qua làng... Hãy thử lại!',
    terrain: {
      rivers: [{ pts: [[238, -20], [250, 60], [240, 116], [226, 190], [214, 270], [200, 350], [210, 430], [200, 500]], w: 22 }],
      lakes: [{ x: 104, y: 252, rx: 30, ry: 13 }]
    },
    route: [[800, 412], [720, 410], [652, 388], [606, 340], [560, 300], [494, 292], [446, 326], [392, 356], [330, 350], [290, 306], [300, 250], [350, 214], [396, 176], [384, 128], [332, 100], [262, 104], [206, 136], [150, 150], [100, 124], [70, 80], [60, -30]],
    woodBridge: true,
    spots: [[690, 350], [600, 240], [520, 236], [420, 268], [300, 416], [300, 170], [166, 222], [60, 190], [440, 140]],
    props: [
      { k: 'windmill', x: 650, y: 252, rot: .3 }, { k: 'windmill', x: 30, y: 286, s: .85, rot: 1 },
      { k: 'farm70', x: 660, y: 170, w: 110, h: 44, crop: 'wheat' }, { k: 'farm70', x: 520, y: 412, w: 80, h: 36, crop: 'wheat' }, 
      { k: 'farm70', x: 540, y: 62, w: 90, h: 34, crop: 'wheat' }, { k: 'farm70', x: 650, y: 70, w: 90, h: 34, crop: 'green' },
      { k: 'scarecrow', x: 660, y: 176 }, { k: 'scarecrow', x: 540, y: 68 }, { k: 'hay70', x: 726, y: 214 }, { k: 'hay70', x: 712, y: 120 }, { k: 'hay70', x: 540, y: 112 }, { k: 'burnt', x: 610, y: 270 },
      { k: 'fence70', x: 605, y: 196, x2: 715, y2: 196 }, { k: 'fence70', x: 495, y: 88, x2: 585, y2: 88 },
      { k: 'pen', x: 740, y: 230 }, { k: 'sheep70', x: 734, y: 226 }, { k: 'sheep70', x: 748, y: 232, flip: -1 },
      { k: 'cart', x: 640, y: 444, hay: true }, { k: 'cart', x: 452, y: 386 }, { k: 'spill', x: 470, y: 400 },
      { k: 'bhouse', x: 64, y: 330, s: .62 }, { k: 'bhouse', x: 130, y: 360, s: .6, flip: -1 }, { k: 'bhouse', x: 70, y: 420, s: .58 }, { k: 'bhouse', x: 150, y: 440, s: .56, flip: -1 },
      { k: 'hall', x: 120, y: 300, w: 56, h: 30, d: 22 }, { k: 'well', x: 30, y: 380 }, { k: 'flowerbed', x: 110, y: 392 },
      { k: 'reeds', x: 132, y: 258 }, { k: 'reeds', x: 76, y: 250 },
      { k: 'barricade', x: 112, y: 64 }, { k: 'barricade', x: 20, y: 96, flip: -1 }, { k: 'banner', x: 132, y: 92 }, { k: 'signpost', x: 20, y: 130, text: 'Cầu Đá Bắc' },
      { k: 'tree', x: 300, y: 40, s: .78 }, { k: 'pine', x: 340, y: 30, s: .7 }, { k: 'tree', x: 180, y: 60, s: .66, v: 1 }, { k: 'tree', x: 740, y: 40, s: .76 }, 
      { k: 'tree', x: 300, y: 470, s: .72 }, { k: 'tree', x: 740, y: 470, s: .72 }, { k: 'bush', x: 560, y: 470 }, { k: 'bush', x: 430, y: 470 }, { k: 'rock', x: 260, y: 200, s: .6 },
      { k: 'tree', x: 480, y: 226, s: .62, v: 1 }, { k: 'bush', x: 344, y: 290, s: .7 }
    ]
  });

  /* ===== MAP 3 — CẦU ĐÁ BẮC ===== */
  R({
    level: 2, name: 'Cầu Đá Bắc',
    story: 'Con sông lớn chặn lối lên phương bắc, chỉ có Cầu Đá Bắc nối hai bờ. Quân quái vật dồn về cây cầu. Giữ cầu thật chắc – nếu cầu thất thủ, Phố Canh Gác sẽ là nơi tiếp theo!',
    win: 'Cầu Đá Bắc vẫn đứng vững! Mở khoá Map 4 — Phố Canh Gác.', lose: 'Quái vật đã vượt cầu và tiến lên phương bắc... Hãy thử lại!',
    terrain: {
      rivers: [{ pts: [[-20, 236], [120, 230], [260, 250], [400, 238], [540, 250], [650, 236], [780, 244]], w: 58 }],
      falls: [{ x: 600, y: 222, w: 46, h: 22 }],
      cliffs: [{ pts: [[580, 200], [620, 196]], h: 8 }]
    },
    route: [[540, 510], [540, 440], [480, 404], [400, 412], [320, 420], [250, 396], [214, 346], [250, 306], [330, 300], [392, 300], [392, 190], [440, 132], [520, 140], [580, 180], [650, 160], [690, 110], [700, 40], [705, -30]],
    spots: [[470, 350], [360, 370], [160, 410], [150, 300], [320, 150], [560, 380], [530, 92], [620, 112]],
    props: [
      { k: 'hall', x: 168, y: 196, w: 58, h: 32, d: 22, wheel: true }, { k: 'reeds', x: 90, y: 270 }, { k: 'reeds', x: 520, y: 214 }, { k: 'reeds', x: 60, y: 200 },
      { k: 'tower', x: 452, y: 300, s: .82 }, { k: 'tower', x: 270, y: 200, s: .82 }, { k: 'banner', x: 436, y: 300 }, { k: 'banner', x: 285, y: 204 },
      { k: 'barricade', x: 300, y: 200 }, { k: 'barricade', x: 452, y: 210, flip: -1 },
      { k: 'bhouse', x: 60, y: 140, s: .6 }, { k: 'bhouse', x: 110, y: 100, s: .58, flip: -1 }, { k: 'bhouse', x: 240, y: 92, s: .56 }, { k: 'well', x: 170, y: 120 }, { k: 'garden', x: 40, y: 90 },
      { k: 'bhouse', x: 640, y: 420, s: .6 }, { k: 'bhouse', x: 700, y: 380, s: .58, flip: -1 }, { k: 'farm70', x: 680, y: 450, w: 90, h: 30, crop: 'wheat' }, { k: 'cart', x: 610, y: 360, hay: true },
      { k: 'rowboat', x: 90, y: 238, free: 1 }, { k: 'rowboat', x: 700, y: 246, flip: -1, free: 1 }, { k: 'net', x: 60, y: 284 },
      { k: 'statue', x: 430, y: 192 },
      { k: 'pine', x: 20, y: 40, s: .8 }, { k: 'tree', x: 300, y: 40, s: .74 }, { k: 'pine', x: 680, y: 30, s: .72 }, { k: 'tree', x: 740, y: 70, s: .7 }, { k: 'tree', x: 40, y: 470, s: .76 }, { k: 'pine', x: 120, y: 470, s: .72 },
      { k: 'tree', x: 300, y: 470, s: .7, v: 1 }, { k: 'rock', x: 620, y: 290, s: .7 }, { k: 'rock', x: 660, y: 200, s: .6 }, { k: 'bush', x: 580, y: 300 }, { k: 'bush', x: 30, y: 330 }, { k: 'tree', x: 740, y: 300, s: .72 },
      { k: 'signpost', x: 760, y: 70, text: 'Phố Canh Gác', free: 1 }
    ]
  });

  /* ===== MAP 4 — PHỐ CANH GÁC ===== */
  R({
    level: 3, name: 'Phố Canh Gác',
    story: 'Phố Canh Gác là thị trấn lính gác cuối cùng trước Vương Thành. Dân phố đã sơ tán, chợ vắng tanh, chỉ còn tháp canh và lính gác. Quân quái vật đã phá cổng phía nam – hãy giữ từng con phố!',
    win: 'Phố Canh Gác đã được giải vây! Mở khoá Map 5 — Đường Tới Vương Thành.', lose: 'Phố Canh Gác đã thất thủ... Hãy thử lại!',
    terrain: {}, cobbleAll: true,
    route: [[90, 510], [90, 420], [150, 370], [250, 380], [330, 340], [340, 270], [280, 220], [270, 160], [330, 110], [420, 110], [480, 160], [480, 230], [540, 290], [630, 300], [690, 250], [700, 170], [790, 150]],
    spots: [[50, 330], [180, 296], [262, 300], [200, 180], [380, 184], [560, 210], [600, 370], [640, 200]],
    props: [
      { k: 'wall', x: -10, y: 476, x2: 56, y2: 476, h: 28, free: 1 }, { k: 'wall', x: 124, y: 476, x2: 770, y2: 476, h: 28, banners: 1, free: 1 }, { k: 'tower', x: 56, y: 480, s: .9, free: 1 }, { k: 'tower', x: 124, y: 480, s: .9, free: 1 },
      { k: 'fountain', x: 420, y: 320 }, { k: 'stall', x: 400, y: 268 }, { k: 'stall', x: 452, y: 372, col: '#c0453a', flip: -1 }, { k: 'stall', x: 380, y: 384, col: '#3d8f4a' }, { k: 'crates', x: 470, y: 290 }, { k: 'barrels', x: 380, y: 300 },
      { k: 'bhouse', x: 40, y: 110, s: .62 }, { k: 'bhouse', x: 110, y: 140, s: .6, flip: -1 }, { k: 'bhouse', x: 44, y: 200, s: .6 }, { k: 'hall', x: 120, y: 250, w: 60, h: 32, d: 22 },
      { k: 'bhouse', x: 150, y: 80, s: .58 }, { k: 'hall', x: 260, y: 60, w: 64, h: 32, d: 22 },
      { k: 'hall', x: 600, y: 72, w: 70, h: 36, d: 26 }, { k: 'bhouse', x: 690, y: 70, s: .6 }, { k: 'bhouse', x: 724, y: 124, s: .58, flip: -1 }, { k: 'tower', x: 740, y: 230, s: .9 },
      { k: 'bhouse', x: 210, y: 450, s: .6 }, { k: 'bhouse', x: 400, y: 450, s: .6, flip: -1 }, { k: 'hall', x: 500, y: 440, w: 66, h: 34, d: 24 }, { k: 'bhouse', x: 690, y: 420, s: .6 },
      { k: 'tower', x: 420, y: 60, s: .9 }, { k: 'banner', x: 380, y: 64 }, { k: 'banner', x: 460, y: 64 },
      { k: 'lamp', x: 196, y: 336 }, { k: 'lamp', x: 316, y: 190 }, { k: 'lamp', x: 660, y: 344 },
      { k: 'barricade', x: 40, y: 440 }, { k: 'barricade', x: 150, y: 420, flip: -1 }, { k: 'flowerbed', x: 300, y: 450 }, { k: 'cart', x: 600, y: 444 },
      { k: 'tree', x: 740, y: 40, s: .7 }, { k: 'tree', x: 20, y: 40, s: .7 }, { k: 'bush', x: 620, y: 240 }, { k: 'bush', x: 230, y: 260 }, { k: 'tree', x: 350, y: 20, s: .6, v: 1 },
      { k: 'signpost', x: 740, y: 192, text: 'Vương Thành' }
    ]
  });

  /* ===== MAP 5 — ĐƯỜNG TỚI VƯƠNG THÀNH ===== */
  R({
    level: 4, name: 'Đường Tới Vương Thành',
    story: 'Con đường núi uốn lượn qua những bậc vách đá và thác nước dẫn lên Vương Thành. Quân phòng thủ đóng trại trên các bậc thềm. Đây là tuyến chặn cuối cùng trước tường thành!',
    win: 'Đã giữ vững đường núi! Mở khoá Map 6 — Cổng Vương Thành.', lose: 'Quân quái vật đã leo tới chân thành... Hãy thử lại!',
    terrain: {
      cliffs: [{ pts: [[-10, 330], [130, 324]], h: 22 }, { pts: [[192, 322], [470, 330]], h: 22 }, { pts: [[530, 332], [770, 336]], h: 22 },
        { pts: [[-10, 178], [460, 174]], h: 22 }, { pts: [[520, 176], [598, 176]], h: 22 }, { pts: [[690, 172], [770, 180]], h: 22 }],
      rivers: [{ pts: [[490, -10], [488, 80], [492, 174]], w: 16 }, { pts: [[494, 200], [490, 260], [500, 330]], w: 16 }, { pts: [[502, 356], [510, 420], [520, 500]], w: 16 }],
      falls: [{ x: 492, y: 176, w: 16, h: 24 }, { x: 500, y: 332, w: 16, h: 24 }],
      lakes: [{ x: 560, y: 470, rx: 30, ry: 10 }]
    },
    route: [[700, 510], [700, 440], [600, 420], [480, 430], [360, 420], [250, 400], [160, 360], [158, 300], [230, 262], [350, 270], [470, 250], [580, 250], [646, 210], [640, 150], [540, 112], [420, 100], [330, 80], [300, -30]],
    spots: [[630, 372], [380, 370], [100, 410], [250, 215], [420, 205], [580, 205], [700, 120], [160, 228]],
    props: [
      { k: 'tent', x: 690, y: 296 }, { k: 'tent', x: 730, y: 270, s: .85 }, { k: 'campfire', x: 700, y: 318 }, { k: 'banner', x: 660, y: 300 }, { k: 'crates', x: 740, y: 310 },
      { k: 'tent', x: 70, y: 280, s: .9 }, { k: 'campfire', x: 96, y: 300 }, { k: 'barricade', x: 240, y: 300 },
      { k: 'wall', x: 0, y: 60, x2: 230, y2: 60, h: 26, banners: 1 }, { k: 'tower', x: 230, y: 66, s: .9 }, { k: 'wall', x: 380, y: 50, x2: 760, y2: 50, h: 26, banners: 1 }, { k: 'tower', x: 380, y: 56, s: .9 }, { k: 'tower', x: 600, y: 56, s: .8 },
      { k: 'pine', x: 30, y: 160, s: .78 }, { k: 'pine', x: 80, y: 150, s: .7 }, { k: 'pine', x: 300, y: 160, s: .72 }, { k: 'pine', x: 740, y: 160, s: .76 }, { k: 'pine', x: 20, y: 470, s: .8 }, { k: 'pine', x: 300, y: 470, s: .74 },
      { k: 'pine', x: 760, y: 470, s: .76 }, { k: 'tree', x: 40, y: 320, s: .7 }, { k: 'pine', x: 740, y: 320, s: .7 }, { k: 'rock', x: 420, y: 320, s: .7 }, 
      { k: 'bush', x: 560, y: 300 }, { k: 'bush', x: 130, y: 470 }, { k: 'rock', x: 400, y: 470, s: .7 }, { k: 'statue', x: 340, y: 150 }, { k: 'signpost', x: 360, y: 40, text: 'Vương Thành' }
    ]
  });

  /* ===== MAP 6 — CỔNG VƯƠNG THÀNH (BOSS) ===== */
  R({
    level: 5, name: 'Cổng Vương Thành',
    story: 'Kẻ giữ cổng của quân Hư Vô dẫn đại quân tới chân Vương Thành. Tường thành, hào nước và cầu treo là lá chắn cuối cùng của loài người. Hạ kẻ giữ cổng và giữ lấy Vương Thành!',
    win: 'Vương Thành đã được bảo vệ! Vương Quốc Người an toàn – mở vùng Rừng Cổ Elf.', lose: 'Cổng Vương Thành đã bị phá... Hãy thử lại!',
    terrain: {
      rivers: [{ pts: [[-20, 162], [200, 160], [380, 164], [560, 160], [780, 162]], w: 26 }]
    },
    route: [[60, 510], [60, 430], [160, 400], [280, 420], [400, 400], [520, 420], [640, 390], [690, 320], [620, 270], [500, 280], [380, 260], [260, 280], [150, 250], [140, 205], [260, 205], [380, 200], [380, 128]],
    spots: [[120, 340], [232, 346], [340, 340], [460, 340], [580, 340], [560, 215], [680, 215], [470, 220]],
    props: [
      { k: 'wall', x: -10, y: 128, x2: 300, y2: 128, h: 34, banners: 1, free: 1 }, { k: 'wall', x: 460, y: 128, x2: 770, y2: 128, h: 34, banners: 1, free: 1 },
      { k: 'tower', x: 60, y: 134, s: 1.05, free: 1 }, { k: 'tower', x: 180, y: 134, s: 1.05, free: 1 }, { k: 'tower', x: 580, y: 134, s: 1.05, free: 1 }, { k: 'tower', x: 700, y: 134, s: 1.05, free: 1 },
      { k: 'keep', x: 120, y: 70, s: .55, free: 1 }, { k: 'keep', x: 640, y: 70, s: .55, free: 1 },
      { k: 'humangate', x: 380, y: 140, h: 150, free: 1 },
      { k: 'statue', x: 40, y: 214 }, { k: 'statue', x: 740, y: 214 },
      { k: 'tent', x: 60, y: 300 }, { k: 'tent', x: 700, y: 440, s: .9 }, { k: 'campfire', x: 740, y: 466 }, { k: 'barricade', x: 200, y: 470 }, { k: 'barricade', x: 470, y: 470, flip: -1 },
      { k: 'crates', x: 110, y: 470 }, { k: 'barrels', x: 620, y: 470 }, 
      { k: 'tree', x: 20, y: 260, s: .7 }, { k: 'tree', x: 740, y: 260, s: .7, v: 1 }, { k: 'bush', x: 760, y: 360 }, { k: 'flowerbed', x: 380, y: 470 }
    ]
  });
})();
