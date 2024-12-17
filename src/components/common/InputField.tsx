// src/components/common/InputField.jsx
// update the SelectField component to include the id attribute on the select element and the htmlFor attribute on the label.
  import React from 'react';
import Alert from './Alert';

const InputField = ({ label, name, type, value, onChange, placeholder, errors = [], onKeyDown }) => {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
         onKeyDown={onKeyDown}
        placeholder={placeholder}
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

export default InputField;  


  // src/components/common/InputField.jsx
// last working version
/* import React from 'react';
import Alert from './Alert';

const InputField = ({ label, name, type, value, onChange, placeholder, errors = [], onKeyDown }) => {
  return (
    <div className="mb-4">
         <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label> */ 
         {/* the field name   
     <label className="block text-sm font-medium text-gray-700">{label}</label> */}
    /*   <input
       id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        placeholder={placeholder}
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

export default InputField;   */

//----------------------------------------------------
/* // src/components/common/InputField.jsx
import React from 'react';
import Alert from './Alert';

const InputField = ({ label, name, type, value, onChange, errors = [], placeholder, onKeyDown }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        placeholder={placeholder}
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

export default InputField; */
//----------------------------------------------------------------------
/* import React from 'react';
import Alert from './Alert';

const InputField = ({ label, type, value, onChange, errors = [], placeholder, onKeyDown }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        placeholder={placeholder}
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

export default InputField; */
