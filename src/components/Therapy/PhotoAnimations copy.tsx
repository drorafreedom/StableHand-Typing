import React, { useCallback, useMemo, useState } from 'react';
import { ReactP5Wrapper, type Sketch } from 'react-p5-wrapper';
import ControlPanelPhoto from './ControlPanelPhoto';
import { useEffect } from 'react';

/* useEffect(() => {
  if (settings.urls.length === 0) {
    const base = import.meta.env.BASE_URL || '/';
    const urls = Array.from({ length: 14 }, (_, i) => `${base}bgphotos/${1 + i}.jpg`);
    setUrls(urls);
    setAuto(true);         // default slideshow on first load
    setRunning(true);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); */

export type Direction =
  | 'static'
  | 'left' | 'right' | 'up' | 'down'
  | 'oscillateRightLeft' | 'oscillateUpDown' | 'circular';

export interface PhotoSettings {
  urls: string[];
  mode: 'kenburns' | 'slide' | 'crossfade';
  scaleMode: 'cover' | 'contain';
  direction: Direction;
  speed: number;
  duration: number;
  transitionSeconds: number;
  zoom: number;
  zoomMode: 'constant' | 'pulse';
  zoomSpeed: number;
  overlayColor: string;        // #rrggbb
  overlayOpacity: number;      // 0..1
  overlayOpacityMode: 'constant' | 'pulse';
  overlayOpacitySpeed: number;
  shuffleKey?: number;
}

export const DEFAULTS: PhotoSettings = {
  urls: [],
  mode: 'kenburns',
  scaleMode: 'cover',
  direction: 'static',
  speed: 120,
  duration: 5,
  transitionSeconds: 1.0,
  zoom: 1.15,
  zoomMode: 'constant',
  zoomSpeed: 1.2,
  overlayColor: '#000000',
  overlayOpacity: 0,
  overlayOpacityMode: 'constant',
  overlayOpacitySpeed: 1,
  shuffleKey: 0,
};

export const cloneDefaults = (): PhotoSettings => ({ ...DEFAULTS, urls: [] });

const clampHex6 = (hex: string) => {
  if (!hex?.startsWith('#')) return '#000000';
  if (hex.length === 7) return hex;
  if (hex.length === 9) return `#${hex.slice(1, 7)}`;
  return '#000000';
};

const buildSequence = (folder: string, count: number, start = 1, ext = 'jpg') => {
  const base = import.meta.env.BASE_URL || '/';
  return Array.from({ length: count }, (_, i) => `${base}${folder}/${start + i}.${ext}`);
};

const PhotoAnimations: React.FC = () => {
  const [settings, setSettings]   = useState<PhotoSettings>(cloneDefaults());

  // transport / slideshow
  const [running, setRunning]       = useState(true);
  const [autoAdvance, setAuto]      = useState(true);
  const [resetSeed, setResetSeed]   = useState(0);

  // manual step
  const [stepSig, setStepSig]       = useState(0);
  const [stepDir, setStepDir]       = useState<-1 | 0 | 1>(0);

  // exposed to panel
  const startAnimation = () => setRunning(true);
  const stopAnimation  = () => setRunning(false);
  const resetAnimation = () => setResetSeed(v => v + 1);
  const shuffleNow     = () =>
    setSettings(s => ({ ...s, shuffleKey: (s.shuffleKey ?? 0) + 1 }));

  const setUrls = (urls: string[]) => {
    setSettings(s => ({ ...s, urls }));
    setResetSeed(v => v + 1);
  };

  const loadSequence = useCallback(
    (folder: string, count: number, start = 1, ext = 'jpg') => {
      setUrls(buildSequence(folder, count, start, ext));
    },
    []
  );

  const loadSingleFromFolder = useCallback(
    (folder: string, index: number, ext = 'jpg') => {
      setUrls(buildSequence(folder, 1, index, ext));
      setAuto(false);
    },
    []
  );

  const nextImage = () => { setAuto(false); setStepDir( 1); setStepSig(s => s + 1); };
  const prevImage = () => { setAuto(false); setStepDir(-1); setStepSig(s => s + 1); };

  const sketch = useMemo<Sketch>(() => {
    return (p: any) => {
      let S: PhotoSettings = { ...DEFAULTS };
      let isRunning = true;
      let isAuto    = true;

      let imgs: any[] = [];
      let ready = false;

      let order: number[] = [];
      let idx = 0, next = 1;
      let phase: 'hold' | 'transition' = 'hold';
      let timer = 0;

      // pan is the “virtual” position (can grow unbounded)
      let panX = 0, panY = 0;

      let lastReset = -1;
      let lastStep  = -1;
      let lastUrlsKey = '';

      const shuffle = (arr: number[]) => {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
          const j = (Math.random() * (i + 1)) | 0;
          [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
      };

      const fitSize = (iw: number, ih: number, cw: number, ch: number, mode: 'cover'|'contain') => {
        const sr = cw / iw;
        const tr = ch / ih;
        const s = mode === 'cover' ? Math.max(sr, tr) : Math.min(sr, tr);
        return { w: iw * s, h: ih * s };
      };

      // continuous loop (wrap) instead of clamping → no “stall” at edges
      const wrapPanToCover = (img: any, zoomMult: number) => {
        if (!img) return { ox: 0, oy: 0 };
        const fit = fitSize(img.width, img.height, p.width, p.height, S.scaleMode);
        const w = fit.w * zoomMult;
        const h = fit.h * zoomMult;
        const maxX = Math.max(0, (w - p.width)  / 2);
        const maxY = Math.max(0, (h - p.height) / 2);

        // wrap in [-max, +max]
        const wrap = (v: number, m: number) => {
          if (m <= 0) return 0;
          const range = 2 * m;
          let t = (v + m) % range;
          if (t < 0) t += range;
          return t - m;
        };

        const cx = wrap(panX, maxX);
        const cy = wrap(panY, maxY);
        return { ox: cx, oy: cy };
      };

      const drawImage = (img: any, alpha: number, zoomMult: number, offX: number, offY: number) => {
        if (!img) return;
        const fit = fitSize(img.width, img.height, p.width, p.height, S.scaleMode);
        const w = fit.w * zoomMult;
        const h = fit.h * zoomMult;
        const x = (p.width - w) / 2 + offX;
        const y = (p.height - h) / 2 + offY;
        p.push();
        p.tint(255, 255 * alpha);
        p.image(img, x, y, w, h);
        p.pop();
      };

      const rebuildOrder = () => {
        const base = Array.from({ length: imgs.length }, (_, k) => k);
        order = S.shuffleKey ? shuffle(base) : base;
        idx = 0;
        next = imgs.length > 1 ? 1 : 0;
        timer = 0;
        phase = 'hold';
        panX = 0; panY = 0;
      };

      const reloadImages = () => {
        ready = false;
        imgs = [];
        let loaded = 0;
        if (!S.urls?.length) return;
        S.urls.forEach((u, i) => {
          p.loadImage(
            u,
            (im: any) => {
              imgs[i] = im;
              loaded++;
              if (loaded === S.urls.length) {
                rebuildOrder();
                ready = true;
              }
            },
            () => {
              imgs[i] = null;
              loaded++;
            }
          );
        });
      };

      p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight - 80);
        p.pixelDensity(1);
      };
      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight - 80);
      };

      p.updateWithProps = (props: {
        settings: PhotoSettings;
        running: boolean;
        autoAdvance: boolean;
        resetSeed: number;
        stepSig: number;
        stepDir: -1 | 0 | 1;
      }) => {
        if (props.settings) {
          const nextS = { ...props.settings, overlayColor: clampHex6(props.settings.overlayColor) };
          const urlsKey = nextS.urls.join('|');
          const urlsChanged = urlsKey !== lastUrlsKey;
          const shuffleChanged = (nextS.shuffleKey ?? 0) !== (S.shuffleKey ?? 0);
          S = nextS;
          if (urlsChanged) { lastUrlsKey = urlsKey; reloadImages(); }
          else if (shuffleChanged) { rebuildOrder(); }
        }
        isRunning = !!props.running;
        isAuto    = !!props.autoAdvance;

        if (props.resetSeed !== lastReset) {
          lastReset = props.resetSeed;
          reloadImages();
        }

        if (props.stepSig !== lastStep) {
          lastStep = props.stepSig;
          const dir = props.stepDir;
          if (!ready || order.length === 0) return; // guard: nothing yet
          const N = order.length;
          if (dir === 1)  { idx = (idx + 1) % N; next = (idx + 1) % N; }
          if (dir === -1) { idx = (idx - 1 + N) % N; next = (idx + 1) % N; }
          timer = 0; phase = 'hold'; panX = 0; panY = 0;
        }
      };

      p.draw = () => {
        if (!ready || !imgs.length) { p.background(0); return; }

        const dt = Math.min(0.05, p.deltaTime / 1000);
        const t  = p.millis() / 1000;

        if (isRunning) {
          // constant motion
          const v = Math.max(0, S.speed);
          let vx = 0, vy = 0;
          switch (S.direction) {
            case 'left':  vx = -v; break;
            case 'right': vx =  v; break;
            case 'up':    vy = -v; break;
            case 'down':  vy =  v; break;
            case 'oscillateRightLeft': vx = Math.sin(t) * v; break;
            case 'oscillateUpDown':    vy = Math.sin(t) * v; break;
            case 'circular':           vx = Math.cos(t) * v; vy = Math.sin(t) * v; break;
            case 'static': default: vx = 0; vy = 0;
          }
          panX += vx * dt;
          panY += vy * dt;



// 3) then apply zoom + clamp (prevents showing outside the frame)
/* const z = Math.max(1, S.zoomMode === 'pulse'
  ? S.zoom * (1 + 0.06 * Math.sin(t * Math.max(0.01, S.zoomSpeed)))
  : S.zoom);
clampPanToCover(currentImage, z); */

          // slideshow only in auto mode
          const single = order.length <= 1;
          if (isAuto && !single) {
            timer += dt;
            const hold  = Math.max(0.1, S.duration);
            const trans = Math.max(0.05, S.transitionSeconds);
            if (phase === 'hold' && timer >= hold) { phase = 'transition'; timer = 0; }
            else if (phase === 'transition' && timer >= trans) {
              idx = (idx + 1) % order.length;
              next = (next + 1) % order.length;
              phase = 'hold'; timer = 0; panX = 0; panY = 0;
            }
          }
        }

        p.background(0);

        const A = imgs[order[idx] ?? 0];
        const B = imgs[order[next] ?? (order[idx] ?? 0)];

        const zoomNow =
          S.zoomMode === 'pulse'
            ? Math.max(1, S.zoom * (1 + 0.06 * Math.sin(t * Math.max(0.01, S.zoomSpeed))))
            : Math.max(1, S.zoom);

        // get wrapped (looping) offset → no stalling at edges, works with pulsing
        const { ox, oy } = wrapPanToCover(A, zoomNow);

        if (order.length > 1 && S.mode === 'crossfade' && phase === 'transition') {
          const blend = Math.min(1, timer / Math.max(0.05, S.transitionSeconds));
          drawImage(A, 1 - blend, zoomNow, ox, oy);
          drawImage(B, blend,     zoomNow, ox, oy);
        } else if (order.length > 1 && S.mode === 'slide' && phase === 'transition') {
          const D = Math.max(p.width, p.height);
          const blend = Math.min(1, timer / Math.max(0.05, S.transitionSeconds));
          let ax = 0, ay = 0, bx = 0, by = 0;
          switch (S.direction) {
            case 'left':  ax = -D * blend;  bx =  D * (1 - blend); break;
            case 'right': ax =  D * blend;  bx = -D * (1 - blend); break;
            case 'up':    ay = -D * blend;  by =  D * (1 - blend); break;
            case 'down':  ay =  D * blend;  by = -D * (1 - blend); break;
            default:      ax = -D * blend;  bx =  D * (1 - blend);
          }
          drawImage(A, 1, zoomNow, ox + ax, oy + ay);
          drawImage(B, 1, zoomNow, ox + bx, oy + by);
        } else {
          drawImage(A, 1, zoomNow, ox, oy);
        }

        // overlay
        if (S.overlayOpacity > 0) {
          const c = clampHex6(S.overlayColor);
          const r = parseInt(c.slice(1, 3), 16);
          const g = parseInt(c.slice(3, 5), 16);
          const b = parseInt(c.slice(5, 7), 16);
          const base = S.overlayOpacity;
          const oa = S.overlayOpacityMode === 'pulse'
            ? Math.max(0, Math.min(1, base * (0.5 + 0.5 * Math.sin(t * Math.max(0.01, S.overlayOpacitySpeed)))))
            : base;
          if (oa > 0) {
            p.noStroke();
            p.fill(r, g, b, 255 * oa);
            p.rect(0, 0, p.width, p.height);
          }
        }
      };
    };
  }, []);
return (
  <>
    {/* BACKGROUND LAYER */}
    <div
      className="
        fixed left-0 right-0 bottom-0
        top-[56px]            /* adjust if your top bar is taller/shorter */
        -z-10
        pointer-events-none
        bg-black
        overflow-hidden
      "
    >
      <ReactP5Wrapper
        sketch={sketch}
        settings={settings}
        running={running}
        autoAdvance={autoAdvance}
        resetSeed={resetSeed}
        stepSig={stepSig}
        stepDir={stepDir}
      />
    </div>

    {/* CONTROL PANEL LAYER (stays interactive) */}
    <ControlPanelPhoto
      settings={settings}
      setSettings={(updater) => setSettings(prev => {
        const next = typeof updater === 'function' ? (updater as any)(prev) : updater;
        next.overlayColor = clampHex6(next.overlayColor);
        return next;
      })}
      startAnimation={() => setRunning(true)}
      stopAnimation={() => setRunning(false)}
      resetAnimation={() => setResetSeed(s => s + 1)}
      autoAdvance={autoAdvance}
      setAutoAdvance={setAuto}
      prevImage={prevImage}
      nextImage={nextImage}
      shuffleNow={shuffleNow}
      setUrls={setUrls}
      loadSequence={loadSequence}
      loadSingleFromFolder={(folder, n, ext='jpg') => {
        const base = import.meta.env.BASE_URL || '/';
        setUrls([`${base}${folder}/${n}.${ext}`]);   // single → manual mode
        setAuto(false);
        setRunning(true);
      }}
    />
  </>
);

  // return (
  //   <div className="relative w-full h-[calc(100vh-80px)] bg-black overflow-hidden">
  //     {/* Canvas never blocks panel clicks */}
  //     <div className="absolute inset-0 pointer-events-none">
  //       <ReactP5Wrapper
  //         sketch={sketch}
  //         settings={settings}
  //         running={running}
  //         autoAdvance={autoAdvance}
  //         resetSeed={resetSeed}
  //         stepSig={stepSig}
  //         stepDir={stepDir}
  //       />
  //     </div>

  //     <ControlPanelPhoto
  //       settings={settings}
  //       setSettings={(updater) =>
  //         setSettings(prev => {
  //           const next = typeof updater === 'function' ? (updater as any)(prev) : updater;
  //           next.overlayColor = clampHex6(next.overlayColor);
  //           return next;
  //         })
  //       }
  //       startAnimation={() => setRunning(true)}
  //       stopAnimation={() => setRunning(false)}
  //       resetAnimation={() => setResetSeed(s => s + 1)}
  //       autoAdvance={autoAdvance}
  //       setAutoAdvance={setAuto}
  //       prevImage={prevImage}
  //       nextImage={nextImage}
  //       setUrls={setUrls}
  //       loadSequence={loadSequence}
  //       loadSingleFromFolder={loadSingleFromFolder}
  //     />
  //   </div>
  // );
};

export default PhotoAnimations;


// // src/components/Therapy/PhotoAnimations.tsx
// import React, { useCallback, useMemo, useState } from 'react';
// import { ReactP5Wrapper, type Sketch } from 'react-p5-wrapper';
// import ControlPanelPhoto from './ControlPanelPhoto';

// export type Direction =
//   | 'static'
//   | 'left' | 'right' | 'up' | 'down'
//   | 'oscillateRightLeft' | 'oscillateUpDown' | 'circular';

// export interface PhotoSettings {
//   urls: string[];
//   mode: 'kenburns' | 'slide' | 'crossfade';
//   scaleMode: 'cover' | 'contain';
//   direction: Direction;
//   speed: number;
//   duration: number;
//   transitionSeconds: number;
//   zoom: number;
//   zoomMode: 'constant' | 'pulse';
//   zoomSpeed: number;
//   overlayColor: string;        // #rrggbb
//   overlayOpacity: number;      // 0..1
//   overlayOpacityMode: 'constant' | 'pulse';
//   overlayOpacitySpeed: number;
//   shuffleKey?: number;
// }

// export const DEFAULTS: PhotoSettings = {
//   urls: [],
//   mode: 'kenburns',
//   scaleMode: 'cover',
//   direction: 'static',
//   speed: 120,
//   duration: 5,
//   transitionSeconds: 1.0,
//   zoom: 1.15,
//   zoomMode: 'constant',
//   zoomSpeed: 1.2,
//   overlayColor: '#000000',
//   overlayOpacity: 0,
//   overlayOpacityMode: 'constant',
//   overlayOpacitySpeed: 1,
//   shuffleKey: 0,
// };

// export const cloneDefaults = (): PhotoSettings => ({ ...DEFAULTS, urls: [] });

// const clampHex6 = (hex: string) => {
//   if (!hex?.startsWith('#')) return '#000000';
//   if (hex.length === 7) return hex;
//   if (hex.length === 9) return `#${hex.slice(1, 7)}`;
//   return '#000000';
// };

// const buildSequence = (folder: string, count: number, start = 1, ext = 'jpg') => {
//   const base = import.meta.env.BASE_URL || '/';
//   return Array.from({ length: count }, (_, i) => `${base}${folder}/${start + i}.${ext}`);
// };

// const PhotoAnimations: React.FC = () => {
//   const [settings, setSettings]   = useState<PhotoSettings>(cloneDefaults());

//   // transport + stepping state (must be inside component)
//   const [running, setRunning]       = useState(true);
//   const [autoAdvance, setAuto]      = useState(true);
//   const [resetSeed, setResetSeed]   = useState(0);
//   const [stepSig, setStepSig]       = useState(0);
//   const [stepDir, setStepDir]       = useState<-1 | 0 | 1>(0);

//   // helpers exposed to panel
//   const startAnimation = () => setRunning(true);
//   const stopAnimation  = () => setRunning(false);
//   const resetAnimation = () => setResetSeed(v => v + 1);
//   const shuffleNow     = () =>
//     setSettings(s => ({ ...s, shuffleKey: (s.shuffleKey ?? 0) + 1 }));

//   const setUrls = (urls: string[]) => {
//     setSettings(s => ({ ...s, urls }));
//     setResetSeed(v => v + 1);
//   };

//   const loadSequence = useCallback(
//     (folder: string, count: number, start = 1, ext = 'jpg') => {
//       setUrls(buildSequence(folder, count, start, ext));
//     },
//     []
//   );

//   const loadSingleFromFolder = useCallback(
//     (folder: string, index: number, ext = 'jpg') => {
//       setUrls(buildSequence(folder, 1, index, ext));
//       setAuto(false); // manual when single
//     },
//     []
//   );

//   const nextImage = () => { setAuto(false); setStepDir( 1); setStepSig(s => s + 1); };
//   const prevImage = () => { setAuto(false); setStepDir(-1); setStepSig(s => s + 1); };

//   const sketch = useMemo<Sketch>(() => {
//     return (p: any) => {
//       let S: PhotoSettings = { ...DEFAULTS };
//       let isRunning = true;
//       let isAuto    = true;

//       let imgs: any[] = [];
//       let ready = false;

//       let order: number[] = [];
//       let idx = 0, next = 1;
//       let phase: 'hold' | 'transition' = 'hold';
//       let timer = 0;

//       let panX = 0, panY = 0;

//       let lastReset = -1;
//       let lastStep  = -1;
//       let lastUrlsKey = '';

//       const shuffle = (arr: number[]) => {
//         const a = [...arr];
//         for (let i = a.length - 1; i > 0; i--) {
//           const j = (Math.random() * (i + 1)) | 0;
//           [a[i], a[j]] = [a[j], a[i]];
//         }
//         return a;
//       };

//       const fitSize = (iw: number, ih: number, cw: number, ch: number, mode: 'cover'|'contain') => {
//         const sr = cw / iw;
//         const tr = ch / ih;
//         const s = mode === 'cover' ? Math.max(sr, tr) : Math.min(sr, tr);
//         return { w: iw * s, h: ih * s };
//       };

//       const clampPanToCover = (img: any, zoomMult: number) => {
//         if (!img) return;
//         const fit = fitSize(img.width, img.height, p.width, p.height, S.scaleMode);
//         const w = fit.w * zoomMult;
//         const h = fit.h * zoomMult;
//         const maxX = Math.max(0, (w - p.width)  / 2);
//         const maxY = Math.max(0, (h - p.height) / 2);
//         if (panX >  maxX) panX =  maxX;
//         if (panX < -maxX) panX = -maxX;
//         if (panY >  maxY) panY =  maxY;
//         if (panY < -maxY) panY = -maxY;
//       };

//       const drawImage = (img: any, alpha: number, zoomMult: number, offX: number, offY: number) => {
//         if (!img) return;
//         const fit = fitSize(img.width, img.height, p.width, p.height, S.scaleMode);
//         const w = fit.w * zoomMult;
//         const h = fit.h * zoomMult;
//         const x = (p.width - w) / 2 + offX;
//         const y = (p.height - h) / 2 + offY;
//         p.push();
//         p.tint(255, 255 * alpha);
//         p.image(img, x, y, w, h);
//         p.pop();
//       };

//       p.setup = () => {
//         // draw inside our absolute container height (header ≈ 80px)
//         p.createCanvas(p.windowWidth, p.windowHeight - 80);
//         p.pixelDensity(1);
//       };
//       p.windowResized = () => {
//         p.resizeCanvas(p.windowWidth, p.windowHeight - 80);
//       };

//       const rebuildOrder = () => {
//         const base = Array.from({ length: imgs.length }, (_, k) => k);
//         order = S.shuffleKey ? shuffle(base) : base;
//         idx = 0;
//         next = imgs.length > 1 ? 1 : 0;
//         timer = 0;
//         phase = 'hold';
//         panX = 0; panY = 0;
//       };

//       const reloadImages = () => {
//         ready = false;
//         imgs = [];
//         let loaded = 0;
//         if (!S.urls?.length) return;
//         S.urls.forEach((u, i) => {
//           p.loadImage(
//             u,
//             (im: any) => {
//               imgs[i] = im;
//               loaded++;
//               if (loaded === S.urls.length) {
//                 rebuildOrder();
//                 ready = true;
//               }
//             },
//             () => {
//               imgs[i] = null;
//               loaded++;
//             }
//           );
//         });
//       };

//       p.updateWithProps = (props: {
//         settings: PhotoSettings;
//         running: boolean;
//         autoAdvance: boolean;
//         resetSeed: number;
//         stepSig: number;
//         stepDir: -1 | 0 | 1;
//       }) => {
//         if (props.settings) {
//           const nextS = { ...props.settings, overlayColor: clampHex6(props.settings.overlayColor) };
//           const urlsKey = nextS.urls.join('|');
//           const urlsChanged = urlsKey !== lastUrlsKey;
//           const shuffleChanged = (nextS.shuffleKey ?? 0) !== (S.shuffleKey ?? 0);
//           S = nextS;
//           if (urlsChanged) { lastUrlsKey = urlsKey; reloadImages(); }
//           else if (shuffleChanged) { rebuildOrder(); }
//         }
//         isRunning = !!props.running;
//         isAuto    = !!props.autoAdvance;

//         if (props.resetSeed !== lastReset) {
//           lastReset = props.resetSeed;
//           reloadImages();
//         }

//         if (props.stepSig !== lastStep) {
//           lastStep = props.stepSig;
//           const dir = props.stepDir;
//           if (ready && order.length > 0 && dir !== 0) {
//             const N = order.length;
//             if (dir === 1) { idx = (idx + 1) % N; next = (idx + 1) % N; }
//             else if (dir === -1) { idx = (idx - 1 + N) % N; next = (idx + 1) % N; }
//             timer = 0; phase = 'hold'; panX = 0; panY = 0;
//           }
//         }
//       };

//       p.draw = () => {
//         if (!ready || !imgs.length) { p.background(0); return; }

//         const dt = Math.min(0.05, p.deltaTime / 1000);
//         const t  = p.millis() / 1000;

//         // Update motion only when running
//         if (isRunning) {
//           // pan motion
//           const v = Math.max(0, S.speed);
//           let vx = 0, vy = 0;
//           switch (S.direction) {
//             case 'left':  vx = -v; break;
//             case 'right': vx =  v; break;
//             case 'up':    vy = -v; break;
//             case 'down':  vy =  v; break;
//             case 'oscillateRightLeft': vx = Math.sin(t) * v; break;
//             case 'oscillateUpDown':    vy = Math.sin(t) * v; break;
//             case 'circular':           vx = Math.cos(t) * v; vy = Math.sin(t) * v; break;
//             case 'static': default: vx = 0; vy = 0;
//           }
//           panX += vx * dt;
//           panY += vy * dt;

//           // phase / slideshow
//           const single = order.length <= 1;
//           if (isAuto && !single) {
//             timer += dt;
//             const hold  = Math.max(0.1, S.duration);
//             const trans = Math.max(0.05, S.transitionSeconds);
//             if (phase === 'hold' && timer >= hold) { phase = 'transition'; timer = 0; }
//             else if (phase === 'transition' && timer >= trans) {
//               idx = (idx + 1) % order.length;
//               next = (next + 1) % order.length;
//               phase = 'hold'; timer = 0; panX = 0; panY = 0;
//             }
//           }
//         }

//         // always render frame
//         p.background(0);

//         const A = imgs[order[idx] ?? 0];
//         const B = imgs[order[next] ?? (order[idx] ?? 0)];

//         const z = Math.max(1,
//           S.zoomMode === 'pulse'
//             ? S.zoom * (1 + 0.06 * Math.sin((p.millis() / 1000) * Math.max(0.01, S.zoomSpeed)))
//             : S.zoom
//         );

//         // keep image covering screen
//         clampPanToCover(A, z);

//         if (order.length > 1 && S.mode === 'crossfade' && phase === 'transition') {
//           const blend = Math.min(1, timer / Math.max(0.05, S.transitionSeconds));
//           drawImage(A, 1 - blend, z, panX, panY);
//           drawImage(B, blend,     z, panX, panY);
//         } else if (order.length > 1 && S.mode === 'slide' && phase === 'transition') {
//           const D = Math.max(p.width, p.height);
//           const blend = Math.min(1, timer / Math.max(0.05, S.transitionSeconds));
//           let ax = 0, ay = 0, bx = 0, by = 0;
//           switch (S.direction) {
//             case 'left':  ax = -D * blend;  bx =  D * (1 - blend); break;
//             case 'right': ax =  D * blend;  bx = -D * (1 - blend); break;
//             case 'up':    ay = -D * blend;  by =  D * (1 - blend); break;
//             case 'down':  ay =  D * blend;  by = -D * (1 - blend); break;
//             default:      ax = -D * blend;  bx =  D * (1 - blend);
//           }
//           drawImage(A, 1, z, panX + ax, panY + ay);
//           drawImage(B, 1, z, panX + bx, panY + by);
//         } else {
//           // single or holding: show A only
//           drawImage(A, 1, z, panX, panY);
//         }

//         // overlay
//         if (S.overlayOpacity > 0) {
//           const c = clampHex6(S.overlayColor);
//           const r = parseInt(c.slice(1, 3), 16);
//           const g = parseInt(c.slice(3, 5), 16);
//           const b = parseInt(c.slice(5, 7), 16);
//           const base = S.overlayOpacity;
//           const oa = S.overlayOpacityMode === 'pulse'
//             ? Math.max(0, Math.min(1, base * (0.5 + 0.5 * Math.sin((p.millis() / 1000) * Math.max(0.01, S.overlayOpacitySpeed)))))
//             : base;
//           if (oa > 0) {
//             p.noStroke();
//             p.fill(r, g, b, 255 * oa);
//             p.rect(0, 0, p.width, p.height);
//           }
//         }
//       };
//     };
//   }, []);

//   return (
//     <div className="relative w-full h-[calc(100vh-80px)] bg-black overflow-hidden">
//       {/* Canvas does NOT block clicks on the panel */}
//       <div className="absolute inset-0 pointer-events-none">
//         <ReactP5Wrapper
//           sketch={sketch}
//           settings={settings}
//           running={running}
//           autoAdvance={autoAdvance}
//           resetSeed={resetSeed}
//           stepSig={stepSig}
//           stepDir={stepDir}
//         />
//       </div>

//       <ControlPanelPhoto
//         settings={settings}
//         setSettings={(updater) =>
//           setSettings(prev => {
//             const next = typeof updater === 'function' ? (updater as any)(prev) : updater;
//             next.overlayColor = clampHex6(next.overlayColor);
//             return next;
//           })
//         }
//         startAnimation={startAnimation}
//         stopAnimation={stopAnimation}
//         resetAnimation={resetAnimation}
//         autoAdvance={autoAdvance}
//         setAutoAdvance={setAuto}
//         prevImage={prevImage}
//         nextImage={nextImage}
//         setUrls={setUrls}
//         loadSequence={loadSequence}
//         loadSingleFromFolder={loadSingleFromFolder}
//       />
//     </div>
//   );
// };

// export default PhotoAnimations;



// // PhotoAnimations.tsx
// import React, { useCallback, useMemo, useState } from 'react';
// import { ReactP5Wrapper, type Sketch } from 'react-p5-wrapper';
// import ControlPanelPhoto from './ControlPanelPhoto';

// export type Direction =
//   | 'static'
//   | 'left' | 'right' | 'up' | 'down'
//   | 'oscillateRightLeft' | 'oscillateUpDown' | 'circular';

// export interface PhotoSettings {
//   urls: string[];
//   mode: 'kenburns' | 'slide' | 'crossfade';
//   scaleMode: 'cover' | 'contain';
//   direction: Direction;
//   speed: number;
//   duration: number;
//   transitionSeconds: number;
//   zoom: number;
//   zoomMode: 'constant' | 'pulse';
//   zoomSpeed: number;
//   overlayColor: string;        // #rrggbb
//   overlayOpacity: number;      // 0..1
//   overlayOpacityMode: 'constant' | 'pulse';
//   overlayOpacitySpeed: number;
//   shuffleKey?: number;
// }

// export const DEFAULTS: PhotoSettings = {
//   urls: [],
//   mode: 'kenburns',
//   scaleMode: 'cover',
//   direction: 'static',
//   speed: 120,
//   duration: 5,
//   transitionSeconds: 1.0,
//   zoom: 1.15,
//   zoomMode: 'constant',
//   zoomSpeed: 1.2,
//   overlayColor: '#000000',
//   overlayOpacity: 0,
//   overlayOpacityMode: 'constant',
//   overlayOpacitySpeed: 1,
//   shuffleKey: 0,
// };

// export const cloneDefaults = (): PhotoSettings => ({ ...DEFAULTS, urls: [] });

// const clampHex6 = (hex: string) => (!hex?.startsWith('#') ? '#000000'
//   : hex.length === 7 ? hex
//   : hex.length === 9 ? `#${hex.slice(1,7)}`
//   : '#000000');

// const buildSequence = (folder: string, count: number, start = 1, ext = 'jpg') => {
//   const base = import.meta.env.BASE_URL || '/';
//   return Array.from({ length: count }, (_, i) => `${base}${folder}/${start + i}.${ext}`);
// };

// const PhotoAnimations: React.FC = () => {
//   const [settings, setSettings]   = useState<PhotoSettings>(cloneDefaults());
//   const [running, setRunning]     = useState(true);
//   const [autoAdvance, setAuto]    = useState(true);
//   const [resetSeed, setResetSeed] = useState(0);



//   // manual step signal
//   const [stepSig, setStepSig] = useState(0);
//   const [stepDir, setStepDir] = useState<-1 | 0 | 1>(0);

//   // transport
//   const startAnimation = () => setRunning(true);
//   const stopAnimation  = () => setRunning(false);
//   const resetAnimation = () => setResetSeed(v => v + 1);
//   const shuffleNow     = () => setSettings(s => ({ ...s, shuffleKey: (s.shuffleKey ?? 0) + 1 }));

//   // set urls
//   const setUrls = (urls: string[]) => {
//     setSettings(s => ({ ...s, urls }));
//     setResetSeed(v => v + 1);
//   };

//   // /public helpers
//   const loadSequence = useCallback((folder: string, count: number, start = 1, ext = 'jpg') => {
//     setUrls(buildSequence(folder, count, start, ext));
//   }, []);

//   const loadSingleFromFolder = useCallback((folder: string, index: number, ext = 'jpg') => {
//     const base = import.meta.env.BASE_URL || '/';
//     setUrls([`${base}${folder}/${index}.${ext}`]);
//   }, []);

//   const nextImage = () => { setStepDir(1);  setStepSig(s => s + 1); };
//   const prevImage = () => { setStepDir(-1); setStepSig(s => s + 1); };

//   const sketch = useMemo<Sketch>(() => {
//     return (p: any) => {
//       let S: PhotoSettings = { ...DEFAULTS };
//       let isRunning = true;
//       let isAuto    = true;

//       let imgs: any[] = [];
//       let ready = false;

//       let order: number[] = [];
//       let idx = 0, next = 1;
//       let phase: 'hold' | 'transition' = 'hold';
//       let timer = 0;

//       let panX = 0, panY = 0;

//       let lastReset = -1;
//       let lastStep  = -1;
//       let lastUrlsKey = '';

//       const shuffle = (arr: number[]) => {
//         const a = [...arr];
//         for (let i = a.length - 1; i > 0; i--) {
//           const j = (Math.random() * (i + 1)) | 0;
//           [a[i], a[j]] = [a[j], a[i]];
//         }
//         return a;
//       };

//       const fitSize = (iw: number, ih: number, cw: number, ch: number, mode: 'cover'|'contain') => {
//         const sr = cw / iw;
//         const tr = ch / ih;
//         const s = mode === 'cover' ? Math.max(sr, tr) : Math.min(sr, tr);
//         return { w: iw * s, h: ih * s };
//       };

//       const clampPanToCover = (img: any, zoomMult: number) => {
//         if (!img) return;
//         const fit = fitSize(img.width, img.height, p.width, p.height, S.scaleMode);
//         const w = fit.w * zoomMult;
//         const h = fit.h * zoomMult;
//         const maxX = Math.max(0, (w - p.width)  / 2);
//         const maxY = Math.max(0, (h - p.height) / 2);
//         if (panX >  maxX) panX =  maxX;
//         if (panX < -maxX) panX = -maxX;
//         if (panY >  maxY) panY =  maxY;
//         if (panY < -maxY) panY = -maxY;
//       };

//       const drawImage = (img: any, alpha: number, zoomMult: number, offX: number, offY: number) => {
//         if (!img) return;
//         const fit = fitSize(img.width, img.height, p.width, p.height, S.scaleMode);
//         const w = fit.w * zoomMult;
//         const h = fit.h * zoomMult;
//         const x = (p.width - w) / 2 + offX;
//         const y = (p.height - h) / 2 + offY;
//         p.push();
//         p.tint(255, 255 * alpha);
//         p.image(img, x, y, w, h);
//         p.pop();
//       };

//       const rebuildOrder = () => {
//         const base = Array.from({ length: imgs.length }, (_, k) => k);
//         order = S.shuffleKey ? shuffle(base) : base;
//         idx = 0;
//         next = imgs.length > 1 ? 1 : 0;
//         timer = 0;
//         phase = 'hold';
//         panX = 0; panY = 0;
//       };

//       const reloadImages = () => {
//         ready = false;
//         imgs = [];
//         let loaded = 0;
//         if (!S.urls?.length) return;
//         S.urls.forEach((u, i) => {
//           p.loadImage(u, (im: any) => {
//             imgs[i] = im;
//             loaded++;
//             if (loaded === S.urls.length) {
//               rebuildOrder();
//               ready = true;
//             }
//           }, () => {
//             imgs[i] = null;
//             loaded++;
//           });
//         });
//       };

//       p.setup = () => {
//         const cnv = p.createCanvas(p.windowWidth, p.windowHeight);
//         // make the canvas a non-interactive full-screen background
//         cnv.style('position', 'fixed');
//         cnv.style('left', '0');
//         cnv.style('top',  '0');
//         cnv.style('z-index', '0');
//         // critical: do NOT swallow panel clicks
//         (cnv.canvas as HTMLCanvasElement).style.pointerEvents = 'none';
//         p.pixelDensity(1);
//         p.noStroke();
//       };

//       p.windowResized = () => {
//         p.resizeCanvas(p.windowWidth, p.windowHeight);
//       };

//       p.updateWithProps = (props: {
//         settings: PhotoSettings;
//         running: boolean;
//         autoAdvance: boolean;
//         resetSeed: number;
//         stepSig: number;
//         stepDir: -1 | 0 | 1;
//       }) => {
//         if (props.settings) {
//           const nextS = { ...props.settings, overlayColor: clampHex6(props.settings.overlayColor) };
//           const urlsKey = nextS.urls.join('|');
//           const urlsChanged = urlsKey !== lastUrlsKey;
//           const shuffleChanged = (nextS.shuffleKey ?? 0) !== (S.shuffleKey ?? 0);
//           S = nextS;
//           if (urlsChanged) {
//             lastUrlsKey = urlsKey;
//             reloadImages();
//           } else if (shuffleChanged) {
//             rebuildOrder();
//           }
//         }
//         isRunning = !!props.running;
//         isAuto    = !!props.autoAdvance;

//         if (props.resetSeed !== lastReset) {
//           lastReset = props.resetSeed;
//           reloadImages();
//         }

//         if (props.stepSig !== lastStep) {
//           lastStep = props.stepSig;
//           const dir = props.stepDir;
//           if (ready && order.length > 0 && dir !== 0) {
//             const N = order.length;
//             if (dir === 1) { idx = (idx + 1) % N; next = (idx + 1) % N; }
//             else if (dir === -1) { idx = (idx - 1 + N) % N; next = (idx + 1) % N; }
//             timer = 0; phase = 'hold'; panX = 0; panY = 0;
//           }
//         }
//       };

//       p.draw = () => {
//         p.background(0);
//         if (!ready || !imgs.length) return;

//         // IMPORTANT: keep drawing while "stopped", but freeze time
//         const dt = isRunning ? Math.min(0.05, p.deltaTime / 1000) : 0;
//         const t  = p.millis() / 1000;

//         // pan motion
//         const v = Math.max(0, S.speed);
//         let vx = 0, vy = 0;
//         switch (S.direction) {
//           case 'left':  vx = -v; break;
//           case 'right': vx =  v; break;
//           case 'up':    vy = -v; break;
//           case 'down':  vy =  v; break;
//           case 'oscillateRightLeft': vx = Math.sin(t) * v; break;
//           case 'oscillateUpDown':    vy = Math.sin(t) * v; break;
//           case 'circular':           vx = Math.cos(t) * v; vy = Math.sin(t) * v; break;
//           case 'static':
//           default: vx = 0; vy = 0;
//         }
//         panX += vx * dt;
//         panY += vy * dt;

//         // auto-advance phase
//         const single = order.length <= 1;
//         if (isAuto && !single && isRunning) {
//           timer += dt;
//           const hold  = Math.max(0.1, S.duration);
//           const trans = Math.max(0.05, S.transitionSeconds);
//           if (phase === 'hold' && timer >= hold) { phase = 'transition'; timer = 0; }
//           else if (phase === 'transition' && timer >= trans) {
//             idx = (idx + 1) % order.length;
//             next = (next + 1) % order.length;
//             phase = 'hold'; timer = 0; panX = 0; panY = 0;
//           }
//         } else {
//           timer = 0; phase = 'hold'; // manual or single: never auto-switch
//         }

//         const A = imgs[order[idx] ?? 0];
//         const B = imgs[order[next] ?? (order[idx] ?? 0)];

//         const zoomPulse = S.zoomMode === 'pulse'
//           ? S.zoom * (1 + 0.06 * Math.sin(t * Math.max(0.01, S.zoomSpeed)))
//           : S.zoom;
//         const z = Math.max(1, zoomPulse);

//         // never reveal black bars
//         clampPanToCover(A, z);

//         if (!single && S.mode === 'crossfade') {
//           const blend = phase === 'transition' ? Math.min(1, timer / Math.max(0.05, S.transitionSeconds)) : 0;
//           drawImage(A, 1 - blend, z, panX, panY);
//           drawImage(B, blend,     z, panX, panY);
//         } else if (!single && S.mode === 'slide') {
//           const D = Math.max(p.width, p.height);
//           const blend = phase === 'transition' ? Math.min(1, timer / Math.max(0.05, S.transitionSeconds)) : 0;
//           let ax = 0, ay = 0, bx = 0, by = 0;
//           switch (S.direction) {
//             case 'left':  ax = -D * blend;  bx =  D * (1 - blend); break;
//             case 'right': ax =  D * blend;  bx = -D * (1 - blend); break;
//             case 'up':    ay = -D * blend;  by =  D * (1 - blend); break;
//             case 'down':  ay =  D * blend;  by = -D * (1 - blend); break;
//             default:      ax = -D * blend;  bx =  D * (1 - blend);
//           }
//           drawImage(A, 1, z, panX + ax, panY + ay);
//           drawImage(B, 1, z, panX + bx, panY + by);
//         } else {
//           // single image or kenburns
//           drawImage(A, 1, z, panX, panY);
//         }

//         // overlay
//         if (S.overlayOpacity > 0) {
//           const c = S.overlayColor;
//           const r = parseInt(c.slice(1, 3), 16);
//           const g = parseInt(c.slice(3, 5), 16);
//           const b = parseInt(c.slice(5, 7), 16);
//           const base = S.overlayOpacity;
//           const oa = S.overlayOpacityMode === 'pulse'
//             ? Math.max(0, Math.min(1, base * (0.5 + 0.5 * Math.sin(t * Math.max(0.01, S.overlayOpacitySpeed)))))
//             : base;
//           if (oa > 0) {
//             p.fill(r, g, b, 255 * oa);
//             p.rect(0, 0, p.width, p.height);
//           }
//         }
//       };
//     };
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//  return (
//   <div className="relative w-full h-[calc(100vh-80px)] bg-black overflow-hidden">
//     <div className="fixed inset-0 pointer-events-none -z-10">
//       <ReactP5Wrapper
//         sketch={sketch}
//         settings={settings}
//         running={running}
//         autoAdvance={autoAdvance}
//         resetSeed={resetSeed}
//         stepSig={stepSig}
//         stepDir={stepDir}
//       />
//     </div>

//     <ControlPanelPhoto
    
//       settings={settings}
//       setSettings={(updater) => setSettings(prev => {
//         const next = typeof updater === 'function' ? (updater as any)(prev) : updater;
//         next.overlayColor = next.overlayColor?.startsWith('#') && next.overlayColor.length === 7 ? next.overlayColor : '#000000';
//         return next;
//       })}
      
      
//       startAnimation={() => setRunning(true)}
//       stopAnimation={() => setRunning(false)}
//       resetAnimation={() => setResetSeed(s => s + 1)}
//       autoAdvance={autoAdvance}
//       setAutoAdvance={setAuto}
//       prevImage={() => { setAuto(false); setStepDir(-1); setStepSig(s => s + 1); }}
//       nextImage={() => { setAuto(false); setStepDir(1);  setStepSig(s => s + 1); }}
//       setUrls={(urls) => { setSettings(s => ({ ...s, urls })); setResetSeed(v => v + 1); }}
//       loadSequence={(folder, count, start = 1, ext = 'jpg') => {
//         const base = import.meta.env.BASE_URL || '/';
//         const urls = Array.from({ length: count }, (_, i) => `${base}${folder}/${start + i}.${ext}`);
//         setSettings(s => ({ ...s, urls })); setResetSeed(v => v + 1);
//       }}
//       loadSingleFromFolder={(folder, index, ext = 'jpg') => {
//         const base = import.meta.env.BASE_URL || '/';
//         setSettings(s => ({ ...s, urls: [`${base}${folder}/${index}.${ext}`] })); setResetSeed(v => v + 1);
//       }}
//     />
//   </div>
// );

// };

// export default PhotoAnimations;


// import React, { useCallback, useMemo, useState } from 'react';
// import { ReactP5Wrapper, type Sketch } from 'react-p5-wrapper';
// import ControlPanelPhoto from './ControlPanelPhoto';

// export type Direction =
//   | 'static'
//   | 'left' | 'right' | 'up' | 'down'
//   | 'oscillateRightLeft' | 'oscillateUpDown' | 'circular';

// export interface PhotoSettings {
//   urls: string[];
//   mode: 'kenburns' | 'slide' | 'crossfade';
//   scaleMode: 'cover' | 'contain';
//   direction: Direction;
//   speed: number;
//   duration: number;
//   transitionSeconds: number;
//   zoom: number;
//   zoomMode: 'constant' | 'pulse';
//   zoomSpeed: number;
//   overlayColor: string;        // #rrggbb
//   overlayOpacity: number;      // 0..1
//   overlayOpacityMode: 'constant' | 'pulse';
//   overlayOpacitySpeed: number;
//   shuffleKey?: number;
// }

// export const DEFAULTS: PhotoSettings = {
//   urls: [],
//   mode: 'kenburns',
//   scaleMode: 'cover',
//   direction: 'static',
//   speed: 120,
//   duration: 5,
//   transitionSeconds: 1.0,
//   zoom: 1.15,
//   zoomMode: 'constant',
//   zoomSpeed: 1.2,
//   overlayColor: '#000000',
//   overlayOpacity: 0,
//   overlayOpacityMode: 'constant',
//   overlayOpacitySpeed: 1,
//   shuffleKey: 0,
// };

// export const cloneDefaults = (): PhotoSettings => ({ ...DEFAULTS, urls: [] });

//  // helpers used by panel
//  const setUrls = (urls: string[]) => {
//    setSettings(s => ({ ...s, urls }));
//    setResetSeed(v => v + 1);
//  };

//  const loadSingleFromFolder = (folder: string, index: number, ext = 'jpg') => {
//    const base = import.meta.env.BASE_URL || '/';
//    const one = `${base}${folder}/${index}.${ext}`;
//    setSettings(s => ({ ...s, urls: [one] }));
//   setAuto(false);             // manual mode
//    setResetSeed(v => v + 1);   // reset p5 state
//  };


// const clampHex6 = (hex: string) => {
//   if (!hex?.startsWith('#')) return '#000000';
//   if (hex.length === 7) return hex;
//   if (hex.length === 9) return `#${hex.slice(1, 7)}`;
//   return '#000000';
// };

// const buildSequence = (folder: string, count: number, start = 1, ext = 'jpg') => {
//   const base = import.meta.env.BASE_URL || '/';
//   return Array.from({ length: count }, (_, i) => `${base}${folder}/${start + i}.${ext}`);
// };

// const PhotoAnimations: React.FC = () => {
//   const [settings, setSettings]   = useState<PhotoSettings>(cloneDefaults());
//   //const [running, setRunning]     = useState(true);
//   const running = true; // keep drawing, always

//   //const [autoAdvance, setAuto]    = useState(true);
  
//   // const [running, setRunning] = useState(true);  // ← remove this; we always draw
// const [autoAdvance, setAuto] = useState(true);

// const startAnimation = () => setAuto(true);   // start = Auto ON
// const stopAnimation  = () => setAuto(false);  // stop  = Auto OFF
// const resetAnimation = () => setResetSeed(v => v + 1);

//   const [resetSeed, setResetSeed] = useState(0);

//   // manual step signal
//   const [stepSig, setStepSig] = useState(0);
//   const [stepDir, setStepDir] = useState<-1 | 0 | 1>(0);

//   // transport
//   //const startAnimation = () => setRunning(true);
//   //const stopAnimation  = () => setRunning(false);
// //  const resetAnimation = () => setResetSeed(v => v + 1);
//   const shuffleNow     = () => setSettings(s => ({ ...s, shuffleKey: (s.shuffleKey ?? 0) + 1 }));

//   // set urls
//   const setUrls = (urls: string[]) => {
//     setSettings(s => ({ ...s, urls }));
//     setResetSeed(v => v + 1);
//   };

//   // /public loaders
//   const loadSequence = useCallback((folder: string, count: number, start = 1, ext = 'jpg') => {
//     setUrls(buildSequence(folder, count, start, ext));
//   }, []);

//   // manual stepping
//   const nextImage = () => { setStepDir(1);  setStepSig(s => s + 1); };
//   const prevImage = () => { setStepDir(-1); setStepSig(s => s + 1); };

//   const sketch = useMemo<Sketch>(() => {
//     return (p: any) => {
//       let S: PhotoSettings = { ...DEFAULTS };
//       let isRunning = true;
//       let isAuto    = true;

//       let imgs: any[] = [];
//       let ready = false;

//       let order: number[] = [];
//       let idx = 0, next = 1;
//       let phase: 'hold' | 'transition' = 'hold';
//       let timer = 0;

//       let panX = 0, panY = 0;

//       let lastReset = -1;
//       let lastStep  = -1;
//       let lastUrlsKey = '';
// let lastAutoFlag = true;

//       const shuffle = (arr: number[]) => {
//         const a = [...arr];
//         for (let i = a.length - 1; i > 0; i--) {
//           const j = (Math.random() * (i + 1)) | 0;
//           [a[i], a[j]] = [a[j], a[i]];
//         }
//         return a;
//       };

//       const fitSize = (iw: number, ih: number, cw: number, ch: number, mode: 'cover'|'contain') => {
//         const sr = cw / iw;
//         const tr = ch / ih;
//         const s = mode === 'cover' ? Math.max(sr, tr) : Math.min(sr, tr);
//         return { w: iw * s, h: ih * s };
//       };

//       const clampPanToCover = (img: any, zoomMult: number) => {
//         if (!img) return;
//         const fit = fitSize(img.width, img.height, p.width, p.height, S.scaleMode);
//         const w = fit.w * zoomMult;
//         const h = fit.h * zoomMult;
//         const maxX = Math.max(0, (w - p.width)  / 2);
//         const maxY = Math.max(0, (h - p.height) / 2);
//         if (panX >  maxX) panX =  maxX;
//         if (panX < -maxX) panX = -maxX;
//         if (panY >  maxY) panY =  maxY;
//         if (panY < -maxY) panY = -maxY;
//       };

//       const drawImage = (img: any, alpha: number, zoomMult: number, offX: number, offY: number) => {
//         if (!img) return;
//         const fit = fitSize(img.width, img.height, p.width, p.height, S.scaleMode);
//         const w = fit.w * zoomMult;
//         const h = fit.h * zoomMult;
//         const x = (p.width - w) / 2 + offX;
//         const y = (p.height - h) / 2 + offY;
//         p.push();
//         p.tint(255, 255 * alpha);
//         p.image(img, x, y, w, h);
//         p.pop();
//       };

//       const zoomFactor = (t: number) => {
//         if (S.zoomMode === 'pulse') {
//           return Math.max(1, S.zoom * (1 + 0.06 * Math.sin(t * Math.max(0.01, S.zoomSpeed))));
//         }
//         return S.zoom;
//       };

//       const overlayAlpha = (t: number) => {
//         const base = S.overlayOpacity;
//         if (S.overlayOpacityMode === 'pulse') {
//           return Math.max(0, Math.min(1, base * (0.5 + 0.5 * Math.sin(t * Math.max(0.01, S.overlayOpacitySpeed)))));
//         }
//         return base;
//       };

//       const rebuildOrder = () => {
//         const base = Array.from({ length: imgs.length }, (_, k) => k);
//         order = S.shuffleKey ? shuffle(base) : base;
//         idx = 0;
//         next = imgs.length > 1 ? 1 : 0;
//         timer = 0;
//         phase = 'hold';
//         panX = 0; panY = 0;
//       };

//       const reloadImages = () => {
//         ready = false;
//         imgs = [];
//         let loaded = 0;
//         if (!S.urls?.length) return;
//         S.urls.forEach((u, i) => {
//           p.loadImage(u, (im: any) => {
//             imgs[i] = im;
//             loaded++;
//             if (loaded === S.urls.length) {
//               rebuildOrder();
//               ready = true;
//             }
//           }, () => {
//             imgs[i] = null;
//             loaded++;
//           });
//         });
//       };

//  /*      p.setup = () => {
//         p.createCanvas(p.windowWidth, p.windowHeight - 80);
//         p.pixelDensity(1);
//       };

//       p.windowResized = () => {
//         p.resizeCanvas(p.windowWidth, p.windowHeight - 80);
//       };
//  */
 
 
//  p.setup = () => {
//   const c = p.createCanvas(p.windowWidth, p.windowHeight);
//   c.style('position', 'absolute');
//   c.style('inset', '0');
//   p.pixelDensity(1);
// };
// p.windowResized = () => { p.resizeCanvas(p.windowWidth, p.windowHeight); };

// /*       p.updateWithProps = (props: {
//         settings: PhotoSettings;
//         running: boolean;
//         autoAdvance: boolean;
//         resetSeed: number;
//         stepSig: number;
//         stepDir: -1 | 0 | 1;
//       }) => {
//         if (props.settings) {
//           const nextS = { ...props.settings, overlayColor: clampHex6(props.settings.overlayColor) };
//           const urlsKey = nextS.urls.join('|');
//           const urlsChanged = urlsKey !== lastUrlsKey;
//           const shuffleChanged = (nextS.shuffleKey ?? 0) !== (S.shuffleKey ?? 0);
//           S = nextS;
//           if (urlsChanged) {
//             lastUrlsKey = urlsKey;
//             reloadImages();
//           } else if (shuffleChanged) {
//             rebuildOrder();
//           }
//         }
//         isRunning = !!props.running;
//        isAuto = !!props.autoAdvance;
// if (lastAutoFlag && !isAuto) {
//  phase = 'hold';+  timer = 0;
//   panX = 0; panY = 0;
// }
// let lastAutoFlag = true;


//         if (props.resetSeed !== lastReset) {
//           lastReset = props.resetSeed;
//           reloadImages();
//         }

//         if (props.stepSig !== lastStep) {
//           lastStep = props.stepSig;
//           const dir = props.stepDir;
//           if (ready && order.length > 0 && dir !== 0) {
//             const N = order.length;
//             if (dir === 1) { idx = (idx + 1) % N; next = (idx + 1) % N; }
//             else if (dir === -1) { idx = (idx - 1 + N) % N; next = (idx + 1) % N; }
//             timer = 0; phase = 'hold'; panX = 0; panY = 0;
//           }
//         }
//       }; */
// p.updateWithProps = (props: {
//   settings: PhotoSettings;
//   running: boolean;
//   autoAdvance: boolean;
//   resetSeed: number;
//   stepSig: number;
//   stepDir: -1 | 0 | 1;
// }) => {
//   if (props.settings) {
//     const nextS = { ...props.settings, overlayColor: clampHex6(props.settings.overlayColor) };
//     const urlsKey = nextS.urls.join('|');
//     const urlsChanged = urlsKey !== lastUrlsKey;
//     const shuffleChanged = (nextS.shuffleKey ?? 0) !== (S.shuffleKey ?? 0);
//     S = nextS;
//     if (urlsChanged) {
//       lastUrlsKey = urlsKey;
//       reloadImages();
//     } else if (shuffleChanged) {
//       rebuildOrder();
//     }
//   }

//   // auto on/off edge handling
//   isAuto = !!props.autoAdvance;
//   if (lastAutoFlag && !isAuto) {
//     // just turned Auto OFF → stop any transition immediately
//     phase = 'hold';
//     timer = 0;
//     panX = 0; panY = 0;
//   }
//   lastAutoFlag = isAuto;

//   // reset seed always clears motion/order
//   if (props.resetSeed !== lastReset) {
//     lastReset = props.resetSeed;
//     timer = 0; phase = 'hold'; panX = 0; panY = 0;
//     if (S.urls?.length) rebuildOrder();
//   }

//   // manual stepping (Prev/Next)
//   if (props.stepSig !== lastStep) {
//     lastStep = props.stepSig;
//     const dir = props.stepDir;
//     if (ready && order.length > 0 && dir !== 0) {
//       const N = order.length;
//       idx = (idx + (dir === 1 ? 1 : -1) + N) % N;
//       next = (idx + 1) % N;
//       timer = 0; phase = 'hold'; panX = 0; panY = 0;
//     }
//   }
// };

//       p.draw = () => {
//         if (!ready || !imgs.length) { p.background(0); return; }
//         if (!isRunning) return;        // keeps last frame visible

//         p.background(0);

//         const dt = Math.min(0.05, p.deltaTime / 1000);
//         const t  = p.millis() / 1000;

//         // pan motion
//         const v = Math.max(0, S.speed);
//         let vx = 0, vy = 0;
//         switch (S.direction) {
//           case 'left':  vx = -v; break;
//           case 'right': vx =  v; break;
//           case 'up':    vy = -v; break;
//           case 'down':  vy =  v; break;
//           case 'oscillateRightLeft': vx = Math.sin(t) * v; break;
//           case 'oscillateUpDown':    vy = Math.sin(t) * v; break;
//           case 'circular':           vx = Math.cos(t) * v; vy = Math.sin(t) * v; break;
//           case 'static':
//           default: vx = 0; vy = 0;
//         }
//         panX += vx * dt;
//         panY += vy * dt;

//         // phase logic
//         const single = order.length <= 1;
//         if (isAuto && !single) {
//           timer += dt;
//           const hold  = Math.max(0.1, S.duration);
//           const trans = Math.max(0.05, S.transitionSeconds);
//           if (phase === 'hold' && timer >= hold) { phase = 'transition'; timer = 0; }
//           else if (phase === 'transition' && timer >= trans) {
//             idx = (idx + 1) % order.length;
//             next = (next + 1) % order.length;
//             phase = 'hold'; timer = 0; panX = 0; panY = 0;
//           }
//         } else {
//           // manual or single image: no auto-advance
//           timer = 0; phase = 'hold';
//         }

//         // draw
//         const A = imgs[order[idx] ?? 0];
//         const B = imgs[order[next] ?? (order[idx] ?? 0)];
//         const z = Math.max(1, S.zoomMode === 'pulse'
//           ? S.zoom * (1 + 0.06 * Math.sin(t * Math.max(0.01, S.zoomSpeed))) : S.zoom);

//         // clamp so we never reveal black bars
//         clampPanToCover(A, z);

//         if (!single && S.mode === 'crossfade') {
//           const blend = phase === 'transition' ? Math.min(1, timer / Math.max(0.05, S.transitionSeconds)) : 0;
//           drawImage(A, 1 - blend, z, panX, panY);
//           drawImage(B, blend,     z, panX, panY);
//         } else if (!single && S.mode === 'slide') {
//           const D = Math.max(p.width, p.height);
//           const blend = phase === 'transition' ? Math.min(1, timer / Math.max(0.05, S.transitionSeconds)) : 0;
//           let ax = 0, ay = 0, bx = 0, by = 0;
//           switch (S.direction) {
//             case 'left':  ax = -D * blend;  bx =  D * (1 - blend); break;
//             case 'right': ax =  D * blend;  bx = -D * (1 - blend); break;
//             case 'up':    ay = -D * blend;  by =  D * (1 - blend); break;
//             case 'down':  ay =  D * blend;  by = -D * (1 - blend); break;
//             default:      ax = -D * blend;  bx =  D * (1 - blend);
//           }
//           drawImage(A, 1, z, panX + ax, panY + ay);
//           drawImage(B, 1, z, panX + bx, panY + by);
//         } else {
//           // single image or kenburns
//           drawImage(A, 1, z, panX, panY);
//         }

//         // overlay
//         if (S.overlayOpacity > 0) {
//           const c = S.overlayColor;
//           const r = parseInt(c.slice(1, 3), 16);
//           const g = parseInt(c.slice(3, 5), 16);
//           const b = parseInt(c.slice(5, 7), 16);
//           const base = S.overlayOpacity;
//           const oa = S.overlayOpacityMode === 'pulse'
//             ? Math.max(0, Math.min(1, base * (0.5 + 0.5 * Math.sin(t * Math.max(0.01, S.overlayOpacitySpeed)))))
//             : base;
//           if (oa > 0) {
//             p.noStroke();
//             p.fill(r, g, b, 255 * oa);
//             p.rect(0, 0, p.width, p.height);
//           }
//         }
//       };
//     };
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   return (
//     // <div className="fixed inset-0 -z-10 pointer-events-none">
//     <div className="fixed inset-0 bg-black overflow-hidden">   {/* fills the whole viewport */}
//       <ReactP5Wrapper
//         sketch={sketch}
//         settings={settings}
//         running={running}
//         autoAdvance={autoAdvance}
//         resetSeed={resetSeed}
//         stepSig={stepSig}
//         stepDir={stepDir}
//       />

//       <ControlPanelPhoto
//         settings={settings}
//         setSettings={(updater) => setSettings(prev => {
//           const next = typeof updater === 'function' ? (updater as any)(prev) : updater;
//           next.overlayColor = clampHex6(next.overlayColor);
//           return next;
//         })}
//         startAnimation={() => setRunning(true)}
//         stopAnimation={() => setRunning(false)}
//         resetAnimation={() => setResetSeed(s => s + 1)}
//         autoAdvance={autoAdvance}
//         setAutoAdvance={setAuto}
//         prevImage={prevImage}
//         nextImage={nextImage}
//         shuffleNow={shuffleNow}
//         setUrls={setUrls}
//         loadSequence={loadSequence}
//         loadSingleFromFolder={loadSingleFromFolder}
//       />
//     </div>
//   );
// };

// export default PhotoAnimations;



// // src/components/Therapy/PhotoAnimations.tsx
// import React, { useCallback, useMemo, useRef, useState } from 'react';
// import type { CSSProperties } from 'react';
// import { ReactP5Wrapper, Sketch } from 'react-p5-wrapper';
// import ControlPanelPhoto from './ControlPanelPhoto';

// export type Direction =
//   | 'static'
//   | 'left' | 'right' | 'up' | 'down'
//   | 'oscillateRightLeft' | 'oscillateUpDown' | 'circular';

// export interface PhotoSettings {
//   urls: string[];
//   mode: 'kenburns' | 'slide' | 'crossfade';
//   scaleMode: 'cover' | 'contain';
//   direction: Direction;
//   speed: number;               // px per second (pan speed)
//   duration: number;            // seconds per image (hold)
//   transitionSeconds: number;   // seconds for crossfade/slide
//   zoom: number;                // base zoom multiplier
//   zoomMode: 'constant' | 'pulse';
//   zoomSpeed: number;           // pulse speed
//   overlayColor: string;        // #rrggbb
//   overlayOpacity: number;      // 0..1
//   overlayOpacityMode: 'constant' | 'pulse';
//   overlayOpacitySpeed: number; // pulse speed
//   shuffleKey?: number;
// }

// export const DEFAULTS: PhotoSettings = {
//   urls: [],
//   mode: 'kenburns',
//   scaleMode: 'cover',
//   direction: 'static',
//   speed: 120,                  // faster so motion is obvious
//   duration: 5,
//   transitionSeconds: 1.2,
//   zoom: 1.15,
//   zoomMode: 'constant',
//   zoomSpeed: 1.2,
//   overlayColor: '#000000',
//   overlayOpacity: 0,
//   overlayOpacityMode: 'constant',
//   overlayOpacitySpeed: 1,
//   shuffleKey: 0,
// };

// export const cloneDefaults = (): PhotoSettings => ({ ...DEFAULTS, urls: [] });

// /** build /public paths like /bgphotos/1.jpg…N.jpg */
// const buildSequence = (folder: string, count: number, start = 1, ext = 'jpg') => {
//   const base = import.meta.env.BASE_URL || '/';
//   return Array.from({ length: count }, (_, i) => `${base}${folder}/${start + i}.${ext}`);
// };

// /** small helper so <input type=color> stays #rrggbb */
// const clampHex6 = (hex: string) => {
//   if (!hex || !hex.startsWith('#')) return '#000000';
//   if (hex.length === 7) return hex;
//   if (hex.length === 9) return '#' + hex.slice(1, 7);
//   return '#000000';
// };

// const PhotoAnimations: React.FC = () => {
//   const [settings, setSettings] = useState<PhotoSettings>(cloneDefaults());
//   const [running, setRunning]   = useState(true);
//   const [resetSeed, setReset]   = useState(0);

//   const startAnimation = () => setRunning(true);
//   const stopAnimation  = () => setRunning(false);
//   const resetAnimation = () => setReset(s => s + 1);
//   const shuffleNow     = () => setSettings(s => ({ ...s, shuffleKey: (s.shuffleKey ?? 0) + 1 }));

//   // quick loader: /public/bgphotos/1.jpg..N
//   const loadSequence = useCallback((folder: string, count: number, start = 1, ext = 'jpg') => {
//     const urls = buildSequence(folder, count, start, ext);
//     setSettings(s => ({ ...s, urls }));
//     setReset(s => s + 1);
//   }, []);

//   /** p5 sketch – all the animation lives here */
//   const sketch = useMemo<Sketch>(() => {
//     return (p: any) => {
//       // state inside the sketch
//       let imgs: any[] = [];
//       let ready = false;

//       let order: number[] = [];
//       let idx = 0;               // current order index
//       let next = 1;              // next order index
//       let phase: 'hold'|'transition' = 'hold';
//       let timer = 0;             // seconds within current phase

//       // pan pos
//       let panX = 0, panY = 0;

//       // keep a copy of props
//       let S: PhotoSettings = { ...settings };

//       // ---------- helpers ----------
//       const shuffle = (arr: number[]) => {
//         const a = [...arr];
//         for (let i = a.length - 1; i > 0; i--) {
//           const j = (Math.random() * (i + 1)) | 0;
//           [a[i], a[j]] = [a[j], a[i]];
//         }
//         return a;
//       };

//       const fitSize = (iw: number, ih: number, cw: number, ch: number, mode: 'cover'|'contain') => {
//         const sr = cw / iw;
//         const tr = ch / ih;
//         const s = mode === 'cover' ? Math.max(sr, tr) : Math.min(sr, tr);
//         return { w: iw * s, h: ih * s };
//       };

//       const drawImage = (img: any, alpha: number, zoomMult: number, offX: number, offY: number) => {
//         if (!img) return;
//         const fit = fitSize(img.width, img.height, p.width, p.height, S.scaleMode);
//         const w = fit.w * zoomMult;
//         const h = fit.h * zoomMult;

//         p.push();
//         p.tint(255, 255 * alpha);
//         // center the image, then add pan offset
//         const x = (p.width  - w) / 2 + offX;
//         const y = (p.height - h) / 2 + offY;
//         p.image(img, x, y, w, h);
//         p.pop();
//       };

//       const zoomFactor = (t: number) => {
//         if (S.zoomMode === 'pulse') {
//           return Math.max(1, S.zoom * (1 + 0.06 * Math.sin(t * Math.max(0.01, S.zoomSpeed))));
//         }
//         return S.zoom;
//       };

//       const overlayAlpha = (t: number) => {
//         const base = S.overlayOpacity;
//         if (S.overlayOpacityMode === 'pulse') {
//           return Math.max(0, Math.min(1, base * (0.5 + 0.5 * Math.sin(t * Math.max(0.01, S.overlayOpacitySpeed)))));
//         }
//         return base;
//       };

//       // ---------- lifecycle ----------
//       p.preload = () => {
//         // nothing – we’ll load on props
//       };

//       p.setup = () => {
//         p.createCanvas(p.windowWidth, p.windowHeight - 80); // similar to your layout
//         p.pixelDensity(1);
//       };

//       p.windowResized = () => {
//         p.resizeCanvas(p.windowWidth, p.windowHeight - 80);
//       };

//       p.updateWithProps = (props: { settings: PhotoSettings; running: boolean; resetSeed: number; }) => {
//         if (props) S = { ...props.settings, overlayColor: clampHex6(props.settings.overlayColor) };

//         // handle reset (reload, reshuffle)
//         if (props?.resetSeed !== undefined) {
//           // (Re)load images when urls change or reset is triggered
//           if (!imgs.length || imgs.length !== S.urls.length) {
//             imgs = [];
//             ready = false;
//             let loaded = 0;
//             S.urls.forEach((u, i) => {
//               p.loadImage(u, (im: any) => {
//                 imgs[i] = im;
//                 loaded++;
//                 if (loaded === S.urls.length) {
//                   // order & indices
//                   const base = Array.from({ length: imgs.length }, (_, k) => k);
//                   order = S.shuffleKey ? shuffle(base) : base;
//                   idx = 0;
//                   next = imgs.length > 1 ? 1 : 0;
//                   timer = 0;
//                   phase = 'hold';
//                   panX = 0; panY = 0;
//                   ready = true;
//                 }
//               }, () => {
//                 // failed load – leave hole
//                 imgs[i] = null;
//                 loaded++;
//               });
//             });
//           } else {
//             // just reshuffle / reset motion
//             const base = Array.from({ length: imgs.length }, (_, k) => k);
//             order = S.shuffleKey ? shuffle(base) : base;
//             idx = 0;
//             next = imgs.length > 1 ? 1 : 0;
//             timer = 0;
//             phase = 'hold';
//             panX = 0; panY = 0;
//             ready = true;
//           }
//         }
//       };

//       p.draw = () => {
//         // background & guard
//         p.background(0);
//         if (!ready || !imgs.length) return;
//         if (!running) return;

//         // time
//         const dt = Math.min(0.05, p.deltaTime / 1000);
//         const t  = p.millis() / 1000;

//         // phase timing
//         timer += dt;
//         const hold = Math.max(0.1, S.duration);
//         const trans = Math.max(0.05, S.transitionSeconds);
//         if (phase === 'hold' && timer >= hold) {
//           phase = 'transition';
//           timer = 0;
//         } else if (phase === 'transition' && timer >= trans) {
//           idx = (idx + 1) % order.length;
//           next = (next + 1) % order.length;
//           phase = 'hold';
//           timer = 0;
//         }

//         // pan velocity from direction
//         const v = Math.max(0, S.speed);
//         let vx = 0, vy = 0;
//         switch (S.direction) {
//           case 'left':  vx = -v; break;
//           case 'right': vx =  v; break;
//           case 'up':    vy = -v; break;
//           case 'down':  vy =  v; break;
//           case 'oscillateRightLeft': vx = Math.sin(t) * v; break;
//           case 'oscillateUpDown':    vy = Math.sin(t) * v; break;
//           case 'circular':           vx = Math.cos(t) * v; vy = Math.sin(t) * v; break;
//           case 'static':
//           default: vx = 0; vy = 0;
//         }
//         panX += vx * dt;
//         panY += vy * dt;

//         // transition blend
//         const blend = phase === 'transition' ? Math.min(1, timer / trans) : 0;

//         // draw current/next with appropriate mode
//         const aIdx = order[idx] ?? 0;
//         const nIdx = order[next] ?? aIdx;
//         const A = imgs[aIdx];
//         const B = imgs[nIdx];

//         const z = zoomFactor(t);

//         if (S.mode === 'crossfade') {
//           // A fades out, B fades in
//           drawImage(A, 1 - blend, z, panX, panY);
//           drawImage(B, blend,     z, panX, panY);
//         } else if (S.mode === 'slide') {
//           // slide along the direction, strong offset so it’s obvious
//           const D = Math.max(p.width, p.height);
//           let ax = 0, ay = 0, bx = 0, by = 0;
//           switch (S.direction) {
//             case 'left':  ax = -D * blend;  bx = D * (1 - blend); break;
//             case 'right': ax =  D * blend;  bx = -D * (1 - blend); break;
//             case 'up':    ay = -D * blend;  by = D * (1 - blend); break;
//             case 'down':  ay =  D * blend;  by = -D * (1 - blend); break;
//             default:      ax = -D * blend;  bx = D * (1 - blend);
//           }
//           drawImage(A, 1, z, panX + ax, panY + ay);
//           drawImage(B, 1, z, panX + bx, panY + by);
//         } else {
//           // kenburns: A -> B with fade at the end of hold
//           const kBlend = phase === 'transition' ? blend : 0;
//           drawImage(A, 1 - kBlend, z, panX, panY);
//           drawImage(B, kBlend,     z, panX, panY);
//         }

//         // overlay
//         const oa = overlayAlpha(t);
//         if (oa > 0) {
//           p.push();
//           const c = S.overlayColor; // #rrggbb
//           const r = parseInt(c.slice(1, 3), 16);
//           const g = parseInt(c.slice(3, 5), 16);
//           const b = parseInt(c.slice(5, 7), 16);
//           p.noStroke();
//           p.fill(r, g, b, 255 * oa);
//           p.rect(0, 0, p.width, p.height);
//           p.pop();
//         }
//       };
//     };
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []); // sketch fn is stable

//   return (
//     <div className="relative w-full h-[calc(100vh-80px)] bg-black overflow-hidden">
//       <ReactP5Wrapper sketch={sketch} settings={settings} running={running} resetSeed={resetSeed} />

//       {/* Overlay control panel */}
//       <ControlPanelPhoto
//         settings={settings}
//         setSettings={(updater) => setSettings(prev => {
//           const next = typeof updater === 'function' ? (updater as any)(prev) : updater;
//           next.overlayColor = clampHex6(next.overlayColor);
//           return next;
//         })}
//         startAnimation={startAnimation}
//         stopAnimation={stopAnimation}
//         resetAnimation={resetAnimation}
//         shuffleNow={shuffleNow}
//         loadSequence={loadSequence}   // uses /public folder
//       />
//     </div>
//   );
// };

// export default PhotoAnimations;

