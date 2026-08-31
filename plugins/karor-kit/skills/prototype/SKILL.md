---
name: prototype
description: End-to-end orchestrator from idea or doc to a playable first batch. Use on "nowy prototyp", "prototype", "zróbmy nową grę", "new game from scratch", a fresh game idea, or a refinement doc that wants a playable start.
---

# Prototype

Orchestrator of orchestrators: idea/doc -> playable first batch. Dispatches `grill`, `project-init`, `refinement`, `batch-implement` — never duplicates their logic. Every gate they carry stays: `project-init` confirm, `refinement` approval, `batch-implement` wave-plan OK.

Output style: Be extremely concise. Sacrifice grammar for the sake of concision. Human sees: which step is running, each sub-skill's own gate output, exit point after every step.

0. **Input check**: refinement doc / GDD in hand -> skip to step 2. Raw idea -> step 1.
1. **Scoping grill** (per `grill`): pin pitch (1 line) + core loop. Walk systemic unknowns per the refinement/grill gate — rule with numbers/state and >1 reading -> edge-case table; work touching UI state or persistence -> UI-state matrix + persistence/reset matrix (see step 4 of `refinement`, stress-test bullet of `grill`). Degenerate-strategy question -> flag "needs playtest", don't guess. Repo doesn't exist yet: scoping notes live in-session, land in step 3.
2. **`project-init`** (full skill, own confirm gate): local repo + GitHub repo + Linear project + tracer ticket.
3. **Seed docs**: scoping output -> `plan.md` (seed), `decisions.md` (entries). Feeds step 4.
4. **`refinement`** on the material (doc, or step 1/3 notes) -> ticket candidates -> Linear, own approval gate.
5. **`batch-implement`** wave 1 (tracer + independent tickets), own wave-plan gate -> close-out ends with a human playtest ask.

Rules: exit point after EVERY step — session can end anywhere, state lives in Linear/docs/repo, nothing lost. Return sessions use plain `refinement`/`batch-implement`, never `/prototype` again. Nothing lands without its owning skill's gate — this skill sequences, it doesn't shortcut.
