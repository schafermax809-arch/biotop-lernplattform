export function localDay(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function validDay(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const date = new Date(value + "T12:00:00Z");
  return (
    Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}
export function dayDistance(from, to) {
  return Math.round(
    (Date.parse(to + "T12:00:00Z") - Date.parse(from + "T12:00:00Z")) /
      86400000,
  );
}
export function addDays(day, amount) {
  return new Date(Date.parse(day + "T12:00:00Z") + amount * 86400000)
    .toISOString()
    .slice(0, 10);
}
export function taskHref(item) {
  return item.type === "read"
    ? `#learn/${item.topic}`
    : item.type === "practice"
      ? `#train/${item.topic}`
      : item.type === "cards"
        ? `#cards/${item.topic}`
        : "#operators";
}
export function createPlan(
  topics,
  state,
  examDate,
  minutes,
  today = localDay(),
) {
  if (!validDay(examDate) || !validDay(today))
    throw Error("Bitte ein gültiges Datum auswählen.");
  const distance = dayDistance(today, examDate);
  if (distance < 0 || distance > 365)
    throw Error("Wähle einen Klausurtermin zwischen heute und in einem Jahr.");
  if (!Number.isInteger(minutes) || minutes < 5 || minutes > 180)
    throw Error("Wähle täglich 5 bis 180 Minuten.");
  const ranked = topics
    .map((t, i) => {
      const mastered =
        t.questions.filter((q) => state.answers[q.id]?.lastCorrect).length /
        t.questions.length;
      const wrong = t.questions.filter(
        (q) => state.answers[q.id] && !state.answers[q.id].lastCorrect,
      ).length;
      return {
        t,
        priority:
          wrong * 3 + (1 - mastered) * 5 + (state.read.includes(t.id) ? 0 : 2),
        i,
      };
    })
    .sort((a, b) => b.priority - a.priority || a.i - b.i);
  const covered = new Set();
  let cursor = 0,
    topicCursor = 0;
  const days = Array.from({ length: Math.max(1, distance) }, (_, d) => {
    const date = addDays(today, d),
      items = [];
    let remaining = minutes;
    while (remaining >= 5) {
      const position = cursor++,
        { t } = ranked[topicCursor % ranked.length];
      let type =
        !state.read.includes(t.id) && !covered.has(t.id)
          ? "read"
          : position % 4 === 3
            ? "cards"
            : "practice";
      if (position % 7 === 6) type = "operators";
      else topicCursor++;
      const desired =
        type === "read"
          ? 8
          : type === "practice"
            ? 10
            : type === "cards"
              ? 5
              : 7;
      const duration = Math.min(desired, remaining);
      if (type === "read") covered.add(t.id);
      const label =
        type === "read"
          ? "Kapitel verstehen"
          : type === "practice"
            ? "Gezielt Aufgaben lösen"
            : type === "cards"
              ? "Begriffe wiederholen"
              : "Operatoren anwenden";
      items.push({
        id: `${date}:${type}:${t.id}:${items.length}`,
        type,
        topic: t.id,
        minutes: duration,
        label,
      });
      remaining -= duration;
    }
    return { date, items };
  });
  return { examDate, minutes, startDate: today, days, done: {} };
}
export function mergeHighlights(text, highlights, start, end) {
  if (
    !Number.isInteger(start) ||
    !Number.isInteger(end) ||
    start < 0 ||
    end <= start ||
    end > text.length
  )
    return highlights;
  const ranges = [
    ...highlights.map((h) => ({ start: h.start, end: h.end })),
    { start, end },
  ].sort((a, b) => a.start - b.start);
  const merged = [];
  for (const r of ranges) {
    const previous = merged.at(-1);
    if (previous && r.start <= previous.end)
      previous.end = Math.max(previous.end, r.end);
    else merged.push({ ...r });
  }
  return merged.map((r) => ({ ...r, quote: text.slice(r.start, r.end) }));
}
export const countCriteria = (checks) =>
  Array.isArray(checks) ? checks.filter((x) => x === true).length : 0;
export function cleanExtras(raw, clean, topics) {
  const tm = new Map(topics.map((t) => [t.id, t]));
  clean.notebook = {};
  for (const [id, note] of Object.entries(raw.notebook || {})) {
    const t = tm.get(id);
    if (!t || !note || typeof note !== "object") continue;
    const highlights = [];
    for (const h of (Array.isArray(note.highlights)
      ? note.highlights
      : []
    ).slice(0, 200)) {
      if (!Number.isInteger(h?.section) || !t.sections[h.section]) continue;
      const text = t.sections[h.section].text;
      if (
        !Number.isInteger(h.start) ||
        !Number.isInteger(h.end) ||
        h.start < 0 ||
        h.end <= h.start ||
        h.end > text.length
      )
        continue;
      highlights.push({
        section: h.section,
        start: h.start,
        end: h.end,
        quote: text.slice(h.start, h.end),
      });
    }
    clean.notebook[id] = {
      text: String(note.text || "").slice(0, 20000),
      highlights,
    };
  }
  clean.planner = null;
  const p = raw.planner;
  if (
    p &&
    validDay(p.examDate) &&
    validDay(p.startDate) &&
    Number.isInteger(p.minutes) &&
    p.minutes >= 5 &&
    p.minutes <= 180 &&
    Array.isArray(p.days)
  ) {
    const days = p.days
      .slice(0, 366)
      .filter((d) => validDay(d?.date) && Array.isArray(d.items))
      .map((d) => ({
        date: d.date,
        items: d.items
          .slice(0, 36)
          .filter(
            (i) =>
              i &&
              tm.has(i.topic) &&
              ["read", "practice", "cards", "operators"].includes(i.type) &&
              Number.isInteger(i.minutes) &&
              i.minutes >= 1 &&
              i.minutes <= 180,
          )
          .map((i, index) => ({
            id: `${d.date}:${i.type}:${i.topic}:${index}`,
            topic: i.topic,
            type: i.type,
            minutes: i.minutes,
            label: {
              read: "Kapitel verstehen",
              practice: "Gezielt Aufgaben lösen",
              cards: "Begriffe wiederholen",
              operators: "Operatoren anwenden",
            }[i.type],
          })),
      }));
    const ids = new Set(days.flatMap((d) => d.items.map((i) => i.id)));
    clean.planner = {
      examDate: p.examDate,
      startDate: p.startDate,
      minutes: p.minutes,
      days,
      done: Object.fromEntries(
        Object.entries(p.done || {}).filter(
          ([id, v]) => ids.has(id) && v === true,
        ),
      ),
    };
  }
  clean.operators = { answers: {}, checks: {}, scores: {}, selected: "nennen" };
  const allowed =
    /^op-(nennen|beschreiben|erklaeren|vergleichen|analysieren|beurteilen)-0[12]$/;
  for (const [id, text] of Object.entries(raw.operators?.answers || {}))
    if (allowed.test(id) && typeof text === "string")
      clean.operators.answers[id] = text.slice(0, 12000);
  for (const [id, checks] of Object.entries(raw.operators?.checks || {}))
    if (allowed.test(id) && Array.isArray(checks))
      clean.operators.checks[id] = checks.slice(0, 10).map((x) => x === true);
  for (const [id, score] of Object.entries(raw.operators?.scores || {}))
    if (allowed.test(id) && Number.isInteger(score) && score >= 0 && score <= 4)
      clean.operators.scores[id] = Math.min(
        score,
        id.startsWith("op-nennen") ? 3 : 4,
      );
  if (
    [
      "nennen",
      "beschreiben",
      "erklaeren",
      "vergleichen",
      "analysieren",
      "beurteilen",
    ].includes(raw.operators?.selected)
  )
    clean.operators.selected = raw.operators.selected;
  clean.labProgress = {};
  for (const id of ["sandbox", "domino", "niche", "hunt"]) {
    const x = raw.labProgress?.[id];
    if (!x || typeof x !== "object") continue;
    const records = {};
    for (const [key, value] of Object.entries(x.records || {}).slice(0, 300))
      if (/^[a-zA-Z0-9_-]{1,80}$/.test(key) && typeof value === "boolean")
        records[key] = value;
    clean.labProgress[id] = { records };
  }
  return clean;
}
// Qualitative dependencies only. No invented growth rates or measured O2 values.
export function sandboxEffects({
  light = 50,
  temp = 15,
  turbidity = 30,
  vegetation = 50,
}) {
  const lightEffects = [
    Math.sign(light - 50),
    -Math.sign(turbidity - 30),
    -Math.sign(vegetation - 50),
  ].filter(Boolean);
  const direction =
    lightEffects.some((x) => x > 0) && lightEffects.some((x) => x < 0)
      ? "mixed"
      : lightEffects[0] > 0
        ? "up"
        : lightEffects[0] < 0
          ? "down"
          : "same";
  return {
    light: direction,
    photosynthesis: direction,
    solubility: temp > 15 ? "down" : temp < 15 ? "up" : "same",
    leaves: vegetation > 50 ? "up" : vegetation < 50 ? "down" : "same",
  };
}
export const webNodes = [
  "Eichenblatt",
  "Frostspannerraupe",
  "Zilpzalp",
  "Sperber",
  "Beeren",
  "Samen",
];
export const webEdges = [
  [0, 1],
  [1, 2],
  [2, 3],
  [4, 2],
  [5, 2],
];
export function dominoEffects(node, event = "down") {
  const opposite = event === "down" ? "up" : "down";
  return webEdges
    .flatMap(([food, eater]) =>
      food === node
        ? [{ target: eater, kind: "food", direction: event }]
        : eater === node
          ? [{ target: food, kind: "pressure", direction: event }]
          : [],
    )
    .map((x) => ({
      ...x,
      population: x.kind === "food" ? x.direction : opposite,
    }));
}
export function nicheRange(competition) {
  return {
    chthamalus: competition ? "upper" : "all",
    semibalanus: competition ? "lower" : "absent",
    reason: competition
      ? "Konkurrenz begrenzt Chthamalus in tieferen Bereichen."
      : "Ohne Semibalanus kann Chthamalus auch tiefere grundsätzlich geeignete Bereiche besiedeln.",
  };
}
