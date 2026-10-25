/* ==========================================================================
   SELECTED WORK – hier pflegst du deine Projekte.
   Neues Projekt: einen Block { ... } kopieren und anpassen.
   Die Reihenfolge hier ist die Reihenfolge auf der Seite.

   slug        Name in der URL (klein, ohne Leerzeichen)
   title       Projekttitel
   client      Auftraggeber bzw. "Eigenes Projekt" (wird nicht angezeigt)
   year        Jahr
   category    Kategorie für den Filter (frei wählbar)
   format      "16:9" (quer) oder "9:16" (hochkant)
   video       Pfad zum ganzen Film (MP4)
   preview     optional: kurzer, stummer Loop für Startseite & Work
               (klein halten, ca. 10 Sek., siehe README)
   poster      Vorschaubild
   crop        optional: Bildausschnitt in der Work-Kachel, z.B. "50% 30%"
               (links/rechts, oben/unten – praktisch für Hochformat)
   start       optional: ab welcher Sekunde die Vorschau läuft (nur ohne preview)
   subtitle    kurze Beschreibung – nur für Google (Videosuche), nicht sichtbar
   text        längere Beschreibung – nur für Google, nicht sichtbar
   photos      optional: Filmstills, { src, format } – werden zurzeit nicht angezeigt
   date        Veröffentlichungsdatum (JJJJ-MM-TT) – wird als «Monat Jahr» angezeigt
   seconds     Länge des Videos in Sekunden
   location    optional: Drehort (z.B. "Luzern")
   placeholder true = Platzhalter-Projekt (wird markiert und nicht von Google
               indexiert). Löschen, wenn echt.

   WICHTIG: Nach jeder Änderung hier  `node tools/build.mjs`  ausführen.
   Das erzeugt die Work-Liste und die Sitemap neu.
   ========================================================================== */

window.PROJECTS = [
  {
    slug: "timeless-tunes-frizzli",
    date: "2026-10-17",
    seconds: 39,
    title: "Timeless Tunes × Frizzli",
    client: "Timeless Tunes",
    year: 2026,
    category: "Event",
    format: "9:16",
    video: "assets/video/timeless-tunes-frizzli.mp4",
    preview: "assets/video/preview/timeless-tunes-frizzli.mp4",
    poster: "assets/img/timeless-tunes-frizzli.jpg",
    subtitle: "Noch ein Abend mit Timeless Tunes.",
    text: [
      "DJs, Drinks und eine volle Tanzfläche: Eventfilm im Hochformat von einem weiteren Timeless-Tunes-Abend, zusammen mit Frizzli.",
    ],
  },
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
    preview: "assets/video/preview/orofanie.mp4",
    poster: "assets/img/orofanie.jpg",
    subtitle: "Fashion Show auf einem Schiff.",
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
    preview: "assets/video/preview/timeless-tunes.mp4",
    poster: "assets/img/timeless-tunes.jpg",
    subtitle: "DJs, Nebel und ein voller Dancefloor.",
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
    preview: "assets/video/preview/mar-de-pins.mp4",
    poster: "assets/img/mar-de-pins.jpg",
    subtitle: "Pinienwald, Felsen und Wellen an der Küste von Mallorca.",
    text: [
      "Pinienwald, Felsen und Wellen an der Küste von Mallorca. Ein eigenes Projekt ohne Kunde und ohne Briefing, nur Kamera, Wetter und Meer.",
      "Gedreht an einem grauen Tag mit viel Wind. Genau das hat die Stimmung gemacht.",
    ],
    photos: [2, 3, 4, 5, 6, 7].map((n) => ({ src: `assets/img/stills/mardepins-${n}.jpg`, format: "16:9" })),
  },
  {
    slug: "arcteryx",
    date: "2026-04-07",
    seconds: 50,
    title: "Arc'teryx Spec Ad",
    client: "Eigenes Projekt",
    year: 2026,
    category: "Eigenes Projekt",
    format: "16:9",
    video: "assets/video/arcteryx.mp4",
    preview: "assets/video/preview/arcteryx.mp4",
    poster: "assets/img/arcteryx.jpg",
    subtitle: "Spec Ad: Ski, Bike und Berge.",
    text: [
      "Ein freier Werbefilm (Spec Ad) für Arc'teryx. Ein eigenes Projekt, nicht im Auftrag der Marke entstanden. Skifahren im Frühlingsschnee, Biken über Wiesen und durch den Wald.",
      "Gedreht in den Schweizer Bergen, geschnitten und gegradet von Livio Krummenacher.",
    ],
  },
  {
    slug: "maison82-collective",
    date: "2026-07-02",
    seconds: 23,
    title: "Maison 82 Collective",
    client: "Maison 82 Collective",
    year: 2026,
    category: "Musik",
    format: "16:9",
    video: "assets/video/maison82-collective.mp4",
    preview: "assets/video/preview/maison82-collective.mp4",
    poster: "assets/img/maison82-collective.jpg",
    subtitle: "DJ-Session zwischen weissen Wänden.",
    text: [
      "Ein DJ-Set von Maison 82 Collective in einem leeren Galerieraum, zwischen Holzkisten und weissen Wänden.",
      "Gefilmt mit mehreren Kameras und mit eigenem Ton aufgenommen.",
    ],
  },
];
