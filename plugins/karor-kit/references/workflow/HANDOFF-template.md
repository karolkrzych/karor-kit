# Batch vN — <theme> (<date>)
<!-- Template for `workflow` step 0. Written by the orchestrator BEFORE any agent runs. Replace every <…>. Keep the human's notes verbatim — the architect and the final report quote them. -->

## 1. Mandate (orchestrator = this session; <economy|quality> mode)
- Orchestrator NEVER reads game sources, never writes code/tests. It writes briefs/prompts, dispatches agents, reads reports, lands, reports to the human (PL, casual, concise).
- Model routing (the human's words, verbatim: "<…>"):
  - **Fable**: architecture (digest + ticket split + the designs named in §3), implementer of AT MOST TWO tickets the architect marks `fable` (novel engine seams only), the ONE final skeptic review.
  - **Opus**: engine seams, cross-cutting UI, icons, per-ticket skeptic reviewer, mechanical ticket bodies written from the digest.
  - **Sonnet**: content-as-data, cosmetics, prep, landers, bookkeeping, docs close-out.
- Standing rules: repo CLAUDE.md (sim ≠ presentation, tests gate, scope is law, no new deps, don't guess → stop & report), branch per ticket + PR, local merge `Merge pull request #N from <owner>/<branch>`, push main autonomously, never `--no-verify`/force-push/reset --hard, worktrees under `<wt-root>` stay, commit trailers `Co-Authored-By: <model> <noreply@anthropic.com>` + `Claude-Session: <session url>`. <project-specific standing rules: persistence seam, deterministic tests, real-mouse UI tests, CRLF rule, icon rule, …>
- Baseline: main `<sha>` (<suites> suites / <tests> tests, cold import green) = <previous batch> close-out. Previous batch context: `<wt-root>/briefs-v(N-1)/` (DIGEST = spec of what exists, LANDED.md = seams, FINAL-REVIEW = known risks).

## 2. The human's notes (verbatim, <date>, <source: playtest of batch v(N-1) / meeting / dump>)
> <every line verbatim, in the input's language, nothing dropped, nothing paraphrased>

## 3. Orchestrator's reading (binding for the architect unless the code makes it impossible — then a STOP-level surprise at the top of the digest)

### 3.1 Decisions settled by the human (do not re-litigate; flag for docs/decisions.md at close-out)
- D1 <decision, with the human's number/phrase>
- D2 …
- D<k> Batch review = ONE Fable skeptic at the end (plus the per-ticket opus skeptic).

### 3.2 Parking lot (mention in DIGEST §parking, no tickets)
<items the human deferred ("na kolejną fazę", "zostawmy"), risks from the previous final review not settled here>

### 3.3 Work items (each maps to ≥1 ticket)
1. **<item>**: <what "done" means — behaviour, exact text/number where the human gave one, what must be pinned>.
2. …
<the big design items get: goal in the human's words, levers the architect sets, arithmetic to show, what is write-up only vs implemented>

## 4. Process
1. Fable architect (worktree `<wt-root>/arch-vN`, detached at main <sha>, read-only + throwaway experiments) → deliverables in §5.
2. Sonnet bookkeeper creates the Linear tickets (project <project>, team <team>) from `TICKETS.md` + `T<n>.md`, writes the id map back, copies bodies to `<KEY>-NNN.md`, writes the refinement note into the Linear doc "[<project>] Batch log".
3. Orchestrator cuts worktrees `<wt-root>/<key>-NNN` (branch `<key>-NNN-<slug>`) and runs `runner.js` (per wave: prep → `wave.js` implementer(model) → opus skeptic → one fix round → sonnet lander → integrate-on-conflict retry → sonnet bookkeeper).
4. After the last wave: ONE Fable skeptic final review (read-only) → one fix-up ticket → docs close-out (sonnet) → Linear bookkeeping → report + playtest ask.

## 5. Architect deliverables (all under `<wt-root>/briefs-vN/`)
- `DIGEST-vN.md`: (a) inventory DELTA — what exists today that these items touch (paths + one line each; point to the previous digest/LANDED instead of repeating); (b) the spec: exact numbers/texts/ids for every change; (c) rulings `<letter>1…` for every rule-touching decision; (d) engine gaps + minimal extensions; (e) ticket candidates + waves with file ownership so parallel tickets never share a file (shared hotspots — count pins, catalogs, balance keys, flow tests — ONE owner per wave); (f) budget arithmetic where balance changes; (g) write-up-only proposals the human asked to "think through"; (h) playtest risks; (i) parking (§3.2).
- `TICKETS.md`: table T# | title (EN) | labels | priority | estimate | model (fable ≤2 / opus / sonnet) | body (fable | opus) | blockedBy | wave | branch slug | files in scope (short). Plus "Open Linear overlap" checked against `LINEAR-OPEN.md` and the count-pin arithmetic lines.
- `T1.md` … `Tn.md`: full bodies per `references/issue-template.md` (Context; Scope with EXACT values in tables; Player-visible outcome; Files in scope — exhaustive; Out of scope; Tests/pins table — each row a test that would fail if the behaviour were wrong; UI-state matrix where states change; Acceptance). Sized for ONE implementer run of the named model. Rule-touching bodies by the architect; mechanical bodies (`body: opus`) by opus writers from the digest.
- `ICONS-vN.md`: manifest for the icons ticket (kind/id | PL name | depiction | style anchor) + attribution / count-pin arithmetic, if any new id needs an icon.
- `NOTES-T<n>.md` where a ticket needs orchestrator-level hints (known pins to move, seams landed elsewhere, fixture-id collision risks, pre-granted mechanical moves).
