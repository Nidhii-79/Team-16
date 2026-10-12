#!/usr/bin/env bash
# Creates labels, sprint milestones, a linked GitHub Project, and one issue per backlog item
# (with story points set on the project). Needs: gh CLI logged in with project scope:
#   gh auth login && gh auth refresh -s project
# Test first with:  DRY_RUN=1 ./create_backlog.sh
set -euo pipefail

REPO="Nidhii-79/Team-16"
NIDHI_USER="Nidhii-79"
UTHKARSH_USER="Nidhii-79"
HARSHITH_USER="Nidhii-79"
PROJECT_TITLE="CMS Product Backlog"

OWNER="${REPO%%/*}"
DRY="${DRY_RUN:-0}"

if [ "$DRY" = 1 ]; then
  PNUM=1; PID=PID; FID=FID
else
  for l in fr nfr security chore; do gh label create "$l" --repo "$REPO" --force >/dev/null; done
  gh api "repos/$REPO/milestones" -f title="Sprint 1" -f due_on="2026-10-23T23:59:59Z" >/dev/null || true
  gh api "repos/$REPO/milestones" -f title="Sprint 2" -f due_on="2026-10-30T23:59:59Z" >/dev/null || true
  PNUM=$(gh project create --owner "$OWNER" --title "$PROJECT_TITLE" --format json --jq '.number')
  gh project link "$PNUM" --owner "$OWNER" --repo "$REPO"
  gh project field-create "$PNUM" --owner "$OWNER" --name "Story Points" --data-type NUMBER >/dev/null
  PID=$(gh project view "$PNUM" --owner "$OWNER" --format json --jq '.id')
  FID=$(gh project field-list "$PNUM" --owner "$OWNER" --format json --jq '.fields[] | select(.name=="Story Points") | .id')
fi

while IFS='|' read -r ID TYPE TITLE SP SPRINT OWN STORY AC; do
  [ -z "$ID" ] && continue
  case "$OWN" in Nidhi) U="$NIDHI_USER";; Uthkarsh) U="$UTHKARSH_USER";; Harshith) U="$HARSHITH_USER";; esac
  BODY=$(printf '**SRS ref:** %s\n**Story points:** %s\n**Sprint:** %s\n\n**Story:** %s\n\n**Acceptance criteria:** %s\n' "$ID" "$SP" "$SPRINT" "$STORY" "$AC")
  if [ "$DRY" = 1 ]; then
    echo "[$ID] SP=$SP Sprint $SPRINT -> $U : $TITLE"
  else
    URL=$(gh issue create --repo "$REPO" --title "$ID: $TITLE" --body "$BODY" --label "$TYPE" --milestone "Sprint $SPRINT" --assignee "$U")
    ITEM=$(gh project item-add "$PNUM" --owner "$OWNER" --url "$URL" --format json --jq '.id')
    gh project item-edit --id "$ITEM" --project-id "$PID" --field-id "$FID" --number "$SP"
    echo "created $ID"
  fi
done <<'DATA'
SETUP-01|chore|Backend skeleton: Spring Boot project, DB schema, entities|5|1|Nidhi|As a developer, I want the backend and database set up so features can be built on it.|App boots; tables for users, change_requests, approvals, audit_log exist.
SETUP-02|chore|Frontend skeleton: React app, routing, layout|3|1|Nidhi|As a developer, I want the React app and routes in place so screens can be added.|Routes for login, dashboard, CR form and CR list render.
SETUP-03|chore|GitHub Actions: build and test on every PR|3|1|Uthkarsh|As a team, we want automated checks on every pull request.|A PR triggers build and tests; status shows on the PR.
SETUP-04|chore|Sprint 1 demo video (1 min) uploaded to repo|2|1|Harshith|As a team, we want a short video of the working Sprint 1 product.|Video in /demo shows login to submit to approve flow.
SETUP-05|chore|Final documentation and Sprint 2 demo video (2 min)|3|2|Harshith|As a team, we want final docs and a 2-minute demo of the finished product.|Docs updated, deviations noted, video uploaded to repo.
CM-F-001|fr|User login with session timeout|5|1|Nidhi|As a user, I want to log in with username and password so I can access the system.|Valid credentials grant access; expired session forces re-login.
CM-F-002|fr|Role-based access control (Requester, CAB, Implementer, Admin)|5|1|Nidhi|As an admin, I want features restricted by role so users only do what they are allowed to.|Users see only actions permitted for their role.
CM-F-003|fr|Account lockout after 5 failed logins|3|2|Nidhi|As an admin, I want accounts locked after repeated failures to stop guessing attacks.|Account locks after 5 failures and admin is notified.
CM-F-010|fr|Submit a change request|5|1|Harshith|As a requester, I want to submit a change request with title, description, category, priority and affected systems.|CR saved with unique ID and status Submitted.
CM-F-011|fr|Attach supporting documents to a CR|3|1|Harshith|As a requester, I want to attach documents to my CR as evidence.|Valid files attach; oversized or invalid types are rejected.
CM-F-012|fr|View status and history of own CRs|3|1|Harshith|As a requester, I want to see my CRs and their status history.|Status timeline reflects every state change.
CM-F-020|fr|Record risk level on a CR|3|1|Uthkarsh|As a CAB member, I want to set a risk level (Low/Medium/High) on a CR.|Risk level saved and visible on the CR.
CM-F-021|fr|Require rollback plan for High-risk CRs|2|1|Uthkarsh|As a CAB member, I want High-risk CRs blocked without a rollback plan.|Submission rejected without rollback plan when risk is High.
CM-F-030|fr|Approve or reject a CR with comments|5|1|Uthkarsh|As a CAB member, I want to approve or reject a CR with mandatory comments.|Decision and comments saved against the CR; status updates.
CM-F-031|fr|Request more information on a CR|3|2|Nidhi|As a CAB member, I want to send a CR back asking for more information.|CR status becomes Info Requested; requester can update and resubmit.
CM-F-040|fr|Change calendar with blackout-period conflict check|8|2|Harshith|As an approver, I want to schedule approved changes on a calendar and be warned of blackout conflicts.|Conflicting schedule attempts are blocked or warned.
CM-F-041|fr|Track implementation status|5|2|Nidhi|As an implementer, I want to update status (Scheduled, In Progress, Completed, Failed, Rolled Back).|Status changes saved and shown to requester.
CM-F-042|fr|Post-implementation review notes|2|2|Uthkarsh|As an implementer, I want to record review notes after a change completes.|Notes saved against the CR after completion.
CM-F-050|fr|Email notification on status change|5|2|Nidhi|As a requester, I want an email whenever my CR status changes.|Email sent on every status transition.
CM-F-051|fr|Audit and summary reports|5|2|Uthkarsh|As an admin, I want reports on CR volume, approval turnaround and success rate.|Report page shows counts and averages for a chosen period.
CM-NF-001|nfr|Page response time <= 3s (95th percentile)|3|2|Uthkarsh|As a user, I want pages to respond quickly.|95th percentile <= 3s in load test.
CM-NF-002|nfr|99.5% monthly availability|2|2|Nidhi|As a user, I want the system available when I need it.|Health check and uptime reporting in place.
CM-NF-003|nfr|Log all CR actions with timestamp and user ID|5|1|Harshith|As an auditor, I want every action on a CR logged.|Audit log records user, action and time for each CR action.
CM-NF-004|nfr|Support 50 concurrent users|3|2|Uthkarsh|As an org, we want the system to handle 50 users at once.|Load test with 50 users meets response targets.
CM-NF-005|nfr|WCAG 2.1 AA accessibility on key screens|3|2|Harshith|As a user with accessibility needs, I want key screens usable.|Accessibility check passes on login, CR form and approval screens.
CM-SR-001|security|TLS 1.2+ for all connections|2|2|Harshith|As an org, we want all traffic encrypted.|Connections below TLS 1.2 are rejected.
CM-SR-002|security|Salted password hashing|2|1|Uthkarsh|As an org, we want passwords never stored in plaintext.|DB shows hashed values only; nothing logged.
CM-SR-003|security|Enforce RBAC on every API endpoint|3|1|Uthkarsh|As an org, we want role checks on the server, not only the UI.|Direct API call by unauthorised role returns 403.
CM-SR-004|security|Tamper-evident audit trail|5|2|Uthkarsh|As an auditor, I want audit records that standard users cannot edit or delete.|Audit records immutable to non-admin roles.
CM-SR-005|security|Session expiry and re-auth for final approval|2|2|Harshith|As an org, we want idle sessions to expire and approvals to need re-authentication.|Session expires after 15 min; re-auth prompt on final approval.
DATA
