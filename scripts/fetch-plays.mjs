// Keeps the listening shelf current between Spotify exports. Spotify only hands back
// the last 50 plays, so this runs every few hours and adds them to a log that stays
// sealed on the plays-log branch. It also finds album covers and 30-second previews.
// Never blocks a deploy: anything that fails keeps what was saved before.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const FILE = 'backup/plays.json';
const { SPOTIFY_CLIENT_ID: id, SPOTIFY_CLIENT_SECRET: secret, SPOTIFY_REFRESH_TOKEN: refresh } = process.env;
let log = { plays: [], covers: {}, previews: {} };
try { log = { ...log, ...JSON.parse(readFileSync(FILE, 'utf8')) }; } catch { /* first run */ }
let history = null;
try { history = JSON.parse(readFileSync('content/listening-history.json', 'utf8')); } catch { /* sealed, or not summarized yet */ }
const save = () => { mkdirSync('backup', { recursive: true }); writeFileSync(FILE, JSON.stringify(log)); };
const wait = (ms) => new Promise((done) => setTimeout(done, ms));
if (!id || !secret || !refresh) { console.log('Spotify not set up, skipping plays'); process.exit(0); }

try {
  const auth = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refresh }),
  });
  if (!auth.ok) throw new Error(`token ${auth.status}`);
  const headers = { Authorization: `Bearer ${(await auth.json()).access_token}` };

  // New plays, kept once each.
  const res = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=50', { headers });
  if (!res.ok) throw new Error(`recently played ${res.status}`);
  const seen = new Set(log.plays.map((p) => p.at));
  let added = 0;
  for (const { played_at: at, track: t } of (await res.json()).items) {
    if (!t?.album || seen.has(at)) continue;
    log.plays.push({ at, t: t.name, a: t.artists?.[0]?.name || '', al: t.album.name, ms: t.duration_ms || 0, img: (t.album.images?.[1] || t.album.images?.[0])?.url || '' });
    added += 1;
  }
  log.plays.sort((p, q) => (p.at < q.at ? -1 : 1));
  // If more than 50 plays happened since the last run, some fell off Spotify's list.
  console.log(`${added} new plays, ${log.plays.length} in the log`);
  save();

  // Covers for albums from the export, looked up by one of their tracks. A few each run.
  const missing = (history?.albums || []).filter((al) => al.u && !log.covers[al.u]);
  for (const al of missing.slice(0, 60)) {
    const r = await fetch(`https://api.spotify.com/v1/tracks/${al.u}`, { headers });
    if (r.status === 429) { console.warn('Spotify asked to slow down, covers continue next run'); break; }
    if (r.ok) { const t = await r.json(); log.covers[al.u] = (t.album?.images?.[1] || t.album?.images?.[0])?.url || 'none'; }
    await wait(250);
  }
  console.log(`Covers: ${Object.keys(log.covers).length} saved, ${Math.max(0, missing.length - 60)} still to find`);
  save();
} catch (e) { console.warn(`Plays skipped: ${e.message}`); }

// Previews come from the iTunes Search API, since Spotify no longer gives apps audio.
// It allows about 20 searches a minute, so each run takes the top albums still missing one.
try {
  const key = (al) => `${al.n || al.al}\u0000${al.a}`;
  const wanted = [...(history?.albums || []).slice(0, 200), ...log.plays.slice(-200).map((p) => ({ n: p.al, a: p.a }))].filter((al) => !(key(al) in log.previews));
  let n = 0;
  for (const al of wanted) {
    if (key(al) in log.previews) continue;
    if (n++ >= 18) break;
    const r = await fetch(`https://itunes.apple.com/search?${new URLSearchParams({ term: `${al.n || al.al} ${al.a}`, entity: 'song', limit: '1' })}`);
    if (!r.ok) break;
    const hit = (await r.json()).results?.[0];
    log.previews[key(al)] = hit?.previewUrl ? { url: hit.previewUrl, t: hit.trackName } : null;
    await wait(3200);
  }
  console.log(`Previews: ${Object.values(log.previews).filter(Boolean).length} found`);
  save();
} catch (e) { console.warn(`Previews skipped: ${e.message}`); }
