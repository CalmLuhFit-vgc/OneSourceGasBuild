# One Source Gas — Build Project

Customer portal + marketing website rebuild for One Source Gas of Austin LLC. Service-industry customers only (bars, breweries, restaurants, coffee shops, etc.).

**Owner:** Richard Strever
**Developer:** Brad Ferrer
**Tech stack:** Next.js 16 + Supabase + Stripe + Vercel
**Target launch:** ~6 months from kickoff

Full proposal + contracts + intake form live in `/Users/phobos/Desktop/One Source Gas/`. The internal playbook (talking points, change-order toolkit, friend script) is also there.

---

## The tracking system (read this once, then forget about it)

This project uses a hands-off tracking system designed around the principle that **you'll forget to log things, so the system has to capture automatically.**

### What happens automatically — no action required

- **Every time you start a Claude Code session in this folder**, the SessionStart hook prints yesterday's log + today's draft. You see what you shipped last, what's open, and any flagged blockers.
- **Every time a session ends**, the SessionEnd hook appends mechanical signals to today's log: files modified (via git or mtime), session duration, end timestamp.
- **Every Friday morning** (once you've enabled it), a fresh weekly Richard PDF is built from this week's logs without you doing anything.
- **Energy check:** if you log energy 1–2 for 4+ days running, the SessionStart hook flags it.

### What you do manually — quick commands when you remember

All commands rebuild `logs/reports/richard/weekly-report.pdf` automatically.

| Command | What it does | Example |
|---|---|---|
| `/log` (alone) | Just rebuild the PDF (no new note) | `/log` |
| `/log "note"` | Append note to today's log + rebuild PDF | `/log "fixed Stripe webhook bug"` |
| `/log -r "note"` | Flag note for Richard's report + rebuild | `/log -r "demoable on Friday"` |
| `/decision "..."` | Log architectural decision (also updates memory) | `/decision "picked Supabase over Neon"` |
| `/park "..."` | Park an idea for Phase 2 | `/park "AI troubleshooting assistant"` |
| `/change-order "..."` | Log approved change order with $ amount | `/change-order "per-site delivery, +4 hrs, $400"` |

**You only need to remember `/log`.** The others are nice-to-have.

---

## Where things live

```
OneSourceGasBuild/
├── .claude/
│   ├── settings.json           # hooks + permissions (project-scoped)
│   ├── hooks/
│   │   ├── session-start.sh    # shows yesterday on session start
│   │   └── session-end.sh      # auto-captures mechanical signals on session end
│   └── commands/
│       ├── log.md              # /log
│       ├── decision.md         # /decision
│       ├── park.md             # /park
│       └── change-order.md     # /change-order
├── logs/
│   ├── daily/                  # one .md file per day, auto-created
│   ├── decisions.md            # append-only architectural decisions
│   ├── scope.md                # change orders + parked items + running total
│   └── reports/
│       └── richard/
│           ├── weekly-report.pdf   # always-current Richard PDF
│           └── weekly-report.md    # source markdown (git-friendly)
├── scripts/
│   └── report-builder.js       # builds the PDF from this week's logs
├── assets/
│   └── one-source-gas-logo.png # for branded reports
├── package.json                # dependencies (just `marked` for now)
└── README.md                   # this file
```

The actual code (Next.js app, Supabase config, etc.) lives in this folder too as we build it — likely under `src/` or `app/`.

---

## Sending Richard the weekly report

1. Type `/log` (or just keep working — the PDF auto-rebuilds when you log anything)
2. Open the PDF: `open logs/reports/richard/weekly-report.pdf`
3. Read it, edit if needed (you can edit `logs/reports/richard/weekly-report.md` and rebuild)
4. Email or text Richard with the PDF attached

The report is generated, never sent automatically. You always have the final say.

---

## Memory system integration

The project has memory files at `/Users/phobos/.claude/projects/-Users-phobos-Desktop-One-Source-Gas/memory/` that Claude reads at the start of every conversation. The `/decision` command auto-updates the project memory file so cross-conversation context stays current with architectural choices. You don't have to update memory manually — just use `/decision` when something is worth remembering long-term.

The daily logs are NOT mirrored to memory (they'd bloat it). Only architectural-grade decisions go to memory.

---

## Energy check / sustainable pace

Each daily log has an `Energy:` field (1–5). It's optional. But if you log it consistently, the SessionStart hook will warn you if it's been 1–2 for 4+ days. The system is designed to gently reflect your pace back at you, because *you said* burnout is a real risk and the 24-hour stretches are what threaten the project's quality.

You don't have to fill in mood. But it's there if you want a passive sanity check.

---

## When something breaks

The whole tracking layer is markdown files + a Node script + a Chrome headless call. Nothing fancy. If `/log` stops generating PDFs:

1. Check `node /Users/phobos/Desktop/OneSourceGasBuild/scripts/report-builder.js` runs cleanly from a terminal
2. Check `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome --version` works
3. Check `assets/one-source-gas-logo.png` still exists

The tracking system is intentionally low-magic so it's easy to debug or modify later.
