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
  const names = {
    student: "Student",
    company: "Company Supervisor",
    supervisor: "Academic Supervisor",
    coordinator: "University Internship Coordinator",
  };
  const nav = {
    student: [
      ["dashboard", "Dashboard", "grid"],
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
      ["tasks", "Manage & Review Tasks", "list-task"],
      ["evaluations", "Reports & Final Evaluation", "clipboard-check"],
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
  const title = () => nav[role]?.find((x) => x[0] === view)?.[1] || "Bridgeway";
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
    `<span class="status ${["Confirmed", "Accepted", "Active", "Approved", "Evaluated", "Completed", "Sent"].includes(value) ? "good" : ["Pending", "Submitted", "Revision requested", "New"].includes(value) ? "wait" : ["Rejected", "Returned", "Inactive"].includes(value) ? "bad" : ""}">${E(value)}</span>`;
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
    `<label class="field"><span>${E(label)}</span><input class="ui-input" name="${name}" type="${type}" value="${E(value)}" ${required ? "required" : ""} ${extra}></label>`;
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
  function studentShell(content, description, action) {
    const shortNames = {
      dashboard: "Dashboard",
      opportunities: "Explore",
      applications: "Applications",
      tasks: "My tasks",
      progress: "My training",
    };
    const initials = U.user.name
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("");
    const heading =
      view === "dashboard"
        ? "Find work worth learning."
        : view === "progress"
          ? "My training"
          : title();
    const kicker =
      view === "dashboard" || view === "opportunities"
        ? `${U.user.name.split(" ")[0]}’s opportunity collection`
        : "Your internship workspace";
    const dark = document.documentElement.dataset.theme === "dark";
    document.body.classList.add("student-studio", "student-gallery");
    document.getElementById("app").innerHTML =
      `<div class="student-workspace"><main id="main" class="student-main"><header class="studio-top"><a class="studio-brand" href="../home/index.html" aria-label="Bridgeway home"><img src="../../assets/bridgeway-logo.svg" alt="Bridgeway" width="112" height="65"></a><nav class="studio-navigation" aria-label="Student workspace">${nav.student
        .filter(([key]) => key !== "profile")
        .map(
          ([key, label, ic]) =>
            `<a href="${url("student", key)}" ${key === view ? 'aria-current="page"' : ""}>${icon(ic)}<span>${E(shortNames[key] || label)}</span></a>`,
        )
        .join(
          "",
        )}</nav><div class="studio-header-actions"><button class="studio-appearance" type="button" data-action="theme" aria-label="${dark ? "Switch to light mode" : "Switch to dark mode"}">${icon(dark ? "sun" : "moon-stars")}</button><details class="studio-account"><summary aria-label="Student account options"><span class="studio-avatar">${E(initials)}</span><span class="studio-account-name">${E(U.user.name)}</span>${icon("chevron-down")}</summary><nav class="studio-account-menu" aria-label="Student account"><p>Student account</p><a href="${url("student", "profile")}" ${view === "profile" ? 'aria-current="page"' : ""}>${icon("person")}My profile</a><button type="button" data-action="logout">${icon("box-arrow-right")}Sign out</button></nav></details></div></header><header class="studio-welcome"><div><p class="studio-kicker">${E(kicker)}</p><h1>${E(heading)}</h1><p>${E(description)}</p></div><div class="studio-welcome-actions">${action}<div class="studio-collaboration"><span>In collaboration with</span>${collegeMark()}</div></div></header>${content}</main></div>`;
    document.getElementById("app").removeAttribute("aria-busy");
  }
  function shell(content, description = "", action = "") {
    if (role === "student") {
      studentShell(content, description, action);
      return;
    }
    document.getElementById("app").innerHTML =
      `<div class="workspace"><div class="sidebar-rail"><aside id="portal-navigation" class="sidebar" aria-label="${E(names[role])} navigation"><header class="sidebar-header"><a href="../home/index.html" aria-label="Bridgeway home"><img class="sidebar-logo" src="../../assets/bridgeway-logo.svg" alt="Bridgeway"></a><button type="button" class="sidebar-toggle" aria-label="Expand navigation" aria-expanded="false" aria-controls="portal-navigation">${icon("chevron-right")}</button></header><nav>${nav[
        role
      ]
        .filter(([key]) => key !== "account")
        .map(
          ([key, label, ic]) =>
            `<a class="nav-item ${key === view ? "active" : ""}" ${key === view ? 'aria-current="page"' : ""} aria-label="${E(label)}" title="${E(label)}" href="${url(role, key)}">${icon(ic)}<span>${E(label)}</span></a>`,
        )
        .join(
          "",
        )}</nav><div class="sidebar-bottom"><button class="sidebar-pin" type="button" role="switch" aria-checked="false"><span>Keep sidebar open</span><span class="sidebar-pin-track" aria-hidden="true"></span></button><a class="sidebar-profile ${view === "account" ? "active" : ""}" href="${url(role, "account")}" aria-label="Profile" title="Profile">${icon("person-circle")}<span>Profile</span></a><button type="button" data-action="theme" aria-label="Change appearance" title="Change appearance">${icon("moon-stars")}<span>Dark / light mode</span></button><button type="button" data-action="logout" aria-label="Log out" title="Log out">${icon("box-arrow-right")}<span>Log out</span></button></div></aside></div><main class="workspace-main" id="main"><header class="topbar"><button class="ui-button mobile-toggle" type="button" data-action="menu" aria-label="Open navigation" aria-expanded="false" aria-controls="portal-navigation">${icon("list")}</button><div class="breadcrumb">Workspace <span>/</span> ${E(names[role])}</div><div class="portal-header-identity">${collegeMark("portal-college-mark")}<a class="viewer" href="${url(role, "account")}"><span class="avatar">${E(
        U.user.name
          .split(" ")
          .map((x) => x[0])
          .slice(0, 2)
          .join(""),
      )}</span><span>${E(U.user.name)}</span></a></div></header><div class="page-title"><div><span class="partner">YARMOUK UNIVERSITY · FACULTY OF IT & COMPUTER SCIENCE</span><h1>${E(title())}</h1><p>${E(description)}</p></div>${action}</div>${content}</main></div>`;
    document.getElementById("app").removeAttribute("aria-busy");
    window.BridgewayChrome?.mountSidebar();
  }
  function publicShell(content) {
    document.getElementById("app").innerHTML =
      `<header class="public-header"><a href="../home/index.html"><img src="../../assets/bridgeway-logo.svg" alt="Bridgeway home"></a><nav aria-label="Main navigation"><a href="../home/index.html">Home</a><a href="../about/about.html">About Us</a><a href="../contact/contact.html">Contact Us</a><a class="ui-button primary" href="../login/login.html">Log in</a></nav></header><main class="public-main" id="main">${content}</main>`;
  }
  function publicPage() {
    if (view === "about") {
      publicShell(
        `<div class="public-collaboration">${collegeMark()}<span class="partner">BRIDGEWAY × YARMOUK UNIVERSITY</span></div><h1>Your learning. Put into practice.</h1><p class="lead">Bridgeway connects Yarmouk University's Faculty of Information Technology and Computer Science with company supervisors, academic supervisors and the university internship coordinator. Follow your internship from your first application to your completion certificate.</p><div class="two-columns section-space">${card(
          "One faculty. Six paths.",
          `<ul class="activity-list">${Object.values(U.db.university.majors)
            .map((m) => `<li>${E(m.name)}</li>`)
            .join("")}</ul>`,
          "mortarboard",
        )}${card("Built around your internship", `<ul class="activity-list"><li><strong>Find your opportunity</strong>Explore roles suited to your college and major.</li><li><strong>Confirm your place</strong>Companies decide on applications. You confirm one accepted offer.</li><li><strong>Learn through the work</strong>Submit tasks, respond to feedback and track verified hours.</li><li><strong>Complete your internship</strong>Your coordinator reviews the requirements and releases your certificate.</li></ul>`, "signpost-split")}</div><section id="process" class="section-space"><h2>How your internship works</h2><p class="muted section-space">From application to completion, see each step in the process.</p><video class="process-video section-space" controls playsinline preload="metadata" poster="../../assets/process-poster.jpg"><source src="../../assets/internship-process.mp4" type="video/mp4"><track kind="captions" src="../../assets/internship-process.vtt" srclang="en" label="English" default></video></section>`,
      );
    } else if (view === "contact") {
      publicShell(
        `<span class="partner">CONTACT THE INTERNSHIP COORDINATOR</span><h1>Let's get you moving.</h1><p class="lead">Have a question about the internship process? Leave your details and message for the university internship coordinator.</p><div class="two-columns section-space">${card("Send a message", form("contact", field("Name", "name") + field("Email address", "email", "", "email") + field("Subject", "subject") + textarea("Message", "message"), "Save message"))}${card("Yarmouk University", `<p>Faculty of Information Technology and Computer Science<br>Irbid, Jordan</p><p class="section-space">Messages are saved in this browser session. Firebase delivery will be available after integration.</p>`, "geo-alt")}</div>`,
      );
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
          `<strong>${E(t.title)}</strong><small>${E(t.kind)} · ${t.criteria.reduce((a, c) => a + c.maximum, 0)} points</small>`,
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
      tasks = U.all("tasks").filter((t) => t.placementId === p?.id),
      approved = p ? U.approvedHours(p.id) : 0;
    if (view === "dashboard") {
      const next = tasks
        .filter((t) => U.taskState(t.id) !== "Evaluated")
        .sort((a, b) => a.deadline.localeCompare(b.deadline))[0];
      const summary = `<section class="studio-overview" aria-label="Internship summary"><div><span>Applications</span><strong>${apps.length}</strong><a href="${url("student", "applications")}">Track company decisions ${icon("arrow-up-right")}</a></div><div><span>Assigned work</span><strong>${tasks.filter((t) => U.taskState(t.id) !== "Evaluated").length}<small>to complete</small></strong><a href="${url("student", "tasks")}">Open my tasks ${icon("arrow-up-right")}</a></div><div><span>Approved training hours</span><strong>${approved}<small>/ ${U.user.requiredHours} h</small></strong><div class="studio-hour-line"><span style="width:${Math.min(100, (approved / U.user.requiredHours) * 100)}%"></span></div></div><div><span>Next deadline</span><strong class="studio-next-date">${next ? date(next.deadline) : "All caught up"}</strong><p>${next ? E(next.title) : "Your upcoming work will appear here."}</p></div></section>`;
      shell(
        (p?.status === "Completed" ? completionBlock(p) : summary) +
          '<div id="student-discovery" class="student-discovery"></div>',
        "A closer look at the teams, the work, and your next steps.",
        p
          ? link("Continue my training", "student", "progress")
          : link("Complete my profile", "student", "profile"),
      );
      mountStudentDiscovery();
    } else if (view === "profile") {
      shell(
        profileForm(),
        "Keep your contact details and CV or portfolio up to date. Academic information is maintained by the coordinator.",
      );
    } else if (view === "opportunities") {
      shell(
        '<div id="student-discovery" class="student-discovery"></div>',
        "A closer look at the teams and opportunities for your college and major.",
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
          ? trainingRecord(p) +
              `<div class="studio-section-title"><h2>Your assigned work</h2><p>Open a task to submit work, see feedback or respond to a revision request.</p></div>` +
              studentTaskCards(tasks)
          : empty(
              "Confirm an internship to begin",
              "Tasks become available after you confirm an accepted offer.",
              link("My applications", "student", "applications"),
            ),
        "The work, deadlines and feedback that move your internship forward.",
      );
    } else if (view === "progress") {
      const latest = tasks
        .map((t) => ({ task: t, submission: U.latestSubmission(t.id) }))
        .filter((x) => x.submission?.review)
        .sort((a, b) =>
          b.submission.review.reviewedAt.localeCompare(
            a.submission.review.reviewedAt,
          ),
        )[0];
      shell(
        p
          ? (p.status === "Completed"
              ? completionBlock(p)
              : trainingRecord(p)) +
              `<div class="studio-section-title"><h2>Your internship journey</h2><p>Assigned tasks and their current status</p></div>` +
              studentTaskCards(tasks) +
              `<div class="studio-training-columns"><section class="studio-training-panel"><h2>Training hours</h2><p class="muted">Recorded by your company supervisor and verified by your academic supervisor.</p><div class="section-space">${hoursTable(p)}</div></section><aside class="studio-feedback-panel"><h2>${icon("chat-left-text")} Company feedback</h2>${latest ? `<p class="muted">${E(latest.task.title)}</p><p class="pre-wrap">${E(latest.submission.review.feedback)}</p>${status(latest.submission.status)}<div class="actions">${button("View work & feedback", "task", latest.task.id)}</div>` : "<p>Company feedback will appear after your submitted work has been reviewed.</p>"}<div class="studio-academic-feedback"><h3>Academic feedback</h3>${comments(p.id)}</div></aside></div>`
          : empty(
              "Your internship journey starts with an offer",
              "Confirm one accepted offer to begin tracking your work and progress.",
            ),
        "Your work, your progress, and the feedback that moves you forward.",
      );
    }
  }
  function trainingRecord(p) {
    const student = U.db.users[p.studentId],
      group = U.db.groups[student.groupId],
      hours = U.approvedHours(p.id),
      tasks = U.all("tasks").filter((t) => t.placementId === p.id);
    return `<section class="studio-training-record"><div class="studio-training-company"><span class="studio-company-icon">${icon("building")}</span><div><h2>${E(U.db.opportunities[p.opportunityId]?.title)}</h2><p>${E(companyName(p.companyId))}</p><small>Academic supervisor · ${E(userName(group?.supervisorId))}</small></div></div><div class="studio-verified-hours"><div><strong>${hours}</strong><span>/ ${student.requiredHours} h</span><small>Academic-verified</small></div><div class="studio-hour-line"><span style="width:${Math.min(100, (hours / student.requiredHours) * 100)}%"></span></div><p>${tasks.filter((t) => U.taskState(t.id) === "Evaluated").length} of ${tasks.length} tasks evaluated</p></div></section>`;
  }
  function studentTaskCards(tasks) {
    return tasks.length
      ? `<section class="studio-task-journey" aria-label="Assigned tasks">${tasks.map((t, i) => `<button class="studio-task-stop" type="button" data-action="task" data-id="${E(t.id)}"><span class="studio-task-kind">${E(t.kind)} ${String(i + 1).padStart(2, "0")}</span><strong>${E(t.title)}</strong><span>${taskDeadline(t)}</span>${status(U.taskState(t.id))}</button>`).join("")}</section>`
      : empty(
          "Your tasks will appear here",
          "Your company supervisor creates tasks with deadlines and evaluation criteria.",
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
    if (!ops.length) {
      host.innerHTML = empty(
        "No matching opportunities",
        "New roles for your college and major will appear here.",
      );
      return;
    }
    const node = (tag, copy, cls) => {
      const n = document.createElement(tag);
      if (copy) n.textContent = copy;
      if (cls) n.className = cls;
      return n;
    };
    const append = (parent, ...children) => {
      parent.append(...children.filter(Boolean));
      return parent;
    };
    const makeButton = (label, handler, primary = false) => {
      const b = node(
        "button",
        label,
        "ui-button cycle-button" + (primary ? " primary" : ""),
      );
      b.type = "button";
      b.addEventListener("click", handler);
      return b;
    };
    const C = {
      E: node,
      A: append,
      B: makeButton,
      org: companyName,
      date,
      dialog: (title, panel) => {
        modal(title, "");
        document.getElementById("editor-content").append(panel);
        return document.getElementById("editor");
      },
    };
    const roleFit = () => {
      const panel = node("section", null, "gallery-academic-context");
      panel.append(
        node("p", "Your academic path", "muted"),
        node("h3", majorName(U.user.majorId)),
        node("p", "Opportunities are selected for your college and major."),
      );
      const a = node("a", "Manage CV & portfolio ↗");
      a.href = url("student", "profile");
      panel.append(a);
      return panel;
    };
    const applyAction = (l) => {
      const a = U.all("applications").find(
        (a) => a.studentId === U.userId && a.opportunityId === l.id,
      );
      if (a) {
        const b = makeButton("Application " + a.status.toLowerCase(), () => {});
        b.disabled = true;
        return b;
      }
      const link = node(
        "a",
        "Apply for this internship ↗",
        "ui-button primary",
      );
      link.href = url("student", "apply", "?opportunity=" + l.id);
      return link;
    };
    const deck = window.BridgewayStudentDeck(host, {
      C,
      roleFit,
      applyAction,
      placed: !!U.placement(U.userId),
    });
    deck.render(
      ops.map((o, i) => ({
        ...o,
        company: o.companyId,
        location: o.location,
        capacity: o.seats,
        skills: o.majorIds.map((v) => v.toUpperCase()).join(","),
        majorNames: o.majorIds.map(majorName).join(", "),
        category: o.majorIds.includes("cys") ? "cloud" : "software",
        categoryLabel: U.db.companies[o.companyId]?.industry || "Technology",
        accent: ["#2052c4", "#5442a6", "#086c72"][i % 3],
        prerequisites: [o.requirements],
      })),
    );
  }

  function completionBlock(p) {
    const c = U.db.completions[p.id];
    return c
      ? `<section class="completion">${icon("mortarboard")}<h2>Internship completed.</h2><p>${E(c.message)}</p><p>Approved on ${stamp(c.approvedAt)} · ${E(companyName(p.companyId))}</p><div class="actions">${button("View certificate", "certificate", p.id, true)}${button("Download PDF", "download-certificate", p.id)}</div></section>`
      : "";
  }
  function profileForm() {
    const u = U.user,
      group = U.db.groups[u.groupId];
    return `<div class="two-columns">${card(role === "student" ? "Academic information" : "Account information", `<dl class="detail-list"><div><dt>Role</dt><dd>${E(names[u.role])}</dd></div><div><dt>Email address</dt><dd>${E(u.email)}</dd></div>${role === "student" ? `<div><dt>University / college</dt><dd>Yarmouk University<br>${E(U.db.university.college)}</dd></div><div><dt>Student number / major</dt><dd>${E(u.studentNumber)} · ${E(majorName(u.majorId))}</dd></div><div><dt>Academic group / supervisor</dt><dd>${E(group?.name)} · ${E(userName(group?.supervisorId))}</dd></div><div><dt>Required training hours</dt><dd>${u.requiredHours} · ${E(u.term)} term</dd></div>` : role === "company" ? `<div><dt>Company</dt><dd>${E(companyName(u.companyId))}</dd></div>` : ""}<div><dt>Account status</dt><dd>${status(u.status)}</dd></div></dl>`, "person-badge")}${card("Personal information", form("profile", field("Full name", "name", u.name) + field("Phone number", "phone", u.phone, "tel", "", false) + (role === "student" ? field("CV link", "cvLink", u.cvLink, "url", "", false) + field("Portfolio link", "portfolioLink", u.portfolioLink, "url", "", false) + field("Portfolio file (up to 1 MB)", "portfolioFile", "", "file", 'accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.doc,.docx"', false) + attachment(u.portfolioFile) : role === "company" ? field("Job title", "jobTitle", u.jobTitle, "text", "", false) : ""), "Save information", "", "Changes and selected files are retained in this browser session. No server upload occurs."))}</div>`;
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
        tasks.length
          ? tasksTable(tasks)
          : empty(
              "Assign practical work",
              "Create tasks for confirmed trainees and specify their deadlines and criteria.",
            ),
        "Review submissions, evaluate work or request a revised submission.",
        ps.some((p) => p.status !== "Completed")
          ? button("Create task", "new-task", "", true)
          : "",
      );
    } else if (view === "evaluations") {
      const p = selection();
      shell(
        p
          ? placementPicker(ps) +
              `<div class="two-columns">${card("Required reports", tasksTable(tasks.filter((t) => t.placementId === p.id && t.kind !== "Task")))}${card("Final company evaluation", companyEvaluationView(p))}</div>`
          : empty(
              "No confirmed trainees",
              "Final evaluations become available after a student confirms an offer.",
            ),
        "Review required reports and send the company’s final evaluation to the assigned academic supervisor.",
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
        p
          ? placementPicker(ps) + placementDetail(p)
          : empty(
              "No active internships yet",
              "Your assigned students appear on the dashboard before they confirm an internship.",
            ),
        "Monitor work, feedback, deadlines and approved training hours.",
      );
    } else if (view === "evaluations") {
      shell(
        p
          ? placementPicker(ps) +
              `<div class="two-columns">${card("Company final evaluation", companyEvaluationView(p))}${card("Final academic evaluation", academicEvaluationView(p))}</div>`
          : empty(
              "No internships to evaluate",
              "Your assigned students must confirm an internship before final evaluation.",
            ),
        "Review the company evaluation, assess the academic components and send your evaluation to the coordinator.",
      );
    } else if (view === "account")
      shell(
        profileForm(),
        "View your account and update permitted personal information.",
      );
  }
  function companyEvaluationView(p) {
    const ev = U.db.companyEvaluations[p.id];
    if (ev)
      return `<p>${status("Sent")} ${stamp(ev.sentAt)}</p><dl class="detail-list section-space">${["Technical performance", "Professional conduct", "Communication & teamwork", "Attendance & commitment"].map((label, i) => `<div><dt>${label}</dt><dd>${ev.scores[i]} / 5</dd></div>`).join("")}<div><dt>Total company component</dt><dd>${ev.total} / 20</dd></div></dl><p class="pre-wrap section-space">${E(ev.comments)}</p>`;
    if (role !== "company")
      return '<p class="muted">The company supervisor has not sent the final evaluation yet.</p>';
    return form(
      "company-evaluation",
      `${["Technical performance", "Professional conduct", "Communication & teamwork", "Attendance & commitment"].map((label, i) => field(label + " (0–5)", "score" + i, "", "number", 'min="0" max="5" step="0.5"')).join("")}${textarea("Final company comments", "comments")}`,
      "Send to academic supervisor",
      p.id,
      "This evaluation is private. Students do not see this form or its final score.",
    );
  }
  function academicEvaluationView(p) {
    const ev = U.db.academicEvaluations[p.id];
    if (ev)
      return `<p>${status("Sent")} ${stamp(ev.sentAt)}</p><dl class="detail-list section-space"><div><dt>Academic supervision</dt><dd>${ev.academicScore} / 30</dd></div><div><dt>Final report</dt><dd>${ev.reportScore} / 25</dd></div><div><dt>Presentation</dt><dd>${ev.presentationScore} / 25</dd></div></dl><p class="pre-wrap section-space">${E(ev.comments)}</p>`;
    if (role !== "supervisor")
      return '<p class="muted">The academic supervisor has not sent the final academic evaluation yet.</p>';
    if (!U.db.companyEvaluations[p.id])
      return '<p class="muted">Wait for the company’s final evaluation before preparing your academic evaluation.</p>';
    return form(
      "academic-evaluation",
      field(
        "Academic supervision (0–30)",
        "academicScore",
        "",
        "number",
        'min="0" max="30" step="0.5"',
      ) +
        field(
          "Final report (0–25)",
          "reportScore",
          "",
          "number",
          'min="0" max="25" step="0.5"',
        ) +
        field(
          "Presentation (0–25)",
          "presentationScore",
          "",
          "number",
          'min="0" max="25" step="0.5"',
        ) +
        textarea("Final academic comments", "comments"),
      "Send to coordinator",
      p.id,
      "The 50% report and presentation component is split equally as a documented project assumption. Final evaluations and scores remain private to staff.",
    );
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
        tasksCompleted: "All assigned tasks evaluated",
        finalReport: "Final report submitted and reviewed",
        passingResult: "Calculated result meets the pass threshold",
        trainingPeriodEnded: "Training period has ended",
      };
      shell(
        p
          ? placementPicker(ps) +
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
                      )}</ul><p class="section-space">Calculated result: <strong class="score-total">${U.finalResult(p.id) ?? "—"} / 100</strong></p><p class="help-text">30 academic + 20 company + 25 report + 25 presentation. Pass threshold: 50.</p>${Object.values(checks).every(Boolean) ? `<div class="actions">${button("Review & approve completion", "approve-completion", p.id, true)}</div>` : '<p class="help-text">Approval becomes available once every requirement is met.</p>'}`,
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
      `<div class="meta"><span>${E(t.kind)}</span><span>Due ${date(t.deadline)}</span>${status(U.taskState(tid))}</div><p class="pre-wrap">${E(t.description)}</p><h3 class="section-space">Evaluation criteria</h3><ul class="activity-list">${t.criteria.map((c) => `<li>${E(c.label)} <strong>${c.maximum} points</strong></li>`).join("")}</ul>${role === "student" && p.status !== "Completed" && (!last || last.status === "Revision requested") ? `<div class="section-space">${form("submission", textarea("Describe your completed work", "description") + field("Work link", "link", "", "url", "", false) + field("Attach work (up to 1 MB)", "file", "", "file", 'accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.doc,.docx"', false), last ? "Resubmit work" : "Submit work", tid, "Your submission and selected file are retained in this browser session.")}</div>` : ""}<h3 class="section-space">Submission history</h3>${history.length ? history.map((s, i) => `<section class="review-block"><strong>Submission ${history.length - i} · ${stamp(s.createdAt)}</strong><p>${status(s.status)}</p><p>${E(s.description)}</p>${external(s.link, "Open submitted work")}${attachment(s.file)}${s.review ? `<p class="section-space"><strong>Company feedback</strong></p><p>${E(s.review.feedback)}</p>${s.status === "Evaluated" ? `<p>Grade: ${s.review.scores.reduce((n, v) => n + v, 0)} / ${t.criteria.reduce((n, c) => n + c.maximum, 0)}</p><ul>${t.criteria.map((c, k) => `<li>${E(c.label)}: ${s.review.scores[k]} / ${c.maximum}</li>`).join("")}</ul>` : ""}` : ""}${role === "company" && s.status === "Submitted" && p.status !== "Completed" ? `<div class="actions">${button("Evaluate / request revisions", "review-submission", s.id, true)}</div>` : ""}</section>`).join("") : '<p class="muted section-space">No submissions yet.</p>'}`,
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
  async function readFile(input) {
    const file = input?.files?.[0];
    if (!file) return null;
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
          const labels = f.getAll("criterionLabel"),
            maxima = f.getAll("criterionMaximum");
          U.createTask({
            placementId: get("placementId"),
            title: get("title"),
            description: get("description"),
            deadline: get("deadline"),
            kind: get("kind"),
            criteria: labels.map((label, i) => ({
              label,
              maximum: Number(maxima[i]),
            })),
          });
          break;
        }
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
          const scores = t.criteria.map((c, i) =>
            get("score" + i) === "" ? NaN : Number(get("score" + i)),
          );
          U.reviewSubmission(fid, scores, get("feedback"), revision);
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
          U.companyEvaluation(
            fid,
            [0, 1, 2, 3].map((i) =>
              get("score" + i) === "" ? NaN : Number(get("score" + i)),
            ),
            get("comments"),
          );
          break;
        case "academic-evaluation":
          U.academicEvaluation(
            fid,
            Number(get("academicScore")),
            Number(get("reportScore")),
            Number(get("presentationScore")),
            get("comments"),
          );
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
        case "logout":
          U.signOut();
          break;
        case "theme": {
          const next =
            document.documentElement.dataset.theme === "dark"
              ? "light"
              : "dark";
          document.documentElement.dataset.theme = next;
          localStorage.setItem("bridgeway:portal-theme", next);
          window.BridgewayChrome?.syncTheme();
          break;
        }
        case "menu": {
          window.BridgewayChrome?.toggleMobile();
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
        case "new-task": {
          U.require("company");
          const ps = visiblePlacements().filter(
            (p) => p.status !== "Completed",
          );
          modal(
            "Create task",
            form(
              "task",
              select(
                "Trainee",
                "placementId",
                ps.map((p) => [p.id, userName(p.studentId)]),
                "",
                "required",
              ) +
                select("Work type", "kind", [
                  ["Task", "Task"],
                  ["Final report", "Final internship report"],
                ]) +
                field("Task title", "title") +
                field("Deadline", "deadline", "", "date") +
                textarea("Requirements & description", "description") +
                `<fieldset class="full"><legend class="muted">Evaluation criteria and maximum points</legend><div id="criteria"><div class="criterion-row"><input class="ui-input" aria-label="Criterion name" name="criterionLabel" placeholder="Criterion name" required><input class="ui-input" aria-label="Maximum points" name="criterionMaximum" type="number" min="0.5" step="0.5" value="10" required></div></div>${button("Add criterion", "add-criterion")}</fieldset>`,
              "Create task",
              "",
              "Tasks use their own criterion maximums. Final report criteria must total 25 points.",
            ),
          );
          break;
        }
        case "add-criterion":
          document
            .getElementById("criteria")
            .insertAdjacentHTML(
              "beforeend",
              '<div class="criterion-row"><input class="ui-input" aria-label="Criterion name" name="criterionLabel" required><input class="ui-input" aria-label="Maximum points" name="criterionMaximum" type="number" min="0.5" step="0.5" value="5" required></div>',
            );
          break;
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
                ["evaluate", "Evaluate completed work"],
                ["revision", "Request modifications / resubmission"],
              ]) +
                t.criteria
                  .map((c, i) =>
                    field(
                      `${c.label} (0–${c.maximum})`,
                      "score" + i,
                      "",
                      "number",
                      `min="0" max="${c.maximum}" step="0.5"`,
                      false,
                    ),
                  )
                  .join("") +
                textarea("Feedback / requested modifications", "feedback"),
              "Save review",
              id,
              "Scores are required for evaluation. A revision request requires feedback and leaves the submission ungraded.",
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
      `<div class="certificate-sheet"><div class="certificate-brand-row"><img src="../../assets/bridgeway-logo.svg" alt="Bridgeway">${collegeMark()}</div><p>In collaboration with Yarmouk University</p><h1>Internship Completion Certificate</h1><p>This certifies that</p><h2>${E(s.name)}</h2><p>${E(majorName(s.majorId))}<br>${E(U.db.university.college)}</p><p>has successfully completed the internship at<br><strong>${E(companyName(p.companyId))}</strong></p><p>${date(p.startDate)} – ${date(p.endDate)}<br>${U.approvedHours(pid)} approved training hours</p><p>Approved by the University Internship Coordinator<br>${E(userName(c.approvedBy))}</p><p class="serial">${E(c.certificateNumber)} · ${stamp(c.approvedAt)}</p></div><div class="actions section-space">${button("Download PDF", "download-certificate", pid, true)}${button("Print certificate", "print-certificate", pid)}</div>`,
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
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 5;
    ctx.strokeRect(55, 55, 1990, 1375);
    ctx.lineWidth = 1;
    ctx.strokeRect(72, 72, 1956, 1341);
    ctx.fillStyle = "#12396c";
    ctx.textAlign = "center";
    const logo = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = "../../assets/bridgeway-logo.svg";
    });
    ctx.drawImage(logo, 730, 115, 300, 174);
    const partnerLogo = await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = "../../assets/yarmouk-college-logo.png";
    });
    ctx.fillStyle = "#12396c";
    ctx.fillRect(1090, 150, 320, 100);
    ctx.drawImage(partnerLogo, 1116, 163, 268, 73);
    ctx.fillStyle = "#12396c";
    const line = (text, y, size = 30, bold = false) => {
      ctx.font = `${bold ? "600" : "400"} ${size}px Inter,Arial`;
      while (ctx.measureText(text).width > 1830 && size > 16) {
        size--;
        ctx.font = `${bold ? "600" : "400"} ${size}px Inter,Arial`;
      }
      ctx.fillText(text, 1050, y);
    };
    line("In collaboration with Yarmouk University", 345, 30);
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
    pdf.setAuthor("Bridgeway");
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
