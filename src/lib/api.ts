// src/lib/api.ts
import { getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

import { app } from '../firebaseConfig';

const appInstance = getApp();
console.info('[Firebase projectId]', appInstance.options.projectId); // ⇠ sanity check in console

const db = getFirestore(app);

/** Shape stored in Firestore */
export type ReflectionRecord = {
  title: string;
  type?: 'Reading' | 'Assignment' | 'Group work' | string;
  summary?: string;
  reflection?: string;
  citation?: string;
  tags?: string; // CSV
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

/** Shape returned to the UI */
export type Reflection = {
  id: string;
  title: string;
  type?: 'Reading' | 'Assignment' | 'Group work' | string;
  summary?: string;
  reflection?: string;
  citation?: string;
  tags?: string; // CSV to keep the public views simple
  createdAt?: string | null; // ISO
  updatedAt?: string | null; // ISO
};

/** Helper to normalize Firestore timestamps -> ISO strings */
function toIso(ts?: Timestamp): string | null {
  try {
    return ts ? ts.toDate().toISOString() : null;
  } catch {
    return null;
  }
}

/** ---- CRUD (Firestore) ---- */

export async function listReflections(): Promise<Reflection[]> {
  const snap = await getDocs(collection(db, 'reflections'));

  return snap.docs
    .filter((d) => !d.id.startsWith('_')) // ignore _seed_meta
    .map((d) => {
      const data = d.data() as ReflectionRecord;
      return {
        id: d.id,
        title: data.title,
        type: data.type,
        summary: data.summary ?? '',
        reflection: data.reflection ?? '',
        citation: data.citation ?? '',
        tags: data.tags ?? '',
        createdAt: toIso(data.createdAt),
        updatedAt: toIso(data.updatedAt),
      };
    });
}

export async function getReflection(id: string): Promise<Reflection> {
  const ref = doc(db, 'reflections', id);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    throw new Error('Not found');
  }
  const data = snap.data() as ReflectionRecord;
  return {
    id: snap.id,
    title: data.title,
    type: data.type,
    summary: data.summary ?? '',
    reflection: data.reflection ?? '',
    citation: data.citation ?? '',
    tags: data.tags ?? '',
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  };
}

export async function upsertReflection(
  _token: string, // kept for call-site compatibility; not used
  id: string | null,
  payload: Partial<ReflectionRecord> & { title: string },
): Promise<Reflection> {
  const base: ReflectionRecord = {
    title: payload.title,
    type: payload.type,
    summary: payload.summary ?? '',
    reflection: payload.reflection ?? '',
    citation: payload.citation ?? '',
    tags: payload.tags ?? '',
  };

  if (id) {
    const ref = doc(db, 'reflections', id);
    await updateDoc(ref, { ...base, updatedAt: serverTimestamp() });
    const snap = await getDoc(ref);
    const data = snap.data() as ReflectionRecord;
    return {
      id: snap.id,
      title: data.title,
      type: data.type,
      summary: data.summary ?? '',
      reflection: data.reflection ?? '',
      citation: data.citation ?? '',
      tags: data.tags ?? '',
      createdAt: toIso(data.createdAt),
      updatedAt: toIso(data.updatedAt),
    };
  } else {
    const col = collection(db, 'reflections');
    const docRef = await addDoc(col, {
      ...base,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    const snap = await getDoc(docRef);
    const data = snap.data() as ReflectionRecord;
    return {
      id: docRef.id,
      title: data.title,
      type: data.type,
      summary: data.summary ?? '',
      reflection: data.reflection ?? '',
      citation: data.citation ?? '',
      tags: data.tags ?? '',
      createdAt: toIso(data.createdAt),
      updatedAt: toIso(data.updatedAt),
    };
  }
}

export async function deleteReflection(_token: string, id: string): Promise<{ ok: true }> {
  await deleteDoc(doc(db, 'reflections', id));
  return { ok: true };
}
