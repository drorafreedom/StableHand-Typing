// src/components/pages/VerifyEmailFinish.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { applyActionCode, checkActionCode, reload } from 'firebase/auth';
import { auth } from '../../firebase/firebase';
import Alert from '../common/Alert';

export default function VerifyEmailFinish(): JSX.Element {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [msg, setMsg] = useState<{text: string; type: 'info'|'success'|'error'}>({
    text: 'Verifying your email…',
    type: 'info'
  });

  useEffect(() => {
    const oobCode = params.get('oobCode');
    const mode = params.get('mode');

    (async () => {
      try {
        if (!oobCode || mode !== 'verifyEmail') {
          setMsg({ text: 'Invalid verification link.', type: 'error' });
          return;
        }

        // Optional safety check: confirm the code is still valid
        await checkActionCode(auth, oobCode);

        // Apply the verification
        await applyActionCode(auth, oobCode);

        // If a user is signed in locally, refresh its emailVerified flag
        if (auth.currentUser) await reload(auth.currentUser);

        setMsg({ text: 'Email verified! You can log in now.', type: 'success' });
        setTimeout(() => navigate('/login'), 1200);
      } catch (err: any) {
        // Covers expired/used or wrong project/domain
        setMsg({
          text: `Try verifying again. ${err?.code || ''} ${err?.message || ''}`,
          type: 'error'
        });
      }
    })();
  }, [params, navigate]);

  return (
    <div className="max-w-md mx-auto mt-10 space-y-4">
      <Alert message={msg.text} type={msg.type} />
    </div>
  );
}
