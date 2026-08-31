#!/usr/bin/env node
// steam-research — RAPORT TYGODNIOWY: delta między dwoma ostatnimi snapshotami.
// Odpowiada na "czy coś się zmienia TERAZ": velocity sprzedaży komparatorów,
// nowe premiery w niszach, ruchy w topach, przetasowania heat w tle rynku.
//
// Użycie: node compare-weekly.mjs
//   Czyta:  $STEAM_RESEARCH_OUT/snapshots/{gamalytic,reviews}-*.json
//   Pisze:  $STEAM_RESEARCH_OUT/reports/weekly-<data>.md + latest-weekly.md
//   Przy <2 snapshotach pisze raport-zaślepkę (baseline) i kończy z kodem 0.

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const OUT = process.env.STEAM_RESEARCH_OUT || join(process.cwd(), 'steam-research-out');
const BOXLEITER = 35;
const fmt = (n) => (n == null ? 'b.d.' : n.toLocaleString('pl-PL'));

function latestTwo(prefix) {
  const dir = join(OUT, 'snapshots');
  const files = readdirSync(dir)
    .filter((f) => f.startsWith(prefix + '-') && f.endsWith('.json') && !f.includes('smoke'))
    .sort();
  return files.slice(-2).map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')));
}

function writeReport(md, stamp) {
  const dir = join(OUT, 'reports');
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `weekly-${stamp}.md`), md);
  writeFileSync(join(dir, 'latest-weekly.md'), md);
  console.error(`zapisano: reports/weekly-${stamp}.md`);
}

const gam = latestTwo('gamalytic');
const rev = latestTwo('reviews');
const stamp = (gam.at(-1) ?? rev.at(-1))?.generatedAt.slice(0, 10) ?? new Date().toISOString().slice(0, 10);

if (gam.length < 2 && rev.length < 2) {
  writeReport(
    `# Raport tygodniowy — ${stamp}\n\nTo pierwszy snapshot (baseline). Delty pojawią się od następnego przebiegu.\n`,
    stamp
  );
  process.exit(0);
}

let md = `# Raport tygodniowy — ${stamp}\n\n`;

// --- velocity komparatorów ---
if (rev.length === 2) {
  const [a, b] = rev;
  const days = Math.max(1, (new Date(b.generatedAt) - new Date(a.generatedAt)) / 864e5);
  md += `## Tempo sprzedaży komparatorów\n\nOkno: ${days.toFixed(0)} dni (${a.generatedAt.slice(0, 10)} → ${b.generatedAt.slice(0, 10)}). Szacunek: przyrost recenzji × ${BOXLEITER}, znormalizowany do tygodnia.\n\n`;
  const prev = new Map(a.games.filter((g) => !g.error).map((g) => [g.appid, g]));
  const rows = b.games
    .filter((g) => !g.error && prev.has(g.appid))
    .map((g) => {
      const d = g.totalReviews - prev.get(g.appid).totalReviews;
      return { name: g.name, d, perWeek: Math.round((d / days) * 7 * BOXLEITER) };
    })
    .sort((x, y) => y.perWeek - x.perWeek);
  md += `| Gra | Δ recenzji | est. sprzedaż/tydzień |\n|---|---:|---:|\n`;
  for (const r of rows) md += `| ${r.name} | ${r.d >= 0 ? '+' : ''}${fmt(r.d)} | ~${fmt(r.perWeek)} |\n`;
  md += `\n`;
}

// --- nisze: podaż i ruchy w topie ---
if (gam.length === 2) {
  const [a, b] = gam;
  const year = new Date(b.generatedAt).getUTCFullYear();
  md += `## Nisze: podaż i ruchy w topie\n\n| Klaster | premiery ${year} | Δ | heat (mln) | Δ heat | nowi w top 10 |\n|---|---:|---:|---:|---:|---|\n`;
  for (const [key, cb] of Object.entries(b.clusters)) {
    const ca = a.clusters[key];
    if (!ca) continue;
    const relA = ca.releasesPerYear[year] || 0;
    const relB = cb.releasesPerYear[year] || 0;
    const prevIds = new Set(ca.topRecent.map((g) => g.steamId));
    const entrants = cb.topRecent.filter((g) => !prevIds.has(g.steamId)).map((g) => g.name);
    const dHeat = cb.heatTop10Recent - ca.heatTop10Recent;
    md += `| ${key} | ${relB} | +${relB - relA} | ${(cb.heatTop10Recent / 1e6).toFixed(1)} | ${dHeat >= 0 ? '+' : ''}${(dHeat / 1e6).toFixed(2)} | ${entrants.join(', ') || '—'} |\n`;
  }
  md += `\n## Tło rynku: największe ruchy heat\n\n| Tag | heat (mln) | Δ (mln) |\n|---|---:|---:|\n`;
  const moves = Object.entries(b.broadTags)
    .filter(([k]) => a.broadTags[k])
    .map(([k, tb]) => ({ k, heat: tb.heatTop10Recent, d: tb.heatTop10Recent - a.broadTags[k].heatTop10Recent }))
    .sort((x, y) => Math.abs(y.d) - Math.abs(x.d))
    .slice(0, 8);
  for (const m of moves) md += `| ${m.k} | ${(m.heat / 1e6).toFixed(1)} | ${m.d >= 0 ? '+' : ''}${(m.d / 1e6).toFixed(2)} |\n`;
  md += `\n`;
}

md += `---\n*Szacunki względne (Boxleiter ×${BOXLEITER}); metodologia i pułapki: METHODOLOGY.md.*\n`;
writeReport(md, stamp);
