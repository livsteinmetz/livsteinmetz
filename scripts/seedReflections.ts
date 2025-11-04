// scripts/seedReflections.ts
import * as admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';
import { Reflection } from '../src/lib/api';
import { REFLECTIONS } from '../src/copy/constants';

// ---- load service account ----
const KEY_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(process.cwd(), 'service-account.json');
if (!fs.existsSync(KEY_PATH)) {
  console.error(`Missing service account JSON at: ${KEY_PATH}
Set GOOGLE_APPLICATION_CREDENTIALS or place service-account.json at the repo root.`);
  process.exit(1);
}

const sa = JSON.parse(fs.readFileSync(KEY_PATH, 'utf8'));

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(sa),
    projectId: sa.project_id,
  });
}

const db = admin.firestore();

async function run() {
  console.log('Seeding reflections…');

  const batch = db.batch();
  const col = db.collection('reflections');

  for (const item of REFLECTIONS) {
    const ref = col.doc(item.id);
    batch.set(ref, item, { merge: true });
  }

  await batch.commit();
  console.log('Seed complete.');
  await col.doc('_seed_meta').set(
    {
      lastSeedAt: admin.firestore.FieldValue.serverTimestamp(),
      count: REFLECTIONS.length,
      note: 'Safe to delete; recreated by the seeder.',
    },
    { merge: true },
  );

  console.log('Wrote _seed_meta with timestamp.');
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  });
