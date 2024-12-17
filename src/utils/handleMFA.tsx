// src/utils/handleMFA.js

// src/utils/handleMFA.jsx
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

