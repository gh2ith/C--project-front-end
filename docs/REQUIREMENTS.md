# Required frontend scope and university policy

Authority: C# Project 3.docx, followed by the user's October 20, 2026 clarifications. Frontend only, preserve Bridgeway's existing design and logo, treat Yarmouk as collaborator, exclude optional features, provide Realtime Database JSON. Students see task-level feedback/progress and, upon completion, a message and certificate; final evaluation forms and results stay private.

## Pages

| Role | Required screens |
| --- | --- |
| Public | Existing animated Home; About Us; Contact Us; Login with password visibility/recovery interface |
| Account setup | First Login / Change Temporary Password |
| Student | Dashboard; My Profile; Explore Opportunities; separate Application Form; My Applications; My Tasks; My Progress & Evaluation |
| Company Supervisor | Dashboard; Manage Opportunities; Applications Review; My Trainees; Manage & Review Tasks; Reports & Final Evaluation; Supervisor Account |
| Academic Supervisor | Dashboard; Student Progress Monitor; Final Academic Evaluation; Academic Supervisor Account |
| Coordinator | Dashboard; Manage Students; Manage Companies/supervisor accounts; Manage Academic Supervisors; Assign Academic Supervisors; Monitor Placements & Progress; Final Completion Review; Contact Messages; Coordinator Account |

Routes follow `pages/<role>-<screen>/<role>-<screen>.html`. Login derives the account role from a known profile; page and mutation guards enforce the intended local workflow. These are frontend guards, not security.

Removed runtime features: Platform Admin, College Admin, multi-university administration, partnerships, listing moderation/restrictions, support tickets, notifications, interviews, AI CV matching, fixed checklist logbooks, report-visibility controls, rating/radar tools, bulk import and workbook export.

## University research

Researched October 20, 2026, from official Yarmouk sources:

- [Faculty programs](https://it.yu.edu.jo/index.php/newsar/453-2025-10-09-11-37-45): Computer Science; Computer Information Systems; Business Information Technology; Cybersecurity; Data Science and Artificial Intelligence; Digital Reality and Game Development.
- [CIS498 practical training rules](https://it.yu.edu.jo/images/IT_Faculty/Practical_Training_-_RULES.pdf). All three pages were visually inspected because automatic extraction corrupts Arabic digits. The source applies explicitly to Computer Information Systems.

Verified CIS requirements: at least 98 completed credits. Regular semester: 14 weeks at 18 hours/week, totaling 252. Summer: eight weeks at 36 hours/week, totaling 288. Academic supervision contributes 30%; company report 20%; final student report/presentation 50%. Passing is 50%. Student final report is due within one week of the end of training. The academic supervisor monitors attendance, seriousness and acquired skills.

## Proposed assumptions that are not official rules

1. The detailed source is CIS-specific. The same policy is used as a proposed baseline for the other five majors until department-specific requirements are confirmed. Coordinator can edit individual required hours. Do not describe this as a verified faculty-wide rule.
2. Article 7 gives 50% for the report/presentation component, with ambiguous wording about the internal presentation share. The implementation uses 25 report + 25 presentation. This equal split is a documented assumption. Combined with 30 academic and 20 company it yields the automatically calculated final result.
3. The brief requires separate hours approval but does not define the digital process. Company records dated hours; assigned academic supervisor approves or returns them. Task completion never generates approved hours.
4. Student offer confirmation begins the local training period using the regular/summer duration. No second hiring decision is introduced.
5. The company component uses four proposed five-point criteria: technical performance, professional conduct, communication/teamwork, attendance/commitment. The official source establishes the 20% component but not these internal criterion labels/weights. The academic supervisor records academic/report/presentation component scores and qualitative comments without claiming an official form.

Task criteria have their own maximums. Final component weights are independent of arbitrary task points. Final report company feedback supports academic review; the academic supervisor records the final report component assessment. Company sends its final evaluation first; academic sends their separate evaluation to the coordinator.

Completion approval requires both final evaluations, approved required hours, evaluated tasks, a final report, passing result and ended training period. Completed internships are read-only. One PDF certificate is released, with no separate completion-report service.

## Video and validation

The student retains the original horizontal pill navigation, application rows and training-record styling. Explore contains one searchable opportunity list with details in a dialog. The dashboard contains application statistics, upcoming tasks and current training progress, without repeating the opportunity catalog. This replaces the stacked gallery at the user's request. Non-student portals use the original white icon rail with hover/keyboard expansion, an explicit collapse control and a persistent session-level Keep sidebar open switch. No superseded services are reintroduced. The owner-supplied university logo appears as a collaboration mark on the faculty section, About Us, workspace headers and completion certificates; Bridgeway keeps its own identity.

The homepage's dedicated process section and About Us embed the locally authored process MP4 with captions. Editable source and production notes are in `docs/process-film/`. No Google Flow account is required.

Local verification results are recorded under `output/`. Verification covers cross-role application/confirmation, task revisions/history, separate hours verification, completion gates, certificate PDF, role guards, inactive accounts and desktop/phone layout.
