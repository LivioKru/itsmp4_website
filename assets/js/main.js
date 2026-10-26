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

  /* ---------- E-Mail mit einem Klick kopieren (Footer & Kontakt) ---------- */
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const hint = btn.querySelector(".fm-hint");
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        hint.textContent = "Kopiert ✓";
      } catch {
        location.href = "mailto:" + btn.dataset.copy;
      }
      setTimeout(() => (hint.textContent = "Kopieren"), 1800);
    });
  });

  /* ---------- Footer ---------- */
  const foot = document.querySelector(".site-foot");
  if (foot) {
    foot.querySelector("[data-top]").addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));
  }

  /* ---------- Adressen ohne «.html» ---------- */
  // Alte Adressen (z.B. /referenzen.html) funktionieren weiter, in der Adresszeile steht aber die kurze Form
  if (location.protocol !== "file:" && /\.html$/.test(location.pathname)) {
    history.replaceState(null, "", location.pathname.replace(/(index)?\.html$/, "") + location.search + location.hash);
  }
  // Fehlerseite: Adresse mit Schrägstrich am Ende (z.B. /referenzen/) -> /referenzen
  if (document.body.dataset.page === "404" && /.\/$/.test(location.pathname)) {
    location.replace(location.pathname.replace(/\/+$/, "") + location.search + location.hash);
  }

  /* ---------- Startseite: Hintergrundvideo sicher starten ---------- */
  // Manche Handys blockieren Autoplay beim Laden – dann stumm anstossen
  // und spätestens bei der ersten Berührung nochmals versuchen.
  const heroVideo = document.querySelector(".hero-video");
  if (heroVideo) {
    heroVideo.muted = true;
    heroVideo.defaultMuted = true;
    const play = () => { if (heroVideo.paused) heroVideo.play().catch(() => {}); };
    play();
    heroVideo.addEventListener("canplay", play, { once: true });
    ["touchstart", "pointerdown", "keydown"].forEach((ev) => addEventListener(ev, play, { once: true, passive: true }));
    document.addEventListener("visibilitychange", () => { if (!document.hidden) play(); });
  }

  /* ---------- Mobile-Menü ---------- */
  const menuBtn = document.querySelector(".menu-btn");
  menuBtn.addEventListener("click", () => {
    const open = document.body.classList.toggle("menu-open");
    menuBtn.setAttribute("aria-expanded", open);
    menuBtn.textContent = open ? "Close" : "Menu";
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
