---
name: kit-check
description: Smoke test kitu — potwierdza, że plugin karor-kit jest załadowany, wypisuje wersję i zawartość paczki. Użyj gdy użytkownik chce sprawdzić, czy kit działa.
---

# kit-check

Smoke test pluginu `karor-kit`. Sam fakt, że ten skill się załadował, jest już dowodem, że plugin działa.

Wykonaj po kolei:

1. **Potwierdź**, że skill się załadował — napisz krótko, że kit działa.
2. **Wersja pluginu** — spróbuj odczytać `${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json` i wypisać z niego pole `version`. Jeśli zmienna `CLAUDE_PLUGIN_ROOT` nie rozwiązuje się do realnej ścieżki, po prostu napisz, że zmienna nie była ustawiona — to nie jest błąd, bo samo załadowanie się skilla już potwierdza, że plugin działa.
3. **Zawartość kitu** — wypisz krótko, co plugin obecnie zawiera:
   - skille: `kit-check`
   - serwery MCP: `linear`
4. **Widoczność narzędzi MCP** — sprawdź, czy w bieżącej sesji widoczne są jakiekolwiek narzędzia pasujące do `mcp__linear__*` lub `mcp__plugin_karor-kit_linear__*`. Zgłoś tylko wynik tak/nie — nie wywołuj tych narzędzi.
