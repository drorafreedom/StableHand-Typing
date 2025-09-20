import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ReactP5Wrapper } from 'react-p5-wrapper';
import ControlPanelPhoto from './ControlPanelPhoto';

// 1) Imports (top of file). Adjust the path to match your firebase exports. 
import { auth, storage } from '../../firebase/firebase'; 
import { ref as sref, listAll, getDownloadURL } from 'firebase/storage';

// 2) Helpers
async function loadStoragePrefix(prefix: string): Promise<string[]> {
  const res = await listAll(sref(storage, prefix));
  const out: string[] = [];
  for (const item of res.items) out.push(await getDownloadURL(item));
  return out;
}

// 3) Actions you can call from the panel
/* const useSharedStorage = async () => {
  const urls = await loadStoragePrefix('bgphotos');  // shared lib
  if (urls.length) { setSettings(s => ({ ...s, urls })); setIdx(0); setRunning(true); }
};
 */
 const useSharedStorage = async () => {
  try {
    const urls = await loadStoragePrefix('bgphotos'); // shared library folder
    if (urls.length) {
      setSettings(s => ({ ...s, urls }));
      setIdx(0);
      setRunning(true);
    }
  } catch (e) {
    console.error('Shared storage load failed', e);
  }
};
/* const useUserStorage = async () => {
  const user = auth.currentUser;
  if (!user) return; // require login
  const urls = await loadStoragePrefix(`users/${user.uid}/bgphotos`);
  if (urls.length) { setSettings(s => ({ ...s, urls })); setIdx(0); setRunning(true); }
};
 */
 const useUserStorage = async () => {
  try {
    const user = auth.currentUser;
    if (!user) return; // require sign-in
    const urls = await loadStoragePrefix(`users/${user.uid}/bgphotos`);
    if (urls.length) {
      setSettings(s => ({ ...s, urls }));
      setIdx(0);
      setRunning(true);
    }
  } catch (e) {
    console.error('User storage load failed', e);
  }
};
 
 
 // Accept images even if MIME is empty
const isImageFile = (f: File) =>
  /^image\//.test(f.type) ||
  /\.(jpe?g|png|gif|webp|bmp|tiff?|heic|heif)$/i.test(f.name);

 
 // Try to load an image URL (works in dev/prod) — resolves true/false
function imageExists(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url + (url.includes('?') ? '&' : '?') + 'v=' + Date.now(); // bust cache in dev
  });
}

// Scan /public/bgphotos for numbered files (1..N) across common extensions.
// Stops after a few consecutive misses so it doesn't loop forever.
async function discoverPublicNumbered(basePrefix?: string): Promise<string[]> {
  const base = basePrefix ?? ((import.meta as any).env?.BASE_URL || '/') + 'bgphotos/';
  const exts = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp'];
  const urls: string[] = [];

  let i = 1;
  let misses = 0;
  const MAX_MISSES = 12;   // tolerate gaps, then stop
  const MAX_INDEX  = 999;  // hard safety cap

  while (i <= MAX_INDEX) {
    let found = false;
    for (const ext of exts) {
      const u = `${base}${i}.${ext}`;
      // eslint-disable-next-line no-await-in-loop
      if (await imageExists(u)) { urls.push(u); found = true; break; }
    }
    if (found) { misses = 0; i += 1; }
    else { misses += 1; i += 1; if (misses >= MAX_MISSES && urls.length > 0) break; }
  }

  return urls;
}

 
 
//-----------------------
export type Direction =
  | 'static' | 'up' | 'down' | 'left' | 'right'
  | 'oscillateUpDown' | 'oscillateRightLeft' | 'circular';

export type ZoomMode = 'none' | 'inOut' | 'pulse';
export type OpacityMode = 'constant' | 'inOut' | 'pulse';

export interface PhotoSettings {
  // slideshow
  autoplay: boolean;
  slideSeconds: number;

  // motion
  direction: Direction;
  speed: number;              // px/frame baseline
  oscillationRange: number;   // px amplitude for oscillations
  rotationRadius: number;     // px for circular
  rotationSpeed: number;      // multiplier for circular

  // zoom
  zoomMode: ZoomMode;
  zoomMin: number;            // ×
  zoomMax: number;            // ×
  zoomSpeed: number;          // cycles/sec

  // image opacity animation (the photo itself)
  imageOpacityMin: number;    // 0..1
  imageOpacityMax: number;    // 0..1
  imageOpacityMode: OpacityMode;
  imageOpacitySpeed: number;  // cycles/sec

  // overlay & layout
  overlayColor: string;       // hex
  overlayOpacity: number;     // 0..1 (static overlay; can simulate fades via imageOpacity)
  fit: 'cover' | 'contain';
  angle: number;              // radians

  // photos
  urls: string[];
}

const DEFAULTS: PhotoSettings = {
  autoplay: true,
  slideSeconds: 8,

  direction: 'static',
  speed: 1.5,
  oscillationRange: 120,
  rotationRadius: 200,
  rotationSpeed: 0.25,

  zoomMode: 'inOut',
  zoomMin: 1.0,
  zoomMax: 1.35,
  zoomSpeed: 0.2,

  imageOpacityMin: 1.0,
  imageOpacityMax: 1.0,
  imageOpacityMode: 'constant',
  imageOpacitySpeed: 0.2,

  overlayColor:  '#afb8cc',//'#000000',
  overlayOpacity: 0.1,
  fit: 'cover',
  angle: 0,

  urls: [],
};

// 👉 keeps TherapyPage imports happy
export const cloneDefaults = (): PhotoSettings => ({
  ...DEFAULTS,
  urls: [...DEFAULTS.urls], // never share the same array
});
export const PHOTO_DEFAULTS = DEFAULTS;
export const clonePhotoDefaults = cloneDefaults;

// ----------------- helpers: asset discovery -----------------
const discoverBundledUrls = (): string[] => {
  try {
    const globbed = import.meta.glob('/src/assets/bgphotos/*.{jpg,jpeg,png,gif,webp}', {
      eager: true,
      as: 'url',
    }) as Record<string, string>;
    return Object.values(globbed);
  } catch {
    return [];
  }
};
/* const buildPublicUrls = (count = 14): string[] => {
  const base = (import.meta as any).env?.BASE_URL || '/';
  return Array.from({ length: count }, (_, i) => `${base}bgphotos/${i + 1}.jpg`);
}; */
// Scan /public/bgphotos for numbered files (1.jpg, 2.jpg, ...), across common extensions.
// Stops after a few consecutive misses.
const discoverPublicUrls = async (): Promise<string[]> => {
  const base = (import.meta as any).env?.BASE_URL || '/';
  const exts = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp'];
  const urls: string[] = [];

  const exists = (u: string) =>
    new Promise<boolean>((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = u + (u.includes('?') ? '&' : '?') + 'v=' + Date.now(); // cache-bust
    });

  let i = 1, misses = 0;
  const MAX_MISSES = 5;   // stop after 5 consecutive gaps once we’ve found some
  const MAX_INDEX  = 999; // hard cap

  while (i <= MAX_INDEX) {
    let hit = false;
    for (const ext of exts) {
      const u = `${base}bgphotos/${i}.${ext}`;
      // eslint-disable-next-line no-await-in-loop
      if (await exists(u)) { urls.push(u); hit = true; break; }
    }
    if (hit) { misses = 0; } else { misses += 1; if (misses >= MAX_MISSES && urls.length) break; }
    i += 1;
  }
  return urls;
};

// ----------------- helpers: folder persistence (IndexedDB) -----------------
type DirHandle = any; // FileSystemDirectoryHandle (typed as any for wider TS DOM configs)
const IDB_NAME = 'photo-anim';
const IDB_STORE = 'handles';
const IDB_KEY_LAST = 'lastDir';

function idbOpen(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) db.createObjectStore(IDB_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function idbSet(key: string, value: any) {
  const db = await idbOpen();
  await new Promise<void>((res, rej) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put(value, key);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
  db.close();
}
async function idbGet<T = any>(key: string): Promise<T | undefined> {
  const db = await idbOpen();
  const val = await new Promise<T | undefined>((res, rej) => {
    const tx = db.transaction(IDB_STORE, 'readonly');
    const r = tx.objectStore(IDB_STORE).get(key);
    r.onsuccess = () => res(r.result as T | undefined);
    r.onerror = () => rej(r.error);
  });
  db.close();
  return val;
}

async function listImagesFromDir(handle: DirHandle): Promise<File[]> {
  const files: File[] = [];
  // @ts-expect-error async iterator exists on FileSystemDirectoryHandle
  for await (const [, entry] of handle.entries()) {
    if (entry.kind === 'file') {
      const file: File = await entry.getFile();
      if (/^image\//.test(file.type)) files.push(file);
    }
  }
  return files.sort((a, b) => a.name.localeCompare(b.name));
}

// ----------------- component -----------------
const THUMB_W = 96;
const THUMB_H = 60;



const PhotoAnimations: React.FC = () => {
  const [settings, setSettings] = useState<PhotoSettings>(cloneDefaults());
  const [running, setRunning] = useState(true);
  const [resetNonce, setResetNonce] = useState(0);
  const [idx, setIdx] = useState(0);

  // local files bookkeeping
  const blobUrlsRef = useRef<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastDirHandleRef = useRef<DirHandle | null>(null);
// Inside PhotoAnimations component body, together with your other refs:
const filesRef  = useRef<HTMLInputElement>(null);   // normal FILE picker
const folderRef = useRef<HTMLInputElement>(null);   // FOLDER picker (fallback)






  // slideshow
  useEffect(() => {
    if (!running || !settings.autoplay || settings.urls.length < 2) return;
    const ms = Math.max(1000, settings.slideSeconds * 1000);
    const t = setInterval(() => setIdx(i => (i + 1) % settings.urls.length), ms);
    return () => clearInterval(t);
  }, [running, settings.autoplay, settings.slideSeconds, settings.urls.length]);

  // transport
  const start = () => setRunning(true);
  const stop  = () => setRunning(false);
  const reset = () => {
  // keep current photo list; just restore default controls
  setSettings(s => ({ ...cloneDefaults(), urls: s.urls }));
  setIdx(0);
  setResetNonce(n => n + 1);
  setRunning(false);

  // optional: if no photos loaded, auto-discover from /public/bgphotos
  (async () => {
    if (!settings.urls.length) {
      const urls = await discoverPublicUrls?.();
      if (urls?.length) setSettings(s => ({ ...s, urls }));
    }
  })();
};

  const prev = () => setIdx(i => (settings.urls.length ? (i - 1 + settings.urls.length) % settings.urls.length : 0));
  const next = () => setIdx(i => (settings.urls.length ? (i + 1) % settings.urls.length : 0));

  // ----- local file picker (multi-file) -----
  const pickLocalFiles = () => fileInputRef.current?.click();
  const onFilesChosen: React.ChangeEventHandler<HTMLInputElement> = e => {
    const files = Array.from(e.target.files ?? []).filter(f => /^image\//.test(f.type));
    if (!files.length) return;
    blobUrlsRef.current.forEach(URL.revokeObjectURL);
    blobUrlsRef.current = [];
    const urls = files.map(f => {
      const u = URL.createObjectURL(f);
      blobUrlsRef.current.push(u);
      return u;
    });
    setSettings(s => ({ ...s, urls }));
    setIdx(0);
    setRunning(true);
    e.target.value = '';
  };

  // ----- folder picker (persistable) -----
  const pickDirectory = async () => {
    try {
      // @ts-ignore - Chrome/Edge
      if (!window.showDirectoryPicker) {
        // fallback: open multi-file dialog
        pickLocalFiles();
        return;
      }
      // @ts-ignore
      const handle: DirHandle = await window.showDirectoryPicker({ id: 'photo-anim-dir' });
      const files = await listImagesFromDir(handle);
      if (!files.length) return;
      blobUrlsRef.current.forEach(URL.revokeObjectURL);
      blobUrlsRef.current = [];
      const urls = files.map(f => {
        const u = URL.createObjectURL(f);
        blobUrlsRef.current.push(u);
        return u;
      });
      lastDirHandleRef.current = handle;
      await idbSet(IDB_KEY_LAST, handle);
      setSettings(s => ({ ...s, urls }));
      setIdx(0);
      setRunning(true);
    } catch { /* user cancelled */ }
  };

  const reopenLastDirectory = async () => {
    const handle = await idbGet<DirHandle>(IDB_KEY_LAST);
    if (!handle) return;
    const perm = await handle.requestPermission?.({ mode: 'read' });
    if (perm !== 'granted') return;
    const files = await listImagesFromDir(handle);
    if (!files.length) return;
    blobUrlsRef.current.forEach(URL.revokeObjectURL);
    blobUrlsRef.current = [];
    const urls = files.map(f => {
      const u = URL.createObjectURL(f);
      blobUrlsRef.current.push(u);
      return u;
    });
    lastDirHandleRef.current = handle;
    setSettings(s => ({ ...s, urls }));
    setIdx(0);
    setRunning(true);
  };

  // source shortcuts
  const useBundled = () => {
    const urls = discoverBundledUrls();
    if (urls.length) { setSettings(s => ({ ...s, urls })); setIdx(0); setRunning(true); }
  };
/*   const usePublic = (count = 14) => {
    const urls = buildPublicUrls(count);
    setSettings(s => ({ ...s, urls }));
    setIdx(0);
    setRunning(true);
  }; */
  const usePublic = async () => {
  const urls = await discoverPublicUrls();
  if (!urls.length) {
    alert('No images found under /public/bgphotos');
    return;
  }
  setSettings(s => ({ ...s, urls }));
  setIdx(0);
  setRunning(true);
};

  
//Thumbnail strip  to Use A  or A+ B 
// A=== Thumbnail strip visibility ===
const STRIP_H = 92;                    // px height of the strip
const [showStrip, setShowStrip] = useState(true);

useEffect(() => {
  let hideTimer: number | undefined;
  const onMove = (e: MouseEvent) => {
    // Reveal when the cursor is near the bottom 120px
    if (e.clientY > window.innerHeight - (STRIP_H + 28)) {
      setShowStrip(true);
      if (hideTimer) window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => setShowStrip(false), 1800);
    }
  };
  window.addEventListener('mousemove', onMove);
  hideTimer = window.setTimeout(() => setShowStrip(false), 1500);
  return () => { window.removeEventListener('mousemove', onMove); if (hideTimer) window.clearTimeout(hideTimer); };
}, []);
// B Reserve safe space so nothing is covered This pushes your page content up by the strip height while the photo module is mounted
/* useEffect(() => {
  const prev = document.body.style.paddingBottom;
  document.body.style.paddingBottom = `${STRIP_H + 20}px`; // + gutter
  return () => { document.body.style.paddingBottom = prev; };
}, []);
 */

  // ------------- p5 sketch -------------
  const sketch = useCallback((p5: any) => {
    type Props = { settings: PhotoSettings; idx: number; running: boolean; resetNonce: number };

    let cur: PhotoSettings = cloneDefaults();
    let index = 0;
    let isRunning = true;
    let lastReset = -1;
    let t = 0, offX = 0, offY = 0;

    const cache = new Map<string, any>();
    const getImage = (url: string) => {
      const c = cache.get(url);
      if (c) return c;
      const img = p5.loadImage(url, () => {}, () => {});
      cache.set(url, img);
      return img;
    };

    p5.setup = () => {
      p5.createCanvas(p5.windowWidth, p5.windowHeight);
      p5.frameRate(60);
      p5.noStroke();
    };
    p5.windowResized = () => p5.resizeCanvas(p5.windowWidth, p5.windowHeight);

    p5.updateWithProps = (props: Props) => {
      if (props.settings) cur = props.settings;
      if (typeof props.idx === 'number') index = props.idx;
      if (typeof props.running === 'boolean') isRunning = props.running;
      if (typeof props.resetNonce === 'number' && props.resetNonce !== lastReset) {
        t = 0; offX = 0; offY = 0; lastReset = props.resetNonce;
      }
      const list = cur.urls || [];
      if (list.length >= 2) {
        getImage(list[(index + 1) % list.length]);
        getImage(list[(index - 1 + list.length) % list.length]);
      }
    };

    const lerp01 = (u: number) => Math.max(0, Math.min(1, u));
    const zoomValue = () => {
      const a = Math.min(cur.zoomMin, cur.zoomMax);
      const b = Math.max(cur.zoomMin, cur.zoomMax);
      switch (cur.zoomMode) {
        case 'none': return 1;
        case 'inOut': {
          const cyc = Math.max(0.0001, cur.zoomSpeed);
          const phase = (t * cyc) % 2;    // 0..2
          const u = phase < 1 ? phase : 2 - phase; // 0..1..0
          return a + (b - a) * u;
        }
        case 'pulse': {
          const u = (p5.sin(t * (Math.PI * 2) * cur.zoomSpeed) + 1) * 0.5;
          return a + (b - a) * u;
        }
      }
    };
    const imageAlpha = () => {
      const a = Math.min(cur.imageOpacityMin, cur.imageOpacityMax);
      const b = Math.max(cur.imageOpacityMin, cur.imageOpacityMax);
      switch (cur.imageOpacityMode) {
        case 'constant': return lerp01(b);
        case 'inOut': {
          const cyc = Math.max(0.0001, cur.imageOpacitySpeed);
          const phase = (t * cyc) % 2;
          const u = phase < 1 ? phase : 2 - phase;
          return a + (b - a) * u;
        }
        case 'pulse': {
          const u = (p5.sin(t * (Math.PI * 2) * cur.imageOpacitySpeed) + 1) * 0.5;
          return a + (b - a) * u;
        }
      }
    };

    const stepMotion = () => {
      const v = cur.speed;
      switch (cur.direction) {
        case 'static': break;
        case 'up':    offY -= v; break;
        case 'down':  offY += v; break;
        case 'left':  offX -= v; break;
        case 'right': offX += v; break;
        case 'oscillateUpDown':    offY = cur.oscillationRange * p5.sin(t * 1.5 * Math.max(0.2, v * 0.2)); break;
        case 'oscillateRightLeft': offX = cur.oscillationRange * p5.sin(t * 1.5 * Math.max(0.2, v * 0.2)); break;
        case 'circular': {
          const w = Math.max(0.05, v * cur.rotationSpeed);
          offX = cur.rotationRadius * p5.cos(t * w);
          offY = cur.rotationRadius * p5.sin(t * w);
        } break;
      }
    };

    const drawImageFit = (img: any) => {
      if (!img || !img.width || !img.height) return;
      const W = p5.width, H = p5.height;
      const cx = W / 2, cy = H / 2;
      const aspect = img.width / img.height;
      let dw = W, dh = H;
      if (cur.fit === 'cover') {
        if (W / H > aspect) dh = W / aspect; else dw = H * aspect;
      } else {
        if (W / H > aspect) dw = H * aspect; else dh = W / aspect;
      }
      const z = Math.max(0.05, zoomValue() || 1);
      dw *= z; dh *= z;
// after: dw *= z; dh *= z;

// Decide which axes can move
const needX =
  cur.direction === 'left' || cur.direction === 'right' ||
  cur.direction === 'oscillateRightLeft' || cur.direction === 'circular';
const needY =
  cur.direction === 'up' || cur.direction === 'down' ||
  cur.direction === 'oscillateUpDown' || cur.direction === 'circular';

// Wrap offsets by the drawn size so the image cluster never drifts away
let tx = offX;
let ty = offY;
if (needX && dw > 0) {
  tx = ((offX + dw / 2) % dw + dw) % dw - dw / 2; // wrap to [-dw/2, dw/2)
}
if (needY && dh > 0) {
  ty = ((offY + dh / 2) % dh + dh) % dh - dh / 2; // wrap to [-dh/2, dh/2)
}




      p5.push();
      //p5.translate(cx + offX, cy + offY);
      p5.translate(cx + tx, cy + ty);
      if (cur.angle) p5.rotate(cur.angle);
      p5.imageMode(p5.CENTER);
      const alpha255 = Math.round(255 * lerp01(imageAlpha()));
      p5.tint(255, alpha255);
      // p5.image(img, 0, 0, dw, dh);
      
      // Tile around the center to avoid gaps when panning.
// imageMode is CENTER, so offsets are multiples of dw/dh.
//const needX = cur.direction === 'left' || cur.direction === 'right' || cur.direction === 'oscillateRightLeft' || cur.direction === 'circular';
//const needY = cur.direction === 'up'   || cur.direction === 'down'  || cur.direction === 'oscillateUpDown'    || cur.direction === 'circular';

// always draw the center this is for looping in the animation so there is no left over gap
p5.image(img, 0, 0, dw, dh);

// draw neighbors only along the needed axes to keep it light
if (needX) {
  p5.image(img,  dw, 0, dw, dh);
  p5.image(img, -dw, 0, dw, dh);
}
if (needY) {
  p5.image(img, 0,  dh, dw, dh);
  p5.image(img, 0, -dh, dw, dh);
}
// corners only if both axes move (circular)
if (needX && needY) {
  p5.image(img,  dw,  dh, dw, dh);
  p5.image(img,  dw, -dh, dw, dh);
  p5.image(img, -dw,  dh, dw, dh);
  p5.image(img, -dw, -dh, dw, dh);
}

      p5.noTint();
      p5.pop();

      if (cur.overlayOpacity > 0) {
        //const c = p5.color(cur.overlayColor || '#000');
        const c = p5.color((cur.overlayColor ?? PHOTO_DEFAULTS.overlayColor) as string);
        c.setAlpha(Math.round(255 * lerp01(cur.overlayOpacity)));
        p5.fill(c);
        p5.rect(0, 0, W, H);
      }
    };

    p5.draw = () => {
      p5.clear(); p5.background(0);
      const list = cur.urls || [];
      if (list.length) drawImageFit(getImage(list[index % list.length]));
      if (isRunning) { t += 1/60; stepMotion(); }
    };
  }, []);

  const thumbs = useMemo(() => settings.urls.map((u, i) => ({ u, i })), [settings.urls]);

  return (
    <div className="relative">
      {/* multi-file input (with folder fallback via webkitdirectory) */}
      <input
        ref={fileInputRef}
       type="file"
  accept=".jpg,.jpeg,.png,.gif,.webp,.bmp,.tif,.tiff,.heic,.heif,image/*"
  multiple
  className="hidden"
  onChange={(e) => {
    const files = Array.from(e.target.files ?? []).filter(isImageFile);
    if (!files.length) { alert('No images selected.'); e.currentTarget.value = ''; return; }
    blobUrlsRef.current.forEach(URL.revokeObjectURL); blobUrlsRef.current = [];
    const urls = files.map(f => { const u = URL.createObjectURL(f); blobUrlsRef.current.push(u); return u; });
    setSettings(s => ({ ...s, urls })); setIdx(0); setRunning(true);
    e.currentTarget.value = '';
  }}
/>
{/* FOLDER: folder chooser (fallback) — this one ONLY has webkitdirectory */}
<input
  ref={folderRef}
  type="file"
  className="hidden"
  // @ts-ignore
  webkitdirectory=""
  // @ts-ignore
  directory=""
  onChange={(e) => {
    const files = Array.from(e.target.files ?? []).filter(isImageFile);
    if (!files.length) { alert('No images found in that folder.'); e.currentTarget.value = ''; return; }
    blobUrlsRef.current.forEach(URL.revokeObjectURL); blobUrlsRef.current = [];
    const urls = files.map(f => { const u = URL.createObjectURL(f); blobUrlsRef.current.push(u); return u; });
    setSettings(s => ({ ...s, urls })); setIdx(0); setRunning(true);
    e.currentTarget.value = '';
  }}
/>
      <ControlPanelPhoto
        settings={settings}
        setSettings={setSettings}
        running={running}
        onStart={start}
        onStop={stop}
        onReset={reset}
        idx={idx}
        onPrev={prev}
        onNext={next}
        // sources
        onUseBundled={useBundled}
        onUsePublic={usePublic}
        onPickLocal={pickLocalFiles}
        onPickDirectory={pickDirectory}
        onReopenDirectory={reopenLastDirectory}
          onUseSharedStorage={useSharedStorage}
  onUseUserStorage={useUserStorage}
      />

      {/* canvas behind everything */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <ReactP5Wrapper
          sketch={sketch}
          settings={settings}
          idx={idx}
          running={running}
          resetNonce={resetNonce}
        />
      </div>

      {/* bottom strip */}
      {!!thumbs.length && (
        // <div className="fixed left-4 right-4 bottom-4 z-40 bg-white/80 backdrop-blur p-2 rounded-xl shadow flex items-center gap-2 overflow-x-auto"> this is for a fixed tuhmbnail strip 
         <div className="fixed left-4 right-4 bottom-4 z-40 bg-white/80 backdrop-blur p-2 rounded-xl shadow flex items-center gap-2 overflow-x-auto transition-transform duration-200"
  style={{ transform: showStrip ? 'translateY(0%)' : 'translateY(120%)' }}
>
          <button className="px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200" onClick={prev} title="Previous">◀</button>
          {thumbs.map(({ u, i }) => (
            <button key={`${u}-${i}`}
              onClick={() => setIdx(i)}
              className={`relative flex-shrink-0 border rounded overflow-hidden ${i === idx ? 'ring-2 ring-blue-500' : ''}`}
              style={{ width: THUMB_W, height: THUMB_H }}
              title={u}>
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <img src={u} className="w-full h-full object-cover" />
            </button>
          ))}
          <button className="px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200" onClick={next} title="Next">▶</button>
          <div className="ml-auto text-[11px] px-2 py-1 border rounded bg-white/60">{idx + 1} / {settings.urls.length || 0}</div>
        </div>
      )}
    </div>
  );
};

export default PhotoAnimations;



//------------version 1 - 
// import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
// import { ReactP5Wrapper } from 'react-p5-wrapper';
// import ControlPanelPhoto from './ControlPanelPhoto';

// export type Direction =
//   | 'static'
//   | 'up'
//   | 'down'
//   | 'left'
//   | 'right'
//   | 'oscillateUpDown'
//   | 'oscillateRightLeft'
//   | 'circular';

// export type ZoomMode = 'none' | 'inOut' | 'pulse';

// export interface PhotoSettings {
//   // slideshow
//   autoplay: boolean;
//   slideSeconds: number;

//   // motion
//   direction: Direction;
//   speed: number;             // px/frame baseline (also modulates osc/circle)
//   oscillationRange: number;  // px peak amplitude for oscillations
//   rotationRadius: number;    // px for circular
//   rotationSpeed: number;     // radians/sec-ish

//   // zoom
//   zoomMode: ZoomMode;
//   zoomMin: number;           // ×
//   zoomMax: number;           // ×
//   zoomSpeed: number;         // cycles/sec (pulse/inOut)

//   // overlay & layout
//   overlayColor: string;      // hex
//   overlayOpacity: number;    // 0..1
//   fit: 'cover' | 'contain';
//   angle: number;             // radians

//   // photos
//   urls: string[];
// }

// const DEFAULTS: PhotoSettings = {
//   autoplay: true,
//   slideSeconds: 8,

//   direction: 'static',
//   speed: 1.5,
//   oscillationRange: 120,
//   rotationRadius: 200,
//   rotationSpeed: 0.25,

//   zoomMode: 'inOut',
//   zoomMin: 1.0,
//   zoomMax: 1.35,
//   zoomSpeed: 0.2,

//   overlayColor: '#000000',
//   overlayOpacity: 0.25,
//   fit: 'cover',
//   angle: 0,

//   urls: [],
// };


// // add these right after: const DEFAULTS: PhotoSettings = { ... }
// export const cloneDefaults = (): PhotoSettings => ({
//   ...DEFAULTS,
//   // IMPORTANT: never share the same array reference
//   urls: [...DEFAULTS.urls],
// });

// // Optional aliases (keep old imports working if any):
// export const PHOTO_DEFAULTS = DEFAULTS;
// export const clonePhotoDefaults = cloneDefaults;

// const THUMB_W = 96;
// const THUMB_H = 60;

// // -------- asset discovery (no HTTP needed for local picks) ----------
// const discoverBundledUrls = (): string[] => {
//   // Uses Vite to bundle images under src/assets/bgphotos/* => same-origin URLs
//   try {
//     const globbed = import.meta.glob('/src/assets/bgphotos/*.{jpg,jpeg,png,gif,webp}', {
//       eager: true,
//       as: 'url',
//     }) as Record<string, string>;
//     return Object.values(globbed);
//   } catch {
//     return [];
//   }
// };

// const buildPublicUrls = (count = 14): string[] => {
//   const base = (import.meta as any).env?.BASE_URL || '/';
//   return Array.from({ length: count }, (_, i) => `${base}bgphotos/${i + 1}.jpg`);
// };

// const PhotoAnimations: React.FC = () => {
//   const [settings, setSettings] = useState<PhotoSettings>({ ...DEFAULTS });
//   const [running, setRunning] = useState(true);
//   const [resetNonce, setResetNonce] = useState(0);
//   const [idx, setIdx] = useState(0);

//   // keep track of blob URLs to revoke when replaced
//   const blobUrlsRef = useRef<string[]>([]);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   // seed URLs once: assets → public (does not override if user already added)
//   useEffect(() => {
//     if (settings.urls.length > 0) return;
//     const assets = discoverBundledUrls();
//     if (assets.length) setSettings(s => ({ ...s, urls: assets }));
//     else setSettings(s => ({ ...s, urls: buildPublicUrls() }));
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // slideshow
//   useEffect(() => {
//     if (!running || !settings.autoplay || settings.urls.length < 2) return;
//     const ms = Math.max(1000, settings.slideSeconds * 1000);
//     const t = setInterval(() => setIdx(i => (i + 1) % settings.urls.length), ms);
//     return () => clearInterval(t);
//   }, [running, settings.autoplay, settings.slideSeconds, settings.urls.length]);

//   // transport
//   const start = () => setRunning(true);
//   const stop = () => setRunning(false);
//   const reset = () => {
//     // preserve current URL list; reset the rest
//     setSettings(s => ({ ...DEFAULTS, urls: s.urls.length ? s.urls : buildPublicUrls() }));
//     setIdx(0);
//     setResetNonce(n => n + 1);
//     setRunning(false);
//   };
//   const prev = () =>
//     setIdx(i => (settings.urls.length ? (i - 1 + settings.urls.length) % settings.urls.length : 0));
//   const next = () =>
//     setIdx(i => (settings.urls.length ? (i + 1) % settings.urls.length : 0));

//   // ---------- local folder (file picker, no HTTP) ----------
//   const pickLocalFiles = () => fileInputRef.current?.click();
//   const onFilesChosen: React.ChangeEventHandler<HTMLInputElement> = e => {
//     const files = Array.from(e.target.files ?? []);
//     if (!files.length) return;
//     // revoke old blob URLs
//     blobUrlsRef.current.forEach(URL.revokeObjectURL);
//     blobUrlsRef.current = [];

//     const urls = files
//       .filter(f => /^image\//.test(f.type))
//       .map(f => {
//         const u = URL.createObjectURL(f);
//         blobUrlsRef.current.push(u);
//         return u;
//       });

//     if (urls.length) {
//       setSettings(s => ({ ...s, urls }));
//       setIdx(0);
//     }
//     // clear for re-pick
//     e.target.value = '';
//   };

//   // ---------- source shortcuts ----------
//   const useBundled = () => {
//     const urls = discoverBundledUrls();
//     if (urls.length) {
//       setSettings(s => ({ ...s, urls }));
//       setIdx(0);
//     }
//   };
//   const usePublic = (count = 14) => {
//     const urls = buildPublicUrls(count);
//     setSettings(s => ({ ...s, urls }));
//     setIdx(0);
//   };

//   // ---------- simple presets (localStorage) ----------
//   type Preset = { name: string; settings: PhotoSettings };
//   const LS_KEY = 'photo_presets_v1';

//   const loadAllPresets = (): Preset[] => {
//     try {
//       const raw = localStorage.getItem(LS_KEY);
//       return raw ? (JSON.parse(raw) as Preset[]) : [];
//     } catch {
//       return [];
//     }
//   };
//   const savePreset = (name: string) => {
//     const list = loadAllPresets();
//     const copy = { ...settings };
//     const preset: Preset = { name, settings: copy };
//     const existingIdx = list.findIndex(p => p.name === name);
//     if (existingIdx >= 0) list[existingIdx] = preset;
//     else list.push(preset);
//     localStorage.setItem(LS_KEY, JSON.stringify(list));
//   };
//   const applyPreset = (name: string) => {
//     const list = loadAllPresets();
//     const p = list.find(x => x.name === name);
//     if (!p) return;
//     // strict merge to avoid undefined wipes
//     setSettings(s => ({
//       ...s,
//       ...p.settings,
//       urls: p.settings.urls && p.settings.urls.length ? p.settings.urls : s.urls,
//     }));
//   };
//   const deletePreset = (name: string) => {
//     const list = loadAllPresets().filter(p => p.name !== name);
//     localStorage.setItem(LS_KEY, JSON.stringify(list));
//   };

//   // ----------- p5 sketch -----------
//   const sketch = useCallback((p5: any) => {
//     type Props = {
//       settings: PhotoSettings;
//       idx: number;
//       running: boolean;
//       resetNonce: number;
//     };

//     let cur: PhotoSettings = { ...DEFAULTS };
//     let index = 0;
//     let isRunning = true;
//     let lastReset = -1;

//     // time & pan state
//     let t = 0;
//     let offX = 0;
//     let offY = 0;

//     // cache
//     const cache = new Map<string, any>();
//     const getImage = (url: string) => {
//       const c = cache.get(url);
//       if (c) return c;
//       const img = p5.loadImage(url, () => {}, () => {});
//       cache.set(url, img);
//       return img;
//     };

//     p5.setup = () => {
//       p5.createCanvas(p5.windowWidth, p5.windowHeight);
//       p5.frameRate(60);
//       p5.noStroke();
//     };
//     p5.windowResized = () => {
//       p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
//     };

//     p5.updateWithProps = (props: Props) => {
//       if (props.settings) cur = props.settings;
//       if (typeof props.idx === 'number') index = props.idx;
//       if (typeof props.running === 'boolean') isRunning = props.running;
//       if (typeof props.resetNonce === 'number' && props.resetNonce !== lastReset) {
//         t = 0;
//         offX = 0;
//         offY = 0;
//         lastReset = props.resetNonce;
//       }

//       // warm neighbors
//       const list = cur.urls || [];
//       if (list.length >= 2) {
//         getImage(list[(index + 1) % list.length]);
//         getImage(list[(index - 1 + list.length) % list.length]);
//       }
//     };

//     const zoomValue = () => {
//       const a = Math.min(cur.zoomMin, cur.zoomMax);
//       const b = Math.max(cur.zoomMin, cur.zoomMax);
//       switch (cur.zoomMode) {
//         case 'none':
//           return 1;
//         case 'inOut': {
//           const cycle = Math.max(0.0001, cur.zoomSpeed);
//           const phase = (t * cycle) % 2; // 0..2
//           const u = phase < 1 ? phase : 2 - phase; // 0..1..0
//           return a + (b - a) * u;
//         }
//         case 'pulse': {
//           const u = (p5.sin(t * (Math.PI * 2) * cur.zoomSpeed) + 1) * 0.5;
//           return a + (b - a) * u;
//         }
//       }
//     };

//     const stepMotion = () => {
//       const v = cur.speed;
//       switch (cur.direction) {
//         case 'static':
//           break;
//         case 'up':
//           offY -= v;
//           break;
//         case 'down':
//           offY += v;
//           break;
//         case 'left':
//           offX -= v;
//           break;
//         case 'right':
//           offX += v;
//           break;
//         case 'oscillateUpDown':
//           offY = cur.oscillationRange * p5.sin(t * 1.5 * Math.max(0.2, v * 0.2));
//           break;
//         case 'oscillateRightLeft':
//           offX = cur.oscillationRange * p5.sin(t * 1.5 * Math.max(0.2, v * 0.2));
//           break;
//         case 'circular': {
//           const w = Math.max(0.05, v * cur.rotationSpeed);
//           offX = cur.rotationRadius * p5.cos(t * w);
//           offY = cur.rotationRadius * p5.sin(t * w);
//           break;
//         }
//       }
//     };

//     const drawImageFit = (img: any) => {
//       if (!img || !img.width || !img.height) return;
//       const W = p5.width,
//         H = p5.height;
//       const cx = W / 2,
//         cy = H / 2;

//       const aspect = img.width / img.height;
//       let dw = W,
//         dh = H;
//       if (cur.fit === 'cover') {
//         if (W / H > aspect) dh = W / aspect;
//         else dw = H * aspect;
//       } else {
//         if (W / H > aspect) dw = H * aspect;
//         else dh = W / aspect;
//       }

//       const z = zoomValue();
//       dw *= Math.max(0.05, z || 1);
//       dh *= Math.max(0.05, z || 1);

//       p5.push();
//       p5.translate(cx + offX, cy + offY);
//       if (cur.angle) p5.rotate(cur.angle);
//       p5.imageMode(p5.CENTER);
//       p5.image(img, 0, 0, dw, dh);
//       p5.pop();

//       if (cur.overlayOpacity > 0) {
//         const c = p5.color(cur.overlayColor || '#000');
//         c.setAlpha(Math.round(255 * Math.max(0, Math.min(1, cur.overlayOpacity))));
//         p5.fill(c);
//         p5.rect(0, 0, W, H);
//       }
//     };

//     p5.draw = () => {
//       p5.clear();
//       p5.background(0);
//       const list = cur.urls || [];
//       if (list.length) {
//         const img = getImage(list[index % list.length]);
//         drawImageFit(img);
//       }
//       if (isRunning) {
//         t += 1 / 60;
//         stepMotion();
//       }
//     };
//   }, []);

//   const thumbs = useMemo(() => settings.urls.map((u, i) => ({ u, i })), [settings.urls]);

//   return (
//     <div className="relative">
//       {/* Hidden file input for local folder selection */}
//       <input
//         ref={fileInputRef}
//         type="file"
//         accept="image/*"
//         multiple
//         className="hidden"
//         onChange={onFilesChosen}
//       />

//       <ControlPanelPhoto
//         settings={settings}
//         setSettings={setSettings}
//         running={running}
//         onStart={start}
//         onStop={stop}
//         onReset={reset}
//         idx={idx}
//         onPrev={prev}
//         onNext={next}
//         // sources
//         onUseBundled={useBundled}
//         onUsePublic={usePublic}
//         onPickLocal={pickLocalFiles}
//         // presets
//         onSavePreset={savePreset}
//         onApplyPreset={applyPreset}
//         onDeletePreset={deletePreset}
//         listPresets={() => {
//           try {
//             const raw = localStorage.getItem('photo_presets_v1');
//             const list = raw ? (JSON.parse(raw) as { name: string }[]) : [];
//             return list.map(p => p.name);
//           } catch {
//             return [];
//           }
//         }}
//       />

//       {/* canvas behind content */}
//       <div className="fixed inset-0 -z-10 pointer-events-none">
//         <ReactP5Wrapper
//           sketch={sketch}
//           settings={settings}
//           idx={idx}
//           running={running}
//           resetNonce={resetNonce}
//         />
//       </div>

//       {/* bottom thumbnails + transport */}
//       {!!thumbs.length && (
//         <div className="fixed left-4 right-4 bottom-4 z-40 bg-white/80 backdrop-blur p-2 rounded-xl shadow flex items-center gap-2 overflow-x-auto">
//           <button
//             onClick={prev}
//             className="px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200"
//             title="Previous"
//           >
//             ◀
//           </button>
//           {thumbs.map(({ u, i }) => (
//             <button
//               key={`${u}-${i}`}
//               onClick={() => setIdx(i)}
//               className={`relative flex-shrink-0 border rounded overflow-hidden ${
//                 i === idx ? 'ring-2 ring-blue-500' : ''
//               }`}
//               style={{ width: THUMB_W, height: THUMB_H }}
//               title={u}
//             >
//               {/* eslint-disable-next-line jsx-a11y/alt-text */}
//               <img src={u} className="w-full h-full object-cover" />
//             </button>
//           ))}
//           <button
//             onClick={next}
//             className="px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200"
//             title="Next"
//           >
//             ▶
//           </button>
//           <div className="ml-auto text-[11px] px-2 py-1 border rounded bg-white/60">
//             {idx + 1} / {settings.urls.length || 0}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PhotoAnimations;
