// src/components/pages/TherapyPage.tsx
import React, { useState, useEffect, useCallback } from 'react';

import MultifunctionAnimation from '../Therapy/MultifunctionAnimation';
import ShapeAnimations from '../Therapy/ShapeAnimations';
import ColorAnimation from '../Therapy/ColorAnimation';
import BaselineTyping from '../Therapy/BaselineTyping';

import DateTimeDisplay from '../common/DateTimeDisplay';
import TextDisplay from '../Therapy/TextDisplay';
import TextInput from '../Therapy/TextInput';
import type { KeystrokeSavePayload } from '../Therapy/TextInput';

import { useAuth } from '../../data/AuthContext';
import { addDoc, collection } from 'firebase/firestore';
import { db, storage, rtdb } from '../../firebase/firebase';
import { ref as storageRef, uploadBytes } from 'firebase/storage';
import { ref as rtdbRef, set as rtdbSet, serverTimestamp } from 'firebase/database';
import Papa from 'papaparse';

type Tab = 'multifunction' | 'baselinetyping' | 'shape' | 'color';

interface Message { message: string; type: 'success' | 'error'; }
interface Settings { [key: string]: any; }

interface AnimSnapshot {
  tab: Tab;
  settings: any;      // snapshot at typing start
  startedAt: string;  // ISO time
}

const TherapyPage: React.FC = () => {
  // ----- Hooks (must be inside component) -----
  const [currentAnimation, setCurrentAnimation] = useState<Tab>('multifunction');
  const { currentUser } = useAuth();

  const [message, setMessage] = useState<Message | null>(null);
  const [settings, setSettings] = useState<Settings>({});
  const [displayText, setDisplayText] = useState<string>('');

  // Snapshot of animation settings on first keystroke
  const [animAtStart, setAnimAtStart] = useState<AnimSnapshot | null>(null);
  const handleTypingStart = useCallback(() => {
    setAnimAtStart({
      tab: currentAnimation,
      settings: JSON.parse(JSON.stringify(settings)), // deep copy
      startedAt: new Date().toISOString(),
    });
  }, [currentAnimation, settings]);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(t);
  }, [message]);

  // ----- Save EVERYTHING -----
  const saveKeystrokeData = async (payload: KeystrokeSavePayload) => {
    const uid = currentUser?.uid;
    if (!uid) {
      setMessage({ message: 'You must be logged in to save (no UID).', type: 'error' });
      return;
    }

    const ts = new Date();
    const sessionId = `${ts.toISOString().replace(/[:.]/g, '-')}-${Math.random().toString(36).slice(2, 8)}`;

    // Build the full record (long JSON)
    const fullRecord = {
      userId: uid,
      sessionId,

      // Which tab is active at submit (still useful)
      animationTab: currentAnimation,

      // Snapshots of animation panel
      animationAtStart: animAtStart ?? null, // could be null if paste-only
      animationAtSubmit: {
        tab: currentAnimation,
        settings: JSON.parse(JSON.stringify(settings)),
        submittedAt: ts.toISOString(),
      },

      // Keep previous single-snapshot for compatibility
      settingsSnapshot: JSON.parse(JSON.stringify(settings)),

      // Target + typed text
      targetText: payload.targetText || displayText || '',
      typedText: payload.typedText || '',

      // Keystroke stream + analysis + metrics
      keyData: payload.keyData || [],
      analysis: payload.analysis ?? null,
      metrics: payload.metrics ?? null,

      // Optional UI controls from TextInput (font, colors, opacity, etc.)
      ui: (payload as any).ui ?? undefined,

      timestamp: ts.toISOString(),
      localDateTime: ts.toLocaleString(),
      schemaVersion: 1,
    };

    try {
      // 1) STORAGE: JSON
      const jsonPath = `users/${uid}/keystroke-data/sessions/${sessionId}.json`;
      const jsonBlob = new Blob([JSON.stringify(fullRecord, null, 2)], { type: 'application/json' });
      await uploadBytes(storageRef(storage, jsonPath), jsonBlob);

      // 1b) STORAGE: CSV for key events
      const csvRows = (fullRecord.keyData || []).map((k: any, i: number) => ({
        index: i,
        key: k.key,
        pressTime: k.pressTime,
        releaseTime: k.releaseTime ?? '',
        holdTime: k.holdTime ?? '',
        lagTime: k.lagTime,
        totalLagTime: k.totalLagTime,
      }));
      const csvText = Papa.unparse(csvRows);
      const csvBlob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
      const csvPath = `users/${uid}/keystroke-data/sessions/${sessionId}.csv`;
      await uploadBytes(storageRef(storage, csvPath), csvBlob);

      // 2) FIRESTORE: summary doc (includes Storage pointers)
      const summaryDoc = {
        userId: uid,
        sessionId,
        animationTab: currentAnimation,
        animationAtStart: fullRecord.animationAtStart,
        animationAtSubmit: fullRecord.animationAtSubmit,
        targetText: fullRecord.targetText,
        typedText: fullRecord.typedText,
        metrics: fullRecord.metrics,
        storageJsonPath: jsonPath,
        storageCsvPath: csvPath,
        approxKeyCount: fullRecord.keyData.length,
        timestamp: fullRecord.timestamp,
        localDateTime: fullRecord.localDateTime,
        schemaVersion: 1,
      };
      await addDoc(collection(db, `users/${uid}/keystroke-data`), summaryDoc);

      // 3) RTDB: small summary node
      await rtdbSet(
        rtdbRef(rtdb, `users/${uid}/keystroke-data/${sessionId}`),
        {
          status: 'submitted',
          animationTab: currentAnimation,
          targetLength: fullRecord.targetText?.length ?? 0,
          typedLength: fullRecord.typedText?.length ?? 0,
          wordCount: (fullRecord.typedText || '').trim().split(/\s+/).filter(Boolean).length,
          storageJsonPath: jsonPath,
          storageCsvPath: csvPath,
          createdAt: serverTimestamp(),
          clientTs: fullRecord.timestamp,
        }
      );

      setMessage({ message: 'Saved JSON + CSV to Storage, summary to Firestore & RTDB ✔️', type: 'success' });
    } catch (err: any) {
      console.error('Save error:', err);
      setMessage({
        message: `Error saving data: ${err?.code || ''} ${err?.message || String(err)}`,
        type: 'error',
      });
    }
  };

  return (
    <div className="relative w-full">
      <div className="flex justify-center text-sm text-gray-600 rounded p-2 mb-4 w-full">
        <DateTimeDisplay />
        <button
          onClick={() => setCurrentAnimation('baselinetyping')}
          className={`p-2 mx-2 ${currentAnimation === 'baselinetyping' ? 'bg-blue-500 text-white rounded' : 'bg-gray-200'}`}
        >
          Baseline Typing
        </button>
        <button
          onClick={() => setCurrentAnimation('multifunction')}
          className={`p-2 mx-2 ${currentAnimation === 'multifunction' ? 'bg-blue-500 text-white rounded' : 'bg-gray-200'}`}
        >
          Multifunction Animation
        </button>
        <button
          onClick={() => setCurrentAnimation('shape')}
          className={`p-2 mx-2 ${currentAnimation === 'shape' ? 'bg-blue-500 text-white rounded' : 'bg-gray-200'}`}
        >
          Shape Animation
        </button>
        <button
          onClick={() => setCurrentAnimation('color')}
          className={`p-2 mx-2 ${currentAnimation === 'color' ? 'bg-blue-500 text-white rounded' : 'bg-gray-200'}`}
        >
          Color Animation
        </button>
      </div>

      {currentAnimation === 'baselinetyping' && <BaselineTyping settings={settings} setSettings={setSettings} />}
      {currentAnimation === 'multifunction' && <MultifunctionAnimation settings={settings} setSettings={setSettings} />}
      {currentAnimation === 'shape' && <ShapeAnimations settings={settings} setSettings={setSettings} />}
      {currentAnimation === 'color' && <ColorAnimation settings={settings} setSettings={setSettings} />}

      {/* push content down for background visibility */}
      <div className="relative w-full ml-52 mt-[22vh]">
        <div className="w-full max-w-9xl">
          <TextInput
            placeholder="Type here…"
            displayText={displayText}
            setDisplayText={setDisplayText}
            saveKeystrokeData={saveKeystrokeData}
            onTypingStart={handleTypingStart}  // capture animation-at-start
          />

          <div className="w-full max-w-9xl mt-4">
            <TextDisplay displayText={displayText} setDisplayText={setDisplayText} />
          </div>

          {message && (
            <div className="mt-3">
              <div
                className={`inline-block text-white text-xs px-4 py-2 rounded shadow ${
                  message.type === 'error' ? 'bg-red-500' : 'bg-green-500'
                }`}
              >
                {message.message}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TherapyPage;




// // src/components/pages/TherapyPage.tsx

// import React, { useState, useEffect, useCallback } from 'react';

// import MultifunctionAnimation from '../Therapy/MultifunctionAnimation';
// import ShapeAnimations from '../Therapy/ShapeAnimations';
// import ColorAnimation from '../Therapy/ColorAnimation';
// import BaselineTyping from '../Therapy/BaselineTyping';

// import DateTimeDisplay from '../common/DateTimeDisplay';
// import TextDisplay from '../Therapy/TextDisplay';
// import TextInput from '../Therapy/TextInput';

// import { useAuth } from '../../data/AuthContext';
// import {  addDoc, collection } from 'firebase/firestore';
// import { db, storage, rtdb } from '../../firebase/firebase';
// import { ref as storageRef, uploadBytes } from 'firebase/storage';
// import { ref as rtdbRef, set, serverTimestamp } from 'firebase/database';


// import Papa from 'papaparse';

 

// const [animAtStart, setAnimAtStart] = useState<AnimSnapshot | null>(null);

// // Called once, on the first *visible* character the user types
// const handleTypingStart = useCallback(() => {
//   setAnimAtStart({
//     tab: currentAnimation,
//     // deep clone so later panel changes don't mutate your snapshot
//     settings: JSON.parse(JSON.stringify(settings)),
//     startedAt: new Date().toISOString(),
//   });
// }, [currentAnimation, settings]);


// interface Message { message: string; type: 'success' | 'error'; }
// interface Settings { [key: string]: any; }


// // for animation setting import 
// interface AnimSnapshot {
//   tab: 'multifunction' | 'baselinetyping' | 'shape' | 'color';
//   settings: any;      // snapshot of the animation settings at typing start
//   startedAt: string;  // ISO time when the first character was typed
// }

// // Match what TextInput will send (see patch below)
// export interface KeystrokeSavePayload {
//   keyData: Array<{
//     key: string;
//     pressTime: number;
//     releaseTime: number | null;
//     holdTime: number | null;
//     lagTime: number;
//     totalLagTime: number;
//   }>;
//   typedText: string;
//   targetText: string;   // the sentence the user was supposed to copy
//   analysis?: any;
//   metrics?: any;
// }

// const TherapyPage: React.FC = () => {
//   const [currentAnimation, setCurrentAnimation] =
//     useState<'multifunction' | 'baselinetyping' | 'shape' | 'color'>('multifunction');
//   const { currentUser } = useAuth();
//   const [message, setMessage] = useState<Message | null>(null);
//   const [settings, setSettings] = useState<Settings>({});
//   const [displayText, setDisplayText] = useState<string>('');

//   useEffect(() => {
//     if (!message) return;
//     const t = setTimeout(() => setMessage(null), 3000);
//     return () => clearTimeout(t);
//   }, [message]);

//   // ---- SAVE EVERYTHING (Storage JSON + CSV, Firestore summary, RTDB summary)
//   const saveKeystrokeData = async (payload: KeystrokeSavePayload) => {
//     const uid = currentUser?.uid;
//     if (!uid) {
//       setMessage({ message: 'You must be logged in to save (no UID).', type: 'error' });
//       return;
//     }

// // keep your sessionId (great for joining across Firestore/Storage/RTDB)
// const ts = new Date();
// const sessionId = `${ts.toISOString().replace(/[:.]/g, '-')}-${Math.random()
//   .toString(36)
//   .slice(2, 8)}`;

// // Build the record
// const fullRecord = {
//   userId: uid,
//   sessionId,

//   // Which tab is active at submit (still handy)
//   animationTab: currentAnimation,

//   // 🔹 NEW: two snapshots
//   // captured once on the first visible keystroke (TherapyPage state)
//   animationAtStart: animAtStart ?? null,
//   // captured right now (submit moment)
//   animationAtSubmit: {
//     tab: currentAnimation,
//     settings: JSON.parse(JSON.stringify(settings)),
//     submittedAt: ts.toISOString(),
//   },

//   // (Optional) keep the single submit-time snapshot for backward compatibility
//   settingsSnapshot: JSON.parse(JSON.stringify(settings)),

//   // target + typed text (prefer the values passed in payload)
//   targetText: payload.targetText || displayText || '',
//   typedText: payload.typedText || '',

//   // keystroke stream and computed analysis/metrics
//   keyData: payload.keyData || [],
//   analysis: payload.analysis ?? null,
//   metrics: payload.metrics ?? null,

//   // (Optional) UI from TextInput controls (font, colors, opacity…)
//   ui: payload.ui ?? undefined,

//   timestamp: ts.toISOString(),
//   localDateTime: ts.toLocaleString(),
//   schemaVersion: 1,
// };

// /* const ts = new Date();

// const fullRecord = {
//   // ...what you already have...
//   userId: currentUser!.uid,
//   animationTab: currentAnimation,

//   // 🔹 Snapshot taken at first keystroke (may be null if user pasted only)
//   animationAtStart: animAtStart,

//   // 🔹 Snapshot at submit time (final panel values)
//   animationAtSubmit: {
//     tab: currentAnimation,
//     settings: JSON.parse(JSON.stringify(settings)),
//     submittedAt: ts.toISOString(),
//   },

//   // ...targetText, typedText, keyData, analysis, metrics, etc...
//   timestamp: ts.toISOString(),
//   localDateTime: ts.toLocaleString(),
//   schemaVersion: 1,
// };
//  */

//   /*   const ts = new Date();
//     const sessionId = `${ts.toISOString().replace(/[:.]/g, '-')}-${Math.random()
//       .toString(36)
//       .slice(2, 8)}`;

//     const fullRecord = {
//       userId: uid,
//       sessionId,
//       animationTab: currentAnimation,
//       settingsSnapshot: settings ?? {},
//       targetText: payload.targetText || displayText || '',
//       typedText: payload.typedText || '',
//       keyData: payload.keyData || [],
//       analysis: payload.analysis ?? null,
//       metrics: payload.metrics ?? null,
//       timestamp: ts.toISOString(),
//       localDateTime: ts.toLocaleString(),
//       schemaVersion: 1,
//     }; */

//     try {
//       // ===== 1) STORAGE: Upload full JSON
//       const jsonPath = `users/${uid}/keystroke-data/sessions/${sessionId}.json`;
//       const jsonBlob = new Blob([JSON.stringify(fullRecord, null, 2)], { type: 'application/json' });
     
// // Storage (JSON or CSV), e.g.:
// const json = JSON.stringify(fullRecord);
//   //await uploadBytes(storageRef(storage, jsonPath), jsonBlob);
// await uploadBytes(ref(storage, jsonPath), new Blob([json], { type: 'application/json' }));
//       // ===== 1b) STORAGE: Upload CSV for the key events
//       // Flatten keyData into CSV rows
//       const csvRows = (fullRecord.keyData || []).map((k, i) => ({
//         index: i,
//         key: k.key,
//         pressTime: k.pressTime,
//         releaseTime: k.releaseTime ?? '',
//         holdTime: k.holdTime ?? '',
//         lagTime: k.lagTime,
//         totalLagTime: k.totalLagTime,
//       }));
//       const csvText = Papa.unparse(csvRows);
//       const csvBlob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
//       const csvPath = `users/${uid}/keystroke-data/sessions/${sessionId}.csv`;
//       await uploadBytes(storageRef(storage, csvPath), csvBlob);
// /* 
//       // ===== 2) FIRESTORE: Write a summary doc (with Storage paths)
//       const summaryDoc = {
//         userId: uid,
//         sessionId,
//         animationTab: currentAnimation,
//         settingsSnapshot: settings ?? {},
//         targetText: fullRecord.targetText,
//         typedText: fullRecord.typedText,
//         metrics: fullRecord.metrics,
//         storageJsonPath: jsonPath,
//         storageCsvPath: csvPath,
//         approxKeyCount: fullRecord.keyData.length,
//         timestamp: fullRecord.timestamp,
//         localDateTime: fullRecord.localDateTime,
//         schemaVersion: 1,
//       };
//       await addDoc(collection(db, `users/${uid}/keystroke-data`), summaryDoc);

//       // ===== 3) RTDB: Small summary + references
//       const rtdbPath = `users/${uid}/sessions/${sessionId}`;
//       await set(rtdbRef(rtdb, rtdbPath), {
//         status: 'submitted',
//         animationTab: currentAnimation,
//         typedChars: (fullRecord.typedText || '').length,
//         wordCount: (fullRecord.typedText || '').trim().split(/\s+/).filter(Boolean).length,
//         storageJsonPath: jsonPath,
//         storageCsvPath: csvPath,
//         createdAt: serverTimestamp(),
//         clientTs: fullRecord.timestamp,
//       });
//  */
// // Firestore
// await addDoc(collection(db, `users/${uid}/keystroke-data`), fullRecord);



// // RTDB
// await set(ref(rtdb, `users/${uid}/keystroke-data/${sessionId}`), fullRecord);


//       setMessage({ message: 'Saved JSON + CSV to Storage, summary to Firestore & RTDB ✔️', type: 'success' });
//     } catch (err: any) {
//       console.error('Save error:', err);
//       setMessage({
//         message: `Error saving data: ${err?.code || ''} ${err?.message || String(err)}`,
//         type: 'error',
//       });
//     }
//   };


   

// console.log('[save] uid:', currentUser?.uid);
// console.log('[save] bucket:', (storage as any)._bucket?.bucket || storage.app.options.storageBucket);

//   return (
//     <div className="relative w-full">
//       <div className="flex justify-center text-sm text-gray-600 rounded p-2 mb-4 w-full">
//         <DateTimeDisplay />
//         <button
//           onClick={() => setCurrentAnimation('baselinetyping')}
//           className={`p-2 mx-2 ${currentAnimation === 'baselinetyping' ? 'bg-blue-500 text-white rounded' : 'bg-gray-200'}`}
//         >
//           Baseline Typing
//         </button>
//         <button
//           onClick={() => setCurrentAnimation('multifunction')}
//           className={`p-2 mx-2 ${currentAnimation === 'multifunction' ? 'bg-blue-500 text-white rounded' : 'bg-gray-200'}`}
//         >
//           Multifunction Animation
//         </button>
//         <button
//           onClick={() => setCurrentAnimation('shape')}
//           className={`p-2 mx-2 ${currentAnimation === 'shape' ? 'bg-blue-500 text-white rounded' : 'bg-gray-200'}`}
//         >
//           Shape Animation
//         </button>
//         <button
//           onClick={() => setCurrentAnimation('color')}
//           className={`p-2 mx-2 ${currentAnimation === 'color' ? 'bg-blue-500 text-white rounded' : 'bg-gray-200'}`}
//         >
//           Color Animation
//         </button>
//       </div>

//       {currentAnimation === 'baselinetyping' && <BaselineTyping settings={settings} setSettings={setSettings} />}
//       {currentAnimation === 'multifunction' && <MultifunctionAnimation settings={settings} setSettings={setSettings} />}
//       {currentAnimation === 'shape' && <ShapeAnimations settings={settings} setSettings={setSettings} />}
//       {currentAnimation === 'color' && <ColorAnimation settings={settings} setSettings={setSettings} />}

//       {/* content pushed down a bit for background visibility */}
//       <div className="relative w-full ml-52 mt-[22vh]">
//         <div className="w-full max-w-9xl">
//          <TextInput
//   placeholder="Type here…"
//   displayText={displayText}
//   setDisplayText={setDisplayText}
//   saveKeystrokeData={saveKeystrokeData}
//    onTypingStart={handleTypingStart}   // <- your snapshot function
// />

//           <div className="w-full max-w-9xl mt-4">
//             <TextDisplay displayText={displayText} setDisplayText={setDisplayText} />
//           </div>

//           {message && (
//             <div className="mt-3">
//               <div
//                 className={`inline-block text-white text-xs px-4 py-2 rounded shadow ${
//                   message.type === 'error' ? 'bg-red-500' : 'bg-green-500'
//                 }`}
//               >
//                 {message.message}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TherapyPage;


// // src/components/pages/TherapyPage.tsx

// import React, { useState,useEffect } from 'react';
// import MultifunctionAnimation from '../Therapy/MultifunctionAnimation';
// import ShapeAnimations from '../Therapy/ShapeAnimations';
// import ColorAnimation from '../Therapy/ColorAnimation';
// import { db } from '../../firebase/firebase';
// import { useAuth } from '../../data/AuthContext';
// import { addDoc, collection } from 'firebase/firestore'; // ← use addDoc
// import DateTimeDisplay from '../common/DateTimeDisplay';
// import TextDisplay from '../Therapy/TextDisplay';
// import TextInput from '../Therapy/TextInput';
// import Alert, { AlertType } from '../common/Alert';
// import BaselineTyping from '../Therapy/BaselineTyping';
// import { rtdb } from '../../firebase/firebase';
// import { ref, set } from 'firebase/database';
// import Papa from 'papaparse';
// async function testWrite(uid: string) {
//   await set(ref(rtdb, `users/${uid}/debug`), { ok: true, ts: Date.now() });
// }

// interface Message {
//   message: string;
//   type: 'success' | 'error';
// }

// interface Settings { [key: string]: any; }
// interface Settings {
//   [key: string]: any;
// }


// const TherapyPage: React.FC = () => {
//   const [currentAnimation, setCurrentAnimation] =
//     useState<'multifunction' | 'baselinetyping' | 'shape' | 'color'>('multifunction');
//   const { currentUser } = useAuth();
//   const [message, setMessage] = useState<Message | null>(null);
//   const [settings, setSettings] = useState<Settings>({});
//   const [displayText, setDisplayText] = useState<string>('');

//   useEffect(() => {
//     if (!message) return;
//     const t = setTimeout(() => setMessage(null), 3000);
//     return () => clearTimeout(t);
//   }, [message]);

//   // Save EVERYTHING; fallback to Storage if doc too large
//   const saveKeystrokeData = async (payload: KeystrokeSavePayload) => {
//     const uid = currentUser?.uid;
//     if (!uid) {
//       setMessage({ message: 'You must be logged in to save (no UID).', type: 'error' });
//       return;
//     }

//     const ts = new Date();
//     // Full record
//     const fullRecord = {
//       userId: uid,
//       animationTab: currentAnimation,
//       settingsSnapshot: settings ?? {},
//       targetText: payload.targetText,
//       typedText: payload.typedText,
//       keyData: payload.keyData,
//       analysis: payload.analysis,
//       metrics: payload.metrics,
//       timestamp: ts.toISOString(),
//       localDateTime: ts.toLocaleString(),
//       schemaVersion: 1,
//     };

//     try {
//       // If the JSON is very large, prefer Storage (Firestore doc limit ~1MB)
//       const json = JSON.stringify(fullRecord);
//       if (json.length > 900_000) {
//         const path = `users/${uid}/keystroke-data/sessions/${ts.toISOString()}.json`;
//         await uploadBytes(ref(storage, path), new Blob([json], { type: 'application/json' }));

//         const pointerDoc = {
//           userId: uid,
//           animationTab: currentAnimation,
//           settingsSnapshot: settings ?? {},
//           targetText: payload.targetText,
//           typedText: payload.typedText,
//           metrics: payload.metrics,     // keep summary in Firestore
//           storagePath: path,            // full detail lives in Storage
//           approxSize: json.length,
//           timestamp: ts.toISOString(),
//           localDateTime: ts.toLocaleString(),
//           schemaVersion: 1,
//         };
//         await addDoc(collection(db, `users/${uid}/keystroke-data`), pointerDoc);
//         setMessage({ message: 'Saved summary to Firestore & full JSON to Storage ✔️', type: 'success' });
//       } else {
//         await addDoc(collection(db, `users/${uid}/keystroke-data`), fullRecord);
//         setMessage({ message: 'Saved full session to Firestore ✔️', type: 'success' });
//       }

//   // Save to Firestore
       

//       // Generate CSV data
//       const csvData = responses.map((response, index) => ({
//         question: index + 1,
//         response,
//       }));
//       const csv = Papa.unparse(csvData);
//       const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

//       const csvRef = ref(storage, `users/${uid}/keystroke-data/, fullRecord}.csv`);
//       await uploadBytes(csvRef, blob);

//       setMessage({ message: `Submission successful! Your score is ${averageScore} (${normalizedScore}%)`, type: 'success' });
//       /* setTimeout(() => {
//         navigate('/thank-you', { state: { type: 'parkinsons', score: averageScore, percentageScore: normalizedScore } });
//       }, 3000); */
//     } catch (err) {
//       console.error('Error submitting :', err);
//       setMessage({ message: 'Error submitting  . Please try again.', type: 'error' });
//     }
//   };
// // const TherapyPage: React.FC = () => {
// //   const [currentAnimation, setCurrentAnimation] =
// //     useState<'multifunction' | 'baselinetyping' | 'shape' | 'color'>('multifunction');
// //   const { currentUser } = useAuth();
// //   const [message, setMessage] = useState<Message | null>(null);
// //   const [settings, setSettings] = useState<Settings>({});
// //   const [displayText, setDisplayText] = useState<string>('');

// //   // Auto-clear the message after 3 seconds
// //   useEffect(() => {
// //     if (!message) return;
// //     const timer = setTimeout(() => setMessage(null), 3000);
// //     return () => clearTimeout(timer);
// //   }, [message]);

// //   /**
// //    * Save typed keystrokes + typedText + the target sentence shown (displayText)
// //    */
// //   const saveKeystrokeData = async (payload: { keyData: any[]; errors: number; typedText: string }) => {
// //     try {
// //       // Guard: must be logged in and have a uid
// //       const uid = currentUser?.uid;
// //       if (!uid) {
// //         setMessage({ message: 'You must be logged in to save.', type: 'error' });
// //         return;
// //       }

// //       const timestamp = new Date();
// //       const data = {
// //         userId: uid,
// //         animation: currentAnimation,             // optional context
// //         targetText: displayText ?? '',           // the sentence shown
// //         typedText: payload.typedText ?? '',
// //         keyData: payload.keyData ?? [],
// //         errors: payload.errors ?? 0,
// //         timestamp: timestamp.toISOString(),
// //         localDateTime: timestamp.toLocaleString(),
// //       };

// //       // Write under users/{uid}/keystroke-data
// //       await addDoc(collection(db, `users/${uid}/keystroke-data`), data);

// //       setMessage({ message: 'Keystroke data saved successfully!', type: 'success' });
// //     } catch (err: any) {
// //       console.error('Error saving keystroke data:', err);
// //       // Show a more useful error to help debug rules / path issues
// //       setMessage({
// //         message: `Error saving keystroke data: ${err?.code || ''} ${err?.message || ''}`,
// //         type: 'error',
// //       });
// //     }
// //   };


  
//   return (
//     <div className="relative w-full ">
//       <div className="flex justify-center text-sm text-gray-600 rounded p-2 mb-4 w-full">
//         <DateTimeDisplay />

//         <button
//           onClick={() => setCurrentAnimation('baselinetyping')}
//           className={`p-2 mx-2 ${currentAnimation === 'baselinetyping' ? 'bg-blue-500 text-white rounded' : 'bg-gray-200'}`}
//         >
//           Baseline Typing
//         </button>
//         <button
//           onClick={() => setCurrentAnimation('multifunction')}
//           className={`p-2 mx-2 ${currentAnimation === 'multifunction' ? 'bg-blue-500 text-white rounded' : 'bg-gray-200'}`}
//         >
//           Multifunction Animation
//         </button>
//         <button
//           onClick={() => setCurrentAnimation('shape')}
//           className={`p-2 mx-2 ${currentAnimation === 'shape' ? 'bg-blue-500 text-white rounded' : 'bg-gray-200'}`}
//         >
//           Shape Animation
//         </button>
//         <button
//           onClick={() => setCurrentAnimation('color')}
//           className={`p-2 mx-2 ${currentAnimation === 'color' ? 'bg-blue-500 text-white rounded' : 'bg-gray-200'}`}
//         >
//           Color Animation
//         </button>
//       </div>

//       {currentAnimation === 'baselinetyping' && <BaselineTyping settings={settings} setSettings={setSettings} />}
//       {currentAnimation === 'multifunction' && <MultifunctionAnimation settings={settings} setSettings={setSettings} />}
//       {currentAnimation === 'shape' && <ShapeAnimations settings={settings} setSettings={setSettings} />}
//       {currentAnimation === 'color' && <ColorAnimation settings={settings} setSettings={setSettings} />}

//       {/* MAIN CONTENT */}
//     <div className="relative w-full ml-52 mt-[22vh]">
//         <div className="w-full max-w-9xl">
//           {/* Typing area (left aligned) */}
//           <TextInput
//             placeholder="Type here…"
//             displayText={displayText}
//             setDisplayText={setDisplayText}
//             saveKeystrokeData={saveKeystrokeData}
//           />

//           {/* Text to copy (left aligned, full width) */}
//           <div className="w-full max-w-9xl mt-4">
//             <TextDisplay displayText={displayText} setDisplayText={setDisplayText} />
//           </div>

//           {/* Inline message */}
//           {message && (
//             <div className="mt-3">
//               <div
//                 className={`inline-block text-white text-xs px-4 py-2 rounded shadow ${
//                   message.type === 'error' ? 'bg-red-500' : 'bg-green-500'
//                 }`}
//               >
//                 {message.message}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TherapyPage;



//+++++++++++JS version+++++++++++++++++

// // src\components\pages\TherapyPage.jsx
//  // JS version
// import React, { useState } from 'react';
// import MultifunctionAnimation from '../Therapy/MultifunctionAnimation';
// import ShapeAnimations from '../Therapy/ShapeAnimations';
// import ColorAnimation from '../Therapy/ColorAnimation';
// import { db } from '../../firebase/firebase';
// import { useAuth } from '../../data/AuthContext';
// import { doc, setDoc, collection } from 'firebase/firestore';
// import DateTimeDisplay from '../common/DateTimeDisplay';
// import TextDisplay from '../Therapy/TextDisplay';
// import TextInput from '../Therapy/TextInput';

// const TherapyPage = () => {
//   const [currentAnimation, setCurrentAnimation] = useState('multifunction');
//   const { currentUser } = useAuth();
//   const [message, setMessage] = useState({ message: '', type: '' });
//   const [settings, setSettings] = useState({}); // Assuming settings structure is compatible across all animations
//   const [displayText, setDisplayText] = useState('');

//   const saveKeystrokeData = async (keyData) => {
//     try {
//       const timestamp = new Date().toISOString();
//       const userDocRef = doc(collection(db, `users/${currentUser.uid}/keystroke-data`));
//       await setDoc(userDocRef, { keyData, timestamp });
//       setMessage({ message: 'Keystroke data saved successfully!', type: 'success' });
//     } catch (error) {
//       console.error('Error saving keystroke data:', error);
//       setMessage({ message: 'Error saving keystroke data. Please try again.', type: 'error' });
//     }
//   };

//   return (
//     <div className="relative w-full">
//       <div className="flex justify-center text-sm text-gray-600 rounded p-2 mb-4 w-full">
//         <DateTimeDisplay />
//         <button
//           onClick={() => setCurrentAnimation('multifunction')}
//           className={`p-2 mx-2 ${currentAnimation === 'multifunction' ? 'bg-blue-500 text-white rounded' : 'bg-gray-200'}`}
//         >
//           Multifunction Animation
//         </button>
//         <button
//           onClick={() => setCurrentAnimation('shape')}
//           className={`p-2 mx-2 ${currentAnimation === 'shape' ? 'bg-blue-500 text-white rounded' : 'bg-gray-200'}`}
//         >
//           Shape Animation
//         </button>
//         <button
//           onClick={() => setCurrentAnimation('color')}
//           className={`p-2 mx-2 ${currentAnimation === 'color' ? 'bg-blue-500 text-white rounded' : 'bg-gray-200'}`}
//         >
//           Color Animation
//         </button>
//       </div>

//       {message.message && (
//         <div className={`alert ${message.type === 'error' ? 'bg-red-500' : 'bg-green-500'} text-white p-2 rounded mb-4`}>
//           {message.message}
//         </div>
//       )}

//       {currentAnimation === 'multifunction' && <MultifunctionAnimation settings={settings} setSettings={setSettings} />}
//       {currentAnimation === 'shape' && <ShapeAnimations settings={settings} setSettings={setSettings} />}
//       {currentAnimation === 'color' && <ColorAnimation settings={settings} setSettings={setSettings} />}
      
//       <div className="relative w-full z-25 p-4">
//   <TextInput placeholder="Type here..." displayText={displayText} saveKeystrokeData={saveKeystrokeData} />
// </div>
// {/* <div className="relative center-0 right-0 w-1/3   p-4">
//   <TextDisplay displayText={displayText} setDisplayText={setDisplayText} />
// </div> */}
// <div className="absolute center-820 right-0 w-1/3 z-225 p-4">
//   <TextDisplay displayText={displayText} setDisplayText={setDisplayText} />
// </div>
       
      
//     </div>
//   );
// };

// export default TherapyPage;





//--------------------------------------------
// // src/pages/TherapyPage.jsx
// import React, { useState } from 'react';
// import MultifunctionAnimation from '../Therapy/MultifunctionAnimation';
// import ShapeAnimations from '../Therapy/ShapeAnimations';
// import ColorAnimation from '../Therapy/ColorAnimation';
// import { db, storage } from '../../firebase/firebase';
// import { useAuth } from '../../data/AuthContext';
// import { doc, setDoc, getDocs, collection } from 'firebase/firestore';
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// import Papa from 'papaparse';
// import DateTimeDisplay from '../common/DateTimeDisplay';
// import AnimationTextDisplay from '../Therapy/AnimationTextDisplay';
// const TherapyPage = () => {
//   const [currentAnimation, setCurrentAnimation] = useState('multifunction');
//   const { currentUser } = useAuth();
//   const [message, setMessage] = useState({ message: '', type: '' });
//   const [settings, setSettings] = useState({}); // Assuming settings structure is compatible across all animations

//   /* const saveSettings = async () => {
//     try {
//       const timestamp = new Date().toISOString();
//       const userDocRef = doc(collection(db, `users/${currentUser.uid}/animation-settings`));
//       await setDoc(userDocRef, { ...settings, timestamp });
//       setMessage({ message: 'Settings saved successfully!', type: 'success' });
//     } catch (error) {
//       console.error('Error saving settings:', error);
//       setMessage({ message: 'Error saving settings. Please try again.', type: 'error' });
//     }
//   };

//   const loadSettings = async () => {
//     try {
//       const querySnapshot = await getDocs(collection(db, `users/${currentUser.uid}/animation-settings`));
//       const settingsList = [];
//       querySnapshot.forEach((doc) => {
//         settingsList.push(doc.data());
//       });
//       // For simplicity, we load the most recent settings
//       if (settingsList.length > 0) {
//         setSettings(settingsList[settingsList.length - 1]);
//         setMessage({ message: 'Settings loaded successfully!', type: 'success' });
//       } else {
//         setMessage({ message: 'No settings found.', type: 'error' });
//       }
//     } catch (error) {
//       console.error('Error loading settings:', error);
//       setMessage({ message: 'Error loading settings. Please try again.', type: 'error' });
//     }
//   };
//  */
//   return (
//     <div>
//         <div className="flex justify-center text-sm text-gray-600 rounded p-2  mb-4">
//         <DateTimeDisplay />
//         <button
//           onClick={() => setCurrentAnimation('multifunction')}
//           className={`p-2 mx-2 ${currentAnimation === 'multifunction' ? 'bg-blue-500 text-white p-2 mx-2 rounded' : 'bg-gray-200'}`}
//         >
//           Multifunction Animation
//         </button>
//         <button
//           onClick={() => setCurrentAnimation('shape')}
//           className={`p-2 mx-2 ${currentAnimation === 'shape' ?  'bg-blue-500 text-white p-2 mx-2 rounded': 'bg-gray-200'}`}
//         >
//           Shape Animation
//         </button>
//         <button
//           onClick={() => setCurrentAnimation('color')}
//           className={`p-2 mx-2 ${currentAnimation === 'color' ?  'bg-blue-500 text-white p-2 mx-2 rounded' : 'bg-gray-200'}`}
//         >
//           Color Animation
//         </button>
//     {/*   <div className="flex justify-center mb-4">
//         <button onClick={saveSettings} className="bg-green-500 text-white p-2 mx-2 rounded">Save Settings</button>
//         <button onClick={loadSettings} className="bg-yellow-500 text-white p-2 mx-2 rounded">Load Settings</button>
//       </div> */}
//       </div>
      
//     {/*   {message.message && (
//         <div className={`alert ${message.type === 'error' ? 'bg-red-500' : 'bg-green-500'} text-white p-2 rounded`}>
//           {message.message}
//         </div>
//       )} */}
//       {currentAnimation === 'multifunction' && <MultifunctionAnimation settings={settings} setSettings={setSettings} />}
//       {currentAnimation === 'shape' && <ShapeAnimations settings={settings} setSettings={setSettings} />}
//       {currentAnimation === 'color' && <ColorAnimation settings={settings} setSettings={setSettings} />}
  
   
//       </div>
      
//   );
// };

// export default TherapyPage;

 

//--------------------------------------
/*   // src/pages/TherapyPage.jsx
import React from 'react';
 import MultifunctionAnimation from '../Therapy/MultifunctionAnimation';
import ShapeAnimations from '../Therapy/ShapeAnimations';
  
  
  import ColorAnimation from '../Therapy/ColorAnimation';
  
const TherapyPage = () => {
  
  return (
    <div>
      <ColorAnimation  />
    </div>
  );
};

export default TherapyPage;  
  */
//------------------------------------------
/* // src/pages/TherapyPage.jsx
import React, { useState } from 'react';
import MultifunctionAnimation from '../Therapy/MultifunctionAnimation';
import ShapeAnimations from '../Therapy/ShapeAnimations';

const TherapyPage = () => {
  const [animationType, setAnimationType] = useState('wave');

  const toggleAnimationType = (type) => {
    setAnimationType(type);
  };

  return (
    <div>
      <nav id="MainNavigation">
        <div className="dropdown">
          <button className="dropbtn">
            <h1><strong>STABLE GAIT THERAPY</strong></h1>
            Please Choose Your Background
          </button>
          <div className="dropdown-content">
            <a href="#" onClick={() => toggleAnimationType('shapes')}>Shapes Animation</a>
            <a href="#" onClick={() => toggleAnimationType('wave')}>Wave Animation</a>
          </div>
        </div>
      </nav>
      {animationType === 'wave' ? <MultifunctionAnimation /> : <ShapeAnimations />}
    </div>
  );
};

export default TherapyPage;

 */
 
//------------------------------------------
/* // src/components/pages/TherapyPage.jsx
import React, { useState } from 'react';
import MultifunctionAnimation from '../Therapy/MultifunctionAnimation';
import ShapeAnimation from '../Therapy/ShapeAnimations';
import AnimationBackground from '../Therapy/AnimationBackground';
import ColorAnimation from '../Therapy/ColorAnimation';
import ControlPanelColor from '../Therapy/ControlPanelColor';

const TherapyPage = () => {
 /*  const [currentAnimation, setCurrentAnimation] = useState('multifunction');
  const [colorSettings, setColorSettings] = useState({
    colors: ['#630F8B', '#0000FF', '#EA11CF', '#000000'],
    duration: 5,
  }); */

/*   const renderAnimation = () => {
    switch (currentAnimation) {
      case 'multifunction':
        return <MultifunctionAnimation />;
      case 'shape':
        return <ShapeAnimation />;
      case 'background':
        return <AnimationBackground />;
      case 'color':
        return <ColorAnimation settings={colorSettings} />;
      default:
        return <MultifunctionAnimation />;
    }
  };

  const renderControlPanel = () => {
    switch (currentAnimation) {
      case 'color':
        return <ControlPanelColor settings={colorSettings} setSettings={setColorSettings} />;
      default:
        return null;
    }
  };

  return (
    <div className="therapy-page">
      <div className="flex justify-center mb-4">
        <button
          onClick={() => setCurrentAnimation('multifunction')}
          className={`p-2 mx-2 ${currentAnimation === 'multifunction' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Multifunction Animation
        </button>
        <button
          onClick={() => setCurrentAnimation('shape')}
          className={`p-2 mx-2 ${currentAnimation === 'shape' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Shape Animation
        </button>
        <button
          onClick={() => setCurrentAnimation('background')}
          className={`p-2 mx-2 ${currentAnimation === 'background' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Background Animation
        </button>
        <button
          onClick={() => setCurrentAnimation('color')}
          className={`p-2 mx-2 ${currentAnimation === 'color' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Color Animation
        </button>
      </div>
      {renderControlPanel()}
      {renderAnimation()}
    </div>
  );
};

export default TherapyPage; */
 

//--------------------------------------------------
  