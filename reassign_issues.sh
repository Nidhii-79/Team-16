#!/usr/bin/env bash
# Run AFTER teammates accepted the repo invite. Gives every issue to its real owner.
set -euo pipefail
REPO="Nidhii-79/Team-16"
ME="Nidhii-79"
gh issue list --repo "$REPO" --state all --limit 100 --json number,title --jq '.[] | "\(.number)|\(.title)"' |
while IFS='|' read -r N TITLE; do
  ID="${TITLE%%:*}"
  O=""
  case "$ID" in
    SETUP-01) O="Nidhi";;
    CM-F-001) O="Nidhi";;
    CM-F-002) O="Nidhi";;
    CM-F-010) O="Uthkarsh";;
    CM-F-020) O="Uthkarsh";;
    CM-F-021) O="Uthkarsh";;
    CM-F-012) O="Uthkarsh";;
    SETUP-04) O="Uthkarsh";;
    CM-F-030) O="Harshith";;
    SETUP-03) O="Harshith";;
    CM-SR-002) O="Harshith";;
    CM-SR-003) O="Harshith";;
    CM-F-031) O="Uthkarsh";;
    CM-F-040) O="Nidhi";;
    CM-F-041) O="Uthkarsh";;
    CM-F-042) O="Nidhi";;
    CM-F-050) O="Harshith";;
    CM-NF-003) O="Uthkarsh";;
    CM-NF-001) O="Nidhi";;
    SETUP-05) O="Harshith";;
  esac
  case "$O" in Nidhi) U="Nidhii-79";; Uthkarsh) U="Uthkarsha413";; Harshith) U="harshithkk123";; *) continue;; esac
  if [ "$U" = "$ME" ]; then continue; fi
  gh issue edit "$N" --repo "$REPO" --add-assignee "$U" --remove-assignee "$ME"
  echo "#$N $ID -> $U"
done
