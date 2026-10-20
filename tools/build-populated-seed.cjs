/* Deterministic fictional examples for the existing frontend workflows. */
const fs = require('node:fs');
const db = JSON.parse(fs.readFileSync('shared/data/starter-seed-v1.json', 'utf8'));
db.seedRevision = '2026-10-20-evaluation-50-1';
db.evaluationModel = 'company-academic-50-v1';
db.policy.companyMaximum = 50; db.policy.academicMaximum = 50;
delete db.policy.reportMaximum; delete db.policy.presentationMaximum;
db.policy.interpretation = 'Owner-defined project workflow: company 50 + academic supervisor 50, followed by coordinator approval after all training requirements are met.';
const names = ['غيث عموره','نور العمري','يزن الأحمد','هلا الزعبي','لين حداد','عمر بني هاني','سارة الخطيب','أحمد الرواشدة','مريم العتوم','زيد الشبول','رهف المومني','ليث عبيدات'];
const majors = ['cs','cis','bit','cys','dai','drg','cs','cis','bit','cys','dai','drg'];
const groups = [1,1,1,2,2,2,1,1,1,2,2,2];
for (let i=1;i<=12;i++) {
  db.users['student-'+i] = {...db.users['student-'+Math.min(i,6)], name:names[i-1], email:`student${i}@students.yu.edu.jo`, majorId:majors[i-1], studentNumber:String(2023100000+i), completedCredits:102+i*2, requiredHours:[4,8].includes(i)?252:288, term:[4,8].includes(i)?'Regular':'Summer', groupId:'group-'+groups[i-1], firstLogin:false, phone:'', cvLink:'', portfolioLink:''};
}
db.users['coordinator-1'].name = 'رنا الخطيب';
db.users['academic-1'].name = 'د. أحمد حداد';
db.users['academic-2'].name = 'د. لينا الزعبي';
db.users['company-1'].name = 'عمر الناصر';
db.users['company-2'].name = 'سارة خليل';
db.users['company-3'] = {name:'خالد العزام', email:'supervisor@pixel.example',role:'company',companyId:'pixel',phone:'',firstLogin:false,status:'Active',jobTitle:'Interactive Media Lead'};
db.companies.northstar = {name:'شركة آفاق للبرمجيات',city:'Irbid',industry:'Software and information systems',website:''};
db.companies.horizon = {name:'شركة مدار للحلول الرقمية',city:'Amman',industry:'Cybersecurity and data analytics',website:''};
db.companies.pixel = {name:'شركة بكسل للتقنيات التفاعلية',city:'Irbid',industry:'Digital reality and game development',website:''};
db.groups['group-1'].name = 'مجموعة اليرموك الأولى';
db.groups['group-2'].name = 'مجموعة اليرموك الثانية';
const opportunitySpecs = [
  ['Software Development Intern','northstar','company-1',['cs','cis'],'Build accessible interfaces and test practical software features with a company supervisor.','HTML, CSS, JavaScript and basic version control.'],
  ['Cybersecurity Intern','horizon','company-2',['cys','cs'],'Document network assets, investigate example security events and prepare reviewed incident summaries.','Networking fundamentals, careful documentation and an interest in security.'],
  ['Data and AI Intern','horizon','company-2',['dai','cs','cis'],'Prepare datasets, compare baseline models and communicate findings through supervised analytics work.','Python fundamentals, basic statistics and clear written explanations.'],
  ['Digital Reality Intern','pixel','company-3',['drg','cs'],'Create interactive environments, prototype gameplay and document usability feedback.','Basic 3D tooling or game-engine experience and a small portfolio.'],
  ['Business Systems Intern','horizon','company-2',['bit','cis'],'Map a business process, analyse requirements and prepare a working information-system prototype.','Process modelling, spreadsheets and communication skills.'],
  ['Information Systems Intern','northstar','company-1',['cis','cs'],'Design accessible records screens, validate data-entry flows and prepare a training project report.','Database concepts, wireframing and foundational web development.'],
  ['Frontend Interface Intern','northstar','company-1',['cs','cis','bit'],'Improve responsive page layouts, test keyboard access and document interface decisions.','Responsive HTML/CSS, JavaScript and attention to accessibility.'],
  ['Quality Assurance Intern','northstar','company-1',['cs','cis','bit'],'Write test cases, reproduce interface defects and verify corrected training project features.','Structured problem solving and clear bug reports.'],
  ['Game Design Intern','pixel','company-3',['drg'],'Prototype a playable level and refine controls using structured playtest notes.','Game design fundamentals and a playable portfolio prototype.'],
  ['Business Intelligence Intern','horizon','company-2',['bit','dai','cis'],'Prepare reporting datasets and build an understandable operations dashboard from sample business records.','Data cleaning, analytical reasoning and chart design.'],
  ['Network Operations Intern','horizon','company-2',['cys','cs'],'Document a supervised network lab and review operational logs with the technical team.','Networking fundamentals and disciplined record keeping.'],
  ['Interactive Graphics Intern','pixel','company-3',['drg','cs'],'Develop lightweight interactive scenes and optimise graphics for laptop and phone screens.','JavaScript or a game engine, graphics fundamentals and a portfolio.'],
];
db.opportunities = Object.fromEntries(opportunitySpecs.map(([title,companyId,supervisorId,majorIds,description,requirements],i)=>['opportunity-'+(i+1),{title,companyId,supervisorId,majorIds,description,requirements,seats:[5,4,3,4,5,4,3,4,3,4,3,2][i],status:i===10?'Closed':'Open',deadline:'2026-11-30',location:db.companies[companyId].city}]));
for (const c of ['applications','placements','tasks','submissions','hourEntries','academicComments','companyEvaluations','academicEvaluations','completions','contactMessages']) db[c]={};
function application(id, student, op, state, created='2026-09-20', reason='') {
  db.applications[id]={studentId:'student-'+student,opportunityId:'opportunity-'+op,status:state,statement:'I would like to apply my academic knowledge through supervised practical work and contribute to the team’s training project.',createdAt:created+'T09:00:00Z',reason};
  if (state!=='Pending') db.applications[id].decidedAt=created+'T13:00:00Z';
  if (state==='Confirmed') db.applications[id].confirmedAt=created+'T15:00:00Z';
}
const placements = [
  ['placement-student-1',1,1,'2026-10-01','2026-11-25','active'],
  ['placement-1',2,6,'2026-08-02','2026-09-26','academic'],
  ['placement-student-4',4,2,'2026-10-01','2027-01-06','active'],
  ['placement-student-5',5,3,'2026-07-05','2026-08-29','completed'],
  ['placement-student-6',6,4,'2026-10-01','2026-11-25','active'],
  ['placement-student-7',7,1,'2026-08-02','2026-09-26','coordinator'],
  ['placement-student-8',8,6,'2026-10-01','2027-01-06','active'],
  ['placement-student-11',11,3,'2026-10-01','2026-11-25','active'],
];
const topic = {cs:['Accessible application form','Responsive internship interface','Keyboard navigation review'],cis:['Training records interface','Data-entry validation','Records search and filters'],cys:['Network asset register','Security event investigation','Incident response checklist'],dai:['Training dataset preparation','Baseline prediction model','Analytics findings presentation'],drg:['Interactive environment prototype','Gameplay controls and feedback','Scene performance review']};
const dateOffset=(date,n)=>new Date(Date.parse(date+'T12:00:00Z')+n*86400000).toISOString().slice(0,10);
function workFile(name,content) {return {name,type:'text/plain',size:Buffer.byteLength(content),dataUrl:'data:text/plain;base64,'+Buffer.from(content).toString('base64')};}
function submit(taskId,student,state,date,revision=1) {
  const task=db.tasks[taskId],p=db.placements[task.placementId];
  const id=`submission-${taskId}-${revision}`;
  const description=task.kind==='Final report'?'Final report: training objectives, supervised work, skills developed, evidence of completed tasks and reflections on the training period.':'Completed the assigned work, checked the expected behaviour and documented the results for company review.';
  db.submissions[id]={taskId,studentId:'student-'+student,description,link:'',status:state,createdAt:date+'T09:00:00Z',review:null};
  if (task.kind==='Final report') db.submissions[id].file=workFile('training-report-'+db.users['student-'+student].studentNumber+'.txt',db.users['student-'+student].name+'\n'+description+'\nCompany: '+db.companies[p.companyId].name+'\nTraining period: '+p.startDate+' to '+p.endDate);
  if (state==='Evaluated'||state==='Revision requested') db.submissions[id].review={feedback:state==='Evaluated'?'The work meets the agreed criteria. The revised structure is clear and the supporting evidence is sufficient.':'Please add clear validation messages, include screenshots of the corrected behaviour and explain how you checked the result.',reviewedBy:p.companySupervisorId,reviewedAt:date+'T14:00:00Z'};
}
for (const [pid,student,opId,startDate,endDate,mode] of placements) {
  const user=db.users['student-'+student], op=db.opportunities['opportunity-'+opId], supervisor=db.groups[user.groupId].supervisorId;
  const done=mode!=='active';
  db.placements[pid]={studentId:'student-'+student,opportunityId:'opportunity-'+opId,companyId:op.companyId,companySupervisorId:op.supervisorId,startDate,endDate,status:mode==='completed'?'Completed':'Active'};
  const weekCount = Math.ceil((Date.parse(endDate)-Date.parse(startDate)+86400000)/(7*86400000));
  const weeklyThemes = [
    ['Orientation & environment',['Understand the company workflow and training expectations','Set up the working environment and document access requirements','Agree on the training goals with the company supervisor']],
    ['Foundations & requirements',['Review the project requirements and relevant tools','Document the main workflow and expected outcomes','Discuss the proposed approach with the company supervisor']],
    ['Practical development',[`Develop practical skills through ${op.title.toLowerCase()} activities`,'Apply the agreed approach to a supervised example','Record observations and questions in the training notes']],
    ['Testing & validation',['Check the expected behaviour using a repeatable method','Document issues and proposed improvements','Review findings with the company supervisor']],
    ['Integration & quality',['Connect the reviewed work into the wider project','Check consistency, accessibility and documentation','Apply the company supervisor’s feedback']],
    ['Review & improvement',['Demonstrate the current work and explain key decisions','Resolve the issues identified during review','Document the improvements and supporting evidence']],
    ['Delivery & documentation',['Prepare clear handover notes for the work completed','Review the project documentation for completeness','Explain remaining limitations and recommended next steps']],
    ['Handover & reflection',['Demonstrate the training outcomes to the company supervisor','Reflect on the skills developed during training','Organise supporting evidence for the final training report']]
  ];
  db.placements[pid].weeklyPlan = Array.from({length:weekCount},(_,i)=>{
    const [title,targets]=weeklyThemes[Math.floor(i*weeklyThemes.length/weekCount)];
    return {title,targets,plannedHours:user.requiredHours/weekCount};
  });
  db.placements[pid].weeklyReports = Object.fromEntries(Array.from({length:done?weekCount:3},(_,i)=>[String(i+1),[{
    text:i===0?'Reviewed the training expectations, prepared the working environment and discussed the project workflow with the company supervisor.':i===1?'Completed the initial requirements review and demonstrated the approach. Keep the training notes clear and include supporting evidence for the next review.':'Reviewed practical progress against the weekly targets. Continue refining the work and documenting the changes discussed with the company supervisor.',
    plan:structuredClone(db.placements[pid].weeklyPlan[i]),authorId:op.supervisorId,createdAt:dateOffset(startDate,Math.min((i+1)*7-1,done?weekCount*7-1:18))+'T14:00:00Z'
  }]]));
  application(student===2?'application-1':`application-confirmed-${student}`,student,opId,'Confirmed',dateOffset(startDate,-4));
  const tasks=[...(topic[user.majorId]||topic.cis),'Progress report: training outcomes','Final internship report'];
  tasks.forEach((title,index)=>{
    const tid=student===2&&index===0?'task-1':student===2&&index===4?'task-2':`task-student-${student}-${index+1}`;
    const kind=index===4?'Final report':index===3?'Progress report':'Task';
    db.tasks[tid]={placementId:pid,title,description:index===4?'Summarise the placement, completed work, skills acquired and evidence of progress. Include a reflection on company feedback.':`Prepare ${title.toLowerCase()}, describe your approach and include evidence of the completed work.`,deadline:index===4?dateOffset(endDate,7):done?dateOffset(endDate,-16+index*4):['2026-10-12','2026-10-22','2026-10-29','2026-10-19'][index],kind,createdBy:op.supervisorId};
    if(done) submit(tid,student,'Evaluated',dateOffset(endDate,index===4?2:-12+index*3));
    else if(index===0){ submit(tid,student,'Revision requested','2026-10-09'); submit(tid,student,'Evaluated','2026-10-12',2); }
    else if(index===1) submit(tid,student,student===4||student===11?'Submitted':'Revision requested','2026-10-18');
    else if(index===3) submit(tid,student,'Submitted','2026-10-19');
  });
  const days=done?user.requiredHours/6:14;
  let recorded=0;
  for(let offset=0;recorded<days;offset++) {
    const day=dateOffset(startDate,offset);
    if(new Date(day+'T12:00:00Z').getUTCDay()===5) continue;
    const id=`hours-student-${student}-${++recorded}`;
    db.hourEntries[id]={placementId:pid,date:day,hours:6,description:`Supervised practical work: ${tasks[(recorded-1)%3].toLowerCase()}; progress notes and company feedback review.`,status:'Approved',recordedBy:op.supervisorId,reviewNote:'Verified against the company training record.',reviewedBy:supervisor,reviewedAt:day+'T16:00:00Z'};
  }
  if(!done){
    for(const day of ['2026-10-18','2026-10-19']) db.hourEntries[`hours-pending-${student}-${day}`]={placementId:pid,date:day,hours:3,description:'Company-supervised task refinement and documentation.',status:'Pending',recordedBy:op.supervisorId,reviewNote:''};
    db.hourEntries[`hours-returned-${student}`]={placementId:pid,date:'2026-10-17',hours:6,description:'Practical work record requiring a clearer activity description.',status:'Returned',recordedBy:op.supervisorId,reviewNote:'Please clarify the activities completed during this entry.',reviewedBy:supervisor,reviewedAt:'2026-10-18T10:00:00Z'};
  }
  for(let week=1;week<=3;week++) db.academicComments[`comment-${student}-${week}`]={placementId:pid,text:['Your submitted evidence shows steady progress. Keep connecting each task to its learning objective.','Review the company feedback before your next submission. Keep hour descriptions specific to the work completed.','Prepare a concise summary of the skills gained and supporting examples for your final report.'][week-1],authorId:supervisor,createdAt:dateOffset(startDate,Math.min(week*4,18))+'T12:00:00Z'};
  if(done){
    db.companyEvaluations[pid]={placementId:pid,score:45,total:45,maximum:50,model:'company-academic-50-v1',comments:'Consistent progress, careful documentation and constructive responses to feedback. The trainee completed the assigned work and contributed well to the team.',authorId:op.supervisorId,sentAt:dateOffset(endDate,3)+'T09:00:00Z'};
    if(mode!=='academic') db.academicEvaluations[pid]={placementId:pid,score:45,total:45,maximum:50,model:'company-academic-50-v1',reviewedCompanySentAt:db.companyEvaluations[pid].sentAt,comments:'The training evidence, final report and presentation demonstrate the expected academic outcomes. Required hours and assigned work have been reviewed.',authorId:supervisor,sentAt:dateOffset(endDate,4)+'T10:00:00Z'};
    if(mode==='completed') db.completions[pid]={placementId:pid,studentId:'student-'+student,certificateNumber:'YU-TRAIN-2026-0051',approvedBy:'coordinator-1',approvedAt:dateOffset(endDate,5)+'T12:00:00Z',message:'Congratulations! You have successfully completed your internship.'};
  }
}
application('application-2',3,5,'Pending','2026-10-16');
application('application-offer-3',3,7,'Accepted','2026-10-17');
application('application-offer-alternative-3',3,10,'Accepted','2026-10-18');
application('application-pending-9',9,5,'Pending','2026-10-18');
application('application-rejected-9',9,8,'Rejected','2026-10-12','The company selected a candidate with more experience in interface testing. You are welcome to apply for a future training intake.');
application('application-accepted-10',10,2,'Accepted','2026-10-19');
application('application-pending-10',10,11,'Pending','2026-10-16');
application('application-not-selected-1',1,7,'Not selected','2026-09-24');
application('application-not-selected-4',4,11,'Not selected','2026-09-25');
const messages=[['محمود عبيدات','mahmoud.obeidat@example.com','Required training documents','Which documents should I prepare before the practical training period starts?','New'],['دانا العزام','dana.azzam@example.com','Academic group assignment','I would like clarification about the academic group assigned to my training record.','Read'],['عبدالله الشبول','abdullah.shboul@example.com','Company training contact','Please confirm which coordinator contact should receive our company training information.','New'],['إسراء المومني','esraa.momani@example.com','Completion certificate','Thank you for confirming that the approved certificate is available in my training record.','Archived']];
messages.forEach(([name,email,subject,message,status],i)=>db.contactMessages['message-'+(i+1)]={name,email,subject,message,status,createdAt:`2026-10-${19-i}T10:00:00Z`});
fs.writeFileSync('shared/data/firebase-seed.json',JSON.stringify(db,null,2)+'\n');
console.log(Object.fromEntries(Object.entries(db).filter(([,v])=>v&&typeof v==='object').map(([k,v])=>[k,Object.keys(v).length])));
