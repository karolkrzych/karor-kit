---
name: project-init
description: Bootstrap new game repo wired into kit. Use on new game/prototype, "init project", "nowy projekt", "postaw repo pod grę", or empty repo needing kit conventions. Handles CLAUDE.md, docs, tests, Godot skeleton, Linear wiring.
---

# Project init

Empty dir -> kit-compliant repo. Ask once: slug + 1-line pitch. Show plan as short list —
GitHub repo (private) + Linear project both on it — get one OK, execute.

Output style: Be extremely concise. Sacrifice grammar for the sake of concision. Plan list -> silent work -> finish report.

1. **Skeleton**: `git init` (branch `main`), Godot `.gitignore`, layout:
   `CLAUDE.md` | `docs/` (`plan.md` seeded from pitch — tunable-numbers game -> MVP includes
   standard ticket "live balance-tuning panel"; z-garden skipped it, paid for it later as
   KAR-35/42 plus two rework tickets; `decisions.md` empty; `adr/` lazy) | `game/` (`project.godot`,
   `sim/` logic, `scenes/` presentation, `tests/`). Tests INSIDE `game/` — Godot resolves only
   `res://`. First commit, then GitHub repo: `gh repo create <slug> --private --source=. --push`
   — private DEFAULT, public only if the user explicitly asks.
2. **CLAUDE.md**: copy `${CLAUDE_PLUGIN_ROOT}/templates/CLAUDE.base.md` VERBATIM (iron rules never edited per-project) + append project section: name, pitch, test command, dir map, Linear URL. Whole file = one screen-scroll; fat knowledge -> `docs/`.
3. **Godot + tests**: minimal `project.godot` (2D defaults) if absent. Install gdUnit4 into `game/addons/` — the ONE sanctioned dep (rest still needs approval, hard rule 4). Vendor runtime only: sparse-checkout EXCLUDING upstream `test/` (full clone dies on Windows MAX_PATH: "Filename too long"). Trivial smoke test, verify green headless — CLI requires `--ignoreHeadlessMode` (else "Headless mode is not supported!", exit 103). Record in CLAUDE.md, side by side: import step `godot --headless --path game --import` (run after ANY change to the global `class_name` set — fresh checkout, merge; cache lives in gitignored `.godot/`) + exact test command (`implement` briefs quote both).
4. **Infra defaults**: persistence (save, settings) behind an injectable path seam from the FIRST
   commit — parallel worktrees share `user://` keyed by project name, not repo path; tests use
   isolated paths, never the shared one. Tests deterministic — no assertions on timing/wall-clock.
   Incidents: z-garden KAR-51 (flaky tests from shared state), KAR-52 (retrofit still stuck in
   Backlog months later — bake it in now, don't retrofit).
5. **Linear** (covered by the up-front plan OK, no second confirm): project named after slug (ask team/initiative if ambiguous). First issue per `${CLAUDE_PLUGIN_ROOT}/references/issue-template.md`: tracer bullet — smallest end-to-end change proving the loop ("square moves with arrows; test asserts position changes"). Status Todo. URLs into CLAUDE.md + plan.md.
6. **Report**: created what, test command, tracer id, literal next step: `/karor-kit:implement <tracer-id>`.

Rules: non-empty repo -> list existing, create missing only, never overwrite CLAUDE.md/docs without approval. No game code beyond smoke scaffold — init builds track, not train. Identifiers/headers EN; pitch stays in user's language.
