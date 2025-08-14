// src/components/forms/RegistrationForm.tsx
// TS Version
// src/components/organisms/RegistrationForm.tsx

// 2025-08-12 — Stable register + MFA enroll
// - Email verification via Firebase-managed page (no continue URL) to avoid "expired/used" loop
// - MFA enroll with fresh reCAPTCHA per send
// - Re-auth prompt if auth/requires-recent-login, then auto-retry SMS send

import React, { useRef, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  RecaptchaVerifier,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  multiFactor,
  User,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import { getApp } from 'firebase/app';
import { auth } from '../../firebase/firebase';
import EmailField from '../common/EmailField';
import PasswordField from '../common/PasswordField';
import ConfirmPasswordField from '../common/ConfirmPasswordField';
import InputField from '../common/InputField';
import Button from '../common/Button';
import Alert from '../common/Alert';

type Step = 'form' | 'email-sent' | 'verify-sms';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    recaptchaContainerEl?: HTMLDivElement | null;
  }
}

export default function RegistrationForm(): JSX.Element {
  // form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [enablePhone, setEnablePhone] = useState(false);
  const [phone, setPhone] = useState('');

  // validation errors from sub-fields
  const [emailErrors, setEmailErrors] = useState<string[]>([]);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [confirmPasswordErrors, setConfirmPasswordErrors] = useState<string[]>([]);
  const [phoneErrors, setPhoneErrors] = useState<string[]>([]);

  // state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [smsCode, setSmsCode] = useState('');
  const [step, setStep] = useState<Step>('form');
  const [banner, setBanner] = useState<{ text: string; type: 'info' | 'success' | 'error' }>({
    text: '',
    type: 'info',
  });
  const busyRef = useRef(false);

  // re-auth modal
  const [needReauth, setNeedReauth] = useState(false);
  const [reauthPassword, setReauthPassword] = useState('');

  const setBusy = (b: boolean) => (busyRef.current = b);

  // -------- reCAPTCHA lifecycle (fresh container each send) --------
  function destroyRecaptcha() {
    try {
      (window as any).recaptchaVerifier?.clear?.();
    } catch {}
    try {
      if (window.recaptchaContainerEl?.parentNode) {
        window.recaptchaContainerEl.parentNode.removeChild(window.recaptchaContainerEl);
      }
    } catch {}
    window.recaptchaVerifier = undefined;
    window.recaptchaContainerEl = null;
  }

  async function buildFreshRecaptcha() {
    destroyRecaptcha();
    const el = document.createElement('div');
    el.style.display = 'none';
    el.id = `recaptcha-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    document.body.appendChild(el);
    window.recaptchaContainerEl = el;
    // v10 signature; will throw on v9 (unlikely) but we’re TS
    window.recaptchaVerifier = new RecaptchaVerifier(auth as any, el, { size: 'invisible' });
    await window.recaptchaVerifier.render();
  }

  // -------- STEP 1: Register + send verification email --------
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busyRef.current) return;

    if (password !== confirmPassword) {
      setBanner({ text: 'Passwords do not match.', type: 'error' });
      return;
    }
    if (emailErrors.length || passwordErrors.length || confirmPasswordErrors.length || phoneErrors.length) {
      setBanner({ text: 'Please fix the errors in the form.', type: 'error' });
      return;
    }

    setBusy(true);
    setBanner({ text: '', type: 'info' });

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      // SIMPLE + RELIABLE: Firebase-managed verification page.
      // (If you want in-app later, we can re-enable actionCodeSettings.)
      await sendEmailVerification(cred.user);

      // keep user & a copy of uid for sanity checks
      setCurrentUser(cred.user);
      window.localStorage.setItem('reg_uid', cred.user.uid);

      setBanner({
        text: `We sent a verification email to ${email}. Open it and verify, then return here.`,
        type: 'success',
      });
      setStep('email-sent');
    } catch (err: any) {
      setBanner({ text: err?.message || 'Registration failed.', type: 'error' });
    } finally {
      setBusy(false);
    }
  }

  // -------- STEP 2: Send SMS for MFA enrollment --------
  async function handleSendMfaCode() {
    if (busyRef.current) return;

    const u = auth.currentUser || currentUser;
    if (!u) {
      setBanner({ text: 'You are not signed in. Log in, then enroll the phone.', type: 'error' });
      return;
    }

    const e164 = phone.trim();
    if (!/^(\+)[1-9]\d{6,14}$/.test(e164)) {
      setBanner({ text: 'Enter a valid phone (E.164), e.g., +15551234567.', type: 'error' });
      return;
    }

    setBusy(true);
    setBanner({ text: '', type: 'info' });

    try {
      await buildFreshRecaptcha();
      const mfaUser = multiFactor(u);
      const session = await mfaUser.getSession();

      const provider = new PhoneAuthProvider(auth);
      const vId = await provider.verifyPhoneNumber({ phoneNumber: e164, session }, window.recaptchaVerifier!);

      setVerificationId(vId);
      setStep('verify-sms');
      setBanner({ text: `Code sent to …${e164.slice(-4)}.`, type: 'success' });

      // it’s safe to clean up now
      try {
        (window as any).recaptchaVerifier?.clear?.();
        window.recaptchaContainerEl?.remove();
      } catch {}
    } catch (err: any) {
      if (err?.code === 'auth/requires-recent-login') {
        // show a password prompt and retry after reauth
        setNeedReauth(true);
        setBanner({
          text: 'For security, please confirm your password to continue.',
          type: 'info',
        });
      } else {
        setBanner({
          text: `Could not send SMS: ${err?.code || ''} ${err?.message || ''}`,
          type: 'error',
        });
        destroyRecaptcha();
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleReauthAndRetrySms() {
    const u = auth.currentUser || currentUser;
    if (!u) {
      setBanner({ text: 'You are not signed in anymore. Please log in and try again.', type: 'error' });
      setNeedReauth(false);
      return;
    }
    if (!reauthPassword.trim()) {
      setBanner({ text: 'Please enter your password to continue.', type: 'error' });
      return;
    }

    setBusy(true);
    setBanner({ text: '', type: 'info' });

    try {
      const cred = EmailAuthProvider.credential(email, reauthPassword);
      await reauthenticateWithCredential(u, cred);
      setNeedReauth(false);
      setReauthPassword('');

      // retry sending SMS
      await handleSendMfaCode();
    } catch (err: any) {
      setBanner({ text: `Re-auth failed: ${err?.code || ''} ${err?.message || ''}`, type: 'error' });
    } finally {
      setBusy(false);
    }
  }

  // -------- STEP 3: Verify code & enroll phone --------
  async function handleVerifySms() {
    if (busyRef.current) return;
    if (!verificationId) {
      setBanner({ text: 'No verification in progress. Send the code first.', type: 'error' });
      return;
    }

    const u = auth.currentUser || currentUser;
    if (!u) {
      setBanner({ text: 'You are not signed in. Log in and try again.', type: 'error' });
      return;
    }

    setBusy(true);
    setBanner({ text: '', type: 'info' });

    try {
      const phoneCred = PhoneAuthProvider.credential(verificationId, smsCode.trim());
      const assertion = PhoneMultiFactorGenerator.assertion(phoneCred);

      await multiFactor(u).enroll(assertion, 'Phone');

      await u.reload();
      const factors = multiFactor(auth.currentUser!).enrolledFactors || [];
      if (!factors.length) {
        setBanner({ text: 'Enrollment did not persist. Please try again.', type: 'error' });
        return;
      }

      setBanner({ text: 'Phone enrolled. You can now log in with SMS MFA.', type: 'success' });
    } catch (err: any) {
      setBanner({ text: `Enrollment failed: ${err?.code || ''} ${err?.message || ''}`, type: 'error' });
    } finally {
      setBusy(false);
      destroyRecaptcha();
    }
  }

  const appInfo = getApp().options as any; // Useful to confirm project at runtime

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow space-y-4">
      {banner.text && <Alert message={banner.text} type={banner.type as any} />}

      {import.meta.env.DEV && (
        <div className="text-xs text-gray-500 border p-2 rounded">
          Project: <b>{String(appInfo?.projectId || 'n/a')}</b> • Domain:{' '}
          <b>{String(appInfo?.authDomain || 'n/a')}</b>
        </div>
      )}

      {step === 'form' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <EmailField email={email} setEmail={setEmail} setEmailErrors={setEmailErrors} errors={emailErrors} />
          <PasswordField password={password} setPassword={setPassword} setPasswordErrors={setPasswordErrors} errors={passwordErrors} />
          <ConfirmPasswordField
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            password={password}
            setConfirmPasswordErrors={setConfirmPasswordErrors}
          />

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={enablePhone} onChange={(e) => setEnablePhone(e.target.checked)} />
            <span>Enable phone as 2nd factor</span>
          </label>

          {enablePhone && (
            <InputField
              label="Phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+15551234567"
              errors={phoneErrors}
            />
          )}

          <Button type="submit" className="w-full py-2 bg-blue-600 text-white rounded" disabled={busyRef.current}>
            Send Verification Email
          </Button>
        </form>
      )}

      {step === 'email-sent' && (
        <div className="space-y-3">
          <p>
            ✅ We sent a verification email to <b>{email}</b>. Verify it on the Firebase page, then come back here to enroll your phone.
          </p>
          {enablePhone && (
            <Button onClick={handleSendMfaCode} className="w-full py-2 bg-indigo-600 text-white rounded" disabled={busyRef.current}>
              Send SMS for 2FA Enrollment
            </Button>
          )}
        </div>
      )}

      {step === 'verify-sms' && (
        <div className="space-y-3">
          <InputField label="SMS Code" type="text" value={smsCode} onChange={(e) => setSmsCode(e.target.value)} placeholder="123456" errors={[]} />
          <Button onClick={handleVerifySms} className="w-full py-2 bg-green-600 text-white rounded" disabled={busyRef.current}>
            Verify & Complete 2FA
          </Button>
        </div>
      )}

      {/* Re-auth modal (simple inline) */}
      {needReauth && (
        <div className="p-3 border rounded bg-amber-50 space-y-2">
          <div className="text-sm">For security, please re-enter your password.</div>
          <InputField
            label="Password"
            type="password"
            value={reauthPassword}
            onChange={(e) => setReauthPassword(e.target.value)}
            placeholder="••••••••"
          />
          <div className="flex gap-2">
            <Button onClick={handleReauthAndRetrySms} className="bg-amber-600 text-white flex-1">Confirm</Button>
            <Button onClick={() => setNeedReauth(false)} className="flex-1">Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
}



/* // 2025-08-11 — email verification (in-app handler) + robust MFA enroll with fresh reCAPTCHA

import React, { useState, useRef } from 'react';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  RecaptchaVerifier,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  multiFactor,
  User,
} from 'firebase/auth';
import { getApp } from 'firebase/app';
import { auth } from '../../firebase/firebase';
import EmailField from '../common/EmailField';
import PasswordField from '../common/PasswordField';
import ConfirmPasswordField from '../common/ConfirmPasswordField';
import InputField from '../common/InputField';
import Button from '../common/Button';
import Alert from '../common/Alert';

type Step = 'form' | 'email-sent' | 'verify-sms';
type Props = { onRegister?: (email: string, uid: string) => void };

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    recaptchaContainerEl?: HTMLDivElement | null;
  }
}

function e164(s: string) {
  return s.trim();
}

export default function RegistrationForm({ onRegister }: Props): JSX.Element {
  // form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [enablePhone, setEnablePhone] = useState(false);
  const [phone, setPhone] = useState('');

  // enrollment
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [smsCode, setSmsCode] = useState('');

  // ui
  const [step, setStep] = useState<Step>('form');
  const [banner, setBanner] = useState<{text: string; type: 'error'|'success'|'info'}>({ text: '', type: 'info' });
  const busyRef = useRef(false);

  // errors from child fields (if they validate)
  const [emailErrors, setEmailErrors] = useState<string[]>([]);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [confirmPasswordErrors, setConfirmPasswordErrors] = useState<string[]>([]);
  const [phoneErrors, setPhoneErrors] = useState<string[]>([]);

  const setBusy = (v: boolean) => (busyRef.current = v);

  // --- reCAPTCHA lifecycle (create fresh, hidden container per send) ---
  function destroyRecaptcha() {
    try { if ((window as any).recaptchaVerifier?.clear) (window as any).recaptchaVerifier.clear(); } catch {}
    try { if (window.recaptchaContainerEl?.parentNode) window.recaptchaContainerEl.parentNode.removeChild(window.recaptchaContainerEl); } catch {}
    window.recaptchaVerifier = undefined;
    window.recaptchaContainerEl = null;
  }
  async function buildFreshRecaptcha() {
    destroyRecaptcha();
    const el = document.createElement('div');
    el.style.display = 'none';
    el.id = `recaptcha-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    document.body.appendChild(el);
    window.recaptchaContainerEl = el;
    window.recaptchaVerifier = new RecaptchaVerifier(auth as any, el, { size: 'invisible' });
    await window.recaptchaVerifier.render();
  }

  // STEP 1 — create user & send verification email with continue URL to our handler
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busyRef.current) return;

    if (password !== confirmPassword) {
      setBanner({ text: 'Passwords do not match.', type: 'error' });
      return;
    }
    if (emailErrors.length || passwordErrors.length || confirmPasswordErrors.length || phoneErrors.length) {
      setBanner({ text: 'Please fix the errors in the form.', type: 'error' });
      return;
    }

    setBusy(true);
    setBanner({ text: '', type: 'info' });
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      const actionCodeSettings = {
        url: `${window.location.origin}/verify-email-finish?email=${encodeURIComponent(email)}`,
        handleCodeInApp: true, // IMPORTANT: we will handle in VerifyEmailFinish
      };
      await sendEmailVerification(cred.user, actionCodeSettings);

      setCurrentUser(cred.user);
      setBanner({ text: `Verification email sent to ${email}.`, type: 'success' });
      setStep('email-sent');
      onRegister?.(email, cred.user.uid);
    } catch (err: any) {
      setBanner({ text: err?.message || 'Registration failed.', type: 'error' });
    } finally {
      setBusy(false);
    }
  }

  // STEP 2 — send SMS for MFA enrollment (fresh reCAPTCHA, body-attached)
  async function handleSendMfaCode() {
    if (busyRef.current || !currentUser) return;

    const num = e164(phone);
    if (!/^(\+)[1-9]\d{6,14}$/.test(num)) {
      setBanner({ text: 'Enter a valid phone (E.164), e.g., +15551234567.', type: 'error' });
      return;
    }

    setBusy(true);
    setBanner({ text: '', type: 'info' });
    try {
      await buildFreshRecaptcha();
      const mfaUser = multiFactor(currentUser);
      const session = await mfaUser.getSession();

      const provider = new PhoneAuthProvider(auth);
      const vId = await provider.verifyPhoneNumber({ phoneNumber: num, session }, window.recaptchaVerifier!);

      setVerificationId(vId);
      setBanner({ text: `Code sent to …${num.slice(-4)}.`, type: 'success' });
      setStep('verify-sms'); // after verifyPhoneNumber resolves (no container removal mid-flight)
    } catch (err: any) {
      setBanner({
        text: `Could not send SMS: ${err?.code || ''} ${err?.message || ''}`,
        type: 'error'
      });
      // keep container for a moment in case of human retry; it’s safe to destroy now too:
      destroyRecaptcha();
    } finally {
      setBusy(false);
    }
  }

  // STEP 3 — verify SMS & enroll phone
  async function handleVerifySms() {
    if (busyRef.current || !verificationId || !currentUser) return;
    setBusy(true);
    setBanner({ text: '', type: 'info' });

    try {
      const phoneCred = PhoneAuthProvider.credential(verificationId, smsCode.trim());
      const assertion = PhoneMultiFactorGenerator.assertion(phoneCred);
      await multiFactor(auth.currentUser || currentUser).enroll(assertion, 'Phone');
      setBanner({ text: 'Phone enrolled. You can now log in with SMS MFA.', type: 'success' });
    } catch (err: any) {
      setBanner({ text: `Enrollment failed: ${err?.code || ''} ${err?.message || ''}`, type: 'error' });
    } finally {
      setBusy(false);
      destroyRecaptcha();
    }
  }

  const appInfo = getApp().options as any; // { projectId, authDomain, ... }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow space-y-4">
      {banner.text && <Alert message={banner.text} type={banner.type as any} />}

      {import.meta.env.DEV && (
        <div className="text-xs text-gray-500 border p-2 rounded">
          Project: <b>{String(appInfo?.projectId || 'n/a')}</b> • Domain: <b>{String(appInfo?.authDomain || 'n/a')}</b>
        </div>
      )}

      {step === 'form' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <EmailField email={email} setEmail={setEmail} setEmailErrors={setEmailErrors} errors={emailErrors} />
          <PasswordField password={password} setPassword={setPassword} setPasswordErrors={setPasswordErrors} errors={passwordErrors} />
          <ConfirmPasswordField
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            password={password}
            setConfirmPasswordErrors={setConfirmPasswordErrors}
          />

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={enablePhone} onChange={e => setEnablePhone(e.target.checked)} />
            <span>Enable phone as 2nd factor</span>
          </label>

          {enablePhone && (
            <InputField
              label="Phone"
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+15551234567"
              errors={phoneErrors}
            />
          )}

          <Button type="submit" className="w-full py-2 bg-blue-600 text-white rounded" disabled={busyRef.current}>
            Send Verification Email
          </Button>
        </form>
      )}

      {step === 'email-sent' && (
        <div className="space-y-3">
          <p>✅ We sent a verification email to <b>{email}</b>. Click the link, which opens this app to finish.</p>
          {enablePhone && (
            <Button onClick={handleSendMfaCode} className="w-full py-2 bg-indigo-600 text-white rounded" disabled={busyRef.current}>
              Send SMS for 2FA Enrollment
            </Button>
          )}
        </div>
      )}

      {step === 'verify-sms' && (
        <div className="space-y-3">
          <InputField label="SMS Code" type="text" value={smsCode} onChange={e => setSmsCode(e.target.value)} placeholder="123456" errors={[]} />
          <Button onClick={handleVerifySms} className="w-full py-2 bg-green-600 text-white rounded" disabled={busyRef.current}>
            Verify & Complete 2FA
          </Button>
        </div>
      )}
    </div>
  );
}
 */
//----------------------------------------------------------
// // src/components/organisms/RegistrationForm.tsx
// // 2025-08-11 — Robust MFA enrollment (fresh reCAPTCHA per send) + clearer errors

// import React, { useState, useRef } from 'react';
// import {
//   createUserWithEmailAndPassword,
//   sendEmailVerification,
//   RecaptchaVerifier,
//   PhoneAuthProvider,
//   PhoneMultiFactorGenerator,
//   multiFactor,
//   User,
// } from 'firebase/auth';
// import { getApp } from 'firebase/app';
// import { auth } from '../../firebase/firebase';
// import EmailField from '../common/EmailField';
// import PasswordField from '../common/PasswordField';
// import ConfirmPasswordField from '../common/ConfirmPasswordField';
// import InputField from '../common/InputField';
// import Button from '../common/Button';
// import Alert from '../common/Alert';

// type Step = 'form' | 'email-sent' | 'verify-sms';
// type Props = { onRegister?: (email: string, uid: string) => void };

// declare global {
//   interface Window {
//     recaptchaVerifier?: RecaptchaVerifier;
//     recaptchaContainerEl?: HTMLDivElement | null;
//   }
// }

// function normalizeE164(input: string) {
//   return input.trim();
// }

// export default function RegistrationForm({ onRegister }: Props): JSX.Element {
//   // form
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [enablePhone, setEnablePhone] = useState(false);
//   const [phone, setPhone] = useState('');

//   // enrollment
//   const [currentUser, setCurrentUser] = useState<User | null>(null);
//   const [verificationId, setVerificationId] = useState<string | null>(null);
//   const [smsCode, setSmsCode] = useState('');

//   // ui
//   const [step, setStep] = useState<Step>('form');
//   const [banner, setBanner] = useState<{text: string; type: 'error'|'success'|'info'}>({ text: '', type: 'info' });
//   const busyRef = useRef(false);

//   // simple field errors coming from subcomponents
//   const [emailErrors, setEmailErrors] = useState<string[]>([]);
//   const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
//   const [confirmPasswordErrors, setConfirmPasswordErrors] = useState<string[]>([]);
//   const [phoneErrors, setPhoneErrors] = useState<string[]>([]);

//   function setBusy(b: boolean) { busyRef.current = b; }
//   function destroyRecaptcha() {
//     try {
//       if ((window as any).recaptchaVerifier?.clear) (window as any).recaptchaVerifier.clear();
//     } catch {}
//     try {
//       if (window.recaptchaContainerEl && window.recaptchaContainerEl.parentNode) {
//         window.recaptchaContainerEl.parentNode.removeChild(window.recaptchaContainerEl);
//       }
//     } catch {}
//     window.recaptchaVerifier = undefined;
//     window.recaptchaContainerEl = null;
//   }
//   async function buildFreshRecaptcha() {
//     destroyRecaptcha();
//     const el = document.createElement('div');
//     el.style.display = 'none';
//     el.id = `recaptcha-${Date.now()}-${Math.random().toString(36).slice(2)}`;
//     document.body.appendChild(el);
//     window.recaptchaContainerEl = el;
//     window.recaptchaVerifier = new RecaptchaVerifier(auth as any, el, { size: 'invisible' });
//     await window.recaptchaVerifier.render();
//   }

//   // STEP 1 — create account, send verify email
//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     if (busyRef.current) return;

//     if (password !== confirmPassword) {
//       setBanner({ text: 'Passwords do not match.', type: 'error' });
//       return;
//     }
//     if (emailErrors.length || passwordErrors.length || confirmPasswordErrors.length || phoneErrors.length) {
//       setBanner({ text: 'Please fix the errors in the form.', type: 'error' });
//       return;
//     }

//     setBusy(true);
//     setBanner({ text: '', type: 'info' });
//     try {
//       const cred = await createUserWithEmailAndPassword(auth, email, password);
//       await sendEmailVerification(cred.user);
//       setCurrentUser(cred.user);
//       setBanner({ text: `Verification email sent to ${email}.`, type: 'success' });
//       setStep('email-sent');
//       onRegister?.(email, cred.user.uid);
//     } catch (err: any) {
//       setBanner({ text: err?.message || 'Registration failed.', type: 'error' });
//     } finally {
//       setBusy(false);
//     }
//   }

//   // STEP 2 — send SMS for MFA enrollment
//   async function handleSendMfaCode() {
//     if (busyRef.current || !currentUser) return;

//     const e164 = normalizeE164(phone);
//     if (!/^(\+)[1-9]\d{6,14}$/.test(e164)) {
//       setBanner({ text: 'Enter a valid phone number in E.164 format (e.g., +15551234567).', type: 'error' });
//       return;
//     }

//     setBusy(true);
//     setBanner({ text: '', type: 'info' });
//     try {
//       await buildFreshRecaptcha();
//       const mfaUser = multiFactor(currentUser);
//       const session = await mfaUser.getSession();
//       const provider = new PhoneAuthProvider(auth);
//       const vId = await provider.verifyPhoneNumber({ phoneNumber: e164, session }, window.recaptchaVerifier!);
//       setVerificationId(vId);
//       setBanner({ text: `Code sent to …${e164.slice(-4)}.`, type: 'success' });
//       setStep('verify-sms');
//     } catch (err: any) {
//       // Common root causes across two sites/projects
//       // auth/operation-not-allowed (Phone not enabled), auth/unauthorized-domain,
//       // auth/captcha-check-failed, auth/invalid-app-credential, auth/too-many-requests
//       setBanner({ text: `Could not send SMS: ${err?.code || ''} ${err?.message || ''}`, type: 'error' });
//       destroyRecaptcha();
//     } finally {
//       setBusy(false);
//     }
//   }

//   // STEP 3 — verify code and enroll phone
//   async function handleVerifySms() {
//     if (busyRef.current || !verificationId || !currentUser) return;
//     setBusy(true);
//     setBanner({ text: '', type: 'info' });

//     try {
//       const phoneCred = PhoneAuthProvider.credential(verificationId, smsCode.trim());
//       const assertion = PhoneMultiFactorGenerator.assertion(phoneCred);
//       await multiFactor(auth.currentUser || currentUser).enroll(assertion, 'Phone');
//       setBanner({ text: 'Phone enrolled. You can now log in with SMS MFA.', type: 'success' });
//     } catch (err: any) {
//       setBanner({ text: `Enrollment failed: ${err?.code || ''} ${err?.message || ''}`, type: 'error' });
//     } finally {
//       setBusy(false);
//       destroyRecaptcha();
//     }
//   }

//   // Small debug badge so you can confirm you’re on the right project/site
//   const appInfo = getApp().options as any; // {projectId, authDomain, apiKey...}

//   return (
//     <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow space-y-4">
//       {banner.text && <Alert message={banner.text} type={banner.type as any} />}

//       {import.meta.env.DEV && (
//         <div className="text-xs text-gray-500 border p-2 rounded">
//           Project: <b>{String(appInfo?.projectId || 'n/a')}</b> • Domain: <b>{String(appInfo?.authDomain || 'n/a')}</b>
//         </div>
//       )}

//       {step === 'form' && (
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <EmailField email={email} setEmail={setEmail} setEmailErrors={setEmailErrors} errors={emailErrors} />
//           <PasswordField password={password} setPassword={setPassword} setPasswordErrors={setPasswordErrors} errors={passwordErrors} />
//           <ConfirmPasswordField
//             confirmPassword={confirmPassword}
//             setConfirmPassword={setConfirmPassword}
//             password={password}
//             setConfirmPasswordErrors={setConfirmPasswordErrors}
//           />

//           <label className="flex items-center gap-2 text-sm">
//             <input type="checkbox" checked={enablePhone} onChange={e => setEnablePhone(e.target.checked)} />
//             <span>Enable phone as 2nd factor</span>
//           </label>

//           {enablePhone && (
//             <InputField
//               label="Phone"
//               type="tel"
//               value={phone}
//               onChange={e => setPhone(e.target.value)}
//               placeholder="+15551234567"
//               errors={phoneErrors}
//             />
//           )}

//           {/* We build/destroy reCAPTCHA dynamically; no fixed container needed here */}

//           <Button type="submit" className="w-full py-2 bg-blue-600 text-white rounded" disabled={busyRef.current}>
//             Send Verification Email
//           </Button>
//         </form>
//       )}

//       {step === 'email-sent' && (
//         <div className="space-y-3">
//           <p>✅ We sent a verification email to <b>{email}</b>. You can enroll phone now or later.</p>
//           {enablePhone && (
//             <Button onClick={handleSendMfaCode} className="w-full py-2 bg-indigo-600 text-white rounded" disabled={busyRef.current}>
//               Send SMS for 2FA Enrollment
//             </Button>
//           )}
//         </div>
//       )}

//       {step === 'verify-sms' && (
//         <div className="space-y-3">
//           <InputField label="SMS Code" type="text" value={smsCode} onChange={e => setSmsCode(e.target.value)} placeholder="123456" errors={[]} />
//           <Button onClick={handleVerifySms} className="w-full py-2 bg-green-600 text-white rounded" disabled={busyRef.current}>
//             Verify & Complete 2FA
//           </Button>
//         </div>
//       )}
//     </div>
//   );
// }


/* //04.20.25

// src/components/organisms/RegistrationForm.tsx
import React, { useState, useEffect, FormEvent } from 'react';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  RecaptchaVerifier,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  multiFactor,
  User,
  AuthError
} from 'firebase/auth';
import { auth } from '../../firebase/firebase';
import EmailField from '../common/EmailField';
import PasswordField from '../common/PasswordField';
import ConfirmPasswordField from '../common/ConfirmPasswordField';
import InputField from '../common/InputField';
import Button from '../common/Button';
import Alert from '../common/Alert';

// Extend window for recaptchaVerifier
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

type Step = 'form' | 'email-sent' | 'verify-sms';

type Message = { message: string; type: 'error' | 'success' };

export default function RegistrationForm(): JSX.Element {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [enablePhone, setEnablePhone] = useState<boolean>(false);
  const [phone, setPhone] = useState<string>('');
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [smsCode, setSmsCode] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [error, setError] = useState<string>('');
  const [step, setStep] = useState<Step>('form');

  // Input validation errors
  const [emailErrors, setEmailErrors] = useState<string[]>([]);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [confirmPasswordErrors, setConfirmPasswordErrors] = useState<string[]>([]);
  const [phoneErrors, setPhoneErrors] = useState<string[]>([]);

  // Initialize invisible reCAPTCHA once
  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,                       // ← auth first
        'recaptcha-container',      // ← container ID second
        { size: 'invisible' }       // ← options third
      );
      // Render the invisible widget
      window.recaptchaVerifier
        .render()
        .catch(err => console.error('reCAPTCHA render failed:', err));
    }
  }, []);

  // STEP 1: Create account and send email verification
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Password match check
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Validate fields
    if (
      emailErrors.length ||
      passwordErrors.length ||
      confirmPasswordErrors.length ||
      phoneErrors.length
    ) {
      setError('Please fix the errors in the form.');
      return;
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(cred.user);
      setCurrentUser(cred.user);
      setStep('email-sent');
    } catch (err: unknown) {
      const authErr = err as AuthError;
      setError(authErr.message);
    }
  };

  // STEP 2: Send SMS for MFA enrollment
  const handleSendMfaCode = async () => {
    setError('');
    if (!currentUser) return;

    try {
      const mfaUser = multiFactor(currentUser);
      const session = await mfaUser.getSession();
      const provider = new PhoneAuthProvider(auth);
      const vId = await provider.verifyPhoneNumber(
        { phoneNumber: phone, session },
        window.recaptchaVerifier!
      );
      setVerificationId(vId);
      setStep('verify-sms');
    } catch (err: unknown) {
      const authErr = err as AuthError;
      setError(authErr.message);
    }
  };

  // STEP 3: Verify SMS and complete enrollment
  const handleVerifySms = async () => {
    setError('');
    if (!verificationId) return;

    try {
      const phoneCred = PhoneAuthProvider.credential(verificationId, smsCode);
      const assertion = PhoneMultiFactorGenerator.assertion(phoneCred);
      await multiFactor(auth.currentUser!).enroll(assertion, 'Phone');
      alert('✅ Account created! Please log in after verifying your email.');
    } catch (err: unknown) {
      const authErr = err as AuthError;
      setError(authErr.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      {step === 'form' && (
        <>
          <h1 className="text-2xl font-bold mb-6">Register</h1>
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
           <ConfirmPasswordField
  confirmPassword={confirmPassword}
  setConfirmPassword={setConfirmPassword}
  password={password}
  setConfirmPasswordErrors={setConfirmPasswordErrors}
/>

            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={enablePhone}
                onChange={e => setEnablePhone(e.target.checked)}
              />
              <span>Enable phone as 2nd factor</span>
            </label>

            {enablePhone && (
              <InputField
                label="Phone"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+1 555 123 4567"
                errors={phoneErrors}
              />
            )}

            <div id="recaptcha-container"></div>

            <Button type="submit" className="w-full py-2 bg-blue-600 text-white rounded">
              Send Verification Email
            </Button>
          </form>
          {error && <p className="mt-4 text-red-500">{error}</p>}
        </>
      )}

      {step === 'email-sent' && (
        <div>
          <p className="mb-4">
            ✅ Verification email sent to <strong>{email}</strong>. Please verify before logging in.
          </p>
          {enablePhone && (
            <>
              <Button
                onClick={handleSendMfaCode}
                className="mb-4 w-full py-2 bg-indigo-600 text-white rounded"
              >
                Send SMS for 2FA Enrollment
              </Button>
              {error && <p className="text-red-500">{error}</p>}
            </>
          )}
        </div>
      )}

      {step === 'verify-sms' && (
        <div className="space-y-3">
          <p>Enter the SMS code we just sent:</p>
          <InputField
            label="SMS Code"
            type="text"
            value={smsCode}
            onChange={e => setSmsCode(e.target.value)}
            placeholder="123456"
            errors={[]}
          />
          <Button onClick={handleVerifySms} className="w-full py-2 bg-green-600 text-white rounded">
            Verify & Complete 2FA
          </Button>
          {error && <p className="text-red-500">{error}</p>}
        </div>
      )}
    </div>
  );
} */


// src/components/organisms/RegistrationForm.tsx
/* import React, { useState, useEffect, FormEvent } from 'react';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  RecaptchaVerifier,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  multiFactor,
  User,
  AuthError
} from 'firebase/auth';
import { auth } from '../../firebase/firebase';
import EmailField from '../common/EmailField';
import PasswordField from '../common/PasswordField';
import ConfirmPasswordField from '../common/ConfirmPasswordField';
import InputField from '../common/InputField';
import Button from '../common/Button';
import Alert from '../common/Alert';
// Extend window for recaptchaVerifier
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

type Step = 'form' | 'email-sent' | 'verify-sms';

export default function RegistrationForm(): JSX.Element {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [enablePhone, setEnablePhone] = useState<boolean>(false);
  const [phone, setPhone] = useState<string>('');
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [smsCode, setSmsCode] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [error, setError] = useState<string>('');
  const [step, setStep] = useState<Step>('form');
  // Email/password errors 
  
   const [emailErrors, setEmailErrors] = useState<string[]>([]);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [confirmPasswordErrors, setConfirmPasswordErrors] = useState<string[]>([]);
  const [phoneErrors, setPhoneErrors] = useState<string[]>([]);
  // Initialize invisible reCAPTCHA once
  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        'recaptcha-container',
        { size: 'invisible' },
        auth
      );
    }
  }, []);

  // STEP 1: Create account and send email verification
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

     // Check if there are errors in input validation
    if (
      emailErrors.length > 0 ||
      passwordErrors.length > 0 ||
      confirmPasswordErrors.length > 0 ||
      phoneErrors.length > 0
    ) {
      setMessage({ message: 'Please fix the errors in the form.', type: 'error' });
      return;
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(cred.user);
      setCurrentUser(cred.user);
      setStep('email-sent');
    } catch (err: unknown) {
      const authErr = err as AuthError;
      setError(authErr.message);
    }
  };

  // STEP 2: Send SMS for MFA enrollment
  const handleSendMfaCode = async () => {
    setError('');
    if (!currentUser) return;

    try {
      const mfaUser = multiFactor(currentUser);
      const session = await mfaUser.getSession();
      const provider = new PhoneAuthProvider(auth);
      const vId = await provider.verifyPhoneNumber(
        { phoneNumber: phone, session },
        window.recaptchaVerifier!
      );
      setVerificationId(vId);
      setStep('verify-sms');
    } catch (err: unknown) {
      const authErr = err as AuthError;
      setError(authErr.message);
    }
  };

  // STEP 3: Verify SMS and complete enrollment
  const handleVerifySms = async () => {
    setError('');
    if (!verificationId) return;

    try {
      const phoneCred = PhoneAuthProvider.credential(verificationId, smsCode);
      const assertion = PhoneAuthProvider.assertion
        ? PhoneMultiFactorGenerator.assertion(phoneCred)
        : PhoneMultiFactorGenerator.assertion(phoneCred);
      await multiFactor(auth.currentUser!).enroll(assertion, 'Phone');
      // Optionally redirect to login
      alert('✅ Account created! Please log in after verifying your email.');
    } catch (err: unknown) {
      const authErr = err as AuthError;
      setError(authErr.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      {step === 'form' && (
        <>
          <h1 className="text-2xl font-bold mb-6">Register</h1>
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
              
            <ConfirmPasswordField
             confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            password={password}             
            ConfirmPasswordErrors={setConfirmPasswordErrors}             
            />
          
            
    

            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={enablePhone}
                onChange={e => setEnablePhone(e.target.checked)}
              />
              <span>Enable phone as 2nd factor</span>
            </label>

            {enablePhone && (
              <input
                type="tel"
                required
                placeholder="+1 555 123 4567"
                className="w-full px-3 py-2 border rounded"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            )}

            <div id="recaptcha-container"></div>

            <button
              type="submit"
              className="w-full py-2 bg-blue-600 text-white rounded"
            >
              Send Verification Email
            </button>
          </form>
          {error && <p className="mt-4 text-red-500">{error}</p>}
        </>
      )}

      {step === 'email-sent' && (
        <div>
          <p className="mb-4">
            ✅ Verification email sent to <strong>{email}</strong>. Please verify before logging in.
          </p>
          {enablePhone && (
            <>
              <button
                onClick={handleSendMfaCode}
                className="mb-4 w-full py-2 bg-indigo-600 text-white rounded"
              >
                Send SMS for 2FA Enrollment
              </button>
              {error && <p className="text-red-500">{error}</p>}
            </>
          )}
        </div>
      )}

      {step === 'verify-sms' && (
        <div className="space-y-3">
          <p>Enter the SMS code we just sent:</p>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded"
            placeholder="123456"
            value={smsCode}
            onChange={e => setSmsCode(e.target.value)}
          />
          <button
            onClick={handleVerifySms}
            className="w-full py-2 bg-green-600 text-white rounded"
          >
            Verify & Complete 2FA
          </button>
          {error && <p className="text-red-500">{error}</p>}
        </div>
      )}
    </div>
  );
}
 */

// import React, { useState } from 'react';
// import {
//   getAuth,
//   sendSignInLinkToEmail,
//   createUserWithEmailAndPassword,
//   sendEmailVerification,
//   signInWithPhoneNumber,
//   RecaptchaVerifier,
//   linkWithCredential,
//   EmailAuthProvider,
//   UserCredential,
// } from "firebase/auth";
// import { auth } from "../../firebase/firebase";
// import EmailField from "../common/EmailField";
// import PasswordField from "../common/PasswordField";
// import ConfirmPasswordField from "../common/ConfirmPasswordField";
// import PhoneNumberField from "../common/PhoneNumberField";
// import Alert from "../common/Alert";
// import Button from "../common/Button";
// import InputField from "../common/InputField";

// const RegistrationForm: React.FC = () => {
//   const [email, setEmail] = useState<string>('');
//   const [password, setPassword] = useState<string>('');
//   const [confirmPassword, setConfirmPassword] = useState<string>('');
//   const [phoneNumber, setPhoneNumber] = useState<string>('');
//   const [verificationCode, setVerificationCode] = useState<string>('');
//   const [verificationSent, setVerificationSent] = useState<boolean>(false);
//   const [message, setMessage] = useState<{ message: string; type: string }>({ message: '', type: '' });
//   const [emailErrors, setEmailErrors] = useState<string[]>([]);
//   const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
//   const [confirmPasswordErrors, setConfirmPasswordErrors] = useState<string[]>([]);
//   const [phoneErrors, setPhoneErrors] = useState<string[]>([]);

//   const handleRegister = async (e: React.FormEvent) => {
//     e.preventDefault();

//     // Validate inputs
//     if (
//       emailErrors.length > 0 ||
//       passwordErrors.length > 0 ||
//       confirmPasswordErrors.length > 0 ||
//       phoneErrors.length > 0
//     ) {
//       setMessage({ message: 'Please fix the errors in the form.', type: 'error' });
//       return;
//     }

//     try {
//       // Create user with email and password
//       const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
//       const user = userCredential.user;

//       // Send email verification
//       await sendEmailVerification(user);
//       setMessage({ message: 'A verification email has been sent to your email address.', type: 'success' });

//       // Send SMS verification
//       const appVerifier = window.recaptchaVerifier;
//       const formattedPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
//       const confirmationResult = await signInWithPhoneNumber(auth, formattedPhoneNumber, appVerifier);

//       window.confirmationResult = confirmationResult;
//       setVerificationSent(true);
//       setMessage({ message: 'Verification code sent to your phone.', type: 'success' });
//     } catch (error: any) {
//       console.error('Error during registration:', error);
//       setMessage({ message: `Error: ${error.message}`, type: 'error' });
//     }
//   };

//   const handleVerifyCode = async (e: React.FormEvent) => {
//     e.preventDefault();

//     try {
//       const result = await window.confirmationResult.confirm(verificationCode);
//       const phoneUser = result.user;

//       const credential = EmailAuthProvider.credential(email, password);
//       await linkWithCredential(phoneUser, credential);

//       setMessage({ message: 'Registration successful. Email and phone verified.', type: 'success' });
//     } catch (error: any) {
//       console.error('Error verifying code:', error);
//       setMessage({ message: `Error verifying code: ${error.message}`, type: 'error' });
//     }
//   };

//   return (
//     <div>
//       <form onSubmit={verificationSent ? handleVerifyCode : handleRegister}>
//         {!verificationSent ? (
//           <>
//             {/* Email Field */}
//             <EmailField email={email} setEmail={setEmail} setEmailErrors={setEmailErrors} />

//             {/* Password Field */}
//             <PasswordField password={password} setPassword={setPassword} setPasswordErrors={setPasswordErrors} />

//             {/* Confirm Password Field */}
//             <ConfirmPasswordField
//               confirmPassword={confirmPassword}
//               setConfirmPassword={setConfirmPassword}
//               password={password}
//               setConfirmPasswordErrors={setConfirmPasswordErrors}
//             />

//             {/* Phone Number Field */}
//             <PhoneNumberField
//               phoneNumber={phoneNumber}
//               setPhoneNumber={setPhoneNumber}
//               setPhoneErrors={setPhoneErrors}
//               errors={phoneErrors}
//             />

//             {/* Display Messages */}
//             {message.message && <Alert message={message.message} type={message.type} />}

//             <Button type="submit" className="w-full bg-green-500 hover:bg-green-700">
//               Register
//             </Button>
//           </>
//         ) : (
//           <>
//             {/* Verification Code Field */}
//             <InputField
//               label="Verification Code"
//               type="text"
//               value={verificationCode}
//               onChange={(e) => setVerificationCode(e.target.value)}
//               placeholder="Enter the verification code sent to your phone"
//             />
//             {message.message && <Alert message={message.message} type={message.type} />}
//             <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-700">
//               Verify Code
//             </Button>
//           </>
//         )}
//         <div id="recaptcha-container"></div>
//       </form>
//     </div>
//   );
// };

// export default RegistrationForm;

/* ---------------------------------------------
   Below are the commented-out previous versions
   ---------------------------------------------
   - Simple email-only registration (v1)
   - Basic email + password registration (v2)
   - Full implementation with phone and email (v3)
*/


//+++++++++++JS version+++++++++++++++++
// src/components/forms/RegistrationForm.jsx

//Js version
/* import React, { useState } from 'react';
import { getAuth, sendSignInLinkToEmail } from "firebase/auth";

const RegistrationForm = () => {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSendVerification = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    const actionCodeSettings = {
      url: 'http://localhost:3000/complete-registration', // Update with your app's domain
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      setSuccess("A verification link has been sent to your email. Please verify to continue.");
      window.localStorage.setItem('emailForRegistration', email); // Save email temporarily
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSendVerification}>
      <h2>Register</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit">Send Verification Link</button>
    </form>
  );
};

export default RegistrationForm; */







// src/components/RegistrationForm.jsx
//   users receive a verification email after registering but does not prevent Firebase from creating the user record before email verification. T. ( even junk mail) 
 
/*     import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";

const RegistrationForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    const auth = getAuth();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      setSuccess("Registration successful. Verification email sent!");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <h2>Register</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Register</button>
    </form>
  );
};

export default RegistrationForm; */
 

// src/components/RegistrationForm.jsx version1
//doesnt work. it gets error and despite that it create a user including junk . no verification // the interface is ok. including the phone number full implementaiton of flexilbe phone .
//   import React, { useState, useEffect } from 'react';
// import { auth, RecaptchaVerifier,EmailAuthProvider, signInWithPhoneNumber } from '../../firebase/firebase';
// import {
//   createUserWithEmailAndPassword,
//   sendEmailVerification,
//     linkWithCredential,
// } from 'firebase/auth';
// import EmailField from '../common/EmailField';
// import PasswordField from '../common/PasswordField';
// import ConfirmPasswordField from '../common/ConfirmPasswordField';
// import PhoneNumberField from '../common/PhoneNumberField';
// import Alert from '../common/Alert';
// import Button from '../common/Button';
// import { validateEmail, validatePassword, validatePhoneNumber } from '../../utils/validation';
// import InputField from '../common/InputField';


// const RegistrationForm = () => {
//   const [email, setEmail] = useState('');
//   const [emailErrors, setEmailErrors] = useState([]);
//   const [password, setPassword] = useState('');
//   const [passwordErrors, setPasswordErrors] = useState([]);
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [confirmPasswordErrors, setConfirmPasswordErrors] = useState([]);
//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [phoneErrors, setPhoneErrors] = useState([]);
//   const [verificationCode, setVerificationCode] = useState('');
//   const [verificationSent, setVerificationSent] = useState(false);
//   const [emailVerified, setEmailVerified] = useState(false);
//   const [message, setMessage] = useState({ message: '', type: '' });

//   // Initialize reCAPTCHA
// /*   useEffect(() => {
//     if (!window.recaptchaVerifier) {
//       window.recaptchaVerifier = new RecaptchaVerifier(
//         'recaptcha-container',
//         {
//           size: 'invisible',
//           callback: (response) => {
//             console.log('reCAPTCHA solved:', response);
//           },
//           'expired-callback': () => {
//             window.recaptchaVerifier.reset();
//           },
//         },
//         auth
//       );
//     }
//   }, []);
//  */
//   // Handle form submissions
//   const handleRegister = async (e) => {
//     e.preventDefault();

//     // Check if there are errors in input validation
//     if (
//       emailErrors.length > 0 ||
//       passwordErrors.length > 0 ||
//       confirmPasswordErrors.length > 0 ||
//       phoneErrors.length > 0
//     ) {
//       setMessage({ message: 'Please fix the errors in the form.', type: 'error' });
//       return;
//     }

//     try {
//       // Step 1: Register user with email and password
//       const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//       const user = userCredential.user;

//       // Step 2: Send email verification
//       await sendEmailVerification(user);
//       setMessage({ message: 'A verification email has been sent to your email address.', type: 'success' });

//       // Step 3: Send SMS verification code to phone number
//       const appVerifier = window.recaptchaVerifier;
//       const formattedPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber : '+' + phoneNumber;
//       const confirmationResult = await signInWithPhoneNumber(auth, formattedPhoneNumber, appVerifier);

//       window.confirmationResult = confirmationResult;
//       setVerificationSent(true);
//       setMessage({ message: 'Verification code sent to your phone.', type: 'success' });
//     } catch (error) {
//       console.error('Error during registration:', error);
//       setMessage({ message: `Error: ${error.message}`, type: 'error' });
//     }
//   };

//   // Handle verification code submission
//   const handleVerifyCode = async (e) => {
//     e.preventDefault();

//     try {
//       const result = await window.confirmationResult.confirm(verificationCode);
//       const phoneUser = result.user;

//       const credential = EmailAuthProvider.credential(email, password);
//       await linkWithCredential(phoneUser, credential);

//       setMessage({ message: 'Registration successful. Email and phone verified.', type: 'success' });
//     } catch (error) {
//       console.error('Error verifying code:', error);
//       setMessage({ message: `Error verifying code: ${error.message}`, type: 'error' });
//     }
//   };

//   return (
//     <div>
//       <form onSubmit={verificationSent ? handleVerifyCode : handleRegister}>
//         {!verificationSent ? (
//           <>
//             {/* Email Field */}
//             <EmailField
//               email={email}
//               setEmail={setEmail}
//               setEmailErrors={setEmailErrors}
//             />
            
//             {/* Password Field */}
//             <PasswordField
//               password={password}
//               setPassword={setPassword}
//               setPasswordErrors={setPasswordErrors}
//             />

//             {/* Confirm Password Field */}
//             <ConfirmPasswordField
//               confirmPassword={confirmPassword}
//               setConfirmPassword={setConfirmPassword}
//               password={password}
//               setConfirmPasswordErrors={setConfirmPasswordErrors}
//             />

//             {/* Phone Number Field */}
//             <PhoneNumberField
//               phoneNumber={phoneNumber}
//               setPhoneNumber={setPhoneNumber}
//               setPhoneErrors={setPhoneErrors}
//               errors={phoneErrors}
//             />

//             {/* Display Messages */}
//             {message.message && <Alert message={message.message} type={message.type} />}

//             <Button type="submit" className="w-full bg-green-500 hover:bg-green-700">
//               Register
//             </Button>
//           </>
//         ) : (
//           <>
//             {/* Verification Code Field */}
//             <InputField
//               label="Verification Code"
//               type="text"
//               value={verificationCode}
//               onChange={(e) => setVerificationCode(e.target.value)}
//               placeholder="Enter the verification code sent to your phone"
//             />
//             {message.message && <Alert message={message.message} type={message.type} />}
//             <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-700">
//               Verify Code
//             </Button>
//           </>
//         )}
//         <div id="recaptcha-container"></div>
//       </form>
//     </div>
//   );
// };

// export default RegistrationForm;
 