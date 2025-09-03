// src/components/Therapy/TextDisplay.tsx
import React from 'react';
import buttonStyle from './buttonStyle';

interface TextDisplayProps {
  displayText: string;
  setDisplayText: (t: string) => void;
  style?: React.CSSProperties;
  buttonContainerStyle?: React.CSSProperties;
}

// Simple helper
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

const longParagraphs: string[] = [
  // ~120–160 words each, original text
  `I set the timer and begin to type at an even pace, letting the cursor lead the way like a metronome in the corner of the screen. The goal is not speed but consistency: equal pressure, repeatable rhythm, and a steady return to the home row. When the background shifts, it feels as if the page itself is breathing under the letters, a soft tide rising and falling. I try not to chase the motion. Instead, I keep my attention on the line I am copying, letting the words arrive one after another, neither forced nor hesitant. Small slips happen: an extra space, a swapped letter, a brief pause to find the next phrase. That is fine. The practice is to notice the interruption without reacting, and then continue as before, as if the sentence had never been interrupted at all.`,
  `The lab is quiet except for the gentle hum of ventilation and the occasional ring of a phone somewhere down the hallway. I sit with my shoulders relaxed and my elbows lightly anchored, allowing my hands to hover above the keys. Before starting, I check that the font is legible, the contrast is comfortable, and the window is large enough that no scrolling will be needed. A deep breath, and then the first line begins. I let the eyes travel a second ahead of the fingers, gathering the next few words like stepping stones. When the animation appears, I acknowledge it as background—useful information, not a command. If a hesitation creeps in, I release it with an exhale and resume the steady pattern: press, release, move, return. The cadence becomes familiar and, with practice, reassuring.`,
  `On some days the work feels like tuning an instrument that learns as you play it. The keyboard has a personality, the desk has a temperature, and the chair finds a height that encourages a balanced posture. What changes is my attention. I begin by copying a paragraph that asks nothing of me except patience, letting each line resolve before starting the next. When the moving field arrives, I treat it the way a reader treats the margins of a page: present, supportive, and not the main event. The trick is to let the body take care of the routine while the mind keeps the horizon in view. Errors are invitations to slow down, not reasons to stop. By the end of a block, I can usually feel a small clarity where the clutter used to be.`,
  `A reliable routine helps: place both feet flat on the floor, adjust the screen so that the top line sits just below eye level, and choose a font size that makes the words look calm instead of crowded. I glance at the clock but do not count seconds; the timer will keep time for me. The first sentence is copied slowly to set the texture of the session. The second sentence follows with a touch more confidence. When the background begins to slide, I allow the hands to keep their rhythm while the gaze softens, as if listening to music at low volume. If the mind wanders, I note where it went and invite it back without scolding. By repeating this loop—notice, return, continue—I often discover that steadiness comes from gentleness, not force.`,
  `Imagine the task as walking along a well-lit path. Each word is a step, each line a small stretch of ground, and the paragraph a block of distance that can be completed without hurry. When the visual field moves, it is like a breeze crossing the path: it may shift your attention but it does not change the destination. I do not try to match the wind; I keep my pace. Fingers press and release, wrists remain neutral, shoulders stay easy. The copy text offers clear targets so the eyes can land and the hands can follow. When a stumble happens—an accidental key or an empty beat—I mark it with a quiet breath and resume. The point is not perfection, but repeatability: the same calm motion, again and again, until it feels ordinary.`,
  `Before finishing, I add a short cool-down paragraph that reminds me to check in with posture and breath. I loosen the jaw, drop the shoulders, and let the hands rest. Then I review the block: Were the pauses evenly spaced? Did certain words invite hesitation? Did the moving background help me keep a gentle tempo? These questions are not tests; they are notes for next time. The text I copy today is unremarkable by design, because ordinary material is the best stage on which to notice small changes. With that, I clear the screen, take one last breath, and prepare for the next run. The goal remains the same: a steady practice that can accommodate variation and return to center without drama.`,
];

const shortParagraphs: string[] = [
  // 1–2 sentences, original and varied (pangrams & practice lines included)
  `Please copy this line exactly as shown, including spaces and punctuation.`,
  `The quick brown fox jumps over the lazy dog; then it trots back again.`,
  `Pack my box with five dozen liquor jugs, then label it and rest.`,
  `We measured the time between taps and the distance between errors.`,
  `Calm hands, steady rhythm, simple text—repeat until it feels ordinary.`,
  `Numbers to copy: 1 2 3 4 5 6 7 8 9 0.`,
  `Symbols to copy: ! @ # $ % ^ & * ( ) — : ; , . ?`,
  `Short paragraph with two sentences. It ends here.`,
  `Focus on the next two words, not the whole line.`,
  `Breathe in, type the phrase; breathe out, move on.`,
];

const makeMixedSection = () =>
  `${pick(longParagraphs)}\n\n${pick(shortParagraphs)}\n\n${pick(shortParagraphs)}`;

const TextDisplay: React.FC<TextDisplayProps> = ({
  displayText,
  setDisplayText,
  style,
  buttonContainerStyle,
}) => {
  return (
    <div
      style={{
        width: 'min(70ch, 90vw)',
        padding: '1rem',
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        lineHeight: 1.6,
        ...style, // keep your positioning/pointer-events choices
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          ...buttonContainerStyle,
        }}
      >
        <button
          onClick={() => setDisplayText(pick(longParagraphs))}
          style={buttonStyle}
        >
          Long Paragraph
        </button>
        <button
          onClick={() => setDisplayText(pick(shortParagraphs))}
          style={buttonStyle}
        >
          Short Paragraph
        </button>
        <button
          onClick={() => setDisplayText(makeMixedSection())}
          style={buttonStyle}
        >
          Mixed Section (Long + Short)
        </button>
        <button
          onClick={() =>
            setDisplayText(
              `${pick(shortParagraphs)}\n\n${pick(shortParagraphs)}\n\n${pick(shortParagraphs)}`
            )
          }
          style={buttonStyle}
        >
          Three Shorts
        </button>
      </div>

      <div
        style={{
          marginTop: '0.75rem',
          padding: '0.75rem',
          border: '1px solid #e5e7eb',
          borderRadius: '0.375rem',
          whiteSpace: 'pre-wrap', // ✅ preserve paragraph breaks
          textAlign: 'left',
          maxHeight: '40vh',
          overflow: 'auto',
        }}
      >
        {displayText || 'Select a text type to display (Long, Short, Mixed).'}
      </div>
    </div>
  );
};

export default TextDisplay;




/* // src/components/Therapy/TextDisplay.tsx

import React from 'react';
import buttonStyle from './buttonStyle';

interface TextDisplayProps {
  displayText: string;
  setDisplayText: (t: string) => void;
  style?: React.CSSProperties;
  buttonContainerStyle?: React.CSSProperties;
}

const TextDisplay: React.FC<TextDisplayProps> = ({
  displayText,
  setDisplayText,
  style,
  buttonContainerStyle,
}) => {

  const historicPassages: string[] = [
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
    "A screaming comes across the sky - Thomas Pynchon.",
  ];

  const latinTexts: string[] = [
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
    "Veritas vos liberabit - The truth will set you free.",
  ];

  return (
    <div
      style={{
        width:  'max-content',
        padding: '1rem',
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        ...style         // <-- bottom/right placement + pointer-events: none
      }}
    >
      <div
        style={{
          display: 'flex',
          gap:     '0.5rem',
          ...buttonContainerStyle  // <-- pointer-events: auto for the buttons
        }}
      >
        <button
          onClick={() =>
            setDisplayText(
              historicPassages[Math.floor(Math.random() * historicPassages.length)]
            )
          }
          style={buttonStyle}
        >
          Historic Passage
        </button>
        <button
          onClick={() =>
            setDisplayText(latinTexts[Math.floor(Math.random() * latinTexts.length)])
          }
          style={buttonStyle}
        >
          Latin Text
        </button>
      </div>
      <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
        {displayText || 'Select an option to display text'}
      </div>
    </div>
  );
};

export default TextDisplay; */

//+++++++++++JS version+++++++++++++++++
/*   //src\components\Therapy\TextDisplay.tsx
  // JS version

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

export default TextDisplay; */



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