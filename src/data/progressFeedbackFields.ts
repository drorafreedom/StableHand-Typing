// src/data/progressFeedbackFields.ts
// Mirrors the structure of medicalInterviewFields so the page can be data-driven
// and validations can be attached per field.

import {
  validateRequired,
  validateEmail,
} from '../utils/validation';

export type FieldType = 'input' | 'select' | 'textareascroll' | 'multiSelect' | 'autosizeinput' | 'selectWithOther' | 'multiSelectWithOther';

export interface ProgressField {
  name: string;
  label: string;
  type: FieldType;
  inputType?: string; // only for type === 'input'
  options?: string[]; // for select/multiSelect
  placeholder?: string;
  validate?: ((value: any, allValues: Record<string, any>) => string[])[];
}

export const progressFeedbackFields: ProgressField[] = [
  // ─────────────────────────────
  // Identity & session
  // ─────────────────────────────
  { name: 'testerId', label: 'Tester ID', type: 'input', inputType: 'text', placeholder: 'caltech-alias or initials', validate: [validateRequired] },
  { name: 'email', label: 'Email (optional)', type: 'input', inputType: 'email', validate: [] },
  { name: 'sessionLabel', label: 'Session Label', type: 'input', inputType: 'text', placeholder: 'e.g., debug run #1' },
  { name: 'consent', label: 'Consent to store anonymized data', type: 'select', options: ['Yes', 'No'], validate: [validateRequired] },

  // ─────────────────────────────
  // Quick Ratings (1–5)
  // ─────────────────────────────
  { name: 'uiClarity', label: 'UI clarity', type: 'select', options: ['1','2','3','4','5'], validate: [validateRequired] },
  { name: 'performanceSmoothness', label: 'Performance smoothness', type: 'select', options: ['1','2','3','4','5'], validate: [validateRequired] },
  { name: 'difficultyCalibration', label: 'Difficulty calibration', type: 'select', options: ['1','2','3','4','5'], validate: [validateRequired] },
  { name: 'overall', label: 'Overall', type: 'select', options: ['1','2','3','4','5'], validate: [validateRequired] },

  // ─────────────────────────────
  // Environment
  // ─────────────────────────────
  { name: 'deviceType', label: 'Device type', type: 'select', options: ['Laptop','Desktop','Tablet','Phone'], validate: [validateRequired] },
  { name: 'os', label: 'OS', type: 'input', inputType: 'text', validate: [validateRequired] },
  { name: 'browser', label: 'Browser', type: 'input', inputType: 'text', validate: [validateRequired] },
  { name: 'screen', label: 'Screen', type: 'input', inputType: 'text', placeholder: 'e.g., 2560x1440 @ 2x', validate: [validateRequired] },
  { name: 'connection', label: 'Connection', type: 'select', options: ['Wi‑Fi','Ethernet','Cellular'] },
  { name: 'inputMethod', label: 'Input method', type: 'select', options: ['Built‑in laptop keyboard','External USB keyboard','Bluetooth keyboard','On‑screen keyboard'] },
  { name: 'keyboardLayout', label: 'Keyboard layout', type: 'select', options: ['US QWERTY','UK','DVORAK','COLEMAK','Other'] },
  { name: 'distanceFromScreenCm', label: 'Distance from screen (cm)', type: 'input', inputType: 'number', placeholder: 'e.g., 60' },
  { name: 'posture', label: 'Posture / seating', type: 'select', options: ['Desk chair','Standing desk','Couch/bed','Other'] },

  // ─────────────────────────────
  // Therapy Page — Configuration observed
  // (mirror therapy controls so testers can report what they used)
  // ─────────────────────────────
  { name: 'therapyMode', label: 'Therapy mode', type: 'select', options: ['Baseline','Stabilization'] },
  { name: 'movingBackground', label: 'Moving background', type: 'select', options: ['On','Off'], validate: [validateRequired] },
  { name: 'backgroundPattern', label: 'Background pattern', type: 'select', options: ['Stripes','Dots','Grid','Image/Video','Solid color','Other'] },
  { name: 'backgroundDirection', label: 'Background direction', type: 'select', options: ['Left ↔ Right','Up ↕ Down','Diagonal','None/Static'] },
  { name: 'backgroundSpeed', label: 'Background speed', type: 'select', options: ['Very slow','Slow','Medium','Fast','Very fast'] },
  { name: 'fontSizePx', label: 'Font size (px)', type: 'input', inputType: 'number', placeholder: 'e.g., 20' },
  { name: 'contrastLevel', label: 'Contrast level', type: 'select', options: ['Low','Medium','High'] },
  { name: 'theme', label: 'Color theme', type: 'select', options: ['Light','Dark','High contrast'] },
  { name: 'tremorMode', label: 'Tremor mode', type: 'select', options: ['Stabilization','Baseline','N/A'], validate: [validateRequired] },
  { name: 'stabilizationStrength', label: 'Stabilization strength (0–100)', type: 'input', inputType: 'number', placeholder: 'e.g., 60' },
  { name: 'smoothingWindowMs', label: 'Smoothing window (ms)', type: 'input', inputType: 'number', placeholder: 'e.g., 150' },
  { name: 'estimatedLatencyMs', label: 'Estimated latency (ms)', type: 'input', inputType: 'number', placeholder: 'e.g., 25' },

  // ─────────────────────────────
  // Task context
  // ─────────────────────────────
  { name: 'typingTask', label: 'Typing task', type: 'select', options: ['Copy provided text','Free typing','Random words','Numbers/symbols'] },
  { name: 'textDifficulty', label: 'Text difficulty', type: 'select', options: ['Simple','Intermediate','Complex'] },
  { name: 'sessionDurationMin', label: 'Session duration (min)', type: 'input', inputType: 'number', placeholder: 'e.g., 10' },

  // ─────────────────────────────
  // Outcomes (self‑report scales)
  // ─────────────────────────────
  { name: 'tremorBefore', label: 'Tremor severity BEFORE (0–10)', type: 'select', options: ['0','1','2','3','4','5','6','7','8','9','10'] },
  { name: 'tremorAfter', label: 'Tremor severity AFTER (0–10)', type: 'select', options: ['0','1','2','3','4','5','6','7','8','9','10'] },
  { name: 'fatigueLevel', label: 'Fatigue (0–10)', type: 'select', options: ['0','1','2','3','4','5','6','7','8','9','10'] },
  { name: 'painLevel', label: 'Pain/discomfort (0–10)', type: 'select', options: ['0','1','2','3','4','5','6','7','8','9','10'] },
  { name: 'nauseaLevel', label: 'Motion sickness / nausea (0–10)', type: 'select', options: ['0','1','2','3','4','5','6','7','8','9','10'] },
  { name: 'visionStrain', label: 'Eye strain (0–10)', type: 'select', options: ['0','1','2','3','4','5','6','7','8','9','10'] },

  // ─────────────────────────────
  // Specific usability + debugging prompts
  // ─────────────────────────────
  { name: 'biggestPainPoint', label: 'Biggest pain point', type: 'textareascroll', placeholder: 'What slowed you down the most?' },
  { name: 'mostHelpfulSetting', label: 'Most helpful therapy setting', type: 'textareascroll' },
  { name: 'unexpectedBehavior', label: 'Any unexpected behaviors or glitches?', type: 'textareascroll' },
  { name: 'reproSteps', label: 'If a bug occurred, how can we reproduce it?', type: 'textareascroll' },
  { name: 'improvementIdeas', label: 'Top improvement ideas', type: 'textareascroll' },

  // ─────────────────────────────
  // Wrap‑up
  // ─────────────────────────────
  { name: 'wouldRecommend', label: 'Would you recommend others test this build?', type: 'select', options: ['Yes','Maybe','No'] },
  { name: 'followUpOk', label: 'OK to follow up via email?', type: 'select', options: ['Yes','No'] },
];
