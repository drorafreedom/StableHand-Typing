// src/components/Therapy/TextInput.tsx
// included reset all and reset typing only buttons  
import React, { useState, useEffect, useRef } from 'react';
import { Collapse } from 'react-collapse';
import buttonStyle from './buttonStyle';
 // accept meta
import type { TextMeta, TextCategory } from '../../data/text';

 



const pct = (x: number) => `${Math.round((x ?? 0) * 100)}%`;
const s1  = (x: number) => (Math.round((x ?? 0) * 10) / 10).toString(); // one decimal
export interface KeyData {
  key: string;           // e.g. "a", "Backspace", " "
  code: string;          // e.g. "KeyA", "Space", "ArrowLeft"
  pressTime: number;
  releaseTime: number | null;
  holdTime: number | null;
  lagTime: number;       // since previous release
  totalLagTime: number;  // since previous press
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
}

export interface KeystrokeSavePayload {
  typedText: string;
  targetText: string;
  keyData: KeyData[];
  analysis: {
    char: {
      ops: Array<{ op: 'match'|'ins'|'del'|'sub'; a?: string; b?: string; ai: number; bi: number }>;
      counts: { matches: number; insertions: number; deletions: number; substitutions: number };
    };
    word: {
      ops: Array<{ op: 'match'|'ins'|'del'|'sub'; a?: string; b?: string; ai: number; bi: number }>;
      counts: { matches: number; insertions: number; deletions: number; substitutions: number };
    };
    normalized: {
      typed: string;
      target: string;
      charDistance: number;
      wordErrors: number;
    };
    confusionPairs: Record<string, number>;
  };
  metrics: {
    startMs: number;
    endMs: number;
    durationMs: number;
    totalKeys: number;
    backspaceCount: number;
    rawWpm5: number;
    charWpm: number;
    wordWpm: number;
    netWpm5: number;
    charAccuracy: number;
    wordAccuracy: number;
    normalizedCharAccuracy: number;
    holdMs: { mean: number; median: number; p95: number };
    interKeyMs: { mean: number; median: number; p95: number };
    perKey: Record<string, { count: number; meanHoldMs: number; meanLagMs: number }>;
  };
  // include the text UI so you can save it too
  ui: {
    font: string;
    fontSize: number;
    isBold: boolean;
    textColor: string;
    backgroundColor: string;   // hex like "#RRGGBB"
    backgroundOpacity: number; // 0..1
  };
}

interface TextInputProps {
  rollNewText?: () => void;  // optional

  placeholder: string;
  displayText: string;
  setDisplayText: React.Dispatch<React.SetStateAction<string>>;
  saveKeystrokeData: (payload: KeystrokeSavePayload) => void;
  onTypingStart?: () => void; // used by TherapyPage to snapshot animation settings
   textMeta?: TextMeta; // 
}

const TextInput: React.FC<TextInputProps> = ({
  placeholder,
  displayText,
  setDisplayText,
  saveKeystrokeData,
  onTypingStart,
    rollNewText,                 // <— THIS must be here
    textMeta,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [keyData, setKeyData] = useState<KeyData[]>([]);
  const [font, setFont] = useState('Arial');
  const [fontSize, setFontSize] = useState(16);
  const [isBold, setIsBold] = useState(false);
  const [textColor, setTextColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [backgroundOpacity, setBackgroundOpacity] = useState(1);
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  const [sessionStart, setSessionStart] = useState<number | null>(null);
  const [backspaceCount, setBackspaceCount] = useState(0);

  const keyDataRef = useRef<KeyData[]>([]);
  const lastPressRef = useRef<number | null>(null);
  const lastReleaseRef = useRef<number | null>(null);
  const typingStartedRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => { keyDataRef.current = keyData; }, [keyData]);

  // ==== helpers ====
  const normalizeWhitespace = (s: string) => s.replace(/\s+/g, ' ').trim();
  const tokenizeWords = (s: string) => (s.trim().length ? s.trim().split(/\s+/) : []);

  const levenshteinWithOps = (a: string[], b: string[]) => {
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
      }
    }
    const ops: Array<{ op: 'match'|'ins'|'del'|'sub'; a?: string; b?: string; ai: number; bi: number }> = [];
    let i = m, j = n;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] && a[i - 1] === b[j - 1]) {
        ops.push({ op: 'match', a: a[i - 1], b: b[j - 1], ai: i - 1, bi: j - 1 });
        i--; j--;
      } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
        ops.push({ op: 'sub', a: a[i - 1], b: b[j - 1], ai: i - 1, bi: j - 1 });
        i--; j--;
      } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
        ops.push({ op: 'del', a: a[i - 1], ai: i - 1, bi: j });
        i--;
      } else {
        ops.push({ op: 'ins', b: b[j - 1], ai: i, bi: j - 1 });
        j--;
      }
    }
    ops.reverse();
    const counts = {
      matches: ops.filter(o => o.op === 'match').length,
      insertions: ops.filter(o => o.op === 'ins').length,
      deletions: ops.filter(o => o.op === 'del').length,
      substitutions: ops.filter(o => o.op === 'sub').length,
    };
    return { ops, counts, distance: dp[m][n] };
  };

  const mean = (arr: number[]) => (arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0);
  const median = (arr: number[]) => {
    if (!arr.length) return 0;
    const s = [...arr].sort((a,b)=>a-b);
    const m = Math.floor(s.length/2);
    return s.length % 2 ? s[m] : (s[m-1]+s[m])/2;
  };
  const percentile = (arr: number[], p: number) => {
    if (!arr.length) return 0;
    const s = [...arr].sort((a,b)=>a-b);
    const idx = Math.min(s.length-1, Math.max(0, Math.ceil((p/100)*s.length)-1));
    return s[idx];
  };

  // ==== key listeners (capture ALL keys while textarea focused) ====
  const handleKeyDown = (e: KeyboardEvent) => {
    // only record if our textarea has focus
    if (document.activeElement !== textareaRef.current) return;

    const pressTime = Date.now();

    // first visible char triggers typing-start (once)
    if (!typingStartedRef.current && e.key.length === 1) {
      typingStartedRef.current = true;
      onTypingStart?.();
    }

    if (sessionStart === null) setSessionStart(pressTime);

    if (e.key === 'Backspace') {
      setBackspaceCount(c => c + 1);
    }

    const lagTime = lastReleaseRef.current !== null ? pressTime - lastReleaseRef.current : 0;
    const totalLagTime = lastPressRef.current !== null ? pressTime - lastPressRef.current : 0;

    setKeyData(prev => ([
      ...prev,
      {
        key: e.key,
        code: e.code,
        pressTime,
        releaseTime: null,
        holdTime: null,
        lagTime,
        totalLagTime,
        altKey: e.altKey,
        ctrlKey: e.ctrlKey,
        metaKey: e.metaKey,
        shiftKey: e.shiftKey,
      }
    ]));

    lastPressRef.current = pressTime;
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    if (document.activeElement !== textareaRef.current) return;

    const releaseTime = Date.now();

    // update the last unreleased event that matches BOTH key & code
    setKeyData(prev => {
      const next = [...prev];
      for (let i = next.length - 1; i >= 0; i--) {
        const k = next[i];
        if (k.releaseTime === null && k.key === e.key && k.code === e.code) {
          next[i] = { ...k, releaseTime, holdTime: releaseTime - k.pressTime };
          break;
        }
      }
      return next;
    });

    lastReleaseRef.current = releaseTime;
  };

  useEffect(() => {
    const down = (ev: KeyboardEvent) => handleKeyDown(ev);
    const up   = (ev: KeyboardEvent) => handleKeyUp(ev);
    document.addEventListener('keydown', down);
    document.addEventListener('keyup', up);
    return () => {
      document.removeEventListener('keydown', down);
      document.removeEventListener('keyup', up);
    };
  }, []); // once

  // ==== submit ====
  const handleSubmit = () => {

        const meta: TextMeta = textMeta ?? {
      category: 'classic' as TextCategory,
      label: 'Classic first lines',
      index: null,
      presetId: null,
    };
    
    // duration first press → last release
    const presses = keyData.filter(k => typeof k.pressTime === 'number');
    const releases = keyData.filter(k => typeof k.releaseTime === 'number' && k.releaseTime !== null);
    const firstPress = presses.length ? Math.min(...presses.map(k => k.pressTime)) : (sessionStart ?? Date.now());
    const lastRelease = releases.length ? Math.max(...releases.map(k => k.releaseTime as number)) : Date.now();
    const durationMs = Math.max(0, lastRelease - firstPress);
    const minutes = durationMs / 60000 || 1e-9;

    // alignments (use RAW strings here; normalized also saved below)
    const typedChars = Array.from(inputValue);
    const targetChars = Array.from(displayText);
    const charAln = levenshteinWithOps(typedChars, targetChars);

    const typedWords = tokenizeWords(inputValue);
    const targetWords = tokenizeWords(displayText);
    const wordAln = levenshteinWithOps(typedWords, targetWords);

    // normalized for “double-space domino” avoidance
    const typedNorm = normalizeWhitespace(inputValue);
    const targetNorm = normalizeWhitespace(displayText);
    const charNorm = levenshteinWithOps(Array.from(typedNorm), Array.from(targetNorm));
    const wordErrsNorm = levenshteinWithOps(tokenizeWords(typedNorm), tokenizeWords(targetNorm)).distance;

    // confusion pairs from char substitutions
    const confusion: Record<string, number> = {};
    for (const o of charAln.ops) {
      if (o.op === 'sub' && o.a && o.b) {
        const key = `${o.a}->${o.b}`;
        confusion[key] = (confusion[key] || 0) + 1;
      }
    }

    // speeds
    const rawWpm5 = (inputValue.length / 5) / minutes;
    const charWpm = (inputValue.length) / minutes;
    const wordWpm = (typedWords.length) / minutes;
    const netWpm5 = Math.max(0, rawWpm5 - (wordAln.counts.substitutions + wordAln.counts.insertions + wordAln.counts.deletions) / minutes);

    // accuracies
    const charAcc = Math.max(0, (charAln.counts.matches) / Math.max(targetChars.length, 1));
    const wordAcc = Math.max(0, (wordAln.counts.matches) / Math.max(targetWords.length, 1));
    const normAcc = Math.max(0, (Array.from(targetNorm).length - charNorm.distance) / Math.max(Array.from(targetNorm).length, 1));

    // timing stats
    const holds = keyData.map(k => (k.holdTime ?? 0)).filter(v => v > 0);
    const lags  = keyData.map(k => (k.lagTime ?? 0)).filter(v => v >= 0);

    const perKey: Record<string, { count: number; meanHoldMs: number; meanLagMs: number }> = {};
    const holdSum: Record<string, number> = {};
    const lagSum:  Record<string, number> = {};
    keyData.forEach(k => {
      const label = `${k.code}`; // use code to disambiguate (e.g., LeftShift vs RightShift)
      perKey[label] = perKey[label] || { count: 0, meanHoldMs: 0, meanLagMs: 0 };
      perKey[label].count += 1;
      holdSum[label] = (holdSum[label] || 0) + (k.holdTime ?? 0);
      lagSum[label]  = (lagSum[label]  || 0) + (k.lagTime ?? 0);
    });
    Object.keys(perKey).forEach(ch => {
      perKey[ch].meanHoldMs = perKey[ch].count ? holdSum[ch] / perKey[ch].count : 0;
      perKey[ch].meanLagMs  = perKey[ch].count ? lagSum[ch]  / perKey[ch].count  : 0;
    });

    const payload: KeystrokeSavePayload = {
      typedText: inputValue,          // RAW full text (incl. double spaces)
      targetText: displayText,
      keyData,                        // ALL keys (letters, space, arrows, backspace, enter, tab…)
      analysis: {
        char: { ops: charAln.ops, counts: charAln.counts },
        word: { ops: wordAln.ops, counts: wordAln.counts },
        normalized: {
          typed: typedNorm,
          target: targetNorm,
          charDistance: charNorm.distance,
          wordErrors: wordErrsNorm,
        },
        confusionPairs: confusion,
      },
      metrics: {
        startMs: firstPress,
        endMs: lastRelease,
        durationMs,
        totalKeys: keyData.length,
        backspaceCount,
        rawWpm5,
        charWpm,
        wordWpm,
        netWpm5,
        charAccuracy: charAcc,
        wordAccuracy: wordAcc,
        normalizedCharAccuracy: normAcc,
        holdMs: { mean: mean(holds), median: median(holds), p95: percentile(holds, 95) },
        interKeyMs:{ mean: mean(lags),  median: median(lags),  p95: percentile(lags, 95)  },
        perKey,
      },
      ui: {
        font,
        fontSize,
        isBold,
        textColor,
        backgroundColor,
        backgroundOpacity,
      },
      // inside handleSubmit, add this to the payload you already save:
 
  textContext: {
    category: (textMeta?.category ?? 'classic') as TextCategory,
    label: textMeta?.label ?? '',
    index: textMeta?.index ?? null,
    presetId: textMeta?.presetId ?? null,
    targetTextSnapshot: displayText,  // freeze exactly what was shown
  },
   // optional flat tag
      tags: { category: meta.category },
};
   



    saveKeystrokeData(payload);

    
    
// Ask if they want a quick performance summary
if (window.confirm('Would you like to see a quick performance summary?')) {
  const m = payload.metrics;
  const secs = Math.max(0, Math.round(m.durationMs / 100) / 10); // 0.1s precision

  const summary =
    `Time: ${secs}s
Raw WPM (5-char): ${s1(m.rawWpm5)}
Net WPM (5-char): ${s1(m.netWpm5)}
Char Accuracy: ${pct(m.charAccuracy)}
Word Accuracy: ${pct(m.wordAccuracy)}
Normalized Char Accuracy: ${pct(m.normalizedCharAccuracy)}`;

  window.alert(summary);
}

  };

// dropdown open/close
const [isResetMenuOpen, setIsResetMenuOpen] = useState(false);

// reset helpers (unique names to avoid clashes)
const doResetTyping = () => {
  setInputValue('');
  setKeyData([]);
  setBackspaceCount(0);
  setSessionStart(null);
  typingStartedRef.current = false;
  lastPressRef.current = null;
  lastReleaseRef.current = null;
  textareaRef.current?.focus();
};

const doResetAll = () => {
  doResetTyping();
  setDisplayText('');   // also clears the target passage
};

const doResetAndNew = () => {
  doResetAll();
  rollNewText?.();      // only runs if parent provided it
};


/* 
  //reset both typing and text 
const handleReset = () => {
  setInputValue('');
  setKeyData([]);
  setBackspaceCount(0);
  setSessionStart(null);
  typingStartedRef.current = false;
  lastPressRef.current = null;
  lastReleaseRef.current = null;

  // NEW: also clear the displayed paragraph
  setDisplayText('');

  // optional: put cursor back in the box
  textareaRef.current?.focus();
}; */

/*   //reset only text old style
const handleReset = () => {
    setInputValue('');
    setKeyData([]);
    setBackspaceCount(0);
    setSessionStart(null);
    typingStartedRef.current = false;
    lastPressRef.current = null;
    lastReleaseRef.current = null;
  }; */

  return (
    <div className="relative w-full">
      <div className="flex flex-row justify-between items-start w-3/4 space-x-4">
        <div className="flex-1 text-xs">
          <textarea
            ref={textareaRef}
            value={inputValue}
            placeholder={placeholder}
            onChange={(e)=>setInputValue(e.target.value)}
            style={{
              width: '100%',
              height: '300px',
              fontFamily: font,
              fontSize: `${fontSize}px`,
              fontWeight: isBold ? 'bold' : 'normal',
              color: textColor,
              backgroundColor: `rgba(${parseInt(backgroundColor.slice(1, 3), 16)}, ${parseInt(
                backgroundColor.slice(3, 5), 16
              )}, ${parseInt(backgroundColor.slice(5, 7), 16)}, ${backgroundOpacity})`,
              border: '1px solid #ccc',
              outline: 'none',
              padding: '10px',
              borderRadius: '4px',
              resize: 'vertical',
              overflowY: 'scroll',
            }}
          />
        </div>
      </div>

      <button
        onClick={() => setIsPanelOpen(!isPanelOpen)}
        className="mt-3 text-xs bg-gray-100 p-2 border rounded"
      >
        {isPanelOpen ? 'Hide Text Controls' : 'Show Text Controls'}
      </button>

      <Collapse isOpened={isPanelOpen}>
        <div className="mt-2 grid grid-cols-2 gap-3 max-w-sm text-xs bg-white/70 p-3 border rounded shadow">
          <div>
            <label className="block mb-1">Font</label>
            <select value={font} onChange={(e) => setFont(e.target.value)} className="border p-2 rounded w-full">
              <option value="Arial">Arial</option>
              <option value="Verdana">Verdana</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
              <option value="Georgia">Georgia</option>
            </select>
          </div>

          <div>
            <label className="block mb-1">Font Size</label>
            <select value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="border p-2 rounded w-full">
              {[...Array(31)].map((_, i) => (
                <option key={i} value={10 + i}>
                  {10 + i}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2">
            <span>Bold</span>
            <input type="checkbox" checked={isBold} onChange={(e) => setIsBold(e.target.checked)} />
          </label>

          <div>
            <label className="block mb-1">Text Color</label>
            <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-full h-8" />
          </div>

          <div>
            <label className="block mb-1">Background Color</label>
            <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="w-full h-8" />
          </div>

          <div>
            <label className="block mb-1">Background Opacity</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={backgroundOpacity}
              onChange={(e) => setBackgroundOpacity(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </Collapse>

      <div className="mt-3">
        {/* <button onClick={handleSubmit} style={buttonStyle}>Submit</button> */}
  {/*       <button onClick={handleReset} style={{ ...buttonStyle, marginLeft: '0.5rem' }}>
          Reset
        </button> */}
<div className="mt-3 flex items-center gap-2 relative">
  <button onClick={handleSubmit} style={buttonStyle}>Submit</button>

  {/* Reset split-button */}
  <div
    className="relative inline-block"
    tabIndex={0}
    onBlur={(e) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsResetMenuOpen(false);
    }}
  >
    <button
      type="button"
      onClick={() => { doResetTyping(); setIsResetMenuOpen(false); }}
      className="bg-green-200 hover:bg-green-400 text-gray-800 border px-3 py-2 rounded-l"
    >
      Reset
    </button>
    <button
      type="button"
      onClick={() => setIsResetMenuOpen((o) => !o)}
      className="bg-gray-100 hover:bg-gray-200 text-gray-800 border border-l-0 px-2 py-2 rounded-r"
      aria-haspopup="menu"
      aria-expanded={isResetMenuOpen}
    >
      ▾
    </button>

    {isResetMenuOpen && (
      <div role="menu" className="absolute right-0 z-50 mt-1 w-60 rounded-md border bg-white shadow-lg">
        <button role="menuitem" onClick={() => { doResetTyping(); setIsResetMenuOpen(false); }} className="w-full text-left px-3 py-2 hover:bg-gray-50">
          Reset typing only
        </button>
        <button role="menuitem" onClick={() => { doResetAll(); setIsResetMenuOpen(false); }} className="w-full text-left px-3 py-2 hover:bg-gray-50">
          Reset typing + target text
        </button>
        {rollNewText && (
          <button role="menuitem" onClick={() => { doResetAndNew(); setIsResetMenuOpen(false); }} className="w-full text-left px-3 py-2 hover:bg-gray-50">
            Reset & show new passage
          </button>
        )}
      </div>
    )}
  </div>
</div>


      </div>
    </div>
  );
};

export default TextInput;



// // src/components/Therapy/TextInput.tsx
// // included reset all and reset typing only buttons  
// import React, { useState, useEffect, useRef } from 'react';
// import { Collapse } from 'react-collapse';
// import buttonStyle from './buttonStyle';
 
// const pct = (x: number) => `${Math.round((x ?? 0) * 100)}%`;
// const s1  = (x: number) => (Math.round((x ?? 0) * 10) / 10).toString(); // one decimal
// export interface KeyData {
//   key: string;           // e.g. "a", "Backspace", " "
//   code: string;          // e.g. "KeyA", "Space", "ArrowLeft"
//   pressTime: number;
//   releaseTime: number | null;
//   holdTime: number | null;
//   lagTime: number;       // since previous release
//   totalLagTime: number;  // since previous press
//   altKey?: boolean;
//   ctrlKey?: boolean;
//   metaKey?: boolean;
//   shiftKey?: boolean;
// }

// export interface KeystrokeSavePayload {
//   typedText: string;
//   targetText: string;
//   keyData: KeyData[];
//   analysis: {
//     char: {
//       ops: Array<{ op: 'match'|'ins'|'del'|'sub'; a?: string; b?: string; ai: number; bi: number }>;
//       counts: { matches: number; insertions: number; deletions: number; substitutions: number };
//     };
//     word: {
//       ops: Array<{ op: 'match'|'ins'|'del'|'sub'; a?: string; b?: string; ai: number; bi: number }>;
//       counts: { matches: number; insertions: number; deletions: number; substitutions: number };
//     };
//     normalized: {
//       typed: string;
//       target: string;
//       charDistance: number;
//       wordErrors: number;
//     };
//     confusionPairs: Record<string, number>;
//   };
//   metrics: {
//     startMs: number;
//     endMs: number;
//     durationMs: number;
//     totalKeys: number;
//     backspaceCount: number;
//     rawWpm5: number;
//     charWpm: number;
//     wordWpm: number;
//     netWpm5: number;
//     charAccuracy: number;
//     wordAccuracy: number;
//     normalizedCharAccuracy: number;
//     holdMs: { mean: number; median: number; p95: number };
//     interKeyMs: { mean: number; median: number; p95: number };
//     perKey: Record<string, { count: number; meanHoldMs: number; meanLagMs: number }>;
//   };
//   // include the text UI so you can save it too
//   ui: {
//     font: string;
//     fontSize: number;
//     isBold: boolean;
//     textColor: string;
//     backgroundColor: string;   // hex like "#RRGGBB"
//     backgroundOpacity: number; // 0..1
//   };
// }

// interface TextInputProps {
//   placeholder: string;
//   displayText: string;
//   setDisplayText: React.Dispatch<React.SetStateAction<string>>;
//   saveKeystrokeData: (payload: KeystrokeSavePayload) => void;
//   onTypingStart?: () => void; // used by TherapyPage to snapshot animation settings
// }

// const TextInput: React.FC<TextInputProps> = ({
//   placeholder,
//   displayText,
//   setDisplayText,
//   saveKeystrokeData,
//   onTypingStart,
// }) => {
//   const [inputValue, setInputValue] = useState('');
//   const [keyData, setKeyData] = useState<KeyData[]>([]);
//   const [font, setFont] = useState('Arial');
//   const [fontSize, setFontSize] = useState(16);
//   const [isBold, setIsBold] = useState(false);
//   const [textColor, setTextColor] = useState('#000000');
//   const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
//   const [backgroundOpacity, setBackgroundOpacity] = useState(1);
//   const [isPanelOpen, setIsPanelOpen] = useState(true);

//   const [sessionStart, setSessionStart] = useState<number | null>(null);
//   const [backspaceCount, setBackspaceCount] = useState(0);

//   const keyDataRef = useRef<KeyData[]>([]);
//   const lastPressRef = useRef<number | null>(null);
//   const lastReleaseRef = useRef<number | null>(null);
//   const typingStartedRef = useRef(false);
//   const textareaRef = useRef<HTMLTextAreaElement | null>(null);

//   useEffect(() => { keyDataRef.current = keyData; }, [keyData]);

//   // ==== helpers ====
//   const normalizeWhitespace = (s: string) => s.replace(/\s+/g, ' ').trim();
//   const tokenizeWords = (s: string) => (s.trim().length ? s.trim().split(/\s+/) : []);

//   const levenshteinWithOps = (a: string[], b: string[]) => {
//     const m = a.length, n = b.length;
//     const dp = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
//     for (let i = 0; i <= m; i++) dp[i][0] = i;
//     for (let j = 0; j <= n; j++) dp[0][j] = j;
//     for (let i = 1; i <= m; i++) {
//       for (let j = 1; j <= n; j++) {
//         const cost = a[i - 1] === b[j - 1] ? 0 : 1;
//         dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
//       }
//     }
//     const ops: Array<{ op: 'match'|'ins'|'del'|'sub'; a?: string; b?: string; ai: number; bi: number }> = [];
//     let i = m, j = n;
//     while (i > 0 || j > 0) {
//       if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] && a[i - 1] === b[j - 1]) {
//         ops.push({ op: 'match', a: a[i - 1], b: b[j - 1], ai: i - 1, bi: j - 1 });
//         i--; j--;
//       } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
//         ops.push({ op: 'sub', a: a[i - 1], b: b[j - 1], ai: i - 1, bi: j - 1 });
//         i--; j--;
//       } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
//         ops.push({ op: 'del', a: a[i - 1], ai: i - 1, bi: j });
//         i--;
//       } else {
//         ops.push({ op: 'ins', b: b[j - 1], ai: i, bi: j - 1 });
//         j--;
//       }
//     }
//     ops.reverse();
//     const counts = {
//       matches: ops.filter(o => o.op === 'match').length,
//       insertions: ops.filter(o => o.op === 'ins').length,
//       deletions: ops.filter(o => o.op === 'del').length,
//       substitutions: ops.filter(o => o.op === 'sub').length,
//     };
//     return { ops, counts, distance: dp[m][n] };
//   };

//   const mean = (arr: number[]) => (arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0);
//   const median = (arr: number[]) => {
//     if (!arr.length) return 0;
//     const s = [...arr].sort((a,b)=>a-b);
//     const m = Math.floor(s.length/2);
//     return s.length % 2 ? s[m] : (s[m-1]+s[m])/2;
//   };
//   const percentile = (arr: number[], p: number) => {
//     if (!arr.length) return 0;
//     const s = [...arr].sort((a,b)=>a-b);
//     const idx = Math.min(s.length-1, Math.max(0, Math.ceil((p/100)*s.length)-1));
//     return s[idx];
//   };

//   // ==== key listeners (capture ALL keys while textarea focused) ====
//   const handleKeyDown = (e: KeyboardEvent) => {
//     // only record if our textarea has focus
//     if (document.activeElement !== textareaRef.current) return;

//     const pressTime = Date.now();

//     // first visible char triggers typing-start (once)
//     if (!typingStartedRef.current && e.key.length === 1) {
//       typingStartedRef.current = true;
//       onTypingStart?.();
//     }

//     if (sessionStart === null) setSessionStart(pressTime);

//     if (e.key === 'Backspace') {
//       setBackspaceCount(c => c + 1);
//     }

//     const lagTime = lastReleaseRef.current !== null ? pressTime - lastReleaseRef.current : 0;
//     const totalLagTime = lastPressRef.current !== null ? pressTime - lastPressRef.current : 0;

//     setKeyData(prev => ([
//       ...prev,
//       {
//         key: e.key,
//         code: e.code,
//         pressTime,
//         releaseTime: null,
//         holdTime: null,
//         lagTime,
//         totalLagTime,
//         altKey: e.altKey,
//         ctrlKey: e.ctrlKey,
//         metaKey: e.metaKey,
//         shiftKey: e.shiftKey,
//       }
//     ]));

//     lastPressRef.current = pressTime;
//   };

//   const handleKeyUp = (e: KeyboardEvent) => {
//     if (document.activeElement !== textareaRef.current) return;

//     const releaseTime = Date.now();

//     // update the last unreleased event that matches BOTH key & code
//     setKeyData(prev => {
//       const next = [...prev];
//       for (let i = next.length - 1; i >= 0; i--) {
//         const k = next[i];
//         if (k.releaseTime === null && k.key === e.key && k.code === e.code) {
//           next[i] = { ...k, releaseTime, holdTime: releaseTime - k.pressTime };
//           break;
//         }
//       }
//       return next;
//     });

//     lastReleaseRef.current = releaseTime;
//   };

//   useEffect(() => {
//     const down = (ev: KeyboardEvent) => handleKeyDown(ev);
//     const up   = (ev: KeyboardEvent) => handleKeyUp(ev);
//     document.addEventListener('keydown', down);
//     document.addEventListener('keyup', up);
//     return () => {
//       document.removeEventListener('keydown', down);
//       document.removeEventListener('keyup', up);
//     };
//   }, []); // once

//   // ==== submit ====
//   const handleSubmit = () => {
//     // duration first press → last release
//     const presses = keyData.filter(k => typeof k.pressTime === 'number');
//     const releases = keyData.filter(k => typeof k.releaseTime === 'number' && k.releaseTime !== null);
//     const firstPress = presses.length ? Math.min(...presses.map(k => k.pressTime)) : (sessionStart ?? Date.now());
//     const lastRelease = releases.length ? Math.max(...releases.map(k => k.releaseTime as number)) : Date.now();
//     const durationMs = Math.max(0, lastRelease - firstPress);
//     const minutes = durationMs / 60000 || 1e-9;

//     // alignments (use RAW strings here; normalized also saved below)
//     const typedChars = Array.from(inputValue);
//     const targetChars = Array.from(displayText);
//     const charAln = levenshteinWithOps(typedChars, targetChars);

//     const typedWords = tokenizeWords(inputValue);
//     const targetWords = tokenizeWords(displayText);
//     const wordAln = levenshteinWithOps(typedWords, targetWords);

//     // normalized for “double-space domino” avoidance
//     const typedNorm = normalizeWhitespace(inputValue);
//     const targetNorm = normalizeWhitespace(displayText);
//     const charNorm = levenshteinWithOps(Array.from(typedNorm), Array.from(targetNorm));
//     const wordErrsNorm = levenshteinWithOps(tokenizeWords(typedNorm), tokenizeWords(targetNorm)).distance;

//     // confusion pairs from char substitutions
//     const confusion: Record<string, number> = {};
//     for (const o of charAln.ops) {
//       if (o.op === 'sub' && o.a && o.b) {
//         const key = `${o.a}->${o.b}`;
//         confusion[key] = (confusion[key] || 0) + 1;
//       }
//     }

//     // speeds
//     const rawWpm5 = (inputValue.length / 5) / minutes;
//     const charWpm = (inputValue.length) / minutes;
//     const wordWpm = (typedWords.length) / minutes;
//     const netWpm5 = Math.max(0, rawWpm5 - (wordAln.counts.substitutions + wordAln.counts.insertions + wordAln.counts.deletions) / minutes);

//     // accuracies
//     const charAcc = Math.max(0, (charAln.counts.matches) / Math.max(targetChars.length, 1));
//     const wordAcc = Math.max(0, (wordAln.counts.matches) / Math.max(targetWords.length, 1));
//     const normAcc = Math.max(0, (Array.from(targetNorm).length - charNorm.distance) / Math.max(Array.from(targetNorm).length, 1));

//     // timing stats
//     const holds = keyData.map(k => (k.holdTime ?? 0)).filter(v => v > 0);
//     const lags  = keyData.map(k => (k.lagTime ?? 0)).filter(v => v >= 0);

//     const perKey: Record<string, { count: number; meanHoldMs: number; meanLagMs: number }> = {};
//     const holdSum: Record<string, number> = {};
//     const lagSum:  Record<string, number> = {};
//     keyData.forEach(k => {
//       const label = `${k.code}`; // use code to disambiguate (e.g., LeftShift vs RightShift)
//       perKey[label] = perKey[label] || { count: 0, meanHoldMs: 0, meanLagMs: 0 };
//       perKey[label].count += 1;
//       holdSum[label] = (holdSum[label] || 0) + (k.holdTime ?? 0);
//       lagSum[label]  = (lagSum[label]  || 0) + (k.lagTime ?? 0);
//     });
//     Object.keys(perKey).forEach(ch => {
//       perKey[ch].meanHoldMs = perKey[ch].count ? holdSum[ch] / perKey[ch].count : 0;
//       perKey[ch].meanLagMs  = perKey[ch].count ? lagSum[ch]  / perKey[ch].count  : 0;
//     });

//     const payload: KeystrokeSavePayload = {
//       typedText: inputValue,          // RAW full text (incl. double spaces)
//       targetText: displayText,
//       keyData,                        // ALL keys (letters, space, arrows, backspace, enter, tab…)
//       analysis: {
//         char: { ops: charAln.ops, counts: charAln.counts },
//         word: { ops: wordAln.ops, counts: wordAln.counts },
//         normalized: {
//           typed: typedNorm,
//           target: targetNorm,
//           charDistance: charNorm.distance,
//           wordErrors: wordErrsNorm,
//         },
//         confusionPairs: confusion,
//       },
//       metrics: {
//         startMs: firstPress,
//         endMs: lastRelease,
//         durationMs,
//         totalKeys: keyData.length,
//         backspaceCount,
//         rawWpm5,
//         charWpm,
//         wordWpm,
//         netWpm5,
//         charAccuracy: charAcc,
//         wordAccuracy: wordAcc,
//         normalizedCharAccuracy: normAcc,
//         holdMs: { mean: mean(holds), median: median(holds), p95: percentile(holds, 95) },
//         interKeyMs:{ mean: mean(lags),  median: median(lags),  p95: percentile(lags, 95)  },
//         perKey,
//       },
//       ui: {
//         font,
//         fontSize,
//         isBold,
//         textColor,
//         backgroundColor,
//         backgroundOpacity,
//       },
//     };



//     saveKeystrokeData(payload);
    
// // Ask if they want a quick performance summary
// if (window.confirm('Would you like to see a quick performance summary?')) {
//   const m = payload.metrics;
//   const secs = Math.max(0, Math.round(m.durationMs / 100) / 10); // 0.1s precision

//   const summary =
//     `Time: ${secs}s
// Raw WPM (5-char): ${s1(m.rawWpm5)}
// Net WPM (5-char): ${s1(m.netWpm5)}
// Char Accuracy: ${pct(m.charAccuracy)}
// Word Accuracy: ${pct(m.wordAccuracy)}
// Normalized Char Accuracy: ${pct(m.normalizedCharAccuracy)}`;

//   window.alert(summary);
// }

//   };

//   //both options seperately 
// const resetTypingOnly = () => {
//   setInputValue('');
//   setKeyData([]);
//   setBackspaceCount(0);
//   setSessionStart(null);
//   typingStartedRef.current = false;
//   lastPressRef.current = null;
//   lastReleaseRef.current = null;
//   textareaRef.current?.focus();
// };

// const resetAll = () => {
//   resetTypingOnly();
//   setDisplayText('');   // also clears the target text
// };


// /* 
//   //reset both typing and text 
// const handleReset = () => {
//   setInputValue('');
//   setKeyData([]);
//   setBackspaceCount(0);
//   setSessionStart(null);
//   typingStartedRef.current = false;
//   lastPressRef.current = null;
//   lastReleaseRef.current = null;

//   // NEW: also clear the displayed paragraph
//   setDisplayText('');

//   // optional: put cursor back in the box
//   textareaRef.current?.focus();
// }; */

// /*   //reset only text old style
// const handleReset = () => {
//     setInputValue('');
//     setKeyData([]);
//     setBackspaceCount(0);
//     setSessionStart(null);
//     typingStartedRef.current = false;
//     lastPressRef.current = null;
//     lastReleaseRef.current = null;
//   }; */

//   return (
//     <div className="relative w-full">
//       <div className="flex flex-row justify-between items-start w-3/4 space-x-4">
//         <div className="flex-1 text-xs">
//           <textarea
//             ref={textareaRef}
//             value={inputValue}
//             placeholder={placeholder}
//             onChange={(e)=>setInputValue(e.target.value)}
//             style={{
//               width: '100%',
//               height: '300px',
//               fontFamily: font,
//               fontSize: `${fontSize}px`,
//               fontWeight: isBold ? 'bold' : 'normal',
//               color: textColor,
//               backgroundColor: `rgba(${parseInt(backgroundColor.slice(1, 3), 16)}, ${parseInt(
//                 backgroundColor.slice(3, 5), 16
//               )}, ${parseInt(backgroundColor.slice(5, 7), 16)}, ${backgroundOpacity})`,
//               border: '1px solid #ccc',
//               outline: 'none',
//               padding: '10px',
//               borderRadius: '4px',
//               resize: 'vertical',
//               overflowY: 'scroll',
//             }}
//           />
//         </div>
//       </div>

//       <button
//         onClick={() => setIsPanelOpen(!isPanelOpen)}
//         className="mt-3 text-xs bg-gray-100 p-2 border rounded"
//       >
//         {isPanelOpen ? 'Hide Text Controls' : 'Show Text Controls'}
//       </button>

//       <Collapse isOpened={isPanelOpen}>
//         <div className="mt-2 grid grid-cols-2 gap-3 max-w-sm text-xs bg-white/70 p-3 border rounded shadow">
//           <div>
//             <label className="block mb-1">Font</label>
//             <select value={font} onChange={(e) => setFont(e.target.value)} className="border p-2 rounded w-full">
//               <option value="Arial">Arial</option>
//               <option value="Verdana">Verdana</option>
//               <option value="Times New Roman">Times New Roman</option>
//               <option value="Courier New">Courier New</option>
//               <option value="Georgia">Georgia</option>
//             </select>
//           </div>

//           <div>
//             <label className="block mb-1">Font Size</label>
//             <select value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="border p-2 rounded w-full">
//               {[...Array(31)].map((_, i) => (
//                 <option key={i} value={10 + i}>
//                   {10 + i}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <label className="flex items-center gap-2">
//             <span>Bold</span>
//             <input type="checkbox" checked={isBold} onChange={(e) => setIsBold(e.target.checked)} />
//           </label>

//           <div>
//             <label className="block mb-1">Text Color</label>
//             <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-full h-8" />
//           </div>

//           <div>
//             <label className="block mb-1">Background Color</label>
//             <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="w-full h-8" />
//           </div>

//           <div>
//             <label className="block mb-1">Background Opacity</label>
//             <input
//               type="range"
//               min="0"
//               max="1"
//               step="0.01"
//               value={backgroundOpacity}
//               onChange={(e) => setBackgroundOpacity(parseFloat(e.target.value))}
//               className="w-full"
//             />
//           </div>
//         </div>
//       </Collapse>

//       <div className="mt-3">
//         <button onClick={handleSubmit} style={buttonStyle}>Submit</button>
//   {/*       <button onClick={handleReset} style={{ ...buttonStyle, marginLeft: '0.5rem' }}>
//           Reset
//         </button> */}

//         <button onClick={resetTypingOnly} style={buttonStyle}>Reset typing</button>
// <button onClick={resetAll} style={{ ...buttonStyle, marginLeft: '0.5rem' }}>
//   Reset all
// </button>

//       </div>
//     </div>
//   );
// };

// export default TextInput;

// // src/components/Therapy/TextInput.tsx
// //last working with reset only the textg 
// import React, { useState, useEffect, useRef } from 'react';
// import { Collapse } from 'react-collapse';
// import buttonStyle from './buttonStyle';
 
// const pct = (x: number) => `${Math.round((x ?? 0) * 100)}%`;
// const s1  = (x: number) => (Math.round((x ?? 0) * 10) / 10).toString(); // one decimal
// export interface KeyData {
//   key: string;           // e.g. "a", "Backspace", " "
//   code: string;          // e.g. "KeyA", "Space", "ArrowLeft"
//   pressTime: number;
//   releaseTime: number | null;
//   holdTime: number | null;
//   lagTime: number;       // since previous release
//   totalLagTime: number;  // since previous press
//   altKey?: boolean;
//   ctrlKey?: boolean;
//   metaKey?: boolean;
//   shiftKey?: boolean;
// }

// export interface KeystrokeSavePayload {
//   typedText: string;
//   targetText: string;
//   keyData: KeyData[];
//   analysis: {
//     char: {
//       ops: Array<{ op: 'match'|'ins'|'del'|'sub'; a?: string; b?: string; ai: number; bi: number }>;
//       counts: { matches: number; insertions: number; deletions: number; substitutions: number };
//     };
//     word: {
//       ops: Array<{ op: 'match'|'ins'|'del'|'sub'; a?: string; b?: string; ai: number; bi: number }>;
//       counts: { matches: number; insertions: number; deletions: number; substitutions: number };
//     };
//     normalized: {
//       typed: string;
//       target: string;
//       charDistance: number;
//       wordErrors: number;
//     };
//     confusionPairs: Record<string, number>;
//   };
//   metrics: {
//     startMs: number;
//     endMs: number;
//     durationMs: number;
//     totalKeys: number;
//     backspaceCount: number;
//     rawWpm5: number;
//     charWpm: number;
//     wordWpm: number;
//     netWpm5: number;
//     charAccuracy: number;
//     wordAccuracy: number;
//     normalizedCharAccuracy: number;
//     holdMs: { mean: number; median: number; p95: number };
//     interKeyMs: { mean: number; median: number; p95: number };
//     perKey: Record<string, { count: number; meanHoldMs: number; meanLagMs: number }>;
//   };
//   // include the text UI so you can save it too
//   ui: {
//     font: string;
//     fontSize: number;
//     isBold: boolean;
//     textColor: string;
//     backgroundColor: string;   // hex like "#RRGGBB"
//     backgroundOpacity: number; // 0..1
//   };
// }

// interface TextInputProps {
//   placeholder: string;
//   displayText: string;
//   setDisplayText: React.Dispatch<React.SetStateAction<string>>;
//   saveKeystrokeData: (payload: KeystrokeSavePayload) => void;
//   onTypingStart?: () => void; // used by TherapyPage to snapshot animation settings
// }

// const TextInput: React.FC<TextInputProps> = ({
//   placeholder,
//   displayText,
//   setDisplayText,
//   saveKeystrokeData,
//   onTypingStart,
// }) => {
//   const [inputValue, setInputValue] = useState('');
//   const [keyData, setKeyData] = useState<KeyData[]>([]);
//   const [font, setFont] = useState('Arial');
//   const [fontSize, setFontSize] = useState(16);
//   const [isBold, setIsBold] = useState(false);
//   const [textColor, setTextColor] = useState('#000000');
//   const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
//   const [backgroundOpacity, setBackgroundOpacity] = useState(1);
//   const [isPanelOpen, setIsPanelOpen] = useState(true);

//   const [sessionStart, setSessionStart] = useState<number | null>(null);
//   const [backspaceCount, setBackspaceCount] = useState(0);

//   const keyDataRef = useRef<KeyData[]>([]);
//   const lastPressRef = useRef<number | null>(null);
//   const lastReleaseRef = useRef<number | null>(null);
//   const typingStartedRef = useRef(false);
//   const textareaRef = useRef<HTMLTextAreaElement | null>(null);

//   useEffect(() => { keyDataRef.current = keyData; }, [keyData]);

//   // ==== helpers ====
//   const normalizeWhitespace = (s: string) => s.replace(/\s+/g, ' ').trim();
//   const tokenizeWords = (s: string) => (s.trim().length ? s.trim().split(/\s+/) : []);

//   const levenshteinWithOps = (a: string[], b: string[]) => {
//     const m = a.length, n = b.length;
//     const dp = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
//     for (let i = 0; i <= m; i++) dp[i][0] = i;
//     for (let j = 0; j <= n; j++) dp[0][j] = j;
//     for (let i = 1; i <= m; i++) {
//       for (let j = 1; j <= n; j++) {
//         const cost = a[i - 1] === b[j - 1] ? 0 : 1;
//         dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
//       }
//     }
//     const ops: Array<{ op: 'match'|'ins'|'del'|'sub'; a?: string; b?: string; ai: number; bi: number }> = [];
//     let i = m, j = n;
//     while (i > 0 || j > 0) {
//       if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] && a[i - 1] === b[j - 1]) {
//         ops.push({ op: 'match', a: a[i - 1], b: b[j - 1], ai: i - 1, bi: j - 1 });
//         i--; j--;
//       } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
//         ops.push({ op: 'sub', a: a[i - 1], b: b[j - 1], ai: i - 1, bi: j - 1 });
//         i--; j--;
//       } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
//         ops.push({ op: 'del', a: a[i - 1], ai: i - 1, bi: j });
//         i--;
//       } else {
//         ops.push({ op: 'ins', b: b[j - 1], ai: i, bi: j - 1 });
//         j--;
//       }
//     }
//     ops.reverse();
//     const counts = {
//       matches: ops.filter(o => o.op === 'match').length,
//       insertions: ops.filter(o => o.op === 'ins').length,
//       deletions: ops.filter(o => o.op === 'del').length,
//       substitutions: ops.filter(o => o.op === 'sub').length,
//     };
//     return { ops, counts, distance: dp[m][n] };
//   };

//   const mean = (arr: number[]) => (arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0);
//   const median = (arr: number[]) => {
//     if (!arr.length) return 0;
//     const s = [...arr].sort((a,b)=>a-b);
//     const m = Math.floor(s.length/2);
//     return s.length % 2 ? s[m] : (s[m-1]+s[m])/2;
//   };
//   const percentile = (arr: number[], p: number) => {
//     if (!arr.length) return 0;
//     const s = [...arr].sort((a,b)=>a-b);
//     const idx = Math.min(s.length-1, Math.max(0, Math.ceil((p/100)*s.length)-1));
//     return s[idx];
//   };

//   // ==== key listeners (capture ALL keys while textarea focused) ====
//   const handleKeyDown = (e: KeyboardEvent) => {
//     // only record if our textarea has focus
//     if (document.activeElement !== textareaRef.current) return;

//     const pressTime = Date.now();

//     // first visible char triggers typing-start (once)
//     if (!typingStartedRef.current && e.key.length === 1) {
//       typingStartedRef.current = true;
//       onTypingStart?.();
//     }

//     if (sessionStart === null) setSessionStart(pressTime);

//     if (e.key === 'Backspace') {
//       setBackspaceCount(c => c + 1);
//     }

//     const lagTime = lastReleaseRef.current !== null ? pressTime - lastReleaseRef.current : 0;
//     const totalLagTime = lastPressRef.current !== null ? pressTime - lastPressRef.current : 0;

//     setKeyData(prev => ([
//       ...prev,
//       {
//         key: e.key,
//         code: e.code,
//         pressTime,
//         releaseTime: null,
//         holdTime: null,
//         lagTime,
//         totalLagTime,
//         altKey: e.altKey,
//         ctrlKey: e.ctrlKey,
//         metaKey: e.metaKey,
//         shiftKey: e.shiftKey,
//       }
//     ]));

//     lastPressRef.current = pressTime;
//   };

//   const handleKeyUp = (e: KeyboardEvent) => {
//     if (document.activeElement !== textareaRef.current) return;

//     const releaseTime = Date.now();

//     // update the last unreleased event that matches BOTH key & code
//     setKeyData(prev => {
//       const next = [...prev];
//       for (let i = next.length - 1; i >= 0; i--) {
//         const k = next[i];
//         if (k.releaseTime === null && k.key === e.key && k.code === e.code) {
//           next[i] = { ...k, releaseTime, holdTime: releaseTime - k.pressTime };
//           break;
//         }
//       }
//       return next;
//     });

//     lastReleaseRef.current = releaseTime;
//   };

//   useEffect(() => {
//     const down = (ev: KeyboardEvent) => handleKeyDown(ev);
//     const up   = (ev: KeyboardEvent) => handleKeyUp(ev);
//     document.addEventListener('keydown', down);
//     document.addEventListener('keyup', up);
//     return () => {
//       document.removeEventListener('keydown', down);
//       document.removeEventListener('keyup', up);
//     };
//   }, []); // once

//   // ==== submit ====
//   const handleSubmit = () => {
//     // duration first press → last release
//     const presses = keyData.filter(k => typeof k.pressTime === 'number');
//     const releases = keyData.filter(k => typeof k.releaseTime === 'number' && k.releaseTime !== null);
//     const firstPress = presses.length ? Math.min(...presses.map(k => k.pressTime)) : (sessionStart ?? Date.now());
//     const lastRelease = releases.length ? Math.max(...releases.map(k => k.releaseTime as number)) : Date.now();
//     const durationMs = Math.max(0, lastRelease - firstPress);
//     const minutes = durationMs / 60000 || 1e-9;

//     // alignments (use RAW strings here; normalized also saved below)
//     const typedChars = Array.from(inputValue);
//     const targetChars = Array.from(displayText);
//     const charAln = levenshteinWithOps(typedChars, targetChars);

//     const typedWords = tokenizeWords(inputValue);
//     const targetWords = tokenizeWords(displayText);
//     const wordAln = levenshteinWithOps(typedWords, targetWords);

//     // normalized for “double-space domino” avoidance
//     const typedNorm = normalizeWhitespace(inputValue);
//     const targetNorm = normalizeWhitespace(displayText);
//     const charNorm = levenshteinWithOps(Array.from(typedNorm), Array.from(targetNorm));
//     const wordErrsNorm = levenshteinWithOps(tokenizeWords(typedNorm), tokenizeWords(targetNorm)).distance;

//     // confusion pairs from char substitutions
//     const confusion: Record<string, number> = {};
//     for (const o of charAln.ops) {
//       if (o.op === 'sub' && o.a && o.b) {
//         const key = `${o.a}->${o.b}`;
//         confusion[key] = (confusion[key] || 0) + 1;
//       }
//     }

//     // speeds
//     const rawWpm5 = (inputValue.length / 5) / minutes;
//     const charWpm = (inputValue.length) / minutes;
//     const wordWpm = (typedWords.length) / minutes;
//     const netWpm5 = Math.max(0, rawWpm5 - (wordAln.counts.substitutions + wordAln.counts.insertions + wordAln.counts.deletions) / minutes);

//     // accuracies
//     const charAcc = Math.max(0, (charAln.counts.matches) / Math.max(targetChars.length, 1));
//     const wordAcc = Math.max(0, (wordAln.counts.matches) / Math.max(targetWords.length, 1));
//     const normAcc = Math.max(0, (Array.from(targetNorm).length - charNorm.distance) / Math.max(Array.from(targetNorm).length, 1));

//     // timing stats
//     const holds = keyData.map(k => (k.holdTime ?? 0)).filter(v => v > 0);
//     const lags  = keyData.map(k => (k.lagTime ?? 0)).filter(v => v >= 0);

//     const perKey: Record<string, { count: number; meanHoldMs: number; meanLagMs: number }> = {};
//     const holdSum: Record<string, number> = {};
//     const lagSum:  Record<string, number> = {};
//     keyData.forEach(k => {
//       const label = `${k.code}`; // use code to disambiguate (e.g., LeftShift vs RightShift)
//       perKey[label] = perKey[label] || { count: 0, meanHoldMs: 0, meanLagMs: 0 };
//       perKey[label].count += 1;
//       holdSum[label] = (holdSum[label] || 0) + (k.holdTime ?? 0);
//       lagSum[label]  = (lagSum[label]  || 0) + (k.lagTime ?? 0);
//     });
//     Object.keys(perKey).forEach(ch => {
//       perKey[ch].meanHoldMs = perKey[ch].count ? holdSum[ch] / perKey[ch].count : 0;
//       perKey[ch].meanLagMs  = perKey[ch].count ? lagSum[ch]  / perKey[ch].count  : 0;
//     });

//     const payload: KeystrokeSavePayload = {
//       typedText: inputValue,          // RAW full text (incl. double spaces)
//       targetText: displayText,
//       keyData,                        // ALL keys (letters, space, arrows, backspace, enter, tab…)
//       analysis: {
//         char: { ops: charAln.ops, counts: charAln.counts },
//         word: { ops: wordAln.ops, counts: wordAln.counts },
//         normalized: {
//           typed: typedNorm,
//           target: targetNorm,
//           charDistance: charNorm.distance,
//           wordErrors: wordErrsNorm,
//         },
//         confusionPairs: confusion,
//       },
//       metrics: {
//         startMs: firstPress,
//         endMs: lastRelease,
//         durationMs,
//         totalKeys: keyData.length,
//         backspaceCount,
//         rawWpm5,
//         charWpm,
//         wordWpm,
//         netWpm5,
//         charAccuracy: charAcc,
//         wordAccuracy: wordAcc,
//         normalizedCharAccuracy: normAcc,
//         holdMs: { mean: mean(holds), median: median(holds), p95: percentile(holds, 95) },
//         interKeyMs:{ mean: mean(lags),  median: median(lags),  p95: percentile(lags, 95)  },
//         perKey,
//       },
//       ui: {
//         font,
//         fontSize,
//         isBold,
//         textColor,
//         backgroundColor,
//         backgroundOpacity,
//       },
//     };



//     saveKeystrokeData(payload);
    
// // Ask if they want a quick performance summary
// if (window.confirm('Would you like to see a quick performance summary?')) {
//   const m = payload.metrics;
//   const secs = Math.max(0, Math.round(m.durationMs / 100) / 10); // 0.1s precision

//   const summary =
//     `Time: ${secs}s
// Raw WPM (5-char): ${s1(m.rawWpm5)}
// Net WPM (5-char): ${s1(m.netWpm5)}
// Char Accuracy: ${pct(m.charAccuracy)}
// Word Accuracy: ${pct(m.wordAccuracy)}
// Normalized Char Accuracy: ${pct(m.normalizedCharAccuracy)}`;

//   window.alert(summary);
// }

//   };

//   const handleReset = () => {
//     setInputValue('');
//     setKeyData([]);
//     setBackspaceCount(0);
//     setSessionStart(null);
//     typingStartedRef.current = false;
//     lastPressRef.current = null;
//     lastReleaseRef.current = null;
//   };

//   return (
//     <div className="relative w-full">
//       <div className="flex flex-row justify-between items-start w-3/4 space-x-4">
//         <div className="flex-1 text-xs">
//           <textarea
//             ref={textareaRef}
//             value={inputValue}
//             placeholder={placeholder}
//             onChange={(e)=>setInputValue(e.target.value)}
//             style={{
//               width: '100%',
//               height: '300px',
//               fontFamily: font,
//               fontSize: `${fontSize}px`,
//               fontWeight: isBold ? 'bold' : 'normal',
//               color: textColor,
//               backgroundColor: `rgba(${parseInt(backgroundColor.slice(1, 3), 16)}, ${parseInt(
//                 backgroundColor.slice(3, 5), 16
//               )}, ${parseInt(backgroundColor.slice(5, 7), 16)}, ${backgroundOpacity})`,
//               border: '1px solid #ccc',
//               outline: 'none',
//               padding: '10px',
//               borderRadius: '4px',
//               resize: 'vertical',
//               overflowY: 'scroll',
//             }}
//           />
//         </div>
//       </div>

//       <button
//         onClick={() => setIsPanelOpen(!isPanelOpen)}
//         className="mt-3 text-xs bg-gray-100 p-2 border rounded"
//       >
//         {isPanelOpen ? 'Hide Text Controls' : 'Show Text Controls'}
//       </button>

//       <Collapse isOpened={isPanelOpen}>
//         <div className="mt-2 grid grid-cols-2 gap-3 max-w-sm text-xs bg-white/70 p-3 border rounded shadow">
//           <div>
//             <label className="block mb-1">Font</label>
//             <select value={font} onChange={(e) => setFont(e.target.value)} className="border p-2 rounded w-full">
//               <option value="Arial">Arial</option>
//               <option value="Verdana">Verdana</option>
//               <option value="Times New Roman">Times New Roman</option>
//               <option value="Courier New">Courier New</option>
//               <option value="Georgia">Georgia</option>
//             </select>
//           </div>

//           <div>
//             <label className="block mb-1">Font Size</label>
//             <select value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="border p-2 rounded w-full">
//               {[...Array(31)].map((_, i) => (
//                 <option key={i} value={10 + i}>
//                   {10 + i}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <label className="flex items-center gap-2">
//             <span>Bold</span>
//             <input type="checkbox" checked={isBold} onChange={(e) => setIsBold(e.target.checked)} />
//           </label>

//           <div>
//             <label className="block mb-1">Text Color</label>
//             <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-full h-8" />
//           </div>

//           <div>
//             <label className="block mb-1">Background Color</label>
//             <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="w-full h-8" />
//           </div>

//           <div>
//             <label className="block mb-1">Background Opacity</label>
//             <input
//               type="range"
//               min="0"
//               max="1"
//               step="0.01"
//               value={backgroundOpacity}
//               onChange={(e) => setBackgroundOpacity(parseFloat(e.target.value))}
//               className="w-full"
//             />
//           </div>
//         </div>
//       </Collapse>

//       <div className="mt-3">
//         <button onClick={handleSubmit} style={buttonStyle}>Submit</button>
//         <button onClick={handleReset} style={{ ...buttonStyle, marginLeft: '0.5rem' }}>
//           Reset
//         </button>
//       </div>
//     </div>
//   );
// };

// export default TextInput;



// import React, { useState, useEffect, useRef } from 'react';
// import { Collapse } from 'react-collapse';
// import buttonStyle from './buttonStyle';

// export interface KeyData {
//   key: string;               // includes printable + special (Backspace, Enter, Tab...)
//   pressTime: number;         // ms epoch
//   releaseTime: number | null;
//   holdTime: number | null;   // release - press
//   lagTime: number;           // since last release
//   totalLagTime: number;      // since last press
// }

// export interface KeystrokeSavePayload {
//   typedText: string;         // full textarea contents
//   targetText: string;        // what they were copying
//   keyData: KeyData[];        // every key recorded, including Backspace/Enter
//   analysis: {
//     char: {
//       ops: Array<{ op: 'match'|'ins'|'del'|'sub'; a?: string; b?: string; ai: number; bi: number }>;
//       counts: { matches: number; insertions: number; deletions: number; substitutions: number };
//     };
//     word: {
//       ops: Array<{ op: 'match'|'ins'|'del'|'sub'; a?: string; b?: string; ai: number; bi: number }>;
//       counts: { matches: number; insertions: number; deletions: number; substitutions: number };
//     };
//     normalized: {
//       typed: string;
//       target: string;
//       charDistance: number;
//       wordErrors: number;
//     };
//     confusionPairs: Record<string, number>;
//   };
//   metrics: {
//     startMs: number;
//     endMs: number;
//     durationMs: number;
//     totalKeys: number;
//     backspaceCount: number;
//     rawWpm5: number;
//     charWpm: number;
//     wordWpm: number;
//     netWpm5: number;
//     charAccuracy: number;
//     wordAccuracy: number;
//     normalizedCharAccuracy: number;
//     holdMs: { mean: number; median: number; p95: number };
//     interKeyMs: { mean: number; median: number; p95: number };
//     perKey: Record<string, { count: number; meanHoldMs: number; meanLagMs: number }>;
//   };
//   // 🔹 Text input UI controls so you can reproduce context later
//   ui: {
//     font: string;
//     fontSize: number;
//     isBold: boolean;
//     textColor: string;
//     backgroundColor: string;
//     backgroundOpacity: number;
//   };
// }

// interface TextInputProps {
//   placeholder: string;
//   displayText: string;
//   setDisplayText: React.Dispatch<React.SetStateAction<string>>;
//   saveKeystrokeData: (payload: KeystrokeSavePayload) => void;
//   onTypingStart?: () => void;   // parent will snapshot animation settings here
// }

// const TextInput: React.FC<TextInputProps> = ({
//   placeholder,
//   displayText,
//   setDisplayText,
//   saveKeystrokeData,
//   onTypingStart,
// }) => {
//   // Text and UI controls
//   const [inputValue, setInputValue] = useState<string>('');
//   const [font, setFont] = useState<string>('Arial');
//   const [fontSize, setFontSize] = useState<number>(16);
//   const [isBold, setIsBold] = useState<boolean>(false);
//   const [textColor, setTextColor] = useState<string>('#000000');
//   const [backgroundColor, setBackgroundColor] = useState<string>('#FFFFFF');
//   const [backgroundOpacity, setBackgroundOpacity] = useState<number>(1);
//   const [isPanelOpen, setIsPanelOpen] = useState<boolean>(true);

//   // Keystroke capture
//   const [keyData, setKeyData] = useState<KeyData[]>([]);
//   const [backspaceCount, setBackspaceCount] = useState<number>(0);
//   const [sessionStart, setSessionStart] = useState<number | null>(null);

//   // Refs for timing and one-time trigger
//   const keyDataRef = useRef<KeyData[]>(keyData);
//   const lastKeyPressRef = useRef<number | null>(null);
//   const lastKeyReleaseRef = useRef<number | null>(null);
//   const typingStartedRef = useRef<boolean>(false);

//   useEffect(() => { keyDataRef.current = keyData; }, [keyData]);

//   // ---------- helpers ----------
//   const normalizeWhitespace = (s: string) => s.replace(/\s+/g, ' ').trim();
//   const tokenizeWords = (s: string) => (s.trim().length ? s.trim().split(/\s+/) : []);

//   const levenshteinWithOps = (a: string[], b: string[]) => {
//     const m = a.length, n = b.length;
//     const dp = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
//     for (let i = 0; i <= m; i++) dp[i][0] = i;
//     for (let j = 0; j <= n; j++) dp[0][j] = j;
//     for (let i = 1; i <= m; i++) {
//       for (let j = 1; j <= n; j++) {
//         const cost = a[i - 1] === b[j - 1] ? 0 : 1;
//         dp[i][j] = Math.min(
//           dp[i - 1][j] + 1,
//           dp[i][j - 1] + 1,
//           dp[i - 1][j - 1] + cost
//         );
//       }
//     }
//     const ops: Array<{ op:'match'|'ins'|'del'|'sub'; a?:string; b?:string; ai:number; bi:number }> = [];
//     let i = m, j = n;
//     while (i > 0 || j > 0) {
//       if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] && a[i - 1] === b[j - 1]) {
//         ops.push({ op:'match', a:a[i-1], b:b[j-1], ai:i-1, bi:j-1 }); i--; j--;
//       } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
//         ops.push({ op:'sub', a:a[i-1], b:b[j-1], ai:i-1, bi:j-1 }); i--; j--;
//       } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
//         ops.push({ op:'del', a:a[i-1], ai:i-1, bi:j }); i--;
//       } else {
//         ops.push({ op:'ins', b:b[j-1], ai:i, bi:j-1 }); j--;
//       }
//     }
//     ops.reverse();
//     const counts = {
//       matches:     ops.filter(o => o.op==='match').length,
//       insertions:  ops.filter(o => o.op==='ins').length,
//       deletions:   ops.filter(o => o.op==='del').length,
//       substitutions: ops.filter(o => o.op==='sub').length,
//     };
//     return { ops, counts, distance: dp[m][n] };
//   };

//   const mean = (arr: number[]) => (arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0);
//   const median = (arr: number[]) => {
//     if (!arr.length) return 0;
//     const s = [...arr].sort((a,b)=>a-b);
//     const m = Math.floor(s.length/2);
//     return s.length % 2 ? s[m] : (s[m-1]+s[m])/2;
//   };
//   const percentile = (arr: number[], p: number) => {
//     if (!arr.length) return 0;
//     const s = [...arr].sort((a,b)=>a-b);
//     const idx = Math.min(s.length-1, Math.max(0, Math.ceil((p/100)*s.length)-1));
//     return s[idx];
//   };

//   // ---------- key listeners ----------
//   const handleKeyDown = (e: KeyboardEvent) => {
//     const pressTime = Date.now();

//     // Fire ONCE when typing starts (first visible char or space/enter/backspace)
//     const startsTyping =
//       e.key.length === 1 || e.key === 'Backspace' || e.key === 'Enter' || e.code === 'Space';
//     if (!typingStartedRef.current && startsTyping) {
//       typingStartedRef.current = true;
//       onTypingStart?.();
//     }

//     if (sessionStart === null && startsTyping) setSessionStart(pressTime);

//     // Track backspaces and still record them in keyData
//     if (e.key === 'Backspace') setBackspaceCount((c) => c + 1);

//     // Record most keys (skip pure modifiers to avoid noise)
//     const skip = ['Shift', 'Alt', 'Control', 'Meta', 'CapsLock'];
//     if (skip.includes(e.key)) return;

//     const lagTime = lastKeyReleaseRef.current !== null ? pressTime - lastKeyReleaseRef.current : 0;
//     const totalLagTime = lastKeyPressRef.current !== null ? pressTime - lastKeyPressRef.current : 0;

//     setKeyData(prev => ([
//       ...prev,
//       { key: e.key, pressTime, releaseTime: null, holdTime: null, lagTime, totalLagTime }
//     ]));

//     lastKeyPressRef.current = pressTime;
//   };

//   const handleKeyUp = (e: KeyboardEvent) => {
//     const releaseTime = Date.now();

//     // Update the earliest un-released matching key entry
//     setKeyData((prev) => {
//       let updated = false;
//       const next = prev.map((k) => {
//         if (!updated && k.key === e.key && k.releaseTime === null) {
//           updated = true;
//           return { ...k, releaseTime, holdTime: releaseTime - k.pressTime };
//         }
//         return k;
//       });
//       return next;
//     });

//     lastKeyReleaseRef.current = releaseTime;
//   };

//   useEffect(() => {
//     const down = (e: KeyboardEvent) => handleKeyDown(e);
//     const up   = (e: KeyboardEvent) => handleKeyUp(e);
//     document.addEventListener('keydown', down);
//     document.addEventListener('keyup', up);
//     return () => {
//       document.removeEventListener('keydown', down);
//       document.removeEventListener('keyup', up);
//     };
//   }, []);

//   // ---------- submit ----------
//   const handleSubmit = () => {
//     // duration from first press → last release
//     const presses = keyData.filter(k => typeof k.pressTime === 'number');
//     const releases = keyData.filter(k => typeof k.releaseTime === 'number' && k.releaseTime !== null);
//     const firstPress = presses.length ? Math.min(...presses.map(k => k.pressTime)) : (sessionStart ?? Date.now());
//     const lastRelease = releases.length ? Math.max(...releases.map(k => k.releaseTime as number)) : Date.now();
//     const durationMs = Math.max(0, lastRelease - firstPress);
//     const minutes = durationMs / 60000 || 1e-9;

//     // tokens & alignments
//     const typedChars = Array.from(inputValue);
//     const targetChars = Array.from(displayText);
//     const charAln = levenshteinWithOps(typedChars, targetChars);

//     const typedWords = tokenizeWords(inputValue);
//     const targetWords = tokenizeWords(displayText);
//     const wordAln = levenshteinWithOps(typedWords, targetWords);

//     // normalized to reduce double-space domino effects
//     const typedNorm = normalizeWhitespace(inputValue);
//     const targetNorm = normalizeWhitespace(displayText);
//     const charNorm = levenshteinWithOps(Array.from(typedNorm), Array.from(targetNorm));
//     const wordErrsNorm = levenshteinWithOps(tokenizeWords(typedNorm), tokenizeWords(targetNorm)).distance;

//     // confusion pairs from substitutions
//     const confusion: Record<string, number> = {};
//     for (const o of charAln.ops) {
//       if (o.op === 'sub' && o.a && o.b) {
//         const key = `${o.a}->${o.b}`;
//         confusion[key] = (confusion[key] || 0) + 1;
//       }
//     }

//     // speeds
//     const rawWpm5 = (inputValue.length / 5) / minutes;
//     const charWpm = (inputValue.length) / minutes;
//     const wordWpm = (typedWords.length) / minutes;
//     const netWpm5 = Math.max(
//       0,
//       rawWpm5 - (wordAln.counts.substitutions + wordAln.counts.insertions + wordAln.counts.deletions) / minutes
//     );

//     // accuracies
//     const charAcc = Math.max(0, (charAln.counts.matches) / Math.max(targetChars.length, 1));
//     const wordAcc = Math.max(0, (wordAln.counts.matches) / Math.max(targetWords.length, 1));
//     const normAcc = Math.max(
//       0,
//       (Array.from(targetNorm).length - charNorm.distance) / Math.max(Array.from(targetNorm).length, 1)
//     );

//     // timing stats
//     const holds = keyData.map(k => (k.holdTime ?? 0)).filter(v => v > 0);
//     const lags  = keyData.map(k => (k.lagTime ?? 0)).filter(v => v >= 0);

//     const perKey: Record<string, { count: number; meanHoldMs: number; meanLagMs: number }> = {};
//     const holdSum: Record<string, number> = {};
//     const lagSum:  Record<string, number> = {};
//     keyData.forEach(k => {
//       const ch = k.key;
//       if (!ch) return;
//       perKey[ch] = perKey[ch] || { count: 0, meanHoldMs: 0, meanLagMs: 0 };
//       perKey[ch].count += 1;
//       holdSum[ch] = (holdSum[ch] || 0) + (k.holdTime ?? 0);
//       lagSum[ch]  = (lagSum[ch]  || 0) + (k.lagTime ?? 0);
//     });
//     Object.keys(perKey).forEach(ch => {
//       perKey[ch].meanHoldMs = perKey[ch].count ? holdSum[ch] / perKey[ch].count : 0;
//       perKey[ch].meanLagMs  = perKey[ch].count ? lagSum[ch]  / perKey[ch].count  : 0;
//     });

//     const payload: KeystrokeSavePayload = {
//       typedText: inputValue,
//       targetText: displayText,
//       keyData,
//       analysis: {
//         char: { ops: charAln.ops, counts: charAln.counts },
//         word: { ops: wordAln.ops, counts: wordAln.counts },
//         normalized: {
//           typed: typedNorm,
//           target: targetNorm,
//           charDistance: charNorm.distance,
//           wordErrors: wordErrsNorm,
//         },
//         confusionPairs: confusion,
//       },
//       metrics: {
//         startMs: firstPress,
//         endMs: lastRelease,
//         durationMs,
//         totalKeys: keyData.length,
//         backspaceCount,
//         rawWpm5,
//         charWpm,
//         wordWpm,
//         netWpm5,
//         charAccuracy: charAcc,
//         wordAccuracy: wordAcc,
//         normalizedCharAccuracy: normAcc,
//         holdMs: { mean: mean(holds), median: median(holds), p95: percentile(holds, 95) },
//         interKeyMs:{ mean: mean(lags),  median: median(lags),  p95: percentile(lags, 95)  },
//         perKey,
//       },
//       ui: {
//         font, fontSize, isBold, textColor, backgroundColor, backgroundOpacity,
//       },
//     };

//     saveKeystrokeData(payload);
//   };

//   return (
//     <div className="relative w-full">
//       <div className="flex flex-row justify-between items-start w-full space-x-4">
//         <div className="flex-1 text-xs">
//           <textarea
//             value={inputValue}
//             placeholder={placeholder}
//             onChange={(e)=>setInputValue(e.target.value)}
//             style={{
//               width: '100%',
//               height: '300px',
//               fontFamily: font,
//               fontSize: `${fontSize}px`,
//               fontWeight: isBold ? 'bold' : 'normal',
//               color: textColor,
//               backgroundColor: `rgba(${parseInt(backgroundColor.slice(1, 3), 16)}, ${parseInt(
//                 backgroundColor.slice(3, 5), 16
//               )}, ${parseInt(backgroundColor.slice(5, 7), 16)}, ${backgroundOpacity})`,
//               border: '1px solid #ccc',
//               outline: 'none',
//               padding: '10px',
//               borderRadius: '4px',
//               resize: 'vertical',
//               overflowY: 'scroll',
//             }}
//           />
//         </div>
//       </div>

//       <button
//         onClick={() => setIsPanelOpen(!isPanelOpen)}
//         className="mt-3 text-xs bg-gray-100 p-2 border rounded"
//       >
//         {isPanelOpen ? 'Hide Text Controls' : 'Show Text Controls'}
//       </button>

//       <Collapse isOpened={isPanelOpen}>
//         <div className="mt-2 grid grid-cols-2 gap-3 max-w-sm text-xs bg-white/70 p-3 border rounded shadow">
//           <div>
//             <label className="block mb-1">Font</label>
//             <select value={font} onChange={(e) => setFont(e.target.value)} className="border p-2 rounded w-full">
//               <option value="Arial">Arial</option>
//               <option value="Verdana">Verdana</option>
//               <option value="Times New Roman">Times New Roman</option>
//               <option value="Courier New">Courier New</option>
//               <option value="Georgia">Georgia</option>
//             </select>
//           </div>

//           <div>
//             <label className="block mb-1">Font Size</label>
//             <select value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="border p-2 rounded w-full">
//               {[...Array(31)].map((_, i) => (
//                 <option key={i} value={10 + i}>
//                   {10 + i}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <label className="flex items-center gap-2">
//             <span>Bold</span>
//             <input type="checkbox" checked={isBold} onChange={(e) => setIsBold(e.target.checked)} />
//           </label>

//           <div>
//             <label className="block mb-1">Text Color</label>
//             <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-full h-8" />
//           </div>

//           <div>
//             <label className="block mb-1">Background Color</label>
//             <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="w-full h-8" />
//           </div>

//           <div>
//             <label className="block mb-1">Background Opacity</label>
//             <input
//               type="range" min="0" max="1" step="0.01"
//               value={backgroundOpacity}
//               onChange={(e) => setBackgroundOpacity(parseFloat(e.target.value))}
//               className="w-full"
//             />
//           </div>
//         </div>
//       </Collapse>

//       <div className="mt-3">
//         <button onClick={handleSubmit} style={buttonStyle}>Submit</button>
//         <button
//           onClick={() => {
//             setInputValue('');
//             setKeyData([]);
//             setBackspaceCount(0);
//             setSessionStart(null);
//             typingStartedRef.current = false;
//             lastKeyPressRef.current = null;
//             lastKeyReleaseRef.current = null;
//           }}
//           style={{ ...buttonStyle, marginLeft: '0.5rem' }}
//         >
//           Reset
//         </button>
//       </div>
//     </div>
//   );
// };

// export default TextInput;



// import React, { useState, useEffect, useCallback } from 'react';
// import MultifunctionAnimation from '../Therapy/MultifunctionAnimation';
// import ShapeAnimations from '../Therapy/ShapeAnimations';
// import ColorAnimation from '../Therapy/ColorAnimation';
// import BaselineTyping from '../Therapy/BaselineTyping';

// import DateTimeDisplay from '../common/DateTimeDisplay';
// import TextDisplay from '../Therapy/TextDisplay';
// import TextInput, { KeystrokeSavePayload } from '../Therapy/TextInput';

// import { useAuth } from '../../data/AuthContext';
// import { db, storage, rtdb } from '../../firebase/firebase';

// // Firestore
// import { addDoc, collection } from 'firebase/firestore';

// // Storage
// import { ref as storageRef, uploadBytes } from 'firebase/storage';

// // RTDB
// import { ref as rtdbRef, set as rtdbSet } from 'firebase/database';

// // CSV
// import Papa from 'papaparse';

// interface Message {
//   message: string;
//   type: 'success' | 'error';
// }
// interface Settings { [key: string]: any; }
// interface AnimSnapshot {
//   tab: 'multifunction' | 'baselinetyping' | 'shape' | 'color';
//   settings: any;
//   startedAt: string;
// }

// const TherapyPage: React.FC = () => {
//   const [currentAnimation, setCurrentAnimation] =
//     useState<'multifunction' | 'baselinetyping' | 'shape' | 'color'>('multifunction');
//   const { currentUser } = useAuth();

//   const [message, setMessage] = useState<Message | null>(null);
//   const [settings, setSettings] = useState<Settings>({});
//   const [displayText, setDisplayText] = useState<string>('');

//   // Snapshot animation settings at first keystroke
//   const [animAtStart, setAnimAtStart] = useState<AnimSnapshot | null>(null);
//   const handleTypingStart = useCallback(() => {
//     setAnimAtStart({
//       tab: currentAnimation,
//       settings: JSON.parse(JSON.stringify(settings)),
//       startedAt: new Date().toISOString(),
//     });
//   }, [currentAnimation, settings]);

//   // Auto-clear toast
//   useEffect(() => {
//     if (!message) return;
//     const t = setTimeout(() => setMessage(null), 3000);
//     return () => clearTimeout(t);
//   }, [message]);

//   // ---- SAVE EVERYTHING to Firestore, Storage (JSON+CSV), and RTDB ----
//   const saveKeystrokeData = async (payload: KeystrokeSavePayload) => {
//     const uid = currentUser?.uid;
//     if (!uid) {
//       setMessage({ message: 'You must be logged in to save.', type: 'error' });
//       return;
//     }

//     const ts = new Date();
//     const sessionId = `${ts.toISOString().replace(/[:.]/g, '-')}-${Math.random()
//       .toString(36).slice(2, 8)}`;

//     const record = {
//       userId: uid,
//       sessionId,

//       // current tab at submit + final snapshot
//       animationTab: currentAnimation,
//       animationAtStart: animAtStart ?? null,
//       animationAtSubmit: {
//         tab: currentAnimation,
//         settings: JSON.parse(JSON.stringify(settings)),
//         submittedAt: ts.toISOString(),
//       },

//       // texts
//       targetText: payload.targetText || displayText || '',
//       typedText: payload.typedText || '',

//       // detailed stream + analysis + metrics + text UI controls
//       keyData: payload.keyData || [],
//       analysis: payload.analysis ?? null,
//       metrics: payload.metrics ?? null,
//       ui: payload.ui, // font, sizes, colors, opacity

//       timestamp: ts.toISOString(),
//       localDateTime: ts.toLocaleString(),
//       schemaVersion: 1,
//     };

//     // ---- Storage paths
//     const basePath = `users/${uid}/keystroke-data/sessions/${sessionId}`;
//     const jsonPath = `${basePath}.json`;
//     const csvPath  = `${basePath}.csv`;

//     // Build JSON blob
//     const json = JSON.stringify(record);
//     const jsonBlob = new Blob([json], { type: 'application/json' });

//     // Build CSV: metadata header + blank + keyData table
//     const metaRows = [
//       ['userId', uid],
//       ['sessionId', sessionId],
//       ['animationTab', currentAnimation],
//       ['animationAtStart', animAtStart ? JSON.stringify(animAtStart) : 'null'],
//       ['animationAtSubmit', JSON.stringify(record.animationAtSubmit)],
//       ['targetText', record.targetText],
//       ['typedText', record.typedText],
//       ['timestamp', record.timestamp],
//       ['localDateTime', record.localDateTime],
//       ['schemaVersion', '1'],
//     ];
//     const keyRows = (record.keyData || []).map((k, idx) => ({
//       idx,
//       key: k.key,
//       pressTime: k.pressTime,
//       releaseTime: k.releaseTime,
//       holdTime: k.holdTime,
//       lagTime: k.lagTime,
//       totalLagTime: k.totalLagTime,
//     }));
//     const keyCsv = Papa.unparse(keyRows);
//     const metaCsv = Papa.unparse(metaRows, { header: false });
//     const fullCsv = `${metaCsv}\n\n${keyCsv}\n`;
//     const csvBlob = new Blob([fullCsv], { type: 'text/csv;charset=utf-8;' });

//     try {
//       // 1) Storage: JSON + CSV
//       await uploadBytes(storageRef(storage, jsonPath), jsonBlob);
//       await uploadBytes(storageRef(storage, csvPath), csvBlob);

//       // 2) Firestore: save full record + pointers to Storage files
//       const firestoreDoc = {
//         ...record,
//         storage: { jsonPath, csvPath, approxJsonBytes: json.length },
//       };
//       await addDoc(collection(db, `users/${uid}/keystroke-data`), firestoreDoc);

//       // 3) RTDB: same full record
//       await rtdbSet(rtdbRef(rtdb, `users/${uid}/keystroke-data/${sessionId}`), firestoreDoc);

//       setMessage({ message: 'Saved to Firestore, Storage (JSON+CSV), and RTDB ✔️', type: 'success' });
//     } catch (err: any) {
//       console.error('Save error:', err);
//       setMessage({ message: `Save error: ${err?.code || ''} ${err?.message || ''}`, type: 'error' });
//     }
//   };

//   return (
//     <div className="relative w-full">
//       <div className="flex justify-center text-sm text-gray-600 rounded p-2 mb-4 w-full">
//         <DateTimeDisplay />

//         <button
//           onClick={() => setCurrentAnimation('baselinetyping')}
//           className={`p-2 mx-2 ${currentAnimation === 'baselinetyping' ? 'bg-blue-500 text-white rounded' : 'bg-gray-200'}`}
//         >
//           Baseline Typing
//         </button>
//         <button
//           onClick={() => setCurrentAnimation('multifunction')}
//           className={`p-2 mx-2 ${currentAnimation === 'multifunction' ? 'bg-blue-500 text-white rounded' : 'bg-gray-200'}`}
//         >
//           Multifunction Animation
//         </button>
//         <button
//           onClick={() => setCurrentAnimation('shape')}
//           className={`p-2 mx-2 ${currentAnimation === 'shape' ? 'bg-blue-500 text-white rounded' : 'bg-gray-200'}`}
//         >
//           Shape Animation
//         </button>
//         <button
//           onClick={() => setCurrentAnimation('color')}
//           className={`p-2 mx-2 ${currentAnimation === 'color' ? 'bg-blue-500 text-white rounded' : 'bg-gray-200'}`}
//         >
//           Color Animation
//         </button>
//       </div>

//       {currentAnimation === 'baselinetyping' && (
//         <BaselineTyping settings={settings} setSettings={setSettings} />
//       )}
//       {currentAnimation === 'multifunction' && (
//         <MultifunctionAnimation settings={settings} setSettings={setSettings} />
//       )}
//       {currentAnimation === 'shape' && (
//         <ShapeAnimations settings={settings} setSettings={setSettings} />
//       )}
//       {currentAnimation === 'color' && (
//         <ColorAnimation settings={settings} setSettings={setSettings} />
//       )}

//       {/* MAIN CONTENT */}
//       <div className="relative w-full ml-52 mt-[22vh]">
//         <div className="w-full max-w-9xl">
//           <TextInput
//             placeholder="Type here…"
//             displayText={displayText}
//             setDisplayText={setDisplayText}
//             saveKeystrokeData={saveKeystrokeData}
//             onTypingStart={handleTypingStart}   // ← snapshot animation at first keystroke
//           />

//           <div className="w-full max-w-9xl mt-4">
//             <TextDisplay displayText={displayText} setDisplayText={setDisplayText} />
//           </div>

//           {message && (
//             <div className="mt-3">
//               <div
//                 className={`inline-block text-white text-xs px-4 py-2 rounded shadow ${
//                   message.type === 'error' ? 'bg-red-500' : 'bg-green-500'
//                 }`}
//               >
//                 {message.message}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TherapyPage;



// // src/components/Therapy/TextInput.tsx

//  //new version with animations to save in the beginning and in the end . as well as start tlyping end typping  . but doesnt work well 
// import React, { useState, useEffect, useRef } from 'react';
// import { Collapse } from 'react-collapse';
// import buttonStyle from './buttonStyle';



// export interface KeyData {
//   key: string;
//   pressTime: number;
//   releaseTime: number | null;
//   holdTime: number | null;
//   lagTime: number;
//   totalLagTime: number;
// }

// export interface KeystrokeSavePayload {
//   typedText: string;
//   targetText: string;
//   keyData: KeyData[];
//   analysis: {
//     char: {
//       ops: Array<{ op: 'match'|'ins'|'del'|'sub'; a?: string; b?: string; ai: number; bi: number }>;
//       counts: { matches: number; insertions: number; deletions: number; substitutions: number };
//     };
//     word: {
//       ops: Array<{ op: 'match'|'ins'|'del'|'sub'; a?: string; b?: string; ai: number; bi: number }>;
//       counts: { matches: number; insertions: number; deletions: number; substitutions: number };
//     };
//     normalized: {
//       typed: string;
//       target: string;
//       charDistance: number;
//       wordErrors: number;
//     };
//     confusionPairs: Record<string, number>;
//   };
//   metrics: {
//     startMs: number;
//     endMs: number;
//     durationMs: number;
//     totalKeys: number;
//     backspaceCount: number;
//     rawWpm5: number;
//     charWpm: number;
//     wordWpm: number;
//     netWpm5: number;
//     charAccuracy: number;
//     wordAccuracy: number;
//     normalizedCharAccuracy: number;
//     holdMs: { mean: number; median: number; p95: number };
//     interKeyMs: { mean: number; median: number; p95: number };
//     perKey: Record<string, { count: number; meanHoldMs: number; meanLagMs: number }>;
//   };
// }

// interface TextInputProps {
//   placeholder: string;
//   displayText: string; // target sentence
//   setDisplayText: React.Dispatch<React.SetStateAction<string>>;
//   saveKeystrokeData: (payload: KeystrokeSavePayload) => void;
//   onTypingStart?: () => void; // optional hook to snapshot animation settings
// }

// const TextInput: React.FC<TextInputProps> = ({
//   placeholder,
//   displayText,
//   setDisplayText,
//   saveKeystrokeData,
//   onTypingStart,
// }) => {
//   const [inputValue, setInputValue] = useState<string>('');
//   const [keyData, setKeyData] = useState<KeyData[]>([]);
//   const [font, setFont] = useState<string>('Arial');
//   const [fontSize, setFontSize] = useState<number>(16);
//   const [isBold, setIsBold] = useState<boolean>(false);
//   const [textColor, setTextColor] = useState<string>('#000000');
//   const [backgroundColor, setBackgroundColor] = useState<string>('#FFFFFF');
//   const [backgroundOpacity, setBackgroundOpacity] = useState<number>(1);
//   const [isPanelOpen, setIsPanelOpen] = useState<boolean>(true);

//   const [sessionStart, setSessionStart] = useState<number | null>(null);
//   const [backspaceCount, setBackspaceCount] = useState<number>(0);

//   // Refs for stable timing across renders
//   const keyDataRef = useRef<KeyData[]>(keyData);
//   const lastKeyPressRef = useRef<number | null>(null);
//   const lastKeyReleaseRef = useRef<number | null>(null);
//   const typingStartedRef = useRef(false);

//   useEffect(() => { keyDataRef.current = keyData; }, [keyData]);

//   // ---------- helpers ----------
//   const normalizeWhitespace = (s: string) => s.replace(/\s+/g, ' ').trim();
//   const tokenizeWords = (s: string) => s.trim().length ? s.trim().split(/\s+/) : [];

//   const levenshteinWithOps = (a: string[], b: string[]) => {
//     const m = a.length, n = b.length;
//     const dp = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
//     for (let i = 0; i <= m; i++) dp[i][0] = i;
//     for (let j = 0; j <= n; j++) dp[0][j] = j;
//     for (let i = 1; i <= m; i++) {
//       for (let j = 1; j <= n; j++) {
//         const cost = a[i - 1] === b[j - 1] ? 0 : 1;
//         dp[i][j] = Math.min(
//           dp[i - 1][j] + 1,
//           dp[i][j - 1] + 1,
//           dp[i - 1][j - 1] + cost
//         );
//       }
//     }
//     const ops: Array<{ op: 'match'|'ins'|'del'|'sub'; a?: string; b?: string; ai: number; bi: number }> = [];
//     let i = m, j = n;
//     while (i > 0 || j > 0) {
//       if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] && a[i - 1] === b[j - 1]) {
//         ops.push({ op: 'match', a: a[i - 1], b: b[j - 1], ai: i - 1, bi: j - 1 });
//         i--; j--;
//       } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
//         ops.push({ op: 'sub', a: a[i - 1], b: b[j - 1], ai: i - 1, bi: j - 1 });
//         i--; j--;
//       } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
//         ops.push({ op: 'del', a: a[i - 1], ai: i - 1, bi: j });
//         i--;
//       } else {
//         ops.push({ op: 'ins', b: b[j - 1], ai: i, bi: j - 1 });
//         j--;
//       }
//     }
//     ops.reverse();
//     const counts = {
//       matches: ops.filter(o => o.op === 'match').length,
//       insertions: ops.filter(o => o.op === 'ins').length,
//       deletions: ops.filter(o => o.op === 'del').length,
//       substitutions: ops.filter(o => o.op === 'sub').length,
//     };
//     return { ops, counts, distance: dp[m][n] };
//   };

//   const mean = (arr: number[]) => arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0;
//   const median = (arr: number[]) => {
//     if (!arr.length) return 0;
//     const s = [...arr].sort((a,b)=>a-b);
//     const m = Math.floor(s.length/2);
//     return s.length % 2 ? s[m] : (s[m-1]+s[m])/2;
//   };
//   const percentile = (arr: number[], p: number) => {
//     if (!arr.length) return 0;
//     const s = [...arr].sort((a,b)=>a-b);
//     const idx = Math.min(s.length-1, Math.max(0, Math.ceil((p/100)*s.length)-1));
//     return s[idx];
//   };

//   // ---------- key listeners (clean) ----------
//   const handleKeyDown = (e: KeyboardEvent) => {
//     const pressTime = Date.now();

//     // Fire once on first visible character
//     if (!typingStartedRef.current && e.key.length === 1) {
//       typingStartedRef.current = true;
//       onTypingStart?.();
//     }

//     if (sessionStart === null) setSessionStart(pressTime);

//     // Count backspace but don't record as char
//     if (e.key === 'Backspace') {
//       setBackspaceCount(c => c + 1);
//       return;
//     }
//     // Only visible single chars
//     if (e.key.length !== 1) return;

//     const lagTime =
//       lastKeyReleaseRef.current !== null ? pressTime - lastKeyReleaseRef.current : 0;
//     const totalLagTime =
//       lastKeyPressRef.current !== null ? pressTime - lastKeyPressRef.current : 0;

//     setKeyData(prev => ([
//       ...prev,
//       { key: e.key, pressTime, releaseTime: null, holdTime: null, lagTime, totalLagTime }
//     ]));

//     lastKeyPressRef.current = pressTime;
//   };

//   const handleKeyUp = (e: KeyboardEvent) => {
//     const releaseTime = Date.now();

//     setKeyData(prev => {
//       let updated = false;
//       return prev.map(k => {
//         if (!updated && k.key === e.key && k.releaseTime === null) {
//           updated = true;
//           return { ...k, releaseTime, holdTime: releaseTime - k.pressTime };
//         }
//         return k;
//       });
//     });

//     lastKeyReleaseRef.current = releaseTime;
//   };

//   // Attach listeners once
//   useEffect(() => {
//     const down = (e: KeyboardEvent) => handleKeyDown(e);
//     const up   = (e: KeyboardEvent) => handleKeyUp(e);
//     document.addEventListener('keydown', down);
//     document.addEventListener('keyup', up);
//     return () => {
//       document.removeEventListener('keydown', down);
//       document.removeEventListener('keyup', up);
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // ---------- submit ----------
//   const handleSubmit = () => {
//     // duration from first press → last release
//     const presses = keyData.filter(k => typeof k.pressTime === 'number');
//     const releases = keyData.filter(k => typeof k.releaseTime === 'number' && k.releaseTime !== null);
//     const firstPress = presses.length ? Math.min(...presses.map(k => k.pressTime)) : (sessionStart ?? Date.now());
//     const lastRelease = releases.length ? Math.max(...releases.map(k => k.releaseTime as number)) : Date.now();
//     const durationMs = Math.max(0, lastRelease - firstPress);
//     const minutes = durationMs / 60000 || 1e-9;

//     // tokens & alignments
//     const typedChars = Array.from(inputValue);
//     const targetChars = Array.from(displayText);
//     const charAln = levenshteinWithOps(typedChars, targetChars);

//     const typedWords = tokenizeWords(inputValue);
//     const targetWords = tokenizeWords(displayText);
//     const wordAln = levenshteinWithOps(typedWords, targetWords);

//     const typedNorm = normalizeWhitespace(inputValue);
//     const targetNorm = normalizeWhitespace(displayText);
//     const charNorm = levenshteinWithOps(Array.from(typedNorm), Array.from(targetNorm));
//     const wordErrsNorm = levenshteinWithOps(tokenizeWords(typedNorm), tokenizeWords(targetNorm)).distance;

//     const confusion: Record<string, number> = {};
//     for (const o of charAln.ops) {
//       if (o.op === 'sub' && o.a && o.b) {
//         const key = `${o.a}->${o.b}`;
//         confusion[key] = (confusion[key] || 0) + 1;
//       }
//     }

//     // speeds
//     const rawWpm5 = (inputValue.length / 5) / minutes;
//     const charWpm = (inputValue.length) / minutes;
//     const wordWpm = (typedWords.length) / minutes;
//     const netWpm5 = Math.max(
//       0,
//       rawWpm5 - (wordAln.counts.substitutions + wordAln.counts.insertions + wordAln.counts.deletions) / minutes
//     );

//     // accuracies
//     const charAcc = Math.max(0, (charAln.counts.matches) / Math.max(targetChars.length, 1));
//     const wordAcc = Math.max(0, (wordAln.counts.matches) / Math.max(targetWords.length, 1));
//     const normAcc = Math.max(
//       0,
//       (Array.from(targetNorm).length - charNorm.distance) / Math.max(Array.from(targetNorm).length, 1)
//     );

//     // timing stats
//     const holds = keyData.map(k => (k.holdTime ?? 0)).filter(v => v > 0);
//     const lags  = keyData.map(k => (k.lagTime ?? 0)).filter(v => v >= 0);

//     const perKey: Record<string, { count: number; meanHoldMs: number; meanLagMs: number }> = {};
//     const holdSum: Record<string, number> = {};
//     const lagSum:  Record<string, number> = {};
//     keyData.forEach(k => {
//       if (!k.key || k.key.length !== 1) return;
//       perKey[k.key] = perKey[k.key] || { count: 0, meanHoldMs: 0, meanLagMs: 0 };
//       perKey[k.key].count += 1;
//       holdSum[k.key] = (holdSum[k.key] || 0) + (k.holdTime ?? 0);
//       lagSum[k.key]  = (lagSum[k.key]  || 0) + (k.lagTime ?? 0);
//     });
//     Object.keys(perKey).forEach(ch => {
//       perKey[ch].meanHoldMs = perKey[ch].count ? holdSum[ch] / perKey[ch].count : 0;
//       perKey[ch].meanLagMs  = perKey[ch].count ? lagSum[ch]  / perKey[ch].count : 0;
//     });

//     const payload: KeystrokeSavePayload = {
//       typedText: inputValue,
//       targetText: displayText,
//       keyData,
//       analysis: {
//         char: { ops: charAln.ops, counts: charAln.counts },
//         word: { ops: wordAln.ops, counts: wordAln.counts },
//         normalized: {
//           typed: typedNorm,
//           target: targetNorm,
//           charDistance: charNorm.distance,
//           wordErrors: wordErrsNorm,
//         },
//         confusionPairs: confusion,
//       },
//       metrics: {
//         startMs: firstPress,
//         endMs: lastRelease,
//         durationMs,
//         totalKeys: keyData.length,
//         backspaceCount,
//         rawWpm5,
//         charWpm,
//         wordWpm,
//         netWpm5,
//         charAccuracy: charAcc,
//         wordAccuracy: wordAcc,
//         normalizedCharAccuracy: normAcc,
//         holdMs: { mean: mean(holds), median: median(holds), p95: percentile(holds, 95) },
//         interKeyMs:{ mean: mean(lags),  median: median(lags),  p95: percentile(lags, 95) },
//         perKey,
//       },
//     };

//     saveKeystrokeData(payload);
//   };

//   return (
//     <div className="relative w-full">
//       <div className="flex flex-row justify-between items-start w-full space-x-4">
//         <div className="flex-1 text-xs">
//           <textarea
//             value={inputValue}
//             placeholder={placeholder}
//             onChange={(e)=>setInputValue(e.target.value)}
//             style={{
//               width: '100%',
//               height: '300px',
//               fontFamily: font,
//               fontSize: `${fontSize}px`,
//               fontWeight: isBold ? 'bold' : 'normal',
//               color: textColor,
//               backgroundColor: `rgba(${parseInt(backgroundColor.slice(1, 3), 16)}, ${parseInt(
//                 backgroundColor.slice(3, 5), 16
//               )}, ${parseInt(backgroundColor.slice(5, 7), 16)}, ${backgroundOpacity})`,
//               border: '1px solid #ccc',
//               outline: 'none',
//               padding: '10px',
//               borderRadius: '4px',
//               resize: 'vertical',
//               overflowY: 'scroll',
//             }}
//           />
//         </div>
//       </div>

//       <button
//         onClick={() => setIsPanelOpen(!isPanelOpen)}
//         className="mt-3 text-xs bg-gray-100 p-2 border rounded"
//       >
//         {isPanelOpen ? 'Hide Text Controls' : 'Show Text Controls'}
//       </button>

//       <Collapse isOpened={isPanelOpen}>
//         <div className="mt-2 grid grid-cols-2 gap-3 max-w-sm text-xs bg-white/70 p-3 border rounded shadow">
//           <div>
//             <label className="block mb-1">Font</label>
//             <select value={font} onChange={(e) => setFont(e.target.value)} className="border p-2 rounded w-full">
//               <option value="Arial">Arial</option>
//               <option value="Verdana">Verdana</option>
//               <option value="Times New Roman">Times New Roman</option>
//               <option value="Courier New">Courier New</option>
//               <option value="Georgia">Georgia</option>
//             </select>
//           </div>

//           <div>
//             <label className="block mb-1">Font Size</label>
//             <select value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="border p-2 rounded w-full">
//               {[...Array(31)].map((_, i) => (
//                 <option key={i} value={10 + i}>
//                   {10 + i}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <label className="flex items-center gap-2">
//             <span>Bold</span>
//             <input type="checkbox" checked={isBold} onChange={(e) => setIsBold(e.target.checked)} />
//           </label>

//           <div>
//             <label className="block mb-1">Text Color</label>
//             <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-full h-8" />
//           </div>

//           <div>
//             <label className="block mb-1">Background Color</label>
//             <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="w-full h-8" />
//           </div>

//           <div>
//             <label className="block mb-1">Background Opacity</label>
//             <input
//               type="range"
//               min="0"
//               max="1"
//               step="0.01"
//               value={backgroundOpacity}
//               onChange={(e) => setBackgroundOpacity(parseFloat(e.target.value))}
//               className="w-full"
//             />
//           </div>
//         </div>
//       </Collapse>

//       <div className="mt-3">
//         <button onClick={handleSubmit} style={buttonStyle}>Submit</button>
//         <button
//           onClick={() => {
//             setInputValue('');
//             setKeyData([]);
//             setBackspaceCount(0);
//             setSessionStart(null);
//             typingStartedRef.current = false;
//             lastKeyPressRef.current = null;
//             lastKeyReleaseRef.current = null;
//           }}
//           style={{ ...buttonStyle, marginLeft: '0.5rem' }}
//         >
//           Reset
//         </button>
//       </div>
//     </div>
//   );
// };

// export default TextInput;



// src/components/Therapy/TextInput.tsx
// last working file 

// import React, { useState, useEffect, useRef } from 'react';
// import { Collapse } from 'react-collapse';
// import buttonStyle from './buttonStyle';
//  import TextDisplay from './TextDisplay';

// interface KeyData {
//   key: string;
//   pressTime: number;
//   releaseTime: number | null;
//   holdTime: number | null;
//   lagTime: number;
//   totalLagTime: number;
// }

// interface TextInputProps {
//   placeholder: string;
//   displayText: string;
//   setDisplayText: React.Dispatch<React.SetStateAction<string>>;   
//   saveKeystrokeData: (data: { keyData: KeyData[]; errors: number }) => void;
// }

// const TextInput: React.FC<TextInputProps> = ({ placeholder, displayText, setDisplayText, saveKeystrokeData }) => {
//   const [inputValue, setInputValue] = useState<string>('');
//   const [keyData, setKeyData] = useState<KeyData[]>([]);
//   const [font, setFont] = useState<string>('Arial');
//   const [fontSize, setFontSize] = useState<number>(16);
//   const [isBold, setIsBold] = useState<boolean>(false);
//   const [textColor, setTextColor] = useState<string>('#000000');
//   const [backgroundColor, setBackgroundColor] = useState<string>('#FFFFFF');
//   const [backgroundOpacity, setBackgroundOpacity] = useState<number>(1);
//   const [isPanelOpen, setIsPanelOpen] = useState<boolean>(true);

//   const keyDataRef = useRef<KeyData[]>(keyData);
//   let lastKeyPressTime: number | null = null;
//   let lastKeyReleaseTime: number | null = null;

//   useEffect(() => {
//     keyDataRef.current = keyData;
//   }, [keyData]);

//   const handleKeyDown = (e: KeyboardEvent) => {
//     const pressTime = Date.now();

//     if (!e.key.match(/^.$/)) return;

//     const lagTime = lastKeyReleaseTime !== null ? pressTime - lastKeyReleaseTime : 0;
//     const totalLagTime = lastKeyPressTime !== null ? pressTime - lastKeyPressTime : 0;

//     setKeyData((prevKeyData) => [
//       ...prevKeyData,
//       {
//         key: e.key,
//         pressTime: pressTime,
//         releaseTime: null,
//         holdTime: null,
//         lagTime: lagTime,
//         totalLagTime: totalLagTime,
//       },
//     ]);

//     lastKeyPressTime = pressTime;
//   };

//   const handleKeyUp = (e: KeyboardEvent) => {
//     const releaseTime = Date.now();

//     const updatedKeyData = keyDataRef.current.map((k) =>
//       k.key === e.key && k.releaseTime === null
//         ? { ...k, releaseTime: releaseTime, holdTime: releaseTime - k.pressTime }
//         : k
//     );

//     setKeyData(updatedKeyData);
//     lastKeyReleaseTime = releaseTime;
//   };

//   const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//     setInputValue(e.target.value);
//   };

//   const handleSubmit = () => {
//     const errors = calculateErrors(inputValue, displayText);
//     const dataToSave = { keyData, errors };
//     saveKeystrokeData(dataToSave);
//   };

//   const calculateErrors = (typedText: string, originalText: string): number => {
//     const typedWords = typedText.split(' ');
//     const originalWords = originalText.split(' ');
//     let errors = 0;

//     typedWords.forEach((word, index) => {
//       if (word !== originalWords[index]) {
//         errors++;
//       }
//     });

//     return errors;
//   };

//   useEffect(() => {
//     document.addEventListener('keydown', handleKeyDown);
//     document.addEventListener('keyup', handleKeyUp);

//     return () => {
//       document.removeEventListener('keydown', handleKeyDown);
//       document.removeEventListener('keyup', handleKeyUp);
//     };
//   }, []);

//   return (
//     <div className="relative w-3/4 m-30  ">
//       <div className=" flex flex-row justify-between items-start w-full space-x-4 ">
//   {/* Left: Text Input */}
//   <div className=" flex-1 text-xs">
//     <textarea
//       value={inputValue}
//       placeholder={placeholder}
//       onChange={handleInputChange}
//       style={{
//         width: '100%',
//         height: '300px',
//         fontFamily: font,
//         fontSize: `${fontSize}px`,
//         fontWeight: isBold ? 'bold' : 'normal',
//         color: textColor,
//         backgroundColor: `rgba(${parseInt(backgroundColor.slice(1, 3), 16)}, ${parseInt(backgroundColor.slice(3, 5), 16)}, ${parseInt(backgroundColor.slice(5, 7), 16)}, ${backgroundOpacity})`,
//         border: '1px solid #ccc',
//         outline: 'none',
//         padding: '10px',
//         borderRadius: '4px',
//         resize: 'vertical',
//         overflowY: 'scroll',
//       }}
//     />
//   </div>

//   {/* Right: Control Panel */}
 
// </div>

//       <button onClick={() => setIsPanelOpen(!isPanelOpen)} className="flex mb-200 text-xs  bg-gray-100 p-2 border rounded w-1/4 ">
//         {isPanelOpen ? ' Hide Text Control' : 'Show Text Controls'}
//       </button>
//       <Collapse isOpened={isPanelOpen}>
//         <div className="flex flex-wrap  text-xs bg-gray-200 p-200 border rounded w-1/4">
//           <div className="w-full md:w-1/4">
//             <label>Font:</label>
//             <select value={font} onChange={(e) => setFont(e.target.value)} className="border p-2 rounded w-full">
//               <option value="Arial">Arial</option>
//               <option value="Verdana">Verdana</option>
//               <option value="Times New Roman">Times New Roman</option>
//               <option value="Courier New">Courier New</option>
//               <option value="Georgia">Georgia</option>
//             </select>
//           </div>
//           <div className="w-full md:w-1/4 text -xs">
//             <label>Font Size:</label>
//             <select value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="border p-2 rounded w-full">
//               {[...Array(31)].map((_, i) => (
//                 <option key={i} value={10 + i}>
//                   {10 + i}
//                 </option>
//               ))}
//             </select>
//           </div>
//           <div className="w-half md:w-1/4 flex items-center space-x-2">
//             <label>Bold:</label>
//             <input type="checkbox" checked={isBold} onChange={(e) => setIsBold(e.target.checked)} className="border p-2 rounded" />
//           </div>
//           <div className="w-full md:w-1/4">
//             <label>Text Color:</label>
//             <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-full" />
//           </div>
//           <div className="w-full md:w-1/4">
//             <label>Background Color:</label>
//             <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="w-full" />
//           </div>
//           <div className="w-full md:w-1/4">
//             <label>Background Opacity:</label>
//             <input
//               type="range"
//               min="0"
//               max="1"
//               step="0.01"
//               value={backgroundOpacity}
//               onChange={(e) => setBackgroundOpacity(parseFloat(e.target.value))}
//               className="border p-2 rounded w-full"
//             />
//           </div>
//         </div>
//       </Collapse>
//       <div className="bg-gray-200 p-200 border rounded w-1/4">
//         <button onClick={handleSubmit} style={buttonStyle}>
//           Submit
//         </button>
//         <button onClick={() => setInputValue('')} style={buttonStyle}>
//           Reset
//         </button>
//       </div>
//      {/*  <div className="absolute center-1920 right-22 w-1/3 z-7 p-4">
//         <TextDisplay displayText={displayText} setDisplayText={setDisplayText} />
//       </div> */}
//     </div>
//   );
// };

// export default TextInput;

//+++++++++++JS version+++++++++++++++++
// src\components\Therapy\TextInput.jsx   
  // JS version

/* import React, { useState, useEffect, useRef } from 'react';
import { Collapse } from 'react-collapse';
import buttonStyle from './buttonStyle';

const TextInput = ({ placeholder, displayText, saveKeystrokeData }) => {
  const [inputValue, setInputValue] = useState('');
  const [keyData, setKeyData] = useState([]);
  const [font, setFont] = useState('Arial');
  const [fontSize, setFontSize] = useState(16);
  const [isBold, setIsBold] = useState(false);
  const [textColor, setTextColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [backgroundOpacity, setBackgroundOpacity] = useState(1);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const keyDataRef = useRef(keyData);
  let lastKeyPressTime = null;
  let lastKeyReleaseTime = null;

  useEffect(() => {
    keyDataRef.current = keyData;
  }, [keyData]);

  const handleKeyDown = (e) => {
    const pressTime = Date.now();

    if (!e.key.match(/^.$/)) return;

    const lagTime = lastKeyReleaseTime !== null ? pressTime - lastKeyReleaseTime : 0;
    const totalLagTime = lastKeyPressTime !== null ? pressTime - lastKeyPressTime : 0;

    setKeyData((keyData) => [
      ...keyData, 
      {
        key: e.key,
        pressTime: pressTime,
        releaseTime: null,
        holdTime: null,
        lagTime: lagTime,
        totalLagTime: totalLagTime
      }
    ]);

    lastKeyPressTime = pressTime;
  };

  const handleKeyUp = (e) => {
    const releaseTime = Date.now();
    const updatedKeyData = keyDataRef.current.map((k) => 
      k.key === e.key && k.releaseTime === null
        ? { ...k, releaseTime: releaseTime, holdTime: releaseTime - k.pressTime }
        : k
    );
    setKeyData(updatedKeyData);
    lastKeyReleaseTime = releaseTime;
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = () => {
    const errors = calculateErrors(inputValue, displayText);
    const dataToSave = { keyData, errors };
    saveKeystrokeData(dataToSave);
  };

  const calculateErrors = (typedText, originalText) => {
    const typedWords = typedText.split(' ');
    const originalWords = originalText.split(' ');
    let errors = 0;

    typedWords.forEach((word, index) => {
      if (word !== originalWords[index]) {
        errors++;
      }
    });

    return errors;
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className="relative w-100% p-4">
 <div className="w-full mb-4">
        <textarea 
          value={inputValue}
          placeholder={placeholder}
          onChange={handleInputChange}
          style={{
            width: '100%',
            height: '300px',
            fontFamily: font,
            fontSize: `${fontSize}px`,
            fontWeight: isBold ? 'bold' : 'normal',
            color: textColor,
            backgroundColor: `rgba(${parseInt(backgroundColor.slice(1, 3), 16)}, ${parseInt(backgroundColor.slice(3, 5), 16)}, ${parseInt(backgroundColor.slice(5, 7), 16)}, ${backgroundOpacity})`,
            border: '1px solid #ccc',
            outline: 'none',
            padding: '10px',
            borderRadius: '4px',
            resize: 'vertical',
            overflowY: 'scroll',
          }}
        />
      </div>

      <button onClick={() => setIsPanelOpen(!isPanelOpen)} className=" flex  mb-200 bg-red-200 p-2 border rounded w-1/3">
        {isPanelOpen ? ' Hide Text Control' : 'Show Text Controls'}
      </button>
      <Collapse isOpened={isPanelOpen}>
        <div className="flex flex-wrap  mb-200 bg-red-200 p-200 border rounded w-1/3">
          <div className="w-full md:w-1/3">
            <label>Font:</label>
            <select value={font} onChange={(e) => setFont(e.target.value)} className="border p-2 rounded w-full">
              <option value="Arial">Arial</option>
              <option value="Verdana">Verdana</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
              <option value="Georgia">Georgia</option>
            </select>
          </div>
          <div className="w-full md:w-1/3">
            <label>Font Size:</label>
            <select value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="border p-2 rounded w-full">
              {[...Array(31)].map((_, i) => (
                <option key={i} value={10 + i}>{10 + i}</option>
              ))}
            </select>
          </div>
          <div className="w-half md:w-1/3 flex items-center space-x-2">
            <label>Bold:</label>
            <input type="checkbox" checked={isBold} onChange={(e) => setIsBold(e.target.checked)} className="border p-2 rounded" />
          </div>
          <div className="w-full md:w-1/3">
            <label>Text Color:</label>
            <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="  w-full" />
          </div>
          <div className="w-full md:w-1/3">
            <label>Background Color:</label>
            <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="  w-full" />
          </div>
          <div className="w-full md:w-1/3">
            <label>Background Opacity:</label>
            <input type="range" min="0" max="1" step="0.01" value={backgroundOpacity} onChange={(e) => setBackgroundOpacity(e.target.value)} className="border p-2 rounded w-full" />
          </div>
        </div>
      </Collapse>
      <div className=" bg-red-200 p-200 border rounded w-1/3"> 
     
        <button onClick={handleSubmit} style={buttonStyle}>
          Submit
        </button>
        <button onClick={() => setInputValue('')} style={buttonStyle}>
          Reset
        </button>
      </div>
    </div>
  );
};

export default TextInput; */

//---------------------------------------------------

 //a version with control panel
/* import React, { useState, useEffect, useRef } from 'react';
import buttonStyle from './buttonStyle';
import TextInputControlPanel from './TextInputControlPanel';

const TextInput = ({ placeholder, displayText, saveKeystrokeData }) => {
  const [inputValue, setInputValue] = useState('');
  const [keyData, setKeyData] = useState([]);
  const [font, setFont] = useState('Arial');
  const [fontSize, setFontSize] = useState('16px');
  const [isBold, setIsBold] = useState(false);
  const [textColor, setTextColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [backgroundOpacity, setBackgroundOpacity] = useState(1);
  const keyDataRef = useRef(keyData);
  let lastKeyPressTime = null;
  let lastKeyReleaseTime = null;

  useEffect(() => {
    keyDataRef.current = keyData;
  }, [keyData]);

  const handleKeyDown = (e) => {
    const pressTime = Date.now();

    if (!e.key.match(/^.$/)) return;

    const lagTime = lastKeyReleaseTime !== null ? pressTime - lastKeyReleaseTime : 0;
    const totalLagTime = lastKeyPressTime !== null ? pressTime - lastKeyPressTime : 0;

    setKeyData((keyData) => [
      ...keyData, 
      {
        key: e.key,
        pressTime: pressTime,
        releaseTime: null,
        holdTime: null,
        lagTime: lagTime,
        totalLagTime: totalLagTime
      }
    ]);

    lastKeyPressTime = pressTime;
  };

  const handleKeyUp = (e) => {
    const releaseTime = Date.now();
    const updatedKeyData = keyDataRef.current.map((k) => 
      k.key === e.key && k.releaseTime === null
        ? { ...k, releaseTime: releaseTime, holdTime: releaseTime - k.pressTime }
        : k
    );
    setKeyData(updatedKeyData);
    lastKeyReleaseTime = releaseTime;
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = () => {
    const errors = calculateErrors(inputValue, displayText);
    const dataToSave = { keyData, errors };
    saveKeystrokeData(dataToSave);
  };

  const calculateErrors = (typedText, originalText) => {
    const typedWords = typedText.split(' ');
    const originalWords = originalText.split(' ');
    let errors = 0;

    typedWords.forEach((word, index) => {
      if (word !== originalWords[index]) {
        errors++;
      }
    });

    return errors;
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className="w-full flex flex-row items-center">
      <div className="flex-1">
        <textarea 
          value={inputValue}
          placeholder={placeholder}
          onChange={handleInputChange}
          style={{
            width: '100%',
            height: '200px',
            fontFamily: font,
            fontSize: fontSize,
            fontWeight: isBold ? 'bold' : 'normal',
            color: textColor,
            backgroundColor: `${backgroundColor}${Math.floor(backgroundOpacity * 255).toString(16).padStart(2, '0')}`,
            border: 'none',
            outline: 'none',
            padding: '10px',
            borderRadius: '4px',
            resize: 'none',
            overflowY: 'scroll',
          }}
        />
      </div>
      <div className="ml-4">
        <TextInputControlPanel
          font={font} setFont={setFont}
          fontSize={fontSize} setFontSize={setFontSize}
          isBold={isBold} setIsBold={setIsBold}
          textColor={textColor} setTextColor={setTextColor}
          backgroundColor={backgroundColor} setBackgroundColor={setBackgroundColor}
          backgroundOpacity={backgroundOpacity} setBackgroundOpacity={setBackgroundOpacity}
        />
      </div>
      <div className="flex flex-col space-y-2 mt-4">
        <button onClick={handleSubmit} style={buttonStyle}>
          Submit
        </button>
        <button onClick={() => setInputValue('')} style={buttonStyle}>
          Reset
        </button>
      </div>
    </div>
  );
};

export default TextInput; */





/* // src/Components/Therapy/TextInput.jsx
import React, { useState, useEffect, useRef } from 'react';
import buttonStyle from './buttonStyle';

const TextInput = ({ placeholder, setInputValue }) => {
  const [inputValue, setInput] = useState('');
  const [keyData, setKeyData] = useState([]);
  const keyDataRef = useRef(keyData);
  let lastKeyPressTime = null;
  let lastKeyReleaseTime = null;

  useEffect(() => {
    keyDataRef.current = keyData; 
  }, [keyData]);

  const handleKeyDown = (e) => {
    const pressTime = Date.now();

    if (!e.key.match(/^.$/)) return;

    const lagTime = lastKeyReleaseTime !== null ? pressTime - lastKeyReleaseTime : 0;
    const totalLagTime = lastKeyPressTime !== null ? pressTime - lastKeyPressTime : 0;

    setKeyData(keyData => [
      ...keyData, 
      {
        key: e.key,
        pressTime: pressTime,
        releaseTime: null,
        holdTime: null,
        lagTime: lagTime,
        totalLagTime: totalLagTime
      }
    ]);

    lastKeyPressTime = pressTime;
  };

  const handleKeyUp = (e) => {
    const releaseTime = Date.now();
    const updatedKeyData = keyDataRef.current.map(k => 
      k.key === e.key && k.releaseTime === null
        ? { ...k, releaseTime: releaseTime, holdTime: releaseTime - k.pressTime }
        : k
    );
    setKeyData(updatedKeyData);
    lastKeyReleaseTime = releaseTime;
  };

  const downloadCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Key,Press Time,Release Time,Hold Time,Lag Time,Total Lag Time\n";

    keyData.forEach(({ key, pressTime, releaseTime, holdTime, lagTime, totalLagTime }) => {
      csvContent += `${key},${new Date(pressTime).toISOString()},${releaseTime ? new Date(releaseTime).toISOString() : "N/A"},${holdTime || "N/A"},${lagTime},${totalLagTime}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "typing_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className="absolute top-3/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center w-4/5 max-w-800px">
      <input 
        type="text"
        value={inputValue}
        placeholder={placeholder}
        onChange={handleInputChange}
        className="flex-1 h-8 bg-opacity-50 bg-white border-none outline-none p-2 text-base rounded-l"
      />
      <button onClick={downloadCSV} style={buttonStyle}>
        Submit
      </button>
      <button onClick={() => setKeyData([])} style={buttonStyle}>
        Reset
      </button>
    </div>
  );
};

export default TextInput;
 */