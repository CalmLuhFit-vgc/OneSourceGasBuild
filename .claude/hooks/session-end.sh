#!/usr/bin/env bash
# Runs when a Claude Code session ends.
# Auto-captures mechanical signals to today's log so Brad doesn't have to remember.

set -e
PROJECT_DIR="/Users/phobos/Desktop/OneSourceGasBuild"
LOGS_DIR="$PROJECT_DIR/logs"
TODAY=$(date +%Y-%m-%d)
TODAY_LOG="$LOGS_DIR/daily/$TODAY.md"

# If today's log doesn't exist, create it (edge case: session ended without start hook firing)
mkdir -p "$LOGS_DIR/daily"
if [ ! -f "$TODAY_LOG" ]; then
    echo "# $TODAY" > "$TODAY_LOG"
fi

# Append session-end footer with mechanical signals
{
    echo ""
    echo "---"
    echo ""
    echo "## Auto-capture (session ended $(date '+%H:%M'))"
    echo ""

    # Files modified today (uses git if it's a repo, otherwise mtime)
    if [ -d "$PROJECT_DIR/.git" ]; then
        echo "**Files changed today (git):**"
        echo ""
        cd "$PROJECT_DIR"
        git diff --name-only HEAD 2>/dev/null | sed 's/^/- /' || echo "_(no git changes)_"
        UNTRACKED=$(git ls-files --others --exclude-standard 2>/dev/null)
        if [ -n "$UNTRACKED" ]; then
            echo ""
            echo "**New files:**"
            echo ""
            echo "$UNTRACKED" | sed 's/^/- /'
        fi
    else
        echo "**Files modified today (mtime):**"
        echo ""
        find "$PROJECT_DIR" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.md" -o -name "*.sql" -o -name "*.json" \) -newer "$TODAY_LOG.start_marker" 2>/dev/null | grep -v node_modules | grep -v ".claude" | grep -v "logs/daily" | head -30 | sed 's/^/- /' || echo "_(no recent file changes detected)_"
    fi

    echo ""
    echo "_Session length: started $(stat -f '%Sm' -t '%H:%M' "$TODAY_LOG" 2>/dev/null || echo '?'), ended $(date '+%H:%M')_"
} >> "$TODAY_LOG"

# Touch a marker file so next session knows when this one ended
touch "$LOGS_DIR/daily/.last-session-end"
