---
name: refinement
description: Wall of text (transcript, notes, brainstorm dump) -> verified Linear tickets. Use when user pastes/points at unstructured planning material wanting tasks, says "refinement", "rozbij to na taski", "z tego spotkania", or drops a transcript file. Human approval gate before anything reaches Linear.
---

# Refinement

Text in -> human-verified tickets out. Approval gate is structural.

Input: pasted text or file path. PL/EN/mixed -> drafts in input's dominant language; titles EN.

Output style: Be extremely concise. Sacrifice grammar for the sake of concision. Digest = dense lists; open questions first.

1. Read `${CLAUDE_PLUGIN_ROOT}/references/issue-template.md`.
2. Digest into three buckets, this order:
   - **Decisions** — settled by humans. Not tickets. Flag which deserve `docs/`.
   - **Ticket candidates** — numbered; each: title, 2-3 line summary, estimate guess, priority guess (build order), model label guess, MISSING pieces for litmus test.
   - **Parking lot** — mentioned, not actionable. Offer append to ideas doc.
3. Iterate: merge/split/drop/edit per feedback. Missing pieces -> minimum questions, or mark Backlog-with-gaps (gaps noted in body).
4. Explicit approval ("push 1, 3") -> expand approved to full template (incl. priority per build order), create via MCP. Complete -> Todo; gapped -> Backlog.
5. Summary: ids + URLs, decisions flagged for docs, parking destination.

Rules: nothing reaches Linear without approved numbers. No invented work — every candidate traces to input; gaps stay gaps. Big vague candidate -> propose `grill`, don't force ticket shape. Disagreement/unresolved in input -> lands as OPEN, never silently resolved.
