# itsmp4 — Website

Statische Website (HTML/CSS/JS). Ein kleines Build-Skript erzeugt Projektseiten,
Navigation, Footer und alle SEO-Daten.

## Lokal ansehen

```bash
cd itsmp4_website
python3 tools/serve.py
```
Dann http://localhost:8642 öffnen. (Nicht `python3 -m http.server` verwenden –
damit spielt Safari Videos nicht oder nur mit Ton ab.)

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
| `index.html` | Startseite – Hintergrundvideo, Logo, «Play the work» (kein Scrollen) |
| `referenzen.html` | WORK – Raster mit allen Filmen (Vorschau beim Überfahren), Filme öffnen sich im Pop-up |
| `ueber-mich.html` | ABOUT |
| `kontakt.html` | CONTACT – «Let’s connect.», E-Mail und Instagram |
| `impressum.html`, `datenschutz.html` | automatisch erzeugt – **Adresse in `LEGAL` (tools/build.mjs) ausfüllen** |
| `404.html` | Fehlerseite |
| `videograf-luzern.html`, `eventvideo-luzern.html` usw. | alte Leistungsseiten – leiten nur noch weiter (`REDIRECTS` in `tools/build.mjs`) |
| `projekte/<name>.html` | alte Projektseiten – leiten auf `referenzen.html#<name>` weiter und öffnen dort den Film |

Die Adressen `referenzen.html`, `ueber-mich.html` und `kontakt.html` bleiben bewusst gleich,
damit bestehende Google-Treffer und Links weiter funktionieren.

## Projekte austauschen

Alles steht in **`assets/js/projects.js`**. Jeder Block `{ ... }` ist ein Projekt.
Auf der Seite erscheinen nur Titel, Kategorie und Monat/Jahr (aus `date`).
`subtitle` und `text` werden nur für Google verwendet.

Neuer Film als MP4 (H.264) in `assets/video/`, Vorschaubild in `assets/img/`.
Dazu einen kurzen, stummen Vorschau-Loop für die Work-Liste erzeugen:
```bash
ffmpeg -i assets/video/name.mp4 -t 10 -an -vf scale=1280:-2 -c:v libx264 -crf 26 -preset slow -profile:v high -level:v 3.1 -pix_fmt yuv420p -movflags +faststart assets/video/preview/name.mp4
```
Den ganzen Film web-tauglich machen (Level 4.0 läuft auf allen Geräten, auch iPhone/Safari):
```bash
ffmpeg -i videos/original.mp4 -c:v libx264 -crf 21 -preset slow -profile:v high -level:v 4.0 -pix_fmt yuv420p -maxrate 12M -bufsize 24M -c:a aac -b:a 192k -movflags +faststart assets/video/name.mp4
```
(Hochformat: `scale=720:-2`.) Danach `node tools/build.mjs` ausführen.

Tipp: `.mov` vom Mac web-tauglich machen:
```bash
avconvert -s input.mov -o assets/video/name.mp4 -p Preset1920x1080
```

## Anpassen

- **Domain, E-Mail, Instagram, Ort**: oben in `tools/build.mjs` (`SITE`)
- **Seitentitel & Beschreibungen**: `PAGES` in `tools/build.mjs`
- **Texte**: direkt in den HTML-Dateien
- **Foto von dir**: `assets/img/portrait.jpg`
- **Farben/Schriften**: oben in `assets/css/style.css` (`:root`)

## Vor dem Hochladen
- Impressum: Adresse in `LEGAL` (tools/build.mjs) eintragen und neu bauen
- `livio.html` und `livio_files/` löschen (gespeicherte fremde Webseite)
- Ordner `videos/` und `tools/` müssen nicht online

## Nach dem Hochladen

1. **Google Search Console**: `https://itsmp4.ch/sitemap.xml` neu einreichen, damit die alten Leistungsseiten schneller durch die neuen Seiten ersetzt werden
2. **Bing Webmaster Tools**: ebenfalls Sitemap einreichen
3. **Instagram-Bio** auf die Website verlinken
