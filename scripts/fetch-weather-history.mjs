// Fetches the daily weather for every day in Olivia's listening history, for
// wherever she was that day, so the trends page can set music against weather.
import { readFileSync, writeFileSync } from 'node:fs';
const PLACES = { US: [39.95, -75.17], SE: [57.71, 11.97] };
let h;
try { h = JSON.parse(readFileSync('content/listening-history.json', 'utf8')); } catch { h = null; }
if (!h?.days) { writeFileSync('content/weather-history.json', 'null\n'); console.log('No history, no weather'); process.exit(0); }
const start = h.days.start, end = new Date(new Date(`${start}T12:00:00Z`).getTime() + (h.days.minutes.length - 1) * 864e5).toISOString().slice(0, 10);
const hour = (t) => { const [hh, mm] = t.slice(11, 16).split(':'); return +(+hh + mm / 60).toFixed(2); };
const out = {};
for (const [cc, [lat, lon]] of Object.entries(PLACES)) {
  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${start}&end_date=${end}&daily=weather_code,temperature_2m_max,precipitation_sum,sunrise,sunset&timezone=auto`;
  for (let tries = 0; tries < 3; tries++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'livsteinmetz-site-build/1.0 (https://livsteinmetz.com)' } });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const d = (await r.json()).daily;
      out[cc] = { start: d.time[0], code: d.weather_code, high: d.temperature_2m_max, rain: d.precipitation_sum, sunrise: d.sunrise.map(hour), sunset: d.sunset.map(hour) };
      console.log(`Weather for ${cc}: ${d.time.length} days`);
      break;
    } catch (e) { console.warn(`Weather ${cc} try ${tries + 1}: ${e.message}`); await new Promise((ok) => setTimeout(ok, 3000)); }
  }
}
// Which artists show up more than usual in each kind of weather. Worked out here,
// so the published page never carries a day-by-day list of artists.
const kind = (code, high) => (code >= 71 && code <= 86 && ![80, 81, 82].includes(code) ? 'snow' : code >= 51 ? 'rain' : high < 4 ? 'cold' : high > 29 ? 'hot' : 'mild');
const { minutes, place = [], tops = [], names = [] } = h.days, groups = {}, base = {};
let counted = 0;
minutes.forEach((m, i) => {
  const w = out[place[i]];
  if (!w || !m) return;
  const j = Math.round((Date.parse(`${start}T12:00:00Z`) + i * 864e5 - Date.parse(`${w.start}T12:00:00Z`)) / 864e5);
  if (w.code[j] == null || w.high[j] == null) return;
  const k = kind(w.code[j], w.high[j]), g = (groups[k] ||= { days: 0, c: {} });
  g.days++; counted++;
  (tops[i] || []).forEach((a) => { g.c[a] = (g.c[a] || 0) + 1; base[a] = (base[a] || 0) + 1; });
});
const lift = {};
for (const [k, g] of Object.entries(groups)) {
  // Only artists who clearly show up more: at least 8 such days and half again their usual rate.
  lift[k] = Object.entries(g.c).filter(([, v]) => v >= Math.max(8, g.days * 0.03)).map(([a, v]) => [names[a], (v / g.days) / (base[a] / counted)]).filter(([, r]) => r >= 1.5).sort((p, q) => q[1] - p[1]).slice(0, 3).map(([a]) => a);
}
if (Object.keys(out).length) out.lift = lift;
console.log('Weather artists', JSON.stringify(lift));
writeFileSync('content/weather-history.json', `${JSON.stringify(Object.keys(out).length ? out : null)}\n`);
