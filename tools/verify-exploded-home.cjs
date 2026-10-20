const {
  chromium,
} = require("C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const assert = require("assert"),
  fs = require("fs");
(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    }),
    errors = [],
    checks = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const ok = (name, value) => {
    assert(value, name);
    checks.push(name);
    console.log("PASS", name);
  };
  const url = "http://127.0.0.1:8080/pages/home/index.html";
  const seek = async (i) => {
    await page.evaluate(
      (i) =>
        scrollTo({
          top:
            (i / 6) *
            (document.querySelector("#experience").offsetHeight - innerHeight),
          behavior: "instant",
        }),
      i,
    );
    await page.waitForFunction(
      (i) => YarmoukExperience.getState().chapter === i,
      i,
    );
    await page.waitForTimeout(650);
  };
  await page.goto(url);
  await page.waitForFunction(() => window.YarmoukExperience?.getState().loaded);
  ok(
    "Constructed wheat has 26 individually opening grains",
    await page.evaluate(() => YarmoukExperience.getState().seeds === 26),
  );
  ok(
    "One persistent canvas replaces stacked sections",
    (await page.locator("main section").count()) === 0 &&
      (await page.locator("canvas").count()) === 1,
  );
  for (let i = 0; i < 7; i++) {
    await seek(i);
    ok(
      "Chapter " + i + " has one accessible reading panel",
      (await page.locator(".chapter:not([inert])").count()) === 1 &&
        (await page
          .locator(".chapter.is-active")
          .getAttribute("data-chapter")) === String(i),
    );
    if (i === 2)
      ok(
        "Grain shells physically separate to expose their inner cores",
        await page.evaluate(
          () => YarmoukExperience.getState().shellSeparation > 0.2,
        ),
      );
    if (i === 4)
      ok(
        "The structure reassembles on completion",
        await page.evaluate(
          () => YarmoukExperience.getState().shellSeparation < 0.01,
        ),
      );
  }
  await page.locator('.chapter-navigation [data-go="2"]').click();
  await page.waitForFunction(() => YarmoukExperience.getState().chapter === 2);
  await page.waitForTimeout(700);
  ok("Chapter navigation reverses the scene", true);
  await page.keyboard.press("ArrowLeft");
  await page.waitForFunction(() => YarmoukExperience.getState().chapter === 1);
  ok("Keyboard navigation controls the same timeline", true);
  await page.locator(".view-control").click();
  await page.waitForTimeout(850);
  ok(
    "Model view removes copy and centers the sculpture",
    (await page.locator(".scene-copy").getAttribute("aria-hidden")) ===
      "true" &&
      (await page.evaluate(
        () => Math.abs(YarmoukExperience.sculpture.position.x) < 0.02,
      )),
  );
  const before = await page.evaluate(
    () => YarmoukExperience.getState().rotation[1],
  );
  await page.mouse.move(1050, 450);
  await page.mouse.down();
  await page.mouse.move(1190, 450, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(500);
  ok(
    "Dragging actually rotates the 3D object",
    Math.abs(
      (await page.evaluate(() => YarmoukExperience.getState().rotation[1])) -
        before,
    ) > 0.5,
  );
  await page.locator(".motion-control").click();
  await page.waitForTimeout(300);
  const paused = await page.evaluate(
    () => YarmoukExperience.getState().rotation[1],
  );
  await page.waitForTimeout(400);
  ok(
    "Pause stops automatic motion",
    Math.abs(
      (await page.evaluate(() => YarmoukExperience.getState().rotation[1])) -
        paused,
    ) < 0.003,
  );
  await page.locator(".view-control").click();
  await page.waitForTimeout(900);
  ok(
    "Return to story restores the active panel",
    (await page.locator(".scene-copy").getAttribute("aria-hidden")) === "false",
  );
  await page.locator(".motion-control").click();
  await seek(5);
  await page.locator("#majors-open").click();
  ok(
    "University details include all six majors",
    (await page.locator("#majors-dialog").evaluate((d) => d.open)) &&
      (await page.locator("#majors-dialog li").count()) === 6,
  );
  await page.keyboard.press("Escape");
  ok(
    "The academic paths dialog closes with Escape",
    !(await page.locator("#majors-dialog").evaluate((d) => d.open)),
  );
  for (const width of [390, 768, 1280]) {
    await page.setViewportSize({
      width,
      height: width === 390 ? 844 : width === 768 ? 1024 : 800,
    });
    for (const i of [0, 2, 5, 6]) {
      await seek(i);
      ok(
        "No horizontal overflow " + width + " chapter " + i,
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
      ok(
        "Active copy is fully above the controls " + width + " chapter " + i,
        await page.evaluate(
          () =>
            document.querySelector(".chapter.is-active").getBoundingClientRect()
              .bottom <
            document
              .querySelector(".experience-controls")
              .getBoundingClientRect().top,
        ),
      );
    }
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await seek(0);
  const still = await page.evaluate(
    () => YarmoukExperience.getState().rotation[1],
  );
  await page.waitForTimeout(300);
  ok(
    "Reduced motion removes idle movement",
    await page.evaluate(
      (v) => YarmoukExperience.getState().rotation[1] === v,
      still,
    ),
  );
  await seek(3);
  ok(
    "Reduced motion keeps all chapters available",
    (await page.locator(".chapter.is-active").getAttribute("id")) === "train",
  );
  const fallback = await browser.newPage();
  await fallback.route("**/three.min.js", (r) => r.abort());
  await fallback.goto(url);
  await fallback.waitForTimeout(300);
  ok(
    "A loaded poster remains available without WebGL",
    (await fallback
      .locator(".model-poster")
      .evaluate((i) => i.complete && i.naturalWidth > 0)) &&
      (await fallback.locator(".model-poster").isVisible()),
  );
  await fallback.close();
  const nojs = await browser.newPage({ javaScriptEnabled: false });
  await nojs.goto(url);
  ok(
    "Without JavaScript all seven explanations remain readable",
    (await nojs.locator(".chapter").count()) === 7 &&
      (await nojs.locator("#workspace").isVisible()),
  );
  await nojs.close();
  ok("No browser errors", errors.length === 0);
  fs.writeFileSync(
    "output/exploded-verification.json",
    JSON.stringify({ checks, errors }, null, 2),
  );
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
