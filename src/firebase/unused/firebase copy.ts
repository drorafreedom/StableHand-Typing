// src/firebase/firebase.ts
// Clean Firebase v10+ setup with optional emulator guard.
// Works for SMS reCAPTCHA in prod (no test flags), and supports multiple projects via Vite env vars.

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
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
  EmailAuthProvider,               // Used for linking email/password auth
  signInWithPhoneNumber,

     connectAuthEmulator,            // ✅ added for dev/emulator
  browserLocalPersistence,
  setPersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
 
import { getDatabase } from 'firebase/database'; // ✅ RTDB

// Optional analytics; safe-checked for browser support
import { getAnalytics, isSupported as analyticsSupported, type Analytics } from 'firebase/analytics';


// 🔐 Your Firebase project config (left exactly as you had it)
const firebaseConfig = {
  apiKey: "AIzaSyAnrwZY_0SAM3mYI13X3RkNuIWkJw3TnSU",
  authDomain: "stablehand-typing.firebaseapp.com",
  databaseURL: "https://stablehand-typing-default-rtdb.firebaseio.com",
  projectId: "stablehand-typing",
  storageBucket: "stablehand-typing.firebasestorage.app",
  messagingSenderId: "139216749479",
  appId: "1:139216749479:web:bceb35407bcfc06296ac82",
  measurementId: "G-27D34Q1X51",
};

// Initialize Firebase only once
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Persist sessions locally (tabs/windows)
//void setPersistence(auth, browserLocalPersistence);



// ---- Emulator guard (DEV ONLY). Never enable in production. ----
// To use the emulator, set VITE_USE_AUTH_EMULATOR=1 and (optionally) VITE_AUTH_EMULATOR_URL
if (import.meta.env.VITE_USE_AUTH_EMULATOR === '1') {
  const url = import.meta.env.VITE_AUTH_EMULATOR_URL || 'http://127.0.0.1:9099';
  connectAuthEmulator(auth, url);

  // IMPORTANT: Only when using the emulator. Do NOT set this in production.
  // Some builds expose `auth.settings`; guard it before touching.
  // @ts-expect-error - settings isn’t typed publicly; safe to check.
  if (auth.settings) {
    // @ts-expect-error
    auth.settings.appVerificationDisabledForTesting = true;
    
  }
}

/* // Analytics (kept as your original pattern)
let analytics: any = null;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});
 */
// ---- Analytics (optional and safe) ----
let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  analyticsSupported()
    .then((ok) => {
      if (ok) analytics = getAnalytics(app);
    })
    .catch(() => {});
}

// Core services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const rtdb = getDatabase(app); // ✅ actual Realtime Database instance



// Third-Party Auth Providers (kept as-is)
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const yahooProvider = new OAuthProvider('yahoo.com');
const microsoftProvider = new OAuthProvider('microsoft.com');
const appleProvider = new OAuthProvider('apple.com');
const twitterProvider = new OAuthProvider('twitter.com');
const phoneProvider = new PhoneAuthProvider(auth); // keep instance if you use it

// ✅ SAFE dev/test block
// - Always ensure `auth.settings` exists so reads elsewhere won't crash.
// - Only set `appVerificationDisabledForTesting` in non-production.
// - Optional: use emulator when VITE_USE_AUTH_EMULATOR=1
const anyAuth = auth as any;
anyAuth.settings = anyAuth.settings || {};

if (import.meta.env.MODE !== 'production') {
  if (import.meta.env.VITE_USE_AUTH_EMULATOR === '1') {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  }
  anyAuth.settings.appVerificationDisabledForTesting = true;
}
// Optional language for email/SMS templates
auth.languageCode = 'en';
// Export Firebase services and Providers (kept and expanded with rtdb)
export {
  db,
  rtdb,                        // ✅ added RTDB export
  auth,
  signInWithCredential,
  signOut,
  getRedirectResult,
  sendEmailVerification,
  signInAnonymously,

  // Providers
  googleProvider,
  githubProvider,
  facebookProvider,
  yahooProvider,
  microsoftProvider,
  twitterProvider,
  appleProvider,

  // Classes/functions you re-exported before
  PhoneAuthProvider,           // class
  RecaptchaVerifier,
  signInWithPhoneNumber,
  EmailAuthProvider,

  app,
  storage,
  analytics,
  anyAuth,
  // phoneProvider,            // uncomment if you want to export the instance too
};



//####################################################
// src/firebase/firebase.ts
// works beside the settingTesting underdefined  error 

// import { initializeApp, getApps, getApp } from 'firebase/app';
// import {
//   getAuth,
//   signInWithCredential,
//   signOut,
//   getRedirectResult,
//   sendEmailVerification,
//   signInAnonymously,
//   GoogleAuthProvider,
//   GithubAuthProvider,
//   FacebookAuthProvider,
//   OAuthProvider,
//   PhoneAuthProvider,
//   RecaptchaVerifier,
//   EmailAuthProvider, // Used for linking email/password authentication to another provider
//   signInWithPhoneNumber,
// } from 'firebase/auth';
// import { getFirestore } from 'firebase/firestore';
// import { getStorage } from 'firebase/storage';
// import { getAnalytics, isSupported } from 'firebase/analytics';



//  const firebaseConfig = {
//   apiKey: "AIzaSyAnrwZY_0SAM3mYI13X3RkNuIWkJw3TnSU",
//   authDomain: "stablehand-typing.firebaseapp.com",
//   databaseURL: "https://stablehand-typing-default-rtdb.firebaseio.com",
//   projectId: "stablehand-typing",
//   storageBucket: "stablehand-typing.firebasestorage.app",
//   messagingSenderId: "139216749479",
//   appId: "1:139216749479:web:bceb35407bcfc06296ac82",
//   measurementId: "G-27D34Q1X51"
// }; 


// // Replace with your app's Firebase project configuration
// /* const firebaseConfig = {
//   apiKey: "AIzaSyC3gClNJ79vyni7GMr8erF4DZZ8E6iRJL4",
//   authDomain: "stable-b543e.firebaseapp.com",
//   projectId: "stable-b543e",
//   storageBucket: "stable-b543e.appspot.com",
//   messagingSenderId: "431840563462",
//   appId: "1:431840563462:web:79e0223459910a5f640e87",
//   measurementId: "G-4FZ1TS12TD",
// };
//  */
// // Initialize Firebase only once
// const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// // Initialize Firebase services
// const auth = getAuth(app);
// const db = getFirestore(app);
// const storage = getStorage(app);

// // Initialize Analytics if supported
// let analytics: any = null;
// isSupported().then((supported) => {
//   if (supported) {
//     analytics = getAnalytics(app);
//   }
// });

// // Initialize Third-Party Auth Providers
// const googleProvider = new GoogleAuthProvider();
// const githubProvider = new GithubAuthProvider();
// const facebookProvider = new FacebookAuthProvider();
// const yahooProvider = new OAuthProvider('yahoo.com');
// const microsoftProvider = new OAuthProvider('microsoft.com');
// const appleProvider = new OAuthProvider('apple.com');
// const twitterProvider = new OAuthProvider('twitter.com');
// const phoneProvider = new PhoneAuthProvider(auth);

// // Export Firebase services and Providers
// export {
//   db,
//   auth,
//   signInWithCredential,
//   signOut,
//   getRedirectResult,
//   sendEmailVerification,
//   signInAnonymously,
//   googleProvider,
//   githubProvider,
//   facebookProvider,
//   yahooProvider,
//   microsoftProvider,
//   twitterProvider,
//   appleProvider,
//   PhoneAuthProvider, // Export the class, not an instance
//   //phoneProvider,
//   RecaptchaVerifier,
//   signInWithPhoneNumber,
//   EmailAuthProvider,
//   app,
//   storage,
//   analytics,
// };


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