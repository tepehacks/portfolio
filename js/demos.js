// Aperçus animés des projets (mini-démos en HTML/CSS).
// Chaque démo avance par étapes : la classe .s1, .s2, ... est ajoutée au fil du temps,
// puis tout repart à zéro. Le CSS (css/demos.css) décide de ce que fait chaque étape.
(function () {
  const L = (fr, en) => (window.App.lang === "en" ? en : fr);

  const DEMOS = {
    // Vraies captures du site : chaque écran s'affiche, les longs défilent
    garoit: {
      shots: [
        { src: "assets/img/projects/garoit-home.jpg", url: "garoit.fr", scroll: true, ms: 9000 },
        { src: "assets/img/projects/garoit-ticket.jpg", url: "garoit.fr/#reserver", ms: 4500 },
        { src: "assets/img/projects/garoit-login.jpg", url: "garoit.fr/#connexion", ms: 4000 }
      ]
    },

    intopdf: {
      url: "Convertisseur PDF",
      steps: [500, 500, 500, 700, 1400, 1600],
      html: () => `
        <div class="p-zone">
          <div class="p-hint">${L("Glissez vos fichiers ici", "Drop your files here")}</div>
          ${[["docx", "rapport"], ["xlsx", "budget"], ["png", "photo"]].map(([ext, name], i) => `
            <div class="p-file f${i + 1}">
              <span class="p-ext ${ext}">${ext.toUpperCase()}</span><span class="p-ext pdf">PDF</span>
              <span class="p-name">${name}.<em class="e1">${ext}</em><em class="e2">pdf</em></span>
              <span class="p-ok">✓</span>
            </div>`).join("")}
          <div class="p-bar"><i></i></div>
          <div class="p-done">${L("3 fichiers convertis · 100 % local", "3 files converted · 100% local")}</div>
        </div>`
    },

    seloger: {
      url: "terminal",
      steps: [600, 900, 1200, 800, 800, 900, 1800],
      html: () => `
        <div class="t-term">
          <div class="t-line t1"><span class="t-p">$</span> python main.py --ville "Lyon" --budget 900</div>
          <div class="t-line t2">› ${L("Recherche", "Search")} : <b>87</b> ${L("annonces trouvées", "listings found")}</div>
          <div class="t-line t3">› ${L("Extraction", "Parsing")} (8 threads) <span class="t-prog"><i></i></span></div>
          <div class="t-line t4 ok">✓ T2 · 42 m² · 860 € — ${L("contact envoyé", "message sent")}</div>
          <div class="t-line t5 ok">✓ Studio · 28 m² · 640 € — ${L("contact envoyé", "message sent")}</div>
          <div class="t-line t6">↳ annonces_contactees.xlsx ${L("mis à jour", "updated")} <b>(+12)</b></div>
        </div>`
    },

    gestion: {
      shots: [
        { src: "assets/img/projects/rh-employees.jpg", url: "gestion-rh / employés", ms: 4500 },
        { src: "assets/img/projects/rh-shifts.jpg", url: "gestion-rh / plannings", ms: 4500 },
        { src: "assets/img/projects/rh-shift-edit.jpg", url: "gestion-rh / créneau", ms: 4000 },
        { src: "assets/img/projects/rh-absences.jpg", url: "gestion-rh / absences", ms: 4500 }
      ]
    },

    taskly: {
      shots: [
        { src: "assets/img/projects/tm-projects.jpg", url: "taskly / projets", ms: 4000 },
        { src: "assets/img/projects/tm-board.jpg", url: "taskly / tableau", ms: 4500 },
        { src: "assets/img/projects/tm-task.jpg", url: "taskly / tâche", ms: 4500 },
        { src: "assets/img/projects/tm-done.jpg", url: "taskly / terminées", ms: 4000 },
        { src: "assets/img/projects/tm-home.jpg", url: "taskly / accueil", ms: 4000 }
      ]
    },

    tvdisplay: {
      shots: [
        // vidéo : la liste des collaborateurs défile (lue en ×2 pour qu'on voie bien le mouvement)
        { video: "assets/video/tv-calendar.webm", src: "assets/img/projects/tv-calendar.jpg", url: "tv-display · planning de l'équipe", ms: 7200, rate: 2, fit: "contain" }
      ]
    },

    kedzi: {
      shots: [
        { src: "assets/img/projects/kedzi-home.jpg", url: "kedzi.tg", scroll: true, ms: 11000 },
        { src: "assets/img/projects/kedzi-login.jpg", url: "kedzi.tg/connexion", ms: 4500 }
      ]
    }
  };

  // ---------- moteur des étapes ----------
  const timers = new WeakMap();
  let mounted = [];

  function runShots(el, demo) {
    const shots = el.querySelectorAll(".shot");
    const url = el.querySelector(".demo-bar span");
    let i = 0;
    const show = () => {
      shots.forEach((s, k) => {
        s.classList.toggle("active", k === i);
        const v = s.querySelector("video");
        if (!v) return;
        if (k === i) { v.currentTime = 0; v.playbackRate = demo.shots[k].rate || 1; v.play().catch(() => {}); }
        else v.pause();
      });
      url.textContent = demo.shots[i].url;
      timers.set(el, setTimeout(() => { i = (i + 1) % shots.length; show(); }, demo.shots[i].ms));
    };
    show();
  }

  function run(el) {
    const demo = DEMOS[el.dataset.demo];
    el.classList.add("playing");
    if (demo.shots) return runShots(el, demo);
    let i = 0;
    const next = () => {
      if (i < demo.steps.length) {
        el.classList.add("s" + (i + 1));
        timers.set(el, setTimeout(next, demo.steps[i++]));
      } else {
        for (let k = 1; k <= demo.steps.length; k++) el.classList.remove("s" + k);
        i = 0;
        timers.set(el, setTimeout(next, 700));
      }
    };
    next();
  }
  // On arrête une démo et on la remet à son début (pour qu'elle reparte proprement)
  function stop(el) {
    clearTimeout(timers.get(el));
    timers.delete(el);
    el.classList.remove("playing");
    const d = DEMOS[el.dataset.demo];
    if (d.steps) d.steps.forEach((_, k) => el.classList.remove("s" + (k + 1)));
    if (d.shots) {
      el.querySelectorAll("video").forEach((v) => v.pause());
      el.querySelectorAll(".shot").forEach((sh, k) => sh.classList.toggle("active", k === 0));
      el.querySelector(".demo-bar span").textContent = d.shots[0].url;
    }
  }

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  window.Demos = {
    has: (key) => !!DEMOS[key],
    html(key) {
      const d = DEMOS[key];
      const body = d.shots
        ? d.shots.map((sh, k) => `<div class="shot${sh.scroll ? " scroll" : ""}${sh.fit === "contain" ? " contain" : ""}${k === 0 ? " active" : ""}">${
            sh.video
              ? `<video src="${sh.video}" poster="${sh.src}" muted loop playsinline preload="metadata"></video>`
              : `<img src="${sh.src}" alt="" loading="lazy">`
          }</div>`).join("")
        : d.html();
      return `<div class="demo demo-${key}${d.shots ? " shots" : ""}" data-demo="${key}">
        <div class="demo-bar"><i></i><i></i><i></i><span>${d.shots ? d.shots[0].url : d.url}</span></div>
        <div class="demo-body">${body}</div>
      </div>`;
    },
    // à appeler après chaque rendu des cartes
    mount(root) {
      mounted.forEach(stop);
      mounted = [...root.querySelectorAll(".demo")];
      if (reduced) {
        // pas d'animation : on affiche directement l'état final
        mounted.forEach((el) => {
          const d = DEMOS[el.dataset.demo];
          if (d.steps) d.steps.forEach((_, k) => el.classList.add("s" + (k + 1)));
        });
      }
    },
    // le carrousel ne fait tourner que la démo visible
    play(el) {
      mounted.forEach((m) => { if (m !== el && timers.has(m)) stop(m); });
      if (el && !reduced && !timers.has(el)) run(el);
    },
    stopAll() { mounted.forEach((m) => { if (timers.has(m)) stop(m); }); }
  };
})();
