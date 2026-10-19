const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
(async () => {
  const { huntBoards } = await import(
    pathToFileURL(path.join(__dirname, "../src/hunt-data.js"))
  );
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.BROWSER_CHANNEL
      ? { channel: process.env.BROWSER_CHANNEL }
      : {}),
  });
  const page = await browser.newPage({
      viewport: { width: 1440, height: 1050 },
    }),
    errors = [];
  page.on("pageerror", (err) => errors.push(err.message));
  const base = process.env.TEST_URL || "http://127.0.0.1:4173";
  const go = async (route) => {
    await page.goto(base + "/#" + route);
    await page.waitForSelector(".page-head");
  };
  const state = () =>
    page.evaluate(() => JSON.parse(localStorage.getItem("biotop-progress-v1")));
  try {
    await go("dashboard");
    await page.evaluate(() => {
      localStorage.setItem(
        "biotop-progress-v1",
        JSON.stringify({
          version: 1,
          answers: {
            "levels-01": {
              attempts: 3,
              correct: 2,
              lastCorrect: true,
              score: 1,
              max: 1,
              at: Date.now(),
            },
          },
          cards: {},
          read: ["levels"],
          bookmarks: ["levels-01"],
          sessions: [],
          settings: { sound: false },
        }),
      );
    });
    await page.reload();
    await page.waitForSelector(".hero");
    await go("plan");
    const date = await page.evaluate(() => {
      const d = new Date();
      d.setDate(d.getDate() + 14);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    });
    await page.fill("#plan-date", date);
    await page.fill("#plan-minutes", "30");
    await page.click("#plan-create");
    await page.waitForSelector("[data-plan-done]");
    await page.locator("[data-plan-done]").first().check();
    await page.reload();
    await page.waitForSelector("[data-plan-done]");
    assert.equal(
      await page.locator("[data-plan-done]").first().isChecked(),
      true,
    );
    assert.equal((await state()).answers["levels-01"].attempts, 3);
    assert.equal((await state()).bookmarks[0], "levels-01");
    assert.ok(
      (await page.locator(".plan-item").first().innerText()).includes(
        "Begriffe",
      ) === false,
    );
    const href = await page
      .locator(".plan-item a")
      .first()
      .getAttribute("href");
    assert.ok(href.startsWith("#"));
    console.log(
      "PASS Lernplan erstellen, abhaken, wiederherstellen; alter Fortschritt erhalten",
    );
    await go("learn/river");
    await page.fill(
      "#topic-note",
      "Meine Frage: Warum verändert sich O₂? <img src=x onerror=alert(1)>",
    );
    await page.evaluate(() => {
      const p = document.querySelector('[data-note-section="0"]'),
        range = document.createRange();
      range.setStart(p.firstChild, 0);
      range.setEnd(p.firstChild, 40);
      const s = getSelection();
      s.removeAllRanges();
      s.addRange(range);
    });
    await page.click("#highlight-selection");
    assert.equal(await page.locator('[data-note-section="0"] mark').count(), 1);
    await page.reload();
    await page.waitForSelector("#topic-note");
    assert.ok((await page.inputValue("#topic-note")).includes("Meine Frage"));
    assert.equal(await page.locator('[data-note-section="0"] mark').count(), 1);
    await go("notes");
    assert.equal(await page.locator(".note-text img").count(), 0);
    assert.ok((await page.locator(".note-text").innerText()).includes("<img"));
    await page.fill("#notes-search", "nichtvorhanden");
    assert.equal(await page.locator("#notes-list article").count(), 0);
    await page.fill("#notes-search", "O₂");
    assert.equal(await page.locator("#notes-list article").count(), 1);
    console.log(
      "PASS Notizen & Textmarkierungen dauerhaft, suchbar und sicher als Text gerendert",
    );
    await go("operators");
    await page.fill(
      "#operator-answer",
      "Licht, Temperatur und Sauerstoffgehalt.",
    );
    await page.click("#operator-reveal");
    await page.locator('[data-criterion="0"]').check();
    await page.locator('[data-criterion="1"]').check();
    assert.ok(
      (await page.locator(".rubric-total").innerText()).includes("2 / 3"),
    );
    await page.click("#operator-save");
    await page.reload();
    await page.waitForSelector("#operator-answer");
    assert.equal((await state()).operators.scores["op-nennen-01"], 2);
    assert.equal(await page.locator("#operator-answer").isDisabled(), true);
    await page.click('[data-operator="beurteilen"]');
    assert.ok(
      (await page.locator(".operator-steps").innerText()).includes("Urteil"),
    );
    console.log(
      "PASS Operatoren-Trainer, teilweiser Kriterienwert und Speicherung",
    );
    await go("practice");
    await page.selectOption("#practice-type", "open");
    await page.click("#practice-start");
    await page.waitForSelector("#answer-text");
    await page.fill("#answer-text", "Eigene Antwort zum fachlichen Vergleich.");
    await page.click("#check-answer");
    const criterionCount = await page.locator("[data-criterion]").count();
    await page.locator("[data-criterion]").first().check();
    await page.click("#save-self");
    assert.ok(
      (await page.locator(".question-actions").innerText()).includes(
        `1 / ${criterionCount} Punkte`,
      ),
    );
    console.log(
      "PASS Kriterien-Checkliste berechnet echte Teilpunkte in Übungen",
    );
    await go("labs");
    assert.equal(await page.locator(".module-card").count(), 11);
    await go("labs/sandbox");
    await page.locator('[data-sandbox="temp"]').fill("25");
    await page.selectOption("#sandbox-target", "solubility");
    await page.selectOption("#sandbox-prediction", "down");
    await page.click("#sandbox-check");
    assert.ok(
      (await page.locator(".lab-feedback").innerText()).includes("Passend"),
    );
    await page.locator('[data-sandbox="light"]').fill("3");
    await page.locator('[data-sandbox="turbidity"]').fill("3");
    await page.selectOption("#sandbox-target", "light");
    await page.selectOption("#sandbox-prediction", "mixed");
    await page.click("#sandbox-check");
    assert.ok(
      (await page.locator(".lab-feedback").innerText()).includes("Passend"),
    );
    console.log("PASS Sandbox: einzelne und gegenläufige Wirkungen");
    await go("labs/domino");
    await page.selectOption("#domino-prediction", {
      label: "Weniger Nahrung verfügbar",
    });
    await page.fill(
      "#domino-reason",
      "Der Zilpzalp verliert eine Nahrungsquelle, kann aber eventuell Beeren und Samen nutzen.",
    );
    await page.click("#domino-check");
    assert.ok(
      (await page.locator(".lab-feedback").innerText()).includes("passt"),
    );
    await page.selectOption("#domino-event", "up");
    await page.selectOption("#domino-prediction", {
      label: "Mehr Nahrung verfügbar",
    });
    await page.fill(
      "#domino-reason",
      "Mehr Raupen können mehr Nahrung für Zilpzalpe bieten; die Bestandsfolge ist unsicher.",
    );
    await page.click("#domino-check");
    assert.ok(
      (await page.locator(".lab-feedback").innerText()).includes("passt"),
    );
    console.log("PASS Nahrungsnetz-Domino für Rückgang und Zunahme");
    await go("labs/niche");
    await page.click('[data-niche-answer="upper"]');
    assert.ok(
      (await page.locator(".lab-feedback").innerText()).includes("Richtig"),
    );
    await page.click("#niche-toggle");
    assert.equal(
      await page.getAttribute("#niche-toggle", "aria-checked"),
      "false",
    );
    await page.click('[data-niche-answer="all"]');
    assert.ok(
      (await page.locator(".lab-feedback").innerText()).includes("Richtig"),
    );
    assert.equal(
      Object.values((await state()).labProgress.niche.records).filter(Boolean)
        .length,
      2,
    );
    console.log(
      "PASS Nischen-Arena mit Kontrollfläche, Entfernen und Auswertung",
    );
    await go("labs/hunt");
    for (let i = 0; i < huntBoards.length; i++) {
      await page.selectOption("#hunt-board", String(i));
      for (const x of huntBoards[i].items.filter((x) => !x.correct)) {
        await page.locator(`[data-hunt-item="${x.id}"]`).first().click();
        const idx = x.options.indexOf(x.fix);
        await page.click(`[data-hunt-fix="${idx}"]`);
      }
      assert.equal(await page.locator(".hunt-element.repaired").count(), 3);
    }
    await page.reload();
    await page.waitForSelector("#hunt-board");
    assert.equal(await page.locator(".hunt-element.repaired").count(), 3);
    console.log(
      "PASS Alle zwölf Schaubildfehler repariert und nach Neuladen erhalten",
    );
    await go("settings");
    const download = page.waitForEvent("download");
    await page.click("#export");
    const f = await download,
      exported = JSON.parse(fs.readFileSync(await f.path(), "utf8"));
    await page.click("#reset");
    await page.click("#dialog-ok");
    assert.equal(Object.keys((await state()).notebook).length, 0);
    await page.setInputFiles("#import-file", {
      name: "biotop.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(exported)),
    });
    await page.click("#dialog-ok");
    const restored = await state();
    assert.ok(restored.notebook.river.text.includes("Meine Frage"));
    assert.equal(restored.planner.examDate, date);
    assert.equal(restored.operators.scores["op-nennen-01"], 2);
    assert.equal(
      Object.values(restored.labProgress.hunt.records).filter(Boolean).length,
      12,
    );
    console.log(
      "PASS JSON sichert und importiert alle neuen Funktionen zusammen mit altem Lernstand",
    );
    const shots = process.env.QA_DIR;
    if (shots) fs.mkdirSync(shots, { recursive: true });
    for (const width of [1440, 768, 390]) {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 1050 });
      for (const route of [
        "plan",
        "operators",
        "notes",
        "learn/river",
        "labs/sandbox",
        "labs/domino",
        "labs/niche",
        "labs/hunt",
      ]) {
        await go(route);
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth + 1,
          ),
          false,
          route + " " + width,
        );
        if (shots && (width === 1440 || width === 390))
          await page.screenshot({
            path: path.join(
              shots,
              `features-${route.replace("/", "-")}-${width}.png`,
            ),
            fullPage: true,
            animations: "disabled",
          });
      }
      console.log("PASS Neue Funktionen responsive bei", width, "Pixeln");
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
