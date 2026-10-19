import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { freshState, importState } from "../src/engine.js";
import {
  validDay,
  dayDistance,
  addDays,
  createPlan,
  mergeHighlights,
  countCriteria,
  sandboxEffects,
  dominoEffects,
  nicheRange,
} from "../src/tools-engine.js";
import { huntBoards } from "../src/hunt-data.js";
const topics = JSON.parse(
  await readFile(new URL("../src/content.json", import.meta.url), "utf8"),
);
const ops = JSON.parse(
  await readFile(new URL("../src/operators.json", import.meta.url), "utf8"),
);
test("Kalenderprüfung behandelt ungültige Daten und Zeitumstellung korrekt", () => {
  assert.equal(validDay("2026-02-30"), false);
  assert.equal(validDay("2026-99-99"), false);
  assert.equal(validDay("2028-02-29"), true);
  assert.equal(dayDistance("2026-10-24", "2026-10-26"), 2);
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
});
test("Lernplan hält jedes tägliche Zeitbudget ein und verteilt alle Themen", () => {
  for (const budget of [5, 17, 30, 180]) {
    const plan = createPlan(
      topics,
      freshState(),
      "2026-11-02",
      budget,
      "2026-10-19",
    );
    assert.equal(plan.days.length, 14);
    for (const day of plan.days) {
      assert.ok(day.items.length);
      assert.ok(day.items.reduce((s, x) => s + x.minutes, 0) <= budget);
      assert.ok(day.items.every((i) => i.minutes >= 5));
    }
    assert.equal(
      new Set(
        plan.days
          .flatMap((d) => d.items)
          .filter((i) => i.type !== "operators")
          .map((i) => i.topic),
      ).size,
      10,
    );
    assert.equal(
      new Set(plan.days.flatMap((d) => d.items.map((i) => i.id))).size,
      plan.days.flatMap((d) => d.items).length,
    );
  }
});
test("Lernplan priorisiert Fehler, berücksichtigt Grenzen und den Klausurtag", () => {
  const s = freshState(),
    t = topics[4];
  s.answers[t.questions[0].id] = { lastCorrect: false };
  const plan = createPlan(topics, s, "2026-10-20", 30, "2026-10-19");
  assert.equal(plan.days[0].items[0].topic, t.id);
  assert.equal(
    createPlan(topics, s, "2026-10-19", 5, "2026-10-19").days.length,
    1,
  );
  assert.throws(() => createPlan(topics, s, "2026-10-18", 30, "2026-10-19"));
  assert.throws(() => createPlan(topics, s, "2026-10-20", 181, "2026-10-19"));
});
test("Überlappende Markierungen werden zusammengeführt, ungültige Bereiche verworfen", () => {
  const text = "Ökologische Beziehungen verstehen";
  let h = mergeHighlights(text, [], 0, 11);
  h = mergeHighlights(text, h, 5, 23);
  assert.equal(h.length, 1);
  assert.equal(h[0].quote, text.slice(0, 23));
  assert.deepEqual(mergeHighlights(text, h, -1, 10), h);
});
test("Bestehende Exporte bleiben kompatibel und neue Daten überstehen Export/Import", () => {
  const s = freshState();
  s.planner = createPlan(topics, s, "2026-10-21", 30, "2026-10-19");
  const id = s.planner.days[0].items[0].id;
  s.planner.done[id] = true;
  s.notebook.levels = {
    text: "Meine Notiz <b>kein HTML</b>",
    highlights: [{ section: 0, start: 0, end: 5, quote: "manipulierter Text" }],
  };
  s.operators.answers["op-nennen-01"] = "Licht, Temperatur und Sauerstoff";
  s.operators.checks["op-nennen-01"] = [true, false, true];
  s.operators.scores["op-nennen-01"] = 2;
  s.labProgress.hunt = { records: { food_arrow: true } };
  const clean = importState(JSON.parse(JSON.stringify(s)), topics);
  assert.equal(clean.planner.done[id], true);
  assert.equal(clean.notebook.levels.text, s.notebook.levels.text);
  assert.equal(
    clean.notebook.levels.highlights[0].quote,
    topics[0].sections[0].text.slice(0, 5),
  );
  assert.equal(clean.operators.scores["op-nennen-01"], 2);
  assert.equal(clean.labProgress.hunt.records.food_arrow, true);
  const old = {
    version: 1,
    answers: {},
    cards: {},
    read: [],
    bookmarks: [],
    sessions: [],
    settings: {},
  };
  assert.deepEqual(importState(old, topics).notebook, {});
});
test("Import ignoriert fremde Notizthemen, unzulässige Markierungen und Labor-IDs", () => {
  const s = freshState();
  s.notebook.unknown = { text: "x", highlights: [] };
  s.notebook.levels = {
    text: "x",
    highlights: [
      { section: 999, start: 0, end: 2 },
      { section: 0, start: -1, end: 100 },
    ],
  };
  s.labProgress.unknown = { records: { a: true } };
  s.planner = {
    examDate: "2026-99-99",
    startDate: "2026-10-19",
    days: [],
    minutes: 30,
  };
  const c = importState(s, topics);
  assert.equal(c.notebook.unknown, undefined);
  assert.equal(c.notebook.levels.highlights.length, 0);
  assert.equal(c.labProgress.unknown, undefined);
  assert.equal(c.planner, null);
});
test("Kriterien zählen nur explizite Häkchen; alle offenen Aufgaben haben ein Kriterium je Punkt", () => {
  assert.equal(countCriteria([true, false, 1, "true", true]), 2);
  for (const q of topics.flatMap((t) => t.questions).filter((q) => q.rubric))
    assert.equal(q.rubric.length, q.points);
});
test("Sandbox unterscheidet gegenläufige Lichtwirkungen und Temperatur-Löslichkeit", () => {
  assert.equal(
    sandboxEffects({ light: 80, temp: 15, turbidity: 30, vegetation: 50 })
      .light,
    "up",
  );
  assert.equal(
    sandboxEffects({ light: 80, temp: 15, turbidity: 60, vegetation: 50 })
      .light,
    "mixed",
  );
  assert.equal(
    sandboxEffects({ light: 50, temp: 25, turbidity: 30, vegetation: 50 })
      .solubility,
    "down",
  );
  assert.equal(
    sandboxEffects({ light: 50, temp: 15, turbidity: 30, vegetation: 50 })
      .light,
    "same",
  );
});
test("Domino unterscheidet Nahrungsangebot und Fraßdruck; Nische reagiert auf Konkurrenz", () => {
  const down = dominoEffects(1, "down");
  assert.ok(
    down.some(
      (x) => x.target === 2 && x.kind === "food" && x.direction === "down",
    ),
  );
  assert.ok(
    down.some(
      (x) => x.target === 0 && x.kind === "pressure" && x.direction === "down",
    ),
  );
  assert.equal(nicheRange(true).chthamalus, "upper");
  assert.equal(nicheRange(false).chthamalus, "all");
});
test("Fehlerjagd enthält pro Schaubild drei eindeutige reparierbare Fehler", () => {
  for (const b of huntBoards) {
    assert.equal(b.items.filter((x) => !x.correct).length, 3);
    for (const x of b.items.filter((x) => !x.correct)) {
      assert.ok(x.options.includes(x.fix));
      assert.equal(x.options.filter((y) => y === x.fix).length, 1);
      assert.ok(x.reason);
    }
  }
});
test("Operatoren-Trainer enthält sechs Operatoren und zwölf bewertbare Aufgaben", () => {
  assert.equal(ops.operators.length, 6);
  assert.equal(ops.tasks.length, 12);
  for (const o of ops.operators) {
    assert.equal(ops.tasks.filter((t) => t.operator === o.id).length, 2);
    assert.ok(o.definition && o.steps.length && o.source);
  }
  for (const t of ops.tasks)
    assert.ok(t.model && t.rubric.length && t.context && t.source);
});
