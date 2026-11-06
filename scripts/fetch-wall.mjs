// Picks today's works at random from open access museum collections.
// A failed request keeps the last saved wall, so this never stops a build.
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
const ARTISTS = ['Odilon Redon', 'James McNeill Whistler', 'Joseph Mallord William Turner', 'Paul Gauguin', 'James Ensor', 'Vincent van Gogh', 'Claude Monet', 'Edmond François Aman-Jean', 'Pierre Puvis de Chavannes', 'Henri Fantin-Latour'];
const COUNT = 12;
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

const smk = async (a) => {
  const { items = [] } = await get(`https://api.smk.dk/api/v1/art/search/?keys=${encodeURIComponent(a)}&filters=%5Bpublic_domain:true%5D,%5Bhas_image:true%5D&offset=0&rows=20&lang=en`);
  return items.filter((w) => w.image_thumbnail && (w.production?.[0]?.creator || '').includes(a.split(' ').at(-1))).map((w) => ({ id: `smk-${w.id}`, museum: 'SMK, National Gallery of Denmark', title: w.titles?.[0]?.title || 'Untitled', artist: a, date: w.production_date?.[0]?.period || '', web: w.image_thumbnail, w: w.image_width || 800, h: w.image_height || 1000 }));
};

// The Barnes, through the same search the collection site uses.
const barnes = async () => {
  const body = { from: 0, size: 2000, _source: ['id', 'title', 'people', 'imageSecret', 'objRightsTypeId', 'classification'], query: { bool: { filter: [{ exists: { field: 'imageSecret' } }, { term: { classification: 'Paintings' } }] } } };
  const res = await fetch('https://collection.barnesfoundation.org/api/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ body }) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json(), hits = json.hits?.hits || json.body?.hits?.hits || json.hits || [];
  console.log('barnes sample', JSON.stringify(hits[0]?._source || hits[0] || json).slice(0, 400));
  return hits.map((h) => h._source || h).filter((w) => [4, 7, 8, 10].includes(Number(w.objRightsTypeId))).map((w) => ({ id: `barnes-${w.id}`, museum: 'Barnes Foundation', title: w.title, artist: w.people || '', date: '', web: `https://s3.amazonaws.com/barnes-image-repository/images/${w.id}_${w.imageSecret}_n.jpg`, w: 800, h: 1000 }));
};

// Wikidata reaches collections with no open API of their own, and Wikimedia
// Commons hosts their public domain paintings.
const COLLECTIONS = ['Q160236', 'Q214867', 'Q190804', 'Q23402', 'Q180788', 'Q842858', 'Q221092', 'Q49133', 'Q163804', 'Q132783', 'Q1568434'];
const wikidata = async () => {
  const q = `SELECT ?item ?title ?name ?museum ?img WHERE { VALUES ?coll { ${COLLECTIONS.map((c) => `wd:${c}`).join(' ')} } VALUES ?name { ${ARTISTS.map((a) => `"${a}"@en`).join(' ')} } ?creator rdfs:label ?name . ?item wdt:P170 ?creator ; wdt:P31 wd:Q3305213 ; wdt:P195 ?coll ; wdt:P18 ?img ; rdfs:label ?title . FILTER(LANG(?title) = "en") ?coll rdfs:label ?museum . FILTER(LANG(?museum) = "en") } LIMIT 600`;
  const json = await get(`https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(q)}`);
  return json.results.bindings.map((b) => ({ id: `wd-${b.item.value.split('/').pop()}`, museum: b.museum.value, title: b.title.value, artist: b.name.value, date: '', web: `${b.img.value.replace('http://', 'https://')}?width=900`, w: 800, h: 1000 }));
};

for (const [name, source] of Object.entries({ barnes: async (a) => (a === ARTISTS[0] ? barnes() : []), wikidata: async (a) => (a === ARTISTS[0] ? wikidata() : []), smk, cleveland, chicago, met })) {
  let n = 0;
  for (const a of ARTISTS) {
    try { const works = await source(a); pool.push(...works); n += works.length; } catch (e) { console.warn(`Skipped ${name} ${a}: ${e.message}`); if (name === 'met') break; }
  }
  console.log(`${name}: ${n} works`, [...new Set(pool.map((w) => w.museum))].length, 'museums so far');
}
console.log(`${pool.length} works in the pool`, [...new Set(pool.map((w) => w.museum))].join('; '));
if (pool.length >= COUNT) {
  const seed = (i) => { const x = Math.sin(day * 12.9898 + i * 78.233) * 43758.5453; return x - Math.floor(x); };
  const picked = pool.map((w, i) => [seed(i), w]).sort((a, b) => a[0] - b[0]).map(([, w]) => w);
  // Take one museum at a time so no single collection fills the shelf.
  const museums = [...new Set(picked.map((w) => w.museum))];
  const wall = [], seen = {}, tried = new Set();
  // Keep a copy of each image with the site, so a slow or blocked museum server never leaves a blank frame.
  rmSync('site/wall', { recursive: true, force: true });
  mkdirSync('site/wall', { recursive: true });
  const keep = async (w) => {
    const r = await fetch(w.web, { headers: { 'User-Agent': 'livsteinmetz-site-build/1.0 (https://livsteinmetz.web.app)' }, signal: AbortSignal.timeout(30000) });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const bytes = Buffer.from(await r.arrayBuffer());
    const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8, png = bytes[0] === 0x89 && bytes[1] === 0x50;
    if ((!jpeg && !png) || bytes.length < 8000) throw new Error(`not an image, ${bytes.length} bytes`);
    const file = `${String(w.id).replace(/[^\w-]/g, '-')}.${jpeg ? 'jpg' : 'png'}`;
    writeFileSync(`site/wall/${file}`, bytes);
    return `/wall/${file}`;
  };
  for (let i = 0; wall.length < COUNT && i < picked.length * 2; i++) {
    const museum = museums[i % museums.length];
    const open = picked.filter((p) => p.museum === museum && !tried.has(p));
    const w = open.find((p) => !seen[p.artist]) || open[0];
    if (!w) continue;
    tried.add(w);
    try { w.source = w.web; w.web = await keep(w); seen[w.artist] = 1; wall.push(w); } catch (e) { console.warn(`Skipped image ${museum} ${w.web}: ${e.message}`); }
    await new Promise((done) => setTimeout(done, 400));
  }
  writeFileSync('content/wall.json', JSON.stringify(wall, null, 1));
  wall.forEach((w) => console.log(' ', w.museum, '|', w.artist, '|', w.title, '|', w.web));
}
