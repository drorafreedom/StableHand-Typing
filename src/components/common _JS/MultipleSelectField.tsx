// src/components/common/MultipleSelectField.jsx
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

export default MultipleSelectField;
