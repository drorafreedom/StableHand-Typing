
// src/firebase/firebase.ts

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithCredential,
  signOut,
  getRedirectResult,
  sendEmailVerification,
  signInAnonymously,
  GoogleAuthProvider,
  GithubAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  PhoneAuthProvider,
  RecaptchaVerifier,
  EmailAuthProvider, // Used for linking email/password authentication to another provider
  signInWithPhoneNumber,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';



const firebaseConfig = {
  apiKey: "AIzaSyAnrwZY_0SAM3mYI13X3RkNuIWkJw3TnSU",
  authDomain: "stablehand-typing.firebaseapp.com",
  databaseURL: "https://stablehand-typing-default-rtdb.firebaseio.com",
  projectId: "stablehand-typing",
  storageBucket: "stablehand-typing.firebasestorage.app",
  messagingSenderId: "139216749479",
  appId: "1:139216749479:web:bceb35407bcfc06296ac82",
  measurementId: "G-27D34Q1X51"
};
// Replace with your app's Firebase project configuration
/* const firebaseConfig = {
  apiKey: "AIzaSyC3gClNJ79vyni7GMr8erF4DZZ8E6iRJL4",
  authDomain: "stable-b543e.firebaseapp.com",
  projectId: "stable-b543e",
  storageBucket: "stable-b543e.appspot.com",
  messagingSenderId: "431840563462",
  appId: "1:431840563462:web:79e0223459910a5f640e87",
  measurementId: "G-4FZ1TS12TD",
}; */

// Initialize Firebase only once
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize Analytics if supported
let analytics: any = null;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

// Initialize Third-Party Auth Providers
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const yahooProvider = new OAuthProvider('yahoo.com');
const microsoftProvider = new OAuthProvider('microsoft.com');
const appleProvider = new OAuthProvider('apple.com');
const twitterProvider = new OAuthProvider('twitter.com');
const phoneProvider = new PhoneAuthProvider(auth);

// Export Firebase services and Providers
export {
  db,
  auth,
  signInWithCredential,
  signOut,
  getRedirectResult,
  sendEmailVerification,
  signInAnonymously,
  googleProvider,
  githubProvider,
  facebookProvider,
  yahooProvider,
  microsoftProvider,
  twitterProvider,
  appleProvider,
  PhoneAuthProvider, // Export the class, not an instance
  //phoneProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  EmailAuthProvider,
  app,
  storage,
  analytics,
};


//+++++++++++JS version+++++++++++++++++
  // src/firebase/firebase.js
  // JS version

// new file with all options some are disabled now  
/* 
import { initializeApp, getApps, getApp } from 'firebase/app';

import { 
    getAuth, 
    signInWithCredential, 
    signOut, 
    getRedirectResult, 
    sendEmailVerification, 
    signInAnonymously,
    GoogleAuthProvider, 
    GithubAuthProvider, 
    FacebookAuthProvider, 
    OAuthProvider, 
    PhoneAuthProvider,
    RecaptchaVerifier,
    EmailAuthProvider, // is essential to create an email/password credential object. It's used for linking the email/password authentication method to another provider, such as phone authentication.
    signInWithPhoneNumber 
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyC3gClNJ79vyni7GMr8erF4DZZ8E6iRJL4",
    authDomain: "stable-b543e.firebaseapp.com",
    projectId: "stable-b543e",
    storageBucket: "stable-b543e.appspot.com",
    messagingSenderId: "431840563462",
    appId: "1:431840563462:web:79e0223459910a5f640e87",
    measurementId: "G-4FZ1TS12TD"
};

// Initialize Firebase only once
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize Analytics if supported
let analytics = null;
isSupported().then((supported) => {
    if (supported) {
        analytics = getAnalytics(app);
    }
});

// Initialize Third-Party Auth Providers
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const yahooProvider = new OAuthProvider('yahoo.com');
const microsoftProvider = new OAuthProvider('microsoft.com');
const appleProvider = new OAuthProvider('apple.com');
const twitterProvider = new OAuthProvider('twitter.com');
const phoneProvider = new PhoneAuthProvider(auth);

// Export Firebase services and Providers
export {
    db, 
    auth, 
    signInWithCredential, 
    signOut, 
    getRedirectResult, 
    sendEmailVerification, 
    signInAnonymously,
    googleProvider,
    githubProvider, 
    facebookProvider, 
    yahooProvider, 
    microsoftProvider, 
    twitterProvider,
    appleProvider,
    PhoneAuthProvider, // Export the class, not an instance
    //phoneProvider,
    RecaptchaVerifier, 
    signInWithPhoneNumber,
    EmailAuthProvider,
    app, 
    storage, 
    analytics
};
 */