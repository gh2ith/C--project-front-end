/* Local frontend domain model. No passwords or Firebase credentials are stored. */
(() => {
  "use strict";
  const KEY = "yarmouk:uims:v1";
  for (const suffix of ["uims:v1", "uims:viewer", "sidebar:pinned"]) {
    if (sessionStorage.getItem("yarmouk:" + suffix)) continue;
    for (const prefix of ["riwaq:", "bridgeway:"]) {
      const previous = sessionStorage.getItem(prefix + suffix);
      if (previous) { sessionStorage.setItem("yarmouk:" + suffix, previous); break; }
    }
  }

  const collections = [
    "users",
    "companies",
    "groups",
    "opportunities",
    "applications",
    "placements",
    "tasks",
    "taskAttachments",
    "submissions",
    "hourEntries",
    "academicComments",
    "companyEvaluations",
    "academicEvaluations",
    "completions",
    "contactMessages",
  ];
  const now = () => new Date().toISOString();
  const id = (prefix) => prefix + "-" + crypto.randomUUID();
  const U = (window.UIMS = {
    db: null,
    route: (role, view) => {
      const destination =
        role === "student" && view === "dashboard" ? "opportunities" : view;
      return `../${role}-${destination}/${role}-${destination}.html`;
    },
    all(name) {
      return Object.entries(this.db[name] || {}).map(([id, value]) => ({
        id,
        ...value,
      }));
    },
    get userId() {
      return sessionStorage.getItem("yarmouk:uims:viewer");
    },
    get user() {
      return this.db?.users[this.userId];
    },
    save() {
      sessionStorage.setItem(KEY, JSON.stringify(this.db));
    },
    signIn(uid) {
      if (!this.db.users[uid] || this.db.users[uid].status !== "Active")
        throw Error("Account is inactive.");
      sessionStorage.setItem("yarmouk:uims:viewer", uid);
    },
    signOut() {
      sessionStorage.removeItem("yarmouk:uims:viewer");
      location.href = "../login/login.html";
    },
    require(role) {
      if (
        !this.user ||
        this.user.status !== "Active" ||
        (role && this.user.role !== role)
      )
        throw Error("This account cannot access that page.");
    },
    placement(studentId) {
      return this.all("placements").find((p) => p.studentId === studentId);
    },
    assigned(studentId) {
      const student = this.db.users[studentId];
      return this.db.groups[student?.groupId]?.supervisorId === this.userId;
    },
    ownsPlacement(pid) {
      return this.db.placements[pid]?.companySupervisorId === this.userId;
    },
    canSeePlacement(p) {
      return (
        this.user &&
        (this.user.role === "coordinator" ||
          p.studentId === this.userId ||
          p.companySupervisorId === this.userId ||
          (this.user.role === "supervisor" && this.assigned(p.studentId)))
      );
    },
    assertPlacement(pid, role) {
      this.require(role);
      const p = this.db.placements[pid];
      if (!p || !this.canSeePlacement(p))
        throw Error("This internship is not assigned to you.");
      if (p.status === "Completed")
        throw Error("This internship is complete and read-only.");
      return p;
    },
    latestSubmission(taskId) {
      return this.all("submissions")
        .filter((s) => s.taskId === taskId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
    },
    approvedHours(pid) {
      return this.all("hourEntries")
        .filter((h) => h.placementId === pid && h.status === "Approved")
        .reduce((n, h) => n + Number(h.hours), 0);
    },
    taskState(taskId) {
      return this.latestSubmission(taskId)?.status || "Assigned";
    },
    createApplication(opportunityId, statement) {
      this.require("student");
      const op = this.db.opportunities[opportunityId];
      if (
        !op ||
        op.status !== "Open" ||
        op.deadline < new Date().toISOString().slice(0, 10) ||
        !op.majorIds.includes(this.user.majorId) ||
        this.user.completedCredits < this.db.policy.minimumCredits
      )
        throw Error(
          "This opportunity is not available for your academic record.",
        );
      if (this.placement(this.userId))
        throw Error("You have already confirmed an internship.");
      if (
        this.all("applications").some(
          (a) =>
            a.studentId === this.userId && a.opportunityId === opportunityId,
        )
      )
        throw Error("You have already applied for this opportunity.");
      if (!statement.trim())
        throw Error("Please describe your interest in this opportunity.");
      this.db.applications[id("application")] = {
        studentId: this.userId,
        opportunityId,
        statement: statement.trim(),
        status: "Pending",
        reason: "",
        createdAt: now(),
      };
      this.save();
    },
    decideApplication(aid, decision, reason = "") {
      this.require("company");
      const a = this.db.applications[aid],
        op = this.db.opportunities[a?.opportunityId];
      if (
        !a ||
        op?.supervisorId !== this.userId ||
        a.status !== "Pending" ||
        !["Accepted", "Rejected"].includes(decision)
      )
        throw Error("This application cannot be changed.");
      if (decision === "Rejected" && !reason.trim())
        throw Error("A rejection reason is required.");
      if (this.placement(a.studentId))
        throw Error("The student has already confirmed another internship.");
      if (
        decision === "Accepted" &&
        this.all("applications").filter(
          (x) =>
            x.opportunityId === a.opportunityId &&
            ["Accepted", "Confirmed"].includes(x.status),
        ).length >= op.seats
      )
        throw Error("All available seats have been offered.");
      a.status = decision;
      a.reason = reason.trim();
      a.decidedAt = now();
      this.save();
    },
    confirmOffer(aid) {
      this.require("student");
      const a = this.db.applications[aid],
        op = this.db.opportunities[a?.opportunityId];
      if (
        !a ||
        a.studentId !== this.userId ||
        a.status !== "Accepted" ||
        this.placement(this.userId)
      )
        throw Error("Only one accepted offer can be confirmed.");
      if (this.db.users[op.supervisorId]?.status !== "Active")
        throw Error("The company supervisor account is inactive.");
      const start = new Date(),
        end = new Date(start);
      end.setDate(end.getDate() + (this.user.term === "Summer" ? 56 : 98) - 1);
      a.status = "Confirmed";
      a.confirmedAt = now();
      for (const other of this.all("applications").filter(
        (x) =>
          x.studentId === this.userId &&
          x.id !== aid &&
          ["Pending", "Accepted"].includes(x.status),
      )) {
        this.db.applications[other.id].status = "Not selected";
      }
      this.db.placements[id("placement")] = {
        studentId: this.userId,
        opportunityId: a.opportunityId,
        companyId: op.companyId,
        companySupervisorId: op.supervisorId,
        startDate: start.toISOString().slice(0, 10),
        endDate: end.toISOString().slice(0, 10),
        status: "Active",
      };
      this.save();
    },
    saveOpportunity(data, oid) {
      this.require("company");
      if (oid && this.db.opportunities[oid]?.supervisorId !== this.userId)
        throw Error("You can manage only your own opportunities.");
      if (
        !data.title.trim() ||
        !data.description.trim() ||
        !data.requirements.trim() ||
        !data.majorIds.length ||
        !Number.isInteger(data.seats) ||
        data.seats < 1 ||
        !data.deadline
      )
        throw Error("Complete all opportunity fields.");
      const reserved = this.all("applications").filter(
        (a) =>
          a.opportunityId === oid &&
          ["Accepted", "Confirmed"].includes(a.status),
      ).length;
      if (data.seats < reserved)
        throw Error(
          "Seats cannot be fewer than existing offers and confirmed places.",
        );
      this.db.opportunities[oid || id("opportunity")] = {
        ...data,
        companyId: this.user.companyId,
        supervisorId: this.userId,
      };
      this.save();
    },
    closeOpportunity(oid) {
      this.require("company");
      const op = this.db.opportunities[oid];
      if (op?.supervisorId !== this.userId)
        throw Error("This opportunity does not belong to you.");
      op.status = "Closed";
      this.save();
    },
    createTask(data) {
      return this.createTasks(data, [data.placementId])[0];
    },
    createTasks(data, placementIds) {
      this.require("company");
      const recipients = [...new Set(placementIds)];
      if (!recipients.length) throw Error("Choose at least one active trainee.");
      recipients.forEach((pid) => this.assertPlacement(pid, "company"));
      if (
        !data.title.trim() ||
        !data.description.trim() ||
        !data.deadline
      )
        throw Error(
          "Enter a title, requirements and deadline.",
        );
      if (
        data.kind === "Final report" &&
        this.all("tasks").some(
          (t) =>
            recipients.includes(t.placementId) && t.kind === "Final report",
        )
      )
        throw Error("A selected internship already has a final report task. Assign reports individually where needed.");
      const { file, placementId, criteria, ...details } = data;
      const attachmentId = file ? id("task-file") : null;
      this.db.taskAttachments ||= {};
      if (file) this.db.taskAttachments[attachmentId] = file;
      const created = recipients.map((pid) => {
        const taskId = id("task");
        this.db.tasks[taskId] = { ...structuredClone(details), placementId: pid, ...(attachmentId ? { attachmentId } : {}), createdBy: this.userId };
        return taskId;
      });
      try { this.save(); }
      catch (error) {
        created.forEach((taskId) => delete this.db.tasks[taskId]);
        if (attachmentId) delete this.db.taskAttachments[attachmentId];
        throw Error("The task could not be saved in this browser session. Try a smaller attachment.");
      }
      return created;
    },
    saveWeeklyReport(pid, week, data) {
      const p = this.assertPlacement(pid, "company");
      const count = Math.max(1, Math.ceil((Date.parse(p.endDate) - Date.parse(p.startDate) + 86400000) / (7 * 86400000)));
      if (!Number.isInteger(week) || week < 1 || week > count || !data.title.trim() || !data.targets.length || data.targets.some((target) => !target.trim()))
        throw Error("Select a training week and enter a title and at least one weekly target.");
      const previousPlan = structuredClone(p.weeklyPlan || []), previousReports = structuredClone(p.weeklyReports || {});
      p.weeklyPlan ||= [];
      p.weeklyPlan[week - 1] = { title: data.title, targets: data.targets, plannedHours: Number(this.db.users[p.studentId].requiredHours) / count };
      p.weeklyReports ||= {};
      p.weeklyReports[week] ||= [];
      p.weeklyReports[week].push({ text: data.text, plan: structuredClone(p.weeklyPlan[week - 1]), authorId: this.userId, createdAt: now() });
      try { this.save(); }
      catch (error) { p.weeklyPlan = previousPlan; p.weeklyReports = previousReports; throw error; }
    },
    submitTask(taskId, data) {
      this.require("student");
      const task = this.db.tasks[taskId];
      if (!task) throw Error("Task not found.");
      const p = this.assertPlacement(task.placementId, "student");
      if (p.studentId !== this.userId)
        throw Error("This task is not assigned to you.");
      const last = this.latestSubmission(taskId);
      if (last && last.status !== "Revision requested")
        throw Error("Resubmission is available only after a revision request.");
      if (!data.description.trim())
        throw Error("Describe your completed work.");
      const submissionId = id("submission");
      this.db.submissions[submissionId] = {
        taskId,
        studentId: this.userId,
        ...data,
        status: "Submitted",
        createdAt: now(),
        review: null,
      };
      try { this.save(); }
      catch (error) { delete this.db.submissions[submissionId]; throw Error("The submission could not be saved in this browser session. Try a smaller attachment."); }
    },
    reviewSubmission(sid, feedback, revisions) {
      this.require("company");
      const s = this.db.submissions[sid],
        t = this.db.tasks[s?.taskId];
      if (!s || !t) throw Error("Submission not found.");
      this.assertPlacement(t.placementId, "company");
      if (
        s.status !== "Submitted" ||
        this.latestSubmission(t.id || s.taskId)?.id !== sid
      )
        throw Error("This submission has already been reviewed.");
      if (!feedback.trim()) throw Error("Provide feedback for the student.");
      s.status = revisions ? "Revision requested" : "Evaluated";
      s.review = {
        feedback,
        reviewedBy: this.userId,
        reviewedAt: now(),
      };
      this.save();
    },
    recordHours(data) {
      const p = this.assertPlacement(data.placementId, "company");
      if (data.replacesId) {
        const previous = this.db.hourEntries[data.replacesId];
        if (
          !previous ||
          previous.placementId !== data.placementId ||
          previous.status !== "Returned"
        )
          throw Error("Only returned hours can be corrected.");
        if (
          this.all("hourEntries").some((h) => h.replacesId === data.replacesId)
        )
          throw Error(
            "A correction for these hours has already been recorded.",
          );
      }
      if (
        !data.date ||
        data.date < p.startDate ||
        data.date > p.endDate ||
        data.date > new Date().toISOString().slice(0, 10) ||
        !Number.isFinite(data.hours) ||
        data.hours <= 0 ||
        data.hours > 12 ||
        !data.description.trim()
      )
        throw Error(
          "Record 0–12 hours on a completed training date inside the internship period, with a description.",
        );
      const day = this.all("hourEntries")
        .filter(
          (h) =>
            h.placementId === data.placementId &&
            h.date === data.date &&
            h.status !== "Returned",
        )
        .reduce((n, h) => n + h.hours, 0);
      if (day + data.hours > 12)
        throw Error("Total hours cannot exceed 12 on one day.");
      this.db.hourEntries[id("hours")] = {
        ...data,
        status: "Pending",
        recordedBy: this.userId,
        reviewNote: "",
      };
      this.save();
    },
    reviewHours(hid, approved, note) {
      this.require("supervisor");
      const h = this.db.hourEntries[hid];
      if (!h) throw Error("Hours not found.");
      this.assertPlacement(h.placementId, "supervisor");
      if (h.status !== "Pending")
        throw Error("This hours entry has already been reviewed.");
      if (!approved && !note.trim())
        throw Error("Explain why these hours need correction.");
      h.status = approved ? "Approved" : "Returned";
      h.reviewNote = note;
      h.reviewedBy = this.userId;
      h.reviewedAt = now();
      this.save();
    },
    academicComment(pid, text) {
      this.assertPlacement(pid, "supervisor");
      if (!text.trim()) throw Error("Enter an academic comment.");
      this.db.academicComments[id("comment")] = {
        placementId: pid,
        text,
        authorId: this.userId,
        createdAt: now(),
      };
      this.save();
    },
    companyEvaluation(pid, score, comments) {
      this.assertPlacement(pid, "company");
      if (this.db.companyEvaluations[pid]) throw Error("The company evaluation has already been submitted.");
      if (!Number.isFinite(score) || score < 0 || score > 50 || !comments.trim()) throw Error("Enter a company grade from 0 to 50 and evaluation comments.");
      this.db.companyEvaluations[pid] = { placementId: pid, score, total: score, maximum: 50, model: "company-academic-50-v1", comments, authorId: this.userId, sentAt: now() };
      try { this.save(); }
      catch (error) { delete this.db.companyEvaluations[pid]; throw error; }
    },
    academicEvaluation(pid, score, comments) {
      this.assertPlacement(pid, "supervisor");
      if (this.db.companyEvaluations[pid]?.model !== "company-academic-50-v1") throw Error("Review the submitted company evaluation first.");
      if (this.db.academicEvaluations[pid]) throw Error("The academic evaluation has already been submitted.");
      if (!Number.isFinite(score) || score < 0 || score > 50 || !comments.trim()) throw Error("Enter an academic grade from 0 to 50 and evaluation comments.");
      this.db.academicEvaluations[pid] = { placementId: pid, score, total: score, maximum: 50, model: "company-academic-50-v1", reviewedCompanySentAt: this.db.companyEvaluations[pid].sentAt, comments, authorId: this.userId, sentAt: now() };
      try { this.save(); }
      catch (error) { delete this.db.academicEvaluations[pid]; throw error; }
    },
    finalResult(pid) {
      const c = this.db.companyEvaluations[pid], a = this.db.academicEvaluations[pid];
      return c?.model === "company-academic-50-v1" && a?.model === "company-academic-50-v1" ? c.score + a.score : null;
    },
    completionChecks(pid) {
      const p = this.db.placements[pid],
        student = this.db.users[p?.studentId],
        tasks = this.all("tasks").filter((t) => t.placementId === pid),
        result = this.finalResult(pid);
      return {
        companyEvaluation: this.db.companyEvaluations[pid]?.model === "company-academic-50-v1",
        academicEvaluation: this.db.academicEvaluations[pid]?.model === "company-academic-50-v1",
        requiredHours:
          !!student && this.approvedHours(pid) >= student.requiredHours,
        tasksCompleted:
          tasks.length > 0 &&
          tasks.every((t) => this.taskState(t.id) === "Evaluated"),
        finalReport: tasks.some(
          (t) =>
            t.kind === "Final report" && this.taskState(t.id) === "Evaluated",
        ),
        passingResult: result !== null && result >= this.db.policy.passMark,
        trainingPeriodEnded:
          !!p && p.endDate <= new Date().toISOString().slice(0, 10),
      };
    },
    approveCompletion(pid) {
      this.assertPlacement(pid, "coordinator");
      if (!Object.values(this.completionChecks(pid)).every(Boolean))
        throw Error("All completion requirements must be met before approval.");
      const p = this.db.placements[pid];
      const previousStatus = p.status;
      p.status = "Completed";
      this.db.completions[pid] = {
        placementId: pid,
        studentId: p.studentId,
        certificateNumber:
          "YU-TRAIN-" +
          new Date().getFullYear() +
          "-" +
          crypto.randomUUID().slice(0, 8).toUpperCase(),
        result: this.finalResult(pid),
        evaluationModel: "company-academic-50-v1",
        approvedBy: this.userId,
        approvedAt: now(),
        message:
          "Congratulations! You have successfully completed your internship.",
      };
      try { this.save(); }
      catch (error) { p.status = previousStatus; delete this.db.completions[pid]; throw error; }
    },
    saveAccount(data, uid) {
      this.require("coordinator");
      const existing = uid ? this.db.users[uid] : null;
      if (
        existing?.role === "coordinator" ||
        !["student", "company", "supervisor"].includes(data.role)
      )
        throw Error("Use your account page to edit the coordinator account.");
      if (existing && existing.role !== data.role)
        throw Error("Account roles cannot be changed.");
      if (!data.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
        throw Error("Enter a name and a valid email address.");
      if (
        this.all("users").some(
          (u) =>
            u.id !== uid && u.email.toLowerCase() === data.email.toLowerCase(),
        )
      )
        throw Error("This email address is already assigned.");
      if (
        data.role === "student" &&
        (!this.db.university.majors[data.majorId] ||
          !this.db.groups[data.groupId] ||
          this.db.users[this.db.groups[data.groupId].supervisorId]?.status !==
            "Active" ||
          !data.studentNumber ||
          !Number.isFinite(data.requiredHours) ||
          data.requiredHours <= 0 ||
          !Number.isFinite(data.completedCredits) ||
          data.completedCredits < 0)
      )
        throw Error(
          "Complete the academic information and select a group with an active academic supervisor.",
        );
      if (
        data.role === "student" &&
        this.all("users").some(
          (u) =>
            u.id !== uid &&
            u.role === "student" &&
            u.studentNumber === data.studentNumber,
        )
      )
        throw Error("This student number is already assigned.");
      if (
        data.role === "student" &&
        this.all("users").filter(
          (u) =>
            u.id !== uid && u.role === "student" && u.groupId === data.groupId,
        ).length >= 9
      )
        throw Error(
          "This academic group already has nine students. Select another group.",
        );
      let companyId = existing?.companyId;
      if (data.role === "company") {
        if (!data.companyName?.trim()) throw Error("Enter the company name.");
        companyId = companyId || id("company");
        this.db.companies[companyId] = {
          ...this.db.companies[companyId],
          name: data.companyName,
          city: data.city || "",
          industry: data.industry || "",
          website: data.website || "",
        };
      }
      const next = {
        ...existing,
        ...data,
        status: existing ? data.status || existing.status : "Active",
        firstLogin: existing ? existing.firstLogin : true,
      };
      if (companyId) next.companyId = companyId;
      delete next.companyName;
      delete next.city;
      delete next.industry;
      delete next.website;
      this.db.users[uid || id(data.role)] = next;
      this.save();
    },
    saveGroup(name, supervisorId, gid) {
      this.require("coordinator");
      if (
        !name.trim() ||
        this.db.users[supervisorId]?.role !== "supervisor" ||
        this.db.users[supervisorId].status !== "Active"
      )
        throw Error(
          "Enter a group name and choose an active academic supervisor.",
        );
      this.db.groups[gid || id("group")] = { name, supervisorId };
      this.save();
    },
    updateProfile(data) {
      this.require();
      for (const key of [
        "name",
        "phone",
        "cvLink",
        "portfolioLink",
        "portfolioFile",
        "jobTitle",
      ])
        if (key in data) this.user[key] = data[key];
      this.save();
    },
    contact(data) {
      if (
        !data.name.trim() ||
        !data.subject.trim() ||
        !data.message.trim() ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)
      )
        throw Error("Complete all contact fields with a valid email address.");
      this.db.contactMessages[id("message")] = {
        ...data,
        status: "New",
        createdAt: now(),
      };
      this.save();
    },
    manageMessage(mid, status) {
      this.require("coordinator");
      if (
        !this.db.contactMessages[mid] ||
        !["Read", "Archived"].includes(status)
      )
        throw Error("Message not found.");
      this.db.contactMessages[mid].status = status;
      this.save();
    },
  });
  U.ready = (async () => {
    let cached;
    try {
      cached = JSON.parse(sessionStorage.getItem(KEY));
    } catch {}
    let seed;
    try {
      const response = await fetch("../../shared/data/firebase-seed.json", { cache: "no-cache" });
      if (!response.ok) throw Error("Workspace data unavailable.");
      seed = await response.json();
    } catch (error) {
      if (cached?.schemaVersion !== 1) throw error;
    }
    if (cached?.schemaVersion !== 1) U.db = seed;
    else {
      U.db = cached;
      if (seed?.seedRevision && cached.seedRevision !== seed.seedRevision) {
        // Replace untouched starter records; retain the user's edits and connected workflow history.
        const baselineResponse = await fetch("../../shared/data/starter-seed-v1.json", { cache: "no-cache" }).catch(() => null);
        const baseline = baselineResponse?.ok ? await baselineResponse.json() : {};
        const stable = (value) => JSON.stringify(value, (_, entry) => entry && typeof entry === "object" && !Array.isArray(entry) ? Object.fromEntries(Object.entries(entry).sort(([a], [b]) => a.localeCompare(b))) : entry);
        const changed = (collection, key, record) => !baseline[collection]?.[key] || stable(record) !== stable(baseline[collection][key]);
        const protectedStudents = new Set(), protectedPlacements = new Set();
        for (const [key, record] of Object.entries(cached.placements || {})) {
          if (changed("placements", key, record)) { protectedStudents.add(record.studentId); protectedPlacements.add(key); }
        }
        for (const [key, record] of Object.entries(cached.applications || {})) {
          if (changed("applications", key, record)) protectedStudents.add(record.studentId);
        }
        for (const collection of ["tasks", "submissions", "hourEntries", "academicComments", "companyEvaluations", "academicEvaluations", "completions"]) {
          for (const [key, record] of Object.entries(cached[collection] || {})) {
            if (!changed(collection, key, record)) continue;
            const pid = record.placementId || cached.tasks?.[record.taskId]?.placementId;
            if (pid) { protectedPlacements.add(pid); const student = cached.placements?.[pid]?.studentId; if (student) protectedStudents.add(student); }
          }
        }
        const dependentPlacement = (collection, record, key) => collection === "placements" ? key : record.placementId || seed.tasks?.[record.taskId]?.placementId;
        for (const collection of collections) {
          cached[collection] ||= {};
          for (const [key, record] of Object.entries(cached[collection])) {
            if (seed[collection]?.[key] || changed(collection, key, record)) continue;
            const pid = dependentPlacement(collection, record, key);
            const student = record.studentId || seed.placements?.[pid]?.studentId;
            if (protectedStudents.has(student) || protectedPlacements.has(pid)) continue;
            delete cached[collection][key];
          }
          for (const [key, record] of Object.entries(seed[collection] || {})) {
            const student = record.studentId || (collection === "placements" ? record.studentId : null);
            const pid = dependentPlacement(collection, record, key);
            const placementStudent = seed.placements?.[pid]?.studentId;
            if ((["applications", "placements"].includes(collection) && protectedStudents.has(student)) || (pid && (protectedPlacements.has(pid) || protectedStudents.has(placementStudent)))) continue;
            const existing = cached[collection][key];
            if (!existing || !changed(collection, key, existing)) cached[collection][key] = record;
            else if (existing.name && existing.name === baseline[collection]?.[key]?.name && record.name) existing.name = record.name;
          }
        }
        for (const [key, placement] of Object.entries(seed.placements || {})) {
          const existing = cached.placements?.[key];
          if (existing && !existing.weeklyPlan && existing.studentId === placement.studentId && existing.startDate === placement.startDate && existing.endDate === placement.endDate && placement.weeklyPlan) {
            existing.weeklyPlan = placement.weeklyPlan;
          }
          if (existing && !existing.weeklyReports && existing.studentId === placement.studentId && existing.startDate === placement.startDate && existing.endDate === placement.endDate && placement.weeklyReports) {
            existing.weeklyReports = placement.weeklyReports;
          }
        }
        if (cached.users?.["student-1"]?.name === "غيث العموري") {
          cached.users["student-1"].name = seed.users["student-1"].name;
        }
        cached.seedRevision = seed.seedRevision;
      }
    }
    for (const name of collections) U.db[name] ||= {};
    U.db.policy.companyMaximum = 50;
    U.db.policy.academicMaximum = 50;
    delete U.db.policy.reportMaximum;
    delete U.db.policy.presentationMaximum;
    U.db.policy.interpretation = "Owner-defined project workflow: company 50 + academic supervisor 50; coordinator approval releases successful completion after all requirements are met.";
    U.db.evaluationModel = "company-academic-50-v1";
    for (const task of Object.values(U.db.tasks)) delete task.criteria;
    for (const submission of Object.values(U.db.submissions)) if (submission.review) delete submission.review.scores;
    for (const collection of ["companyEvaluations", "academicEvaluations"]) {
      for (const [pid, evaluation] of Object.entries(U.db[collection])) {
        if (evaluation.model === "company-academic-50-v1") continue;
        U.db.legacyEvaluations ||= {};
        U.db.legacyEvaluations[pid] ||= {};
        U.db.legacyEvaluations[pid][collection] = evaluation;
        delete U.db[collection][pid];
      }
    }

    U.save();
    return U;
  })();
})();
