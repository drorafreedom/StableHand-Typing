import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ReactP5Wrapper } from 'react-p5-wrapper';
import ControlPanelPhoto from './ControlPanelPhoto';
import { hexToRgba } from '../../utils/color';

// Keep naming consistent with Shape/Color modules
export interface PhotoSettings {
  // motion
  direction:
    | 'static'
    | 'up'
    | 'down'
    | 'left'
    | 'right'
    | 'oscillateUpDown'
    | 'oscillateRightLeft'
    | 'circular';
  speed: number;            // px/s equivalent (internal frame step derived)
  zoom: number;             // 1.0 = cover, >1 zooms in
  zoomMode: 'constant' | 'pulse';
  zoomSpeed: number;        // pulse speed

  // slide show
  slideDuration: number;    // seconds each photo stays
  transition: 'cut' | 'crossfade';
  transitionSeconds: number;

  // overlay tint (like your bgOpacity pattern)
  overlayColor: string;     // hex
  overlayOpacity: number;   // 0..1
  overlayOpacityMode: 'constant' | 'pulse';
  overlayOpacitySpeed: number;

  // simple CSS filters
  filter: 'none' | 'grayscale' | 'sepia' | 'hue-rotate';
  filterAmount: number;     // 0..1 (hue uses 0..1 -> 0..360deg)

  // scale mode for coverage
  scaleMode: 'cover' | 'contain';
}

// --- module defaults (same pattern you use in Shape) ---
export const DEFAULT_SETTINGS: PhotoSettings = {
  direction: 'oscillateRightLeft',
  speed: 40,
  zoom: 1.1,
  zoomMode: 'constant',
  zoomSpeed: 0.6,

  slideDuration: 6,
  transition: 'crossfade',
  transitionSeconds: 1.2,

  overlayColor: '#000000',
  overlayOpacity: 0.08,
  overlayOpacityMode: 'constant',
  overlayOpacitySpeed: 0.8,

  filter: 'none',
  filterAmount: 0,

  scaleMode: 'cover',
};

export const cloneDefaults = (): PhotoSettings => ({ ...DEFAULT_SETTINGS });

// expose stable getter (TherapyPage pattern parity)
let __photoSettingsRef: PhotoSettings = DEFAULT_SETTINGS;
export const getPhotoSettings = (): PhotoSettings =>
  JSON.parse(JSON.stringify(__photoSettingsRef));

type SketchProps = {
  settings: PhotoSettings;
  isAnimating: boolean;
  imageUrls: string[];
};

const PhotoAnimations: React.FC<{
  settings: PhotoSettings;
  setSettings: React.Dispatch<React.SetStateAction<PhotoSettings>>;
}> = ({ settings, setSettings }) => {
  const [isAnimating, setIsAnimating] = useState(true);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const urlsRef = useRef<string[]>([]);

  // keep external getter in sync (like Shape)
  useEffect(() => {
    __photoSettingsRef = settings;
  }, [settings]);

  // revoke object URLs when replaced
  useEffect(() => {
    const prev = urlsRef.current;
    urlsRef.current = imageUrls;
    prev.forEach((u) => {
      if (!imageUrls.includes(u)) URL.revokeObjectURL(u);
    });
    return () => {
      urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [imageUrls]);

  const resetAnimation = () => {
    setIsAnimating(false);
    requestAnimationFrame(() => setIsAnimating(true));
  };

  const sketch = useCallback((p5: any) => {
    let imgs: any[] = [];
    let loadedFrom: string[] = [];
    let idx = 0;
    let nextIdx = 0;
    let t0 = 0;
    let fadeT = 0;
    let panPhase = 0;

    function loadIfNeeded(urls: string[]) {
      if (
        urls.length === loadedFrom.length &&
        urls.every((u, i) => u === loadedFrom[i])
      ) {
        return;
      }
      imgs = [];
      loadedFrom = [...urls];
      urls.forEach((u, i) => {
        p5.loadImage(
          u,
          (im: any) => {
            imgs[i] = im;
          },
          () => {
            imgs[i] = null;
          }
        );
      });
      idx = 0;
      nextIdx = (idx + 1) % Math.max(urls.length, 1);
      t0 = p5.millis();
      fadeT = 0;
    }

    function drawCover(im: any, cx: number, cy: number, z: number) {
      const W = p5.width;
      const H = p5.height;
      const iw = im.width;
      const ih = im.height;
      const rs = settings.scaleMode === 'cover'
        ? Math.max(W / iw, H / ih)
        : Math.min(W / iw, H / ih);
      const s = rs * Math.max(0.01, z);

      const drawW = iw * s;
      const drawH = ih * s;
      const x = (W - drawW) / 2 + cx;
      const y = (H - drawH) / 2 + cy;
      p5.image(im, x, y, drawW, drawH);
    }

    p5.setup = () => {
      p5.createCanvas(p5.windowWidth, p5.windowHeight);
      p5.noStroke();
      p5.frameRate(60);
      t0 = p5.millis();
    };

    p5.windowResized = () => {
      p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    };

    // ReactP5Wrapper prop bridge
    (p5 as any).updateWithProps = (props: SketchProps) => {
      settings = props.settings;
      if (props.imageUrls) loadIfNeeded(props.imageUrls);
    };

    p5.draw = () => {
      if (!isAnimating) return;

      const now = p5.millis();
      const elapsed = (now - t0) / 1000; // seconds

      p5.clear(0, 0, 0, 0);

      if (imgs.length === 0 || !imgs[0]) return;

      // zoom factor
      let z = settings.zoom;
      if (settings.zoomMode === 'pulse') {
        z = 1 + (settings.zoom - 1) * (0.5 + 0.5 * Math.sin(now * 0.001 * settings.zoomSpeed * Math.PI * 2));
      }

      // pan via phase
      const ampX = p5.width * 0.08;
      const ampY = p5.height * 0.08;
      const v = settings.speed / 60; // px per frame-ish
      panPhase += v * 0.02;

      let offX = 0, offY = 0;
      switch (settings.direction) {
        case 'left':  offX = -elapsed * settings.speed; break;
        case 'right': offX =  elapsed * settings.speed; break;
        case 'up':    offY = -elapsed * settings.speed; break;
        case 'down':  offY =  elapsed * settings.speed; break;
        case 'oscillateRightLeft':
          offX = Math.sin(panPhase) * ampX;
          break;
        case 'oscillateUpDown':
          offY = Math.sin(panPhase) * ampY;
          break;
        case 'circular':
          offX = Math.cos(panPhase) * ampX;
          offY = Math.sin(panPhase) * ampY;
          break;
        default: break;
      }

      // slideshow timing
      const sd = Math.max(0.1, settings.slideDuration);
      const trans = Math.max(0.1, settings.transitionSeconds);
      const total = sd + trans;
      const phase = elapsed % total;

      // choose indices
      if (phase < sd) {
        nextIdx = (idx + 1) % imgs.length;
        fadeT = 0;
      } else {
        // crossfade progress 0..1
        fadeT = Math.min(1, (phase - sd) / trans);
        if (fadeT >= 1) {
          idx = nextIdx;
          t0 = now; // restart timing window
          fadeT = 0;
        }
      }

      const A = imgs[idx];
      const B = imgs[nextIdx] || A;

      if (settings.transition === 'crossfade') {
        p5.push();
        p5.tint(255, 255 * (1 - fadeT));
        drawCover(A, offX, offY, z);
        p5.pop();

        p5.push();
        p5.tint(255, 255 * fadeT);
        drawCover(B, offX, offY, z);
        p5.pop();
      } else {
        drawCover(phase < sd ? A : B, offX, offY, z);
      }

      // overlay tint (like bgOpacity pattern you use in Shape)
      let overlayAlpha = settings.overlayOpacity;
      if (settings.overlayOpacityMode === 'pulse') {
        overlayAlpha = settings.overlayOpacity * (0.5 + 0.5 * Math.sin(now * 0.001 * settings.overlayOpacitySpeed * Math.PI * 2));
      }
      const col = hexToRgba(settings.overlayColor, Math.max(0, Math.min(1, overlayAlpha)));
      p5.noStroke();
      p5.fill(col);
      p5.rect(0, 0, p5.width, p5.height);
    };
  }, [isAnimating, settings]);

  // CSS filter string (applied to the wrapper so it only affects this canvas)
  const filterCss =
    settings.filter === 'grayscale'
      ? `grayscale(${settings.filterAmount})`
      : settings.filter === 'sepia'
      ? `sepia(${settings.filterAmount})`
      : settings.filter === 'hue-rotate'
      ? `hue-rotate(${Math.round(settings.filterAmount * 360)}deg)`
      : 'none';

  return (
    <div className="relative w-full">
      <ControlPanelPhoto
        settings={settings}
        setSettings={setSettings}
        isAnimating={isAnimating}
        startAnimation={() => setIsAnimating(true)}
        stopAnimation={() => setIsAnimating(false)}
        resetAnimation={resetAnimation}
        imageUrls={imageUrls}
        setImageUrls={setImageUrls}
      />

      {/* full-page background, same pattern you use elsewhere */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none overflow-hidden"
        style={{ filter: filterCss }}
      >
        <ReactP5Wrapper
          sketch={sketch}
          settings={settings}
          isAnimating={isAnimating}
          imageUrls={imageUrls}
        />
      </div>
    </div>
  );
};

export default PhotoAnimations;
