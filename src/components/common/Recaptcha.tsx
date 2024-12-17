// src/components/common/Recaptcha.jsx
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