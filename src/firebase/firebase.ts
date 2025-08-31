
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
import { getDatabase } from 'firebase/database'; // RTDB
//import { getAnalytics, isSupported as analyticsSupported } from 'firebase/analytics';
// import { getAnalytics, isSupported } from 'firebase/analytics';


/* //import configuration from .env so we need to change only one time there.
const firebaseConfig = {
  apiKey:        import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:     import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  appId:         import.meta.env.VITE_FIREBASE_APP_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  databaseURL:   import.meta.env.VITE_FIREBASE_DATABASE_URL,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}; */


  //  keep it inline, or swap to Vite env vars later.    ✅ Correct bucket ID (not firebasestorage.app)
const firebaseConfig = {
  apiKey: 'AIzaSyAnrwZY_0SAM3mYI13X3RkNuIWkJw3TnSU',
  authDomain: 'stablehand-typing.firebaseapp.com',
  projectId: 'stablehand-typing',
  // ✅ Correct bucket ID (not firebasestorage.app)
  // storageBucket: 'stablehand-typing.appspot.com',
  storageBucket: "stablehand-typing.firebasestorage.app",
  appId: '1:139216749479:web:bf441369ac65d6a096ac82',
  messagingSenderId: '139216749479',
  // RTDB (keep if you use Realtime Database)
  databaseURL: 'https://stablehand-typing-default-rtdb.firebaseio.com',
  // Analytics (optional)
  measurementId: 'G-5C5KTHHF5C',
};
 


/*  const firebaseConfig = {
  apiKey: "AIzaSyAnrwZY_0SAM3mYI13X3RkNuIWkJw3TnSU",
  authDomain: "stablehand-typing.firebaseapp.com",
  databaseURL: "https://stablehand-typing-default-rtdb.firebaseio.com",
  projectId: "stablehand-typing",
  storageBucket: "stablehand-typing.firebasestorage.app",
  messagingSenderId: "139216749479",
  appId: "1:139216749479:web:bceb35407bcfc06296ac82",
  measurementId: "G-27D34Q1X51"
};  */


// Replace with "stable-b543e Firebase project configuration
/* const firebaseConfig = {
  apiKey: "AIzaSyC3gClNJ79vyni7GMr8erF4DZZ8E6iRJL4",
  authDomain: "stable-b543e.firebaseapp.com",
  projectId: "stable-b543e",
  storageBucket: "stable-b543e.appspot.com",
  messagingSenderId: "431840563462",
  appId: "1:431840563462:web:79e0223459910a5f640e87",
  measurementId: "G-4FZ1TS12TD",
};
 */
// Initialize Firebase only once
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
// const rtdb = getDatabase(app);
// If you prefer to be explicit (multiple instances):
const rtdb = getDatabase(app, firebaseConfig.databaseURL);

/* // Initialize Analytics if supported
let analytics: any = null;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
}); */

/* // Analytics (optional): only start in the browser when supported.
export let analytics: import('firebase/analytics').Analytics | null = null;
if (typeof window !== 'undefined') {
  // Avoid errors during SSR/build or unsupported environments
  analyticsSupported().then((ok) => {
    if (ok && firebaseConfig.measurementId) {
      analytics = getAnalytics(app);
    }
  });
}
 */

// --- Analytics: enable only in production, and only in the browser ---
import { getAnalytics, isSupported as analyticsSupported } from 'firebase/analytics';

const isBrowser = typeof window !== 'undefined';
// Works for both Vite (import.meta.env.MODE) and CRA (process.env.NODE_ENV)
const isProd =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.MODE === 'production') ||
  (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production');

export let analytics: import('firebase/analytics').Analytics | null = null;

if (isBrowser && isProd && firebaseConfig.measurementId) {
  analyticsSupported().then((ok) => {
    if (ok) analytics = getAnalytics(app);
  });
}

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
   db,
  storage,
  rtdb,
  // analytics, // has its own rule
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