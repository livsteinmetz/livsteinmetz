// Builds the site into build/. Plain Node, no dependencies.
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync } from 'node:fs';
import { dirname } from 'node:path';

const read = (f) => JSON.parse(readFileSync(`content/${f}.json`, 'utf8'));
const work = read('work');
const music = read('music');
const playlists = read('playlists');
const feed = read('notes.feed');
const seed = read('notes');
const notes = [...feed, ...seed.filter((s) => !feed.some((f) => f.url === s.url))];

const SITE = 'https://livsteinmetz.web.app';
const EMAIL = 'olivia@example.com';
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fmt = (d) => new Date(d + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
const CLEF = `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M16 27c0-10 7-15 15-15 9 0 14 6 14 14 0 13-11 22-28 27" fill="none" stroke="currentColor" stroke-width="5.500" stroke-linecap="round"/><circle cx="19.500" cy="27" r="5.500" fill="currentColor"/><circle cx="52" cy="20" r="3.200" fill="currentColor"/><circle cx="52" cy="32" r="3.200" fill="currentColor"/></svg>`;

function shell({ path, title, description, body, wallTop, image = '/og.png' }) {
  const full = title ? `${title} | Olivia Steinmetz` : 'Olivia Steinmetz | Museum product, design, and code';
  const nav = [['/work', 'Work'], ['/notes', 'Notes'], ['/music', 'Music'], ['/about', 'About']]
    .map(([h, t]) => `<a href="${h}"${path.startsWith(h) ? ' aria-current="page"' : ''}>${t}</a>`).join('');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(full)}</title>
<meta name="description" content="${esc(description)}">
<meta name="theme-color" content="#c8d6ec">
<link rel="canonical" href="${SITE}${path}">
<link rel="icon" href="/clef.svg" type="image/svg+xml">
<link rel="preload" href="/fonts/Gloock-Regular.woff" as="font" type="font/woff" crossorigin>
<meta property="og:title" content="${esc(full)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${SITE}${path}">
<meta property="og:image" content="${SITE}${image}">
<meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="/styles.css">
<script async src="https://www.googletagmanager.com/gtag/js?id=G-WZM6YLSHQY"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-WZM6YLSHQY');</script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="top${wallTop ? ' on-wall' : ''}"><a class="mark" href="/">Olivia Steinmetz</a><nav aria-label="Main">${nav}</nav></header>
<main id="main">${body}</main>
<footer>
<div class="staff" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
<div class="foot"><span>Opinions here are my own and don't speak for the Barnes Foundation.</span>
<div><a href="mailto:${EMAIL}">Email</a><a href="https://www.linkedin.com/in/livsteinmetz/">LinkedIn</a><a href="https://github.com/livsteinmetz">GitHub</a><a href="https://medium.com/@osteinmetz">Medium</a></div></div>
</footer>
<script src="/app.js" type="module"></script>
</body>
</html>`;
}

const piece = (slug, label, img, alt, cls = '') =>
  `<a class="piece ${cls}" href="/work/${slug}"><span class="frame"><img src="/media/${img}.webp" alt="${esc(alt)}" loading="lazy"></span><span class="label">${esc(label)}</span></a>`;

const byslug = Object.fromEntries(work.map((w) => [w.slug, w]));
const ensemble = `<div class="ensemble">
<div class="outer"><span class="iron">${CLEF}</span>${piece('sms-ticketing', 'SMS ticketing', 'sms', byslug['sms-ticketing'].alt, 'tall')}</div>
<div class="stack">${piece('visual-experience-platform', 'Visual Experience Platform', 'vxp-still', byslug['visual-experience-platform'].alt)}${piece('membership', 'Membership', 'member', byslug.membership.alt)}</div>
<div class="center"><a class="piece" href="/work/deep-zoom"><span class="frame"><video data-hero-video muted loop playsinline preload="metadata" poster="/media/bedroom.webp" aria-label="Zooming across Van Gogh's The Bedroom in the deep-zoom viewer"><source src="/media/bedroom.mp4" type="video/mp4"></video></span></a><div class="center-row"><a class="label piece" href="/work/deep-zoom">Deep zoom, on Van Gogh's <i>The Bedroom</i></a><button class="pause" data-pause type="button">Pause</button></div></div>
<div class="stack">${piece('calder-gardens', 'Calder Gardens', 'calder-still', byslug['calder-gardens'].alt)}${piece('online-collection', 'Online collection', 'collection', byslug['online-collection'].alt)}</div>
<div class="outer"><span class="iron">${CLEF}</span>${piece('deep-zoom', 'Barnes Live', 'live', byslug['barnes-live'].alt, 'tall').replace('/work/deep-zoom', '/work/barnes-live')}</div>
</div>`;

const row = (w) => `<a class="row" href="/work/${w.slug}"><span class="row-img"><img src="/media/${w.image || w.poster}.webp" alt="${esc(w.alt)}" loading="lazy"></span><span><h3>${esc(w.title)}</h3><p>${esc(w.short)}</p><small>${esc(w.org)}</small></span></a>`;

const noteItem = (n) => {
  const onSite = n.html && n.slug;
  const href = onSite ? `/notes/${n.slug}` : n.url;
  return `<a class="note" href="${href}"><h3>${esc(n.title)}</h3><p>${esc(n.excerpt)}</p><span>${n.date ? fmt(n.date) + '. ' : ''}${onSite ? 'Read it here' : 'Read on Medium'}</span></a>`;
};
const NOTES_INTRO = `I write down what we're learning at the Barnes so that other small museum teams can skip the hard way. Think of these as notes passed down the stand.`;

const pages = {};
pages['index.html'] = shell({
  path: '/', wallTop: true,
  description: "Liv Steinmetz designs and builds museum software at the Barnes Foundation, plays double bass, and shares notes with the field.",
  body: `<section class="wall"><div class="hello"><h1>Hi, I'm Liv.</h1><p>I design and build museum software, and I play the double bass. Right now that means product, design, and code for the Barnes Foundation and Calder Gardens.</p></div>${ensemble}</section>
<section class="band"><div class="inner"><h2>Selected work</h2>${work.slice(0, 3).map(row).join('')}<a class="more" href="/work">See all the work</a></div></section>
<section class="band notes"><div class="inner"><h2>Notes for the field</h2><p class="lede">${NOTES_INTRO}</p><div class="notelist">${notes.slice(0, 3).map(noteItem).join('')}</div><a class="more" href="/notes">All notes</a></div></section>
<section class="band deep"><div class="inner"><h2>Nobody notices the bass line until it's gone.</h2><p class="lede">I've been a working double bassist since 2015, and it's a lot like infrastructure work. If you need a bassist around Philadelphia, I'd love to hear from you.</p><a class="btn" href="/music">About the playing</a></div></section>`,
});

pages['work.html'] = shell({
  path: '/work', title: 'Work',
  description: 'Selected museum products by Olivia Steinmetz: the Visual Experience Platform, Calder Gardens, membership, deep zoom, and more.',
  body: `<div class="page"><div class="head"><h1>Work</h1><p class="lede" style="margin-top:.6em">Almost all of this was built with a small team at the Barnes, and I've noted my part on each project.</p>${work.map(row).join('')}
<section class="earlier"><h2>Before museums</h2><ul>
<li>At Accenture, I built an augmented-reality tool for client design-thinking sessions in Unity and C#.</li>
<li>Through Vanderbilt's Wond'ry, I curated 75+ speaker programs, workshops, and meetups, and consulted on accessibility in connected health and smart home technology.</li>
<li>As a pro bono consultant, I redesigned the website for Project 615 and helped build an impact measurement framework for the Nashville Center for Nonprofit Management.</li>
</ul></section></div></div>`,
});

work.forEach((w, i) => {
  const next = work[(i + 1) % work.length];
  const media = w.video
    ? `<video controls muted loop playsinline preload="none" poster="/media/${w.poster}.webp" aria-label="${esc(w.alt)}"><source src="/media/${w.video}.mp4" type="video/mp4"></video>`
    : `<img src="/media/${w.image}.webp" alt="${esc(w.alt)}">`;
  pages[`work/${w.slug}.html`] = shell({
    path: `/work/${w.slug}`, title: w.title, description: `${w.short}. ${w.role} for ${w.org}.`, image: `/media/${w.image || w.poster}.webp`,
    body: `<article class="page"><div class="head"><h1>${esc(w.title)}</h1><p class="lede" style="margin-top:.5em">${esc(w.short)}</p></div>
<div class="hero-media">${media}</div>
<div class="split"><div class="prose">${w.body.map((p) => `<p>${esc(p)}</p>`).join('')}${w.note ? `<p>I wrote more about this in <a href="${w.note.url}">${esc(w.note.title)}</a>.</p>` : ''}${w.link ? `<p><a class="more" href="${w.link}">${esc(w.linkText)}</a></p>` : ''}</div>
<dl class="meta"><dt>For</dt><dd>${esc(w.org)}</dd><dt>When</dt><dd>${esc(w.years)}</dd><dt>My part</dt><dd>${esc(w.role)}</dd>${w.stack ? `<dt>Built with</dt><dd>${esc(w.stack)}</dd>` : ''}</dl></div>
<a class="next" href="/work/${next.slug}">Next: ${esc(next.title)}</a></article>`,
  });
});

pages['notes.html'] = shell({
  path: '/notes', title: 'Notes for the field',
  description: 'Notes on museum digital product work from Olivia Steinmetz: platforms, shared infrastructure, membership, accessibility, and AI.',
  body: `<div class="page notes"><div class="inner"><h1>Notes for the field</h1><p class="lede" style="margin-top:.5em">${NOTES_INTRO}</p><div class="notelist">${notes.map(noteItem).join('')}</div><p class="fine">Everything also lives on <a href="https://medium.com/@osteinmetz">Medium</a>. Disagree with something, or working on the same problem? <a href="mailto:${EMAIL}">Tell me about it.</a></p></div></div>`,
});
feed.forEach((n) => {
  pages[`notes/${n.slug}.html`] = shell({
    path: `/notes/${n.slug}`, title: n.title, description: n.excerpt,
    body: `<article class="page"><div class="prose" style="margin:0 auto"><h1 style="font-size:clamp(2.4rem,5.4vw,4rem)">${esc(n.title)}</h1><p style="margin-top:1em"><a href="${n.url}">First published on Medium</a>, ${fmt(n.date)}</p>${n.html}</div></article>`,
  });
});

const list = (a) => `<ul>${a.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
pages['music.html'] = shell({
  path: '/music', title: 'Music',
  description: 'Olivia Steinmetz is a freelance double bassist working in orchestras around Philadelphia and beyond.',
  body: `<div class="page deep"><div class="head"><h1>I play the double bass.</h1><p class="lede">I've freelanced since 2015 in orchestras, opera pits, and ballet pits around Philadelphia, Nashville, and Salt Lake City. I studied performance and engineering at the same time at Vanderbilt, and I've never been able to choose.</p><p class="lede">Contractors, I'm taking calls around Philadelphia for orchestra and pit work.</p><a class="btn" href="mailto:${EMAIL}?subject=Bass%20gig">Email me about a gig</a></div>
<div class="cols"><section><h2>Ensembles</h2>${list(music.ensembles)}</section><section><h2>Teaching and coaching</h2>${list(music.teaching)}</section><section><h2>Teachers</h2>${list(music.teachers)}</section></div>
${playlists.length ? `<div class="head" style="margin-top:56px"><h2>On my stand lately</h2><div class="play">${playlists.map((p) => `<iframe title="${esc(p.title)}" loading="lazy" allow="encrypted-media" src="https://open.spotify.com/embed/playlist/${esc(p.id)}"></iframe>`).join('')}</div></div>` : ''}</div>`,
});

const path = [
  ['2021 to now', 'Barnes Foundation, Calder Gardens, Pew Center for Arts & Heritage', 'Product Manager, Digital Initiatives. Started as a front-end engineer.'],
  ['2020 to 2021', 'Capital One', 'Software engineering, through the Capital One Developer Academy.'],
  ['2018 to 2020', 'Accenture', 'Technology product analyst working on AR and VR.'],
  ['2016 to 2020', "Vanderbilt's Wond'ry", 'Lead Innovation Ambassador.'],
  ['2015 to now', 'Freelance', 'Double bassist.'],
];
pages['about.html'] = shell({
  path: '/about', title: 'About',
  description: 'Olivia Steinmetz is a product manager, designer, engineer, and double bassist working in museums.',
  body: `<div class="page"><div class="split" style="margin-top:0"><div class="prose"><h1>About</h1>
<p class="lede" style="margin-top:.8em">I'm Liv. I'm a product manager, designer, and software engineer based in Philadelphia, working across the Barnes Foundation, Calder Gardens, and the Pew Center for Arts &amp; Heritage.</p>
<p>My title is Product Manager, Digital Initiatives. In practice I write the roadmap and then help build it. That covers ticketing, membership, giving, and the teaching tools behind Barnes classes. I also co-own our FY27 to FY29 technology plan with our CTO, and I run a biweekly AI practitioner group with champions from across the organization.</p>
<p>I got here sideways. I studied engineering and double bass at Vanderbilt, worked on emerging tech at Accenture, learned full-stack engineering at Capital One, and joined the Barnes in 2021 as the museum rethought its digital strategy. Later I earned an MSc in Information Technology and Learning at the University of Gothenburg, with a focus on human-computer interaction and how people learn to see in digital spaces.</p>
<p>Orchestra taught me most of what I know about product work. You listen more than you play, you hold the group together from the back, and you show up prepared because everybody else is counting on you.</p>
<p>I care about digital work in service of mission, not the other way around, and about how we build as much as what we build. Accessibility, shared infrastructure, and telling other museums what we learned all come out of that.</p>
<h2>Talks</h2>
<ul><li>Museum Computer Network 2026, digital strategic planning</li><li>American Alliance of Museums 2026, the Calder Gardens digital launch</li><li>Museum Computer Network 2023, the Visual Experience Platform</li><li>American Alliance of Museums 2023, the Visual Experience Platform</li></ul>
<h2>Say hello</h2><p>I'm happy to talk with anyone working on museum technology, or anyone who needs a bassist. <a href="mailto:${EMAIL}">${EMAIL}</a></p></div>
<div><ol class="path" aria-label="Career so far" style="margin-top:12px">${path.map(([y, o, d]) => `<li><span>${y}</span><span><b>${esc(o)}</b><br>${esc(d)}</span></li>`).join('')}</ol></div></div></div>`,
});

pages['404.html'] = shell({
  path: '/404', title: 'Page not found', description: 'This page has moved.',
  body: `<div class="page tint"><div class="head"><h1>That page isn't on the wall.</h1><p class="lede" style="margin-top:.6em">It may have moved when the site was redesigned. <a href="/">Go to the home page</a> or <a href="/notes">read the notes</a>.</p></div></div>`,
});

rmSync('build', { recursive: true, force: true });
mkdirSync('build', { recursive: true });
cpSync('site', 'build', { recursive: true });
for (const [file, html] of Object.entries(pages)) {
  mkdirSync(dirname(`build/${file}`), { recursive: true });
  writeFileSync(`build/${file}`, html);
}
const urls = Object.keys(pages).filter((f) => f !== '404.html').map((f) => `${SITE}/${f.replace(/(index)?\.html$/, '')}`);
writeFileSync('build/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((u) => `<url><loc>${u}</loc></url>`).join('')}</urlset>`);
writeFileSync('build/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
console.log(`Built ${Object.keys(pages).length} pages`);
