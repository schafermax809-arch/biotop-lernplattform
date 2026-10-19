import {
  localDay,
  dayDistance,
  createPlan,
  taskHref,
  mergeHighlights,
  countCriteria,
} from "./tools-engine.js";

export function rubricHTML(
  criteria,
  checks = [],
  key = "rubric",
  disabled = false,
) {
  return `<fieldset class="rubric-checklist" data-rubric="${key}"><legend>Was erfüllt deine Antwort?</legend><p class="small subtle">1 Punkt je erfülltem Kriterium. Sinngemäß richtige Formulierungen zählen.</p>${criteria.map((text, i) => `<label><input type="checkbox" data-criterion="${i}" ${checks[i] ? "checked" : ""} ${disabled ? "disabled" : ""}><span>${escapeHTML(text)}</span></label>`).join("")}<output class="rubric-total" aria-live="polite">${countCriteria(checks)} / ${criteria.length} Punkte</output></fieldset>`;
}
export function bindRubric(root, criteria, checks, onChange) {
  root.querySelectorAll("[data-criterion]").forEach(
    (input) =>
      (input.onchange = () => {
        checks[Number(input.dataset.criterion)] = input.checked;
        root.querySelector(".rubric-total").textContent =
          `${countCriteria(checks)} / ${criteria.length} Punkte`;
        onChange?.(checks);
      }),
  );
}
const escapeHTML = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const formatDate = (value) =>
  new Date(value + "T12:00:00").toLocaleDateString("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
let planLimit = 14;
const openPlanDays = new Set();
function planDay(d, p, topics, today, e) {
  const rows = d.items
    .map(
      (i) =>
        `<div class="plan-item ${p.done[i.id] ? "done" : ""}"><label><input type="checkbox" data-plan-done="${i.id}" ${p.done[i.id] ? "checked" : ""}><span><strong>${i.label}</strong><small>${i.type === "operators" ? "Klausurantworten formulieren" : e(topics.find((t) => t.id === i.topic).title)} · ca. ${i.minutes} min</small></span></label><a class="button secondary compact" href="${taskHref(i)}">Starten →</a></div>`,
    )
    .join("");
  const complete = d.items.filter((i) => p.done[i.id]).length;
  return d.date === today
    ? `<section class="panel plan-day"><div class="section-title"><h2>Heute</h2><span class="badge neutral">${complete} / ${d.items.length} · ${d.items.reduce((s, i) => s + i.minutes, 0)} Minuten</span></div>${rows}</section>`
    : `<details class="plan-day" data-plan-day="${d.date}" ${openPlanDays.has(d.date) ? "open" : ""}><summary><span>${formatDate(d.date)}</span><span class="small subtle">${complete} / ${d.items.length} erledigt · ${d.items.reduce((s, i) => s + i.minutes, 0)} min</span></summary>${rows}</details>`;
}
export function planSummary(state) {
  const p = state.planner;
  if (!p) return "";
  const today = p.days.find((d) => d.date === localDay());
  const done = today?.items.filter((i) => p.done[i.id]).length || 0;
  return `<div class="aside-panel"><span class="eyebrow">Dein Tagesplan</span><h3 style="margin-top:10px">${done} / ${today?.items.length || 0} Einheiten erledigt</h3><p>${dayDistance(localDay(), p.examDate) < 0 ? "Der hinterlegte Klausurtermin ist vergangen." : `${Math.max(0, dayDistance(localDay(), p.examDate))} Tage bis zur Klausur · ${p.minutes} Minuten täglich`}</p><a class="button secondary" href="#plan">Lernplan öffnen →</a></div>`;
}
export function renderPlan({
  topics,
  state,
  save,
  e,
  head,
  shell,
  toast,
  confirmDialog,
}) {
  const p = state.planner,
    today = localDay(),
    upcoming = p?.days.filter((d) => d.date >= today) || [],
    items = p?.days.flatMap((d) => d.items) || [],
    complete = items.filter((i) => p.done[i.id]).length,
    overdue =
      p?.days
        .filter((d) => d.date < today)
        .flatMap((d) => d.items)
        .filter((i) => !p.done[i.id]).length || 0;
  shell(
    `${head("DEIN WEG ZUR KLAUSUR", "Ein Plan, der zu dir passt.", "Tägliche Einheiten aus deinem Lernstand, mit Zeit für Begriffe und Anwendung.")}<div class="panel"><div class="filters"><label class="field">Klausurdatum<input id="plan-date" type="date" min="${today}" value="${e(p?.examDate || "")}"></label><label class="field">Tägliche Lernzeit in Minuten<input id="plan-minutes" type="number" min="5" max="180" step="1" value="${p?.minutes || 30}"></label></div><div class="row between"><p class="small subtle">Fehler und noch unsichere Themen werden zuerst eingeplant.</p><button class="button" id="plan-create">${p ? "Plan neu berechnen" : "Meinen Lernplan erstellen"}</button></div><p class="small" id="plan-message" role="status"></p></div>${
      p
        ? `<div class="stats"><div class="stat"><div class="stat-label">Bis zur Klausur</div><div class="stat-value">${Math.max(0, dayDistance(today, p.examDate))}<small> Tage</small></div></div><div class="stat"><div class="stat-label">Tägliches Budget</div><div class="stat-value">${p.minutes}<small> min</small></div></div><div class="stat"><div class="stat-label">Einheiten erledigt</div><div class="stat-value">${complete}<small> / ${items.length}</small></div></div><div class="stat"><div class="stat-label">Vergangene offene Einheiten</div><div class="stat-value">${overdue}</div></div></div>${overdue ? '<div class="callout">Einige Einheiten sind liegen geblieben. Berechne den Plan neu, um ab heute mit deinem aktuellen Lernstand weiterzuplanen.</div>' : ""}<p class="small subtle">Zeitangaben sind Orientierungswerte. Hake eine Einheit nach der Bearbeitung selbst ab. Neu berechnen passt die nächsten Tage an deinen aktuellen Lernstand an.</p>${
            upcoming.length
              ? upcoming
                  .slice(0, planLimit)
                  .map((d) => planDay(d, p, topics, today, e))
                  .join("")
              : '<div class="empty">Für heute und die kommenden Tage ist kein Tagesplan mehr hinterlegt. Wähle einen neuen Klausurtermin.</div>'
          }${upcoming.length > planLimit ? '<button class="button secondary" id="plan-more">Weitere Tage anzeigen</button>' : ""}<div class="callout">Bis zum Termin werden ${new Set(items.filter((i) => i.type !== "operators").map((i) => i.topic)).size} von ${topics.length} Themen eingeplant. Ein Plan organisiert deine Lernzeit; ob die Zeit zum sicheren Beherrschen reicht, zeigen deine Übungsergebnisse.</div>`
        : '<div class="empty">Trage deinen Termin und deine tägliche Lernzeit ein. Dein erster Tagesplan wartet auf dich.</div>'
    }`,
    "plan",
  );
  document.querySelector("#plan-create").onclick = () => {
    let next;
    try {
      next = createPlan(
        topics,
        state,
        document.querySelector("#plan-date").value,
        Number(document.querySelector("#plan-minutes").value),
      );
    } catch (err) {
      document.querySelector("#plan-message").textContent = err.message;
      return;
    }
    const accept = () => {
      state.planner = next;
      save();
      planLimit = 14;
      renderPlan({ topics, state, save, e, head, shell, toast, confirmDialog });
      toast("Dein Lernplan ist gespeichert.");
    };
    if (p)
      confirmDialog(
        "Lernplan neu berechnen?",
        "Der Tagesplan wird anhand deines aktuellen Lernstands neu erstellt. Die bisherigen Häkchen im Plan werden ersetzt. Dein Lernfortschritt bleibt gespeichert.",
        accept,
      );
    else accept();
  };
  document.querySelectorAll("[data-plan-day]").forEach(
    (d) =>
      (d.ontoggle = () => {
        if (d.open) openPlanDays.add(d.dataset.planDay);
        else openPlanDays.delete(d.dataset.planDay);
      }),
  );
  document.querySelectorAll("[data-plan-done]").forEach(
    (x) =>
      (x.onchange = () => {
        p.done[x.dataset.planDone] = x.checked;
        save();
        renderPlan({
          topics,
          state,
          save,
          e,
          head,
          shell,
          toast,
          confirmDialog,
        });
      }),
  );
  document.querySelector("#plan-more")?.addEventListener("click", () => {
    planLimit += 14;
    renderPlan({ topics, state, save, e, head, shell, toast, confirmDialog });
  });
}
export function markedText(text, highlights, e = escapeHTML) {
  let result = "",
    at = 0;
  for (const h of [...highlights].sort((a, b) => a.start - b.start)) {
    if (h.start < at) continue;
    result +=
      e(text.slice(at, h.start)) +
      `<mark>${e(text.slice(h.start, h.end))}</mark>`;
    at = h.end;
  }
  return result + e(text.slice(at));
}
export function notebookPanel(topic, state, e = escapeHTML) {
  const n = state.notebook[topic.id] || { text: "", highlights: [] };
  return `<div class="aside-panel notebook-panel"><div class="section-title"><h3>Deine Notizen</h3><a class="small" href="#notes">Alle ansehen →</a></div><label class="field">Gedanken zu diesem Kapitel<textarea id="topic-note" maxlength="20000" placeholder="Was möchtest du dir merken? Welche Frage ist noch offen?">${e(n.text)}</textarea></label><p class="small subtle" id="note-status" role="status">Wird beim Schreiben gespeichert.</p><div class="divider"></div><h3>Text markieren</h3><p class="small subtle">Wähle Text innerhalb eines Erklärungsabsatzes aus und klicke anschließend auf „Auswahl markieren“.</p><button class="button secondary compact" id="highlight-selection">Auswahl markieren</button><div id="highlight-list"></div></div>`;
}
export function bindNotebook(topic, { state, save, toast, e = escapeHTML }) {
  const get = () => (state.notebook[topic.id] ??= { text: "", highlights: [] });
  document.querySelector("#topic-note").oninput = (ev) => {
    get().text = ev.target.value;
    save();
    document.querySelector("#note-status").textContent =
      "Notiz gespeichert · " + ev.target.value.length + " / 20.000 Zeichen";
  };
  const redraw = () => {
    const n = get();
    topic.sections.forEach((s, i) => {
      const p = document.querySelector(`[data-note-section="${i}"]`);
      if (p)
        p.innerHTML = markedText(
          s.text,
          n.highlights.filter((h) => h.section === i),
          e,
        );
    });
    document.querySelector("#highlight-list").innerHTML = n.highlights.length
      ? `<p class="small subtle">${n.highlights.length} Markierung(en)</p>${n.highlights.map((h, i) => `<div class="saved-highlight"><span>${e(h.quote)}</span><button data-remove-highlight="${i}" aria-label="Markierung entfernen">×</button></div>`).join("")}`
      : '<p class="small subtle">Noch keine Markierungen.</p>';
    document.querySelectorAll("[data-remove-highlight]").forEach(
      (b) =>
        (b.onclick = () => {
          n.highlights.splice(Number(b.dataset.removeHighlight), 1);
          save();
          redraw();
        }),
    );
  };
  const button = document.querySelector("#highlight-selection");
  button.onpointerdown = (ev) => ev.preventDefault();
  button.onmousedown = (ev) => ev.preventDefault();
  button.onclick = () => {
    const selection = window.getSelection();
    if (!selection.rangeCount || selection.isCollapsed) {
      toast("Wähle zuerst Text in einem Erklärungsabsatz aus.");
      return;
    }
    const range = selection.getRangeAt(0),
      startElement =
        range.startContainer.nodeType === Node.ELEMENT_NODE
          ? range.startContainer
          : range.startContainer.parentElement,
      p = startElement.closest("[data-note-section]");
    if (!p || !p.contains(range.endContainer)) {
      toast(
        "Bitte Text innerhalb eines einzelnen Erklärungsabsatzes auswählen.",
      );
      return;
    }
    const section = Number(p.dataset.noteSection),
      before = range.cloneRange();
    before.selectNodeContents(p);
    before.setEnd(range.startContainer, range.startOffset);
    const start = before.toString().length,
      end = start + range.toString().length,
      n = get(),
      same = n.highlights.filter((h) => h.section === section);
    n.highlights = [
      ...n.highlights.filter((h) => h.section !== section),
      ...mergeHighlights(topic.sections[section].text, same, start, end).map(
        (h) => ({ ...h, section }),
      ),
    ].sort((a, b) => a.section - b.section || a.start - b.start);
    save();
    selection.removeAllRanges();
    redraw();
    toast("Textstelle markiert.");
  };
  redraw();
}
export function renderNotebook({ topics, state, e, head, shell }) {
  shell(
    `${head("DEIN PERSÖNLICHES HEFT", "Gedanken festhalten. Zusammenhänge behalten.", "Alle Kapitelnotizen und markierten Textstellen an einem Ort.")}<div class="filters"><label class="field">Notizen und Markierungen durchsuchen<input id="notes-search" type="search" placeholder="Stichwort eingeben …"></label><label class="field">Thema<select id="notes-topic"><option value="">Alle Themen</option>${topics.map((t) => `<option value="${t.id}">${e(t.title)}</option>`).join("")}</select></label></div><div id="notes-list"></div>`,
    "notes",
  );
  const draw = () => {
    const s = document
        .querySelector("#notes-search")
        .value.toLocaleLowerCase("de"),
      filter = document.querySelector("#notes-topic").value,
      list = topics.filter((t) => {
        const n = state.notebook[t.id];
        return (
          (!filter || filter === t.id) &&
          n &&
          (n.text.trim() || n.highlights.length) &&
          JSON.stringify([n.text, n.highlights.map((h) => h.quote), t.title])
            .toLocaleLowerCase("de")
            .includes(s)
        );
      });
    document.querySelector("#notes-list").innerHTML = list.length
      ? list
          .map((t) => {
            const n = state.notebook[t.id];
            return `<article class="panel"><div class="section-title"><h2>${e(t.title)}</h2><a class="button secondary compact" href="#learn/${t.id}">Im Kapitel bearbeiten →</a></div>${n.text ? `<p class="note-text">${e(n.text)}</p>` : ""}${n.highlights.map((h) => `<blockquote class="note-quote"><span>${e(h.quote)}</span><small>${e(t.sections[h.section].heading)}</small></blockquote>`).join("")}</article>`;
          })
          .join("")
      : '<div class="empty">Keine passenden Notizen. Öffne ein Lernkapitel, um Gedanken aufzuschreiben oder Text zu markieren.</div>';
  };
  document.querySelector("#notes-search").oninput = draw;
  document.querySelector("#notes-topic").onchange = draw;
  draw();
}
const revealedOperators = new Set();
let selectedTask = "";
export function renderOperators(data, ctx) {
  const { state, save, e, head, shell, toast } = ctx,
    o =
      data.operators.find((x) => x.id === state.operators.selected) ||
      data.operators[0],
    tasks = data.tasks.filter((t) => t.operator === o.id),
    task = tasks.find((t) => t.id === selectedTask) || tasks[0];
  selectedTask = task.id;
  const record = state.operators,
    scored = record.scores[task.id] !== undefined,
    revealed = revealedOperators.has(task.id) || scored,
    checks = (record.checks[task.id] ??= []);
  shell(
    `${head("OPERATORWERKSTATT", "Nicht nur wissen. Passend antworten.", `${Object.keys(record.scores).length} / ${data.tasks.length} Aufgaben selbst bewertet.`)}<div class="operator-tabs">${data.operators.map((x) => `<button data-operator="${x.id}" class="${x.id === o.id ? "selected" : ""}">${x.label}</button>`).join("")}</div><div class="reading-grid"><section><div class="panel"><span class="eyebrow">${e(o.label)}</span><h2 style="margin-top:10px">${e(o.definition)}</h2><ol class="operator-steps">${o.steps.map((s) => `<li>${e(s)}</li>`).join("")}</ol><div class="callout">Typischer Stolperstein: ${e(o.pitfall)}</div><p class="small subtle">Der Anforderungsbereich hängt von Material und Aufgabe ab.</p></div><div class="panel"><div class="filters"><label class="field">Übungsaufgabe<select id="operator-task">${tasks.map((x, i) => `<option value="${x.id}" ${x.id === task.id ? "selected" : ""}>${o.label} · Aufgabe ${i + 1}</option>`).join("")}</select></label></div><p class="operator-context">${e(task.context)}</p><h2>${e(task.prompt)}</h2><label class="field">Deine Antwort<textarea id="operator-answer" maxlength="12000" ${scored ? "disabled" : ""} placeholder="Nutze die Arbeitsschritte des Operators …">${e(record.answers[task.id] || "")}</textarea></label>${revealed ? `<div class="feedback"><h3>Musterlösung</h3><p>${e(task.model)}</p>${rubricHTML(task.rubric, checks, task.id, scored)}<p class="small subtle">Fachquelle: ${e(task.source)}</p>${scored ? `<strong>${record.scores[task.id]} / ${task.rubric.length} Punkte gespeichert</strong><br><button class="button secondary compact" id="operator-retry" style="margin-top:12px">Aufgabe erneut üben</button>` : '<button class="button" id="operator-save">Bewertung speichern</button>'}</div>` : '<button class="button" id="operator-reveal" style="margin-top:16px">Mit Musterlösung vergleichen</button>'}</div></section><aside class="sticky"><div class="aside-panel"><h3>Was unterscheidet die Operatoren?</h3>${data.operators.map((x) => `<p><strong>${x.label}</strong><br>${e(x.definition)}</p>`).join("")}</div><div class="aside-panel"><h3>Offizielle Grundlagen</h3>${data.sources.map((s) => `<p class="small"><a href="${e(s.url)}" target="_blank" rel="noopener">${e(s.label)} ↗</a></p>`).join("")}<p>${e(data.note)}</p></div></aside></div>`,
    "operators",
  );
  document.querySelectorAll("[data-operator]").forEach(
    (b) =>
      (b.onclick = () => {
        record.selected = b.dataset.operator;
        save();
        renderOperators(data, ctx);
      }),
  );
  document.querySelector("#operator-task").onchange = (ev) => {
    selectedTask = ev.target.value;
    renderOperators(data, ctx);
  };
  document.querySelector("#operator-answer").oninput = (ev) => {
    record.answers[task.id] = ev.target.value;
    save();
  };
  if (!revealed)
    document.querySelector("#operator-reveal").onclick = () => {
      if (!record.answers[task.id]?.trim()) {
        toast("Formuliere zuerst deine eigene Antwort.");
        return;
      }
      revealedOperators.add(task.id);
      renderOperators(data, ctx);
    };
  if (revealed && !scored) {
    bindRubric(
      document.querySelector(`[data-rubric="${task.id}"]`),
      task.rubric,
      checks,
      save,
    );
    document.querySelector("#operator-save").onclick = () => {
      record.scores[task.id] = countCriteria(checks);
      save();
      renderOperators(data, ctx);
      toast("Operatorenaufgabe bewertet.");
    };
  }
  document.querySelector("#operator-retry")?.addEventListener("click", () => {
    delete record.scores[task.id];
    record.checks[task.id] = [];
    revealedOperators.delete(task.id);
    save();
    renderOperators(data, ctx);
  });
}
