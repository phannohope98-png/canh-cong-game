/* =========================================================
 * main.js – Khởi động game
 * ========================================================= */
(function () {
  function boot() {
    Save.load();
    const s = Save.data.settings;
    AudioSys.musicOn = s.music;
    AudioSys.soundOn = s.sound;
    if (window.Art3D) Art3D.setEnabled(s.art3d !== false);
    Game.init();
    UI.init();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (UI.current === 'screen-menu') UI.paintMenu(); });

    // Chặn nhấn đúp để phóng to & kéo trang trên iOS
    document.addEventListener('dblclick', e => e.preventDefault(), { passive: false });
    document.addEventListener('gesturestart', e => e.preventDefault());

    // PWA: đăng ký service worker (chỉ chạy qua http/https, không chạy file://)
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('service-worker.js').catch(err => console.warn('SW lỗi:', err));
    }
  }

  window.addEventListener('error', e => console.error('Lỗi game:', e.message));
  const go = () => (window.ArtImg ? ArtImg.load() : Promise.resolve()).then(boot,boot);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go);
  else go();
})();
