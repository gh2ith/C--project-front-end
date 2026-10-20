const {chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});const context=await browser.newContext({viewport:{width:1440,height:960},acceptDownloads:true});const page=await context.newPage();const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8080/pages/login/login.html');await page.waitForTimeout(1800);await page.screenshot({path:'output/login-new.png'});
 await page.evaluate(async()=>{await UIMS.ready;UIMS.signIn('company-1');});
 for(const [r,id] of [['company','company-1'],['student','student-2'],['supervisor','academic-1'],['coordinator','coordinator-1']]){
   await page.evaluate(uid=>UIMS.signIn(uid),id);await page.goto(`http://127.0.0.1:8080/pages/${r}-dashboard/${r}-dashboard.html`);await page.waitForSelector('h1');await page.screenshot({path:`output/${r}-desktop.png`});
   console.log(r,await page.locator('h1').textContent(),await page.locator('.sidebar .nav-item').count());
   await page.setViewportSize({width:390,height:844});await page.screenshot({path:`output/${r}-mobile.png`});if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))errors.push(r+' horizontal overflow');await page.setViewportSize({width:1440,height:960});
 }
 console.log('ERRORS',JSON.stringify(errors));fs.writeFileSync('output/ui-errors.json',JSON.stringify(errors,null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
