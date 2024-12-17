// src/components/organisms/LoginForm.jsx
import React, { useState, useRef } from 'react';
import EmailField from '../common/EmailField';
import PasswordField from '../common/PasswordField';
import Button from '../common/Button';
import Alert from '../common/Alert';
import RecaptchaV2 from '../common/RecaptchaV2';
import { useNavigate } from 'react-router-dom';
import { loginWithEmail } from '../../firebase/auth';
import { validateEmail, validatePassword } from '../../utils/validation';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginMessage, setLoginMessage] = useState({ message: '', type: '' });
  const [emailErrors, setEmailErrors] = useState([]);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [isRecaptchaVerified, setIsRecaptchaVerified] = useState(false);

  const emailFieldRef = useRef(null);
  const passwordFieldRef = useRef(null);
  const navigate = useNavigate();
  let loginAttempts = 0;

  // Clear any error messages from the form fields
  const clearErrors = () => {
    setEmailErrors([]);
    setPasswordErrors([]);
    emailFieldRef.current?.clearLocalErrors();
    passwordFieldRef.current?.clearLocalErrors();
  };

  // Handle login attempt
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!isRecaptchaVerified) {
      alert('Please complete reCAPTCHA to proceed.');
      return;
    }

    clearErrors();

    // Validate email and password fields
    const emailValidationErrors = validateEmail(email);
    const passwordValidationErrors = validatePassword(password);

    if (emailValidationErrors.length || passwordValidationErrors.length) {
      setEmailErrors(emailValidationErrors);
      setPasswordErrors(passwordValidationErrors);
      return;
    }

    try {
      // Attempt to login
      await loginWithEmail(email, password);
      setLoginMessage({ message: 'Login successful! Redirecting...', type: 'success' });
      setTimeout(() => navigate('/stablehand-welcome'), 2000);
    } catch (error) {
      console.error('Login failed:', error);
      loginAttempts += 1;

      if (loginAttempts >= 3) {
        setLoginMessage({ message: 'Too many failed attempts. Redirecting to reset password.', type: 'error' });
        setTimeout(() => navigate('/reset-password'), 2000);
      } else {
        setLoginMessage({ message: 'Incorrect credentials. Please try again.', type: 'error' });
      }

      // Reset reCAPTCHA verification
      setIsRecaptchaVerified(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
      <form onSubmit={handleLogin}>
        <EmailField
          email={email}
          setEmail={setEmail}
          setEmailErrors={setEmailErrors}
          ref={emailFieldRef}
        />
        <PasswordField
          password={password}
          setPassword={setPassword}
          setPasswordErrors={setPasswordErrors}
          ref={passwordFieldRef}
        />
        {loginMessage.message && <Alert message={loginMessage.message} type={loginMessage.type} />}

        {/* Render reCAPTCHA if not verified */}
        {!isRecaptchaVerified && (
          <RecaptchaV2
            containerId="login-recaptcha"
            onVerify={() => setIsRecaptchaVerified(true)}
            onExpire={() => setIsRecaptchaVerified(false)}
          />
        )}

        <Button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font py-2 px-4 rounded-lg"
        >
          Login With Email
        </Button>
      </form>

      {/* Reset Password and Register Links */}
      <div className="mt-4 flex justify-between">
        <Button onClick={() => navigate('/reset-password')} className="w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">
          Reset Password
        </Button>
        <Button onClick={() => navigate('/register')} className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg ml-4">
          Register
        </Button>
      </div>
    </div>
  );
};

export default LoginForm;



 // src/components/organisms/LoginForm.jsx
/* import React, { useState } from 'react';
import EmailField from '../common/EmailField';
import PasswordField from '../common/PasswordField';
import Button from '../common/Button';
import Alert from '../common/Alert';
import ThirdPartyAuthPanel from '../common/ThirdPartyAuthPanel';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from '../../firebase/firebase';
import { validateEmail, validatePassword } from '../../utils/validation';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginMessage, setLoginMessage] = useState({ message: '', type: '' });
  const [emailErrors, setEmailErrors] = useState([]);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [providerError, setProviderError] = useState('');
  const navigate = useNavigate();

  // Clear **all errors** whenever any login method is triggered
  const clearAllErrors = () => {
    setEmailErrors([]);
    setPasswordErrors([]);
    setProviderError('');
    setLoginMessage({ message: '', type: '' });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    clearAllErrors(); // Ensure previous third-party errors are cleared

    const emailValidationErrors = validateEmail(email);
    const passwordValidationErrors = validatePassword(password);

    if (emailValidationErrors.length || passwordValidationErrors.length) {
      setEmailErrors(emailValidationErrors);
      setPasswordErrors(passwordValidationErrors);
      return; // Stop if validation errors exist
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setLoginMessage({ message: 'Login successful! Redirecting...', type: 'success' });
      setTimeout(() => navigate('/stablehand-welcome'), 2000);
    } catch (error) {
      console.error('Error logging in:', error);
      setLoginMessage({ message: 'Login failed. Check your credentials.', type: 'error' });
    }
  };

  const handleThirdPartyLogin = async (provider, providerName) => {
    clearAllErrors(); // Ensure previous regular login errors are cleared

    try {
      const result = await signInWithPopup(auth, provider);
      setLoginMessage({ message: `${providerName} login successful!`, type: 'success' });
      setTimeout(() => navigate('/stablehand-welcome'), 2000);
    } catch (error) {
      console.error(`Error during ${providerName} login:`, error);
      setProviderError(`${providerName} Error: ${error.message}`);
    }
  };

  return (
    <div>
       <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
      <form className="space-y-4" onSubmit={handleLogin}>
        <EmailField email={email} setEmail={setEmail} setEmailErrors={setEmailErrors} />
        <PasswordField password={password} setPassword={setPassword} setPasswordErrors={setPasswordErrors} />

        {emailErrors.length > 0 && <Alert message={emailErrors.join(', ')} type="error" />}
        {passwordErrors.length > 0 && <Alert message={passwordErrors.join(', ')} type="error" />}
        {loginMessage.message && <Alert message={loginMessage.message} type={loginMessage.type} />}

        <Button 
          type="submit" 
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
        >
          Login
        </Button>
      </form>

      <div className="mt-4 w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <ThirdPartyAuthPanel 
          handleThirdPartyAuth={(provider, providerName) => handleThirdPartyLogin(provider, providerName)} 
        />
      </div>

      {providerError && <Alert message={providerError} type="error" />}

      <div className="mt-4 flex justify-between">
        <Button
          type="button"
          onClick={() => navigate('/reset-password')}
          className="w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
        >
          Reset Password
        </Button>
        <Button
          type="button"
          onClick={() => navigate('/register')}
          className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg ml-4"
        >
          Register
        </Button>
      </div>
    </div>
    </div>
  );
};

export default LoginForm; */
// src/components/organisms/LoginForm.jsx last one
// import React, { useState, useRef } from 'react';
// import EmailField from '../common/EmailField';
// import PasswordField from '../common/PasswordField';
// import Button from '../common/Button';
// import Alert from '../common/Alert';
// //import ThirdPartyAuthPanel from '../common/ThirdPartyAuthPanel';
// // import ThirdPartyUI from '../common/ThirdPartyUI';
// import RecaptchaV2 from '../common/RecaptchaV2'; 
// import { useNavigate } from 'react-router-dom';
//  import { signInWithEmailAndPassword } from 'firebase/auth';
// import { loginWithEmail } from '../../firebase/auth';
// import { auth } from '../../firebase/firebase';
// import { validateEmail, validatePassword } from '../../utils/validation';
// //import PhoneAuth from '../common/PhoneAuth';
// //import { loginWithEmailPassword } from '../../firebase/auth';
// import { getFriendlyErrorMessage } from '../../utils/validation'; 



// const LoginForm = () => {

//   const [isRecaptchaVerified, setIsRecaptchaVerified] = useState(false);

//   // const [isVerified, setIsVerified] = useState(false);
//   // const recaptchaRef = useRef(null);
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [loginMessage, setLoginMessage] = useState({ message: '', type: '' });
//  // const [loginMessage, setLoginMessage] = useState(null);
//   const [emailErrors, setEmailErrors] = useState([]);
//   const [passwordErrors, setPasswordErrors] = useState([]);

//   const emailFieldRef = useRef(null);
//   const passwordFieldRef = useRef(null);
//   const navigate = useNavigate();

//  // Toggle Between Register and Login
//  const toggleForm = () => {
//   setIsRegister(!isRegister);
//   clearAllErrors();
//   setVerificationSent(false);
//   setPhoneNumber('');
//   setVerificationCode('');
// };

//   const clearErrors = () => {
//       setEmailErrors([]);
//       setPasswordErrors([]);
//       emailFieldRef.current?.clearLocalErrors();
//       passwordFieldRef.current?.clearLocalErrors();
//   };

//   const clearEmailAndPasswordErrors = () => {
//     setEmailErrors([]);
//     setPasswordErrors([]);

//     // Optionally, clear errors inside EmailField and PasswordField
//     emailFieldRef.current?.clearLocalErrors();
//     passwordFieldRef.current?.clearLocalErrors();
//   };

//   //new code  for hanleLogin

//  /*  Differences Explained:
//   Use of loginWithEmailPassword Function:
  
//   Your Code: Directly uses signInWithEmailAndPassword(auth, email, password) within the component.
//   My Suggestion: Calls a custom loginWithEmailPassword(email, password) function, which is defined in your auth.js file.
//   Email Verification Handling:
  
//   Your Code: Does not check if the user's email is verified after logging in.
//   My Suggestion: The loginWithEmailPassword function includes logic to check if user.emailVerified is true. If not, it sends a verification email and throws an error prompting the user to verify their email.
//   Error Handling:
  
//   Your Code: Catches errors from signInWithEmailAndPassword and displays a generic error message: 'Login failed. Check your credentials.'
//   My Suggestion: Passes the specific error message from the loginWithEmailPassword function to the user, which can include messages about email verification or other issues.
//   Validation Logic:
  
//   Your Code: Performs email and password validation before attempting to sign in, which is good.
//   My Suggestion: Assumes validation is already handled, focusing on the email verification logic.
//   Why the Differences Matter:
//   Centralized Authentication Logic:
  
//   By using the loginWithEmailPassword function from auth.js, you centralize your authentication logic. This function:
  
//   Handles the sign-in process.
//   Checks if the user's email is verified.
//   Sends a new verification email if needed.
//   Throws appropriate errors that can be displayed to the user.
//   Benefits:
  
//   Code Reusability: You can use loginWithEmailPassword wherever you need to handle email/password login.
//   Consistency: Ensures that email verification is consistently enforced across your application.
//   Maintainability: Easier to update authentication logic in one place if needed.
//   Email Verification Enforcement:
  
//   In your current code, a user can log in even if their email is not verified. This can be a security concern, especially if you require users to verify their email addresses before accessing certain parts of your application.
  
//   With My Suggestion:
  
//   The loginWithEmailPassword function checks user.emailVerified.
//   If the email is not verified, it sends a new verification email and throws an error.
//   This prompts the user to check their email and complete the verification process before logging in. */




// const handleLogin = async (e) => {
//   e.preventDefault();
//   if (!isRecaptchaVerified) {
//     alert('Please complete reCAPTCHA to proceed.');
//     return;
//   }
//   clearEmailAndPasswordErrors();
//   if (!isRecaptchaVerified) {
//     alert("Please complete reCAPTCHA to proceed.");
//     return;
//   }
//   // Validation logic
//   const emailValidationErrors = validateEmail(email);
//   const passwordValidationErrors = validatePassword(password);

//   if (emailValidationErrors.length || passwordValidationErrors.length) {
//     setEmailErrors(emailValidationErrors);
//     setPasswordErrors(passwordValidationErrors);
//     return; // Stop if validation errors exist
//   }

//   try {
//     // Use the custom login function
//     const user = await loginWithEmail(email, password);
//     setLoginMessage({ message: 'Login successful! Redirecting...', type: 'success' });
//     setTimeout(() => navigate('/stablehand-welcome'), 2000);
//   } catch (error) {
//     console.error('Error logging in:', error);
//     // Display the specific error message from the auth function
//     //setLoginMessage({ message: error.message, type: 'error' });
//     setLoginMessage({ message: getFriendlyErrorMessage(error), type: 'error' });
//   }
// };

//   // old  code tofr handleLogin 
// //   const handleLogin = async (e) => {
// //     e.preventDefault();
// //     clearEmailAndPasswordErrors(); // Ensure errors are cleared before validation
// //     //clearErrors();
// //     const emailValidationErrors = validateEmail(email);
// //     const passwordValidationErrors = validatePassword(password);

// //     if (emailValidationErrors.length || passwordValidationErrors.length) {
// //       setEmailErrors(emailValidationErrors);
// //       setPasswordErrors(passwordValidationErrors);
// //       return; // Stop if validation errors exist
// //     }
// // /*  if (validateEmail(email).length || validatePassword(password).length) {
// //           setEmailErrors(validateEmail(email));
// //           setPasswordErrors(validatePassword(password));
// //           return;
// //       } */
// //       try {
// //       await signInWithEmailAndPassword(auth, email, password);
// //       setLoginMessage({ message: 'Login successful! Redirecting...', type: 'success' });
// //       setTimeout(() => navigate('/stablehand-welcome'), 2000);
// //     } catch (error) {
// //       console.error('Error logging in:', error);
// //       setLoginMessage({ message: 'Login failed. Check your credentials.', type: 'error' });
// //     }  
// //---------------------------------
    
//     /*     try {
//       setIsLoggingIn(true); // Disable buttons during login
//       await signInWithEmailAndPassword(auth, email, password);
//       setLoginMessage({ message: 'Login successful! Redirecting...', type: 'success' });

//       // Hold the message for 2 seconds before navigating
//       setTimeout(() => {
//         navigate('/stablehand-welcome');
//       }, 2000);
//     } catch (error) {
//       console.error('Error logging in:', error);
//       setLoginMessage({ message: 'Login failed. Check your credentials.', type: 'error' });
//       setIsLoggingIn(false); // Re-enable buttons on failure
//     } 
 
//   };*/




//   return (
//     <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
//       <form className="space-y-4" onSubmit={handleLogin}>
//         <EmailField
//           email={email}
//           setEmail={setEmail}
//           setEmailErrors={setEmailErrors}
//           ref={emailFieldRef}
//         />
//         <PasswordField
//           password={password}
//           setPassword={setPassword}
//           setPasswordErrors={setPasswordErrors}
//           ref={passwordFieldRef}
//         />

//        {/*   {emailErrors.length > 0 && <Alert message={emailErrors.join(', ')} type="error" />}
//         {passwordErrors.length > 0 && <Alert message={passwordErrors.join(', ')} type="error" />} */}
//         {loginMessage.message && <Alert message={loginMessage.message} type={loginMessage.type} />} 
//         <RecaptchaV2 containerId="login-recaptcha" onVerify={setIsRecaptchaVerified} />

//         <Button
//           type="submit"
//           className="w-full bg-blue-500 hover:bg-blue-700 text-white font py-2 px-4 rounded-lg"
//         >
//           Login With Email
//         </Button>
//       </form>
 

// {/* <ThirdPartyAuthPanel clearEmailAndPasswordErrors={clearEmailAndPasswordErrors} /> 
// <PhoneAuth/> */}


// <RecaptchaV2
//        // ref={recaptchaRef}
//         containerId="login-recaptcha"
//         onVerify={() => setIsVerified(true)}
//         onExpire={() => setIsVerified(false)}
//       />
//         {/* Register and Reset Password Buttons */}
//         <div className="mt-4 flex justify-between">
//         <Button
//           onClick={() => navigate('/reset-password')}
//           className="w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
//         >
//           Reset Password
//         </Button>
//         <Button
//           onClick={() => navigate('/register')}
//           className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg ml-4"
//         >
//           Register
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default LoginForm;


 