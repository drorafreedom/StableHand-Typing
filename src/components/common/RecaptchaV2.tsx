// src/components/common/RecaptchaV2.tsx
// TS version

import React, { useEffect } from 'react';
import { RecaptchaVerifier } from 'firebase/auth';
import { auth } from '../../firebase/firebase';

// Define the props interface
interface RecaptchaV2Props {
  containerId: string; // The ID of the container where reCAPTCHA will render
  onVerify: (response: string) => void; // Callback triggered when reCAPTCHA is successfully verified
  onExpire: () => void; // Callback triggered when reCAPTCHA expires
}

// Extend the global `window` object to include `recaptchaVerifier`
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier | null;
  }
}

const RecaptchaV2: React.FC<RecaptchaV2Props> = ({ containerId, onVerify, onExpire }) => {
  useEffect(() => {
    // Initialize reCAPTCHA if it's not already initialized
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        containerId,
        {
          size: 'normal', // Visible reCAPTCHA
          callback: (response: string) => {
            console.log('Recaptcha verified with response:', response);
            onVerify(response); // Call the onVerify callback
          },
          'expired-callback': () => {
            console.log('Recaptcha expired');
            onExpire(); // Call the onExpire callback
          },
        },
        auth
      );

      window.recaptchaVerifier
        .render()
        .catch((error) => console.error('Error rendering Recaptcha:', error));
    }

    // Cleanup the reCAPTCHA on component unmount
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null; // Set the verifier to null
      }
    };
  }, [containerId, onVerify, onExpire]);

  return <div id={containerId} style={{ display: 'block' }}></div>;
};

export default RecaptchaV2;


//==============JS version============

// src/components/common/RecaptchaV2.jsx

//JS version
/* import React, { useEffect } from 'react';
import { RecaptchaVerifier } from 'firebase/auth';
import { auth } from '../../firebase/firebase';
import PropTypes from 'prop-types';

const RecaptchaV2 = ({ containerId, onVerify, onExpire }) => {
  useEffect(() => {
    // Initialize Recaptcha if it's not already initialized
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        containerId,
        {
          size: 'normal', // Visible reCAPTCHA
          callback: (response) => {
            console.log('Recaptcha verified with response:', response);
            onVerify(response); // Pass response to parent
          },
          'expired-callback': () => {
            console.log('Recaptcha expired');
            onExpire(); // Reset verification status
          },
        },
        auth
      );

      window.recaptchaVerifier.render().catch((error) => {
        console.error('Error rendering Recaptcha:', error);
      });
    }

    // Cleanup the reCAPTCHA on component unmount
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, [containerId, onVerify, onExpire]);

  return <div id={containerId} style={{ display: 'block' }}></div>;
};

RecaptchaV2.propTypes = {
  containerId: PropTypes.string.isRequired,
  onVerify: PropTypes.func.isRequired,
  onExpire: PropTypes.func.isRequired,
};

export default RecaptchaV2;
 */