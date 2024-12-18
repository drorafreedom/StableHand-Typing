// src/components/Dashboard.jsx

import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/firebase';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login'); // Redirect to login after sign out
    } catch (error) {
      console.error('Sign Out Error:', error);
      // Optionally, set a message state to display to the user
    }
  };

  return (
    <div className="dashboard-container">
      <h2>Welcome to the Dashboard!</h2>
      <button onClick={handleSignOut} className="signout-button">
        Sign Out
      </button>
    </div>
  );
};

export default Dashboard;
