# Required frontend scope and university policy

Authority: C# Project 3.docx, followed by the user's October 20, 2026 clarifications. Frontend only, owned entirely by Yarmouk University, exclude optional features, provide Realtime Database JSON. The latest owner-defined evaluation model supersedes earlier project marking assumptions. Students see task-level feedback/progress and, upon completion, a message and certificate; final evaluation forms and results stay private.

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
2. The published 30/20/50 breakdown above is retained as research history. The owner explicitly replaced the implemented workflow with company 50 + academic supervisor 50 = 100. This is an owner-defined project rule, not a claim about the published CIS policy. No separate report/presentation marks are calculated.
3. The brief requires separate hours approval but does not define the digital process. Company records dated hours; assigned academic supervisor approves or returns them. Task completion never generates approved hours.
4. Student offer confirmation begins the local training period using the regular/summer duration. No second hiring decision is introduced.
5. Company submits a single grade from 0–50 with comments. Only then can the assigned academic supervisor review that assessment and submit their own grade from 0–50 with comments to the coordinator. The coordinator acts as the college approval authority within the existing four-role model; no fifth administrator role is introduced.

Tasks have no points, numeric criteria, or numeric submission grades. Company reviews work as completed or requests revisions with feedback; prior submissions and files remain in history. Final reports are reviewed without points and remain a completion requirement. The final /100 result is solely company /50 plus academic /50. Academic submission places the combined assessment in coordinator review; it does not release a student success message.

Completion approval requires both final evaluations, approved required hours, completed/reviewed tasks, a final report, passing result and ended training period. Completed internships are read-only. One PDF certificate is released, with no separate completion-report service.

## Video and validation

The student retains horizontal pill navigation, application rows and training-record styling. Explore contains one searchable horizontal opportunity showcase with swipe/drag browsing, previous/next controls and direct role selection. Explore is the student landing page; the student Dashboard is removed, with its old URL redirecting to Explore. Non-student portals retain the white icon rail, hover/keyboard expansion, collapse control and session-level Keep sidebar open switch. No superseded services are reintroduced. The supplied Yarmouk University logo is the sole identity on public pages, login, workspace headers and completion certificates. There is no personal brand or collaboration identity.

About Us embeds the locally authored process WebM with captions. The homepage now uses its own interactive 3D experience rather than an embedded video section. No Google Flow account is required.

Local verification results are recorded under `output/`. Verification covers cross-role application/confirmation, task revisions/history, separate hours verification, completion gates, certificate PDF, role guards, inactive accounts and desktop/phone layout.


## University ownership and palette — October 20, 2026
The website belongs entirely to Yarmouk University. The user specified Royal Green #006837 for navigation, primary actions, active indicators and headings; Metallic Gold #C5A059 for heritage and official-document accents; deep emerald #002e18–#003a1e for the backdrop; and white/soft-gray surfaces for readable interfaces. The shared university-theme stylesheet applies to every active HTML page. Login, the process video, HTML certificates and generated PDF certificates use only university identity. Historical browser-session data and appearance preferences migrate into the `yarmouk:` namespace without changing internship records.


## Continuous homepage — local review
The owner rejected architectural doors and stacked homepage sections. Following the supplied exploded-view references, the homepage uses one full-screen 3D scene. The constructed wheat has 26 grains with separate metal shells and inner cores, ribs, awns, leaves and a segmented stem. Scrolling rotates, separates and reassembles it. Direct chapter navigation, keyboard controls, model-only inspection, desktop dragging and idle-motion pause control the same scene. Reduced-motion, image and no-JavaScript fallbacks remain available. The university chapter retains the intact official jubilee image, full faculty name and a dialog listing all six majors. All four roles are identified. Wheat is presentation artwork, not an additional brand or an official university logo. All changes remain local until explicit publication approval.

Latest evaluation migration: previous final assessments are retained under legacyEvaluations and do not silently become marks under the new model. Pending placements require new /50 evaluations. Already approved completions remain historical, read-only records. Task numeric criteria/scores are removed while qualitative review and file history remain.
