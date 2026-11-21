// Finds each shared song on Apple Music and Deezer, so a playlist can be sent to
// people who don't use Spotify. Results are cached at /data/links.json on the live
// site, so each song is looked up once. The Apple lookup also keeps its 30-second clip
// for the playlist pages.
import { readFileSync, writeFileSync } from 'node:fs';
const UA = { headers: { 'User-Agent': 'livsteinmetz-site-build/1.0 (https://livsteinmetz.com)' } };
const read = (f, d) => { try { return JSON.parse(readFileSync(f, 'utf8')); } catch { return d; } };
const lists = read('content/playlist-tracks.json', {});
let links = {};
for (const host of ['https://livsteinmetz.com', 'https://livsteinmetz.web.app']) {
  try { const r = await fetch(`${host}/data/links.json`, UA); if (r.ok) { links = await r.json(); break; } } catch { /* try the next */ }
}
const wait = (ms) => new Promise((ok) => setTimeout(ok, ms));
let looked = 0;
for (const t of Object.values(lists).flat()) {
  if (!t.id || looked >= 250) continue;
  if (links[t.id] && 'clip' in links[t.id]) continue;
  looked++;
  const out = { ...links[t.id], clip: '' };
  try {
    const r = await (await fetch(`https://itunes.apple.com/search?${new URLSearchParams({ term: `${t.t} ${t.a.split(',')[0]}`, entity: 'song', limit: '1' })}`, UA)).json();
    const hit = r.results?.[0];
    if (hit?.trackViewUrl) out.apple = hit.trackViewUrl.split('?')[0] + `?i=${hit.trackId}`;
    if (hit?.previewUrl) out.clip = hit.previewUrl;
  } catch { /* leave it to search */ }
  if (t.isrc && !out.deezer) {
    try { const d = await (await fetch(`https://api.deezer.com/2.0/track/isrc:${t.isrc}`, UA)).json(); if (d.link) out.deezer = d.link; } catch { /* leave it to search */ }
  }
  links[t.id] = out;
  await wait(1200);
}
writeFileSync('content/links.json', `${JSON.stringify(links)}\n`);
console.log(`Song links: ${looked} looked up, ${Object.keys(links).length} known`);
