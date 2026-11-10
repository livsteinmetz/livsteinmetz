// Checks a deployed URL: security headers, content security policy violations, and that Firestore refuses anonymous writes.
import { chromium } from 'playwright';
const base = process.argv[2];
const r = await fetch(base);
for (const h of ['content-security-policy', 'strict-transport-security', 'x-content-type-options', 'x-frame-options', 'referrer-policy', 'permissions-policy', 'cross-origin-opener-policy']) console.log(r.headers.get(h) ? 'header ok' : 'HEADER MISSING', h);
const b = await chromium.launch();
for (const u of ['/', '/about', '/bass', '/listening', '/listening/trends', '/admin', '/work/visual-experience-platform', '/colophon']) {
  const g = await b.newPage(); let bad = 0;
  g.on('console', (m) => { if (/Content Security Policy|violates/i.test(m.text())) { bad++; console.log('CSP', u, m.text().slice(0, 240)); } });
  g.on('pageerror', (e) => console.log('ERR', u, e.message));
  await g.goto(base + u, { waitUntil: 'networkidle' }).catch((e) => console.log('NAV', u, e.message));
  await g.waitForTimeout(800); console.log('page', u, bad ? `${bad} violations` : 'clean', (await g.$('[data-mail]')) ? await g.$eval('[data-mail]', (a) => a.href.slice(0, 7)) : ''); await g.close();
}
await b.close();
// The existence precondition means this can never change the settings document, even if the rules were open.
const w = await fetch('https://firestore.googleapis.com/v1/projects/livsteinmetz-bb868/databases/(default)/documents/site/settings?updateMask.fieldPaths=probe&currentDocument.exists=false', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: { probe: { booleanValue: true } } }) });
console.log('anonymous write to settings:', w.status, w.status === 403 ? 'refused, good' : 'CHECK THE FIRESTORE RULES');
if (base.endsWith('livsteinmetz.com')) {
  const b2 = await chromium.launch(); const g = await b2.newPage();
  await g.goto('https://livsteinmetz.web.app/about', { waitUntil: 'load' }).catch(() => {}); await g.waitForTimeout(1500);
  console.log('old address lands on', g.url()); await b2.close();
}
// No listening data should be reachable without the passcode.
for (const u of ['/data/spotify.json', '/data/diary.json', '/listening/trends']) {
  const r = await fetch(base + u), t = await r.text();
  const leak = u === '/listening/trends' ? /"days"|"minutes"|"places"|"river"/.test(t) : r.ok && t.trim().startsWith('{');
  console.log('privacy', u, r.status, leak ? 'EXPOSED' : 'private');
}
