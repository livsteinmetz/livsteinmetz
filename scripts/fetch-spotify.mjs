// Writes the last four weeks of top tracks to content/listening.json.
// Skips quietly until the three SPOTIFY_ secrets are set, and a failed
// request never blocks a deploy: the section just stays off the page.
import { writeFileSync } from 'node:fs';

const { SPOTIFY_CLIENT_ID: id, SPOTIFY_CLIENT_SECRET: secret, SPOTIFY_REFRESH_TOKEN: refresh } = process.env;
if (!id || !secret || !refresh) { console.log('Spotify not connected, skipping'); process.exit(0); }

try {
  const auth = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refresh }),
  });
  if (!auth.ok) throw new Error(`token ${auth.status}`);
  const { access_token: token } = await auth.json();

  const res = await fetch('https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=8', { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`top tracks ${res.status}`);
  const { items } = await res.json();

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
