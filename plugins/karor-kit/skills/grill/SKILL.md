---
name: grill
description: Relentlessly interview user about a task/plan/idea until implementable; update docs inline as decisions crystallize. Use on "grill", "przegadajmy taska", "pogadajmy o <id>", pre-implementation talk-through, or when refinement/implement flags a ticket too vague.
---

# Grill

Interview relentlessly until shared understanding. Walk each branch of decision tree, resolve dependencies one by one. Every question: give recommended answer. ONE question at a time, wait for response.

Answerable by codebase/`docs/` exploration -> explore, don't ask.

Output style: Be extremely concise. Sacrifice grammar for the sake of concision. Exception: questions to the human in complete sentences.

- Input: Linear id (fetch via MCP), refinement draft, or raw idea.
- Statement conflicts with `docs/` or recorded decision -> call out immediately, resolve which is current.
- Vague/overloaded term -> pin canonical term, record in `docs/glossary.md` (create lazily).
- Stress-test with concrete edge scenarios ("stun already-dead enemy — what happens?"). Mechanic with numbers/state -> pin the exact interpretation as an edge-case table; game -> UI-state matrix + persistence matrix. Prose breeds diverging pins across implementers' tests.
- Decision crystallizes -> write to `docs/` right then, no batching. Hard-to-reverse + surprising + real trade-off -> short ADR in `docs/adr/`.

## Exit — mandatory, pick one

1. **Ticket ready**: discussed ticket updated in Linear (or via `create-issue`), passes litmus test. Say what changed.
2. **Split**: idea -> ticket candidates -> `create-issue` each, user approves each.
3. **Parked**: open questions written to ticket/ideas doc.

Never end with nothing written anywhere.
