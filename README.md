# itsmp4 — Website

Statische Website (HTML/CSS/JS). Ein kleines Build-Skript erzeugt Projektseiten,
Navigation, Footer und alle SEO-Daten.

## Lokal ansehen

```bash
cd itsmp4_website
python3 -m http.server 8642
```
Dann http://localhost:8642 öffnen.

## Nach jeder Änderung: Build

```bash
node tools/build.mjs
```

Das schreibt Titel, Beschreibungen, Schema.org-Daten, Navigation und Footer in
alle Seiten, erzeugt `/projekte/<name>.html` für jedes Projekt und aktualisiert
`sitemap.xml`, `robots.txt` und `llms.txt`.
Bereiche zwischen `<!-- build:… -->` und `<!-- /build:… -->` nicht von Hand
ändern – sie werden beim Build überschrieben.

## Seiten

| Datei | Inhalt |
|---|---|
| `index.html` | Startseite – Video, Logo, «Play the work» |
| `videograf-luzern.html` | Hauptseite für «Videograf Luzern»: Leistungen, Einsatzgebiet, Ablauf, FAQ |
| `eventvideo-luzern.html` usw. | Leistungsseiten (automatisch erzeugt, Inhalte in `SERVICE_PAGES` in `tools/build.mjs`) |
| `impressum.html`, `datenschutz.html` | automatisch erzeugt – **Felder in [Klammern] in `LEGAL` (tools/build.mjs) ausfüllen** |
| `referenzen.html` | Projektübersicht mit Filter |
| `projekte/<name>.html` | Projektseiten (automatisch erzeugt) |
| `ueber-mich.html` | Über mich |
| `kontakt.html` | Kontaktformular (öffnet das E-Mail-Programm) |
| `404.html` | Fehlerseite |

## Referenzen austauschen

Alles steht in **`assets/js/projects.js`**. Jeder Block `{ ... }` ist ein Projekt.
Neues Video als MP4 (H.264) in `assets/video/` legen, ein Vorschaubild in `assets/img/`, Pfade eintragen.
Für Google wichtig: `date` (Veröffentlichung), `seconds` (Länge) und wenn möglich `location` (Drehort).
Danach `node tools/build.mjs` ausführen.

Tipp: `.mov` vom Mac web-tauglich machen:
```bash
avconvert -s input.mov -o assets/video/name.mp4 -p Preset1920x1080
```

## Anpassen

- **Domain, E-Mail, Instagram, Ort, Leistungen, FAQ**: oben in `tools/build.mjs` (`SITE`, `FAQ`)
- **Seitentitel & Beschreibungen**: `PAGES` in `tools/build.mjs`
- **Texte**: direkt in den HTML-Dateien
- **Foto von dir**: `assets/img/portrait.jpg`
- **Farben/Schriften**: oben in `assets/css/style.css` (`:root`)

## Vor dem Hochladen
- Impressum/Datenschutz: Nachname, Adresse und Hoster in `LEGAL` (tools/build.mjs) eintragen, danach bei beiden Seiten `noindex: true` entfernen und neu bauen
- `livio.html` und `livio_files/` löschen (gespeicherte fremde Webseite)
- Ordner `videos/` und `tools/` müssen nicht online
- Prüfen, ob die Domain in `tools/build.mjs` stimmt (`SITE.url`)
- Die 404-Seite beim Hoster als Fehlerseite eintragen (bei Netlify/Vercel automatisch)

## Nach dem Hochladen (wichtig fürs Ranking)

1. **Google Search Console**: Domain bestätigen, `https://itsmp4.ch/sitemap.xml` einreichen
2. **Bing Webmaster Tools**: ebenfalls Sitemap einreichen (Bing speist ChatGPT- und Copilot-Suche)
3. **Google Unternehmensprofil** anlegen: Kategorie «Videograf», Einsatzgebiet Luzern & Zentralschweiz, Website-Link, Fotos, Videos
4. **Bewertungen** von Kunden auf Google sammeln
5. **Einträge** auf local.ch und search.ch mit gleichem Namen, Ort und gleicher Website
6. **Instagram-Bio** auf die Website verlinken; Videos zusätzlich auf YouTube/Vimeo mit «Videograf Luzern» in der Beschreibung
7. **Kunden** (z.B. Orofanie, Timeless Tunes) um einen Link auf itsmp4.ch bitten
