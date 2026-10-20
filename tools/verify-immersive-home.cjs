/* Verify one full-screen, reversible scroll scene. */
const { chromium } = require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
(async () => {
  fs.mkdirSync('output/immersive-home', { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    const url = 'http://127.0.0.1:8080/pages/home/index.html';
    await page.goto(url);
    await page.waitForFunction(() => window.YarmoukArch?.scene);
    await page.locator('#motion-toggle').click();
    const points = [.05,.28,.52,.79,.95];
    const seek = async p => {
      await page.evaluate(p => scrollTo({ top: p * (document.querySelector('#experience-runway').offsetHeight - innerHeight), behavior: 'instant' }), p);
      await page.waitForFunction(p => Math.abs(YarmoukArch.getProgress() - p) < .001, p);
    };
    const pose = () => page.evaluate(() => ({camera: YarmoukArch.camera.position.toArray(), target: YarmoukArch.camera.quaternion.toArray(), stones: YarmoukArch.archGroup.children.filter(s=>s.isMesh).map(s=>s.position.toArray())}));
    for (const [width,height] of [[1440,900],[1920,1080],[1366,650],[768,1024],[390,844],[375,667]]) {
      await page.setViewportSize({width,height});
      for (let i=0; i<5; i++) {
        await seek(points[i]);
        assert.equal(await page.locator('.chapter-card:visible').count(),1);
        assert.equal(await page.locator('.chapter-card:not(.is-active):not([inert])').count(),0);
        assert(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth));
        const canvas = await page.locator('#experience-canvas').boundingBox();
        assert.equal(canvas.x,0); assert.equal(canvas.y,0); assert.equal(canvas.width,width); assert.equal(canvas.height,height);
        const card = await page.locator('.chapter-card.is-active').boundingBox();
        assert(card.x >= 0 && card.x+card.width <= width+1, 'Copy fits horizontally');
        assert(card.y >= 108 && card.y+card.height < height-90, `Copy fits between navigation and footer: ${width} stage ${i}`);
        assert.equal(await page.locator('video').count(),0);
        await page.screenshot({path:`output/immersive-home/${width}-${i}.png`});
      }
      console.log('PASS full-viewport canvas, five readable stages and responsive layout',width,height);
    }
    await page.setViewportSize({width:1440,height:900});
    await seek(.05); const before = await pose();
    await seek(.79); const after = await pose();
    assert.notDeepEqual(before.camera,after.camera); assert.notDeepEqual(before.stones,after.stones);
    await seek(.05); assert.deepEqual(await pose(),before);
    await seek(.42); const partialA = await pose(); await seek(.49); const partialB = await pose();
    assert.notDeepEqual(partialA.stones,partialB.stones,'Geometry changes continuously within a chapter');
    await seek(.05);
    await page.getByRole('button',{name:'Next journey stage',exact:true}).click();
    await page.waitForFunction(()=>YarmoukArch.getStage()===1);
    await page.locator('[data-stage-jump="3"]').click();
    await page.waitForFunction(()=>YarmoukArch.getStage()===3);
    await page.locator('[data-open-dialog="requirements-dialog"]').click();
    assert(await page.locator('#requirements-dialog').isVisible()); await page.keyboard.press('Escape');
    await seek(.95); await page.locator('#open-majors-modal').click();
    assert.equal(await page.locator('.dialog-majors-list li').count(),6); await page.keyboard.press('Escape');
    await seek(.05); await page.locator('[data-open-dialog="opportunities-dialog"]').click();
    await page.locator('.opp-mini-card').first().waitFor();
    assert(await page.locator('#opportunities-dialog').innerText().then(t=>t.includes('Log in'))); await page.keyboard.press('Escape');
    await seek(.52); const rotation = await page.evaluate(()=>YarmoukArch.archGroup.rotation.y);
    await page.mouse.move(220,400); await page.mouse.down(); await page.mouse.move(320,430,{steps:8});
    assert(await page.locator('#experience-canvas').evaluate(c=>c.classList.contains('is-dragging')));
    await page.waitForTimeout(100);
    assert.notEqual(await page.evaluate(()=>YarmoukArch.archGroup.rotation.y),rotation); await page.mouse.up();
    await page.locator('#motion-toggle').click(); assert.equal(await page.locator('#motion-toggle').getAttribute('aria-label'),'Pause ambient motion');
    await page.emulateMedia({reducedMotion:'reduce'}); await page.waitForSelector('body.reduced-motion');
    await seek(.05); await page.screenshot({path:'output/immersive-home/reduced-motion.png'});
    assert.equal(await page.locator('#experience-canvas').evaluate(c=>getComputedStyle(c).opacity),'0');
    const fallback = await browser.newPage({ viewport:{width:390,height:844} });
    await fallback.route('**/three.min.js',r=>r.abort()); await fallback.goto(url);
    await fallback.waitForSelector('body.no-webgl');
    assert(await fallback.locator('.static-fallback').evaluate(e=>getComputedStyle(e).opacity==='1'));
    assert(await fallback.getByRole('link',{name:'Explore internships',exact:true}).isVisible());
    const noJS = await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});
    await noJS.goto(url); assert.equal(await noJS.locator('.chapter-card:visible').count(),5);
    assert.equal(await noJS.locator('.chapter-card[inert]').count(),0);
    assert.deepEqual(errors,[]);
    console.log('PASS reversible geometry, continuous camera, stage navigation, three dialogs, public summaries, drag, pause, reduced motion, missing WebGL, no JavaScript and no page errors');
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
