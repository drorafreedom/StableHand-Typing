
import React, { useState } from "react";
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
