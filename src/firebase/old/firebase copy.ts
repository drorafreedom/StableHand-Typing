 
// /src/firebase/firebase.js
// src/firebase/firebase.js

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCredential, signOut, getRedirectResult, GoogleAuthProvider, GithubAuthProvider, FacebookAuthProvider, OAuthProvider, RecaptchaVerifier, PhoneAuthProvider, signInAnonymously } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';  
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Firebase configuration
 

const firebaseConfig = {
  apiKey: "AIzaSyC3gClNJ79vyni7GMr8erF4DZZ8E6iRJL4",
  authDomain: "stable-b543e.firebaseapp.com",
  databaseURL: "https://stable-b543e-default-rtdb.firebaseio.com",
  projectId: "stable-b543e",
  storageBucket: "stable-b543e.appspot.com",
  messagingSenderId: "431840563462",
  appId: "1:431840563462:web:79e0223459910a5f640e87",
  measurementId: "G-4FZ1TS12TD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const yahooProvider = new OAuthProvider('yahoo.com');
const microsoftProvider = new OAuthProvider('microsoft.com');
const appleProvider = new OAuthProvider('apple.com');
const phoneProvider = new PhoneAuthProvider(auth);
const db = getFirestore(app);
const storage = getStorage(app); // Initialize storage
const analytics = getAnalytics(app);
// const credential = GithubAuthProvider.credential(token);

// Sign in anonymously
signInAnonymously(auth).catch((error) => {
  console.error('Anonymous sign-in failed:', error);
});
// [ auth_github_signin_redirect_result_modular]
/* getRedirectResult(auth)
  .then((result) => {
    const credential = GithubAuthProvider.credentialFromResult(result);
    if (credential) {
      // This gives you a GitHub Access Token. You can use it to access the GitHub API.
      const token = credential.accessToken;
      // ...
    }

    // The signed-in user info.
    const user = result.user;
    // IdP data available using getAdditionalUserInfo(result)
    // ...
  }).catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // The email of the user's account used.
    const email = error.customData.email;
    // The AuthCredential type that was used.
    const credential = GithubAuthProvider.credentialFromError(error);
    // ...
  });
// [END auth_github_signin_redirect_result_modular]



// -----------------Sign in with the credential from the user.
 
signInWithCredential(auth, credential)
  .then((result) => {
    // Signed in 
    // ...
  })
  .catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // The email of the user's account used.
    const email = error.customData.email;
    // ...
  });

// -----------------Sign in with the credential from the user.
signOut(auth).then(() => {
  // Sign-out successful.
}).catch((error) => {
  // An error happened.
}); */
export { db, auth, signInWithCredential, signOut,getRedirectResult, googleProvider, GithubAuthProvider, facebookProvider, yahooProvider, microsoftProvider, appleProvider, RecaptchaVerifier, phoneProvider, app, storage }; // Export storage


 
 
