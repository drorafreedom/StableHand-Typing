// src/components/pages/ThankYouPage.jsx

import React from 'react';
import { useLocation } from 'react-router-dom';

const ThankYouPage = () => {
  const location = useLocation();
  const { type, score, percentageScore } = location.state || { type: 'default', score: null, percentageScore: null };

  const getMessage = () => {
    switch (type) {
      case 'logout':
        return (
          <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
            <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-md border border-gray-300">
              <h1 className="text-4xl font-bold mb-4">Thank You for Visiting</h1>
              <p className="text-lg mb-6">We hope you have enjoyed your session. See you soon!</p>
              <Link to="/login" className="text-blue-500 hover:text-blue-700">Go to Login</Link>
            </div>
          </div>
        );
      case 'registration':
        return 'Thank you for registering! Please check your email for verification.';
      case 'demographics':
        return 'Thank you for submitting your demographics information.';
      case 'parkinsons':
        return (
          <>
            <p className="text-lg mb-6">Thank you for completing the Parkinson's survey.</p>
            <p className="text-lg mb-6">Your score is {score} ({percentageScore}).</p>

          </>
        );
      default:
        return 'Thank you for your submission!';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-md border border-gray-300">
        <h2 className="text-2xl font-bold mb-4">Thank You!</h2>
        {getMessage()}
      </div>
    </div>
  );
};

export default ThankYouPage;

