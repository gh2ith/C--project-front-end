# Yarmouk University Internship Management System

## The new project idea

The project is a university internship management system for Yarmouk University's Faculty of Information Technology and Computer Science in Irbid. It brings students, company supervisors, academic supervisors and the university internship coordinator into one connected workflow, from discovering an opportunity to approving successful completion.

The new concept replaces Bridgeway's broader platform identity with a focused university training experience. Its purpose is to make each participant's responsibilities clear, keep training records together and let students understand what they need to do next.

## The problem it addresses

An internship involves several separate decisions: a company chooses a trainee, a student confirms an offer, the company supervises daily work, an academic supervisor verifies training progress, and the coordinator approves completion. Without a shared workflow, applications, task feedback, hours and final assessments can become disconnected.

This project connects those steps while preserving who is responsible for each decision. Company supervisors make hiring decisions. Academic supervisors oversee academic progress. The coordinator manages assignments and completion.

## The Golden Thread identity

The visual idea is **The Golden Thread**: a constructed golden wheat sculpture represents the connected stages of the internship journey. Deep green, paper tones and gold give the project a consistent university identity. The wheat is original project artwork, not a claim about the university's official symbol.

The homepage is one continuous full-screen 3D scene. As visitors scroll, the wheat rotates, its individual shells open, its parts separate, and the structure reassembles. The same scene introduces five chapters:

- **Discover:** find suitable training opportunities.
- **Apply:** submit an application and confirm an accepted offer.
- **Train:** complete tasks, respond to feedback and track approved hours.
- **Complete:** meet the requirements for coordinator approval and a certificate.
- **Collaboration:** introduce Yarmouk University and the faculty's six undergraduate majors.

Visitors can navigate directly between chapters, inspect and drag the model, and pause motion. Reduced-motion and static fallbacks keep the experience accessible. The supplied university logo appears as a collaboration mark, with a dark backing for its white calligraphy.

## Who uses the system

There are exactly four roles:

| Role | Main responsibilities |
| --- | --- |
| Student | Explore opportunities, apply, confirm one offer, submit assigned work and a final report, review task feedback, and track training progress. |
| Company supervisor | Manage opportunities, accept or reject applications, supervise trainees, assign and evaluate tasks, record training hours, and submit a final company evaluation. |
| Academic supervisor | Monitor assigned students, approve or return company-recorded hours, review the company evaluation, and prepare a separate final academic evaluation for the coordinator. |
| University internship coordinator | Create the other three account types, manage academic groups and assignments, monitor placements, review completion requirements, approve completion, and manage Contact Us messages. |

There is no public registration. Each student must belong to an academic group with an active supervisor when the account is created. The coordinator can later reassign the group. New accounts default to Active, staff IDs are generated, and this frontend does not collect or persist account passwords during account creation.

## The internship journey

### 1. Account and academic assignment

The coordinator creates the required supervisor accounts, academic groups and student accounts. Students begin with an assigned academic supervisor so academic oversight exists before training starts.

### 2. Opportunity discovery and applications

Public visitors can read opportunity summaries. Full details and applications require the login interface.

Students land on **Explore**, which contains one searchable horizontal opportunity showcase with swipe or drag browsing, previous/next controls and direct role selection. The student workspace keeps its horizontal pill navigation, open application rows and training-record styling. There is no separate student Dashboard; its old address redirects to Explore.

Submitting an application creates a **Pending** record. The owning company supervisor accepts it or rejects it with a reason. Acceptance is an offer; the placement begins when the student confirms one accepted offer. Other outstanding applications and offers become **Not selected**. Academic staff do not make hiring decisions.

### 3. Tasks, submissions and feedback

The company supervisor assigns tasks with deadlines and a maximum score appropriate to each task. A task does not have to be worth 100 points.

Students submit work, and the company supervisor reviews it, gives feedback, grades it or requests a revision. Submission and review history remain available so the training record shows how work developed.

### 4. Training hours

The company supervisor records dated training hours. The academic supervisor independently approves or returns those entries. Task evaluation and hours approval are separate processes; completing a task does not automatically produce approved hours.

This digital hours-approval sequence is a project assumption, rather than a verified university procedure.

### 5. Final evaluations and completion

The company supervisor submits the final company evaluation to the academic supervisor. The academic supervisor prepares a separate final academic evaluation for the coordinator.

Completion requires all of the following:

- Both final evaluations are submitted.
- The required training hours are approved.
- All assigned tasks are evaluated.
- The final report is submitted.
- The calculated final result is passing.
- The training period has ended.

The coordinator then approves completion. Students receive a successful-completion message and a downloadable or printable certificate. Completed internships become read-only.

Students can see task-level grades, feedback, revision requests, hours and progress. Company and academic final evaluation forms, final component grades and the calculated final result remain private from students.

## Academic coverage and policy assumptions

The system supports the faculty's six undergraduate majors: Computer Science, Computer Information Systems, Business Information Technology, Cybersecurity, Data Science and Artificial Intelligence, and Digital Reality and Game Development.

The project's documented policy research uses the university's CIS498 practical training rules: 98 completed credits, regular training of 14 weeks at 18 hours per week, summer training of eight weeks at 36 hours per week, and assessment weights of 30% academic supervision, 20% company evaluation and 50% report/presentation, with a passing threshold of 50%.

These verified rules are CIS-specific. Applying them to the other five majors is a proposed baseline pending department confirmation. Splitting the report/presentation component into 25% report and 25% presentation is also a proposed assumption. See [Requirements and university research](REQUIREMENTS.md) for the documented source and policy details.

## Supporting pages and interface

Public pages include Home, About Us, Contact Us and Login. Contact Us records a name, email, subject and message for coordinator management; it does not provide an email service or threaded support.

Staff portals retain the established white sidebar, with narrow and expanded states, hover/focus expansion, a collapse button and a **Keep sidebar open** preference. Sidebar totals and notification indicators are excluded.

The scope excludes public registration, additional administrator roles, notifications, support tickets, partnerships, interviews or meetings, AI matching, bulk imports/exports, QR attendance, listing moderation and local listing restrictions.

## Current implementation and future direction

The current deliverable is a frontend. It demonstrates the workflow using local records retained within the same browser tab. Signing out retains those records so another role can continue the same workflow. The active session key is `yarmouk:uims:v1`.

Firebase Realtime Database is the planned future database. The current frontend does not provide real authentication, server uploads, database writes, recovery emails or cross-user synchronization. Frontend role guards illustrate intended access but are not security boundaries. ASP.NET and authentication implementation are outside the current task.

The Yarmouk University rebrand remains local for owner review. Publishing, pushing or deploying it requires new explicit owner authorization.

## Intended outcome

The finished concept gives the university a clear internship lifecycle: students know their next step, companies can supervise practical work, academic supervisors can verify progress, and the coordinator can approve completion against a consistent set of requirements.
