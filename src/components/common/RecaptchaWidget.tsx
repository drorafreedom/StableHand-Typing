//src\components\common\RecaptchaWidget.tsx
import React, { useEffect, useRef, useState } from 'react';

// Declare types for the global grecaptcha
declare global {
  interface Window {
    grecaptcha?: {
      render: (
        container: string | HTMLElement,
        params: {
          sitekey: string;
          size?: 'invisible' | 'normal' | 'compact';
          callback: (token: string) => void;
          'expired-callback'?: () => void;
        }
      ) => number;
      execute: (widgetId: number) => void;
      reset: (widgetId: number) => void;
    };
  }
}

interface RecaptchaWidgetProps {
  /** Called with the reCAPTCHA token on successful verification */
  onVerify: (token: string) => void;
  /** Called when the reCAPTCHA expires */
  onExpire: () => void;
}

const RecaptchaWidget: React.FC<RecaptchaWidgetProps> = ({ onVerify, onExpire }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [widgetId, setWidgetId] = useState<number | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const grecaptcha = window.grecaptcha;
    const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

    if (!siteKey) {
      setError('Missing reCAPTCHA site key');
      return;
    }

    if (grecaptcha && containerRef.current && widgetId === null) {
      const id = grecaptcha.render(containerRef.current, {
        sitekey: siteKey,
        size: 'invisible',
        callback: onVerify,
        'expired-callback': () => {
          onExpire();
          setError('The CAPTCHA has expired. Please refresh.');
        },
      });
      setWidgetId(id);
      grecaptcha.execute(id);
    }
  }, [widgetId, onVerify, onExpire]);

  const handleRefresh = () => {
    if (widgetId !== null && window.grecaptcha) {
      window.grecaptcha.reset(widgetId);
      setError('');
      window.grecaptcha.execute(widgetId);
    }
  };

  return (
    <div>
      <div ref={containerRef} />
      {error && <p className="text-red-600">{error}</p>}
      <button
        type="button"
        onClick={handleRefresh}
        className="text-sm text-blue-500 underline"
      >
        Refresh CAPTCHA
      </button>
    </div>
  );
};

export default RecaptchaWidget;
