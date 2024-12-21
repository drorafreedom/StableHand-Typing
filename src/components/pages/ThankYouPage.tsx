
// src/components/pages/ThankYouPage.tsx

import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Frame3, Frame } from '../common/Frame';

interface LocationState {
  type?: string;
  score?: number | null;
  percentagescore?: number | null;
}

const ThankYouPage: React.FC = () => {
  const location = useLocation();
  const state = location.state as LocationState || { type: 'default', score: null, percentagescore: null };

  const getMessage = () => {
    switch (state.type) {
      case 'logout':
        return (
          <>
            <p>Thank you for visiting. We hope you have enjoyed your session. See you soon!</p>
            <Link to="/login" className="text-blue-500 hover:text-blue-700">Go to Login</Link>
          </>
        );
      case 'registration':
        return (
          <>
            <p>Thank you for registering! Please check your email for verification.</p>
            <Link to="/login" className="text-blue-500 hover:text-blue-700">Go to Login</Link>
          </>
        );
      case 'demographics':
        return (
          <>
            <p>Thank you for submitting your demographics information.</p>
            <Link to="/medical-interview" className="text-blue-500 hover:text-blue-700">
              Please proceed to the Medical Interview section
            </Link>
          </>
        );
      case 'medical':
        return (
          <>
            <p>Thank you for completing the Medical Interview.</p>
            <Link to="/parkinson-interview" className="text-blue-500 hover:text-blue-700">
              Please proceed to the Parkinson Interview section
            </Link>
          </>
        );
      case 'parkinsons':
        return (
          <>
            <p>Thank you for completing the Parkinson's survey.</p>
            <p>Your score is {state.score}, ({state.percentagescore}%).</p>
            <Link to="/therapy" className="text-blue-500 hover:text-blue-700">Proceed to Therapy Session</Link>
          </>
        );
      case 'disclaimer':
        return (
          <>
            <p>Thank you for acknowledging the disclaimer.</p>
            <Link to="/demographics" className="text-blue-500 hover:text-blue-700">Proceed to Demographics</Link>
          </>
        );
      case 'therapysession':
        return (
          <>
            <p>Thank you for completing the therapy session.</p>
            <Link to="/progress" className="text-blue-500 hover:text-blue-700">Proceed to Progress Notes</Link>
            <Link to="/logout" className="text-blue-500 hover:text-blue-700">or logout</Link>
          </>
        );
      default:
        return <p>Thank you for your submission!</p>;
    }
  };

  return (
    <Frame3>
      <Frame>
        <h2 className="text-2xl font-bold mb-4">Thank You!</h2>
        <div className="text-lg">{getMessage()}</div>
      </Frame>
    </Frame3>
  );
};

export default ThankYouPage;

//+++++++++++JS version+++++++++++++++++

//src\components\pages\ThankYouPage.jsx
 // JS version
/* import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Frame3, Frame, Frame2 } from '../common/Frame';

const ThankYouPage = () => {
  const location = useLocation();
  const { type, score, percentagescore } = location.state || { type: 'default', score: null , percentagescore: null};

  const getMessage = () => {
    switch (type) {
      case 'logout':
        return (
          <>
            <p>Thank you for visiting. We hope you have enjoyed your session. See you soon!</p>
            <Link to="/login" className="text-blue-500 hover:text-blue-700">Go to Login</Link>
          </>
        );
      case 'registration':
        
        return (
          <>
            <p>Thank you for registering! Please check your email for verification</p>
            <Link to="/login" className="text-blue-500 hover:text-blue-700">Go to Login</Link>
          </>
        );

        
      case 'demographics':
        return (
          <>
            <p>Thank you for submitting your demographics information.</p>
            <Link to="/medical-interview" className="text-blue-500 hover:text-blue-700">Please proceed to the Medical Interview section</Link>
          </>
        );
      case 'medical':
        return (
          <>
            <p>Thank you for completing the Medical Interview.</p>
            <Link to="/parkinson-interview" className="text-blue-500 hover:text-blue-700">Please proceed to the Parkinson Interview section</Link>
          </>
        );
      case 'parkinsons':
        return (
          <>
            <p>Thank you for completing the Parkinson's survey.</p>
            <p>Your score is {score}, ({percentagescore}%).</p>
            <Link to="/therapy" className="text-blue-500 hover:text-blue-700">Proceed to Therapy Session</Link>
          </>
        );
        case 'disclaimer':
          return (
            <>
              <p>Thank you for acknowledging the disclaimer.</p>
              <Link to="/demographics" className="text-blue-500 hover:text-blue-700">Proceed to Demographics</Link>
            </>
          );
          case 'therapysession':
            return (
              <>
                <p>Thank you for acknowledging the disclaimer.</p>
                <Link to="/progress" className="text-blue-500 hover:text-blue-700">Proceed to Progress Notes</Link>
                <Link to="/logout" className="text-blue-500 hover:text-blue-700">or logout</Link>
              </>
            );
      default:
        return 'Thank you for your submission!';
    }
  };

  return (
    <Frame3>
    <Frame>
      <h2 className="text-2xl font-bold mb-4">Thank You!</h2>
      <div className="text-lg">{getMessage()}</div>
    </Frame>
    </Frame3>
  );
};

export default ThankYouPage; */
