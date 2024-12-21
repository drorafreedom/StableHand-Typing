// src/components/pages/LogoutPage.tsx

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../firebase/auth';
import { Frame3 } from '../common/Frame';

const LogoutPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async (): Promise<void> => {
      try {
        await logout();
        setTimeout(() => {
          navigate('/thank-you', { state: { type: 'logout' } });
        }, 3000); // Redirect after 3 seconds
      } catch (error) {
        console.error('Error logging out:', error);
      }
    };

    handleLogout();
  }, [navigate]);

  return (
    <Frame3 bgcolor="mango-100">
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-2xl font-bold mb-4">Logging out...</h1>
      </div>
    </Frame3>
  );
};

export default LogoutPage;

//+++++++++++JS version+++++++++++++++++
/* // src/components/pages/LogoutPage.jsx
 // JS version
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../firebase/auth';
import {Frame3,Frame} from '../common/Frame';
const LogoutPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await logout();
        setTimeout(() => {
          navigate('/thank-you', { state: { type: 'logout' } });
        }, 3000); // Redirect after 3 seconds
      } catch (error) {
        console.error("Error logging out:", error);
      }
    };

    handleLogout();
  }, [navigate]);

  return (
    <Frame3   bgcolor=" mango-100"> 
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Logging out...</h1>
    </div>
   </Frame3>);
};

export default LogoutPage; */


/* // src/components/pages/LogoutPage.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LogoutPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear any session or user data here
    setTimeout(() => {
      navigate('/thank-you', { state: { type: 'logout' } });
    }, 3000); // Redirect after 2 seconds
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Logging out...</h1>
    </div>
  );
};

export default LogoutPage;
 */