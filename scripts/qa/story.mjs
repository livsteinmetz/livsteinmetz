// Scrolls through the listening story and saves a frame from each step.
import { chromium } from 'playwright';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.json': 'application/json', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); let f = `build${p}`; if (!path.extname(f)) f += '.html'; if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); }).listen(4178);
const b = await chromium.launch(); fs.mkdirSync('shots/story', { recursive: true });
for (const [n, w, h] of [['d', 1280, 800], ['m', 390, 844]]) {
  const g = await b.newPage({ viewport: { width: w, height: h } });
  g.on('pageerror', (e) => console.log('story ERR', e.message));
  await g.goto('http://localhost:4178/listening/trends'); await g.waitForTimeout(2000);
  for (const [id, fr] of [['scene-season', [0.05, 0.97]], ['scene-weather', [0.05, 0.25, 0.45, 0.97]], ['scene-clock', [0.1, 0.5, 0.97]], ['scene-places', [0.05, 0.3, 0.6, 0.97]], ['scene-river', [0.5, 0.97]], ['scene-days', [0.9]]]) {
    const el = await g.$(`#${id}`); if (!el || await el.isHidden()) { console.log('story', n, id, 'hidden'); continue; }
    const top = await el.evaluate((e) => e.getBoundingClientRect().top + scrollY), H = await el.evaluate((e) => e.offsetHeight);
    for (const f of fr) { await g.evaluate(`window.scrollTo(0, ${top} + ${f} * (${H} - ${h}))`); await g.waitForTimeout(900); await g.screenshot({ path: `shots/story/${n}-${id}-${f}.png` }); console.log('story', n, id, f, await g.$eval(`#${id} h2`, (e) => e.textContent), '|', await g.$eval(`#${id} .scene-copy p`, (e) => e.textContent)); }
  }
}
await b.close(); srv.close(); process.exit(0);
