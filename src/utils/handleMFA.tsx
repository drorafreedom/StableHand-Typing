import {
  getMultiFactorResolver,
  MultiFactorResolver,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  RecaptchaVerifier,
  AuthError,
} from "firebase/auth";
import { auth } from "../firebase/firebase";

export async function handleMFA(
  error: AuthError,
  setError: (message: string) => void,
  setSuccessMessage: (message: string) => void
): Promise<void> {
  try {
    const resolver: MultiFactorResolver = getMultiFactorResolver(auth, error);
    const selectedHint = resolver.hints[0]; // Adjust selection logic as needed

    const phoneInfoOptions = {
      multiFactorHint: selectedHint,
      session: resolver.session,
    };

    // Ensure the appVerifier is defined (e.g., reCAPTCHA)
    const appVerifier = new RecaptchaVerifier(
      "recaptcha-container",
      { size: "invisible" },
      auth
    );

    const verificationId = await PhoneAuthProvider.verifyPhoneNumber(
      phoneInfoOptions,
      appVerifier
    );

    const verificationCode = prompt("Enter the verification code sent to your phone:");
    if (!verificationCode) {
      throw new Error("Verification code is required.");
    }

    const cred = PhoneAuthProvider.credential(verificationId, verificationCode);
    const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);

    await resolver.resolveSignIn(multiFactorAssertion);
    setSuccessMessage("MFA completed successfully!");
  } catch (mfaError: unknown) {
    console.error("MFA resolution failed:", mfaError);
    setError(
      mfaError instanceof Error ? mfaError.message : "Failed to resolve MFA."
    );
  }
}


//+++++++++++JS version+++++++++++++++++
  // src/utils/handleMFA.jsx
  // JS version

export async function handleMFA(error, setError, setSuccessMessage) {
  try {
    const resolver = getMultiFactorResolver(auth, error);
    const selectedHint = resolver.hints[0]; // Adjust selection logic as needed
    const phoneInfoOptions = {
      multiFactorHint: selectedHint,
      session: resolver.session,
    };

    const verificationId = await phoneAuthProvider.verifyPhoneNumber(
      phoneInfoOptions,
      appVerifier
    );

    const verificationCode = prompt("Enter the verification code sent to your phone:");
    const cred = PhoneAuthProvider.credential(verificationId, verificationCode);
    const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);

    await resolver.resolveSignIn(multiFactorAssertion);
    setSuccessMessage("MFA completed successfully!");
  } catch (mfaError) {
    console.error("MFA resolution failed:", mfaError);
    setError(mfaError.message || "Failed to resolve MFA.");
  }
}

