// src/firebase/firebaseCompat.ts
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

// —– your Firebase Web config —–
// (get these values from your Firebase console)
const firebaseConfig = {
  apiKey: "AIzaSyC3gClNJ79vyni7GMr8erF4DZZ8E6iRJL4",
  authDomain: "stable-b543e.firebaseapp.com",
  projectId: "stable-b543e",
  storageBucket: "stable-b543e.appspot.com",
  messagingSenderId: "431840563462",
  appId: "1:431840563462:web:79e0223459910a5f640e87",
  measurementId: "G-4FZ1TS12TD",
};

// only initialize the default app once
const app = !firebase.apps.length
  ? firebase.initializeApp(firebaseConfig)
  : firebase.app();

// export auth (and any other services you need)
export const auth = app.auth();

// if you need the raw `firebase` instance elsewhere:
export default app;

