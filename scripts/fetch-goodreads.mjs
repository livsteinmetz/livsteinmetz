// Writes the books on Olivia's currently-reading shelf, then what she finished
// in the past year, to content/reading.json from her public Goodreads feeds.
// If Goodreads won't answer, it falls back to content/reading.seed.json with
// covers from Open Library, so a failed request never blocks a deploy.
import { readFileSync, writeFileSync } from 'node:fs';

const USER = '187582052';
const YEAR = 365 * 24 * 60 * 60 * 1000;

const tag = (item, name) => {
  const m = item.match(new RegExp(`<${name}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${name}>`));
  return m ? m[1].trim() : '';
};
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"');

const shelf = async (name) => {
  const res = await fetch(`https://www.goodreads.com/review/list_rss/${USER}?shelf=${name}&per_page=100`, { headers: { 'User-Agent': 'livsteinmetz-site-build' } });
  if (!res.ok) throw new Error(`${name} ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, item]) => ({
    title: decode(tag(item, 'title')),
    author: decode(tag(item, 'author_name')),
    url: `https://www.goodreads.com/book/show/${tag(item, 'book_id')}`,
    cover: tag(item, 'book_large_image_url') || tag(item, 'book_medium_image_url'),
    finished: tag(item, 'user_read_at'),
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
