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

  // Flip the record: hovering a track shows its cover.
  const stage = document.querySelector('[data-stage]');
  if (stage) {
    const covers = [...stage.children];
    const show = (slug) => covers.forEach((c) => {
      const on = c.dataset.slug === slug;
      c.hidden = !on;
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
    info['@id'] = BASE + id; info.sizes = [{ width: info.width, height: info.height }];
    info.tiles = [{ width: TILE, height: TILE, scaleFactors: [1, 2, 4] }];
    OSD({ element: v, tileSources: [info], showNavigationControl: false, gestureSettingsMouse: { scrollToZoom: false }, minZoomImageRatio: 0.9, crossOriginPolicy: 'Anonymous' });
  }).observe(v);
}
