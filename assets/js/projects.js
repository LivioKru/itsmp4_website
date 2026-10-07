/* ==========================================================================
   REFERENZEN – hier pflegst du deine Projekte.
   Neues Projekt: einen Block { ... } kopieren und anpassen.
   Die Reihenfolge hier ist die Reihenfolge auf der Seite.

   slug        Name in der URL (klein, ohne Leerzeichen)
   title       Projekttitel
   client      Kunde
   year        Jahr
   category    Kategorie für den Filter (frei wählbar)
   format      "16:9" (quer) oder "9:16" (hochkant)
   video       Pfad zum Video (MP4)
   poster      Vorschaubild
   start       optional: ab welcher Sekunde die Vorschau läuft
   services    Leistungen
   text        Beschreibung, ein Eintrag pro Absatz
   photos      optional: Fotos vom Event, { src, format } (format wie oben)
   date        Veröffentlichungsdatum (JJJJ-MM-TT) – für Google-Videosuche
   seconds     Länge des Videos in Sekunden
   location    optional: Drehort (z.B. "Luzern")
   placeholder true = Platzhalter-Projekt (wird markiert und nicht von Google
               indexiert). Löschen, wenn echt.

   WICHTIG: Nach jeder Änderung hier  `node tools/build.mjs`  ausführen.
   Das erzeugt die Projektseiten, die Referenzen-Liste und die Sitemap neu.
   ========================================================================== */

window.PROJECTS = [
  {
    slug: "orofanie",
    date: "2026-08-22",
    seconds: 39,
    location: "Vierwaldstättersee, Luzern",
    title: "Orofanie",
    client: "Orofanie",
    year: 2026,
    category: "Event",
    format: "16:9",
    video: "assets/video/orofanie.mp4",
    poster: "assets/img/orofanie.jpg",
    services: ["Dreh", "Schnitt", "Farbkorrektur"],
    text: [
      "Fashion Show auf einem Schiff. Ich habe die Show mit zwei Kameras begleitet, direkt am Laufsteg und zwischen den Gästen.",
      "Daraus ist ein kurzer Eventfilm entstanden, der den Abend in unter einer Minute zeigt.",
    ],
    photos: [1, 2, 3, 4, 5, 6].map((n) => ({ src: `assets/img/stills/orofanie-${n}.jpg`, format: "16:9" })),
  },
  {
    slug: "timeless-tunes",
    date: "2026-09-26",
    seconds: 38,
    title: "Timeless Tunes",
    client: "Timeless Tunes",
    year: 2026,
    category: "Event",
    format: "9:16",
    video: "assets/video/timeless-tunes.mp4",
    poster: "assets/img/timeless-tunes.jpg",
    services: ["Eventvideo", "Social-Media-Reel", "Schnitt"],
    text: [
      "DJs, Nebel und ein voller Dancefloor: Für Timeless Tunes habe ich ein Eventvideo im Hochformat gedreht, gemacht für Instagram und TikTok.",
      "Gefilmt mitten aus der Menge, nah an den DJs und am Publikum, und im Takt der Musik geschnitten. So wirkt der Clip auch auf dem Handy wie ein Abend, bei dem man dabei sein wollte.",
    ],
    photos: [1, 2, 3, 4, 5, 6].map((n) => ({ src: `assets/img/stills/timeless-${n}.jpg`, format: "9:16" })),
  },
  {
    slug: "mar-de-pins",
    date: "2026-10-05",
    seconds: 13,
    location: "Mallorca",
    title: "Mar de Pins",
    client: "Eigenes Projekt",
    year: 2026,
    category: "Eigenes Projekt",
    format: "16:9",
    video: "assets/video/mar-de-pins.mp4",
    poster: "assets/img/mar-de-pins.jpg",
    services: ["Kamera", "Schnitt", "Farbkorrektur"],
    text: [
      "Pinienwald, Felsen und Wellen an der Küste von Mallorca. Ein eigenes Projekt ohne Kunde und ohne Briefing, nur Kamera, Wetter und Meer.",
      "Gedreht an einem grauen Tag mit viel Wind. Genau das hat die Stimmung gemacht.",
    ],
    photos: [2, 3, 4, 5, 6, 7].map((n) => ({ src: `assets/img/stills/mardepins-${n}.jpg`, format: "16:9" })),
  },
];
