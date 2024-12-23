// src/components/TherapyPage/AnimationTextDisplay.tsx

import React, { ChangeEvent } from 'react';

interface AnimationTextDisplayProps {
  displayText: string;
  setDisplayText: (value: string) => void;
}

const AnimationTextDisplay: React.FC<AnimationTextDisplayProps> = ({ displayText, setDisplayText }) => {
  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setDisplayText(e.target.value);
  };

  return (
    <div className="mb-4">
      <label htmlFor="displayText" className="block text-sm font-medium text-gray-700">
        Display Text
      </label>
      <textarea
        id="displayText"
        name="displayText"
        value={displayText}
        onChange={handleTextChange}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-32 resize-y overflow-auto"
      />
    </div>
  );
};

export default AnimationTextDisplay;

 //+++++++++++JS version+++++++++++++++++
 
// src/components/TherapyPage/AnimationTextDisplay.jsx
// // JS version
import React from 'react';

const AnimationTextDisplay = ({ displayText, setDisplayText }) => {
  const handleTextChange = (e) => {
    setDisplayText(e.target.value);
  };

  return (
    <div className="mb-4">
      <label htmlFor="displayText" className="block text-sm font-medium text-gray-700">Display Text</label>
      <textarea
        id="displayText"
        name="displayText"
        value={displayText}
        onChange={handleTextChange}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-32 resize-y overflow-auto"
      />
    </div>
  );
};

export default AnimationTextDisplay;
