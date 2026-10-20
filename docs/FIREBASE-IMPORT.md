# Firebase Realtime Database import

Upload `shared/data/firebase-seed.json` through your Firebase console → Build → Realtime Database → Data → overflow menu → Import JSON.

Use a new database or back up existing data first: importing at the root replaces the existing root. No cloud operation has been performed by this task.

The file includes university/majors, policy, users (profiles only), companies, groups, opportunities, applications, placements, tasks, submissions, hourEntries, academicComments, companyEvaluations, academicEvaluations, completions and contactMessages. All collections use Firebase-compatible string keys and cross-reference their record IDs.

Realtime Database drops empty objects. Empty collection placeholders may disappear on import; the frontend normalizes missing collections to empty objects.

This is a database import, not a Firebase Authentication import. Provision actual accounts using a trusted backend/Admin SDK later; use their real Auth UIDs and update references consistently. Never add passwords to this JSON or database profiles.

Before integration, enforce authenticated role access, company ownership, student/group assignments, seat reservations, single-offer confirmation and coordinator completion gates using database rules and trusted operations. Students must not read company/academic final evaluations by direct requests. Do not enable public test-mode access.

The frontend currently reads the seed and saves actions to browser-session storage. Importing JSON does not connect it to Firebase or enable real authentication, password recovery, file storage, database writes or synchronization. Local attachment data is not included in the seed; file storage must be connected later.
