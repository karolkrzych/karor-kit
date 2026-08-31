# karor-kit

Wspólna paczka (plugin Claude Code) dla dwóch devów robiących po godzinach małe gry w Godocie z ciężkim wsparciem AI. Jedno źródło skilli, zasad workflow i konfiguracji MCP — zamiast kopiować to samo w każdym repo z osobna. Dystrybucja odbywa się przez ten marketplace: to repo jest jednocześnie marketplace'em Claude Code i zawiera jedyny plugin, który ten marketplace udostępnia.

## Co jest w paczce

| Skill | Co robi |
|---|---|
| `kit-check` | Smoke test instalacji — potwierdza, że plugin działa, i wypisuje jego zawartość. |
| `create-issue` | Jeden dopracowany ticket do Lineara, wg szablonu. |
| `refinement` | Ściana tekstu (transkrypt/notatki) → zweryfikowane tickety, z bramką akceptacji człowieka. |
| `grill` | Bezlitosne przepytywanie z pomysłu/ticketu aż będzie implementowalny; decyzje lądują w `docs/`. |
| `implement` | Dispatch ticketu do subagenta-implementera + review diffa + domknięcie w Linear. |
| `project-init` | Bootstrap nowego repo gry pod konwencje kitu (CLAUDE.md, docs/, Godot, gdUnit4, Linear). |
| `retro` | Tarcia z projektu → najmniejsze możliwe zmiany kitu (jedyna ścieżka rozwoju paczki). |
| `steam-research` | Market research Steama: cotygodniowe snapshoty (GHA) → raport tygodniowy + długoterminowy; analiza ad-hoc i prezentacja. |

Poza skillami:

- Agent `implementer` — Sonnet, przycięte narzędzia, zero MCP. Brief, który dostaje, musi być samowystarczalny.
- `data/steam-market/` — snapshoty i raporty market researchu, commitowane co poniedziałek przez GHA (`.github/workflows/steam-research.yml`). Konsumuje je skill `steam-research`.
- `references/issue-template.md` — source of truth formatu ticketów, czytany przez skille wprost.
- `templates/CLAUDE.base.md` — żelazne zasady kopiowane verbatim do każdego repo gry.
- Serwer MCP `linear` — oficjalny, OAuth.

## Instalacja

```
/plugin marketplace add karolkrzych/karor-kit
/plugin install karor-kit@karor-kit
```

Serwer MCP `linear` wymaga jednorazowej autoryzacji OAuth na własne konto Linear: `/mcp` → `linear` → `Authenticate`.

Weryfikacja instalacji: `/karor-kit:kit-check`. Jeśli skill niewidoczny — zrestartuj sesję.

## Aktualizacja

Nowe wersje kitu nie przychodzą same — auto-update dla marketplace'ów spoza Anthropica jest domyślnie wyłączony. Żeby dociągnąć nową wersję:

```
/plugin marketplace update karor-kit
/plugin update karor-kit@karor-kit
/reload-plugins
```

`/reload-plugins` ładuje nową wersję w bieżącej sesji — bez tego wejdzie dopiero od następnej. Alternatywnie można włączyć auto-update: `/plugin` → zakładka Marketplaces → `karor-kit` → Enable auto-update (wtedy nowe wersje dociągają się na starcie sesji, a Claude podpowie `/reload-plugins`).

## Jak pracujemy

1. **Nowa gra**: `/karor-kit:project-init` — stawia repo, testy, tracer bullet w Linearze.
2. **Planowanie**:
   - `/karor-kit:refinement` — materiał ze spotkania → tickety.
   - `/karor-kit:grill` — dogadanie jednego pomysłu/ticketu.
   - `/karor-kit:create-issue` — pojedynczy task z rozmowy.

   Nic nie trafia do Lineara bez ludzkiego klepnięcia.
3. **Implementacja**: `/karor-kit:implement KAR-12` (opcjonalnie model: `/karor-kit:implement KAR-12 opus`) — orchestrator dispatchuje, robi review diffa, nie pisze kodu sam.
4. **Po mini-projekcie**: `/karor-kit:retro` — z tarć powstają zmiany kitu (max 3 na retro).

### Konwencje ticketów

Skrót z `plugins/karor-kit/references/issue-template.md` — tam pełne detale.

- Estimate 1–3 (coś na 5+ → split).
- Labele: `content` | `system` | `ui` | `tooling` | `bug` | `docs`.
- Label modelu: `m:sonnet` | `m:opus` | `m:fable`.
- Flow: Backlog → Todo → In Progress → In Review → Done.
- Litmus test: implementer bez kontekstu rozmowy musi domknąć ticket bez ani jednego pytania.

## Rozwój kitu

Zmiany w kicie wchodzą wyłącznie przez skill `retro`. Testujemy lokalnie przed pushem: sklonuj repo i dodaj jako marketplace ze ścieżki lokalnej —

```
/plugin marketplace add <ścieżka-do-sklonowanego-repo>
```

Przy każdej zmianie paczki bumpujemy `version` w `plugins/karor-kit/.claude-plugin/plugin.json`.

## Struktura

```
karor-kit/
├── .claude-plugin/
│   └── marketplace.json       # manifest marketplace'u
├── plugins/
│   └── karor-kit/
│       ├── .claude-plugin/
│       │   └── plugin.json    # manifest pluginu
│       ├── .mcp.json          # konfiguracja MCP (linear)
│       ├── skills/            # 7 skilli: kit-check, create-issue, refinement,
│       │                      # grill, implement, project-init, retro
│       ├── agents/            # implementer
│       ├── references/        # issue-template.md
│       └── templates/         # CLAUDE.base.md
└── README.md
```
