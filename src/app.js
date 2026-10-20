import {
  freshState,
  STORAGE_KEY,
  shuffle,
  validate,
  recordAnswer,
  topicStats,
  scheduleCard,
  balancedExam,
  importState,
} from "./engine.js";
import { labList as baseLabList, renderLab } from "./labs.js";
import { advancedLabList, renderAdvancedLab } from "./advanced-labs.js";
import {
  rubricHTML,
  bindRubric,
  renderPlan,
  renderNotebook,
  notebookPanel,
  bindNotebook,
  markedText,
  renderOperators,
  planSummary,
} from "./learning-tools.js";
import { countCriteria } from "./tools-engine.js";
import {
  dailyQuestions,
  reviewStatus,
  restorePractice,
} from "./study-engine.js";
import { levelIllustration } from "./nature-ui.js";
const labList = [...baseLabList, ...advancedLabList];
let operatorData;
function toolContext() {
  return { topics, state, save, e, head, shell, toast, confirmDialog };
}
const e = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const paths = {
  dashboard: "M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z",
  book: "M12 6C8 3 4 4 2 5v15c4-2 7-1 10 1m0-15c4-3 8-2 10-1v15c-4-2-7-1-10 1zm0 0v15",
  target: "M22 12a10 10 0 1 1-10-10m0 5a5 5 0 1 0 5 5m-5 0 9-9m-5 0h5v5",
  cards: "m6 2 15 4-4 16-15-4zm2 5 9 2m-10 3 7 2",
  clock: "M12 8v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
  search: "M21 21l-6-6m2-6a7 7 0 1 1-14 0 7 7 0 0 1 14 0",
  settings:
    "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8m-2-6h4l1 4 4 1 3 3v4l-4 1-1 4-3 3h-4l-1-4-4-1-3-3v-4l4-1 1-4Z",
  leaf: "M4 20C2 9 9 3 21 3c0 12-6 19-17 17Zm0 0L17 7",
  layers: "m12 2 10 6-10 6L2 8zm-10 11 10 6 10-6M2 18l10 6 10-6",
  sun: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8m0-6v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2",
  river: "M3 3c12 0-4 6 8 8s-8 7 10 10M10 3c12 3-4 6 8 8",
  network:
    "M5 5l14 2-7 12zm2 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0m14 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0m-7 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0",
  cycle: "M20 7a9 9 0 0 0-16 5m0-6v6h6m-6 5a9 9 0 0 0 16-5m0 6v-6h-6",
  link: "m9 15 6-6m-7 4-2 2a4 4 0 0 0 6 6l3-3m-4-12 3-3a4 4 0 0 1 6 6l-2 2",
  arrow: "M4 12h16m-6-6 6 6-6 6",
  check: "m5 12 4 4L20 5",
  bookmark: "M6 3h12v19l-6-5-6 5z",
  focus: "M3 8V3h5m8 0h5v5m0 8v5h-5M8 21H3v-5",
  menu: "M3 6h18M3 12h18M3 18h18",
  chart: "M4 20V10m8 10V4m8 16v-7",
  download: "M12 3v12m-5-5 5 5 5-5M3 16v5h18v-5",
  play: "m8 4 13 8-13 8z",
  back: "m14 6-6 6 6 6",
};
const icon = (n) =>
  `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[n] || paths.leaf}"/></svg>`;
const nav = [
  ["dashboard", "dashboard", "Übersicht"],
  ["learn", "book", "Lernbereiche"],
  ["labs", "network", "Interaktiv lernen"],
  ["practice", "target", "Übungen"],
  ["exam", "clock", "Klausursimulation"],
  ["cards", "cards", "Karteikarten"],
  ["plan", "clock", "Lernplan"],
  ["operators", "target", "Operatoren-Trainer"],
  ["notes", "book", "Meine Notizen"],
  ["glossary", "search", "Glossar"],
  ["stats", "chart", "Lernstatistik"],
  ["settings", "settings", "Einstellungen"],
];
const topicIcons = [
  "layers",
  "leaf",
  "sun",
  "cycle",
  "river",
  "network",
  "cycle",
  "leaf",
  "book",
  "link",
];
const typeNames = {
  single: "Einzelauswahl",
  multi: "Mehrfachauswahl",
  tf: "Richtig / Falsch",
  cloze: "Lückentext",
  order: "Reihenfolge",
  match: "Zuordnung",
  open: "Offene Aufgabe",
  diagram: "Diagrammanalyse",
};
let topics = [],
  questions = [],
  qMap,
  tMap,
  state = freshState(),
  storageOK = true,
  focus = false,
  run = null,
  labCleanup = () => {},
  cards = [],
  cardIndex = 0,
  cardFlipped = false,
  cardFilter = "",
  cardMode = "due",
  timerHandle = null,
  toastHandle = null;
const app = document.querySelector("#app");
function toast(s) {
  const x = document.querySelector("#toast");
  x.textContent = s;
  x.classList.add("visible");
  clearTimeout(toastHandle);
  toastHandle = setTimeout(() => x.classList.remove("visible"), 3200);
}
function save() {
  state.activePractice = run && !run.finished ? run : null;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    storageOK = false;
    toast("Speichern nicht möglich. Exportiere deinen Fortschritt als JSON.");
  }
}
function sound(correct) {
  if (!state.settings.sound) return;
  try {
    const ac = new (window.AudioContext || window.webkitAudioContext)(),
      o = ac.createOscillator(),
      g = ac.createGain();
    o.connect(g);
    g.connect(ac.destination);
    o.frequency.value = correct ? 660 : 230;
    g.gain.setValueAtTime(0.045, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.16);
    o.start();
    o.stop(ac.currentTime + 0.17);
    o.onended = () => ac.close();
  } catch {}
}
function navigate(route) {
  location.hash = route;
}
function head(eyebrow, title, desc, extra = "") {
  return `<div class="page-head"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1>${desc ? `<p class="subtle" style="margin:8px 0 0">${desc}</p>` : ""}</div>${extra}</div>`;
}
function setMenu(open) {
  const sidebar = document.querySelector("#sidebar");
  sidebar?.classList.toggle("open", open);
  document.querySelector("#menu")?.setAttribute("aria-expanded", String(open));
  document.querySelector("#menu-backdrop").hidden = !open;
  document.querySelector("main").inert = open;
  document.body.classList.toggle("menu-open", open);
  (open
    ? document.querySelector("#menu-close")
    : document.querySelector("#menu")
  )?.focus();
}
function shell(body, active) {
  document.body.classList.remove("menu-open");
  const navLink = ([id, ic, label]) =>
    `<a class="nav-btn ${active === id ? "active" : ""}" href="#${id}" ${active === id ? 'aria-current="page"' : ""}>${icon(ic)}${label}</a>`;
  app.innerHTML = `<a class="skip-link" href="#main-content">Zum Inhalt springen</a><div class="layout ${focus ? "focus" : ""}"><aside class="sidebar" id="sidebar" aria-label="Seitennavigation"><button class="icon-btn mobile-close" id="menu-close" aria-label="Navigation schließen">×</button><a href="#dashboard" class="brand"><img src="assets/mark.svg" alt=""><div>biotop<small>DEIN LERNRAUM</small></div></a><nav aria-label="Hauptnavigation">${nav.slice(0, 6).map(navLink).join("")}<details class="nav-tools" ${nav.slice(6).some((x) => x[0] === active) ? "open" : ""}><summary>Werkzeuge & Fortschritt</summary>${nav.slice(6).map(navLink).join("")}</details></nav><div class="sidebar-foot"><span class="status-dot"></span>Ökologie · Oberstufe<br><span class="small">Dein Fortschritt bleibt bei dir.</span></div></aside><button id="menu-backdrop" class="menu-backdrop" aria-label="Navigation schließen" tabindex="-1" hidden></button><main class="main" id="main-content" tabindex="-1"><header class="topbar"><button class="icon-btn mobile-menu" id="menu" aria-label="Navigation öffnen" aria-expanded="false" aria-controls="sidebar">${icon("menu")}</button><div class="breadcrumb">Biologie <span>/ ${e(nav.find((x) => x[0] === active)?.[2] || "Lernraum")}</span></div><div class="top-actions"><button class="search-trigger" id="search-global" aria-label="Lerninhalte durchsuchen">${icon("search")}<span class="search-label">Lerninhalte suchen</span><span class="key">/</span></button><button class="icon-btn" id="focus" aria-label="${focus ? "Fokusmodus beenden" : "Fokusmodus aktivieren"}" title="Fokusmodus · F" aria-pressed="${focus}">${icon("focus")}</button></div></header><div class="content" id="content">${!storageOK ? '<div class="callout">Lokales Speichern ist derzeit nicht möglich. Sichere deinen Fortschritt regelmäßig über Einstellungen → Export.</div>' : ""}${body}<div class="river-footer" aria-hidden="true"></div><div class="footer-note">Biotop · Ökologie verstehen und anwenden. <a href="#settings">Quellen & Datensicherung</a></div></div></main></div>`;
  document.querySelector("#menu").onclick = () => setMenu(true);
  document.querySelector("#menu-close").onclick = document.querySelector(
    "#menu-backdrop",
  ).onclick = () => setMenu(false);
  document.querySelectorAll("#sidebar a").forEach((a) =>
    a.addEventListener("click", () => {
      if (document.querySelector("#sidebar").classList.contains("open"))
        setMenu(false);
    }),
  );
  document.querySelector("#focus").onclick = () => {
    focus = !focus;
    document.querySelector(".layout").classList.toggle("focus", focus);
    document.querySelector("#focus").setAttribute("aria-pressed", focus);
    document
      .querySelector("#focus")
      .setAttribute(
        "aria-label",
        focus ? "Fokusmodus beenden" : "Fokusmodus aktivieren",
      );
  };
  document.querySelector("#search-global").onclick = () => navigate("glossary");
  document.querySelector(".skip-link").onclick = (ev) => {
    ev.preventDefault();
    document.querySelector("#main-content").focus();
  };
}
function learningPath(topicId, active, labId) {
  const selectedLab =
    labId || labList.find((l) => l.topic === topicId)?.id || "ecosystem";
  const steps = [
    ["Verstehen", `learn/${topicId}`],
    ["Ausprobieren", `labs/${selectedLab}`],
    ["Üben", `train/${topicId}`],
    ["Wiederholen", `cards/${topicId}`],
  ];
  return `<nav class="learning-path" aria-label="Lernschritte im Kapitel">${steps.map(([label, route], i) => `<a href="#${route}" class="${i === active ? "active" : ""}" ${i === active ? 'aria-current="step"' : ""}><span>${i + 1}</span><strong>${label}</strong></a>`).join("")}</nav>`;
}
function sourceLinks(topic) {
  return `<ul class="source-list">${topic.sources.map((s) => `<li><span class="badge ${s.kind === "external" ? "external" : "neutral"}">${s.kind === "external" ? "Ergänzung" : "Deine Mappe"}</span><br>${s.kind === "mappe" ? `<span>${e(s.label)}</span><div>${(s.pages || []).map((p) => `<span style="display:inline-block;margin-right:9px">Mappe · PDF S. ${p}</span>`).join("")}</div>` : `<a href="${e(s.url)}" target="_blank" rel="noopener">${e(s.label)} ↗</a>`}</li>`).join("")}</ul>`;
}
function topicCard(t, i) {
  const st = topicStats(state, t);
  return `<a href="#learn/${t.id}" class="topic-card"><div class="topic-top"><span class="topic-symbol">${icon(topicIcons[i])}</span><span class="topic-number">${String(i + 1).padStart(2, "0")} / 10</span></div><h3>${e(t.title)}</h3><p>${e(t.subtitle)}</p><div class="progress-row"><div class="progress" role="progressbar" aria-valuenow="${st.percent}" aria-valuemin="0" aria-valuemax="100" aria-label="${e(t.title)}"><i style="width:${st.percent}%"></i></div><span>${st.percent} %</span></div></a>`;
}
function totals() {
  const values = Object.values(state.answers);
  const attempts = values.reduce((a, x) => a + x.attempts, 0),
    correct = values.reduce((a, x) => a + x.correct, 0),
    mastered = values.filter((x) => x.lastCorrect).length;
  return {
    attempts,
    correct,
    wrong: attempts - correct,
    mastered,
    percent: Math.round((mastered / questions.length) * 100),
  };
}
function recommendation() {
  const ranked = topics.map((t) => ({ t, st: topicStats(state, t) }));
  const mistakes = ranked.filter((x) =>
    x.t.questions.some(
      (q) => state.answers[q.id] && !state.answers[q.id].lastCorrect,
    ),
  );
  if (mistakes.length)
    return mistakes.sort((a, b) => a.st.percent - b.st.percent)[0].t;
  return ranked.sort((a, b) => a.st.percent - b.st.percent)[0].t;
}
function dashboard() {
  const n = totals(),
    rec = recommendation(),
    last = tMap.get(state.lastTopic);
  const cardIds = topics.flatMap((t) => t.terms.map((_, i) => `${t.id}-${i}`));
  const due = cardIds.filter(
    (id) => state.cards[id] && state.cards[id].due <= Date.now(),
  ).length;
  const fresh = cardIds.filter((id) => !state.cards[id]).length;
  const statuses = questions.map((q) => reviewStatus(state.answers[q.id]));
  const errors = statuses.filter((x) => x === "error").length;
  const delayed = statuses.filter((x) => x === "due").length;
  const secure = statuses.filter((x) => x === "secure").length;
  const lab = labList.find((l) => l.topic === rec.id);
  shell(
    `${head("DEIN ÖKOLOGIE-CAMPUS", "Dein nächster Lernschritt.", "Kurz wiederholen, Zusammenhänge verstehen und gezielt üben.")}
    <section class="hero study-today"><div class="hero-copy"><span class="badge">${run && !run.finished ? "Dein Training ist gesichert" : "Dein Tagestraining"}</span><h2>${run && !run.finished ? "Mach dort weiter, wo du warst." : "Acht Aufgaben. Gezielt ausgewählt."}</h2><p>${run && !run.finished ? `Aufgabe ${run.index + 1} von ${run.qids.length} · ${e(run.label)}` : n.attempts ? "Frühere Fehler, länger nicht geübter Stoff und neue Aufgaben – mit einer Frage zum Erklären oder Auswerten." : "Finde heraus, was du schon weißt. Du kannst zuerst auch das empfohlene Kapitel öffnen; die Lösungen werden im Training erklärt."}</p>${run && !run.finished ? '<a class="button" href="#practice/run">Training fortsetzen →</a>' : '<button class="button" id="daily-start">Tagestraining starten →</button>'}<span class="small subtle session-note">Ohne Zeitdruck · automatisch gespeichert</span></div></section>
    <div class="daily-actions"><a href="#cards" class="aside-panel"><h3>${due ? `${due} ${due === 1 ? "Karte ist" : "Karten sind"} fällig` : "Begriffe wiederholen"}</h3><p>${due ? "Bekannte Karten erneut aus dem Gedächtnis erklären." : "Heute sind keine bereits geübten Karten fällig."}${fresh ? ` ${fresh} neue Karten stehen bereit.` : ""}</p><span class="small">Karteikarten öffnen →</span></a><a href="#learn/${rec.id}" class="aside-panel"><h3>${e(rec.title)}</h3><p>${last?.id === rec.id ? "Dein zuletzt geöffnetes Kapitel. Lies gezielt die Stellen nach, bei denen du unsicher bist." : "Empfohlen anhand deiner bisherigen Aufgaben."}</p><span class="small">Kapitel verstehen →</span></a>${lab ? `<a href="#labs/${lab.id}" class="aside-panel"><h3>${e(lab.title)}</h3><p>Wende den Zusammenhang im passenden interaktiven Modul an.</p><span class="small">Zusammenhänge ausprobieren →</span></a>` : ""}</div>
    ${planSummary(state)}
    ${state.activeExam && !state.activeExam.submitted ? '<div class="callout"><a href="#exam/run">Laufende Klausur fortsetzen →</a> · Die Bearbeitungszeit läuft weiter.</div>' : ""}
    <details class="progress-overview"><summary>Dein Lernstand · ${n.mastered} / ${questions.length} Aufgaben zuletzt richtig</summary><div class="stats"><div class="stat"><div class="stat-label">Noch nicht bearbeitet</div><div class="stat-value">${statuses.filter((x) => x === "new").length}</div></div><div class="stat"><div class="stat-label">Zuletzt nicht ganz richtig</div><div class="stat-value">${errors}</div></div><div class="stat"><div class="stat-label">Wiederholung nach 7 Tagen</div><div class="stat-value">${delayed}</div></div><div class="stat"><div class="stat-label">Mit Abstand richtig</div><div class="stat-value">${secure}</div></div></div><p class="small subtle">${statuses.filter((x) => x === "once").length} Aufgaben sind zuletzt richtig, aber noch ohne bestätigten zeitlichen Abstand. „Mit Abstand richtig“: mindestens zweimal vollständig richtig, mit mindestens 24 Stunden Abstand zwischen den gewerteten Erfolgen, zuletzt vor weniger als 7 Tagen. Offene Aufgaben beruhen auf deiner Selbstbewertung. Das ist eine Lernhilfe, keine Notenprognose.</p><a class="small" href="#stats">Lernstatistik öffnen →</a></details>
    <div class="section-title"><h2>Deine Lernbereiche</h2><span class="small subtle">10 Themen · ${questions.length} Aufgaben</span></div><div class="topics">${topics.map(topicCard).join("")}</div>`,
    "dashboard",
  );
  document
    .querySelector("#daily-start")
    ?.addEventListener("click", () =>
      startPractice(dailyQuestions(questions, state), "Dein Tagestraining"),
    );
}
function learn(id) {
  if (!id) {
    shell(
      `${head("VERSTEHEN", "Deine Lernbereiche", "Zehn Kapitel, ein zusammenhängendes Bild.")}<div class="filters"><label class="field">Themen suchen<input id="topic-search" type="search" placeholder="z. B. Konkurrenz, Fließgewässer …"></label></div><div class="topics" id="topic-list">${topics.map(topicCard).join("")}</div>`,
      "learn",
    );
    document.querySelector("#topic-search").oninput = (ev) => {
      const s = ev.target.value.toLocaleLowerCase("de");
      document.querySelector("#topic-list").innerHTML = topics
        .map((t, i) => ({ t, i }))
        .filter(({ t }) =>
          JSON.stringify([t.title, t.subtitle, t.terms])
            .toLocaleLowerCase("de")
            .includes(s),
        )
        .map(({ t, i }) => topicCard(t, i))
        .join("");
    };
    return;
  }
  const t = tMap.get(id);
  if (!t) {
    navigate("learn");
    return;
  }
  state.lastTopic = id;
  save();
  const lab = labList.find((x) => x.topic === id);
  shell(
    `${head("KAPITEL " + String(topics.indexOf(t) + 1).padStart(2, "0"), e(t.title), e(t.subtitle), `<button class="button" id="train-topic">Thema trainieren ${icon("arrow")}</button>`)}${learningPath(id, 0)}<div class="reading-grid ${id === "levels" ? "levels-reading" : ""}"><article class="reading-text">${id === "levels" ? `<section class="panel"><h2>Vom Lebewesen zur Biosphäre</h2><p class="small subtle">Öffne eine Ebene für ihre Definition. Jede größere Ebene erweitert den Blick.</p><ol class="levels-map">${t.terms.map((x, i) => `<li><details><summary>${levelIllustration(i)}<span>${e(x.term)}</span></summary><p>${e(x.definition)}</p></details></li>`).join("")}</ol></section>` : ""}${t.sections
      .map(
        (s) =>
          `<section class="panel"><h2>${e(s.heading)}</h2><p data-note-section="${t.sections.indexOf(s)}">${markedText(
            s.text,
            (state.notebook[id]?.highlights || []).filter(
              (h) => h.section === t.sections.indexOf(s),
            ),
            e,
          )}</p></section>`,
      )
      .join(
        "",
      )}<div class="callout"><div class="eyebrow" style="color:var(--accent);margin-bottom:7px">Merke dir</div>${e(t.mnemonic)}</div>${id !== "levels" ? `<div class="panel"><h2>Die Begriffe dazu</h2>${t.terms.map((x) => `<div class="definition"><strong>${e(x.term)}</strong><p>${e(x.definition)}</p></div>`).join("")}</div>` : ""}<div class="panel"><h2>Typische Klausurfragen</h2>${t.questions
      .filter((q) => ["open", "diagram"].includes(q.type))
      .slice(0, 3)
      .map((q) => `<p>${e(q.prompt)}</p>`)
      .join(
        "",
      )}<button class="button secondary" id="check-topic">Verständnis prüfen</button></div><label class="read-check"><input type="checkbox" id="read-topic" ${state.read.includes(id) ? "checked" : ""}> Kapitel gelesen</label></article><aside class="sticky">${notebookPanel(t, state, e)}<div class="aside-panel"><h3>Dein Kapitelstand</h3><div class="stat-value">${topicStats(state, t).percent}<small> %</small></div><p>${topicStats(state, t).mastered} / ${t.questions.length} Aufgaben zuletzt richtig</p>${lab ? `<a href="#labs/${lab.id}" class="button secondary">${icon(lab.icon)} Modul entdecken</a>` : ""}<a href="#cards/${id}" class="button secondary">Karteikarten üben</a></div><div class="aside-panel"><h3>Quellen & Einordnung</h3>${sourceLinks(t)}<p>Externe Ergänzungen schließen die Lücken der Mappe. Transferaufgaben sind als Übungsszenarien formuliert.</p></div></aside></div>`,
    "learn",
  );
  bindNotebook(t, { state, save, toast, e });
  document.querySelector("#train-topic").onclick = () =>
    startPractice(t.questions, "Training · " + t.title);
  document.querySelector("#check-topic").onclick = () =>
    startPractice(
      shuffle(t.questions.filter((q) => q.difficulty !== "schwer")).slice(0, 5),
      "Verständnischeck",
    );
  document.querySelector("#read-topic").onchange = (ev) => {
    state.read = state.read.filter((x) => x !== id);
    if (ev.target.checked) state.read.push(id);
    save();
  };
}
function labs(id) {
  if (!id) {
    shell(
      `${head("ENTDECKEN & ANWENDEN", "Mach die Zusammenhänge sichtbar.", `${labList.length} Module zum Ausprobieren, Verbinden und Begründen.`)}<div class="module-grid">${labList.map((l) => `<a href="#labs/${l.id}" class="module-card">${icon(l.icon)}<h3>${l.title}</h3><p>${l.desc}</p><span class="small">Modul öffnen →</span></a>`).join("")}</div>`,
      "labs",
    );
    return;
  }
  const l = labList.find((x) => x.id === id);
  if (!l) {
    navigate("labs");
    return;
  }
  const sourceTopics = l.sourceTopics || [l.topic];
  const t = {
    sources: sourceTopics
      .flatMap((id) => tMap.get(id).sources)
      .filter((s, i, a) => a.findIndex((x) => x.label === s.label) === i),
  };
  shell(
    `${head("INTERAKTIV LERNEN", id === "sandbox" ? "Dein Fluss. Deine Hypothese." : l.title, l.desc, `<a class="button secondary" href="#learn/${l.topic}">Zum Kapitel ${icon("arrow")}</a>`)}<div class="panel ${id === "sandbox" ? "nature-lab" : ""}" id="lab"></div><details><summary>Quellen dieses Moduls</summary>${sourceLinks(t)}</details>`,
    "labs",
  );
  labCleanup = advancedLabList.some((x) => x.id === id)
    ? renderAdvancedLab(id, document.querySelector("#lab"), {
        e,
        toast,
        state,
        save,
      })
    : renderLab(id, document.querySelector("#lab"), { e, toast });
}
function practice() {
  shell(
    `${run && !run.finished ? `<div class="callout"><strong>${e(run.label)}</strong> · Aufgabe ${run.index + 1} / ${run.qids.length}<br><a href="#practice/run">Gesichertes Training fortsetzen →</a></div>` : ""}${head("ÜBEN OHNE ZEITDRUCK", "Aus Wissen wird Können.", "Wähle dein Thema, dein Niveau und die passende Aufgabenform.")}<section class="panel"><div class="filters"><label class="field">Thema<select id="practice-topic"><option value="">Alle Themen</option>${topics.map((t) => `<option value="${t.id}">${e(t.title)}</option>`).join("")}</select></label><label class="field">Schwierigkeit<select id="practice-level"><option value="">Alle Stufen</option><option value="leicht">Leicht · Grundlagen</option><option value="mittel">Mittel · Zusammenhänge</option><option value="schwer">Schwer · Transfer</option></select></label><label class="field">Aufgabenform<select id="practice-type"><option value="">Alle Formen</option>${Object.entries(
      typeNames,
    )
      .map(([a, b]) => `<option value="${a}">${b}</option>`)
      .join(
        "",
      )}</select></label><label class="field">Umfang<select id="practice-count"><option>15</option><option>30</option><option value="all">Alle passenden</option></select></label></div><div class="row between"><span class="subtle small" id="pool-count"></span><button class="button" id="practice-start">Training starten ${icon("arrow")}</button></div></section><div class="module-grid"><div class="aside-panel"><h3>Schnelltest</h3><p>10 zufällige Aufgaben aus dem gesamten Stoff.</p><button class="button secondary" id="quick-test">Schnelltest starten</button></div><div class="aside-panel"><h3>Fehlertraining</h3><p>Wiederhole Aufgaben, die du zuletzt nicht vollständig gelöst hast.</p><button class="button secondary" id="error-start">Fehler üben</button></div><div class="aside-panel"><h3>Deine Lesezeichen</h3><p>${state.bookmarks.length} Aufgaben für später gespeichert.</p><button class="button secondary" id="bookmark-start">Lesezeichen üben</button></div></div>`,
    "practice",
  );
  const getPool = () =>
    questions.filter(
      (q) =>
        (!document.querySelector("#practice-topic").value ||
          q.topic === document.querySelector("#practice-topic").value) &&
        (!document.querySelector("#practice-level").value ||
          q.difficulty === document.querySelector("#practice-level").value) &&
        (!document.querySelector("#practice-type").value ||
          q.type === document.querySelector("#practice-type").value),
    );
  const update = () => {
    document.querySelector("#pool-count").textContent =
      `${getPool().length} passende Aufgaben verfügbar`;
    document.querySelector("#practice-start").disabled = !getPool().length;
  };
  document
    .querySelectorAll(".filters select")
    .forEach((x) => (x.onchange = update));
  update();
  document.querySelector("#practice-start").onclick = () => {
    const n = document.querySelector("#practice-count").value;
    startPractice(
      shuffle(getPool()).slice(0, n === "all" ? questions.length : Number(n)),
      "Dein Training",
    );
  };
  document.querySelector("#quick-test").onclick = quickTest;
  document.querySelector("#error-start").onclick = () => startSpecial("errors");
  document.querySelector("#bookmark-start").onclick = () =>
    startSpecial("bookmarks");
}
function quickTest() {
  startPractice(shuffle(questions).slice(0, 10), "Schnelltest · 10 Fragen");
}
function startSpecial(mode) {
  const pool = questions.filter((q) =>
    mode === "errors"
      ? state.answers[q.id] && !state.answers[q.id].lastCorrect
      : state.bookmarks.includes(q.id),
  );
  if (!pool.length) {
    toast(
      mode === "errors"
        ? "Hier gibt es noch keine Fehler zum Wiederholen."
        : "Speichere zuerst eine Aufgabe mit dem Lesezeichen.",
    );
    return;
  }
  startPractice(
    shuffle(pool),
    mode === "errors" ? "Fehlertraining" : "Deine Lesezeichen",
  );
}
function startPractice(pool, label) {
  if (!pool.length) return;
  if (run && !run.finished) {
    confirmDialog(
      "Gesichertes Training ersetzen?",
      "Deine bereits bewerteten Antworten bleiben erhalten. Der offene Trainingsablauf wird durch die neue Auswahl ersetzt.",
      () => beginPractice(pool, label),
    );
    return;
  }
  beginPractice(pool, label);
}
function beginPractice(pool, label) {
  run = {
    qids: pool.map((x) => x.id),
    index: 0,
    values: {},
    graded: {},
    criteria: {},
    options: {},
    orders: {},
    label,
    finished: false,
  };
  save();
  if (location.hash === "#practice/run") render();
  else navigate("practice/run");
}
function getOptions(q, session) {
  return (session.options[q.id] ??= shuffle(q.options || []));
}
function questionHTML(q, session, exam = false, locked = false) {
  const v = session.values[q.id];
  const info = `<div class="question-meta"><span class="badge neutral">${e(tMap.get(q.topic).title)}</span><span class="badge neutral">${e(typeNames[q.type])}</span><span class="badge">${e(q.difficulty)} · AFB ${q.afb}</span><span class="small subtle">${q.points} ${q.points === 1 ? "Punkt" : "Punkte"}</span></div>`;
  let input = "";
  if (["single", "tf", "multi"].includes(q.type)) {
    const opts = getOptions(q, session);
    input = `<div class="answer-options">${opts.map((o, i) => `<label class="answer-option"><input name="answer" type="${q.type === "multi" ? "checkbox" : "radio"}" value="${e(o)}" ${q.type === "multi" ? ((v || []).includes(o) ? "checked" : "") : v === o ? "checked" : ""} ${locked ? "disabled" : ""}><span>${e(o)}</span></label>`).join("")}</div>${q.type === "multi" ? '<p class="small subtle">Eine oder mehrere Antworten können richtig sein.</p>' : ""}${q.type === "tf" ? `<label class="field">Begründe deine Entscheidung (zum eigenen Vergleich)<textarea id="tf-reason" ${locked ? "disabled" : ""}>${e(session.values[q.id + "-reason"] || "")}</textarea></label>` : ""}`;
  } else if (q.type === "cloze") {
    input = `<label class="field" style="margin:25px 0">Deine Ergänzung<input id="answer-text" autocomplete="off" value="${e(v || "")}" ${locked ? "disabled" : ""}></label>`;
  } else if (q.type === "order") {
    const order = v || (session.orders[q.id] ??= shuffle(q.answer));
    input = `<p class="small subtle">Ziehe die Elemente in die richtige Reihenfolge oder nutze ↑ und ↓.</p><ol class="order-list" id="order-list">${order.map((o, i) => `<li class="order-item" draggable="${!locked}" data-order="${i}"><span>${e(o)}</span><button type="button" data-move="${i}" data-dir="-1" aria-label="${e(o)} nach oben" ${i === 0 || locked ? "disabled" : ""}>↑</button><button type="button" data-move="${i}" data-dir="1" aria-label="${e(o)} nach unten" ${i === order.length - 1 || locked ? "disabled" : ""}>↓</button></li>`).join("")}</ol>`;
  } else if (q.type === "match") {
    const opts = (session.options[q.id] ??= shuffle(q.pairs.map((x) => x[1])));
    input = `<div class="answer-options">${q.pairs.map(([left], i) => `<label class="match-row"><span>${e(left)}</span><select data-pair="${e(left)}" ${locked ? "disabled" : ""}><option value="">Bitte zuordnen</option>${opts.map((right) => `<option ${v?.[left] === right ? "selected" : ""}>${e(right)}</option>`).join("")}</select></label>`).join("")}</div>`;
  } else {
    if (q.diagram) {
      const d = q.diagram,
        max = Math.max(...d.values.map(Number));
      input += `<div class="chart" role="img" aria-label="${e(d.labels.map((l, i) => `${l}: ${d.values[i]} ${d.unit}`).join("; "))}">${d.labels.map((l, i) => `<div class="chart-row"><span>${e(l)}</span><div class="chart-bar" style="width:${Math.max(0, (Number(d.values[i]) / max) * 100)}%"></div><span>${e(d.values[i])}</span></div>`).join("")}</div><p class="chart-axis">Balkenachse beginnt bei 0 · ${e(d.unit || "Werte laut Aufgabe")}</p>`;
    }
    input += `<label class="field">Deine Antwort<textarea id="answer-text" placeholder="Formuliere fachlich und begründe deine Aussagen …" ${locked ? "disabled" : ""}>${e(v || "")}</textarea></label>${!exam ? '<p class="small subtle">Du bewertest deine Antwort anhand einer Musterlösung und transparenter Kriterien.</p>' : ""}`;
  }
  return `${info}<h2>${e(q.prompt)}</h2>${input}`;
}
function bindQuestion(q, session, onReorder = () => {}, locked = false) {
  if (locked) return;
  const store = () => {
    session.values[q.id] = readValue(q, session);
    if (q.type === "tf")
      session.values[q.id + "-reason"] =
        document.querySelector("#tf-reason")?.value || "";
    if (session === state.activeExam || session === run) save();
  };
  document
    .querySelectorAll("[name=answer], [data-pair], #answer-text, #tf-reason")
    .forEach((x) => {
      x.addEventListener("input", store);
      x.addEventListener("change", store);
    });
  if (q.type === "order") {
    let order = [...(session.values[q.id] || session.orders[q.id])];
    const move = (from, to) => {
      if (to < 0 || to >= order.length || from === to) return;
      const [x] = order.splice(from, 1);
      order.splice(to, 0, x);
      session.values[q.id] = order;
      if (session === state.activeExam || session === run) save();
      onReorder();
    };
    document
      .querySelectorAll("[data-move]")
      .forEach(
        (b) =>
          (b.onclick = () =>
            move(
              Number(b.dataset.move),
              Number(b.dataset.move) + Number(b.dataset.dir),
            )),
      );
    document.querySelectorAll("[data-order]").forEach((li) => {
      li.ondragstart = (ev) => {
        ev.dataTransfer.setData("text/order", li.dataset.order);
        li.classList.add("dragging");
      };
      li.ondragend = () => li.classList.remove("dragging");
      li.ondragover = (ev) => ev.preventDefault();
      li.ondrop = (ev) => {
        ev.preventDefault();
        const from = Number(ev.dataTransfer.getData("text/order"));
        if (Number.isInteger(from)) move(from, Number(li.dataset.order));
      };
    });
  }
}
function readValue(q, session) {
  if (q.type === "multi")
    return [...document.querySelectorAll("[name=answer]:checked")].map(
      (x) => x.value,
    );
  if (["single", "tf"].includes(q.type))
    return document.querySelector("[name=answer]:checked")?.value ?? "";
  if (q.type === "match")
    return Object.fromEntries(
      [...document.querySelectorAll("[data-pair]")].map((x) => [
        x.dataset.pair,
        x.value,
      ]),
    );
  if (q.type === "order") return session.values[q.id] || session.orders[q.id];
  return document.querySelector("#answer-text")?.value || "";
}
function hasAnswer(q, v) {
  if (q.type === "order") return Array.isArray(v);
  if (q.type === "match") return q.pairs.every(([l]) => v?.[l]);
  if (q.type === "multi") return Array.isArray(v) && v.length > 0;
  return typeof v === "string" && v.trim().length > 0;
}
function solution(q, withRubric = true) {
  return `<h3>Musterlösung</h3><p>${e(q.model || (Array.isArray(q.answer) ? q.answer.join(q.type === "order" ? " → " : " · ") : q.answer) || (q.pairs || []).map((x) => x.join(" → ")).join("; "))}</p>${withRubric && q.rubric?.length ? `<h3>Bewertungskriterien · ${q.points} Punkte</h3><p class="small subtle">1 Punkt je erfülltem Kriterium. Sinngemäß richtige Formulierungen zählen.</p><ul>${q.rubric.map((r) => `<li>${e(r)}</li>`).join("")}</ul>` : ""}<p>${e(q.explanation)}</p><div class="small subtle">Quelle: ${e(q.source)}</div><details><summary>Quellen & Seitenverweise</summary>${sourceLinks({ ...tMap.get(q.topic), sources: tMap.get(q.topic).sources.filter((s) => q.source.includes(s.label)).length ? tMap.get(q.topic).sources.filter((s) => q.source.includes(s.label)) : tMap.get(q.topic).sources })}</details>`;
}
function bookmarkButton(q) {
  return `<button class="icon-btn" id="bookmark" aria-label="${state.bookmarks.includes(q.id) ? "Lesezeichen entfernen" : "Aufgabe als Lesezeichen speichern"}" aria-pressed="${state.bookmarks.includes(q.id)}" style="color:${state.bookmarks.includes(q.id) ? "var(--accent)" : "var(--muted)"}">${icon("bookmark")}</button>`;
}
function bindBookmark(q) {
  document.querySelector("#bookmark").onclick = () => {
    const yes = state.bookmarks.includes(q.id);
    state.bookmarks = state.bookmarks.filter((x) => x !== q.id);
    if (!yes) state.bookmarks.push(q.id);
    save();
    const b = document.querySelector("#bookmark");
    b.style.color = yes ? "var(--muted)" : "var(--accent)";
    b.setAttribute("aria-pressed", String(!yes));
    toast(yes ? "Lesezeichen entfernt." : "Aufgabe gespeichert.");
  };
}
function practiceRun() {
  if (!run) {
    navigate("practice");
    return;
  }
  if (run.finished) {
    practiceResult();
    return;
  }
  const q = qMap.get(run.qids[run.index]),
    grade = run.graded[q.id],
    revealed = grade?.revealed;
  let fb = "";
  if (revealed) {
    const auto = validate(q, run.values[q.id]);
    fb = `<div class="feedback ${auto === false ? "wrong" : ""}"><h3>${auto === null ? "Vergleiche deine Antwort" : auto ? "Richtig gelöst." : "Hier lohnt ein zweiter Blick."}</h3>${solution(q, false)}${auto === null ? rubricHTML(q.rubric, (run.criteria[q.id] ??= []), "practice-" + q.id, grade.score !== undefined) : ""}${auto === null && grade.score === undefined ? '<button class="button compact" id="save-self" style="margin-top:14px">Selbstbewertung speichern</button>' : ""}</div>`;
  }
  shell(
    `${head("DEIN TRAINING", e(run.label), `Aufgabe ${run.index + 1} von ${run.qids.length}`, `<button class="button secondary" id="end-run">Training beenden</button>`)}<div class="question"><div class="progress" style="margin-bottom:25px"><i style="width:${(run.index / run.qids.length) * 100}%"></i></div><div class="panel">${questionHTML(q, run, false, !!revealed)}${fb}<div class="question-actions">${bookmarkButton(q)}${!revealed ? '<button id="check-answer" class="button">Antwort prüfen</button>' : `<span class="small subtle">${grade.score === undefined ? "Noch nicht bewertet" : `${grade.score} / ${q.points} Punkte`}</span><button id="next-question" class="button" ${grade.score === undefined ? "disabled" : ""}>${run.index === run.qids.length - 1 ? "Training auswerten" : "Nächste Aufgabe"} ${icon("arrow")}</button>`}</div></div></div>`,
    "practice",
  );
  save();
  bindBookmark(q);
  bindQuestion(q, run, practiceRun, !!revealed);
  document.querySelector("#end-run").onclick = () =>
    confirmDialog(
      "Training beenden?",
      "Deine bereits bewerteten Antworten sind gespeichert. Unbearbeitete Aufgaben zählen nicht als Fehler.",
      () => {
        finishPractice();
      },
    );
  if (!revealed)
    document.querySelector("#check-answer").onclick = () => {
      const v = readValue(q, run);
      if (!hasAnswer(q, v)) {
        toast("Beantworte die Aufgabe zuerst.");
        return;
      }
      run.values[q.id] = v;
      run.graded[q.id] = { revealed: true };
      const correct = validate(q, v);
      if (correct !== null) {
        const score = correct ? q.points : 0;
        run.graded[q.id].score = score;
        recordAnswer(state, q, score);
        save();
        sound(correct);
      }
      save();
      practiceRun();
      document.querySelector(".feedback")?.setAttribute("tabindex", "-1");
      document.querySelector(".feedback")?.focus();
    };
  else {
    document.querySelector("#next-question").onclick = () => {
      if (run.index === run.qids.length - 1) finishPractice();
      else {
        run.index++;
        practiceRun();
        window.scrollTo(0, 0);
      }
    };
    if (document.querySelector("#save-self")) {
      bindRubric(
        document.querySelector(`[data-rubric="practice-${q.id}"]`),
        q.rubric,
        run.criteria[q.id],
        save,
      );
      document.querySelector("#save-self").onclick = () => {
        const score = countCriteria(run.criteria[q.id]);
        run.graded[q.id].score = score;
        recordAnswer(state, q, score);
        save();
        practiceRun();
      };
    }
  }
}
function finishPractice() {
  const done = run.qids.filter((id) => run.graded[id]?.score !== undefined);
  if (done.length) {
    state.sessions.push({
      at: Date.now(),
      label: run.label,
      score: done.reduce((s, id) => s + run.graded[id].score, 0),
      max: done.reduce((s, id) => s + qMap.get(id).points, 0),
    });
    state.sessions = state.sessions.slice(-100);
    save();
  }
  run.finished = true;
  save();
  practiceResult();
}
function practiceResult() {
  const done = run.qids.filter((id) => run.graded[id]?.score !== undefined),
    score = done.reduce((s, id) => s + run.graded[id].score, 0),
    max = done.reduce((s, id) => s + qMap.get(id).points, 0),
    percent = max ? Math.round((score / max) * 100) : 0;
  shell(
    `${head("TRAINING ABGESCHLOSSEN", "Ein Schritt weiter.", `${done.length} von ${run.qids.length} Aufgaben bewertet.`)}<div class="panel center"><div class="score-ring">${percent} %<small>${score} / ${max} Punkte</small></div><p class="subtle">${max ? "Deine Antworten sind im Lernfortschritt berücksichtigt." : "Es wurden noch keine Antworten bewertet."}</p><div class="row" style="justify-content:center"><a class="button" href="#practice">Weiter üben</a><a class="button secondary" href="#dashboard">Zur Übersicht</a></div></div><div class="panel"><h2>Dein Ergebnis nach Thema</h2>${topics
      .filter((t) => done.some((id) => qMap.get(id).topic === t.id))
      .map((t) => {
        const ids = done.filter((id) => qMap.get(id).topic === t.id);
        return `<div class="session-row"><span>${e(t.title)}</span><span>${ids.reduce((s, id) => s + run.graded[id].score, 0)} / ${ids.reduce((s, id) => s + qMap.get(id).points, 0)} Punkte</span></div>`;
      })
      .join("")}</div>`,
    "practice",
  );
}
function confirmDialog(title, text, fn) {
  const d = document.createElement("dialog");
  d.innerHTML = `<h2>${e(title)}</h2><p class="subtle">${e(text)}</p><div class="row"><button class="button secondary" id="dialog-cancel">Abbrechen</button><button class="button" id="dialog-ok">Bestätigen</button></div>`;
  document.body.append(d);
  d.showModal();
  d.querySelector("#dialog-cancel").onclick = () => d.close();
  d.querySelector("#dialog-ok").onclick = () => {
    d.close();
    fn();
  };
  d.onclose = () => d.remove();
}
function examSetup() {
  const active = state.activeExam && !state.activeExam.submitted;
  shell(
    `${head("ANWENDEN UNTER ZEITDRUCK", "Deine Generalprobe.", "Thematisch ausgewogen. Mit Operatoren, Punkten und drei Anforderungsbereichen.")}<div class="reading-grid"><section><div class="panel"><h2>Klausur zusammenstellen</h2><div class="filters"><label class="field">Bearbeitungszeit<select id="exam-minutes"><option>30</option><option selected>45</option><option>60</option><option>90</option></select></label><label class="field">Umfang<select id="exam-count"><option value="10">10 Aufgaben · 1 pro Thema</option><option value="20">20 Aufgaben · 2 pro Thema</option></select></label></div><p class="subtle small">Die Klausur enthält Grundlagen, Zusammenhangs- und Transferaufgaben mit Schwerpunkt auf offenen Antworten. Während der Bearbeitung werden keine Lösungen angezeigt. Nach Ablauf der Zeit wird automatisch abgegeben.</p><button class="button" id="exam-start">Klausur beginnen ${icon("arrow")}</button>${active ? '<div class="divider"></div><a href="#exam/run" class="button secondary">Laufende Klausur fortsetzen</a>' : ""}${state.activeExam?.submitted ? '<div class="divider"></div><a href="#exam/result" class="button secondary">Letzte Auswertung öffnen</a>' : ""}</div><div class="callout">Plane bei 20 Aufgaben entsprechend mehr Zeit ein. Offene Antworten werden nach der Abgabe anhand der Musterlösung selbst bewertet.</div></section><aside><div class="aside-panel"><h3>Deine Prüfungsbedingungen</h3><p>AFB I: Wissen wiedergeben<br>AFB II: Zusammenhänge erklären<br>AFB III: Übertragen und beurteilen</p><div class="divider"></div><h3>Notenpunkte</h3><p>${state.settings.gradeKey ? "Dein eingetragener Bewertungsschlüssel wird verwendet." : "Ein verbindlicher schulischer Schlüssel liegt nicht vor. Du erhältst Punkte und Prozentwerte; einen eigenen Schlüssel kannst du in den Einstellungen hinterlegen."}</p><a href="#settings" class="small">Bewertungsschlüssel einstellen →</a></div></aside></div>`,
    "exam",
  );
  document.querySelector("#exam-start").onclick = () => {
    const start = () => {
      const count = Number(document.querySelector("#exam-count").value),
        minutes = Number(document.querySelector("#exam-minutes").value);
      const selected = balancedExamWithAFB(count);
      state.activeExam = {
        qids: selected.map((q) => q.id),
        index: 0,
        values: {},
        options: {},
        orders: {},
        subjective: {},
        criteria: {},
        deadline: Date.now() + minutes * 60000,
        started: Date.now(),
        minutes,
        submitted: false,
        recorded: false,
      };
      save();
      navigate("exam/run");
    };
    if (active)
      confirmDialog(
        "Neue Klausur beginnen?",
        "Die laufende Klausur wird ersetzt. Bisherige Eingaben dieser Klausur werden verworfen.",
        start,
      );
    else start();
  };
}
function balancedExamWithAFB(count) {
  const selected = balancedExam(topics, count);
  for (const afb of [1, 2, 3]) {
    if (selected.some((q) => q.afb === afb)) continue;
    const indices = shuffle(selected.map((_, i) => i));
    for (const i of indices) {
      const old = selected[i];
      if (selected.filter((q) => q.afb === old.afb).length < 2) continue;
      const replacement = shuffle(
        tMap
          .get(old.topic)
          .questions.filter(
            (q) => q.afb === afb && !selected.some((s) => s.id === q.id),
          ),
      )[0];
      if (replacement) {
        selected[i] = replacement;
        break;
      }
    }
  }
  return shuffle(selected);
}
function examRun() {
  const s = state.activeExam;
  if (!s) {
    navigate("exam");
    return;
  }
  if (s.submitted) {
    navigate("exam/result");
    return;
  }
  if (Date.now() >= s.deadline) {
    submitExam();
    return;
  }
  const q = qMap.get(s.qids[s.index]);
  shell(
    `${head("KLAUSURSIMULATION", `Aufgabe ${s.index + 1} / ${s.qids.length}`, "Deine Antworten werden gespeichert.", `<div class="timer" id="timer" role="timer" aria-label="Verbleibende Bearbeitungszeit"></div>`)}<div class="question"><div class="exam-nav">${s.qids.map((id, i) => `<button data-exam-index="${i}" class="${i === s.index ? "selected" : ""} ${hasAnswer(qMap.get(id), s.values[id]) ? "answered" : ""}" aria-label="Aufgabe ${i + 1}">${i + 1}</button>`).join("")}</div><div class="panel">${questionHTML(q, s, true)}<div class="question-actions"><button class="button secondary" id="exam-prev" ${s.index === 0 ? "disabled" : ""}>Zurück</button><button class="button" id="exam-next">${s.index === s.qids.length - 1 ? "Zur Abgabe" : "Weiter"} ${icon("arrow")}</button></div></div><div class="row between"><a href="#exam" class="small">Zur Klausurübersicht · Zeit läuft weiter</a><button id="exam-submit" class="button secondary">Klausur abgeben</button></div></div>`,
    "exam",
  );
  bindQuestion(q, s, examRun);
  const capture = () => {
    s.values[q.id] = readValue(q, s);
    if (q.type === "tf")
      s.values[q.id + "-reason"] =
        document.querySelector("#tf-reason")?.value || "";
    save();
  };
  const move = (i) => {
    capture();
    s.index = i;
    save();
    examRun();
  };
  document
    .querySelectorAll("[data-exam-index]")
    .forEach((b) => (b.onclick = () => move(Number(b.dataset.examIndex))));
  document.querySelector("#exam-prev").onclick = () => move(s.index - 1);
  document.querySelector("#exam-next").onclick = () => {
    if (s.index < s.qids.length - 1) move(s.index + 1);
    else {
      capture();
      confirmExamSubmit();
    }
  };
  document.querySelector("#exam-submit").onclick = () => {
    capture();
    confirmExamSubmit();
  };
  updateTimer();
}
function updateTimer() {
  const s = state.activeExam;
  if (!s || s.submitted) return;
  const left = Math.max(0, Math.ceil((s.deadline - Date.now()) / 1000)),
    el = document.querySelector("#timer");
  if (el) {
    el.textContent = `${String(Math.floor(left / 60)).padStart(2, "0")}:${String(left % 60).padStart(2, "0")}`;
    el.classList.toggle("urgent", left < 300);
  }
  if (left === 0) submitExam();
}
function confirmExamSubmit() {
  const s = state.activeExam,
    empty = s.qids.filter(
      (id) => !hasAnswer(qMap.get(id), s.values[id]),
    ).length;
  confirmDialog(
    "Klausur abgeben?",
    `${empty ? `${empty} Aufgaben sind noch unbeantwortet. ` : ""}Nach der Abgabe werden Musterlösungen und Bewertungskriterien sichtbar.`,
    submitExam,
  );
}
function submitExam() {
  const s = state.activeExam;
  if (!s || s.submitted) return;
  s.submitted = true;
  s.ended = Date.now();
  for (const id of s.qids) {
    const q = qMap.get(id);
    if (!hasAnswer(q, s.values[id])) s.subjective[id] = 0;
  }
  save();
  if (location.hash === "#exam/result") examResult();
  else navigate("exam/result");
}
function examScores() {
  const s = state.activeExam;
  let score = 0,
    max = 0,
    pending = 0;
  const rows = s.qids.map((id) => {
    const q = qMap.get(id),
      auto = validate(q, s.values[id]),
      earned = auto === null ? s.subjective[id] : auto ? q.points : 0;
    max += q.points;
    if (earned === undefined) pending++;
    else score += earned;
    return { q, earned };
  });
  return { score, max, pending, rows };
}
function gradePoints(percent) {
  const key = parseGradeKey(state.settings.gradeKey || "");
  if (!key) return null;
  for (let i = 15; i >= 0; i--) if (percent >= key[15 - i]) return i;
  return 0;
}
function examResult() {
  const s = state.activeExam;
  if (!s) {
    navigate("exam");
    return;
  }
  if (!s.submitted) {
    navigate("exam/run");
    return;
  }
  const x = examScores(),
    percent = Math.round((x.score / x.max) * 100),
    grade = gradePoints((x.score / x.max) * 100);
  if (!x.pending && !s.recorded) {
    for (const { q, earned } of x.rows) recordAnswer(state, q, earned);
    state.sessions.push({
      at: s.ended,
      label: `Klausursimulation · ${s.minutes} Minuten`,
      score: x.score,
      max: x.max,
    });
    state.sessions = state.sessions.slice(-100);
    s.recorded = true;
    save();
  }
  shell(
    `${head("DEINE AUSWERTUNG", x.pending ? "Jetzt reflektieren. Dann weiterlernen." : "Deine Klausur ist ausgewertet.", x.pending ? `${x.pending} offene Antworten warten auf deine Selbstbewertung.` : "Dein Ergebnis wurde in deinem Lernfortschritt gespeichert.")}<div class="stats"><div class="stat"><div class="stat-label">${x.pending ? "Bisherige Punkte" : "Gesamtpunkte"}</div><div class="stat-value">${x.score}<small> / ${x.max}</small></div></div><div class="stat"><div class="stat-label">${x.pending ? "Vorläufiger Anteil" : "Ergebnis"}</div><div class="stat-value">${percent}<small> %</small></div></div><div class="stat"><div class="stat-label">Notenpunkte</div><div class="stat-value">${x.pending || grade === null ? "—" : grade}<small>${!x.pending && grade !== null ? " / 15" : ""}</small></div><div class="stat-note">${x.pending ? "Nach vollständiger Bewertung" : grade === null ? "Kein eigener Schlüssel hinterlegt" : "Nach deinem eigenen Schlüssel"}</div></div><div class="stat"><div class="stat-label">Bearbeitungsdauer</div><div class="stat-value">${Math.min(s.minutes, Math.ceil((s.ended - s.started) / 60000))}<small> min</small></div></div></div><div class="panel"><h2>Stärken und nächste Schritte</h2>${topics
      .map((t) => {
        const rows = x.rows.filter((r) => r.q.topic === t.id),
          done = rows.every((r) => r.earned !== undefined);
        return `<div class="session-row"><a href="#learn/${t.id}">${e(t.title)}</a><span>${done ? `${rows.reduce((a, r) => a + r.earned, 0)} / ${rows.reduce((a, r) => a + r.q.points, 0)} Punkte` : "Bewertung offen"}</span></div>`;
      })
      .join(
        "",
      )}</div>${x.rows.map(({ q, earned }, i) => `<details ${earned === undefined ? "open" : ""}><summary>${i + 1}. ${e(tMap.get(q.topic).title)} · ${earned === undefined ? "Selbstbewertung offen" : earned + " / " + q.points + " Punkte"}</summary><p>${e(q.prompt)}</p><h3>Deine Antwort</h3><p style="white-space:pre-wrap">${e(formatValue(q, s.values[q.id]))}</p>${solution(q, false)}${q.rubric ? rubricHTML(q.rubric, ((s.criteria ??= {})[q.id] ??= []), "exam-" + q.id, earned !== undefined) : ""}${validate(q, s.values[q.id]) === null && earned === undefined ? `<button class="button compact" data-save-exam="${q.id}" style="margin-top:14px">Bewertung speichern</button>` : ""}</details>`).join("")}<div class="row" style="margin-top:25px"><a href="#exam" class="button">Neue Simulation</a><a href="#dashboard" class="button secondary">Zur Übersicht</a></div>`,
    "exam",
  );
  document.querySelectorAll("[data-save-exam]").forEach((b) => {
    const id = b.dataset.saveExam,
      q = qMap.get(id),
      checks = ((s.criteria ??= {})[id] ??= []);
    bindRubric(
      document.querySelector(`[data-rubric="exam-${id}"]`),
      q.rubric,
      checks,
      save,
    );
    b.onclick = () => {
      const scroll = window.scrollY;
      s.subjective[id] = countCriteria(checks);
      save();
      examResult();
      window.scrollTo(0, scroll);
    };
  });
}
function formatValue(q, v) {
  if (!hasAnswer(q, v)) return "Keine Antwort abgegeben.";
  if (q.type === "match")
    return Object.entries(v)
      .map(([a, b]) => a + " → " + b)
      .join("\n");
  if (Array.isArray(v)) return v.join(q.type === "order" ? " → " : " · ");
  return v;
}
function prepareCards(topic = cardFilter, mode = cardMode) {
  cardFilter = topic;
  cardMode = mode;
  cards = topics
    .filter((t) => !topic || t.id === topic)
    .flatMap((t) =>
      t.terms.map((term, i) => ({ ...term, id: `${t.id}-${i}`, topic: t.id })),
    )
    .filter((c) =>
      mode === "all"
        ? true
        : mode === "hard"
          ? ["no", "unsure"].includes(state.cards[c.id]?.rating)
          : mode === "new"
            ? !state.cards[c.id]
            : mode === "review"
              ? state.cards[c.id]?.due <= Date.now()
              : !state.cards[c.id] || state.cards[c.id].due <= Date.now(),
    );
  cards =
    mode === "due"
      ? [
          ...shuffle(cards.filter((c) => state.cards[c.id])),
          ...shuffle(cards.filter((c) => !state.cards[c.id])),
        ]
      : shuffle(cards);
  cardIndex = 0;
  cardFlipped = false;
}
function cardPage(topicParam) {
  if (topicParam && topicParam !== cardFilter) {
    prepareCards(topicParam, "all");
  } else if (!cards.length && cardIndex === 0) prepareCards();
  const c = cards[cardIndex],
    known = Object.values(state.cards).filter(
      (x) => x.rating === "know",
    ).length,
    total = topics.reduce((s, t) => s + t.terms.length, 0);
  shell(
    `${head("AKTIV WIEDERHOLEN", "Ein Begriff. Ein klarer Gedanke.", `${known} / ${total} Karten zuletzt sicher · Wiederholungen nach 1, 3, 7, 14, 30 und 60 Tagen.`)}<div class="filters"><label class="field">Thema<select id="card-topic"><option value="">Alle Themen</option>${topics.map((t) => `<option value="${t.id}" ${cardFilter === t.id ? "selected" : ""}>${e(t.title)}</option>`).join("")}</select></label><label class="field">Auswahl<select id="card-mode"><option value="due" ${cardMode === "due" ? "selected" : ""}>Fällige zuerst, danach neue</option><option value="review" ${cardMode === "review" ? "selected" : ""}>Nur fällige Wiederholungen</option><option value="new" ${cardMode === "new" ? "selected" : ""}>Nur neue Karten</option><option value="hard" ${cardMode === "hard" ? "selected" : ""}>Unsicher & kann ich nicht</option><option value="all" ${cardMode === "all" ? "selected" : ""}>Alle Karten</option></select></label></div>${c ? `<div class="row between"><span class="badge">${e(tMap.get(c.topic).title)}</span><span class="small subtle">${state.cards[c.id] ? "Wiederholung" : "Neue Karte"} · ${cardIndex + 1} / ${cards.length}</span></div><div class="flip-container" id="flip-card" tabindex="0" role="button" aria-label="Karte umdrehen: ${e(c.term)}" aria-pressed="${cardFlipped}"><div class="flip-card ${cardFlipped ? "flipped" : ""}"><div class="card-face" ${cardFlipped ? 'aria-hidden="true"' : ""}><div class="eyebrow">Erkläre den Begriff</div><h2>${e(c.term)}</h2><span class="small subtle">Klicken oder Leertaste zum Umdrehen</span></div><div class="card-face card-back" ${!cardFlipped ? 'aria-hidden="true"' : ""}><span class="eyebrow">${e(c.term)}</span><p>${e(c.definition)}</p></div></div></div><div class="card-actions"><button class="button secondary" data-rating="no" ${cardFlipped ? "" : "disabled"}>1 · Kann ich nicht</button><button class="button secondary" data-rating="unsure" ${cardFlipped ? "" : "disabled"}>2 · Unsicher</button><button class="button" data-rating="know" ${cardFlipped ? "" : "disabled"}>3 · Kann ich</button></div><p class="center small subtle" style="margin-top:20px">„Kann ich nicht“ bleibt sofort fällig. „Unsicher“ wird morgen wiederholt.</p><details><summary>Quellen dieser Karte</summary>${sourceLinks(tMap.get(c.topic))}</details>` : `<div class="panel center"><h2>Für diese Auswahl ist alles erledigt.</h2><p class="subtle">Wähle „Alle Karten“, um unabhängig vom Fälligkeitsdatum zu lernen.</p><button class="button" id="cards-all">Alle Karten ansehen</button></div>`}`,
    "cards",
  );
  document.querySelector("#card-topic").onchange = (ev) => {
    prepareCards(ev.target.value, cardMode);
    if (topicParam) history.replaceState(null, "", "#cards");
    cardPage();
  };
  document.querySelector("#card-mode").onchange = (ev) => {
    prepareCards(cardFilter, ev.target.value);
    cardPage();
  };
  if (c) {
    const flip = () => {
      cardFlipped = !cardFlipped;
      cardPage();
    };
    document.querySelector("#flip-card").onclick = flip;
    document.querySelector("#flip-card").onkeydown = (ev) => {
      if (ev.key === "Enter") {
        ev.preventDefault();
        flip();
      }
    };
    document
      .querySelectorAll("[data-rating]")
      .forEach((b) => (b.onclick = () => rateCard(b.dataset.rating)));
  } else
    document.querySelector("#cards-all").onclick = () => {
      prepareCards(cardFilter, "all");
      cardPage();
    };
}
function rateCard(rating) {
  if (!cardFlipped || !cards[cardIndex]) return;
  const c = cards[cardIndex];
  state.cards[c.id] = scheduleCard(state.cards[c.id], rating);
  save();
  cardIndex++;
  cardFlipped = false;
  cardPage();
}
function glossary() {
  const entries = topics
    .flatMap((t) => t.terms.map((x) => ({ ...x, topic: t.id })))
    .sort((a, b) => a.term.localeCompare(b.term, "de"));
  shell(
    `${head("DEIN NACHSCHLAGEWERK", "Finde deinen Zusammenhang.", "Begriffe, Kapitel, Aufgaben und eigene Notizen durchsuchen.")}<div class="filters"><label class="field">Suchbegriff<input type="search" id="glossary-search" placeholder="z. B. ökologische Nische …"></label><label class="field">Thema<select id="glossary-topic"><option value="">Alle Themen</option>${topics.map((t) => `<option value="${t.id}">${e(t.title)}</option>`).join("")}</select></label></div><p id="glossary-count" class="small subtle"></p><div id="glossary-list" class="glossary"></div>`,
    "glossary",
  );
  const update = () => {
    const s = document
        .querySelector("#glossary-search")
        .value.toLocaleLowerCase("de"),
      t = document.querySelector("#glossary-topic").value,
      filtered = entries.filter(
        (x) =>
          (!t || x.topic === t) &&
          (x.term + " " + x.definition).toLocaleLowerCase("de").includes(s),
      );
    const chapterHits = s.trim()
      ? topics.filter(
          (x) =>
            (!t || x.id === t) &&
            JSON.stringify([x.title, x.sections])
              .toLocaleLowerCase("de")
              .includes(s),
        )
      : [];
    const taskHits = s.trim()
      ? questions.filter(
          (x) =>
            (!t || x.topic === t) &&
            x.prompt.toLocaleLowerCase("de").includes(s),
        )
      : [];
    const noteHits = s.trim()
      ? topics.filter(
          (x) =>
            (!t || x.id === t) &&
            JSON.stringify([
              state.notebook[x.id]?.text || "",
              ...(state.notebook[x.id]?.highlights || []).map((h) => h.quote),
            ])
              .toLocaleLowerCase("de")
              .includes(s),
        )
      : [];
    document.querySelector("#glossary-count").textContent =
      `${filtered.length} Begriffe · ${chapterHits.length} Kapitel · ${taskHits.length} Aufgaben · ${noteHits.length} Kapitelnotizen`;
    document.querySelector("#glossary-list").innerHTML = filtered.length
      ? filtered
          .map(
            (x) =>
              `<article><h3>${e(x.term)}</h3><p>${e(x.definition)}</p><a class="small" href="#learn/${x.topic}">${e(tMap.get(x.topic).title)} →</a></article>`,
          )
          .join("")
      : '<div class="empty">Kein passender Begriff gefunden.</div>';
    if (chapterHits.length || taskHits.length || noteHits.length) {
      document.querySelector("#glossary-list .empty")?.remove();
      document.querySelector("#glossary-list").insertAdjacentHTML(
        "beforeend",
        chapterHits
          .map(
            (x) =>
              `<article><span class="badge neutral">Kapitel</span><h3>${e(x.title)}</h3><a href="#learn/${x.id}">Kapitel öffnen →</a></article>`,
          )
          .join("") +
          taskHits
            .slice(0, 15)
            .map(
              (x) =>
                `<article><span class="badge neutral">Aufgabe</span><h3>${e(x.prompt)}</h3><button class="button secondary compact" data-search-task="${x.id}">Aufgabe üben →</button></article>`,
            )
            .join("") +
          noteHits
            .map(
              (x) =>
                `<article><span class="badge neutral">Eigene Notizen</span><h3>${e(x.title)}</h3><a href="#learn/${x.id}">Notiz im Kapitel öffnen →</a></article>`,
            )
            .join("") +
          (taskHits.length > 15
            ? '<p class="small subtle">Die ersten 15 Aufgaben werden angezeigt. Grenze die Suche mit einem Thema oder einem genaueren Begriff ein.</p>'
            : ""),
      );
      document
        .querySelectorAll("[data-search-task]")
        .forEach(
          (b) =>
            (b.onclick = () =>
              startPractice(
                [qMap.get(b.dataset.searchTask)],
                "Aufgabe aus der Suche",
              )),
        );
    }
  };
  document.querySelector("#glossary-search").oninput = update;
  document.querySelector("#glossary-topic").onchange = update;
  update();
  document.querySelector("#glossary-search").focus({ preventScroll: true });
}
function stats() {
  const n = totals();
  shell(
    `${head("DEIN LERNWEG", "Fortschritt wird sichtbar.", "Deine Ergebnisse über mehrere Lernsitzungen hinweg.")}<div class="stats"><div class="stat"><div class="stat-label">Aufgaben zuletzt richtig</div><div class="stat-value">${n.mastered}<small> / ${questions.length}</small></div></div><div class="stat"><div class="stat-label">Antworten insgesamt</div><div class="stat-value">${n.attempts}</div></div><div class="stat"><div class="stat-label">Richtig / falsch</div><div class="stat-value">${n.correct}<small> / ${n.wrong}</small></div></div><div class="stat"><div class="stat-label">Gespeicherte Sitzungen</div><div class="stat-value">${state.sessions.length}</div></div></div><div class="panel"><h2>Deine Themen im Vergleich</h2>${topics
      .map((t) => {
        const x = topicStats(state, t);
        return `<div class="session-row"><a href="#learn/${t.id}">${e(t.title)}</a><div class="progress-row" style="width:40%;min-width:100px"><div class="progress"><i style="width:${x.percent}%"></i></div><span>${x.percent} %</span></div></div>`;
      })
      .join("")}</div><div class="panel"><h2>Deine letzten Lernsitzungen</h2>${
      state.sessions.length
        ? state.sessions
            .slice(-20)
            .reverse()
            .map(
              (s) =>
                `<div class="session-row"><div>${e(s.label)}<div class="small subtle">${new Date(s.at).toLocaleString("de-DE")}</div></div><strong>${Math.round((s.score / s.max) * 100)} %<div class="small subtle">${s.score} / ${s.max}</div></strong></div>`,
            )
            .join("")
        : '<p class="subtle">Nach deinem ersten abgeschlossenen Training erscheint hier dein Ergebnis.</p>'
    }</div><div class="callout">Der Themenfortschritt zählt Aufgaben, die du zuletzt vollständig richtig gelöst hast. Offene Aufgaben zählen nach deiner Selbstbewertung. „Kapitel gelesen“ ist davon unabhängig.</div>`,
    "stats",
  );
}
function parseGradeKey(text) {
  if (!text.trim()) return null;
  const values = text
    .split(/[;,\s]+/)
    .filter(Boolean)
    .map(Number);
  if (
    values.length !== 16 ||
    values.some((v) => !Number.isFinite(v) || v < 0 || v > 100) ||
    values.some((v, i) => i && v >= values[i - 1]) ||
    values[15] !== 0
  )
    return null;
  return values;
}
function settings() {
  shell(
    `${head("DEIN WERKZEUGKASTEN", "So lernst du am liebsten.", "Einstellungen und Sicherung deines persönlichen Lernfortschritts.")}<div class="settings-grid"><section class="panel"><h2>Fortschritt sichern</h2><p class="subtle small">Deine Daten werden in diesem Browser gespeichert. Ein Wechsel von Browser, Adresse oder Gerät übernimmt sie nicht automatisch. Exportiere sie dafür als JSON.</p><div class="row"><button class="button" id="export">${icon("download")} JSON exportieren</button><button class="button secondary" id="import">JSON importieren</button><input type="file" id="import-file" accept="application/json,.json" hidden></div><p id="import-message" class="small" role="status"></p><div class="divider"></div><button class="button danger" id="reset">Gesamten Lernfortschritt zurücksetzen</button></section><section class="panel"><h2>Ton & Fokus</h2><label class="read-check"><input type="checkbox" id="sound" ${state.settings.sound ? "checked" : ""}> Kurzer Ton bei richtigen und falschen Antworten</label><p class="subtle small">Standardmäßig ausgeschaltet.</p><div class="divider"></div><h3>Tastaturkürzel</h3><p class="small subtle">/ · Lerninhalte durchsuchen<br>F · Fokusmodus umschalten<br>Leertaste · Karteikarte umdrehen<br>1 / 2 / 3 · Karte nach dem Umdrehen bewerten<br>Esc · Navigation schließen</p></section><section class="panel"><h2>Dein schulischer Bewertungsschlüssel</h2><p class="subtle small">Trage 16 untere Prozentgrenzen ein, beginnend bei 15 Notenpunkten und endend bei 0 Notenpunkten. Die Werte müssen streng absteigen; der letzte Wert ist 0. Verwende den von deiner Lehrkraft vorgegebenen Schlüssel.</p><label class="field">Grenzen für 15, 14, …, 0 Notenpunkte<textarea id="grade-key" placeholder="16 Prozentgrenzen, durch Semikolon getrennt">${e(state.settings.gradeKey || "")}</textarea></label><p class="small subtle">Leer lassen: nur Punkte und Prozentwerte anzeigen.</p><button class="button secondary" id="save-grade">Schlüssel speichern</button><p id="grade-message" class="small" role="status"></p></section><section class="panel"><h2>Material & Transparenz</h2><p class="subtle small">Die Bio-Mappe ist die Hauptquelle. Ergänzungen stammen aus verlinkten Bildungs- und Fachquellen. Das Ecosphere-Kapitel nutzt ein allgemeines Modell, da das konkrete Unterrichtsgefäß nicht dokumentiert ist. Symbiose wird mit den unterschiedlichen Begriffskonventionen erklärt.</p><p class="small subtle">Die Mappe wird nicht online bereitgestellt. Seitenangaben verweisen auf dein eigenes Exemplar.</p><div class="divider"></div><p class="small subtle">Kein Konto, keine API, keine Analyse-Dienste. Fortschrittsdaten werden durch die Plattform nicht an einen Server geschickt.</p></section></div>`,
    "settings",
  );
  document.querySelector("#sound").onchange = (ev) => {
    state.settings.sound = ev.target.checked;
    save();
  };
  document.querySelector("#export").onclick = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
        type: "application/json",
      }),
      url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = `biotop-fortschritt-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  document.querySelector("#import").onclick = () =>
    document.querySelector("#import-file").click();
  document.querySelector("#import-file").onchange = async (ev) => {
    const file = ev.target.files[0];
    if (!file) return;
    try {
      if (file.size > 5 * 1024 * 1024)
        throw Error("Die Datei ist zu groß (maximal 5 MB).");
      const raw = JSON.parse(await file.text()),
        next = importState(raw, topics);
      if (raw.settings?.gradeKey && parseGradeKey(raw.settings.gradeKey))
        next.settings.gradeKey = raw.settings.gradeKey;
      confirmDialog(
        "Fortschritt importieren?",
        `${Object.keys(next.answers).length} Aufgaben, ${Object.keys(next.cards).length} Karten und ${Object.keys(next.notebook).length} Kapitelnotizen wurden erkannt. Der bisherige Lernstand wird ersetzt. Laufende Klausuren und Trainings werden nicht importiert.`,
        () => {
          state = next;
          run = null;
          save();
          cards = [];
          cardIndex = 0;
          settings();
          toast("Fortschritt importiert.");
        },
      );
    } catch (err) {
      document.querySelector("#import-message").textContent =
        "Import fehlgeschlagen: " + err.message;
    } finally {
      ev.target.value = "";
    }
  };
  document.querySelector("#reset").onclick = () =>
    confirmDialog(
      "Lernfortschritt vollständig löschen?",
      "Antworten, Kartenbewertungen, Lesezeichen, Sitzungen, Lernplan, Notizen, Markierungen, Operatoren-Ergebnisse und laufende Trainings und Klausuren werden gelöscht. Exportiere sie vorher, wenn du sie aufbewahren möchtest.",
      () => {
        state = freshState();
        run = null;
        save();
        cards = [];
        cardIndex = 0;
        settings();
        toast("Lernfortschritt zurückgesetzt.");
      },
    );
  document.querySelector("#save-grade").onclick = () => {
    const v = document.querySelector("#grade-key").value.trim();
    if (v && !parseGradeKey(v)) {
      document.querySelector("#grade-message").textContent =
        "Bitte genau 16 streng absteigende Werte von maximal 100 bis 0 eingeben.";
      return;
    }
    state.settings.gradeKey = v;
    save();
    document.querySelector("#grade-message").textContent = v
      ? "Dein eigener Bewertungsschlüssel wurde gespeichert."
      : "Bewertungsschlüssel entfernt. Ergebnisse werden ohne Notenpunkte angezeigt.";
  };
}
window.addEventListener("resize", () => {
  if (window.innerWidth > 680 && document.querySelector("#sidebar.open"))
    setMenu(false);
});
function render() {
  labCleanup();
  labCleanup = () => {};
  if (
    state.activeExam &&
    !state.activeExam.submitted &&
    Date.now() >= state.activeExam.deadline
  )
    submitExam();
  const [page = "dashboard", id] = location.hash.replace(/^#/, "").split("/");
  if (page === "dashboard") dashboard();
  else if (page === "learn") learn(id);
  else if (page === "plan") renderPlan(toolContext());
  else if (page === "operators") renderOperators(operatorData, toolContext());
  else if (page === "notes") renderNotebook(toolContext());
  else if (page === "train") {
    const t = tMap.get(id);
    if (t)
      startPractice(
        shuffle(t.questions).slice(0, 5),
        "Kapiteltraining · " + t.title,
      );
    else navigate("practice");
  } else if (page === "labs") labs(id);
  else if (page === "practice") id === "run" ? practiceRun() : practice();
  else if (page === "exam")
    id === "run" ? examRun() : id === "result" ? examResult() : examSetup();
  else if (page === "cards") cardPage(id);
  else if (page === "glossary") glossary();
  else if (page === "stats") stats();
  else if (page === "settings") settings();
  else navigate("dashboard");
}
window.addEventListener("hashchange", () => {
  render();
  window.scrollTo(0, 0);
  if (location.hash !== "#glossary") {
    const heading = document.querySelector("h1");
    heading?.setAttribute("tabindex", "-1");
    heading?.focus({ preventScroll: true });
  }
});
window.addEventListener("keydown", (ev) => {
  const editing =
    ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName) ||
    document.activeElement?.isContentEditable;
  if (document.querySelector("#sidebar.open")) {
    if (ev.key === "Escape") {
      ev.preventDefault();
      setMenu(false);
      return;
    }
    if (ev.key === "Tab") {
      const items = [
        ...document.querySelectorAll(
          "#sidebar a, #sidebar button, #sidebar summary",
        ),
      ].filter((x) => x.getClientRects().length);
      const first = items[0],
        last = items.at(-1);
      if (ev.shiftKey && document.activeElement === first) {
        ev.preventDefault();
        last.focus();
      } else if (!ev.shiftKey && document.activeElement === last) {
        ev.preventDefault();
        first.focus();
      }
    }
    return;
  }
  if (
    editing ||
    ev.ctrlKey ||
    ev.metaKey ||
    document.querySelector("dialog[open]")
  )
    return;
  if (ev.key === "/") {
    ev.preventDefault();
    navigate("glossary");
  }
  if (ev.key.toLowerCase() === "f") {
    ev.preventDefault();
    document.querySelector("#focus")?.click();
  }
  if (location.hash.startsWith("#cards")) {
    if (ev.code === "Space") {
      ev.preventDefault();
      cardFlipped = !cardFlipped;
      cardPage();
    }
    if (["1", "2", "3"].includes(ev.key)) {
      ev.preventDefault();
      rateCard({ 1: "no", 2: "unsure", 3: "know" }[ev.key]);
    }
  }
});
try {
  const response = await fetch(new URL("./content.json", import.meta.url));
  if (!response.ok) throw Error("Lerninhalte konnten nicht geladen werden.");
  topics = await response.json();
  const ops = await fetch(new URL("./operators.json", import.meta.url));
  if (!ops.ok) throw Error("Operatoren-Inhalte konnten nicht geladen werden.");
  operatorData = await ops.json();
  questions = topics.flatMap((t) =>
    t.questions.map((q) => ({ ...q, topic: t.id })),
  );
  qMap = new Map(questions.map((q) => [q.id, q]));
  tMap = new Map(topics.map((t) => [t.id, t]));
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (raw) {
      state = importState(raw, topics);
      run = restorePractice(raw.activePractice, questions);
      if (raw.settings?.gradeKey && parseGradeKey(raw.settings.gradeKey))
        state.settings.gradeKey = raw.settings.gradeKey;
      const s = raw.activeExam;
      if (
        s &&
        Array.isArray(s.qids) &&
        s.qids.length &&
        s.qids.every((id) => qMap.has(id)) &&
        Number.isFinite(s.deadline) &&
        Number.isInteger(s.index) &&
        s.index >= 0 &&
        s.index < s.qids.length &&
        s.values &&
        typeof s.values === "object"
      ) {
        state.activeExam = {
          ...s,
          options: s.options || {},
          orders: s.orders || {},
          subjective: s.subjective || {},
        };
      }
    }
  } catch {
    storageOK = false;
  }
  render();
  timerHandle = setInterval(updateTimer, 1000);
} catch (err) {
  app.innerHTML = `<div class="content"><h1>Der Lernraum konnte nicht starten.</h1><p>${e(err.message)}</p><p>Starte das Projekt über <code>npm start</code> und öffne <a href="http://127.0.0.1:4173">http://127.0.0.1:4173</a>. Ein Doppelklick auf index.html unterstützt keine JavaScript-Module.</p></div>`;
}
