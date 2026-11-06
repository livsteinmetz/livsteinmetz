// Saves each painting whole, from its tiles, so crops can be chosen by eye.
import { chromium } from 'playwright';
import fs from 'node:fs';
const art = JSON.parse(fs.readFileSync('content/art.json', 'utf8'));
fs.mkdirSync('shots/refs', { recursive: true });
fs.writeFileSync('shots/refs/notes.json', fs.readFileSync('content/notes.feed.json'));
const b = await chromium.launch(); const seen = new Set();
for (const [k, a] of Object.entries(art)) {
  if (seen.has(a.barnes)) continue; seen.add(a.barnes);
  const scale = 900 / Math.max(a.w, a.h), step = 1024, W = Math.round(a.w * scale), H = Math.round(a.h * scale);
  let html = `<body style="margin:0;background:#000"><div style="position:relative;width:${W}px;height:${H}px;overflow:hidden">`;
  for (let y = 0; y < a.h; y += step) for (let x = 0; x < a.w; x += step) { const tw = Math.min(step, a.w - x), th = Math.min(step, a.h - y); html += `<img src="https://d2r83x5xt28klo.cloudfront.net/tiles/${a.barnes}/${x},${y},${tw},${th}/${Math.ceil(tw / 4)},/0/color.jpg" style="position:absolute;left:${x * scale}px;top:${y * scale}px;width:${tw * scale + .5}px;height:${th * scale + .5}px">`; }
  const g = await b.newPage({ viewport: { width: W, height: H } }); await g.setContent(html, { waitUntil: 'networkidle' }); await g.screenshot({ path: `shots/refs/${k}.jpg`, type: 'jpeg', quality: 80 }); await g.close();
}
await b.close();
const IMG = 'https://d2r83x5xt28klo.cloudfront.net';
const ua = { headers: { 'User-Agent': 'livsteinmetz-site-build/1.0 (https://livsteinmetz.web.app)' } };
const save = async (url, file) => { const r = await fetch(url, ua); console.log('save', r.status, url.slice(0, 120)); if (r.ok) fs.writeFileSync(file, Buffer.from(await r.arrayBuffer())); return r.ok; };
await save('https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent('Landscape_with_the_flight_into_Egypt_(David_Teniers_d.ä.)_-_Nationalmuseum_-_23919FXD.jpg'), 'shots/refs/teniers.jpg');
const res = await fetch('https://collection.barnesfoundation.org/api/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ body: { from: 0, size: 3000, _source: ['id', 'title', 'people', 'imageSecret', 'objRightsTypeId'], query: { term: { classification: 'Paintings' } } } }) });
const hits = ((await res.json()).hits?.hits || []).map((h) => h._source);
console.log('barnes paintings', hits.length);
fs.mkdirSync('shots/hits', { recursive: true });
const names = /Paul C|Cézanne|Manet|Matisse|Seurat|Renoir|Degas|Gauguin|Toulouse|Courbet|Corot|Daumier|Soutine|Prendergast|Sisley/i;
const count = {}, list = [];
for (const w of hits) { if (!names.test(w.people || '')) continue; list.push(w); console.log('hit', w.id, w.people, '|', w.title, '|', w.objRightsTypeId); }
fs.writeFileSync('shots/hits/list.json', JSON.stringify(list));
const famous = /card players|bathers|bathing|sainte-victoire|sainte victoire|models|poseuses|bonheur|joy of life|dance|laundry|linge|conservatory|music|still life|apples|skulls|mme|madame|woman|boy|red|blue|haere/i;
for (const w of list) { const a = (w.people.match(names) || ['x'])[0].toLowerCase(); count[a] = count[a] || 0; if (![4, 7, 8, 10].includes(Number(w.objRightsTypeId)) || !famous.test(w.title) || count[a] >= 16) continue; count[a]++; await save(`${IMG}/${w.id}_${w.imageSecret}_n.jpg`, `shots/hits/${w.id}.jpg`); }
const info = await fetch(`${IMG}/tiles/${list[0]?.id}/info.json`); console.log('info', info.status, (await info.text()).slice(0, 300));
