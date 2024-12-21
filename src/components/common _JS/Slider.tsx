// src\components\common\Slider.jsx

import React from 'react';

const Slider = ({ label, min, max, step, value, onChange, listId }) => {
  const steps = (max - min) / step + 10;
  if (steps <= 0) {
    console.error(`Invalid array length for ${label} with min: ${min}, max: ${max}, step: ${step}`);
   // Added Validation for Array Length: Added validation to ensure that the length of the array for the datalist is valid before generating it. This prevents the Invalid array length error.
  }
  return (
    <div className="control-group">
      <label className="block mb-2">{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
        list={listId}
      />
      <div className="flex justify-between text-xs - text-gray-600">
        <span>{min}</span>
        <span>{max}</span>
      </div>
      {steps > 0 && (
        <datalist id={listId}>
          {[...Array(steps)].map((_, i) => (
            <option key={i} value={min + i * step}></option>
          ))}
        </datalist>
      )}
    </div>
  );
};

export default Slider;



/* import React from 'react';

const Slider = ({ label, min, max, step, value, onChange, listId }) => {
  return (
    <div className="control-group">
      <label className="block mb-2">{label}:</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
        list={listId}
      />
      <div className="flex justify-between text-sm text-gray-600">
        <span>{min}</span>
        <span>{max}</span>
      </div>
      <datalist id={listId}>
        {[...Array((max - min) / step + 1)].map((_, i) => (
          <option key={i} value={min + i * step}></option>
        ))}
      </datalist>
    </div>
  );
};

export default Slider; */



