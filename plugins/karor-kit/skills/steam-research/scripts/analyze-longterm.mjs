#!/usr/bin/env node
// steam-research — RAPORT DŁUGOTERMINOWY: trendy w skali 1-2 lat i dłużej.
// Odpowiada na "dokąd to płynie": roczna podaż per nisza, tempo zalewu,
// kohorty (najlepsze gry rocznika), velocity komparatorów w czasie (z serii snapshotów).
// Z każdym tygodniem akumulacji snapshotów sekcja velocity robi się bogatsza.
//
// Użycie: node analyze-longterm.mjs
//   Czyta:  $STEAM_RESEARCH_OUT/latest-gamalytic.json + snapshots/reviews-*.json (wszystkie)
//   Pisze:  $STEAM_RESEARCH_OUT/reports/longterm-<data>.md + latest-longterm.md

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const OUT = process.env.STEAM_RESEARCH_OUT || join(process.cwd(), 'steam-research-out');
const BOXLEITER = 35;
const fmt = (n) => (n == null ? 'b.d.' : n.toLocaleString('pl-PL'));

const g = JSON.parse(readFileSync(join(OUT, 'latest-gamalytic.json'), 'utf8'));
const now = new Date(g.generatedAt);
const thisYear = now.getUTCFullYear();
const dayOfYear = Math.floor((now - new Date(Date.UTC(thisYear, 0, 1))) / 864e5) + 1;
const stamp = g.generatedAt.slice(0, 10);
const YEARS = [];
for (let y = 2019; y <= thisYear; y++) YEARS.push(y);

let md = `# Raport długoterminowy — ${stamp}\n\n`;

// --- roczna podaż per klaster ---
md += `## Podaż roczna per klaster (premiery z tagami)\n\n| Klaster | ${YEARS.join(' | ')} | trend 2023→${thisYear - 1} |\n|---|${YEARS.map(() => '---:').join('|')}|---|\n`;
for (const [key, c] of Object.entries(g.clusters)) {
  const vals = YEARS.map((y) => c.releasesPerYear[y] || 0);
  const a = c.releasesPerYear[2023] || 0;
  const b = c.releasesPerYear[thisYear - 1] || 0;
  const growth = a ? `${b >= a ? '+' : ''}${Math.round(((b - a) / a) * 100)}%` : 'b.d.';
  md += `| ${key}${c.partial ? ' *(partial)*' : ''} | ${vals.join(' | ')} | ${growth} |\n`;
}
md += `\nRok ${thisYear} = dane do ${stamp} (dzień ${dayOfYear}); annualizacja ≈ wartość × ${(365 / dayOfYear).toFixed(2)}. Klastry *(partial)* liczą lata tylko z topu taga — traktować jako dolne ograniczenie.\n\n`;

// --- kohorty: najlepsze gry rocznika ---
md += `## Kohorty: najlepsza gra rocznika w klastrze (copiesSold)\n\n| Klaster | ${[2023, 2024, 2025, thisYear].join(' | ')} |\n|---|---|---|---|---|\n`;
for (const [key, c] of Object.entries(g.clusters)) {
  const cells = [2023, 2024, 2025, thisYear].map((y) => {
    const best = c.topRecent.filter((t) => t.year === y).sort((a, b) => b.copiesSold - a.copiesSold)[0];
    return best ? `${best.name} (${(best.copiesSold / 1e6).toFixed(2)}M)` : '—';
  });
  md += `| ${key} | ${cells.join(' | ')} |\n`;
}
md += `\n*Kohorty liczone z top 10 klastra — rocznik bez reprezentanta w topie = "—".*\n\n`;

// --- velocity komparatorów z serii snapshotów ---
const snapDir = join(OUT, 'snapshots');
const revFiles = readdirSync(snapDir)
  .filter((f) => f.startsWith('reviews-') && f.endsWith('.json') && !f.includes('smoke'))
  .sort();
const series = revFiles.map((f) => JSON.parse(readFileSync(join(snapDir, f), 'utf8')));
const spanDays = series.length >= 2
  ? (new Date(series.at(-1).generatedAt) - new Date(series[0].generatedAt)) / 864e5
  : 0;

md += `## Velocity komparatorów w czasie\n\n`;
if (series.length < 3 || spanDays < 14) {
  md += `Za mało historii (${series.length} snapshot(y), ${Math.round(spanDays)} dni). Sekcja wypełni się po ~3 tygodniach akumulacji — wtedy widać, kto przyspiesza, a kto gaśnie.\n\n`;
} else {
  md += `Est. sprzedaż/tydzień (Δ recenzji × ${BOXLEITER}) w kolejnych oknach między snapshotami. Ostatnie ${Math.min(4, series.length - 1)} okien:\n\n`;
  const windows = [];
  for (let i = Math.max(1, series.length - 4); i < series.length; i++) windows.push([series[i - 1], series[i]]);
  const header = windows.map(([a, b]) => `${a.generatedAt.slice(5, 10)}→${b.generatedAt.slice(5, 10)}`);
  md += `| Gra | ${header.join(' | ')} |\n|---|${header.map(() => '---:').join('|')}|\n`;
  const names = series.at(-1).games.filter((x) => !x.error).map((x) => x.appid);
  for (const appid of names) {
    const row = windows.map(([a, b]) => {
      const ga = a.games.find((x) => x.appid === appid && !x.error);
      const gb = b.games.find((x) => x.appid === appid && !x.error);
      if (!ga || !gb) return 'b.d.';
      const days = Math.max(1, (new Date(b.generatedAt) - new Date(a.generatedAt)) / 864e5);
      return '~' + fmt(Math.round(((gb.totalReviews - ga.totalReviews) / days) * 7 * BOXLEITER));
    });
    const name = series.at(-1).games.find((x) => x.appid === appid)?.name ?? appid;
    md += `| ${name} | ${row.join(' | ')} |\n`;
  }
  md += `\n`;
}

md += `---\n*Szacunki względne; metodologia i pułapki: METHODOLOGY.md. Raport tygodniowy (co się rusza teraz) to osobny plik: latest-weekly.md.*\n`;

const dir = join(OUT, 'reports');
mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, `longterm-${stamp}.md`), md);
writeFileSync(join(dir, 'latest-longterm.md'), md);
console.error(`zapisano: reports/longterm-${stamp}.md`);
