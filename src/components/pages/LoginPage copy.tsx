// /src/components/pages/LoginPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../organisms/LoginForm';
import { loginWithEmailPassword } from '../../firebase/auth';

function LoginPage() {
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Handle login with email and password
    const handleLogin = async (email, password, callback) => {
        try {
            const user = await loginWithEmailPassword(email, password);
            console.log("Logging in with:", email, password);
            callback(true);
            navigate('/'); // Redirect to the home page after successful login
        } catch (error) {
            setError(error.message);
            callback(false);
            console.error("Login failed:", error);
        }
    };

    // Handle max login attempts reached
    const handleMaxLoginAttemptsReached = () => {
        console.log("Redirecting to password reset page...");
        navigate('/reset-password'); // Redirect to the password reset page
    };

    // Handle register click
    const handleRegisterClick = () => {
        console.log("Redirecting to registration page...");
        navigate('/register'); // Redirect to the registration page
    };

    return (
        <div className="login-page">
           
            {error && <p className="error">{error}</p>}
            <LoginForm
                onLogin={handleLogin}
                onMaxLoginAttemptsReached={handleMaxLoginAttemptsReached}
                onRegisterClick={handleRegisterClick}
            />
        </div>
    );
}

export default LoginPage;
