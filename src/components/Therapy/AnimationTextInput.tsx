// src/components/TherapyPage/AnimationTextInput.jsx
import React, { useRef, useEffect } from 'react';

const AnimationTextInput = ({ inputValue, setInputValue, keystrokes, setKeystrokes, placeholder }) => {
  const textArea = useRef(null);

  useEffect(() => {
    const area = textArea.current;
    area.scrollTop = area.scrollHeight;
  }, [inputValue]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    const newKeystrokes = keystrokes.concat(e.nativeEvent);
    setKeystrokes(newKeystrokes);
  };

  return (
    <textarea
      value={inputValue}
      onChange={handleInputChange}
      ref={textArea}
      placeholder={placeholder}
      className="w-full p-2 border rounded resize-y h-32"
    />
  );
};

export default AnimationTextInput;
