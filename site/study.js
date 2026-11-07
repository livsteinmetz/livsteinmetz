// Lays out the type on each study cover, then applies the colors measured from the paintings.
const W = 264, X = 18;
function layout(cv, place) {
  const svg = cv.querySelector('svg'), lines = [...svg.querySelectorAll('text.h')];
  const max = +svg.dataset.max, lh = +svg.dataset.lh;
  lines.forEach((t) => t.setAttribute('font-size', 100));
  const fits = lines.map((t) => (W * 100) / (t.getComputedTextLength() * +t.dataset.s));
  const base = Math.min(max, ...fits);
  const sizes = lines.map((t) => base * +t.dataset.s);
  lines.forEach((t, i) => t.setAttribute('font-size', sizes[i].toFixed(1)));
  const ys = []; let y = 20 + sizes[0] * 0.74;
  sizes.forEach((sz, i) => { if (i) y += sz * lh; ys.push(y); });
  const shift = place === 'top' ? 0 : 400 - 24 - ys[ys.length - 1];
  lines.forEach((t, i) => { t.setAttribute('x', X); t.setAttribute('y', (ys[i] + shift).toFixed(1)); });
  cv.dataset.place = place;
}
const paint = (cv, fills) => cv.querySelectorAll('text.h').forEach((t) => t.setAttribute('fill', fills[+t.dataset.g] || fills[0]));
window.studyLayout = layout; window.studyPaint = paint;
const covers = [...document.querySelectorAll('.study .cover')];
const apply = (m) => covers.forEach((cv) => {
  const r = m[cv.dataset.id];
  layout(cv, r ? r.place : 'bottom');
  if (r) { paint(cv, r.fills); cv.closest('.pick').querySelector('.score').textContent = `Contrast ${r.score.toFixed(1)} to 1${r.score < 3 ? ', too low' : ''}`; }
});
document.fonts.ready.then(async () => {
  apply({});
  try { const r = await fetch('/study.json', { cache: 'no-store' }); if (r.ok) apply(await r.json()); } catch (e) { /* the measured colors come with the preview build */ }
  document.documentElement.dataset.ready = '1';
});
let picks = {};
try { picks = JSON.parse(localStorage.getItem('study-picks-2') || '{}'); } catch (e) { picks = {}; }
const out = document.getElementById('picks');
const show = () => {
  document.querySelectorAll('.pick').forEach((b) => b.setAttribute('aria-pressed', String(picks[b.dataset.card] === b.dataset.opt)));
  const names = [...document.querySelectorAll('.srow')].map((r) => { const b = r.querySelector('.pick'); return picks[b.dataset.card] ? `${r.querySelector('h2').textContent} ${picks[b.dataset.card]}` : null; }).filter(Boolean);
  out.textContent = names.length ? names.join(', ') : 'No picks yet.';
};
document.querySelectorAll('.pick').forEach((b) => b.addEventListener('click', () => {
  picks[b.dataset.card] = picks[b.dataset.card] === b.dataset.opt ? undefined : b.dataset.opt;
  try { localStorage.setItem('study-picks-2', JSON.stringify(picks)); } catch (e) { /* picks still show for this visit */ }
  show();
}));
document.getElementById('copy').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(out.textContent); document.getElementById('copy').textContent = 'Copied'; } catch (e) { document.getElementById('copy').textContent = 'Select the text to copy'; }
});
show();
