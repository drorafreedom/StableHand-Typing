// src\components\common\PresetControls.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../data/AuthContext';
import { db, storage } from '../../firebase/firebase';
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes } from 'firebase/storage';
import Papa from 'papaparse';
import {
  type PresetModule,
  presetsColPath,
  presetDocPath,
  presetCsvPath,
  presetJsonPath,
} from '../../utils/presets';

type MergeLoaded<S> = (loaded: Partial<S>, current: S) => S;

interface PresetControlsProps<S> {
  module: PresetModule;                         // e.g. 'color'
  settings: S;                                  // your current settings state
  setSettings: React.Dispatch<React.SetStateAction<S>>;
  mergeLoaded?: MergeLoaded<S>;                 // how to merge loaded preset into current settings
  className?: string;                           // optional styling
  compact?: boolean;                            // shrink spacing/fonts if you want
}

function defaultMerge<S>(loaded: Partial<S>, current: S): S {
  return { ...current, ...loaded };
}

function PresetControls<S>({
  module,
  settings,
  setSettings,
  mergeLoaded = defaultMerge,
  className = '',
  compact = true,
}: PresetControlsProps<S>) {
  const { currentUser } = useAuth();
  const uid = currentUser?.uid;

  const [saveName, setSaveName] = useState('');
  const [selectedName, setSelectedName] = useState('');
  const [presetList, setPresetList] = useState<string[]>([]);
  const [msg, setMsg] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!uid) return;
    (async () => {
      try {
        const snap = await getDocs(collection(db, presetsColPath(uid, module)));
        setPresetList(snap.docs.map(d => d.id).sort());
      } catch (e) {
        console.error('fetch presets failed', e);
      }
    })();
  }, [uid, module]);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 2000);
    return () => clearTimeout(t);
  }, [msg]);

  const savePreset = async () => {
    if (!uid) { setMsg({ message: 'Please log in.', type: 'error' }); return; }
    const name = saveName.trim();
    if (!name) { setMsg({ message: 'Enter a preset name.', type: 'error' }); return; }

    try {
      const path = presetDocPath(uid, module, name);
      const docRef = doc(db, path);

      // confirm overwrite if exists
      const existing = await getDoc(docRef);
      if (existing.exists()) {
        const ok = window.confirm(`Preset "${name}" already exists. Overwrite?`);
        if (!ok) return;
      }

      const ts = new Date();
      const payload: Record<string, any> = {
        ...settings,
        presetName: name,
        userId: uid,
        timestamp: ts.toISOString(),
        localDateTime: ts.toLocaleString(),
        schema: 1,
      };

      // Firestore
      await setDoc(docRef, payload, { merge: true });

      // Storage backups (CSV + JSON) — optional but keeps parity with your other modules
      const csvRows = Object.entries(payload).map(([k, v]) => ({
        setting: k,
        value: Array.isArray(v) ? JSON.stringify(v) : String(v),
      }));
      await uploadBytes(
        storageRef(storage, presetCsvPath(uid, module, name)),
        new Blob([Papa.unparse(csvRows)], { type: 'text/csv;charset=utf-8;' })
      );
      await uploadBytes(
        storageRef(storage, presetJsonPath(uid, module, name)),
        new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
      );

      setPresetList(prev => (prev.includes(name) ? prev : [...prev, name].sort()));
      setMsg({ message: 'Preset saved.', type: 'success' });
    } catch (e: any) {
      console.error('savePreset failed', e);
      setMsg({ message: `Save failed: ${e?.code || ''} ${e?.message || e}`, type: 'error' });
    }
  };

  const loadPreset = async () => {
    if (!uid) { setMsg({ message: 'Please log in.', type: 'error' }); return; }
    const name = selectedName.trim();
    if (!name) { setMsg({ message: 'Choose a preset to load.', type: 'error' }); return; }

    try {
      const snap = await getDoc(doc(db, presetDocPath(uid, module, name)));
      if (!snap.exists()) {
        setMsg({ message: 'Preset not found.', type: 'error' });
        return;
      }
      const data = snap.data() as Partial<S>;
      setSettings(curr => mergeLoaded(data, curr));
      setMsg({ message: `Loaded "${name}".`, type: 'success' });
    } catch (e: any) {
      console.error('loadPreset failed', e);
      setMsg({ message: `Load failed: ${e?.code || ''} ${e?.message || e}`, type: 'error' });
    }
  };

  const size = compact ? 'text-xs' : 'text-sm';

  return (
    <div className={`rounded ${className}`}>
      <div className={`space-y-2 ${size}`}>
        {/* Save (independent input) */}
        <div>
          <label className="block mb-1">Save as preset</label>
          <div className="flex gap-2">
            <input
              value={saveName}
              onChange={e => setSaveName(e.target.value)}
              placeholder="Preset name"
              className="border p-2 rounded w-full"
            />
            <button onClick={savePreset} className="bg-blue-500 text-white px-3 rounded">
              Save
            </button>
          </div>
        </div>

        {/* Load (separate dropdown that does NOT change saveName) */}
        <div>
          <label className="block mb-1">Load preset</label>
          <div className="flex gap-2">
            <select
              value={selectedName}
              onChange={e => setSelectedName(e.target.value)}
              className="border p-2 rounded w-full"
            >
              <option value="">Select…</option>
              {presetList.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <button onClick={loadPreset} className="bg-yellow-500 text-white px-3 rounded">
              Load
            </button>
          </div>
        </div>

        {msg && (
          <div className={`text-white p-2 rounded ${msg.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
            {msg.message}
          </div>
        )}
      </div>
    </div>
  );
}

export default PresetControls;
