import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDoc, collection } from 'firebase/firestore';
import { db, storage } from '../../../firebase/firebase';
import Papa from 'papaparse';
import { ref, uploadBytes } from 'firebase/storage';
import Button from '../../common/Button';
import Alert from '../../common/Alert';

const questions = [
  'Had difficulty doing the leisure activities which you would like to do?',
  'Had difficulty looking after your home, e.g. DIY, housework, cooking?',
  'Had difficulty carrying bags of shopping?',
  'Had problems walking half a mile?',
  'Had problems walking 100 yards?',
  'Had problems getting around the house as easily as you would like?',
  'Had difficulty getting around in public?',
  'Needed someone else to accompany you when you went out?',
  'Felt frightened or worried about falling over in public?',
  'Been confined to the house more than you would like?',
  'Had difficulty washing yourself?',
  'Had difficulty dressing yourself?',
  'Had problems doing your shoe laces?',
  'Had problems writing clearly?',
  'Had difficulty cutting up your food?',
  'Had difficulty holding a drink without spilling it?',
  'Felt depressed?',
  'Felt isolated and lonely?',
  'Felt weepy or tearful?',
  'Felt angry or bitter?',
  'Felt anxious?',
  'Felt worried about your future?',
  'Felt you had to conceal your Parkinson\'s from people?',
  'Avoided situations which involve eating or drinking in public?',
  'Felt embarrassed in public due to having Parkinson\'s disease?',
  'Felt worried by other people\'s reaction to you?',
  'Had problems with your close personal relationships?',
  'Lacked support in the ways you need from your spouse or partner?',
  'Lacked support in the ways you need from your family or close friends?',
  'Unexpectedly fallen asleep during the day?',
  'Had problems with your concentration, e.g. when reading or watching TV?',
  'Felt your memory was bad?',
  'Had distressing dreams or hallucinations?',
  'Had difficulty with your speech?',
  'Felt unable to communicate with people properly?',
  'Felt ignored by people?',
  'Had painful muscle cramps or spasms?',
  'Had aches and pains in your joints or body?',
  'Felt unpleasantly hot or cold?',
];

const itemsPerPage = 10; // Adjust this to control the number of questions per page

const ParkinsonsInterviewPage = () => {
  const navigate = useNavigate();
  const [responses, setResponses] = useState(Array(39).fill(null));
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
      const score = responses.reduce((acc, curr) => acc + Number(curr), 0);
      const normalizedScore = ((score / (responses.length * 4)) * 100).toFixed(2);

      await addDoc(collection(db, 'parkinsons-surveys'), { responses, score });

      const csvData = responses.map((response, index) => ({
        question: index + 1,
        response,
      }));
      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

      const storageRef = ref(storage, `parkinsons_responses_${Date.now()}.csv`);
      await uploadBytes(storageRef, blob);

      navigate('/thank-you', { state: { type: 'parkinsons', score: normalizedScore } });
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
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-md border border-gray-300">
        <h1 className="text-4xl font-bold mb-4">Parkinson's Disease Questionnaire (PDQ-39)</h1>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4">
            {questions.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage).map((question, index) => {
              const questionIndex = currentPage * itemsPerPage + index;
              return (
                <div key={questionIndex} className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{`${questionIndex + 1}. ${question}`}</label>
                  <div className="flex space-x-2">
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
                        className={`px-4 py-2 border rounded ${
                          responses[questionIndex] === value ? option.color + ' text-white' : 'bg-gray-200'
                        } ${errors[questionIndex] ? 'border-red-500' : 'border-gray-300'}`}
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
          </div>
          {message.message && <Alert message={message.message} type={message.type} />}
          <div className="flex justify-between mt-4">
            {currentPage > 0 && (
              <Button type="button" className="bg-gray-500 hover:bg-gray-700 border border-gray-700" onClick={handlePreviousPage}>
                Previous
              </Button>
            )}
            {currentPage < totalPages - 1 && (
              <Button type="button" className="bg-blue-500 hover:bg-blue-700 border border-blue-700" onClick={handleNextPage}>
                Next
              </Button>
            )}
            {currentPage === totalPages - 1 && (
              <Button type="submit" className="bg-green-500 hover:bg-green-700 border border-green-700">
                Submit
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ParkinsonsInterviewPage;
