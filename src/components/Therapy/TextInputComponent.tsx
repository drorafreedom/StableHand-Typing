// src/components/TherapyPage/TextInputComponent.jsx

import React, { useState } from 'react';
import { db, storage } from '../../firebase/firebase';
import { doc, setDoc, collection } from 'firebase/firestore';
import { ref, uploadString } from 'firebase/storage';
import { useAuth } from '../../data/AuthContext';

const TextInputComponent = ({ animationParams }) => {
  const [text, setText] = useState('');
  const { currentUser } = useAuth();
  const timestamp = new Date().toISOString();

  const handleSubmit = async () => {
    try {
      const userDocRef = doc(collection(db, `users/${currentUser.uid}/therapy`));
      const formDataWithTimestamp = { ...animationParams, text, timestamp };
      await setDoc(userDocRef, formDataWithTimestamp);

      const csvData = Object.keys(formDataWithTimestamp).map(key => {
        const value = Array.isArray(formDataWithTimestamp[key])
          ? formDataWithTimestamp[key].join(';')
          : formDataWithTimestamp[key];
        return `${key},${value}`;
      }).join('\n');
      
      const csvRef = ref(storage, `users/${currentUser.uid}/therapy/${timestamp}.csv`);
      await uploadString(csvRef, csvData);

      console.log('Data submitted successfully.');
    } catch (err) {
      console.error('Error submitting data:', err);
    }
  };

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type here..."
        style={{ width: '100%', height: '100px', resize: 'none', borderColor: 'gray', borderWidth: '1px', borderRadius: '4px', padding: '10px' }}
      />
      <button onClick={handleSubmit} style={{ marginTop: '10px', padding: '10px', backgroundColor: '#4caf50', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
        Submit
      </button>
    </div>
  );
};

export default TextInputComponent;

