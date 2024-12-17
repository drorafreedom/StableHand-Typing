// /src/components/organisms/EmailLinkSignIn.jsx

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
