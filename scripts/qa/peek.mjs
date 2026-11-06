import { chromium } from 'playwright';
import fs from 'node:fs';
fs.mkdirSync('shots/refs', { recursive: true }); const b = await chromium.launch(); const sizes = {};
for (const id of [7004]) {
  const info = await (await fetch(`https://d2r83x5xt28klo.cloudfront.net/tiles/${id}/info.json`)).json();
  const w = info.width, h = info.height, q = 4, step = 1024; sizes[id] = [w, h];
  let html = `<body style="margin:0"><div style="position:relative;width:${Math.ceil(w / q)}px;height:${Math.ceil(h / q)}px;overflow:hidden">`;
  for (let y = 0; y < h; y += step) for (let x = 0; x < w; x += step) { const tw = Math.min(step, w - x), th = Math.min(step, h - y); html += `<img src="https://d2r83x5xt28klo.cloudfront.net/tiles/${id}/${x},${y},${tw},${th}/${Math.ceil(tw / q)},/0/color.jpg" style="position:absolute;left:${x / q}px;top:${y / q}px;width:${tw / q + .5}px;height:${th / q + .5}px">`; }
  const g = await b.newPage({ viewport: { width: Math.ceil(w / q), height: Math.ceil(h / q) } }); await g.setContent(html, { waitUntil: 'networkidle' }); await g.screenshot({ path: `shots/refs/b${id}.jpg`, type: 'jpeg', quality: 82 }); await g.close();
}
await b.close(); fs.writeFileSync('shots/refs/sizes.json', JSON.stringify(sizes));
const r = await fetch('https://collection.barnesfoundation.org/api/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ body: { query: { term: { id: 7004 } }, _source: ['id', 'title', 'people', 'objRightsTypeId', 'displayDate'] } }) });
console.log('record', JSON.stringify((await r.json()).hits?.hits?.[0]?._source));
