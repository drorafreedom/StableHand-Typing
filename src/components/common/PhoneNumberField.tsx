
// src/components/common/PhoneNumberField.tsx
// TS version

import React, { useState } from 'react';
import Select, { SingleValue as ReactSelectSingleValue, ActionMeta } from 'react-select';
import ReactCountryFlag from 'react-country-flag';
import InputField from './InputField';
import Alert from './Alert';
import countryCodes from '../../utils/countryCodes';
import { validatePhoneNumber } from '../../utils/validation';
import '../../App.css'; // Import custom styles for react-select

// Define the props for the component
interface PhoneNumberFieldProps {
  phoneNumber: string; // Current full phone number in E.164 format
  setPhoneNumber: (phoneNumber: string) => void; // Callback to update the phone number
  setPhoneErrors: (errors: string[]) => void; // Callback to update validation errors
  errors: string[]; // Array of error messages
}

// Define the structure of a country option
interface CountryOption {
  value: string;
  label: string;
  dial_code: string;
  code: string;
}

const PhoneNumberField: React.FC<PhoneNumberFieldProps> = ({
  phoneNumber,
  setPhoneNumber,
  setPhoneErrors,
  errors,
}) => {
  // State for the selected country
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>({
    value: 'US',
    label: countryCodes['US'].name,
    dial_code: countryCodes['US'].dial_code,
    code: 'US',
  });

  // State for the local phone number (without country code)
  const [localPhoneNumber, setLocalPhoneNumber] = useState<string>('');

  // Prepare country options for react-select
  const countryOptions: CountryOption[] = Object.entries(countryCodes).map(([code, country]) => ({
    value: code,
    label: country.name,
    dial_code: country.dial_code,
    code: country.code,
  }));

  // Custom Option Component for react-select dropdown
  const CountryOption: React.FC<any> = ({ data, innerRef, innerProps }) => (
    <div ref={innerRef} {...innerProps} className="flex items-center px-2 py-1">
      <ReactCountryFlag
        countryCode={data.code}
        svg
        style={{ width: '1.5em', height: '1.5em', marginRight: '0.5em' }}
      />
      <span>
        {data.label} ({data.dial_code})
      </span>
    </div>
  );

  // Custom Single Value Component for react-select
  const SingleValue: React.FC<any> = ({ data }) => (
    <div className="flex items-center">
      <ReactCountryFlag
        countryCode={data.code}
        svg
        style={{ width: '1.5em', height: '1.5em', marginRight: '0.5em' }}
      />
      <span>{data.dial_code}</span>
    </div>
  );

  // Handle country selection change
  const handleCountryChange = (
    selectedOption: ReactSelectSingleValue<CountryOption>
  ) => {
    if (!selectedOption) return;
    setSelectedCountry(selectedOption);
    updateFullPhoneNumber(selectedOption.dial_code, localPhoneNumber);
  };

  // Handle local phone number change
  const handleLocalPhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-numeric characters
    setLocalPhoneNumber(value);
    updateFullPhoneNumber(selectedCountry.dial_code, value);
  };

  // Update the full phone number in E.164 format
  const updateFullPhoneNumber = (dialCode: string, localNumber: string) => {
    const fullPhoneNumber = `${dialCode}${localNumber}`;
    setPhoneNumber(fullPhoneNumber);

    // Validate the phone number
    const validationErrors = validatePhoneNumber(fullPhoneNumber);
    setPhoneErrors(validationErrors);
  };

  return (
    <div className="mb-4">
      <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
        Phone Number
      </label>
      <div className="flex">
        {/* Country Code Dropdown */}
        <div className="w-40">
          <Select
            value={selectedCountry}
            onChange={handleCountryChange}
            options={countryOptions}
            className="react-select-container"
            classNamePrefix="react-select"
            placeholder="Select Country"
            isSearchable
            components={{ Option: CountryOption, SingleValue }}
          />
        </div>
        {/* Local Phone Number Input */}
        <div className="flex-grow ml-2">
          <InputField
            label=""
            name="phoneNumber"
            type="tel"
            value={localPhoneNumber}
            onChange={handleLocalPhoneNumberChange}
            errors={errors}
            placeholder="Enter your phone number"
          />
        </div>
      </div>
      {errors.length > 0 &&
        errors.map((error, index) => <Alert key={index} message={error} type="error" />)}
    </div>
  );
};

export default PhoneNumberField;



//==========JS version+++++++++++++++++
// // src/components/common/PhoneNumberField.jsx 
// // JS version
// // ver 2  fro flexible input to be translated to E.164  Accepts phone numbers in various formats (with or without country code, with dashes, dots, spaces, etc.).
// // Translates any input into the correct E.164 format required by Firebase Authentication.
// // Defaults to the USA country code (+1) if no country code is provided.
// // Handles phone numbers with or without area codes appropriately. 

// import React, { useState } from 'react';
// import Select from 'react-select';
// import ReactCountryFlag from 'react-country-flag';
// import InputField from './InputField';
// import Alert from './Alert';
// import countryCodes from '../../utils/countryCodes';
// import { validatePhoneNumber } from '../../utils/validation';
// import '../../App.css'; // Import custom styles for react-select

// const PhoneNumberField = ({ phoneNumber, setPhoneNumber, setPhoneErrors, errors }) => {
//   const [selectedCountry, setSelectedCountry] = useState({
//     value: 'US',
//     label: countryCodes['US'].name,
//     dial_code: countryCodes['US'].dial_code,
//     code: 'US',
//   });
//   const [localPhoneNumber, setLocalPhoneNumber] = useState('');

//   // Prepare country options for react-select
//   const countryOptions = Object.entries(countryCodes).map(([code, country]) => ({
//     value: code,
//     label: country.name,
//     dial_code: country.dial_code,
//     code: country.code,
//   }));

//   // Custom Option Component
//   const CountryOption = (props) => {
//     const {
//       innerProps,
//       innerRef,
//       data,
//     } = props;
//     return (
//       <div ref={innerRef} {...innerProps} className="flex items-center px-2 py-1">
//         <ReactCountryFlag
//           countryCode={data.code}
//           svg
//           style={{
//             width: '1.5em',
//             height: '1.5em',
//             marginRight: '0.5em',
//           }}
//         />
//         <span>{data.label} ({data.dial_code})</span>
//       </div>
//     );
//   };

//   // Custom Single Value Component
//   const SingleValue = (props) => {
//     const { data } = props;
//     return (
//       <div className="flex items-center">
//         <ReactCountryFlag
//           countryCode={data.code}
//           svg
//           style={{
//             width: '1.5em',
//             height: '1.5em',
//             marginRight: '0.5em',
//           }}
//         />
//         <span>{data.dial_code}</span>
//       </div>
//     );
//   };

//   // Handle country selection change
//   const handleCountryChange = (selectedOption) => {
//     setSelectedCountry(selectedOption);
//     updateFullPhoneNumber(selectedOption.dial_code, localPhoneNumber);
//   };

//   // Handle local phone number change
//   const handleLocalPhoneNumberChange = (e) => {
//     const value = e.target.value.replace(/\D/g, ''); // Remove non-numeric characters
//     setLocalPhoneNumber(value);
//     updateFullPhoneNumber(selectedCountry.dial_code, value);
//   };

//   const updateFullPhoneNumber = (dialCode, localNumber) => {
//     const fullPhoneNumber = `${dialCode}${localNumber}`;
//     setPhoneNumber(fullPhoneNumber);

//     // Validate the phone number
//     const errors = validatePhoneNumber(fullPhoneNumber);
//     setPhoneErrors(errors);
//   };
//   const [inputValue, setInputValue] = useState('');

//   // Handle phone number input change
//   const handlePhoneNumberChange = (e) => {
//     const value = e.target.value;
//     setInputValue(value);

//     // Remove all non-digit characters except for the leading '+'
//     const digitsOnly = value.replace(/[^\d+]/g, '');

//     let formattedPhoneNumber = digitsOnly;
//     let validationErrors = [];

//     // Check if the phone number starts with '+'
//     if (digitsOnly.startsWith('+')) {
//       // Phone number includes country code
//       formattedPhoneNumber = digitsOnly;
//     } else if (digitsOnly.length === 10) {
//       // Assume it's a US number without country code
//       formattedPhoneNumber = `+1${digitsOnly}`;
//     } else if (digitsOnly.length === 7) {
//       // Missing area code, prompt user to add area code
//       formattedPhoneNumber = null;
//       validationErrors.push('Please add area code.');
//     } else {
//       // Invalid length
//       formattedPhoneNumber = null;
//       validationErrors.push('Invalid phone number. Please enter a valid phone number.');
//     }

//     if (formattedPhoneNumber) {
//       setPhoneNumber(formattedPhoneNumber);
//       validationErrors = validatePhoneNumber(formattedPhoneNumber);
//       setPhoneErrors(validationErrors);
//     } else {
//       setPhoneNumber('');
//       setPhoneErrors(validationErrors);
//     }
//   };
//   return (
//     <div className="mb-4">
//       <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
//         Phone Number
//       </label>
//       <div className="flex">
//         {/* Country Code Dropdown */}
//         <div className="w-40">
//           <Select
//             value={selectedCountry}
//             onChange={handleCountryChange}
//             options={countryOptions}
//             className="react-select-container"
//             classNamePrefix="react-select"
//             placeholder="Select Country"
//             isSearchable
//             components={{ Option: CountryOption, SingleValue }}
//           />
//         </div>
//         {/* Local Phone Number Input */}
//         <div className="flex-grow ml-2">
//           <InputField
//             label=""
//             name="phoneNumber"
//             type="tel"
//             value={localPhoneNumber}
//             onChange={handleLocalPhoneNumberChange}
//             errors={errors}
//             placeholder="Enter your phone number"
//           />
//         </div>
//       </div>
//       {errors.length > 0 &&
//         errors.map((error, index) => (
//           <Alert key={index} message={error} type="error" />
//         ))}
//     </div>
//   );
// };

// export default PhoneNumberField;


/* 
// src/components/common/PhoneNumberField.jsx  ver 1
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

export default PhoneNumberField; */