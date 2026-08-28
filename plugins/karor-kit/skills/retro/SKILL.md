---
name: retro
description: After project/milestone/rough week — mine friction into kit changes. Use on "retro", "zróbmy retro", "co poprawić w kicie", or after a mini-project wraps. Repeated manual fixes -> rules, skill patches, template changes.
---

# Retro

Kit grows ONLY here. Real friction -> smallest possible change.

Output style: Be extremely concise. Sacrifice grammar for the sake of concision. Candidates as table: evidence / fix / recommendation.

1. Evidence, not philosophy. Sources by value: user's own annoyance list (ask first, plainly) -> recent PRs (what did humans fix AFTER agent finished?) -> implementer reports (recurring Surprises/Open) -> bounced tickets.
2. Cluster into candidates. Each: evidence (≥2 occurrences or 1 expensive) + SMALLEST fix — new rule / one-line skill change / template tweak / "one-off, do nothing".
3. Present with recommendations. New hard rule bar: checkable + violated-in-practice. Prefer template fix > skill fix > new rule.
4. Approval -> apply to kit repo (base CLAUDE, skills, references), commit `retro: <summary>`, bump plugin version.
5. End: 3-line changelog for teammate.

Rules: max 3 changes per retro. Every rule cites its incident in commit. Agents asking questions / scope stops = ticket-quality problem -> fix template or grill/refinement, not implementer rules.
