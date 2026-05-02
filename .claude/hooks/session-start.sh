#!/usr/bin/env bash
# Runs when Claude Code starts a session in this project.
# Output is added to Claude's context so Brad sees it immediately.

set -e
PROJECT_DIR="/Users/phobos/Desktop/OneSourceGasBuild"
LOGS_DIR="$PROJECT_DIR/logs"
TODAY=$(date +%Y-%m-%d)
TODAY_LOG="$LOGS_DIR/daily/$TODAY.md"

# Find the most recent prior daily log (excluding today)
LAST_LOG=$(ls -1 "$LOGS_DIR/daily/"*.md 2>/dev/null | grep -v "$TODAY" | tail -n1)

echo "## One Source Gas — session context"
echo ""
echo "**Today:** $TODAY"
echo ""

# Show yesterday's log if it exists
if [ -n "$LAST_LOG" ] && [ -f "$LAST_LOG" ]; then
    LAST_DATE=$(basename "$LAST_LOG" .md)
    echo "### Last session ($LAST_DATE)"
    echo ""
    cat "$LAST_LOG"
    echo ""
fi

# Initialize today's log if it doesn't exist
if [ ! -f "$TODAY_LOG" ]; then
    cat > "$TODAY_LOG" <<EOF
# $TODAY

**Session started:** $(date "+%H:%M")

## What I worked on
_(auto-populated at session end from files modified)_

## Decisions / blockers / notes
_(use \`/log "note"\` during the day, or just type freely here at the end)_

## For Richard
_(anything that should appear in the weekly report — flag with \`/log -r\` or just put it here)_

EOF
    echo "### Today's log initialized at $TODAY_LOG"
else
    echo "### Today's log already exists — continuing."
fi

echo ""
echo "**Reminders:**"
echo "- \`/log\` to drop a quick note · \`/decision\` to log a decision · \`/park\` for Phase-2 ideas · \`/change-order\` for scope changes"

# Day-of-week awareness — replaces what would have been a cloud cron
DOW=$(date +%u)  # 1=Mon, 5=Fri, 7=Sun
WEEK_NUM=$(date +%V)  # ISO week number
WEEK_PARITY=$((10#$WEEK_NUM % 2))  # 0=even, 1=odd

if [ "$DOW" = "5" ]; then
    # Friday — remind about the weekly Richard report
    REPORT_PDF="$LOGS_DIR/reports/richard/weekly-report.pdf"
    if [ -f "$REPORT_PDF" ]; then
        echo ""
        echo "📬 **It's Friday.** Weekly Richard report ready:"
        echo "   \`open $REPORT_PDF\`"
        echo "   (Type \`/log\` first to make sure it's current with this week's notes.)"
    fi
fi

if [ "$DOW" = "1" ] && [ "$WEEK_PARITY" = "0" ]; then
    # Bi-weekly Monday (even weeks) — running scope total reminder
    SCOPE_FILE="$LOGS_DIR/scope.md"
    if [ -f "$SCOPE_FILE" ]; then
        echo ""
        echo "📊 **Bi-weekly Monday.** Time to send Richard the running scope total."
        echo "   Pull the current numbers from \`logs/scope.md\` (Running total section), text or email them to him."
    fi
fi

# Burnout check: scan last 5 days of energy entries
LOW_ENERGY_DAYS=$(grep -h "^Energy: [12]" "$LOGS_DIR/daily/"*.md 2>/dev/null | tail -5 | wc -l | tr -d ' ')
if [ "$LOW_ENERGY_DAYS" -ge 4 ]; then
    echo ""
    echo "⚠️  **Energy check:** You've logged 1–2 energy on $LOW_ENERGY_DAYS recent days. Consider a real day off this week."
fi
