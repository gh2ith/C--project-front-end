const {chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('assert'),fs=require('fs');
(async()=>{
 const b=await chromium.launch({channel:'chrome',headless:true}),p=await b.newPage({viewport:{width:1440,height:1000},hasTouch:true}),errors=[],checks=[];
 p.on('pageerror',e=>errors.push(e.message));const ok=(label,value)=>{assert(value,label);checks.push(label);console.log('PASS',label)};
 const base=process.env.LIVE?'https://gh2ith.github.io/C--project-front-end/':'http://127.0.0.1:8080/';
 await p.goto(base+'pages/login/login.html');await p.evaluate(async()=>{await UIMS.ready;UIMS.signIn('student-1');UIMS.db.users['student-1'].firstLogin=false;UIMS.save()});await p.goto(base+'pages/student-opportunities/student-opportunities.html');await p.waitForSelector('.showcase-slide.is-selected');
 const track=p.locator('.showcase-track');const x=()=>track.evaluate(e=>e.scrollLeft);const selected=()=>p.locator('.showcase-chooser [aria-current=true]').getAttribute('data-slide');
 ok('One sliding catalog replaces the static list',await p.locator('.showcase-slide').count()===4&&await p.locator('.opportunity-row').count()===0);
 ok('First role is focused; only its actions are keyboard accessible',await p.locator('.showcase-slide:not([inert])').count()===1);
 await p.screenshot({path:'output/showcase-desktop.png',fullPage:true});
 await p.getByRole('button',{name:'Next opportunity',exact:true}).click();await p.waitForTimeout(90);const middle=await x();await p.waitForTimeout(800);const end=await x();ok('Next animates horizontally through intermediate positions',middle>0&&middle<end);
 ok('Next selects the second role',await selected()==='1');
 await p.getByRole('button',{name:'Next opportunity',exact:true}).click();await p.waitForTimeout(80);await p.getByRole('button',{name:'Previous opportunity',exact:true}).click();await p.waitForTimeout(850);ok('Movement can reverse before animation finishes',await selected()==='1');
 await p.locator('[data-slide="3"]').click();await p.waitForTimeout(850);ok('Role chooser jumps directly to any opportunity',await selected()==='3'&&await p.getByRole('button',{name:'Next opportunity',exact:true}).isDisabled());
 await track.focus();await p.keyboard.press('Home');await p.waitForTimeout(850);ok('Keyboard Home returns to first role',await selected()==='0');await p.keyboard.press('ArrowRight');await p.waitForTimeout(850);ok('Keyboard arrows browse roles',await selected()==='1');
 // Drag a noninteractive area of the role; the panel follows before release.
 await p.locator('[data-slide="0"]').click();await p.waitForTimeout(850);const box=await track.boundingBox();await p.mouse.move(box.x+box.width*.7,box.y+box.height*.45);await p.mouse.down();await p.mouse.move(box.x+box.width*.12,box.y+box.height*.45,{steps:12});const during=await x();await p.mouse.up();await p.waitForTimeout(900);ok('Desktop drag tracks the pointer and selects the next role',during>100&&await selected()!=='0');
 await p.locator('#opportunity-search').fill('Cybersecurity');ok('Search filters slides and chooser together',await p.locator('.showcase-slide').count()===1&&await p.locator('[data-slide]').count()===1);
 await p.locator('#opportunity-search').fill('no matching role');ok('No-result search gives clear feedback',await p.getByRole('heading',{name:'No internships found'}).count()===1);
 await p.locator('#opportunity-search').fill('');await p.emulateMedia({reducedMotion:'reduce'});await p.getByRole('button',{name:'Next opportunity',exact:true}).click();ok('Reduced motion changes roles without a sliding animation',await track.evaluate(e=>!e.classList.contains('is-moving')));await p.emulateMedia({reducedMotion:'no-preference'});
 await p.setViewportSize({width:390,height:844});await p.waitForTimeout(150);ok('Phone layout has no page overflow',await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.screenshot({path:'output/showcase-mobile.png',fullPage:true});
 await p.locator('[data-slide="0"]').click();await p.waitForTimeout(850);
 // Verify native swipe in a real mobile browser context, including momentum and snap.
 const mobile=await b.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 await mobile.goto(base+'pages/login/login.html');await mobile.evaluate(async()=>{await UIMS.ready;UIMS.signIn('student-2')});await mobile.goto(base+'pages/student-opportunities/student-opportunities.html');
 const mobileTrack=mobile.locator('.showcase-track');await mobileTrack.scrollIntoViewIfNeeded();await mobile.waitForTimeout(200);
 const touchBox=await mobileTrack.boundingBox(), client=await mobile.context().newCDPSession(mobile);
 const sy=Math.max(100,Math.min(400,touchBox.y+80)), sx=touchBox.x+touchBox.width*.88;
 await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:sx,y:sy}]});
 for(let n=1;n<=14;n++){await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:sx-touchBox.width*.78*n/14,y:sy}]});await mobile.waitForTimeout(30);}
 await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await mobile.waitForTimeout(1000);
 ok('Touch swipe scrolls and selects another opportunity',await mobile.locator('.showcase-chooser [aria-current=true]').getAttribute('data-slide')!=='0');await mobile.close();
 await p.locator('[data-slide="0"]').click();await p.waitForTimeout(850);await p.locator('.showcase-slide.is-selected').getByRole('link',{name:'Apply for this internship',exact:true}).click();await p.waitForURL('**/student-apply.html?*');ok('Application flow remains available from the focused role',p.url().includes('student-apply'));
 ok('No browser errors',errors.length===0);fs.writeFileSync('output/showcase-results.json',JSON.stringify({base,checks,errors},null,2));await b.close();
})().catch(e=>{console.error(e);process.exit(1)});



