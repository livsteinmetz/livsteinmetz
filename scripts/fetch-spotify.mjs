// Saves every playlist on the account to content/my-playlists.json for /admin, and
// the account's top artists to content/trends.json for the listening trends page.
// Skips quietly until the SPOTIFY_ secrets are set, and a failed request never
// blocks a deploy: the section just stays off the page.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const KEEP = createHash('sha256').update(`snapshot:${process.env.SPOTIFY_REFRESH_TOKEN || ''}`).digest('hex').slice(0, 32);

const { SPOTIFY_CLIENT_ID: id, SPOTIFY_CLIENT_SECRET: secret, SPOTIFY_REFRESH_TOKEN: refresh } = process.env;
const today = () => new Date().toISOString().slice(0, 10);
const kind = (code, high) => (code >= 71 && code <= 86 && code !== 80 && code !== 81 && code !== 82 ? 'snow' : code >= 51 ? 'rain' : high < 7 ? 'cold' : high > 28 ? 'hot' : 'mild');
if (!id || !secret || !refresh) { console.log('Spotify not set up, skipping'); process.exit(0); }

// Spotify rate limits a full scan, so each deploy publishes its results and the
// next build starts from them. A scan runs only when they are a day old, or when
// a newly chosen playlist needs a preview. A failed scan keeps what was published.
const FILES = ['my-playlists', 'trends', 'library', 'previews', 'playlist-tracks'];
const snapshots = [];
// A copy kept on the private spotify-backup branch, restored by the workflow before this runs.
try { snapshots.push(JSON.parse(readFileSync('backup/spotify.json', 'utf8'))); } catch { /* no backup yet */ }
for (const url of [`https://livsteinmetz.com/data/${KEEP}/spotify.json`, `https://livsteinmetz--preview-y8pj65y4.web.app/data/${KEEP}/spotify.json`, 'https://livsteinmetz.com/data/spotify.json', 'https://livsteinmetz.web.app/data/spotify.json']) {
  try { const res = await fetch(url); if (res.ok) snapshots.push(await res.json()); } catch { /* none yet */ }
}
const snapshot = snapshots.sort((a, b) => (b.at || '').localeCompare(a.at || ''))[0];
if (snapshot) {
  for (const f of FILES) if (snapshot[f]) writeFileSync(`content/${f}.json`, JSON.stringify(snapshot[f]));
  const chosen = JSON.parse(readFileSync('content/settings.json', 'utf8')).playlists.map((p) => p.id || p);
  const fresh = Date.now() - new Date(snapshot.at) < 20 * 36e5;
  if (fresh && snapshot.library?.moods && chosen.every((c) => (snapshot.previews || {})[c] || (snapshot.skipped || []).includes(c))) {
    console.log(`Using the Spotify snapshot from ${snapshot.at}`);
    process.exit(0);
  }
}

try {
  const auth = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refresh }),
  });
  if (!auth.ok) throw new Error(`token ${auth.status}`);
  const { access_token: token } = await auth.json();

  const headers = { Authorization: `Bearer ${token}` };

  const mine = [], raw = [];
  for (let next = 'https://api.spotify.com/v1/me/playlists?limit=50'; next;) {
    const res = await fetch(next, { headers });
    if (!res.ok) throw new Error(`playlists ${res.status}, retry after ${res.headers.get('retry-after')}s`);
    const page = await res.json();
    raw.push(...page.items.filter(Boolean));
    mine.push(...page.items.filter(Boolean).map((p) => ({ id: p.id, title: p.name, image: p.images?.at(-1)?.url || '', cover: p.images?.[0]?.url || '', isPublic: p.public })));
    next = page.next;
  }
  const writePlaylists = () => writeFileSync('content/my-playlists.json', `${JSON.stringify(mine, null, 1)}\n`);
  writePlaylists();
  console.log(`Saved ${mine.length} playlists`);

  // Spotify no longer gives apps audio previews, so each chosen playlist gets a
  // short clip of one of its songs from the iTunes Search API.
  const previews = {};
  for (const entry of JSON.parse(readFileSync('content/settings.json', 'utf8')).playlists) {
    const pid = entry.id || entry;
    try {
      let res = await fetch(`https://api.spotify.com/v1/playlists/${pid}/items?limit=8`, { headers });
      if (res.status === 404) res = await fetch(`https://api.spotify.com/v1/playlists/${pid}/tracks?limit=8`, { headers });
      if (!res.ok) throw new Error(res.status);
      for (const row of (await res.json()).items) {
        const t = row.item || row.track;
        if (!t?.name) continue;
        const artist = t.artists?.[0]?.name || '';
        const found = await (await fetch(`https://itunes.apple.com/search?${new URLSearchParams({ term: `${t.name} ${artist}`, entity: 'song', limit: '1' })}`)).json();
        const url = found.results?.[0]?.previewUrl;
        if (url) { previews[pid] = { title: t.name, artist, url }; break; }
      }
    } catch (e) { console.warn(`No preview for ${pid}: ${e.message}`); }
  }
  writeFileSync('content/previews.json', `${JSON.stringify(previews, null, 1)}\n`);
  console.log(`Saved ${Object.keys(previews).length} song previews`);

  // Reads the account's own playlists for the listening story. Only public playlists feed
  // anything named on the site; private gig lists contribute just their title and date.
  const profile = await (await fetch('https://api.spotify.com/v1/me', { headers })).json();
  const GIG = /^(PSO|CSO|TUSO|NJCO|YCO|SinC|Elgar|Curtis Rep)\b/i;
  const adds = {}, decades = {}, seen = new Map(), gigs = [];
  const count = (o, k) => { o[k] = (o[k] || 0) + 1; };
  const weekOf = (d) => Math.min(51, Math.floor((d - Date.UTC(d.getUTCFullYear(), 0, 1)) / 6048e5));
  const own = raw.filter((p) => p.owner?.id === profile.id);
  const saves = [];
  let read = 0;
  // Full track lists for the playlists shown on the site, for the send-to-another-app pages.
  const shown = new Set(JSON.parse(readFileSync('content/settings.json', 'utf8')).playlists.map((x) => x.id || x)), sendable = {};
  scan: for (const p of own) {
    const gig = GIG.test(p.name);
    if (p.public === false && !gig) continue;
    const here = {};
    let first = null, tracks = 0;
    for (let next = `https://api.spotify.com/v1/playlists/${p.id}/items?limit=50`, pages = 0; next && pages < 10; pages++) {
      const res = await fetch(next, { headers });
      if (res.status === 429) { console.warn('Spotify asked to slow down, stopping the scan'); break scan; }
      if (!res.ok) break;
      const page = await res.json();
      read += 1;
      for (const row of page.items) {
        const t = row.item || row.track, when = row.added_at && new Date(row.added_at);
        const artist = t?.artists?.[0]?.name;
        if (shown.has(p.id) && t?.name && artist) (sendable[p.id] ||= []).push({ t: t.name, a: (t.artists || []).map((x) => x.name).join(', '), id: t.id, isrc: t.external_ids?.isrc || '' });
        if (!artist || !when) continue;
        tracks += 1;
        if (!first || when < first) first = when;
        count(here, artist);
        if (p.public === false) continue;
        (adds[when.getUTCFullYear()] ||= Array(52).fill(0))[weekOf(when)] += 1;
        const year = Number(t.album?.release_date?.slice(0, 4));
        if (year) { const k = Math.floor(year / 10) * 10; (decades[k] ||= { count: 0, artists: {} }).count += 1; count(decades[k].artists, artist); }
        saves.push({ day: row.added_at.slice(0, 10), month: when.getUTCMonth(), artist, title: t.name, url: t.external_urls?.spotify });
        const known = seen.get(artist);
        if (!known) seen.set(artist, { when, n: 1 }); else { known.n += 1; if (when < known.when) known.when = when; }
      }
      next = page.next;
    }
    if (gig && first) gigs.push({ title: p.name, date: first.toISOString().slice(0, 7), tracks, composer: Object.entries(here).sort((a, b) => b[1] - a[1])[0]?.[0] || '' });
  }
  const leaders = (o, n) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k]) => k);
  const firsts = {};
  for (const [artist, a] of seen) { const y = a.when.getUTCFullYear(); (firsts[y] ||= { count: 0, all: {} }).count += 1; firsts[y].all[artist] = a.n; }
  // What gets played by season and weather: each save is matched to that day's
  // Philadelphia weather, and artists get genre words from MusicBrainz.
  const moods = { seasons: {}, weather: {} };
  try {
    const seasonOf = (m) => ['winter', 'winter', 'spring', 'spring', 'spring', 'summer', 'summer', 'summer', 'fall', 'fall', 'fall', 'winter'][m];
    const start = saves.reduce((a, r) => (r.day < a ? r.day : a), today());
    const archive = await (await fetch(`https://archive-api.open-meteo.com/v1/archive?latitude=39.95&longitude=-75.17&start_date=${start}&end_date=${today()}&daily=weather_code,temperature_2m_max&timezone=America%2FNew_York`)).json();
    const sky = {};
    archive.daily.time.forEach((d, i) => { sky[d] = kind(archive.daily.weather_code[i], archive.daily.temperature_2m_max[i]); });
    const groups = { seasons: {}, weather: {} };
    for (const r of saves) {
      (groups.seasons[seasonOf(r.month)] ||= []).push(r);
      if (sky[r.day]) (groups.weather[sky[r.day]] ||= []).push(r);
    }
    const tally = (rows) => { const o = {}; rows.forEach((r) => count(o, r.artist)); return o; };
    const wanted = new Set(Object.values(groups).flatMap((g) => Object.values(g)).flatMap((rows) => leaders(tally(rows), 25)));
    const tags = {};
    for (const artist of [...wanted].slice(0, 150)) {
      await new Promise((r) => setTimeout(r, 1100));
      const res = await fetch(`https://musicbrainz.org/ws/2/artist?fmt=json&limit=1&query=${encodeURIComponent(`artist:"${artist}"`)}`, { headers: { 'User-Agent': 'livsteinmetz-site-build/1.0 (https://livsteinmetz.com)' } });
      if (res.ok) tags[artist] = ((await res.json()).artists?.[0]?.tags || []).filter((t) => t.count > 0 && /^[a-z&' -]{3,24}$/.test(t.name) && !/^(seen live|american|british|english|canadian|usa|uk|female|male|singer|songwriter|\d)/.test(t.name)).slice(0, 4).map((t) => t.name);
    }
    const shares = (rows) => { const o = {}; let n = 0; for (const r of rows) for (const t of tags[r.artist] || []) { count(o, t); n += 1; } return { o, n: n || 1 }; };
    const base = shares(saves);
    for (const [group, sets] of Object.entries(groups)) {
      for (const [key, rows] of Object.entries(sets)) {
        const { o, n } = shares(rows);
        const words = Object.entries(o).filter(([, c]) => c >= 3).map(([t, c]) => [t, (c / n) ** 2 / (base.o[t] / base.n)]).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([t]) => t);
        const top = leaders(tally(rows), 6);
        const songs = top.map((a) => rows.find((r) => r.artist === a)).filter((r) => r?.url).map(({ title, artist, url }) => ({ title, artist, url }));
        moods[group][key] = { words, songs, n: rows.length };
      }
    }
    console.log(`Moods: ${Object.keys(tags).length} artists tagged`, JSON.stringify(Object.fromEntries(Object.entries(moods.weather).map(([k, v]) => [k, v.words]))));
  } catch (e) { console.warn(`Moods skipped: ${e.message}`); }
  const pub = mine.filter((p) => p.isPublic !== false);
  const library = {
    adds,
    decades: Object.fromEntries(Object.entries(decades).map(([k, d]) => [k, { count: d.count, artists: leaders(d.artists, 4) }])),
    firsts: Object.fromEntries(Object.entries(firsts).map(([y, f]) => [y, { count: f.count, artists: leaders(f.all, 8) }])),
    moods,
    gigs: gigs.sort((a, b) => b.date.localeCompare(a.date)),
    titles: [], // names can include friends, so this scene stays off until they're picked in /admin
    wall: pub.filter((p) => p.image).map((p) => ({ image: p.image, title: p.title })),
  };
  writeFileSync('content/library.json', `${JSON.stringify(library)}\n`);
  writeFileSync('content/playlist-tracks.json', `${JSON.stringify(sendable)}\n`);
  console.log(`Library: ${read} pages from ${own.length} own playlists, ${seen.size} artists, ${gigs.length} gigs, ${library.titles.length} titles`);

  const windows = [];
  for (const [range, label] of [['short_term', 'Last four weeks'], ['medium_term', 'Last six months'], ['long_term', 'Last year']]) {
    const res = await fetch(`https://api.spotify.com/v1/me/top/artists?time_range=${range}&limit=10`, { headers });
    if (!res.ok) throw new Error(`top artists ${res.status}`);
    windows.push({ label, artists: (await res.json()).items.map((a) => a.name) });
  }
  const top = await fetch('https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=10', { headers });
  if (!top.ok) throw new Error(`top tracks ${top.status}`);
  const tracks = (await top.json()).items.map((t) => ({ title: t.name, artist: t.artists?.[0]?.name || '' }));
  const recent = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=50', { headers });
  const hours = Array(24).fill(0);
  if (recent.ok) {
    for (const r of (await recent.json()).items) hours[Number(new Date(r.played_at).toLocaleString('en-US', { timeZone: 'America/New_York', hour: 'numeric', hourCycle: 'h23' })) % 24] += 1;
  }
  // A diary of top artists. Each build adds today to what the live site already has.
  let diary = [];
  for (const host of ['https://livsteinmetz.com', 'https://livsteinmetz.web.app']) { try { if (!diary.length) { try { diary = JSON.parse(readFileSync('backup/spotify.json', 'utf8')).diary || []; } catch { /* none */ } } if (diary.length) break; const res = await fetch(`${host}/data/${KEEP}/diary.json`).then((r) => (r.ok ? r : fetch(`${host}/data/diary.json`))); if (res.ok) { diary = await res.json(); break; } } catch { /* try the next address */ } }
  if (!diary.some((d) => d.d === today()) && windows[0].artists.length) diary.push({ d: today(), artists: windows[0].artists.slice(0, 5) });
  writeFileSync('content/diary.json', `${JSON.stringify(diary)}\n`);

  writeFileSync('content/trends.json', `${JSON.stringify({ windows, tracks, hours, at: new Date().toISOString() }, null, 1)}\n`);
  console.log(`Saved top artists for ${windows.length} windows`);
} catch (err) {
  console.warn(`Spotify skipped: ${err.message}`);
}
