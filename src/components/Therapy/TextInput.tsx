// src/components/Therapy/TextInput.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Collapse } from 'react-collapse';
import buttonStyle from './buttonStyle';
 import TextDisplay from './TextDisplay';

interface KeyData {
  key: string;
  pressTime: number;
  releaseTime: number | null;
  holdTime: number | null;
  lagTime: number;
  totalLagTime: number;
}

interface TextInputProps {
  placeholder: string;
  displayText: string;
  setDisplayText: React.Dispatch<React.SetStateAction<string>>;   
  saveKeystrokeData: (data: { keyData: KeyData[]; errors: number }) => void;
}

const TextInput: React.FC<TextInputProps> = ({ placeholder, displayText, setDisplayText, saveKeystrokeData }) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [keyData, setKeyData] = useState<KeyData[]>([]);
  const [font, setFont] = useState<string>('Arial');
  const [fontSize, setFontSize] = useState<number>(16);
  const [isBold, setIsBold] = useState<boolean>(false);
  const [textColor, setTextColor] = useState<string>('#000000');
  const [backgroundColor, setBackgroundColor] = useState<string>('#FFFFFF');
  const [backgroundOpacity, setBackgroundOpacity] = useState<number>(1);
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(true);

  const keyDataRef = useRef<KeyData[]>(keyData);
  let lastKeyPressTime: number | null = null;
  let lastKeyReleaseTime: number | null = null;

  useEffect(() => {
    keyDataRef.current = keyData;
  }, [keyData]);

  const handleKeyDown = (e: KeyboardEvent) => {
    const pressTime = Date.now();

    if (!e.key.match(/^.$/)) return;

    const lagTime = lastKeyReleaseTime !== null ? pressTime - lastKeyReleaseTime : 0;
    const totalLagTime = lastKeyPressTime !== null ? pressTime - lastKeyPressTime : 0;

    setKeyData((prevKeyData) => [
      ...prevKeyData,
      {
        key: e.key,
        pressTime: pressTime,
        releaseTime: null,
        holdTime: null,
        lagTime: lagTime,
        totalLagTime: totalLagTime,
      },
    ]);

    lastKeyPressTime = pressTime;
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    const releaseTime = Date.now();

    const updatedKeyData = keyDataRef.current.map((k) =>
      k.key === e.key && k.releaseTime === null
        ? { ...k, releaseTime: releaseTime, holdTime: releaseTime - k.pressTime }
        : k
    );

    setKeyData(updatedKeyData);
    lastKeyReleaseTime = releaseTime;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = () => {
    const errors = calculateErrors(inputValue, displayText);
    const dataToSave = { keyData, errors };
    saveKeystrokeData(dataToSave);
  };

  const calculateErrors = (typedText: string, originalText: string): number => {
    const typedWords = typedText.split(' ');
    const originalWords = originalText.split(' ');
    let errors = 0;

    typedWords.forEach((word, index) => {
      if (word !== originalWords[index]) {
        errors++;
      }
    });

    return errors;
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className="relative w-3/4 m-30  ">
      <div className=" flex flex-row justify-between items-start w-full space-x-4 ">
  {/* Left: Text Input */}
  <div className=" flex-1 text-xs">
    <textarea
      value={inputValue}
      placeholder={placeholder}
      onChange={handleInputChange}
      style={{
        width: '100%',
        height: '300px',
        fontFamily: font,
        fontSize: `${fontSize}px`,
        fontWeight: isBold ? 'bold' : 'normal',
        color: textColor,
        backgroundColor: `rgba(${parseInt(backgroundColor.slice(1, 3), 16)}, ${parseInt(backgroundColor.slice(3, 5), 16)}, ${parseInt(backgroundColor.slice(5, 7), 16)}, ${backgroundOpacity})`,
        border: '1px solid #ccc',
        outline: 'none',
        padding: '10px',
        borderRadius: '4px',
        resize: 'vertical',
        overflowY: 'scroll',
      }}
    />
  </div>

  {/* Right: Control Panel */}
 
</div>

      <button onClick={() => setIsPanelOpen(!isPanelOpen)} className="flex mb-200 text-xs  bg-gray-100 p-2 border rounded w-1/4 ">
        {isPanelOpen ? ' Hide Text Control' : 'Show Text Controls'}
      </button>
      <Collapse isOpened={isPanelOpen}>
        <div className="flex flex-wrap  text-xs bg-gray-200 p-200 border rounded w-1/4">
          <div className="w-full md:w-1/4">
            <label>Font:</label>
            <select value={font} onChange={(e) => setFont(e.target.value)} className="border p-2 rounded w-full">
              <option value="Arial">Arial</option>
              <option value="Verdana">Verdana</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
              <option value="Georgia">Georgia</option>
            </select>
          </div>
          <div className="w-full md:w-1/4 text -xs">
            <label>Font Size:</label>
            <select value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="border p-2 rounded w-full">
              {[...Array(31)].map((_, i) => (
                <option key={i} value={10 + i}>
                  {10 + i}
                </option>
              ))}
            </select>
          </div>
          <div className="w-half md:w-1/4 flex items-center space-x-2">
            <label>Bold:</label>
            <input type="checkbox" checked={isBold} onChange={(e) => setIsBold(e.target.checked)} className="border p-2 rounded" />
          </div>
          <div className="w-full md:w-1/4">
            <label>Text Color:</label>
            <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-full" />
          </div>
          <div className="w-full md:w-1/4">
            <label>Background Color:</label>
            <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="w-full" />
          </div>
          <div className="w-full md:w-1/4">
            <label>Background Opacity:</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={backgroundOpacity}
              onChange={(e) => setBackgroundOpacity(parseFloat(e.target.value))}
              className="border p-2 rounded w-full"
            />
          </div>
        </div>
      </Collapse>
      <div className="bg-gray-200 p-200 border rounded w-1/4">
        <button onClick={handleSubmit} style={buttonStyle}>
          Submit
        </button>
        <button onClick={() => setInputValue('')} style={buttonStyle}>
          Reset
        </button>
      </div>
     {/*  <div className="absolute center-1920 right-22 w-1/3 z-7 p-4">
        <TextDisplay displayText={displayText} setDisplayText={setDisplayText} />
      </div> */}
    </div>
  );
};

export default TextInput;

//+++++++++++JS version+++++++++++++++++
// src\components\Therapy\TextInput.jsx   
  // JS version

/* import React, { useState, useEffect, useRef } from 'react';
import { Collapse } from 'react-collapse';
import buttonStyle from './buttonStyle';

const TextInput = ({ placeholder, displayText, saveKeystrokeData }) => {
  const [inputValue, setInputValue] = useState('');
  const [keyData, setKeyData] = useState([]);
  const [font, setFont] = useState('Arial');
  const [fontSize, setFontSize] = useState(16);
  const [isBold, setIsBold] = useState(false);
  const [textColor, setTextColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [backgroundOpacity, setBackgroundOpacity] = useState(1);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
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

    setKeyData((keyData) => [
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
    const updatedKeyData = keyDataRef.current.map((k) => 
      k.key === e.key && k.releaseTime === null
        ? { ...k, releaseTime: releaseTime, holdTime: releaseTime - k.pressTime }
        : k
    );
    setKeyData(updatedKeyData);
    lastKeyReleaseTime = releaseTime;
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = () => {
    const errors = calculateErrors(inputValue, displayText);
    const dataToSave = { keyData, errors };
    saveKeystrokeData(dataToSave);
  };

  const calculateErrors = (typedText, originalText) => {
    const typedWords = typedText.split(' ');
    const originalWords = originalText.split(' ');
    let errors = 0;

    typedWords.forEach((word, index) => {
      if (word !== originalWords[index]) {
        errors++;
      }
    });

    return errors;
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className="relative w-100% p-4">
 <div className="w-full mb-4">
        <textarea 
          value={inputValue}
          placeholder={placeholder}
          onChange={handleInputChange}
          style={{
            width: '100%',
            height: '300px',
            fontFamily: font,
            fontSize: `${fontSize}px`,
            fontWeight: isBold ? 'bold' : 'normal',
            color: textColor,
            backgroundColor: `rgba(${parseInt(backgroundColor.slice(1, 3), 16)}, ${parseInt(backgroundColor.slice(3, 5), 16)}, ${parseInt(backgroundColor.slice(5, 7), 16)}, ${backgroundOpacity})`,
            border: '1px solid #ccc',
            outline: 'none',
            padding: '10px',
            borderRadius: '4px',
            resize: 'vertical',
            overflowY: 'scroll',
          }}
        />
      </div>

      <button onClick={() => setIsPanelOpen(!isPanelOpen)} className=" flex  mb-200 bg-red-200 p-2 border rounded w-1/3">
        {isPanelOpen ? ' Hide Text Control' : 'Show Text Controls'}
      </button>
      <Collapse isOpened={isPanelOpen}>
        <div className="flex flex-wrap  mb-200 bg-red-200 p-200 border rounded w-1/3">
          <div className="w-full md:w-1/3">
            <label>Font:</label>
            <select value={font} onChange={(e) => setFont(e.target.value)} className="border p-2 rounded w-full">
              <option value="Arial">Arial</option>
              <option value="Verdana">Verdana</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
              <option value="Georgia">Georgia</option>
            </select>
          </div>
          <div className="w-full md:w-1/3">
            <label>Font Size:</label>
            <select value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="border p-2 rounded w-full">
              {[...Array(31)].map((_, i) => (
                <option key={i} value={10 + i}>{10 + i}</option>
              ))}
            </select>
          </div>
          <div className="w-half md:w-1/3 flex items-center space-x-2">
            <label>Bold:</label>
            <input type="checkbox" checked={isBold} onChange={(e) => setIsBold(e.target.checked)} className="border p-2 rounded" />
          </div>
          <div className="w-full md:w-1/3">
            <label>Text Color:</label>
            <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="  w-full" />
          </div>
          <div className="w-full md:w-1/3">
            <label>Background Color:</label>
            <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="  w-full" />
          </div>
          <div className="w-full md:w-1/3">
            <label>Background Opacity:</label>
            <input type="range" min="0" max="1" step="0.01" value={backgroundOpacity} onChange={(e) => setBackgroundOpacity(e.target.value)} className="border p-2 rounded w-full" />
          </div>
        </div>
      </Collapse>
      <div className=" bg-red-200 p-200 border rounded w-1/3"> 
     
        <button onClick={handleSubmit} style={buttonStyle}>
          Submit
        </button>
        <button onClick={() => setInputValue('')} style={buttonStyle}>
          Reset
        </button>
      </div>
    </div>
  );
};

export default TextInput; */

//---------------------------------------------------

 //a version with control panel
/* import React, { useState, useEffect, useRef } from 'react';
import buttonStyle from './buttonStyle';
import TextInputControlPanel from './TextInputControlPanel';

const TextInput = ({ placeholder, displayText, saveKeystrokeData }) => {
  const [inputValue, setInputValue] = useState('');
  const [keyData, setKeyData] = useState([]);
  const [font, setFont] = useState('Arial');
  const [fontSize, setFontSize] = useState('16px');
  const [isBold, setIsBold] = useState(false);
  const [textColor, setTextColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [backgroundOpacity, setBackgroundOpacity] = useState(1);
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

    setKeyData((keyData) => [
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
    const updatedKeyData = keyDataRef.current.map((k) => 
      k.key === e.key && k.releaseTime === null
        ? { ...k, releaseTime: releaseTime, holdTime: releaseTime - k.pressTime }
        : k
    );
    setKeyData(updatedKeyData);
    lastKeyReleaseTime = releaseTime;
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = () => {
    const errors = calculateErrors(inputValue, displayText);
    const dataToSave = { keyData, errors };
    saveKeystrokeData(dataToSave);
  };

  const calculateErrors = (typedText, originalText) => {
    const typedWords = typedText.split(' ');
    const originalWords = originalText.split(' ');
    let errors = 0;

    typedWords.forEach((word, index) => {
      if (word !== originalWords[index]) {
        errors++;
      }
    });

    return errors;
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className="w-full flex flex-row items-center">
      <div className="flex-1">
        <textarea 
          value={inputValue}
          placeholder={placeholder}
          onChange={handleInputChange}
          style={{
            width: '100%',
            height: '200px',
            fontFamily: font,
            fontSize: fontSize,
            fontWeight: isBold ? 'bold' : 'normal',
            color: textColor,
            backgroundColor: `${backgroundColor}${Math.floor(backgroundOpacity * 255).toString(16).padStart(2, '0')}`,
            border: 'none',
            outline: 'none',
            padding: '10px',
            borderRadius: '4px',
            resize: 'none',
            overflowY: 'scroll',
          }}
        />
      </div>
      <div className="ml-4">
        <TextInputControlPanel
          font={font} setFont={setFont}
          fontSize={fontSize} setFontSize={setFontSize}
          isBold={isBold} setIsBold={setIsBold}
          textColor={textColor} setTextColor={setTextColor}
          backgroundColor={backgroundColor} setBackgroundColor={setBackgroundColor}
          backgroundOpacity={backgroundOpacity} setBackgroundOpacity={setBackgroundOpacity}
        />
      </div>
      <div className="flex flex-col space-y-2 mt-4">
        <button onClick={handleSubmit} style={buttonStyle}>
          Submit
        </button>
        <button onClick={() => setInputValue('')} style={buttonStyle}>
          Reset
        </button>
      </div>
    </div>
  );
};

export default TextInput; */





/* // src/Components/Therapy/TextInput.jsx
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

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className="absolute top-3/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center w-4/5 max-w-800px">
      <input 
        type="text"
        value={inputValue}
        placeholder={placeholder}
        onChange={handleInputChange}
        className="flex-1 h-8 bg-opacity-50 bg-white border-none outline-none p-2 text-base rounded-l"
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
 */