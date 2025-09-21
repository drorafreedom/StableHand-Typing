import React, { useState } from 'react';
import type { Direction, OpacityMode, PhotoSettings, ZoomMode } from './PhotoAnimations';
import PresetControls from '../common/PresetControls';
import type { PresetModule } from '../../utils/presets';

const MODULE: PresetModule = 'photo';

type Props = {

  settings: PhotoSettings;
  setSettings: React.Dispatch<React.SetStateAction<PhotoSettings>>;
  running: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  idx: number;
  onPrev: () => void;
  onNext: () => void;

  // sources
  onUseBundled: () => void;
  onUsePublic: (count?: number) => void;
  onPickLocal: () => void;
  onPickDirectory: () => void;
  onReopenDirectory: () => void;
  //-googld 
    onUseSharedStorage: () => void;
  onUseUserStorage: () => void;
};

const DIRS: Direction[] = ['static','up','down','left','right','oscillateUpDown','oscillateRightLeft','circular'];
const FITS: Array<PhotoSettings['fit']> = ['cover','contain'];
const ZOOMS: ZoomMode[] = ['none','inOut','pulse'];
const ALPHAS: OpacityMode[] = ['constant','inOut','pulse'];

const mergeLoaded = (d: Partial<PhotoSettings>, s: PhotoSettings): PhotoSettings => ({
  ...s,
  autoplay: typeof d.autoplay === 'boolean' ? d.autoplay : s.autoplay,
  slideSeconds: typeof d.slideSeconds === 'number' ? d.slideSeconds : s.slideSeconds,

  direction: DIRS.includes(d.direction as any) ? (d.direction as any) : s.direction,
  speed: typeof d.speed === 'number' ? d.speed : s.speed,
  oscillationRange: typeof d.oscillationRange === 'number' ? d.oscillationRange : s.oscillationRange,
  rotationRadius: typeof d.rotationRadius === 'number' ? d.rotationRadius : s.rotationRadius,
  rotationSpeed: typeof d.rotationSpeed === 'number' ? d.rotationSpeed : s.rotationSpeed,

  zoomMode: ZOOMS.includes(d.zoomMode as any) ? (d.zoomMode as any) : s.zoomMode,
  zoomMin: typeof d.zoomMin === 'number' ? d.zoomMin : s.zoomMin,
  zoomMax: typeof d.zoomMax === 'number' ? d.zoomMax : s.zoomMax,
  zoomSpeed: typeof d.zoomSpeed === 'number' ? d.zoomSpeed : s.zoomSpeed,

  imageOpacityMin: typeof d.imageOpacityMin === 'number' ? d.imageOpacityMin : s.imageOpacityMin,
  imageOpacityMax: typeof d.imageOpacityMax === 'number' ? d.imageOpacityMax : s.imageOpacityMax,
  imageOpacityMode: ALPHAS.includes(d.imageOpacityMode as any) ? (d.imageOpacityMode as any) : s.imageOpacityMode,
  imageOpacitySpeed: typeof d.imageOpacitySpeed === 'number' ? d.imageOpacitySpeed : s.imageOpacitySpeed,

  overlayColor: typeof d.overlayColor === 'string' ? d.overlayColor : s.overlayColor,
  overlayOpacity: typeof d.overlayOpacity === 'number' ? d.overlayOpacity : s.overlayOpacity,
  fit: FITS.includes(d.fit as any) ? (d.fit as any) : s.fit,
  angle: typeof d.angle === 'number' ? d.angle : s.angle,

  urls: Array.isArray(d.urls) && d.urls.length ? d.urls : s.urls,
});

const fmt = (n: number, d = 1) => (Number.isFinite(n) ? n.toFixed(d) : '0');

const ControlPanelPhoto: React.FC<Props> = ({
  settings, setSettings, running, onStart, onStop, onReset,
  idx, onPrev, onNext,
  onUseBundled, onUsePublic, onPickLocal, onPickDirectory, onReopenDirectory,  onUseSharedStorage,
  onUseUserStorage,
}) => {
  const [isOpen, setIsOpen] = useState(true);

//   return (
//     <div className={`fixed right-4 top-2 p-4 rounded ${isOpen ? 'shadow-lg bg-white/85' : ''} w-60 z-50 h-full overflow-y-auto`}>
//       <button onClick={() => setIsOpen(o => !o)} className="w-full bg-gray-200 text-gray-700 text-xs py-2 rounded mb-2">
//         {isOpen ? 'Collapse Controls' : 'Expand Controls'}
//       </button>

//       {isOpen && (
//         <div className="space-y-3 text-xs">
//           {/* Transport */}
//           <div className="flex gap-2">
//             <button onClick={onStart} className="flex-1 bg-green-600 text-white py-2 rounded" disabled={running}>Start</button>
//             <button onClick={onStop}  className="flex-1 bg-red-600 text-white py-2 rounded">Stop</button>
//             <button onClick={onReset} className="flex-1 bg-gray-600 text-white py-2 rounded">Reset</button>
//           </div>

//           {/* Slideshow */}
//           <label className="flex items-center gap-2">
//             <input type="checkbox" checked={settings.autoplay} onChange={e => setSettings(s => ({ ...s, autoplay: e.target.checked }))}/>
//             Autoplay slideshow
//           </label>
//           <div>
//             <label className="block mb-1">Seconds per slide: {fmt(settings.slideSeconds, 0)}s</label>
//             <input type="range" min={1} max={45} step={1}
//               value={settings.slideSeconds}
//               onChange={e => setSettings(s => ({ ...s, slideSeconds: Number(e.target.value) }))}
//               className="w-full" />
//           </div>

// {/* Shuffle autoplay */}
// <div className="flex items-center gap-2">
//   <input
//     type="checkbox"
//     checked={!!settings.shuffle}
//     onChange={(e) => setSettings(s => ({ ...s, shuffle: e.target.checked }))}
//   />
//   <label>Shuffle (autoplay)</label>
// </div>

//           {/* Direction & base speed */}
//           <div>
//             <label className="block mb-1">Direction</label>
//             <select value={settings.direction}
//               onChange={e => setSettings(s => ({ ...s, direction: e.target.value as Direction }))}
//               className="border p-2 rounded w-full">
//               {DIRS.map(d => <option key={d} value={d}>{d}</option>)}
//             </select>
//           </div>
//           <div>
//             <label className="block mb-1">Speed: {fmt(settings.speed, 1)} px/frame</label>
//             <input type="range" min={0} max={10} step={0.1}
//               value={settings.speed}
//               onChange={e => setSettings(s => ({ ...s, speed: Number(e.target.value) }))}
//               className="w-full" />
//           </div>

//           {/* Oscillation / circular params */}
//           {['oscillateUpDown','oscillateRightLeft'].includes(settings.direction) && (
//             <div>
//               <label className="block mb-1">Oscillation range: {Math.round(settings.oscillationRange)} px</label>
//               <input type="range" min={10} max={800} step={1}
//                 value={settings.oscillationRange}
//                 onChange={e => setSettings(s => ({ ...s, oscillationRange: Number(e.target.value) }))}
//                 className="w-full" />
//             </div>
//           )}
//           {settings.direction === 'circular' && (
//             <>
//               <div>
//                 <label className="block mb-1">Rotation radius: {Math.round(settings.rotationRadius)} px</label>
//                 <input type="range" min={10} max={1200} step={1}
//                   value={settings.rotationRadius}
//                   onChange={e => setSettings(s => ({ ...s, rotationRadius: Number(e.target.value) }))}
//                   className="w-full" />
//               </div>
//               <div>
//                 <label className="block mb-1">Rotation speed: {fmt(settings.rotationSpeed, 2)}</label>
//                 <input type="range" min={0} max={2} step={0.01}
//                   value={settings.rotationSpeed}
//                   onChange={e => setSettings(s => ({ ...s, rotationSpeed: Number(e.target.value) }))}
//                   className="w-full" />
//               </div>
//             </>
//           )}

//           {/* Zoom */}
//           <div>
//             <label className="block mb-1">Zoom mode</label>
//             <select value={settings.zoomMode}
//               onChange={e => setSettings(s => ({ ...s, zoomMode: e.target.value as ZoomMode }))}
//               className="border p-2 rounded w-full">
//               {ZOOMS.map(z => <option key={z} value={z}>{z}</option>)}
//             </select>
//           </div>
//           {settings.zoomMode !== 'none' && (
//             <>
//               <div>
//                 <label className="block mb-1">Zoom min: {fmt(settings.zoomMin, 2)}×</label>
//                 <input type="range" min={0.5} max={3} step={0.01}
//                   value={settings.zoomMin}
//                   onChange={e => setSettings(s => ({ ...s, zoomMin: Number(e.target.value) }))}
//                   className="w-full" />
//               </div>
//               <div>
//                 <label className="block mb-1">Zoom max: {fmt(settings.zoomMax, 2)}×</label>
//                 <input type="range" min={0.5} max={3} step={0.01}
//                   value={settings.zoomMax}
//                   onChange={e => setSettings(s => ({ ...s, zoomMax: Number(e.target.value) }))}
//                   className="w-full" />
//               </div>
//               <div>
//                 <label className="block mb-1">Zoom speed: {fmt(settings.zoomSpeed, 2)} cycles/s</label>
//                 <input type="range" min={0} max={2} step={0.01}
//                   value={settings.zoomSpeed}
//                   onChange={e => setSettings(s => ({ ...s, zoomSpeed: Number(e.target.value) }))}
//                   className="w-full" />
//               </div>
//             </>
//           )}

//           {/* Image opacity animation */}
//           <div>
//             <label className="block mb-1">Image opacity mode</label>
//             <select value={settings.imageOpacityMode}
//               onChange={e => setSettings(s => ({ ...s, imageOpacityMode: e.target.value as OpacityMode }))}
//               className="border p-2 rounded w-full">
//               {ALPHAS.map(a => <option key={a} value={a}>{a}</option>)}
//             </select>
//           </div>
//           {settings.imageOpacityMode !== 'constant' && (
//             <div>
//               <label className="block mb-1">Opacity speed: {fmt(settings.imageOpacitySpeed, 2)} cycles/s</label>
//               <input type="range" min={0} max={2} step={0.01}
//                 value={settings.imageOpacitySpeed}
//                 onChange={e => setSettings(s => ({ ...s, imageOpacitySpeed: Number(e.target.value) }))}
//                 className="w-full" />
//             </div>
//           )}
//           <div>
//             <label className="block mb-1">Image opacity min: {Math.round(settings.imageOpacityMin * 100)}%</label>
//             <input type="range" min={0} max={100} step={1}
//               value={Math.round(settings.imageOpacityMin * 100)}
//               onChange={e => setSettings(s => ({ ...s, imageOpacityMin: Number(e.target.value) / 100 }))}
//               className="w-full" />
//           </div>
//           <div>
//             <label className="block mb-1">Image opacity max: {Math.round(settings.imageOpacityMax * 100)}%</label>
//             <input type="range" min={0} max={100} step={1}
//               value={Math.round(settings.imageOpacityMax * 100)}
//               onChange={e => setSettings(s => ({ ...s, imageOpacityMax: Number(e.target.value) / 100 }))}
//               className="w-full" />
//           </div>

//           {/* Overlay & layout */}
//           <div>
//             <label className="block mb-1">Overlay color</label>
//             <input type="color" value={settings.overlayColor}
//               onChange={e => setSettings(s => ({ ...s, overlayColor: e.target.value }))}
//               className="w-full h-8" />
//           </div>
//           <div>
//             <label className="block mb-1">Overlay opacity: {Math.round(settings.overlayOpacity * 100)}%</label>
//             <input type="range" min={0} max={100} step={1}
//               value={Math.round(settings.overlayOpacity * 100)}
//               onChange={e => setSettings(s => ({ ...s, overlayOpacity: Number(e.target.value) / 100 }))}
//               className="w-full" />
//           </div>
//           <div>
//             <label className="block mb-1">Fit</label>
//             <select value={settings.fit}
//               onChange={e => setSettings(s => ({ ...s, fit: e.target.value as PhotoSettings['fit'] }))}
//               className="border p-2 rounded w-full">
//               {FITS.map(f => <option key={f} value={f}>{f}</option>)}
//             </select>
//           </div>
//           <div>
//             <label className="block mb-1">Angle: {Math.round((settings.angle * 180) / Math.PI)}°</label>
//             <input type="range" min={-180} max={180} step={1}
//               value={Math.round((settings.angle * 180) / Math.PI)}
//               onChange={e => setSettings(s => ({ ...s, angle: (Number(e.target.value) * Math.PI) / 180 }))}
//               className="w-full" />
//           </div>
// {/* Overlay blur */}
// <div>
//   <label className="block mb-1">Overlay Blur: {Number(settings.overlayBlur ?? 0).toFixed(1)}</label>
//   <input
//     type="range" min={0} max={8} step={0.5}
//     value={settings.overlayBlur ?? 0}
//     onChange={(e) => setSettings(s => ({ ...s, overlayBlur: parseFloat(e.target.value) }))}
//     className="w-full"
//   />
// </div>

// {/* Transition mode */}
// <div className="grid grid-cols-2 gap-2 items-center">
//   <label>Mode</label>
//   <select
//     value={settings.transitionMode ?? 'none'}
//     onChange={(e) => setSettings(s => ({ ...s, transitionMode: e.target.value }))}
//     className="border p-1 rounded"
//   >
//     <option value="none">None</option>
//     <option value="crossfade">Crossfade</option>
//     <option value="slide">Slide</option>
//     <option value="kenburns">Ken Burns</option>
//   </select>
// </div>




//           {/* Photo sources */}
//           <div className=" space-y-2 border rounded p-2 bg-white/60">
//             <div className="font-semibold mb-1">Photo Sources</div>
//             <div className="grid grid-cols-2 gap-2">
//               {/* <button className="px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200" onClick={onUseBundled}>Use App Assets</button> */}
//               <button className="px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200" onClick={() => onUsePublic()}>App Assets</button>
//               <button className="px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200 " onClick={onReopenDirectory}>Reopen Last Folder</button>
//               <button className="px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200" onClick={onPickLocal}>Pick Local Files…</button>
//               <button className="px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200" onClick={onPickDirectory}>Pick Folder…</button>
              
           
//             {/* //-------------goggle */}
//             <button onClick={onUseSharedStorage} className="px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200">
//   Load Shared (Storage)
// </button>
// <button onClick={onUseUserStorage} className="px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200">
//   Load My Folder (Storage)
// </button>
//          </div>   
//          <div className="mt-2 text-[11px] text-gray-600">Total loaded: {settings.urls.length}</div>
//           </div>






//           {/* Inline prev/next */}
//           <div className="flex items-center gap-2">
//             <button onClick={onPrev} className="flex-1 bg-gray-200 rounded py-1">◀ Prev</button>
//             <div className="px-2 py-1 text-center text-[11px] border rounded">{idx + 1} / {settings.urls.length || 0}</div>
//             <button onClick={onNext} className="flex-1 bg-gray-200 rounded py-1">Next ▶</button>
//           </div>

//           <hr className="my-2" />

//           {/* Presets — same shared block used elsewhere */}
//           <PresetControls
//             module={MODULE}
//             settings={settings}
//             setSettings={setSettings}
//             mergeLoaded={mergeLoaded}
//             className="bg-transparent"
//           />
//         </div>
//       )}
//     </div>
//   );
//new return more organized 
return (
  <div className={`fixed right-4 top-2 p-4 rounded ${isOpen ? 'shadow-lg bg-white/85' : ''} w-60 z-50 h-full overflow-y-auto`}>
    {/* Collapser */}
    <button
      onClick={() => setIsOpen(o => !o)}
      className="w-full bg-gray-200 text-gray-700 text-xs py-2 rounded mb-2"
      aria-expanded={isOpen}
    >
      {isOpen ? 'Collapse Controls' : 'Expand Controls'}
    </button>

    {isOpen && (
      <div className="space-y-3 text-xs">

        {/* Transport */}
        <div className="space-y-2 border rounded p-2 bg-white/60">
          <div className="font-semibold mb-1">Transport</div>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={onStart} className="bg-green-600 text-white py-2 rounded disabled:opacity-60" disabled={running}>Start</button>
            <button onClick={onStop}  className="bg-red-600   text-white py-2 rounded">Stop</button>
            <button onClick={onReset} className="bg-gray-600  text-white py-2 rounded">Reset</button>
          </div>
        </div>

        {/* Slideshow */}
        <div className="space-y-2 border rounded p-2 bg-white/60">
          <div className="font-semibold mb-1">Slideshow</div>

          {/* Autoplay / Shuffle */}
          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.autoplay}
                onChange={e => setSettings(s => ({ ...s, autoplay: e.target.checked }))}
              />
              <span>Autoplay</span>
            </label>
            <label className="flex items-center gap-2 justify-end">
              <input
                type="checkbox"
                checked={!!settings.shuffle}
                onChange={e => setSettings(s => ({ ...s, shuffle: e.target.checked }))}
              />
              <span>Shuffle</span>
            </label>
          </div>

          {/* Seconds / Mode */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block mb-1">Sec/slide: {fmt(settings.slideSeconds, 0)}</label>
              <input
                type="range" min={1} max={45} step={1}
                value={settings.slideSeconds}
                onChange={e => setSettings(s => ({ ...s, slideSeconds: Number(e.target.value) }))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block mb-1">Mode</label>
              <select
                value={settings.transitionMode ?? 'none'}
                onChange={(e) => setSettings(s => ({ ...s, transitionMode: e.target.value }))}
                className="border p-1 rounded w-full"
              >
                <option value="none">None</option>
                <option value="crossfade">Crossfade</option>
                <option value="slide">Slide</option>
                <option value="kenburns">Ken Burns</option>
              </select>
            </div>
          </div>

          {/* Prev / Index / Next */}
          <div className="flex items-center gap-2 pt-1">
            <button onClick={onPrev} className="flex-1 bg-gray-200 rounded py-1">◀ Prev</button>
            <div className="px-2 py-1 text-center text-[11px] border rounded">
              {idx + 1} / {settings.urls.length || 0}
            </div>
            <button onClick={onNext} className="flex-1 bg-gray-200 rounded py-1">Next ▶</button>
          </div>
        </div>

        {/* Motion */}
        <div className="space-y-2 border rounded p-2 bg-white/60">
          <div className="font-semibold mb-1">Motion</div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block mb-1">Direction</label>
              <select
                value={settings.direction}
                onChange={e => setSettings(s => ({ ...s, direction: e.target.value as Direction }))}
                className="border p-1 rounded w-full"
              >
                {DIRS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block mb-1">Speed: {fmt(settings.speed, 1)}</label>
              <input
                type="range" min={0} max={10} step={0.1}
                value={settings.speed}
                onChange={e => setSettings(s => ({ ...s, speed: Number(e.target.value) }))}
                className="w-full"
              />
            </div>
          </div>

          {/* Conditional ranges */}
          {['oscillateUpDown','oscillateRightLeft'].includes(settings.direction) && (
            <div>
              <label className="block mb-1">Oscillation: {Math.round(settings.oscillationRange)}px</label>
              <input
                type="range" min={10} max={800} step={1}
                value={settings.oscillationRange}
                onChange={e => setSettings(s => ({ ...s, oscillationRange: Number(e.target.value) }))}
                className="w-full"
              />
            </div>
          )}
          {settings.direction === 'circular' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block mb-1">Radius: {Math.round(settings.rotationRadius)}px</label>
                <input
                  type="range" min={10} max={1200} step={1}
                  value={settings.rotationRadius}
                  onChange={e => setSettings(s => ({ ...s, rotationRadius: Number(e.target.value) }))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block mb-1">Rot speed: {fmt(settings.rotationSpeed, 2)}</label>
                <input
                  type="range" min={0} max={2} step={0.01}
                  value={settings.rotationSpeed}
                  onChange={e => setSettings(s => ({ ...s, rotationSpeed: Number(e.target.value) }))}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Zoom */}
        <div className="space-y-2 border rounded p-2 bg-white/60">
          <div className="font-semibold mb-1">Zoom</div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block mb-1">Mode</label>
              <select
                value={settings.zoomMode}
                onChange={e => setSettings(s => ({ ...s, zoomMode: e.target.value as ZoomMode }))}
                className="border p-1 rounded w-full"
              >
                {ZOOMS.map(z => <option key={z} value={z}>{z}</option>)}
              </select>
            </div>
            <div>
              <label className="block mb-1">Speed: {fmt(settings.zoomSpeed, 2)}</label>
              <input
                type="range" min={0} max={2} step={0.01}
                value={settings.zoomSpeed}
                onChange={e => setSettings(s => ({ ...s, zoomSpeed: Number(e.target.value) }))}
                className="w-full"
              />
            </div>
          </div>

          {settings.zoomMode !== 'none' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block mb-1">Min: {fmt(settings.zoomMin, 2)}×</label>
                <input
                  type="range" min={0.5} max={3} step={0.01}
                  value={settings.zoomMin}
                  onChange={e => setSettings(s => ({ ...s, zoomMin: Number(e.target.value) }))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block mb-1">Max: {fmt(settings.zoomMax, 2)}×</label>
                <input
                  type="range" min={0.5} max={3} step={0.01}
                  value={settings.zoomMax}
                  onChange={e => setSettings(s => ({ ...s, zoomMax: Number(e.target.value) }))}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Image Opacity */}
        <div className="space-y-2 border rounded p-2 bg-white/60">
          <div className="font-semibold mb-1">Image Opacity</div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block mb-1">Mode</label>
              <select
                value={settings.imageOpacityMode}
                onChange={e => setSettings(s => ({ ...s, imageOpacityMode: e.target.value as OpacityMode }))}
                className="border p-1 rounded w-full"
              >
                {ALPHAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            {settings.imageOpacityMode !== 'constant' && (
              <div>
                <label className="block mb-1">Speed: {fmt(settings.imageOpacitySpeed, 2)}</label>
                <input
                  type="range" min={0} max={2} step={0.01}
                  value={settings.imageOpacitySpeed}
                  onChange={e => setSettings(s => ({ ...s, imageOpacitySpeed: Number(e.target.value) }))}
                  className="w-full"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block mb-1">Min: {Math.round(settings.imageOpacityMin * 100)}%</label>
              <input
                type="range" min={0} max={100} step={1}
                value={Math.round(settings.imageOpacityMin * 100)}
                onChange={e => setSettings(s => ({ ...s, imageOpacityMin: Number(e.target.value) / 100 }))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block mb-1">Max: {Math.round(settings.imageOpacityMax * 100)}%</label>
              <input
                type="range" min={0} max={100} step={1}
                value={Math.round(settings.imageOpacityMax * 100)}
                onChange={e => setSettings(s => ({ ...s, imageOpacityMax: Number(e.target.value) / 100 }))}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Overlay & Layout */}
        <div className="space-y-2 border rounded p-2 bg-white/60">
          <div className="font-semibold mb-1">Overlay & Layout</div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block mb-1">Color</label>
              <input
                type="color"
                value={settings.overlayColor}
                onChange={e => setSettings(s => ({ ...s, overlayColor: e.target.value }))}
                className="w-full h-8"
              />
            </div>
            <div>
              <label className="block mb-1">Opacity: {Math.round(settings.overlayOpacity * 100)}%</label>
              <input
                type="range" min={0} max={100} step={1}
                value={Math.round(settings.overlayOpacity * 100)}
                onChange={e => setSettings(s => ({ ...s, overlayOpacity: Number(e.target.value) / 100 }))}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block mb-1">Blur: {Number(settings.overlayBlur ?? 0).toFixed(1)}</label>
              <input
                type="range" min={0} max={8} step={0.5}
                value={settings.overlayBlur ?? 0}
                onChange={(e) => setSettings(s => ({ ...s, overlayBlur: parseFloat(e.target.value) }))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block mb-1">Fit</label>
              <select
                value={settings.fit}
                onChange={e => setSettings(s => ({ ...s, fit: e.target.value as PhotoSettings['fit'] }))}
                className="border p-1 rounded w-full"
              >
                {FITS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block mb-1">Angle: {Math.round((settings.angle * 180) / Math.PI)}°</label>
            <input
              type="range" min={-180} max={180} step={1}
              value={Math.round((settings.angle * 180) / Math.PI)}
              onChange={e => setSettings(s => ({ ...s, angle: (Number(e.target.value) * Math.PI) / 180 }))}
              className="w-full"
            />
          </div>
        </div>

        {/* Photo Sources */}
        <div className="space-y-2 border rounded p-2 bg-white/60">
          <div className="font-semibold mb-1">Photo Sources</div>
          <div className="grid grid-cols-2 gap-2">
            <button className="px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200" onClick={() => onUsePublic()}>
              App Assets
            </button>
            <button className="px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200" onClick={onReopenDirectory}>
              Reopen Last
            </button>
            <button className="px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200" onClick={onPickLocal}>
              Pick Files…
            </button>
            <button className="px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200" onClick={onPickDirectory}>
              Pick Folder…
            </button>
            <button onClick={onUseSharedStorage} className="px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200">
              Load Shared (Storage)
            </button>
            <button onClick={onUseUserStorage} className="px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200">
              Load My Folder
            </button>
          </div>
          <div className="mt-2 text-[11px] text-gray-600">Total loaded: {settings.urls.length}</div>
        </div>

        {/* Presets */}
        <div className="space-y-2 border rounded p-2 bg-white/60">
          <div className="font-semibold mb-1">Presets</div>
          <PresetControls
            module={MODULE}
            settings={settings}
            setSettings={setSettings}
            mergeLoaded={mergeLoaded}
            className="bg-transparent"
          />
        </div>

      </div>
    )}
  </div>
);


};

export default ControlPanelPhoto;

//----------------version  1 -------------------------

// import React, { useMemo, useState } from 'react';
// import type { Direction, PhotoSettings, ZoomMode } from './PhotoAnimations';

// type Props = {
//   settings: PhotoSettings;
//   setSettings: React.Dispatch<React.SetStateAction<PhotoSettings>>;
//   running: boolean;
//   onStart: () => void;
//   onStop: () => void;
//   onReset: () => void;
//   idx: number;
//   onPrev: () => void;
//   onNext: () => void;

//   // sources
//   onUseBundled: () => void;
//   onUsePublic: (count?: number) => void;
//   onPickLocal: () => void;

//   // presets (localStorage)
//   onSavePreset: (name: string) => void;
//   onApplyPreset: (name: string) => void;
//   onDeletePreset: (name: string) => void;
//   listPresets: () => string[];
// };

// const fmt = (n: number, d = 1) => (Number.isFinite(n) ? n.toFixed(d) : '0');

// const ControlPanelPhoto: React.FC<Props> = ({
//   settings,
//   setSettings,
//   running,
//   onStart,
//   onStop,
//   onReset,
//   idx,
//   onPrev,
//   onNext,
//   onUseBundled,
//   onUsePublic,
//   onPickLocal,
//   onSavePreset,
//   onApplyPreset,
//   onDeletePreset,
//   listPresets,
// }) => {
//   const [isOpen, setIsOpen] = useState(true);
//   const [presetName, setPresetName] = useState('');
//   const presets = useMemo(() => listPresets(), [listPresets, settings.urls.length]);

//   return (
//     <div
//       className={`fixed right-4 top-2 p-4 rounded ${
//         isOpen ? 'shadow-lg bg-white/85' : ''
//       } w-72 z-50 max-h-[90vh] overflow-y-auto`}
//     >
//       <button
//         onClick={() => setIsOpen(o => !o)}
//         className="w-full bg-gray-200 text-gray-700 text-xs py-2 rounded mb-2"
//       >
//         {isOpen ? 'Collapse Controls' : 'Expand Controls'}
//       </button>

//       {isOpen && (
//         <div className="space-y-3 text-xs">
//           {/* Transport */}
//           <div className="flex gap-2">
//             <button
//               onClick={onStart}
//               className="flex-1 bg-green-600 text-white py-2 rounded"
//               disabled={running}
//             >
//               Start
//             </button>
//             <button onClick={onStop} className="flex-1 bg-red-600 text-white py-2 rounded">
//               Stop
//             </button>
//             <button onClick={onReset} className="flex-1 bg-gray-600 text-white py-2 rounded">
//               Reset
//             </button>
//           </div>

//           {/* Slideshow */}
//           <label className="flex items-center gap-2">
//             <input
//               type="checkbox"
//               checked={settings.autoplay}
//               onChange={e => setSettings(s => ({ ...s, autoplay: e.target.checked }))}
//             />
//             Autoplay slideshow
//           </label>
//           <div>
//             <label className="block mb-1">Seconds per slide: {fmt(settings.slideSeconds, 0)}s</label>
//             <input
//               type="range"
//               min={2}
//               max={30}
//               step={1}
//               value={settings.slideSeconds}
//               onChange={e => setSettings(s => ({ ...s, slideSeconds: Number(e.target.value) }))}
//               className="w-full"
//             />
//           </div>

//           {/* Direction */}
//           <div>
//             <label className="block mb-1">Direction</label>
//             <select
//               value={settings.direction}
//               onChange={e =>
//                 setSettings(s => ({ ...s, direction: e.target.value as Direction }))
//               }
//               className="border p-2 rounded w-full"
//             >
//               <option value="static">Static</option>
//               <option value="up">Up</option>
//               <option value="down">Down</option>
//               <option value="left">Left</option>
//               <option value="right">Right</option>
//               <option value="oscillateUpDown">Oscillate Up/Down</option>
//               <option value="oscillateRightLeft">Oscillate Left/Right</option>
//               <option value="circular">Circular</option>
//             </select>
//           </div>

//           {/* Motion params */}
//           <div>
//             <label className="block mb-1">Speed: {fmt(settings.speed, 1)} px/frame</label>
//             <input
//               type="range"
//               min={0}
//               max={10}
//               step={0.1}
//               value={settings.speed}
//               onChange={e => setSettings(s => ({ ...s, speed: Number(e.target.value) }))}
//               className="w-full"
//             />
//           </div>

//           {['oscillateUpDown', 'oscillateRightLeft'].includes(settings.direction) && (
//             <div>
//               <label className="block mb-1">
//                 Oscillation range: {Math.round(settings.oscillationRange)} px
//               </label>
//               <input
//                 type="range"
//                 min={10}
//                 max={600}
//                 step={1}
//                 value={settings.oscillationRange}
//                 onChange={e =>
//                   setSettings(s => ({ ...s, oscillationRange: Number(e.target.value) }))
//                 }
//                 className="w-full"
//               />
//             </div>
//           )}

//           {settings.direction === 'circular' && (
//             <>
//               <div>
//                 <label className="block mb-1">
//                   Rotation radius: {Math.round(settings.rotationRadius)} px
//                 </label>
//                 <input
//                   type="range"
//                   min={10}
//                   max={800}
//                   step={1}
//                   value={settings.rotationRadius}
//                   onChange={e =>
//                     setSettings(s => ({ ...s, rotationRadius: Number(e.target.value) }))
//                   }
//                   className="w-full"
//                 />
//               </div>
//               <div>
//                 <label className="block mb-1">
//                   Rotation speed: {fmt(settings.rotationSpeed, 2)} rad/s
//                 </label>
//                 <input
//                   type="range"
//                   min={0}
//                   max={3}
//                   step={0.01}
//                   value={settings.rotationSpeed}
//                   onChange={e =>
//                     setSettings(s => ({ ...s, rotationSpeed: Number(e.target.value) }))
//                   }
//                   className="w-full"
//                 />
//               </div>
//             </>
//           )}

//           {/* Zoom */}
//           <div>
//             <label className="block mb-1">Zoom mode</label>
//             <select
//               value={settings.zoomMode}
//               onChange={e =>
//                 setSettings(s => ({ ...s, zoomMode: e.target.value as ZoomMode }))
//               }
//               className="border p-2 rounded w-full"
//             >
//               <option value="none">None</option>
//               <option value="inOut">In ↔ Out</option>
//               <option value="pulse">Pulse</option>
//             </select>
//           </div>
//           {settings.zoomMode !== 'none' && (
//             <>
//               <div>
//                 <label className="block mb-1">Zoom min: {fmt(settings.zoomMin, 2)}×</label>
//                 <input
//                   type="range"
//                   min={0.5}
//                   max={2.0}
//                   step={0.01}
//                   value={settings.zoomMin}
//                   onChange={e =>
//                     setSettings(s => ({ ...s, zoomMin: Number(e.target.value) }))
//                   }
//                   className="w-full"
//                 />
//               </div>
//               <div>
//                 <label className="block mb-1">Zoom max: {fmt(settings.zoomMax, 2)}×</label>
//                 <input
//                   type="range"
//                   min={0.5}
//                   max={3.0}
//                   step={0.01}
//                   value={settings.zoomMax}
//                   onChange={e =>
//                     setSettings(s => ({ ...s, zoomMax: Number(e.target.value) }))
//                   }
//                   className="w-full"
//                 />
//               </div>
//               <div>
//                 <label className="block mb-1">
//                   Zoom speed: {fmt(settings.zoomSpeed, 2)} cycles/s
//                 </label>
//                 <input
//                   type="range"
//                   min={0}
//                   max={2}
//                   step={0.01}
//                   value={settings.zoomSpeed}
//                   onChange={e =>
//                     setSettings(s => ({ ...s, zoomSpeed: Number(e.target.value) }))
//                   }
//                   className="w-full"
//                 />
//               </div>
//             </>
//           )}

//           {/* Overlay & layout */}
//           <div>
//             <label className="block mb-1">Overlay color</label>
//             <input
//               type="color"
//               value={settings.overlayColor}
//               onChange={e => setSettings(s => ({ ...s, overlayColor: e.target.value }))}
//               className="w-full h-8"
//             />
//           </div>
//           <div>
//             <label className="block mb-1">
//               Overlay opacity: {Math.round(settings.overlayOpacity * 100)}%
//             </label>
//             <input
//               type="range"
//               min={0}
//               max={100}
//               step={1}
//               value={Math.round(settings.overlayOpacity * 100)}
//               onChange={e =>
//                 setSettings(s => ({ ...s, overlayOpacity: Number(e.target.value) / 100 }))
//               }
//               className="w-full"
//             />
//           </div>

//           <div>
//             <label className="block mb-1">Fit</label>
//             <select
//               value={settings.fit}
//               onChange={e =>
//                 setSettings(s => ({
//                   ...s,
//                   fit: e.target.value as PhotoSettings['fit'],
//                 }))
//               }
//               className="border p-2 rounded w-full"
//             >
//               <option value="cover">Cover</option>
//               <option value="contain">Contain</option>
//             </select>
//           </div>
//           <div>
//             <label className="block mb-1">
//               Angle: {Math.round((settings.angle * 180) / Math.PI)}°
//             </label>
//             <input
//               type="range"
//               min={-180}
//               max={180}
//               step={1}
//               value={Math.round((settings.angle * 180) / Math.PI)}
//               onChange={e =>
//                 setSettings(s => ({
//                   ...s,
//                   angle: (Number(e.target.value) * Math.PI) / 180,
//                 }))
//               }
//               className="w-full"
//             />
//           </div>

//           {/* Photo Sources */}
//           <div className="border rounded p-2 bg-white/60">
//             <div className="font-semibold mb-1">Photos</div>
//             <div className="grid grid-cols-2 gap-2">
//               <button
//                 onClick={onUseBundled}
//                 className="px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200"
//               >
//                 Use App Assets
//               </button>
//               <button
//                 onClick={() => onUsePublic(14)}
//                 className="px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200"
//               >
//                 Use /public/bgphotos
//               </button>
//               <button
//                 onClick={onPickLocal}
//                 className="px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200"
//               >
//                 Pick Local Files…
//               </button>
//             </div>
//             <div className="mt-2 text-[11px] text-gray-600">
//               Total loaded: {settings.urls.length}
//             </div>
//           </div>

//           {/* Prev/Next inline too (besides the bottom bar) */}
//           <div className="flex items-center gap-2">
//             <button onClick={onPrev} className="flex-1 bg-gray-200 rounded py-1">
//               ◀ Prev
//             </button>
//             <div className="px-2 py-1 text-center text-[11px] border rounded">
//               {idx + 1} / {settings.urls.length || 0}
//             </div>
//             <button onClick={onNext} className="flex-1 bg-gray-200 rounded py-1">
//               Next ▶
//             </button>
//           </div>

//           {/* Presets (localStorage) */}
//           <div className="border rounded p-2 bg-white/60 space-y-2">
//             <div className="font-semibold">Presets</div>
//             <div className="flex gap-2">
//               <input
//                 className="flex-1 border rounded px-2 py-1"
//                 placeholder="Preset name"
//                 value={presetName}
//                 onChange={e => setPresetName(e.target.value)}
//               />
//               <button
//                 className="px-2 py-1 border rounded bg-blue-600 text-white"
//                 onClick={() => presetName && onSavePreset(presetName)}
//               >
//                 Save
//               </button>
//             </div>
//             {presets.length > 0 && (
//               <div className="flex gap-2">
//                 <select
//                   className="flex-1 border rounded px-2 py-1"
//                   onChange={e => onApplyPreset(e.target.value)}
//                   defaultValue=""
//                 >
//                   <option value="" disabled>
//                     Load preset…
//                   </option>
//                   {presets.map(name => (
//                     <option key={name} value={name}>
//                       {name}
//                     </option>
//                   ))}
//                 </select>
//                 <button
//                   className="px-2 py-1 border rounded bg-red-600 text-white"
//                   onClick={() => {
//                     const name = prompt('Delete which preset? (type exact name)');
//                     if (name) onDeletePreset(name);
//                   }}
//                 >
//                   Delete
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ControlPanelPhoto;

