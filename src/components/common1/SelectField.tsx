// src/components/common/SelectField.jsx

// update the SelectField component to include the id attribute on the select element and the htmlFor attribute on the label.
import React from 'react';
import Alert from './Alert';

const SelectField = ({ label, name, value, onChange, options = [], errors = [], onKeyDown }) => {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        className="mt-1 block w-full px-3 py-2 border border-gray-300  rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
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

export default SelectField;



/* // src/components/common/SelectField.jsx
import React from 'react';
import Alert from './Alert';

const SelectField = ({ label, name, value, onChange, options = [], errors = [], onKeyDown }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
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

export default SelectField;
 */
//-----------------------------------------------------------------

/* // src/components/common/SelectField.jsx
import React from 'react';
import Alert from './Alert';

const SelectField = ({ label, name, value, onChange, options, errors = [] }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      >
        <option value="">Select an option</option>
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
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

export default SelectField;
 */