// src/components/organisms/EmailLinkSignIn.tsx
// TS version

import React, { useState } from 'react';
import { getAuth, sendSignInLinkToEmail, signInWithEmailLink } from 'firebase/auth';

const EmailLinkSignIn: React.FC = () => {
  const [email, setEmail] = useState<string>(''); // State for the email input
  const [message, setMessage] = useState<string>(''); // State for feedback messages

  const auth = getAuth();
  const actionCodeSettings = {
    url: 'https://www.example.com/finishSignUp', // Replace with your actual app's URL
    handleCodeInApp: true,
  };

  // Send the sign-in link to the user's email
  const handleSendLink = async () => {
    try {
      if (!email.trim()) {
        setMessage('Please provide a valid email address.');
        return;
      }

      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      setMessage('Email sent. Please check your inbox.');
    } catch (error: any) {
      setMessage(`Error sending email: ${error.message}`);
    }
  };

  // Complete the sign-in process with the email link
  const handleCompleteSignIn = async () => {
    const storedEmail = window.localStorage.getItem('emailForSignIn');
    if (!storedEmail) {
      setMessage('No email found in local storage. Please try signing in again.');
      return;
    }

    try {
      if (await signInWithEmailLink(auth, storedEmail, window.location.href)) {
        window.localStorage.removeItem('emailForSignIn');
        setMessage('Successfully signed in with email link.');
      } else {
        setMessage('Failed to complete sign-in with email link.');
      }
    } catch (error: any) {
      setMessage(`Error signing in with email link: ${error.message}`);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded shadow-md">
      <h1 className="text-xl font-bold mb-4">Email Link Sign-In</h1>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        className="block w-full px-3 py-2 mb-4 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
      />
      <div className="flex justify-between">
        <button
          onClick={handleSendLink}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          Send Sign-In Link
        </button>
        <button
          onClick={handleCompleteSignIn}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
        >
          Complete Sign-In
        </button>
      </div>
      {message && <p className="mt-4 text-center text-gray-700">{message}</p>}
    </div>
  );
};

export default EmailLinkSignIn;


//+++++++++++JS VERSIOn++++++++++++++++++
// /src/components/organisms/EmailLinkSignIn.jsx
//JS versioin
import React, { useState } from 'react';
import { getAuth, sendSignInLinkToEmail, signInWithEmailLink } from 'firebase/auth';

function EmailLinkSignIn() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const auth = getAuth();
  const actionCodeSettings = {
    url: 'https://www.example.com/finishSignUp',
    handleCodeInApp: true,
  };

  const handleSendLink = async () => {
    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      setMessage('Email sent. Please check your inbox.');
    } catch (error) {
      setMessage(`Error sending email: ${error.message}`);
    }
  };

  const handleCompleteSignIn = async () => {
    const storedEmail = window.localStorage.getItem('emailForSignIn');
    try {
      if (await signInWithEmailLink(auth, storedEmail, window.location.href)) {
        window.localStorage.removeItem('emailForSignIn');
        setMessage('Successfully signed in with email link.');
      }
    } catch (error) {
      setMessage('Error signing in with email link.');
    }
  };

  return (
    <div>
      <h1>Email Link Sign-In</h1>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
      />
      <button onClick={handleSendLink}>Send Sign-In Link</button>
      <button onClick={handleCompleteSignIn}>Complete Sign-In</button>
      <p>{message}</p>
    </div>
  );
}

export default EmailLinkSignIn;
