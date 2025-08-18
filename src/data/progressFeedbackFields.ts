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
  // Identity & session
  {
    name: 'testerId',
    label: 'Tester ID',
    type: 'input',
    inputType: 'text',
    placeholder: 'caltech-alias or initials',
    validate: [validateRequired],
  },
  { name: 'email', label: 'Email (optional)', type: 'input', inputType: 'email', validate: [ ] },
  { name: 'sessionLabel', label: 'Session Label', type: 'input', inputType: 'text' },

  // Ratings (1-5)
  { name: 'uiClarity', label: 'UI clarity', type: 'select', options: ['1', '2', '3', '4', '5'], validate: [validateRequired] },
  { name: 'performanceSmoothness', label: 'Performance smoothness', type: 'select', options: ['1', '2', '3', '4', '5'], validate: [validateRequired] },
  { name: 'difficultyCalibration', label: 'Difficulty calibration', type: 'select', options: ['1', '2', '3', '4', '5'], validate: [validateRequired] },
  { name: 'overall', label: 'Overall', type: 'select', options: ['1', '2', '3', '4', '5'], validate: [validateRequired] },

  // Environment
  { name: 'deviceType', label: 'Device type', type: 'select', options: ['Laptop', 'Desktop', 'Tablet', 'Phone'], validate: [validateRequired] },
  { name: 'os', label: 'OS', type: 'input', inputType: 'text', validate: [validateRequired] },
  { name: 'browser', label: 'Browser', type: 'input', inputType: 'text', validate: [validateRequired] },
  { name: 'screen', label: 'Screen', type: 'input', inputType: 'text', placeholder: 'e.g., 2560x1440 @ 2x', validate: [validateRequired] },
  { name: 'connection', label: 'Connection', type: 'select', options: ['Wi‑Fi', 'Ethernet', 'Cellular'] },

  // Experiment context
  { name: 'typingTestVariant', label: 'Typing test variant', type: 'input', inputType: 'text' },
  { name: 'movingBackground', label: 'Moving background', type: 'select', options: ['On', 'Off'], validate: [validateRequired] },
  { name: 'tremorMode', label: 'Tremor mode', type: 'select', options: ['Stabilization', 'Baseline', 'N/A'], validate: [validateRequired] },

  // Free text
  { name: 'topPainPoints', label: 'Top pain points', type: 'textareascroll' },
  { name: 'suggestions', label: 'Suggestions', type: 'textareascroll' },
];
