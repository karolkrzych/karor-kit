export const meta = {
  name: 'kit-workflow-runner',
  description: 'Run the waves of one batch sequentially: prep worktrees -> wave.js (implement/review/fix/land) -> bookkeeping (LANDED.md, LEDGER.md, Linear); stop at the first wave with a non-landed ticket',
  phases: [
    { title: 'Prep', detail: 'pull main, cut worktree + branch per ticket of the wave' },
    { title: 'Bookkeeping', detail: 'LANDED.md section, LEDGER.md row, Linear comment + Done per landed ticket' },
  ],
}

// Outer runner of the `workflow` skill. args: {
//   wave_script: '<scratchpad>/wave.js', waves: [[{ id, title, wt, branch, brief, model, note?, review_model? }], ...],
//   label: 'batch v6', date: '2026-09-06', noise?: 'game/addons game/assets game/project.godot',
//   ...every wave.js arg (landing, repo, gh_repo, briefs, scratch, godot, session, digest, spec, rulings, coauthor) — passed through unchanged
// }
// Resume after a stop: Workflow({ scriptPath, resumeFromRunId }) with IDENTICAL args (edit only the ticket entries that must re-run: resume_findings / resume_review / note).
const MAIN_REPO = args.repo
const BRIEFS = args.briefs
const LABEL = args.label || 'batch'
const DATE = args.date || '(date)'
const NOISE = args.noise || 'game/addons game/assets game/project.godot'

const parseJson = (v) => {
  if (v == null) return null
  if (typeof v !== 'string') return v
  let t = v.trim()
  const a = t.indexOf('{'), b = t.lastIndexOf('}')
  if (a >= 0 && b > a) t = t.slice(a, b + 1)
  try { return JSON.parse(t) } catch (e) { return { status: 'unparseable', raw: v.slice(0, 2000) } }
}

const prepPrompt = (wave, label) => `Git prep for ${LABEL} wave ${label} in the repo ${MAIN_REPO} (Git Bash). Never rebase / reset --hard / force-push / --no-verify; never commit anything.
1. cd "${MAIN_REPO}" && git checkout -- ${NOISE} 2>/dev/null; git status --porcelain | grep -v '\\.import$' (must be empty; if not, report status "dirty" with the lines and stop) && git pull --ff-only origin main && git rev-parse --short HEAD
2. For each ticket below: if the worktree dir already exists, run git -C <wt> status --porcelain and git -C <wt> branch --show-current and report them (do not recreate); else: git -C "${MAIN_REPO}" worktree add -b <branch> <wt> main
${wave.map(t => `   - ${t.id}: wt=${t.wt} branch=${t.branch}`).join('\n')}
3. Baseline: read the last table row of ${BRIEFS}/LEDGER.md (column "suite", e.g. "40/806") — if the table has no rows, read the baseline line of ${BRIEFS}/COMMON.md's last "Batch" section.
Return ONLY JSON: {"status":"ok"|"dirty"|"failed","main_sha":"","baseline":"NN suites / NNN tests","worktrees":[{"id":"","created":true|false,"branch":"","dirty":""}],"error":""}`

const bookPrompt = (wave, res, label) => {
  const per = wave.map(t => {
    const r = (res || []).find(x => x && x.ticket === t.id) || null
    const slim = r ? { verdict: r.verdict, report: r.report, fix: r.fix, still_blocking: r.still_blocking, landing: r.landing, merge: r.merge } : null
    return `### ${t.id} — ${t.title}\nbranch ${t.branch}, worktree ${t.wt}, model ${t.model}, brief ${t.brief}\n` + JSON.stringify(slim).slice(0, 9000)
  }).join('\n\n')
  return `Bookkeeping for ${LABEL} wave ${label}. Load the Linear MCP tools via ToolSearch ("select:mcp__plugin_karor-kit_linear__save_issue,mcp__plugin_karor-kit_linear__save_comment,mcp__plugin_karor-kit_linear__get_issue"). Work in Git Bash; write files with LF endings, UTF-8; never touch git state.
For EVERY ticket below whose landing.status is "landed":
1. Append a section to ${BRIEFS}/LANDED.md (read it first; match the style of its existing sections; do not duplicate a section): heading "## <id> — <title> (landed ${DATE}, PR #N, main <main_sha_after short>, <suites>/<cases>)", then "New seams/API:" (public functions/fields/signals/enums added or changed, with signatures — from the implementer report's changed files + surprises; if the report is thin, run git -C <wt> diff main...HEAD --stat and git log main..HEAD --format=%B and read the diff of sim files to list the seams accurately), "Content:" (new ids, Balance keys, pins moved with old → new), "Surprises:", "Implications for later tickets:".
2. Append a row to ${BRIEFS}/LEDGER.md (create the table header "| ticket | PR | main | suite | cost | models | notes |" if the file is empty): | <id> | #<pr> | <main short sha> | <suites>/<cases> | — | <model> impl, <review model> review | <one-line note: fix round yes/no, integrate step yes/no, notable surprise> |
3. Linear: comment on the issue <id> with 1–2 lines + the PR url, then set its state to Done.
For every ticket NOT landed: Linear comment on <id> with the blocker (verdict + the first blocking finding or the landing error, quoted briefly), leave its state as is; no LANDED.md section; LEDGER row with "NOT LANDED" in the notes.

${per}

Return ONLY JSON: {"landed":["id"],"not_landed":["id"],"landed_md_sections":N,"ledger_rows":N,"linear":["id: comment+Done"|"id: comment only"],"problems":[]}`
}

const shared = Object.assign({}, args)
delete shared.waves; delete shared.wave_script; delete shared.label; delete shared.date

const out = []
for (let i = 0; i < args.waves.length; i++) {
  const wave = args.waves[i]
  const label = `W${i + 1}`
  log(`${label}: ${wave.map(t => t.id).join(', ')}`)
  const prep = parseJson(await agent(prepPrompt(wave, label), { label: `prep:${label}`, phase: 'Prep', model: 'sonnet', effort: 'low' }))
  if (!prep || prep.status !== 'ok') { out.push({ wave: label, status: 'prep_failed', prep }); log(`${label}: prep failed — stopping`); break }
  let res = null
  try {
    res = await workflow({ scriptPath: args.wave_script }, Object.assign({}, shared, { tickets: wave, baseline: prep.baseline }))
  } catch (e) {
    out.push({ wave: label, status: 'wave_error', error: String(e && e.message || e), prep }); log(`${label}: wave error ${String(e && e.message || e).slice(0, 200)} — stopping`); break
  }
  const landed = wave.filter(t => (res || []).find(r => r && r.ticket === t.id && r.landing && r.landing.status === 'landed'))
  const notLanded = wave.filter(t => !landed.includes(t))
  const book = parseJson(await agent(bookPrompt(wave, res, label), { label: `book:${label}`, phase: 'Bookkeeping', model: 'sonnet', effort: 'low' }))
  out.push({ wave: label, status: notLanded.length ? 'partial' : 'landed', landed: landed.map(t => t.id), not_landed: notLanded.map(t => t.id), tickets: res, book, main_sha_before: prep.main_sha })
  if (notLanded.length) { log(`${label}: not landed: ${notLanded.map(t => t.id).join(', ')} — stopping before the next wave`); break }
}
return out
