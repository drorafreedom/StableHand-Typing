// src/components/common/ThirdPartyButton.tsx
// TS version

import React from 'react';

// Define props interface
interface ThirdPartyButtonProps {
  onClick: () => void; // Callback function triggered on button click
  className?: string; // Additional class names for the button
  color: string; // Background color class for the button
  hoverColor: string; // Hover color class for the button
  textColor: string; // Text color class for the button
  text: string; // Button text
  logo?: string; // Optional logo image source
}

const ThirdPartyButton: React.FC<ThirdPartyButtonProps> = ({
  onClick,
  className = '',
  color,
  hoverColor,
  textColor,
  text,
  logo,
}) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center p-2 rounded ${color} ${hoverColor} ${textColor} ${className}`}
  >
    {/* Render the logo if provided */}
    {logo && <img src={logo} alt={`${text} logo`} className="w-6 h-6 mr-2" />}
    {text}
  </button>
);

export default ThirdPartyButton;


//+++++++++++++++JS version++++++++++++
/* // src/components/ThirdPartyUI.jsx
//JS version
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

export default ThirdPartyUI; */

