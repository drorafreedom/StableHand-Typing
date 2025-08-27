import React, { useState, useCallback } from 'react';
import ControlPanelColor from './ControlPanelColor';
import { ReactP5Wrapper, SketchProps } from 'react-p5-wrapper';

interface ColorAnimationSettings {
  colors: string[];
  animationStyle: 'sine' | 'linear' | 'circular' | 'fractal';
  duration: number; // speed multiplier
}

interface SketchPropsWithSettings extends SketchProps {
  settings: ColorAnimationSettings;
  running: boolean;
  resetKey: number; // bump to request a time reset (does NOT change running)
}

const DEFAULT_SETTINGS: ColorAnimationSettings = {
  colors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'],
  animationStyle: 'sine',
  duration: 1,
};

const ColorAnimation: React.FC<{ setCurrentAnimation: (animation: string) => void }> = ({ setCurrentAnimation }) => {
  const [settings, setSettings] = useState<ColorAnimationSettings>(DEFAULT_SETTINGS);
  const [running, setRunning] = useState<boolean>(true);
  const [resetKey, setResetKey] = useState<number>(0);

  const startAnimation = () => setRunning(true);
  const stopAnimation  = () => setRunning(false);

  // Reset DOES NOT change running; it resets time AND restores defaults
  const resetAnimation = () => {
    setSettings(DEFAULT_SETTINGS);     // restore defaults (style, colors, duration)
    setResetKey((k) => k + 1);         // signal the sketch to set t=0
    // running state unchanged
  };

  const sketch = useCallback((p5: any) => {
    let t = 0;
    let current: ColorAnimationSettings = DEFAULT_SETTINGS;
    let isRunning = true;
    let lastResetKey = -1;

    p5.setup = () => {
      p5.createCanvas(p5.windowWidth, p5.windowHeight);
      p5.noStroke();
      p5.frameRate(60);
    };

    p5.updateWithProps = (props: SketchPropsWithSettings) => {
      if (props.settings) current = props.settings;
      if (typeof props.running === 'boolean') isRunning = props.running;

      if (typeof props.resetKey === 'number' && props.resetKey !== lastResetKey) {
        t = 0;                         // reset time
        lastResetKey = props.resetKey;
      }
    };

    p5.draw = () => {
      const w = p5.width;
      const h = p5.height;

      // Always render (so paused still reflects setting changes); only advance time when running
      p5.clear();

      const [c1, c2, c3, c4] = current.colors.map((c) => p5.color(c));
      const speed = current.duration;  // overall speed factor; adjust if needed

      for (let i = 0; i <= w; i += 10) {
        for (let j = 0; j <= h; j += 10) {
          let amount = 0;

          switch (current.animationStyle) {
            case 'sine': {
              amount = p5.map(p5.sin(t + i * 0.01 + j * 0.01), -1, 1, 0, 1);
              break;
            }
            case 'linear': {
              // moving diagonal gradient
              const shift = (t * 120 * speed) % (w + h);
              amount = p5.map((i + j + shift) % (w + h), 0, w + h, 0, 1);
              break;
            }
            case 'circular': {
              // pulsating radius
              const cx = w / 2;
              const cy = h / 2;
              const dist = p5.dist(i, j, cx, cy);
              const pulsate = (p5.sin(t * 2.0 * speed) + 1) * 0.5; // 0..1
              const maxR = Math.min(cx, cy) * (0.5 + 0.5 * pulsate);
              amount = p5.map(dist, 0, maxR || 1, 0, 1, true);
              break;
            }
            case 'fractal': {
              // evolving noise field
              const scale = 0.005;
              amount = p5.noise(i * scale, j * scale, t * 0.3 * speed);
              break;
            }
          }

          const interA = p5.lerpColor(c1, c2, amount);
          const interB = p5.lerpColor(c3, c4, amount);
          p5.fill(p5.lerpColor(interA, interB, amount));
          p5.rect(i, j, 10, 10);
        }
      }

      if (isRunning) {
        t += 0.01 * speed;
      }
    };

    p5.windowResized = () => {
      p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    };
  }, []);

  return (
    <div className="relative">
      <div className="flex justify-center mb-4">
        <button onClick={() => setCurrentAnimation('multifunction')} className="p-2 mx-2 bg-gray-200">
          Multifunction Animation
        </button>
        <button onClick={() => setCurrentAnimation('shape')} className="p-2 mx-2 bg-gray-200">
          Shape Animation
        </button>
        <button onClick={() => setCurrentAnimation('color')} className="p-2 mx-2 bg-blue-500 text-white">
          Color Animation
        </button>
      </div>

      <ControlPanelColor
        settings={settings}
        setSettings={setSettings}
        startAnimation={startAnimation}
        stopAnimation={stopAnimation}
        resetAnimation={resetAnimation}
      />

      <ReactP5Wrapper
        sketch={sketch}
        settings={settings}
        running={running}
        resetKey={resetKey}
      />
    </div>
  );
};

export default ColorAnimation;




//+++++++++++JS version+++++++++++++++++
 
// src/components/TherapyPage/ColorAnimation.jsx
// // JS version
/* 
import React, { useState } from 'react';
import ControlPanelColor from './ControlPanelColor';
import { ReactP5Wrapper } from 'react-p5-wrapper';

const ColorAnimation = ({ setCurrentAnimation }) => {
  const [settings, setSettings] = useState({
    colors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'],
    animationStyle: 'sine',
    duration: 1,
  });

  const sketch = (p5) => {
    let t = 0;

    p5.setup = () => {
      p5.createCanvas(p5.windowWidth, p5.windowHeight);
      p5.noStroke();
    };

    p5.updateWithProps = (props) => {
      if (props.settings) {
        setSettings(props.settings);
      }
    };

    p5.draw = () => {
      p5.clear();
      let color1 = p5.color(settings.colors[0]);
      let color2 = p5.color(settings.colors[1]);
      let color3 = p5.color(settings.colors[2]);
      let color4 = p5.color(settings.colors[3]);

      for (let i = 0; i <= p5.width; i += 10) {
        for (let j = 0; j <= p5.height; j += 10) {
          let amount = 0;
          switch (settings.animationStyle) {
            case 'sine':
              amount = p5.map(p5.sin(t + i * 0.01 + j * 0.01), -1, 1, 0, 1);
              break;
            case 'linear':
              amount = p5.map(i + j, 0, p5.width + p5.height, 0, 1);
              break;
            case 'circular':
              let distance = p5.dist(i, j, p5.width / 2, p5.height / 2);
              amount = p5.map(distance, 0, p5.width / 2, 0, 1);
              break;
            case 'fractal':
              let scale = 0.005; // Adjust scale for smoother appearance
              amount = p5.noise(i * scale, j * scale, t * scale);
              break;
            default:
              amount = p5.map(p5.sin(t + i * 0.01 + j * 0.01), -1, 1, 0, 1);
          }
          let interA = p5.lerpColor(color1, color2, amount);
          let interB = p5.lerpColor(color3, color4, amount);
          p5.fill(p5.lerpColor(interA, interB, amount));
          p5.rect(i, j, 10, 10);
        }
      }
      t += 0.01 * settings.duration;
    };

    p5.windowResized = () => {
      p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    };
  };

  return (
    <div className="relative">
      <div className="flex justify-center mb-4">
        <button
          onClick={() => setCurrentAnimation('multifunction')}
          className="p-2 mx-2 bg-gray-200"
        >
          Multifunction Animation
        </button>
        <button
          onClick={() => setCurrentAnimation('shape')}
          className="p-2 mx-2 bg-gray-200"
        >
          Shape Animation
        </button>
        <button
          onClick={() => setCurrentAnimation('color')}
          className="p-2 mx-2 bg-blue-500 text-white"
        >
          Color Animation
        </button>
      </div>
      <ControlPanelColor settings={settings} setSettings={setSettings} />
      <ReactP5Wrapper sketch={sketch} settings={settings} />
    </div>
  );
};

export default ColorAnimation;

 */

/* // src/components/Therapy/ColorAnimation.jsx
import React, { useState } from 'react';
import ControlPanelColor from './ControlPanelColor';
import { ReactP5Wrapper } from 'react-p5-wrapper';

const ColorAnimation = ({ setCurrentAnimation }) => {
  const [settings, setSettings] = useState({
    colors: ['#FF0000', '#00FF00', '#0000FF'],
    animationType: 'sine',
    speed: 1,
  });

  const sketch = (p5) => {
    let t = 0;

    p5.setup = () => {
      p5.createCanvas(p5.windowWidth, p5.windowHeight);
      p5.noStroke();
    };

    p5.updateWithProps = (props) => {
      if (props.settings) {
        setSettings(props.settings);
      }
    };

    p5.draw = () => {
      p5.clear();
      let color1 = p5.color(settings.colors[0]);
      let color2 = p5.color(settings.colors[1]);
      let color3 = p5.color(settings.colors[2]);

      for (let i = 0; i <= p5.width; i += 10) {
        for (let j = 0; j <= p5.height; j += 10) {
          let amount = 0;
          if (settings.animationType === 'sine') {
            amount = p5.map(p5.sin(t + i * 0.01 + j * 0.01), -1, 1, 0, 1);
          } else if (settings.animationType === 'linear') {
            amount = p5.map(i + j, 0, p5.width + p5.height, 0, 1);
          }
          let interA = p5.lerpColor(color1, color2, amount);
          let interB = p5.lerpColor(color2, color3, amount);
          p5.fill(p5.lerpColor(interA, interB, amount));
          p5.rect(i, j, 10, 10);
        }
      }
      t += 0.01 * settings.speed;
    };

    p5.windowResized = () => {
      p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    };
  };

  return (
    <div className="relative">
      <div className="flex justify-center mb-4">
        <button
          onClick={() => setCurrentAnimation('multifunction')}
          className="p-2 mx-2 bg-gray-200"
        >
          Multifunction Animation
        </button>
        <button
          onClick={() => setCurrentAnimation('shape')}
          className="p-2 mx-2 bg-gray-200"
        >
          Shape Animation
        </button>
        <button
          onClick={() => setCurrentAnimation('color')}
          className="p-2 mx-2 bg-blue-500 text-white"
        >
          Color Animation
        </button>
      </div>
      <ControlPanelColor settings={settings} setSettings={setSettings} />
      <ReactP5Wrapper sketch={sketch} settings={settings} />
    </div>
  );
};

export default ColorAnimation; */



/* // src/components/Therapy/ColorAnimation.jsx
import React, { useState, useEffect } from 'react';
import ControlPanelColor from './ControlPanelColor';
import { ReactP5Wrapper } from 'react-p5-wrapper';
const ColorAnimation = ({ settings }) => {
  const [colors, setColors] = useState(settings.colors);

  useEffect(() => {
    setColors(settings.colors);
  }, [settings]);

  const createKeyframes = () => {
    return `
      @keyframes colorTransition {
        0% { background-color: ${colors[0]}; }
        25% { background-color: ${colors[1]}; }
        50% { background-color: ${colors[2]}; }
        75% { background-color: ${colors[3]}; }
        100% { background-color: ${colors[0]}; }
      }
    `;
  };

  return (
    <div>
      <style>{createKeyframes()}</style>
      <div className="color-animation" style={{
        width: '100vw',
        height: '100vh',
        animation: `colorTransition ${settings.duration}s infinite`
      }} />
    </div>
  );
};

export default ColorAnimation; */
