// src/components/Therapy/ControlPanel.tsx
import React, { useState } from 'react';
import { Collapse } from 'react-collapse';
import Slider from '../common/Slider';
import PresetControls from '../common/PresetControls';
import type { PresetModule } from '../../utils/presets';

export interface MultifunctionSettings {
  waveType: 'sine' | 'tan' | 'cotan' | 'sawtooth' | 'square' | 'triangle';
  direction:
    | 'static'
    | 'up'
    | 'down'
    | 'left'
    | 'right'
    | 'oscillateUpDown'
    | 'oscillateRightLeft'
    | 'circular';
  rotationSpeed: number;
  rotationRadius: number;
  oscillationRange: number;

  angle: number;         // radians
  amplitude: number;
  frequency: number;
  speed: number;

  thickness: number;
  phaseOffset: number;   // radians
  numLines: number;
  distance: number;
  groups: number;
  groupDistance: number;

  bgColor: string;
  lineColor: string;
  selectedPalette: 'none' | 'rainbow' | 'pastel';

  // ✅ NEW opacity controls
  bgOpacity?: number;                 // 0..1
  lineOpacity?: number;               // 0..1
  opacityMode?: 'constant' | 'pulse';
  opacitySpeed?: number;

   // ...to adjust the hight of animation
  yOffsetPx?: number;
  fitHeight?: boolean;
}

interface ControlPanelProps {
  settings: MultifunctionSettings;
  setSettings: React.Dispatch<React.SetStateAction<MultifunctionSettings>>;
  startAnimation: () => void;
  stopAnimation: () => void;
  resetAnimation: () => void;
}

const MODULE: PresetModule = 'multifunction';

const WAVE_OPTS = ['sine', 'tan', 'cotan', 'sawtooth', 'square', 'triangle'] as const;
const DIR_OPTS = [
  'static','up','down','left','right','oscillateUpDown','oscillateRightLeft','circular',
] as const;
const PALETTE_OPTS = ['none', 'rainbow', 'pastel'] as const;

const mergeLoaded = (
  loaded: Partial<MultifunctionSettings>,
  curr: MultifunctionSettings
): MultifunctionSettings => ({
  ...curr,

  waveType: WAVE_OPTS.includes(loaded.waveType as any)
    ? (loaded.waveType as any)
    : curr.waveType,

  direction: DIR_OPTS.includes(loaded.direction as any)
    ? (loaded.direction as any)
    : curr.direction,

  rotationSpeed:
    typeof loaded.rotationSpeed === 'number' ? loaded.rotationSpeed : curr.rotationSpeed,
  rotationRadius:
    typeof loaded.rotationRadius === 'number' ? loaded.rotationRadius : curr.rotationRadius,
  oscillationRange:
    typeof loaded.oscillationRange === 'number' ? loaded.oscillationRange : curr.oscillationRange,

  angle: typeof loaded.angle === 'number' ? loaded.angle : curr.angle,
  amplitude: typeof loaded.amplitude === 'number' ? loaded.amplitude : curr.amplitude,
  frequency: typeof loaded.frequency === 'number' ? loaded.frequency : curr.frequency,
  speed: typeof loaded.speed === 'number' ? loaded.speed : curr.speed,

  thickness: typeof loaded.thickness === 'number' ? loaded.thickness : curr.thickness,
  phaseOffset: typeof loaded.phaseOffset === 'number' ? loaded.phaseOffset : curr.phaseOffset,
  numLines: typeof loaded.numLines === 'number' ? loaded.numLines : curr.numLines,
  distance: typeof loaded.distance === 'number' ? loaded.distance : curr.distance,
  groups: typeof loaded.groups === 'number' ? loaded.groups : curr.groups,
  groupDistance:
    typeof loaded.groupDistance === 'number' ? loaded.groupDistance : curr.groupDistance,

  bgColor: typeof loaded.bgColor === 'string' ? loaded.bgColor : curr.bgColor,
  lineColor: typeof loaded.lineColor === 'string' ? loaded.lineColor : curr.lineColor,

  selectedPalette: PALETTE_OPTS.includes(loaded.selectedPalette as any)
    ? (loaded.selectedPalette as any)
    : curr.selectedPalette,

  // ✅ merge new fields with sensible fallbacks
  bgOpacity: typeof loaded.bgOpacity === 'number' ? loaded.bgOpacity : (curr.bgOpacity ?? 1),
  lineOpacity: typeof loaded.lineOpacity === 'number' ? loaded.lineOpacity : (curr.lineOpacity ?? 1),
  opacityMode:
    loaded.opacityMode === 'pulse' || loaded.opacityMode === 'constant'
      ? loaded.opacityMode
      : (curr.opacityMode ?? 'constant'),
  opacitySpeed:
    typeof loaded.opacitySpeed === 'number' ? loaded.opacitySpeed : (curr.opacitySpeed ?? 1),
     yOffsetPx: typeof loaded.yOffsetPx === 'number' ? loaded.yOffsetPx : curr.yOffsetPx,
  fitHeight: typeof loaded.fitHeight === 'boolean' ? loaded.fitHeight : curr.fitHeight,
});

const ControlPanel: React.FC<ControlPanelProps> = ({
  settings,
  setSettings,
  startAnimation,
  stopAnimation,
  resetAnimation,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  // local getters with defaults so UI always shows valid values
  const bgOpacity   = settings.bgOpacity   ?? 1;
  const lineOpacity = settings.lineOpacity ?? 1;
  const opacityMode = settings.opacityMode ?? 'constant';
  const opacitySpeed= settings.opacitySpeed?? 1;

  return (
    <div
      className={`fixed right-4 top-2 p-4 rounded ${
        isOpen ? 'shadow-lg bg-transparent' : ''
      } w-60 z-50 h-full overflow-y-auto`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="mb-2 bg-gray-200 text-xs p-2 border rounded w-full"
      >
        {isOpen ? 'Collapse Controls' : 'Expand Controls'}
      </button>

      <Collapse isOpened={isOpen}>
        <div className="space-y-2">
          {/* Transport */}
          <div className="text-xs flex space-x-2">
            <button onClick={startAnimation} className="bg-green-500 text-xs text-white p-2 rounded w-1/3">Start</button>
            <button onClick={stopAnimation}  className="bg-red-500   text-xs text-white p-2 rounded w-1/3">Stop</button>
            <button onClick={resetAnimation} className="bg-gray-500  text-xs text-white p-2 rounded w-1/3">Reset</button>
          </div>

          {/* Wave Type */}
          <div className="control-group text-xs">
            <label className="block mb-2 text-xs">Wave Type:</label>
            <select
              value={settings.waveType}
              onChange={(e) => setSettings({ ...settings, waveType: e.target.value as any })}
              className="border p-2 rounded w-full"
            >
              <option value="sine">Sine</option>
              <option value="tan">Tan</option>
              <option value="cotan">Cotan</option>
              <option value="sawtooth">Sawtooth</option>
              <option value="square">Square</option>
              <option value="triangle">Triangle</option>
            </select>
          </div>

          {/* Direction */}
          <div className="control-group text-xs">
            <label className="block mb-2 text-xs">Direction:</label>
            <select
              value={settings.direction}
              onChange={(e) => setSettings({ ...settings, direction: e.target.value as any })}
              className="border p-2 rounded w-full"
            >
              <option value="static">Static</option>
              <option value="up">Up</option>
              <option value="down">Down</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="oscillateUpDown">Oscillate Up and Down</option>
              <option value="oscillateRightLeft">Oscillate Right and Left</option>
              <option value="circular">Circular</option>
            </select>
          </div>

          {/* Circular-only controls */}
          {settings.direction === 'circular' && (
            <>
              <div className="control-group text-xs">
                <label className="block mb-2 text-xs">Rotation Speed:</label>
                <input
                  type="range" min="0.0" max="2" step="0.1"
                  value={settings.rotationSpeed}
                  onChange={(e) => setSettings({ ...settings, rotationSpeed: parseFloat(e.target.value) })}
                  className="w-full" list="rotationSpeedSteps"
                />
                <datalist id="rotationSpeedSteps">
                  {[...Array(100)].map((_, i) => <option key={i} value={i / 100}></option>)}
                </datalist>
              </div>
              <div className="control-group text-xs ">
                <label className="block mb-2 text-xs">Rotation Radius:</label>
                <input
                  type="range" min="10" max="500"
                  value={settings.rotationRadius}
                  onChange={(e) => setSettings({ ...settings, rotationRadius: parseFloat(e.target.value) })}
                  className="w-full" list="rotationRadiusSteps"
                />
                <datalist id="rotationRadiusSteps">
                  {[...Array(50)].map((_, i) => <option key={i} value={i * 10}></option>)}
                </datalist>
              </div>
            </>
          )}

          {/* Oscillation-only control */}
          {['oscillateUpDown', 'oscillateRightLeft'].includes(settings.direction) && (
            <div className="control-group">
              <label className="block mb-2 text-xs">Oscillation Range:</label>
              <input
                type="range"
                min="10" max={Math.min(window.innerWidth, window.innerHeight)}
                value={settings.oscillationRange}
                onChange={(e) => setSettings({ ...settings, oscillationRange: parseFloat(e.target.value) })}
                className="w-full" list="oscillationRangeSteps"
              />
              <datalist id="oscillationRangeSteps">
                {[...Array(10)].map((_, i) => <option key={i} value={i * 10}></option>)}
              </datalist>
            </div>
          )}

          {/* Angle (degrees input, stored as radians) */}
          <div className="control-group text-xs">
            <label className="block mb-2 text-xs">Angle:</label>
            <input
              type="range" min="0" max="360" step="1"
              value={settings.angle * (180 / Math.PI)}
              onChange={(e) => setSettings({ ...settings, angle: parseFloat(e.target.value) * (Math.PI / 180) })}
              className="w-full" list="angleSteps"
            />
            <datalist id="angleSteps">
              {[...Array(36)].map((_, i) => <option key={i} value={i * 10}></option>)}
            </datalist>
          </div>
<div className="control-group text-xs">
  <label className="block mb-2 text-xs">Vertical Offset (px)</label>
  <input
    type="range"
    min={-300}
    max={300}
    step={1}
    value={settings.yOffsetPx ?? 0}
    onChange={(e) => setSettings({ ...settings, yOffsetPx: parseInt(e.target.value, 10) })}
    className="w-full"
    list="yOffsetSteps"
  />
  <datalist id="yOffsetSteps">
    {[-300,-200,-100,0,100,200,300].map(v => <option key={v} value={v}></option>)}
  </datalist>
</div>

<div className="flex items-center gap-2 text-xs">
  <input
    id="fitHeight"
    type="checkbox"
    checked={!!settings.fitHeight}
    onChange={(e) => setSettings({ ...settings, fitHeight: e.target.checked })}
  />
  <label htmlFor="fitHeight">Fit height (auto amplitude)</label>
</div>
          {/* Amplitude */}
          <div className="control-group text-xs">
            <Slider
              label="Amplitude" min={10} max={600} step={1}
              value={settings.amplitude}
              onChange={(NV) => setSettings((OV) => ({ ...OV, amplitude: NV }))}
            />
          </div>

          {/* Frequency */}
          <div className="control-group text-xs">
            <label className="block mb-2 text-xs">Frequency:</label>
            <input
              type="range" min="1" max="300" step="1"
              value={settings.frequency}
              onChange={(e) => setSettings({ ...settings, frequency: parseFloat(e.target.value) })}
              className="w-full" list="frequencySteps"
            />
            <datalist id="frequencySteps">
              {[...Array(30)].map((_, i) => <option key={i} value={i * 10}></option>)}
            </datalist>
          </div>

          {/* Speed */}
          <div className="control-group text-xs">
            <Slider
              label="Speed" min={1} max={10} step={1}
              value={settings.speed}
              onChange={(NV) => setSettings((OV) => ({ ...OV, speed: NV }))}
            />
          </div>

          {/* Line thickness */}
          <div className="control-group text-xs">
            <label className="block mb-2 text-xs">Line Thickness:</label>
            <input
              type="range" min="1" max="10" step="1"
              value={settings.thickness}
              onChange={(e) => setSettings({ ...settings, thickness: parseFloat(e.target.value) })}
              className="w-full" list="thicknessSteps"
            />
            <datalist id="thicknessSteps">
              {[...Array(10)].map((_, i) => <option key={i} value={i + 1}></option>)}
            </datalist>
          </div>

          {/* Phase offset (degrees input, stored as radians) */}
          <div className="control-group text-xs">
            <label className="block mb-2 text-xs">Phase Offset:</label>
            <input
              type="range" min="0" max="360" step="1"
              value={settings.phaseOffset * (180 / Math.PI)}
              onChange={(e) =>
                setSettings({ ...settings, phaseOffset: (parseFloat(e.target.value) / 360) * (2 * Math.PI) })
              }
              className="w-full" list="phaseOffsetSteps"
            />
            <datalist id="phaseOffsetSteps">
              {[...Array(36)].map((_, i) => <option key={i} value={i * 10}></option>)}
            </datalist>
          </div>

          {/* Counts and distances */}
          <div className="control-group text-xs">
            <label className="block mb-2 text-xs">Number of Lines:</label>
            <input
              type="range" min="1" max="100" step="1"
              value={settings.numLines}
              onChange={(e) => setSettings({ ...settings, numLines: parseInt(e.target.value, 10) })}
              className="w-full" list="numLinesSteps"
            />
            <datalist id="numLinesSteps">
              {[...Array(10)].map((_, i) => <option key={i} value={i * 10}></option>)}
            </datalist>
          </div>

          <div className="control-group text-xs">
            <label className="block mb-2 text-xs">Distance Between Lines:</label>
            <input
              type="range" min="1" max="200" step="1"
              value={settings.distance}
              onChange={(e) => setSettings({ ...settings, distance: parseFloat(e.target.value) })}
              className="w-full" list="distanceSteps"
            />
            <datalist id="distanceSteps">
              {[...Array(20)].map((_, i) => <option key={i} value={i * 10}></option>)}
            </datalist>
          </div>

          <div className="control-group text-xs">
            <label className="block mb-2 text-xs">Number of Groups:</label>
            <input
              type="range" min="1" max="10" step="1"
              value={settings.groups}
              onChange={(e) => setSettings({ ...settings, groups: parseInt(e.target.value, 10) })}
              className="w-full" list="groupsSteps"
            />
            <datalist id="groupsSteps">
              {[...Array(10)].map((_, i) => <option key={i} value={i + 1}></option>)}
            </datalist>
          </div>

          <div className="control-group text-xs">
            <label className="block mb-2 text-xs">Distance between Groups:</label>
            <input
              type="range" min="0" max="1000" step="1"
              value={settings.groupDistance}
              onChange={(e) => setSettings({ ...settings, groupDistance: parseFloat(e.target.value) })}
              className="w-full" list="groupDistanceSteps"
            />
            <datalist id="groupDistanceSteps">
              {[...Array(100)].map((_, i) => <option key={i} value={i * 10}></option>)}
            </datalist>
          </div>

          {/* Colors & palette */}
          <div className="control-group text-xs">
            <label className="block mb-2 text-xs">Background Color:</label>
            <input
              type="color" value={settings.bgColor}
              onChange={(e) => setSettings({ ...settings, bgColor: e.target.value })}
              className="w-full"
            />
          </div>

          {/* ✅ Background Opacity */}
          <div className="control-group text-xs">
            <label className="block mb-1">Background Opacity: {Math.round((bgOpacity) * 100)}%</label>
            <input
              type="range" min={0} max={100} step={1}
              value={Math.round(bgOpacity * 100)}
              onChange={(e) => setSettings({ ...settings, bgOpacity: Number(e.target.value) / 100 })}
              className="w-full"
            />
          </div>

          <div className="control-group text-xs">
            <label className="block mb-2 text-xs">Line Color:</label>
            <input
              type="color" value={settings.lineColor}
              onChange={(e) => setSettings({ ...settings, lineColor: e.target.value })}
              className="w-full"
            />
          </div>

          {/* ✅ Line Opacity + Mode */}
          <div className="control-group text-xs">
            <label className="block mb-1">Line Opacity: {Math.round((lineOpacity) * 100)}%</label>
            <input
              type="range" min={0} max={100} step={1}
              value={Math.round(lineOpacity * 100)}
              onChange={(e) => setSettings({ ...settings, lineOpacity: Number(e.target.value) / 100 })}
              className="w-full"
            />
          </div>

          <div className="control-group text-xs">
            <label className="block mb-1">Opacity Mode</label>
            <select
              value={opacityMode}
              onChange={(e) => setSettings({ ...settings, opacityMode: e.target.value as any })}
              className="border p-2 rounded w-full"
            >
              <option value="constant">Constant</option>
              <option value="pulse">Pulse</option>
            </select>
          </div>

          {opacityMode === 'pulse' && (
            <div className="control-group text-xs">
              <label className="block mb-1">Opacity Speed</label>
              <input
                type="range" min={0} max={5} step={0.1}
                value={opacitySpeed}
                onChange={(e) => setSettings({ ...settings, opacitySpeed: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>
          )}

          <div className="control-group text-xs">
            <label className="block mb-2 text-xs">Use Palette:</label>
            <select
              value={settings.selectedPalette}
              onChange={(e) => setSettings({ ...settings, selectedPalette: e.target.value as any })}
              className="border p-2 rounded w-full"
            >
              <option value="none">None</option>
              <option value="rainbow">Rainbow</option>
              <option value="pastel">Pastel</option>
            </select>
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

export default ControlPanel;

// // src/components/Therapy/ControlPanel.tsx (Multifunction)
// // Uses shared PresetControls + utils/presets. Keeps all   existing UI.

// import React, { useState } from 'react';
// import { Collapse } from 'react-collapse';
// import Slider from '../common/Slider';
// import PresetControls from '../common/PresetControls';
// import type { PresetModule } from '../../utils/presets';

// export interface MultifunctionSettings {
//   waveType: 'sine' | 'tan' | 'cotan' | 'sawtooth' | 'square' | 'triangle';
//   direction:
//     | 'static'
//     | 'up'
//     | 'down'
//     | 'left'
//     | 'right'
//     | 'oscillateUpDown'
//     | 'oscillateRightLeft'
//     | 'circular';
//   rotationSpeed: number;
//   rotationRadius: number;
//   oscillationRange: number;

//   angle: number;         // radians
//   amplitude: number;
//   frequency: number;
//   speed: number;

//   thickness: number;
//   phaseOffset: number;   // radians
//   numLines: number;
//   distance: number;
//   groups: number;
//   groupDistance: number;

//   bgColor: string;
//   lineColor: string;
//   selectedPalette: 'none' | 'rainbow' | 'pastel';
// }

// interface ControlPanelProps {
//   settings: MultifunctionSettings;
//   setSettings: React.Dispatch<React.SetStateAction<MultifunctionSettings>>;
//   startAnimation: () => void;
//   stopAnimation: () => void;
//   resetAnimation: () => void;
// }

// const MODULE: PresetModule = 'multifunction';

// const WAVE_OPTS = ['sine', 'tan', 'cotan', 'sawtooth', 'square', 'triangle'] as const;
// const DIR_OPTS = [
//   'static',
//   'up',
//   'down',
//   'left',
//   'right',
//   'oscillateUpDown',
//   'oscillateRightLeft',
//   'circular',
// ] as const;
// const PALETTE_OPTS = ['none', 'rainbow', 'pastel'] as const;

// // strict merge so we don’t accidentally overwrite missing fields
// const mergeLoaded = (
//   loaded: Partial<MultifunctionSettings>,
//   curr: MultifunctionSettings
// ): MultifunctionSettings => ({
//   ...curr,

//   waveType: WAVE_OPTS.includes(loaded.waveType as any)
//     ? (loaded.waveType as any)
//     : curr.waveType,

//   direction: DIR_OPTS.includes(loaded.direction as any)
//     ? (loaded.direction as any)
//     : curr.direction,

//   rotationSpeed:
//     typeof loaded.rotationSpeed === 'number' ? loaded.rotationSpeed : curr.rotationSpeed,
//   rotationRadius:
//     typeof loaded.rotationRadius === 'number' ? loaded.rotationRadius : curr.rotationRadius,
//   oscillationRange:
//     typeof loaded.oscillationRange === 'number' ? loaded.oscillationRange : curr.oscillationRange,

//   angle: typeof loaded.angle === 'number' ? loaded.angle : curr.angle,
//   amplitude: typeof loaded.amplitude === 'number' ? loaded.amplitude : curr.amplitude,
//   frequency: typeof loaded.frequency === 'number' ? loaded.frequency : curr.frequency,
//   speed: typeof loaded.speed === 'number' ? loaded.speed : curr.speed,

//   thickness: typeof loaded.thickness === 'number' ? loaded.thickness : curr.thickness,
//   phaseOffset: typeof loaded.phaseOffset === 'number' ? loaded.phaseOffset : curr.phaseOffset,
//   numLines: typeof loaded.numLines === 'number' ? loaded.numLines : curr.numLines,
//   distance: typeof loaded.distance === 'number' ? loaded.distance : curr.distance,
//   groups: typeof loaded.groups === 'number' ? loaded.groups : curr.groups,
//   groupDistance:
//     typeof loaded.groupDistance === 'number' ? loaded.groupDistance : curr.groupDistance,

//   bgColor: typeof loaded.bgColor === 'string' ? loaded.bgColor : curr.bgColor,
//   lineColor: typeof loaded.lineColor === 'string' ? loaded.lineColor : curr.lineColor,

//   selectedPalette: PALETTE_OPTS.includes(loaded.selectedPalette as any)
//     ? (loaded.selectedPalette as any)
//     : curr.selectedPalette,
// });

// const ControlPanel: React.FC<ControlPanelProps> = ({
//   settings,
//   setSettings,
//   startAnimation,
//   stopAnimation,
//   resetAnimation,
// }) => {
//   const [isOpen, setIsOpen] = useState<boolean>(true);

//   return (
//     <div
//       className={`fixed right-4 top-2 p-4 rounded ${
//         isOpen ? 'shadow-lg bg-transparent' : ''
//       } w-60 z-50 h-full overflow-y-auto`}
//     >
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="mb-2 bg-gray-200 text-xs p-2 border rounded w-full"
//       >
//         {isOpen ? 'Collapse Controls' : 'Expand Controls'}
//       </button>

//       <Collapse isOpened={isOpen}>
//         <div className="space-y-2">
//           {/* Transport */}
//           <div className="text-xs flex space-x-2">
//             <button onClick={startAnimation} className="bg-green-500 text-xs text-white p-2 rounded w-1/3">
//               Start
//             </button>
//             <button onClick={stopAnimation} className="bg-red-500 text-xs text-white p-2 rounded w-1/3">
//               Stop
//             </button>
//             <button onClick={resetAnimation} className="bg-gray-500 text-xs text-white p-2 rounded w-1/3">
//               Reset
//             </button>
//           </div>

//           {/* Wave Type */}
//           <div className="control-group text-xs">
//             <label className="block mb-2 text-xs">Wave Type:</label>
//             <select
//               value={settings.waveType}
//               onChange={(e) => setSettings({ ...settings, waveType: e.target.value as any })}
//               className="border p-2 rounded w-full"
//             >
//               <option value="sine">Sine</option>
//               <option value="tan">Tan</option>
//               <option value="cotan">Cotan</option>
//               <option value="sawtooth">Sawtooth</option>
//               <option value="square">Square</option>
//               <option value="triangle">Triangle</option>
//             </select>
//           </div>

//           {/* Direction */}
//           <div className="control-group text-xs">
//             <label className="block mb-2 text-xs">Direction:</label>
//             <select
//               value={settings.direction}
//               onChange={(e) => setSettings({ ...settings, direction: e.target.value as any })}
//               className="border p-2 rounded w-full"
//             >
//               <option value="static">Static</option>
//               <option value="up">Up</option>
//               <option value="down">Down</option>
//               <option value="left">Left</option>
//               <option value="right">Right</option>
//               <option value="oscillateUpDown">Oscillate Up and Down</option>
//               <option value="oscillateRightLeft">Oscillate Right and Left</option>
//               <option value="circular">Circular</option>
//             </select>
//           </div>

//           {/* Circular-only controls */}
//           {settings.direction === 'circular' && (
//             <>
//               <div className="control-group text-xs">
//                 <label className="block mb-2 text-xs">Rotation Speed:</label>
//                 <input
//                   type="range"
//                   min="0.0"
//                   max="2"
//                   step="0.1"
//                   value={settings.rotationSpeed}
//                   onChange={(e) =>
//                     setSettings({ ...settings, rotationSpeed: parseFloat(e.target.value) })
//                   }
//                   className="w-full"
//                   list="rotationSpeedSteps"
//                 />
//                 <datalist id="rotationSpeedSteps">
//                   {[...Array(100)].map((_, i) => (
//                     <option key={i} value={i / 100}></option>
//                   ))}
//                 </datalist>
//               </div>
//               <div className="control-group text-xs ">
//                 <label className="block mb-2 text-xs">Rotation Radius:</label>
//                 <input
//                   type="range"
//                   min="10"
//                   max="500"
//                   value={settings.rotationRadius}
//                   onChange={(e) =>
//                     setSettings({ ...settings, rotationRadius: parseFloat(e.target.value) })
//                   }
//                   className="w-full"
//                   list="rotationRadiusSteps"
//                 />
//                 <datalist id="rotationRadiusSteps">
//                   {[...Array(50)].map((_, i) => (
//                     <option key={i} value={i * 10}></option>
//                   ))}
//                 </datalist>
//               </div>
//             </>
//           )}

//           {/* Oscillation-only control */}
//           {['oscillateUpDown', 'oscillateRightLeft'].includes(settings.direction) && (
//             <div className="control-group">
//               <label className="block mb-2 text-xs">Oscillation Range:</label>
//               <input
//                 type="range"
//                 min="10"
//                 max={Math.min(window.innerWidth, window.innerHeight)}
//                 value={settings.oscillationRange}
//                 onChange={(e) =>
//                   setSettings({ ...settings, oscillationRange: parseFloat(e.target.value) })
//                 }
//                 className="w-full"
//                 list="oscillationRangeSteps"
//               />
//               <datalist id="oscillationRangeSteps">
//                 {[...Array(10)].map((_, i) => (
//                   <option key={i} value={i * 10}></option>
//                 ))}
//               </datalist>
//             </div>
//           )}

//           {/* Angle (degrees input, stored as radians) */}
//           <div className="control-group text-xs">
//             <label className="block mb-2 text-xs">Angle:</label>
//             <input
//               type="range"
//               min="0"
//               max="360"
//               step="1"
//               value={settings.angle * (180 / Math.PI)}
//               onChange={(e) =>
//                 setSettings({
//                   ...settings,
//                   angle: parseFloat(e.target.value) * (Math.PI / 180),
//                 })
//               }
//               className="w-full"
//               list="angleSteps"
//             />
//             <datalist id="angleSteps">
//               {[...Array(36)].map((_, i) => (
//                 <option key={i} value={i * 10}></option>
//               ))}
//             </datalist>
//           </div>

//           {/* Amplitude */}
//           <div className="control-group text-xs">
//             <Slider
//               label="Amplitude"
//               min={10}
//               max={600}
//               step={1}
//               value={settings.amplitude}
//               onChange={(NV) =>
//                 setSettings((OV) => ({
//                   ...OV,
//                   amplitude: NV,
//                 }))
//               }
//             />
//           </div>

//           {/* Frequency */}
//           <div className="control-group text-xs">
//             <label className="block mb-2 text-xs">Frequency:</label>
//             <input
//               type="range"
//               min="1"
//               max="300"
//               step="1"
//               value={settings.frequency}
//               onChange={(e) =>
//                 setSettings({ ...settings, frequency: parseFloat(e.target.value) })
//               }
//               className="w-full"
//               list="frequencySteps"
//             />
//             <datalist id="frequencySteps">
//               {[...Array(30)].map((_, i) => (
//                 <option key={i} value={i * 10}></option>
//               ))}
//             </datalist>
//           </div>

//           {/* Speed */}
//           <div className="control-group text-xs">
//             <Slider
//               label="Speed"
//               min={1}
//               max={10}
//               step={1}
//               value={settings.speed}
//               onChange={(NV) =>
//                 setSettings((OV) => ({
//                   ...OV,
//                   speed: NV,
//                 }))
//               }
//             />
//           </div>

//           {/* Line thickness */}
//           <div className="control-group text-xs">
//             <label className="block mb-2 text-xs">Line Thickness:</label>
//             <input
//               type="range"
//               min="1"
//               max="10"
//               step="1"
//               value={settings.thickness}
//               onChange={(e) =>
//                 setSettings({ ...settings, thickness: parseFloat(e.target.value) })
//               }
//               className="w-full"
//               list="thicknessSteps"
//             />
//             <datalist id="thicknessSteps">
//               {[...Array(10)].map((_, i) => (
//                 <option key={i} value={i + 1}></option>
//               ))}
//             </datalist>
//           </div>

//           {/* Phase offset (degrees input, stored as radians) */}
//           <div className="control-group text-xs">
//             <label className="block mb-2 text-xs">Phase Offset:</label>
//             <input
//               type="range"
//               min="0"
//               max="360"
//               step="1"
//               value={settings.phaseOffset * (180 / Math.PI)}
//               onChange={(e) =>
//                 setSettings({
//                   ...settings,
//                   phaseOffset: (parseFloat(e.target.value) / 360) * (2 * Math.PI),
//                 })
//               }
//               className="w-full"
//               list="phaseOffsetSteps"
//             />
//             <datalist id="phaseOffsetSteps">
//               {[...Array(36)].map((_, i) => (
//                 <option key={i} value={i * 10}></option>
//               ))}
//             </datalist>
//           </div>

//           {/* Counts and distances */}
//           <div className="control-group text-xs">
//             <label className="block mb-2 text-xs">Number of Lines:</label>
//             <input
//               type="range"
//               min="1"
//               max="100"
//               step="1"
//               value={settings.numLines}
//               onChange={(e) =>
//                 setSettings({ ...settings, numLines: parseInt(e.target.value, 10) })
//               }
//               className="w-full"
//               list="numLinesSteps"
//             />
//             <datalist id="numLinesSteps">
//               {[...Array(10)].map((_, i) => (
//                 <option key={i} value={i * 10}></option>
//               ))}
//             </datalist>
//           </div>

//           <div className="control-group text-xs">
//             <label className="block mb-2 text-xs">Distance Between Lines:</label>
//             <input
//               type="range"
//               min="1"
//               max="200"
//               step="1"
//               value={settings.distance}
//               onChange={(e) =>
//                 setSettings({ ...settings, distance: parseFloat(e.target.value) })
//               }
//               className="w-full"
//               list="distanceSteps"
//             />
//             <datalist id="distanceSteps">
//               {[...Array(20)].map((_, i) => (
//                 <option key={i} value={i * 10}></option>
//               ))}
//             </datalist>
//           </div>

//           <div className="control-group text-xs">
//             <label className="block mb-2 text-xs">Number of Groups:</label>
//             <input
//               type="range"
//               min="1"
//               max="10"
//               step="1"
//               value={settings.groups}
//               onChange={(e) => setSettings({ ...settings, groups: parseInt(e.target.value, 10) })}
//               className="w-full"
//               list="groupsSteps"
//             />
//             <datalist id="groupsSteps">
//               {[...Array(10)].map((_, i) => (
//                 <option key={i} value={i + 1}></option>
//               ))}
//             </datalist>
//           </div>

//           <div className="control-group text-xs">
//             <label className="block mb-2 text-xs">Distance between Groups:</label>
//             <input
//               type="range"
//               min="0"
//               max="1000"
//               step="1"
//               value={settings.groupDistance}
//               onChange={(e) =>
//                 setSettings({ ...settings, groupDistance: parseFloat(e.target.value) })
//               }
//               className="w-full"
//               list="groupDistanceSteps"
//             />
//             <datalist id="groupDistanceSteps">
//               {[...Array(100)].map((_, i) => (
//                 <option key={i} value={i * 10}></option>
//               ))}
//             </datalist>
//           </div>

//           {/* Colors & palette */}
//           <div className="control-group text-xs">
//             <label className="block mb-2 text-xs">Background Color:</label>
//             <input
//               type="color"
//               value={settings.bgColor}
//               onChange={(e) => setSettings({ ...settings, bgColor: e.target.value })}
//               className="w-full"
//             />
//           </div>

//           <div className="control-group text-xs">
//             <label className="block mb-2 text-xs">Line Color:</label>
//             <input
//               type="color"
//               value={settings.lineColor}
//               onChange={(e) => setSettings({ ...settings, lineColor: e.target.value })}
//               className="w-full"
//             />
//           </div>

//           <div className="control-group text-xs">
//             <label className="block mb-2 text-xs">Use Palette:</label>
//             <select
//               value={settings.selectedPalette}
//               onChange={(e) =>
//                 setSettings({ ...settings, selectedPalette: e.target.value as any })
//               }
//               className="border p-2 rounded w-full"
//             >
//               <option value="none">None</option>
//               <option value="rainbow">Rainbow</option>
//               <option value="pastel">Pastel</option>
//             </select>
//           </div>

//           <hr className="my-2" />

//           {/* Reusable preset block (Save/Load UI + Firebase writes) */}
//           <PresetControls
//             module={MODULE}
//             settings={settings}
//             setSettings={setSettings}
//             mergeLoaded={mergeLoaded}
//             className="bg-transparent"
//           />
//         </div>
//       </Collapse>
//     </div>
//   );
// };

// export default ControlPanel;

// src/components/Therapy/ControlPanel.tsx
// worked but the preset and load are inside 

// import React, { useState, useEffect } from 'react';
// import { Collapse } from 'react-collapse';
// import { db, storage } from '../../firebase/firebase';
// import { useAuth } from '../../data/AuthContext';
// import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
// import { ref, uploadBytes } from 'firebase/storage';
// import Papa from 'papaparse';
// import Slider  from '../common/Slider';
// interface ControlPanelProps {
//   settings: any; // Replace with an explicit interface for settings if available
//   setSettings: React.Dispatch<React.SetStateAction<any>>; // Replace `any` with your settings type
//   startAnimation: () => void;
//   stopAnimation: () => void;
//   resetAnimation: () => void;
// }

// const ControlPanel: React.FC<ControlPanelProps> = ({
//   settings,
//   setSettings,
//   startAnimation,
//   stopAnimation,
//   resetAnimation,
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

// /*     try {
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
//     <div className={`fixed right-4 top-2 p-4 rounded ${isOpen ? 'shadow-lg bg-transparent' : ''} w-60 z-50 h-full overflow-y-auto`}>
//     <button onClick={() => setIsOpen(!isOpen)} className="mb-2 bg-gray-200 text-xs p-2 border p-2 rounded w-full ">
//         {isOpen ? 'Collapse Controls' : 'Expand Controls'}
//       </button>
//       <Collapse isOpened={isOpen}>
//         <div className="space-y-2">
//           <div className="text-xs flex space-x-2">
//             <button onClick={startAnimation} className="bg-green-500 text-xs text-white p-2 rounded w-1/3">Start</button>
//             <button onClick={stopAnimation} className="bg-red-500 text-xs text-white p-2 rounded w-1/3">Stop</button>
//             <button onClick={resetAnimation} className="bg-gray-500 text-xs text-white p-2 rounded w-1/3">Reset</button>
//           </div>
//           <div className="text-xs flex space-x-2">
//             <input
//               type="text"
//               placeholder="Preset Name"
//               value={presetName}
//               onChange={(e) => setPresetName(e.target.value)}
//               className="border p-2 rounded w-full"
//             />
//           </div>
//          {/*  <div className="flex space-x-2">
//             <button onClick={saveCurrentSettings} className="bg-blue-500 text-white p-2 rounded w-1/2">Save Current</button>
//             <button onClick={loadCurrentSettings} className="bg-yellow-500 text-white p-2 rounded w-1/2">Load Current</button>
//           </div> */}
//           <div className="text-xs flex space-x-2">
//             <button onClick={savePresetSettings} className="bg-blue-500  text-xs text-white p-2 rounded w-1/2">Save Preset</button>
//             <button onClick={loadPresetSettings} className="bg-yellow-500 text-xs text-white p-2 rounded w-1/2">Load Preset</button>
//           </div>
//           <div className=" text-xs flex space-x-2">
//             <select onChange={(e) => setPresetName(e.target.value)} value={presetName} className="border p-2 rounded w-full text-xs">
//               <option value="">Select Preset</option>
//               {presetList.map((preset, index) => (
//                 <option key={index} value={preset}>{preset}</option>
//               ))}
//             </select>
//           </div>
//           {message.message && (
//             <div className={`alert ${message.type === 'error' ? 'bg-red-500' : 'bg-green-500'} text-xs text-white p-2 rounded`}>
//               {message.message}
//             </div>
//           )}
          
       
//           <div className="control-group text-xs">
//             <label className="block mb-2 text-xs">Wave Type:</label>
//             <select value={settings.waveType} onChange={(e) => setSettings({ ...settings, waveType: e.target.value })} className="border p-2 rounded w-full">
//               <option value="sine">Sine</option>
//               <option value="tan">Tan</option>
//               <option value="cotan">Cotan</option>
//               <option value="sawtooth">Sawtooth</option>
//               <option value="square">Square</option>
//               <option value="triangle">Triangle</option>
//             </select>
//           </div>

//           <div className="control-group text-xs">
//             <label className="block mb-2 text-xs">Direction:</label>
//             <select value={settings.direction} onChange={(e) => setSettings({ ...settings, direction: e.target.value })} className="border p-2 rounded w-full">
//               <option value="static">Static</option>
//               <option value="up">Up</option>
//               <option value="down">Down</option>
//               <option value="left">Left</option>
//               <option value="right">Right</option>
//               <option value="oscillateUpDown">Oscillate Up and Down</option>
//               <option value="oscillateRightLeft">Oscillate Right and Left</option>
//               <option value="circular">Circular</option>
//             </select>
//           </div>

//           {settings.direction === 'circular' && (
//             <>
//               <div className="control-group text-xs">
//                 <label className="block mb-2 text-xs">Rotation Speed:</label>
//                 <input type="range" min="0.0" max="2" step="0.1" value={settings.rotationSpeed} onChange={(e) => setSettings({ ...settings, rotationSpeed: parseFloat(e.target.value) })} className="w-full" list="rotationSpeedSteps" />
//                 <datalist id="rotationSpeedSteps">
//                   {[...Array(100)].map((_, i) => <option key={i} value={i / 100}></option>)}
//                 </datalist>
//               </div>
//               <div className="control-group text-xs ">
//                 <label className="block mb-2 text-xs">Rotation Radius:</label>
//                 <input type="range" min="10" max="500" value={settings.rotationRadius} onChange={(e) => setSettings({ ...settings, rotationRadius: parseFloat(e.target.value) })} className="w-full" list="rotationRadiusSteps" />
//                 <datalist id="rotationRadiusSteps">
//                   {[...Array(50)].map((_, i) => <option key={i} value={i * 10}></option>)}
//                 </datalist>
//               </div>
//             </>
//           )}
//           {['oscillateUpDown', 'oscillateRightLeft'].includes(settings.direction) && (
//             <div className="control-group">
//               <label className="block mb-2 text-xs">Oscillation Range:</label>
//               <input type="range" min="10" max={Math.min(window.innerWidth, window.innerHeight)} value={settings.oscillationRange} onChange={(e) => setSettings({ ...settings, oscillationRange: parseFloat(e.target.value) })} className="w-full" list="oscillationRangeSteps" />
//               <datalist id="oscillationRangeSteps">
//                 {[...Array(10)].map((_, i) => <option key={i} value={i * 10}></option>)}
//               </datalist>
//             </div>
//           )}

//           <div className="control-group text-xs">
//             <label className="block mb-2 text-xs">Angle:</label>
//             <input type="range" min="0" max="360" value={settings.angle * (180 / Math.PI)} step="1" onChange={(e) => setSettings({ ...settings, angle: parseFloat(e.target.value) * (Math.PI / 180) })} className="w-full" list="angleSteps" />
//             <datalist id="angleSteps">
//               {[...Array(36)].map((_, i) => <option key={i} value={i * 10}></option>)}
//             </datalist>
//           </div>
//           <div className="control-group text-xs">
//            {/*  <label className="block mb-2 text-xs">Amplitude:</label>
//             <input type="range" max="360" min="0" step="1" value={settings.amplitude} onChange={(e) => setSettings({ ...settings, amplitude: parseFloat(e.target.value) })} className="w-full" list="amplitudeSteps" />
//             <datalist id="amplitudeSteps">
//               {[...Array(36)].map((_, i) => <option key={i} value={i * 10}></option>)}
//             </datalist> */}
//             <Slider
//   label="Amplitude"
//   min={0}
//   max={360}
//   step={1}
//   value={settings.amplitude}
//   onChange={(NV) =>//newvalue
//     setSettings((OV) => ({//oldvalue
//       ...OV,
//       amplitude: NV,
//     }))
//   }
// />
//           </div>
//           <div className="control-group text-xs">
//             <label className="block mb-2 text-xs">Frequency:</label>
//             <input type="range" min="1" max="300" value={settings.frequency} step="1" onChange={(e) => setSettings({ ...settings, frequency: parseFloat(e.target.value) })} className="w-full" list="frequencySteps" />
//             <datalist id="frequencySteps">
//               {[...Array(30)].map((_, i) => <option key={i} value={i * 10}></option>)}
//             </datalist>
//           </div>
//           <div className="control-group text-xs">
//           {/*   <label className="block mb-2 text-xs">Speed:</label>
//             <input type="range" min="1" max="100" value={settings.speed * 100} step="1" onChange={(e) => setSettings({ ...settings, speed: parseFloat(e.target.value) / 100 })} className="w-full" list="speedSteps" />
//             <datalist id="speedSteps">
//               {[...Array(10)].map((_, i) => <option key={i} value={i * 10}></option>)}
//             </datalist> */}


// <Slider
//   label="Speed"
//   min={1}
//   max={10}
//   step={1}
//   value={settings.speed}
//   onChange={(NV) =>
//     setSettings((OV) => ({
//       ...OV,
//       speed: NV,
//     }))
//   }
// />



  
//           </div>
//           <div className="control-group text-xs">
//             <label className="block mb-2 text-xs">Line Thickness:</label>
//             <input type="range" min="1" max="10" value={settings.thickness} step="1" onChange={(e) => setSettings({ ...settings, thickness: parseFloat(e.target.value) })} className="w-full" list="thicknessSteps" />
//             <datalist id="thicknessSteps">
//               {[...Array(10)].map((_, i) => <option key={i} value={i + 1}></option>)}
//             </datalist>
//           </div>
//           <div className="control-group text-xs">
//             <label className="block mb-2 text-xs">Phase Offset:</label>
//             <input type="range" min="0" max="360" value={settings.phaseOffset * (180 / Math.PI)} step="1" onChange={(e) => setSettings({ ...settings, phaseOffset: (parseFloat(e.target.value) / 360) * (2 * Math.PI) })} className="w-full" list="phaseOffsetSteps" />
//             <datalist id="phaseOffsetSteps">
//               {[...Array(36)].map((_, i) => <option key={i} value={i * 10}></option>)}
//             </datalist>
//           </div>
//           <div className="control-group text-xs">
//             <label className="block mb-2 text-xs">Number of Lines:</label>
//             <input type="range" min="1" max="100" value={settings.numLines} step="1" onChange={(e) => setSettings({ ...settings, numLines: parseInt(e.target.value, 10) })} className="w-full" list="numLinesSteps" />
//             <datalist id="numLinesSteps">
//               {[...Array(10)].map((_, i) => <option key={i} value={i * 10}></option>)}
//             </datalist>
//           </div>
//           <div className="control-group text-xs">
//             <label className="block mb-2 text-xs">Distance Between Lines:</label>
//             <input type="range" min="1" max="200" value={settings.distance} step="1" onChange={(e) => setSettings({ ...settings, distance: parseFloat(e.target.value) })} className="w-full" list="distanceSteps" />
//             <datalist id="distanceSteps">
//               {[...Array(20)].map((_, i) => <option key={i} value={i * 10}></option>)}
//             </datalist>
//           </div>
//           <div className="control-group text-xs">
//             <label className="block mb-2 text-xs">Number of Groups:</label>
//             <input type="range" min="1" max="10" value={settings.groups} step="1" onChange={(e) => setSettings({ ...settings, groups: parseInt(e.target.value, 10) })} className="w-full" list="groupsSteps" />
//             <datalist id="groupsSteps">
//               {[...Array(10)].map((_, i) => <option key={i} value={i + 1}></option>)}
//             </datalist>
//           </div>
//           <div className="control-group text-xs">
//             <label className="block mb-2 text-xs">Distance between Groups:</label>
//             <input type="range" min="0" max="1000" value={settings.groupDistance} step="1" onChange={(e) => setSettings({ ...settings, groupDistance: parseFloat(e.target.value) })} className="w-full" list="groupDistanceSteps" />
//             <datalist id="groupDistanceSteps">
//               {[...Array(100)].map((_, i) => <option key={i} value={i * 10}></option>)}
//             </datalist>
//           </div>
//           <div className="control-group text-xs">
//             <label className="block mb-2 text-xs">Background Color:</label>
//             <input type="color" value={settings.bgColor} onChange={(e) => setSettings({ ...settings, bgColor: e.target.value })} className="w-full" />
//           </div>
//           <div className="control-group text-xs">
//             <label className="block mb-2 text-xs">Line Color:</label>
//             <input type="color" value={settings.lineColor} onChange={(e) => setSettings({ ...settings, lineColor: e.target.value })} className="w-full" />
//           </div>
//           <div className="control-group text-xs">
//             <label className="block mb-2 text-xs">Use Palette:</label>
//             <select value={settings.selectedPalette} onChange={(e) => setSettings({ ...settings, selectedPalette: e.target.value })} className="border p-2 rounded w-full">
//               <option value="none">None</option>
//               <option value="rainbow">Rainbow</option>
//               <option value="pastel">Pastel</option>
//             </select>
//           </div>
//         </div>
//       </Collapse>
//     </div>
//   );
// };

// export default ControlPanel;


// // src/components/Therapy/ControlPanel.tsx
//last working TS . not using sliders but regular minimal controllers
// import React, { useState, useEffect } from 'react';
// import { Collapse } from 'react-collapse';
// import { db, storage } from '../../firebase/firebase';
// import { useAuth } from '../../data/AuthContext';
// import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
// import { ref, uploadBytes } from 'firebase/storage';
// import Papa from 'papaparse';
// import Slider  from '../common/Slider';
// interface ControlPanelProps {
//   settings: any; // Replace with an explicit interface for settings if available
//   setSettings: React.Dispatch<React.SetStateAction<any>>; // Replace `any` with your settings type
//   startAnimation: () => void;
//   stopAnimation: () => void;
//   resetAnimation: () => void;
// }

// const ControlPanel: React.FC<ControlPanelProps> = ({
//   settings,
//   setSettings,
//   startAnimation,
//   stopAnimation,
//   resetAnimation,
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

// /*     try {
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
//     <div className={`fixed right-4 top-2 p-4 rounded ${isOpen ? 'shadow-lg bg-transparent' : ''} w-60 z-50 h-full overflow-y-auto`}>
//     <button onClick={() => setIsOpen(!isOpen)} className="mb-2 bg-gray-200 text-xs p-2 border p-2 rounded w-full ">
//         {isOpen ? 'Collapse Controls' : 'Expand Controls'}
//       </button>
//       <Collapse isOpened={isOpen}>
//         <div className="space-y-2">
//           <div className="text-xs flex space-x-2">
//             <button onClick={startAnimation} className="bg-green-500 text-xs text-white p-2 rounded w-1/3">Start</button>
//             <button onClick={stopAnimation} className="bg-red-500 text-xs text-white p-2 rounded w-1/3">Stop</button>
//             <button onClick={resetAnimation} className="bg-gray-500 text-xs text-white p-2 rounded w-1/3">Reset</button>
//           </div>
//           <div className="text-xs flex space-x-2">
//             <input
//               type="text"
//               placeholder="Preset Name"
//               value={presetName}
//               onChange={(e) => setPresetName(e.target.value)}
//               className="border p-2 rounded w-full"
//             />
//           </div>
//          {/*  <div className="flex space-x-2">
//             <button onClick={saveCurrentSettings} className="bg-blue-500 text-white p-2 rounded w-1/2">Save Current</button>
//             <button onClick={loadCurrentSettings} className="bg-yellow-500 text-white p-2 rounded w-1/2">Load Current</button>
//           </div> */}
//           <div className="text-xs flex space-x-2">
//             <button onClick={savePresetSettings} className="bg-blue-500  text-xs text-white p-2 rounded w-1/2">Save Preset</button>
//             <button onClick={loadPresetSettings} className="bg-yellow-500 text-xs text-white p-2 rounded w-1/2">Load Preset</button>
//           </div>
//           <div className=" text-xs flex space-x-2">
//             <select onChange={(e) => setPresetName(e.target.value)} value={presetName} className="border p-2 rounded w-full text-xs">
//               <option value="">Select Preset</option>
//               {presetList.map((preset, index) => (
//                 <option key={index} value={preset}>{preset}</option>
//               ))}
//             </select>
//           </div>
//           {message.message && (
//             <div className={`alert ${message.type === 'error' ? 'bg-red-500' : 'bg-green-500'} text-xs text-white p-2 rounded`}>
//               {message.message}
//             </div>
//           )}
          
       
//           <div className="control-group text-xs">
//             <label className="block mb-2 text-xs">Wave Type:</label>
//             <select value={settings.waveType} onChange={(e) => setSettings({ ...settings, waveType: e.target.value })} className="border p-2 rounded w-full">
//               <option value="sine">Sine</option>
//               <option value="tan">Tan</option>
//               <option value="cotan">Cotan</option>
//               <option value="sawtooth">Sawtooth</option>
//               <option value="square">Square</option>
//               <option value="triangle">Triangle</option>
//             </select>
//           </div>

//           <div className="control-group text-xs">
//             <label className="block mb-2 text-xs">Direction:</label>
//             <select value={settings.direction} onChange={(e) => setSettings({ ...settings, direction: e.target.value })} className="border p-2 rounded w-full">
//               <option value="static">Static</option>
//               <option value="up">Up</option>
//               <option value="down">Down</option>
//               <option value="left">Left</option>
//               <option value="right">Right</option>
//               <option value="oscillateUpDown">Oscillate Up and Down</option>
//               <option value="oscillateRightLeft">Oscillate Right and Left</option>
//               <option value="circular">Circular</option>
//             </select>
//           </div>

//           {settings.direction === 'circular' && (
//             <>
//               <div className="control-group text-xs">
//                 <label className="block mb-2 text-xs">Rotation Speed:</label>
//                 <input type="range" min="0.0" max="2" step="0.1" value={settings.rotationSpeed} onChange={(e) => setSettings({ ...settings, rotationSpeed: parseFloat(e.target.value) })} className="w-full" list="rotationSpeedSteps" />
//                 <datalist id="rotationSpeedSteps">
//                   {[...Array(100)].map((_, i) => <option key={i} value={i / 100}></option>)}
//                 </datalist>
//               </div>
//               <div className="control-group text-xs ">
//                 <label className="block mb-2 text-xs">Rotation Radius:</label>
//                 <input type="range" min="10" max="500" value={settings.rotationRadius} onChange={(e) => setSettings({ ...settings, rotationRadius: parseFloat(e.target.value) })} className="w-full" list="rotationRadiusSteps" />
//                 <datalist id="rotationRadiusSteps">
//                   {[...Array(50)].map((_, i) => <option key={i} value={i * 10}></option>)}
//                 </datalist>
//               </div>
//             </>
//           )}
//           {['oscillateUpDown', 'oscillateRightLeft'].includes(settings.direction) && (
//             <div className="control-group">
//               <label className="block mb-2 text-xs">Oscillation Range:</label>
//               <input type="range" min="10" max={Math.min(window.innerWidth, window.innerHeight)} value={settings.oscillationRange} onChange={(e) => setSettings({ ...settings, oscillationRange: parseFloat(e.target.value) })} className="w-full" list="oscillationRangeSteps" />
//               <datalist id="oscillationRangeSteps">
//                 {[...Array(10)].map((_, i) => <option key={i} value={i * 10}></option>)}
//               </datalist>
//             </div>
//           )}

//           <div className="control-group text-xs">
//             <label className="block mb-2 text-xs">Angle:</label>
//             <input type="range" min="0" max="360" value={settings.angle * (180 / Math.PI)} step="1" onChange={(e) => setSettings({ ...settings, angle: parseFloat(e.target.value) * (Math.PI / 180) })} className="w-full" list="angleSteps" />
//             <datalist id="angleSteps">
//               {[...Array(36)].map((_, i) => <option key={i} value={i * 10}></option>)}
//             </datalist>
//           </div>
//           <div className="control-group text-xs">
//             <label className="block mb-2 text-xs">Amplitude:</label>
//             <input type="range" max="360" min="0" step="1" value={settings.amplitude} onChange={(e) => setSettings({ ...settings, amplitude: parseFloat(e.target.value) })} className="w-full" list="amplitudeSteps" />
//             <datalist id="amplitudeSteps">
//               {[...Array(36)].map((_, i) => <option key={i} value={i * 10}></option>)}
//             </datalist>
//           </div>
//           <div className="control-group text-xs">
//             <label className="block mb-2 text-xs">Frequency:</label>
//             <input type="range" min="1" max="300" value={settings.frequency} step="1" onChange={(e) => setSettings({ ...settings, frequency: parseFloat(e.target.value) })} className="w-full" list="frequencySteps" />
//             <datalist id="frequencySteps">
//               {[...Array(30)].map((_, i) => <option key={i} value={i * 10}></option>)}
//             </datalist>
//           </div>
//           <div className="control-group text-xs">
//             <label className="block mb-2 text-xs">Speed:</label>
//             <input type="range" min="1" max="100" value={settings.speed * 100} step="1" onChange={(e) => setSettings({ ...settings, speed: parseFloat(e.target.value) / 100 })} className="w-full" list="speedSteps" />
//             <datalist id="speedSteps">
//               {[...Array(10)].map((_, i) => <option key={i} value={i * 10}></option>)}
//             </datalist>

//             <Slider
//       label="Speed"
//       min={1}
//       max={20}
//       step={1}
//       value={settings.speed}
//       onChange={(newSpeed) =>
//         setSettings((s) => ({ ...s, speed: newSpeed }))
//       }
//       majorStep={5}    // major ticks every 5 units
//     />
  
//           </div>
//           <div className="control-group text-xs">
//             <label className="block mb-2 text-xs">Line Thickness:</label>
//             <input type="range" min="1" max="10" value={settings.thickness} step="1" onChange={(e) => setSettings({ ...settings, thickness: parseFloat(e.target.value) })} className="w-full" list="thicknessSteps" />
//             <datalist id="thicknessSteps">
//               {[...Array(10)].map((_, i) => <option key={i} value={i + 1}></option>)}
//             </datalist>
//           </div>
//           <div className="control-group text-xs">
//             <label className="block mb-2 text-xs">Phase Offset:</label>
//             <input type="range" min="0" max="360" value={settings.phaseOffset * (180 / Math.PI)} step="1" onChange={(e) => setSettings({ ...settings, phaseOffset: (parseFloat(e.target.value) / 360) * (2 * Math.PI) })} className="w-full" list="phaseOffsetSteps" />
//             <datalist id="phaseOffsetSteps">
//               {[...Array(36)].map((_, i) => <option key={i} value={i * 10}></option>)}
//             </datalist>
//           </div>
//           <div className="control-group text-xs">
//             <label className="block mb-2 text-xs">Number of Lines:</label>
//             <input type="range" min="1" max="100" value={settings.numLines} step="1" onChange={(e) => setSettings({ ...settings, numLines: parseInt(e.target.value, 10) })} className="w-full" list="numLinesSteps" />
//             <datalist id="numLinesSteps">
//               {[...Array(10)].map((_, i) => <option key={i} value={i * 10}></option>)}
//             </datalist>
//           </div>
//           <div className="control-group text-xs">
//             <label className="block mb-2 text-xs">Distance Between Lines:</label>
//             <input type="range" min="1" max="200" value={settings.distance} step="1" onChange={(e) => setSettings({ ...settings, distance: parseFloat(e.target.value) })} className="w-full" list="distanceSteps" />
//             <datalist id="distanceSteps">
//               {[...Array(20)].map((_, i) => <option key={i} value={i * 10}></option>)}
//             </datalist>
//           </div>
//           <div className="control-group text-xs">
//             <label className="block mb-2 text-xs">Number of Groups:</label>
//             <input type="range" min="1" max="10" value={settings.groups} step="1" onChange={(e) => setSettings({ ...settings, groups: parseInt(e.target.value, 10) })} className="w-full" list="groupsSteps" />
//             <datalist id="groupsSteps">
//               {[...Array(10)].map((_, i) => <option key={i} value={i + 1}></option>)}
//             </datalist>
//           </div>
//           <div className="control-group text-xs">
//             <label className="block mb-2 text-xs">Distance between Groups:</label>
//             <input type="range" min="0" max="1000" value={settings.groupDistance} step="1" onChange={(e) => setSettings({ ...settings, groupDistance: parseFloat(e.target.value) })} className="w-full" list="groupDistanceSteps" />
//             <datalist id="groupDistanceSteps">
//               {[...Array(100)].map((_, i) => <option key={i} value={i * 10}></option>)}
//             </datalist>
//           </div>
//           <div className="control-group text-xs">
//             <label className="block mb-2 text-xs">Background Color:</label>
//             <input type="color" value={settings.bgColor} onChange={(e) => setSettings({ ...settings, bgColor: e.target.value })} className="w-full" />
//           </div>
//           <div className="control-group text-xs">
//             <label className="block mb-2 text-xs">Line Color:</label>
//             <input type="color" value={settings.lineColor} onChange={(e) => setSettings({ ...settings, lineColor: e.target.value })} className="w-full" />
//           </div>
//           <div className="control-group text-xs">
//             <label className="block mb-2 text-xs">Use Palette:</label>
//             <select value={settings.selectedPalette} onChange={(e) => setSettings({ ...settings, selectedPalette: e.target.value })} className="border p-2 rounded w-full">
//               <option value="none">None</option>
//               <option value="rainbow">Rainbow</option>
//               <option value="pastel">Pastel</option>
//             </select>
//           </div>
//         </div>
//       </Collapse>
//     </div>
//   );
// };

// export default ControlPanel;




//+++++++++++JS version+++++++++++++++++
 
 // src/components/Therapy/ControlPanel.jsx
  // JS version
 
 
/*  import React, { useState, useEffect } from 'react';
import { Collapse } from 'react-collapse';
import { db, storage } from '../../firebase/firebase';
import { useAuth } from '../../data/AuthContext';
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';
import Papa from 'papaparse';
import Slider from '../common/Slider'; // Import the reusable Slider component

const ControlPanel = ({
  settings, setSettings,
  startAnimation, stopAnimation, resetAnimation
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const { currentUser } = useAuth();
  const [presetName, setPresetName] = useState('');
  const [presetList, setPresetList] = useState([]);
  const [message, setMessage] = useState({ message: '', type: '' });
  useEffect(() => {
    const fetchPresets = async () => {
      try {
        const userDocsRef = collection(db, `users/${currentUser.uid}/animation-settings`);
        const querySnapshot = await getDocs(userDocsRef);
        const presets = querySnapshot.docs.map(doc => doc.id);
        setPresetList(presets);
      } catch (err) {
        console.error('Error fetching preset names:', err);
      }
    };

    fetchPresets();
  }, [currentUser]);

  // Save current settings to Firestore
  const saveCurrentSettings = async () => {
    const timestamp = new Date();
    const localDateTime = timestamp.toLocaleString();
    const settingsWithTimestamp = {
      ...settings,
      userId: currentUser.uid,
      timestamp: timestamp.toISOString(),
      localDateTime
    };

    try {
      const userDocRef = doc(db, `users/${currentUser.uid}/animation-settings/current`);
      await setDoc(userDocRef, settingsWithTimestamp);

      const csvData = Object.keys(settingsWithTimestamp).map(key => ({
        setting: key,
        value: settingsWithTimestamp[key]
      }));
      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

      const csvRef = ref(storage, `users/${currentUser.uid}/animation-settings/current.csv`);
      await uploadBytes(csvRef, blob);

      setMessage({ message: 'Current settings saved successfully!', type: 'success' });
    } catch (err) {
      console.error('Error saving current settings:', err);
      setMessage({ message: 'Error saving current settings. Please try again.', type: 'error' });
    }
  };

  // Save settings as preset to Firestore
  const savePresetSettings = async () => {
    if (!presetName) {
      setMessage({ message: 'Please provide a name for the preset.', type: 'error' });
      return;
    }

    const timestamp = new Date();
    const localDateTime = timestamp.toLocaleString();
    const settingsWithTimestamp = {
      ...settings,
      presetName,
      userId: currentUser.uid,
      timestamp: timestamp.toISOString(),
      localDateTime
    };

    try {
      const userDocRef = doc(db, `users/${currentUser.uid}/animation-settings/${presetName}`);
      await setDoc(userDocRef, settingsWithTimestamp);

      const csvData = Object.keys(settingsWithTimestamp).map(key => ({
        setting: key,
        value: settingsWithTimestamp[key]
      }));
      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

      const csvRef = ref(storage, `users/${currentUser.uid}/animation-settings/${presetName}.csv`);
      await uploadBytes(csvRef, blob);

      setMessage({ message: 'Preset settings saved successfully!', type: 'success' });
      if (!presetList.includes(presetName)) {
        setPresetList([...presetList, presetName]);
      }
    } catch (err) {
      console.error('Error saving preset settings:', err);
      setMessage({ message: 'Error saving preset settings. Please try again.', type: 'error' });
    }
  };

  // Load current settings from Firestore
  const loadCurrentSettings = async () => {
    try {
      const userDocRef = doc(db, `users/${currentUser.uid}/animation-settings/current`);
      const docSnapshot = await getDoc(userDocRef);

      if (docSnapshot.exists()) {
        const loadedSettings = docSnapshot.data();
        setSettings(loadedSettings);
        setMessage({ message: 'Current settings loaded successfully!', type: 'success' });
      } else {
        setMessage({ message: 'No current settings found.', type: 'error' });
      }
    } catch (err) {
      console.error('Error loading current settings:', err);
      setMessage({ message: 'Error loading current settings. Please try again.', type: 'error' });
    }
  };

  // Load preset settings from Firestore
  const loadPresetSettings = async () => {
    if (!presetName) {
      setMessage({ message: 'Please provide the name of the preset to load.', type: 'error' });
      return;
    }

    try {
      const userDocRef = doc(db, `users/${currentUser.uid}/animation-settings/${presetName}`);
      const docSnapshot = await getDoc(userDocRef);

      if (docSnapshot.exists()) {
        const loadedSettings = docSnapshot.data();
        setSettings(loadedSettings);
        setMessage({ message: 'Preset settings loaded successfully!', type: 'success' });
      } else {
        setMessage({ message: 'No settings found with that preset name.', type: 'error' });
      }
    } catch (err) {
      console.error('Error loading preset settings:', err);
      setMessage({ message: 'Error loading preset settings. Please try again.', type: 'error' });
    }
  };


  return (
    <div className={`fixed right-4 top-2 p-4 rounded ${isOpen ? 'shadow-lg bg-transparent' : ''} w-60 z-50 h-full overflow-y-auto`}>
    <button onClick={() => setIsOpen(!isOpen)} className="mb-2 bg-gray-200 p-2 border p-2 rounded w-full">
        {isOpen ? 'Collapse Controls' : 'Expand Controls'}
      </button>
      <Collapse isOpened={isOpen}>
        <div className="space-y-2">
          <div className="flex space-x-2">
            <button onClick={startAnimation} className="bg-green-500 text-white p-2 rounded w-1/3">Start</button>
            <button onClick={stopAnimation} className="bg-red-500 text-white p-2 rounded w-1/3">Stop</button>
            <button onClick={resetAnimation} className="bg-gray-500 text-white p-2 rounded w-1/3">Reset</button>
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Preset Name"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>
          <div className="flex space-x-2">
            <button onClick={saveCurrentSettings} className="bg-blue-500 text-white p-2 rounded w-1/2">Save Current</button>
            <button onClick={loadCurrentSettings} className="bg-yellow-500 text-white p-2 rounded w-1/2">Load Current</button>
          </div>
          <div className="flex space-x-2">
            <button onClick={savePresetSettings} className="bg-blue-500 text-white p-2 rounded w-1/2">Save Preset</button>
            <button onClick={loadPresetSettings} className="bg-yellow-500 text-white p-2 rounded w-1/2">Load Preset</button>
          </div>
          <div className="flex space-x-2">
            <select onChange={(e) => setPresetName(e.target.value)} value={presetName} className="border p-2 rounded w-full">
              <option value="">Select Preset</option>
              {presetList.map((preset, index) => (
                <option key={index} value={preset}>{preset}</option>
              ))}
            </select>
          </div>
          {message.message && (
            <div className={`alert ${message.type === 'error' ? 'bg-red-500' : 'bg-green-500'} text-white p-2 rounded`}>
              {message.message}
            </div>
          )}
          
       
          <div className="control-group">
            <label className="block mb-2">Wave Type:</label>
            <select value={settings.waveType} onChange={(e) => setSettings({ ...settings, waveType: e.target.value })} className="border p-2 rounded w-full">
              <option value="sine">Sine</option>
              <option value="tan">Tan</option>
              <option value="cotan">Cotan</option>
              <option value="sawtooth">Sawtooth</option>
              <option value="square">Square</option>
              <option value="triangle">Triangle</option>
            </select>
          </div>

          <div className="control-group">
            <label className="block mb-2">Direction:</label>
            <select value={settings.direction} onChange={(e) => setSettings({ ...settings, direction: e.target.value })} className="border p-2 rounded w-full">
              <option value="static">Static</option>
              <option value="up">Up</option>
              <option value="down">Down</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="oscillateUpDown">Oscillate Up and Down</option>
              <option value="oscillateRightLeft">Oscillate Right and Left</option>
              <option value="circular">Circular</option>
            </select>
          </div>

          {settings.direction === 'circular' && (
            <>
              <div className="control-group">
                <label className="block mb-2">Rotation Speed:</label>
                <input type="range" min="0.01" max="1" step="0.01" value={settings.rotationSpeed} onChange={(e) => setSettings({ ...settings, rotationSpeed: parseFloat(e.target.value) })} className="w-full" list="rotationSpeedSteps" />
                <datalist id="rotationSpeedSteps">
                  {[...Array(100)].map((_, i) => <option key={i} value={i / 100}></option>)}
                </datalist>
              </div>
              <div className="control-group">
                <label className="block mb-2">Rotation Radius:</label>
                <input type="range" min="10" max="500" value={settings.rotationRadius} onChange={(e) => setSettings({ ...settings, rotationRadius: parseFloat(e.target.value) })} className="w-full" list="rotationRadiusSteps" />
                <datalist id="rotationRadiusSteps">
                  {[...Array(50)].map((_, i) => <option key={i} value={i * 10}></option>)}
                </datalist>
              </div>
            </>
          )}
          {['oscillateUpDown', 'oscillateRightLeft'].includes(settings.direction) && (
            <div className="control-group">
              <label className="block mb-2">Oscillation Range:</label>
              <input type="range" min="10" max={Math.min(window.innerWidth, window.innerHeight)} value={settings.oscillationRange} onChange={(e) => setSettings({ ...settings, oscillationRange: parseFloat(e.target.value) })} className="w-full" list="oscillationRangeSteps" />
              <datalist id="oscillationRangeSteps">
                {[...Array(10)].map((_, i) => <option key={i} value={i * 10}></option>)}
              </datalist>
            </div>
          )}

          <div className="control-group">
            <label className="block mb-2">Angle:</label>
            <input type="range" min="0" max="360" value={settings.angle * (180 / Math.PI)} step="1" onChange={(e) => setSettings({ ...settings, angle: parseFloat(e.target.value) * (Math.PI / 180) })} className="w-full" list="angleSteps" />
            <datalist id="angleSteps">
              {[...Array(36)].map((_, i) => <option key={i} value={i * 10}></option>)}
            </datalist>
          </div>
          <div className="control-group">
            <label className="block mb-2">Amplitude:</label>
            <input type="range" max="360" min="0" step="1" value={settings.amplitude} onChange={(e) => setSettings({ ...settings, amplitude: parseFloat(e.target.value) })} className="w-full" list="amplitudeSteps" />
            <datalist id="amplitudeSteps">
              {[...Array(36)].map((_, i) => <option key={i} value={i * 10}></option>)}
            </datalist>
          </div>
          <div className="control-group">
            <label className="block mb-2">Frequency:</label>
            <input type="range" min="1" max="300" value={settings.frequency} step="1" onChange={(e) => setSettings({ ...settings, frequency: parseFloat(e.target.value) })} className="w-full" list="frequencySteps" />
            <datalist id="frequencySteps">
              {[...Array(30)].map((_, i) => <option key={i} value={i * 10}></option>)}
            </datalist>
          </div>
          <div className="control-group">
            <label className="block mb-2">Speed:</label>
            <input type="range" min="1" max="100" value={settings.speed * 100} step="1" onChange={(e) => setSettings({ ...settings, speed: parseFloat(e.target.value) / 100 })} className="w-full" list="speedSteps" />
            <datalist id="speedSteps">
              {[...Array(10)].map((_, i) => <option key={i} value={i * 10}></option>)}
            </datalist>
          </div>
          <div className="control-group">
            <label className="block mb-2">Line Thickness:</label>
            <input type="range" min="1" max="10" value={settings.thickness} step="1" onChange={(e) => setSettings({ ...settings, thickness: parseFloat(e.target.value) })} className="w-full" list="thicknessSteps" />
            <datalist id="thicknessSteps">
              {[...Array(10)].map((_, i) => <option key={i} value={i + 1}></option>)}
            </datalist>
          </div>
          <div className="control-group">
            <label className="block mb-2">Phase Offset:</label>
            <input type="range" min="0" max="360" value={settings.phaseOffset * (180 / Math.PI)} step="1" onChange={(e) => setSettings({ ...settings, phaseOffset: (parseFloat(e.target.value) / 360) * (2 * Math.PI) })} className="w-full" list="phaseOffsetSteps" />
            <datalist id="phaseOffsetSteps">
              {[...Array(36)].map((_, i) => <option key={i} value={i * 10}></option>)}
            </datalist>
          </div>
          <div className="control-group">
            <label className="block mb-2">Number of Lines:</label>
            <input type="range" min="1" max="100" value={settings.numLines} step="1" onChange={(e) => setSettings({ ...settings, numLines: parseInt(e.target.value, 10) })} className="w-full" list="numLinesSteps" />
            <datalist id="numLinesSteps">
              {[...Array(10)].map((_, i) => <option key={i} value={i * 10}></option>)}
            </datalist>
          </div>
          <div className="control-group">
            <label className="block mb-2">Distance Between Lines:</label>
            <input type="range" min="1" max="200" value={settings.distance} step="1" onChange={(e) => setSettings({ ...settings, distance: parseFloat(e.target.value) })} className="w-full" list="distanceSteps" />
            <datalist id="distanceSteps">
              {[...Array(20)].map((_, i) => <option key={i} value={i * 10}></option>)}
            </datalist>
          </div>
          <div className="control-group">
            <label className="block mb-2">Number of Groups:</label>
            <input type="range" min="1" max="10" value={settings.groups} step="1" onChange={(e) => setSettings({ ...settings, groups: parseInt(e.target.value, 10) })} className="w-full" list="groupsSteps" />
            <datalist id="groupsSteps">
              {[...Array(10)].map((_, i) => <option key={i} value={i + 1}></option>)}
            </datalist>
          </div>
          <div className="control-group">
            <label className="block mb-2">Distance between Groups:</label>
            <input type="range" min="0" max="1000" value={settings.groupDistance} step="1" onChange={(e) => setSettings({ ...settings, groupDistance: parseFloat(e.target.value) })} className="w-full" list="groupDistanceSteps" />
            <datalist id="groupDistanceSteps">
              {[...Array(100)].map((_, i) => <option key={i} value={i * 10}></option>)}
            </datalist>
          </div>
          <div className="control-group">
            <label className="block mb-2">Background Color:</label>
            <input type="color" value={settings.bgColor} onChange={(e) => setSettings({ ...settings, bgColor: e.target.value })} className="w-full" />
          </div>
          <div className="control-group">
            <label className="block mb-2">Line Color:</label>
            <input type="color" value={settings.lineColor} onChange={(e) => setSettings({ ...settings, lineColor: e.target.value })} className="w-full" />
          </div>
          <div className="control-group">
            <label className="block mb-2">Use Palette:</label>
            <select value={settings.selectedPalette} onChange={(e) => setSettings({ ...settings, selectedPalette: e.target.value })} className="border p-2 rounded w-full">
              <option value="none">None</option>
              <option value="rainbow">Rainbow</option>
              <option value="pastel">Pastel</option>
            </select>
          </div>
        </div>
      </Collapse>
    </div>
  );
};

export default ControlPanel;


 */

/* // src/components/Therapy/ControlPanel.jsx
import React, { useState } from 'react';
import { Collapse } from 'react-collapse';
import MultifunctionAnimation from '../Therapy/MultifunctionAnimation';
import ShapeAnimations from '../Therapy/ShapeAnimations';
import ColorAnimation from '../Therapy/ColorAnimation';
import { db, storage } from '../../firebase/firebase';
import { useAuth } from '../../data/AuthContext';
//import { doc, setDoc, getDoc, collection } from 'firebase/firestore';
//import { ref, uploadBytes } from 'firebase/storage';
import Papa from 'papaparse';
import DateTimeDisplay from '../common/DateTimeDisplay';
  
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
 

const ControlPanel = ({
  settings, setSettings,
  startAnimation, stopAnimation, resetAnimation,
  currentAnimation, setCurrentAnimation
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const { currentUser } = useAuth();
  const [presetName, setPresetName] = useState('');
  const [message, setMessage] = useState({ message: '', type: '' });

  const saveSettings = async () => {
    if (!presetName) {
      alert('Please provide a name for the preset.');
      return;
    }

    const timestamp = new Date();
    const localDateTime = timestamp.toLocaleString();
    const settingsWithTimestamp = {
      ...settings,
      presetName,
      userId: currentUser.uid,
      timestamp: timestamp.toISOString(),
      localDateTime
    };

    try {
      // Save to Firestore
      const userDocRef = doc(collection(db, `users/${currentUser.uid}/animation-settings`));
      await setDoc(userDocRef, settingsWithTimestamp);
      console.log('Document written with ID: ', userDocRef.id);

      // Generate CSV data
      const csvData = Object.keys(settings).map(key => ({
        setting: key,
        value: settings[key]
      }));
      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

      const csvRef = ref(storage, `users/${currentUser.uid}/animation-settings/${timestamp.toISOString()}.csv`);
      await uploadBytes(csvRef, blob);

      alert('Settings saved successfully!');
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Error saving settings. Please try again.');
    }
  };

  const loadSettings = async () => {
    if (!presetName) {
      alert('Please provide the name of the preset to load.');
      return;
    }

    try {
      // Load the latest document with the given preset name from Firestore
      const userDocsRef = collection(db, `users/${currentUser.uid}/animation-settings`);
      const q = query(userDocsRef, where("presetName", "==", presetName));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docSnapshot = querySnapshot.docs[0];
        const loadedSettings = docSnapshot.data();
        setSettings(loadedSettings);
        alert('Settings loaded successfully!');
      } else {
        alert('No settings found with that preset name.');
      }
    } catch (err) {
      console.error('Error loading settings:', err);
      alert('Error loading settings. Please try again.');
    }
  };


  return (
    <div className="fixed right-4 top-2 bg-white bg-opacity-50 p-2 rounded shadow-lg w-80 z-50 h-full overflow-y-auto">
      <DateTimeDisplay />
      <div className="flex justify-start mb-2">
        {currentAnimation !== 'multifunction' && (
          <button
            onClick={() => setCurrentAnimation('multifunction')}
            className="bg-gray-200 p-2 rounded mr-1"
          >
            Multifunction
          </button>
        )}
        {currentAnimation !== 'shape' && (
          <button
            onClick={() => setCurrentAnimation('shape')}
            className="bg-gray-200 p-2 rounded mr-1"
          >
            Shape
          </button>
        )}
        {currentAnimation !== 'color' && (
          <button
            onClick={() => setCurrentAnimation('color')}
            className="bg-gray-200 p-2 rounded"
          >
            Color
          </button>
        )}
      </div>
      <button onClick={() => setIsOpen(!isOpen)} className="mb-2 bg-gray-200 p-2 border p-2 rounded w-full">
        {isOpen ? 'Collapse Controls' : 'Expand Controls'}
      </button>
      <Collapse isOpened={isOpen}>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <button onClick={startAnimation} className="bg-green-500 text-white p-2 rounded w-1/3">Start</button>
            <button onClick={stopAnimation} className="bg-red-500 text-white p-2 rounded w-1/3">Stop</button>
            <button onClick={resetAnimation} className="bg-gray-500 text-white p-2 rounded w-1/3">Reset</button>
          </div>
          <div className="flex space-x-2">
            <button onClick={saveSettings} className="bg-blue-500 text-white p-2 rounded w-1/2">Save</button>
            <button onClick={loadSettings} className="bg-yellow-500 text-white p-2 rounded w-1/2">Load</button>
          </div>
          {message.message && (
            <div className={`alert ${message.type === 'error' ? 'bg-red-500' : 'bg-green-500'} text-white p-2 rounded`}>
              {message.message}
            </div>
          )}
          {currentAnimation === 'multifunction' && <MultifunctionAnimation settings={settings} setSettings={setSettings} />}
          {currentAnimation === 'shape' && <ShapeAnimations settings={settings} setSettings={setSettings} />}
          {currentAnimation === 'color' && <ColorAnimation settings={settings} setSettings={setSettings} />}
          <div className="control-group">
            <label className="block mb-2">Wave Type:</label>
            <select value={settings.waveType} onChange={(e) => setSettings({ ...settings, waveType: e.target.value })} className="border p-2 rounded w-full">
              <option value="sine">Sine</option>
              <option value="tan">Tan</option>
              <option value="cotan">Cotan</option>
              <option value="sawtooth">Sawtooth</option>
              <option value="square">Square</option>
              <option value="triangle">Triangle</option>
            </select>
          </div>

          <div className="control-group">
            <label className="block mb-2">Direction:</label>
            <select value={settings.direction} onChange={(e) => setSettings({ ...settings, direction: e.target.value })} className="border p-2 rounded w-full">
              <option value="static">Static</option>
              <option value="up">Up</option>
              <option value="down">Down</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="oscillateUpDown">Oscillate Up and Down</option>
              <option value="oscillateRightLeft">Oscillate Right and Left</option>
              <option value="circular">Circular</option>
            </select>
          </div>

          {settings.direction === "circular" && (
            <>
              <div className="control-group">
                <label className="block mb-2">Rotation Speed:</label>
                <input type="range" min="0.01" max="1" step="0.01" value={settings.rotationSpeed} onChange={(e) => setSettings({ ...settings, rotationSpeed: parseFloat(e.target.value) })} className="w-full" />
              </div>
              <div className="control-group">
                <label className="block mb-2">Rotation Radius:</label>
                <input type="range" min="10" max="500" value={settings.rotationRadius} onChange={(e) => setSettings({ ...settings, rotationRadius: parseFloat(e.target.value) })} className="w-full" />
              </div>
            </>
          )}
          {['oscillateUpDown', 'oscillateRightLeft'].includes(settings.direction) && (
            <div className="control-group">
              <label className="block mb-2">Oscillation Range:</label>
              <input type="range" min="10" max={Math.min(window.innerWidth, window.innerHeight)} value={settings.oscillationRange} onChange={(e) => setSettings({ ...settings, oscillationRange: parseFloat(e.target.value) })} className="w-full" />
            </div>
          )}

          <div className="control-group">
            <label className="block mb-2">Angle:</label>
            <input type="range" min="0" max="360" value={settings.angle * (180 / Math.PI)} step="1" onChange={(e) => setSettings({ ...settings, angle: parseFloat(e.target.value) * (Math.PI / 180) })} className="w-full" />
          </div>

          <div className="control-group">
            <label className="block mb-2">Amplitude:</label>
            <input type="range" max="360" min="0" step="1" value={settings.amplitude} onChange={(e) => setSettings({ ...settings, amplitude: parseFloat(e.target.value) })} className="w-full" />
          </div>

          <div className="control-group">
            <label className="block mb-2">Frequency:</label>
            <input type="range" min="1" max="300" value={settings.frequency} step="1" onChange={(e) => setSettings({ ...settings, frequency: parseFloat(e.target.value) })} className="w-full" />
          </div>

          <div className="control-group">
            <label className="block mb-2">Speed:</label>
            <input type="range" min="1" max="100" value={settings.speed * 100} step="1" onChange={(e) => setSettings({ ...settings, speed: parseFloat(e.target.value) / 100 })} className="w-full" />
          </div>

          <div className="control-group">
            <label className="block mb-2">Line Thickness:</label>
            <input type="range" min="1" max="10" value={settings.thickness} step="1" onChange={(e) => setSettings({ ...settings, thickness: parseFloat(e.target.value) })} className="w-full" />
          </div>

          <div className="control-group">
            <label className="block mb-2">Phase Offset:</label>
            <input type="range" min="0" max="360" value={settings.phaseOffset * (180 / Math.PI)} step="1" onChange={(e) => setSettings({ ...settings, phaseOffset: (parseFloat(e.target.value) / 360) * (2 * Math.PI) })} className="w-full" />
          </div>

          <div className="control-group">
            <label className="block mb-2">Number of Lines:</label>
            <input type="range" min="1" max="100" value={settings.numLines} step="1" onChange={(e) => setSettings({ ...settings, numLines: parseInt(e.target.value, 10) })} className="w-full" />
          </div>

          <div className="control-group">
            <label className="block mb-2">Distance Between Lines:</label>
            <input type="range" min="1" max="200" value={settings.distance} step="1" onChange={(e) => setSettings({ ...settings, distance: parseFloat(e.target.value) })} className="w-full" />
          </div>

          <div className="control-group">
            <label className="block mb-2">Number of Groups:</label>
            <input type="range" min="1" max="10" value={settings.groups} step="1" onChange={(e) => setSettings({ ...settings, groups: parseInt(e.target.value, 10) })} className="w-full" />
          </div>

          <div className="control-group">
            <label className="block mb-2">Background Color:</label>
            <input type="color" value={settings.bgColor} onChange={(e) => setSettings({ ...settings, bgColor: e.target.value })} className="w-full" />
          </div>

          <div className="control-group">
            <label className="block mb-2">Line Color:</label>
            <input type="color" value={settings.lineColor} onChange={(e) => setSettings({ ...settings, lineColor: e.target.value })} className="w-full" />
          </div>

          <div className="control-group">
            <label className="block mb-2">Use Palette:</label>
            <select value={settings.selectedPalette} onChange={(e) => setSettings({ ...settings, selectedPalette: e.target.value })} className="border p-2 rounded w-full">
              <option value="none">None</option>
              <option value="rainbow">Rainbow</option>
              <option value="pastel">Pastel</option>
            </select>
          </div>
        </div>
      </Collapse>
    </div>
  );
};

export default ControlPanel;
 */
 
/*  // -----------------------with time adn animaton toggling . not functional yet 
import React, { useState } from 'react';
import { Collapse } from 'react-collapse';
import DateTimeDisplay from '../common/DateTimeDisplay';
import ShapeAnimations from '../Therapy/ShapeAnimations';
import ColorAnimation from '../Therapy/ColorAnimation';
const ControlPanel = ({
  waveType, setWaveType,
  direction, setDirection,
  angle, setAngle,
  amplitude, setAmplitude,
  frequency, setFrequency,
  speed, setSpeed,
  thickness, setThickness,
  phaseOffset, setPhaseOffset,
  numLines, setNumLines,
  distance, setDistance,
  bgColor, setBgColor,
  lineColor, setLineColor,
  selectedPalette, setSelectedPalette,
  rotationSpeed, setRotationSpeed,
  rotationRadius, setRotationRadius,
  oscillationRange, setOscillationRange,
  groups, setGroups,
  startAnimation, stopAnimation, resetAnimation,
  currentAnimation, setCurrentAnimation
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return ( 

    <div className="fixed right-4 top-2 bg-transparent p-2 rounded shadow-lg w-80 z-50 h-full overflow-y-auto">
      <DateTimeDisplay />
      <div className="flex justify-start mb-2">
        {currentAnimation !== 'multifunction' && (
          <button
            onClick={() => setCurrentAnimation('multifunction')}
            className="bg-gray-200 p-2 rounded mr-1"
          >
            Multifunction
          </button>
        )}
        {currentAnimation !== 'shape' && (
          <button
            onClick={() => setCurrentAnimation('shape')}
            className="bg-gray-200 p-2 rounded mr-1"
          >
            Shape
          </button>
        )}
        {currentAnimation !== 'color' && (
          <button
            onClick={() => setCurrentAnimation('color')}
            className="bg-gray-200 p-2 rounded"
          >
            Color
          </button>
        )}
      </div>
      <button onClick={() => setIsOpen(!isOpen)} className="mb-2 bg-gray-200 p-2 rounded w-full">
        {isOpen ? 'Collapse Controls' : 'Expand Controls'}
      </button>
      <Collapse isOpened={isOpen}>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <button onClick={startAnimation} className="bg-green-500 text-white p-2 rounded w-1/3">Start</button>
            <button onClick={stopAnimation} className="bg-red-500 text-white p-2 rounded w-1/3">Stop</button>
            <button onClick={resetAnimation} className="bg-gray-500 text-white p-2 rounded w-1/3">Reset</button>
          </div>

          <div className="control-group">
            <label className="block mb-2">Wave Type:</label>
            <select value={waveType} onChange={(e) => setWaveType(e.target.value)} className="border p-2 rounded w-full">
              <option value="sine">Sine</option>
              <option value="tan">Tan</option>
              <option value="cotan">Cotan</option>
              <option value="sawtooth">Sawtooth</option>
              <option value="square">Square</option>
              <option value="triangle">Triangle</option>
            </select>
          </div>
          
          <div className="control-group">
            <label className="block mb-2">Direction:</label>
            <select value={direction} onChange={(e) => setDirection(e.target.value)} className="border p-2 rounded w-full">
              <option value="static">Static</option>
              <option value="up">Up</option>
              <option value="down">Down</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="oscillateUpDown">Oscillate Up and Down</option>
              <option value="oscillateRightLeft">Oscillate Right and Left</option>
              <option value="circular">Circular</option>
            </select>
          </div>

          {direction === "circular" && (
            <>
              <div className="control-group">
                <label className="block mb-2">Rotation Speed:</label>
                <input type="range" min="0.01" max="1" step="0.01" value={rotationSpeed} onChange={(e) => setRotationSpeed(parseFloat(e.target.value))} className="w-full"/>
              </div>
              <div className="control-group">
                <label className="block mb-2">Rotation Radius:</label>
                <input type="range" min="10" max="500" value={rotationRadius} onChange={(e) => setRotationRadius(parseFloat(e.target.value))} className="w-full"/>
              </div>
            </>
          )}

          {['oscillateUpDown', 'oscillateRightLeft'].includes(direction) && (
            <div className="control-group">
              <label className="block mb-2">Oscillation Range:</label>
              <input type="range" min="10" max={Math.min(window.innerWidth, window.innerHeight) } value={oscillationRange} onChange={(e) => setOscillationRange(parseFloat(e.target.value))} className="w-full"/>
            </div>
          )}

          <div className="control-group">
            <label className="block mb-2">Angle:</label>
            <input type="range" min="0" max="360" value={angle * (180 / Math.PI)} step="1" onChange={(e) => setAngle(parseFloat(e.target.value) * (Math.PI / 180))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Amplitude:</label>
            <input type="range" max="360" min="0" step="1" value={amplitude} onChange={(e) => setAmplitude(parseFloat(e.target.value))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Frequency:</label>
            <input type="range" min="1" max="300" value={frequency} step="1" onChange={(e) => setFrequency(parseFloat(e.target.value))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Speed:</label>
            <input type="range" min="1" max="100" value={speed * 100} step="1" onChange={(e) => setSpeed(parseFloat(e.target.value) / 100)} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Line Thickness:</label>
            <input type="range" min="1" max="10" value={thickness} step="1" onChange={(e) => setThickness(parseFloat(e.target.value))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Phase Offset:</label>
            <input type="range" min="0" max="360" value={phaseOffset * (180 / Math.PI)} step="1" onChange={(e) => setPhaseOffset((parseFloat(e.target.value) / 360) * (2 * Math.PI))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Number of Lines:</label>
            <input type="range" min="1" max="100" value={numLines} step="1" onChange={(e) => setNumLines(parseInt(e.target.value, 10))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Distance Between Lines:</label>
            <input type="range" min="1" max="200" value={distance} step="1" onChange={(e) => setDistance(parseFloat(e.target.value))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Number of Groups:</label>
            <input type="range" min="1" max="10" value={groups} step="1" onChange={(e) => setGroups(parseInt(e.target.value, 10))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Background Color:</label>
            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Line Color:</label>
            <input type="color" value={lineColor} onChange={(e) => setLineColor(e.target.value)} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Use Palette:</label>
            <select value={selectedPalette} onChange={(e) => setSelectedPalette(e.target.value)} className="border p-2 rounded w-full">
              <option value="none">None</option>
              <option value="rainbow">Rainbow</option>
              <option value="pastel">Pastel</option>
            </select>
          </div>
        </div>
      </Collapse>
    </div>
  );
};

export default ControlPanel; 
 */

/*   import React, { useState } from 'react';
import { Collapse } from 'react-collapse';

const ControlPanel = ({
  waveType, setWaveType,
  direction, setDirection,
  angle, setAngle,
  amplitude, setAmplitude,
  frequency, setFrequency,
  speed, setSpeed,
  thickness, setThickness,
  phaseOffset, setPhaseOffset,
  numLines, setNumLines,
  distance, setDistance,
  bgColor, setBgColor,
  lineColor, setLineColor,
  selectedPalette, setSelectedPalette,
  rotationSpeed, setRotationSpeed,
  rotationRadius, setRotationRadius,
  oscillationRange, setOscillationRange,
  groups, setGroups,
  startAnimation, stopAnimation, resetAnimation
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={`fixed right-4 top-2 p-4 rounded ${isOpen ? 'shadow-lg bg-transparent' : ''} w-60 z-50 h-full overflow-y-auto`}>
      <button onClick={() => setIsOpen(!isOpen)} className="mb-2 bg-gray-200 p-2 rounded w-full">
        {isOpen ? 'Collapse Controls' : 'Expand Controls'}
      </button>
      <Collapse isOpened={isOpen}>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <button onClick={startAnimation} className="bg-green-500 text-white p-2 rounded w-1/3">Start</button>
            <button onClick={stopAnimation} className="bg-red-500 text-white p-2 rounded w-1/3">Stop</button>
            <button onClick={resetAnimation} className="bg-gray-500 text-white p-2 rounded w-1/3">Reset</button>
          </div>
          
          <div className="control-group">
            <label className="block mb-2">Wave Type:</label>
            <select value={waveType} onChange={(e) => setWaveType(e.target.value)} className="border p-2 rounded w-full">
              <option value="sine">Sine</option>
              <option value="tan">Tan</option>
              <option value="cotan">Cotan</option>
              <option value="sawtooth">Sawtooth</option>
              <option value="square">Square</option>
              <option value="triangle">Triangle</option>
            </select>
          </div>
          
          <div className="control-group">
            <label className="block mb-2">Direction:</label>
            <select value={direction} onChange={(e) => setDirection(e.target.value)} className="border p-2 rounded w-full">
              <option value="static">Static</option>
              <option value="up">Up</option>
              <option value="down">Down</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="oscillateUpDown">Oscillate Up and Down</option>
              <option value="oscillateRightLeft">Oscillate Right and Left</option>
              <option value="circular">Circular</option>
            </select>
          </div>

          {direction === "circular" && (
            <>
              <div className="control-group">
                <label className="block mb-2">Rotation Speed:</label>
                <input type="range" min="0.01" max="1" step="0.01" value={rotationSpeed} onChange={(e) => setRotationSpeed(parseFloat(e.target.value))} className="w-full"/>
              </div>
              <div className="control-group">
                <label className="block mb-2">Rotation Radius:</label>
                <input type="range" min="10" max="500" value={rotationRadius} onChange={(e) => setRotationRadius(parseFloat(e.target.value))} className="w-full"/>
              </div>
            </>
          )}
   {['oscillateUpDown', 'oscillateRightLeft'].includes(direction) && (
            <div className="control-group">
              <label className="block mb-2">Oscillation Range:</label>
              <input type="range" min="10" max={Math.min(window.innerWidth, window.innerHeight) } value={oscillationRange} onChange={(e) => setOscillationRange(parseFloat(e.target.value))} className="w-full"/>
            </div>
          )}

          <div className="control-group">
            <label className="block mb-2">Angle:</label>
            <input type="range" min="0" max="360" value={angle * (180 / Math.PI)} step="1" onChange={(e) => setAngle(parseFloat(e.target.value) * (Math.PI / 180))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Amplitude:</label>
            <input type="range" max="360" min="0" step="1" value={amplitude} onChange={(e) => setAmplitude(parseFloat(e.target.value))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Frequency:</label>
            <input type="range" min="1" max="300" value={frequency} step="1" onChange={(e) => setFrequency(parseFloat(e.target.value))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Speed:</label>
            <input type="range" min="1" max="100" value={speed * 100} step="1" onChange={(e) => setSpeed(parseFloat(e.target.value) / 100)} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Line Thickness:</label>
            <input type="range" min="1" max="10" value={thickness} step="1" onChange={(e) => setThickness(parseFloat(e.target.value))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Phase Offset:</label>
            <input type="range" min="0" max="360" value={phaseOffset * (180 / Math.PI)} step="1" onChange={(e) => setPhaseOffset((parseFloat(e.target.value) / 360) * (2 * Math.PI))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Number of Lines:</label>
            <input type="range" min="1" max="100" value={numLines} step="1" onChange={(e) => setNumLines(parseInt(e.target.value, 10))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Distance Between Lines:</label>
            <input type="range" min="1" max="200" value={distance} step="1" onChange={(e) => setDistance(parseFloat(e.target.value))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Number of Groups:</label>
            <input type="range" min="1" max="10" value={groups} step="1" onChange={(e) => setGroups(parseInt(e.target.value, 10))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Background Color:</label>
            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Line Color:</label>
            <input type="color" value={lineColor} onChange={(e) => setLineColor(e.target.value)} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Use Palette:</label>
            <select value={selectedPalette} onChange={(e) => setSelectedPalette(e.target.value)} className="border p-2 rounded w-full">
              <option value="none">None</option>
              <option value="rainbow">Rainbow</option>
              <option value="pastel">Pastel</option>
            </select>
          </div>
        </div>
      </Collapse>
    </div>
  );
};

export default ControlPanel;   */
 
 /* // -----------------------with time adn animaton toggling . not functional yet 
import React, { useState } from 'react';
import { Collapse } from 'react-collapse';
import DateTimeDisplay from '../common/DateTimeDisplay';
import ShapeAnimations from '../Therapy/ShapeAnimations';
import ColorAnimation from '../Therapy/ColorAnimation';
const ControlPanel = ({
  waveType, setWaveType,
  direction, setDirection,
  angle, setAngle,
  amplitude, setAmplitude,
  frequency, setFrequency,
  speed, setSpeed,
  thickness, setThickness,
  phaseOffset, setPhaseOffset,
  numLines, setNumLines,
  distance, setDistance,
  bgColor, setBgColor,
  lineColor, setLineColor,
  selectedPalette, setSelectedPalette,
  rotationSpeed, setRotationSpeed,
  rotationRadius, setRotationRadius,
  oscillationRange, setOscillationRange,
  groups, setGroups,
  startAnimation, stopAnimation, resetAnimation,
  currentAnimation, setCurrentAnimation
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return ( 

    <div className="fixed right-4 top-2 bg-transparent p-2 rounded shadow-lg w-80 z-50 h-full overflow-y-auto">
      <DateTimeDisplay />
      <div className="flex justify-start mb-2">
        {currentAnimation !== 'multifunction' && (
          <button
            onClick={() => setCurrentAnimation('multifunction')}
            className="bg-gray-200 p-2 rounded mr-1"
          >
            Multifunction
          </button>
        )}
        {currentAnimation !== 'shape' && (
          <button
            onClick={() => setCurrentAnimation('shape')}
            className="bg-gray-200 p-2 rounded mr-1"
          >
            Shape
          </button>
        )}
        {currentAnimation !== 'color' && (
          <button
            onClick={() => setCurrentAnimation('color')}
            className="bg-gray-200 p-2 rounded"
          >
            Color
          </button>
        )}
      </div>
      <button onClick={() => setIsOpen(!isOpen)} className="mb-2 bg-gray-200 p-2 rounded w-full">
        {isOpen ? 'Collapse Controls' : 'Expand Controls'}
      </button>
      <Collapse isOpened={isOpen}>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <button onClick={startAnimation} className="bg-green-500 text-white p-2 rounded w-1/3">Start</button>
            <button onClick={stopAnimation} className="bg-red-500 text-white p-2 rounded w-1/3">Stop</button>
            <button onClick={resetAnimation} className="bg-gray-500 text-white p-2 rounded w-1/3">Reset</button>
          </div>

          <div className="control-group">
            <label className="block mb-2">Wave Type:</label>
            <select value={waveType} onChange={(e) => setWaveType(e.target.value)} className="border p-2 rounded w-full">
              <option value="sine">Sine</option>
              <option value="tan">Tan</option>
              <option value="cotan">Cotan</option>
              <option value="sawtooth">Sawtooth</option>
              <option value="square">Square</option>
              <option value="triangle">Triangle</option>
            </select>
          </div>
          
          <div className="control-group">
            <label className="block mb-2">Direction:</label>
            <select value={direction} onChange={(e) => setDirection(e.target.value)} className="border p-2 rounded w-full">
              <option value="static">Static</option>
              <option value="up">Up</option>
              <option value="down">Down</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="oscillateUpDown">Oscillate Up and Down</option>
              <option value="oscillateRightLeft">Oscillate Right and Left</option>
              <option value="circular">Circular</option>
            </select>
          </div>

          {direction === "circular" && (
            <>
              <div className="control-group">
                <label className="block mb-2">Rotation Speed:</label>
                <input type="range" min="0.01" max="1" step="0.01" value={rotationSpeed} onChange={(e) => setRotationSpeed(parseFloat(e.target.value))} className="w-full"/>
              </div>
              <div className="control-group">
                <label className="block mb-2">Rotation Radius:</label>
                <input type="range" min="10" max="500" value={rotationRadius} onChange={(e) => setRotationRadius(parseFloat(e.target.value))} className="w-full"/>
              </div>
            </>
          )}

          {['oscillateUpDown', 'oscillateRightLeft'].includes(direction) && (
            <div className="control-group">
              <label className="block mb-2">Oscillation Range:</label>
              <input type="range" min="10" max={Math.min(window.innerWidth, window.innerHeight) } value={oscillationRange} onChange={(e) => setOscillationRange(parseFloat(e.target.value))} className="w-full"/>
            </div>
          )}

          <div className="control-group">
            <label className="block mb-2">Angle:</label>
            <input type="range" min="0" max="360" value={angle * (180 / Math.PI)} step="1" onChange={(e) => setAngle(parseFloat(e.target.value) * (Math.PI / 180))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Amplitude:</label>
            <input type="range" max="360" min="0" step="1" value={amplitude} onChange={(e) => setAmplitude(parseFloat(e.target.value))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Frequency:</label>
            <input type="range" min="1" max="300" value={frequency} step="1" onChange={(e) => setFrequency(parseFloat(e.target.value))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Speed:</label>
            <input type="range" min="1" max="100" value={speed * 100} step="1" onChange={(e) => setSpeed(parseFloat(e.target.value) / 100)} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Line Thickness:</label>
            <input type="range" min="1" max="10" value={thickness} step="1" onChange={(e) => setThickness(parseFloat(e.target.value))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Phase Offset:</label>
            <input type="range" min="0" max="360" value={phaseOffset * (180 / Math.PI)} step="1" onChange={(e) => setPhaseOffset((parseFloat(e.target.value) / 360) * (2 * Math.PI))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Number of Lines:</label>
            <input type="range" min="1" max="100" value={numLines} step="1" onChange={(e) => setNumLines(parseInt(e.target.value, 10))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Distance Between Lines:</label>
            <input type="range" min="1" max="200" value={distance} step="1" onChange={(e) => setDistance(parseFloat(e.target.value))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Number of Groups:</label>
            <input type="range" min="1" max="10" value={groups} step="1" onChange={(e) => setGroups(parseInt(e.target.value, 10))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Background Color:</label>
            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Line Color:</label>
            <input type="color" value={lineColor} onChange={(e) => setLineColor(e.target.value)} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Use Palette:</label>
            <select value={selectedPalette} onChange={(e) => setSelectedPalette(e.target.value)} className="border p-2 rounded w-full">
              <option value="none">None</option>
              <option value="rainbow">Rainbow</option>
              <option value="pastel">Pastel</option>
            </select>
          </div>
        </div>
      </Collapse>
    </div>
  );
};

export default ControlPanel; 
 */


/* //src\components\Therapy\ControlPanel.jsx
import React, { useState } from 'react';
import { Collapse } from 'react-collapse';

const ControlPanel = ({
  waveType, setWaveType,
  direction, setDirection,
  angle, setAngle,
  amplitude, setAmplitude,
  frequency, setFrequency,
  speed, setSpeed,
  thickness, setThickness,
  phaseOffset, setPhaseOffset,
  numLines, setNumLines,
  distance, setDistance,
  bgColor, setBgColor,
  lineColor, setLineColor,
  selectedPalette, setSelectedPalette,
  rotationSpeed, setRotationSpeed,
  rotationRadius, setRotationRadius,
  groups, setGroups,
  startAnimation, stopAnimation, resetAnimation
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="fixed right-4 top-2 bg-transparent p-4 rounded shadow-lg w-60 z-50 h-full overflow-y-auto">
      <button onClick={() => setIsOpen(!isOpen)} className="mb-2 bg-gray-200 p-2 rounded w-full">
        {isOpen ? 'Collapse Controls' : 'Expand Controls'}
      </button>
      <Collapse isOpened={isOpen}>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <button onClick={startAnimation} className="bg-green-500 text-white p-2 rounded w-1/3">Start</button>
            <button onClick={stopAnimation} className="bg-red-500 text-white p-2 rounded w-1/3">Stop</button>
            <button onClick={resetAnimation} className="bg-gray-500 text-white p-2 rounded w-1/3">Reset</button>
          </div>
          
          <div className="control-group">
            <label className="block mb-2">Wave Type:</label>
            <select value={waveType} onChange={(e) => setWaveType(e.target.value)} className="border p-2 rounded w-full">
              <option value="sine">Sine</option>
              <option value="tan">Tan</option>
              <option value="cotan">Cotan</option>
              <option value="sawtooth">Sawtooth</option>
              <option value="square">Square</option>
              <option value="triangle">Triangle</option>
            </select>
          </div>
          
          <div className="control-group">
            <label className="block mb-2">Direction:</label>
            <select value={direction} onChange={(e) => setDirection(e.target.value)} className="border p-2 rounded w-full">
              <option value="static">Static</option>
              <option value="up">Up</option>
              <option value="down">Down</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="oscillateUpDown">Oscillate Up and Down</option>
              <option value="oscillateRightLeft">Oscillate Right and Left</option>
              <option value="circular">Circular</option>
            </select>
          </div>

          {direction === "circular" && (
            <>
              <div className="control-group">
                <label className="block mb-2">Rotation Speed:</label>
                <input type="range" min="0.01" max="1" step="0.01" value={rotationSpeed} onChange={(e) => setRotationSpeed(parseFloat(e.target.value))} className="w-full"/>
              </div>
              <div className="control-group">
                <label className="block mb-2">Rotation Radius:</label>
                <input type="range" min="10" max="500" value={rotationRadius} onChange={(e) => setRotationRadius(parseFloat(e.target.value))} className="w-full"/>
              </div>
            </>
          )}

          <div className="control-group">
            <label className="block mb-2">Angle:</label>
            <input type="range" min="0" max="360" value={angle * (180 / Math.PI)} step="1" onChange={(e) => setAngle(parseFloat(e.target.value) * (Math.PI / 180))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Amplitude:</label>
            <input type="range" max="360" min="0" step="1" value={amplitude} onChange={(e) => setAmplitude(parseFloat(e.target.value))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Frequency:</label>
            <input type="range" min="1" max="300" value={frequency} step="1" onChange={(e) => setFrequency(parseFloat(e.target.value))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Speed:</label>
            <input type="range" min="1" max="100" value={speed * 100} step="1" onChange={(e) => setSpeed(parseFloat(e.target.value) / 100)} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Line Thickness:</label>
            <input type="range" min="1" max="10" value={thickness} step="1" onChange={(e) => setThickness(parseFloat(e.target.value))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Phase Offset:</label>
            <input type="range" min="0" max="360" value={phaseOffset * (180 / Math.PI)} step="1" onChange={(e) => setPhaseOffset((parseFloat(e.target.value) / 360) * (2 * Math.PI))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Number of Lines:</label>
            <input type="range" min="1" max="100" value={numLines} step="1" onChange={(e) => setNumLines(parseInt(e.target.value, 10))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Distance Between Lines:</label>
            <input type="range" min="1" max="200" value={distance} step="1" onChange={(e) => setDistance(parseFloat(e.target.value))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Number of Groups:</label>
            <input type="range" min="1" max="10" value={groups} step="1" onChange={(e) => setGroups(parseInt(e.target.value, 10))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Background Color:</label>
            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Line Color:</label>
            <input type="color" value={lineColor} onChange={(e) => setLineColor(e.target.value)} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Use Palette:</label>
            <select value={selectedPalette} onChange={(e) => setSelectedPalette(e.target.value)} className="border p-2 rounded w-full">
              <option value="none">None</option>
              <option value="rainbow">Rainbow</option>
              <option value="pastel">Pastel</option>
            </select>
          </div>
        </div>
      </Collapse>
    </div>
  );
};

export default ControlPanel; */


/* // src/components/TherapyPage/ControlPanel.jsx
import React, { useState } from 'react';
import { Collapse } from 'react-collapse';

const ControlPanel = ({
  waveType, setWaveType,
  direction, setDirection,
  angle, setAngle,
  amplitude, setAmplitude,
  frequency, setFrequency,
  speed, setSpeed,
  thickness, setThickness,
  phaseOffset, setPhaseOffset,
  numLines, setNumLines,
  distance, setDistance,
  bgColor, setBgColor,
  lineColor, setLineColor,
  selectedPalette, setSelectedPalette,
  rotationSpeed, setRotationSpeed,
  rotationRadius, setRotationRadius,
  groups, setGroups,
  startAnimation, stopAnimation, resetAnimation
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="fixed right-4 top-2 bg-white p-2 rounded shadow-lg w-60 z-50 p-4  h-full overflow-y-auto  ">
      <button onClick={() => setIsOpen(!isOpen)} className="mb-1 bg-gray-200 p-1 rounded w-full">
        {isOpen ? 'Collapse Controls' : 'Expand Controls'}
      </button>
      <Collapse isOpened={isOpen}>
      
      <div className="animation-buttons mt-4">
          <button onClick={startAnimation} className="bg-green-500 text-white p-2 rounded mr-2 w-half">Start</button>
          <button onClick={stopAnimation} className="bg-red-500 text-white p-2 rounded mr-2 w-half">Stop</button>
          <button onClick={resetAnimation} className="bg-gray-500 text-white p-2 rounded w-half">Reset</button>
        </div>
        <div className="control-group">
          <label className="block mb-2">Wave Type:</label>
          <select value={waveType} onChange={(e) => setWaveType(e.target.value)} className="border p-2 rounded w-full">
            <option value="sine">Sine</option>
            <option value="tan">Tan</option>
            <option value="cotan">Cotan</option>
            <option value="sawtooth">Sawtooth</option>
            <option value="square">Square</option>
            <option value="triangle">Triangle</option>
          </select>
        </div>
        <div className="control-group">
          <label className="block mb-2">Direction:</label>
          <select value={direction} onChange={(e) => setDirection(e.target.value)} className="border p-2 rounded w-full">
            <option value="static">Static</option>
            <option value="up">Up</option>
            <option value="down">Down</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
            <option value="oscillateUpDown">Oscillate Up and Down</option>
            <option value="oscillateRightLeft">Oscillate Right and Left</option>
            <option value="circular">Circular</option>
          </select>
        </div>
        {direction === "circular" && (
          <>
            <div className="control-group">
              <label className="block mb-2">Rotation Speed:</label>
              <input type="range" min="0.01" max="1" step="0.01" value={rotationSpeed} onChange={(e) => setRotationSpeed(parseFloat(e.target.value))} className="w-full"/>
            </div>
            <div className="control-group">
              <label className="block mb-2">Rotation Radius:</label>
              <input type="range" min="10" max="500" value={rotationRadius} onChange={(e) => setRotationRadius(parseFloat(e.target.value))} className="w-full"/>
            </div>
          </>
        )}
        <div className="control-group">
          <label className="block mb-2">Angle:</label>
          <input type="range" min="0" max="360" value={angle * (180 / Math.PI)} step="1" onChange={(e) => setAngle(parseFloat(e.target.value) * (Math.PI / 180))} className="w-full"/>
        </div>
        <div className="control-group">
          <label className="block mb-2">Amplitude:</label>
          <input type="range" max="360" min="0" step="1" value={amplitude / (window.innerHeight / 4) * 100} onChange={(e) => setAmplitude(parseFloat(e.target.value) * (window.innerHeight / 4) / 100)} className="w-full"/>
        </div>
        <div className="control-group">
          <label className="block mb-2">Frequency:</label>
          <input type="range" min="1" max="300" value={frequency} step="1" onChange={(e) => setFrequency(parseFloat(e.target.value))} className="w-full"/>
        </div>
        <div className="control-group">
          <label className="block mb-2">Speed:</label>
          <input type="range" min="1" max="500" value={speed * 100} step="1" onChange={(e) => setSpeed(parseFloat(e.target.value) / 100)} className="w-full"/>
        </div>
        <div className="control-group">
          <label className="block mb-2">Line Thickness:</label>
          <input type="range" min="1" max="10" value={thickness} step="1" onChange={(e) => setThickness(parseFloat(e.target.value))} className="w-full"/>
        </div>
        <div className="control-group">
          <label className="block mb-2">Phase Offset:</label>
          <input type="range" min="0" max="360" value={phaseOffset * (180 / Math.PI)} step="1" onChange={(e) => setPhaseOffset((parseFloat(e.target.value) / 360) * (2 * Math.PI))} className="w-full"/>
        </div>
        <div className="control-group">
          <label className="block mb-2">Number of Lines:</label>
          <input type="range" min="1" max="100" value={numLines} step="1" onChange={(e) => setNumLines(parseInt(e.target.value, 10))} className="w-full"/>
        </div>
        <div className="control-group">
          <label className="block mb-2">Distance Between Lines:</label>
          <input type="range" min="1" max="200" value={distance} step="1" onChange={(e) => setDistance(parseFloat(e.target.value))} className="w-full"/>
        </div>
        <div className="control-group">
          <label className="block mb-2">Number of Groups:</label>
          <input type="range" min="1" max="10" value={groups} step="1" onChange={(e) => setGroups(parseInt(e.target.value, 10))} className="w-full"/>
        </div>
        
        <div className="control-group">
          <label className="block mb-2">Background Color:</label>
          <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-full"/>
        </div>
        <div className="control-group">
          <label className="block mb-2">Line Color:</label>
          <input type="color" value={lineColor} onChange={(e) => setLineColor(e.target.value)} className="w-full"/>
        </div>
        <div className="control-group">
          <label className="block mb-2">Use Palette:</label>
          <select value={selectedPalette} onChange={(e) => setSelectedPalette(e.target.value)} className="border p-2 rounded w-full">
            <option value="none">None</option>
            <option value="rainbow">Rainbow</option>

            <option value="pastel">Pastel</option>
        
          </select>
        </div>
       
      </Collapse>
    </div>
  );
};

export default ControlPanel; */

/* // src/components/TherapyPage/ControlPanel.jsx
import React, { useState } from 'react';
import { Collapse } from 'react-collapse';

const ControlPanel = ({
  waveType, setWaveType,
  direction, setDirection,
  angle, setAngle,
  amplitude, setAmplitude,
  frequency, setFrequency,
  speed, setSpeed,
  thickness, setThickness,
  phaseOffset, setPhaseOffset,
  numLines, setNumLines,
  distance, setDistance,
  bgColor, setBgColor,
  lineColor, setLineColor,
  selectedPalette, setSelectedPalette,
  rotationSpeed, setRotationSpeed,
  rotationRadius, setRotationRadius,
  startAnimation, stopAnimation, resetAnimation
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="fixed right-5 top-5 bg-white p-4 rounded shadow-lg w-80 z-50 flex-grow  h full overflow-y-auto">
      <button onClick={() => setIsOpen(!isOpen)} className="mb-4 bg-gray-200 p-2 rounded w-full">
        {isOpen ? 'Collapse Controls' : 'Expand Controls'}
      </button>
      <Collapse isOpened={isOpen}>
        <div className="control-group">
          <label className="block mb-2">Wave Type:</label>
          <select value={waveType} onChange={(e) => setWaveType(e.target.value)} className="border p-2 rounded w-full">
            <option value="sine">Sine</option>
            <option value="tan">Tan</option>
            <option value="cotan">Cotan</option>
            <option value="sawtooth">Sawtooth</option>
            <option value="square">Square</option>
            <option value="triangle">Triangle</option>
          </select>
        </div>
        <div className="control-group">
          <label className="block mb-2">Direction:</label>
          <select value={direction} onChange={(e) => setDirection(e.target.value)} className="border p-2 rounded w-full">
            <option value="static">Static</option>
            <option value="up">Up</option>
            <option value="down">Down</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
            <option value="oscillateUpDown">Oscillate Up and Down</option>
            <option value="oscillateRightLeft">Oscillate Right and Left</option>
            <option value="circular">Circular</option>
          </select>
        </div>
        {direction === "circular" && (
          <>
            <div className="control-group">
              <label className="block mb-2">Rotation Speed:</label>
              <input type="range" min="0.01" max="1" step="0.01" value={rotationSpeed} onChange={(e) => setRotationSpeed(parseFloat(e.target.value))} className="w-full"/>
            </div>
            <div className="control-group">
              <label className="block mb-2">Rotation Radius:</label>
              <input type="range" min="10" max="500" value={rotationRadius} onChange={(e) => setRotationRadius(parseFloat(e.target.value))} className="w-full"/>
            </div>
          </>
        )}
        <div className="control-group">
          <label className="block mb-2">Angle:</label>
          <input type="range" min="0" max="360" value={angle * (180 / Math.PI)} step="1" onChange={(e) => setAngle(parseFloat(e.target.value) * (Math.PI / 180))} className="w-full"/>
        </div>
        <div className="control-group">
          <label className="block mb-2">Amplitude:</label>
          <input type="range" max="360" min="0" step="1" value={amplitude / (window.innerHeight / 4) * 100} onChange={(e) => setAmplitude(parseFloat(e.target.value) * (window.innerHeight / 4) / 100)} className="w-full"/>
        </div>
        <div className="control-group">
          <label className="block mb-2">Frequency:</label>
          <input type="range" min="1" max="300" value={frequency} step="1" onChange={(e) => setFrequency(parseFloat(e.target.value))} className="w-full"/>
        </div>
        <div className="control-group">
          <label className="block mb-2">Speed:</label>
          <input type="range" min="1" max="500" value={speed * 100} step="1" onChange={(e) => setSpeed(parseFloat(e.target.value) / 100)} className="w-full"/>
        </div>
        <div className="control-group">
          <label className="block mb-2">Line Thickness:</label>
          <input type="range" min="1" max="10" value={thickness} step="1" onChange={(e) => setThickness(parseFloat(e.target.value))} className="w-full"/>
        </div>
        <div className="control-group">
          <label className="block mb-2">Phase Offset:</label>
          <input type="range" min="0" max="360" value={phaseOffset * (180 / Math.PI)} step="1" onChange={(e) => setPhaseOffset((parseFloat(e.target.value) / 360) * (2 * Math.PI))} className="w-full"/>
        </div>
        <div className="control-group">
          <label className="block mb-2">Number of Lines:</label>
          <input type="range" min="1" max="100" value={numLines} step="1" onChange={(e) => setNumLines(parseInt(e.target.value, 10))} className="w-full"/>
        </div>
        <div className="control-group">
          <label className="block mb-2">Distance Between Lines:</label>
          <input type="range" min="1" max="200" value={distance} step="1" onChange={(e) => setDistance(parseFloat(e.target.value))} className="w-full"/>
        </div>
        <div className="control-group">
          <label className="block mb-2">Background Color:</label>
          <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-full"/>
        </div>
        <div className="control-group">
          <label className="block mb-2">Line Color:</label>
          <input type="color" value={lineColor} onChange={(e) => setLineColor(e.target.value)} className="w-full"/>
        </div>
        <div className="control-group">
          <label className="block mb-2">Use Palette:</label>
          <select value={selectedPalette} onChange={(e) => setSelectedPalette(e.target.value)} className="border p-2 rounded w-full">
            <option value="none">None</option>
            <option value="rainbow">Rainbow</option>
            <option value="pastel">Pastel</option>
          </select>
        </div>
        <div className="animation-buttons mt-4">
          <button onClick={startAnimation} className="bg-green-500 text-white p-2 rounded mr-2 w-half">Start</button>
          <button onClick={stopAnimation} className="bg-red-500 text-white p-2 rounded mr-2 w-half">Stop</button>
          <button onClick={resetAnimation} className="bg-gray-500 text-white p-2 rounded w-half">Reset</button>
        </div>
      </Collapse>
    </div>
  );
};

export default ControlPanel; */
