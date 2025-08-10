// src/utils/recaptcha.ts
import { RecaptchaVerifier } from "firebase/auth";
import { auth } from "../firebase/firebase";

export function resetRecaptcha() {
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear(); // This removes existing widget
    } catch (e) {
      console.warn("No existing reCAPTCHA to clear or already removed.");
    }
    delete window.recaptchaVerifier;
  }

  window.recaptchaVerifier = new RecaptchaVerifier(
    auth,
    "recaptcha-container",
    { size: "invisible" }
  );

  return window.recaptchaVerifier.render();
}
