const DAY = 86400000;

export function reviewStatus(answer, now = Date.now()) {
  if (!answer) return "new";
  if (!answer.lastCorrect) return "error";
  if (now - answer.at >= 7 * DAY) return "due";
  return answer.successDays >= 2 ? "secure" : "once";
}

// Include a transfer task and spread the remaining tasks over topics.
// Errors and delayed reviews come before new material; avoid an all-errors session.
export function dailyQuestions(questions, state, now = Date.now(), count = 8) {
  const priority = { error: 0, due: 1, new: 2, once: 3, secure: 4 };
  const selected = [],
    used = new Set(),
    perTopic = new Map();
  const topicIds = [...new Set(questions.map((q) => q.topic))];
  const offset = Math.floor(now / DAY) % Math.max(1, topicIds.length);
  const topicOrder = [...topicIds.slice(offset), ...topicIds.slice(0, offset)];
  const pool = [...questions].sort(
    (a, b) =>
      priority[reviewStatus(state.answers[a.id], now)] -
        priority[reviewStatus(state.answers[b.id], now)] ||
      (state.answers[a.id]?.at || 0) - (state.answers[b.id]?.at || 0) ||
      topicOrder.indexOf(a.topic) - topicOrder.indexOf(b.topic),
  );
  const add = (q) => {
    selected.push(q);
    used.add(q.id);
    perTopic.set(q.topic, (perTopic.get(q.topic) || 0) + 1);
  };
  const transfer = pool.find(
    (q) => q.afb >= 2 && ["open", "diagram"].includes(q.type),
  );
  const errorBudget =
    transfer && reviewStatus(state.answers[transfer.id], now) === "error"
      ? 2
      : 3;
  const budget = Math.min(count, questions.length);
  let limit = 1;
  while (selected.length < budget - (transfer ? 1 : 0)) {
    const next = pool.find(
      (q) =>
        !used.has(q.id) &&
        q !== transfer &&
        (perTopic.get(q.topic) || 0) < limit &&
        (reviewStatus(state.answers[q.id], now) !== "error" ||
          selected.filter(
            (x) => reviewStatus(state.answers[x.id], now) === "error",
          ).length < errorBudget),
    );
    if (next) add(next);
    else if (++limit > questions.length) break;
  }
  if (transfer && budget) add(transfer);
  for (const q of pool) if (selected.length < budget && !used.has(q.id)) add(q);
  return selected;
}

export function restorePractice(raw, questions) {
  const map = new Map(questions.map((q) => [q.id, q]));
  if (
    !raw ||
    raw.finished ||
    !Array.isArray(raw.qids) ||
    !raw.qids.length ||
    raw.qids.length > questions.length ||
    new Set(raw.qids).size !== raw.qids.length ||
    !raw.qids.every((id) => map.has(id)) ||
    !Number.isInteger(raw.index) ||
    raw.index < 0 ||
    raw.index >= raw.qids.length
  )
    return null;
  const clean = {
    qids: [...raw.qids],
    index: raw.index,
    values: {},
    graded: {},
    criteria: {},
    options: {},
    orders: {},
    label: String(raw.label || "Dein Training").slice(0, 100),
    finished: false,
  };
  const permutation = (items, expected) =>
    Array.isArray(items) &&
    items.length === expected.length &&
    new Set(items).size === items.length &&
    items.every((x) => expected.includes(x));
  for (const id of clean.qids) {
    const q = map.get(id),
      v = raw.values?.[id];
    if (
      ["single", "tf", "cloze", "open", "diagram"].includes(q.type) &&
      typeof v === "string"
    )
      clean.values[id] = v.slice(0, 12000);
    else if (q.type === "order" && permutation(v, q.answer))
      clean.values[id] = [...v];
    else if (
      q.type === "multi" &&
      Array.isArray(v) &&
      v.every((x) => typeof x === "string")
    )
      clean.values[id] = [...new Set(v.filter((x) => q.options.includes(x)))];
    else if (q.type === "match" && v && typeof v === "object")
      clean.values[id] = Object.fromEntries(
        q.pairs.map(([a]) => [a, typeof v[a] === "string" ? v[a] : ""]),
      );
    if (typeof raw.values?.[id + "-reason"] === "string")
      clean.values[id + "-reason"] = raw.values[id + "-reason"].slice(0, 12000);
    const expected =
      q.type === "match" ? q.pairs.map((x) => x[1]) : q.options || [];
    if (permutation(raw.options?.[id], expected))
      clean.options[id] = [...raw.options[id]];
    if (q.type === "order" && permutation(raw.orders?.[id], q.answer))
      clean.orders[id] = [...raw.orders[id]];
    if (Array.isArray(raw.criteria?.[id]))
      clean.criteria[id] = (q.rubric || []).map(
        (_, i) => raw.criteria[id][i] === true,
      );
    const g = raw.graded?.[id];
    if (g?.revealed === true) {
      clean.graded[id] = { revealed: true };
      if (Number.isFinite(g.score) && g.score >= 0 && g.score <= q.points)
        clean.graded[id].score = g.score;
    }
  }
  return clean;
}
