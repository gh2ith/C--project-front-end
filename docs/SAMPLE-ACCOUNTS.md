# Populated training records

The website includes fictional, connected examples for exploring the existing frontend workflows. Names are in Arabic script; interface labels remain in English. These are local frontend records, not university account provisioning, authentication or database writes.

Choose a role and an account on the login page. The chooser fills the existing email field. The current frontend form accepts nonempty throwaway text in its password field; it never verifies, stores or transmits credentials. Do not enter a real password.

| Account | Email | Records to inspect |
| --- | --- | --- |
| غيث عموره | student1@students.yu.edu.jo | Active software internship, weekly targets/company reports, reviewed task, revision request, submitted progress report, pending hours and academic comments |
| نور العمري | student2@students.yu.edu.jo | Finished training period and reviewed final report; the academic supervisor has received the company evaluation |
| يزن الأحمد | student3@students.yu.edu.jo | Pending application and two accepted offers; confirming one creates the placement |
| هلا الزعبي | student4@students.yu.edu.jo | Active regular-semester cybersecurity placement |
| لين حداد | student5@students.yu.edu.jo | Completed internship, successful-completion message and downloadable/printable certificate |
| عمر بني هاني | student6@students.yu.edu.jo | Active interactive-environment training, company feedback and progress records |
| سارة الخطيب | student7@students.yu.edu.jo | Finished training and both evaluations; ready for coordinator completion review |
| أحمد الرواشدة | student8@students.yu.edu.jo | Active information-systems placement with submissions, revisions and hours |
| مريم العتوم | student9@students.yu.edu.jo | Pending and rejected applications, including the company's rejection reason |
| زيد الشبول | student10@students.yu.edu.jo | Accepted cybersecurity offer awaiting student confirmation |
| رهف المومني | student11@students.yu.edu.jo | Active data/AI placement with company-reviewed work |
| ليث عبيدات | student12@students.yu.edu.jo | Opportunities for Digital Reality and Game Development, before applying |
| عمر الناصر | supervisor@northstar.example | Company supervisor at شركة آفاق للبرمجيات |
| سارة خليل | supervisor@horizon.example | Company supervisor at شركة مدار للحلول الرقمية |
| خالد العزام | supervisor@pixel.example | Company supervisor at شركة بكسل للتقنيات التفاعلية |
| د. أحمد حداد | academic@yu.edu.jo | First academic group, company evaluation for نور and final completion record for سارة |
| د. لينا الزعبي | lina@yu.edu.jo | Second academic group, hours reviews and completed placement for لين |
| رنا الخطيب | coordinator@yu.edu.jo | All placements, account/group management, completion approval and four Contact Us messages |

Students see task completion, feedback, revisions, hours and progress. They do not see final evaluation forms, component grades or the calculated final result. The completed placement satisfies all required completion checks and is read-only. The placement awaiting coordinator review also satisfies every check, but has no released certificate until approval.

## Data and migration

`shared/data/firebase-seed.json` contains 18 accounts, three companies, two supervised groups, twelve opportunities, seventeen applications, eight placements, forty tasks, thirty-five submissions, 229 dated hour entries, twenty-four academic comments, three company evaluations, two academic evaluations, one completion and four contact messages.

`tools/build-populated-seed.cjs` deterministically rebuilds the examples. All records use fixed 2026 training dates, points-free task reviews and company/academic evaluations out of 50 and the existing four-role model. No new services are introduced.

`shared/data/starter-seed-v1.json` is the original minimal dataset, retained only as the session migration baseline and the isolated workflow-test fixture. An untouched old tab upgrades to the populated records. If its user has changed a placement, application, submission, hours review or evaluation, that student's connected workflow is preserved instead of receiving conflicting sample history. Personal edits and user-created messages/accounts remain intact. Names change to Arabic only when they still match the original starter name. Signing out retains the tab's records.

`tools/verify-populated-data.cjs` verifies relationships, major eligibility, seat/group capacities, dates, grades, completion checks, account selection, role pages, student privacy, a real certificate PDF, responsive layout and both untouched/edited session migration.
