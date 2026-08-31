#!/usr/bin/env node
// steam-research — dane ilościowe z publicznego API Gamalytic.
// Pułapki API opisane w ../METHODOLOGY.md — przeczytaj zanim coś zmienisz.
//
// Użycie: node pull-gamalytic.mjs [--smoke]
//   Wyjście: $STEAM_RESEARCH_OUT (default ./steam-research-out):
//     snapshots/gamalytic-YYYY-MM-DD.json + latest-gamalytic.json
//   --smoke: 1 klaster, 1 strona, bez broad tags — szybki test że API żyje.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = process.env.STEAM_RESEARCH_OUT || join(process.cwd(), 'steam-research-out');
const cfg = JSON.parse(readFileSync(join(ROOT, 'config.json'), 'utf8'));
const API = 'https://api.gamalytic.com/steam-games/list';
const SLEEP_MS = 600;
const MAX_PAGES = 3;
const SMOKE = process.argv.includes('--smoke');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const MAX_SANE_YEAR = new Date().getUTCFullYear() + 1;
// Niewydane gry mają placeholderowe releaseDate (lata typu 30822) — odrzucamy poza zakresem.
const toYear = (ts) => {
  if (!ts) return null;
  const ms = ts > 1e12 ? ts : ts * 1000;
  const y = new Date(ms).getUTCFullYear();
  return y >= 2000 && y <= MAX_SANE_YEAR ? y : null;
};

async function fetchPage(tags, page) {
  const u = new URL(API);
  if (tags?.length) u.searchParams.set('tags', tags.join(','));
  u.searchParams.set('limit', '1000');
  u.searchParams.set('page', String(page));
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(u);
    if (res.status === 429 && attempt <= 5) {
      console.error(`429 na ${u.search}, czekam 30s (próba ${attempt})`);
      await sleep(30_000);
      continue;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status} dla ${u}`);
    return res.json();
  }
}

async function pull(tags, maxPages) {
  const games = [];
  let total = 0;
  for (let p = 0; p < maxPages; p++) {
    const data = await fetchPage(tags, p);
    total = data.total;
    games.push(...data.result);
    if (data.result.length < 1000) break;
    await sleep(SLEEP_MS);
  }
  return { total, games };
}

const slim = (g) => ({
  steamId: g.steamId,
  name: g.name,
  copiesSold: g.copiesSold,
  price: g.price,
  reviewScore: g.reviewScore,
  publisherClass: g.publisherClass,
  year: toYear(g.releaseDate),
});

function summarize(tagNames, total, games) {
  games = games.filter((g) => !g.unreleased);
  const byYear = {};
  for (const g of games) {
    const y = toYear(g.releaseDate);
    if (y) byYear[y] = (byYear[y] || 0) + 1;
  }
  const recent = games
    .filter((g) => (toYear(g.releaseDate) ?? 0) >= cfg.minYear)
    .sort((a, b) => (b.copiesSold ?? 0) - (a.copiesSold ?? 0));
  const heat = recent.slice(0, 10).reduce((s, g) => s + (g.copiesSold ?? 0), 0);
  const mid = recent[Math.floor(recent.length / 2)];
  return {
    tags: tagNames,
    totalAllTime: total,
    pulled: games.length,
    partial: games.length < total,
    releasesPerYear: byYear,
    topRecent: recent.slice(0, 10).map(slim),
    heatTop10Recent: heat,
    medianRecentCopies: mid ? mid.copiesSold : null,
    medianNote: games.length < total
      ? 'mediana z pobranego topu (partial) — realna mediana jest NIŻSZA'
      : 'mediana z pełnego zbioru taga',
  };
}

async function main() {
  const out = {
    generatedAt: new Date().toISOString(),
    minYear: cfg.minYear,
    clusters: {},
    broadTags: {},
    overallTopByYear: {},
  };

  const clusterEntries = Object.entries(cfg.clusters).slice(0, SMOKE ? 1 : Infinity);
  for (const [key, tags] of clusterEntries) {
    console.error(`klaster: ${key} [${tags.join(', ')}]`);
    const { total, games } = await pull(tags, SMOKE ? 1 : MAX_PAGES);
    out.clusters[key] = summarize(tags, total, games);
    await sleep(SLEEP_MS);
  }

  if (!SMOKE) {
    for (const tag of cfg.broadTags) {
      console.error(`broad tag: ${tag}`);
      const { total, games } = await pull([tag], 2);
      out.broadTags[tag] = summarize([tag], total, games);
      await sleep(SLEEP_MS);
    }
  }

  console.error('top całego Steama (bez taga)...');
  const { games: topAll } = await pull(null, SMOKE ? 1 : cfg.overallTopPages);
  for (const g of topAll) {
    if (g.unreleased) continue;
    const y = toYear(g.releaseDate);
    if (!y || y < cfg.minYear) continue;
    (out.overallTopByYear[y] ||= []).push(slim(g));
  }
  for (const y of Object.keys(out.overallTopByYear)) {
    out.overallTopByYear[y] = out.overallTopByYear[y]
      .sort((a, b) => (b.copiesSold ?? 0) - (a.copiesSold ?? 0))
      .slice(0, 15);
  }

  const snapDir = join(OUT, 'snapshots');
  mkdirSync(snapDir, { recursive: true });
  const stamp = out.generatedAt.slice(0, 10);
  const file = join(snapDir, `gamalytic-${stamp}${SMOKE ? '-smoke' : ''}.json`);
  writeFileSync(file, JSON.stringify(out, null, 2));
  if (!SMOKE) writeFileSync(join(OUT, 'latest-gamalytic.json'), JSON.stringify(out, null, 2));
  console.error(`zapisano: ${file}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
