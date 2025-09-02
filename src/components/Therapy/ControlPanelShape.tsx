import React, { useState, ChangeEvent } from 'react';
import { Collapse } from 'react-collapse';
import Slider from '../common/Slider';
import PresetControls from '../common/PresetControls';
import type { PresetModule } from '../../utils/presets';

export interface Settings {
  shapeType: 'circle' | 'square' | 'triangle' | 'chevron' | 'diamond';
  direction:
    | 'static'
    | 'up'
    | 'down'
    | 'left'
    | 'right'
    | 'oscillateUpDown'
    | 'oscillateRightLeft'
    | 'circular'
    | '3DVertical'
    | '3DHorizontal';
  rotationSpeed: number;
  rotationRadius: number;
  oscillationRange: number;
  angle: number;     // radians
  speed: number;
  size: number;
  numShapes: number;
  bgColor: string;
  shapeColor: string;
  secondColor: string;
  palette: 'none' | 'rainbow' | 'pastel';
  layoutSelect: 'random' | 'regular' | 'checkboard';
  rowOffset: number;
  columnOffset: number;
  rowDistance: number;
  columnDistance: number;

  // NEW: opacity controls (paired with the color pickers below)
  bgOpacity: number;                               // 0..1
  bgOpacityMode: 'constant' | 'pulse';
  bgOpacitySpeed: number;                          // >=0
  shapeOpacity: number;                            // 0..1
  shapeOpacityMode: 'constant' | 'pulse';
  shapeOpacitySpeed: number;                       // >=0
}

type Msg = { message: string; type: 'success' | 'error' };

interface ControlPanelShapeProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  startAnimation: () => void;
  stopAnimation: () => void;
  resetAnimation: () => void;
}

// Preset module key for this panel
const MODULE: PresetModule = 'shape';

// Allowed enums for strict merging
const SHAPES = ['circle', 'square', 'triangle', 'chevron', 'diamond'] as const;
const DIRS = [
  'static',
  'up',
  'down',
  'left',
  'right',
  'oscillateUpDown',
  'oscillateRightLeft',
  'circular',
  '3DVertical',
  '3DHorizontal',
] as const;
const PALETTES = ['none', 'rainbow', 'pastel'] as const;
const LAYOUTS = ['random', 'regular', 'checkboard'] as const;
const MODES = ['constant', 'pulse'] as const;

// Strict merge so missing fields in a preset do NOT wipe current values
const mergeLoaded = (d: Partial<Settings>, s: Settings): Settings => ({
  ...s,
  shapeType: SHAPES.includes(d.shapeType as any) ? (d.shapeType as any) : s.shapeType,
  direction: DIRS.includes(d.direction as any) ? (d.direction as any) : s.direction,

  rotationSpeed: typeof d.rotationSpeed === 'number' ? d.rotationSpeed : s.rotationSpeed,
  rotationRadius: typeof d.rotationRadius === 'number' ? d.rotationRadius : s.rotationRadius,
  oscillationRange: typeof d.oscillationRange === 'number' ? d.oscillationRange : s.oscillationRange,

  angle: typeof d.angle === 'number' ? d.angle : s.angle,
  speed: typeof d.speed === 'number' ? d.speed : s.speed,
  size: typeof d.size === 'number' ? d.size : s.size,
  numShapes: typeof d.numShapes === 'number' ? d.numShapes : s.numShapes,

  bgColor: typeof d.bgColor === 'string' ? d.bgColor : s.bgColor,
  shapeColor: typeof d.shapeColor === 'string' ? d.shapeColor : s.shapeColor,
  secondColor: typeof d.secondColor === 'string' ? d.secondColor : s.secondColor,

  palette: PALETTES.includes(d.palette as any) ? (d.palette as any) : s.palette,
  layoutSelect: LAYOUTS.includes(d.layoutSelect as any) ? (d.layoutSelect as any) : s.layoutSelect,

  rowOffset: typeof d.rowOffset === 'number' ? d.rowOffset : s.rowOffset,
  columnOffset: typeof d.columnOffset === 'number' ? d.columnOffset : s.columnOffset,
  rowDistance: typeof d.rowDistance === 'number' ? d.rowDistance : s.rowDistance,
  columnDistance: typeof d.columnDistance === 'number' ? d.columnDistance : s.columnDistance,

  // NEW: opacities (keep safe defaults if missing in old presets)
  bgOpacity: typeof d.bgOpacity === 'number' ? d.bgOpacity : s.bgOpacity,
  bgOpacityMode: MODES.includes(d.bgOpacityMode as any) ? (d.bgOpacityMode as any) : s.bgOpacityMode,
  bgOpacitySpeed: typeof d.bgOpacitySpeed === 'number' ? d.bgOpacitySpeed : s.bgOpacitySpeed,
  shapeOpacity: typeof d.shapeOpacity === 'number' ? d.shapeOpacity : s.shapeOpacity,
  shapeOpacityMode: MODES.includes(d.shapeOpacityMode as any) ? (d.shapeOpacityMode as any) : s.shapeOpacityMode,
  shapeOpacitySpeed: typeof d.shapeOpacitySpeed === 'number' ? d.shapeOpacitySpeed : s.shapeOpacitySpeed,
});

const ControlPanelShape: React.FC<ControlPanelShapeProps> = ({
  settings,
  setSettings,
  startAnimation,
  stopAnimation,
  resetAnimation,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [msg, setMsg] = useState<Msg | null>(null);

  const onColorChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(s => ({ ...s, [name]: value }));
  };

  return (
    <div
      className={`fixed right-4 top-2 p-4 rounded ${
        isOpen ? 'shadow-lg bg-transparent' : ''
      } w-60 z-50 h-full overflow-y-auto`}
    >
      <button
        onClick={() => setIsOpen(o => !o)}
        className="w-full bg-gray-200 text-gray-700 text-xs py-2 rounded mb-4"
      >
        {isOpen ? 'Collapse Controls' : 'Expand Controls'}
      </button>

      <Collapse isOpened={isOpen}>
        <div className="space-y-4">
          {/* Transport */}
          <div className="text-xs flex space-x-2">
            <button onClick={startAnimation} className="flex-1 bg-green-500 text-white py-2 rounded">Start</button>
            <button onClick={stopAnimation}  className="flex-1 bg-red-500   text-white py-2 rounded">Stop</button>
            <button onClick={resetAnimation} className="flex-1 bg-gray-500  text-white py-2 rounded">Reset</button>
          </div>

          {msg && (
            <div className={`p-2 rounded text-sm ${
              msg.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {msg.message}
            </div>
          )}

          {/* Shape type */}
          <div className="space-y-1 text-xs">
            <label>Select Shape:</label>
            <select
              value={settings.shapeType}
              onChange={e => setSettings(s => ({ ...s, shapeType: e.target.value as any }))}
              className="w-full border px-2 py-1 rounded"
            >
              <option value="circle">Circle</option>
              <option value="square">Square</option>
              <option value="triangle">Triangle</option>
              <option value="chevron">Chevron</option>
              <option value="diamond">Diamond</option>
            </select>
          </div>

          {/* Direction */}
          <div className="space-y-1 text-xs">
            <label>Direction:</label>
            <select
              value={settings.direction}
              onChange={e => setSettings(s => ({ ...s, direction: e.target.value as any }))}
              className="w-full border text-xs px-2 py-1 rounded"
            >
              <option value="static">Static</option>
              <option value="up">Up</option>
              <option value="down">Down</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="oscillateUpDown">Oscillate Up/Down</option>
              <option value="oscillateRightLeft">Oscillate L/R</option>
              <option value="circular">Circular</option>
              <option value="3DVertical">3D Vert.</option>
              <option value="3DHorizontal">3D Horz.</option>
            </select>
          </div>

          {/* Circular-only controls */}
          {settings.direction === 'circular' && (
            <>
              <Slider
                label="Rotation Speed"
                min={0.01}
                max={1}
                step={0.01}
                value={settings.rotationSpeed}
                onChange={v => setSettings(s => ({ ...s, rotationSpeed: v }))}
              />
              <Slider
                label="Rotation Radius"
                min={10}
                max={500}
                value={settings.rotationRadius}
                onChange={v => setSettings(s => ({ ...s, rotationRadius: v }))}
              />
            </>
          )}

          {/* Oscillation-only controls */}
          {['oscillateUpDown','oscillateRightLeft','3DVertical','3DHorizontal'].includes(settings.direction) && (
            <Slider
              label="Oscillation Range"
              min={0}
              max={window.innerWidth / 4}
              value={settings.oscillationRange}
              onChange={v => setSettings(s => ({ ...s, oscillationRange: v }))}
            />
          )}

          {/* Angle (degrees input, stored as radians) */}
          <Slider
            label="Angle (°)"
            min={0}
            max={360}
            step={1}
            value={(settings.angle * 180) / Math.PI}
            onChange={v => setSettings(s => ({ ...s, angle: (v * Math.PI) / 180 }))}
          />

          {/* Speed & Size */}
          <Slider
            label="Speed"
            min={1}
            max={20}
            step={1}
            value={settings.speed}
            onChange={v => setSettings(s => ({ ...s, speed: v }))}
          />
          <Slider
            label="Size"
            min={20}
            max={200}
            step={1}
            value={settings.size}
            onChange={v => setSettings(s => ({ ...s, size: v }))}
          />

          {/* Count if random layout */}
          {settings.layoutSelect === 'random' && (
            <Slider
              label="Number of Shapes"
              min={1}
              max={100}
              value={settings.numShapes}
              onChange={v => setSettings(s => ({ ...s, numShapes: v }))}
            />
          )}

          {/* Colors */}
          <div className="space-y-1 text-xs">
            <label>Background Color:</label>
            <input
              name="bgColor"
              type="color"
              value={settings.bgColor}
              onChange={onColorChange}
              className="w-full h-8 p-0 border rounded"
            />

            {/* NEW: Background Opacity (paired, directly under bg color) */}
            <div className="mt-1 space-y-1">
              <Slider
                label={`Background Opacity (${Math.round(settings.bgOpacity * 100)}%)`}
                min={0}
                max={1}
                step={0.01}
                value={settings.bgOpacity}
                onChange={(v) => setSettings(s => ({ ...s, bgOpacity: v }))}
              />
              <div className="flex gap-2">
                <label className="w-20 self-center">Mode</label>
                <select
                  className="border px-2 py-1 rounded w-full"
                  value={settings.bgOpacityMode}
                  onChange={(e) => setSettings(s => ({ ...s, bgOpacityMode: e.target.value as any }))}
                >
                  <option value="constant">Constant</option>
                  <option value="pulse">Pulse</option>
                </select>
              </div>
              {settings.bgOpacityMode === 'pulse' && (
                <Slider
                  label={`BG Pulse Speed (${settings.bgOpacitySpeed.toFixed(2)})`}
                  min={0}
                  max={5}
                  step={0.01}
                  value={settings.bgOpacitySpeed}
                  onChange={(v) => setSettings(s => ({ ...s, bgOpacitySpeed: v }))}
                />
              )}
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <label>Shape Color:</label>
            <input
              name="shapeColor"
              type="color"
              value={settings.shapeColor}
              onChange={onColorChange}
              className="w-full h-8 p-0 border rounded"
            />

            {/* NEW: Shape Opacity (paired, directly under shape color) */}
            <div className="mt-1 space-y-1">
              <Slider
                label={`Shape Opacity (${Math.round(settings.shapeOpacity * 100)}%)`}
                min={0}
                max={1}
                step={0.01}
                value={settings.shapeOpacity}
                onChange={(v) => setSettings(s => ({ ...s, shapeOpacity: v }))}
              />
              <div className="flex gap-2">
                <label className="w-20 self-center">Mode</label>
                <select
                  className="border px-2 py-1 rounded w-full"
                  value={settings.shapeOpacityMode}
                  onChange={(e) => setSettings(s => ({ ...s, shapeOpacityMode: e.target.value as any }))}
                >
                  <option value="constant">Constant</option>
                  <option value="pulse">Pulse</option>
                </select>
              </div>
              {settings.shapeOpacityMode === 'pulse' && (
                <Slider
                  label={`Shape Pulse Speed (${settings.shapeOpacitySpeed.toFixed(2)})`}
                  min={0}
                  max={5}
                  step={0.01}
                  value={settings.shapeOpacitySpeed}
                  onChange={(v) => setSettings(s => ({ ...s, shapeOpacitySpeed: v }))}
                />
              )}
            </div>
          </div>

          {settings.layoutSelect === 'checkboard' && (
            <div className="space-y-1 text-xs">
              <label>Second Color:</label>
              <input
                name="secondColor"
                type="color"
                value={settings.secondColor}
                onChange={onColorChange}
                className="w-full h-8 p-0 border rounded"
              />
            </div>
          )}

          {/* Palette */}
          <div className="space-y-1 text-xs">
            <label>Palette:</label>
            <select
              value={settings.palette}
              onChange={e => setSettings(s => ({ ...s, palette: e.target.value as any }))}
              className="w-full border px-2 py-1 rounded"
            >
              <option value="none">None</option>
              <option value="rainbow">Rainbow</option>
              <option value="pastel">Pastel</option>
            </select>
          </div>

          {/* Layout */}
          <div className="space-y-1 text-xs">
            <label>Layout:</label>
            <select
              value={settings.layoutSelect}
              onChange={e => setSettings(s => ({ ...s, layoutSelect: e.target.value as any }))}
              className="w-full border text-xs px-2 py-1 rounded"
            >
              <option value="random">Random</option>
              <option value="regular">Regular</option>
              <option value="checkboard">Checkboard</option>
            </select>
          </div>

          {/* Grid offsets (non-random layouts) */}
          {settings.layoutSelect !== 'random' && (
            <>
              <Slider
                label="Row Offset"
                min={0}
                max={100}
                value={settings.rowOffset}
                onChange={v => setSettings(s => ({ ...s, rowOffset: v }))}
              />
              <Slider
                label="Col Offset"
                min={0}
                max={100}
                value={settings.columnOffset}
                onChange={v => setSettings(s => ({ ...s, columnOffset: v }))}
              />
              <Slider
                label="Row Distance"
                min={0}
                max={100}
                value={settings.rowDistance}
                onChange={v => setSettings(s => ({ ...s, rowDistance: v }))}
              />
              <Slider
                label="Col Distance"
                min={0}
                max={100}
                value={settings.columnDistance}
                onChange={v => setSettings(s => ({ ...s, columnDistance: v }))}
              />
            </>
          )}

          <hr className="my-2" />

          {/* Presets (save/load) */}
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

export default ControlPanelShape;


// src/components/Therapy/ControlPanelShape.tsx

// Uses shared PresetControls + utils/presets. Keeps all   existing UI.
// import React, { useState, ChangeEvent } from 'react';
// import { Collapse } from 'react-collapse';
// import Slider from '../common/Slider';
// import PresetControls from '../common/PresetControls';
// import type { PresetModule } from '../../utils/presets';

// export interface Settings {
//   shapeType: 'circle' | 'square' | 'triangle' | 'chevron' | 'diamond';
//   direction:
//     | 'static'
//     | 'up'
//     | 'down'
//     | 'left'
//     | 'right'
//     | 'oscillateUpDown'
//     | 'oscillateRightLeft'
//     | 'circular'
//     | '3DVertical'
//     | '3DHorizontal';
//   rotationSpeed: number;
//   rotationRadius: number;
//   oscillationRange: number;
//   angle: number;     // radians
//   speed: number;
//   size: number;
//   numShapes: number;
//   bgColor: string;
//   shapeColor: string;
//   secondColor: string;
//   palette: 'none' | 'rainbow' | 'pastel';
//   layoutSelect: 'random' | 'regular' | 'checkboard';
//   rowOffset: number;
//   columnOffset: number;
//   rowDistance: number;
//   columnDistance: number;
// }

// type Msg = { message: string; type: 'success' | 'error' };

// interface ControlPanelShapeProps {
//   settings: Settings;
//   setSettings: React.Dispatch<React.SetStateAction<Settings>>;
//   startAnimation: () => void;
//   stopAnimation: () => void;
//   resetAnimation: () => void;
// }

// // Preset module key for this panel
// const MODULE: PresetModule = 'shape';

// // Allowed enums for strict merging
// const SHAPES = ['circle', 'square', 'triangle', 'chevron', 'diamond'] as const;
// const DIRS = [
//   'static',
//   'up',
//   'down',
//   'left',
//   'right',
//   'oscillateUpDown',
//   'oscillateRightLeft',
//   'circular',
//   '3DVertical',
//   '3DHorizontal',
// ] as const;
// const PALETTES = ['none', 'rainbow', 'pastel'] as const;
// const LAYOUTS = ['random', 'regular', 'checkboard'] as const;

// // Strict merge so missing fields in a preset do NOT wipe current values
// const mergeLoaded = (d: Partial<Settings>, s: Settings): Settings => ({
//   ...s,
//   shapeType: SHAPES.includes(d.shapeType as any) ? (d.shapeType as any) : s.shapeType,
//   direction: DIRS.includes(d.direction as any) ? (d.direction as any) : s.direction,

//   rotationSpeed: typeof d.rotationSpeed === 'number' ? d.rotationSpeed : s.rotationSpeed,
//   rotationRadius: typeof d.rotationRadius === 'number' ? d.rotationRadius : s.rotationRadius,
//   oscillationRange: typeof d.oscillationRange === 'number' ? d.oscillationRange : s.oscillationRange,

//   angle: typeof d.angle === 'number' ? d.angle : s.angle,
//   speed: typeof d.speed === 'number' ? d.speed : s.speed,
//   size: typeof d.size === 'number' ? d.size : s.size,
//   numShapes: typeof d.numShapes === 'number' ? d.numShapes : s.numShapes,

//   bgColor: typeof d.bgColor === 'string' ? d.bgColor : s.bgColor,
//   shapeColor: typeof d.shapeColor === 'string' ? d.shapeColor : s.shapeColor,
//   secondColor: typeof d.secondColor === 'string' ? d.secondColor : s.secondColor,

//   palette: PALETTES.includes(d.palette as any) ? (d.palette as any) : s.palette,
//   layoutSelect: LAYOUTS.includes(d.layoutSelect as any) ? (d.layoutSelect as any) : s.layoutSelect,

//   rowOffset: typeof d.rowOffset === 'number' ? d.rowOffset : s.rowOffset,
//   columnOffset: typeof d.columnOffset === 'number' ? d.columnOffset : s.columnOffset,
//   rowDistance: typeof d.rowDistance === 'number' ? d.rowDistance : s.rowDistance,
//   columnDistance: typeof d.columnDistance === 'number' ? d.columnDistance : s.columnDistance,
// });

// const ControlPanelShape: React.FC<ControlPanelShapeProps> = ({
//   settings,
//   setSettings,
//   startAnimation,
//   stopAnimation,
//   resetAnimation,
// }) => {
//   const [isOpen, setIsOpen] = useState(true);
//   const [msg, setMsg] = useState<Msg | null>(null);

//   const onColorChange = (e: ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setSettings(s => ({ ...s, [name]: value }));
//   };

//   return (
//     <div
//       className={`fixed right-4 top-2 p-4 rounded ${
//         isOpen ? 'shadow-lg bg-transparent' : ''
//       } w-60 z-50 h-full overflow-y-auto`}
//     >
//       <button
//         onClick={() => setIsOpen(o => !o)}
//         className="w-full bg-gray-200 text-gray-700 text-xs py-2 rounded mb-4"
//       >
//         {isOpen ? 'Collapse Controls' : 'Expand Controls'}
//       </button>

//       <Collapse isOpened={isOpen}>
//         <div className="space-y-4">
//           {/* Transport */}
//           <div className="text-xs flex space-x-2">
//             <button onClick={startAnimation} className="flex-1 bg-green-500 text-white py-2 rounded">Start</button>
//             <button onClick={stopAnimation}  className="flex-1 bg-red-500   text-white py-2 rounded">Stop</button>
//             <button onClick={resetAnimation} className="flex-1 bg-gray-500  text-white py-2 rounded">Reset</button>
//           </div>

//           {msg && (
//             <div className={`p-2 rounded text-sm ${
//               msg.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//             }`}>
//               {msg.message}
//             </div>
//           )}

//           {/* Shape type */}
//           <div className="space-y-1 text-xs">
//             <label>Select Shape:</label>
//             <select
//               value={settings.shapeType}
//               onChange={e => setSettings(s => ({ ...s, shapeType: e.target.value as any }))}
//               className="w-full border px-2 py-1 rounded"
//             >
//               <option value="circle">Circle</option>
//               <option value="square">Square</option>
//               <option value="triangle">Triangle</option>
//               <option value="chevron">Chevron</option>
//               <option value="diamond">Diamond</option>
//             </select>
//           </div>

//           {/* Direction */}
//           <div className="space-y-1 text-xs">
//             <label>Direction:</label>
//             <select
//               value={settings.direction}
//               onChange={e => setSettings(s => ({ ...s, direction: e.target.value as any }))}
//               className="w-full border text-xs px-2 py-1 rounded"
//             >
//               <option value="static">Static</option>
//               <option value="up">Up</option>
//               <option value="down">Down</option>
//               <option value="left">Left</option>
//               <option value="right">Right</option>
//               <option value="oscillateUpDown">Oscillate Up/Down</option>
//               <option value="oscillateRightLeft">Oscillate L/R</option>
//               <option value="circular">Circular</option>
//               <option value="3DVertical">3D Vert.</option>
//               <option value="3DHorizontal">3D Horz.</option>
//             </select>
//           </div>

//           {/* Circular-only controls */}
//           {settings.direction === 'circular' && (
//             <>
//               <Slider
//                 label="Rotation Speed"
//                 min={0.01}
//                 max={1}
//                 step={0.01}
//                 value={settings.rotationSpeed}
//                 onChange={v => setSettings(s => ({ ...s, rotationSpeed: v }))}
//               />
//               <Slider
//                 label="Rotation Radius"
//                 min={10}
//                 max={500}
//                 value={settings.rotationRadius}
//                 onChange={v => setSettings(s => ({ ...s, rotationRadius: v }))}
//               />
//             </>
//           )}

//           {/* Oscillation-only controls */}
//           {['oscillateUpDown','oscillateRightLeft','3DVertical','3DHorizontal'].includes(settings.direction) && (
//             <Slider
//               label="Oscillation Range"
//               min={0}
//               max={window.innerWidth / 4}
//               value={settings.oscillationRange}
//               onChange={v => setSettings(s => ({ ...s, oscillationRange: v }))}
//             />
//           )}

//           {/* Angle (degrees input, stored as radians) */}
//           <Slider
//             label="Angle (°)"
//             min={0}
//             max={360}
//             step={1}
//             value={(settings.angle * 180) / Math.PI}
//             onChange={v => setSettings(s => ({ ...s, angle: (v * Math.PI) / 180 }))}
//           />

//           {/* Speed & Size */}
//           <Slider
//             label="Speed"
//             min={1}
//             max={20}
//             step={1}
//             value={settings.speed}
//             onChange={v => setSettings(s => ({ ...s, speed: v }))}
//           />
//           <Slider
//             label="Size"
//             min={20}
//             max={200}
//             step={1}
//             value={settings.size}
//             onChange={v => setSettings(s => ({ ...s, size: v }))}
//           />

//           {/* Count if random layout */}
//           {settings.layoutSelect === 'random' && (
//             <Slider
//               label="Number of Shapes"
//               min={1}
//               max={100}
//               value={settings.numShapes}
//               onChange={v => setSettings(s => ({ ...s, numShapes: v }))}
//             />
//           )}

//           {/* Colors */}
//           <div className="space-y-1 text-xs">
//             <label>Background Color:</label>
//             <input
//               name="bgColor"
//               type="color"
//               value={settings.bgColor}
//               onChange={onColorChange}
//               className="w-full h-8 p-0 border rounded"
//             />
//           </div>
//           <div className="space-y-1 text-xs">
//             <label>Shape Color:</label>
//             <input
//               name="shapeColor"
//               type="color"
//               value={settings.shapeColor}
//               onChange={onColorChange}
//               className="w-full h-8 p-0 border rounded"
//             />
//           </div>
//           {settings.layoutSelect === 'checkboard' && (
//             <div className="space-y-1 text-xs">
//               <label>Second Color:</label>
//               <input
//                 name="secondColor"
//                 type="color"
//                 value={settings.secondColor}
//                 onChange={onColorChange}
//                 className="w-full h-8 p-0 border rounded"
//               />
//             </div>
//           )}

//           {/* Palette */}
//           <div className="space-y-1 text-xs">
//             <label>Palette:</label>
//             <select
//               value={settings.palette}
//               onChange={e => setSettings(s => ({ ...s, palette: e.target.value as any }))}
//               className="w-full border px-2 py-1 rounded"
//             >
//               <option value="none">None</option>
//               <option value="rainbow">Rainbow</option>
//               <option value="pastel">Pastel</option>
//             </select>
//           </div>

//           {/* Layout */}
//           <div className="space-y-1 text-xs">
//             <label>Layout:</label>
//             <select
//               value={settings.layoutSelect}
//               onChange={e => setSettings(s => ({ ...s, layoutSelect: e.target.value as any }))}
//               className="w-full border text-xs px-2 py-1 rounded"
//             >
//               <option value="random">Random</option>
//               <option value="regular">Regular</option>
//               <option value="checkboard">Checkboard</option>
//             </select>
//           </div>

//           {/* Grid offsets (non-random layouts) */}
//           {settings.layoutSelect !== 'random' && (
//             <>
//               <Slider
//                 label="Row Offset"
//                 min={0}
//                 max={100}
//                 value={settings.rowOffset}
//                 onChange={v => setSettings(s => ({ ...s, rowOffset: v }))}
//               />
//               <Slider
//                 label="Col Offset"
//                 min={0}
//                 max={100}
//                 value={settings.columnOffset}
//                 onChange={v => setSettings(s => ({ ...s, columnOffset: v }))}
//               />
//               <Slider
//                 label="Row Distance"
//                 min={0}
//                 max={100}
//                 value={settings.rowDistance}
//                 onChange={v => setSettings(s => ({ ...s, rowDistance: v }))}
//               />
//               <Slider
//                 label="Col Distance"
//                 min={0}
//                 max={100}
//                 value={settings.columnDistance}
//                 onChange={v => setSettings(s => ({ ...s, columnDistance: v }))}
//               />
//             </>
//           )}

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

// export default ControlPanelShape;



// // src/components/Therapy/ControlPanelShape.tsx
// // working version with the preset save and old in old version inside the code 
// import React, { useState, useEffect, ChangeEvent } from 'react';
// import { Collapse }      from 'react-collapse';
// import { db, storage }   from '../../firebase/firebase';
// import { useAuth }       from '../../data/AuthContext';
// import {
//   doc,
//   setDoc,
//   getDoc,
//   collection,
//   getDocs,
// } from 'firebase/firestore';
// import { ref, uploadBytes } from 'firebase/storage';
// import Papa              from 'papaparse';
// import Slider            from '../common/Slider';

// export interface Settings {
//   shapeType: 'circle' | 'square' | 'triangle' | 'chevron' | 'diamond';
//   direction:
//     | 'static'
//     | 'up'
//     | 'down'
//     | 'left'
//     | 'right'
//     | 'oscillateUpDown'
//     | 'oscillateRightLeft'
//     | 'circular'
//     | '3DVertical'
//     | '3DHorizontal';
//   rotationSpeed: number;
//   rotationRadius: number;
//   oscillationRange: number;
//   angle: number;     // radians
//   speed: number;
//   size: number;
//   numShapes: number;
//   bgColor: string;
//   shapeColor: string;
//   secondColor: string;
//   palette: 'none' | 'rainbow' | 'pastel';
//   layoutSelect: 'random' | 'regular' | 'checkboard';
//   rowOffset: number;
//   columnOffset: number;
//   rowDistance: number;
//   columnDistance: number;
// }

// type Msg = { message: string; type: 'success' | 'error' };

// interface ControlPanelShapeProps {
//   settings: Settings;
//   setSettings: React.Dispatch<React.SetStateAction<Settings>>;
//   startAnimation: () => void;
//   stopAnimation: () => void;
//   resetAnimation: () => void;
// }

// const ControlPanelShape: React.FC<ControlPanelShapeProps> = ({
//   settings,
//   setSettings,
//   startAnimation,
//   stopAnimation,
//   resetAnimation,
// }) => {
//   const [isOpen,     setIsOpen]     = useState(true);
//   const [presetName, setPresetName] = useState('');
//   const [presets,    setPresets]    = useState<string[]>([]);
//   const [msg,        setMsg]        = useState<Msg | null>(null);
//   const { currentUser } = useAuth();

//   // fetch all preset IDs
//   useEffect(() => {
//     if (!currentUser) return;
//     const refColl = collection(
//       db,
//       `users/${currentUser.uid}/shape-animation-settings`
//     );
//     getDocs(refColl)
//       .then(snap => setPresets(snap.docs.map(d => d.id)))
//       .catch(console.error);
//   }, [currentUser]);

//   // handlers
//   const savePreset = async () => {
//     if (!currentUser || !presetName) {
//       return setMsg({ message: 'Enter a name first.', type: 'error' });
//     }
//     const now = new Date().toISOString();
//     const payload = { ...settings, presetName, userId: currentUser.uid, timestamp: now };
//     try {
//       await setDoc(
//         doc(db, `users/${currentUser.uid}/shape-animation-settings/${presetName}`),
//         payload
//       );
//       // also upload CSV
//       const csv = Papa.unparse(
//         Object.entries(payload).map(([k, v]) => ({ setting: k, value: v }))
//       );
//       await uploadBytes(
//         ref(storage, `users/${currentUser.uid}/shape-animation-settings/${presetName}.csv`),
//         new Blob([csv], { type: 'text/csv' })
//       );
//       if (!presets.includes(presetName)) setPresets(ps => [...ps, presetName]);
//       setMsg({ message: 'Preset saved!', type: 'success' });
//     } catch (e) {
//       console.error(e);
//       setMsg({ message: 'Failed to save preset.', type: 'error' });
//     }
//   };

//   const loadPreset = async () => {
//     if (!currentUser || !presetName) {
//       return setMsg({ message: 'Select a preset first.', type: 'error' });
//     }
//     try {
//       const snap = await getDoc(
//         doc(db, `users/${currentUser.uid}/shape-animation-settings/${presetName}`)
//       );
//       if (!snap.exists()) {
//         setMsg({ message: 'Preset not found.', type: 'error' });
//       } else {
//         setSettings(snap.data() as Settings);
//         setMsg({ message: 'Preset loaded!', type: 'success' });
//       }
//     } catch (e) {
//       console.error(e);
//       setMsg({ message: 'Failed to load preset.', type: 'error' });
//     }
//   };

//   const onColorChange = (e: ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setSettings(s => ({ ...s, [name]: value }));
//   };

//   return (
//      <div className={`fixed right-4 top-2 p-4 rounded ${isOpen ? 'shadow-lg bg-transparent' : ''} w-60 z-50 h-full overflow-y-auto`}>
//       <button
//         onClick={() => setIsOpen(o => !o)}
//         className="w-full bg-gray-200 text-gray-700 text-xs py-2 rounded mb-4"
//       >
//         {isOpen ? 'Collapse Controls' : 'Expand Controls'}
//       </button>

//       <Collapse isOpened={isOpen}>
//         <div className="space-y-4">
//           {/* run controls */}
//            <div className="text-xs flex space-x-2">
//             <button onClick={startAnimation} className="flex-1 bg-green-500 text-white py-2 rounded">Start</button>
//             <button onClick={stopAnimation}  className="flex-1 bg-red-500   text-white py-2 rounded">Stop</button>
//             <button onClick={resetAnimation} className="flex-1 bg-gray-500  text-white py-2 rounded">Reset</button>
//           </div>

//           {/* preset name + buttons */}
//           <input
//             type="text"
//             placeholder="Preset name"
//             value={presetName}
//             onChange={e => setPresetName(e.target.value)}
//             className="w-full border px-2 py-1 rounded text-sm"
//           />
//              <div className=" text-xs flex space-x-2">
//             <button onClick={savePreset} className="bg-blue-500  text-xs text-white p-2 rounded w-1/2">Save Preset</button>
//             <button onClick={loadPreset} className="bg-yellow-500 text-xs text-white p-2 rounded w-1/2">Load Preset</button>
//           </div>
        
//           <select
//             value={presetName}
//             onChange={e => setPresetName(e.target.value)}
//             className="w-full border px-2 py-1 rounded text-sm"
//           >
//             <option value="">-- Select --</option>
//             {presets.map(p => (
//               <option key={p} value={p}>{p}</option>
//             ))}
//           </select>

//           {msg && (
//             <div className={`p-2 rounded text-sm ${
//               msg.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-xs-red-800'
//             }`}>
//               {msg.message}
//             </div>
//           )}

//           {/* shapeType */}
//           <div className="space-y-1 text-xs ">
//             <label>Select Shape:</label>
//             <select
//               value={settings.shapeType}
//               onChange={e =>
//                 setSettings(s => ({ ...s, shapeType: e.target.value as any }))
//               }
//               className="w-full border px-2 py-1 rounded"
//             >
//               <option value="circle">Circle</option>
//               <option value="square">Square</option>
//               <option value="triangle">Triangle</option>
//               <option value="chevron">Chevron</option>
//               <option value="diamond">Diamond</option>
//             </select>
//           </div>

//           {/* direction */}
//           <div className="space-y-1 text-xs ">
//             <label>Direction:</label>
//             <select
//               value={settings.direction}
//               onChange={e =>
//                 setSettings(s => ({ ...s, direction: e.target.value as any }))
//               }
//               className="w-full border text-xs  px-2 py-1 rounded"
//             >
//               <option value="static">Static</option>
//               <option value="up">Up</option>
//               <option value="down">Down</option>
//               <option value="left">Left</option>
//               <option value="right">Right</option>
//               <option value="oscillateUpDown">Oscillate Up/Down</option>
//               <option value="oscillateRightLeft">Oscillate L/R</option>
//               <option value="circular">Circular</option>
//               <option value="3DVertical">3D Vert.</option>
//               <option value="3DHorizontal">3D Horz.</option>
//             </select>
//           </div>

//           {/* circular only */}
//           {settings.direction === 'circular' && (
//             <>
//               <Slider
//                 label="Rotation Speed"
//                 min={0.01}
//                 max={1}
//                 step={0.01}
//                 value={settings.rotationSpeed}
//                 onChange={v => setSettings(s => ({ ...s, rotationSpeed: v }))}
//               />
//               <Slider
//                 label="Rotation Radius"
//                 min={10}
//                 max={500}
//                 value={settings.rotationRadius}
//                 onChange={v => setSettings(s => ({ ...s, rotationRadius: v }))}
//               />
//             </>
//           )}

//           {/* oscillation only */}
//           {['oscillateUpDown','oscillateRightLeft','3DVertical','3DHorizontal'].includes(settings.direction) && (
//             <Slider
//               label="Oscillation Range"
//               min={0}
//               max={window.innerWidth/4}
//               value={settings.oscillationRange}
//               onChange={v => setSettings(s => ({ ...s, oscillationRange: v }))}
//             />
//           )}

//           {/* angle */}
//           <Slider
//             label="Angle (°)"
//             min={0}
//             max={360}
//             step={1}
//             value={(settings.angle*180)/Math.PI}
//             onChange={v =>
//               setSettings(s => ({ ...s, angle: (v*Math.PI)/180 }))
//             }
//           />

//           {/* speed & size */}
//           <Slider
//             label="Speed"
//             min={1}
//             max={20}
//             step={1}
//             value={settings.speed}
//             onChange={v => setSettings(s => ({ ...s, speed: v }))}
//           />
//           <Slider
//             label="Size"
//             min={20}
//             max={200}
//             step={1}
//             value={settings.size}
//             onChange={v => setSettings(s => ({ ...s, size: v }))}
//           />

//           {/* count if random */}
//           {settings.layoutSelect === 'random' && (
//             <Slider
//               label="Number of Shapes"
//               min={1}
//               max={100}
//               value={settings.numShapes}
//               onChange={v => setSettings(s => ({ ...s, numShapes: v }))}
//             />
//           )}

//           {/* colors */}
//           <div className="space-y-1 text-xs ">
//             <label>Background Color:</label>
//             <input
//               name="bgColor"
//               type="color"
//               value={settings.bgColor}
//               onChange={onColorChange}
//               className="w-full h-8 p-0 border rounded"
//             />
//           </div>
//           <div className="space-y-1 text-xs ">
//             <label>Shape Color:</label>
//             <input
//               name="shapeColor"
//               type="color"
//               value={settings.shapeColor}
//               onChange={onColorChange}
//               className="w-full h-8 p-0 border rounded"
//             />
//           </div>
//           {settings.layoutSelect === 'checkboard' && (
//             <div className="space-y-1 text-xs ">
//               <label>Second Color:</label>
//               <input
//                 name="secondColor"
//                 type="color"
//                 value={settings.secondColor}
//                 onChange={onColorChange}
//                 className="w-full h-8 p-0 border rounded"
//               />
//             </div>
//           )}

//           {/* palette */}
//           <div className="space-y-1 text-xs ">
//             <label>Palette:</label>
//             <select
//               value={settings.palette}
//               onChange={e => setSettings(s => ({ ...s, palette: e.target.value as any }))}
//               className="w-full border px-2 py-1 rounded"
//             >
//               <option value="none">None</option>
//               <option value="rainbow">Rainbow</option>
//               <option value="pastel">Pastel</option>
//             </select>
//           </div>

//           {/* layout */}
//           <div className="space-y-1 text-xs ">
//             <label>Layout:</label>
//             <select
//               value={settings.layoutSelect}
//               onChange={e =>
//                 setSettings(s => ({ ...s, layoutSelect: e.target.value as any }))
//               }
//               className="w-full border  text-xs px-2 py-1 rounded"
//             >
//               <option value="random">Random</option>
//               <option value="regular">Regular</option>
//               <option value="checkboard">Checkboard</option>
//             </select>
//           </div>

//           {/* grid offsets */}
//           {settings.layoutSelect !== 'random' && (
//             <>
//               <Slider
//                 label="Row Offset"
//                 min={0}
//                 max={100}
//                 value={settings.rowOffset}
//                 onChange={v => setSettings(s => ({ ...s, rowOffset: v }))}
//               />
//               <Slider
//                 label="Col Offset"
//                 min={0}
//                 max={100}
//                 value={settings.columnOffset}
//                 onChange={v => setSettings(s => ({ ...s, columnOffset: v }))}
//               />
//               <Slider
//                 label="Row Distance"
//                 min={0}
//                 max={100}
//                 value={settings.rowDistance}
//                 onChange={v => setSettings(s => ({ ...s, rowDistance: v }))}
//               />
//               <Slider
//                 label="Col Distance"
//                 min={0}
//                 max={100}
//                 value={settings.columnDistance}
//                 onChange={v => setSettings(s => ({ ...s, columnDistance: v }))}
//               />
//             </>
//           )}
//         </div>
//       </Collapse>
//     </div>
//   );
// };

// export default ControlPanelShape;





//+++++++++++JS version+++++++++++++++++
 // src/components/Therapy/ControlPanelShape.jsx 
  // JS version

/* import React, { useState, useEffect } from 'react';
import { Collapse } from 'react-collapse';
import { db, storage } from '../../firebase/firebase';
import { useAuth } from '../../data/AuthContext';
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';
import Papa from 'papaparse';
import Slider from '../common/Slider';

const ControlPanelShape = ({
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
      if (currentUser) {
        try {
          const userDocsRef = collection(db, `users/${currentUser.uid}/shape-animation-settings`);
          const querySnapshot = await getDocs(userDocsRef);
          const presets = querySnapshot.docs.map(doc => doc.id);
          setPresetList(presets);
        } catch (err) {
          console.error('Error fetching preset names:', err);
        }
      }
    };
    fetchPresets();
  }, [currentUser]);

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
      const userDocRef = doc(db, `users/${currentUser.uid}/shape-animation-settings/current`);
      await setDoc(userDocRef, settingsWithTimestamp);

      const csvData = Object.keys(settingsWithTimestamp).map(key => ({
        setting: key,
        value: settingsWithTimestamp[key]
      }));
      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

      const csvRef = ref(storage, `users/${currentUser.uid}/shape-animation-settings/current.csv`);
      await uploadBytes(csvRef, blob);

      setMessage({ message: 'Current settings saved successfully!', type: 'success' });
    } catch (err) {
      console.error('Error saving current settings:', err);
      setMessage({ message: 'Error saving current settings. Please try again.', type: 'error' });
    }
  };

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
      const userDocRef = doc(db, `users/${currentUser.uid}/shape-animation-settings/${presetName}`);
      await setDoc(userDocRef, settingsWithTimestamp);

      const csvData = Object.keys(settingsWithTimestamp).map(key => ({
        setting: key,
        value: settingsWithTimestamp[key]
      }));
      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

      const csvRef = ref(storage, `users/${currentUser.uid}/shape-animation-settings/${presetName}.csv`);
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

  const loadCurrentSettings = async () => {
    try {
      const userDocRef = doc(db, `users/${currentUser.uid}/shape-animation-settings/current`);
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

  const loadPresetSettings = async () => {
    if (!presetName) {
      setMessage({ message: 'Please provide the name of the preset to load.', type: 'error' });
      return;
    }

    try {
      const userDocRef = doc(db, `users/${currentUser.uid}/shape-animation-settings/${presetName}`);
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

  const handleColorChange = (e) => {
    const { name, value } = e.target;
    setSettings((prevSettings) => ({
      ...prevSettings,
      [name]: value,
    }));
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
            <label className="block mb-2">Select Shape:</label>
            <select name="shapeType" value={settings.shapeType} onChange={(e) => setSettings({ ...settings, shapeType: e.target.value })} className="border p-2 rounded w-full">
              <option value="circle">Circle</option>
              <option value="square">Square</option>
              <option value="triangle">Triangle</option>
              <option value="chevron">Chevron</option>
              <option value="diamond">Diamond</option>
            </select>
          </div>
          <div className="control-group">
            <label className="block mb-2">Direction:</label>
            <select name="direction" value={settings.direction} onChange={(e) => setSettings({ ...settings, direction: e.target.value })} className="border p-2 rounded w-full">
              <option value="static">Static</option>
              <option value="up">Up</option>
              <option value="down">Down</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="oscillateUpDown">Oscillate Up and Down</option>
              <option value="oscillateRightLeft">Oscillate Right and Left</option>
              <option value="circular">Circular</option>
              <option value="3DVertical">3D Vertical</option>
              <option value="3DHorizontal">3D Horizontal</option>
            </select>
          </div>

          {settings.direction === 'circular' && (
            <>
              <div className="control-group">
                <label className="block mb-2">Rotation Speed:</label>
                <Slider
                  min={0.01}
                  max={1}
                  step={0.01}
                  value={settings.rotationSpeed}
                  onChange={(value) => setSettings({ ...settings, rotationSpeed: value })}
                  listId="rotationSpeedSteps"
                />
              </div>
              <div className="control-group">
                <label className="block mb-2">Rotation Radius:</label>
                <Slider
                  min={10}
                  max={500}
                  value={settings.rotationRadius}
                  onChange={(value) => setSettings({ ...settings, rotationRadius: value })}
                  listId="rotationRadiusSteps"
                />
              </div>
            </>
          )}

          {['oscillateUpDown', 'oscillateRightLeft', '3DVertical', '3DHorizontal'].includes(settings.direction) && (
            <div className="control-group">
              <label className="block mb-2">Oscillation Range:</label>
              <Slider
                min={0}
                max={settings.direction === 'oscillateUpDown' || settings.direction === '3DVertical' ? window.innerHeight / 4 : window.innerWidth / 4}
                value={settings.oscillationRange}
                onChange={(value) => setSettings({ ...settings, oscillationRange: value })}
                listId="oscillationRangeSteps"
              />
            </div>
          )}

          <div className="control-group">
            <label className="block mb-2">Angle:</label>
            <Slider
              min={0}
              max={360}
              step={1}
              value={settings.angle * (180 / Math.PI)}
              onChange={(value) => setSettings({ ...settings, angle: value * (Math.PI / 180) })}
              listId="angleSteps"
            />
          </div>

          <div className="control-group">
            <label className="block mb-2">Speed:</label>
            <Slider
              min={1}
              max={20}
              value={settings.speed}
              onChange={(value) => setSettings({ ...settings, speed: value })}
              listId="speedSteps"
            />
          </div>

          <div className="control-group">
            <label className="block mb-2">Size:</label>
            <Slider
              min={20}
              max={200}
              value={settings.size}
              onChange={(value) => setSettings({ ...settings, size: value })}
              listId="sizeSteps"
            />
          </div>

          {settings.layoutSelect === 'random' && (
            <div className="control-group">
              <label className="block mb-2">Number of Shapes:</label>
              <Slider
                min={1}
                max={100}
                value={settings.numShapes}
                onChange={(value) => setSettings({ ...settings, numShapes: value })}
                listId="numShapesSteps"
              />
            </div>
          )}

          <div className="control-group">
            <label className="block mb-2">Background Color:</label>
            <input
              type="color"
              name="bgColor"
              value={settings.bgColor}
              onChange={handleColorChange}
              className="w-full"
            />
          </div>

          <div className="control-group">
            <label className="block mb-2">Shape Color:</label>
            <input
              type="color"
              name="shapeColor"
              value={settings.shapeColor}
              onChange={handleColorChange}
              className="w-full"
            />
          </div>

          {settings.layoutSelect === 'checkboard' && (
            <div className="control-group">
              <label className="block mb-2">Second Shape Color:</label>
              <input
                type="color"
                name="secondColor"
                value={settings.secondColor}
                onChange={handleColorChange}
                className="w-full"
              />
            </div>
          )}

          <div className="control-group">
            <label className="block mb-2">Use Palette:</label>
            <select value={settings.palette} onChange={(e) => setSettings({ ...settings, palette: e.target.value })} className="border p-2 rounded w-full">
              <option value="none">None</option>
              <option value="rainbow">Rainbow</option>
              <option value="pastel">Pastel</option>
            </select>
          </div>
          <div className="control-group">
            <label className="block mb-2">Select Layout:</label>
            <select value={settings.layoutSelect} onChange={(e) => setSettings({ ...settings, layoutSelect: e.target.value })} className="border p-2 rounded w-full">
              <option value="random">random</option>
              <option value="regular">regular</option>
              <option value="checkboard">checkboard</option>
            </select>
          </div>
          {settings.layoutSelect !== 'random' && (
            <>
              <div className="control-group">
                <label className="block mb-2">Layout:</label>
                <select value={settings.layoutSelect} onChange={(e) => setSettings({ ...settings, layoutSelect: e.target.value })} className="border p-2 rounded w-full">
                  <option value="regular">Regular</option>
                  <option value="checkboard">Checkboard</option>
                </select>
              </div>
              
              <div className="control-group">
                <label className="block mb-2">Row Offset:</label>
                <Slider
                  min={0}
                  max={100}
                  value={settings.rowOffset}
                  onChange={(value) => setSettings({ ...settings, rowOffset: value })}
                  listId="rowOffsetSteps"
                />
              </div>

              <div className="control-group">
                <label className="block mb-2">Column Offset:</label>
                <Slider
                  min={0}
                  max={100}
                  value={settings.columnOffset}
                  onChange={(value) => setSettings({ ...settings, columnOffset: value })}
                  listId="columnOffsetSteps"
                />
              </div>

              <div className="control-group">
                <label className="block mb-2">Row Distance:</label>
                <Slider
                  min={0}
                  max={100}
                  value={settings.rowDistance}
                  onChange={(value) => setSettings({ ...settings, rowDistance: value })}
                  listId="rowDistanceSteps"
                />
              </div>

              <div className="control-group">
                <label className="block mb-2">Column Distance:</label>
                <Slider
                  min={0}
                  max={100}
                  value={settings.columnDistance}
                  onChange={(value) => setSettings({ ...settings, columnDistance: value })}
                  listId="columnDistanceSteps"
                />
              </div>
            </>
          )}
        </div>
      </Collapse>
    </div>
  );
};

export default ControlPanelShape; */

/* 
//last good one with all the saving presets 
import { Collapse } from 'react-collapse';
import { db, storage } from '../../firebase/firebase';
import { useAuth } from '../../data/AuthContext';
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';
import Papa from 'papaparse';
import Slider from '../common/Slider';

const ControlPanelShape = ({
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
      if (currentUser) {
        try {
          const userDocsRef = collection(db, `users/${currentUser.uid}/shape-animation-settings`);
          const querySnapshot = await getDocs(userDocsRef);
          const presets = querySnapshot.docs.map(doc => doc.id);
          setPresetList(presets);
        } catch (err) {
          console.error('Error fetching preset names:', err);
        }
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
      const userDocRef = doc(db, `users/${currentUser.uid}/shape-animation-settings/current`);
      await setDoc(userDocRef, settingsWithTimestamp);

      const csvData = Object.keys(settingsWithTimestamp).map(key => ({
        setting: key,
        value: settingsWithTimestamp[key]
      }));
      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

      const csvRef = ref(storage, `users/${currentUser.uid}/shape-animation-settings/current.csv`);
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
      const userDocRef = doc(db, `users/${currentUser.uid}/shape-animation-settings/${presetName}`);
      await setDoc(userDocRef, settingsWithTimestamp);

      const csvData = Object.keys(settingsWithTimestamp).map(key => ({
        setting: key,
        value: settingsWithTimestamp[key]
      }));
      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

      const csvRef = ref(storage, `users/${currentUser.uid}/shape-animation-settings/${presetName}.csv`);
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
      const userDocRef = doc(db, `users/${currentUser.uid}/shape-animation-settings/current`);
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
      const userDocRef = doc(db, `users/${currentUser.uid}/shape-animation-settings/${presetName}`);
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

  const handleColorChange = (e) => {
    const { name, value } = e.target;
    setSettings((prevSettings) => ({
      ...prevSettings,
      [name]: value,
    }));
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
            <label className="block mb-1 text-xs">Select Shape:</label>
            <select name="shapeType" value={settings.shapeType} onChange={(e) => setSettings({ ...settings, shapeType: e.target.value })} className="border p-2 rounded w-full">
              <option value="circle">Circle</option>
              <option value="square">Square</option>
              <option value="triangle">Triangle</option>
              <option value="chevron">Chevron</option>
              <option value="diamond">Diamond</option>
            </select>
          </div>
          <div className="control-group">
            <label className="block mb-1 text-xs">Direction:</label>
            <select name="direction" value={settings.direction} onChange={(e) => setSettings({ ...settings, direction: e.target.value })} className="border p-2 rounded w-full">
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
                <Slider
                  min={0.01}
                  max={1}
                  step={0.01}
                  value={settings.rotationSpeed}
                  onChange={(value) => setSettings({ ...settings, rotationSpeed: value })}
                  listId="rotationSpeedSteps"
                />
              </div>
              <div className="control-group">
                <label className="block mb-2">Rotation Radius:</label>
                <Slider
                  min={10}
                  max={500}
                  value={settings.rotationRadius}
                  onChange={(value) => setSettings({ ...settings, rotationRadius: value })}
                  listId="rotationRadiusSteps"
                />
              </div>
            </>
          )}

          {['oscillateUpDown', 'oscillateRightLeft'].includes(settings.direction) && (
            <div className="control-group">
              <label className="block mb-2">Oscillation Range:</label>
              <Slider
                min={0}
                max={settings.direction === 'oscillateUpDown' ? window.innerHeight / 2 : window.innerWidth / 2}
                value={settings.oscillationRange}
                onChange={(value) => setSettings({ ...settings, oscillationRange: value })}
                listId="oscillationRangeSteps"
              />
            </div>
          )}

          <div className="control-group">
            <label className="block mb-2">Angle:</label>
            <Slider
              min={0}
              max={360}
              step={1}
              value={settings.angle * (180 / Math.PI)}
              onChange={(value) => setSettings({ ...settings, angle: value * (Math.PI / 180) })}
              listId="angleSteps"
            />
          </div>

          <div className="control-group">
            <label className="block mb-2">Speed:</label>
            <Slider
              min={1}
              max={20}
              value={settings.speed}
              onChange={(value) => setSettings({ ...settings, speed: value })}
              listId="speedSteps"
            />
          </div>

          <div className="control-group">
            <label className="block mb-2">Size:</label>
            <Slider
              min={20}
              max={200}
              value={settings.size}
              onChange={(value) => setSettings({ ...settings, size: value })}
              listId="sizeSteps"
            />
          </div>

          {settings.layoutSelect === 'random' && (
            <div className="control-group">
              <label className="block mb-2">Number of Shapes:</label>
              <Slider
                min={1}
                max={100}
                value={settings.numShapes}
                onChange={(value) => setSettings({ ...settings, numShapes: value })}
                listId="numShapesSteps"
              />
            </div>
          )}

          <div className="control-group">
            <label className="block mb-2">Background Color:</label>
            <input
              type="color"
              name="bgColor"
              value={settings.bgColor}
              onChange={handleColorChange}
              className="w-full"
            />
          </div>

          <div className="control-group">
            <label className="block mb-2">Shape Color:</label>
            <input
              type="color"
              name="shapeColor"
              value={settings.shapeColor}
              onChange={handleColorChange}
              className="w-full"
            />
          </div>

          {settings.layoutSelect === 'checkboard' && (
            <div className="control-group">
              <label className="block mb-2">Second Shape Color:</label>
              <input
                type="color"
                name="secondColor"
                value={settings.secondColor}
                onChange={handleColorChange}
                className="w-full"
              />
            </div>
          )}

          <div className="control-group">
            <label className="block mb-2">Use Palette:</label>
            <select value={settings.palette} onChange={(e) => setSettings({ ...settings, palette: e.target.value })} className="border p-2 rounded w-full">
              <option value="none">None</option>
              <option value="rainbow">Rainbow</option>
              <option value="pastel">Pastel</option>
            </select>
          </div>
          <div className="control-group">
            <label className="block mb-2">Select Layout:</label>
            <select value={settings.layoutSelect} onChange={(e) => setSettings({ ...settings, palette: e.target.value })} className="border p-2 rounded w-full">
              <option value="random">random</option>
              <option value="regular">regular</option>
              <option value="checkboard">checkboard</option>
            </select>
          </div>
          {settings.layoutSelect !== 'random' && (
            <>
              <div className="control-group">
                <label className="block mb-2">Layout:</label>
                <select value={settings.layoutSelect} onChange={(e) => setSettings({ ...settings, layoutSelect: e.target.value })} className="border p-2 rounded w-full">
                  <option value="regular">Regular</option>
                  <option value="checkboard">Checkboard</option>
                </select>
              </div>
              
              <div className="control-group">
                <label className="block mb-2">Row Offset:</label>
                <Slider
                  min={0}
                  max={100}
                  value={settings.rowOffset}
                  onChange={(value) => setSettings({ ...settings, rowOffset: value })}
                  listId="rowOffsetSteps"
                />
              </div>

              <div className="control-group">
                <label className="block mb-2">Column Offset:</label>
                <Slider
                  min={0}
                  max={100}
                  value={settings.columnOffset}
                  onChange={(value) => setSettings({ ...settings, columnOffset: value })}
                  listId="columnOffsetSteps"
                />
              </div>

              <div className="control-group">
                <label className="block mb-2">Row Distance:</label>
                <Slider
                  min={0}
                  max={100}
                  value={settings.rowDistance}
                  onChange={(value) => setSettings({ ...settings, rowDistance: value })}
                  listId="rowDistanceSteps"
                />
              </div>

              <div className="control-group">
                <label className="block mb-2">Column Distance:</label>
                <Slider
                  min={0}
                  max={100}
                  value={settings.columnDistance}
                  onChange={(value) => setSettings({ ...settings, columnDistance: value })}
                  listId="columnDistanceSteps"
                />
              </div>
            </>
          )}
        </div>
      </Collapse>
    </div>
  );
};

export default ControlPanelShape;
 */







/* import React, { useState } from 'react';
import { Collapse } from 'react-collapse';

const ControlPanelShape = ({ settings, setSettings, startAnimation, stopAnimation, resetAnimation }) => {
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
            <label className="block mb-2">Select Shape:</label>
            <select value={settings.shapeType} onChange={(e) => setSettings({ ...settings, shapeType: e.target.value })} className="border p-2 rounded w-full">
              <option value="circle">Circle</option>
              <option value="square">Square</option>
              <option value="triangle">Triangle</option>
              <option value="chevron">Chevron</option>
              <option value="diamond">Diamond</option>
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
                <input type="range" min="0.01" max="1" step="0.01" value={settings.rotationSpeed} onChange={(e) => setSettings({ ...settings, rotationSpeed: parseFloat(e.target.value) })} className="w-full"/>
                <span>{settings.rotationSpeed.toFixed(2)}</span>
              </div>
              <div className="control-group">
                <label className="block mb-2">Rotation Radius:</label>
                <input type="range" min="10" max="500" value={settings.rotationRadius} onChange={(e) => setSettings({ ...settings, rotationRadius: parseFloat(e.target.value) })} className="w-full"/>
                <span>{settings.rotationRadius}</span>
              </div>
            </>
          )}
          {(settings.direction === 'oscillateUpDown' || settings.direction === 'oscillateRightLeft') && (
            <div className="control-group">
              <label className="block mb-2">Oscillation Range :</label>
              <input type="range" min="0" max={Math.min(window.innerWidth / 2, window.innerHeight / 2)} value={settings. oscillationRange } onChange={(e) => setSettings({ ...settings,  oscillationRange : parseFloat(e.target.value) })} className="w-full"/>
              <span>{settings. oscillationRange }</span>
            </div>
          )}
          
          <div className="control-group">
            <label className="block mb-2">Angle:</label>
            <input type="range" min="0" max="360" value={settings.angle} step="1" onChange={(e) => setSettings({ ...settings, angle: parseFloat(e.target.value) })} className="w-full"/>
            <span>{settings.angle}</span>
          </div>
          <div className="control-group">
            <label className="block mb-2">Speed:</label>
            <input type="range" min="1" max="20" value={settings.speed} onChange={(e) => setSettings({ ...settings, speed: parseFloat(e.target.value) })} className="w-full"/>
            <span>{settings.speed}</span>
          </div>
          <div className="control-group">
            <label className="block mb-2">Size:</label>
            <input type="range" min="20" max="200" value={settings.size} onChange={(e) => setSettings({ ...settings, size: parseFloat(e.target.value) })} className="w-full"/>
            <span>{settings.size}</span>
          </div>
          {settings.layoutSelect !== 'random' && (
            <>
              <div className="control-group">
                <label className="block mb-2">Row Offset:</label>
                <input type="range" min="0" max="100" value={settings.rowOffset} onChange={(e) => setSettings({ ...settings, rowOffset: parseFloat(e.target.value) })} className="w-full"/>
                <span>{settings.rowOffset}</span>
              </div>
              <div className="control-group">
                <label className="block mb-2">Column Offset:</label>
                <input type="range" min="0" max="100" value={settings.columnOffset} onChange={(e) => setSettings({ ...settings, columnOffset: parseFloat(e.target.value) })} className="w-full"/>
                <span>{settings.columnOffset}</span>
              </div>
              <div className="control-group">
                <label className="block mb-2">Row Distance:</label>
                <input type="range" min="0" max="100" value={settings.rowDistance} onChange={(e) => setSettings({ ...settings, rowDistance: parseFloat(e.target.value) })} className="w-full"/>
                <span>{settings.rowDistance}</span>
              </div>
              <div className="control-group">
                <label className="block mb-2">Column Distance:</label>
                <input type="range" min="0" max="100" value={settings.columnDistance} onChange={(e) => setSettings({ ...settings, columnDistance: parseFloat(e.target.value) })} className="w-full"/>
                <span>{settings.columnDistance}</span>
              </div>
            </>
          )}
          <div className="control-group">
            <label className="block mb-2">Background Color:</label>
            <input type="color" value={settings.bgColor} onChange={(e) => setSettings({ ...settings, bgColor: e.target.value })} className="w-full"/>
          </div>
          <div className="control-group">
            <label className="block mb-2">Shape Color:</label>
            <input type="color" value={settings.shapeColor} onChange={(e) => setSettings({ ...settings, shapeColor: e.target.value })} className="w-full"/>
          </div>
          {settings.layoutSelect === 'checkboard' && (
            <div className="control-group">
              <label className="block mb-2">Second Shape Color:</label>
              <input type="color" value={settings.secondColor} onChange={(e) => setSettings({ ...settings, secondColor: e.target.value })} className="w-full"/>
            </div>
          )}
          <div className="control-group">
            <label className="block mb-2">Use Palette:</label>
            <select value={settings.palette} onChange={(e) => setSettings({ ...settings, palette: e.target.value })} className="border p-2 rounded w-full">
              <option value="none">None</option>
              <option value="rainbow">Rainbow</option>
              <option value="pastel">Pastel</option>
            </select>
          </div>
          {settings.layoutSelect !== 'random' && (
            <div className="control-group">
              <label className="block mb-2">Layout:</label>
              <select value={settings.layoutSelect} onChange={(e) => setSettings({ ...settings, layoutSelect: e.target.value })} className="border p-2 rounded w-full">
                <option value="regular">Regular</option>
                <option value="checkboard">Checkboard</option>
              </select>
            </div>
          )}
        </div>
      </Collapse>
    </div>

    
  );
};

export default ControlPanelShape; */


/* 
 import React, { useState } from 'react';
import { Collapse } from 'react-collapse';

const ControlPanelShape = ({ settings, setSettings, startAnimation, stopAnimation, resetAnimation }) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    const parsedValue = type === 'number' ? parseFloat(value) : value;
    setSettings((prevSettings) => ({
      ...prevSettings,
      [name]: parsedValue,
    }));
  };

  const handleColorChange = (e) => {
    const { name, value } = e.target;
    setSettings((prevSettings) => ({
      ...prevSettings,
      [name]: value,
    }));
  };

  const showRotationControls = settings.direction === 'circular';
  const showOscillationControls = settings.direction === 'oscillateUpDown' || settings.direction === 'oscillateRightLeft';
  const showRowColumnControls = settings.layoutSelect !== 'random';
  const showSecondColor = settings.layoutSelect === 'checkboard';

  return (
    <div className={`fixed right-4 top-2 p-4 rounded ${isOpen ? 'shadow-lg bg-transparent' : ''} w-60 z-50 h-full overflow-y-auto`}>
      <button onClick={() => setIsOpen(!isOpen)} className="mb-2 bg-gray-200 p-2 border p-2 rounded w-full">
        {isOpen ? 'Collapse Controls' : 'Expand Controls'}
      </button>
      <Collapse isOpened={isOpen}>
         <div className="animation-buttons mt-4">
          <button onClick={startAnimation} className="bg-green-500 text-s--white p-2 rounded mr-2 w-half">Start</button>
          <button onClick={stopAnimation} className="bg-red-500 text-s-white p-2 rounded mr-2 w-half">Stop</button>
          <button onClick={resetAnimation} className="bg-gray-500 text-s-white p-2 rounded w-half">Reset</button>
        </div>
         <div className="control-group">
          <label className=" block mb-1 text-xs">Select Shape:</label>
          <select name="shapeType" value={settings.shapeType} onChange={handleInputChange} className="border p-2 rounded w-full">
            <option value="circle">Circle</option>
            <option value="square">Square</option>
            <option value="triangle">Triangle</option>
            <option value="chevron">Chevron</option>
            <option value="diamond">Diamond</option>
          </select>
        </div>
        <div className="control-group">
          <label className=" block mb-1 text-xs">Direction:</label>
          <select name="direction" value={settings.direction} onChange={handleInputChange} className="border p-2 rounded w-full">
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
        {showRotationControls && (
          <>
            <div className="control-group">
              <label className=" block mb-1 text-xs">Rotation Speed:</label>
              <input type="range" name="rotationSpeed" min="0.01" max="0.1" step="0.01" value={settings.rotationSpeed} onChange={handleInputChange} className="w-full" />
            </div>
            <div className="control-group">
              <label className=" block mb-1 text-xs">Rotation Radius:</label>
              <input type="range" name="rotationRadius" min="10" max="300" value={settings.rotationRadius} onChange={handleInputChange} className="w-full" />
            </div>
          </>
        )}
        {showOscillationControls && (
          <div className="control-group">
            <label className=" block mb-1 text-xs">Oscillation Range :</label>
            <input type="range" name=" oscillationRange " min="0" max={Math.min(window.innerWidth / 2, window.innerHeight / 2)} value={settings. oscillationRange } onChange={handleInputChange} className="w-full" />
          </div>
        )}
        <div className="control-group">
          <label className=" block mb-1 text-xs">Angle:</label>
          <input type="range" name="angle" min="0" max="360" value={settings.angle} step="1" onChange={handleInputChange} className="w-full" />
        </div>
        <div className="control-group">
          <label className=" block mb-1 text-xs">Speed:</label>
          <input type="range" name="speed" min="1" max="20" value={settings.speed} onChange={handleInputChange} className="w-full" />
        </div>
        <div className="control-group">
          <label className=" block mb-1 text-xs">Size:</label>
          <input type="range" name="size" min="20" max="200" value={settings.size} onChange={handleInputChange} className="w-full" />
        </div>
        {!showRowColumnControls && (
          <div className="control-group">
            <label className=" block mb-1 text-xs">Number of Shapes:</label>
            <input type="range" name="numShapes" min="1" max="100" value={settings.numShapes} onChange={handleInputChange} className="w-full" />
          </div>
        )}
        <div className="control-group">
          <label className=" block mb-1 text-xs">Background Color:</label>
          <input type="color" name="bgColor" value={settings.bgColor} onChange={handleColorChange} className="w-full" />
        </div>
        <div className="control-group">
          <label className=" block mb-1 text-xs">Shape Color:</label>
          <input type="color" name="shapeColor" value={settings.shapeColor} onChange={handleColorChange} className="w-full" />
        </div>
        {showSecondColor && (
          <div className="control-group">
            <label className=" block mb-1 text-xs">Second Shape Color:</label>
            <input type="color" name="secondColor" value={settings.secondColor} onChange={handleColorChange} className="w-full" />
          </div>
        )}
        <div className="control-group">
          <label className=" block mb-1 text-xs">Use Palette:</label>
          <select name="palette" value={settings.palette} onChange={handleInputChange} className="border p-2 rounded w-full">
            <option value="none">None</option>
            <option value="rainbow">Rainbow</option>
            <option value="pastel">Pastel</option>
          </select>
        </div>
        {showRowColumnControls && (
          <>
            <div className="control-group">
              <label className=" block mb-1 text-xs">Row Offset:</label>
              <input type="range" name="rowOffset" min="0" max="100" value={settings.rowOffset} onChange={handleInputChange} className="w-full" />
            </div>
            <div className="control-group">
              <label className=" block mb-1 text-xs">Column Offset:</label>
              <input type="range" name="columnOffset" min="0" max="100" value={settings.columnOffset} onChange={handleInputChange} className="w-full" />
            </div>
            <div className="control-group">
              <label className=" block mb-1 text-xs">Row Distance:</label>
              <input type="range" name="rowDistance" min="0" max="100" value={settings.rowDistance} onChange={handleInputChange} className="w-full" />
            </div>
            <div className="control-group">
              <label className=" block mb-1 text-xs">Column Distance:</label>
              <input type="range" name="columnDistance" min="0" max="100" value={settings.columnDistance} onChange={handleInputChange} className="w-full" />
            </div>
          </>
        )}
        <div className="control-group">
          <label className=" block mb-1 text-xs">Layout:</label>
          <select name="layoutSelect" value={settings.layoutSelect} onChange={handleInputChange} className="border p-2 rounded w-full">
            <option value="random">Random</option>
            <option value="regular">Regular</option>
            <option value="checkboard">Checkboard</option>
          </select>
        </div>
      
      </Collapse>
    </div>
  );
};

export default ControlPanelShape;
  */