---
name: steam-research
description: Market research Steama na dwóch horyzontach — raport tygodniowy (co się rusza) i długoterminowy (trendy 1-2 lat, kohorty) z cotygodniowych snapshotów GHA + analiza ad-hoc i aktualizacja prezentacji. Use when user says "steam research", "odśwież research rynku", "co się sprzedaje", "trendy steama", or before choosing/validating a new game project.
---

# steam-research

Powtarzalny research rynkowy Steama. Dane zbiera **GitHub Actions w repo kitu co poniedziałek 06:00 UTC** i commituje do `data/steam-market/` (snapshoty JSON + dwa raporty markdown). Ten skill konsumuje te dane, dokłada research jakościowy i aktualizuje prezentację.

Dwa horyzonty — **oba tak samo ważne, nie mieszać ich**:
- **Tygodniowy** (`reports/latest-weekly.md`) — delta snapshot vs snapshot: tempo sprzedaży komparatorów (velocity recenzji), nowe premiery w niszach, ruchy w topach. Odpowiada na "czy coś się zmienia TERAZ".
- **Długoterminowy** (`reports/latest-longterm.md`) — kohorty roczne, tempo zalewu nisz, fale gatunkowe, velocity w czasie (bogatszy z każdym tygodniem akumulacji). Odpowiada na "dokąd to płynie w skali 1-2 lat".

## Kroki

1. **Dociągnij raporty z repo kitu** (główne źródło — nie rób pełnego pulla bez potrzeby):
   `gh api repos/karolkrzych/karor-kit/contents/data/steam-market/reports/latest-weekly.md -H "Accept: application/vnd.github.raw"` (analogicznie `latest-longterm.md`). Lokalny klon kitu też jest OK, po `git pull`.

2. **Ad-hoc pełny pull** — tylko gdy potrzeba świeższych danych niż ostatni snapshot albo nowych tagów/gier:
   ```
   $env:STEAM_RESEARCH_OUT="<katalog-wyjściowy>"
   node ${CLAUDE_PLUGIN_ROOT}/skills/steam-research/scripts/pull-gamalytic.mjs
   node ${CLAUDE_PLUGIN_ROOT}/skills/steam-research/scripts/pull-reviews.mjs
   node ${CLAUDE_PLUGIN_ROOT}/skills/steam-research/scripts/compare-weekly.mjs
   node ${CLAUDE_PLUGIN_ROOT}/skills/steam-research/scripts/analyze-longterm.mjs
   ```
   Nowe klastry tagów / komparatory → edycja `scripts/config.json` przez PR do kitu (wtedy GHA śledzi je co tydzień).

3. **Research jakościowy** — subagenci na Sonnecie (nie w main context): hit rate'y i trendy (Zukowski TYLKO krzyżowo z GameDiscoverCo, VG Insights, Alinea, blogiem Gamalytic — agregatory przepakowują Zukowskiego bez atrybucji, uwaga na cyrkularność), postmortemy i sukcesy małych teamów, głos wydawców. Twarde zasady: każda liczba z URL, "n/a" zamiast zmyślania.

4. **Synteza** — porównaj z poprzednim stanem i wypisz CO SIĘ ZMIENIŁO. Wnioski oddzielnie od danych; preferencje devów są filtrem, dane tłem.

5. **Prezentacja** — artefakt "Radar Steama" (URL w `data/steam-market/PRESENTATION.md` w repo kitu). Aktualizować TEN artefakt: przeczytać (`action: "read"`), publikować z `url`. Nie tworzyć nowego.

## Zasady

- Szacunki sprzedaży zawsze jako widełki (Gamalytic copiesSold vs recenzje×35 różnią się do 2×), nigdy jako twarda liczba.
- Pułapki API i metodologia: `METHODOLOGY.md` obok tego pliku — przeczytaj zanim ruszysz skrypty.
- Kadencja automatu: raz w tygodniu przez GHA. Ręczne odświeżenie artefaktu — na żądanie.
