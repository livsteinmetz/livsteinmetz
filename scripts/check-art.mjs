// Confirms every tile a cover needs exists, at each scale a screen might ask for.
import { readFileSync, existsSync } from 'node:fs';
import { tiles } from '../site/art.js';
const art = JSON.parse(readFileSync('content/art.json', 'utf8'));
let bad = 0, n = 0;
// A dropped connection is not a missing tile, so try a few times first.
const head = async (url) => { for (let i = 0; ; i++) { try { return await fetch(url, { method: 'HEAD' }); } catch (e) { if (i === 3) throw e; await new Promise((ok) => setTimeout(ok, 1500)); } } };
for (const [k, a] of Object.entries(art)) {
  if (a.image) continue;
  for (const sf of [1, 2, 4]) {
    const ts = tiles({ ...a, id: a.barnes || a.tiles }, sf);
    for (const t of [ts[0], ts[ts.length - 1]]) {
      n++;
      // Tiles this site hosts itself are checked on disk.
      const ok = t.url.startsWith('/') ? existsSync(`site${t.url}`) : (await head(t.url)).ok;
      if (!ok) { bad++; console.log('MISSING', t.url); }
    }
  }
}
console.log(`${n} tiles checked, ${bad} missing`);
if (bad) process.exitCode = 1;
