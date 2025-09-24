import {
  collection, doc, setDoc, getDoc, getDocs,
  serverTimestamp, query, where, orderBy, limit, Firestore
} from 'firebase/firestore';
import { ref, uploadString, Storage } from 'firebase/storage';

export const QNR_DRAFT_DOC_ID = 'current';

export type QnrCtx = {
  db: Firestore;
  storage: Storage;
  uid: string | null | undefined;
  slug: string;                  // e.g. 'medical-interview' | 'demographics' | 'feedback'
};

// Build Firestore & Storage paths for a given questionnaire
export function qnrPaths(ctx: QnrCtx) {
  const safeUid = ctx.uid || 'anonymous';
  const safeSlug = ctx.slug.replace(/[^a-z0-9\-_.]/gi, '_').toLowerCase();
  return {
    collectionPath: `users/${safeUid}/forms/${safeSlug}`,
    storagePrefix : `users/${safeUid}/forms/${safeSlug}`,
    localKey      : `qnr_${safeSlug}_v1`,
  };
}

// Local draft helpers (per questionnaire)
export function qnrSaveLocal(ctx: QnrCtx, data: Record<string, any>) {
  try { localStorage.setItem(qnrPaths(ctx).localKey, JSON.stringify(data)); } catch {}
}
export function qnrLoadLocal(ctx: QnrCtx): Record<string, any> | null {
  try {
    const raw = localStorage.getItem(qnrPaths(ctx).localKey);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
export function qnrClearLocal(ctx: QnrCtx) {
  try { localStorage.removeItem(qnrPaths(ctx).localKey); } catch {}
}

// CSV helper (simple flat-ish CSV)
export function qnrToCsv(obj: Record<string, any>): string {
  const lines: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    if (Array.isArray(v)) lines.push(`${k},"${v.join(';')}"`);
    else if (v && typeof v === 'object') lines.push(`${k},"${JSON.stringify(v)}"`);
    else lines.push(`${k},${v ?? ''}`);
  }
  return lines.join('\n');
}

// Load draft: try fixed-id first; fallback to latest legacy draft in THIS questionnaire namespace
export async function qnrLoadDraft(ctx: QnrCtx): Promise<{ data: any } | null> {
  const { db } = ctx;
  const { collectionPath } = qnrPaths(ctx);

  const fixedRef = doc(db, collectionPath, QNR_DRAFT_DOC_ID);
  const fixedSnap = await getDoc(fixedRef);
  if (fixedSnap.exists()) {
    return { data: (fixedSnap.data() as any)?.data ?? {} };
  }

  // Fallback for older docs in same namespace
  const qref = query(
    collection(db, collectionPath),
    where('status', '==', 'draft'),
    orderBy('updatedAt', 'desc'),
    limit(1)
  );
  const snap = await getDocs(qref);
  if (snap.empty) return null;

  const docSnap = snap.docs[0];
  const data = (docSnap.data() as any)?.data ?? {};
  // Migrate to fixed doc so future saves overwrite
  await setDoc(fixedRef, { ...docSnap.data(), migratedFrom: docSnap.id }, { merge: true });
  return { data };
}

// Save draft (overwrite fixed id)
export async function qnrSaveDraft(ctx: QnrCtx, data: Record<string, any>): Promise<void> {
  const { db, uid } = ctx;
  const { collectionPath } = qnrPaths(ctx);
  const refDoc = doc(db, collectionPath, QNR_DRAFT_DOC_ID);
  await setDoc(
    refDoc,
    { uid: uid ?? null, status: 'draft', updatedAt: serverTimestamp(), data },
    { merge: true }
  );
}

// Submit final (overwrite fixed id). Non-blocking CSV by default.
export async function qnrSubmitFinal(
  ctx: QnrCtx,
  data: Record<string, any>,
  opts: { awaitUpload?: boolean; writeHistory?: boolean } = {}
): Promise<void> {
  const { db, storage, uid } = ctx;
  const { collectionPath, storagePrefix } = qnrPaths(ctx);
  const refDoc = doc(db, collectionPath, QNR_DRAFT_DOC_ID);

  await setDoc(
    refDoc,
    { uid: uid ?? null, status: 'final', createdAt: serverTimestamp(), updatedAt: serverTimestamp(), data },
    { merge: true }
  );

  // Optional: write a historical snapshot (autoId) while keeping 'current'
  if (opts.writeHistory) {
    const histRef = doc(collection(db, `${collectionPath}/history`));
    await setDoc(histRef, { uid: uid ?? null, createdAt: serverTimestamp(), data });
  }

  const csv = qnrToCsv({ ...data, _docId: QNR_DRAFT_DOC_ID });
  const ts  = new Date().toISOString();
  const csvRef = ref(storage, `${storagePrefix}/${QNR_DRAFT_DOC_ID}/csv/${ts}.csv`);
  const p = uploadString(csvRef, csv, 'raw', { contentType: 'text/csv;charset=utf-8' });
  if (opts.awaitUpload) await p; else p.catch(() => {});
}
//---------------------------------------
//previosu version 


// src/utils/medicalInterviewStore.ts
import {
  collection, doc, setDoc, getDoc, getDocs,
  serverTimestamp, query, where, orderBy, limit, Firestore
} from 'firebase/firestore';
import { ref, uploadString, Storage } from 'firebase/storage';

// Everything in here is namespaced to "forms/medical-interview"
export const MI_DRAFT_DOC_ID = 'current';
export const MI_LOCAL_KEY   = 'mi_draft_v1';

export type MICtx = {
  db: Firestore;
  storage: Storage;
  uid: string | null | undefined;
};

export const miPaths = (uid: string | null | undefined) => {
  const safeUid = uid || 'anonymous';
  return {
    // Firestore collection for this form only
    collectionPath: `users/${safeUid}/forms/medical-interview`,
    // Storage base for this form only
    storagePrefix:  `users/${safeUid}/forms/medical-interview`,
  };
};

// ---- local draft helpers (do NOT touch preset keys) ----
export function miSaveLocal(data: Record<string, any>) {
  try { localStorage.setItem(MI_LOCAL_KEY, JSON.stringify(data)); } catch {}
}
export function miLoadLocal(): Record<string, any> | null {
  try { const raw = localStorage.getItem(MI_LOCAL_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
}
export function miClearLocal() { try { localStorage.removeItem(MI_LOCAL_KEY); } catch {} }

// ---- CSV (for Storage export) ----
export function miToCsv(obj: Record<string, any>): string {
  const lines: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    if (Array.isArray(v)) lines.push(`${k},"${v.join(';')}"`);
    else if (v && typeof v === 'object') lines.push(`${k},"${JSON.stringify(v)}"`);
    else lines.push(`${k},${v ?? ''}`);
  }
  return lines.join('\n');
}

// ---- Firestore load/save/submit (fixed-id, isolated paths) ----
export async function miLoadDraft(ctx: MICtx): Promise<{ data: any } | null> {
  const { db, uid } = ctx;
  const { collectionPath } = miPaths(uid);

  // 1) fixed id first
  const fixedRef = doc(db, collectionPath, MI_DRAFT_DOC_ID);
  const fixedSnap = await getDoc(fixedRef);
  if (fixedSnap.exists()) {
    return { data: (fixedSnap.data() as any)?.data ?? {} };
  }

  // 2) fallback to legacy draft in THIS namespace only
  const qref = query(
    collection(db, collectionPath),
    where('status', '==', 'draft'),
    orderBy('updatedAt', 'desc'),
    limit(1)
  );
  const snap = await getDocs(qref);
  if (snap.empty) return null;

  const docSnap = snap.docs[0];
  const data = (docSnap.data() as any)?.data ?? {};
  // migrate into fixed doc so future saves overwrite
  await setDoc(fixedRef, { ...docSnap.data(), migratedFrom: docSnap.id }, { merge: true });
  return { data };
}

export async function miSaveDraft(ctx: MICtx, data: Record<string, any>): Promise<void> {
  const { db, uid } = ctx;
  const { collectionPath } = miPaths(uid);
  const refDoc = doc(db, collectionPath, MI_DRAFT_DOC_ID);
  await setDoc(
    refDoc,
    { uid: uid ?? null, status: 'draft', updatedAt: serverTimestamp(), data },
    { merge: true }
  );
}

export async function miSubmitFinal(
  ctx: MICtx,
  data: Record<string, any>,
  opts: { awaitUpload?: boolean } = {}
): Promise<void> {
  const { db, storage, uid } = ctx;
  const { collectionPath, storagePrefix } = miPaths(uid);
  const refDoc = doc(db, collectionPath, MI_DRAFT_DOC_ID);

  // overwrite same doc with final
  await setDoc(
    refDoc,
    { uid: uid ?? null, status: 'final', createdAt: serverTimestamp(), updatedAt: serverTimestamp(), data },
    { merge: true }
  );

  // Storage CSV export under its own prefix (doesn't touch preset files)
  const csv = miToCsv({ ...data, _docId: MI_DRAFT_DOC_ID });
  const ts  = new Date().toISOString();
  const csvRef = ref(storage, `${storagePrefix}/${MI_DRAFT_DOC_ID}/csv/${ts}.csv`);

  const p = uploadString(csvRef, csv, 'raw', { contentType: 'text/csv;charset=utf-8' });
  if (opts.awaitUpload) await p; else p.catch(() => {});
}
