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
  const base = "http://127.0.0.1:8080";
  await p.goto(base + "/pages/home/index.html");
  await p.waitForFunction(() => window.YarmoukExperience?.getState().loaded);
  await p.waitForTimeout(1200);
  ok(
    "University homepage has no personal or collaboration identity",
    !/riwaq|in collaboration/i.test(await p.locator("body").innerText()),
  );
  ok(
    "University logo is the sole header mark",
    await p
      .locator(".brand img")
      .getAttribute("src")
      .then((s) => s.includes("yarmouk-logo")),
  );
  ok(
    "Homepage header is Royal Green",
    (await p
      .locator(".site-header")
      .evaluate((e) => getComputedStyle(e).backgroundColor)) ===
      "rgb(0, 104, 55)",
  );
  await p.screenshot({ path: "output/university-home.png" });
  await p.goto(base + "/pages/login/login.html");
  await p.waitForFunction(() => window.UIMS?.db);
  await p.waitForTimeout(700);
  ok(
    "Login badge and footer have university ownership",
    !/riwaq|collaboration|internship management.*ghaith/i.test(
      await p.locator("body").innerText(),
    ),
  );
  ok(
    "Login primary action is Royal Green",
    (await p
      .locator("[type=submit]")
      .first()
      .evaluate((e) => getComputedStyle(e).backgroundColor)) ===
      "rgb(0, 104, 55)",
  );
  await p.screenshot({ path: "output/university-login.png" });
  // Old tab records migrate to the university namespace on the next page load.
  await p.evaluate(() => {
    const db = sessionStorage.getItem("yarmouk:uims:v1");
    sessionStorage.setItem("riwaq:uims:v1", db);
    sessionStorage.setItem("riwaq:uims:viewer", "student-2");
    sessionStorage.removeItem("yarmouk:uims:v1");
    sessionStorage.removeItem("yarmouk:uims:viewer");
  });
  await p.reload();
  await p.waitForFunction(() => UIMS.db);
  ok(
    "Existing tab data and viewer survive the identity change",
    await p.evaluate(
      () =>
        UIMS.userId === "student-2" &&
        !!sessionStorage.getItem("yarmouk:uims:v1"),
    ),
  );
  for (const [role, id, view] of [
    ["student", "student-2", "opportunities"],
    ["company", "company-1", "dashboard"],
    ["supervisor", "academic-1", "dashboard"],
    ["coordinator", "coordinator-1", "dashboard"],
  ]) {
    await p.evaluate((id) => UIMS.signIn(id), id);
    await p.goto(`${base}/pages/${role}-${view}/${role}-${view}.html`);
    await p.waitForSelector("h1");
    ok(
      role + " portal uses the shared university theme",
      (await p.locator('link[href*="university-theme.css"]').count()) === 1 &&
        !/riwaq|in collaboration/i.test(await p.locator("body").innerText()),
    );
    ok(
      role + " has no signed-in top navbar",
      (await p.locator(".topbar, .studio-top, .public-header").count()) === 0,
    );
    ok(
      role + " retains workspace navigation",
      (await p.locator(role === "student" ? ".studio-tools .studio-navigation" : ".sidebar").count()) === 1,
    );
    await p.screenshot({ path: `output/university-${role}.png` });
    await p.setViewportSize({ width: 390, height: 844 });
    ok(
      role + " mobile layout fits",
      await p.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    if (role !== "student") await p.locator(".mobile-toggle").click();
    await p.locator("[data-action=theme]").first().click();
    if (role !== "student") await p.keyboard.press("Escape");
    ok(
      role + " dark theme retains emerald surfaces",
      (await p.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue("--bg-2")
          .trim(),
      )) === "#002e18",
    );
    await p.screenshot({ path: `output/university-${role}-dark-mobile.png` });
    if (role !== "student") await p.locator(".mobile-toggle").click();
    await p.locator("[data-action=theme]").first().click();
    if (role !== "student") await p.keyboard.press("Escape");
    await p.setViewportSize({ width: 1440, height: 960 });
  }
  await p.goto(base + "/pages/about/about.html");
  await p.waitForSelector("h1");
  ok(
    "About page has university ownership and an updated process film",
    !/riwaq|in collaboration/i.test(await p.locator("body").innerText()) &&
      (await p
        .locator("video source")
        .getAttribute("src")
        .then((s) => s.includes("yarmouk-journey"))),
  );
  await p.screenshot({ path: "output/university-about.png" });
  ok("No browser errors", errors.length === 0);
  fs.writeFileSync(
    "output/university-verification.json",
    JSON.stringify({ checks, errors }, null, 2),
  );
  await b.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
