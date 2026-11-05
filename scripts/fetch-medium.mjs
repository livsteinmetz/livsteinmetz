// Pulls Olivia's posts from Medium's RSS feeds into content/notes.feed.json.
// Medium can block automated requests, so a failure here never stops the build:
// the site falls back to the hand-kept list in content/notes.json.
import { writeFileSync } from 'node:fs';

const FEEDS = ['https://medium.com/feed/@osteinmetz', 'https://medium.com/feed/barnes-foundation'];
const AUTHOR = /steinmetz/i;

const tag = (xml, name) => {
  const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
  if (!m) return '';
  return m[1].replace(/^\s*<!\[CDATA\[/, '').replace(/\]\]>\s*$/, '').trim();
};
const text = (html) =>
  html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const excerpt = (html) => {
  const t = text(html);
  if (t.length <= 220) return t;
  return t.slice(0, 220).replace(/\s+\S*$/, '') + '...';
};
const clean = (html) =>
  html
    .replace(/<(script|iframe|style)[\s\S]*?<\/\1>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/<img[^>]+medium\.com\/_\/stat[^>]*>/gi, '');

const posts = new Map();
for (const feed of FEEDS) {
  try {
    const res = await fetch(feed, { headers: { 'User-Agent': 'livsteinmetz-site-build' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    for (const [, item] of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
      if (!AUTHOR.test(tag(item, 'dc:creator'))) continue;
      const url = tag(item, 'link').split('?')[0];
      const html = clean(tag(item, 'content:encoded') || tag(item, 'description'));
      const slug = url.split('/').pop().replace(/-[0-9a-f]{8,}$/, '');
      posts.set(url, { title: text(tag(item, 'title')), url, slug, date: new Date(tag(item, 'pubDate')).toISOString().slice(0, 10), excerpt: excerpt(html), html });
    }
    console.log(`Read ${feed}`);
  } catch (e) {
    console.warn(`Skipped ${feed}: ${e.message}`);
  }
}
writeFileSync('content/notes.feed.json', JSON.stringify([...posts.values()], null, 2));
console.log(`${posts.size} posts from Medium`);
