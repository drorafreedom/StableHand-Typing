// src/components/pages/TherapyPage.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';

import MultifunctionAnimation from '../Therapy/MultifunctionAnimation';
import ShapeAnimations from '../Therapy/ShapeAnimations';
import ColorAnimation from '../Therapy/ColorAnimation';
import BaselineTyping from '../Therapy/BaselineTyping';
import PhotoAnimations from '../Therapy/PhotoAnimations';
import DateTimeDisplay from '../common/DateTimeDisplay';
import TextDisplay from '../Therapy/TextDisplay';
import TextInput from '../Therapy/TextInput';

import { useAuth } from '../../data/AuthContext';
import { addDoc, collection, serverTimestamp as fsServerTimestamp } from 'firebase/firestore';
import { db, storage, rtdb } from '../../firebase/firebase';
import { ref as storageRef, uploadBytes } from 'firebase/storage';
import { ref as rtdbRef, set as rtdbSet, serverTimestamp } from 'firebase/database';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import type { TextMeta, TextCategory } from '../../data/text';

import {
  cloneDefaults as cloneColorDefaults,
  DEFAULT_SETTINGS as COLOR_DEFAULT_SETTINGS,
} from '../Therapy/ColorAnimation';

import {
  cloneDefaults as cloneMultifuncionDefaults,
  DEFAULT_SETTINGS as MULTIFUNCTION_DEFAULT_SETTINGS,
} from '../Therapy/MultifunctionAnimation';

 import {
  cloneDefaults as cloneShapeDefaults,
  DEFAULT_SETTINGS as SHAPES_DEFAULT_SETTINGS,
} from '../Therapy/ShapeAnimations';

 import {
  cloneDefaults as cloneBaselinetypingDefaults,
  DEFAULTS as BASELINETYPING_DEFAULT_SETTINGS,
} from '../Therapy/BaselineTyping';

// imports
import  {
  cloneDefaults as clonePhotoDefaults,
  DEFAULT_SETTINGS as PHOTO_DEFAULT_SETTINGS,
} from '../Therapy/PhotoAnimations';



type Tab = 'multifunction' | 'baselinetyping' | 'shape' | 'color'| 'photo';
interface Message { message: string; type: 'success' | 'error'; }
interface Settings { [key: string]: any; }

interface AnimSnapshot {
  tab: Tab;
  settings: any;
  startedAt: string;
}

export interface KeystrokeSavePayload {
  keyData: Array<{
    key: string;
    pressTime: number;
    releaseTime: number | null;
    holdTime: number | null;
    lagTime: number;
    totalLagTime: number;
  }>;
  typedText: string;
  targetText: string;
  analysis: any;
  metrics: any;
  event?: 'submit' | 'reset-typing' | 'reset-text+typing';
   //rolledNew?: boolean; // ← if we want to option of clear and new not necessary
  ui?: {
    font: string;
    fontSize: number;
    isBold: boolean;
    textColor: string;
    backgroundColor: string;
    backgroundOpacity: number;
  };
  // NEW (these already come from TextInput)
  textMeta?: {
   category: import('../../data/text').TextCategory;
   label: string;
   index: number | null;
   presetId: string | null;
 };
  textContext?: {
   category: import('../../data/text').TextCategory;
   label: string;
   index: number | null;
    presetId: string | null;
   targetTextSnapshot: string;
  };
 tags?: { category: import('../../data/text').TextCategory };
 }

 

// ------- utils (same as before) -------
const isPlainObject = (v: any) =>
  Object.prototype.toString.call(v) === '[object Object]';

const flattenToKeyValueRows = (obj: any, prefix = ''): Array<{ key: string; value: any }> => {
  const rows: Array<{ key: string; value: any }> = [];
  const walk = (o: any, pfx: string) => {
    if (Array.isArray(o)) { rows.push({ key: pfx, value: JSON.stringify(o) }); return; }
    if (!isPlainObject(o)) { rows.push({ key: pfx, value: o }); return; }
    for (const k of Object.keys(o)) {
      const nk = pfx ? `${pfx}.${k}` : k;
      const v = o[k];
      if (isPlainObject(v)) walk(v, nk);
      else if (Array.isArray(v)) rows.push({ key: nk, value: JSON.stringify(v) });
      else rows.push({ key: nk, value: v });
    }
  };
  walk(obj, prefix);
  return rows;
};

const perKeyToRows = (perKey: Record<string, { count: number; meanHoldMs: number; meanLagMs: number }>) =>
  Object.entries(perKey || {}).map(([ch, v]) => ({
    key: ch,
    count: v.count,
    meanHoldMs: v.meanHoldMs,
    meanLagMs: v.meanLagMs,
  }));

const opsToRows = (
  ops: Array<{ op: 'match'|'ins'|'del'|'sub'; a?: string; b?: string; ai: number; bi: number }>
) => (ops || []).map((o, i) => ({
  index: i,
  op: o.op,
  a: o.a ?? '',
  b: o.b ?? '',
  ai: o.ai,
  bi: o.bi,
}));

// ------- per-tab defaults so settings never start as {} -------
const DEFAULTS: Record<Tab, any> = {
  baselinetyping:  cloneBaselinetypingDefaults(),
  color:           cloneColorDefaults(),
  multifunction:   cloneMultifuncionDefaults(),
  shapes:          cloneShapeDefaults(),
   photo: clonePhotoDefaults(),
 /* 
  multifunction: {
 
     
      waveType: 'sine',
      direction: 'static',
      angle: 0,
      amplitude: 10,
      frequency: 10,
      speed: 5,
      thickness: 1,
      phaseOffset: 0,
      numLines: 1,
      distance: 0,
      bgColor: '#ffffff',
      lineColor: '#FF0000',
      selectedPalette: 'none',
      rotationSpeed: 0.02,
      rotationRadius: 150,
      oscillationRange: 100,
      groups: 1,
      groupDistance: 100,
        // <<< ADD defaults
  bgOpacity: 1,
  lineOpacity: 1,
  lineOpacityMode: 'constant',
  lineOpacitySpeed: 1,
   yOffsetPx: 0,
  fitHeight: false,
  
  }, */
 /*  shape: {
    shapeType: 'circle',
    direction: 'static',
    rotationSpeed: 0.2,
    rotationRadius: 120,
    oscillationRange: 120,
    angle: 0,             // radians
    speed: 5,
    size: 60,
    numShapes: 20,
    bgColor: '#000000',
    shapeColor: '#ffffff',
    secondColor: '#ff00ff',
    palette: 'none',
    layoutSelect: 'random',
    rowOffset: 0,
    columnOffset: 0,
    rowDistance: 40,
    columnDistance: 40,

      bgOpacity: 1,
  bgOpacityMode: 'constant',
  bgOpacitySpeed: 1,
  shapeOpacity: 1,
  shapeOpacityMode: 'constant',
  shapeOpacitySpeed: 1,
  } */
};

const TherapyPage: React.FC = () => {
  
  const { currentUser } = useAuth();
  
  // ✅ Hooks must be inside the component function body
  // state
    const [displayText, setDisplayText] = useState('');
const [textMeta, setTextMeta] = useState<TextMeta>({
  category: 'classic',
  label: 'Classic first lines',
  index: null,
  presetId: null,
});

  

  


  // 1) tab + synchronous ref to avoid race on first key
  const [currentAnimation, _setCurrentAnimation] = useState<Tab>('multifunction');
    //const [currentAnimation, _setCurrentAnimation] = useState<Tab>('baselinetyping');
  const currentTabRef = useRef<Tab>('multifunction');
  const setCurrentAnimation = (t: Tab) => { currentTabRef.current = t; _setCurrentAnimation(t); };

  // 2) per-tab settings map + ref (so snapshot reads the newest values even if React batches)
  const [settingsByTab, setSettingsByTab] = useState<Record<Tab, any>>({
    multifunction: { ...DEFAULTS.multifunction },
    baselinetyping: { ...DEFAULTS.baselinetyping },
    shape: { ...DEFAULTS.shape },
    color: { ...DEFAULTS.color },
      photo: { ...DEFAULTS.photo },
  });
  const settingsRef = useRef(settingsByTab);
  useEffect(() => { settingsRef.current = settingsByTab; }, [settingsByTab]);

  // 3) a setter that only touches the *current tab* bucket
  const setSettingsForCurrentTab = useCallback<React.Dispatch<React.SetStateAction<Settings>>>(
    (updater) => {
      const tab = currentTabRef.current; // read synchronously
      setSettingsByTab(prev => {
        const curr = prev[tab] ?? {};
        const next = typeof updater === 'function' ? (updater as any)(curr) : updater;
        return { ...prev, [tab]: next };
      });
    },
    []
  );

  const [message, setMessage] = useState<Message | null>(null);
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(t);
  }, [message]);

  // Re-arm TextInput between sessions (forces remount so onTypingStart can fire again)
  const [typingKey, setTypingKey] = useState<number>(() => Date.now());

  // Snapshot at first visible key
  const [animAtStart, setAnimAtStart] = useState<AnimSnapshot | null>(null);
  const handleTypingStart = useCallback(() => {
    const tab = currentTabRef.current;                         // <- no race
    const tabSettings = settingsRef.current[tab] ?? {};
    setAnimAtStart({
      tab,
      settings: JSON.parse(JSON.stringify(tabSettings)),
      startedAt: new Date().toISOString(),
    });
  }, []);

  //const [displayText, setDisplayText] = useState<string>('');

  // ---------- SAVE (unchanged structure) ----------
 
  const saveKeystrokeData = async (payload: KeystrokeSavePayload) => {
    
    
     const event = payload.event ?? 'reset-typing';
const attemptType = event === 'submit' ? 'final' : 'practice';
//const rolledNew = !!payload.rolledNew; // ← define it here
const uid = currentUser?.uid;
    if (!uid) { setMessage({ message: 'You must be logged in to save (no UID).', type: 'error' }); return; }

    const ts = new Date();
    const sessionId = `${ts.toISOString().replace(/[:.]/g, '-')}-${Math.random().toString(36).slice(2, 8)}`;

    const submitTab = currentTabRef.current;  // read synchronously
    const submitSettings = JSON.parse(JSON.stringify(settingsRef.current[submitTab] ?? {}));

    const fullRecord = {
      userId: uid,
      sessionId,
      animationTab: submitTab,
      animationAtStart: animAtStart ?? null,
      animationAtSubmit: {
        tab: submitTab,
        settings: submitSettings,
        submittedAt: ts.toISOString(),
      },
      settingsSnapshot: submitSettings, // legacy

      targetText: payload.targetText || displayText || '',
      typedText: payload.typedText || '',
      keyData: payload.keyData || [],
      analysis: payload.analysis ?? null,
      metrics: payload.metrics ?? null,
      ui: payload.ui ?? undefined,

          // NEW: persist the text meta/context/tags
    textMeta: payload.textMeta ?? null,
    textContext: payload.textContext ?? null,
    //  tags: payload.tags ?? undefined,
    tags: payload.tags ?? (payload.textMeta ? { category: payload.textMeta.category } : undefined),
  event,             // ← new
  attemptType,       // ← new
    //rolledNew, // for reset and new 
      timestamp: ts.toISOString(),
      localDateTime: ts.toLocaleString(),
      schemaVersion: 1,
    };

    try {
      // ---------- STORAGE: JSON ----------
      
      
      //const basePath = `users/${uid}/keystroke-data/sessions/${sessionId}`;
      const basePath = `users/${uid}/keystroke-data/${attemptType}/${sessionId}`; // 'final' or 'practice'
      const jsonPath = `${basePath}/${sessionId}.json`;
      const jsonText = JSON.stringify(fullRecord, null, 2);
      await uploadBytes(storageRef(storage, jsonPath), new Blob([jsonText], { type: 'application/json' }));

      // ---------- STORAGE: XLSX (multi-sheet) ----------
     /*  const wb = XLSX.utils.book_new();

      const flatRows = flattenToKeyValueRows({
        userId: fullRecord.userId,
        sessionId: fullRecord.sessionId,
        animationTab: fullRecord.animationTab,
        animationAtStart: fullRecord.animationAtStart,
        animationAtSubmit: fullRecord.animationAtSubmit,
        targetText: fullRecord.targetText,
        typedText: fullRecord.typedText,
        metrics: fullRecord.metrics,
        ui: fullRecord.ui ?? {},
        timestamp: fullRecord.timestamp,
        localDateTime: fullRecord.localDateTime,
        schemaVersion: fullRecord.schemaVersion,
      });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(flatRows), 'Summary');

      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet([
          { name: 'targetText', value: fullRecord.targetText ?? '' },
          { name: 'typedText',  value: fullRecord.typedText  ?? '' },
        ]),
        'Texts'
      );

      const keyRows = (fullRecord.keyData || []).map((k: any, i: number) => ({
        index: i,
        key: k.key,
        pressTime: k.pressTime,
        releaseTime: k.releaseTime ?? '',
        holdTime: k.holdTime ?? '',
        lagTime: k.lagTime,
        totalLagTime: k.totalLagTime,
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(keyRows), 'KeyEvents');

      const perKeyRowsArr = perKeyToRows(fullRecord.metrics?.perKey || {});
      if (perKeyRowsArr.length) {
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(perKeyRowsArr), 'PerKey');
      }

      const charOpsRows = opsToRows(fullRecord.analysis?.char?.ops || []);
      if (charOpsRows.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(charOpsRows), 'CharOps');
      const wordOpsRows = opsToRows(fullRecord.analysis?.word?.ops || []);
      if (wordOpsRows.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(wordOpsRows), 'WordOps');

      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const xlsxBlob = new Blob([wbout], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const xlsxPath = `${basePath}/${sessionId}.xlsx`;
      await uploadBytes(storageRef(storage, xlsxPath), xlsxBlob);

      // ---------- STORAGE: CSVs ----------
      const flatCsv = Papa.unparse(flatRows);
      await uploadBytes(storageRef(storage, `${basePath}/${sessionId}.session_flat.csv`), new Blob([flatCsv], { type: 'text/csv;charset=utf-8;' }));
      const keyCsv = Papa.unparse(keyRows);
      await uploadBytes(storageRef(storage, `${basePath}/${sessionId}.key_events.csv`), new Blob([keyCsv], { type: 'text/csv;charset=utf-8;' }));
      if (perKeyRowsArr.length) {
        const perKeyCsv = Papa.unparse(perKeyRowsArr);
        await uploadBytes(storageRef(storage, `${basePath}/${sessionId}.per_key.csv`), new Blob([perKeyCsv], { type: 'text/csv;charset=utf-8;' }));
      }
      if (charOpsRows.length) {
        const charOpsCsv = Papa.unparse(charOpsRows);
        await uploadBytes(storageRef(storage, `${basePath}/${sessionId}.char_ops.csv`), new Blob([charOpsCsv], { type: 'text/csv;charset=utf-8;' }));
      }
      if (wordOpsRows.length) {
        const wordOpsCsv = Papa.unparse(wordOpsRows);
        await uploadBytes(storageRef(storage, `${basePath}/${sessionId}.word_ops.csv`), new Blob([wordOpsCsv], { type: 'text/csv;charset=utf-8;' }));
      } */
// ---------- STORAGE: XLSX (multi-sheet, always all sheets) ----------
const wb = XLSX.utils.book_new();

// Build normalized row arrays up-front
const flatRows = flattenToKeyValueRows({
  userId: fullRecord.userId,
  sessionId: fullRecord.sessionId,
  animationTab: fullRecord.animationTab,
  animationAtStart: fullRecord.animationAtStart,
  animationAtSubmit: fullRecord.animationAtSubmit,
  targetText: fullRecord.targetText,
  typedText: fullRecord.typedText,
  metrics: fullRecord.metrics,
  ui: fullRecord.ui ?? {},

    textMeta: fullRecord.textMeta,
   textContext: fullRecord.textContext,
   //recording what type of data submit( final ) or reset type/ reset type + textg ( practice ) 
  event,             // ← new
  attemptType,       // ← new
   // rolledNew,
  
  createdAt: serverTimestamp(),
  timestamp: fullRecord.timestamp,
  localDateTime: fullRecord.localDateTime,
  schemaVersion: fullRecord.schemaVersion,
});

const textRows = [
  { name: 'targetText', value: fullRecord.targetText ?? '' },
  { name: 'typedText',  value: fullRecord.typedText  ?? '' },
];

const keyRows = (fullRecord.keyData || []).map((k: any, i: number) => ({
  index: i,
  key: k.key,
  pressTime: k.pressTime,
  releaseTime: k.releaseTime ?? '',
  holdTime: k.holdTime ?? '',
  lagTime: k.lagTime,
  totalLagTime: k.totalLagTime,
}));

const perKeyRowsArr = perKeyToRows(fullRecord.metrics?.perKey || {});
const charOpsRows  = opsToRows(fullRecord.analysis?.char?.ops || []);
const wordOpsRows  = opsToRows(fullRecord.analysis?.word?.ops || []);

// helper: make a sheet even when rows are empty (header-only)
const ensureSheet = (name: string, rows: any[], header: string[]) => {
  const ws = rows.length
    ? XLSX.utils.json_to_sheet(rows)
    : XLSX.utils.aoa_to_sheet([header]);
  XLSX.utils.book_append_sheet(wb, ws, name);
};

// A) Summary
ensureSheet('Summary', flatRows, ['key', 'value']);

// B) Texts (always has 2 rows)
XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(textRows), 'Texts');

// C) KeyEvents
ensureSheet('KeyEvents', keyRows, [
  'index', 'key', 'pressTime', 'releaseTime', 'holdTime', 'lagTime', 'totalLagTime'
]);

// D) PerKey  (headers match your perKeyToRows)
ensureSheet('PerKey', perKeyRowsArr, ['key', 'count', 'meanHoldMs', 'meanLagMs']);

// E) CharOps (headers match your opsToRows)
ensureSheet('CharOps', charOpsRows, ['index', 'op', 'a', 'b', 'ai', 'bi']);

// F) WordOps
ensureSheet('WordOps', wordOpsRows, ['index', 'op', 'a', 'b', 'ai', 'bi']);

// write workbook
const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
const xlsxBlob = new Blob([wbout], {
  type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
});
//const xlsxPath = `${basePath}/${sessionId}.xlsx`;
const xlsxPath = `${basePath}/${sessionId}.session.xlsx`;
await uploadBytes(storageRef(storage, xlsxPath), xlsxBlob);

// ---------- STORAGE: CSVs (always write 5 files, header-only when empty) ----------
const toCsv = (rows: any[], headers: string[]) => {
  return rows.length
    ? Papa.unparse(rows)
    : Papa.unparse({ fields: headers, data: [] }); // header-only CSV
};

// A) flat/session summary
const flatCsv = Papa.unparse(flatRows);
await uploadBytes(
  storageRef(storage, `${basePath}/${sessionId}.session_flat.csv`),
  new Blob([flatCsv], { type: 'text/csv;charset=utf-8;' })
);

// B) key events
const keyCsv = toCsv(keyRows, [
  'index', 'key', 'pressTime', 'releaseTime', 'holdTime', 'lagTime', 'totalLagTime'
]);
await uploadBytes(
  storageRef(storage, `${basePath}/${sessionId}.key_events.csv`),
  new Blob([keyCsv], { type: 'text/csv;charset=utf-8;' })
);

// C) per-key stats
const perKeyCsv = toCsv(perKeyRowsArr, ['key', 'count', 'meanHoldMs', 'meanLagMs']);
await uploadBytes(
  storageRef(storage, `${basePath}/${sessionId}.per_key.csv`),
  new Blob([perKeyCsv], { type: 'text/csv;charset=utf-8;' })
);

// D) char-level ops
const charOpsCsv = toCsv(charOpsRows, ['index', 'op', 'a', 'b', 'ai', 'bi']);
await uploadBytes(
  storageRef(storage, `${basePath}/${sessionId}.char_ops.csv`),
  new Blob([charOpsCsv], { type: 'text/csv;charset=utf-8;' })
);

// E) word-level ops
const wordOpsCsv = toCsv(wordOpsRows, ['index', 'op', 'a', 'b', 'ai', 'bi']);
await uploadBytes(
  storageRef(storage, `${basePath}/${sessionId}.word_ops.csv`),
  new Blob([wordOpsCsv], { type: 'text/csv;charset=utf-8;' })
);

      // ---------- FIRESTORE ----------
      
      const jsonSize = jsonText.length;
      const storagePaths = {
        json: jsonPath,
        xlsx: xlsxPath,
        csv: {
          flat: `${basePath}/${sessionId}.session_flat.csv`,
          keyEvents: `${basePath}/${sessionId}.key_events.csv`,
          perKey: `${basePath}/${sessionId}.per_key.csv`,
          charOps: `${basePath}/${sessionId}.char_ops.csv`,
          wordOps: `${basePath}/${sessionId}.word_ops.csv`,
        },
      };
//if jason is too big to be stored at least the important information is stored . 
      if (jsonSize < 900_000) {
        await addDoc(collection(db, `users/${uid}/keystroke-data`), {
    ...fullRecord,          // full JSON
    storagePaths,
    // createdAt: serverTimestamp(), // 
   createdAt: fsServerTimestamp(),
  });
      } else {
        await addDoc(collection(db, `users/${uid}/keystroke-data`), {
      userId: uid,
    sessionId,
    animationTab: fullRecord.animationTab,
    animationAtStart: fullRecord.animationAtStart,
    animationAtSubmit: fullRecord.animationAtSubmit,
    targetText: fullRecord.targetText,
    typedText: fullRecord.typedText,
    metrics: fullRecord.metrics,
    approxKeyCount: (fullRecord.keyData || []).length,

    // include ONCE:
    textCategory: fullRecord.textMeta?.category ?? 'unknown',
    textPresetId: fullRecord.textMeta?.presetId ?? null,

    // attemptType: fullRecord.attemptType,  // 'practice' | 'final'
    // endedBy: fullRecord.endedBy,          // 'reset' | 'submit'
    event,
    attemptType,
      //rolledNew,    
    timestamp: fullRecord.timestamp,
    localDateTime: fullRecord.localDateTime,
    schemaVersion: fullRecord.schemaVersion,
    storagePaths,
    createdAt: fsServerTimestamp(),
        });
      }

      // ---------- RTDB ----------
      await rtdbSet(
        rtdbRef(rtdb, `users/${uid}/keystroke-data/${sessionId}`),
        {
          status: 'submitted',
          animationTab: fullRecord.animationTab,
          targetLength: fullRecord.targetText?.length ?? 0,
          typedLength: fullRecord.typedText?.length ?? 0,
          wordCount: (fullRecord.typedText || '').trim().split(/\s+/).filter(Boolean).length,
          textCategory: fullRecord.textMeta?.category ?? 'unknown',
          textPresetId: fullRecord.textMeta?.presetId ?? null,
   
      event,
    attemptType,
      //rolledNew,    
          createdAt: serverTimestamp(),
          clientTs: fullRecord.timestamp,
          storageJsonPath: jsonPath,
          storageXlsxPath: xlsxPath,
        }
      );

      setMessage({ message: 'Saved JSON + XLSX + CSVs; Firestore & RTDB updated ✔️', type: 'success' });

      // re-arm the next session
      setAnimAtStart(null);
      setTypingKey(Date.now());
    } catch (err: any) {
      console.error('Save error:', err);
      setMessage({ message: `Error saving data: ${err?.code || ''} ${err?.message || String(err)}`, type: 'error' });
    }
  };


 


 

const tabs: { id: Tab; label: string; Comp: React.FC<any> }[] = [
  { id: 'baselinetyping', label: 'Baseline Typing',        Comp: BaselineTyping },
  { id: 'multifunction',  label: 'Multifunction Animation', Comp: MultifunctionAnimation },
  { id: 'shape',          label: 'Shape Animation',         Comp: ShapeAnimations },
  { id: 'color',          label: 'Color Animation',         Comp: ColorAnimation },
  { id: 'photo',          label: 'Photo Animation',         Comp: PhotoAnimations }, // ← NEW
];




const tabBtnBase =
  "h-8 px-3 text-[12px] font-medium rounded-lg border shadow-sm transition " +
  "focus:outline-none focus:ring-2 ring-offset-1";

const tabBtnInactive =
 "bg-white/80 border-slate-300 text-slate-700 hover:bg-white";
 //"bg-white/70 border-gray-300 text-gray-700 hover:bg-white";
const tabBtnActive =
  //"bg-sky-600 border-sky-600 text-white hover:bg-sky-600 focus:ring-sky-300";
"bg-sky-500 border-sky-500 text-white hover:bg-sky-500 focus:ring-sky-300";
"bg-sky-500 border-sky-500 text-white hover:bg-sky-500 focus:ring-sky-300";
  return (

    //  Tips:------------------
   /* 

If you need stronger contrast, bump 500 → 600.

Keep inactive as bg-white/80 so the canvas subtly shows through.

Want rounder pills? change rounded-lg → rounded-xl.

Extra-compact: h-7 px-2.5 text-[11px].
Common stops (approx hex):
slate-50 #f8fafc
slate-100 #f1f5f9
slate-300 #cbd5e1 ← nice border
slate-500 #64748b
slate-700 #334155 ← good body text
slate-900 #0f172a

Examples:
Text: text-slate-700
Border: border-slate-300
Background with translucency: bg-slate-100/80
When to use:
Prefer slate when you want a calm, professional neutral with a hint of blue (great for therapy UI).
Use gray/zinc/neutral/stone if you want slightly different warmth/coolness.
For your buttons/UI:
Inactive: bg-white/80 border-slate-300 text-slate-700
Body text: text-slate-700
Subtle headings: text-slate-800
     */
    
    // <div className="relative w-full">
    <div className="relative w-full overflow-x-hidden">
{/* new mapping style  */}


       <div className="flex justify-center items-center gap-3 text-xs text-gray-700 mb-4 w-full">
      <DateTimeDisplay />
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => setCurrentAnimation(t.id)}
          className={`${tabBtnBase} ${currentAnimation === t.id ? tabBtnActive : tabBtnInactive}`}
        >
          {t.label}
        </button>
      ))}
    </div>

    {/* render the active tab */}
    {(() => {
      const Active = tabs.find(t => t.id === currentAnimation)!.Comp;
      return (
        <Active
          settings={settingsByTab[currentAnimation]}
          setSettings={setSettingsForCurrentTab}
        />
      );
    })()}
    
    {/* old style buttons */}
      {/* <div className="flex justify-center text-xs text-gray-600 rounded p-2 mb-4 w-full"> */}
    {/*   <div className="flex justify-center items-center gap-3 text-xs text-gray-700 mb-4 w-full">
        <DateTimeDisplay />
        <button onClick={() => setCurrentAnimation('baselinetyping')}
          className={`p-2 mx-2 ${currentAnimation === 'baselinetyping' ? 'bg-blue-500 text-white rounded' : 'bg-gray-200'}`}>
          Baseline Typing
        </button>
        <button onClick={() => setCurrentAnimation('multifunction')}
          className={`p-2 mx-2 ${currentAnimation === 'multifunction' ? 'bg-blue-500 text-white rounded' : 'bg-gray-200'}`}>
          Multifunction Animation
        </button>
        <button onClick={() => setCurrentAnimation('shape')}
          className={`p-2 mx-2 ${currentAnimation === 'shape' ? 'bg-blue-500 text-white rounded' : 'bg-gray-200'}`}>
          Shape Animation
        </button>
        <button onClick={() => setCurrentAnimation('color')}
          className={`p-2 mx-2 ${currentAnimation === 'color' ? 'bg-blue-500 text-white rounded' : 'bg-gray-200'}`}>
          Color Animation
        </button>
     

      {currentAnimation === 'baselinetyping' && (
        <BaselineTyping
          settings={settingsByTab.baselinetyping}
          setSettings={setSettingsForCurrentTab}
        />
      )}
      {currentAnimation === 'multifunction' && (
        <MultifunctionAnimation
          settings={settingsByTab.multifunction}
          setSettings={setSettingsForCurrentTab}
        />
      )}
      {currentAnimation === 'shape' && (
        <ShapeAnimations
          settings={settingsByTab.shape}
          setSettings={setSettingsForCurrentTab}
        />
      )}
      {currentAnimation === 'color' && (
        <ColorAnimation
          settings={settingsByTab.color}
          setSettings={setSettingsForCurrentTab}
        />
      )}
 </div> */}
 
 
 
      <div className="relative w-full ml-52 mt-[22vh]">
        <div className="w-full max-w-9xl">
          <TextInput
            key={typingKey}
            placeholder="Type here…"
            displayText={displayText}
            setDisplayText={setDisplayText}
            saveKeystrokeData={saveKeystrokeData}
            onTypingStart={handleTypingStart}
             textMeta={textMeta}                           // <-- PASS IT IN
          />
          <div className="w-full max-w-9xl mt-4">
            <TextDisplay displayText={displayText} setDisplayText={setDisplayText} 
              // onTextChosen={(meta) => setTextMeta(meta)} />  
                onMetaChange={(meta) => setTextMeta(meta)} />
              {/* // <-- gets meta from picker  */}
          </div>
          {message && (
            <div className="mt-3">
              <div className={`inline-block text-white text-xs px-4 py-2 rounded shadow ${message.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
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


// src/components/pages/TherapyPage.tsx
// import React, { useState, useEffect, useCallback } from 'react';

// import MultifunctionAnimation from '../Therapy/MultifunctionAnimation';
// import ShapeAnimations from '../Therapy/ShapeAnimations';
// import ColorAnimation from '../Therapy/ColorAnimation';
// import BaselineTyping from '../Therapy/BaselineTyping';

// import DateTimeDisplay from '../common/DateTimeDisplay';
// import TextDisplay from '../Therapy/TextDisplay';
// import TextInput from '../Therapy/TextInput';
// import type { KeystrokeSavePayload } from '../Therapy/TextInput';

// import { useAuth } from '../../data/AuthContext';
// import { addDoc, collection } from 'firebase/firestore';
// import { db, storage, rtdb } from '../../firebase/firebase';
// import { ref as storageRef, uploadBytes } from 'firebase/storage';
// import { ref as rtdbRef, set as rtdbSet, serverTimestamp } from 'firebase/database';
// import Papa from 'papaparse';
// import * as XLSX from 'xlsx';

// type Tab = 'multifunction' | 'baselinetyping' | 'shape' | 'color';

// interface Message { message: string; type: 'success' | 'error'; }
// interface Settings { [key: string]: any; }

// interface AnimSnapshot {
//   tab: Tab;
//   settings: any;      // snapshot at typing start
//   startedAt: string;  // ISO time
// }


// // --- SETTINGS TYPES FOR OTHER MODULES (adjust to your real ones) ---
// export interface ShapeSettings { /* your shape controls */ }
// export interface MultiSettings { /* your multifunction controls */ }
// export interface BaselineTyping { /* your shape controls */ }
// export interface ColorAnimation { /* your multifunction controls */ }

// const TherapyPage: React.FC = () => {
//   // ----- Hooks (must be inside component) -----

//   const { currentUser } = useAuth();
//   // which tab is active
//   const [currentAnimation, setCurrentAnimation] =
//     useState<'multifunction'|'baselinetyping'|'shape'|'color'>('multifunction');

//   const [message, setMessage] = useState<{message:string; type:'success'|'error'}|null>(null);
 
//   //const [message, setMessage] = useState<Message | null>(null);
//   const [settings, setSettings] = useState<Settings>({});
//   const [displayText, setDisplayText] = useState<string>('');


//     // LIFTED SETTINGS (owned by TherapyPage)
//   const [baselineSettings, setBaselineSettings] = useState<BaselineTypingSettings>({} as BaselineTypingSettings);
//   const [colorSettings, setColorSettings]       = useState<ColorAnimationSettings>({} as ColorAnimationSettings);
//   const [shapeSettings, setShapeSettings]       = useState<ShapeSettings>({} as ShapeSettings);
//   const [multiSettings, setMultiSettings]       = useState<MultiSettings>({} as MultiSettings);

//   // snapshot captured at first keystroke
//   const [animAtStart, setAnimAtStart] = useState<null | {
//     tab: 'multifunction'|'baselinetyping'|'shape'|'color';
//     settings: any;
//     startedAt: string;
//   }>(null);

//   useEffect(() => {
//     if (!message) return;
//     const t = setTimeout(() => setMessage(null), 2500);
//     return () => clearTimeout(t);
//   }, [message]);

//   // When typing starts, capture a deep copy of the *active* module settings
//   const handleTypingStart = useCallback(() => {
//     const now = new Date().toISOString();
//     const snapshot = () => {
//       switch (currentAnimation) {
//         case 'baselinetyping': return JSON.parse(JSON.stringify(baselineSettings));
//         case 'color':          return JSON.parse(JSON.stringify(colorSettings));
//         case 'shape':          return JSON.parse(JSON.stringify(shapeSettings));
//         case 'multifunction':  return JSON.parse(JSON.stringify(multiSettings));
//       }
//     };
//     setAnimAtStart({
//       tab: currentAnimation,
//       settings: snapshot(),
//       startedAt: now,
//     });
//   }, [currentAnimation, baselineSettings, colorSettings, shapeSettings, multiSettings]);


// // --- helpers to flatten objects and CSV-ify arrays ---
// const isPlainObject = (v: any) => v && typeof v === 'object' && !Array.isArray(v);

// const flattenToKeyValueRows = (obj: any, prefix = ''): Array<{ key: string; value: string | number | boolean | null }> => {
//   const rows: Array<{ key: string; value: any }> = [];
//   const walk = (val: any, pfx: string) => {
//     if (isPlainObject(val)) {
//       for (const k of Object.keys(val)) walk(val[k], pfx ? `${pfx}.${k}` : k);
//     } else if (Array.isArray(val)) {
//       // store arrays as JSON; (keyData/etc will get their own CSVs separately)
//       rows.push({ key: pfx, value: JSON.stringify(val) });
//     } else {
//       rows.push({ key: pfx, value: val });
//     }
//   };
//   walk(obj, prefix);
//   return rows;
// };

// // turn perKey object into rows
// const perKeyToRows = (perKey: Record<string, { count: number; meanHoldMs: number; meanLagMs: number }>) =>
//   Object.entries(perKey || {}).map(([ch, v]) => ({
//     key: ch,
//     count: v.count,
//     meanHoldMs: v.meanHoldMs,
//     meanLagMs: v.meanLagMs,
//   }));

// // ops to rows
// type Op = { op: 'match'|'ins'|'del'|'sub'; a?: string; b?: string; ai: number; bi: number };
// const opsToRows = (ops: Op[]) =>
//   (ops || []).map((o, i) => ({ index: i, op: o.op, a: o.a ?? '', b: o.b ?? '', ai: o.ai, bi: o.bi }));



  
//   // ----- Save EVERYTHING -----
//   const saveKeystrokeData = async (payload: KeystrokeSavePayload) => {
//     const uid = currentUser?.uid;
//     if (!uid) {
//       setMessage({ message: 'You must be logged in to save (no UID).', type: 'error' });
//       return;
//     }

//     const ts = new Date();
//     const sessionId = `${ts.toISOString().replace(/[:.]/g, '-')}-${Math.random().toString(36).slice(2, 8)}`;

//     // Build the full record (long JSON)
//     const fullRecord = {
//       userId: uid,
//       sessionId,

//       // Which tab is active at submit (still useful)
//       animationTab: currentAnimation,

//       // Snapshots of animation panel
//       animationAtStart: animAtStart ?? null, // could be null if paste-only
//       animationAtSubmit: {
//         tab: currentAnimation,
//         settings: JSON.parse(JSON.stringify(settings)),
//         submittedAt: ts.toISOString(),
//       },

//       // Keep previous single-snapshot for compatibility
//       settingsSnapshot: JSON.parse(JSON.stringify(settings)),

//       // Target + typed text
//       targetText: payload.targetText || displayText || '',
//       typedText: payload.typedText || '',

//       // Keystroke stream + analysis + metrics
//       keyData: payload.keyData || [],
//       analysis: payload.analysis ?? null,
//       metrics: payload.metrics ?? null,

//       // Optional UI controls from TextInput (font, colors, opacity, etc.)
//       ui: (payload as any).ui ?? undefined,

//       timestamp: ts.toISOString(),
//       localDateTime: ts.toLocaleString(),
//       schemaVersion: 1,
//     };

// /*     try {
//       // 1) STORAGE: JSON
//       const jsonPath = `users/${uid}/keystroke-data/sessions/${sessionId}.json`;
//       const jsonBlob = new Blob([JSON.stringify(fullRecord, null, 2)], { type: 'application/json' });
//       await uploadBytes(storageRef(storage, jsonPath), jsonBlob);

//       // 1b) STORAGE: CSV for key events
//       const csvRows = (fullRecord.keyData || []).map((k: any, i: number) => ({
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

//       // 2) FIRESTORE: summary doc (includes Storage pointers)
//       const summaryDoc = {
//         userId: uid,
//         sessionId,
//         animationTab: currentAnimation,
//         animationAtStart: fullRecord.animationAtStart,
//         animationAtSubmit: fullRecord.animationAtSubmit,
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

//       // 3) RTDB: small summary node
//       await rtdbSet(
//         rtdbRef(rtdb, `users/${uid}/keystroke-data/${sessionId}`),
//         {
//           status: 'submitted',
//           animationTab: currentAnimation,
//           targetLength: fullRecord.targetText?.length ?? 0,
//           typedLength: fullRecord.typedText?.length ?? 0,
//           wordCount: (fullRecord.typedText || '').trim().split(/\s+/).filter(Boolean).length,
//           storageJsonPath: jsonPath,
//           storageCsvPath: csvPath,
//           createdAt: serverTimestamp(),
//           clientTs: fullRecord.timestamp,
//         }
//       );

//       setMessage({ message: 'Saved JSON + CSV to Storage, summary to Firestore & RTDB ✔️', type: 'success' });
//     } catch (err: any) {
//       console.error('Save error:', err);
//       setMessage({
//         message: `Error saving data: ${err?.code || ''} ${err?.message || String(err)}`,
//         type: 'error',
//       });
//     } */
  
//   try {
 

//   // ---------- STORAGE: JSON (full) ----------
// const jsonPath = `users/${uid}/keystroke-data/sessions/${sessionId}.json`;
// const jsonText = JSON.stringify(fullRecord, null, 2);
// await uploadBytes(storageRef(storage, jsonPath), new Blob([jsonText], { type: 'application/json' }));

// // ---------- STORAGE: XLSX (one workbook, many sheets) ----------
// const wb = XLSX.utils.book_new();

// // A) Summary (flattened important fields; huge arrays kept in their own sheets)
// const flatRows = flattenToKeyValueRows({
  
//     userId: fullRecord.userId,
//     sessionId: fullRecord.sessionId,
//     animationTab: fullRecord.animationTab,
//     animationAtStart: fullRecord.animationAtStart,
//     animationAtSubmit: fullRecord.animationAtSubmit,
//     targetText: fullRecord.targetText,
//     typedText: fullRecord.typedText,
//     metrics: fullRecord.metrics,
//     ui: fullRecord.ui ?? {},
//     timestamp: fullRecord.timestamp,
//     localDateTime: fullRecord.localDateTime,
//     schemaVersion: fullRecord.schemaVersion,
//   });

// XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(flatRows), 'Summary');

// // B) Texts (store full target & typed as separate rows to avoid giant single cell)
// XLSX.utils.book_append_sheet(
//   wb,
//   XLSX.utils.json_to_sheet([
//     { name: 'targetText', value: fullRecord.targetText ?? '' },
//     { name: 'typedText',  value: fullRecord.typedText  ?? '' },
//   ]),
//   'Texts'
// );

// // C) KeyEvents (every keystroke including Backspace/Enter)
// const keyRows = (fullRecord.keyData || []).map((k: any, i: number) => ({
//   index: i,
//   key: k.key,
//   pressTime: k.pressTime,
//   releaseTime: k.releaseTime ?? '',
//   holdTime: k.holdTime ?? '',
//   lagTime: k.lagTime,
//   totalLagTime: k.totalLagTime,
// }));
// XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(keyRows), 'KeyEvents');

// // D) PerKey stats
// const perKeyRows = perKeyToRows(fullRecord.metrics?.perKey || {});
// if (perKeyRows.length) {
//   XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(perKeyRows), 'PerKey');
// }

// // E) Alignment ops
// const charOpsRows = opsToRows(fullRecord.analysis?.char?.ops || []);
// if (charOpsRows.length) {
//   XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(charOpsRows), 'CharOps');
// }
// const wordOpsRows = opsToRows(fullRecord.analysis?.word?.ops || []);
// if (wordOpsRows.length) {
//   XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(wordOpsRows), 'WordOps');
// }

// // Write workbook -> ArrayBuffer -> Blob
// const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
// const xlsxBlob = new Blob([wbout], {
//   type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
// });
// const xlsxPath = `users/${uid}/keystroke-data/sessions/${sessionId}.xlsx`;
// await uploadBytes(storageRef(storage, xlsxPath), xlsxBlob);

// // ---------- FIRESTORE: store full doc if small, else pointer summary ----------
// const jsonSize = jsonText.length;
// const storagePaths = {
//   json: jsonPath,
//   xlsx: xlsxPath,
// };

// if (jsonSize < 900_000) {
//   await addDoc(collection(db, `users/${uid}/keystroke-data`), {
//     ...fullRecord,
//     storagePaths,
//   });
// } else {
//   await addDoc(collection(db, `users/${uid}/keystroke-data`), {
//     userId: uid,
//     sessionId,
//     animationTab: fullRecord.animationTab,
//     animationAtStart: fullRecord.animationAtStart,
//     animationAtSubmit: fullRecord.animationAtSubmit,
//     targetText: fullRecord.targetText,
//     typedText: fullRecord.typedText,
//     metrics: fullRecord.metrics,
//     approxKeyCount: (fullRecord.keyData || []).length,
//     timestamp: fullRecord.timestamp,
//     localDateTime: fullRecord.localDateTime,
//     schemaVersion: fullRecord.schemaVersion,
//     storagePaths,
//   });
// }

// // ---------- RTDB: keep your compact summary ----------
// await rtdbSet(
//   rtdbRef(rtdb, `users/${uid}/keystroke-data/${sessionId}`),
//   {
//     status: 'submitted',
//     animationTab: fullRecord.animationTab,
//     targetLength: fullRecord.targetText?.length ?? 0,
//     typedLength: fullRecord.typedText?.length ?? 0,
//     wordCount: (fullRecord.typedText || '').trim().split(/\s+/).filter(Boolean).length,
//     createdAt: serverTimestamp(),
//     clientTs: fullRecord.timestamp,
//     storageJsonPath: jsonPath,
//     storageXlsxPath: xlsxPath,
//   }
// );

// setMessage({ message: 'Saved JSON + single XLSX (multi-sheet), Firestore & RTDB updated ✔️', type: 'success' });


//   // ---------- STORAGE: CSVs ----------
// /*   // A) full record flattened (key/value rows)
//   const flatRows = flattenToKeyValueRows({
//     userId: fullRecord.userId,
//     sessionId: fullRecord.sessionId,
//     animationTab: fullRecord.animationTab,
//     animationAtStart: fullRecord.animationAtStart,
//     animationAtSubmit: fullRecord.animationAtSubmit,
//     targetText: fullRecord.targetText,
//     typedText: fullRecord.typedText,
//     metrics: fullRecord.metrics,
//     ui: fullRecord.ui ?? {},
//     timestamp: fullRecord.timestamp,
//     localDateTime: fullRecord.localDateTime,
//     schemaVersion: fullRecord.schemaVersion,
//   }); */
//   const flatCsv = Papa.unparse(flatRows);
//   await uploadBytes(
//     storageRef(storage, `users/${uid}/keystroke-data/sessions/${sessionId}.session_flat.csv`),
//     new Blob([flatCsv], { type: 'text/csv;charset=utf-8;' })
//   );

//   // B) every keystroke (includes Backspace/Enter/etc.)
// /*   const keyRows = (fullRecord.keyData || []).map((k: any, i: number) => ({
//     index: i,
//     key: k.key,
//     pressTime: k.pressTime,
//     releaseTime: k.releaseTime ?? '',
//     holdTime: k.holdTime ?? '',
//     lagTime: k.lagTime,
//     totalLagTime: k.totalLagTime,
//   })); */
//   const keyCsv = Papa.unparse(keyRows);
//   await uploadBytes(
//     storageRef(storage, `users/${uid}/keystroke-data/sessions/${sessionId}.key_events.csv`),
//     new Blob([keyCsv], { type: 'text/csv;charset=utf-8;' })
//   );

//   // C) per-key timing stats from metrics
// //  const perKeyRows = perKeyToRows(fullRecord.metrics?.perKey || {});
//   if (perKeyRows.length) {
//     const perKeyCsv = Papa.unparse(perKeyRows);
//     await uploadBytes(
//       storageRef(storage, `users/${uid}/keystroke-data/sessions/${sessionId}.per_key.csv`),
//       new Blob([perKeyCsv], { type: 'text/csv;charset=utf-8;' })
//     );
//   }

//   // D) alignment ops (character-level)
// //  const charOpsRows = opsToRows(fullRecord.analysis?.char?.ops || []);
//   if (charOpsRows.length) {
//     const charOpsCsv = Papa.unparse(charOpsRows);
//     await uploadBytes(
//       storageRef(storage, `users/${uid}/keystroke-data/sessions/${sessionId}.char_ops.csv`),
//       new Blob([charOpsCsv], { type: 'text/csv;charset=utf-8;' })
//     );
//   }

//   // E) alignment ops (word-level)
// //  const wordOpsRows = opsToRows(fullRecord.analysis?.word?.ops || []);
//   if (wordOpsRows.length) {
//     const wordOpsCsv = Papa.unparse(wordOpsRows);
//     await uploadBytes(
//       storageRef(storage, `users/${uid}/keystroke-data/sessions/${sessionId}.word_ops.csv`),
//       new Blob([wordOpsCsv], { type: 'text/csv;charset=utf-8;' })
//     );
//   }

//   // ---------- FIRESTORE: try full doc, else pointer summary ----------
  
//   if (jsonSize < 900_000) {
//     // full record fits comfortably — store the whole thing
//     await addDoc(collection(db, `users/${uid}/keystroke-data`), {
//       ...fullRecord,
//       storageJsonPath: jsonPath,
//       storageCsvPaths: {
//         flat: `users/${uid}/keystroke-data/sessions/${sessionId}.session_flat.csv`,
//         keyEvents: `users/${uid}/keystroke-data/sessions/${sessionId}.key_events.csv`,
//         perKey: `users/${uid}/keystroke-data/sessions/${sessionId}.per_key.csv`,
//         charOps: `users/${uid}/keystroke-data/sessions/${sessionId}.char_ops.csv`,
//         wordOps: `users/${uid}/keystroke-data/sessions/${sessionId}.word_ops.csv`,
//       },
//     });
//   } else {
//     // too big — store a compact pointer summary
//     await addDoc(collection(db, `users/${uid}/keystroke-data`), {
//       userId: uid,
//       sessionId,
//       animationTab: fullRecord.animationTab,
//       animationAtStart: fullRecord.animationAtStart,
//       animationAtSubmit: fullRecord.animationAtSubmit,
//       targetText: fullRecord.targetText,
//       typedText: fullRecord.typedText,
//       metrics: fullRecord.metrics,
//       approxKeyCount: (fullRecord.keyData || []).length,
//       timestamp: fullRecord.timestamp,
//       localDateTime: fullRecord.localDateTime,
//       schemaVersion: fullRecord.schemaVersion,
//       storageJsonPath: jsonPath,
//       storageCsvPaths: {
//         flat: `users/${uid}/keystroke-data/sessions/${sessionId}.session_flat.csv`,
//         keyEvents: `users/${uid}/keystroke-data/sessions/${sessionId}.key_events.csv`,
//         perKey: `users/${uid}/keystroke-data/sessions/${sessionId}.per_key.csv`,
//         charOps: `users/${uid}/keystroke-data/sessions/${sessionId}.char_ops.csv`,
//         wordOps: `users/${uid}/keystroke-data/sessions/${sessionId}.word_ops.csv`,
//       },
//     });
//   }

//   // ---------- RTDB: compact summary (expand if you want) ----------
//   await rtdbSet(
//     rtdbRef(rtdb, `users/${uid}/keystroke-data/${sessionId}`),
//     {
//       status: 'submitted',
//       animationTab: fullRecord.animationTab,
//       targetLength: fullRecord.targetText?.length ?? 0,
//       typedLength: fullRecord.typedText?.length ?? 0,
//       wordCount: (fullRecord.typedText || '').trim().split(/\s+/).filter(Boolean).length,
//       createdAt: serverTimestamp(),
//       clientTs: fullRecord.timestamp,
//       storageJsonPath: jsonPath,
//     }
//   );

//   setMessage({ message: 'Saved JSON + full CSV set to Storage, and Firestore/RTDB updated ✔️', type: 'success' });
// } catch (err: any) {
//   console.error('Save error:', err);
//   setMessage({
//     message: `Error saving data: ${err?.code || ''} ${err?.message || String(err)}`,
//     type: 'error',
//   });
// }

  
//     };

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

//       {/* push content down for background visibility */}
//       <div className="relative w-full ml-52 mt-[22vh]">
//         <div className="w-full max-w-9xl">
//           <TextInput
//             placeholder="Type here…"
//             displayText={displayText}
//             setDisplayText={setDisplayText}
//             saveKeystrokeData={saveKeystrokeData}
//             onTypingStart={handleTypingStart}  // capture animation-at-start
//           />

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
  