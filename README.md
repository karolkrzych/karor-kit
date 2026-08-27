# karor-kit

Wspólna paczka (plugin Claude Code) dla dwóch devów robiących po godzinach małe gry w Godocie z ciężkim wsparciem AI. Jedno źródło skilli, zasad workflow i konfiguracji MCP — zamiast kopiować to samo w każdym repo z osobna. Dystrybucja odbywa się przez ten marketplace: to repo jest jednocześnie marketplace'em Claude Code i zawiera jedyny plugin, który ten marketplace udostępnia.

## Instalacja

```
/plugin marketplace add karolkrzych/karor-kit
/plugin install karor-kit@karor-kit
```

Po instalacji serwer MCP `linear` wymaga jednorazowej autoryzacji OAuth — uruchom `/mcp`, wybierz `linear` i zatwierdź `Authenticate`.

## Rozwój i testowanie lokalne

Sklonuj repo, a potem dodaj je jako lokalny marketplace zamiast wersji z GitHuba:

```
/plugin marketplace add ./ścieżka/do/karor-kit
```

Zainstaluj plugin z tego lokalnego marketplace'u tak samo jak wyżej. Zmiany testujemy lokalnie, zanim trafią na push.

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
│       └── skills/
│           └── kit-check/     # smoke test pluginu
└── README.md
```

## Roadmapa

- Skill `refinement` — wspólny proces dopracowywania ticketów.
- Skill `retro` — wspólny format retrospektyw.
- Szablony subagentów, w tym scoped Linear MCP per agent.
- Bazowy szablon `CLAUDE.md` dla projektów gier.
