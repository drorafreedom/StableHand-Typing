// src/components/common/MfaEnrollment.jsx

import React, { useState, useEffect, useRef } from 'react';
import {
  getAuth,
  RecaptchaVerifier,
  multiFactor,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
} from 'firebase/auth';
import PhoneNumberField from '../common/PhoneNumberField';
import InputField from '../common/InputField';
import Alert from '../common/Alert';
import Button from '../common/Button';
import { validatePhoneNumber } from '../../utils/validation';

const MfaEnrollment = ({ onEnrollmentComplete }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneErrors, setPhoneErrors] = useState([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [message, setMessage] = useState({ message: '', type: '' });
  const recaptchaVerifierRef = useRef(null);
  const auth = getAuth();
  const user = auth.currentUser;

  // Initialize reCAPTCHA
  useEffect(() => {
    if (!recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(
        'recaptcha-container',
        {
          size: 'invisible', // or 'normal' for visible
          callback: () => console.log('reCAPTCHA solved.'),
          'expired-callback': () => {
            console.log('reCAPTCHA expired. Resetting...');
            recaptchaVerifierRef.current.reset();
          },
        },
        auth
      );
    }
  }, [auth]);

  const handleSendVerificationCode = async (e) => {
    e.preventDefault();
    const errors = validatePhoneNumber(phoneNumber);
    setPhoneErrors(errors);

    if (errors.length > 0) {
      setMessage({ message: 'Please fix phone number errors.', type: 'error' });
      return;
    }

    try {
      if (!recaptchaVerifierRef.current) {
        setMessage({ message: 'reCAPTCHA not initialized.', type: 'error' });
        return;
      }

      const multiFactorSession = await multiFactor(user).getSession();

      const phoneInfoOptions = {
        phoneNumber,
        session: multiFactorSession,
      };

      const phoneAuthProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneAuthProvider.verifyPhoneNumber(
        phoneInfoOptions,
        recaptchaVerifierRef.current
      );

      window.verificationId = verificationId;
      setVerificationSent(true);
      setMessage({ message: 'Verification code sent to your phone.', type: 'success' });
    } catch (error) {
      console.error('Error sending SMS:', error);
      setMessage({ message: `Error: ${error.message}`, type: 'error' });
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();

    try {
      const verificationId = window.verificationId;
      const cred = PhoneAuthProvider.credential(verificationId, verificationCode);
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);

      await multiFactor(user).enroll(multiFactorAssertion, 'Phone Number');
      setMessage({ message: 'Phone number successfully linked to your account.', type: 'success' });

      if (onEnrollmentComplete) {
        onEnrollmentComplete();
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      setMessage({ message: `Error verifying code: ${error.message}`, type: 'error' });
    }
  };

  return (
    <div>
      {!verificationSent ? (
        <form onSubmit={handleSendVerificationCode}>
          <PhoneNumberField
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            setPhoneErrors={setPhoneErrors}
            errors={phoneErrors}
          />
          {message.message && <Alert message={message.message} type={message.type} />}
          <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-700">
            Send Verification Code
          </Button>
          <div id="recaptcha-container"></div>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode}>
          <InputField
            label="Verification Code"
            name="verificationCode"
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Enter the code sent to your phone"
            errors={[]}
          />
          {message.message && <Alert message={message.message} type={message.type} />}
          <Button type="submit" className="w-full bg-green-500 hover:bg-green-700">
            Verify Code and Link Phone
          </Button>
        </form>
      )}
    </div>
  );
};

export default MfaEnrollment;



/* import React, { useState, useEffect, useRef } from 'react';
import { auth } from '../../firebase/firebase'; // Adjust the path if needed
import {
  multiFactor,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  RecaptchaVerifier,
} from 'firebase/auth';

const MfaEnrollment = ({ onEnrollmentComplete }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [message, setMessage] = useState({ message: '', type: '' });
  const recaptchaVerifierRef = useRef(null);
  const [verificationSent, setVerificationSent] = useState(false);

  useEffect(() => {
    if (!recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(
        'recaptcha-container',
        { size: 'invisible' },
        auth
      );
    }
  }, []);

  const handleSendVerificationCode = async () => {
    try {
      const user = auth.currentUser;
      const multiFactorSession = await multiFactor(user).getSession();

      const phoneAuthProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneAuthProvider.verifyPhoneNumber(
        {
          phoneNumber,
          session: multiFactorSession,
        },
        recaptchaVerifierRef.current
      );

      setVerificationId(verificationId);
      setVerificationSent(true);
      setMessage({ message: 'Verification code sent to your phone.', type: 'success' });
    } catch (error) {
      console.error('Error sending verification code:', error);
      setMessage({ message: `Error: ${error.message}`, type: 'error' });
    }
  };

  const handleVerifyCode = async () => {
    try {
      const user = auth.currentUser;

      const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(credential);

      await multiFactor(user).enroll(multiFactorAssertion, 'Personal Phone');

      setMessage({ message: 'MFA enrollment successful.', type: 'success' });
      onEnrollmentComplete(); // Notify LoginForm that enrollment is complete
    } catch (error) {
      console.error('Error during MFA enrollment:', error);
      setMessage({ message: `Error: ${error.message}`, type: 'error' });
    }
  };

  return (
    <div>
      {!verificationSent ? (
        <div>
          <h3>Enroll in Multi-Factor Authentication</h3>
          <input
            type="tel"
            placeholder="Enter phone number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
          <button onClick={handleSendVerificationCode}>Send Verification Code</button>
          {message.message && <p className={message.type}>{message.message}</p>}
        </div>
      ) : (
        <div>
          <h3>Verify Your Phone Number</h3>
          <input
            type="text"
            placeholder="Enter verification code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            required
          />
          <button onClick={handleVerifyCode}>Verify and Enroll</button>
          {message.message && <p className={message.type}>{message.message}</p>}
        </div>
      )}
      <div id="recaptcha-container"></div>
    </div>
  );
};

export default MfaEnrollment; */



/* // src\components\common\MfaEnrollment.jsx
import { auth } from '../../firebase/firebase';
import {
  multiFactor,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  RecaptchaVerifier,
} from 'firebase/auth';
import { useState, useEffect } from 'react';

const MfaEnrollment = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [message, setMessage] = useState({ message: '', type: '' });
  const recaptchaVerifierRef = useRef(null);

  useEffect(() => {
    if (!recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(
        'recaptcha-container',
        { size: 'invisible' },
        auth
      );
    }
  }, []);

  const handleSendVerificationCode = async () => {
    try {
      const user = auth.currentUser;
      const multiFactorSession = await multiFactor(user).getSession();

      const phoneAuthProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneAuthProvider.verifyPhoneNumber(
        {
          phoneNumber,
          session: multiFactorSession,
        },
        recaptchaVerifierRef.current
      );

      setVerificationId(verificationId);
      setMessage({ message: 'Verification code sent to your phone.', type: 'success' });
    } catch (error) {
      console.error('Error sending verification code:', error);
      setMessage({ message: `Error: ${error.message}`, type: 'error' });
    }
  };

  const handleVerifyCode = async () => {
    try {
      const user = auth.currentUser;

      const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(credential);

      await multiFactor(user).enroll(multiFactorAssertion, 'Personal Phone');

      setMessage({ message: 'MFA enrollment successful.', type: 'success' });
    } catch (error) {
      console.error('Error during MFA enrollment:', error);
      setMessage({ message: `Error: ${error.message}`, type: 'error' });
    }
  };

  return (
    <div>
      <input
        type="tel"
        placeholder="Enter phone number"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
      />
      <button onClick={handleSendVerificationCode}>Send Verification Code</button>
      <input
        type="text"
        placeholder="Enter verification code"
        value={verificationCode}
        onChange={(e) => setVerificationCode(e.target.value)}
      />
      <button onClick={handleVerifyCode}>Verify and Enroll</button>
      {message.message && <p className={message.type}>{message.message}</p>}
      <div id="recaptcha-container"></div>
    </div>
  );
};

export default MfaEnrollment;
 */