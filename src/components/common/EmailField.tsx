// src/components/common/EmailField.jsx
/* import React, { useState } from 'react';
import { validateEmail, isCapsLockOn } from '../../utils/validation';
import InputField from './InputField';
import Alert from './Alert';

const EmailField = ({ email, setEmail, setEmailErrors }) => {
  const [localEmailErrors, setLocalEmailErrors] = useState([]);
  const [capsLockWarning, setCapsLockWarning] = useState(false);

  const handleEmailChange = (e) => {
    const { value } = e.target;
    setEmail(value);
    const errors = validateEmail(value);
    setEmailErrors(errors);
    setLocalEmailErrors(errors);
  };

  const handleKeyPress = (e) => {
    setCapsLockWarning(isCapsLockOn(e));
  };

  return (
    <div>
      <InputField
        label="Email"
        type="email"
        value={email}
        onChange={handleEmailChange}
        onKeyDown={handleKeyPress}
        errors={localEmailErrors}
        placeholder="Enter your email"
      />
      {capsLockWarning && <Alert message="Caps Lock is on" type="warning" />}
    </div>
  );
};

export default EmailField; */


// src/components/common/EmailField.jsx
import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { validateEmail, isCapsLockOn } from '../../utils/validation';
import InputField from './InputField';
import Alert from './Alert';

const EmailField = forwardRef(({ email, setEmail, setEmailErrors }, ref) => {
  const [localEmailErrors, setLocalEmailErrors] = useState([]);
  const [capsLockWarning, setCapsLockWarning] = useState(false);

  const handleEmailChange = (e) => {
    const { value } = e.target;
    setEmail(value);
    const errors = validateEmail(value);
    setEmailErrors(errors);
    setLocalEmailErrors(errors);
  };

  const handleKeyPress = (e) => {
    setCapsLockWarning(isCapsLockOn(e));
  };

  useImperativeHandle(ref, () => ({
    clearLocalErrors: () => setLocalEmailErrors([]),
  }));

  return (
    <div>
      <InputField
        label="Email"
        type="email"
        value={email}
        onChange={handleEmailChange}
        onKeyDown={handleKeyPress}
        errors={localEmailErrors}
        placeholder="Enter your email"
      />
      {capsLockWarning && <Alert message="Caps Lock is on" type="warning" />}
    </div>
  );
});

export default EmailField;
