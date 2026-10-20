# Yarmouk University Internship Management

University-owned internship frontend for Yarmouk University's Faculty of Information Technology and Computer Science. Yarmouk's supplied logo is the sole identity, with Royal Green #006837, Metallic Gold #C5A059, deep emerald #002e18–#003a1e and white/soft-gray surfaces. There is no personal brand or collaboration identity. The homepage retains its continuous 3D wheat experience; portal layouts and the interactive login badge retain their established behavior. Required features follow C# Project 3.docx and the user's clarifications; optional features are excluded.

Read [AGENTS.md](AGENTS.md) before changing workflows. The pending Yarmouk University redesign is local for review: do not push or deploy without new owner authorization. The project repository is `gh2ith/C--project-front-end`; never use the former Bridgeway repository.

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
- `assets/yarmouk-college-logo.png`: the supplied university logo. The SVG variants frame that same artwork for navigation and the favicon; the 3D wheat is presentation artwork, not an additional logo.
- `shared/css/university-theme.css`: shared university colors, surfaces, navigation and document styling.
- `design-system/yarmouk-portal/MASTER.md`: portal layout guidance; neutral full-width canvases replace the rejected emerald surround and large rounded outer frame.
- `assets/yarmouk-journey.webm`: locally authored captioned process video on About Us.
- `pages/home/home.js`: procedural sculpture, physically separate shells and scroll choreography; `tools/verify-exploded-home.cjs` verifies the experience.
- `shared/vendor/`: local Three.js and PDF generation dependencies, with licenses.

## Internship cycle

Coordinator creates supervisors/groups and student accounts with academic assignments. Student applies; company accepts/rejects with a rejection reason. Student confirms one offer. Company creates tasks, reviews submissions and requests revisions. Company records hours and the academic supervisor verifies them separately. Company submits a final evaluation; academic supervisor sends their separate academic evaluation to the coordinator. After all requirements and the training period are met, coordinator approval releases the student completion message and downloadable/printable certificate. Students never see final evaluation forms or final grades.

## Local behavior and integration limits

Actions and selected files (up to 1 MB each) persist in the same tab via `sessionStorage`, using `yarmouk:uims:v1`. Logout retains records so other roles can continue. A new session starts from the JSON. No server uploads occur.

This task does not implement Firebase, ASP.NET, real login, credential provisioning, recovery email, secure permissions or cross-user synchronization. Importing JSON does not create Firebase Authentication accounts. Browser data is inspectable by the device user; frontend guards cannot enforce security. Future database rules/backend operations must enforce role access and evaluation privacy.

Certificates are generated locally from approved local records and do not claim an actual university signature. Ignored historical archives/output are not runtime features or workflow authority. A recovery snapshot of the prior runtime is stored outside the checkout in the system temporary directory.
