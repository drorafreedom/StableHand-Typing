// // src/components/common/Slider.tsx
// src/components/common/Slider.tsx
import React, { useMemo } from 'react';

interface SliderProps {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
}

const Slider: React.FC<SliderProps> = ({
  label,
  min,
  max,
  step,
  value,
  onChange,
}) => {
  // percent filled
  const pct = useMemo(
    () => ((value - min) / (max - min)) * 100,
    [value, min, max]
  );

  // fixed five tick positions (0,25,50,75,100)
  const ticks = useMemo(() => [0, 25, 50, 75, 100], []);

  return (
    <div className="control-group text-xs">
      <label className="block mb-1 font-medium">{label}</label>
      <div className="relative w-full h-6">
        {/* hand-drawn ticks */}
        <div className="absolute inset-0 pointer-events-none">
          {ticks.map((t) => {
            const isMajor = t % 50 === 0; // 0,50,100
            return (
              <div
                key={t}
                className="absolute bg-gray-600"
                style={{
                  left: `${t}%`,
                  width: isMajor ? '2px' : '1px',
                  height: isMajor ? '6px' : '4px',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              />
            );
          })}
        </div>

        {/* the actual range input with gradient fill */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.currentTarget.value))}
          className="w-full h-2 rounded-lg appearance-none focus:outline-none"
          style={{
            background: `linear-gradient(
              to right,
              #3b82f6 0%,
              #3b82f6 ${pct}%,
              #d1d5db ${pct}%,
              #d1d5db 100%
            )`,
          }}
        />
      </div>
      <div className="flex justify-between mt-1 text-gray-600">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};

export default Slider;

// // TS version lasta working version 

// import React from 'react';

// interface SliderProps {
//   label: string;
//   min: number;
//   max: number;
//   step: number;
//   value: number;
//   onChange: (value: number) => void;
//   listId: string;
// }

// const Slider: React.FC<SliderProps> = ({
//   label, min, max, step, value, onChange, listId
// }) => {
//   // percentage filled
//   const pct = Math.round(((value - min) / (max - min)) * 100);
//   // only five tick positions
//   const ticks = [0, 25, 50, 75, 100];

//   return (
//     <div className="control-group text-xs">
//       <label className="block mb-2">{label}</label>
//       <div className="relative w-full h-8">
//         {/* actual range input, with inline gradient fill */}
//         <input
//           type="range"
//           min={min}
//           max={max}
//           step={step}
//           value={value}
//           onChange={e => onChange(+e.target.value)}
//           list={listId}
//           className="w-full h-2 rounded-lg appearance-none focus:outline-none"
//           style={{
//             background: `linear-gradient(
//               to right,
//               #3b82f6 0%,
//               #3b82f6 ${pct}%,
//               #d1d5db ${pct}%,
//               #d1d5db 100%
//             )`
//           }}
//         />

//         {/* overlay ticks */}
//         <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
//           {ticks.map((t, i) => {
//             const isMajor = t % 50 === 0; // 0, 50, 100 are major
//             return (
//               <div
//                 key={t}
//                 className={`absolute bg-gray-600`}
//                 style={{
//                   left: `${t}%`,
//                   width: isMajor ? '2px' : '1px',
//                   height: isMajor ? '6px' : '4px',
//                   top: '50%',        // center around track
//                   transform: 'translate(-50%, -50%)',
//                 }}
//               />
//             );
//           })}
//         </div>
//       </div>

//       {/* datalist for built-in thumb snapping (optional) */}
//       <datalist id={listId}>
//         {ticks.map(t => (
//           // snap value back to actual min/max scale
//           <option key={t} value={min + ((max - min) * t) / 100} />
//         ))}
//       </datalist>

//       <div className="flex justify-between text-xs text-gray-600 mt-1">
//         <span>{min}</span>
//         <span>{max}</span>
//       </div>
//     </div>
//   );
// };

// export default Slider;



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



