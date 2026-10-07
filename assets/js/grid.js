/* ==========================================================================
   Raster für Hoch- und Querformat
   --------------------------------------------------------------------------
   Die Elemente werden der Reihe nach in Zeilen gepackt. Jede Zeile bekommt
   genau die Höhe, bei der ihre Bilder die volle Breite füllen – so stehen
   9:16 und 16:9 sauber nebeneinander, ohne Lücken und ohne Beschnitt.
   ========================================================================== */
(() => {
  const ratio = (format) => {
    const [w, h] = String(format || "16:9").split(":").map(Number);
    return w / h;
  };

  // Zielhöhe einer Zeile – je nach Bildschirmbreite
  const targetHeight = (w) => (w < 560 ? 260 : w < 1000 ? 340 : 440);

  function layout(container) {
    // vorhandene Zeilen auflösen, Reihenfolge bleibt erhalten
    const all = [...container.querySelectorAll(".j-item")];
    container.querySelectorAll(".j-row").forEach((r) => r.remove());
    const items = all.filter((el) => !el.classList.contains("is-hidden"));

    const W = container.clientWidth;
    const gap = parseFloat(getComputedStyle(container).getPropertyValue("--gap")) || 16;
    const H = targetHeight(W);
    // Höchstens so viele nebeneinander. Mit data-max / data-mobile-max am Raster änderbar.
    // Handy: standardmässig eins pro Zeile, damit Hochformat nie neben Querformat steht.
    const mobile = W < 560;
    const maxPerRow = mobile ? +container.dataset.mobileMax || 1 : +container.dataset.max || 4;
    // Wie hoch darf eine Zeile maximal werden?
    const maxH = mobile ? innerHeight * 0.72 : H * 1.5;

    // Elemente in Zeilen packen, bis die Zeile niedrig genug ist
    const rows = [];
    let row = [], sum = 0;
    items.forEach((item) => {
      item._ar = ratio(item.dataset.format);
      row.push(item);
      sum += item._ar;
      if ((W - gap * (row.length - 1)) / sum <= H || row.length >= maxPerRow) {
        rows.push({ row, sum });
        row = []; sum = 0;
      }
    });
    if (row.length) rows.push({ row, sum, last: true });

    // Bleibt hinten zu wenig übrig, die letzten zwei Zeilen gleichmässig aufteilen
    const rowH = (r) => (W - gap * (r.row.length - 1)) / r.sum;
    const n = rows.length;
    if (!mobile && n > 1 && rows[n - 1].last && rowH(rows[n - 1]) > H * 1.5) {
      const both = [...rows[n - 2].row, ...rows[n - 1].row];
      const total = both.reduce((t, el) => t + el._ar, 0);
      let best = 1, bestDiff = Infinity, acc = 0;
      for (let k = 1; k < both.length; k++) {
        acc += both[k - 1]._ar;
        const diff = Math.abs(acc - (total - acc));
        if (diff < bestDiff) { bestDiff = diff; best = k; }
      }
      const a = both.slice(0, best), b = both.slice(best);
      const sumOf = (list) => list.reduce((t, el) => t + el._ar, 0);
      rows[n - 2] = { row: a, sum: sumOf(a) };
      rows[n - 1] = { row: b, sum: sumOf(b) };
    }

    // Jede Zeile auf volle Breite skalieren
    rows.forEach(({ row, sum }) => {
      let h = (W - gap * (row.length - 1)) / sum;
      if (h > maxH) h = mobile ? maxH : H; // nie riesig werden lassen
      const el = document.createElement("div");
      el.className = "j-row";
      row.forEach((item) => {
        item.style.width = Math.floor(item._ar * h) + "px";
        item.querySelector(".j-media").style.height = Math.round(h) + "px";
        el.appendChild(item);
      });
      container.appendChild(el);
    });
    all.filter((el) => el.classList.contains("is-hidden")).forEach((el) => container.appendChild(el));
  }

  window.justify = (container) => {
    layout(container);
    let w = container.clientWidth;
    new ResizeObserver(() => {
      if (container.clientWidth !== w) {
        w = container.clientWidth;
        layout(container);
      }
    }).observe(container);
    return () => layout(container);
  };

  /* Videos laufen nur, solange sie sichtbar sind */
  window.initClips = (root) => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(({ target: v, isIntersecting }) => {
        if (isIntersecting) {
          if (!v.src) v.src = v.dataset.src;
          v.play().catch(() => {});
        } else v.pause();
      });
    }, { threshold: 0.25 });
    root.querySelectorAll(".clip video").forEach((v) => {
      io.observe(v);
      v.addEventListener("ended", () => { v.currentTime = +v.dataset.start; v.play(); });
      v.addEventListener("playing", () => (v.previousElementSibling.style.opacity = 0), { once: true });
    });
  };
})();
