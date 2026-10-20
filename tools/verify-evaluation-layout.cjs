/* Isolated browser verification of the restored academic evaluation presentation. */
const { chromium } = require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
(async () => {
  fs.mkdirSync('output/evaluations', { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await page.route('**/shared/data/firebase-seed.json', route => route.fulfill({ contentType: 'application/json', body: fs.readFileSync('shared/data/starter-seed-v1.json', 'utf8') }));
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('http://127.0.0.1:8080/pages/login/login.html');
    await page.evaluate(async () => { await UIMS.ready; UIMS.signIn('academic-1'); });
    const url = 'http://127.0.0.1:8080/pages/supervisor-evaluations/supervisor-evaluations.html';
    await page.goto(url);
    await page.waitForSelector('.evaluation-workspace');
    assert.equal(await page.getByRole('heading', { name: 'Select a student', exact: true }).count(), 1);
    assert.equal(await page.locator('[data-form="placement-select"]').count(), 0);
    await page.locator('#supervisorEvaluationSearch').fill('no matching student');
    assert(await page.locator('#supervisorEvaluationEmpty').isVisible());
    await page.locator('#supervisorEvaluationSearch').fill('Noor');
    await page.locator('[data-action="evaluation-student"][data-id="student-2"]').click();
    assert.match(await page.locator('#evaluationDetail').innerText(), /Waiting for the company/);
    assert.equal(await page.locator('[data-form="academic-evaluation"]').count(), 0);
    await page.locator('[data-action="evaluation-clear"]').click();
    assert.equal(await page.locator('#supervisorEvaluationSearch').inputValue(), 'Noor');
    // Test scores are local to this isolated browser context; zero is a valid rating.
    await page.evaluate(() => {
      UIMS.signIn('company-1');
      UIMS.companyEvaluation('placement-1', 0, 'Company assessment for layout verification.');
      UIMS.signIn('academic-1');
    });
    await page.goto(url + '?placement=placement-1');
    await page.waitForSelector('.evaluation-total');

    assert(await page.locator('.evaluation-total').innerText().then(t => t.includes('0 / 50')));
    assert.equal(await page.locator('[data-form="academic-evaluation"]').count(), 1);
    // A reviewed final report remains a completion requirement; academic submission is already available after company evaluation.
    await page.evaluate(() => {
      const task = UIMS.all('tasks').find(t => t.placementId === 'placement-1' && t.kind === 'Final report');
      UIMS.db.submissions['evaluation-test-submission'] = { id: 'evaluation-test-submission', taskId: task.id, status: 'Evaluated', createdAt: new Date().toISOString() };
      UIMS.save();
    });
    await page.reload();
    await page.waitForSelector('[data-form="academic-evaluation"]');
    for (const theme of ['light', 'dark']) {
      await page.evaluate(t => document.documentElement.dataset.theme = t, theme);
      for (const width of [1920, 1440, 768, 390, 375]) {
        await page.setViewportSize({ width, height: 1000 });
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${theme} overflow at ${width}`);
        await page.screenshot({ path: `output/evaluations/${theme}-${width}.png`, fullPage: true });
      }
    }
    await page.locator('[name="score"]').fill('26');
    await page.locator('[name="comments"]').fill('Academic assessment complete.');
    await page.getByRole('button', { name: 'Submit combined evaluation to coordinator', exact: true }).click();
    await page.waitForFunction(() => !!UIMS.db.academicEvaluations['placement-1']);
    assert.equal(await page.locator('[data-form="academic-evaluation"]').count(), 0);
    assert.equal(await page.locator('[data-evaluation-search]').filter({ hasText: 'Sent to coordinator' }).count(), 1);
    assert.deepEqual(errors, []);
    console.log('PASS directory, search, selection, direct links, pending state, company grade out of 50, sequential academic evaluation, academic submission and 10 responsive/theme layouts');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
