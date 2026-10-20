const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const topics = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../src/content.json"), "utf8"),
);
const qs = topics.flatMap((t) => t.questions);
const base = process.env.TEST_URL || "http://127.0.0.1:4173";
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
  page.on("pageerror", (e) => errors.push(e.message));
  const go = async (route) => {
    await page.goto(base + "/#" + route);
    await page.waitForSelector(".page-head");
  };
  const state = () =>
    page.evaluate(() => JSON.parse(localStorage.getItem("biotop-progress-v1")));
  const storedRun = async () => {
    const s = await state();
    assert.ok(s.activePractice);
    return s.activePractice;
  };
  try {
    await go("dashboard");
    assert.match(
      await page.locator(".daily-actions").innerText(),
      /58 neue Karten/,
    );
    assert.equal(await page.locator(".hero-art").count(), 0);
    await page.click("#daily-start");
    await page.waitForSelector("#check-answer");
    let run = await storedRun();
    assert.equal(run.qids.length, 8);
    const firstPrompt = await page.locator(".question h2").innerText();
    await page.reload();
    await page.waitForSelector("#check-answer");
    assert.equal(await page.locator(".question h2").innerText(), firstPrompt);
    await go("dashboard");
    assert.equal(await page.locator('a[href="#practice/run"]').count(), 1);
    await go("practice");
    await page.selectOption("#practice-type", "open");
    await page.click("#practice-start");
    await page.click("#dialog-cancel");
    assert.deepEqual((await storedRun()).qids, run.qids);
    await page.click("#practice-start");
    await page.click("#dialog-ok");
    await page.waitForSelector("#answer-text");
    await page.fill("#answer-text", "Meine eigene Erklärung zur Übung.");
    await page.reload();
    await page.waitForSelector("#answer-text");
    assert.equal(
      await page.inputValue("#answer-text"),
      "Meine eigene Erklärung zur Übung.",
    );
    await page.click("#check-answer");
    await page.locator(".rubric-checklist input").first().check();
    await page.reload();
    await page.waitForSelector("#save-self");
    assert.equal(
      await page.locator(".rubric-checklist input").first().isChecked(),
      true,
    );
    run = await storedRun();
    const qid = run.qids[0];
    assert.equal((await state()).answers[qid], undefined);
    await page.click("#save-self");
    assert.equal((await state()).answers[qid].attempts, 1);
    await page.reload();
    await page.waitForSelector("#next-question");
    assert.equal((await state()).answers[qid].attempts, 1);
    await page.click("#next-question");
    assert.equal((await storedRun()).index, 1);
    await page.reload();
    await page.waitForSelector("#answer-text");
    assert.equal((await storedRun()).index, 1);
    await page.click("#end-run");
    await page.click("#dialog-ok");
    assert.equal((await state()).activePractice, null);
    await page.reload();
    await page.waitForSelector("#practice-start");
    assert.equal((await state()).activePractice, null);
    console.log(
      "PASS Tagestraining, sicherer Ersatz, Entwürfe, Kriterien, Neuladen ohne doppelte Bewertung",
    );

    await page.selectOption("#practice-type", "order");
    await page.click("#practice-start");
    await page.waitForSelector(".order-item");
    const shuffled = await page.locator(".order-item>span").allTextContents();
    await page.reload();
    await page.waitForSelector(".order-item");
    assert.deepEqual(
      await page.locator(".order-item>span").allTextContents(),
      shuffled,
    );
    await page.locator('[data-move="0"][data-dir="1"]').click();
    const changed = await page.locator(".order-item>span").allTextContents();
    await page.reload();
    await page.waitForSelector(".order-item");
    assert.deepEqual(
      await page.locator(".order-item>span").allTextContents(),
      changed,
    );
    await page.click("#end-run");
    await page.click("#dialog-ok");
    console.log("PASS Reihenfolge bleibt auch vor einer Bewertung gespeichert");

    await page.evaluate(() => {
      const s = JSON.parse(localStorage.getItem("biotop-progress-v1"));
      s.cards["levels-1"] = {
        rating: "unsure",
        streak: 0,
        due: Date.now() - 1000,
        reviewed: Date.now() - 86400000,
      };
      localStorage.setItem("biotop-progress-v1", JSON.stringify(s));
    });
    await page.reload();
    await page.waitForSelector(".page-head");
    await go("dashboard");
    assert.match(
      await page.locator(".daily-actions").innerText(),
      /1 Karte ist fällig/,
    );
    assert.match(
      await page.locator(".daily-actions").innerText(),
      /57 neue Karten/,
    );
    await go("cards");
    assert.match(await page.locator(".card-face h2").innerText(), /Population/);
    await page.selectOption("#card-mode", "review");
    assert.match(await page.locator(".row.between").innerText(), /1 \/ 1/);
    await page.selectOption("#card-mode", "new");
    assert.match(await page.locator(".row.between").innerText(), /Neue Karte/);
    assert.equal(
      (await page.locator(".card-face h2").innerText()) === "Population",
      false,
    );
    console.log("PASS Fällige und neue Karten getrennt, Wiederholungen zuerst");

    await go("learn/levels");
    assert.equal(await page.locator(".levels-map li").count(), 5);
    await page.fill("#topic-note", "Persönlicher Lernanker: Waldbeispielabc");
    await go("glossary");
    await page.fill("#glossary-search", "Waldbeispielabc");
    assert.match(
      await page.locator("#glossary-list").innerText(),
      /Eigene Notizen/,
    );
    await page.fill("#glossary-search", "Bachforelle");
    assert.ok((await page.locator("[data-search-task]").count()) > 0);
    await page.locator("[data-search-task]").first().click();
    await page.waitForSelector("#check-answer");
    assert.equal((await storedRun()).qids.length, 1);
    await page.click("#end-run");
    await page.click("#dialog-ok");
    console.log("PASS Begriffsübersicht und Suche in Notizen und Aufgaben");

    for (const width of [350, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 950 });
      await go("labs/foodweb");
      await page.waitForSelector("[data-node]");
      const inspect = () =>
        page.locator(".web-board").evaluate((board) => {
          const r = board.getBoundingClientRect();
          const rects = [...board.querySelectorAll("[data-node]")].map((el) => {
            const b = el.getBoundingClientRect();
            return {
              x: b.x,
              y: b.y,
              w: b.width,
              h: b.height,
              name: el.textContent,
            };
          });
          const overlaps = [];
          rects.forEach((a, i) =>
            rects.slice(i + 1).forEach((b) => {
              if (
                a.x < b.x + b.w &&
                a.x + a.w > b.x &&
                a.y < b.y + b.h &&
                a.y + a.h > b.y
              )
                overlaps.push([a.name, b.name]);
            }),
          );
          return {
            overlaps,
            inside: rects.every(
              // Translation animations can report 43.99997 for a 44px box.
              (b) =>
                b.x >= r.x &&
                b.x + b.w <= r.right &&
                Math.round(b.h * 100) / 100 >= 44,
            ),
            width: r.width,
            rects,
          };
        });
      let geometry = await inspect();
      assert.deepEqual(geometry.overlaps, [], width + " overlapping nodes");
      assert.ok(
        geometry.inside,
        width + " node boundaries " + JSON.stringify(geometry),
      );
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
      assert.match(
        await page.locator(".lab-feedback").innerText(),
        /Vollständig und richtig/,
      );
      assert.equal(await page.locator(".web-board line").count(), 5);
      assert.ok(
        await page
          .locator(".web-board line")
          .evaluateAll((lines) =>
            lines.every((l) =>
              ["x1", "y1", "x2", "y2"].every((a) =>
                Number.isFinite(Number(l.getAttribute(a))),
              ),
            ),
          ),
      );
      await page.setViewportSize({ width: width + 20, height: 950 });
      geometry = await inspect();
      assert.deepEqual(geometry.overlaps, []);
      await page.setViewportSize({ width, height: 950 });
      for (const route of [
        "dashboard",
        "practice",
        "learn/levels",
        "glossary",
        "operators",
        "labs/hunt",
        "labs/niche",
        "settings",
      ]) {
        await go(route);
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth + 1,
          ),
          false,
          route + " overflow " + width,
        );
      }
      if (width === 350) {
        await go("dashboard");
        await page.click("#menu");
        assert.equal(await page.getAttribute("#menu", "aria-expanded"), "true");
        assert.equal(
          await page.locator("main").evaluate((el) => el.inert),
          true,
        );
        await page.keyboard.press("Escape");
        assert.equal(
          await page.getAttribute("#menu", "aria-expanded"),
          "false",
        );
        assert.equal(
          await page.evaluate(() => document.activeElement.id),
          "menu",
        );
        await page.click("#menu");
        await page.click("#menu-close");
        assert.equal(
          await page.locator("main").evaluate((el) => el.inert),
          false,
        );
        assert.ok(
          await page
            .locator("#daily-start")
            .evaluate((el) => el.getBoundingClientRect().bottom < 700),
        );
      }
      if (process.env.QA_DIR) {
        fs.mkdirSync(process.env.QA_DIR, { recursive: true });
        await go("dashboard");
        await page.screenshot({
          path: path.join(process.env.QA_DIR, `study-${width}.png`),
          fullPage: true,
          animations: "disabled",
        });
        await go("labs/foodweb");
        await page.screenshot({
          path: path.join(process.env.QA_DIR, `foodweb-${width}.png`),
          fullPage: true,
          animations: "disabled",
        });
      }
      console.log(
        "PASS Netz ohne Überlappungen, korrekte Pfeile und Bedienung bei",
        width,
        "px",
      );
    }
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
