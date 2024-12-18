// src/components/common/AddPhoneNumber.jsx
import React, { useState, useEffect } from 'react';
import { getAuth, RecaptchaVerifier, PhoneAuthProvider, linkWithCredential } from 'firebase/auth';

// Define state types
type ErrorType = string | null;
type SuccessType = string | null;

const AddPhoneNumber: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [error, setError] = useState<ErrorType>(null);
  const [success, setSuccess] = useState<SuccessType>(null);
  const [verificationId, setVerificationId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const auth = getAuth();
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        'recaptcha-container',
        { size: 'invisible' },
        auth
      );
    }
  }, []);

  const isValidPhoneNumber = (number: string): boolean => {
    return /^\+[1-9]\d{1,14}$/.test(number);
  };

  const handleSendCode = async (): Promise<void> => {
    if (!isValidPhoneNumber(phoneNumber)) {
      setError('Please enter a valid phone number in E.164 format (e.g., +1234567890).');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const auth = getAuth();
      const provider = new PhoneAuthProvider(auth);
      const id = await provider.verifyPhoneNumber(phoneNumber, window.recaptchaVerifier);
      setVerificationId(id);
      setSuccess('Verification code sent!');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const auth = getAuth();
      const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
      await linkWithCredential(auth.currentUser!, credential);
      setSuccess('Phone number linked successfully!');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Link Phone Number</h2>
      <div id="recaptcha-container"></div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <input
        type="tel"
        placeholder="Phone Number"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        required
      />
      <button onClick={handleSendCode} disabled={loading}>
        {loading ? 'Sending...' : 'Send Verification Code'}
      </button>
      <input
        id="verification-code-input"
        type="text"
        placeholder="Verification Code"
        value={verificationCode}
        onChange={(e) => setVerificationCode(e.target.value)}
        required
      />
      <button onClick={handleVerifyCode} disabled={loading}>
        {loading ? 'Verifying...' : 'Verify Code'}
      </button>
    </div>
  );
};

export default AddPhoneNumber;

//JS version
/* import React, { useState } from 'react';
import { getAuth, RecaptchaVerifier, PhoneAuthProvider, linkWithCredential } from "firebase/auth";

const AddPhoneNumber = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [verificationId, setVerificationId] = useState('');

  const handleSendCode = async () => {
    const auth = getAuth();
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', { size: 'invisible' }, auth);
      }
      const provider = new PhoneAuthProvider(auth);
      const id = await provider.verifyPhoneNumber(phoneNumber, window.recaptchaVerifier);
      setVerificationId(id);
      setSuccess("Verification code sent!");
    } catch (error) {
      setError(error.message);
    }
  };

  const handleVerifyCode = async () => {
    const auth = getAuth();
    try {
      const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
      await linkWithCredential(auth.currentUser, credential);
      setSuccess("Phone number linked successfully!");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div>
      <h2>Link Phone Number</h2>
      <div id="recaptcha-container"></div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
      <input
        type="tel"
        placeholder="Phone Number"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        required
      />
      <button onClick={handleSendCode}>Send Verification Code</button>
      <input
        type="text"
        placeholder="Verification Code"
        value={verificationCode}
        onChange={(e) => setVerificationCode(e.target.value)}
        required
      />
      <button onClick={handleVerifyCode}>Verify Code</button>
    </div>
  );
};

export default AddPhoneNumber; */
