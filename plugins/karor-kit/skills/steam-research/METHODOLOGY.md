# steam-research — metodologia i pułapki

Powstało 2026-08-31 przy brainstormie nowego prototypu. Zweryfikowane empirycznie — nie zgaduj, tu jest jak działa naprawdę.

## Źródła danych

- **Gamalytic API** (ilościowe, bez klucza): `https://api.gamalytic.com/steam-games/list?tags=A,B&limit=1000&page=N`
  - `tags` z przecinkiem = AND, dokładne stringi tagów Steama;
  - sort ZAWSZE copiesSold desc — żaden param sortowania nie działa;
  - filtrów dat NIE MA — bucketowanie po `releaseDate` po stronie klienta;
  - `limit` capowany do 1000, `page` od 0, `total` = liczba gier z tagiem all-time;
  - `/game/{id}` wymaga płatnego klucza — nie używać;
  - `releaseDate` dla gier EA = start EA; gry niewydane mają placeholderowe daty (lata ~30000) — odrzucać po fladze `unreleased`.
- **Oficjalne recenzje Steam**: `https://store.steampowered.com/appreviews/{id}?json=1&num_per_page=0&language=all&purchase_type=all` → `query_summary`. Weryfikacja nazwy: `https://store.steampowered.com/api/appdetails?appids={id}&filters=basic`. ~1 req/s.
- **SteamSpy** (zapas): `https://steamspy.com/api.php?request=tag&tag=X` — widełki właścicieli.

## Pułapki

- **Tag "Roguelite" to śmietnik** (GTA IV, kręgle) — prawdziwy tag: `Rogue-lite`. Tagi są crowd-sourcowane: "Auto Battler" łapie idle/gacha, "Metroidvania" łapie roguelity.
- **Boxleiter**: sprzedaż ≈ recenzje × 30-40 (skrypty używają 35). Dla tanich viralowych gier Gamalytic pokazuje do 2× więcej — zawsze widełki, porównania tylko względne.
- **Mediany z partial pulls** (tag > pobrane strony) są zawyżone — liczone z topu; flaga `medianNote` w wynikach.
- **"Heat"** = suma copiesSold top 10 premier z okna `minYear`+ w tagu: miara koncentracji szczytu, nie wielkości rynku.
- **Hit rate'y per gatunek** (np. ~5% deckbuilderów z 1000+ recenzji) pochodzą wyłącznie od Zukowskiego — niezależna weryfikacja (2026-08) nie znalazła potwierdzenia, a agregatory cytują go bez atrybucji. Flagować jako jedno źródło.

## Układ danych w repo

```
data/steam-market/
├── snapshots/            # gamalytic-YYYY-MM-DD.json, reviews-YYYY-MM-DD.json (GHA, co tydzień)
├── reports/              # weekly-*.md, longterm-*.md + latest-weekly.md, latest-longterm.md
├── latest-gamalytic.json # kopia ostatniego snapshotu
├── latest-reviews.json
└── PRESENTATION.md       # URL artefaktu "Radar Steama"
```

Skrypty piszą do `STEAM_RESEARCH_OUT` (GHA ustawia `data/steam-market`). Snapshoty się akumulują — to celowe: velocity recenzji i trendy długoterminowe liczą się z serii.
