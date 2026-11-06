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
