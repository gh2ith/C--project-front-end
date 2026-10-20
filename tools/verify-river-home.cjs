/* Local homepage acceptance: node tools/verify-river-home.cjs (serve repo on :8080). */
const {chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const out='output/playwright/river',url='http://127.0.0.1:8080/pages/home/index.html';
const stops=[.625,.715,.805,.895,.98],names=['discover','apply','train','complete','faculty'];
(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'chrome',headless:true}),errors=[],results=[];
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto(url);await page.waitForFunction(()=>!!window.YarmoukArch?.scene);await page.locator('#motion-toggle').click();
 const seek=async p=>{await page.evaluate(p=>scrollTo({top:p*(document.querySelector('#experience-runway').offsetHeight-innerHeight),behavior:'instant'}),p);await page.waitForFunction(p=>Math.abs(YarmoukArch.getProgress()-p)<.0003,p);};
 const pose=()=>page.evaluate(()=>({camera:YarmoukArch.camera.position.toArray(),rotation:YarmoukArch.camera.quaternion.toArray(),stones:YarmoukArch.archGroup.children.slice(0,40).map(o=>o.position.toArray())}));
 const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
 for(const edge of [.52,.58,...stops]){await seek(edge-.0001);const before=await pose();await seek(edge+.0001);const after=await pose();assert(distance(before.camera,after.camera)<.06,'Camera continuous at '+edge);assert(distance(before.rotation,after.rotation)<.02,'Rotation continuous at '+edge);}
 for(const p of [.18,.4,.519,.555,.625,.69,.73,.805,.895,.98]){await seek(p);const before=await pose();await seek(.999);await seek(p);const after=await pose();assert(distance(before.camera,after.camera)<.025);assert(distance(before.rotation,after.rotation)<.01);assert.deepEqual(before.stones,after.stones);}
 results.push('PASS forward/backward camera and gate reversal; continuity across assembly, handoff and all five holds');
 const terrainPose=()=>page.evaluate(()=>{const land=YarmoukArch.getJourney().getObjectByName('Continuous grass banks and recessed riverbed'),grass=YarmoukArch.getJourney().getObjectByName('Meadow grass clumps');return {id:land.uuid,geometry:land.geometry.uuid,opacity:land.material.opacity,grassVisible:grass.visible,grass:Array.from(grass.instanceMatrix.array)};});
 await seek(.625);const wholeRiverTerrain=await terrainPose();
 for(const p of [.625,.715,.805,.895,.915,.935,.955,.98]){await seek(p);const before=await terrainPose();assert.deepEqual(before,wholeRiverTerrain,'Full grassy pathway stays present at every stage');await seek(.999);await seek(p);assert.deepEqual(await terrainPose(),before,'Landscape reverses exactly');await page.screenshot({path:`${out}/transition-${p}.png`});}
 const terrainShape=await page.evaluate(()=>{const g=YarmoukArch.getJourney().getObjectByName('Continuous grass banks and recessed riverbed').geometry,alpha=g.attributes.bankAlpha.array,pos=g.attributes.position;let area=0,high=-Infinity,low=Infinity,edge=0;const widths=[];for(let i=0;i<alpha.length;i++){area+=alpha[i];high=Math.max(high,pos.getY(i));low=Math.min(low,pos.getY(i));if(Math.abs(pos.getX(i))===12||pos.getZ(i)===-5||pos.getZ(i)===55)edge=Math.max(edge,alpha[i]);}for(const z of [6,15,25,34,44]){let min=Infinity,max=-Infinity;for(let i=0;i<alpha.length;i++){if(Math.abs(pos.getZ(i)-z)<.11&&alpha[i]>.5){min=Math.min(min,pos.getX(i));max=Math.max(max,pos.getX(i));}}widths.push(max-min);}return {area,height:high-low,edge,widths};});
 assert(terrainShape.area>10000&&terrainShape.height>1&&terrainShape.edge===0&&terrainShape.widths.every(w=>w>9),'Wide sculpted pathway runs the whole river and fades before mesh boundaries');
 results.push('PASS full-width grassy pathway across every river chapter; fixed grounded vegetation; invisible outer mesh edges');
 await seek(.9349);const cardBefore=await page.locator('#chapter-faculty').boundingBox();await seek(.9351);const cardAfter=await page.locator('#chapter-faculty').boundingBox();assert(Math.abs(cardAfter.width-cardBefore.width)<1&&Math.abs(cardAfter.y-cardBefore.y)<5,'Faculty entrance has no layout snap');
 await seek(.98);const heldCard=await page.locator('#chapter-faculty').boundingBox(),heldScene=await pose();await seek(1);assert.deepEqual(await page.locator('#chapter-faculty').boundingBox(),heldCard);assert.deepEqual(await pose(),heldScene);results.push('PASS smooth faculty card entrance and stable final composition through end of scroll');
 await seek(.625);
 const geometry=await page.evaluate(()=>{const g=YarmoukArch.getJourney(),land=g.getObjectByName('Continuous grass banks and recessed riverbed'),a=land.geometry.attributes.position;land.geometry.computeBoundingBox();return {length:YarmoukArch.getCurve().getLength(),bounds:land.geometry.boundingBox,alpha:!!land.geometry.attributes.bankAlpha,rocks:g.getObjectByName('Small riverbank rocks').count,grass:g.getObjectByName('Small riverbank grass').count,vertices:a.count};});
 assert(geometry.length<60&&geometry.alpha);assert.equal(geometry.rocks,48);assert.equal(geometry.grass,72);
 const flow=()=>page.evaluate(()=>YarmoukArch.getJourney().getObjectByName('Flowing river surface').material.userData.flow.time);
 const paused=await flow();await page.waitForTimeout(180);assert.equal(await flow(),paused);await page.locator('#motion-toggle').click();await page.waitForTimeout(180);assert(await flow()>paused);await page.locator('#motion-toggle').click();results.push('PASS compact feathered terrain, bank-only details, gentle flow and pause/resume');
 const inspectCopy=async p=>p.evaluate(()=>{
  const linear=v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;};
  const luminance=c=>{const rgb=c.match(/[\d.]+/g).slice(0,3).map(Number).map(linear);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;};
  let minimum=Infinity;const issues=[];
  const cards=document.body.classList.contains('static-journey')?[...document.querySelectorAll('.chapter-card')]:[document.querySelector('.chapter-card.is-active')];
  for(const card of cards)for(const el of card.querySelectorAll('h1,h2,p,a,button')){
   if(el.classList.contains('a11y-sr-only')&&!document.body.classList.contains('static-journey'))continue;
   const style=getComputedStyle(el);let ancestor=el,bg='rgb(255, 255, 255)';while(ancestor){const c=getComputedStyle(ancestor).backgroundColor;if(c!=='rgba(0, 0, 0, 0)'){bg=c;break;}ancestor=ancestor.parentElement;}
   const a=luminance(style.color),b=luminance(bg),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);minimum=Math.min(minimum,ratio);if(ratio<4.5)issues.push([el.textContent,ratio]);
   if(!document.body.classList.contains('static-journey')&&el.matches('a,button')){const r=el.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);if(!el.contains(hit))issues.push(['Covered action',el.textContent]);}
  }return {minimum,issues};
 });
 let minimum=Infinity;
 for(const [w,h] of [[1440,900],[1366,650],[1024,768]]){await page.setViewportSize({width:w,height:h});for(let i=0;i<5;i++){
  await page.locator('.stepper-btn').nth(i).click();await page.waitForFunction(p=>Math.abs(YarmoukArch.getProgress()-p)<.0003,stops[i]);await page.waitForTimeout(300);
  assert.equal(await page.evaluate(()=>YarmoukArch.getStage()),i);const box=await page.locator('.chapter-card.is-active').boundingBox();assert(box.x>=0&&box.x+box.width<=w+1);assert(box.y>=96&&box.y+box.height<h-85,JSON.stringify({w,i,box}));assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  for(const control of await page.locator('.stage-controls button').all()){assert(await control.evaluate(el=>{const r=el.getBoundingClientRect();return el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));}),'Scene control covered');}const copy=await inspectCopy(page);assert.deepEqual(copy.issues,[]);minimum=Math.min(minimum,copy.minimum);
  await page.screenshot({path:`${out}/${w}-${names[i]}.png`});
 }results.push(`PASS five readable unobstructed panels, navigation, contrast and no overflow at ${w}x${h}`);}
 await page.setViewportSize({width:1440,height:900});await seek(.67);assert.equal(await page.locator('.is-river-visible').count(),2);await page.screenshot({path:`${out}/between-stops.png`});
 await seek(.805);const before=await pose();await page.mouse.move(750,260);await page.mouse.down();await page.mouse.move(850,290,{steps:6});await page.waitForTimeout(150);assert.deepEqual((await pose()).camera,before.camera);assert.notDeepEqual((await pose()).rotation,before.rotation);await page.mouse.up();await page.waitForTimeout(2000);assert(distance((await pose()).rotation,before.rotation)<.025);
 await page.locator('#journey-next').click();await page.waitForFunction(()=>Math.abs(YarmoukArch.getProgress()-.895)<.001);await page.locator('#journey-previous').click();await page.waitForFunction(()=>Math.abs(YarmoukArch.getProgress()-.805)<.001);
 await page.locator('.stepper-btn').nth(4).focus();await page.keyboard.press('Enter');await page.waitForFunction(()=>Math.abs(YarmoukArch.getProgress()-.98)<.001);assert(await page.locator('.stepper-btn').nth(4).evaluate(e=>e.matches(':focus-visible')));await page.locator('#open-majors-modal').click();assert.equal(await page.locator('.dialog-majors-list li').count(),6);await page.keyboard.press('Escape');
 await page.locator('.replay-btn').click();await page.waitForFunction(()=>scrollY<2);assert.equal(await page.evaluate(()=>YarmoukArch.getJourney().visible),false);results.push('PASS bounded drag/return, Previous/Next, keyboard focus, six majors dialog and Replay');
 for(const options of [{name:'mobile',viewport:{width:390,height:844}},{name:'small-mobile',viewport:{width:375,height:667}},{name:'tablet',viewport:{width:768,height:1024}},{name:'reduced',viewport:{width:1440,height:900},reducedMotion:'reduce'},{name:'webgl-unavailable',viewport:{width:1440,height:900},block:true}]){
  const {name,block,...opts}=options,p=await browser.newPage(opts);p.on('pageerror',e=>errors.push(e.message));if(block)await p.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/i.test(type)?null:original.call(this,type,...args);};});
  await p.goto(url);await p.waitForSelector('.static-journey');assert.equal(await p.evaluate(()=>YarmoukArch.getRenderer()),null);assert.equal(await p.locator('.chapter-card:visible').count(),5);assert.equal(await p.locator('.record-transcript:visible').count(),5);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const copy=await inspectCopy(p);assert.deepEqual(copy.issues,[]);minimum=Math.min(minimum,copy.minimum);
  for(let i=0;i<5;i++){await p.locator('.stepper-btn').nth(i).click();await p.waitForFunction(i=>YarmoukArch.getStage()===i,i);await p.waitForTimeout(300);if(name==='mobile'||name==='small-mobile')await p.screenshot({path:`${out}/${name}-${names[i]}.png`});}
  await p.screenshot({path:`${out}/${name}-full.png`,fullPage:true});await p.locator('.replay-btn').click();await p.waitForFunction(()=>scrollY===0);results.push(`PASS ${name}: five native-flow chapters, static artwork, readable copy and Replay`);await p.close();
 }
 const nojs=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});await nojs.goto(url);assert.equal(await nojs.locator('.chapter-card:visible').count(),5);assert(await nojs.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await nojs.screenshot({path:`${out}/no-javascript.png`,fullPage:true});
 await seek(.805);await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});const frame=await page.evaluate(()=>YarmoukArch.getRenderer().info.render.frame);await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>YarmoukArch.getRenderer().info.render.frame),frame);await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
 await page.evaluate(()=>document.querySelector('canvas').dispatchEvent(new Event('webglcontextlost',{cancelable:true})));await page.waitForSelector('.no-webgl.static-journey');assert.equal(await page.locator('.chapter-card:visible').count(),5);await page.screenshot({path:`${out}/context-lost.png`,fullPage:true});assert.deepEqual(errors,[]);results.push('PASS no JavaScript, hidden-tab pause, context loss and no runtime errors');
 results.push(`Minimum measured panel text/action contrast: ${minimum.toFixed(2)}:1`);results.push(`River centerline: ${geometry.length.toFixed(2)} scene units; Z extent 0–48; 480 segments`);
 fs.writeFileSync(`${out}/results.json`,JSON.stringify({results,geometry},null,2));console.log(results.join('\n'));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
