// src/components/common/SelectWithOtherField.tsx
// TS version

import React, { useState } from 'react';
import Alert from './Alert';

// Define the props interface
interface SelectWithOtherFieldProps {
  label: string; // Label for the select field
  name: string; // Name of the field
  value: string; // Current value of the field
  options: string[]; // Array of options for the dropdown
  onChange: (event: { target: { name: string; value: string } }) => void; // Callback for value change
  errors?: string[]; // Optional array of error messages
}

const SelectWithOtherField: React.FC<SelectWithOtherFieldProps> = ({
  label,
  name,
  value,
  options,
  onChange,
  errors = [],
}) => {
  // State to track if the "Other" option is selected
  const [isOther, setIsOther] = useState<boolean>(value === 'Other');
  const [otherValue, setOtherValue] = useState<string>(isOther ? value : '');

  // Handle dropdown value changes
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (selectedValue === 'Other') {
      setIsOther(true);
      onChange({ target: { name, value: otherValue } });
    } else {
      setIsOther(false);
      onChange({ target: { name, value: selectedValue } });
    }
  };

  // Handle changes to the "Other" input field
  const handleOtherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setOtherValue(newValue);
    onChange({ target: { name, value: newValue } });
  };

  return (
    <div className="mb-4">
      {/* Label for the select field */}
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      {/* Dropdown select */}
      <select
        id={name}
        name={name}
        value={isOther ? 'Other' : value}
        onChange={handleSelectChange}
        className={`w-full px-3 py-2 border rounded ${
          errors.length > 0 ? 'border-red-500' : 'border-gray-300'
        }`}
      >
        <option value="" disabled>
          Select {label.toLowerCase()}
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
        <option value="Other">Other</option>
      </select>

      {/* Input field for "Other" option */}
      {isOther && (
        <input
          id={`${name}_other`}
          type="text"
          name={`${name}_other`}
          value={otherValue}
          onChange={handleOtherChange}
          placeholder="Please specify"
          className={`mt-2 block w-full p-2 border ${
            errors.length > 0 ? 'border-red-500' : 'border-gray-300'
          } rounded-md`}
        />
      )}

      {/* Display errors */}
      {errors.length > 0 && <Alert message={errors.join(', ')} type="error" />}
    </div>
  );
};

export default SelectWithOtherField;


//=====JS version=============
/* // // src/components/common/SelectWithOtherField.jsx
// update to include the id attribute on the select element and the htmlFor attribute on the label.

//JS version 
import React, { useState } from 'react';
import Alert from './Alert';

const SelectWithOtherField = ({ label, name, value, options, onChange, errors }) => {
  const [isOther, setIsOther] = useState(value === 'Other');
  const [otherValue, setOtherValue] = useState(isOther ? value : '');

  const handleSelectChange = (e) => {
    const selectedValue = e.target.value;
    if (selectedValue === 'Other') {
      setIsOther(true);
      onChange({ target: { name, value: otherValue } });
    } else {
      setIsOther(false);
      onChange({ target: { name, value: selectedValue } });
    }
  };

  const handleOtherChange = (e) => {
    const newValue = e.target.value;
    setOtherValue(newValue);
    onChange({ target: { name, value: newValue } });
  };

  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <select
        id={name}
        name={name}
        value={isOther ? 'Other' : value}
        onChange={handleSelectChange}
        className={`w-full px-3 py-2 border rounded ${errors?.length ? 'border-red-500' : 'border-gray-300'}`} 
      >
        <option value="" disabled>Select {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
        <option value="Other">Other</option>
      </select>
      {isOther && (
        <input
          id={`${name}_other`}
          type="text"
          name={`${name}_other`}
          value={otherValue}
          onChange={handleOtherChange}
          placeholder="Please specify"
          className={`mt-2 block w-full p-2 border ${errors?.length ? 'border-red-500' : 'border-gray-300'} rounded-md`}
        />
      )}
      {errors?.length > 0 && <Alert message={errors.join(', ')} type="error" />}
    </div>
  );
};

export default SelectWithOtherField; */


//================================== last working version befor update
/* 
 // src/components/common/SelectWithOtherField.jsx
import React, { useState } from 'react';
import Select from 'react-select';
import Alert from '../common/Alert';
const SelectWithOtherField = ({ label, name, value, options, onChange, errors }) => {
  const [isOther, setIsOther] = useState(value === 'Other');
  const [otherValue, setOtherValue] = useState(isOther ? value : '');

  const handleSelectChange = (e) => {
    const selectedValue = e.target.value;
    if (selectedValue === 'Other') {
      setIsOther(true);
      onChange({ target: { name, value: otherValue } });
    } else {
      setIsOther(false);
      onChange({ target: { name, value: selectedValue } });
    }
  };

  const handleOtherChange = (e) => {
    const newValue = e.target.value;
    setOtherValue(newValue);
    onChange({ target: { name, value: newValue } });
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <select
        name={name}
        value={isOther ? 'Other' : value}
        onChange={handleSelectChange}
        className={`w-full px-3 py-2 border rounded ${errors?.length ? 'border-red-500' : 'border-gray-300'}`}
      >
        <option value="" disabled>Select {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
        <option value="Other">Other</option>
      </select>
      {isOther && (
        <input
          type="text"
          name={`${name}_other`}
          value={otherValue}
          onChange={handleOtherChange}
          placeholder="Please specify"
          
          className={`border-l-4 p-2 mb-2 text-x border rounded ${errors?.length ? 'border-red-500' : 'border-gray-300'}`}
        />
      )}
      
      {errors?.length > 0 && <Alert message={errors.join(', ')} type="error" />}
    
    
    </div>
    
  );
};

export default SelectWithOtherField;
 
 */
