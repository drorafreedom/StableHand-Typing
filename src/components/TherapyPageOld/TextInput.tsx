// TextInput.js

import React, { useState, useEffect, useRef } from 'react';
import buttonStyle from './buttonStyle';

const TextInput = ({ placeholder, setInputValue }) => {
  const [inputValue, setInput] = useState('');
  const [keyData, setKeyData] = useState([]);
  const keyDataRef = useRef(keyData);
  let lastKeyPressTime = null;
  let lastKeyReleaseTime = null;

  useEffect(() => {
    keyDataRef.current = keyData; 
  }, [keyData]);

  const handleKeyDown = (e) => {
    const pressTime = Date.now();

    if (!e.key.match(/^.$/)) return;

    const lagTime = lastKeyReleaseTime !== null ? pressTime - lastKeyReleaseTime : 0;
    const totalLagTime = lastKeyPressTime !== null ? pressTime - lastKeyPressTime : 0;

    setKeyData(keyData => [
      ...keyData, 
      {
        key: e.key,
        pressTime: pressTime,
        releaseTime: null,
        holdTime: null,
        lagTime: lagTime,
        totalLagTime: totalLagTime
      }
    ]);

    lastKeyPressTime = pressTime;
  };

  const handleKeyUp = (e) => {
    const releaseTime = Date.now();
    const updatedKeyData = keyDataRef.current.map(k => 
      k.key === e.key && k.releaseTime === null
        ? { ...k, releaseTime: releaseTime, holdTime: releaseTime - k.pressTime }
        : k
    );
    setKeyData(updatedKeyData);
    lastKeyReleaseTime = releaseTime;
  };

  const downloadCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Key,Press Time,Release Time,Hold Time,Lag Time,Total Lag Time\n";

    keyData.forEach(({ key, pressTime, releaseTime, holdTime, lagTime, totalLagTime }) => {
      csvContent += `${key},${new Date(pressTime).toISOString()},${releaseTime ? new Date(releaseTime).toISOString() : "N/A"},${holdTime || "N/A"},${lagTime},${totalLagTime}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "typing_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Cleanup event listeners
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div style={{
      position: 'absolute',
      top: '60%', 
      left: '50%', 
      transform: 'translate(-50%, -50%)',
      display: 'flex', 
      alignItems: 'center',
      width: '80%', 
      maxWidth: '800px'
    }}>
      <input 
        type="text"
        value={inputValue}
        placeholder={placeholder}
        onChange={handleInputChange}
        style={{
          flex: 1, 
          height: '30px',
          background: 'rgba(255, 255, 255, 0.5)',
          color: 'black',
          border: 'none',
          outline: 'none',
          padding: '5px',
          fontSize: '16px',
          borderRadius: '4px 0 0 4px'
        }}
      />
      <button onClick={downloadCSV} style={buttonStyle}>
        Submit
      </button>
      <button onClick={() => setKeyData([])} style={buttonStyle}>
        Reset
      </button>
    </div>
  );
};

export default TextInput;