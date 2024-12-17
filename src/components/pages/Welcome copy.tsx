// src/components/pages/Welcome.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import LoginPage from './LoginPage';
import '../../styles/Welcome.css'; // Assuming you have your styles here
import welcomeImage from '../../assets/images/welcome-image.jpg'; // Adjust path if necessary

function Welcome() {
    return (
        <div className="welcome-container">
            <div className="flex-1 p-10">
                <img
                    src={welcomeImage}
                    alt="Welcome to stablehand, a unique therapy to releif tremor"
                    className="w-11/12 block rounded-[10%]"
                />
            </div>
            <div className="welcome-content">
                <h1>Welcome to Stablehand</h1>
                <h2>A Unique Virtual Tool to Stabilize Tremor</h2>
                <LoginPage />
                <Link to="/register">
                    <button className="btn">Don't have an account? Register</button>
                </Link>
            </div>
        </div>
    );
}

export default Welcome;
