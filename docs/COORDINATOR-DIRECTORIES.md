# Coordinator directories

Restored the earlier student roster and faculty directory compositions, plus the company account directory formerly shown under the other admin role. These now live under the current coordinator and Yarmouk theme.

- Students: identity, major/department, faculty, inline supervisor/group assignment dropdown and Save, account status and edit action. Full assigned-supervisor/group text remains below the select.
- Supervisors: identity/contact, department, faculty, assigned-student count, status and edit action.
- Companies: company identity/industry, supervisor contacts, city, internship post count, access and edit company action. Records with multiple company supervisors keep every contact and account edit action.
- Existing registration/editing dialogs, active supervised groups, group-capacity validation and tab-session persistence remain in use. Invalid assignments do not change a record. Account creation does not collect passwords.
- Search supports empty results. Laptop lists scroll inside their content panels; mobile rows stack with field labels. Existing sidebar and account controls remain.

Verified with `node tools/verify-coordinator-directories.cjs`: all three pages at1440x900,1366x768,1280x650 and390x844; search/reset and empty state; assignment save/reload and invalid-group rejection; account dialogs; dark theme; no runtime errors or horizontal overflow; no document scrolling at the checked laptop sizes. Screenshots remain local under output/directories/.
