// src/lib/api.ts

import {
  getFirestore,
  collection,
  query,
  orderBy,
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

const db = getFirestore(app);

/** Shape stored in Firestore */
export type ReflectionRecord = {
  title: string;
  summary?: string;
  citation?: string;
  tags?: string; // comma-separated
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

/** Shape returned to the UI */
export type Reflection = {
  id: string;
  title: string;
  summary?: string;
  citation?: string;
  tags?: string;
  createdAt?: string | null; // ISO string for easy Date handling in UI
  updatedAt?: string | null; // ISO string
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
  const q = query(collection(db, 'reflections'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as ReflectionRecord;
    return {
      id: d.id,
      title: data.title,
      summary: data.summary ?? '',
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
    summary: data.summary ?? '',
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
  const base = {
    title: payload.title,
    summary: payload.summary ?? '',
    citation: payload.citation ?? '',
    tags: payload.tags ?? '',
  };

  if (id) {
    const ref = doc(db, 'reflections', id);
    await updateDoc(ref, {
      ...base,
      updatedAt: serverTimestamp(),
    });
    const snap = await getDoc(ref);
    const data = snap.data() as ReflectionRecord;
    return {
      id: snap.id,
      title: data.title,
      summary: data.summary ?? '',
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
      summary: data.summary ?? '',
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
