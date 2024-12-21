// src/components/common/MultiSelectField.jsx
// update the MultiSelectField component to include the id attribute on the select element and the htmlFor attribute on the label.
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

export default MultiSelectField;


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