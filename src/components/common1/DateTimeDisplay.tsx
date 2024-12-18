// src/components/common/DateTimeDisplay.jsx
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
