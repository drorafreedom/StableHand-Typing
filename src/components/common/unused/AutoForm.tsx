// src/components/common/AuthForm.jsx

//TS version
import React, { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
} from 'firebase/auth';
import { auth } from '../../firebase/firebase';
import Recaptcha from './Recaptcha';

// Define props interface
interface AuthFormProps {
  mode: 'register' | 'login';
}

const AuthForm: React.FC<AuthFormProps> = ({ mode }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>(''); // Only for registration
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    if (mode === 'register' && password !== confirmPassword) {
      setMessage('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'register') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        setMessage('Registration successful! Please check your email for verification.');
        // Reset form fields
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        setMessage('Login successful!');
        // Redirect or perform additional actions
      }

      if (window.recaptchaVerifier) window.recaptchaVerifier.reset(); // Safely reset Recaptcha
    } catch (error: any) {
      console.error('AuthForm Error:', error);
      setMessage(`Error: ${error.message}`);
      if (window.recaptchaVerifier) window.recaptchaVerifier.reset();
    }

    setLoading(false);
  };

  return (
    <div className="auto-form-container">
      <form onSubmit={handleSubmit} className="auto-form">
        <div className="form-group">
          <label htmlFor="auto-email">Email:</label>
          <input
            type="email"
            id="auto-email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="input-field"
          />
        </div>

        <div className="form-group">
          <label htmlFor="auto-password">Password:</label>
          <input
            type="password"
            id="auto-password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            className="input-field"
          />
        </div>

        {mode === 'register' && (
          <div className="form-group">
            <label htmlFor="auto-confirm-password">Confirm Password:</label>
            <input
              type="password"
              id="auto-confirm-password"
              value={confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              className="input-field"
            />
          </div>
        )}

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Processing...' : mode === 'register' ? 'Register' : 'Login'}
        </button>
      </form>

      {/* Integrate Recaptcha */}
      <Recaptcha
        containerId="recaptcha-auto"
        onVerify={() => {}}
        onExpire={() => setMessage('Recaptcha expired. Please try again.')}
      />

      {message && (
        <p className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default AuthForm;

//JS version
// import React, { useState } from 'react';
// import {
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
//   sendEmailVerification,
// } from 'firebase/auth';
// import { auth } from '../../firebase/firebase';
// import Recaptcha from './Recaptcha';

// const AutoForm = ({ mode }) => { // mode can be 'register' or 'login'
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState(''); // Only for registration
//   const [message, setMessage] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setMessage('');
//     setLoading(true);

//     if (mode === 'register' && password !== confirmPassword) {
//       setMessage('Passwords do not match.');
//       setLoading(false);
//       return;
//     }

//     try {
//       if (mode === 'register') {
//         const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//         await sendEmailVerification(userCredential.user);
//         setMessage('Registration successful! Please check your email for verification.');
//         // Optionally, reset form fields
//         setEmail('');
//         setPassword('');
//         setConfirmPassword('');
//       } else {
//         await signInWithEmailAndPassword(auth, email, password);
//         setMessage('Login successful!');
//         // Redirect or perform additional actions
//       }
//       window.recaptchaVerifier.reset(); // Reset Recaptcha after successful action
//     } catch (error) {
//       console.error('AutoForm Error:', error);
//       setMessage(`Error: ${error.message}`);
//       window.recaptchaVerifier.reset(); // Reset Recaptcha on error
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="auto-form-container">
//       <form onSubmit={handleSubmit} className="auto-form">
//         <div className="form-group">
//           <label htmlFor="auto-email">Email:</label>
//           <input
//             type="email"
//             id="auto-email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             placeholder="Enter your email"
//             required
//             className="input-field"
//           />
//         </div>

//         <div className="form-group">
//           <label htmlFor="auto-password">Password:</label>
//           <input
//             type="password"
//             id="auto-password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             placeholder="Enter your password"
//             required
//             className="input-field"
//           />
//         </div>

//         {mode === 'register' && (
//           <div className="form-group">
//             <label htmlFor="auto-confirm-password">Confirm Password:</label>
//             <input
//               type="password"
//               id="auto-confirm-password"
//               value={confirmPassword}
//               onChange={(e) => setConfirmPassword(e.target.value)}
//               placeholder="Confirm your password"
//               required
//               className="input-field"
//             />
//           </div>
//         )}

//         <button type="submit" className="submit-button" disabled={loading}>
//           {loading ? 'Processing...' : mode === 'register' ? 'Register' : 'Login'}
//         </button>
//       </form>

//       {/* Integrate Recaptcha */}
//       <Recaptcha containerId="recaptcha-auto" onVerify={() => {}} onExpire={() => setMessage('Recaptcha expired. Please try again.')} />

//       {message && <p className={`message ${message.includes('Error') ? 'error' : 'success'}`}>{message}</p>}
//     </div>
//   );
// };

// export default AutoForm;



// src/components/common/AuthForm.jsx

// import React, { useState } from 'react';
// import {
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
//   sendEmailVerification,
//   signInWithPopup,
//   GoogleAuthProvider,
//   FacebookAuthProvider,
//   GithubAuthProvider,
//   MicrosoftAuthProvider,
//   TwitterAuthProvider,
//   AppleAuthProvider,
//   signInWithPhoneNumber,
//   PhoneAuthProvider,
//   signInWithCredential,
// } from 'firebase/auth';
// import { auth } from '../firebase/firebase';
// import Recaptcha from './Recaptcha';
// import { isValidPhoneNumber } from 'libphonenumber-js';
// import { useNavigate } from 'react-router-dom';
// import './AuthForm.css'; // Ensure you have corresponding CSS

// const AuthForm = () => {
//   const navigate = useNavigate();

//   // Authentication Method: 'email', 'third-party', 'phone'
//   const [authMethod, setAuthMethod] = useState('email');

//   // Common States
//   const [message, setMessage] = useState('');
//   const [loading, setLoading] = useState(false);

//   // Email/Password States
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');

//   // Phone Authentication States
//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [verificationCode, setVerificationCode] = useState('');
//   const [verificationSent, setVerificationSent] = useState(false);

//   // Third-Party Providers
//   const thirdPartyProviders = [
//     { name: 'Google', provider: new GoogleAuthProvider() },
//     { name: 'Facebook', provider: new FacebookAuthProvider() },
//     { name: 'GitHub', provider: new GithubAuthProvider() },
//     { name: 'Microsoft', provider: new MicrosoftAuthProvider() },
//     { name: 'Twitter', provider: new TwitterAuthProvider() },
//     { name: 'Apple', provider: new AppleAuthProvider() },
//   ];

//   // Handle Authentication Method Change
//   const handleAuthMethodChange = (method) => {
//     setAuthMethod(method);
//     setMessage('');
//     resetForm();
//   };

//   // Reset Form Fields
//   const resetForm = () => {
//     setEmail('');
//     setPassword('');
//     setConfirmPassword('');
//     setPhoneNumber('');
//     setVerificationCode('');
//     setVerificationSent(false);
//     setLoading(false);
//   };

//   // Handle Email/Password Registration/Login
//   const handleEmailAuth = async (e) => {
//     e.preventDefault();
//     setMessage('');
//     setLoading(true);

//     if (!email || !password) {
//       setMessage('Email and password are required.');
//       setLoading(false);
//       return;
//     }

//     if (authMethod === 'register' && password !== confirmPassword) {
//       setMessage('Passwords do not match.');
//       setLoading(false);
//       return;
//     }

//     try {
//       if (authMethod === 'register') {
//         // Register User
//         const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//         await sendEmailVerification(userCredential.user);
//         setMessage('Registration successful! Please check your email for verification.');
//         resetForm();
//       } else {
//         // Login User
//         await signInWithEmailAndPassword(auth, email, password);
//         setMessage('Login successful!');
//         navigate('/dashboard'); // Redirect to Dashboard
//       }
//     } catch (error) {
//       console.error('Email Auth Error:', error);
//       setMessage(`Error: ${error.message}`);
//     }

//     setLoading(false);
//   };

//   // Handle Phone Number Submission
//   const handleSendCode = async (e) => {
//     e.preventDefault();
//     setMessage('');
//     setLoading(true);

//     if (!isValidPhoneNumber(phoneNumber)) {
//       setMessage('Invalid phone number. Please include country code, e.g., +1234567890.');
//       setLoading(false);
//       return;
//     }

//     try {
//       const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
//       window.confirmationResult = confirmationResult;
//       setVerificationSent(true);
//       setMessage('Verification code sent to your phone.');
//     } catch (error) {
//       console.error('Phone Auth Error:', error);
//       setMessage(`Error: ${error.message}`);
//       window.recaptchaVerifier.reset();
//     }

//     setLoading(false);
//   };

//   // Handle Verification Code Confirmation
//   const handleVerifyCode = async (e) => {
//     e.preventDefault();
//     setMessage('');
//     setLoading(true);

//     if (!verificationCode) {
//       setMessage('Please enter the verification code.');
//       setLoading(false);
//       return;
//     }

//     try {
//       const credential = PhoneAuthProvider.credential(
//         window.confirmationResult.verificationId,
//         verificationCode
//       );
//       await signInWithCredential(auth, credential);
//       setMessage('Phone number authenticated successfully!');
//       navigate('/dashboard'); // Redirect to Dashboard
//     } catch (error) {
//       console.error('Verify Code Error:', error);
//       setMessage(`Invalid code. Error: ${error.message}`);
//       window.recaptchaVerifier.reset();
//     }

//     setLoading(false);
//   };

//   // Handle Third-Party Sign-In
//   const handleThirdPartySignIn = async (provider) => {
//     setMessage('');
//     setLoading(true);
//     try {
//       await signInWithPopup(auth, provider);
//       setMessage('Third-Party Sign-In successful!');
//       navigate('/dashboard'); // Redirect to Dashboard
//     } catch (error) {
//       console.error('Third-Party Auth Error:', error);
//       setMessage(`Error: ${error.message}`);
//     }
//     setLoading(false);
//   };

//   return (
//     <div className="auth-form-container">
//       <h2>
//         {authMethod === 'register'
//           ? 'Register'
//           : authMethod === 'login'
//           ? 'Login'
//           : 'Phone Authentication'}
//       </h2>

//       {/* Authentication Method Selection */}
//       <div className="auth-method-selection">
//         <button
//           className={`method-button ${authMethod === 'email' ? 'active' : ''}`}
//           onClick={() => handleAuthMethodChange('email')}
//         >
//           Email {authMethod === 'register' || authMethod === 'login' ? (authMethod === 'register' ? 'Register' : 'Login') : ''}
//         </button>
//         <button
//           className={`method-button ${authMethod === 'third-party' ? 'active' : ''}`}
//           onClick={() => handleAuthMethodChange('third-party')}
//         >
//           Third-Party
//         </button>
//         <button
//           className={`method-button ${authMethod === 'phone' ? 'active' : ''}`}
//           onClick={() => handleAuthMethodChange('phone')}
//         >
//           Phone
//         </button>
//       </div>

//       {/* Recaptcha Component */}
//       <Recaptcha
//         containerId="recaptcha-container"
//         onVerify={() => console.log('Recaptcha Verified')}
//         onExpire={() => setMessage('Recaptcha expired. Please try again.')}
//       />

//       {/* Conditional Rendering Based on Authentication Method */}
//       {authMethod === 'email' && (
//         <form onSubmit={handleEmailAuth} className="auth-form">
//           <div className="form-group">
//             <label htmlFor="auth-email">Email:</label>
//             <input
//               type="email"
//               id="auth-email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               placeholder="Enter your email"
//               required
//               className="input-field"
//             />
//           </div>

//           <div className="form-group">
//             <label htmlFor="auth-password">Password:</label>
//             <input
//               type="password"
//               id="auth-password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               placeholder="Enter your password"
//               required
//               className="input-field"
//             />
//           </div>

//           {authMethod === 'register' && (
//             <div className="form-group">
//               <label htmlFor="auth-confirm-password">Confirm Password:</label>
//               <input
//                 type="password"
//                 id="auth-confirm-password"
//                 value={confirmPassword}
//                 onChange={(e) => setConfirmPassword(e.target.value)}
//                 placeholder="Confirm your password"
//                 required
//                 className="input-field"
//               />
//             </div>
//           )}

//           <button type="submit" className="submit-button" disabled={loading}>
//             {loading ? 'Processing...' : authMethod === 'register' ? 'Register' : 'Login'}
//           </button>
//         </form>
//       )}

//       {authMethod === 'third-party' && (
//         <div className="third-party-auth mt-4">
//           <h3>Or Sign In with:</h3>
//           {thirdPartyProviders.map((providerObj) => (
//             <button
//               key={providerObj.name}
//               onClick={() => handleThirdPartySignIn(providerObj.provider)}
//               className={`third-party-button ${providerObj.name.toLowerCase()}`}
//               disabled={loading}
//             >
//               {loading ? 'Processing...' : `Sign in with ${providerObj.name}`}
//             </button>
//           ))}
//         </div>
//       )}

//       {authMethod === 'phone' && (
//         <div className="phone-auth-section mt-4">
//           {!verificationSent ? (
//             <form onSubmit={handleSendCode} className="phone-auth-form">
//               <div className="form-group">
//                 <label htmlFor="auth-phone">Phone Number:</label>
//                 <input
//                   type="tel"
//                   id="auth-phone"
//                   value={phoneNumber}
//                   onChange={(e) => setPhoneNumber(e.target.value)}
//                   placeholder="+1234567890"
//                   required
//                   className="input-field"
//                 />
//               </div>

//               <button type="submit" className="send-code-button" disabled={!window.recaptchaVerifier || loading}>
//                 {loading ? 'Sending...' : 'Send Verification Code'}
//               </button>
//             </form>
//           ) : (
//             <form onSubmit={handleVerifyCode} className="verify-code-form mt-4">
//               <div className="form-group">
//                 <label htmlFor="auth-verification-code">Verification Code:</label>
//                 <input
//                   type="text"
//                   id="auth-verification-code"
//                   value={verificationCode}
//                   onChange={(e) => setVerificationCode(e.target.value)}
//                   placeholder="Enter verification code"
//                   required
//                   className="input-field"
//                 />
//               </div>

//               <button type="submit" className="verify-code-button" disabled={loading}>
//                 {loading ? 'Verifying...' : 'Verify Code'}
//               </button>

//               <button
//                 type="button"
//                 onClick={() => {
//                   setVerificationSent(false);
//                   setPhoneNumber('');
//                   setVerificationCode('');
//                   window.recaptchaVerifier.reset();
//                   setMessage('Verification reset. Please resend the code.');
//                 }}
//                 className="reset-button mt-2"
//                 disabled={loading}
//               >
//                 Reset Verification
//               </button>
//             </form>
//           )}
//         </div>
//       )}

//       {/* Display Messages */}
//       {message && (
//         <p className={`message mt-4 text-center ${message.includes('Error') ? 'error' : 'success'}`}>
//           {message}
//         </p>
//       )}

//       {/* Toggle Between Register and Login (Only for Email/AuthMethod 'email') */}
//       {authMethod === 'email' && (
//         <div className="toggle-auth mt-4">
//           <button
//             onClick={() => handleAuthMethodChange(authMethod === 'register' ? 'login' : 'register')}
//             className="toggle-button"
//           >
//             {authMethod === 'register' ? 'Already have an account? Login' : "Don't have an account? Register"}
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AuthForm;




// src/components/AuthForm.jsx

// import React, { useState, useEffect } from 'react';
// import {
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
//   sendEmailVerification,
//   signInWithPopup,
//   GoogleAuthProvider,
//   RecaptchaVerifier,
//   PhoneAuthProvider,
//   signInWithCredential,
//   signOut
// } from 'firebase/auth';
// import { auth } from '../../firebase/firebase';
// import { isValidPhoneNumber } from 'libphonenumber-js';

// const AuthForm = () => {
//   // Toggle between Register and Login
//   const [isRegister, setIsRegister] = useState(true);

//   // Email/Password States
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');

//   // Phone Authentication States
//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [verificationCode, setVerificationCode] = useState('');
//   const [verificationSent, setVerificationSent] = useState(false);

//   // Recaptcha State
//   const [recaptchaInitialized, setRecaptchaInitialized] = useState(false);

//   // Message State
//   const [message, setMessage] = useState('');

//   useEffect(() => {
//     // Initialize RecaptchaVerifier
//     if (!window.recaptchaVerifier) {
//       window.recaptchaVerifier = new RecaptchaVerifier(
//         'recaptcha-container',
//         {
//           size: 'normal', // 'normal' to make it visible
//           callback: (response) => {
//             console.log('reCAPTCHA verified');
//             // Optionally, send verification code automatically here
//           },
//           'expired-callback': () => {
//             console.log('reCAPTCHA expired. Please resend the verification code.');
//             setMessage('reCAPTCHA expired. Please resend the verification code.');
//           }
//         },
//         auth
//       );

//       window.recaptchaVerifier.render().then(() => {
//         setRecaptchaInitialized(true);
//       }).catch((error) => {
//         console.error('Recaptcha Render Error:', error);
//         setMessage(`Recaptcha Error: ${error.message}`);
//       });
//     }
//   }, []);

//   // Handle Email/Password Registration/Login
//   const handleEmailAuth = async (e) => {
//     e.preventDefault();
//     setMessage('');

//     if (!email || !password) {
//       setMessage('Email and password are required.');
//       return;
//     }

//     if (isRegister && password !== confirmPassword) {
//       setMessage('Passwords do not match.');
//       return;
//     }

//     try {
//       if (isRegister) {
//         // Register User
//         const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//         await sendEmailVerification(userCredential.user);
//         setMessage('Registration successful! Please verify your email.');
//       } else {
//         // Login User
//         await signInWithEmailAndPassword(auth, email, password);
//         setMessage('Login successful!');
//       }
//     } catch (error) {
//       console.error('Email Auth Error:', error);
//       setMessage(`Error: ${error.message}`);
//     }
//   };

//   // Handle Phone Number Submission
//   const handleSendCode = async (e) => {
//     e.preventDefault();
//     setMessage('');

//     // Validate phone number
//     if (!isValidPhoneNumber(phoneNumber)) {
//       setMessage('Invalid phone number. Please include country code, e.g., +1234567890.');
//       window.recaptchaVerifier.reset();
//       return;
//     }

//     try {
//       const appVerifier = window.recaptchaVerifier;
//       const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
//       window.confirmationResult = confirmationResult;
//       setVerificationSent(true);
//       setMessage('Verification code sent!');
//     } catch (error) {
//       console.error('Phone Auth Error:', error);
//       setMessage(`Error: ${error.message}`);
//       window.recaptchaVerifier.reset();
//     }
//   };

//   // Handle Verification Code Submission
//   const handleVerifyCode = async (e) => {
//     e.preventDefault();
//     setMessage('');

//     if (!verificationCode) {
//       setMessage('Verification code is required.');
//       return;
//     }

//     try {
//       const confirmationResult = window.confirmationResult;
//       const credential = PhoneAuthProvider.credential(
//         confirmationResult.verificationId,
//         verificationCode
//       );
//       const userCredential = await signInWithCredential(auth, credential);
//       setMessage('Phone number authenticated successfully!');
//       setVerificationSent(false);
//       setPhoneNumber('');
//       setVerificationCode('');
//       window.recaptchaVerifier.reset();
//     } catch (error) {
//       console.error('Verify Code Error:', error);
//       setMessage(`Invalid code. Error: ${error.message}`);
//       window.recaptchaVerifier.reset();
//     }
//   };

//   // Handle Google Sign-In
//   const handleGoogleSignIn = async () => {
//     const provider = new GoogleAuthProvider();
//     try {
//       await signInWithPopup(auth, provider);
//       setMessage('Google Sign-In successful!');
//     } catch (error) {
//       console.error('Google Sign-In Error:', error);
//       setMessage(`Error: ${error.message}`);
//     }
//   };

//   // Handle Sign Out (optional, useful in Dashboard)
//   const handleSignOut = async () => {
//     try {
//       await signOut(auth);
//       setMessage('Signed out successfully!');
//     } catch (error) {
//       console.error('Sign Out Error:', error);
//       setMessage(`Error: ${error.message}`);
//     }
//   };

//   // Toggle between Register and Login
//   const toggleForm = () => {
//     setIsRegister(!isRegister);
//     setMessage('');
//   };

//   return (
//     <div className="auth-form-container">
//       <h2>{isRegister ? 'Register' : 'Login'}</h2>

//       {/* Toggle Button */}
//       <button onClick={toggleForm} className="toggle-button">
//         {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
//       </button>

//       {/* Email/Password Form */}
//       <form onSubmit={handleEmailAuth} className="auth-form">
//         <div className="form-group">
//           <label htmlFor="email">Email:</label>
//           <input
//             type="email"
//             id="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             placeholder="Enter email"
//             required
//             className="input-field"
//           />
//         </div>

//         <div className="form-group">
//           <label htmlFor="password">Password:</label>
//           <input
//             type="password"
//             id="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             placeholder="Enter password"
//             required
//             className="input-field"
//           />
//         </div>

//         {isRegister && (
//           <div className="form-group">
//             <label htmlFor="confirmPassword">Confirm Password:</label>
//             <input
//               type="password"
//               id="confirmPassword"
//               value={confirmPassword}
//               onChange={(e) => setConfirmPassword(e.target.value)}
//               placeholder="Confirm password"
//               required
//               className="input-field"
//             />
//           </div>
//         )}

//         <button type="submit" className="submit-button">
//           {isRegister ? 'Register' : 'Login'}
//         </button>
//       </form>

//       {/* Third-Party Authentication */}
//       <div className="third-party-auth mt-4">
//         <h3>Or Sign In with:</h3>
//         <button onClick={handleGoogleSignIn} className="google-signin-button">
//           Sign in with Google
//         </button>
//         {/* Add more third-party buttons here if needed */}
//       </div>

//       {/* Phone Authentication */}
//       <div className="phone-auth mt-6">
//         <h3>Phone Authentication</h3>

//         {/* Send Verification Code */}
//         {!verificationSent && (
//           <form onSubmit={handleSendCode} className="phone-auth-form mt-2">
//             <div className="form-group">
//               <label htmlFor="phone">Phone Number:</label>
//               <input
//                 type="tel"
//                 id="phone"
//                 value={phoneNumber}
//                 onChange={(e) => setPhoneNumber(e.target.value)}
//                 placeholder="+1234567890"
//                 required
//                 className="input-field"
//               />
//             </div>

//             {/* Recaptcha Container */}
//             <div id="recaptcha-container" className="recaptcha-container mb-4"></div>

//             <button type="submit" className="send-code-button" disabled={!recaptchaInitialized}>
//               Send Verification Code
//             </button>
//           </form>
//         )}

//         {/* Verify Code */}
//         {verificationSent && (
//           <form onSubmit={handleVerifyCode} className="verify-code-form mt-4">
//             <div className="form-group">
//               <label htmlFor="verificationCode">Verification Code:</label>
//               <input
//                 type="text"
//                 id="verificationCode"
//                 value={verificationCode}
//                 onChange={(e) => setVerificationCode(e.target.value)}
//                 placeholder="Enter verification code"
//                 required
//                 className="input-field"
//               />
//             </div>

//             <button type="submit" className="verify-code-button">
//               Verify Code
//             </button>

//             <button
//               type="button"
//               onClick={() => {
//                 window.recaptchaVerifier.reset();
//                 setVerificationSent(false);
//                 setPhoneNumber('');
//                 setVerificationCode('');
//                 setMessage('Recaptcha reset. Please resend the verification code.');
//               }}
//               className="reset-button mt-2"
//             >
//               Reset Verification
//             </button>
//           </form>
//         )}
//       </div>

//       {/* Messages */}
//       {message && (
//         <p className={`message mt-4 text-center ${message.includes('Error') ? 'error' : 'success'}`}>
//           {message}
//         </p>
//       )}
//     </div>
//   );
// };

// export default AuthForm;

