import React from 'react';
import buttonStyle from './buttonStyle';

const TextDisplay = ({ displayText, setDisplayText }) => {

  const fetchQuote = async () => {
    try {
      const response = await fetch('https://api.api-ninjas.com/v1/quotes?', {
        headers: {
          'X-Api-Key': 'YuQ8PUjiA8l7LHvzUyX7lw==bg18WeGVrSb1cabG' // Replace with your API key
        }
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      if (data && data.length > 0) {
        setDisplayText(data[0].quote); // Assuming the API returns an array of quotes
      }
    } catch (error) {
      console.error('Fetching quote failed:', error);
    }
  };

  const historicPassages = [
    "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife - Jane Austen.",
    "All happy families are alike; each unhappy family is unhappy in its own way - Leo Tolstoy.",
    "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness - Charles Dickens.",
    "Call me Ishmael - Herman Melville.",
    "It was a bright cold day in April, and the clocks were striking thirteen - George Orwell.",
    "I am an invisible man - Ralph Ellison.",
    "The sun shone, having no alternative, on the nothing new - Samuel Beckett.",
    "If you really want to hear about it, the first thing you'll probably want to know is where I was born - J.D. Salinger.",
    "It was a pleasure to burn - Ray Bradbury.",
    "You don't know about me without you have read a book by the name of The Adventures of Tom Sawyer - Mark Twain.",
    "When he was nearly thirteen, my brother Jem got his arm badly broken at the elbow - Harper Lee.",
    "I had the story, bit by bit, from various people, and, as generally happens in such cases, each time it was a different story - Edith Wharton.",
    "In my younger and more vulnerable years my father gave me some advice that I've been turning over in my mind ever since - F. Scott Fitzgerald.",
    "You better not never tell nobody but God - Alice Walker.",
    "There was no possibility of taking a walk that day - Charlotte Brontë.",
    "The past is a foreign country; they do things differently there - L.P. Hartley.",
    "All children, except one, grow up - J.M. Barrie.",
    "It was love at first sight - Joseph Heller.",
    "Into the face of the young man who sat on the terrace of the Hotel Magnifique at Cannes there crept a look of furtive shame, the shifty, hangdog look which announces that an Englishman is about to speak French - P.G. Wodehouse.",
    "A screaming comes across the sky - Thomas Pynchon."
  ];

  const latinTexts = [
    "Veni, vidi, vici - Julius Caesar.",
    "Carpe diem - Horace.",
    "Amor vincit omnia - Virgil.",
    "Audere est facere - To dare is to do.",
    "Faber est suae quisque fortunae - Every man is the artisan of his own fortune.",
    "Alea iacta est - The die is cast - Julius Caesar.",
    "In vino veritas - In wine, there is truth.",
    "Si vis pacem, para bellum - If you want peace, prepare for war.",
    "Vivere est cogitare - To live is to think - Cicero.",
    "Ad astra per aspera - Through hardships to the stars.",
    "Dulce et decorum est pro patria mori - It is sweet and fitting to die for one's country - Horace.",
    "Non ducor, duco - I am not led, I lead.",
    "Sapere aude - Dare to be wise.",
    "Vox populi, vox Dei - The voice of the people is the voice of God.",
    "Panem et circenses - Bread and circuses - Juvenal.",
    "Aurora Musis amica - Dawn is a friend of the muses.",
    "Lux et veritas - Light and truth.",
    "O tempora, o mores! - Oh the times! Oh the customs! - Cicero.",
    "Per aspera ad astra - Through hardships to the stars.",
    "Veritas vos liberabit - The truth will set you free."
  ];


  return (
    <div style={{
      position: 'relative top',
      top: '40%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '90%',
      maxWidth: '600px',
      border: 'none',
      borderRadius: '4px',
      padding: '20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'stretch',
      zIndex: 1000,
    }}>
      <div style={{ 
        flexGrow: 1, 
        background: 'rgba(240, 248, 255, 0.0)', 
        borderRadius: '4px',
        marginRight: '15px', 
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        width: '90%',
      }}>
        <span>{displayText || "Select an option to display text"}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <button onClick={fetchQuote} style={buttonStyle}>Historic Passage</button>
        <button onClick={() => setDisplayText(latinTexts[Math.floor(Math.random() * latinTexts.length)])} style={buttonStyle}>Latin Text</button>
        
      </div>
    </div>
  );
};

export default TextDisplay;



/* // TextDisplay.js
import React, { useState } from 'react';
import buttonStyle from './buttonStyle';

const TextDisplay = ({ displayText, setDisplayText }) => {

  const fetchQuote = async () => {
    try {
      const response = await fetch('https://api.api-ninjas.com/v1/quotes?', {
        headers: {
          'X-Api-Key': 'YuQ8PUjiA8l7LHvzUyX7lw==bg18WeGVrSb1cabG' // Replace with your API key
        }
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      if (data && data.length > 0) {
        setDisplayText(data[0].quote); // Assuming the API returns an array of quotes
      }
    } catch (error) {
      console.error('Fetching quote failed:', error);
    }
  };

  const historicPassages = [
    "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife - Jane Austen.",
    "All happy families are alike; each unhappy family is unhappy in its own way - Leo Tolstoy.",
    "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness - Charles Dickens.",
    "Call me Ishmael - Herman Melville.",
    "It was a bright cold day in April, and the clocks were striking thirteen - George Orwell.",
    "I am an invisible man - Ralph Ellison.",
    "The sun shone, having no alternative, on the nothing new - Samuel Beckett.",
    "If you really want to hear about it, the first thing you'll probably want to know is where I was born - J.D. Salinger.",
    "It was a pleasure to burn - Ray Bradbury.",
    "You don't know about me without you have read a book by the name of The Adventures of Tom Sawyer - Mark Twain.",
    "When he was nearly thirteen, my brother Jem got his arm badly broken at the elbow - Harper Lee.",
    "I had the story, bit by bit, from various people, and, as generally happens in such cases, each time it was a different story - Edith Wharton.",
    "In my younger and more vulnerable years my father gave me some advice that I've been turning over in my mind ever since - F. Scott Fitzgerald.",
    "You better not never tell nobody but God - Alice Walker.",
    "There was no possibility of taking a walk that day - Charlotte Brontë.",
    "The past is a foreign country; they do things differently there - L.P. Hartley.",
    "All children, except one, grow up - J.M. Barrie.",
    "It was love at first sight - Joseph Heller.",
    "Into the face of the young man who sat on the terrace of the Hotel Magnifique at Cannes there crept a look of furtive shame, the shifty, hangdog look which announces that an Englishman is about to speak French - P.G. Wodehouse.",
    "A screaming comes across the sky - Thomas Pynchon."
  ];

  const latinTexts = [
    "Veni, vidi, vici - Julius Caesar.",
    "Carpe diem - Horace.",
    "Amor vincit omnia - Virgil.",
    "Audere est facere - To dare is to do.",
    "Faber est suae quisque fortunae - Every man is the artisan of his own fortune.",
    "Alea iacta est - The die is cast - Julius Caesar.",
    "In vino veritas - In wine, there is truth.",
    "Si vis pacem, para bellum - If you want peace, prepare for war.",
    "Vivere est cogitare - To live is to think - Cicero.",
    "Ad astra per aspera - Through hardships to the stars.",
    "Dulce et decorum est pro patria mori - It is sweet and fitting to die for one's country - Horace.",
    "Non ducor, duco - I am not led, I lead.",
    "Sapere aude - Dare to be wise.",
    "Vox populi, vox Dei - The voice of the people is the voice of God.",
    "Panem et circenses - Bread and circuses - Juvenal.",
    "Aurora Musis amica - Dawn is a friend of the muses.",
    "Lux et veritas - Light and truth.",
    "O tempora, o mores! - Oh the times! Oh the customs! - Cicero.",
    "Per aspera ad astra - Through hardships to the stars.",
    "Veritas vos liberabit - The truth will set you free."
  ];

  return (
    <div style={{
      position: 'absolute',
      top: '40%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '90%',
      maxWidth: '600px',
      border: 'none',
      borderRadius: '4px',
      padding: '20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'stretch', // Align items stretch to match height
      zIndex: 1000,
    }}>
      <div style={{ 
        flexGrow: 1, 
        background: 'rgba(240, 248, 255, 0.0)', // Different color for visual separation
        borderRadius: '4px',
        marginRight: '15px', // Space between text box and buttons
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center', // Vertically center the text
        width: '90%',
      }}>
        <span>{displayText || "Select an option to display text"}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <button onClick={() => fetchQuote()} style={buttonStyle}>Historic Passage</button>
        <button onClick={() => setDisplayText(latinTexts[Math.floor(Math.random() * latinTexts.length)])} style={buttonStyle}>Latin Text</button>
      </div>
    </div>
  );
};

export default TextDisplay; */