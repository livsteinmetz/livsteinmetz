// Run on Olivia's own computer or in a session with her export, never in CI:
//   TZ=America/New_York node scripts/summarize-history.mjs path/to/Streaming_History_*.json
// Writes totals only to content/listening-history.json. The raw files never enter the repo.
import { readFileSync, writeFileSync } from 'node:fs';
import { summarize } from '../site/summarize.js';
const rows = process.argv.slice(2).filter((f) => /Audio/i.test(f)).flatMap((f) => JSON.parse(readFileSync(f, 'utf8')));
const s = summarize(rows);
writeFileSync('content/listening-history.json', `${JSON.stringify(s)}\n`);
console.log(`${rows.length} plays, ${s.hours} hours, ${s.playedDays} days, streak ${s.streak.len}, river: ${s.river.map((a) => a.name).join(', ')}`);
console.log(s.yearsInfo);
