// Turns a Spotify streaming history into counts. Shared by the browser, for
// visitors' own files, and by scripts/summarize-history.mjs, for Olivia's.
// It keeps totals only: no IP addresses, devices, or play-by-play log.
const pad = (n) => String(n).padStart(2, '0');
const dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
// Plays from abroad are read in that place's clock, so morning stays morning.
const ZONES = { SE: 'Europe/Stockholm', MX: 'America/Mexico_City', GB: 'Europe/London', DE: 'Europe/Berlin', FR: 'Europe/Paris' };
const fmt = {};
const local = (d, cc) => {
  const zone = ZONES[cc];
  if (!zone) return d;
  fmt[zone] ||= new Intl.DateTimeFormat('en-US', { timeZone: zone, year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', hourCycle: 'h23' });
  const p = Object.fromEntries(fmt[zone].formatToParts(d).map((x) => [x.type, x.value]));
  return new Date(+p.year, p.month - 1, +p.day, +p.hour);
};
const weekOf = (d) => Math.min(51, Math.floor((d - new Date(d.getFullYear(), 0, 1)) / 6048e5));

export function summarize(rows) {
  const years = {}, clock = Array.from({ length: 12 }, () => Array(24).fill(0)), artists = {}, perYear = {}, day = {}, where = {}, who = {}, abroad = {};
  let hours = 0;
  for (const r of rows) {
    const when = r.ts || (r.endTime && `${r.endTime.replace(' ', 'T')}:00Z`);
    const ms = r.ms_played ?? r.msPlayed;
    const artist = r.master_metadata_album_artist_name ?? r.artistName ?? r.episode_show_name;
    if (!when || !ms || !artist) continue;
    const utc = new Date(when);
    if (Number.isNaN(+utc)) continue;
    const cc = r.conn_country || '', d = local(utc, cc);
    // Places count every play, even short ones: a skipped song still says where you were.
    if (cc && cc !== 'ZZ') {
      const k0 = dayKey(d), pl = (abroad[cc] ||= { first: k0, last: k0, artists: {}, shows: {}, songs: {} });
      if (k0 < pl.first) pl.first = k0;
      if (k0 > pl.last) pl.last = k0;
      const bucket = r.episode_show_name ? pl.shows : pl.artists;
      bucket[artist] = (bucket[artist] || 0) + ms;
      if (!r.episode_show_name) { const song = `${r.master_metadata_track_name}\u0000${artist}`; pl.songs[song] = (pl.songs[song] || 0) + ms; }
    }
    if (!(ms >= 30000) || r.episode_show_name) continue; // music only from here; Spotify counts a stream at 30 seconds
    const h = ms / 36e5, y = d.getFullYear(), month = `${y}-${pad(d.getMonth() + 1)}`;
    hours += h;
    (years[y] ||= Array(52).fill(0))[weekOf(d)] += h;
    clock[d.getMonth()][d.getHours()] += h;
    const k = dayKey(d);
    day[k] = (day[k] || 0) + ms / 6e4;
    ((where[k] ||= {})[cc] = (where[k][cc] || 0) + ms);
    ((who[k] ||= {})[artist] = (who[k][artist] || 0) + ms);
    const a = (artists[artist] ||= { total: 0, month: {}, year: {} });
    a.total += h; a.month[month] = (a.month[month] || 0) + h; a.year[y] = (a.year[y] || 0) + h;
    perYear[y] = (perYear[y] || 0) + h;
  }
  const keys = Object.keys(day).sort();
  if (!keys.length) return { hours: 0 };

  // Every month and every day from the first play to the last, gaps included.
  const months = [], first = new Date(`${keys[0]}T12:00:00`), last = new Date(`${keys.at(-1)}T12:00:00`);
  for (let d = new Date(first.getFullYear(), first.getMonth(), 1); d <= last; d.setMonth(d.getMonth() + 1)) months.push(`${d.getFullYear()}-${pad(d.getMonth() + 1)}`);
  const minutes = [], place = [], tops = [], names = [], index = {};
  for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
    const k = dayKey(d);
    minutes.push(Math.ceil(day[k] || 0));
    place.push(where[k] ? Object.entries(where[k]).sort((a, b) => b[1] - a[1])[0][0] : '');
    tops.push(who[k] ? Object.entries(who[k]).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([n]) => (index[n] ??= names.push(n) - 1)) : []);
  }

  let run = 0, best = { start: 0, len: 0 };
  minutes.forEach((m, i) => { run = m >= 1 ? run + 1 : 0; if (run > best.len) best = { start: i - run + 1, len: run }; });
  const peak = minutes.indexOf(Math.max(...minutes));

  // The river follows each year's two biggest artists.
  const list = Object.entries(artists);
  const yearsList = Object.keys(perYear).sort();
  const riverNames = [...new Set(yearsList.flatMap((y) => list.filter(([, a]) => a.year[y]).sort((p, q) => q[1].year[y] - p[1].year[y]).slice(0, 2).map(([n]) => n)))].slice(0, 14);
  riverNames.sort((p, q) => artists[q].total - artists[p].total);
  const river = riverNames.map((name) => ({ name, by: months.map((m) => +(artists[name].month[m] || 0).toFixed(2)) }));
  const yearsInfo = yearsList.map((y) => {
    const [top, a] = list.filter(([, x]) => x.year[y]).sort((p, q) => q[1].year[y] - p[1].year[y])[0];
    return { y: +y, hours: Math.round(perYear[y]), top, topHours: Math.round(a.year[y]) };
  });
  const allTop = list.sort((p, q) => q[1].total - p[1].total).slice(0, 5).map(([name, a]) => ({ name, hours: Math.round(a.total) }));

  // Where the music was played, by country: when, and what. No amounts.
  const places = Object.entries(abroad).map(([cc, pl]) => ({
    cc, first: pl.first, last: pl.last,
    artists: Object.entries(Object.keys(pl.artists).length ? pl.artists : pl.shows).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([a]) => a),
    song: Object.entries(pl.songs).sort((a, b) => b[1] - a[1])[0]?.[0].split('\u0000') || null,
  })).sort((a, b) => (a.first < b.first ? -1 : 1));

  return {
    places,
    hours: Math.round(hours), years: Object.fromEntries(Object.entries(years).map(([y, w]) => [y, w.map((v) => +v.toFixed(2))])),
    clock: clock.map((r) => r.map((v) => +v.toFixed(2))), months, river, yearsInfo, allTop,
    days: { start: keys[0], minutes, place, tops, names }, streak: best, peakDay: { i: peak, minutes: minutes[peak] },
    playedDays: minutes.filter((m) => m >= 1).length,
  };
}
