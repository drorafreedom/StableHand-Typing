// src/components/pages/AuthPage.jsx
import React, { useState } from 'react';
import LoginForm from '../osrganisms/LoginForm';
import RegistrationForm from '../organisms/RegistrationForm';

const AuthPage = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      {isLoginMode ? (
        <>
          <LoginForm onRegisterClick={toggleMode} />
        </>
      ) : (
        <>
          <RegistrationForm onLoginClick={toggleMode} />
        </>
      )}
    </div>
  );
};

export default AuthPage;
