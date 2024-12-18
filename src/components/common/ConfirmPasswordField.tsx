// src/components/common/ConfirmPasswordField.tsx
//TS version
import React, { useState } from 'react';
import { validatePassword, isCapsLockOn } from '../../utils/validation';
import InputField from './InputField';
import Alert from './Alert';

// Define props interface
interface ConfirmPasswordFieldProps {
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  password: string;
  setConfirmPasswordErrors: (errors: string[]) => void;
}

const ConfirmPasswordField: React.FC<ConfirmPasswordFieldProps> = ({
  confirmPassword,
  setConfirmPassword,
  password,
  setConfirmPasswordErrors,
}) => {
  const [localConfirmPasswordErrors, setLocalConfirmPasswordErrors] = useState<string[]>([]);
  const [capsLockWarning, setCapsLockWarning] = useState<boolean>(false);

  // Handle input changes
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setConfirmPassword(value);
    const errors = validatePassword(value).concat(
      value !== password ? ['Passwords do not match'] : []
    );
    setConfirmPasswordErrors(errors);
    setLocalConfirmPasswordErrors(errors);
  };

  // Handle Caps Lock detection
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsLockWarning(isCapsLockOn(e));
  };

  return (
    <div>
      <InputField
        label="Confirm Password"
        type="password"
        value={confirmPassword}
        onChange={handleConfirmPasswordChange}
        onKeyDown={handleKeyPress}
        errors={localConfirmPasswordErrors}
        placeholder="Confirm your password"
      />
      {capsLockWarning && <Alert message="Caps Lock is on" type="warning" />}
    </div>
  );
};

export default ConfirmPasswordField;



/* // src/components/common/ConfirmPasswordField.jsx

//JS version
import React, { useState } from 'react';
import { validatePassword, isCapsLockOn } from '../../utils/validation';
import InputField from './InputField';
import Alert from './Alert';

const ConfirmPasswordField = ({ confirmPassword, setConfirmPassword, password, setConfirmPasswordErrors }) => {
  const [localConfirmPasswordErrors, setLocalConfirmPasswordErrors] = useState([]);
  const [capsLockWarning, setCapsLockWarning] = useState(false);

  const handleConfirmPasswordChange = (e) => {
    const { value } = e.target;
    setConfirmPassword(value);
    const errors = validatePassword(value).concat(value !== password ? ['Passwords do not match'] : []);
    setConfirmPasswordErrors(errors);
    setLocalConfirmPasswordErrors(errors);
  };

  const handleKeyPress = (e) => {
    setCapsLockWarning(isCapsLockOn(e));
  };

  return (
    <div>
      <InputField
        label="Confirm Password"
        type="password"
        value={confirmPassword}
        onChange={handleConfirmPasswordChange}
        onKeyDown={handleKeyPress}
        errors={localConfirmPasswordErrors}
        placeholder="Confirm your password"
      />
      {capsLockWarning && <Alert message="Caps Lock is on" type="warning" />}
    </div>
  );
};

export default ConfirmPasswordField; */
