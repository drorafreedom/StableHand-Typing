// /src/components/pages/RegistrationPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RegistrationForm from '../RegistrationForm';
import EmailLinkSignIn from '../EmailLinkSignIn';
import { registerWithEmailPassword, signInWithGoogle, signInWithApple, signInWithYahoo, signInWithFacebook, setupRecaptcha, signInWithPhone } from '../../../firebase/auth';

function RegistrationPage() {
    const [error, setError] = useState(null);
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (email, password) => {
        try {
            const user = await registerWithEmailPassword(email, password);
            navigate('/login');
        } catch (error) {
            setError(error.message);
        }
    };

    const handleThirdPartyRegister = async (providerSignIn) => {
        try {
            const result = await providerSignIn();
            navigate('/');
        } catch (error) {
            setError(error.message);
        }
    };

    const handlePhoneAuth = async () => {
        try {
            const recaptchaVerifier = setupRecaptcha('recaptcha-container');
            const result = await signInWithPhone(phoneNumber, recaptchaVerifier);
            setConfirmationResult(result);
        } catch (error) {
            setError(error.message);
        }
    };

    const handleVerifyCode = async () => {
        try {
            if (confirmationResult) {
                await confirmationResult.confirm(verificationCode);
                navigate('/');
            }
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="registration-page">
            <h1>Register for Our Application</h1>
            {error && <p className="error">{error}</p>}
            <RegistrationForm onRegister={handleRegister} />
            <div className="third-party-auth">
                <h2>Or register with:</h2>
                <button onClick={() => handleThirdPartyRegister(signInWithGoogle)}>Google</button>
                <button onClick={() => handleThirdPartyRegister(signInWithApple)}>Apple</button>
                <button onClick={() => handleThirdPartyRegister(signInWithYahoo)}>Yahoo</button>
                <button onClick={() => handleThirdPartyRegister(signInWithFacebook)}>Facebook</button>
            </div>
            <div className="phone-auth">
                <h2>Or register with phone:</h2>
                <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter phone number"
                />
                <button onClick={handlePhoneAuth}>Send Code</button>
                {confirmationResult && (
                    <>
                        <input
                            type="text"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            placeholder="Enter verification code"
                        />
                        <button onClick={handleVerifyCode}>Verify Code</button>
                    </>
                )}
                <div id="recaptcha-container"></div>
            </div>
            <EmailLinkSignIn />
        </div>
    );
}

export default RegistrationPage;
