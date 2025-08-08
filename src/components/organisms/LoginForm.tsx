// src/components/organisms/LoginForm.tsx
// TS version

//4.20.25 

// src/components/organisms/LoginForm.tsx
import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  multiFactor,
  getMultiFactorResolver,
  MultiFactorResolver,
  RecaptchaVerifier,
  UserCredential
} from 'firebase/auth';
import { auth } from '../../firebase/firebase';
import EmailField from '../common/EmailField';
import PasswordField from '../common/PasswordField';
import InputField from '../common/InputField';
import Button from '../common/Button';
import Alert from '../common/Alert';

// Extend global window for reCAPTCHA
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

type Banner = { text: string; type: 'info' | 'success' | 'error' };

export default function LoginForm(): JSX.Element {
  const navigate = useNavigate();

  // Email/password
  const [email, setEmail] = useState<string>('');
  const [emailErrors, setEmailErrors] = useState<string[]>([]);
  const [password, setPassword] = useState<string>('');
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
const [loginAttempts, setLoginAttempts] = useState<number>(0);

  // SMS/MFA
  const [smsCode, setSmsCode] = useState<string>('');
  const [verificationId, setVerificationId] = useState<string>('');
  const [resolver, setResolver] = useState<MultiFactorResolver | null>(null);
  const [enrolling, setEnrolling] = useState<boolean>(false);

  // Banner/feedback
  const [banner, setBanner] = useState<Banner>({ text: '', type: 'info' });

  // Initialize invisible reCAPTCHA once
  useEffect(() => {
    if (!window.recaptchaVerifier) {
      // Correct parameter order: auth first, then containerId, then options
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        'recaptcha-container',
        { size: 'invisible' }
      );
      // Render the invisible widget
      window.recaptchaVerifier.render().catch(console.error);
    }
  }, []);

  // STEP 1: attempt email+password sign-in (and possibly start MFA enrollment)
 async function handleSubmit(e: FormEvent) {
  e.preventDefault();
  setBanner({ text: '', type: 'info' });

  try {
    const cred: UserCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = cred.user;

    // ✅ MFA step only starts after a valid password
    setEnrolling(true);
    setBanner({ text: 'Sending enrollment SMS…', type: 'info' });

    const session = await multiFactor(user).getSession();
    const provider = new PhoneAuthProvider(auth);
    const phoneInput = window.prompt('Enter phone # (+1...)') || '';
    const id = await provider.verifyPhoneNumber(
      { phoneNumber: phoneInput, session },
      window.recaptchaVerifier!
    );
    setVerificationId(id);

  } catch (err: any) {
    // ✅ Track failed attempts regardless of error type
    setLoginAttempts((prev) => prev + 1);

    // ✅ MFA
    if (err.code === 'auth/multi-factor-auth-required') {
      const mResolver = getMultiFactorResolver(auth, err);
      setResolver(mResolver);
      const hint = mResolver.hints[0];
      setBanner({
        text: `Code sent to …${hint.phoneNumber?.slice(-4) || '***'}`,
        type: 'info',
      });

      const provider = new PhoneAuthProvider(auth);
      const id = await provider.verifyPhoneNumber(
        { multiFactorHint: hint, session: mResolver.session },
        window.recaptchaVerifier!
      );
      setVerificationId(id);
      return; // prevent fallthrough
    }

    // ✅ 3-attempt limit
    if (loginAttempts + 1 >= 3) {
      setBanner({
        text: 'Too many attempts. Redirecting to reset password page.',
        type: 'error',
      });
      setTimeout(() => navigate('/reset-password'), 2000);
    } else {
      setBanner({
        text: err.message || 'Login failed. Please check your credentials.',
        type: 'error',
      });
    }
  }
}

  // STEP 2: verify SMS code for enrollment or sign-in
  async function handleVerify() {
    setBanner({ text: '', type: 'info' });
    if (!verificationId) return;

    try {
      const phoneCred = PhoneAuthProvider.credential(verificationId, smsCode);
      const assertion = PhoneMultiFactorGenerator.assertion(phoneCred);

      if (enrolling) {
        await multiFactor(auth.currentUser!).enroll(assertion, 'Phone');
        setBanner({ text: 'Phone linked! Redirecting…', type: 'success' });
        await auth.currentUser!.reload();
      } else if (resolver) {
        await resolver.resolveSignIn(assertion);
        setBanner({ text: 'MFA OK—Redirecting…', type: 'success' });
      }

      setTimeout(() => navigate('/stablehand-welcome'), 1500);
    } catch (err: any) {
      setBanner({ text: err.message || 'Verification failed', type: 'error' });
    }
  }

  return (
    <div>
      {/* STEP 1: Email/Password */}
      {!verificationId && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <EmailField
            email={email}
            setEmail={setEmail}
            setEmailErrors={setEmailErrors}
            errors={emailErrors}
          />
          <PasswordField
            password={password}
            setPassword={setPassword}
            setPasswordErrors={setPasswordErrors}
            errors={passwordErrors}
          />

          {banner.text && <Alert message={banner.text} type={banner.type} />}

          <Button type="submit" className="w-full bg-blue-600 text-white">
            {enrolling ? 'Link Phone' : 'Log In'}
          </Button>
        </form>
      )}

      <div id="recaptcha-container"></div>

      {/* STEP 2: SMS code UI */}
      {verificationId && (
        <div className="mt-4 space-y-4">
          <InputField
            label="SMS Code"
            type="text"
            value={smsCode}
            onChange={e => setSmsCode(e.target.value)}
            placeholder="123456"
          />
          {banner.text && <Alert message={banner.text} type={banner.type} />}

          <Button onClick={handleVerify} className="w-full bg-green-600 text-white">
            Verify Code
          </Button>
        </div>
      )}
    </div>
  );
}


/* import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  RecaptchaVerifier,
  PhoneAuthProvider,
  multiFactor,
  EmailAuthProvider,
  getMultiFactorResolver,
  MultiFactorResolver,
  MultiFactorInfo,
} from "firebase/auth";
import { auth } from "../../firebase/firebase";
import EmailField from "../common/EmailField";
import PasswordField from "../common/PasswordField";
import Alert from "../common/Alert";
import Button from "../common/Button";
import InputField from "../common/InputField";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [loginMessage, setLoginMessage] = useState<{ message: string; type: string }>({ message: "", type: "" });
  const [mfaOptions, setMfaOptions] = useState<MultiFactorInfo[] | null>(null);
  const [resolver, setResolver] = useState<MultiFactorResolver | null>(null);
  const [mfaMethod, setMfaMethod] = useState<string>("");
  const [phoneMasked, setPhoneMasked] = useState<string>("");

  // Initialize Recaptcha
  const initializeRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        "recaptcha-container",
        { size: "invisible" },
        auth
      );
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginMessage({ message: "", type: "" });

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if MFA is required
      if (multiFactor(user).enrolledFactors.length > 0) {
        const mfaResolver = getMultiFactorResolver(auth, userCredential);

        const options = mfaResolver.hints.map((hint) => ({
          factorId: hint.factorId,
          displayName: hint.displayName,
          phoneNumber: hint.phoneNumber,
        }));

        setMfaOptions(options);
        setResolver(mfaResolver);

        const phone = options.find((opt) => opt.factorId === PhoneAuthProvider.PROVIDER_ID);
        if (phone) {
          setPhoneMasked(`*****${phone.phoneNumber?.slice(-4) || ""}`);
        }

        setLoginMessage({
          message: "MFA required. Choose an option to proceed.",
          type: "warning",
        });
        return;
      }

      setLoginMessage({ message: "Login successful!", type: "success" });
      // Redirect to your app or dashboard here
    } catch (error: any) {
      if (error.code === "auth/multi-factor-auth-required") {
        const mfaResolver = getMultiFactorResolver(auth, error);

        const options = mfaResolver.hints.map((hint) => ({
          factorId: hint.factorId,
          displayName: hint.displayName,
          phoneNumber: hint.phoneNumber,
        }));

        setMfaOptions(options);
        setResolver(mfaResolver);

        const phone = options.find((opt) => opt.factorId === PhoneAuthProvider.PROVIDER_ID);
        if (phone) {
          setPhoneMasked(`*****${phone.phoneNumber?.slice(-4) || ""}`);
        }

        setLoginMessage({
          message: "MFA required. Choose an option to proceed.",
          type: "warning",
        });
        return;
      }

      setLoginMessage({
        message: `Login failed: ${error.message}`,
        type: "error",
      });
    }
  };

  const handleSendVerificationCode = async () => {
    if (mfaMethod === PhoneAuthProvider.PROVIDER_ID) {
      try {
        const appVerifier = window.recaptchaVerifier;
        const phoneInfoOptions = {
          multiFactorHint: resolver?.hints.find((hint) => hint.factorId === PhoneAuthProvider.PROVIDER_ID),
          session: resolver?.session,
        };

        const phoneAuthProvider = new PhoneAuthProvider(auth);
        const verificationId = await phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, appVerifier);

        window.verificationId = verificationId;
        setLoginMessage({ message: "Verification code sent to your phone.", type: "success" });
      } catch (error: any) {
        setLoginMessage({ message: `Failed to send SMS: ${error.message}`, type: "error" });
      }
    } else if (mfaMethod === EmailAuthProvider.PROVIDER_ID) {
      setLoginMessage({ message: "Email MFA not implemented yet.", type: "info" });
    }
  };

  const handleVerifyCode = async () => {
    try {
      const cred = PhoneAuthProvider.credential(window.verificationId, verificationCode);
      const assertion = PhoneAuthProvider.assertion(cred);

      if (resolver) {
        await resolver.resolveSignIn(assertion);
        setLoginMessage({ message: "MFA verification successful! Redirecting...", type: "success" });
        // Redirect to your app or dashboard here
      }
    } catch (error: any) {
      setLoginMessage({ message: `MFA verification failed: ${error.message}`, type: "error" });
    }
  };

  return (
    <div>
      {!mfaOptions ? (
        <form onSubmit={handleLogin}>
          <EmailField email={email} setEmail={setEmail} />
          <PasswordField password={password} setPassword={setPassword} />
          {loginMessage.message && <Alert message={loginMessage.message} type={loginMessage.type} />}
          <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-700">
            Login
          </Button>
        </form>
      ) : (
        <div>
          <h3>MFA Required</h3>
          {mfaOptions.map((option, index) => (
            <div key={index}>
              <input
                type="radio"
                id={`mfa-option-${index}`}
                name="mfaOption"
                value={option.factorId}
                onChange={(e) => setMfaMethod(e.target.value)}
              />
              <label htmlFor={`mfa-option-${index}`}>
                {option.factorId === PhoneAuthProvider.PROVIDER_ID ? `Phone (${phoneMasked})` : "Email"}
              </label>
            </div>
          ))}
          <Button onClick={handleSendVerificationCode}>Send Verification Code</Button>
          <InputField
            label="Verification Code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
          />
          <Button onClick={handleVerifyCode}>Verify Code</Button>
        </div>
      )}
      <div id="recaptcha-container"></div>
    </div>
  );
};

export default LoginForm; */


//+++++++++++JS VERSIOn++++++++++++++++++
// src/components/organisms/LoginForm.jsx
//JS version
/* import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  RecaptchaVerifier,
  PhoneAuthProvider,
  multiFactor,
  EmailAuthProvider,
  getMultiFactorResolver,
} from "firebase/auth";
import { auth } from "../../firebase/firebase";
import EmailField from "../common/EmailField";
import PasswordField from "../common/PasswordField";
import Alert from "../common/Alert";
import Button from "../common/Button";
import InputField from "../common/InputField";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [loginMessage, setLoginMessage] = useState({ message: "", type: "" });
  const [mfaOptions, setMfaOptions] = useState(null);
  const [resolver, setResolver] = useState(null);

  const [mfaMethod, setMfaMethod] = useState("");
  const [phoneMasked, setPhoneMasked] = useState("");

  // Initialize Recaptcha
  const initializeRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        "recaptcha-container",
        { size: "invisible" },
        auth
      );
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginMessage({ message: "", type: "" });

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if MFA is required
      if (multiFactor(user).enrolledFactors.length > 0) {
        const mfaResolver = getMultiFactorResolver(auth, userCredential);

        const options = mfaResolver.hints.map((hint) => ({
          factorId: hint.factorId,
          displayName: hint.displayName,
          phoneNumber: hint.phoneNumber,
        }));

        // Save MFA options and resolver
        setMfaOptions(options);
        setResolver(mfaResolver);

        // Mask the phone number
        const phone = options.find((opt) => opt.factorId === PhoneAuthProvider.PROVIDER_ID);
        if (phone) {
          setPhoneMasked(`*****${phone.phoneNumber.slice(-4)}`);
        }

        setLoginMessage({
          message: "MFA required. Choose an option to proceed.",
          type: "warning",
        });
        return;
      }

      // If no MFA required, proceed to app
      setLoginMessage({ message: "Login successful!", type: "success" });
      // Redirect to your app or dashboard here
    } catch (error) {
      if (error.code === "auth/multi-factor-auth-required") {
        const mfaResolver = getMultiFactorResolver(auth, error);

        const options = mfaResolver.hints.map((hint) => ({
          factorId: hint.factorId,
          displayName: hint.displayName,
          phoneNumber: hint.phoneNumber,
        }));

        setMfaOptions(options);
        setResolver(mfaResolver);

        const phone = options.find((opt) => opt.factorId === PhoneAuthProvider.PROVIDER_ID);
        if (phone) {
          setPhoneMasked(`*****${phone.phoneNumber.slice(-4)}`);
        }

        setLoginMessage({
          message: "MFA required. Choose an option to proceed.",
          type: "warning",
        });
        return;
      }

      setLoginMessage({
        message: `Login failed: ${error.message}`,
        type: "error",
      });
    }
  };

  const handleSendVerificationCode = async () => {
    if (mfaMethod === PhoneAuthProvider.PROVIDER_ID) {
      try {
        const appVerifier = window.recaptchaVerifier;
        const phoneInfoOptions = {
          multiFactorHint: resolver.hints.find(
            (hint) => hint.factorId === PhoneAuthProvider.PROVIDER_ID
          ),
          session: resolver.session,
        };

        const phoneAuthProvider = new PhoneAuthProvider(auth);
        const verificationId = await phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, appVerifier);

        window.verificationId = verificationId;
        setLoginMessage({ message: "Verification code sent to your phone.", type: "success" });
      } catch (error) {
        setLoginMessage({ message: `Failed to send SMS: ${error.message}`, type: "error" });
      }
    } else if (mfaMethod === EmailAuthProvider.PROVIDER_ID) {
      setLoginMessage({ message: "Email MFA not implemented yet.", type: "info" });
    }
  };

  const handleVerifyCode = async () => {
    try {
      const cred = PhoneAuthProvider.credential(window.verificationId, verificationCode);
      const assertion = PhoneMultiFactorGenerator.assertion(cred);

      const userCredential = await resolver.resolveSignIn(assertion);
      setLoginMessage({ message: "MFA verification successful! Redirecting...", type: "success" });

      // Redirect to your app or dashboard here
    } catch (error) {
      setLoginMessage({ message: `MFA verification failed: ${error.message}`, type: "error" });
    }
  };

  return (
    <div>
      {!mfaOptions ? (
        <form onSubmit={handleLogin}>
          <EmailField email={email} setEmail={setEmail} />
          <PasswordField password={password} setPassword={setPassword} />
          {loginMessage.message && <Alert message={loginMessage.message} type={loginMessage.type} />}
          <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-700">
            Login
          </Button>
        </form>
      ) : (
        <div>
          <h3>MFA Required</h3>
          {mfaOptions.map((option, index) => (
            <div key={index}>
              <input
                type="radio"
                id={`mfa-option-${index}`}
                name="mfaOption"
                value={option.factorId}
                onChange={(e) => setMfaMethod(e.target.value)}
              />
              <label htmlFor={`mfa-option-${index}`}>
                {option.factorId === PhoneAuthProvider.PROVIDER_ID
                  ? `Phone (${phoneMasked})`
                  : "Email"}
              </label>
            </div>
          ))}
          <Button onClick={handleSendVerificationCode}>Send Verification Code</Button>
          <InputField
            label="Verification Code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
          />
          <Button onClick={handleVerifyCode}>Verify Code</Button>
        </div>
      )}
      <div id="recaptcha-container"></div>
    </div>
  );
};

export default LoginForm;
 */

// src/components/LoginForm.jsx

// import React, { useState } from 'react';
// import EmailField from '../common/EmailField';
// import PasswordField from '../common/PasswordField';
// import Button from '../common/Button';
// import Alert from '../common/Alert';
// import ThirdPartyAuthPanel from '../common/ThirdPartyAuthPanel';
// import RegistrationForm from './RegistrationForm';
// import { useNavigate } from 'react-router-dom';
// import { auth, googleProvider, facebookProvider, yahooProvider, microsoftProvider, appleProvider } from '../../firebase/firebase';
// import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';

// const LoginForm = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [emailErrors, setEmailErrors] = useState([]);
//   const [passwordErrors, setPasswordErrors] = useState([]);
//   const [loginAttempts, setLoginAttempts] = useState(0);
//   const [capsLockWarning, setCapsLockWarning] = useState(false);
//   const [loginMessage, setLoginMessage] = useState({ message: '', type: '' });
//   const [isRegister, setIsRegister] = useState(false); // New state to toggle between login and registration forms
//   const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     if (emailErrors.length === 0 && passwordErrors.length === 0) {
//       try {
//         await signInWithEmailAndPassword(auth, email, password);
//         setLoginMessage({
//           message: 'Login successful! Redirecting...',
//           type: 'success',
//         });
//         setTimeout(() => {
//           navigate('/stablehand-welcome');
//         }, 2000); // Navigate after 2 seconds to show the success message
//       } catch (error) {
//         console.error('Error logging in user:', error);
//         setLoginAttempts((prev) => prev + 1);
//         if (loginAttempts + 1 >= 3) {
//           setLoginMessage({
//             message: 'Too many attempts. Redirecting to reset password page.',
//             type: 'error',
//           });
//           setTimeout(() => {
//             navigate('/reset-password');
//           }, 2000); // Navigate after 2 seconds to show the error message
//         } else {
//           setLoginMessage({
//             message: 'Login failed. Please check your credentials.',
//             type: 'error',
//           });
//         }
//       }
//     }
//   };

//   const handleThirdPartyLogin = async (provider) => {
//     try {
//       await signInWithPopup(auth, provider);
//       setLoginMessage({ message: 'Login successful.', type: 'success' });
//     } catch (error) {
//       console.error('Error during third-party login:', error);
//       setLoginMessage({ message: `Error during third-party login: ${error.message}`, type: 'error' });
//     }
//   };

//   return (
//     <div>
//       {!isRegister ? (
//         <form className="space-y-4" onSubmit={handleLogin}>
//           <EmailField email={email} setEmail={setEmail} setEmailErrors={setEmailErrors} />
//           <PasswordField password={password} setPassword={setPassword} setPasswordErrors={setPasswordErrors} />
//           {capsLockWarning && <Alert message="Caps Lock is on" type="warning" />}
//           {loginMessage.message && <Alert message={loginMessage.message} type={loginMessage.type} />}
//           <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 border border-blue-700 font-bold">Login</Button>
//           <div className="mt-4 flex justify-between">
//             <Button
//               type="button"
//               onClick={() => navigate('/reset-password')}
//               className="w-full bg-red-500 hover:bg-red-700 border border-red-700 font-bold"
//             >
//               Reset Password
//             </Button>
//             <Button
//               type="button"
//               onClick={() => navigate('/register')}
//               className="w-full bg-green-500 hover:bg-green-700 border border-green-700 font-bold ml-4"
//             >
//               Register
//             </Button>
//           </div>
//           <ThirdPartyAuthPanel handleThirdPartyAuth={handleThirdPartyLogin} isRegister={false} />
//         </form>
//       ) : (
//         <div>
//           {/* <RegistrationForm /> */}
//          {/*  <Button
//             type="button"
//             onClick={() => setIsRegister(false)} // Toggle to show the login form
//             className="w-full bg-gray-500 hover:bg-gray-700 border border-gray-700 font-bold mt-4"
//           >
//             Back to Login
//           </Button> */}
//         </div>
//       )}
//     </div>
//   );
// };

// export default LoginForm;
// src/components/LoginForm.jsx
//New style with MFA  notworking .....
 /*  import React, { useState, useEffect, useRef } from 'react';
import {
  signInWithEmailAndPassword,
  sendEmailVerification,
  RecaptchaVerifier,
  PhoneAuthProvider,
  getMultiFactorResolver,
  PhoneMultiFactorGenerator,
  multiFactor, // Added import
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase/firebase';

import MfaEnrollment from '../common/MfaEnrollment';
import PhoneNumberField from '../common/PhoneNumberField';
import EmailField from '../common/EmailField';
import PasswordField from '../common/PasswordField';
import Button from '../common/Button';
import Alert from '../common/Alert';
import ThirdPartyAuthPanel from '../common/ThirdPartyAuthPanel';
const LoginForm = ({ onLogin, onMaxLoginAttemptsReached, onRegisterClick }) =>{ 
  // State variables
 const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginMessage, setLoginMessage] = useState({ message: '', type: '' });
  const [showMfaEnrollment, setShowMfaEnrollment] = useState(false);
  const recaptchaVerifierRef = useRef(null);
  const navigate = useNavigate();
  
  const [emailErrors, setEmailErrors] = useState([]);
   
    const [passwordErrors, setPasswordErrors] = useState([]);
    const [loginAttempts, setLoginAttempts] = useState(0);
    const [capsLockWarning, setCapsLockWarning] = useState(false);
   
  
  // Initialize reCAPTCHA
  useEffect(() => {
    if (!recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(
        'recaptcha-container',
        {
          size: 'invisible',
        },
        auth
      );
    }
  }, []);

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Sign in with email and password
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await user.reload();

      // Check if email is verified
      if (!user.emailVerified) {
        setLoginMessage({
          message: 'Your email is not verified. Please check your inbox and verify your email.',
          type: 'error',
        });
        await sendEmailVerification(user);
        return;
      }

      // Check if user is enrolled in MFA
      const enrolledFactors = multiFactor(user).enrolledFactors;
      if (enrolledFactors.length === 0) {
        // User is not enrolled in MFA
        setShowMfaEnrollment(true);
        return;
      }

      // User is enrolled in MFA, proceed to your app
      setLoginMessage({
        message: 'Login successful! Redirecting...',
        type: 'success',
      });
      setTimeout(() => {
        navigate('/stablehand-welcome'); // Adjust the route as needed
      }, 2000);
    } catch (error) {
      console.error('Error during login:', error);
      console.error('Error:', error);
console.error('Error code:', error.code);
console.error('Error message:', error.message);
      setLoginMessage({
        message: 'Login failed. Please check your credentials.',
        type: 'error',
      });
    }
  };
  const handleThirdPartyLogin = async (provider) => {
    try {
      await signInWithPopup(auth, provider);
      setLoginMessage({ message: 'Login successful.', type: 'success' });
    } catch (error) {
      console.error('Error during third-party login:', error);
      setLoginMessage({ message: `Error during third-party login: ${error.message}`, type: 'error' });
    }
  };
  return (
    <div>
      {showMfaEnrollment ? (
        <MfaEnrollment
          onEnrollmentComplete={() => {
            setShowMfaEnrollment(false);
            setLoginMessage({
              message: 'MFA enrollment successful! Redirecting...',
              type: 'success',
            });
            setTimeout(() => {
              navigate('/stablehand-welcome'); // Adjust the route as needed
            }, 2000);
          }}
        />
      ) : (
        <form className="space-y-4" onSubmit={handleLogin}>
        <EmailField email={email} setEmail={setEmail} setEmailErrors={setEmailErrors} />
        <PasswordField password={password} setPassword={setPassword} setPasswordErrors={setPasswordErrors} />
        {capsLockWarning && <Alert message="Caps Lock is on" type="warning" />}
        {loginMessage.message && <Alert message={loginMessage.message} type={loginMessage.type} />}
        <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 border border-blue-700 font-bold">Login</Button>
        <div className="mt-4 flex justify-between">
          <Button
            type="button"
            onClick={() => navigate('/reset-password')}
            className="w-full bg-red-500 hover:bg-red-700 border border-red-700 font-bold"
          >
            Reset Password
          </Button>
          <Button
            type="button"
            onClick={onRegisterClick}
            className="w-full bg-green-500 hover:bg-green-700 border border-green-700 font-bold ml-4"
          >
            Register
          </Button>
        </div>
        <ThirdPartyAuthPanel handleThirdPartyAuth={handleThirdPartyLogin} isRegister={false} />
      </form>
      )}
      <div id="recaptcha-container"></div>
    </div>
  );
};

export default LoginForm;
 
 */


/* 
 import React, { useState } from 'react';
import EmailField from '../common/EmailField';
import PasswordField from '../common/PasswordField';
import Button from '../common/Button';
import Alert from '../common/Alert';
import ThirdPartyAuthPanel from '../common/ThirdPartyAuthPanel';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider, facebookProvider, yahooProvider, microsoftProvider, appleProvider } from '../../firebase/firebase';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';

const LoginForm = ({ onLogin, onMaxLoginAttemptsReached, onRegisterClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailErrors, setEmailErrors] = useState([]);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [capsLockWarning, setCapsLockWarning] = useState(false);
  const [loginMessage, setLoginMessage] = useState({ message: '', type: '' });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (emailErrors.length === 0 && passwordErrors.length === 0) {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        setLoginMessage({
          message: 'Login successful! Redirecting...',
          type: 'success',
        });
        setTimeout(() => {
          navigate('/stablehand-welcome');
        }, 2000); // Navigate after 2 seconds to show the success message
      } catch (error) {
        console.error('Error logging in user:', error);
        setLoginAttempts((prev) => prev + 1);
        if (loginAttempts + 1 >= 3) {
          setLoginMessage({
            message: 'Too many attempts. Redirecting to reset password page.',
            type: 'error',
          });
          onMaxLoginAttemptsReached();
          setTimeout(() => {
            navigate('/reset-password');
          }, 2000); // Navigate after 2 seconds to show the error message
        } else {
          setLoginMessage({
            message: 'Login failed. Please check your credentials.',
            type: 'error',
          });
        }
      }
    }
  };

  const handleThirdPartyLogin = async (provider) => {
    try {
      await signInWithPopup(auth, provider);
      setLoginMessage({ message: 'Login successful.', type: 'success' });
    } catch (error) {
      console.error('Error during third-party login:', error);
      setLoginMessage({ message: `Error during third-party login: ${error.message}`, type: 'error' });
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleLogin}>
      <EmailField email={email} setEmail={setEmail} setEmailErrors={setEmailErrors} />
      <PasswordField password={password} setPassword={setPassword} setPasswordErrors={setPasswordErrors} />
      {capsLockWarning && <Alert message="Caps Lock is on" type="warning" />}
      {loginMessage.message && <Alert message={loginMessage.message} type={loginMessage.type} />}
      <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 border border-blue-700 font-bold">Login</Button>
      <div className="mt-4 flex justify-between">
        <Button
          type="button"
          onClick={() => navigate('/reset-password')}
          className="w-full bg-red-500 hover:bg-red-700 border border-red-700 font-bold"
        >
          Reset Password
        </Button>
        <Button
          type="button"
          onClick={onRegisterClick}
          className="w-full bg-green-500 hover:bg-green-700 border border-green-700 font-bold ml-4"
        >
          Register
        </Button>
      </div>
      <ThirdPartyAuthPanel handleThirdPartyAuth={handleThirdPartyLogin} isRegister={false} />
    </form>
  );
};

export default LoginForm; 
 */

//old style 
/* import React, { useState } from 'react';
import EmailField from '../common/EmailField';
import PasswordField from '../common/PasswordField';
import Button from '../common/Button';
import Alert from '../common/Alert';
import { useNavigate } from 'react-router-dom';
import {Frame3,Frame2,Frame} from '../common/Frame';
const LoginForm = ({ onLogin, onMaxLoginAttemptsReached, onRegisterClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailErrors, setEmailErrors] = useState([]);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [capsLockWarning, setCapsLockWarning] = useState(false);
  const [loginMessage, setLoginMessage] = useState({ message: '', type: '' });
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (emailErrors.length === 0 && passwordErrors.length === 0) {
      onLogin(email, password, (success) => {
        if (!success) {
          setLoginAttempts((prev) => prev + 1);
          if (loginAttempts + 1 >= 3) {
            setLoginMessage({
              message: 'Too many attempts. Redirecting to reset password page.',
              type: 'error',
            });
            onMaxLoginAttemptsReached();
            setTimeout(() => {
              navigate('/reset-password');
            }, 2000); // Navigate after 2 seconds to show the error message
          } else {
            setLoginMessage({
              message: 'Login failed. Please check your credentials.',
              type: 'error',
            });
          }
        } else {
          setLoginMessage({
            message: 'Login successful! Redirecting...',
            type: 'success',
          });
          setTimeout(() => {
            navigate('/stablehand-welcome');
          }, 2000); // Navigate after 2 seconds to show the success message
        }
      });
    }
  };

  const handleKeyPress = (e) => {
    setCapsLockWarning(isCapsLockOn(e));
  };

  return (<Frame2>
     
    <form className="space-y-4" onSubmit={handleLogin}>
      <EmailField email={email} setEmail={setEmail} setEmailErrors={setEmailErrors} />
      <PasswordField password={password} setPassword={setPassword} setPasswordErrors={setPasswordErrors} />
      {capsLockWarning && <Alert message="Caps Lock is on" type="warning" />}
      {loginMessage.message && <Alert message={loginMessage.message} type={loginMessage.type} />}
      <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 border border-blue-700">Login</Button>
      <div className="mt-4 flex justify-between">
        <Button
          type="button"
          onClick={() => navigate('/reset-password')}
          className="w-full bg-red-500 hover:bg-red-700 border border-red-700"
        >
          Reset Password
        </Button>
        <Button
          type="button"
          onClick={onRegisterClick}
          className="w-full bg-green-500 hover:bg-green-700 border border-green-700 ml-4"
        >
          Register
        </Button>
      </div>
    </form>
     
    </Frame2>);
};

export default LoginForm; */
