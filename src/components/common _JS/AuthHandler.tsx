//src\components\common\AuthHandler.jsx
import React, { useEffect } from 'react';
import { getRedirectResult } from 'firebase/auth';
import { auth, handleEmailVerification } from '../../firebase/auth'; // Adjust the path as necessary
import { useNavigate } from 'react-router-dom'; // Assuming you're using react-router

const AuthHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const processAuth = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // Optionally handle email verification
          await handleEmailVerification(result.user);
          // Redirect to the desired page after successful authentication
          navigate('/dashboard'); // Change '/dashboard' to your desired route
        }
      } catch (error) {
        console.error("Error processing authentication:", error);
        // Optionally, redirect to an error page or display an error message
        navigate('/login'); // Change '/login' as needed
      }
    };

    processAuth();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Processing authentication...</p>
    </div>
  );
};

export default AuthHandler;
