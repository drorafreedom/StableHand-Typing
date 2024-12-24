import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import * as firebaseui from 'firebaseui';
import { auth } from './firebase'; // Importing from your existing firebase.js

// Define the type for FirebaseUI configuration
const firebaseUIConfig: firebaseui.auth.Config = {
  signInFlow: 'popup', // Sign-in flow: 'popup' or 'redirect'
  signInSuccessUrl: '/home', // Redirect URL on successful sign-in
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    firebase.auth.TwitterAuthProvider.PROVIDER_ID,
    firebase.auth.GithubAuthProvider.PROVIDER_ID,
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
    firebase.auth.PhoneAuthProvider.PROVIDER_ID,
    'apple.com',
    'microsoft.com',
    'yahoo.com',
  ],
  tosUrl: () => window.location.assign('/terms-of-service'), // URL for Terms of Service
  privacyPolicyUrl: () => window.location.assign('/privacy-policy'), // URL for Privacy Policy
};

export { firebaseUIConfig, auth };


//+++++++++++JS version+++++++++++++++++
  // src/firebase/firebaseUIConfig.js
  // JS version


import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import * as firebaseui from 'firebaseui';
import { auth } from './firebase'; // Importing from your existing firebase.js

// Firebase UI Configuration
const firebaseUIConfig = {
  signInFlow: 'popup',
  signInSuccessUrl: '/home',  // Redirect URL on successful sign-in
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    firebase.auth.TwitterAuthProvider.PROVIDER_ID,
    firebase.auth.GithubAuthProvider.PROVIDER_ID,
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
    firebase.auth.PhoneAuthProvider.PROVIDER_ID,
    'apple.com',
    'microsoft.com',
    'yahoo.com',
  ],
  tosUrl: () => window.location.assign('/terms-of-service'),
  privacyPolicyUrl: () => window.location.assign('/privacy-policy'),
};

export { firebaseUIConfig, auth };


//--------------------------------
/* import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import * as firebaseui from 'firebaseui';

// Your Firebase configuration
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
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// FirebaseUI configuration
const firebaseUIConfig = {
  signInSuccessUrl: '/home',  // Adjust your redirect URL here
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    firebase.auth.TwitterAuthProvider.PROVIDER_ID,
    firebase.auth.GithubAuthProvider.PROVIDER_ID,
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
    firebase.auth.PhoneAuthProvider.PROVIDER_ID,
    'apple.com',  // Apple provider as a custom OAuth provider
    'microsoft.com'  // Microsoft provider as a custom OAuth provider
  ],
  tosUrl: '/terms',
  privacyPolicyUrl: '/privacy'
};

// Initialize FirebaseUI instance
const ui = new firebaseui.auth.AuthUI(auth);

export { ui, firebaseUIConfig }; */



