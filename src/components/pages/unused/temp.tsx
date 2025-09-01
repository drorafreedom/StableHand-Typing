// src/components/pages/TherapyPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import MultifunctionAnimation from '../Therapy/MultifunctionAnimation';
import ShapeAnimations from '../Therapy/ShapeAnimations';
import ColorAnimation, { COLOR_DEFAULTS, ColorAnimationSettings } from '../Therapy/ColorAnimation';
import BaselineTyping, { BaselineTypingSettings, BASELINE_DEFAULTS } from '../Therapy/BaselineTyping';

import DateTimeDisplay from '../common/DateTimeDisplay';
import TextDisplay from '../Therapy/TextDisplay';
import TextInput, { KeystrokeSavePayload } from '../Therapy/TextInput';

import { useAuth } from '../../data/AuthContext';
import { addDoc, collection } from 'firebase/firestore';
import { db, storage, rtdb } from '../../firebase/firebase';
import { ref as storageRef, uploadBytes } from 'firebase/storage';
import { ref as rtdbRef, set as rtdbSet, serverTimestamp } from 'firebase/database';
import Papa from 'papaparse';

// --- SETTINGS TYPES FOR OTHER MODULES (adjust to your real ones) ---
export interface ShapeSettings { /* your shape controls */ }
export interface MultiSettings { /* your multifunction controls */ }

// ---- TherapyPage component ----
const TherapyPage: React.FC = () => {
  const { currentUser } = useAuth();

  // which tab is active
  const [currentAnimation, setCurrentAnimation] =
    useState<'multifunction'|'baselinetyping'|'shape'|'color'>('multifunction');

  const [message, setMessage] = useState<{message:string; type:'success'|'error'}|null>(null);
  const [displayText, setDisplayText] = useState<string>('');

  // LIFTED SETTINGS (owned by TherapyPage)
  const [baselineSettings, setBaselineSettings] = useState<BaselineTypingSettings>(BASELINE_DEFAULTS);
  const [colorSettings, setColorSettings]       = useState<ColorAnimationSettings>(COLOR_DEFAULTS);
  const [shapeSettings, setShapeSettings]       = useState<ShapeSettings>({} as ShapeSettings);
  const [multiSettings, setMultiSettings]       = useState<MultiSettings>({} as MultiSettings);

  // snapshot captured at first keystroke
  const [animAtStart, setAnimAtStart] = useState<null | {
    tab: 'multifunction'|'baselinetyping'|'shape'|'color';
    settings: any;
    startedAt: string;
  }>(null);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 2500);
    return () => clearTimeout(t);
  }, [message]);

  // When typing starts, capture a deep copy of the *active* module settings
  const handleTypingStart = useCallback(() => {
    const now = new Date().toISOString();
    const snapshot = () => {
      switch (currentAnimation) {
        case 'baselinetyping': return JSON.parse(JSON.stringify(baselineSettings));
        case 'color':          return JSON.parse(JSON.stringify(colorSettings));
        case 'shape':          return JSON.parse(JSON.stringify(shapeSettings));
        case 'multifunction':  return JSON.parse(JSON.stringify(multiSettings));
      }
    };
    setAnimAtStart({
      tab: currentAnimation,
      settings: snapshot(),
      startedAt: now,
    });
  }, [currentAnimation, baselineSettings, colorSettings, shapeSettings, multiSettings]);

  // Save everything (JSON + CSV to Storage; summary to Firestore + RTDB)
  const saveKeystrokeData = async (payload: KeystrokeSavePayload) => {
    const uid = currentUser?.uid;
    if (!uid) {
      setMessage({ message: 'You must be logged in to save.', type: 'error' });
      return;
    }

    const ts = new Date();
    const sessionId = `${ts.toISOString().replace(/[:.]/g, '-')}-${Math.random().toString(36).slice(2,8)}`;

    const currentSettingsNow = (() => {
      switch (currentAnimation) {
        case 'baselinetyping': return JSON.parse(JSON.stringify(baselineSettings));
        case 'color':          return JSON.parse(JSON.stringify(colorSettings));
        case 'shape':          return JSON.parse(JSON.stringify(shapeSettings));
        case 'multifunction':  return JSON.parse(JSON.stringify(multiSettings));
      }
    })();

    const fullRecord = {
      userId: uid,
      sessionId,
      animationTab: currentAnimation,
      animationAtStart: animAtStart ?? null,
      animationAtSubmit: {
        tab: currentAnimation,
        settings: currentSettingsNow,
        submittedAt: ts.toISOString(),
      },
      targetText: payload.targetText,
      typedText: payload.typedText,
      keyData: payload.keyData,
      analysis: payload.analysis,
      metrics: payload.metrics,
      ui: payload.ui, // text-input UI panel
      timestamp: ts.toISOString(),
      localDateTime: ts.toLocaleString(),
      schemaVersion: 1,
    };

    try {
      // 1) Storage: JSON
      const jsonPath = `users/${uid}/keystroke-data/sessions/${sessionId}/full.json`;
      await uploadBytes(
        storageRef(storage, jsonPath),
        new Blob([JSON.stringify(fullRecord, null, 2)], { type: 'application/json' })
      );

      // 1b) Storage: CSV (key events)
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
      const csvPath = `users/${uid}/keystroke-data/sessions/${sessionId}/keys.csv`;
      await uploadBytes(
        storageRef(storage, csvPath),
        new Blob([csvText], { type: 'text/csv;charset=utf-8;' })
      );

      // 2) Firestore summary (keep it light)
      await addDoc(collection(db, `users/${uid}/keystroke-data`), {
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
      });

      // 3) RTDB small node
      await rtdbSet(rtdbRef(rtdb, `users/${uid}/keystroke-data/${sessionId}`), {
        status: 'submitted',
        animationTab: currentAnimation,
        typedLength: (fullRecord.typedText || '').length,
        wordCount: (fullRecord.typedText || '').trim().split(/\s+/).filter(Boolean).length,
        storageJsonPath: jsonPath,
        storageCsvPath: csvPath,
        createdAt: serverTimestamp(),
        clientTs: fullRecord.timestamp,
      });

      setMessage({ message: 'Saved ✔️', type: 'success' });
    } catch (e: any) {
      console.error('Save error:', e);
      setMessage({ message: `Save failed: ${e?.code || ''} ${e?.message || e}`, type: 'error' });
    }
  };

  return (
    <div className="relative w-full">
      {/* header / tab buttons, unchanged */}
      <div className="flex justify-center text-sm text-gray-600 rounded p-2 mb-4 w-full">
        <DateTimeDisplay />
        <button onClick={() => setCurrentAnimation('baselinetyping')}
          className={`p-2 mx-2 ${currentAnimation==='baselinetyping' ? 'bg-blue-500 text-white rounded' : 'bg-gray-200'}`}>
          Baseline Typing
        </button>
        <button onClick={() => setCurrentAnimation('multifunction')}
          className={`p-2 mx-2 ${currentAnimation==='multifunction' ? 'bg-blue-500 text-white rounded' : 'bg-gray-200'}`}>
          Multifunction
        </button>
        <button onClick={() => setCurrentAnimation('shape')}
          className={`p-2 mx-2 ${currentAnimation==='shape' ? 'bg-blue-500 text-white rounded' : 'bg-gray-200'}`}>
          Shape
        </button>
        <button onClick={() => setCurrentAnimation('color')}
          className={`p-2 mx-2 ${currentAnimation==='color' ? 'bg-blue-500 text-white rounded' : 'bg-gray-200'}`}>
          Color
        </button>
      </div>

      {/* animations now receive lifted settings */}
      {currentAnimation === 'baselinetyping' && (
        <BaselineTyping settings={baselineSettings} setSettings={setBaselineSettings} />
      )}
      {currentAnimation === 'multifunction' && (
        <MultifunctionAnimation settings={multiSettings} setSettings={setMultiSettings} />
      )}
      {currentAnimation === 'shape' && (
        <ShapeAnimations settings={shapeSettings} setSettings={setShapeSettings} />
      )}
      {currentAnimation === 'color' && (
        <ColorAnimation settings={colorSettings} setSettings={setColorSettings} />
      )}

      {/* typing + display */}
      <div className="relative w-full ml-52 mt-[22vh]">
        <div className="w-full max-w-9xl">
          <TextInput
            placeholder="Type here…"
            displayText={displayText}
            setDisplayText={setDisplayText}
            saveKeystrokeData={saveKeystrokeData}
            onTypingStart={handleTypingStart}
          />
          <div className="w-full max-w-9xl mt-4">
            <TextDisplay displayText={displayText} setDisplayText={setDisplayText} />
          </div>

          {message && (
            <div className="mt-3">
              <div className={`inline-block text-white text-xs px-4 py-2 rounded shadow ${
                message.type === 'error' ? 'bg-red-500' : 'bg-green-500'
              }`}>
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
