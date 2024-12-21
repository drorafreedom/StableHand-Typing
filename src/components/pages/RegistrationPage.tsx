
// src/components/pages/RegistrationPage.tsx

import React from 'react';
import RegistrationForm from '../organisms/RegistrationForm';
import { useNavigate } from 'react-router-dom';
import { Frame3 } from '../common/Frame';

const RegistrationPage: React.FC = () => {
  const navigate = useNavigate();

  const handleRegister = async (email: string, password: string, phoneNumber?: string) => {
    // Your registration logic here
    console.log('Registering user with:', { email, password, phoneNumber });
  };

  return (
    <Frame3 bgColor="bg-gray-100">
      <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-md border border-gray-300">
        <h1 className="text-4xl font-bold mb-4 text-center">Register</h1>
        <RegistrationForm onRegister={handleRegister} />
      </div>
    </Frame3>
  );
};

export default RegistrationPage;


//+++++++++++JS version+++++++++++++++++
// src/components/pages/RegistrationPage.jsx
 // JS version
import React from 'react';
import RegistrationForm from '../organisms/RegistrationForm';
import { useNavigate } from 'react-router-dom';
import {Frame, Frame2, Frame3} from '../common/Frame';
const RegistrationPage = () => {
  const navigate = useNavigate();

  const handleRegister = async (email, password, phoneNumber) => {
    // Your registration logic here
  };

  return (
    
    <Frame3  bgColor="bg-gray-100">
      <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-md border border-gray-300">
        <h1 className="text-4xl font-bold mb-4 text-center">Register</h1>
        
        <RegistrationForm onRegister={handleRegister} />
        
      </div>
  

      </Frame3>
  );
};

export default RegistrationPage;


