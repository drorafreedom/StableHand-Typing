//last workting with out multi  
//import Select from 'react-select';
//  import validations from '../utils/validation';
import * as validations from '../utils/validation';
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

 const genderOptions = ['Male', 'Female','HomoSexual','BiSexual','TransSexual', 'Prefer not to say'];
const ethnicityOptions = ['White','Caucasian','African-American', 'Black',' Native Hawaiian or Pacific Islander', 'Asian', 'Hispanic', 'Prefer not to say'];
const incomeOptions = ['<20,000', '20,000-50,000', '50,000-100,000', '100,000+', 'Prefer not to say'];
const employmentStatusOptions = ['Employed', 'Unemployed', 'Retired', 'Self-Employed','Seeking opportunities', 'Prefer not to say'];
const educationLevelOptions = ['High School', 'Associate Degree', 'Bachelor\'s Degree', 'Master\'s Degree', 'Doctorate','Prefer not to say'];
const maritalStatusOptions = ['Single', 'Married', 'Divorced', 'Widowed','Prefer not to say'];
const languageOptions = ['English', 'Spanish','Portuguese','French','Mandarin', 'Chinese', 'Hindi', 'Arabic','Prefer not to say'];
const stateOptions = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];
const countryOptions = ['United States', 'Canada', 'Mexico', 'United Kingdom', 'Germany', 'France', 'India', 'China', 'Japan'];
const residencyOptions =['North America', 'Europe','Africa','South America','AsiaAustralia','Caribbean Islands', 'Pacific Islands', 'Prefer not to say' ];
const petsTypeOptions =['None','Dog','Cat','Fish', 'Bird', 'Reptile', 'Prefer not to say'];
const hobbiesOptions=['Biking', 'Fashion', 'design', 'Crafts', 'Traveling', 'Camping', 'Gourmet food', 'Physical fitness', 'Music', 'Sewing', 'Art', 'Antiques', 'Reading', 'Prefer not to answer']; 
const industryOptions=['Agriculture', 'Utilities', 'Finance', 'Entertainment', 'Education', 'Health care', 'Information services,', 'Data processing', 'Food services', 'Hotel services', 'Legal services', 'Publishing', 'Military', 'Prefer not to say'];
 
/*  //------------------------------------------------ */
 const demographicFields = [
 { label: 'First Name', name: 'firstName', type: 'input', inputType: 'text', placeholder: 'Enter first name', validate: [validateRequired] },
  { label: 'Middle Name', name: 'middleName', type: 'input', inputType: 'text', placeholder: 'Enter middle name', validate: [validateRequired, validateMiddleName] },
  { label: 'Last Name', name: 'lastName', type: 'input', inputType: 'text', placeholder: 'Enter last name', validate: [validateRequired] },
  { label: 'Date of Birth', name: 'dob', type: 'input', inputType: 'date', placeholder: 'Enter date of birth', validate: [validateRequired, validateAgeWithDOB, validateDOB] },
  { label: 'Age', name: 'age', type: 'input', inputType: 'number', placeholder: 'Enter your age', validate: [validateRequired, validateAge, validateAgeWithDOB] },
  { label: 'Gender', name: 'gender', type: 'select', options: genderOptions, validate: [validateRequired] },
  { label: 'Ethnicity', name: 'ethnicity', type: 'selectWithOther', options: ethnicityOptions, validate: [validateRequired] },
  { label: 'Income', name: 'income', type: 'select', options: incomeOptions, validate: [validateRequired] },
  { label: 'Employment Status', name: 'employmentStatus', type: 'selectWithOther', options: employmentStatusOptions, validate: [validateRequired] },
  { label: 'Education Level', name: 'educationLevel', type: 'selectWithOther', options: educationLevelOptions, validate: [validateRequired] },
  { label: 'Address', name: 'address', type: 'input', inputType: 'text', placeholder: 'Enter address', validate: [validateRequired] },
  { label: 'City', name: 'city', type: 'input', inputType: 'text', placeholder: 'Enter city', validate: [validateRequired, validateCityCountryProfession] },
  { label: 'State', name: 'state', type: 'select', options: stateOptions, validate: [validateRequired] },
  { label: 'ZIP Code', name: 'zip', type: 'input', inputType: 'text', placeholder: 'Enter ZIP code', validate: [validateRequired, validateZipCode] },
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
  { label: 'Adopted Kids', name: 'adoptedKids', type: 'input', inputType: 'number', placeholder: 'Enter number of adopted kids', validate: [validateRequired, validatePositiveNumber] },
  
  { label: 'What type of Pets Do You Have', name: 'petsTypes1', type: 'multiSelect', options: petsTypeOptions, validate: [validateRequired ] }, //multiSelect */
  { label: 'What type of Pets Do You Have', name: 'petsTypes', type: 'selectWithOther', options: petsTypeOptions, validate: [validateRequired, validateCityCountryProfession] },

  { label: 'Pets', name: 'pets', type: 'input', inputType: 'number', placeholder: 'Enter number of pets', validate: [validateRequired, validatePositiveNumber] },
  { label: 'Hobbies', name: 'hobbies', type: 'selectWithOther', options: hobbiesOptions, validate: [validateRequired, validateRequired] },
 
 ] 

/* 
 const demographicFields = [
  { label: 'First Name', name: 'firstName', type: 'input', inputType: 'text', placeholder: 'Enter first name', validate: [validateRequired] },
  { label: 'Middle Name', name: 'middleName', type: 'input', inputType: 'text', placeholder: 'Enter middle name', validate: [validateRequired, validateMiddleName] },
  { label: 'Last Name', name: 'lastName', type: 'input', inputType: 'text', placeholder: 'Enter last name', validate: [validateRequired] },
  { label: 'Date of Birth', name: 'dob', type: 'input', inputType: 'date', placeholder: 'Enter date of birth', validate: [validateRequired, validateAgeWithDOB, validateDOB] },
  { label: 'Age', name: 'age', type: 'input', inputType: 'number', placeholder: 'Enter your age', validate: [validateRequired, validateAge, validateAgeWithDOB] },
  { label: 'Gender', name: 'gender', type: 'select', options: genderOptions, validate: [validateRequired] },
  { label: 'Ethnicity', name: 'ethnicity', type: 'selectWithOther', options: ethnicityOptions, validate: [validateRequired] },
  { label: 'Income', name: 'income', type: 'select', options: incomeOptions, validate: [validateRequired] },
  { label: 'Employment Status', name: 'employmentStatus', type: 'selectWithOther', options: employmentStatusOptions, validate: [validateRequired] },
  { label: 'Education Level', name: 'educationLevel', type: 'selectWithOther', options: educationLevelOptions, validate: [validateRequired] },
  { label: 'Address', name: 'address', type: 'input', inputType: 'text', placeholder: 'Enter address', validate: [validateRequired] },
  { label: 'City', name: 'city', type: 'input', inputType: 'text', placeholder: 'Enter city', validate: [validateRequired, validateCityCountryProfession] },
  { label: 'State', name: 'state', type: 'select', options: stateOptions, validate: [validateRequired] },
  { label: 'ZIP Code', name: 'zip', type: 'input', inputType: 'text', placeholder: 'Enter ZIP code', validate: [validateRequired, validateZipCode] },
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
 */
  export  {demographicFields} ;
 
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



 