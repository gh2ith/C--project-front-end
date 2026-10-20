/* Local real-browser motion preview; no generated plate is used by the scene. */
const {chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs');
(async()=>{const dir='output/playwright/pathway';fs.mkdirSync(dir,{recursive:true});const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const context=await browser.newContext({viewport:{width:1440,height:900},recordVideo:{dir,size:{width:1440,height:900}}});
 const page=await context.newPage();await page.goto('http://127.0.0.1:8080/pages/home/index.html');await page.waitForFunction(()=>!!window.YarmoukArch?.scene);await page.locator('#motion-toggle').click();
 const seek=async(p,smooth)=>{await page.evaluate(({p,smooth})=>scrollTo({top:p*(document.querySelector('#experience-runway').offsetHeight-innerHeight),behavior:smooth?'smooth':'instant'}),{p,smooth});await page.waitForFunction(p=>Math.abs(YarmoukArch.getProgress()-p)<.0002,p);};
 const names=['discover','apply','train','complete','faculty'];
 for(let i=0;i<5;i++){await seek([.625,.715,.805,.895,.98][i],i>0);await page.waitForTimeout(500);await page.screenshot({path:`${dir}/${names[i]}.png`});}
 for(const p of [.955,.935,.915,.895,.805]){await seek(p,true);await page.waitForTimeout(180);}
 await seek(.98,true);await page.waitForTimeout(800);const video=page.video();await context.close();await video.saveAs(`${dir}/pathway-scroll.webm`);console.log('Saved all five screenshots and forward/reverse scroll preview.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
