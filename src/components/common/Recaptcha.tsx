// src/components/common/Recaptcha.tsx
// TS version

import React, { useEffect } from 'react';
import { RecaptchaVerifier } from 'firebase/auth';
import { auth } from '../../firebase/firebase';

// Define props for the Recaptcha component
interface RecaptchaProps {
  containerId: string; // The ID of the container where reCAPTCHA will render
  onVerify?: (response: string) => void; // Callback triggered when reCAPTCHA is successfully verified
  onExpire?: () => void; // Callback triggered when reCAPTCHA expires
}

// Extend the global `window` object to include `recaptchaVerifier`
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}

const Recaptcha: React.FC<RecaptchaProps> = ({ containerId, onVerify, onExpire }) => {
  useEffect(() => {
    // Initialize reCAPTCHA only if it hasn't been initialized already
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        containerId,
        {
          size: 'normal', // Size of the reCAPTCHA ('normal', 'compact', or 'invisible')
          callback: (response: string) => {
            console.log('Recaptcha verified');
            if (onVerify) onVerify(response); // Call the onVerify callback
          },
          'expired-callback': () => {
            console.log('Recaptcha expired');
            if (onExpire) onExpire(); // Call the onExpire callback
          },
        },
        auth
      );

      window.recaptchaVerifier.render(); // Render the reCAPTCHA
    }
  }, [containerId, onVerify, onExpire]);

  // Handle refreshing the reCAPTCHA manually
  const handleRecaptchaRefresh = () => {
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear(); // Clear the existing reCAPTCHA
      window.recaptchaVerifier.render(); // Render a new reCAPTCHA
    }
  };

  return (
    <div>
      {/* Container for reCAPTCHA */}
      <div id={containerId}></div>
      {/* Button to refresh the reCAPTCHA */}
      <button onClick={handleRecaptchaRefresh} className="refresh-button">
        Refresh reCAPTCHA
      </button>
    </div>
  );
};

export default Recaptcha;


//===========JS version===============

/* // src/components/common/Recaptcha.jsx

//JS version
import React, { useEffect } from 'react';
import { RecaptchaVerifier } from 'firebase/auth';
import { auth } from '../../firebase/firebase';

const Recaptcha = ({ containerId, onVerify, onExpire }) => {
  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        containerId,
        {
          size: 'normal',
          callback: (response) => {
            console.log('Recaptcha verified');
            if (onVerify) onVerify(response);
          },
          'expired-callback': () => {
            console.log('Recaptcha expired');
            if (onExpire) onExpire();
          },
        },
        auth
      );

      window.recaptchaVerifier.render();
    }
  }, [containerId, onVerify, onExpire]);

  const handleRecaptchaRefresh = () => {
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear(); // Clear the existing reCAPTCHA
      window.recaptchaVerifier.render(); // Render a new reCAPTCHA
    }
  };

  return (
    <div>
      <div id={containerId}></div>
      <button onClick={handleRecaptchaRefresh} className="refresh-button">
        Refresh reCAPTCHA
      </button>
    </div>
  );
};

export default Recaptcha;

 */



/* import React, { useEffect } from 'react';
import { RecaptchaVerifier } from 'firebase/auth';
import { auth } from '../../firebase/firebase';
import PropTypes from 'prop-types';

const Recaptcha = ({ containerId, onVerify, onExpire }) => {
  useEffect(() => {
    // Initialize Recaptcha only if it's not already initialized
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        containerId,
        {
          size: 'normal', // 'normal' for visible, 'invisible' if preferred
          callback: (response) => {
            console.log('Recaptcha verified');
            if (onVerify) onVerify(response);
          },
          'expired-callback': () => {
            console.log('Recaptcha expired');
            if (onExpire) onExpire();
          },
        },
        auth
      );

      window.recaptchaVerifier
        .render()
        .then(() => {
          console.log('Recaptcha rendered successfully');
        })
        .catch((error) => {
          console.error('Error rendering Recaptcha:', error);
        });
    }
  }, [containerId, onVerify, onExpire]);

  return <div id={containerId}></div>;
};

Recaptcha.propTypes = {
  containerId: PropTypes.string.isRequired,
  onVerify: PropTypes.func,
  onExpire: PropTypes.func,
};

Recaptcha.defaultProps = {
  onVerify: null,
  onExpire: null,
};

export default Recaptcha;

 */