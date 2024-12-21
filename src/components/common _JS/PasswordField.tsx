// src/components/common/PasswordField.jsx
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
// src/components/common/PasswordField.jsx
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

export default PasswordField;
