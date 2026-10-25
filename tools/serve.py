"""itsmp4 – lokaler Testserver

Ausführen im Projektordner:   python3 tools/serve.py
Dann http://localhost:8642 öffnen.

Wie «python3 -m http.server», kann aber Teile einer Datei ausliefern
(HTTP-Range). Safari braucht das, sonst laufen Videos nicht oder nur mit Ton.
GitHub Pages macht das online automatisch.
"""

import os
import re
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = 8642


class RangeHandler(SimpleHTTPRequestHandler):
    def send_head(self):
        match = re.fullmatch(r"bytes=(\d*)-(\d*)", self.headers.get("Range", ""))
        path = self.translate_path(self.path)
        if not match or not os.path.isfile(path):
            return super().send_head()

        size = os.path.getsize(path)
        start, end = match.groups()
        if start:
            start, end = int(start), int(end) if end else size - 1
        else:  # "bytes=-500" = die letzten 500 Bytes
            start, end = size - int(end), size - 1
        end = min(end, size - 1)
        if start > end:
            self.send_error(416)
            return None

        f = open(path, "rb")
        f.seek(start)
        self.send_response(206)
        self.send_header("Content-Type", self.guess_type(path))
        self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
        self.send_header("Content-Length", str(end - start + 1))
        self.end_headers()
        self.remaining = end - start + 1
        return f

    def copyfile(self, source, outputfile):
        remaining = getattr(self, "remaining", None)
        if remaining is None:
            return super().copyfile(source, outputfile)
        while remaining > 0:
            chunk = source.read(min(64 * 1024, remaining))
            if not chunk:
                break
            outputfile.write(chunk)
            remaining -= len(chunk)

    def end_headers(self):
        self.send_header("Accept-Ranges", "bytes")
        super().end_headers()


if __name__ == "__main__":
    handler = partial(RangeHandler, directory=ROOT)
    print(f"itsmp4 läuft auf http://localhost:{PORT}  (Beenden mit Ctrl+C)")
    ThreadingHTTPServer(("", PORT), handler).serve_forever()
