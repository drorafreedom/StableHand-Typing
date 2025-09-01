// src/components/Therapy/ControlPanelBaselineTyping.tsx
// src/components/Therapy/ControlPanelBaselineTyping.tsx
import React, { useState } from 'react';
import { Collapse } from 'react-collapse';
import PresetControls from '../common/PresetControls';
import type { PresetModule } from '../../utils/presets';

export interface BaselineTypingSettings {
  bgColor: string;
  bgOpacity: number;
}

const MODULE: PresetModule = 'baseline-typing';

interface Props {
  settings: BaselineTypingSettings;
  setSettings: React.Dispatch<React.SetStateAction<BaselineTypingSettings>>;
}

const ControlPanelBaselineTyping: React.FC<Props> = ({ settings, setSettings }) => {
  const [isOpen, setIsOpen] = useState(true);

  // strict merge so we don’t accidentally overwrite missing fields
  const mergeLoaded = (loaded: Partial<BaselineTypingSettings>, curr: BaselineTypingSettings) => ({
    bgColor: loaded.bgColor ?? curr.bgColor,
    bgOpacity: typeof loaded.bgOpacity === 'number' ? loaded.bgOpacity : curr.bgOpacity,
  });

  return (
    <div className="fixed right-4 top-2 p-4 rounded shadow-lg w-60 z-50 bg-white/70">
      <button onClick={() => setIsOpen(o => !o)} className="mb-2 bg-gray-200 text-xs p-2 rounded w-full">
        {isOpen ? 'Collapse Controls' : 'Expand Controls'}
      </button>

      <Collapse isOpened={isOpen}>
        <div className="space-y-3 text-xs">
          {/* Your baseline controls */}
          <div>
            <label className="block mb-1">Background Color</label>
            <input
              type="color"
              value={settings.bgColor}
              onChange={(e) => setSettings(s => ({ ...s, bgColor: e.target.value }))}
              className="w-full h-8"
            />
          </div>

          <div>
            <label className="block mb-1">Background Opacity: {Math.round(settings.bgOpacity * 100)}%</label>
            <input
              type="range" min={0} max={100} step={1}
              value={Math.round(settings.bgOpacity * 100)}
              onChange={(e) => setSettings(s => ({ ...s, bgOpacity: Number(e.target.value) / 100 }))}
              className="w-full"
            />
          </div>

          <hr className="my-2" />

          {/* Reusable preset block */}
          <PresetControls
            module={MODULE}
            settings={settings}
            setSettings={setSettings}
            mergeLoaded={mergeLoaded}
            className="bg-transparent"
          />
        </div>
      </Collapse>
    </div>
  );
};

export default ControlPanelBaselineTyping;

//---------------------------------------------------------
// import React, { useEffect, useState } from 'react';
// import { Collapse } from 'react-collapse';
// import { useAuth } from '../../data/AuthContext';
// import { db, storage } from '../../firebase/firebase';
// import {
//   collection, doc, getDoc, getDocs, setDoc
// } from 'firebase/firestore';
// import { ref as storageRef, uploadBytes } from 'firebase/storage';
// import Papa from 'papaparse';

// import {
//   type PresetModule,
//   presetsColPath,
//   presetDocPath,
//   presetCsvPath,
//   presetJsonPath,
// } from '../../utils/presets';

// export interface BaselineTypingSettings {
//   bgColor: string;   // "#RRGGBB"
//   bgOpacity: number; // 0..1
// }

// interface Props {
//   settings: BaselineTypingSettings;
//   setSettings: React.Dispatch<React.SetStateAction<BaselineTypingSettings>>;
// }

// const MODULE: PresetModule = 'baseline-typing';

// const ControlPanelBaselineTyping: React.FC<Props> = ({ settings, setSettings }) => {
//   const { currentUser } = useAuth();
//   const uid = currentUser?.uid;

//   const [isOpen, setIsOpen] = useState(true);

//   // keep SAVE and LOAD independent
//   const [saveName, setSaveName] = useState('');
//   const [selectedName, setSelectedName] = useState('');
//   const [presetList, setPresetList] = useState<string[]>([]);

//   const [message, setMessage] =
//     useState<{ message: string; type: 'success' | 'error' } | null>(null);

//   useEffect(() => {
//     if (!message) return;
//     const t = setTimeout(() => setMessage(null), 2500);
//     return () => clearTimeout(t);
//   }, [message]);

//   // load list of preset names
//   useEffect(() => {
//     if (!uid) return;
//     (async () => {
//       try {
//         const snap = await getDocs(collection(db, presetsColPath(uid, MODULE)));
//         setPresetList(snap.docs.map(d => d.id).sort());
//       } catch (e) {
//         console.error('Error fetching presets', e);
//       }
//     })();
//   }, [uid]);

//   const savePreset = async () => {
//     if (!uid) { setMessage({ message: 'Please log in to save.', type: 'error' }); return; }
//     const name = saveName.trim();
//     if (!name) { setMessage({ message: 'Enter a preset name.', type: 'error' }); return; }

//     try {
//       // hard existence check on the exact doc we’re about to write
//       const docRef = doc(db, presetDocPath(uid, MODULE, name));
//       const existing = await getDoc(docRef);

//       if (existing.exists()) {
//         const ok = window.confirm(
//           `A preset named "${name}" already exists.\n\nDo you want to overwrite it?`
//         );
//         if (!ok) {
//           setMessage({ message: 'Save cancelled.', type: 'error' });
//           return;
//         }
//       }

//       const ts = new Date();
//       const payload = {
//         ...settings,
//         presetName: name,
//         userId: uid,
//         timestamp: ts.toISOString(),
//         localDateTime: ts.toLocaleString(),
//         schema: 1,
//       };

//       // Firestore (explicit path by name)
//       await setDoc(docRef, payload, { merge: true });

//       // CSV to Storage
//       const csvRows = Object.entries(payload).map(([k, v]) => ({
//         setting: k,
//         value: Array.isArray(v) ? JSON.stringify(v) : String(v),
//       }));
//       const csvText = Papa.unparse(csvRows);
//       await uploadBytes(
//         storageRef(storage, presetCsvPath(uid, MODULE, name)),
//         new Blob([csvText], { type: 'text/csv;charset=utf-8;' })
//       );

//       // JSON to Storage
//       const jsonText = JSON.stringify(payload, null, 2);
//       await uploadBytes(
//         storageRef(storage, presetJsonPath(uid, MODULE, name)),
//         new Blob([jsonText], { type: 'application/json' })
//       );

//       // refresh the dropdown list if this is a new name
//       setPresetList(prev => (prev.includes(name) ? prev : [...prev, name].sort()));

//       setMessage({ message: 'Preset saved.', type: 'success' });
//     } catch (e: any) {
//       console.error('Save preset failed', e);
//       setMessage({ message: `Save failed: ${e?.code || ''} ${e?.message || e}`, type: 'error' });
//     }
//   };

//   const loadPreset = async () => {
//     if (!uid) { setMessage({ message: 'Please log in to load.', type: 'error' }); return; }
//     const name = selectedName.trim();
//     if (!name) { setMessage({ message: 'Choose a preset to load.', type: 'error' }); return; }

//     try {
//       const snap = await getDoc(doc(db, presetDocPath(uid, MODULE, name)));
//       if (!snap.exists()) {
//         setMessage({ message: 'Preset not found.', type: 'error' });
//         return;
//       }
//       const data = snap.data() as Partial<BaselineTypingSettings>;
//       setSettings(s => ({
//         bgColor: data.bgColor ?? s.bgColor,
//         bgOpacity: typeof data.bgOpacity === 'number' ? data.bgOpacity : s.bgOpacity,
//       }));
//       setMessage({ message: `Loaded "${name}".`, type: 'success' });
//     } catch (e: any) {
//       console.error('Load preset failed', e);
//       setMessage({ message: `Load failed: ${e?.code || ''} ${e?.message || e}`, type: 'error' });
//     }
//   };

//   return (
//     <div className="fixed right-4 top-2 p-4 rounded shadow-lg w-60 z-50 bg-white/70">
//       <button
//         onClick={() => setIsOpen(o => !o)}
//         className="mb-2 bg-gray-200 text-xs p-2 rounded w-full"
//       >
//         {isOpen ? 'Collapse Controls' : 'Expand Controls'}
//       </button>

//       <Collapse isOpened={isOpen}>
//         <div className="space-y-3 text-xs">
//           {/* Background color */}
//           <div>
//             <label className="block mb-1">Background Color</label>
//             <input
//               type="color"
//               value={settings.bgColor}
//               onChange={(e) => setSettings(s => ({ ...s, bgColor: e.target.value }))}
//               className="w-full h-8"
//             />
//           </div>

//           {/* Background opacity */}
//           <div>
//             <label className="block mb-1">
//               Background Opacity: {Math.round(settings.bgOpacity * 100)}%
//             </label>
//             <input
//               type="range"
//               min={0}
//               max={100}
//               step={1}
//               value={Math.round(settings.bgOpacity * 100)}
//               onChange={(e) =>
//                 setSettings(s => ({ ...s, bgOpacity: Number(e.target.value) / 100 }))
//               }
//               className="w-full"
//             />
//           </div>

//           <hr className="my-2" />

//           {/* Save preset (independent text box) */}
//           <div>
//             <label className="block mb-1">Save as new preset</label>
//             <div className="flex gap-2">
//               <input
//                 value={saveName}
//                 onChange={(e) => setSaveName(e.target.value)}
//                 placeholder="Preset name"
//                 className="border p-2 rounded w-full"
//               />
//               <button onClick={savePreset} className="bg-blue-500 text-white px-3 rounded">
//                 Save
//               </button>
//             </div>
//           </div>

//           {/* Load preset (separate dropdown, DOES NOT touch saveName) */}
//           <div>
//             <label className="block mb-1">Load preset</label>
//             <div className="flex gap-2">
//               <select
//                 value={selectedName}
//                 onChange={(e) => setSelectedName(e.target.value)}
//                 className="border p-2 rounded w-full"
//               >
//                 <option value="">Select…</option>
//                 {presetList.map((name) => (
//                   <option key={name} value={name}>
//                     {name}
//                   </option>
//                 ))}
//               </select>
//               <button onClick={loadPreset} className="bg-yellow-500 text-white px-3 rounded">
//                 Load
//               </button>
//             </div>
//           </div>

//           {message && (
//             <div
//               className={`text-white p-2 rounded ${
//                 message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
//               }`}
//             >
//               {message.message}
//             </div>
//           )}
//         </div>
//       </Collapse>
//     </div>
//   );
// };

// export default ControlPanelBaselineTyping;

//------------------------------------------------------------

// import React, { useEffect, useState } from 'react';
// import { Collapse } from 'react-collapse';
// import { useAuth } from '../../data/AuthContext';
// import { db, storage } from '../../firebase/firebase';
// import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
// import { ref as storageRef, uploadBytes } from 'firebase/storage';
// import Papa from 'papaparse';

// import {
//   type PresetModule,
//   presetsColPath,
//   presetDocPath,
//   presetCsvPath,
//   presetJsonPath,
// } from '../../utils/presets';

// export interface BaselineTypingSettings {
//   bgColor: string;   // "#RRGGBB"
//   bgOpacity: number; // 0..1
// }

// interface Props {
//   settings: BaselineTypingSettings;
//   setSettings: React.Dispatch<React.SetStateAction<BaselineTypingSettings>>;
// }

// const MODULE: PresetModule = 'baseline-typing';

// const ControlPanelBaselineTyping: React.FC<Props> = ({ settings, setSettings }) => {
//   const { currentUser } = useAuth();
//   const uid = currentUser?.uid;

//   const [isOpen, setIsOpen] = useState(true);

//   // keep SAVE and LOAD controls independent
//   const [saveName, setSaveName] = useState('');
//   const [selectedName, setSelectedName] = useState('');
//   const [presetList, setPresetList] = useState<string[]>([]);

//   const [message, setMessage] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
//   useEffect(() => {
//     if (!message) return;
//     const t = setTimeout(() => setMessage(null), 2500);
//     return () => clearTimeout(t);
//   }, [message]);

//   // fetch preset names
//   useEffect(() => {
//     if (!uid) return;
//     (async () => {
//       try {
//         const snap = await getDocs(collection(db, presetsColPath(uid, MODULE)));
//         setPresetList(snap.docs.map(d => d.id).sort());
//       } catch (e) {
//         console.error('Error fetching presets', e);
//       }
//     })();
//   }, [uid]);

// /*   const savePreset = async () => {
//     if (!uid) { setMessage({ message: 'Please log in to save.', type: 'error' }); return; }
//     const name = saveName.trim();
//     if (!name) { setMessage({ message: 'Enter a preset name.', type: 'error' }); return; }

//     const ts = new Date();
//     const payload = {
//       ...settings,
//       presetName: name,
//       userId: uid,
//       timestamp: ts.toISOString(),
//       localDateTime: ts.toLocaleString(),
//       schema: 1,
//     };

//     try {
//       // Firestore document (merge so you can re-save same name)
//       await setDoc(doc(db, presetDocPath(uid, MODULE, name)), payload, { merge: true });

//       // Storage CSV
//       const csvRows = Object.entries(payload).map(([k, v]) => ({
//         setting: k,
//         value: Array.isArray(v) ? JSON.stringify(v) : String(v),
//       }));
//       const csvText = Papa.unparse(csvRows);
//       await uploadBytes(
//         storageRef(storage, presetCsvPath(uid, MODULE, name)),
//         new Blob([csvText], { type: 'text/csv;charset=utf-8;' })
//       );

//       // Storage JSON
//       const jsonText = JSON.stringify(payload, null, 2);
//       await uploadBytes(
//         storageRef(storage, presetJsonPath(uid, MODULE, name)),
//         new Blob([jsonText], { type: 'application/json' })
//       );

//       if (!presetList.includes(name)) setPresetList(prev => [...prev, name].sort());
//       setMessage({ message: 'Preset saved.', type: 'success' });
//     } catch (e: any) {
//       console.error('Save preset failed', e);
//       setMessage({ message: `Save failed: ${e?.code || ''} ${e?.message || e}`, type: 'error' });
//     }
//   }; */

// const savePreset = async () => {
//   if (!uid) { setMessage({ message: 'Please log in to save.', type: 'error' }); return; }
//   const name = saveName.trim();
//   if (!name) { setMessage({ message: 'Enter a preset name.', type: 'error' }); return; }

//   try {
//     // 1) Check if a preset with this name already exists
//     const existing = await getDoc(doc(db, presetDocPath(uid, MODULE, name)));
//     if (existing.exists()) {
//       const ok = window.confirm(
//         `A preset named "${name}" already exists.\n\nDo you want to overwrite it?`
//       );
//       if (!ok) {
//         setMessage({ message: 'Save cancelled.', type: 'error' });
//         return;
//       }
//     }

//     // 2) Build payload
//     const ts = new Date();
//     const payload = {
//       ...settings,
//       presetName: name,
//       userId: uid,
//       timestamp: ts.toISOString(),
//       localDateTime: ts.toLocaleString(),
//       schema: 1,
//     };

//     // 3) Firestore (merge so overwriting is explicit but safe)
//     await setDoc(doc(db, presetDocPath(uid, MODULE, name)), payload, { merge: true });

//     // 4) Storage CSV
//     const csvRows = Object.entries(payload).map(([k, v]) => ({
//       setting: k,
//       value: Array.isArray(v) ? JSON.stringify(v) : String(v),
//     }));
//     const csvText = Papa.unparse(csvRows);
//     await uploadBytes(
//       storageRef(storage, presetCsvPath(uid, MODULE, name)),
//       new Blob([csvText], { type: 'text/csv;charset=utf-8;' })
//     );

//     // 5) Storage JSON
//     const jsonText = JSON.stringify(payload, null, 2);
//     await uploadBytes(
//       storageRef(storage, presetJsonPath(uid, MODULE, name)),
//       new Blob([jsonText], { type: 'application/json' })
//     );

//     // 6) Refresh list if new
//     setPresetList(prev => (prev.includes(name) ? prev : [...prev, name].sort()));

//     setMessage({ message: 'Preset saved.', type: 'success' });
//   } catch (e: any) {
//     console.error('Save preset failed', e);
//     setMessage({ message: `Save failed: ${e?.code || ''} ${e?.message || e}`, type: 'error' });
//   }
// };


//   const loadPreset = async () => {
//     if (!uid) { setMessage({ message: 'Please log in to load.', type: 'error' }); return; }
//     if (!selectedName) { setMessage({ message: 'Choose a preset to load.', type: 'error' }); return; }

//     try {
//       const snap = await getDoc(doc(db, presetDocPath(uid, MODULE, selectedName)));
//       if (!snap.exists()) {
//         setMessage({ message: 'Preset not found.', type: 'error' });
//         return;
//       }
//       const data = snap.data() as Partial<BaselineTypingSettings>;
//       setSettings(s => ({
//         bgColor: data.bgColor ?? s.bgColor,
//         bgOpacity: typeof data.bgOpacity === 'number' ? data.bgOpacity : s.bgOpacity,
//       }));
//       setMessage({ message: `Loaded "${selectedName}".`, type: 'success' });
//     } catch (e: any) {
//       console.error('Load preset failed', e);
//       setMessage({ message: `Load failed: ${e?.code || ''} ${e?.message || e}`, type: 'error' });
//     }
//   };

//   return (
//     <div className="fixed right-4 top-2 p-4 rounded shadow-lg w-60 z-50 bg-white/70">
//       <button
//         onClick={() => setIsOpen(o => !o)}
//         className="mb-2 bg-gray-200 text-xs p-2 rounded w-full"
//       >
//         {isOpen ? 'Collapse Controls' : 'Expand Controls'}
//       </button>

//       <Collapse isOpened={isOpen}>
//         <div className="space-y-3 text-xs">
//           {/* Background color */}
//           <div>
//             <label className="block mb-1">Background Color</label>
//             <input
//               type="color"
//               value={settings.bgColor}
//               onChange={(e) => setSettings(s => ({ ...s, bgColor: e.target.value }))}
//               className="w-full h-8"
//             />
//           </div>

//           {/* Background opacity */}
//           <div>
//             <label className="block mb-1">
//               Background Opacity: {Math.round(settings.bgOpacity * 100)}%
//             </label>
//             <input
//               type="range"
//               min={0}
//               max={100}
//               step={1}
//               value={Math.round(settings.bgOpacity * 100)}
//               onChange={(e) =>
//                 setSettings(s => ({ ...s, bgOpacity: Number(e.target.value) / 100 }))
//               }
//               className="w-full"
//             />
//           </div>

//           <hr className="my-2" />

//           {/* Save preset (independent input) */}
//           <div>
//             <label className="block mb-1">Save as new preset</label>
//             <div className="flex gap-2">
//               <input
//                 value={saveName}
//                 onChange={(e) => setSaveName(e.target.value)}
//                 placeholder="Preset name"
//                 className="border p-2 rounded w-full"
//               />
//               <button onClick={savePreset} className="bg-blue-500 text-white px-3 rounded">
//                 Save
//               </button>
//             </div>
//           </div>

//           {/* Load preset (separate dropdown) */}
//           <div>
//             <label className="block mb-1">Load preset</label>
//             <div className="flex gap-2">
//               <select
//                 value={selectedName}
//                 onChange={(e) => setSelectedName(e.target.value)}
//                 className="border p-2 rounded w-full"
//               >
//                 <option value="">Select…</option>
//                 {presetList.map((name) => (
//                   <option key={name} value={name}>
//                     {name}
//                   </option>
//                 ))}
//               </select>
//               <button onClick={loadPreset} className="bg-yellow-500 text-white px-3 rounded">
//                 Load
//               </button>
//             </div>
//           </div>

//           {message && (
//             <div
//               className={`text-white p-2 rounded ${
//                 message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
//               }`}
//             >
//               {message.message}
//             </div>
//           )}
//         </div>
//       </Collapse>
//     </div>
//   );
// };

// export default ControlPanelBaselineTyping;



// import React, { useState, useEffect } from 'react';
// import { Collapse } from 'react-collapse';
// import Papa from 'papaparse';

// import { useAuth } from '../../data/AuthContext';
// import { db, storage } from '../../firebase/firebase';

// import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
// import { ref, uploadBytes } from 'firebase/storage';

// interface ControlPanelBaselineTypingProps {
//   settings: any;
//   setSettings: React.Dispatch<React.SetStateAction<any>>;
// }

// const ControlPanelBaselineTyping: React.FC<ControlPanelBaselineTypingProps> = ({
//   settings,
//   setSettings,
// }) => {
//   const [isOpen, setIsOpen] = useState<boolean>(true);
//   const { currentUser } = useAuth();

//   // ⬇️ split save vs load
//   const [saveName, setSaveName] = useState<string>('');
//   const [loadName, setLoadName] = useState<string>('');
//   const [presetList, setPresetList] = useState<string[]>([]);
//   const [message, setMessage] = useState<{ message: string; type: 'error' | 'success' }>({
//     message: '',
//     type: 'success',
//   });

//   const presetsColPath = (uid: string) => `users/${uid}/animation-settings`;

//   useEffect(() => {
//     const fetchPresets = async () => {
//       try {
//         const uid = currentUser?.uid;
//         if (!uid) return;
//         const snap = await getDocs(collection(db, presetsColPath(uid)));
//         setPresetList(snap.docs.map((d) => d.id));
//       } catch (err) {
//         console.error('Error fetching baseline preset names:', err);
//       }
//     };
//     fetchPresets();
//   }, [currentUser?.uid]);

//   const savePresetSettings = async () => {
//     try {
//       const uid = currentUser?.uid;
//       if (!uid) {
//         setMessage({ message: 'You must be logged in to save presets.', type: 'error' });
//         return;
//       }
//       if (!saveName) {
//         setMessage({ message: 'Please provide a name for the preset.', type: 'error' });
//         return;
//       }

//       const ts = new Date();
//       const payload = {
//         ...settings,
//         presetName: saveName,
//         userId: uid,
//         timestamp: ts.toISOString(),
//         localDateTime: ts.toLocaleString(),
//         module: 'baseline-typing',
//       };

//       // Firestore
//       const docPath = `${presetsColPath(uid)}/${saveName}`;
//       await setDoc(doc(db, docPath), payload, { merge: true });

//       // Storage: CSV
//       const csvRows = Object.entries(payload).map(([k, v]) => ({
//         setting: k,
//         value: Array.isArray(v) || typeof v === 'object' ? JSON.stringify(v) : String(v),
//       }));
//       const csv = Papa.unparse(csvRows);
//       await uploadBytes(ref(storage, `${presetsColPath(uid)}/${saveName}.csv`),
//         new Blob([csv], { type: 'text/csv;charset=utf-8;' })
//       );

//       // Storage: JSON
//       await uploadBytes(ref(storage, `${presetsColPath(uid)}/${saveName}.json`),
//         new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
//       );

//       if (!presetList.includes(saveName)) setPresetList((l) => [...l, saveName]);
//       setMessage({ message: 'Preset saved to Firestore + CSV + JSON ✔️', type: 'success' });
//     } catch (err) {
//       console.error('Error saving baseline preset:', err);
//       setMessage({ message: 'Error saving preset. Please try again.', type: 'error' });
//     }
//   };

//   const loadPresetSettings = async () => {
//     try {
//       const uid = currentUser?.uid;
//       if (!uid) {
//         setMessage({ message: 'You must be logged in to load presets.', type: 'error' });
//         return;
//       }
//       if (!loadName) {
//         setMessage({ message: 'Please choose a preset to load.', type: 'error' });
//         return;
//       }

//       const docPath = `${presetsColPath(uid)}/${loadName}`;
//       const snap = await getDoc(doc(db, docPath));
//       if (!snap.exists()) {
//         setMessage({ message: 'No preset found with that name.', type: 'error' });
//         return;
//       }

//       const loaded = snap.data();
//       setSettings(loaded);
//       // ⬇️ important: DO NOT touch saveName here
//       setMessage({ message: 'Preset loaded from Firestore ✔️', type: 'success' });
//     } catch (err) {
//       console.error('Error loading baseline preset:', err);
//       setMessage({ message: 'Error loading preset. Please try again.', type: 'error' });
//     }
//   };

//   return (
//     <div className="fixed right-4 top-2 p-4 rounded shadow-lg w-60 z-50 overflow-y-auto">
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="mb-2 bg-gray-200 text-xs p-2 rounded w-full"
//       >
//         {isOpen ? 'Collapse Controls' : 'Expand Controls'}
//       </button>

//       <Collapse isOpened={isOpen}>
//         <div className="space-y-2 text-xs">

//           {/* Save-as name (independent) */}
//           <label className="block mb-1">Save preset as…</label>
//           <input
//             type="text"
//             placeholder="Preset Name"
//             value={saveName}
//             onChange={(e) => setSaveName(e.target.value)}
//             className="border p-2 rounded w-full"
//           />
//           <button onClick={savePresetSettings} className="bg-blue-500 text-white p-2 rounded w-full">
//             Save Preset
//           </button>

//           {/* Load picker (independent) */}
//           <label className="block mt-3 mb-1">Load preset</label>
//           <select
//             onChange={(e) => setLoadName(e.target.value)}
//             value={loadName}
//             className="border p-2 rounded w-full"
//           >
//             <option value="">Select Preset</option>
//             {presetList.map((p) => (
//               <option key={p} value={p}>
//                 {p}
//               </option>
//             ))}
//           </select>
//           <button onClick={loadPresetSettings} className="bg-yellow-500 text-white p-2 rounded w-full">
//             Load Preset
//           </button>

//           {/* Controls */}
//           <div className="control-group text-xs mt-3">
//             <label className="block mb-2 text-xs">Background Color:</label>
//             <input
//               type="color"
//               value={settings.bgColor}
//               onChange={(e) => setSettings({ ...settings, bgColor: e.target.value })}
//               className="w-full"
//             />
//           </div>

//           <div className="control-group text-xs">
//             <label className="block mb-2 text-xs">
//               Background Opacity: {Math.round(((settings.bgOpacity ?? 1) * 100))}
//             </label>
//             <input
//               type="range"
//               min={0}
//               max={100}
//               step={1}
//               value={Math.round((settings.bgOpacity ?? 1) * 100)}
//               onChange={(e) => setSettings({ ...settings, bgOpacity: Number(e.target.value) / 100 })}
//               className="w-full"
//             />
//           </div>

//           {message.message && (
//             <div
//               className={`text-white p-2 mt-2 rounded ${
//                 message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
//               }`}
//             >
//               {message.message}
//             </div>
//           )}
//         </div>
//       </Collapse>
//     </div>
//   );
// };

// export default ControlPanelBaselineTyping;




// //src\components\Therapy\ControlPanelBaselineTyping.tsx
// import React, { useState, useEffect } from 'react';
// import { Collapse } from 'react-collapse';
// import { db, storage } from '../../firebase/firebase';
// import { useAuth } from '../../data/AuthContext';
// import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
// import { ref, uploadBytes } from 'firebase/storage';
// import Papa from 'papaparse';
// import Slider  from '../common/Slider';
 
// interface ControlPanelBaselineTypingProps {
//   settings: any; // Replace with an explicit interface for settings if available
//   setSettings: React.Dispatch<React.SetStateAction<any>>; // Replace `any` with your settings type
//   // startAnimation: () => void;
//   // stopAnimation: () => void;
//   // resetAnimation: () => void;
// }

// const ControlPanelBaselineTyping: React.FC<ControlPanelBaselineTypingProps> = ({
//   settings,
//   setSettings,
//   // startAnimation,
//   // stopAnimation,
//   // resetAnimation,
// }) => {
//   const [isOpen, setIsOpen] = useState<boolean>(true);
//   const { currentUser } = useAuth();
//   const [presetName, setPresetName] = useState<string>('');
//   const [presetList, setPresetList] = useState<string[]>([]);
//   const [message, setMessage] = useState<{ message: string; type: 'error' | 'success' }>({ message: '', type: 'success' });

//   useEffect(() => {
//     const fetchPresets = async () => {
//       try {
//         const userDocsRef = collection(db, `users/${currentUser.uid}/animation-settings`);
//         const querySnapshot = await getDocs(userDocsRef);
//         const presets = querySnapshot.docs.map((doc) => doc.id);
//         setPresetList(presets);
//       } catch (err) {
//         console.error('Error fetching preset names:', err);
//       }
//     };

//     fetchPresets();
//   }, [currentUser]);

//   const saveCurrentSettings = async () => {
//     const timestamp = new Date();
//     const localDateTime = timestamp.toLocaleString();
//     const settingsWithTimestamp = {
//       ...settings,
//       userId: currentUser.uid,
//       timestamp: timestamp.toISOString(),
//       localDateTime,
//     };

//     /* try {
//       const userDocRef = doc(db, `users/${currentUser.uid}/animation-settings/current`);
//       await setDoc(userDocRef, settingsWithTimestamp);

//       const csvData = Object.keys(settingsWithTimestamp).map((key) => ({
//         setting: key,
//         value: settingsWithTimestamp[key],
//       }));
//       const csv = Papa.unparse(csvData);
//       const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

//       const csvRef = ref(storage, `users/${currentUser.uid}/animation-settings/current.csv`);
//       await uploadBytes(csvRef, blob);

//       setMessage({ message: 'Current settings saved successfully!', type: 'success' });
//     } catch (err) {
//       console.error('Error saving current settings:', err);
//       setMessage({ message: 'Error saving current settings. Please try again.', type: 'error' });
//     } */
//   };

//   const savePresetSettings = async () => {
//     if (!presetName) {
//       setMessage({ message: 'Please provide a name for the preset.', type: 'error' });
//       return;
//     }

//     const timestamp = new Date();
//     const localDateTime = timestamp.toLocaleString();
//     const settingsWithTimestamp = {
//       ...settings,
//       presetName,
//       userId: currentUser.uid,
//       timestamp: timestamp.toISOString(),
//       localDateTime,
//     };

//     try {
//       const userDocRef = doc(db, `users/${currentUser.uid}/animation-settings/${presetName}`);
//       await setDoc(userDocRef, settingsWithTimestamp);

//       const csvData = Object.keys(settingsWithTimestamp).map((key) => ({
//         setting: key,
//         value: settingsWithTimestamp[key],
//       }));
//       const csv = Papa.unparse(csvData);
//       const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

//       const csvRef = ref(storage, `users/${currentUser.uid}/animation-settings/${presetName}.csv`);
//       await uploadBytes(csvRef, blob);

//       setMessage({ message: 'Preset settings saved successfully!', type: 'success' });
//       if (!presetList.includes(presetName)) {
//         setPresetList([...presetList, presetName]);
//       }
//     } catch (err) {
//       console.error('Error saving preset settings:', err);
//       setMessage({ message: 'Error saving preset settings. Please try again.', type: 'error' });
//     }
//   };

//   const loadCurrentSettings = async () => {
//     try {
//       const userDocRef = doc(db, `users/${currentUser.uid}/animation-settings/current`);
//       const docSnapshot = await getDoc(userDocRef);

//       if (docSnapshot.exists()) {
//         const loadedSettings = docSnapshot.data();
//         setSettings(loadedSettings);
//         setMessage({ message: 'Current settings loaded successfully!', type: 'success' });
//       } else {
//         setMessage({ message: 'No current settings found.', type: 'error' });
//       }
//     } catch (err) {
//       console.error('Error loading current settings:', err);
//       setMessage({ message: 'Error loading current settings. Please try again.', type: 'error' });
//     }
//   };

//   const loadPresetSettings = async () => {
//     if (!presetName) {
//       setMessage({ message: 'Please provide the name of the preset to load.', type: 'error' });
//       return;
//     }

//     try {
//       const userDocRef = doc(db, `users/${currentUser.uid}/animation-settings/${presetName}`);
//       const docSnapshot = await getDoc(userDocRef);

//       if (docSnapshot.exists()) {
//         const loadedSettings = docSnapshot.data();
//         setSettings(loadedSettings);
//         setMessage({ message: 'Preset settings loaded successfully!', type: 'success' });
//       } else {
//         setMessage({ message: 'No settings found with that preset name.', type: 'error' });
//       }
//     } catch (err) {
//       console.error('Error loading preset settings:', err);
//       setMessage({ message: 'Error loading preset settings. Please try again.', type: 'error' });
//     }
//   };

//   return (
//     <div className="fixed right-4 top-2 p-4 rounded shadow-lg w-60 z-50  overflow-y-auto">
//       <button onClick={() => setIsOpen(!isOpen)} className="mb-2 bg-gray-200 text-xs p-2 rounded w-full">
//         {isOpen ? 'Collapse Controls' : 'Expand Controls'}
//       </button>
//       <Collapse isOpened={isOpen}>
//         <div className="space-y-2 text-xs">
//           <input
//             type="text"
//             placeholder="Preset Name"
//             value={presetName}
//             onChange={(e) => setPresetName(e.target.value)}
//             className="border p-2 rounded w-full"
//           />
//           <div className="flex space-x-2">
//             <button onClick={savePresetSettings} className="bg-blue-500 text-white p-2 rounded w-1/2">
//               Save Preset
//             </button>
//             <button onClick={loadPresetSettings} className="bg-yellow-500 text-white p-2 rounded w-1/2">
//               Load Preset
//             </button>
//           </div>
//           <select
//             onChange={(e) => setPresetName(e.target.value)}
//             value={presetName}
//             className="border p-2 rounded w-full"
//           >
//             <option value="">Select Preset</option>
//             {presetList.map((preset) => (
//               <option key={preset} value={preset}>
//                 {preset}
//               </option>
//             ))}
//           </select>

//           <div className="control-group text-xs">
//             <label className="block mb-2 text-xs">Background Color:</label>
//             <input
//               type="color"
//               value={settings.bgColor}
//               onChange={(e) => setSettings({ ...settings, bgColor: e.target.value })}
//               className="w-full"
//             />
//           </div>

//           {/* >>> ADDED: Background Opacity slider (0..100%) <<< */}
//           <div className="control-group text-xs">
//             <label className="block mb-2 text-xs">
//               Background Opacity: {Math.round(((settings.bgOpacity ?? 1) * 100))}
//             </label>
//             <input
//               type="range"
//               min={0}
//               max={100}
//               step={1}
//               value={Math.round((settings.bgOpacity ?? 1) * 100)}
//               onChange={(e) =>
//                 setSettings({ ...settings, bgOpacity: Number(e.target.value) / 100 })
//               }
//               className="w-full"
//             />
//           </div>

//           {message.message && (
//             <div
//               className={`text-white p-2 mt-2 rounded ${
//                 message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
//               }`}
//             >
//               {message.message}
//             </div>
//           )}
//         </div>
//       </Collapse>
//     </div>
//   );
// };

// export default ControlPanelBaselineTyping;
