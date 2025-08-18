// src/components/common/EnrollPhoneModal.tsx

//###################################################################
// src/components/common/EnrollPhoneModal.tsx
// First-login phone enrollment with 3 attempts + countdown + auto-resend
import React, { useEffect, useRef, useState } from 'react';
import {
  RecaptchaVerifier,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  multiFactor,
  reauthenticateWithCredential,
  EmailAuthProvider,
  reload,
  type User,
} from 'firebase/auth';
import { auth } from '../../firebase/firebase';
import PhoneNumberField from './PhoneNumberField';

type Banner = { text: string; type: 'info' | 'success' | 'error' };

// --- knobs to match LoginForm UX ---
const MAX_CODE_ATTEMPTS = 3;
const AUTO_RESEND_COOLDOWN_SECONDS = 30;
// -----------------------------------

export default function EnrollPhoneModal({
  user,
  initialPhoneE164 = '',
  onDone,
  onSkip,
}: {
  user: User;
  initialPhoneE164?: string;
  onDone: () => void;
  onSkip: () => void;
}) {
  const [phone, setPhone] = useState(initialPhoneE164 || '');
  const [phoneErrors, setPhoneErrors] = useState<string[]>([]);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState<Banner | null>(null);

  // reauth
  const [needReauth, setNeedReauth] = useState(false);
  const [reauthPassword, setReauthPassword] = useState('');

  // attempts + countdown
  const [codeAttempts, setCodeAttempts] = useState(0);
  const [autoResend, setAutoResend] = useState(0);
  const autoResendRef = useRef<number | null>(null);

  // recaptcha
  const recaptchaContainerIdRef = useRef<string | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);

  function teardownRecaptcha() {
    try { recaptchaRef.current?.clear?.(); } catch {}
    if (recaptchaContainerIdRef.current) {
      const el = document.getElementById(recaptchaContainerIdRef.current);
      if (el?.parentNode) el.parentNode.removeChild(el);
      recaptchaContainerIdRef.current = null;
    }
    recaptchaRef.current = null;
  }

  useEffect(() => () => {
    teardownRecaptcha();
    if (autoResendRef.current) {
      window.clearInterval(autoResendRef.current);
      autoResendRef.current = null;
    }
  }, []);

  async function buildInvisibleRecaptcha() {
    teardownRecaptcha();
    const id = `recaptcha-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const div = document.createElement('div');
    div.id = id;
    div.style.display = 'none';
    document.body.appendChild(div);
    recaptchaContainerIdRef.current = id;

    // v10 signature
    const verifier = new RecaptchaVerifier(auth as any, id, { size: 'invisible' });
    await verifier.render();
    recaptchaRef.current = verifier;
  }

  function startAutoResendCountdown() {
    if (autoResendRef.current) {
      window.clearInterval(autoResendRef.current);
      autoResendRef.current = null;
    }
    setAutoResend(AUTO_RESEND_COOLDOWN_SECONDS);
    setBanner({ text: `Too many attempts. Auto-resending in ${AUTO_RESEND_COOLDOWN_SECONDS}s…`, type: 'error' });

    autoResendRef.current = window.setInterval(async () => {
      setAutoResend((s) => {
        const nxt = s - 1;
        if (nxt <= 0) {
          if (autoResendRef.current) {
            window.clearInterval(autoResendRef.current);
            autoResendRef.current = null;
          }
          // fire auto-resend
          void handleSendCode(true);
          return 0;
        }
        return nxt;
      });
    }, 1000) as unknown as number;
  }

  function clearCountdown() {
    if (autoResendRef.current) {
      window.clearInterval(autoResendRef.current);
      autoResendRef.current = null;
    }
    setAutoResend(0);
  }

  function isValidE164(s: string) {
    return /^\+[1-9]\d{6,14}$/.test(s.trim());
  }

  async function handleSendCode(auto = false) {
    if (busy) return;
    if (autoResend > 0 && !auto) return;

    // Ensure phone is a real E.164
    if (phoneErrors.length) {
      setBanner({ text: 'Please fix the phone number.', type: 'error' });
      return;
    }
    const e164 = phone.trim();
    if (!isValidE164(e164)) {
      setBanner({ text: 'Enter a valid phone (E.164), e.g. +15551234567.', type: 'error' });
      return;
    }

    setBusy(true);
    setBanner(auto ? { text: 'Sending a new code…', type: 'info' } : null);

    try {
      await buildInvisibleRecaptcha();
      const mfaUser = multiFactor(user);
      const session = await mfaUser.getSession();
      const provider = new PhoneAuthProvider(auth);
      const vId = await provider.verifyPhoneNumber({ phoneNumber: e164, session }, recaptchaRef.current!);

      setVerificationId(vId);
      setCode('');
      setCodeAttempts(0);
      clearCountdown(); // fresh send clears countdown
      setBanner({ text: auto ? 'A new code was sent automatically.' : `Code sent to …${e164.slice(-4)}.`, type: auto ? 'success' : 'success' });
    } catch (err: any) {
      if (err?.code === 'auth/requires-recent-login') {
        setNeedReauth(true);
        setBanner({ text: 'Please confirm your password to continue.', type: 'info' });
      } else if (err?.code === 'auth/too-many-requests') {
        setBanner({ text: 'Too many requests. Please wait a bit and try again.', type: 'error' });
      } else if (err?.code === 'auth/invalid-phone-number') {
        setBanner({ text: 'That phone number is not valid.', type: 'error' });
      } else {
        setBanner({ text: err?.message || 'Could not send code.', type: 'error' });
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleReauth() {
    if (!reauthPassword.trim()) {
      setBanner({ text: 'Enter your password to continue.', type: 'error' });
      return;
    }
    setBusy(true);
    setBanner(null);
    try {
      const cred = EmailAuthProvider.credential(user.email || '', reauthPassword);
      await reauthenticateWithCredential(user, cred);
      setNeedReauth(false);
      setReauthPassword('');
      await handleSendCode();
    } catch (err: any) {
      setBanner({ text: `Re-auth failed: ${err?.code || ''} ${err?.message || ''}`, type: 'error' });
    } finally {
      setBusy(false);
    }
  }

  async function handleVerifyEnroll() {
    if (!verificationId) {
      setBanner({ text: 'Please send a code first.', type: 'error' });
      return;
    }
    if (!code.trim()) return;

    // Lock UI during verify (also blocked during countdown)
    setBusy(true);
    setBanner(null);

    try {
      const cred = PhoneAuthProvider.credential(verificationId, code.trim());
      const assertion = PhoneMultiFactorGenerator.assertion(cred);
      await multiFactor(user).enroll(assertion, 'Phone');

      await reload(user);
      if (localStorage.getItem('pending_phone_e164') === phone) {
        localStorage.removeItem('pending_phone_e164');
      }

      setBanner({ text: 'Phone linked. MFA enabled.', type: 'success' });
      teardownRecaptcha();
      onDone();
    } catch (err: any) {
      // Friendly messages + attempt tracking
      if (err?.code === 'auth/invalid-verification-code' || err?.code === 'auth/code-expired' || err?.code === 'auth/argument-error') {
        const next = codeAttempts + 1;
        setCodeAttempts(next);
        setCode('');

        if (next >= MAX_CODE_ATTEMPTS) {
          // Start countdown; auto-resend when it hits 0
          startAutoResendCountdown();
        } else {
          setBanner({ text: `The code is incorrect or expired. (${next}/${MAX_CODE_ATTEMPTS})`, type: 'error' });
        }
      } else if (err?.code === 'auth/too-many-requests') {
        setBanner({ text: 'Too many attempts. Please wait a bit and try again.', type: 'error' });
      } else {
        setBanner({ text: err?.message || 'Could not enroll phone.', type: 'error' });
      }
    } finally {
      setBusy(false);
    }
  }

  function handleSkipNow() {
    teardownRecaptcha();
    onSkip();
  }

  const actionsDisabled = busy || autoResend > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded bg-white p-4 shadow-lg space-y-3">
        <h2 className="text-lg font-semibold">Add your phone for 2-step verification</h2>
        <p className="text-sm text-gray-600">You’ll get a one-time code by SMS when you sign in.</p>

        {banner && (
          <div
            className={`rounded border px-3 py-2 text-sm ${
              banner.type === 'success'
                ? 'bg-green-50 text-green-700 border-green-300'
                : banner.type === 'error'
                ? 'bg-red-50 text-red-700 border-red-300'
                : 'bg-blue-50 text-blue-700 border-blue-300'
            }`}
          >
            {banner.text}
          </div>
        )}

        <PhoneNumberField
          phoneNumber={phone}
          setPhoneNumber={setPhone}
          setPhoneErrors={setPhoneErrors}
          errors={phoneErrors}
          disabled={actionsDisabled || !!verificationId}
        />

        {!verificationId ? (
          <div className="flex gap-2">
            <button
              onClick={() => handleSendCode(false)}
              disabled={actionsDisabled}
              className="rounded bg-blue-600 px-3 py-2 text-white disabled:bg-gray-400"
            >
              Send code
            </button>
            <button
              onClick={handleSkipNow}
              disabled={busy}
              className="rounded border px-3 py-2"
            >
              Skip for now
            </button>
          </div>
        ) : (
          <>
            <input
              className="w-full rounded border px-3 py-2"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={actionsDisabled}
            />
            <div className="flex gap-2">
              <button
                onClick={handleVerifyEnroll}
                disabled={actionsDisabled || !code.trim()}
                className="rounded bg-green-600 px-3 py-2 text-white disabled:bg-gray-400"
              >
                Verify & Enroll
              </button>
              <button
                onClick={() => handleSendCode(false)}
                disabled={actionsDisabled}
                className="rounded border px-3 py-2"
              >
                Resend code
              </button>
              <button
                onClick={handleSkipNow}
                disabled={busy}
                className="rounded border px-3 py-2"
              >
                Cancel
              </button>
            </div>

            {autoResend > 0 && (
              <div className="text-sm text-amber-600">
                Too many attempts. Auto-resending in {autoResend}s…
              </div>
            )}

            <div className="text-xs text-gray-500">
              Attempts: {Math.min(codeAttempts, MAX_CODE_ATTEMPTS)}/{MAX_CODE_ATTEMPTS}
            </div>
          </>
        )}

        {needReauth && (
          <div className="rounded border p-3 bg-amber-50 space-y-2">
            <div className="text-sm">For security, confirm your password to continue.</div>
            <input
              type="password"
              className="w-full rounded border px-3 py-2"
              placeholder="••••••••"
              value={reauthPassword}
              onChange={(e) => setReauthPassword(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                onClick={handleReauth}
                disabled={busy}
                className="rounded bg-amber-600 px-3 py-2 text-white disabled:bg-gray-400"
              >
                Confirm
              </button>
              <button
                onClick={() => setNeedReauth(false)}
                disabled={busy}
                className="rounded border px-3 py-2"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

//###################################################################
//08.17.25
/* import React, { useEffect, useRef, useState } from 'react';
import {
  RecaptchaVerifier,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  multiFactor,
  reauthenticateWithCredential,
  EmailAuthProvider,
  reload,
  User,
} from 'firebase/auth';
import { auth } from '../../firebase/firebase';
import PhoneNumberField from './PhoneNumberField'; // your E.164 field

type Banner = { text: string; type: 'info' | 'success' | 'error' };

export default function EnrollPhoneModal({
  user,
  initialPhoneE164 = '',
  onDone,
  onSkip,
}: {
  user: User;
  initialPhoneE164?: string;
  onDone: () => void;
  onSkip: () => void;
}) {
  const [phone, setPhone] = useState(initialPhoneE164 || '');
  const [phoneErrors, setPhoneErrors] = useState<string[]>([]);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState<Banner | null>(null);

  // re-auth panel (if Firebase asks)
  const [needReauth, setNeedReauth] = useState(false);
  const [reauthPassword, setReauthPassword] = useState('');

  // reCAPTCHA bits
  const recaptchaContainerIdRef = useRef<string | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    return () => {
      try { recaptchaRef.current?.clear?.(); } catch {}
      if (recaptchaContainerIdRef.current) {
        const el = document.getElementById(recaptchaContainerIdRef.current);
        if (el?.parentNode) el.parentNode.removeChild(el);
      }
    };
  }, []);

  async function buildInvisibleRecaptcha(): Promise<void> {
    // clear any prior
    try { recaptchaRef.current?.clear?.(); } catch {}
    if (recaptchaContainerIdRef.current) {
      const el = document.getElementById(recaptchaContainerIdRef.current);
      if (el?.parentNode) el.parentNode.removeChild(el);
      recaptchaContainerIdRef.current = null;
    }
    // create hidden container
    const id = `recaptcha-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const div = document.createElement('div');
    div.id = id;
    div.style.display = 'none';
    document.body.appendChild(div);
    recaptchaContainerIdRef.current = id;

    // v10 signature: new RecaptchaVerifier(auth, container, options)
    const verifier = new RecaptchaVerifier(auth as any, id, { size: 'invisible' });
    await verifier.render();
    recaptchaRef.current = verifier;
  }

  async function handleSendCode() {
    if (busy) return;
    if (phoneErrors.length) {
      setBanner({ text: 'Please fix the phone number.', type: 'error' });
      return;
    }
    const e164 = phone.trim();
    if (!/^(\+)[1-9]\d{6,14}$/.test(e164)) {
      setBanner({ text: 'Enter a valid phone (E.164), e.g. +15551234567.', type: 'error' });
      return;
    }

    setBusy(true);
    setBanner(null);
    try {
      await buildInvisibleRecaptcha();
      const mfaUser = multiFactor(user);
      const session = await mfaUser.getSession();
      const provider = new PhoneAuthProvider(auth);
      const vId = await provider.verifyPhoneNumber({ phoneNumber: e164, session }, recaptchaRef.current!);
      setVerificationId(vId);
      setCode('');
      setBanner({ text: `Code sent to …${e164.slice(-4)}.`, type: 'success' });
    } catch (err: any) {
      if (err?.code === 'auth/requires-recent-login') {
        setNeedReauth(true);
        setBanner({ text: 'Please confirm your password to continue.', type: 'info' });
      } else {
        setBanner({ text: `${err?.code || ''} ${err?.message || 'Could not send code.'}`, type: 'error' });
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleReauth() {
    if (!reauthPassword.trim()) {
      setBanner({ text: 'Enter your password to continue.', type: 'error' });
      return;
    }
    setBusy(true);
    setBanner(null);
    try {
      const cred = EmailAuthProvider.credential(user.email || '', reauthPassword);
      await reauthenticateWithCredential(user, cred);
      setNeedReauth(false);
      setReauthPassword('');
      await handleSendCode();
    } catch (err: any) {
      setBanner({ text: `Re-auth failed: ${err?.code || ''} ${err?.message || ''}`, type: 'error' });
    } finally {
      setBusy(false);
    }
  }

  async function handleVerifyEnroll() {
    if (!verificationId) return;
    if (!code.trim()) return;
    setBusy(true);
    setBanner(null);
    try {
      const cred = PhoneAuthProvider.credential(verificationId, code.trim());
      const assertion = PhoneMultiFactorGenerator.assertion(cred);
      await multiFactor(user).enroll(assertion, 'Phone');
      await reload(user);

      // clean pending phone if we prefilled from registration
      if (localStorage.getItem('pending_phone_e164') === phone) {
        localStorage.removeItem('pending_phone_e164');
      }

      setBanner({ text: 'Phone linked. MFA enabled.', type: 'success' });
      onDone();
    } catch (err: any) {
      setBanner({ text: `${err?.code || ''} ${err?.message || 'Could not enroll phone.'}`, type: 'error' });
    } finally {
      setBusy(false);
      try { recaptchaRef.current?.clear?.(); } catch {}
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded bg-white p-4 shadow-lg space-y-3">
        <h2 className="text-lg font-semibold">Add your phone for 2-step verification</h2>
        <p className="text-sm text-gray-600">
          You’ll get a one-time code by SMS when you sign in.
        </p>

        {banner && (
          <div
            className={`rounded border px-3 py-2 text-sm ${
              banner.type === 'success'
                ? 'bg-green-50 text-green-700 border-green-300'
                : banner.type === 'error'
                ? 'bg-red-50 text-red-700 border-red-300'
                : 'bg-blue-50 text-blue-700 border-blue-300'
            }`}
          >
            {banner.text}
          </div>
        )}

        <PhoneNumberField
          phoneNumber={phone}
          setPhoneNumber={setPhone}
          setPhoneErrors={setPhoneErrors}
          errors={phoneErrors}
          disabled={busy || !!verificationId}
        />

        {!verificationId ? (
          <div className="flex gap-2">
            <button
              onClick={handleSendCode}
              disabled={busy}
              className="rounded bg-blue-600 px-3 py-2 text-white disabled:bg-gray-400"
            >
              Send code
            </button>
            <button
              onClick={onSkip}
              disabled={busy}
              className="rounded border px-3 py-2"
            >
              Skip for now
            </button>
          </div>
        ) : (
          <>
            <input
              className="w-full rounded border px-3 py-2"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                onClick={handleVerifyEnroll}
                disabled={busy || !code.trim()}
                className="rounded bg-green-600 px-3 py-2 text-white disabled:bg-gray-400"
              >
                Verify & Enroll
              </button>
              <button
                onClick={handleSendCode}
                disabled={busy}
                className="rounded border px-3 py-2"
              >
                Resend code
              </button>
              <button
                onClick={onSkip}
                disabled={busy}
                className="rounded border px-3 py-2"
              >
                Cancel
              </button>
            </div>
          </>
        )}

        {needReauth && (
          <div className="rounded border p-3 bg-amber-50 space-y-2">
            <div className="text-sm">For security, confirm your password to continue.</div>
            <input
              type="password"
              className="w-full rounded border px-3 py-2"
              placeholder="••••••••"
              value={reauthPassword}
              onChange={(e) => setReauthPassword(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                onClick={handleReauth}
                disabled={busy}
                className="rounded bg-amber-600 px-3 py-2 text-white disabled:bg-gray-400"
              >
                Confirm
              </button>
              <button
                onClick={() => setNeedReauth(false)}
                disabled={busy}
                className="rounded border px-3 py-2"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} */
