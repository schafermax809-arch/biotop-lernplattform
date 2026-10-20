/* Optional: npm install --no-save playwright; BROWSER_CHANNEL=msedge node tests/browser.cjs */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const topics = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../src/content.json"), "utf8"),
);
const questions = topics.flatMap((t) => t.questions);
const base = process.env.TEST_URL || "http://127.0.0.1:4173";
const shots = process.env.QA_DIR;
(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.BROWSER_CHANNEL
      ? { channel: process.env.BROWSER_CHANNEL }
      : {}),
  });
  const page = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
    }),
    errors = [];
  page.on("pageerror", (err) => errors.push(err.message));
  const go = async (hash) => {
    await page.goto(base + "/#" + hash);
    await page.waitForSelector(".page-head");
  };
  const current = async () => {
    const prompt = await page.locator(".question h2").innerText();
    const q = questions.find((q) => q.prompt === prompt);
    assert.ok(q, prompt);
    return q;
  };
  const solve = async (q, correct = true) => {
    if (["single", "tf"].includes(q.type)) {
      const value = correct ? q.answer : q.options.find((x) => x !== q.answer);
      await page.locator("[name=answer]").evaluateAll((nodes, value) => {
        nodes.find((x) => x.value === value).click();
      }, value);
    } else if (q.type === "multi") {
      for (const v of correct
        ? q.answer
        : [q.options.find((x) => !q.answer.includes(x))])
        await page
          .locator("[name=answer]")
          .evaluateAll(
            (nodes, value) => nodes.find((x) => x.value === value).click(),
            v,
          );
    } else if (q.type === "cloze")
      await page
        .locator("#answer-text")
        .fill(correct ? q.answer[0] : "unpassend");
    else if (q.type === "match") {
      for (const [l, r] of q.pairs)
        await page.locator("[data-pair]").evaluateAll(
          (nodes, pair) => {
            const s = nodes.find((x) => x.dataset.pair === pair[0]);
            s.value = pair[1];
            s.dispatchEvent(new Event("change", { bubbles: true }));
          },
          [l, r],
        );
    } else if (q.type === "order") {
      for (let i = 0; i < q.answer.length; i++) {
        let arr = await page.locator(".order-item>span").allInnerTexts();
        let j = arr.indexOf(q.answer[i]);
        while (j > i) {
          await page.locator(`[data-move="${j}"][data-dir="-1"]`).click();
          j--;
        }
      }
    } else
      await page
        .locator("#answer-text")
        .fill("Eigene fachliche Antwort zum Vergleich: " + q.model);
  };
  const stored = () =>
    page.evaluate(() => JSON.parse(localStorage.getItem("biotop-progress-v1")));
  try {
    await go("dashboard");
    assert.equal(await page.locator(".topic-card").count(), 10);
    assert.ok(
      (await page.locator("body").innerText()).includes("150 Aufgaben"),
    );
    console.log("PASS Dashboard: 10 Themen, echte Anfangswerte");
    for (const type of [
      "single",
      "multi",
      "tf",
      "cloze",
      "order",
      "match",
      "open",
      "diagram",
    ]) {
      await go("practice");
      await page.selectOption("#practice-type", type);
      await page.click("#practice-start");
      if (await page.locator("#dialog-ok").isVisible())
        await page.click("#dialog-ok");
      await page.waitForSelector(".question h2");
      const q = await current();
      await solve(q);
      await page.click("#check-answer");
      await page.waitForSelector(".feedback");
      if (["open", "diagram"].includes(type)) {
        for (const input of await page.locator(".rubric-checklist input").all())
          await input.check();
        await page.click("#save-self");
      }
      assert.equal((await stored()).answers[q.id].lastCorrect, true);
      console.log("PASS Aufgabenform:", type, q.id);
    }
    await go("practice");
    await page.selectOption("#practice-type", "single");
    await page.click("#practice-start");
    if (await page.locator("#dialog-ok").isVisible())
      await page.click("#dialog-ok");
    let q = await current();
    await page.click("#bookmark");
    await solve(q, false);
    await page.click("#check-answer");
    assert.equal((await stored()).answers[q.id].lastCorrect, false);
    await page.reload();
    await page.waitForSelector(".page-head");
    await go("practice");
    await page.click("#error-start");
    if (await page.locator("#dialog-ok").isVisible())
      await page.click("#dialog-ok");
    assert.ok((await current()).id);
    await page.click("#end-run");
    await page.click("#dialog-ok");
    await page.waitForSelector(".score-ring");
    console.log(
      "PASS Falschantwort, Lesezeichen, Fehlertraining, Sitzungsstatistik",
    );
    await go("cards");
    await page.click("#flip-card");
    await page.locator("[data-rating=know]").click();
    assert.equal(Object.keys((await stored()).cards).length, 1);
    await page.reload();
    await page.waitForSelector(".page-head");
    assert.equal(Object.keys((await stored()).cards).length, 1);
    console.log("PASS Karteikarten & Wiederholung speichern");
    for (const lab of [
      "ecosystem",
      "factors",
      "river",
      "foodweb",
      "spiral",
      "rules",
      "relations",
    ]) {
      await go("labs/" + lab);
      await page.waitForSelector("#lab");
      if (lab === "ecosystem") {
        await page.fill(
          "#eco-reason",
          "Biotop, Biozönose und ihre Wechselwirkungen sind beschrieben.",
        );
        await page.click("[data-eco=yes]");
        assert.ok(
          (await page.locator(".lab-feedback").innerText()).includes("Richtig"),
        );
      }
      if (lab === "factors") {
        await page.click("[data-factor=abiotisch]");
        assert.ok(
          (await page.locator(".lab-feedback").innerText()).includes("Richtig"),
        );
      }
      if (lab === "river") {
        await page.click('[data-section="2"]');
        assert.ok(
          (await page.locator("#lab").innerText()).includes(
            "Sand und Feinsediment",
          ),
        );
        await page.click('[data-answer="2"]');
      }
      if (lab === "foodweb") {
        for (const [a, b] of [
          [0, 1],
          [1, 2],
          [2, 3],
          [4, 2],
          [5, 2],
        ]) {
          await page.click(`[data-node="${a}"]`);
          await page.click(`[data-node="${b}"]`);
        }
        await page.click("#web-check");
        assert.ok(
          (await page.locator(".lab-feedback").innerText()).includes(
            "Vollständig",
          ),
        );
        await page.click('[data-remove="0"]');
        assert.equal(await page.locator(".connection").count(), 4);
      }
      if (lab === "spiral") {
        await page.click("#spiral-next");
        assert.ok(
          (await page.locator("#lab h3").innerText()).includes("Konsumenten"),
        );
      }
      if (lab === "rules") {
        await page.click("[data-rule=allen]");
        assert.ok(
          (await page.locator(".lab-feedback").innerText()).includes("Richtig"),
        );
        await page.locator("#size-slider").fill("4");
        assert.ok(
          (await page.locator("#size-result").innerText()).includes("64"),
        );
      }
      if (lab === "relations") {
        await page.fill(
          "#relation-reason",
          "Parasit profitiert; der Wirt wird geschädigt.",
        );
        await page.click("[data-relation=Parasitismus]");
        assert.ok(
          (await page.locator(".lab-feedback").innerText()).includes("Passend"),
        );
      }
      console.log("PASS Interaktives Modul:", lab);
    }
    await go("exam");
    await page.click("#exam-start");
    await page.waitForSelector("#timer");
    let s = await stored();
    assert.equal(
      new Set(
        s.activeExam.qids.map((id) => questions.find((q) => q.id === id).topic),
      ).size,
      10,
    );
    assert.deepEqual(
      [
        ...new Set(
          s.activeExam.qids.map((id) => questions.find((q) => q.id === id).afb),
        ),
      ].sort(),
      [1, 2, 3],
    );
    assert.equal(await page.locator(".feedback").count(), 0);
    assert.equal(
      await page.getByText("Musterlösung", { exact: true }).count(),
      0,
    );
    for (let i = 0; i < 10; i++) {
      q = await current();
      await solve(q);
      await page.click("#exam-next");
      if (i < 9)
        await page.waitForFunction(
          (i) =>
            document
              .querySelector(".page-head h1")
              .textContent.includes(`Aufgabe ${i + 2} /`),
          i,
        );
    }
    await page.click("#dialog-ok");
    await page.waitForSelector("[data-save-exam]");
    while (await page.locator("[data-save-exam]").count()) {
      const b = page.locator("[data-save-exam]").first(),
        id = await b.getAttribute("data-save-exam");
      q = questions.find((q) => q.id === id);
      for (const input of await page
        .locator(`[data-rubric="exam-${id}"] input`)
        .all())
        await input.check();
      await b.click();
    }
    s = await stored();
    assert.equal(s.activeExam.recorded, true);
    assert.ok(s.sessions.some((x) => x.label.includes("Klausur")));
    assert.ok((await page.locator(".stats").innerText()).includes("100"));
    console.log(
      "PASS Klausur: ausgewogen, AFB I–III, verdeckte Lösungen, Abgabe, Bewertung, Ergebnis",
    );
    await go("exam");
    await page.click("#exam-start");
    await page.waitForSelector("#timer");
    q = await current();
    await solve(q);
    await page.reload();
    await page.waitForSelector("#timer");
    assert.ok((await stored()).activeExam.values[q.id]);
    await page.evaluate(() => {
      let s = JSON.parse(localStorage.getItem("biotop-progress-v1"));
      s.activeExam.deadline = Date.now() - 1000;
      localStorage.setItem("biotop-progress-v1", JSON.stringify(s));
    });
    await page.reload();
    await page.waitForURL("**/#exam/result");
    assert.equal((await stored()).activeExam.submitted, true);
    console.log(
      "PASS Klausurwiederherstellung & automatische Abgabe bei Zeitablauf",
    );
    await go("glossary");
    await page.fill("#glossary-search", "Nische");
    assert.ok((await page.locator("#glossary-list article").count()) > 0);
    await page.fill("#glossary-search", "nichtvorhandenerbegriff");
    assert.equal(await page.locator("#glossary-list article").count(), 0);
    await go("settings");
    const downloadPromise = page.waitForEvent("download");
    await page.click("#export");
    const download = await downloadPromise;
    const data = JSON.parse(fs.readFileSync(await download.path(), "utf8"));
    assert.equal(data.version, 1);
    await page.setInputFiles("#import-file", {
      name: "bad.json",
      mimeType: "application/json",
      buffer: Buffer.from('{"version":2}'),
    });
    assert.ok(
      (await page.locator("#import-message").innerText()).includes(
        "fehlgeschlagen",
      ),
    );
    await page.setInputFiles("#import-file", {
      name: "progress.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(data)),
    });
    await page.click("#dialog-ok");
    assert.equal((await stored()).activeExam, null);
    await page.fill(
      "#grade-key",
      "95;90;85;80;75;70;65;60;55;50;45;40;33;27;20;0",
    );
    await page.click("#save-grade");
    await page.reload();
    await page.waitForSelector("#grade-key");
    assert.ok((await page.inputValue("#grade-key")).includes("95"));
    console.log(
      "PASS Suche, JSON-Export/Import, ungültige Datei, eigener Notenschlüssel",
    );
    if (shots) {
      fs.mkdirSync(shots, { recursive: true });
      await go("dashboard");
      await page.screenshot({
        path: path.join(shots, "desktop.png"),
        fullPage: true,
      });
    }
    for (const viewport of [
      { width: 390, height: 844 },
      { width: 768, height: 1024 },
    ]) {
      await page.setViewportSize(viewport);
      for (const route of [
        "dashboard",
        "learn/river",
        "practice",
        "exam",
        "cards",
        "glossary",
        "labs/foodweb",
        "labs/river",
        "labs/rules",
        "settings",
      ]) {
        await go(route);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth + 1,
        );
        assert.equal(overflow, false, route + " " + viewport.width);
      }
      if (viewport.width === 390) {
        await page.click("#menu");
        assert.equal(await page.locator("#sidebar").isVisible(), true);
        await page.locator('#sidebar .nav-btn[href="#dashboard"]').click();
        await page.waitForSelector(".hero");
        if (shots)
          await page.screenshot({
            path: path.join(shots, "mobile.png"),
            fullPage: true,
          });
      }
      console.log("PASS Responsive, Breite:", viewport.width);
    }
    assert.deepEqual(errors, []);
    console.log("PASS Keine JavaScript-Laufzeitfehler");
  } finally {
    await browser.close();
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
