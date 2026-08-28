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

## Verification
How to prove it works: exact test command, scene to run, what to observe.

## Out of scope (optional)
Explicitly excluded things an agent might be tempted to do.
```

## Metadata conventions

- **Estimate**: 1 = trivial, 2 = normal, 3 = needs thought. Anything you'd call 5+ → split it.
- **Labels**: `content` | `system` | `ui` | `tooling` | `bug` | `docs`
- **Suggested model** (label): `m:sonnet` (default, may be omitted) | `m:opus` | `m:fable`
  (fable = human + orchestrator session, not delegated)
- **Status flow**: Backlog → Todo (ready, brief complete) → In Progress → In Review → Done.
  Only move to Todo when the brief passes the litmus test below.

## Litmus test for a ready ticket

An implementer agent with zero conversation context must be able to complete it
without asking a single question. If you can imagine the question, the answer
belongs in the ticket.
