---
name: digest
description: Chew a project's raw dump doc into a tidy, structured design-notes doc. Use on "digest", "przemiel dump", "uporządkuj dump", or when a dump doc grows unwieldy. Args: project (default: infer from context).
---

# Digest

Raw dump -> tidy notes. Dump doc stays the drop box; digest keeps "[<project>] Design notes" readable. Same pattern as retro inbox -> archive.

Output style: Be extremely concise. Sacrifice grammar for the sake of concision. Report: sections touched, open questions, ticket candidates.

1. Fetch "[<project>] dump" (Linear project doc) + existing "[<project>] Design notes" (create if absent; both docs link to each other in their headers).
2. Digest dump content: group by theme into sections. Keep EVERY thought (no invention, no silent drops), keep author tags ([KB] etc.), keep the input's language. Separate within sections: current state/leanings | options/ideas | open questions (mark `OPEN:`) | bugs/tech debt. Cross-reference existing tickets when an idea already has one.
3. Merge into existing notes structure — extend sections, don't duplicate. New entry contradicts existing note -> mark OPEN, never silently resolve. Digest sorts, doesn't decide.
4. Ticket-able items (bugs, concrete asks) -> list as candidates in the report + offer `create-issue`/`refinement`. Never create tickets directly.
5. Clear the dump (leave header + append-here hint) — content lives in notes now.

Rules: nothing lost, nothing invented; substance preserved, verbatim sprawl not. Decisions belong to humans.
