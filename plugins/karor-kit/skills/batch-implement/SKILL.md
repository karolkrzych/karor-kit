---
name: batch-implement
description: Run a set of tickets through `implement` in dependency-ordered waves — parallel where safe, sequential where not. Use on "batch <ids>", "puść batch", "zrób KAR-X…Z hurtem", or any multi-ticket implementation request. Args: issue ids (required), model overrides (optional), landing authorization (optional, must be explicit).
---

# Batch implement

Orchestrator protocol: N tickets in -> waves of parallel `implement` runs -> merged main, green suite, playtest ask. Per-ticket flow = the `implement` skill (claim, brief, dispatch, review, Cost); this skill adds planning, scheduling, landing.

Output style: Be extremely concise. Sacrifice grammar for the sake of concision. Human sees: wave plan (for approval), 1 line per dispatch, landing report.

1. **Collect**: fetch every ticket — status/assignee rules per `implement` step 1. Fails litmus test -> drop from batch, report, continue with the rest.
2. **Wave plan** — two dependency passes, BOTH mandatory:
   - **Logical**: ticket builds on another's output (sound effect for an entity that doesn't exist yet) -> later wave.
   - **File conflicts**: overlapping `Files in scope` (scope vague / same subsystem -> orchestrator judges, err toward serializing) -> NEVER same wave, even when logically independent. Evidence: waves cut by file conflict = 0 merge conflicts; cut by logic only = same file conflicted 2×.
   Present plan (wave -> tickets + reason) -> human OK BEFORE first dispatch.
3. **Execute wave**: claim + dispatch all wave tickets in parallel, one implementer each, model per `m:` label. Branches cut from CURRENT main. Review each diff per `implement` steps 4-5; PR opened -> In Review.
4. **Land wave** before next starts: merge PRs locally into main, commit message `Merge pull request #N from <owner>/<branch>` — GitHub marks PRs MERGED once main lands. `gh pr merge` = classifier-blocked, don't use. After merges: `--import` step (global `class_name` set changed) + full suite; red -> stop batch, report. Push main YOURSELF — default (Karol, 2026-08-29); invocation forbids it or push blocked by classifier -> hand back: local main ready, human pushes.
5. **Consent in briefs**: say push authorization comes from Karol's own instruction to the orchestrator; implementer still refuses -> fallback "report pushed:false, move on", orchestrator pushes the branch itself. Standard pattern — don't fight for 0 refusals.
6. **Close out**: per ticket Done + `## Cost` dispatch lines IMMEDIATELY at that ticket's Done (wave landing), per `implement`; orchestrator tokens split evenly across batch tickets (`(orchestration, batch/N)`), appended to EVERY batch ticket at batch close-out. Batch NOT closed without human playtest smoke — human plays, feedback -> input for `refinement`. Report: landed tickets, suite result, refusals/flakes, playtest ask.

Rules: wave N+1 never starts before wave N fully landed. Ticket fails twice -> drop, continue rest, report at end. Blocked Linear write -> split calls (per `implement`). One batch = one session; `implement`'s one-session-one-ticket rule yields here — the batch invocation IS the explicit exception.
