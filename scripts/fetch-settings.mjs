// Saves the /admin choices to content/settings.json so the build leaves hidden
// items out of the page entirely. A failed request keeps the committed file.
import { writeFileSync } from 'node:fs';

try {
  const res = await fetch('https://firestore.googleapis.com/v1/projects/livsteinmetz-bb868/databases/(default)/documents/site/settings');
  if (res.status === 404) { console.log('No admin settings saved yet'); process.exit(0); }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const settings = JSON.parse((await res.json()).fields.json.stringValue);
  writeFileSync('content/settings.json', `${JSON.stringify(settings, null, 1)}\n`);
  console.log(`Settings: ${settings.hidden.length} hidden, ${settings.playlists.length} playlists`);
} catch (err) {
  console.warn(`Settings skipped: ${err.message}`);
}
