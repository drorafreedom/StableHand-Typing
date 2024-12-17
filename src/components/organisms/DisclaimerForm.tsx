// src/components/organisms/DisclaimerForm.jsx
import React, { useState } from 'react';
import DisclaimerText from './DisclaimerText';
import Button from '../common/Button';
import { useNavigate } from 'react-router-dom';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import Alert from '../common/Alert';
import { Frame2, Frame, Frame3, Frame4,Frame5} from '../common/Frame'; // Import the Frame component

const DisclaimerForm = () => {
  const navigate = useNavigate();
  const [acknowledged, setAcknowledged] = useState(false);
  const [signature, setSignature] = useState('');
  const [error, setError] = useState('');

  const handleAcknowledgeChange = (e) => {
    setAcknowledged(e.target.checked);
  };

  const handleSignatureChange = (e) => {
    setSignature(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!acknowledged || signature.trim() === '') {
      setError('Please acknowledge the disclaimer and provide your signature.');
      return;
    }
    try {
      await addDoc(collection(db, 'disclaimers'), {
        acknowledged,
        signature,
        timestamp: new Date()
      });
      setError('');
      setTimeout(() => {
        navigate('/thank-you', { state: { type: 'disclaimer' } });
      }, 2000); // Redirect after 2 seconds
    } catch (err) {
      console.error('Error submitting disclaimer:', err);
      setError('Error submitting disclaimer. Please try again.');
    }
  };

  return (
    <Frame5
   /*  bgColor='bg-blue-300'
    paddingY = 'py-8'         // Vertical padding (top and bottom)
  paddingX = 'px-4'        // Horizontal padding (left and right)
  marginX = 'mx-4'    */ 
   >
      <h1 className="text-4xl font-bold mb-4 ">Disclaimer</h1>
      <DisclaimerText />
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="mb-4 ">
          <label className="block text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={handleAcknowledgeChange}
              className="mr-2"
            />
            I acknowledge that I have read and understood the disclaimer.
          </label>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Signature
            <input
              type="text"
              value={signature}
              onChange={handleSignatureChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter your signature"
            />
          </label>
        </div>
        {error && <Alert message={error} type="error" />}
        <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 border border-blue-700">
          Submit
        </Button>
      </form>
      </Frame5>
  );
};

export default DisclaimerForm;
