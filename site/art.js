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
  const fit = (root = document) => root.querySelectorAll('.ctitle:not(.long):not(.a-spread) .ln').forEach((l) => {
    const cover = l.closest('.cover'), title = l.parentElement;
    const box = cover.clientWidth * Number(title.dataset.width || 0.86);
    if (!box) return;
    l.style.display = 'inline-block'; l.style.fontSize = '100px';
    const w = l.offsetWidth; l.style.display = '';
    const lines = title.children.length, max = cover.clientHeight * (lines > 2 ? 0.16 : lines > 1 ? 0.22 : 0.3);
    l.style.fontSize = `${(Math.min(100 * box / w, max) / cover.clientWidth * 100).toFixed(2)}cqw`;
  });
  // Items hidden at /admin leave right away; the next build drops them from the page.
  fetch('https://firestore.googleapis.com/v1/projects/livsteinmetz-bb868/databases/(default)/documents/site/settings')
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => {
      if (!d) return;
      const hidden = new Set(JSON.parse(d.fields.json.stringValue).hidden);
      document.querySelectorAll('[data-item]').forEach((el) => { if (hidden.has(el.dataset.item)) el.remove(); });
      document.querySelectorAll('.side').forEach((sec) => { if (!sec.querySelector('li')) sec.remove(); });
    })
    .catch(() => {});

  // Sound stays off until someone asks for it, so a page never starts playing by surprise.
  const audio = new Audio();
  audio.volume = 0.5;
  let sound = false;
  const soundBtn = document.querySelector('.sound');
  if (soundBtn) {
    if (!document.querySelector('[data-preview]')) soundBtn.hidden = true;
    soundBtn.addEventListener('click', () => {
      sound = !sound;
      soundBtn.setAttribute('aria-pressed', sound);
      soundBtn.textContent = sound ? 'Sound on' : 'Sound off';
      if (!sound) audio.pause();
    });
  }
  document.querySelectorAll('[data-preview]').forEach((el) => {
    const link = el.closest('.hang'), cap = link.querySelector('.cap'), label = cap.textContent;
    link.addEventListener('mouseenter', () => {
      cap.textContent = el.dataset.song;
      if (!sound) return;
      audio.src = el.dataset.preview;
      audio.play().then(() => el.classList.add('playing')).catch(() => {});
    });
    link.addEventListener('mouseleave', () => {
      cap.textContent = label;
      audio.pause();
      el.classList.remove('playing');
    });
  });
  document.querySelectorAll('.look .still').forEach((el) => {
    const img = el.querySelector('img');
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      img.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
    });
  });

  const box = document.querySelector('.lookbox');
  if (box) {
    document.querySelectorAll('.look').forEach((a) => a.addEventListener('click', (e) => {
      e.preventDefault();
      box.querySelector('img').src = a.href;
      box.querySelector('p').textContent = a.dataset.caption;
      box.showModal();
    }));
    box.addEventListener('click', () => box.close());
  }

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
    const R = 96, ZOOM = 5;
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
          const i = new Image(); i.alt = '';
          i.style.cssText = `left:${t.left}%;top:${t.top}%;width:${t.width + 0.08}%;height:${t.height + 0.08}%`;
          // Sharp tiles go in only once they've loaded, over the softer copy already showing.
          i.onload = () => z.append(i);
          i.src = t.url;
        });
      };
      c.addEventListener('pointerenter', (e) => {
        if (lens) return;
        lens = document.createElement('span'); lens.className = 'loupe';
        // Start the lens with the tiles already on the cover, so it never opens on an empty patch.
        z = src.cloneNode(true); lens.append(z); src.after(lens);
        const crop = z.dataset.crop.split(',').map(Number);
        all = tiles({ id: z.dataset.barnes, w: +z.dataset.w, h: +z.dataset.h, crop }, 1); done = new Set();
        const r = c.getBoundingClientRect();
        reveal(e.clientX - r.left, e.clientY - r.top);
      });
      c.addEventListener('pointermove', (e) => {
        const r = c.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
        c.style.setProperty('--x', `${x}px`); c.style.setProperty('--y', `${y}px`);
        reveal(x, y);
      });
    });
  }

  document.querySelectorAll('[data-mail]').forEach((a) => { const [u, d] = a.dataset.mail.split('|'); a.href = `mailto:${u}@${d}${a.dataset.subject ? `?subject=${encodeURIComponent(a.dataset.subject)}` : ''}`; });

  // Copy buttons on the send-a-playlist pages.
  const copied = (b, text) => navigator.clipboard?.writeText(text).then(() => { const was = b.textContent; b.textContent = 'Copied'; setTimeout(() => { b.textContent = was; }, 1600); }).catch(() => {});
  document.querySelectorAll('[data-copy]').forEach((b) => { b.onclick = () => copied(b, b.dataset.copy); });
  document.querySelectorAll('[data-copy-list]').forEach((b) => { b.onclick = () => copied(b, [...document.querySelectorAll('.tracks li')].map((li) => `${li.querySelector('.song').textContent} - ${li.querySelector('.by').textContent}`).join('\n')); });

  // Scrolling drifts the shelves, alternating direction, and eases toward where the page is so it glides.
  if (!still) {
    const shelves = [...document.querySelectorAll('.shelf')];
    const at = shelves.map(() => null);
    const reach = () => Math.min(140, innerWidth * 0.22);
    let running = false;
    const target = (s, i) => { const r = s.getBoundingClientRect(); const p = Math.max(-1, Math.min(1, (r.top + r.height / 2 - innerHeight / 2) / innerHeight)); return p * reach() * (i % 2 ? 1 : -1); };
    const step = () => {
      let moving = false;
      shelves.forEach((s, i) => {
        const t = target(s, i);
        const x = at[i] === null ? t : at[i] + (t - at[i]) * 0.12;
        if (Math.abs(t - x) > 0.3) moving = true;
        at[i] = x;
        s.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
      });
      running = moving;
      if (moving) requestAnimationFrame(step);
    };
    addEventListener('scroll', () => { if (!running) { running = true; requestAnimationFrame(step); } }, { passive: true });
    addEventListener('resize', () => { if (!running) { running = true; requestAnimationFrame(step); } });
    step();
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
