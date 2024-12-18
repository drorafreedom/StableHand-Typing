// src\components\common\TextAreaField.jsx
import React from 'react';
import Alert from './Alert';

const TextAreaField = ({ label, name, value, onChange, errors }) => {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-32 resize-y overflow-auto"
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

export default TextAreaField;
