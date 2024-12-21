// src/components/common/Slider.tsx
// TS version

import React from 'react';

// Define props interface
interface SliderProps {
  label: string; // Label for the slider
  min: number; // Minimum value of the slider
  max: number; // Maximum value of the slider
  step: number; // Step size for the slider
  value: number; // Current value of the slider
  onChange: (value: number) => void; // Callback triggered when the slider value changes
  listId: string; // ID for the datalist element
}

const Slider: React.FC<SliderProps> = ({ label, min, max, step, value, onChange, listId }) => {
  const steps = Math.floor((max - min) / step) + 1;

  // Validate that the steps calculation is valid
  if (steps <= 0) {
    console.error(
      `Invalid array length for ${label}. Ensure min (${min}), max (${max}), and step (${step}) are valid.`
    );
    return null;
  }

  return (
    <div className="control-group">
      {/* Label */}
      <label className="block mb-2">{label}</label>

      {/* Range input */}
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

      {/* Min and max values */}
      <div className="flex justify-between text-xs text-gray-600">
        <span>{min}</span>
        <span>{max}</span>
      </div>

      {/* Datalist for slider ticks */}
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


//========JS VERSION =============
/* // // src\components\common\Slider.jsx
//JS version
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
 */


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



