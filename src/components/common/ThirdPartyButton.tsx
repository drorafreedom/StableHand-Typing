// src/components/common/ThirdPartyButton.tsx
// TS version

import React from 'react';

// Define props interface
interface ThirdPartyButtonProps {
  onClick: () => void; // Callback function triggered on button click
  className?: string; // Additional class names for the button
  color: string; // Background color class for the button
  hoverColor: string; // Hover color class for the button
  textColor: string; // Text color class for the button
  text: string; // Button text
  logo?: string; // Optional logo image source
}

const ThirdPartyButton: React.FC<ThirdPartyButtonProps> = ({
  onClick,
  className = '',
  color,
  hoverColor,
  textColor,
  text,
  logo,
}) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center p-2 rounded ${color} ${hoverColor} ${textColor} ${className}`}
  >
    {/* Render the logo if provided */}
    {logo && <img src={logo} alt={`${text} logo`} className="w-6 h-6 mr-2" />}
    {text}
  </button>
);

export default ThirdPartyButton;

//+++++++++++JS version++++++++++++++
/* // src/components/common/ThirdPartyButton.jsx
//JS version
import React from 'react';

const ThirdPartyButton = ({ onClick, className, color, hoverColor, textColor, text, logo }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center p-2 rounded ${color} ${hoverColor} ${textColor} ${className}`}
  >
    {logo && <img src={logo} alt={`${text} logo`} className="w-6 h-6 mr-2" />}
    {text}
  </button>
);

export default ThirdPartyButton; */



/* import React from 'react';

const ThirdPartyButton = ({ onClick, logo, altText, backgroundColor, hoverColor }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-center p-2 mt-2 rounded transition duration-200 ${backgroundColor} ${hoverColor}`}
    style={{ height: '50px' }}
  >
    <img src={logo} alt={altText} className="h-full object-contain" />
  </button>
);

export default ThirdPartyButton; */
