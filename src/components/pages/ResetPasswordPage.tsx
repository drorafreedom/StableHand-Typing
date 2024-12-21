
// src/components/pages/ResetPasswordPage.tsx

import React, { useState, ChangeEvent, KeyboardEvent, FormEvent } from 'react';
import { validateEmail, isCapsLockOn } from '../../utils/validation';
import InputField from '../common/InputField';
import Button from '../common/Button';
import Alert from '../common/Alert';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase/firebase';
import { Frame3 } from '../common/Frame';

const ResetPasswordPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [emailErrors, setEmailErrors] = useState<string[]>([]);
  const [resetMessage, setResetMessage] = useState<{ message: string; type: 'success' | 'error' | '' }>({ message: '', type: '' });
  const [capsLockWarning, setCapsLockWarning] = useState<boolean>(false);

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setEmail(value);
    setEmailErrors(validateEmail(value));
    setResetMessage({ message: '', type: '' }); // Clear the message when the user starts typing
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    setCapsLockWarning(isCapsLockOn(e));
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setResetMessage({ message: '', type: '' }); // Clear previous messages
    if (emailErrors.length === 0) {
      try {
        await sendPasswordResetEmail(auth, email);
        setResetMessage({ message: 'Password reset email sent. Please check your inbox and spam box.', type: 'success' });
      } catch (error: any) {
        setResetMessage({ message: `Error: ${error.message}`, type: 'error' });
      }
    } else {
      setResetMessage({ message: 'Please fix the errors in the form.', type: 'error' });
    }
  };

  return (
    <Frame3 bgColor="bg-gray-100">
      <div className="flex flex-col items-center justify-top">
        <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-md border border-gray-300">
          <h1 className="text-4xl font-bold mb-4">Reset Password</h1>
          <form className="space-y-4" onSubmit={handleResetPassword}>
            <InputField
              label="Email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              onKeyDown={handleKeyPress}
              errors={emailErrors}
              placeholder="Enter your email"
            />
            {capsLockWarning && <p className="text-yellow-500 text-sm mt-1">Caps Lock is on</p>}
            {resetMessage.message && <Alert message={resetMessage.message} type={resetMessage.type} />}
            <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 border border-blue-700">
              Reset Password
            </Button>
          </form>
        </div>
      </div>
    </Frame3>
  );
};

export default ResetPasswordPage;


//+++++++++++JS version+++++++++++++++++
// src/components/pages/ResetPasswordPage.jsx
 // JS version
/* import React, { useState } from 'react';
import { validateEmail, isCapsLockOn } from '../../utils/validation';
import InputField from '../common/InputField';
import Button from '../common/Button';
import Alert from '../common/Alert';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase/firebase';
import { Frame3, Frame } from '../common/Frame';
const ResetPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [emailErrors, setEmailErrors] = useState([]);
  const [resetMessage, setResetMessage] = useState({ message: '', type: '' });
  const [capsLockWarning, setCapsLockWarning] = useState(false);

  const handleEmailChange = (e) => {
    const { value } = e.target;
    setEmail(value);
    setEmailErrors(validateEmail(value));
    setResetMessage({ message: '', type: '' }); // Clear the message when the user starts typing
  };

  const handleKeyPress = (e) => {
    setCapsLockWarning(isCapsLockOn(e));
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetMessage({ message: '', type: '' }); // Clear previous messages
    if (emailErrors.length === 0) {
      try {
        await sendPasswordResetEmail(auth, email);
        setResetMessage({ message: 'Password reset email sent. Please check your inbox, and spam box', type: 'success' });
      } catch (error) {
        setResetMessage({ message: `Error: ${error.message}`, type: 'error' });
      }
    } else {
      setResetMessage({ message: 'Please fix the errors in the form.', type: 'error' });
    }
  };

  return (
    
      <Frame3  bgColor="bg-gray-100">
    <div className="flex flex-col items-center justify-top  ">
      <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-md border border-gray-300">
        <h1 className="text-4xl font-bold mb-4">Reset Password</h1>
        <form className="space-y-4" onSubmit={handleResetPassword}>
          <InputField
            label="Email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            onKeyDown={handleKeyPress}
            errors={emailErrors}
            placeholder="Enter your email"
          />
          {capsLockWarning && <p className="text-yellow-500 text-sm mt-1">Caps Lock is on</p>}
          {resetMessage.message && <Alert message={resetMessage.message} type={resetMessage.type} />}
          <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 border border-blue-700">Reset Password</Button>
        </form>
      </div>
    </div>
    </Frame3> 
  );
};

export default ResetPasswordPage; */
