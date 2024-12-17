// src/components/forms/RegistrationForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmailField from '../common/EmailField';
import PasswordField from '../common/PasswordField';
import ConfirmPasswordField from '../common/ConfirmPasswordField';
import InputField from '../common/InputField';
import Button from '../common/Button';
import Alert from '../common/Alert';
import ThirdPartyAuthPanel from '../common/ThirdPartyAuthPanel';
import { registerWithEmailPassword, setupRecaptcha, signInWithPhone, handleThirdPartyRegister } from '../../firebase/auth';
import { validatePhoneNumber } from '../../utils/validation';

const RegistrationForm = ({ onRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [emailErrors, setEmailErrors] = useState([]);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [confirmPasswordErrors, setConfirmPasswordErrors] = useState([]);
  const [phoneNumberErrors, setPhoneNumberErrors] = useState([]);
  const [verificationSent, setVerificationSent] = useState(false);
  const [message, setMessage] = useState({ message: '', type: '' });
  const navigate = useNavigate();

  const clearAllErrors = () => {
    setEmailErrors([]);
    setPasswordErrors([]);
    setConfirmPasswordErrors([]);
    setPhoneNumberErrors([]);
    setMessage({ message: '', type: '' });
  };

  const handlePhoneNumberChange = (e) => {
    const { value } = e.target;
    setPhoneNumber(value);
    const errors = validatePhoneNumber(value);
    setPhoneNumberErrors(errors);
    setMessage({ message: '', type: '' });
  };

  const handlePhoneRegister = async (e) => {
    e.preventDefault();
    setMessage({ message: '', type: '' });

    if (!window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier = setupRecaptcha('recaptcha-container');
        await window.recaptchaVerifier.render().then(widgetId => {
          window.recaptchaWidgetId = widgetId;
        });
      } catch (error) {
        console.error('Error initializing RecaptchaVerifier:', error);
        setMessage({ message: `Error initializing RecaptchaVerifier: ${error.message}`, type: 'error' });
        return;
      }
    }

    if (!verificationSent) {
      try {
        const appVerifier = window.recaptchaVerifier;
        const confirmationResult = await signInWithPhone(phoneNumber, appVerifier);
        window.confirmationResult = confirmationResult;
        setVerificationSent(true);
        setMessage({ message: 'Verification code sent to your phone.', type: 'success' });
      } catch (error) {
        console.error('Error during phone registration:', error);
        setMessage({ message: `Failed to send verification code: ${error.message}`, type: 'error' });
      }
    } else {
      try {
        const result = await window.confirmationResult.confirm(verificationCode);
        console.log('User registered with phone:', result.user);
        setMessage({ message: 'Phone number verified and user registered. A verification email has been sent.', type: 'success' });
      } catch (error) {
        console.error('Error confirming verification code:', error);
        setMessage({ message: `Invalid verification code: ${error.message}`, type: 'error' });
      }
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage({ message: '', type: '' });
    if (emailErrors.length === 0 && passwordErrors.length === 0 && confirmPasswordErrors.length === 0 && phoneNumberErrors.length === 0) {
      try {
        const user = await registerWithEmailPassword(email, password);
        setMessage({ message: 'Registration successful. A verification email has been sent.', type: 'success' });
        console.log('User registered:', email, phoneNumber);
        onRegister(email, password, phoneNumber);
        setTimeout(() => {
          navigate('/thank-you');
        }, 2000);
      } catch (error) {
        console.error('Error registering new user:', error);
        setMessage({ message: `Error registering new user: ${error.message}`, type: 'error' });
      }
    } else {
      setMessage({ message: 'Please fix the errors in the form.', type: 'error' });
    }
  };

  const handleThirdPartyRegister = async (providerFunction) => {
    clearAllErrors();
    try {
      const user = await providerFunction();
      await sendEmailVerification(user);
      setMessage({ message: 'Registration successful. A verification email has been sent.', type: 'success' });
      setTimeout(() => {
        navigate('/thank-you');
      }, 2000);
    } catch (error) {
      console.error('Error during third-party registration:', error);
      setMessage({ message: `Error during third-party registration: ${error.message}`, type: 'error' });
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleRegister}>
      <EmailField email={email} setEmail={setEmail} setEmailErrors={setEmailErrors} />
      <PasswordField password={password} setPassword={setPassword} setPasswordErrors={setPasswordErrors} />
      <ConfirmPasswordField confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword} password={password} setConfirmPasswordErrors={setConfirmPasswordErrors} />
      <InputField
        label="Phone Number"
        type="text"
        value={phoneNumber}
        onChange={handlePhoneNumberChange}
        errors={phoneNumberErrors}
        placeholder="Enter your phone number"
      />
      {verificationSent && (
        <InputField
          label="Verification Code"
          type="text"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          placeholder="Enter the verification code"
        />
      )}
      {message.message && <Alert message={message.message} type={message.type} />}
      <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 border border-blue-700">Register</Button>
      <ThirdPartyAuthPanel handleThirdPartyAuth={handleThirdPartyRegister} isRegister={true} />
      <div id="recaptcha-container"></div>
    </form>
  );
};

export default RegistrationForm;


/* // src/components/forms/RegistrationForm.jsx
import React, { useState } from 'react';
import EmailField from '../common/EmailField';
import PasswordField from '../common/PasswordField';
import ConfirmPasswordField from '../common/ConfirmPasswordField';
import InputField from '../common/InputField';
import Button from '../common/Button';
import Alert from '../common/Alert';
import ThirdPartyAuthPanel from '../common/ThirdPartyAuthPanel';
import { registerWithEmailPassword, setupRecaptcha, signInWithPhone } from '../../firebase/auth';
import { validatePhoneNumber } from '../../utils/validation';

const RegistrationForm = ({ onRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [emailErrors, setEmailErrors] = useState([]);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [confirmPasswordErrors, setConfirmPasswordErrors] = useState([]);
  const [phoneNumberErrors, setPhoneNumberErrors] = useState([]);
  const [verificationSent, setVerificationSent] = useState(false);
  const [message, setMessage] = useState({ message: '', type: '' });

  const clearAllErrors = () => {
    setEmailErrors([]);
    setPasswordErrors([]);
    setConfirmPasswordErrors([]);
    setPhoneNumberErrors([]);
    setMessage({ message: '', type: '' });
  };

  const handlePhoneNumberChange = (e) => {
    const { value } = e.target;
    setPhoneNumber(value);
    const errors = validatePhoneNumber(value);
    setPhoneNumberErrors(errors);
    setMessage({ message: '', type: '' }); // Clear the message when the user starts typing
  };

  const handlePhoneRegister = async (e) => {
    e.preventDefault();
    setMessage({ message: '', type: '' }); // Clear previous messages

    if (!window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier = setupRecaptcha('recaptcha-container');
        await window.recaptchaVerifier.render().then(widgetId => {
          window.recaptchaWidgetId = widgetId;
        });
      } catch (error) {
        console.error('Error initializing RecaptchaVerifier:', error);
        setMessage({ message: `Error initializing RecaptchaVerifier: ${error.message}`, type: 'error' });
        return;
      }
    }

    if (!verificationSent) {
      try {
        const appVerifier = window.recaptchaVerifier;
        const confirmationResult = await signInWithPhone(auth, phoneNumber, appVerifier);
        window.confirmationResult = confirmationResult;
        setVerificationSent(true);
        setMessage({ message: 'Verification code sent to your phone.', type: 'success' });
      } catch (error) {
        console.error('Error during phone registration:', error);
        setMessage({ message: `Failed to send verification code: ${error.message}`, type: 'error' });
      }
    } else {
      try {
        const result = await window.confirmationResult.confirm(verificationCode);
        console.log('User registered with phone:', result.user);
        setMessage({ message: 'Phone number verified and user registered. A verification email has been sent.', type: 'success' });
      } catch (error) {
        console.error('Error confirming verification code:', error);
        setMessage({ message: `Invalid verification code: ${error.message}`, type: 'error' });
      }
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage({ message: '', type: '' }); // Clear previous messages
    if (emailErrors.length === 0 && passwordErrors.length === 0 && confirmPasswordErrors.length === 0 && phoneNumberErrors.length === 0) {
      try {
        const user = await registerWithEmailPassword(email, password);
        setMessage({ message: 'Registration successful. A verification email has been sent.', type: 'success' });
        console.log('User registered:', email, phoneNumber);
        onRegister(email, password, phoneNumber);
      } catch (error) {
        console.error('Error registering new user:', error);
        setMessage({ message: `Error registering new user: ${error.message}`, type: 'error' });
      }
    } else {
      setMessage({ message: 'Please fix the errors in the form.', type: 'error' });
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleRegister}>
      <EmailField email={email} setEmail={setEmail} setEmailErrors={setEmailErrors} />
      <PasswordField password={password} setPassword={setPassword} setPasswordErrors={setPasswordErrors} />
      <ConfirmPasswordField confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword} password={password} setConfirmPasswordErrors={setConfirmPasswordErrors} />
      <InputField
        label="Phone Number"
        type="text"
        value={phoneNumber}
        onChange={handlePhoneNumberChange}
        errors={phoneNumberErrors}
        placeholder="Enter your phone number"
      />
      {verificationSent && (
        <InputField
          label="Verification Code"
          type="text"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          placeholder="Enter the verification code"
        />
      )}
      {message.message && <Alert message={message.message} type={message.type} />}
      <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 border border-blue-700">Register</Button>
      <ThirdPartyAuthPanel isRegister={true} />
      <div id="recaptcha-container"></div>
    </form>
  );
};

export default RegistrationForm; */



/* import React, { useState } from 'react';
import EmailField from '../common/EmailField';
import PasswordField from '../common/PasswordField';
import ConfirmPasswordField from '../common/ConfirmPasswordField';
import InputField from '../common/InputField';
import Button from '../common/Button';
import Alert from '../common/Alert';
import ThirdPartyAuthPanel from '../common/ThirdPartyAuthPanel';
import { auth, googleProvider, facebookProvider, yahooProvider, microsoftProvider, appleProvider } from '../../firebase/firebase';
import { createUserWithEmailAndPassword, signInWithPopup, sendEmailVerification, signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';
import { validatePhoneNumber } from '../../utils/validation';
import LoginForm from './LoginForm';

const RegistrationForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [emailErrors, setEmailErrors] = useState([]);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [confirmPasswordErrors, setConfirmPasswordErrors] = useState([]);
  const [phoneNumberErrors, setPhoneNumberErrors] = useState([]);
  const [verificationSent, setVerificationSent] = useState(false);
  const [message, setMessage] = useState({ message: '', type: '' });
  const [isLogin, setIsLogin] = useState(false); // New state to toggle between login and registration forms

  const clearAllErrors = () => {
    setEmailErrors([]);
    setPasswordErrors([]);
    setConfirmPasswordErrors([]);
    setPhoneNumberErrors([]);
    setMessage({ message: '', type: '' });
  };

  const handlePhoneNumberChange = (e) => {
    const { value } = e.target;
    setPhoneNumber(value);
    const errors = validatePhoneNumber(value);
    setPhoneNumberErrors(errors);
    setMessage({ message: '', type: '' }); // Clear the message when the user starts typing
  };

  const handlePhoneRegister = async (e) => {
    e.preventDefault();
    setMessage({ message: '', type: '' }); // Clear previous messages

    if (!window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
          size: 'invisible',
          callback: (response) => {
            console.log("reCAPTCHA solved", response);
          },
          'expired-callback': () => {
            console.warn("reCAPTCHA expired, resetting...");
            window.recaptchaVerifier.reset();
          }
        }, auth);
        await window.recaptchaVerifier.render().then(widgetId => {
          window.recaptchaWidgetId = widgetId;
        });
      } catch (error) {
        console.error('Error initializing RecaptchaVerifier:', error);
        setMessage({ message: `Error initializing RecaptchaVerifier: ${error.message}`, type: 'error' });
        return;
      }
    }

    if (!verificationSent) {
      try {
        const appVerifier = window.recaptchaVerifier;
        const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
        window.confirmationResult = confirmationResult;
        setVerificationSent(true);
        setMessage({ message: 'Verification code sent to your phone.', type: 'success' });
      } catch (error) {
        console.error('Error during phone registration:', error);
        setMessage({ message: `Failed to send verification code: ${error.message}`, type: 'error' });
      }
    } else {
      try {
        const result = await window.confirmationResult.confirm(verificationCode);
        console.log('User registered with phone:', result.user);
        setMessage({ message: 'Phone number verified and user registered. A verification email has been sent.', type: 'success' });
      } catch (error) {
        console.error('Error confirming verification code:', error);
        setMessage({ message: `Invalid verification code: ${error.message}`, type: 'error' });
      }
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage({ message: '', type: '' }); // Clear previous messages
    if (emailErrors.length === 0 && passwordErrors.length === 0 && confirmPasswordErrors.length === 0 && phoneNumberErrors.length === 0) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        setMessage({ message: 'Registration successful. A verification email has been sent.', type: 'success' });
        console.log('User registered:', email, phoneNumber);
      } catch (error) {
        console.error('Error registering new user:', error);
        setMessage({ message: `Error registering new user: ${error.message}`, type: 'error' });
      }
    } else {
      setMessage({ message: 'Please fix the errors in the form.', type: 'error' });
    }
  };

  const handleThirdPartyRegister = async (provider) => {
    clearAllErrors(); // Clear all errors before starting third-party registration
    try {
      const result = await signInWithPopup(auth, provider);
      await sendEmailVerification(result.user);
      setMessage({ message: 'Registration successful. A verification email has been sent.', type: 'success' });
    } catch (error) {
      console.error('Error during third-party registration:', error);
      setMessage({ message: `Error during third-party registration: ${error.message}`, type: 'error' });
    }
  };

  return (
    <div>
      {isLogin ? (
        <div>
          <LoginForm />
          <Button
            type="button"
            onClick={() => setIsLogin(false)} // Toggle to show the registration form
            className="w-full bg-gray-500 hover:bg-gray-700 border border-gray-700 font-bold mt-4"
          >
            Back to Register
          </Button>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={handleRegister}>
          <EmailField email={email} setEmail={setEmail} setEmailErrors={setEmailErrors} />
          <PasswordField password={password} setPassword={setPassword} setPasswordErrors={setPasswordErrors} />
          <ConfirmPasswordField confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword} password={password} setConfirmPasswordErrors={setConfirmPasswordErrors} />
          <InputField
            label="Phone Number"
            type="text"
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            errors={phoneNumberErrors}
            placeholder="Enter your phone number"
          />
          {verificationSent && (
            <InputField
              label="Verification Code"
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter the verification code"
            />
          )}
          {message.message && <Alert message={message.message} type={message.type} />}
          <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 border border-blue-700">Register</Button>
          <Button
            type="button"
            onClick={() => setIsLogin(true)} // Toggle to show the login form
            className="w-full bg-green-500 hover:bg-green-700 border border-green-700 font-bold mt-4"
          >
            Login
          </Button>
          <ThirdPartyAuthPanel handleThirdPartyAuth={handleThirdPartyRegister} isRegister={true} />
          <div id="recaptcha-container"></div>
        </form>
      )}
    </div>
  );
};

export default RegistrationForm;
 */


// old style

/*  import React, { useState } from 'react';
import EmailField from '../common/EmailField';
import PasswordField from '../common/PasswordField';
import ConfirmPasswordField from '../common/ConfirmPasswordField';
import InputField from '../common/InputField';
import Button from '../common/Button';
import Alert from '../common/Alert';
import { auth, googleProvider, facebookProvider, yahooProvider, microsoftProvider, appleProvider } from '../../firebase/firebase';
import { createUserWithEmailAndPassword, signInWithPopup, sendEmailVerification, signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';
import { validatePhoneNumber } from '../../utils/validation';

const RegistrationForm = ({ onRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [emailErrors, setEmailErrors] = useState([]);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [confirmPasswordErrors, setConfirmPasswordErrors] = useState([]);
  const [phoneNumberErrors, setPhoneNumberErrors] = useState([]);
  const [verificationSent, setVerificationSent] = useState(false);
  const [message, setMessage] = useState({ message: '', type: '' });

  const clearAllErrors = () => {
    setEmailErrors([]);
    setPasswordErrors([]);
    setConfirmPasswordErrors([]);
    setPhoneNumberErrors([]);
    setMessage({ message: '', type: '' });
  };

  const handlePhoneNumberChange = (e) => {
    const { value } = e.target;
    setPhoneNumber(value);
    const errors = validatePhoneNumber(value);
    setPhoneNumberErrors(errors);
    setMessage({ message: '', type: '' }); // Clear the message when the user starts typing
  };

  const handlePhoneRegister = async (e) => {
    e.preventDefault();
    setMessage({ message: '', type: '' }); // Clear previous messages

    if (!window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
          size: 'invisible',
          callback: (response) => {
            console.log("reCAPTCHA solved", response);
          },
          'expired-callback': () => {
            console.warn("reCAPTCHA expired, resetting...");
            window.recaptchaVerifier.reset();
          }
        }, auth);
        await window.recaptchaVerifier.render().then(widgetId => {
          window.recaptchaWidgetId = widgetId;
        });
      } catch (error) {
        console.error('Error initializing RecaptchaVerifier:', error);
        setMessage({ message: `Error initializing RecaptchaVerifier: ${error.message}`, type: 'error' });
        return;
      }
    }

    if (!verificationSent) {
      try {
        const appVerifier = window.recaptchaVerifier;
        const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
        window.confirmationResult = confirmationResult;
        setVerificationSent(true);
        setMessage({ message: 'Verification code sent to your phone.', type: 'success' });
      } catch (error) {
        console.error('Error during phone registration:', error);
        setMessage({ message: `Failed to send verification code: ${error.message}`, type: 'error' });
      }
    } else {
      try {
        const result = await window.confirmationResult.confirm(verificationCode);
        console.log('User registered with phone:', result.user);
        setMessage({ message: 'Phone number verified and user registered. A verification email has been sent.', type: 'success' });
      } catch (error) {
        console.error('Error confirming verification code:', error);
        setMessage({ message: `Invalid verification code: ${error.message}`, type: 'error' });
      }
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage({ message: '', type: '' }); // Clear previous messages
    if (emailErrors.length === 0 && passwordErrors.length === 0 && confirmPasswordErrors.length === 0 && phoneNumberErrors.length === 0) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        setMessage({ message: 'Registration successful. A verification email has been sent.', type: 'success' });
        console.log('User registered:', email, phoneNumber);
        onRegister(email, password, phoneNumber);
      } catch (error) {
        console.error('Error registering new user:', error);
        setMessage({ message: `Error registering new user: ${error.message}`, type: 'error' });
      }
    } else {
      setMessage({ message: 'Please fix the errors in the form.', type: 'error' });
    }
  };

  const handleThirdPartyRegister = async (provider) => {
    clearAllErrors(); // Clear all errors before starting third-party registration
    try {
      const result = await signInWithPopup(auth, provider);
      await sendEmailVerification(result.user);
      setMessage({ message: 'Registration successful. A verification email has been sent.', type: 'success' });
    } catch (error) {
      console.error('Error during third-party registration:', error);
      setMessage({ message: `Error during third-party registration: ${error.message}`, type: 'error' });
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleRegister}>
      <EmailField email={email} setEmail={setEmail} setEmailErrors={setEmailErrors} />
      <PasswordField password={password} setPassword={setPassword} setPasswordErrors={setPasswordErrors} />
      <ConfirmPasswordField confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword} password={password} setConfirmPasswordErrors={setConfirmPasswordErrors} />
      <InputField
        label="Phone Number"
        type="text"
        value={phoneNumber}
        onChange={handlePhoneNumberChange}
        errors={phoneNumberErrors}
        placeholder="Enter your phone number"
      />
      {verificationSent && (
        <InputField
          label="Verification Code"
          type="text"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          placeholder="Enter the verification code"
        />
      )}
      {message.message && <Alert message={message.message} type={message.type} />}
      <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 border border-blue-700">Register</Button>
      <Button type="button" onClick={() => handleThirdPartyRegister(googleProvider)} className="w-full bg-red-500 hover:bg-red-700 mt-2 text-xs">
        Register with Google
      </Button>
      <Button type="button" onClick={() => handleThirdPartyRegister(facebookProvider)} className="w-full bg-blue-700 hover:bg-blue-900 mt-2 text-xs">
        Register with Facebook
      </Button>
      <Button type="button" onClick={() => handleThirdPartyRegister(yahooProvider)} className="w-full bg-purple-700 hover:bg-purple-900 mt-2 text-xs">
        Register with Yahoo
      </Button>
      <Button type="button" onClick={() => handleThirdPartyRegister(microsoftProvider)} className="w-full bg-green-700 hover:bg-green-900 mt-2 text-xs">
        Register with Microsoft
      </Button>
      <Button type="button" onClick={() => handleThirdPartyRegister(appleProvider)} className="w-full bg-black hover:bg-gray-800 mt-2 text-xs">
        Register with Apple
      </Button>
      <Button type="button" onClick={handlePhoneRegister} className="w-full bg-yellow-500 hover:bg-yellow-700 mt-2 text-xs">
        {verificationSent ? 'Verify Code' : 'Register with Phone'}
      </Button>
      <div id="recaptcha-container"></div>
    </form>
  );
};

export default RegistrationForm;
  */