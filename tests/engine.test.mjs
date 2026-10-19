import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  freshState,
  validate,
  recordAnswer,
  topicStats,
  scheduleCard,
  balancedExam,
  importState,
  shuffle,
} from "../src/engine.js";
const topics = JSON.parse(
  await readFile(new URL("../src/content.json", import.meta.url), "utf8"),
);
const questions = topics.flatMap((t) => t.questions);
test("Alle zehn Themen enthalten je 15 gültige, eindeutig identifizierte Aufgaben", () => {
  assert.equal(topics.length, 10);
  assert.equal(questions.length, 150);
  assert.equal(new Set(questions.map((q) => q.id)).size, 150);
  for (const t of topics) {
    assert.equal(t.questions.length, 15);
    assert.ok(t.sections.length >= 3);
    assert.ok(t.sources.length);
    for (const q of t.questions) {
      assert.equal(q.topic, t.id);
      assert.ok([1, 2, 3].includes(q.afb));
      assert.ok(["leicht", "mittel", "schwer"].includes(q.difficulty));
      assert.ok(Number.isInteger(q.points) && q.points > 0);
      assert.ok(q.prompt && q.explanation && q.source);
      if (["single", "tf", "multi"].includes(q.type)) {
        assert.ok(q.options.length >= 2);
        for (const a of Array.isArray(q.answer) ? q.answer : [q.answer])
          assert.ok(q.options.includes(a), q.id);
      }
      if (["open", "diagram"].includes(q.type)) {
        assert.ok(q.model);
        assert.ok(q.rubric?.length);
      }
      if (q.type === "diagram") {
        assert.equal(q.diagram.labels.length, q.diagram.values.length);
        assert.ok(q.diagram.values.every(Number.isFinite));
      }
    }
  }
});
test("Alle objektiven Musterantworten werden anerkannt; falsche und leere Antworten abgewiesen", () => {
  for (const q of questions) {
    if (["open", "diagram"].includes(q.type)) {
      assert.equal(validate(q, "beliebiger Freitext"), null);
      continue;
    }
    const correct =
      q.type === "match"
        ? Object.fromEntries(q.pairs)
        : q.type === "cloze"
          ? q.answer[0]
          : q.answer;
    assert.equal(validate(q, correct), true, q.id);
    assert.equal(
      validate(
        q,
        q.type === "multi" || q.type === "order"
          ? []
          : q.type === "match"
            ? {}
            : "unpassend",
      ),
      false,
      q.id,
    );
    if (q.type === "multi") assert.equal(validate(q, q.options), false, q.id);
    if (q.type === "order")
      assert.equal(validate(q, [...q.answer, "Extra"]), false, q.id);
  }
});
test("Begriffsantworten akzeptieren Großschreibung und Leerraum", () => {
  const q = questions.find((q) => q.type === "cloze");
  assert.equal(validate(q, "  " + q.answer[0].toUpperCase() + "  "), true);
});
test("Fehlertraining folgt dem letzten Ergebnis, Antwortzähler bewahren den Verlauf", () => {
  const state = freshState(),
    q = topics[0].questions[0];
  recordAnswer(state, q, 0);
  assert.equal(state.answers[q.id].lastCorrect, false);
  recordAnswer(state, q, q.points);
  assert.equal(state.answers[q.id].attempts, 2);
  assert.equal(state.answers[q.id].correct, 1);
  assert.equal(state.answers[q.id].lastCorrect, true);
  assert.equal(topicStats(state, topics[0]).mastered, 1);
  recordAnswer(state, q, 0);
  assert.equal(topicStats(state, topics[0]).mastered, 0);
});
test("Selbstbewertungen werden auf die mögliche Punktzahl begrenzt", () => {
  const state = freshState(),
    q = questions[0];
  assert.equal(recordAnswer(state, q, 999), q.points);
  assert.equal(recordAnswer(state, q, -1), 0);
});
test("Spaced repetition: wiederholtes Können verlängert, Unsicherheit verkürzt das Intervall", () => {
  const now = 100000,
    first = scheduleCard(null, "know", now),
    second = scheduleCard(first, "know", now);
  assert.equal(first.due - now, 86400000);
  assert.equal(second.due - now, 3 * 86400000);
  assert.equal(scheduleCard(second, "unsure", now).due - now, 86400000);
  assert.equal(scheduleCard(second, "no", now).due, now);
  assert.equal(scheduleCard(second, "no", now).streak, 0);
});
test("Klausurpool verteilt Fragen ausgewogen ohne Duplikate", () => {
  for (let i = 0; i < 30; i++) {
    for (const n of [10, 20]) {
      const qs = balancedExam(topics, n);
      assert.equal(qs.length, n);
      assert.equal(new Set(qs.map((q) => q.id)).size, n);
      for (const t of topics)
        assert.equal(qs.filter((q) => q.topic === t.id).length, n / 10);
    }
  }
});
test("JSON-Rundreise erhält echten Lernfortschritt und filtert fremde Aufgaben", () => {
  const state = freshState(),
    q = questions[0];
  recordAnswer(state, q, q.points);
  state.read = [topics[0].id, "unknown"];
  state.bookmarks = [q.id, "unknown"];
  state.cards[`${topics[0].id}-0`] = scheduleCard(null, "know");
  state.sessions = [{ at: 1, label: "Test", score: 1, max: 2 }];
  state.answers.unknown = { attempts: 1, correct: 1 };
  const clean = importState(JSON.parse(JSON.stringify(state)), topics);
  assert.equal(Object.keys(clean.answers).length, 1);
  assert.equal(clean.bookmarks.length, 1);
  assert.equal(clean.read.length, 1);
  assert.equal(Object.keys(clean.cards).length, 1);
  assert.equal(clean.sessions.length, 1);
  assert.throws(() => importState({ version: 2 }, topics));
  assert.throws(() =>
    importState(
      { version: 1, answers: [], read: [], bookmarks: [], sessions: [] },
      topics,
    ),
  );
});
test("Mischen verändert keine Einträge und mutiert das Original nicht", () => {
  const a = ["A", "B", "C", "D"],
    b = shuffle(a, () => 0.1);
  assert.deepEqual([...b].sort(), a);
  assert.deepEqual(a, ["A", "B", "C", "D"]);
  assert.notDeepEqual(a, b);
});
