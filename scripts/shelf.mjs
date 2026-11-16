// Puts together the listening shelf: albums from the Spotify export, topped up with
// plays logged since, plus covers, previews and my notes. Only what the shelf shows.
const pad = (n) => String(n).padStart(2, '0');
const dayOf = (iso) => { const d = new Date(new Date(iso).toLocaleString('en-US', { timeZone: 'America/New_York' })); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const addDays = (k, n) => new Date(Date.parse(`${k}T12:00:00Z`) + n * 864e5).toISOString().slice(0, 10);
const keyOf = (n, a) => `${n}\u0000${a}`;

export function shelfOf(history, log = {}, notes = {}) {
  if (!history?.albums?.length) return null;
  const { plays = [], covers = {}, previews = {} } = log;
  const albums = history.albums.map((al) => ({ ...al, m: { ...al.m } }));
  const byKey = new Map(albums.map((al) => [keyOf(al.n, al.a), al]));
  const minutes = [...history.days.minutes];
  const exportEnd = addDays(history.days.start, minutes.length - 1);
  let hours = history.hours, albumCount = history.albumCount, artistCount = history.artistCount, asOf = exportEnd;
  const albumFirsts = { ...(history.albumFirsts || {}) };
  const knownArtists = new Set(albums.map((al) => al.a));

  for (const p of plays) {
    const k = dayOf(p.at);
    if (k <= exportEnd || !p.ms) continue;
    const i = Math.round((Date.parse(`${k}T12:00:00Z`) - Date.parse(`${history.days.start}T12:00:00Z`)) / 864e5);
    while (minutes.length <= i) minutes.push(0);
    minutes[i] += p.ms / 6e4;
    const h = p.ms / 36e5, month = k.slice(0, 7);
    hours += h;
    let al = byKey.get(keyOf(p.al, p.a));
    if (!al) {
      al = { n: p.al, a: p.a, u: '', p: 0, h: 0, f: k, l: k, m: {} };
      albums.push(al); byKey.set(keyOf(p.al, p.a), al); albumCount += 1; albumFirsts[month] = (albumFirsts[month] || 0) + 1;
      if (!knownArtists.has(p.a)) { knownArtists.add(p.a); artistCount += 1; }
    }
    al.p += 1; al.h += h; al.l = k; al.m[month] = (al.m[month] || 0) + h;
    if (p.img) al.img = p.img;
    asOf = k;
  }

  const recent = plays.length && dayOf(plays.at(-1).at) > exportEnd
    ? plays.slice(-8).reverse().map(({ at, t, a, al }) => ({ at, t, a, al }))
    : history.recent || [];
  for (const al of albums) {
    if (!al.img && covers[al.u] && covers[al.u] !== 'none') al.img = covers[al.u];
    const pv = previews[keyOf(al.n, al.a)];
    if (pv) al.pv = pv;
    const note = notes[`${al.n} — ${al.a}`];
    if (note) al.note = note;
    al.h = +al.h.toFixed(2);
    delete al.u;
  }
  return {
    albums: albums.sort((p, q) => q.h - p.h), recent, asOf, exportEnd,
    hours: Math.round(hours), albumCount, artistCount, albumFirsts,
    days: { start: history.days.start, minutes: minutes.map((m) => Math.ceil(m)) },
  };
}
