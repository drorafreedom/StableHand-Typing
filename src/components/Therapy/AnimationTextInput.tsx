// src/components/TherapyPage/AnimationTextInput.tsx

import React, { useRef, useEffect, ChangeEvent } from 'react';

interface AnimationTextInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  keystrokes: KeyboardEvent[];
  setKeystrokes: (keystrokes: KeyboardEvent[]) => void;
  placeholder?: string;
}

const AnimationTextInput: React.FC<AnimationTextInputProps> = ({
  inputValue,
  setInputValue,
  keystrokes,
  setKeystrokes,
  placeholder,
}) => {
  const textArea = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textArea.current) {
      textArea.current.scrollTop = textArea.current.scrollHeight;
    }
  }, [inputValue]);

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    const newKeystrokes = keystrokes.concat(e.nativeEvent as KeyboardEvent);
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

 //+++++++++++JS version+++++++++++++++++
 // src/components/TherapyPage/AnimationTextInput.jsx
 // JS version


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
