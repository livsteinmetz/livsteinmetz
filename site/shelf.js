// The listening shelf: an endless wall of jewel cases you drag around, a side panel
// of what's been playing, and cases that open into the story of each album.
// Opens with the same passcode as the trends page. Visitors can try their own export.
import { summarize } from './summarize.js';

const $ = (id) => document.getElementById(id);
const esc = (s = '') => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const n = (v) => Math.round(v).toLocaleString('en-US');
const day = (k) => new Date(`${k}T12:00:00`);
const addDays = (k, i) => { const d = day(k); d.setDate(d.getDate() + i); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const longDate = (k) => { const d = day(k); return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`; };
const ago = (iso) => {
  const m = (Date.now() - Date.parse(iso)) / 6e4;
  if (m < 60) return `${Math.max(1, Math.round(m))} min ago`;
  if (m < 60 * 24) return `${Math.round(m / 60)} hr ago`;
  if (m < 60 * 24 * 30) return `${Math.round(m / 1440)} days ago`;
  const d = new Date(iso); return `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}, ${d.getFullYear()}`;
};
const hueOf = (s) => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 360; return h; };
const keyOf = (al) => `${al.n}\u0000${al.a}`;

let S = null, who = 'mine';

// What a case shows when there's no cover: the title, set in type on a color of its own.
const art = (al, cls = '') => al.img
  ? `<img class="${cls}" src="${esc(al.img)}" alt="" loading="lazy" decoding="async" draggable="false">`
  : `<span class="sw-type ${cls}" style="--h:${hueOf(al.n + al.a)}"><b>${esc(al.n)}</b><i>${esc(al.a)}</i></span>`;

// ---------- Stats ----------
function stats(s) {
  const mins = s.days.minutes, last = mins.length - 1, endDay = addDays(s.days.start, last);
  let i = mins[last] >= 1 ? last : last - 1, streak = 0;
  while (i >= 0 && mins[i] >= 1) { streak += 1; i -= 1; }
  const week = mins.slice(-7).map((m, j) => ({ m, k: addDays(s.days.start, last - 6 + j) }));
  const month = endDay.slice(0, 7);
  const aotm = s.albums.filter((al) => al.m[month]).sort((p, q) => q.m[month] - p.m[month])[0];
  const yearsOf = (al) => new Set(Object.keys(al.m).map((k) => k.slice(0, 4))).size;
  const love = [...s.albums].sort((p, q) => yearsOf(q) - yearsOf(p) || q.h - p.h)[0];
  const allYears = new Set(Object.keys(s.albums.reduce((o, al) => Object.assign(o, al.m), {})).map((k) => k.slice(0, 4))).size;
  return { endDay, streak, week, month, aotm, firsts: s.albumFirsts?.[month] || 0, love, loveYears: love ? yearsOf(love) : 0, allYears };
}

// ---------- Panel ----------
function panel() {
  const st = stats(S), find = (p) => S.albums.find((al) => al.n === p.al && al.a === p.a);
  const [now, ...before] = S.recent || [];
  const nowAl = now && (find(now) || { n: now.al, a: now.a });
  const pre = (p) => { const al = find(p) || { n: p.al, a: p.a }; return `<li><button type="button" class="sw-row" data-key="${esc(keyOf(al))}">${art(al, 'sw-thumb')}<span><b>${esc(p.t)}</b><i>${esc(p.a)}</i></span><small>${ago(p.at)}</small></button></li>`; };
  const max = Math.max(1, ...st.week.map((w) => w.m));
  const bars = st.week.map((w) => `<li style="--v:${(w.m / max).toFixed(3)}" title="${longDate(w.k)}: ${n(w.m)} min"><span></span><abbr title="${'Sunday Monday Tuesday Wednesday Thursday Friday Saturday'.split(' ')[day(w.k).getDay()]}">${'SMTWTFS'[day(w.k).getDay()]}</abbr></li>`).join('');
  const weekHours = st.week.reduce((a, w) => a + w.m, 0) / 60;
  const mo = MONTHS[+st.month.slice(5) - 1];
  $('panel-body').innerHTML = `
  ${now ? `<section><h2 class="sw-label"><span class="sw-dot"></span>Last played · ${ago(now.at)}</h2>
    <button type="button" class="sw-now" data-key="${esc(keyOf(nowAl))}">${art(nowAl, 'sw-nowart')}<span><b>${esc(now.t)}</b><span>${esc(now.a)}</span><i>${esc(now.al)}</i></span></button>
    ${nowAl.pv ? `<button type="button" class="sw-play" data-src="${esc(nowAl.pv.url)}" aria-pressed="false">▶ Hear a preview</button>` : ''}</section>` : ''}
  ${before.length ? `<section><h2 class="sw-label">Before that</h2><ol class="sw-rows">${before.slice(0, 5).map(pre).join('')}</ol></section>` : ''}
  <section><h2 class="sw-label">On the shelf</h2><dl class="sw-nums"><div><dt>Hours</dt><dd>${n(S.hours)}</dd></div><div><dt>Albums</dt><dd>${n(S.albumCount)}</dd></div><div><dt>Artists</dt><dd>${n(S.artistCount)}</dd></div></dl></section>
  <section><h2 class="sw-label">This week</h2><dl class="sw-nums"><div><dt>Hours</dt><dd>${weekHours.toFixed(weekHours < 10 ? 1 : 0)}</dd></div><div><dt>Day streak</dt><dd>${n(st.streak)}</dd></div></dl><ol class="sw-bars" aria-label="Minutes listened each day this week">${bars}</ol></section>
  <section><h2 class="sw-label">${mo}</h2>
    ${st.aotm ? `<button type="button" class="sw-row sw-feature" data-key="${esc(keyOf(st.aotm))}">${art(st.aotm, 'sw-thumb')}<span><small>Album of the month</small><b>${esc(st.aotm.n)}</b><i>${esc(st.aotm.a)}</i></span></button>` : ''}
    <p class="sw-first"><b>+${n(st.firsts)}</b> album${st.firsts === 1 ? '' : 's'} heard for the first time</p></section>
  ${st.love ? `<section><h2 class="sw-label">Longest love</h2><button type="button" class="sw-row sw-feature" data-key="${esc(keyOf(st.love))}">${art(st.love, 'sw-thumb')}<span><b>${esc(st.love.n)}</b><i>${esc(st.love.a)}</i><small>${st.loveYears === st.allYears ? 'Played every year' : `Played in ${st.loveYears} of ${st.allYears} years`}</small></span></button></section>` : ''}
  <p class="sw-asof">${who === 'sample' ? 'Made-up sample listener' : `As of ${longDate(S.asOf || st.endDay)}`}</p>`;
}

// ---------- Wall ----------
const ZOOMS = [96, 128, 164, 208, 260];
let zi = 2, ox = 0, oy = 0, vx = 0, vy = 0, order = [], drift = !still, raf = 0;
const pool = new Map(), spare = [];
const wall = $('wall'), tiles = $('tiles');
const mod = (a, b) => ((a % b) + b) % b;
// Neighbors land far apart in the shelf, so the same case rarely sits side by side.
const albumAt = (c, r) => order[mod(c * 7 + r * 19 + (mod(r, 3) * 5), order.length)];

function makeTile() {
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'sw-tile'; b.tabIndex = -1;
  b.innerHTML = '<span class="sw-jc"><span class="sw-art"></span></span>';
  tiles.append(b);
  return b;
}
function render() {
  if (!order.length) return;
  const s = ZOOMS[zi], W = wall.clientWidth, H = wall.clientHeight;
  const c0 = Math.floor(-ox / s) - 1, c1 = Math.ceil((W - ox) / s), r0 = Math.floor(-oy / s) - 1, r1 = Math.ceil((H - oy) / s);
  const want = new Set();
  for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
    const k = `${c},${r}`, i = albumAt(c, r);
    want.add(k);
    let el = pool.get(k);
    if (!el) { el = spare.pop() || makeTile(); pool.set(k, el); el.hidden = false; }
    if (el.dataset.i !== String(i)) {
      const al = S.albums[i];
      el.dataset.i = i;
      el.setAttribute('aria-label', `${al.n} by ${al.a}`);
      el.querySelector('.sw-art').innerHTML = art(al);
    }
    el.style.transform = `translate3d(${c * s + ox}px,${r * s + oy}px,0)`;
  }
  for (const [k, el] of pool) if (!want.has(k)) { pool.delete(k); el.hidden = true; spare.push(el); }
  tiles.style.setProperty('--s', `${s}px`);
}
function loop() {
  if (!dragging) {
    ox += vx; oy += vy; vx *= 0.92; vy *= 0.92;
    if (Math.abs(vx) < 0.05 && Math.abs(vy) < 0.05) { vx = 0; vy = 0; if (drift && !document.hidden && !$('case').open) { ox -= 0.18; oy -= 0.09; } }
  }
  render();
  raf = requestAnimationFrame(loop);
}
let dragging = false, moved = 0, lx = 0, ly = 0;
wall.addEventListener('pointerdown', (e) => { if (e.button !== 0) return; dragging = true; moved = 0; lx = e.clientX; ly = e.clientY; vx = vy = 0; wall.setPointerCapture(e.pointerId); wall.classList.add('grab'); });
wall.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const dx = e.clientX - lx, dy = e.clientY - ly;
  ox += dx; oy += dy; vx = dx; vy = dy; lx = e.clientX; ly = e.clientY; moved += Math.abs(dx) + Math.abs(dy);
});
const stop = () => { dragging = false; wall.classList.remove('grab'); };
wall.addEventListener('pointerup', (e) => {
  stop();
  // A tap, not a drag: open what was under it.
  if (moved < 6) { const t = document.elementFromPoint(e.clientX, e.clientY)?.closest('.sw-tile'); if (t) openCase(+t.dataset.i); }
});
wall.addEventListener('pointercancel', stop);
wall.addEventListener('wheel', (e) => { e.preventDefault(); ox -= e.deltaX; oy -= e.deltaY; vx = vy = 0; }, { passive: false });
wall.addEventListener('keydown', (e) => {
  const s = ZOOMS[zi], step = { ArrowLeft: [s, 0], ArrowRight: [-s, 0], ArrowUp: [0, s], ArrowDown: [0, -s] }[e.key];
  if (step) { e.preventDefault(); ox += step[0]; oy += step[1]; drift = false; }
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    const c = Math.floor((wall.clientWidth / 2 - ox) / s), r = Math.floor((wall.clientHeight / 2 - oy) / s);
    openCase(albumAt(c, r));
  }
});
const zoom = (d) => {
  const W = wall.clientWidth / 2, H = wall.clientHeight / 2, old = ZOOMS[zi];
  zi = Math.max(0, Math.min(ZOOMS.length - 1, zi + d));
  const f = ZOOMS[zi] / old; ox = W - (W - ox) * f; oy = H - (H - oy) * f;
};
$('zoom-in').onclick = () => zoom(1);
$('zoom-out').onclick = () => zoom(-1);

// ---------- The case opens ----------
let current = -1;
const audio = $('audio');
function curve(al) {
  const start = S.days.start.slice(0, 7), end = (S.asOf || addDays(S.days.start, S.days.minutes.length - 1)).slice(0, 7), months = [];
  for (let d = day(`${start}-01`); ; d.setMonth(d.getMonth() + 1)) { const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; months.push(k); if (k >= end || months.length > 400) break; }
  const vals = months.map((k) => al.m[k] || 0), max = Math.max(...vals) || 1, W = 480, H = 90;
  const pts = vals.map((v, i) => [(i / Math.max(1, vals.length - 1)) * W, H - (v / max) * (H - 6)]);
  const years = [...new Set(months.map((k) => k.slice(0, 4)))];
  const ticks = years.map((y) => { const i = months.indexOf(`${y}-01`); return i < 0 ? '' : `<text x="${(i / (vals.length - 1)) * W}" y="${H + 16}">${y}</text>`; }).join('');
  return `<figure class="sw-curve"><svg viewBox="0 -4 ${W} ${H + 22}" role="img" aria-label="Hours played each month, ${months[0].slice(0, 4)} to ${end.slice(0, 4)}"><path d="M0,${H} ${pts.map(([x, y]) => `L${x.toFixed(1)},${y.toFixed(1)}`).join(' ')} L${W},${H} Z"/>${ticks}</svg><figcaption>Hours a month</figcaption></figure>`;
}
function disc(al) {
  // Whole copies of artist and title, stretched to fill the rim once around.
  const ring = `${al.a} · ${al.n} · `.toUpperCase(), rep = ring.repeat(Math.max(1, Math.round(62 / ring.length))).slice(0, 120);
  return `<svg class="sw-disc" viewBox="0 0 200 200" aria-hidden="true"><defs><path id="ring" d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0"/><radialGradient id="shine"><stop offset="0.3" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".25"/></radialGradient></defs>
  <circle cx="100" cy="100" r="98" fill="var(--tint)"/><circle cx="100" cy="100" r="98" fill="url(#shine)"/><circle cx="100" cy="100" r="97" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="2"/>
  <text class="sw-ringtext"><textPath href="#ring" textLength="462" lengthAdjust="spacingAndGlyphs">${esc(rep)}</textPath></text>
  <circle cx="100" cy="100" r="26" fill="#f4f2ee" fill-opacity=".85"/><circle cx="100" cy="100" r="9" fill="#111"/></svg>`;
}
function tint(al) {
  const box = $('case');
  box.style.setProperty('--tint', `hsl(${hueOf(al.n + al.a)} 45% 38%)`);
  if (!al.img) return;
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    try {
      const c = document.createElement('canvas'); c.width = c.height = 8;
      const x = c.getContext('2d'); x.drawImage(img, 0, 0, 8, 8);
      const d = x.getImageData(0, 0, 8, 8).data; let r = 0, g = 0, b = 0;
      for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; }
      box.style.setProperty('--tint', `rgb(${r / 64 | 0} ${g / 64 | 0} ${b / 64 | 0})`);
    } catch { /* the cover's server didn't allow reading colors */ }
  };
  img.src = al.img;
}
function openCase(i) {
  if (i == null || !S.albums[i]) return;
  current = i;
  const al = S.albums[i], yrs = Object.keys(al.m).map((k) => k.slice(0, 4)), y0 = yrs.sort()[0], y1 = yrs.at(-1);
  audio.pause();
  $('case-body').innerHTML = `
  <div class="sw-leaf sw-notes">
    <p class="sw-label">${who === 'mine' ? 'From my shelf' : who === 'sample' ? 'From a sample shelf' : 'From your shelf'}</p>
    <h2 id="case-title">${esc(al.n)}</h2><p class="sw-artist">${esc(al.a)}</p>
    ${al.note ? `<blockquote>${esc(al.note)}</blockquote>` : ''}
    <dl class="sw-facts"><div><dt>Plays</dt><dd>${n(al.p)}</dd></div><div><dt>Hours</dt><dd>${al.h < 10 ? al.h.toFixed(1) : n(al.h)}</dd></div><div><dt>First played</dt><dd>${longDate(al.f)}</dd></div><div><dt>Last played</dt><dd>${longDate(al.l)}</dd></div><div><dt>In rotation</dt><dd>${y0 === y1 ? y0 : `${y0} to ${y1}`}</dd></div></dl>
    ${curve(al)}
    ${al.pv ? `<button type="button" class="sw-play" data-src="${esc(al.pv.url)}" aria-pressed="false">▶ Hear a preview${al.pv.t ? `: ${esc(al.pv.t)}` : ''}</button>` : ''}
  </div>
  <div class="sw-leaf sw-tray">${al.img ? `<img class="sw-cover" src="${esc(al.img)}" alt="">` : ''}${al.art?.disc ? `<img class="sw-disc sw-discimg" src="${esc(al.art.disc)}" alt="The disc of ${esc(al.n)}">` : disc(al)}</div>
  ${al.img || al.art?.pages?.length ? `<div class="sw-strip"><ol>${[al.img, ...(al.art?.pages || [])].filter(Boolean).map((src, j) => `<li><button type="button" class="sw-page" data-src="${esc(src)}" aria-label="${j === 0 ? 'Front cover' : `Booklet page ${j}`}"><img src="${esc(src)}" alt="" loading="lazy"></button></li>`).join('')}</ol>${al.art?.mbid ? `<p><a href="https://musicbrainz.org/release/${esc(al.art.mbid)}">Scans from the Cover Art Archive</a></p>` : ''}</div>` : ''}`;
  tint(al);
  if (!$('case').open) $('case').showModal();
}
const step = (d) => openCase(mod(current + d, S.albums.length));
$('case-prev').onclick = () => step(-1);
$('case-next').onclick = () => step(1);
$('case-close').onclick = () => $('case').close();
$('case').addEventListener('close', () => { audio.pause(); });
$('case').addEventListener('click', (e) => { if (e.target === $('case')) $('case').close(); });
$('case').addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') step(-1); if (e.key === 'ArrowRight') step(1); });

// Previews, wherever a play button turns up.
document.addEventListener('click', (e) => {
  const b = e.target.closest('.sw-play');
  if (b) {
    if (b.getAttribute('aria-pressed') === 'true') { audio.pause(); return; }
    document.querySelectorAll('.sw-play[aria-pressed=true]').forEach((x) => x.setAttribute('aria-pressed', 'false'));
    audio.src = b.dataset.src;
    audio.play().then(() => b.setAttribute('aria-pressed', 'true')).catch(() => {});
    return;
  }
  const pg = e.target.closest('.sw-page');
  if (pg) {
    const leaf = document.querySelector('.sw-notes');
    if (!leaf.dataset.notes) leaf.dataset.notes = leaf.innerHTML;
    leaf.classList.add('sw-viewing');
    leaf.innerHTML = `<img class="sw-big" src="${esc(pg.dataset.src)}" alt=""><button type="button" class="sw-play sw-back">Back to notes</button>`;
    return;
  }
  const back = e.target.closest('.sw-back');
  if (back) { const leaf = back.closest('.sw-notes'); leaf.innerHTML = leaf.dataset.notes; leaf.classList.remove('sw-viewing'); return; }
  const row = e.target.closest('[data-key]');
  if (row) openCase(S.albums.findIndex((al) => keyOf(al) === row.dataset.key));
});
audio.addEventListener('pause', () => document.querySelectorAll('.sw-play[aria-pressed=true]').forEach((x) => x.setAttribute('aria-pressed', 'false')));

// ---------- Surprise, list view, fold ----------
$('surprise').onclick = () => {
  const i = Math.floor(Math.random() * S.albums.length);
  const s = ZOOMS[zi], c = Math.floor(Math.random() * 400) - 200;
  // Pan to a spot where that album sits, then open it.
  for (let r = -200; r < 200; r++) if (albumAt(c, r) === i) { ox = wall.clientWidth / 2 - (c + 0.5) * s; oy = wall.clientHeight / 2 - (r + 0.5) * s; break; }
  vx = vy = 0;
  openCase(i);
};
$('view').onclick = () => {
  const on = $('view').getAttribute('aria-pressed') !== 'true';
  $('view').setAttribute('aria-pressed', on);
  $('view').textContent = on ? 'Wall view' : 'List view';
  $('list').hidden = !on;
  $('shelfwall').classList.toggle('listing', on);
  if (on) {
    $('list-items').innerHTML = S.albums.map((al) => `<li><button type="button" data-key="${esc(keyOf(al))}">${art(al, 'sw-thumb')}<span><b>${esc(al.n)}</b><i>${esc(al.a)}</i></span><span class="sw-num">${al.h < 10 ? al.h.toFixed(1) : n(al.h)} hr</span><span class="sw-num">${n(al.p)} plays</span></button></li>`).join('');
    $('list').scrollIntoView({ behavior: still ? 'auto' : 'smooth' });
  }
};
$('fold').onclick = () => {
  const open = $('fold').getAttribute('aria-expanded') !== 'true';
  $('fold').setAttribute('aria-expanded', open); $('fold').textContent = open ? 'Hide' : 'Lately';
  $('panel').classList.toggle('folded', !open);
};
if (matchMedia('(max-width: 760px)').matches) $('fold').click();

// ---------- Whose shelf ----------
function show(shelf, whose) {
  S = shelf; who = whose;
  // Shuffle once, so each visit starts somewhere new.
  order = S.albums.map((_, i) => i).sort(() => Math.random() - 0.5);
  pool.forEach((el) => { el.dataset.i = ''; }); $('gate').hidden = true;
  $('sw-who').textContent = whose === 'mine' ? 'My albums' : whose === 'sample' ? 'A sample listener' : 'Your albums';
  $('sw-sum').textContent = `${n(S.albumCount)} albums · ${n(S.artistCount)} artists · ${n(S.hours)} hours`;
  $('shelfwall').classList.add('ready');
  panel();
  if ($('view').getAttribute('aria-pressed') === 'true') { $('view').click(); $('view').click(); }
  if (!raf) loop();
}
const fromSummary = (s) => ({ albums: s.albums, recent: s.recent, hours: s.hours, albumCount: s.albumCount, artistCount: s.artistCount, albumFirsts: s.albumFirsts, days: { start: s.days.start, minutes: s.days.minutes }, asOf: addDays(s.days.start, s.days.minutes.length - 1) });

// A made-up listener with real albums, so visitors without the passcode can look around.
function sample() {
  const ALBUMS = [['Remain in Light', 'Talking Heads'], ['Arrival', 'ABBA'], ['Father of the Bride', 'Vampire Weekend'], ['Brandenburg Concertos', 'Bach'], ['Hounds of Love', 'Kate Bush'], ['Room 25', 'Noname'], ['Drunk', 'Thundercat'], ['Laurel Hell', 'Mitski'], ['Details', 'Frou Frou'], ['Jubilee', 'Japanese Breakfast'], ['Desire, I Want to Turn Into You', 'Caroline Polachek'], ['Homogenic', 'Björk'], ['Heaven or Las Vegas', 'Cocteau Twins'], ['Like a Virgin', 'Madonna'], ['Das Lied von der Erde', 'Mahler'], ['Messiah', 'Handel'], ['Four Last Songs', 'Richard Strauss'], ['Blue', 'Joni Mitchell'], ['Kind of Blue', 'Miles Davis'], ['Punisher', 'Phoebe Bridgers'], ['Strange Mercy', 'St. Vincent'], ['Promises', 'Floating Points'], ['Rumours', 'Fleetwood Mac'], ['Blonde', 'Frank Ocean'], ['Carrie & Lowell', 'Sufjan Stevens'], ['In Rainbows', 'Radiohead'], ['Titanic Rising', 'Weyes Blood'], ['Goldberg Variations', 'Glenn Gould'], ['Vespertine', 'Björk'], ['Ctrl', 'SZA'], ['The Köln Concert', 'Keith Jarrett'], ['Ys', 'Joanna Newsom'], ['A Love Supreme', 'John Coltrane'], ['Pang', 'Caroline Polachek'], ['Bright Future', 'Adrianne Lenker'], ['Visions', 'Grimes']];
  let seed = 11; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const start = '2019-03-01', total = Math.round((Date.UTC(2026, 9, 31) - Date.UTC(2019, 2, 1)) / 864e5) + 1;
  const minutes = Array.from({ length: total }, () => (rnd() < 0.15 ? 0 : Math.round(20 + rnd() * 110)));
  const albums = ALBUMS.map(([name, artist], j) => {
    const peak = 2019.3 + rnd() * 7.4, width = 0.2 + rnd() * 1.5, m = {}; let h = 0;
    for (let y = 2019; y <= 2026; y++) for (let mo = 0; mo < 12; mo++) {
      const t = y + mo / 12, v = Math.exp(-((t - peak) ** 2) / (2 * width * width)) * (4 + rnd() * 10) + (rnd() < 0.08 ? rnd() * 2 : 0);
      if (v > 0.15 && `${y}-${mo + 1}` !== '2026-12') { m[`${y}-${String(mo + 1).padStart(2, '0')}`] = +v.toFixed(2); h += v; }
    }
    const ks = Object.keys(m).sort();
    return { n: name, a: artist, h: +h.toFixed(2), p: Math.round(h * 14), f: `${ks[0]}-0${1 + (j % 9)}`, l: `${ks.at(-1)}-1${j % 9}`, m };
  }).filter((al) => al.h > 0).sort((p, q) => q.h - p.h);
  const recent = [['Silhouettes', 'Floating Points', 'Promises'], ['Harmony Hall', 'Vampire Weekend', 'Father of the Bride'], ['Kyoto', 'Phoebe Bridgers', 'Punisher'], ['Cruel', 'St. Vincent', 'Strange Mercy'], ['Running Up That Hill', 'Kate Bush', 'Hounds of Love'], ['Cherry-coloured Funk', 'Cocteau Twins', 'Heaven or Las Vegas']]
    .map(([t, a, al], i) => ({ t, a, al, at: new Date(Date.now() - (2 + i * 3.5) * 36e5).toISOString() }));
  return { albums, recent, hours: 2140, albumCount: 612, artistCount: 388, albumFirsts: { '2026-10': 9 }, days: { start, minutes }, asOf: '2026-10-31' };
}

// ---------- Opening it ----------
const keyFor = async (code) => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`livsteinmetz:${code.trim()}`)))].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 40);
const load = async (code) => { try { const r = await fetch(`/l/${await keyFor(code)}.json`); return r.ok ? await r.json() : null; } catch { return null; } };
const logView = (email) => fetch('https://firestore.googleapis.com/v1/projects/livsteinmetz-bb868/databases/(default)/documents/views', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: { email: { stringValue: email.slice(0, 200) }, at: { timestampValue: new Date().toISOString() }, page: { stringValue: 'shelf' } } }) }).catch(() => {});
const store = { get: (k) => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* fine */ } } };

const saved = store.get('listening-code');
const first = saved ? await load(saved) : null;
if (first?.shelf) show(first.shelf, 'mine');
else {
  $('gate').hidden = false;
  if (first && !first.shelf) $('gate-status').textContent = 'The shelf is still being stocked. Come back soon.';
  $('gate').onsubmit = async (e) => {
    e.preventDefault();
    $('gate-status').textContent = 'Opening…';
    const data = await load($('gate-code').value);
    if (!data) { $('gate-status').textContent = "That passcode doesn't match. Check with me for the right one."; return; }
    if (!data.shelf) { $('gate-status').textContent = 'The shelf is still being stocked. Come back soon.'; return; }
    store.set('listening-code', $('gate-code').value);
    logView($('gate-email').value.trim());
    $('gate-status').textContent = '';
    show(data.shelf, 'mine');
  };
  $('gate-sample').onclick = () => show(sample(), 'sample');
}

$('file').onchange = async (e) => {
  try {
    const parts = await Promise.all([...e.target.files].map(async (f) => JSON.parse(await f.text())));
    const s = summarize(parts.flat());
    if (!s.albums?.length) throw new Error('no albums');
    show(fromSummary(s), 'yours');
    $('drop-status').textContent = '';
    $('shelfwall').scrollIntoView({ behavior: still ? 'auto' : 'smooth' });
  } catch {
    $('drop-status').textContent = "That doesn't look like an extended streaming history. Unzip your export and choose the Streaming_History_Audio JSON files inside it.";
  }
};
addEventListener('resize', render);
