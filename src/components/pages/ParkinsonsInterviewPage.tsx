// src/components/pages/ParkinsonsInterviewPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDoc, collection, doc, setDoc } from 'firebase/firestore';
import { db, storage } from '../../firebase/firebase';
import { useAuth } from '../../data/AuthContext';
import Papa from 'papaparse';
import { ref, uploadBytes } from 'firebase/storage';
import Button from '../common/Button';
import Alert from '../common/Alert';
import { questions } from '../../data/questions';
import { Frame3, Frame, Frame2 } from '../common/Frame';
import DateTimeDisplay from '../common/DateTimeDisplay';

const itemsPerPage = 10;

const ParkinsonsInterviewPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [responses, setResponses] = useState(Array(questions.length).fill(null));
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ message: '', type: '' });
  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = Math.ceil(questions.length / itemsPerPage);

  const handleResponseChange = (index, value) => {
    const newResponses = [...responses];
    newResponses[index] = value;
    setResponses(newResponses);

    const newErrors = { ...errors };
    if (value !== null) {
      delete newErrors[index];
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setMessage({ message: '', type: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    let hasErrors = false;

    responses.forEach((response, index) => {
      if (response === null) {
        newErrors[index] = 'This field is required';
        hasErrors = true;
      }
    });

    setErrors(newErrors);

    if (hasErrors) {
      setMessage({ message: 'Please fill all fields.', type: 'error' });
      return;
    }

    try {
      const totalScore = responses.reduce((acc, curr) => acc + Number(curr), 0);
      const averageScore = (totalScore / responses.length).toFixed(2);
      const normalizedScore = ((totalScore / (responses.length * 4)) * 100).toFixed(2);
      
      const timestamp = new Date();
      const localDateTime = timestamp.toLocaleString();
      const formDataWithTimestamp = {
        responses,
        averageScore,
        normalizedScore,
        userId: currentUser.uid,
        timestamp: timestamp.toISOString(),
        localDateTime: localDateTime
      };

      // Save to Firestore
      const userDocRef = doc(collection(db, `users/${currentUser.uid}/parkinsons-surveys`));
      await setDoc(userDocRef, formDataWithTimestamp);
      console.log('Document written with ID: ', userDocRef.id);

      // Generate CSV data
      const csvData = responses.map((response, index) => ({
        question: index + 1,
        response,
      }));
      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

      const csvRef = ref(storage, `users/${currentUser.uid}/parkinsons-surveys/${timestamp.toISOString()}.csv`);
      await uploadBytes(csvRef, blob);

      setMessage({ message: `Submission successful! Your score is ${averageScore} (${normalizedScore}%)`, type: 'success' });
      setTimeout(() => {
        navigate('/thank-you', { state: { type: 'parkinsons', score: averageScore, percentageScore: normalizedScore } });
      }, 3000);
    } catch (err) {
      console.error('Error submitting survey:', err);
      setMessage({ message: 'Error submitting survey. Please try again.', type: 'error' });
    }
  };

  const handleNextPage = () => {
    const newErrors = {};
    let hasErrors = false;
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    questions.slice(startIndex, endIndex).forEach((question, index) => {
      const questionIndex = startIndex + index;
      if (responses[questionIndex] === null) {
        newErrors[questionIndex] = 'This field is required';
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setErrors((prev) => ({ ...prev, ...newErrors }));
      setMessage({ message: 'Please fill all the fields on this page.', type: 'error' });
    } else {
      setCurrentPage((prev) => prev + 1);
      setMessage({ message: '', type: '' });
    }
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => prev - 1);
    setMessage({ message: '', type: '' }); // Clear global error on page change
  };

  return (
   
      <Frame3>
        <div className="w-full max-w-3xl p-8 bg-red-100 rounded-lg shadow-md border border-red-500 mx-auto">
        { /* Title and Date inside the red frame */}
          <h1 className="text-3xl font-bold mb-4 text-center">Parkinson's Disease Questionnaire (PDQ-39)</h1>
          <DateTimeDisplay />
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 justify-center"> {/* Centering the content */}
              {questions.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage).map((question, index) => {
                const questionIndex = currentPage * itemsPerPage + index;
                return (
                  <div key={questionIndex} className="mb-8">
                    {/* Center the question text and make it bold */}
                    <label className="block text-xl font-bold text-center text-gray-900 mb-4">{`${questionIndex + 1}. ${question}`}</label>
                    <div className="flex justify-center space-x-8"> {/* Centering the buttons */}
                      {[
                        { label: 'Never', color: 'bg-blue-500' },
                        { label: 'Rarely', color: 'bg-green-500' },
                        { label: 'Occasionally', color: 'bg-yellow-500' },
                        { label: 'Often', color: 'bg-orange-500' },
                        { label: 'Always', color: 'bg-red-500' },
                      ].map((option, value) => (
                        <button
                          key={value}
                          type="button"
                          className={`text-sm px-4 py-2 border rounded ${responses[questionIndex] === value ? option.color + ' text-white' : 'bg-gray-200'} ${errors[questionIndex] ? 'border-red-500' : 'border-gray-300'}`}
                          onClick={() => handleResponseChange(questionIndex, value)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                    {errors[questionIndex] && <p className="text-red-500 text-sm mt-1">{errors[questionIndex]}</p>}
                  </div>
                );
              })}
              {message.message && <Alert message={message.message} type={message.type} />}
              <div className="flex justify-between mt-4">
                {currentPage > 0 && (
                  <button type="button" className="bg-gray-500 rounded-md hover:bg-gray-700 border border-gray-700 px-4 py-2" onClick={handlePreviousPage}>
                    Previous
                  </button>
                )}
                {currentPage < totalPages - 1 && (
                  <button type="button" className="bg-blue-500  rounded-md hover:bg-blue-700 border border-blue-700 px-4 py-2" onClick={handleNextPage}>
                    Next
                  </button>
                )}
                {currentPage === totalPages - 1 && (
                  <button type="submit" className="bg-green-500 rounded-md hover:bg-green-700 border border-green-700 px-4 py-2">
                    Submit
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </Frame3>
    );
  };
  
  
export default ParkinsonsInterviewPage;

