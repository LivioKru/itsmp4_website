/* ==========================================================================
   itsmp4 – Build-Skript (SEO)
   --------------------------------------------------------------------------
   Ausführen im Projektordner:   node tools/build.mjs

   Was es macht:
   - schreibt Kopfbereich (Titel, Beschreibung, Social-Vorschau, Schema.org),
     Navigation und Footer fest in jede Seite – damit Google, Bing und
     KI-Suchmaschinen alles lesen können, auch ohne JavaScript
   - füllt die Liste auf der Work-Seite (Filme öffnen sich dort im Pop-up)
   - erzeugt Weiterleitungen für alte Adressen (frühere Leistungs- und Projektseiten)
   - erzeugt sitemap.xml, robots.txt und llms.txt

   Inhalte änderst du weiterhin in den HTML-Dateien bzw. in
   assets/js/projects.js. Die Bereiche zwischen  <!-- build:… -->  und
   <!-- /build:… -->  werden bei jedem Build überschrieben.
   ========================================================================== */

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/* --------------------------------------------------------------------------
   Grunddaten – hier anpassen
   -------------------------------------------------------------------------- */
const SITE = {
  url: "https://itsmp4.ch", // Domain der Website (ohne / am Ende)
  name: "itsmp4",
  person: "Livio Krummenacher",
  firstName: "Livio",
  lastName: "Krummenacher",
  jobTitle: "Videograf",
  mail: "hello@itsmp4.ch",
  instagram: "https://www.instagram.com/itsmp4.ch/",
  instagramHandle: "@itsmp4.ch",
  city: "Luzern",
  region: "LU",
  founded: "2026",
  description:
    "itsmp4 ist das Portfolio von Livio Krummenacher, Videograf aus Luzern. Events, Musik und eigene Projekte.",
};

/* --------------------------------------------------------------------------
   Alte Adressen – die früheren Leistungsseiten (und unten die früheren
   Projektseiten /projekte/<slug>.html) leiten weiter, damit Links
   und Google-Treffer nicht ins Leere laufen. (GitHub Pages kennt keine
   Server-Weiterleitungen, deshalb Meta-Refresh + Canonical.)
   -------------------------------------------------------------------------- */
const REDIRECTS = {
  "videograf-luzern.html": "ueber-mich",
  "imagefilm-luzern.html": "referenzen",
  "social-media-video-luzern.html": "referenzen",
  "musikvideo-luzern.html": "referenzen",
};

/* --------------------------------------------------------------------------
   Adressen ohne «.html»: Die Dateien heissen weiter z.B. referenzen.html,
   GitHub Pages liefert sie aber auch unter /referenzen aus. Alle Links,
   Canonicals und die Sitemap nutzen deshalb die kurze Adresse.
   -------------------------------------------------------------------------- */

/* --------------------------------------------------------------------------
   Seiten (handgeschriebene HTML-Dateien)
   -------------------------------------------------------------------------- */
const PAGES = [
  {
    file: "index.html",
    url: "/",
    key: "home",
    type: "WebPage",
    title: "itsmp4 – Livio Krummenacher, Videograf aus Luzern",
    description:
      "Filme von Livio Krummenacher, Videograf aus Luzern: Eventvideos, Aftermovies, Musik und eigene Projekte aus Luzern und der Zentralschweiz.",
    preload: "assets/img/startseite-reel.jpg",
  },
  {
    file: "referenzen.html",
    url: "/referenzen",
    key: "work",
    type: "CollectionPage",
    crumb: "Selected Work",
    title: "Selected Work – Filme von Livio Krummenacher | itsmp4",
    description:
      "Eventvideos, Aftermovies, Musik und eigene Projekte: alle Filme von Livio Krummenacher, Videograf aus Luzern.",
  },
  {
    file: "eventvideo-luzern.html",
    url: "/eventvideo-luzern",
    key: "events",
    type: "WebPage",
    crumb: "Eventvideos & Aftermovies",
    title: "Eventvideograf Luzern – Eventvideos & Aftermovies | itsmp4",
    description:
      "Eventvideos und Aftermovies aus Luzern und der Zentralschweiz: Livio Krummenacher filmt Partys, Clubnächte und Shows – quer oder im Hochformat für Instagram und TikTok.",
    image: "assets/img/orofanie.jpg",
    ogVideo: "assets/video/orofanie.mp4",
    feature: "orofanie", // Film, der auf der Seite gross läuft
  },
  {
    file: "ueber-mich.html",
    url: "/ueber-mich",
    key: "about",
    type: "ProfilePage",
    crumb: "Über mich",
    title: "Über mich – Livio Krummenacher, Videograf aus Luzern | itsmp4",
    description:
      "Livio Krummenacher, Videograf aus Luzern. Kamera, Schnitt und Farbe macht er selbst.",
  },
  {
    file: "kontakt.html",
    url: "/kontakt",
    key: "contact",
    type: "ContactPage",
    crumb: "Kontakt",
    title: "Kontakt – Livio Krummenacher, Videograf aus Luzern | itsmp4",
    description:
      "Kontakt zu Livio Krummenacher, Videograf aus Luzern: hello@itsmp4.ch",
  },
  {
    file: "404.html",
    url: "/404.html",
    key: "404",
    type: "WebPage",
    title: "Kein Signal | itsmp4",
    description: "Diese Seite gibt es nicht. Zurück zum Filmportfolio von Livio Krummenacher.",
    noindex: true,
    pre: "/", // 404 kann unter jeder Adresse erscheinen -> absolute Pfade
  },
];

// Nur im Footer (Hauptnavigation bleibt bei drei Punkten)
const FOOT_LINKS = [["eventvideo-luzern", "Eventvideos"]];

const NAV = [
  ["referenzen", "Work", "work"],
  ["ueber-mich", "About", "about"],
  ["kontakt", "Contact", "contact"],
];

/* --------------------------------------------------------------------------
   Hilfsfunktionen
   -------------------------------------------------------------------------- */
const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const abs = (p) => SITE.url + "/" + p.replace(/^\.?\//, "");
const pageUrl = (u) => SITE.url + u;
const today = new Date().toISOString().slice(0, 10);
const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");
const write = (f, s) => {
  fs.mkdirSync(path.dirname(path.join(ROOT, f)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, f), s);
};
// "2026-08-22" -> "2026-08-22T00:00:00+02:00" (Schweizer Zeit, Google will eine Zeitzone)
const withZone = (d) => {
  const off = new Date(`${d}T12:00:00Z`).toLocaleString("en-US", { timeZone: "Europe/Zurich", timeZoneName: "shortOffset" }).split("GMT+")[1]; // "1" oder "2"
  return `${d}T00:00:00+0${off}:00`;
};
// Letzte echte Änderung einer Seite (aus git), damit «lastmod» in der Sitemap
// nicht bei jedem Build auf heute springt. Geänderte, noch nicht committete Datei -> heute.
const lastmod = (f) => {
  try {
    if (execFileSync("git", ["status", "--porcelain", "--", f], { cwd: ROOT, encoding: "utf8" }).trim()) return today;
    return execFileSync("git", ["log", "-1", "--format=%cs", "--", f], { cwd: ROOT, encoding: "utf8" }).trim() || today;
  } catch {
    return today;
  }
};
const short = (s, n = 155) => (s.length <= n ? s : s.slice(0, s.lastIndexOf(" ", n - 1)) + " …");

/** Ersetzt den Inhalt zwischen <!-- build:name --> und <!-- /build:name --> */
function inject(html, name, content, file) {
  const re = new RegExp(`(<!-- build:${name} -->)[\\s\\S]*?(<!-- /build:${name} -->)`);
  if (!re.test(html)) throw new Error(`Marker "build:${name}" fehlt in ${file}`);
  return html.replace(re, `$1\n${content}\n$2`);
}

// Projekte aus assets/js/projects.js laden
const ctx = { window: {} };
vm.runInNewContext(read("assets/js/projects.js"), ctx);
const PROJECTS = ctx.window.PROJECTS;
const REAL = PROJECTS.filter((p) => !p.placeholder);
// Filme haben keine eigene Seite mehr – sie öffnen sich auf der Work-Seite
const projectUrl = (p) => `/referenzen#${p.slug}`;
// «Eventfilm», sonst einfach «Film»
const kindOf = (p) => (p.category === "Event" ? "Eventfilm" : "Film");
// "2026-08-22" -> "August 2026"
const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
const monthYear = (d) => `${MONTHS[+d.slice(5, 7) - 1]} ${d.slice(0, 4)}`;

/* --------------------------------------------------------------------------
   Schema.org (JSON-LD)
   -------------------------------------------------------------------------- */
const ID = {
  person: SITE.url + "/#livio",
  website: SITE.url + "/#website",
};

const person = {
  "@type": "Person",
  "@id": ID.person,
  name: SITE.person,
  givenName: SITE.firstName,
  familyName: SITE.lastName,
  alternateName: SITE.name,
  jobTitle: SITE.jobTitle,
  description:
    "Videograf aus Luzern. Events, Musik und eigene Projekte.",
  image: abs("assets/img/og-image.jpg"),
  url: pageUrl("/ueber-mich"),
  email: SITE.mail,
  homeLocation: { "@type": "Place", name: "Luzern, Schweiz" },
  address: { "@type": "PostalAddress", addressLocality: SITE.city, addressRegion: SITE.region, addressCountry: "CH" },
  knowsLanguage: ["de", "de-CH"],
  knowsAbout: ["Film", "Videografie", "Eventfilm", "Eventvideo", "Aftermovie", "Musikvideo", "Kamera", "Videoschnitt", "Color Grading", "Visual Storytelling"],
  sameAs: [SITE.instagram],
};

const website = {
  "@type": "WebSite",
  "@id": ID.website,
  url: SITE.url + "/",
  name: SITE.name,
  alternateName: ["itsmp4.ch", `${SITE.name} – ${SITE.person}`],
  description: SITE.description,
  inLanguage: "de-CH",
  author: { "@id": ID.person },
  publisher: { "@id": ID.person },
};

function breadcrumb(items) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, url], i) => ({ "@type": "ListItem", position: i + 1, name, item: pageUrl(url) })),
  };
}

// Untertitel + Text, ohne den Untertitel doppelt, wenn der Text gleich beginnt
const descOf = (p) => (p.text[0].startsWith(p.subtitle) ? p.text : [p.subtitle, ...p.text]).join(" ");

function videoObject(p) {
  return {
    "@type": "VideoObject",
    "@id": pageUrl(projectUrl(p)),
    name: `${p.title} – ${kindOf(p)} von ${SITE.person}`,
    description: descOf(p),
    thumbnailUrl: [abs(p.poster)],
    uploadDate: withZone(p.date),
    duration: `PT${p.seconds}S`,
    contentUrl: abs(p.video),
    encodingFormat: "video/mp4",
    url: pageUrl(projectUrl(p)),
    inLanguage: "de-CH",
    creator: { "@id": ID.person },
    ...(p.location ? { contentLocation: { "@type": "Place", name: p.location } } : {}),
  };
}

function jsonld(page, extra = []) {
  const crumbs = [["Startseite", "/"]];
  if (page.parent) crumbs.push(page.parent);
  if (page.crumb) crumbs.push([page.crumb, page.url]);
  const webpage = {
    "@type": page.type || "WebPage",
    "@id": pageUrl(page.url) + "#webpage",
    url: pageUrl(page.url),
    name: page.title,
    description: page.description,
    inLanguage: "de-CH",
    isPartOf: { "@id": ID.website },
    ...(page.type === "ProfilePage" ? { mainEntity: { "@id": ID.person } } : { about: { "@id": ID.person } }),
    primaryImageOfPage: abs(page.image || "assets/img/og-image.jpg"),
    ...(crumbs.length > 1 ? { breadcrumb: breadcrumb(crumbs) } : {}),
  };
  const graph = { "@context": "https://schema.org", "@graph": [person, website, webpage, ...extra] };
  return `<script type="application/ld+json">\n${JSON.stringify(graph)}\n</script>`;
}

/* --------------------------------------------------------------------------
   Bausteine: Kopf, Navigation, Footer
   -------------------------------------------------------------------------- */
function head(page, pre, extraLd = []) {
  const img = page.image || "assets/img/og-image.jpg";
  const robots = page.noindex ? "noindex, follow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
  return `  <title>${esc(page.title)}</title>
  <meta name="description" content="${esc(page.description)}">
  <meta name="robots" content="${robots}">
  <link rel="canonical" href="${pageUrl(page.url)}">
  <meta name="author" content="${SITE.person}">
  <meta name="theme-color" content="#000000">
  <meta name="geo.region" content="CH-${SITE.region}">
  <meta name="geo.placename" content="${SITE.city}">

  <meta property="og:type" content="${page.ogType || "website"}">
  <meta property="og:site_name" content="${SITE.name}">
  <meta property="og:locale" content="de_CH">
  <meta property="og:title" content="${esc(page.title)}">
  <meta property="og:description" content="${esc(page.description)}">
  <meta property="og:url" content="${pageUrl(page.url)}">
  <meta property="og:image" content="${abs(img)}">${page.ogVideo ? `
  <meta property="og:video" content="${abs(page.ogVideo)}">
  <meta property="og:video:type" content="video/mp4">` : ""}
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(page.title)}">
  <meta name="twitter:description" content="${esc(page.description)}">
  <meta name="twitter:image" content="${abs(img)}">

  <link rel="icon" href="${pre}favicon.ico" sizes="any">
  <link rel="icon" type="image/png" sizes="32x32" href="${pre}assets/img/favicon-32.png">
  <link rel="apple-touch-icon" href="${pre}apple-touch-icon.png">
  <link rel="preload" href="${pre}assets/fonts/funnel-display.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="${pre}assets/fonts/funnel-sans.woff2" as="font" type="font/woff2" crossorigin>
  <script>document.documentElement.classList.add("js")</script>
  <link rel="stylesheet" href="${pre}assets/css/style.css">${page.preload ? `
  <link rel="preload" as="image" href="${pre}${page.preload}" fetchpriority="high">` : ""}
  ${jsonld(page, extraLd)}`;
}

function header(key, pre) {
  const home = pre || "./"; // Startseite ohne «index.html» in der Adresse
  const link = ([href, label, k]) =>
    `<a href="${pre}${href}"${k === key ? ' aria-current="page"' : ""}><span class="roll" data-text="${label}">${label}</span></a>`;
  return `  <header class="site-header">
    <p class="nav-tag">${SITE.person}<span> · Videograf</span></p>
    <a class="brand" href="${home}" aria-label="itsmp4 – zur Startseite">
      <img src="${pre}assets/img/itsmp4-logo.png" alt="itsmp4" width="1326" height="228">
    </a>
    <nav class="nav" aria-label="Hauptnavigation">${NAV.map(link).join("")}</nav>
    <button class="menu-btn" aria-expanded="false" aria-controls="mobile-nav">Menu</button>
    <nav class="mobile-nav" id="mobile-nav" aria-label="Menü">${NAV.map(link).join("")}</nav>
  </header>`;
}

function footer(pre) {
  return `  <footer class="site-foot">
    <div class="foot-card">
      <div class="foot-top">
        <p class="foot-title">Let’s connect.</p>
        <div class="foot-mailbox">
          <button class="foot-mail" data-copy="${SITE.mail}">
            <span class="fm-text">${SITE.mail}</span>
            <span class="fm-hint">Kopieren</span>
          </button>
        </div>
      </div>

      <div class="foot-cols">
        <div>
          <span class="foot-label">Seiten</span>
${[...NAV, ...FOOT_LINKS].map(([href, label]) => `          <a href="${pre}${href}">${label}</a>`).join("\n")}
        </div>
        <div>
          <span class="foot-label">${SITE.person}</span>
          <span>Videograf</span>
          <span>${SITE.city}, Schweiz</span>
        </div>
        <div>
          <span class="foot-label">Social</span>
          <a href="${SITE.instagram}" target="_blank" rel="noopener">${SITE.instagramHandle} ↗</a>
          <a href="mailto:${SITE.mail}">${SITE.mail}</a>
        </div>
        <div class="foot-up">
          <button data-top>Nach oben ↑</button>
        </div>
      </div>
    </div>
    <div class="foot-legal">
      <span>© ${new Date().getFullYear()} ${SITE.name} · ${SITE.person}</span>
      <span><a href="${pre}impressum">Impressum</a> · <a href="${pre}datenschutz">Datenschutz</a></span>
    </div>
  </footer>`;
}

/* --------------------------------------------------------------------------
   Projekte in der Work-Liste
   -------------------------------------------------------------------------- */
const altOf = (p) => `${p.title} – ${kindOf(p)} von ${SITE.person}`;

// Raster: Standbild + stummer Vorschau-Loop (läuft beim Überfahren), Klick öffnet den Film im Pop-up
function workItem(p) {
  const meta = `${p.category} · ${monthYear(p.date)}`;
  // Ausschnitt in der Kachel, z.B. "50% 30%" (Standard: Mitte)
  const crop = p.crop ? ` style="object-position: ${esc(p.crop)}"` : "";
  return `        <li class="work-item" id="${p.slug}" data-format="${p.format}" data-cat="${esc(p.category)}">
          <a href="#${p.slug}" data-film="${p.video}" data-poster="${p.poster}" data-title="${esc(p.title)}" data-meta="${esc(meta)}"${p.link ? ` data-link="${esc(p.link)}" data-link-label="${esc(p.linkLabel || p.client)}"` : ""}>
            <span class="wi-media">
              <img src="${p.poster}" alt="${esc(altOf(p))}" loading="lazy"${crop}>
              <video muted loop playsinline preload="none" data-src="${p.preview || p.video}" aria-hidden="true"${crop}></video>
              <span class="wi-play" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 4l15 8-15 8z"/></svg></span>
            </span>
            <span class="wi-text">
              <span class="wi-title">${esc(p.title)}</span>
              <span class="wi-meta">${esc(meta)}</span>
            </span>
          </a>
        </li>`;
}

// Leistungsseite: weitere Eventfilme, Klick öffnet den Film auf der Work-Seite
function eventItem(p) {
  const crop = p.crop ? ` style="object-position: ${esc(p.crop)}"` : "";
  return `        <li class="work-item" data-format="${p.format}">
          <a href="referenzen#${p.slug}">
            <span class="wi-media">
              <img src="${p.poster}" alt="${esc(altOf(p))}" loading="lazy"${crop}>
              <span class="wi-play" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 4l15 8-15 8z"/></svg></span>
            </span>
            <span class="wi-text">
              <span class="wi-title">${esc(p.title)}</span>
              <span class="wi-meta">${esc(`${p.category} · ${monthYear(p.date)}`)}</span>
            </span>
          </a>
        </li>`;
}

/* --------------------------------------------------------------------------
   Seitenrahmen/* --------------------------------------------------------------------------
   Seitenrahmen (für erzeugte Seiten)
   -------------------------------------------------------------------------- */
function shell(page, key, pre, extraLd, main, scripts = "") {
  return `<!doctype html>
<html lang="de-CH">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
${head(page, pre, extraLd)}
</head>
<body data-page="${key}">
${header(key, pre)}

  <main class="page boxed">
${main}
  </main>

${footer(pre)}
${scripts}
  <script src="${pre}assets/js/main.js" defer></script>
</body>
</html>
`;
}

// Weiterleitung für eine alte Adresse (to: relativer Pfad, canonical: Pfad ab Domain)
function redirectPage(to, canonical = "/" + to) {
  return `<!doctype html>
<html lang="de-CH">
<head>
  <meta charset="utf-8">
  <title>Weiterleitung … | itsmp4</title>
  <!-- Alte Adresse – automatisch erzeugt von tools/build.mjs -->
  <link rel="canonical" href="${pageUrl(canonical)}">
  <meta http-equiv="refresh" content="0; url=${to}">
  <script>location.replace("${to}");</script>
</head>
<body>
  <p><a href="${to}">Weiter zu itsmp4</a></p>
</body>
</html>
`;
}

/* --------------------------------------------------------------------------
   Impressum & Datenschutz
   -------------------------------------------------------------------------- */
const LEGAL = {
  owner: SITE.person,
  // Postadresse (Strasse, PLZ Ort) – nötig, sobald du Aufträge annimmst
  address: "",
  host: "GitHub Pages (GitHub Inc., USA)",
};

function legalPage(kind) {
  const url = `/${kind}`;
  const isImp = kind === "impressum";
  const page = {
    url,
    type: "WebPage",
    crumb: isImp ? "Impressum" : "Datenschutz",
    title: isImp ? "Impressum | itsmp4" : "Datenschutz | itsmp4",
    description: isImp ? `Impressum von itsmp4, dem Filmportfolio von ${SITE.person}.` : `Datenschutzerklärung von itsmp4, dem Filmportfolio von ${SITE.person}.`,
    noindex: true,
  };
  const main = isImp
    ? `    <h1 class="title">Impressum</h1>
    <div class="legal">
      <h2>Verantwortlich für diese Website</h2>
      <p>${esc(LEGAL.owner)}<br>${LEGAL.address ? `${esc(LEGAL.address)}<br>` : ""}Schweiz</p>
      <p>E-Mail: <a href="mailto:${SITE.mail}">${SITE.mail}</a></p>
      <h2>Über diese Website</h2>
      <p>${SITE.name} ist das Filmportfolio von ${SITE.person}, Videograf aus ${SITE.city}.</p>
      <h2>Haftung</h2>
      <p>Die Inhalte dieser Website wurden sorgfältig erstellt. Für Richtigkeit, Vollständigkeit und Aktualität wird keine Gewähr übernommen. Für Inhalte verlinkter externer Seiten sind ausschliesslich deren Betreiber verantwortlich.</p>
      <h2>Urheberrecht</h2>
      <p>Videos, Fotos und Texte auf dieser Website gehören ${SITE.person} bzw. den jeweiligen Rechteinhabern. Verwendung nur mit schriftlicher Erlaubnis.</p>
    </div>`
    : `    <h1 class="title">Datenschutz</h1>
    <div class="legal">
      <p>Diese Website ist das Filmportfolio von ${SITE.person} (${SITE.name}). Es werden so wenige Daten wie möglich bearbeitet. Massgebend ist das Schweizer Datenschutzgesetz (DSG).</p>
      <h2>Verantwortlich</h2>
      <p>${esc(LEGAL.owner)}, <a href="mailto:${SITE.mail}">${SITE.mail}</a></p>
      <h2>Keine Cookies, kein Tracking</h2>
      <p>Diese Website setzt keine Cookies und verwendet keine Analyse- oder Werbedienste. Schriften und alle anderen Dateien werden direkt von dieser Website geladen, nicht von Drittanbietern.</p>
      <h2>Hosting und Server-Logfiles</h2>
      <p>Die Website wird bei ${esc(LEGAL.host)} betrieben. Beim Aufruf speichert der Server technisch notwendige Angaben wie IP-Adresse, Datum, Uhrzeit und aufgerufene Seite. Diese Daten dienen nur dem sicheren Betrieb und werden nicht mit anderen Daten zusammengeführt.</p>
      <h2>E-Mail</h2>
      <p>Wenn du mir schreibst, verwende ich deine Angaben nur, um deine Nachricht zu beantworten.</p>
      <h2>Instagram</h2>
      <p>Links zu Instagram führen auf eine externe Seite. Dort gelten die Datenschutzbestimmungen von Meta.</p>
      <h2>Deine Rechte</h2>
      <p>Du kannst jederzeit Auskunft über deine gespeicherten Daten verlangen und sie berichtigen oder löschen lassen. Schreib dafür an <a href="mailto:${SITE.mail}">${SITE.mail}</a>.</p>
    </div>`;
  return shell(page, kind, "", [], main);
}

/* --------------------------------------------------------------------------
   Los geht's
   -------------------------------------------------------------------------- */

// 1) Alte Projektseiten öffnen den Film direkt auf der Work-Seite
fs.rmSync(path.join(ROOT, "projekte"), { recursive: true, force: true });
PROJECTS.forEach((p) => write(`projekte/${p.slug}.html`, redirectPage(`../referenzen#${p.slug}`, "/referenzen")));
// /projekte und /projekte/ (Ordner ohne eigene Seite) -> Work
write("projekte/index.html", redirectPage("../referenzen", "/referenzen"));

// Weiterleitungen, Impressum, Datenschutz
Object.entries(REDIRECTS).forEach(([from, to]) => write(from, redirectPage(to)));
write("impressum.html", legalPage("impressum"));
write("datenschutz.html", legalPage("datenschutz"));

// 2) Handgeschriebene Seiten
for (const page of PAGES) {
  let html = read(page.file);
  const extra = [];
  if (page.key === "events") {
    const film = REAL.find((p) => p.slug === page.feature);
    extra.push(
      {
        "@type": "Service",
        "@id": pageUrl(page.url) + "#service",
        name: "Eventvideos & Aftermovies",
        serviceType: ["Eventvideo", "Aftermovie", "Videoproduktion"],
        description: page.description,
        provider: { "@id": ID.person },
        areaServed: [
          { "@type": "City", name: "Luzern" },
          { "@type": "AdministrativeArea", name: "Zentralschweiz" },
        ],
        url: pageUrl(page.url),
      },
      // Der Film läuft hier als Hauptinhalt -> Google kann ihn dieser Seite zuordnen
      { ...videoObject(film), "@id": pageUrl(page.url) + "#video", url: pageUrl(page.url) }
    );
  }
  if (page.key === "work") {
    extra.push({
      "@type": "ItemList",
      name: "Selected Work – itsmp4",
      itemListElement: REAL.map((p, n) => ({ "@type": "ListItem", position: n + 1, item: { "@id": pageUrl(projectUrl(p)) } })),
    });
    extra.push(...REAL.map(videoObject));
  }

  const pre = page.pre || "";
  html = inject(html, "head", head(page, pre, extra), page.file);
  html = inject(html, "header", header(page.key, pre), page.file);
  if (html.includes("<!-- build:footer -->")) html = inject(html, "footer", footer(pre), page.file);

  if (page.key === "events") {
    const others = REAL.filter((p) => p.category === "Event" && p.slug !== page.feature);
    html = inject(html, "grid", others.map(eventItem).join("\n"), page.file);
  }
  if (page.key === "work") {
    const cats = ["Alle", ...new Set(PROJECTS.map((p) => p.category))];
    html = inject(html, "filters", cats.map((c, i) => `      <button aria-pressed="${i === 0}" data-cat="${esc(c)}">${esc(c)}</button>`).join("\n"), page.file);
    html = inject(html, "grid", PROJECTS.map(workItem).join("\n"), page.file);
  }
  write(page.file, html);
}

// 3) Sitemap (mit Video-Angaben für die Google-Videosuche)
const urls = PAGES.filter((p) => !p.noindex).map((p) => ({
  loc: pageUrl(p.url),
  lastmod: lastmod(p.file),
  priority: p.key === "home" ? "1.0" : "0.8",
  films: p.key === "work" ? REAL : p.feature ? REAL.filter((f) => f.slug === p.feature) : [],
}));
write(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <priority>${u.priority}</priority>${u.films
      .map(
        (f) => `
    <image:image><image:loc>${abs(f.poster)}</image:loc></image:image>
    <video:video>
      <video:thumbnail_loc>${abs(f.poster)}</video:thumbnail_loc>
      <video:title>${esc(f.title)} – ${kindOf(f)} von ${SITE.person}</video:title>
      <video:description>${esc(short(descOf(f), 1000))}</video:description>
      <video:content_loc>${abs(f.video)}</video:content_loc>
      <video:duration>${f.seconds}</video:duration>
      <video:publication_date>${withZone(f.date)}</video:publication_date>
    </video:video>`
      )
      .join("")}
  </url>`
  )
  .join("\n")}
</urlset>
`
);

// 4) robots.txt – Suchmaschinen und KI-Crawler ausdrücklich willkommen
write(
  "robots.txt",
  `# itsmp4 – Filmportfolio von ${SITE.person}
User-agent: *
Allow: /
Disallow: /tools/
Disallow: /videos/
Disallow: /livio.html
Disallow: /livio_files/
Disallow: /projekt.html

# KI-Suchmaschinen (ChatGPT, Claude, Perplexity, Google Gemini) dürfen die Seite lesen
User-agent: GPTBot
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: Claude-SearchBot
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Google-Extended
Allow: /

Sitemap: ${SITE.url}/sitemap.xml
`
);

// 5) llms.txt – kompakte Zusammenfassung für KI-Assistenten
write(
  "llms.txt",
  `# itsmp4 – Filmportfolio von ${SITE.person}

> ${SITE.description}

## Auf einen Blick
- Name: ${SITE.person}, Videograf
- Portfolio: ${SITE.name}
- Fokus: Events, Musik und eigene Projekte
- Arbeitsweise: Kamera, Schnitt und Farbkorrektur selbst
- Basis: ${SITE.city}, Zentralschweiz
- Kontakt: ${SITE.mail} · Instagram ${SITE.instagramHandle} (${SITE.instagram})
- Website: ${SITE.url}/
- Angebot: Eventvideos und Aftermovies in ${SITE.city} und der Zentralschweiz (${pageUrl("/eventvideo-luzern")})

## Seiten
- [Startseite](${SITE.url}/)
- [Selected Work](${pageUrl("/referenzen")})
- [Eventvideos & Aftermovies](${pageUrl("/eventvideo-luzern")})
- [Über mich – ${SITE.person}](${pageUrl("/ueber-mich")})
- [Kontakt](${pageUrl("/kontakt")})

## Selected Work
${REAL.map((p) => `- [${p.title}](${pageUrl(projectUrl(p))}): ${p.category}, ${monthYear(p.date)}${p.location ? `, ${p.location}` : ""}. ${p.subtitle}`).join("\n")}
`
);

console.log(`✓ ${PROJECTS.length} Filme, ${Object.keys(REDIRECTS).length + PROJECTS.length} Weiterleitungen, ${PAGES.length} weitere Seiten, sitemap.xml, robots.txt, llms.txt`);
