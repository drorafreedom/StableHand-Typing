// src/components/forms/RegistrationForm.tsx
// TS Version

import React, { useState } from 'react';
import {
  getAuth,
  sendSignInLinkToEmail,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  linkWithCredential,
  EmailAuthProvider,
  UserCredential,
} from "firebase/auth";
import { auth } from "../../firebase/firebase";
import EmailField from "../common/EmailField";
import PasswordField from "../common/PasswordField";
import ConfirmPasswordField from "../common/ConfirmPasswordField";
import PhoneNumberField from "../common/PhoneNumberField";
import Alert from "../common/Alert";
import Button from "../common/Button";
import InputField from "../common/InputField";

const RegistrationForm: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [verificationSent, setVerificationSent] = useState<boolean>(false);
  const [message, setMessage] = useState<{ message: string; type: string }>({ message: '', type: '' });
  const [emailErrors, setEmailErrors] = useState<string[]>([]);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [confirmPasswordErrors, setConfirmPasswordErrors] = useState<string[]>([]);
  const [phoneErrors, setPhoneErrors] = useState<string[]>([]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (
      emailErrors.length > 0 ||
      passwordErrors.length > 0 ||
      confirmPasswordErrors.length > 0 ||
      phoneErrors.length > 0
    ) {
      setMessage({ message: 'Please fix the errors in the form.', type: 'error' });
      return;
    }

    try {
      // Create user with email and password
      const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Send email verification
      await sendEmailVerification(user);
      setMessage({ message: 'A verification email has been sent to your email address.', type: 'success' });

      // Send SMS verification
      const appVerifier = window.recaptchaVerifier;
      const formattedPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhoneNumber, appVerifier);

      window.confirmationResult = confirmationResult;
      setVerificationSent(true);
      setMessage({ message: 'Verification code sent to your phone.', type: 'success' });
    } catch (error: any) {
      console.error('Error during registration:', error);
      setMessage({ message: `Error: ${error.message}`, type: 'error' });
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await window.confirmationResult.confirm(verificationCode);
      const phoneUser = result.user;

      const credential = EmailAuthProvider.credential(email, password);
      await linkWithCredential(phoneUser, credential);

      setMessage({ message: 'Registration successful. Email and phone verified.', type: 'success' });
    } catch (error: any) {
      console.error('Error verifying code:', error);
      setMessage({ message: `Error verifying code: ${error.message}`, type: 'error' });
    }
  };

  return (
    <div>
      <form onSubmit={verificationSent ? handleVerifyCode : handleRegister}>
        {!verificationSent ? (
          <>
            {/* Email Field */}
            <EmailField email={email} setEmail={setEmail} setEmailErrors={setEmailErrors} />

            {/* Password Field */}
            <PasswordField password={password} setPassword={setPassword} setPasswordErrors={setPasswordErrors} />

            {/* Confirm Password Field */}
            <ConfirmPasswordField
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              password={password}
              setConfirmPasswordErrors={setConfirmPasswordErrors}
            />

            {/* Phone Number Field */}
            <PhoneNumberField
              phoneNumber={phoneNumber}
              setPhoneNumber={setPhoneNumber}
              setPhoneErrors={setPhoneErrors}
              errors={phoneErrors}
            />

            {/* Display Messages */}
            {message.message && <Alert message={message.message} type={message.type} />}

            <Button type="submit" className="w-full bg-green-500 hover:bg-green-700">
              Register
            </Button>
          </>
        ) : (
          <>
            {/* Verification Code Field */}
            <InputField
              label="Verification Code"
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter the verification code sent to your phone"
            />
            {message.message && <Alert message={message.message} type={message.type} />}
            <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-700">
              Verify Code
            </Button>
          </>
        )}
        <div id="recaptcha-container"></div>
      </form>
    </div>
  );
};

export default RegistrationForm;

/* ---------------------------------------------
   Below are the commented-out previous versions
   ---------------------------------------------
   - Simple email-only registration (v1)
   - Basic email + password registration (v2)
   - Full implementation with phone and email (v3)
*/


//+++++++++++JS version+++++++++++++++++
// src/components/forms/RegistrationForm.jsx

//Js version
/* import React, { useState } from 'react';
import { getAuth, sendSignInLinkToEmail } from "firebase/auth";

const RegistrationForm = () => {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSendVerification = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    const actionCodeSettings = {
      url: 'http://localhost:3000/complete-registration', // Update with your app's domain
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      setSuccess("A verification link has been sent to your email. Please verify to continue.");
      window.localStorage.setItem('emailForRegistration', email); // Save email temporarily
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSendVerification}>
      <h2>Register</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit">Send Verification Link</button>
    </form>
  );
};

export default RegistrationForm; */







// src/components/RegistrationForm.jsx
//   users receive a verification email after registering but does not prevent Firebase from creating the user record before email verification. T. ( even junk mail) 
 
/*     import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";

const RegistrationForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    const auth = getAuth();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      setSuccess("Registration successful. Verification email sent!");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <h2>Register</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Register</button>
    </form>
  );
};

export default RegistrationForm; */
 

// src/components/RegistrationForm.jsx version1
//doesnt work. it gets error and despite that it create a user including junk . no verification // the interface is ok. including the phone number full implementaiton of flexilbe phone .
//   import React, { useState, useEffect } from 'react';
// import { auth, RecaptchaVerifier,EmailAuthProvider, signInWithPhoneNumber } from '../../firebase/firebase';
// import {
//   createUserWithEmailAndPassword,
//   sendEmailVerification,
//     linkWithCredential,
// } from 'firebase/auth';
// import EmailField from '../common/EmailField';
// import PasswordField from '../common/PasswordField';
// import ConfirmPasswordField from '../common/ConfirmPasswordField';
// import PhoneNumberField from '../common/PhoneNumberField';
// import Alert from '../common/Alert';
// import Button from '../common/Button';
// import { validateEmail, validatePassword, validatePhoneNumber } from '../../utils/validation';
// import InputField from '../common/InputField';


// const RegistrationForm = () => {
//   const [email, setEmail] = useState('');
//   const [emailErrors, setEmailErrors] = useState([]);
//   const [password, setPassword] = useState('');
//   const [passwordErrors, setPasswordErrors] = useState([]);
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [confirmPasswordErrors, setConfirmPasswordErrors] = useState([]);
//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [phoneErrors, setPhoneErrors] = useState([]);
//   const [verificationCode, setVerificationCode] = useState('');
//   const [verificationSent, setVerificationSent] = useState(false);
//   const [emailVerified, setEmailVerified] = useState(false);
//   const [message, setMessage] = useState({ message: '', type: '' });

//   // Initialize reCAPTCHA
// /*   useEffect(() => {
//     if (!window.recaptchaVerifier) {
//       window.recaptchaVerifier = new RecaptchaVerifier(
//         'recaptcha-container',
//         {
//           size: 'invisible',
//           callback: (response) => {
//             console.log('reCAPTCHA solved:', response);
//           },
//           'expired-callback': () => {
//             window.recaptchaVerifier.reset();
//           },
//         },
//         auth
//       );
//     }
//   }, []);
//  */
//   // Handle form submissions
//   const handleRegister = async (e) => {
//     e.preventDefault();

//     // Check if there are errors in input validation
//     if (
//       emailErrors.length > 0 ||
//       passwordErrors.length > 0 ||
//       confirmPasswordErrors.length > 0 ||
//       phoneErrors.length > 0
//     ) {
//       setMessage({ message: 'Please fix the errors in the form.', type: 'error' });
//       return;
//     }

//     try {
//       // Step 1: Register user with email and password
//       const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//       const user = userCredential.user;

//       // Step 2: Send email verification
//       await sendEmailVerification(user);
//       setMessage({ message: 'A verification email has been sent to your email address.', type: 'success' });

//       // Step 3: Send SMS verification code to phone number
//       const appVerifier = window.recaptchaVerifier;
//       const formattedPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber : '+' + phoneNumber;
//       const confirmationResult = await signInWithPhoneNumber(auth, formattedPhoneNumber, appVerifier);

//       window.confirmationResult = confirmationResult;
//       setVerificationSent(true);
//       setMessage({ message: 'Verification code sent to your phone.', type: 'success' });
//     } catch (error) {
//       console.error('Error during registration:', error);
//       setMessage({ message: `Error: ${error.message}`, type: 'error' });
//     }
//   };

//   // Handle verification code submission
//   const handleVerifyCode = async (e) => {
//     e.preventDefault();

//     try {
//       const result = await window.confirmationResult.confirm(verificationCode);
//       const phoneUser = result.user;

//       const credential = EmailAuthProvider.credential(email, password);
//       await linkWithCredential(phoneUser, credential);

//       setMessage({ message: 'Registration successful. Email and phone verified.', type: 'success' });
//     } catch (error) {
//       console.error('Error verifying code:', error);
//       setMessage({ message: `Error verifying code: ${error.message}`, type: 'error' });
//     }
//   };

//   return (
//     <div>
//       <form onSubmit={verificationSent ? handleVerifyCode : handleRegister}>
//         {!verificationSent ? (
//           <>
//             {/* Email Field */}
//             <EmailField
//               email={email}
//               setEmail={setEmail}
//               setEmailErrors={setEmailErrors}
//             />
            
//             {/* Password Field */}
//             <PasswordField
//               password={password}
//               setPassword={setPassword}
//               setPasswordErrors={setPasswordErrors}
//             />

//             {/* Confirm Password Field */}
//             <ConfirmPasswordField
//               confirmPassword={confirmPassword}
//               setConfirmPassword={setConfirmPassword}
//               password={password}
//               setConfirmPasswordErrors={setConfirmPasswordErrors}
//             />

//             {/* Phone Number Field */}
//             <PhoneNumberField
//               phoneNumber={phoneNumber}
//               setPhoneNumber={setPhoneNumber}
//               setPhoneErrors={setPhoneErrors}
//               errors={phoneErrors}
//             />

//             {/* Display Messages */}
//             {message.message && <Alert message={message.message} type={message.type} />}

//             <Button type="submit" className="w-full bg-green-500 hover:bg-green-700">
//               Register
//             </Button>
//           </>
//         ) : (
//           <>
//             {/* Verification Code Field */}
//             <InputField
//               label="Verification Code"
//               type="text"
//               value={verificationCode}
//               onChange={(e) => setVerificationCode(e.target.value)}
//               placeholder="Enter the verification code sent to your phone"
//             />
//             {message.message && <Alert message={message.message} type={message.type} />}
//             <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-700">
//               Verify Code
//             </Button>
//           </>
//         )}
//         <div id="recaptcha-container"></div>
//       </form>
//     </div>
//   );
// };

// export default RegistrationForm;
 