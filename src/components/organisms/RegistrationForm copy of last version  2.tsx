
// this is last copy after reverting to basic functions . next files is a 
// src/components/common/RegistrationForm.jsx
 // THIS IS THE LATEST UPDATED CLEAN VERSION. Not sure what is the cleaning . handling third pary only by the panel.
 import React, { useState, useEffect } from 'react';
import EmailField from '../common/EmailField';
import PasswordField from '../common/PasswordField';
import ConfirmPasswordField from '../common/ConfirmPasswordField';
import InputField from '../common/InputField';
import Button from '../common/Button';
import Alert from '../common/Alert';
import ThirdPartyAuthPanel from '../common/ThirdPartyAuthPanel';
 import PhoneAuth from '../common/PhoneAuth';
 import AutoForm from '../common/AutoForm';
import { 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  sendEmailVerification, 
  signInWithPhoneNumber, 
  RecaptchaVerifier } 
  from 'firebase/auth';
import { validatePhoneNumber } from '../../utils/validation';
import { useNavigate } from 'react-router-dom';
import {
  auth,
  githubProvider,
  googleProvider,
  facebookProvider,
  yahooProvider,
  microsoftProvider,
  appleProvider,
  twitterProvider,
} from '../../firebase/firebase';


const RegistrationForm = () => {
   // Authentication State Variables
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // Phone Authentication State Variables
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  // Error States
  const [emailErrors, setEmailErrors] = useState([]);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [confirmPasswordErrors, setConfirmPasswordErrors] = useState([]);
  const [phoneNumberErrors, setPhoneNumberErrors] = useState([]);   
  const [verificationCodeErrors, setVerificationCodeErrors] = useState([]);
  
 // Message State
const [message, setMessage] = useState({ message: '', type: '' });
  
 // Form Mode
 const [isRegister, setIsRegister] = useState(true);
 
 const navigate = useNavigate();


 // Clear All Errors and Messages
 const clearAllErrors = () => {
  setEmailErrors([]);
  setPasswordErrors([]);
  setConfirmPasswordErrors([]);
  setPhoneNumberErrors([]);
  setVerificationCodeErrors([]);
  setMessage({ message: '', type: '' });
};

  // Initialize reCAPTCHA
  useEffect(() => {
    const initializeRecaptcha = async () => {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(
          'recaptcha-container',
          {
            size: 'visible',
            callback: (response) => {
              console.log('reCAPTCHA solved:', response);
            },
            'expired-callback': () => {
              console.warn('reCAPTCHA expired, resetting...');
              window.recaptchaVerifier.reset();
            },
          },
          auth
        );
        try {
          await window.recaptchaVerifier.render();
          console.log('reCAPTCHA initialized');
        } catch (error) {
          console.error('Error rendering reCAPTCHA:', error);
        }
      }
    };

    initializeRecaptcha();
  }, [auth]);


  // Handle Phone Number Input Change
  const handlePhoneNumberChange = (e) => {
    const { value } = e.target;
    setPhoneNumber(value);
    const errors = validatePhoneNumber(value);
    setPhoneNumberErrors(errors);
    setMessage({ message: '', type: '' });
  };


   // Handle Verification Code Input Change
   const handleVerificationCodeChange = (e) => {
    const { value } = e.target;
    setVerificationCode(value);
    // Add validation if necessary
    setVerificationCodeErrors([]);
    setMessage({ message: '', type: '' });
  };


   // Handle Phone Registration (Send SMS or Verify Code)
  const handlePhoneRegister = async (e) => {
    e.preventDefault();
    clearAllErrors();

    const formattedPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber : '+' + phoneNumber;

    if (!formattedPhoneNumber) {
      setPhoneNumberErrors(['Phone number is required']);
      return;
    }
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
        size: 'visible',
        callback: (response) => {
          console.log("reCAPTCHA solved", response);
        },
        'expired-callback': () => {
          console.warn("reCAPTCHA expired, resetting...");
          window.recaptchaVerifier.reset();
        },
      }, auth);
    }

    if (!verificationSent) {
      try {
        const appVerifier = window.recaptchaVerifier;
        console.log('Sending SMS to:', formattedPhoneNumber);
        const confirmationResult = await signInWithPhoneNumber(auth, formattedPhoneNumber, appVerifier);
        window.confirmationResult = confirmationResult;
        setVerificationSent(true);
        setMessage({ message: 'Verification code sent to your phone.', type: 'success' });
        console.log('SMS sent successfully');
      } catch (error) {
        console.error('Error sending SMS:', error);
        setMessage({ message: `Failed to send verification code: ${error.message}`, type: 'error' });
      }
    } else {
      try {
        const result = await window.confirmationResult.confirm(verificationCode);
        //console.log('User registered with phone:', result.user);
        console.log('Phone number verified:', result.user);
        setMessage({ message: 'Phone number verified and user registered. A verification email has been sent.', type: 'success' });
      
        if (isRegister) {
          // Additional registration logic if needed
          console.log('Proceeding with additional registration steps');
        } else {
          // Additional login logic if needed
          console.log('Proceeding with additional login steps');
        }

        // Optionally, navigate the user to another page
       setTimeout(() => navigate('/stablehand-welcome'), 2000);
      
      } catch (error) {
        console.error('Error confirming verification code:', error);
        setMessage({ message: `Invalid verification code: ${error.message}`, type: 'error' });
      }
    }
  };
  // Handle Email Registration/Login
  const handleRegister = async (e) => {
    e.preventDefault();
    clearAllErrors();

   // Basic validation before attempting to register
   if (isRegister && password !== confirmPassword) {
    setConfirmPasswordErrors(['Passwords do not match']);
    setMessage({ message: 'Please fix the errors in the form.', type: 'error' });
    return;
  }

    if (emailErrors.length === 0 && passwordErrors.length === 0 && confirmPasswordErrors.length === 0 && phoneNumberErrors.length === 0) {
      try {
        
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        setMessage({ message: 'Registration successful. A verification email has been sent.', type: 'success' });
        console.log('User registered:', email);
      } catch (error) {
        console.error('Error registering new user:', error);
        setMessage({ message: `Error registering new user: ${error.message}`, type: 'error' });
      }
    } else {
      setMessage({ message: 'Please fix the errors in the form.', type: 'error' });
    }
  };


/*     // Check if all validations pass
  if (
    emailErrors.length === 0 &&
    passwordErrors.length === 0 &&
    confirmPasswordErrors.length === 0 &&
    phoneNumberErrors.length === 0
  ) {
    try {
      if (isRegister) {
        // Registration Logic
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        setMessage({ message: 'Registration successful. A verification email has been sent.', type: 'success' });
        console.log('User registered:', email);
      } else {
        // Login Logic
        // Implement phone number verification if needed, or use email/password sign-in
        // Example using email and password:
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        setMessage({ message: 'Login successful.', type: 'success' });
        console.log('User logged in:', email);
        
        // If you prefer to implement phone number login, additional logic is required
        // This might involve sending a verification code and verifying it as shown in your PhoneAuth component
      }
      // Optionally, navigate the user to another page after successful login/registration
      // navigate('/dashboard');
    } catch (error) {
      console.error('Authentication Error:', error);
      setMessage({ message: `Error: ${error.message}`, type: 'error' });
    }
  } else {
    setMessage({ message: 'Please fix the errors in the form.', type: 'error' });
  }
};*/


  // Handle Third-Party Authentication
  const handleThirdPartyRegister = async (provider) => {
    clearAllErrors();
    try {
      const result = await signInWithPopup(auth, provider);
      await sendEmailVerification(result.user);
      setMessage({ message: 'Registration successful. A verification email has been sent.', type: 'success' });
      console.log('Third-party user registered:', result.user.email);
       // Optionally, navigate the user to another page
       setTimeout(() => navigate('/stablehand-welcome'), 2000);
    } catch (error) {
      console.error('Error during third-party registration:', error);
      setMessage({ message: `Error during third-party registration: ${error.message}`, type: 'error' });
    }
  };
 // Toggle Between Register and Login
 const toggleForm = () => {
  setIsRegister(!isRegister);
  clearAllErrors();
  setVerificationSent(false);
  setPhoneNumber('');
  setVerificationCode('');
};

  return (
    <div>
      {/* <AutoForm/> */}
      <form className="space-y-4" onSubmit={handleRegister}>
 {/* Email Field */}
        <EmailField 
          email={email} 
          setEmail={setEmail} 
          setEmailErrors={setEmailErrors} />

        {/* Password Field */}   
        <PasswordField 
          password={password} 
          setPassword={setPassword} 
          setPasswordErrors={setPasswordErrors} />

     {/* Confirm Password Field (Only in Registration Mode) */}
        <ConfirmPasswordField 
          confirmPassword={confirmPassword} 
          setConfirmPassword={setConfirmPassword} 
          password={password} 
          setConfirmPasswordErrors={setConfirmPasswordErrors} />

          {/* Phone Number Field */}
        <InputField
          label="Phone Number"
          type="text"
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
          errors={phoneNumberErrors}
          placeholder="Enter your phone number"
        />
        
         {/* Verification Code Field (After SMS is Sent) */}
        {verificationSent && (
          <InputField
            label="Verification Code"
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Enter the verification code"
          />
        )}

         {/* Display Messages */}
        {message.message && <Alert message={message.message} type={message.type} />}
       
         
       {/* Register/Login Button */}
        <Button type="submit" 
        className="w-full bg-green-500 hover:bg-green-700 border border-green-900">
          
          {isRegister ? 'Register' : 'Login'}
        </Button>

      {/* Third-Party Authentication Panel with Phone Auth Integration */}
        <ThirdPartyAuthPanel 
         clearEmailAndPasswordErrors={clearAllErrors}
        handleThirdPartyAuth={handleThirdPartyRegister} 
        handlePhoneRegister={handlePhoneRegister} // Passing the phone auth handler

        /* Key Differences Summarized
Use isRegister={isRegister} When:

You have a form that toggles between registration and login modes.
The mode can change based on user interactions (e.g., clicking a "Switch to Login" button).
You want the child component to react to changes in the parent component's state.
Use isRegister={true} When:

The child component should always be in registration mode.
There's no need for the form to toggle between modes.
You want to enforce a specific behavior regardless of parent component's state.

  */
        isRegister={isRegister}
       // isRegister={true} 
       verificationSent={verificationSent} // Passing the verification state
        />
        {/* <div id="recaptcha-container"></div> */}

        {/* <PhoneAuth/> */}
        <p className="mt-4">Already have an account? <button onClick={() => navigate('/login')} className="text-blue-500">Login here</button></p>
          <div className="mt-4 flex justify-between">
            <Button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full bg-blue-500 hover:bg-blue-700 border border-blue-900 font-bold"
            >
              Login
            </Button> </div>
      </form>
    </div>
  );
};

export default RegistrationForm;  

// src/components/common/RegistrationForm.jsx
/* import React, { useState } from 'react';
import EmailField from '../common/EmailField';
import PasswordField from '../common/PasswordField';
import ConfirmPasswordField from '../common/ConfirmPasswordField';
import InputField from '../common/InputField';
import Button from '../common/Button';
import Alert from '../common/Alert';
import ThirdPartyAuthPanel from '../common/ThirdPartyAuthPanel';
import { registerWithEmailPassword, setupRecaptcha, signInWithPhone } from '../../firebase/auth';

const RegistrationForm = ({ onLoginClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [message, setMessage] = useState({ message: '', type: '' });
  const [verificationSent, setVerificationSent] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await registerWithEmailPassword(email, password);
      setMessage({ message: 'Registration successful!', type: 'success' });
    } catch (error) {
      setMessage({ message: `Registration failed: ${error.message}`, type: 'error' });
    }
  };

  const handlePhoneRegister = async () => {
    if (!verificationSent) {
      const recaptchaVerifier = setupRecaptcha('recaptcha-container');
      try {
        const confirmationResult = await signInWithPhone(phoneNumber, recaptchaVerifier);
        window.confirmationResult = confirmationResult;
        setVerificationSent(true);
      } catch (error) {
        setMessage({ message: `Error during phone verification: ${error.message}`, type: 'error' });
      }
    } else {
      try {
        const result = await window.confirmationResult.confirm(verificationCode);
        setMessage({ message: 'Phone number verified!', type: 'success' });
      } catch (error) {
        setMessage({ message: `Error confirming verification code: ${error.message}`, type: 'error' });
      }
    }
  };

  const handleThirdPartyRegister = async (providerFunction) => {
    try {
      const result = await providerFunction();
      setMessage({ message: 'Registration successful!', type: 'success' });
      // Handle additional user information or navigation if needed
    } catch (error) {
      setMessage({ message: `Error during third-party registration: ${error.message}`, type: 'error' });
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleRegister}>
      <EmailField email={email} setEmail={setEmail} />
      <PasswordField password={password} setPassword={setPassword} />
      <ConfirmPasswordField confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword} password={password} />
      <InputField
        label="Phone Number"
        type="text"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
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
      <Button type="button" className="w-full bg-yellow-500 hover:bg-yellow-700 border border-yellow-700 mt-2" onClick={handlePhoneRegister}>
        {verificationSent ? 'Verify Code' : 'Register with Phone'}
      </Button>  
      <ThirdPartyAuthPanel handleThirdPartyAuth={handleThirdPartyRegister} isRegister={true} />
      <div id="recaptcha-container"></div>
      <p className="mt-4">Already have an account? <button onClick={onLoginClick} className="text-blue-500">Login here</button></p>
      <Button
            type="button"
            onClick={() => setIsLogin(true)} // Toggle to show the login form
            className="w-full bg-green-500 hover:bg-green-700 border border-green-700 font-bold mt-4"
          >
            Login
          </Button>
    </form>
  );
};

export default RegistrationForm;

 */
// sr,KM/ /components/common/RegistrationForm.jsx  
 //to use with autho.jsx
/* import React, { useState } from 'react';
import EmailField from '../common/EmailField';
import PasswordField from '../common/PasswordField';
import ConfirmPasswordField from '../common/ConfirmPasswordField';
import InputField from '../common/InputField';
import Button from '../common/Button';
import Alert from '../common/Alert';
import ThirdPartyAuthPanel from '../common/ThirdPartyAuthPanel';
import { registerWithEmailPassword, setupRecaptcha, signInWithPhone } from '../../firebase/auth';
 
  

const RegistrationForm = ({ onLoginClick }) => {
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

  const handleRegister = async (e) => {
    e.preventDefault();
    if (emailErrors.length === 0 && passwordErrors.length === 0 && confirmPasswordErrors.length === 0 && phoneNumberErrors.length === 0) {
      try {
        const user = await registerWithEmailPassword(email, password);
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

  return (
    <form className="space-y-4" onSubmit={handleRegister}>
      <EmailField email={email} setEmail={setEmail} setEmailErrors={setEmailErrors} />
      <PasswordField password={password} setPassword={setPassword} setPasswordErrors={setPasswordErrors} />
      <ConfirmPasswordField confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword} password={password} setConfirmPasswordErrors={setConfirmPasswordErrors} />
      <InputField
        label="Phone Number"
        type="text"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
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
      <p className="mt-4">Already have an account? <button onClick={onLoginClick} className="text-blue-500">Login here</button></p>
    </form>
  );
};

export default RegistrationForm;
 */

 /* // src/components/forms/RegistrationForm.jsx
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

export default RegistrationForm; */


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


/* 
  import React, { useState } from 'react';
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
import { useNavigate } from 'react-router-dom';



const RegistrationForm = ({ onLoginClick }) => {
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
          <Button type="submit" className="w-full bg-green-500 hover:bg-green-700 border border-green-900">Register</Button>
          
          <ThirdPartyAuthPanel handleThirdPartyAuth={handleThirdPartyRegister} isRegister={true} />
          <div id="recaptcha-container"></div>
          <p className="mt-4">Already have an account? <button onClick={() => navigate('/login')} className="text-blue-500">Login here</button></p>
          <div className="mt-4 flex justify-between">
            <Button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full bg-blue-500 hover:bg-blue-700 border border-blue-900 font-bold"
            >
              Login
            </Button> </div>
        </form>
      )}
    </div>
  );
};

export default RegistrationForm */

;
 

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
