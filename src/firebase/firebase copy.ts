/* // src/firebase/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, 
  signInWithCredential, 
  signOut, 
  getRedirectResult, 
  GoogleAuthProvider, 
  GithubAuthProvider, 
  FacebookAuthProvider,
   OAuthProvider, 
   RecaptchaVerifier, 
   PhoneAuthProvider, 
   signInAnonymously } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';  

import { getAnalytics, isSupported } from "firebase/analytics";

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
// Initialize Firebase only if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const yahooProvider = new OAuthProvider('yahoo.com');
const microsoftProvider = new OAuthProvider('microsoft.com');
const appleProvider = new OAuthProvider('apple.com');
const phoneProvider = new PhoneAuthProvider(auth);
const twitterProvider = new OAuthProvider('twitter.com');

const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

// Sign in anonymously
signInAnonymously(auth).catch((error) => {
  console.error('Anonymous sign-in failed:', error);
});
  
// Initialize Analytics
// Check if analytics is supported and then initialize it
isSupported().then((supported) => {
  if (supported) {
    const analytics = getAnalytics(app);
    // Additional analytics setup if needed
  } else {
    console.log('Firebase Analytics not supported on this device/browser.');
  }
});

export { db, 
  auth, 
  signInWithCredential, 
  signOut, 
  getRedirectResult, 
  googleProvider, 
  githubProvider, 
  facebookProvider, 
  yahooProvider, 
  microsoftProvider, 
  twitterProvider,
  appleProvider, 
  RecaptchaVerifier, 
  phoneProvider, 
  app, 
  storage };
 */
// src/firebase/firebase.js
/* import { initializeApp, getApps, getApp } from 'firebase/app';
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
    RecaptchaVerifier, 
    PhoneAuthProvider
 
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

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
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = isSupported().then((supported) => supported ? getAnalytics(app) : null);

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const yahooProvider = new OAuthProvider('yahoo.com');
const microsoftProvider = new OAuthProvider('microsoft.com');
const appleProvider = new OAuthProvider('apple.com');
const phoneProvider = new PhoneAuthProvider(auth);
const twitterProvider = new OAuthProvider('twitter.com');

export {
    db, 
    auth, 
    signInWithCredential, 
    signOut, 
    getRedirectResult, 
    googleProvider,
    githubProvider, 
    facebookProvider, 
    yahooProvider, 
    microsoftProvider, 
    twitterProvider,
    appleProvider,
      sendEmailVerification, 
      RecaptchaVerifier, 
      phoneProvider, 
      app, 
      storage, 
      analytics
};
 */


// src/firebase/firebase.js
// new file 

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
