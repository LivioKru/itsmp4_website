/* itsmp4 — Interaktionen für alle Seiten
   Navigation und Footer stehen fest im HTML (erzeugt von tools/build.mjs). */
(() => {
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Basis-Pfad der Website (funktioniert auch in Unterordnern wie /projekte/)
  const base = new URL("../../", document.currentScript.src).href;

  document.body.insertAdjacentHTML(
    "beforeend",
    `<div class="curtain" aria-hidden="true"></div>
     <div class="curtain-card" aria-hidden="true"><img src="${base}assets/img/sd-card.png" alt="" width="463" height="609"></div>
     <div class="grain" aria-hidden="true"></div>`
  );

  /* ---------- Footer ---------- */
  const foot = document.querySelector(".site-foot");
  if (foot) {
    // E-Mail mit einem Klick kopieren
    const copyBtn = foot.querySelector("[data-copy]");
    window.SITE_MAIL = copyBtn.dataset.copy;
    copyBtn.addEventListener("click", async () => {
      const hint = copyBtn.querySelector(".fm-hint");
      try {
        await navigator.clipboard.writeText(copyBtn.dataset.copy);
        hint.textContent = "Kopiert ✓";
      } catch {
        location.href = "mailto:" + copyBtn.dataset.copy;
      }
      setTimeout(() => (hint.textContent = "Kopieren"), 1800);
    });
    foot.querySelector("[data-top]").addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));
    // Uhrzeit in Luzern
    const clock = foot.querySelector("[data-clock]");
    const tick = () => (clock.textContent = new Date().toLocaleTimeString("de-CH", { timeZone: "Europe/Zurich", hour: "2-digit", minute: "2-digit" }));
    tick();
    setInterval(tick, 10000);
    // Riesiger Schriftzug fährt hoch, wenn der Footer ins Bild kommt
    new IntersectionObserver(([en]) => foot.classList.toggle("in", en.isIntersecting), { threshold: 0.35 }).observe(foot);

    // Kontaktangaben aus dem Footer übernehmen (z.B. Visitenkarte auf der Kontaktseite)
    const insta = foot.querySelector('a[href*="instagram.com"]');
    document.querySelectorAll("[data-mail]").forEach((a) => {
      a.href = "mailto:" + window.SITE_MAIL;
      a.textContent = window.SITE_MAIL;
    });
    document.querySelectorAll("[data-instagram]").forEach((a) => {
      a.href = insta.href;
      a.textContent = insta.textContent;
    });
  }

  /* ---------- Mobile-Menü ---------- */
  const menuBtn = document.querySelector(".menu-btn");
  menuBtn.addEventListener("click", () => {
    const open = document.body.classList.toggle("menu-open");
    menuBtn.setAttribute("aria-expanded", open);
    menuBtn.textContent = open ? "Schliessen" : "Menü";
  });

  /* ---------- Seitenübergang ---------- */
  // Roter Vorhang mit SD-Karte: Karte dreht sich einmal, dann geht der Vorhang auf
  const SPIN = reduceMotion ? 0 : 650;
  const card = document.querySelector(".curtain-card img");
  const spin = () => {
    card.classList.remove("spin");
    void card.offsetWidth; // Animation neu starten
    card.classList.add("spin");
  };
  spin();
  setTimeout(() => document.body.classList.add("is-ready"), SPIN);
  addEventListener("pageshow", (e) => {
    if (e.persisted) document.body.classList.remove("is-leaving");
  });
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || a.hasAttribute("download")) return;
    if (url.pathname === location.pathname && url.search === location.search) return;
    e.preventDefault();
    document.body.classList.remove("menu-open");
    document.body.classList.add("is-leaving");
    setTimeout(spin, 250);
    setTimeout(() => (location.href = url.href), reduceMotion ? 0 : 850);
  });

  /* ---------- Einblenden beim Scrollen ---------- */
  const io = new IntersectionObserver(
    (entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    }),
    { rootMargin: "0px 0px -8% 0px" }
  );
  window.observeReveal = (root = document) => root.querySelectorAll(".reveal").forEach((el) => io.observe(el));
  observeReveal();
})();
