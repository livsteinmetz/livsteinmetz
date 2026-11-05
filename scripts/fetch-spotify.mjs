// Saves all of Olivia's playlists to content/my-playlists.json for /admin, and
// her top artists to content/trends.json for the listening trends page.
// Skips quietly until the SPOTIFY_ secrets are set, and a failed request never
// blocks a deploy: the section just stays off the page.
import { writeFileSync } from 'node:fs';

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
