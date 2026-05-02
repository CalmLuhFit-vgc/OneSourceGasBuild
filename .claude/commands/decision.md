---
description: Log an architectural or scope decision so you can find it later. Usage - /decision "Picked Supabase over Neon — already know it from DermaGlo"
---

User typed: `/decision $ARGUMENTS`

If $ARGUMENTS is empty, respond: "Tell me what you decided. Example: `/decision \"picked Supabase over Neon\"`."

Otherwise:
1. Append a new entry to `/Users/phobos/Desktop/OneSourceGasBuild/logs/decisions.md` in this format:
   ```
   - **YYYY-MM-DD HH:MM** — {the decision text}
   ```
   (Use today's date and current time.)
2. If the file doesn't exist, create it with header `# Decision Log` and a one-line description, then add the entry.
3. **Also append to the project memory file** at `/Users/phobos/.claude/projects/-Users-phobos-Desktop-One-Source-Gas/memory/project_one_source_gas.md` under a `## Active decisions log` section (create the section if it doesn't exist). Format:
   ```
   - YYYY-MM-DD: {the decision text}
   ```
   This keeps cross-conversation memory current with key architectural choices. Don't add to MEMORY.md (the index) — just to the project file.
4. Run: `node /Users/phobos/Desktop/OneSourceGasBuild/scripts/report-builder.js`
5. Confirm with one line: "Decision logged (file + memory). PDF updated."

Use Edit/Write to append, Bash to run the builder. Keep the response brief.
