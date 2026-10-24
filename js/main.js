// Affiche tout le contenu de data/content.js et gère langue + thème.
(function () {
  const C = window.CONTENT;
  const UI = window.UI;

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  const App = {
    lang: store.get("lang") || ((navigator.language || "fr").startsWith("fr") ? "fr" : "en"),
    // Renvoie le texte dans la langue courante ({ fr, en } ou simple chaîne)
    t(v) { return typeof v === "string" ? v : (v && (v[App.lang] || v.fr)) || ""; },
    ui(key) { return UI[App.lang][key]; },
    esc(s) {
      return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
    },
    tags(list) { return `<ul class="tags">${list.map((s) => `<li>${App.esc(s)}</li>`).join("")}</ul>`; }
  };
  window.App = App;
  const { t, esc } = App;

  const COVERS = ["#2F4F3A", "#C8553D", "#9C6B1F", "#4A6747", "#7A4E3A"];

  function initials(name) {
    return name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  }

  // ---------- projets : carrousel "coverflow" ----------
  // Le projet actif est au centre, ses voisins dépassent sur les côtés.
  // Lecture auto (la barre du point actif se remplit), en pause au survol ou hors écran.
  const carousel = document.getElementById("carousel");
  const track = document.getElementById("projects-track");
  const dotsBox = document.getElementById("carousel-dots");
  const AUTOPLAY_MS = 12000;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let current = 0, slides = [], inView = false, hovering = false;
  carousel.style.setProperty("--autoplay", AUTOPLAY_MS + "ms");
  // la hauteur du carrousel suit celle des projets (polices, images, langue, largeur…)
  const slideSizes = new ResizeObserver(() => fitHeight());

  function renderProjects() {
    const ui = UI[App.lang];
    const total = C.projects.length;
    track.innerHTML = C.projects.map((p, i) => {
      const media = window.Demos && window.Demos.has(p.demo)
        ? window.Demos.html(p.demo)
        : `<div class="card-cover"><span class="initials" aria-hidden="true">${esc(initials(p.name))}</span></div>`;
      const links = [
        p.repo ? `<a href="${esc(p.repo)}" target="_blank" rel="noopener">${ui.code} ↗</a>` : "",
        p.link ? `<a href="${esc(p.link)}" target="_blank" rel="noopener">${ui.live} ↗</a>` : ""
      ].join("");
      return `
        <article class="slide" data-i="${i}" style="--cover:${COVERS[i % COVERS.length]}" aria-roledescription="slide" aria-label="${i + 1} / ${total} · ${esc(p.name)}">
          <div class="slide-media">${media}</div>
          <div class="slide-info">
            <span class="slide-count">${String(i + 1).padStart(2, "0")} <span>/ ${String(total).padStart(2, "0")}</span></span>
            <div class="card-head"><h3>${esc(p.name)}</h3></div>
            <p>${esc(t(p.description))}</p>
            ${App.tags(p.stack)}
            <div class="card-links">${links}</div>
          </div>
        </article>`;
    }).join("");
    dotsBox.innerHTML = C.projects.map((p, i) =>
      `<button type="button" aria-label="${esc(p.name)}" data-i="${i}"><i></i></button>`).join("");
    document.getElementById("car-prev").setAttribute("aria-label", ui.prev);
    document.getElementById("car-next").setAttribute("aria-label", ui.next);
    slides = [...track.querySelectorAll(".slide")];
    slides.forEach((el) => slideSizes.observe(el));
    if (window.Demos) window.Demos.mount(track);
    layout();
  }

  // distance (la plus courte, en boucle) entre un projet et le projet actif
  function offset(i) {
    const n = slides.length;
    let d = (((i - current) % n) + n) % n;
    if (d > n / 2) d -= n;
    return d;
  }

  function layout() {
    slides.forEach((el, i) => {
      const d = offset(i), ad = Math.abs(d);
      el.style.setProperty("--d", d);
      el.style.setProperty("--ad", Math.min(ad, 2));
      el.classList.toggle("active", d === 0);
      el.classList.toggle("near", ad === 1);
      el.classList.toggle("far", ad > 1);
      el.setAttribute("aria-hidden", String(d !== 0));
      el.querySelectorAll("a").forEach((a) => { a.tabIndex = d === 0 ? 0 : -1; });
    });
    fitHeight();
    dotsBox.querySelectorAll("button").forEach((b, k) => {
      b.classList.toggle("active", k === current);
      b.classList.toggle("done", offset(k) < 0);
    });
    playDemo();
  }

  // hauteur fixe = le plus grand projet, pour que la page ne saute pas en changeant de projet
  function fitHeight() {
    track.classList.add("measuring"); // mesure à la taille naturelle (sans l'étirement)
    const h = Math.max(0, ...slides.map((el) => el.offsetHeight));
    track.classList.remove("measuring");
    if (h && track.style.height !== h + "px") track.style.height = h + "px";
  }

  function playDemo() {
    if (!window.Demos) return;
    if (inView) window.Demos.play(slides[current] && slides[current].querySelector(".demo"));
    else window.Demos.stopAll();
  }

  function goTo(i) {
    const n = slides.length;
    current = ((i % n) + n) % n;
    layout();
  }

  function setPaused() { carousel.classList.toggle("paused", hovering || !inView || reducedMotion || track.classList.contains("dragging")); }

  document.getElementById("car-prev").addEventListener("click", () => goTo(current - 1));
  document.getElementById("car-next").addEventListener("click", () => goTo(current + 1));
  dotsBox.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) goTo(+b.dataset.i); });
  // fin de la barre du point actif → projet suivant
  dotsBox.addEventListener("animationend", (e) => {
    if (e.animationName === "dot-fill" && e.target.parentElement.classList.contains("active")) goTo(current + 1);
  });

  carousel.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); goTo(current + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); goTo(current - 1); }
  });
  carousel.addEventListener("mouseenter", () => { hovering = true; setPaused(); });
  carousel.addEventListener("mouseleave", () => { hovering = false; setPaused(); });

  // clic sur un projet voisin → il passe au centre
  let swiped = false;
  track.addEventListener("click", (e) => {
    if (swiped) { e.preventDefault(); swiped = false; return; }
    const s = e.target.closest(".slide");
    if (s && !s.classList.contains("active")) { e.preventDefault(); goTo(+s.dataset.i); }
  });

  // glisser au doigt ou à la souris : le carrousel suit le geste, puis se cale
  let drag = null;
  track.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    swiped = false;
    drag = { x: e.clientX, y: e.clientY, t: performance.now(), dx: 0, active: false, id: e.pointerId };
  });
  track.addEventListener("pointermove", (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.active) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      if (Math.abs(dy) > Math.abs(dx)) { drag = null; return; } // geste vertical : on laisse la page défiler
      drag.active = true;
      track.setPointerCapture(e.pointerId);
      track.classList.add("dragging");
      setPaused();
    }
    drag.dx = dx;
    track.style.setProperty("--drag", dx + "px");
  });
  function endDrag() {
    if (!drag) return;
    const d = drag;
    drag = null;
    track.classList.remove("dragging");
    track.style.setProperty("--drag", "0px");
    setPaused();
    if (!d.active) return;
    swiped = true; // évite que le relâchement compte comme un clic
    const speed = d.dx / Math.max(1, performance.now() - d.t); // px/ms
    const w = slides[current] ? slides[current].offsetWidth : track.clientWidth;
    if (d.dx < -w * 0.15 || speed < -0.45) goTo(current + 1);
    else if (d.dx > w * 0.15 || speed > 0.45) goTo(current - 1);
    else layout();
  }
  track.addEventListener("pointerup", endDrag);
  track.addEventListener("pointercancel", endDrag);
  // empêche le glisser-déposer natif des images (Firefox), qui annulerait le geste
  track.addEventListener("dragstart", (e) => e.preventDefault());

  // glisser à deux doigts sur un pavé tactile (ou Maj + molette) : défilement horizontal
  let wheelAcc = 0, wheelReset = 0, lockUntil = 0;
  carousel.addEventListener("wheel", (e) => {
    const dx = e.shiftKey && !e.deltaX ? e.deltaY : e.deltaX;
    if (Math.abs(dx) <= Math.abs(e.deltaY) && !e.shiftKey) return; // geste vertical : la page défile
    e.preventDefault();
    const now = performance.now();
    if (now < lockUntil) {
      // l'inertie du pavé tactile continue : on reste verrouillé tant qu'elle dure
      lockUntil = Math.max(lockUntil, now + 200);
      return;
    }
    wheelAcc += dx;
    clearTimeout(wheelReset);
    wheelReset = setTimeout(() => { wheelAcc = 0; }, 200);
    if (Math.abs(wheelAcc) > 40) {
      goTo(current + (wheelAcc > 0 ? 1 : -1));
      wheelAcc = 0;
      lockUntil = now + 550; // un geste = un projet
    }
  }, { passive: false });

  new IntersectionObserver((entries) => {
    inView = entries[0].isIntersecting;
    setPaused();
    playDemo();
  }, { threshold: 0.35 }).observe(carousel);

  setPaused();

  function renderEducation() {
    document.getElementById("education-list").innerHTML = C.education.map((e) => `
      <li>
        <span class="dates">${esc(t(e.dates))}</span>
        <h3>${esc(t(e.degree))}</h3>
        <span class="school">${esc(e.school)}</span>
        <p>${esc(t(e.details))}</p>
      </li>`).join("");

    document.getElementById("skills-list").innerHTML = C.skills.map((s) => `<li>${esc(s)}</li>`).join("");
    document.getElementById("languages-list").innerHTML = C.languages.map((l) =>
      `<li><strong>${esc(t(l.name))}</strong><span>${esc(t(l.level))}</span></li>`).join("");
    document.getElementById("interests-list").innerHTML = C.interests.map((x) =>
      `<li><strong>${esc(t(x.name))}</strong><span>${esc(t(x.text))}</span></li>`).join("");
  }

  function renderContact() {
    const p = C.profile;
    const links = [
      `<a class="btn btn-primary" href="mailto:${esc(p.email)}">✉ ${esc(p.email)}</a>`,
      p.linkedin && p.linkedin !== "#" ? `<a class="btn btn-ghost" href="${esc(p.linkedin)}" target="_blank" rel="noopener">LinkedIn ↗</a>` : "",
      `<a class="btn btn-ghost" href="${esc(p.github)}" target="_blank" rel="noopener">GitHub ↗</a>`,
      `<a class="btn btn-ghost" href="${esc(p.cv)}" download>CV ↓</a>`
    ];
    document.getElementById("contact-links").innerHTML = links.join("");
  }

  function render() {
    document.documentElement.lang = App.lang;
    document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = App.ui(el.dataset.i18n); });
    const p = C.profile;
    document.getElementById("hero-name").textContent = p.name;
    document.getElementById("hero-role").textContent = t(p.role);
    document.getElementById("hero-bio").textContent = t(p.bio);
    document.getElementById("cv-link").href = p.cv;
    document.getElementById("year").textContent = new Date().getFullYear();
    renderProjects();
    renderEducation();
    renderContact();
    document.dispatchEvent(new Event("langchange"));
  }

  // Bouton FR / EN
  document.getElementById("lang-switch").addEventListener("click", () => {
    App.lang = App.lang === "fr" ? "en" : "fr";
    store.set("lang", App.lang);
    render();
  });

  render();
})();
