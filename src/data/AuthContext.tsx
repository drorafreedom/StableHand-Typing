  
  // src/data/AuthContext.tsx

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  registerWithEmail,
  loginWithEmail,
  logout,
  resetPassword,
  signInWithGoogle,
  signInWithGitHub,
  signInWithFacebook,
  signInWithTwitter,
  signInWithMicrosoft,
  signInWithPhone,
  initializeRecaptcha,
  authStateListener,
} from '../firebase/auth'; // Ensure these functions are correctly exported from auth.ts

// Define types for AuthContext
interface User {
  uid: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  phoneNumber?: string | null;
  // Add more user properties as needed
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  registerWithEmail: typeof registerWithEmail;
  loginWithEmail: typeof loginWithEmail;
  logout: typeof logout;
  resetPassword: typeof resetPassword;
  signInWithGoogle: typeof signInWithGoogle;
  signInWithGitHub: typeof signInWithGitHub;
  signInWithFacebook: typeof signInWithFacebook;
  signInWithTwitter: typeof signInWithTwitter;
  signInWithMicrosoft: typeof signInWithMicrosoft;
  signInWithPhone: typeof signInWithPhone;
  initializeRecaptcha: typeof initializeRecaptcha;
}

// Create AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider Props
interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authStateListener((user) => {
      setCurrentUser(user ? { ...user } : null);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    loading,
    registerWithEmail,
    loginWithEmail,
    logout,
    resetPassword,
    signInWithGoogle,
    signInWithGitHub,
    signInWithFacebook,
    signInWithTwitter,
    signInWithMicrosoft,
    signInWithPhone,
    initializeRecaptcha,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};


//+++++++++++JS version+++++++++++++++++
   // src/data/AuthContext.jsx comprehensive file  new for security 
  // JS version
 


/*  import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  // Basic Authentication Functions
  registerWithEmail,
  loginWithEmail,
  logout,
  resetPassword,
  
  // Third-Party Authentication Functions
  signInWithGoogle,
  signInWithGitHub,
  signInWithFacebook,
  signInWithTwitter,
  signInWithMicrosoft,
  signInWithYahoo,
  signInWithApple,
  signInWithMicrosoftRedirect,
  // Phone Authentication Function
  signInWithPhone,
  
  // Initialize Recaptcha
  initializeRecaptcha,
  
  // Additional Authentication Functions (Commented Out)
  authStateListener,
  // updateUserProfile,
  // updateUserEmail,
  // updateUserPassword,
  // reauthenticate,
  // linkCredential,
  // linkWithPopupProvider,
  // linkWithRedirectProvider,
  // unlinkProvider,
  // deleteCurrentUser,
  
  // Generic OAuth Sign-In Function
  // signInWithOAuth,
} from '../firebase/auth'; // Ensure these functions are exported from auth.js

// Create AuthContext
const AuthContext = createContext();
 
// Custom hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);

// AuthProvider component to wrap around your app
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null); // Holds the authenticated user
  const [loading, setLoading] = useState(true); // Indicates if the auth state is being loaded
  // Additional States (Commented Out)
  // const [token, setToken] = useState(null); // For storing user token
  // const [role, setRole] = useState(null); // For user roles if applicable

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = authStateListener((user) => {
      setCurrentUser(user);
      setLoading(false);
      // Additional Logic (Commented Out)
      // if (user) {
      //   user.getIdTokenResult().then((idTokenResult) => {
      //     setToken(idTokenResult.token);
      //     setRole(idTokenResult.claims.role);
      //   });
      // }
    });

    return unsubscribe;
  }, []);

  // AuthContext Value
  const value = {
    currentUser,
    loading,
    
    // Authentication Functions
    registerWithEmail,
    loginWithEmail,
    logout,
    resetPassword,
    
    // Third-Party Authentication Functions
    signInWithGoogle,
    signInWithGitHub,
    signInWithFacebook,
    signInWithTwitter,
    signInWithMicrosoft,
    
    // Phone Authentication Function
    signInWithPhone,
    
    // Initialize Recaptcha
    initializeRecaptcha,
    
    // Additional Authentication Functions (Commented Out)
    // updateUserProfile,
    // updateUserEmail,
    // updateUserPassword,
    // reauthenticate,
    // linkCredential,
    // linkWithPopupProvider,
    // linkWithRedirectProvider,
    // unlinkProvider,
    // deleteCurrentUser,
    
    // Generic OAuth Sign-In Function (Commented Out)
    // signInWithOAuth,
    
    // Additional States and Functions (Commented Out)
    // token,
    // role,
    // getUserToken,
    // setUserRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
   */
//==========================================

/* 
Explanation of the Code
Imports:

Authentication Functions: Imported from auth.js. These include both basic and third-party authentication functions.
Commented Out Functions: Additional functions that are currently not in use but available for future implementation.
Auth State Management:

currentUser: Holds the currently authenticated user.
loading: Indicates whether the authentication state is still being determined.
Additional States: token and role are commented out but can be used for advanced features like role-based access control.
Auth State Listener:

Utilizes authStateListener from auth.js to monitor authentication state changes.
Updates currentUser and loading based on the authentication state.
Additional logic for token and role management is commented out.
Context Value:

Provides currentUser, loading, and all authentication functions to consuming components.
Additional functions and states are commented out for future use.
Provider Wrapper:

Wraps around your application to provide authentication context to all child components.
Ensures that the children are only rendered once the authentication state is determined (!loading). */
//==========================================

//=====================
/* import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
 */