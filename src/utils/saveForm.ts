import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadString } from 'firebase/storage';
import { db, storage } from '../firebase/firebase';

export type SaveOptions = {
  uid: string | null | undefined;
  collectionPath: string;  // e.g. `users/${uid}/medical-interviews`
  status?: 'draft' | 'final';
  docId?: string;          // for updating an existing draft
};

function toCsv(payload: Record<string, any>): string {
  const lines: string[] = [];
  for (const [k, v] of Object.entries(payload)) {
    if (Array.isArray(v)) lines.push(`${k},"${v.join(';')}"`);
    else if (typeof v === 'object' && v !== null) lines.push(`${k},"${JSON.stringify(v)}"`);
    else lines.push(`${k},${v ?? ''}`);
  }
  return lines.join('\n');
}

// Explicit “Save draft” (returns docId so you can keep updating)
export async function saveDraft(
  data: Record<string, any>,
  { uid, collectionPath, docId }: SaveOptions
) {
  const id = docId || doc(collection(db, collectionPath)).id;
  const docRef = doc(db, collectionPath, id);
  await setDoc(docRef, {
    uid: uid ?? null,
    status: 'draft',
    updatedAt: serverTimestamp(),
    data,
  }, { merge: true });
  return { docId: id };
}

// Final submit: writes Firestore + CSV to Storage
export async function submitFinal(
  data: Record<string, any>,
  { uid, collectionPath }: SaveOptions
) {
  const id = doc(collection(db, collectionPath)).id;
  const docRef = doc(db, collectionPath, id);

  const payload = {
    uid: uid ?? null,
    status: 'final',
    createdAt: serverTimestamp(),
    data,
  };

  await setDoc(docRef, payload);

  const csv = toCsv({ ...data, _docId: id });
  const ts = new Date().toISOString();
  const csvRef = ref(storage, `${collectionPath}/${id}/${ts}.csv`);
  await uploadString(csvRef, csv, 'raw');

  return { docId: id };
}

// Local autosave helpers (lightweight)
const LS_KEY = 'medicalInterviewDraft';
export function saveLocal(data: Record<string, any>) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch {}
}
export function loadLocal(): Record<string, any> | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
export function clearLocal() { try { localStorage.removeItem(LS_KEY); } catch {} }
