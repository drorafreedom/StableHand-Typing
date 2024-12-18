// src/components/common/MultipleSelectField.tsx
// TS version

import React from 'react';

// Define props interface
interface MultipleSelectFieldProps {
  label: string;
  name: string;
  values: string[]; // Array of selected values
  onChange: (selectedValues: string[]) => void; // Callback to handle selected values
  options: string[]; // Array of selectable options
  errors?: string[]; // Optional array of error messages
}

const MultipleSelectField: React.FC<MultipleSelectFieldProps> = ({
  label,
  name,
  values,
  onChange,
  options,
  errors = [],
}) => {
  const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { options } = event.target;
    const selectedValues: string[] = [];
    for (const option of options) {
      if (option.selected) {
        selectedValues.push(option.value);
      }
    }
    onChange(selectedValues);
  };

  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <select
        multiple
        name={name}
        id={name}
        value={values}
        onChange={handleSelect}
        className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${
          errors.length > 0 ? 'border-red-500' : ''
        }`}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {errors.length > 0 && (
        <p className="text-red-500 text-sm mt-1">{errors.join(', ')}</p>
      )}
    </div>
  );
};

export default MultipleSelectField;


/* // src/components/common/MultipleSelectField.jsx
//JS version
import React from 'react';

const MultipleSelectField = ({ label, name, values, onChange, options, errors }) => {
  const handleSelect = (event) => {
    const { options } = event.target;
    const selectedValues = [];
    for (const option of options) {
      if (option.selected) {
        selectedValues.push(option.value);
      }
    }
    onChange(selectedValues);
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <select
        multiple
        name={name}
        value={values}
        onChange={handleSelect}
        className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${
          errors && errors.length > 0 ? 'border-red-500' : ''
        }`}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {errors && errors.length > 0 && (
        <p className="text-red-500 text-sm mt-1">{errors.join(', ')}</p>
      )}
    </div>
  );
};

export default MultipleSelectField; */
