import React from 'react';
import { auth } from '../firebase';
import firebase from 'firebase'; // Import the firebase module
function SignIn() {
    const signInWithGoogle = () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider);
    };

    return (
        <button onClick={signInWithGoogle}>Sign In with Google</button>
    );
}

export default SignIn;
 //only when configuring firebase




 import .env file const apiKey = process.env.REACT_APP_FIREBASE_API_KEY;



/* 
 in the inv file 
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_firebase_app_id */