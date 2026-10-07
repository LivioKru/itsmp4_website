/* ==========================================================================
   itsmp4 – Build-Skript (SEO)
   --------------------------------------------------------------------------
   Ausführen im Projektordner:   node tools/build.mjs

   Was es macht:
   - schreibt Kopfbereich (Titel, Beschreibung, Social-Vorschau, Schema.org),
     Navigation und Footer fest in jede Seite – damit Google, Bing und
     KI-Suchmaschinen alles lesen können, auch ohne JavaScript
   - erzeugt für jedes Projekt eine eigene Seite unter /projekte/<slug>.html
   - füllt die Referenzen-Liste und die Projekte auf der Leistungsseite
   - erzeugt sitemap.xml, robots.txt und llms.txt

   Inhalte änderst du weiterhin in den HTML-Dateien bzw. in
   assets/js/projects.js. Die Bereiche zwischen  <!-- build:… -->  und
   <!-- /build:… -->  werden bei jedem Build überschrieben.
   ========================================================================== */

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/* --------------------------------------------------------------------------
   Grunddaten – hier anpassen
   -------------------------------------------------------------------------- */
const SITE = {
  url: "https://itsmp4.ch", // Domain der Website (ohne / am Ende)
  name: "itsmp4",
  person: "Livio",
  jobTitle: "Videograf",
  mail: "hello@itsmp4.ch",
  instagram: "https://www.instagram.com/itsmp4.ch/",
  city: "Luzern",
  region: "LU",
  founded: "2026",
  description:
    "itsmp4 ist die Videoproduktion von Livio, Videograf in Luzern. Eventvideos, Imagefilme, Social-Media-Reels und Musikvideos für Firmen, Veranstalter und Musiker in Luzern und der ganzen Zentralschweiz.",
  // Orte, für die die Seite gefunden werden soll
  areaServed: ["Luzern", "Kriens", "Emmen", "Horw", "Ebikon", "Sursee", "Entlebuch", "Zug", "Schwyz", "Stans", "Sarnen", "Altdorf"],
  services: [
    { name: "Eventvideo", slug: "eventvideo-luzern", text: "Fashion Shows, Konzerte, Firmenanlässe und Partys – als Aftermovie oder kurzer Recap." },
    { name: "Imagefilm", slug: "imagefilm-luzern", text: "Filme, die zeigen, wer hinter einer Firma, einem Laden oder einer Marke steht." },
    { name: "Social-Media-Reels", slug: "social-media-video-luzern", text: "Kurze Clips im Hochformat für Instagram, TikTok und YouTube Shorts." },
    { name: "Musikvideo", slug: "musikvideo-luzern", text: "Musikvideos und Live-Sessions für Bands, Rapper und DJs." },
    { name: "Schnitt & Farbkorrektur", text: "Du hast schon Material? Ich schneide es und gebe ihm einen eigenen Look." },
  ],
};

// FAQ für die Leistungsseite – erscheint sichtbar auf der Seite UND als Schema.org-FAQ
const FAQ = [
  {
    q: "Was macht ein Videograf?",
    a: "Ein Videograf plant, filmt und schneidet Videos – meist als Einzelperson statt als grosse Produktionsfirma. Bei itsmp4 bekommst du alles aus einer Hand: Konzept, Dreh, Schnitt und Farbkorrektur. Manche schreiben auch «Videograph», gemeint ist dasselbe.",
  },
  {
    q: "Was kostet ein Video in Luzern?",
    a: "Das hängt vom Umfang ab: Wie lange wird gedreht, wie viele Videos brauchst du und in welchen Formaten? Schreib mir kurz, was du vorhast, dann bekommst du eine unverbindliche Offerte.",
  },
  {
    q: "Filmst du auch ausserhalb von Luzern?",
    a: "Ja. Ich bin in der ganzen Zentralschweiz unterwegs, also in Luzern, Zug, Schwyz, Nidwalden, Obwalden und Uri, und für passende Projekte auch in der restlichen Schweiz und im Ausland.",
  },
  {
    q: "Welche Arten von Videos machst du?",
    a: "Eventvideos und Aftermovies, Imagefilme für Firmen, Reels für Social Media und Musikvideos. Wenn du schon Material hast, übernehme ich auch nur den Schnitt und die Farbkorrektur.",
  },
  {
    q: "Bekomme ich das Video im Hoch- und im Querformat?",
    a: "Ja, wenn du willst. Ich plane den Dreh so, dass aus demselben Material ein Video im Querformat (16:9) für YouTube oder die Website und Clips im Hochformat (9:16) für Instagram und TikTok entstehen.",
  },
  {
    q: "Wie läuft ein Projekt ab?",
    a: "Zuerst besprechen wir deine Idee, danach plane ich den Dreh. Am Drehtag filme ich, anschliessend schneide ich das Video und mache die Farbkorrektur. Du bekommst einen Entwurf, gibst Feedback und erhältst danach die fertigen Dateien.",
  },
  {
    q: "Wie frage ich ein Video an?",
    a: `Über das Kontaktformular auf dieser Website, per E-Mail an ${SITE.mail} oder per Nachricht auf Instagram (@itsmp4.ch).`,
  },
];

/* --------------------------------------------------------------------------
   Leistungsseiten – je eine Seite pro Suchbegriff (z.B. «Eventvideo Luzern»)
   -------------------------------------------------------------------------- */
const SERVICE_PAGES = [
  {
    slug: "eventvideo-luzern",
    name: "Eventvideo",
    h1: "Eventvideo in Luzern",
    title: "Eventvideo Luzern – Aftermovie & Eventfilm | itsmp4",
    description: "Eventvideo in Luzern: Aftermovies und Eventfilme für Firmenanlässe, Konzerte, Partys und Fashion Shows. Gefilmt und geschnitten von itsmp4, Videograf in Luzern.",
    lead: "Ein guter Eventfilm zeigt nicht nur, was passiert ist, sondern wie es sich angefühlt hat. Ich filme Anlässe in Luzern und der Zentralschweiz und mache daraus Aftermovies, die man gerne teilt.",
    forTitle: "Für welche Anlässe",
    forList: ["Firmenanlässe und Jubiläen", "Konzerte und Clubnächte", "Fashion Shows und Produktlaunches", "Messen und Konferenzen", "Vereinsanlässe und Festivals"],
    getList: ["Aftermovie im Querformat für Website und YouTube", "Kurze Clips im Hochformat für Instagram und TikTok", "Schnitt im Takt der Musik und eigene Farbstimmung", "Auf Wunsch kurze Statements von Gästen oder Veranstaltern"],
    body: [
      "Am Event bin ich unauffällig unterwegs, mit leichter Ausrüstung und meist aus der Hand. So komme ich nah an die Momente heran, ohne dass sich jemand gestellt fühlt.",
      "Vorher gehen wir den Ablauf zusammen durch, damit ich die wichtigsten Punkte nicht verpasse: Reden, Auftritte, Höhepunkte. Nach dem Anlass bekommst du einen Entwurf, gibst Feedback und erhältst danach die fertigen Dateien.",
    ],
    faq: [
      { q: "Wie lange sollte ein Eventvideo sein?", a: "Für Social Media funktionieren 15 bis 60 Sekunden am besten, als Aftermovie für die Website meist 1 bis 3 Minuten. Oft lohnt sich beides aus demselben Material." },
      { q: "Filmst du den ganzen Anlass?", a: "So lange, wie es für den Film nötig ist – vom Aufbau bis zum letzten Programmpunkt oder nur den Hauptteil. Das legen wir vorher gemeinsam fest." },
    ],
    match: (p) => p.category === "Event",
  },
  {
    slug: "imagefilm-luzern",
    name: "Imagefilm",
    h1: "Imagefilm in Luzern",
    title: "Imagefilm Luzern – Firmenvideo & Unternehmensfilm | itsmp4",
    description: "Imagefilm in Luzern: Firmenvideos und Unternehmensfilme für KMU, Läden, Gastro und Marken in der Zentralschweiz. Konzept, Dreh und Schnitt von itsmp4.",
    lead: "Ein Imagefilm zeigt, wer hinter einer Firma steckt: die Menschen, die Arbeit und das, was euch ausmacht. Ich produziere Imagefilme für KMU, Läden, Gastro und Marken in Luzern und Umgebung.",
    forTitle: "Wofür ein Imagefilm",
    forList: ["Website und Über-uns-Seite", "Recruiting und Stelleninserate", "Social Media und Werbung", "Präsentationen und Messen"],
    getList: ["Konzept und einfacher Drehplan", "Dreh vor Ort in deinem Betrieb", "Schnitt, Farbkorrektur und passende Musik", "Versionen in verschiedenen Längen und Formaten"],
    body: [
      "Bevor die Kamera läuft, klären wir, wen der Film ansprechen soll und was hängen bleiben muss. Daraus entsteht ein Plan für den Drehtag.",
      "Ich filme lieber echte Abläufe als gestellte Szenen. Das wirkt glaubwürdiger und ist für dein Team entspannter.",
    ],
    faq: [
      { q: "Was kostet ein Imagefilm in Luzern?", a: "Das hängt vor allem von der Anzahl Drehtage, der Länge und der Anzahl Versionen ab. Nach einem kurzen Gespräch bekommst du eine klare, unverbindliche Offerte." },
      { q: "Braucht es Schauspieler?", a: "Meistens nicht. Mitarbeitende und echte Situationen wirken oft stärker. Ich sorge dafür, dass sich alle vor der Kamera wohlfühlen." },
    ],
    match: () => true,
  },
  {
    slug: "social-media-video-luzern",
    name: "Social-Media-Video",
    h1: "Social-Media-Videos in Luzern",
    title: "Social Media Video Luzern – Reels & TikToks | itsmp4",
    description: "Reels, TikToks und YouTube Shorts aus Luzern: Social-Media-Videos im Hochformat für Firmen, Events und Marken. Dreh und Schnitt von itsmp4, Videograf in Luzern.",
    lead: "Auf Instagram und TikTok entscheiden die ersten zwei Sekunden. Ich drehe und schneide Videos im Hochformat, die genau dafür gemacht sind: kurz, schnell und mit klarem Look.",
    forTitle: "Wofür",
    forList: ["Reels und TikToks für dein Unternehmen", "Event-Recaps im Hochformat", "Produkt- und Teaser-Clips", "Serien mit mehreren Clips aus einem Drehtag"],
    getList: ["Clips im Hochformat (9:16)", "Untertitel auf Wunsch", "Varianten für Instagram, TikTok und YouTube Shorts", "Material, das du auch später noch posten kannst"],
    body: [
      "Ich plane den Dreh so, dass aus einem Tag möglichst viele Clips entstehen. Das spart Zeit und Budget, und du hast Inhalte für mehrere Wochen.",
      "Wenn du sowieso ein Event oder einen Imagefilm planst, drehe ich die Hochformat-Clips direkt mit.",
    ],
    faq: [
      { q: "Wie viele Clips bekomme ich aus einem Drehtag?", a: "Das hängt vom Thema ab. Mit guter Planung entstehen mehrere Clips, die du über Wochen verteilt posten kannst." },
      { q: "Machst du auch Untertitel?", a: "Ja. Viele schauen Videos ohne Ton, deshalb gehören Untertitel bei Social Media fast immer dazu." },
    ],
    match: (p) => p.format === "9:16",
  },
  {
    slug: "musikvideo-luzern",
    name: "Musikvideo",
    h1: "Musikvideo in Luzern",
    title: "Musikvideo Luzern – Musikvideos & Live-Sessions | itsmp4",
    description: "Musikvideo in Luzern drehen: Musikvideos, Live-Sessions und Visuals für Bands, Rapper und DJs aus der Zentralschweiz. Von itsmp4, Videograf in Luzern.",
    lead: "Ein Musikvideo soll so aussehen, wie dein Song klingt. Ich drehe Musikvideos, Live-Sessions und Clips für Bands, Rapper und DJs aus Luzern und der Zentralschweiz.",
    forTitle: "Was ich drehe",
    forList: ["Musikvideos mit Konzept", "Live-Sessions im Proberaum oder an einer Location", "Konzert- und DJ-Clips", "Teaser und Snippets für Social Media"],
    getList: ["Idee und Look gemeinsam entwickelt", "Dreh an einer passenden Location in der Region", "Schnitt im Takt und eigene Farbstimmung", "Hochformat-Snippets für den Release"],
    body: [
      "Wir starten mit deinem Song und einer Stimmung: Farben, Orte, Referenzen. Daraus entsteht ein Plan, der zu deinem Budget passt.",
      "Luzern und die Zentralschweiz haben dafür viele Locations – vom Seeufer bis zur Industriehalle.",
    ],
    faq: [
      { q: "Was kostet ein Musikvideo?", a: "Je nach Idee sehr unterschiedlich – von der einfachen Live-Session bis zum Video mit mehreren Drehorten. Erzähl mir von deinem Song, dann finden wir eine Lösung, die zu deinem Budget passt." },
      { q: "Hilfst du auch bei der Idee?", a: "Ja. Viele Musikvideos entstehen im gemeinsamen Gespräch. Ich bringe Vorschläge für Look, Locations und Ablauf mit." },
    ],
    match: (p) => /DJ|Musik|Konzert|Band/i.test(p.text.join(" ")),
  },
];
const serviceFor = (p) => SERVICE_PAGES.find((s) => s.slug === (p.category === "Event" ? "eventvideo-luzern" : null));

/* --------------------------------------------------------------------------
   Seiten (handgeschriebene HTML-Dateien)
   -------------------------------------------------------------------------- */
const PAGES = [
  {
    file: "index.html",
    url: "/",
    key: "home",
    type: "WebPage",
    title: "itsmp4 – Videograf aus Luzern | Videoproduktion",
    description:
      "itsmp4 – Livio, Videograf aus Luzern. Eventvideos, Imagefilme, Reels und Musikvideos für Firmen, Veranstalter und Musiker in Luzern und der Zentralschweiz.",
    preload: "assets/img/startseite-reel.jpg",
  },
  {
    file: "videograf-luzern.html",
    url: "/videograf-luzern.html",
    key: "leistungen",
    type: "WebPage",
    crumb: "Videograf Luzern",
    title: "Videograf Luzern – Eventvideos, Imagefilme & Reels | itsmp4",
    description:
      "Videograf in Luzern gesucht? itsmp4 filmt Events, Imagefilme, Reels und Musikvideos in Luzern und der ganzen Zentralschweiz. Jetzt Offerte anfragen.",
    faq: true,
  },
  {
    file: "referenzen.html",
    url: "/referenzen.html",
    key: "referenzen",
    type: "CollectionPage",
    crumb: "Referenzen",
    title: "Referenzen – Videoproduktionen aus Luzern | itsmp4",
    description:
      "Ausgewählte Videoprojekte von itsmp4: Eventvideos, Musikvideos und eigene Projekte – gefilmt und geschnitten von Livio, Videograf in Luzern.",
  },
  {
    file: "ueber-mich.html",
    url: "/ueber-mich.html",
    key: "about",
    type: "AboutPage",
    crumb: "Über mich",
    title: "Über mich – Livio, Videograf aus Luzern | itsmp4",
    description:
      "Ich bin Livio, Videograf aus Luzern und Gründer von itsmp4. Ich plane, filme, schneide und mache die Farbkorrektur – alles aus einer Hand.",
    image: "assets/img/portrait.jpg",
  },
  {
    file: "kontakt.html",
    url: "/kontakt.html",
    key: "kontakt",
    type: "ContactPage",
    crumb: "Kontakt",
    title: "Kontakt – Videograf in Luzern anfragen | itsmp4",
    description:
      "Video geplant? Schreib Livio von itsmp4, Videograf in Luzern. Unverbindliche Anfrage für Eventvideo, Imagefilm, Reels oder Musikvideo.",
  },
  {
    file: "404.html",
    url: "/404.html",
    key: "404",
    type: "WebPage",
    title: "Seite nicht gefunden | itsmp4",
    description: "Diese Seite gibt es nicht. Zurück zur Startseite von itsmp4, Videograf in Luzern.",
    noindex: true,
    pre: "/", // 404 kann unter jeder Adresse erscheinen -> absolute Pfade
  },
];

const NAV = [
  ["referenzen.html", "Referenzen", "referenzen"],
  ["videograf-luzern.html", "Leistungen", "leistungen"],
  ["ueber-mich.html", "Über mich", "about"],
  ["kontakt.html", "Kontakt", "kontakt"],
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
const projectUrl = (p) => `/projekte/${p.slug}.html`;

/* --------------------------------------------------------------------------
   Schema.org (JSON-LD)
   -------------------------------------------------------------------------- */
const ID = {
  business: SITE.url + "/#business",
  person: SITE.url + "/#livio",
  website: SITE.url + "/#website",
};

const business = {
  "@type": ["LocalBusiness", "ProfessionalService"],
  "@id": ID.business,
  name: SITE.name,
  alternateName: ["itsmp4 Videoproduktion", "itsmp4 Videograf Luzern", "itsmp4 Videograph Luzern"],
  slogan: "Frame it.",
  description: SITE.description,
  url: SITE.url + "/",
  email: SITE.mail,
  logo: { "@type": "ImageObject", url: abs("assets/img/icon-512.png"), width: 512, height: 512 },
  image: abs("assets/img/og-image.jpg"),
  foundingDate: SITE.founded,
  founder: { "@id": ID.person },
  address: { "@type": "PostalAddress", addressLocality: SITE.city, addressRegion: SITE.region, addressCountry: "CH" },
  geo: { "@type": "GeoCoordinates", latitude: 47.0502, longitude: 8.3093 },
  knowsLanguage: ["de", "de-CH"],
  areaServed: [
    { "@type": "City", name: "Luzern" },
    { "@type": "AdministrativeArea", name: "Kanton Luzern" },
    { "@type": "AdministrativeArea", name: "Kanton Zug" },
    { "@type": "AdministrativeArea", name: "Kanton Schwyz" },
    { "@type": "AdministrativeArea", name: "Kanton Nidwalden" },
    { "@type": "AdministrativeArea", name: "Kanton Obwalden" },
    { "@type": "AdministrativeArea", name: "Kanton Uri" },
    { "@type": "Country", name: "Schweiz" },
  ],
  knowsAbout: ["Videografie", "Videoproduktion", "Eventvideo", "Aftermovie", "Imagefilm", "Musikvideo", "Social-Media-Video", "Reels", "Videoschnitt", "Color Grading"],
  sameAs: [SITE.instagram],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Videoproduktion in Luzern",
    itemListElement: SITE.services.map((s) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: `${s.name} Luzern`,
        description: s.text,
        serviceType: s.name,
        areaServed: { "@type": "City", name: "Luzern" },
        provider: { "@id": ID.business },
        ...(s.slug ? { url: pageUrl(`/${s.slug}.html`) } : {}),
      },
    })),
  },
};

const person = {
  "@type": "Person",
  "@id": ID.person,
  name: SITE.person,
  jobTitle: SITE.jobTitle,
  image: abs("assets/img/portrait.jpg"),
  url: pageUrl("/ueber-mich.html"),
  worksFor: { "@id": ID.business },
  homeLocation: { "@type": "Place", name: "Luzern, Schweiz" },
  knowsAbout: business.knowsAbout,
  sameAs: [SITE.instagram],
};

const website = {
  "@type": "WebSite",
  "@id": ID.website,
  url: SITE.url + "/",
  name: SITE.name,
  description: SITE.description,
  inLanguage: "de-CH",
  publisher: { "@id": ID.business },
};

function breadcrumb(items) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, url], i) => ({ "@type": "ListItem", position: i + 1, name, item: pageUrl(url) })),
  };
}

function videoObject(p) {
  return {
    "@type": "VideoObject",
    "@id": pageUrl(projectUrl(p)) + "#video",
    name: `${p.title} – ${p.category === "Eigenes Projekt" ? "Video" : p.category + "video"} von itsmp4`,
    description: p.text.join(" "),
    thumbnailUrl: [abs(p.poster)],
    uploadDate: p.date,
    duration: `PT${p.seconds}S`,
    contentUrl: abs(p.video),
    embedUrl: pageUrl(projectUrl(p)),
    inLanguage: "de-CH",
    creator: { "@id": ID.person },
    publisher: { "@id": ID.business },
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
    about: { "@id": ID.business },
    primaryImageOfPage: abs(page.image || "assets/img/og-image.jpg"),
    ...(crumbs.length > 1 ? { breadcrumb: breadcrumb(crumbs) } : {}),
  };
  const graph = { "@context": "https://schema.org", "@graph": [business, person, website, webpage, ...extra] };
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
  <meta name="author" content="${SITE.person} – ${SITE.name}">
  <meta name="theme-color" content="#0c0a09">
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
  <link rel="stylesheet" href="${pre}assets/css/style.css">${page.preload ? `
  <link rel="preload" as="image" href="${pre}${page.preload}" fetchpriority="high">` : ""}
  ${jsonld(page, extraLd)}`;
}

function header(key, pre) {
  const home = `${pre}index.html`; // direkt auf die Datei, funktioniert auch ohne Webserver
  const link = ([href, label, k]) =>
    `<a href="${pre}${href}"${k === key ? ' aria-current="page"' : ""}><span class="roll" data-text="${label}">${label}</span></a>`;
  return `  <header class="site-header">
    <nav class="nav nav-l" aria-label="Hauptnavigation">${NAV.slice(0, 2).map(link).join("")}</nav>
    <a class="brand" href="${home}" aria-label="itsmp4 – Videograf Luzern, zur Startseite">
      <img src="${pre}assets/img/itsmp4-logo.png" alt="itsmp4" width="1326" height="228">
    </a>
    <nav class="nav nav-r" aria-label="Weitere Seiten">${NAV.slice(2).map(link).join("")}</nav>
    <button class="menu-btn" aria-expanded="false" aria-controls="mobile-nav">Menü</button>
    <nav class="mobile-nav" id="mobile-nav" aria-label="Menü">${NAV.map(link).join("")}</nav>
  </header>`;
}

function footer(pre) {
  return `  <footer class="site-foot">
    <div class="foot-card">
      <div class="foot-top">
        <p class="foot-title">Neues Projekt?</p>
        <div class="foot-mailbox">
          <button class="foot-mail" data-copy="${SITE.mail}">
            <span class="fm-text">${SITE.mail}</span>
            <span class="fm-hint">Kopieren</span>
          </button>
          <a class="foot-cta" href="${pre}kontakt.html">Anfrage senden →</a>
        </div>
      </div>

      <div class="foot-cols">
        <div>
          <span class="foot-label">Seiten</span>
          <a href="${pre}referenzen.html">Referenzen</a>
          <a href="${pre}videograf-luzern.html">Leistungen</a>
          <a href="${pre}ueber-mich.html">Über mich</a>
          <a href="${pre}kontakt.html">Kontakt</a>
        </div>
        <div>
          <span class="foot-label">Leistungen</span>
${SERVICE_PAGES.map((sp) => `          <a href="${pre}${sp.slug}.html">${sp.name} Luzern</a>`).join("\n")}
        </div>
        <div>
          <span class="foot-label">Videograf Luzern</span>
          <span>${SITE.name} · ${SITE.person}</span>
          <span>${SITE.city}, Schweiz</span>
          <a href="mailto:${SITE.mail}">${SITE.mail}</a>
        </div>
        <div>
          <span class="foot-label">Social</span>
          <a href="${SITE.instagram}" target="_blank" rel="noopener">@itsmp4.ch ↗</a>
        </div>
        <div>
          <span class="foot-label">Luzern</span>
          <span data-clock>--:--</span>
        </div>
        <div class="foot-up">
          <button data-top>Nach oben ↑</button>
        </div>
      </div>

      <div class="foot-mark" aria-hidden="true">
        <img src="${pre}assets/img/itsmp4-logo.png" alt="" width="1326" height="228" loading="lazy">
      </div>
    </div>
    <div class="foot-legal">
      <span>© ${new Date().getFullYear()} ${SITE.name} · Videograf in ${SITE.city}</span>
      <span><a href="${pre}impressum.html">Impressum</a> · <a href="${pre}datenschutz.html">Datenschutz</a></span>
    </div>
  </footer>`;
}

/* --------------------------------------------------------------------------
   Projekt-Kacheln (Referenzen & Leistungsseite)
   -------------------------------------------------------------------------- */
function clip(p, pre = "") {
  const src = pre + p.video + (p.start ? `#t=${p.start}` : "");
  const kind = p.category === "Eigenes Projekt" ? "Video" : `${p.category}video`;
  return `      <article class="j-item clip" data-format="${p.format}" data-cat="${esc(p.category)}">
        <a href="${pre}projekte/${p.slug}.html">
          <div class="j-media">
            <img src="${pre}${p.poster}" alt="${esc(`${p.title} – ${kind} von itsmp4`)}" loading="lazy">
            <video muted playsinline preload="none" data-src="${src}" data-start="${p.start || 0}" aria-hidden="true"></video>
          </div>
          <h3>${esc(p.title)}</h3>
          <p>${esc(p.client)}, ${p.year}${p.placeholder ? '<span class="badge">Platzhalter</span>' : ""}</p>
        </a>
      </article>`;
}

/* --------------------------------------------------------------------------
   Projektseiten
   -------------------------------------------------------------------------- */
function projectPage(p, i) {
  const pre = "../";
  const next = PROJECTS[(i + 1) % PROJECTS.length];
  const kind = p.category === "Eigenes Projekt" ? "Video" : `${p.category}video`;
  const where = p.location ? ` in ${p.location}` : "";
  const page = {
    url: projectUrl(p),
    type: "WebPage",
    parent: ["Referenzen", "/referenzen.html"],
    crumb: p.title,
    title: `${p.title} – ${kind} | itsmp4 Videograf Luzern`,
    description: short(`${p.title}: ${kind}${where} von itsmp4, Videograf in Luzern. ${p.text.join(" ")}`),
    image: p.poster,
    ogType: "video.other",
    ogVideo: p.video,
    noindex: !!p.placeholder,
  };
  const facts = [
    ["Kunde", p.client],
    p.location && ["Ort", p.location],
    ["Jahr", p.year],
    ["Leistungen", p.services.join(", ")],
    p.seconds && ["Länge", `${Math.floor(p.seconds / 60)}:${String(p.seconds % 60).padStart(2, "0")} Min.`],
  ].filter(Boolean);
  const nextImg = (next.photos && next.photos[1] && next.photos[1].src) || next.poster;

  return `<!doctype html>
<html lang="de-CH">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
${head(page, pre, p.placeholder ? [] : [videoObject(p)])}
</head>
<body data-page="referenzen">
${header("referenzen", pre)}

  <main class="page boxed">
    <a class="back" href="${pre}referenzen.html">← Alle Referenzen</a>

    <div class="player ${p.format === "9:16" ? "portrait" : "landscape"}" data-player>
      <video src="${pre}${p.video}" poster="${pre}${p.poster}" playsinline preload="metadata" title="${esc(p.title)} – ${kind} von itsmp4"></video>
      <button class="play-btn" aria-label="Video ${esc(p.title)} abspielen">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 4l15 8-15 8z"/></svg>
      </button>
    </div>

    <article class="project-head">
      <h1 class="title reveal">${esc(p.title)}</h1>
      <dl class="facts reveal">
${facts.map(([k, v]) => `        <dt>${k}</dt><dd>${esc(v)}</dd>`).join("\n")}
      </dl>
      <div class="story reveal">
${p.text.map((t) => `        <p>${esc(t)}</p>`).join("\n")}
        <p><a class="inline-link" href="${pre}${(serviceFor(p) || { slug: "videograf-luzern" }).slug}.html">${serviceFor(p) ? `Mehr zu ${serviceFor(p).name}s in Luzern →` : "Was ich als Videograf in Luzern anbiete →"}</a></p>
      </div>
    </article>
${p.photos && p.photos.length ? `
    <section class="section" style="padding-left:0;padding-right:0" aria-label="Fotos">
      <div class="section-head"><h2>Fotos</h2></div>
      <div class="jgrid photos" data-photos data-max="6" data-mobile-max="2">
${p.photos.map((ph, n) => `        <div class="j-item" data-format="${ph.format}"><div class="j-media"><img src="${pre}${ph.src}" alt="${esc(`${p.title} – Standbild ${n + 1}${where}`)}" loading="lazy"></div></div>`).join("\n")}
      </div>
    </section>` : ""}

    <a class="next" href="${pre}projekte/${next.slug}.html">
      <img class="next-bg" src="${pre}${nextImg}" alt="" loading="lazy">
      <span class="next-label">Nächstes Projekt</span>
      <strong class="next-title">${esc(next.title)}</strong>
      <span class="next-arrow" aria-hidden="true">→</span>
    </a>
  </main>

${footer(pre)}

  <script src="${pre}assets/js/grid.js"></script>
  <script src="${pre}assets/js/main.js" defer></script>
  <script>
    document.addEventListener("DOMContentLoaded", () => {
      const photos = document.querySelector("[data-photos]");
      if (photos) justify(photos);
      // Klick auf Play startet das Video mit Ton und den normalen Steuerelementen
      const box = document.querySelector("[data-player]");
      const v = box.querySelector("video");
      box.querySelector(".play-btn").addEventListener("click", () => {
        box.classList.add("is-started");
        v.controls = true;
        v.play();
      });
    });
  </script>
</body>
</html>
`;
}

/* --------------------------------------------------------------------------
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

const faqHtml = (list) =>
  list.map((f) => `      <details class="faq-item">\n        <summary><h3>${esc(f.q)}</h3></summary>\n        <p>${esc(f.a)}</p>\n      </details>`).join("\n");
const faqLd = (url, list) => ({
  "@type": "FAQPage",
  "@id": pageUrl(url) + "#faq",
  mainEntity: list.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
});

/* --------------------------------------------------------------------------
   Leistungsseiten
   -------------------------------------------------------------------------- */
function servicePage(sp) {
  const url = `/${sp.slug}.html`;
  const page = {
    url,
    type: "WebPage",
    parent: ["Videograf Luzern", "/videograf-luzern.html"],
    crumb: sp.h1,
    title: sp.title,
    description: sp.description,
  };
  const related = REAL.filter(sp.match).slice(0, 3);
  const others = SERVICE_PAGES.filter((o) => o !== sp);
  const serviceLd = {
    "@type": "Service",
    "@id": pageUrl(url) + "#service",
    name: sp.h1,
    serviceType: sp.name,
    description: sp.description,
    url: pageUrl(url),
    provider: { "@id": ID.business },
    areaServed: business.areaServed,
  };
  const main = `    <h1 class="title">${esc(sp.h1)}</h1>
    <p class="lp-lead reveal">${esc(sp.lead)}</p>
    <div class="lp-cta reveal">
      <a class="send" href="kontakt.html">Offerte anfragen <span aria-hidden="true">→</span></a>
      <a class="inline-link" href="referenzen.html">Referenzen ansehen →</a>
    </div>

    <section class="lp-section lp-split" aria-labelledby="fuer">
      <h2 class="lp-h2" id="fuer">${esc(sp.forTitle)}</h2>
      <ul class="checklist reveal">
${sp.forList.map((x) => `        <li>${esc(x)}</li>`).join("\n")}
      </ul>
    </section>

    <section class="lp-section lp-split" aria-labelledby="bekommst">
      <h2 class="lp-h2" id="bekommst">Was du bekommst</h2>
      <div>
        <ul class="checklist reveal">
${sp.getList.map((x) => `          <li>${esc(x)}</li>`).join("\n")}
        </ul>
${sp.body.map((t) => `        <p class="lp-text reveal">${esc(t)}</p>`).join("\n")}
      </div>
    </section>
${related.length ? `
    <section class="lp-section" aria-labelledby="arbeiten">
      <div class="section-head">
        <h2 class="lp-h2" id="arbeiten">Aktuelle Arbeiten</h2>
        <a class="more" href="referenzen.html">Alle Referenzen →</a>
      </div>
      <div class="jgrid" data-featured>
${related.map((p) => clip(p)).join("\n")}
      </div>
    </section>` : ""}

    <section class="lp-section lp-split" aria-labelledby="faq">
      <h2 class="lp-h2" id="faq">Häufige Fragen</h2>
      <div class="faq">
${faqHtml(sp.faq)}
      </div>
    </section>

    <section class="lp-section lp-split" aria-labelledby="mehr">
      <h2 class="lp-h2" id="mehr">Weitere Leistungen</h2>
      <ul class="areas">
${others.map((o) => `        <li><a href="${o.slug}.html">${esc(o.name)} Luzern</a></li>`).join("\n")}
        <li><a href="videograf-luzern.html">Alle Leistungen als Videograf in Luzern</a></li>
      </ul>
    </section>`;
  const scripts = `  <script src="assets/js/grid.js"></script>
  <script>
    document.addEventListener("DOMContentLoaded", () => {
      const grid = document.querySelector("[data-featured]");
      if (grid) { justify(grid); initClips(grid); }
    });
  </script>`;
  return shell(page, "leistungen", "", [serviceLd, faqLd(url, sp.faq)], main, scripts);
}

/* --------------------------------------------------------------------------
   Impressum & Datenschutz
   Felder in [eckigen Klammern] vor dem Livegang ausfüllen!
   -------------------------------------------------------------------------- */
const LEGAL = {
  owner: "Livio [Nachname ergänzen]",
  street: "[Strasse und Nr. ergänzen]",
  zip: "[PLZ] Luzern",
  host: "[Name des Hosters ergänzen, z.B. Netlify, Hostpoint, Infomaniak]",
};

function legalPage(kind) {
  const url = `/${kind}.html`;
  const isImp = kind === "impressum";
  const page = {
    url,
    type: "WebPage",
    crumb: isImp ? "Impressum" : "Datenschutz",
    title: isImp ? "Impressum | itsmp4 – Videograf Luzern" : "Datenschutz | itsmp4 – Videograf Luzern",
    description: isImp ? "Impressum von itsmp4, Videograf in Luzern." : "Datenschutzerklärung von itsmp4, Videograf in Luzern.",
    noindex: true,
  };
  const main = isImp
    ? `    <h1 class="title">Impressum</h1>
    <div class="legal">
      <h2>Verantwortlich für diese Website</h2>
      <p>${SITE.name}<br>${esc(LEGAL.owner)}<br>${esc(LEGAL.street)}<br>${esc(LEGAL.zip)}<br>Schweiz</p>
      <p>E-Mail: <a href="mailto:${SITE.mail}">${SITE.mail}</a></p>
      <h2>Haftung</h2>
      <p>Die Inhalte dieser Website wurden sorgfältig erstellt. Für Richtigkeit, Vollständigkeit und Aktualität wird keine Gewähr übernommen. Für Inhalte verlinkter externer Seiten sind ausschliesslich deren Betreiber verantwortlich.</p>
      <h2>Urheberrecht</h2>
      <p>Videos, Fotos und Texte auf dieser Website gehören ${SITE.name} bzw. den jeweiligen Kunden. Verwendung nur mit schriftlicher Erlaubnis.</p>
    </div>`
    : `    <h1 class="title">Datenschutz</h1>
    <div class="legal">
      <p>Diese Website informiert über die Videoproduktion von ${SITE.name}. Es werden so wenige Daten wie möglich bearbeitet. Massgebend ist das Schweizer Datenschutzgesetz (DSG).</p>
      <h2>Verantwortlich</h2>
      <p>${SITE.name}, ${esc(LEGAL.owner)}, ${esc(LEGAL.zip)} – <a href="mailto:${SITE.mail}">${SITE.mail}</a></p>
      <h2>Keine Cookies, kein Tracking</h2>
      <p>Diese Website setzt keine Cookies und verwendet keine Analyse- oder Werbedienste. Schriften und alle anderen Dateien werden direkt von dieser Website geladen, nicht von Drittanbietern.</p>
      <h2>Hosting und Server-Logfiles</h2>
      <p>Die Website wird bei ${esc(LEGAL.host)} betrieben. Beim Aufruf speichert der Server technisch notwendige Angaben wie IP-Adresse, Datum, Uhrzeit und aufgerufene Seite. Diese Daten dienen nur dem sicheren Betrieb und werden nicht mit anderen Daten zusammengeführt.</p>
      <h2>Kontaktformular und E-Mail</h2>
      <p>Das Kontaktformular öffnet dein eigenes E-Mail-Programm. Es werden dabei keine Daten über diese Website gespeichert. Wenn du mir schreibst, verwende ich deine Angaben nur, um deine Anfrage zu beantworten.</p>
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

// 1) Projektseiten
fs.rmSync(path.join(ROOT, "projekte"), { recursive: true, force: true });
PROJECTS.forEach((p, i) => write(`projekte/${p.slug}.html`, projectPage(p, i)));

// Leistungsseiten, Impressum, Datenschutz
SERVICE_PAGES.forEach((sp) => write(`${sp.slug}.html`, servicePage(sp)));
write("impressum.html", legalPage("impressum"));
write("datenschutz.html", legalPage("datenschutz"));

// 2) Handgeschriebene Seiten
for (const page of PAGES) {
  let html = read(page.file);
  const extra = [];
  if (page.faq) {
    extra.push({
      "@type": "FAQPage",
      "@id": pageUrl(page.url) + "#faq",
      mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    });
  }
  if (page.key === "referenzen") {
    extra.push({
      "@type": "ItemList",
      name: "Referenzen von itsmp4",
      itemListElement: REAL.map((p, n) => ({ "@type": "ListItem", position: n + 1, url: pageUrl(projectUrl(p)), name: p.title })),
    });
  }
  if (page.key === "home") extra.push(...REAL.slice(0, 1).map(videoObject));

  const pre = page.pre || "";
  html = inject(html, "head", head(page, pre, extra), page.file);
  html = inject(html, "header", header(page.key, pre), page.file);
  if (html.includes("<!-- build:footer -->")) html = inject(html, "footer", footer(pre), page.file);

  if (page.key === "referenzen") {
    const cats = ["Alle", ...new Set(PROJECTS.map((p) => p.category))];
    html = inject(html, "filters", cats.map((c, i) => `      <button aria-pressed="${i === 0}" data-cat="${esc(c)}">${esc(c)}</button>`).join("\n"), page.file);
    html = inject(html, "grid", PROJECTS.map((p) => clip(p)).join("\n"), page.file);
  }
  if (page.faq) {
    html = inject(
      html,
      "faq",
      FAQ.map((f) => `      <details class="faq-item">\n        <summary><h3>${esc(f.q)}</h3></summary>\n        <p>${esc(f.a)}</p>\n      </details>`).join("\n"),
      page.file
    );
    html = inject(html, "featured", REAL.slice(0, 3).map((p) => clip(p)).join("\n"), page.file);
    html = inject(
      html,
      "services",
      SITE.services
        .map((s, n) => {
          const name = s.slug ? `<a href="${s.slug}.html">${esc(s.name)} <span aria-hidden="true">→</span></a>` : esc(s.name);
          return `      <li class="service reveal"><span class="service-no">0${n + 1}</span><h3>${name}</h3><p>${esc(s.text)}</p></li>`;
        })
        .join("\n"),
      page.file
    );
    html = inject(html, "areas", SITE.areaServed.map((a) => `      <li>${esc(a)}</li>`).join("\n"), page.file);
  }
  write(page.file, html);
}

// 3) Sitemap (mit Video-Angaben für die Google-Videosuche)
const urls = [
  ...PAGES.filter((p) => !p.noindex).map((p) => ({ loc: pageUrl(p.url), priority: p.key === "home" ? "1.0" : p.key === "leistungen" ? "0.9" : "0.8" })),
  ...SERVICE_PAGES.map((sp) => ({ loc: pageUrl(`/${sp.slug}.html`), priority: "0.9" })),
  ...REAL.map((p) => ({ loc: pageUrl(projectUrl(p)), priority: "0.7", project: p })),
];
write(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <priority>${u.priority}</priority>${u.project ? `
    <image:image><image:loc>${abs(u.project.poster)}</image:loc></image:image>
    <video:video>
      <video:thumbnail_loc>${abs(u.project.poster)}</video:thumbnail_loc>
      <video:title>${esc(u.project.title)} – itsmp4</video:title>
      <video:description>${esc(short(u.project.text.join(" "), 1000))}</video:description>
      <video:content_loc>${abs(u.project.video)}</video:content_loc>
      <video:duration>${u.project.seconds}</video:duration>
      <video:publication_date>${u.project.date}</video:publication_date>
    </video:video>` : ""}
  </url>`
  )
  .join("\n")}
</urlset>
`
);

// 4) robots.txt – Suchmaschinen und KI-Crawler ausdrücklich willkommen
write(
  "robots.txt",
  `# itsmp4 – Videograf Luzern
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
  `# itsmp4 – Videograf in Luzern

> ${SITE.description}

## Auf einen Blick
- Name: ${SITE.name} (Videoproduktion von ${SITE.person})
- Tätigkeit: Videograf – Planung, Dreh, Schnitt und Farbkorrektur aus einer Hand
- Standort: ${SITE.city}, Schweiz
- Einsatzgebiet: ${SITE.areaServed.join(", ")} und die ganze Schweiz
- Kontakt: ${SITE.mail} · Instagram @itsmp4.ch (${SITE.instagram})
- Website: ${SITE.url}/

## Leistungen
${SITE.services.map((s) => `- ${s.name}: ${s.text}`).join("\n")}

## Seiten
- [Startseite](${SITE.url}/)
- [Videograf in Luzern – Leistungen, Ablauf und FAQ](${pageUrl("/videograf-luzern.html")})
${SERVICE_PAGES.map((sp) => `- [${sp.h1}](${pageUrl(`/${sp.slug}.html`)}): ${sp.description}`).join("\n")}
- [Referenzen](${pageUrl("/referenzen.html")})
- [Über mich](${pageUrl("/ueber-mich.html")})
- [Kontakt](${pageUrl("/kontakt.html")})

## Referenzen
${REAL.map((p) => `- [${p.title}](${pageUrl(projectUrl(p))}): ${p.category}, ${p.client}, ${p.year}${p.location ? `, ${p.location}` : ""}. ${p.text[0]}`).join("\n")}

## Häufige Fragen
${FAQ.map((f) => `### ${f.q}\n${f.a}`).join("\n\n")}
`
);

console.log(`✓ ${PROJECTS.length} Projektseiten, ${SERVICE_PAGES.length} Leistungsseiten, ${PAGES.length} weitere Seiten, sitemap.xml, robots.txt, llms.txt`);
