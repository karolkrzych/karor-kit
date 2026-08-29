# Issue template (Linear)

Single source of truth for ticket format. `create-issue`, `refinement` and `implement`
all read this file. Change it here, never inline in a skill.

## Title

`<verb> <what>` — imperative, specific, no fluff. Good: "Add card draw animation to combat scene".
Bad: "Animations", "Fix stuff".

## Description (markdown body)

```markdown
## Context
1-3 sentences. Why this task exists, what it connects to. Link related issues/docs.

## Scope
What exactly to do. Concrete and bounded.

**Files in scope:** (list paths, or "new files under <dir>/")
Touching any file outside this list = stop and ask.

## Acceptance criteria
- [ ] Verifiable statement 1
- [ ] Verifiable statement 2
Each criterion must be checkable by running something or looking at something specific.

## Player-visible outcome
Player-facing tickets only (skip for pure tooling/refactor/internal): what the player
SEES/FEELS after this ticket — readability/contrast, visual feedback of the effect,
impact on pressure/pace. Can't name it -> the ticket has a gap.

## Verification
How to prove it works: exact test command, scene to run, what to observe.

## Out of scope (optional)
Explicitly excluded things an agent might be tempted to do.
```

## Metadata conventions

- **Estimate**: 1 = trivial, 2 = normal, 3 = needs thought. Anything you'd call 5+ → split it.
- **Priority**: ALWAYS set on creation — AI proposes, humans override. Maps to build order:
  1 Urgent = take this FIRST (tracer bullet / unblocks everything) | 2 High = foundation, no blockers, start anytime |
  3 Medium = second wave (unblocked once foundations merge) | 4 Low = later waves.
  Board views order by priority — board position must reflect build order. Never leave "No priority".
- **Labels**: `content` | `system` | `ui` | `tooling` | `bug` | `docs`
- **Suggested model** (label): `m:sonnet` (default, may be omitted) | `m:opus` | `m:fable`
  (fable = human + orchestrator session, not delegated)
- **Status flow**: Backlog → Todo (ready, brief complete) → In Progress → In Review → Done.
  Only move to Todo when the brief passes the litmus test below.

## Litmus test for a ready ticket

An implementer agent with zero conversation context must be able to complete it
without asking a single question. If you can imagine the question, the answer
belongs in the ticket.

## Cost (appended by `implement`)

Appended to the END of the issue body. Dispatch lines land IMMEDIATELY when the ticket hits Done — one line per dispatch, success or fail, retries included; token counts from the harness usage report. Never on a still-open ticket. The orchestrator line (fable) is appended at session close-out — in a batch: at batch close-out, split evenly across batch tickets as `(orchestration, batch/N)` (change 2026-08-29: Done ticket must show its dispatch cost right away — KB reads the board too):

```markdown
## Cost
- YYYY-MM-DD m:<model> — <N> tokens (dispatch)
- YYYY-MM-DD m:<model> — <N> tokens (retry)
- YYYY-MM-DD m:fable — <N> tokens (orchestration)
```

Basis for periodic (~biweekly) cost review across the board.
