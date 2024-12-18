// src/components/ThirdPartyUI.jsx
import React, { useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import firebaseui from 'firebaseui';

// Assuming firebase.js exports configured firebase
import { auth } from '../../firebase/firebase';

const ThirdPartyUI = () => {
  useEffect(() => {
    try {
      console.log("Initializing FirebaseUI...");

      // FirebaseUI configuration
      const uiConfig = {
        signInOptions: [
          firebase.auth.GoogleAuthProvider.PROVIDER_ID,
          firebase.auth.FacebookAuthProvider.PROVIDER_ID,
          firebase.auth.TwitterAuthProvider.PROVIDER_ID,
          firebase.auth.GithubAuthProvider.PROVIDER_ID,
          firebase.auth.EmailAuthProvider.PROVIDER_ID,
          firebase.auth.PhoneAuthProvider.PROVIDER_ID,
        ],
   // signInSuccessUrl: '/stablehand-welcome'
        callbacks: {
          signInSuccessWithAuthResult: (authResult) => {
            console.log("Sign-in successful:", authResult);
            if (authResult.user && !authResult.user.emailVerified) {
              authResult.user.sendEmailVerification();
              console.log("Verification email sent.");
            }
            return true;
          },
          signInFailure: (error) => {
            console.error("Sign-in failed:", error);
          },
        },
      };

      const ui = new firebaseui.auth.AuthUI(auth);
      ui.start('#firebaseui-auth-container', uiConfig);

    } catch (error) {
      console.error("Error initializing FirebaseUI:", error);
    }
  }, []);

  return (
    <div>
      <h2>Sign In</h2>
      <div id="firebaseui-auth-container"></div>
    </div>
  );
};

export default ThirdPartyUI;

