// Draws the listening story in the browser. A visitor's Spotify export is read
// here and goes nowhere: there is no upload, and closing the tab clears it.
import { summarize } from './summarize.js';
const library = JSON.parse(document.getElementById('library').textContent);

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const INK = '#16246e', RED = '#c9321a';
const RIVER = ['#e64aa6', '#66c4ff', '#ef8f35', '#16246e', '#8dbf6a', '#f6d44f', '#b15e8f', '#3aa8a0', '#c9321a', '#efa090', '#2f6b4f', '#9ab3e6', '#d98c2b', '#6c4fa3'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const hourName = (h) => (h === 0 ? 'midnight' : h === 12 ? 'noon' : h < 12 ? `${h}am` : `${h - 12}pm`);
const ap = (h) => (h === 0 ? 'midnight' : h === 12 ? 'noon' : h < 12 ? `${h} a.m.` : `${h - 12} p.m.`);
const n = (v) => Math.round(v).toLocaleString();
const dateOf = (start, i) => { const d = new Date(`${start}T12:00:00`); d.setDate(d.getDate() + i); return d; };
const nice = (d) => `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;

// Sample numbers for visitors who don't have an export yet. Never her listening.
function sample() {
  const rows = [], names = ['First Artist', 'Second Artist', 'Third Artist', 'Fourth Artist', 'Fifth Artist'];
  for (let t = Date.UTC(2023, 0, 1); t < Date.UTC(2026, 0, 1); t += 36e5 * 5) {
    const d = new Date(t), m = d.getUTCMonth(), h = d.getUTCHours();
    if (Math.random() > 0.35 + 0.25 * Math.cos((m / 12) * 2 * Math.PI) + (h > 18 ? 0.3 : 0)) continue;
    const i = Math.floor(((t / 864e5 / 60) + Math.random() * 2) % 5);
    rows.push({ ts: d.toISOString(), ms_played: 1800000, master_metadata_album_artist_name: names[i] });
  }
  return summarize(rows);
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
  return `<svg viewBox="0 0 600 560" role="img" aria-label="Listening by month and hour, in local time">${hours}${cells}</svg>`;
}

const seasonOf = (s) => {
  const groups = { Winter: [11, 0, 1], Spring: [2, 3, 4], Summer: [5, 6, 7], Fall: [8, 9, 10] };
  const sum = (ms) => ms.reduce((n, m) => n + s.clock[m].reduce((a, b) => a + b, 0), 0);
  return Object.keys(groups).sort((a, b) => sum(groups[b]) - sum(groups[a]))[0];
};
const peakHour = (s) => { const t = Array(24).fill(0); s.clock.forEach((r) => r.forEach((v, h) => { t[h] += v; })); return t.indexOf(Math.max(...t)); };
const peakMonth = (a) => { const [k] = Object.entries(a.by).sort((x, y) => y[1] - x[1])[0]; const [y, m] = k.split('-'); return `${MONTHS[m - 1]} ${y}`; };


function scene(id, line, sub) { if ($(`${id}-line`)) $(`${id}-line`).textContent = line; if ($(`${id}-sub`)) $(`${id}-sub`).textContent = sub; }
let scrub = {};

// Smooth curve through points, so the river reads as water rather than steps.
const curve = (pts) => pts.map(([x, y], i) => {
  if (!i) return `M${x.toFixed(1)},${y.toFixed(1)}`;
  const [x0, y0] = pts[Math.max(0, i - 2)], [x1, y1] = pts[i - 1], [x3, y3] = pts[Math.min(pts.length - 1, i + 1)];
  return `C${(x1 + (x - x0) / 6).toFixed(1)},${(y1 + (y - y0) / 6).toFixed(1)} ${(x - (x3 - x1) / 6).toFixed(1)},${(y - (y3 - y1) / 6).toFixed(1)} ${x.toFixed(1)},${y.toFixed(1)}`;
}).join('');
const smooth = (a) => a.map((_, i) => (a[Math.max(0, i - 1)] + a[i] * 2 + a[Math.min(a.length - 1, i + 1)]) / 4);

// Eight years as a river. The graphic holds still while the years scroll past it.
function drawRiver(s, me) {
  const W = 1000, H = 440, N = s.months.length, x = (i) => (i / (N - 1)) * W;
  const series = s.river.map((a) => smooth(smooth(a.by)));
  const tot = s.months.map((_, i) => series.reduce((t, a) => t + a[i], 0)), peak = Math.max(...tot, 0.01);
  const y = (v) => H / 2 + (v / peak) * (H - 30);
  let base = tot.map((t) => -t / 2), bands = '';
  const mids = [];
  series.forEach((a, k) => {
    const top = base.map((b, i) => b + a[i]);
    mids.push(top.map((t, i) => y((t + base[i]) / 2)));
    bands += `<g class="band" data-n="${esc(s.river[k].name)}"><path fill="${RIVER[k % RIVER.length]}" d="${curve(top.map((v, i) => [x(i), y(v)]))}L${curve(base.map((v, i) => [x(i), y(v)]).reverse()).slice(1)}Z"/></g>`;
    base = top;
  });
  const ticks = s.yearsInfo.map(({ y: yr }) => { const i = s.months.indexOf(`${yr}-01`); const at = x(Math.max(0, i)); return `<line x1="${at}" x2="${at}" y1="0" y2="${H}" stroke="#000" stroke-opacity=".12"/><text x="${at + 6}" y="${H + 26}" font-size="16">${yr}</text>`; }).join('');
  $('river-plate').innerHTML = `<svg viewBox="0 -10 ${W} ${H + 46}" role="img" aria-label="Top artists by month, ${s.months[0].slice(0, 4)} to ${s.months.at(-1).slice(0, 4)}"><defs><clipPath id="river-clip"><rect id="river-reveal" x="0" y="-10" width="0" height="${H + 20}"/></clipPath></defs>${ticks}<g clip-path="url(#river-clip)">${bands}</g><line id="river-edge" y1="-10" y2="${H + 8}" stroke="${RED}" stroke-width="2"/><text id="river-label" font-size="18" font-weight="600" paint-order="stroke" stroke="#fff" stroke-width="5"></text></svg>`;
  const reveal = $('river-reveal'), edge = $('river-edge'), label = $('river-label'), groups = [...$('river-plate').querySelectorAll('.band')];
  const endOf = (yr) => { const i = s.months.lastIndexOf(s.months.filter((m) => m.startsWith(`${yr}-`)).at(-1)); return i / (N - 1); };
  const most = s.yearsInfo.reduce((a, b) => (b.hours > a.hours ? b : a));
  const steps = s.yearsInfo.map((Y, k) => {
    const partial = k === 0 ? ` (starting in ${MONTHS[+s.months[0].slice(5) - 1]})` : k === s.yearsInfo.length - 1 ? ' so far' : '';
    return {
      line: `${Y.y}${partial}: ${n(Y.hours)} hours${Y === most ? `, ${me.my} most ever` : ''}.`,
      sub: `${Y.top} led the year, with ${n(Y.topHours)} hours.`, top: Y.top, from: k ? endOf(s.yearsInfo[k - 1].y) : 0, to: endOf(Y.y), yr: Y.y,
    };
  });
  steps.push({ line: `${s.yearsInfo.length} years, ${n(s.hours)} hours.`, sub: `The biggest bands overall: ${s.allTop.slice(0, 3).map((a) => a.name).join(', ')}.`, from: 1, to: 1 });
  let shown = -1;
  scrub['scene-river'] = (p) => {
    const k = Math.min(steps.length - 1, Math.floor(p * steps.length * 0.999)), st = steps[k];
    const local = Math.min(1, (p * steps.length - k) / 0.45), at = (st.from + (st.to - st.from) * (k === steps.length - 1 ? 1 : local)) * W;
    reveal.setAttribute('width', at);
    edge.setAttribute('x1', at); edge.setAttribute('x2', at); edge.style.opacity = k === steps.length - 1 ? 0 : 1;
    if (k === shown) return;
    shown = k;
    scene('river', st.line, st.sub);
    groups.forEach((g) => { g.style.opacity = !st.top || g.dataset.n === st.top ? 1 : 0.3; });
    const idx = s.river.findIndex((a) => a.name === st.top);
    if (idx < 0) { label.textContent = ''; return; }
    const range = s.months.map((m, i) => [m, i]).filter(([m]) => m.startsWith(`${st.yr}-`)).map(([, i]) => i);
    const i = range.reduce((a, b) => (s.river[idx].by[b] > s.river[idx].by[a] ? b : a), range[0]);
    label.textContent = st.top;
    label.setAttribute('x', Math.min(W - 200, x(i) + 8)); label.setAttribute('y', mids[idx][i] + 6);
  };
}

// The past year, day by day: one row per month, one square per day.
function drawDays(s, me) {
  const all = s.days.minutes, from = Math.max(0, all.length - 365), minutes = all.slice(from), start = dateOf(s.days.start, from);
  const W = 1000, L = 80, cell = (W - L) / 31, rowsOf = {}, scale = [...minutes].sort((a, b) => a - b)[Math.floor(minutes.length * 0.97)] || 1;
  let cells = '', rows = '';
  minutes.forEach((m, i) => {
    const d = dateOf(s.days.start, from + i), key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!(key in rowsOf)) { rowsOf[key] = Object.keys(rowsOf).length; rows += `<text x="0" y="${rowsOf[key] * cell + cell * 0.68}" font-size="15">${SHORT[d.getMonth()]} ${String(d.getFullYear()).slice(2)}</text>`; }
    const x = L + (d.getDate() - 1) * cell, y = rowsOf[key] * cell;
    cells += `<rect class="day" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(cell - 3).toFixed(1)}" height="${(cell - 3).toFixed(1)}" fill="${m ? INK : '#eee'}" fill-opacity="${m ? Math.min(1, 0.15 + m / scale).toFixed(2) : 1}" style="--t:${(i / minutes.length).toFixed(4)}" data-i="${i}"/>`;
  });
  let run = 0, best = { start: 0, len: 0 };
  minutes.forEach((m, i) => { run = m >= 1 ? run + 1 : 0; if (run > best.len) best = { start: i - run + 1, len: run }; });
  const peak = minutes.indexOf(Math.max(...minutes)), played = minutes.filter((m) => m >= 1).length;
  const H = Object.keys(rowsOf).length * cell;
  $('days-plate').innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Minutes of music each day for the past year">${rows}${cells}</svg>`;
  const rects = [...$('days-plate').querySelectorAll('.day')];
  const mark = (test) => rects.forEach((r) => { const i = +r.dataset.i; r.style.outline = ''; r.setAttribute('stroke', test(i) ? RED : 'none'); r.setAttribute('stroke-width', test(i) ? 3 : 0); });
  const steps = [
    ['The past year, day by day.', 'One square per day. The darker the square, the more music.', () => false],
    [`Music on ${played} of the past ${minutes.length} days.`, `${me.My} biggest day was ${nice(dateOf(s.days.start, from + peak))}: ${n(minutes[peak] / 60)} hours.`, (i) => i === peak],
  ];
  if (best.len >= 14) steps.push([`The longest run: ${best.len} days in a row.`, `From ${nice(dateOf(s.days.start, from + best.start))} to ${nice(dateOf(s.days.start, from + best.start + best.len - 1))}.`, (i) => i >= best.start && i < best.start + best.len]);
  let shown = -1;
  scrub['scene-days'] = (p) => {
    const k = Math.min(steps.length - 1, p < 0.55 ? 0 : Math.floor(1 + ((p - 0.55) / 0.45) * (steps.length - 1)));
    if (k === shown) return;
    shown = k;
    scene('days', steps[k][0], steps[k][1]);
    mark(steps[k][2]);
  };
}

// --- Listening and its surroundings ---------------------------------------
const weather = JSON.parse($('weather').textContent);
const SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const kindF = (code, highC) => (code >= 71 && code <= 86 && ![80, 81, 82].includes(code) ? 'snow' : code >= 51 ? 'rain' : highC < 4 ? 'cold' : highC > 29 ? 'hot' : 'mild');
const avg = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
const list3 = (w) => (w.length > 2 ? `${w.slice(0, -1).join(', ')} and ${w.at(-1)}` : w.join(' and '));

// One record per day: minutes, where, and that day's weather if known.
function daysWithWeather(s) {
  const { start, minutes, place = [], tops = [], names = [] } = s.days;
  return minutes.map((m, i) => {
    const d = dateOf(start, i), out = { i, d, m, tops: (tops[i] || []).map((k) => names[k]) };
    const w = weather?.[place[i]];
    if (w) {
      const j = Math.round((d - new Date(`${w.start}T12:00:00`)) / 864e5);
      if (j >= 0 && w.code[j] != null && w.high[j] != null) Object.assign(out, { kind: kindF(w.code[j], w.high[j]), f: w.high[j] * 9 / 5 + 32, rain: w.rain[j], rise: w.sunrise[j], set: w.sunset[j] });
    }
    return out;
  });
}

// Seasons, year over year: one ridge per year, months left to right.
function drawSeasons(s, me) {
  const per = {};
  s.days.minutes.forEach((m, i) => { const d = dateOf(s.days.start, i); ((per[d.getFullYear()] ||= Array(12).fill(0))[d.getMonth()] += m / 60); });
  const ys = Object.keys(per).sort(), W = 1000, row = 58, H = row * ys.length + 100, L = 70, lastM = dateOf(s.days.start, s.days.minutes.length - 1).getMonth(), firstM = dateOf(s.days.start, 0).getMonth();
  const peak = Math.max(...ys.flatMap((y) => per[y]), 1), x = (m) => L + (m / 11) * (W - L - 20);
  const ridges = ys.map((y, k) => {
    const base = 70 + k * row, from = k === 0 ? firstM : 0, to = k === ys.length - 1 ? lastM : 11, pts = per[y].map((v, m) => [x(m), base - (v / peak) * row * 0.92]).slice(from, to + 1);
    return `<g class="ridge" data-k="${k}"><line x1="${L}" x2="${W - 20}" y1="${base}" y2="${base}" stroke="#000" stroke-opacity=".15"/><path d="${curve(pts)}L${x(to)},${base}L${x(from)},${base}Z" fill="${INK}" fill-opacity=".14"/><path d="${curve(pts)}" fill="none" stroke="${INK}" stroke-width="2.4"/><text x="0" y="${base - 6}" font-size="15">${y}</text></g>`;
  }).join('');
  const marks = SHORT.map((m, i) => `<text x="${x(i)}" y="${H - 6}" font-size="13" fill="#666" text-anchor="middle">${m}</text>`).join('');
  $('rings').innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Hours of music by month, one line per year">${ridges}${marks}<rect id="season-band" y="0" height="${H - 24}" fill="${RED}" fill-opacity=".08"/></svg>`;
  const full = ys.filter((y) => per[y].every((v) => v > 0));
  const fallWins = full.filter((y) => per[y].slice(9).reduce((a, b) => a + b, 0) > per[y].slice(5, 8).reduce((a, b) => a + b, 0));
  const fallShare = avg(full.map((y) => per[y].slice(9).reduce((a, b) => a + b, 0) / per[y].slice(5, 8).reduce((a, b) => a + b, 0))) - 1;
  $('scene-season').hidden = full.length < 3 || fallWins.length < full.length * 0.8;
  const steps = ys.map(() => ['Each line is a year of listening, January to December.', 'Watch the right-hand side.', -1]);
  steps.push([fallWins.length === full.length ? `Every year, ${me.I === 'I' ? 'I' : 'you'} listen more in the fall.` : `Most years, ${me.I === 'I' ? 'I' : 'you'} listen more in the fall.`, `In ${fallWins.length === full.length ? `all ${full.length}` : `${fallWins.length} of ${full.length}`} full years, October through December beat June through August, by ${Math.round(fallShare * 100)}% on average.`, 10]);
  const ridgesEls = [...$('rings').querySelectorAll('.ridge')], band = $('season-band');
  let shown = -1;
  scrub['scene-season'] = (p) => {
    const k = Math.min(steps.length - 1, Math.floor(p * steps.length * 0.999));
    if (k === shown) return;
    shown = k;
    scene('season', steps[k][0], steps[k][1]);
    ridgesEls.forEach((g, j) => { g.style.opacity = j <= k ? (j === k || k === steps.length - 1 ? 1 : 0.35) : 0; });
    const m = steps[k][2]; band.style.opacity = m < 0 ? 0 : 1; band.setAttribute('x', x(9) - 20); band.setAttribute('width', x(11) - x(9) + 40);
  };
}

// Weather: every day she listened, placed by that day's high temperature.
function drawWeather(s, me) {
  const days = daysWithWeather(s).filter((d) => d.kind && d.m > 0);
  $('scene-weather').hidden = days.length < 60;
  if (days.length < 60) return;
  const W = 1000, H = 460, L = 50, cap = [...days].sort((a, b) => a.m - b.m)[Math.floor(days.length * 0.98)].m;
  const lo = Math.floor(Math.min(...days.map((d) => d.f)) / 10) * 10, hi = Math.ceil(Math.max(...days.map((d) => d.f)) / 10) * 10;
  const x = (f) => L + ((f - lo) / (hi - lo)) * (W - L - 10), y = (m) => H - 10 - (Math.min(m, cap) / cap) * (H - 30);
  const COL = { rain: '#2f7fd1', snow: '#9ab3e6', hot: RED, cold: INK, mild: '#999' };
  const dots = days.map((d) => `<circle class="w-${d.kind}" cx="${(x(d.f) + ((d.i * 7919) % 9) - 4).toFixed(1)}" cy="${y(d.m).toFixed(1)}" r="3.6" fill="${COL[d.kind]}" fill-opacity=".7"/>`).join('');
  const axis = Array.from({ length: (hi - lo) / 10 + 1 }, (_, k) => lo + k * 10).map((f) => `<text x="${x(f)}" y="${H + 22}" font-size="14" text-anchor="middle">${f}°F</text>`).join('');
  const hours = [1, 2, 4, 6].filter((h) => h * 60 < cap).map((h) => `<line x1="${L}" x2="${W}" y1="${y(h * 60)}" y2="${y(h * 60)}" stroke="#000" stroke-opacity=".08"/><text x="0" y="${y(h * 60) + 5}" font-size="13" fill="#666">${h}h</text>`).join('');
  $('weather-plate').innerHTML = `<svg viewBox="0 0 ${W} ${H + 30}" role="img" aria-label="Each day of listening, by that day's high temperature" data-focus="all">${hours}${axis}${dots}</svg>`;
  const by = (k) => days.filter((d) => d.kind === k), mean = (a) => avg(a.map((d) => d.m));
  const all = mean(days), dry = mean(days.filter((d) => d.kind !== 'rain' && d.kind !== 'snow'));
  const lift = (k) => weather?.lift?.[k] || [];
  const bands = {}; days.forEach((d) => { const b = Math.floor(d.f / 10) * 10; (bands[b] ||= []).push(d.m); });
  const sweet = Object.entries(bands).filter(([, v]) => v.length >= 20).sort((p, q) => avg(q[1]) - avg(p[1]))[0];
  // A difference counts only if it is large and unlikely to be chance (Welch's t above 2).
  const real = (a, b) => { const ma = avg(a), mb = avg(b), va = avg(a.map((v) => (v - ma) ** 2)), vb = avg(b.map((v) => (v - mb) ** 2)); return a.length >= 15 && Math.abs(ma / mb - 1) >= 0.1 && Math.abs(ma - mb) / Math.sqrt(va / a.length + vb / b.length) > 2; };
  const vs = (k) => real(by(k).map((d) => d.m), days.filter((d) => d.kind !== k).map((d) => d.m));
  const pct = (a, b) => { const r = Math.round((a / b - 1) * 100); return r >= 0 ? `${r}% more` : `${-r}% less`; };
  const others = (k) => mean(days.filter((d) => d.kind !== k));
  const sweetReal = sweet && real(sweet[1], days.filter((d) => Math.floor(d.f / 10) * 10 !== +sweet[0]).map((d) => d.m));
  const say = { rain: 'rainy days', snow: 'snow days', hot: 'days above 85°F', cold: 'days below 40°F' }, brings = { rain: 'Rain', snow: 'Snow', hot: 'Heat', cold: 'Cold' };
  const steps = [['all', `Every dot is a day ${me.I === 'I' ? 'I' : 'you'} listened, placed by how warm it got.`, `${n(days.length)} days, matched to that day's weather. Higher means more music.`]];
  for (const k of ['rain', 'snow', 'hot', 'cold']) {
    const who = lift(k), diff = vs(k);
    if (!diff && !who.length) continue;
    steps.push([k, diff ? `On ${say[k]}, ${me.I === 'I' ? 'I' : 'you'} listen ${pct(mean(by(k)), others(k))}.` : `${brings[k]} brings out ${list3(who)}.`, diff && who.length ? `${brings[k]} brings out ${list3(who)}.` : '']);
  }
  if (sweetReal) steps.push(['all', `${me.My} sweet spot is the ${sweet[0]}s.`, `Days with a high in the ${sweet[0]}s average ${n(avg(sweet[1]))} minutes of music, more than any other range.`]);
  // A pick for the visitor's own weather. Their location goes only to Open-Meteo,
  // rounded to about 10 km, and is never stored.
  const SKYWORD = (c) => (c === 0 ? 'clear' : c <= 3 ? 'cloudy' : c <= 48 ? 'foggy' : c <= 67 || (c >= 80 && c <= 82) ? 'raining' : c <= 86 ? 'snowing' : 'stormy');
  $('weather-you').onclick = () => {
    const out = $('weather-pick');
    if (!navigator.geolocation) { out.textContent = "Your browser can't share a location."; return; }
    out.textContent = 'Checking the sky where you are…';
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const q = new URLSearchParams({ latitude: coords.latitude.toFixed(1), longitude: coords.longitude.toFixed(1), current: 'temperature_2m,weather_code', daily: 'temperature_2m_max', temperature_unit: 'fahrenheit', forecast_days: '1', timezone: 'auto' });
        const w = await (await fetch(`https://api.open-meteo.com/v1/forecast?${q}`)).json();
        const code = w.current.weather_code, f = w.current.temperature_2m, kind = kindF(code, (w.daily.temperature_2m_max[0] - 32) * 5 / 9);
        const picks = (lift(kind).length ? lift(kind) : s.allTop.map((a) => a.name)).slice(0, 3);
        out.textContent = `Where you are, it's ${Math.round(f)}°F and ${SKYWORD(code)}. On days like this, I'd put on ${list3(picks)}.`;
      } catch { out.textContent = "I couldn't reach the weather just now. Try again in a minute."; }
    }, () => { out.textContent = 'No problem. Your location stays with you.'; }, { maximumAge: 6e5, timeout: 10000 });
  };
  const svg = $('weather-plate').firstChild;
  let shown = -1;
  scrub['scene-weather'] = (p) => {
    const k = Math.min(steps.length - 1, Math.floor(p * steps.length * 0.999));
    if (k === shown) return;
    shown = k;
    svg.dataset.focus = steps[k][0];
    scene('weather', steps[k][1], steps[k][2]);
  };
}

// Daylight: the hour-by-hour grid, with real sunrise and sunset laid over it.
function drawLight(s, me) {
  const days = weather ? daysWithWeather(s).filter((d) => d.rise != null && d.m > 0) : [];
  const rise = Array(12).fill(0).map((_, m) => avg(days.filter((d) => d.d.getMonth() === m).map((d) => d.rise)));
  const set = Array(12).fill(0).map((_, m) => avg(days.filter((d) => d.d.getMonth() === m).map((d) => d.set)));
  const have = rise.every(Boolean);
  const X = (h) => 60 + h * 22, Y = (m) => 60 + m * 40;
  const line = (a, c) => `<polyline points="${a.map((h, m) => `${X(h).toFixed(1)},${Y(m)}`).join(' ')}" fill="none" stroke="${c}" stroke-width="3.5" stroke-linejoin="round"/>`;
  $('clock').innerHTML = clock(s).replace('</svg>', `<g id="sun" style="opacity:0">${have ? line(rise, '#ef8f35') + line(set, RED) + `<text x="${X(rise[11]) - 8}" y="${Y(11) + 34}" font-size="14" text-anchor="end" fill="#ef8f35">sunrise</text><text x="${X(set[11]) + 8}" y="${Y(11) + 34}" font-size="14" fill="${RED}">sunset</text>` : ''}</g></svg>`);
  const dark = (m) => { const r = s.clock[m], t = r.reduce((a, b) => a + b, 0) || 1; return r.reduce((a, v, h) => a + (h + 0.5 < rise[m] || h + 0.5 > set[m] ? v : 0), 0) / t; };
  const steps = [[`The peak comes around ${ap(peakHour(s)).replace(/\.$/, '')}.`, 'Every month, hour by hour. The darker the square, the more music.', 0]];
  if (have) {
    steps.push(['The orange line is sunrise. The red line is sunset.', 'Averaged across the days I was listening, wherever I was.', 1]);
    const dec = dark(11), jun = dark(5);
    steps.push([`In December, ${Math.round(dec * 100)}% of ${me.my} listening happens in the dark.`, `In June, ${Math.round(jun * 100)}%.`, 1]);
  }
  let shown = -1;
  scrub['scene-clock'] = (p) => {
    const k = Math.min(steps.length - 1, Math.floor(p * steps.length * 0.999));
    if (k === shown) return;
    shown = k;
    scene('clock', steps[k][0], steps[k][1]);
    $('sun').style.opacity = steps[k][2];
  };
}


// A globe that turns to each place the music was played, as you scroll.
const world = JSON.parse($('world').textContent);
const PLACES = { US: [-75.17, 39.95, 'Home, in Philadelphia'], SE: [11.97, 57.71, 'Sweden'], IE: [-6.26, 53.35, 'Ireland'], MX: [-99.13, 19.43, 'Mexico'], FI: [24.94, 60.17, 'Finland'], IT: [12.5, 41.9, 'Italy'], AT: [16.37, 48.21, 'Austria'], DK: [12.57, 55.68, 'Denmark'], GB: [-0.13, 51.5, 'England'], FR: [2.35, 48.86, 'France'], DE: [13.4, 52.52, 'Germany'], ES: [-3.7, 40.42, 'Spain'], NL: [4.9, 52.37, 'the Netherlands'], NO: [10.75, 59.91, 'Norway'], CA: [-79.38, 43.65, 'Canada'], PT: [-9.14, 38.72, 'Portugal'], GR: [23.73, 37.98, 'Greece'], JP: [139.69, 35.69, 'Japan'], IS: [-21.9, 64.15, 'Iceland'], CH: [8.54, 47.37, 'Switzerland'], BE: [4.35, 50.85, 'Belgium'], CZ: [14.42, 50.08, 'Czechia'], RO: [26.1, 44.43, 'Romania'], EE: [24.75, 59.44, 'Estonia'] };
const rad = Math.PI / 180;
const span = (a, b) => {
  const A = new Date(`${a}T12:00:00`), B = new Date(`${b}T12:00:00`);
  if (a.slice(0, 7) === b.slice(0, 7)) return `${MONTHS[A.getMonth()]} ${A.getFullYear()}`;
  if (A.getFullYear() === B.getFullYear()) return `${MONTHS[A.getMonth()]} to ${MONTHS[B.getMonth()]} ${A.getFullYear()}`;
  return `${A.getFullYear()} to ${B.getFullYear()}`;
};
function drawGlobe(s, me) {
  const places = (s.places || []).filter((p) => PLACES[p.cc]);
  const sceneEl = $('scene-places');
  sceneEl.hidden = !world || places.length < 2;
  if (sceneEl.hidden) return;
  const canvas = $('globe'), ctx = canvas.getContext('2d'), audio = new Audio(), btn = $('globe-sound');
  audio.volume = 0.5;
  let sound = false, playing = '';
  btn.onclick = () => { sound = !sound; btn.setAttribute('aria-pressed', sound); btn.textContent = sound ? 'Sound on' : 'Sound off'; if (!sound) { audio.pause(); playing = ''; } else shown = -1; };
  const home = places.find((p) => p.cc === 'US') || places[0];
  const order = [home, ...places.filter((p) => p !== home)];
  const steps = order.map((p) => ({ p, at: PLACES[p.cc], line: `${PLACES[p.cc][2]}.`, sub: p.artists.length ? `On repeat: ${list3(p.artists)}.` : 'Spotify stayed quiet on this trip.' }));
  steps.push({ at: [-30, 45], line: `${order.length - 1} countries away from home, and the music came along.`, sub: '' });
  const project = (lon, lat, l0, p0, R, cx, cy) => {
    const L = (lon - l0) * rad, P = lat * rad, P0 = p0 * rad, cosc = Math.sin(P0) * Math.sin(P) + Math.cos(P0) * Math.cos(P) * Math.cos(L);
    let x = Math.cos(P) * Math.sin(L), y = Math.cos(P0) * Math.sin(P) - Math.sin(P0) * Math.cos(P) * Math.cos(L);
    if (cosc < 0) { const m = Math.hypot(x, y) || 1; x /= m; y /= m; }
    return [cx + x * R, cy - y * R, cosc >= 0];
  };
  const arc = (a, b, t) => {
    const v = ([lo, la]) => [Math.cos(la * rad) * Math.cos(lo * rad), Math.cos(la * rad) * Math.sin(lo * rad), Math.sin(la * rad)];
    const A = v(a), B = v(b), d = Math.acos(Math.min(1, A[0] * B[0] + A[1] * B[1] + A[2] * B[2])) || 1e-6;
    const f = (u) => { const k1 = Math.sin((1 - u) * d) / Math.sin(d), k2 = Math.sin(u * d) / Math.sin(d), p = A.map((c, i) => c * k1 + B[i] * k2); return [Math.atan2(p[1], p[0]) / rad, Math.asin(p[2]) / rad]; };
    return Array.from({ length: Math.ceil(40 * t) + 1 }, (_, i) => f((i / 40)));
  };
  let shown = -1;
  const render = (l0, p0, k, local) => {
    const box = canvas.parentElement.getBoundingClientRect(), dpr = devicePixelRatio || 1, size = Math.min(box.width, box.height);
    if (canvas.width !== Math.round(size * dpr)) { canvas.width = canvas.height = Math.round(size * dpr); canvas.style.width = canvas.style.height = `${size}px`; }
    const R = size * dpr * 0.46, c = size * dpr / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath(); ctx.arc(c, c, R, 0, 2 * Math.PI); ctx.fillStyle = '#eef2f9'; ctx.fill();
    ctx.strokeStyle = 'rgba(22,36,110,.12)'; ctx.lineWidth = dpr;
    for (let lo = -180; lo < 180; lo += 30) { ctx.beginPath(); for (let la = -90; la <= 90; la += 5) { const [x, y, v] = project(lo, la, l0, p0, R, c, c); if (v) ctx.lineTo(x, y); else ctx.moveTo(x, y); } ctx.stroke(); }
    for (let la = -60; la <= 60; la += 30) { ctx.beginPath(); for (let lo = -180; lo <= 180; lo += 5) { const [x, y, v] = project(lo, la, l0, p0, R, c, c); if (v) ctx.lineTo(x, y); else ctx.moveTo(x, y); } ctx.stroke(); }
    ctx.fillStyle = INK;
    const dot = 1.25 * dpr * (size / 600 + 0.5);
    for (const [lo, la] of world.dots) { const [x, y, v] = project(lo, la, l0, p0, R, c, c); if (v) ctx.fillRect(x - dot / 2, y - dot / 2, dot, dot); }
    const st = steps[k];
    if (st.p && st.p !== home) {
      ctx.beginPath(); ctx.strokeStyle = RED; ctx.lineWidth = 2.5 * dpr; ctx.setLineDash([6 * dpr, 6 * dpr]);
      arc(PLACES[home.cc], st.at, Math.min(1, local * 1.6)).forEach(([lo, la], i) => { const [x, y, v] = project(lo, la, l0, p0, R, c, c); if (v && i) ctx.lineTo(x, y); else ctx.moveTo(x, y); });
      ctx.stroke(); ctx.setLineDash([]);
    }
    const labels = [];
    order.forEach((p, i) => {
      const [x, y, v] = project(...PLACES[p.cc].slice(0, 2), l0, p0, R, c, c);
      if (!v) return;
      const on = st.p === p || !st.p;
      ctx.beginPath(); ctx.arc(x, y, (on ? 7 : 4.5) * dpr, 0, 2 * Math.PI); ctx.fillStyle = on ? RED : INK; ctx.fill();
      if (on && st.p) { ctx.beginPath(); ctx.arc(x, y, (10 + 8 * ((Date.now() / 900) % 1)) * dpr, 0, 2 * Math.PI); ctx.strokeStyle = RED; ctx.lineWidth = 1.5 * dpr; ctx.stroke(); }
      if (on && labels.every(([a, b]) => Math.hypot(a - x, b - y) > 34 * dpr)) { labels.push([x, y]); ctx.font = `600 ${15 * dpr}px ${getComputedStyle(document.body).fontFamily}`; ctx.fillStyle = INK; ctx.fillText(PLACES[p.cc][2].replace('Home, in ', ''), x + 12 * dpr, y - 10 * dpr); }
    });
  };
  let last = [PLACES[home.cc][0], PLACES[home.cc][1] * 0.7, 0, 0];
  scrub['scene-places'] = (p) => {
    const k = Math.min(steps.length - 1, Math.floor(p * steps.length * 0.999)), local = Math.min(1, (p * steps.length - k) / 0.5);
    const from = steps[Math.max(0, k - 1)].at, to = steps[k].at, e = k ? (1 - Math.cos(Math.PI * local)) / 2 : 1;
    let dl = to[0] - from[0]; if (dl > 180) dl -= 360; if (dl < -180) dl += 360;
    last = [from[0] + dl * e, (from[1] + (to[1] - from[1]) * e) * 0.7, k, local];
    render(...last);
    if (k !== shown) {
      shown = k;
      scene('places', steps[k].line, steps[k].sub);
      const song = steps[k].p?.song;
      $('globe-song').textContent = song ? `Most played there: “${song[0].length > 60 ? `${song[0].slice(0, 58)}…` : song[0]}” by ${song[1]}` : '';
    }
    const cc = p > 0 && p < 1 ? steps[k].p?.cc : '', clip = cc && world.clips?.[cc];
    if (sound && clip && playing !== cc) { playing = cc; audio.src = clip; audio.play().catch(() => {}); }
    if ((!clip || !cc) && playing) { playing = ''; audio.pause(); }
  };
  // Keep the active ring pulsing while the scene is on screen.
  const pulse = () => { if (!sceneEl.hidden && sceneEl.getBoundingClientRect().top < innerHeight && sceneEl.getBoundingClientRect().bottom > 0) render(...last); requestAnimationFrame(pulse); };
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) requestAnimationFrame(pulse);
  $('globe-sound').hidden = !Object.keys(world.clips || {}).length;
}

function draw(s, who) {
  const me = who === 'mine' ? { I: 'I', my: 'my', My: 'My' } : { I: 'You', my: 'your', My: 'Your' };
  $('deck').hidden = false;
  scrub = {};
  drawRiver(s, me);
  drawDays(s, me);
  drawSeasons(s, me);
  if (who === 'mine') drawWeather(s, me); else $('scene-weather').hidden = true;
  drawLight(s, me);
  if (who === 'mine') drawGlobe(s, me); else $('scene-places').hidden = true;
  if (who === 'mine' && library) drawLibrary(library);
  document.querySelectorAll('.lib').forEach((el) => { el.hidden = who !== 'mine' || !library; });
  if (who === 'mine' && library) $('scene-today').hidden = !library.moods?.seasons;
  tick();
}



const decadesChart = (l) => {
  const rows = Object.entries(l.decades).sort((a, b) => a[0] - b[0]), peak = Math.max(...rows.map(([, d]) => d.count), 1);
  return `<div class="deck-bars">${rows.map(([k, d]) => `<button type="button" data-d="${k}" style="--h:${Math.max(3, (d.count / peak) * 100)}%;--t:${(rows.findIndex(([x]) => x === k) / rows.length).toFixed(3)}"><i></i><span>${k.slice(2)}s</span></button>`).join('')}</div><p id="decade-note" class="note" role="status"></p>`;
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

const list = (w) => (w.length > 2 ? `${w.slice(0, -1).join(', ')} and ${w.at(-1)}` : w.join(' and '));
const SKY = { snow: 'snowing', rain: 'raining', cold: 'cold', hot: 'hot', mild: 'mild' };
const kindOf = (code, high) => (code >= 71 && code <= 86 && ![80, 81, 82].includes(code) ? 'snow' : code >= 51 ? 'rain' : high < 7 ? 'cold' : high > 28 ? 'hot' : 'mild');

async function drawToday(l) {
  const m = new Date().getMonth(), season = ['winter', 'winter', 'spring', 'spring', 'spring', 'summer', 'summer', 'summer', 'fall', 'fall', 'fall', 'winter'][m];
  const showSeason = () => {
    const s = l.moods?.seasons?.[season];
    if (s?.words.length) $('today-words').textContent = `This time of year, I tend to save ${list(s.words)}.`;
    return s;
  };
  $('today-sky').textContent = `It's ${season}.`;
  let pick = showSeason();
  try {
    const f = await (await fetch('https://api.open-meteo.com/v1/forecast?latitude=39.95&longitude=-75.17&daily=weather_code,temperature_2m_max&temperature_unit=celsius&forecast_days=1&timezone=America%2FNew_York')).json();
    const high = f.daily.temperature_2m_max[0], k = kindOf(f.daily.weather_code[0], high);
    $('today-sky').textContent = `${Math.round(high * 9 / 5 + 32)} degrees and ${SKY[k]}.`;
    const w = l.moods?.weather?.[k];
    if (w?.words.length) { $('today-words').textContent = `On days like this, I tend to save ${list(w.words)}.`; pick = w; }
  } catch { /* the season line stands in */ }
  const songs = pick?.songs || [];
  if (songs.length) {
    const song = songs[Math.floor(Date.now() / 864e5) % songs.length];
    $('today-song').innerHTML = `Try <a href="${song.url}">${esc(song.title)}</a> by ${esc(song.artist)}.`;
  }
}


function drawLibrary(l) {
  if (l.moods?.seasons) drawToday(l);
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

  scene('wall', `${l.wall.length} playlists, sorted by color.`, '');
  $('wall-plate').innerHTML = `<div class="wall">${l.wall.map((p, i) => `<img class="in" style="--t:${((i * 37 % 100) / 100).toFixed(2)}" crossorigin="anonymous" src="${p.image}" alt="${esc(p.title)}" title="${esc(p.title)}">`).join('')}</div>`;
  const imgs = [...$('wall-plate').querySelectorAll('img')];
  Promise.all(imgs.map((im) => (im.complete ? 0 : new Promise((r) => { im.onload = r; im.onerror = r; })))).then(() => {
    try {
      const wall = $('wall-plate').firstChild;
      imgs.map((im) => [hueOf(im), im]).sort((a, b) => a[0] - b[0]).forEach(([, im]) => wall.append(im));
    } catch { /* keep the original order if the browser won't read the pixels */ }
  });

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
const go = () => $('scene-river').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
if (mine?.hours) draw(mine, 'mine'); else $('reset').hidden = true;
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
$('demo').onclick = () => { draw(sample(), 'yours'); go(); };
$('reset').onclick = () => { draw(mine, 'mine'); go(); };
