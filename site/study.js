// Lays out the type on each study cover, then applies the colors measured from the paintings.
const W = 264, X = 18;
function layout(cv, place) {
  const svg = cv.querySelector('svg'), lines = [...svg.querySelectorAll('text.h')];
  const max = +svg.dataset.max, lh = +svg.dataset.lh, H = +(svg.dataset.h || 400);
  lines.forEach((t) => t.setAttribute('font-size', 100));
  const fits = lines.map((t) => (W * 100) / (t.getComputedTextLength() * +t.dataset.s));
  const base = Math.min(max, ...fits);
  const sizes = lines.map((t) => base * +t.dataset.s);
  lines.forEach((t, i) => t.setAttribute('font-size', sizes[i].toFixed(1)));
  const ys = []; let y = 20 + sizes[0] * 0.74;
  sizes.forEach((sz, i) => { if (i) y += sz * lh; ys.push(y); });
  const pl = { top: 'tl', bottom: 'bl' }[place] || place;
  const last = ys[ys.length - 1];
  const shift = pl[0] === 't' ? 0 : pl[0] === 'b' ? H - 24 - last : (H - 24 - last) / 2;
  const side = pl === 'cc' ? 'middle' : pl[1] === 'r' ? 'end' : 'start';
  const x = side === 'middle' ? 150 : side === 'end' ? 300 - X : X;
  lines.forEach((t, i) => { t.setAttribute('x', x); t.setAttribute('text-anchor', side); t.setAttribute('y', (ys[i] + shift).toFixed(1)); });
  cv.dataset.place = place;
}
const paint = (cv, fills) => cv.querySelectorAll('text.h').forEach((t) => t.setAttribute('fill', fills[+t.dataset.g] || fills[0]));
window.studyLayout = layout; window.studyPaint = paint;
const covers = [...document.querySelectorAll('.study .cover')];
const apply = (m) => covers.forEach((cv) => {
  const r = m[cv.dataset.id];
  layout(cv, r ? r.place : cv.dataset.places.split(',')[0]);
  if (!r) return;
  paint(cv, r.fills);
  const b = cv.closest('.pick');
  // The frame takes the color of the type, and anything under 3 to 1 stays off the page.
  b.querySelector('.mat').style.setProperty('--mat', r.fills[0]);
  b.querySelector('.score').textContent = `Contrast ${r.score.toFixed(1)} to 1`;
  b.hidden = r.score < 3;
});
window.studyApply = apply;
document.fonts.ready.then(async () => {
  apply({});
  try { const r = await fetch('/study.json', { cache: 'no-store' }); if (r.ok) apply(await r.json()); } catch (e) { /* the measured colors come with the preview build */ }
  document.documentElement.dataset.ready = '1';
});
let picks = {};
try { picks = JSON.parse(localStorage.getItem('study-picks-13') || '{}'); } catch (e) { picks = {}; }
const out = document.getElementById('picks');
const show = () => {
  document.querySelectorAll('.pick').forEach((b) => b.setAttribute('aria-pressed', String(picks[b.dataset.card] === b.dataset.opt)));
  const names = [...document.querySelectorAll('.srow')].map((r) => { const b = r.querySelector('.pick'); return picks[b.dataset.card] ? `${r.querySelector('h2').textContent} ${picks[b.dataset.card]}` : null; }).filter(Boolean);
  out.textContent = names.length ? names.join(', ') : 'No picks yet.';
  const shelf = document.querySelector('.shelfprev');
  if (shelf) {
    shelf.replaceChildren(...[...document.querySelectorAll('.srow:not(.noshelf)')].map((r) => {
      const b = r.querySelector(`.pick[aria-pressed="true"]`);
      if (!b) { const g = document.createElement('div'); g.className = 'gap'; g.textContent = r.querySelector('h2').textContent; return g; }
      return b.querySelector('.mat').cloneNode(true);
    }));
  }
};
document.querySelectorAll('.pick').forEach((b) => b.addEventListener('click', () => {
  picks[b.dataset.card] = picks[b.dataset.card] === b.dataset.opt ? undefined : b.dataset.opt;
  try { localStorage.setItem('study-picks-13', JSON.stringify(picks)); } catch (e) { /* picks still show for this visit */ }
  show();
}));
document.getElementById('copy').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(out.textContent); document.getElementById('copy').textContent = 'Copied'; } catch (e) { document.getElementById('copy').textContent = 'Select the text to copy'; }
});
show();
