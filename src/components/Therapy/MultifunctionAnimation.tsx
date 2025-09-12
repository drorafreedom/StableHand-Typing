// src/components/Therapy/MultifunctionAnimation.tsx
//added to fit the height in case one line or so 
import React, { useCallback, useState } from 'react';
import ControlPanel from './ControlPanel';
import { ReactP5Wrapper } from 'react-p5-wrapper';

export interface Settings {
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
  angle: number;            // radians
  amplitude: number;
  frequency: number;
  speed: number;
  thickness: number;
  phaseOffset: number;
  numLines: number;
  distance: number;
  bgColor: string;
  lineColor: string;
  selectedPalette: 'none' | 'rainbow' | 'pastel';
  rotationSpeed: number;    // for circular
  rotationRadius: number;   // for circular
  oscillationRange: number; // for oscillations
  groups: number;           // number of line groups
  groupDistance: number;    // distance between groups

  // NEW
  yOffsetPx?: number;       // vertical nudge (px), +down / -up
  fitHeight?: boolean;      // auto-scale amplitude to fill viewport
}

 export const DEFAULTS: Settings = {
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

  // NEW defaults
  yOffsetPx: 0,
  fitHeight: false,
};

// Make a fresh copy for resets (avoid sharing object refs)
export const cloneDefaults = (): Settings => ({ ...DEFAULTS });

type Props = {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
};

const MultifunctionAnimation: React.FC<Props> = ({ settings, setSettings }) => {
  const [running, setRunning] = useState(true);
  const [resetKey, setResetKey] = useState(0); // bump to rewind time in sketch

  const startAnimation = () => setRunning(true);
  const stopAnimation  = () => setRunning(false);
  const resetAnimation = () => {
    setSettings(cloneDefaults()); // reset the panel/props
    setResetKey((k) => k + 1);    // rewind time in p5
    setRunning(false);            // pause after reset (like other modules)
  };

  const sketch = useCallback((p5: any) => {
    // Local sketch state (NOT React state)
    let t = 0;                     // time accumulator
    let current: Settings = cloneDefaults();
    let isRunning = true;
    let lastResetKey = -1;

    // motion offsets
    let x = 0;
    let yOffset = 0;

    const palettes: Record<'rainbow'|'pastel', string[]> = {
      rainbow: [
        '#FF0000','#FF7F00','#FFFF00','#7FFF00','#00FF00','#00FF7F',
        '#00FFFF','#007FFF','#0000FF','#7F00FF','#FF00FF','#FF007F'
      ],
      pastel: [
        '#FFD1DC','#FFABAB','#FFC3A0','#FF677D','#D4A5A5',
        '#392F5A','#31A2AC','#61C0BF','#6B4226','#ACD8AA'
      ],
    };

    p5.setup = () => {
      p5.createCanvas(p5.windowWidth, p5.windowHeight);
      p5.noStroke();
      p5.frameRate(60);
      yOffset = p5.height / 2; // center on load
    };

    // p5-wrapper will pass our props here
    p5.updateWithProps = (props: any) => {
      if (props && props.settings) current = props.settings;
      if (typeof props.running === 'boolean') isRunning = props.running;

      if (typeof props.resetKey === 'number' && props.resetKey !== lastResetKey) {
        // rewind time & reset offsets
        t = 0;
        x = 0;
        yOffset = p5.height / 2;
        lastResetKey = props.resetKey;
      }
    };

    const move = () => {
      // freeze motion when paused
      if (!isRunning) return;

      switch (current.direction) {
        case 'static':
          yOffset = p5.height / 2;
          break;

        case 'up':
          yOffset -= current.speed;
          if (yOffset < -p5.height) yOffset += p5.height;
          break;

        case 'down':
          yOffset += current.speed;
          if (yOffset > p5.height) yOffset -= p5.height;
          break;

        case 'left':
          x -= current.speed;
          if (x < -p5.width) x += p5.width;
          break;

        case 'right':
          x += current.speed;
          if (x > p5.width) x -= p5.width;
          break;

        case 'oscillateUpDown':
          yOffset = p5.height / 2 + current.oscillationRange * p5.sin(t);
          t += current.speed / 100;
          break;

        case 'oscillateRightLeft':
          x = p5.width / 2 + current.oscillationRange * p5.sin(t);
          t += current.speed / 100;
          break;

        case 'circular': {
          const tt = t * current.rotationSpeed;
          x = p5.width  / 2 + current.rotationRadius * p5.cos(tt);
          yOffset = p5.height / 2 + current.rotationRadius * p5.sin(tt);
          t += current.speed / 100;
          break;
        }
      }
    };

    p5.draw = () => {
      const w = p5.width;
      const h = p5.height;
      const centerX = w / 2;
      const centerY = h / 2;

      p5.clear();
      p5.background(p5.color(current.bgColor));
      p5.strokeWeight(current.thickness);

      move(); // updates x/yOffset/t based on current + isRunning

      const usePalette = current.selectedPalette !== 'none';
      const palette = current.selectedPalette === 'rainbow'
        ? palettes.rainbow
        : palettes.pastel;

      // --- auto amplitude (for "cover whole page" when numLines is small)
      const stackHeight =
        ((current.groups - 1) * (current.groupDistance || 0)) +
        ((current.numLines - 1) * (current.distance || 0));
      const margin = 20;
      const autoAmp = Math.max(5, (h / 2) - (stackHeight / 2) - margin);
      const amp = current.fitHeight ? autoAmp : current.amplitude;

      for (let g = 0; g < current.groups; g++) {
        for (let i = 0; i < current.numLines; i++) {
          // set stroke per line
          if (usePalette) {
            const col = palette[i % palette.length];
            p5.stroke(p5.color(col));
          } else {
            p5.stroke(p5.color(current.lineColor));
          }

          p5.noFill();
          p5.beginShape();

          for (let j = 0; j <= w; j++) {
            const k = (j + x + current.phaseOffset * i) / current.frequency;

            // wave families
            let wave = 0;
            switch (current.waveType) {
              case 'sine':    wave = p5.sin(k) * amp; break;
              case 'tan':     wave = p5.tan(k) * (amp / 4); break;
              case 'cotan':   wave = (1 / p5.tan(k)) * (amp / 4); break;
              case 'sawtooth':wave = ((k / p5.PI) % 2 - 1) * amp; break;
              case 'square':  wave = (p5.sin(k) >= 0 ? 1 : -1) * (amp / 2); break;
              case 'triangle':wave = (2 * amp / p5.PI) * p5.asin(p5.sin(k)); break;
            }

            // NOTE: removed the hidden “(g - 2)” nudge.
            const baseY =
              yOffset + (current.yOffsetPx || 0) +
              g * current.groupDistance +
              i * current.distance;

            // rotate around center by current.angle
            const cosA = Math.cos(current.angle);
            const sinA = Math.sin(current.angle);
            const rx = (j - centerX) * cosA - (wave) * sinA + centerX;
            const ry = (j - centerX) * sinA + (wave + baseY - centerY) * cosA + centerY;

            p5.vertex(rx, ry);
          }

          p5.endShape();
        }
      }
    };

    p5.windowResized = () => {
      p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
      yOffset = p5.height / 2;
    };
  }, []);

  return (
    <div className="relative">
      <ControlPanel
        settings={settings}
        setSettings={setSettings}
        startAnimation={startAnimation}
        stopAnimation={stopAnimation}
        resetAnimation={resetAnimation}
      />

      <ReactP5Wrapper
        sketch={sketch}
        settings={settings}   // <- the source of truth comes from TherapyPage
        running={running}     // <- start/stop without stale closures
        resetKey={resetKey}   // <- bump to rewind time
      />
    </div>
  );
};

export default MultifunctionAnimation;


// // src/components/Therapy/MultifunctionAnimation.tsx
// //final for opacity and export to save 
// import React, { useCallback, useState } from 'react';
// import ControlPanel from './ControlPanel';
// import { ReactP5Wrapper } from 'react-p5-wrapper';
// import { hexToRgba } from '../../utils/color'; // <<< ADD

// export interface Settings {
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
//   angle: number;            // radians
//   amplitude: number;
//   frequency: number;
//   speed: number;
//   thickness: number;
//   phaseOffset: number;
//   numLines: number;
//   distance: number;
//   bgColor: string;
//   lineColor: string;
//   selectedPalette: 'none' | 'rainbow' | 'pastel';
//   rotationSpeed: number;
//   rotationRadius: number;
//   oscillationRange: number;
//   groups: number;
//   groupDistance: number;
    

//   // <<< ADD (optional-safe: old presets still work)
//   bgOpacity?: number;                       // 0..1
//   lineOpacity?: number;                     // 0..1
//   lineOpacityMode?: 'constant' | 'pulse';   // default 'constant'
//   lineOpacitySpeed?: number;                // >=0 (default 1)
// }

// const DEFAULTS: Settings = {
//   waveType: 'sine',
//   direction: 'static',
//   angle: 0,
//   amplitude: 10,
//   frequency: 10,
//   speed: 5,
//   thickness: 1,
//   phaseOffset: 0,
//   numLines: 1,
//   distance: 0,
//   bgColor: '#ffffff',
//   lineColor: '#FF0000',
//   selectedPalette: 'none',
//   rotationSpeed: 0.02,
//   rotationRadius: 150,
//   oscillationRange: 100,
//   groups: 1,
//   groupDistance: 100,

//   // <<< ADD defaults
//   bgOpacity: 1,
//   lineOpacity: 1,
//   lineOpacityMode: 'constant',
//   lineOpacitySpeed: 1,
// };

// const cloneDefaults = (): Settings => ({ ...DEFAULTS });

// type Props = {
//   settings: Settings;
//   setSettings: React.Dispatch<React.SetStateAction<Settings>>;
// };

// const MultifunctionAnimation: React.FC<Props> = ({ settings, setSettings }) => {
//   const [running, setRunning] = useState(true);
//   const [resetKey, setResetKey] = useState(0);

//   const startAnimation = () => setRunning(true);
//   const stopAnimation  = () => setRunning(false);
//   const resetAnimation = () => {
//     setSettings(cloneDefaults());
//     setResetKey((k) => k + 1);
//     setRunning(false);
//   };

//   const sketch = useCallback((p5: any) => {
//     let t = 0;        // motion time
//     let tAlpha = 0;   // opacity time (separate so pulsing works even if motion is static)
//     let current: Settings = cloneDefaults();
//     let isRunning = true;
//     let lastResetKey = -1;

//     let x = 0;
//     let yOffset = 0;

//     const palettes: Record<'rainbow'|'pastel', string[]> = {
//       rainbow: [
//         '#FF0000','#FF7F00','#FFFF00','#7FFF00','#00FF00','#00FF7F',
//         '#00FFFF','#007FFF','#0000FF','#7F00FF','#FF00FF','#FF007F'
//       ],
//       pastel: [
//         '#FFD1DC','#FFABAB','#FFC3A0','#FF677D','#D4A5A5',
//         '#392F5A','#31A2AC','#61C0BF','#6B4226','#ACD8AA'
//       ],
//     };

//     p5.setup = () => {
//       p5.createCanvas(p5.windowWidth, p5.windowHeight);
//       p5.noStroke();
//       p5.frameRate(60);
//     };

//     p5.updateWithProps = (props: any) => {
//       if (props && props.settings) current = props.settings;
//       if (typeof props.running === 'boolean') isRunning = props.running;

//       if (typeof props.resetKey === 'number' && props.resetKey !== lastResetKey) {
//         t = 0;
//         tAlpha = 0;
//         x = 0;
//         yOffset = p5.height / 2;
//         lastResetKey = props.resetKey;
//       }
//     };

//     const move = () => {
//       if (!isRunning) return;

//       switch (current.direction) {
//         case 'static':
//           yOffset = p5.height / 2;
//           break;
//         case 'up':
//           yOffset -= current.speed;
//           if (yOffset < -p5.height) yOffset += p5.height;
//           break;
//         case 'down':
//           yOffset += current.speed;
//           if (yOffset > p5.height) yOffset -= p5.height;
//           break;
//         case 'left':
//           x -= current.speed;
//           if (x < -p5.width) x += p5.width;
//           break;
//         case 'right':
//           x += current.speed;
//           if (x > p5.width) x -= p5.width;
//           break;
//         case 'oscillateUpDown':
//           yOffset = p5.height / 2 + current.oscillationRange * p5.sin(t);
//           t += current.speed / 100;
//           break;
//         case 'oscillateRightLeft':
//           x = p5.width / 2 + current.oscillationRange * p5.sin(t);
//           t += current.speed / 100;
//           break;
//         case 'circular': {
//           const tt = t * current.rotationSpeed;
//           x = p5.width  / 2 + current.rotationRadius * p5.cos(tt);
//           yOffset = p5.height / 2 + current.rotationRadius * p5.sin(tt);
//           t += current.speed / 100;
//           break;
//         }
//       }

//       // advance opacity time for pulsing
//       tAlpha += 0.02 * (current.lineOpacitySpeed ?? 1);
//     };

//     p5.draw = () => {
//       const w = p5.width;
//       const h = p5.height;
//       const centerX = w / 2;
//       const centerY = h / 2;

//       // --- background with opacity (same approach as Baseline)
//       const bgA = typeof current.bgOpacity === 'number' ? current.bgOpacity : 1;
//       const bgRgba = hexToRgba(current.bgColor || '#000000', bgA);
//       p5.clear();
//       p5.background(p5.color(bgRgba));

//       p5.strokeWeight(current.thickness);

//       move();

//       const usePalette = current.selectedPalette !== 'none';
//       const palette = current.selectedPalette === 'rainbow'
//         ? palettes.rainbow
//         : palettes.pastel;

//       // compute line alpha (0..1)
//       let lineAlpha = typeof current.lineOpacity === 'number' ? current.lineOpacity : 1;
//       const mode = current.lineOpacityMode || 'constant';
//       if (mode === 'pulse') {
//         const pulse = (p5.sin(tAlpha) + 1) * 0.5; // 0..1
//         lineAlpha = Math.max(0, Math.min(1, lineAlpha * pulse));
//       }
//       const lineAlpha255 = Math.round(255 * lineAlpha);

//       for (let g = 0; g < (current.groups ?? 1); g++) {
//         for (let i = 0; i < (current.numLines ?? 1); i++) {
//           // stroke color (with alpha)
//           let col = usePalette
//             ? p5.color(palette[i % palette.length])
//             : p5.color(current.lineColor || '#ffffff');
//           col.setAlpha(lineAlpha255);
//           p5.stroke(col);

//           p5.noFill();
//           p5.beginShape();

//           for (let j = 0; j <= w; j++) {
//             const k = (j + x + (current.phaseOffset ?? 0) * i) / (current.frequency || 1);

//             let wave = 0;
//             switch (current.waveType) {
//               case 'sine':    wave = p5.sin(k) * current.amplitude; break;
//               case 'tan':     wave = p5.tan(k) * (current.amplitude / 4); break;
//               case 'cotan':   wave = (1 / p5.tan(k)) * (current.amplitude / 4); break;
//               case 'sawtooth':wave = ((k / p5.PI) % 2 - 1) * current.amplitude; break;
//               case 'square':  wave = (p5.sin(k) >= 0 ? 1 : -1) * (current.amplitude / 2); break;
//               case 'triangle':wave = (2 * current.amplitude / p5.PI) * p5.asin(p5.sin(k)); break;
//               default:        wave = p5.sin(k) * current.amplitude;
//             }

//             const baseY = yOffset + (g - 2) * (current.groupDistance ?? 0) + i * (current.distance ?? 0);

//             const cosA = Math.cos(current.angle || 0);
//             const sinA = Math.sin(current.angle || 0);
//             const rx = (j - centerX) * cosA - wave * sinA + centerX;
//             const ry = (j - centerX) * sinA + (wave + baseY - centerY) * cosA + centerY;

//             p5.vertex(rx, ry);
//           }

//           p5.endShape();
//         }
//       }
//     };

//     p5.windowResized = () => {
//       p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
//     };
//   }, []);

//   return (
//     <div className="relative">
//       <ControlPanel
//         settings={settings}
//         setSettings={setSettings}
//         startAnimation={() => setRunning(true)}
//         stopAnimation={() => setRunning(false)}
//         resetAnimation={resetAnimation}
//       />
//       <ReactP5Wrapper sketch={sketch} settings={settings} running={running} resetKey={resetKey} />
//     </div>
//   );
// };

// export default MultifunctionAnimation;

// src/components/Therapy/MultifunctionAnimation.tsx
// added opacity option and opacity pulsing / constatnt 
// import React, { useCallback, useState } from 'react';
// import ControlPanel from './ControlPanel';
// import { ReactP5Wrapper } from 'react-p5-wrapper';
// import { hexToRgba } from '../../utils/color';

// export interface Settings {
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
//   angle: number;            // radians
//   amplitude: number;
//   frequency: number;
//   speed: number;
//   thickness: number;
//   phaseOffset: number;
//   numLines: number;
//   distance: number;
//   bgColor: string;
//   lineColor: string;
//   selectedPalette: 'none' | 'rainbow' | 'pastel';
//   rotationSpeed: number;    // for circular
//   rotationRadius: number;   // for circular
//   oscillationRange: number; // for oscillations
//   groups: number;           // number of line groups
//   groupDistance: number;    // distance between groups

//   // NEW — opacity controls (kept optional-safe for older saved presets)
//   bgOpacity?: number;                      // 0..1 (default 1)
//   lineOpacity?: number;                    // 0..1 (default 1)
//   lineOpacityMode?: 'constant' | 'pulse';  // default 'constant'
//   lineOpacitySpeed?: number;               // >=0 (default 1)
// }

// const DEFAULTS: Settings = {
//   waveType: 'sine',
//   direction: 'static',
//   angle: 0,
//   amplitude: 10,
//   frequency: 10,
//   speed: 5,
//   thickness: 1,
//   phaseOffset: 0,
//   numLines: 1,
//   distance: 0,
//   bgColor: '#ffffff',
//   lineColor: '#FF0000',
//   selectedPalette: 'none',
//   rotationSpeed: 0.02,
//   rotationRadius: 150,
//   oscillationRange: 100,
//   groups: 1,
//   groupDistance: 100,

//   // NEW defaults
//   bgOpacity: 1,
//   lineOpacity: 1,
//   lineOpacityMode: 'constant',
//   lineOpacitySpeed: 1,
// };

// // Make a fresh copy for resets (avoid sharing object refs)
// const cloneDefaults = (): Settings => ({ ...DEFAULTS });

// type Props = {
//   settings: Settings;
//   setSettings: React.Dispatch<React.SetStateAction<Settings>>;
// };

// const MultifunctionAnimation: React.FC<Props> = ({ settings, setSettings }) => {
//   const [running, setRunning] = useState(true);
//   const [resetKey, setResetKey] = useState(0); // bump to rewind time in sketch

//   const startAnimation = () => setRunning(true);
//   const stopAnimation  = () => setRunning(false);
//   const resetAnimation = () => {
//     setSettings(cloneDefaults()); // reset the panel/props
//     setResetKey((k) => k + 1);    // rewind time in p5
//     setRunning(false);            // pause after reset (like other modules)
//   };

//   const sketch = useCallback((p5: any) => {
//     // Local sketch state (NOT React state)
//     let t = 0;                     // time accumulator for motion
//     let tAlpha = 0;                // independent time for opacity pulsing
//     let current: Settings = cloneDefaults();
//     let isRunning = true;
//     let lastResetKey = -1;

//     // motion offsets
//     let x = 0;
//     let yOffset = 0;

//     const palettes: Record<'rainbow'|'pastel', string[]> = {
//       rainbow: [
//         '#FF0000','#FF7F00','#FFFF00','#7FFF00','#00FF00','#00FF7F',
//         '#00FFFF','#007FFF','#0000FF','#7F00FF','#FF00FF','#FF007F'
//       ],
//       pastel: [
//         '#FFD1DC','#FFABAB','#FFC3A0','#FF677D','#D4A5A5',
//         '#392F5A','#31A2AC','#61C0BF','#6B4226','#ACD8AA'
//       ],
//     };

//     p5.setup = () => {
//       p5.createCanvas(p5.windowWidth, p5.windowHeight);
//       p5.noStroke();
//       p5.frameRate(60);
//     };

//     // p5-wrapper will pass our props here
//     p5.updateWithProps = (props: any) => {
//       if (props && props.settings) current = props.settings;
//       if (typeof props.running === 'boolean') isRunning = props.running;

//       if (typeof props.resetKey === 'number' && props.resetKey !== lastResetKey) {
//         // rewind time & reset offsets
//         t = 0;
//         tAlpha = 0;
//         x = 0;
//         yOffset = p5.height / 2;
//         lastResetKey = props.resetKey;
//       }
//     };

//     const move = () => {
//       // freeze motion when paused
//       if (!isRunning) return;

//       switch (current.direction) {
//         case 'static':
//           // keep at center (don’t drift)
//           yOffset = p5.height / 2;
//           break;

//         case 'up':
//           yOffset -= current.speed;
//           if (yOffset < -p5.height) yOffset += p5.height;
//           break;

//         case 'down':
//           yOffset += current.speed;
//           if (yOffset > p5.height) yOffset -= p5.height;
//           break;

//         case 'left':
//           x -= current.speed;
//           if (x < -p5.width) x += p5.width;
//           break;

//         case 'right':
//           x += current.speed;
//           if (x > p5.width) x -= p5.width;
//           break;

//         case 'oscillateUpDown':
//           yOffset = p5.height / 2 + current.oscillationRange * p5.sin(t);
//           t += current.speed / 100;
//           break;

//         case 'oscillateRightLeft':
//           x = p5.width / 2 + current.oscillationRange * p5.sin(t);
//           t += current.speed / 100;
//           break;

//         case 'circular': {
//           const tt = t * current.rotationSpeed;
//           x = p5.width  / 2 + current.rotationRadius * p5.cos(tt);
//           yOffset = p5.height / 2 + current.rotationRadius * p5.sin(tt);
//           t += current.speed / 100;
//           break;
//         }
//       }

//       // advance opacity time separately so pulse still works when motion is static
//       tAlpha += 0.02 * (current.lineOpacitySpeed ?? 1);
//     };

//     p5.draw = () => {
//       const w = p5.width;
//       const h = p5.height;
//       const centerX = w / 2;
//       const centerY = h / 2;

//       // ---- background with opacity (same style as Baseline using hexToRgba)
//       const bgA = typeof current.bgOpacity === 'number' ? current.bgOpacity : 1;
//       const bgRgba = hexToRgba(current.bgColor || '#000000', bgA);
//       p5.clear();
//       p5.background(p5.color(bgRgba));

//       p5.strokeWeight(current.thickness);

//       move(); // updates x/yOffset/t + tAlpha

//       const usePalette = current.selectedPalette !== 'none';
//       const palette = current.selectedPalette === 'rainbow'
//         ? palettes.rainbow
//         : palettes.pastel;

//       // compute current line alpha (0..1)
//       let lineAlpha = typeof current.lineOpacity === 'number' ? current.lineOpacity : 1;
//       const mode = current.lineOpacityMode || 'constant';
//       if (mode === 'pulse') {
//         const pulse = (p5.sin(tAlpha) + 1) * 0.5; // 0..1
//         lineAlpha = Math.max(0, Math.min(1, lineAlpha * pulse));
//       }
//       const lineAlpha255 = Math.round(255 * lineAlpha);

//       for (let g = 0; g < (current.groups ?? 1); g++) {
//         for (let i = 0; i < (current.numLines ?? 1); i++) {
//           // set stroke per line (with alpha)
//           let col = usePalette
//             ? p5.color(palette[i % palette.length])
//             : p5.color(current.lineColor || '#ffffff');
//           col.setAlpha(lineAlpha255);
//           p5.stroke(col);

//           p5.noFill();
//           p5.beginShape();

//           for (let j = 0; j <= w; j++) {
//             const k = (j + x + (current.phaseOffset ?? 0) * i) / (current.frequency || 1);

//             // wave families
//             let wave = 0;
//             switch (current.waveType) {
//               case 'sine':    wave = p5.sin(k) * current.amplitude; break;
//               case 'tan':     wave = p5.tan(k) * (current.amplitude / 4); break;
//               case 'cotan':   wave = (1 / p5.tan(k)) * (current.amplitude / 4); break;
//               case 'sawtooth':wave = ((k / p5.PI) % 2 - 1) * current.amplitude; break;
//               case 'square':  wave = (p5.sin(k) >= 0 ? 1 : -1) * (current.amplitude / 2); break;
//               case 'triangle':wave = (2 * current.amplitude / p5.PI) * p5.asin(p5.sin(k)); break;
//               default:        wave = p5.sin(k) * current.amplitude;
//             }

//             // NOTE: keep your original “-2 groups offset” comment/logic
//             const baseY = yOffset + (g - 2) * (current.groupDistance ?? 0) + i * (current.distance ?? 0);

//             // rotate around center by current.angle
//             const cosA = Math.cos(current.angle || 0);
//             const sinA = Math.sin(current.angle || 0);
//             const rx = (j - centerX) * cosA - (wave) * sinA + centerX;
//             const ry = (j - centerX) * sinA + (wave + baseY - centerY) * cosA + centerY;

//             p5.vertex(rx, ry);
//           }

//           p5.endShape();
//         }
//       }
//     };

//     p5.windowResized = () => {
//       p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
//     };
//   }, []);

//   return (
//     <div className="relative">
//       <ControlPanel
//         settings={settings}
//         setSettings={setSettings}
//         startAnimation={startAnimation}
//         stopAnimation={stopAnimation}
//         resetAnimation={resetAnimation}
//       />

//       <ReactP5Wrapper
//         sketch={sketch}
//         settings={settings}   // <- the source of truth comes from TherapyPage
//         running={running}     // <- start/stop without stale closures
//         resetKey={resetKey}   // <- bump to rewind time
//       />
//     </div>
//   );
// };

// export default MultifunctionAnimation;



//  // src/components/Therapy/MultifunctionAnimation.tsx
// import React, { useCallback, useState } from 'react';
// import ControlPanel from './ControlPanel';
// import { ReactP5Wrapper } from 'react-p5-wrapper';

// export interface Settings {
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
//   angle: number;            // radians
//   amplitude: number;
//   frequency: number;
//   speed: number;
//   thickness: number;
//   phaseOffset: number;
//   numLines: number;
//   distance: number;
//   bgColor: string;
//   lineColor: string;
//   selectedPalette: 'none' | 'rainbow' | 'pastel';
//   rotationSpeed: number;    // for circular
//   rotationRadius: number;   // for circular
//   oscillationRange: number; // for oscillations
//   groups: number;           // number of line groups
//   groupDistance: number;    // distance between groups
// }

// const DEFAULTS: Settings = {
//   waveType: 'sine',
//   direction: 'static',
//   angle: 0,
//   amplitude: 10,
//   frequency: 10,
//   speed: 5,
//   thickness: 1,
//   phaseOffset: 0,
//   numLines: 1,
//   distance: 0,
//   bgColor: '#ffffff',
//   lineColor: '#FF0000',
//   selectedPalette: 'none',
//   rotationSpeed: 0.02,
//   rotationRadius: 150,
//   oscillationRange: 100,
//   groups: 1,
//   groupDistance: 100,
// };

// // Make a fresh copy for resets (avoid sharing object refs)
// const cloneDefaults = (): Settings => ({ ...DEFAULTS });

// type Props = {
//   settings: Settings;
//   setSettings: React.Dispatch<React.SetStateAction<Settings>>;
// };

// const MultifunctionAnimation: React.FC<Props> = ({ settings, setSettings }) => {
//   const [running, setRunning] = useState(true);
//   const [resetKey, setResetKey] = useState(0); // bump to rewind time in sketch

//   const startAnimation = () => setRunning(true);
//   const stopAnimation  = () => setRunning(false);
//   const resetAnimation = () => {
//     setSettings(cloneDefaults()); // reset the panel/props
//     setResetKey((k) => k + 1);    // rewind time in p5
//     setRunning(false);            // pause after reset (like other modules)
//   };

//   const sketch = useCallback((p5: any) => {
//     // Local sketch state (NOT React state)
//     let t = 0;                     // time accumulator
//     let current: Settings = cloneDefaults();
//     let isRunning = true;
//     let lastResetKey = -1;

//     // motion offsets
//     let x = 0;
//     let yOffset = 0;

//     const palettes: Record<'rainbow'|'pastel', string[]> = {
//       rainbow: [
//         '#FF0000','#FF7F00','#FFFF00','#7FFF00','#00FF00','#00FF7F',
//         '#00FFFF','#007FFF','#0000FF','#7F00FF','#FF00FF','#FF007F'
//       ],
//       pastel: [
//         '#FFD1DC','#FFABAB','#FFC3A0','#FF677D','#D4A5A5',
//         '#392F5A','#31A2AC','#61C0BF','#6B4226','#ACD8AA'
//       ],
//     };

//     p5.setup = () => {
//       p5.createCanvas(p5.windowWidth, p5.windowHeight);
//       p5.noStroke();
//       p5.frameRate(60);
//     };

//     // p5-wrapper will pass our props here
//     p5.updateWithProps = (props: any) => {
//       if (props && props.settings) current = props.settings;
//       if (typeof props.running === 'boolean') isRunning = props.running;

//       if (typeof props.resetKey === 'number' && props.resetKey !== lastResetKey) {
//         // rewind time & reset offsets
//         t = 0;
//         x = 0;
//         yOffset = p5.height / 2;
//         lastResetKey = props.resetKey;
//       }
//     };

//     const move = () => {
//       // freeze motion when paused
//       if (!isRunning) return;

//       switch (current.direction) {
//         case 'static':
//           // keep at center (don’t drift)
//           yOffset = p5.height / 2;
//           break;

//         case 'up':
//           yOffset -= current.speed;
//           if (yOffset < -p5.height) yOffset += p5.height;
//           break;

//         case 'down':
//           yOffset += current.speed;
//           if (yOffset > p5.height) yOffset -= p5.height;
//           break;

//         case 'left':
//           x -= current.speed;
//           if (x < -p5.width) x += p5.width;
//           break;

//         case 'right':
//           x += current.speed;
//           if (x > p5.width) x -= p5.width;
//           break;

//         case 'oscillateUpDown':
//           yOffset = p5.height / 2 + current.oscillationRange * p5.sin(t);
//           t += current.speed / 100;
//           break;

//         case 'oscillateRightLeft':
//           x = p5.width / 2 + current.oscillationRange * p5.sin(t);
//           t += current.speed / 100;
//           break;

//         case 'circular': {
//           const tt = t * current.rotationSpeed;
//           x = p5.width  / 2 + current.rotationRadius * p5.cos(tt);
//           yOffset = p5.height / 2 + current.rotationRadius * p5.sin(tt);
//           t += current.speed / 100;
//           break;
//         }
//       }
//     };

//     p5.draw = () => {
//       const w = p5.width;
//       const h = p5.height;
//       const centerX = w / 2;
//       const centerY = h / 2;

//       p5.clear();
//       p5.background(p5.color(current.bgColor));
//       p5.strokeWeight(current.thickness);

//       move(); // updates x/yOffset/t based on current + isRunning

//       const usePalette = current.selectedPalette !== 'none';
//       const palette = current.selectedPalette === 'rainbow'
//         ? palettes.rainbow
//         : palettes.pastel;

//       for (let g = 0; g < current.groups; g++) {
//         for (let i = 0; i < current.numLines; i++) {
//           // set stroke per line
//           if (usePalette) {
//             const col = palette[i % palette.length];
//             p5.stroke(p5.color(col));
//           } else {
//             p5.stroke(p5.color(current.lineColor));
//           }

//           p5.noFill();
//           p5.beginShape();

//           for (let j = 0; j <= w; j++) {
//             const k = (j + x + current.phaseOffset * i) / current.frequency;

//             // wave families
//             let wave = 0;
//             switch (current.waveType) {
//               case 'sine':    wave = p5.sin(k) * current.amplitude; break;
//               case 'tan':     wave = p5.tan(k) * (current.amplitude / 4); break;
//               case 'cotan':   wave = (1 / p5.tan(k)) * (current.amplitude / 4); break;
//               case 'sawtooth':wave = ((k / p5.PI) % 2 - 1) * current.amplitude; break;
//               case 'square':  wave = (p5.sin(k) >= 0 ? 1 : -1) * (current.amplitude / 2); break;
//               case 'triangle':wave = (2 * current.amplitude / p5.PI) * p5.asin(p5.sin(k)); break;
//             }
// //add -2 sp ot wo;; start om tje ,odd;e pf the text box 
//             const baseY = yOffset + (g -2)  * current.groupDistance + i * current.distance;

//             // rotate around center by current.angle
//             const cosA = Math.cos(current.angle);
//             const sinA = Math.sin(current.angle);
//             const rx = (j - centerX) * cosA - (wave) * sinA + centerX;
//             const ry = (j - centerX) * sinA + (wave + baseY - centerY) * cosA + centerY;

//             p5.vertex(rx, ry);
//           }

//           p5.endShape();
//         }
//       }
//     };

//     p5.windowResized = () => {
//       p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
//     };
//   }, []);

//   return (
//     <div className="relative">
//       <ControlPanel
//         settings={settings}
//         setSettings={setSettings}
//         startAnimation={startAnimation}
//         stopAnimation={stopAnimation}
//         resetAnimation={resetAnimation}
//       />

//       <ReactP5Wrapper
//         sketch={sketch}
//         settings={settings}   // <- the source of truth comes from TherapyPage
//         running={running}     // <- start/stop without stale closures
//         resetKey={resetKey}   // <- bump to rewind time
//       />
//     </div>
//   );
// };

// export default MultifunctionAnimation;

// // src/components/Therapy/MultifunctionAnimation.tsx

// import React, { useState, useEffect,useCallback } from 'react';
// import ControlPanel from './ControlPanel';
// import { ReactP5Wrapper } from 'react-p5-wrapper';

// interface Settings {
//   waveType: string;
//   direction: string;
//   angle: number;
//   amplitude: number;
//   frequency: number;
//   speed: number;
//   thickness: number;
//   phaseOffset: number;
//   numLines: number;
//   distance: number;
//   bgColor: string;
//   lineColor: string;
//   selectedPalette: string;
//   rotationSpeed: number;
//   rotationRadius: number;
//   oscillationRange: number;
//   groups: number;
//   groupDistance: number;
// }

// const MultifunctionAnimation: React.FC = () => {
//   const defaultSettings: Settings = {
//     waveType: 'sine',
//     direction: 'static',
//     angle: 0,
//     amplitude: 10,
//     frequency: 10,
//     speed: 5,
//     thickness: 1,
//     phaseOffset: 0,
//     numLines: 1,
//     distance: 0,
//     bgColor: '#ffffff',
//     lineColor: '#FF0000',
//     selectedPalette: 'none',
//     rotationSpeed: 0.02,
//     rotationRadius: 150,
//     oscillationRange: 100,
//     groups: 1,
//     groupDistance: 100,
//   };

//   const [settings, setSettings] = useState<Settings>(defaultSettings);
//   const [isAnimating, setIsAnimating] = useState<boolean>(true);

//  const sketch = useCallback((p5: any) => {
//     let x = 0;
//     let yOffset = p5.height / 2;
//     let time = 0;

//     const palettes: Record<string, string[]> = {
//       rainbow: ["#FF0000", "#FF7F00", "#FFFF00", "#7FFF00", "#00FF00", "#00FF7F", "#00FFFF", "#007FFF", "#0000FF", "#7F00FF", "#FF00FF", "#FF007F"],
//       pastel: ["#FFD1DC", "#FFABAB", "#FFC3A0", "#FF677D", "#D4A5A5", "#392F5A", "#31A2AC", "#61C0BF", "#6B4226", "#ACD8AA"]
//     };

//     p5.setup = () => {
//       p5.createCanvas(p5.windowWidth, p5.windowHeight);
//       p5.noLoop();
//     };

//     p5.updateWithProps = (props: { settings: Settings; isAnimating: boolean }) => {
//       if (props.settings) {
//         Object.assign(settings, props.settings);
//       }
//       if (props.isAnimating !== undefined) {
//         if (props.isAnimating) {
//           p5.loop();
//         } else {
//           p5.noLoop();
//         }
//       }
//     };

//     const move = () => {
//       switch (settings.direction) {
//         case 'static':
//           yOffset = p5.height / 2;
//           break;
//         case 'up':
//           yOffset -= settings.speed;
//           if (yOffset < -p5.height) yOffset += p5.height;
//           break;
//         case 'down':
//           yOffset += settings.speed;
//           if (yOffset > p5.height) yOffset -= p5.height;
//           break;
//         case 'left':
//           x -= settings.speed;
//           if (x < -p5.width) x += p5.width;
//           break;
//         case 'right':
//           x += settings.speed;
//           if (x > p5.width) x -= p5.width;
//           break;
//         case 'oscillateUpDown':
//           yOffset = p5.height / 2 + settings.oscillationRange * p5.sin(time);
//           time += settings.speed / 100;
//           break;
//         case 'oscillateRightLeft':
//           x = p5.width / 2 + settings.oscillationRange * p5.sin(time);
//           time += settings.speed / 100;
//           break;
//         case 'circular':
//           x = p5.width / 2 + settings.rotationRadius * p5.cos(time * settings.rotationSpeed);
//           yOffset = p5.height / 2 + settings.rotationRadius * p5.sin(time * settings.rotationSpeed);
//           time += settings.speed / 100;
//           break;
//         default:
//           break;
//       }
//     };

//     p5.draw = () => {
//       if (!isAnimating) return;
// // Drawing your wave or other animation
// p5.noFill();
//       p5.clear();
//       p5.background(p5.color(settings.bgColor));
//       p5.stroke(p5.color(settings.lineColor));
//       p5.strokeWeight(settings.thickness);

//       const centerX = p5.width / 2;
//       const centerY = p5.height / 2;

//       move();

//       for (let g = 0; g < settings.groups; g++) {
//         for (let i = 0; i < settings.numLines; i++) {
//           p5.beginShape();
//           for (let j = 0; j <= p5.width; j++) {
//             const k = (j + x + settings.phaseOffset * i) / settings.frequency;
//             let sineValue;

//             switch (settings.waveType) {
//               case 'sine':
//                 sineValue = p5.sin(k) * settings.amplitude;
//                 break;
//               case 'tan':
//                 sineValue = p5.tan(k) * settings.amplitude / 4;
//                 break;
//               case 'cotan':
//                 sineValue = (1 / p5.tan(k)) * settings.amplitude / 4;
//                 break;
//               case 'sawtooth':
//                 sineValue = ((k / p5.PI) % 2 - 1) * settings.amplitude;
//                 break;
//               case 'square':
//                 sineValue = (p5.sin(k) >= 0 ? 1 : -1) * settings.amplitude / 2;
//                 break;
//               case 'triangle':
//                 sineValue = (2 * settings.amplitude / p5.PI) * p5.asin(p5.sin(k));
//                 break;
//               default:
//                 sineValue = p5.sin(k) * settings.amplitude;
//             }

//             const baseY = yOffset + g * settings.groupDistance + i * settings.distance;
//             const rotatedX = (j - centerX) * p5.cos(settings.angle) - sineValue * p5.sin(settings.angle) + centerX;
//             const rotatedY = (j - centerX) * p5.sin(settings.angle) + (sineValue + baseY - centerY) * p5.cos(settings.angle) + centerY;

//             p5.vertex(rotatedX, rotatedY);
//           }
//           if (settings.selectedPalette !== 'none') {
//             p5.stroke(p5.color(palettes[settings.selectedPalette][i % palettes[settings.selectedPalette].length]));
//           } else {
//             p5.stroke(p5.color(settings.lineColor));
//           }
//           p5.endShape();
//         }
//       }
//     };

//     p5.windowResized = () => {
//       p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
//     };
//   },[]);

//   const startAnimation = () => setIsAnimating(true);
//   const stopAnimation = () => setIsAnimating(false);
//   const resetAnimation = () => {
//     setSettings(defaultSettings);
//     setIsAnimating(true);
//   };

//   return (
//     <div className="relative">
//       <ControlPanel
//         settings={settings}
//         setSettings={setSettings}
//         startAnimation={startAnimation}
//         stopAnimation={stopAnimation}
//         resetAnimation={resetAnimation}
//       />
//       <ReactP5Wrapper sketch={sketch} settings={settings} isAnimating={isAnimating} />
//     </div>
//   );
// };

// export default MultifunctionAnimation;



//+++++++++++JS version+++++++++++++++++
 // src/components/Therapy/MultifunctionAnimation.jsx 
  // JS version

// import React, { useState, useEffect } from 'react';
// import ControlPanel from './ControlPanel';
// import { ReactP5Wrapper } from 'react-p5-wrapper';

// const MultifunctionAnimation = () => {
//   const defaultSettings = {
//     waveType: 'sine',
//     direction: 'static',
//     angle: 0,
//     amplitude: 10,
//     frequency: 10,
//     speed: 5, // Increased speed for up/down directions
//     thickness: 1,
//     phaseOffset: 0,
//     numLines: 1,
//     distance: 0,
//     bgColor: '#FFFFFF',
//     lineColor: '#FF0000',
//     selectedPalette: 'none',
//     rotationSpeed: 0.02,
//     rotationRadius: 150,
//     oscillationRange: 100,
//     groups: 1,
//     groupDistance: 100, // New setting for group distance
//   };

//   const [settings, setSettings] = useState(defaultSettings);
//   const [isAnimating, setIsAnimating] = useState(true);

//   const sketch = (p5) => {
//     let x = 0;
//     let yOffset = p5.height / 2; // Adjust this value to position the animation higher
//     let time = 0;

//     const palettes = {
//       rainbow: ["#FF0000", "#FF7F00", "#FFFF00", "#7FFF00", "#00FF00", "#00FF7F", "#00FFFF", "#007FFF", "#0000FF", "#7F00FF", "#FF00FF", "#FF007F"],
//       pastel: ["#FFD1DC", "#FFABAB", "#FFC3A0", "#FF677D", "#D4A5A5", "#392F5A", "#31A2AC", "#61C0BF", "#6B4226", "#ACD8AA"]
//     };

//     p5.setup = () => {
//       p5.createCanvas(p5.windowWidth, p5.windowHeight);
//       p5.noLoop(); // Ensure the animation starts stopped
//     };

//     p5.updateWithProps = (props) => {
//       if (props.settings) {
//         Object.assign(settings, props.settings);
//       }
//       if (props.isAnimating !== undefined) {
//         if (props.isAnimating) {
//           p5.loop();
//         } else {
//           p5.noLoop();
//         }
//       }
//     };

//     const move = () => {
//       switch (settings.direction) {
//         case 'static':
//           yOffset = p5.height / 2;
//           break;
//         case 'up':
//           yOffset -= settings.speed;
//           if (yOffset < -p5.height) yOffset += p5.height;
//           break;
//         case 'down':
//           yOffset += settings.speed;
//           if (yOffset > p5.height) yOffset -= p5.height;
//           break;
//         case 'left':
//           x -= settings.speed;
//           if (x < -p5.width) x += p5.width;
//           break;
//         case 'right':
//           x += settings.speed;
//           if (x > p5.width) x -= p5.width;
//           break;
//         case 'oscillateUpDown':
//           yOffset = p5.height / 2 + settings.oscillationRange * p5.sin(time);
//           console.log('Oscillating Up/Down:', { yOffset, time });
//           time += settings.speed / 100; // Adjust increment for smooth oscillation
//           break;
//         case 'oscillateRightLeft':
//           x = p5.width / 2 + settings.oscillationRange * p5.sin(time);
//           console.log('Oscillating Right/Left:', { x, time });
//           time += settings.speed / 100; // Adjust increment for smooth oscillation
//           break;
//         case 'circular':
//           x = p5.width / 2 + settings.rotationRadius * p5.cos(time * settings.rotationSpeed);
//           yOffset = p5.height / 2 + settings.rotationRadius * p5.sin(time * settings.rotationSpeed);
//           console.log('Circular:', { x, yOffset, time });
//           time += settings.speed / 100; // Adjust increment for smooth rotation
//           break;
//         default:
//           break;
//       }
//     };
    
//     p5.draw = () => {
//       if (!isAnimating) return;

//       p5.clear();
//       p5.background(p5.color(settings.bgColor)); // Ensure background is applied correctly
//       p5.stroke(p5.color(settings.lineColor)); // Ensure line color is set correctly
//       p5.strokeWeight(settings.thickness);

//       const centerX = p5.width / 2;
//       const centerY = p5.height / 2;

//       move(); // Move the waves based on the direction

//       for (let g = 0; g < settings.groups; g++) {
//         let groupYOffset = yOffset + g * settings.groupDistance;
//         for (let i = 0; i < settings.numLines; i++) {
//           p5.beginShape();
//           for (let j = 0; j <= p5.width; j++) {
//             const k = ((j + x + settings.phaseOffset * i) / settings.frequency);
//             let sineValue;
//             switch (settings.waveType) {
//               case 'sine':
//                 sineValue = p5.sin(k) * settings.amplitude;
//                 break;
//               case 'tan':
//                 sineValue = p5.tan(k) * settings.amplitude / 4;
//                 break;
//               case 'cotan':
//                 sineValue = (1 / p5.tan(k)) * settings.amplitude / 4;
//                 break;
//               case 'sawtooth':
//                 sineValue = ((k / p5.PI) % 2 - 1) * settings.amplitude;
//                 break;
//               case 'square':
//                 sineValue = (p5.sin(k) >= 0 ? 1 : -1) * settings.amplitude / 2;
//                 break;
//               case 'triangle':
//                 sineValue = (2 * settings.amplitude / p5.PI) * p5.asin(p5.sin(k));
//                 break;
//               default:
//                 sineValue = p5.sin(k) * settings.amplitude;
//             }

//             let baseY = yOffset + g * settings.groupDistance + i * settings.distance;
//             if (baseY > p5.height) baseY -= p5.height;
//             if (baseY < 0) baseY += p5.height;
//             const rotatedX = (j - centerX) * p5.cos(settings.angle) - sineValue * p5.sin(settings.angle) + centerX;
//             const rotatedY = (j - centerX) * p5.sin(settings.angle) + (sineValue + baseY - centerY) * p5.cos(settings.angle) + centerY;

//             p5.vertex(rotatedX, rotatedY);
//           }
//           if (settings.selectedPalette !== 'none') {
//             p5.stroke(p5.color(palettes[settings.selectedPalette][i % palettes[settings.selectedPalette].length]));
//           } else {
//             p5.stroke(p5.color(settings.lineColor));
//           }
//           p5.endShape();
//         }
//       }

//       p5.strokeWeight(1);
//       p5.stroke(0, 0, 0, 0); // Transparent color
//       p5.noFill();
//       p5.rect(0, 0, p5.windowWidth, p5.windowHeight);
//     };

//     p5.windowResized = () => {
//       p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
//       p5.background(p5.color(settings.bgColor));
//     };
//   };

//   const resetAnimationValues = () => {
//     x = 0;
//     yOffset = 0; // Adjust this value to position the animation higher
//     time = 0;
//   };

//   const startAnimation = () => {
//     setIsAnimating(true);
//   };

//   const stopAnimation = () => {
//     setIsAnimating(false);
//   };

// /*   const stopAnimation = () => {
//     setIsAnimating(false);
//     // Redraw the last frame to retain the current canvas state
//     if (p5Instance.current) {
//       p5Instance.current.noLoop();
//       p5Instance.current.redraw();
//     }
//   }; */
//   const resetAnimation = () => {
//     setSettings(defaultSettings);
//     resetAnimationValues();
//     setIsAnimating(true);
//   };

//   useEffect(() => {
//     setIsAnimating(true);
//   }, []);

//   return (
//     <div className="relative">
//       <ControlPanel
//         settings={settings}
//         setSettings={setSettings}
//         startAnimation={startAnimation}
//         stopAnimation={stopAnimation}
//         resetAnimation={resetAnimation}
//       />
//       <ReactP5Wrapper sketch={sketch} settings={settings} isAnimating={isAnimating} />
//     </div>
//   );
// };

// export default MultifunctionAnimation;



/* // asimple animation using differnt type of sketchin . and yes the white trail
import React, { useState, useEffect } from 'react';
import ControlPanel from './ControlPanel';
import { ReactP5Wrapper } from 'react-p5-wrapper';

const MultifunctionAnimation = () => {
  const defaultSettings = {
    waveType: 'sine',
    direction: 'static',
    angle: 0,
    amplitude: 10,
    frequency: 10,
    speed: 1,
    thickness: 1,
    phaseOffset: 0,
    numLines: 1,
    distance: 0,
    bgColor: '#FFFFFF',
    lineColor: '#FF0000',
    selectedPalette: 'none',
    rotationSpeed: 0.02,
    rotationRadius: 150,
    groups: 1,
  };

  const [settings, setSettings] = useState(defaultSettings);
  const [isAnimating, setIsAnimating] = useState(true);

  let x = 0;
  let yOffset = 0;
  let time = 0;

  const sketch = (p5) => {
    p5.setup = () => {
      p5.createCanvas(p5.windowWidth, p5.windowHeight);
      p5.noLoop(); // Ensure the animation starts stopped
    };

    p5.updateWithProps = (props) => {
      if (props.settings) {
        setSettings(props.settings);
      }
      if (props.isAnimating !== undefined) {
        setIsAnimating(props.isAnimating);
        if (props.isAnimating) {
          p5.loop();
        } else {
          p5.noLoop();
        }
      }
    };

    p5.draw = () => {
      if (!isAnimating) return;

      p5.clear();
      p5.background(p5.color(settings.bgColor)); // Ensure background is applied correctly
      p5.stroke(p5.color(settings.lineColor)); // Ensure line color is set correctly
      p5.strokeWeight(settings.thickness);

      // Draw the wave
      p5.beginShape();
      for (let x = 0; x < p5.width; x++) {
        let y = settings.amplitude * p5.sin((x + p5.frameCount) * 0.01);
        p5.vertex(x, p5.height / 2 + y);
      }
      p5.endShape();

      // Draw an outline around the canvas
      p5.strokeWeight(1);
      p5.stroke(0, 0, 0, 0); // Transparent color
      p5.noFill();
      p5.rect(0, 0, p5.width, p5.height);
    };

    p5.windowResized = () => {
      p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
      p5.background(p5.color(settings.bgColor));
    };
  };

  const startAnimation = () => {
    setIsAnimating(true);
  };

  const stopAnimation = () => {
    setIsAnimating(false);
  };

  return (
    <div className="w-full h-full bg-transparent">
      <ControlPanel
        waveType={settings.waveType} setWaveType={(value) => setSettings({ ...settings, waveType: value })}
        direction={settings.direction} setDirection={(value) => setSettings({ ...settings, direction: value })}
        angle={settings.angle} setAngle={(value) => setSettings({ ...settings, angle: value })}
        amplitude={settings.amplitude} setAmplitude={(value) => setSettings({ ...settings, amplitude: value })}
        frequency={settings.frequency} setFrequency={(value) => setSettings({ ...settings, frequency: value })}
        speed={settings.speed} setSpeed={(value) => setSettings({ ...settings, speed: value })}
        thickness={settings.thickness} setThickness={(value) => setSettings({ ...settings, thickness: value })}
        phaseOffset={settings.phaseOffset} setPhaseOffset={(value) => setSettings({ ...settings, phaseOffset: value })}
        numLines={settings.numLines} setNumLines={(value) => setSettings({ ...settings, numLines: value })}
        distance={settings.distance} setDistance={(value) => setSettings({ ...settings, distance: value })}
        bgColor={settings.bgColor} setBgColor={(value) => setSettings({ ...settings, bgColor: value })}
        lineColor={settings.lineColor} setLineColor={(value) => setSettings({ ...settings, lineColor: value })}
        selectedPalette={settings.selectedPalette} setSelectedPalette={(value) => setSettings({ ...settings, selectedPalette: value })}
        rotationSpeed={settings.rotationSpeed} setRotationSpeed={(value) => setSettings({ ...settings, rotationSpeed: value })}
        rotationRadius={settings.rotationRadius} setRotationRadius={(value) => setSettings({ ...settings, rotationRadius: value })}
        groups={settings.groups} setGroups={(value) => setSettings({ ...settings, groups: value })}
        startAnimation={startAnimation}
        stopAnimation={stopAnimation}
      />
      <ReactP5Wrapper sketch={sketch} settings={settings} isAnimating={isAnimating} />
    </div>
  );
};

export default MultifunctionAnimation; */


/* // src/components/TherapyPage/MultifunctionAnimation.jsx
import React, { useState, useEffect } from 'react';
import ControlPanel from './ControlPanel';
import { ReactP5Wrapper } from 'react-p5-wrapper';
//import './MultifunctionAnimation.css';

const MultifunctionAnimation = () => {
  const defaultSettings = {
    waveType: 'sine',
    direction: 'static',
    angle: 0,
    amplitude: 10,
    frequency: 10,
    speed: 1,
    thickness: 1,
    phaseOffset: 0,
    numLines: 1,
    distance: 0,
    bgColor: '#FFFFFF',
    lineColor: '#FF0000',
    selectedPalette: 'none',
    rotationSpeed: 0.02,
    rotationRadius: 150,
    groups: 1,
  };

  const [settings, setSettings] = useState(defaultSettings);
  const [isAnimating, setIsAnimating] = useState(true);

  let x = 0;
  let yOffset = 0;
  let time = 0;

  const sketch = (p5) => {
    let palettes = {
      rainbow: ["#FF0000", "#FF7F00", "#FFFF00", "#7FFF00", "#00FF00", "#00FF7F", "#00FFFF", "#007FFF", "#0000FF", "#7F00FF", "#FF00FF", "#FF007F"],
      pastel: ["#FFD1DC", "#FFABAB", "#FFC3A0", "#FF677D", "#D4A5A5", "#392F5A", "#31A2AC", "#61C0BF", "#6B4226", "#ACD8AA"]
    };

    p5.setup = () => {
      p5.createCanvas(p5.windowWidth, p5.windowHeight);
      p5.background(settings.bgColor);
      p5.noLoop(); // Ensure the animation starts stopped
    };

    p5.updateWithProps = (props) => {
      if (props.settings) {
        setSettings(props.settings);
      }
      if (props.isAnimating !== undefined) {
        setIsAnimating(props.isAnimating);
        if (props.isAnimating) {
          p5.loop();
        } else {
          p5.noLoop();
        }
      }
    };

    p5.draw = () => {
      if (!isAnimating) return;

      p5.clear();
      p5.background(settings.bgColor);
      p5.strokeWeight(settings.thickness);

      const oscillationAmplitudeX = p5.width / 12;
      const oscillationAmplitudeY = p5.height / 12;
      const centerX = p5.width / 2;
      const centerY = p5.height / 2;

      for (let g = 0; g < settings.groups; g++) {
        for (let i = 0; i < settings.numLines; i++) {
          p5.beginShape();
          for (let j = 0; j <= p5.width; j++) {
            const k = ((j + x + settings.phaseOffset * i) / settings.frequency);
            let sineValue;
            switch (settings.waveType) {
              case 'sine':
                sineValue = p5.sin(k) * settings.amplitude;
                break;
              case 'tan':
                sineValue = p5.tan(k) * settings.amplitude / 4;
                break;
              case 'cotan':
                sineValue = (1 / p5.tan(k)) * settings.amplitude / 4;
                break;
              case 'sawtooth':
                sineValue = ((k / p5.PI) % 2 - 1) * settings.amplitude;
                break;
              case 'square':
                sineValue = (p5.sin(k) >= 0 ? 1 : -1) * settings.amplitude / 2;
                break;
              case 'triangle':
                sineValue = (2 * settings.amplitude / p5.PI) * p5.asin(p5.sin(k));
                break;
              default:
                sineValue = p5.sin(k) * settings.amplitude;
            }

            let baseY = centerY + yOffset + i * settings.distance + g * settings.numLines * settings.distance;
            const rotatedX = (j - centerX) * p5.cos(settings.angle) - sineValue * p5.sin(settings.angle) + centerX;
            const rotatedY = (j - centerX) * p5.sin(settings.angle) + (sineValue + baseY - centerY) * p5.cos(settings.angle) + centerY;

            p5.vertex(rotatedX, rotatedY);
          }
          if (settings.selectedPalette !== 'none') {
            p5.stroke(p5.color(palettes[settings.selectedPalette][i % palettes[settings.selectedPalette].length]));
          } else {
            p5.stroke(p5.color(settings.lineColor));
          }
          p5.endShape();
        }
      }

      switch (settings.direction) {
        case 'static':
          break;
        case 'up':
          yOffset -= settings.speed;
          break;
        case 'down':
          yOffset += settings.speed;
          break;
        case 'left':
          x -= settings.speed;
          break;
        case 'right':
          x += settings.speed;
          break;
        case 'oscillateUpDown':
          yOffset = oscillationAmplitudeY * p5.sin(time);
          time += settings.speed;
          break;
        case 'oscillateRightLeft':
          x = oscillationAmplitudeX * p5.sin(time);
          time += settings.speed;
          break;
        case 'circular':
          x = settings.rotationRadius * p5.cos(time * settings.rotationSpeed);
          yOffset = settings.rotationRadius * p5.sin(time * settings.rotationSpeed);
          time += settings.speed;
          break;
        default:
          break;
      }
    };

    p5.windowResized = () => {
      p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
      p5.background(settings.bgColor);
    };
  };

  const startAnimation = () => {
    setIsAnimating(true);
  };

  const stopAnimation = () => {
    setIsAnimating(false);
  };

  const resetAnimation = () => {
    setSettings(defaultSettings);
    x = 0;
    yOffset = 0;
    time = 0;
    setIsAnimating(false);
    setTimeout(() => {
      setIsAnimating(true);
    }, 100);
  };

  useEffect(() => {
    startAnimation();
  }, [settings]);

  return (
    <div className="w-full h-full bg-transparent">
      <ControlPanel
        waveType={settings.waveType} setWaveType={(value) => setSettings({ ...settings, waveType: value })}
        direction={settings.direction} setDirection={(value) => setSettings({ ...settings, direction: value })}
        angle={settings.angle} setAngle={(value) => setSettings({ ...settings, angle: value })}
        amplitude={settings.amplitude} setAmplitude={(value) => setSettings({ ...settings, amplitude: value })}
        frequency={settings.frequency} setFrequency={(value) => setSettings({ ...settings, frequency: value })}
        speed={settings.speed} setSpeed={(value) => setSettings({ ...settings, speed: value })}
        thickness={settings.thickness} setThickness={(value) => setSettings({ ...settings, thickness: value })}
        phaseOffset={settings.phaseOffset} setPhaseOffset={(value) => setSettings({ ...settings, phaseOffset: value })}
        numLines={settings.numLines} setNumLines={(value) => setSettings({ ...settings, numLines: value })}
        distance={settings.distance} setDistance={(value) => setSettings({ ...settings, distance: value })}
        bgColor={settings.bgColor} setBgColor={(value) => setSettings({ ...settings, bgColor: value })}
        lineColor={settings.lineColor} setLineColor={(value) => setSettings({ ...settings, lineColor: value })}
        selectedPalette={settings.selectedPalette} setSelectedPalette={(value) => setSettings({ ...settings, selectedPalette: value })}
        rotationSpeed={settings.rotationSpeed} setRotationSpeed={(value) => setSettings({ ...settings, rotationSpeed: value })}
        rotationRadius={settings.rotationRadius} setRotationRadius={(value) => setSettings({ ...settings, rotationRadius: value })}
        groups={settings.groups} setGroups={(value) => setSettings({ ...settings, groups: value })}
        startAnimation={startAnimation}
        stopAnimation={stopAnimation}
        resetAnimation={resetAnimation}
      />
      <ReactP5Wrapper sketch={sketch} settings={settings} isAnimating={isAnimating} />
    </div>
  );
};

export default MultifunctionAnimation;


/* // src/components/TherapyPage/MultifunctionAnimation.jsx
import React, { useState, useEffect } from 'react';
import ControlPanel from './ControlPanel';
import { ReactP5Wrapper } from 'react-p5-wrapper';
//import {ReactP5WrapperGuard} from 'ReactP5WrapperGuard';
//import '../../styles/MultifunctionAnimation.css';
//import { ReactP5WrapperGuard } from 'react-p5-wrapper/dist/react-p5-wrapper/components/ReactP5WrapperGuard';
 
 

const MultifunctionAnimation = () => {
  const defaultSettings = {
    waveType: 'sine',
    direction: 'static',
    angle: 0,
    amplitude: 10,
    frequency: 10,
    speed: 1,
    thickness: 1,
    phaseOffset: 0,
    numLines: 1,
    distance: 0,
    bgColor: '#FFFFFF',
    lineColor: '#FF0000',
    selectedPalette: 'none',
    rotationSpeed: 0.02,
    rotationRadius: 150,
    groups: 1,
  };

  const [settings, setSettings] = useState(defaultSettings);
  const [isAnimating, setIsAnimating] = useState(true);

  let x = 0;
  let yOffset = 0;
  let time = 0;

  const sketch = (p5) => {
    let palettes = {
      rainbow: ["#FF0000", "#FF7F00", "#FFFF00", "#7FFF00", "#00FF00", "#00FF7F", "#00FFFF", "#007FFF", "#0000FF", "#7F00FF", "#FF00FF", "#FF007F"],
      pastel: ["#FFD1DC", "#FFABAB", "#FFC3A0", "#FF677D", "#D4A5A5", "#392F5A", "#31A2AC", "#61C0BF", "#6B4226", "#ACD8AA"]
    };

    p5.setup = () => {
      p5.createCanvas(p5.windowWidth, p5.windowHeight);
      p5.background(settings.lineColor);
    };

    p5.draw = () => {
      if (!isAnimating) return;

      p5.clear();
      p5.background(settings.bgColor);
      p5.strokeWeight(settings.thickness);

      const oscillationAmplitudeX = p5.width / 12;
      const oscillationAmplitudeY = p5.height / 12;
      const centerX = p5.width / 2;
      const centerY = p5.height / 2;

      for (let g = 0; g < settings.groups; g++) {
        for (let i = 0; i < settings.numLines; i++) {
          p5.beginShape();
          for (let j = 0; j <= p5.width; j++) {
            const k = ((j + x + settings.phaseOffset * i) / settings.frequency);
            let sineValue;
            switch (settings.waveType) {
              case 'sine':
                sineValue = p5.sin(k) * settings.amplitude;
                break;
              case 'tan':
                sineValue = p5.tan(k) * settings.amplitude / 4;
                break;
              case 'cotan':
                sineValue = (1 / p5.tan(k)) * settings.amplitude / 4;
                break;
              case 'sawtooth':
                sineValue = ((k / p5.PI) % 2 - 1) * settings.amplitude;
                break;
              case 'square':
                sineValue = (p5.sin(k) >= 0 ? 1 : -1) * settings.amplitude / 2;
                break;
              case 'triangle':
                sineValue = (2 * settings.amplitude / p5.PI) * p5.asin(p5.sin(k));
                break;
              default:
                sineValue = p5.sin(k) * settings.amplitude;
            }

            let baseY = centerY + yOffset + i * settings.distance + g * settings.numLines * settings.distance;
            const rotatedX = (j - centerX) * p5.cos(settings.angle) - sineValue * p5.sin(settings.angle) + centerX;
            const rotatedY = (j - centerX) * p5.sin(settings.angle) + (sineValue + baseY - centerY) * p5.cos(settings.angle) + centerY;

            p5.vertex(rotatedX, rotatedY);
          }
          if (settings.selectedPalette !== 'none') {
            p5.stroke(p5.color(palettes[settings.selectedPalette][i % palettes[settings.selectedPalette].length]));
          } else {
            p5.stroke(p5.color(settings.lineColor));
          }
          p5.endShape();
        }
      }

      switch (settings.direction) {
        case 'static':
          break;
        case 'up':
          yOffset -= settings.speed;
          break;
        case 'down':
          yOffset += settings.speed;
          break;
        case 'left':
          x -= settings.speed;
          break;
        case 'right':
          x += settings.speed;
          break;
        case 'oscillateUpDown':
          yOffset = oscillationAmplitudeY * p5.sin(time);
          time += settings.speed;
          break;
        case 'oscillateRightLeft':
          x = oscillationAmplitudeX * p5.sin(time);
          time += settings.speed;
          break;
        case 'circular':
          x = settings.rotationRadius * p5.cos(time * settings.rotationSpeed);
          yOffset = settings.rotationRadius * p5.sin(time * settings.rotationSpeed);
          time += settings.speed;
          break;
        default:
          break;
      }
    };

    p5.windowResized = () => {
      p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
      p5.background(settings.lineColor);
    };

    p5.updateWithProps = (props) => {
      if (props.settings) {
        setSettings(props.settings);
      }
      if (props.isAnimating !== undefined) {
        setIsAnimating(props.isAnimating);
      }
    };
  };

  const startAnimation = () => {
    setIsAnimating(true);
  };

  const stopAnimation = () => {
    setIsAnimating(false);
  };

  const resetAnimation = () => {
    setSettings(defaultSettings);
    x = 0;
    yOffset = 0;
    time = 0;
    setIsAnimating(false);
    setTimeout(() => {
      setIsAnimating(true);
    }, 100);
  };

  useEffect(() => {
    startAnimation();
  }, [settings]);

  return (
    <div className="w-full h-full bg-transparent">
      <ControlPanel
        waveType={settings.waveType} setWaveType={(value) => setSettings({ ...settings, waveType: value })}
        direction={settings.direction} setDirection={(value) => setSettings({ ...settings, direction: value })}
        angle={settings.angle} setAngle={(value) => setSettings({ ...settings, angle: value })}
        amplitude={settings.amplitude} setAmplitude={(value) => setSettings({ ...settings, amplitude: value })}
        frequency={settings.frequency} setFrequency={(value) => setSettings({ ...settings, frequency: value })}
        speed={settings.speed} setSpeed={(value) => setSettings({ ...settings, speed: value })}
        thickness={settings.thickness} setThickness={(value) => setSettings({ ...settings, thickness: value })}
        phaseOffset={settings.phaseOffset} setPhaseOffset={(value) => setSettings({ ...settings, phaseOffset: value })}
        numLines={settings.numLines} setNumLines={(value) => setSettings({ ...settings, numLines: value })}
        distance={settings.distance} setDistance={(value) => setSettings({ ...settings, distance: value })}
        bgColor={settings.bgColor} setBgColor={(value) => setSettings({ ...settings, bgColor: value })}
        lineColor={settings.lineColor} setLineColor={(value) => setSettings({ ...settings, lineColor: value })}
        selectedPalette={settings.selectedPalette} setSelectedPalette={(value) => setSettings({ ...settings, selectedPalette: value })}
        rotationSpeed={settings.rotationSpeed} setRotationSpeed={(value) => setSettings({ ...settings, rotationSpeed: value })}
        rotationRadius={settings.rotationRadius} setRotationRadius={(value) => setSettings({ ...settings, rotationRadius: value })}
        groups={settings.groups} setGroups={(value) => setSettings({ ...settings, groups: value })}
        startAnimation={startAnimation}
        stopAnimation={stopAnimation}
        resetAnimation={resetAnimation}
      />
      <ReactP5Wrapper sketch={sketch} settings={settings} isAnimating={isAnimating} />
    </div>
  );
};

export default MultifunctionAnimation;



 */



/* 


// src/components/TherapyPage/MultifunctionAnimation.jsx
import React, { useState, useEffect } from 'react';
import ControlPanel from './ControlPanel';
import Sketch from 'react-p5';
import './MultifunctionAnimation.css';

const MultifunctionAnimation = () => {
  
  const [waveType, setWaveType] = useState(' ');
  const [direction, setDirection] = useState('static');
  const [angle, setAngle] = useState(0);
  const [amplitude, setAmplitude] = useState(10);
  const [frequency, setFrequency] = useState(10);
  const [speed, setSpeed] = useState(1);
  const [thickness, setThickness] = useState(1);
  const [phaseOffset, setPhaseOffset] = useState(0);
  const [numLines, setNumLines] = useState(1);
  const [distance, setDistance] = useState(0);
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [lineColor, setLineColor] = useState('#FF0000');
  const [selectedPalette, setSelectedPalette] = useState('none');
  const [rotationSpeed, setRotationSpeed] = useState(0.02);
  const [rotationRadius, setRotationRadius] = useState(150);
  const [isAnimating, setIsAnimating] = useState(true);

  //-----------------added for the reset button -----------
  const defaultSettings = {
    waveType: ' ',
    direction: 'static',
    angle: 0,
    amplitude: 10,
    frequency: 10,
    speed: 1,
    thickness: 1,
    phaseOffset: 0,
    numLines: 1,
    distance: 0,
    bgColor: '#FFFFFF',
    lineColor: '#FF0000',
    selectedPalette: 'none',
    rotationSpeed: 0.02,
    rotationRadius: 150,
  };
  const [settings, setSettings] = useState(defaultSettings);
 //----------------------------------------------

  let x = 0;
  let yOffset = 0;
  let time = 0;

  const setup = (p5, canvasParentRef) => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight).parent(canvasParentRef);
    p5.clear();
  };

  const draw = (p5) => {
    if (!isAnimating) return;

    p5.clear();
    p5.background(bgColor);
    p5.strokeWeight(thickness);
    p5.fillCanvase(bgColor);

    const palettes = {
      rainbow: ["#FF0000", "#FF7F00", "#FFFF00", "#7FFF00", "#00FF00", "#00FF7F", "#00FFFF", "#007FFF", "#0000FF", "#7F00FF", "#FF00FF", "#FF007F"],
      pastel: ["#FFD1DC", "#FFABAB", "#FFC3A0", "#FF677D", "#D4A5A5", "#392F5A", "#31A2AC", "#61C0BF", "#6B4226", "#ACD8AA"]
    };

    const oscillationAmplitudeX = p5.width / 12;
    const oscillationAmplitudeY = p5.height / 12;
    const centerX = p5.width / 2;
    const centerY = p5.height / 2;

    for (let i = 0; i < numLines; i++) {
      p5.beginShape();
      for (let j = 0; j <= p5.width; j++) {
        const k = ((j + x + phaseOffset * i) / frequency);
        let sineValue;
        switch (waveType) {
          case 'sine':
            sineValue = p5.sin(k) * amplitude;
            break;
          case 'tan':
            sineValue = p5.tan(k) * amplitude / 4;
            break;
          case 'cotan':
            sineValue = (1 / p5.tan(k)) * amplitude / 4;
            break;
          case 'sawtooth':
            sineValue = ((k / p5.PI) % 2 - 1) * amplitude;
            break;
          case 'square':
            sineValue = (p5.sin(k) >= 0 ? 1 : -1) * amplitude / 2;
            break;
          case 'triangle':
            sineValue = (2 * amplitude / p5.PI) * p5.asin(p5.sin(k));
            break;
          default:
            sineValue = p5.sin(k) * amplitude;
        }

        let baseY = centerY + yOffset + i * distance;
        const rotatedX = (j - centerX) * p5.cos(angle) - sineValue * p5.sin(angle) + centerX;
        const rotatedY = (j - centerX) * p5.sin(angle) + (sineValue + baseY - centerY) * p5.cos(angle) + centerY;

        p5.vertex(rotatedX, rotatedY);
      }
      if (selectedPalette !== 'none') {
        p5.stroke(p5.color(palettes[selectedPalette][i % palettes[selectedPalette].length]));
      } else {
        p5.stroke(p5.color(lineColor));
      }
      p5.endShape();
    }

    switch (direction) {
      case 'static':
        break;
      case 'up':
        yOffset -= speed;
        break;
      case 'down':
        yOffset += speed;
        break;
      case 'left':
        x -= speed;
        break;
      case 'right':
        x += speed;
        break;
      case 'oscillateUpDown':
        yOffset = oscillationAmplitudeY * p5.sin(time);
        time += speed;
        break;
      case 'oscillateRightLeft':
        x = oscillationAmplitudeX * p5.sin(time);
        time += speed;
        break;
      case 'circular':
        x = rotationRadius * p5.cos(time * rotationSpeed);
        yOffset = rotationRadius * p5.sin(time * rotationSpeed);
        time += speed;
        break;
      default:
        break;
    }
  };

  const windowResized = (p5) => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
  };

  const startAnimation = () => {
    setIsAnimating(true);
  };

  const stopAnimation = () => {
    setIsAnimating(false);
  };

  const resetAnimation = () => {
    setSettings(defaultSettings);
    x = 0;
    yOffset = 0;
    time = 0;
    setIsAnimating(false);
    setTimeout(() => {
      setIsAnimating(true);
    }, 100);
  };

  useEffect(() => {
    startAnimation();
  }, [waveType, direction, angle, amplitude, frequency, speed, thickness, phaseOffset, numLines, distance, bgColor, lineColor, selectedPalette, rotationSpeed, rotationRadius]);

  return (
     
       <div className="w-full h-full bg-transparent"> 
      <ControlPanel
        waveType={waveType} setWaveType={setWaveType}
        direction={direction} setDirection={setDirection}
        angle={angle} setAngle={setAngle}
        amplitude={amplitude} setAmplitude={setAmplitude}
        frequency={frequency} setFrequency={setFrequency}
        speed={speed} setSpeed={setSpeed}
        thickness={thickness} setThickness={setThickness}
        phaseOffset={phaseOffset} setPhaseOffset={setPhaseOffset}
        numLines={numLines} setNumLines={setNumLines}
        distance={distance} setDistance={setDistance}
        bgColor={bgColor} setBgColor={setBgColor}
        lineColor={lineColor} setLineColor={setLineColor}
        selectedPalette={selectedPalette} setSelectedPalette={setSelectedPalette}
        rotationSpeed={rotationSpeed} setRotationSpeed={setRotationSpeed}
        rotationRadius={rotationRadius} setRotationRadius={setRotationRadius}
        startAnimation={startAnimation}
        stopAnimation={stopAnimation}
        resetAnimation={resetAnimation}
      />
      <Sketch setup={setup} draw={draw} windowResized={windowResized} />
    </div>
  );
};

export default MultifunctionAnimation;
 */