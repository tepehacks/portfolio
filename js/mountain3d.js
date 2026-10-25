// Montagne 3D enneigée (Three.js r128, chargé depuis cdnjs).
// L'alpiniste est à sa position actuelle : les stages sont des camps SOUS lui,
// et il escalade vers le drapeau de l'alternance AU-DESSUS de lui.
(function () {
  const box = document.getElementById("mountain");
  const stage = document.getElementById("mountain-stage");
  const cardsBox = document.getElementById("climb-cards");
  const { experiences, goal } = window.CONTENT.climb;
  const App = window.App;

  const n = experiences.length;
  const T_FIRST = 0.2, T_LAST = 0.5; // zone des stages sur le sentier
  let T_ME = 0.72;                   // position actuelle de l'alpiniste (recalculée : sur l'aiguille)
  const T_GOAL = 0.985;              // drapeau de l'objectif
  const campT = experiences.map((_, i) => (n === 1 ? (T_FIRST + T_LAST) / 2 : T_FIRST + (i * (T_LAST - T_FIRST)) / (n - 1)));

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const narrow = matchMedia("(max-width: 900px)");

  // ------------------------------------------------------------------
  //  Étiquettes HTML : courtes sur la 3D, détail au survol
  //  (sur mobile ou sans WebGL : liste complète sous la montagne)
  // ------------------------------------------------------------------
  let cards = {};

  // drapeau animé (Lordicon) ; contour clair en mode sombre pour qu'il reste visible
  function flagIcon() {
    const th = document.documentElement.dataset.theme;
    const dark = th ? th === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    const colors = dark ? "primary:#efe9dc,secondary:#d9a441,tertiary:#ebe6ef" : "primary:#000000,secondary:#3a3347,tertiary:#ebe6ef";
    return `<lord-icon class="goal-flag" src="https://cdn.lordicon.com/hcfdembi.json" trigger="loop" state="loop-cycle" colors="${colors}"></lord-icon>`;
  }

  const campTags = document.createElement("div");
  campTags.className = "camp-tags";
  stage.appendChild(campTags);
  let tags = {};

  function renderCards() {
    const t = App.t, esc = App.esc;
    cardsBox.innerHTML = "";
    // version mobile : une petite étiquette (entreprise + poste) posée sur chaque camp
    campTags.innerHTML = "";
    tags = {};
    experiences.forEach((x, i) => {
      const el = document.createElement("div");
      el.className = "camp-tag";
      el.innerHTML = `<span class="num">${i + 1}</span><span><b>${esc(x.company)}</b><small>${esc(t(x.role))}</small></span>`;
      campTags.appendChild(el);
      tags["exp" + i] = el;
    });
    cards = {};
    const add = (key, cls, side, html) => {
      const el = document.createElement("div");
      el.className = `climb-card ${cls} ${side}`;
      el.dataset.side = side;
      if (key !== "me") el.tabIndex = 0;
      el.innerHTML = html;
      cardsBox.appendChild(el);
      cards[key] = el;
    };
    // Ordre du DOM = ordre sur mobile : objectif, puis du plus récent au plus ancien
    add("goal", "goal-card", "top", `
      <div class="label">${flagIcon()}<b>${esc(t(goal.short))}</b><small>${esc(t(goal.when))}</small></div>
      <div class="more">
        <h3>${esc(t(goal.title))}</h3>
        <p>${esc(t(goal.details))}</p>
        <a class="btn btn-primary" href="#contact">${esc(App.ui("contactMe"))}</a>
      </div>`);
    for (let i = n - 1; i >= 0; i--) {
      const x = experiences[i];
      add("exp" + i, "", (n - 1 - i) % 2 === 0 ? "right" : "left", `
        <div class="label"><span class="num">${i + 1}</span><b>${esc(x.company)}</b><small>${esc(t(x.dates))}</small></div>
        <div class="more">
          <div class="role">${esc(t(x.role))}</div>
          <p>${esc(t(x.summary))}</p>
          ${App.tags(x.stack)}
        </div>`);
    }
  }

  renderCards();
  document.addEventListener("themechange", renderCards);
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", renderCards);

  function webglOK() {
    try { const c = document.createElement("canvas"); return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl"))); }
    catch (e) { return false; }
  }
  if (!window.THREE || !webglOK()) {
    box.classList.add("flat");
    document.addEventListener("langchange", renderCards);
    return;
  }

  const THREE = window.THREE;

  // ------------------------------------------------------------------
  //  Scène
  // ------------------------------------------------------------------
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  stage.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xf6eee2, 140, 360);
  const camera = new THREE.PerspectiveCamera(38, 1, 0.5, 800);

  const hemi = new THREE.HemisphereLight(0xfff6e8, 0x8a7d70, 0.75);
  const sun = new THREE.DirectionalLight(0xffe2b8, 1.05);
  sun.position.set(80, 120, 90);
  scene.add(hemi, sun);

  // ------------------------------------------------------------------
  //  Relief
  // ------------------------------------------------------------------
  const H = 58, R = 72;
  function hgt(x, z) {
    const r = Math.hypot(x, z * 1.1);
    const a = Math.atan2(z, x);
    const base = Math.max(0, 1 - r / R);
    // près du sommet, les arêtes et le bruit s'effacent : l'aiguille a une face régulière où il grimpe
    const near = Math.max(0, 1 - r / 22), rough = 1 - 0.9 * near * near * (3 - 2 * near);
    let h = H * Math.pow(base, 1.35) * (1 + rough * (0.1 * Math.sin(a * 5 + r * 0.12) + 0.06 * Math.sin(a * 11 - r * 0.2)));
    h += rough * (1.6 * Math.sin(x * 0.35 + 1.3) * Math.cos(z * 0.31) + 0.8 * Math.sin(x * 0.9 + z * 0.7));
    // aiguille sommitale : une tour de roche raide, celle qu'il escalade
    const tw = Math.max(0, 1 - Math.hypot(x, z * 1.05) / 14);
    h += 17 * tw * tw * (3 - 2 * tw);
    return h;
  }
  function backHgt(x, z) {
    const r = Math.hypot(x, z);
    const a = Math.atan2(z, x);
    return 42 * Math.pow(Math.max(0, 1 - r / 62), 1.4) * (1 + 0.14 * Math.sin(a * 5 + r * 0.1)) + Math.sin(x * 0.4) * Math.cos(z * 0.35);
  }

  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  const SNOW = new THREE.Color(0xf6f2ea), SNOW_SHADE = new THREE.Color(0xe8e1d6);
  const ROCK = new THREE.Color(0x5f5a55), ROCK_LIGHT = new THREE.Color(0x77706a);

  function terrain(fn, size, seg) {
    let g = new THREE.PlaneGeometry(size, size, seg, seg);
    g.rotateX(-Math.PI / 2);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) p.setY(i, fn(p.getX(i), p.getZ(i)));
    g = g.toNonIndexed();
    g.computeVertexNormals();
    const pos = g.attributes.position, nor = g.attributes.normal;
    const colors = new Float32Array(pos.count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i += 3) {
      const ny = nor.getY(i);
      const y = (pos.getY(i) + pos.getY(i + 1) + pos.getY(i + 2)) / 3;
      const steep = ny < 0.4 + 0.06 * Math.sin(y * 0.7) && y > 4;
      if (steep) c.copy(ROCK).lerp(ROCK_LIGHT, rnd());
      else c.copy(SNOW).lerp(SNOW_SHADE, rnd() * 0.8);
      for (let k = 0; k < 3; k++) c.toArray(colors, (i + k) * 3);
    }
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.95 }));
  }

  scene.add(terrain(hgt, 280, 160));
  const back1 = terrain(backHgt, 160, 60); back1.position.set(-115, -3, -130); back1.scale.set(1.2, 1.1, 1);
  const back2 = terrain(backHgt, 160, 60); back2.position.set(125, -3, -150); back2.scale.set(1.1, 1.3, 1);
  scene.add(back1, back2);

  // ------------------------------------------------------------------
  //  Sentier sur la face avant (z > 0)
  // ------------------------------------------------------------------
  const PEAK = hgt(0, 0);
  function surfaceZ(x, y) {
    if (hgt(x, 0) < y) return null;
    let lo = 0, hi = R * 1.3;
    for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (hgt(x, m) > y) lo = m; else hi = m; }
    return lo;
  }
  function normalAt(x, z) {
    const e = 0.4;
    return new THREE.Vector3(-(hgt(x + e, z) - hgt(x - e, z)) / (2 * e), 1, -(hgt(x, z + e) - hgt(x, z - e)) / (2 * e)).normalize();
  }
  const pts = [];
  for (let i = 0; i <= 140; i++) {
    const s = i / 140;
    const y = 1.5 + s * (PEAK - 4.5);
    // lacets en bas, puis tout droit sur la face avant de l'aiguille
    let x = (20 * Math.pow(1 - s, 0.8) + 0.8) * Math.sin(s * Math.PI * 5.2) * Math.max(0, Math.min(1, (0.76 - s) / 0.1));
    let z = surfaceZ(x, y);
    while (z === null) { x *= 0.8; z = surfaceZ(x, y); }
    pts.push(new THREE.Vector3(x, hgt(x, z), z).addScaledVector(normalAt(x, z), 0.45));
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  // on le place sur la face avant de l'aiguille, à mi-hauteur, là où le sentier passe devant nous
  {
    let best = Infinity;
    for (let t = T_LAST + 0.12; t < 0.95; t += 0.002) {
      const q = curve.getPointAt(t);
      const score = Math.abs(q.x) + Math.abs(q.y - (PEAK - 17));
      if (score < best) { best = score; T_ME = t; }
    }
  }

  // trait plein : le chemin déjà parcouru (jusqu'à l'alpiniste).
  // Des rayures y défilent vers le bas : le sol "file" sous ses pieds.
  const TUBE_SEG = 700, TUBE_RAD = 8;
  const STRIPES = 140;          // nombre de rayures sur tout le sentier
  const TREAD_SPEED = 0.01;     // vitesse du "tapis roulant", en fraction du sentier par seconde
  const stripeCanvas = document.createElement("canvas");
  stripeCanvas.width = 64; stripeCanvas.height = 4;
  const sc = stripeCanvas.getContext("2d");
  sc.fillStyle = "#c8553d"; sc.fillRect(0, 0, 64, 4);
  sc.fillStyle = "#e9895f"; sc.fillRect(32, 0, 32, 4);
  const stripeTex = new THREE.CanvasTexture(stripeCanvas);
  stripeTex.wrapS = THREE.RepeatWrapping;
  stripeTex.repeat.set(STRIPES, 1);
  const tube = new THREE.Mesh(
    new THREE.TubeGeometry(curve, TUBE_SEG, 0.2, TUBE_RAD, false),
    new THREE.MeshStandardMaterial({ map: stripeTex, roughness: 0.7 })
  );
  tube.geometry.setDrawRange(0, Math.floor(T_ME * TUBE_SEG) * TUBE_RAD * 6);
  scene.add(tube);

  // pointillés : ce qu'il reste à grimper. Ils descendent du drapeau vers lui,
  // comme si le chemin venait à sa rencontre.
  const DOT_GAP = 0.007, DOT_FROM = T_ME + 0.02, DOT_TO = T_GOAL;
  const dotGeo = new THREE.SphereGeometry(0.22, 6, 4);
  const dotMat = new THREE.MeshStandardMaterial({ color: 0x3a3330, roughness: 0.7 });
  const dots = [];
  for (let t = DOT_FROM; t < DOT_TO; t += DOT_GAP) {
    const d = new THREE.Mesh(dotGeo, dotMat);
    d.userData.t0 = t;
    d.position.copy(curve.getPointAt(t));
    scene.add(d);
    dots.push(d);
  }

  // ------------------------------------------------------------------
  //  Camps (tentes) et drapeau
  // ------------------------------------------------------------------
  const flat = (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.8, flatShading: true });
  const anchors = {};

  campT.forEach((t, i) => {
    const p = curve.getPointAt(t);
    const g = new THREE.Group();
    const tent = new THREE.Mesh(new THREE.ConeGeometry(1.7, 2.3, 4), flat(0xc8553d));
    tent.rotation.y = Math.PI / 4; tent.position.y = 1.15;
    const door = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.2, 3), flat(0x2f4f3a));
    door.position.set(0, 0.6, 1.0);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.2, 5), flat(0x3a3330));
    pole.position.set(0, 3.2, 0);
    const pennant = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.1, 3), flat(0xd9a441));
    pennant.rotation.z = -Math.PI / 2; pennant.position.set(0.55, 3.95, 0);
    g.add(tent, door, pole, pennant);
    g.position.copy(p).add(new THREE.Vector3(0, -0.3, 0));
    g.scale.setScalar(1.6);
    scene.add(g);
    anchors["exp" + i] = p.clone().add(new THREE.Vector3(0, 4, 0));
  });

  const goalPos = curve.getPointAt(T_GOAL);
  const goalPole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 6, 6), flat(0x3a3330));
  goalPole.position.copy(goalPos).add(new THREE.Vector3(0, 3, 0));
  const flagGeo = new THREE.PlaneGeometry(3.2, 1.9, 10, 1);
  flagGeo.translate(1.6, 0, 0);
  const flagBase = flagGeo.attributes.position.array.slice();
  const flag = new THREE.Mesh(flagGeo, new THREE.MeshStandardMaterial({ color: 0xd9a441, side: THREE.DoubleSide, roughness: 0.7 }));
  flag.position.copy(goalPos).add(new THREE.Vector3(0.1, 5.0, 0));
  scene.add(goalPole, flag);
  anchors.goal = goalPos.clone().add(new THREE.Vector3(0, 7.2, 0)); // haut du mât

  // ------------------------------------------------------------------
  //  L'alpiniste
  // ------------------------------------------------------------------
  // Modèle "Alpinist" (Claude Design), porté sur Three.js r128 et articulé pour grimper.
  // r128 n'a pas de CapsuleGeometry : on la recrée avec un profil tourné (LatheGeometry).
  function capsule(r, l, capSeg = 8, radial = 28) {
    const pts = [];
    for (let i = 0; i <= capSeg; i++) { const a = -Math.PI / 2 + (i / capSeg) * (Math.PI / 2); pts.push(new THREE.Vector2(r * Math.cos(a), -l / 2 + r * Math.sin(a))); }
    for (let i = 0; i <= capSeg; i++) { const a = (i / capSeg) * (Math.PI / 2); pts.push(new THREE.Vector2(r * Math.cos(a), l / 2 + r * Math.sin(a))); }
    return new THREE.LatheGeometry(pts, radial);
  }

  function buildClimber() {
    const M = (color, rough = 0.7, metal = 0) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
    const mat = {
      skin: M(0x4a2a1a, 0.55), hair: M(0x141110, 0.9), jacket: M(0xd9551f, 0.6), pants: M(0x2b2e33, 0.85),
      boot: M(0xe2b62a, 0.55), sole: M(0x161616, 0.9), helmet: M(0xf1efe9, 0.35), rope: M(0x2a5fb8, 0.8),
      metal: M(0xb9bdc2, 0.3, 0.35), pack: M(0x3f5a3c, 0.8), lens: M(0x2a3c5a, 0.15, 0.2), eye: M(0xf4f0e8, 0.4)
    };
    const add = (parent, geo, m, p = [0, 0, 0], r = [0, 0, 0], sc = [1, 1, 1]) => {
      const mesh = new THREE.Mesh(geo, m);
      mesh.position.set(...p); mesh.rotation.set(...r); mesh.scale.set(...sc);
      parent.add(mesh); return mesh;
    };
    const cap = (r, l) => capsule(r, l);
    const sph = (r) => new THREE.SphereGeometry(r, 28, 18);
    const cyl = (a, b, h, sg = 24) => new THREE.CylinderGeometry(a, b, h, sg);
    const tor = (R, r, sg = 40) => new THREE.TorusGeometry(R, r, 10, sg);
    const box = (x, y, z) => new THREE.BoxGeometry(x, y, z);

    const root = new THREE.Group();

    // Jambes articulées : hanche (y 0.95) -> genou (y 0.56) -> chaussure
    const legs = [-1, 1].map((sd) => {
      const x = 0.115 * sd;
      const hip = new THREE.Group(); hip.position.set(x, 0.95, 0); root.add(hip);
      add(hip, cap(0.092, 0.3), mat.pants, [0, -0.19, 0]);
      add(hip, tor(0.1, 0.014), mat.rope, [0, -0.09, 0], [Math.PI / 2, 0, 0]);
      const knee = new THREE.Group(); knee.position.set(0, -0.39, 0); hip.add(knee);
      add(knee, sph(0.07), mat.pants, [0, 0, 0.035], [0, 0, 0], [1, 0.9, 0.7]);
      add(knee, cap(0.08, 0.28), mat.pants, [0, -0.16, 0.005]);
      add(knee, cyl(0.085, 0.09, 0.14), mat.boot, [0, -0.36, 0.01]);
      add(knee, cap(0.075, 0.16), mat.boot, [0, -0.465, 0.05], [Math.PI / 2, 0, 0], [1.05, 1, 0.85]);
      add(knee, box(0.15, 0.035, 0.32), mat.sole, [0, -0.542, 0.05]);
      add(knee, box(0.05, 0.12, 0.01), mat.sole, [0, -0.39, 0.095], [-0.35, 0, 0]);
      return { hip, knee };
    });
    add(root, cap(0.17, 0.08), mat.pants, [0, 0.95, 0], [0, 0, Math.PI / 2], [1, 1, 0.75]);

    // Torse / doudoune
    add(root, cap(0.2, 0.32), mat.jacket, [0, 1.24, 0], [0, 0, 0], [1.15, 1, 0.78]);
    [1.08, 1.2, 1.32, 1.43].forEach((y) => add(root, tor(0.205, 0.022), mat.jacket, [0, y, 0], [Math.PI / 2, 0, 0], [1.13, 0.78, 1]));
    add(root, box(0.012, 0.42, 0.01), mat.sole, [0, 1.26, 0.163]);
    add(root, cyl(0.1, 0.13, 0.11), mat.jacket, [0, 1.53, 0]);
    add(root, tor(0.12, 0.04), mat.jacket, [0, 1.5, -0.03], [Math.PI / 2 + 0.25, 0, 0]);

    // Baudrier
    add(root, tor(0.215, 0.022), mat.rope, [0, 1.0, 0], [Math.PI / 2, 0, 0], [1.08, 0.78, 1]);
    add(root, tor(0.035, 0.009), mat.rope, [0, 0.95, 0.17]);
    [[-0.13, 0.98, 0.15], [0.14, 0.98, 0.14], [0.2, 0.97, 0.06]].forEach((p) =>
      add(root, tor(0.028, 0.006), mat.metal, p, [0, 0.4 * (p[0] > 0 ? 1 : -1), 0], [0.7, 1.2, 1]));

    // Tête
    const head = new THREE.Group(); head.position.set(0, 1.71, 0.01); root.add(head);
    add(root, cyl(0.055, 0.06, 0.1), mat.skin, [0, 1.6, 0]);
    add(head, sph(0.115), mat.skin, [0, 0, 0], [0, 0, 0], [0.95, 1.12, 1]);
    add(head, sph(0.112), mat.hair, [0, -0.045, 0.012], [0, 0, 0], [0.93, 0.8, 0.95]);
    add(head, sph(0.1), mat.skin, [0, -0.01, 0.025], [0, 0, 0], [0.82, 0.7, 0.9]);
    add(head, sph(0.026), mat.skin, [0, -0.005, 0.11], [0, 0, 0], [1.1, 0.9, 0.9]);
    add(head, box(0.04, 0.008, 0.01), mat.sole, [0, -0.05, 0.108]);
    for (const sd of [-1, 1]) {
      add(head, sph(0.025), mat.skin, [0.108 * sd, 0, -0.005], [0, 0, 0], [0.5, 1, 0.8]);
      add(head, sph(0.014), mat.eye, [0.038 * sd, 0.025, 0.098]);
      add(head, sph(0.008), mat.sole, [0.038 * sd, 0.025, 0.11]);
      add(head, box(0.035, 0.008, 0.01), mat.hair, [0.04 * sd, 0.05, 0.103], [0, 0, -0.12 * sd]);
    }
    // Casque + lunettes
    add(head, new THREE.SphereGeometry(0.13, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5), mat.helmet, [0, 0.035, -0.005], [-0.12, 0, 0], [0.98, 0.95, 1.05]);
    add(head, tor(0.128, 0.009, 48), mat.sole, [0, 0.035, -0.005], [Math.PI / 2 - 0.12, 0, 0], [0.98, 1.05, 1]);
    add(head, box(0.02, 0.01, 0.12), mat.sole, [0, 0.16, -0.02], [-0.12, 0, 0]);
    add(head, tor(0.124, 0.011, 48), mat.rope, [0, 0.08, -0.002], [Math.PI / 2 - 0.25, 0, 0], [0.98, 1.06, 1]);
    for (const sd of [-1, 1]) {
      add(head, cyl(0.03, 0.03, 0.02), mat.sole, [0.038 * sd, 0.1, 0.1], [Math.PI / 2 - 0.6, 0, 0]);
      add(head, cyl(0.024, 0.024, 0.006), mat.lens, [0.038 * sd, 0.105, 0.108], [Math.PI / 2 - 0.6, 0, 0]);
    }

    // Bras : épaule -> coude -> gant
    const arms = [1, -1].map((sd) => {
      const sh = new THREE.Group(); sh.position.set(0.27 * sd, 1.43, 0); root.add(sh);
      add(sh, sph(0.09), mat.jacket);
      add(sh, cap(0.075, 0.2), mat.jacket, [0, -0.15, 0]);
      const el = new THREE.Group(); el.position.set(0, -0.3, 0); sh.add(el);
      add(el, cap(0.068, 0.18), mat.jacket, [0, -0.12, 0]);
      add(el, cyl(0.07, 0.07, 0.04), mat.sole, [0, -0.25, 0]);
      add(el, sph(0.065), mat.sole, [0, -0.31, 0], [0, 0, 0], [0.9, 1.1, 1]);
      return { shoulder: sh, elbow: el, sgn: sd };
    });

    // Piolet accroché au baudrier (les mains sont prises par la paroi)
    const axe = new THREE.Group();
    axe.position.set(-0.24, 0.8, -0.04); axe.rotation.set(0.1, 0, 0.14);
    root.add(axe);
    add(axe, cyl(0.016, 0.016, 0.62), mat.rope, [0, -0.2, 0]);
    add(axe, cyl(0.019, 0.019, 0.12), mat.sole, [0, -0.45, 0]);
    add(axe, new THREE.ConeGeometry(0.016, 0.07, 16), mat.metal, [0, -0.545, 0], [Math.PI, 0, 0]);
    add(axe, box(0.03, 0.04, 0.09), mat.metal, [0, 0.12, 0]);
    add(axe, box(0.012, 0.025, 0.16), mat.metal, [0, 0.105, 0.11], [0.25, 0, 0]);
    add(axe, box(0.035, 0.012, 0.08), mat.metal, [0, 0.13, -0.08], [-0.2, 0, 0]);

    // Sac à dos + corde enroulée
    const pack = new THREE.Group(); pack.position.set(0, 1.22, -0.2); root.add(pack);
    add(pack, cap(0.16, 0.3), mat.pack, [0, 0, -0.04], [0, 0, 0], [1.15, 1, 0.62]);
    add(pack, sph(0.15), mat.pack, [0, 0.27, -0.04], [0, 0, 0], [1.15, 0.45, 0.7]);
    add(pack, cap(0.09, 0.12), mat.pack, [0, -0.08, -0.14], [0, 0, 0], [1.2, 1, 0.5]);
    for (let i = 0; i < 5; i++)
      add(pack, tor(0.15, 0.018), mat.rope, [0, 0.36 + i * 0.006, -0.04 + (i - 2) * 0.012], [Math.PI / 2 + 0.12, 0, (i - 2) * 0.06], [1.1, 0.75, 1]);
    for (const sd of [-1, 1]) add(root, box(0.05, 0.42, 0.015), mat.sole, [0.11 * sd, 1.27, 0.158], [-0.08, 0, 0.06 * sd]);
    add(root, box(0.24, 0.025, 0.012), mat.sole, [0, 1.33, 0.168]);

    return { root, head, arms, legs };
  }

  const climber = buildClimber();

  // Il est sur la face de l'aiguille : orienté face à la roche, incliné comme la pente
  const CLIMBER_SCALE = 5.4;
  const WALL_Z = 0.27;                              // distance entre son corps et la roche (unités du modèle)
  const meC = curve.getPointAt(T_ME);
  // orientation : face au cœur de l'aiguille (on le voit de dos), inclinaison moyennée sur la face
  // (une normale prise en un seul point peut tomber sur une arête et le mettre de profil)
  const facing = new THREE.Vector3(-meC.x, 0, -meC.z).normalize();
  const nAvg = new THREE.Vector3();
  for (const dx of [-2.5, 0, 2.5]) for (const dy of [-2.5, 0, 2.5]) nAvg.add(normalAt(meC.x + dx, meC.z + dy));
  nAvg.normalize();
  const tiltX = Math.min(Math.asin(Math.min(1, nAvg.y)), 0.8);
  // normale "propre" de la face : vers nous (−facing), relevée de l'inclinaison
  const nW = facing.clone().negate().multiplyScalar(Math.cos(tiltX)).add(new THREE.Vector3(0, Math.sin(tiltX), 0)).normalize();
  const meP = new THREE.Vector3(meC.x, hgt(meC.x, meC.z), meC.z).addScaledVector(nW, WALL_Z * CLIMBER_SCALE);

  const rig = new THREE.Group();                    // repère commun : lui + ses prises
  rig.position.copy(meP);
  rig.rotation.order = "YXZ";
  rig.rotation.y = Math.atan2(facing.x, facing.z);   // +z du rig = vers la roche
  rig.rotation.x = tiltX;                             // même inclinaison que la face
  rig.scale.setScalar(CLIMBER_SCALE);
  rig.add(climber.root);
  scene.add(rig);
  rig.updateMatrixWorld(true);
  // on vérifie qu'aucune partie de son corps (tête, torse, hanches, jambes) ne rentre dans la roche,
  // et on l'écarte juste ce qu'il faut sinon
  {
    const probe = new THREE.Vector3();
    const body = [];
    for (const x of [-0.2, 0, 0.2]) for (let y = 0.9; y <= 1.76; y += 0.12) body.push([x, y, 0.17]); // torse
    for (const x of [-0.06, 0.06]) for (let y = 1.6; y <= 1.86; y += 0.08) body.push([x, y, 0.13]);   // tête
    for (const x of [-0.18, 0, 0.18]) for (let y = 0.15; y <= 0.9; y += 0.12) body.push([x, y, 0.2]); // hanches, jambes
    let push = 0;
    body.forEach(([x, y, z]) => {
      probe.set(x, y, z).applyMatrix4(rig.matrixWorld);
      const clearance = (probe.y - hgt(probe.x, probe.z)) * nW.y; // > 0 : devant la roche
      push = Math.max(push, 0.15 - clearance);
    });
    if (push > 0) { rig.position.addScaledVector(nW, push); rig.updateMatrixWorld(true); }
  }
  const rigInv = rig.matrixWorld.clone().invert();

  // pose un point (x, y du rig) sur la vraie roche de l'aiguille, décollé de "lift" (unités monde)
  const _w = new THREE.Vector3();
  function onRock(out, x, y, lift) {
    _w.set(x, y, WALL_Z).applyMatrix4(rig.matrixWorld);
    for (let k = 0; k < 3; k++) _w.addScaledVector(nW, (hgt(_w.x, _w.z) - _w.y) * nW.y);
    _w.addScaledVector(nW, lift);
    return out.copy(_w).applyMatrix4(rigInv);
  }

  // ------------------------------------------------------------------
  //  L'escalade : il s'accroche à la roche, se hisse, puis va chercher la prise suivante.
  //  Il reste sur place : ce sont ses points d'appui qui descendent le long de la roche.
  //  Un seul membre bouge à la fois, comme un vrai grimpeur :
  //  main gauche → pied droit → main droite → pied gauche.
  // ------------------------------------------------------------------
  const HOLD_GAP = 0.42;        // hauteur gagnée à chaque mouvement d'un membre
  const GRIP = 0.8;             // part du cycle où la main / le pied reste accroché
  const CLIMB_SPEED = 0.26;     // vitesse de l'ascension (unités du modèle / s)

  // arms[0] = bras gauche (x+), arms[1] = bras droit (x−) ; legs[0] = jambe droite (x−), legs[1] = jambe gauche (x+)
  const limbs = [
    { kind: "arm", ref: climber.arms[0], side: 1, x: 0.22, yHigh: 1.98, o: 0.75, L1: 0.3, L2: 0.31, lift: 0.38, arc: 0.7 },
    { kind: "arm", ref: climber.arms[1], side: -1, x: -0.22, yHigh: 1.98, o: 0.25, L1: 0.3, L2: 0.31, lift: 0.38, arc: 0.7 },
    { kind: "leg", ref: climber.legs[0], side: -1, x: -0.18, yHigh: 0.56, o: 0.5, L1: 0.39, L2: 0.5, lift: 0.8, arc: 0.6 },
    { kind: "leg", ref: climber.legs[1], side: 1, x: 0.18, yHigh: 0.56, o: 0.0, L1: 0.39, L2: 0.5, lift: 0.8, arc: 0.6 }
  ];

  // --- cinématique inverse à deux os (bras : épaule→coude→main, jambe : hanche→genou→pied)
  const _v = new THREE.Vector3(), _u = new THREE.Vector3(), _n = new THREE.Vector3();
  const _x = new THREE.Vector3(), _y = new THREE.Vector3(), _z = new THREE.Vector3(), _m = new THREE.Matrix4();
  function solveIK(upper, lower, L1, L2, target, pole) {
    _v.copy(target).sub(upper.position);
    const d = Math.min(Math.max(_v.length(), Math.abs(L1 - L2) + 1e-3), L1 + L2 - 1e-3);
    _v.normalize();
    const a = Math.acos((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d)); // angle à l'épaule / la hanche
    const e = Math.acos((L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2)); // angle au coude / genou
    _n.crossVectors(_v, pole).normalize();
    _u.copy(_v).applyAxisAngle(_n, a);       // direction du premier os, plié vers le "pôle"
    _y.copy(_u).negate(); _x.copy(_n); _z.crossVectors(_x, _y);
    _m.makeBasis(_x, _y, _z);
    upper.quaternion.setFromRotationMatrix(_m);
    lower.rotation.set(-(Math.PI - e), 0, 0);
  }
  // direction vers laquelle se plient les coudes (vers le bas, un peu dehors)
  // et les genoux (ouverts vers l'extérieur, pas vers la roche)
  const pole = (l) => l.kind === "arm" ? _pole.set(0.55 * l.side, -1, -0.2) : _pole.set(0.95 * l.side, 0.15, 0.25);
  const _pole = new THREE.Vector3();

  // où est la main / le pied à cet instant (dans le repère du rig), posé sur la roche
  function limbState(l, scroll, out) {
    const cyc = scroll / HOLD_GAP + l.o;
    const p = cyc - Math.floor(cyc);
    if (p < GRIP) { onRock(out, l.x, l.yHigh - p * HOLD_GAP, l.lift); return 0; } // accroché : descend avec la roche
    const q = (p - GRIP) / (1 - GRIP);
    const e = q * q * (3 - 2 * q);                    // départ et arrivée en douceur
    const from = l.yHigh - GRIP * HOLD_GAP;
    const to = l.yHigh - p * HOLD_GAP + HOLD_GAP;      // la prise suivante, plus haut
    const arc = Math.sin(Math.PI * q);
    onRock(out, l.x + 0.05 * arc * l.side, from + (to - from) * e, l.lift + l.arc * arc);
    return arc;                                        // 0 = accroché, 1 = en plein mouvement
  }

  const target = new THREE.Vector3();
  const rootInv = new THREE.Matrix4();
  let scroll = 0.2;

  function climb(scroll) {
    const root = climber.root;
    const c = (scroll / HOLD_GAP) * Math.PI * 2;      // un tour = chaque membre a bougé une fois

    // le corps vit : il fait passer son poids d'un pied à l'autre, se tourne vers la main qui monte,
    // se hisse après chaque prise de main et se colle à la roche en tirant
    root.position.set(
      0.06 * Math.sin(c + 0.6),
      0.05 * (0.5 + 0.5 * Math.sin(2 * c - 1.2)),
      0.015 * (0.5 + 0.5 * Math.sin(2 * c - 1.2))
    );
    root.rotation.set(0.04, 0.1 * Math.sin(c + 2.2), -0.05 * Math.sin(c + 0.6));
    root.updateMatrix();
    rootInv.copy(root.matrix).invert();

    let lookL = 0, lookR = 0;
    limbs.forEach((l) => {
      const moving = limbState(l, scroll, target);
      if (l.kind === "arm") { if (l.side > 0) lookL = moving; else lookR = moving; }
      target.applyMatrix4(rootInv);                   // dans le repère du corps
      if (l.kind === "arm") solveIK(l.ref.shoulder, l.ref.elbow, l.L1, l.L2, target, pole(l));
      else solveIK(l.ref.hip, l.ref.knee, l.L1, l.L2, target, pole(l));
    });
    // il suit des yeux la main qui va chercher la prise
    climber.head.rotation.set(-0.42 - 0.18 * Math.max(lookL, lookR), 0.4 * (lookL - lookR), 0);
  }
  climb(scroll);

  // ------------------------------------------------------------------
  //  Neige qui tombe
  // ------------------------------------------------------------------
  const FLAKES = 1400;
  const flakePos = new Float32Array(FLAKES * 3);
  for (let i = 0; i < FLAKES; i++) {
    flakePos[i * 3] = (rnd() - 0.5) * 220;
    flakePos[i * 3 + 1] = rnd() * 100;
    flakePos[i * 3 + 2] = (rnd() - 0.5) * 160 + 30;
  }
  const flakeGeo = new THREE.BufferGeometry();
  flakeGeo.setAttribute("position", new THREE.BufferAttribute(flakePos, 3));
  const flakeMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.55, transparent: true, opacity: 0.9, depthWrite: false });
  scene.add(new THREE.Points(flakeGeo, flakeMat));

  function updateSnow(dt, time) {
    const a = flakeGeo.attributes.position.array;
    for (let i = 0; i < FLAKES; i++) {
      a[i * 3 + 1] -= dt * (3 + (i % 5));
      a[i * 3] += Math.sin(time * 0.6 + i) * dt * 1.2;
      if (a[i * 3 + 1] < -2) a[i * 3 + 1] = 100;
    }
    flakeGeo.attributes.position.needsUpdate = true;
  }

  // ------------------------------------------------------------------
  //  Effet "il avance" : il fait du sur-place, mais le monde défile
  // ------------------------------------------------------------------
  const backward = curve.getTangentAt(T_ME).negate(); // vers le bas du sentier
  const puffGeo = new THREE.SphereGeometry(0.55, 8, 6);
  const puffs = Array.from({ length: 10 }, () => {
    const m = new THREE.Mesh(puffGeo, new THREE.MeshBasicMaterial({ color: 0xd6cdbf, transparent: true, opacity: 0, depthWrite: false }));
    m.visible = false; m.userData = { life: 0, vel: new THREE.Vector3() };
    scene.add(m);
    return m;
  });
  let lastStep = 0, puffIndex = 0;

  function updateTreadmill(dt, time) {
    // sol qui file sous ses pieds
    stripeTex.offset.x = (time * TREAD_SPEED * STRIPES) % 1;
    // pointillés qui viennent vers lui (et rapetissent à ses pieds / près du drapeau)
    const range = DOT_TO - DOT_FROM;
    const shift = (time * TREAD_SPEED) % range;
    dots.forEach((d) => {
      let t = d.userData.t0 - shift;
      if (t < DOT_FROM) t += range;
      d.position.copy(curve.getPointAt(t));
      const edge = Math.min(t - DOT_FROM, DOT_TO - t) / 0.03;
      d.scale.setScalar(Math.max(0.05, Math.min(1, edge)));
    });
    // petit nuage de neige à chaque pas, qui part derrière lui
    const step = Math.floor(phi / Math.PI);
    if (step !== lastStep) {
      lastStep = step;
      const m = puffs[puffIndex++ % puffs.length];
      m.position.copy(meP).add(new THREE.Vector3((rnd() - 0.5) * 1.2, 0.3, (rnd() - 0.5) * 1.2));
      m.userData.vel.copy(facing).multiplyScalar(-0.8 - rnd() * 0.6).add(new THREE.Vector3((rnd() - 0.5) * 1.2, -3.5 - rnd() * 2, 0));
      m.userData.life = 1;
      m.visible = true;
    }
    puffs.forEach((m) => {
      if (!m.visible) return;
      m.userData.life -= dt * 1.3;
      if (m.userData.life <= 0) { m.visible = false; return; }
      m.position.addScaledVector(m.userData.vel, dt);
      m.scale.setScalar(0.6 + (1 - m.userData.life) * 1.6);
      m.material.opacity = 0.75 * m.userData.life;
    });
  }

  // ------------------------------------------------------------------
  //  Thème clair / sombre
  // ------------------------------------------------------------------
  function isDark() {
    const th = document.documentElement.dataset.theme;
    return th ? th === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  }
  function applyTheme() {
    const dark = isDark();
    const fog = getComputedStyle(document.documentElement).getPropertyValue("--sky-bottom").trim() || "#f6eee2";
    scene.fog.color.set(fog);
    hemi.intensity = dark ? 0.42 : 0.75;
    hemi.color.set(dark ? 0xd8d2c8 : 0xfff6e8);
    sun.intensity = dark ? 0.55 : 1.05;
    sun.color.set(dark ? 0xe8e0d0 : 0xffe2b8);
    flakeMat.opacity = dark ? 0.95 : 0.8;
    requestRender();
  }
  document.addEventListener("themechange", applyTheme);
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applyTheme);

  // ------------------------------------------------------------------
  //  Caméra : vue fixe sur l'alpiniste, ses camps et le drapeau
  // ------------------------------------------------------------------
  // Cadrage automatique : quelle que soit la taille de l'écran, tout le parcours tient dans la carte
  // (chaque camp de stage, l'alpiniste, le drapeau et la place pour son étiquette au-dessus).
  const VIEW_DIR = new THREE.Vector3(0, 8, 92).normalize(); // angle de vue (légèrement en plongée)
  const keyPoints = [];
  campT.forEach((t) => {
    const p = curve.getPointAt(t);
    keyPoints.push(p.clone().add(new THREE.Vector3(0, -2.5, 0)), p.clone().add(new THREE.Vector3(0, 7, 0)));
  });
  keyPoints.push(meP.clone(), meP.clone().add(new THREE.Vector3(0, 11, 0)), goalPos.clone().add(new THREE.Vector3(0, 7.2, 0)));
  // limites dans l'écran (−1 … 1) : on garde de la marge, surtout en haut pour l'étiquette du drapeau
  const FIT = { x: 0.84, top: 0.66, bottom: -0.86 };
  const camLook = new THREE.Vector3();
  const _p = new THREE.Vector3();

  function fits(look, dist) {
    camera.position.copy(look).addScaledVector(VIEW_DIR, dist);
    camera.lookAt(look);
    camera.updateMatrixWorld();
    let ymin = Infinity, ymax = -Infinity, ok = true;
    keyPoints.forEach((k) => {
      _p.copy(k).project(camera);
      if (Math.abs(_p.x) > FIT.x || _p.y > FIT.top || _p.y < FIT.bottom) ok = false;
      ymin = Math.min(ymin, _p.y); ymax = Math.max(ymax, _p.y);
    });
    return { ok, ymin, ymax };
  }

  function fitCamera() {
    // point visé : le centre des étapes, puis recentré verticalement dans la zone utile
    const box3 = new THREE.Box3().setFromPoints(keyPoints);
    box3.getCenter(camLook);
    for (let pass = 0; pass < 3; pass++) {
      let lo = 20, hi = 900;
      for (let i = 0; i < 28; i++) { const d = (lo + hi) / 2; if (fits(camLook, d).ok) hi = d; else lo = d; }
      const r = fits(camLook, hi);
      const want = (FIT.top + FIT.bottom) / 2, mid = (r.ymin + r.ymax) / 2;
      const worldPerNdc = hi * Math.tan((camera.fov * Math.PI) / 360);
      camLook.y += (mid - want) * worldPerNdc;          // remonte / descend la visée pour centrer
      if (pass === 2) fits(camLook, hi);
    }
  }


  // vue fixe : pas de zoom (Ctrl + molette, pincement du pavé tactile) sur la montagne
  box.addEventListener("wheel", (e) => { if (e.ctrlKey) e.preventDefault(); }, { passive: false });

  // ------------------------------------------------------------------
  //  Étiquettes collées à la 3D
  // ------------------------------------------------------------------
  const proj = new THREE.Vector3();
  function positionTags() {
    const w = stage.clientWidth, h = stage.clientHeight;
    for (const key in tags) {
      const el = tags[key];
      proj.copy(anchors[key]).project(camera);
      const x = ((proj.x + 1) / 2) * w, y = ((1 - proj.y) / 2) * h;
      // au-dessus du drapeau du camp, centrée, sans cacher la tente ni sortir du cadre
      const wEl = el.offsetWidth, hEl = el.offsetHeight;
      el.style.left = Math.max(6, Math.min(w - 6 - wEl, x - wEl / 2)) + "px";
      el.style.top = Math.max(6, y - hEl - 10) + "px";
    }
  }
  function positionCards() {
    if (narrow.matches) { positionTags(); return; }
    const w = stage.clientWidth, h = stage.clientHeight;
    for (const key in cards) {
      const a = anchors[key];
      if (!a) continue;
      proj.copy(a).project(camera);
      const el = cards[key];
      el.classList.toggle("off", key !== "goal" && (proj.z > 1 || Math.abs(proj.x) > 1.05 || Math.abs(proj.y) > 1.05));
      let y = ((1 - proj.y) / 2) * h;
      const x = ((proj.x + 1) / 2) * w;
      if (el.dataset.side === "top") {
        // au-dessus de son point, centrée, sans sortir du cadre
        const wEl = el.offsetWidth;
        el.style.left = Math.max(8, Math.min(w - 8 - wEl, x - wEl / 2)) + "px";
        el.style.top = Math.max(8, y - el.offsetHeight - 8) + "px";
        continue;
      }
      { const half = el.offsetHeight / 2 + 10; y = Math.max(half, Math.min(h - half, y)); }
      // côté préféré, sauf si la fiche sortirait du cadre
      {
        // on raisonne sur la largeur de la fiche ouverte, pour qu'elle ne change pas de côté au survol
        const need = Math.max(el.offsetWidth, 270);
        const roomRight = w - 8 - (x + 30), roomLeft = x - 30 - 8;
        let side = el.dataset.side;
        if (side === "right" && roomRight < need) side = roomLeft > roomRight ? "left" : "right";
        else if (side === "left" && roomLeft < need) side = roomRight > roomLeft ? "right" : "left";
        el.classList.toggle("right", side === "right");
        el.classList.toggle("left", side === "left");
        // garde l'étiquette entière dans le cadre, même si elle est longue
        const wEl = el.offsetWidth;
        let left = side === "right" ? x + 30 : x - 30 - wEl;
        left = Math.max(8, Math.min(w - 8 - wEl, left));
        el.style.left = left + "px";
        el.style.top = y + "px";
      }
    }
  }

  // ------------------------------------------------------------------
  //  Boucle (seulement quand la montagne est visible)
  // ------------------------------------------------------------------
  let phi = 0, visible = false, raf = 0, last = 0, clockT = 0;

  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    fitCamera();
    requestRender();
  }
  new ResizeObserver(resize).observe(stage);

  function frame(now) {
    raf = 0;
    const dt = Math.min(0.05, (now - (last || now)) / 1000);
    last = now;
    clockT += dt;

    if (!reduced) scroll += dt * CLIMB_SPEED;
    phi = (scroll / HOLD_GAP) * Math.PI * 2;
    climb(scroll);


    if (!reduced) {
      updateSnow(dt, clockT);
      updateTreadmill(dt, clockT);
      const fa = flagGeo.attributes.position.array;
      for (let i = 0; i < fa.length; i += 3) {
        const x = flagBase[i];
        fa[i + 2] = flagBase[i + 2] + Math.sin(clockT * 4 + x * 1.8) * 0.18 * x;
      }
      flagGeo.attributes.position.needsUpdate = true;
    }

    renderer.render(scene, camera);
    positionCards();

    if (visible && !reduced) raf = requestAnimationFrame(frame);
  }

  function requestRender() { if (!raf) raf = requestAnimationFrame(frame); }

  document.addEventListener("langchange", () => { renderCards(); requestRender(); });

  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    if (visible) { last = 0; requestRender(); }
  }, { threshold: 0.05 }).observe(stage);

  applyTheme();
  resize();
})();
