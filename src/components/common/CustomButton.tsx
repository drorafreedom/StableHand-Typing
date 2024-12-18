// src/components/common/CustomButton.tsx
//TS version
import React from 'react';

// Define props interface
interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  className?: string; // Tailwind classes or custom styles
}

const CustomButton: React.FC<CustomButtonProps> = ({ children, onClick, className = '', ...props }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default CustomButton;



/* // src\components\common\CustomButton.jsx

//JS version 
import React from 'react';

const CustomButton = ({ children, onClick, className }) => (
  <button onClick={onClick} className={className}>
    {children}
  </button>
);

export default CustomButton; */

// how to use 
/* import React from 'react';
import CustomButton from './CustomButton';

const App = () => (
  <div>
    <CustomButton className="bg-blue-500 text-white p-2 rounded">
      Click Me!
    </CustomButton>
  </div>
);

export default App; */
