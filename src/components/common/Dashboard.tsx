
// src/components/Dashboard.tsx
//TS version
import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/firebase';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login'); // Redirect to login after sign out
    } catch (error: unknown) {
      console.error('Sign Out Error:', error);
    }
  };

  return (
    <div className="dashboard-container p-4 flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4">Welcome to the Dashboard!</h2>
      <button
        onClick={handleSignOut}
        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-red-400"
      >
        Sign Out
      </button>
    </div>
  );
};

export default Dashboard;


/* // src/components/Dashboard.jsx
//JS version
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

export default Dashboard; */
