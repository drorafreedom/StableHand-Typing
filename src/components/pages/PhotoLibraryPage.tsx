import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../data/AuthContext';
import { storage, db } from '../../firebase/firebase';
import {
  ref as storageRef,
  listAll,
  getDownloadURL,
  uploadBytes,
} from 'firebase/storage';
import { doc, setDoc, getDoc } from 'firebase/firestore';

type Item = { path: string; url: string; name: string };

const smallBtn =
  'h-7 px-2.5 text-[11px] rounded border shadow-sm focus:outline-none focus:ring-2 ring-offset-1';
const btnSubtle  = 'bg-white/80 border-slate-300 text-slate-700 hover:bg-white';
const btnPrimary = 'bg-sky-500 border-sky-500 text-white hover:bg-sky-500 focus:ring-sky-300';
const btnGreen   = 'bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-300';

const PhotoLibraryPage: React.FC = () => {
  const { currentUser } = useAuth();
  const uid = currentUser?.uid;
  const basePath = useMemo(() => (uid ? `users/${uid}/photo-library` : ''), [uid]);

  const [items, setItems] = useState<Item[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    if (!uid) return;
    setLoading(true);
    try {
      const dir = storageRef(storage, basePath);
      const { items: files } = await listAll(dir);
      const rows: Item[] = [];
      for (const f of files) {
        const url = await getDownloadURL(f);
        rows.push({ path: f.fullPath, url, name: f.name });
      }
      // Optional: load existing selection
      const selDoc = await getDoc(doc(db, `users/${uid}/photo-animation/selection`));
      const sel: string[] = selDoc.exists() ? (selDoc.data().paths || []) : [];
      const selMap: Record<string, boolean> = {};
      sel.forEach(p => (selMap[p] = true));
      setItems(rows);
      setSelected(selMap);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [uid]);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!uid) return;
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        const safe = file.name.replace(/[^\w.\-]+/g, '_');
        const stamp = new Date().toISOString().replace(/[:.]/g, '-');
        const dst = storageRef(storage, `${basePath}/${stamp}-${safe}`);
        await uploadBytes(dst, file);
      }
      await load();
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const toggle = (path: string) =>
    setSelected(s => ({ ...s, [path]: !s[path] }));

  const selectAll = () => {
    const m: Record<string, boolean> = {};
    items.forEach(it => (m[it.path] = true));
    setSelected(m);
  };

  const clearSel = () => setSelected({});

  const saveSelection = async () => {
    if (!uid) return alert('Sign in first.');
    const paths = Object.keys(selected).filter(p => selected[p]);
    await setDoc(doc(db, `users/${uid}/photo-animation/selection`), {
      paths,
      count: paths.length,
      savedAt: new Date().toISOString(),
    });
    alert('Selection saved. Open the Photo Animation tab and click “Load from Library”.');
  };

  return (
    <div className="px-4 py-4">
      <div className="mb-3 flex items-center gap-2">
        <h1 className="text-sm font-semibold text-slate-800">Photo Library</h1>
        <div className="ml-auto flex items-center gap-2">
          <label className={`${smallBtn} ${btnSubtle} cursor-pointer`}>
            Upload…
            <input type="file" accept="image/*" multiple className="hidden" onChange={onUpload} />
          </label>
          <button onClick={selectAll} className={`${smallBtn} ${btnSubtle}`}>Select all</button>
          <button onClick={clearSel} className={`${smallBtn} ${btnSubtle}`}>Clear</button>
          <button onClick={saveSelection} className={`${smallBtn} ${btnPrimary}`}>Save selection</button>
        </div>
      </div>

      {(loading || uploading) && (
        <div className="text-xs text-slate-600 mb-2">{loading ? 'Loading…' : 'Uploading…'}</div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
        {items.map(it => {
          const isSel = !!selected[it.path];
          return (
            <div key={it.path}
              className={`relative rounded-lg overflow-hidden border ${isSel ? 'border-sky-500' : 'border-slate-200'} bg-white shadow-sm`}>
              <img
                src={it.url}
                alt={it.name}
                className="w-full h-32 object-cover"
                loading="lazy"
              />
              <div className="p-2 flex items-center justify-between text-[11px]">
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={isSel}
                    onChange={() => toggle(it.path)}
                  />
                  <span className="truncate max-w-[120px]">{it.name}</span>
                </label>
                <a href={it.url} download className="text-sky-600 hover:underline">Download</a>
              </div>
            </div>
          );
        })}
      </div>

      {!items.length && !loading && (
        <div className="text-xs text-slate-600 mt-6">
          No photos yet. Click <b>Upload…</b> to add images to your library.
        </div>
      )}
    </div>
  );
};

export default PhotoLibraryPage;
