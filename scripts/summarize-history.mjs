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
const day = (iso, n) => new Date(Date.parse(`${iso}T12:00:00Z`) + n * 864e5).toISOString().slice(0, 10);
for (const t of trips) {
  let place = null, guess = false;
  if (!t.transit) {
    const pick = (from, to) => summarize(rows.filter((r) => r.ts && r.ts.slice(0, 10) >= from && r.ts.slice(0, 10) <= to).map((r) => ({ ...r, conn_country: t.cc }))).places?.find((p) => p.cc === t.cc);
    place = pick(t.from, t.to);
    // No Spotify on the trip: guess from the same season, the two weeks either side.
    if (!place) { place = pick(day(t.from, -14), day(t.to, 14)); guess = !!place; }
    if (place) Object.assign(place, { first: t.from, last: t.to, guess });
  }
  const keep = place || { cc: t.cc, first: t.from || '9999', last: t.to || '9999', artists: [], song: null, transit: !!t.transit };
  s.places = s.places.filter((p) => p.cc !== t.cc).concat(keep).sort((a, b) => (a.first < b.first ? -1 : 1));
  console.log(t.cc, guess ? 'guessed' : place ? 'matched' : 'dot only', keep.artists.join(', '));
}
writeFileSync('content/listening-history.json', `${JSON.stringify(s)}\n`);
console.log(`${rows.length} plays, ${s.hours} hours, ${s.playedDays} days, streak ${s.streak.len}, river: ${s.river.map((a) => a.name).join(', ')}`);
console.log(s.yearsInfo);
