// src/components/common/SelectField.tsx
// TS version

import React from 'react';
import Alert from './Alert';

// Define the props interface for the component
interface SelectFieldProps {
  label: string; // Label for the select field
  name: string; // Name and id attribute for the select element
  value: string; // Currently selected value
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; // Callback for value change
  options: string[]; // Array of options for the select dropdown
  errors?: string[]; // Optional array of error messages
  onKeyDown?: (e: React.KeyboardEvent<HTMLSelectElement>) => void; // Optional keyboard event handler
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  name,
  value,
  onChange,
  options = [],
  errors = [],
  onKeyDown,
}) => {
  return (
    <div className="mb-4">
      {/* Label for the select field */}
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      {/* Select dropdown */}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      >
        {/* Default placeholder option */}
        <option value="">Select {label}</option>

        {/* Render options dynamically */}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      {/* Error messages */}
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



//=======JS version ==========
// /* // src/components/common/SelectField.jsx

// update the SelectField component to include the id attribute on the select element and the htmlFor attribute on the label.

//JS version
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

export default SelectField; */



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