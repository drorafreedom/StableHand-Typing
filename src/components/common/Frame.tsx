// src/components/common/Frame.jsx
// src/components/common/Frame.jsx
import React from 'react';

const Frame4 = ({ children }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-md border border-gray-300">
        {children}
      </div>
    </div>
  );
};



 const Frame = ({ children }) => {
  return (
    <div className="flex flex-col items-center justify-top min-h-screen p-0 bg-gray-100">
      <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-md border border-gray-300">
        {children}
      </div>
    </div>
  );
};

const Frame2 = ({ children }) => {
  return (
    <div className="flex flex-col items-center justify-top min-h-screen p-1 bg-blue-100">
      <div className="w-full max-w-lg bg-white p-3 rounded-lg shadow-md border border-gray-300">
        {children}
      </div>
    </div>
  );
};
/* const Frame3 = ({ children }) => {
  return (
    <div className="flex flex-col items-center justify-top min-h-screen  w-screen p-100 bg-oubj-100">
      <div className="w-full w-lg bg-white-700 p-1 rounded-lg shadow-md  border  border-red-700">
        {children}
      </div>
    </div>
  );
}; */
/* const Frame3 = ({
  children,
  bgColor = 'bg-gray-100',   // Default background color
  padding = 'p-8',           // Default padding
  paddingX = 'pl-4',         // Default horizontal padding
  marginX = 'mx-28',          // Default horizontal margin (no margin)
  border = 'border border-red-700',  // Default border
  rounded = 'rounded-lg',    // Default rounding
  shadow = 'shadow-md'       // Default shadow
}) => {
  return (
    <div className={`flex flex-col items-center justify-top min-h-screen w-screen ${bgColor} ${padding} ${paddingX} ${shadow} ${rounded} ${border} ${marginX}`}>
      {children}
    </div>
  );
}; */

 // src/components/common/Frame.jsx
/* const Frame3 = ({
  children,
  bgColor = 'bg-gray-100',   // Default background color
  paddingY = 'py-8',         // Vertical padding (top and bottom)
  paddingX = 'px-8',         // Horizontal padding (left and right)
  marginX = 'mx-2',          // Horizontal margin (left and right)
  border = 'border border-red-700',  // Default border
  rounded = 'rounded-lg',    // Default rounding
  shadow = 'shadow-md',      // Default shadow
  fullWidth = 'w-screen'           // Option for full-width layout
}) => {
  return (
    <div className={`flex flex-col items-center justify-top min-h-screen ${fullWidth} ${bgColor} ${paddingY} ${paddingX} ${marginX}  ${rounded} ${shadow} ${border}`z}>
     
        {children}
      </div>
     
  );
}; */

const Frame3 = ({
  children,
  bgColor = 'bg-gray-100',   // Default background color
  paddingY = 'py-4',         // Vertical padding (top and bottom)
  paddingX = 'px-8',         // Horizontal padding (left and right)
  marginX = 'mx-2',          // Horizontal margin (left and right)
  border = 'border border-red-700',  // Default border
  rounded = 'rounded-lg',    // Default rounding
  shadow = 'shadow-md',      // Default shadow
  fullWidth = 'w-screen'     // Option for full-width layout
}) => {
  return (
    <div 
      className={`flex flex-col items-center justify-top min-h-screen ${fullWidth} ${bgColor} ${paddingY} ${paddingX} ${marginX} ${rounded} ${shadow} ${border}`}
      style={{
        position: 'relative', // or 'absolute', 'fixed' depending on your layout
        zIndex: 2,           // Higher z-index to ensure it's on top
      }}
    >
      {children}
    </div>
  );
};



const Frame5 = ({ children }) => {
  return (
   
      <div className="w-full  bg-blue-100  p-8 rounded-lg shadow-md border border-blue-700">
       <div className="flex flex-col items-center justify-center min-h-screen    ">  {children}
      </div>
    </div>
  );
};

const Frame6 = ({ children }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-md border border-gray-300">
        {children}
      </div>
    </div>
  );
};
export { Frame, Frame2,Frame3, Frame4,Frame5,Frame6 }; 

 