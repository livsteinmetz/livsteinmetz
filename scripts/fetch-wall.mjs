// Picks today's wall from the Cleveland Museum of Art's open access collection (CC0).
// A failed request keeps the last saved wall, so this never stops a build.
import { readFileSync, writeFileSync } from 'node:fs';
const ARTISTS = ['Odilon Redon', 'James McNeill Whistler', 'Joseph Mallord William Turner', 'Paul Gauguin', 'James Ensor', 'Vincent van Gogh', 'Claude Monet', 'Edmond François Aman-Jean', 'Pierre Puvis de Chavannes', 'Henri Fantin-Latour'];
const COUNT = 8;
const day = Math.floor(Date.now() / 864e5);
const pool = [];
for (const a of ARTISTS) {
  try {
    const r = await fetch(`https://openaccess-api.clevelandart.org/api/artworks/?artists=${encodeURIComponent(a)}&cc0=1&has_image=1&type=Painting&limit=40&fields=id,title,creators,creation_date,images,url,share_license_status`);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    for (const w of (await r.json()).data || []) {
      if (w.share_license_status !== 'CC0' || !w.images?.web?.url) continue;
      pool.push({ id: w.id, title: w.title, artist: (w.creators?.[0]?.description || a).replace(/\s*\(.*$/, ''), date: w.creation_date, url: w.url, web: w.images.web.url, print: w.images.print?.url || w.images.web.url, w: +w.images.web.width, h: +w.images.web.height });
    }
  } catch (e) { console.warn(`Skipped ${a}: ${e.message}`); }
}
console.log(`${pool.length} works in the pool`);
if (pool.length >= COUNT) {
  const seed = (i) => { const x = Math.sin(day * 12.9898 + i * 78.233) * 43758.5453; return x - Math.floor(x); };
  const picked = pool.map((w, i) => [seed(i), w]).sort((a, b) => a[0] - b[0]).map(([, w]) => w);
  const wall = [], seen = {};
  for (const w of picked) { seen[w.artist] = (seen[w.artist] || 0) + 1; if (seen[w.artist] === 1) wall.push(w); if (wall.length === COUNT) break; }
  for (const w of picked) { if (wall.length === COUNT) break; if (!wall.includes(w)) wall.push(w); }
  writeFileSync('content/wall.json', JSON.stringify(wall, null, 1));
  wall.forEach((w) => console.log(' ', w.artist, '|', w.title, '|', w.web));
}
