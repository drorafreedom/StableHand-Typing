// src/components/pages/Dashboard.jsx

//for MFA
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Frame2, Frame, Frame3 } from '../common/Frame';
import MfaEnrollment from '../auth/MfaEnrollment'; // Adjust the import path as necessary
import { getAuth, multiFactor } from 'firebase/auth';

const StablehandWelcomePage = () => {
  const [needsMfaEnrollment, setNeedsMfaEnrollment] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      // Check if user is enrolled in MFA
      const enrolledFactors = multiFactor(user).enrolledFactors;
      if (enrolledFactors.length === 0) {
        setNeedsMfaEnrollment(true); // Prompt for MFA enrollment if not set up
      }
    }
  }, []);

  return (
    <Frame3>
      <Frame>
        <h1 className="text-4xl font-bold mb-6">Welcome to StableHand Clinical Trial Dashboard</h1>
        {needsMfaEnrollment ? (
          <MfaEnrollment />
        ) : (
          <div className="flex flex-col space-y-4">
            <Link to="/disclaimer" className="w-full bg-blue-500 hover:bg-blue-700 text-white p-2 rounded">Disclaimer</Link>
            <Link to="/background" className="w-full bg-green-500 hover:bg-green-700 text-white p-2 rounded">Background</Link>
            <Link to="/demographics" className="w-full bg-yellow-500 hover:bg-yellow-700 text-white p-2 rounded">Demographics</Link>
            <Link to="/medical-interview" className="w-full bg-orange-500 hover:bg-orange-700 text-white p-2 rounded">Medical Interview</Link>
            <Link to="/parkinson-interview" className="w-full bg-red-500 hover:bg-red-700 text-white p-2 rounded">Parkinson Interview (PDQ-39)</Link>
            <Link to="/therapy" className="w-full bg-purple-500 hover:bg-purple-700 text-white p-2 rounded">Therapy</Link>
            <Link to="/progress-notes" className="w-full bg-gray-500 hover:bg-gray-700 text-white p-2 rounded">Progress Notes</Link>
          </div>
        )}
      </Frame>
    </Frame3>
  );
};

export default StablehandWelcomePage;



/* import React from 'react';
import { Link } from 'react-router-dom';
import { Frame2, Frame,Frame3 } from '../common/Frame';
const Dashboard = () => {
  return ( 
      <Frame3> <Frame> 
    
      <h1 className="text-4xl font-bold mb-6">Welcome to StableHand Clinical Trial Dashboard</h1>
      <div className="flex flex-col space-y-4">
      <Link to="/disclaimer" className="w-full bg-blue-500 hover:bg-blue-700 text-white p-2 rounded">Disclaimer</Link>
        <Link to="/background" className=" w-full bg-green-500 hover:bg-green-700   text-white p-2 rounded">Background</Link>
        <Link to="/demographics" className="w-full bg-yellow-500 hover:bg-yellow-700 text-white p-2 rounded">Demographics</Link>
        <Link to="/medical-interview" className="w-full bg-orange-500 hover:bg-orange-700 text-white p-2 rounded">Medical Interview</Link>
        <Link to="/parkinson-interview" className="w-full bg-red-500 hover:bg-red-700 text-white p-2 rounded">Parkinson Interview (PDQ-39)</Link>
        <Link to="/therapy" className="w-full bg-purple-500 hover:bg-purple-700 text-white p-2 rounded">Therapy</Link>
         <Link to="/progress-notes" className="w-full bg-gray-500 hover:bg-purple-gray text-white p-2 rounded">Progress Notes</Link>
       
    </div>
    </Frame></Frame3>
    
 );
};

export default Dashboard; */


 
