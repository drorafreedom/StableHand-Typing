// src/components/common/PhoneNumberField.jsx
 // JS version
import React, { useState } from 'react';
import InputField from './InputField';
import Alert from './Alert';
import { validatePhoneNumber } from '../../utils/validation';

const PhoneNumberField = ({ phoneNumber, setPhoneNumber, setPhoneErrors, errors }) => {
  const [inputValue, setInputValue] = useState('');

  // Handle phone number input change
  const handlePhoneNumberChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    // Remove all non-digit characters except for the leading '+'
    const digitsOnly = value.replace(/[^\d+]/g, '');

    let formattedPhoneNumber = digitsOnly;
    let validationErrors = [];

    // Check if the phone number starts with '+'
    if (digitsOnly.startsWith('+')) {
      // Phone number includes country code
      formattedPhoneNumber = digitsOnly;
    } else if (digitsOnly.length === 10) {
      // Assume it's a US number without country code
      formattedPhoneNumber = `+1${digitsOnly}`;
    } else if (digitsOnly.length === 7) {
      // Missing area code, prompt user to add area code
      formattedPhoneNumber = null;
      validationErrors.push('Please add area code.');
    } else {
      // Invalid length
      formattedPhoneNumber = null;
      validationErrors.push('Invalid phone number. Please enter a valid phone number.');
    }

    if (formattedPhoneNumber) {
      setPhoneNumber(formattedPhoneNumber);
      validationErrors = validatePhoneNumber(formattedPhoneNumber);
      setPhoneErrors(validationErrors);
    } else {
      setPhoneNumber('');
      setPhoneErrors(validationErrors);
    }
  };

  return (
    <div className="mb-4">
      <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
        Phone Number
      </label>
      <input
        id="phoneNumber"
        name="phoneNumber"
        type="tel"
        value={inputValue}
        onChange={handlePhoneNumberChange}
        placeholder="Enter your phone number"
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
      />
      {errors && errors.length > 0 &&
        errors.map((error, index) => (
          <Alert key={index} message={error} type="error" />
        ))
      }
    </div>
  );
};

export default PhoneNumberField;
