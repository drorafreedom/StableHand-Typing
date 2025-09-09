// src/components/Therapy/TextInput.tsx
import { /* ... */ } from 'firebase/firestore';
import type { TextMeta } from '../../data/text';   // ⬅ add this

interface TextInputProps {
  placeholder: string;
  displayText: string;
  setDisplayText: React.Dispatch<React.SetStateAction<string>>;
  saveKeystrokeData: (payload: KeystrokeSavePayload) => void;
  onTypingStart?: () => void;
  textMeta?: TextMeta;   // ⬅ add this
}

// also extend your payload type (where it's defined in this file)
export interface KeystrokeSavePayload {
  // ... your existing fields ...
  textMeta?: TextMeta;   // ⬅ add this (optional)
}

// then inside handleSubmit(), just attach it:
const payload: KeystrokeSavePayload = {
  // ...everything you already set...
  textMeta,  // ⬅ add this line
};

saveKeystrokeData(payload);
