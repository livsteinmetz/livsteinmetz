// Builds the site into build/. Plain Node, no dependencies.
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync } from 'node:fs';
import { dirname } from 'node:path';
import { contrast } from './contrast.mjs';

const read = (f) => JSON.parse(readFileSync(`content/${f}.json`, 'utf8'));
const settings = read('settings'), type = read('type'), wall = read('wall'), trends = read('trends'), reading = read('reading');
const work = read('work'), music = read('music'), myPlaylists = read('my-playlists'), playlists = [...read('playlists'), ...settings.playlists.map((p) => myPlaylists.find((m) => m.id === (p.id || p))).filter(Boolean)], art = read('art');
const feed = read('notes.feed'), seed = read('notes');
const notes = [...feed, ...seed.filter((s) => !feed.some((f) => f.url === s.url))].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

const SITE = 'https://livsteinmetz.web.app', EMAIL = 'olivia@example.com';
const FONTS = 'https://fonts.googleapis.com/css2?family=Anton&family=Archivo:wght@700&family=Bodoni+Moda:opsz,wght@6..96,500&family=Fraunces:opsz,wght@144,500&family=Instrument+Serif:ital@1&family=Jost:wght@700&family=Marcellus&family=Pirata+One&family=Schibsted+Grotesk:wght@400;500&display=swap';
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
    { slug: 'playlists', title: 'Listening', tag: 'on repeat lately', date: 'Spotify', font: 'gothic', mat: '#fff27a', align: 'center', width: .7, lines: ['Listening'], color: '#000000', flat: '#ffb3d9', href: '/listening' },
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
  const drawn = t && `<h3 class="drawn"><svg viewBox="0 0 288 420" fill="${t.fill}" role="img" aria-label="${esc(c.title)}">${t.t.map(([text, x, y, w, size, font, weight, adjust = 'spacingAndGlyphs']) => `<text x="${x}" y="${y}" textLength="${w}" lengthAdjust="${adjust}" font-family="${font}" font-weight="${weight}" font-size="${size}">${text}</text>`).join('')}</svg></h3>`;
  const body = drawn ? `<figure role="group" aria-label="media">${a ? cropEl(c.art, alt) : ''}<figcaption>${drawn}</figcaption></figure>` : `<figure role="group" aria-label="media">${a ? cropEl(c.art, alt) : ''}<figcaption><div class="words ${c.edge}">${heading}${below ? tagline : ''}</div>${below ? '' : `<div class="${a ? 'tag-strip' : 'tag-bottom'}">${tagline}</div>`}</figcaption></figure>`;
  const attrs = `class="cover ${a ? 'has-art' : 'flat'}" style="${c.flat ? `--flat:${c.flat};` : ''}view-transition-name:cover-${c.slug}"`;
  return tag === 'a' ? `<a href="${c.href}" ${attrs}>${body}</a>` : `<div ${attrs} data-slug="${c.slug}">${body}</div>`;
}

const jsonLd = (o) => `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', ...o }).replace(/</g, '\\u003c')}</script>`;
const PERSON = { '@type': 'Person', '@id': `${SITE}/#person`, name: 'Olivia Steinmetz', url: SITE, jobTitle: 'Product Manager, Digital Initiatives', worksFor: { '@type': 'Organization', name: 'Barnes Foundation', url: 'https://www.barnesfoundation.org/' }, sameAs: ['https://www.linkedin.com/in/livsteinmetz/', 'https://github.com/livsteinmetz', 'https://medium.com/@osteinmetz'] };

function shell({ path, title, description, body, canonical, ld = [], type = 'website', meta = '' }) {
  const full = title ? `${title} | Olivia Steinmetz` : 'Olivia Steinmetz | Digital product, experience, and strategy';
  const nav = [['/#working', 'Work'], ['/#writing', 'Writing'], ['/about', 'About']].map(([h, t]) => `<a href="${h}"${path === h ? ' aria-current="page"' : ''}>${t}</a>`).join('');
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
<p style="margin-top:8px">Paintings courtesy of the Barnes Foundation, Merion and Philadelphia, Pennsylvania, and open access museum collections. All public domain, served over <a href="/colophon" style="margin:0">IIIF</a>. Opinions are my own.</p></footer>
<script type="module" src="/art.js?v=${V}"></script></body></html>`;
}

const shown = (key) => !settings.hidden.includes(key);
const isMusic = (c) => ['double-bass', 'playlists'].includes(c.slug);
const shelf = (items, label, id) => `<section class="side" id="${id}" aria-labelledby="${id}-title"><h2 id="${id}-title">${label}</h2><ol class="shelf">${items.filter((c) => shown(`${id}:${c.slug}`)).map((c) => `<li class="mat" data-item="${id}:${c.slug}" style="--mat:${c.mat}">${cover(c)}</li>`).join('')}</ol></section>`;
const wallShelf = wall.length ? `<section class="side" id="on-the-wall" aria-labelledby="on-the-wall-title"><h2 id="on-the-wall-title">Looking</h2><ol class="shelf">${wall.filter((w) => shown(`looking:${w.id}`)).map((w, i) => `<li data-item="looking:${w.id}"><a class="hang look" href="${w.web}" data-caption="${esc(w.title)}, ${esc(w.artist)}. ${esc(w.museum)}"><figure role="group" aria-label="media"><div class="still"><img src="${w.web}" alt="${esc(w.title)} by ${esc(w.artist)}" loading="lazy" decoding="async" width="${w.w}" height="${w.h}" style="object-position:${[50, 30, 70, 40][i % 4]}% ${[35, 60, 45, 25][i % 4]}%"></div><figcaption class="cap"><i>${esc(w.title)}</i>, ${esc(w.artist)}<br>${esc(w.museum)}</figcaption></figure></a></li>`).join('')}</ol><dialog class="lookbox"><img alt=""><p></p></dialog></section>` : '';
const pages = {};
const trendsCard = trends.windows.length ? `<li><a class="hang" href="/listening/trends"><figure role="group" aria-label="media"><div class="still sleeve trends-card"><span>Trends</span></div><figcaption class="cap">What I've had on lately</figcaption></figure></a></li>` : '';
const listeningShelf = playlists.length || trendsCard ? `<section class="side" id="listening" aria-labelledby="listening-title"><h2 id="listening-title">Listening</h2><ol class="shelf">${trendsCard}${playlists.map((p) => `<li data-item="listening:${p.id}"><a class="hang" href="/listening#${p.id}"><figure role="group" aria-label="media"><div class="still sleeve"><img src="${p.cover || p.image}" alt="" loading="lazy" decoding="async" width="300" height="300"></div><figcaption class="cap">${esc(p.title)}</figcaption></figure></a></li>`).join('')}</ol></section>` : '';

const readingShelf = reading.length ? `<section class="side" id="reading" aria-labelledby="reading-title"><h2 id="reading-title">Reading</h2><ol class="shelf">${reading.filter((b) => shown(`reading:${b.url}`)).map((b) => `<li data-item="reading:${b.url}"><a class="hang" href="${b.url}"><figure role="group" aria-label="media"><div class="still jacket"><img src="${b.cover}" alt="" loading="lazy" decoding="async"></div><figcaption class="cap"><i>${esc(b.title)}</i>${b.author ? `, ${esc(b.author)}` : ''}</figcaption></figure></a></li>`).join('')}</ol></section>` : '';

pages['index.html'] = shell({ path: '/', description: STATEMENT, body: `<article id="story"><header><h1 class="statement">${STATEMENT}</h1></header>${shelf(side.a, 'Working', 'working')}${shelf(side.b.filter((c) => !isMusic(c)), 'Writing', 'writing')}${readingShelf}${wallShelf}${listeningShelf}${shelf(side.b.filter((c) => c.slug === 'double-bass'), 'Playing', 'playing')}</article>` });

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
pages['listening.html'] = shell({ path: '/listening', title: 'Listening', description: "What Olivia Steinmetz is listening to.",
  body: `${record(sideB.find((c) => c.slug === 'playlists'), 'b')}<div class="page" style="padding-top:0">${trends.windows.length ? '<p><a href="/listening/trends">See my listening trends</a></p>' : ''}${playlists.length ? `<div class="play">${playlists.map((p) => `<iframe id="${esc(p.id)}" title="${esc(p.title)}" loading="lazy" allow="encrypted-media" src="https://open.spotify.com/embed/playlist/${esc(p.id)}"></iframe>`).join('')}</div>` : ''}</div>` });

const slope = () => {
  const W = trends.windows, x = (i) => 170 + i * 280, y = (r) => 40 + r * 34;
  const names = [...new Set(W.flatMap((w) => w.artists))];
  const lines = names.map((n) => {
    const pts = W.map((w, i) => [i, w.artists.indexOf(n)]).filter(([, r]) => r >= 0);
    return pts.length > 1 ? `<polyline fill="none" stroke="#16246e" stroke-width="${pts.length === W.length ? 2.5 : 1}" points="${pts.map(([i, r]) => `${x(i)},${y(r)}`).join(' ')}"/>` : '';
  }).join('');
  const labels = W.map((w, i) => `<text x="${x(i)}" y="18" text-anchor="middle" font-weight="500">${esc(w.label)}</text>${w.artists.map((n, r) => `<text x="${x(i) + (i === 2 ? 8 : i === 0 ? -8 : 0)}" y="${y(r) - (i === 1 ? 6 : -5)}" text-anchor="${i === 0 ? 'end' : i === 2 ? 'start' : 'middle'}" font-size="14">${esc(n)}</text>`).join('')}`).join('');
  return `<figure role="group" aria-label="media"><div class="scroll"><svg viewBox="0 0 900 400" role="img" aria-label="My top artists across three time ranges">${lines}${labels}</svg></div><figcaption>Thicker lines stayed in my top ten across all three ranges.</figcaption></figure>`;
};
pages['listening/trends.html'] = shell({ path: '/listening/trends', title: 'Listening trends', description: "Olivia Steinmetz's top artists over time.",
  body: `<article class="detail" id="story" style="grid-template-columns:1fr"><header><h1>Listening trends</h1></header><section name="articleBody" class="prose trends">${trends.windows.length ? slope() : ''}</section></article>` });

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
wall.forEach((a) => { const id = `${SITE}/iiif/wall-${a.id}.json`; writeFileSync(`build/iiif/wall-${a.id}.json`, JSON.stringify({ '@context': 'http://iiif.io/api/presentation/3/context.json', id, type: 'Manifest', label: { en: [a.title] }, summary: { en: [a.artist] }, requiredStatement: { label: { en: ['Credit'] }, value: { en: ['${a.museum}, CC0'] } }, rights: 'https://creativecommons.org/publicdomain/zero/1.0/', items: [{ id: `${id}/canvas`, type: 'Canvas', width: a.w, height: a.h, items: [{ id: `${id}/page`, type: 'AnnotationPage', items: [{ id: `${id}/anno`, type: 'Annotation', motivation: 'painting', target: `${id}/canvas`, body: { id: a.print, type: 'Image', format: 'image/jpeg' } }] }] }] }, null, 1)); });
const urls = Object.keys(pages).filter((f) => f !== '404.html').map((f) => `${SITE}/${f.replace(/(index)?\.html$/, '')}`);
writeFileSync('build/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((u) => `<url><loc>${u}</loc></url>`).join('')}</urlset>`);

// Admin lives outside the sitemap and asks search engines to skip it.
const adminItems = [
  { name: 'Working', items: side.a.map((c) => ({ key: `working:${c.slug}`, label: c.title })) },
  { name: 'Writing', items: side.b.filter((c) => !isMusic(c)).map((c) => ({ key: `writing:${c.slug}`, label: c.title })) },
  { name: 'Reading', items: reading.map((b) => ({ key: `reading:${b.url}`, label: `${b.title}, ${b.author}` })) },
  { name: 'Looking', items: wall.map((w) => ({ key: `looking:${w.id}`, label: `${w.title}, ${w.artist}` })) },
  { name: 'Playing', items: side.b.filter(isMusic).map((c) => ({ key: `playing:${c.slug}`, label: c.title })) },
];
writeFileSync('build/admin.html', `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow"><title>Admin</title><link rel="stylesheet" href="/styles.css?v=${V}"><style>.admin{max-width:720px;margin:0 auto;padding:32px var(--gutter)}.admin fieldset{border:0;border-top:1px solid #000;margin:24px 0;padding:12px 0}.admin legend{font-weight:500;padding-right:12px}.admin label{display:block;padding:4px 0}.admin .row{display:flex;gap:8px;margin:8px 0}.admin .pl{display:flex;align-items:center;gap:10px;padding:4px 0}.admin .pl img{width:36px;height:36px}.admin .pl span{flex:1;min-width:0}.admin input:not([type=checkbox]):not([type=radio]){flex:1;min-width:0;width:100%;font:inherit;padding:8px;border:1px solid #000}.admin button{font:inherit;padding:8px 14px;border:1px solid #000;background:#fff;cursor:pointer}</style></head><body><main class="admin"><h1>Admin</h1><div id="signed-out"><button id="in" type="button">Sign in with Google</button></div><div id="panel" hidden><div id="sections"></div><fieldset><legend>Your playlists</legend><p>Check the ones to show on your Playlists page. Pick one for the Listening shelf. Private playlists can't show on the site.</p><input id="filter" aria-label="Filter playlists" placeholder="Filter"><div id="playlists"></div></fieldset><p><button id="save" type="button">Save</button> <button id="out" type="button">Sign out</button></p></div><p id="status" role="status"></p></main><script id="items" type="application/json">${JSON.stringify(adminItems).replace(/</g, '\\u003c')}</script><script id="mine" type="application/json">${JSON.stringify(myPlaylists).replace(/</g, '\\u003c')}</script><script type="module" src="/admin.js?v=${V}"></script></body></html>`);
writeFileSync('build/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
console.log(`Built ${Object.keys(pages).length} pages`);
