// Draws the listening charts in the browser. A visitor's Spotify export is read
// here and goes nowhere: there is no upload, and closing the tab clears it.
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const INK = '#16246e';
const BANDS = ['#e64aa6', '#66c4ff', '#ef8f35', INK, '#8dbf6a'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const hourName = (h) => (h === 0 ? 'midnight' : h === 12 ? 'noon' : h < 12 ? `${h}am` : `${h - 12}pm`);
const ap = (h) => (h === 0 ? 'midnight' : h === 12 ? 'noon' : h < 12 ? `${h} a.m.` : `${h - 12} p.m.`);
const hash = (s) => [...String(s)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
const weekOf = (d) => Math.min(51, Math.floor((d - Date.UTC(d.getUTCFullYear(), 0, 1)) / 6048e5));

// Keeps counts only, so a summary never carries a full listening log.
export function summarize(rows) {
  const years = {}, clock = Array.from({ length: 12 }, () => Array(24).fill(0)), artists = {}, months = new Set();
  let hours = 0;
  for (const r of rows) {
    const when = r.ts || (r.endTime && `${r.endTime.replace(' ', 'T')}:00Z`);
    const ms = r.ms_played ?? r.msPlayed;
    const artist = r.master_metadata_album_artist_name ?? r.artistName;
    if (!when || !ms || !artist) continue;
    const d = new Date(when);
    if (Number.isNaN(+d)) continue;
    const h = ms / 36e5, y = d.getUTCFullYear(), key = `${y}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
    hours += h;
    (years[y] ||= Array(52).fill(0))[weekOf(d)] += h;
    clock[d.getMonth()][d.getHours()] += h;
    months.add(key);
    ((artists[artist] ||= { total: 0, by: {} }).by[key] ||= 0);
    artists[artist].by[key] += h;
    artists[artist].total += h;
  }
  const top = Object.entries(artists).sort((a, b) => b[1].total - a[1].total).slice(0, 5).map(([name, a]) => ({ name, by: a.by }));
  return { hours: Math.round(hours), years, clock, top, months: [...months].sort() };
}

// Sample numbers for visitors who don't have an export yet. Never her listening.
export function sample() {
  const rows = [], names = ['First Artist', 'Second Artist', 'Third Artist', 'Fourth Artist', 'Fifth Artist'];
  for (let t = Date.UTC(2023, 0, 1); t < Date.UTC(2026, 0, 1); t += 36e5 * 5) {
    const d = new Date(t), m = d.getUTCMonth(), h = d.getUTCHours();
    if (Math.random() > 0.35 + 0.25 * Math.cos((m / 12) * 2 * Math.PI) + (h > 18 ? 0.3 : 0)) continue;
    const i = Math.floor(((t / 864e5 / 60) + Math.random() * 2) % 5);
    rows.push({ ts: d.toISOString(), ms_played: 1800000, master_metadata_album_artist_name: names[i] });
  }
  return summarize(rows);
}

function fingerprint(s) {
  const weeks = s.weeks || Object.keys(s.years).sort().flatMap((y) => s.years[y]);
  const peak = Math.max(...weeks, 0.001), at = (i) => weeks[Math.floor(i) % weeks.length] / peak;
  const seed = hash(s.top.map((a) => a.name).join()) % 97, cx = 300, cy = 330;
  let out = '';
  for (let r = 0; r < 24; r++) {
    const R = 20 + r * 12, pts = [];
    for (let a = 0; a <= 360; a += 4) {
      const t = (a * Math.PI) / 180;
      const push = 7 * Math.sin(t * 3 + r * 0.35 + seed) + 9 * at((a / 360) * weeks.length + r * 9) * Math.sin(t * 5 + r);
      const rr = R + push * (0.35 + r / 24);
      pts.push(`${(cx + rr * 0.82 * Math.cos(t)).toFixed(1)},${(cy + rr * 1.05 * Math.sin(t)).toFixed(1)}`);
    }
    const gap = 8 + (seed * (r + 3)) % 70;
    out += `<polyline class="draw" pathLength="1" style="--t:${(r / 24).toFixed(3)}" points="${pts.slice(0, gap).join(' ')}"/><polyline class="draw" pathLength="1" style="--t:${(r / 24).toFixed(3)}" points="${pts.slice(gap + 3).join(' ')}"/>`;
  }
  return `<svg viewBox="0 0 600 660" role="img" aria-label="A fingerprint drawn from weekly listening"><g fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round">${out}</g></svg>`;
}

function rings(s) {
  const ys = Object.keys(s.years).sort().slice(-6), peak = Math.max(...ys.flatMap((y) => s.years[y]), 0.001), cx = 300, cy = 300;
  let out = '';
  ys.forEach((y, i) => {
    const r = 56 + i * 38;
    s.years[y].forEach((v, w) => {
      const a = (w / 52) * 2 * Math.PI - Math.PI / 2, L = 2 + 30 * (v / peak);
      out += `<line x1="${(cx + r * Math.cos(a)).toFixed(1)}" y1="${(cy + r * Math.sin(a)).toFixed(1)}" x2="${(cx + (r + L) * Math.cos(a)).toFixed(1)}" y2="${(cy + (r + L) * Math.sin(a)).toFixed(1)}" stroke="${i % 2 ? '#d9534a' : INK}" stroke-width="3" class="draw" pathLength="1" style="--t:${(w / 52).toFixed(3)}"/>`;
    });
    out += `<text x="${cx + 4}" y="${cy - r + 4}" font-size="11">${y}</text>`;
  });
  const marks = [['Jan', 0], ['Apr', 3], ['Jul', 6], ['Oct', 9]].map(([l, m]) => { const a = (m / 12) * 2 * Math.PI - Math.PI / 2, R = 56 + ys.length * 38 + 12; return `<text x="${(cx + R * Math.cos(a)).toFixed(0)}" y="${(cy + R * Math.sin(a) + 5).toFixed(0)}" text-anchor="middle" font-size="14">${l}</text>`; }).join('');
  return `<svg viewBox="0 0 600 600" role="img" aria-label="Listening by week, one ring per year">${out}${marks}</svg>`;
}

function clock(s) {
  const peak = Math.max(...s.clock.flat(), 0.001);
  const cells = s.clock.map((row, m) => row.map((v, h) => `<rect x="${60 + h * 22}" y="${40 + m * 40}" width="21" height="39" fill="${INK}" fill-opacity="${(v / peak).toFixed(2)}" class="grow" style="--t:${(h / 24).toFixed(3)}"><title>${MONTHS[m]}, ${hourName(h)}: ${Math.round(v)} hours</title></rect>`).join('') + `<text x="50" y="${65 + m * 40}" text-anchor="end" font-size="14">${'JFMAMJJASOND'[m]}</text>`).join('');
  const hours = [['midnight', 0], ['6am', 6], ['noon', 12], ['6pm', 18]].map(([l, h]) => `<text x="${60 + h * 22}" y="30" font-size="14">${l}</text>`).join('');
  return `<svg viewBox="0 0 600 530" role="img" aria-label="Listening by month and hour, in UTC">${hours}${cells}</svg>`;
}

function seasons(s) {
  const months = s.months, W = 1000, H = 420;
  if (months.length < 2 || !s.top.length) return '';
  const series = s.top.map((a) => months.map((m) => a.by[m] || 0));
  const tot = months.map((_, i) => series.reduce((n, a) => n + a[i], 0)), peak = Math.max(...tot, 0.001);
  const x = (i) => (i / (months.length - 1)) * W, y = (v) => H / 2 + (v / peak) * (H / 2 - 10);
  let base = tot.map((t) => -t / 2), out = '', legend = '';
  series.forEach((a, k) => {
    const top = base.map((b, i) => b + a[i]);
    out += `<polygon fill="${BANDS[k]}" points="${top.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')} ${base.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).reverse().join(' ')}"/>`;
    base = top;
    legend += `<li><i style="background:${BANDS[k]}"></i>${esc(s.top[k].name)}</li>`;
  });
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Top five artists by month">${out}</svg><ul class="legend">${legend}</ul>`;
}

const seasonOf = (s) => {
  const groups = { Winter: [11, 0, 1], Spring: [2, 3, 4], Summer: [5, 6, 7], Fall: [8, 9, 10] };
  const sum = (ms) => ms.reduce((n, m) => n + s.clock[m].reduce((a, b) => a + b, 0), 0);
  return Object.keys(groups).sort((a, b) => sum(groups[b]) - sum(groups[a]))[0];
};
const peakHour = (s) => { const t = Array(24).fill(0); s.clock.forEach((r) => r.forEach((v, h) => { t[h] += v; })); return t.indexOf(Math.max(...t)); };
const peakMonth = (a) => { const [k] = Object.entries(a.by).sort((x, y) => y[1] - x[1])[0]; const [y, m] = k.split('-'); return `${MONTHS[m - 1]} ${y}`; };

function scene(id, line, sub) { $(`${id}-line`).textContent = line; $(`${id}-sub`).textContent = sub; }

function countUp(el, to) {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (still) { el.textContent = to.toLocaleString(); return; }
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min(1, (now - start) / 1400);
    el.textContent = Math.round(to * (1 - (1 - t) ** 3)).toLocaleString();
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

const shown = (ids, on) => ids.forEach((id) => { $(`scene-${id}`).hidden = !on; });

function bars(hours) {
  const peak = Math.max(...hours, 1);
  const cols = hours.map((v, h) => `<rect x="${h * 25}" y="${260 - (v / peak) * 240}" width="22" height="${(v / peak) * 240}" fill="${INK}" class="grow" style="--t:${(h / 24).toFixed(3)}"><title>${hourName(h)}: ${v} plays</title></rect>`).join('');
  const marks = [['midnight', 0], ['6am', 6], ['noon', 12], ['6pm', 18]].map(([l, h]) => `<text x="${h * 25}" y="284" font-size="14">${l}</text>`).join('');
  return `<svg viewBox="0 0 600 290" role="img" aria-label="My last 50 plays by hour of day">${cols}${marks}</svg>`;
}

// The live view, from what Spotify shares day to day. The full history replaces it.
function drawLive(t) {
  const [now, mid] = t.windows, top = now.artists[0];
  const moved = now.artists.map((a) => ({ a, by: (mid.artists.includes(a) ? mid.artists.indexOf(a) : 10) - now.artists.indexOf(a) })).sort((x, y) => y.by - x.by)[0];
  const steady = now.artists.filter((a) => t.windows.every((w) => w.artists.includes(a)));
  $('deck').hidden = false;
  shown(['open', 'season', 'clock', 'print'], true);
  shown(['artist'], false);
  $('hours').hidden = true;
  scene('open', `${top} has been on more than anyone else this month.`, '');
  scene('season', moved.by > 0 ? `${moved.a} climbed ${moved.by} ${moved.by === 1 ? 'spot' : 'spots'}.` : 'What has been on repeat.', 'My most-played songs of the last four weeks.');
  $('rings').innerHTML = `<ol class="tracks-list">${t.tracks.map((x, i) => `<li class="in" style="--t:${(i / t.tracks.length).toFixed(3)}"><b>${esc(x.title)}</b> ${esc(x.artist)}</li>`).join('')}</ol>`;
  const hour = t.hours.indexOf(Math.max(...t.hours));
  scene('clock', `Most of my listening happens around ${ap(hour)}.`, 'My last 50 plays, by hour.');
  $('clock').innerHTML = bars(t.hours);
  if (library) drawLibrary(library);
  scene('print', 'All of it, drawn as a fingerprint.', 'Each ridge bends with a week of saved music.');
  const names = t.windows.flatMap((w) => w.artists);
  const weeks = library ? Object.keys(library.adds).sort().flatMap((y) => library.adds[y]) : names.map((n) => (hash(n) % 100) + 1);
  $('fingerprint').innerHTML = fingerprint({ weeks, top: names.slice(0, 5).map((name) => ({ name })) });
  tick();
}

function draw(s, who) {
  document.querySelectorAll('.lib').forEach((el) => { el.hidden = who !== 'mine' || !library; });
  shown(['open', 'season', 'clock', 'artist', 'print'], true);
  $('hours').hidden = false;
  const me = who === 'mine' ? { I: 'I', my: 'my', Im: "I'm", was: 'my' } : { I: 'You', my: 'your', Im: "You're", was: 'your' };
  $('deck').hidden = false;
  $('hours').dataset.to = s.hours;
  scene('open', 'hours of music.', `About ${Math.round(s.hours / 24).toLocaleString()} days, end to end, from ${s.months[0].slice(0, 4)} to ${s.months.at(-1).slice(0, 4)}.`);
  scene('season', `${me.I} listen most in the ${seasonOf(s).toLowerCase()}.`, 'Each ring is a year. Each tick, a week.');
  scene('clock', `The peak comes around ${ap(peakHour(s))}.`, 'Every month, hour by hour.');
  scene('artist', s.top[0] ? `No one got more plays than ${s.top[0].name}.` : '', s.top[0] ? `The peak: ${peakMonth(s.top[0])}.` : '');
  scene('print', 'All of it, drawn as a fingerprint.', 'Each ridge bends with a week of listening.');
  $('rings').innerHTML = rings(s);
  $('clock').innerHTML = clock(s);
  $('seasons').innerHTML = seasons(s);
  $('fingerprint').innerHTML = fingerprint(s);
  tick();
}

const library = JSON.parse($('library').textContent);
const diary = JSON.parse($('diary').textContent);

const decadesChart = (l) => {
  const rows = Object.entries(l.decades).sort((a, b) => a[0] - b[0]), peak = Math.max(...rows.map(([, d]) => d.count), 1);
  return `<div class="deck-bars">${rows.map(([k, d]) => `<button type="button" data-d="${k}" style="--h:${Math.max(3, (d.count / peak) * 100)}%;--t:${(rows.findIndex(([x]) => x === k) / rows.length).toFixed(3)}"><i></i><span>${k.slice(2)}s</span></button>`).join('')}</div><p id="decade-note" class="note" role="status"></p>`;
};
const gigChart = (l) => `<ol class="gig-list">${l.gigs.map((g, i) => `<li class="in" style="--t:${(i / l.gigs.length).toFixed(3)}"><time>${g.date}</time><b>${esc(g.title)}</b><span>${esc(g.composer)}, ${g.tracks} tracks</span></li>`).join('')}</ol>`;
const diaryChart = (days) => {
  const names = [...new Set(days.flatMap((d) => d.artists))];
  return `<div class="diary">${days.map((d) => `<div class="day"><time>${d.d.slice(5)}</time>${d.artists.map((a) => `<i title="${esc(a)}" style="background:${BANDS[names.indexOf(a) % 5]}"></i>`).join('')}</div>`).join('')}</div>`;
};

function hueOf(img) {
  const c = document.createElement('canvas');
  c.width = c.height = 1;
  const x = c.getContext('2d');
  x.drawImage(img, 0, 0, 1, 1);
  const [r, g, b] = x.getImageData(0, 0, 1, 1).data, max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  if (d < 18) return 400 + max / 10;
  return ((max === r ? (g - b) / d : max === g ? 2 + (b - r) / d : 4 + (r - g) / d) * 60 + 360) % 360;
}

function drawLibrary(l) {
  document.querySelectorAll('.lib').forEach((el) => { el.hidden = false; });
  const adds = Object.values(l.adds).flat(), totalAdds = adds.reduce((a, b) => a + b, 0);
  const byMonth = Array.from({ length: 12 }, (_, m) => Object.values(l.adds).reduce((n, w) => n + w.slice(Math.floor(m * 4.33), Math.floor((m + 1) * 4.33)).reduce((a, b) => a + b, 0), 0));
  const sum = (ms) => ms.reduce((n, m) => n + byMonth[m], 0), g = { winter: [11, 0, 1], spring: [2, 3, 4], summer: [5, 6, 7], fall: [8, 9, 10] };
  const best = Object.keys(g).sort((a, b) => sum(g[b]) - sum(g[a]))[0];
  scene('lib-rings', `I save the most music in the ${best}.`, `${totalAdds.toLocaleString()} songs. Each ring is a year. Each tick, a week.`);
  $('lib-rings-plate').innerHTML = rings({ years: l.adds });

  const era = Object.entries(l.decades).sort((a, b) => b[1].count - a[1].count)[0];
  scene('decades', `More of my library comes from the ${era[0]}s than any other decade.`, '');
  $('decades-plate').innerHTML = decadesChart(l);
  const pick = (k) => {
    document.querySelectorAll('[data-d]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.d === k));
    $('decade-note').textContent = `${k}s: ${l.decades[k].count.toLocaleString()} songs. ${l.decades[k].artists.join(', ')}.`;
  };
  document.querySelectorAll('[data-d]').forEach((b) => { b.onclick = () => pick(b.dataset.d); b.onmouseenter = () => pick(b.dataset.d); });
  pick(era[0]);
  const eras = Object.keys(l.decades).sort((a, b) => a - b);
  scrub['scene-decades'] = (p) => pick(p >= 1 ? era[0] : eras[Math.min(eras.length - 1, Math.floor(p * eras.length))]);

  const years = Object.keys(l.firsts).sort(), range = $('year');
  const totalArtists = years.reduce((n, y) => n + l.firsts[y].count, 0);
  scene('discover', `${totalArtists.toLocaleString()} artists have made it into my playlists.`, '');
  range.min = 0; range.max = years.length - 1; range.value = 0;
  const showYear = () => {
    const y = years[range.value], f = l.firsts[y];
    $('year-out').textContent = y;
    $('discover-plate').innerHTML = `<p class="big-num">${f.count.toLocaleString()}</p><p class="note">new in ${y}</p><ul class="cloud">${f.artists.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>`;
  };
  showYear();
  scrub['scene-discover'] = (p) => { const i = Math.min(years.length - 1, Math.floor(p * years.length)); if (String(i) !== range.value) { range.value = i; showYear(); } };

  $('scene-gigs').hidden = !l.gigs.length;
  if (l.gigs.length) {
    scene('gigs', `${l.gigs.length} programs, each with its own playlist.`, 'What I listened to before I played it.');
    $('gigs-plate').innerHTML = gigChart(l);
  }

  $('scene-titles').hidden = !l.titles.length;
  if (l.titles.length) {
    let i = Math.floor(Math.random() * l.titles.length);
    const next = () => { i = (i + 1) % l.titles.length; $('title-text').textContent = l.titles[i]; };
    $('title-next').onclick = next;
    next();
  }

  scene('wall', `${l.wall.length} playlists, sorted by color.`, '');
  $('wall-plate').innerHTML = `<div class="wall">${l.wall.map((p, i) => `<img class="in" style="--t:${((i * 37 % 100) / 100).toFixed(2)}" crossorigin="anonymous" src="${p.image}" alt="${esc(p.title)}" title="${esc(p.title)}">`).join('')}</div>`;
  const imgs = [...$('wall-plate').querySelectorAll('img')];
  Promise.all(imgs.map((im) => (im.complete ? 0 : new Promise((r) => { im.onload = r; im.onerror = r; })))).then(() => {
    try {
      const wall = $('wall-plate').firstChild;
      imgs.map((im) => [hueOf(im), im]).sort((a, b) => a[0] - b[0]).forEach(([, im]) => wall.append(im));
    } catch { /* keep the original order if the browser won't read the pixels */ }
  });

  $('scene-diary').hidden = diary.length < 7;
  if (diary.length >= 7) {
    scene('diary', 'The page keeps its own diary.', `Each morning it records who has been on. ${diary.length} days so far.`);
    $('diary-plate').innerHTML = diaryChart(diary.slice(-60));
  }
}

// Scroll drives everything: each scene pins, and its charts draw as you move
// through it. With reduced motion the scenes stay finished and nothing pins.
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
const scenes = [...document.querySelectorAll('.scene:not(.static)')];
scenes.forEach((el) => {
  const pin = document.createElement('div');
  pin.className = 'pin';
  pin.append(...el.childNodes);
  el.append(pin);
});
let scrub = {};
let queued = false;
function tick() {
  queued = false;
  const vh = innerHeight;
  for (const el of scenes) {
    if (el.hidden || $('deck').hidden && el.closest('#deck')) continue;
    const r = el.getBoundingClientRect();
    const p = still ? 1 : Math.min(1, Math.max(0, (vh * 0.5 - r.top) / Math.max(1, r.height - vh * 0.75)));
    el.style.setProperty('--p', p.toFixed(3));
    if (el.id === 'scene-open' && !$('hours').hidden) $('hours').textContent = Math.round(Number($('hours').dataset.to) * p).toLocaleString();
    scrub[el.id]?.(p);
  }
  const page = document.documentElement;
  $('progress').style.transform = `scaleX(${(scrollY / Math.max(1, page.scrollHeight - vh)).toFixed(4)})`;
}
const queue = () => { if (!queued) { queued = true; requestAnimationFrame(tick); } };
addEventListener('scroll', queue, { passive: true });
addEventListener('resize', queue);

const mine = JSON.parse($('history').textContent);
const go = () => $('scene-open').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
const live = JSON.parse($('live').textContent);
const canLive = live.windows?.length && live.tracks?.length;
const own = () => (mine ? draw(mine, 'mine') : drawLive(live));
if (mine || canLive) own(); else $('reset').hidden = true;
if (library && canLive) $('demo').textContent = 'See it with my data';
tick();

$('file').onchange = async (e) => {
  try {
    const parts = await Promise.all([...e.target.files].map(async (f) => JSON.parse(await f.text())));
    const s = summarize(parts.flat());
    if (!s.hours) throw new Error('empty');
    draw(s, 'yours');
    $('drop-status').textContent = '';
    go();
  } catch {
    $('drop-status').textContent = "That doesn't look like a Spotify history file. Unzip your export and choose the JSON files inside it.";
  }
};
// Stands in for the full streaming history until it arrives: real saved-song
// weeks and real top artists, with play time estimated from those saves.
function modeled() {
  const years = library.adds, weeks = Object.entries(years);
  const season = Array.from({ length: 12 }, (_, m) => weeks.reduce((n, [, w]) => n + w.slice(Math.floor(m * 4.33), Math.floor((m + 1) * 4.33)).reduce((a, b) => a + b, 0), 0));
  const clockOf = live.hours?.some(Boolean) ? live.hours : Array(24).fill(1);
  const clock = season.map((v) => clockOf.map((h) => v * (h + 0.3)));
  const months = weeks.flatMap(([y]) => Array.from({ length: 12 }, (_, m) => `${y}-${String(m + 1).padStart(2, '0')}`));
  const top = live.windows[0].artists.slice(0, 5).map((name, i) => ({ name, by: Object.fromEntries(months.map((k, n) => [k, 1 + (hash(name + k) % 5) * (1 + Math.sin(n / 5 + i * 1.7))])) }));
  const hours = Math.round(weeks.flatMap(([, w]) => w).reduce((a, b) => a + b, 0) * 3.5 / 60);
  return { hours, years, clock, top, months };
}
$('demo').onclick = () => { draw(library && canLive ? modeled() : sample(), 'mine'); $('open-sub').textContent = 'An estimate, built from the songs I have saved.'; go(); };
$('reset').onclick = () => { own(); go(); };
$('save').onclick = () => {
  const svg = $('fingerprint').innerHTML.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  a.download = 'listening-print.svg';
  a.click();
  URL.revokeObjectURL(a.href);
};
