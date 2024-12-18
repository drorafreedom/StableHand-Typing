// src/components/common/Modal.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WaveAnimation from '../Therapy/WaveAnimation';
import TextInputComponent from '../Therapy/TextInputComponent';

const Modal = ({ closeModal }) => {
  const navigate = useNavigate();

  const handleKeyPress = (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  };

  const handleClickOutside = (e) => {
    if (e.target.className.includes('modal-overlay')) {
      closeModal();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleSubmit = () => {
    closeModal();
    navigate('/thank-you');
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 modal-overlay">
      <div className="bg-white p-4 rounded shadow-lg relative w-full max-w-3xl">
        <button
          onClick={closeModal}
          className="absolute top-0 right-0 m-4 text-gray-700 text-lg"
        >
          &times;
        </button>
        <h2 className="text-xl mb-4">Therapy Session</h2>
        <WaveAnimation />
        <TextInputComponent />
        <button 
          onClick={handleSubmit}
          className="bg-green-500 text-white py-2 px-4 rounded mt-4"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default Modal;
