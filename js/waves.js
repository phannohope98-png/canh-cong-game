/* =========================================================
 * waves.js – Đợt quái
 * ready → (bấm nút đầu lâu) → spawning → waiting (đếm ngược đợt sau,
 * có thể gọi sớm để nhận thưởng) → ... → done → thắng khi hết quái.
 * ========================================================= */
(function () {
  function parse(str, nPaths) {
    const q = []; let t = 0, k = 0;
    str.split(',').map(s => s.trim()).filter(Boolean).forEach((part, gi) => {
      const [main, pth] = part.split('/'), [type, cnt, iv] = main.split(':');
      const n = parseInt(cnt, 10) || 1, rawGap = iv ? parseFloat(iv) : (CONFIG.spawnInterval[type] || 1);
      const gap = Math.max((CONFIG.enemies[type]?.radius || 12) >= 20 ? 3.2 : 1.8, rawGap * 1.3);
      if (gi > 0) t += 1.6;
      for (let i = 0; i < n; i++) { q.push({ time: t, type, path: pth !== undefined ? Math.min(nPaths - 1, +pth) : (k++ % nPaths) }); t += gap; }
    });
    return q;
  }
  const Waves = {
    list: [], index: -1, state: 'ready', timer: 0, queue: [], qi: 0, t: 0, hpMul: 1,
    init(level, levelIndex) {
      const n = (level.bg && level.ipaths ? level.ipaths : level.paths).length;
      this.list = level.waves.map(w => parse(w, n));
      this.index = -1; this.state = 'ready'; this.timer = 0; this.queue = []; this.qi = 0; this.t = 0;
      this.hpMul = level.hpMul || 1; // campaign.js tính sẵn độ khó theo vùng & số thứ tự map
    },
    get total() { return this.list.length; },
    get shown() { return Math.max(1, Math.min(this.total, this.index + 1)); },
    get canCall() { return (this.state === 'ready' || this.state === 'waiting') && this.index < this.total - 1; },
    /** Các loại quái của đợt sắp tới (để hiện thẻ giới thiệu) */
    upcomingTypes() { const w = this.list[this.index + 1]; return w ? [...new Set(w.map(e => e.type))] : []; },
    upcomingPaths() { const w = this.list[this.index + 1]; return w ? [...new Set(w.map(e => e.path))] : [0]; },
    callNext() {
      if (!this.canCall) return;
      if (this.state === 'waiting' && this.timer > 0) {
        const bonus = Math.floor(this.timer * CONFIG.match.earlyCallBonusPerSec);
        if (bonus > 0) { Game.addGold(bonus); UI.toast('+' + bonus + ' vàng gọi sớm'); }
      }
      this.index++; this.queue = this.list[this.index]; this.qi = 0; this.t = 0; this.state = 'spawning';
      AudioSys.play('wave'); if (UI.tutStep) UI.tutStep('wave'); UI.banner('Đợt ' + (this.index + 1) + ' / ' + this.total);
      const fresh = [...new Set(this.queue.map(q => q.type))].filter(t => !Save.data.seen[t]);
      if (fresh.length) setTimeout(() => { if (Game.state === 'playing') UI.introEnemies(fresh); }, 600);
    },
    update(dt) {
      if (this.state === 'spawning') {
        this.t += dt;
        while (this.qi < this.queue.length && this.queue[this.qi].time <= this.t) { const s = this.queue[this.qi++]; Enemies.spawn(s.type, s.path, this.hpMul); }
        if (this.qi >= this.queue.length) {
          if (this.index >= this.total - 1) this.state = 'done';
          else { this.state = 'waiting'; this.timer = CONFIG.match.nextWaveDelay; }
        }
      } else if (this.state === 'waiting') {
        this.timer -= dt;
        if (this.timer <= 0) this.callNext();
      } else if (this.state === 'done' && Enemies.list.length === 0) { this.state = 'over'; Game.victory(); }
    }
  };
  window.Waves = Waves;
})();
