 // src/components/TestRecaptcha.jsx

import React, { useEffect } from 'react';
import { RecaptchaVerifier } from 'firebase/auth';
import { auth } from '../../firebase/firebase'; // Adjust the path based on your project structure

const TestRecaptcha = () => {
  useEffect(() => {
    console.log('Auth object:', auth);

    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        'recaptcha-container',
        {
          size: 'invisible', // or 'normal'
          callback: (response) => {
            console.log('reCAPTCHA solved:', response);
          },
          'expired-callback': () => {
            console.log('reCAPTCHA expired. Please try again.');
          },
        },
        auth
      );

      // Render the reCAPTCHA widget
      window.recaptchaVerifier.render().then((widgetId) => {
        window.recaptchaWidgetId = widgetId;
        console.log('reCAPTCHA rendered with widgetId:', widgetId);
      });
    }
  }, []);

  return (
    <div>
      <h2>Test reCAPTCHA</h2>
      <div id="recaptcha-container"></div>
    </div>
  );
};

export default TestRecaptcha;

