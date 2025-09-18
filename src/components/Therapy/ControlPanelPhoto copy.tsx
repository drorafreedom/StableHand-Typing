// ControlPanelPhoto.tsx
import React, { useEffect, useState } from 'react';
import type { PhotoSettings } from './PhotoAnimations';
import { Collapse } from 'react-collapse';
import { db, storage } from '../../firebase/firebase';
import { useAuth } from '../../data/AuthContext';
import { doc, setDoc, getDoc, deleteDoc, getDocs, collection } from 'firebase/firestore';
import { ref as storageRef, listAll, getDownloadURL, uploadBytes } from 'firebase/storage';
import Papa from 'papaparse';

type Props = {
  settings: PhotoSettings;
  setSettings: React.Dispatch<React.SetStateAction<PhotoSettings>>;
  // transport
  startAnimation: () => void;
  stopAnimation: () => void;
  resetAnimation: () => void;
  // auto/manual
  autoAdvance: boolean;
  setAutoAdvance: (v: boolean) => void;
  prevImage: () => void;
  nextImage: () => void;
  // sources
  setUrls: (urls: string[]) => void;
  loadSequence: (folder: string, count: number, start?: number, ext?: string) => void;
  loadSingleFromFolder: (folder: string, index: number, ext?: string) => void;
};

const clampHex6 = (hex: string) => (!hex?.startsWith('#') ? '#000000'
  : hex.length === 7 ? hex
  : hex.length === 9 ? `#${hex.slice(1,7)}`
  : '#000000');
const num = (v: number, d = 2) => (Number.isFinite(v) ? v.toFixed(d) : '0');

const ControlPanelPhoto: React.FC<Props> = ({
  settings, setSettings,
  startAnimation, stopAnimation, resetAnimation,
  autoAdvance, setAutoAdvance, prevImage, nextImage,
  setUrls, loadSequence, loadSingleFromFolder,
}) => {
  const [msg, setMsg] = useState('');
  const [isOpen, setIsOpen] = useState(true);

  // PUBLIC (/public) inputs
  const [folder, setFolder] = useState('bgphotos');
  const [count, setCount]   = useState(14);
  const [start, setStart]   = useState(1);
  const [ext, setExt]       = useState('jpg');
  const [single, setSingle] = useState(1);

  // PRESETS
  const { currentUser } = useAuth();
  const uid = currentUser?.uid ?? '';
  const [presetName, setPresetName] = useState('');
  const [presets, setPresets] = useState<string[]>([]);
  const myPresetColl = uid ? collection(db, `users/${uid}/photo-animation-settings`) : null;

  const refreshPresetList = async () => {
    if (!myPresetColl) { setPresets([]); return; }
    try {
      const snap = await getDocs(myPresetColl);
      const names = snap.docs.map(d => d.id).filter(n => n !== 'current').sort();
      setPresets(names);
    } catch {}
  };
  useEffect(() => { refreshPresetList(); /* eslint-disable-line */ }, [uid]);

  const savePreset = async () => {
    if (!uid || !presetName.trim()) { setMsg('Enter a preset name.'); return; }
    const name = presetName.trim();
    const payload = { ...settings, overlayColor: clampHex6(settings.overlayColor), presetName: name, userId: uid, timestamp: new Date().toISOString() };
    try {
      await setDoc(doc(db, `users/${uid}/photo-animation-settings/${name}`), payload);
      const csv = Papa.unparse(Object.entries(payload).map(([k, v]) => ({ setting: k, value: Array.isArray(v) ? JSON.stringify(v) : String(v) })));
      await uploadBytes(storageRef(storage, `users/${uid}/photo-animation-settings/${name}.csv`), new Blob([csv], { type: 'text/csv' }));
      if (!presets.includes(name)) setPresets(ps => [...ps, name].sort());
      setMsg('Preset saved.');
    } catch { setMsg('Failed to save preset.'); }
  };

  const loadPreset = async () => {
    if (!uid || !presetName.trim()) { setMsg('Select a preset.'); return; }
    try {
      const snap = await getDoc(doc(db, `users/${uid}/photo-animation-settings/${presetName.trim()}`));
      if (!snap.exists()) { setMsg('Preset not found.'); return; }
      const d = snap.data() as Partial<PhotoSettings>;
      setSettings(s => ({
        ...s,
        mode: (['kenburns','slide','crossfade'] as const).includes(d.mode as any) ? (d.mode as any) : s.mode,
        direction: (['static','left','right','up','down','oscillateRightLeft','oscillateUpDown','circular'] as const).includes(d.direction as any) ? (d.direction as any) : s.direction,
        scaleMode: (['cover','contain'] as const).includes(d.scaleMode as any) ? (d.scaleMode as any) : s.scaleMode,
        duration: typeof d.duration === 'number' ? d.duration : s.duration,
        transitionSeconds: typeof d.transitionSeconds === 'number' ? d.transitionSeconds : s.transitionSeconds,
        speed: typeof d.speed === 'number' ? d.speed : s.speed,
        zoom: typeof d.zoom === 'number' ? d.zoom : s.zoom,
        zoomMode: (['constant','pulse'] as const).includes(d.zoomMode as any) ? (d.zoomMode as any) : s.zoomMode,
        zoomSpeed: typeof d.zoomSpeed === 'number' ? d.zoomSpeed : s.zoomSpeed,
        overlayColor: typeof d.overlayColor === 'string' ? clampHex6(d.overlayColor) : s.overlayColor,
        overlayOpacity: typeof d.overlayOpacity === 'number' ? d.overlayOpacity : s.overlayOpacity,
        overlayOpacityMode: (['constant','pulse'] as const).includes(d.overlayOpacityMode as any) ? (d.overlayOpacityMode as any) : s.overlayOpacityMode,
        overlayOpacitySpeed: typeof d.overlayOpacitySpeed === 'number' ? d.overlayOpacitySpeed : s.overlayOpacitySpeed,
        urls: Array.isArray(d.urls) ? d.urls : s.urls,
        shuffleKey: typeof d.shuffleKey === 'number' ? d.shuffleKey : s.shuffleKey,
      }));
      setMsg('Preset loaded.');
    } catch { setMsg('Failed to load preset.'); }
  };

  const deletePreset = async (name: string) => {
    if (!uid) return;
    if (!confirm(`Delete "${name}"?`)) return;
    try { await deleteDoc(doc(db, `users/${uid}/photo-animation-settings/${name}`)); setPresets(ps => ps.filter(p => p !== name)); }
    catch { setMsg('Failed to delete preset.'); }
  };

  // CLOUD loaders (requires sign-in per your rules)
  const loadShared = async () => {
    if (!uid) { setMsg('Sign in to load shared.'); return; }
    try {
      const base = storageRef(storage, 'photos/');
      const res = await listAll(base);
      const items = res.items.filter(i => /\.(png|jpe?g|gif|webp|bmp|heic|heif|svg)$/i.test(i.name));
      const urls = await Promise.all(items.map(i => getDownloadURL(i)));
      setUrls(urls);
      setMsg(`Loaded ${urls.length} shared photo(s).`);
    } catch { setMsg('Failed to load shared.'); }
  };

  const loadMine = async () => {
    if (!uid) { setMsg('Sign in to load your folder.'); return; }
    try {
      const base = storageRef(storage, `users/${uid}/photo-library/`);
      const res = await listAll(base);
      const items = res.items.filter(i => /\.(png|jpe?g|gif|webp|bmp|heic|heif|svg)$/i.test(i.name));
      const urls = await Promise.all(items.map(i => getDownloadURL(i)));
      setUrls(urls);
      setMsg(`Loaded ${urls.length} personal photo(s).`);
    } catch { setMsg('Failed to load your folder.'); }
  };

  const uploadToMine = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []); e.target.value = '';
    if (!uid) { setMsg('Sign in to upload.'); return; }
    if (!files.length) return;
    try {
      for (const f of files) {
        const path = `users/${uid}/photo-library/${Date.now()}_${Math.random().toString(36).slice(2)}_${f.name}`;
        await uploadBytes(storageRef(storage, path), f);
      }
      await loadMine();
      setMsg(`Uploaded ${files.length} file(s).`);
    } catch { setMsg('Upload failed.'); }
  };

  const uploadToShared = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []); e.target.value = '';
    if (!uid) { setMsg('Sign in first.'); return; }
    if (!files.length) return;
    try {
      for (const f of files) {
        const path = `photos/${Date.now()}_${Math.random().toString(36).slice(2)}_${f.name}`;
        await uploadBytes(storageRef(storage, path), f);
      }
      await loadShared();
      setMsg(`Uploaded ${files.length} file(s) to shared.`);
    } catch { setMsg('Shared upload failed.'); }
  };

  return (
    <div
      className={`fixed right-4 top-2 p-4 rounded ${isOpen ? 'shadow-lg bg-white/92 backdrop-blur' : ''} w-64 z-50 max-h-[96vh] overflow-y-auto`}
    >
      <button
        onClick={() => setIsOpen(o => !o)}
        className="w-full bg-gray-200 text-gray-700 text-xs py-2 rounded mb-3"
      >
        {isOpen ? 'Collapse Controls' : 'Expand Controls'}
      </button>

      <Collapse isOpened={isOpen}>
        <div className="space-y-3 text-xs">
          {/* Transport */}
          <div className="grid grid-cols-2 gap-2">
            <button onClick={startAnimation} className="bg-green-600 text-white p-2 rounded">Start</button>
            <button onClick={stopAnimation}  className="bg-rose-600  text-white p-2 rounded">Stop</button>
            <button onClick={resetAnimation} className="bg-slate-600 text-white p-2 rounded">Reset</button>
            <button onClick={() => setSettings(s => ({ ...s, shuffleKey: (s.shuffleKey ?? 0) + 1 }))} className="bg-sky-600 text-white p-2 rounded">Shuffle</button>
          </div>

          {/* Manual / Auto */}
          <div className="grid grid-cols-3 gap-2">
            <button onClick={prevImage} className="border p-2 rounded">Prev</button>
            <button onClick={() => setAutoAdvance(!autoAdvance)} className="border p-2 rounded">Auto: {autoAdvance ? 'ON' : 'OFF'}</button>
            <button onClick={nextImage} className="border p-2 rounded">Next</button>
          </div>

          {/* Single photo from /public */}
          <div className="border rounded p-2 space-y-2">
            <div className="font-semibold text-slate-700">Single photo (public)</div>
            <div className="grid grid-cols-3 gap-2 items-end">
              <div>
                <label className="block">#</label>
                <input type="number" min={1} value={single} onChange={e => setSingle(Number(e.target.value || 1))} className="border rounded px-2 py-1 w-full" />
              </div>
              <div>
                <label className="block">Ext</label>
                <input value={ext} onChange={e => setExt(e.target.value)} className="border rounded px-2 py-1 w-full" />
              </div>
              <button
                className="border rounded px-2 py-1"
                onClick={() => { loadSingleFromFolder(folder, Math.max(1, single|0), ext); setAutoAdvance(false); setMsg(`Loaded ${folder}/${single}.${ext}`); }}
              >
                Load #N
              </button>
            </div>
          </div>

          {/* Sequence from /public */}
          <div className="border rounded p-2 space-y-2">
            <div className="font-semibold text-slate-700">Sequence (public)</div>
            <div className="grid grid-cols-4 gap-2">
              <div className="col-span-2">
                <label className="block">Folder</label>
                <input value={folder} onChange={e => setFolder(e.target.value)} className="border rounded px-2 py-1 w-full" />
              </div>
              <div>
                <label className="block">Count</label>
                <input type="number" min={1} value={count} onChange={e => setCount(Number(e.target.value || 1))} className="border rounded px-2 py-1 w-full" />
              </div>
              <div>
                <label className="block">Start</label>
                <input type="number" min={0} value={start} onChange={e => setStart(Number(e.target.value || 1))} className="border rounded px-2 py-1 w-full" />
              </div>
            </div>
            <button className="border rounded px-2 py-1 w-full" onClick={() => loadSequence(folder, count, start, ext)}>
              Load 1..N
            </button>
            <div className="text-[11px] text-slate-600">Selected: {settings.urls.length}</div>
          </div>

          {/* Cloud sources */}
          <div className="border rounded p-2 space-y-2">
            <div className="font-semibold text-slate-700">Cloud Photos</div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={loadShared} className="border p-2 rounded">Load Shared</button>
              <button onClick={loadMine}   className="border p-2 rounded">Load Mine</button>
            </div>
            <div>
              <label className="block">Upload to My Folder</label>
              <input type="file" accept="image/*" multiple onChange={uploadToMine} className="w-full text-[11px]" />
            </div>
            <div>
              <label className="block">Upload to Shared</label>
              <input type="file" accept="image/*" multiple onChange={uploadToShared} className="w-full text-[11px]" />
            </div>
          </div>

          {/* Mode & timing */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block mb-1">Mode</label>
              <select value={settings.mode} onChange={e => setSettings(s => ({ ...s, mode: e.target.value as PhotoSettings['mode'] }))} className="border rounded px-2 py-1 w-full">
                <option value="kenburns">Ken Burns</option>
                <option value="slide">Slide</option>
                <option value="crossfade">Crossfade</option>
              </select>
            </div>
            <div>
              <label className="block mb-1">Fit</label>
              <select value={settings.scaleMode} onChange={e => setSettings(s => ({ ...s, scaleMode: e.target.value as PhotoSettings['scaleMode'] }))} className="border rounded px-2 py-1 w-full">
                <option value="cover">Cover</option>
                <option value="contain">Contain</option>
              </select>
            </div>
            <div>
              <label className="block mb-1">Duration/photo: {num(settings.duration)}s</label>
              <input type="range" min={1} max={20} step={0.25} value={settings.duration} onChange={e => setSettings(s => ({ ...s, duration: Number(e.target.value) }))} className="w-full" />
            </div>
            <div>
              <label className="block mb-1">Transition: {num(settings.transitionSeconds)}s</label>
              <input type="range" min={0} max={6} step={0.1} value={settings.transitionSeconds} onChange={e => setSettings(s => ({ ...s, transitionSeconds: Number(e.target.value) }))} className="w-full" />
            </div>
          </div>

          {/* Motion */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block mb-1">Direction</label>
              <select value={settings.direction} onChange={e => setSettings(s => ({ ...s, direction: e.target.value as PhotoSettings['direction'] }))} className="border rounded px-2 py-1 w-full">
                <option value="static">Static</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
                <option value="up">Up</option>
                <option value="down">Down</option>
                <option value="oscillateRightLeft">Oscillate L↔R</option>
                <option value="oscillateUpDown">Oscillate U↕D</option>
                <option value="circular">Circular</option>
              </select>
            </div>
            <div>
              <label className="block mb-1">Speed: {Math.round(settings.speed)}</label>
              <input type="range" min={0} max={400} step={1} value={settings.speed} onChange={e => setSettings(s => ({ ...s, speed: Number(e.target.value) }))} className="w-full" />
            </div>
          </div>

          {/* Zoom */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block mb-1">Zoom: {num(settings.zoom)}×</label>
              <input type="range" min={1} max={2.5} step={0.01} value={settings.zoom} onChange={e => setSettings(s => ({ ...s, zoom: Number(e.target.value) }))} className="w-full" />
            </div>
            <div>
              <label className="block mb-1">Zoom Mode</label>
              <select value={settings.zoomMode} onChange={e => setSettings(s => ({ ...s, zoomMode: e.target.value as PhotoSettings['zoomMode'] }))} className="border rounded px-2 py-1 w-full">
                <option value="constant">Constant</option>
                <option value="pulse">Pulse</option>
              </select>
            </div>
          </div>

          {/* Overlay */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block mb-1">Overlay Color</label>
              <input type="color" value={clampHex6(settings.overlayColor)} onChange={e => setSettings(s => ({ ...s, overlayColor: clampHex6(e.target.value) }))} className="w-full h-8 p-0 border rounded" />
            </div>
            <div>
              <label className="block mb-1">Overlay Opacity: {Math.round(settings.overlayOpacity * 100)}%</label>
              <input type="range" min={0} max={100} step={1} value={Math.round(settings.overlayOpacity * 100)} onChange={e => setSettings(s => ({ ...s, overlayOpacity: Number(e.target.value) / 100 }))} className="w-full" />
            </div>
          </div>

          {/* Presets */}
          <div className="pt-2 border-t space-y-2">
            <div className="font-semibold text-slate-700">Presets</div>
            <div className="flex gap-2">
              <input className="border rounded px-2 py-1 text-[12px] w-full" placeholder="Preset name" value={presetName} onChange={(e) => setPresetName(e.target.value)} />
              <button onClick={savePreset} className="border rounded px-2 text-[12px]">Save</button>
              <button onClick={loadPreset} className="border rounded px-2 text-[12px]">Load</button>
            </div>
            <div className="space-y-1 max-h-40 overflow-auto pr-1">
              {presets.length === 0 && <div className="text-slate-500">None</div>}
              {presets.map((n) => (
                <div key={n} className="flex items-center justify-between gap-2">
                  <button onClick={() => setPresetName(n)} className="underline decoration-dotted truncate" title={n}>{n}</button>
                  <button onClick={() => deletePreset(n)} className="border rounded px-2 text-[11px]">Del</button>
                </div>
              ))}
            </div>
          </div>

          {!!msg && <div className="text-[11px] px-2 py-1 rounded bg-white/70">{msg}</div>}
        </div>
      </Collapse>
    </div>
  );
};

export default ControlPanelPhoto;


//------------------------------bad though almost full controllers 

// import React, { useEffect, useState } from 'react';
// import type { PhotoSettings } from './PhotoAnimations';
// import { db, storage } from '../../firebase/firebase';
// import { Collapse } from 'react-collapse';
// import { useAuth } from '../../data/AuthContext';
// import { doc, setDoc, getDoc, deleteDoc, getDocs, collection } from 'firebase/firestore';
// import { ref as storageRef, listAll, getDownloadURL, uploadBytes } from 'firebase/storage';
// import Papa from 'papaparse';

// type Props = {
//   settings: PhotoSettings;
//   setSettings: React.Dispatch<React.SetStateAction<PhotoSettings>>;
//   // transport
//   startAnimation: () => void;
//   stopAnimation: () => void;
//   resetAnimation: () => void;
//   // auto/manual
//   autoAdvance: boolean;
//   setAutoAdvance: (v: boolean) => void;
//   prevImage: () => void;
//   nextImage: () => void;
//   // sources
//   setUrls: (urls: string[]) => void;
//   loadSequence: (folder: string, count: number, start?: number, ext?: string) => void;
//   loadSingleFromFolder: (folder: string, index: number, ext?: string) => void;
// };

// const clampHex6 = (hex: string) => (!hex?.startsWith('#') ? '#000000' : hex.length === 7 ? hex : hex.length === 9 ? `#${hex.slice(1,7)}` : '#000000');
// const num = (v: number, d = 2) => (Number.isFinite(v) ? v.toFixed(d) : '0');

// const ControlPanelPhoto: React.FC<Props> = ({
//   settings, setSettings,
//   startAnimation, stopAnimation, resetAnimation,
//   autoAdvance, setAutoAdvance, prevImage, nextImage,
//   setUrls, loadSequence, loadSingleFromFolder,
// }) => {
//   const [msg, setMsg] = useState('');
//   const [isOpen, setIsOpen] = useState(true);

//   // PUBLIC (/public) inputs
//   const [folder, setFolder] = useState('bgphotos');
//   const [count, setCount]   = useState(14);
//   const [start, setStart]   = useState(1);
//   const [ext, setExt]       = useState('jpg');
//   const [single, setSingle] = useState(1);

//   // PRESETS (same paths as your other modules)
//   const { currentUser } = useAuth();
//   const uid = currentUser?.uid ?? '';
//   const [presetName, setPresetName] = useState('');
//   const [presets, setPresets] = useState<string[]>([]);
//   const myPresetColl = uid ? collection(db, `users/${uid}/photo-animation-settings`) : null;

//   const refreshPresetList = async () => {
//     if (!myPresetColl) { setPresets([]); return; }
//     try {
//       const snap = await getDocs(myPresetColl);
//       const names = snap.docs.map(d => d.id).filter(n => n !== 'current').sort();
//       setPresets(names);
//     } catch {}
//   };
//   useEffect(() => { refreshPresetList(); /* eslint-disable-line */ }, [uid]);

//   const savePreset = async () => {
//     if (!uid || !presetName.trim()) { setMsg('Enter a preset name.'); return; }
//     const name = presetName.trim();
//     const payload = { ...settings, overlayColor: clampHex6(settings.overlayColor), presetName: name, userId: uid, timestamp: new Date().toISOString() };
//     try {
//       await setDoc(doc(db, `users/${uid}/photo-animation-settings/${name}`), payload);
//       const csv = Papa.unparse(Object.entries(payload).map(([k, v]) => ({ setting: k, value: Array.isArray(v) ? JSON.stringify(v) : String(v) })));
//       await uploadBytes(storageRef(storage, `users/${uid}/photo-animation-settings/${name}.csv`), new Blob([csv], { type: 'text/csv' }));
//       if (!presets.includes(name)) setPresets(ps => [...ps, name].sort());
//       setMsg('Preset saved.');
//     } catch { setMsg('Failed to save preset.'); }
//   };
//   const loadPreset = async () => {
//     if (!uid || !presetName.trim()) { setMsg('Select a preset.'); return; }
//     try {
//       const snap = await getDoc(doc(db, `users/${uid}/photo-animation-settings/${presetName.trim()}`));
//       if (!snap.exists()) { setMsg('Preset not found.'); return; }
//       const d = snap.data() as Partial<PhotoSettings>;
//       setSettings(s => ({
//         ...s,
//         mode: (['kenburns','slide','crossfade'] as const).includes(d.mode as any) ? (d.mode as any) : s.mode,
//         direction: (['static','left','right','up','down','oscillateRightLeft','oscillateUpDown','circular'] as const).includes(d.direction as any) ? (d.direction as any) : s.direction,
//         scaleMode: (['cover','contain'] as const).includes(d.scaleMode as any) ? (d.scaleMode as any) : s.scaleMode,
//         duration: typeof d.duration === 'number' ? d.duration : s.duration,
//         transitionSeconds: typeof d.transitionSeconds === 'number' ? d.transitionSeconds : s.transitionSeconds,
//         speed: typeof d.speed === 'number' ? d.speed : s.speed,
//         zoom: typeof d.zoom === 'number' ? d.zoom : s.zoom,
//         zoomMode: (['constant','pulse'] as const).includes(d.zoomMode as any) ? (d.zoomMode as any) : s.zoomMode,
//         zoomSpeed: typeof d.zoomSpeed === 'number' ? d.zoomSpeed : s.zoomSpeed,
//         overlayColor: typeof d.overlayColor === 'string' ? clampHex6(d.overlayColor) : s.overlayColor,
//         overlayOpacity: typeof d.overlayOpacity === 'number' ? d.overlayOpacity : s.overlayOpacity,
//         overlayOpacityMode: (['constant','pulse'] as const).includes(d.overlayOpacityMode as any) ? (d.overlayOpacityMode as any) : s.overlayOpacityMode,
//         overlayOpacitySpeed: typeof d.overlayOpacitySpeed === 'number' ? d.overlayOpacitySpeed : s.overlayOpacitySpeed,
//         urls: Array.isArray(d.urls) ? d.urls : s.urls,
//         shuffleKey: typeof d.shuffleKey === 'number' ? d.shuffleKey : s.shuffleKey,
//       }));
//       setMsg('Preset loaded.');
//     } catch { setMsg('Failed to load preset.'); }
//   };
//   const deletePreset = async (name: string) => {
//     if (!uid) return;
//     if (!confirm(`Delete "${name}"?`)) return;
//     try { await deleteDoc(doc(db, `users/${uid}/photo-animation-settings/${name}`)); setPresets(ps => ps.filter(p => p !== name)); }
//     catch { setMsg('Failed to delete preset.'); }
//   };

//   // CLOUD loaders (shared/personal)
//   const loadShared = async () => {
//     try {
//       const base = storageRef(storage, 'photos/');
//       const res = await listAll(base);
//       const items = res.items.filter(i => /\.(png|jpe?g|gif|webp|bmp|heic|heif|svg)$/i.test(i.name));
//       const urls = await Promise.all(items.map(i => getDownloadURL(i)));
//       setUrls(urls);
//       setMsg(`Loaded ${urls.length} shared photo(s).`);
//     } catch { setMsg('Failed to load shared.'); }
//   };
//   const loadMine = async () => {
//     if (!uid) { setMsg('Sign in to load your folder.'); return; }
//     try {
//       const base = storageRef(storage, `users/${uid}/photo-library/`);
//       const res = await listAll(base);
//       const items = res.items.filter(i => /\.(png|jpe?g|gif|webp|bmp|heic|heif|svg)$/i.test(i.name));
//       const urls = await Promise.all(items.map(i => getDownloadURL(i)));
//       setUrls(urls);
//       setMsg(`Loaded ${urls.length} personal photo(s).`);
//     } catch { setMsg('Failed to load your folder.'); }
//   };
//   const uploadToMine = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = Array.from(e.target.files || []); e.target.value = '';
//     if (!uid) { setMsg('Sign in to upload.'); return; }
//     if (!files.length) return;
//     try {
//       for (const f of files) {
//         const path = `users/${uid}/photo-library/${Date.now()}_${Math.random().toString(36).slice(2)}_${f.name}`;
//         await uploadBytes(storageRef(storage, path), f);
//       }
//       await loadMine();
//       setMsg(`Uploaded ${files.length} file(s).`);
//     } catch { setMsg('Upload failed.'); }
//   };
//   const uploadToShared = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = Array.from(e.target.files || []); e.target.value = '';
//     if (!files.length) return;
//     try {
//       for (const f of files) {
//         const path = `photos/${Date.now()}_${Math.random().toString(36).slice(2)}_${f.name}`;
//         await uploadBytes(storageRef(storage, path), f);
//       }
//       await loadShared();
//       setMsg(`Uploaded ${files.length} file(s) to shared.`);
//     } catch { setMsg('Shared upload failed.'); }
//   };

//   return (
//      <div
//          className={`fixed right-4 top-2 p-4 rounded ${
//            isOpen ? 'shadow-lg bg-transparent' : ''
//          } w-60 z-50 h-full overflow-y-auto`}
//        >
//          <button
//            onClick={() => setIsOpen(o => !o)}
//            className="w-full bg-gray-200 text-gray-700 text-xs py-2 rounded mb-4"
//          >
//            {isOpen ? 'Collapse Controls' : 'Expand Controls'}
//          </button>
   
//          <Collapse isOpened={isOpen}>
//            <div className="space-y-4">
//              {/* Transport */}
//              <div className="text-xs flex space-x-2">
//                <button onClick={startAnimation} className="flex-1 bg-green-500 text-white py-2 rounded">Start</button>
//                <button onClick={stopAnimation}  className="flex-1 bg-red-500   text-white py-2 rounded">Stop</button>
//                <button onClick={resetAnimation} className="flex-1 bg-gray-500  text-white py-2 rounded">Reset</button>
//              </div>
//      <div className="text-xs flex space-x-2">
//         <button onClick={() => { setSettings(s => ({ ...s, shuffleKey: (s.shuffleKey ?? 0) + 1 })); }} className="bg-sky-600 text-white p-2 rounded">Shuffle</button>
//       </div>

//       {/* Manual / Auto */}
//       <div className="grid grid-cols-3 text-xs  gap-2">
//         {/* //<button onClick={prevImage} className="border p-2 rounded">Prev</button> */}
//        <button onClick={() => { setAutoAdvance(false); prevImage(); }} className="border p-2 rounded">Prev</button>
// <button onClick={() => setAutoAdvance(!autoAdvance)} className="border p-2 rounded">
//   Auto: {autoAdvance ? 'ON' : 'OFF'}
// </button>
// <button onClick={() => { setAutoAdvance(false); nextImage(); }} className="border p-2 rounded">Next</button>

//       </div>

//       {/* Single photo from /public */}
//       <div className="border rounded  text-xs  p-2 space-y-2">
//         <div className="font-semibold text-slate-700">Single photo (public)</div>
//         <div className="grid grid-cols-3 gap-2 items-end">
//           <div>
//             <label className="block">#</label>
//             <input type="number" min={1} value={single} onChange={e => setSingle(Number(e.target.value || 1))} className="border rounded px-2 py-1 w-full" />
//           </div>
//           <div>
//             <label className="block">Ext</label>
//             <input value={ext} onChange={e => setExt(e.target.value)} className="border rounded px-2 py-1 w-full" />
//           </div>
//           <button className="border rounded text-xs   px-2 py-1"
//             onClick={() => {
//               loadSingleFromFolder(folder, Math.max(1, single|0), ext);
//               setAutoAdvance(false);
//               setMsg(`Loaded ${folder}/${single}.${ext}`);
//             }}>
//             Load #N
//           </button>
//         </div>
//       </div>

//       {/* Sequence from /public */}
//       <div className="border rounded  text-xs p-2 space-y-2">
//         <div className="font-semibold text-slate-700">Sequence (public)</div>
//         <div className="grid grid-cols-4 gap-2">
//           <div className="col-span-2">
//             <label className="block">Folder</label>
//             <input value={folder} onChange={e => setFolder(e.target.value)} className="border rounded px-2 py-1 w-full" />
//           </div>
//           <div>
//             <label className="block">Count</label>
//             <input type="number" min={1} value={count} onChange={e => setCount(Number(e.target.value || 1))} className="border rounded px-2 py-1 w-full" />
//           </div>
//           <div>
//             <label className="block">Start</label>
//             <input type="number" min={0} value={start} onChange={e => setStart(Number(e.target.value || 1))} className="border rounded px-2 py-1 w-full" />
//           </div>
//         </div>
//         <button className="border rounded text-xs  px-2 py-1 w-full" onClick={() => loadSequence(folder, count, start, ext)}>
//           Load 1..N
//         </button>
//         <div className="text-[11px] text-slate-600">Selected: {settings.urls.length}</div>
//       </div>

//       {/* Cloud sources */}
//       <div className="border rounded  text-xs p-2 space-y-2">
//         <div className="font-semibold text-slate-700">Cloud Photos</div>
//         <div className="grid grid-cols-2 gap-2">
//           <button onClick={loadShared} className="border p-2 rounded">Load Shared</button>
//           <button onClick={loadMine}   className="border p-2 rounded">Load Mine</button>
//         </div>
//         <div>
//           <label className="block">Upload to My Folder</label>
//           <input type="file" accept="image/*" multiple onChange={uploadToMine} className="w-full text-[11px]" />
//         </div>
//         <div>
//           <label className="block">Upload to Shared</label>
//           <input type="file" accept="image/*" multiple onChange={uploadToShared} className="w-full text-[11px]" />
//         </div>
//       </div>

//       {/* Mode & timing */}
//       <div className="grid grid-cols-2 text-xs  gap-2">
//         <div>
//           <label className="block mb-1">Mode</label>
//           <select value={settings.mode} onChange={e => setSettings(s => ({ ...s, mode: e.target.value as PhotoSettings['mode'] }))} className="border rounded px-2 py-1 w-full">
//             <option value="kenburns">Ken Burns</option>
//             <option value="slide">Slide</option>
//             <option value="crossfade">Crossfade</option>
//           </select>
//         </div>
//         <div>
//           <label className="block mb-1">Fit</label>
//           <select value={settings.scaleMode} onChange={e => setSettings(s => ({ ...s, scaleMode: e.target.value as PhotoSettings['scaleMode'] }))} className="border rounded px-2 py-1 w-full">
//             <option value="cover">Cover</option>
//             <option value="contain">Contain</option>
//           </select>
//         </div>
//         <div>
//           <label className="block mb-1">Duration/photo: {num(settings.duration)}s</label>
//           <input type="range" min={1} max={20} step={0.25} value={settings.duration} onChange={e => setSettings(s => ({ ...s, duration: Number(e.target.value) }))} className="w-full" />
//         </div>
//         <div>
//           <label className="block mb-1">Transition: {num(settings.transitionSeconds)}s</label>
//           <input type="range" min={0} max={6} step={0.1} value={settings.transitionSeconds} onChange={e => setSettings(s => ({ ...s, transitionSeconds: Number(e.target.value) }))} className="w-full" />
//         </div>
//       </div>

//       {/* Motion */}
//       <div className="grid grid-cols-2 gap-2">
//         <div>
//           <label className="block mb-1">Direction</label>
//           <select value={settings.direction} onChange={e => setSettings(s => ({ ...s, direction: e.target.value as PhotoSettings['direction'] }))} className="border rounded px-2 py-1 w-full">
//             <option value="static">Static</option>
//             <option value="left">Left</option>
//             <option value="right">Right</option>
//             <option value="up">Up</option>
//             <option value="down">Down</option>
//             <option value="oscillateRightLeft">Oscillate L↔R</option>
//             <option value="oscillateUpDown">Oscillate U↕D</option>
//             <option value="circular">Circular</option>
//           </select>
//         </div>
//         <div>
//           <label className="block mb-1">Speed: {Math.round(settings.speed)}</label>
//           <input type="range" min={0} max={400} step={1} value={settings.speed} onChange={e => setSettings(s => ({ ...s, speed: Number(e.target.value) }))} className="w-full" />
//         </div>
//       </div>

//       {/* Zoom */}
//       <div className="grid grid-cols-2 gap-2">
//         <div>
//           <label className="block mb-1">Zoom: {num(settings.zoom)}×</label>
//           <input type="range" min={1} max={2.5} step={0.01} value={settings.zoom} onChange={e => setSettings(s => ({ ...s, zoom: Number(e.target.value) }))} className="w-full" />
//         </div>
//         <div>
//           <label className="block mb-1">Zoom Mode</label>
//           <select value={settings.zoomMode} onChange={e => setSettings(s => ({ ...s, zoomMode: e.target.value as PhotoSettings['zoomMode'] }))} className="border rounded px-2 py-1 w-full">
//             <option value="constant">Constant</option>
//             <option value="pulse">Pulse</option>
//           </select>
//         </div>
//       </div>

//       {/* Overlay */}
//       <div className="grid grid-cols-2 gap-2">
//         <div>
//           <label className="block mb-1">Overlay Color</label>
//           <input type="color" value={clampHex6(settings.overlayColor)} onChange={e => setSettings(s => ({ ...s, overlayColor: clampHex6(e.target.value) }))} className="w-full h-8 p-0 border rounded" />
//         </div>
//         <div>
//           <label className="block mb-1">Overlay Opacity: {Math.round(settings.overlayOpacity * 100)}%</label>
//           <input type="range" min={0} max={100} step={1} value={Math.round(settings.overlayOpacity * 100)} onChange={e => setSettings(s => ({ ...s, overlayOpacity: Number(e.target.value) / 100 }))} className="w-full" />
//         </div>
//       </div>

//       {/* Presets */}
//       <div className="pt-2 border-t space-y-2">
//         <div className="font-semibold text-slate-700">Presets</div>
//         <div className="flex gap-2">
//           <input className="border rounded px-2 py-1 text-[12px] w-full" placeholder="Preset name" value={presetName} onChange={(e) => setPresetName(e.target.value)} />
//           <button onClick={savePreset} className="border rounded px-2 text-[12px]">Save</button>
//           <button onClick={loadPreset} className="border rounded px-2 text-[12px]">Load</button>
//         </div>
//         <div className="space-y-1 max-h-40 overflow-auto pr-1">
//           {presets.length === 0 && <div className="text-slate-500">None</div>}
//           {presets.map((n) => (
//             <div key={n} className="flex items-center justify-between gap-2">
//               <button onClick={() => setPresetName(n)} className="underline decoration-dotted truncate" title={n}>{n}</button>
//               <button onClick={() => deletePreset(n)} className="border rounded px-2 text-[11px]">Del</button>
//             </div>
//           ))}
//         </div>
//       </div>

//       {!!msg && <div className="text-[11px] px-2 py-1 rounded bg-white/70">{msg}</div>}
//   </div>
//        </Collapse>
//      </div>
//    );
//  };
 
// export default ControlPanelPhoto;



// // src/components/Therapy/ControlPanelPhoto.tsx
// import React, { useState } from 'react';
// import { Collapse } from 'react-collapse';
// import type { PhotoSettings } from './PhotoAnimations';

// type Props = {
//   settings: PhotoSettings;
//   setSettings: React.Dispatch<React.SetStateAction<PhotoSettings>>;
//   startAnimation: () => void;
//   stopAnimation: () => void;
//   resetAnimation: () => void;
//   onLoadBuiltIn: () => Promise<void>;
//   onLoadSequence: (folder: string, count: number, start?: number, ext?: string) => void;
// };

// // keep helpers OUTSIDE component and don't reference props/state here
// const num = (v: number, d = 2) => (Number.isFinite(v) ? v.toFixed(d) : '0');
// const normalizeHex6 = (hex: string) => {
//   if (!hex || !hex.startsWith('#')) return '#000000';
//   if (hex.length === 7) return hex; // #rrggbb
//   if (hex.length === 9) return `#${hex.slice(1, 7)}`; // drop alpha
//   return '#000000';
// };

// const ControlPanelPhoto: React.FC<Props> = ({
//   settings, setSettings, startAnimation, stopAnimation, resetAnimation, onLoadBuiltIn, onLoadSequence,
// }) => {
//   const [open, setOpen] = useState(true);

//   // sequence loader UI (no manifest needed)
//   const [seqFolder, setSeqFolder] = useState('bgphotos');
//   const [seqCount, setSeqCount]   = useState<number | string>(14);
//   const [seqStart, setSeqStart]   = useState<number | string>(1);
//   const [seqExt, setSeqExt]       = useState('jpg');

//   const shuffle = () =>
//     setSettings(s => ({ ...s, shuffleKey: (s.shuffleKey || 0) + 1 }));

//   return (
//     <div className={`fixed right-4 top-2 p-4 rounded shadow-lg w-64 z-50 ${open ? 'bg-white/80 backdrop-blur' : ''}`}>
//       <button onClick={() => setOpen(!open)} className="mb-2 bg-gray-200 text-xs p-2 rounded w-full">
//         {open ? 'Collapse Controls' : 'Expand Controls'}
//       </button>

//       <Collapse isOpened={open}>
//         <div className="space-y-4 text-xs">
//           {/* Transport */}
//           <div className="grid grid-cols-2 gap-2">
//             <button onClick={startAnimation} className="bg-green-500 text-white p-2 rounded">Start</button>
//             <button onClick={stopAnimation}  className="bg-red-500 text-white p-2 rounded">Stop</button>
//             <button onClick={resetAnimation} className="bg-gray-500 text-white p-2 rounded">Reset</button>
//             <button onClick={shuffle}        className="bg-sky-500 text-white p-2 rounded">Shuffle</button>
//           </div>

//           {/* Built-in (manifest.json) */}
//           <div className="space-y-2">
//             <div className="font-semibold text-slate-700">Photos (built-in)</div>
//             <button onClick={onLoadBuiltIn} className="border p-1 rounded w-full">
//               Load from manifest.json
//             </button>
//           </div>

//           {/* Sequence (no manifest) */}
//           <div className="space-y-1 border p-2 rounded">
//             <div className="font-semibold text-slate-700">Load sequence</div>
//             <label className="block">Folder</label>
//             <input value={seqFolder} onChange={e => setSeqFolder(e.target.value)} className="border rounded px-2 py-1 w-full" />
//             <div className="grid grid-cols-3 gap-2 mt-1">
//               <div>
//                 <label className="block">Count</label>
//                 <input type="number" min={1} value={seqCount}
//                   onChange={e => setSeqCount(e.target.value)} className="border rounded px-2 py-1 w-full" />
//               </div>
//               <div>
//                 <label className="block">Start</label>
//                 <input type="number" min={0} value={seqStart}
//                   onChange={e => setSeqStart(e.target.value)} className="border rounded px-2 py-1 w-full" />
//               </div>
//               <div>
//                 <label className="block">Ext</label>
//                 <input value={seqExt} onChange={e => setSeqExt(e.target.value)} className="border rounded px-2 py-1 w-full" />
//               </div>
//             </div>
//             <button
//               onClick={() => onLoadSequence(seqFolder, Number(seqCount), Number(seqStart), seqExt)}
//               className="mt-2 border p-1 rounded w-full"
//             >
//               Load 1..N (no JSON)
//             </button>
//             <div className="text-[11px] text-slate-600">Selected: {settings.urls.length}</div>
//           </div>

//           {/* Mode & timing */}
//           <div className="grid grid-cols-2 gap-2">
//             <div>
//               <label className="block mb-1">Mode</label>
//               <select
//                 value={settings.mode}
//                 onChange={(e) => setSettings(s => ({ ...s, mode: e.target.value as PhotoSettings['mode'] }))}
//                 className="border rounded px-2 py-1 w-full"
//               >
//                 <option value="kenburns">Ken Burns</option>
//                 <option value="slide">Slide</option>
//                 <option value="crossfade">Crossfade</option>
//               </select>
//             </div>
//             <div>
//               <label className="block mb-1">Fit</label>
//               <select
//                 value={settings.scaleMode}
//                 onChange={(e) => setSettings(s => ({ ...s, scaleMode: e.target.value as PhotoSettings['scaleMode'] }))}
//                 className="border rounded px-2 py-1 w-full"
//               >
//                 <option value="cover">Cover</option>
//                 <option value="contain">Contain</option>
//               </select>
//             </div>
//             <div>
//               <label className="block mb-1">Duration/photo: {num(settings.duration)}s</label>
//               <input type="range" min={1} max={20} step={0.25}
//                 value={settings.duration}
//                 onChange={(e) => setSettings(s => ({ ...s, duration: Number(e.target.value) }))}
//                 className="w-full"
//               />
//             </div>
//             <div>
//               <label className="block mb-1">Transition: {num(settings.transitionSeconds)}s</label>
//               <input type="range" min={0} max={6} step={0.1}
//                 value={settings.transitionSeconds}
//                 onChange={(e) => setSettings(s => ({ ...s, transitionSeconds: Number(e.target.value) }))}
//                 className="w-full"
//               />
//             </div>
//           </div>

//           {/* Motion */}
//           <div className="grid grid-cols-2 gap-2">
//             <div>
//               <label className="block mb-1">Direction</label>
//               <select
//                 value={settings.direction}
//                 onChange={(e) => setSettings(s => ({ ...s, direction: e.target.value as PhotoSettings['direction'] }))}
//                 className="border rounded px-2 py-1 w-full"
//               >
//                 <option value="static">Static</option>
//                 <option value="left">Left</option>
//                 <option value="right">Right</option>
//                 <option value="up">Up</option>
//                 <option value="down">Down</option>
//                 <option value="oscillateRightLeft">Oscillate L↔R</option>
//                 <option value="oscillateUpDown">Oscillate U↕D</option>
//                 <option value="circular">Circular</option>
//               </select>
//             </div>
//             <div>
//               <label className="block mb-1">Speed: {Math.round(settings.speed)}</label>
//               <input type="range" min={0} max={200} step={1}
//                 value={Number.isFinite(settings.speed) ? settings.speed : 50}
//                 onChange={(e) => setSettings(s => ({ ...s, speed: Number(e.target.value) }))}
//                 className="w-full"
//               />
//             </div>
//           </div>

//           {/* Zoom */}
//           <div className="grid grid-cols-2 gap-2">
//             <div>
//               <label className="block mb-1">Zoom: {num(settings.zoom)}×</label>
//               <input type="range" min={1} max={2.5} step={0.01}
//                 value={settings.zoom}
//                 onChange={(e) => setSettings(s => ({ ...s, zoom: Number(e.target.value) }))}
//                 className="w-full"
//               />
//             </div>
//             <div>
//               <label className="block mb-1">Zoom Mode</label>
//               <select
//                 value={settings.zoomMode}
//                 onChange={(e) => setSettings(s => ({ ...s, zoomMode: e.target.value as PhotoSettings['zoomMode'] }))}
//                 className="border rounded px-2 py-1 w-full"
//               >
//                 <option value="constant">Constant</option>
//                 <option value="pulse">Pulse</option>
//               </select>
//             </div>
//           </div>

//           {settings.zoomMode === 'pulse' && (
//             <div>
//               <label className="block mb-1">Zoom Pulse Speed: {num(settings.zoomSpeed)}</label>
//               <input type="range" min={0} max={5} step={0.1}
//                 value={settings.zoomSpeed}
//                 onChange={(e) => setSettings(s => ({ ...s, zoomSpeed: Number(e.target.value) }))}
//                 className="w-full"
//               />
//             </div>
//           )}

//           {/* Overlay */}
//           <div className="grid grid-cols-2 gap-2">
//             <div>
//               <label className="block mb-1">Overlay Color</label>
//               <input
//                 type="color"
//                 value={normalizeHex6(settings.overlayColor)}
//                 onChange={(e) => setSettings(s => ({ ...s, overlayColor: normalizeHex6(e.target.value) }))}
//                 className="w-full h-8 p-0 border rounded"
//               />
//             </div>
//             <div>
//               <label className="block mb-1">Overlay Opacity: {Math.round(settings.overlayOpacity * 100)}%</label>
//               <input type="range" min={0} max={100} step={1}
//                 value={Math.round(settings.overlayOpacity * 100)}
//                 onChange={(e) => setSettings(s => ({ ...s, overlayOpacity: Number(e.target.value) / 100 }))}
//                 className="w-full"
//               />
//             </div>
//           </div>

//           <div className="grid grid-cols-2 gap-2">
//             <div>
//               <label className="block mb-1">Opacity Mode</label>
//               <select
//                 value={settings.overlayOpacityMode}
//                 onChange={(e) => setSettings(s => ({ ...s, overlayOpacityMode: e.target.value as PhotoSettings['overlayOpacityMode'] }))}
//                 className="border rounded px-2 py-1 w-full"
//               >
//                 <option value="constant">Constant</option>
//                 <option value="pulse">Pulse</option>
//               </select>
//             </div>
//             {settings.overlayOpacityMode === 'pulse' && (
//               <div>
//                 <label className="block mb-1">Opacity Pulse Speed: {num(settings.overlayOpacitySpeed)}</label>
//                 <input type="range" min={0} max={5} step={0.1}
//                   value={settings.overlayOpacitySpeed}
//                   onChange={(e) => setSettings(s => ({ ...s, overlayOpacitySpeed: Number(e.target.value) }))}
//                   className="w-full"
//                 />
//               </div>
//             )}
//           </div>
//         </div>
//       </Collapse>
//     </div>
//   );
// };

// export default ControlPanelPhoto;



// import React, { useState } from 'react';
// import { Collapse } from 'react-collapse';
// import type { PhotoSettings } from './PhotoAnimations';
// import { hexToRgba } from '../../utils/color';
// type Props = {
//   settings: PhotoSettings;
//   setSettings: React.Dispatch<React.SetStateAction<PhotoSettings>>;
//   startAnimation: () => void;
//   stopAnimation: () => void;
//   resetAnimation: () => void;
//   onLoadBuiltIn: () => Promise<void>;
// };
// // helper at top of file (or reuse your clampHex6)
// const normalizeHex6 = (hex: string) => {
//   if (!hex?.startsWith('#')) return '#000000';
//   if (hex.length === 7) return hex;           // #rrggbb
//   if (hex.length === 9) return '#' + hex.slice(1, 7); // drop alpha
//   return '#000000';
// };



// const ControlPanelPhoto: React.FC<Props> = ({
//   settings, setSettings, startAnimation, stopAnimation, resetAnimation, onLoadBuiltIn,
// }) => {
//   const [open, setOpen] = useState(true);
//   const num = (v: number, d = 2) => (Number.isFinite(v) ? v.toFixed(d) : '0');
//   const shuffle = () =>
//     setSettings(s => ({ ...s, shuffleKey: (s.shuffleKey || 0) + 1 }));

//   return (
//     <div className={`fixed right-4 top-2 p-4 rounded shadow-lg w-64 z-50 ${open ? 'bg-white/80 backdrop-blur' : ''}`}>
//       <button onClick={() => setOpen(!open)} className="mb-2 bg-gray-200 text-xs p-2 rounded w-full">
//         {open ? 'Collapse Controls' : 'Expand Controls'}
//       </button>

//       <Collapse isOpened={open}>
//         <div className="space-y-4 text-xs">
//           {/* Transport */}
//           <div className="grid grid-cols-2 gap-2">
//             <button onClick={startAnimation} className="bg-green-500 text-white p-2 rounded">Start</button>
//             <button onClick={stopAnimation}  className="bg-red-500 text-white p-2 rounded">Stop</button>
//             <button onClick={resetAnimation} className="bg-gray-500 text-white p-2 rounded">Reset</button>
//             <button onClick={shuffle}        className="bg-sky-500 text-white p-2 rounded">Shuffle</button>
//           </div>

//           {/* Built-in gallery */}
//           <div className="space-y-2">
//             <div className="font-semibold text-slate-700">Photos (built-in)</div>
//             <button onClick={onLoadBuiltIn} className="border p-1 rounded w-full">
//               Load from manifest.json
//             </button>
//             <div className="text-[11px] text-slate-600">Selected: {settings.urls.length}</div>
//           </div>

//           {/* Mode & timing */}
//           <div className="grid grid-cols-2 gap-2">
//             <div>
//               <label className="block mb-1">Mode</label>
//               <select
//                 value={settings.mode}
//                 onChange={(e) => setSettings(s => ({ ...s, mode: e.target.value as PhotoSettings['mode'] }))}
//                 className="border rounded px-2 py-1 w-full"
//               >
//                 <option value="kenburns">Ken Burns</option>
//                 <option value="slide">Slide</option>
//                 <option value="crossfade">Crossfade</option>
//               </select>
//             </div>
//             <div>
//               <label className="block mb-1">Fit</label>
//               <select
//                 value={settings.scaleMode}
//                 onChange={(e) => setSettings(s => ({ ...s, scaleMode: e.target.value as PhotoSettings['scaleMode'] }))}
//                 className="border rounded px-2 py-1 w-full"
//               >
//                 <option value="cover">Cover</option>
//                 <option value="contain">Contain</option>
//               </select>
//             </div>
//             <div>
//               <label className="block mb-1">Duration/photo: {num(settings.duration)}s</label>
//               <input type="range" min={1} max={20} step={0.25}
//                 value={settings.duration}
//                 onChange={(e) => setSettings(s => ({ ...s, duration: Number(e.target.value) }))}
//                 className="w-full"
//               />
//             </div>
//             <div>
//               <label className="block mb-1">Transition: {num(settings.transitionSeconds)}s</label>
//               <input type="range" min={0} max={6} step={0.1}
//                 value={settings.transitionSeconds}
//                 onChange={(e) => setSettings(s => ({ ...s, transitionSeconds: Number(e.target.value) }))}
//                 className="w-full"
//               />
//             </div>
//           </div>

//           {/* Motion */}
//           <div className="grid grid-cols-2 gap-2">
//             <div>
//               <label className="block mb-1">Direction</label>
//               <select
//                 value={settings.direction}
//                 onChange={(e) => setSettings(s => ({ ...s, direction: e.target.value as PhotoSettings['direction'] }))}
//                 className="border rounded px-2 py-1 w-full"
//               >
//                 <option value="static">Static</option>
//                 <option value="left">Left</option>
//                 <option value="right">Right</option>
//                 <option value="up">Up</option>
//                 <option value="down">Down</option>
//                 <option value="oscillateRightLeft">Oscillate L↔R</option>
//                 <option value="oscillateUpDown">Oscillate U↕D</option>
//                 <option value="circular">Circular</option>
//               </select>
//             </div>
//             <div>
//               <label className="block mb-1">Speed: {Math.round(settings.speed)}</label>
//               <input type="range" min={0} max={200} step={1}
//                 value={Number.isFinite(settings.speed) ? settings.speed : 50}
//                 onChange={(e) => setSettings(s => ({ ...s, speed: Number(e.target.value) }))}
//                 className="w-full"
//               />
//             </div>
//           </div>

//           {/* Zoom */}
//           <div className="grid grid-cols-2 gap-2">
//             <div>
//               <label className="block mb-1">Zoom: {num(settings.zoom)}×</label>
//               <input type="range" min={1} max={2.5} step={0.01}
//                 value={settings.zoom}
//                 onChange={(e) => setSettings(s => ({ ...s, zoom: Number(e.target.value) }))}
//                 className="w-full"
//               />
//             </div>
//             <div>
//               <label className="block mb-1">Zoom Mode</label>
//               <select
//                 value={settings.zoomMode}
//                 onChange={(e) => setSettings(s => ({ ...s, zoomMode: e.target.value as PhotoSettings['zoomMode'] }))}
//                 className="border rounded px-2 py-1 w-full"
//               >
//                 <option value="constant">Constant</option>
//                 <option value="pulse">Pulse</option>
//               </select>
//             </div>
//           </div>

//           {settings.zoomMode === 'pulse' && (
//             <div>
//               <label className="block mb-1">Zoom Pulse Speed: {num(settings.zoomSpeed)}</label>
//               <input type="range" min={0} max={5} step={0.1}
//                 value={settings.zoomSpeed}
//                 onChange={(e) => setSettings(s => ({ ...s, zoomSpeed: Number(e.target.value) }))}
//                 className="w-full"
//               />
//             </div>
//           )}

//           {/* Overlay */}
//           <div className="grid grid-cols-2 gap-2">
//             <div>
//               <label className="block mb-1">Overlay Color</label>
//             {/* // ...inside the render: */}
// <input
//   type="color"
//   value={normalizeHex6(settings.overlayColor)}
//   onChange={(e) =>
//     setSettings(s => ({ ...s, overlayColor: normalizeHex6(e.target.value) }))
//   }
//   className="w-full h-8 p-0 border rounded"
// />
//             </div>
//             <div>
//               <label className="block mb-1">Overlay Opacity: {Math.round(settings.overlayOpacity * 100)}%</label>
//               <input type="range" min={0} max={100} step={1}
//                 value={Math.round(settings.overlayOpacity * 100)}
//                 onChange={(e) => setSettings(s => ({ ...s, overlayOpacity: Number(e.target.value) / 100 }))}
//                 className="w-full"
//               />
//             </div>
//           </div>
//           <div className="grid grid-cols-2 gap-2">
//             <div>
//               <label className="block mb-1">Opacity Mode</label>
//               <select
//                 value={settings.overlayOpacityMode}
//                 onChange={(e) => setSettings(s => ({ ...s, overlayOpacityMode: e.target.value as PhotoSettings['overlayOpacityMode'] }))}
//                 className="border rounded px-2 py-1 w-full"
//               >
//                 <option value="constant">Constant</option>
//                 <option value="pulse">Pulse</option>
//               </select>
//             </div>
//             {settings.overlayOpacityMode === 'pulse' && (
//               <div>
//                 <label className="block mb-1">Opacity Pulse Speed: {num(settings.overlayOpacitySpeed)}</label>
//                 <input type="range" min={0} max={5} step={0.1}
//                   value={settings.overlayOpacitySpeed}
//                   onChange={(e) => setSettings(s => ({ ...s, overlayOpacitySpeed: Number(e.target.value) }))}
//                   className="w-full"
//                 />
//               </div>
//             )}
//           </div>
//         </div>
//       </Collapse>
//     </div>
//   );
// };

// export default ControlPanelPhoto;


// // src/components/Therapy/ControlPanelPhoto.tsx
// import React, { useState } from 'react';
// import { Collapse } from 'react-collapse';
// import type { PhotoSettings } from './PhotoAnimations';

// type Props = {
//   settings: PhotoSettings;
//   setSettings: React.Dispatch<React.SetStateAction<PhotoSettings>>;
//   startAnimation: () => void;
//   stopAnimation: () => void;
//   resetAnimation: () => void;
//   onLoadBuiltIn: () => Promise<void>;
// };

// const ControlPanelPhoto: React.FC<Props> = ({
//   settings, setSettings, startAnimation, stopAnimation, resetAnimation, onLoadBuiltIn,
// }) => {
//   const [isOpen, setIsOpen] = useState(true);
//   const num = (v: number, d = 2) => (Number.isFinite(v) ? v.toFixed(d) : '0');
//   const shuffle = () => setSettings(s => ({ ...s, shuffleKey: (s.shuffleKey || 0) + 1 }));

//   return (
//     <div className={`fixed right-4 top-2 p-4 rounded shadow-lg w-64 z-50 ${isOpen ? 'bg-white/80 backdrop-blur' : ''}`}>
//       <button onClick={() => setIsOpen(!isOpen)} className="mb-2 bg-gray-200 text-xs p-2 rounded w-full">
//         {isOpen ? 'Collapse Controls' : 'Expand Controls'}
//       </button>

//       <Collapse isOpened={isOpen}>
//         <div className="space-y-4 text-xs">
//           {/* Transport */}
//           <div className="grid grid-cols-2 gap-2">
//             <button onClick={startAnimation} className="bg-green-500 text-white p-2 rounded">Start</button>
//             <button onClick={stopAnimation}  className="bg-red-500 text-white p-2 rounded">Stop</button>
//             <button onClick={resetAnimation} className="bg-gray-500 text-white p-2 rounded">Reset</button>
//             <button onClick={shuffle}        className="bg-sky-500 text-white p-2 rounded">Shuffle</button>
//           </div>

//           {/* Built-in gallery */}
//           <div className="space-y-2">
//             <div className="font-semibold text-slate-700">Photos (built-in)</div>
//             <button onClick={onLoadBuiltIn} className="border p-1 rounded w-full">Load from manifest.json</button>
//             <div className="text-[11px] text-slate-600">Selected: {settings.urls.length}</div>
//           </div>

//           {/* Mode & timing */}
//           <div className="grid grid-cols-2 gap-2">
//             <div>
//               <label className="block mb-1">Mode</label>
//               <select
//                 value={settings.mode}
//                 onChange={(e) => setSettings(s => ({ ...s, mode: e.target.value as PhotoSettings['mode'] }))}
//                 className="border rounded px-2 py-1 w-full"
//               >
//                 <option value="kenburns">Ken Burns</option>
//                 <option value="slide">Slide</option>
//                 <option value="crossfade">Crossfade</option>
//               </select>
//             </div>
//             <div>
//               <label className="block mb-1">Fit</label>
//               <select
//                 value={settings.scaleMode}
//                 onChange={(e) => setSettings(s => ({ ...s, scaleMode: e.target.value as PhotoSettings['scaleMode'] }))}
//                 className="border rounded px-2 py-1 w-full"
//               >
//                 <option value="cover">Cover</option>
//                 <option value="contain">Contain</option>
//               </select>
//             </div>
//             <div>
//               <label className="block mb-1">Duration/photo: {num(settings.duration)}s</label>
//               <input type="range" min={1} max={20} step={0.25}
//                 value={settings.duration}
//                 onChange={(e) => setSettings(s => ({ ...s, duration: Number(e.target.value) }))}
//                 className="w-full"
//               />
//             </div>
//             <div>
//               <label className="block mb-1">Transition: {num(settings.transitionSeconds)}s</label>
//               <input type="range" min={0} max={6} step={0.1}
//                 value={settings.transitionSeconds}
//                 onChange={(e) => setSettings(s => ({ ...s, transitionSeconds: Number(e.target.value) }))}
//                 className="w-full"
//               />
//             </div>
//           </div>

//           {/* Motion */}
//           <div className="grid grid-cols-2 gap-2">
//             <div>
//               <label className="block mb-1">Direction</label>
//               <select
//                 value={settings.direction}
//                 onChange={(e) => setSettings(s => ({ ...s, direction: e.target.value as PhotoSettings['direction'] }))}
//                 className="border rounded px-2 py-1 w-full"
//               >
//                 <option value="static">Static</option>
//                 <option value="left">Left</option>
//                 <option value="right">Right</option>
//                 <option value="up">Up</option>
//                 <option value="down">Down</option>
//                 <option value="oscillateRightLeft">Oscillate L↔R</option>
//                 <option value="oscillateUpDown">Oscillate U↕D</option>
//                 <option value="circular">Circular</option>
//               </select>
//             </div>
//             <div>
//               <label className="block mb-1">Speed: {Math.round(settings.speed)}</label>
//               <input type="range" min={0} max={200} step={1}
//                 value={Number.isFinite(settings.speed) ? settings.speed : 50}
//                 onChange={(e) => setSettings(s => ({ ...s, speed: Number(e.target.value) }))}
//                 className="w-full"
//               />
//             </div>
//           </div>

//           {/* Zoom */}
//           <div className="grid grid-cols-2 gap-2">
//             <div>
//               <label className="block mb-1">Zoom: {num(settings.zoom)}×</label>
//               <input type="range" min={1} max={2.5} step={0.01}
//                 value={settings.zoom}
//                 onChange={(e) => setSettings(s => ({ ...s, zoom: Number(e.target.value) }))}
//                 className="w-full"
//               />
//             </div>
//             <div>
//               <label className="block mb-1">Zoom Mode</label>
//               <select
//                 value={settings.zoomMode}
//                 onChange={(e) => setSettings(s => ({ ...s, zoomMode: e.target.value as PhotoSettings['zoomMode'] }))}
//                 className="border rounded px-2 py-1 w-full"
//               >
//                 <option value="constant">Constant</option>
//                 <option value="pulse">Pulse</option>
//               </select>
//             </div>
//           </div>

//           {settings.zoomMode === 'pulse' && (
//             <div>
//               <label className="block mb-1">Zoom Pulse Speed: {num(settings.zoomSpeed)}</label>
//               <input type="range" min={0} max={5} step={0.1}
//                 value={settings.zoomSpeed}
//                 onChange={(e) => setSettings(s => ({ ...s, zoomSpeed: Number(e.target.value) }))}
//                 className="w-full"
//               />
//             </div>
//           )}

//           {/* Overlay */}
//           <div className="grid grid-cols-2 gap-2">
//             <div>
//               <label className="block mb-1">Overlay Color</label>
//               <input type="color"
//                 value={settings.overlayColor}
//                 onChange={(e) => setSettings(s => ({ ...s, overlayColor: e.target.value }))}
//                 className="w-full h-8 p-0 border rounded"
//               />
//             </div>
//             <div>
//               <label className="block mb-1">Overlay Opacity: {Math.round(settings.overlayOpacity * 100)}%</label>
//               <input type="range" min={0} max={100} step={1}
//                 value={Math.round(settings.overlayOpacity * 100)}
//                 onChange={(e) => setSettings(s => ({ ...s, overlayOpacity: Number(e.target.value) / 100 }))}
//                 className="w-full"
//               />
//             </div>
//           </div>
//           <div className="grid grid-cols-2 gap-2">
//             <div>
//               <label className="block mb-1">Opacity Mode</label>
//               <select
//                 value={settings.overlayOpacityMode}
//                 onChange={(e) => setSettings(s => ({ ...s, overlayOpacityMode: e.target.value as PhotoSettings['overlayOpacityMode'] }))}
//                 className="border rounded px-2 py-1 w-full"
//               >
//                 <option value="constant">Constant</option>
//                 <option value="pulse">Pulse</option>
//               </select>
//             </div>
//             {settings.overlayOpacityMode === 'pulse' && (
//               <div>
//                 <label className="block mb-1">Opacity Pulse Speed: {num(settings.overlayOpacitySpeed)}</label>
//                 <input type="range" min={0} max={5} step={0.1}
//                   value={settings.overlayOpacitySpeed}
//                   onChange={(e) => setSettings(s => ({ ...s, overlayOpacitySpeed: Number(e.target.value) }))}
//                   className="w-full"
//                 />
//               </div>
//             )}
//           </div>
//         </div>
//       </Collapse>
//     </div>
//   );
// };

// export default ControlPanelPhoto;




// // src/components/Therapy/ControlPanelPhoto.tsx
// import React, { useEffect, useMemo, useState } from 'react';
// import { Collapse } from 'react-collapse';
// import { db, storage } from '../../firebase/firebase';
// import { useAuth } from '../../data/AuthContext';
// import {
//   doc,
//   getDoc,
//   setDoc,
//   getDocs,
//   deleteDoc,
//   collection,
// } from 'firebase/firestore';
// import {
//   ref as storageRef,
//   listAll,
//   getDownloadURL,
//   uploadBytes,
// } from 'firebase/storage';
// import Papa from 'papaparse';
// import type { PhotoSettings } from './PhotoAnimations';

// type Msg = { message: string; type: 'success' | 'error' | '' };

// type Props = {
//   settings: PhotoSettings;
//   setSettings: React.Dispatch<React.SetStateAction<PhotoSettings>>;
//   startAnimation: () => void;
//   stopAnimation: () => void;
//   resetAnimation: () => void;
// };

// const ControlPanelPhoto: React.FC<Props> = ({
//   settings,
//   setSettings,
//   startAnimation,
//   stopAnimation,
//   resetAnimation,
// }) => {
//   const [isOpen, setIsOpen] = useState(true);
//   const [msg, setMsg] = useState<Msg>({ message: '', type: '' });
//   const [busy, setBusy] = useState(false);

//   const [presetName, setPresetName] = useState('');
//   const [presets, setPresets] = useState<string[]>([]);

//   const { currentUser } = useAuth();
//   const uid = currentUser?.uid;

//   // Storage bases
//   const sharedBaseRef = useMemo(() => storageRef(storage, 'photos/'), []);
//   const myBaseRef = useMemo(
//     () => (uid ? storageRef(storage, `users/${uid}/photo-library/`) : null),
//     [uid]
//   );

//   // -------- helpers --------
//   const say = (message: string, type: Msg['type'] = '') =>
//     setMsg({ message, type });

//   const num = (v: number, digits = 2) =>
//     Number.isFinite(v) ? v.toFixed(digits) : '0';

//   // keep color input 6-digit (#rrggbb)
//   const clampHex6 = (hex: string) =>
//     /^#([0-9a-fA-F]{6})$/.test(hex)
//       ? hex
//       : (() => {
//           const m = hex.match(/^#([0-9a-fA-F]{6})[0-9a-fA-F]{2}$/);
//           return m ? `#${m[1]}` : '#000000';
//         })();

//   // -------- presets (mirror shape/color modules) --------
//   const collPath = uid
//     ? `users/${uid}/photo-animation-settings`
//     : undefined;

//   const listPresets = async () => {
//     if (!collPath) return setPresets([]);
//     try {
//       const snap = await getDocs(collection(db, collPath));
//       const names = snap.docs.map((d) => d.id).filter((id) => id !== 'current');
//       names.sort();
//       setPresets(names);
//     } catch (e) {
//       console.error(e);
//     }
//   };

//   useEffect(() => {
//     listPresets();
//   }, [uid]);

//   const savePreset = async () => {
//     if (!uid || !presetName.trim()) {
//       return say('Enter a name first.', 'error');
//     }
//     const name = presetName.trim();
//     const payload = {
//       ...settings,
//       presetName: name,
//       userId: uid,
//       timestamp: new Date().toISOString(),
//     };

//     try {
//       // Firestore
//       await setDoc(doc(db, `users/${uid}/photo-animation-settings/${name}`), payload);

//       // CSV to Storage (same folder naming as others)
//       const csv = Papa.unparse(
//         Object.entries(payload).map(([k, v]) => ({
//           setting: k,
//           value: Array.isArray(v) ? JSON.stringify(v) : String(v),
//         }))
//       );
//       await uploadBytes(
//         storageRef(storage, `users/${uid}/photo-animation-settings/${name}.csv`),
//         new Blob([csv], { type: 'text/csv' })
//       );

//       if (!presets.includes(name)) setPresets((ps) => [...ps, name].sort());
//       say('Preset saved!', 'success');
//     } catch (e) {
//       console.error(e);
//       say('Failed to save preset.', 'error');
//     }
//   };

//   const loadPreset = async () => {
//     if (!uid || !presetName.trim()) {
//       return say('Select a preset first.', 'error');
//     }
//     try {
//       const snap = await getDoc(
//         doc(db, `users/${uid}/photo-animation-settings/${presetName.trim()}`)
//       );
//       if (!snap.exists()) {
//         say('Preset not found.', 'error');
//       } else {
//         const d = snap.data() as Partial<PhotoSettings>;
//         // conservative merge like your other panels
//         setSettings((s) => ({
//           ...s,
//           mode:
//             (['kenburns', 'slide', 'crossfade'] as const).includes(
//               d.mode as any
//             ) ? (d.mode as any) : s.mode,
//           direction:
//             (
//               [
//                 'static',
//                 'left',
//                 'right',
//                 'up',
//                 'down',
//                 'oscillateRightLeft',
//                 'oscillateUpDown',
//                 'circular',
//               ] as const
//             ).includes(d.direction as any)
//               ? (d.direction as any)
//               : s.direction,
//           scaleMode:
//             (['cover', 'contain'] as const).includes(d.scaleMode as any)
//               ? (d.scaleMode as any)
//               : s.scaleMode,
//           duration: typeof d.duration === 'number' ? d.duration : s.duration,
//           transitionSeconds:
//             typeof d.transitionSeconds === 'number'
//               ? d.transitionSeconds
//               : s.transitionSeconds,
//           speed: typeof d.speed === 'number' ? d.speed : s.speed,
//           zoom: typeof d.zoom === 'number' ? d.zoom : s.zoom,
//           zoomMode:
//             (['constant', 'pulse'] as const).includes(d.zoomMode as any)
//               ? (d.zoomMode as any)
//               : s.zoomMode,
//           zoomSpeed:
//             typeof d.zoomSpeed === 'number' ? d.zoomSpeed : s.zoomSpeed,
//           overlayColor:
//             typeof d.overlayColor === 'string'
//               ? clampHex6(d.overlayColor)
//               : s.overlayColor,
//           overlayOpacity:
//             typeof d.overlayOpacity === 'number'
//               ? d.overlayOpacity
//               : s.overlayOpacity,
//           overlayOpacityMode:
//             (['constant', 'pulse'] as const).includes(
//               d.overlayOpacityMode as any
//             )
//               ? (d.overlayOpacityMode as any)
//               : s.overlayOpacityMode,
//           overlayOpacitySpeed:
//             typeof d.overlayOpacitySpeed === 'number'
//               ? d.overlayOpacitySpeed
//               : s.overlayOpacitySpeed,
//           urls: Array.isArray(d.urls) ? d.urls : s.urls,
//           shuffleKey:
//             typeof d.shuffleKey === 'number' ? d.shuffleKey : s.shuffleKey,
//         }));
//         say('Preset loaded!', 'success');
//       }
//     } catch (e) {
//       console.error(e);
//       say('Failed to load preset.', 'error');
//     }
//   };

//   const deletePreset = async (name: string) => {
//     if (!uid) return;
//     if (!confirm(`Delete “${name}”?`)) return;
//     try {
//       await deleteDoc(doc(db, `users/${uid}/photo-animation-settings/${name}`));
//       setPresets((ps) => ps.filter((p) => p !== name));
//     } catch (e) {
//       console.error(e);
//       say('Failed to delete preset.', 'error');
//     }
//   };

//   // Save current (like your other panels, useful for resume)
//   const saveCurrent = async () => {
//     if (!uid) return say('Sign in first.', 'error');
//     try {
//       await setDoc(
//         doc(db, `users/${uid}/photo-animation-settings/current`),
//         { ...settings, userId: uid, timestamp: new Date().toISOString() },
//         { merge: true }
//       );
//       say('Current saved.', 'success');
//     } catch (e) {
//       console.error(e);
//       say('Failed to save current.', 'error');
//     }
//   };

//   const loadCurrent = async () => {
//     if (!uid) return say('Sign in first.', 'error');
//     try {
//       const snap = await getDoc(
//         doc(db, `users/${uid}/photo-animation-settings/current`)
//       );
//       if (snap.exists()) {
//         const d = snap.data() as Partial<PhotoSettings>;
//         setSettings((s) => ({ ...s, ...d }));
//         say('Current loaded.', 'success');
//       } else {
//         say('No current saved.', 'error');
//       }
//     } catch (e) {
//       console.error(e);
//       say('Failed to load current.', 'error');
//     }
//   };

//   // -------- photos: shared + personal (Storage) --------
//   const addLocalFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = Array.from(e.target.files || []);
//     e.target.value = '';
//     if (!files.length) return;
//     const urls = files.map((f) => URL.createObjectURL(f));
//     setSettings((s) => ({ ...s, urls: [...s.urls, ...urls] }));
//     say(`Added ${files.length} local file(s) for preview.`);
//   };

//   const uploadToMyFolder = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (!uid) return say('Sign in to upload to your folder.', 'error');
//     const files = Array.from(e.target.files || []);
//     e.target.value = '';
//     if (!files.length) return;
//     setBusy(true);
//     try {
//       for (const f of files) {
//         const path = `users/${uid}/photo-library/${Date.now()}_${Math.random()
//           .toString(36)
//           .slice(2)}_${f.name}`;
//         await uploadBytes(storageRef(storage, path), f);
//       }
//       say(`Uploaded ${files.length} image(s) to your folder.`, 'success');
//     } catch (err) {
//       console.error(err);
//       say('Upload failed.', 'error');
//     } finally {
//       setBusy(false);
//     }
//   };

//   const uploadToShared = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = Array.from(e.target.files || []);
//     e.target.value = '';
//     if (!files.length) return;
//     setBusy(true);
//     try {
//       for (const f of files) {
//         const path = `photos/${Date.now()}_${Math.random()
//           .toString(36)
//           .slice(2)}_${f.name}`;
//         await uploadBytes(storageRef(storage, path), f);
//       }
//       say(`Uploaded ${files.length} image(s) to shared.`, 'success');
//     } catch (err) {
//       console.error(err);
//       say('Shared upload failed.', 'error');
//     } finally {
//       setBusy(false);
//     }
//   };

//   const loadFromShared = async () => {
//     setBusy(true);
//     try {
//       const res = await listAll(sharedBaseRef);
//       const items = res.items.filter((i) =>
//         /\.(png|jpe?g|gif|webp|bmp|heic|heif|svg)$/i.test(i.name)
//       );
//       const urls = await Promise.all(items.map((i) => getDownloadURL(i)));
//       setSettings((s) => ({ ...s, urls }));
//       say(`Loaded ${urls.length} shared photo(s).`, 'success');
//     } catch (err) {
//       console.error(err);
//       say('Failed to load from shared.', 'error');
//     } finally {
//       setBusy(false);
//     }
//   };

//   const loadFromMine = async () => {
//     if (!myBaseRef) return say('Sign in to load your folder.', 'error');
//     setBusy(true);
//     try {
//       const res = await listAll(myBaseRef);
//       const items = res.items.filter((i) =>
//         /\.(png|jpe?g|gif|webp|bmp|heic|heif|svg)$/i.test(i.name)
//       );
//       const urls = await Promise.all(items.map((i) => getDownloadURL(i)));
//       setSettings((s) => ({ ...s, urls }));
//       say(`Loaded ${urls.length} personal photo(s).`, 'success');
//     } catch (err) {
//       console.error(err);
//       say('Failed to load your folder.', 'error');
//     } finally {
//       setBusy(false);
//     }
//   };

//   const shuffle = () =>
//     setSettings((s) => ({ ...s, shuffleKey: (s.shuffleKey || 0) + 1 }));

//   // -------- render --------
//   const Disabled = busy ? 'opacity-60 pointer-events-none' : '';

//   return (
//     <div
//       className={`fixed right-4 top-2 p-4 rounded shadow-lg w-64 z-50 ${
//         isOpen ? 'bg-white/80 backdrop-blur' : ''
//       }`}
//     >
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="mb-2 bg-gray-200 text-xs p-2 rounded w-full"
//       >
//         {isOpen ? 'Collapse Controls' : 'Expand Controls'}
//       </button>

//       <Collapse isOpened={isOpen}>
//         <div className={`space-y-4 text-xs ${Disabled}`}>
//           {/* Transport */}
//           <div className="grid grid-cols-2 gap-2">
//             <button onClick={startAnimation} className="bg-green-500 text-white p-2 rounded">
//               Start
//             </button>
//             <button onClick={stopAnimation} className="bg-red-500 text-white p-2 rounded">
//               Stop
//             </button>
//             <button onClick={resetAnimation} className="bg-gray-500 text-white p-2 rounded">
//               Reset
//             </button>
//             <button onClick={shuffle} className="bg-sky-500 text-white p-2 rounded">
//               Shuffle
//             </button>
//           </div>

//           {/* Sources */}
//           <div className="space-y-2">
//             <div>
//               <label className="block mb-1">Add local (no upload)</label>
//               <input type="file" accept="image/*" multiple onChange={addLocalFiles} className="w-full text-[11px]" />
//             </div>

//             <div className="grid grid-cols-2 gap-2">
//               <button onClick={loadFromShared} className="border p-1 rounded">
//                 Load Shared (photos/)
//               </button>
//               <button onClick={loadFromMine} className="border p-1 rounded">
//                 Load Mine
//               </button>
//             </div>

//             <div className="pt-2 border-t space-y-2">
//               <label className="block">Upload to my library</label>
//               <input type="file" accept="image/*" multiple onChange={uploadToMyFolder} className="w-full text-[11px]" />
//               <label className="block mt-2">Upload to shared (photos/)</label>
//               <input type="file" accept="image/*" multiple onChange={uploadToShared} className="w-full text-[11px]" />
//             </div>
//           </div>

//           {/* Mode & timing */}
//           <div className="grid grid-cols-2 gap-2">
//             <div>
//               <label className="block mb-1">Mode</label>
//               <select
//                 value={settings.mode}
//                 onChange={(e) =>
//                   setSettings((s) => ({ ...s, mode: e.target.value as PhotoSettings['mode'] }))
//                 }
//                 className="border rounded px-2 py-1 w-full"
//               >
//                 <option value="kenburns">Ken Burns</option>
//                 <option value="slide">Slide</option>
//                 <option value="crossfade">Crossfade</option>
//               </select>
//             </div>
//             <div>
//               <label className="block mb-1">Fit</label>
//               <select
//                 value={settings.scaleMode}
//                 onChange={(e) =>
//                   setSettings((s) => ({ ...s, scaleMode: e.target.value as PhotoSettings['scaleMode'] }))
//                 }
//                 className="border rounded px-2 py-1 w-full"
//               >
//                 <option value="cover">Cover</option>
//                 <option value="contain">Contain</option>
//               </select>
//             </div>
//             <div>
//               <label className="block mb-1">Duration/photo: {num(settings.duration)}s</label>
//               <input
//                 type="range"
//                 min={1}
//                 max={20}
//                 step={0.25}
//                 value={settings.duration}
//                 onChange={(e) => setSettings((s) => ({ ...s, duration: Number(e.target.value) }))}
//                 className="w-full"
//               />
//             </div>
//             <div>
//               <label className="block mb-1">Transition: {num(settings.transitionSeconds)}s</label>
//               <input
//                 type="range"
//                 min={0}
//                 max={6}
//                 step={0.1}
//                 value={settings.transitionSeconds}
//                 onChange={(e) =>
//                   setSettings((s) => ({ ...s, transitionSeconds: Number(e.target.value) }))
//                 }
//                 className="w-full"
//               />
//             </div>
//           </div>

//           {/* Motion */}
//           <div className="grid grid-cols-2 gap-2">
//             <div>
//               <label className="block mb-1">Direction</label>
//               <select
//                 value={settings.direction}
//                 onChange={(e) =>
//                   setSettings((s) => ({ ...s, direction: e.target.value as PhotoSettings['direction'] }))
//                 }
//                 className="border rounded px-2 py-1 w-full"
//               >
//                 <option value="static">Static</option>
//                 <option value="left">Left</option>
//                 <option value="right">Right</option>
//                 <option value="up">Up</option>
//                 <option value="down">Down</option>
//                 <option value="oscillateRightLeft">Oscillate L↔R</option>
//                 <option value="oscillateUpDown">Oscillate U↕D</option>
//                 <option value="circular">Circular</option>
//               </select>
//             </div>
//             <div>
//               <label className="block mb-1">Speed: {Math.round(settings.speed)}</label>
//               <input
//                 type="range"
//                 min={0}
//                 max={200}
//                 step={1}
//                 value={Number.isFinite(settings.speed) ? settings.speed : 50}
//                 onChange={(e) => setSettings((s) => ({ ...s, speed: Number(e.target.value) }))}
//                 className="w-full"
//               />
//             </div>
//           </div>

//           {/* Zoom */}
//           <div className="grid grid-cols-2 gap-2">
//             <div>
//               <label className="block mb-1">Zoom: {num(settings.zoom)}×</label>
//               <input
//                 type="range"
//                 min={1}
//                 max={2.5}
//                 step={0.01}
//                 value={settings.zoom}
//                 onChange={(e) => setSettings((s) => ({ ...s, zoom: Number(e.target.value) }))}
//                 className="w-full"
//               />
//             </div>
//             <div>
//               <label className="block mb-1">Zoom Mode</label>
//               <select
//                 value={settings.zoomMode}
//                 onChange={(e) =>
//                   setSettings((s) => ({ ...s, zoomMode: e.target.value as PhotoSettings['zoomMode'] }))
//                 }
//                 className="border rounded px-2 py-1 w-full"
//               >
//                 <option value="constant">Constant</option>
//                 <option value="pulse">Pulse</option>
//               </select>
//             </div>
//           </div>

//           {settings.zoomMode === 'pulse' && (
//             <div>
//               <label className="block mb-1">Zoom Pulse Speed: {num(settings.zoomSpeed)}</label>
//               <input
//                 type="range"
//                 min={0}
//                 max={5}
//                 step={0.1}
//                 value={settings.zoomSpeed}
//                 onChange={(e) => setSettings((s) => ({ ...s, zoomSpeed: Number(e.target.value) }))}
//                 className="w-full"
//               />
//             </div>
//           )}

//           {/* Overlay */}
//           <div className="grid grid-cols-2 gap-2">
//             <div>
//               <label className="block mb-1">Overlay Color</label>
//               <input
//                 type="color"
//                 value={clampHex6(settings.overlayColor)}
//                 onChange={(e) => setSettings((s) => ({ ...s, overlayColor: clampHex6(e.target.value) }))}
//                 className="w-full h-8 p-0 border rounded"
//               />
//             </div>
//             <div>
//               <label className="block mb-1">
//                 Overlay Opacity: {Math.round(settings.overlayOpacity * 100)}%
//               </label>
//               <input
//                 type="range"
//                 min={0}
//                 max={100}
//                 step={1}
//                 value={Math.round(settings.overlayOpacity * 100)}
//                 onChange={(e) =>
//                   setSettings((s) => ({ ...s, overlayOpacity: Number(e.target.value) / 100 }))
//                 }
//                 className="w-full"
//               />
//             </div>
//           </div>
//           <div className="grid grid-cols-2 gap-2">
//             <div>
//               <label className="block mb-1">Overlay Mode</label>
//               <select
//                 value={settings.overlayOpacityMode}
//                 onChange={(e) =>
//                   setSettings((s) => ({
//                     ...s,
//                     overlayOpacityMode: e.target.value as PhotoSettings['overlayOpacityMode'],
//                   }))
//                 }
//                 className="border rounded px-2 py-1 w-full"
//               >
//                 <option value="constant">Constant</option>
//                 <option value="pulse">Pulse</option>
//               </select>
//             </div>
//             {settings.overlayOpacityMode === 'pulse' && (
//               <div>
//                 <label className="block mb-1">
//                   Overlay Pulse Speed: {num(settings.overlayOpacitySpeed)}
//                 </label>
//                 <input
//                   type="range"
//                   min={0}
//                   max={5}
//                   step={0.1}
//                   value={settings.overlayOpacitySpeed}
//                   onChange={(e) =>
//                     setSettings((s) => ({ ...s, overlayOpacitySpeed: Number(e.target.value) }))
//                   }
//                   className="w-full"
//                 />
//               </div>
//             )}
//           </div>

//           {/* Presets */}
//           <div className="pt-2 border-t space-y-2">
//             <div className="font-semibold text-slate-700">Presets</div>
//             <div className="flex gap-2">
//               <input
//                 className="border rounded px-2 py-1 text-[12px] w-full"
//                 placeholder="Preset name"
//                 value={presetName}
//                 onChange={(e) => setPresetName(e.target.value)}
//               />
//               <button onClick={savePreset} className="border rounded px-2 text-[12px]">
//                 Save
//               </button>
//               <button onClick={loadPreset} className="border rounded px-2 text-[12px]">
//                 Load
//               </button>
//             </div>
//             <div className="text-[11px] text-slate-600">My presets</div>
//             <div className="space-y-1 max-h-40 overflow-auto pr-1">
//               {presets.length === 0 && <div className="text-slate-500">None</div>}
//               {presets.map((n) => (
//                 <div key={n} className="flex items-center justify-between gap-2">
//                   <button
//                     onClick={() => setPresetName(n)}
//                     className="underline decoration-dotted truncate text-left"
//                     title={n}
//                   >
//                     {n}
//                   </button>
//                   <button
//                     onClick={() => deletePreset(n)}
//                     className="border rounded px-2 text-[11px]"
//                   >
//                     Del
//                   </button>
//                 </div>
//               ))}
//             </div>

//             <div className="grid grid-cols-2 gap-2 pt-2 border-t">
//               <button onClick={saveCurrent} className="border rounded px-2 text-[12px]">
//                 Save Current
//               </button>
//               <button onClick={loadCurrent} className="border rounded px-2 text-[12px]">
//                 Load Current
//               </button>
//             </div>
//           </div>

//           {/* inline msg */}
//           {!!msg.message && (
//             <div
//               className={`px-2 py-1 rounded text-[11px] ${
//                 msg.type === 'error' ? 'bg-rose-50 text-rose-700' : 'bg-white/70'
//               }`}
//             >
//               {msg.message}
//             </div>
//           )}
//         </div>
//       </Collapse>
//     </div>
//   );
// };

// export default ControlPanelPhoto;





// // src/components/Therapy/ControlPanelPhoto.tsx
// import React, { useEffect, useState } from 'react';
// import { useAuth } from '../../data/AuthContext';
// import { db, storage } from '../../firebase/firebase';
// import {
//   doc, getDoc, setDoc, deleteDoc, getDocs, collection, serverTimestamp,
// } from 'firebase/firestore';
// import {
//   ref as storageRef, listAll, getDownloadURL, uploadBytes,
// } from 'firebase/storage';
// import { getAuth } from 'firebase/auth';
// import type { PhotoSettings } from './PhotoAnimations';

// type Props = {
//   settings: PhotoSettings;
//   setSettings: React.Dispatch<React.SetStateAction<PhotoSettings>>;
//   isAnimating: boolean;
//   startAnimation: () => void;
//   stopAnimation: () => void;
//   resetAnimation: () => void;
// };

// // UI helpers
// const smallBtn = 'h-7 px-2.5 text-[11px] rounded border shadow-sm focus:outline-none focus:ring-2 ring-offset-1';
// const btnPrimary = 'bg-sky-500 border border-sky-500 text-white hover:bg-sky-600 focus:ring-sky-300';
// const btnSubtle  = 'bg-white/80 border border-slate-300 text-slate-700 hover:bg-white';
// const btnGreen   = 'bg-emerald-500 border border-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-300';
// const btnDanger  = 'bg-rose-500 border border-rose-500 text-white hover:bg-rose-600 focus:ring-rose-300';

// const sanitizeName = (s: string) =>
//   s.trim().toLowerCase().replace(/[^a-z0-9-_ ]/g, '').replace(/\s+/g, '-').slice(0, 48) || 'untitled';

// const ControlPanelPhoto: React.FC<Props> = ({
//   settings, setSettings,
//   isAnimating, startAnimation, stopAnimation, resetAnimation,
// }) => {
//   const [open, setOpen] = useState(true);
//   const [busy, setBusy] = useState(false);
//   const [presetName, setPresetName] = useState('');
//   const [myPresets, setMyPresets] = useState<string[]>([]);
//   const [sharedPresets, setSharedPresets] = useState<string[]>([]);
//   const [currentPaths, setCurrentPaths] = useState<string[]>([]); // tracks Storage paths of the *current* selection
//   const [isAdmin, setIsAdmin] = useState(false);

//   const { currentUser } = useAuth();
//   const uid = currentUser?.uid ?? null;

//   // Check admin custom claim
//   useEffect(() => {
//     (async () => {
//       const token = await getAuth().currentUser?.getIdTokenResult();
//       setIsAdmin(!!token?.claims?.admin);
//     })();
//   }, [uid]);

//   const toast = (m: string) => alert(m);

//   // ---------------- IMAGE SOURCES ----------------
//   // Local preview (no upload): paths unknown => cannot save as “selection”
//   const onFilesLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = Array.from(e.target.files || []);
//     if (!files.length) return;
//     const urls = files.map((f) => URL.createObjectURL(f));
//     setSettings((s) => ({ ...s, urls: [...s.urls, ...urls] }));
//     setCurrentPaths([]); // unknown paths
//     e.target.value = '';
//   };

//   // Upload to user's library, then reload their folder
//   const uploadToMine = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (!uid) return toast('Sign in first.');
//     const files = Array.from(e.target.files || []);
//     if (!files.length) return;
//     setBusy(true);
//     try {
//       for (const f of files) {
//         const path = `users/${uid}/photo-library/${Date.now()}_${Math.random().toString(36).slice(2)}_${f.name}`;
//         await uploadBytes(storageRef(storage, path), f);
//       }
//       await loadFromMyFolder(); // refresh selection & paths
//       toast(`Uploaded ${files.length} image(s).`);
//     } catch (err) {
//       console.error(err);
//       toast('Upload failed.');
//     } finally {
//       e.target.value = '';
//       setBusy(false);
//     }
//   };

//   // Admin-only upload to shared library
//   const uploadToShared = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (!isAdmin) {
//       e.target.value = '';
//       return toast('Only admins can upload to the shared library.');
//     }
//     const files = Array.from(e.target.files || []);
//     if (!files.length) return;
//     setBusy(true);
//     try {
//       for (const f of files) {
//         const path = `photos/${Date.now()}_${Math.random().toString(36).slice(2)}_${f.name}`;
//         await uploadBytes(storageRef(storage, path), f);
//       }
//       await loadFromSharedFolder(); // refresh selection & paths
//       toast(`Uploaded ${files.length} image(s) to shared.`);
//     } catch (err) {
//       console.error(err);
//       toast('Shared upload failed.');
//     } finally {
//       e.target.value = '';
//       setBusy(false);
//     }
//   };

//   // Load shared library (photos/)
//   const loadFromSharedFolder = async () => {
//     setBusy(true);
//     try {
//       const base = storageRef(storage, 'photos/');
//       const res = await listAll(base);
//       const imageItems = res.items.filter(i => /\.(png|jpe?g|gif|webp|bmp|heic|heif|svg)$/i.test(i.name));
//       const urls = await Promise.all(imageItems.map(i => getDownloadURL(i)));
//       const paths = imageItems.map(i => i.fullPath);
//       setSettings(s => ({ ...s, urls }));
//       setCurrentPaths(paths);
//       toast(`Loaded ${urls.length} shared photo(s).`);
//     } catch (err) {
//       console.error(err);
//       toast('Failed to load shared folder.');
//     } finally {
//       setBusy(false);
//     }
//   };

//   // Load user library
//   const loadFromMyFolder = async () => {
//     if (!uid) return toast('Sign in to load your folder.');
//     setBusy(true);
//     try {
//       const base = storageRef(storage, `users/${uid}/photo-library/`);
//       const res = await listAll(base);
//       const imageItems = res.items.filter(i => /\.(png|jpe?g|gif|webp|bmp|heic|heif|svg)$/i.test(i.name));
//       const urls = await Promise.all(imageItems.map(i => getDownloadURL(i)));
//       const paths = imageItems.map(i => i.fullPath);
//       setSettings(s => ({ ...s, urls }));
//       setCurrentPaths(paths);
//       toast(`Loaded ${urls.length} personal photo(s).`);
//     } catch (err) {
//       console.error(err);
//       toast('Failed to load your folder.');
//     } finally {
//       setBusy(false);
//     }
//   };

//   // Shuffle (affects p5 playlist)
//   const shuffleNow = () => setSettings(s => ({ ...s, shuffleKey: (s.shuffleKey || 0) + 1 }));

//   // ---------------- PRESETS ----------------
//   const myColl = uid ? collection(db, `users/${uid}/photo-presets`) : null;
// // BEFORE
// // const sharedColl = collection(db, 'app/photo-presets');

// // AFTER  ✅ (3 segments → valid collection)
// const sharedColl = collection(db, 'app', 'shared', 'photo-presets');


//   const listPresets = async () => {
//     try {
//       const [mine, shared] = await Promise.all([
//         myColl ? getDocs(myColl) : Promise.resolve(null),
//         getDocs(sharedColl),
//       ]);
//       setMyPresets(mine ? mine.docs.map(d => d.id).sort() : []);
//       setSharedPresets(shared.docs.map(d => d.id).sort());
//     } catch (err) {
//       console.error(err);
//     }
//   };
//   useEffect(() => { listPresets(); }, [uid]);

//   const mergeLoaded = (d: Partial<PhotoSettings>, s: PhotoSettings): PhotoSettings => ({
//     ...s,
//     mode: (['kenburns','slide','crossfade'] as const).includes(d.mode as any) ? d.mode! : s.mode,
//     direction: (['static','left','right','up','down','oscillateRightLeft','oscillateUpDown','circular'] as const)
//       .includes(d.direction as any) ? d.direction! : s.direction,
//     zoomMode: (['constant','pulse'] as const).includes(d.zoomMode as any) ? d.zoomMode! : s.zoomMode,
//     overlayOpacityMode: (['constant','pulse'] as const).includes(d.overlayOpacityMode as any)
//       ? d.overlayOpacityMode! : s.overlayOpacityMode,
//     scaleMode: (['cover','contain'] as const).includes(d.scaleMode as any) ? d.scaleMode! : s.scaleMode,

//     duration: typeof d.duration === 'number' ? d.duration : s.duration,
//     transitionSeconds: typeof d.transitionSeconds === 'number' ? d.transitionSeconds : s.transitionSeconds,
//     speed: typeof d.speed === 'number' ? d.speed : s.speed,
//     zoom: typeof d.zoom === 'number' ? d.zoom : s.zoom,
//     zoomSpeed: typeof d.zoomSpeed === 'number' ? d.zoomSpeed : s.zoomSpeed,
//     overlayOpacity: typeof d.overlayOpacity === 'number' ? d.overlayOpacity : s.overlayOpacity,
//     overlayOpacitySpeed: typeof d.overlayOpacitySpeed === 'number' ? d.overlayOpacitySpeed : s.overlayOpacitySpeed,
//     overlayColor: typeof d.overlayColor === 'string' ? d.overlayColor : s.overlayColor,

//     // Keep current selection unless preset included urls
//     urls: Array.isArray(d.urls) ? d.urls : s.urls,
//     shuffleKey: typeof d.shuffleKey === 'number' ? d.shuffleKey : s.shuffleKey,
//   });

//   const saveMyPreset = async () => {
//     if (!uid) return toast('Sign in to save a preset.');
//     const name = sanitizeName(presetName);
//     if (!name) return toast('Enter a preset name.');
//     setBusy(true);
//     try {
//      // Save shared preset
// // BEFORE
// // await setDoc(doc(db, `app/photo-presets/${name}`), { ... });

// // AFTER  ✅ (4 segments → valid document)
// await setDoc(doc(db, 'app', 'shared', 'photo-presets', name), {
//   settings,
//   updatedAt: serverTimestamp(),
//   createdAt: serverTimestamp(),
// }, { merge: true });

//         settings,
//         updatedAt: serverTimestamp(),
//         createdAt: serverTimestamp(),
//       }, { merge: true });
//       await listPresets();
//       toast(`Saved “${name}” to My Presets.`);
//     } catch (err) {
//       console.error(err);
//       toast('Failed to save preset.');
//     } finally {
//       setBusy(false);
//     }
//   };

//   const saveSharedPreset = async () => {
//     if (!isAdmin) return toast('Admins only.');
//     const name = sanitizeName(presetName);
//     if (!name) return toast('Enter a preset name.');
//     setBusy(true);
//     try {
//       await setDoc(doc(db, `app/photo-presets/${name}`), {
//         settings,
//         updatedAt: serverTimestamp(),
//         createdAt: serverTimestamp(),
//       }, { merge: true });
//       await listPresets();
//       toast(`Saved “${name}” to Shared Presets.`);
//     } catch (err) {
//       console.error(err);
//       toast('Failed to save shared preset.');
//     } finally {
//       setBusy(false);
//     }
//   };

//   const loadMyPreset = async (name: string) => {
//     if (!uid) return toast('Sign in to load.');
//     try {
//       const snap = await getDoc(doc(db, `users/${uid}/photo-presets/${name}`));
//       if (!snap.exists()) return toast('Preset not found.');
//       const s: PhotoSettings = snap.data()?.settings;
//       setSettings(cur => mergeLoaded(s || {}, cur));
//       toast(`Loaded “${name}”.`);
//     } catch (err) {
//       console.error(err);
//       toast('Failed to load preset.');
//     }
//   };

//   const loadSharedPreset = async (name: string) => {
//     try {
//    // Load shared preset
// // BEFORE
// // const snap = await getDoc(doc(db, `app/photo-presets/${name}`));

// // AFTER  ✅
// const snap = await getDoc(doc(db, 'app', 'shared', 'photo-presets', name));

//       if (!snap.exists()) return toast('Preset not found.');
//       const s: PhotoSettings = snap.data()?.settings;
//       setSettings(cur => mergeLoaded(s || {}, cur));
//       toast(`Loaded shared “${name}”.`);
//     } catch (err) {
//       console.error(err);
//       toast('Failed to load shared preset.');
//     }
//   };

//   const deleteMyPreset = async (name: string) => {
//     if (!uid) return;
//     if (!confirm(`Delete “${name}”?`)) return;
//     try {
//       await deleteDoc(doc(db, `users/${uid}/photo-presets/${name}`));
//       await listPresets();
//     } catch (err) {
//       console.error(err);
//       toast('Failed to delete.');
//     }
//   };

//   // ---------------- SELECTIONS (list of Storage paths) ----------------
//   const saveMySelection = async () => {
//     if (!uid) return toast('Sign in to save a selection.');
//     if (!currentPaths.length) return toast('No Storage paths to save (try loading from your folder or shared).');
//     try {
//       await setDoc(doc(db, `users/${uid}/photo-animation/selection`), {
//         paths: currentPaths, updatedAt: serverTimestamp(),
//       }, { merge: true });
//       toast('Saved selection (mine).');
//     } catch (err) {
//       console.error(err);
//       toast('Failed to save selection.');
//     }
//   };

//   const saveSharedSelection = async () => {
//     if (!isAdmin) return toast('Admins only.');
//     if (!currentPaths.length) return toast('No Storage paths to save.');
//     try {
//     // Save shared selection (list of Storage paths)
// // BEFORE (this would be invalid for doc path if you had used 'app/photo-animation/sharedSelection')
// // await setDoc(doc(db, 'app/photo-animation/sharedSelection'), { paths, ... });

// // AFTER  ✅ (4 segments → valid document)
// await setDoc(doc(db, 'app', 'shared', 'photo-animation', 'selection'), {
//   paths: currentPaths,
//   updatedAt: serverTimestamp(),
// }, { merge: true });

//       toast('Saved selection (shared).');
//     } catch (err) {
//       console.error(err);
//       toast('Failed to save shared selection.');
//     }
//   };

//   const loadMySavedSelection = async () => {
//     if (!uid) return toast('Sign in to load a selection.');
//     try {
//     // Load shared selection
// // BEFORE
// // const snap = await getDoc(doc(db, 'app/photo-animation/sharedSelection'));

// // AFTER  ✅
// const snap = await getDoc(doc(db, 'app', 'shared', 'photo-animation', 'selection'));

//       if (!snap.exists()) return toast('No saved selection.');
//       const paths: string[] = snap.data()?.paths || [];
//       const urls = await Promise.all(paths.map(p => getDownloadURL(storageRef(storage, p))));
//       setSettings(s => ({ ...s, urls }));
//       setCurrentPaths(paths);
//       toast(`Loaded ${paths.length} path(s) from saved selection.`);
//     } catch (err) {
//       console.error(err);
//       toast('Failed to load saved selection.');
//     }
//   };

//   const loadSharedSavedSelection = async () => {
//     try {
//       const snap = await getDoc(doc(db, 'app/photo-animation/sharedSelection'));
//       if (!snap.exists()) return toast('No shared selection.');
//       const paths: string[] = snap.data()?.paths || [];
//       const urls = await Promise.all(paths.map(p => getDownloadURL(storageRef(storage, p))));
//       setSettings(s => ({ ...s, urls }));
//       setCurrentPaths(paths);
//       toast(`Loaded ${paths.length} path(s) from shared selection.`);
//     } catch (err) {
//       console.error(err);
//       toast('Failed to load shared selection.');
//     }
//   };

//   // ---------------- RENDER ----------------
//   const Disabled = busy ? 'opacity-60 pointer-events-none' : '';
//   const num = (v: number, digits = 2) => Number.isFinite(v) ? v.toFixed(digits) : '0';

//   return (
//     <div className={`fixed right-4 top-2 z-10 w-[340px] rounded-xl shadow ${open ? 'bg-white/85 backdrop-blur' : ''}`}>
//       <div className="p-3">
//         <div className="flex items-center gap-2">
//           {isAnimating ? (
//             <button onClick={stopAnimation} className={`${smallBtn} ${btnDanger}`}>Stop</button>
//           ) : (
//             <button onClick={startAnimation} className={`${smallBtn} ${btnGreen}`}>Start</button>
//           )}
//           <button onClick={resetAnimation} className={`${smallBtn} ${btnSubtle}`}>Reset</button>
//           <div className="ml-auto">
//             <button onClick={() => setOpen(o => !o)} className={`${smallBtn} ${btnSubtle}`}>
//               {open ? 'Hide' : 'Show'} Panel
//             </button>
//           </div>
//         </div>
//       </div>

//       {open && (
//         <div className={`p-3 pt-0 space-y-3 text-xs ${Disabled}`}>
//           {/* Sources */}
//           <div className="space-y-2">
//             <div className="font-semibold text-slate-700">Photos</div>

//             <input type="file" accept="image/*" multiple onChange={onFilesLocal} className="w-full text-[11px]" />
//             <div className="flex flex-wrap gap-2">
//               <button onClick={loadFromSharedFolder} className={`${smallBtn} ${btnSubtle}`}>Load Shared (photos/)</button>
//               <button onClick={loadFromMyFolder} className={`${smallBtn} ${btnSubtle}`}>Load Mine</button>
//               <button onClick={shuffleNow} className={`${smallBtn} ${btnPrimary}`}>Shuffle</button>
//             </div>
//             <div className="text-[11px] text-slate-600">Selected: {settings.urls.length}</div>

//             <div className="pt-2 border-t space-y-2">
//               <label className="block">Upload to my library</label>
//               <input type="file" accept="image/*" multiple onChange={uploadToMine} className="w-full text-[11px]" />
//               {isAdmin && (
//                 <>
//                   <label className="block mt-2">Upload to shared (admin → photos/)</label>
//                   <input type="file" accept="image/*" multiple onChange={uploadToShared} className="w-full text-[11px]" />
//                 </>
//               )}
//             </div>
//           </div>

//           {/* Mode & timing */}
//           <div className="grid grid-cols-2 gap-2">
//             <div>
//               <label className="block mb-1">Mode</label>
//               <select
//                 value={settings.mode}
//                 onChange={(e) => setSettings(s => ({ ...s, mode: e.target.value as PhotoSettings['mode'] }))}
//                 className="border rounded px-2 py-1 w-full"
//               >
//                 <option value="kenburns">Ken Burns</option>
//                 <option value="slide">Slide</option>
//                 <option value="crossfade">Crossfade</option>
//               </select>
//             </div>
//             <div>
//               <label className="block mb-1">Fit</label>
//               <select
//                 value={settings.scaleMode}
//                 onChange={(e) => setSettings(s => ({ ...s, scaleMode: e.target.value as PhotoSettings['scaleMode'] }))}
//                 className="border rounded px-2 py-1 w-full"
//               >
//                 <option value="cover">Cover</option>
//                 <option value="contain">Contain</option>
//               </select>
//             </div>
//             <div>
//               <label className="block mb-1">Duration/photo: {num(settings.duration)}s</label>
//               <input type="range" min={1} max={20} step={0.25}
//                 value={settings.duration}
//                 onChange={(e) => setSettings(s => ({ ...s, duration: Number(e.target.value) }))}
//                 className="w-full"
//               />
//             </div>
//             <div>
//               <label className="block mb-1">Transition: {num(settings.transitionSeconds)}s</label>
//               <input type="range" min={0} max={6} step={0.1}
//                 value={settings.transitionSeconds}
//                 onChange={(e) => setSettings(s => ({ ...s, transitionSeconds: Number(e.target.value) }))}
//                 className="w-full"
//               />
//             </div>
//           </div>

//           {/* Motion */}
//           <div className="grid grid-cols-2 gap-2">
//             <div>
//               <label className="block mb-1">Direction</label>
//               <select
//                 value={settings.direction}
//                 onChange={(e) => setSettings(s => ({ ...s, direction: e.target.value as PhotoSettings['direction'] }))}
//                 className="border rounded px-2 py-1 w-full"
//               >
//                 <option value="static">Static</option>
//                 <option value="left">Left</option>
//                 <option value="right">Right</option>
//                 <option value="up">Up</option>
//                 <option value="down">Down</option>
//                 <option value="oscillateRightLeft">Oscillate L↔R</option>
//                 <option value="oscillateUpDown">Oscillate U↕D</option>
//                 <option value="circular">Circular</option>
//               </select>
//             </div>
//             <div>
//               <label className="block mb-1">Speed: {Math.round(settings.speed)}</label>
//               <input type="range" min={0} max={200} step={1}
//                 value={Number.isFinite(settings.speed) ? settings.speed : 50}
//                 onChange={(e) => setSettings(s => ({ ...s, speed: Number(e.target.value) }))}
//                 className="w-full"
//               />
//             </div>
//           </div>

//           {/* Zoom */}
//           <div className="grid grid-cols-2 gap-2">
//             <div>
//               <label className="block mb-1">Zoom: {num(settings.zoom)}×</label>
//               <input type="range" min={1} max={2.5} step={0.01}
//                 value={settings.zoom}
//                 onChange={(e) => setSettings(s => ({ ...s, zoom: Number(e.target.value) }))}
//                 className="w-full"
//               />
//             </div>
//             <div>
//               <label className="block mb-1">Zoom Mode</label>
//               <select
//                 value={settings.zoomMode}
//                 onChange={(e) => setSettings(s => ({ ...s, zoomMode: e.target.value as PhotoSettings['zoomMode'] }))}
//                 className="border rounded px-2 py-1 w-full"
//               >
//                 <option value="constant">Constant</option>
//                 <option value="pulse">Pulse</option>
//               </select>
//             </div>
//           </div>

//           {settings.zoomMode === 'pulse' && (
//             <div>
//               <label className="block mb-1">Zoom Pulse Speed: {num(settings.zoomSpeed)}</label>
//               <input type="range" min={0} max={5} step={0.1}
//                 value={settings.zoomSpeed}
//                 onChange={(e) => setSettings(s => ({ ...s, zoomSpeed: Number(e.target.value) }))}
//                 className="w-full"
//               />
//             </div>
//           )}

//           {/* Overlay */}
//           <div className="grid grid-cols-2 gap-2">
//             <div>
//               <label className="block mb-1">Overlay Color</label>
//               <input type="color"
//                 value={settings.overlayColor}
//                 onChange={(e) => setSettings(s => ({ ...s, overlayColor: e.target.value }))}
//                 className="w-full h-8 p-0 border rounded"
//               />
//             </div>
//             <div>
//               <label className="block mb-1">Overlay Opacity: {Math.round(settings.overlayOpacity * 100)}%</label>
//               <input type="range" min={0} max={100} step={1}
//                 value={Math.round(settings.overlayOpacity * 100)}
//                 onChange={(e) => setSettings(s => ({ ...s, overlayOpacity: Number(e.target.value) / 100 }))}
//                 className="w-full"
//               />
//             </div>
//           </div>

//           {/* Presets */}
//           <div className="pt-2 border-t">
//             <div className="font-semibold text-slate-700 mb-2">Presets</div>
//             <div className="flex gap-2 mb-2">
//               <input
//                 className="border rounded px-2 py-1 text-[12px] w-full"
//                 placeholder="Preset name"
//                 value={presetName}
//                 onChange={(e) => setPresetName(e.target.value)}
//               />
//               <button onClick={saveMyPreset} className={`${smallBtn} ${btnSubtle}`}>Save Mine</button>
//               <button onClick={saveSharedPreset} disabled={!isAdmin} className={`${smallBtn} ${btnPrimary}`}>
//                 Save Shared
//               </button>
//             </div>
//             <div className="grid grid-cols-2 gap-3">
//               <div>
//                 <div className="font-medium mb-1">My Presets</div>
//                 {myPresets.length === 0 && <div className="text-slate-500">None</div>}
//                 <div className="space-y-1 max-h-40 overflow-auto pr-1">
//                   {myPresets.map((n) => (
//                     <div key={n} className="flex items-center justify-between gap-2">
//                       <button onClick={() => loadMyPreset(n)} className="underline decoration-dotted truncate" title={n}>
//                         {n}
//                       </button>
//                       <button onClick={() => deleteMyPreset(n)} className={`${smallBtn} ${btnDanger}`}>Del</button>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//               <div>
//                 <div className="font-medium mb-1">Shared Presets</div>
//                 {sharedPresets.length === 0 && <div className="text-slate-500">None</div>}
//                 <div className="space-y-1 max-h-40 overflow-auto pr-1">
//                   {sharedPresets.map((n) => (
//                     <div key={n} className="flex items-center justify-between gap-2">
//                       <button onClick={() => loadSharedPreset(n)} className="underline decoration-dotted truncate" title={n}>
//                         {n}
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             {/* Selections (Storage path lists) */}
//             <div className="mt-3 pt-2 border-t">
//               <div className="font-semibold text-slate-700 mb-2">Selections (list of Storage paths)</div>
//               <div className="flex flex-wrap gap-2">
//                 <button onClick={saveMySelection} className={`${smallBtn} ${btnSubtle}`}>Save Selection (Mine)</button>
//                 <button onClick={loadMySavedSelection} className={`${smallBtn} ${btnSubtle}`}>Load Selection (Mine)</button>
//                 <button onClick={saveSharedSelection} disabled={!isAdmin} className={`${smallBtn} ${btnPrimary}`}>
//                   Save Selection (Shared)
//                 </button>
//                 <button onClick={loadSharedSavedSelection} className={`${smallBtn} ${btnPrimary}`}>
//                   Load Selection (Shared)
//                 </button>
//               </div>
//               <div className="text-[11px] text-slate-500 mt-1">
//                 Currently tracked paths: {currentPaths.length}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ControlPanelPhoto;
