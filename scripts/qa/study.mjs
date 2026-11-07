// Measures each study cover from real pixels and picks the type color and placement with the most contrast.
import { chromium } from 'playwright';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.json': 'application/json', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png' };
const srv = http.createServer((q, r) => { const p = decodeURIComponent(q.url.split('?')[0]); let f = `build${p}`; if (!path.extname(f)) f += '.html'; if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); }).listen(4179);
const COLORS = ['#ffffff', '#f6d44f', '#fff27a', '#16246e', '#000000', '#c9321a', '#c8d6ec'];
const b = await chromium.launch(); const g = await b.newPage({ viewport: { width: 1200, height: 900 } });
g.on('pageerror', (e) => console.log('study ERR', e.message));
await g.goto('http://localhost:4179/study'); await g.waitForFunction(() => document.documentElement.dataset.ready === '1', null, { timeout: 30000 });
const ids = await g.$$eval('.study .cover', (l) => l.map((c) => c.dataset.id));
const result = {};
for (const id of ids) {
  const cv = g.locator(`.cover[data-id="${id}"]`);
  await cv.scrollIntoViewIfNeeded();
  await g.waitForFunction((i) => [...document.querySelector(`.cover[data-id="${i}"]`).querySelectorAll('img')].every((m) => m.complete), id, { timeout: 20000 }).catch(() => console.log('study slow tiles', id));
  await g.waitForTimeout(400);
  let best = null;
  for (const place of ['top', 'bottom']) {
    const box = await g.evaluate(([i, p]) => { const c = document.querySelector(`.cover[data-id="${i}"]`); window.studyLayout(c, p); const svg = c.querySelector('svg'); svg.style.visibility = 'hidden'; const cr = c.getBoundingClientRect(); const rs = [...svg.querySelectorAll('text')].map((t) => t.getBoundingClientRect()); return { rs: rs.map((r) => [r.left - cr.left, r.top - cr.top, r.width, r.height]) }; }, [id, place]);
    const png = (await cv.screenshot()).toString('base64');
    const score = await g.evaluate(async ([src, rs, colors]) => {
      const im = new Image(); im.src = `data:image/png;base64,${src}`; await im.decode();
      const k = im.naturalWidth / document.querySelector('.study .cover').getBoundingClientRect().width;
      const c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight; const x = c.getContext('2d'); x.drawImage(im, 0, 0);
      const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
      const L = (r, g2, b2) => 0.2126 * lin(r) + 0.7152 * lin(g2) + 0.0722 * lin(b2);
      const ls = [];
      for (const [l, t, w, h] of rs) { const d = x.getImageData(Math.max(0, l * k), Math.max(0, t * k), Math.max(1, w * k), Math.max(1, h * k)).data; for (let i = 0; i < d.length; i += 16) ls.push(L(d[i], d[i + 1], d[i + 2])); }
      return colors.map((hex) => { const n = parseInt(hex.slice(1), 16); const lt = L(n >> 16, (n >> 8) & 255, n & 255); const cs = ls.map((lb) => (Math.max(lt, lb) + 0.05) / (Math.min(lt, lb) + 0.05)).sort((p, q) => p - q); return [hex, cs[Math.floor(cs.length * 0.1)]]; });
    }, [png, box.rs, COLORS]);
    for (const [fill, s] of score) if (!best || s > best.score) best = { place, fill, score: +s.toFixed(2) };
  }
  await g.evaluate(([i, r]) => { const c = document.querySelector(`.cover[data-id="${i}"]`); window.studyLayout(c, r.place); const svg = c.querySelector('svg'); svg.setAttribute('fill', r.fill); svg.style.visibility = ''; }, [id, best]);
  result[id] = best; console.log('study', id, best.place, best.fill, best.score);
}
fs.writeFileSync('build/study.json', JSON.stringify(result));
fs.mkdirSync('shots/study', { recursive: true });
await g.evaluate((m) => { for (const [i, r] of Object.entries(m)) { const c = document.querySelector(`.cover[data-id="${i}"]`); c.closest('.pick').querySelector('.score').textContent = `Contrast ${r.score.toFixed(1)} to 1`; } }, result);
const rows = await g.$$('.srow');
for (let i = 0; i < rows.length; i++) await rows[i].screenshot({ path: `shots/study/row${String(i).padStart(2, '0')}.png` });
await b.close(); srv.close(); process.exit(0);
