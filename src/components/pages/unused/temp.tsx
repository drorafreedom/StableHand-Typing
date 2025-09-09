// src/components/Therapy/TextDisplay.tsx
import { useState, useEffect } from 'react';
import {
  CATEGORY_OPTIONS,
  pickRandom,
  makeCustomMeta,
  type TextCategory,
  type NonCustom,
  type TextMeta,
} from '../../data/text';

type Props = {
  displayText: string;
  setDisplayText: (t: string) => void;        // parent setter
  onTextChosen?: (m: TextMeta) => void;        // parent setter
  autoFillOnMount?: boolean;                   // optional
};

export default function TextDisplay({
  displayText,
  setDisplayText,
  onTextChosen,
  autoFillOnMount = true,
}: Props) {
  const [category, setCategory] = useState<TextCategory>('classic');
  const [customDraft, setCustomDraft] = useState('');

 
// ✅ If you want a passage loaded automatically, do it AFTER render
  useEffect(() => {
    if (!autoFillOnMount) return;
    if (displayText) return;                 // don’t overwrite existing text
    if (category === 'custom') return;

    const { text, meta } = pickRandom(category as NonCustom);
    setDisplayText(text);
    onTextChosen?.(meta);
    // Runs after the first paint, NOT during render
  }, [autoFillOnMount, category, displayText, setDisplayText, onTextChosen]);

  // ✅ Only update parent in handlers (never directly in the render body)
  const onNew = () => {
    if (category === 'custom') return;
    const { text, meta } = pickRandom(category as NonCustom);
    setDisplayText(text);
    onTextChosen?.(meta);
  };

  const useCustom = () => {
    setDisplayText(customDraft);
    onTextChosen?.(makeCustomMeta(null));
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-center">
        <select
          className="border rounded px-2 py-1 text-sm"
          value={category}
          onChange={(e) => setCategory(e.target.value as TextCategory)}
        >
          {CATEGORY_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <button
          type="button"
          onClick={onNew}
          disabled={category === 'custom'}
          className={`px-3 py-1.5 rounded text-sm ${category === 'custom'
            ? 'bg-gray-200 text-gray-500'
            : 'bg-blue-600 text-white'}`}
        >
          New
        </button>
      </div>

      <div className="text-gray-800 whitespace-pre-wrap">
        {displayText || 'Choose a source and press “New”, or paste your own text below.'}
      </div>

      {category === 'custom' && (
        <div className="mt-2">
          <textarea
            value={customDraft}
            onChange={(e) => setCustomDraft(e.target.value)}
            rows={4}
            className="w-full border rounded p-2 text-sm"
            placeholder="Paste or type your paragraph here…"
          />
          <div className="mt-2">
            <button
              type="button"
              onClick={useCustom}
              disabled={!customDraft.trim()}
              className={`px-3 py-1.5 rounded text-sm ${customDraft.trim()
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-200 text-gray-500'}`}
            >
              Use this text
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
