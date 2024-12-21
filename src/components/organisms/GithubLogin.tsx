// src/components/organisms/GithubLogin.tsx
// TS version

import React from 'react';
import { getAuth, signInWithPopup, GithubAuthProvider, AuthError, UserCredential } from 'firebase/auth';
import { auth } from '../../firebase/firebase';

const GithubLogin: React.FC = () => {
  const handleGitHubLogin = async () => {
    const provider = new GithubAuthProvider();
    provider.addScope('repo'); // Add GitHub scope
    provider.setCustomParameters({ allow_signup: 'false' }); // Disable GitHub signup during login

    try {
      const result: UserCredential = await signInWithPopup(auth, provider);

      // Access GitHub credentials
      const credential = GithubAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;

      // Signed-in user information
      const user = result.user;
      console.log('User info:', user);
      console.log('GitHub Access Token:', token);
    } catch (error: any) {
      // Handle errors
      const authError = error as AuthError;
      const errorCode = authError.code;
      const errorMessage = authError.message;
      const email = authError.customData?.email;
      const credential = GithubAuthProvider.credentialFromError(authError);

      console.error('Error during sign-in:', errorCode, errorMessage, email, credential);
    }
  };

  return (
    <button
      onClick={handleGitHubLogin}
      className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
    >
      Sign in with GitHub
    </button>
  );
};

export default GithubLogin;



//+++++++++++JS VERSIOn++++++++++++++++++

//src\components\organisms\GithubLogin.js
//JS version
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
