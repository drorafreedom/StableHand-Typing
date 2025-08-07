// src/utils/validation.js
import { getAuth, sendEmailVerification } from 'firebase/auth';
//-----------------------validateEmail-----------
/* export const validateEmail = (email) => {
  const errors = [];
  if (!email.includes('@')) {
    errors.push('Email must contain @');
  }
  if (!email.includes('.')) {
    errors.push('Email must contain a domain, e.g., ".com"');
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    errors.push('Invalid email format');//  under defined 
  }
  return errors;
}; */
//-------------------validateEmail --------------

export const validateEmail = (email) => {
  const errors = [];
  if (email === undefined || email === null || email.trim() === '') {
    errors.push('Email is required.');
  } else {
    if (!email.includes('@')) {
      errors.push('Email must contain @');
    }
    if (!email.includes('.')) {
      errors.push('Email must contain a domain, e.g., ".com"');
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      errors.push('Invalid email format');
    }
  }
  return errors;
};

//---------------------------------------validatePhoneNumber

/* export const validatePhoneNumber = (phoneNumber) => {
  const errors = [];
  const phoneRegex = /^\d{10}$/; // Exact 10 digits for US format
  if (!phoneRegex.test(phoneNumber)) {
    errors.push('Phone number must be exactly 10 digits long.');
  }
  return errors;
}; */
//---------------------------------------validatePhoneNumber
/* export const validatePhoneNumber = (phoneNumber) => {
  const errors = [];
  if (!phoneNumber || typeof phoneNumber !== 'string') return errors;
  const phoneRegex = /^\d{10}$/; // Exact 10 digits for US format
  if (!phoneRegex.test(phoneNumber)) {
    errors.push('Phone number must be exactly 10 digits long.');
  }
  return errors;
}; */
//---------------------------------------validatePhoneNumber
export const validatePhoneNumber = (phoneNumber) => {
  const errors = [];
  if (phoneNumber === undefined || phoneNumber === null || phoneNumber.trim() === '') {
    errors.push('Phone number is required.');
  } else {
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      errors.push('Phone number must be exactly 10 digits long.');
    }
  }
  return errors;
};

//---------------------------------------validateZipCode
/* export const validateZipCode = (zip) => {
  const errors = [];
  const zipRegex = /^\d{5}(-\d{4})?$/; // Matches US ZIP code format
  if (!zipRegex.test(zip)) {
    errors.push('Invalid ZIP code format.');
  }
  return errors;
}; */
//---------------------------------------validateZipCode
export const validateZipCode = (zip) => {
  const errors = [];
  if (!zip || typeof zip !== 'string' || zip.trim() === '') {
    return ['This field is required.'];
  } else {

  
  if (!zip || typeof zip !== 'string') return errors;
  const zipRegex = /^\d{5}(-\d{4})?$/; // Matches US ZIP code format
  if (!zipRegex.test(zip)) {
    errors.push('Invalid ZIP code format.');
  }
  return errors;
};
}
//---------------------------------------validateRequired
/* export const validateRequired = (value) => {
  const errors = [];
  if (value === null || value.trim() === '') {
    errors.push('This field is required.');
  }
  return errors;
};
//---------------------------------------validateRequired to handle single adn multiple select 
 */// src/utils/validation.js
export const validateRequired = (value) => {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return ['This field is required.'];
    }
  } else {
    if (!value || typeof value !== 'string' || value.trim() === '') {
      return ['This field is required.'];
    }
  }
  return [];
};



//---------------------------------------validateRequired
/* export const validateRequired = (value) => {
  if (!value || typeof value !== 'string' || value.trim() === '') {
    return ['This field is required.'];
  }
  return [];
}; */
//---------------------------------------validateMiddleName
export const validateMiddleName = (value) => {
 
  if (!value || typeof value !== 'string' || value.trim() === '') {
    return ['This field is required, default NA'];
  }
  return [];
};

//---------------------------------------validateMiddleName
/* export const validateMiddleName = (value) => {
  const errors = [];
  if (value === null || value.trim() === '') {
    errors.push('This field is required, default NA');
  }
  return errors;
}; */
//---------------------------------------
export const validateCityCountryProfession = (value) => {
  const errors = [];
   
  if (!value || typeof value !== 'string' || value.trim() === '') {
    return ['This field is required.'];
  } else {
  if (!/^[a-zA-Z\s]+$/.test(value)) {
    errors.push('Only alphabetic characters and spaces are allowed.');
  }
  return errors;
};
}


//---------------------------------------
export const validateText = (value) => {
  const errors = [];
  if (!value || typeof value !== 'string' || value.trim() === '') {
    return ['This field is required.'];
  } else {
  if (!/^[a-zA-Z\s]+$/.test(value)) {
    errors.push('Only alphabetic characters and spaces are allowed.');
  }
  return errors;
};

}
//---------------------------------------
export const validatePassword = (password) => {
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
//---------------------------------------
export const isCapsLockOn = (event) => {
  return event.getModifierState && event.getModifierState('CapsLock');
 };
//---------------------------------------validatePositiveNumber
/* export const validatePositiveNumber = (value) => {
  return value >= 0 ? [] : ['Cannot be negative'];
 }; */
 //--------------------------------------- validatePositiveNumber with underdefined
 /* export const validatePositiveNumber = (value) => {
  const errors = [];
  if (value === undefined || value === null || typeof value !== 'number' || value < 0) {
    errors.push('Must be 0 or more.');
  }
  return errors;
}; */
//--------------------------------------- 
export const validatePositiveNumber = (value) => {
  const errors = [];

  if (!value || typeof value !== 'string' || value.trim() === '') {
    return ['This field is required.'];
  } else {
  if (value === undefined || value === null || value < 0) {
    errors.push('Cannot be negative');
  }
  return errors;
};
}
 //--------------------------------------- 
export const sendVerificationEmail = async (user) => {
  try {
    await sendEmailVerification(user);
    console.log('Verification email sent.');
  } catch (error) {
    console.error('Error sending verification email:', error);
  }
};

// src/utils/validation.js

export const validateDOB = (dob) => {
  const errors = [];
  if (!dob) {
    errors.push('Date of Birth is required.');
    return errors;
  }
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

export const validateAge = (age) => {
  const errors = [];
  if (age === undefined || age === null || age < 8 || age > 120) {
    errors.push('Age must be between 8 and 120 years.');
  }
  return errors;
};

export const compareAgeWithDOB = (dob, age) => {
  const errors = [];
  if (dob && age !== undefined && age !== null) {
    const birthDate = new Date(dob);
    const today = new Date();
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    if (Math.floor(age) !== calculatedAge) {
      errors.push('Age must match Date of Birth.');
    }
  }
  return errors;
};



 

 //--------------------------------------- 
/* export const validateDOB = (dob, formData) => {
  const errors = [];
  if (!dob) {
    errors.push('Date of Birth is required.');
    return errors;
  }
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
}; */

//---------------------------------------validateDOB last good one 
/* export const validateDOB = (dob) => {
  const errors = [];
  const birthDate = new Date(dob);
  
  if (isNaN(birthDate.getTime())) {
    errors.push('Invalid Date of Birth.');
    return errors;
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age < 8 || age > 120) {
    errors.push('Date of Birth must result in an age between 8 and 120 years.');
  }

  return errors;
};
 */
//---------------------------------------
/* 
export const validateAge = (value, dob) => {
  const errors = [];
  
  if (value < 8) {
    errors.push('Age must be at least 8 years.');
  }
  
  if (dob) {
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) {
      errors.push('Invalid Date of Birth.');
    } else {
      const today = new Date();
      let ageFromDOB = today.getFullYear() - birthDate.getFullYear();
      const monthDifference = today.getMonth() - birthDate.getMonth();
      if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        ageFromDOB--;
      }
      if (ageFromDOB !== value) {
        errors.push('Age must match Date of Birth.');
      }
    }
  }
  
  return errors;
}; */

//---------------------------------------validateAge with just 8-129
/* export const validateAge = (age, formData) => {
  const errors = [];
  if (!age || typeof age !== 'string' || age.trim() === '') {
    return ['This field is required.'];
  } else {

  if (!age || typeof age !== 'string' ||age < 8 || age > 120) {
    errors.push('Age must be between 8 and 120 years.');
  };
};
} */
 //---------------------------------------validateAge with just 8-129 last good one 
/* export const validateAge = (value) => {
  const errors = [];

  if (!value || typeof value !== 'string' || value.trim() === '') {
    return ['This field is required.'];
  } else {
  if (value === undefined || value === null || value < 8 || value > 120) {
    errors.push('Age must be between 8 and 120 years');
  }
  return errors;
};
}
 */

//---------------------------------------validateAge with just 8-129 and agasint DOB
/* export const validateAge = (age, formData) => {
  const errors = [];
  if (!age || typeof age !== 'string' || age.trim() === '') {
    return ['This field is required.'];
  } else {

  if (age === undefined || age === null || age < 8 || age > 120) {
    errors.push('Age must be between 8 and 120 years.');
  }
  if (formData.dob) {
    const birthDate = new Date(formData.dob);
    const today = new Date();
    const calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    if (Math.floor(age) !== calculatedAge) {
      errors.push('Age must match Date of Birth.');
    }
  }
  return errors;
};
} */
  //---------------------------------------validateAgeWithDOB
/* export const validateAgeWithDOB = (dob, age) => {
  const errors = [];
  const birthDate = new Date(dob);
  const today = new Date();
  const calculatedAge = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    calculatedAge--;
  }

  if (age !== calculatedAge) {
    errors.push('Age must match Date of Birth.');
  }

  return errors;
}; */
//---------------------------------------validateAgeWithDOB
 /* export const validateAgeWithDOB = (value, formData) => {
  const errors = [];
  const dob = formData.dob;

  if (dob) {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    if (age !== parseInt(value)) {
      errors.push('Age must match Date of Birth.');
    }
  }

  return errors;
};   */
//---------------------------------------validateAgeWithDOB with math floor so we can match age if we use the new validate age or DOB no need for this as it is included there .
/* export const validateAgeWithDOB = (age, dob) => {
  const errors = [];
  if (dob) {
    const birthDate = new Date(dob);
    const today = new Date();
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    if (calculatedAge !== Math.floor(age)) {
      errors.push('Age must match Date of Birth.');
    }
  }
  return errors;
}; */
//---------------------------------------
const validations = {
  validateEmail,
  validatePhoneNumber,
  validateZipCode,
  validateRequired,
  validateMiddleName,
  validateCityCountryProfession,
  validateText,
  validatePassword,
  isCapsLockOn,
  validatePositiveNumber,
  sendVerificationEmail,
  validateDOB,
  validateAge,
validateAgeWithDOB






};

export default validations;

 //--------------------





 


