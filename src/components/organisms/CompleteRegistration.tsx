// src/components/organisms/CompleteRegistration.tsx
// TS version

import React, { useState } from 'react';
import {
  getAuth,
  createUserWithEmailAndPassword,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from 'firebase/auth';

const CompleteRegistration: React.FC = () => {
  const [password, setPassword] = useState<string>(''); // State for the password input
  const [success, setSuccess] = useState<string>(''); // State for success messages
  const [error, setError] = useState<string>(''); // State for error messages

  const handleCompleteRegistration = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent form submission
    const auth = getAuth();
    const email = window.localStorage.getItem('emailForRegistration'); // Retrieve saved email

    // Validation: Check if the email or link is valid
    if (!email || !isSignInWithEmailLink(auth, window.location.href)) {
      setError('Invalid or expired verification link. Please start the registration again.');
      return;
    }

    try {
      // Link the email to the session
      await signInWithEmailLink(auth, email, window.location.href);

      // Create the account now that the email is verified
      await createUserWithEmailAndPassword(auth, email, password);
      setSuccess('Registration complete! You can now log in.');
      window.localStorage.removeItem('emailForRegistration'); // Cleanup after success
      setError(''); // Clear any previous error messages
    } catch (err: any) {
      setError(err.message); // Display the error message
      console.error('Error completing registration:', err);
    }
  };

  return (
    <form onSubmit={handleCompleteRegistration} className="max-w-md mx-auto p-4 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Complete Registration</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {success && <p className="text-green-500 mb-2">{success}</p>}
      <div className="mb-4">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Set Your Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="Set your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Complete Registration
      </button>
    </form>
  );
};

export default CompleteRegistration;

//+++++++++++JS VERSIOn++++++++++++++++++
//src\components\organisms\CompleteRegistration.jsx

//JS version
/* import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";

const CompleteRegistration = () => {
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    const email = window.localStorage.getItem('emailForRegistration'); // Retrieve saved email

    if (!email || !isSignInWithEmailLink(auth, window.location.href)) {
      setError("Invalid or expired verification link. Please start the registration again.");
      return;
    }

    try {
      // Link the email to the session
      await signInWithEmailLink(auth, email, window.location.href);

      // Create the account now that the email is verified
      await createUserWithEmailAndPassword(auth, email, password);
      setSuccess("Registration complete! You can now log in.");
      window.localStorage.removeItem('emailForRegistration'); // Cleanup
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleCompleteRegistration}>
      <h2>Complete Registration</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
      <input
        type="password"
        placeholder="Set your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Complete Registration</button>
    </form>
  );
};

export default CompleteRegistration; */
