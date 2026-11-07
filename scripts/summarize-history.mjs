// Run on Olivia's own computer or in a session with her export, never in CI:
//   TZ=America/New_York node scripts/summarize-history.mjs path/to/Streaming_History_*.json
// Writes totals only to content/listening-history.json. The raw files never enter the repo.
import { readFileSync, writeFileSync } from 'node:fs';
import { summarize } from '../site/summarize.js';
const rows = process.argv.slice(2).filter((f) => /Audio/i.test(f) && !/trips/.test(f)).flatMap((f) => JSON.parse(readFileSync(f, 'utf8')));
const s = summarize(rows);
// Trips where Spotify logged the home country (roaming data does that). Olivia gives the dates;
// what played between them becomes that place's music.
let trips = [];
try { trips = JSON.parse(readFileSync('content/trips.json', 'utf8')); } catch { /* none */ }
for (const t of trips) {
  const inTrip = rows.filter((r) => r.ts && r.ts.slice(0, 10) >= t.from && r.ts.slice(0, 10) <= t.to);
  const sub = summarize(inTrip.map((r) => ({ ...r, conn_country: t.cc })));
  const place = sub.places?.find((p) => p.cc === t.cc);
  // A trip with no Spotify still gets its dot.
  const keep = place || { cc: t.cc, first: t.from, last: t.to, artists: [], song: null };
  s.places = s.places.filter((p) => p.cc !== t.cc).concat(keep).sort((a, b) => (a.first < b.first ? -1 : 1));
}
writeFileSync('content/listening-history.json', `${JSON.stringify(s)}\n`);
console.log(`${rows.length} plays, ${s.hours} hours, ${s.playedDays} days, streak ${s.streak.len}, river: ${s.river.map((a) => a.name).join(', ')}`);
console.log(s.yearsInfo);
