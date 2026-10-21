/* Owner-reference emblem: actual SVG assembly, layout and existing local role flow. */
const {chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const base='http://127.0.0.1:8080/',out='output/playwright/login-emblem';
(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'chrome',headless:true}),errors=[];
try{
 const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
 for(const [width,height]of [[1440,900],[1366,768],[1280,720],[1280,650],[1024,768],[390,844]]){
  await page.setViewportSize({width,height});await page.goto(base+'pages/login/login.html',{waitUntil:'domcontentloaded'});await page.evaluate(()=>UIMS.ready);
  await page.waitForSelector('svg.morph-emblem');assert(await page.locator('.gate-emblem').evaluate(el=>el instanceof SVGElement&&el.viewBox.baseVal.width===500));
  assert.equal(await page.locator('#gateArchSvg,.gate-door-leaf').count(),0);assert.equal(await page.locator('.lb-role-card').count(),4);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const figure=await page.locator('.emblem-stage').boundingBox(),image=await page.locator('.gate-emblem').boundingBox();
  assert(image.y>=figure.y&&image.y+image.height<=figure.y+figure.height+1);
  if(width>=1000){assert(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight+1));assert(await page.locator('#loginSubmitBtn').evaluate(el=>el.getBoundingClientRect().bottom<=innerHeight));}
  await page.screenshot({path:`${out}/${width}-${height}.png`,fullPage:true});
 }
 // Read the actual SVG document to verify its internal animation and reduced-motion state.
 const svg=await browser.newPage();await svg.goto(base+'assets/yarmouk-emblem-assembly.svg',{waitUntil:'domcontentloaded'});
 await svg.evaluate(()=>{for(const a of document.getAnimations()){a.pause();a.currentTime=0;}});
 assert.equal(await svg.locator('.wheat').evaluate(el=>Number(getComputedStyle(el).opacity)),0);
 await svg.evaluate(()=>{for(const a of document.getAnimations())a.currentTime=1700;});
 assert.equal(await svg.locator('.wheat').evaluate(el=>Number(getComputedStyle(el).opacity)),1);
 await svg.evaluate(()=>{for(const a of document.getAnimations())a.currentTime=1000;});assert.equal(await svg.locator('.nameplate').evaluate(el=>Number(getComputedStyle(el).opacity)),0);await svg.evaluate(()=>{for(const a of document.getAnimations())a.currentTime=2300;});assert.equal(await svg.locator('.nameplate').evaluate(el=>Number(getComputedStyle(el).opacity)),1);assert.equal(await svg.locator('.nameplate path').getAttribute('fill'),'#08744c');
 await svg.emulateMedia({reducedMotion:'reduce'});assert.equal(await svg.evaluate(()=>document.getAnimations().length),0);
 assert.equal(await svg.locator('.wheat').evaluate(el=>Number(getComputedStyle(el).opacity)),1);await svg.close();
 const reduced=await browser.newPage({reducedMotion:'reduce',viewport:{width:1280,height:720}});await reduced.goto(base+'pages/login/login.html',{waitUntil:'domcontentloaded'});
await reduced.screenshot({path:`${out}/reduced.png`});await reduced.close();
 for(const role of ['student','company','supervisor','coordinator']){
  await page.goto(base+'pages/login/login.html',{waitUntil:'domcontentloaded'});await page.evaluate(()=>UIMS.ready);await page.locator(`[data-role="${role}"]`).click();
  assert(await page.locator('#workspaceAccount option').count()>0);await page.locator('#loginPassword').fill('illustration-check-only');
  await page.locator('#togglePasswordBtn').click();assert.equal(await page.locator('#loginPassword').getAttribute('type'),'text');await page.locator('#togglePasswordBtn').click();
  await page.locator('#loginSubmitBtn').click();await page.waitForURL(url=>!url.pathname.endsWith('/login/login.html'));
  assert(!(await page.evaluate(()=>sessionStorage.getItem('yarmouk:uims:v1')||'')).includes('illustration-check-only'));
 }
 assert.deepEqual(errors,[]);console.log('PASS supplied-reference SVG, ordered assembly/name reveal, six desktop/mobile layouts, reduced motion, four local role routes and password visibility; no stored input password or runtime errors');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
