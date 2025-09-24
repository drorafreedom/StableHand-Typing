// src/data/demographicFields.ts
// Sectioned Demographics config (works with your current DemographicsPage)
// Uses your classic field "type" names and optional validators.

import {
  validateRequired,
  validateEmail,
  validatePhoneNumber,
  validateZipCode,
  validateCityCountryProfession,
  validateDOB,
  validateAge,
  validatePositiveNumber,
  validateMultiSelectField,
} from '../utils/validation';

// --- option lists (copied from your previous version) ---
const genderOptions = ['Male', 'Female', 'HomoSexual', 'BiSexual', 'TransSexual', 'Prefer not to say'];
const ethnicityOptions = [
  'White', 'Caucasian', 'African-American', 'Black', 'Native Hawaiian or Pacific Islander',
  'Asian', 'Hispanic', 'Prefer not to say'
];
const incomeOptions = ['<20,000', '20,000-50,000', '50,000-100,000', '100,000+', 'Prefer not to say'];
const employmentStatusOptions = ['Employed', 'Unemployed', 'Retired', 'Self-Employed', 'Seeking opportunities', 'Prefer not to say'];
const educationLevelOptions = ['None','High School','Associate Degree',"Bachelor's Degree","Master's Degree",'Doctorate','Prefer not to say'];
const languageOptions = ['English', 'Spanish', 'Portuguese', 'French', 'Mandarin', 'Chinese', 'Hindi', 'Arabic', 'Prefer not to say'];
const stateOptions = [
  'NA','Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia',
  'Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts',
  'Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey',
  'New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island',
  'South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia',
  'Wisconsin','Wyoming'
];
const countryOptions = ['United States','Canada','Mexico','United Kingdom','Germany','France','India','China','Japan'];
const residencyOptions = [
  'North America','Europe','Africa','South America','Asia','Australia','Caribbean Islands','Pacific Islands','Prefer not to say'
];
const petsTypeOptions = ['None','Dog','Cat','Fish','Bird','Rabit','Reptile','Prefer not to say'];
const hobbiesOptions = [
  'None','Biking','Fashion','Design','Crafts','Traveling','Camping','Gourmet food','Physical fitness','Music',
  'Sewing','Art','Antiques','Reading','Prefer not to answer'
];
const industryOptions = [
  'None','Agriculture','Utilities','Finance','Entertainment','Education','Health care','Information services','Data processing',
  'Food services','Hotel services','Legal services','Publishing','Military','Prefer not to say'
];

// ---------------- Sections ----------------
export const demographicFields = [
  {
    id: 'identity',
    title: 'Identity & Contact',
    description: 'Basic personal information and how to reach you.',
    fields: [
      { type: 'input', name: 'firstName',  label: 'First Name',  inputType: 'text',  placeholder: 'Enter first name',  validate: [validateRequired] },
      { type: 'input', name: 'middleName', label: 'Middle Name', inputType: 'text',  placeholder: 'Enter middle name', validate: [] },
      { type: 'input', name: 'lastName',   label: 'Last Name',   inputType: 'text',  placeholder: 'Enter last name',   validate: [validateRequired] },

      { type: 'input', name: 'dob',  label: 'Date of Birth', inputType: 'date', placeholder: '', validate: [validateDOB] },
      { type: 'input', name: 'age',  label: 'Age',           inputType: 'number', placeholder: 'Auto-calculated from DOB', validate: [validateAge] },

      { type: 'select', name: 'gender',    label: 'Gender',    options: genderOptions,    validate: [validateRequired] },
      { type: 'selectWithOther', name: 'ethnicity', label: 'Ethnicity', options: ethnicityOptions, validate: [validateRequired] },

      { type: 'input', name: 'email', label: 'Email', inputType: 'email', placeholder: 'Enter email', validate: [validateEmail] },
      { type: 'input', name: 'phoneNumber', label: 'Phone Number', inputType: 'text', placeholder: 'Enter phone number', validate: [validatePhoneNumber] },

      { type: 'input', name: 'address',      label: 'Address',      inputType: 'text', placeholder: 'Enter address', validate: [validateRequired] },
      { type: 'input', name: 'city',         label: 'City',         inputType: 'text', placeholder: 'Enter city',    validate: [validateCityCountryProfession] },
      { type: 'select', name: 'state',       label: 'State',        options: stateOptions, validate: [validateRequired] },
      { type: 'input', name: 'zip',          label: 'ZIP Code',     inputType: 'text', placeholder: 'Enter ZIP code', validate: [validateZipCode] },
      { type: 'selectWithOther', name: 'country', label: 'Country', options: countryOptions, validate: [validateCityCountryProfession] },
    ],
  },

  {
    id: 'background',
    title: 'Background & Education',
    description: 'Education, work, and residence.',
    fields: [
      { type: 'selectWithOther', name: 'residency', label: 'Where Do You Reside', options: residencyOptions, validate: [validateCityCountryProfession] },
      { type: 'select',          name: 'educationLevel', label: 'Education Level', options: educationLevelOptions, validate: [validateRequired] },
      { type: 'selectWithOther', name: 'profession', label: 'Profession / Industry', options: industryOptions, validate: [validateCityCountryProfession] },
      { type: 'select',          name: 'employmentStatus', label: 'Employment Status', options: employmentStatusOptions, validate: [validateRequired] },
      { type: 'select',          name: 'income', label: 'Household Income', options: incomeOptions, validate: [validateRequired] },
      { type: 'select',          name: 'maritalStatus', label: 'Marital Status', options: ['Single','Married','Divorced','Widowed','Prefer not to say'], validate: [validateRequired] },

      { type: 'input', name: 'dependents',   label: 'Number of Dependents', inputType: 'number', placeholder: 'Total dependents', validate: [validatePositiveNumber] },
      { type: 'input', name: 'naturalKids',  label: 'Natural Kids',         inputType: 'number', placeholder: 'Enter number',      validate: [validatePositiveNumber] },
      { type: 'input', name: 'adoptedKids',  label: 'Adopted Kids',         inputType: 'number', placeholder: 'Enter number',      validate: [validatePositiveNumber] },
    ],
  },

  {
    id: 'languages',
    title: 'Languages',
    description: 'Mother tongue and additional languages.',
    fields: [
      { type: 'selectWithOther', name: '1stlanguages', label: '1st Language', options: languageOptions, validate: [validateRequired] },
      { type: 'multiSelect',     name: '2languages2',  label: '2nd Languages', options: languageOptions, validate: [validateMultiSelectField] },
    ],
  },

  {
    id: 'citizenship',
    title: 'Birthplace & Citizenship',
    description: 'Country of birth and citizenship(s).',
    fields: [
      { type: 'selectWithOther', name: 'countryOfBirth', label: 'Country of Birth', options: countryOptions, validate: [validateCityCountryProfession] },
      { type: 'selectWithOther', name: 'citizenship',    label: 'Citizenship',      options: countryOptions, validate: [validateCityCountryProfession] },
    ],
  },

  {
    id: 'home_life',
    title: 'Home Life & Hobbies',
    description: 'Pets and hobbies.',
    fields: [
      { type: 'multiSelectWithOther', name: 'petsTypes', label: 'What type of Pets Do You Have', options: petsTypeOptions, validate: [validateMultiSelectField] },
      { type: 'input',                name: 'pets',      label: 'How many pets?', inputType: 'number', placeholder: 'Enter number of pets', validate: [validatePositiveNumber] },
      { type: 'multiSelectWithOther', name: 'hobbies',   label: 'Hobbies', options: hobbiesOptions, validate: [validateMultiSelectField] },
    ],
  },
];



// // src/data/demographicFields.ts filanl 9.24. 25

// import * as validations from '../utils/validation';
// import {validateEmail,
//   validatePhoneNumber,
//   validateZipCode,
//   validateRequired,
//   validateCityCountryProfession,
//   validateDOB,
//   validateAge,
//   sendVerificationEmail,
// validatePositiveNumber,
// isCapsLockOn,
// validatePassword,
// validateText,
// validateMiddleName,
// validateMultiSelectField,
// validateAgeWithDOB} from '../utils/validation';
// type FieldType =
//   | 'input'
//   | 'select'
//   | 'selectWithOther'
//   | 'multiSelect';

// interface Field {
//   label: string;
//   name: string;
//   type: FieldType;
//   inputType?: string; // For 'input' type fields (e.g., text, email, number)
//   placeholder?: string; // Placeholder text for input fields
//   options?: string[]; // Options for 'select', 'selectWithOther', 'multiSelect'
//   validate: ((value: string | number | string[]) => boolean)[]; // Validation functions
// }

// const genderOptions = ['Male', 'Female', 'HomoSexual', 'BiSexual', 'TransSexual', 'Prefer not to say'];
// const ethnicityOptions = ['White', 'Caucasian', 'African-American', 'Black', 'Native Hawaiian or Pacific Islander', 'Asian', 'Hispanic', 'Prefer not to say'];
// const incomeOptions = ['<20,000', '20,000-50,000', '50,000-100,000', '100,000+', 'Prefer not to say'];
// const employmentStatusOptions = ['Employed', 'Unemployed', 'Retired', 'Self-Employed', 'Seeking opportunities', 'Prefer not to say'];
// const educationLevelOptions = ['None','High School', 'Associate Degree', "Bachelor's Degree", "Master's Degree", 'Doctorate', 'Prefer not to say'];
// const maritalStatusOptions = ['Single', 'Married', 'Divorced', 'Widowed', 'Prefer not to say'];
// const languageOptions = ['English', 'Spanish', 'Portuguese', 'French', 'Mandarin', 'Chinese', 'Hindi', 'Arabic', 'Prefer not to say'];
// const stateOptions = ['NA',
//   'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia',
//   'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts',
//   'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 
//   'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island',
//   'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 
//   'Wisconsin', 'Wyoming'
// ];
// const countryOptions = ['United States', 'Canada', 'Mexico', 'United Kingdom', 'Germany', 'France', 'India', 'China', 'Japan'];
// const residencyOptions = ['North America', 'Europe', 'Africa', 'South America', 'Asia', 'Australia', 'Caribbean Islands', 'Pacific Islands', 'Prefer not to say'];
// const petsTypeOptions = ['None', 'Dog', 'Cat', 'Fish', 'Bird','Rabit', 'Reptile', 'Prefer not to say'];
// const hobbiesOptions = ['None',
//   'Biking', 'Fashion', 'Design', 'Crafts', 'Traveling', 'Camping', 'Gourmet food', 'Physical fitness', 'Music', 
//   'Sewing', 'Art', 'Antiques', 'Reading', 'Prefer not to answer'
// ];
// const industryOptions = ['None',
//   'Agriculture', 'Utilities', 'Finance', 'Entertainment', 'Education', 'Health care', 'Information services', 'Data processing',
//   'Food services', 'Hotel services', 'Legal services', 'Publishing', 'Military', 'Prefer not to say'
// ];

// /*  //------------------------------------------------ */
//  const demographicFields = [
//  { label: 'First Name', name: 'firstName', type: 'input', inputType: 'text', placeholder: 'Enter first name', validate: [validateRequired] },
//   { label: 'Middle Name', name: 'middleName', type: 'input', inputType: 'text', placeholder: 'Enter middle name', validate: [ validateMiddleName] },
//   { label: 'Last Name', name: 'lastName', type: 'input', inputType: 'text', placeholder: 'Enter last name', validate: [validateRequired] },
//   { label: 'Date of Birth', name: 'dob', type: 'input', inputType: 'date', placeholder: 'Enter date of birth', validate: [validateDOB] },
//   { label: 'Age', name: 'age', type: 'input', inputType: 'number', placeholder: 'Enter your age', validate: [ validateAge ] },
//  { label: 'Gender', name: 'gender', type: 'select', options: genderOptions, validate: [validateRequired] },
//   { label: 'Ethnicity', name: 'ethnicity', type: 'selectWithOther', options: ethnicityOptions, validate: [validateRequired] },
//   { label: 'Income', name: 'income', type: 'select', options: incomeOptions, validate: [validateRequired] },
//   { label: 'Employment Status', name: 'employmentStatus', type: 'selectWithOther', options: employmentStatusOptions, validate: [validateRequired] },
//   { label: 'Education Level', name: 'educationLevel', type: 'selectWithOther', options: educationLevelOptions, validate: [validateRequired] },
//   { label: 'Address', name: 'address', type: 'input', inputType: 'text', placeholder: 'Enter address', validate: [validateRequired] },
//   { label: 'City', name: 'city', type: 'input', inputType: 'text', placeholder: 'Enter city', validate: [ validateCityCountryProfession] },
//   { label: 'State', name: 'state', type: 'select', options: stateOptions, validate: [validateRequired] },
//   { label: 'ZIP Code', name: 'zip', type: 'input', inputType: 'text', placeholder: 'Enter ZIP code', validate: [ validateZipCode] },
//   { label: 'Country', name: 'country', type: 'selectWithOther', options: countryOptions, validate: [ validateCityCountryProfession] },
//  { label: 'Where Do You Reside', name: 'residency', type: 'selectWithOther', options: residencyOptions, validate: [ validateCityCountryProfession] },
// { label: 'Phone Number', name: 'phoneNumber', type: 'input', inputType: 'text', placeholder: 'Enter phone number', validate: [ validatePhoneNumber] },
//  { label: 'Email', name: 'email', type: 'input', inputType: 'email', placeholder: 'Enter email', validate: [ validateEmail] },
//  { label: 'Country of Birth', name: 'countryOfBirth', type: 'selectWithOther', options: countryOptions, validate: [ validateCityCountryProfession] },
//  { label: 'Citizenship', name: 'citizenship', type: 'selectWithOther', options: countryOptions, validate: [ validateCityCountryProfession] },
//  { label: '1st Languages', name: '1stlanguages', type: 'selectWithOther', options: languageOptions, validate: [validateRequired] },  

//   { label: '2nd Languages', name: '2languages2', type: 'multiSelect', options: languageOptions, validate: [validateRequired] }, //multiSelect
//    //{ label: '2nd Languages', name: '2languages', type: 'selectWithOther', options: languageOptions, validate: [validateRequired ] },

//     { label: 'Profession', name: 'profession', type: 'selectWithOther', options: industryOptions, validate: [ validateCityCountryProfession] },
//   { label: 'Marital Status', name: 'maritalStatus', type: 'select', options: maritalStatusOptions, validate: [validateRequired] },
//   { label: 'Number of Dependents', name: 'dependents', type: 'input', inputType: 'number', placeholder: 'Enter number of natural kids', validate: [ validatePositiveNumber]},
//   { label: 'Natural Kids', name: 'naturalKids', type: 'input', inputType: 'number', placeholder: 'Enter number of natural kids', validate: [ validatePositiveNumber] },
//   { label: 'Adopted Kids', name: 'adoptedKids', type: 'input', inputType: 'number', placeholder: 'Enter number of adopted kids', validate: [ validatePositiveNumber] },
  
//   //  { label: 'What type of Pets Do You Have', name: 'petsTypes1', type: 'multiSelect', options: petsTypeOptions, validate: [validateRequired ] }, //multiSelect  
//  { label: 'What type of Pets Do You Have', name: 'petsTypes', type: 'multiSelectWithOther', options: petsTypeOptions, validate: [ validateMultiSelectField] },

//   { label: 'Pets', name: 'pets', type: 'input', inputType: 'number', placeholder: 'Enter number of pets', validate: [ validatePositiveNumber] },
//   { label: 'Hobbies', name: 'hobbies', type: 'multiSelectWithOther', options: hobbiesOptions, validate: [validateMultiSelectField] }  
//  ] 
//  export  {demographicFields} ;

//+++++++++++JS version+++++++++++++++++
//   // src/data/demographicFields.js
//   // JS version

// //last workting with out multi  
// //import Select from 'react-select';
// //  import validations from '../utils/validation';
//  import * as validations from '../utils/validation';
// import {validateEmail,
//   validatePhoneNumber,
//   validateZipCode,
//   validateRequired,
//   validateCityCountryProfession,
//   validateDOB,
//   validateAge,
//   sendVerificationEmail,
// validatePositiveNumber,
// isCapsLockOn,
// validatePassword,
// validateText,
// validateMiddleName,
// validateAgeWithDOB} from '../utils/validation';

//  const genderOptions = ['Male', 'Female','HomoSexual','BiSexual','TransSexual', 'Prefer not to say'];
// const ethnicityOptions = ['White','Caucasian','African-American', 'Black',' Native Hawaiian or Pacific Islander', 'Asian', 'Hispanic', 'Prefer not to say'];
// const incomeOptions = ['<20,000', '20,000-50,000', '50,000-100,000', '100,000+', 'Prefer not to say'];
// const employmentStatusOptions = ['Employed', 'Unemployed', 'Retired', 'Self-Employed','Seeking opportunities', 'Prefer not to say'];
// const educationLevelOptions = ['High School', 'Associate Degree', 'Bachelor\'s Degree', 'Master\'s Degree', 'Doctorate','Prefer not to say'];
// const maritalStatusOptions = ['Single', 'Married', 'Divorced', 'Widowed','Prefer not to say'];
// const languageOptions = ['English', 'Spanish','Portuguese','French','Mandarin', 'Chinese', 'Hindi', 'Arabic','Prefer not to say'];
// const stateOptions = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];
// const countryOptions = ['United States', 'Canada', 'Mexico', 'United Kingdom', 'Germany', 'France', 'India', 'China', 'Japan'];
// const residencyOptions =['North America', 'Europe','Africa','South America','AsiaAustralia','Caribbean Islands', 'Pacific Islands', 'Prefer not to say' ];
// const petsTypeOptions =['None','Dog','Cat','Fish', 'Bird', 'Reptile', 'Prefer not to say'];
// const hobbiesOptions=['Biking', 'Fashion', 'design', 'Crafts', 'Traveling', 'Camping', 'Gourmet food', 'Physical fitness', 'Music', 'Sewing', 'Art', 'Antiques', 'Reading', 'Prefer not to answer']; 
// const industryOptions=['Agriculture', 'Utilities', 'Finance', 'Entertainment', 'Education', 'Health care', 'Information services,', 'Data processing', 'Food services', 'Hotel services', 'Legal services', 'Publishing', 'Military', 'Prefer not to say'];
 
// /*  //------------------------------------------------ */
//  const demographicFields = [
//  { label: 'First Name', name: 'firstName', type: 'input', inputType: 'text', placeholder: 'Enter first name', validate: [validateRequired] },
//   { label: 'Middle Name', name: 'middleName', type: 'input', inputType: 'text', placeholder: 'Enter middle name', validate: [ validateMiddleName] },
//   { label: 'Last Name', name: 'lastName', type: 'input', inputType: 'text', placeholder: 'Enter last name', validate: [validateRequired] },
//   { label: 'Date of Birth', name: 'dob', type: 'input', inputType: 'date', placeholder: 'Enter date of birth', validate: [validateDOB] },
//   { label: 'Age', name: 'age', type: 'input', inputType: 'number', placeholder: 'Enter your age', validate: [ validateAge ] },
//  { label: 'Gender', name: 'gender', type: 'select', options: genderOptions, validate: [validateRequired] },
//   { label: 'Ethnicity', name: 'ethnicity', type: 'selectWithOther', options: ethnicityOptions, validate: [validateRequired] },
//   { label: 'Income', name: 'income', type: 'select', options: incomeOptions, validate: [validateRequired] },
//   { label: 'Employment Status', name: 'employmentStatus', type: 'selectWithOther', options: employmentStatusOptions, validate: [validateRequired] },
//   { label: 'Education Level', name: 'educationLevel', type: 'selectWithOther', options: educationLevelOptions, validate: [validateRequired] },
//   { label: 'Address', name: 'address', type: 'input', inputType: 'text', placeholder: 'Enter address', validate: [validateRequired] },
//   { label: 'City', name: 'city', type: 'input', inputType: 'text', placeholder: 'Enter city', validate: [ validateCityCountryProfession] },
//   { label: 'State', name: 'state', type: 'select', options: stateOptions, validate: [validateRequired] },
//   { label: 'ZIP Code', name: 'zip', type: 'input', inputType: 'text', placeholder: 'Enter ZIP code', validate: [ validateZipCode] },
//   { label: 'Country', name: 'country', type: 'selectWithOther', options: countryOptions, validate: [ validateCityCountryProfession] },
//  { label: 'Where Do You Reside', name: 'residency', type: 'selectWithOther', options: residencyOptions, validate: [ validateCityCountryProfession] },
// { label: 'Phone Number', name: 'phoneNumber', type: 'input', inputType: 'text', placeholder: 'Enter phone number', validate: [ validatePhoneNumber] },
//  { label: 'Email', name: 'email', type: 'input', inputType: 'email', placeholder: 'Enter email', validate: [ validateEmail] },
//  { label: 'Country of Birth', name: 'countryOfBirth', type: 'selectWithOther', options: countryOptions, validate: [ validateCityCountryProfession] },
//  { label: 'Citizenship', name: 'citizenship', type: 'selectWithOther', options: countryOptions, validate: [ validateCityCountryProfession] },
//  { label: '1st Languages', name: '1stlanguages', type: 'selectWithOther', options: languageOptions, validate: [validateRequired] },  

//   { label: '2nd Languages', name: '2languages2', type: 'multiSelect', options: languageOptions, validate: [validateRequired] }, //multiSelect
//    //{ label: '2nd Languages', name: '2languages', type: 'selectWithOther', options: languageOptions, validate: [validateRequired ] },

//     { label: 'Profession', name: 'profession', type: 'selectWithOther', options: industryOptions, validate: [ validateCityCountryProfession] },
//   { label: 'Marital Status', name: 'maritalStatus', type: 'select', options: maritalStatusOptions, validate: [validateRequired] },
//   { label: 'Number of Dependents', name: 'dependents', type: 'input', inputType: 'number', placeholder: 'Enter number of natural kids', validate: [ validatePositiveNumber]},
//   { label: 'Natural Kids', name: 'naturalKids', type: 'input', inputType: 'number', placeholder: 'Enter number of natural kids', validate: [ validatePositiveNumber] },
//   { label: 'Adopted Kids', name: 'adoptedKids', type: 'input', inputType: 'number', placeholder: 'Enter number of adopted kids', validate: [ validatePositiveNumber] },
  
//    { label: 'What type of Pets Do You Have', name: 'petsTypes1', type: 'multiSelect', options: petsTypeOptions, validate: [validateRequired ] }, //multiSelect  
//  // { label: 'What type of Pets Do You Have', name: 'petsTypes', type: 'selectWithOther', options: petsTypeOptions, validate: [ validateCityCountryProfession] },

//   { label: 'Pets', name: 'pets', type: 'input', inputType: 'number', placeholder: 'Enter number of pets', validate: [ validatePositiveNumber] },
//   { label: 'Hobbies', name: 'hobbies', type: 'multiSelect', options: hobbiesOptions, validate: [validateRequired] }  
//  ] 
//  export  {demographicFields} ;

//+++++++++++JS version+++++++++++++++++
  // src/data/demographicFields.js
  // JS version

//last workting with out multi  
//import Select from 'react-select';
//  import validations from '../utils/validation';
//  import * as validations from '../utils/validation';
// import {validateEmail,
//   validatePhoneNumber,
//   validateZipCode,
//   validateRequired,
//   validateCityCountryProfession,
//   validateDOB,
//   validateAge,
//   sendVerificationEmail,
// validatePositiveNumber,
// isCapsLockOn,
// validatePassword,
// validateText,
// validateMiddleName,
// validateAgeWithDOB} from '../utils/validation';

//  const genderOptions = ['Male', 'Female','HomoSexual','BiSexual','TransSexual', 'Prefer not to say'];
// const ethnicityOptions = ['White','Caucasian','African-American', 'Black',' Native Hawaiian or Pacific Islander', 'Asian', 'Hispanic', 'Prefer not to say'];
// const incomeOptions = ['<20,000', '20,000-50,000', '50,000-100,000', '100,000+', 'Prefer not to say'];
// const employmentStatusOptions = ['Employed', 'Unemployed', 'Retired', 'Self-Employed','Seeking opportunities', 'Prefer not to say'];
// const educationLevelOptions = ['High School', 'Associate Degree', 'Bachelor\'s Degree', 'Master\'s Degree', 'Doctorate','Prefer not to say'];
// const maritalStatusOptions = ['Single', 'Married', 'Divorced', 'Widowed','Prefer not to say'];
// const languageOptions = ['English', 'Spanish','Portuguese','French','Mandarin', 'Chinese', 'Hindi', 'Arabic','Prefer not to say'];
// const stateOptions = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];
// const countryOptions = ['United States', 'Canada', 'Mexico', 'United Kingdom', 'Germany', 'France', 'India', 'China', 'Japan'];
// const residencyOptions =['North America', 'Europe','Africa','South America','AsiaAustralia','Caribbean Islands', 'Pacific Islands', 'Prefer not to say' ];
// const petsTypeOptions =['None','Dog','Cat','Fish', 'Bird', 'Reptile', 'Prefer not to say'];
// const hobbiesOptions=['Biking', 'Fashion', 'design', 'Crafts', 'Traveling', 'Camping', 'Gourmet food', 'Physical fitness', 'Music', 'Sewing', 'Art', 'Antiques', 'Reading', 'Prefer not to answer']; 
// const industryOptions=['Agriculture', 'Utilities', 'Finance', 'Entertainment', 'Education', 'Health care', 'Information services,', 'Data processing', 'Food services', 'Hotel services', 'Legal services', 'Publishing', 'Military', 'Prefer not to say'];
 
// /*  //------------------------------------------------ */
//  const demographicFields = [
//  { label: 'First Name', name: 'firstName', type: 'input', inputType: 'text', placeholder: 'Enter first name', validate: [validateRequired] },
//   { label: 'Middle Name', name: 'middleName', type: 'input', inputType: 'text', placeholder: 'Enter middle name', validate: [ validateMiddleName] },
//   { label: 'Last Name', name: 'lastName', type: 'input', inputType: 'text', placeholder: 'Enter last name', validate: [validateRequired] },
//   { label: 'Date of Birth', name: 'dob', type: 'input', inputType: 'date', placeholder: 'Enter date of birth', validate: [validateDOB] },
//   { label: 'Age', name: 'age', type: 'input', inputType: 'number', placeholder: 'Enter your age', validate: [ validateAge ] },
//  { label: 'Gender', name: 'gender', type: 'select', options: genderOptions, validate: [validateRequired] },
//   { label: 'Ethnicity', name: 'ethnicity', type: 'selectWithOther', options: ethnicityOptions, validate: [validateRequired] },
//   { label: 'Income', name: 'income', type: 'select', options: incomeOptions, validate: [validateRequired] },
//   { label: 'Employment Status', name: 'employmentStatus', type: 'selectWithOther', options: employmentStatusOptions, validate: [validateRequired] },
//   { label: 'Education Level', name: 'educationLevel', type: 'selectWithOther', options: educationLevelOptions, validate: [validateRequired] },
//   { label: 'Address', name: 'address', type: 'input', inputType: 'text', placeholder: 'Enter address', validate: [validateRequired] },
//   { label: 'City', name: 'city', type: 'input', inputType: 'text', placeholder: 'Enter city', validate: [ validateCityCountryProfession] },
//   { label: 'State', name: 'state', type: 'select', options: stateOptions, validate: [validateRequired] },
//   { label: 'ZIP Code', name: 'zip', type: 'input', inputType: 'text', placeholder: 'Enter ZIP code', validate: [ validateZipCode] },
//   { label: 'Country', name: 'country', type: 'selectWithOther', options: countryOptions, validate: [ validateCityCountryProfession] },
//  { label: 'Where Do You Reside', name: 'residency', type: 'selectWithOther', options: residencyOptions, validate: [ validateCityCountryProfession] },
// { label: 'Phone Number', name: 'phoneNumber', type: 'input', inputType: 'text', placeholder: 'Enter phone number', validate: [ validatePhoneNumber] },
//  { label: 'Email', name: 'email', type: 'input', inputType: 'email', placeholder: 'Enter email', validate: [ validateEmail] },
//  { label: 'Country of Birth', name: 'countryOfBirth', type: 'selectWithOther', options: countryOptions, validate: [ validateCityCountryProfession] },
//  { label: 'Citizenship', name: 'citizenship', type: 'selectWithOther', options: countryOptions, validate: [ validateCityCountryProfession] },
//  { label: '1st Languages', name: '1stlanguages', type: 'selectWithOther', options: languageOptions, validate: [validateRequired] },  

//   { label: '2nd Languages', name: '2languages2', type: 'multiSelect', options: languageOptions, validate: [validateRequired] }, //multiSelect
//    //{ label: '2nd Languages', name: '2languages', type: 'selectWithOther', options: languageOptions, validate: [validateRequired ] },

//     { label: 'Profession', name: 'profession', type: 'selectWithOther', options: industryOptions, validate: [ validateCityCountryProfession] },
//   { label: 'Marital Status', name: 'maritalStatus', type: 'select', options: maritalStatusOptions, validate: [validateRequired] },
//   { label: 'Number of Dependents', name: 'dependents', type: 'input', inputType: 'number', placeholder: 'Enter number of natural kids', validate: [ validatePositiveNumber]},
//   { label: 'Natural Kids', name: 'naturalKids', type: 'input', inputType: 'number', placeholder: 'Enter number of natural kids', validate: [ validatePositiveNumber] },
//   { label: 'Adopted Kids', name: 'adoptedKids', type: 'input', inputType: 'number', placeholder: 'Enter number of adopted kids', validate: [ validatePositiveNumber] },
  
//    { label: 'What type of Pets Do You Have', name: 'petsTypes1', type: 'multiSelect', options: petsTypeOptions, validate: [validateRequired ] }, //multiSelect  
//  // { label: 'What type of Pets Do You Have', name: 'petsTypes', type: 'selectWithOther', options: petsTypeOptions, validate: [ validateCityCountryProfession] },

//   { label: 'Pets', name: 'pets', type: 'input', inputType: 'number', placeholder: 'Enter number of pets', validate: [ validatePositiveNumber] },
//   { label: 'Hobbies', name: 'hobbies', type: 'multiSelect', options: hobbiesOptions, validate: [validateRequired] }  
//  ] 
//  export  {demographicFields} ;


 //=========================================
 /* const demographicFields = [
  { label: 'First Name', name: 'firstName', type: 'input', inputType: 'text', placeholder: 'Enter first name', validate: [validateRequired] },
  { label: 'Middle Name', name: 'middleName', type: 'input', inputType: 'text', placeholder: 'Enter middle name', validate: [validateMiddleName] },
  { label: 'Last Name', name: 'lastName', type: 'input', inputType: 'text', placeholder: 'Enter last name', validate: [validateRequired] },
  { label: 'Date of Birth', name: 'dob', type: 'input', inputType: 'date', placeholder: 'Enter date of birth', validate: [validateDOB] },
  { label: 'Age', name: 'age', type: 'input', inputType: 'number', placeholder: 'Enter your age', validate: [validateAge] },
  { label: 'Gender', name: 'gender', type: 'select', options: genderOptions, validate: [validateRequired] },
  { label: 'Ethnicity', name: 'ethnicity', type: 'selectWithOther', options: ethnicityOptions, validate: [validateRequired] },
  { label: 'Income', name: 'income', type: 'select', options: incomeOptions, validate: [validateRequired] },
  { label: 'Employment Status', name: 'employmentStatus', type: 'selectWithOther', options: employmentStatusOptions, validate: [validateRequired] },
  { label: 'Education Level', name: 'educationLevel', type: 'selectWithOther', options: educationLevelOptions, validate: [validateRequired] },
  { label: 'Address', name: 'address', type: 'input', inputType: 'text', placeholder: 'Enter address', validate: [validateRequired] },
  { label: 'City', name: 'city', type: 'input', inputType: 'text', placeholder: 'Enter city', validate: [validateCityCountryProfession] },
  { label: 'State', name: 'state', type: 'select', options: stateOptions, validate: [validateRequired] },
  { label: 'ZIP Code', name: 'zip', type: 'input', inputType: 'text', placeholder: 'Enter ZIP code', validate: [validateZipCode] },
  { label: 'Country', name: 'country', type: 'selectWithOther', options: countryOptions, validate: [validateRequired, validateCityCountryProfession] },
  { label: 'RWhere Do You Reside', name: 'residency', type: 'selectWithOther', options: residencyOptions, validate: [validateRequired, validateCityCountryProfession] },
  { label: 'Phone Number', name: 'phoneNumber', type: 'input', inputType: 'text', placeholder: 'Enter phone number', validate: [validateRequired, validatePhoneNumber] },
  { label: 'Email', name: 'email', type: 'input', inputType: 'email', placeholder: 'Enter email', validate: [validateRequired, validateEmail] },
  { label: 'Country of Birth', name: 'countryOfBirth', type: 'selectWithOther', options: countryOptions, validate: [validateRequired, validateCityCountryProfession] },
  { label: 'Citizenship', name: 'citizenship', type: 'selectWithOther', options: countryOptions, validate: [validateRequired, validateCityCountryProfession] },
  { label: '1st Languages', name: '1stlanguages', type: 'selectWithOther', options: languageOptions, validate: [validateRequired] },

  { label: '2nd Languages', name: '2languages2', type: 'multiSelect', options: languageOptions, validate: [validateRequired] }, //multiSelect
  { label: '2nd Languages', name: '2languages', type: 'selectWithOther', options: languageOptions, validate: [validateRequired, validateRequired] },

  { label: 'Profession', name: 'profession', type: 'selectWithOther', options: industryOptions, validate: [validateRequired, validateCityCountryProfession] },
  { label: 'Marital Status', name: 'maritalStatus', type: 'select', options: maritalStatusOptions, validate: [validateRequired] },
  { label: 'Number of Dependents', name: 'dependents', type: 'input', inputType: 'number', placeholder: 'Enter number of natural kids', validate: [validateRequired, validatePositiveNumber]},
  { label: 'Natural Kids', name: 'naturalKids', type: 'input', inputType: 'number', placeholder: 'Enter number of natural kids', validate: [validateRequired, validatePositiveNumber] },
  { label: 'Adopted Kids', name: 'adoptedKids', type: 'input', inputType: 'number', placeholder: 'Enter number of adopted kids', validate: [validations.validateRequired, validations.validatePositiveNumber] },
  
  { label: 'What type of Pets Do You Have', name: 'petsTypes1', type: 'multiSelect', options: petsTypeOptions, validate: [validations.validateRequired ] }, //multiSelect
  { label: 'What type of Pets Do You Have', name: 'petsTypes', type: 'selectWithOther', options: petsTypeOptions, validate: [validations.validateRequired, validations.validateCityCountryProfession] },

  { label: 'Pets', name: 'pets', type: 'input', inputType: 'number', placeholder: 'Enter number of pets', validate: [validations.validateRequired, validations.validatePositiveNumber] },
  { label: 'Hobbies', name: 'hobbies', type: 'selectWithOther', options: hobbiesOptions, validate: [validations.validateRequired, validations.validateRequired] },
 
 ]
 
  export  {demographicFields} ;
  */
//=========================================

  

/* // src/data/demographicFields.js
import * as validations from '../utils/validation';
 import validations from '../utils/validation';
const genderOptions = ['Male', 'Female', 'HomoSexual', 'BiSexual', 'TransSexual', 'Refuse to Disclose'];
const ethnicityOptions = ['White', 'Black', 'Asian', 'Hispanic', 'Refuse to Disclose'];
const incomeOptions = ['<20,000', '20,000-50,000', '50,000-100,000', '100,000+'];
const employmentStatusOptions = ['Employed', 'Unemployed', 'Retired', 'Self-Employed'];
const educationLevelOptions = ['High School', 'Associate Degree', 'Bachelor\'s Degree', 'Master\'s Degree', 'Doctorate', 'Refuse to Disclose'];
const maritalStatusOptions = ['Single', 'Married', 'Divorced', 'Widowed'];
const languageOptions = ['English', 'Spanish', 'Chinese', 'Hindi', 'Arabic'];
const stateOptions = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];
const countryOptions = ['United States', 'Canada', 'Mexico', 'United Kingdom', 'Germany', 'France', 'India', 'China', 'Japan'];

const demographicFields = [
  { label: 'First Name', name: 'firstName', type: 'input', inputType: 'text', placeholder: 'Enter first name', validate: validations.validateRequired },
  { label: 'Middle Name', name: 'middleName', type: 'input', inputType: 'text', placeholder: 'Enter middle name', validate: () => [] },
  { label: 'Last Name', name: 'lastName', type: 'input', inputType: 'text', placeholder: 'Enter last name', validate: validations.validateRequired },
  { label: 'Date of Birth', name: 'dob', type: 'input', inputType: 'date', placeholder: 'Enter date of birth', validate: validations.validateDOB },
  { label: 'Age', name: 'age', type: 'input', inputType: 'number', placeholder: 'Enter your age', validate: validations.validateAgeWithDOB },
  { label: 'Gender', name: 'gender', type: 'select', options: genderOptions, validate: validations.validateRequired },
  { label: 'Ethnicity', name: 'ethnicity', type: 'selectWithOther', options: ethnicityOptions, validate: validations.validateRequired },
  { label: 'Income', name: 'income', type: 'select', options: incomeOptions, validate: validations.validateRequired },
  { label: 'Employment Status', name: 'employmentStatus', type: 'selectWithOther', options: employmentStatusOptions, validate: validations.validateRequired },
  { label: 'Education Level', name: 'educationLevel', type: 'selectWithOther', options: educationLevelOptions, validate: validations.validateRequired },
  { label: 'Address', name: 'address', type: 'input', inputType: 'text', placeholder: 'Enter address', validate: validations.validateRequired },
  { label: 'City', name: 'city', type: 'input', inputType: 'text', placeholder: 'Enter city', validate: validations.validateCityCountryProfession },
  { label: 'State', name: 'state', type: 'select', options: stateOptions, validate: validations.validateRequired },
  { label: 'ZIP Code', name: 'zip', type: 'input', inputType: 'text', placeholder: 'Enter ZIP code', validate: validations.validateZipCode },
  { label: 'Country', name: 'country', type: 'selectWithOther', options: countryOptions, validate: validations.validateCityCountryProfession },
  { label: 'Phone Number', name: 'phoneNumber', type: 'input', inputType: 'text', placeholder: 'Enter phone number', validate: validations.validatePhoneNumber },
  { label: 'Email', name: 'email', type: 'input', inputType: 'email', placeholder: 'Enter email', validate: validations.validateEmail },
  { label: 'Country of Birth', name: 'countryOfBirth', type: 'selectWithOther', options: countryOptions, validate: validations.validateCityCountryProfession },
  { label: 'Citizenship', name: 'citizenship', type: 'selectWithOther', options: countryOptions, validate: validations.validateCityCountryProfession },
  { label: '1st Language', name: 'firstLanguage', type: 'selectWithOther', options: languageOptions, validate: validations.validateRequired },
  { label: '2nd Languages', name: 'secondLanguages', type: 'multiSelect', options: languageOptions, validate: validations.validateRequired },
  { label: 'Profession', name: 'profession', type: 'selectWithOther', options: stateOptions, validate: validations.validateCityCountryProfession },
  { label: 'Marital Status', name: 'maritalStatus', type: 'select', options: maritalStatusOptions, validate: validations.validateRequired },
  { label: 'Natural Kids', name: 'naturalKids', type: 'input', inputType: 'number', placeholder: 'Enter number of natural kids', validate: validations.validatePositiveNumber },
  { label: 'Adopted Kids', name: 'adoptedKids', type: 'input', inputType: 'number', placeholder: 'Enter number of adopted kids', validate: validations.validatePositiveNumber },
  { label: 'Pets', name: 'pets', type: 'input', inputType: 'number', placeholder: 'Enter number of pets', validate: validations.validatePositiveNumber },
];

export { demographicFields }; */



 