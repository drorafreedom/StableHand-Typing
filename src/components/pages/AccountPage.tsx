//  src\components\pages\AccountPage.jsx
 
import React from 'react';
import { Link } from 'react-router-dom';
import { Frame2, Frame, Frame3 } from '../common/Frame';


const AccountPage = () => {
  return (
    <Frame3  bgColor="bg-gray-100">
     
      <div className="w-full max-w-lg bg-gray-200 p-8 rounded-lg shadow-md border border-gray-300">
        <h1 className="text-4xl font-bold mb-4">AccountPage</h1>
        <p className="text-lg mb-6">Coming Soon</p>
        <Link to="/login" className="text-blue-500 hover:text-blue-700">Go to Login</Link>
      </div>
     
    </Frame3>
  );
};
 
export default  AccountPage;