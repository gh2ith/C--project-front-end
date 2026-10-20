/* Required UIMS screens. The same frontend model powers all four local role workflows. */
(() => {
  "use strict";
  const U = window.UIMS;
  const E = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const role = document.documentElement.dataset.role,
    view = document.documentElement.dataset.view;
  const params = new URLSearchParams(location.search);
  let monitorStudentQuery = "";
  let evaluationStudentQuery = "";
  let companyStudentQuery = "";
  const names = {
    student: "Student",
    company: "Company Supervisor",
    supervisor: "Academic Supervisor",
    coordinator: "University Internship Coordinator",
  };
  const nav = {
    student: [
      ["opportunities", "Explore Opportunities", "briefcase"],
      ["applications", "My Applications", "send-check"],
      ["tasks", "My Tasks", "list-task"],
      ["progress", "My Progress & Evaluation", "graph-up-arrow"],
      ["profile", "My Profile", "person-circle"],
    ],
    company: [
      ["dashboard", "Company Dashboard", "grid"],
      ["opportunities", "Manage Opportunities", "briefcase"],
      ["applications", "Applications Review", "send-check"],
      ["trainees", "My Trainees", "people"],
      ["tasks", "Tasks", "list-task"],
      ["reports", "Weekly Reports", "journal-text"],
      ["evaluations", "Evaluations", "clipboard-check"],
      ["account", "Supervisor Account", "person-circle"],
    ],
    supervisor: [
      ["dashboard", "Academic Dashboard", "grid"],
      ["progress", "Student Progress Monitor", "graph-up-arrow"],
      ["evaluations", "Final Academic Evaluation", "clipboard-check"],
      ["account", "Academic Supervisor Account", "person-circle"],
    ],
    coordinator: [
      ["dashboard", "Coordinator Dashboard", "grid"],
      ["students", "Manage Students", "people"],
      ["companies", "Manage Companies", "buildings"],
      ["supervisors", "Manage Academic Supervisors", "person-badge"],
      ["assignments", "Assign Academic Supervisors", "diagram-3"],
      ["progress", "Monitor Placements & Progress", "graph-up-arrow"],
      ["completion", "Final Completion Review", "patch-check"],
      ["messages", "Contact Messages", "envelope"],
      ["account", "Coordinator Account", "person-circle"],
    ],
  };
  const title = () => nav[role]?.find((x) => x[0] === view)?.[1] || "Yarmouk University";
  const userName = (id) => U.db.users[id]?.name || "Not assigned";
  const companyName = (id) => U.db.companies[id]?.name || "Company";
  const majorName = (id) => U.db.university.majors[id]?.name || "Not specified";
  const date = (value) =>
    value
      ? new Date(value + "T12:00:00").toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "—";
  const stamp = (value) =>
    value
      ? new Date(value).toLocaleString("en-GB", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "—";
  const icon = (name) => `<i class="bi bi-${name}" aria-hidden="true"></i>`;
  const url = (r, v, query = "") => U.route(r, v) + query;
  const link = (label, r, v, query = "", primary = false) =>
    `<a class="ui-button${primary ? " primary" : ""}" href="${E(url(r, v, query))}">${E(label)} ${icon("arrow-up-right")}</a>`;
  const button = (label, action, id = "", primary = false) =>
    `<button type="button" class="ui-button${primary ? " primary" : ""}" data-action="${action}" data-id="${E(id)}">${E(label)}</button>`;
  const status = (value) =>
    `<span class="status ${["Confirmed", "Accepted", "Active", "Approved", "Evaluated", "Completed", "Sent"].includes(value) ? "good" : ["Pending", "Submitted", "Revision requested", "New"].includes(value) ? "wait" : ["Rejected", "Returned", "Inactive"].includes(value) ? "bad" : ""}">${E(value === "Evaluated" ? "Completed" : value)}</span>`;
  const empty = (heading, body, action = "") =>
    `<div class="empty">${icon("inbox")}<h2>${E(heading)}</h2><p>${E(body)}</p>${action}</div>`;
  const table = (heads, rows) =>
    rows.length
      ? `<div class="table-wrap"><table><thead><tr>${heads.map((h) => `<th scope="col">${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`
      : empty(
          "Nothing here yet",
          "Records will appear here as you move through the internship process.",
        );
  const card = (heading, body, ic = "") =>
    `<section class="card-surface">${ic ? `<div class="card-icon">${icon(ic)}</div>` : ""}<h2>${E(heading)}</h2>${body}</section>`;
  const stat = (label, value) =>
    `<div class="stat-card"><small>${E(label)}</small><strong>${E(value)}</strong></div>`;
  const stats = (items) =>
    `<div class="stats">${items.map((x) => stat(...x)).join("")}</div>`;
  const field = (
    label,
    name,
    value = "",
    type = "text",
    extra = "",
    required = true,
  ) =>
    `<label class="field"><span>${E(label)}</span><input class="ui-input" name="${name}" type="${type}" value="${E(value)}" ${name === "name" ? 'dir="auto"' : ""} ${required ? "required" : ""} ${extra}></label>`;
  const textarea = (label, name, value = "", required = true) =>
    `<label class="field full"><span>${E(label)}</span><textarea class="ui-textarea" name="${name}" ${required ? "required" : ""}>${E(value)}</textarea></label>`;
  const select = (label, name, options, value = "", extra = "") =>
    `<label class="field"><span>${E(label)}</span><select class="ui-select" name="${name}" ${extra}>${options.map(([v, t]) => `<option value="${E(v)}" ${v === value ? "selected" : ""}>${E(t)}</option>`).join("")}</select></label>`;
  const form = (name, fields, submit = "Save", id = "", help = "") =>
    `<form data-form="${name}" data-id="${E(id)}"><div class="form-grid">${fields}</div>${help ? `<p class="help-text">${help}</p>` : ""}<p class="form-error" role="alert"></p><div class="form-footer"><button class="ui-button primary" type="submit">${E(submit)}</button></div></form>`;
  const safeUrl = (value) => {
    try {
      const u = new URL(value);
      return ["http:", "https:"].includes(u.protocol) ? u.href : "";
    } catch {
      return "";
    }
  };
  const external = (value, label) =>
    safeUrl(value)
      ? `<a href="${E(safeUrl(value))}" target="_blank" rel="noopener noreferrer">${E(label)} ${icon("box-arrow-up-right")}</a>`
      : "";
  const attachment = (a) =>
    a?.dataUrl &&
    /^data:(application\/(pdf|octet-stream|vnd\.[^;]+|msword)|image\/(png|jpeg|webp)|text\/plain);base64,/.test(
      a.dataUrl,
    )
      ? `<a class="attachment" href="${E(a.dataUrl)}" download="${E(a.name)}">${icon("paperclip")}${E(a.name)} (${Math.ceil(a.size / 1024)} KB)</a>`
      : "";
  const visiblePlacements = () =>
    U.all("placements").filter((p) => U.canSeePlacement(p));
  const assignedStudents = () =>
    U.all("users").filter(
      (s) =>
        s.role === "student" && (role !== "supervisor" || U.assigned(s.id)),
    );
  const selection = () => {
    const ps = visiblePlacements();
    return ps.find((p) => p.id === params.get("placement")) || ps[0];
  };
  function toast(message) {
    const el = document.getElementById("toast");
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove("show"), 5500);
  }
  function modal(heading, body) {
    document.getElementById("editor-content").innerHTML =
      `<div class="dialog-heading"><h2>${E(heading)}</h2><button type="button" class="close-dialog" data-action="close" aria-label="Close dialog">${icon("x-lg")}</button></div>${body}`;
    const d = document.getElementById("editor");
    d.showModal();
  }
  function close() {
    document.getElementById("editor").close();
  }
  function collegeMark(className = "") {
    return `<span class="college-mark ${className}"><img src="../../assets/yarmouk-college-logo.png" alt="Yarmouk University" width="257" height="70"></span>`;
  }
  function accountControl() {
    const initials = U.user.name.split(" ").map((part) => part[0]).slice(0, 2).join("");
    const profileView = role === "student" ? "profile" : "account";
    const dark = document.documentElement.dataset.theme === "dark";
    const appearance = role === "student" ? `<button class="studio-appearance" type="button" data-action="theme" aria-label="${dark ? "Switch to light mode" : "Switch to dark mode"}">${icon(dark ? "sun" : "moon-stars")}</button>` : "";
    return `<div class="portal-userbar"><div class="studio-header-actions">${appearance}<details class="studio-account portal-account"><summary aria-label="${role === "student" ? "Student account options" : "Account options"}"><span class="studio-avatar" aria-hidden="true">${E(initials)}</span><span class="studio-account-name"><strong>${E(U.user.name)}</strong><small>${E(names[role])}</small></span>${icon("chevron-down")}</summary><nav class="studio-account-menu" aria-label="Account"><p>${E(U.user.email || names[role])}</p><a href="${url(role, profileView)}" ${view === profileView ? 'aria-current="page"' : ""}>${icon("person")}Profile</a><button type="button" data-action="logout">${icon("box-arrow-right")}Sign out</button></nav></details></div></div>`;
  }
  function studentShell(content, description, action) {
    const shortNames = {
      opportunities: "Explore",
      applications: "Applications",
      tasks: "My tasks",
      progress: "My training",
    };
    const heading = view === "progress" ? "My training" : title();
    const kicker =
      view === "opportunities"
        ? "Find your next internship"
        : "Your internship workspace";
    document.body.classList.add("student-studio");
    document.getElementById("app").innerHTML =
      `<div class="student-workspace"><main id="main" class="student-main"><div class="studio-tools"><a class="studio-brand" href="../home/index.html" aria-label="Yarmouk University home"><img src="../../assets/yarmouk-logo-on-light.svg" alt="Yarmouk University" width="112" height="48"></a><nav class="studio-navigation" aria-label="Student workspace">${nav.student
        .filter(([key]) => key !== "profile")
        .map(
          ([key, label, ic]) =>
            `<a href="${url("student", key)}" ${key === view ? 'aria-current="page"' : ""}>${icon(ic)}<span>${E(shortNames[key] || label)}</span></a>`,
        )
        .join(
          "",
        )}</nav>${accountControl()}</div><header class="studio-welcome"><div><p class="studio-kicker">${E(kicker)}</p><h1>${E(heading)}</h1><p>${E(description)}</p></div><div class="studio-welcome-actions">${action}</div></header><div class="portal-content student-content" tabindex="0" role="region" aria-label="Page content">${content}</div></main></div>`;
    document.getElementById("app").removeAttribute("aria-busy");
  }
  function shell(content, description = "", action = "") {
    if (role === "student") {
      studentShell(content, description, action);
      return;
    }
    document.getElementById("app").innerHTML =
      `<div class="workspace"><div class="sidebar-rail"><aside id="portal-navigation" class="sidebar" aria-label="${E(names[role])} navigation"><header class="sidebar-header"><a href="../home/index.html" aria-label="Yarmouk University home"><img class="sidebar-logo" src="../../assets/yarmouk-logo-on-light.svg" alt="Yarmouk University" width="170" height="59"></a><button type="button" class="sidebar-toggle" aria-label="Expand navigation" aria-expanded="false" aria-controls="portal-navigation">${icon("chevron-right")}</button></header><nav aria-label="Workspace pages"><span class="sidebar-section-label">Workspace</span>${nav[
        role
      ]
        .filter(([key]) => key !== "account")
        .map(
          ([key, label, ic]) =>
            `<a class="nav-item ${key === view ? "active" : ""}" ${key === view ? 'aria-current="page"' : ""} aria-label="${E(label)}" title="${E(label)}" href="${url(role, key)}">${icon(ic)}<span>${E(label)}</span></a>`,
        )
        .join(
          "",
        )}</nav><div class="sidebar-bottom"><span class="sidebar-section-label">Account</span><button class="sidebar-pin" type="button" role="switch" aria-checked="false"><span>Keep sidebar open</span><span class="sidebar-pin-track" aria-hidden="true"></span></button><a class="sidebar-profile ${view === "account" ? "active" : ""}" ${view === "account" ? 'aria-current="page"' : ""} href="${url(role, "account")}" aria-label="Profile" title="Profile">${icon("person-circle")}<span class="sidebar-profile-copy"><strong>${E(U.user.name)}</strong><small>View profile</small></span></a><button type="button" data-action="theme" aria-label="Change appearance" title="Change appearance">${icon("moon-stars")}<span>Dark / light mode</span></button><button type="button" data-action="logout" aria-label="Log out" title="Log out">${icon("box-arrow-right")}<span>Log out</span></button></div></aside></div><main class="workspace-main" id="main">${accountControl()}<button class="ui-button mobile-toggle portal-menu-toggle" type="button" data-action="menu" aria-label="Open navigation" aria-expanded="false" aria-controls="portal-navigation">${icon("list")}<span>Menu</span></button><div class="page-title"><div><span class="partner">YARMOUK UNIVERSITY · FACULTY OF IT & COMPUTER SCIENCE</span><h1>${E(title())}</h1><p>${E(description)}</p></div>${action}</div><div class="portal-content" tabindex="0" role="region" aria-label="Page content">${content}</div></main></div>`;
    document.getElementById("app").removeAttribute("aria-busy");
    window.YarmoukChrome?.mountSidebar();
  }
  function publicShell(content) {
    const navigation = view === "first-login" ? "" : `<header class="public-header"><a href="../home/index.html"><img src="../../assets/yarmouk-logo.svg" alt="Yarmouk University home"></a><nav aria-label="Main navigation"><a href="../home/index.html">Home</a><a href="../about/about.html">About Us</a><a href="../contact/contact.html">Contact Us</a><a class="ui-button primary" href="../login/login.html">Log in</a></nav></header>`;
    document.getElementById("app").innerHTML =
      `${navigation}<main class="public-main" id="main">${content}</main>`;
  }
  function publicPage() {
    if (view === "about") {
      publicShell(
        `<div class="public-identity">${collegeMark()}<span class="partner">YARMOUK UNIVERSITY</span></div><h1>Your learning. Put into practice.</h1><p class="lead">This internship management system connects the university's Faculty of Information Technology and Computer Science with company supervisors, academic supervisors and the university internship coordinator. Follow your internship from your first application to your completion certificate.</p><div class="two-columns section-space">${card(
          "One faculty. Six paths.",
          `<ul class="activity-list">${Object.values(U.db.university.majors)
            .map((m) => `<li>${E(m.name)}</li>`)
            .join("")}</ul>`,
          "mortarboard",
        )}${card("Built around your internship", `<ul class="activity-list"><li><strong>Find your opportunity</strong>Explore roles suited to your college and major.</li><li><strong>Confirm your place</strong>Companies decide on applications. You confirm one accepted offer.</li><li><strong>Learn through the work</strong>Submit tasks, respond to feedback and track verified hours.</li><li><strong>Complete your internship</strong>Your coordinator reviews the requirements and releases your certificate.</li></ul>`, "signpost-split")}</div><section id="process" class="section-space"><h2>How your internship works</h2><p class="muted section-space">From application to completion, see each step in the process.</p><video class="process-video section-space" controls playsinline preload="metadata" poster="../../assets/yarmouk-journey-poster.webp"><source src="../../assets/yarmouk-journey.webm" type="video/webm"><track kind="captions" src="../../assets/yarmouk-journey.vtt" srclang="en" label="English" default></video></section>`,
      );
    } else if (view === "contact") {
      publicShell(
        `<div class="contact-layout">
          <section class="contact-introduction" aria-labelledby="contact-title">
            <p class="contact-context">Practical training at Yarmouk</p><h1 id="contact-title">Contact Us</h1>
            <p class="contact-lead">Have a question about your internship? Leave a message for your university internship coordinator.</p>
            <div class="contact-letter-mount"></div>
          </section>
          <section class="contact-form-panel" data-ui aria-labelledby="contact-form-title">
            <header class="contact-form-heading"><h2 id="contact-form-title">Leave a message</h2><p>All fields are required.</p></header>
            ${form("contact", field("Name", "name") + field("Email address", "email", "", "email") + field("Subject", "subject") + textarea("Message", "message"), "Save message")}
            <p class="contact-session-note">${icon("info-circle")}<span>Messages are saved in this browser session.</span></p>
          </section>
          <dl class="contact-directory"><div><dt>Faculty</dt><dd>Information Technology and<br class="contact-desktop-break"> Computer Science</dd></div><div><dt>Location</dt><dd>Yarmouk University<br>Irbid, Jordan</dd></div></dl>
        </div>`,
      );
      document.querySelector('.public-header nav a[href="../contact/contact.html"]').setAttribute("aria-current", "page");
    } else {
      if (!U.user) {
        location.replace("../login/login.html");
        return;
      }
      publicShell(
        `<span class="partner">ACCOUNT SETUP</span><h1>Choose your own password.</h1><p class="lead">Your account requires a temporary-password change before you enter the workspace.</p><div class="section-space">${card("Change temporary password", form("first-login", field("Temporary password", "temporary", "", "password", 'autocomplete="current-password"') + field("New password", "password", "", "password", 'minlength="8" autocomplete="new-password"') + field("Confirm new password", "confirm", "", "password", 'minlength="8" autocomplete="new-password"'), "Continue to workspace", "", "This frontend validates the form and records the setup step for this session. Credentials are not changed or stored; Firebase Authentication must enforce the actual password change."))}</div>`,
      );
    }
  }
  function opportunityCards(ops, student = false) {
    return `<div class="cards">${ops.map((op) => `<article class="card-surface"><div class="card-icon">${icon("briefcase")}</div><div class="actions" style="margin:0 0 14px">${status(op.status)}</div><h2>${E(op.title)}</h2><p>${E(companyName(op.companyId))}</p><div class="meta"><span>${icon("geo-alt")}${E(op.location)}</span><span>${icon("people")}${op.seats} seats</span></div><p class="muted">${op.majorIds.map(majorName).map(E).join(" · ")}</p><div class="meta"><span>Apply by ${date(op.deadline)}</span></div><div class="actions">${button("View details", "opportunity", op.id, student)}${student ? "" : button("Edit", "edit-opportunity", op.id) + (op.status === "Open" ? button("Close", "close-opportunity", op.id) : "")}</div></article>`).join("")}</div>`;
  }
  function applicationTable(apps) {
    return table(
      role === "student"
        ? ["Opportunity", "Company", "Submitted", "Status", "Action"]
        : ["Student", "Opportunity", "Submitted", "Status", "Action"],
      apps.map((a) => {
        const op = U.db.opportunities[a.opportunityId];
        return role === "student"
          ? [
              E(op?.title),
              E(companyName(op?.companyId)),
              stamp(a.createdAt),
              status(a.status),
              button("View application", "application", a.id) +
                (a.status === "Accepted"
                  ? button("Confirm offer", "confirm-offer", a.id, true)
                  : ""),
            ]
          : [
              `<strong>${E(userName(a.studentId))}</strong><small>${E(majorName(U.db.users[a.studentId]?.majorId))}</small>`,
              E(op?.title),
              stamp(a.createdAt),
              status(a.status),
              button("Review", "application", a.id),
            ];
      }),
    );
  }
  function tasksTable(tasks) {
    return table(
      ["Task", "Student", "Deadline", "Status", "Action"],
      tasks.map((t) => {
        const p = U.db.placements[t.placementId];
        return [
          `<strong>${E(t.title)}</strong><small>${E(t.kind)}</small>`,
          E(userName(p.studentId)),
          taskDeadline(t),
          status(U.taskState(t.id)),
          button(
            role === "student" ? "Open task" : "View submissions",
            "task",
            t.id,
            true,
          ),
        ];
      }),
    );
  }
  function taskDeadline(task) {
    const latest = U.latestSubmission(task.id);
    const today = new Date().toISOString().slice(0, 10);
    let delay = "";
    if (latest && latest.createdAt.slice(0, 10) > task.deadline) {
      delay = "Submitted late";
    } else if (
      task.deadline < today &&
      (!latest || latest.status === "Revision requested")
    ) {
      delay = latest ? "Revision overdue" : "Overdue";
    }
    return date(task.deadline) + (delay ? `<br>${status(delay)}` : "");
  }
  function studentPage() {
    const p = U.placement(U.userId),
      apps = U.all("applications").filter((a) => a.studentId === U.userId),
      tasks = U.all("tasks").filter((t) => t.placementId === p?.id);
    if (view === "profile") {
      shell(
        profileForm(),
        "Keep your contact details and CV or portfolio up to date. Academic information is maintained by the coordinator.",
      );
    } else if (view === "opportunities") {
      shell(
        '<div id="student-discovery" class="student-discovery"></div>',
        "Discover roles for your major. Swipe through the opportunities or choose one below.",
        p
          ? link("Continue my training", "student", "progress")
          : link("Complete my profile", "student", "profile"),
      );
      mountStudentDiscovery();
    } else if (view === "apply") {
      const op = U.db.opportunities[params.get("opportunity")];
      shell(
        op
          ? `<div class="two-columns">${card(op.title, `<p>${E(companyName(op.companyId))} · ${E(op.location)}</p><p class="section-space pre-wrap">${E(op.description)}</p><h3 class="section-space">Requirements</h3><p class="pre-wrap">${E(op.requirements)}</p>`)}${card("Your application", form("apply", `<input type="hidden" name="opportunityId" value="${E(params.get("opportunity"))}">${field("Student", "student", U.user.name, "text", "readonly")}${field("Major", "major", majorName(U.user.majorId), "text", "readonly")}${textarea("Why are you interested in this internship?", "statement")}`, "Submit application", "", "Applying creates a pending application. The company supervisor makes the acceptance decision."))}</div>`
          : empty(
              "Choose an opportunity first",
              "Open an opportunity and select Apply.",
              link("Explore opportunities", "student", "opportunities"),
            ),
        "Review the requirements and tell the company why you want to train with them.",
      );
    } else if (view === "applications") {
      const list = apps.length
        ? `<section class="studio-application-list">${apps
            .map((a) => {
              const op = U.db.opportunities[a.opportunityId];
              return `<article class="studio-application"><span class="studio-application-mark ${["Accepted", "Confirmed"].includes(a.status) ? "is-good" : ""}" aria-hidden="true"></span><div><p class="muted">${E(companyName(op?.companyId))}</p><h2>${E(op?.title)}</h2><p class="muted">Applied ${stamp(a.createdAt)}</p></div><div class="studio-application-actions">${status(a.status)}${button("View application", "application", a.id)}${a.status === "Accepted" ? button("Confirm offer", "confirm-offer", a.id, true) : ""}</div></article>`;
            })
            .join("")}</section>`
        : empty(
            "Your first opportunity is waiting.",
            "Explore internships and apply to a role that suits your major.",
            link("Explore internships", "student", "opportunities"),
          );
      shell(
        list,
        "Your applications, company decisions and confirmed internship offer.",
      );
    } else if (view === "tasks") {
      shell(
        p
          ? `<div class="studio-section-title"><h2>Your assigned work</h2><p>Open a task to submit work, see feedback or respond to a revision request.</p></div>` +
              studentTaskCards(tasks)
          : empty(
              "Confirm an internship to begin",
              "Tasks become available after you confirm an accepted offer.",
              link("My applications", "student", "applications"),
            ),
        "The work, deadlines and feedback that move your internship forward.",
      );
    } else if (view === "progress") {
      shell(
        p
          ? (p.status === "Completed" ? completionBlock(p) : "") + studentWeeklyTraining(p)
          : empty(
              "Your internship journey starts with an offer",
              "Confirm one accepted offer to begin tracking your work and progress.",
            ),
        "Your weekly plan, training targets and supervisor feedback.",
      );
      const weekStrip = document.querySelector(".student-training-weeks");
      const activeWeek = weekStrip?.querySelector('[aria-pressed="true"]');
      if (activeWeek && weekStrip.scrollWidth > weekStrip.clientWidth) {
        weekStrip.scrollLeft = activeWeek.offsetLeft - weekStrip.offsetLeft;
      }
    }
  }
  function studentWeeklyTraining(p) {
    const student = U.db.users[p.studentId];
    const day = 86400000, start = Date.parse(p.startDate + "T00:00:00Z"), end = Date.parse(p.endDate + "T00:00:00Z");
    const iso = (time) => new Date(time).toISOString().slice(0, 10);
    const count = Math.max(1, Math.ceil(((end - start) / day + 1) / 7));
    const entries = U.all("hourEntries").filter((h) => h.placementId === p.id);
    const current = entries.filter((h) => !entries.some((next) => next.replacesId === h.id));
    const weeks = Array.from({ length: count }, (_, index) => {
      const from = iso(start + index * 7 * day), to = iso(Math.min(end, start + (index * 7 + 6) * day));
      const hours = current.filter((h) => h.date >= from && h.date <= to);
      const plan = p.weeklyPlan?.[index] || {};
      const planned = Number(plan.plannedHours) || Number(student.requiredHours) / count;
      const approved = hours.filter((h) => h.status === "Approved").reduce((sum, h) => sum + Number(h.hours), 0);
      const label = hours.some((h) => h.status === "Returned") ? "Returned" : hours.some((h) => h.status === "Pending") ? "In review" : approved >= planned ? "Verified" : approved > 0 ? "In progress" : "Planned";
      return { number: index + 1, from, to, hours, plan, planned, approved, label };
    });
    const today = iso(Date.now());
    const initial = Math.min(count, Math.max(1, Math.floor((Date.parse(today) - start) / (7 * day)) + 1));
    const chosen = Math.min(count, Math.max(1, Math.trunc(Number(params.get("week")) || initial)));
    const week = weeks[chosen - 1];
    const title = week.plan.title || "Weekly training targets";
    const targets = week.plan.targets || [];
    const records = week.hours.slice().sort((a, b) => a.date.localeCompare(b.date));
    const companyReport = p.weeklyReports?.[chosen]?.at(-1);
    const feedback = companyReport?.text ? [companyReport.text] : [...new Set(records.map((h) => h.description).filter(Boolean))];
    const reviews = [...new Set(records.map((h) => h.reviewNote).filter(Boolean))];
    return trainingRecord(p, `${weeks.filter((w) => w.label === "Verified").length} of ${count} weeks verified`) +
      `<div class="studio-section-title weekly-journey-title"><h2>Your ${count}-week journey</h2><p>Choose a week to explore</p></div>
      <nav class="student-training-weeks" aria-label="Training weeks">${weeks.map((w) => `<button type="button" class="student-training-week" data-action="student-week" data-id="${w.number}" aria-pressed="${chosen === w.number}" aria-controls="student-week-detail"><span>Week ${String(w.number).padStart(2, "0")} ${icon(w.label === "Verified" ? "check2" : w.label === "In review" ? "clock" : "circle")}</span><strong>${E(w.plan.title || "Weekly training targets")}</strong><small>${E(w.label)}</small></button>`).join("")}</nav>
      <div class="student-week-columns"><section class="student-week-panel" id="student-week-detail" aria-labelledby="student-week-title"><header class="student-week-heading"><div><p class="muted">Week ${String(chosen).padStart(2, "0")}</p><h2 id="student-week-title">${E(title)}</h2><p class="muted">${date(week.from)} – ${date(week.to)}</p></div>${status(week.label)}</header><p class="student-week-meta">${E(Number(week.planned.toFixed(1)))} planned hours · ${targets.length} targets · ${week.approved} approved hours</p><h3>What you're working toward</h3>${targets.length ? `<ul class="student-week-targets">${targets.map((target) => `<li>${icon("bullseye")}<span>${E(target)}</span></li>`).join("")}</ul>` : '<p class="muted">Your company has not added targets for this week yet.</p>'}<p class="help-text">Weekly targets describe your training plan. Assigned tasks, submissions and feedback are available on Tasks.</p><details class="student-week-hours"><summary>Dated training hours <span>${records.length} entries</span></summary>${records.length ? table(["Date", "Hours", "Academic review"], records.map((h) => [date(h.date), E(h.hours), `${status(h.status)}${h.reviewNote ? `<p class="help-text">${E(h.reviewNote)}</p>` : ""}`])) : '<p class="muted">No hours recorded for this week yet.</p>'}</details></section>
      <aside class="student-week-panel student-week-feedback"><h2>${icon("chat-left-text")} Company feedback</h2><div class="student-week-company"><strong>${E(companyName(p.companyId))}</strong><p class="muted">Week ${chosen} · Company training record</p></div>${feedback.length ? feedback.map((text) => `<p class="pre-wrap">${E(text)}</p>`).join("") : '<p class="muted">Company work notes will appear when hours are recorded for this week.</p>'}<div class="student-week-review">${status(week.label)}<p><strong>${records.filter((h) => h.status !== "Returned").reduce((sum, h) => sum + Number(h.hours), 0)}</strong> hours recorded</p><p class="help-text">Your academic supervisor verifies recorded hours independently of task review.</p>${reviews.length ? `<h3>Academic hours feedback</h3>${reviews.map((text) => `<p>${E(text)}</p>`).join("")}` : ""}</div></aside></div>`;
  }
  function trainingRecord(p, summary) {
    const student = U.db.users[p.studentId],
      group = U.db.groups[student.groupId],
      hours = U.approvedHours(p.id),
      tasks = U.all("tasks").filter((t) => t.placementId === p.id);
    return `<section class="studio-training-record"><div class="studio-training-company"><span class="studio-company-icon">${icon("building")}</span><div><h2>${E(U.db.opportunities[p.opportunityId]?.title)}</h2><p>${E(companyName(p.companyId))}</p><small>Academic supervisor · ${E(userName(group?.supervisorId))}</small></div></div><div class="studio-verified-hours"><div><strong>${hours}</strong><span>/ ${student.requiredHours} h</span><small>Academic-verified</small></div><div class="studio-hour-line"><span style="width:${Math.min(100, (hours / student.requiredHours) * 100)}%"></span></div><p>${summary ? E(summary) : `${tasks.filter((t) => U.taskState(t.id) === "Evaluated").length} of ${tasks.length} tasks completed`}</p></div></section>`;
  }
  function studentTaskCards(tasks) {
    return tasks.length
      ? `<section class="studio-task-journey" aria-label="Assigned tasks">${tasks.map((t, i) => `<button class="studio-task-stop" type="button" data-action="task" data-id="${E(t.id)}"><span class="studio-task-kind">${E(t.kind)} ${String(i + 1).padStart(2, "0")}</span><strong>${E(t.title)}</strong><span>${taskDeadline(t)}</span>${status(U.taskState(t.id))}</button>`).join("")}</section>`
      : empty(
          "Your tasks will appear here",
          "Your company supervisor creates tasks with deadlines and clear requirements.",
        );
  }
  function mountStudentDiscovery() {
    const host = document.getElementById("student-discovery");
    if (!host) return;
    const ops = U.all("opportunities").filter(
      (o) =>
        o.status === "Open" &&
        o.deadline >= new Date().toISOString().slice(0, 10) &&
        o.majorIds.includes(U.user.majorId),
    );
    window.YarmoukOpportunityShowcase(host, {
      opportunities: ops,
      U,
      E,
      icon,
      companyName,
      majorName,
      date,
      status,
      url,
      link,
      empty,
    });
  }

  function completionBlock(p) {
    const c = U.db.completions[p.id];
    return c
      ? `<section class="completion">${icon("mortarboard")}<h2>Internship completed.</h2><p>${E(c.message)}</p><p>Approved on ${stamp(c.approvedAt)} · ${E(companyName(p.companyId))}</p><div class="actions">${button("View certificate", "certificate", p.id, true)}${button("Download PDF", "download-certificate", p.id)}</div></section>`
      : "";
  }
  function passwordChangeForm() {
    const passwordField = (label, name, autocomplete, extra = "") => `<div class="field${name === "currentPassword" ? " full" : ""}"><label for="profile-${name}">${label}</label><div class="password-control"><input class="ui-input" id="profile-${name}" name="${name}" type="password" autocomplete="${autocomplete}" aria-describedby="${name}-error${name === "newPassword" ? " newPasswordHelp" : ""}" required ${extra}><button class="password-toggle" type="button" data-action="password-visibility" data-id="profile-${name}" aria-controls="profile-${name}" aria-label="Show ${label.toLowerCase()}" aria-pressed="false">Show</button></div>${name === "newPassword" ? '<p class="password-field-hint" id="newPasswordHelp">At least 8 characters; different from your current password.</p>' : ""}<p class="password-field-error" id="${name}-error" aria-live="polite"></p></div>`;
    return `<details class="card-surface profile-password"><summary><span class="password-section-icon">${icon("key")}</span><span class="password-summary-copy"><span id="passwordChangeTitle">Change password</span><small>Manage your account password</small></span>${icon("chevron-down")}</summary><div class="password-section-body"><p class="help-text" id="passwordChangeHelp">Password updates require account authentication, which is not connected yet. This form checks your entries only.</p><form data-form="change-password" aria-describedby="passwordChangeHelp"><div class="form-grid">${passwordField("Current password", "currentPassword", "current-password")}${passwordField("New password", "newPassword", "new-password", 'minlength="8"')}${passwordField("Confirm new password", "confirmPassword", "new-password", 'minlength="8"')}</div><p class="form-error" role="alert"></p><p class="password-form-status help-text" role="status" aria-live="polite"></p><div class="form-footer"><button class="ui-button primary" type="submit">Change password</button><button class="ui-button password-cancel" type="button" data-action="password-cancel">Cancel</button></div></form></div></details>`;
  }
  function profileForm() {
    const u = U.user,
      group = U.db.groups[u.groupId];
    return `<div class="two-columns profile-layout">${card(role === "student" ? "Academic information" : "Account information", `<dl class="detail-list"><div><dt>Role</dt><dd>${E(names[u.role])}</dd></div><div><dt>Email address</dt><dd>${E(u.email)}</dd></div>${role === "student" ? `<div><dt>University / college</dt><dd>Yarmouk University<br>${E(U.db.university.college)}</dd></div><div><dt>Student number / major</dt><dd>${E(u.studentNumber)} · ${E(majorName(u.majorId))}</dd></div><div><dt>Academic group / supervisor</dt><dd>${E(group?.name)} · ${E(userName(group?.supervisorId))}</dd></div><div><dt>Required training hours</dt><dd>${u.requiredHours} · ${E(u.term)} term</dd></div>` : role === "company" ? `<div><dt>Company</dt><dd>${E(companyName(u.companyId))}</dd></div>` : ""}<div><dt>Account status</dt><dd>${status(u.status)}</dd></div></dl>`, "person-badge")}<div class="profile-edit-column">${card("Personal information", form("profile", field("Full name", "name", u.name) + field("Phone number", "phone", u.phone, "tel", "", false) + (role === "student" ? field("CV link", "cvLink", u.cvLink, "url", "", false) + field("Portfolio link", "portfolioLink", u.portfolioLink, "url", "", false) + field("Portfolio file (up to 1 MB)", "portfolioFile", "", "file", 'accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.doc,.docx"', false) + attachment(u.portfolioFile) : role === "company" ? field("Job title", "jobTitle", u.jobTitle, "text", "", false) : ""), "Save information", "", "Changes and selected files are retained in this browser session. No server upload occurs."))}${passwordChangeForm()}</div></div>`;
  }
  function companyPage() {
    const ops = U.all("opportunities").filter(
        (o) => o.supervisorId === U.userId,
      ),
      apps = U.all("applications").filter((a) =>
        ops.some((o) => o.id === a.opportunityId),
      ),
      ps = visiblePlacements(),
      tasks = U.all("tasks").filter((t) =>
        ps.some((p) => p.id === t.placementId),
      );
    if (view === "dashboard") {
      shell(
        stats([
          ["Open opportunities", ops.filter((o) => o.status === "Open").length],
          [
            "Pending applications",
            apps.filter((a) => a.status === "Pending").length,
          ],
          ["Confirmed trainees", ps.length],
          [
            "Submissions to review",
            tasks.filter((t) => U.taskState(t.id) === "Submitted").length,
          ],
        ]) +
          `<div class="two-columns">${card("Applications awaiting a decision", applicationTable(apps.filter((a) => a.status === "Pending").slice(0, 4)))}${card("Training at a glance", placementList(ps))}</div><div class="section-space">${card("Current work", tasksTable(tasks.slice(0, 5)))}</div>`,
        "Manage your opportunities, review applications and guide your confirmed trainees.",
      );
    } else if (view === "opportunities") {
      shell(
        ops.length
          ? opportunityCards(ops)
          : empty(
              "Create your first opportunity",
              "Specify requirements, eligible specializations and available seats.",
            ),
        "Create, edit and close your company’s internship opportunities.",
        button("Add opportunity", "new-opportunity", "", true),
      );
    } else if (view === "applications") {
      shell(
        applicationTable(apps),
        "Review applications to your opportunities. Rejection requires a reason; acceptance leaves confirmation to the student.",
      );
    } else if (view === "trainees") {
      shell(
        placementList(ps, true),
        "Students appear here after confirming your internship offer.",
      );
    } else if (view === "tasks") {
      shell(
        companyStudentWorkspace(ps),
        "Select a student to assign work, review submissions and give feedback.",
        ps.some((p) => p.status !== "Completed")
          ? button("Assign task to all active students", "new-task-all", "", true)
          : "",
      );
    } else if (view === "evaluations" || view === "reports") {
      shell(
        companyStudentWorkspace(ps),
        view === "reports" ? "Select a student to prepare weekly targets, write reports and record training hours." : "Select a student to prepare their final company evaluation for the academic supervisor.",
      );
    } else if (view === "account") {
      shell(
        profileForm(),
        "Maintain your permitted personal and account information.",
      );
    }
  }
  function placementPicker(ps) {
    return `<form data-form="placement-select" class="toolbar"><select class="ui-select" name="placement" aria-label="Select internship">${ps.map((p) => `<option value="${E(p.id)}" ${p.id === selection()?.id ? "selected" : ""}>${E(userName(p.studentId))} · ${E(companyName(p.companyId))}</option>`).join("")}</select><button class="ui-button" type="submit">Open internship</button></form>`;
  }
  function companyStudentWorkspace(placements) {
    const requested = params.get("placement");
    const selected = placements.find((p) => p.id === requested);
    const query = companyStudentQuery.trim().toLowerCase();
    const purpose = view === "tasks" ? "tasks and submissions" : view === "reports" ? "weekly reports" : "final company evaluation";
    const roster = placements.map((p) => {
      const s = U.db.users[p.studentId];
      const search = `${s.name} ${s.studentNumber} ${majorName(s.majorId)}`.toLowerCase();
      return `<button class="report-student-button" type="button" data-action="company-student" data-id="${E(p.id)}" data-company-search="${E(search)}" aria-pressed="${selected?.id === p.id}" aria-controls="companyStudentDetail" ${query && !search.includes(query) ? "hidden" : ""}><strong dir="auto">${E(s.name)}</strong><span>ID ${E(s.studentNumber)} · ${E(majorName(s.majorId))}</span><small>${E(p.status)} · ${U.approvedHours(p.id)} / ${s.requiredHours} approved hours</small></button>`;
    }).join("");
    let detail = `<section class="report-selection-prompt">${icon(view === "tasks" ? "list-task" : view === "reports" ? "journal-text" : "clipboard-check")}<h2>Select a student</h2><p>Choose a student from the list to open their ${purpose}.</p></section>`;
    if (selected) {
      const student = U.db.users[selected.studentId];
      const ownTasks = U.all("tasks").filter((t) => t.placementId === selected.id);
      detail = `<div class="company-student-heading"><div><p class="muted">${E(student.studentNumber)} · ${E(majorName(student.majorId))}</p><h2 dir="auto">${E(student.name)}</h2></div>${view === "tasks" && selected.status !== "Completed" ? button("Add task to this student", "new-task", selected.id, true) : status(selected.status)}</div>${selected.status === "Completed" ? '<p class="help-text">This internship is completed. Its records are read-only.</p>' : ""}`;
      if (view === "evaluations") detail = evaluationTrail(selected) + detail;
      detail += view === "tasks" ? (ownTasks.length ? companyTaskRows(ownTasks) : empty("No tasks assigned yet", "Add a task for this student, including its deadline and requirements.")) : view === "evaluations" ? `<section class="company-evaluation-content"><h3>Final company evaluation</h3>${companyEvaluationView(selected)}</section>` : companyWeeklyReports(selected);
    }
    return `<div class="company-student-workspace"><section class="report-student-directory"><h2>Students</h2><p>Select a student to open their ${purpose}.</p><label for="companyStudentSearch">Find a student</label><input id="companyStudentSearch" class="ui-input" type="search" placeholder="Search name, ID or major" value="${E(companyStudentQuery)}"><p id="companyStudentCount" class="report-student-count" role="status"></p><div class="report-student-list">${roster || '<p class="muted">Students appear after confirming an internship offer.</p>'}</div><p id="companyStudentEmpty" class="muted" ${placements.some((p) => { const s = U.db.users[p.studentId]; return `${s.name} ${s.studentNumber} ${majorName(s.majorId)}`.toLowerCase().includes(query); }) || !placements.length ? "hidden" : ""}>No matching students.</p></section><section id="companyStudentDetail" class="company-student-detail">${detail}</section></div>`;
  }
  function companyTaskRows(tasks) {
    return `<div class="company-task-list" aria-label="Selected student's tasks">${tasks.map((task) => `<article class="company-task-row"><div><p class="muted">${E(task.kind)}${task.attachmentId || task.file ? " · PDF attached" : ""}</p><h3>${E(task.title)}</h3><p class="muted">Due ${taskDeadline(task)}</p></div><div class="company-task-row-actions">${status(U.taskState(task.id))}${button("Open task & submissions", "task", task.id)}</div></article>`).join("")}</div>`;
  }
  function companyWeeklyReports(p) {
    const count = Math.max(1, Math.ceil((Date.parse(p.endDate) - Date.parse(p.startDate) + 86400000) / (7 * 86400000)));
    const initial = Math.min(count, Math.max(1, Math.floor((Date.now() - Date.parse(p.startDate)) / (7 * 86400000)) + 1));
    const week = Math.min(count, Math.max(1, Math.trunc(Number(params.get("week")) || initial)));
    const from = new Date(Date.parse(p.startDate) + (week - 1) * 7 * 86400000).toISOString().slice(0, 10);
    const to = new Date(Math.min(Date.parse(p.endDate), Date.parse(from) + 6 * 86400000)).toISOString().slice(0, 10);
    const plan = p.weeklyPlan?.[week - 1] || {};
    const history = p.weeklyReports?.[week] || [];
    const latest = history.at(-1);
    const hours = U.all("hourEntries").filter((h) => h.placementId === p.id && h.date >= from && h.date <= to);
    return `<nav class="company-report-weeks" aria-label="Training weeks">${Array.from({length: count}, (_, index) => `<button type="button" class="ui-button" data-action="company-week" data-id="${index + 1}" aria-pressed="${week === index + 1}">Week ${String(index + 1).padStart(2, "0")}${p.weeklyReports?.[index + 1]?.length ? icon("check2") : ""}</button>`).join("")}</nav><section class="company-weekly-content"><h3>Week ${String(week).padStart(2, "0")}</h3><p class="muted">${date(from)} – ${date(to)} · ${Number((U.db.users[p.studentId].requiredHours / count).toFixed(1))} planned hours</p>${p.status !== "Completed" ? form("company-weekly", `<input type="hidden" name="week" value="${week}">${field("Weekly focus", "title", plan.title || "")}${textarea("Weekly targets (one per line)", "targets", (plan.targets || []).join("\n"))}${textarea("Company weekly report & feedback", "text", latest?.text || "", false)}`, "Save weekly report", p.id, "The student and assigned academic supervisor can read this report. Dated hours are recorded separately and require academic approval.") : `<h4>${E(plan.title || "Weekly targets")}</h4><ul>${(plan.targets || []).map((target) => `<li>${E(target)}</li>`).join("")}</ul><p class="pre-wrap">${E(latest?.text || "No company report recorded for this week.")}</p>`}<div class="company-section-heading"><h3>Dated training hours</h3>${p.status !== "Completed" ? button("Record training hours", "record-hours", p.id) : ""}</div>${hours.length ? table(["Date", "Work", "Hours", "Academic review"], hours.map((h) => [date(h.date), E(h.description), E(h.hours), `${status(h.status)}${h.status === "Returned" && p.status !== "Completed" && !U.all("hourEntries").some((next) => next.replacesId === h.id) ? button("Correct hours", "correct-hours", h.id) : ""}`])) : '<p class="muted">No dated hours recorded for this week.</p>'}${history.length ? `<details class="company-report-history"><summary>Report history (${history.length})</summary>${history.slice().reverse().map((entry) => `<article class="review-block"><strong>${E(userName(entry.authorId))}</strong><small>${stamp(entry.createdAt)}</small><p class="pre-wrap">${E(entry.text || "Weekly targets updated.")}</p>${entry.plan ? `<p>${E(entry.plan.title)}</p><ul>${entry.plan.targets.map((target) => `<li>${E(target)}</li>`).join("")}</ul>` : ""}</article>`).join("")}</details>` : ""}</section>`;
  }
  function placementList(ps, full = false) {
    return table(
      ["Student", "Company", "Progress", "Status", "Action"],
      ps.map((p) => {
        const s = U.db.users[p.studentId];
        return [
          `<strong>${E(s.name)}</strong><small>${E(majorName(s.majorId))}</small>`,
          E(companyName(p.companyId)),
          `${U.approvedHours(p.id)} / ${s.requiredHours} hours`,
          status(p.status),
          full
            ? button("Training details", "placement", p.id)
            : link(
                "Open",
                role,
                role === "company" ? "trainees" : "progress",
                "?placement=" + p.id,
              ),
        ];
      }),
    );
  }
  function hoursTable(p) {
    return table(
      ["Date", "Work", "Hours", "Status", "Review"],
      U.all("hourEntries")
        .filter((h) => h.placementId === p.id)
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((h) => [
          date(h.date),
          `<span class="pre-wrap">${E(h.description)}</span>`,
          E(h.hours),
          status(h.status),
          role === "supervisor" &&
          h.status === "Pending" &&
          p.status !== "Completed"
            ? button("Verify hours", "review-hours", h.id)
            : E(h.reviewNote || "—") +
              (role === "company" &&
              h.status === "Returned" &&
              p.status !== "Completed" &&
              !U.all("hourEntries").some((next) => next.replacesId === h.id)
                ? '<div class="actions">' +
                  button("Correct hours", "correct-hours", h.id) +
                  "</div>"
                : ""),
        ]),
    );
  }
  function comments(pid) {
    const list = U.all("academicComments").filter((c) => c.placementId === pid);
    return list.length
      ? list
          .map(
            (c) =>
              `<div class="review-block"><strong>${E(userName(c.authorId))}</strong><p>${E(c.text)}</p><small>${stamp(c.createdAt)}</small></div>`,
          )
          .join("")
      : '<p class="muted">No academic comments yet.</p>';
  }
  function placementDetail(p) {
    const s = U.db.users[p.studentId],
      group = U.db.groups[s.groupId],
      tasks = U.all("tasks").filter((t) => t.placementId === p.id);
    return (
      stats([
        ["Approved hours", `${U.approvedHours(p.id)} / ${s.requiredHours}`],
        [
          "Completed tasks",
          `${tasks.filter((t) => U.taskState(t.id) === "Evaluated").length} / ${tasks.length}`,
        ],
        ["Training status", p.status],
      ]) +
      `<div class="two-columns">${card("Training details", `<dl class="detail-list"><div><dt>Student / major</dt><dd>${E(s.name)} · ${E(majorName(s.majorId))}</dd></div><div><dt>Company / company supervisor</dt><dd>${E(companyName(p.companyId))} · ${E(userName(p.companySupervisorId))}</dd></div><div><dt>Academic group / supervisor</dt><dd>${E(group?.name)} · ${E(userName(group?.supervisorId))}</dd></div><div><dt>Training period</dt><dd>${date(p.startDate)} – ${date(p.endDate)}</dd></div></dl>${role === "company" && p.status !== "Completed" ? `<div class="actions">${button("Record training hours", "record-hours", p.id, true)}</div>` : ""}`)}${card("Academic feedback", comments(p.id) + (role === "supervisor" && p.status !== "Completed" ? `<div class="actions">${button("Add academic comment", "academic-comment", p.id, true)}</div>` : ""))}</div><div class="section-space">${card("Tasks, submissions & evaluations", tasksTable(tasks))}</div><div class="section-space">${card("Training hours", hoursTable(p))}</div>`
    );
  }
  function studentReportWorkspace(students, placements) {
    const requested = params.get("student") || placements.find((entry) => entry.id === params.get("placement"))?.studentId;
    const selected = students.find((student) => student.id === requested);
    const placement = selected ? placements.find((entry) => entry.studentId === selected.id && entry.id === params.get("placement")) || placements.find((entry) => entry.studentId === selected.id) : null;
    const query = monitorStudentQuery.trim().toLowerCase();
    const roster = students.map((student) => {
      const entry = placements.find((placement) => placement.studentId === student.id);
      const search = `${student.name} ${student.studentNumber || ""} ${entry ? companyName(entry.companyId) : ""}`.toLowerCase();
      const pending = entry ? U.all("hourEntries").filter((hour) => hour.placementId === entry.id && hour.status === "Pending").length : 0;
      return `<button type="button" class="report-student-button" data-action="monitor-student" data-id="${E(student.id)}" data-student-search="${E(search)}" aria-pressed="${selected?.id === student.id}" aria-controls="supervisorReportDetail" ${query && !search.includes(query) ? "hidden" : ""}><strong>${E(student.name)}</strong><span>${E(student.studentNumber || "Student")} · ${E(entry ? companyName(entry.companyId) : "No confirmed internship")}</span><small>${pending ? `${pending} ${pending === 1 ? "entry" : "entries"} to review` : entry ? `${U.approvedHours(entry.id)} / ${student.requiredHours} approved hours · ${E(entry.status)}` : "Awaiting placement"}</small></button>`;
    }).join("");
    const matches = students.filter((student) => {
      const entry = placements.find((placement) => placement.studentId === student.id);
      return `${student.name} ${student.studentNumber || ""} ${entry ? companyName(entry.companyId) : ""}`.toLowerCase().includes(query);
    }).length;
    return `<div class="supervisor-report-workspace"><section class="report-student-directory" aria-labelledby="reportDirectoryTitle"><h2 id="reportDirectoryTitle">Assigned students</h2><p>Company-submitted weekly reports</p><label for="supervisorReportSearch">Find a student</label><input class="ui-input" type="search" id="supervisorReportSearch" placeholder="Name, student ID, or company" value="${E(monitorStudentQuery)}"><p id="supervisorReportCount" class="report-student-count" role="status">${matches} of ${students.length} assigned students</p><div class="report-student-list">${roster}</div><p id="supervisorReportEmpty" ${matches ? "hidden" : ""}>No matching students. Try another name, ID, or company.</p></section><div id="supervisorReportDetail" class="report-student-detail">${selected ? `<button type="button" class="ui-button report-change-student" data-action="monitor-change-student">${icon("arrow-left")}Change student</button>${placement ? weeklyMonitor(placement) : empty("No confirmed internship", `${selected.name} has not confirmed an internship yet. Weekly reports will appear after placement.`)}` : `<section class="report-selection-prompt">${icon("journal-text")}<h2>Select a student</h2><p>Choose an assigned student to review their weekly reports, training hours, and submitted work.</p></section>`}</div></div>`;
  }
  function filterReportStudents(input) {
    monitorStudentQuery = input.value;
    const query = input.value.trim().toLowerCase();
    let count = 0;
    const buttons = document.querySelectorAll(".report-student-button");
    buttons.forEach((button) => {
      button.hidden = !button.dataset.studentSearch.includes(query);
      if (!button.hidden) count++;
    });
    document.getElementById("supervisorReportCount").textContent = `${count} of ${buttons.length} assigned students`;
    document.getElementById("supervisorReportEmpty").hidden = count > 0;
  }
  function companyReportSummary(p, week) {
    const history = p.weeklyReports?.[week] || [];
    if (!history.length) return "";
    const latest = history.at(-1);
    return `<section class="monitor-company-report"><h3>Company weekly report</h3><p class="muted">${E(userName(latest.authorId))} · ${stamp(latest.createdAt)}</p><p class="pre-wrap">${E(latest.text || "Weekly targets updated.")}</p>${latest.plan ? `<h4>Weekly targets</h4><ul>${latest.plan.targets.map((target) => `<li>${E(target)}</li>`).join("")}</ul>` : ""}${history.length > 1 ? `<details><summary>Earlier reports (${history.length - 1})</summary>${history.slice(0,-1).reverse().map((entry) => `<article class="review-block"><small>${stamp(entry.createdAt)}</small><p>${E(entry.text || "Weekly targets updated.")}</p></article>`).join("")}</details>` : ""}</section>`;
  }
  function weeklyMonitor(p) {
    const student = U.db.users[p.studentId], group = U.db.groups[student.groupId];
    const day = 86400000, start = Date.parse(p.startDate + "T00:00:00Z"), end = Date.parse(p.endDate + "T00:00:00Z");
    const iso = (time) => new Date(time).toISOString().slice(0, 10);
    const allHours = U.all("hourEntries").filter((h) => h.placementId === p.id);
    const tasks = U.all("tasks").filter((t) => t.placementId === p.id);
    const submissions = U.all("submissions").filter((entry) => tasks.some((t) => t.id === entry.taskId));
    const weekCount = Math.max(1, Math.ceil(((end - start) / day + 1) / 7));
    const weeks = Array.from({ length: weekCount }, (_, index) => {
      const from = iso(start + index * 7 * day), to = iso(Math.min(end, start + (index * 7 + 6) * day));
      const hours = allHours.filter((h) => h.date >= from && h.date <= to);
      const current = hours.filter((h) => !allHours.some((next) => next.replacesId === h.id));
      const pending = current.filter((h) => h.status === "Pending").length;
      const approved = current.filter((h) => h.status === "Approved").reduce((sum, h) => sum + Number(h.hours), 0);
      const total = current.filter((h) => h.status !== "Returned").reduce((sum, h) => sum + Number(h.hours), 0);
      const label = pending ? "Pending review" : current.some((h) => h.status === "Returned") ? "Returned" : current.length && current.every((h) => h.status === "Approved") ? "Approved" : from > iso(Date.now()) ? "Upcoming" : "No hours recorded";
      return { number: index + 1, from, to, hours, pending, approved, total, label };
    });
    const latest = [...allHours].sort((a, b) => b.date.localeCompare(a.date));
    const focusDate = latest.find((h) => h.status === "Pending")?.date || latest[0]?.date || iso(Date.now());
    const defaultWeek = Math.floor((Date.parse(focusDate + "T00:00:00Z") - start) / (7 * day)) + 1;
    const chosen = Math.min(weekCount, Math.max(1, Math.trunc(Number(params.get("week")) || defaultWeek)));
    const week = weeks[chosen - 1];
    const weeklySubmissions = submissions.filter((entry) => entry.createdAt?.slice(0, 10) >= week.from && entry.createdAt.slice(0, 10) <= week.to);
    const weeklyTasks = tasks.filter((t) => (t.deadline >= week.from && t.deadline <= week.to) || weeklySubmissions.some((entry) => entry.taskId === t.id));
    const approvedHours = U.approvedHours(p.id);
    return `<section class="weekly-monitor" aria-label="Weekly student report monitor"><header class="monitor-student"><div><p class="monitor-eyebrow">${E(companyName(p.companyId))}</p><h2>${E(student.name)}</h2><p>${E(majorName(student.majorId))} · ${E(group?.name)}</p></div><div class="monitor-hours"><strong>${approvedHours}<span> / ${E(student.requiredHours)} h</span></strong><progress value="${approvedHours}" max="${E(student.requiredHours)}" aria-label="Approved training hours"></progress><small>Academic-approved hours · ${E(p.status)}</small></div></header><nav class="monitor-weeks" aria-label="Training weeks">${weeks.map((w) => `<button type="button" class="monitor-week ${w.label === "Approved" ? "is-approved" : ""}" data-action="monitor-week" data-id="${w.number}" aria-pressed="${w.number === chosen}" aria-controls="selected-week-report"><span>Week ${w.number}</span><small>${E(w.label)}</small></button>`).join("")}</nav><section id="selected-week-report" class="monitor-week-report" aria-labelledby="selected-week-heading"><header class="monitor-week-heading"><div><p class="monitor-eyebrow">Weekly report</p><h2 id="selected-week-heading">Week ${chosen} <span>· ${date(week.from)} – ${date(week.to)}</span></h2><p>${week.total} recorded hours · ${week.approved} approved · ${weeklySubmissions.length} work submission${weeklySubmissions.length === 1 ? "" : "s"}</p></div>${status(week.label)}</header>${p.status === "Completed" ? '<p class="monitor-readonly">This internship is completed. Its training record is read-only.</p>' : ""}<div class="monitor-report-columns"><div><section class="monitor-report-section">${companyReportSummary(p, chosen)}<h3>Company report & training hours</h3><p class="muted">Company-recorded work for this week. Academic verification applies to each dated hours entry.</p>${week.hours.length ? week.hours.slice().sort((a, b) => a.date.localeCompare(b.date)).map((entry) => `<article class="monitor-hour-entry"><header><strong>${date(entry.date)}</strong><div><span>${E(entry.hours)} hours</span>${status(entry.status)}</div></header><p class="pre-wrap">${E(entry.description)}</p>${entry.replacesId ? '<small>Corrected entry · the original record is retained in history.</small>' : ""}${entry.reviewNote ? `<p class="monitor-hour-note"><strong>Academic review</strong><br>${E(entry.reviewNote)}</p>` : ""}${entry.reviewedAt ? `<small>Reviewed ${stamp(entry.reviewedAt)}</small>` : ""}${entry.status === "Pending" && p.status !== "Completed" ? `<div class="actions">${button("Verify hours", "review-hours", entry.id)}</div>` : ""}</article>`).join("") : '<div class="monitor-empty"><span class="monitor-empty-icon">' + icon("journal-text") + '</span><h4>No training hours recorded for this week</h4><p>The company supervisor’s dated work descriptions and hours will appear here.</p></div>'}</section><section class="monitor-report-section"><h3>Assigned work & submissions</h3><p class="muted">Tasks due or work submitted during this week. Task reviews and revisions are managed by the company supervisor.</p>${weeklyTasks.length ? weeklyTasks.map((task) => {
      const entries = weeklySubmissions.filter((entry) => entry.taskId === task.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return `<article class="monitor-work"><div class="monitor-work-heading"><div><h4>${E(task.title)}</h4><small>${E(task.kind)} · Due ${date(task.deadline)}</small></div>${button("View work & history", "task", task.id)}</div><p>${E(task.description)}</p>${entries.map((entry) => `<div class="monitor-submission"><strong>Submitted ${stamp(entry.createdAt)}</strong>${status(entry.status)}<p class="pre-wrap">${E(entry.description)}</p>${external(entry.link, "Open submitted work")}${attachment(entry.file)}${entry.review ? `<p><strong>Company feedback</strong></p><p>${E(entry.review.feedback)}</p>` : ""}</div>`).join("")}${!entries.length ? '<p class="muted">No work submitted during this week.</p>' : ""}</article>`;
    }).join("") : '<p class="monitor-empty-text">No tasks due or work submitted during this week.</p>'}</section></div><aside class="monitor-feedback"><h3>Academic feedback</h3><p class="muted">Comments for this internship are kept here across all weeks.</p>${comments(p.id)}${p.status !== "Completed" ? `<div class="actions">${button("Add academic comment", "academic-comment", p.id, true)}</div>` : ""}<details class="monitor-details"><summary>Training details</summary><dl class="detail-list"><div><dt>Company supervisor</dt><dd>${E(userName(p.companySupervisorId))}</dd></div><div><dt>Academic supervisor</dt><dd>${E(userName(group?.supervisorId))}</dd></div><div><dt>Training period</dt><dd>${date(p.startDate)} – ${date(p.endDate)}</dd></div><div><dt>Training weeks</dt><dd>${weekCount}</dd></div></dl></details></aside></div></section><details class="monitor-all-work"><summary>All assigned work & submission history</summary><div class="section-space">${tasksTable(tasks)}</div></details></section>`;
  }
  function supervisorPage() {
    const students = assignedStudents(),
      ps = visiblePlacements(),
      p = selection();
    if (view === "dashboard") {
      shell(
        stats([
          ["Assigned students", students.length],
          [
            "Active internships",
            ps.filter((p) => p.status === "Active").length,
          ],
          [
            "Hours entries to verify",
            U.all("hourEntries").filter(
              (h) =>
                ps.some((p) => p.id === h.placementId) &&
                h.status === "Pending",
            ).length,
          ],
          [
            "Company evaluations received",
            ps.filter((p) => U.db.companyEvaluations[p.id]).length,
          ],
        ]) +
          card(
            "Your assigned students",
            table(
              ["Student", "Major", "Group", "Internship"],
              students.map((s) => [
                E(s.name),
                E(majorName(s.majorId)),
                E(U.db.groups[s.groupId]?.name),
                U.placement(s.id)
                  ? link(
                      "Monitor",
                      "supervisor",
                      "progress",
                      "?placement=" + U.placement(s.id).id,
                    )
                  : status("Awaiting offer"),
              ]),
            ),
          ),
        "Monitor your assigned groups from account setup through completion.",
      );
    } else if (view === "progress") {
      shell(
        studentReportWorkspace(students, ps),
        "Review each student’s training week by week: company reports, submitted work, feedback and approved hours.",
      );
    } else if (view === "evaluations") {
      shell(
        evaluationWorkspace(students, ps),
        "Review the company evaluation, assess the academic components and send your evaluation to the coordinator.",
      );
    } else if (view === "account")
      shell(
        profileForm(),
        "View your account and update permitted personal information.",
      );
  }
  function evaluationWorkspace(students, placements) {
    const requested = params.get("student") || placements.find((p) => p.id === params.get("placement"))?.studentId;
    const selected = students.find((s) => s.id === requested);
    const placement = selected && (placements.find((p) => p.studentId === selected.id && p.id === params.get("placement")) || placements.find((p) => p.studentId === selected.id));
    const query = evaluationStudentQuery.trim().toLowerCase();
    let matches = 0;
    const roster = students.map((s) => {
      const p = placements.find((entry) => entry.studentId === s.id);
      const search = `${s.name} ${s.studentNumber || ""} ${p ? companyName(p.companyId) : ""}`.toLowerCase();
      const visible = !query || search.includes(query);
      if (visible) matches++;
      const state = !p ? "Awaiting placement" : U.db.academicEvaluations[p.id] ? "Sent to coordinator" : U.db.companyEvaluations[p.id] ? "Ready for academic evaluation" : "Awaiting company evaluation";
      return `<button type="button" class="report-student-button" data-action="evaluation-student" data-id="${E(s.id)}" data-evaluation-search="${E(search)}" aria-pressed="${selected?.id === s.id}" aria-controls="evaluationDetail" ${visible ? "" : "hidden"}><strong>${E(s.name)}</strong><span>${E(s.studentNumber || "Student")} · ${E(p ? companyName(p.companyId) : majorName(s.majorId))}</span><small>${state}</small></button>`;
    }).join("");
    return `<div class="supervisor-report-workspace evaluation-workspace"><section class="report-student-directory" aria-labelledby="evaluationDirectoryTitle"><h2 id="evaluationDirectoryTitle">Assigned students</h2><p>Final internship evaluations</p><label for="supervisorEvaluationSearch">Find a student</label><input class="ui-input" type="search" id="supervisorEvaluationSearch" placeholder="Name, student ID, or company" value="${E(evaluationStudentQuery)}"><p id="supervisorEvaluationCount" class="report-student-count" role="status">${matches} of ${students.length} assigned students</p><div class="report-student-list">${roster}</div><p id="supervisorEvaluationEmpty" ${matches ? "hidden" : ""}>${students.length ? "No matching students. Try another name, ID, or company." : "No students are assigned to your academic groups yet."}</p></section><div id="evaluationDetail" class="report-student-detail">${selected ? `<button class="ui-button report-change-student" type="button" data-action="evaluation-clear">${icon("arrow-left")}Change student</button>${placement ? evaluationDetail(placement) : empty("No confirmed internship", `${selected.name} must confirm an internship before final evaluation.`)}` : `<section class="report-selection-prompt">${icon("clipboard-check")}<h2>Select a student</h2><p>Choose an assigned student to review the company assessment and prepare a separate final academic evaluation for the coordinator.</p></section>`}</div></div>`;
  }
  function evaluationTrail(p) {
    const company = U.db.companyEvaluations[p.id], academic = U.db.academicEvaluations[p.id], completion = U.db.completions[p.id];
    return `<ol class="evaluation-cycle"><li class="${company ? 'is-done' : 'is-current'}"><strong>1. Company · 50</strong><span>${company ? 'Submitted to academic supervisor' : 'Awaiting company evaluation'}</span></li><li class="${academic ? 'is-done' : company ? 'is-current' : ''}"><strong>2. Academic supervisor · 50</strong><span>${academic ? 'Submitted to coordinator' : company ? 'Review company assessment and add evaluation' : 'Waiting for company submission'}</span></li><li class="${completion ? 'is-done' : academic ? 'is-current' : ''}"><strong>3. Coordinator approval</strong><span>${completion ? 'Approved · completion released' : academic ? 'Review result and training requirements' : 'Waiting for academic submission'}</span></li></ol>`;
  }
  function evaluationDetail(p) {
    const student = U.db.users[p.studentId];
    return `${evaluationTrail(p)}<section class="card-surface evaluation-detail"><h2 dir="auto">${E(student.name)}</h2><p class="muted">${E(student.studentNumber)} · ${E(companyName(p.companyId))}</p><h3>Company evaluation · 50 marks</h3>${companyEvaluationView(p)}</section><section class="card-surface evaluation-academic"><h2>Academic evaluation · 50 marks</h2>${academicEvaluationView(p)}</section>`;
  }
  function filterEvaluationStudents(input) {
    evaluationStudentQuery = input.value;
    const query = input.value.trim().toLowerCase();
    let count = 0;
    const buttons = document.querySelectorAll("[data-evaluation-search]");
    buttons.forEach((button) => { button.hidden = !button.dataset.evaluationSearch.includes(query); if (!button.hidden) count++; });
    document.getElementById("supervisorEvaluationCount").textContent = `${count} of ${buttons.length} assigned students`;
    document.getElementById("supervisorEvaluationEmpty").hidden = count > 0;
  }
  function legacyEvaluationNote(p) {
    const history = U.db.legacyEvaluations?.[p.id];
    if (!history) return "";
    return `<details class="help-text"><summary>Previous evaluation history</summary><p>The earlier assessment used a different marking system. Its comments are retained here; it does not supply marks for the new 50 + 50 evaluation.</p>${Object.values(history).map((entry) => `<p>${E(entry.comments)}</p><small>${stamp(entry.sentAt)}</small>`).join("")}</details>`;
  }
  function companyEvaluationView(p) {
    const ev = U.db.companyEvaluations[p.id];
    if (ev) return `<p>${status("Sent")} · ${stamp(ev.sentAt)}</p><p class="evaluation-total">Company grade <strong>${ev.score} / 50</strong></p><p class="pre-wrap">${E(ev.comments)}</p><p class="help-text">${U.db.academicEvaluations[p.id] ? 'Academic evaluation submitted to coordinator.' : 'Awaiting the academic supervisor’s review and separate grade out of 50.'}</p>`;
    if (p.status === "Completed") return legacyEvaluationNote(p) + '<p class="help-text">This previously approved internship is read-only.</p>';
    if (role !== "company") return legacyEvaluationNote(p) + '<p class="muted">Waiting for the company to submit its evaluation out of 50.</p>';
    return legacyEvaluationNote(p) + form("company-evaluation",field("Company grade (0–50)","score","","number",'min="0" max="50" step="0.5"') + textarea("Company evaluation & comments","comments"),"Submit to academic supervisor",p.id,"Your evaluation becomes read-only after submission. The academic supervisor reviews it and adds their own grade out of 50. Final marks remain private to staff.");
  }
  function academicEvaluationView(p) {
    const ev = U.db.academicEvaluations[p.id];
    if (ev) return `<p>${status("Sent")} · ${stamp(ev.sentAt)}</p><p class="evaluation-total">Academic grade <strong>${ev.score} / 50</strong></p><p class="pre-wrap">${E(ev.comments)}</p><p class="evaluation-total">Combined result <strong>${U.finalResult(p.id)} / 100</strong></p><p class="help-text">${U.db.completions[p.id] ? 'Approved by the coordinator. Successful completion is available to the student.' : 'Awaiting coordinator approval. The student’s completion message is not released yet.'}</p>`;
    if (p.status === "Completed") return '<p class="help-text">This previously approved internship is read-only.</p>';
    if (role !== "supervisor") return '<p class="muted">Waiting for the academic supervisor’s evaluation out of 50.</p>';
    if (!U.db.companyEvaluations[p.id]) return '<p class="help-text">The company must submit its evaluation before you can add yours.</p>';
    return form("academic-evaluation",field("Academic grade (0–50)","score","","number",'min="0" max="50" step="0.5"')+textarea("Academic evaluation & review of company assessment","comments"),"Submit combined evaluation to coordinator",p.id,"Review the company’s submitted assessment above. Your 50 marks are added to the company’s 50. The coordinator decides approval after checking the result and training requirements.");
  }
  function coordinatorPage() {
    const ps = visiblePlacements(),
      p = selection();
    if (view === "dashboard") {
      shell(
        stats([
          [
            "Students",
            U.all("users").filter((u) => u.role === "student").length,
          ],
          ["Companies", U.all("companies").length],
          ["Opportunities", U.all("opportunities").length],
          ["Internships", ps.length],
          ["Final academic evaluations", U.all("academicEvaluations").length],
        ]) +
          `<div class="two-columns">${card("Placement overview", placementList(ps))}${card("Completion reviews", `<p>${ps.filter((p) => U.db.academicEvaluations[p.id] && !U.db.completions[p.id]).length} internships have a final academic evaluation awaiting completion review.</p><div class="actions">${link("Review completion", "coordinator", "completion")}</div>`, "patch-check")}</div><div class="section-space">${card(
            "Internship opportunities",
            table(
              ["Opportunity", "Company", "Majors", "Status", "Action"],
              U.all("opportunities").map((op) => [
                E(op.title),
                E(companyName(op.companyId)),
                op.majorIds.map(majorName).map(E).join(" · "),
                status(op.status),
                button("View details", "opportunity", op.id),
              ]),
            ),
          )}</div>`,
        "Manage the faculty’s internship accounts, academic assignments and completion reviews.",
      );
    } else if (["students", "companies", "supervisors"].includes(view)) {
      const r = {
          students: "student",
          companies: "company",
          supervisors: "supervisor",
        }[view],
        list = U.all("users").filter((u) => u.role === r);
      shell(
        table(
          r === "student"
            ? ["Student", "Major", "Academic group", "Status", "Action"]
            : [
                "Name",
                "Email",
                r === "company" ? "Company" : "Department",
                "Status",
                "Action",
              ],
          list.map((u) =>
            r === "student"
              ? [
                  `<strong>${E(u.name)}</strong><small>${E(u.studentNumber)} · ${E(u.email)}</small>`,
                  E(majorName(u.majorId)),
                  `${E(U.db.groups[u.groupId]?.name)}<br><small>${E(userName(U.db.groups[u.groupId]?.supervisorId))}</small>`,
                  status(u.status),
                  button("Edit account", "edit-account", u.id),
                ]
              : [
                  E(u.name),
                  E(u.email),
                  E(r === "company" ? companyName(u.companyId) : u.department),
                  status(u.status),
                  button("Edit account", "edit-account", u.id),
                ],
          ),
        ),
        "Create and maintain accounts. Temporary credentials will be issued through Firebase Authentication after integration.",
        button("Create " + names[r] + " account", "new-account", r, true),
      );
    } else if (view === "assignments") {
      shell(
        table(
          ["Academic group", "Academic supervisor", "Students", "Action"],
          U.all("groups").map((g) => [
            E(g.name),
            E(userName(g.supervisorId)),
            String(
              U.all("users").filter(
                (u) => u.role === "student" && u.groupId === g.id,
              ).length,
            ),
            button("Change supervisor", "edit-group", g.id),
          ]),
        ) +
          `<div class="section-space">${card(
            "Student assignments",
            table(
              ["Student", "Major", "Group", "Academic supervisor", "Action"],
              assignedStudents().map((s) => [
                E(s.name),
                E(majorName(s.majorId)),
                E(U.db.groups[s.groupId]?.name),
                E(userName(U.db.groups[s.groupId]?.supervisorId)),
                button("Change group", "student-group", s.id),
              ]),
            ),
          )}</div>`,
        "Every student belongs to a supervised academic group from account creation.",
        button("Create academic group", "new-group", "", true),
      );
    } else if (view === "progress") {
      shell(
        p
          ? placementPicker(ps) + placementDetail(p)
          : empty(
              "No confirmed internships",
              "Confirmed offers will appear here for placement and progress monitoring.",
            ),
        "Monitor students, companies, tasks, submissions and training hours.",
      );
    } else if (view === "completion") {
      const checks = p ? U.completionChecks(p.id) : null;
      const labels = {
        companyEvaluation: "Company final evaluation received",
        academicEvaluation: "Academic final evaluation received",
        requiredHours: "Required training hours approved",
        tasksCompleted: "All assigned tasks completed and reviewed",
        finalReport: "Final report submitted and reviewed",
        passingResult: "Calculated result meets the pass threshold",
        trainingPeriodEnded: "Training period has ended",
      };
      shell(
        p
          ? placementPicker(ps) + evaluationTrail(p) +
              (U.db.completions[p.id]
                ? completionBlock(p)
                : `<div class="two-columns">${card(
                    "Completion requirements",
                    `<p>${E(userName(p.studentId))} · ${E(companyName(p.companyId))}</p><ul class="checks-list section-space">${Object.entries(
                      checks,
                    )
                      .map(
                        ([k, ok]) =>
                          `<li>${icon(ok ? "check-circle-fill" : "circle")}${E(labels[k])} — ${ok ? "Met" : "Pending"}</li>`,
                      )
                      .join(
                        "",
                      )}</ul><p class="section-space">Calculated result: <strong class="score-total">${U.finalResult(p.id) ?? "—"} / 100</strong></p><p class="help-text">Company 50 + academic supervisor 50 = 100. Pass threshold: 50. Only coordinator approval releases successful completion.</p>${Object.values(checks).every(Boolean) ? `<div class="actions">${button("Review & approve completion", "approve-completion", p.id, true)}</div>` : '<p class="help-text">Approval becomes available once every requirement is met.</p>'}`,
                  )}${card("Training summary", `<p>Approved hours: ${U.approvedHours(p.id)} / ${U.db.users[p.studentId].requiredHours}</p><p>Training: ${date(p.startDate)} – ${date(p.endDate)}</p><p class="section-space">Approval releases the student’s completion message and downloadable certificate. Final evaluation forms and scores remain private.</p>`)}</div>`) +
              `<div class="two-columns section-space">${card("Company final evaluation", companyEvaluationView(p))}${card("Academic final evaluation", academicEvaluationView(p))}</div>`
          : empty(
              "No completion reviews yet",
              "An internship must be confirmed before it can enter the completion process.",
            ),
        "Review both evaluations and all university requirements before approving completion.",
      );
    } else if (view === "messages") {
      shell(
        table(
          ["Sender", "Subject", "Received", "Status", "Action"],
          U.all("contactMessages")
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .map((m) => [
              `<strong>${E(m.name)}</strong><small>${E(m.email)}</small>`,
              E(m.subject),
              stamp(m.createdAt),
              status(m.status),
              button("Read message", "contact-message", m.id),
            ]),
        ),
        "View and manage Contact Us messages addressed to the university internship coordinator.",
      );
    } else if (view === "account")
      shell(profileForm(), "Maintain your coordinator account information.");
  }
  function render() {
    if (!role) {
      publicPage();
      return;
    }
    U.require(role);
    if (U.user.firstLogin) {
      location.replace("../first-login/first-login.html");
      return;
    }
    ({
      student: studentPage,
      company: companyPage,
      supervisor: supervisorPage,
      coordinator: coordinatorPage,
    })[role]();
  }
  function taskDetail(tid) {
    const t = U.db.tasks[tid],
      p = U.db.placements[t?.placementId];
    if (!t || !p || !U.canSeePlacement(p))
      throw Error("This task is not assigned to you.");
    const last = U.latestSubmission(tid),
      history = U.all("submissions")
        .filter((s) => s.taskId === tid)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    modal(
      t.title,
      `<div class="meta"><span>${E(t.kind)}</span><span>Due ${date(t.deadline)}</span>${status(U.taskState(tid))}</div><p class="pre-wrap">${E(t.description)}</p>${attachment(t.file || U.db.taskAttachments?.[t.attachmentId])}${role === "student" && p.status !== "Completed" && (!last || last.status === "Revision requested") ? `<div class="section-space">${form("submission", textarea("Describe your completed work", "description") + field("Work link", "link", "", "url", "", false) + field("Attach work (up to 1 MB)", "file", "", "file", 'accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.doc,.docx"', false), last ? "Resubmit work" : "Submit work", tid, "Your submission and selected file are retained in this browser session.")}</div>` : ""}<h3 class="section-space">Submission history</h3>${history.length ? history.map((s, i) => `<section class="review-block"><strong>Submission ${history.length - i} · ${stamp(s.createdAt)}</strong><p>${status(s.status)}</p><p>${E(s.description)}</p>${external(s.link, "Open submitted work")}${attachment(s.file)}${s.review ? `<p class="section-space"><strong>Company feedback</strong></p><p>${E(s.review.feedback)}</p>` : ""}${role === "company" && s.status === "Submitted" && p.status !== "Completed" ? `<div class="actions">${button("Review / request revisions", "review-submission", s.id, true)}</div>` : ""}</section>`).join("") : '<p class="muted section-space">No submissions yet.</p>'}`,
    );
  }
  function opportunityEditor(oid) {
    const op = U.db.opportunities[oid] || {};
    if (oid && op.supervisorId !== U.userId)
      throw Error("This opportunity does not belong to you.");
    modal(
      oid ? "Edit opportunity" : "Add opportunity",
      form(
        "opportunity",
        field("Opportunity title", "title", op.title) +
          field(
            "Location",
            "location",
            op.location || U.db.companies[U.user.companyId]?.city,
          ) +
          field(
            "Available seats",
            "seats",
            op.seats || 1,
            "number",
            'min="1" step="1"',
          ) +
          field("Application deadline", "deadline", op.deadline || "", "date") +
          textarea("Description", "description", op.description) +
          textarea("Requirements", "requirements", op.requirements) +
          `<fieldset class="full"><legend class="muted">Eligible specializations</legend><div class="checkboxes">${Object.entries(
            U.db.university.majors,
          )
            .map(
              ([id, m]) =>
                `<label><input type="checkbox" name="majorIds" value="${id}" ${op.majorIds?.includes(id) ? "checked" : ""}>${E(m.name)}</label>`,
            )
            .join("")}</div></fieldset>`,
        "Save opportunity",
        oid,
      ),
    );
  }
  function accountEditor(uid, r) {
    const u = U.db.users[uid] || { role: r },
      company = U.db.companies[u.companyId] || {};
    if (!["student", "company", "supervisor"].includes(u.role))
      throw Error("Unknown account role.");
    const groups = U.all("groups").filter(
      (g) => U.db.users[g.supervisorId]?.status === "Active",
    );
    modal(
      uid ? "Edit " + names[u.role] : "Create " + names[u.role],
      form(
        "account",
        `<input type="hidden" name="role" value="${u.role}">${field("Full name", "name", u.name)}${field("Email address", "email", u.email, "email")}${field("Phone number", "phone", u.phone, "tel", "", false)}${
          u.role === "student"
            ? field(
                "University",
                "university",
                "Yarmouk University",
                "text",
                "readonly",
              ) +
              field(
                "College",
                "college",
                U.db.university.college,
                "text",
                "readonly",
              ) +
              field("Student number", "studentNumber", u.studentNumber) +
              select(
                "Major",
                "majorId",
                Object.entries(U.db.university.majors).map(([id, m]) => [
                  id,
                  m.name,
                ]),
                u.majorId,
              ) +
              field(
                "Completed credit hours",
                "completedCredits",
                u.completedCredits ?? 0,
                "number",
                'min="0" max="300" step="1"',
              ) +
              select(
                "Training term",
                "term",
                [
                  ["Summer", "Summer — 8 weeks × 36 hours"],
                  ["Regular", "First / second semester — 14 weeks × 18 hours"],
                ],
                u.term || "Summer",
                "data-hours-term",
              ) +
              field(
                "Required training hours",
                "requiredHours",
                u.requiredHours || 288,
                "number",
                'min="1" max="2000"',
              ) +
              select(
                "Academic group (required at setup)",
                "groupId",
                groups.map((g) => [
                  g.id,
                  g.name + " · " + userName(g.supervisorId),
                ]),
                u.groupId,
                "required",
              )
            : u.role === "company"
              ? field("Company name", "companyName", company.name) +
                field("City", "city", company.city) +
                field(
                  "Industry",
                  "industry",
                  company.industry,
                  "text",
                  "",
                  false,
                ) +
                field(
                  "Company website",
                  "website",
                  company.website,
                  "url",
                  "",
                  false,
                ) +
                field("Job title", "jobTitle", u.jobTitle, "text", "", false)
              : field("Department", "department", u.department)
        }${
          uid
            ? select(
                "Account status",
                "status",
                [
                  ["Active", "Active"],
                  ["Inactive", "Inactive"],
                ],
                u.status,
              )
            : ""
        }`,
        "Save account",
        uid,
        "New accounts default to Active and require a supervised group for students. Staff identifiers are generated automatically. Temporary passwords are not stored in this frontend; account provisioning requires Firebase Authentication.",
      ),
    );
  }
  async function readFile(input, pdfOnly = false) {
    const file = input?.files?.[0];
    if (!file) return null;
    if (pdfOnly && !/\.pdf$/i.test(file.name)) throw Error("Choose a PDF assignment file.");
    if (/\.pdf$/i.test(file.name) && !(await file.slice(0, 5).text()).startsWith("%PDF-")) throw Error("Choose a valid PDF document.");
    if (file.size > 1024 * 1024)
      throw Error("Select a file no larger than 1 MB for this local session.");
    if (!/\.(pdf|png|jpe?g|webp|txt|docx?)$/i.test(file.name))
      throw Error("Choose a PDF, image, text or Word document.");
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    return { name: file.name, size: file.size, type: file.type, dataUrl };
  }
  async function submit(event) {
    const el = event.target;
    if (!el.dataset.form) return;
    event.preventDefault();
    const f = new FormData(el),
      get = (k) => String(f.get(k) || "").trim(),
      fid = el.dataset.id,
      err = el.querySelector(".form-error"),
      submitButton = el.querySelector("[type=submit]");
    if (err) err.textContent = "";
    if (submitButton) submitButton.disabled = true;
    try {
      switch (el.dataset.form) {
        case "search":
          location.search = "?q=" + encodeURIComponent(get("q"));
          return;
        case "placement-select":
          location.search =
            "?placement=" + encodeURIComponent(get("placement"));
          return;
        case "contact":
          U.contact({
            name: get("name"),
            email: get("email"),
            subject: get("subject"),
            message: get("message"),
          });
          el.reset();
          toast("Message saved in this browser session.");
          // Animate the illustration only after the existing save succeeds.
          el.dispatchEvent(new CustomEvent("contact:saved", { bubbles: true }));
          return;
        case "first-login":
          if (get("temporary") === get("password"))
            throw Error(
              "Choose a password different from your temporary password.",
            );
          if (get("password").length < 8 || get("password") !== get("confirm"))
            throw Error(
              "Enter matching new passwords of at least 8 characters.",
            );
          U.user.firstLogin = false;
          U.save();
          el.reset();
          location.href = url(U.user.role, "dashboard");
          return;
        case "change-password": {
          if (!U.user || U.user.role !== role) throw Error("Sign in to manage your account.");
          // Read exact input values: whitespace can be part of a password.
          const currentPassword = String(f.get("currentPassword") || "");
          const newPassword = String(f.get("newPassword") || "");
          const confirmPassword = String(f.get("confirmPassword") || "");
          el.querySelector(".password-form-status").textContent = "";
          let invalidField, message;
          if (!currentPassword) { invalidField = "currentPassword"; message = "Enter your current password."; }
          else if (newPassword.length < 8) { invalidField = "newPassword"; message = "Use at least 8 characters for your new password."; }
          else if (newPassword === currentPassword) { invalidField = "newPassword"; message = "Choose a new password different from your current password."; }
          else if (newPassword !== confirmPassword) { invalidField = "confirmPassword"; message = "The new passwords do not match."; }
          if (invalidField) {
            el.elements[invalidField].setAttribute("aria-invalid", "true");
            document.getElementById(invalidField + "-error").textContent = message;
            el.elements[invalidField].focus();
            throw Error(message);
          }
          el.reset();
          el.querySelectorAll(".password-control input").forEach((input) => input.type = "password");
          el.querySelectorAll(".password-toggle").forEach((toggle) => {
            toggle.textContent = "Show";
            toggle.setAttribute("aria-pressed", "false");
            toggle.setAttribute("aria-label", "Show " + el.querySelector(`label[for="${toggle.dataset.id}"]`).textContent.toLowerCase());
          });
          el.querySelector(".password-form-status").textContent = "Your entries match. Your password has not changed; account authentication is not connected. The fields have been cleared.";
          return;
        }
        case "profile": {
          const data = { name: get("name"), phone: get("phone") };
          if (role === "student") {
            data.cvLink = get("cvLink");
            data.portfolioLink = get("portfolioLink");
            const file = await readFile(el.elements.portfolioFile);
            if (file) data.portfolioFile = file;
          }
          if (role === "company") data.jobTitle = get("jobTitle");
          if (!data.name) throw Error("Enter your full name.");
          U.updateProfile(data);
          break;
        }
        case "apply":
          U.createApplication(get("opportunityId"), get("statement"));
          location.href = url("student", "applications");
          return;
        case "opportunity":
          U.saveOpportunity(
            {
              title: get("title"),
              location: get("location"),
              seats: Number(get("seats")),
              deadline: get("deadline"),
              description: get("description"),
              requirements: get("requirements"),
              majorIds: f.getAll("majorIds"),
              status: U.db.opportunities[fid]?.status || "Open",
            },
            fid,
          );
          break;
        case "reject":
          U.decideApplication(fid, "Rejected", get("reason"));
          break;
        case "task": {
          const data = {
            title: get("title"),
            description: get("description"),
            deadline: get("deadline"),
            kind: get("kind"),
            file: await readFile(el.elements.file, true),
          };
          if (get("audience") === "all") {
            U.createTasks(data, visiblePlacements().filter((p) => p.status !== "Completed").map((p) => p.id));
          } else {
            U.createTask({ ...data, placementId: get("placementId") });
          }
          break;
        }
        case "company-weekly":
          U.saveWeeklyReport(fid, Number(get("week")), { title: get("title"), targets: get("targets").split(/\r?\n/).map((line) => line.trim()).filter(Boolean), text: get("text") });
          break;
        case "submission":
          U.submitTask(fid, {
            description: get("description"),
            link: get("link"),
            file: await readFile(el.elements.file),
          });
          break;
        case "review": {
          const revision = get("decision") === "revision";
          const t = U.db.tasks[U.db.submissions[fid].taskId];
          U.reviewSubmission(fid, get("feedback"), revision);
          break;
        }
        case "hours":
          U.recordHours({
            placementId: fid,
            date: get("date"),
            hours: Number(get("hours")),
            description: get("description"),
            ...(get("replacesId") ? { replacesId: get("replacesId") } : {}),
          });
          break;
        case "review-hours":
          U.reviewHours(fid, get("decision") === "approve", get("reviewNote"));
          break;
        case "comment":
          U.academicComment(fid, get("comment"));
          break;
        case "company-evaluation":
          U.companyEvaluation(fid, get("score") === "" ? NaN : Number(get("score")), get("comments"));
          break;
        case "academic-evaluation":
          U.academicEvaluation(fid, get("score") === "" ? NaN : Number(get("score")), get("comments"));
          break;
        case "account": {
          const data = Object.fromEntries(f.entries());
          if (data.role === "student") {
            data.requiredHours = Number(data.requiredHours);
            data.completedCredits = Number(data.completedCredits);
          }
          U.saveAccount(data, fid);
          break;
        }
        case "group":
          U.saveGroup(get("name"), get("supervisorId"), fid);
          break;
        case "student-group": {
          U.require("coordinator");
          const group = U.db.groups[get("groupId")];
          if (!group || U.db.users[group.supervisorId]?.status !== "Active")
            throw Error("Select a group with an active academic supervisor.");
          if (
            U.all("users").filter(
              (u) =>
                u.id !== fid &&
                u.role === "student" &&
                u.groupId === get("groupId"),
            ).length >= 9
          )
            throw Error("This group already has nine students.");
          U.db.users[fid].groupId = get("groupId");
          U.save();
          break;
        }
      }
      close();
      render();
      toast("Saved in this browser session.");
    } catch (error) {
      if (err) err.textContent = error.message;
      else toast(error.message);
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  }
  async function action(event) {
    const el = event.target.closest("[data-action]");
    if (!el) return;
    const id = el.dataset.id;
    try {
      switch (el.dataset.action) {
        case "close":
          close();
          break;
        case "password-cancel": {
          const details = el.closest(".profile-password");
          details.open = false;
          details.querySelector("summary").focus();
          break;
        }
        case "password-visibility": {
          const input = document.getElementById(id);
          if (!input || !input.closest('[data-form="change-password"]')) return;
          const show = input.type === "password";
          input.type = show ? "text" : "password";
          el.textContent = show ? "Hide" : "Show";
          el.setAttribute("aria-pressed", String(show));
          el.setAttribute("aria-label", `${show ? "Hide" : "Show"} ${document.querySelector(`label[for="${id}"]`).textContent.toLowerCase()}`);
          break;
        }
        case "logout":
          U.signOut();
          break;
        case "theme": {
          const next =
            document.documentElement.dataset.theme === "dark"
              ? "light"
              : "dark";
          document.documentElement.dataset.theme = next;
          localStorage.setItem("yarmouk:portal-theme", next);
          window.YarmoukChrome?.syncTheme();
          break;
        }
        case "evaluation-student":
        case "monitor-student": {
          U.require("supervisor");
          const student = assignedStudents().find((entry) => entry.id === id);
          if (!student) throw Error("This student is not assigned to you.");
          params.set("student", id);
          params.delete("week");
          const placement = visiblePlacements().find((entry) => entry.studentId === id);
          if (placement) params.set("placement", placement.id);
          else params.delete("placement");
          history.replaceState(null, "", "?" + params.toString());
          render();
          document.querySelector(`.report-student-button[data-id="${CSS.escape(id)}"]`)?.focus({ preventScroll: true });
          if (matchMedia("(max-width: 960px)").matches)
            document.getElementById(view === "evaluations" ? "evaluationDetail" : "supervisorReportDetail")?.scrollIntoView({ block: "start" });
          break;
        }
        case "evaluation-clear":
        case "monitor-change-student": {
          params.delete("student");
          params.delete("placement");
          params.delete("week");
          history.replaceState(null, "", location.pathname + (params.size ? "?" + params.toString() : ""));
          render();
          document.getElementById(view === "evaluations" ? "supervisorEvaluationSearch" : "supervisorReportSearch")?.focus();
          break;
        }
        case "student-week": {
          U.require("student");
          params.set("week", String(id));
          history.replaceState(null, "", "?" + params.toString());
          render();
          document.querySelector(`.student-training-week[data-id="${CSS.escape(id)}"]`)?.focus({ preventScroll: true });
          break;
        }
        case "monitor-week": {
          U.require("supervisor");
          params.set("week", String(id));
          const selectedPlacement = selection();
          if (selectedPlacement) params.set("placement", selectedPlacement.id);
          history.replaceState(null, "", "?" + params.toString());
          render();
          document.querySelector(`.monitor-week[data-id="${CSS.escape(id)}"]`)?.focus({ preventScroll: true });
          break;
        }
        case "menu": {
          window.YarmoukChrome?.toggleMobile();
          break;
        }
        case "opportunity": {
          const op = U.db.opportunities[id];
          if (!op) throw Error("Opportunity not found.");
          modal(
            op.title,
            `<p>${E(companyName(op.companyId))} · ${E(op.location)}</p><div class="meta">${status(op.status)}<span>${op.seats} seats · Apply by ${date(op.deadline)}</span></div><h3 class="section-space">About this opportunity</h3><p class="pre-wrap">${E(op.description)}</p><h3 class="section-space">Requirements</h3><p class="pre-wrap">${E(op.requirements)}</p><p class="section-space muted">${op.majorIds.map(majorName).map(E).join(" · ")}</p>${role === "student" && op.status === "Open" && !U.placement(U.userId) && !U.all("applications").some((a) => a.studentId === U.userId && a.opportunityId === id) ? `<div class="actions section-space">${link("Apply for this internship", "student", "apply", "?opportunity=" + id, true)}</div>` : ""}`,
          );
          break;
        }
        case "new-opportunity":
          U.require("company");
          opportunityEditor();
          break;
        case "edit-opportunity":
          U.require("company");
          opportunityEditor(id);
          break;
        case "close-opportunity":
          U.closeOpportunity(id);
          render();
          toast(
            "Opportunity closed. Existing applications and internships are retained.",
          );
          break;
        case "application": {
          const a = U.db.applications[id],
            op = U.db.opportunities[a?.opportunityId];
          if (
            !a ||
            !(a.studentId === U.userId || op?.supervisorId === U.userId)
          )
            throw Error("This application does not belong to you.");
          const s = U.db.users[a.studentId];
          modal(
            "Internship application",
            `<h3>${E(op.title)}</h3><p class="section-space">${status(a.status)}</p><dl class="detail-list section-space"><div><dt>Student / specialization</dt><dd>${E(s.name)} · ${E(majorName(s.majorId))}</dd></div><div><dt>Student email</dt><dd>${E(s.email)}</dd></div><div><dt>Statement</dt><dd class="pre-wrap">${E(a.statement)}</dd></div>${a.reason ? `<div><dt>Rejection reason</dt><dd>${E(a.reason)}</dd></div>` : ""}</dl><div class="section-space">${external(s.cvLink, "View CV")} ${external(s.portfolioLink, "View portfolio")}${attachment(s.portfolioFile)}</div>${role === "company" && a.status === "Pending" ? `<div class="actions section-space">${button("Accept application", "accept", id, true)}${button("Reject with reason", "reject", id)}</div>` : role === "student" && a.status === "Accepted" ? `<div class="actions section-space">${button("Confirm this offer", "confirm-offer", id, true)}</div>` : ""}`,
          );
          break;
        }
        case "accept":
          U.decideApplication(id, "Accepted");
          close();
          render();
          toast(
            "Offer recorded. The student must confirm it before training begins.",
          );
          break;
        case "reject":
          modal(
            "Reject application",
            form(
              "reject",
              textarea("Reason for rejection", "reason"),
              "Reject application",
              id,
            ),
          );
          break;
        case "confirm-offer":
          modal(
            "Confirm your internship",
            `<p>You can confirm only one internship. Your other pending applications and accepted offers will be marked Not selected.</p><div class="actions section-space">${button("Confirm this internship", "confirm-offer-final", id, true)}${button("Go back", "close")}</div>`,
          );
          break;
        case "confirm-offer-final":
          U.confirmOffer(id);
          close();
          render();
          toast(
            "Internship confirmed. Your company supervisor can now assign tasks.",
          );
          break;
        case "company-student": {
          U.require("company");
          if (!visiblePlacements().some((p) => p.id === id)) throw Error("This student is not assigned to you.");
          params.set("placement", id);
          params.delete("week");
          history.replaceState(null, "", "?" + params.toString());
          render();
          document.querySelector(`[data-action="company-student"][data-id="${CSS.escape(id)}"]`)?.focus({ preventScroll: true });
          break;
        }
        case "company-week": {
          U.require("company");
          params.set("week", String(id));
          history.replaceState(null, "", "?" + params.toString());
          render();
          document.querySelector(`[data-action="company-week"][data-id="${CSS.escape(id)}"]`)?.focus({ preventScroll: true });
          break;
        }
        case "new-task-all":
        case "new-task": {
          U.require("company");
          const ps = visiblePlacements().filter(
            (p) => p.status !== "Completed",
          );
          const all = el.dataset.action === "new-task-all";
          const selected = ps.find((p) => p.id === id);
          if (!ps.length) throw Error("There are no active trainees to assign work to.");
          if (!all && id && !selected) throw Error("Choose an active student assigned to you.");
          modal(
            all ? "Assign task to all active students" : "Add task to student",
            form(
              "task",
              `<input type="hidden" name="audience" value="${all ? "all" : "student"}">` + (all ? `<p class="full help-text">This creates a separate task for each of your ${ps.length} active trainees. Submissions and grades remain individual.</p>` : selected ? `<input type="hidden" name="placementId" value="${E(selected.id)}"><p class="full company-task-recipient">Assigning to <strong dir="auto">${E(userName(selected.studentId))}</strong> only</p>` : select(
                "Trainee",
                "placementId",
                ps.map((p) => [p.id, userName(p.studentId)]),
                "",
                "required",
              )) +
                select("Work type", "kind", [
                  ["Task", "Task"],
                  ["Final report", "Final internship report"],
                ]) +
                field("Task title", "title") +
                field("Deadline", "deadline", "", "date") +
                textarea("Requirements & description", "description") +
                field("Attach assignment PDF (up to 1 MB)", "file", "", "file", 'accept=".pdf,application/pdf"', false),
              all ? `Assign to ${ps.length} active students` : "Add task",
              "",
              "Tasks are reviewed through completion and feedback, without points. Files are retained in this browser session; no server upload occurs.",
            ),
          );
          break;
        }
        case "task":
          taskDetail(id);
          break;
        case "review-submission": {
          const s = U.db.submissions[id],
            t = U.db.tasks[s?.taskId];
          if (!t) throw Error("Submission not found.");
          U.assertPlacement(t.placementId, "company");
          modal(
            "Review submission",
            form(
              "review",
              select("Review decision", "decision", [
                ["evaluate", "Mark work completed"],
                ["revision", "Request modifications / resubmission"],
              ]) +
                textarea("Feedback / requested modifications", "feedback"),
              "Save review",
              id,
              "Give completion feedback or explain the changes needed for resubmission. Tasks do not carry points.",
            ),
          );
          break;
        }
        case "placement": {
          const p = U.db.placements[id];
          if (!p || !U.canSeePlacement(p))
            throw Error("This internship is not assigned to you.");
          modal(userName(p.studentId), placementDetail({ ...p, id }));
          break;
        }
        case "record-hours":
          U.assertPlacement(id, "company");
          modal(
            "Record training hours",
            form(
              "hours",
              field(
                "Training date",
                "date",
                "",
                "date",
                `min="${U.db.placements[id].startDate}" max="${U.db.placements[id].endDate}"`,
              ) +
                field(
                  "Hours",
                  "hours",
                  "",
                  "number",
                  'min="0.5" max="12" step="0.5"',
                ) +
                textarea("Work completed", "description"),
              "Record for academic verification",
              id,
              "Completing a task does not automatically approve any training hours.",
            ),
          );
          break;
        case "correct-hours": {
          const h = U.db.hourEntries[id];
          if (!h) throw Error("Hours record not found.");
          U.assertPlacement(h.placementId, "company");
          modal(
            "Correct returned hours",
            form(
              "hours",
              `<input type="hidden" name="replacesId" value="${E(id)}">` +
                field("Training date", "date", h.date, "date") +
                field(
                  "Hours",
                  "hours",
                  h.hours,
                  "number",
                  'min="0.5" max="12" step="0.5"',
                ) +
                textarea(
                  "Corrected work description",
                  "description",
                  h.description,
                ),
              "Resubmit for academic verification",
              h.placementId,
              "The original returned record remains in the history.",
            ),
          );
          break;
        }
        case "review-hours": {
          const h = U.db.hourEntries[id];
          U.assertPlacement(h.placementId, "supervisor");
          modal(
            "Verify training hours",
            `<p>${date(h.date)} · ${h.hours} hours</p><p class="pre-wrap section-space">${E(h.description)}</p><div class="section-space">${form(
              "review-hours",
              select("Decision", "decision", [
                ["approve", "Approve hours"],
                ["return", "Return for correction"],
              ]) +
                textarea(
                  "Review note (required when returning)",
                  "reviewNote",
                  "",
                  false,
                ),
              "Save verification",
              id,
            )}</div>`,
          );
          break;
        }
        case "academic-comment":
          U.assertPlacement(id, "supervisor");
          modal(
            "Add academic feedback",
            form(
              "comment",
              textarea("Academic comment", "comment"),
              "Save comment",
              id,
            ),
          );
          break;
        case "new-account":
          U.require("coordinator");
          accountEditor("", id);
          break;
        case "edit-account":
          U.require("coordinator");
          accountEditor(id);
          break;
        case "new-group":
        case "edit-group": {
          U.require("coordinator");
          const g = U.db.groups[id] || {};
          modal(
            id ? "Change group supervisor" : "Create academic group",
            form(
              "group",
              field("Group name", "name", g.name) +
                select(
                  "Academic supervisor",
                  "supervisorId",
                  U.all("users")
                    .filter(
                      (u) => u.role === "supervisor" && u.status === "Active",
                    )
                    .map((u) => [u.id, u.name]),
                  g.supervisorId,
                  "required",
                ),
              "Save assignment",
              id,
            ),
          );
          break;
        }
        case "student-group":
          U.require("coordinator");
          modal(
            "Change student group",
            form(
              "student-group",
              select(
                "Academic group",
                "groupId",
                U.all("groups")
                  .filter(
                    (g) => U.db.users[g.supervisorId]?.status === "Active",
                  )
                  .map((g) => [
                    g.id,
                    g.name + " · " + userName(g.supervisorId),
                  ]),
                U.db.users[id].groupId,
                "required",
              ),
              "Save assignment",
              id,
            ),
          );
          break;
        case "approve-completion":
          U.require("coordinator");
          modal(
            "Approve internship completion",
            `<p>Approve completion for <strong>${E(userName(U.db.placements[id].studentId))}</strong>? This closes the internship and releases the completion certificate to the student.</p><div class="actions section-space">${button("Approve & generate certificate", "approve-completion-final", id, true)}${button("Go back", "close")}</div>`,
          );
          break;
        case "approve-completion-final":
          U.approveCompletion(id);
          close();
          render();
          toast(
            "Completion approved in this session. The certificate is available to the student.",
          );
          break;
        case "certificate":
          showCertificate(id);
          break;
        case "download-certificate":
          await downloadCertificate(id);
          break;
        case "print-certificate":
          await downloadCertificate(id, true);
          break;
        case "contact-message": {
          U.require("coordinator");
          const m = U.db.contactMessages[id];
          if (!m) throw Error("Message not found.");
          if (m.status === "New") {
            U.manageMessage(id, "Read");
            render();
          }
          modal(
            m.subject,
            `<p><strong>${E(m.name)}</strong> · ${E(m.email)}</p><p class="muted">${stamp(m.createdAt)}</p><p class="pre-wrap section-space">${E(m.message)}</p><div class="actions section-space">${button("Archive message", "archive-message", id)}</div>`,
          );
          break;
        }
        case "archive-message":
          U.manageMessage(id, "Archived");
          close();
          render();
          toast("Message archived in this session.");
          break;
      }
    } catch (error) {
      toast(error.message);
    }
  }
  function certificateData(pid) {
    const c = U.db.completions[pid],
      p = U.db.placements[pid];
    if (
      !c ||
      !p ||
      !["student", "coordinator"].includes(U.user?.role) ||
      !(U.user.role === "coordinator" || p.studentId === U.userId)
    )
      throw Error("This certificate is unavailable to this account.");
    return { c, p, s: U.db.users[p.studentId] };
  }
  function showCertificate(pid) {
    const { c, p, s } = certificateData(pid);
    modal(
      "Internship Completion Certificate",
      `<div class="certificate-sheet"><div class="certificate-brand-row"><img src="../../assets/yarmouk-logo.svg" alt="Yarmouk University"></div><p>Yarmouk University</p><h1>Internship Completion Certificate</h1><p>This certifies that</p><h2>${E(s.name)}</h2><p>${E(majorName(s.majorId))}<br>${E(U.db.university.college)}</p><p>has successfully completed the internship at<br><strong>${E(companyName(p.companyId))}</strong></p><p>${date(p.startDate)} – ${date(p.endDate)}<br>${U.approvedHours(pid)} approved training hours</p><p>Approved by the University Internship Coordinator<br>${E(userName(c.approvedBy))}</p><p class="serial">${E(c.certificateNumber)} · ${stamp(c.approvedAt)}</p></div><div class="actions section-space">${button("Download PDF", "download-certificate", pid, true)}${button("Print certificate", "print-certificate", pid)}</div>`,
    );
  }
  async function downloadCertificate(pid, print = false) {
    const { c, p, s } = certificateData(pid);
    toast("Preparing your certificate…");
    if (!window.PDFLib)
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "../../shared/vendor/pdf-lib.min.js";
        script.onload = resolve;
        script.onerror = () =>
          reject(Error("The PDF library could not be loaded."));
        document.head.append(script);
      });
    await document.fonts.ready;
    const canvas = document.createElement("canvas");
    canvas.width = 2100;
    canvas.height = 1485;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, 2100, 1485);
    ctx.strokeStyle = "#C5A059";
    ctx.lineWidth = 5;
    ctx.strokeRect(55, 55, 1990, 1375);
    ctx.lineWidth = 1;
    ctx.strokeRect(72, 72, 1956, 1341);
    ctx.fillStyle = "#006837";
    ctx.textAlign = "center";
    const logo = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = "../../assets/yarmouk-logo.svg";
    });
    ctx.drawImage(logo, 825, 115, 450, 156);
    ctx.fillStyle = "#006837";
    const line = (text, y, size = 30, bold = false) => {
      ctx.font = `${bold ? "600" : "400"} ${size}px Inter,Arial`;
      while (ctx.measureText(text).width > 1830 && size > 16) {
        size--;
        ctx.font = `${bold ? "600" : "400"} ${size}px Inter,Arial`;
      }
      ctx.fillText(text, 1050, y);
    };
    line("Yarmouk University", 345, 30);
    line("Internship Completion Certificate", 470, 58, true);
    line("This certifies that", 560, 28);
    line(s.name, 665, 58, true);
    line(majorName(s.majorId), 730, 30);
    line(U.db.university.college, 780, 27);
    line("has successfully completed the internship at", 875, 30);
    line(companyName(p.companyId), 935, 40, true);
    line(
      `${date(p.startDate)} – ${date(p.endDate)} · ${U.approvedHours(pid)} approved training hours`,
      1010,
      27,
    );
    line("Approved by the University Internship Coordinator", 1130, 26);
    line(userName(c.approvedBy), 1180, 30, true);
    line(
      `${c.certificateNumber} · ${date(c.approvedAt.slice(0, 10))}`,
      1310,
      22,
    );
    const pdf = await PDFLib.PDFDocument.create(),
      page = pdf.addPage([841.89, 595.28]),
      png = await pdf.embedPng(canvas.toDataURL("image/png"));
    page.drawImage(png, { x: 0, y: 0, width: 841.89, height: 595.28 });
    pdf.setTitle("Internship Completion Certificate");
    pdf.setAuthor("Yarmouk University");
    const blob = new Blob([await pdf.save()], { type: "application/pdf" }),
      blobUrl = URL.createObjectURL(blob);
    if (print) {
      const frame = document.createElement("iframe");
      frame.hidden = true;
      frame.src = blobUrl;
      frame.title = "Print internship completion certificate";
      document.body.append(frame);
      frame.onload = () => {
        frame.contentWindow.focus();
        frame.contentWindow.print();
      };
      setTimeout(() => {
        frame.remove();
        URL.revokeObjectURL(blobUrl);
      }, 120000);
    } else {
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = c.certificateNumber + ".pdf";
      a.click();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    }
    toast("Certificate PDF prepared from the approved internship record.");
  }
  document.addEventListener("click", action);
  document.addEventListener("submit", submit);
  document.addEventListener("toggle", (event) => {
    const details = event.target;
    if (!details.matches(".profile-password") || details.open) return;
    const form = details.querySelector("form");
    form.reset();
    form.querySelectorAll("input").forEach((input) => { input.type = "password"; input.removeAttribute("aria-invalid"); });
    form.querySelectorAll(".password-toggle").forEach((toggle) => {
      toggle.textContent = "Show";
      toggle.setAttribute("aria-pressed", "false");
      toggle.setAttribute("aria-label", "Show " + form.querySelector(`label[for="${toggle.dataset.id}"]`).textContent.toLowerCase());
    });
    form.querySelectorAll(".form-error, .password-field-error, .password-form-status").forEach((node) => node.textContent = "");
  }, true);
  document.addEventListener("input", (event) => {
    if (event.target.closest('[data-form="change-password"]')) {
      event.target.removeAttribute("aria-invalid");
      event.target.removeAttribute("aria-errormessage");
      document.getElementById(event.target.name + "-error").textContent = "";
      const form = event.target.form;
      form.querySelector(".form-error").textContent = "";
      form.querySelector(".password-form-status").textContent = "";
    }
    if (event.target.id === "supervisorReportSearch") filterReportStudents(event.target);
    if (event.target.id === "supervisorEvaluationSearch") filterEvaluationStudents(event.target);
    if (event.target.id === "companyStudentSearch") {
      companyStudentQuery = event.target.value;
      const query = companyStudentQuery.trim().toLowerCase();
      let matches = 0;
      document.querySelectorAll("[data-company-search]").forEach((button) => { button.hidden = !button.dataset.companySearch.includes(query); if (!button.hidden) matches++; });
      document.getElementById("companyStudentCount").textContent = `${matches} students`;
      document.getElementById("companyStudentEmpty").hidden = matches > 0;
    }
  });
  document.addEventListener("change", (event) => {
    if (event.target.matches("[data-hours-term]"))
      event.target.form.elements.requiredHours.value =
        event.target.value === "Summer" ? 288 : 252;
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      const side = document.querySelector(".sidebar");
      if (side) side.classList.remove("open");
    }
  });
  U.ready.then(render).catch((error) => {
    document.getElementById("app").innerHTML =
      `<main class="public-main" id="main"><h1>Open your workspace</h1><p class="section-space">${E(error.message)}</p><div class="actions section-space"><a class="ui-button primary" href="../login/login.html">Go to login</a></div></main>`;
  });
})();
