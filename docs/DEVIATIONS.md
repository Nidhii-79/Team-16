# Deviations from the plan - Team 16, Change Management Software

## 1. Technology
The first draft of the design named Java Spring Boot and MySQL. The project was built with Node.js (Express) and SQLite instead,
to fit the two-week timeline. The behaviour described in the SRS and SAD is unchanged.

## 2. Schedule
Sprint 1 was planned for 19-23 Oct 2026 and Sprint 2 for 26-30 Oct 2026.
Sprint 1 was not finished on time:
- Done on time, 23 Oct: project skeleton, login, role-based menus, and the risk level and rollback-plan rule (committed by an unidentified author, see section 3).
- Done 1 day late, 24 Oct: approve/reject with comment, password hashing, role checks on API endpoints, and the GitHub Actions build (Harshith).
- Done 9 days late, 1 Nov: submitting and listing change requests, and the Sprint 1 demo video (Uthkarsh).

Reason: the team did not keep to the planned dates; the work was done in batches after the sprint windows closed. The commit dates in the repository are the real dates.

Sprint 2 was also finished after its planned window (26-30 Oct):
- 1 Nov: scheduling with blackout dates, review notes, the response-time check and the dashboard restyle (backlog owner Nidhi); request more info, implementation status and the audit log (Uthkarsh).
- 2 Nov: in-app notifications and these final documents (Harshith).

## 3. Who did what
Each member's work is listed in section 2 and in the backlog (backlog.csv). The git history groups commits in batches
(for example, several of one member's commits share the same minute), because work was committed together when it was pushed,
not as it was written. Some commits show an author of "unknown" because git was not configured with a name on the computer that made them.
This applies to the 23 Oct commits (skeleton, login, role menus, risk level, rollback rule) and to the 1 Nov Sprint 2 and
dashboard commits. The backlog assigns the risk level and rollback rule to Uthkarsh, but they were committed from a
different computer on 23 Oct, so the history does not show who wrote them.

## 4. Testing
- Automated tests: `cd server && npm test` (password hashing, role checks, scheduling and blackout dates, review notes, notifications, performance).
- CM-NF-001 (response time): measured with a 40-request script on one laptop, 95th percentile 6 ms against a 3 s limit.
  This is a quick check, not the multi-user load test named in the SRS, because of the time available.
- The user interface was checked by hand following the demo script; there are no automated browser tests.

## 5. Scope
- Notifications are in-app only (no email), as planned in the SAD.
- Requirements the SRS marked as deferred were documented but not built: account lockout after 5 failed logins (CM-F-003),
  attaching documents to a request (CM-F-011), audit and summary reports (CM-F-051), 99.5% availability (CM-NF-002),
  50 concurrent users (CM-NF-004), WCAG 2.1 AA accessibility (CM-NF-005), TLS 1.2+ (CM-SR-001),
  a tamper-evident audit trail (CM-SR-004) and session expiry (CM-SR-005).
- Because the tamper-evident audit trail was deferred, the audit log built for CM-NF-003 records every action but is not tamper-proof.

## 6. Demo videos
Sprint 1: demo/sprint1-demo.mp4  |  Sprint 2: demo/sprint2-demo.mp4
