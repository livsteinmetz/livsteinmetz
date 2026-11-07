import { createHash } from 'node:crypto';
// Builds the site into build/. Plain Node, no dependencies.
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync } from 'node:fs';
import { dirname } from 'node:path';
import { contrast } from './contrast.mjs';

const read = (f) => JSON.parse(readFileSync(`content/${f}.json`, 'utf8'));
const settings = read('settings'), type = read('type'), wall = read('wall'), trends = read('trends'), library = read('library'), diary = read('diary'), previews = read('previews'), history = read('listening-history'), weatherHistory = read('weather-history'), world = read('world'), picks = read('weather-picks'), reading = read('reading');
const work = read('work'), music = read('music'), myPlaylists = read('my-playlists'), playlists = [...read('playlists'), ...settings.playlists.map((p) => myPlaylists.find((m) => m.id === (p.id || p))).filter(Boolean)], art = read('art');
let sendLists = {}, songLinks = {};
try { sendLists = read('playlist-tracks'); songLinks = read('links'); } catch { /* none yet */ }
const feed = read('notes.feed'), seed = read('notes');
const notes = [...feed, ...seed.filter((s) => !feed.some((f) => f.url === s.url))].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

const SITE = 'https://livsteinmetz.com';
// The address is put together in the browser, so scrapers reading the HTML don't get it.
const mail = (label, subject = '') => `<a href="/about" data-mail="olivia.r.steinmetz|gmail.com"${subject ? ` data-subject="${subject}"` : ''}>${label}</a>`;
const FONTS = 'https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Anton&family=Archivo:wdth,wght@62..100,700..800&family=Libre+Franklin:wght@800&family=Bodoni+Moda:opsz,wght@6..96,500&family=Fraunces:opsz,wght@144,500&family=Instrument+Serif:ital@1&family=Jost:wght@700&family=Marcellus&family=Pirata+One&family=Schibsted+Grotesk:wght@400;500&display=swap';
const V = Date.now().toString(36);
const STATEMENT = "I lead digital product, experience, and strategy for cultural organizations, designing and building at the intersection of the arts and tech. Also a double bassist.";
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fmt = (d) => new Date(d + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

// The covers on Side B rotate through the paintings; a daily build moves them along.
const day = Math.floor(Date.now() / 864e5);
const pool = ['beatrice', 'sailor', 'annunciation', 'flower'];
const rotating = (i) => pool[(day + i) % pool.length];
const noteArt = { 'scaling-the-visual-experience-platform': 'shepherd', 'one-codebase-two-brands': 'beatrice', 'designing-and-building-a-platform-for-close-looking': 'boat', 'why-were-writing-about-digital-work-again-at-the-barnes': 'annunciation' };

const noteMat = { 'scaling-the-visual-experience-platform': '#ef8f35', 'one-codebase-two-brands': '#ffffff', 'designing-and-building-a-platform-for-close-looking': '#ffffff', 'why-were-writing-about-digital-work-again-at-the-barnes': '#ffffff' };
const noteStyles = [['soft', '#efb4f7', 'center'], ['compressed', '#d9534a', 'left'], ['didone', '#66c4ff', 'left'], ['geo', '#efa090', 'center']];
const side = {
  a: work.map((w) => ({ ...w, href: `/work/${w.slug}` })),
  b: [
    ...notes.map((n, i) => ({ slug: n.slug || `note-${i}`, title: n.title, tag: 'a field note', date: n.date ? fmt(n.date) : 'Note', art: noteArt[n.slug] || rotating(i), font: noteStyles[i % 4][0], mat: noteMat[n.slug] || noteStyles[i % 4][1], align: noteStyles[i % 4][2], long: true, lines: [n.title], href: n.html ? `/notes/${n.slug}` : n.url })),
    { slug: 'double-bass', title: 'Double Bass', tag: 'since 2015', date: 'Available', art: 'bassist', font: 'grotesk', mat: '#c8d6ec', align: 'spread', lines: ['DOU BLE', 'BA SS'], href: '/bass' },
    { slug: 'playlists', title: 'Listening', tag: 'on repeat lately', date: 'Spotify', art: 'feminine', font: 'gothic', mat: '#c9321a', align: 'center', width: .7, lines: ['Listening'], color: '#ffffff', href: '/listening' },
    { slug: 'reading', title: 'Reading', tag: 'on my nightstand', date: 'Goodreads', art: 'magdalen', font: 'gothic', mat: '#c8d6ec', align: 'center', width: .7, lines: ['Reading'], color: '#ffffff', href: '/#reading' },
  ],
};
const covers = [...side.a, ...side.b];

// Flat covers are checked here. Covers on paintings are measured from real pixels in .ci/shots.mjs.
for (const c of covers.filter((x) => x.flat)) if (contrast(c.color, c.flat) < 3) throw new Error(`Contrast on "${c.title}"`);

function cropEl(key, alt) {
  const a = art[key];
  if (a.image) return `<div class="crop fill"><img src="${a.image}" alt="${esc(alt)}" width="600" height="800"></div>`;
  return `<div class="crop" role="img" aria-label="${esc(alt)}" data-barnes="${a.barnes}" data-w="${a.w}" data-h="${a.h}" data-crop="${a.crop}"></div>`;
}
function cover(c0, tag = 'a') {
  const a = c0.art && art[c0.art];
  const c = a ? { ...c0, edge: a.edge, color: a.ink, tagColor: a.tagInk } : { edge: 'top', ...c0 };
  const alt = a ? `Close crop of ${a.title} by ${a.artist}` : '';
  const below = c.edge === 'bottom';
  const heading = `<h3 class="ctitle f-${c.font} a-${c.align || 'left'}${c.long ? ' long' : ''}" style="color:${c.color}"${c.width ? ` data-width="${c.width}"` : ''}>${c.lines.map((t) => `<span class="ln">${c.align === 'spread' ? esc(t).replace(' ', '<i></i>') : esc(t)}</span>`).join('')}</h3>`;
  const tagline = c.tag === 'a field note' ? '' : `<p class="ctag a-${c.align === 'spread' ? 'left' : c.align || 'left'}" style="color:${c.tagColor || '#000'}">${esc(c.tag)}</p>`;
  const t = type[c.slug] || (c.slug.startsWith('one-codebase') && type['one-codebase']);
  // Lines in the 300 by 400 layouts keep their real letter widths. Sizes come from measuring each font.
  const line = (e) => Array.isArray(e)
    ? `<text x="${e[1]}" y="${e[2]}" textLength="${e[3]}" lengthAdjust="${e[7] || 'spacingAndGlyphs'}" font-family="${e[5]}" font-weight="${e[6]}" font-size="${e[4]}">${e[0]}</text>`
    : `<text x="${e.x}" y="${e.y}" font-family="${e.font}" font-weight="${e.wt}" font-size="${e.size}" ${e.extra || ''}>${e.text}</text>`;
  const drawn = t && `<h3 class="drawn"><svg viewBox="${t.vb || '0 0 288 420'}" fill="${t.fill}" role="img" aria-label="${esc(c.title)}">${t.under || ''}${t.t.map(line).join('')}</svg></h3>`;
  const body = drawn ? `<figure role="group" aria-label="media">${a ? cropEl(c.art, alt) : ''}<figcaption>${drawn}</figcaption></figure>` : `<figure role="group" aria-label="media">${a ? cropEl(c.art, alt) : ''}<figcaption><div class="words ${c.edge}">${heading}${below ? tagline : ''}</div>${below ? '' : `<div class="${a ? 'tag-strip' : 'tag-bottom'}">${tagline}</div>`}</figcaption></figure>`;
  const attrs = `class="cover ${a ? 'has-art' : 'flat'}" style="${c.flat ? `--flat:${c.flat};` : ''}view-transition-name:cover-${c.slug}"`;
  return tag === 'a' ? `<a href="${c.href}" ${attrs}>${body}</a>` : `<div ${attrs} data-slug="${c.slug}">${body}</div>`;
}

const jsonLd = (o) => `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', ...o }).replace(/</g, '\\u003c')}</script>`;
const PERSON = { '@type': 'Person', '@id': `${SITE}/#person`, name: 'Olivia Steinmetz', alternateName: ['Liv Steinmetz', 'Olivia R. Steinmetz'], url: SITE, description: 'Digital product, experience, and strategy for cultural organizations, and a double bassist.', knowsAbout: ['Digital product strategy', 'Museum technology', 'User experience design', 'Front-end development', 'IIIF', 'Double bass'], jobTitle: 'Product Manager, Digital Initiatives', worksFor: { '@type': 'Organization', name: 'Barnes Foundation', url: 'https://www.barnesfoundation.org/' }, sameAs: ['https://www.linkedin.com/in/livsteinmetz/', 'https://github.com/livsteinmetz', 'https://medium.com/@osteinmetz'] };

function shell({ path, title, description, body, canonical, ld = [], type = 'website', meta = '' }) {
  const full = title ? `${title} | Olivia Steinmetz` : 'Olivia Steinmetz | Digital product, experience, and strategy';
  const nav = [['/#working', 'Work'], ['/#writing', 'Writing'], ['/about', 'About']].map(([h, t]) => `<a href="${h}"${path === h ? ' aria-current="page"' : ''}>${t}</a>`).join('');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(full)}</title><meta name="description" content="${esc(description)}"><meta name="theme-color" content="#ffffff">
${[PERSON, ...ld].map(jsonLd).join('')}<link rel="canonical" href="${canonical || SITE + path}"><script src="/go.js?v=${V}"></script><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/icon-180.png"><link rel="manifest" href="/site.webmanifest">${process.env.PREVIEW || path === '/404' || path.startsWith('/listening/send/') ? '<meta name="robots" content="noindex">' : '<meta name="robots" content="index,follow,max-image-preview:large">'}
<meta property="og:title" content="${esc(full)}"><meta property="og:description" content="${esc(description)}"><meta property="og:type" content="${type}">${meta}<meta property="og:url" content="${SITE}${path}"><meta property="og:site_name" content="Olivia Steinmetz"><meta property="og:image" content="${SITE}/media/og.jpg"><meta property="og:image:alt" content="Olivia Steinmetz"><meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="${FONTS.replace(/&/g, '&amp;')}"><link rel="stylesheet" href="/styles.css?v=${V}">
<script async src="https://www.googletagmanager.com/gtag/js?id=G-WZM6YLSHQY"></script><script src="/gtag.js?v=${V}"></script>
</head><body><a class="skip" href="#site-content">Skip to content</a>
<header class="masthead"><a class="mark" href="/">Olivia Steinmetz</a><nav aria-label="Main">${nav}</nav></header>
<main id="site-content">${body}</main>
<footer class="credit"><p>${mail('Email')}<a href="https://www.linkedin.com/in/livsteinmetz/">LinkedIn</a><a href="https://github.com/livsteinmetz">GitHub</a><a href="https://medium.com/@osteinmetz">Medium</a></p>
<p style="margin-top:8px">Paintings courtesy of open access museum collections. All public domain, served over <a href="/colophon" style="margin:0">IIIF</a>. Opinions are my own.</p></footer>
<script type="module" src="/art.js?v=${V}"></script></body></html>`;
}

const shown = (key) => !settings.hidden.includes(key);
const isMusic = (c) => ['double-bass', 'playlists'].includes(c.slug);
const shelf = (items, label, id) => `<section class="side" id="${id}" aria-labelledby="${id}-title"><h2 id="${id}-title">${label}</h2><ol class="shelf">${items.filter((c) => shown(`${id}:${c.slug}`)).map((c) => `<li class="mat" data-item="${id}:${c.slug}" style="--mat:${c.mat}">${cover(c)}</li>`).join('')}</ol></section>`;
const wallShelf = wall.length ? `<section class="side" id="on-the-wall" aria-labelledby="on-the-wall-title"><h2 id="on-the-wall-title">Looking</h2><ol class="shelf">${wall.filter((w) => shown(`looking:${w.id}`)).map((w, i) => `<li data-item="looking:${w.id}"><a class="hang look" href="${w.web}" data-caption="${esc(w.title)}, ${esc(w.artist)}. ${esc(w.museum)}"><figure role="group" aria-label="media"><div class="still"><img src="${w.web}" alt="${esc(w.title)} by ${esc(w.artist)}" loading="lazy" decoding="async" width="${w.w}" height="${w.h}" style="object-position:${[50, 30, 70, 40][i % 4]}% ${[35, 60, 45, 25][i % 4]}%"></div><figcaption class="cap"><i>${esc(w.title)}</i>, ${esc(w.artist)}<br>${esc(w.museum)}</figcaption></figure></a></li>`).join('')}</ol><dialog class="lookbox"><img alt=""><p></p></dialog></section>` : '';
const pages = {};
const MATS = ['#fff27a', '#66c4ff', '#efb4f7', '#ef8f35', '#efa090', '#d9534a'];
const mat = (i) => `class="mat" style="--mat:${MATS[i % MATS.length]}"`;
const trendsCard = trends.windows.length ? `<li class="mat" style="--mat:#c9321a"><a class="hang" href="/listening/trends"><figure role="group" aria-label="media"><div class="still trends-card"><img src="/media/feminine.jpg" alt="Detail of The Eternal Feminine by Paul Cézanne" loading="lazy" decoding="async" width="900" height="1200"><span>Trends</span></div><figcaption class="cap">Eight years of my listening, charted</figcaption></figure></a></li>` : '';
const listeningShelf = playlists.length || trendsCard ? `<section class="side" id="listening" aria-labelledby="listening-title"><h2 id="listening-title">Listening <button class="sound" type="button" aria-pressed="false">Sound off</button></h2><ol class="shelf">${trendsCard}${playlists.map((p, i) => `<li ${mat(i + 1)} data-item="listening:${p.id}"><a class="hang" href="/listening#${p.id}"><figure role="group" aria-label="media"><div class="still sleeve"${previews[p.id] ? ` data-preview="${previews[p.id].url}" data-song="${esc(previews[p.id].title)}, ${esc(previews[p.id].artist)}"` : ''}><span class="disc" style="background-image:url(${p.cover || p.image})"></span><img src="${p.cover || p.image}" alt="" loading="lazy" decoding="async" width="300" height="300"></div><figcaption class="cap">${esc(p.title)}</figcaption></figure></a></li>`).join('')}</ol></section>` : '';

const readingShelf = reading.length ? `<section class="side" id="reading" aria-labelledby="reading-title"><h2 id="reading-title">Reading</h2><ol class="shelf">${reading.filter((b) => shown(`reading:${b.url}`)).map((b, i) => `<li ${mat(i + 2)} data-item="reading:${b.url}"><a class="hang" href="${b.url}"><figure role="group" aria-label="media"><div class="still jacket">${b.blurb ? `<p class="blurb">${esc(b.blurb)}</p>` : ''}<img src="${b.cover}" alt="" loading="lazy" decoding="async"></div><figcaption class="cap"><i>${esc(b.title)}</i>${b.author ? `, ${esc(b.author)}` : ''}</figcaption></figure></a></li>`).join('')}</ol></section>` : '';

pages['index.html'] = shell({ path: '/', description: STATEMENT, ld: [{ '@type': 'WebSite', name: 'Olivia Steinmetz', url: SITE, author: { '@id': `${SITE}/#person` } }], body: `<article id="story"><header><h1 class="statement">${STATEMENT}</h1></header>${shelf(side.a, 'Working', 'working')}${shelf(side.b.filter((c) => !isMusic(c)), 'Writing', 'writing')}${readingShelf}${wallShelf}${listeningShelf}${shelf(side.b.filter((c) => c.slug === 'double-bass'), 'Playing', 'playing')}</article>` });

function record(current, sideKey) {
  const list = side[sideKey].filter((c) => c.slug === current.slug || shown(`${sideKey === 'a' ? 'working' : isMusic(c) ? 'playing' : 'writing'}:${c.slug}`));
  const tracks = list.map((c) => `<a class="track" data-track="${c.slug}" href="${c.href}"${c.slug === current.slug ? ' aria-current="page"' : ''}><span>${esc(c.title)}</span><small>${esc(c.date)}</small></a>`).join('');
  const other = sideKey === 'a' ? side.b[0] : side.a[0];
  const flip = `<div class="flip"><a href="${sideKey === 'a' ? current.href : side.a[0].href}"${sideKey === 'a' ? ' aria-current="true"' : ''}>Side A</a><a href="${sideKey === 'b' ? current.href : side.b[0].href}"${sideKey === 'b' ? ' aria-current="true"' : ''}>Side B</a></div>`;
  const stage = list.map((c) => cover(c, 'div').replace('class="cover', `${c.slug === current.slug ? '' : 'hidden '}class="cover`)).join('');
  return `<section class="record"><div class="tracks" data-tracks>${flip}${tracks}</div><div class="stage ${sideKey === 'b' ? 'notes-stage' : ''}" data-stage data-current="${current.slug}">${stage}</div></section>`;
}
const viewer = (key) => { const a = art[key]; return a?.barnes ? `<section class="closer"><p>Look closer: <i>${esc(a.title)}</i>, ${esc(a.artist)}. Drag and pinch to zoom. <a href="/iiif/${key}.json">IIIF manifest</a></p><div class="viewer" data-viewer="${a.barnes}" role="application" aria-label="Deep zoom viewer for ${esc(a.title)}"></div></section>` : ''; };

work.forEach((w) => {
  const item = (m) => `<figure class="${m.tall ? 'tall' : ''}" role="group" aria-label="media">${m.video ? `<video data-auto muted loop playsinline preload="none" aria-label="${esc(m.alt)}"><source src="/media/${m.video}.mp4" type="video/mp4"></video>` : `<img src="/media/${m.image}.webp" alt="${esc(m.alt)}" loading="lazy">`}<figcaption>${esc(m.cap)}</figcaption></figure>`;
  const gallery = w.gallery ? `<div class="gallery">${w.gallery.map(item).join('')}</div>` : '';
  const shot = w.media ? `<div class="shot">${w.media.video ? `<video controls muted loop playsinline preload="none" poster="/media/${w.media.poster}.webp" aria-label="${esc(w.media.alt)}"><source src="/media/${w.media.video}.mp4" type="video/mp4"></video>` : `<img src="/media/${w.media.image}.webp" alt="${esc(w.media.alt)}" loading="lazy">`}</div>` : '';
  pages[`work/${w.slug}.html`] = shell({ path: `/work/${w.slug}`, title: w.title, description: `${w.short}. ${w.role} for ${w.org}.`, ld: [{ '@type': 'CreativeWork', name: w.title, abstract: w.short, creator: { '@id': `${SITE}/#person` }, url: `${SITE}/work/${w.slug}` }],
    body: `${record({ ...w, href: `/work/${w.slug}` }, 'a')}<article class="detail" id="story"><header><h1>${esc(w.short)}</h1></header><section name="articleBody" class="prose">${w.body.map((p) => `<p>${esc(p)}</p>`).join('')}${w.reads ? `<p>Read more: ${w.reads.map((r) => `<a href="/notes/${r.slug}">${esc(r.title)}</a>`).join(', ')}</p>` : ''}${w.link ? `<p><a href="${w.link}">${esc(w.linkText)}</a></p>` : ''}</section><dl class="meta"><dt>For</dt><dd>${esc(w.org)}</dd><dt>When</dt><dd>${esc(w.date)}</dd><dt>My part</dt><dd>${esc(w.role)}</dd>${w.stack ? `<dt>Built with</dt><dd>${esc(w.stack)}</dd>` : ''}</dl>${shot}${gallery}</article>${viewer(w.art)}` });
});

const sideB = side.b;
feed.forEach((n) => {
  const cur = sideB.find((c) => c.slug === n.slug) || sideB[0];
  pages[`notes/${n.slug}.html`] = shell({ path: `/notes/${n.slug}`, title: n.title, description: n.excerpt, canonical: n.url, type: 'article', meta: `<meta property="article:published_time" content="${n.date}"><meta property="article:author" content="Olivia Steinmetz">`, ld: [{ '@type': 'Article', headline: n.title, datePublished: n.date, author: { '@id': `${SITE}/#person` }, url: n.url }],
    body: `${record(cur, 'b')}<article class="detail" id="story" style="grid-template-columns:1fr"><header><h1>${esc(n.title)}</h1></header><section name="articleBody" class="prose"><p><a href="${n.url}">First published on the Barnes Foundation's Medium</a>, ${fmt(n.date)}.</p>${n.html}</section></article>` });
});

const list = (a) => `<ul>${a.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
pages['bass.html'] = shell({ path: '/bass', title: 'Double bass', description: 'Olivia Steinmetz is a freelance double bassist around Philadelphia.',
  body: `${record(sideB.find((c) => c.slug === 'double-bass'), 'b')}<div class="page" style="padding-top:0"><p style="max-width:34em">A classical musician for over two decades, I've been performing professionally since 2015 in ensembles around the country.</p>${mail('Email me about a gig', 'Bass gig').replace('<a ', '<a class="btn" ')}<div class="cols"><section><h2>Ensembles</h2>${list(music.ensembles)}</section><section><h2>Teaching and coaching</h2>${list(music.teaching)}</section></div></div>` });
pages['listening.html'] = shell({ path: '/listening', title: 'Listening', description: "What Olivia Steinmetz is listening to.",
  body: `${record(sideB.find((c) => c.slug === 'playlists'), 'b')}<div class="page" style="padding-top:0">${trends.windows.length ? '<p><a href="/listening/trends">See my listening trends</a></p>' : ''}${playlists.length ? `<div class="play">${playlists.map((p) => `<div class="pl"><iframe id="${esc(p.id)}" title="${esc(p.title)}" loading="lazy" allow="encrypted-media" src="https://open.spotify.com/embed/playlist/${esc(p.id)}"></iframe>${sendLists[p.id]?.length ? `<a class="send" href="/listening/send/${esc(p.id)}">Send to Apple Music, Tidal or Deezer</a>` : ''}</div>`).join('')}</div>` : ''}</div>` });

const slope = () => {
  const W = trends.windows, x = (i) => 170 + i * 330, y = (r) => 44 + r * 34;
  const names = [...new Set(W.flatMap((w) => w.artists))];
  const lines = names.map((n) => {
    const pts = W.map((w, i) => [i, w.artists.indexOf(n)]).filter(([, r]) => r >= 0);
    return pts.length > 1 ? `<polyline class="draw" pathLength="1" style="--t:0" fill="none" stroke="#16246e" stroke-width="${pts.length === W.length ? 2.5 : 1}" points="${pts.map(([i, r]) => `${x(i)},${y(r)}`).join(' ')}"/>` : '';
  }).join('');
  const labels = W.map((w, i) => `<text x="${x(i)}" y="18" text-anchor="middle" font-weight="500">${esc(w.label)}</text>${w.artists.map((n, r) => `<text x="${x(i) + (i === 2 ? 8 : i === 0 ? -8 : 0)}" y="${y(r) + 5}" text-anchor="${i === 0 ? 'end' : i === 2 ? 'start' : 'middle'}" font-size="14" stroke="#fff" stroke-width="6" paint-order="stroke">${esc(n)}</text>`).join('')}`).join('');
  return `<figure role="group" aria-label="media"><div class="scroll"><svg viewBox="0 0 1000 400" role="img" aria-label="My top artists across three time ranges">${lines}${labels}</svg></div></figure>`;
};
pages['listening/trends.html'] = shell({ path: '/listening/trends', title: 'Listening trends', description: "My listening, drawn a few ways. Try it with your own Spotify history.",
  body: `<div id="progress"></div><article id="story" class="wrapped"><header class="wrapped-head"><h1>Listening trends</h1></header><form id="gate" class="gate" hidden><p>This page is eight years of my listening.</p><label>Email <input id="gate-email" type="email" autocomplete="email" required></label><label>Passcode <input id="gate-code" type="password" autocomplete="off" required></label><button type="submit">Open</button><p id="gate-status" role="status"></p><p class="gate-me"><button type="button" id="gate-sample" class="outlinebtn">No passcode? See it with a sample listener</button></p><p class="gate-me" id="gate-me-row" hidden><button type="button" id="gate-me" class="textbtn">Sign in with Google</button></p></form><p id="sample-note" class="sample-note" hidden>Sample data. (Okay, fine, it's based on a small slice of my listening.)</p><div id="deck" hidden><section class="scene long" id="scene-river" aria-labelledby="river-line"><div class="scene-copy"><h2 id="river-line" aria-live="polite"></h2><p id="river-sub"></p></div><div class="plate" id="river-plate"></div></section><section class="scene long" id="scene-places" aria-labelledby="places-line"><div class="scene-copy"><h2 id="places-line" aria-live="polite"></h2><p id="places-sub"></p><p id="globe-song"></p></div><div class="plate" id="globe-plate"><button type="button" id="globe-sound" class="globe-sound" aria-pressed="false">Sound off</button><canvas id="globe" role="img" aria-label="A globe turning to each place I have listened to music"></canvas></div></section><section class="scene lib poem" id="scene-today" aria-labelledby="today-kicker"><div class="scene-copy big"><p class="kicker" id="today-kicker">Today in Philadelphia</p><blockquote id="today-sky"></blockquote><p id="today-words" class="today-words" aria-live="polite"></p><p class="today-other"><button type="button" id="today-change" class="linkish" hidden>Somewhere else? See your weather</button></p><form id="today-where" class="today-where" hidden><label for="today-city">Your city</label><input id="today-city" autocomplete="address-level2" placeholder="Lisbon"><button type="submit">Show it</button><button type="button" id="today-here" class="linkish">Use my location</button><p id="today-where-status" role="status"></p></form></div></section><section class="scene long" id="scene-season" aria-labelledby="season-line"><div class="scene-copy"><h2 id="season-line" aria-live="polite"></h2><p id="season-sub"></p></div><div class="plate" id="rings"></div></section><section class="scene long" id="scene-weather" aria-labelledby="weather-line"><div class="scene-copy"><h2 id="weather-line" aria-live="polite"></h2><p id="weather-sub"></p></div><div class="plate" id="weather-plate"></div></section><section class="scene long" id="scene-clock" aria-labelledby="clock-line"><div class="scene-copy"><h2 id="clock-line" aria-live="polite"></h2><p id="clock-sub"></p></div><div class="plate" id="clock"></div></section><section class="scene long" id="scene-days" aria-labelledby="days-line"><div class="scene-copy"><h2 id="days-line" aria-live="polite"></h2><p id="days-sub"></p></div><div class="plate" id="days-plate"></div></section><section class="scene lib" id="scene-decades" aria-labelledby="decades-line"><div class="scene-copy"><h2 id="decades-line"></h2><p id="decades-sub"></p></div><div class="plate" id="decades-plate"></div></section><section class="scene lib" id="scene-wall" aria-labelledby="wall-line"><div class="scene-copy"><h2 id="wall-line"></h2><p id="wall-sub"></p></div><div class="plate" id="wall-plate"></div></section></div><section class="scene static try" id="try" aria-labelledby="try-title"><div class="scene-copy"><h2 id="try-title">Yours would look different</h2><p>Spotify will send you your listening history if you <a href="https://www.spotify.com/account/privacy/">ask for it</a>.</p><p class="drop"><label>Choose files <input id="file" type="file" accept=".json,application/json" multiple></label><button id="demo" type="button">See it with sample data</button><button id="reset" type="button">Back to the top</button></p><p id="drop-status" role="status"></p></div></section><section class="scene static how"><details class="how-inner"><summary>How I made this</summary><p>I asked Spotify for my extended streaming history, eight years of plays, and boiled it down to counts on my own computer. What you see here is totals and artists. The play-by-play never leaves my machine.</p><ul><li><strong>Spotify Web API</strong> for my playlists and top artists, refreshed every day.</li><li><strong>Open-Meteo</strong> for the weather on every day since 2019, wherever I was, plus sunrise and sunset. It also checks the sky where you are, if you let it.</li><li><strong>MusicBrainz</strong> for genres, and the <strong>iTunes Search API</strong> for the short song clips.</li><li><strong>Natural Earth</strong> coastlines, through world-atlas, for the globe.</li><li>Hand-drawn <strong>SVG and canvas</strong>, no charting library. Your scroll position drives every frame.</li><li>Plain <strong>Node</strong>, hosted on <strong>Firebase</strong>, deployed by <strong>GitHub Actions</strong>, and checked with <strong>Playwright</strong> before anything goes live.</li></ul></details></section></article><script id="picks" type="application/json">${JSON.stringify(picks).replace(/</g, '\\u003c')}</script><script id="world" type="application/json">null</script><script id="world-public" type="application/json">${JSON.stringify(world?.dots ? { dots: world.dots, clips: {} } : null)}</script><script id="weather" type="application/json">null</script><script id="history" type="application/json">null</script><script id="library" type="application/json">${JSON.stringify(library).replace(/</g, '\\u003c')}</script><script type="module" src="/trends.js?v=${V}"></script>` });

pages['about.html'] = shell({ path: '/about', title: 'About', description: STATEMENT, type: 'profile', ld: [{ '@type': 'ProfilePage', url: `${SITE}/about`, mainEntity: { '@id': `${SITE}/#person` } }], body: `<div class="page"><div class="prose"><h1>About</h1>
<p>I lead digital product, design, experience, and strategy for the Barnes Foundation, Calder Gardens, and the Pew Center for Arts &amp; Heritage.</p>
<p>I joined the Barnes in 2021 as a front-end engineer on a small team, where everyone did a little of everything (still true!). Today I work across engineering, UI/UX design, and product strategy to turn our educational mission into durable systems and mature our digital product portfolio.</p>
<p>I studied both Engineering Design and Double Bass Performance at Vanderbilt University, and led innovation and entrepreneurship programming and curriculum development at the Wond'ry Center for Innovation and Entrepreneurship in its first years on campus. I worked in Emerging Tech consulting and the Operations Design Thinking studio at Accenture, where I picked up an interest in emerging technologies and my first web development skills, and applied and shared design thinking methods I still use today. At Capital One, I completed a six-month software engineering program and moved into a full-stack developer role, the foundation I brought with me to the Barnes.</p>
<p>I freelance as a double bassist in the Philadelphia area, and being a musician is what connects me to this work. I've been at the intersection of the arts and tech for a long time, and I've sat on both sides of it: I know what it takes to make art, and what it takes to get it in front of people. Orchestra taught me most of what I know about product work. You listen, you create a solid foundation, and you show up prepared because everybody else is counting on you. It's also why the mission of cultural organizations matters so much to me, and how I found my niche here.</p>
<h2>Things I like</h2><ul class="likes">
<li>making my own espresso mugs</li>
<li>reading books small enough to fit in my bag</li>
<li>hunting used bookstores for the books on my running list</li>
<li>curating overly specific <a href="/listening">playlists</a></li>
<li>working my way through Dominion expansions</li>
<li>always having a deck of cards on me</li>
<li>going for a walk and calling a friend</li>
</ul>
<h2>Say hello</h2><p>I'm happy to talk with anyone working on museum technology, or anyone who needs a bassist. ${mail('Email me')}.</p></div></div>` });
pages['colophon.html'] = shell({ path: '/colophon', title: 'Colophon', description: 'How the paintings on this site are served.', body: `<div class="page"><div class="prose"><h1>Colophon</h1><p>Every painting here is public domain. The covers are assembled in your browser from IIIF image tiles, the same standard behind the Barnes online collection and the Visual Experience Platform. Each work has a IIIF manifest, so you can open it in any IIIF viewer.</p><ul>${Object.entries(art).map(([k, a]) => `<li><a href="/iiif/${k}.json">${esc(a.title)}</a>, ${esc(a.artist)} (${esc(a.rights)})</li>`).join('')}</ul></div></div>` });
pages['404.html'] = shell({ path: '/404', title: 'Page not found', description: 'This page has moved.', body: `<div class="page"><h1>Oops looks like we got lost.</h1><p><a href="/">Go to the home page</a></p></div>` });

rmSync('build', { recursive: true, force: true }); mkdirSync('build/iiif', { recursive: true });
cpSync('site', 'build', { recursive: true });
// One page per shared playlist, for friends on other apps.
for (const p of playlists) {
  const tracks = sendLists[p.id];
  if (!tracks?.length) continue;
  const q = (t) => encodeURIComponent(`${t.t} ${t.a.split(',')[0]}`);
  const rows = tracks.map((t) => { const l = songLinks[t.id] || {}; return `<li><span class="song">${esc(t.t)}</span> <span class="by">${esc(t.a)}</span><span class="go"><a href="${esc(l.apple || `https://music.apple.com/us/search?term=${q(t)}`)}">Apple Music</a><a href="${esc(l.deezer || `https://www.deezer.com/search/${q(t)}`)}">Deezer</a><a href="https://listen.tidal.com/search?q=${q(t)}">Tidal</a><a href="https://music.youtube.com/search?q=${q(t)}">YouTube Music</a></span></li>`; }).join('');
  pages[`listening/send/${p.id}.html`] = shell({ path: `/listening/send/${p.id}`, title: p.title, description: `Send ${p.title} to Apple Music, Tidal, Deezer or YouTube Music.`, body: `<div class="page send"><p class="back"><a href="/listening">Listening</a></p><h1>${esc(p.title)}</h1><p>${tracks.length} songs. Here's how to bring this playlist to another app.</p><h2>All at once</h2><p>Copy the playlist link, then paste it into TuneMyMusic or Soundiiz. Both move playlists into Apple Music, Tidal, Deezer, YouTube Music and more.</p><p class="send-actions"><button type="button" class="btn" data-copy="https://open.spotify.com/playlist/${esc(p.id)}">Copy the playlist link</button><a class="btn" href="https://www.tunemymusic.com/">Open TuneMyMusic</a><a class="btn" href="https://soundiiz.com/">Open Soundiiz</a></p><h2>Song by song</h2><p><button type="button" class="btn" data-copy-list>Copy the song list</button></p><ol class="tracks">${rows}</ol></div>` });
}
for (const [f, html] of Object.entries(pages)) { mkdirSync(dirname(`build/${f}`), { recursive: true }); writeFileSync(`build/${f}`, html); }

// IIIF Presentation 3 manifests, one per painting.
for (const [k, a] of Object.entries(art)) {
  const id = `${SITE}/iiif/${k}.json`;
  const service = a.barnes ? [{ '@id': `https://d2r83x5xt28klo.cloudfront.net/tiles/${a.barnes}`, '@type': 'ImageService2', profile: 'level1' }] : undefined;
  const body = { id: a.barnes ? `https://d2r83x5xt28klo.cloudfront.net/tiles/${a.barnes}/0,0,1024,1024/256,/0/color.jpg` : a.image, type: 'Image', format: 'image/jpeg', width: a.w, height: a.h, ...(service && { service }) };
  writeFileSync(`build/iiif/${k}.json`, JSON.stringify({ '@context': 'http://iiif.io/api/presentation/3/context.json', id, type: 'Manifest', label: { en: [a.title] }, summary: { en: [a.artist] }, requiredStatement: { label: { en: ['Credit'] }, value: { en: [a.barnes ? 'Courtesy of the Barnes Foundation, Merion and Philadelphia, Pennsylvania' : a.rights] } }, rights: 'https://creativecommons.org/publicdomain/mark/1.0/', items: [{ id: `${id}/canvas`, type: 'Canvas', width: a.w, height: a.h, items: [{ id: `${id}/page`, type: 'AnnotationPage', items: [{ id: `${id}/anno`, type: 'Annotation', motivation: 'painting', target: `${id}/canvas`, body }] }] }] }, null, 1));
}
wall.forEach((a) => { const id = `${SITE}/iiif/wall-${a.id}.json`; writeFileSync(`build/iiif/wall-${a.id}.json`, JSON.stringify({ '@context': 'http://iiif.io/api/presentation/3/context.json', id, type: 'Manifest', label: { en: [a.title] }, summary: { en: [a.artist] }, requiredStatement: { label: { en: ['Credit'] }, value: { en: [`${a.museum}, public domain`] } }, rights: 'https://creativecommons.org/publicdomain/mark/1.0/', items: [{ id: `${id}/canvas`, type: 'Canvas', width: a.w, height: a.h, items: [{ id: `${id}/page`, type: 'AnnotationPage', items: [{ id: `${id}/anno`, type: 'Annotation', motivation: 'painting', target: `${id}/canvas`, body: { id: a.web.startsWith('/') ? `${SITE}${a.web}` : a.web, type: 'Image', format: 'image/jpeg' } }] }] }] }, null, 1)); });
const urls = Object.keys(pages).filter((f) => f !== '404.html' && !f.startsWith('listening/send/')).map((f) => `${SITE}/${f.replace(/(index)?\.html$/, '')}`);
writeFileSync('build/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((u) => `<url><loc>${u}</loc></url>`).join('')}</urlset>`);

// Admin lives outside the sitemap and asks search engines to skip it.
const adminItems = [
  { name: 'Working', items: side.a.map((c) => ({ key: `working:${c.slug}`, label: c.title })) },
  { name: 'Writing', items: side.b.filter((c) => !isMusic(c)).map((c) => ({ key: `writing:${c.slug}`, label: c.title })) },
  { name: 'Reading', items: reading.map((b) => ({ key: `reading:${b.url}`, label: `${b.title}, ${b.author}` })) },
  { name: 'Looking', items: wall.map((w) => ({ key: `looking:${w.id}`, label: `${w.title}, ${w.artist}` })) },
  { name: 'Playing', items: side.b.filter(isMusic).map((c) => ({ key: `playing:${c.slug}`, label: c.title })) },
];
writeFileSync('build/admin.html', `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow"><title>Admin</title><link rel="stylesheet" href="/styles.css?v=${V}"><style>.admin{max-width:720px;margin:0 auto;padding:32px var(--gutter)}.admin fieldset{border:0;border-top:1px solid #000;margin:24px 0;padding:12px 0}.admin legend{font-weight:500;padding-right:12px}.admin label{display:block;padding:4px 0}.admin .row{display:flex;gap:8px;margin:8px 0}.admin .pl{display:flex;align-items:center;gap:10px;padding:4px 0}.admin .pl img{width:36px;height:36px}.admin .pl span{flex:1;min-width:0}.admin input:not([type=checkbox]):not([type=radio]){flex:1;min-width:0;width:100%;font:inherit;padding:8px;border:1px solid #000}.admin button{font:inherit;padding:8px 14px;border:1px solid #000;background:#fff;cursor:pointer}</style></head><body><main class="admin"><h1>Admin</h1><div id="signed-out"><button id="in" type="button">Sign in with Google</button></div><div id="panel" hidden><div id="sections"></div><fieldset><legend>Your playlists</legend><p>Check the ones to show on your Playlists page. Pick one for the Listening shelf. Private playlists can't show on the site.</p><input id="filter" aria-label="Filter playlists" placeholder="Filter"><div id="playlists"></div></fieldset><fieldset><legend>Listening trends passcode</legend><p>Saved here so you can open the page by signing in. Use the same passcode as the LISTENING_PASSCODE secret in GitHub.</p><input id="passcode" type="password" autocomplete="off" aria-label="Listening trends passcode"> <button id="save-code" type="button">Save passcode</button></fieldset><fieldset><legend>Who opened Listening trends</legend><ol id="views"></ol></fieldset><p><button id="save" type="button">Save</button> <button id="out" type="button">Sign out</button></p></div><p id="status" role="status"></p></main><script id="items" type="application/json">${JSON.stringify(adminItems).replace(/</g, '\\u003c')}</script><script id="mine" type="application/json">${JSON.stringify(myPlaylists.filter((p) => p.isPublic !== false)).replace(/</g, '\\u003c')}</script><script type="module" src="/admin.js?v=${V}"></script></body></html>`);
mkdirSync('build/data', { recursive: true });
// The daily Spotify snapshot and diary are kept for the next build to pick up, at a folder
// named from a secret, so they aren't sitting at a public address.
{
  const token = process.env.SPOTIFY_REFRESH_TOKEN || '';
  if (token) {
    const dir = `build/data/${createHash('sha256').update(`snapshot:${token}`).digest('hex').slice(0, 32)}`;
    mkdirSync(dir, { recursive: true });
    writeFileSync(`${dir}/diary.json`, JSON.stringify(diary));
    if (myPlaylists.length) writeFileSync('build/.spotify-backup.json', JSON.stringify({ at: trends.at || '', 'my-playlists': myPlaylists.filter((p) => p.isPublic !== false), trends, library, previews, 'playlist-tracks': sendLists, diary }));
    writeFileSync(`${dir}/spotify.json`, JSON.stringify({ at: trends.at || '', 'my-playlists': myPlaylists.filter((p) => p.isPublic !== false), trends, library, previews, 'playlist-tracks': sendLists }));
  }
}
// Listening data lives at an address only the passcode can produce. Without the passcode
// set as the LISTENING_PASSCODE secret, nothing is published and the page stays locked.
{
  const code = (process.env.LISTENING_PASSCODE || '').trim();
  if (code && history?.days) {
    const key = createHash('sha256').update(`livsteinmetz:${code}`).digest('hex').slice(0, 40);
    mkdirSync('build/l', { recursive: true });
    writeFileSync(`build/l/${key}.json`, JSON.stringify({ history: { ...history, days: { ...history.days, tops: undefined, names: undefined } }, weather: weatherHistory, world }));
    console.log('Listening data published behind the passcode');
  } else console.log('No LISTENING_PASSCODE, so the listening page stays locked');
}
mkdirSync('build/data', { recursive: true });
writeFileSync('build/data/links.json', JSON.stringify(songLinks));
writeFileSync('build/robots.txt', `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /data/\nDisallow: /l/\nSitemap: ${SITE}/sitemap.xml\n`);
writeFileSync('build/site.webmanifest', JSON.stringify({ name: 'Olivia Steinmetz', short_name: 'Olivia', start_url: '/', display: 'browser', background_color: '#ffffff', theme_color: '#16246e', icons: [{ src: '/icon-180.png', sizes: '180x180', type: 'image/png' }, { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }] }));
// A plain summary for AI search tools, built from the same content as the pages.
writeFileSync('build/llms.txt', `# Olivia Steinmetz\n\n> ${STATEMENT}\n\n## Work\n${work.map((w) => `- [${w.title}](${SITE}/work/${w.slug}): ${w.short}`).join('\n')}\n\n## Field notes\n${notes.map((n) => `- [${n.title}](${n.url})`).join('\n')}\n\n## More\n- [About](${SITE}/about)\n- [Double bass](${SITE}/bass)\n`);
mkdirSync('build/.well-known', { recursive: true });
writeFileSync('build/.well-known/security.txt', `Contact: https://www.linkedin.com/in/livsteinmetz/\nExpires: ${new Date(Date.now() + 300 * 864e5).toISOString()}\nPreferred-Languages: en\n`);
// A study page for the cover type and paintings, only on the preview channel.
if (process.env.PREVIEW) {
  // F is Libre Franklin, C is Archivo Condensed, S is Pinyon Script. Each line belongs to a color group.
  const FONT = { F: ['Libre Franklin', 800, '100%', '-0.02em', 1], C: ['Archivo', 800, '62%', '0', 1], S: ['Pinyon Script', 400, '100%', '0', 1.45] };
  const v = (k, label, art, modes, lines, o = {}) => ({ k, label, art, modes, lines, max: 92, lh: 0.98, ...o });
  const F = (t, g = 0) => ['F', t, g], C = (t, g = 0) => ['C', t, g], Sc = (t, g = 0) => ['S', t, g];
  const FUN = [['pink', '#e64aa6'], ['green', '#8dff72'], ['lilac', '#efb4f7'], ['orange', '#ef8f35'], ['sky', '#66c4ff'], ['red', '#c9321a']];
  const fun = (art2, lines, name, skip, o) => FUN.filter(([n]) => !skip.includes(n)).map(([n, hex], i) => v(String.fromCharCode(66 + i), `${n[0].toUpperCase() + n.slice(1)} on ${name}`, art2, [`fix:${hex}`], lines, o));
  const VXP = [F('Visual'), F('Experience'), F('Platform')], SC = [C('SCALING THE'), C('VISUAL'), C('EXPERIENCE'), C('PLATFORM')], CO = { max: 120, lh: 0.92 };
  // Works from Olivia's desktop and public domain works by women in the Barnes collection, cropped to a portrait detail.
  const NEW = {
    goldfish: [5780, 5173, 6044, [0, 0, 1, 1], 'Studio with Goldfish', 'Henri Matisse'],
    peaches: [6945, 6486, 4256, [0.006, 0.024, 0.955, 0.915], 'Four Peaches on a Plate', 'Paul Cézanne'],
    casket: [5119, 5844, 4756, [0, 0.136, 1, 0.772], 'Chinese Casket', 'Henri Matisse'],
    preserves: [5229, 6126, 3372, [0, 0, 1, 1], 'Plate with Fruit and Pot of Preserves', 'Paul Cézanne'],
    bluestill: [5526, 12215, 9271, [0.127, 0.181, 0.768, 0.635], 'Blue Still Life', 'Henri Matisse'],
    figs: [4721, 6086, 3472, [0, 0, 1, 1], 'Pomegranate and Figs', 'Pierre-Auguste Renoir'],
    tulips: [5147, 5945, 7294, [0.084, 0, 0.862, 0.44], 'Tulips in a Green Vase', 'Alfred Maurer'],
    vase: [5075, 4284, 5250, [0.067, 0.511, 0.861, 0.441], 'The Flowered Vase', 'Paul Cézanne'],
    asters: [5530, 4318, 5226, [0.172, 0.166, 0.59, 0.306], 'Bouquet of Flowers with China Asters', 'Henri Rousseau'],
    dejeuner: [6813, 2380, 2848, [0, 0, 1, 1], 'Déjeuner', 'May Preston'],
    fieldflowers: [7047, 4558, 5802, [0, 0, 1, 1], 'Field Flowers', 'Melanie Marc'],
    yellowrose: [6455, 4450, 5734, [0, 0, 1, 1], 'Flowers with Yellow Rose', 'Melanie Marc'],
    cassatt: [6385, 5832, 8422, [0, 0, 1, 1], 'Woman with Nude Boy at Her Left', 'Mary Cassatt'],
    acoma: [4510, 4180, 3648, [0, 0, 1, 1], 'Storage Jar', 'Acoma Mary'],
    olla: [4598, 5334, 4968, [0, 0, 1, 1], 'Olla (Water Jar)', 'Rosalia Toribio'],
    liel: [5812, 5426, 3175, [0, 0, 1, 1], 'Sampler', 'Mary Liel'],
    sundaywalk: [6274, 6850, 5917, [0, 0, 1, 1], 'The Sunday Walk', 'Edith Dimock'],
    confidantes: [7024, 8134, 5304, [0, 0, 1, 1], 'The Confidantes', 'May Preston'],
    burkholder: [4980, 4136, 3419, [0, 0, 1, 1], 'Lonesome Ridge Sampler', 'Nancy Burkholder'],
    cutout: [5168, 6586, 4806, [0, 0, 1, 1], 'New Jersey Cut-Out', 'Susan Cray'],
    eggs: [6941, 7999, 5845, [0, 0, 1, 1], 'Women with Eggs', 'Edith Dimock'],
    necklace: [5508, 6468, 3683, [0, 0, 1, 1], 'A Necklace of Boats', 'Violette de Mazia'],
  };
  for (const [k, [id, W, H, [bx, by, bw, bh], title, artist]] of Object.entries(NEW)) {
    // A 3:4 portrait slice from the middle of the detail she likes.
    let ph = bh * H, pw = ph * 0.75;
    if (pw > bw * W) { pw = bw * W; ph = pw / 0.75; }
    const cx = (bx + bw / 2) * W, cy = (by + bh / 2) * H;
    const x = Math.min(Math.max(0, cx - pw / 2), W - pw) / W, y = Math.min(Math.max(0, cy - ph / 2), H - ph) / H;
    art[`s-${k}`] = { barnes: id, w: W, h: H, title, artist, crop: [+x.toFixed(3), +y.toFixed(3), +(pw / W).toFixed(3), +(ph / H).toFixed(3)], edge: 'bottom', ink: '#ffffff', tagInk: '#ffffff' };
  }
  const WOMEN = new Set(['May Preston', 'Melanie Marc', 'Mary Cassatt', 'Acoma Mary', 'Rosalia Toribio', 'Mary Liel', 'Edith Dimock', 'Nancy Burkholder', 'Susan Cray', 'Violette de Mazia']);
  const opt = (k, key, lines, o) => { const a = art[`s-${key}`]; return v(k, `${WOMEN.has(a.artist) ? 'By a woman: ' : 'From your desktop: '}${a.title}, ${a.artist}`, `s-${key}`, ['pref'], lines, o); };
  const L = {
    vxp: VXP, focus: [F('Barnes'), F('Focus')], calder: [F('Calder'), F('Gardens')], mem: [F('Membership')], com: [F('Commerce')], dz: [F('Deep'), F('Zoom')], oc: [F('Online'), F('Collection')], tours: [F('Tours and'), F('Eye Spy')],
    ovor: [C('ONE VISITOR,'), C('ONE RECORD')], sc: SC, ocb: [F('One Codebase,'), F('Two Brands')], cl: [F('Designing and'), F('Building a'), F('Platform for'), F('Close Looking')], dp: [F('Digital Product'), F('as Institutional'), F('Practice at the'), F('Barnes Foundation')],
  };
  // Extra crops: a center point and a height, as fractions of the whole painting.
  const crop2 = (name, base, cx, cy, hf) => { const a = art[`s-${base}`], W = a.w, H = a.h; let ph = hf * H, pw = ph * 0.75; if (pw > W) { pw = W; ph = pw / 0.75; } const x = Math.min(Math.max(0, cx * W - pw / 2), W - pw) / W, y = Math.min(Math.max(0, cy * H - ph / 2), H - ph) / H; art[`s-${name}`] = { ...a, crop: [+x.toFixed(3), +y.toFixed(3), +(pw / W).toFixed(3), +(ph / H).toFixed(3)] }; };
  crop2('tulips2', 'tulips', 0.5, 0.75, 0.55); crop2('walk2', 'sundaywalk', 0.25, 0.5, 1); crop2('walk3', 'sundaywalk', 0.75, 0.5, 1);
  crop2('dej2', 'dejeuner', 0.5, 0.35, 0.6); crop2('dej3', 'dejeuner', 0.5, 0.7, 0.6); crop2('goldfish2', 'goldfish', 0.3, 0.6, 0.6);
  crop2('figs2', 'figs', 0.75, 0.5, 1); crop2('cassatt2', 'cassatt', 0.5, 0.35, 0.6); crop2('conf2', 'confidantes', 0.3, 0.5, 1); crop2('conf3', 'confidantes', 0.7, 0.5, 1);
  crop2('peaches2', 'peaches', 0.7, 0.5, 1); crop2('eggs2', 'eggs', 0.3, 0.5, 1);
  const pref = (k, key, lines, o, note = '') => { const a = art[`s-${key}`]; return v(k, `${WOMEN.has(a.artist) ? 'By a woman: ' : 'From your desktop: '}${a.title}, ${a.artist}${note}`, `s-${key}`, ['pref'], lines, o); };
  const ks = 'ABCDEFGHIJKLMN';
  const tours = [['goldfish'], ['goldfish2', ', another crop'], ['peaches2'], ['figs2'], ['tulips2', ', another crop'], ['walk2', ', left side'], ['walk3', ', right side'], ['cassatt'], ['eggs2']];
  const ovor = [['cassatt2', ', close crop'], ['conf2', ', left side'], ['conf3', ', right side'], ['dej2', ', top'], ['dej3', ', bottom'], ['figs'], ['eggs'], ['peaches'], ['fieldflowers']];
  const fin = (slug, title, label, key, hex, lines, o) => [slug, title, [v('A', label, key, [`fix:${hex}`], lines, o)]];
  const pick = (slug, title, key, lines) => [slug, title, [v('A', 'Franklin in the color that reads best', key, ['pref'], lines), v('B', 'Franklin in white or black', key, ['mono'], lines)]];
  const ROWS = [
    pick('double-bass', 'Double Bass', 'bassist', [F('Double'), F('Bass')]),
    pick('playlists', 'Listening', 'feminine', [F('Listening')]),
    pick('reading', 'Reading', 'magdalen', [F('Reading')]),
  ];
  const workMat = Object.fromEntries(work.map((w) => [w.slug, w.mat]));
  const cv = (slug, x) => {
    const a = x.art && art[x.art];
    const texts = x.lines.map(([f, t, g]) => { const [fam, wt, st, ls, sc] = FONT[f]; return `<text class="h" data-g="${g}" data-s="${sc}" font-family="${fam}" font-weight="${wt}" font-stretch="${st}" letter-spacing="${ls}">${esc(t)}</text>`; }).join('');
    return `<button class="pick" type="button" data-card="${slug}" data-opt="${x.k}" aria-pressed="false"><span class="mat" style="--mat:${workMat[slug] || '#c8d6ec'}"><span class="cover ${a ? 'has-art' : 'flat'}" style="--flat:#f6d44f" data-id="${slug}:${x.k}" data-modes="${x.modes.join(',')}" data-mat="${workMat[slug] || '#c8d6ec'}">${a ? cropEl(x.art, '') : ''}<span class="drawn"><svg viewBox="0 0 300 400" fill="#ffffff" data-max="${x.max}" data-lh="${x.lh}" aria-hidden="true">${texts}</svg></span></span></span><span class="plabel">${x.k}. ${esc(x.label)}</span><span class="score"></span></button>`;
  };
  const F2 = 'https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@800&family=Archivo:wdth,wght@62..100,800&family=Pinyon+Script&display=swap';
  const body = `<div class="page study"><h1>Side B covers</h1><p>Double Bass, Listening and Reading in Libre Franklin.</p>${ROWS.map(([slug, title, vs]) => `<section class="srow"><h2>${esc(title)}</h2><div class="opts">${vs.map((x) => cv(slug, x)).join('')}</div></section>`).join('')}<div class="pickbar"><p id="picks">No picks yet.</p><button id="copy" type="button">Copy my picks</button></div></div>
<link rel="stylesheet" href="${F2.replace(/&/g, '&amp;')}">
<style>.study h1{margin-bottom:.3em}.study>p{max-width:62ch}.srow{margin:2.5rem 0}.srow h2{font-size:1.1rem;margin:0 0 .8rem}.opts{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px}
@media (max-width:700px){.opts{grid-auto-flow:column;grid-template-columns:none;grid-auto-columns:78%;overflow-x:auto;scroll-snap-type:x mandatory}.pick{scroll-snap-align:start}}
.pick{display:block;text-align:left;border:0;background:none;padding:6px;font:inherit;cursor:pointer;border-radius:2px;outline-offset:2px}.pick[aria-pressed=true]{outline:4px solid #16246e}.pick[hidden]{display:none}.pick .mat{display:block}.pick .cover{display:block}.plabel{display:block;margin-top:.5rem;font-size:.9rem}.score{display:block;font-size:.8rem;color:#555}
.pickbar{position:sticky;bottom:0;background:#fff;border-top:2px solid #16246e;padding:.7rem 0;display:flex;gap:1rem;align-items:center;justify-content:space-between}.pickbar p{margin:0;font-size:.9rem}#copy{font:inherit;border:2px solid #16246e;background:#fff;color:#16246e;padding:.4rem .8rem;cursor:pointer}</style>
<script src="/study.js?v=${V}" defer></script>`;
  writeFileSync('build/study.html', shell({ path: '/study', title: 'Cover study', description: 'Cover study', body }).replace('<head>', '<head><meta name="robots" content="noindex">'));
}
console.log(`Built ${Object.keys(pages).length} pages`);
