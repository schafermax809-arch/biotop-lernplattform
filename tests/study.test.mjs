import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  dailyQuestions,
  reviewStatus,
  restorePractice,
} from "../src/study-engine.js";
import { freshState, recordAnswer, importState } from "../src/engine.js";
const topics = JSON.parse(
  await readFile(new URL("../src/content.json", import.meta.url), "utf8"),
);
const qs = topics.flatMap((t) => t.questions);
const DAY = 86400000,
  now = Date.UTC(2026, 9, 20, 12);

test("Tagestraining verbindet Fehler, verzögerte Wiederholung und Transfer ohne Duplikate", () => {
  const state = freshState();
  state.answers[qs[0].id] = { lastCorrect: false, at: now };
  state.answers[qs[15].id] = { lastCorrect: true, at: now - 8 * DAY };
  const chosen = dailyQuestions(qs, state, now);
  assert.equal(chosen.length, 8);
  assert.equal(new Set(chosen.map((q) => q.id)).size, 8);
  assert.ok(chosen.some((q) => q.id === qs[0].id));
  assert.ok(chosen.some((q) => q.id === qs[15].id));
  assert.ok(
    chosen.some((q) => q.afb >= 2 && ["open", "diagram"].includes(q.type)),
  );
  assert.ok(new Set(chosen.map((q) => q.topic)).size >= 6);
  for (const topic of topics)
    state.answers[topic.questions[0].id] = { lastCorrect: false, at: now };
  const openError = qs.find((q) => q.type === "open");
  state.answers[openError.id] = { lastCorrect: false, at: now };
  assert.equal(
    dailyQuestions(qs, state, now).filter(
      (q) => !state.answers[q.id]?.lastCorrect && state.answers[q.id],
    ).length,
    3,
  );
  for (const q of qs) state.answers[q.id] = { lastCorrect: false, at: now };
  assert.equal(dailyQuestions(qs, state, now).length, 8);
  assert.deepEqual(dailyQuestions([], state, now), []);
});

test("Einmaliger Erfolg, Abstand und erneuter Fehler werden getrennt bewertet", (t) => {
  t.mock.method(Date, "now", () => now);
  const state = freshState(),
    q = qs[0];
  recordAnswer(state, q, q.points);
  assert.equal(reviewStatus(state.answers[q.id], now), "once");
  recordAnswer(state, q, q.points);
  assert.equal(state.answers[q.id].successDays, 1);
  Date.now.mock.mockImplementation(() => now + DAY);
  recordAnswer(state, q, q.points);
  assert.equal(reviewStatus(state.answers[q.id], now + DAY), "secure");
  assert.equal(reviewStatus(state.answers[q.id], now + 8 * DAY), "due");
  const imported = importState(JSON.parse(JSON.stringify(state)), topics);
  assert.equal(imported.answers[q.id].successDays, 2);
  recordAnswer(state, q, 0);
  assert.equal(reviewStatus(state.answers[q.id], now + DAY), "error");
  assert.equal(state.answers[q.id].successDays, 0);
  assert.equal(reviewStatus(undefined, now), "new");
});

test("Gesichertes Training behält Entwurf, Reihenfolge und unbewertete Kriterien", () => {
  const open = qs.find((q) => q.type === "open"),
    order = qs.find((q) => q.type === "order");
  const raw = {
    qids: [open.id, order.id],
    index: 0,
    label: "Test",
    values: { [open.id]: "Mein Entwurf" },
    graded: { [open.id]: { revealed: true } },
    criteria: { [open.id]: [true] },
    options: {},
    orders: { [order.id]: [...order.answer].reverse() },
  };
  const clean = restorePractice(JSON.parse(JSON.stringify(raw)), qs);
  assert.equal(clean.values[open.id], "Mein Entwurf");
  assert.equal(clean.graded[open.id].score, undefined);
  assert.equal(clean.criteria[open.id][0], true);
  assert.deepEqual(clean.orders[order.id], raw.orders[order.id]);
  assert.equal(restorePractice({ ...raw, finished: true }, qs), null);
  assert.equal(restorePractice({ ...raw, index: 2 }, qs), null);
  assert.equal(restorePractice({ ...raw, qids: ["fremd"] }, qs), null);
  assert.equal(restorePractice({ ...raw, qids: [open.id, open.id] }, qs), null);
});
