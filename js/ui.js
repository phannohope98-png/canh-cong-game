/* =========================================================
 * ui.js – Giao diện (màn hình NGANG): menu, chiến dịch, anh hùng & trang bị,
 * nâng cấp, bách khoa (bảng nhân vật), cài đặt, HUD, menu vòng tròn, lớp phủ.
 * ========================================================= */
(function () {
  const $ = id => document.getElementById(id);
  const I = n => Icon(n);
  const K = ArtKit;
  const fmt = n => Math.floor(n).toLocaleString('vi-VN');
  const CHAR = { barracks: 'soldier', archer: 'elf', artillery: 'dwarf', mage: 'mage', orc: 'orct' }, IMG = { soldier: 'human', elf: 'elf', dwarf: 'dwarf', mage: 'witch', orct: 'orc' };   // trụ → nhân vật
  const GEARTXT = it => (it.dmg ? `+${Math.round(it.dmg * 100)}% sát thương ` : '') + (it.rate ? `+${Math.round(it.rate * 100)}% tốc đánh ` : '') + (it.hp ? `+${Math.round(it.hp * 100)}% máu ` : '') + (it.spd ? `+${Math.round(it.spd * 100)}% tốc chạy` : '');

  const UI = {
    current: 'screen-menu', hud: null, ringSel: null, codexTab: 'towers', overlayCb: null, viewHero: null,

    init() {
      Icon.hydrate();
      document.addEventListener('click', e => {
        const el = e.target.closest('[data-action]'); if (!el || el.disabled) return;
        AudioSys.unlock(); AudioSys.play('click'); this.tryLandscape(); this.act(el.dataset.action, el.dataset, el);
      });
      window.addEventListener('resize', () => { if (this.current === 'screen-menu') this.paintMenu(); if (this.current === 'screen-map') this.renderMap(); });
      this.showScreen('screen-menu');
    },

    /** Cố gắng khoá màn hình ngang (chỉ chạy được sau khi chạm, trên Android/Chrome) */
    tryLandscape() {
      if (this._lk) return; this._lk = true;
      try { const so = screen.orientation; if (so && so.lock) so.lock('landscape').catch(() => {}); } catch (e) {}
    },
    toggleFullscreen() {
      const d = document, el = d.documentElement;
      try { if (!d.fullscreenElement && el.requestFullscreen) el.requestFullscreen().then(() => { try { screen.orientation.lock('landscape').catch(() => {}); } catch (e) {} }).catch(() => {}); else if (d.exitFullscreen) d.exitFullscreen(); } catch (e) {}
    },

    act(a, d) {
      switch (a) {
        case 'open': this.showScreen(d.target); break;
        case 'back': this.showScreen('screen-menu'); break;
        case 'fullscreen': this.toggleFullscreen(); break;
        case 'level': this.levelCard(+d.index); break;
        case 'region': this.regionCard(+d.r); break;
        case 'region-locked': this.toast('Hạ boss map 6 của vùng trước để mở vùng này'); AudioSys.play('error'); break;
        case 'map-locked': this.toast('Thắng map trước để mở map này'); AudioSys.play('error'); break;
        case 'start-level': this.closeOverlay(); Game.start(+d.index); break;
        case 'codex-tab': this.codexTab = d.tab; document.querySelectorAll('.tab').forEach(t => t.classList.toggle('on', t.dataset.tab === d.tab)); this.renderCodex(); break;
        case 'hero-pick': this.viewHero = d.id; if (Save.data.heroes[d.id]) Progress.selectHero(d.id); this.renderHeroes(); break;
        case 'hero-unlock': if (Progress.unlockHero(d.id)) { Progress.selectHero(d.id); AudioSys.play('build'); this.toast('Đã mở khoá anh hùng!'); } else { AudioSys.play('error'); this.toast('Không đủ Xu'); } this.renderHeroes(); break;
        case 'gear': {
          const hid = this.viewHero || Progress.selectedHero(), slot = d.slot, tier = +d.tier, own = Save.data.gear[slot], eq = Save.data.equip[hid][slot];
          if (!Save.data.heroes[hid]) { this.toast('Hãy mở khoá anh hùng trước'); break; }
          if (tier <= own) Progress.setGear(hid, slot, eq === tier ? 0 : tier);
          else if (tier === own + 1) { if (Progress.buyGear(slot)) { AudioSys.play('build'); this.toast('Đã mua & trang bị!'); } else { AudioSys.play('error'); this.toast('Không đủ Xu'); } }
          this.renderHeroes(); break;
        }
        case 'toggle': { const s = Save.data.settings; s[d.key] = !s[d.key]; Save.save(); if (d.key === 'music') AudioSys.setMusic(s.music); if (d.key === 'sound') AudioSys.setSound(s.sound); if (d.key === 'art3d' && window.Art3D) Art3D.setEnabled(s.art3d); this.renderSettings(); if (this.pauseOpen) this.openPause(); break; }
        case 'reset': this.confirm('Xoá toàn bộ tiến trình? Sao, Xu, anh hùng và trang bị sẽ mất hết.', () => { Save.reset(); this.toast('Đã xoá dữ liệu'); this.showScreen('screen-menu'); }); break;
        case 'overlay-ok': { const cb = this.overlayCb; this.overlayCb = null; this.closeOverlay(); if (cb) cb(); break; }
        // trong trận
        case 'speed': Game.toggleSpeed(); break;
        case 'pause': this.openPause(); break;
        case 'resume': this.closeOverlay(); Game.resume(); this.pauseOpen = false; break;
        case 'restart': this.closeOverlay(); this.pauseOpen = false; Game.restart(); break;
        case 'to-map': this.closeOverlay(); this.pauseOpen = false; Game.quit(); this.showScreen('screen-map'); break;
        case 'next-level': this.closeOverlay(); Game.start(Math.min(CONFIG.levels.length - 1, Game.levelIndex + 1)); break;
        case 'hero': Game.selectHero(); break;
        case 'skill': Game.castHero(); break;
        case 'spell': Spells.arm(d.k); break;
        case 'call-wave': Waves.callNext(); break;
        case 'ring-build': { const s = this.ringSel && this.ringSel.ref; if (s && Towers.build(s, d.type)) { Game.sel = null; this.closeRing(); } else this.openRing(this.ringSel); break; }
        case 'ring-up': { const T = this.ringSel.ref; if (Towers.upgrade(T)) this.openRing(this.ringSel); break; }
        case 'ring-sell': { const T = this.ringSel.ref; Towers.sell(T); Game.sel = null; this.closeRing(); break; }
        case 'it-tower': this.itemTower = d.t; this.itemSlot = null; this.itemSel = null; this.renderItems(); break;
        case 'it-slot': { const s2 = +d.s; this.itemSlot = this.itemSlot === s2 ? null : s2; const eq = Items.equippedAt(this.itemTower, s2); this.itemSel = this.itemSlot === null ? null : eq ? eq.u : null; this.renderItems(); break; }
        case 'it-all': this.itemSlot = null; this.renderItems(); break;
        case 'it-sel': this.itemSel = +d.u; this.renderItems(); break;
        case 'it-equip': { const it = Items.find(+d.u); if (it && Items.equip(it.u)) { AudioSys.play('build'); this.toast('Đã gắn ' + Items.name(it) + ' vào ' + Items.slotName(it.s).toLowerCase() + ' trụ ' + Items.towerName(it.t)); } this.renderItems(); break; }
        case 'it-unequip': { const it = Items.find(+d.u); if (it) { Items.unequip(it.t, it.s); AudioSys.play('sell'); } this.renderItems(); break; }
        case 'it-fuse': { const n = Items.fuse(+d.u); if (n) { this.itemSel = n.u; AudioSys.play('holy'); this.toast('Ghép thành công: ' + Items.name(n)); } else { AudioSys.play('error'); this.toast('Cần 3 món giống nhau'); } this.renderItems(); break; }
        case 'it-salvage': { const it = Items.find(+d.u); if (it) this.confirm('Phân rã <b>' + Items.name(it) + '</b> lấy ' + Items.rar(it).salvage + ' Xu?', () => { Items.salvage(it.u); this.itemSel = null; AudioSys.play('sell'); this.refreshCoins(); this.renderItems(); }); break; }
        case 'it-auto': Items.autoEquip(this.itemTower); AudioSys.play('build'); this.toast('Đã gắn đồ tốt nhất'); this.renderItems(); break;
        case 'it-junk': { let c = 0, n = 0; Items.bag().slice().forEach(it => { if (it.r === 0 && !Items.isEquipped(it)) { c += Items.salvage(it.u, true); n++; } }); Save.save(); Items.dirty(); this.toast(n ? 'Phân rã ' + n + ' món tệ: +' + c + ' Xu' : 'Không có đồ tệ thừa'); this.refreshCoins(); this.renderItems(); break; }
        case 'ring-rally': { Game.rallyFor = this.ringSel.ref; this.closeRing(true); this.tip('Chạm lên con đường để đặt điểm tập kết'); break; }
      }
    },

    refreshCoins() { document.querySelectorAll('.coin-count').forEach(e => { e.textContent = fmt(Save.data.coins); }); },
    showScreen(id) {
      document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === id));
      this.current = id;
      if (id !== 'screen-game') { AudioSys.playMusic('menu'); if (AudioSys.stopAmbient) AudioSys.stopAmbient(); }
      document.querySelectorAll('.star-count').forEach(e => { e.textContent = Progress.totalStars(); });
      this.refreshCoins();
      ({ 'screen-menu': () => this.paintMenu(), 'screen-map': () => this.renderMap(), 'screen-heroes': () => { this.viewHero = Progress.selectedHero(); this.renderHeroes(); },
        'screen-codex': () => this.renderCodex(), 'screen-items': () => this.renderItems(), 'screen-settings': () => this.renderSettings() }[id] || (() => {}))();
    },

    /* ================= MENU CHÍNH: cảnh nền vẽ từ chính game ================= */
    paintMenu() {
      $('menu-stars').textContent = Progress.totalStars() + '/' + CONFIG.levels.length * 3;
      const c = $('menu-bg'), r = c.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
      if (r.width < 10) return;
      c.width = Math.round(r.width * dpr); c.height = Math.round(r.height * dpr);
      const g = c.getContext('2d'), map = this._menuMap || (this._menuMap = Level.build(0));
      const z = Math.max(r.width / map.W, r.height / map.H) * dpr;
      const bg = this._menuBg || (this._menuBg = Level.renderBackground(map, Math.min(2, z)));
      cancelAnimationFrame(this._menuFrame);
      let last=0;
      const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const render=(now)=>{
        if(this.current!=='screen-menu')return;
        this._menuFrame=reduced?null:requestAnimationFrame(render);
        if(now-last<33)return;last=now;
        const t=now*.001, drift=reduced?0:Math.sin(t*.13)*12;
        g.setTransform(z,0,0,z,(c.width-map.W*z)/2+drift,(c.height-map.H*z)/2);
        if(!(window.Battle3D&&Battle3D.drawTitle(g,map,t))){
          g.drawImage(bg,0,0,map.W,map.H);g.setTransform(dpr,0,0,dpr,0,0);Painter.res=dpr;
          const baseX=r.width*.25,baseY=r.height*.57,size=Math.min(5.5,r.height/95);
          for(const [type,dx,dy,phase,sc]of [['lyra',-65,-12,.3,.88],['selene',65,-18,.65,.88],['aldric',0,12,0,1]])Painter.char(g,ArtChars.heroKey(type),baseX+dx,baseY+dy,size*sc,1,'idle',reduced?phase:t+phase*2.618);
        }
        g.setTransform(1,0,0,1,0,0);
        // Warm motes and drifting leaves give depth without covering the controls.
        for(let i=0;i<22;i++){
          const x=((i*.618*c.width+t*(5+i%4)*dpr)%c.width),y=(i*.371*c.height+Math.sin(t*.7+i)*14*dpr)%c.height;
          g.globalAlpha=.18+.17*Math.sin(t+i);g.fillStyle=i%4?'#ffe1a0':'#b9d6b1';g.beginPath();g.ellipse(x,y,(i%3+1)*dpr,dpr,Math.sin(t*.3+i),0,Math.PI*2);g.fill();
        }g.globalAlpha=1;
      };render(performance.now());

    },

    /* ================= BẢN ĐỒ CHIẾN DỊCH: 6 vùng, mỗi vùng 6 map (map 6 = boss) ================= */
    regionOpen(ri) { return Save.data.unlocked > ri * CONFIG.mapsPerRegion; },
    renderMap() {
      const NR = CONFIG.regions.length, NM = CONFIG.mapsPerRegion, LW = 1200;
      const wrap = $('map-scroll'), inner = $('map-inner'), H = wrap.clientHeight || 300, W = Math.max(wrap.clientWidth || 700, Math.round(H * 2.4)), dpr = Math.min(2, window.devicePixelRatio || 1);
      inner.style.width = W + 'px'; inner.style.height = H + 'px';
      const c = $('world-map'); c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
      const g = c.getContext('2d'); g.scale(W * dpr / LW, H * dpr / 500);
      const nodes = [[9, 74], [25, 38], [41, 72], [58, 34], [75, 70], [91, 36]];
      if (!(window.Map3D && Map3D.paintWorld(g, 1200, 500, nodes))) paintWorld(g, 1200, 500);
      g.setLineDash([2, 12]); g.lineCap = 'round'; g.strokeStyle = 'rgba(40,20,30,.8)'; g.lineWidth = 6;
      g.beginPath(); nodes.forEach((n, i) => { const x = n[0] * LW / 100, y = n[1] * 5; i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke();
      g.strokeStyle = '#fff3c8'; g.lineWidth = 3.4; g.stroke(); g.setLineDash([]);
      const un = Save.data.unlocked;
      let cur = 0;
      $('map-nodes').innerHTML = CONFIG.regions.map((R, ri) => {
        const open = this.regionOpen(ri), lv = CONFIG.levels.slice(ri * NM, ri * NM + NM), done = lv.filter((_, m) => Save.data.stars[ri * NM + m]).length;
        const st = lv.reduce((a, _, m) => a + (Save.data.stars[ri * NM + m] || 0), 0), cleared = done >= NM, next = open && !cleared;
        if (open) cur = ri;
        const [x, y] = nodes[ri];
        return `<button class="node region ${open ? '' : 'locked'} ${cleared ? 'done' : ''} ${next ? 'next' : ''}" style="left:${x}%;top:${y}%" data-action="${open ? 'region' : 'region-locked'}" data-r="${ri}">
          <span class="flag" style="background-image:url(${window.ART_BASE || "assets/art/"}map_${ri * NM}.jpg)">${open ? '' : I("lock")}</span>
          <span class="rprog">${open ? done + '/' + NM : 'Khoá'}</span>
          <span class="nname">${R.name}</span><span class="ndiff">${I('star')} ${st}/${NM * 3} · Boss: ${CONFIG.enemies[R.boss].name}</span></button>`;
      }).join('');
      requestAnimationFrame(() => { const n = $('map-nodes').children[cur]; if (n) wrap.scrollLeft = n.offsetLeft - wrap.clientWidth * 0.5; });
    },
    /** bảng 6 map của 1 vùng: phải thắng map trước mới mở map sau, map 6 là boss */
    regionCard(ri) {
      const NM = CONFIG.mapsPerRegion, R = CONFIG.regions[ri], un = Save.data.unlocked;
      const cells = CONFIG.levels.slice(ri * NM, ri * NM + NM).map((L, m) => {
        const i = ri * NM + m, st = Save.data.stars[i] || 0, locked = i >= un, next = i === un - 1 && !st;
        return `<button class="rmap ${locked ? 'locked' : ''} ${st ? 'done' : ''} ${next ? 'next' : ''} ${L.boss ? 'boss' : ''}" data-action="${locked ? 'map-locked' : 'level'}" data-index="${i}">
          <span class="rthumb" style="background-image:url(${window.ART_BASE || "assets/art/"}map_${i}.jpg)"><b>${m + 1}</b>${L.boss ? `<em>BOSS</em>` : ''}${locked ? I('lock') : ''}</span>
          <span class="rname">${L.sub}</span><span class="nstars">${[1, 2, 3].map(k => `<span class="${k <= st ? 'got' : ''}">${I('star')}</span>`).join('')}</span></button>`;
      }).join('');
      this.overlay(`<div class="ribbon">${R.name}</div><p class="rinfo">Thắng map trước để mở map sau · Map 6: Boss <b>${CONFIG.enemies[R.boss].name}</b> – hạ boss để mở vùng tiếp theo</p>
        <div class="rgrid">${cells}</div><div class="row" style="margin-top:8px"><button class="gbtn gray sm" data-action="overlay-ok">Đóng</button></div>`);
      $('overlay-panel').classList.add('wide');
    },
    levelCard(i) {
      const L = CONFIG.levels[i], st = Save.data.stars[i] || 0; $('overlay-panel').classList.remove('wide');
      const foes = [...new Set(L.waves.join(',').split(',').map(s => s.split(':')[0].trim()))];
      const hid = Progress.selectedHero(), H = CONFIG.heroes[hid];
      this.overlay(`<div class="ribbon">${L.name} · ${L.sub}</div>
        <div class="lvcard"><div><img class="lvimg" src="${window.ART_BASE || "assets/art/"}map_${i}.jpg" alt="">
          <p>${L.story}</p>
          <div class="row" style="margin:6px 0">${foes.map(f => `<canvas class="portrait dark" data-char="${f}" width="120" height="120" style="width:44px;height:44px;border-radius:12px"></canvas>`).join('')}</div>
          <p style="font-size:13px">${L.waves.length} đợt quái · ${(L.ipaths || L.paths).length > 1 ? (L.ipaths || L.paths).length + ' cửa vào · ' : ''}${L.gold} vàng khởi đầu · Độ khó: ${L.diff}</p>
        </div><div>
          <div class="big-stars">${[1, 2, 3].map(k => `<span class="s ${k <= st ? 'got' : ''}">${I('star')}</span>`).join('')}</div>
          <p style="font-size:13px">Anh hùng: <b>${H.name}</b> (cấp ${Progress.heroLevel(hid)})</p>
          <div class="row" style="margin-top:8px"><button class="gbtn gray sm" data-action="overlay-ok">Đóng</button><button class="gbtn sm" data-action="open-heroes-ov" onclick="UI.closeOverlay();UI.showScreen('screen-heroes')">${I('crown')}<span>Anh hùng</span></button><button class="gbtn green sm" data-action="start-level" data-index="${i}">${I('sword')}<span>Chiến đấu</span></button></div>
        </div></div>`);
    },

    /* ================= ANH HÙNG & TRANG BỊ ================= */
    renderHeroes() {
      const hid = this.viewHero || Progress.selectedHero(), sel = Progress.selectedHero();
      $('hero-roster').innerHTML = Object.keys(CONFIG.heroes).map(id => {
        const H = CONFIG.heroes[id], own = Save.data.heroes[id];
        return `<button class="roster-item ${hid === id ? 'on' : ''} ${own ? '' : 'locked'}" data-action="hero-pick" data-id="${id}"><canvas data-hero="${id}" width="108" height="132"></canvas>
          <div><b>${H.name}</b><small>${H.race}${own ? ' · Cấp ' + Progress.heroLevel(id) : ''}</small>${sel === id ? '<small style="color:#2a7a1a">✔ Đang dùng</small>' : ''}</div>${own ? '' : `<span class="lk">${I('lock')}</span>`}</button>`;
      }).join('');
      const H = CONFIG.heroes[hid], own = Save.data.heroes[hid], lv = Progress.heroLevel(hid), prog = Progress.heroXpProgress(hid), m = 1 + (lv - 1) * CONFIG.heroPerLevel, gm = Progress.gearMods(hid);
      const hp = Math.round(H.hp * m * (1 + gm.hp)), d0 = Math.round(H.damage[0] * m * (1 + gm.dmg)), d1 = Math.round(H.damage[1] * m * (1 + gm.dmg)), ar = Math.round(Math.min(0.8, H.armor + gm.arm) * 100), sp = Math.round(H.speed * (1 + gm.spd));
      const tiers = Progress.wornTiers(hid), E = CONFIG.equipment;
      const slots = Progress.SLOTS.map((s, si) => {
        const own2 = Save.data.gear[s], eq = Save.data.equip[hid][s];
        const GI = { weapon: "sword", gloves: "glove", armor: "armor", boots: "boot" }, GEARICO = (s, it) => { const u = window.Icons3D && Icons3D.url(GI[s], it.col, it.glow); return u ? `<img class="gico" src="${u}" alt="">` : `<span class="sw" style="background:${it.col}"></span>`; };
        return `<div class="slot"><h4>${I(E[s].icon)}${E[s].name}</h4><div class="items">${E[s].items.map((it, k) => {
          const t = k + 1, owned = t <= own2, isEq = eq === t, canBuy = t === own2 + 1;
          return `<button class="gitem ${isEq ? 'eq' : ''} ${canBuy ? 'buy' : ''} ${!owned && !canBuy ? 'lock' : ''}" data-action="gear" data-slot="${s}" data-tier="${t}">${GEARICO(s, it)}<span>${it.name}</span><span>${GEARTXT(it)}</span>${owned ? (isEq ? '<span>Đang mặc</span>' : '<span>Đã có</span>') : `<span>${I('coin')} ${it.cost}</span>`}</button>`;
        }).join('')}</div></div>`;
      }).join('');
      $('hero-detail').innerHTML = `<div class="card"><div class="hd-top"><div class="big"><canvas data-hero="${hid}" data-full="1" width="300" height="360"></canvas></div>
        <div class="hd-info"><h3>${H.name}</h3><div class="sub">${H.title} · ${H.role}</div>
        <div class="bar"><i style="width:${Math.round(prog * 100)}%"></i><span>${own ? (lv >= CONFIG.heroMax ? 'Cấp tối đa' : 'Cấp ' + lv + ' · KN ' + Math.round(prog * 100) + '%') : 'Chưa mở khoá'}</span></div>
        <div class="stat-row"><span class="chip">${I('heart')}${hp}</span><span class="chip">${I('sword')}${d0}-${d1}</span><span class="chip">${I('shield')}${ar}%</span><span class="chip">${I('fast')}${sp}</span>${H.range ? `<span class="chip">${I('target')}Bắn xa ${H.range}</span>` : '<span class="chip">Cận chiến</span>'}</div>
        <p class="sub" style="margin:6px 0 0"><b>${H.skill.name}:</b> ${H.desc}</p>
        <div class="row" style="justify-content:flex-start;margin-top:8px">${own ? (sel === hid ? '<span class="chip" style="background:#a6f05a">✔ Đang dùng trong trận</span>' : `<button class="gbtn green sm" data-action="hero-pick" data-id="${hid}">Chọn anh hùng này</button>`)
          : `<button class="gbtn sm ${Save.data.coins >= H.unlock ? '' : 'off'}" data-action="hero-unlock" data-id="${hid}">${I('lock')}<span>Mở khoá</span><span class="price">${I('coin')}${H.unlock}</span></button>`}</div></div></div>
        <div class="slots">${slots}</div>
        <p class="sub" style="margin:8px 0 0;color:#d8c8f0">Xu kiếm được sau mỗi trận. Trang bị mặc lên người anh hùng và đổi hình dạng nhân vật.</p></div>`;
      this.paintCanvases($('screen-heroes'), tiers);
      this.refreshCoins();
    },

    /* ================= KHO ĐỒ: 6 vị trí lắp trên mỗi trụ ================= */
    itemIcon(it, big) {
      const u = Items.iconUrl(it), R = Items.rar(it);
      return `<span class="iico r${it.r} ${big ? 'big' : ''}" style="--rc:${R.col}">${u ? `<img src="${u}" alt="">` : I('gem')}</span>`;
    },
    renderItems() {
      const t = this.itemTower || (this.itemTower = 'barracks'), G = CONFIG.items, M = Items.mods(t), slot = this.itemSlot == null ? null : this.itemSlot;
      const tabs = Items.TYPES.map(k => `<button class="tab ${k === t ? 'on' : ''}" data-action="it-tower" data-t="${k}">${CONFIG.towers[k].name}</button>`).join('');
      const POS = [[50, 7], [50, 29], [50, 52], [12, 44], [88, 44], [50, 84]]; // vị trí nút trên hình trụ (%)
      const slots = G.slots.map((S, i) => {
        const it = M.list[i], gd = G.gear[t][i];
        return `<button class="islot ${[0, 1, 2, 5].includes(i) ? "c" : ""} ${it ? "has r" + it.r : ""} ${slot === i ? "on" : ""}" style="left:${POS[i][0]}%;top:${POS[i][1]}%;${it ? '--rc:' + Items.rar(it).col : ''}" data-action="it-slot" data-s="${i}">${it ? this.itemIcon(it) : `<span class="iempty">+</span>`}<small>${S.name}<br><b>${gd.name}</b></small></button>`;
      }).join('');
      const bonus = M.list.filter(Boolean).map(it => `<li style="--rc:${Items.rar(it).col}"><b>${Items.def(it).name}</b> ${Items.statText(it)}</li>`).join('') || '<li>Chưa gắn đồ nào</li>';
      $('items-tower').innerHTML = `<div class="tabs it-tabs">${tabs}</div>
        <div class="card it-stage-card"><div class="it-stage"><canvas data-tower="${t}" data-tier="4" data-fit="0.8" width="320" height="340"></canvas>${slots}</div>
        <div class="it-rule"><b>Quy tắc lắp:</b> mỗi trụ có 6 vị trí cố định. Mỗi vị trí chỉ nhận đúng 1 loại đồ của đúng trụ đó (vd. <b>Cờ</b> lắp trên cột trụ Người, <b>pha lê</b> đặt vào ổ phép của trụ Phù Thủy). Đồ gắn tác dụng cho mọi trụ ${CONFIG.towers[t].name} trong trận.</div>
        <ul class="it-bonus">${bonus}</ul>
        <div class="row"><button class="gbtn green sm" data-action="it-auto">${I('up')}<span>Gắn đồ tốt nhất</span></button></div></div>`;
      const list = Items.sortBag().filter(it => it.t === t && (slot === null || it.s === slot));
      const sel = this.itemSel ? Items.find(this.itemSel) : null;
      let det = '';
      if (sel) {
        const eq = Items.isEquipped(sel), R = Items.rar(sel), cur = Items.equippedAt(sel.t, sel.s), nf = Items.fuseList(sel).length;
        det = `<div class="card it-detail" style="--rc:${R.col}">${this.itemIcon(sel, true)}<div class="it-dbody"><h3>${Items.name(sel)}</h3>
          <div class="sub"><span class="rtag" style="background:${R.col}">${R.name}</span> Trụ ${Items.towerName(sel.t)} · vị trí <b>${Items.slotName(sel.s)}</b></div>
          <p class="it-stat">${Items.statText(sel)}</p><p class="sub">${Items.lore(sel)}</p>
          ${!eq && cur ? `<p class="sub">Đang gắn: ${Items.name(cur)} (${Items.statText(cur)})</p>` : ''}
          <div class="row it-acts">${eq ? `<button class="gbtn gray sm" data-action="it-unequip" data-u="${sel.u}"><span>Tháo ra</span></button>` : `<button class="gbtn green sm" data-action="it-equip" data-u="${sel.u}"><span>Gắn vào trụ</span></button>`}
          ${sel.r < 4 ? `<button class="gbtn sm ${nf >= 3 ? '' : 'off'}" data-action="it-fuse" data-u="${sel.u}"><span>Ghép 3→1 (${Math.min(nf, 3)}/3)</span></button>` : ''}
          ${sel.r < 5 ? `<button class="gbtn red sm" data-action="it-salvage" data-u="${sel.u}"><span>Phân rã</span><span class="price">${I('coin')}${R.salvage}</span></button>` : `<span class="sub">Di vật độc nhất · Giữ trong bộ sưu tập</span>`}</div></div></div>`;
      }
      $('items-bag').innerHTML = det + `<div class="it-head"><b>${slot === null ? 'Đồ của trụ ' + CONFIG.towers[t].name : 'Đồ cho ' + G.slots[slot].name.toLowerCase() + ': ' + G.gear[t][slot].name}</b> <small>(${list.length} món · túi ${Items.bag().length}/${G.bag})</small>
          ${slot !== null ? '<button class="gbtn gray sm" data-action="it-all"><span>Tất cả</span></button>' : ''}<button class="gbtn gray sm" data-action="it-junk"><span>Phân rã đồ Tệ</span></button></div>
        <div class="it-grid">${list.map(it => `<button class="it-card ${it.u === this.itemSel ? 'on' : ''} ${Items.isEquipped(it) ? 'eq' : ''}" style="--rc:${Items.rar(it).col}" data-action="it-sel" data-u="${it.u}">${this.itemIcon(it)}<span class="nm">${Items.name(it)}</span><span class="st">${Items.statText(it)}</span><span class="ps">${Items.slotName(it.s)}${Items.isEquipped(it) ? ' · ĐANG GẮN' : ''}</span></button>`).join('') || '<p class="it-empty">Chưa có đồ. Diệt quái để nhặt đồ rơi – quái càng to tỉ lệ rơi càng cao, boss luôn rơi đồ Cao / Cao cấp / Huyền thoại.</p>'}</div>
        <div class="it-legend">${G.rarities.map(r => `<span style="--rc:${r.col}"><i></i>${r.name}</span>`).join('')}</div>`;
      this.paintCanvases($('items-tower')); Icon.hydrate($('screen-items')); this.refreshCoins();
    },

    /* ================= BÁCH KHOA ================= */
    renderCodex() {
      let html;
      if (this.codexTab === 'enemies') {
        html = '<div class="grid">' + Object.keys(CONFIG.enemies).map(k => {
          const e = CONFIG.enemies[k], seen = Save.data.seen[k];
          return `<div class="card codex-item ${seen ? '' : 'locked'}"><canvas class="portrait dark" data-char="${k}" width="192" height="192"></canvas>
            <h3 style="font-size:16px">${seen ? e.name : '???'}</h3>${seen ? `<div class="stat-row" style="justify-content:center"><span class="chip">${I('heart')}${e.hp}</span><span class="chip">${I('shield')}${Math.round(e.armor * 100)}%</span>${e.flying ? `<span class="chip">Bay</span>` : ''}</div><p>${e.desc}</p>` : '<p>Chưa gặp</p>'}</div>`;
        }).join('') + '</div>';
      } else if (this.codexTab === 'heroes') {
        html = '<div class="sheets">' + Object.keys(CONFIG.heroes).map(id => {
          const H = CONFIG.heroes[id];
          return `<div class="sheet" style="--c1:#ffd23a;--c2:#3a2858;--c3:#ffe9a8"><div class="sheet-head"><canvas data-hero="${id}" data-head="1" width="108" height="108"></canvas><div><h3>${H.name.toUpperCase()}</h3><small>${H.title.toUpperCase()} · ${H.role.toUpperCase()}</small></div></div>
            <div class="sheet-sec">TRANG BỊ: VŨ KHÍ · GĂNG TAY · GIÁP · GIÀY</div><div class="sheet-row">${[[0, 0, 0, 0], [1, 1, 1, 1], [2, 2, 2, 2], [3, 3, 3, 3]].map((tv, i) => `<div class="cell"><canvas data-hero="${id}" data-tiers="${tv.join('')}" data-full="1" width="180" height="225"></canvas><span>${['Cơ bản', 'Bậc 1', 'Bậc 2', 'Bậc 3'][i]}</span></div>`).join('')}</div>
            <div class="sheet-desc"><b>${H.skill.name}</b> – ${H.desc}</div></div>`;
        }).join('') + '</div>';
      } else {
        html = '<div class="sheets">' + Object.keys(CONFIG.towers).map(k => {
          const T = CONFIG.towers[k], ch = CHAR[k], pal = T.palette, dk = K.shade(pal[0], -0.55);
          return `<div class="sheet" style="--c1:${pal[2]};--c2:${dk};--c3:${pal[4]}"><div class="sheet-head"><canvas data-char="${ch}4" data-head="1" data-zoom="1.3" width="108" height="108"></canvas><div><h3>${T.name.toUpperCase()}</h3><small>${T.role}</small></div></div>
            <div class="sheet-sec">NHÂN VẬT (4 CẤP)</div><div class="sheet-row">${[1, 2, 3, 4].map(t => `<div class="cell"><canvas data-char="${ch}${t}" data-zoom="0.95" width="150" height="170"></canvas><span>Cấp ${t}</span></div>`).join('')}</div>
            <div class="sheet-sec">ĐỘNG TÁC</div><div class="sheet-row">${[['idle', 'Đứng'], ['walk', 'Đi'], ['atk', 'Tấn công'], ['back', 'Sau lưng']].map(([m, n]) => `<div class="cell"><canvas data-char="${ch}3${m === 'back' ? '_b' : ''}" data-mode="${m === 'back' ? 'walk' : m}" data-zoom="0.95" width="150" height="170"></canvas><span>${n}</span></div>`).join('')}</div>
            <div class="sheet-sec">TRỤ CÔNG TRÌNH (4 CẤP)</div><div class="sheet-row">${[1, 2, 3, 4].map(t => `<div class="cell"><canvas data-tower="${k}" data-tier="${t}" width="150" height="190"></canvas><span>${T.tierNames[t - 1]}</span></div>`).join('')}</div>
            <div class="sheet-sec">VŨ KHÍ & TRANG BỊ</div><div class="sheet-gear">${T.gear.map(x => `<b>${x}</b>`).join('')}</div>
            <div class="sheet-pal">BẢNG MÀU ${pal.map(c => `<i style="background:${c}"></i>`).join('')}</div>
            <div class="sheet-desc">${T.desc}</div></div>`;
        }).join('') + '</div>';
      }
      $('codex-list').innerHTML = html; this.paintCanvases($('codex-list'));
    },

    renderSettings() {
      const s = Save.data.settings, row = (k, label) => `<div class="setting"><span>${label}</span><button class="switch ${s[k] ? 'on' : ''}" data-action="toggle" data-key="${k}"><i></i></button></div>`;
      $('settings-list').innerHTML = `<div class="card">${row('music', 'Nhạc nền')}${row('sound', 'Âm thanh')}${row('shake', 'Rung màn hình')}${window.Art3D ? row('art3d', 'Hiệu ứng 3D (tắt nếu máy yếu)') : ''}</div>
        <div class="card"><h3>Cách chơi</h3><p class="sub" style="line-height:1.55;font-size:14px">• Chạm ô đất có cọc gỗ để chọn 1 trong 4 trụ: Người (2 kiếm sĩ), Elf (bắn nhanh), Phù thủy (tầm xa, sát thương lan), Người Lùn (đại bác tầm xa nhất, nổ lan).<br>• Chạm trụ để nâng cấp (4 cấp đổi hình) hoặc bán.<br>• Kéo để di chuyển bản đồ, chụm 2 ngón để phóng to.<br>• Chạm anh hùng rồi chạm bản đồ để di chuyển; nút kỹ năng ở bên cạnh.<br>• Chạm đầu lâu đỏ để gọi đợt quái, gọi sớm được thưởng vàng.<br>• Tướng mở theo cấp hành trình; cấp tướng nhận điểm cho ba nhánh phát triển.<br>• Chiến dịch có 5 thế giới của Người, Elf, Phù Thủy, Người Lùn và Orc; mỗi thế giới 6 chặng; map 6 là boss – hạ boss mới sang vùng mới.<br>• Quái chết có thể rơi đồ (6 bậc: Tệ, Bình thường, Cao, Cao cấp, Huyền thoại, Thần Tích). Vào <b>Kho đồ</b> để gắn đồ vào 6 vị trí của mỗi trụ; ghép 3 món giống nhau lên bậc kế tiếp, tối đa Huyền Thoại. Thần Tích chỉ tìm được ở boss đủ điều kiện.</p></div>
        <div class="row"><button class="gbtn red sm" data-action="reset">${I('trash')}<span>Xoá dữ liệu</span></button></div>`;
    },

    paintCanvases(root, tiers) {
      root.querySelectorAll('canvas[data-char]').forEach(c => Painter.charPortrait(c, c.dataset.char, { zoom: +(c.dataset.zoom || 0.95), head: !!c.dataset.head, mode: c.dataset.mode }));
      root.querySelectorAll('canvas[data-hero]').forEach(c => {
        const id = c.dataset.hero, tv = c.dataset.tiers ? c.dataset.tiers.split('').map(Number) : (c.dataset.full || root.id === 'screen-heroes' ? Progress.wornTiers(id) : [0, 0, 0, 0]);
        const key = ArtChars.heroKey(id, c.closest('#hero-roster') ? [0, 0, 0, 0] : tv);
        Painter.charPortrait(c, key, c.dataset.head ? { zoom: 1.5, head: true } : { zoom: 1 });
      });
      root.querySelectorAll('canvas[data-tower]').forEach(c => Painter.towerPortrait(c, c.dataset.tower, +(c.dataset.tier || 1), +(c.dataset.fit || 0.82)));
    },

    /* ================= TRONG TRẬN ================= */
    setupBattle() {
      this.closeRing(); this.closeOverlay(); this.tip(null);
      const H = Units.hero;
      Painter.charPortrait($('hero-canvas'), H.art, { zoom: 1.55, head: true });
      $('hero-lvl').textContent = H.level;
      $('hero-skill').innerHTML = I(H.heroDef.skill.icon) + '<i class="cd" id="skill-cd"></i>';
      $('hero-skill').title = H.heroDef.skill.name;
      this.hud = { lives: $('hud-lives'), gold: $('hud-gold'), wave: $('hud-wave'), speed: $('btn-speed'), hp: $('hero-hp'), face: $('hero-face'), dead: $('hero-dead'), skill: $('hero-skill'), cd: $('skill-cd'), boss: $('boss-bar'), bossFill: $('boss-fill'), waves: $('wave-btns'), cache: {},
        spells: { reinforce: { el: $('spell-reinforce'), cd: $('spell-reinforce').querySelector('.cd') }, meteor: { el: $('spell-meteor'), cd: $('spell-meteor').querySelector('.cd') } } };
      this.hud.waves.innerHTML = '';
    },
    tick() {
      const h = this.hud; if (!h || this.current !== 'screen-game') return;
      const c = h.cache, set = (k, v, fn) => { if (c[k] !== v) { c[k] = v; fn(v); } };
      set('lives', Game.lives, v => h.lives.textContent = v);
      set('gold', Math.floor(Game.gold), v => h.gold.textContent = fmt(v));
      set('wave', Waves.shown + '/' + Waves.total, v => h.wave.textContent = v);
      set('speed', Game.speed, v => { h.speed.querySelector('em').textContent = v + 'x'; h.speed.classList.toggle('on', v === 2); });
      const H = Units.hero;
      if (H) {
        set('hp', Math.round(H.state === 'dead' ? 0 : H.hp / H.maxHp * 100), v => h.hp.style.strokeDashoffset = 182.2 * (1 - v / 100));
        set('dead', H.state === 'dead' ? Math.ceil(H.respawnT) : 0, v => { h.face.classList.toggle('dead', v > 0); h.dead.textContent = v || ''; });
        set('sel', Game.heroSelected, v => h.face.classList.toggle('sel', v));
        const p = H.skillCd > 0 ? Math.round(H.skillCd / H.heroDef.skill.cooldown * 100) : 0;
        set('cd', p, v => { h.cd.style.setProperty('--p', v + '%'); h.skill.classList.toggle('ready', v === 0); });
      }
      if (window.Spells) for (const k in Spells.DEF) {
        const b = h.spells[k]; if (!b) continue;
        set('sp' + k, Math.round(Spells.cd[k] / Spells.DEF[k].cd * 100), v => { b.cd.style.setProperty('--p', v + '%'); b.el.classList.toggle('ready', v === 0); });
        set('arm' + k, Spells.armed === k, v => b.el.classList.toggle('armed', v));
      }
      const B = Enemies.boss();
      set('boss', !!B, v => h.boss.classList.toggle('hidden', !v));
      if (B) { $('boss-name').textContent = B.name; h.bossFill.style.width = Math.max(0, B.hp / B.maxHp * 100) + '%'; }
      this.updateWaveButtons();
      if (this.ringSel) this.placeRing();
    },

    /** Nút đầu lâu ở cửa vào: gọi đợt quái */
    updateWaveButtons() {
      const box = this.hud.waves, can = Game.state === 'playing' && Waves.canCall;
      // Routes share one entry before the fork; a single call starts all scheduled lanes.
      const paths = can ? Waves.upcomingPaths().slice(0, 1) : [];
      const key = can ? paths.join(',') + Waves.state : '';
      if (box.dataset.k !== key) {
        box.dataset.k = key;
        box.innerHTML = paths.map(i => `<button class="wave-btn" data-action="call-wave" data-p="${i}">${I('skull')}<svg class="ring" viewBox="0 0 76 76"><circle cx="38" cy="38" r="35"/></svg><b>${Waves.state === 'ready' ? 'Bắt đầu!' : ''}</b></button>`).join('');
      }
      if (!can) return;
      const vw = Game.viewW, vh = Game.viewH;
      box.querySelectorAll('.wave-btn').forEach(b => {
        const p = Game.map.paths[+b.dataset.p].pointAt(Game.map.entry ? Game.map.entry[+b.dataset.p] : 70, {}), s = Camera.toScreen(p.x, p.y);
        const sy = Math.max(110, Math.min(vh - (s.x < 300 ? 150 : 70), s.y)); b.style.left = Math.max(40, Math.min(vw - 44, s.x + 26)) + 'px'; b.style.top = sy + 'px';
        const circ = b.querySelector('circle');
        if (Waves.state === 'waiting') { circ.style.strokeDashoffset = 220 * (1 - Waves.timer / CONFIG.match.nextWaveDelay); b.querySelector('b').textContent = '+' + Math.floor(Waves.timer * CONFIG.match.earlyCallBonusPerSec); }
        else circ.style.strokeDashoffset = 0;
      });
    },

    /* ---------- Menu vòng tròn: 5 nhân vật = 5 trụ ---------- */
    openRing(sel) {
      this.ringSel = sel; const r = $('ring'); r.classList.remove('hidden');
      const tag = (cost) => `<span class="tag">${I('coin')}${cost}</span>`;
      if (sel.kind === 'spot') {
        const keys = Object.keys(CONFIG.towers), R = 66;
        r.innerHTML = keys.map((t, i) => {
          const T = CONFIG.towers[t], cost = T.cost[0], a = (-90 + i * 360 / keys.length) * Math.PI / 180, x = Math.round(Math.cos(a) * R), y = Math.round(Math.sin(a) * R);
          return `<button class="ring-item ${Game.gold < cost ? 'poor' : ''}" title="${T.name}" style="left:${x}px;top:${y}px;animation-delay:${i * 30}ms" data-action="ring-build" data-type="${t}"><canvas data-char="${CHAR[t]}2" data-head="1" data-zoom="1.5" width="120" height="120"></canvas>${tag(cost)}</button>`;
        }).join('') + `<div class="ring-title" style="top:-126px">Xây trụ · ${keys.length} nhân vật</div>`;
      } else {
        const T = sel.ref, c = T.nextCost;
        r.innerHTML = `<div class="ring-title">${T.def.name}<small>${T.def.tierNames[T.level - 1]} · Cấp ${T.level}</small></div>`
          + (c === null ? `<div class="ring-item act max" style="left:0;top:-64px">${I('crown')}</div>`
            : `<button class="ring-item ${Game.gold < c ? 'poor' : ''}" style="left:0;top:-64px" data-action="ring-up"><canvas data-char="${CHAR[T.type]}${T.level + 1}" data-head="1" data-zoom="1.5" width="120" height="120"></canvas>${tag(c)}</button>`)
          + `<button class="ring-item act sell" style="left:0;top:64px" data-action="ring-sell">${I('coin')}<span class="tag">+${T.refund}</span></button>`
          + (T.def.kind === 'barracks' ? `<button class="ring-item act rally" style="left:-64px;top:0" data-action="ring-rally">${I('flag')}</button>` : '');
      }
      this.paintCanvases(r); this.placeRing();
    },
    placeRing() {
      const s = this.ringSel; if (!s) return;
      const p = Camera.toScreen(s.ref.x, s.ref.y - 20), r = $('ring');
      // giữ menu trong màn hình
      const x = Math.max(100, Math.min(Game.viewW - 100, p.x)), y = Math.max(134, Math.min(Game.viewH - 72, p.y));
      r.style.left = x + 'px'; r.style.top = y + 'px';
      r.querySelectorAll('[data-action="ring-build"]').forEach(b => b.classList.toggle('poor', Game.gold < CONFIG.towers[b.dataset.type].cost[0]));
      const up = r.querySelector('[data-action="ring-up"]'); if (up) up.classList.toggle('poor', Game.gold < s.ref.nextCost);
    },
    closeRing(keepSel) { this.ringSel = null; $('ring').classList.add('hidden'); $('ring').innerHTML = ''; if (!keepSel && Game.sel) Game.sel = null; },

    /* ---------- Lớp phủ ---------- */
    overlay(html, cb) { this.overlayCb = cb || null; $('overlay-panel').classList.remove('wide'); $('overlay-panel').innerHTML = html; this.paintCanvases($('overlay-panel')); Icon.hydrate($('overlay-panel')); $('overlay').classList.remove('hidden'); },
    closeOverlay() { $('overlay').classList.add('hidden'); },
    confirm(msg, yes) { this.overlay(`<div class="ribbon">Xác nhận</div><p style="margin-top:8px">${msg}</p><div class="row" style="margin-top:10px"><button class="gbtn gray sm" onclick="UI.closeOverlay()">Huỷ</button><button class="gbtn red sm" data-action="overlay-ok">Đồng ý</button></div>`, yes); },
    story(name, text) {
      Game.paused = true;
      this.overlay(`<div class="ribbon green">${name}</div><p style="margin-top:8px">${text}</p><p style="font-size:13px">Chạm ô đất để xây trụ. Bấm <b>đầu lâu đỏ</b> ở cửa vào khi đã sẵn sàng.</p><div class="row" style="margin-top:8px"><button class="gbtn green sm" data-action="overlay-ok"><span>Vào trận</span></button></div>`, () => Game.resume());
    },
    introEnemies(types) {
      const t = types.shift(); if (!t) { Game.resume(); return; }
      const e = CONFIG.enemies[t]; Save.data.seen[t] = true; Save.save(); Game.paused = true;
      this.overlay(`<div class="ribbon blue">Quái mới!</div><div class="lvcard" style="align-items:center;margin-top:4px"><canvas class="intro-art portrait dark" data-char="${t}" width="300" height="300"></canvas><div>
        <h3>${e.name}</h3><div class="stat-row"><span class="chip">${I('heart')}${e.hp}</span><span class="chip">${I('shield')}Giáp ${Math.round(e.armor * 100)}%</span><span class="chip">${I('fast')}${e.speed}</span>${e.flying ? '<span class="chip">Bay</span>' : ''}</div>
        <p>${e.desc}</p><button class="gbtn green sm" data-action="overlay-ok"><span>Đã rõ!</span></button></div></div>`, () => this.introEnemies(types));
    },
    openPause() {
      if (Game.state !== 'playing') return; Game.pause(); this.pauseOpen = true;
      const s = Save.data.settings;
      this.overlay(`<div class="ribbon">Tạm dừng</div><div class="row" style="margin-top:8px">
        <button class="gbtn green sm" data-action="resume">${I('play')}<span>Tiếp tục</span></button>
        <button class="gbtn sm" data-action="restart">${I('restart')}<span>Chơi lại</span></button>
        <button class="gbtn blue sm" data-action="to-map">${I('map')}<span>Bản đồ</span></button></div>
        <div class="row" style="margin-top:12px"><button class="rbtn sm ${s.music ? 'on' : ''}" data-action="toggle" data-key="music">${I('music')}</button><button class="rbtn sm ${s.sound ? 'on' : ''}" data-action="toggle" data-key="sound">${I('sound')}</button></div>`);
    },
    showResult(r) {
      if (this.current !== 'screen-game') return;
      this.closeRing();
      const hasNext = Game.levelIndex < CONFIG.levels.length - 1 && r.win;
      this.overlay(r.win ? `<div class="ribbon green">Chiến thắng!</div>
          <div class="big-stars" style="margin-top:8px">${[1, 2, 3].map(k => `<span class="s ${k <= r.stars ? 'got' : ''}" style="animation-delay:${k * 0.25}s">${I('star')}</span>`).join('')}</div>
          <div><span class="reward">${I('heart')} ${Game.lives} mạng</span><span class="reward">${I('exp')} +${r.xp} KN</span><span class="reward">${I('coin')} +${r.coins} Xu</span>${r.newStars ? `<span class="reward">${I('star')} +${r.newStars} sao</span>` : ''}</div>
          ${r.lvUp ? `<p class="levelup">Anh hùng lên cấp ${Progress.heroLevel()}!</p>` : ''}${CONFIG.levels[Game.levelIndex].boss && CONFIG.regions[CONFIG.levels[Game.levelIndex].region + 1] ? `<p class="levelup">Đã mở vùng mới: ${CONFIG.regions[CONFIG.levels[Game.levelIndex].region + 1].name}!</p>` : ''}${this.lootHtml(r.loot)}
          <div class="row" style="margin-top:8px"><button class="rbtn sm" data-action="restart">${I('restart')}</button><button class="rbtn sm" data-action="to-map">${I('map')}</button>
          ${hasNext ? `<button class="gbtn green sm" data-action="next-level"><span>Màn tiếp</span>${I('play')}</button>` : ''}</div>`
        : `<div class="ribbon">Thất bại</div><p style="margin-top:10px">Quân bóng tối đã tràn qua cổng thành...</p>
          <div><span class="reward">${I('exp')} +${r.xp} KN</span><span class="reward">${I('coin')} +${r.coins} Xu</span></div>${this.lootHtml(r.loot)}
          <p style="font-size:13px">Mẹo: dùng sao nâng cấp trụ, mua trang bị cho anh hùng, xây Phù thủy để hạ quái giáp dày.</p>
          <div class="row" style="margin-top:8px"><button class="rbtn sm" data-action="to-map">${I('map')}</button><button class="gbtn green sm" data-action="restart">${I('restart')}<span>Thử lại</span></button></div>`);
    },

    lootHtml(loot) {
      if (!loot || !loot.length) return '';
      return '<div class="loot-row"><small>Đồ nhặt được (đã vào Kho đồ):</small>' + loot.map(it => `<span class="loot-it" style="--rc:${Items.rar(it).col}" title="${Items.statText(it)}">${this.itemIcon(it)}<b>${Items.name(it)}</b></span>`).join('') + '</div>';
    },
    /* ---------- Thông báo ---------- */
    toast(m) { const t = $('toast'); t.textContent = m; t.classList.add('show'); clearTimeout(this._tt); this._tt = setTimeout(() => t.classList.remove('show'), 1700); },
    tip(m) { const t = $('tip'); if (!m) { t.classList.add('hidden'); return; } t.textContent = m; t.classList.remove('hidden'); },
    banner(text, boss) { const b = $('banner'); b.textContent = text; b.className = boss ? 'boss' : ''; void b.offsetWidth; b.classList.add('show'); },
    bossWarning(name) { this.banner(name + '!', true); },
    lifeLost() { const f = $('life-flash'); f.classList.remove('show'); void f.offsetWidth; f.classList.add('show'); const p = $('hud-lives').parentElement; p.classList.remove('bump'); void p.offsetWidth; p.classList.add('bump'); }
  };

  /* ---------- Bản đồ thế giới (ngang): 6 vùng đất ---------- */
  function paintWorld(g, W, H) {
    const cols = ['#6fb040', '#8aae58', '#e6bf74', '#dcebf6', '#4a3a3a', '#2a1850'];
    const gr = g.createLinearGradient(0, 0, W, 0); cols.forEach((c, i) => gr.addColorStop((i + 0.5) / cols.length, c)); gr.addColorStop(0, cols[0]); gr.addColorStop(1, cols[5]);
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    const rnd = K.seeded(11), R = W / 6;
    const blot = (x, y, r, c, a) => { const q = g.createRadialGradient(x, y, 0, x, y, r); q.addColorStop(0, K.alpha(c, a)); q.addColorStop(1, K.alpha(c, 0)); g.fillStyle = q; g.fillRect(x - r, y - r, r * 2, r * 2); };
    for (let i = 0; i < 60; i++) blot(rnd() * W, rnd() * H, 30 + rnd() * 60, rnd() < 0.5 ? '#ffffff' : '#000000', 0.08);
    // sông / dung nham / nước
    g.lineCap = 'round'; g.strokeStyle = '#d8c08a'; g.lineWidth = 26; g.beginPath(); g.moveTo(R * 0.7, -10); g.bezierCurveTo(R * 0.9, 150, R * 0.6, 300, R * 1.0, 510); g.stroke(); g.strokeStyle = '#46a6dc'; g.lineWidth = 18; g.stroke();
    g.strokeStyle = '#ff6a1a'; g.lineWidth = 16; g.beginPath(); g.moveTo(R * 4.4, -10); g.bezierCurveTo(R * 4.7, 160, R * 4.3, 330, R * 4.6, 510); g.stroke(); g.strokeStyle = '#ffd04a'; g.lineWidth = 6; g.stroke();
    const at = (reg, n, fn) => { for (let i = 0; i < n; i++) { const x = reg * R + 14 + rnd() * (R - 28), y = 24 + rnd() * (H - 40); g.save(); g.translate(x, y); fn(); g.restore(); } };
    at(0, 38, () => { K.circ(g, 0, -8, 9, rnd() < 0.5 ? '#4a8a32' : '#5a9a3a'); K.circ(g, 5, -11, 8, '#6aaa42'); });
    for (let i = 0; i < 4; i++) { g.save(); g.translate(R * 1 + 20 + i * 44, 60 + (i % 2) * 250); K.rr(g, -12, -34, 24, 36, 2, '#c8c2d4', { s: 4, h: 1.5 }); K.poly(g, [-15, -34, 0, -52, 15, -34], '#3d6fc0', { s: 3, h: 1 }); g.restore(); }
    at(1, 24, () => { K.circ(g, 0, -8, 8, '#4a8a32'); K.circ(g, 4, -10, 7, '#6aaa42'); });
    at(2, 22, () => { K.rr(g, -3, -16, 6, 18, 3, '#5a9a3a', { s: 1.4, h: 0.8 }); });
    for (let i = 0; i < 6; i++) { g.save(); g.translate(R * 2 + 20 + rnd() * (R - 40), 60 + rnd() * 380); K.poly(g, [-24, 0, -4, -22, 22, 0], '#b8703c', { s: 4, h: 1.4 }); g.restore(); }
    at(3, 30, () => { K.poly(g, [-9, 0, 0, -22, 9, 0], '#3f7a52', { s: 2, h: 1 }); K.flat(g, [-3, -15, 0, -22, 3, -15], '#fff'); });
    for (const [x, y, s] of [[R * 3 + 50, 90, 1.5], [R * 3 + 120, 330, 1.2]]) { g.save(); g.translate(x, y); g.scale(s, s); K.poly(g, [-40, 0, 0, -60, 40, 0], '#8aa0b8', { s: 8, h: 3 }); K.flat(g, [-14, -40, 0, -60, 14, -40, 6, -36, 0, -42, -6, -36], '#fff'); g.restore(); }
    g.save(); g.translate(R * 4 + 90, 250); K.poly(g, [-60, 0, -14, -70, 14, -70, 60, 0], '#4a3a36', { s: 8, h: 2 }); K.glow(g, 0, -70, 50, '#ff5a1a', 0.9); g.restore();
    at(4, 22, () => { K.poly(g, [-7, 0, -3, -20, 8, 0], '#4a3a3c', { s: 2, h: 1 }); });
    for (let i = 0; i < 40; i++) K.dot(g, R * 5 + rnd() * R, rnd() * H, 0.6 + rnd() * 1.2, 'rgba(255,255,255,.7)');
    at(5, 14, () => { K.poly(g, [-5, 0, -7, -14, -1, -26, 4, 0], '#a060f0', { s: 2, h: 1.2, light: '#f0d8ff' }); });
    g.save(); g.translate(R * 5 + 90, 250); K.glow(g, 0, 0, 80, '#b070ff', 0.8); g.strokeStyle = '#e0b0ff'; g.lineWidth = 5; g.beginPath(); g.ellipse(0, 0, 26, 40, 0, 0, Math.PI * 2); g.stroke(); g.restore();
    const v = g.createRadialGradient(W / 2, H / 2, W * 0.3, W / 2, H / 2, W * 0.65); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(20,10,30,.4)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
  }

  window.UI = UI;
})();
