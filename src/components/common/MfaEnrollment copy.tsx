// src/components/common/MfaEnrollment.tsx
// Fixed: invisible reCAPTCHA lifecycle + no shadowed auth + stateful verificationId

import React, { useState, useEffect, useRef, FormEvent } from 'react';
import {
  RecaptchaVerifier,
  multiFactor,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
} from 'firebase/auth';
import { auth } from '../../firebase/firebase';

import PhoneNumberField from './PhoneNumberField';
import InputField from './InputField';
import Alert from './Alert';
import Button from './Button';
import { validatePhoneNumber } from '../../utils/validation';

interface MfaEnrollmentProps {
  onEnrollmentComplete?: () => void;
}

const MfaEnrollment: React.FC<MfaEnrollmentProps> = ({ onEnrollmentComplete }) => {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [phoneErrors, setPhoneErrors] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [verificationId, setVerificationId] = useState<string>('');
  const [verificationSent, setVerificationSent] = useState<boolean>(false);
  const [message, setMessage] = useState<{ message: string; type: 'success' | 'error' | '' }>({
    message: '',
    type: '',
  });

  // Invisible reCAPTCHA manager
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);
  const recaptchaDivIdRef = useRef<string | null>(null);

  function teardownRecaptcha() {
    try {
      recaptchaRef.current?.clear?.();
    } catch {}
    recaptchaRef.current = null;

    if (recaptchaDivIdRef.current) {
      const el = document.getElementById(recaptchaDivIdRef.current);
      el?.parentNode?.removeChild(el);
      recaptchaDivIdRef.current = null;
    }
  }

  async function buildInvisibleRecaptcha() {
    // Always build fresh to avoid "already rendered/removed" issues
    teardownRecaptcha();

    const id = `recaptcha-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    recaptchaDivIdRef.current = id;

    const div = document.createElement('div');
    div.id = id;
    div.style.display = 'none';
    document.body.appendChild(div);

    // v10 signature: (auth, containerId, options)
    const verifier = new RecaptchaVerifier(auth as any, id, { size: 'invisible' });
    await verifier.render();
    recaptchaRef.current = verifier;
  }

  useEffect(() => () => teardownRecaptcha(), []);

  /* async function handleSendVerificationCode(e: FormEvent) {
    e.preventDefault();

    const errors = validatePhoneNumber(phoneNumber);
    setPhoneErrors(errors);
    if (errors.length) {
      setMessage({ message: 'Please fix phone number errors.', type: 'error' });
      return;
    } */
// async function handleSendVerificationCode(e: React.FormEvent) {
//   e.preventDefault();
//   setMessage({ message: '', type: '' });

//   // If your PhoneNumberField already provides E.164, this is enough:
//   const e164 = phoneNumber.trim();

//   // Guard: must be +<country><number>
//   if (!/^\+[1-9]\d{6,14}$/.test(e164)) {
//     setMessage({ message: 'Use international format like +15551234567.', type: 'error' });
//     return;
//   }
//     try {
//       const user = auth.currentUser;
//       if (!user) {
//         setMessage({ message: 'You must be logged in to enroll MFA.', type: 'error' });
//         return;
//       }
// // Build & solve invisible reCAPTCHA
//       await buildInvisibleRecaptcha(); // <-- build and attach verifier

//      /*  const session = await multiFactor(user).getSession();
//       const provider = new PhoneAuthProvider(auth);

//       const vId = await provider.verifyPhoneNumber(
//         { phoneNumber, session },
//         recaptchaRef.current! // <-- use the correct verifier
//       ); */

//       // after: await buildInvisibleRecaptcha();
// await recaptchaRef.current!.verify();  // ← make sure a token exists

// const mfa = multiFactor(auth.currentUser!);
// const session = await mfa.getSession();

// const provider = new PhoneAuthProvider(auth);
// const vId = await provider.verifyPhoneNumber(
//       { phoneNumber: e164, session },
//       recaptchaRef.current!
//     );


//       setVerificationId(vId);
//       setVerificationSent(true);
//       setMessage({ message: 'Verification code sent to your phone.', type: 'success' });
//     } catch (error: any) {
//       console.error('Error sending SMS:', error);
//       setMessage({ message: `Error: ${error?.message || String(error)}`, type: 'error' });
//     }
//   }


async function handleSendVerificationCode(e: React.FormEvent) {
  e.preventDefault();
  setMessage({ message: '', type: '' });

  const e164 = phoneNumber.trim();
  if (!/^\+[1-9]\d{6,14}$/.test(e164)) {
    setMessage({ message: 'Use international format like +15551234567.', type: 'error' });
    return;
  }

  try {
    const user = auth.currentUser;
    if (!user) { setMessage({ message: 'You must be logged in.', type: 'error' }); return; }

    // 1) Build invisible, try to get a token
    await buildInvisibleRecaptcha();
    let token = await recaptchaRef.current!.verify().catch(() => '');

    // 2) If no token (blocked/failed), rebuild as VISIBLE so user can solve it
    if (!token) {
      teardownRecaptcha();
      const id = `recaptcha-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      recaptchaDivIdRef.current = id;
      const div = document.createElement('div');
      div.id = id;
      div.style.margin = '8px 0';
      document.body.appendChild(div);

      recaptchaRef.current = new RecaptchaVerifier(auth as any, id, { size: 'normal' });
      await recaptchaRef.current.render();
      token = await recaptchaRef.current.verify();   // user solves challenge
    }

    // 3) Proceed with SMS
    const session = await multiFactor(user).getSession();
    const provider = new PhoneAuthProvider(auth);
    const vId = await provider.verifyPhoneNumber(
      { phoneNumber: e164, session },
      recaptchaRef.current!
    );

    setVerificationId(vId);
    setVerificationSent(true);
    setMessage({ message: 'Verification code sent.', type: 'success' });
  } catch (err: any) {
    console.error(err);
    setMessage({ message: err?.message || String(err), type: 'error' });
  }
}

  async function handleVerifyCode(e: FormEvent) {
    e.preventDefault();

    try {
      if (!verificationId) {
        setMessage({ message: 'Missing verification ID. Please resend the code.', type: 'error' });
        return;
      }

      const user = auth.currentUser;
      if (!user) {
        setMessage({ message: 'No current user.', type: 'error' });
        return;
      }

      const cred = PhoneAuthProvider.credential(verificationId, verificationCode.trim());
      const assertion = PhoneMultiFactorGenerator.assertion(cred);

      await multiFactor(user).enroll(assertion, 'Phone');
      setMessage({ message: 'Phone number successfully linked to your account.', type: 'success' });

      teardownRecaptcha();
      onEnrollmentComplete?.();
    } catch (error: any) {
      console.error('Error verifying code:', error);
      setMessage({ message: `Error verifying code: ${error?.message || String(error)}`, type: 'error' });
    }


    //############
      await buildInvisibleRecaptcha();
  await recaptchaRef.current!.verify();             // ✅ guarantees a token
  const session = await multiFactor(auth.currentUser!).getSession();
  const provider = new PhoneAuthProvider(auth);
  const vId = await provider.verifyPhoneNumber(
    { phoneNumber: e164, session },
    recaptchaRef.current!
  );
  setVerificationId(vId);
  setVerificationSent(true);
  setMessage({ message: 'Verification code sent.', type: 'success' });

    
  }

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
          {/* No static #recaptcha-container; we build/destroy a hidden one dynamically */}
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
            Verify & Enroll
          </Button>
        </form>
      )}
    </div>
  );
};

export default MfaEnrollment;



// src/components/common/MfaEnrollment.tsx
// TS version

/* import React, { useState, useEffect, useRef } from 'react';
import {
  getAuth,
  RecaptchaVerifier,
  multiFactor,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
} from 'firebase/auth';
import PhoneNumberField from './PhoneNumberField';
import InputField from './InputField';
import Alert from './Alert';
import Button from './Button';
import { validatePhoneNumber } from '../../utils/validation';

// Define props interface
interface MfaEnrollmentProps {
  onEnrollmentComplete?: () => void;
}

const MfaEnrollment: React.FC<MfaEnrollmentProps> = ({ onEnrollmentComplete }) => {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [phoneErrors, setPhoneErrors] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [verificationSent, setVerificationSent] = useState<boolean>(false);
  const [message, setMessage] = useState<{ message: string; type: 'success' | 'error' | '' }>({
    message: '',
    type: '',
  });
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

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
            recaptchaVerifierRef.current?.reset();
          },
        },
        auth
      );
    }
  }, [auth]);

  const handleSendVerificationCode = async (e: React.FormEvent<HTMLFormElement>) => {
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

      const multiFactorSession = await multiFactor(user!).getSession();
      const phoneInfoOptions = {
        phoneNumber,
        session: multiFactorSession,
      };

      const phoneAuthProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneAuthProvider.verifyPhoneNumber(
        phoneInfoOptions,
        recaptchaVerifierRef.current
      );

      (window as any).verificationId = verificationId; // Safely store verificationId
      setVerificationSent(true);
      setMessage({ message: 'Verification code sent to your phone.', type: 'success' });
    } catch (error: any) {
      console.error('Error sending SMS:', error);
      setMessage({ message: `Error: ${error.message}`, type: 'error' });
    }
  };

  const handleVerifyCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const verificationId = (window as any).verificationId;
      const cred = PhoneAuthProvider.credential(verificationId, verificationCode);
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);

      await multiFactor(user!).enroll(multiFactorAssertion, 'Phone Number');
      setMessage({ message: 'Phone number successfully linked to your account.', type: 'success' });

      if (onEnrollmentComplete) {
        onEnrollmentComplete();
      }
    } catch (error: any) {
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

export default MfaEnrollment; */



/* // src/components/common/MfaEnrollment.jsx
//JS version
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

export default MfaEnrollment; */



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