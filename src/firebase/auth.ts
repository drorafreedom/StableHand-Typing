// src/utils/validation.ts

import { getAuth, sendEmailVerification } from 'firebase/auth';

//-----------------------validateEmail-----------
/* export const validateEmail = (email) => {
  const errors = [];
  if (!email.includes('@')) {
    errors.push('Email must contain @');
  }
  if (!email.includes('.')) {
    errors.push('Email must contain a domain, e.g., ".com"');
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    errors.push('Invalid email format');//  under defined 
  }
  return errors;
}; */
//-------------------validateEmail--------------

export const validateEmail = (email: string): string[] => {
  const errors: string[] = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email === undefined || email === null || email.trim() === '') {
    errors.push('Email is required.');
  } else {
    if (!email.includes('@')) {
      errors.push('Email must contain @');
    }
    if (!email.includes('.')) {
      errors.push('Email must contain a domain, e.g., ".com"');
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      errors.push('Invalid email format');
    } else if (!emailRegex.test(email)) {
      errors.push('Invalid email format.');
    }
  }
  return errors;
};

//---------------------------------------validatePhoneNumber

/* export const validatePhoneNumber = (phoneNumber) => {
  const errors = [];
  const phoneRegex = /^\d{10}$/; // Exact 10 digits for US format
  if (!phoneRegex.test(phoneNumber)) {
    errors.push('Phone number must be exactly 10 digits long.');
  }
  return errors;
}; */
//---------------------------------------validatePhoneNumber
/* export const validatePhoneNumber = (phoneNumber) => {
  const errors = [];
  if (!phoneNumber || typeof phoneNumber !== 'string') return errors;
  const phoneRegex = /^\d{10}$/; // Exact 10 digits for US format
  if (!phoneRegex.test(phoneNumber)) {
    errors.push('Phone number must be exactly 10 digits long.');
  }
  return errors;
}; */
//---------------------------------------validatePhoneNumber
/* export const validatePhoneNumber = (phoneNumber) => {
  const errors = [];
  if (phoneNumber === undefined || phoneNumber === null || phoneNumber.trim() === '') {
    errors.push('Phone number is required.');
  } else {
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      errors.push('Phone number must be exactly 10 digits long.');
    }
  }
  return errors;
}; */
//---------------------------------------validatePhoneNumber new with E.164 format
export const validatePhoneNumber = (phoneNumber: string): string[] => {
  const errors: string[] = [];
  // E.164 format validation
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  if (!phoneNumber) {
    errors.push('Phone number is required.');
  } else if (!phoneRegex.test(phoneNumber)) {
    errors.push('Invalid phone number format. Please enter a valid phone number.');
  }
  return errors;
};

//---------------------------------------validateZipCode
/* export const validateZipCode = (zip) => {
  const errors = [];
  const zipRegex = /^\d{5}(-\d{4})?$/; // Matches US ZIP code format
  if (!zipRegex.test(zip)) {
    errors.push('Invalid ZIP code format.');
  }
  return errors;
}; */
//---------------------------------------validateZipCode
export const validateZipCode = (zip: string): string[] => {
  const errors: string[] = [];
  if (!zip || typeof zip !== 'string' || zip.trim() === '') {
    return ['This field is required.'];
  } else {
    const zipRegex = /^\d{5}(-\d{4})?$/; // Matches US ZIP code format
    if (!zipRegex.test(zip)) {
      errors.push('Invalid ZIP code format.');
    }
  }
  return errors;
};

//---------------------------------------validateRequired
/* export const validateRequired = (value) => {
  const errors = [];
  if (value === null || value.trim() === '') {
    errors.push('This field is required.');
  }
  return errors;
}; */
//---------------------------------------validateRequired to handle single and multiple select
export const validateRequired = (value: any): string[] => {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return ['This field is required.'];
    }
  } else {
    if (!value || typeof value !== 'string' || value.trim() === '') {
      return ['This field is required.'];
    }
  }
  return [];
};

//---------------------------------------validateMiddleName
export const validateMiddleName = (value: string): string[] => {
  if (!value || typeof value !== 'string' || value.trim() === '') {
    return ['This field is required, default NA'];
  }
  return [];
};

//---------------------------------------validateCityCountryProfession
export const validateCityCountryProfession = (value: string): string[] => {
  const errors: string[] = [];
  if (!value || typeof value !== 'string' || value.trim() === '') {
    return ['This field is required.'];
  } else {
    if (!/^[a-zA-Z\s]+$/.test(value)) {
      errors.push('Only alphabetic characters and spaces are allowed.');
    }
  }
  return errors;
};

//---------------------------------------validateText
export const validateText = (value: string): string[] => {
  const errors: string[] = [];
  if (!value || typeof value !== 'string' || value.trim() === '') {
    return ['This field is required.'];
  } else {
    if (!/^[a-zA-Z\s]+$/.test(value)) {
      errors.push('Only alphabetic characters and spaces are allowed.');
    }
  }
  return errors;
};

//---------------------------------------validatePassword
export const validatePassword = (password: string): string[] => {
  const errors: string[] = [];
  if (!password) {
    errors.push('Password is required.');
  } else {
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long.');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter.');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter.');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one digit.');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character.');
    }
  }
  return errors;
};

//---------------------------------------isCapsLockOn
export const isCapsLockOn = (event: KeyboardEvent): boolean => {
  return event.getModifierState && event.getModifierState('CapsLock');
};

//---------------------------------------validatePositiveNumber
export const validatePositiveNumber = (value: any): string[] => {
  const errors: string[] = [];
  if (value === undefined || value === null || value < 0) {
    errors.push('Cannot be negative.');
  }
  return errors;
};

//---------------------------------------sendVerificationEmail
export const sendVerificationEmail = async (user: any): Promise<void> => {
  try {
    await sendEmailVerification(user);
    console.log('Verification email sent.');
  } catch (error) {
    console.error('Error sending verification email:', error);
  }
};

//---------------------------------------validateDOB
export const validateDOB = (dob: string): string[] => {
  const errors: string[] = [];
  const birthDate = new Date(dob);

  if (isNaN(birthDate.getTime())) {
    errors.push('Invalid Date of Birth.');
    return errors;
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age < 8 || age > 120) {
    errors.push('Date of Birth must result in an age between 8 and 120 years.');
  }

  return errors;
};


// //+++++++++++JS version+++++++++++++++++
//   // src/firebase/auth.js new comprehensive
//   // JS version
 
// import { auth } from './firebase'; // Import the initialized auth from firebase.js
// import {
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
//   sendEmailVerification,
//   sendPasswordResetEmail,
//   signOut,
//   signInWithPopup,
//   GoogleAuthProvider,
//   GithubAuthProvider,
//   FacebookAuthProvider,
//   TwitterAuthProvider,
//   OAuthProvider,
//   signInWithPhoneNumber,
//   RecaptchaVerifier,
//   onAuthStateChanged,
//   signInWithRedirect, //for MFA  functions ( use in microsoft as default ) 
// } from 'firebase/auth';
 
// // import { handleEmailVerification } from './yourVerificationModule'; // Uncomment if you have a separate module for handling email verification
// //import { handleEmailVerification } from './auth'; // Ensure this function is exported

// // Email Verification Logic
// export const handleEmailVerification = async (user) => {
//     if (user.emailVerified) {
//         return user;
//     } else {
//         await sendEmailVerification(user);
//         await signOut(auth);
//         throw new Error('Please verify your email address. A verification email has been sent.');
//     }
// };

// // Detailed Authentication Functions

// // Sign in with Google
// export const signInWithGoogle = async () => {
//     try {
//       const googleProvider = new GoogleAuthProvider();
//       const result = await signInWithPopup(auth, googleProvider);
//       // Optionally handle email verification
//        await handleEmailVerification(result.user);
//      // return result.user;
//     } catch (error) {
//       console.error("Error during Google sign-in:", error);
//       throw error;
//     }
//   };

 

// // Sign in with GitHub
// export const signInWithGitHub = async () => {
//   try {
//     const githubProvider = new GithubAuthProvider();
//     const result = await signInWithPopup(auth, githubProvider);
//     // Optionally handle email verification
//     await handleEmailVerification(result.user);
//     // return result.user;
//   } catch (error) {
//     console.error("Error during GitHub sign-in:", error);
//     throw error;
//   }
// };

// // Sign in with Facebook
// export const signInWithFacebook = async () => {
//     try {
//       const facebookProvider = new FacebookAuthProvider();
//       const result = await signInWithPopup(auth, facebookProvider);
//       // Optionally handle email verification
//        await handleEmailVerification(result.user);
//      // return result.user;
//     } catch (error) {
//       console.error("Error during Facebook sign-in:", error);
//       throw error;
//     }
//   };

//   // Sign in with Twitter
// export const signInWithTwitter = async () => {
//     try {
//       const twitterProvider = new TwitterAuthProvider();
//       const result = await signInWithPopup(auth, twitterProvider);
//       // Optionally handle email verification
//         await handleEmailVerification(result.user);
//      // return result.user;
//     } catch (error) {
//       console.error("Error during Twitter sign-in:", error);
//       throw error;
//     }
//   };


// // Detailed Sign in with Microsoft
// export const signInWithMicrosoft = async () => {
//     try {
//         const microsoftProvider = new OAuthProvider('microsoft.com');
//         const result = await signInWithPopup(auth, microsoftProvider);
        
//         // If you have a function to handle email verification after third-party sign-in
//        return await handleEmailVerification(result.user);
        
//         // If email verification is not required or handled differently
//        // return result.user;
//     } catch (error) {
//         console.error("Error during Microsoft sign-in:", error);
//         throw error; // Re-throw the error to handle it in the calling component
//     }
// };

//  // Sign in with Microsoft using Redirect
// export const signInWithMicrosoftRedirect = async () => {
//     try {
//         const microsoftProvider = new OAuthProvider('microsoft.com');
//         await signInWithRedirect(auth, microsoftProvider);
//           // If you have a function to handle email verification after third-party sign-in
//           return await handleEmailVerification(result.user);
        
//           // If email verification is not required or handled differently
//          // return result.user;
//     } catch (error) {
//         console.error("Error during Microsoft sign-in with redirect:", error);
//         throw error;
//     }
// };

// // Sign in with Yahoo
// export const signInWithYahoo = async () => {
//     try {
//       const yahooProvider = new OAuthProvider('yahoo.com');
//       const result = await signInWithPopup(auth, yahooProvider);
//       // Optionally handle email verification
//       await handleEmailVerification(result.user);
//       // return result.user;
//     } catch (error) {
//       console.error("Error during Yahoo sign-in:", error);
//       throw error;
//     }
//   };

//   // Sign in with Apple 
// //    Apple may not always provide the user's email by default. By adding the 'email' scope, you ensure that your application receives the user's email address upon successful authentication.
// // Other Providers: May offer basic profile information by default, reducing the need to add common scopes unless additional data is required.

// export const signInWithApple = async () => {
//     try {
//         const appleProvider = new OAuthProvider('apple.com');
//         appleProvider.addScope('email'); // Request email scope
//         appleProvider.addScope('name');  // Request name scope (optional)
//         const result = await signInWithPopup(auth, appleProvider);
//         return await handleEmailVerification(result.user);
//          // return result.user;
//     } catch (error) {
//         console.error("Error during Apple sign-in:", error);
//         throw error;
//     }
// };
// // Basic Authentication Functions

// // Register with Email and Password
// export const registerWithEmail = async (email, password) => {
//   const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//   await sendEmailVerification(userCredential.user);
//   return userCredential;
// };
// export const registerWithEmailPassword = async (email, password) => {
//     const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//     await sendEmailVerification(userCredential.user);
//     return userCredential;
//   };
  
// // Login with Email and Password- the name  loginWithEmail for more security.
// export const loginWithEmail = (email, password) => {
//   return signInWithEmailAndPassword(auth, email, password);
// };
// // Login with Email and Password- the name  loginWithEmail for more security.
// export const loginWithEmailPassword = (email, password) => {
//     return signInWithEmailAndPassword(auth, email, password);
//   };
  
// // Logout
// export const logout = () => {
//   return signOut(auth);
// };

// // Send Password Reset Email
// export const resetPassword = (email) => {
//   return sendPasswordResetEmail(auth, email);
// };

// // baasic Third-Party Authentication Functions

// // Sign in with Google
// /* export const signInWithGoogle = () => {
//   const googleProvider = new GoogleAuthProvider();
//   return signInWithPopup(auth, googleProvider);
// };
//  */
// // Sign in with GitHub
// /* export const signInWithGitHub = () => {
//   const githubProvider = new GithubAuthProvider();
//   return signInWithPopup(auth, githubProvider);
// };
//  */
// // Sign in with Facebook
// /* export const signInWithFacebook = () => {
//   const facebookProvider = new FacebookAuthProvider();
//   return signInWithPopup(auth, facebookProvider);
// } */;

// // Sign in with Twitter
// /* export const signInWithTwitter = () => {
//   const twitterProvider = new TwitterAuthProvider();
//   return signInWithPopup(auth, twitterProvider);
// }; */

// // Sign in with Microsoft
// /* export const signInWithMicrosoft = () => {
//   const microsoftProvider = new OAuthProvider('microsoft.com');
//   return signInWithPopup(auth, microsoftProvider);
// };
//  */
// // sign In With Apple
// /* export const signInWithApple = async () => {
//     try {
//         const result = await signInWithPopup(auth, appleProvider);
//         return await handleEmailVerification(result.user);
//     } catch (error) {
//         console.error("Error during Apple sign-in:", error);
//         throw error;
//     }
// }; */

// // Phone Authentication Function
// export const signInWithPhone = (phoneNumber, appVerifier) => {
//   return signInWithPhoneNumber(auth, phoneNumber, appVerifier);
// };

// // Initialize Recaptcha
// export const initializeRecaptcha = () => {
//   if (!window.recaptchaVerifier) {
//     window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
//       size: 'invisible',
//       callback: (response) => {
//         // reCAPTCHA solved, allow signInWithPhoneNumber.
//       },
//     }, auth);
//   }
// };
// export const setupRecaptcha = (elementId) => {
//     return new RecaptchaVerifier(elementId, {
//         'size': 'normal ',//invisible
//         'callback': (response) => {
//             console.log("reCAPTCHA solved", response);
//         }
//     }, auth);
// };
// // Auth State Listener
// export const authStateListener = (callback) => {
//   return onAuthStateChanged(auth, callback);
// };

// // Additional Authentication Functions (Commented Out)

// // // Update User Profile
// // export const updateUserProfile = (profile) => {
// //   return updateProfile(auth.currentUser, profile);
// // };

// // // Update User Email
// // export const updateUserEmail = (email) => {
// //   return updateEmail(auth.currentUser, email);
// // };

// // // Update User Password
// // export const updateUserPassword = (password) => {
// //   return updatePassword(auth.currentUser, password);
// // };

// // // Reauthenticate User
// // export const reauthenticate = (credential) => {
// //   return reauthenticateWithCredential(auth.currentUser, credential);
// // };

// // // Link Credential to User
// // export const linkCredential = (credential) => {
// //   return linkWithCredential(auth.currentUser, credential);
// // };

// // // Link Provider via Popup
// // export const linkWithPopupProvider = (provider) => {
// //   return linkWithPopup(auth.currentUser, provider);
// // };

// // // Link Provider via Redirect
// // export const linkWithRedirectProvider = (provider) => {
// //   return linkWithRedirect(auth.currentUser, provider);
// // };

// // // Unlink Provider
// // export const unlinkProvider = (providerId) => {
// //   return unlink(auth.currentUser, providerId);
// // };

// // // Delete User
// // export const deleteCurrentUser = () => {
// //   return deleteUser(auth.currentUser);
// // };

// // // Generic OAuth Sign-In Function
// // export const signInWithOAuth = (provider) => {
// //   return signInWithPopup(auth, provider);
// // };



// //---------------------------------the last -------------------------------------------

// // // src/firebase/auth.js
// // // with an error console for each provider
// // import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
// // import { auth } from './firebase'; // Adjust the path
// // import {  createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification, signInWithPopup } from "firebase/auth";
// // import { GoogleAuthProvider, GithubAuthProvider, OAuthProvider, FacebookAuthProvider } from "firebase/auth";
 
// //  const googleProvider = new GoogleAuthProvider();
// // const githubProvider = new GithubAuthProvider();
// // const appleProvider = new OAuthProvider('apple.com');
// // const yahooProvider = new OAuthProvider('yahoo.com');
// // const facebookProvider = new FacebookAuthProvider();
// // const microsoftProvider = new OAuthProvider('microsoft.com');
// // const twitterProvider = new OAuthProvider('twitter.com');


// // //email verification logic
// // const handleEmailVerification = async (user) => {
// //     if (user.emailVerified) {
// //         return user;
// //     } else {
// //         await sendEmailVerification(user);
// //         await signOut(auth);
// //         throw new Error('Please verify your email address. A verification email has been sent.');
// //     }
// // };

// // export const registerWithEmailPassword = async (email, password) => {
// //     try {
// //         const userCredential = await createUserWithEmailAndPassword(auth, email, password);
// //         const user = userCredential.user;
// //         await sendEmailVerification(user);
// //         return user;
// //     } catch (error) {
// //         console.error("Error registering new user:", error);
// //         throw error;
// //     }
// // };

// // /* export const loginWithEmailPassword = async (email, password) => {
// //     try {
// //         const userCredential = await signInWithEmailAndPassword(auth, email, password);
// //         const user = userCredential.user;
// //         if (user.emailVerified) {
// //             return user;
// //         } else {
// //             await sendEmailVerification(user);
// //             throw new Error("Please verify your email address. A new verification email has been sent.");
// //         }
// //     } catch (error) {
// //         console.error("Error logging in user:", error);
// //         throw error;
// //     }
// // }; */

 
 

// // export const loginWithEmailPassword = async (email, password) => {
// //   try {
// //     const userCredential = await signInWithEmailAndPassword(auth, email, password);
// //     const user = userCredential.user;
// //     if (user.emailVerified) {
// //       return user;
// //     } else {
// //       await sendEmailVerification(user);
// //       throw new Error("Please verify your email address. A new verification email has been sent.");
// //     }
// //   } catch (error) {
// //     console.error("Error logging in user:", error);
// //     throw error;
// //   }
// // };


// // export const logout = async () => {
// //     try {
// //         await signOut(auth);
// //     } catch (error) {
// //         console.error("Error logging out:", error);
// //         throw error;
// //     }
// // };

// // export const setupRecaptcha = (elementId) => {
// //     return new RecaptchaVerifier(elementId, {
// //         'size': 'invisible',
// //         'callback': (response) => {
// //             console.log("reCAPTCHA solved", response);
// //         }
// //     }, auth);
// // };

// // export const signInWithPhone = async (phoneNumber, recaptchaVerifier) => {
// //     try {
// //         const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
// //         return confirmationResult;
// //     } catch (error) {
// //         console.error("Error during phone sign-in", error);
// //         throw error;
// //     }
// // };



// // export const signInWithGoogle = async () => {
// //     try {
// //         const result = await signInWithPopup(auth, googleProvider);
// //         return await handleEmailVerification(result.user);
// //     } catch (error) {
// //         console.error("Error during Google sign-in:", error);
// //         throw error;
// //     }
// // };

// // export const signInWithGithub = async () => {
// //     try {
// //         const result = await signInWithPopup(auth, githubProvider);
// //         return await handleEmailVerification(result.user);
// //     } catch (error) {
// //         console.error("Error during GitHub sign-in:", error);
// //         throw error;
// //     }
// // };


// // export const signInWithApple = async () => {
// //     try {
// //         const result = await signInWithPopup(auth, appleProvider);
// //         return await handleEmailVerification(result.user);
// //     } catch (error) {
// //         console.error("Error during Apple sign-in:", error);
// //         throw error;
// //     }
// // };


// // export const signInWithYahoo = async () => {
// //     try {
// //         const result = await signInWithPopup(auth, yahooProvider);
// //         return await handleEmailVerification(result.user);
// //     } catch (error) {
// //         console.error("Error during Yahoo sign-in:", error);
// //         throw error;
// //     }
// // };



// // export const signInWithFacebook = async () => {
// //     try {
// //         const result = await signInWithPopup(auth, facebookProvider);
// //         return await handleEmailVerification(result.user);
// //     } catch (error) {
// //         console.error("Error during FaceBOok sign-in:", error);
// //         throw error;
// //     }
// // };

// // export const signInWithMicrosoft = async () => {
// //     try {
// //         const result = await signInWithPopup(auth, microsoftProvider);
// //         return await handleEmailVerification(result.user);
// //     } catch (error) {
// //         console.error("Error during Microsoft sign-in:", error);
// //         throw error;
// //     }
// // };


// // export const signInWithTwitter = async () => {
// //     try {
// //         const result = await signInWithPopup(auth, twiiterrovider);
// //         return await handleEmailVerification(result.user);
// //     } catch (error) {
// //         console.error("Error during Twitter sign-in:", error);
// //         throw error;
// //     }
// // };

// // /* export const signInWithGoogle = async () => {
// //     try {
// //         const result = await signInWithPopup(auth, googleProvider);
// //         return result;
// //     } catch (error) {
// //         console.error("Error during Google sign-in", error);
// //         throw error;
// //     }
// // }; */
// // /* export const signInWithGoogle = async () => {
// //     try {
// //         const result = await signInWithPopup(auth, googleProvider);
// //         const user = result.user;

// //         // Check if email is verified
// //         if (user.emailVerified) {
// //             // Email is verified, proceed as normal
// //             return user;
// //         } else {
// //             // Email not verified, send verification email
// //             await sendEmailVerification(user);
// //             // Sign out the user to prevent access
// //             await signOut(auth);
// //             // Inform the user to verify their email
// //             throw new Error('Please verify your email address. A verification email has been sent.');
// //         }
// //     } catch (error) {
// //         console.error("Error during Google sign-in:", error);
// //         throw error;
// //     }
// // }; */


// // /* export const signInWithGithub = async () => {
// //     try {
// //         const result = await signInWithPopup(auth, githubProvider);
// //         return result;
// //     } catch (error) {
// //         console.error("Error during GitHub sign-in", error);
// //         throw error;
// //     }
// // }; */

// // /* export const signInWithGithub = async () => {
// //     try {
// //         const result = await signInWithPopup(auth, githubProvider);
// //         const user = result.user;

// //         // Check if email is verified
// //         if (user.emailVerified) {
// //             // Email is verified, proceed as normal
// //             return user;
// //         } else {
// //             // Email not verified, send verification email
// //             await sendEmailVerification(user);
// //             // Sign out the user to prevent access
// //             await signOut(auth);
// //             // Inform the user to verify their email
// //             throw new Error('Please verify your email address. A verification email has been sent.');
// //         }
// //     } catch (error) {
// //         console.error("Error during GitHub sign-in:", error);
// //         throw error;
// //     }
// // }; */
// // /* export const signInWithApple = async () => {
// //     try {
// //         const result = await signInWithPopup(auth, appleProvider);
// //         return result;
// //     } catch (error) {
// //         console.error("Error during Apple sign-in", error);
// //         throw error;
// //     }
// // }; */

// // /* export const signInWithApple = async () => {
// //     try {
// //         const result = await signInWithPopup(auth, appleProvider);
// //         const user = result.user;

// //         // Check if email is verified
// //         if (user.emailVerified) {
// //             // Email is verified, proceed as normal
// //             return user;
// //         } else {
// //             // Email not verified, send verification email
// //             await sendEmailVerification(user);
// //             // Sign out the user to prevent access
// //             await signOut(auth);
// //             // Inform the user to verify their email
// //             throw new Error('Please verify your email address. A verification email has been sent.');
// //         }
// //     } catch (error) {
// //         console.error("Error during Apple sign-in:", error);
// //         throw error;
// //     }
// // }; */

// // /* export const signInWithYahoo = async () => {
// //     try {
// //         const result = await signInWithPopup(auth, yahooProvider);
// //         return result;
// //     } catch (error) {
// //         console.error("Error during Yahoo sign-in", error);
// //         throw error;
// //     }
// // };
// //  */
// // /* export const signInWithYahoo = async () => {
// //     try {
// //         const result = await signInWithPopup(auth, yahooProvider);
// //         const user = result.user;

// //         // Check if email is verified
// //         if (user.emailVerified) {
// //             // Email is verified, proceed as normal
// //             return user;
// //         } else {
// //             // Email not verified, send verification email
// //             await sendEmailVerification(user);
// //             // Sign out the user to prevent access
// //             await signOut(auth);
// //             // Inform the user to verify their email
// //             throw new Error('Please verify your email address. A verification email has been sent.');
// //         }
// //     } catch (error) {
// //         console.error("Error during Yahoo sign-in:", error);
// //         throw error;
// //     }
// // };
// //  */

// // /* export const signInWithFacebook = async () => {
// //     try {
// //         const result = await signInWithPopup(auth, facebookProvider);
// //         return result;
// //     } catch (error) {
// //         console.error("Error during Facebook sign-in", error);
// //         throw error;
// //     }
// // }; */

// // /* export const signInWithFacebook = async () => {
// //     try {
// //         const result = await signInWithPopup(auth, facebookProvider);
// //         const user = result.user;

// //         // Check if email is verified
// //         if (user.emailVerified) {
// //             // Email is verified, proceed as normal
// //             return user;
// //         } else {
// //             // Email not verified, send verification email
// //             await sendEmailVerification(user);
// //             // Sign out the user to prevent access
// //             await signOut(auth);
// //             // Inform the user to verify their email
// //             throw new Error('Please verify your email address. A verification email has been sent.');
// //         }
// //     } catch (error) {
// //         console.error("Error during Facebook sign-in:", error);
// //         throw error;
// //     }
// // };
// //  */

// // /* export const signInWithMicrosoft = async () => {
// //     try {
// //         const result = await signInWithPopup(auth, microsoftProvider);
// //         return result;
// //     } catch (error) {
// //         console.error("Error during Microsoft sign-in", error);
// //         throw error;
// //     }
// // };
// //  */


// // /* export const signInWithMicrosoft = async () => {
// //     try {
// //         const result = await signInWithPopup(auth, microsoftProvider);
// //         const user = result.user;

// //         // Check if email is verified
// //         if (user.emailVerified) {
// //             // Email is verified, proceed as normal
// //             return user;
// //         } else {
// //             // Email not verified, send verification email
// //             await sendEmailVerification(user);
// //             // Sign out the user to prevent access
// //             await signOut(auth);
// //             // Inform the user to verify their email
// //             throw new Error('Please verify your email address. A verification email has been sent.');
// //         }
// //     } catch (error) {
// //         console.error("Error during Microsoft sign-in:", error);
// //         throw error;
// //     }
// // }; */
// // /* export const signInWithTwitter = async () => {
// //     try {
// //         const result = await signInWithPopup(auth, twitterProvider);
// //         return result;
// //     } catch (error) {
// //         console.error("Error during Twitter sign-in", error);
// //         throw error;
// //     }
// // };
// //  */

// // /* export const signInWithTwitter = async () => {
// //     try {
// //         const result = await signInWithPopup(auth, twitterProvider);
// //         const user = result.user;

// //         // Check if email is verified
// //         if (user.emailVerified) {
// //             // Email is verified, proceed as normal
// //             return user;
// //         } else {
// //             // Email not verified, send verification email
// //             await sendEmailVerification(user);
// //             // Sign out the user to prevent access
// //             await signOut(auth);
// //             // Inform the user to verify their email
// //             throw new Error('Please verify your email address. A verification email has been sent.');
// //         }
// //     } catch (error) {
// //         console.error("Error during Twitter sign-in:", error);
// //         throw error;
// //     }
// // }; */
// // export const handleThirdPartyRegister = async (provider) => {
// //     try {
// //         const result = await signInWithPopup(auth, provider);
// //         await sendEmailVerification(result.user);
// //         return result;
// //     } catch (error) {
// //         console.error("Error during third-party registration:", error);
// //         throw error;
// //     }
// // };






// // export {  RecaptchaVerifier, googleProvider, githubProvider, appleProvider, yahooProvider, facebookProvider, microsoftProvider,twitterProvider };

// //===================================================

// /* // src/firebase/auth.js
// import { auth, RecaptchaVerifier } from './firebase';
// import {
//     signInWithPhoneNumber,
//     createUserWithEmailAndPassword,
//     signInWithEmailAndPassword,
//     signOut,
//     sendEmailVerification,
//     signInWithPopup,
//     GoogleAuthProvider,
//     GithubAuthProvider,
//     OAuthProvider,
//     FacebookAuthProvider
// } from "firebase/auth";

// const googleProvider = new GoogleAuthProvider();
// const githubProvider = new GithubAuthProvider();
// const appleProvider = new OAuthProvider('apple.com');
// const yahooProvider = new OAuthProvider('yahoo.com');
// const facebookProvider = new FacebookAuthProvider();
// const microsoftProvider = new OAuthProvider('microsoft.com');

// export const registerWithEmailPassword = async (email, password) => {
//     try {
//         const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//         const user = userCredential.user;
//         await sendEmailVerification(user);
//         return user;
//     } catch (error) {
//         console.error("Error registering new user:", error);
//         throw error;
//     }
// };

// export const loginWithEmailPassword = async (email, password) => {
//     try {
//         const userCredential = await signInWithEmailAndPassword(auth, email, password);
//         const user = userCredential.user;
//         if (user.emailVerified) {
//             return user;
//         } else {
//             await sendEmailVerification(user);
//             throw new Error("Please verify your email address. A new verification email has been sent.");
//         }
//     } catch (error) {
//         console.error("Error logging in user:", error);
//         throw error;
//     }
// };

// export const logout = async () => {
//     try {
//         await signOut(auth);
//     } catch (error) {
//         console.error("Error logging out:", error);
//         throw error;
//     }
// };

// export const setupRecaptcha = (elementId) => {
//     return new RecaptchaVerifier(elementId, {
//         'size': 'invisible',
//         'callback': (response) => {
//             console.log("reCAPTCHA solved", response);
//         }
//     }, auth);
// };

// export const signInWithPhone = async (phoneNumber, recaptchaVerifier) => {
//     try {
//         const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
//         return confirmationResult;
//     } catch (error) {
//         console.error("Error during phone sign-in", error);
//         throw error;
//     }
// };

// export const signInWithGoogle = async () => {
//     try {
//         const result = await signInWithPopup(auth, googleProvider);
//         return result.user;
//     } catch (error) {
//         console.error("Error during Google sign-in", error);
//         throw error;
//     }
// };

// export const signInWithGithub = async () => {
//     try {
//         const result = await signInWithPopup(auth, githubProvider);
//         return result.user;
//     } catch (error) {
//         console.error("Error during GitHub sign-in", error);
//         throw error;
//     }
// };

// export const signInWithApple = async () => {
//     try {
//         const result = await signInWithPopup(auth, appleProvider);
//         return result.user;
//     } catch (error) {
//         console.error("Error during Apple sign-in", error);
//         throw error;
//     }
// };

// export const signInWithYahoo = async () => {
//     try {
//         const result = await signInWithPopup(auth, yahooProvider);
//         return result.user;
//     } catch (error) {
//         console.error("Error during Yahoo sign-in", error);
//         throw error;
//     }
// };

// export const signInWithFacebook = async () => {
//     try {
//         const result = await signInWithPopup(auth, facebookProvider);
//         return result.user;
//     } catch (error) {
//         console.error("Error during Facebook sign-in", error);
//         throw error;
//     }
// };

// export const handleThirdPartyRegister = async (provider) => {
//     try {
//         const result = await signInWithPopup(auth, provider);
//         await sendEmailVerification(result.user);
//         return result.user;
//     } catch (error) {
//         console.error("Error during third-party registration:", error);
//         throw error;
//     }
// };

// export const signInWithMicrosoft = async () => {
//     try {
//         const result = await signInWithPopup(auth, microsoftProvider);
//         return result.user;
//     } catch (error) {
//         console.error("Error during Microsoft sign-in", error);
//         throw error;
//     }
// };

// export { auth, googleProvider, githubProvider, appleProvider, yahooProvider, facebookProvider, microsoftProvider }; */

// /* 
// //=============================================================

// // src/firebase/auth.js
// import { auth, RecaptchaVerifier } from './firebase';
// import { signInWithPhoneNumber, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification, signInWithPopup } from "firebase/auth";
// import { GoogleAuthProvider, GithubAuthProvider, OAuthProvider, FacebookAuthProvider } from "firebase/auth";
 
 
// const googleProvider = new GoogleAuthProvider();
// const githubProvider = new GithubAuthProvider();
// const appleProvider = new OAuthProvider('apple.com');
// const yahooProvider = new OAuthProvider('yahoo.com');
// const facebookProvider = new FacebookAuthProvider();
// const microsoftProvider = new OAuthProvider('microsoft.com'); // Add the Microsoft provider
// // Register a new user with email and password and send an email verification
// export const registerWithEmailPassword = async (email, password) => {
//     try {
//         const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//         const user = userCredential.user;
//         await sendEmailVerification(user);
//         return user;
//     } catch (error) {
//         console.error("Error registering new user:", error);
//         throw error;
//     }
// };

// // Login a user with email and password
// export const loginWithEmailPassword = async (email, password) => {
//     try {
//         const userCredential = await signInWithEmailAndPassword(auth, email, password);
//         const user = userCredential.user;
//         if (user.emailVerified) {
//             return user;
//         } else {
//             await sendEmailVerification(user);
//             throw new Error("Please verify your email address. A new verification email has been sent.");
//         }
//     } catch (error) {
//         console.error("Error logging in user:", error);
//         throw error;
//     }
// };

// // Logout the current user
// export const logout = async () => {
//     try {
//         await signOut(auth);
//     } catch (error) {
//         console.error("Error logging out:", error);
//         throw error;
//     }
// };

// // Phone authentication setup
// export const setupRecaptcha = (elementId) => {
//     return new RecaptchaVerifier(elementId, {
//         'size': 'invisible',
//         'callback': (response) => {
//             console.log("reCAPTCHA solved", response);
//         }
//     }, auth);
// };

// export const signInWithPhone = async (phoneNumber, recaptchaVerifier) => {
//     try {
//         const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
//         return confirmationResult;
//     } catch (error) {
//         console.error("Error during phone sign-in", error);
//         throw error;
//     }
// };

// // Third-party sign-in
// export const signInWithGoogle = async () => {
//     try {
//         const result = await signInWithPopup(auth, googleProvider);
//         return result;
//     } catch (error) {
//         console.error("Error during Google sign-in", error);
//         throw error;
//     }
// };

// export const signInWithGithub = async () => {
//     try {
//         const result = await signInWithPopup(auth, githubProvider);
//         return result;
//     } catch (error) {
//         console.error("Error during GitHub sign-in", error);
//         throw error;
//     }
// };

// export const signInWithApple = async () => {
//     try {
//         const result = await signInWithPopup(auth, appleProvider);
//         return result;
//     } catch (error) {
//         console.error("Error during Apple sign-in", error);
//         throw error;
//     }
// };

// export const signInWithYahoo = async () => {
//     try {
//         const result = await signInWithPopup(auth, yahooProvider);
//         return result;
//     } catch (error) {
//         console.error("Error during Yahoo sign-in", error);
//         throw error;
//     }
// };

// export const signInWithFacebook = async () => {
//     try {
//         const result = await signInWithPopup(auth, facebookProvider);
//         return result;
//     } catch (error) {
//         console.error("Error during Facebook sign-in", error);
//         throw error;
//     }
// };

// export const handleThirdPartyRegister = async (provider) => {
//     try {
//         const result = await signInWithPopup(auth, provider);
//         await sendEmailVerification(result.user);
//         return result;
//     } catch (error) {
//         console.error("Error during third-party registration:", error);
//         throw error;
//     }
// };

// export const signInWithMicrosoft = async () => { // Add the signInWithMicrosoft function
//     try {
//         const result = await signInWithPopup(auth, microsoftProvider);
//         return result;
//     } catch (error) {
//         console.error("Error during Microsoft sign-in", error);
//         throw error;
//     }
// };

// export { auth, googleProvider, githubProvider, appleProvider, yahooProvider, facebookProvider,microsoftProvider}; */


// /* // src\firebase\auth.js
// import { auth, RecaptchaVerifier } from './firebase';
// import { signInWithPhoneNumber, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification, signInWithPopup } from "firebase/auth";
// import { GoogleAuthProvider, OAuthProvider, FacebookAuthProvider } from "firebase/auth";

// const googleProvider = new GoogleAuthProvider();
// const appleProvider = new OAuthProvider('apple.com');
// const yahooProvider = new OAuthProvider('yahoo.com');
// const facebookProvider = new FacebookAuthProvider();

// // Register a new user with email and password and send an email verification
// export const registerWithEmailPassword = async (email, password) => {
//     try {
//         const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//         const user = userCredential.user;
//         await sendEmailVerification(user);
//         return user;
//     } catch (error) {
//         console.error("Error registering new user:", error);
//         throw error;
//     }
// };

// // Login a user with email and password
// export const loginWithEmailPassword = async (email, password) => {
//     try {
//         const userCredential = await signInWithEmailAndPassword(auth, email, password);
//         const user = userCredential.user;
//         if (user.emailVerified) {
//             return user;
//         } else {
//             await sendEmailVerification(user);
//             throw new Error("Please verify your email address. A new verification email has been sent.");
//         }
//     } catch (error) {
//         console.error("Error logging in user:", error);
//         throw error;
//     }
// };

// // Logout the current user
// export const logout = async () => {
//     try {
//         await signOut(auth);
//     } catch (error) {
//         console.error("Error logging out:", error);
//         throw error;
//     }
// };

// // Phone authentication setup
// export const setupRecaptcha = (elementId) => {
//     return new RecaptchaVerifier(elementId, {
//         'size': 'invisible',
//         'callback': (response) => {
//             console.log("reCAPTCHA solved", response);
//         }
//     }, auth);
// };

// export const signInWithPhone = async (phoneNumber, recaptchaVerifier) => {
//     try {
//         const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
//         return confirmationResult;
//     } catch (error) {
//         console.error("Error during phone sign-in", error);
//         throw error;
//     }
// };

// // Third-party sign-in
// export const signInWithGoogle = async () => {
//     try {
//         const result = await signInWithPopup(auth, googleProvider);
//         return result;
//     } catch (error) {
//         console.error("Error during Google sign-in", error);
//         throw error;
//     }
// };

// export const signInWithApple = async () => {
//     try {
//         const result = await signInWithPopup(auth, appleProvider);
//         return result;
//     } catch (error) {
//         console.error("Error during Apple sign-in", error);
//         throw error;
//     }
// };

// export const signInWithYahoo = async () => {
//     try {
//         const result = await signInWithPopup(auth, yahooProvider);
//         return result;
//     } catch (error) {
//         console.error("Error during Yahoo sign-in", error);
//         throw error;
//     }
// };

// export const signInWithFacebook = async () => {
//     try {
//         const result = await signInWithPopup(auth, facebookProvider);
//         return result;
//     } catch (error) {
//         console.error("Error during Facebook sign-in", error);
//         throw error;
//     }
// };

// export { auth, googleProvider, appleProvider, yahooProvider, facebookProvider };
//  */