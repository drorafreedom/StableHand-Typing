// src\firebase\auth.js
import { auth, RecaptchaVerifier } from './firebase';
import { signInWithPhoneNumber, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification, signInWithPopup } from "firebase/auth";
import { GoogleAuthProvider, OAuthProvider, FacebookAuthProvider } from "firebase/auth";

const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider('apple.com');
const yahooProvider = new OAuthProvider('yahoo.com');
const facebookProvider = new FacebookAuthProvider();

// Register a new user with email and password and send an email verification
export const registerWithEmailPassword = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await sendEmailVerification(user);
        return user;
    } catch (error) {
        console.error("Error registering new user:", error);
        throw error;
    }
};

// Login a user with email and password
export const loginWithEmailPassword = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        if (user.emailVerified) {
            return user;
        } else {
            await sendEmailVerification(user);
            throw new Error("Please verify your email address. A new verification email has been sent.");
        }
    } catch (error) {
        console.error("Error logging in user:", error);
        throw error;
    }
};

// Logout the current user
export const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error logging out:", error);
        throw error;
    }
};

// Phone authentication setup
export const setupRecaptcha = (elementId) => {
    return new RecaptchaVerifier(elementId, {
        'size': 'invisible',
        'callback': (response) => {
            console.log("reCAPTCHA solved", response);
        }
    }, auth);
};

export const signInWithPhone = async (phoneNumber, recaptchaVerifier) => {
    try {
        const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
        return confirmationResult;
    } catch (error) {
        console.error("Error during phone sign-in", error);
        throw error;
    }
};

// Third-party sign-in
export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result;
    } catch (error) {
        console.error("Error during Google sign-in", error);
        throw error;
    }
};

export const signInWithApple = async () => {
    try {
        const result = await signInWithPopup(auth, appleProvider);
        return result;
    } catch (error) {
        console.error("Error during Apple sign-in", error);
        throw error;
    }
};

export const signInWithYahoo = async () => {
    try {
        const result = await signInWithPopup(auth, yahooProvider);
        return result;
    } catch (error) {
        console.error("Error during Yahoo sign-in", error);
        throw error;
    }
};

export const signInWithFacebook = async () => {
    try {
        const result = await signInWithPopup(auth, facebookProvider);
        return result;
    } catch (error) {
        console.error("Error during Facebook sign-in", error);
        throw error;
    }
};

export { auth, googleProvider, appleProvider, yahooProvider, facebookProvider };
