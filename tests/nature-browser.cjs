const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
(async () => {
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
  page.on("pageerror", (e) => errors.push(e.message));
  const base = process.env.TEST_URL || "http://127.0.0.1:4173";
  const go = async (route) => {
    await page.goto(base + "/#" + route);
    await page.waitForSelector(".page-head");
  };
  try {
    await go("labs/sandbox");
    const baseline = await page.locator("#sandbox-baseline").innerHTML();
    const normalize = (s) =>
      s.replaceAll("baseline", "scene").replaceAll("changed", "scene");
    assert.equal(
      normalize(baseline),
      normalize(await page.locator("#sandbox-scene").innerHTML()),
    );
    await page.locator('[data-sandbox="vegetation"]').fill("3");
    assert.equal(await page.locator("#sandbox-baseline").innerHTML(), baseline);
    assert.notEqual(
      normalize(baseline),
      normalize(await page.locator("#sandbox-scene").innerHTML()),
    );
    assert.match(
      await page.locator("#scene-description").innerText(),
      /Mehr Uferbewuchs/,
    );
    assert.match(
      await page.locator("#sandbox-effects").innerText(),
      /Nimmt eher ab/,
    );
    await page.selectOption("#sandbox-prediction", "down");
    await page.click("#sandbox-check");
    assert.match(await page.locator(".lab-feedback").innerText(), /Passend/);
    await page.click('[data-river-view="explore"]');
    assert.equal(
      await page.locator("#sandbox-baseline-panel").isVisible(),
      false,
    );
    assert.equal(
      await page.getAttribute('[data-river-view="explore"]', "aria-pressed"),
      "true",
    );
    await page.click('[data-river-view="compare"]');
    assert.equal(
      await page.locator("#sandbox-baseline-panel").isVisible(),
      true,
    );
    await page.click("#sandbox-reset");
    assert.equal(
      normalize(baseline),
      normalize(await page.locator("#sandbox-scene").innerHTML()),
    );
    assert.equal(
      await page.locator('[data-sandbox="vegetation"]').inputValue(),
      "2",
    );
    await page.locator('[data-sandbox="light"]').fill("3");
    await page.locator('[data-sandbox="turbidity"]').fill("3");
    assert.match(
      await page.locator("#sandbox-effects").innerText(),
      /Gegenläufige/,
    );
    console.log(
      "PASS Illustrationen reagieren, Ausgangszustand bleibt stabil, Ansichten und Zurücksetzen funktionieren",
    );
    await go("learn/levels");
    assert.equal(await page.locator(".levels-map svg").count(), 5);
    await page.locator(".levels-map summary").nth(1).click();
    assert.equal(
      await page.locator(".levels-map details").nth(1).getAttribute("open"),
      "",
    );
    assert.equal(await page.locator(".learning-path a").count(), 4);
    await page.locator(".learning-path a").nth(2).click();
    await page.waitForSelector("#check-answer");
    assert.match(
      await page.locator(".question-meta").innerText(),
      /Systemebenen/,
    );
    await page.click("#end-run");
    await page.click("#dialog-ok");
    console.log(
      "PASS Illustrierte Systemebenen und direkter Weg ins Kapiteltraining",
    );
    for (const width of [350, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const route of [
        "dashboard",
        "learn/levels",
        "labs/sandbox",
        "practice",
        "cards",
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
      await go("labs/sandbox");
      const overlap = await page.locator(".nature-sandbox").evaluate((el) => {
        const a = el.querySelector(".scene-workspace").getBoundingClientRect();
        const b = el.querySelector(".sandbox-controls").getBoundingClientRect();
        return (
          a.x < b.right - 1 &&
          a.right > b.x + 1 &&
          a.y < b.bottom - 1 &&
          a.bottom > b.y + 1
        );
      });
      assert.equal(overlap, false, "illustration controls overlap " + width);
      const ids = await page
        .locator("svg [id]")
        .evaluateAll((ns) => ns.map((x) => x.id));
      assert.equal(new Set(ids).size, ids.length);
      assert.equal(await page.locator(".nature-lab img").count(), 0);
      assert.match(
        await page
          .locator("h1")
          .evaluate((el) => getComputedStyle(el).fontFamily),
        /Georgia/,
      );
      if (process.env.QA_DIR) {
        fs.mkdirSync(process.env.QA_DIR, { recursive: true });
        await page.screenshot({
          path: path.join(process.env.QA_DIR, `labor-${width}.png`),
          fullPage: true,
          animations: "disabled",
        });
        await go("learn/levels");
        await page.screenshot({
          path: path.join(process.env.QA_DIR, `kapitel-${width}.png`),
          fullPage: true,
          animations: "disabled",
        });
        await go("dashboard");
        await page.screenshot({
          path: path.join(process.env.QA_DIR, `start-${width}.png`),
          fullPage: true,
          animations: "disabled",
        });
      }
      console.log(
        "PASS Natur-UI ohne Überlauf oder Überlagerungen bei",
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
