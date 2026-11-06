// Fetches world coastlines for the listening globe, and a short preview clip for
// the song most played in each place. Runs in CI, where the network is open.
import { readFileSync, writeFileSync } from 'node:fs';
const UA = { headers: { 'User-Agent': 'livsteinmetz-site-build/1.0 (https://livsteinmetz.com)' } };
let h = null;
try { h = JSON.parse(readFileSync('content/listening-history.json', 'utf8')); } catch { /* none */ }
const out = { land: [], clips: {} };
try {
  const topo = await (await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/land-110m.json', UA)).json();
  const [sx, sy] = topo.transform.scale, [tx, ty] = topo.transform.translate;
  const arcs = topo.arcs.map((a) => { let x = 0, y = 0; return a.map(([dx, dy]) => { x += dx; y += dy; return [+(x * sx + tx).toFixed(1), +(y * sy + ty).toFixed(1)]; }); });
  const ring = (ids) => ids.flatMap((i, k) => { const a = i < 0 ? [...arcs[~i]].reverse() : arcs[i]; return k ? a.slice(1) : a; });
  for (const g of topo.objects.land.geometries) {
    const polys = g.type === 'Polygon' ? [g.arcs] : g.arcs;
    for (const p of polys) out.land.push(ring(p[0]));
  }
  console.log(`Globe: ${out.land.length} land shapes`);
} catch (e) { console.warn(`Globe coastlines skipped: ${e.message}`); }
for (const p of h?.places || []) {
  try {
    const [title, artist] = p.song;
    const r = await (await fetch(`https://itunes.apple.com/search?${new URLSearchParams({ term: `${title} ${artist}`, entity: 'song', limit: '1' })}`, UA)).json();
    if (r.results?.[0]?.previewUrl) out.clips[p.cc] = r.results[0].previewUrl;
    await new Promise((ok) => setTimeout(ok, 600));
  } catch (e) { console.warn(`No clip for ${p.cc}: ${e.message}`); }
}
console.log(`Globe clips: ${Object.keys(out.clips).join(', ')}`);
writeFileSync('content/world.json', `${JSON.stringify(out.land.length ? out : null)}\n`);
