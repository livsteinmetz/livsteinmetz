// Saves all of Olivia's playlists to content/my-playlists.json for /admin, and
// her top artists to content/trends.json for the listening trends page.
// Skips quietly until the SPOTIFY_ secrets are set, and a failed request never
// blocks a deploy: the section just stays off the page.
import { readFileSync, writeFileSync } from 'node:fs';

const { SPOTIFY_CLIENT_ID: id, SPOTIFY_CLIENT_SECRET: secret, SPOTIFY_REFRESH_TOKEN: refresh } = process.env;
if (!id || !secret || !refresh) { console.log('Spotify not set up, skipping'); process.exit(0); }

try {
  const auth = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refresh }),
  });
  if (!auth.ok) throw new Error(`token ${auth.status}`);
  const { access_token: token } = await auth.json();

  const headers = { Authorization: `Bearer ${token}` };

  const mine = [];
  for (let next = 'https://api.spotify.com/v1/me/playlists?limit=50'; next;) {
    const res = await fetch(next, { headers });
    if (!res.ok) throw new Error(`playlists ${res.status}`);
    const page = await res.json();
    mine.push(...page.items.filter(Boolean).map((p) => ({ id: p.id, title: p.name, image: p.images?.at(-1)?.url || '', cover: p.images?.[0]?.url || '', isPublic: p.public })));
    next = page.next;
  }
  writeFileSync('content/my-playlists.json', `${JSON.stringify(mine, null, 1)}\n`);
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

  const windows = [];
  for (const [range, label] of [['short_term', 'Last four weeks'], ['medium_term', 'Last six months'], ['long_term', 'Last year']]) {
    const res = await fetch(`https://api.spotify.com/v1/me/top/artists?time_range=${range}&limit=10`, { headers });
    if (!res.ok) throw new Error(`top artists ${res.status}`);
    windows.push({ label, artists: (await res.json()).items.map((a) => a.name) });
  }
  writeFileSync('content/trends.json', `${JSON.stringify({ windows }, null, 1)}\n`);
  console.log(`Saved top artists for ${windows.length} windows`);
} catch (err) {
  console.warn(`Spotify skipped: ${err.message}`);
}
