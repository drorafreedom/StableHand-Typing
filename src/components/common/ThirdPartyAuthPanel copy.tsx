// src/components/common/ThirdPartyAuthPanel.jsx
/* Error Handling: The errorMessage state handles and displays error messages for all authentication methods. It is cleared before each new authentication attempt.
Third-party Authentication: Each button calls the appropriate provider method (e.g., signInWithGoogle, signInWithFacebook). The handleThirdPartyAuth method should now be correctly passed from the parent component to process the authentication.
Phone Authentication: The handlePhoneRegister method properly manages the flow for phone authentication, including the Recaptcha setup and code verification, and clears messages before starting. */
import React, { useState } from 'react';
import ThirdPartyButton from './ThirdPartyButton';
import { signInWithGoogle, signInWithFacebook, signInWithYahoo, signInWithMicrosoft, signInWithApple, signInWithPhone, setupRecaptcha } from '../../firebase/auth';
import googleLogo from '../../assets/logos/googleLogo.png';
import facebookLogo from '../../assets/logos/facebookLogo.png';
import yahooLogo from '../../assets/logos/YahooLogo.jpg';
import microsoftLogo from '../../assets/logos/microsoftLogo.png';
import appleLogo from '../../assets/logos/appleLogo.png';
import phoneLogo from '../../assets/logos/phoneLogo.png';
import Alert from './Alert';  // Ensure Alert component is imported
import LoginForm from '../organisms/LoginForm.jsx'
const ThirdPartyAuthPanel = ({ isRegister }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [message, setMessage] = useState({ message: '', type: '' });

  // Function to clear only messages, not the whole page
  const clearMessage = () => {
    setMessage({ message: '', type: '' });
  };
  // Clear all errors when switching between login methods
  const clearAllErrors = () => {
    setLoginMessage({ message: '', type: '' });
    setEmailErrors([]); // Clear email errors
    setPasswordErrors([]); // Clear password errors
    setProviderError(null); // Clear third-party provider errors
    setPhoneError(null); // Clear phone login errors
  };
  const handlePhoneRegister = async () => {
    clearMessage(); // Clear only the message

    if (!verificationSent) {
      const recaptchaVerifier = setupRecaptcha('recaptcha-container');
      try {
        const confirmationResult = await signInWithPhone(phoneNumber, recaptchaVerifier);
        window.confirmationResult = confirmationResult;
        setVerificationSent(true);
        setMessage({ message: 'Verification code sent to your phone.', type: 'success' });
      } catch (error) {
        console.error("Error during phone sign-in:", error);
        setMessage({ message: `Error during phone sign-in: ${error.message}`, type: 'error' });
      }
    } else {
      try {
        const result = await window.confirmationResult.confirm(verificationCode);
        console.log('User registered with phone:', result.user);
        setMessage({ message: 'Phone number verified and user registered.', type: 'success' });
      } catch (error) {
        console.error("Error confirming verification code:", error);
        setMessage({ message: `Invalid verification code: ${error.message}`, type: 'error' });
      }
    }
  };

  // Handle third-party login with error handling
  const handleThirdPartyClick = async (signInFunction) => {
    clearMessage(); // Clear only the message

    try {
      const result = await signInFunction();
      console.log(`${signInFunction.name} sign-in successful:`, result);
      setMessage({ message: `${signInFunction.name} login successful.`, type: 'success' });
    } catch (error) {
      console.error(`Error during ${signInFunction.name} sign-in:`, error);
      setMessage({ message: `Error during ${signInFunction.name} sign-in: ${error.message}`, type: 'error' });
    }
  };
  const handleFacebookLogin = async () => {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      const credential = FacebookAuthProvider.credentialFromResult(result);
      const token = credential.accessToken; // Optional: Use this if needed.
      const user = result.user;

      setLoginMessage({ message: `Welcome ${user.displayName}`, type: 'success' });
      console.log('Facebook sign-in successful:', user);
    } catch (error) {
      console.error('Error during Facebook sign-in:', error);
      setLoginMessage({ message: `Facebook Login Failed: ${error.message}`, type: 'error' });
    }
  };
  return (
    <div className="space-y-4">
      <h2 className="text-x0 font-bold mb-2">{isRegister ? 'Register with' : 'Login with'}</h2>
      
      {/* Google Login */}
      <ThirdPartyButton 
        onClick={() => handleThirdPartyClick(signInWithGoogle)} 
        className="w-full mt-2 flex items-center justify-center rounded-lg " 
        color="bg-red-500 "  /* opacity -50 */
        hoverColor="hover:bg-red-700" 
        textColor="text-white"
        text={isRegister ? "Register with Google" : "Login with Google"}
        logo={googleLogo}
      />

      {/* Facebook Login */}
      <ThirdPartyButton 
        onClick={() => handleThirdPartyClick(signInWithFacebook)} 
        className="w-full mt-2 flex items-center justify-center rounded-lg " 
        color="bg-blue-700" 
        hoverColor="hover:bg-blue-900" 
        textColor="text-white"
        text={isRegister ? "Register with Facebook" : "Login with Facebook"}
        logo={facebookLogo}
      />

      {/* Yahoo Login */}
      <ThirdPartyButton 
        onClick={() => handleThirdPartyClick(signInWithYahoo)} 
        className="w-full mt-2 flex items-center justify-center rounded-lg "  
        color="bg-purple-700" 
        hoverColor="hover:bg-purple-900" 
        textColor="text-white"
        text={isRegister ? "Register with Yahoo" : "Login with Yahoo"}
        logo={yahooLogo}
      />

      {/* Microsoft Login */}
      <ThirdPartyButton 
        onClick={() => handleThirdPartyClick(signInWithMicrosoft)} 
        className="w-full mt-2 flex items-center justify-center rounded-lg " 
        color="bg-green-700" 
        hoverColor="hover:bg-green-900" 
        textColor="text-white"
        text={isRegister ? "Register with Microsoft" : "Login with Microsoft"}
        logo={microsoftLogo}
      />

      {/* Apple Login */}
      <ThirdPartyButton 
        onClick={() => handleThirdPartyClick(signInWithApple)} 
        className="w-full mt-2 flex items-center justify-center rounded-lg " 
        color="bg-black" 
        hoverColor="hover:bg-gray-800" 
        textColor="text-white"
        text={isRegister ? "Register with Apple" : "Login with Apple"}
        logo={appleLogo}
      />

      {/* Phone Auth */}
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="w-full p-2 border rounded-lg"
        />
        {verificationSent && (
          <input
            type="text"
            placeholder="Verification Code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            className="w-full p-2 border rounded"
          />
        )}
        <ThirdPartyButton 
          onClick={handlePhoneRegister} 
          className="w-full mt-2 flex items-center justify-center rounded-lg "  
          color="bg-yellow-500" 
          hoverColor="hover:bg-yellow-700" 
          textColor="text-black"
          text={verificationSent ? 'Verify Code' : (isRegister ? 'Register with Phone' : 'Login with Phone')}
          logo={phoneLogo}
        />
        <div id="recaptcha-container"></div>
      </div>

      {/* Message Alert */}
      {message.message && <Alert message={message.message} type={message.type} />}
    </div>
  );
};

export default ThirdPartyAuthPanel;


// latest one 
/* import React, { useState } from 'react';
import ThirdPartyButton from './ThirdPartyButton';
import {
  signInWithGoogle,
  signInWithFacebook,
  signInWithYahoo,
  signInWithMicrosoft,
  signInWithApple,
  signInWithPhone,
  setupRecaptcha
} from '../../firebase/auth';
import googleLogo from '../../assets/logos/googleLogo.png';
import facebookLogo from '../../assets/logos/facebookLogo.png';
import yahooLogo from '../../assets/logos/YahooLogo.jpg';
import microsoftLogo from '../../assets/logos/microsoftLogo.png';
import appleLogo from '../../assets/logos/appleLogo.png';
import phoneLogo from '../../assets/logos/phoneLogo.png';

const ThirdPartyAuthPanel = ({ handleThirdPartyAuth, isRegister }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);

  const handlePhoneRegister = async () => {
    if (!verificationSent) {
      const recaptchaVerifier = setupRecaptcha('recaptcha-container');
      try {
        const confirmationResult = await signInWithPhone(phoneNumber, recaptchaVerifier);
        window.confirmationResult = confirmationResult;
        setVerificationSent(true);
      } catch (error) {
        console.error("Error during phone sign-in:", error);
      }
    } else {
      try {
        const result = await window.confirmationResult.confirm(verificationCode);
        console.log('User registered with phone:', result.user);
      } catch (error) {
        console.error("Error confirming verification code:", error);
      }
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-2">{isRegister ? 'Register with' : 'Login with'}</h2>
      <ThirdPartyButton
        onClick={() => handleThirdPartyAuth(signInWithGoogle)}
        className="w-full mt-2 flex items-center justify-center"
        color="bg-red-500"
        hoverColor="hover:bg-red-700"
        textColor="text-white"
        text={isRegister ? 'Register with Google' : 'Login with Google'}
        logo={googleLogo}
      />
      <ThirdPartyButton
        onClick={() => handleThirdPartyAuth(signInWithFacebook)}
        className="w-full mt-2 flex items-center justify-center"
        color="bg-blue-700"
        hoverColor="hover:bg-blue-900"
        textColor="text-white"
        text={isRegister ? 'Register with Facebook' : 'Login with Facebook'}
        logo={facebookLogo}
      />
      <ThirdPartyButton
        onClick={() => handleThirdPartyAuth(signInWithYahoo)}
        className="w-full mt-2 flex items-center justify-center"
        color="bg-purple-700"
        hoverColor="hover:bg-purple-900"
        textColor="text-white"
        text={isRegister ? 'Register with Yahoo' : 'Login with Yahoo'}
        logo={yahooLogo}
      />
      <ThirdPartyButton
        onClick={() => handleThirdPartyAuth(signInWithMicrosoft)}
        className="w-full mt-2 flex items-center justify-center"
        color="bg-green-700"
        hoverColor="hover:bg-green-900"
        textColor="text-white"
        text={isRegister ? 'Register with Microsoft' : 'Login with Microsoft'}
        logo={microsoftLogo}
      />
      <ThirdPartyButton
        onClick={() => handleThirdPartyAuth(signInWithApple)}
        className="w-full mt-2 flex items-center justify-center"
        color="bg-black"
        hoverColor="hover:bg-gray-800"
        textColor="text-white"
        text={isRegister ? 'Register with Apple' : 'Login with Apple'}
        logo={appleLogo}
      />
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="w-full p-2 border rounded"
        />
        {verificationSent && (
          <input
            type="text"
            placeholder="Verification Code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            className="w-full p-2 border rounded"
          />
        )}
        <ThirdPartyButton
          onClick={handlePhoneRegister}
          className="w-full mt-2 flex items-center justify-center"
          color="bg-yellow-500"
          hoverColor="hover:bg-yellow-700"
          textColor="text-black"
          text={verificationSent ? 'Verify Code' : isRegister ? 'Register with Phone' : 'Login with Phone'}
          logo={phoneLogo}
        />
        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
};

export default ThirdPartyAuthPanel;

 */


/* // src/components/common/ThirdPartyAuthPanel.jsx
import React, { useState } from 'react';
import ThirdPartyButton from './ThirdPartyButton';
import { signInWithGoogle, signInWithFacebook, signInWithYahoo, signInWithMicrosoft, signInWithApple, signInWithPhone, setupRecaptcha } from '../../firebase/auth';
import googleLogo from '../../assets/logos/googleLogo.png';
import facebookLogo from '../../assets/logos/facebookLogo.png';
import yahooLogo from '../../assets/logos/YahooLogo.jpg';
import microsoftLogo from '../../assets/logos/microsoftLogo.png';
import appleLogo from '../../assets/logos/appleLogo.png';
import phoneLogo from '../../assets/logos/phoneLogo.png';

const ThirdPartyAuthPanel = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);

  const handlePhoneRegister = async () => {
    if (!verificationSent) {
      const recaptchaVerifier = setupRecaptcha('recaptcha-container');
      try {
        const confirmationResult = await signInWithPhone(phoneNumber, recaptchaVerifier);
        window.confirmationResult = confirmationResult;
        setVerificationSent(true);
      } catch (error) {
        console.error("Error during phone sign-in:", error);
      }
    } else {
      try {
        const result = await window.confirmationResult.confirm(verificationCode);
        console.log('User registered with phone:', result.user);
      } catch (error) {
        console.error("Error confirming verification code:", error);
      }
    }
  };

  return (
    <div className="space-y-4">
      <ThirdPartyButton 
        onClick={signInWithGoogle} 
        className="w-full mt-2 flex items-center justify-center" 
        color="bg-red-500" 
        hoverColor="hover:bg-red-700" 
        textColor="text-white"
        text="Sign in with Google"
        logo={googleLogo}
      />
      <ThirdPartyButton 
        onClick={signInWithFacebook} 
        className="w-full mt-2 flex items-center justify-center" 
        color="bg-blue-700" 
        hoverColor="hover:bg-blue-900" 
        textColor="text-white"
        text="Sign in with Facebook"
        logo={facebookLogo}
      />
      <ThirdPartyButton 
        onClick={signInWithYahoo} 
        className="w-full mt-2 flex items-center justify-center" 
        color="bg-purple-700" 
        hoverColor="hover:bg-purple-900" 
        textColor="text-white"
        text="Sign in with Yahoo"
        logo={yahooLogo}
      />
      <ThirdPartyButton 
        onClick={signInWithMicrosoft} 
        className="w-full mt-2 flex items-center justify-center" 
        color="bg-green-700" 
        hoverColor="hover:bg-green-900" 
        textColor="text-white"
        text="Sign in with Microsoft"
        logo={microsoftLogo}
      />
      <ThirdPartyButton 
        onClick={signInWithApple} 
        className="w-full mt-2 flex items-center justify-center" 
        color="bg-black" 
        hoverColor="hover:bg-gray-800" 
        textColor="text-white"
        text="Sign in with Apple"
        logo={appleLogo}
      />
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="w-full p-2 border rounded"
        />
        {verificationSent && (
          <input
            type="text"
            placeholder="Verification Code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            className="w-full p-2 border rounded"
          />
        )}
        <ThirdPartyButton 
          onClick={handlePhoneRegister} 
          className="w-full mt-2 flex items-center justify-center" 
          color="bg-yellow-500" 
          hoverColor="hover:bg-yellow-700" 
          textColor="text-black"
          text={verificationSent ? 'Verify Code' : 'Sign in with Phone'}
          logo={phoneLogo}
        />
        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
};

export default ThirdPartyAuthPanel; */



 // src/components/common/ThirdPartyAuthPanel.jsx
/* import React, { useState } from 'react';
import ThirdPartyButton from './ThirdPartyButton';
import { signInWithGoogle, signInWithFacebook, signInWithYahoo, signInWithMicrosoft, signInWithApple, signInWithPhone, setupRecaptcha } from '../../firebase/auth';
import googleLogo from '../../assets/logos/googleLogo.png';
import facebookLogo from '../../assets/logos/facebookLogo.png';
import yahooLogo from '../../assets/logos/YahooLogo.jpg';
import microsoftLogo from '../../assets/logos/microsoftLogo.png';
import appleLogo from '../../assets/logos/appleLogo.png';
import phoneLogo from '../../assets/logos/phoneLogo.png';

const ThirdPartyAuthPanel = ({ isRegister }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);

  const handlePhoneRegister = async () => {
    if (!verificationSent) {
      const recaptchaVerifier = setupRecaptcha('recaptcha-container');
      try {
        const confirmationResult = await signInWithPhone(phoneNumber, recaptchaVerifier);
        window.confirmationResult = confirmationResult;
        setVerificationSent(true);
      } catch (error) {
        console.error("Error during phone sign-in:", error);
      }
    } else {
      try {
        const result = await window.confirmationResult.confirm(verificationCode);
        console.log('User registered with phone:', result.user);
      } catch (error) {
        console.error("Error confirming verification code:", error);
      }
    }
  };

  const handleThirdPartyClick = async (signInFunction) => {
    try {
      await signInFunction();
      console.log(`${signInFunction.name} sign-in successful.`);
    } catch (error) {
      console.error(`Error during ${signInFunction.name} sign-in:`, error);
    }
  };

  return (
    <div className="space-y-4">
      <ThirdPartyButton 
        onClick={() => handleThirdPartyClick(signInWithGoogle)} 
        className="w-full mt-2 flex items-center justify-center" 
        color="bg-red-500" 
        hoverColor="hover:bg-red-700" 
        textColor="text-white"
        text={isRegister ? "Register with Google" : "Login with Google"}
        logo={googleLogo}
      />
      <ThirdPartyButton 
        onClick={() => handleThirdPartyClick(signInWithFacebook)} 
        className="w-full mt-2 flex items-center justify-center" 
        color="bg-blue-700" 
        hoverColor="hover:bg-blue-900" 
        textColor="text-white"
        text={isRegister ? "Register with Facebook" : "Login with Facebook"}
        logo={facebookLogo}
      />
      <ThirdPartyButton 
        onClick={() => handleThirdPartyClick(signInWithYahoo)} 
        className="w-full mt-2 flex items-center justify-center" 
        color="bg-purple-700" 
        hoverColor="hover:bg-purple-900" 
        textColor="text-white"
        text={isRegister ? "Register with Yahoo" : "Login with Yahoo"}
        logo={yahooLogo}
      />
      <ThirdPartyButton 
        onClick={() => handleThirdPartyClick(signInWithMicrosoft)} 
        className="w-full mt-2 flex items-center justify-center" 
        color="bg-green-700" 
        hoverColor="hover:bg-green-900" 
        textColor="text-white"
        text={isRegister ? "Register with Microsoft" : "Login with Microsoft"}
        logo={microsoftLogo}
      />
      <ThirdPartyButton 
        onClick={() => handleThirdPartyClick(signInWithApple)} 
        className="w-full mt-2 flex items-center justify-center" 
        color="bg-black" 
        hoverColor="hover:bg-gray-800" 
        textColor="text-white"
        text={isRegister ? "Register with Apple" : "Login with Apple"}
        logo={appleLogo}
      />
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="w-full p-2 border rounded"
        />
        {verificationSent && (
          <input
            type="text"
            placeholder="Verification Code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            className="w-full p-2 border rounded"
          />
        )}
        <ThirdPartyButton 
          onClick={handlePhoneRegister} 
          className="w-full mt-2 flex items-center justify-center" 
          color="bg-yellow-500" 
          hoverColor="hover:bg-yellow-700" 
          textColor="text-black"
          text={verificationSent ? 'Verify Code' : (isRegister ? 'Register with Phone' : 'Login with Phone')}
          logo={phoneLogo}
        />
        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
};

export default ThirdPartyAuthPanel;   */



/* import React, { useState } from 'react';
//last version but not working with login and register toggle 
import ThirdPartyButton from './ThirdPartyButton';
import { signInWithGoogle, signInWithFacebook, signInWithYahoo, signInWithMicrosoft, signInWithApple, signInWithPhone, setupRecaptcha } from '../../firebase/auth';
import googleLogo from '../../assets/logos/googleLogo.png';
import facebookLogo from '../../assets/logos/facebookLogo.png';
import yahooLogo from '../../assets/logos/YahooLogo.jpg';
import microsoftLogo from '../../assets/logos/microsoftLogo.png';
import appleLogo from '../../assets/logos/appleLogo.png';
import phoneLogo from '../../assets/logos/phoneLogo.png';

const ThirdPartyAuthPanel = ({ handleThirdPartyAuth, isRegister }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);

  const handlePhoneRegister = async () => {
    if (!verificationSent) {
      const recaptchaVerifier = setupRecaptcha('recaptcha-container');
      try {
        const confirmationResult = await signInWithPhone(phoneNumber, recaptchaVerifier);
        window.confirmationResult = confirmationResult;
        setVerificationSent(true);
      } catch (error) {
        console.error("Error during phone sign-in:", error);
      }
    } else {
      try {
        const result = await window.confirmationResult.confirm(verificationCode);
        console.log('User registered with phone:', result.user);
      } catch (error) {
        console.error("Error confirming verification code:", error);
      }
    }
  };

  return (
    <div className="space-y-4">
      <ThirdPartyButton 
        onClick={() => handleThirdPartyAuth(signInWithGoogle)} 
        className="w-full mt-2 flex items-center justify-center" 
        color="bg-red-500" 
        hoverColor="hover:bg-red-700" 
        textColor="text-white"
        text={isRegister ? 'Register with Google' : 'Login with Google'}
        logo={googleLogo}
      />
      <ThirdPartyButton 
        onClick={() => handleThirdPartyAuth(signInWithFacebook)} 
        className="w-full mt-2 flex items-center justify-center" 
        color="bg-blue-700" 
        hoverColor="hover:bg-blue-900" 
        textColor="text-white"
        text={isRegister ? 'Register with Facebook' : 'Login with Facebook'}
        logo={facebookLogo}
      />
      <ThirdPartyButton 
        onClick={() => handleThirdPartyAuth(signInWithYahoo)} 
        className="w-full mt-2 flex items-center justify-center" 
        color="bg-purple-700" 
        hoverColor="hover:bg-purple-900" 
        textColor="text-white"
        text={isRegister ? 'Register with Yahoo' : 'Login with Yahoo'}
        logo={yahooLogo}
      />
      <ThirdPartyButton 
        onClick={() => handleThirdPartyAuth(signInWithMicrosoft)} 
        className="w-full mt-2 flex items-center justify-center" 
        color="bg-green-700" 
        hoverColor="hover:bg-green-900" 
        textColor="text-white"
        text={isRegister ? 'Register with Microsoft' : 'Login with Microsoft'}
        logo={microsoftLogo}
      />
      <ThirdPartyButton 
        onClick={() => handleThirdPartyAuth(signInWithApple)} 
        className="w-full mt-2 flex items-center justify-center" 
        color="bg-black" 
        hoverColor="hover:bg-gray-800" 
        textColor="text-white"
        text={isRegister ? 'Register with Apple' : 'Login with Apple'}
        logo={appleLogo}
      />
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="w-full p-2 border rounded"
        />
        {verificationSent && (
          <input
            type="text"
            placeholder="Verification Code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            className="w-full p-2 border rounded"
          />
        )}
        <ThirdPartyButton 
          onClick={handlePhoneRegister} 
          className="w-full mt-2 flex items-center justify-center" 
          color="bg-yellow-500" 
          hoverColor="hover:bg-yellow-700" 
          textColor="text-black"
          text={verificationSent ? 'Verify Code' : isRegister ? 'Register with Phone' : 'Login with Phone'}
          logo={phoneLogo}
        />
        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
};

export default ThirdPartyAuthPanel;
 */


/* import React, { useState } from 'react';
import ThirdPartyButton from './ThirdPartyButton';
import { signInWithGoogle, signInWithFacebook, signInWithYahoo, signInWithMicrosoft, signInWithApple, signInWithPhone, setupRecaptcha } from '../../firebase/auth';
import googleLogo from '../../assets/logos/googleLogo.png';
import facebookLogo from '../../assets/logos/facebookLogo.png';
import yahooLogo from '../../assets/logos/YahooLogo.jpg';
import microsoftLogo from '../../assets/logos/microsoftLogo.png';
import appleLogo from '../../assets/logos/appleLogo.png';
import phoneLogo from '../../assets/logos/phoneLogo.png';

const ThirdPartyAuthPanel = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);

  const handlePhoneRegister = async () => {
    if (!verificationSent) {
      const recaptchaVerifier = setupRecaptcha('recaptcha-container');
      try {
        const confirmationResult = await signInWithPhone(phoneNumber, recaptchaVerifier);
        window.confirmationResult = confirmationResult;
        setVerificationSent(true);
      } catch (error) {
        console.error("Error during phone sign-in:", error);
      }
    } else {
      try {
        const result = await window.confirmationResult.confirm(verificationCode);
        console.log('User registered with phone:', result.user);
      } catch (error) {
        console.error("Error confirming verification code:", error);
      }
    }
  };

  return (
    <div className="space-y-4">
      <ThirdPartyButton 
        onClick={signInWithGoogle} 
        className="w-full mt-2 flex items-center justify-center" 
        color="bg-red-500" 
        hoverColor="hover:bg-red-700" 
        textColor="text-white"
        text="Register with Google"
        logo={googleLogo}
      />
      <ThirdPartyButton 
        onClick={signInWithFacebook} 
        className="w-full mt-2 flex items-center justify-center" 
        color="bg-blue-700" 
        hoverColor="hover:bg-blue-900" 
        textColor="text-white"
        text="Register with Facebook"
        logo={facebookLogo}
      />
      <ThirdPartyButton 
        onClick={signInWithYahoo} 
        className="w-full mt-2 flex items-center justify-center" 
        color="bg-purple-700" 
        hoverColor="hover:bg-purple-900" 
        textColor="text-white"
        text="Register with Yahoo"
        logo={yahooLogo}
      />
      <ThirdPartyButton 
        onClick={signInWithMicrosoft} 
        className="w-full mt-2 flex items-center justify-center" 
        color="bg-green-700" 
        hoverColor="hover:bg-green-900" 
        textColor="text-white"
        text="Register with Microsoft"
        logo={microsoftLogo}
      />
      <ThirdPartyButton 
        onClick={signInWithApple} 
        className="w-full mt-2 flex items-center justify-center" 
        color="bg-black" 
        hoverColor="hover:bg-gray-800" 
        textColor="text-white"
        text="Register with Apple"
        logo={appleLogo}
      />
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="w-full p-2 border rounded"
        />
        {verificationSent && (
          <input
            type="text"
            placeholder="Verification Code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            className="w-full p-2 border rounded"
          />
        )}
        <ThirdPartyButton 
          onClick={handlePhoneRegister} 
          className="w-full mt-2 flex items-center justify-center" 
          color="bg-yellow-500" 
          hoverColor="hover:bg-yellow-700" 
          textColor="text-black"
          text={verificationSent ? 'Verify Code' : 'Register with Phone'}
          logo={phoneLogo}
        />
        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
};

export default ThirdPartyAuthPanel; */


 


