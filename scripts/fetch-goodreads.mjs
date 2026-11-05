// Writes the books on Olivia's currently-reading shelf, then what she finished
// in the past year, to content/reading.json from her public Goodreads shelves.
// If Goodreads won't answer, it falls back to content/reading.seed.json with
// covers from Open Library, so a failed request never blocks a deploy.
import { readFileSync, writeFileSync } from 'node:fs';

const USER = '187582052-liv';
const YEAR = 365 * 24 * 60 * 60 * 1000;

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"');

const first = (html, re) => html.match(re)?.[1]?.trim() || '';
const flip = (name) => name.split(', ').reverse().join(' ');

// Goodreads retired its API and this account's feed, so read the public shelf page.
const shelf = async (name) => {
  const res = await fetch(`https://www.goodreads.com/review/list/${USER}?shelf=${name}&per_page=100&print=true`, { headers: { 'User-Agent': 'Mozilla/5.0 (livsteinmetz-site-build)' } });
  if (!res.ok) throw new Error(`${name} ${res.status}`);
  const html = await res.text();
  const rows = html.split(/<tr[^>]+id="review_\d+"/).slice(1);
  console.log(`${name}: ${html.length} bytes, ${rows.length} rows`);
  if (!rows.length) throw new Error(`${name} has no rows`);
  return rows.map((row) => ({
    title: decode(first(row, /field title[\s\S]*?<a[^>]*title="([^"]+)"/)),
    author: flip(decode(first(row, /field author[\s\S]*?<a[^>]*>([^<]+)<\/a>/))),
    url: `https://www.goodreads.com${first(row, /(\/book\/show\/[^"?]+)/)}`,
    cover: first(row, /field cover[\s\S]*?<img[^>]*src="([^"]+)"/).replace(/\._S[XY]\d+_/, ''),
    finished: first(row, /date_read_value">([^<]+)</),
  }));
};

try {
  const now = Date.now();
  const current = await shelf('currently-reading');
  const read = (await shelf('read'))
    .filter((b) => b.finished && now - new Date(b.finished) < YEAR)
    .sort((a, b) => new Date(b.finished) - new Date(a.finished));
  const books = [...current, ...read].filter((b) => b.cover).map(({ finished, ...b }) => b);
  writeFileSync('content/reading.json', `${JSON.stringify(books, null, 1)}\n`);
  console.log(`Saved ${current.length} current and ${read.length} finished books`);
} catch (err) {
  console.warn(`Goodreads skipped: ${err.message}`);
  const books = [];
  for (const b of JSON.parse(readFileSync('content/reading.seed.json', 'utf8'))) {
    try {
      const q = new URLSearchParams({ title: b.title, author: b.author, limit: '1', fields: 'cover_i' });
      const { docs } = await (await fetch(`https://openlibrary.org/search.json?${q}`, { headers: { 'User-Agent': 'livsteinmetz-site-build' } })).json();
      if (docs[0]?.cover_i) books.push({ ...b, url: `https://www.goodreads.com/search?q=${encodeURIComponent(b.title)}`, cover: `https://covers.openlibrary.org/b/id/${docs[0].cover_i}-L.jpg` });
    } catch { /* leave this book out */ }
  }
  if (books.length) writeFileSync('content/reading.json', `${JSON.stringify(books, null, 1)}\n`);
  console.log(`Saved ${books.length} books from the seed list`);
}
