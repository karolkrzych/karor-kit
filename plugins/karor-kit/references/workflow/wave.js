export const meta = {
  name: 'kit-workflow-wave',
  description: 'Implement, review (one skeptic), fix once and land one or more tickets given via args; landing serialized on main',
  phases: [
    { title: 'Implement', detail: 'one implementer per ticket in its worktree' },
    { title: 'Review', detail: 'one skeptic per ticket (scope + tests + refute)' },
    { title: 'Fix', detail: 'one fix round when blocking findings' },
    { title: 'Land', detail: 'push, PR, trial merge in the landing worktree, suite, ff main, push' },
  ],
}

// Runner of the `workflow` skill (inner script; `runner.js` calls it per wave). Copy to the scratchpad; NEVER edit paths into it — everything comes via args:
// args: {
//   tickets: [{ id, title, wt, branch, brief, model, review_model?, note?, resume_findings?, resume_review?, resume_note? }],
//   baseline: '40 suites / 910 tests', landing: '<landing worktree>', repo: '<main checkout>', gh_repo: 'owner/name',
//   briefs: '<briefs dir>', scratch: '<scratchpad dir>', godot: '<Godot console exe, Bash path>', session: '<Claude session URL>',
//   digest: 'DIGEST-vN.md', spec: 'docs/design.md', rulings: '<one line: which rulings apply>', coauthor?: 'Claude … <noreply@anthropic.com>',
//   noise: 'game/addons game/assets game/project.godot'   // import-churn paths reverted before commits
// }
const SCRATCH = args.scratch
const MAIN_REPO = args.repo
const GH_REPO = args.gh_repo
const GH_OWNER = GH_REPO.split('/')[0]
const LANDING_WT = args.landing
const BRIEFS = args.briefs
const GODOT_BASH = `"${args.godot}"`
const SESSION = args.session
const COAUTHOR = args.coauthor || 'Claude Fable 5.1 <noreply@anthropic.com>'
const DIGEST = args.digest || 'DIGEST.md'
const SPEC = args.spec || 'docs/design.md'
const RULINGS = args.rulings || `${DIGEST} holds this batch's rulings; older rulings live in ${SPEC}`
const NOISE = args.noise || 'game/addons game/assets game/project.godot'
const TICKETS = args.tickets
const BASELINE = args.baseline || '(see main)'

const TEST_CMD = (wt) => `cd "${wt}" && ${GODOT_BASH} --headless --path game --import 2>&1 | tail -3 ; cd "${wt}" && ${GODOT_BASH} --headless --path game -s res://addons/gdUnit4/bin/GdUnitCmdTool.gd -a res://tests --ignoreHeadlessMode 2>&1 | grep -E "Overall Summary|Executed test|FAILED|failures|error|orphan" | tail -20`

const parseJson = (v) => {
  if (v == null) return null
  if (typeof v !== 'string') return v
  let t = v.trim()
  const a = t.indexOf('{'), b = t.lastIndexOf('}')
  if (a >= 0 && b > a) t = t.slice(a, b + 1)
  try { return JSON.parse(t) } catch (e) { return { status: 'unparseable', raw: v.slice(0, 2000) } }
}

const RULES = `HARD RULES (repo CLAUDE.md, non-negotiable):
1. Sim ≠ presentation: game/sim/** never imports scenes/UI; scenes call sim, never the reverse. 7. Presentation never recomputes rules (sim signals carry resolved values).
2. Tests gate everything: no green gdUnit4 = not done. Deterministic tests, zero timing/wall-clock assertions. Tests never write to shared user://.
3. Scope is law: touch ONLY files listed in the ticket's "Files in scope". Need another file -> STOP and report it as "open" instead of editing it.
4. No new deps/addons/plugins.
5. One branch per task (already created for you). Commit messages in English, prefixed "<ID>: ...", each ending with the trailer lines:
Co-Authored-By: ${COAUTHOR}
Claude-Session: ${SESSION}
6. Don't guess: ambiguity -> stop and report as "open" with your best-guess default clearly marked. Never skip hooks (--no-verify) or signing.
Node lifecycle in scenes/tests: never free() a node from inside its own signal handler; gdUnit4 fails the whole run on orphan nodes (Exit code 101).
Godot line endings: repo files may be CRLF on checkout; do not write raw multi-line string literals in tests that depend on newlines — use "\\n" escapes.
The --import step may rewrite tracked *.import files (line endings) and reorder project.godot: NEVER commit that churn; run "git checkout -- ${NOISE}" before committing if it shows up in git status (keep only the new .svg + .svg.import files your ticket adds on purpose).`

const implementerPrompt = (t) => `You are the implementer for Linear ticket ${t.id} "${t.title}" in the Godot 4 GDScript project at ${MAIN_REPO}.

WORKTREE (your only working directory; it is a git worktree on branch ${t.branch}, see NOTE): ${t.wt}
NOTE: ${t.note || "freshly cut from main"}
Do NOT touch ${MAIN_REPO} or any other worktree.

STEP 0: Read the full ticket body: ${t.brief} (authoritative brief). Read ${BRIEFS}/COMMON.md (house conventions, test commands, git protocol — mandatory), the repo CLAUDE.md at ${t.wt}/CLAUDE.md, and every ${SPEC} section the ticket names (the spec is the source of truth; ticket-vs-spec contradiction = stop and report). Also read ${BRIEFS}/${DIGEST} (${RULINGS}): on a ticket-vs-digest conflict the DIGEST wins. Read ${BRIEFS}/LANDED.md (what landed earlier in this batch) and, if it exists, the orchestrator notes file named in NOTE. Line numbers in the ticket may be stale (earlier tickets landed since) — locate by symbol/test name. Then read every file the ticket names before editing.

${RULES}

TEST COMMAND (Git Bash; run the import step first, then the suite):
${TEST_CMD(t.wt)}
Baseline on main when this branch was cut: ${BASELINE} green. RUN THE SUITE FIRST on the clean checkout to see the baseline in your worktree. Your branch must end green with the ticket's new tests included. When the ticket says a seeded trajectory pin must be RE-DERIVED BY RUNNING, run the suite, read the actual values from the failure output, update the pin, and record old->new in your report with the reason.

WORKFLOW: implement per the ticket's Scope sections in order; write tests for every row of the ticket's edge-case/flow tables; run the suite until green; update docs listed in scope; commit in a few logical commits (git add only files in scope; check "git status" for strays). Do NOT push (the lander does). Do NOT open a PR.

Your final message IS the report; return ONLY this JSON object (no prose around it):
{"ticket":"${t.id}","status":"done"|"blocked","changed_files":[...],"commits":["<sha> <subject>",...],"tests":{"suites":N,"cases":N,"failures":N,"new_tests":[...]},"moved_pins":[{"file":"","test":"","old":"","new":"","why":""}],"surprises":[...],"open":[...],"out_of_scope_files_needed":[...]}
"blocked" only when a hard rule forces a stop (file outside scope required, ambiguity that changes the design); then leave the worktree committed as far as it got and explain in "open".`

const reviewerPrompt = (t, lens, report) => `You review the branch ${t.branch} for Linear ticket ${t.id} "${t.title}" in worktree ${t.wt} (Godot 4 GDScript, gdUnit4). Read the ticket: ${t.brief}, the conventions ${BRIEFS}/COMMON.md, the repo CLAUDE.md at ${t.wt}/CLAUDE.md, and the ${SPEC} sections the ticket names.
Implementer report: ${JSON.stringify(report)}

Get the diff: cd "${t.wt}" && git diff main...HEAD --stat && git diff main...HEAD
Read whole changed files when the diff is not enough. You MAY run the suite: ${TEST_CMD(t.wt)}

${lens === 'skeptic' ? `LENS = SKEPTIC — you are the SOLE reviewer, so you also own scope and tests. FIRST, with file:line evidence: (1) git diff --name-only main...HEAD vs the ticket's "Files in scope" (plus any scope extension noted in the brief) — any stray file = BLOCKING; (2) hard rules 1/7: no sim->scenes import, no presentation recomputing rules = BLOCKING; no new deps; (3) every row of the ticket's test/edge-case tables has a test that would FAIL if the behaviour were wrong (name it; a missing row = BLOCKING), tests assert exact values, and every moved pin in the report is a mechanical re-derivation (re-run the suite yourself and confirm the numbers); (4) run the FULL suite (import step first) and report exact suites/cases/failures/orphans; (5) commit messages carry the required trailers. THEN your main job: REFUTE the claim "ticket ${t.id} is fully implemented and safe to merge". Go through EVERY acceptance criterion and every row of every table in the ticket and try to find one that is not met, met differently than specified, or met only by a test that does not actually exercise the real path (e.g. a wiring test that bypasses the scene, a real-mouse test that clicks a seam instead of the real control). Also try to find a regression: behaviours the ticket says must stay unchanged — verify by reading code and running the suite. Default to "refuted" (= NOT mergeable) when uncertain, but every refutation needs concrete evidence (file:line, test name, command output).` : ''}

Return ONLY this JSON: {"lens":"${lens}","verdict":"ok"|"blocking","findings":[{"severity":"blocking"|"minor","file":"","line":N,"summary":"","evidence":"","fix":""}],"suite":{"suites":N,"cases":N,"failures":N}}`

const fixerPrompt = (t, findings) => `You are the implementer for Linear ticket ${t.id} "${t.title}" doing a FIX ROUND on branch ${t.branch} in worktree ${t.wt}. Ticket: ${t.brief}. Repo rules: ${t.wt}/CLAUDE.md.
${RULES}
Reviewers found these BLOCKING issues (fix every one; minor ones too when cheap):
${JSON.stringify(findings, null, 2)}
Apply the fixes, keep the scope (only files in the ticket's "Files in scope"), run the full suite until green: ${TEST_CMD(t.wt)}
Commit with message "${t.id}: address review findings" (+ required trailers). Do not push.
Return ONLY JSON: {"ticket":"${t.id}","status":"done"|"blocked","fixed":[...],"not_fixed":[{"finding":"","why":""}],"commits":[...],"tests":{"suites":N,"cases":N,"failures":N}}`

const landerPrompt = (t) => `You land branch ${t.branch} (ticket ${t.id} "${t.title}") into main of ${MAIN_REPO}. Push and merge are authorized by the repo owner's standing instruction to the orchestrator. Do NOT use "gh pr merge" (blocked) — merge locally as described. Never use --no-verify / force-push / reset --hard on main.

Steps (Git Bash; stop and report at the first failure):
1. cd "${t.wt}" && git status --porcelain (must be empty apart from *.import line-ending noise — if only those, run: git checkout -- ${NOISE}; anything else -> report and stop) && git log --oneline main..HEAD
2. git push -u origin ${t.branch}
3. Create the PR. Write the body to a temp file ${SCRATCH}/pr-body-${t.id}.md containing: "Implements ${t.id}." blank line, "Summary of changes:" then one "- <subject>" line per commit (git log --format='%s' main..HEAD, skipping trailer lines), blank line, "🤖 Generated with [Claude Code](https://claude.com/claude-code)", blank line, "${SESSION}". Then: gh pr create --repo ${GH_REPO} --base main --head ${t.branch} --title "${t.id}: ${t.title}" --body-file "${SCRATCH}/pr-body-${t.id}.md". Capture the PR number N from the URL.
4. Trial merge in the landing worktree: cd "${LANDING_WT}" && git fetch origin && git checkout --detach main && git merge --no-ff ${t.branch} -m "Merge pull request #N from ${GH_OWNER}/${t.branch}" (use the real N). If the merge conflicts: git merge --abort, report "conflict" with the conflicting files, stop.
5. Run import + full suite in the landing worktree: ${TEST_CMD(LANDING_WT)}. Red -> report the failing tests verbatim, do NOT touch main, stop. After the run: git -C "${LANDING_WT}" checkout -- ${NOISE} (import noise) so the worktree is clean.
6. Fast-forward main: cd "${MAIN_REPO}" && git merge --ff-only $(git -C "${LANDING_WT}" rev-parse HEAD) && git push origin main
   If the ff-only merge or the push is rejected because main moved meanwhile (another ticket landed): cd "${MAIN_REPO}" && git pull --ff-only origin main, then repeat steps 4-6 ONCE from the new main (new trial merge in the landing worktree, full suite again); if it fails a second time, report status failed with the error.
7. Teardown (ONLY after step 6 succeeded — main contains the merge and is pushed): cd "${MAIN_REPO}" && git worktree remove --force "${t.wt}" && git branch -d ${t.branch} && git worktree prune. The remote branch stays. If removal fails (locked file), report it in "teardown" but keep status "landed".
8. Report.
Return ONLY JSON: {"ticket":"${t.id}","status":"landed"|"failed","pr":N,"pr_url":"","merge_sha":"","main_sha_after":"","suite":{"suites":N,"cases":N,"failures":N},"teardown":"removed"|"<error>","error":""}`

const mergerPrompt = (t, landing) => `You are the implementer for Linear ticket ${t.id} "${t.title}" on branch ${t.branch} in worktree ${t.wt}. Landing this branch into main FAILED: ${JSON.stringify(landing).slice(0, 3000)}. Main moved (other tickets of this batch landed) and your branch must be INTEGRATED with it. Ticket: ${t.brief}; conventions: ${BRIEFS}/COMMON.md; what landed meanwhile: ${BRIEFS}/LANDED.md; repo rules ${t.wt}/CLAUDE.md.
Steps: cd "${t.wt}" && git fetch origin && git merge --no-edit origin/main (a plain merge — NEVER rebase, reset --hard, force-push or --no-verify). Resolve every conflict so that BOTH the landed work and this ticket's work survive (read both sides; for generated pins such as icon counts / balance key counts / catalog lists recompute the union). Then run the import step + FULL suite (${TEST_CMD(t.wt)}); fix semantic breakage caused by the integration (a test of this ticket now failing because main changed a seam, a count pin, a catalog union) — stay inside the ticket's scope plus the files main touched in the conflict; anything else = stop and report. Commit the merge (message "Merge origin/main into ${t.branch}" + the required trailers from COMMON.md) and any fix commit. git status must be clean (apart from *.import noise → git checkout -- ${NOISE}).
Return ONLY JSON: {"ticket":"${t.id}","status":"done"|"blocked","merged_sha":"","suite":{"suites":N,"cases":N,"failures":N},"conflicts":["file"],"fixes":["one line each"],"blocker":""}`

let landChain = Promise.resolve()

const results = await pipeline(
  TICKETS,
  (t) => (t.resume_findings || t.resume_review) ? Promise.resolve(JSON.stringify({ ticket: t.id, status: 'done', resumed: true, note: t.resume_note || '' })) : agent(implementerPrompt(t), { label: `impl:${t.id}`, phase: 'Implement', agentType: 'karor-kit:implementer', model: t.model, effort: 'high' }),
  async (rawReport, t) => {
    const report = parseJson(rawReport)
    if (t.resume_findings) return { t, report, reviews: [], blocking: t.resume_findings, verdict: 'fix' }
    if (!report || report.status !== 'done') return { t, report, verdict: 'blocked', reviews: [] }
    const lenses = ['skeptic']
    const reviews = (await parallel(lenses.map(lens => () =>
      agent(reviewerPrompt(t, lens, report), { label: `review:${lens}:${t.id}`, phase: 'Review', effort: 'medium', model: t.review_model || 'opus' })))).filter(Boolean).map(parseJson)
    const blocking = reviews.flatMap(r => (r.findings || []).filter(f => f.severity === 'blocking'))
    return { t, report, reviews, blocking, verdict: blocking.length ? 'fix' : 'ok' }
  },
  async (stage, t) => {
    if (stage.verdict !== 'fix') return stage
    log(`${t.id}: ${stage.blocking.length} blocking findings -> fix round`)
    const fix = parseJson(await agent(fixerPrompt(t, stage.blocking), { label: `fix:${t.id}`, phase: 'Fix', agentType: 'karor-kit:implementer', model: t.model, effort: 'high' }))
    const relenses = ['skeptic']
    const rereviews = (await parallel(relenses.map(lens => () =>
      agent(reviewerPrompt(t, lens, { ...stage.report, fix_round: fix }), { label: `rereview:${lens}:${t.id}`, phase: 'Fix', effort: 'medium', model: t.review_model || 'opus' })))).filter(Boolean).map(parseJson)
    const still = rereviews.flatMap(r => (r.findings || []).filter(f => f.severity === 'blocking'))
    return { ...stage, fix, rereviews, still_blocking: still, verdict: (fix && fix.status === 'done' && still.length === 0) ? 'ok' : 'failed' }
  },
  async (stage, t) => {
    if (stage.verdict !== 'ok') { log(`${t.id}: NOT landing (verdict=${stage.verdict})`); return { ...stage, landing: null } }
    landChain = landChain.then(async () => {
      let landing = parseJson(await agent(landerPrompt(t), { label: `land:${t.id}`, phase: 'Land', model: 'sonnet', effort: 'medium' }))
      if (landing && landing.status === 'landed') return { landing }
      log(`${t.id}: landing failed (${(landing && landing.error || '').slice(0, 120)}) -> integrate main into branch, retry once`)
      const merge = parseJson(await agent(mergerPrompt(t, landing), { label: `integrate:${t.id}`, phase: 'Land', agentType: 'karor-kit:implementer', model: t.model, effort: 'high' }))
      if (!merge || merge.status !== 'done') return { landing, merge }
      landing = parseJson(await agent(landerPrompt(t), { label: `reland:${t.id}`, phase: 'Land', model: 'sonnet', effort: 'medium' }))
      return { landing, merge }
    })
    const { landing, merge } = await landChain
    return { ...stage, landing, merge }
  },
)

return results.map(r => r && ({ ticket: r.t.id, verdict: r.verdict, report: r.report, reviews: r.reviews, blocking: r.blocking, fix: r.fix, still_blocking: r.still_blocking, landing: r.landing, merge: r.merge }))
