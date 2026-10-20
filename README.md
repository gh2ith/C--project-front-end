# Bridgeway internship frontend

Local frontend for Yarmouk University's Faculty of Information Technology and Computer Science. The original Bridgeway identity, bridge animation and login badge remain. Required features follow C# Project 3.docx and the user's clarifications; optional features are excluded.

Read [AGENTS.md](AGENTS.md) before changing workflows. The authorized repository is `gh2ith/C--project-front-end`; pushes to its `main` branch publish the static frontend through GitHub Pages. Do not push this version to the former Bridgeway repository.

## Run locally

Use Live Server from the root, or `python -m http.server 8080 --bind 127.0.0.1`, then open `http://127.0.0.1:8080/`. There is no build step. A static server is needed to load JSON.

## Accounts

Select the matching role on Login and use an account email. Any nonempty password opens the local frontend; credentials are not verified or stored.

| Role | Account email |
| --- | --- |
| Student, first login | student1@students.yu.edu.jo |
| Student, active internship | student2@students.yu.edu.jo |
| Company Supervisor | supervisor@northstar.example |
| Academic Supervisor | academic@yu.edu.jo |
| University Internship Coordinator | coordinator@yu.edu.jo |

First-login password setup validates the form and records the setup step only for the session. It cannot change a real credential. Remaining fixture accounts are in the JSON.

## Files

- `shared/data/firebase-seed.json`: Firebase Realtime Database root import file and initial frontend data. No passwords or Firebase credentials.
- [Firebase import instructions](docs/FIREBASE-IMPORT.md): data shape and integration requirements.
- [Requirements and university research](docs/REQUIREMENTS.md): feature scope, verified facts and proposed assumptions.
- `pages/<role>-<screen>/`: dedicated screens for the four required roles.
- `shared/js/uims-store.js`: local state and workflow/ownership guards.
- `shared/js/uims-app.js`: shared components and page rendering.
- `shared/css/uims.css`: shared portal controls and surfaces.
- `shared/css/restored-workspace.css`, `shared/js/workspace-chrome.js`: original student studio/header and collapsible white sidebar, with the Keep sidebar open preference.
- Opportunities use one searchable horizontal showcase on Explore; Explore is the student landing page and the student Dashboard is removed.
- `assets/yarmouk-college-logo.png`: the university collaboration logo supplied by the project owner; Bridgeway's own logo remains unchanged.
- `assets/internship-process.mp4`: locally authored captioned process video. Editable source/notes: `docs/process-film/`.
- `shared/vendor/`: local PDF generation dependency and license.

## Internship cycle

Coordinator creates supervisors/groups and student accounts with academic assignments. Student applies; company accepts/rejects with a rejection reason. Student confirms one offer. Company creates tasks, reviews submissions and requests revisions. Company records hours and the academic supervisor verifies them separately. Company submits a final evaluation; academic supervisor sends their separate academic evaluation to the coordinator. After all requirements and the training period are met, coordinator approval releases the student completion message and downloadable/printable certificate. Students never see final evaluation forms or final grades.

## Local behavior and integration limits

Actions and selected files (up to 1 MB each) persist in the same tab via `sessionStorage`, using `bridgeway:uims:v1`. Logout retains records so other roles can continue. A new session starts from the JSON. No server uploads occur.

This task does not implement Firebase, ASP.NET, real login, credential provisioning, recovery email, secure permissions or cross-user synchronization. Importing JSON does not create Firebase Authentication accounts. Browser data is inspectable by the device user; frontend guards cannot enforce security. Future database rules/backend operations must enforce role access and evaluation privacy.

Certificates are generated locally from approved local records and do not claim an actual university signature. Ignored historical archives/output are not runtime features or workflow authority. A recovery snapshot of the prior runtime is stored outside the checkout in the system temporary directory.
