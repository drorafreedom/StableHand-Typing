// src/components/common/PasswordField.tsx
// TS version

import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { validatePassword, isCapsLockOn } from '../../utils/validation';
import InputField from './InputField';
import Alert from './Alert';

// Define the props interface
interface PasswordFieldProps {
  password: string;
  setPassword: (value: string) => void;
  setPasswordErrors: (errors: string[]) => void;
  errors?: string[]; // Add this line
}


// Define the ref interface
export interface PasswordFieldRef {
  clearLocalErrors: () => void; // Expose a method to clear local errors
}

const PasswordField = forwardRef<PasswordFieldRef, PasswordFieldProps>(
  ({ password, setPassword, setPasswordErrors }, ref) => {
    // Local state to track validation errors specific to the password field
    const [localPasswordErrors, setLocalPasswordErrors] = useState<string[]>([]);

    // State to track whether Caps Lock is active
    const [capsLockWarning, setCapsLockWarning] = useState<boolean>(false);

    // Handle changes in the password field
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setPassword(value); // Update parent state
      const errors = validatePassword(value); // Validate the password
      setPasswordErrors(errors); // Update parent errors
      setLocalPasswordErrors(errors); // Update local errors
    };

    // Handle key press events to detect Caps Lock
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
      setCapsLockWarning(isCapsLockOn(e));
    };

    // Use the `useImperativeHandle` hook to expose a method to clear local errors
    useImperativeHandle(ref, () => ({
      clearLocalErrors: () => setLocalPasswordErrors([]),
    }));

    return (
      <div>
        {/* Input field for the password */}
        <InputField
        name="Password"
          label="Password"
          type="password"
          value={password}
          onChange={handlePasswordChange}
          onKeyDown={handleKeyPress}
          errors={localPasswordErrors}
          placeholder="Enter your password"
        />
        {/* Show a warning if Caps Lock is active */}
        {capsLockWarning && <Alert message="Caps Lock is on" type="warning" />}
      </div>
    );
  }
);

export default PasswordField;

/* 
Alternative version of PasswordField without forwardRef:

import React, { useState } from 'react';
import { validatePassword, isCapsLockOn } from '../../utils/validation';
import InputField from './InputField';
import Alert from './Alert';

interface PasswordFieldProps {
  password: string;
  setPassword: (value: string) => void;
  setPasswordErrors: (errors: string[]) => void;
}

const PasswordField: React.FC<PasswordFieldProps> = ({ password, setPassword, setPasswordErrors }) => {
  const [localPasswordErrors, setLocalPasswordErrors] = useState<string[]>([]);
  const [capsLockWarning, setCapsLockWarning] = useState<boolean>(false);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setPassword(value);
    const errors = validatePassword(value);
    setPasswordErrors(errors);
    setLocalPasswordErrors(errors);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsLockWarning(isCapsLockOn(e));
  };

  return (
    <div>
      <InputField
        label="Password"
        type="password"
        value={password}
        onChange={handlePasswordChange}
        onKeyDown={handleKeyPress}
        errors={localPasswordErrors}
        placeholder="Enter your password"
      />
      {capsLockWarning && <Alert message="Caps Lock is on" type="warning" />}
    </div>
  );
};

export default PasswordField;
*/

//=================JS version ====================

/* // src/components/common/PasswordField.jsx

//JS version
import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { validatePassword, isCapsLockOn } from '../../utils/validation';
import InputField from './InputField';
import Alert from './Alert';

const PasswordField = forwardRef(({ password, setPassword, setPasswordErrors }, ref) => {
  const [localPasswordErrors, setLocalPasswordErrors] = useState([]);
  const [capsLockWarning, setCapsLockWarning] = useState(false);

  const handlePasswordChange = (e) => {
    const { value } = e.target;
    setPassword(value);
    const errors = validatePassword(value);
    setPasswordErrors(errors);
    setLocalPasswordErrors(errors);
  };

  const handleKeyPress = (e) => {
    setCapsLockWarning(isCapsLockOn(e));
  };

  useImperativeHandle(ref, () => ({
    clearLocalErrors: () => setLocalPasswordErrors([]),
  }));

  return (
    <div>
      <InputField
        label="Password"
        type="password"
        value={password}
        onChange={handlePasswordChange}
        onKeyDown={handleKeyPress}
        errors={localPasswordErrors}
        placeholder="Enter your password"
      />
      {capsLockWarning && <Alert message="Caps Lock is on" type="warning" />}
    </div>
  );
});

export default PasswordField; */

//old  src/components/common/PasswordField.jsx
/* import React, { useState } from 'react';
import { validatePassword, isCapsLockOn } from '../../utils/validation';
import InputField from './InputField';
import Alert from './Alert';

const PasswordField = ({ password, setPassword, setPasswordErrors }) => {
  const [localPasswordErrors, setLocalPasswordErrors] = useState([]);
  const [capsLockWarning, setCapsLockWarning] = useState(false);

  const handlePasswordChange = (e) => {
    const { value } = e.target;
    setPassword(value);
    const errors = validatePassword(value);
    setPasswordErrors(errors);
    setLocalPasswordErrors(errors);
  };

  const handleKeyPress = (e) => {
    setCapsLockWarning(isCapsLockOn(e));
  };

  return (
    <div>
      <InputField
        label="Password"
        type="password"
        value={password}
        onChange={handlePasswordChange}
        onKeyDown={handleKeyPress}
        errors={localPasswordErrors}
        placeholder="Enter your password"
      />
      {capsLockWarning && <Alert message="Caps Lock is on" type="warning" />}
    </div>
  );
};

export default PasswordField; */

