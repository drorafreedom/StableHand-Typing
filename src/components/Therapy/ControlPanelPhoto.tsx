import React, { useState } from 'react';
import { Collapse } from 'react-collapse';
import { useAuth } from '../../data/AuthContext';
import { db, storage } from '../../firebase/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes } from 'firebase/storage';
import Papa from 'papaparse';
import DateTimeDisplay from '../common/DateTimeDisplay';
import type { PhotoSettings } from './PhotoAnimations';

const smallBtn =
  'h-7 px-2.5 text-[11px] rounded border shadow-sm focus:outline-none focus:ring-2 ring-offset-1';

const btnPrimary   = 'bg-sky-500 border-sky-500 text-white hover:bg-sky-500 focus:ring-sky-300';
const btnSubtle    = 'bg-white/80 border-slate-300 text-slate-700 hover:bg-white';
const btnGreen     = 'bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-300';
const btnRed       = 'bg-rose-500 border-rose-500 text-white hover:bg-rose-600 focus:ring-rose-300';

type Props = {
  settings: PhotoSettings;
  setSettings: React.Dispatch<React.SetStateAction<PhotoSettings>>;
  isAnimating: boolean;
  startAnimation: () => void;
  stopAnimation: () => void;
  resetAnimation: () => void;
  imageUrls: string[];
  setImageUrls: (urls: string[]) => void;
};

const ControlPanelPhoto: React.FC<Props> = ({
  settings, setSettings,
  isAnimating, startAnimation, stopAnimation, resetAnimation,
  imageUrls, setImageUrls,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [presetName, setPresetName] = useState('');
  const { currentUser } = useAuth();
  const uid = currentUser?.uid;

  const onFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const urls = files.map((f) => URL.createObjectURL(f));
    setImageUrls(urls);
  };

  const savePreset = async () => {
    if (!presetName) return alert('Name your preset first.');
    if (!uid) return alert('Sign in to save presets.');
    const ts = new Date();
    const docRef = doc(db, `users/${uid}/photo-animation-settings/${presetName}`);
    const payload = {
      ...settings,
      presetName,
      userId: uid,
      timestamp: ts.toISOString(),
      localDateTime: ts.toLocaleString(),
      // do NOT store imageUrls in Firestore
    };
    await setDoc(docRef, payload, { merge: true });

    // optional CSV snapshot in Storage (matches your other panels)
    const rows = Object.entries(payload).map(([k, v]) => ({
      setting: k,
      value: Array.isArray(v) ? JSON.stringify(v) : String(v),
    }));
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    await uploadBytes(
      storageRef(storage, `users/${uid}/photo-animation-settings/${presetName}.csv`),
      blob
    );
    alert('Preset saved.');
  };

  const loadPreset = async () => {
    if (!presetName) return alert('Type a preset name to load.');
    if (!uid) return alert('Sign in to load presets.');
    const docRef = doc(db, `users/${uid}/photo-animation-settings/${presetName}`);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return alert('No preset with that name.');
    const data = snap.data() as Partial<PhotoSettings> & Record<string, any>;
    // merge but keep current imageUrls
    const {
      direction, speed, zoom, zoomMode, zoomSpeed,
      slideDuration, transition, transitionSeconds,
      overlayColor, overlayOpacity, overlayOpacityMode, overlayOpacitySpeed,
      filter, filterAmount, scaleMode,
    } = { ...settings, ...data };
    setSettings({
      direction, speed, zoom, zoomMode, zoomSpeed,
      slideDuration, transition, transitionSeconds,
      overlayColor, overlayOpacity, overlayOpacityMode, overlayOpacitySpeed,
      filter, filterAmount, scaleMode,
    });
    alert('Preset loaded.');
  };

  return (
    <div className="fixed right-4 top-2 z-10 w-[290px] bg-white/80 backdrop-blur border rounded-xl shadow p-3 text-xs">
      <div className="flex items-center gap-2 mb-2">
        <DateTimeDisplay />
        <div className="ml-auto flex items-center gap-2">
          {isAnimating ? (
            <button onClick={stopAnimation} className={`${smallBtn} ${btnRed}`}>Stop</button>
          ) : (
            <button onClick={startAnimation} className={`${smallBtn} ${btnGreen}`}>Start</button>
          )}
          <button onClick={resetAnimation} className={`${smallBtn} ${btnSubtle}`}>Reset</button>
          <button onClick={() => setIsOpen(!isOpen)} className={`${smallBtn} ${btnSubtle}`}>
            {isOpen ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      <Collapse isOpened={isOpen}>
        <div className="space-y-3">
          {/* Images */}
          <div>
            <label className="block mb-1">Photos (multiple):</label>
            <input type="file" accept="image/*" multiple onChange={onFiles} className="w-full text-[11px]" />
            <div className="mt-1 text-[11px] text-slate-600">
              {imageUrls.length ? `${imageUrls.length} selected` : 'No photos selected'}
            </div>
          </div>

          {/* Motion */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block mb-1">Direction</label>
              <select
                value={settings.direction}
                onChange={(e) => setSettings(s => ({ ...s, direction: e.target.value as PhotoSettings['direction'] }))}
                className="border rounded px-2 py-1 w-full"
              >
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
              <label className="block mb-1">Speed</label>
              <input
                type="range" min={0} max={200} value={settings.speed}
                onChange={(e) => setSettings(s => ({ ...s, speed: Number(e.target.value) }))}
                className="w-full"
              />
            </div>
          </div>

          {/* Zoom */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block mb-1">Zoom</label>
              <input
                type="range" min={1} max={2.5} step={0.01} value={settings.zoom}
                onChange={(e) => setSettings(s => ({ ...s, zoom: Number(e.target.value) }))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block mb-1">Zoom Mode</label>
              <select
                value={settings.zoomMode}
                onChange={(e) => setSettings(s => ({ ...s, zoomMode: e.target.value as PhotoSettings['zoomMode'] }))}
                className="border rounded px-2 py-1 w-full"
              >
                <option value="constant">Constant</option>
                <option value="pulse">Pulse</option>
              </select>
            </div>
          </div>

          {/* Slideshow */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block mb-1">Slide Duration (s)</label>
              <input
                type="range" min={1} max={15} step={0.5} value={settings.slideDuration}
                onChange={(e) => setSettings(s => ({ ...s, slideDuration: Number(e.target.value) }))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block mb-1">Transition</label>
              <select
                value={settings.transition}
                onChange={(e) => setSettings(s => ({ ...s, transition: e.target.value as PhotoSettings['transition'] }))}
                className="border rounded px-2 py-1 w-full"
              >
                <option value="crossfade">Crossfade</option>
                <option value="cut">Cut</option>
              </select>
            </div>
            <div>
              <label className="block mb-1">Transition (s)</label>
              <input
                type="range" min={0.1} max={5} step={0.1} value={settings.transitionSeconds}
                onChange={(e) => setSettings(s => ({ ...s, transitionSeconds: Number(e.target.value) }))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block mb-1">Scale</label>
              <select
                value={settings.scaleMode}
                onChange={(e) => setSettings(s => ({ ...s, scaleMode: e.target.value as PhotoSettings['scaleMode'] }))}
                className="border rounded px-2 py-1 w-full"
              >
                <option value="cover">Cover</option>
                <option value="contain">Contain</option>
              </select>
            </div>
          </div>

          {/* Overlay + Filters (opacity style mirrors Shape) */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block mb-1">Overlay Color</label>
              <input
                type="color"
                value={settings.overlayColor}
                onChange={(e) => setSettings(s => ({ ...s, overlayColor: e.target.value }))}
                className="w-full h-8"
              />
            </div>
            <div>
              <label className="block mb-1">Overlay Opacity</label>
              <input
                type="range" min={0} max={1} step={0.01} value={settings.overlayOpacity}
                onChange={(e) => setSettings(s => ({ ...s, overlayOpacity: Number(e.target.value) }))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block mb-1">Opacity Mode</label>
              <select
                value={settings.overlayOpacityMode}
                onChange={(e) => setSettings(s => ({ ...s, overlayOpacityMode: e.target.value as PhotoSettings['overlayOpacityMode'] }))}
                className="border rounded px-2 py-1 w-full"
              >
                <option value="constant">Constant</option>
                <option value="pulse">Pulse</option>
              </select>
            </div>
            <div>
              <label className="block mb-1">Pulse Speed</label>
              <input
                type="range" min={0.1} max={5} step={0.1} value={settings.overlayOpacitySpeed}
                onChange={(e) => setSettings(s => ({ ...s, overlayOpacitySpeed: Number(e.target.value) }))}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block mb-1">Filter</label>
              <select
                value={settings.filter}
                onChange={(e) => setSettings(s => ({ ...s, filter: e.target.value as PhotoSettings['filter'] }))}
                className="border rounded px-2 py-1 w-full"
              >
                <option value="none">None</option>
                <option value="grayscale">Grayscale</option>
                <option value="sepia">Sepia</option>
                <option value="hue-rotate">Hue Rotate</option>
              </select>
            </div>
            <div>
              <label className="block mb-1">
                {settings.filter === 'hue-rotate' ? 'Hue' : 'Amount'}
              </label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={settings.filterAmount}
                onChange={(e) => setSettings(s => ({ ...s, filterAmount: Number(e.target.value) }))}
                className="w-full"
              />
            </div>
          </div>

          {/* Presets (like your other panels) */}
          <div className="pt-2 border-t">
            <div className="flex items-center gap-2">
              <input
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="Preset name"
                className="border rounded px-2 py-1 w-full"
              />
              <button onClick={savePreset} className={`${smallBtn} ${btnPrimary}`}>Save</button>
              <button onClick={loadPreset} className={`${smallBtn} ${btnSubtle}`}>Load</button>
            </div>
          </div>
        </div>
      </Collapse>
    </div>
  );
};

export default ControlPanelPhoto;
