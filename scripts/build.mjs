// Builds the site into build/. Plain Node, no dependencies.
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync } from 'node:fs';
import { dirname } from 'node:path';
import { contrast } from './contrast.mjs';

const read = (f) => JSON.parse(readFileSync(`content/${f}.json`, 'utf8'));
const type = read('type'), wall = read('wall'), listening = read('listening'), reading = read('reading');
const work = read('work'), music = read('music'), playlists = read('playlists'), art = read('art');
const feed = read('notes.feed'), seed = read('notes');
const notes = [...feed, ...seed.filter((s) => !feed.some((f) => f.url === s.url))].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

const SITE = 'https://livsteinmetz.web.app', EMAIL = 'olivia@example.com';
const FONTS = 'https://fonts.googleapis.com/css2?family=Anton&family=Archivo:wght@700&family=Bodoni+Moda:opsz,wght@6..96,500&family=Fraunces:opsz,wght@144,500&family=Instrument+Serif:ital@1&family=Jost:wght@700&family=Marcellus&family=Pirata+One&family=Schibsted+Grotesk:wght@400;500&display=swap';
const UPDATED = new Date().toLocaleDateString('en-US', { timeZone: 'America/New_York', month: 'long', day: 'numeric', year: 'numeric' });
const V = Date.now().toString(36);
const STATEMENT = "I lead digital product, experience, and strategy for cultural institutions, designing and building at the intersection of culture and tech. Also a double bassist.";
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fmt = (d) => new Date(d + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

// The covers on Side B rotate through the paintings; a daily build moves them along.
const day = Math.floor(Date.now() / 864e5);
const pool = ['beatrice', 'sailor', 'annunciation', 'flower'];
const rotating = (i) => pool[(day + i) % pool.length];

const noteStyles = [['soft', '#efb4f7', 'center'], ['compressed', '#d9534a', 'left'], ['didone', '#66c4ff', 'left'], ['geo', '#efa090', 'center']];
const side = {
  a: work.map((w) => ({ ...w, href: `/work/${w.slug}` })),
  b: [
    ...notes.map((n, i) => ({ slug: n.slug || `note-${i}`, title: n.title, tag: 'a field note', date: n.date ? fmt(n.date) : 'Note', art: rotating(i), font: noteStyles[i % 4][0], mat: noteStyles[i % 4][1], align: noteStyles[i % 4][2], long: true, lines: [n.title], href: n.html ? `/notes/${n.slug}` : n.url })),
    { slug: 'double-bass', title: 'Double Bass', tag: 'since 2015', date: 'Available', art: 'shepherd', font: 'grotesk', mat: '#d9534a', align: 'spread', lines: ['DOU BLE', 'BA SS'], href: '/bass' },
    { slug: 'playlists', title: 'Playlists', tag: 'on my stand lately', date: 'Spotify', font: 'gothic', mat: '#fff27a', align: 'center', width: .7, lines: ['Playlists'], color: '#000000', flat: '#ffb3d9', href: '/playlists' },
  ],
};
const covers = [...side.a, ...side.b];

// Flat covers are checked here. Covers on paintings are measured from real pixels in .ci/shots.mjs.
for (const c of covers.filter((x) => x.flat)) if (contrast(c.color, c.flat) < 3) throw new Error(`Contrast on "${c.title}"`);

function cropEl(key, alt) {
  const a = art[key];
  return `<div class="crop" role="img" aria-label="${esc(alt)}" data-barnes="${a.barnes}" data-w="${a.w}" data-h="${a.h}" data-crop="${a.crop}"></div>`;
}
function cover(c0, tag = 'a') {
  const a = c0.art && art[c0.art];
  const c = a ? { ...c0, edge: a.edge, color: a.ink, tagColor: a.tagInk } : { edge: 'top', ...c0 };
  const alt = a ? `Close crop of ${a.title} by ${a.artist}` : '';
  const below = c.edge === 'bottom';
  const heading = `<h3 class="ctitle f-${c.font} a-${c.align || 'left'}${c.long ? ' long' : ''}" style="color:${c.color}"${c.width ? ` data-width="${c.width}"` : ''}>${c.lines.map((t) => `<span class="ln">${c.align === 'spread' ? esc(t).replace(' ', '<i></i>') : esc(t)}</span>`).join('')}</h3>`;
  const tagline = `<p class="ctag a-${c.align === 'spread' ? 'left' : c.align || 'left'}" style="color:${c.tagColor || '#000'}">${esc(c.tag)}</p>`;
  const t = type[c.slug] || (c.slug.startsWith('one-codebase') && type['one-codebase']);
  const spray = t?.spray ? '<path d="M90 0H288V42C276 50 274 76 266 76C258 76 260 44 248 44C238 44 240 88 230 88C220 88 222 40 208 40C192 40 170 22 90 0Z" fill="#d44cf0"/>' : '';
  const drawn = t && `<h3 class="drawn"><svg viewBox="0 0 288 420" fill="${t.fill}" role="img" aria-label="${esc(c.title)}">${spray}${t.t.map(([text, x, y, w, size, font, weight, adjust = 'spacingAndGlyphs']) => `<text x="${x}" y="${y}" textLength="${w}" lengthAdjust="${adjust}" font-family="${font}" font-weight="${weight}" font-size="${size}">${text}</text>`).join('')}</svg></h3>`;
  const body = drawn ? `<figure role="group" aria-label="media">${a ? cropEl(c.art, alt) : ''}<figcaption>${drawn}</figcaption></figure>` : `<figure role="group" aria-label="media">${a ? cropEl(c.art, alt) : ''}<figcaption><div class="words ${c.edge}">${heading}${below ? tagline : ''}</div>${below ? '' : `<div class="${a ? 'tag-strip' : 'tag-bottom'}">${tagline}</div>`}</figcaption></figure>`;
  const attrs = `class="cover ${a ? 'has-art' : 'flat'}" style="${c.flat ? `--flat:${c.flat};` : ''}view-transition-name:cover-${c.slug}"`;
  return tag === 'a' ? `<a href="${c.href}" ${attrs}>${body}</a>` : `<div ${attrs} data-slug="${c.slug}">${body}</div>`;
}

const jsonLd = (o) => `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', ...o }).replace(/</g, '\\u003c')}</script>`;
const PERSON = { '@type': 'Person', '@id': `${SITE}/#person`, name: 'Olivia Steinmetz', url: SITE, jobTitle: 'Product Manager, Digital Initiatives', worksFor: { '@type': 'Organization', name: 'Barnes Foundation', url: 'https://www.barnesfoundation.org/' }, sameAs: ['https://www.linkedin.com/in/livsteinmetz/', 'https://github.com/livsteinmetz', 'https://medium.com/@osteinmetz'] };

function shell({ path, title, description, body, canonical, ld = [], type = 'website', meta = '' }) {
  const full = title ? `${title} | Olivia Steinmetz` : 'Olivia Steinmetz | Digital product, experience, and strategy';
  const nav = [['/#side-a', 'Side A'], ['/#side-b', 'Side B'], ['/about', 'About']].map(([h, t]) => `<a href="${h}"${path === h ? ' aria-current="page"' : ''}>${t}</a>`).join('');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(full)}</title><meta name="description" content="${esc(description)}"><meta name="theme-color" content="#fff27a">
${[PERSON, ...ld].map(jsonLd).join('')}<link rel="canonical" href="${canonical || SITE + path}"><link rel="icon" href="/favicon.svg" type="image/svg+xml">
<meta property="og:title" content="${esc(full)}"><meta property="og:description" content="${esc(description)}"><meta property="og:type" content="${type}">${meta}<meta property="og:url" content="${SITE}${path}"><meta property="og:image" content="${SITE}/media/og.jpg"><meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="${FONTS.replace(/&/g, '&amp;')}"><link rel="stylesheet" href="/styles.css?v=${V}">
<script async src="https://www.googletagmanager.com/gtag/js?id=G-WZM6YLSHQY"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-WZM6YLSHQY');</script>
</head><body><a class="skip" href="#site-content">Skip to content</a>
<header class="masthead"><a class="mark" href="/">Olivia Steinmetz</a><nav aria-label="Main">${nav}</nav></header>
<div class="vinyl" aria-hidden="true"><i></i></div><main id="site-content">${body}</main>
<footer class="credit"><p><a href="mailto:${EMAIL}">Email</a><a href="https://www.linkedin.com/in/livsteinmetz/">LinkedIn</a><a href="https://github.com/livsteinmetz">GitHub</a><a href="https://medium.com/@osteinmetz">Medium</a></p>
<p style="margin-top:8px">Paintings courtesy of the Barnes Foundation, Merion and Philadelphia, Pennsylvania, and the Cleveland Museum of Art. All public domain, served over <a href="/colophon" style="margin:0">IIIF</a>. Opinions are my own. This site rebuilds itself every morning from Medium, Spotify, and open museum collections. Last updated ${UPDATED}.</p></footer>
<script type="module" src="/art.js?v=${V}"></script></body></html>`;
}

const isMusic = (c) => ['double-bass', 'playlists'].includes(c.slug);
const shelf = (items, label, id) => `<section class="side" id="${id}" aria-labelledby="${id}-title"><h2 id="${id}-title">${label}</h2><ol class="shelf">${items.map((c) => `<li class="mat" style="--mat:${c.mat}">${cover(c)}</li>`).join('')}</ol></section>`;
const wallShelf = wall.length ? `<section class="side" id="on-the-wall" aria-labelledby="on-the-wall-title"><h2 id="on-the-wall-title">Looking</h2><ol class="shelf">${wall.map((w, i) => `<li><a class="hang" href="${w.url}"><figure role="group" aria-label="media"><div class="still"><img src="${w.web}" alt="${esc(w.title)} by ${esc(w.artist)}" loading="lazy" decoding="async" width="${w.w}" height="${w.h}" style="object-position:${[50, 30, 70, 40][i % 4]}% ${[35, 60, 45, 25][i % 4]}%"></div><figcaption class="cap"><i>${esc(w.title)}</i>, ${esc(w.artist)}</figcaption></figure></a></li>`).join('')}</ol></section>` : '';
const pages = {};
const listeningShelf = listening.length ? `<section class="side" id="listening" aria-labelledby="listening-title"><h2 id="listening-title">Listening</h2><ol class="shelf">${listening.map((t) => `<li><a class="hang" href="${t.url}"><figure role="group" aria-label="media"><div class="still sleeve"><img src="${t.image}" alt="" loading="lazy" decoding="async" width="300" height="300"></div><figcaption class="cap"><i>${esc(t.title)}</i>, ${esc(t.artist)}</figcaption></figure></a></li>`).join('')}</ol></section>` : '';

const readingShelf = reading.length ? `<section class="side" id="reading" aria-labelledby="reading-title"><h2 id="reading-title">Reading</h2><ol class="shelf">${reading.map((b) => `<li><a class="hang" href="${b.url}"><figure role="group" aria-label="media"><div class="still jacket"><img src="${b.cover}" alt="" loading="lazy" decoding="async"></div><figcaption class="cap"><i>${esc(b.title)}</i>, ${esc(b.author)}</figcaption></figure></a></li>`).join('')}</ol></section>` : '';

pages['index.html'] = shell({ path: '/', description: STATEMENT, body: `<article id="story"><header><h1 class="statement">${STATEMENT}</h1></header>${shelf(side.a, 'Side A, the work', 'side-a')}${shelf(side.b.filter((c) => !isMusic(c)), 'Writing', 'side-b')}${listeningShelf}${readingShelf}${wallShelf}${shelf(side.b.filter(isMusic), 'Playing', 'playing')}</article>` });

function record(current, sideKey) {
  const list = side[sideKey];
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
    body: `${record({ ...w, href: `/work/${w.slug}` }, 'a')}<article class="detail" id="story"><header><h1>${esc(w.short)}</h1></header><section name="articleBody" class="prose">${w.body.map((p) => `<p>${esc(p)}</p>`).join('')}${w.note ? `<p>I wrote more in <a href="${w.note.url}">${esc(w.note.title)}</a>.</p>` : ''}${w.link ? `<p><a href="${w.link}">${esc(w.linkText)}</a></p>` : ''}</section><dl class="meta"><dt>For</dt><dd>${esc(w.org)}</dd><dt>When</dt><dd>${esc(w.date)}</dd><dt>My part</dt><dd>${esc(w.role)}</dd>${w.stack ? `<dt>Built with</dt><dd>${esc(w.stack)}</dd>` : ''}</dl>${shot}${gallery}</article>${viewer(w.art)}` });
});

const sideB = side.b;
feed.forEach((n) => {
  const cur = sideB.find((c) => c.slug === n.slug) || sideB[0];
  pages[`notes/${n.slug}.html`] = shell({ path: `/notes/${n.slug}`, title: n.title, description: n.excerpt, canonical: n.url, type: 'article', meta: `<meta property="article:published_time" content="${n.date}"><meta property="article:author" content="Olivia Steinmetz">`, ld: [{ '@type': 'Article', headline: n.title, datePublished: n.date, author: { '@id': `${SITE}/#person` }, url: n.url }],
    body: `${record(cur, 'b')}<article class="detail" id="story" style="grid-template-columns:1fr"><header><h1>${esc(n.title)}</h1></header><section name="articleBody" class="prose"><p><a href="${n.url}">First published on the Barnes Foundation's Medium</a>, ${fmt(n.date)}.</p>${n.html}</section></article>` });
});

const list = (a) => `<ul>${a.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
pages['bass.html'] = shell({ path: '/bass', title: 'Double bass', description: 'Olivia Steinmetz is a freelance double bassist around Philadelphia.',
  body: `${record(sideB.find((c) => c.slug === 'double-bass'), 'b')}<div class="page" style="padding-top:0"><p style="max-width:34em">I've freelanced since 2015 in orchestras, opera pits, and ballet pits around Philadelphia, Nashville, and Salt Lake City. I studied performance and engineering at the same time at Vanderbilt, and I've never been able to choose. Contractors, I'd love to hear from you.</p><a class="btn" href="mailto:${EMAIL}?subject=Bass%20gig">Email me about a gig</a><div class="cols"><section><h2>Ensembles</h2>${list(music.ensembles)}</section><section><h2>Teaching and coaching</h2>${list(music.teaching)}</section></div></div>` });
pages['playlists.html'] = shell({ path: '/playlists', title: 'Playlists', description: "What Olivia Steinmetz is listening to.",
  body: `${record(sideB.find((c) => c.slug === 'playlists'), 'b')}<div class="page" style="padding-top:0">${playlists.length ? `<div class="play">${playlists.map((p) => `<iframe title="${esc(p.title)}" loading="lazy" allow="encrypted-media" src="https://open.spotify.com/embed/playlist/${esc(p.id)}"></iframe>`).join('')}</div>` : `<p>Playlists are on the way.</p>`}</div>` });

pages['about.html'] = shell({ path: '/about', title: 'About', description: STATEMENT, body: `<div class="page"><div class="prose"><h1>About</h1>
<p>I'm Liv. I lead digital product across the Barnes Foundation, Calder Gardens, and the Pew Center for Arts &amp; Heritage, working from Philadelphia. My title is Product Manager, Digital Initiatives. In practice I write the roadmap and then help design and build it, which covers ticketing, membership, giving, and the teaching tools behind Barnes classes.</p>
<p>I co-own our FY27 to FY29 technology plan with our CTO, and I run a biweekly AI practitioner group with champions from across the organization.</p>
<p>I got here sideways. I studied engineering and double bass at Vanderbilt, worked on emerging tech at Accenture, learned full-stack engineering at Capital One, and joined the Barnes in 2021 as a front-end engineer. Later I earned an MSc in Information Technology and Learning at the University of Gothenburg, focused on human-computer interaction and how people learn to see in digital spaces.</p>
<p>Orchestra taught me most of what I know about product work. You listen more than you play, you hold the group together from the back, and you show up prepared because everybody else is counting on you.</p>
<h2>Talks</h2><ul><li>Museum Computer Network 2026, digital strategic planning</li><li>American Alliance of Museums 2026, the Calder Gardens digital launch</li><li>Museum Computer Network 2023, the Visual Experience Platform</li><li>American Alliance of Museums 2023, the Visual Experience Platform</li></ul>
<h2>Say hello</h2><p>I'm happy to talk with anyone working on museum technology, or anyone who needs a bassist. <a href="mailto:${EMAIL}">${EMAIL}</a></p></div></div>` });
pages['colophon.html'] = shell({ path: '/colophon', title: 'Colophon', description: 'How the paintings on this site are served.', body: `<div class="page"><div class="prose"><h1>Colophon</h1><p>Every painting here is public domain. The covers are assembled in your browser from IIIF image tiles, the same standard behind the Barnes online collection and the Visual Experience Platform. Each work has a IIIF manifest, so you can open it in any IIIF viewer.</p><ul>${Object.entries(art).map(([k, a]) => `<li><a href="/iiif/${k}.json">${esc(a.title)}</a>, ${esc(a.artist)} (${esc(a.rights)})</li>`).join('')}</ul></div></div>` });
pages['404.html'] = shell({ path: '/404', title: 'Page not found', description: 'This page has moved.', body: `<div class="page"><h1>That track isn't on this record.</h1><p><a href="/">Go to the home page</a></p></div>` });

rmSync('build', { recursive: true, force: true }); mkdirSync('build/iiif', { recursive: true });
cpSync('site', 'build', { recursive: true });
for (const [f, html] of Object.entries(pages)) { mkdirSync(dirname(`build/${f}`), { recursive: true }); writeFileSync(`build/${f}`, html); }

// IIIF Presentation 3 manifests, one per painting.
for (const [k, a] of Object.entries(art)) {
  const id = `${SITE}/iiif/${k}.json`;
  const service = a.barnes ? [{ '@id': `https://d2r83x5xt28klo.cloudfront.net/tiles/${a.barnes}`, '@type': 'ImageService2', profile: 'level1' }] : undefined;
  const body = { id: a.barnes ? `https://d2r83x5xt28klo.cloudfront.net/tiles/${a.barnes}/0,0,1024,1024/256,/0/color.jpg` : a.image, type: 'Image', format: 'image/jpeg', width: a.w, height: a.h, ...(service && { service }) };
  writeFileSync(`build/iiif/${k}.json`, JSON.stringify({ '@context': 'http://iiif.io/api/presentation/3/context.json', id, type: 'Manifest', label: { en: [a.title] }, summary: { en: [a.artist] }, requiredStatement: { label: { en: ['Credit'] }, value: { en: [a.barnes ? 'Courtesy of the Barnes Foundation, Merion and Philadelphia, Pennsylvania' : a.rights] } }, rights: 'https://creativecommons.org/publicdomain/mark/1.0/', items: [{ id: `${id}/canvas`, type: 'Canvas', width: a.w, height: a.h, items: [{ id: `${id}/page`, type: 'AnnotationPage', items: [{ id: `${id}/anno`, type: 'Annotation', motivation: 'painting', target: `${id}/canvas`, body }] }] }] }, null, 1));
}
wall.forEach((a) => { const id = `${SITE}/iiif/wall-${a.id}.json`; writeFileSync(`build/iiif/wall-${a.id}.json`, JSON.stringify({ '@context': 'http://iiif.io/api/presentation/3/context.json', id, type: 'Manifest', label: { en: [a.title] }, summary: { en: [a.artist] }, requiredStatement: { label: { en: ['Credit'] }, value: { en: ['Cleveland Museum of Art, CC0'] } }, rights: 'https://creativecommons.org/publicdomain/zero/1.0/', items: [{ id: `${id}/canvas`, type: 'Canvas', width: a.w, height: a.h, items: [{ id: `${id}/page`, type: 'AnnotationPage', items: [{ id: `${id}/anno`, type: 'Annotation', motivation: 'painting', target: `${id}/canvas`, body: { id: a.print, type: 'Image', format: 'image/jpeg' } }] }] }] }, null, 1)); });
const urls = Object.keys(pages).filter((f) => f !== '404.html').map((f) => `${SITE}/${f.replace(/(index)?\.html$/, '')}`);
writeFileSync('build/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((u) => `<url><loc>${u}</loc></url>`).join('')}</urlset>`);
writeFileSync('build/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
console.log(`Built ${Object.keys(pages).length} pages`);
