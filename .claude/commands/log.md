---
description: One-command logging. Type /log alone to rebuild the Richard PDF, or /log "note" to add a note AND rebuild.
---

User typed: `/log $ARGUMENTS`

Behavior depends on arguments:

**If $ARGUMENTS is empty (just `/log`):**
- Skip the append step.
- Run: `node /Users/phobos/Desktop/OneSourceGasBuild/scripts/report-builder.js`
- Confirm: "PDF report rebuilt at logs/reports/richard/weekly-report.pdf — open with `open logs/reports/richard/weekly-report.pdf`"

**If $ARGUMENTS starts with `-r ` (richard flag):**
- Strip the `-r ` prefix.
- Append the remaining text to today's daily log file at `/Users/phobos/Desktop/OneSourceGasBuild/logs/daily/<YYYY-MM-DD>.md` under the `## For Richard` section as a bullet point with `[HH:MM]` timestamp prefix.
- If the section doesn't exist, create it.
- If today's daily log file doesn't exist, create it from the standard template (header `# YYYY-MM-DD`, sections: `## What I worked on`, `## Decisions / blockers / notes`, `## For Richard`).
- Run: `node /Users/phobos/Desktop/OneSourceGasBuild/scripts/report-builder.js`
- Confirm: "Logged for Richard. PDF updated."

**Otherwise (regular note):**
- Append the $ARGUMENTS text to today's daily log under `## What I worked on` as a bullet `- [HH:MM] {note}`.
- If the section doesn't exist, create it.
- If the daily log file doesn't exist, create it from the standard template.
- Run: `node /Users/phobos/Desktop/OneSourceGasBuild/scripts/report-builder.js`
- Confirm with one line: "Logged. PDF updated."

Use Edit/Write tools to update the markdown, Bash to run the builder. Keep responses brief — Brad logged something, he doesn't want a wall of text back.
