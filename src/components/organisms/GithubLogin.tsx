//src\components\organisms\GithubLogin.js
import React from 'react';
import { getAuth, signInWithPopup, GithubAuthProvider } from "firebase/auth";
import { auth, GithubAuthProvider } from '../../firebase/firebase';

const Login = () => {
  const handleGitHubLogin = () => {
    const provider = new GithubAuthProvider();
    provider.addScope('repo');
    provider.setCustomParameters({ 'allow_signup': 'false' });

    signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a GitHub Access Token.
        const credential = GithubAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;
        console.log('User info:', user);
        console.log('GitHub Access Token:', token);
      }).catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.customData.email;
        const credential = GithubAuthProvider.credentialFromError(error);
        console.error('Error during sign in:', errorCode, errorMessage, email, credential);
      });
  };

  return (
    <button onClick={handleGitHubLogin}>Sign in with GitHub</button>
  );
};

export default Login;
