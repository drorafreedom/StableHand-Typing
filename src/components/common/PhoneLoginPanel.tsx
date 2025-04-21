 
// src/components/common/PhoneLoginPanel.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
/* import {
  auth,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from '../../firebase/firebase'; */
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../../firebase/firebase';
//either way as above 

import PhoneNumberField from './PhoneNumberField';
import InputField from './InputField';
import Alert from './Alert';
import Button from './Button';
// RIGHT: get RecaptchaVerifier & signInWithPhoneNumber from the modular SDK


// Declare globals for reCAPTCHA and confirmation result
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: import('firebase/auth').ConfirmationResult;
  }
}

type Message = { message: string; type: 'success' | 'error' };

interface PhoneLoginPanelProps {
  /** Clears errors from email/password fields (optional) */
  clearEmailAndPasswordErrors?: () => void;
  /** Render in registration mode (label changes) */
  isRegister?: boolean;
}

const PhoneLoginPanel: React.FC<PhoneLoginPanelProps> = ({
  clearEmailAndPasswordErrors,
  isRegister = false
}) => {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [phoneErrors, setPhoneErrors] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [verificationSent, setVerificationSent] = useState<boolean>(false);
  const [message, setMessage] = useState<Message>({ message: '', type: 'success' });
  const navigate = useNavigate();
  const handleSendCode = async () => {
    // Clear any existing email/password errors
    clearEmailAndPasswordErrors?.();
    // Reset any previous message
    setMessage({ message: '', type: 'success' });
  
    // Tear down any old reCAPTCHA verifier bound to a removed <div>
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch {
        // ignore if already cleared
      }
    }
  
    // Build a fresh reCAPTCHA verifier attached to the current container
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,                       // Firebase Auth instance
      'recaptcha-container',      // ID of the <div> in the DOM
      { size: 'invisible' }       // Invisible mode
    );
  
    // Render the (invisible) widget so it's actually inserted
    await window.recaptchaVerifier.render();
  
    // Now send the SMS
    try {
      const confirmation = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        window.recaptchaVerifier
      );
      window.confirmationResult = confirmation;
      setVerificationSent(true);
      setMessage({ message: 'Verification code sent via SMS.', type: 'success' });
    } catch (err: any) {
      console.error('Error sending SMS:', err);
      setMessage({ message: err.message || 'Failed to send code.', type: 'error' });
    }
  };
  
/*   const handleSendCode = async () => {
    clearEmailAndPasswordErrors?.();
    setMessage({ message: '', type: 'success' });

    // Basic client-side phone format check
    if (!phoneNumber) {
      setMessage({ message: 'Please enter your phone number.', type: 'error' });
      return;
    }

    try {
        
      // Initialize reCAPTCHA only once
// Always rebuild reCAPTCHA so it’s bound to the current div
if (window.recaptchaVerifier) {
    try { window.recaptchaVerifier.clear(); } catch {}
  }
  window.recaptchaVerifier = new RecaptchaVerifier(
    auth,
    'recaptcha-container',
    { size: 'invisible' }
  );
  await window.recaptchaVerifier.render();
  const confirmation = await signInWithPhoneNumber(
    auth,
    phoneNumber,
    window.recaptchaVerifier
  );
      
  
      window.confirmationResult = confirmation;
      setVerificationSent(true);
      setMessage({ message: 'Verification code sent via SMS.', type: 'success' });
    } catch (error: any) {
      console.error('Error sending SMS:', error);
      setMessage({ message: error.message || 'Failed to send code.', type: 'error' });
    }
  }; */

  const handleVerifyCode = async () => {
    setMessage({ message: '', type: 'success' });

    if (!verificationCode) {
      setMessage({ message: 'Please enter the verification code.', type: 'error' });
      return;
    }

    try {
      const result = await window.confirmationResult!.confirm(verificationCode);
      setMessage({ message: 'Phone login successful! Redirecting...', type: 'success' });
      setTimeout(() => navigate('/stablehand-welcome'), 2000);
    } catch (error: any) {
      console.error('Verification failed:', error);
      setMessage({ message: 'Invalid verification code.', type: 'error' });
    }
  };

  return (
    <div className="space-y-4">
      <PhoneNumberField
        phoneNumber={phoneNumber}
        setPhoneNumber={setPhoneNumber}
        setPhoneErrors={setPhoneErrors}
        errors={phoneErrors}
      />

      {verificationSent && (
        <InputField
          label="Verification Code"
          type="text"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          placeholder="Enter the code"
          errors={[]}
        />
      )}

      {message.message && <Alert message={message.message} type={message.type} />}

      <div className="flex justify-between space-x-2">
        {!verificationSent ? (
          <Button
            type="button"
            className="w-full bg-yellow-500 hover:bg-yellow-700 text-black font-bold"
            onClick={handleSendCode}
          >
            {isRegister ? 'Register with Phone' : 'Login with Phone'}
          </Button>
        ) : (
          <Button
            type="button"
            className="w-full bg-green-500 hover:bg-green-700 text-white font-bold"
            onClick={handleVerifyCode}
          >
            Verify Code
          </Button>
        )}
      </div>

      <div id="recaptcha-container" className="mt-2"></div>
    </div>
  );
};

export default PhoneLoginPanel;
 
