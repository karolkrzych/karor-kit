---
name: implement
description: Dispatch a Linear ticket to implementer subagent, shepherd to Done. Use on "implement <id>", "zrób <id>", "weź taska", or any ready ticket to build. Args: issue id (required), model sonnet|opus (default sonnet), effort hint (optional).
---

# Implement

Orchestrator protocol: ticket in -> reviewed, merged, closed out. Orchestrator dispatches + reviews. Never implements.

Output style: Be extremely concise. Sacrifice grammar for the sake of concision. Human sees dispatch note (1 line) + final summary (merged / surprises / follow-ups). Blockers immediately.

Model priority: explicit arg > `m:` label > sonnet. `m:fable` -> not dispatched; tell user it's in-session work.

1. Fetch issue via MCP: status AND assignee. Assigned to someone OTHER than the caller -> ticket TAKEN: stop, say who has it, list available tickets (Todo, unassigned or caller's own) ordered by priority, suggest top pick. Todo unassigned/caller's -> ok. In Progress assigned to caller -> ok (manual claim). Anything else -> flag, ask.
2. Build self-contained brief: full ticket body + hard-rules reminder (scope, tests, branch) + effort hint + exact test command. Ticket fails litmus test (`${CLAUDE_PLUGIN_ROOT}/references/issue-template.md`) -> STOP, fix ticket first (user or `grill`).
3. Claim before dispatch: assign the caller + move to In Progress (skip whatever is already set). Dispatch `implementer` with chosen model.
4. Report back -> read diff yourself. Check: hard-rule violations (scope creep, sim/presentation leak, new deps), tests assert behavior (not smoke theater), "surprises" -> investigate.
5. Verdict:
   - OK -> PR/merge per repo convention, issue -> Done, post-merge comment per template.
   - Fixable -> back to agent ONCE with precise correction list.
   - Failed twice -> stop, summarize. Two fails = ticket or architecture wrong, not agent.

Rules: one dispatch per ticket at a time. Scope never widens in review; new needs -> new linked ticket via `create-issue`.
