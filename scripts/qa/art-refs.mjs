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
// Candidates for covers, composed from tiles at a quarter of full size.
const ids = [6994, 6992, 5435, 7199, 5652, 5526, 4712, 5677];
const b2 = await chromium.launch(); const sizes = {};
for (const id of ids) {
  const info = await (await fetch(`https://d2r83x5xt28klo.cloudfront.net/tiles/${id}/info.json`)).json();
  const w = info.width, h = info.height, q = 4, step = 256 * q; sizes[id] = [w, h];
  let html = `<body style="margin:0;background:#000"><div style="position:relative;width:${Math.ceil(w / q)}px;height:${Math.ceil(h / q)}px;overflow:hidden">`;
  for (let y = 0; y < h; y += step) for (let x = 0; x < w; x += step) { const tw = Math.min(step, w - x), th = Math.min(step, h - y); html += `<img src="https://d2r83x5xt28klo.cloudfront.net/tiles/${id}/${x},${y},${tw},${th}/${Math.ceil(tw / q)},/0/color.jpg" style="position:absolute;left:${x / q}px;top:${y / q}px;width:${tw / q + .5}px;height:${th / q + .5}px">`; }
  const g = await b2.newPage({ viewport: { width: Math.ceil(w / q), height: Math.ceil(h / q) } }); await g.setContent(html, { waitUntil: 'networkidle' }); await g.screenshot({ path: `shots/refs/b${id}.jpg`, type: 'jpeg', quality: 82 }); await g.close();
}
await b2.close(); fs.writeFileSync('shots/refs/sizes.json', JSON.stringify(sizes));
