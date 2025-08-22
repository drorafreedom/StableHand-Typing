// src/data/therapyFeedbackSections.ts
// Bank of therapy-focused questions organized in sections.
// Mirrors the style of medicalInterviewFields (same Field type union),
// but grouped into sections for clearer UX on the feedback page.

import { validateRequired, validateDOB, validatePositiveNumber } from '../utils/validation';

export type FieldType =
  | 'input'
  | 'select'
  | 'multiSelect'
  | 'textareascroll'
  | 'selectWithOther'
  | 'multiSelectWithOther';

export interface Field {
  label: string;
  name: string;
  type: FieldType;
  inputType?: string; // for type === 'input'
  placeholder?: string;
  options?: string[]; // for select/multiSelect
  validate?: ((value: any) => boolean | string)[]; // validation fns returning true or an error message
}

export interface Section {
  id: string;
  title: string;
  description?: string;
  fields: Field[];
}

// Common option sets
const yesNo = ['Yes', 'No'];
const likert1to7 = ['1', '2', '3', '4', '5', '6', '7'];
const zeroToTen = ['0','1','2','3','4','5','6','7','8','9','10'];

const devices = ['Laptop', 'Desktop', 'Tablet', 'Phone'];
const inputMethods = ['Built‑in laptop keyboard', 'External USB keyboard', 'Bluetooth keyboard', 'On‑screen keyboard'];
const keyboardLayouts = ['US QWERTY', 'UK', 'DVORAK', 'COLEMAK', 'Other'];
const postures = ['Desk chair', 'Standing desk', 'Couch/bed', 'Other'];
const connections = ['Wi‑Fi', 'Ethernet', 'Cellular'];

const waveTypes = ['Sine', 'Tan', 'Cotan', 'Sawtooth', 'Square', 'Triangle'];
const directions = ['Static', 'Up', 'Down', 'Left', 'Right', 'Oscillate Up/Down', 'Oscillate Left/Right', 'Circular'];

const shapeTypes = ['Circle', 'Square', 'Triangle', 'Chevron', 'Diamond'];
const shapeLayouts = ['Random', 'Regular Grid', 'Checkboard'];
const shapePalettes = ['None (single color)', 'Rainbow', 'Pastel'];

const colorStyles = ['Sine', 'Linear', 'Circular', 'Fractal'];

const typingTasks = ['Copy provided text', 'Free typing', 'Timed 60‑sec test', 'Numbers & symbols'];
const textDifficulty = ['Simple', 'Intermediate', 'Complex'];

export const therapyFeedbackSections: Section[] = [
  // A. Session & Consent
  {
    id: 'session',
    title: 'Session & Consent',
    fields: [
      { label: 'Tester ID', name: 'testerId', type: 'input', inputType: 'text', placeholder: 'caltech‑alias or initials', validate: [validateRequired] },
      { label: 'Email (optional)', name: 'email', type: 'input', inputType: 'email' },
      { label: 'Date of Birth', name: 'dob', type: 'input', inputType: 'date', validate: [validateDOB] },
      //  { label: 'Age Range', name: 'agerange', type: 'input', inputType: 'date', validate: [validateDOB] },
      // If you wish to **store** age directly as well, keep this optional; otherwise compute at submit.
     // { label: 'Age (optional)', name: 'age', type: 'input', inputType: 'number', placeholder: 'auto', validate: [validatePositiveNumber] },
      { label: 'Consent to store anonymized data', name: 'consent', type: 'select', options: yesNo, validate: [validateRequired] },
      { label: 'Session Label', name: 'sessionLabel', type: 'input', inputType: 'text', placeholder: 'e.g., debug run #1' },
    ],
  },

  // B. Environment & Hardware
  {
    id: 'environment',
    title: 'Environment & Hardware',
    fields: [
      { label: 'Device type', name: 'deviceType', type: 'select', options: devices, validate: [validateRequired] },
      { label: 'OS', name: 'os', type: 'input', inputType: 'text', validate: [validateRequired] },
      { label: 'Browser', name: 'browser', type: 'input', inputType: 'text', validate: [validateRequired] },
      { label: 'Screen (e.g., 2560x1440 @ 2x)', name: 'screen', type: 'input', inputType: 'text', validate: [validateRequired] },
      { label: 'Connection', name: 'connection', type: 'select', options: connections },
      { label: 'Input method', name: 'inputMethod', type: 'select', options: inputMethods },
      { label: 'Keyboard layout', name: 'keyboardLayout', type: 'select', options: keyboardLayouts },
      { label: 'Distance from screen (cm)', name: 'distanceFromScreenCm', type: 'input', inputType: 'number', placeholder: 'e.g., 60' },
      { label: 'Posture / seating', name: 'posture', type: 'select', options: postures },
      { label: 'High refresh display?', name: 'highRefresh', type: 'select', options: ['Yes (≥120Hz)','No','Unsure'] },
    ],
  },

  // C. Global Usability & Performance (any animation)
  {
    id: 'global',
    title: 'Global Usability & Performance',
    description: 'Overall impressions regardless of animation type',
    fields: [
      { label: 'Clarity of motion (1–7)', name: 'clarityMotion', type: 'select', options: likert1to7, validate: [validateRequired] },
      { label: 'Visual comfort for 60s (1–7)', name: 'visualComfort', type: 'select', options: likert1to7, validate: [validateRequired] },
      { label: 'Responsiveness of controls (1–7)', name: 'controlResponsiveness', type: 'select', options: likert1to7, validate: [validateRequired] },
      { label: 'Performance issues', name: 'performanceIssues', type: 'multiSelect', options: ['Frame drops','Input lag','Stutter on resize','Color banding','None'] },
      { label: 'Bug report', name: 'bugReport', type: 'textareascroll', placeholder: 'What broke or felt wrong?' },
    ],
  },

  // D. Waves / Equations (shown when animationType === 'waves')
  {
    id: 'waves',
    title: 'Waves / Equations',
    description: 'Only complete if you used the wave/equation animation',
    fields: [
      { label: 'Wave types tested', name: 'waveTypesTested', type: 'multiSelect', options: waveTypes },
      { label: 'Directions tested', name: 'waveDirectionsTested', type: 'multiSelect', options: directions },
      { label: 'Parameters explored', name: 'waveParamsExplored', type: 'multiSelect', options: ['Angle','Amplitude','Frequency','Speed','Thickness/Stroke','Phase offset','#Lines','Line distances','Group count','Group distance','Colors/Palette'] },
      { label: 'Easiest to type over', name: 'waveEasiest', type: 'select', options: waveTypes },
      { label: 'Most distracting', name: 'waveMostDistracting', type: 'select', options: waveTypes },
      { label: 'Uncomfortable settings (notes)', name: 'waveUncomfortable', type: 'textareascroll', placeholder: 'e.g., frequency > 200, thickness < 2' },
      { label: 'Suggested defaults', name: 'waveSuggestedDefaults', type: 'textareascroll' },
    ],
  },

  // E. Shapes (shown when animationType === 'shapes')
  {
    id: 'shapes',
    title: 'Shapes',
    description: 'Only complete if you used the shape animation',
    fields: [
      { label: 'Shapes tested', name: 'shapeTypesTested', type: 'multiSelect', options: shapeTypes },
      { label: 'Layout tested', name: 'shapeLayoutsTested', type: 'multiSelect', options: shapeLayouts },
      { label: 'Palette tested', name: 'shapePalettesTested', type: 'multiSelect', options: shapePalettes },
      { label: 'Direction tested', name: 'shapeDirectionsTested', type: 'multiSelect', options: directions },
      { label: 'Grid tuning tried', name: 'shapeGridTuning', type: 'multiSelect', options: ['Row distance','Column distance','Row offset','Column offset','Size','#Shapes (Random)'] },
      { label: 'Best balance: visibility vs. distraction (notes)', name: 'shapeBestBalance', type: 'textareascroll' },
      { label: 'Aliasing/jagged edges seen?', name: 'shapeAliasing', type: 'select', options: yesNo },
      { label: 'Edge wrapping behaved correctly?', name: 'shapeWrapping', type: 'select', options: yesNo },
    ],
  },

  // F. Color Field (shown when animationType === 'color')
  {
    id: 'color',
    title: 'Color Field',
    description: 'Only complete if you used the color‑field animation',
    fields: [
      { label: 'Styles tested', name: 'colorStylesTested', type: 'multiSelect', options: colorStyles },
      { label: 'Gradient smoothness (1–7)', name: 'colorSmoothness', type: 'select', options: likert1to7 },
      { label: 'Typing visibility against background (1–7)', name: 'colorTextVisibility', type: 'select', options: likert1to7 },
      { label: 'Color clashes noticed (notes)', name: 'colorClashes', type: 'textareascroll' },
      { label: 'Duration felt', name: 'colorDurationFelt', type: 'select', options: ['Too fast','OK','Too slow'] },
    ],
  },

  // G. Typing Task & Stabilization
  {
    id: 'typing',
    title: 'Typing Task & Stabilization',
    fields: [
      { label: 'Task attempted', name: 'typingTask', type: 'multiSelect', options: typingTasks },
      { label: 'Text difficulty', name: 'textDifficulty', type: 'select', options: textDifficulty },
      { label: 'Session duration (min)', name: 'sessionDurationMin', type: 'input', inputType: 'number', placeholder: 'e.g., 10', validate: [validatePositiveNumber] },

      { label: 'WPM (if known)', name: 'typingWPM', type: 'input', inputType: 'number', placeholder: 'auto or manual', validate: [validatePositiveNumber] },
      { label: 'Error rate % (if known)', name: 'typingErrorRate', type: 'input', inputType: 'number', placeholder: 'auto or manual', validate: [validatePositiveNumber] },

      { label: 'Perceived stabilization vs blank background (1–7)', name: 'stabilizationPerceived', type: 'select', options: likert1to7 },
      { label: 'When did errors spike? (notes)', name: 'errorSpikeNotes', type: 'textareascroll', placeholder: 'e.g., oscillation range > 150, speed > 10' },
      { label: 'Background that best supported accuracy', name: 'bestBackground', type: 'select', options: ['Waves','Shapes','Color field'] },
    ],
  },

  // H. Presets & Data Flow
  {
    id: 'presets',
    title: 'Presets & Data Flow',
    fields: [
      { label: 'Preset flows tested', name: 'presetFlowsTested', type: 'multiSelect', options: ['Save preset','Load preset','Overwrite preset','Export CSV'] },
      { label: 'Loaded preset fully restored visuals?', name: 'presetRestored', type: 'select', options: yesNo },
      { label: 'If not, what diverged?', name: 'presetDivergedNotes', type: 'textareascroll' },
      { label: 'Control labels confusing?', name: 'labelsConfusing', type: 'textareascroll' },
    ],
  },

  // I. Accessibility & Safety
  {
    id: 'accessibility',
    title: 'Accessibility & Safety',
    fields: [
      { label: 'Motion sensitivity triggered?', name: 'motionSensitivity', type: 'select', options: yesNo },
      { label: 'Would use a reduced‑motion mode', name: 'preferReducedMotion', type: 'select', options: yesNo },
      { label: 'Preferred color‑blind‑safe palette', name: 'colorblindPalette', type: 'multiSelect', options: ['Deuteranopia‑safe','Protanopia‑safe','Tritanopia‑safe','High‑contrast','None'] },
    ],
  },

  // J. Additional Notes
  {
    id: 'notes',
    title: 'Additional Notes',
    fields: [
      { label: 'Anything else we should know?', name: 'additionalNotes', type: 'textareascroll' },
    ],
  },
];

// Optional convenience export if you want a flat array (legacy rendering like medicalInterviewFields)
//export const therapyFeedbackFields: Field[] = therapyFeedbackSections.flatMap((s) => s.fields);
