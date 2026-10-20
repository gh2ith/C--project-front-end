const {
  chromium,
} = require("C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const assert = require("assert"),
  fs = require("fs");
(async () => {
  const b = await chromium.launch({ channel: "chrome", headless: true }),
    p = await b.newPage({ viewport: { width: 1440, height: 960 } }),
    checks = [],
    errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  const ok = (name, value) => {
    assert(value, name);
    checks.push(name);
    console.log("PASS", name);
  };
  await p.goto("http://127.0.0.1:8080/pages/login/login.html");
  await p.evaluate(async () => {
    await UIMS.ready;
    UIMS.signIn("student-2");
  });
  await p.goto(
    "http://127.0.0.1:8080/pages/student-profile/student-profile.html",
  );
  await p.waitForSelector(".profile-layout");
  ok(
    "Page uses a neutral edge-to-edge canvas",
    (await p
      .locator("body")
      .evaluate((e) => getComputedStyle(e).backgroundColor)) ===
      "rgb(246, 247, 248)",
  );
  ok(
    "No rounded outer student frame",
    (await p
      .locator(".student-main")
      .evaluate((e) => getComputedStyle(e).borderRadius)) === "0px" &&
      (await p
        .locator(".student-workspace")
        .evaluate((e) => getComputedStyle(e).padding)) === "0px",
  );
  ok(
    "Editor has a natural height without stretched whitespace",
    await p.locator(".profile-layout").evaluate((e) => {
      const a = e.children[0], b = e.querySelector('.profile-edit-column > .card-surface');
      return (
        b.getBoundingClientRect().height < a.getBoundingClientRect().height
      );
    }),
  );
  await p.locator("[name=phone]").fill("0791234567");
  await p.locator("[data-form=profile] [type=submit]").click();
  await p.waitForFunction(() => UIMS.user.phone === "0791234567");
  ok(
    "Profile form still saves the permitted session field",
    (await p.locator("[name=phone]").inputValue()) === "0791234567",
  );
  for (const [width, height] of [
    [1920, 1080],
    [1440, 960],
    [768, 1024],
    [390, 844],
    [375, 812],
    [844, 390],
  ]) {
    await p.setViewportSize({ width, height });
    ok(
      "Responsive reflow " + width + "x" + height,
      await p.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    const sizes = await p
      .locator(".ui-input:visible")
      .evaluateAll((es) => es.map((e) => e.getBoundingClientRect().height));
    ok(
      "Usable field heights " + width,
      sizes.every((h) => h >= 44),
    );
    if (width < 901)
      ok(
        "Editing comes first on narrow screens " + width,
        await p
          .locator(".profile-layout")
          .evaluate(
            (e) =>
              e.children[1].getBoundingClientRect().top <
              e.children[0].getBoundingClientRect().top,
          ),
      );
  }
  await p.setViewportSize({ width: 1440, height: 960 });
  await p.locator("[data-action=theme]").click();
  ok(
    "Dark mode uses its own restrained canvas",
    (await p
      .locator("body")
      .evaluate((e) => getComputedStyle(e).backgroundColor)) ===
      "rgb(17, 27, 22)",
  );
  await p.emulateMedia({ reducedMotion: "reduce" });
  await p.locator("[name=phone]").focus();
  ok(
    "Keyboard focus remains available",
    await p
      .locator("[name=phone]")
      .evaluate((e) => document.activeElement === e),
  );
  ok("No browser errors", errors.length === 0);
  fs.writeFileSync(
    "output/portal-layout-verification.json",
    JSON.stringify({ checks, errors }, null, 2),
  );
  await b.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
