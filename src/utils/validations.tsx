//+++++++++++JS version+++++++++++++++++
 // src/utils/validations.js 
  // JS version


import { getAuth, sendEmailVerification } from 'firebase/auth';

 const validateEmail = (email) => {
  const errors = [];
  if (!email.includes('@')) {
    errors.push('Email must contain @');
  }
  if (!email.includes('.')) {
    errors.push('Email must contain a domain, e.g., ".com"');
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    errors.push('Invalid email format');
  }
  return errors;
};

 const validatePhoneNumber = (phoneNumber) => {
  const errors = [];
  const phoneRegex = /^\d{10}$/; // Exact 10 digits for US format
  if (!phoneRegex.test(phoneNumber)) {
    errors.push('Phone number must be exactly 10 digits long.');
  }
  return errors;
};

 const validateZipCode = (zip) => {
  const errors = [];
  const zipRegex = /^\d{5}(-\d{4})?$/; // Matches US ZIP code format
  if (!zipRegex.test(zip)) {
    errors.push('Invalid ZIP code format.');
  }
  return errors;
};

 const validateRequired = (value) => {
  const errors = [];
  if (value === null || value.trim() === '') {
    errors.push('This field is required.');
  }
  return errors;
};

exort const validateCityCountryProfession = (value) => {
  const errors = [];
  if (!/^[a-zA-Z\s]+$/.test(value)) {
    errors.push('Only alphabetic characters and spaces are allowed.');
  }
  return errors;
};
 const validateText = (value) => {
  const errors = [];
  if (!/^[a-zA-Z\s]+$/.test(value)) {
    errors.push('Only alphabetic characters and spaces are allowed.');
  }
  return errors;
};
eport const validateDOB = (dob) => {
  const errors = [];
  const birthDate = new Date(dob);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  if (age < 8 || age > 120) {
    errors.push('Date of Birth must result in an age between 8 and 120 years.');
  }
  return errors;
};

 const validatePassword = (password) => {
  const errors = [];
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  return errors;
};

 const isCapsLockOn = (event) => {
  return event.getModifierState && event.getModifierState('CapsLock');
};
 const validatePositiveNumber = (value) => {
  return value >= 0 ? [] : ['Cannot be negative'];
};
 const sendVerificationEmail = async (user) => {
  try {
    await sendEmailVerification(user);
    console.log('Verification email sent.');
  } catch (error) {
    console.error('Error sending verification email:', error);
  }
};
 const validateAge = (value) => {
  return value >= 8 ? [] : ['Age must be at least 8y'];
};

//---------------------------------------

const validations = {
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

};

export default validations;


 
