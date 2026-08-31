#!/usr/bin/env node
// steam-research — oficjalne liczniki recenzji Steam dla listy komparatorów.
// Szacunek sprzedaży: heurystyka Boxleitera (recenzje × 35, realny zakres 30-40) —
// do porównań WZGLĘDNYCH, nie twarda liczba. Detale: ../METHODOLOGY.md.
//
// Użycie: node pull-reviews.mjs [--limit N]
//   Wyjście: $STEAM_RESEARCH_OUT (default ./steam-research-out):
//     snapshots/reviews-YYYY-MM-DD.json + latest-reviews.json

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = process.env.STEAM_RESEARCH_OUT || join(process.cwd(), 'steam-research-out');
const cfg = JSON.parse(readFileSync(join(ROOT, 'config.json'), 'utf8'));
const BOXLEITER = 35;
const SLEEP_MS = 1200;

const limitArg = process.argv.indexOf('--limit');
const limit = limitArg > -1 ? Number(process.argv[limitArg + 1]) : Infinity;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} dla ${url}`);
  return res.json();
}

async function main() {
  const rows = [];
  for (const { name, appid } of cfg.comparables.slice(0, limit)) {
    try {
      const details = await getJson(
        `https://store.steampowered.com/api/appdetails?appids=${appid}&filters=basic`
      );
      const storeName = details?.[appid]?.data?.name ?? null;
      const verified =
        storeName != null &&
        (norm(storeName).includes(norm(name)) || norm(name).includes(norm(storeName)));
      await sleep(SLEEP_MS);

      const reviews = await getJson(
        `https://store.steampowered.com/appreviews/${appid}?json=1&num_per_page=0&language=all&purchase_type=all`
      );
      const q = reviews?.query_summary ?? {};
      rows.push({
        name,
        appid,
        storeName,
        verified,
        totalReviews: q.total_reviews ?? null,
        positivePct: q.total_reviews
          ? Math.round((q.total_positive / q.total_reviews) * 1000) / 10
          : null,
        estSales: q.total_reviews ? q.total_reviews * BOXLEITER : null,
        scoreDesc: q.review_score_desc ?? null,
      });
      console.error(`${verified ? 'ok ' : '⚠️ '} ${name} (${appid}): ${q.total_reviews} recenzji`);
    } catch (e) {
      rows.push({ name, appid, error: String(e) });
      console.error(`błąd ${name} (${appid}): ${e}`);
    }
    await sleep(SLEEP_MS);
  }

  const out = { generatedAt: new Date().toISOString(), boxleiterFactor: BOXLEITER, games: rows };
  const snapDir = join(OUT, 'snapshots');
  mkdirSync(snapDir, { recursive: true });
  const stamp = out.generatedAt.slice(0, 10);
  const file = join(snapDir, `reviews-${stamp}.json`);
  writeFileSync(file, JSON.stringify(out, null, 2));
  if (limit === Infinity) writeFileSync(join(OUT, 'latest-reviews.json'), JSON.stringify(out, null, 2));
  console.error(`zapisano: ${file}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
