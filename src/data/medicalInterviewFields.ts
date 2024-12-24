 // src/data/medicalInterviewFields.ts

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
const tremorTypeOptions = ['Essential Tremor', 'Parkinsonian Tremor', 'Dystonic Tremor', 'Cerebellar Tremor', 'Orthostatic Tremor', 'Other'];
const affectedBodyPartsOptions = ['Right Hand', 'Left Hand', 'Head', 'Voice', 'Legs'];
const tremorSeverityOptions = ['Mild', 'Moderate', 'Severe'];
const neurologicalMedicationsOptions = ['Propranolol', 'Primidone', 'Levodopa', 'Carbidopa', 'Topiramate', 'Gabapentin'];

// Fields definition
const medicalInterviewFields: FieldOption[] = [
  { label: 'First Name', name: 'firstName', type: 'input', inputType: 'text', placeholder: 'Enter first name', validate: [validateRequired] },
  { label: 'Middle Name', name: 'middleName', type: 'input', inputType: 'text', placeholder: 'Enter middle name', validate: [validateMiddleName] },
  { label: 'Last Name', name: 'lastName', type: 'input', inputType: 'text', placeholder: 'Enter last name', validate: [validateRequired] },
  { label: 'Date of Birth', name: 'dob', type: 'input', inputType: 'date', placeholder: 'Enter date of birth', validate: [validateDOB] },
  { label: 'Age', name: 'age', type: 'input', inputType: 'number', placeholder: 'Enter your age', validate: [validateAge] },
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
 
