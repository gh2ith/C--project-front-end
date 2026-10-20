const {chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'), assert=require('node:assert/strict');
const seed=JSON.parse(fs.readFileSync('shared/data/firebase-seed.json','utf8'));
const baseline=JSON.parse(fs.readFileSync('shared/data/starter-seed-v1.json','utf8'));
const all=name=>Object.entries(seed[name]).map(([id,v])=>({id,...v}));
for(const student of all('users').filter(u=>u.role==='student')) {
  assert(seed.groups[student.groupId]); assert.equal(seed.users[seed.groups[student.groupId].supervisorId].status,'Active');
  assert(all('placements').filter(p=>p.studentId===student.id).length<=1);
}
for(const user of all('users')) assert(/[\u0600-\u06ff]/.test(user.name));
for(const group of all('groups')) assert(all('users').filter(u=>u.groupId===group.id).length<=9);
for(const app of all('applications')) {
  const op=seed.opportunities[app.opportunityId]; assert(op.majorIds.includes(seed.users[app.studentId].majorId));
  if(app.status==='Rejected') assert(app.reason.length);
  if(app.status==='Confirmed') assert(all('placements').some(p=>p.studentId===app.studentId&&p.opportunityId===app.opportunityId));
}
for(const op of all('opportunities')) assert(all('applications').filter(a=>a.opportunityId===op.id&&['Confirmed','Accepted'].includes(a.status)).length<=op.seats);
for(const h of all('hourEntries')) {
  const p=seed.placements[h.placementId]; assert(p); assert(h.date>=p.startDate&&h.date<=p.endDate&&h.date<='2026-10-20'); assert(h.hours>0&&h.hours<=12);
  assert.equal(h.recordedBy,p.companySupervisorId);
  if(h.status!=='Pending') assert.equal(h.reviewedBy,seed.groups[seed.users[p.studentId].groupId].supervisorId);
}
for(const s of all('submissions')) {
  const t=seed.tasks[s.taskId]; assert(t); assert.equal(seed.placements[t.placementId].studentId,s.studentId);
  if(s.review) assert(!("scores" in s.review));
}
(async()=>{
  fs.mkdirSync('output/populated-data',{recursive:true});
  const browser=await chromium.launch({channel:'chrome',headless:true});
  try {
    const page=await browser.newPage({viewport:{width:1440,height:1000},acceptDownloads:true});
    const errors=[]; page.on('pageerror',e=>errors.push(e.message));
    const login='http://127.0.0.1:8080/pages/login/login.html';
    await page.goto(login); await page.waitForFunction(()=>document.querySelector('#workspaceAccount').options.length===12);
    assert((await page.locator('#workspaceAccount option:checked').innerText()).includes('غيث عموره'));
    await page.locator('#workspaceAccount').selectOption('student-5');
    assert.equal(await page.locator('#loginEmail').inputValue(),'student5@students.yu.edu.jo');
    assert((await page.locator('#workspaceAccount option:checked').innerText()).includes('لين حداد'));
    for(const [role,count] of [['company',3],['supervisor',2],['coordinator',1],['student',12]]){
      await page.locator(`.lb-role-card[data-role="${role}"]`).click(); assert.equal(await page.locator('#workspaceAccount option').count(),count);
    }
    await page.locator('#workspaceAccount').selectOption('student-1'); await page.locator('#loginPassword').fill('local-form-entry');
    await page.locator('#hrLoginForm [type="submit"]').click(); await page.waitForURL('**/student-opportunities.html');
    const checks=await page.evaluate(()=>({completed:UIMS.completionChecks('placement-student-5'),ready:UIMS.completionChecks('placement-student-7'),final:UIMS.finalResult('placement-student-7')}));
    assert(Object.values(checks.completed).every(Boolean)); assert(Object.values(checks.ready).every(Boolean)); assert.equal(checks.final,90);
    for(const [id,role,view] of [['student-1','student','tasks'],['student-1','student','progress'],['company-1','company','dashboard'],['academic-1','supervisor','evaluations'],['coordinator-1','coordinator','completion'],['coordinator-1','coordinator','messages']]){
      await page.evaluate(id=>UIMS.signIn(id),id); await page.goto(`http://127.0.0.1:8080/pages/${role}-${view}/${role}-${view}.html`); await page.waitForSelector('main h1');
      if(role==='supervisor'){await page.locator('[data-action="evaluation-student"][data-id="student-2"]').click(); assert(await page.locator('[data-form="academic-evaluation"]').isVisible());}
      for(const width of [1440,390]){await page.setViewportSize({width,height:1000}); assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:`output/populated-data/${role}-${view}-${width}.png`,fullPage:true});}
    }
    await page.evaluate(()=>UIMS.signIn('student-5')); await page.goto('http://127.0.0.1:8080/pages/student-progress/student-progress.html');
    assert(await page.getByRole('heading',{name:'Internship completed.',exact:true}).isVisible());
    assert(!(await page.locator('main').innerText()).includes('90 / 100'));
    const downloadPromise=page.waitForEvent('download'); await page.locator('[data-action="download-certificate"]').click(); const download=await downloadPromise; const output='output/populated-data/completion-certificate.pdf'; await download.saveAs(output); assert.equal(fs.readFileSync(output).subarray(0,5).toString(),'%PDF-');
    // An untouched old session upgrades to all records. A changed session preserves connected work.
    for(const edited of [false,true]){
      const migration=await browser.newPage(); await migration.goto(login); await migration.evaluate(()=>UIMS.ready);
      const old=structuredClone(baseline);
      if(edited){old.users['student-2'].phone='0791234567';old.tasks['task-1'].title='Keep my edited task';old.hourEntries['hours-1'].status='Approved';old.contactMessages['my-message']={name:'Keep me',email:'keep@example.com',subject:'My note',message:'Keep this message',status:'New',createdAt:'2026-10-20T10:00:00Z'};}
      await migration.evaluate(old=>sessionStorage.setItem('yarmouk:uims:v1',JSON.stringify(old)),old);await migration.reload();await migration.evaluate(()=>UIMS.ready);
      const migrated=await migration.evaluate(()=>UIMS.db);
      assert.equal(migrated.seedRevision,seed.seedRevision);assert.equal(migrated.users['student-2'].name,'نور العمري');
      if(edited){assert.equal(migrated.users['student-2'].phone,'0791234567');assert.equal(migrated.tasks['task-1'].title,'Keep my edited task');assert.equal(migrated.hourEntries['hours-1'].status,'Approved');assert(migrated.contactMessages['my-message']);assert(!migrated.companyEvaluations['placement-1']);}
      else for(const c of ['users','placements','tasks','submissions','hourEntries','companyEvaluations','completions']) assert.deepEqual(migrated[c],seed[c]);
      await migration.close();
    }
    assert.deepEqual(errors,[]);
    console.log('PASS Arabic names, relations, capacities, hours, grading, account selection, populated role pages, private evaluations, real certificate PDF, untouched/edited session migration and responsive layouts');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
