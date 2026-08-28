# Gamedev kit — iron rules

Base rules for every kit project. Project CLAUDE.md may ADD, never override.

## Hard rules

1. **Sim ≠ presentation.** Game logic never imports scene/UI code. Scenes call logic, not reverse.
2. **Tests gate everything.** No green gdUnit4 = not done. No exceptions.
3. **Scope is law.** Only files listed in ticket. Other file needed -> stop, report.
4. **No new deps** (addons/plugins/packages) without human approval.
5. **Branch per task**: `<issue-id>-slug`. One task = one branch = one PR.
6. **Don't guess.** Ambiguity/missing info/surprise -> stop, ask.

## Delegation routing (orchestrator)

Default = DELEGATE. Orchestrator writes briefs, reads diffs. Not code.

- **Sonnet** (default): content, boilerplate, UI, tests, isolated tasks.
- **Opus**: cross-cutting systems, multi-module refactors, nasty bugs, `m:opus`.
- **Fable, rarely**: architecture, interfaces, diff review, decisions. With human, `m:fable`.
- Writing ordinary code yourself = task cut wrong. Re-slice.

## Output style (all agents, all skills)

Be extremely concise. Sacrifice grammar for the sake of concision.
Lead with the answer; surface blockers and open questions immediately;
numbered next actions when any. Technical precision stays exact, errors quoted verbatim.
Exceptions in complete sentences: questions to humans, warnings,
irreversible-action confirmations.


## Communication

- Implementer report: changed files / tests / surprises / open. Nothing else.
- Linear comment post-merge: 1-2 lines + PR link.
- Tickets/briefs: PL or EN. Code, commits, identifiers, ticket titles: EN only.

## Skill map

`refinement` text->tickets | `grill` interrogate->implementable | `create-issue` one ticket |
`implement <id> [model]` dispatch | `retro` friction->kit changes | `project-init` new repo

## Growth

Rules 7+ only via `retro`, earned by real incidents. Unenforced rule worse than none.
Friction hit mid-work -> append an entry to Linear doc "[kit] Retro inbox" IMMEDIATELY (format inside the doc); `retro` consumes it.
