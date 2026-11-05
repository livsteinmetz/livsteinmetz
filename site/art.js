// Builds a crop of a painting out of static IIIF tiles, the way the VXP does.
// The Barnes tile set is pre-rendered at scale factors 1, 2, and 4 in 256px tiles.
export const TILE = 256;
export const BASE = 'https://d2r83x5xt28klo.cloudfront.net/tiles/';

export function tiles({ id, w, h, crop }, sf) {
  const [cx, cy, cw, ch] = crop;
  const left = cx * w, top = cy * h, rw = cw * w, rh = ch * h;
  const step = TILE * sf;
  const out = [];
  for (let y = Math.floor(top / step) * step; y < top + rh && y < h; y += step) {
    for (let x = Math.floor(left / step) * step; x < left + rw && x < w; x += step) {
      const tw = Math.min(step, w - x), th = Math.min(step, h - y);
      out.push({
        url: `${BASE}${id}/${x},${y},${tw},${th}/${Math.ceil(tw / sf)},/0/color.jpg`,
        left: ((x - left) / rw) * 100, top: ((y - top) / rh) * 100,
        width: (tw / rw) * 100, height: (th / rh) * 100,
      });
    }
  }
  return out;
}

export const scaleFor = (regionW, boxW) => {
  const want = regionW / boxW;
  return want >= 4 ? 4 : want >= 2 ? 2 : 1;
};

function paint(el) {
  const crop = el.dataset.crop.split(',').map(Number);
  const a = { id: el.dataset.barnes, w: +el.dataset.w, h: +el.dataset.h, crop };
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const sf = scaleFor(crop[2] * a.w, el.clientWidth * dpr);
  for (const t of tiles(a, sf)) {
    const i = new Image();
    i.alt = ''; i.decoding = 'async'; i.src = t.url;
    i.style.cssText = `left:${t.left}%;top:${t.top}%;width:${t.width + 0.08}%;height:${t.height + 0.08}%`;
    el.append(i);
  }
}

if (typeof document !== 'undefined') {
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { io.unobserve(e.target); paint(e.target); }
  }), { rootMargin: '300px' });
  document.querySelectorAll('.crop[data-barnes]').forEach((c) => io.observe(c));

  // Long lines shrink to fit their cover, whatever font they're in.
  const fit = (root = document) => root.querySelectorAll('.ctitle:not(.long) .ln').forEach((l) => {
    const cover = l.closest('.cover'), box = cover.clientWidth * 0.86;
    if (!box) return;
    l.style.display = 'inline-block'; l.style.fontSize = '100px';
    const w = l.offsetWidth; l.style.display = '';
    const lines = l.parentElement.children.length;
    const max = (cover.clientHeight * (lines > 2 ? 0.17 : lines > 1 ? 0.23 : 0.34));
    l.style.fontSize = `${(Math.min(100 * box / w, max) / cover.clientWidth * 100).toFixed(2)}cqw`;
  });
  document.fonts.ready.then(() => fit());
  document.fonts.addEventListener('loadingdone', () => fit());
  addEventListener('load', () => fit());

  // Clips play while they're on screen, unless motion is reduced.
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const vio = new IntersectionObserver((es) => es.forEach((e) => { e.isIntersecting ? e.target.play().catch(() => {}) : e.target.pause(); }), { threshold: 0.3 });
    document.querySelectorAll('video[data-auto]').forEach((v) => vio.observe(v));
  } else document.querySelectorAll('video[data-auto]').forEach((v) => { v.controls = true; });

  // A loupe that follows the cursor, using the same IIIF tiles at a closer scale.
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (matchMedia('(hover: hover)').matches && !still) {
    const R = 112, ZOOM = 5;
    const glass = document.createElement('div');
    glass.className = 'glass'; glass.setAttribute('aria-hidden', 'true');
    glass.innerHTML = `<svg viewBox="0 0 400 400" width="400" height="400"><defs><linearGradient id="brass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7e3a1"/><stop offset=".5" stop-color="#b8892e"/><stop offset="1" stop-color="#6e4a12"/></linearGradient></defs><g fill="none"><path d="M124 124 L212 212" stroke="#2a1a10" stroke-width="30" stroke-linecap="round" transform="translate(79 79)"/><path d="M203 203 L232 232" stroke="url(#brass)" stroke-width="20"/><circle cx="120" cy="120" r="${R}" stroke="url(#brass)" stroke-width="10"/><circle cx="120" cy="120" r="${R - 7}" stroke="#fff" stroke-opacity=".35" stroke-width="2"/><path d="M58 92 A${R - 22} ${R - 22} 0 0 1 96 50" stroke="#fff" stroke-opacity=".6" stroke-width="5" stroke-linecap="round"/></g></svg>`;
    document.body.append(glass);
    document.querySelectorAll('.cover.has-art').forEach((c) => {
      const src = c.querySelector('.crop[data-barnes]');
      if (!src) return;
      c.classList.add('magnify');
      c.style.setProperty('--r', `${R}px`); c.style.setProperty('--z', ZOOM);
      let lens, z, all, done;
      const reveal = (x, y) => {
        const W = c.clientWidth, H = c.clientHeight, rx = ((R / ZOOM + 12) / W) * 100, ry = ((R / ZOOM + 12) / H) * 100, px = (x / W) * 100, py = (y / H) * 100;
        all.forEach((t, n) => {
          if (done.has(n) || t.left > px + rx || t.left + t.width < px - rx || t.top > py + ry || t.top + t.height < py - ry) return;
          done.add(n);
          const i = new Image(); i.alt = ''; i.src = t.url;
          i.style.cssText = `left:${t.left}%;top:${t.top}%;width:${t.width + 0.08}%;height:${t.height + 0.08}%`;
          z.append(i);
        });
      };
      c.addEventListener('pointerenter', () => {
        glass.classList.add('on');
        if (lens) return;
        lens = document.createElement('span'); lens.className = 'loupe';
        z = src.cloneNode(false); lens.append(z); src.after(lens);
        const crop = z.dataset.crop.split(',').map(Number);
        all = tiles({ id: z.dataset.barnes, w: +z.dataset.w, h: +z.dataset.h, crop }, 1); done = new Set();
      });
      c.addEventListener('pointerleave', () => glass.classList.remove('on'));
      c.addEventListener('pointermove', (e) => {
        const r = c.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
        c.style.setProperty('--x', `${x}px`); c.style.setProperty('--y', `${y}px`);
        glass.style.transform = `translate(${e.clientX - 120}px,${e.clientY - 120}px)`;
        reveal(x, y);
      });
    });
  }

  // Scrolling plays the record, and drifts the shelves.
  if (!still) {
    const vinyl = document.querySelector('.vinyl'), shelves = [...document.querySelectorAll('.shelf')];
    let queued = false;
    const onScroll = () => {
      queued = false;
      vinyl.style.transform = `rotate(${scrollY * 0.4}deg)`;
      shelves.forEach((s, i) => { const r = s.getBoundingClientRect(); s.style.transform = `translateX(${((r.top - innerHeight / 2) / innerHeight) * (i ? 28 : -28)}px)`; });
    };
    addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(onScroll); } }, { passive: true });
    onScroll();
  }

  // Flip the record: hovering a track shows its cover.
  const stage = document.querySelector('[data-stage]');
  if (stage) {
    const covers = [...stage.children];
    const show = (slug) => covers.forEach((c) => {
      const on = c.dataset.slug === slug;
      c.hidden = !on;
      if (on) fit(c);
      if (on) c.querySelectorAll('.crop[data-barnes]:not(:has(img))').forEach(paint);
    });
    document.querySelectorAll('[data-track]').forEach((a) => {
      a.addEventListener('pointerenter', () => show(a.dataset.track));
      a.addEventListener('focus', () => show(a.dataset.track));
    });
    document.querySelector('[data-tracks]')?.addEventListener('pointerleave', () => show(stage.dataset.current));
  }

  // Look closer: the same tiles, in a real deep-zoom viewer.
  const v = document.querySelector('[data-viewer]');
  if (v) new IntersectionObserver(async (es, o) => {
    if (!es[0].isIntersecting) return;
    o.disconnect();
    await new Promise((ok, no) => { const s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/openseadragon@4.1.1/build/openseadragon/openseadragon.min.js'; s.onload = ok; s.onerror = no; document.head.append(s); });
    const OSD = window.OpenSeadragon, id = v.dataset.viewer;
    const get = OSD.IIIFTileSource.prototype.getTileUrl;
    OSD.IIIFTileSource.prototype.getTileUrl = function (...a) { return get.call(this, ...a).replace('default', 'color'); };
    const info = await (await fetch(`${BASE}${id}/info.json`)).json();
    info['@id'] = BASE + id; info.profile[1].qualities = ['color']; info.sizes = [{ width: info.width, height: info.height }];
    info.tiles = [{ width: TILE, height: TILE, scaleFactors: [1, 2, 4] }];
    OSD({ element: v, tileSources: [info], showNavigationControl: false, gestureSettingsMouse: { scrollToZoom: false }, minZoomImageRatio: 0.9 });
  }).observe(v);
}
