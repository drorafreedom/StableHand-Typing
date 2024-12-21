// src/components/common/ThirdPartyAuthPanel.tsx
// TS version

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, AuthProvider } from 'firebase/auth';
import {
  signInWithGoogle,
  signInWithFacebook,
  signInWithYahoo,
  signInWithMicrosoft,
  signInWithApple,
  signInWithGitHub,
  signInWithTwitter,
} from '../../firebase/auth';
import ThirdPartyButton from './ThirdPartyButton';
import Alert from './Alert';
import { getFriendlyErrorMessage } from '../../utils/validation';

// Logo imports
import googleLogo from '../../assets/logos/google.svg';
import facebookLogo from '../../assets/logos/facebook.svg';
import yahooLogo from '../../assets/logos/yahoo.svg';
import microsoftLogo from '../../assets/logos/microsoft.svg';
import appleLogo from '../../assets/logos/appleLogo.png';
import phoneLogo from '../../assets/logos/phone.svg';
import twitterLogo from '../../assets/logos/twitter.svg';

// Define props for the component
interface ThirdPartyAuthPanelProps {
  clearEmailAndPasswordErrors: () => void; // Callback to clear email and password errors
  isRegister: boolean; // Indicates if the component is used for registration or login
}

const ThirdPartyAuthPanel: React.FC<ThirdPartyAuthPanelProps> = ({
  clearEmailAndPasswordErrors,
  isRegister,
}) => {
  const [message, setMessage] = useState<{ message: string; type: 'success' | 'error' | '' }>({
    message: '',
    type: '',
  });
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  // Clear third-party login message
  const clearMessage = () => {
    setMessage({ message: '', type: '' });
  };

  // Handle third-party authentication
  const handleThirdPartyClick = async (signInFunction: () => Promise<void>, providerName: string) => {
    clearEmailAndPasswordErrors();
    setLoading(true);

    try {
      await signInFunction();
      setMessage({ message: `${providerName} login successful! Redirecting...`, type: 'success' });
      setTimeout(() => navigate('/stablehand-welcome'), 2000);
    } catch (error: any) {
      console.error(`Error during ${providerName} sign-in:`, error);
      setMessage({ message: getFriendlyErrorMessage(error), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Google Login */}
      <ThirdPartyButton
        onClick={() => handleThirdPartyClick(signInWithGoogle, 'Google')}
        className="w-full mt-2 flex items-center justify-center rounded-lg"
        color="bg-red-500"
        hoverColor="hover:bg-red-700"
        textColor="text-white"
        text={isRegister ? 'Register with Google' : 'Login with Google'}
        logo={googleLogo}
      />

      {/* Facebook Login */}
      <ThirdPartyButton
        onClick={() => handleThirdPartyClick(signInWithFacebook, 'Facebook')}
        className="w-full mt-2 flex items-center justify-center rounded-lg"
        color="bg-blue-700"
        hoverColor="hover:bg-blue-900"
        textColor="text-white"
        text={isRegister ? 'Register with Facebook' : 'Login with Facebook'}
        logo={facebookLogo}
      />

      {/* Yahoo Login */}
      <ThirdPartyButton
        onClick={() => handleThirdPartyClick(signInWithYahoo, 'Yahoo')}
        className="w-full mt-2 flex items-center justify-center rounded-lg"
        color="bg-purple-700"
        hoverColor="hover:bg-purple-900"
        textColor="text-white"
        text={isRegister ? 'Register with Yahoo' : 'Login with Yahoo'}
        logo={yahooLogo}
      />

      {/* Microsoft Login */}
      <ThirdPartyButton
        onClick={() => handleThirdPartyClick(signInWithMicrosoft, 'Microsoft')}
        className="w-full mt-2 flex items-center justify-center rounded-lg"
        color="bg-green-700"
        hoverColor="hover:bg-green-900"
        textColor="text-white"
        text={isRegister ? 'Register with Microsoft' : 'Login with Microsoft'}
        logo={microsoftLogo}
      />

      {/* Apple Login */}
      <ThirdPartyButton
        onClick={() => handleThirdPartyClick(signInWithApple, 'Apple')}
        className="w-full mt-2 flex items-center justify-center rounded-lg"
        color="bg-black"
        hoverColor="hover:bg-gray-800"
        textColor="text-white"
        text={isRegister ? 'Register with Apple' : 'Login with Apple'}
        logo={appleLogo}
      />

      {/* Twitter Login */}
      <ThirdPartyButton
        onClick={() => handleThirdPartyClick(signInWithTwitter, 'Twitter')}
        className="w-full mt-2 flex items-center justify-center rounded-lg"
        color="bg-teal-400"
        hoverColor="hover:bg-teal-600"
        textColor="text-white"
        text={isRegister ? 'Register with Twitter' : 'Login with Twitter'}
        logo={twitterLogo}
      />

      {/* Display Third-Party Authentication Message */}
      {message.message && <Alert message={message.message} type={message.type} />}
    </div>
  );
};

export default ThirdPartyAuthPanel;

//++++++++++++++++++JS version++++++++++++++++

/* Error Handling: The errorMessage state handles and displays error messages for all authentication methods. It is cleared before each new authentication attempt.
Third-party Authentication: Each button calls the appropriate provider method (e.g., signInWithGoogle, signInWithFacebook). The handleThirdPartyAuth method should now be correctly passed from the parent component to process the authentication.
Phone Authentication: The handlePhoneRegister method properly manages the flow for phone authentication, including the Recaptcha setup and code verification, and clears messages before starting. */
 // src/components/common/ThirdPartyAuthPanel.jsx lsata working 
 //JS version
 import React, { useState } from 'react';
 import ThirdPartyButton from './ThirdPartyButton';
 import { useNavigate } from 'react-router-dom';
 import { signInWithPopup } from 'firebase/auth';
 import Recaptcha from './Recaptcha';
 
 import PhoneAuth from './PhoneAuth';
 import {
   signInWithGoogle,
   signInWithFacebook,
   signInWithYahoo,
   signInWithMicrosoft,
   signInWithApple,
   signInWithGitHub,
   signInWithTwitter,
   signInWithPhone,
   setupRecaptcha,
 } from '../../firebase/auth';
 
 import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
 // MicrosoftAuthProvider,
//  TwitterAuthProvider,
  //AppleAuthProvider,
} from 'firebase/auth';
 
 
 import googleLogo from '../../assets/logos/google.svg';
 //Logo.png';
 import facebookLogo from '../../assets/logos/facebook.svg';
 //Logo.png';
 import yahooLogo from '../../assets/logos/yahoo.svg'
 //YahooLogo.jpg';
 import microsoftLogo from '../../assets/logos/microsoft.svg';
 //microsoftLogo.png';
 import appleLogo from '../../assets/logos/appleLogo.png';
 import phoneLogo from '../../assets/logos/phone.svg';
 //phoneLogo.png';
 import twiiterLogo from  '../../assets/logos/twitter.svg';
 import Alert from './Alert';
 import Button from '../common/Button';
 import { getFriendlyErrorMessage } from '../../utils/validation';  
 //import TestRecaptcha from './TestRecaptcha';


 const ThirdPartyAuthPanel = ({ clearEmailAndPasswordErrors, isRegister }) => {
   const [phoneNumber, setPhoneNumber] = useState('');
   const [verificationCode, setVerificationCode] = useState('');
   const [verificationSent, setVerificationSent] = useState(false);
   const [message, setMessage] = useState({ message: '', type: '' });
   const navigate = useNavigate();
 
 
const [loading, setLoading] = useState(false);
  

   
   // Clear only the third-party login message
   const clearMessage = () => {
     setMessage({ message: '', type: '' });
   };
 //mine
 /*   const handleThirdPartyClick = async (signInFunction) => {
     clearEmailAndPasswordErrors(); // Clear email and password errors only
 
     try {
       const result = await signInFunction();
       setMessage({ message: `${signInFunction.name} login successful!`, type: 'success' });
       setTimeout(() => navigate('/stablehand-welcome'), 2000);
     } catch (error) {
       console.error(`Error during ${signInFunction.name} sign-in:`, error);
       setMessage({ message: `Error: ${error.message}`, type: 'error' });
       
     }
   };
    */
 //friendly code . doesnt expose techinical issues 
   const handleThirdPartyClick = async (signInFunction, providerName) => {
     clearEmailAndPasswordErrors();
 
     try {
       const user = await signInFunction();
       setMessage({ message: `${providerName} login successful! Redirecting...`, type: 'success' });
       setTimeout(() => navigate('/stablehand-welcome'), 2000);
     } catch (error) {
       console.error(`Error during ${providerName} sign-in:`, error);
       setMessage({ message: getFriendlyErrorMessage(error), type: 'error' });
     }
   };
 
 //new code
 /*   const handleThirdPartyClick = async (signInFunction) => {
     clearEmailAndPasswordErrors();
 
     try {
         const user = await signInFunction();
         setMessage({ message: 'Login successful! Redirecting...', type: 'success' });
         setTimeout(() => navigate('/stablehand-welcome'), 2000);
     } catch (error) {
         console.error('Error during third-party sign-in:', error);
         setMessage({ message: error.message, type: 'error' });
     }
 };
  */

 
 const handleThirdPartySignIn = async (provider) => {
  setMessage('');
  setLoading(true);
  try {
    await signInWithPopup(auth, provider);
    setMessage('Third-Party Sign-In successful!');
    window.recaptchaVerifier.reset(); // Reset Recaptcha after successful sign-in
    // Redirect or perform additional actions
  } catch (error) {
    console.error('ThirdPartyAuthPanel Error:', error);
    setMessage(`Error: ${error.message}`);
    window.recaptchaVerifier.reset(); // Reset Recaptcha on error
  }
  setLoading(false);
};

  /*  const handlePhoneRegister = async () => {
     clearMessage(); // Clear only the third-party message
 
     if (!verificationSent) {
       const recaptchaVerifier = setupRecaptcha('recaptcha-container');
       try {
         const confirmationResult = await signInWithPhone(phoneNumber, recaptchaVerifier);
         window.confirmationResult = confirmationResult;
         setVerificationSent(true);
         setMessage({ message: 'Verification code sent to your phone.', type: 'success' });
       } catch (error) {
         console.error('Error during phone sign-in:', error);
         setMessage({ message: `Phone sign-in error: ${error.message}`, type: 'error' });
       }
     } else {
       try {
         const result = await window.confirmationResult.confirm(verificationCode);
         setMessage({ message: 'Phone verified! You are now logged in.', type: 'success' });
       } catch (error) {
         console.error('Error confirming code:', error);
         setMessage({ message: `Invalid verification code: ${error.message}`, type: 'error' });
       }
     }
   };
  */

   return (
     <div className="space-y-4">
    {/*    <h2 className="text-xl font-bold mb-2">
         {isRegister ? 'Register with' : 'Login with'}
       </h2> */}
 
       {/* Google Login */}
       <ThirdPartyButton
         onClick={() => handleThirdPartyClick(signInWithGoogle)}
         className="w-full mt-2 flex items-center justify-center rounded-lg"
         color="bg-red-500"
         hoverColor="hover:bg-red-700"
         textColor="text-white"
         text={isRegister ? 'Register with Google' : 'Login with Google'}
         logo={googleLogo}
       />
 
       {/* Facebook Login */}
       <ThirdPartyButton
         onClick={() => handleThirdPartyClick(signInWithFacebook)}
         className="w-full mt-2 flex items-center justify-center rounded-lg"
         color="bg-blue-700"
         hoverColor="hover:bg-blue-900"
         textColor="text-white"
         text={isRegister ? 'Register with Facebook' : 'Login with Facebook'}
         logo={facebookLogo}
       />
 
       {/* Yahoo Login */}
       <ThirdPartyButton
         onClick={() => handleThirdPartyClick(signInWithYahoo)}
         className="w-full mt-2 flex items-center justify-center rounded-lg"
         color="bg-purple-700"
         hoverColor="hover:bg-purple-900"
         textColor="text-white"
         text={isRegister ? 'Register with Yahoo' : 'Login with Yahoo'}
         logo={yahooLogo}
       />
 
       {/* Microsoft Login */}
       <ThirdPartyButton
         onClick={() => handleThirdPartyClick(signInWithMicrosoft)}
         className="w-full mt-2 flex items-center justify-center rounded-lg"
         color="bg-green-700"
         hoverColor="hover:bg-green-900"
         textColor="text-white"
         text={isRegister ? 'Register with Microsoft' : 'Login with Microsoft'}
         logo={microsoftLogo}
       />
 
       {/* Apple Login */}
       <ThirdPartyButton
         onClick={() => handleThirdPartyClick(signInWithApple)}
         className="w-full mt-2 flex items-center justify-center rounded-lg"
         color="bg-black"
         hoverColor="hover:bg-gray-800"
         textColor="text-white"
         text={isRegister ? 'Register with Apple' : 'Login with Apple'}
         logo={appleLogo}
       />
    {/* Twiiter Login */}
    <ThirdPartyButton
         onClick={() => handleThirdPartyClick(signInWithApple)}

         
         className="w-full mt-2 flex items-center justify-center rounded-lg"
         color="bg-teal-400"
         hoverColor="hover:bg-teal-600"
         textColor="text-white"
         text={isRegister ? 'Register with Twitter' : 'Login with Twitter'}
         logo={twiiterLogo}
       />
       {/* Phone Authentication */}
      {/*  <div className="space-y-2">
         <input
           type="text"
           placeholder="Phone Number"
           value={phoneNumber}
           onChange={(e) => setPhoneNumber(e.target.value)}
           className="w-full p-2 border rounded-lg  bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-300"
         />
         {verificationSent && (
           <input
             type="text"
             placeholder="Verification Code"
             value={verificationCode}
             onChange={(e) => setVerificationCode(e.target.value)}
             className="w-full p-2 border rounded-lg"
           />
         )}
         <ThirdPartyButton
           onClick={handlePhoneRegister}
           className="w-full mt-2 flex items-center justify-center rounded-lg"
           color="bg-yellow-500"
           hoverColor="hover:bg-yellow-700"
           textColor="text-black"
           text={
             verificationSent
               ? 'Verify Code'
               : isRegister
               ? 'Register with Phone'
               : 'Login with Phone'
           }
           logo={phoneLogo}
         />
         <div id="recaptcha-container"></div>
       </div> */}
   {/* Phone Authentication */}
     {/* <PhoneAuth clearEmailAndPasswordErrors={clearEmailAndPasswordErrors}  />    */}
  {/*  TestRecaptcha */}
       {/* Register and Reset Password Buttons */}
      {/*  <div className="mt-4 flex justify-between">
         <Button
           onClick={() => navigate('/reset-password')}
           className="w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
         >
           Reset Password
         </Button>
         <Button
           onClick={() => navigate('/register')}
           className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg ml-4"
         >
           Register
         </Button>
       </div>
  */}
       {/* Display Third-Party Message */}
       {message.message && <Alert message={message.message} type={message.type} />}
    
     {/* Integrate Recaptcha */}
      {/* <Recaptcha containerId="recaptcha-third-party" onVerify={() => {}} onExpire={() => setMessage('Recaptcha expired. Please try again.')} /> */}

    
    
    
     </div>
   );
 };
 
 export default ThirdPartyAuthPanel;
 




//================================================

//// src/components/common/ThirdPartyAuthPanel.jsx
// import React, { useState } from 'react';
// import ThirdPartyButton from './ThirdPartyButton';
// import { signInWithGoogle, signInWithFacebook, signInWithYahoo, signInWithMicrosoft, signInWithApple, signInWithPhone, setupRecaptcha } from '../../firebase/auth';
// import googleLogo from '../../assets/logos/googleLogo.png';
// import facebookLogo from '../../assets/logos/facebookLogo.png';
// import yahooLogo from '../../assets/logos/YahooLogo.jpg';
// import microsoftLogo from '../../assets/logos/microsoftLogo.png';
// import appleLogo from '../../assets/logos/appleLogo.png';
// import phoneLogo from '../../assets/logos/phoneLogo.png';
// import Alert from './Alert';  // Ensure Alert component is imported
// import LoginForm from '../organisms/LoginForm.jsx'
// const ThirdPartyAuthPanel = ({ isRegister }) => {
//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [verificationCode, setVerificationCode] = useState('');
//   const [verificationSent, setVerificationSent] = useState(false);
//   const [message, setMessage] = useState({ message: '', type: '' });

//   // Function to clear only messages, not the whole page
//   const clearMessage = () => {
//     setMessage({ message: '', type: '' });
//   };
//   // Clear all errors when switching between login methods
//   const clearAllErrors = () => {
//     setLoginMessage({ message: '', type: '' });
//     setEmailErrors([]); // Clear email errors
//     setPasswordErrors([]); // Clear password errors
//     setProviderError(null); // Clear third-party provider errors
//     setPhoneError(null); // Clear phone login errors
//   };
//   const handlePhoneRegister = async () => {
//     clearMessage(); // Clear only the message

//     if (!verificationSent) {
//       const recaptchaVerifier = setupRecaptcha('recaptcha-container');
//       try {
//         const confirmationResult = await signInWithPhone(phoneNumber, recaptchaVerifier);
//         window.confirmationResult = confirmationResult;
//         setVerificationSent(true);
//         setMessage({ message: 'Verification code sent to your phone.', type: 'success' });
//       } catch (error) {
//         console.error("Error during phone sign-in:", error);
//         setMessage({ message: `Error during phone sign-in: ${error.message}`, type: 'error' });
//       }
//     } else {
//       try {
//         const result = await window.confirmationResult.confirm(verificationCode);
//         console.log('User registered with phone:', result.user);
//         setMessage({ message: 'Phone number verified and user registered.', type: 'success' });
//       } catch (error) {
//         console.error("Error confirming verification code:", error);
//         setMessage({ message: `Invalid verification code: ${error.message}`, type: 'error' });
//       }
//     }
//   };

//   // Handle third-party login with error handling
//   const handleThirdPartyClick = async (signInFunction) => {
//     clearMessage(); // Clear only the message

//     try {
//       const result = await signInFunction();
//       console.log(`${signInFunction.name} sign-in successful:`, result);
//       setMessage({ message: `${signInFunction.name} login successful.`, type: 'success' });
//     } catch (error) {
//       console.error(`Error during ${signInFunction.name} sign-in:`, error);
//       setMessage({ message: `Error during ${signInFunction.name} sign-in: ${error.message}`, type: 'error' });
//     }
//   };
//   const handleFacebookLogin = async () => {
//     try {
//       const result = await signInWithPopup(auth, facebookProvider);
//       const credential = FacebookAuthProvider.credentialFromResult(result);
//       const token = credential.accessToken; // Optional: Use this if needed.
//       const user = result.user;

//       setLoginMessage({ message: `Welcome ${user.displayName}`, type: 'success' });
//       console.log('Facebook sign-in successful:', user);
//     } catch (error) {
//       console.error('Error during Facebook sign-in:', error);
//       setLoginMessage({ message: `Facebook Login Failed: ${error.message}`, type: 'error' });
//     }
//   };
//   return (
//     <div className="space-y-4">
//       <h2 className="text-x0 font-bold mb-2">{isRegister ? 'Register with' : 'Login with'}</h2>
      
//       {/* Google Login */}
//       <ThirdPartyButton 
//         onClick={() => handleThirdPartyClick(signInWithGoogle)} 
//         className="w-full mt-2 flex items-center justify-center rounded-lg " 
//         color="bg-red-500 "  /* opacity -50 */
//         hoverColor="hover:bg-red-700" 
//         textColor="text-white"
//         text={isRegister ? "Register with Google" : "Login with Google"}
//         logo={googleLogo}
//       />

//       {/* Facebook Login */}
//       <ThirdPartyButton 
//         onClick={() => handleThirdPartyClick(signInWithFacebook)} 
//         className="w-full mt-2 flex items-center justify-center rounded-lg " 
//         color="bg-blue-700" 
//         hoverColor="hover:bg-blue-900" 
//         textColor="text-white"
//         text={isRegister ? "Register with Facebook" : "Login with Facebook"}
//         logo={facebookLogo}
//       />

//       {/* Yahoo Login */}
//       <ThirdPartyButton 
//         onClick={() => handleThirdPartyClick(signInWithYahoo)} 
//         className="w-full mt-2 flex items-center justify-center rounded-lg "  
//         color="bg-purple-700" 
//         hoverColor="hover:bg-purple-900" 
//         textColor="text-white"
//         text={isRegister ? "Register with Yahoo" : "Login with Yahoo"}
//         logo={yahooLogo}
//       />

//       {/* Microsoft Login */}
//       <ThirdPartyButton 
//         onClick={() => handleThirdPartyClick(signInWithMicrosoft)} 
//         className="w-full mt-2 flex items-center justify-center rounded-lg " 
//         color="bg-green-700" 
//         hoverColor="hover:bg-green-900" 
//         textColor="text-white"
//         text={isRegister ? "Register with Microsoft" : "Login with Microsoft"}
//         logo={microsoftLogo}
//       />

//       {/* Apple Login */}
//       <ThirdPartyButton 
//         onClick={() => handleThirdPartyClick(signInWithApple)} 
//         className="w-full mt-2 flex items-center justify-center rounded-lg " 
//         color="bg-black" 
//         hoverColor="hover:bg-gray-800" 
//         textColor="text-white"
//         text={isRegister ? "Register with Apple" : "Login with Apple"}
//         logo={appleLogo}
//       />

//       {/* Phone Auth */}
//       <div className="space-y-2">
//         <input
//           type="text"
//           placeholder="Phone Number"
//           value={phoneNumber}
//           onChange={(e) => setPhoneNumber(e.target.value)}
//           className="w-full p-2 border rounded-lg"
//         />
//         {verificationSent && (
//           <input
//             type="text"
//             placeholder="Verification Code"
//             value={verificationCode}
//             onChange={(e) => setVerificationCode(e.target.value)}
//             className="w-full p-2 border rounded-lg bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-300"
//           />
//         )}
//         <ThirdPartyButton 
//           onClick={handlePhoneRegister} 
//           className="w-full mt-2 flex items-center justify-center rounded-lg "  
//           color="bg-yellow-500" 
//           hoverColor="hover:bg-yellow-700" 
//           textColor="text-black"
//           text={verificationSent ? 'Verify Code' : (isRegister ? 'Register with Phone' : 'Login with Phone')}
//           logo={phoneLogo}
//         />
//         <div id="recaptcha-container"></div>
//       </div>

//       {/* Message Alert */}
//       {message.message && <Alert message={message.message} type={message.type} />}
//     </div>
//   );
// };

// export default ThirdPartyAuthPanel;



//================================================

//// src/components/common/ThirdPartyAuthPanel.jsx
// import React, { useState } from 'react';
// import ThirdPartyButton from './ThirdPartyButton';
// import { useNavigate } from 'react-router-dom';
// import {
//   signInWithGoogle,
//   signInWithFacebook,
//   signInWithYahoo,
//   signInWithMicrosoft,
//   signInWithApple,
//   signInWithPhone,
//   setupRecaptcha,
// } from '../../firebase/auth';
// import googleLogo from '../../assets/logos/googleLogo.png';
// import facebookLogo from '../../assets/logos/facebookLogo.png';
// import yahooLogo from '../../assets/logos/YahooLogo.jpg';
// import microsoftLogo from '../../assets/logos/microsoftLogo.png';
// import appleLogo from '../../assets/logos/appleLogo.png';
// import phoneLogo from '../../assets/logos/phoneLogo.png';
// import Alert from './Alert';
// import Button from '../common/Button';

// const ThirdPartyAuthPanel = ({ clearEmailAndPasswordErrors, isRegister }) => {
//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [verificationCode, setVerificationCode] = useState('');
//   const [verificationSent, setVerificationSent] = useState(false);
//   const [message, setMessage] = useState({ message: '', type: '' });
//   const navigate = useNavigate();

//   // Clear only the third-party login message
//   const clearMessage = () => {
//     setMessage({ message: '', type: '' });
//   };

//   const handleThirdPartyClick = async (signInFunction) => {
//     clearEmailAndPasswordErrors(); // Clear email and password errors only

//     try {
//       const result = await signInFunction();
//       setMessage({ message: `${signInFunction.name} login successful!`, type: 'success' });
//       setTimeout(() => navigate('/stablehand-welcome'), 2000);
//     } catch (error) {
//       console.error(`Error during ${signInFunction.name} sign-in:`, error);
//       setMessage({ message: `Error: ${error.message}`, type: 'error' });
      
//     }
//   };
  
//   const handlePhoneRegister = async () => {
//     clearMessage(); // Clear only the third-party message

//     if (!verificationSent) {
//       const recaptchaVerifier = setupRecaptcha('recaptcha-container');
//       try {
//         const confirmationResult = await signInWithPhone(phoneNumber, recaptchaVerifier);
//         window.confirmationResult = confirmationResult;
//         setVerificationSent(true);
//         setMessage({ message: 'Verification code sent to your phone.', type: 'success' });
//       } catch (error) {
//         console.error('Error during phone sign-in:', error);
//         setMessage({ message: `Phone sign-in error: ${error.message}`, type: 'error' });
//       }
//     } else {
//       try {
//         const result = await window.confirmationResult.confirm(verificationCode);
//         setMessage({ message: 'Phone verified! You are now logged in.', type: 'success' });
//       } catch (error) {
//         console.error('Error confirming code:', error);
//         setMessage({ message: `Invalid verification code: ${error.message}`, type: 'error' });
//       }
//     }
//   };

//   return (
//     <div className="space-y-4">
//       <h2 className="text-xl font-bold mb-2">
//         {isRegister ? 'Register with' : 'Login with'}
//       </h2>

//       {/* Google Login */}
//       <ThirdPartyButton
//         onClick={() => handleThirdPartyClick(signInWithGoogle)}
//         className="w-full mt-2 flex items-center justify-center rounded-lg"
//         color="bg-red-500"
//         hoverColor="hover:bg-red-700"
//         textColor="text-white"
//         text={isRegister ? 'Register with Google' : 'Login with Google'}
//         logo={googleLogo}
//       />

//       {/* Facebook Login */}
//       <ThirdPartyButton
//         onClick={() => handleThirdPartyClick(signInWithFacebook)}
//         className="w-full mt-2 flex items-center justify-center rounded-lg"
//         color="bg-blue-700"
//         hoverColor="hover:bg-blue-900"
//         textColor="text-white"
//         text={isRegister ? 'Register with Facebook' : 'Login with Facebook'}
//         logo={facebookLogo}
//       />

//       {/* Yahoo Login */}
//       <ThirdPartyButton
//         onClick={() => handleThirdPartyClick(signInWithYahoo)}
//         className="w-full mt-2 flex items-center justify-center rounded-lg"
//         color="bg-purple-700"
//         hoverColor="hover:bg-purple-900"
//         textColor="text-white"
//         text={isRegister ? 'Register with Yahoo' : 'Login with Yahoo'}
//         logo={yahooLogo}
//       />

//       {/* Microsoft Login */}
//       <ThirdPartyButton
//         onClick={() => handleThirdPartyClick(signInWithMicrosoft)}
//         className="w-full mt-2 flex items-center justify-center rounded-lg"
//         color="bg-green-700"
//         hoverColor="hover:bg-green-900"
//         textColor="text-white"
//         text={isRegister ? 'Register with Microsoft' : 'Login with Microsoft'}
//         logo={microsoftLogo}
//       />

//       {/* Apple Login */}
//       <ThirdPartyButton
//         onClick={() => handleThirdPartyClick(signInWithApple)}
//         className="w-full mt-2 flex items-center justify-center rounded-lg"
//         color="bg-black"
//         hoverColor="hover:bg-gray-800"
//         textColor="text-white"
//         text={isRegister ? 'Register with Apple' : 'Login with Apple'}
//         logo={appleLogo}
//       />

//       {/* Phone Authentication */}
    
// <div className="mt-4 flex justify-between">
//   <input
//     type="text"
//     placeholder="Phone Number"
//     value={phoneNumber}
//     onChange={(e) => setPhoneNumber(e.target.value)}
//     className="flex-1 min-w-[50%] max-w-[50%] p-1 rounded-md bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-300"
//   />
//   <ThirdPartyButton
//     onClick={handlePhoneRegister}
//     className= "flex-1 min-w-[50%] max-w-[50%] p-1 rounded-md"
//     color="bg-yellow-500"
//     hoverColor="hover:bg-yellow-700"
//     textColor="text-black"
//     text={
//       verificationSent
//         ? 'Verify Code'
//         : isRegister
//         ? 'Phone'
//         : 'Phone'
//     }
//     logo={phoneLogo}
//   />
// </div>

// {/* Verification Code Input */}
// {verificationSent && (
//   <div className="mt-2">
//     <input
//       type="text"
//       placeholder="Verification Code"
//       value={verificationCode}
//       onChange={(e) => setVerificationCode(e.target.value)}
//       className="w-full p-2 border rounded-lg bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-300"
//     />
//   </div>
// )}

// <div id="recaptcha-container" className="mt-2"></div>


//       {/* Register and Reset Password Buttons */}
//      {/*  <div className="mt-4 flex justify-between">
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
//  */}
//       {/* Display Third-Party Message */}
//       {message.message && <Alert message={message.message} type={message.type} />}
//     </div>
//   );
// };

// export default ThirdPartyAuthPanel;
