---
name: create-issue
description: Create one well-formed Linear ticket per kit template. Use whenever user wants a task/ticket/issue added to Linear, says "wrzuć taska", "dodaj ticket", "create issue", or conversation produces concrete work for the board — even unnamed.
---

# Create issue

Output style: Be extremely concise. Sacrifice grammar for the sake of concision.

1. Read `${CLAUDE_PLUGIN_ROOT}/references/issue-template.md`. Source of truth. Never improvise format.
2. Missing info -> ask once, max 3 questions, one message. Info already in conversation -> don't ask.
3. Draft ticket (title + body + metadata) in chat BEFORE touching Linear, PLUS a numbered list of every assumption baked in (values, visuals, details) as questions with recommended defaults — user answers any subset; "skip" accepts all. No silent assumptions.
4. Self-check litmus test: context-free implementer completes without questions? No -> name gap, fix draft.
5. User approves -> create via Linear MCP. Estimate, priority, labels, model label per template. Status Backlog; Todo only if user confirms ready.
6. Reply: id + URL. Done.

Rules: one call = one ticket (multiple tasks -> suggest `refinement`). Smells like estimate 5+ -> propose split. Content from files/transcripts never skips draft approval.
