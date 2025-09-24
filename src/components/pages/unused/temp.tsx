// src/data/medicalInterviewFields.ts
// Structured medical interview schema for StableHand (PD/ET and other tremors).
// Designed to map 1:1 to your existing common field components.
// Sections -> Fields. Each field declares a component type your renderer can switch on.

export type ComponentType =
  | 'input'                  // -> InputField (text/number/date)
  | 'select'                 // -> SelectField
  | 'selectWithOther'        // -> SelectWithOtherField
  | 'multiselect'            // -> MultiSelectField
  | 'multiselectWithOther'   // -> MultiSelectWithOtherField
  | 'textarea';              // -> TextAreaField

export interface BaseField {
  id: string;                    // unique key
  label: string;
  component: ComponentType;
  name: string;                  // form name (key in your state)
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  // showIf: render condition (optional simple dependency)
  showIf?: { name: string; equalsAny: (string | number | boolean)[] };
}

export interface OptionField extends BaseField {
  options: string[];
}

export type Field = BaseField | OptionField;

export interface Section {
  id: string;
  title: string;
  description?: string;
  fields: Field[];
}

//
// Reusable option lists
//
export const YES_NO_UNSURE = ['Yes', 'No', 'Unsure', 'Prefer not to say'] as const;

export const HANDEDNESS = ['Right-handed', 'Left-handed', 'Ambidextrous', 'Prefer not to say'];

export const BODY_SIDE = ['Right', 'Left', 'Both', 'Varies', 'Prefer not to say'];

export const TREMOR_CONTEXTS = [
  'At rest',
  'Postural (holding position)',
  'Action (goal-directed)',
  'Intention (worse approaching target)',
  'Writing',
  'Typing',
  'Eating/utensils',
  'Holding a cup',
  'Walking',
  'Standing',
  'Fatigue',
  'Stress/anxiety',
  'Caffeine',
  'After exertion',
  'Other'
];

export const SYMPTOM_LIST = [
  'Tremor',
  'Rigidity/stiffness',
  'Slowness (bradykinesia)',
  'Freezing of gait',
  'Imbalance/falls',
  'Micrographia (small handwriting)',
  'Dyskinesia',
  'Dystonia/cramping',
  'Voice tremor',
  'Head tremor',
  'Jaw tremor',
  'Sleep disturbance (RBD/acting out dreams)',
  'Constipation',
  'Loss of smell',
  'Depression/anxiety',
  'Cognitive concerns',
  'Other',
  'Prefer not to say'
];

export const SYMPTOM_SEVERITY = ['None', 'Mild', 'Moderate', 'Severe', 'Unsure'];

export const DIAGNOSES = [
  'Parkinson’s disease (PD)',
  'Essential tremor (ET)',
  'Dystonic tremor',
  'Medication-induced tremor',
  'Cerebellar tremor',
  'Functional tremor',
  'Unknown/under evaluation',
  'Other',
  'Prefer not to say'
];

export const DURATION_UNITS = ['days', 'weeks', 'months', 'years'];

export const MED_NAMES = [
  // PD
  'Levodopa/Carbidopa (Sinemet)',
  'Levodopa/Carbidopa CR',
  'Levodopa/Carbidopa/Entacapone (Stalevo)',
  'Entacapone',
  'Rasagiline',
  'Selegiline',
  'Safinamide',
  'Pramipexole',
  'Ropinirole',
  'Rotigotine patch',
  'Amantadine',
  // ET / mixed
  'Propranolol',
  'Primidone',
  'Topiramate',
  'Gabapentin',
  'Clonazepam',
  'Botulinum toxin injections',
  'Other',
  'None',
  'Prefer not to say'
];

export const MED_EFFECT = ['No benefit', 'Slight', 'Moderate', 'Marked', 'Not sure', 'N/A'];

export const SIDE_EFFECTS = [
  'Nausea',
  'Dizziness/lightheadedness',
  'Sleepiness',
  'Impulse control issues',
  'Hallucinations',
  'Confusion',
  'Dry mouth',
  'Fatigue',
  'Weight change',
  'Other',
  'None',
  'Prefer not to say'
];

export const PRIOR_TREATMENTS = [
  'Physical therapy/OT',
  'Speech therapy',
  'Botulinum toxin injections',
  'Deep Brain Stimulation (DBS)',
  'Focused Ultrasound',
  'Wearable device/brace',
  'Lifestyle (exercise, sleep hygiene)',
  'Caffeine reduction',
  'Alcohol use for tremor relief',
  'Other',
  'None',
  'Prefer not to say'
];

export const DEVICES = [
  'DBS (implanted)',
  'Focused ultrasound (completed)',
  'Wearable tremor device',
  'Adaptive utensils',
  'Other',
  'None',
  'Prefer not to say'
];

export const COMORBIDITIES = [
  'Hypertension',
  'Diabetes',
  'Cardiac arrhythmia',
  'Coronary artery disease',
  'Stroke/TIA',
  'Kidney disease',
  'Liver disease',
  'Thyroid disease',
  'Anxiety',
  'Depression',
  'ADHD',
  'Sleep apnea',
  'Peripheral neuropathy',
  'Other',
  'None',
  'Prefer not to say'
];

export const FAMILY_HISTORY = [
  'Parkinson’s disease',
  'Essential tremor',
  'Other movement disorder',
  'None',
  'Prefer not to say',
  'Other'
];

export const RED_FLAGS = [
  'Rapid progression',
  'Early falls',
  'Severe autonomic symptoms',
  'Early cognitive impairment',
  'Visual hallucinations',
  'Cerebellar signs',
  'Pyramidal signs',
  'Other',
  'None',
  'Prefer not to say'
];

//
// Sections & Fields
//
export const medicalInterviewSections: Section[] = [
  {
    id: 'basics',
    title: 'Basics',
    fields: [
      { id: 'handed', label: 'Handedness', component: 'select', name: 'handedness', required: true, options: HANDEDNESS },
      { id: 'ageOnset', label: 'Approximate age at symptom onset', component: 'input', name: 'age_onset', placeholder: 'e.g., 58', helpText: 'If unsure, best estimate is fine.' },
      { id: 'durationVal', label: 'Duration since onset (value)', component: 'input', name: 'duration_value', placeholder: 'e.g., 3' },
      { id: 'durationUnit', label: 'Duration since onset (units)', component: 'select', name: 'duration_units', options: DURATION_UNITS }
    ]
  },

  {
    id: 'diagnosis',
    title: 'Diagnosis',
    fields: [
      { id: 'dxPrim', label: 'Primary diagnosis (if any)', component: 'selectWithOther', name: 'primary_dx', options: DIAGNOSES, helpText: 'If unknown or not yet established, choose Unknown/under evaluation.' },
      { id: 'dxYear', label: 'Year of diagnosis (if applicable)', component: 'input', name: 'diagnosis_year', placeholder: 'YYYY' }
    ]
  },

  {
    id: 'symptoms',
    title: 'Symptoms & Impact',
    fields: [
      {
        id: 'symptomList',
        label: 'Which symptoms are present?',
        component: 'multiselectWithOther',
        name: 'symptoms',
        options: SYMPTOM_LIST,
        required: true
      },
      {
        id: 'tremorSev',
        label: 'Tremor severity (worst typical)',
        component: 'select',
        name: 'tremor_severity',
        options: SYMPTOM_SEVERITY,
        showIf: { name: 'symptoms', equalsAny: ['Tremor'] }
      },
      {
        id: 'tremorSide',
        label: 'Tremor side predominance',
        component: 'select',
        name: 'tremor_side',
        options: BODY_SIDE,
        showIf: { name: 'symptoms', equalsAny: ['Tremor'] }
      },
      {
        id: 'tremorContexts',
        label: 'When/where is tremor most noticeable?',
        component: 'multiselectWithOther',
        name: 'tremor_contexts',
        options: TREMOR_CONTEXTS,
        showIf: { name: 'symptoms', equalsAny: ['Tremor'] }
      },
      {
        id: 'onOffFluct',
        label: 'Do symptoms fluctuate with medication “on/off” cycles?',
        component: 'select',
        name: 'onoff_fluctuations',
        options: [...YES_NO_UNSURE],
      },
      {
        id: 'functionalImpact',
        label: 'Daily tasks most affected',
        component: 'multiselectWithOther',
        name: 'functional_impact',
        options: ['Typing', 'Writing', 'Eating', 'Pouring/drinking', 'Dressing', 'Smartphone use', 'Hobbies', 'Work tasks', 'Social interactions', 'Driving', 'Other', 'Prefer not to say']
      },
      {
        id: 'symptomNotes',
        label: 'Anything else about symptoms/impact?',
        component: 'textarea',
        name: 'symptom_notes',
        placeholder: 'Free text'
      }
    ]
  },

  {
    id: 'medications',
    title: 'Medication Regimen',
    description: 'Capture current medications with dose, timing, and effects.',
    fields: [
      {
        id: 'currentMeds',
        label: 'Current medications (select all that apply)',
        component: 'multiselectWithOther',
        name: 'current_meds_list',
        options: MED_NAMES
      },
      {
        id: 'medLevodopaDoseMg',
        label: 'Levodopa/Carbidopa total per dose (mg of Levodopa)',
        component: 'input',
        name: 'levodopa_dose_mg',
        placeholder: 'e.g., 100',
        showIf: { name: 'current_meds_list', equalsAny: ['Levodopa/Carbidopa (Sinemet)', 'Levodopa/Carbidopa CR', 'Levodopa/Carbidopa/Entacapone (Stalevo)'] }
      },
      {
        id: 'levodopaTimesPerDay',
        label: 'Number of doses per day',
        component: 'input',
        name: 'levodopa_times_per_day',
        placeholder: 'e.g., 3',
        showIf: { name: 'current_meds_list', equalsAny: ['Levodopa/Carbidopa (Sinemet)', 'Levodopa/Carbidopa CR', 'Levodopa/Carbidopa/Entacapone (Stalevo)'] }
      },
      {
        id: 'levodopaEffect',
        label: 'Overall benefit from Levodopa/Carbidopa',
        component: 'select',
        name: 'levodopa_effect',
        options: MED_EFFECT,
        showIf: { name: 'current_meds_list', equalsAny: ['Levodopa/Carbidopa (Sinemet)', 'Levodopa/Carbidopa CR', 'Levodopa/Carbidopa/Entacapone (Stalevo)'] }
      },
      {
        id: 'betaBlockerDose',
        label: 'Propranolol daily dose (mg)',
        component: 'input',
        name: 'propranolol_daily_mg',
        placeholder: 'e.g., 60',
        showIf: { name: 'current_meds_list', equalsAny: ['Propranolol'] }
      },
      {
        id: 'primidoneDose',
        label: 'Primidone daily dose (mg)',
        component: 'input',
        name: 'primidone_daily_mg',
        placeholder: 'e.g., 250',
        showIf: { name: 'current_meds_list', equalsAny: ['Primidone'] }
      },
      {
        id: 'sideEffects',
        label: 'Side effects experienced (select any)',
        component: 'multiselectWithOther',
        name: 'med_side_effects',
        options: SIDE_EFFECTS
      },
      {
        id: 'medNotes',
        label: 'Medication notes (timing, wearing-off, dyskinesia, etc.)',
        component: 'textarea',
        name: 'medication_notes',
        placeholder: 'Free text'
      }
    ]
  },

  {
    id: 'priorTx',
    title: 'Prior Treatments & Devices',
    fields: [
      { id: 'priorTxList', label: 'Tried before (select any)', component: 'multiselectWithOther', name: 'prior_treatments', options: PRIOR_TREATMENTS },
      { id: 'devices', label: 'Devices in use', component: 'multiselectWithOther', name: 'devices', options: DEVICES },
      { id: 'dbsTarget', label: 'If DBS: target', component: 'selectWithOther', name: 'dbs_target', options: ['STN', 'GPi', 'VIM', 'Other', 'Prefer not to say'], showIf: { name: 'devices', equalsAny: ['DBS (implanted)'] } },
      { id: 'dbsYear', label: 'If DBS: year implanted', component: 'input', name: 'dbs_year', placeholder: 'YYYY', showIf: { name: 'devices', equalsAny: ['DBS (implanted)'] } },
      { id: 'txNotes', label: 'Notes about prior treatments/devices', component: 'textarea', name: 'prior_treatment_notes' }
    ]
  },

  {
    id: 'medicalHx',
    title: 'Medical & Family History',
    fields: [
      { id: 'comorbid', label: 'Medical conditions (select any)', component: 'multiselectWithOther', name: 'comorbidities', options: COMORBIDITIES },
      { id: 'famHx', label: 'Family history (select any)', component: 'multiselectWithOther', name: 'family_history', options: FAMILY_HISTORY },
      { id: 'alcoholRelief', label: 'Alcohol transiently improves tremor?', component: 'select', name: 'alcohol_relief', options: [...YES_NO_UNSURE] },
      { id: 'caffeineWorse', label: 'Caffeine worsens tremor?', component: 'select', name: 'caffeine_worse', options: [...YES_NO_UNSURE] },
      { id: 'sleepImpact', label: 'Poor sleep worsens symptoms?', component: 'select', name: 'sleep_worse', options: [...YES_NO_UNSURE] },
      { id: 'falls', label: 'Any falls in past year?', component: 'select', name: 'falls_past_year', options: [...YES_NO_UNSURE] },
      { id: 'assistive', label: 'Uses cane/walker/wheelchair?', component: 'selectWithOther', name: 'assistive_devices', options: ['None', 'Cane', 'Walker', 'Wheelchair', 'Other', 'Prefer not to say'] }
    ]
  },

  {
    id: 'redFlags',
    title: 'Red Flags',
    fields: [
      { id: 'redFlagList', label: 'Any of the following?', component: 'multiselectWithOther', name: 'red_flags', options: RED_FLAGS },
      { id: 'redFlagNotes', label: 'Red flag details', component: 'textarea', name: 'red_flag_notes' }
    ]
  },

  {
    id: 'goals',
    title: 'Your Goals & Notes',
    fields: [
      { id: 'goalsTx', label: 'Main goals for therapy', component: 'textarea', name: 'goals', placeholder: 'e.g., improve typing speed/accuracy' },
      { id: 'freeNotes', label: 'Anything else you want us to know?', component: 'textarea', name: 'free_notes' }
    ]
  }
];

//
// Minimal validation ideas (your form logic can enforce these)
//
export const requiredFieldNames: string[] = [
  'handedness',
  'symptoms'
];

