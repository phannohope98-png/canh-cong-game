/* =========================================================
 * game.js – Vòng lặp, camera, cảm ứng, kinh tế, thắng/thua
 * ========================================================= */
(function () {
  const STEP = 1 / 60, TAP_TOL = 10;

  const Game = {
    canvas: null, ctx: null, wrap: null, dpr: 1, viewW: 1, viewH: 1,
    state: 'idle', paused: false, speed: 1, time: 0, raf: 0, last: 0,
    map: null, bg: null, levelIndex: 0, gold: 0, lives: 20, kills: 0, xp: 0,
    sel: null, heroSelected: false, rallyFor: null, drawList: [], pointers: new Map(), gesture: null,

    init() {
      this.canvas = document.getElementById('game-canvas'); this.ctx = this.canvas.getContext('2d');
      this.wrap = document.getElementById('game-wrap');
      window.addEventListener('resize', () => this.resize());
      document.addEventListener('visibilitychange', () => { if (document.hidden && this.state === 'playing') UI.openPause(); });
      this.setupInput();
    },

    /* ================= BẮT ĐẦU ================= */
    start(i) {
      this.levelIndex = i;
      UI.showScreen('screen-game');
      this.map = Level.build(i);
      const L = this.map.def;
      Effects.clear(); Combat.clear(); Enemies.clear(); Units.clear(); Loot.reset(); Items.dirty();
      Towers.init(this.map); Waves.init(L, i); Spells.reset();
      this.gold = L.gold; this.lives = CONFIG.match.lives; this.kills = 0; this.xp = 0;
      this.sel = null; this.heroSelected = false; this.rallyFor = null; this.speed = 1; this.time = 0; this.paused = false;
      this.measure();
      Camera.setup(this.map.W, this.map.H, this.viewW, this.viewH);
      Camera.x = this.map.W / 2; Camera.y = this.map.H / 2; Camera.clamp();
      if (window.Art3D && Art3D.setTheme) Art3D.setTheme(L.theme);
      this.renderBg();
      if (window.WaterFx) WaterFx.setup(this.map);
      if (window.Lights) Lights.setup(this.map);
      Units.addHero(this.map);
      this.state = 'playing';
      UI.setupBattle();
      AudioSys.playMusic('battle_' + L.theme); if (AudioSys.playAmbient) AudioSys.playAmbient(L.theme);
      UI.story(L.name + (L.sub ? ' · ' + L.sub : ''), L.story);
      if (!window.Battle3D && window.Art3D && Art3D.warm) setTimeout(() => { // dựng sẵn khung 3D của quái trong màn + anh hùng
        const keys = new Set(); L.waves.join(',').split(',').forEach(s => keys.add(s.split(':')[0].trim()));
        if (keys.has('darkKnight')) { keys.add('darkKnight2'); keys.add('shade'); } if (keys.has('darkLord')) { keys.add('darkLord3'); keys.add('goblin'); keys.add('orc'); }
        const list = [], h = Units.list.find(u => u.isHero); if (h) list.push({ key: h.art, scale: h.scale, modes: ['walk', 'atk', 'idle'] });
        keys.forEach(k => { const d = CONFIG.enemies[k], a = ArtChars[k]; if (d && a) list.push({ key: k, scale: d.radius / a.dr * (CONFIG.unitScale || 1), modes: ['idle', 'die'], dirs: true }); });
        Art3D.warmClear(); Art3D.warm(list);
      }, 300);
      if(window.PaintedMotion)PaintedMotion.warmFor([Progress.selectedHero(),'soldier','soldierShield','elf','mage','dwarf',...L.waves.join(',').split(',').map(p=>p.split(':')[0].trim())]);
      this.startLoop();
    },
    restart() { this.start(this.levelIndex); },
    quit() { this.state = 'idle'; this.stopLoop(); UI.closeRing(); },

    measure() {
      const r = this.wrap.getBoundingClientRect();
      this.viewW = Math.max(1, r.width); this.viewH = Math.max(1, r.height);
      if (Save.data.settings.qv !== 2) { Save.data.settings.qv = 2; Save.data.settings.q = 1; Save.save(); } // bản cũ hạ chất lượng vĩnh viễn → đặt lại
      this.q = this.q || (Save.data.settings.q || 1);
      this.dpr = Math.max(0.75, Math.min(2.5, window.devicePixelRatio || 1) * this.q);
      if (window.Painter) Painter.ppuCap = this.q >= 0.85 ? 4 : this.q >= 0.7 ? 2.8 : 2;
      this.canvas.width = Math.round(this.viewW * this.dpr); this.canvas.height = Math.round(this.viewH * this.dpr);
      this.canvas.style.width = this.viewW + 'px'; this.canvas.style.height = this.viewH + 'px';
    },
    renderBg() { this.bg = Level.renderBackground(this.map, Math.min(2.2, Math.max(Camera.minZoom * this.dpr * 1.5, Camera.maxZoom * this.dpr * 0.8))); },
    resize() {
      if (!this.map || this.state === 'idle') return;
      const old = Camera.minZoom; this.measure(); Camera.resize(this.viewW, this.viewH);
      if (Math.abs(Camera.minZoom - old) > 0.05) this.renderBg();
      UI.closeRing();
    },

    /* ================= VÒNG LẶP ================= */
    startLoop() { if (this.raf) return; this.last = performance.now(); const f = ts => { this.raf = requestAnimationFrame(f); this.frame(ts); }; this.raf = requestAnimationFrame(f); },
    stopLoop() { cancelAnimationFrame(this.raf); this.raf = 0; },
    /** tự giảm độ phân giải khi máy chậm (trung bình > 24 ms/khung trong ~1,5 s), nhớ lại cho lần sau */
    perfWatch(raw) {
      if (this.state !== 'playing' || this.paused || this.time < 5 || !(raw > 0 && raw < 250)) return; // bỏ qua lúc mới vào màn (đang dựng hình 3D)
      const p = this.perf || (this.perf = { sum: 0, n: 0 }); p.sum += raw; p.n++;
      if (p.n < 90) return;
      const avg = p.sum / p.n; p.sum = p.n = 0;
      if (avg > 30 && this.q > 0.55) { this.q = Math.max(0.55, +(this.q - 0.15).toFixed(2)); Save.data.settings.q = this.q; Save.save(); this.measure(); }
      else if (avg < 17 && this.q < 1) { this.q = Math.min(1, +(this.q + 0.15).toFixed(2)); Save.data.settings.q = this.q; Save.save(); this.measure(); } // máy chạy mượt lại → nét trở lại
    },
    frame(ts) {
      const raw = ts - this.last, dt = Math.min(0.1, Math.max(0, raw / 1000)); this.last = ts;
      this.perfWatch(raw);
      Camera.update(dt);
      if (this.state === 'playing' && !this.paused) {
        let sim = dt * this.speed * CONFIG.match.timeScale;
        while (sim > 1e-6 && this.state === 'playing') { const s = Math.min(STEP, sim); this.update(s); sim -= s; }
      } else if (this.state === 'ended') Effects.update(dt);
      this.render();
      UI.tick();
    },
    update(dt) {
      this.time += dt;
      Waves.update(dt); Spells.update(dt); Towers.update(dt); Units.update(dt); Enemies.update(dt); Combat.update(dt); Effects.update(dt); Loot.update(dt);
    },

    /* ================= VẼ ================= */
    render() {
      const c = this.ctx, d = this.dpr, z = Camera.zoom;
      c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#1a1420'; c.fillRect(0, 0, this.canvas.width, this.canvas.height);
      if (!this.map) return;
      Painter.res = z * d;
      c.setTransform(d * z, 0, 0, d * z, d * (this.viewW / 2 - (Camera.x - Effects.shakeX) * z), d * (this.viewH / 2 - (Camera.y - Effects.shakeY) * z));
      const live=window.Battle3D&&Battle3D.draw(c,this,performance.now()/1000);
      if(!live)c.drawImage(this.bg,0,0,this.map.W,this.map.H);
      if (window.WaterFx) WaterFx.draw(c, performance.now() / 1000);
      c.lineJoin = 'round'; c.lineCap = 'round';
      const t = this.time, now = performance.now() / 1000;
      // ô trống
      const showAll = this.sel && this.sel.kind === 'spot';
      for (const s of Towers.spots) if (!s.tower) Painter.plot(c, s.x, s.y, this.sel && this.sel.ref === s, now);
      Effects.drawDecals(c); Effects.drawCircles(c); Effects.drawCorpses(c);
      this.drawSelection(c, now);
      // theo chiều sâu
      const L = this.drawList; L.length = 0;
      for (const T of Towers.list) L.push(T);
      for (const u of Units.list) if (u.state !== 'dead') L.push(u);
      for (const e of Enemies.list) L.push(e);
      L.sort((a, b) => a.drawY - b.drawY);
      if(!live)for(const o of L)o.draw(c,t);
      Combat.draw(c); Spells.draw(c); Effects.draw(c); Loot.draw(c, now);
      if (window.Lights) Lights.draw(c, now);
      this.drawAtmosphere(c, now);
      for (const e of Enemies.list) e.drawBar(c);
      for (const u of Units.list) u.drawBar(c);
      for (const T of Towers.list) T.drawOverlay(c);
      Effects.drawTexts(c); Effects.drawComics(c);
      // Joystick movement uses the hero selection ring, without a destination flag.
    },

    /** Lớp không khí theo vùng: mây, đom đóm, tuyết, tàn lửa, bụi cát, hạt hỗn mang. Chỉ hình ảnh. */
    drawAtmosphere(c, t) {
      const W = this.map.W, H = this.map.H, T = this.map.def.theme;
      c.save();
      if (T === 'forest' || T === 'castle' || T === 'desert') { // bóng mây trôi chậm
        c.globalAlpha = T === 'desert' ? 0.07 : 0.1; c.fillStyle = '#1a2a40';
        for (let i = 0; i < 4; i++) {
          const x = ((t * 9 + i * 520) % (W + 600)) - 300, y = 160 + i * 220 + Math.sin(t * 0.1 + i) * 30;
          c.beginPath(); c.ellipse(x, y, 170, 54, -0.1, 0, Math.PI * 2); c.ellipse(x + 100, y + 20, 120, 42, -0.1, 0, Math.PI * 2); c.ellipse(x - 90, y + 24, 100, 34, -0.1, 0, Math.PI * 2); c.fill();
        }
      }
      c.globalCompositeOperation = 'lighter';
      const spec = { forest: ['#fff2b0', 22, 0.5, -6], castle: ['#fff2b0', 18, 0.45, -6], desert: ['#ffe0a0', 30, 0.4, 0], ice: ['#ffffff', 46, 0.8, 16], lava: ['#ff8a3a', 34, 0.8, -22], chaos: ['#d890ff', 36, 0.8, -8] }[T] || ['#fff2b0', 20, 0.5, -6];
      const n = spec[1];
      for (let i = 0; i < n; i++) {
        const sp = spec[3], x = ((i * 377.7 + Math.sin(t * 0.3 + i) * 40 + 3000 + (T === 'desert' ? t * 22 : 0)) % W);
        const y = (((i * 211.3 + t * sp * (0.6 + (i % 5) * 0.2)) % H) + H) % H;
        const a = 0.35 + 0.35 * Math.sin(t * 2 + i * 1.7);
        if (a <= 0.05) continue;
        c.globalAlpha = a * spec[2];
        ArtKit.glow(c, x, y, T === 'ice' ? 3 : T === 'lava' ? 4 : 5, spec[0], 1);
      }
      c.restore();
    },
    drawSelection(c, t) {
      const s = this.sel; if (!s || s.kind !== 'tower') return;
      const T = s.ref;
      if (T.def.kind !== 'barracks') ring(c, T.x, T.y, T.stats.range, T.def.color, t);
      else {
        ring(c, T.x, T.y, T.def.rallyRange, T.def.color, t);
        const p = this.map.paths[T.rallyPath].pointAt(T.rallyDist, {});
        drawRallyFlag(c, p.x, p.y, T.def.color, t);
      }
    },

    /* ================= KINH TẾ / SỰ KIỆN ================= */
    spend(n) { if (this.gold < n) { UI.toast('Không đủ vàng'); AudioSys.play('error'); return false; } this.gold -= n; return true; },
    addGold(n, x, y) { this.gold += n; if (x !== undefined) Effects.text(x, y, '+' + n, '#ffd84a', 18); },
    killEnemy(e) {
      if (!e.alive) return;
      e.alive = false; this.gold += e.reward; this.kills++; this.xp += e.reward;
      Effects.corpse(e.art || e.type, e.x, e.y + e.radius * 0.5, e.scale, e.face, e.flying, e.type === 'goblin');
      if (!e.flying && !/skeleton|deathKnight|mummy|Golem|treant|wraith/.test(e.type)) Effects.decal(e.x, e.y + e.radius * 0.5, e.radius * 1.1, /void/.test(e.type) ? 'goo' : 'blood');
      Effects.death(e.x, e.y - e.height * 0.4, e.boss ? '#c0303a' : '#a89a8a');
      Effects.coin(e.x, e.y - e.height, e.reward);
      AudioSys.play('death');
      Items.onKill(e);
      if (e.boss) { Effects.explosion(e.x, e.y, 140); Effects.shake(14, 0.7); }
    },
    enemyEscaped(e) {
      e.alive = false; this.lives = Math.max(0, this.lives - e.def.lives);
      UI.lifeLost(); AudioSys.play('life'); Effects.shake(5, 0.2);
      if (this.lives <= 0) this.defeat();
    },
    onBoss(e) { UI.bossWarning(e.name); AudioSys.play('boss'); Effects.shake(10, 0.8); Camera.focus(e.x, e.y); },

    /* ================= HÀNH ĐỘNG ================= */
    toggleSpeed() { this.speed = this.speed === 1 ? 2 : 1; },
    pause() { if (this.state === 'playing') this.paused = true; },
    resume() { this.paused = false; this.last = performance.now(); },
    castHero() {
      const h = Units.hero; if (!h) return;
      if (h.state === 'dead') { UI.toast('Anh hùng đang hồi sinh'); return; }
      if (h.skillCd > 0) { UI.toast('Kỹ năng đang hồi: ' + Math.ceil(h.skillCd) + 's'); return; }
      Hero.cast(h);
    },
    selectHero() {
      const h = Units.hero; if (!h || h.state === 'dead') { UI.toast('Anh hùng đang hồi sinh'); return; }
      this.heroSelected = !this.heroSelected; this.sel = null; this.rallyFor = null; UI.closeRing();
      if (this.heroSelected) { UI.tip('Chạm lên bản đồ để di chuyển anh hùng'); Camera.focus(h.x, h.y); } else UI.tip(null);
    },

    /* ================= THẮNG / THUA ================= */
    victory() {
      if (this.state !== 'playing') return;
      this.state = 'ended';
      const S = CONFIG.match.stars, stars = this.lives >= S.three ? 3 : this.lives >= S.two ? 2 : 1;
      const newStars = Progress.recordWin(this.levelIndex, stars);
      const hid = Progress.selectedHero(), lv0 = Progress.heroLevel(hid); Progress.addHeroXp(hid, this.xp); const coins = Math.floor(this.xp * 0.3 + 50 + stars * 20); Progress.addCoins(coins); const lvUp = Progress.heroLevel(hid) > lv0;
      Effects.confetti(Camera.x, Camera.y - 200, 500); AudioSys.play('victory');
      setTimeout(() => UI.showResult({ win: true, stars, newStars, xp: this.xp, lvUp, coins, loot: Loot.found.slice() }), 1100);
    },
    defeat() {
      if (this.state !== 'playing') return;
      this.state = 'ended';
      const xp = Math.floor(this.xp * 0.5), coins = Math.floor(this.xp * 0.25); Progress.addHeroXp(Progress.selectedHero(), xp); Progress.addCoins(coins);
      AudioSys.play('defeat'); Effects.shake(14, 0.8);
      setTimeout(() => UI.showResult({ win: false, xp, coins, loot: Loot.found.slice() }), 1000);
    },

    /* ================= CẢM ỨNG ================= */
    setupInput() {
      const c = this.canvas;
      c.addEventListener('pointerdown', e => {
        AudioSys.unlock(); c.setPointerCapture && c.setPointerCapture(e.pointerId);
        this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, t: performance.now() });
        Camera.vx = Camera.vy = 0; Camera.target = null;
        if (this.pointers.size === 2) { const [a, b] = [...this.pointers.values()]; this.gesture = { pinch: true, d: Math.hypot(a.x - b.x, a.y - b.y) }; }
        else this.gesture = { pinch: false, moved: false };
      });
      c.addEventListener('pointermove', e => {
        const p = this.pointers.get(e.pointerId); if (!p) return;
        const r = c.getBoundingClientRect(), dx = e.clientX - p.x, dy = e.clientY - p.y;
        if (this.gesture && this.gesture.pinch && this.pointers.size >= 2) {
          p.x = e.clientX; p.y = e.clientY;
          const [a, b] = [...this.pointers.values()], d = Math.hypot(a.x - b.x, a.y - b.y);
          Camera.zoomAt((a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top, d / (this.gesture.d || d)); this.gesture.d = d; UI.closeRing();
          return;
        }
        if (Math.hypot(e.clientX - p.sx, e.clientY - p.sy) > TAP_TOL) { if (!this.gesture.moved) UI.closeRing(); this.gesture.moved = true; }
        if (this.gesture.moved) { Camera.pan(dx, dy); const dt = Math.max(8, performance.now() - p.t); Camera.vx = dx / dt * 1000; Camera.vy = dy / dt * 1000; }
        p.x = e.clientX; p.y = e.clientY; p.t = performance.now();
      });
      const end = e => {
        const p = this.pointers.get(e.pointerId); if (!p) return;
        this.pointers.delete(e.pointerId);
        const g = this.gesture;
        if (g && !g.pinch && !g.moved && e.type === 'pointerup') {
          Camera.vx = Camera.vy = 0;
          const r = c.getBoundingClientRect(), w = Camera.toWorld(e.clientX - r.left, e.clientY - r.top);
          this.onTap(w.x, w.y);
        }
        if (performance.now() - p.t > 60) { Camera.vx = Camera.vy = 0; }
        if (this.pointers.size === 0) this.gesture = null;
      };
      c.addEventListener('pointerup', end); c.addEventListener('pointercancel', end);
      c.addEventListener('wheel', e => { e.preventDefault(); const r = c.getBoundingClientRect(); Camera.zoomAt(e.clientX - r.left, e.clientY - r.top, e.deltaY < 0 ? 1.12 : 1 / 1.12); UI.closeRing(); }, { passive: false });
      c.addEventListener('contextmenu', e => e.preventDefault());
    },

    onTap(x, y) {
      if (this.state !== 'playing') return;
      const h = Units.hero;
      if (Spells.armed && Spells.tap(x, y)) return;
      // dời điểm tập kết
      if (this.rallyFor) {
        const r = Towers.setRally(this.rallyFor, x, y);
        if (r === 'ok') { AudioSys.play('click'); this.rallyFor = null; this.sel = null; UI.tip(null); }
        else { UI.toast(r === 'far' ? 'Quá xa doanh trại' : 'Hãy chạm lên con đường'); AudioSys.play('error'); }
        return;
      }
      // chạm anh hùng
      if (h && h.state !== 'dead' && Math.hypot(h.x - x, h.y - 18 - y) < 30) { this.selectHero(); return; }
      const spot = Towers.spotAt(x, y);
      if (this.heroSelected && !spot) {
        Hero.moveHero(h, Math.max(20, Math.min(this.map.W - 130, x)), Math.max(40, Math.min(this.map.H - 50, y)));
        this.heroSelected = false; UI.tip(null); AudioSys.play('click'); return;
      }
      this.heroSelected = false;
      if (spot) {
        const sel = spot.tower ? { kind: 'tower', ref: spot.tower } : { kind: 'spot', ref: spot };
        if (this.sel && this.sel.ref === sel.ref) { this.sel = null; UI.closeRing(); return; }
        this.sel = sel; UI.openRing(sel); AudioSys.play('click'); return;
      }
      this.sel = null; UI.closeRing(); UI.tip(null);
    }
  };

  function ring(c, x, y, r, col, t) {
    c.save(); c.fillStyle = ArtKit.alpha(col, 0.14); c.beginPath(); c.ellipse(x, y, r, r / 1.15, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = 'rgba(255,255,255,0.85)'; c.lineWidth = 2.6; c.setLineDash([12, 8]); c.lineDashOffset = -t * 24; c.stroke(); c.setLineDash([]); c.restore();
  }
  function drawRallyFlag(c, x, y, col, t) {
    ArtKit.shadow(c, x, y + 3, 12, 4, 0.4);
    ArtKit.limb(c, x, y + 3, x, y - 32, 2.6, '#6b4426');
    ArtKit.cel(c, g => { g.moveTo(x + 1, y - 32); for (let i = 1; i <= 6; i++) { const f = i / 6; g.lineTo(x + 1 + f * 20, y - 32 + Math.sin(t * 6 + f * 3) * 2.4 * f); } for (let i = 6; i >= 0; i--) { const f = i / 6; g.lineTo(x + 1 + f * 17, y - 21 + Math.sin(t * 6 + f * 3 + 0.4) * 2.4 * f); } g.closePath(); }, col, { s: 1.6, h: 0.8, lw: 1.8 });
  }
  window.Game = Game; window.drawRallyFlag = drawRallyFlag;
})();
