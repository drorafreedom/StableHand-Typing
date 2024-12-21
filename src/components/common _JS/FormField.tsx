// src/components/common/FormField.jsx
import React, { useState } from 'react';

const FormField = ({ label, name, type, value, onChange, onKeyDown, options, placeholder, errors, showOtherField }) => {
  const [showOther, setShowOther] = useState(false);

  const handleSelectChange = (e) => {
    onChange(e);
    if (e.target.value === 'Other') {
      setShowOther(true);
    } else {
      setShowOther(false);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      {type === 'select' ? (
        <>
          <select
            name={name}
            value={value}
            onChange={handleSelectChange}
            onKeyDown={onKeyDown}
            className={`w-full p-2 border ${errors ? 'border-red-500' : 'border-gray-300'} rounded`}
          >
            <option value="">Select {label.toLowerCase()}</option>
            {options.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
          {showOtherField && showOther && (
            <input
              name={`${name}_other`}
              type="text"
              value={value}
              onChange={onChange}
              onKeyDown={onKeyDown}
              placeholder={`Enter other ${label.toLowerCase()}`}
              className={`w-full p-2 border ${errors ? 'border-red-500' : 'border-gray-300'} rounded mt-2`}
            />
          )}
        </>
      ) : (
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className={`w-full p-2 border ${errors ? 'border-red-500' : 'border-gray-300'} rounded`}
        />
      )}
      {errors && <p className="text-red-500 text-sm mt-1">{errors}</p>}
    </div>
  );
};

export default FormField;




/* // src/components/common/FormField.jsx
import React from 'react';
import Alert from './Alert';

const FormField = ({ label, type, name, value, onChange, placeholder, options = [], errors = [], onKeyDown }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {type === 'select' ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">Select {label}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder={placeholder}
        />
      )}
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

export default FormField; */


/* // src/components/common/FormField.jsx
import React from 'react';
import Alert from './Alert';
// this is a combination of both InputField and SelectField components. It will render an input field if options prop is not provided, otherwise it will render a select field.
// SelectField = ({ label, name, value, onChange, options, errors = [] })
// InputField = ({ label, name, type, value, onChange, errors = [], placeholder, onKeyDown })

const FormField = ({ label, type, name, value, onChange, placeholder, options, errors = [], onKeyDown }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {options ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">Select {label}</option>
          {options.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder={placeholder}
        />
      )}
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

export default FormField;

 */


//==================================================================================
/* // This is a combination of InputField and select field combining both depends on prop.
import React from 'react';
import Alert from './Alert';

const FormField = ({ label, name, type, value, onChange, errors = [], placeholder, onKeyDown, options }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {options ? (
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
      ) : (
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder={placeholder}
        />
      )}
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

export default FormField;
 */