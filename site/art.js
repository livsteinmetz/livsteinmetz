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
  const fit = (root = document) => root.querySelectorAll('.ln:not(.wrap)').forEach((l) => {
    const box = l.parentElement.clientWidth;
    if (!box) return;
    l.style.display = 'inline-block';
    const w = l.offsetWidth, cur = parseFloat(l.style.fontSize);
    if (w > box) l.style.fontSize = `${(cur * box / w * 0.985).toFixed(2)}cqw`;
    l.style.display = '';
  });
  document.fonts.ready.then(() => fit());

  // Clips play while they're on screen, unless motion is reduced.
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const vio = new IntersectionObserver((es) => es.forEach((e) => { e.isIntersecting ? e.target.play().catch(() => {}) : e.target.pause(); }), { threshold: 0.3 });
    document.querySelectorAll('video[data-auto]').forEach((v) => vio.observe(v));
  } else document.querySelectorAll('video[data-auto]').forEach((v) => { v.controls = true; });

  // A loupe that follows the cursor, using the same IIIF tiles at a closer scale.
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (matchMedia('(hover: hover)').matches && !still) {
    document.querySelectorAll('.cover.has-art').forEach((c) => {
      const src = c.querySelector('.crop[data-barnes]');
      if (!src) return;
      let lens;
      c.addEventListener('pointerenter', () => {
        if (lens) return;
        lens = document.createElement('span'); lens.className = 'loupe';
        const z = src.cloneNode(false); lens.append(z);
        src.after(lens);
        const crop = z.dataset.crop.split(',').map(Number);
        const a = { id: z.dataset.barnes, w: +z.dataset.w, h: +z.dataset.h, crop };
        for (const t of tiles(a, scaleFor(crop[2] * a.w, c.clientWidth * 2.6 * 1.5))) {
          const i = new Image(); i.alt = ''; i.src = t.url;
          i.style.cssText = `left:${t.left}%;top:${t.top}%;width:${t.width + 0.08}%;height:${t.height + 0.08}%`;
          z.append(i);
        }
      });
      c.addEventListener('pointermove', (e) => {
        const r = c.getBoundingClientRect();
        c.style.setProperty('--x', `${e.clientX - r.left}px`);
        c.style.setProperty('--y', `${e.clientY - r.top}px`);
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
