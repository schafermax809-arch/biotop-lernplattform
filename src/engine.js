import { cleanExtras } from "./tools-engine.js";
export const STORAGE_KEY = "biotop-progress-v1";
export function freshState() {
  return {
    version: 1,
    answers: {},
    cards: {},
    read: [],
    bookmarks: [],
    sessions: [],
    lastTopic: null,
    settings: { sound: false },
    activeExam: null,
    planner: null,
    notebook: {},
    operators: { answers: {}, checks: {}, scores: {}, selected: "nennen" },
    labProgress: {},
  };
}
export const normalize = (s) =>
  String(s ?? "")
    .normalize("NFKC")
    .trim()
    .toLocaleLowerCase("de")
    .replace(/[.!?]+$/, "")
    .replace(/\s+/g, " ");
export function shuffle(items, random = Math.random) {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function validate(q, value) {
  if (q.type === "single" || q.type === "tf")
    return normalize(value) === normalize(q.answer);
  if (q.type === "multi") {
    return (
      Array.isArray(value) &&
      value.length === q.answer.length &&
      q.answer.every((x) => value.includes(x))
    );
  }
  if (q.type === "cloze")
    return (Array.isArray(q.answer) ? q.answer : [q.answer]).some(
      (x) => normalize(x) === normalize(value),
    );
  if (q.type === "order")
    return (
      Array.isArray(value) &&
      value.length === q.answer.length &&
      q.answer.every((x, i) => x === value[i])
    );
  if (q.type === "match") return q.pairs.every(([a, b]) => value?.[a] === b);
  return null;
}
export function recordAnswer(state, q, score) {
  const prev = state.answers[q.id] || { attempts: 0, correct: 0 };
  const points = Math.max(0, Math.min(q.points, Number(score) || 0));
  state.answers[q.id] = {
    attempts: prev.attempts + 1,
    correct: prev.correct + (points === q.points ? 1 : 0),
    lastCorrect: points === q.points,
    score: points,
    max: q.points,
    at: Date.now(),
  };
  state.lastTopic = q.topic;
  return points;
}
export function topicStats(state, topic) {
  const done = topic.questions.filter((q) => state.answers[q.id]);
  const mastered = topic.questions.filter(
    (q) => state.answers[q.id]?.lastCorrect,
  );
  return {
    done: done.length,
    mastered: mastered.length,
    total: topic.questions.length,
    percent: Math.round((mastered.length / topic.questions.length) * 100) || 0,
  };
}
export function scheduleCard(previous, rating, now = Date.now()) {
  const streak = rating === "know" ? (previous?.streak || 0) + 1 : 0;
  const days =
    rating === "no"
      ? 0
      : rating === "unsure"
        ? 1
        : Math.min(60, [1, 3, 7, 14, 30, 60][Math.min(streak - 1, 5)]);
  return { rating, streak, due: now + days * 86400000, reviewed: now };
}
export function balancedExam(topics, count = 10) {
  const pools = topics.map((t) =>
    shuffle(
      t.questions.filter(
        (q) =>
          q.afb >= 2 && ["open", "diagram", "order", "match"].includes(q.type),
      ),
    ),
  );
  const selected = [];
  for (let round = 0; selected.length < count; round++) {
    let added = false;
    for (const p of shuffle(pools)) {
      if (p[round]) {
        selected.push(p[round]);
        added = true;
        if (selected.length === count) break;
      }
    }
    if (!added) break;
  }
  return selected;
}
export function importState(value, topics) {
  if (
    !value ||
    value.version !== 1 ||
    typeof value.answers !== "object" ||
    !value.answers ||
    Array.isArray(value.answers) ||
    !Array.isArray(value.read) ||
    !Array.isArray(value.bookmarks) ||
    !Array.isArray(value.sessions)
  )
    throw Error(
      "Dieses Format wird nicht unterstützt. Bitte eine Biotop-Exportdatei auswählen.",
    );
  const clean = freshState();
  const qs = new Map(topics.flatMap((t) => t.questions.map((q) => [q.id, q])));
  const ts = new Set(topics.map((t) => t.id));
  for (const [id, a] of Object.entries(value.answers)) {
    if (
      qs.has(id) &&
      a &&
      Number.isFinite(a.attempts) &&
      Number.isFinite(a.correct) &&
      a.attempts >= 1 &&
      a.correct >= 0 &&
      a.correct <= a.attempts
    ) {
      const q = qs.get(id);
      clean.answers[id] = {
        attempts: Math.floor(a.attempts),
        correct: Math.floor(a.correct),
        lastCorrect: a.lastCorrect === true,
        score: Math.max(0, Math.min(q.points, Number(a.score) || 0)),
        max: q.points,
        at: Number(a.at) || Date.now(),
      };
    }
  }
  clean.read = [...new Set(value.read.filter((x) => ts.has(x)))];
  clean.bookmarks = [...new Set(value.bookmarks.filter((x) => qs.has(x)))];
  clean.sessions = value.sessions
    .filter(
      (x) =>
        x &&
        Number.isFinite(x.score) &&
        Number.isFinite(x.max) &&
        x.max > 0 &&
        x.score >= 0 &&
        x.score <= x.max,
    )
    .slice(-100)
    .map((x) => ({
      at: Number(x.at) || Date.now(),
      score: x.score,
      max: x.max,
      label: String(x.label || "Lernsitzung").slice(0, 100),
    }));
  const cardIds = new Set(
    topics.flatMap((t) => t.terms.map((_, i) => `${t.id}-${i}`)),
  );
  for (const [id, c] of Object.entries(value.cards || {})) {
    if (
      cardIds.has(id) &&
      c &&
      ["know", "unsure", "no"].includes(c.rating) &&
      Number.isFinite(c.due)
    )
      clean.cards[id] = {
        rating: c.rating,
        streak: Math.max(0, Math.min(100, Number(c.streak) || 0)),
        due: c.due,
        reviewed: Number(c.reviewed) || Date.now(),
      };
  }
  clean.lastTopic = ts.has(value.lastTopic) ? value.lastTopic : null;
  clean.settings.sound = value.settings?.sound === true;
  return cleanExtras(value, clean, topics);
}
