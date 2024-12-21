// src/components/common/PhoneAuth.tsx
// TS version

import React, { useState, useEffect } from 'react';
import { getAuth, signInWithPhoneNumber, RecaptchaVerifier, ConfirmationResult } from 'firebase/auth';
import { auth } from '../../firebase/firebase';
import { isValidPhoneNumber } from 'libphonenumber-js';

interface PhoneAuthProps {
  isRegister: boolean; // Determines whether the component is in "Register" or "Login" mode
}

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
    confirmationResult: ConfirmationResult;
  }
}

const PhoneAuth: React.FC<PhoneAuthProps> = ({ isRegister }) => {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [verificationSent, setVerificationSent] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [recaptchaInitialized, setRecaptchaInitialized] = useState<boolean>(false);

  // Initialize reCAPTCHA
  const setupRecaptcha = () => {
    if (!recaptchaInitialized) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        'recaptcha-container',
        {
          size: 'normal',
          callback: () => {
            console.log('reCAPTCHA verified.');
          },
          'expired-callback': () => {
            console.log('reCAPTCHA expired. Please solve it again.');
          },
        },
        auth
      );
      window.recaptchaVerifier.render();
      setRecaptchaInitialized(true);
    }
  };

  // Handle sending the verification code
  const handleSendCode = async () => {
    if (!isValidPhoneNumber(phoneNumber)) {
      setMessage('Please enter a valid phone number.');
      return;
    }

    setupRecaptcha();
    const appVerifier = window.recaptchaVerifier;

    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      window.confirmationResult = confirmationResult;
      setVerificationSent(true);
      setMessage('Verification code sent!');
    } catch (error: any) {
      console.error('Error sending SMS:', error);
      setMessage(`Error: ${error.message}`);
    }
  };

  // Handle verifying the code
  const handleVerifyCode = async () => {
    try {
      const confirmationResult = window.confirmationResult;
      const result = await confirmationResult.confirm(verificationCode);
      console.log('User signed in:', result.user);
      setMessage('Phone verification successful!');
    } catch (error: any) {
      console.error('Error verifying code:', error);
      setMessage(`Invalid code. Error: ${error.message}`);
    }
  };

  return (
    <div className="phone-auth-container">
      <h2>{isRegister ? 'Register with' : 'Login with'} Phone Authentication</h2>

      <div>
        <input
          type="text"
          placeholder="Enter phone number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="w-full p-2 border rounded-lg mb-2"
        />
        <div id="recaptcha-container" className="mb-4"></div>
        <button
          onClick={handleSendCode}
          className="w-full bg-blue-500 text-white p-2 rounded-lg"
        >
          Send Verification Code
        </button>
      </div>

      {verificationSent && (
        <div className="mt-4">
          <input
            type="text"
            placeholder="Enter verification code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            className="w-full p-2 border rounded-lg mb-2"
          />
          <button
            onClick={handleVerifyCode}
            className="w-full bg-green-500 text-white p-2 rounded-lg"
          >
            Verify Code
          </button>
        </div>
      )}

      {message && <p className="mt-4 text-center text-red-500">{message}</p>}
    </div>
  );
};

export default PhoneAuth;



//=======================JS version=========================
// // src/components/common/PhoneAuth.jsx  WORKING  WITH CAPTIVA 
// //JS version
//   import React, { useState, useEffect } from 'react';
//  import { getAuth, signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';
// import { auth } from '../../firebase/firebase';  
//   import { isValidPhoneNumber } from 'libphonenumber-js';
// const PhoneAuth = ( isRegister) => {
//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [verificationCode, setVerificationCode] = useState('');
//   const [verificationSent, setVerificationSent] = useState(false);
//   const [message, setMessage] = useState('');
//   const [recaptchaInitialized, setRecaptchaInitialized] = useState(false);
//  // const [isRegister, setIsRegister] = useState('isRegister');

//   // Initialize reCAPTCHA on first render or when the button is clicked
//   const setupRecaptcha = () => {
//     if (!recaptchaInitialized) {
//       window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
//         'size': 'normal',
//         'callback': (response) => {
//           console.log('reCAPTCHA verified.');
//         },
//         'expired-callback': () => {
//           console.log('reCAPTCHA expired. Please solve it again.');
//         }
//       }, auth);
//       window.recaptchaVerifier.render();
//       setRecaptchaInitialized(true);
//     }
//   };

//   const handleSendCode = async () => {
//     setupRecaptcha(); // Ensure reCAPTCHA is ready
//     const appVerifier = window.recaptchaVerifier;

//     try {
//       const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
//       window.confirmationResult = confirmationResult;
//       setVerificationSent(true);
//       setMessage('Verification code sent!');
//     } catch (error) {
//       console.error('Error sending SMS:', error);
//       setMessage(`Error: ${error.message}`);
//     }
//   };

//   const handleVerifyCode = async () => {
//     try {
//       const confirmationResult = window.confirmationResult;
//       const result = await confirmationResult.confirm(verificationCode);
//       console.log('User signed in:', result.user);
//       setMessage('Phone verification successful!');
//     } catch (error) {
//       console.error('Error verifying code:', error);
//       setMessage(`Invalid code. Error: ${error.message}`);
//     }
//   };
// // Form Mode

//   return (
//     <div className="phone-auth-container">
//       <h2> {isRegister ? 'Register with  ' : 'Login with '}Phone Authentication</h2>

//       <div>
//         <input
//           type="text"
//           placeholder="Enter phone number to "
//           value={phoneNumber}
//           onChange={(e) => setPhoneNumber(e.target.value)}
//           className="w-full p-2 border rounded-lg mb-2"
//         />
//        {/*  */} <div id="recaptcha-container" className="mb-4"></div>
//         <button
//           onClick={handleSendCode}
//           className="w-full bg-blue-500 text-white p-2 rounded-lg"
//         >
//           Send Verification Code
//         </button>
//       </div>

//       {verificationSent && (
//         <div className="mt-4">
//           <input
//             type="text"
//             placeholder="Enter verification code"
//             value={verificationCode}
//             onChange={(e) => setVerificationCode(e.target.value)}
//             className="w-full p-2 border rounded-lg mb-2"
//           />
//           <button
//             onClick={handleVerifyCode}
//             className="w-full bg-green-500 text-white p-2 rounded-lg"
//           >
//             Verify Code
//           </button>
//         </div>
//       )}

//       {message && <p className="mt-4 text-center text-red-500">{message}</p>}
//     </div>
//   );
// };

// export default PhoneAuth;


// src\components\common\PhoneAuth.jsx
//==============================
// src/components/common/PhoneAuth.jsx- WORKING WITH CAPTIVA
 
  

// import React, { useState, useEffect } from 'react';
// import { 
//   RecaptchaVerifier,
//   createUserWithEmailAndPassword, 
//   signInWithEmailAndPassword, 
//   sendEmailVerification, 
//   signInWithCredential, 
//   PhoneAuthProvider, 
//   signInWithPhoneNumber 
// } from 'firebase/auth';
// import { auth } from '../../firebase/firebase';  
// import { isValidPhoneNumber } from 'libphonenumber-js';

// import { useNavigate } from 'react-router-dom';
// import { getFriendlyErrorMessage } from '../../utils/validation'; 

// const PhoneAuth = ({ clearEmailAndPasswordErrors }) => {
//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [verificationCode, setVerificationCode] = useState('');
//   const [verificationSent, setVerificationSent] = useState(false);
//   const [message, setMessage] = useState('');
//   const navigate = useNavigate();

//   /* useEffect(() => {
//     // Initialize reCAPTCHA when the component mounts
//     console.log('Auth object:', auth); // Debugging
//     if (!window.recaptchaVerifier) {
//       window.recaptchaVerifier = new RecaptchaVerifier(
//         'recaptcha-container',
//         {
//           size: 'normal', // Change to 'invisible' to not see the widget
//           callback: (response) => {
//             console.log('reCAPTCHA verified:', response);
//           },
//           'expired-callback': () => {
//             console.log('reCAPTCHA expired. Please try again.');
//           },
//         },
//         auth
//       );
//  // Render the reCAPTCHA widget
//       window.recaptchaVerifier.render().then((widgetId) => {
//         window.recaptchaWidgetId = widgetId;
//         console.log('reCAPTCHA rendered with widgetId:', widgetId);
//       });
//     }
//   }, []); */
// // Inside your useEffect hook in PhoneAuth.jsx

// useEffect(() => {
//   // Initialize reCAPTCHA verifier on component mount
//   if (!window.recaptchaVerifier) {
//     window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
//       'size': 'normal', // Changed from 'invisible' to 'normal' to make it visible
//       'callback': (response) => {
//         console.log('reCAPTCHA verified');
//         // Optional: Automatically send verification code after Recaptcha is solved
//       },
//       'expired-callback': () => {
//         console.log('reCAPTCHA expired. Please solve it again.');
//         setMessage('reCAPTCHA expired. Please send the verification code again.');
//       }
//     }, auth);
//  // Render the reCAPTCHA widget different from the above  which  is older .
//     window.recaptchaVerifier.render().then(() => {
//       setRecaptchaInitialized(true);
//     }).catch((error) => {
//       console.error('Error rendering Recaptcha:', error);
//       setMessage(`Recaptcha Error: ${error.message}`);
//     });
//   }
// }, []);

// /*   const handleSendCode = async () => {
//     console.log('Send Code button clicked');
//     clearEmailAndPasswordErrors();
//     setMessage('');

//     const appVerifier = window.recaptchaVerifier;
//     let formattedPhoneNumber = phoneNumber;

//     // Ensure the phone number is in E.164 format
//     if (!phoneNumber.startsWith('+')) {
//       formattedPhoneNumber = '+' + phoneNumber; // Remove default country code assumption
//     }

//     try {
//       const confirmationResult = await signInWithPhoneNumber(
//         auth,
//         formattedPhoneNumber,
//         appVerifier
//       );
//       window.confirmationResult = confirmationResult;
//       setVerificationSent(true);
//       setMessage('Verification code sent!');
//       console.log('Verification code sent to:', formattedPhoneNumber);
//     } catch (error) {
//       console.error('Error sending SMS:', error);
//       setMessage(getFriendlyErrorMessage(error));
//       // Reset reCAPTCHA in case of error
//       window.recaptchaVerifier.reset(window.recaptchaWidgetId);
//     }
//   }; */
//   const handleSendCode = async (e) => {
//     e.preventDefault();
//     console.log('Send Code button clicked');
//     clearEmailAndPasswordErrors();
//     setMessage('');
  
//     // Validate phone number using libphonenumber-js
//     if (!isValidPhoneNumber(phoneNumber)) {
//       setMessage('Invalid phone number. Please include country code, e.g., +1234567890.');
//       window.recaptchaVerifier.reset(); // Reset Recaptcha on invalid input
//       return;
//     }
  
//     try {
//       const appVerifier = window.recaptchaVerifier;
//       const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
//       window.confirmationResult = confirmationResult;
//       setVerificationSent(true);
//       setMessage('Verification code sent!');
//       console.log('Confirmation Result:', confirmationResult);
//     } catch (error) {
//       console.error('Error sending verification code:', error);
//       setMessage(`Error: ${error.message}`);
//       window.recaptchaVerifier.reset(); // Reset Recaptcha on error
//     }
//   };
  
//   const handleVerifyCode = async () => {
//     console.log('Verify Code button clicked');
//     setMessage('');
//     try {
//       const confirmationResult = window.confirmationResult;
//       const result = await confirmationResult.confirm(verificationCode);
//       const user = result.user;

//       // Check if the user is new or existing
//       if (result.additionalUserInfo.isNewUser) {
//         console.log('New user signed up:', user);
//         // Perform any additional setup for new users here
//       } else {
//         console.log('Existing user signed in:', user);
//       }

//       setMessage('Phone verification successful!');
//       // Redirect or perform other actions here
//       setTimeout(() => navigate('/stablehand-welcome'), 2000);
//     } catch (error) {
//       console.error('Error verifying code:', error);
//       setMessage(getFriendlyErrorMessage(error));
//     }
//   };
// // Form Mode
// const [isRegister, setIsRegister] = useState(true);
 
// //const navigate = useNavigate();


//   return (
//     <div className="space-y-2">
//       {!verificationSent && (
//         <>
//           <input
//             type="tel"
//             placeholder="Enter phone number (e.g., +1234567890)"
//             value={phoneNumber}
//             onChange={(e) => setPhoneNumber(e.target.value)}
//             className="w-full p-2 border rounded-lg mb-2"
//           />
//           {/* reCAPTCHA container */}
//           <div id="recaptcha-container" className="mb-4"></div>
//           <button
//             onClick={handleSendCode}
//             className="w-full bg-yellow-500 hover:bg-yellow-700 text-black font-bold py-2 px-4 rounded-lg"
//           >
//             {
//             verificationSent
//               ? 'Verify Code'
//               : isRegister
//               ? 'Register with Phone'
//               : 'Login with Phone'
//           }
        
//           </button>
//         </>
//       )}

//       {verificationSent && (
//         <>
//           <input
//             type="text"
//             placeholder="Enter verification code"
//             value={verificationCode}
//             onChange={(e) => setVerificationCode(e.target.value)}
//             className="w-full p-2 border rounded-lg mb-2"
//           />
//           <button
//             onClick={handleVerifyCode}
//             className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg"
//           >
//             Verify Code
//           </button>
//         </>
//       )}

//       {message && (
//         <p className="mt-4 text-center text-red-500">
//           {message}
//         </p>
//       )}
//     </div>

    
//   );
// };

// export default PhoneAuth;


 
 
