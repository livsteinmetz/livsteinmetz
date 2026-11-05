// Confirms every tile a cover needs exists, at each scale a screen might ask for.
import { readFileSync } from 'node:fs';
import { tiles } from '../site/art.js';
const art = JSON.parse(readFileSync('content/art.json', 'utf8'));
let bad = 0, n = 0;
for (const [k, a] of Object.entries(art)) {
  for (const sf of [1, 2, 4]) {
    const ts = tiles({ id: a.barnes, ...a }, sf);
    for (const t of [ts[0], ts[ts.length - 1]]) { n++; const r = await fetch(t.url, { method: 'HEAD' }); if (!r.ok) { bad++; console.log('MISSING', r.status, t.url); } }
  }
}
console.log(`${n} tiles checked, ${bad} missing`);
if (bad) process.exitCode = 1;
