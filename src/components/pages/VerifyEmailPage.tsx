// src/components/pages/VerifyEmailPage.jsx

import React, { useState } from 'react';
import { useAuth } from '../../firebase/AuthContext';
import Alert from '../common/Alert';

const VerifyEmailPage = () => {
  const { currentUser } = useAuth();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const resendVerificationEmail = async () => {
    setError('');
    setMessage('');
    try {
      await currentUser.sendEmailVerification();
      setMessage('Verification email sent! Please check your inbox.');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">Verify Your Email</h2>
        {error && <Alert message={error} type="error" />}
        {message && <Alert message={message} type="success" />}
        <p className="mb-4 text-center">
          A verification email has been sent to <strong>{currentUser.email}</strong>. Please verify your email to continue.
        </p>
        <button
          onClick={resendVerificationEmail}
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 w-full"
        >
          Resend Verification Email
        </button>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
