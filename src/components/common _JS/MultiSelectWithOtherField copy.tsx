// src/components/common/MultiSelectWithOtherField.jsx

//this is working . just the other field is still not saved
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import Alert from './Alert';
import InputField from './InputField';
import MultiSelectField from './MultiSelectField';

const MultiSelectWithOtherField = ({ label, name, values, onChange, options, errors }) => {
  const [isOtherSelected, setIsOtherSelected] = useState(true);
  const [otherValue, setOtherValue] = useState('');

  useEffect(() => {
    if (values && values.includes('Other')) {
      setIsOtherSelected(true);
    } else {
      setIsOtherSelected(false);
      setOtherValue('');
    }
  }, [values]);

 /*  const handleChange = (selectedOptions) => {
    const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setIsOtherSelected(selectedValues.includes('Other'));
    onChange(selectedValues, name);
  }; */
  const handleChange = (selectedOptions) => {
    onChange(selectedOptions || [], name);
    /*  const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setIsOtherSelected(selectedValues.includes('Other')); */
  };
  const handleOtherChange = (e) => {
    const newValue = e.target.value;
    setOtherValue(newValue);
    const newValues = values.includes('Other')
      ? values.map(v => (v === 'Other' ? newValue : v))
      : [...values, 'Other'];
    // onChange(newValues, name);
  };

  const formattedOptions = options.map(option => ({ label: option, value: option }));

  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
      <Select
        id={name}
        isMulti
        name={name}
        value={formattedOptions.filter(option => values.includes(option.value))}
        onChange={handleChange}
        options={[...formattedOptions, { label: 'Other', value: 'Other' }]}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      />
      {isOtherSelected && (
        <input
          id={`${name}_other`}
          type="text"
          name={`${name}_other`}
          value={otherValue}
          onChange={handleOtherChange}
          placeholder="Please specify"
          className={`mt-2 block w-full p-2 border ${errors?.length ? 'border-red-500' : 'border-gray-300'} rounded-md`}
          autoComplete="off"
        />
      )}
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

export default MultiSelectWithOtherField;
/* // src/components/common/MultiSelectWithOtherField.jsx

import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import Alert from './Alert';

const MultiSelectWithOtherField = ({ label, name, values, onChange, options, errors }) => {
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [otherValue, setOtherValue] = useState('');

  useEffect(() => {
    const otherSelected = values.some(v => v.startsWith('Other: '));
    setIsOtherSelected(otherSelected);
    if (otherSelected) {
      setOtherValue(values.find(v => v.startsWith('Other: ')).split('Other: ')[1]);
    }
  }, [values]);

  const handleChange = (selectedOptions) => {
    const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setIsOtherSelected(selectedValues.includes('Other'));
    onChange(selectedValues, name);
  };

  const handleOtherChange = (e) => {
    const newValue = e.target.value;
    setOtherValue(newValue);
    const newValues = values.includes('Other')
      ? values.map(v => (v === 'Other' ? `Other: ${newValue}` : v))
      : [...values, `Other: ${newValue}`];
    onChange(newValues, name);
  };

  const formattedOptions = options.map(option => ({ label: option, value: option }));

  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
      <Select
        id={name}
        isMulti
        name={name}
        value={formattedOptions.filter(option => values.includes(option.value) || values.includes(`Other: ${option.value}`))}
        onChange={handleChange}
        options={[...formattedOptions, { label: 'Other', value: 'Other' }]}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      />
      {isOtherSelected && (
        <input
          id={`${name}_other`}
          type="text"
          name={`${name}_other`}
          value={otherValue}
          onChange={handleOtherChange}
          placeholder="Please specify"
          className={`mt-2 block w-full p-2 border ${errors?.length ? 'border-red-500' : 'border-gray-300'} rounded-md`}
          autoComplete="off"
        />
      )}
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

export default MultiSelectWithOtherField;
Explanation of the Changes:
useEffect: This ensures the state variables isOtherSelected and otherValue are updated based on the current values. If "Other" is selected, it sets isOtherSelected to true and extracts the otherValue.
handleChange: This updates the selected values. If "Other" is selected, it sets isOtherSelected to true.
handleOtherChange: This updates the otherValue and includes it in the values array with the prefix Other:. */