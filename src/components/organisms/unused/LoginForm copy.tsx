//+++++++++++JS VERSIOn++++++++++++++++++
// src/components/organisms/LoginForm.jsx
import React, { useState } from 'react';
import EmailField from '../common/EmailField';
import PasswordField from '../common/PasswordField';
import Button from '../common/Button';
import Alert from '../common/Alert';
import ThirdPartyAuthPanel from '../common/ThirdPartyAuthPanel';
import RegistrationForm from './RegistrationForm';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider, facebookProvider, yahooProvider, microsoftProvider, appleProvider } from '../../firebase/firebase';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailErrors, setEmailErrors] = useState([]);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [capsLockWarning, setCapsLockWarning] = useState(false);
  const [loginMessage, setLoginMessage] = useState({ message: '', type: '' });
  const [isRegister, setIsRegister] = useState(false); // New state to toggle between login and registration forms
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
    <div>
      {!isRegister ? (
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
              onClick={() => setIsRegister(true)} // Toggle to show the registration form
              className="w-full bg-green-500 hover:bg-green-700 border border-green-700 font-bold ml-4"
            >
              Register
            </Button>
          </div>
          <ThirdPartyAuthPanel handleThirdPartyAuth={handleThirdPartyLogin} isRegister={false} />
        </form>
      ) : (
        <div>
          <RegistrationForm />
          <Button
            type="button"
            onClick={() => setIsRegister(false)} // Toggle to show the login form
            className="w-full bg-gray-500 hover:bg-gray-700 border border-gray-700 font-bold mt-4"
          >
            Back to Login
          </Button>
        </div>
      )}
    </div>
  );
};

export default LoginForm;


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
