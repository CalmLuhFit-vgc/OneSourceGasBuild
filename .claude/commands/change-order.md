---
description: Log an approved change order. Usage - /change-order "Add per-site delivery instructions, +4 hrs, $400"
---

User typed: `/change-order $ARGUMENTS`

If $ARGUMENTS is empty, respond: "Tell me the change. Example: `/change-order \"per-site delivery instructions, +4 hrs, $400\"`."

Otherwise:
1. Append to `/Users/phobos/Desktop/OneSourceGasBuild/logs/scope.md` under a `## Approved change orders` section:
   ```
   - **YYYY-MM-DD** — {the change text}
   ```
2. If the file or section doesn't exist, create them with the standard scope.md structure (see /park command).
3. Look for any dollar amounts in $ARGUMENTS (pattern: `$\d+`) and update the running total at the bottom of scope.md if present, or add one:
   ```
   ## Running total

   - Original SOW: $24,500
   - Approved change orders: $X
   - **Current contract: $Y**
   ```
4. Run: `node /Users/phobos/Desktop/OneSourceGasBuild/scripts/report-builder.js`
5. Confirm with one line including the new running total: "Change order logged. Contract now $Y. PDF updated."

Use Read first to get the current running total, then Edit/Write to update, then Bash to run the builder. Keep the response brief.
