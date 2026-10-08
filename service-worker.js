/* service-worker.js – chơi offline. Đổi CACHE_NAME mỗi lần cập nhật. */
const CACHE_NAME = 'canh-cong-krv31-anime';
const ASSETS = ['./', './index.html', './style.css', './manifest.json',
  './js/config.js', './js/maps-img.js', './js/campaign.js', './js/save.js', './js/items.js', './js/audio.js', './js/icons.js', './js/art-kit.js', './js/art-chars.js', './js/art-towers.js', './js/art.js',
  './js/effects.js', './js/level.js', './js/mapart.js', './design/props3d.js', './js/map3d.js', './js/fx3d.js', './js/terrain3d.js', './js/water.js', './js/icons3d.js', './js/lights.js', './js/camera.js', './js/combat.js', './js/enemies.js', './js/units.js', './js/towers.js', './js/spells.js', './js/waves.js',
  './js/game.js', './js/ui.js', './js/main.js',
  './assets/fonts/AlegreyaSC-Black.woff2', './assets/fonts/AlegreyaSans-Bold.woff2', './assets/fonts/AlegreyaSans-ExtraBold.woff2',
  './js/art-img.js', './js/chibi.js', './design/vendor/three.min.js', './design/vendor/BufferGeometryUtils.js', './design/chars3d.js', './design/towers3d.js', './js/art3d.js', './assets/icons/icon-192.png', './assets/icons/icon-512.png', './assets/icons/icon-maskable-512.png'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE_NAME).map(x => caches.delete(x)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET' || !r.url.startsWith(self.location.origin)) return;
  e.respondWith(fetch(r).then(res => { if (res && res.ok) { const cp=res.clone(); caches.open(CACHE_NAME).then(c=>c.put(r,cp)); } return res; }).catch(() => caches.match(r, {ignoreSearch:true}).then(hit => hit || (r.mode === 'navigate' ? caches.match('./index.html') : undefined))));
});
