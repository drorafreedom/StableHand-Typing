// src\components\common\CustomButton.jsx
import React from 'react';

const CustomButton = ({ children, onClick, className }) => (
  <button onClick={onClick} className={className}>
    {children}
  </button>
);

export default CustomButton;

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
