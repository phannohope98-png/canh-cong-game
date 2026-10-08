/* viewer3d.js – Xưởng nhân vật 3D: xem xoay, đổi cấp, hoạt ảnh, bảng quay, xuất .glb / PNG / sprite sheet */
(function () {
  'use strict';
  const T = THREE, C3 = Chars3D, $ = id => document.getElementById(id);
  const ANIM_VI = { idle: 'Đứng', walk: 'Đi', attack: 'Đánh', die: 'Ngã' };
  const SKILL_VI = { block: 'Giơ khiên', holy: 'Thánh Quang', triple: '3 mũi tên', meteor: 'Mưa thiên thạch', slam: 'Đập đất', summon: 'Triệu hồi', charge: 'Sói húc' };
  const DIRS = ['Nam', 'Đông Nam', 'Đông', 'Đông Bắc', 'Bắc', 'Tây Bắc', 'Tây', 'Tây Nam'];

  const qs = new URLSearchParams(location.search);
  const st = { id: qs.get('c') || 'soldier', tier: +qs.get('t') || 0, anim: qs.get('a') || 'idle', ink: true, spin: false, speed: 1, kr: false };

  /* ---------- cảnh chính ---------- */
  const view = $('view'), stage = $('stage');
  const renderer = new T.WebGLRenderer({ canvas: view, antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.outputEncoding = T.sRGBEncoding; renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15; renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  const scene = new T.Scene(), cam = new T.PerspectiveCamera(30, 1, 0.1, 100);
  const ctl = new T.OrbitControls(cam, view);
  ctl.enableDamping = true; ctl.dampingFactor = 0.12; ctl.minDistance = 2; ctl.maxDistance = 22; ctl.maxPolarAngle = Math.PI * 0.56; ctl.enablePan = false;
  function lights(sc) {
    sc.add(new T.HemisphereLight(0xfff4e8, 0x5a4a6a, 0.8));
    const key = new T.DirectionalLight(0xffffff, 1.0); key.position.set(2.5, 5, 4); sc.add(key);
    const rim = new T.DirectionalLight(0xa8c4ff, 0.45); rim.position.set(-3, 2.5, -4); sc.add(rim);
  }
  lights(scene);

  // bệ cỏ kiểu Kingdom Rush + bóng tròn
  const shadowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(0,0,0,0.55)'); gr.addColorStop(0.6, 'rgba(0,0,0,0.25)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return new T.CanvasTexture(c); })();
  function makePlinth() {
    const g = new T.Group();
    const top = new T.Mesh(new T.CylinderGeometry(1.7, 1.75, 0.12, 48), new T.MeshStandardMaterial({color:'#4f5962',roughness:.9})); top.position.y = -0.06; g.add(top);
    const side = new T.Mesh(new T.CylinderGeometry(1.75, 1.6, 0.3, 48), new T.MeshStandardMaterial({color:'#303941',roughness:.95})); side.position.y = -0.27; g.add(side);
    const rim = new T.Mesh(new T.TorusGeometry(1.72, 0.035, 6, 64), new T.MeshBasicMaterial({ color: C3.INK })); rim.rotation.x = Math.PI / 2; rim.position.y = 0; g.add(rim);
    for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2 + 0.3, r = 1.2 + (i % 3) * 0.14; const s = new T.Mesh(new T.DodecahedronGeometry(0.07 + (i % 2) * 0.04, 0), new T.MeshToonMaterial({ color: '#9a9488' })); s.position.set(Math.sin(a) * r, 0.02, Math.cos(a) * r); g.add(s); }
    for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, r = 0.9 + ((i * 7) % 5) * 0.15; const b = new T.Mesh(new T.ConeGeometry(0.018, 0.07, 6), new T.MeshToonMaterial({ color: '#778378' })); b.position.set(Math.sin(a) * r, 0.06, Math.cos(a) * r); g.add(b); }
    const sh = new T.Mesh(new T.PlaneGeometry(1.6, 1.6), new T.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })); sh.rotation.x = -Math.PI / 2; sh.position.y = 0.004; sh.name = 'shadow'; g.add(sh);
    return g;
  }
  const plinth = makePlinth(); scene.add(plinth);

  let cur = null, mixer = null, actions = {}, active = null, ticks = [], sprites = [];
  const clock = new T.Clock();

  function load(id, tier) {
    if (cur) { scene.remove(cur.root); cur.root.traverse(o => { if (o.geometry) o.geometry.dispose(); }); }
    C3.setInk(.28);
    cur = C3.build(id, tier); st.id = cur.def.id; st.tier = cur.tier;
    scene.add(cur.root);
    const k = cur.def.scale || 1; plinth.scale.setScalar(Math.max(1, k * 0.85));
    plinth.getObjectByName('shadow').scale.setScalar(cur.def.id === 'wolfRider' ? 1.4 : k);
    mixer = new T.AnimationMixer(cur.root); mixer.timeScale = st.speed; actions = {}; active = null;
    mixer.addEventListener('finished', e => { if (e.action.getClip().name !== 'die') play('idle'); });
    cur.clips.forEach(c => { const a = mixer.clipAction(c); if (!c.userData.loop) { a.setLoop(T.LoopOnce, 1); a.clampWhenFinished = true; } actions[c.name] = a; });
    ticks = []; sprites = [];
    cur.root.traverse(o => { if (o.userData.tick) ticks.push(o.userData.tick); if (o.isSprite) sprites.push(o); });
    setInk(st.ink);
    frameCam();
    play(actions[st.anim] ? st.anim : 'idle', true);
    renderSheet(); renderAnims(); markRoster();
    setTimeout(turnaround, 30);
    history.replaceState(null, '', '?c=' + st.id + '&t=' + st.tier);
  }
  function play(name, instant) {
    const a = actions[name]; if (!a) return;
    st.anim = name;
    if (active && active !== a) { a.reset().play(); if (!instant) active.crossFadeTo(a, 0.18, false); else active.stop(); }
    else a.reset().play();
    active = a;
    document.querySelectorAll('#anims .chip').forEach(b => b.classList.toggle('on', b.dataset.a === name));
  }
  function setInk(on) { st.ink = on; if (cur) cur.root.traverse(o => { if (o.userData.hull) o.visible = on; }); $('tg-ink').classList.toggle('on', on); }
  function bounds(root) {
    const b = new T.Box3(); root.updateMatrixWorld(true);
    root.traverse(o => { if (o.isMesh && !o.userData.hull) { o.geometry.computeBoundingBox(); b.union(o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld)); } });
    return b;
  }
  function frameCam() {
    const b = bounds(cur.root), h = b.max.y, w = Math.max(b.max.x - b.min.x, b.max.z - b.min.z);
    const size = Math.max(h, w * 0.9), dist = size * 2.9 + 1.6;
    ctl.target.set(0, h * 0.48, 0);
    const el = st.kr ? 0.62 : 0.2, az = st.kr ? 0 : 0.55;
    cam.position.set(Math.sin(az) * Math.cos(el) * dist, h * 0.48 + Math.sin(el) * dist, Math.cos(az) * Math.cos(el) * dist);
    ctl.update();
  }
  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(stage); resize();

  function loop() {
    requestAnimationFrame(loop);
    const dt = Math.min(0.05, clock.getDelta()), tt = clock.elapsedTime;
    if(C3.fx)C3.fx.uTime.value=tt;
    if (mixer) mixer.update(dt);
    ticks.forEach(f => f(tt));
    sprites.forEach((s, i) => { s.material.opacity = (s.userData.op0 || (s.userData.op0 = s.material.opacity)) * (0.8 + Math.sin(tt * 3 + i) * 0.2); });
    if (st.spin && cur) cur.root.rotation.y += dt * 0.6;
    ctl.update(); renderer.render(scene, cam);
  }

  /* ---------- kết xuất phụ (ảnh nhỏ, bảng quay, sprite) ---------- */
  const off = new T.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  off.outputEncoding = T.sRGBEncoding; off.setPixelRatio(1);
  const offScene = new T.Scene(); lights(offScene);
  /** chụp 1 khung: yaw = hướng quay, el = góc nhìn xuống, persp = phối cảnh hay trực giao */
  function shot(root, w, h, yaw, el, persp, box) {
    off.setSize(w, h, false);
    offScene.add(root); root.rotation.y = yaw || 0;
    const b = box || bounds(root), H = b.max.y, W = Math.max(b.max.x - b.min.x, b.max.z - b.min.z, H * 0.55);
    const cy = H * 0.5;
    let camera;
    if (persp) {
      camera = new T.PerspectiveCamera(28, w / h, 0.1, 100);
      const d = Math.max(H, W * 0.9) * 2.3 + 0.8;
      camera.position.set(Math.sin(0.55) * d, cy + Math.sin(el) * d, Math.cos(0.55) * d);
    } else {
      const vh = Math.max(H * Math.cos(el) + W * Math.sin(el), W * h / w) * 1.12, vw = vh * w / h;
      camera = new T.OrthographicCamera(-vw / 2, vw / 2, vh / 2, -vh / 2, 0.1, 100);
      camera.position.set(0, cy + Math.sin(el) * 20, Math.cos(el) * 20);
    }
    camera.lookAt(0, cy, 0);
    off.render(offScene, camera);
    offScene.remove(root);
    return off.domElement;
  }
  /** dựng bản tạm, đặt tư thế clip ở thời điểm t */
  function posed(id, tier, anim, frac) {
    C3.setInk(.28);
    const b = C3.build(id, tier), m = new T.AnimationMixer(b.root), clip = b.clips.find(c => c.name === anim) || b.clips[0];
    const a = m.clipAction(clip); if (!clip.userData.loop) { a.setLoop(T.LoopOnce, 1); a.clampWhenFinished = true; } a.play();
    m.setTime(Math.min(clip.duration * 0.999, clip.duration * (frac || 0)));
    b.root.traverse(o => { if (o.isSprite) o.visible = false; });
    return { b, m, clip };
  }
  const freeGeo = root => root.traverse(o => { if (o.geometry) o.geometry.dispose(); });

  function turnaround() {
    const box = $('sh-turn'); box.innerHTML = '';
    const p = posed(st.id, st.tier, 'idle', 0.25), bb = bounds(p.b.root);
    [['Trước', 0], ['3/4', -Math.PI / 4], ['Nghiêng', -Math.PI / 2], ['Sau', Math.PI]].forEach(([lb, yaw]) => {
      if (!st.ink) p.b.root.traverse(o => { if (o.userData.hull) o.visible = false; });
      const url = shot(p.b.root, 180, 240, yaw, 0.12, false, bb).toDataURL('image/png');
      const f = document.createElement('figure'); f.innerHTML = '<img alt="' + lb + '" src="' + url + '"><figcaption>' + lb + '</figcaption>'; box.appendChild(f);
    });
    freeGeo(p.b.root);
  }

  /* ---------- danh sách nhân vật ---------- */
  function renderRoster() {
    const nav = $('roster'); nav.innerHTML = ''; let g = null;
    C3.list.forEach(c => { if (c.hidden) return;
      if (c.group !== g) { g = c.group; const h = document.createElement('div'); h.className = 'grp'; h.textContent = g; nav.appendChild(h); }
      const b = document.createElement('button'); b.className = 'card'; b.dataset.id = c.id;
      b.innerHTML = '<span class="ph"></span><div><b>' + c.name + '</b><small>' + c.role.split(' · ')[0] + '</small></div>';
      b.onclick = () => { st.anim = 'idle'; load(c.id, Math.min(c.tiers, st.id === c.id ? st.tier : c.tiers)); };
      nav.appendChild(b);
    });
    // ảnh nhỏ: vẽ dần cho khỏi khựng
    let i = 0;
    const next = () => {
      const c = C3.list[i++]; if (!c) return;
      const p = posed(c.id, c.tiers, 'idle', 0.25);
      const url = shot(p.b.root, 108, 108, 0, 0.18, true).toDataURL('image/png'); freeGeo(p.b.root);
      const ph = nav.querySelector('[data-id="' + c.id + '"] .ph'); if (ph) { const im = new Image(); im.alt = ''; im.src = url; ph.replaceWith(im); }
      setTimeout(next, 16);
    };
    setTimeout(next, 200);
  }
  function markRoster() { document.querySelectorAll('#roster .card').forEach(b => b.classList.toggle('on', b.dataset.id === st.id)); }

  /* ---------- bảng thiết kế ---------- */
  function renderAnims() {
    const box = $('anims'), sel = $('ex-anim'); box.innerHTML = ''; sel.innerHTML = '';
    cur.clips.forEach(c => {
      const lb = c.name === 'skill' ? 'Kỹ năng: ' + (cur.skillName || SKILL_VI[cur.skill] || cur.skill) : ANIM_VI[c.name] || c.name;
      const b = document.createElement('button'); b.className = 'chip'; b.dataset.a = c.name; b.textContent = lb; b.onclick = () => play(c.name); box.appendChild(b);
      const o = document.createElement('option'); o.value = c.name; o.textContent = lb; sel.appendChild(o);
    });
    document.querySelectorAll('#anims .chip').forEach(b => b.classList.toggle('on', b.dataset.a === st.anim));
    sel.value = cur.clips.some(c => c.name === 'walk') ? 'walk' : cur.clips[0].name;
  }
  function renderSheet() {
    const d = cur.def;
    $('np-name').textContent = d.name; $('np-role').textContent = d.role + (d.tiers > 1 ? ' · ' + (d.tierName || 'Cấp') + ' ' + cur.tier : '');
    $('sh-name').textContent = d.name; $('sh-badge').textContent = d.group + ' · ' + d.role; $('sh-desc').textContent = d.desc;
    $('sh-tiername').textContent = d.tiers > 1 ? d.tierName || 'Cấp' : 'Cấp';
    const tb = $('sh-tiers'); tb.innerHTML = '';
    if (d.tiers > 1) for (let t = 1; t <= d.tiers; t++) { const b = document.createElement('button'); b.textContent = t; b.className = t === cur.tier ? 'on' : ''; b.onclick = () => load(d.id, t); tb.appendChild(b); }
    else tb.innerHTML = '<span class="note">Một dạng duy nhất</span>';
    $('sh-pal').innerHTML = d.palette.map(p => '<div class="sw"><i style="background:' + p.c + '"></i><span>' + p.l + '<code>' + p.c + '</code></span></div>').join('');
    let tris = 0; cur.root.traverse(o => { if (o.isMesh && !o.userData.hull) { const g = o.geometry; tris += (g.index ? g.index.count : g.attributes.position.count) / 3; } });
    const h = bounds(cur.root).max.y;
    $('sh-stats').innerHTML = '<div><b>' + Math.round(tris / 100) / 10 + 'k</b><small>tam giác</small></div><div><b>' + cur.clips.length + '</b><small>clip hoạt ảnh</small></div><div><b>' + h.toFixed(2) + '</b><small>chiều cao (m)</small></div>';
    $('sh-bones').innerHTML = Object.keys(cur.rig.n).map(k => '<span>' + k + '</span>').join('');
  }

  /* ---------- xuất file ---------- */
  function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2200); }
  function download(blob, name) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500); }
  function glb(id, tier) {
    return new Promise((res, rej) => {
      const b = C3.build(id, tier), ex = C3.toExportable(b.root);
      new T.GLTFExporter().parse(ex, r => { freeGeo(b.root); res(r); }, rej, { binary: true, animations: b.clips.filter(c => c.tracks.length) });
    });
  }
  const fname = (id, t, ext) => 'canhcong_' + id + '_t' + t + ext;
  $('ex-glb').onclick = async () => { const r = await glb(st.id, st.tier); download(new Blob([r], { type: 'model/gltf-binary' }), fname(st.id, st.tier, '.glb')); toast('Đã xuất ' + fname(st.id, st.tier, '.glb')); };
  $('ex-png').onclick = () => view.toBlob(b => { download(b, fname(st.id, st.tier, '_' + st.anim + '.png')); toast('Đã chụp ảnh'); });
  $('ex-all').onclick = async e => {
    const btn = e.currentTarget; btn.disabled = true;
    for (const c of C3.list) { btn.textContent = 'Đang xuất ' + c.name + '…'; const r = await glb(c.id, c.tiers); download(new Blob([r], { type: 'model/gltf-binary' }), fname(c.id, c.tiers, '.glb')); await new Promise(r2 => setTimeout(r2, 450)); }
    btn.disabled = false; btn.textContent = 'Tải tất cả .GLB (mọi nhân vật, cấp cao nhất)'; toast('Đã xuất ' + C3.list.length + ' file .glb');
  };
  /** sprite sheet: 8 hàng hướng × F khung, góc nhìn chéo kiểu KR */
  function spriteSheet(id, tier, anim, cell, F) {
    F = F || 8;
    const p = posed(id, tier, anim, 0), loopClip = p.clip.userData.loop;
    // khung bao chung cho mọi khung hình để nhân vật không nhảy kích thước
    const bb = new T.Box3();
    for (let f = 0; f < F; f++) { p.m.setTime(p.clip.duration * (loopClip ? f / F : f / (F - 1)) * 0.999); bb.union(bounds(p.b.root)); }
    const R = Math.max(Math.abs(bb.min.x), bb.max.x, Math.abs(bb.min.z), bb.max.z); bb.min.x = bb.min.z = -R; bb.max.x = bb.max.z = R; bb.min.y = 0;
    const cv = document.createElement('canvas'); cv.width = cell * F; cv.height = cell * 8; const g = cv.getContext('2d');
    if (!st.ink) p.b.root.traverse(o => { if (o.userData.hull) o.visible = false; });
    for (let d = 0; d < 8; d++) for (let f = 0; f < F; f++) {
      p.m.setTime(p.clip.duration * (loopClip ? f / F : f / (F - 1)) * 0.999);
      g.drawImage(shot(p.b.root, cell, cell, d * Math.PI / 4, 0.55, false, bb), f * cell, d * cell);
    }
    freeGeo(p.b.root);
    return cv;
  }
  $('ex-sheet').onclick = () => {
    const anim = $('ex-anim').value, cell = +$('ex-cell').value;
    const cv = spriteSheet(st.id, st.tier, anim, cell, 8);
    cv.toBlob(b => { download(b, fname(st.id, st.tier, '_' + anim + '_8x8_' + cell + '.png')); toast('Sprite sheet ' + cv.width + '×' + cv.height + ' · hàng: ' + DIRS.join(', ')); });
  };

  /* ---------- nút bật tắt ---------- */
  $('tg-ink').onclick = () => setInk(!st.ink);
  $('tg-spin').onclick = e => { st.spin = !st.spin; e.currentTarget.classList.toggle('on', st.spin); if (!st.spin && cur) cur.root.rotation.y = 0; };
  $('tg-speed').onclick = e => { st.speed = st.speed === 1 ? 0.5 : st.speed === 0.5 ? 0.25 : 1; if (mixer) mixer.timeScale = st.speed; e.currentTarget.textContent = 'Tốc độ ' + (st.speed === 1 ? '1' : st.speed === 0.5 ? '½' : '¼') + '×'; e.currentTarget.classList.toggle('on', st.speed !== 1); };
  $('tg-cam').onclick = e => { st.kr = !st.kr; e.currentTarget.classList.toggle('on', st.kr); frameCam(); };

  // dùng cho kiểm thử / xuất tự động (headless)
  window.__studio = {
    load, play,
    glbBase64: async (id, tier) => { const r = new Uint8Array(await glb(id, tier)); let s = ''; for (let i = 0; i < r.length; i += 0x8000) s += String.fromCharCode.apply(null, r.subarray(i, i + 0x8000)); return btoa(s); },
    sheetDataURL: (id, tier, anim, cell) => spriteSheet(id, tier, anim, cell || 128, 8).toDataURL('image/png')
  };

  renderRoster();
  const def = C3.list.find(c => c.id === st.id) || C3.list[0];
  load(def.id, st.tier || def.tiers);
  loop();
})();
