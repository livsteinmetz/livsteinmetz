// Renders the favicon, touch icons, and social preview from their source crops with the site fonts.
import fs from 'node:fs';
import { chromium } from 'playwright';
const out = process.argv[2] || 'refs';
fs.mkdirSync(out, { recursive: true });
const FONTS = 'https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..100,800&family=Pirata+One&display=swap';
const b64 = (f) => `data:image/jpeg;base64,${fs.readFileSync(f).toString('base64')}`;
const page = (body) => `<!doctype html><html><head><link rel="stylesheet" href="${FONTS}"><style>html,body{margin:0}.f{position:relative;box-sizing:border-box}.f img{position:absolute;object-fit:cover}.f svg{position:absolute}</style></head><body>${body}</body></html>`;
const ICON = { img: 'site/media/z/sq-t-bass-icon.jpg', fill: '#8dff72' };
const OG = { img: 'site/media/z/w-m-book.jpg', fill: '#ff3d8b' };
const b = await chromium.launch();
const p = await b.newPage({ deviceScaleFactor: 1 });
const lum = (r, g, bl) => { const f = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(bl); };
for (const size of [512, 180, 48, 32]) {
  const fr = Math.max(2, Math.round(size * 0.1)), inner = size - 2 * fr;
  await p.setViewportSize({ width: size, height: size });
  await p.setContent(page(`<div class="f" style="width:${size}px;height:${size}px;background:${ICON.fill}"><img src="${b64(ICON.img)}" style="left:${fr}px;top:${fr}px;width:${inner}px;height:${inner}px"><svg viewBox="0 0 300 300" style="left:${fr}px;top:${fr}px;width:${inner}px;height:${inner}px"><text id="t" x="150" y="150" text-anchor="middle" font-family="Archivo" font-weight="800" font-stretch="62%" font-size="190" fill="${ICON.fill}">OS</text></svg></div>`), { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  // Center on the letters' real ink box, not the em box.
  await p.evaluate(() => { const t = document.getElementById('t'); const bb = t.getBBox(); const cap = bb.height * 0.73; t.setAttribute('y', (150 + cap / 2).toFixed(1)); });
  await p.screenshot({ path: `${out}/icon-${size}.png` });
}
// Contrast of the centered letters against the painting behind them, from the painting alone.
await p.setViewportSize({ width: 512, height: 512 });
await p.setContent(page(`<div class="f" style="width:512px;height:512px"><img src="${b64(ICON.img)}" style="left:51px;top:51px;width:410px;height:410px"><svg viewBox="0 0 300 300" style="left:51px;top:51px;width:410px;height:410px"><text id="t" x="150" y="150" text-anchor="middle" font-family="Archivo" font-weight="800" font-stretch="62%" font-size="190" fill="#000" opacity="0">OS</text></svg></div>`), { waitUntil: 'networkidle' });
await p.evaluate(() => document.fonts.ready);
const box = await p.evaluate(() => { const t = document.getElementById('t'); const bb = t.getBBox(); t.setAttribute('y', (150 + bb.height * 0.73 / 2).toFixed(1)); const r = t.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
await p.screenshot({ path: `${out}/icon-under.png`, clip: { x: box.x, y: box.y + box.h * 0.2, width: box.w, height: box.h * 0.6 } });
console.log('icon box', JSON.stringify(box));
// Social preview: 1200 by 630 with a frame in the type color.
await p.setViewportSize({ width: 1200, height: 630 });
const fr = 36;
await p.setContent(page(`<div class="f" style="width:1200px;height:630px;background:${OG.fill}"><img src="${b64(OG.img)}" style="left:${fr}px;top:${fr}px;width:${1200 - 2 * fr}px;height:${630 - 2 * fr}px"><svg viewBox="0 0 300 157.5" preserveAspectRatio="xMaxYMin meet" style="left:${fr}px;top:${fr}px;width:${1200 - 2 * fr}px;height:${630 - 2 * fr}px"><text x="282" y="62.9" text-anchor="end" font-family="Pirata One" font-size="58" fill="${OG.fill}">Olivia</text><text x="282" y="109.3" text-anchor="end" font-family="Pirata One" font-size="58" fill="${OG.fill}">Steinmetz</text></svg></div>`), { waitUntil: 'networkidle' });
await p.evaluate(() => document.fonts.ready);
await p.screenshot({ path: `${out}/og.jpg`, type: 'jpeg', quality: 88 });
await b.close();
console.log('done', lum(0, 0, 0));
