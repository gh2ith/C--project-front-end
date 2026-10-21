const {chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const root='http://127.0.0.1:8080/',out='output/playwright/login-morph';
(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'chrome',headless:true}),errors=[];
try{
 const context=await browser.newContext({viewport:{width:1366,height:768},recordVideo:{dir:out,size:{width:1366,height:768}}}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto(root+'pages/login/login.html',{waitUntil:'domcontentloaded'});await page.waitForSelector('svg.morph-emblem');
 const input=page.locator('#loginPassword'),svg=page.locator('svg.morph-emblem');
 await page.evaluate(()=>{window.originalMorphPaths=[...document.querySelectorAll('[data-morph-geometry] path')];});
 const shape=()=>svg.locator('[data-morph-geometry] path').evaluateAll(paths=>paths.map(p=>p.getAttribute('d')).join('|'));
 const original=await shape();await page.screenshot({path:`${out}/original.png`});
 for(let i=1;i<=10;i++){
  await input.pressSequentially('a',{delay:0});await page.waitForFunction(t=>Math.abs(Number(document.querySelector('svg.morph-emblem').dataset.morphProgress)-t)<.001,i/10);
  assert.notEqual(await shape(),original);assert(await page.evaluate(()=>originalMorphPaths.every((path,i)=>path===document.querySelectorAll('[data-morph-geometry] path')[i])),'Same SVG nodes deform, not two logos swapping');
  assert(await svg.locator('[data-morph-geometry] path').evaluateAll(paths=>paths.every(p=>getComputedStyle(p).opacity==='1'&&!/NaN|Infinity/.test(p.getAttribute('d')))));
  if([3,5,8,10].includes(i))await page.screenshot({path:`${out}/step-${i}.png`});
 }
 assert.equal(await svg.getAttribute('data-morph-state'),'jubilee');const completed=await shape();
 await page.waitForTimeout(250);assert.equal(await shape(),completed,'Morph stops when typing stops');
 await input.press('Backspace');await page.waitForFunction(()=>Math.abs(Number(document.querySelector('svg.morph-emblem').dataset.morphProgress)-.9)<.001);assert.notEqual(await shape(),completed);
 await input.fill('');await page.waitForFunction(()=>document.querySelector('svg.morph-emblem').dataset.morphState==='original');assert.equal(await shape(),original,'Deletion retraces the exact source geometry');
 // Rapid interrupted edits, paste, visibility toggle and focus never recreate the SVG.
 await input.fill('abcd');await page.waitForTimeout(40);await input.fill('a');await page.waitForTimeout(35);await input.fill('abcdefghij');
 await page.waitForFunction(()=>document.querySelector('svg.morph-emblem').dataset.morphState==='jubilee');assert.equal(await shape(),completed);
 await page.locator('#togglePasswordBtn').click();assert.equal(await shape(),completed);await page.locator('#togglePasswordBtn').click();
 await input.fill('abcde');await page.waitForFunction(()=>document.querySelector('svg.morph-emblem').dataset.morphProgress==='0.5000');const midpoint=await shape();
 await page.locator('#loginEmail').focus();await page.waitForTimeout(150);assert.equal(await shape(),midpoint,'Blur holds current progress');
 await input.fill('');await page.waitForFunction(()=>document.querySelector('svg.morph-emblem').dataset.morphState==='original');
 const video=page.video();await context.close();await video.saveAs(`${out}/typing-morph.webm`);
 const reduced=await browser.newPage({reducedMotion:'reduce',viewport:{width:390,height:844}});await reduced.goto(root+'pages/login/login.html',{waitUntil:'domcontentloaded'});await reduced.waitForSelector('svg.morph-emblem');
 await reduced.locator('#loginPassword').fill('abcdefghij');assert.equal(await reduced.locator('svg.morph-emblem').getAttribute('data-morph-state'),'jubilee');assert.equal(await reduced.evaluate(()=>document.querySelector('svg.morph-emblem').getAnimations({subtree:true}).length),0);
 await reduced.locator('#loginPassword').fill('');assert.equal(await reduced.locator('svg.morph-emblem').getAttribute('data-morph-state'),'original');await reduced.screenshot({path:`${out}/reduced-mobile.png`,fullPage:true});await reduced.close();
 const nojs=await browser.newPage({javaScriptEnabled:false});await nojs.goto(root+'pages/login/login.html',{waitUntil:'domcontentloaded'});assert(await nojs.locator('img.gate-emblem').evaluate(el=>el.complete&&el.naturalWidth>0));await nojs.close();
 assert.deepEqual(errors,[]);console.log('PASS ten incremental geometry states, persistent SVG nodes, exact reverse deletion, paste/interruption, stable hold, show/hide, reduced-motion mobile and no-JavaScript fallback; no runtime errors');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
