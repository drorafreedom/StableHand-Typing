// src/components/common/DateTimeDisplay.tsx
//TS version
import React, { useState, useEffect } from 'react';

const DateTimeDisplay: React.FC = () => {
  const [localDateTime, setLocalDateTime] = useState<string>('');

  useEffect(() => {
    const updateDateTime = () => {
      const timestamp = new Date();
      setLocalDateTime(timestamp.toLocaleString());
    };
    updateDateTime();

    const intervalId = setInterval(updateDateTime, 60000); // Update every minute
    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, []);

  return (
    <div className="text-xs text-gray-600">
     {/*  <label className="block text-xs  text-gray-700 mb-1">
        Current Date and Time
      </label> */}
      <input
        type="text"
        value={localDateTime}
        readOnly
        className="w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-xs bg-gray-200"
      />
    </div>
  );
};

export default DateTimeDisplay;


/* // src/components/common/DateTimeDisplay.jsx

//JS  version
import React, { useState, useEffect } from 'react';

const DateTimeDisplay = () => {
  const [localDateTime, setLocalDateTime] = useState('');

  useEffect(() => {
    const updateDateTime = () => {
      const timestamp = new Date();
      setLocalDateTime(timestamp.toLocaleString());
    };
    updateDateTime();
    const intervalId = setInterval(updateDateTime, 60000); // Update every minute
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="text-sm text-gray-600">
      <label className="block text-xs font-medium text-gray-700 mb-1">Current Date and Time</label>
      <input
        type="text"
        value={localDateTime}
        readOnly
        className="w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-200"
      />
    </div>
  );
};

export default DateTimeDisplay;
 */