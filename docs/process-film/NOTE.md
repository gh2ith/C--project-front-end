# Bridgeway internship process film

The film follows one carried work record from opportunity to application, task submission, revision, verified hours, final evaluations and completion. It uses Bridgeway's original identity, blue action color, navy text and light paper surfaces. Its purpose is an instructional explanation for students and staff, with readable UI fragments rather than a promotional claim.

The illustrative record names, task and feedback correspond to the frontend's local fixtures and workflow verification. The film is authored HTML motion, not a recording of a real university internship, external communication or an actual university approval. The original Bridgeway logo is retained. No external AI video service was connected.

The video is silent and includes English closed captions. No speech/music service was configured. Each scene has an assigned reading interval and subtle paper/camera movement. The final shot deliberately exits in motion rather than holding an end card.

## What each beat buys

1. Opportunity/application: establishes that the student chooses a suitable role and applies.
2. Company decision/confirmation: separates company acceptance from the student's one-offer confirmation.
3. Task/submission: shows task requirements and custom criterion maximums.
4. Feedback/revision: demonstrates that a requested improvement can be resubmitted and reviewed, while history stays available.
5. Hours: distinguishes company recording from academic verification and from task grading.
6. Final review: shows that both final evaluations reach the coordinator.
7. Certificate: resolves the process with the student's approved completion message and certificate.

## Visual review

Twelve contact-sheet frames were inspected, with representative full-resolution stills and the local browser video player:

1. A software internship and the blue Apply action dominate the first frame.
2. The cursor reaches Apply on the same paper record.
3. The application is pending company review.
4. Company acceptance becomes an offer the student can confirm.
5. The assigned form-building task shows its criteria and Submit action.
6. Submission confirmation replaces the action.
7. Company feedback requests visible form labels and a resubmission.
8. The revised submission meets the criteria and keeps its history.
9. A dated-work hours record shows that the company supplied it.
10. Academic verification appears independently of task completion.
11. The coordinator's final review shows both evaluations received.
12. The paper resolves into the Bridgeway completion certificate.

G1 and G4 were assessed visually: the dominant paper occupies roughly three quarters of the frame, the principal UI copy reads at full resolution, and each scene has one dominant object. Small supporting criterion text and captions benefit from full-screen viewing on a phone. This is an instructional film, with a lower movement density than a launch advertisement.

Computed validation is recorded in `validation.json`: G0 (decoded 34-second, 1280×720 H.264 video), G2 (no run of more than three flat frames), G3 (two-second final shot, 6% of runtime; zero frozen end hold) pass. G5's DOM lint passes all checks. The film has no audio stream by design. No frozen stretch of at least 0.6 seconds was detected. The measured mean luma change is approximately 0.4/255 per frame, below the motion study's human-film band; the steady reading pace is intentional, not a claim of cinematic energy.

The renderer's original review script used `-fps_mode`, unsupported by the installed FFmpeg build. The local QA copy uses the equivalent `-vsync 0` option. This compatibility change does not alter the authored video. The final asset was decoded and inspected after rendering.

Potential improvement: record a professional spoken explanation if a narration service is connected later. The existing captioned video is complete and playable without it.
