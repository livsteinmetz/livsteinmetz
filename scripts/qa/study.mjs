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
      const mode = modes[gi] || modes[0]; const colors = mode.startsWith('fix:') || mode.startsWith('tune:') ? [mode.slice(mode.indexOf(':') + 1)] : mode === 'pref' ? SETS.any : mode === 'vivid' || mode.startsWith('nth:') ? COLOR : mode === 'color' ? [...new Set([mat, ...COLOR])] : SETS[mode];
      const sc = await g.evaluate(async ([src, rs, colors, tune]) => {
        const im = new Image(); im.src = `data:image/png;base64,${src}`; await im.decode();
        const k = im.naturalWidth / document.querySelector('.study .cover').getBoundingClientRect().width;
        const c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight; const x = c.getContext('2d'); x.drawImage(im, 0, 0);
        const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
        const L = (r, g2, b2) => 0.2126 * lin(r) + 0.7152 * lin(g2) + 0.0722 * lin(b2);
        const ls = [];
        for (const [l, t, w, h] of rs) { const d = x.getImageData(Math.max(0, l * k), Math.max(0, t * k), Math.max(1, w * k), Math.max(1, h * k)).data; for (let i = 0; i < d.length; i += 16) ls.push(L(d[i], d[i + 1], d[i + 2])); }
        const score = (lt) => { const cs = ls.map((lb) => (Math.max(lt, lb) + 0.05) / (Math.min(lt, lb) + 0.05)).sort((p, q) => p - q); return cs[Math.floor(cs.length * 0.1)]; };
        const lumHex = (hex) => { const n = parseInt(hex.slice(1), 16); return L(n >> 16, (n >> 8) & 255, n & 255); };
        if (!tune) return colors.map((hex) => [hex, score(lumHex(hex))]);
        // Nudge a color's lightness in OKLCH, keeping its hue and as much chroma as fits, until it reads at 3 to 1.
        const toLin = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4), toS = (v) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);
        const oklab = (hex) => { const n = parseInt(hex.slice(1), 16); const [r, g2, b2] = [n >> 16, (n >> 8) & 255, n & 255].map((v) => toLin(v / 255)); const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g2 + 0.0514459929 * b2), m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g2 + 0.1073969566 * b2), s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g2 + 0.6299787005 * b2); return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s]; };
        const rgb = ([Lk, a, b]) => { const l = (Lk + 0.3963377774 * a + 0.2158037573 * b) ** 3, m = (Lk - 0.1055613458 * a - 0.0638541728 * b) ** 3, s = (Lk - 0.0894841775 * a - 1.291485548 * b) ** 3; return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s]; };
        const fit = (Lk, a, b) => { let k2 = 1; for (let i = 0; i < 30; i++) { const c3 = rgb([Lk, a * k2, b * k2]); if (c3.every((v) => v >= -0.0005 && v <= 1.0005)) return c3.map((v) => Math.min(1, Math.max(0, v))); k2 *= 0.92; } return rgb([Lk, 0, 0]).map((v) => Math.min(1, Math.max(0, v))); };
        const hexOf = (c3) => `#${c3.map((v) => Math.round(toS(v) * 255).toString(16).padStart(2, '0')).join('')}`;
        return colors.map((hex) => {
          const [L0, a, b] = oklab(hex);
          let best = [hex, score(lumHex(hex))];
          if (best[1] >= 3) return best;
          for (let d = 0.01; d <= 0.4; d += 0.01) {
            for (const dir of [1, -1]) {
              const Lk = L0 + dir * d; if (Lk < 0 || Lk > 1) continue;
              const h2 = hexOf(fit(Lk, a, b)), sc2 = score(lumHex(h2));
              if (sc2 >= 3) return [h2, sc2];
            }
          }
          return best;
        });
      }, [png, groups[gi], colors, mode.startsWith('tune:')]);
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
