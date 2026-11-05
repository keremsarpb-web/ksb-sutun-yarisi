// Low poly 3D karakterler (Three.js). Arena ve listeler için görüntü üretir,
// lobide de canlı dönen bir önizleme çizer. Three.js yüklenemezse game.js SVG çizime döner.
window.Char3D = (() => {
  if (typeof THREE === 'undefined') return null;
  try { if (!document.createElement('canvas').getContext('webgl')) return null; } catch { return null; }

  const W = 200, H = 220;
  const INK = 0x1b1b2f;
  const FACE_Z = { round: 0.84, cat: 0.84, bear: 0.84, square: 0.72, drop: 0.8, star: 0.5 };
  const TOP_Y = { round: 0.86, cat: 0.86, bear: 0.86, square: 0.8, drop: 1.08, star: 1.02 };

  const mat = (color, opts = {}) => new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.75, metalness: 0, ...opts });
  const ico = (r, d = 0) => new THREE.IcosahedronGeometry(r, d);

  function mesh(geo, material, pos = [0, 0, 0], scale, rot) {
    const m = new THREE.Mesh(geo, material);
    m.position.set(...pos);
    if (scale) m.scale.set(...scale);
    if (rot) m.rotation.set(...rot);
    return m;
  }

  function tint(hex, f) {
    const c = new THREE.Color(hex);
    return f > 1 ? c.lerp(new THREE.Color(0xffffff), f - 1) : c.multiplyScalar(f);
  }

  function body(shape, m) {
    if (shape === 'square') return mesh(new THREE.BoxGeometry(1.6, 1.55, 1.4), m);
    if (shape === 'star') {
      // Slay Yıldız: beş kollu, kalın, hafif tombul yıldız
      const st = new THREE.Shape();
      for (let i = 0; i < 10; i++) {
        const r = i % 2 ? 0.6 : 1.3, a = Math.PI / 2 + (i * Math.PI) / 5;
        const x = Math.cos(a) * r, y = Math.sin(a) * r - 0.1;
        if (i) st.lineTo(x, y); else st.moveTo(x, y);
      }
      const geo = new THREE.ExtrudeGeometry(st, { depth: 0.6, bevelEnabled: true, bevelThickness: 0.16, bevelSize: 0.14, bevelSegments: 1 });
      geo.translate(0, 0, -0.3);
      return mesh(geo, m);
    }
    if (shape === 'drop') {
      const pts = [[0, -0.92], [0.62, -0.8], [0.92, -0.35], [0.88, 0.15], [0.55, 0.68], [0, 1.25]].map(([x, y]) => new THREE.Vector2(x, y));
      return mesh(new THREE.LatheGeometry(pts, 8), m, [0, 0, 0], [1, 1, 0.92]);
    }
    return mesh(ico(1, 1), m, [0, 0, 0], [1, 0.95, 0.92]);
  }

  function ears(shape, m, inner) {
    const g = new THREE.Group();
    if (shape === 'cat') {
      for (const s of [-1, 1]) {
        g.add(mesh(new THREE.ConeGeometry(0.32, 0.6, 4), m, [s * 0.52, 0.92, 0], null, [0, Math.PI / 4, -s * 0.35]));
        g.add(mesh(new THREE.ConeGeometry(0.17, 0.36, 4), inner, [s * 0.5, 0.9, 0.12], null, [0, Math.PI / 4, -s * 0.35]));
      }
    } else if (shape === 'bear') {
      for (const s of [-1, 1]) {
        g.add(mesh(ico(0.32, 0), m, [s * 0.66, 0.74, 0]));
        g.add(mesh(ico(0.17, 0), inner, [s * 0.68, 0.76, 0.2], [1, 1, 0.5]));
      }
    }
    return g;
  }

  function eyes(kind, z) {
    const g = new THREE.Group();
    const black = mat(INK, { roughness: 0.4 });
    const white = mat(0xffffff, { roughness: 0.5 });
    for (const s of [-1, 1]) {
      const x = s * 0.32, y = 0.18;
      if (kind === 'happy') {
        g.add(mesh(new THREE.TorusGeometry(0.13, 0.045, 4, 8, Math.PI), black, [x, y - 0.04, z + 0.02]));
      } else if (kind === 'sleepy') {
        g.add(mesh(new THREE.SphereGeometry(0.17, 8, 4, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), white, [x, y, z - 0.04], [1, 1, 0.6]));
        g.add(mesh(ico(0.08, 0), black, [x, y - 0.07, z + 0.06]));
        g.add(mesh(new THREE.BoxGeometry(0.38, 0.05, 0.05), black, [x, y, z + 0.06]));
      } else if (kind === 'star') {
        g.add(mesh(new THREE.OctahedronGeometry(0.19, 0), black, [x, y, z + 0.02], [0.75, 1.1, 0.35], [0, 0, Math.PI / 4]));
        g.add(mesh(ico(0.035, 0), white, [x + 0.05, y + 0.06, z + 0.1]));
      } else if (kind === 'cool') {
        g.add(mesh(new THREE.BoxGeometry(0.42, 0.26, 0.08), black, [x, y, z + 0.05]));
        if (s > 0) g.add(mesh(new THREE.BoxGeometry(0.24, 0.05, 0.05), black, [0, y + 0.06, z + 0.06]));
        g.add(mesh(new THREE.BoxGeometry(0.12, 0.04, 0.02), white, [x - 0.07, y + 0.05, z + 0.1], null, [0, 0, 0.4]));
      } else {
        g.add(mesh(ico(0.19, 1), white, [x, y, z - 0.06], [1, 1.1, 0.6]));
        g.add(mesh(ico(0.11, 1), black, [x + 0.02, y - 0.01, z + 0.04], [1, 1.1, 0.5]));
        g.add(mesh(ico(0.035, 0), white, [x + 0.06, y + 0.05, z + 0.1]));
      }
    }
    return g;
  }

  function mouth(kind, z) {
    const g = new THREE.Group();
    const black = mat(INK, { roughness: 0.4 });
    const inside = mat(0x5c1a2b);
    const pink = mat(0xff7f9f);
    const y = -0.16;
    const smile = (rz = Math.PI) => mesh(new THREE.TorusGeometry(0.15, 0.04, 4, 8, Math.PI), black, [0, y + 0.05, z], null, [0, 0, rz]);
    if (kind === 'laugh') {
      g.add(mesh(new THREE.CircleGeometry(0.2, 6, Math.PI, Math.PI), inside, [0, y + 0.06, z + 0.02]));
      g.add(mesh(ico(0.08, 0), pink, [0, y - 0.07, z + 0.03], [1.2, 0.6, 0.5]));
    } else if (kind === 'tongue') {
      g.add(smile());
      g.add(mesh(ico(0.08, 0), pink, [0.03, y - 0.1, z + 0.02], [1, 1.3, 0.5]));
    } else if (kind === 'wow') {
      g.add(mesh(ico(0.1, 0), inside, [0, y - 0.02, z], [1, 1.25, 0.4]));
    } else if (kind === 'cool') {
      g.add(smile(Math.PI + 0.35));
    } else {
      g.add(smile());
    }
    return g;
  }

  function hat(kind, top, z = 0.84) {
    const g = new THREE.Group();
    g.position.y = top;
    const half = r => new THREE.SphereGeometry(r, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2);
    if (kind === 'slayshades') {
      // Slay gözlüğü: yüze takılır, pembe kalp camlar ve parıltılar
      g.position.y = 0.19;
      const frame = mat(0xffffff, { metalness: 0.4, roughness: 0.3 });
      const lens = mat(0xff4fa3, { emissive: 0xb0186a, emissiveIntensity: 0.5, roughness: 0.2 });
      const heart = new THREE.Shape();
      heart.moveTo(0, -0.17);
      heart.bezierCurveTo(-0.3, 0.02, -0.16, 0.2, 0, 0.08);
      heart.bezierCurveTo(0.16, 0.2, 0.3, 0.02, 0, -0.17);
      const hg = new THREE.ExtrudeGeometry(heart, { depth: 0.05, bevelEnabled: false, curveSegments: 4 });
      for (const s of [-1, 1]) g.add(mesh(hg, lens, [s * 0.32, 0, z + 0.06], [1.25, 1.25, 1]));
      g.add(mesh(new THREE.BoxGeometry(0.2, 0.04, 0.04), frame, [0, 0.05, z + 0.08]));
      for (const [x, y] of [[0.62, 0.22], [-0.58, -0.12], [0.5, -0.2]]) g.add(mesh(new THREE.OctahedronGeometry(0.06, 0), mat(0xffffff, { emissive: 0xffd6f0, emissiveIntensity: 0.8 }), [x, y, z + 0.1]));
    } else if (kind === 'cap') {
      const red = mat(0xe03131);
      g.add(mesh(half(0.62), red, [0, -0.12, 0]));
      g.add(mesh(new THREE.BoxGeometry(0.7, 0.06, 0.5), red, [0, -0.1, 0.62], null, [0.15, 0, 0]));
      g.add(mesh(ico(0.07, 0), mat(0xffffff), [0, 0.5, 0]));
    } else if (kind === 'sunhat') {
      const straw = mat(0xf2c96b);
      g.add(mesh(new THREE.CylinderGeometry(1.05, 1.1, 0.06, 10), straw, [0, -0.05, 0], null, [0.12, 0, 0]));
      g.add(mesh(half(0.55), straw, [0, -0.05, 0]));
      g.add(mesh(new THREE.CylinderGeometry(0.56, 0.56, 0.1, 10), mat(0xf783ac), [0, 0.02, 0]));
    } else if (kind === 'grad') {
      const black = mat(0x212529);
      g.add(mesh(new THREE.CylinderGeometry(0.5, 0.55, 0.3, 8), black, [0, 0.02, 0]));
      g.add(mesh(new THREE.BoxGeometry(1.15, 0.07, 1.15), black, [0, 0.2, 0], null, [0, Math.PI / 4, 0]));
      g.add(mesh(new THREE.BoxGeometry(0.05, 0.42, 0.05), mat(0xffd43b), [0.5, 0.0, 0.25]));
    } else if (kind === 'helmet') {
      const white = mat(0xf8f9fa);
      g.add(mesh(half(0.72), white, [0, -0.2, 0]));
      g.add(mesh(new THREE.BoxGeometry(0.28, 0.08, 0.05), mat(0xe03131), [0, 0.2, 0.62], null, [-0.6, 0, 0]));
      g.add(mesh(new THREE.BoxGeometry(0.08, 0.28, 0.05), mat(0xe03131), [0, 0.2, 0.62], null, [-0.6, 0, 0]));
    } else if (kind === 'tophat') {
      const black = mat(0x212529);
      g.add(mesh(new THREE.CylinderGeometry(0.78, 0.78, 0.06, 8), black, [0, 0, 0]));
      g.add(mesh(new THREE.CylinderGeometry(0.46, 0.5, 0.8, 8), black, [0, 0.42, 0]));
      g.add(mesh(new THREE.CylinderGeometry(0.505, 0.51, 0.14, 8), mat(0xc92a2a), [0, 0.1, 0]));
    } else if (kind === 'crown') {
      const gold = mat(0xfcc419, { metalness: 0.5, roughness: 0.35 });
      g.add(mesh(new THREE.CylinderGeometry(0.52, 0.5, 0.3, 8, 1, true), gold, [0, 0.05, 0]));
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        g.add(mesh(new THREE.ConeGeometry(0.12, 0.3, 4), gold, [Math.sin(a) * 0.5, 0.33, Math.cos(a) * 0.5]));
      }
      g.add(mesh(new THREE.OctahedronGeometry(0.1, 0), mat(0xe64980, { roughness: 0.2 }), [0, 0.07, 0.53]));
    } else if (kind === 'party') {
      g.add(mesh(new THREE.ConeGeometry(0.42, 0.95, 6), mat(0x4dabf7), [0, 0.32, 0], null, [0, 0, 0.15]));
      g.add(mesh(new THREE.TorusGeometry(0.33, 0.05, 4, 6), mat(0xffd43b), [0.02, 0.12, 0], null, [Math.PI / 2, 0.15, 0]));
      g.add(mesh(ico(0.12, 0), mat(0xf783ac), [-0.07, 0.82, 0]));
    } else if (kind === 'beanie') {
      const wool = mat(0x2f9e44);
      g.add(mesh(half(0.66), wool, [0, -0.2, 0], [1, 1.05, 1]));
      g.add(mesh(new THREE.CylinderGeometry(0.69, 0.69, 0.2, 10), mat(0xffffff), [0, -0.12, 0]));
      g.add(mesh(ico(0.16, 0), mat(0xffffff), [0, 0.5, 0]));
    } else if (kind === 'chef') {
      const white = mat(0xf8f9fa);
      g.add(mesh(new THREE.CylinderGeometry(0.48, 0.5, 0.42, 10), white, [0, 0.12, 0]));
      for (const [x, z] of [[-0.25, 0], [0.25, 0], [0, 0.22], [0, -0.22], [0, 0]]) g.add(mesh(ico(0.3, 0), white, [x, 0.48, z]));
    } else if (kind === 'cowboy') {
      const brown = mat(0x8b5a2b);
      g.add(mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.06, 12), brown, [0, -0.02, 0], [1, 1, 0.8]));
      g.add(mesh(new THREE.CylinderGeometry(0.4, 0.5, 0.48, 8), brown, [0, 0.24, 0]));
      g.add(mesh(new THREE.CylinderGeometry(0.505, 0.505, 0.08, 8), mat(0x3b2412), [0, 0.06, 0]));
    } else if (kind === 'wizard') {
      const blue = mat(0x3b2f8f);
      g.add(mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.05, 10), blue, [0, 0, 0]));
      g.add(mesh(new THREE.ConeGeometry(0.5, 1.25, 8), blue, [0.05, 0.62, 0], null, [0, 0, -0.22]));
      for (const [x, y] of [[-0.1, 0.35], [0.12, 0.7], [0.05, 0.15]]) g.add(mesh(new THREE.OctahedronGeometry(0.07, 0), mat(0xffd43b, { emissive: 0x7a5c00 }), [x, y, 0.42]));
    } else if (kind === 'viking') {
      const steel = mat(0xadb5bd, { metalness: 0.5, roughness: 0.4 });
      const horn = mat(0xfff3d6);
      g.add(mesh(half(0.66), steel, [0, -0.18, 0]));
      g.add(mesh(new THREE.BoxGeometry(0.1, 0.5, 0.06), steel, [0, 0.0, 0.62], null, [-0.3, 0, 0]));
      for (const s of [-1, 1]) g.add(mesh(new THREE.ConeGeometry(0.17, 0.75, 5), horn, [s * 0.72, 0.28, 0.05], null, [0, 0, -s * 0.75]));
    } else if (kind === 'halo') {
      g.add(mesh(new THREE.TorusGeometry(0.5, 0.07, 5, 12), mat(0xffe066, { emissive: 0xffc61a, emissiveIntensity: 0.9 }), [0, 0.38, 0], null, [Math.PI / 2 - 0.15, 0, 0]));
    }
    return g;
  }

  function build(p) {
    const color = COLORS.includes(p.color) ? p.color : COLORS[5];
    const shape = FACE_Z[p.shape] ? p.shape : 'round';
    const main = mat(color);
    const dark = mat(tint(color, 0.6));
    const light = mat(tint(color, 1.45));
    const z = FACE_Z[shape];

    const root = new THREE.Group();
    root.add(body(shape, main));
    root.add(ears(shape, main, mat(0xffb3c6)));
    // Yıldızın kolları ve bacakları kendi uçları; göbek, el ve ayak eklenmez
    if (shape !== 'star') {
      root.add(mesh(ico(0.55, 0), light, [0, -0.38, z - 0.28], [1, 0.75, 0.45]));
      for (const s of [-1, 1]) {
        root.add(mesh(ico(0.3, 0), dark, [s * 0.42, -0.98, 0.12], [1, 0.55, 1.35]));
        root.add(mesh(ico(0.26, 0), main, [s * 1.0, -0.15, 0.05], [0.75, 1.3, 0.75], [0, 0, s * 0.35]));
      }
    } else {
      // Çiçekli şort
      root.add(mesh(new THREE.BoxGeometry(1.0, 0.32, 0.95), mat(0x8ce99a), [0, -0.62, 0]));
      for (const [x, y] of [[-0.3, -0.58], [0.12, -0.68], [0.36, -0.55]]) root.add(mesh(ico(0.07, 0), mat(0xb197fc), [x, y, 0.49]));
    }
    for (const s of [-1, 1]) root.add(mesh(ico(0.12, 0), mat(0xff8fab), [s * 0.56, -0.04, z - 0.1], [1, 0.7, 0.3]));
    root.add(eyes(EYES[p.eyes] ? p.eyes : 'normal', z));
    root.add(mouth(MOUTHS[p.mouth] ? p.mouth : 'smile', z));
    if (p.hat) root.add(hat(p.hat, TOP_Y[shape], z));
    return root;
  }

  function makeScene() {
    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xffffff, 0x8899bb, 0.75));
    const sun = new THREE.DirectionalLight(0xffffff, 0.85);
    sun.position.set(3, 5, 4);
    scene.add(sun);
    const cam = new THREE.PerspectiveCamera(30, W / H, 0.1, 50);
    cam.position.set(0.9, 0.7, 6.2);
    cam.lookAt(0, 0.12, 0);
    return { scene, cam };
  }

  function disposeTree(obj) {
    obj.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
  }

  const key = p => [p.color, p.shape, p.eyes, p.mouth, p.hat].join('|');

  // ---- görüntü üretici (arena, listeler) ----
  let snapR = null, snap = null;
  const cache = new Map();

  function image(p) {
    const k = key(p);
    if (cache.has(k)) return cache.get(k);
    if (!snapR) {
      snapR = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
      snapR.setPixelRatio(1);
      snapR.setSize(W, H);
      snap = makeScene();
    }
    const c = build(p);
    c.rotation.y = -0.3;
    snap.scene.add(c);
    snapR.render(snap.scene, snap.cam);
    const url = snapR.domElement.toDataURL('image/png');
    snap.scene.remove(c);
    disposeTree(c);
    cache.set(k, url);
    return url;
  }

  // ---- canlı önizleme (karakter oluşturma ve lobi) ----
  let liveR = null, live = null, liveChar = null, liveKey = '', raf = 0;

  function loop(t) {
    raf = requestAnimationFrame(loop);
    if (!liveR.domElement.isConnected || !liveR.domElement.offsetParent) return;
    if (liveChar) {
      liveChar.rotation.y = Math.sin(t / 1400) * 0.7;
      liveChar.position.y = Math.abs(Math.sin(t / 500)) * 0.08;
    }
    liveR.render(live.scene, live.cam);
  }

  function preview(el, p) {
    if (!liveR) {
      liveR = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      liveR.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      liveR.setSize(W * 0.7, H * 0.7);
      liveR.domElement.className = 'live3d';
      live = makeScene();
      raf = requestAnimationFrame(loop);
    }
    if (liveR.domElement.parentNode !== el) el.appendChild(liveR.domElement);
    const k = key(p);
    if (k !== liveKey) {
      if (liveChar) { live.scene.remove(liveChar); disposeTree(liveChar); }
      liveChar = build(p);
      live.scene.add(liveChar);
      liveKey = k;
    }
  }

  return { image, preview };
})();
