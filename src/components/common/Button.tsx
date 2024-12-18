// src/components/common/Button.tsx
//TS version
 

import React from 'react';

// Define props interface for the Button component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  className?: string; // Allows custom Tailwind classes
}

const Button: React.FC<ButtonProps> = ({ onClick, children, className = '', ...props }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;



/* // src/components/common/Button.jsx

///JS version
import React from 'react';

const Button = ({ onClick, children, className = '', ...props }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-white rounded focus:outline-none focus:ring-2 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};



export default Button; */


