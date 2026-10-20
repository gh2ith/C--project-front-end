const { chromium } = require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    fs.mkdirSync('output/password-form', { recursive: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('http://127.0.0.1:8080/pages/login/login.html');
    await page.evaluate(() => UIMS.ready);
    for (const [role, id, view] of [['student', 'student-2', 'profile'], ['company', 'company-1', 'account'], ['supervisor', 'academic-1', 'account'], ['coordinator', 'coordinator-1', 'account']]) {
      const route = await page.evaluate(({ id, role, view }) => { UIMS.signIn(id); return UIMS.route(role, view); }, { id, role, view });
      await page.goto(new URL(route, page.url()).href);
      await page.locator('.profile-edit-column').waitFor();
      assert.equal(await page.locator('.profile-password').getAttribute('open'), null);
      assert(await page.locator('.profile-edit-column').evaluate(e => {
        const [personal, password] = e.children;
        return Math.abs(password.getBoundingClientRect().top - personal.getBoundingClientRect().bottom - 24) < 1;
      }), 'Password section follows the editor without a gap from the account column');
      await page.locator('.profile-password > summary').click();
      const form = page.locator('[data-form="change-password"]');
      await form.waitFor();
      const before = await page.evaluate(() => ({ session: JSON.stringify(sessionStorage), local: JSON.stringify(localStorage), model: JSON.stringify(UIMS.db) }));
      await form.locator('[name="currentPassword"]').fill('Current test secret');
      await form.locator('[name="newPassword"]').fill('Current test secret');
      await form.locator('[name="confirmPassword"]').fill('Current test secret');
      await form.getByRole('button', { name: 'Change password', exact: true }).click();
      assert((await form.locator('.form-error').innerText()).includes('different'));
      await form.locator('[name="newPassword"]').fill('New test secret');
      await form.getByRole('button', { name: 'Change password', exact: true }).click();
      assert((await form.locator('.form-error').innerText()).includes('do not match'));
      assert.equal(await form.locator('[name="confirmPassword"]').getAttribute('aria-invalid'), 'true');
      await form.locator('[name="confirmPassword"]').fill('New test secret');
      await form.getByRole('button', { name: 'Show new password', exact: true }).click();
      assert.equal(await form.locator('[name="newPassword"]').getAttribute('type'), 'text');
      await form.getByRole('button', { name: 'Change password', exact: true }).click();
      assert((await form.locator('.password-form-status').innerText()).includes('has not changed'));
      for (const name of ['currentPassword', 'newPassword', 'confirmPassword']) {
        assert.equal(await form.locator(`[name="${name}"]`).inputValue(), '');
        assert.equal(await form.locator(`[name="${name}"]`).getAttribute('type'), 'password');
      }
      assert.deepEqual(await page.evaluate(() => ({ session: JSON.stringify(sessionStorage), local: JSON.stringify(localStorage), model: JSON.stringify(UIMS.db) })), before);
      await form.locator('[name="currentPassword"]').fill('Discard this value');
      await form.getByRole('button', { name: 'Cancel', exact: true }).click();
      await page.waitForFunction(() => document.querySelector('[name="currentPassword"]').value === '');
      assert.equal(await page.locator('.profile-password').getAttribute('open'), null);
      await page.locator('.profile-password > summary').click();
      for (const width of [1440, 390]) {
        await page.setViewportSize({ width, height: 1000 });
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${role} overflow at ${width}`);
        await page.screenshot({ path: `output/password-form/${role}-${width}.png`, fullPage: true });
      }
      if (role === 'student') {
        for (const theme of ['light', 'dark']) {
          await page.evaluate(t => document.documentElement.dataset.theme = t, theme);
          for (const width of [1920, 1440, 768, 390, 375]) {
            await page.setViewportSize({ width, height: 1000 });
            assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
            await page.mouse.move(0, 0);
            await page.waitForTimeout(300);
            await page.screenshot({ path: `output/password-form/reworked-${theme}-${width}-open.png`, fullPage: true });
            await page.locator('.profile-password > summary').click();
            await page.mouse.move(0, 0);
            await page.waitForTimeout(300);
            await page.screenshot({ path: `output/password-form/reworked-${theme}-${width}-closed.png`, fullPage: true });
            await page.locator('.profile-password > summary').click();
          }
        }
        await page.evaluate(() => document.documentElement.dataset.theme = 'light');
      }
      console.log('PASS', role, 'validation, visibility, clearing, no storage/model changes and responsive layout');
    }
    assert.deepEqual(errors, []);
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
