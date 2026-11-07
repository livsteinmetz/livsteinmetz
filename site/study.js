// Lays out the type on each study cover, then applies the colors measured from the paintings.
const W = 264, X = 18;
function layout(cv, place) {
  const svg = cv.querySelector('svg'), lines = [...svg.querySelectorAll('text.h')], tag = svg.querySelector('text.t');
  const max = +svg.dataset.max, lh = +svg.dataset.lh;
  lines.forEach((t) => t.setAttribute('font-size', 100));
  const wide = Math.max(...lines.map((t) => t.getComputedTextLength()));
  const size = Math.min(max, (W * 100) / wide), step = size * lh, tagH = tag ? 26 : 0;
  lines.forEach((t) => t.setAttribute('font-size', size.toFixed(1)));
  const y0 = place === 'top' ? 20 + size * 0.74 : 400 - 22 - tagH - step * (lines.length - 1);
  lines.forEach((t, i) => { t.setAttribute('x', X); t.setAttribute('y', (y0 + i * step).toFixed(1)); });
  if (tag) { tag.setAttribute('x', X); tag.setAttribute('y', (y0 + step * (lines.length - 1) + 24).toFixed(1)); }
  cv.dataset.place = place;
}
window.studyLayout = layout;
const covers = [...document.querySelectorAll('.study .cover')];
const apply = (m) => covers.forEach((cv) => {
  const r = m[cv.dataset.id];
  layout(cv, r ? r.place : 'bottom');
  if (r) { cv.querySelector('svg').setAttribute('fill', r.fill); cv.closest('.pick').querySelector('.score').textContent = `Contrast ${r.score.toFixed(1)} to 1${r.score < 3 ? ', too low' : ''}`; }
});
document.fonts.ready.then(async () => {
  apply({});
  try { const r = await fetch('/study.json', { cache: 'no-store' }); if (r.ok) apply(await r.json()); } catch (e) { /* the measured colors come with the preview build */ }
  document.documentElement.dataset.ready = '1';
});
let picks = {};
try { picks = JSON.parse(localStorage.getItem('study-picks') || '{}'); } catch (e) { picks = {}; }
const out = document.getElementById('picks');
const show = () => {
  document.querySelectorAll('.pick').forEach((b) => b.setAttribute('aria-pressed', String(picks[b.dataset.card] === b.dataset.opt)));
  const names = [...document.querySelectorAll('.srow')].map((r) => { const b = r.querySelector('.pick'); return picks[b.dataset.card] ? `${r.querySelector('h2').textContent} ${picks[b.dataset.card]}` : null; }).filter(Boolean);
  out.textContent = names.length ? names.join(', ') : 'No picks yet.';
};
document.querySelectorAll('.pick').forEach((b) => b.addEventListener('click', () => {
  picks[b.dataset.card] = picks[b.dataset.card] === b.dataset.opt ? undefined : b.dataset.opt;
  try { localStorage.setItem('study-picks', JSON.stringify(picks)); } catch (e) { /* picks still show for this visit */ }
  show();
}));
document.getElementById('copy').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(out.textContent); document.getElementById('copy').textContent = 'Copied'; } catch (e) { document.getElementById('copy').textContent = 'Select the text to copy'; }
});
show();
