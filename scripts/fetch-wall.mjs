// Picks today's works at random from open access museum collections.
// A failed request keeps the last saved wall, so this never stops a build.
import { readFileSync, writeFileSync } from 'node:fs';
const ARTISTS = ['Odilon Redon', 'James McNeill Whistler', 'Joseph Mallord William Turner', 'Paul Gauguin', 'James Ensor', 'Vincent van Gogh', 'Claude Monet', 'Edmond François Aman-Jean', 'Pierre Puvis de Chavannes', 'Henri Fantin-Latour'];
const COUNT = 8;
const day = Math.floor(Date.now() / 864e5);
const pool = [];
const get = async (url) => { const r = await fetch(url, { headers: { 'User-Agent': 'livsteinmetz-site-build' } }); if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); };

const cleveland = async (a) => {
  const { data = [] } = await get(`https://openaccess-api.clevelandart.org/api/artworks/?artists=${encodeURIComponent(a)}&cc0=1&has_image=1&type=Painting&limit=40&fields=id,title,creators,creation_date,images,share_license_status`);
  return data.filter((w) => w.share_license_status === 'CC0' && w.images?.web?.url).map((w) => ({ id: `cma-${w.id}`, museum: 'Cleveland Museum of Art', title: w.title, artist: (w.creators?.[0]?.description || a).replace(/\s*\(.*$/, ''), date: w.creation_date, web: w.images.web.url, w: Number(w.images.web.width) || 800, h: Number(w.images.web.height) || 1000 }));
};
const chicago = async (a) => {
  const { data = [] } = await get(`https://api.artic.edu/api/v1/artworks/search?q=${encodeURIComponent(a)}&query[term][is_public_domain]=true&limit=30&fields=id,title,artist_title,date_display,image_id,artwork_type_title,thumbnail`);
  return data.filter((w) => w.image_id && w.artwork_type_title === 'Painting' && w.artist_title === a).map((w) => ({ id: `aic-${w.id}`, museum: 'Art Institute of Chicago', title: w.title, artist: a, date: w.date_display, web: `https://www.artic.edu/iiif/2/${w.image_id}/full/843,/0/default.jpg`, w: w.thumbnail?.width || 800, h: w.thumbnail?.height || 1000 }));
};
const met = async (a) => {
  const { objectIDs = [] } = await get(`https://collectionapi.metmuseum.org/public/collection/v1/search?artistOrCulture=true&hasImages=true&isPublicDomain=true&q=${encodeURIComponent(a)}`);
  const works = [];
  for (const id of (objectIDs || []).slice(0, 8)) {
    const w = await get(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`);
    if (w.isPublicDomain && w.primaryImageSmall && w.classification === 'Paintings') works.push({ id: `met-${w.objectID}`, museum: 'The Metropolitan Museum of Art', title: w.title, artist: w.artistDisplayName || a, date: w.objectDate, web: w.primaryImageSmall, w: 800, h: 1000 });
  }
  return works;
};

for (const [name, source] of Object.entries({ cleveland, chicago, met })) {
  let n = 0;
  for (const a of ARTISTS) {
    try { const works = await source(a); pool.push(...works); n += works.length; } catch (e) { console.warn(`Skipped ${name} ${a}: ${e.message}`); if (name === 'met') break; }
  }
  console.log(`${name}: ${n} works`);
}
console.log(`${pool.length} works in the pool`);
if (pool.length >= COUNT) {
  const seed = (i) => { const x = Math.sin(day * 12.9898 + i * 78.233) * 43758.5453; return x - Math.floor(x); };
  const picked = pool.map((w, i) => [seed(i), w]).sort((a, b) => a[0] - b[0]).map(([, w]) => w);
  // Take one museum at a time so no single collection fills the shelf.
  const museums = [...new Set(picked.map((w) => w.museum))];
  const wall = [], seen = {};
  for (let i = 0; wall.length < COUNT && i < picked.length * 2; i++) {
    const museum = museums[i % museums.length];
    const w = picked.find((p) => p.museum === museum && !wall.includes(p) && (seen[p.artist] || 0) < 1) || picked.find((p) => p.museum === museum && !wall.includes(p));
    if (w) { seen[w.artist] = (seen[w.artist] || 0) + 1; wall.push(w); }
  }
  writeFileSync('content/wall.json', JSON.stringify(wall, null, 1));
  wall.forEach((w) => console.log(' ', w.artist, '|', w.title, '|', w.web));
}
