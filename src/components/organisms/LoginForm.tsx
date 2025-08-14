// src/components/organisms/LoginForm.tsx
// TS version

// src/components/organisms/LoginForm.tsx

// src/components/organisms/LoginForm.tsx
// 5. 2025-08-11 — Fix RL loop: reset RL on back-to-login & hide RL banner outside MFA.
// Robust reCAPTCHA lifecycle, auto-resend after 3 attempts, idle timeout, email-link fallback.

import React, { useEffect, useMemo, useRef, useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  getMultiFactorResolver,
  type MultiFactorResolver,
  RecaptchaVerifier,
  type UserCredential,
  type PhoneMultiFactorInfo,
  sendSignInLinkToEmail,
} from 'firebase/auth';
import { auth } from '../../firebase/firebase';
import EmailField from '../common/EmailField';
import PasswordField from '../common/PasswordField';
import InputField from '../common/InputField';
import Button from '../common/Button';
import Alert from '../common/Alert';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    recaptchaContainerEl?: HTMLDivElement | null;
    grecaptcha?: any;
  }
}

type Banner = { text: string; type: 'info' | 'success' | 'error' };

// ---------- Behaviour knobs ----------
const MAX_CODE_ATTEMPTS = 3;                 // tries allowed before policy kicks in
const MFA_IDLE_TIMEOUT_MS = 2 * 60 * 1000;   // 2 minutes idle → back to login
const EMAIL_LINK_FINISH_PATH = '/finish-email-signin';
const ON_MAX_ATTEMPTS_ACTION: 'auto-resend' | 'reset-to-login' = 'auto-resend';

// Rate-limit backoff (for auth/too-many-requests)
const RL_BASE_SECONDS = 60;                  // start with 60s
const RL_MAX_SECONDS  = 15 * 60;             // cap at 15 minutes
// ------------------------------------

// Error codes that often indicate stale session/recaptcha
const SESSION_ERROR_CODES = new Set([
  'auth/multi-factor-session-expired',
  'auth/invalid-app-credential',
  'auth/missing-app-credential',
  'auth/captcha-check-failed',
  'auth/expired-action-code',
]);

export default function LoginForm(): JSX.Element {
  const navigate = useNavigate();

  // Email/password
  const [email, setEmail] = useState('');
  const [emailErrors, setEmailErrors] = useState<string[]>([]);
  const [password, setPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  // MFA state
  const [resolver, setResolver] = useState<MultiFactorResolver | null>(null);
  const [verificationId, setVerificationId] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [codeAttempts, setCodeAttempts] = useState(0);

  // Idle timers
  const idleTimeoutRef = useRef<number | null>(null);
  const idleIntervalRef = useRef<number | null>(null);
  const [idleSecondsLeft, setIdleSecondsLeft] = useState(Math.floor(MFA_IDLE_TIMEOUT_MS / 1000));

  // Rate-limit state
  const [rlLevel, setRlLevel] = useState(0);
  const [rlUntil, setRlUntil] = useState<number>(0); // epoch ms
  const [rlSecondsLeft, setRlSecondsLeft] = useState<number>(0);
  const rlIntervalRef = useRef<number | null>(null);

  // Track whether we’re in MFA step (for banner scoping)
  const inMfaStep = useMemo(() => Boolean(resolver || verificationId), [resolver, verificationId]);
  const inMfaRef = useRef(inMfaStep);
  useEffect(() => { inMfaRef.current = inMfaStep; }, [inMfaStep]);

  // UI
  const [banner, setBanner] = useState<Banner>({ text: '', type: 'info' });
  const [busy, setBusy] = useState(false);

  // Helpers
  const now = () => Date.now();
  const isRateLimited = () => rlUntil > now();

  // ===== reCAPTCHA lifecycle (fresh container every time) =====
  function destroyRecaptcha() {
    try {
      if ((window as any).recaptchaVerifier?.clear) {
        (window as any).recaptchaVerifier.clear();
      }
    } catch { /* noop */ }
    try {
      if (window.recaptchaContainerEl && window.recaptchaContainerEl.parentNode) {
        window.recaptchaContainerEl.parentNode.removeChild(window.recaptchaContainerEl);
      }
    } catch { /* noop */ }
    window.recaptchaVerifier = undefined;
    window.recaptchaContainerEl = null;
  }

  async function buildFreshRecaptcha(): Promise<void> {
    destroyRecaptcha();
    const el = document.createElement('div');
    el.style.display = 'none';
    el.id = `recaptcha-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    document.body.appendChild(el);
    window.recaptchaContainerEl = el;
    window.recaptchaVerifier = new RecaptchaVerifier(auth, el, { size: 'invisible' });
    await window.recaptchaVerifier.render();
  }

  // ===== Idle timers =====
  function clearIdleTimers() {
    if (idleTimeoutRef.current) {
      window.clearTimeout(idleTimeoutRef.current);
      idleTimeoutRef.current = null;
    }
    if (idleIntervalRef.current) {
      window.clearInterval(idleIntervalRef.current);
      idleIntervalRef.current = null;
    }
  }

  function startIdleTimer() {
    clearIdleTimers();
    setIdleSecondsLeft(Math.floor(MFA_IDLE_TIMEOUT_MS / 1000));
    idleTimeoutRef.current = window.setTimeout(() => {
      resetToLogin('Session timed out. Please log in again.');
    }, MFA_IDLE_TIMEOUT_MS) as unknown as number;
    idleIntervalRef.current = window.setInterval(() => {
      setIdleSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000) as unknown as number;
  }

  // ===== Rate-limit cooldown =====
  function clearRlInterval() {
    if (rlIntervalRef.current) {
      window.clearInterval(rlIntervalRef.current);
      rlIntervalRef.current = null;
    }
  }
  function startRateLimit(seconds: number) {
    const until = now() + seconds * 1000;
    setRlUntil(until);
    setRlSecondsLeft(seconds);
    clearRlInterval();
    rlIntervalRef.current = window.setInterval(() => {
      const left = Math.max(0, Math.ceil((until - now()) / 1000));
      setRlSecondsLeft(left);
      if (left <= 0) {
        // auto-clear when done
        resetRateLimit();
      }
    }, 1000) as unknown as number;
  }
  function bumpRateLimit() {
    const nextSeconds = Math.min(RL_BASE_SECONDS * Math.pow(2, rlLevel), RL_MAX_SECONDS);
    setRlLevel((l) => Math.min(l + 1, 30));
    startRateLimit(nextSeconds);
    // Only show the RL banner while in the MFA step (prevents loop on login screen)
    if (inMfaRef.current) {
      setBanner({
        text: `Too many attempts. Please wait ${nextSeconds}s before trying again.`,
        type: 'error',
      });
    }
  }
  function resetRateLimit() {
    setRlLevel(0);
    setRlUntil(0);
    setRlSecondsLeft(0);
    clearRlInterval();
  }

  // MFA + RL state resets
  function clearMfaState() {
    setResolver(null);
    setVerificationId('');
    setSmsCode('');
    setCodeSent(false);
    setCodeAttempts(0);
    clearIdleTimers();
    destroyRecaptcha();
  }

  function resetToLogin(message?: string) {
    clearMfaState();
    resetRateLimit();            // << fix: clear RL when returning to login
    setPassword('');
    setBanner({ text: message ?? 'Returning to login…', type: 'info' });
    // navigate('/login'); // if your login is a different route
  }

  // Manage idle timers on MFA step entry/exit
  useEffect(() => {
    if (inMfaStep) startIdleTimer(); else clearIdleTimers();
    return () => clearIdleTimers();
  }, [inMfaStep]);

  // Nudge the idle timer on user activity within MFA
  useEffect(() => {
    if (inMfaStep) startIdleTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [smsCode, codeSent]);

  // Clean up recaptcha and RL interval on unmount
  useEffect(() => () => { destroyRecaptcha(); clearRlInterval(); }, []);

  // ===== MFA bootstrap (after password step) =====
  async function beginMfaFromError(err: any) {
    if (isRateLimited()) {
      if (inMfaRef.current) {
        setBanner({ text: `Please wait ${rlSecondsLeft}s before requesting a new code.`, type: 'error' });
      }
      return;
    }
    const mResolver = getMultiFactorResolver(auth, err);
    setResolver(mResolver);

    try {
      await buildFreshRecaptcha();
      const hint = mResolver.hints[0] as PhoneMultiFactorInfo | undefined;
      const provider = new PhoneAuthProvider(auth);
      const id = await provider.verifyPhoneNumber(
        { multiFactorHint: hint, session: mResolver.session },
        window.recaptchaVerifier!
      );
      setVerificationId(id);
      setCodeSent(true);
      const masked = hint?.phoneNumber ? `…${hint.phoneNumber.slice(-4)}` : 'your phone';
      setBanner({ text: `We sent a code to ${masked}.`, type: 'info' });
      startIdleTimer();
      resetRateLimit();
    } catch (sendErr: any) {
      if (sendErr?.code === 'auth/too-many-requests') {
        bumpRateLimit();
      } else {
        setBanner({ text: sendErr?.message || 'Could not send the verification code.', type: 'error' });
      }
      throw sendErr;
    }
  }

  // ===== Email/password submit =====
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (emailErrors.length || passwordErrors.length) return;

    setBusy(true);
    setBanner({ text: '', type: 'info' });
    clearMfaState(); // leave RL intact across attempts by default

    try {
      const cred: UserCredential = await signInWithEmailAndPassword(auth, email, password);
      setBanner({ text: 'Login successful! Redirecting…', type: 'success' });
      setTimeout(() => navigate('/stablehand-welcome'), 800);
    } catch (err: any) {
      if (err?.code === 'auth/multi-factor-auth-required') {
        try { await beginMfaFromError(err); } catch { /* handled */ }
      } else if (err?.code === 'auth/too-many-requests') {
        bumpRateLimit();
      } else {
        setBanner({ text: 'Login failed. Check your email and password.', type: 'error' });
      }
    } finally {
      setBusy(false);
    }
  }

  // ===== (Re)send SMS code =====
  async function resendCodeInternal(auto: boolean) {
    if (isRateLimited()) {
      if (inMfaRef.current) {
        setBanner({ text: `Please wait ${rlSecondsLeft}s before requesting a new code.`, type: 'error' });
      }
      return;
    }
    // Try with current resolver/session first
    try {
      await buildFreshRecaptcha();
      const hint = resolver?.hints[0] as PhoneMultiFactorInfo | undefined;
      const provider = new PhoneAuthProvider(auth);
      const newId = await provider.verifyPhoneNumber(
        { multiFactorHint: hint, session: resolver!.session },
        window.recaptchaVerifier!
      );
      setVerificationId(newId);
      setCodeSent(true);
      setSmsCode('');
      setCodeAttempts(0);
      setBanner({ text: auto ? 'A new code was sent automatically.' : 'A new code was sent.', type: 'success' });
      startIdleTimer();
      resetRateLimit();
      return;
    } catch (err: any) {
      if (err?.code === 'auth/too-many-requests') {
        bumpRateLimit();
        return;
      }
      if (!SESSION_ERROR_CODES.has(err?.code)) throw err;
    }

    // Fallback: re-bootstrap resolver/session by replaying the password step
    const fresh = await retryBootstrapResolver();
    if (isRateLimited()) return;
    try {
      await buildFreshRecaptcha();
      const hint = fresh.hints[0] as PhoneMultiFactorInfo | undefined;
      const provider = new PhoneAuthProvider(auth);
      const newId = await provider.verifyPhoneNumber(
        { multiFactorHint: hint, session: fresh.session },
        window.recaptchaVerifier!
      );
      setResolver(fresh);
      setVerificationId(newId);
      setCodeSent(true);
      setSmsCode('');
      setCodeAttempts(0);
      setBanner({ text: auto ? 'A new code was sent automatically.' : 'A new code was sent.', type: 'success' });
      startIdleTimer();
      resetRateLimit();
    } catch (err: any) {
      if (err?.code === 'auth/too-many-requests') {
        bumpRateLimit();
      } else {
        setBanner({ text: err?.message || 'Failed to resend code.', type: 'error' });
      }
    }
  }

  async function retryBootstrapResolver(): Promise<MultiFactorResolver> {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setBanner({ text: 'Login successful! Redirecting…', type: 'success' });
      setTimeout(() => navigate('/stablehand-welcome'), 800);
      throw new Error('Unexpected success: MFA not required.');
    } catch (err: any) {
      if (err?.code === 'auth/multi-factor-auth-required') {
        return getMultiFactorResolver(auth, err);
      }
      resetToLogin('We need you to log in again.');
      throw err;
    }
  }

  // ===== Verify MFA code (SMS) =====
  async function handleVerify() {
    if (!resolver || !verificationId) return;
    if (busy) return;
    if (isRateLimited()) {
      if (inMfaRef.current) {
        setBanner({ text: `Please wait ${rlSecondsLeft}s before trying again.`, type: 'error' });
      }
      return;
    }

    setBusy(true);
    setBanner({ text: '', type: 'info' });

    try {
      const phoneCred = PhoneAuthProvider.credential(verificationId, smsCode.trim());
      const assertion = PhoneMultiFactorGenerator.assertion(phoneCred);
      await resolver.resolveSignIn(assertion);

      setBanner({ text: 'MFA successful! Redirecting…', type: 'success' });
      clearIdleTimers();
      setTimeout(() => navigate('/stablehand-welcome'), 800);
    } catch (err: any) {
      if (err?.code === 'auth/too-many-requests') {
        bumpRateLimit();
        return;
      }

      const next = codeAttempts + 1;
      setCodeAttempts(next);
      setSmsCode('');

      if (next >= MAX_CODE_ATTEMPTS) {
        if (ON_MAX_ATTEMPTS_ACTION === 'auto-resend') {
          await resendCodeInternal(true); // may start cooldown if rate-limited
        } else {
          resetToLogin('Too many incorrect codes. Please log in again.');
        }
      } else {
        setBanner({
          text: `The code is incorrect or expired. (${next}/${MAX_CODE_ATTEMPTS})`,
          type: 'error',
        });
        startIdleTimer();
      }
    } finally {
      setBusy(false);
    }
  }

  // ===== Manual resend button =====
  async function handleResend() {
    if (!resolver) return;
    if (busy) return;
    await resendCodeInternal(false);
  }

  // ===== Send to Email (passwordless email-link fallback) =====
  async function handleSendEmailLink() {
    if (busy) return;
    if (!email) {
      setBanner({ text: 'Enter your email above first, then tap “Send to Email”.', type: 'error' });
      return;
    }
    setBusy(true);
    try {
      clearMfaState();
      const actionCodeSettings = {
        url: `${window.location.origin}${EMAIL_LINK_FINISH_PATH}`,
        handleCodeInApp: true,
      };
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      setBanner({
        text: `We sent a secure sign-in link to ${email}. Open it on this device to finish.`,
        type: 'success',
      });
      resetRateLimit();
    } catch (err: any) {
      if (err?.code === 'auth/too-many-requests') {
        bumpRateLimit();
      } else {
        setBanner({ text: err?.message || 'Failed to send email link.', type: 'error' });
      }
    } finally {
      setBusy(false);
    }
  }

  // ===== Back to login =====
  function handleBackToLogin() {
    resetToLogin('Cancelled. You can try logging in again.');
  }

  const actionsDisabled = busy || (inMfaStep && isRateLimited());

  return (
    <div className="space-y-4">
      {!inMfaStep && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <EmailField
            email={email}
            setEmail={setEmail}
            setEmailErrors={setEmailErrors}
            errors={emailErrors}
          />
          <PasswordField
            password={password}
            setPassword={setPassword}
            setPasswordErrors={setPasswordErrors}
            errors={passwordErrors}
          />

          {banner.text && <Alert message={banner.text} type={banner.type} />}

          <Button type="submit" disabled={busy} className="w-full bg-blue-600 text-white">
            Log In
          </Button>
        </form>
      )}

      {inMfaStep && (
        <div className="space-y-4">
          <InputField
            name="smsCode"
            label="SMS Code"
            type="text"
            value={smsCode}
            onChange={(e) => setSmsCode(e.target.value)}
            placeholder="123456"
          />

          {banner.text && <Alert message={banner.text} type={banner.type} />}

          {isRateLimited() && (
            <div className="text-sm text-amber-600">
              Too many attempts. Please wait {rlSecondsLeft}s before trying again.
            </div>
          )}

          <div className="flex flex-wrap text-xs gap-2">
            <Button
              onClick={handleVerify}
              disabled={actionsDisabled || !smsCode.trim()}
              className="flex-1 bg-green-600 text-white"
            >
              Verify
            </Button>

            <Button
              type="button"
              onClick={handleResend}
              disabled={actionsDisabled}
              className="flex-1"
            >
              {codeSent ? 'Resend code (SMS)' : 'Send code (SMS)'}
            </Button>

            <Button
              type="button"
              onClick={handleSendEmailLink}
              disabled={actionsDisabled || !email}
              className="flex-1"
            >
              Send to Email
            </Button>

            <Button type="button" onClick={handleBackToLogin} className="flex-1">
              Back to login
            </Button>
          </div>

          <div className="text-xs text-gray-500">
            Attempts: {codeAttempts}/{MAX_CODE_ATTEMPTS}
            {' • '}
            Idle timeout: {Math.max(0, idleSecondsLeft)}s
          </div>
        </div>
      )}
    </div>
  );
}



// //4. 2025-08-11 — Robust reCAPTCHA lifecycle + auto-resend after 3 attempts
// // + cooldown handling for auth/too-many-requests + idle timeout + email-link fallback

// import React, { useEffect, useMemo, useRef, useState, FormEvent } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   signInWithEmailAndPassword,
//   PhoneAuthProvider,
//   PhoneMultiFactorGenerator,
//   getMultiFactorResolver,
//   type MultiFactorResolver,
//   RecaptchaVerifier,
//   type UserCredential,
//   type PhoneMultiFactorInfo,
//   sendSignInLinkToEmail,
// } from 'firebase/auth';
// import { auth } from '../../firebase/firebase';
// import EmailField from '../common/EmailField';
// import PasswordField from '../common/PasswordField';
// import InputField from '../common/InputField';
// import Button from '../common/Button';
// import Alert from '../common/Alert';

// declare global {
//   interface Window {
//     recaptchaVerifier?: RecaptchaVerifier;
//     recaptchaContainerEl?: HTMLDivElement | null;
//     grecaptcha?: any;
//   }
// }

// type Banner = { text: string; type: 'info' | 'success' | 'error' };

// // ---------- Behaviour knobs ----------
// const MAX_CODE_ATTEMPTS = 3;                 // tries allowed before policy kicks in
// const MFA_IDLE_TIMEOUT_MS = 2 * 60 * 1000;   // 2 minutes idle → back to login
// const EMAIL_LINK_FINISH_PATH = '/finish-email-signin';
// const ON_MAX_ATTEMPTS_ACTION: 'auto-resend' | 'reset-to-login' = 'auto-resend';

// // Rate-limit backoff (for auth/too-many-requests)
// const RL_BASE_SECONDS = 60;                  // start with 60s
// const RL_MAX_SECONDS  = 15 * 60;             // cap at 15 minutes
// // ------------------------------------

// // Error codes that often indicate stale session/recaptcha
// const SESSION_ERROR_CODES = new Set([
//   'auth/multi-factor-session-expired',
//   'auth/invalid-app-credential',
//   'auth/missing-app-credential',
//   'auth/captcha-check-failed',
//   'auth/expired-action-code',
// ]);

// export default function LoginForm(): JSX.Element {
//   const navigate = useNavigate();

//   // Email/password
//   const [email, setEmail] = useState('');
//   const [emailErrors, setEmailErrors] = useState<string[]>([]);
//   const [password, setPassword] = useState('');
//   const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

//   // MFA state
//   const [resolver, setResolver] = useState<MultiFactorResolver | null>(null);
//   const [verificationId, setVerificationId] = useState('');
//   const [smsCode, setSmsCode] = useState('');
//   const [codeSent, setCodeSent] = useState(false);
//   const [codeAttempts, setCodeAttempts] = useState(0);

//   // Idle timers
//   const idleTimeoutRef = useRef<number | null>(null);
//   const idleIntervalRef = useRef<number | null>(null);
//   const [idleSecondsLeft, setIdleSecondsLeft] = useState(Math.floor(MFA_IDLE_TIMEOUT_MS / 1000));

//   // Rate-limit state
//   const [rlLevel, setRlLevel] = useState(0);
//   const [rlUntil, setRlUntil] = useState<number>(0);           // epoch ms
//   const [rlSecondsLeft, setRlSecondsLeft] = useState<number>(0);
//   const rlIntervalRef = useRef<number | null>(null);

//   // UI
//   const [banner, setBanner] = useState<Banner>({ text: '', type: 'info' });
//   const [busy, setBusy] = useState(false);

//   // Are we rate-limited?
//   const now = () => Date.now();
//   const isRateLimited = () => rlUntil > now();

//   // We are in MFA step if we have either a resolver or a verificationId
//   const inMfaStep = useMemo(() => Boolean(resolver || verificationId), [resolver, verificationId]);

//   // ===== reCAPTCHA lifecycle (fresh container every time) =====
//   function destroyRecaptcha() {
//     try {
//       if (window.recaptchaVerifier?.clear) {
//         // @ts-ignore - clear() exists at runtime
//         window.recaptchaVerifier.clear();
//       }
//     } catch { /* noop */ }
//     try {
//       if (window.recaptchaContainerEl && window.recaptchaContainerEl.parentNode) {
//         window.recaptchaContainerEl.parentNode.removeChild(window.recaptchaContainerEl);
//       }
//     } catch { /* noop */ }
//     window.recaptchaVerifier = undefined;
//     window.recaptchaContainerEl = null;
//   }

//   async function buildFreshRecaptcha(): Promise<void> {
//     destroyRecaptcha();
//     const el = document.createElement('div');
//     el.style.display = 'none';
//     el.id = `recaptcha-${Date.now()}-${Math.random().toString(36).slice(2)}`;
//     document.body.appendChild(el);
//     window.recaptchaContainerEl = el;
//     window.recaptchaVerifier = new RecaptchaVerifier(auth, el, { size: 'invisible' });
//     await window.recaptchaVerifier.render();
//   }

//   // ===== Idle timers =====
//   function clearIdleTimers() {
//     if (idleTimeoutRef.current) {
//       window.clearTimeout(idleTimeoutRef.current);
//       idleTimeoutRef.current = null;
//     }
//     if (idleIntervalRef.current) {
//       window.clearInterval(idleIntervalRef.current);
//       idleIntervalRef.current = null;
//     }
//   }

//   function startIdleTimer() {
//     clearIdleTimers();
//     setIdleSecondsLeft(Math.floor(MFA_IDLE_TIMEOUT_MS / 1000));
//     idleTimeoutRef.current = window.setTimeout(() => {
//       resetToLogin('Session timed out. Please log in again.');
//     }, MFA_IDLE_TIMEOUT_MS) as unknown as number;
//     idleIntervalRef.current = window.setInterval(() => {
//       setIdleSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
//     }, 1000) as unknown as number;
//   }

//   // ===== Rate-limit cooldown =====
//   function clearRlInterval() {
//     if (rlIntervalRef.current) {
//       window.clearInterval(rlIntervalRef.current);
//       rlIntervalRef.current = null;
//     }
//   }
//   function startRateLimit(seconds: number) {
//     const until = now() + seconds * 1000;
//     setRlUntil(until);
//     setRlSecondsLeft(seconds);
//     clearRlInterval();
//     rlIntervalRef.current = window.setInterval(() => {
//       const left = Math.max(0, Math.ceil((until - now()) / 1000));
//       setRlSecondsLeft(left);
//       if (left <= 0) {
//         clearRlInterval();
//       }
//     }, 1000) as unknown as number;
//   }
//   function bumpRateLimit() {
//     const nextSeconds = Math.min(RL_BASE_SECONDS * Math.pow(2, rlLevel), RL_MAX_SECONDS);
//     setRlLevel((l) => Math.min(l + 1, 30));
//     startRateLimit(nextSeconds);
//     setBanner({
//       text: `Too many attempts. Please wait ${nextSeconds}s before trying again.`,
//       type: 'error',
//     });
//   }
//   function resetRateLimit() {
//     setRlLevel(0);
//     setRlUntil(0);
//     setRlSecondsLeft(0);
//     clearRlInterval();
//   }

//   // MFA state resets
//   function clearMfaState() {
//     setResolver(null);
//     setVerificationId('');
//     setSmsCode('');
//     setCodeSent(false);
//     setCodeAttempts(0);
//     clearIdleTimers();
//     destroyRecaptcha();
//   }

//   function resetToLogin(message?: string) {
//     clearMfaState();
//     setPassword('');
//     setBanner({ text: message ?? 'Returning to login…', type: 'info' });
//   }

//   // Manage idle timers on MFA step entry/exit
//   useEffect(() => {
//     if (inMfaStep) startIdleTimer(); else clearIdleTimers();
//     return () => clearIdleTimers();
//   }, [inMfaStep]);

//   // Nudge the idle timer on user activity within MFA
//   useEffect(() => {
//     if (inMfaStep) startIdleTimer();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [smsCode, codeSent]);

//   // Clean up recaptcha and RL interval on unmount
//   useEffect(() => () => { destroyRecaptcha(); clearRlInterval(); }, []);

//   // ===== MFA bootstrap (after password step) =====
//   async function beginMfaFromError(err: any) {
//     if (isRateLimited()) {
//       setBanner({ text: `Please wait ${rlSecondsLeft}s before requesting a new code.`, type: 'error' });
//       return;
//     }
//     const mResolver = getMultiFactorResolver(auth, err);
//     setResolver(mResolver);

//     try {
//       await buildFreshRecaptcha();
//       const hint = mResolver.hints[0] as PhoneMultiFactorInfo | undefined;
//       const provider = new PhoneAuthProvider(auth);
//       const id = await provider.verifyPhoneNumber(
//         { multiFactorHint: hint, session: mResolver.session },
//         window.recaptchaVerifier!
//       );
//       setVerificationId(id);
//       setCodeSent(true);
//       const masked = hint?.phoneNumber ? `…${hint.phoneNumber.slice(-4)}` : 'your phone';
//       setBanner({ text: `We sent a code to ${masked}.`, type: 'info' });
//       startIdleTimer();
//       resetRateLimit();
//     } catch (sendErr: any) {
//       if (sendErr?.code === 'auth/too-many-requests') {
//         bumpRateLimit();
//       } else {
//         setBanner({ text: sendErr?.message || 'Could not send the verification code.', type: 'error' });
//       }
//       throw sendErr;
//     }
//   }

//   // ===== Email/password submit =====
//   async function handleSubmit(e: FormEvent) {
//     e.preventDefault();
//     if (busy) return;
//     if (emailErrors.length || passwordErrors.length) return;

//     setBusy(true);
//     setBanner({ text: '', type: 'info' });
//     clearMfaState();

//     try {
//       const cred: UserCredential = await signInWithEmailAndPassword(auth, email, password);
//       setBanner({ text: 'Login successful! Redirecting…', type: 'success' });
//       setTimeout(() => navigate('/stablehand-welcome'), 800);
//     } catch (err: any) {
//       if (err?.code === 'auth/multi-factor-auth-required') {
//         try {
//           await beginMfaFromError(err);
//         } catch {
//           // already handled
//         }
//       } else if (err?.code === 'auth/too-many-requests') {
//         bumpRateLimit();
//       } else {
//         setBanner({ text: 'Login failed. Check your email and password.', type: 'error' });
//       }
//     } finally {
//       setBusy(false);
//     }
//   }

//   // ===== (Re)send SMS code =====
//   async function resendCodeInternal(auto: boolean) {
//     if (isRateLimited()) {
//       setBanner({ text: `Please wait ${rlSecondsLeft}s before requesting a new code.`, type: 'error' });
//       return;
//     }
//     // Try with current resolver/session first
//     try {
//       await buildFreshRecaptcha();
//       const hint = resolver?.hints[0] as PhoneMultiFactorInfo | undefined;
//       const provider = new PhoneAuthProvider(auth);
//       const newId = await provider.verifyPhoneNumber(
//         { multiFactorHint: hint, session: resolver!.session },
//         window.recaptchaVerifier!
//       );
//       setVerificationId(newId);
//       setCodeSent(true);
//       setSmsCode('');
//       setCodeAttempts(0);
//       setBanner({ text: auto ? 'A new code was sent automatically.' : 'A new code was sent.', type: 'success' });
//       startIdleTimer();
//       resetRateLimit();
//       return;
//     } catch (err: any) {
//       if (err?.code === 'auth/too-many-requests') {
//         bumpRateLimit();
//         return;
//       }
//       if (!SESSION_ERROR_CODES.has(err?.code)) {
//         throw err;
//       }
//     }

//     // Fallback: re-bootstrap resolver/session by replaying the password step
//     const fresh = await retryBootstrapResolver();
//     if (isRateLimited()) return; // guard after replay
//     try {
//       await buildFreshRecaptcha();
//       const hint = fresh.hints[0] as PhoneMultiFactorInfo | undefined;
//       const provider = new PhoneAuthProvider(auth);
//       const newId = await provider.verifyPhoneNumber(
//         { multiFactorHint: hint, session: fresh.session },
//         window.recaptchaVerifier!
//       );
//       setResolver(fresh);
//       setVerificationId(newId);
//       setCodeSent(true);
//       setSmsCode('');
//       setCodeAttempts(0);
//       setBanner({ text: auto ? 'A new code was sent automatically.' : 'A new code was sent.', type: 'success' });
//       startIdleTimer();
//       resetRateLimit();
//     } catch (err: any) {
//       if (err?.code === 'auth/too-many-requests') {
//         bumpRateLimit();
//       } else {
//         setBanner({ text: err?.message || 'Failed to resend code.', type: 'error' });
//       }
//     }
//   }

//   async function retryBootstrapResolver(): Promise<MultiFactorResolver> {
//     try {
//       await signInWithEmailAndPassword(auth, email, password);
//       setBanner({ text: 'Login successful! Redirecting…', type: 'success' });
//       setTimeout(() => navigate('/stablehand-welcome'), 800);
//       throw new Error('Unexpected success: MFA not required.');
//     } catch (err: any) {
//       if (err?.code === 'auth/multi-factor-auth-required') {
//         return getMultiFactorResolver(auth, err);
//       }
//       resetToLogin('We need you to log in again.');
//       throw err;
//     }
//   }

//   // ===== Verify MFA code (SMS) =====
//   async function handleVerify() {
//     if (!resolver || !verificationId) return;
//     if (busy) return;
//     if (isRateLimited()) {
//       setBanner({ text: `Please wait ${rlSecondsLeft}s before trying again.`, type: 'error' });
//       return;
//     }

//     setBusy(true);
//     setBanner({ text: '', type: 'info' });

//     try {
//       const phoneCred = PhoneAuthProvider.credential(verificationId, smsCode.trim());
//       const assertion = PhoneMultiFactorGenerator.assertion(phoneCred);
//       await resolver.resolveSignIn(assertion);

//       setBanner({ text: 'MFA successful! Redirecting…', type: 'success' });
//       clearIdleTimers();
//       setTimeout(() => navigate('/stablehand-welcome'), 800);
//     } catch (err: any) {
//       if (err?.code === 'auth/too-many-requests') {
//         bumpRateLimit();
//         return;
//       }

//       const next = codeAttempts + 1;
//       setCodeAttempts(next);
//       setSmsCode('');

//       if (next >= MAX_CODE_ATTEMPTS) {
//         if (ON_MAX_ATTEMPTS_ACTION === 'auto-resend') {
//           await resendCodeInternal(true); // may start cooldown if rate-limited
//         } else {
//           resetToLogin('Too many incorrect codes. Please log in again.');
//         }
//       } else {
//         setBanner({
//           text: `The code is incorrect or expired. (${next}/${MAX_CODE_ATTEMPTS})`,
//           type: 'error',
//         });
//         startIdleTimer();
//       }
//     } finally {
//       setBusy(false);
//     }
//   }

//   // ===== Manual resend button =====
//   async function handleResend() {
//     if (!resolver) return;
//     if (busy) return;
//     await resendCodeInternal(false);
//   }

//   // ===== Send to Email (passwordless email-link fallback) =====
//   async function handleSendEmailLink() {
//     if (busy) return;
//     if (!email) {
//       setBanner({ text: 'Enter your email above first, then tap “Send to Email”.', type: 'error' });
//       return;
//     }
//     setBusy(true);
//     try {
//       clearMfaState();
//       const actionCodeSettings = {
//         url: `${window.location.origin}${EMAIL_LINK_FINISH_PATH}`,
//         handleCodeInApp: true,
//       };
//       await sendSignInLinkToEmail(auth, email, actionCodeSettings);
//       window.localStorage.setItem('emailForSignIn', email);
//       setBanner({
//         text: `We sent a secure sign-in link to ${email}. Open it on this device to finish.`,
//         type: 'success',
//       });
//       resetRateLimit();
//     } catch (err: any) {
//       if (err?.code === 'auth/too-many-requests') {
//         bumpRateLimit();
//       } else {
//         setBanner({ text: err?.message || 'Failed to send email link.', type: 'error' });
//       }
//     } finally {
//       setBusy(false);
//     }
//   }

//   // ===== Back to login =====
//   function handleBackToLogin() {
//     resetToLogin('Cancelled. You can try logging in again.');
//   }

//   const actionsDisabled = busy || isRateLimited();

//   return (
//     <div className="space-y-4">
//       {!inMfaStep && (
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <EmailField
//             email={email}
//             setEmail={setEmail}
//             setEmailErrors={setEmailErrors}
//             errors={emailErrors}
//           />
//           <PasswordField
//             password={password}
//             setPassword={setPassword}
//             setPasswordErrors={setPasswordErrors}
//             errors={passwordErrors}
//           />

//           {banner.text && <Alert message={banner.text} type={banner.type} />}

//           <Button type="submit" disabled={busy} className="w-full bg-blue-600 text-white">
//             Log In
//           </Button>
//         </form>
//       )}

//       {inMfaStep && (
//         <div className="space-y-4">
//           <InputField
//             name="smsCode"
//             label="SMS Code"
//             type="text"
//             value={smsCode}
//             onChange={(e) => setSmsCode(e.target.value)}
//             placeholder="123456"
//           />

//           {banner.text && <Alert message={banner.text} type={banner.type} />}

//           {isRateLimited() && (
//             <div className="text-sm text-amber-600">
//               Too many attempts. Please wait {rlSecondsLeft}s before trying again.
//             </div>
//           )}

//           <div className="flex flex-wrap gap-2">
//             <Button
//               onClick={handleVerify}
//               disabled={actionsDisabled || !smsCode.trim()}
//               className="flex-1 bg-green-600 text-white"
//             >
//               Verify
//             </Button>

//             <Button
//               type="button"
//               onClick={handleResend}
//               disabled={actionsDisabled}
//               className="flex-1"
//             >
//               {codeSent ? 'Resend code (SMS)' : 'Send code (SMS)'}
//             </Button>

//             <Button
//               type="button"
//               onClick={handleSendEmailLink}
//               disabled={actionsDisabled || !email}
//               className="flex-1"
//             >
//               Send to Email
//             </Button>

//             <Button type="button" onClick={handleBackToLogin} className="flex-1">
//               Back to login
//             </Button>
//           </div>

//           <div className="text-xs text-gray-500">
//             Attempts: {codeAttempts}/{MAX_CODE_ATTEMPTS}
//             {' • '}
//             Idle timeout: {Math.max(0, idleSecondsLeft)}s
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


// // 3.2025-08-11 — Robust reCAPTCHA lifecycle (fresh container each send), auto-resend after 3 attempts,
// // idle timeout to login, and email-link fallback.

// import React, { useEffect, useMemo, useRef, useState, FormEvent } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   signInWithEmailAndPassword,
//   PhoneAuthProvider,
//   PhoneMultiFactorGenerator,
//   getMultiFactorResolver,
//   type MultiFactorResolver,
//   RecaptchaVerifier,
//   type UserCredential,
//   type PhoneMultiFactorInfo,
//   sendSignInLinkToEmail,
// } from 'firebase/auth';
// import { auth } from '../../firebase/firebase';
// import EmailField from '../common/EmailField';
// import PasswordField from '../common/PasswordField';
// import InputField from '../common/InputField';
// import Button from '../common/Button';
// import Alert from '../common/Alert';

// declare global {
//   interface Window {
//     recaptchaVerifier?: RecaptchaVerifier;
//     recaptchaContainerEl?: HTMLDivElement | null;
//     grecaptcha?: any;
//   }
// }

// type Banner = { text: string; type: 'info' | 'success' | 'error' };

// // ---------- Behaviour knobs ----------
// const MAX_CODE_ATTEMPTS = 3;                 // tries allowed before policy kicks in
// const MFA_IDLE_TIMEOUT_MS = 2 * 60 * 1000;   // 2 minutes idle → back to login
// const EMAIL_LINK_FINISH_PATH = '/finish-email-signin';
// // choose: 'auto-resend' (default) or 'reset-to-login'
// const ON_MAX_ATTEMPTS_ACTION: 'auto-resend' | 'reset-to-login' = 'auto-resend';
// // ------------------------------------

// // Error codes that often indicate stale session/recaptcha
// const SESSION_ERROR_CODES = new Set([
//   'auth/multi-factor-session-expired',
//   'auth/invalid-app-credential',
//   'auth/missing-app-credential',
//   'auth/captcha-check-failed',
//   'auth/expired-action-code',
// ]);

// export default function LoginForm(): JSX.Element {
//   const navigate = useNavigate();

//   // Email/password
//   const [email, setEmail] = useState('');
//   const [emailErrors, setEmailErrors] = useState<string[]>([]);
//   const [password, setPassword] = useState('');
//   const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

//   // MFA state
//   const [resolver, setResolver] = useState<MultiFactorResolver | null>(null);
//   const [verificationId, setVerificationId] = useState('');
//   const [smsCode, setSmsCode] = useState('');
//   const [codeSent, setCodeSent] = useState(false);
//   const [codeAttempts, setCodeAttempts] = useState(0);

//   // Idle timers
//   const idleTimeoutRef = useRef<number | null>(null);
//   const idleIntervalRef = useRef<number | null>(null);
//   const [idleSecondsLeft, setIdleSecondsLeft] = useState(Math.floor(MFA_IDLE_TIMEOUT_MS / 1000));

//   // UI
//   const [banner, setBanner] = useState<Banner>({ text: '', type: 'info' });
//   const [busy, setBusy] = useState(false);

//   // We are in MFA step if we have either a resolver or a verificationId
//   const inMfaStep = useMemo(() => Boolean(resolver || verificationId), [resolver, verificationId]);

//   // ===== reCAPTCHA lifecycle (fresh container every time) =====
//   function destroyRecaptcha() {
//     try {
//       // Clear Firebase wrapper if present
//       if (window.recaptchaVerifier?.clear) {
//         // @ts-ignore - clear() is available at runtime
//         window.recaptchaVerifier.clear();
//       }
//     } catch { /* noop */ }
//     try {
//       // Remove the DOM node we created
//       if (window.recaptchaContainerEl && window.recaptchaContainerEl.parentNode) {
//         window.recaptchaContainerEl.parentNode.removeChild(window.recaptchaContainerEl);
//       }
//     } catch { /* noop */ }
//     window.recaptchaVerifier = undefined;
//     window.recaptchaContainerEl = null;
//   }

//   async function buildFreshRecaptcha(): Promise<void> {
//     // Always start clean to avoid "already rendered in this element"
//     destroyRecaptcha();

//     // Create a detached, hidden container so we never collide with an existing element
//     const el = document.createElement('div');
//     el.style.display = 'none';
//     el.id = `recaptcha-${Date.now()}-${Math.random().toString(36).slice(2)}`;
//     document.body.appendChild(el);
//     window.recaptchaContainerEl = el;

//     window.recaptchaVerifier = new RecaptchaVerifier(auth, el, { size: 'invisible' });
//     await window.recaptchaVerifier.render();
//   }

//   // ===== Idle timers =====
//   function clearIdleTimers() {
//     if (idleTimeoutRef.current) {
//       window.clearTimeout(idleTimeoutRef.current);
//       idleTimeoutRef.current = null;
//     }
//     if (idleIntervalRef.current) {
//       window.clearInterval(idleIntervalRef.current);
//       idleIntervalRef.current = null;
//     }
//   }

//   function startIdleTimer() {
//     clearIdleTimers();
//     setIdleSecondsLeft(Math.floor(MFA_IDLE_TIMEOUT_MS / 1000));
//     idleTimeoutRef.current = window.setTimeout(() => {
//       resetToLogin('Session timed out. Please log in again.');
//     }, MFA_IDLE_TIMEOUT_MS) as unknown as number;
//     idleIntervalRef.current = window.setInterval(() => {
//       setIdleSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
//     }, 1000) as unknown as number;
//   }

//   function clearMfaState() {
//     setResolver(null);
//     setVerificationId('');
//     setSmsCode('');
//     setCodeSent(false);
//     setCodeAttempts(0);
//     clearIdleTimers();
//     destroyRecaptcha();
//   }

//   function resetToLogin(message?: string) {
//     clearMfaState();
//     setPassword(''); // scrub password
//     setBanner({ text: message ?? 'Returning to login…', type: 'info' });
//     // If your login is a separate route, uncomment:
//     // navigate('/login');
//   }

//   // Manage idle timers on MFA step entry/exit
//   useEffect(() => {
//     if (inMfaStep) startIdleTimer();
//     else clearIdleTimers();
//     return () => clearIdleTimers();
//   }, [inMfaStep]);

//   // Nudge the idle timer on user activity within MFA
//   useEffect(() => {
//     if (inMfaStep) startIdleTimer();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [smsCode, codeSent]);

//   // Clean up recaptcha on unmount
//   useEffect(() => () => destroyRecaptcha(), []);

//   // ===== MFA bootstrap (after password step) =====
//   async function beginMfaFromError(err: any) {
//     const mResolver = getMultiFactorResolver(auth, err);
//     setResolver(mResolver);

//     await buildFreshRecaptcha();
//     const hint = mResolver.hints[0] as PhoneMultiFactorInfo | undefined;
//     const provider = new PhoneAuthProvider(auth);

//     const id = await provider.verifyPhoneNumber(
//       { multiFactorHint: hint, session: mResolver.session },
//       window.recaptchaVerifier!
//     );

//     setVerificationId(id);
//     setCodeSent(true);

//     const masked = hint?.phoneNumber ? `…${hint.phoneNumber.slice(-4)}` : 'your phone';
//     setBanner({ text: `We sent a code to ${masked}.`, type: 'info' });
//     startIdleTimer();
//   }

//   // ===== Email/password submit =====
//   async function handleSubmit(e: FormEvent) {
//     e.preventDefault();
//     if (busy) return;
//     if (emailErrors.length || passwordErrors.length) return;

//     setBusy(true);
//     setBanner({ text: '', type: 'info' });
//     clearMfaState();

//     try {
//       const cred: UserCredential = await signInWithEmailAndPassword(auth, email, password);
//       setBanner({ text: 'Login successful! Redirecting…', type: 'success' });
//       setTimeout(() => navigate('/stablehand-welcome'), 800);
//     } catch (err: any) {
//       if (err?.code === 'auth/multi-factor-auth-required') {
//         try {
//           await beginMfaFromError(err);
//         } catch (mfaErr: any) {
//           setBanner({
//             text: mfaErr?.message || 'Could not send the verification code. Please try again.',
//             type: 'error',
//           });
//           clearMfaState();
//         }
//       } else {
//         setBanner({ text: 'Login failed. Check your email and password.', type: 'error' });
//       }
//     } finally {
//       setBusy(false);
//     }
//   }

//   // ===== (Re)send SMS code =====
//   async function resendCodeInternal(auto: boolean) {
//     // Try with current resolver/session first
//     try {
//       await buildFreshRecaptcha();
//       const hint = resolver?.hints[0] as PhoneMultiFactorInfo | undefined;
//       const provider = new PhoneAuthProvider(auth);
//       const newId = await provider.verifyPhoneNumber(
//         { multiFactorHint: hint, session: resolver!.session },
//         window.recaptchaVerifier!
//       );
//       setVerificationId(newId);
//       setCodeSent(true);
//       setSmsCode('');
//       setCodeAttempts(0);
//       setBanner({ text: auto ? 'A new code was sent automatically.' : 'A new code was sent.', type: 'success' });
//       startIdleTimer();
//       return;
//     } catch (err: any) {
//       if (!SESSION_ERROR_CODES.has(err?.code)) throw err;
//       // else fall through and rebuild resolver below
//     }

//     // Fallback: get a fresh resolver/session by replaying the password step
//     const fresh = await retryBootstrapResolver();
//     await buildFreshRecaptcha();
//     const hint = fresh.hints[0] as PhoneMultiFactorInfo | undefined;
//     const provider = new PhoneAuthProvider(auth);
//     const newId = await provider.verifyPhoneNumber(
//       { multiFactorHint: hint, session: fresh.session },
//       window.recaptchaVerifier!
//     );
//     setResolver(fresh);
//     setVerificationId(newId);
//     setCodeSent(true);
//     setSmsCode('');
//     setCodeAttempts(0);
//     setBanner({ text: auto ? 'A new code was sent automatically.' : 'A new code was sent.', type: 'success' });
//     startIdleTimer();
//   }

//   async function retryBootstrapResolver(): Promise<MultiFactorResolver> {
//     try {
//       await signInWithEmailAndPassword(auth, email, password);
//       // If it actually signs in without MFA, we’re done.
//       setBanner({ text: 'Login successful! Redirecting…', type: 'success' });
//       setTimeout(() => navigate('/stablehand-welcome'), 800);
//       throw new Error('Unexpected success: MFA not required.'); // stop auto-resend path
//     } catch (err: any) {
//       if (err?.code === 'auth/multi-factor-auth-required') {
//         return getMultiFactorResolver(auth, err);
//       }
//       // If password is wrong or user changed, abort to login
//       resetToLogin('We need you to log in again.');
//       throw err;
//     }
//   }

//   // ===== Verify MFA code (SMS) =====
//   async function handleVerify() {
//     if (!resolver || !verificationId) return;
//     if (busy) return;

//     setBusy(true);
//     setBanner({ text: '', type: 'info' });

//     try {
//       const phoneCred = PhoneAuthProvider.credential(verificationId, smsCode.trim());
//       const assertion = PhoneMultiFactorGenerator.assertion(phoneCred);
//       await resolver.resolveSignIn(assertion);

//       setBanner({ text: 'MFA successful! Redirecting…', type: 'success' });
//       clearIdleTimers();
//       setTimeout(() => navigate('/stablehand-welcome'), 800);
//     } catch (err: any) {
//       const next = codeAttempts + 1;
//       setCodeAttempts(next);
//       setSmsCode('');

//       if (next >= MAX_CODE_ATTEMPTS) {
//         if (ON_MAX_ATTEMPTS_ACTION === 'auto-resend') {
//           try {
//             await resendCodeInternal(true); // auto, no click
//           } catch (resendErr: any) {
//             setBanner({ text: resendErr?.message || 'Failed to auto-resend a new code.', type: 'error' });
//           }
//         } else {
//           resetToLogin('Too many incorrect codes. Please log in again.');
//         }
//       } else {
//         setBanner({
//           text: `The code is incorrect or expired. (${next}/${MAX_CODE_ATTEMPTS})`,
//           type: 'error',
//         });
//         startIdleTimer();
//       }
//     } finally {
//       setBusy(false);
//     }
//   }

//   // ===== Manual resend button =====
//   async function handleResend() {
//     if (!resolver) return;
//     if (busy) return;
//     setBusy(true);
//     try {
//       await resendCodeInternal(false);
//     } catch (err: any) {
//       setBanner({ text: err?.message || 'Failed to resend code. Please try again.', type: 'error' });
//     } finally {
//       setBusy(false);
//     }
//   }

//   // ===== Send to Email (passwordless email-link fallback) =====
//   async function handleSendEmailLink() {
//     if (busy) return;
//     if (!email) {
//       setBanner({ text: 'Enter your email above first, then tap “Send to Email”.', type: 'error' });
//       return;
//     }
//     setBusy(true);
//     try {
//       // Cancel the MFA flow and pivot to email-link sign-in
//       clearMfaState();

//       const actionCodeSettings = {
//         url: `${window.location.origin}${EMAIL_LINK_FINISH_PATH}`,
//         handleCodeInApp: true,
//       };

//       await sendSignInLinkToEmail(auth, email, actionCodeSettings);
//       window.localStorage.setItem('emailForSignIn', email);

//       setBanner({
//         text: `We sent a secure sign-in link to ${email}. Open it on this device to finish.`,
//         type: 'success',
//       });
//     } catch (err: any) {
//       setBanner({ text: err?.message || 'Failed to send email link.', type: 'error' });
//     } finally {
//       setBusy(false);
//     }
//   }

//   // ===== Back to login =====
//   function handleBackToLogin() {
//     resetToLogin('Cancelled. You can try logging in again.');
//   }

//   return (
//     <div className="space-y-4">
//       {!inMfaStep && (
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <EmailField
//             email={email}
//             setEmail={setEmail}
//             setEmailErrors={setEmailErrors}
//             errors={emailErrors}
//           />
//           <PasswordField
//             password={password}
//             setPassword={setPassword}
//             setPasswordErrors={setPasswordErrors}
//             errors={passwordErrors}
//           />

//           {banner.text && <Alert message={banner.text} type={banner.type} />}

//           <Button type="submit" disabled={busy} className="w-full bg-blue-600 text-white">
//             Log In
//           </Button>
//         </form>
//       )}

//       {/* We no longer use a fixed in-DOM recaptcha container.
//           A fresh, hidden container is created/removed dynamically per send. */}

//       {inMfaStep && (
//         <div className="space-y-4">
//           <InputField
//             name="smsCode"
//             label="SMS Code"
//             type="text"
//             value={smsCode}
//             onChange={(e) => setSmsCode(e.target.value)}
//             placeholder="123456"
//           />

//           {banner.text && <Alert message={banner.text} type={banner.type} />}

//           <div className="flex flex-wrap text-xs gap-2">
//             <Button
//               onClick={handleVerify}
//               disabled={busy || !smsCode.trim()}
//               className="flex-1 bg-green-600 text-white"
//             >
//               Verify
//             </Button>

//             <Button
//               type="button"
//               onClick={handleResend}
//               disabled={busy}
//               className="flex-1"
//             >
//               {codeSent ? 'Resend code (SMS)' : 'Send code (SMS)'}
//             </Button>

//             <Button
//               type="button"
//               onClick={handleSendEmailLink}
//               disabled={busy || !email}
//               className="flex-1"
//             >
//               Send to Email
//             </Button>

//             <Button type="button" onClick={handleBackToLogin} className="flex-1">
//               Back to login
//             </Button>
//           </div>

//           <div className="text-xs text-gray-500">
//             Attempts: {codeAttempts}/{MAX_CODE_ATTEMPTS}
//             {' • '}
//             Idle timeout: {Math.max(0, idleSecondsLeft)}s
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


// // 2.2025-08-11 — login with SMS MFA + email-link fallback (“Send to Email”)

// import React, { useEffect, useMemo, useRef, useState, FormEvent } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   signInWithEmailAndPassword,
//   PhoneAuthProvider,
//   PhoneMultiFactorGenerator,
//   getMultiFactorResolver,
//   type MultiFactorResolver,
//   RecaptchaVerifier,
//   type UserCredential,
//   type PhoneMultiFactorInfo,
//   sendSignInLinkToEmail,
// } from 'firebase/auth';
// import { auth } from '../../firebase/firebase';
// import EmailField from '../common/EmailField';
// import PasswordField from '../common/PasswordField';
// import InputField from '../common/InputField';
// import Button from '../common/Button';
// import Alert from '../common/Alert';

// declare global {
//   interface Window {
//     recaptchaVerifier?: RecaptchaVerifier;
//     grecaptcha?: any;
//   }
// }

// type Banner = { text: string; type: 'info' | 'success' | 'error' };

// // ---------- Behaviour knobs ----------
// const MAX_CODE_ATTEMPTS = 3;                 // 3 tries then back to login
// const MFA_IDLE_TIMEOUT_MS = 2 * 60 * 1000;   // 2 minutes idle → back to login
// // For email-link, must match your hosting origin and routing
// const EMAIL_LINK_FINISH_PATH = '/finish-email-signin';
// // ------------------------------------

// export default function LoginForm(): JSX.Element {
//   const navigate = useNavigate();

//   // Email/password
//   const [email, setEmail] = useState('');
//   const [emailErrors, setEmailErrors] = useState<string[]>([]);
//   const [password, setPassword] = useState('');
//   const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

//   // MFA state
//   const [resolver, setResolver] = useState<MultiFactorResolver | null>(null);
//   const [verificationId, setVerificationId] = useState('');
//   const [smsCode, setSmsCode] = useState('');
//   const [codeSent, setCodeSent] = useState(false);
//   const [codeAttempts, setCodeAttempts] = useState(0);

//   // Timers
//   const idleTimerRef = useRef<number | null>(null);

//   // UI
//   const [banner, setBanner] = useState<Banner>({ text: '', type: 'info' });
//   const [busy, setBusy] = useState(false);

//   // In MFA step if we have either a resolver or a verificationId
//   const inMfaStep = useMemo(() => Boolean(resolver || verificationId), [resolver, verificationId]);

//   // ---- Helpers ----
//   async function ensureRecaptcha() {
//     if (!window.recaptchaVerifier) {
//       window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
//       await window.recaptchaVerifier.render();
//       return;
//     }
//     const widgetId = await window.recaptchaVerifier.render();
//     if (window.grecaptcha?.reset) window.grecaptcha.reset(widgetId);
//   }

//   function clearIdleTimer() {
//     if (idleTimerRef.current) {
//       window.clearTimeout(idleTimerRef.current);
//       idleTimerRef.current = null;
//     }
//   }

//   function startIdleTimer() {
//     clearIdleTimer();
//     idleTimerRef.current = window.setTimeout(() => {
//       resetToLogin('Session timed out. Please log in again.');
//     }, MFA_IDLE_TIMEOUT_MS) as unknown as number;
//   }

//   function clearMfaState() {
//     setResolver(null);
//     setVerificationId('');
//     setSmsCode('');
//     setCodeSent(false);
//     setCodeAttempts(0);
//     clearIdleTimer();
//   }

//   function resetToLogin(message?: string) {
//     clearMfaState();
//     setPassword('');
//     setBanner({ text: message ?? 'Returning to login…', type: 'info' });
//     // If login lives at this component, clearing state is enough.
//     // If you have a dedicated /login route, you can navigate('/login');
//   }

//   // When entering MFA step, (re)start idle timer
//   useEffect(() => {
//     if (inMfaStep) {
//       startIdleTimer();
//     } else {
//       clearIdleTimer();
//     }
//     return () => clearIdleTimer();
//   }, [inMfaStep]);

//   useEffect(() => {
//     if (inMfaStep) startIdleTimer();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [smsCode, codeSent]);

//   // -------- EMAIL/PASSWORD SUBMIT --------
//   async function handleSubmit(e: FormEvent) {
//     e.preventDefault();
//     if (busy) return;
//     if (emailErrors.length || passwordErrors.length) return;

//     setBusy(true);
//     setBanner({ text: '', type: 'info' });
//     clearMfaState();

//     try {
//       const cred: UserCredential = await signInWithEmailAndPassword(auth, email, password);

//       // If no MFA is required, go straight in.
//       setBanner({ text: 'Login successful! Redirecting…', type: 'success' });
//       setTimeout(() => navigate('/stablehand-welcome'), 800);
//       return;
//     } catch (err: any) {
//       // If MFA is required, Firebase throws auth/multi-factor-auth-required
//       if (err?.code === 'auth/multi-factor-auth-required') {
//         try {
//           const mResolver = getMultiFactorResolver(auth, err);
//           setResolver(mResolver);

//           await ensureRecaptcha();
//           const hint = mResolver.hints[0] as PhoneMultiFactorInfo | undefined;
//           const provider = new PhoneAuthProvider(auth);

//           const id = await provider.verifyPhoneNumber(
//             { multiFactorHint: hint, session: mResolver.session },
//             window.recaptchaVerifier!
//           );

//           setVerificationId(id);
//           setCodeSent(true);

//           const masked = hint?.phoneNumber ? `…${hint.phoneNumber.slice(-4)}` : 'your phone';
//           setBanner({ text: `We sent a code to ${masked}.`, type: 'info' });
//           startIdleTimer();
//           return;
//         } catch (mfaErr: any) {
//           setBanner({
//             text: mfaErr?.message || 'Could not send the verification code. Please try again.',
//             type: 'error',
//           });
//           clearMfaState();
//           return;
//         }
//       }

//       // Any other login failure
//       setBanner({ text: 'Login failed. Check your email and password.', type: 'error' });
//     } finally {
//       setBusy(false);
//     }
//   }

//   // -------- VERIFY MFA CODE (SMS) --------
//   async function handleVerify() {
//     if (!resolver || !verificationId) return;
//     if (busy) return;

//     setBusy(true);
//     setBanner({ text: '', type: 'info' });

//     try {
//       const phoneCred = PhoneAuthProvider.credential(verificationId, smsCode.trim());
//       const assertion = PhoneMultiFactorGenerator.assertion(phoneCred);
//       await resolver.resolveSignIn(assertion);

//       setBanner({ text: 'MFA successful! Redirecting…', type: 'success' });
//       clearIdleTimer();
//       setTimeout(() => navigate('/stablehand-welcome'), 800);
//     } catch (err: any) {
//       const next = codeAttempts + 1;
//       setCodeAttempts(next);
//       setSmsCode('');

//       if (err?.code === 'auth/invalid-verification-code' || err?.code === 'auth/argument-error') {
//         if (next >= MAX_CODE_ATTEMPTS) {
//           resetToLogin('Too many incorrect codes. Please log in again.');
//         } else {
//           setBanner({
//             text: `The code is incorrect or expired. (${next}/${MAX_CODE_ATTEMPTS})`,
//             type: 'error',
//           });
//           startIdleTimer();
//         }
//       } else {
//         setBanner({ text: err?.message || 'Verification failed. Please try again.', type: 'error' });
//         startIdleTimer();
//       }
//     } finally {
//       setBusy(false);
//     }
//   }

//   // -------- RESEND MFA CODE (SMS) --------
//   async function handleResend() {
//     if (!resolver) return;
//     if (busy) return;

//     setBusy(true);
//     try {
//       await ensureRecaptcha();
//       const hint = resolver.hints[0] as PhoneMultiFactorInfo | undefined;
//       const provider = new PhoneAuthProvider(auth);
//       const newId = await provider.verifyPhoneNumber(
//         { multiFactorHint: hint, session: resolver.session },
//         window.recaptchaVerifier!
//       );

//       setVerificationId(newId);
//       setCodeSent(true);
//       setSmsCode('');
//       setCodeAttempts(0);
//       setBanner({ text: 'A new code was sent.', type: 'success' });
//       startIdleTimer();
//     } catch (err: any) {
//       setBanner({ text: err?.message || 'Failed to resend code. Please try again.', type: 'error' });
//     } finally {
//       setBusy(false);
//     }
//   }

//   // -------- SEND TO EMAIL (passwordless email-link fallback) --------
//   async function handleSendEmailLink() {
//     if (busy) return;
//     if (!email) {
//       setBanner({ text: 'Enter your email above first, then tap “Send to Email”.', type: 'error' });
//       return;
//     }
//     setBusy(true);
//     try {
//       // Cancel the MFA flow and pivot to email-link sign-in
//       clearMfaState();

//       const actionCodeSettings = {
//         url: `${window.location.origin}${EMAIL_LINK_FINISH_PATH}`,
//         handleCodeInApp: true,
//       };

//       await sendSignInLinkToEmail(auth, email, actionCodeSettings);
//       // Persist email for completion screen convenience
//       window.localStorage.setItem('emailForSignIn', email);

//       setBanner({
//         text: `We sent a secure sign-in link to ${email}. Open it on this device to finish.`,
//         type: 'success',
//       });
//     } catch (err: any) {
//       setBanner({ text: err?.message || 'Failed to send email link.', type: 'error' });
//     } finally {
//       setBusy(false);
//     }
//   }

//   // -------- BACK TO LOGIN (cancel MFA) --------
//   function handleBackToLogin() {
//     resetToLogin('Cancelled. You can try logging in again.');
//   }

//   return (
//     <div className="space-y-4">
//       {!inMfaStep && (
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <EmailField
//             email={email}
//             setEmail={setEmail}
//             setEmailErrors={setEmailErrors}
//             errors={emailErrors}
//           />
//           <PasswordField
//             password={password}
//             setPassword={setPassword}
//             setPasswordErrors={setPasswordErrors}
//             errors={passwordErrors}
//           />

//           {banner.text && <Alert message={banner.text} type={banner.type} />}

//           <Button type="submit" disabled={busy} className="w-full bg-blue-600 text-white">
//             Log In
//           </Button>
//         </form>
//       )}

//       {/* reCAPTCHA container – managed by ensureRecaptcha() */}
//       <div id="recaptcha-container" />

//       {inMfaStep && (
//         <div className="space-y-4">
//           <InputField
//             name="smsCode"
//             label="SMS Code"
//             type="text"
//             value={smsCode}
//             onChange={(e) => setSmsCode(e.target.value)}
//             placeholder="123456"
//           />

//           {banner.text && <Alert message={banner.text} type={banner.type} />}

//           <div className="flex flex-wrap text-xs gap-2">
//             <Button
//               onClick={handleVerify}
//               disabled={busy || !smsCode.trim()}
//               className="flex-1 bg-green-600 text-white"
//             >
//               Verify
//             </Button>

//             <Button
//               type="button"
//               onClick={handleResend}
//               disabled={busy}
//               className="flex-1"
//             >
//               {codeSent ? 'Resend code (SMS)' : 'Send code (SMS)'}
//             </Button>

//             <Button
//               type="button"
//               onClick={handleSendEmailLink}
//               disabled={busy || !email}
//               className="flex-1"
//             >
//               Send to Email
//             </Button>

//             <Button type="button" onClick={handleBackToLogin} className="flex-1">
//               Back to login
//             </Button>
//           </div>

//           <div className="text-xs text-gray-500">
//             Attempts: {codeAttempts}/{MAX_CODE_ATTEMPTS} • Idle timeout: {(MFA_IDLE_TIMEOUT_MS / 60000).toFixed(0)} min
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }



// // 1.2025-08-11 — clean MFA flow with 3-attempt limit + idle timeout

// import React, { useEffect, useMemo, useRef, useState, FormEvent } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   signInWithEmailAndPassword,
//   PhoneAuthProvider,
//   PhoneMultiFactorGenerator,
//   getMultiFactorResolver,
//   type MultiFactorResolver,
//   RecaptchaVerifier,
//   type UserCredential,
//   type PhoneMultiFactorInfo,
// } from 'firebase/auth';
// import { auth } from '../../firebase/firebase';
// import EmailField from '../common/EmailField';
// import PasswordField from '../common/PasswordField';
// import InputField from '../common/InputField';
// import Button from '../common/Button';
// import Alert from '../common/Alert';

// declare global {
//   interface Window {
//     recaptchaVerifier?: RecaptchaVerifier;
//     grecaptcha?: any;
//   }
// }

// type Banner = { text: string; type: 'info' | 'success' | 'error' };

// // ---------- Behaviour knobs ----------
// const MAX_CODE_ATTEMPTS = 3;         // 3 tries then back to login
// const MFA_IDLE_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes idle → back to login
// // ------------------------------------

// export default function LoginForm(): JSX.Element {
//   const navigate = useNavigate();

//   // Email/password
//   const [email, setEmail] = useState('');
//   const [emailErrors, setEmailErrors] = useState<string[]>([]);
//   const [password, setPassword] = useState('');
//   const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

//   // MFA state
//   const [resolver, setResolver] = useState<MultiFactorResolver | null>(null);
//   const [verificationId, setVerificationId] = useState('');
//   const [smsCode, setSmsCode] = useState('');
//   const [codeSent, setCodeSent] = useState(false);
//   const [codeAttempts, setCodeAttempts] = useState(0);

//   // Timers
//   const idleTimerRef = useRef<number | null>(null);

//   // UI
//   const [banner, setBanner] = useState<Banner>({ text: '', type: 'info' });
//   const [busy, setBusy] = useState(false);

//   // We are in MFA step if we have either a resolver or a verificationId
//   const inMfaStep = useMemo(() => Boolean(resolver || verificationId), [resolver, verificationId]);

//   // ---- Helpers ----
//   async function ensureRecaptcha() {
//     // Create or reset an invisible reCAPTCHA for Firebase PhoneAuth
//     if (!window.recaptchaVerifier) {
//       window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
//       await window.recaptchaVerifier.render();
//       return;
//     }
//     const widgetId = await window.recaptchaVerifier.render();
//     if (window.grecaptcha?.reset) window.grecaptcha.reset(widgetId);
//   }

//   function clearIdleTimer() {
//     if (idleTimerRef.current) {
//       window.clearTimeout(idleTimerRef.current);
//       idleTimerRef.current = null;
//     }
//   }

//   function startIdleTimer() {
//     clearIdleTimer();
//     idleTimerRef.current = window.setTimeout(() => {
//       // Idle timeout → back to login
//       resetToLogin('Session timed out. Please log in again.');
//     }, MFA_IDLE_TIMEOUT_MS) as unknown as number;
//   }

//   function clearMfaState() {
//     setResolver(null);
//     setVerificationId('');
//     setSmsCode('');
//     setCodeSent(false);
//     setCodeAttempts(0);
//     clearIdleTimer();
//   }

//   function resetToLogin(message?: string) {
//     clearMfaState();
//     setPassword(''); // scrub password on reset
//     setBanner({ text: message ?? 'Returning to login…', type: 'info' });
//     // If your login is this component itself, just clearing state is enough.
//     // If you have a dedicated /login route, uncomment:
//     // navigate('/login');
//   }

//   // When entering the MFA step, (re)start the idle timer
//   useEffect(() => {
//     if (inMfaStep) {
//       startIdleTimer();
//     } else {
//       clearIdleTimer();
//     }
//     return () => clearIdleTimer();
//   }, [inMfaStep]);

//   // Bump the idle timer on relevant user interactions
//   useEffect(() => {
//     if (inMfaStep) startIdleTimer();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [smsCode, codeSent]);

//   // -------- EMAIL/PASSWORD SUBMIT --------
//   async function handleSubmit(e: FormEvent) {
//     e.preventDefault();
//     if (busy) return;
//     if (emailErrors.length || passwordErrors.length) return;

//     setBusy(true);
//     setBanner({ text: '', type: 'info' });
//     clearMfaState();

//     try {
//       const cred: UserCredential = await signInWithEmailAndPassword(auth, email, password);

//       // If no MFA is required, go straight in.
//       setBanner({ text: 'Login successful! Redirecting…', type: 'success' });
//       setTimeout(() => navigate('/stablehand-welcome'), 800);
//       return;
//     } catch (err: any) {
//       // If MFA is required, Firebase throws auth/multi-factor-auth-required
//       if (err?.code === 'auth/multi-factor-auth-required') {
//         try {
//           const mResolver = getMultiFactorResolver(auth, err);
//           setResolver(mResolver);

//           await ensureRecaptcha();
//           const hint = mResolver.hints[0] as PhoneMultiFactorInfo | undefined;
//           const provider = new PhoneAuthProvider(auth);

//           const id = await provider.verifyPhoneNumber(
//             { multiFactorHint: hint, session: mResolver.session },
//             window.recaptchaVerifier!
//           );

//           setVerificationId(id);
//           setCodeSent(true);

//           const masked = hint?.phoneNumber ? `…${hint.phoneNumber.slice(-4)}` : 'your phone';
//           setBanner({ text: `We sent a code to ${masked}.`, type: 'info' });
//           startIdleTimer();
//           return;
//         } catch (mfaErr: any) {
//           setBanner({
//             text: mfaErr?.message || 'Could not send the verification code. Please try again.',
//             type: 'error',
//           });
//           clearMfaState();
//           return;
//         }
//       }

//       // Any other login failure
//       setBanner({ text: 'Login failed. Check your email and password.', type: 'error' });
//     } finally {
//       setBusy(false);
//     }
//   }

//   // -------- VERIFY MFA CODE --------
//   async function handleVerify() {
//     if (!resolver || !verificationId) return;
//     if (busy) return;

//     setBusy(true);
//     setBanner({ text: '', type: 'info' });

//     try {
//       const phoneCred = PhoneAuthProvider.credential(verificationId, smsCode.trim());
//       const assertion = PhoneMultiFactorGenerator.assertion(phoneCred);
//       await resolver.resolveSignIn(assertion);

//       setBanner({ text: 'MFA successful! Redirecting…', type: 'success' });
//       clearIdleTimer();
//       setTimeout(() => navigate('/stablehand-welcome'), 800);
//     } catch (err: any) {
//       // Count incorrect attempts
//       const next = codeAttempts + 1;
//       setCodeAttempts(next);
//       setSmsCode('');

//       if (err?.code === 'auth/invalid-verification-code' || err?.code === 'auth/argument-error') {
//         if (next >= MAX_CODE_ATTEMPTS) {
//           // 3 strikes → back to login
//           resetToLogin('Too many incorrect codes. Please log in again.');
//         } else {
//           setBanner({
//             text: `The code is incorrect or expired. (${next}/${MAX_CODE_ATTEMPTS})`,
//             type: 'error',
//           });
//           startIdleTimer();
//         }
//       } else {
//         setBanner({ text: err?.message || 'Verification failed. Please try again.', type: 'error' });
//         startIdleTimer();
//       }
//     } finally {
//       setBusy(false);
//     }
//   }

//   // -------- RESEND MFA CODE --------
//   async function handleResend() {
//     if (!resolver) return;
//     if (busy) return;

//     setBusy(true);
//     try {
//       await ensureRecaptcha();
//       const hint = resolver.hints[0] as PhoneMultiFactorInfo | undefined;
//       const provider = new PhoneAuthProvider(auth);
//       const newId = await provider.verifyPhoneNumber(
//         { multiFactorHint: hint, session: resolver.session },
//         window.recaptchaVerifier!
//       );

//       setVerificationId(newId);
//       setCodeSent(true);
//       setSmsCode('');
//       setCodeAttempts(0); // reset counter after a new code is sent
//       setBanner({ text: 'A new code was sent.', type: 'success' });
//       startIdleTimer();
//     } catch (err: any) {
//       setBanner({ text: err?.message || 'Failed to resend code. Please try again.', type: 'error' });
//     } finally {
//       setBusy(false);
//     }
//   }

//   // -------- BACK TO LOGIN (cancel MFA) --------
//   function handleBackToLogin() {
//     resetToLogin('Cancelled. You can try logging in again.');
//   }

//   return (
//     <div className="space-y-4">
//       {!inMfaStep && (
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <EmailField
//             email={email}
//             setEmail={setEmail}
//             setEmailErrors={setEmailErrors}
//             errors={emailErrors}
//           />
//           <PasswordField
//             password={password}
//             setPassword={setPassword}
//             setPasswordErrors={setPasswordErrors}
//             errors={passwordErrors}
//           />

//           {banner.text && <Alert message={banner.text} type={banner.type} />}

//           <Button type="submit" disabled={busy} className="w-full bg-blue-600 text-white">
//             Log In
//           </Button>
//         </form>
//       )}

//       {/* reCAPTCHA container – managed by ensureRecaptcha() */}
//       <div id="recaptcha-container" />

//       {inMfaStep && (
//         <div className="space-y-4">
//           <InputField
//             name="smsCode"
//             label="SMS Code"
//             type="text"
//             value={smsCode}
//             onChange={(e) => setSmsCode(e.target.value)}
//             placeholder="123456"
//           />

//           {banner.text && <Alert message={banner.text} type={banner.type} />}

//           <div className="flex gap-2">
//             <Button
//               onClick={handleVerify}
//               disabled={busy || !smsCode.trim()}
//               className="flex-1 bg-green-600 text-white"
//             >
//               Verify
//             </Button>

//             <Button
//               type="button"
//               onClick={handleResend}
//               disabled={busy}
//               className="flex-1"
//             >
//               {codeSent ? 'Resend code' : 'Send code'}
//             </Button>

//             <Button type="button" onClick={handleBackToLogin} className="flex-1">
//               Back to login
//             </Button>
//           </div>

//           <div className="text-xs text-gray-500">
//             Attempts: {codeAttempts}/{MAX_CODE_ATTEMPTS} • Idle timeout: {(MFA_IDLE_TIMEOUT_MS / 60000).toFixed(0)} min
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


//4.20.25 

// // src/components/organisms/LoginForm.tsx
// import React, { useState, useEffect, FormEvent } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   signInWithEmailAndPassword,
//   PhoneAuthProvider,
//   PhoneMultiFactorGenerator,
//   multiFactor,
//   getMultiFactorResolver,
//   MultiFactorResolver,
//   RecaptchaVerifier,
//   UserCredential
// } from 'firebase/auth';
// import { auth } from '../../firebase/firebase';
// import EmailField from '../common/EmailField';
// import PasswordField from '../common/PasswordField';
// import InputField from '../common/InputField';
// import Button from '../common/Button';
// import Alert from '../common/Alert';

// // Extend global window for reCAPTCHA
// declare global {
//   interface Window {
//     recaptchaVerifier?: RecaptchaVerifier;
//   }
// }

// type Banner = { text: string; type: 'info' | 'success' | 'error' };

// export default function LoginForm(): JSX.Element {
//   const navigate = useNavigate();

//   // Email/password
//   const [email, setEmail] = useState<string>('');
//   const [emailErrors, setEmailErrors] = useState<string[]>([]);
//   const [password, setPassword] = useState<string>('');
//   const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
// const [loginAttempts, setLoginAttempts] = useState<number>(0);

//   // SMS/MFA
//   const [smsCode, setSmsCode] = useState<string>('');
//   const [verificationId, setVerificationId] = useState<string>('');
//   const [resolver, setResolver] = useState<MultiFactorResolver | null>(null);
//   const [enrolling, setEnrolling] = useState<boolean>(false);

//   // Banner/feedback
//   const [banner, setBanner] = useState<Banner>({ text: '', type: 'info' });

//   // Initialize invisible reCAPTCHA once
//   useEffect(() => {
//     if (!window.recaptchaVerifier) {
//       // Correct parameter order: auth first, then containerId, then options
//       window.recaptchaVerifier = new RecaptchaVerifier(
//         auth,
//         'recaptcha-container',
//         { size: 'invisible' }
//       );
//       // Render the invisible widget
//       window.recaptchaVerifier.render().catch(console.error);
//     }
//   }, []);

//   // STEP 1: attempt email+password sign-in (and possibly start MFA enrollment)
//  async function handleSubmit(e: FormEvent) {
//   e.preventDefault();
//   setBanner({ text: '', type: 'info' });

//   try {
//     const cred: UserCredential = await signInWithEmailAndPassword(auth, email, password);
//     const user = cred.user;

//     // ✅ MFA step only starts after a valid password
//     setEnrolling(true);
//     setBanner({ text: 'Sending enrollment SMS…', type: 'info' });

//     const session = await multiFactor(user).getSession();
//     const provider = new PhoneAuthProvider(auth);
//     const phoneInput = window.prompt('Enter phone # (+1...)') || '';
//     const id = await provider.verifyPhoneNumber(
//       { phoneNumber: phoneInput, session },
//       window.recaptchaVerifier!
//     );
//     setVerificationId(id);

//   } catch (err: any) {
//     // ✅ Track failed attempts regardless of error type
//     setLoginAttempts((prev) => prev + 1);

//     // ✅ MFA
//     if (err.code === 'auth/multi-factor-auth-required') {
//       const mResolver = getMultiFactorResolver(auth, err);
//       setResolver(mResolver);
//       const hint = mResolver.hints[0];
//       setBanner({
//         text: `Code sent to …${hint.phoneNumber?.slice(-4) || '***'}`,
//         type: 'info',
//       });

//       const provider = new PhoneAuthProvider(auth);
//       const id = await provider.verifyPhoneNumber(
//         { multiFactorHint: hint, session: mResolver.session },
//         window.recaptchaVerifier!
//       );
//       setVerificationId(id);
//       return; // prevent fallthrough
//     }

//     // ✅ 3-attempt limit
//     if (loginAttempts + 1 >= 3) {
//       setBanner({
//         text: 'Too many attempts. Redirecting to reset password page.',
//         type: 'error',
//       });
//       setTimeout(() => navigate('/reset-password'), 2000);
//     } else {
//       setBanner({
//         text: err.message || 'Login failed. Please check your credentials.',
//         type: 'error',
//       });
//     }
//   }
// }

//   // STEP 2: verify SMS code for enrollment or sign-in
//   async function handleVerify() {
//     setBanner({ text: '', type: 'info' });
//     if (!verificationId) return;

//     try {
//       const phoneCred = PhoneAuthProvider.credential(verificationId, smsCode);
//       const assertion = PhoneMultiFactorGenerator.assertion(phoneCred);

//       if (enrolling) {
//         await multiFactor(auth.currentUser!).enroll(assertion, 'Phone');
//         setBanner({ text: 'Phone linked! Redirecting…', type: 'success' });
//         await auth.currentUser!.reload();
//       } else if (resolver) {
//         await resolver.resolveSignIn(assertion);
//         setBanner({ text: 'MFA OK—Redirecting…', type: 'success' });
//       }

//       setTimeout(() => navigate('/stablehand-welcome'), 1500);
//     } catch (err: any) {
//       setBanner({ text: err.message || 'Verification failed', type: 'error' });
//     }
//   }

//   return (
//     <div>
//       {/* STEP 1: Email/Password */}
//       {!verificationId && (
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <EmailField
//             email={email}
//             setEmail={setEmail}
//             setEmailErrors={setEmailErrors}
//             errors={emailErrors}
//           />
//           <PasswordField
//             password={password}
//             setPassword={setPassword}
//             setPasswordErrors={setPasswordErrors}
//             errors={passwordErrors}
//           />

//           {banner.text && <Alert message={banner.text} type={banner.type} />}

//           <Button type="submit" className="w-full bg-blue-600 text-white">
//             {enrolling ? 'Link Phone' : 'Log In'}
//           </Button>
//         </form>
//       )}

//       <div id="recaptcha-container"></div>

//       {/* STEP 2: SMS code UI */}
//       {verificationId && (
//         <div className="mt-4 space-y-4">
//           <InputField
//             label="SMS Code"
//             type="text"
//             value={smsCode}
//             onChange={e => setSmsCode(e.target.value)}
//             placeholder="123456"
//           />
//           {banner.text && <Alert message={banner.text} type={banner.type} />}

//           <Button onClick={handleVerify} className="w-full bg-green-600 text-white">
//             Verify Code
//           </Button>
//         </div>
//       )}
//     </div>
//   );
// }


/* import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  RecaptchaVerifier,
  PhoneAuthProvider,
  multiFactor,
  EmailAuthProvider,
  getMultiFactorResolver,
  MultiFactorResolver,
  MultiFactorInfo,
} from "firebase/auth";
import { auth } from "../../firebase/firebase";
import EmailField from "../common/EmailField";
import PasswordField from "../common/PasswordField";
import Alert from "../common/Alert";
import Button from "../common/Button";
import InputField from "../common/InputField";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [loginMessage, setLoginMessage] = useState<{ message: string; type: string }>({ message: "", type: "" });
  const [mfaOptions, setMfaOptions] = useState<MultiFactorInfo[] | null>(null);
  const [resolver, setResolver] = useState<MultiFactorResolver | null>(null);
  const [mfaMethod, setMfaMethod] = useState<string>("");
  const [phoneMasked, setPhoneMasked] = useState<string>("");

  // Initialize Recaptcha
  const initializeRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        "recaptcha-container",
        { size: "invisible" },
        auth
      );
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginMessage({ message: "", type: "" });

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if MFA is required
      if (multiFactor(user).enrolledFactors.length > 0) {
        const mfaResolver = getMultiFactorResolver(auth, userCredential);

        const options = mfaResolver.hints.map((hint) => ({
          factorId: hint.factorId,
          displayName: hint.displayName,
          phoneNumber: hint.phoneNumber,
        }));

        setMfaOptions(options);
        setResolver(mfaResolver);

        const phone = options.find((opt) => opt.factorId === PhoneAuthProvider.PROVIDER_ID);
        if (phone) {
          setPhoneMasked(`*****${phone.phoneNumber?.slice(-4) || ""}`);
        }

        setLoginMessage({
          message: "MFA required. Choose an option to proceed.",
          type: "warning",
        });
        return;
      }

      setLoginMessage({ message: "Login successful!", type: "success" });
      // Redirect to your app or dashboard here
    } catch (error: any) {
      if (error.code === "auth/multi-factor-auth-required") {
        const mfaResolver = getMultiFactorResolver(auth, error);

        const options = mfaResolver.hints.map((hint) => ({
          factorId: hint.factorId,
          displayName: hint.displayName,
          phoneNumber: hint.phoneNumber,
        }));

        setMfaOptions(options);
        setResolver(mfaResolver);

        const phone = options.find((opt) => opt.factorId === PhoneAuthProvider.PROVIDER_ID);
        if (phone) {
          setPhoneMasked(`*****${phone.phoneNumber?.slice(-4) || ""}`);
        }

        setLoginMessage({
          message: "MFA required. Choose an option to proceed.",
          type: "warning",
        });
        return;
      }

      setLoginMessage({
        message: `Login failed: ${error.message}`,
        type: "error",
      });
    }
  };

  const handleSendVerificationCode = async () => {
    if (mfaMethod === PhoneAuthProvider.PROVIDER_ID) {
      try {
        const appVerifier = window.recaptchaVerifier;
        const phoneInfoOptions = {
          multiFactorHint: resolver?.hints.find((hint) => hint.factorId === PhoneAuthProvider.PROVIDER_ID),
          session: resolver?.session,
        };

        const phoneAuthProvider = new PhoneAuthProvider(auth);
        const verificationId = await phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, appVerifier);

        window.verificationId = verificationId;
        setLoginMessage({ message: "Verification code sent to your phone.", type: "success" });
      } catch (error: any) {
        setLoginMessage({ message: `Failed to send SMS: ${error.message}`, type: "error" });
      }
    } else if (mfaMethod === EmailAuthProvider.PROVIDER_ID) {
      setLoginMessage({ message: "Email MFA not implemented yet.", type: "info" });
    }
  };

  const handleVerifyCode = async () => {
    try {
      const cred = PhoneAuthProvider.credential(window.verificationId, verificationCode);
      const assertion = PhoneAuthProvider.assertion(cred);

      if (resolver) {
        await resolver.resolveSignIn(assertion);
        setLoginMessage({ message: "MFA verification successful! Redirecting...", type: "success" });
        // Redirect to your app or dashboard here
      }
    } catch (error: any) {
      setLoginMessage({ message: `MFA verification failed: ${error.message}`, type: "error" });
    }
  };

  return (
    <div>
      {!mfaOptions ? (
        <form onSubmit={handleLogin}>
          <EmailField email={email} setEmail={setEmail} />
          <PasswordField password={password} setPassword={setPassword} />
          {loginMessage.message && <Alert message={loginMessage.message} type={loginMessage.type} />}
          <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-700">
            Login
          </Button>
        </form>
      ) : (
        <div>
          <h3>MFA Required</h3>
          {mfaOptions.map((option, index) => (
            <div key={index}>
              <input
                type="radio"
                id={`mfa-option-${index}`}
                name="mfaOption"
                value={option.factorId}
                onChange={(e) => setMfaMethod(e.target.value)}
              />
              <label htmlFor={`mfa-option-${index}`}>
                {option.factorId === PhoneAuthProvider.PROVIDER_ID ? `Phone (${phoneMasked})` : "Email"}
              </label>
            </div>
          ))}
          <Button onClick={handleSendVerificationCode}>Send Verification Code</Button>
          <InputField
            label="Verification Code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
          />
          <Button onClick={handleVerifyCode}>Verify Code</Button>
        </div>
      )}
      <div id="recaptcha-container"></div>
    </div>
  );
};

export default LoginForm; */


//+++++++++++JS VERSIOn++++++++++++++++++
// src/components/organisms/LoginForm.jsx
//JS version
/* import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  RecaptchaVerifier,
  PhoneAuthProvider,
  multiFactor,
  EmailAuthProvider,
  getMultiFactorResolver,
} from "firebase/auth";
import { auth } from "../../firebase/firebase";
import EmailField from "../common/EmailField";
import PasswordField from "../common/PasswordField";
import Alert from "../common/Alert";
import Button from "../common/Button";
import InputField from "../common/InputField";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [loginMessage, setLoginMessage] = useState({ message: "", type: "" });
  const [mfaOptions, setMfaOptions] = useState(null);
  const [resolver, setResolver] = useState(null);

  const [mfaMethod, setMfaMethod] = useState("");
  const [phoneMasked, setPhoneMasked] = useState("");

  // Initialize Recaptcha
  const initializeRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        "recaptcha-container",
        { size: "invisible" },
        auth
      );
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginMessage({ message: "", type: "" });

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if MFA is required
      if (multiFactor(user).enrolledFactors.length > 0) {
        const mfaResolver = getMultiFactorResolver(auth, userCredential);

        const options = mfaResolver.hints.map((hint) => ({
          factorId: hint.factorId,
          displayName: hint.displayName,
          phoneNumber: hint.phoneNumber,
        }));

        // Save MFA options and resolver
        setMfaOptions(options);
        setResolver(mfaResolver);

        // Mask the phone number
        const phone = options.find((opt) => opt.factorId === PhoneAuthProvider.PROVIDER_ID);
        if (phone) {
          setPhoneMasked(`*****${phone.phoneNumber.slice(-4)}`);
        }

        setLoginMessage({
          message: "MFA required. Choose an option to proceed.",
          type: "warning",
        });
        return;
      }

      // If no MFA required, proceed to app
      setLoginMessage({ message: "Login successful!", type: "success" });
      // Redirect to your app or dashboard here
    } catch (error) {
      if (error.code === "auth/multi-factor-auth-required") {
        const mfaResolver = getMultiFactorResolver(auth, error);

        const options = mfaResolver.hints.map((hint) => ({
          factorId: hint.factorId,
          displayName: hint.displayName,
          phoneNumber: hint.phoneNumber,
        }));

        setMfaOptions(options);
        setResolver(mfaResolver);

        const phone = options.find((opt) => opt.factorId === PhoneAuthProvider.PROVIDER_ID);
        if (phone) {
          setPhoneMasked(`*****${phone.phoneNumber.slice(-4)}`);
        }

        setLoginMessage({
          message: "MFA required. Choose an option to proceed.",
          type: "warning",
        });
        return;
      }

      setLoginMessage({
        message: `Login failed: ${error.message}`,
        type: "error",
      });
    }
  };

  const handleSendVerificationCode = async () => {
    if (mfaMethod === PhoneAuthProvider.PROVIDER_ID) {
      try {
        const appVerifier = window.recaptchaVerifier;
        const phoneInfoOptions = {
          multiFactorHint: resolver.hints.find(
            (hint) => hint.factorId === PhoneAuthProvider.PROVIDER_ID
          ),
          session: resolver.session,
        };

        const phoneAuthProvider = new PhoneAuthProvider(auth);
        const verificationId = await phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, appVerifier);

        window.verificationId = verificationId;
        setLoginMessage({ message: "Verification code sent to your phone.", type: "success" });
      } catch (error) {
        setLoginMessage({ message: `Failed to send SMS: ${error.message}`, type: "error" });
      }
    } else if (mfaMethod === EmailAuthProvider.PROVIDER_ID) {
      setLoginMessage({ message: "Email MFA not implemented yet.", type: "info" });
    }
  };

  const handleVerifyCode = async () => {
    try {
      const cred = PhoneAuthProvider.credential(window.verificationId, verificationCode);
      const assertion = PhoneMultiFactorGenerator.assertion(cred);

      const userCredential = await resolver.resolveSignIn(assertion);
      setLoginMessage({ message: "MFA verification successful! Redirecting...", type: "success" });

      // Redirect to your app or dashboard here
    } catch (error) {
      setLoginMessage({ message: `MFA verification failed: ${error.message}`, type: "error" });
    }
  };

  return (
    <div>
      {!mfaOptions ? (
        <form onSubmit={handleLogin}>
          <EmailField email={email} setEmail={setEmail} />
          <PasswordField password={password} setPassword={setPassword} />
          {loginMessage.message && <Alert message={loginMessage.message} type={loginMessage.type} />}
          <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-700">
            Login
          </Button>
        </form>
      ) : (
        <div>
          <h3>MFA Required</h3>
          {mfaOptions.map((option, index) => (
            <div key={index}>
              <input
                type="radio"
                id={`mfa-option-${index}`}
                name="mfaOption"
                value={option.factorId}
                onChange={(e) => setMfaMethod(e.target.value)}
              />
              <label htmlFor={`mfa-option-${index}`}>
                {option.factorId === PhoneAuthProvider.PROVIDER_ID
                  ? `Phone (${phoneMasked})`
                  : "Email"}
              </label>
            </div>
          ))}
          <Button onClick={handleSendVerificationCode}>Send Verification Code</Button>
          <InputField
            label="Verification Code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
          />
          <Button onClick={handleVerifyCode}>Verify Code</Button>
        </div>
      )}
      <div id="recaptcha-container"></div>
    </div>
  );
};

export default LoginForm;
 */

// src/components/LoginForm.jsx

// import React, { useState } from 'react';
// import EmailField from '../common/EmailField';
// import PasswordField from '../common/PasswordField';
// import Button from '../common/Button';
// import Alert from '../common/Alert';
// import ThirdPartyAuthPanel from '../common/ThirdPartyAuthPanel';
// import RegistrationForm from './RegistrationForm';
// import { useNavigate } from 'react-router-dom';
// import { auth, googleProvider, facebookProvider, yahooProvider, microsoftProvider, appleProvider } from '../../firebase/firebase';
// import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';

// const LoginForm = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [emailErrors, setEmailErrors] = useState([]);
//   const [passwordErrors, setPasswordErrors] = useState([]);
//   const [loginAttempts, setLoginAttempts] = useState(0);
//   const [capsLockWarning, setCapsLockWarning] = useState(false);
//   const [loginMessage, setLoginMessage] = useState({ message: '', type: '' });
//   const [isRegister, setIsRegister] = useState(false); // New state to toggle between login and registration forms
//   const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     if (emailErrors.length === 0 && passwordErrors.length === 0) {
//       try {
//         await signInWithEmailAndPassword(auth, email, password);
//         setLoginMessage({
//           message: 'Login successful! Redirecting...',
//           type: 'success',
//         });
//         setTimeout(() => {
//           navigate('/stablehand-welcome');
//         }, 2000); // Navigate after 2 seconds to show the success message
//       } catch (error) {
//         console.error('Error logging in user:', error);
//         setLoginAttempts((prev) => prev + 1);
//         if (loginAttempts + 1 >= 3) {
//           setLoginMessage({
//             message: 'Too many attempts. Redirecting to reset password page.',
//             type: 'error',
//           });
//           setTimeout(() => {
//             navigate('/reset-password');
//           }, 2000); // Navigate after 2 seconds to show the error message
//         } else {
//           setLoginMessage({
//             message: 'Login failed. Please check your credentials.',
//             type: 'error',
//           });
//         }
//       }
//     }
//   };

//   const handleThirdPartyLogin = async (provider) => {
//     try {
//       await signInWithPopup(auth, provider);
//       setLoginMessage({ message: 'Login successful.', type: 'success' });
//     } catch (error) {
//       console.error('Error during third-party login:', error);
//       setLoginMessage({ message: `Error during third-party login: ${error.message}`, type: 'error' });
//     }
//   };

//   return (
//     <div>
//       {!isRegister ? (
//         <form className="space-y-4" onSubmit={handleLogin}>
//           <EmailField email={email} setEmail={setEmail} setEmailErrors={setEmailErrors} />
//           <PasswordField password={password} setPassword={setPassword} setPasswordErrors={setPasswordErrors} />
//           {capsLockWarning && <Alert message="Caps Lock is on" type="warning" />}
//           {loginMessage.message && <Alert message={loginMessage.message} type={loginMessage.type} />}
//           <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 border border-blue-700 font-bold">Login</Button>
//           <div className="mt-4 flex justify-between">
//             <Button
//               type="button"
//               onClick={() => navigate('/reset-password')}
//               className="w-full bg-red-500 hover:bg-red-700 border border-red-700 font-bold"
//             >
//               Reset Password
//             </Button>
//             <Button
//               type="button"
//               onClick={() => navigate('/register')}
//               className="w-full bg-green-500 hover:bg-green-700 border border-green-700 font-bold ml-4"
//             >
//               Register
//             </Button>
//           </div>
//           <ThirdPartyAuthPanel handleThirdPartyAuth={handleThirdPartyLogin} isRegister={false} />
//         </form>
//       ) : (
//         <div>
//           {/* <RegistrationForm /> */}
//          {/*  <Button
//             type="button"
//             onClick={() => setIsRegister(false)} // Toggle to show the login form
//             className="w-full bg-gray-500 hover:bg-gray-700 border border-gray-700 font-bold mt-4"
//           >
//             Back to Login
//           </Button> */}
//         </div>
//       )}
//     </div>
//   );
// };

// export default LoginForm;
// src/components/LoginForm.jsx
//New style with MFA  notworking .....
 /*  import React, { useState, useEffect, useRef } from 'react';
import {
  signInWithEmailAndPassword,
  sendEmailVerification,
  RecaptchaVerifier,
  PhoneAuthProvider,
  getMultiFactorResolver,
  PhoneMultiFactorGenerator,
  multiFactor, // Added import
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase/firebase';

import MfaEnrollment from '../common/MfaEnrollment';
import PhoneNumberField from '../common/PhoneNumberField';
import EmailField from '../common/EmailField';
import PasswordField from '../common/PasswordField';
import Button from '../common/Button';
import Alert from '../common/Alert';
import ThirdPartyAuthPanel from '../common/ThirdPartyAuthPanel';
const LoginForm = ({ onLogin, onMaxLoginAttemptsReached, onRegisterClick }) =>{ 
  // State variables
 const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginMessage, setLoginMessage] = useState({ message: '', type: '' });
  const [showMfaEnrollment, setShowMfaEnrollment] = useState(false);
  const recaptchaVerifierRef = useRef(null);
  const navigate = useNavigate();
  
  const [emailErrors, setEmailErrors] = useState([]);
   
    const [passwordErrors, setPasswordErrors] = useState([]);
    const [loginAttempts, setLoginAttempts] = useState(0);
    const [capsLockWarning, setCapsLockWarning] = useState(false);
   
  
  // Initialize reCAPTCHA
  useEffect(() => {
    if (!recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(
        'recaptcha-container',
        {
          size: 'invisible',
        },
        auth
      );
    }
  }, []);

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Sign in with email and password
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await user.reload();

      // Check if email is verified
      if (!user.emailVerified) {
        setLoginMessage({
          message: 'Your email is not verified. Please check your inbox and verify your email.',
          type: 'error',
        });
        await sendEmailVerification(user);
        return;
      }

      // Check if user is enrolled in MFA
      const enrolledFactors = multiFactor(user).enrolledFactors;
      if (enrolledFactors.length === 0) {
        // User is not enrolled in MFA
        setShowMfaEnrollment(true);
        return;
      }

      // User is enrolled in MFA, proceed to your app
      setLoginMessage({
        message: 'Login successful! Redirecting...',
        type: 'success',
      });
      setTimeout(() => {
        navigate('/stablehand-welcome'); // Adjust the route as needed
      }, 2000);
    } catch (error) {
      console.error('Error during login:', error);
      console.error('Error:', error);
console.error('Error code:', error.code);
console.error('Error message:', error.message);
      setLoginMessage({
        message: 'Login failed. Please check your credentials.',
        type: 'error',
      });
    }
  };
  const handleThirdPartyLogin = async (provider) => {
    try {
      await signInWithPopup(auth, provider);
      setLoginMessage({ message: 'Login successful.', type: 'success' });
    } catch (error) {
      console.error('Error during third-party login:', error);
      setLoginMessage({ message: `Error during third-party login: ${error.message}`, type: 'error' });
    }
  };
  return (
    <div>
      {showMfaEnrollment ? (
        <MfaEnrollment
          onEnrollmentComplete={() => {
            setShowMfaEnrollment(false);
            setLoginMessage({
              message: 'MFA enrollment successful! Redirecting...',
              type: 'success',
            });
            setTimeout(() => {
              navigate('/stablehand-welcome'); // Adjust the route as needed
            }, 2000);
          }}
        />
      ) : (
        <form className="space-y-4" onSubmit={handleLogin}>
        <EmailField email={email} setEmail={setEmail} setEmailErrors={setEmailErrors} />
        <PasswordField password={password} setPassword={setPassword} setPasswordErrors={setPasswordErrors} />
        {capsLockWarning && <Alert message="Caps Lock is on" type="warning" />}
        {loginMessage.message && <Alert message={loginMessage.message} type={loginMessage.type} />}
        <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 border border-blue-700 font-bold">Login</Button>
        <div className="mt-4 flex justify-between">
          <Button
            type="button"
            onClick={() => navigate('/reset-password')}
            className="w-full bg-red-500 hover:bg-red-700 border border-red-700 font-bold"
          >
            Reset Password
          </Button>
          <Button
            type="button"
            onClick={onRegisterClick}
            className="w-full bg-green-500 hover:bg-green-700 border border-green-700 font-bold ml-4"
          >
            Register
          </Button>
        </div>
        <ThirdPartyAuthPanel handleThirdPartyAuth={handleThirdPartyLogin} isRegister={false} />
      </form>
      )}
      <div id="recaptcha-container"></div>
    </div>
  );
};

export default LoginForm;
 
 */


/* 
 import React, { useState } from 'react';
import EmailField from '../common/EmailField';
import PasswordField from '../common/PasswordField';
import Button from '../common/Button';
import Alert from '../common/Alert';
import ThirdPartyAuthPanel from '../common/ThirdPartyAuthPanel';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider, facebookProvider, yahooProvider, microsoftProvider, appleProvider } from '../../firebase/firebase';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';

const LoginForm = ({ onLogin, onMaxLoginAttemptsReached, onRegisterClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailErrors, setEmailErrors] = useState([]);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [capsLockWarning, setCapsLockWarning] = useState(false);
  const [loginMessage, setLoginMessage] = useState({ message: '', type: '' });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (emailErrors.length === 0 && passwordErrors.length === 0) {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        setLoginMessage({
          message: 'Login successful! Redirecting...',
          type: 'success',
        });
        setTimeout(() => {
          navigate('/stablehand-welcome');
        }, 2000); // Navigate after 2 seconds to show the success message
      } catch (error) {
        console.error('Error logging in user:', error);
        setLoginAttempts((prev) => prev + 1);
        if (loginAttempts + 1 >= 3) {
          setLoginMessage({
            message: 'Too many attempts. Redirecting to reset password page.',
            type: 'error',
          });
          onMaxLoginAttemptsReached();
          setTimeout(() => {
            navigate('/reset-password');
          }, 2000); // Navigate after 2 seconds to show the error message
        } else {
          setLoginMessage({
            message: 'Login failed. Please check your credentials.',
            type: 'error',
          });
        }
      }
    }
  };

  const handleThirdPartyLogin = async (provider) => {
    try {
      await signInWithPopup(auth, provider);
      setLoginMessage({ message: 'Login successful.', type: 'success' });
    } catch (error) {
      console.error('Error during third-party login:', error);
      setLoginMessage({ message: `Error during third-party login: ${error.message}`, type: 'error' });
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleLogin}>
      <EmailField email={email} setEmail={setEmail} setEmailErrors={setEmailErrors} />
      <PasswordField password={password} setPassword={setPassword} setPasswordErrors={setPasswordErrors} />
      {capsLockWarning && <Alert message="Caps Lock is on" type="warning" />}
      {loginMessage.message && <Alert message={loginMessage.message} type={loginMessage.type} />}
      <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 border border-blue-700 font-bold">Login</Button>
      <div className="mt-4 flex justify-between">
        <Button
          type="button"
          onClick={() => navigate('/reset-password')}
          className="w-full bg-red-500 hover:bg-red-700 border border-red-700 font-bold"
        >
          Reset Password
        </Button>
        <Button
          type="button"
          onClick={onRegisterClick}
          className="w-full bg-green-500 hover:bg-green-700 border border-green-700 font-bold ml-4"
        >
          Register
        </Button>
      </div>
      <ThirdPartyAuthPanel handleThirdPartyAuth={handleThirdPartyLogin} isRegister={false} />
    </form>
  );
};

export default LoginForm; 
 */

//old style 
/* import React, { useState } from 'react';
import EmailField from '../common/EmailField';
import PasswordField from '../common/PasswordField';
import Button from '../common/Button';
import Alert from '../common/Alert';
import { useNavigate } from 'react-router-dom';
import {Frame3,Frame2,Frame} from '../common/Frame';
const LoginForm = ({ onLogin, onMaxLoginAttemptsReached, onRegisterClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailErrors, setEmailErrors] = useState([]);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [capsLockWarning, setCapsLockWarning] = useState(false);
  const [loginMessage, setLoginMessage] = useState({ message: '', type: '' });
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (emailErrors.length === 0 && passwordErrors.length === 0) {
      onLogin(email, password, (success) => {
        if (!success) {
          setLoginAttempts((prev) => prev + 1);
          if (loginAttempts + 1 >= 3) {
            setLoginMessage({
              message: 'Too many attempts. Redirecting to reset password page.',
              type: 'error',
            });
            onMaxLoginAttemptsReached();
            setTimeout(() => {
              navigate('/reset-password');
            }, 2000); // Navigate after 2 seconds to show the error message
          } else {
            setLoginMessage({
              message: 'Login failed. Please check your credentials.',
              type: 'error',
            });
          }
        } else {
          setLoginMessage({
            message: 'Login successful! Redirecting...',
            type: 'success',
          });
          setTimeout(() => {
            navigate('/stablehand-welcome');
          }, 2000); // Navigate after 2 seconds to show the success message
        }
      });
    }
  };

  const handleKeyPress = (e) => {
    setCapsLockWarning(isCapsLockOn(e));
  };

  return (<Frame2>
     
    <form className="space-y-4" onSubmit={handleLogin}>
      <EmailField email={email} setEmail={setEmail} setEmailErrors={setEmailErrors} />
      <PasswordField password={password} setPassword={setPassword} setPasswordErrors={setPasswordErrors} />
      {capsLockWarning && <Alert message="Caps Lock is on" type="warning" />}
      {loginMessage.message && <Alert message={loginMessage.message} type={loginMessage.type} />}
      <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 border border-blue-700">Login</Button>
      <div className="mt-4 flex justify-between">
        <Button
          type="button"
          onClick={() => navigate('/reset-password')}
          className="w-full bg-red-500 hover:bg-red-700 border border-red-700"
        >
          Reset Password
        </Button>
        <Button
          type="button"
          onClick={onRegisterClick}
          className="w-full bg-green-500 hover:bg-green-700 border border-green-700 ml-4"
        >
          Register
        </Button>
      </div>
    </form>
     
    </Frame2>);
};

export default LoginForm; */
