// src/components/common/MultiSelectField.tsx
// TS version

import React from 'react';
import Select, { MultiValue } from 'react-select';
import Alert from './Alert';

// Define props interface
interface MultiSelectFieldProps {
  label: string;
  name: string;
  value: string[]; // Array of selected values
  onChange: (selectedValues: string[], name: string) => void; // Callback for change events
  options: string[]; // Array of selectable options
  errors?: string[]; // Optional array of error messages
}

const MultiSelectField: React.FC<MultiSelectFieldProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  errors = [],
}) => {
  const handleChange = (selectedOptions: MultiValue<{ label: string; value: string }>) => {
    const selectedValues = selectedOptions.map((option) => option.value);
    onChange(selectedValues, name);
  };
//Mapped options into objects with label and value keys
  const formattedOptions = options.map((option) => ({ label: option, value: option }));

  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <Select
        id={name}
        isMulti
        name={name}
        value={formattedOptions.filter((option) => value.includes(option.value))}
        onChange={handleChange}
        options={formattedOptions}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      />
      {errors.length > 0 && (
        <div className="mt-2">
          {errors.map((error, index) => (
            <Alert key={index} message={error} type="error" />
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelectField;

/* 
// src/components/common/MultiSelectField.tsx
import React from 'react';
import Select, { MultiValue } from 'react-select';
import Alert from './Alert';

// Define props interface
interface MultiSelectFieldProps {
  label: string;
  name: string;
  value: string[];
  onChange: (selectedValues: string[], name: string) => void;
  options: string[];
  errors?: string[];
}

const MultiSelectField: React.FC<MultiSelectFieldProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  errors = [],
}) => {
  const handleChange = (selectedOptions: MultiValue<{ label: string; value: string }>) => {
    const selectedValues = selectedOptions.map((option) => option.value);
    onChange(selectedValues, name);
  };

  const formattedOptions = options.map((option) => ({ label: option, value: option }));

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <Select
        isMulti
        name={name}
        value={formattedOptions.filter((option) => value.includes(option.value))}
        onChange={handleChange}
        options={formattedOptions}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      />
      {errors.length > 0 && (
        <div className="mt-2">
          {errors.map((error, index) => (
            <Alert key={index} message={error} type="error" />
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelectField;
*/
//====================
// JS version
/* // src/components/common/MultiSelectField.jsx
// update the MultiSelectField component to include the id attribute on the select element and the htmlFor attribute on the label.
//JS version
import React from 'react';
import Select from 'react-select';
import Alert from './Alert';

const MultiSelectField = ({ label, name, value, onChange, options, errors }) => {
  const handleChange = (selectedOptions) => {
    onChange(selectedOptions || [], name);
  };

  const formattedOptions = options.map(option => ({ label: option, value: option }));

  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
      <Select
        id={name}
        isMulti
        name={name}
        value={formattedOptions.filter(option => value.includes(option.value))}
        onChange={handleChange}
        options={formattedOptions}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      />
      {errors && errors.length > 0 && (
        <div className="mt-2">
          {errors.map((error, index) => (
            <Alert key={index} message={error} type="error" />
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelectField; */


/* // src/components/common/MultiSelectField.jsx
import React from 'react';
import Select from 'react-select';
import Alert from './Alert';

const MultiSelectField = ({ label, name, value, onChange, options, errors }) => {
  const handleChange = (selectedOptions) => {
    onChange(selectedOptions || [], name);
  };

  const formattedOptions = options.map(option => ({ label: option, value: option }));

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <Select
        isMulti
        name={name}
        value={formattedOptions.filter(option => value.includes(option.value))}
        onChange={handleChange}
        options={formattedOptions}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      />
      {errors && errors.length > 0 && (
        <div className="mt-2">
          {errors.map((error, index) => (
            <Alert key={index} message={error} type="error" />
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelectField;
 */