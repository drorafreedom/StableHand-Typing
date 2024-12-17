import React, { useState } from 'react';
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

export default CompleteRegistration;
