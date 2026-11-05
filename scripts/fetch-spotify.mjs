// Writes the tracks of one chosen playlist to content/listening.json, so the
// shelf shows only what's on that playlist. Choose it at /admin.
// Skips quietly until the id and the three SPOTIFY_ secrets are set, and a
// failed request never blocks a deploy: the section just stays off the page.
import { readFileSync, writeFileSync } from 'node:fs';

const { SPOTIFY_CLIENT_ID: id, SPOTIFY_CLIENT_SECRET: secret, SPOTIFY_REFRESH_TOKEN: refresh } = process.env;
const { listening } = JSON.parse(readFileSync('content/settings.json', 'utf8'));
if (!id || !secret || !refresh || !listening) { console.log('Spotify not set up, skipping'); process.exit(0); }

try {
  const auth = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refresh }),
  });
  if (!auth.ok) throw new Error(`token ${auth.status}`);
  const { access_token: token } = await auth.json();

  const headers = { Authorization: `Bearer ${token}` };
  const base = `https://api.spotify.com/v1/playlists/${listening}`;
  let res = await fetch(`${base}/items?limit=12`, { headers });
  if (res.status === 404) res = await fetch(`${base}/tracks?limit=12`, { headers });
  if (!res.ok) throw new Error(`playlist ${res.status}`);
  const items = (await res.json()).items.map((row) => row.item || row.track).filter((t) => t?.album);

  const tracks = items.map((t) => ({
    title: t.name,
    artist: t.artists.map((a) => a.name).join(', '),
    url: t.external_urls.spotify,
    image: t.album.images.find((i) => i.width >= 300)?.url || t.album.images[0]?.url,
  })).filter((t) => t.image);
  writeFileSync('content/listening.json', `${JSON.stringify(tracks, null, 1)}\n`);
  console.log(`Saved ${tracks.length} tracks`);
} catch (err) {
  console.warn(`Spotify skipped: ${err.message}`);
}
