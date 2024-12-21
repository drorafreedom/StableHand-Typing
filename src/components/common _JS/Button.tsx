// src/components/common/Button.jsx
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



export default Button;


