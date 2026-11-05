// Builds the site into build/. Plain Node, no dependencies.
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync } from 'node:fs';
import { dirname } from 'node:path';
import { contrast, SCRIM } from './contrast.mjs';

const read = (f) => JSON.parse(readFileSync(`content/${f}.json`, 'utf8'));
const work = read('work'), music = read('music'), playlists = read('playlists'), art = read('art');
const feed = read('notes.feed'), seed = read('notes');
const notes = [...feed, ...seed.filter((s) => !feed.some((f) => f.url === s.url))].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

const SITE = 'https://livsteinmetz.web.app', EMAIL = 'olivia@example.com';
const FONTS = 'https://fonts.googleapis.com/css2?family=Anton&family=Big+Shoulders+Display:wght@800&family=Bodoni+Moda:opsz,wght@6..96,500&family=Grenze+Gotisch:wght@700&family=Instrument+Serif:ital@1&family=League+Spartan:wght@700&family=Schibsted+Grotesk:wght@400;500&display=swap';
const STATEMENT = "I lead digital product and experience strategy for cultural institutions. I design and build at the intersection of culture and tech, and I build for the long haul. Also a double bassist.";
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fmt = (d) => new Date(d + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

// The covers on Side B rotate through the paintings; a daily build moves them along.
const day = Math.floor(Date.now() / 864e5);
const pool = ['beatrice', 'sailor', 'ophelia', 'shepherd', 'jungle', 'postman'];
const rotating = (i) => pool[(day + i) % pool.length];

const side = {
  a: work.map((w) => ({ ...w, href: `/work/${w.slug}` })),
  b: [
    ...notes.slice(0, 4).map((n, i) => ({ slug: n.slug || `note-${i}`, title: n.title, tag: 'a field note', date: n.date ? fmt(n.date) : 'Note', art: rotating(i), font: ['bodoni', 'spartan'][i % 2], size: n.title.length > 32 ? '2.5' : '3.5', color: ['#ffffff', '#ffe36b'][i % 2], edge: 'top', href: n.html ? `/notes/${n.slug}` : n.url })),
    { slug: 'all-notes', title: 'All the notes', tag: 'opinions my own', date: `${notes.length} so far`, font: 'shoulders', size: '4.4', color: '#000000', flat: '#d8ff3d', href: '/notes' },
    { slug: 'double-bass', title: 'Double Bass', tag: 'since 2015', date: 'Available', art: 'ophelia', font: 'anton', size: '4.6', color: '#ffe36b', edge: 'top', href: '/bass' },
    { slug: 'playlists', title: 'Playlists', tag: 'on my stand lately', date: 'Spotify', font: 'gothic', size: '4.6', color: '#000000', flat: '#ffb3d9', href: '/playlists' },
  ],
};
const covers = [...side.a, ...side.b];

// Fails the build rather than publishing type that doesn't pass.
for (const c of covers) {
  const bg = c.flat || 'scrim';
  const r = contrast(c.color, bg === 'scrim' ? SCRIM : bg);
  if (r < 3) throw new Error(`Contrast ${r.toFixed(2)} on "${c.title}" cover title`);
  if (contrast(c.flat ? '#000000' : '#ffffff', bg === 'scrim' ? SCRIM : bg) < 4.5) throw new Error(`Contrast on "${c.title}" tag`);
}
console.log(`${covers.length} covers pass contrast`);

function cropEl(key) {
  const a = art[key];
  if (a.barnes) return `<span class="crop" data-barnes="${a.barnes}" data-w="${a.w}" data-h="${a.h}" data-crop="${a.crop}"></span>`;
  const [x, y, w, h] = a.crop;
  return `<span class="crop"><img src="${a.image}" alt="" loading="lazy" style="width:${100 / w}%;height:${100 / h}%;left:${-(x / w) * 100}%;top:${-(y / h) * 100}%"></span>`;
}
function cover(c, tag = 'a') {
  const a = c.art && art[c.art];
  const size = `font-size:${(c.size * 4.5).toFixed(1)}cqw;color:${c.color}`;
  const alt = a ? `Close crop of ${a.title} by ${a.artist}` : '';
  const inner = `${a ? cropEl(c.art) : ''}<span class="words ${c.edge || 'top'}"><span class="ctitle f-${c.font}" style="${size}">${esc(c.title)}</span></span><span class="${a ? 'tag-strip' : 'tag-bottom'}"><span class="ctag" style="color:${c.flat ? '#000' : '#fff'}">${esc(c.tag)}</span></span>`;
  const attrs = `class="cover ${a ? 'has-art' : 'flat'}" style="${c.flat ? `--flat:${c.flat};` : ''}view-transition-name:cover-${c.slug}"`;
  return tag === 'a' ? `<a href="${c.href}" ${attrs} aria-label="${esc(c.title)}${a ? `. ${esc(alt)}` : ''}">${inner}</a>` : `<span ${attrs} data-slug="${c.slug}" role="img" aria-label="${esc(c.title)}">${inner}</span>`;
}

function shell({ path, title, description, body, canonical, top = true }) {
  const full = title ? `${title} | Olivia Steinmetz` : 'Olivia Steinmetz | Digital product and experience strategy';
  const nav = [['/#side-a', 'Side A'], ['/#side-b', 'Side B'], ['/about', 'About']].map(([h, t]) => `<a href="${h}"${path === h ? ' aria-current="page"' : ''}>${t}</a>`).join('');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(full)}</title><meta name="description" content="${esc(description)}"><meta name="theme-color" content="#fff27a">
<link rel="canonical" href="${canonical || SITE + path}"><link rel="icon" href="/favicon.svg" type="image/svg+xml">
<meta property="og:title" content="${esc(full)}"><meta property="og:description" content="${esc(description)}"><meta property="og:type" content="website"><meta property="og:url" content="${SITE}${path}"><meta property="og:image" content="${SITE}/media/og.jpg"><meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="${FONTS.replace(/&/g, '&amp;')}"><link rel="stylesheet" href="/styles.css">
<script async src="https://www.googletagmanager.com/gtag/js?id=G-WZM6YLSHQY"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-WZM6YLSHQY');</script>
</head><body><a class="skip" href="#main">Skip to content</a>
<header class="top"><a class="mark" href="/">Olivia Steinmetz</a><nav aria-label="Main">${nav}</nav></header>
<main id="main">${body}</main>
<footer class="credit"><p><a href="mailto:${EMAIL}">Email</a><a href="https://www.linkedin.com/in/livsteinmetz/">LinkedIn</a><a href="https://github.com/livsteinmetz">GitHub</a><a href="https://medium.com/@osteinmetz">Medium</a></p>
<p style="margin-top:8px">Paintings courtesy of the Barnes Foundation, Merion and Philadelphia, Pennsylvania, except <i>Ophelia</i> (Tate, via Wikimedia Commons). All public domain, served over <a href="/colophon" style="margin:0">IIIF</a>. Opinions are my own.</p></footer>
<script type="module" src="/art.js"></script></body></html>`;
}

const shelf = (key, label, id) => `<section class="side ${key}" id="${id}"><h2>${label}</h2><div class="shelf">${side[key].map((c) => cover(c)).join('')}</div></section>`;
const pages = {};
pages['index.html'] = shell({ path: '/', description: STATEMENT, body: `<p class="statement">${STATEMENT}</p>${shelf('a', 'Side A, the work', 'side-a')}${shelf('b', 'Side B, the notes', 'side-b')}` });

function record(current, sideKey) {
  const list = side[sideKey];
  const tracks = list.map((c) => `<a class="track" data-track="${c.slug}" href="${c.href}"${c.slug === current.slug ? ' aria-current="page"' : ''}><span>${esc(c.title)}</span><small>${esc(c.date)}</small></a>`).join('');
  const other = sideKey === 'a' ? side.b[0] : side.a[0];
  const flip = `<div class="flip"><a href="${sideKey === 'a' ? current.href : side.a[0].href}"${sideKey === 'a' ? ' aria-current="true"' : ''}>Side A</a><a href="${sideKey === 'b' ? current.href : side.b[0].href}"${sideKey === 'b' ? ' aria-current="true"' : ''}>Side B</a></div>`;
  const stage = list.map((c) => cover(c, 'span').replace('class="cover', `${c.slug === current.slug ? '' : 'hidden '}class="cover`)).join('');
  return `<section class="record"><div class="tracks" data-tracks>${flip}${tracks}</div><div class="stage ${sideKey === 'b' ? 'notes-stage' : ''}" data-stage data-current="${current.slug}">${stage}</div></section>`;
}
const viewer = (key) => { const a = art[key]; return a?.barnes ? `<section class="closer"><p>Look closer: <i>${esc(a.title)}</i>, ${esc(a.artist)}. Drag and pinch to zoom. <a href="/iiif/${key}.json">IIIF manifest</a></p><div class="viewer" data-viewer="${a.barnes}" role="application" aria-label="Deep zoom viewer for ${esc(a.title)}"></div></section>` : ''; };

work.forEach((w) => {
  const shot = w.media ? `<div class="shot">${w.media.video ? `<video controls muted loop playsinline preload="none" poster="/media/${w.media.poster}.webp" aria-label="${esc(w.media.alt)}"><source src="/media/${w.media.video}.mp4" type="video/mp4"></video>` : `<img src="/media/${w.media.image}.webp" alt="${esc(w.media.alt)}" loading="lazy">`}</div>` : '';
  pages[`work/${w.slug}.html`] = shell({ path: `/work/${w.slug}`, title: w.title, description: `${w.short}. ${w.role} for ${w.org}.`,
    body: `${record({ ...w, href: `/work/${w.slug}` }, 'a')}<article class="detail"><h1>${esc(w.short)}</h1><div class="prose">${w.body.map((p) => `<p>${esc(p)}</p>`).join('')}${w.note ? `<p>I wrote more in <a href="${w.note.url}">${esc(w.note.title)}</a>.</p>` : ''}${w.link ? `<p><a href="${w.link}">${esc(w.linkText)}</a></p>` : ''}</div><dl class="meta"><dt>For</dt><dd>${esc(w.org)}</dd><dt>When</dt><dd>${esc(w.date)}</dd><dt>My part</dt><dd>${esc(w.role)}</dd>${w.stack ? `<dt>Built with</dt><dd>${esc(w.stack)}</dd>` : ''}</dl>${shot}</article>${viewer(w.art)}` });
});

const sideB = side.b;
pages['notes.html'] = shell({ path: '/notes', title: 'Notes for the field', description: 'Notes on museum digital product work, written in service to the field. Opinions are my own.',
  body: `${record(sideB.find((c) => c.slug === 'all-notes'), 'b')}<div class="page" style="padding-top:0"><p style="max-width:34em">I write down what we're learning at the Barnes so that other small museum teams can skip the hard way. Disagree, or working on the same problem? <a href="mailto:${EMAIL}">Tell me about it.</a></p><div class="cols" style="margin-top:24px"><ul>${notes.map((n) => `<li><a href="${n.html ? `/notes/${n.slug}` : n.url}">${esc(n.title)}</a>${n.date ? `, ${fmt(n.date)}` : ''}</li>`).join('')}</ul></div></div>` });
feed.forEach((n) => {
  const cur = sideB.find((c) => c.slug === n.slug) || sideB.find((c) => c.slug === 'all-notes');
  pages[`notes/${n.slug}.html`] = shell({ path: `/notes/${n.slug}`, title: n.title, description: n.excerpt, canonical: n.url,
    body: `${record(cur, 'b')}<article class="detail" style="grid-template-columns:1fr"><h1>${esc(n.title)}</h1><div class="prose"><p><a href="${n.url}">First published on the Barnes Foundation's Medium</a>, ${fmt(n.date)}.</p>${n.html}</div></article>` });
});

const list = (a) => `<ul>${a.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
pages['bass.html'] = shell({ path: '/bass', title: 'Double bass', description: 'Olivia Steinmetz is a freelance double bassist around Philadelphia.',
  body: `${record(sideB.find((c) => c.slug === 'double-bass'), 'b')}<div class="page" style="padding-top:0"><p style="max-width:34em">I've freelanced since 2015 in orchestras, opera pits, and ballet pits around Philadelphia, Nashville, and Salt Lake City. I studied performance and engineering at the same time at Vanderbilt, and I've never been able to choose. Contractors, I'd love to hear from you.</p><a class="btn" href="mailto:${EMAIL}?subject=Bass%20gig">Email me about a gig</a><div class="cols"><section><h2>Ensembles</h2>${list(music.ensembles)}</section><section><h2>Teaching and coaching</h2>${list(music.teaching)}</section><section><h2>Teachers</h2>${list(music.teachers)}</section></div></div>` });
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
const urls = Object.keys(pages).filter((f) => f !== '404.html').map((f) => `${SITE}/${f.replace(/(index)?\.html$/, '')}`);
writeFileSync('build/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((u) => `<url><loc>${u}</loc></url>`).join('')}</urlset>`);
writeFileSync('build/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
console.log(`Built ${Object.keys(pages).length} pages`);
