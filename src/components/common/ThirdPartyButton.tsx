// src/components/common/ThirdPartyButton.jsx
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

export default ThirdPartyButton;



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
