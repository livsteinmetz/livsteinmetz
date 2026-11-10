// Measures each study cover from real pixels and picks the type color and placement with the most contrast.
import { chromium } from 'playwright';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.json': 'application/json', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png' };
const srv = http.createServer((q, r) => { const p = decodeURIComponent(q.url.split('?')[0]); let f = `build${p}`; if (!path.extname(f)) f += '.html'; if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); }).listen(4179);
const MONO = ['#ffffff', '#000000', '#16246e'], COLOR = ['#f6d44f', '#fff27a', '#c9321a', '#c8d6ec', '#e64aa6', '#8dff72', '#66c4ff', '#ef8f35', '#efb4f7'];
const SETS = { mono: MONO, color: COLOR, any: [...MONO, ...COLOR] };
const b = await chromium.launch(); const g = await b.newPage({ viewport: { width: 1200, height: 900 } });
g.on('pageerror', (e) => console.log('study ERR', e.message));
await g.goto('http://localhost:4179/study'); await g.waitForFunction(() => document.documentElement.dataset.ready === '1', null, { timeout: 30000 });
await g.addStyleTag({ content: '.pickbar{display:none !important}' });
const ids = await g.$$eval('.study .cover', (l) => l.map((c) => c.dataset.id));
const result = {};
for (const id of ids) {
  const cv = g.locator(`.cover[data-id="${id}"]`);
  await cv.scrollIntoViewIfNeeded();
  await g.waitForFunction((i) => [...document.querySelector(`.cover[data-id="${i}"]`).querySelectorAll('img')].filter((m, _, l) => l.length).every((m) => m.complete && m.naturalWidth) && document.querySelector(`.cover[data-id="${i}"]`).querySelectorAll('img').length + (document.querySelector(`.cover[data-id="${i}"]`).classList.contains('flat') ? 1 : 0) > 0, id, { timeout: 20000 }).catch(() => console.log('study slow tiles', id));
  await g.waitForTimeout(700);
  let best = null;
  const modes = await cv.evaluate((c) => c.dataset.modes.split(',')); const mat = await cv.evaluate((c) => c.dataset.mat);
  for (const place of ['top', 'bottom']) {
    const groups = await g.evaluate(([i, p]) => { const c = document.querySelector(`.cover[data-id="${i}"]`); window.studyLayout(c, p); const svg = c.querySelector('svg'); svg.style.visibility = 'hidden'; const cr = c.getBoundingClientRect(); const out = []; svg.querySelectorAll('text.h').forEach((t) => { const r = t.getBoundingClientRect(); (out[+t.dataset.g] ||= []).push([r.left - cr.left, r.top - cr.top, r.width, r.height]); }); return out; }, [id, place]);
    const png = (await cv.screenshot()).toString('base64');
    const fills = [], scores = [];
    for (let gi = 0; gi < groups.length; gi++) {
      const mode = modes[gi] || modes[0]; const colors = mode.startsWith('fix:') ? [mode.slice(4)] : mode === 'pref' ? SETS.any : mode === 'vivid' || mode.startsWith('nth:') ? COLOR : mode === 'color' ? [...new Set([mat, ...COLOR])] : SETS[mode];
      const sc = await g.evaluate(async ([src, rs, colors]) => {
        const im = new Image(); im.src = `data:image/png;base64,${src}`; await im.decode();
        const k = im.naturalWidth / document.querySelector('.study .cover').getBoundingClientRect().width;
        const c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight; const x = c.getContext('2d'); x.drawImage(im, 0, 0);
        const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
        const L = (r, g2, b2) => 0.2126 * lin(r) + 0.7152 * lin(g2) + 0.0722 * lin(b2);
        const ls = [];
        for (const [l, t, w, h] of rs) { const d = x.getImageData(Math.max(0, l * k), Math.max(0, t * k), Math.max(1, w * k), Math.max(1, h * k)).data; for (let i = 0; i < d.length; i += 16) ls.push(L(d[i], d[i + 1], d[i + 2])); }
        return colors.map((hex) => { const n = parseInt(hex.slice(1), 16); const lt = L(n >> 16, (n >> 8) & 255, n & 255); const cs = ls.map((lb) => (Math.max(lt, lb) + 0.05) / (Math.min(lt, lb) + 0.05)).sort((p, q) => p - q); return [hex, cs[Math.floor(cs.length * 0.1)]]; });
      }, [png, groups[gi], colors]);
      // A second group takes a different color from the first, so the two voices read apart.
      const YEL = ['#f6d44f', '#fff27a'];
      // Colored type matches the frame when it reads, then tries the other colors before falling back to yellow.
      const rank = ([hex, c]) => mode.startsWith('nth:') ? c : mode === 'vivid' ? (c < 3 ? c - 100 : YEL.includes(hex) ? c : 100 + c) : mode === 'pref' ? (c >= 3 && !MONO.includes(hex) ? 1000 + c : c) : mode !== 'color' ? c : (c < 3 ? c - 100 : hex === mat ? 1000 + c : YEL.includes(hex) ? c : 100 + c);
      const ok = sc.filter(([hex]) => !gi || hex !== fills[0]).sort((p, q) => rank(q) - rank(p));
      const pickN = mode.startsWith('nth:') ? Math.min(+mode.slice(4) - 1, ok.length - 1) : 0;
      fills.push(ok[pickN][0]); scores.push(ok[pickN][1]);
    }
    const score = +Math.min(...scores).toFixed(2);
    if (!best || score > best.score) best = { place, fills, score };
  }
  await g.evaluate(([i, r]) => { const c = document.querySelector(`.cover[data-id="${i}"]`); window.studyLayout(c, r.place); window.studyPaint(c, r.fills); c.querySelector('svg').style.visibility = ''; }, [id, best]);
  result[id] = best; console.log('study', id, best.place, best.fills.join(' '), best.score);
}
fs.writeFileSync('build/study.json', JSON.stringify(result));
fs.mkdirSync('shots/study', { recursive: true });
await g.evaluate((m) => window.studyApply(m), result);
await g.addStyleTag({ content: '.pick[hidden]{display:none !important}' });
const layout = await g.$$eval('.study .cover', (cs) => cs.map((c) => ({ id: c.dataset.id, fill: c.querySelector('text.h').getAttribute('fill'), place: c.dataset.place, t: [...c.querySelectorAll('text.h')].map((t) => ({ text: t.textContent, x: +t.getAttribute('x'), y: +t.getAttribute('y'), size: +t.getAttribute('font-size'), font: t.getAttribute('font-family'), wt: +t.getAttribute('font-weight'), stretch: t.getAttribute('font-stretch'), ls: t.getAttribute('letter-spacing') })) })));
fs.mkdirSync('shots/study', { recursive: true }); fs.writeFileSync('shots/study/layout.json', JSON.stringify(layout, null, 1));
const rows = await g.$$('.srow');
await g.addStyleTag({ content: '.pickbar{display:none !important}' });
for (let i = 0; i < rows.length; i++) await rows[i].screenshot({ path: `shots/study/row${String(i).padStart(2, '0')}.png` });
await b.close(); srv.close(); process.exit(0);
