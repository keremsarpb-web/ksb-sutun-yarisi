// Köyüm 3D: ortak dünyanın Three.js ile çizimi. Mantık world.js'te; burası yalnızca görüntü ve dokunma.
// Birim: 1 kare = 1 birim. Arsa 8x8, arsalar arası 2 karelik yol.
window.World3D = (() => {
  if (typeof THREE === 'undefined') return null;
  const PLOT = 8, GAP = 2, PER_ROW = 6;
  const plotOrigin = n => ({ x: (n % PER_ROW) * (PLOT + GAP) + 1, z: Math.floor(n / PER_ROW) * (PLOT + GAP) + 1 });

  // ---- malzemeler ve parçalar (low poly, karakterlerle aynı tarz) ----
  const M = {};
  const mat = (c, o = {}) => M[c + JSON.stringify(o)] || (M[c + JSON.stringify(o)] = new THREE.MeshStandardMaterial({ color: c, flatShading: true, roughness: 0.8, ...o }));
  const box = (w, h, d, c, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c)); m.position.set(x, y + h / 2, z); return m; };
  const cyl = (rt, rb, h, c, seg = 8, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat(c)); m.position.set(x, y + h / 2, z); return m; };
  const cone = (r, h, c, seg = 6, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), mat(c)); m.position.set(x, y + h / 2, z); return m; };
  const ball = (r, c, x = 0, y = 0, z = 0, o) => { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), mat(c, o)); m.position.set(x, y, z); return m; };
  const roof = (w, h, d, c, y) => { const m = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.75, h, 4), mat(c)); m.rotation.y = Math.PI / 4; m.scale.set(w / Math.max(w, d), 1, d / Math.max(w, d)); m.position.y = y + h / 2; return m; };
  const group = (...parts) => { const g = new THREE.Group(); parts.forEach(p => g.add(p)); return g; };
  const windows = (g, w, h, d, y0, rows, c = 0x9fd3ff) => { for (let r = 0; r < rows; r++) for (const x of [-w / 4, w / 4]) g.add(box(w * 0.18, h * 0.12, 0.02, c, x, y0 + r * (h / rows) + h * 0.2 / rows, d / 2 + 0.01)); };

  const MODELS = {
    flower: () => { const g = new THREE.Group(); [[-0.2, -0.15, 0xff6b9d], [0.15, 0.1, 0xffd43b], [0.05, -0.25, 0xb197fc]].forEach(([x, z, c]) => { g.add(cyl(0.02, 0.02, 0.22, 0x2f9e44, 4, x, 0, z)); g.add(ball(0.08, c, x, 0.26, z)); }); return g; },
    tree: () => group(cyl(0.07, 0.1, 0.35, 0x8b5a2b, 6), ball(0.34, 0x40c057, 0, 0.62, 0), ball(0.24, 0x51cf66, 0.1, 0.85, 0.05)),
    pine: () => group(cyl(0.06, 0.08, 0.25, 0x7a4a24, 6), cone(0.36, 0.5, 0x2b8a3e, 7, 0, 0.2), cone(0.27, 0.42, 0x2f9e44, 7, 0, 0.5), cone(0.17, 0.34, 0x37b24d, 7, 0, 0.78)),
    pond: () => group(cyl(0.44, 0.46, 0.06, 0x868e96, 10), cyl(0.38, 0.38, 0.07, 0x4dabf7, 10), ball(0.06, 0x69db7c, 0.15, 0.09, 0.1)),
    road: () => box(1, 0.03, 1, 0xb08d5b),
    fence: () => { const g = new THREE.Group(); for (const x of [-0.4, 0, 0.4]) g.add(box(0.07, 0.36, 0.07, 0x8b5a2b, x, 0, 0)); g.add(box(0.9, 0.05, 0.04, 0xa0703c, 0, 0.12, 0)); g.add(box(0.9, 0.05, 0.04, 0xa0703c, 0, 0.26, 0)); return g; },
    lamp: () => group(cyl(0.04, 0.05, 0.75, 0x495057, 6), ball(0.1, 0xffe066, 0, 0.82, 0, { emissive: 0xffc61a, emissiveIntensity: 0.9 })),
    tent: () => group(cone(0.42, 0.55, 0xff922b, 4), box(0.12, 0.25, 0.02, 0x5c3b1e, 0, 0, 0.3)),
    house: () => { const g = group(box(0.72, 0.5, 0.62, 0xf8e5c0), roof(0.8, 0.38, 0.7, 0xe03131, 0.5), box(0.16, 0.26, 0.02, 0x8b5a2b, 0, 0, 0.32)); g.add(box(0.14, 0.12, 0.02, 0x9fd3ff, 0.2, 0.25, 0.32)); return g; },
    villa: () => { const g = group(box(0.86, 0.55, 0.72, 0xfff3bf), roof(0.94, 0.42, 0.8, 0x2f9e44, 0.55), box(0.1, 0.3, 0.1, 0x868e96, 0.25, 0.75, -0.1), box(0.18, 0.28, 0.02, 0x8b5a2b, -0.15, 0, 0.37)); g.add(box(0.2, 0.14, 0.02, 0x9fd3ff, 0.2, 0.28, 0.37)); return g; },
    tower: () => { const g = group(box(0.7, 1.7, 0.7, 0x748ffc), box(0.74, 0.08, 0.74, 0x4c6ef5, 0, 1.7, 0)); windows(g, 0.7, 1.7, 0.7, 0, 5); return g; },
    shop: () => { const g = group(box(0.8, 0.55, 0.65, 0xffffff)); for (let i = 0; i < 5; i++) g.add(box(0.16, 0.06, 0.26, i % 2 ? 0xffffff : 0xe03131, -0.32 + i * 0.16, 0.5, 0.42)); g.add(box(0.5, 0.22, 0.02, 0x9fd3ff, 0, 0.12, 0.33)); g.add(box(0.5, 0.12, 0.04, 0x1971c2, 0, 0.6, 0.31)); return g; },
    bakery: () => group(box(0.78, 0.55, 0.66, 0xf4d6a0), roof(0.86, 0.32, 0.74, 0x8b5a2b, 0.55), cyl(0.07, 0.07, 0.35, 0x868e96, 6, 0.24, 0.7, -0.12), ball(0.13, 0xe8a45c, 0, 0.3, 0.38), box(0.3, 0.1, 0.03, 0xffd43b, 0, 0.62, 0.34)),
    farm: () => { const g = group(box(0.95, 0.04, 0.95, 0x8d6e47)); for (let i = 0; i < 4; i++) g.add(box(0.85, 0.12, 0.1, 0xd9b44a, 0, 0.04, -0.33 + i * 0.22)); g.add(box(0.36, 0.38, 0.3, 0xc92a2a, 0.22, 0.04, 0.22)); g.add(roof(0.4, 0.22, 0.34, 0x5c3b1e, 0.42)); g.children[g.children.length - 1].position.set(0.22, 0.53, 0.22); return g; },
    cafe: () => group(box(0.7, 0.5, 0.55, 0xd0bfff), box(0.76, 0.06, 0.62, 0x7048e8, 0, 0.5, 0), cyl(0.02, 0.02, 0.4, 0x495057, 5, 0.3, 0, 0.36), cone(0.22, 0.12, 0xff8787, 8, 0.3, 0.4, 0.36), cyl(0.1, 0.1, 0.05, 0xffffff, 8, 0.3, 0.2, 0.36)),
    market: () => { const g = group(box(0.92, 0.6, 0.8, 0xe9fac8), box(0.96, 0.08, 0.84, 0x37b24d, 0, 0.6, 0), box(0.6, 0.15, 0.04, 0x37b24d, 0, 0.68, 0.38)); g.add(box(0.7, 0.28, 0.02, 0x9fd3ff, 0, 0.1, 0.41)); return g; },
    school: () => { const g = group(box(0.92, 0.65, 0.7, 0xffd8a8), roof(1, 0.3, 0.78, 0xd9480f, 0.65), box(0.22, 0.45, 0.22, 0xffd8a8, 0, 0.65, 0), cone(0.18, 0.22, 0xd9480f, 4, 0, 1.1, 0), cyl(0.07, 0.07, 0.02, 0xffffff, 10, 0, 0.88, 0.12)); g.children[g.children.length - 1].rotation.x = Math.PI / 2; windows(g, 0.92, 0.65, 0.7, 0, 1); return g; },
    hospital: () => { const g = group(box(0.9, 0.9, 0.75, 0xf8f9fa), box(0.3, 0.08, 0.02, 0xe03131, 0, 0.7, 0.385), box(0.08, 0.3, 0.02, 0xe03131, 0, 0.59, 0.385)); windows(g, 0.9, 0.6, 0.75, 0, 2); return g; },
    factory: () => group(box(0.92, 0.55, 0.8, 0x868e96), box(0.4, 0.25, 0.8, 0x495057, -0.25, 0.55, 0), cyl(0.07, 0.09, 0.8, 0xc92a2a, 6, 0.25, 0.55, -0.2), cyl(0.07, 0.09, 0.65, 0xc92a2a, 6, 0.38, 0.55, 0.15), ball(0.1, 0xdee2e6, 0.25, 1.45, -0.2, { transparent: true, opacity: 0.8 })),
    park: () => group(box(0.96, 0.04, 0.96, 0x51cf66), cyl(0.3, 0.32, 0.1, 0xced4da, 10, 0, 0.04), cyl(0.24, 0.24, 0.11, 0x4dabf7, 10, 0, 0.05), cyl(0.04, 0.05, 0.3, 0xced4da, 6, 0, 0.1), ball(0.07, 0x74c0fc, 0, 0.45, 0), ball(0.1, 0xff8787, -0.36, 0.12, 0.36), ball(0.1, 0xffd43b, 0.36, 0.12, -0.36)),
    stadium: () => { const g = new THREE.Group(); const ring = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.1, 4, 12), mat(0xdee2e6)); ring.rotation.x = Math.PI / 2; ring.position.y = 0.12; ring.scale.set(1.2, 0.9, 1.5); g.add(ring, box(0.66, 0.04, 0.44, 0x40c057), box(0.04, 0.05, 0.44, 0xffffff)); return g; },
    castle: () => { const g = group(box(0.7, 0.45, 0.7, 0xadb5bd)); for (const [x, z] of [[-0.38, -0.38], [0.38, -0.38], [-0.38, 0.38], [0.38, 0.38]]) { g.add(cyl(0.13, 0.14, 0.75, 0x868e96, 8, x, 0, z)); g.add(cone(0.16, 0.25, 0x5f3dc4, 8, x, 0.75, z)); } g.add(box(0.16, 0.24, 0.02, 0x5c3b1e, 0, 0, 0.36)); g.add(box(0.02, 0.3, 0.02, 0x495057, 0, 0.45, 0), box(0.16, 0.1, 0.01, 0xe03131, 0.08, 0.65, 0)); return g; },
    rocket: () => group(box(0.9, 0.05, 0.9, 0x495057), cyl(0.16, 0.18, 0.9, 0xf8f9fa, 10, 0, 0.05), cone(0.17, 0.32, 0xe03131, 10, 0, 0.95), ...[0, 1, 2].map(i => { const f = box(0.04, 0.25, 0.2, 0xe03131, Math.cos(i * 2.1) * 0.17, 0.05, Math.sin(i * 2.1) * 0.17); f.rotation.y = -i * 2.1; return f; }), ball(0.05, 0x74c0fc, 0, 0.7, 0.17)),
  };
  const BUSINESS = k => (window.WORLD_ITEMS?.[k]?.[3] || 0) > 0;

  // ---- sahne ----
  let R = null, scene, cam, el, labels, raf = 0, cb = {};
  const view = { tx: 4, tz: 4, dist: 16, yaw: Math.PI / 4, pitch: 0.9 };
  const plots = new Map();   // plot no -> { group, sig }
  const chars = new Map();   // anahtar -> { obj, target }
  let hover, coinGeo, myPlot = -1, buildMode = false;

  function init(container, callbacks) {
    cb = callbacks || {};
    el = container;
    if (!R) {
      R = new THREE.WebGLRenderer({ antialias: true });
      R.setPixelRatio(Math.min(1.5, window.devicePixelRatio || 1));
      R.setClearColor(0x9ad0f5);
      scene = new THREE.Scene();
      scene.fog = new THREE.Fog(0x9ad0f5, 30, 80);
      scene.add(new THREE.HemisphereLight(0xdbeeff, 0x5c7a3e, 0.55));
      const sun = new THREE.DirectionalLight(0xfff4dd, 0.7);
      sun.position.set(-10, 20, 8);
      scene.add(sun);
      cam = new THREE.PerspectiveCamera(45, 1, 0.1, 200);
      // Toprak zemin (yollar)
      const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), mat(0xc9ab74));
      ground.rotation.x = -Math.PI / 2; ground.position.set(PER_ROW * (PLOT + GAP) / 2, -0.01, 30);
      scene.add(ground);
      hover = new THREE.Mesh(new THREE.BoxGeometry(1, 0.04, 1), new THREE.MeshBasicMaterial({ color: 0x3a5bd9, transparent: true, opacity: 0.35 }));
      hover.visible = false; scene.add(hover);
      coinGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.03, 12);
      bindInput(R.domElement);
    }
    labels = el.querySelector('.w3d-labels');
    el.prepend(R.domElement);
    resize();
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(loop);
    addEventListener('resize', resize);
  }

  function resize() {
    if (!el || !R) return;
    const w = el.clientWidth, h = el.clientHeight;
    R.setSize(w, h); cam.aspect = w / Math.max(1, h); cam.updateProjectionMatrix();
  }

  function destroy() { cancelAnimationFrame(raf); removeEventListener('resize', resize); R?.domElement.remove(); }

  // Bir arsayı (zemin + yapılar) kurar; değişmediyse dokunmaz
  function syncPlot(n, tiles, mine) {
    const sig = (mine ? 'm' : '') + JSON.stringify(tiles || null);
    const old = plots.get(n);
    if (old && old.sig === sig) return;
    if (old) { scene.remove(old.group); }
    const g = new THREE.Group();
    const o = plotOrigin(n);
    g.position.set(o.x, 0, o.z);
    const base = box(PLOT, 0.12, PLOT, tiles ? (mine ? 0x8ce99a : 0x94d82d) : 0xb2d8a0, PLOT / 2, -0.12, PLOT / 2);
    g.add(base);
    if (mine) { const edge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(PLOT + 0.06, 0.14, PLOT + 0.06)), new THREE.LineBasicMaterial({ color: 0xffffff })); edge.position.set(PLOT / 2, -0.06, PLOT / 2); g.add(edge); }
    for (const [k, key] of Object.entries(tiles || {})) {
      const f = MODELS[key]; if (!f) continue;
      const [x, y] = k.split('_').map(Number);
      const b = f(); b.position.set(x + 0.5, 0, y + 0.5);
      g.add(b);
      if (BUSINESS(key)) { const c = new THREE.Mesh(coinGeo, mat(0xfcc419, { metalness: 0.4, roughness: 0.3, emissive: 0x7a5c00, emissiveIntensity: 0.3 })); c.rotation.x = Math.PI / 2; c.position.set(x + 0.5, 1.35, y + 0.5); c.userData.coin = true; g.add(c); }
    }
    scene.add(g);
    plots.set(n, { group: g, sig });
  }

  // Karakteri yerleştirir; konumu değişince yürüyerek gider
  function syncChar(id, look, n, pos, name, online) {
    const lk = JSON.stringify(look || {});
    let c = chars.get(id);
    if (c && c.lk !== lk) { scene.remove(c.obj); c = null; }
    const o = plotOrigin(n), p = pos || { x: 3, y: 3 };
    const target = new THREE.Vector3(o.x + p.x + 0.5, 0, o.z + p.y + 0.5);
    if (!c) {
      const model = window.Char3D?.model ? Char3D.model({ ...(look || {}), color: look?.color || '#4dabf7' }) : ball(1, 0x4dabf7);
      const obj = new THREE.Group();
      model.scale.setScalar(0.27); model.position.y = 0.27;
      obj.add(model);
      const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.22, 12), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.18 }));
      shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.01; obj.add(shadow);
      obj.position.copy(target);
      scene.add(obj);
      c = { obj, model, lk };
      chars.set(id, c);
    }
    c.target = target; c.name = name; c.online = online;
  }

  function sync(state) {
    myPlot = state.mine ? state.mine.plot : -1;
    buildMode = state.mode === 'build';
    const seen = new Set();
    if (state.mine) { syncPlot(state.mine.plot, state.mine.tiles, true); seen.add(state.mine.plot); }
    for (const v of state.villages) { if (v.plot === myPlot) continue; syncPlot(v.plot, v.tiles || {}, false); seen.add(v.plot); }
    // komşuya yer kalsın diye ilerideki boş arsalar
    const max = Math.max(myPlot, ...state.villages.map(v => v.plot), 0);
    for (let n = 0; n <= max + PER_ROW; n++) if (!seen.has(n)) syncPlot(n, null, false);
    for (const [n, p] of plots) if (n > max + PER_ROW) { scene.remove(p.group); plots.delete(n); }
    // karakterler
    const ids = new Set();
    if (state.mine && state.me) { syncChar('me', state.me, state.mine.plot, state.mine.pos, state.me.name, true); ids.add('me'); }
    for (const v of state.villages) { syncChar(v.uid, v.look, v.plot, v.pos, v.name, v.online); ids.add(v.uid); }
    for (const [id, c] of chars) if (!ids.has(id)) { scene.remove(c.obj); chars.delete(id); }
    labels.innerHTML = '';
    for (const [id, c] of chars) {
      const d = document.createElement('div');
      d.className = 'w3d-label' + (id === 'me' ? ' me' : '');
      d.innerHTML = (c.online ? '<i></i>' : '') + '<span></span>';
      d.querySelector('span').textContent = id === 'me' ? 'Sen' : c.name;
      labels.appendChild(d);
      c.label = d;
    }
  }

  function updateCamera() {
    const { tx, tz, dist, yaw, pitch } = view;
    cam.position.set(tx + dist * Math.cos(pitch) * Math.sin(yaw), dist * Math.sin(pitch), tz + dist * Math.cos(pitch) * Math.cos(yaw));
    cam.lookAt(tx, 0, tz);
  }

  const tmp = new THREE.Vector3();
  function loop(t) {
    raf = requestAnimationFrame(loop);
    if (!el?.offsetParent) return;
    updateCamera();
    for (const p of plots.values()) p.group.children.forEach(o => { if (o.userData.coin) { o.rotation.z = t / 600; o.position.y = 1.3 + Math.sin(t / 400) * 0.06; } });
    const w = el.clientWidth, h = el.clientHeight;
    for (const c of chars.values()) {
      const d = c.target.clone().sub(c.obj.position); d.y = 0;
      const moving = d.length() > 0.02;
      if (moving) { c.obj.position.add(d.multiplyScalar(0.12)); c.model.rotation.y = Math.atan2(d.x, d.z); }
      c.model.position.y = 0.27 + (moving ? Math.abs(Math.sin(t / 90)) * 0.06 : Math.abs(Math.sin(t / 700)) * 0.02);
      if (c.label) {
        tmp.copy(c.obj.position); tmp.y += 0.95; tmp.project(cam);
        const vis = tmp.z < 1 && Math.abs(tmp.x) < 1.1 && Math.abs(tmp.y) < 1.1;
        c.label.style.display = vis ? '' : 'none';
        if (vis) c.label.style.transform = `translate(${(tmp.x + 1) / 2 * w}px, ${(1 - tmp.y) / 2 * h}px) translate(-50%, -100%)`;
      }
    }
    R.render(scene, cam);
  }

  // ---- dokunma: sürükle (kaydır), tekerlek/iki parmak (yakınlaş), tıkla (kare seç) ----
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  function groundAt(cx, cy) {
    const r = R.domElement.getBoundingClientRect();
    ndc.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, cam);
    const hit = new THREE.Vector3();
    return ray.ray.intersectPlane(plane, hit) ? hit : null;
  }
  function tileAt(cx, cy) {
    const p = groundAt(cx, cy);
    if (!p || myPlot < 0) return null;
    const o = plotOrigin(myPlot), x = Math.floor(p.x - o.x), y = Math.floor(p.z - o.z);
    return x >= 0 && x < PLOT && y >= 0 && y < PLOT ? { x, y } : null;
  }
  function bindInput(cv) {
    const pts = new Map();
    let moved = 0, pinch = 0, last = null;
    cv.style.touchAction = 'none';
    cv.addEventListener('pointerdown', e => { cv.setPointerCapture(e.pointerId); pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); moved = 0; last = { x: e.clientX, y: e.clientY }; });
    cv.addEventListener('pointermove', e => {
      const t = tileAt(e.clientX, e.clientY);
      hover.visible = !!t && buildMode;
      if (t) { const o = plotOrigin(myPlot); hover.position.set(o.x + t.x + 0.5, 0.02, o.z + t.y + 0.5); }
      if (!pts.has(e.pointerId)) return;
      const prev = pts.get(e.pointerId);
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 2) {
        const [a, b] = [...pts.values()], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinch) zoom(pinch / d);
        pinch = d; moved += 10; return;
      }
      const dx = e.clientX - prev.x, dy = e.clientY - prev.y;
      moved += Math.abs(dx) + Math.abs(dy);
      if (e.shiftKey || e.buttons === 2) { view.yaw -= dx * 0.01; view.pitch = Math.min(1.35, Math.max(0.45, view.pitch + dy * 0.005)); return; }
      const k = view.dist / 700;
      view.tx -= (dx * Math.cos(view.yaw) + dy * Math.sin(view.yaw)) * k;
      view.tz -= (-dx * Math.sin(view.yaw) + dy * Math.cos(view.yaw)) * k;
    });
    const up = e => {
      pts.delete(e.pointerId);
      if (pts.size < 2) pinch = 0;
      if (moved < 8 && last && e.type === 'pointerup') { const t = tileAt(last.x, last.y); if (t) cb.onTile?.(t.x, t.y); }
      last = null;
    };
    cv.addEventListener('pointerup', up);
    cv.addEventListener('pointercancel', up);
    cv.addEventListener('pointerleave', () => { hover.visible = false; });
    cv.addEventListener('wheel', e => { e.preventDefault(); zoom(e.deltaY > 0 ? 1.12 : 1 / 1.12); }, { passive: false });
    cv.addEventListener('contextmenu', e => e.preventDefault());
  }
  function zoom(f) { view.dist = Math.min(60, Math.max(5, view.dist * f)); }
  function rotate(dir) { view.yaw += dir * Math.PI / 4; }
  function focus(n, pos) { const o = plotOrigin(n), p = pos || { x: 4, y: 4 }; view.tx = o.x + p.x + 0.5; view.tz = o.z + p.y + 0.5; }

  return { init, destroy, sync, zoom, rotate, focus, resize };
})();
