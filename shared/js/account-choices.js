/* Existing account selection is independent of the login illustration. */
(() => {
  'use strict';
  const picker = document.getElementById('workspaceAccount');
  const email = document.getElementById('loginEmail');
  if (!picker || !email || !window.UIMS) return;
  const role = () => document.querySelector('.lb-role-card[aria-checked="true"]')?.dataset.role || 'student';
  const identity = account => {
    const badge = document.getElementById('badgeName'), initials = document.getElementById('badgeInitials');
    if (badge) { badge.textContent = account.name; badge.dir = 'auto'; }
    if (initials) initials.textContent = account.name.replace(/^د\.\s*/, '').split(/\s+/).map(word => word[0]).slice(0,2).join('');
  };
  function populate() {
    if (!UIMS.db) return;
    const accounts = Object.entries(UIMS.db.users).filter(([,user]) => user.role === role() && user.status === 'Active');
    picker.replaceChildren();
    for (const [id, account] of accounts) {
      let context = '';
      if (account.role === 'student') {
        const placement = UIMS.placement(id);
        context = placement?.status === 'Completed' ? 'Completed internship' : placement ? 'Training record' : UIMS.all('applications').some(a => a.studentId === id && a.status === 'Accepted') ? 'Offer awaiting confirmation' : 'Applications and opportunities';
      } else if (account.role === 'company') context = UIMS.db.companies[account.companyId]?.name || '';
      const option = new Option(account.name + (context ? ' · ' + context : ''), id);
      option.selected = account.email.toLowerCase() === email.value.toLowerCase();
      picker.append(option);
    }
    const selected = UIMS.db.users[picker.value];
    if (selected) { email.value = selected.email; identity(selected); }
  }
  picker.addEventListener('change', () => {
    const account = UIMS.db?.users[picker.value];
    if (!account || account.role !== role()) return;
    email.value = account.email;
    email.classList.remove('is-invalid');
    const error = document.getElementById('emailError');
    if (error) error.style.display = 'none';
    identity(account);
  });
  document.addEventListener('click', event => { if (event.target.closest('.lb-role-card')) populate(); });
  email.addEventListener('input', () => {
    const match = Object.entries(UIMS.db?.users || {}).find(([,user]) => user.role === role() && user.email.toLowerCase() === email.value.trim().toLowerCase());
    picker.value = match?.[0] || '';
    if (match) identity(match[1]);
  });
  UIMS.ready.then(populate).catch(() => picker.replaceChildren(new Option('Accounts unavailable', '')));
})();
