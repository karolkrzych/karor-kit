---
name: project-init
description: Bootstrap new game repo wired into kit. Use on new game/prototype, "init project", "nowy projekt", "postaw repo pod grę", or empty repo needing kit conventions. Handles CLAUDE.md, docs, tests, Godot skeleton, Linear wiring.
---

# Project init

Empty dir -> kit-compliant repo. Ask once: slug + 1-line pitch. Show plan as short list, get OK, execute.

Output style: Be extremely concise. Sacrifice grammar for the sake of concision. Plan list -> silent work -> finish report.

1. **Skeleton**: `git init` (branch `main`), Godot `.gitignore`, layout:
   `CLAUDE.md` | `docs/` (`plan.md` seeded from pitch, `decisions.md` empty; `adr/` lazy) | `game/` (`project.godot`, `sim/` logic, `scenes/` presentation) | `tests/`
2. **CLAUDE.md**: copy `${CLAUDE_PLUGIN_ROOT}/templates/CLAUDE.base.md` VERBATIM (iron rules never edited per-project) + append project section: name, pitch, test command, dir map, Linear URL. Whole file = one screen-scroll; fat knowledge -> `docs/`.
3. **Godot + tests**: minimal `project.godot` (2D defaults) if absent. Install gdUnit4 into `addons/` — the ONE sanctioned dep (rest still needs approval, hard rule 4). Trivial smoke test, verify green headless. Record exact test command in CLAUDE.md (`implement` briefs quote it).
4. **Linear** (confirm before creating): project named after slug (ask team/initiative if ambiguous). First issue per `${CLAUDE_PLUGIN_ROOT}/references/issue-template.md`: tracer bullet — smallest end-to-end change proving the loop ("square moves with arrows; test asserts position changes"). Status Todo. URLs into CLAUDE.md + plan.md.
5. **Report**: created what, test command, tracer id, literal next step: `/karor-kit:implement <tracer-id>`.

Rules: non-empty repo -> list existing, create missing only, never overwrite CLAUDE.md/docs without approval. No game code beyond smoke scaffold — init builds track, not train. Identifiers/headers EN; pitch stays in user's language.
