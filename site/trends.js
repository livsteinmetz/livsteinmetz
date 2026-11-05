// Draws the listening charts in the browser. A visitor's Spotify export is read
// here and goes nowhere: there is no upload, and closing the tab clears it.
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const INK = '#16246e';
const BANDS = ['#e64aa6', '#66c4ff', '#ef8f35', INK, '#8dbf6a'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const hourName = (h) => (h === 0 ? 'midnight' : h === 12 ? 'noon' : h < 12 ? `${h}am` : `${h - 12}pm`);
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
    out += `<polyline pathLength="1" style="--i:${r}" points="${pts.slice(0, gap).join(' ')}"/><polyline pathLength="1" style="--i:${r}" points="${pts.slice(gap + 3).join(' ')}"/>`;
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
      out += `<line x1="${(cx + r * Math.cos(a)).toFixed(1)}" y1="${(cy + r * Math.sin(a)).toFixed(1)}" x2="${(cx + (r + L) * Math.cos(a)).toFixed(1)}" y2="${(cy + (r + L) * Math.sin(a)).toFixed(1)}" stroke="${i % 2 ? '#d9534a' : INK}" stroke-width="3" pathLength="1" style="--i:${w}"/>`;
    });
    out += `<text x="${cx + 4}" y="${cy - r + 4}" font-size="11">${y}</text>`;
  });
  const marks = [['Jan', 0], ['Apr', 3], ['Jul', 6], ['Oct', 9]].map(([l, m]) => { const a = (m / 12) * 2 * Math.PI - Math.PI / 2, R = 56 + ys.length * 38 + 12; return `<text x="${(cx + R * Math.cos(a)).toFixed(0)}" y="${(cy + R * Math.sin(a) + 5).toFixed(0)}" text-anchor="middle" font-size="14">${l}</text>`; }).join('');
  return `<svg viewBox="0 0 600 600" role="img" aria-label="Listening by week, one ring per year">${out}${marks}</svg>`;
}

function clock(s) {
  const peak = Math.max(...s.clock.flat(), 0.001);
  const cells = s.clock.map((row, m) => row.map((v, h) => `<rect x="${60 + h * 22}" y="${40 + m * 40}" width="21" height="39" fill="${INK}" fill-opacity="${(v / peak).toFixed(2)}" style="--i:${h}"><title>${MONTHS[m]}, ${hourName(h)}: ${Math.round(v)} hours</title></rect>`).join('') + `<text x="50" y="${65 + m * 40}" text-anchor="end" font-size="14">${'JFMAMJJASOND'[m]}</text>`).join('');
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
  const cols = hours.map((v, h) => `<rect x="${h * 25}" y="${260 - (v / peak) * 240}" width="22" height="${(v / peak) * 240}" fill="${INK}" style="--i:${h}"><title>${hourName(h)}: ${v} plays</title></rect>`).join('');
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
  scene('open', top, 'has been on the most for the last four weeks.');
  scene('season', moved.by > 0 ? `${moved.a} is on the rise` : 'My top tracks lately', moved.by > 0 ? `Up ${moved.by} ${moved.by === 1 ? 'spot' : 'spots'} on the last six months. These are my top tracks right now.` : 'From the last four weeks.');
  $('rings').innerHTML = `<ol class="tracks-list">${t.tracks.map((x) => `<li><b>${esc(x.title)}</b> ${esc(x.artist)}</li>`).join('')}</ol>`;
  const hour = t.hours.indexOf(Math.max(...t.hours));
  scene('clock', `I'm at it around ${hourName(hour)}`, 'My last 50 plays by hour of the day.');
  $('clock').innerHTML = bars(t.hours);
  scene('print', 'This is my print', steady.length ? `Drawn from my top artists, led by the ones who've stayed: ${steady.slice(0, 3).join(', ')}.` : 'Drawn from my top artists.');
  const names = t.windows.flatMap((w) => w.artists);
  $('fingerprint').innerHTML = fingerprint({ weeks: names.map((n) => (hash(n) % 100) + 1), top: names.slice(0, 5).map((name) => ({ name })) });
  document.querySelectorAll('.scene').forEach((el) => { el.classList.remove('on'); seen.unobserve(el); seen.observe(el); });
}

function draw(s, who) {
  shown(['open', 'season', 'clock', 'artist', 'print'], true);
  $('hours').hidden = false;
  const me = who === 'mine' ? { I: 'I', my: 'my', Im: "I'm", was: 'my' } : { I: 'You', my: 'your', Im: "You're", was: 'your' };
  $('deck').hidden = false;
  $('hours').dataset.to = s.hours;
  scene('open', `hours of music`, `About ${Math.round(s.hours / 24).toLocaleString()} days straight, from ${s.months[0].slice(0, 4)} to ${s.months.at(-1).slice(0, 4)}.`);
  scene('season', `${seasonOf(s)} is ${me.my} loudest season`, 'One ring per year and one tick per week, so the seasons line up.');
  scene('clock', `${me.Im} at it around ${hourName(peakHour(s))}`, 'Every month, hour by hour. The darker the square, the more was playing.');
  scene('artist', `${s.top[0]?.name || 'Nobody'} takes the top spot`, s.top[0] ? `It peaked in ${peakMonth(s.top[0])}. Here's how the top five rose and fell.` : '');
  scene('print', `This is ${me.my} print`, "It's drawn from every week of listening, so no two come out the same.");
  $('rings').innerHTML = rings(s);
  $('clock').innerHTML = clock(s);
  $('seasons').innerHTML = seasons(s);
  $('fingerprint').innerHTML = fingerprint(s);
  document.querySelectorAll('.scene').forEach((el) => { el.classList.remove('on'); seen.unobserve(el); seen.observe(el); });
}

const seen = new IntersectionObserver((entries) => entries.forEach((e) => {
  if (!e.isIntersecting) return;
  e.target.classList.add('on');
  if (e.target.id === 'scene-open') countUp($('hours'), Number($('hours').dataset.to));
}), { threshold: 0.35 });

const mine = JSON.parse($('history').textContent);
const go = () => $('scene-open').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
const live = JSON.parse($('live').textContent);
const canLive = live.windows?.length && live.tracks?.length;
const own = () => (mine ? draw(mine, 'mine') : drawLive(live));
if (mine || canLive) own(); else $('reset').hidden = true;

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
$('demo').onclick = () => { draw(sample(), 'yours'); go(); };
$('reset').onclick = () => { own(); go(); };
$('save').onclick = () => {
  const svg = $('fingerprint').innerHTML.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  a.download = 'listening-print.svg';
  a.click();
  URL.revokeObjectURL(a.href);
};
