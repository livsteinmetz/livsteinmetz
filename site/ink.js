// Pen marks from Olivia's word web: underlines under section titles, a ring around a phrase,
// and lines from a project to the posts written about it. Drawn in once, the way a pen would.
const NS = 'http://www.w3.org/2000/svg';
const PEN = { blue: '#2a3593', red: '#c4304a', green: '#1f7a4a', pencil: '#8a8a8a' };
const still = matchMedia('(prefers-reduced-motion: reduce)');

// Seeded wobble, so a mark looks the same on every visit.
const rng = (s) => () => ((s = (s * 16807) % 2147483647) / 2147483647);
const smooth = (pts) => {
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [x, y] = pts[i], [nx, ny] = pts[i + 1];
    d += ` Q${x.toFixed(1)} ${y.toFixed(1)} ${((x + nx) / 2).toFixed(1)} ${((y + ny) / 2).toFixed(1)}`;
  }
  const l = pts[pts.length - 1];
  return `${d} L${l[0].toFixed(1)} ${l[1].toFixed(1)}`;
};

function svg(host, box, strokes, cls = '') {
  const s = document.createElementNS(NS, 'svg');
  s.setAttribute('class', `ink ${cls}`);
  s.setAttribute('aria-hidden', 'true');
  s.setAttribute('viewBox', `0 0 ${box.w} ${box.h}`);
  Object.assign(s.style, { left: `${box.x}px`, top: `${box.y}px`, width: `${box.w}px`, height: `${box.h}px` });
  for (const [d, color, width] of strokes) {
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', d); p.setAttribute('stroke', color); p.setAttribute('stroke-width', width);
    s.append(p);
  }
  host.append(s);
  s.querySelectorAll('path').forEach((p) => p.style.setProperty('--len', `${Math.ceil(p.getTotalLength()) + 2}`));
  return s;
}
const within = (el, host) => {
  const a = el.getBoundingClientRect(), b = host.getBoundingClientRect();
  return { x: a.left - b.left, y: a.top - b.top, w: a.width, h: a.height };
};
const drawWhenSeen = (s) => {
  if (still.matches) { s.classList.add('drawn'); return; }
  new IntersectionObserver((es, o) => es.forEach((e) => { if (e.isIntersecting) { s.classList.add('draw'); o.disconnect(); } }), { threshold: 0.6 }).observe(s);
};

function underline(el, i) {
  const host = el.parentElement, r = rng(31 + i * 7), b = within(el, host), w = b.w + 12;
  const j = () => (r() - 0.5) * 3;
  const s = svg(host, { x: b.x - 6, y: b.y + b.h - 4, w: w + 8, h: 18 }, [
    [smooth([[2, 6 + j()], [w * 0.35, 4 + j()], [w * 0.7, 6 + j()], [w + 2, 3 + j()]]), i % 2 ? PEN.blue : PEN.red, 2.8],
    [smooth([[9, 13 + j()], [w * 0.4, 11 + j()], [w * 0.8, 13 + j()], [w + 4, 10 + j()]]), i % 3 === 1 ? PEN.red : PEN.green, 2.4],
  ]);
  drawWhenSeen(s);
}

function ring(el, i) {
  const host = el.parentElement, r = rng(57 + i), b = within(el, host);
  const rx = b.w / 2 + 8, ry = b.h / 2 + 2, w = 2 * rx + 14, h = 2 * ry + 14;
  const loop = (k, start) => {
    const pts = [];
    for (let n = 0; n <= 26; n++) {
      const a = start + (n * 2 * Math.PI) / 24, wob = 1 + (r() - 0.5) * 0.03;
      pts.push([w / 2 + rx * k * wob * Math.cos(a), h / 2 + ry * k * wob * Math.sin(a)]);
    }
    return smooth(pts);
  };
  const s = svg(host, { x: b.x + b.w / 2 - w / 2, y: b.y + b.h / 2 - h / 2, w, h }, [[loop(1, 2.6), PEN.blue, 2.4], [loop(1.05, 2.95), PEN.red, 2]]);
  drawWhenSeen(s);
}

// Lines from a project to its posts appear while the project is hovered or focused.
let links = null;
function connect(li) {
  unlink();
  const posts = (li.dataset.reads || '').split(' ').filter(Boolean)
    .flatMap((slug) => [...document.querySelectorAll('#writing li a[href*="medium.com"]')].filter((a) => a.href.includes(`/${slug}`)).map((a) => a.closest('li')));
  if (!posts.length) return;
  const host = document.body, page = document.documentElement, from = within(li, page);
  const strokes = [];
  const box = { x: 0, y: 0, w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight };
  posts.forEach((to, k) => {
    const t = within(to, page);
    if (t.x + t.w < 0 || t.x > innerWidth) return;
    const x0 = from.x + from.w * 0.6, y0 = from.y + from.h - 6, x1 = t.x + t.w * 0.4, y1 = t.y + 6;
    const mid = (y0 + y1) / 2;
    strokes.push([smooth([[x0, y0], [x0 + (x1 - x0) * 0.15, mid], [x1 - (x1 - x0) * 0.2, mid + 8], [x1, y1]]), k % 2 ? PEN.red : PEN.green, 2.6]);
    strokes.push([smooth([[x0 + 5, y0], [x0 + (x1 - x0) * 0.2, mid + 6], [x1 - (x1 - x0) * 0.15, mid], [x1 + 5, y1]]), PEN.blue, 1.8]);
  });
  if (!strokes.length) return;
  links = svg(host, box, strokes, 'links');
  links.classList.add(still.matches ? 'drawn' : 'draw');
}
function unlink() { if (links) { links.remove(); links = null; } }

function start() {
  document.querySelectorAll('svg.ink').forEach((s) => s.remove());
  document.querySelectorAll('.ink-u').forEach(underline);
  document.querySelectorAll('.ink-o').forEach(ring);
}
document.fonts.ready.then(start);
let rt;
addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(start, 200); });
document.querySelectorAll('#working li[data-reads]').forEach((li) => {
  li.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') connect(li); });
  li.addEventListener('pointerleave', unlink);
  li.addEventListener('focusin', () => connect(li));
  li.addEventListener('focusout', unlink);
});
document.querySelectorAll('.shelf').forEach((s) => s.addEventListener('scroll', unlink, { passive: true }));
