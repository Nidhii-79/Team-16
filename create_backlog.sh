#!/usr/bin/env bash
# Needs gh CLI: gh auth login && gh auth refresh -s project
# Preview first:  DRY_RUN=1 bash create_backlog.sh
# If teammates have not accepted the repo invite yet:  ASSIGN_ALL_TO_ME=1 bash create_backlog.sh
set -euo pipefail

REPO="Nidhii-79/Team-16"
NIDHI_USER="Nidhii-79"
UTHKARSH_USER="Uthkarsha413"
HARSHITH_USER="harshithkk123"
PROJECT_TITLE="CMS Product Backlog"

OWNER="${REPO%%/*}"
DRY="${DRY_RUN:-0}"

if [ "$DRY" = 1 ]; then
  PNUM=1; PID=PID; FID=FID
else
  for l in fr nfr security chore; do gh label create "$l" --repo "$REPO" --force >/dev/null; done
  gh api "repos/$REPO/milestones" -f title="Sprint 1" -f due_on="2026-10-23T23:59:59Z" >/dev/null || true
  gh api "repos/$REPO/milestones" -f title="Sprint 2" -f due_on="2026-10-30T23:59:59Z" >/dev/null || true
  gh api "repos/$REPO/milestones" -f title="Deferred (future work)" >/dev/null || true
  PNUM="${PROJECT_NUMBER:-1}"   # existing project: CMS Product Backlog (#1)
  gh project link "$PNUM" --owner "$OWNER" --repo "$REPO" >/dev/null 2>&1 || true
  PID=$(gh project view "$PNUM" --owner "$OWNER" --format json --jq '.id')
  FID=$(gh project field-list "$PNUM" --owner "$OWNER" --format json --jq '.fields[] | select(.name=="Story Points") | .id')
  if [ -z "$FID" ]; then
    gh project field-create "$PNUM" --owner "$OWNER" --name "Story Points" --data-type NUMBER >/dev/null
    FID=$(gh project field-list "$PNUM" --owner "$OWNER" --format json --jq '.fields[] | select(.name=="Story Points") | .id')
  fi
fi

while IFS='|' read -r ID TYPE TITLE SP SPRINT OWN STORY AC; do
  [ -z "$ID" ] && continue
  U=""
  case "$OWN" in Nidhi) U="$NIDHI_USER";; Uthkarsh) U="$UTHKARSH_USER";; Harshith) U="$HARSHITH_USER";; esac
  if [ "${ASSIGN_ALL_TO_ME:-0}" = 1 ] && [ -n "$U" ]; then U="$OWNER"; fi
  if [ "$SPRINT" = 0 ]; then MS="Deferred (future work)"; else MS="Sprint $SPRINT"; fi
  ARGS=()
  [ -n "$U" ] && ARGS+=(--assignee "$U")
  BODY=$(printf '**SRS ref:** %s\n**Story points:** %s\n**Milestone:** %s\n\n**Story:** %s\n\n**Acceptance criteria:** %s\n' "$ID" "$SP" "$MS" "$STORY" "$AC")
  if [ "$DRY" = 1 ]; then
    echo "[$ID] SP=$SP $MS -> ${U:-unassigned} : $TITLE"
  else
    URL=$(gh issue create --repo "$REPO" --title "$ID: $TITLE" --body "$BODY" --label "$TYPE" --milestone "$MS" ${ARGS[@]+"${ARGS[@]}"})
    ITEM=$(gh project item-add "$PNUM" --owner "$OWNER" --url "$URL" --format json --jq '.id')
    gh project item-edit --id "$ITEM" --project-id "$PID" --field-id "$FID" --number "$SP"
    echo "created $ID"
  fi
done <<'DATA'
SETUP-01|chore|Project skeleton: backend, DB (SQLite/MySQL), frontend, seeded users|3|1|Nidhi|As a developer, I want the app skeleton running so features can be added.|App runs locally; DB has users and change_requests tables.
CM-F-001|fr|Login (username/password)|3|1|Nidhi|As a user, I want to log in.|Valid login gives access; invalid is rejected.
CM-F-002|fr|Role-based menus (Requester, CAB, Implementer, Admin)|2|1|Nidhi|As an admin, I want features shown by role.|Each role sees only its own actions.
CM-F-010|fr|Submit a change request (simple form)|3|1|Uthkarsh|As a requester, I want to submit a CR with title, description, priority.|CR saved with ID and status Submitted.
CM-F-020|fr|Risk level field (Low/Medium/High)|1|1|Uthkarsh|As a requester/CAB, I want a risk level on each CR.|Risk level saved and shown.
CM-F-021|fr|Rollback plan required when risk is High|1|1|Uthkarsh|As CAB, I want High-risk CRs to need a rollback plan.|Save blocked without rollback text if risk is High.
CM-F-012|fr|List CRs and show status|2|1|Uthkarsh|As a requester, I want to see my CRs and their status.|Table of CRs with current status.
SETUP-04|chore|Sprint 1 demo video (1 min) in /demo|1|1|Uthkarsh|As a team, we want a short Sprint 1 demo video.|Video uploaded to repo.
CM-F-030|fr|Approve or reject a CR with comment|3|1|Harshith|As CAB, I want to approve or reject with a comment.|Decision and comment saved; status changes.
SETUP-03|chore|GitHub Actions: build on every PR|2|1|Harshith|As a team, we want automated build checks on PRs.|PR triggers build; status shown.
CM-SR-002|security|Hash passwords|1|1|Harshith|As an org, we want no plaintext passwords.|DB stores hashes only.
CM-SR-003|security|Role check on API endpoints|2|1|Harshith|As an org, we want server-side role checks.|Wrong role gets 403.
CM-F-031|fr|Request more info (extra decision option)|1|2|Uthkarsh|As CAB, I want to send a CR back for more info.|Status becomes Info Requested.
CM-F-040|fr|Schedule date on approved CR + simple blackout-date check|3|2|Nidhi|As an approver, I want to set a date and be warned about blackout dates.|Blackout date is blocked or warned.
CM-F-041|fr|Update implementation status|2|2|Uthkarsh|As an implementer, I want to set In Progress/Completed/Failed.|Status saved and visible.
CM-F-042|fr|Post-implementation notes|1|2|Nidhi|As an implementer, I want to add review notes.|Notes saved on the CR.
CM-F-050|fr|In-app notification on status change|2|2|Harshith|As a requester, I want to be notified when status changes.|Notification shown (email optional).
CM-NF-003|nfr|Audit log of CR actions|2|2|Uthkarsh|As an auditor, I want actions logged.|Log row with user, action, time per CR action.
CM-NF-001|nfr|Response time check (one quick test)|1|2|Nidhi|As a user, I want pages to respond fast.|Measured and reported <= 3s.
SETUP-05|chore|Final docs, deviations note, Sprint 2 demo video (2 min)|3|2|Harshith|As a team, we want final docs and demo.|Docs updated; video uploaded.
CM-F-003|fr|Account lockout after 5 failed logins|2|0|-|Deferred / future work.|Documented only.
CM-F-011|fr|Attach documents to a CR|2|0|-|Deferred / future work.|Documented only.
CM-F-051|fr|Audit and summary reports|3|0|-|Deferred / future work.|Documented only.
CM-NF-002|nfr|99.5% availability|1|0|-|Deferred / future work.|Documented only.
CM-NF-004|nfr|50 concurrent users|2|0|-|Deferred / future work.|Documented only.
CM-NF-005|nfr|WCAG 2.1 AA accessibility|2|0|-|Deferred / future work.|Documented only.
CM-SR-001|security|TLS 1.2+|1|0|-|Deferred / future work.|Documented only.
CM-SR-004|security|Tamper-evident audit trail|3|0|-|Deferred / future work.|Documented only.
CM-SR-005|security|Session expiry and re-auth|1|0|-|Deferred / future work.|Documented only.
DATA
