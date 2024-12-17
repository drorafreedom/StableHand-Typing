// src/components/common/Alert.jsx
import React, { memo } from 'react';

// Define the prop types
interface AlertProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
}

// Default alert types with corresponding styles
const alertTypeClass: Record<NonNullable<AlertProps['type']>, string> = {
  success: 'bg-green-100 border-green-400 text-green-700',
  error: 'bg-red-100 border-red-400 text-red-700',
  warning: 'bg-yellow-100 border-yellow-400 text-yellow-700',
  info: 'bg-blue-100 text-blue-700',
};

// Runtime type check (optional enhancement)
const isValidType = (type: string): type is NonNullable<AlertProps['type']> =>
  ['success', 'error', 'warning', 'info'].includes(type);

const Alert: React.FC<AlertProps> = ({ message, type = 'info' }) => {
  // Type validation fallback
  const finalType = isValidType(type) ? type : 'info';

  // Accessibility role adjustment
  const role = finalType === 'error' ? 'alert' : 'status';

  return (
    <div
      className={`border-l-4 p-2 mb-2 text-xs ${alertTypeClass[finalType]}`}
      role={role}
      aria-live="polite"
    >
      {message}
    </div>
  );
};

export default memo(Alert);
//--------------------------
//simple  TS 
/* import React from 'react';

// Define the prop types
interface AlertProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

const Alert: React.FC<AlertProps> = ({ message, type }) => {
  const alertTypeClass: Record<AlertProps['type'], string> = {
    success: 'bg-green-100 border-green-400 text-green-700',
    error: 'bg-red-100 border-red-400 text-red-700',
    warning: 'bg-yellow-100 border-yellow-400 text-yellow-700',
    info: 'bg-blue-100 text-blue-700',
  };

  return (
    <div
      className={`border-l-4 p-2 mb-2 text-xs ${alertTypeClass[type]}`}
      role="alert"
    >
      {message}
    </div>
  );
};

export default Alert; */

//-----------------------
//old JS version
/* import React from 'react';

const Alert = ({ message, type }) => {
  const alertTypeClass = {
    success: 'bg-green-100 border-green-400 text-green-700',
    error: 'bg-red-100 border-red-400 text-red-700',
    warning: 'bg-yellow-100 border-yellow-400 text-yellow-700',
    info: 'bg-blue-100 text-blue-700',
  };

  return (
    <div className={`border-l-4 p-2 mb-2 text-xs ${alertTypeClass[type]}`} role="alert">
      {message}
    </div>
  );
};

export default Alert; */
