export const labList = [
  {
    id: "ecosystem",
    topic: "ecosphere",
    title: "Ökosystem-Check",
    desc: "Prüfe Lebensraum, Lebensgemeinschaft und ihre Beziehungen.",
    icon: "layers",
  },
  {
    id: "factors",
    topic: "factors",
    title: "Biotisch oder abiotisch?",
    desc: "Ordne Umweltfaktoren zu und verknüpfe ihre Wirkungen.",
    icon: "sun",
  },
  {
    id: "river",
    topic: "river",
    title: "Fließgewässer-Explorer",
    desc: "Folge einem Fluss von der Quelle bis zur Mündung.",
    icon: "river",
  },
  {
    id: "foodweb",
    topic: "foodweb",
    title: "Nahrungsnetz-Builder",
    desc: "Verbinde Nahrung und Konsumenten zu einem Netz.",
    icon: "network",
  },
  {
    id: "spiral",
    topic: "spiral",
    title: "Stoffspiralen-Simulation",
    desc: "Verfolge Stoffumwandlung und Transport flussabwärts.",
    icon: "cycle",
  },
  {
    id: "rules",
    topic: "rules",
    title: "Bergmann-/Allen-Trainer",
    desc: "Vergleiche Körpergröße, Anhänge und Wärmeabgabe.",
    icon: "leaf",
  },
  {
    id: "relations",
    topic: "relations",
    title: "Beziehungs-Trainer",
    desc: "Wer profitiert? Wer wird geschädigt? Begründe deine Zuordnung.",
    icon: "link",
  },
];
export function riverArt(interactive = false, selected = 0) {
  return `<svg class="river-map" viewBox="0 0 640 300" role="img" aria-label="Schematischer Flussverlauf von den Bergen links bis zur Mündung rechts"><path d="M0 185 60 90 112 153 169 61 250 176 330 146 435 201 640 193V300H0Z" fill="#334839"/><path d="m60 90 32 39-27-9-24 13Z m109-29 38 53-34-18-30 17Z" fill="#879582"/><path d="M0 242Q100 161 219 209T433 227T640 235V300H0Z" fill="#435940"/><path d="M0 282Q167 231 286 264T640 259V300H0Z" fill="#526647"/><path d="M165 126c-16 34 40 35 45 55s-21 38 23 45 59-23 86-7-35 26-9 41 87-24 121-12 10 30 45 30 36-18 70-8 44 22 94 20" fill="none" stroke="#93b4ac" stroke-width="15" stroke-linecap="round"/><path d="M165 126c-16 34 40 35 45 55s-21 38 23 45 59-23 86-7-35 26-9 41 87-24 121-12 10 30 45 30 36-18 70-8 44 22 94 20" fill="none" stroke="#bbd2c7" stroke-width="2" stroke-dasharray="5 9"/>${[40, 85, 260, 365, 400, 580].map((x, i) => `<path d="M${x} ${195 + (i % 2) * 20}v26m-11-9 11-23 11 23m-8-12 8-18 8 18" stroke="#8b9e72" stroke-width="2" fill="none"/>`).join("")}${
    interactive
      ? [
          ["Oberlauf", 201, 168],
          ["Mittellauf", 300, 221],
          ["Unterlauf", 438, 249],
          ["Mündung", 566, 278],
        ]
          .map(
            ([s, x, y], i) =>
              `<g class="river-point ${i === selected ? "selected" : ""}" data-river="${i}" tabindex="0" role="button" aria-label="${s}" aria-pressed="${i === selected}"><circle cx="${x}" cy="${y}" r="10"/><text x="${x}" y="${y - 19}" text-anchor="middle">${s}</text></g>`,
          )
          .join("")
      : `<text x="340" y="84" fill="#a8bc98" font-size="10" letter-spacing="3">ALLES IST VERBUNDEN.</text><circle cx="560" cy="74" r="27" fill="#b9ce9b" opacity=".75"/>`
  }</svg>`;
}
const riverData = [
  {
    name: "Oberlauf",
    flow: "Schnell · großes Gefälle",
    bed: "Steine und Kies",
    temp: "Niedrig",
    oxygen: "Hoch, nach der Quelle",
    light: "Oft durch Uferpflanzen beschattet",
    life: "Zerkleinerer nutzen eingetragenes Laub und Totholz.",
    detail:
      "Turbulente Wasserbewegungen tragen Sauerstoff ein. Im kalten Wasser ist Sauerstoff gut löslich. Achtung: Direkt an der Quelle ist der Sauerstoffgehalt zunächst gering.",
  },
  {
    name: "Mittellauf",
    flow: "Langsamer · Mäander",
    bed: "Kies, Sand, Feinsediment",
    temp: "Steigt flussabwärts",
    oxygen: "Hoch, mit deutlichen Schwankungen",
    light: "Mehr Algen und Wasserpflanzen",
    life: "Weidegänger, Sedimentfresser und Filtrierer finden Nahrung.",
    detail:
      "Die Bedeutung eingetragener Biomasse nimmt ab, die Biomasseproduktion im Fluss zu. Algen und Wasserpflanzen erzeugen bei Licht Sauerstoff.",
  },
  {
    name: "Unterlauf",
    flow: "Langsam · geringes Gefälle",
    bed: "Sand und Feinsediment",
    temp: "Höher als im Oberlauf",
    oxygen: "Geringer",
    light: "Starke Trübung begrenzt Licht am Grund",
    life: "Filtrierer und Sedimentfresser überwiegen.",
    detail:
      "Feine Teilchen werden abgelagert. Wegen der Trübung fehlt am Gewässergrund weitgehend Algenaufwuchs; Weidegänger finden dort wenig Nahrung.",
  },
  {
    name: "Mündung",
    flow: "Sehr geringes Gefälle",
    bed: "Sand und Feinsediment",
    temp: "Im Material hohe Maximaltemperatur",
    oxygen: "Gering",
    light: "Hohe Trübung",
    life: "Detritus und Plankton sind wichtige Nahrungsgrundlagen.",
    detail:
      "Der Fluss mündet in ein Meer oder einen See. Die Mappe beschreibt warmes, trübes Wasser und eingeschränkte Sauerstoffbildung durch Fotosynthese. Die Werte sind ein vereinfachtes Flussmodell.",
  },
];
export function renderLab(id, host, { e, toast }) {
  let cleanup = () => {};
  const feedback = (html) => {
    host.querySelector(".lab-feedback").innerHTML = html;
  };
  if (id === "river") {
    let selected = 0;
    const draw = () => {
      const r = riverData[selected];
      host.innerHTML = `<div class="lab-stage">${riverArt(true, selected)}</div><div class="river-tabs">${riverData.map((x, i) => `<button data-section="${i}" class="${i === selected ? "selected" : ""}">${x.name}</button>`).join("")}</div><h2>${r.name}</h2><div class="properties">${[
        ["Strömung", r.flow],
        ["Gewässergrund", r.bed],
        ["Temperatur", r.temp],
        ["Sauerstoff", r.oxygen],
        ["Licht", r.light],
        ["Lebewesen", r.life],
      ]
        .map(([a, b]) => `<div><small>${a}</small><strong>${b}</strong></div>`)
        .join(
          "",
        )}</div><p>${r.detail}</p><div class="divider"></div><h3>Wende es an</h3><p>In welchem Abschnitt passt „viel Trübung, kaum Algenaufwuchs am Grund, überwiegend Filtrierer und Sedimentfresser“?</p><div class="choice-grid">${riverData.map((x, i) => `<button data-answer="${i}">${x.name}</button>`).join("")}</div><div class="lab-feedback" role="status"></div>`;
      host.querySelectorAll("[data-section],[data-river]").forEach((b) => {
        const f = () => {
          selected = Number(b.dataset.section ?? b.dataset.river);
          draw();
        };
        b.onclick = f;
        b.onkeydown = (ev) => {
          if (["Enter", " "].includes(ev.key)) {
            ev.preventDefault();
            f();
          }
        };
      });
      host
        .querySelectorAll("[data-answer]")
        .forEach(
          (b) =>
            (b.onclick = () =>
              feedback(
                Number(b.dataset.answer) >= 2
                  ? "Richtig: Unterlauf und Mündungsbereich weisen diese Merkmale auf. Trübung → weniger Licht am Grund → weniger Algenaufwuchs → kaum Weidegänger."
                  : "Das passt eher zu Unterlauf und Mündung. Im Mittellauf spielen Aufwuchsalgen und Weidegänger noch eine größere Rolle.",
              )),
        );
    };
    draw();
  } else if (id === "ecosystem") {
    const scenarios = [
      {
        title: "Ein Flussabschnitt",
        text: "Wasser, Steine und Licht treffen auf Algen, Bakterien, Schnecken und Fische. Organismen nutzen Nahrung, und absterbende Biomasse wird zersetzt.",
        yes: true,
        model:
          "Biotop: Wasser, Steine, Licht. Biozönose: Algen, Bakterien, Schnecken und Fische. Es bestehen Beziehungen zwischen Organismen und ihrer unbelebten Umwelt.",
      },
      {
        title: "Ein steriles Glas",
        text: "Ein verschlossenes Glas enthält ausschließlich sterile Steine und steriles Wasser. Lebewesen sind ausdrücklich ausgeschlossen.",
        yes: false,
        model:
          "Unbelebte Komponenten sind vorhanden. Ohne Lebewesen gibt es keine Biozönose und keine entsprechenden Wechselbeziehungen. Ein Glas allein ist kein Ökosystem.",
      },
      {
        title: "Eine beleuchtete Modell-Ecosphere",
        text: "Ein verschlossenes Gefäß enthält Wasser, Algen und Bakterien. Algen bilden bei Licht Biomasse, Bakterien setzen abgestorbene Biomasse um. Licht kommt von außen.",
        yes: true,
        model:
          "Das beschriebene Modell enthält Biotop, Biozönose und Wechselbeziehungen. Stofflicher Abschluss verhindert einen Energieeintrag durch Licht nicht. Ein Tier ist keine notwendige Bedingung für ein Ökosystem; langfristige Stabilität müsste gesondert überprüft werden.",
      },
    ];
    let i = 0;
    const draw = () => {
      const s = scenarios[i];
      host.innerHTML = `<div class="row between"><span class="badge">Beispiel ${i + 1} / ${scenarios.length}</span><button class="button secondary compact" id="next-example">Nächstes Beispiel</button></div><h2>${s.title}</h2><p>${s.text}</p><div class="choice-grid"><button data-eco="yes">Es ist ein Ökosystem</button><button data-eco="no">Es ist kein Ökosystem</button></div><h3>Belege deine Entscheidung</h3><textarea id="eco-reason" aria-label="Begründung" placeholder="Benenne Biotop, Biozönose und konkrete Wechselbeziehungen …"></textarea><div class="lab-feedback" role="status"></div><p class="small subtle">Die Begründung vergleichst du selbst mit den Kriterien. Das Gefäß ist ein allgemeines Modell; die konkrete Unterrichts-Ecosphere ist in der Mappe nicht beschrieben.</p>`;
      host.querySelector("#next-example").onclick = () => {
        i = (i + 1) % scenarios.length;
        draw();
      };
      host.querySelectorAll("[data-eco]").forEach(
        (b) =>
          (b.onclick = () => {
            if (!host.querySelector("textarea").value.trim()) {
              toast("Schreibe zuerst eine kurze Begründung.");
              return;
            }
            feedback(
              `<strong>${(b.dataset.eco === "yes") === s.yes ? "Richtig eingeordnet." : "Prüfe deine Einordnung noch einmal."}</strong><p>${s.model}</p>`,
            );
          }),
      );
    };
    draw();
  } else if (id === "factors") {
    const items = [
      [
        "Wassertemperatur",
        "abiotisch",
        "Ein physikalischer Zustand der unbelebten Umwelt.",
      ],
      [
        "Konkurrenz um Nahrung",
        "biotisch",
        "Lebewesen beeinflussen andere Lebewesen.",
      ],
      [
        "Sauerstoffgehalt im Wasser",
        "abiotisch",
        "Auch biologisch erzeugter Sauerstoff ist als chemischer Umweltfaktor abiotisch.",
      ],
      [
        "Fraß durch eine Libellenlarve",
        "biotisch",
        "Eine Nahrungsbeziehung zwischen Lebewesen.",
      ],
      ["Lichtstärke", "abiotisch", "Ein physikalischer Umweltfaktor."],
      [
        "Beschattung durch Uferpflanzen",
        "biotisch",
        "Die Wirkung der lebenden Pflanzen ist biotisch; die dadurch veränderte Lichtstärke ist abiotisch.",
      ],
    ];
    let i = 0;
    const draw = () => {
      host.innerHTML = `<span class="badge">Faktor ${i + 1} / ${items.length}</span><div class="lab-stage center"><h2>${items[i][0]}</h2></div><div class="choice-grid"><button data-factor="biotisch">Biotisch</button><button data-factor="abiotisch">Abiotisch</button></div><div class="lab-feedback" role="status"></div><button class="button secondary" id="next-factor">Weiter</button><div class="divider"></div><h3>Wechselbeziehungen nachvollziehen</h3><p>Was passiert im beschriebenen Oberlauf-Modell bei stärkerer Beschattung?</p><div class="choice-grid"><button data-impact="less">Weniger Licht → weniger Fotosynthese</button><button data-impact="more">Weniger Licht → mehr Fotosynthese</button></div><p id="impact-result" class="small" role="status"></p>`;
      host
        .querySelectorAll("[data-factor]")
        .forEach(
          (b) =>
            (b.onclick = () =>
              feedback(
                `<strong>${b.dataset.factor === items[i][1] ? "Richtig." : "Noch nicht richtig."}</strong> ${items[i][2]}`,
              )),
        );
      host.querySelector("#next-factor").onclick = () => {
        i = (i + 1) % items.length;
        draw();
      };
      host
        .querySelectorAll("[data-impact]")
        .forEach(
          (b) =>
            (b.onclick = () =>
              (host.querySelector("#impact-result").textContent =
                b.dataset.impact === "less"
                  ? "Richtig: Der biotische Einfluss der Pflanzen verändert den abiotischen Faktor Licht und damit die Fotosynthese."
                  : "Bei geringerem Lichtangebot ist die Fotosynthese im beschriebenen Modell eingeschränkt.")),
        );
    };
    draw();
  } else if (id === "foodweb") {
    const nodes = [
      ["Eichenblatt", 12, 60],
      ["Frostspannerraupe", 38, 60],
      ["Zilpzalp", 65, 155],
      ["Sperber", 88, 155],
      ["Beeren", 12, 155],
      ["Samen", 12, 250],
    ];
    const edges = [];
    const valid = ["0-1", "1-2", "2-3", "4-2", "5-2"];
    let selected = null;
    const add = (a, b) => {
      if (a === b) return;
      if (!edges.some((x) => x[0] === a && x[1] === b)) edges.push([a, b]);
      selected = null;
      draw();
    };
    const draw = () => {
      host.innerHTML = `<p>Ziehe von der <strong>Nahrung zum Fresser</strong>. Alternativ: zwei Organismen nacheinander anklicken. Ergänze die drei auf S. 13 genannten Nahrungsquellen des Zilpzalps.</p><div class="web-board"><svg viewBox="0 0 1000 310" preserveAspectRatio="none"><defs><marker id="web-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 10 5 0 10Z" fill="#bdd4a0"/></marker></defs>${edges
        .map(([a, b]) => {
          const x = nodes[a],
            y = nodes[b];
          const dx = y[1] - x[1],
            dy = (y[2] - x[2]) / 10,
            l = Math.hypot(dx, dy);
          return `<line x1="${x[1] * 10 + (dx / l) * 45}" y1="${x[2] + (dy / l) * 25}" x2="${y[1] * 10 - (dx / l) * 55}" y2="${y[2] - (dy / l) * 25}" stroke="#bdd4a0" stroke-width="2" marker-end="url(#web-arrow)"/>`;
        })
        .join(
          "",
        )}</svg>${nodes.map(([label, x, y], n) => `<button draggable="true" data-node="${n}" class="web-node ${selected === n ? "selected" : ""}" style="left:${x}%;top:${y}px" aria-pressed="${selected === n}">${label}</button>`).join("")}</div>${edges.map(([a, b], i) => `<div class="connection"><span>${nodes[a][0]} → ${nodes[b][0]}</span><button data-remove="${i}" aria-label="Verbindung entfernen">Entfernen</button></div>`).join("")}<div class="row" style="margin-top:18px"><button id="web-check" class="button">Netz überprüfen</button><button id="web-clear" class="button secondary">Neu aufbauen</button></div><div class="lab-feedback" role="status"></div>`;
      host.querySelectorAll("[data-node]").forEach((b) => {
        const n = Number(b.dataset.node);
        b.onclick = () => {
          if (selected === null) {
            selected = n;
            draw();
          } else add(selected, n);
        };
        b.ondragstart = (ev) =>
          ev.dataTransfer.setData("text/plain", String(n));
        b.ondragover = (ev) => ev.preventDefault();
        b.ondrop = (ev) => {
          ev.preventDefault();
          const a = Number(ev.dataTransfer.getData("text/plain"));
          if (Number.isInteger(a) && a >= 0 && a < nodes.length) add(a, n);
        };
      });
      host.querySelectorAll("[data-remove]").forEach(
        (b) =>
          (b.onclick = () => {
            edges.splice(Number(b.dataset.remove), 1);
            draw();
          }),
      );
      host.querySelector("#web-clear").onclick = () => {
        edges.length = 0;
        selected = null;
        draw();
      };
      host.querySelector("#web-check").onclick = () => {
        const bad = edges.filter((x) => !valid.includes(x.join("-")));
        const good = edges.filter((x) => valid.includes(x.join("-"))).length;
        feedback(
          bad.length
            ? `${bad.length} Verbindung(en) passen nicht zum Material. Die Pfeile zeigen vom gefressenen Organismus bzw. seiner Nahrung zum Konsumenten. S. 13: Eichenblatt → Raupe → Zilpzalp → Sperber; zusätzlich Beeren und Samen → Zilpzalp.`
            : good === 5
              ? "Vollständig und richtig. Das Netz verbindet die lineare Nahrungskette mit den zusätzlichen Nahrungsquellen des Zilpzalps."
              : `${good} von 5 Verbindungen stimmen. Ergänze die Kette Eichenblatt → Raupe → Zilpzalp → Sperber sowie Beeren und Samen → Zilpzalp.`,
        );
      };
    };
    draw();
  } else if (id === "spiral") {
    const stations = [
      [
        "Produzenten",
        "Algen und Wasserpflanzen bauen aus anorganischen Stoffen bei der Fotosynthese organische Stoffe auf. Sauerstoff wird abgegeben.",
      ],
      [
        "Konsumenten",
        "Tiere nehmen organische Stoffe mit der Nahrung auf. Durch Zellatmung werden unter Sauerstoffverbrauch Kohlenstoffdioxid und Wasser frei; tote organische Substanz fällt an.",
      ],
      [
        "Tote organische Substanz",
        "Abgestorbene Organismen, Pflanzenteile und Ausscheidungen liefern Material für den Abbau. Ufervegetation trägt zusätzlich Laub und Totholz ein.",
      ],
      [
        "Destruenten",
        "Bakterien und andere Zersetzer bauen organisches Material ab. Mineralstoffe sowie Kohlenstoffdioxid und Wasser werden wieder verfügbar.",
      ],
    ];
    let step = 0,
      drift = 0;
    const draw = () => {
      host.innerHTML = `<p>Ein Schritt zeigt eine Stoffumwandlung. Gleichzeitig werden Stoffe mit der Strömung weitergetragen. Das ergibt eine <strong>flussabwärts gerichtete Stoffspirale</strong>.</p><div class="lab-stage"><svg viewBox="0 0 800 190" role="img" aria-label="Schematische Stoffspirale mit flussabwärts versetzten Kreisläufen"><defs><marker id="spiral-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 10 5 0 10Z" fill="#bdd4a0"/></marker></defs><path d="M20 160H770" stroke="#6e9489" stroke-width="3" marker-end="url(#spiral-arrow)"/><text x="600" y="185" fill="#9fb5a5" font-size="12">Fließrichtung</text>${[0, 1, 2].map((_, i) => `<path d="M${30 + i * 240} 100c40-110 170-110 150 0s-145 75-95 0 130-90 200 0" fill="none" stroke="#667f52" stroke-width="3"/>`).join("")}<circle cx="${60 + drift * 80 + step * 30}" cy="${[68, 34, 105, 133][step]}" r="10" fill="#bdd4a0"/><text x="25" y="23" fill="#bac9b2" font-size="12">Qualitatives Modell · keine realen Messwerte</text></svg></div><div class="spiral-stations">${stations.map(([x], i) => `<button class="${i === step ? "selected" : ""}" data-station="${i}">${i + 1}. ${x}</button>`).join("")}</div><h3>${stations[step][0]}</h3><p>${stations[step][1]}</p><div class="row"><button id="spiral-next" class="button">Nächste Station →</button><button id="spiral-reset" class="button secondary">Von vorn</button></div><div class="callout">Stoffe werden umgesetzt und erneut aufgenommen. Energie wird als Wärme abgegeben und muss von außen neu zugeführt werden. Es gibt keinen Energiekreislauf.</div>`;
      host.querySelectorAll("[data-station]").forEach(
        (b) =>
          (b.onclick = () => {
            step = Number(b.dataset.station);
            draw();
          }),
      );
      host.querySelector("#spiral-next").onclick = () => {
        step = (step + 1) % 4;
        if (step === 0) drift = (drift + 1) % 7;
        draw();
      };
      host.querySelector("#spiral-reset").onclick = () => {
        step = 0;
        drift = 0;
        draw();
      };
    };
    draw();
  } else if (id === "rules") {
    const rabbit = (ear) =>
      `<svg viewBox="0 0 220 170" role="img" aria-label="Schematischer Hase mit ${ear === "short" ? "kurzen" : "langen"} Ohren"><ellipse cx="100" cy="115" rx="55" ry="35" fill="#8c9d7e"/><circle cx="158" cy="88" r="24" fill="#b9c7a9"/><ellipse cx="148" cy="${ear === "short" ? 62 : 40}" rx="8" ry="${ear === "short" ? 20 : 44}" fill="#b9c7a9"/><ellipse cx="170" cy="${ear === "short" ? 62 : 40}" rx="8" ry="${ear === "short" ? 20 : 44}" fill="#b9c7a9"/><circle cx="166" cy="85" r="3" fill="#18241c"/><ellipse cx="76" cy="143" rx="25" ry="7" fill="#b9c7a9"/></svg>`;
    host.innerHTML = `<div class="lab-balance"><div class="lab-stage center">${rabbit("short")}<strong>Polarhase</strong><p class="small subtle">Kleine Ohren</p></div><div class="lab-stage center">${rabbit("long")}<strong>Kalifornischer Eselhase</strong><p class="small subtle">Große Ohren</p></div></div><h3>Welche Regel erklärt diesen Vergleich?</h3><div class="choice-grid"><button data-rule="bergmann">Bergmann-Regel</button><button data-rule="allen">Allen-Regel</button></div><div class="lab-feedback" role="status"></div><div class="divider"></div><h3>Körpergröße als geometrisches Modell</h3><label class="field">Lineare Größe im Modell <input id="size-slider" type="range" min="1" max="4" value="1" step=".5"></label><div id="size-result" class="callout"></div><p class="small subtle">Ähnliche Körperform vorausgesetzt: Oberfläche ∝ Länge², Volumen ∝ Länge³. Das Modell erklärt das Verhältnis, es berechnet keine reale Wärmeabgabe eines Tieres.</p><details><summary>Grenzen der Regeln begründen</summary><p>Die Regeln beschreiben Tendenzen vor allem bei verwandten gleichwarmen Tieren. Sie sind keine ausnahmslosen Naturgesetze. In der Mappe: Elefanten leben trotz großer Körper in warmen Regionen; Nahrung und Konkurrenz um Sexualpartner können ebenfalls die Körpergröße beeinflussen.</p></details>`;
    host
      .querySelectorAll("[data-rule]")
      .forEach(
        (b) =>
          (b.onclick = () =>
            feedback(
              b.dataset.rule === "allen"
                ? "Richtig: Die Allen-Regel betrifft die Körperanhänge. Über große Ohren kann mehr Wärme abgegeben werden; kleine Ohren verringern die wärmeabgebende Fläche."
                : "Die Bergmann-Regel betrifft vor allem die Körpergröße. Hier werden Körperanhänge verglichen: Das ist die Allen-Regel.",
            )),
      );
    const show = () => {
      const x = Number(host.querySelector("#size-slider").value);
      host.querySelector("#size-result").innerHTML =
        `Größe ×${x} → Oberfläche ×${x * x} · Volumen ×${x * x * x}<br>Relatives Oberfläche-Volumen-Verhältnis: ${(1 / x).toLocaleString("de", { maximumFractionDigits: 2 })} des Ausgangswerts.`;
    };
    host.querySelector("#size-slider").oninput = show;
    show();
  } else if (id === "relations") {
    const examples = [
      {
        text: "Ein Organismus lebt auf Kosten eines Wirts und schädigt ihn, ohne ihn typischerweise sofort zu töten.",
        sign: "+ / −",
        answers: ["Parasitismus"],
        reason: "Der Parasit profitiert; der Wirt wird geschädigt.",
      },
      {
        text: "Zwei Arten nutzen dieselbe begrenzte Nahrungsquelle. Beide haben dadurch weniger Ressourcen zur Verfügung.",
        sign: "− / −",
        answers: ["Konkurrenz"],
        reason:
          "Beide werden gegenüber einer Situation ohne den Konkurrenten beeinträchtigt.",
      },
      {
        text: "Eine Art nutzt Nahrungsreste einer anderen. Für die andere Art ist kein messbarer Vor- oder Nachteil beschrieben.",
        sign: "+ / 0",
        answers: ["Kommensalismus"],
        reason:
          "Ein Partner profitiert, der andere bleibt im beschriebenen Zusammenhang unbeeinflusst.",
      },
      {
        text: "Zwei Arten tauschen Leistungen aus, und beide profitieren. Weitere Angaben über die Enge oder Verpflichtung der Beziehung fehlen.",
        sign: "+ / +",
        answers: ["Mutualismus", "Symbiose"],
        reason:
          "Beiderseitiger Nutzen ist gesichert. „Symbiose“ wird unterschiedlich verwendet und kann sich mit „Mutualismus“ überschneiden. Ohne weitere Angaben ist eine scharfe Trennung nicht zuverlässig möglich.",
      },
      {
        text: "Für zwei Arten sind im betrachteten Modell keine gegenseitigen Auswirkungen erkennbar.",
        sign: "0 / 0",
        answers: ["Neutralismus"],
        reason:
          "Neutralismus ist ein idealisierender Fall ohne nachweisbare gegenseitige Wirkung; das hängt vom untersuchten Zusammenhang ab.",
      },
    ];
    let n = 0;
    const draw = () => {
      const x = examples[n];
      host.innerHTML = `<span class="badge">Fall ${n + 1} / ${examples.length}</span><div class="lab-stage"><h3>${x.text}</h3></div><label class="field">Deine Begründung<textarea id="relation-reason" placeholder="Wer hat welchen Vorteil oder Nachteil? Welche Angaben sind entscheidend?"></textarea></label><div class="choice-grid" style="margin-top:18px">${["Neutralismus", "Parasitismus", "Mutualismus", "Kommensalismus", "Symbiose", "Konkurrenz"].map((a) => `<button data-relation="${a}">${a}</button>`).join("")}</div><div class="lab-feedback" role="status"></div><button id="next-relation" class="button secondary">Nächster Fall</button>`;
      host.querySelectorAll("[data-relation]").forEach(
        (b) =>
          (b.onclick = () => {
            if (!host.querySelector("textarea").value.trim()) {
              toast("Begründe zuerst deine Einordnung.");
              return;
            }
            feedback(
              `<strong>${x.answers.includes(b.dataset.relation) ? "Passend eingeordnet." : "Die gesicherte Zuordnung lautet " + x.answers.join(" / ") + "."}</strong><p>Wirkung: ${x.sign}. ${x.reason}</p>`,
            );
          }),
      );
      host.querySelector("#next-relation").onclick = () => {
        n = (n + 1) % examples.length;
        draw();
      };
    };
    draw();
  }
  return cleanup;
}
