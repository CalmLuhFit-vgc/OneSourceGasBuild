---
description: Park an idea for Phase 2 instead of expanding current scope. Usage - /park "AI troubleshooting assistant"
---

User typed: `/park $ARGUMENTS`

If $ARGUMENTS is empty, respond: "Tell me what to park. Example: `/park \"customer-specific contract pricing\"`."

Otherwise:
1. Append to `/Users/phobos/Desktop/OneSourceGasBuild/logs/scope.md` under a `## Parked for Phase 2` section:
   ```
   - **YYYY-MM-DD** — {the idea text}
   ```
2. If the file or section doesn't exist, create them. Standard structure:
   ```
   # Scope Log

   ## Original SOW
   _Tier 2 Option A — $24,500_

   ## Approved change orders
   _(none yet)_

   ## Parked for Phase 2
   ```
3. Run: `node /Users/phobos/Desktop/OneSourceGasBuild/scripts/report-builder.js`
4. Confirm with one line: "Parked. PDF updated."

Use Edit/Write to append, Bash to run the builder. Keep the response brief.
