
// src/components/common/MultiSelectWithOtherField.tsx
//TS version new with prefer not to say/ none as exlcusive . also the other is updated and the other popupbox disapears. it is correct 

import React, { useState, useEffect } from 'react';
import Select, { MultiValue } from 'react-select';
import Alert from './Alert';

interface MultiSelectWithOtherFieldProps {
  label: string;
  name: string;
  values: string[];
  onChange: (selectedValues: string[], name: string) => void;
  options: string[];
  errors?: string[];
}

const MultiSelectWithOtherField: React.FC<MultiSelectWithOtherFieldProps> = ({
  label,
  name,
  values,
  onChange,
  options,
  errors = [],
}) => {
  const [otherValue, setOtherValue] = useState('');
  const [showOtherInput, setShowOtherInput] = useState(false);

  const standardOptions = options.map((opt) => ({ label: opt, value: opt }));
  const allOptions = [...standardOptions, { label: 'Other', value: 'Other' }];

  useEffect(() => {
    // Check if there's a custom "Other" value already
    const existingOther = values.find(
      (v) => !options.includes(v) && v !== 'Other' && v !== 'None' && v !== 'Prefer not to say'
    );
    if (existingOther) {
      setOtherValue(existingOther);
    }
  }, [values]);

  const handleChange = (selected: MultiValue<{ label: string; value: string }>) => {
    let selectedValues = selected ? selected.map((opt) => opt.value) : [];

    // Exclusivity logic for None or Prefer not to say
    if (selectedValues.includes('None')) {
      setOtherValue('');
      setShowOtherInput(false);
      return onChange(['None'], name);
    }

    if (selectedValues.includes('Prefer not to say')) {
      setOtherValue('');
      setShowOtherInput(false);
      return onChange(['Prefer not to say'], name);
    }

    // Handle "Other" logic
    if (selectedValues.includes('Other')) {
      setShowOtherInput(true);
    } else {
      setShowOtherInput(false);
      setOtherValue('');
    }

    // Remove old custom other (not in options or special)
    const filtered = selectedValues.filter(
      (v) => options.includes(v) || v === 'Other'
    );

    onChange(filtered, name);
  };

  const handleOtherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setOtherValue(input);

    // Remove "Other" and previous custom entries
    const nonCustom = values.filter(
      (v) => options.includes(v) && v !== 'Other'
    );

    // If there's input, add it to values
    const updated = input.trim() ? [...nonCustom, input.trim()] : nonCustom;

    onChange(updated, name);
  };

  const handleOtherKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setShowOtherInput(false);
    }
  };

  const selected = values.map((val) => {
    return allOptions.find((opt) => opt.value === val) || { label: val, value: val };
  });

  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      <Select
        id={name}
        isMulti
        name={name}
        value={selected}
        onChange={handleChange}
        options={allOptions}
        className="mt-1 text-sm"
        classNamePrefix="react-select"
      />

      {showOtherInput && (
        <input
          type="text"
          value={otherValue}
          onChange={handleOtherChange}
          onKeyDown={handleOtherKeyDown}
          placeholder="Please specify"
          className={`mt-2 block w-full p-2 border ${
            errors.length ? 'border-red-500' : 'border-gray-300'
          } rounded-md`}
        />
      )}

      {errors.length > 0 && (
        <div className="mt-2">
          {errors.map((error, idx) => (
            <Alert key={idx} message={error} type="error" />
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelectWithOtherField;
//TS version new with prefer not to say/ none as exlcusive . also the other is updated and the other popupbox  doesnt disappear  . it is correct  also 
 
/* import React, { useState, useEffect } from 'react';
import Select, { MultiValue } from 'react-select';
import Alert from './Alert';

interface MultiSelectWithOtherFieldProps {
  label: string;
  name: string;
  values: string[];
  onChange: (selectedValues: string[], name: string) => void;
  options: string[];
  errors?: string[];
}

const MultiSelectWithOtherField: React.FC<MultiSelectWithOtherFieldProps> = ({
  label,
  name,
  values,
  onChange,
  options,
  errors = [],
}) => {
  const [otherValue, setOtherValue] = useState('');
  const [showOtherInput, setShowOtherInput] = useState(false);

  const standardOptions = options.map((opt) => ({ label: opt, value: opt }));
  const specialOptions = [
    { label: 'Other', value: 'Other' },
   // { label: 'Prefer not to say', value: 'Prefer not to say' },
  ];

  const allOptions = [...standardOptions, ...specialOptions];

  useEffect(() => {
    const hasCustomOther = values.find(
      (v) => !options.includes(v) && v !== 'Prefer not to say' && v !== 'None'
    );
    if (hasCustomOther) {
      setOtherValue(hasCustomOther);
      setShowOtherInput(true);
    } else {
      setOtherValue('');
      setShowOtherInput(false);
    }
  }, [values]);

  const handleChange = (selected: MultiValue<{ label: string; value: string }>) => {
    let selectedValues = selected ? selected.map((opt) => opt.value) : [];

    // Exclusivity logic for 'Prefer not to say'
    if (selectedValues.includes('Prefer not to say')) {
      selectedValues = ['Prefer not to say'];
      setShowOtherInput(false);
      setOtherValue('');
      
    }
      else if (selectedValues.includes('None')) {
      selectedValues = ['None'];
      setShowOtherInput(false);
      setOtherValue('');
      
    } 
    
    else {
      selectedValues = selectedValues.filter((v) => v !== 'Prefer not to say' || v !== 'None') ;

      if (selectedValues.includes('Other')) {
        setShowOtherInput(true);
      } else {
        setShowOtherInput(false);
        setOtherValue('');
      }
    }

    // Filter out old custom value if not in options
    const cleanValues = selectedValues.filter(
      (v) => v === 'Other' || options.includes(v)
    );

    onChange(cleanValues, name);
  };

  const handleOtherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    setOtherValue(val);

    const withoutOldOther = values.filter((v) => options.includes(v));
    const updated = val ? [...withoutOldOther, val] : withoutOldOther;

    onChange(updated, name);
    
  };

  const selected = values.map((val) => {
    return allOptions.find((opt) => opt.value === val) || { label: val, value: val };
  });

  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      <Select
        id={name}
        isMulti
        name={name}
        value={selected}
        onChange={handleChange}
        options={allOptions}
        className="mt-1 text-sm"
        classNamePrefix="react-select"
      />

      {showOtherInput && (
        <input
          type="text"
          value={otherValue}
          onChange={handleOtherChange}
          placeholder="Please specify"
          className={`mt-2 block w-full p-2 border ${
            errors.length ? 'border-red-500' : 'border-gray-300'
          } rounded-md`}
        />
      )}

      {errors.length > 0 && (
        <div className="mt-2">
          {errors.map((error, idx) => (
            <Alert key={idx} message={error} type="error" />
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelectWithOtherField;
 */
 
 


// =================JS version===============================
// // src/components/common/MultiSelectWithOtherField.jsx
// // JS version
// //this is working . just the other field is still not saved
// import React, { useState, useEffect } from 'react';
// import Select from 'react-select';
// import Alert from './Alert';
// import InputField from './InputField';
// import MultiSelectField from './MultiSelectField';

// const MultiSelectWithOtherField = ({ label, name, values, onChange, options, errors }) => {
//   const [isOtherSelected, setIsOtherSelected] = useState(true);
//   const [otherValue, setOtherValue] = useState('');

//   useEffect(() => {
//     if (values && values.includes('Other')) {
//       setIsOtherSelected(true);
//     } else {
//       setIsOtherSelected(false);
//       setOtherValue('');
//     }
//   }, [values]);

//  /*  const handleChange = (selectedOptions) => {
//     const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
//     setIsOtherSelected(selectedValues.includes('Other'));
//     onChange(selectedValues, name);
//   }; */
//   const handleChange = (selectedOptions) => {
//     //onChange(selectedOptions || [], name, Other); trying for fixing the saving array not working
//     onChange(selectedOptions || [], name, );
//     /*  const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
//     setIsOtherSelected(selectedValues.includes('Other')); */
//   };
//   const handleOtherChange = (e) => {
//     const newValue = e.target.value;
//     setOtherValue(newValue);
//     const newValues = values.includes('Other')
//       ? values.map(v => (v === 'Other' ? newValue : v))
//       : [...values, 'Other'];
//     // onChange(newValues, name);
//   };

//   const formattedOptions = options.map(option => ({ label: option, value: option }));

//   return (
//     <div className="mb-4">
//       <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
//       <Select
//         id={name}
//         isMulti
//         name={name}
//         value={formattedOptions.filter(option => values.includes(option.value))}
//         onChange={handleChange}
//         options={[...formattedOptions, { label: 'Other', value: 'Other' }]}
//         className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//       />
//       {isOtherSelected && (
//         <input
//           id={`${name}_other`}
//           type="text"
//           name={`${name}_other`}
//           value={otherValue}
//           onChange={handleOtherChange}
//           placeholder="Please specify"
//           className={`mt-2 block w-full p-2 border ${errors?.length ? 'border-red-500' : 'border-gray-300'} rounded-md`}
//           autoComplete="off"
//         />
//       )}
//       {errors && errors.length > 0 && (
//         <div className="mt-2">
//           {errors.map((error, index) => (
//             <Alert key={index} message={error} type="error" />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default MultiSelectWithOtherField;
