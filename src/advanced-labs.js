import { riverScene } from "./nature-ui.js";
import {
  sandboxEffects,
  webNodes,
  webEdges,
  dominoEffects,
  nicheRange,
} from "./tools-engine.js";
import { huntBoards } from "./hunt-data.js";
import { huntDiagram } from "./hunt-diagrams.js";
export const advancedLabList = [
  {
    id: "sandbox",
    topic: "factors",
    sourceTopics: ["factors", "river", "spiral"],
    title: "Ökosystem-Sandbox",
    desc: "Verändere Umweltfaktoren und untersuche mögliche Wirkungsketten.",
    icon: "sun",
  },
  {
    id: "domino",
    topic: "foodweb",
    sourceTopics: ["foodweb"],
    title: "Nahrungsnetz-Domino",
    desc: "Eine Nahrungsquelle verändert sich. Welche Beziehungen sind betroffen?",
    icon: "network",
  },
  {
    id: "niche",
    topic: "terms",
    sourceTopics: ["terms"],
    title: "Nischen-Arena",
    desc: "Entferne einen Konkurrenten und vergleiche Versuchs- und Kontrollfläche.",
    icon: "layers",
  },
  {
    id: "hunt",
    topic: "foodweb",
    sourceTopics: ["foodweb", "spiral", "river", "terms"],
    title: "Fehlerjagd in Schaubildern",
    desc: "Finde falsche Pfeile und Beschriftungen und repariere die Darstellung.",
    icon: "search",
  },
];
const directions = {
  up: "Nimmt eher zu",
  down: "Nimmt eher ab",
  same: "Keine Änderung im Modell",
  mixed: "Gegenläufige Einflüsse · nicht eindeutig",
};
const colors = {
  up: "#bdd4a0",
  down: "#e7a59a",
  same: "#a1afa5",
  mixed: "#dbc393",
};
function remember(state, save, lab, key, right) {
  state.labProgress[lab] ??= { records: {} };
  state.labProgress[lab].records[key] = right;
  save();
}
export function renderAdvancedLab(id, host, { state, save, toast, e }) {
  if (id === "sandbox") {
    host.innerHTML = `<div class="lab-toolbar"><div class="view-switch" role="group" aria-label="Ansicht des Flussmodells"><button type="button" data-river-view="explore" aria-pressed="false">Erkunden</button><button type="button" data-river-view="compare" class="selected" aria-pressed="true">Vergleichen</button></div><details class="model-note"><summary>Qualitatives Modell ⓘ</summary><p>Wir vergleichen Bedingungen mit dem Ausgangszustand. Die Illustrationen zeigen schematische Veränderungen, keine Messwerte oder sicheren Bestandsprognosen. Die Wassertemperatur wird in der Auswertung berücksichtigt.</p></details></div>
    <div class="sandbox-layout nature-sandbox"><section class="scene-workspace"><div class="river-comparison" data-mode="compare"><figure class="river-figure" id="sandbox-baseline-panel"><figcaption><strong>Ausgangszustand</strong><span>Alle Faktoren auf mittlerer Stufe</span></figcaption><div id="sandbox-baseline"></div></figure><figure class="river-figure"><figcaption><strong>Deine Veränderung</strong><span id="scene-description">Verändere eine Bedingung und vergleiche.</span></figcaption><div id="sandbox-scene"></div></figure></div><div id="sandbox-effects" class="effect-grid" aria-live="polite"></div></section><section class="sandbox-controls"><div class="control-heading"><span class="eyebrow">DEIN EXPERIMENT</span><h3>Umweltbedingungen</h3><p class="small subtle">Verändere die Bedingungen und beobachte den Vergleich.</p></div>${[
      ["light", "Lichtangebot"],
      ["turbidity", "Trübung"],
      ["vegetation", "Uferbewuchs"],
    ]
      .map(
        ([key, label]) =>
          `<label class="field"><span class="slider-heading">${label}<output id="${key}-label">Mittel</output></span><input type="range" min="1" max="3" value="2" step="1" data-sandbox="${key}" aria-label="${label}"><span class="slider-ends"><span>Wenig</span><span>Viel</span></span></label>`,
      )
      .join(
        "",
      )}<label class="field"><span class="slider-heading">Wassertemperatur<output id="temp-label">15 °C</output></span><input type="range" min="5" max="25" value="15" step="5" data-sandbox="temp" aria-label="Wassertemperatur"><span class="slider-ends"><span>5 °C</span><span>25 °C</span></span></label><button class="button secondary compact" id="sandbox-reset">Zurücksetzen</button></section></div>
    <section class="prediction-panel"><div class="prediction-heading"><span class="eyebrow">ZUSAMMENHÄNGE BEGRÜNDEN</span><h3>Was erwartest du?</h3><p class="small subtle">Wähle die Wirkung, die du aus deinen Änderungen herleitest.</p></div><div class="filters"><label class="field">Betrachte<select id="sandbox-target"><option value="light">Licht am Gewässergrund</option><option value="solubility">Sauerstofflöslichkeit durch Temperatur</option><option value="leaves">Möglicher Blatt- und Totholzeintrag</option></select></label><label class="field">Deine Erwartung<select id="sandbox-prediction"><option value="">Bitte auswählen</option>${Object.entries(
      directions,
    )
      .map(([v, label]) => `<option value="${v}">${label}</option>`)
      .join(
        "",
      )}</select></label></div><button id="sandbox-check" class="button">Vorhersage prüfen →</button><div class="lab-feedback" role="status"></div></section>`;
    host.querySelector("#sandbox-baseline").innerHTML = riverScene(
      {},
      "baseline",
    );
    host.querySelectorAll("[data-river-view]").forEach(
      (button) =>
        (button.onclick = () => {
          const compare = button.dataset.riverView === "compare";
          host.querySelector(".river-comparison").dataset.mode = compare
            ? "compare"
            : "explore";
          host.querySelector("#sandbox-baseline-panel").hidden = !compare;
          host.querySelectorAll("[data-river-view]").forEach((b) => {
            const selected = b === button;
            b.classList.toggle("selected", selected);
            b.setAttribute("aria-pressed", String(selected));
          });
        }),
    );
    let config, effects;
    const values = {
      light: [20, 50, 80],
      turbidity: [10, 30, 60],
      vegetation: [20, 50, 80],
    };
    const update = () => {
      const raw = Object.fromEntries(
        [...host.querySelectorAll("[data-sandbox]")].map((x) => [
          x.dataset.sandbox,
          Number(x.value),
        ]),
      );
      config = {
        light: values.light[raw.light - 1],
        turbidity: values.turbidity[raw.turbidity - 1],
        vegetation: values.vegetation[raw.vegetation - 1],
        temp: raw.temp,
      };
      effects = sandboxEffects(config);
      for (const key of ["light", "turbidity", "vegetation"])
        host.querySelector(`#${key}-label`).textContent = [
          "Wenig",
          "Mittel",
          "Viel",
        ][raw[key] - 1];
      host.querySelector("#temp-label").textContent = raw.temp + " °C";
      host.querySelector("#sandbox-scene").innerHTML = riverScene(
        raw,
        "changed",
      );
      const changes = [
        raw.light !== 2
          ? `${raw.light > 2 ? "Mehr" : "Weniger"} Lichtangebot`
          : "",
        raw.turbidity !== 2
          ? `${raw.turbidity > 2 ? "Mehr" : "Weniger"} Trübung`
          : "",
        raw.vegetation !== 2
          ? `${raw.vegetation > 2 ? "Mehr" : "Weniger"} Uferbewuchs`
          : "",
        raw.temp !== 15 ? `${raw.temp} °C Wassertemperatur` : "",
      ].filter(Boolean);
      host.querySelector("#scene-description").textContent =
        changes.join(" · ") || "Identisch mit dem Ausgangszustand";
      const statements = [
        [
          "Licht am Grund",
          effects.light,
          "Mehr einfallendes Licht fördert das Angebot; Trübung und Beschattung begrenzen es.",
        ],
        [
          "Lichtbedingte Fotosynthese",
          effects.photosynthesis,
          "Mögliches Potenzial bei sonst gleichen Bedingungen, kein berechneter Gesamtumsatz.",
        ],
        [
          "Sauerstofflöslichkeit",
          effects.solubility,
          "Bei höherer Temperatur kann sich weniger Sauerstoff lösen. Der tatsächliche O₂-Gehalt hängt auch von Austausch und Stoffwechsel ab.",
        ],
        [
          "Laub- und Totholzeintrag",
          effects.leaves,
          "Mehr Ufervegetation kann die organische Nahrungsgrundlage der Zerkleinerer vergrößern.",
        ],
      ];
      host.querySelector("#sandbox-effects").innerHTML = statements
        .map(
          ([title, dir, reason]) =>
            `<div class="effect-card"><span class="small subtle">${title}</span><strong style="color:${colors[dir]}">${directions[dir]}</strong><p>${reason}</p></div>`,
        )
        .join("");
      host.querySelector(".lab-feedback").textContent = "";
    };
    host
      .querySelectorAll("[data-sandbox]")
      .forEach((x) => (x.oninput = update));
    host.querySelector("#sandbox-target").onchange = () =>
      (host.querySelector(".lab-feedback").textContent = "");
    host.querySelector("#sandbox-reset").onclick = () => {
      host
        .querySelectorAll("[data-sandbox]")
        .forEach((x) => (x.value = x.dataset.sandbox === "temp" ? 15 : 2));
      update();
    };
    host.querySelector("#sandbox-check").onclick = () => {
      const target = host.querySelector("#sandbox-target").value,
        answer = host.querySelector("#sandbox-prediction").value;
      if (!answer) {
        toast("Wähle deine Erwartung aus.");
        return;
      }
      const right = answer === effects[target];
      remember(
        state,
        save,
        id,
        `${Object.values(config).join("_")}_${target}`,
        right,
      );
      host.querySelector(".lab-feedback").innerHTML =
        `<strong>${right ? "Passend hergeleitet." : "Prüfe die Wirkungskette noch einmal."}</strong><p>${directions[effects[target]]}. ${target === "light" ? "Bei gleichzeitig fördernden und begrenzenden Änderungen lässt sich ohne ihre Stärke keine eindeutige Gesamtwirkung ableiten." : target === "solubility" ? "Verglichen wird nur der Temperatureinfluss auf die Löslichkeit. Daraus folgt kein genauer Sauerstoffwert des Gewässers." : "Der Blatt- und Totholzeintrag hängt auch von Jahreszeit, Vegetationstyp und Gewässerkontakt ab."}</p>`;
    };
    update();
    if (window.matchMedia("(max-width: 680px)").matches)
      host.querySelector('[data-river-view="explore"]').click();
  } else if (id === "domino") {
    let selected = 1,
      event = "down";
    const positions = [
      [105, 45],
      [325, 45],
      [545, 140],
      [765, 140],
      [105, 140],
      [105, 235],
    ];
    const draw = () => {
      const effects = dominoEffects(selected, event),
        primary = effects.find((x) => x.kind === "food") || effects[0],
        expected =
          (primary.direction === "down" ? "Weniger" : "Mehr") +
          (primary.kind === "food"
            ? " Nahrung verfügbar"
            : " Fraßdruck möglich");
      host.innerHTML = `<p>Wähle ein Element und verändere sein Angebot. Die Pfeile zeigen <strong>Nahrung → Fresser</strong>. Aus dem Netz lassen sich Wirkungsmöglichkeiten ableiten, keine sicheren Populationsgrößen.</p><div class="filters"><label class="field">Verändertes Element<select id="domino-node">${webNodes.map((n, i) => `<option value="${i}" ${i === selected ? "selected" : ""}>${n}</option>`).join("")}</select></label><label class="field">Änderung<select id="domino-event"><option value="down" ${event === "down" ? "selected" : ""}>Starker Rückgang / Ausfall</option><option value="up" ${event === "up" ? "selected" : ""}>Starke Zunahme</option></select></label></div><div class="lab-stage"><svg viewBox="0 0 870 280" role="img" aria-label="Nahrungsnetz mit ausgewähltem veränderten Element"><defs><marker id="domino-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 10 5 0 10Z" fill="#bdd4a0"/></marker></defs>${webEdges
        .map(([a, b]) => {
          const x = positions[a],
            y = positions[b],
            adjacent = a === selected || b === selected;
          return `<line x1="${x[0] + 65}" y1="${x[1]}" x2="${y[0] - 65}" y2="${y[1]}" stroke="${adjacent ? "#dbc393" : "#6e8e76"}" stroke-width="${adjacent ? 4 : 2}" marker-end="url(#domino-arrow)"/>`;
        })
        .join(
          "",
        )}${webNodes.map((label, i) => `<g opacity="${i === selected && event === "down" ? 0.45 : 1}"><rect x="${positions[i][0] - 80}" y="${positions[i][1] - 22}" width="160" height="44" rx="8" fill="${i === selected ? "#536946" : "#263e2e"}" stroke="${i === selected ? "#dbc393" : "#8ba379"}"/><text x="${positions[i][0]}" y="${positions[i][1] + 4}" text-anchor="middle" fill="#ecf0e9" font-size="12">${label}</text></g>`).join("")}</svg></div><div class="callout">${webNodes[selected]}: ${event === "down" ? "weniger verfügbar" : "mehr verfügbar"}. Goldene Linien markieren unmittelbar beteiligte Nahrungsbeziehungen.</div><h3>Direkte Wirkung auf ${webNodes[primary.target]}</h3><label class="field">Was lässt sich aus dieser Verbindung ableiten?<select id="domino-prediction"><option value="">Bitte auswählen</option>${["Weniger Nahrung verfügbar", "Mehr Nahrung verfügbar", "Weniger Fraßdruck möglich", "Mehr Fraßdruck möglich"].map((x) => `<option>${x}</option>`).join("")}</select></label><label class="field" style="margin-top:16px">Begründe und denke einen Schritt weiter<textarea id="domino-reason" placeholder="Welche direkte Beziehung ist betroffen? Welche indirekte Folge wäre möglich, und was bleibt unsicher?"></textarea></label><button class="button" id="domino-check" style="margin-top:15px">Wirkungskette überprüfen</button><div class="lab-feedback" role="status"></div>`;
      host.querySelector("#domino-node").onchange = (ev) => {
        selected = Number(ev.target.value);
        draw();
      };
      host.querySelector("#domino-event").onchange = (ev) => {
        event = ev.target.value;
        draw();
      };
      host.querySelector("#domino-check").onclick = () => {
        const answer = host.querySelector("#domino-prediction").value;
        if (!answer || !host.querySelector("#domino-reason").value.trim()) {
          toast("Wähle eine Wirkung und schreibe deine Begründung.");
          return;
        }
        const right = answer === expected;
        remember(state, save, id, `${selected}_${event}`, right);
        host.querySelector(".lab-feedback").innerHTML =
          `<strong>${right ? "Die direkte Wirkung passt." : "Diese direkte Wirkung wäre zu erwarten: " + expected + "."}</strong><ul>${effects.map((x) => `<li>${webNodes[x.target]}: ${x.direction === "down" ? "weniger" : "mehr"} ${x.kind === "food" ? "Nahrung verfügbar" : "Fraßdruck möglich"}.</li>`).join("")}</ul><p>Indirekte Folgen können sich entlang weiterer Verbindungen fortsetzen. Beim Zilpzalp zeigen Beeren und Samen alternative Nahrungswege. Ob ein Bestand tatsächlich wächst oder sinkt, hängt von Ausweichmöglichkeiten und weiteren Faktoren ab. Vergleiche deine Begründung mit diesen Kriterien.</p>`;
      };
    };
    draw();
  } else if (id === "niche") {
    let competition = true,
      outline = true;
    const shore = (control = false) => {
      const c = control ? true : competition,
        range = nicheRange(c);
      return `<svg viewBox="0 0 400 270" role="img" aria-label="${control ? "Kontrollfläche mit Konkurrenz" : c ? "Versuchsfläche mit Konkurrenz" : "Versuchsfläche ohne Semibalanus"}"><rect width="400" height="270" rx="10" fill="#26362e"/><path d="M0 230Q90 220 140 166T280 60L340 20V270H0Z" fill="#65715a"/><path d="M0 210Q80 195 150 210V270H0Z" fill="#76a99f" opacity=".7"/>${outline ? '<rect x="160" y="43" width="160" height="185" rx="8" stroke="#d6c899" stroke-dasharray="7 5" stroke-width="2" fill="none"/>' : ""}<rect x="175" y="${c ? 50 : 50}" width="65" height="${c ? 75 : 172}" rx="6" fill="#d6aa8c" opacity=".85"/>${c ? '<rect x="247" y="132" width="60" height="90" rx="6" fill="#a0bd8c" opacity=".9"/>' : ""}<text x="25" y="35" fill="#dce4d6" font-size="12">Länger trocken</text><text x="20" y="250" fill="#dce4d6" font-size="12">Länger unter Wasser</text><text x="183" y="${c ? 91 : 140}" fill="#19241d" font-size="12">C.</text>${c ? '<text x="265" y="183" fill="#19241d" font-size="12">S.</text>' : ""}</svg>`;
    };
    const draw = () => {
      host.innerHTML = `<p>Das Seeepocken-Beispiel aus der Mappe: <strong>Chthamalus</strong> kann grundsätzlich auch tiefere Bereiche nutzen. <strong>Semibalanus</strong> schränkt dies durch Konkurrenz ein und wird selbst nach oben durch Austrocknung begrenzt.</p><div class="row between"><button id="niche-toggle" class="button ${competition ? "" : "secondary"}" role="switch" aria-checked="${competition}">${competition ? "Semibalanus aus Versuchsfläche entfernen" : "Semibalanus wieder einsetzen"}</button><label class="read-check"><input id="niche-outline" type="checkbox" ${outline ? "checked" : ""}> Fundamentale Nische von Chthamalus einblenden</label></div><div class="niche-comparison"><section><h3>Versuchsfläche</h3>${shore()}<p class="small subtle">${competition ? "Konkurrenz vorhanden" : "Konkurrent entfernt · Besiedlung nach Beobachtungszeit"}</p></section><section><h3>Kontrollfläche</h3>${shore(true)}<p class="small subtle">Unverändert mit Konkurrenz</p></section></div><div class="row"><span class="legend-dot" style="--dot:#d6aa8c">Chthamalus (C.)</span><span class="legend-dot" style="--dot:#a0bd8c">Semibalanus (S.)</span><span class="legend-dot" style="--dot:#d6c899">Gestrichelt: grundsätzlich nutzbarer Bereich</span></div><div class="callout">${nicheRange(competition).reason} Die Abbildung vereinfacht die Zonen und zeigt keine gemessenen Höhen oder echte Wachstumsgeschwindigkeit.</div><h3>Versuch auswerten</h3><p>Welchen Bereich nutzt Chthamalus in der aktuellen Versuchsfläche im Modell?</p><div class="choice-grid"><button data-niche-answer="upper">Vor allem den oberen Bereich</button><button data-niche-answer="all">Auch grundsätzlich geeignete tiefere Bereiche</button><button data-niche-answer="lower">Ausschließlich den untersten Bereich</button></div><div class="lab-feedback" role="status"></div><details><summary>Welche Schlussfolgerung ist erlaubt?</summary><p>Die Ausbreitung nach Entfernung des Konkurrenten belegt eine Konkurrenzbegrenzung. Die grundlegenden Ansprüche der Art haben sich dadurch nicht plötzlich geändert. Die Kontrollfläche hilft, zeitliche Veränderungen ohne den Eingriff zu erkennen.</p></details>`;
      host.querySelector("#niche-toggle").onclick = () => {
        competition = !competition;
        draw();
      };
      host.querySelector("#niche-outline").onchange = (ev) => {
        outline = ev.target.checked;
        draw();
      };
      host.querySelectorAll("[data-niche-answer]").forEach(
        (b) =>
          (b.onclick = () => {
            const right =
              b.dataset.nicheAnswer === (competition ? "upper" : "all");
            remember(
              state,
              save,
              id,
              competition ? "competition" : "removed",
              right,
            );
            host.querySelector(".lab-feedback").innerHTML =
              `<strong>${right ? "Richtig ausgewertet." : "Vergleiche Versuchs- und Kontrollfläche noch einmal."}</strong><p>${nicheRange(competition).reason} ${competition ? "Unter Konkurrenz sehen wir die eingeschränkte realisierte Nische." : "Die Erweiterung macht im Modell einen zuvor durch Konkurrenz nicht genutzten Teil der fundamentalen Nische sichtbar."}</p>`;
          }),
      );
    };
    draw();
  } else if (id === "hunt") {
    let boardIndex = 0,
      selected = null;
    const record = (state.labProgress.hunt ??= { records: {} });
    const draw = () => {
      const b = huntBoards[boardIndex],
        fixed = b.items.filter(
          (x) => !x.correct && record.records[`${b.id}_${x.id}`],
        ).length,
        total = b.items.filter((x) => !x.correct).length;
      host.innerHTML = `<div class="filters"><label class="field">Schaubild auswählen<select id="hunt-board">${huntBoards.map((x, i) => `<option value="${i}" ${i === boardIndex ? "selected" : ""}>${x.title}</option>`).join("")}</select></label></div><div class="row between"><h2>${b.title}</h2><span class="badge">${fixed} / ${total} Fehler repariert</span></div><p>${b.intro}</p><p class="small subtle">Klicke auf ein Element. Korrekte Elemente dürfen unverändert bleiben. Bei einem Fehler wählst du eine fachlich passende Korrektur.</p>${huntDiagram(b, record.records)}<div class="hunt-diagram">${b.items
        .map((x, i) => {
          const repaired = !x.correct && record.records[`${b.id}_${x.id}`];
          return `<button data-hunt-item="${x.id}" class="hunt-element ${repaired ? "repaired" : ""} ${selected === x.id ? "selected" : ""}"><span class="hunt-index">${i + 1}</span><strong>${e(repaired ? x.fix : x.label)}</strong>${repaired ? "<small>Korrigiert ✓</small>" : ""}</button>`;
        })
        .join(
          "",
        )}</div><div id="hunt-repair" class="repair-panel"></div><div class="lab-feedback" role="status"></div>${fixed === total ? '<div class="callout">Schaubild repariert. Du hast alle drei fachlichen Fehler korrigiert. Wähle das nächste Schaubild oder wiederhole dieses.</div>' : ""}<button class="button secondary compact" id="hunt-reset">Dieses Schaubild erneut lösen</button>`;
      host.querySelector("#hunt-board").onchange = (ev) => {
        boardIndex = Number(ev.target.value);
        selected = null;
        draw();
      };
      host
        .querySelectorAll("[data-hunt-item],[data-hunt-visual]")
        .forEach((button) => {
          button.onkeydown = (ev) => {
            if (["Enter", " "].includes(ev.key)) {
              ev.preventDefault();
              button.onclick();
            }
          };
          button.onclick = () => {
            selected = button.dataset.huntItem ?? button.dataset.huntVisual;
            draw();
            const x = b.items.find((x) => x.id === selected),
              done = record.records[`${b.id}_${x.id}`];
            if (x.correct || done) {
              host.querySelector(".lab-feedback").textContent =
                (done
                  ? "Bereits richtig korrigiert. "
                  : "Dieses Element stimmt. ") + x.reason;
              return;
            }
            host.querySelector("#hunt-repair").innerHTML =
              `<h3>Wie korrigierst du Element ${b.items.indexOf(x) + 1}?</h3><div class="choice-grid">${x.options.map((o, i) => `<button data-hunt-fix="${i}">${e(o)}</button>`).join("")}</div>`;
            host.querySelectorAll("[data-hunt-fix]").forEach(
              (option) =>
                (option.onclick = () => {
                  const right =
                    x.options[Number(option.dataset.huntFix)] === x.fix;
                  if (right) {
                    record.records[`${b.id}_${x.id}`] = true;
                    save();
                    selected = null;
                    draw();
                    host.querySelector(".lab-feedback").textContent =
                      "Richtig korrigiert. " + x.reason;
                  } else
                    host.querySelector(".lab-feedback").textContent =
                      "Diese Korrektur passt noch nicht. " + x.reason;
                }),
            );
          };
        });
      host.querySelector("#hunt-reset").onclick = () => {
        for (const x of b.items) delete record.records[`${b.id}_${x.id}`];
        selected = null;
        save();
        draw();
      };
    };
    draw();
  }
  return () => {};
}
