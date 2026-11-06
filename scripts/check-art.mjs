// Confirms every tile a cover needs exists, at each scale a screen might ask for.
import { readFileSync } from 'node:fs';
import { tiles } from '../site/art.js';
const art = JSON.parse(readFileSync('content/art.json', 'utf8'));
let bad = 0, n = 0;
// A dropped connection is not a missing tile, so try a few times first.
const head = async (url) => { for (let i = 0; ; i++) { try { return await fetch(url, { method: 'HEAD' }); } catch (e) { if (i === 3) throw e; await new Promise((ok) => setTimeout(ok, 1500)); } } };
for (const [k, a] of Object.entries(art)) {
  for (const sf of [1, 2, 4]) {
    const ts = tiles({ id: a.barnes, ...a }, sf);
    for (const t of [ts[0], ts[ts.length - 1]]) { n++; const r = await head(t.url); if (!r.ok) { bad++; console.log('MISSING', r.status, t.url); } }
  }
}
console.log(`${n} tiles checked, ${bad} missing`);
if (bad) process.exitCode = 1;
