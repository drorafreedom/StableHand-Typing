// OLD-STYLE DATA ONLY — simple arrays/objects
// Works with your existing field components.
// component ∈ 'select' | 'selectWithOther' | 'multiselect' | 'multiselectWithOther' | 'input' | 'textarea'

const YES_NO_UNSURE = ['Yes', 'No', 'Unsure', 'Prefer not to say'];

const HANDEDNESS = ['Right-handed', 'Left-handed', 'Ambidextrous', 'Prefer not to say'];
const BODY_SIDE = ['Right', 'Left', 'Both', 'Varies', 'Prefer not to say'];

const SYMPTOM_LIST = [
  'Tremor','Rigidity/stiffness','Slowness (bradykinesia)','Freezing of gait',
  'Imbalance/falls','Micrographia (small handwriting)','Dyskinesia','Dystonia/cramping',
  'Voice tremor','Head tremor','Jaw tremor','Sleep disturbance (RBD)',
  'Constipation','Loss of smell','Depression/anxiety','Cognitive concerns',
  'Other','Prefer not to say'
];
const SYMPTOM_SEVERITY = ['None','Mild','Moderate','Severe','Unsure'];

const TREMOR_CONTEXTS = [
  'At rest','Postural (holding position)','Action (goal-directed)',
  'Intention (worse near target)','Writing','Typing','Eating/utensils',
  'Holding a cup','Walking','Standing','Fatigue','Stress/anxiety','Caffeine',
  'After exertion','Other'
];

const DIAGNOSES = [
  'Parkinson’s disease (PD)','Essential tremor (ET)','Dystonic tremor',
  'Medication-induced tremor','Cerebellar tremor','Functional tremor',
  'Unknown/under evaluation','Other','Prefer not to say'
];

const DURATION_UNITS = ['days','weeks','months','years'];

const MED_NAMES = [
  'Levodopa/Carbidopa (Sinemet)','Levodopa/Carbidopa CR','Levodopa/Carbidopa/Entacapone (Stalevo)',
  'Entacapone','Rasagiline','Selegiline','Safinamide','Pramipexole','Ropinirole','Rotigotine patch',
  'Amantadine','Propranolol','Primidone','Topiramate','Gabapentin','Clonazepam','Botulinum toxin injections',
  'Other','None','Prefer not to say'
];
const MED_EFFECT = ['No benefit','Slight','Moderate','Marked','Not sure','N/A'];

const SIDE_EFFECTS = [
  'Nausea','Dizziness/lightheadedness','Sleepiness','Impulse control issues','Hallucinations','Confusion',
  'Dry mouth','Fatigue','Weight change','Other','None','Prefer not to say'
];

const PRIOR_TREATMENTS = [
  'Physical therapy/OT','Speech therapy','Botulinum toxin injections','Deep Brain Stimulation (DBS)',
  'Focused Ultrasound','Wearable device/brace','Lifestyle (exercise, sleep hygiene)',
  'Caffeine reduction','Alcohol use for tremor relief','Other','None','Prefer not to say'
];

const DEVICES = ['DBS (implanted)','Focused ultrasound (completed)','Wearable tremor device','Adaptive utensils','Other','None','Prefer not to say'];

const COMORBIDITIES = [
  'Hypertension','Diabetes','Cardiac arrhythmia','Coronary artery disease','Stroke/TIA','Kidney disease',
  'Liver disease','Thyroid disease','Anxiety','Depression','ADHD','Sleep apnea','Peripheral neuropathy',
  'Other','None','Prefer not to say'
];

const FAMILY_HISTORY = [
  'Parkinson’s disease','Essential tremor','Other movement disorder','None','Prefer not to say','Other'
];

const RED_FLAGS = [
  'Rapid progression','Early falls','Severe autonomic symptoms','Early cognitive impairment',
  'Visual hallucinations','Cerebellar signs','Pyramidal signs','Other','None','Prefer not to say'
];

export const medicalInterviewSections = [
  {
    id: 'basics',
    title: 'Basics',
    fields: [
      { component: 'select', name: 'handedness', label: 'Handedness', required: true, options: HANDEDNESS },
      { component: 'input',  name: 'age_onset',  label: 'Approximate age at symptom onset', placeholder: 'e.g., 58' },
      { component: 'input',  name: 'duration_value', label: 'Duration since onset (value)', placeholder: 'e.g., 3' },
      { component: 'select', name: 'duration_units', label: 'Duration since onset (units)', options: DURATION_UNITS }
    ]
  },

  {
    id: 'diagnosis',
    title: 'Diagnosis',
    fields: [
      { component: 'selectWithOther', name: 'primary_dx', label: 'Primary diagnosis (if any)', options: DIAGNOSES },
      { component: 'input', name: 'diagnosis_year', label: 'Year of diagnosis (if applicable)', placeholder: 'YYYY' }
    ]
  },

  {
    id: 'symptoms',
    title: 'Symptoms & Impact',
    fields: [
      { component: 'multiselectWithOther', name: 'symptoms', label: 'Which symptoms are present?', required: true, options: SYMPTOM_LIST },
      { component: 'select', name: 'tremor_severity', label: 'Tremor severity (worst typical)', options: SYMPTOM_SEVERITY,
        showIf: { name: 'symptoms', includesAny: ['Tremor'] } },
      { component: 'select', name: 'tremor_side', label: 'Tremor side predominance', options: BODY_SIDE,
        showIf: { name: 'symptoms', includesAny: ['Tremor'] } },
      { component: 'multiselectWithOther', name: 'tremor_contexts', label: 'When/where is tremor most noticeable?',
        options: TREMOR_CONTEXTS, showIf: { name: 'symptoms', includesAny: ['Tremor'] } },
      { component: 'select', name: 'onoff_fluctuations', label: 'Do symptoms fluctuate with medication “on/off”?', options: YES_NO_UNSURE },
      { component: 'multiselectWithOther', name: 'functional_impact', label: 'Daily tasks most affected',
        options: ['Typing','Writing','Eating','Pouring/drinking','Dressing','Smartphone use','Hobbies','Work tasks','Social interactions','Driving','Other','Prefer not to say'] },
      { component: 'textarea', name: 'symptom_notes', label: 'Anything else about symptoms/impact?', placeholder: 'Free text' },
      { component: 'select', name: 'caffeine_today', label: 'Caffeine within 6 hours?', options: ['Yes','No','Prefer not to say'] },
{ component: 'input', name: 'caffeine_amount_mg', label: 'Approx caffeine amount today (mg)', placeholder: 'e.g., 100',
  showIf: { name: 'caffeine_today', includesAny: ['Yes'] } },

{ component: 'select', name: 'alcohol_today', label: 'Alcohol in last 24h?', options: ['Yes','No','Prefer not to say'] },
{ component: 'input', name: 'alcohol_units', label: 'Approx drinks in last 24h', placeholder: 'e.g., 1',
  showIf: { name: 'alcohol_today', includesAny: ['Yes'] } },

{ component: 'select', name: 'sleep_quality_last_night', label: 'Sleep quality last night', options: ['Excellent','Good','Fair','Poor','Very poor','Prefer not to say'] },
{ component: 'input', name: 'sleep_hours', label: 'Hours of sleep (last night)', placeholder: 'e.g., 6.5' },

{ component: 'select', name: 'pain_present', label: 'Pain today?', options: ['Yes','No','Prefer not to say'] },
{ component: 'select', name: 'pain_severity', label: 'If pain: severity', options: ['Mild','Moderate','Severe','Worst imaginable','Unsure'],
  showIf: { name: 'pain_present', includesAny: ['Yes'] } },

    ]
  },

  {
    id: 'medications',
    title: 'Medication Regimen',
    description: 'Current meds with dose/timing/effect and side effects.',
    fields: [
      { component: 'multiselectWithOther', name: 'current_meds_list', label: 'Current medications (select all that apply)', options: MED_NAMES },

      // Levodopa details (only if Levodopa is selected)
      { component: 'input', name: 'levodopa_dose_mg', label: 'Levodopa/Carbidopa per dose (mg of Levodopa)', placeholder: 'e.g., 100',
        showIf: { name: 'current_meds_list', includesAny: ['Levodopa/Carbidopa (Sinemet)','Levodopa/Carbidopa CR','Levodopa/Carbidopa/Entacapone (Stalevo)'] } },
      { component: 'input', name: 'levodopa_times_per_day', label: 'Number of Levodopa doses per day', placeholder: 'e.g., 3',
        showIf: { name: 'current_meds_list', includesAny: ['Levodopa/Carbidopa (Sinemet)','Levodopa/Carbidopa CR','Levodopa/Carbidopa/Entacapone (Stalevo)'] } },
      { component: 'select', name: 'levodopa_effect', label: 'Overall benefit from Levodopa/Carbidopa', options: MED_EFFECT,
        showIf: { name: 'current_meds_list', includesAny: ['Levodopa/Carbidopa (Sinemet)','Levodopa/Carbidopa CR','Levodopa/Carbidopa/Entacapone (Stalevo)'] } },

      // ET meds (only if selected)
      { component: 'input', name: 'propranolol_daily_mg', label: 'Propranolol daily dose (mg)', placeholder: 'e.g., 60',
        showIf: { name: 'current_meds_list', includesAny: ['Propranolol'] } },
      { component: 'input', name: 'primidone_daily_mg', label: 'Primidone daily dose (mg)', placeholder: 'e.g., 250',
        showIf: { name: 'current_meds_list', includesAny: ['Primidone'] } },

      { component: 'multiselectWithOther', name: 'med_side_effects', label: 'Side effects experienced (select any)', options: SIDE_EFFECTS },
      { component: 'textarea', name: 'medication_notes', label: 'Medication notes (timing, wearing-off, dyskinesia, etc.)', placeholder: 'Free text' },
      // inside the medications section's fields array:
{ component: 'input', name: 'med_regimen_notes', label: 'Medication schedule notes (e.g., 8am/12pm/6pm)', placeholder: 'Free text' },

// adherence + timing
{ component: 'select', name: 'med_adherence', label: 'Do you usually take doses on time?', options: ['Always', 'Often', 'Sometimes', 'Rarely', 'Prefer not to say'] },
{ component: 'input', name: 'missed_doses_per_week', label: 'Missed doses per week (estimate)', placeholder: 'e.g., 1' },

// global timing around sessions (helps link to typing performance)
{ component: 'input', name: 'time_since_last_dose_minutes', label: 'Time since last dose when doing this session (minutes)', placeholder: 'e.g., 45' },
{ component: 'input', name: 'first_dose_time', label: 'Usual first dose time (hh:mm, 24h)', placeholder: 'e.g., 07:30' },
{ component: 'input', name: 'last_dose_time', label: 'Usual last dose time (hh:mm, 24h)', placeholder: 'e.g., 20:00' },

// per-med duration (simple, no new components)
{ component: 'input', name: 'levodopa_duration_value', label: 'Levodopa—time on this med (value)', placeholder: 'e.g., 18',
  showIf: { name: 'current_meds_list', includesAny: ['Levodopa/Carbidopa (Sinemet)','Levodopa/Carbidopa CR','Levodopa/Carbidopa/Entacapone (Stalevo)'] } },
{ component: 'select', name: 'levodopa_duration_units', label: 'Levodopa—time on this med (units)', options: ['weeks','months','years'],
  showIf: { name: 'current_meds_list', includesAny: ['Levodopa/Carbidopa (Sinemet)','Levodopa/Carbidopa CR','Levodopa/Carbidopa/Entacapone (Stalevo)'] } },

{ component: 'input', name: 'propranolol_duration_value', label: 'Propranolol—time on this med (value)', placeholder: 'e.g., 6',
  showIf: { name: 'current_meds_list', includesAny: ['Propranolol'] } },
{ component: 'select', name: 'propranolol_duration_units', label: 'Propranolol—time on this med (units)', options: ['weeks','months','years'],
  showIf: { name: 'current_meds_list', includesAny: ['Propranolol'] } },

{ component: 'input', name: 'primidone_duration_value', label: 'Primidone—time on this med (value)', placeholder: 'e.g., 12',
  showIf: { name: 'current_meds_list', includesAny: ['Primidone'] } },
{ component: 'select', name: 'primidone_duration_units', label: 'Primidone—time on this med (units)', options: ['weeks','months','years'],
  showIf: { name: 'current_meds_list', includesAny: ['Primidone'] } },

// optional: side-effects timing
{ component: 'textarea', name: 'side_effects_timing_notes', label: 'Side effects—when do they occur relative to dosing?', placeholder: 'e.g., 60–90 min after dose; evenings worse' },

      
    ]
  },

  {
    id: 'priorTx',
    title: 'Prior Treatments & Devices',
    fields: [
      { component: 'multiselectWithOther', name: 'prior_treatments', label: 'Tried before (select any)', options: PRIOR_TREATMENTS },
      { component: 'multiselectWithOther', name: 'devices', label: 'Devices in use', options: DEVICES },
      { component: 'selectWithOther', name: 'dbs_target', label: 'If DBS: target', options: ['STN','GPi','VIM','Other','Prefer not to say'],
        showIf: { name: 'devices', includesAny: ['DBS (implanted)'] } },
      { component: 'input', name: 'dbs_year', label: 'If DBS: year implanted', placeholder: 'YYYY',
        showIf: { name: 'devices', includesAny: ['DBS (implanted)'] } },
      { component: 'textarea', name: 'prior_treatment_notes', label: 'Notes about prior treatments/devices' }
    ]
  },

  {
    id: 'medicalHx',
    title: 'Medical & Family History',
    fields: [
      { component: 'multiselectWithOther', name: 'comorbidities', label: 'Medical conditions (select any)', options: COMORBIDITIES },
      { component: 'multiselectWithOther', name: 'family_history', label: 'Family history (select any)', options: FAMILY_HISTORY },
      { component: 'select', name: 'alcohol_relief', label: 'Alcohol transiently improves tremor?', options: YES_NO_UNSURE },
      { component: 'select', name: 'caffeine_worse', label: 'Caffeine worsens tremor?', options: YES_NO_UNSURE },
      { component: 'select', name: 'sleep_worse', label: 'Poor sleep worsens symptoms?', options: YES_NO_UNSURE },
      { component: 'select', name: 'falls_past_year', label: 'Any falls in past year?', options: YES_NO_UNSURE },
      { component: 'selectWithOther', name: 'assistive_devices', label: 'Uses cane/walker/wheelchair?', options: ['None','Cane','Walker','Wheelchair','Other','Prefer not to say'] }
    ]
  },

  {
    id: 'redFlags',
    title: 'Red Flags',
    fields: [
      { component: 'multiselectWithOther', name: 'red_flags', label: 'Any of the following?', options: RED_FLAGS },
      { component: 'textarea', name: 'red_flag_notes', label: 'Red flag details' }
    ]
  },

  {
    id: 'goals',
    title: 'Your Goals & Notes',
    fields: [
      { component: 'textarea', name: 'goals', label: 'Main goals for therapy', placeholder: 'e.g., improve typing speed/accuracy' },
      { component: 'textarea', name: 'free_notes', label: 'Anything else you want us to know?' }
    ]
  }
];

// Back-compat export so existing imports keep working:
export const medicalInterviewFields = medicalInterviewSections;
export default medicalInterviewFields;


/*  // src/data/medicalInterviewFields.ts

import * as validations from '../utils/validation';
import {
  validateEmail,
  validatePhoneNumber,
  validateZipCode,
  validateRequired,
  validateCityCountryProfession,
  validateDOB,
  validateAge,
  sendVerificationEmail,
  validatePositiveNumber,
  isCapsLockOn,
  validatePassword,
  validateText,
  validateMiddleName,
  validateAgeWithDOB,
} from '../utils/validation';

// Define field types for better type safety
type FieldOption = {
  label: string;
  name: string;
  type: 'input' | 'select' | 'multiSelect' | 'textareascroll' | 'selectWithOther' | 'multiSelectWithOther';
  inputType?: string; // For 'input' types
  placeholder?: string; // Placeholder for text inputs
  options?: string[]; // For select or multiSelect fields
  validate?: ((value: any) => boolean | string)[]; // Array of validation functions
};

// Field options
const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];
const yesNoOptions = ['Yes', 'No'];
const frequencyOptions = ['Never', 'Rarely', 'Occasionally', 'Frequently', 'Always'];
const familyHistoryOptions = ['Mother', 'Father', 'Sibling', 'Grandparent', 'Uncle/Aunt'];
const tremorTypeOptions = ['Essential Tremor', 'Parkinson Tremor','Parkinsonism', 'Dystonic Tremor', 'Cerebellar Tremor', 'Orthostatic Tremor', 'Other'];
const affectedBodyPartsOptions = ['Right Hand', 'Left Hand',  'Right Leg', 'Left Leg' ,'Head', 'Voice', 'Lips', 'Neck', 'Turso','Eyes Lids', 'Other'];
const tremorSeverityOptions = ['None', 'Mild', 'Moderate', 'Severe'];
const neurologicalMedicationsOptions = ['Propranolol', 'Primidone', 'Levodopa', 'Carbidopa', 'Topiramate', 'Gabapentin', 'Other'];

// Fields definition
const medicalInterviewFields: FieldOption[] = [
  { label: 'First Name', name: 'firstName', type: 'input', inputType: 'text', placeholder: 'Enter first name', validate: [validateRequired] },
  { label: 'Middle Name', name: 'middleName', type: 'input', inputType: 'text', placeholder: 'Enter middle name', validate: [validateMiddleName] },
  { label: 'Last Name', name: 'lastName', type: 'input', inputType: 'text', placeholder: 'Enter last name', validate: [validateRequired] },
  { label: 'Date of Birth', name: 'dob', type: 'input', inputType: 'date', placeholder: 'Enter date of birth', validate: [validateDOB] },
 // { label: 'Age', name: 'age', type: 'input', inputType: 'number', placeholder: 'Enter your age', validate: [validateAge] },
  { label: 'Gender', name: 'gender', type: 'select', options: genderOptions, validate: [validateRequired] },
  { label: 'Chief Complaint', name: 'chiefComplaint', type: 'input', inputType: 'textareascroll', placeholder: 'Enter chief complaint', validate: [validateRequired] },
  { label: 'History of Present Illness', name: 'historyPresentIllness', type: 'textareascroll', inputType: 'textarea', placeholder: 'Enter history of present illness', validate: [validateRequired] },
  { label: 'Onset of Tremor', name: 'onsetTremor', type: 'input', inputType: 'date', placeholder: 'Enter onset date of tremor', validate: [validateRequired] },
  { label: 'Frequency of Tremor', name: 'frequencyTremor', type: 'select', options: frequencyOptions, validate: [validateRequired] },
  { label: 'Medications', name: 'medications', type: 'input', inputType: 'textareascroll', placeholder: 'Enter current medications', validate: [validateRequired] },
  { label: 'Allergies', name: 'allergies', type: 'input', inputType: 'textareascroll', placeholder: 'Enter allergies', validate: [validateRequired] },
  { label: 'Family History of Tremor', name: 'familyHistoryTremor', type: 'multiSelectWithOther', options: familyHistoryOptions, validate: [validateRequired] },
  { label: 'Past Medical History', name: 'pastMedicalHistory', type: 'input', inputType: 'textareascroll', placeholder: 'Enter past medical history', validate: [validateRequired] },
  { label: 'Neurological Examination Findings', name: 'neurologicalExaminationFindings', type: 'textareascroll', inputType: 'textareascroll', placeholder: 'Enter neurological examination findings', validate: [validateRequired] },
  { label: 'Type of Tremor', name: 'tremorType', type: 'selectWithOther', options: tremorTypeOptions, validate: [validateRequired] },
  { label: 'Head Trauma History', name: 'headTrauma', type: 'selectWithOther', options: yesNoOptions, validate: [validateRequired] },
  { label: 'Affected Body Parts', name: 'affectedBodyParts', type: 'multiSelect', options: affectedBodyPartsOptions, validate: [validateRequired] },
  { label: 'Onset of Tremor', name: 'tremorOnset', type: 'input', inputType: 'date', placeholder: 'Enter onset age or year', validate: [validateRequired] },
  { label: 'Tremor Severity', name: 'tremorSeverity', type: 'select', options: tremorSeverityOptions, validate: [validateRequired] },
  { label: 'Neurological Medications', name: 'neurologicalMedications', type: 'multiSelect', options: neurologicalMedicationsOptions, validate: [] },
  { label: 'Doses of Medications', name: 'medicationDoses', type: 'textareascroll', placeholder: 'Enter medication and doses', validate: [validateRequired] },
  { label: 'Current Symptoms', name: 'currentSymptoms', type: 'textareascroll', placeholder: 'Describe current symptoms', validate: [validateRequired] },
  { label: 'Additional Notes', name: 'additionalNotes', type: 'textareascroll', placeholder: 'Any additional notes', validate: [] },
];

export { medicalInterviewFields };
 */
//+++++++++++JS version+++++++++++++++++
  // src/data/medicalInterviewFields.js
  // JS version


//  import validations from '../utils/validation';
/* import * as validations from '../utils/validation';
import {validateEmail,
  validatePhoneNumber,
  validateZipCode,
  validateRequired,
  validateCityCountryProfession,
  validateDOB,
  validateAge,
  sendVerificationEmail,
validatePositiveNumber,
isCapsLockOn,
validatePassword,
validateText,
validateMiddleName,
validateAgeWithDOB} from '../utils/validation';

const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];
const yesNoOptions = ['Yes', 'No'];
const frequencyOptions = ['Never', 'Rarely', 'Occasionally', 'Frequently', 'Always'];
const familyHistoryOptions = ['Mother', 'Father', 'Sibling', 'Grandparent', 'Uncle/Aunt'];
const tremorTypeOptions =  ['Essential Tremor', 'Parkinsonian Tremor', 'Dystonic Tremor', 'Cerebellar Tremor', 'Orthostatic Tremor', 'Other'];
const affectedBodyPartsOptions = ['Right Hand', 'Left Hand', 'Head', 'Voice', 'Legs'];
const  tremorSeverityOptions =  ['Mild', 'Moderate', 'Severe'];
const neurologicalMedicationsOptions =['Propranolol', 'Primidone', 'Levodopa', 'Carbidopa', 'Topiramate', 'Gabapentin'];




const medicalInterviewFields = [
    { label: 'First Name', name: 'firstName', type: 'input', inputType: 'text', placeholder: 'Enter first name', validate: [validateRequired] },
    { label: 'Middle Name', name: 'middleName', type: 'input', inputType: 'text', placeholder: 'Enter middle name', validate: [ validateMiddleName] },
    { label: 'Last Name', name: 'lastName', type: 'input', inputType: 'text', placeholder: 'Enter last name', validate: [validateRequired] },
    { label: 'Date of Birth', name: 'dob', type: 'input', inputType: 'date', placeholder: 'Enter date of birth', validate: [validateDOB] },
    { label: 'Age', name: 'age', type: 'input', inputType: 'number', placeholder: 'Enter your age', validate: [ validateAge ] },
   { label: 'Gender', name: 'gender', type: 'select', options: genderOptions, validate: [validateRequired] },
  { label: 'Chief Complaint', name: 'chiefComplaint', type: 'input', inputType: 'textareascroll', placeholder: 'Enter chief complaint', validate: [validateRequired] },
  { label: 'History of Present Illness', name: 'historyPresentIllness', type: 'textareascroll', inputType: 'textarea', placeholder: 'Enter history of present illness', validate: [validateRequired] },
  { label: 'Onset of Tremor', name: 'onsetTremor', type: 'input', inputType: 'date', placeholder: 'Enter onset date of tremor', validate: [validateRequired] },
  { label: 'Frequency of Tremor', name: 'frequencyTremor', type: 'select', options: frequencyOptions, validate: [validateRequired] },
  { label: 'Medications', name: 'medications', type: 'input', inputType: 'textareascroll', placeholder: 'Enter current medications', validate: [validateRequired] },
  { label: 'Allergies', name: 'allergies', type: 'input', inputType: 'textareascroll', placeholder: 'Enter allergies', validate: [validateRequired] },
  { label: 'Family History of Tremor', name: 'familyHistoryTremor', type: 'multiSelectWithOther', options: familyHistoryOptions, validate: [validateRequired] },
  { label: 'Past Medical History', name: 'pastMedicalHistory', type: 'input', inputType: 'textareascroll', placeholder: 'Enter past medical history', validate: [validateRequired] },
  { label: 'Neurological Examination Findings', name: 'neurologicalExaminationFindings', type: 'textareascroll', inputType: 'textareascroll', placeholder: 'Enter neurological examination findings', validate: [validateRequired] },
  { label: 'Type of Tremor', name: 'tremorType', type: 'selectWithOther', options: tremorTypeOptions, validate: [validateRequired] },
  { label: 'Head Trauma History', name: 'headTrauma', type: 'selectWithOther', options: ['Yes', 'No'], validate: [validateRequired] },
  { label: 'Affected Body Parts', name: 'affectedBodyParts', type: 'multiSelect', options: affectedBodyPartsOptions, validate: [validateRequired] },
  { label: 'Onset of Tremor', name: 'tremorOnset', type: 'input', inputType: 'date', placeholder: 'Enter onset age or year', validate: [validateRequired] },
  { label: 'Tremor Severity', name: 'tremorSeverity', type: 'select', options: tremorSeverityOptions, validate: [validateRequired] },
  { label: 'Neurological Medications', name: 'neurologicalMedications', type: 'multiSelect', options: neurologicalMedicationsOptions, validate: [] },
  { label: 'Doses of Medications', name: 'medicationDoses', type: 'textareascroll', placeholder: 'Enter medication and doses', validate: [validateRequired] },
  { label: 'Current Symptoms', name: 'currentSymptoms', type: 'textareascroll', placeholder: 'Describe current symptoms', validate: [validateRequired] },
  { label: 'Additional Notes', name: 'additionalNotes', type: 'textareascroll', placeholder: 'Any additional notes', validate: [] }

];

export { medicalInterviewFields };
 */
 
