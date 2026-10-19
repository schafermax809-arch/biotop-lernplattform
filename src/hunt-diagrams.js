const wrap = (key, label, body) =>
  `<g class="hunt-visual-target" data-hunt-visual="${key}" tabindex="0" role="button" aria-label="${label}">${body}</g>`;
const box = (x, y, w, title, sub, color = "#293e2d") =>
  `<rect x="${x}" y="${y}" width="${w}" height="68" rx="9" fill="${color}" stroke="#8fa47b"/><text x="${x + w / 2}" y="${y + 26}" text-anchor="middle" fill="#edf1e8" font-size="14">${title}</text><text x="${x + w / 2}" y="${y + 49}" text-anchor="middle" fill="#c6d7b8" font-size="11">${sub}</text>`;
export function huntDiagram(board, records) {
  const done = (id) => records[`${board.id}_${id}`] === true;
  const arrow =
    '<defs><marker id="hunt-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 10 5 0 10Z" fill="#bfd5a4"/></marker></defs>';
  let body = "";
  if (board.id === "food") {
    body =
      wrap(
        "leaf",
        "Eiche und Produzent prüfen",
        box(15, 75, 170, "Eichenblatt", "Eiche: Produzent"),
      ) +
      box(240, 75, 170, "Frostspannerraupe", "Primärkonsument") +
      wrap(
        "bird",
        "Trophiestufe des Zilpzalps prüfen",
        box(
          465,
          75,
          170,
          "Zilpzalp",
          done("bird") ? "Sekundärkonsument" : "Primärkonsument",
        ),
      ) +
      wrap(
        "hawk",
        "Trophiestufe des Sperbers prüfen",
        box(
          690,
          75,
          170,
          "Sperber",
          done("hawk") ? "Tertiärkonsument" : "Sekundärkonsument",
        ),
      );
    body += wrap(
      "arrow",
      "Pfeil zwischen Blatt und Raupe prüfen",
      `<rect x="186" y="83" width="52" height="50" rx="6" fill="#354833"/><path d="${done("arrow") ? "M191 108H233" : "M233 108H191"}" stroke="#bfd5a4" stroke-width="4" marker-end="url(#hunt-arrow)"/>`,
    );
    body +=
      '<path d="M411 108H457" stroke="#bfd5a4" stroke-width="3" marker-end="url(#hunt-arrow)"/><path d="M636 108H683" stroke="#bfd5a4" stroke-width="3" marker-end="url(#hunt-arrow)"/>';
  } else if (board.id === "matter") {
    body =
      wrap(
        "sun",
        "Energiequelle prüfen",
        box(
          20,
          60,
          180,
          done("sun") ? "Lichtenergie" : "Wärme",
          "Energie für Fotosynthese",
        ),
      ) +
      wrap(
        "plant",
        "Stoffwechsel der Pflanzen prüfen",
        box(
          250,
          60,
          240,
          "Produzenten",
          done("plant") ? "Fotosynthese + Zellatmung" : "Nur Fotosynthese",
        ),
      ) +
      box(555, 60, 280, "Konsumenten", "Nahrung → tote organische Substanz");
    body +=
      '<path d="M201 94H241M491 94H546M695 130V172H370V138" fill="none" stroke="#bfd5a4" stroke-width="3" marker-end="url(#hunt-arrow)"/>';
    body += wrap(
      "mineral",
      "Richtung der Mineralisierung prüfen",
      `<rect x="390" y="151" width="260" height="43" rx="7" fill="#334932" stroke="#8fa47b"/><text x="520" y="178" text-anchor="middle" fill="#edf1e8" font-size="12">Mineralisierung: ${done("mineral") ? "organisch → anorganisch" : "anorganisch → organisch"}</text>`,
    );
  } else if (board.id === "river") {
    body =
      '<path d="M20 170Q200 120 410 165T860 170" fill="none" stroke="#76a99e" stroke-width="25"/><path d="M30 170H830" stroke="#bdd4a0" stroke-width="2" stroke-dasharray="7 9" marker-end="url(#hunt-arrow)"/>';
    body +=
      wrap(
        "source",
        "Sauerstoff an der Quelle prüfen",
        box(
          15,
          50,
          200,
          "Quelle",
          done("source") ? "O₂ zunächst gering" : "O₂ hoch",
        ),
      ) +
      wrap(
        "bed",
        "Gewässergrund im Oberlauf prüfen",
        box(
          235,
          50,
          200,
          "Oberlauf",
          done("bed") ? "Steine und Kies" : "Sand und Feinsediment",
        ),
      ) +
      box(455, 50, 180, "Mittellauf", "Mäander") +
      wrap(
        "light",
        "Licht im Unterlauf prüfen",
        box(
          655,
          50,
          210,
          "Trüber Unterlauf",
          done("light") ? "Wenig Licht am Grund" : "Viel Licht am Grund",
        ),
      );
  } else {
    body =
      wrap(
        "place",
        "Definition der Nische prüfen",
        box(
          15,
          30,
          400,
          "Ökologische Nische",
          done("place")
            ? "Ansprüche, Ressourcen und Beziehungen"
            : "Aufenthaltsort",
        ),
      ) +
      wrap(
        "same",
        "Konkurrenz innerhalb einer Art prüfen",
        box(
          465,
          30,
          400,
          "Konkurrenz innerhalb einer Art",
          done("same") ? "intraspezifisch" : "interspezifisch",
        ),
      );
    body += wrap(
      "competition",
      "Reale Nische prüfen",
      box(
        230,
        125,
        420,
        "Reale Nische",
        done("competition")
          ? "Unter biotischen Wechselwirkungen"
          : "Ohne einschränkende Konkurrenz",
      ),
    );
  }
  return `<div class="hunt-overview"><svg viewBox="0 0 880 220" role="img" aria-label="Interaktives, teilweise fehlerhaftes Schaubild: ${board.title}">${arrow}${body}</svg><p class="small subtle">Elemente im Schaubild und die nummerierten Beschriftungen darunter lassen sich anklicken.</p></div>`;
}
