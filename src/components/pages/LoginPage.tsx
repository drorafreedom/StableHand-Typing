 // src/components/pages/LoginPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../organisms/LoginForm';
import { loginWithEmail } from '../../firebase/auth';
import { Frame3 } from '../common/Frame';

const LoginPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null); // State for error messages
  const navigate = useNavigate();

  // Handle login with email and password
  const handleLogin = async (
    email: string,
    password: string,
    callback: (success: boolean) => void
  ): Promise<void> => {
    try {
      const user = await loginWithEmail(email, password); // Login logic
      console.log("Logging in with:", email, password);
      callback(true);
      navigate('/'); // Redirect to home page
    } catch (error: any) {
      setError(error.message);
      callback(false);
      console.error("Login failed:", error);
    }
  };

  // Handle max login attempts reached
  const handleMaxLoginAttemptsReached = (): void => {
    console.log("Redirecting to password reset page...");
    navigate('/reset-password'); // Redirect to password reset
  };

  // Handle register click
  const handleRegisterClick = (): void => {
    console.log("Redirecting to registration page...");
    navigate('/register'); // Redirect to registration
  };

  return (
    <Frame3>
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold mb-4 text-center">Login</h1>
        {error && <p className="error">{error}</p>}

        <LoginForm
          onLogin={handleLogin}
          onMaxLoginAttemptsReached={handleMaxLoginAttemptsReached}
          onRegisterClick={handleRegisterClick}
        />
      </div>
    </Frame3>
  );
};

export default LoginPage;
 
  
  //+++++++++++JS version+++++++++++++++++
  // /src/components/pages/LoginPage.jsx
 // JS version
/* import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../organisms/LoginForm';
//import { loginWithEmailPassword } from '../../firebase/auth';
import { loginWithEmail } from '../../firebase/auth';
import { Frame3 } from '../common/Frame';

function LoginPage() {
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Handle login with email and password
    const handleLogin = async (email, password, callback) => {
        try {
            //const user = await loginWithEmailPassword(email, password);
            const user = await loginWithEmail(email, password);// for security reason not to expose all informtion
            console.log("Logging in with:", email, password);
            callback(true);
            navigate('/'); // Redirect to the home page after successful login
        } catch (error) {
            setError(error.message);
            callback(false);
            console.error("Login failed:", error);
        }
    };

    // Handle max login attempts reached
    const handleMaxLoginAttemptsReached = () => {
        console.log("Redirecting to password reset page...");
        navigate('/reset-password'); // Redirect to the password reset page
    };

    // Handle register click
    const handleRegisterClick = () => {
        console.log("Redirecting to registration page...");
        navigate('/register'); // Redirect to the registration page
    };

    return (
      < Frame3> 
         <div className="w-full max-w-md">
        
      
        <h1 className="text-4xl font-bold mb-4 text-center  ">Login</h1>
            {error && <p className="error">{error}</p>}

            <LoginForm
                onLogin={handleLogin}
                onMaxLoginAttemptsReached={handleMaxLoginAttemptsReached}
                onRegisterClick={handleRegisterClick}
            />
        </div>
      
        
         </Frame3>
    );
}

export default LoginPage;  
 */

//.---------------------------------------
// src/components/pages/LoginPage.jsx
/* import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../organisms/LoginForm';
import { Frame3 } from '../common/Frame';

function LoginPage() {
    const navigate = useNavigate();

    // Handle register click
    const handleRegisterClick = () => {
        navigate('/register');
    };

    // Handle reset password click
    const handleResetPasswordClick = () => {
        navigate('/reset-password');
    };

    return (
        <Frame3>
            <div className="w-full max-w-md">
                <h1 className="text-4xl font-bold mb-4 text-center">Login</h1>
                <LoginForm onRegisterClick={handleRegisterClick} onResetPasswordClick={handleResetPasswordClick} />
            </div>
        </Frame3>
    );
}

export default LoginPage;

 */