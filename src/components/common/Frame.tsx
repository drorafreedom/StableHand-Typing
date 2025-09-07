// src/components/common/Frame.tsx
// TS version

import React, { ReactNode } from 'react';

// Common props interface for all Frame components
interface FrameProps {
  children: ReactNode;
  bgColor?: string;
  paddingY?: string;
  paddingX?: string;
  marginX?: string;
  border?: string;
  rounded?: string;
  shadow?: string;
  fullWidth?: string;
}

// Frame4 Component
const Frame4: React.FC<FrameProps> = ({ children }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-md border border-gray-300">
        {children}
      </div>
    </div>
  );
};

// Frame Component
const Frame: React.FC<FrameProps> = ({ children }) => {
  return (
    <div className="flex flex-col items-center justify-top min-h-screen p-0 bg-gray-100">
      <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-md border border-gray-300">
        {children}
      </div>
    </div>
  );
};

// Frame2 Component
const Frame2: React.FC<FrameProps> = ({ children }) => {
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

// Frame3 Component
  const Frame3: React.FC<FrameProps> = ({
  children,
  bgColor = 'bg-gray-100',
  paddingY = 'pt-8 pb-12',// 'py-8',  //,                          // <-- Tailwind sizes (default scale):
// 4 = 1rem ≈ 16px
// 8 = 2rem ≈ 32px
// 24 = 6rem ≈ 96px
// py-8 ⇒ top 32px and bottom 32px.
// pt-4 pb-24 ⇒ top 16px and bottom 96px.
//  pt-4 pb-24  extra empty space at the bottom so the footer wedge/flame can sit
  paddingX = 'px-8',
  marginX = 'mx-2',
  border = 'border border-red-700',  //'border-t border-gray-200 border-b-0', // <-- no bottom border
  rounded = 'rounded-lg',
  shadow = 'shadow-md',
  fullWidth = 'w-screen',  // 'w-full',                              // <-- avoid w-screen overflow
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-top min-h-screen ${fullWidth} ${bgColor} ${paddingY} ${paddingX} ${marginX} ${rounded} ${shadow} ${border}`}
      style={{
        position: 'relative', // or 'absolute', 'fixed' depending on your layout
        zIndex: 0, // Higher z-index to ensure it's on top
      }}
    >
      {children}
    </div>
  );
};
 

/* // src/components/common/Frame.tsx
const Frame3: React.FC<FrameProps> = ({
  children,
  bgColor = 'bg-gray-100',
  paddingY = 'pt-4 pb-28',                          // <-- space above footer
  paddingX = 'px-8',
  marginX = 'mx-2',
  border   = 'border-t border-gray-200 border-b-0', // <-- no bottom border
  rounded  = 'rounded-lg',
  shadow   = 'shadow-md',
  fullWidth = 'w-full',                              // <-- avoid w-screen overflow
}) => {
  return (
    <div
      className={`relative z-0 flex flex-col items-center justify-top min-h-screen ${fullWidth} ${bgColor} ${paddingY} ${paddingX} ${marginX} ${rounded} ${shadow} ${border}`}
    >
      {children}
    </div>
  );
}; */

// Frame5 Component
const Frame5: React.FC<FrameProps> = ({ children }) => {
  return (
    <div className="w-full bg-blue-100 p-8 rounded-lg shadow-md border border-blue-700">
      <div className="flex flex-col items-center justify-center min-h-screen">{children}</div>
    </div>
  );
};

// Frame6 Component
const Frame6: React.FC<FrameProps> = ({ children }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-md border border-gray-300">
        {children}
      </div>
    </div>
  );
};

export { Frame, Frame2, Frame3, Frame4, Frame5, Frame6 };



// // src/components/common/Frame.jsx
// // JS version
// import React from 'react';

// const Frame4 = ({ children }) => {
//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
//       <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-md border border-gray-300">
//         {children}
//       </div>
//     </div>
//   );
// };



//  const Frame = ({ children }) => {
//   return (
//     <div className="flex flex-col items-center justify-top min-h-screen p-0 bg-gray-100">
//       <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-md border border-gray-300">
//         {children}
//       </div>
//     </div>
//   );
// };

// const Frame2 = ({ children }) => {
//   return (
//     <div className="flex flex-col items-center justify-top min-h-screen p-1 bg-blue-100">
//       <div className="w-full max-w-lg bg-white p-3 rounded-lg shadow-md border border-gray-300">
//         {children}
//       </div>
//     </div>
//   );
// };
// /* const Frame3 = ({ children }) => {
//   return (
//     <div className="flex flex-col items-center justify-top min-h-screen  w-screen p-100 bg-oubj-100">
//       <div className="w-full w-lg bg-white-700 p-1 rounded-lg shadow-md  border  border-red-700">
//         {children}
//       </div>
//     </div>
//   );
// }; */
// /* const Frame3 = ({
//   children,
//   bgColor = 'bg-gray-100',   // Default background color
//   padding = 'p-8',           // Default padding
//   paddingX = 'pl-4',         // Default horizontal padding
//   marginX = 'mx-28',          // Default horizontal margin (no margin)
//   border = 'border border-red-700',  // Default border
//   rounded = 'rounded-lg',    // Default rounding
//   shadow = 'shadow-md'       // Default shadow
// }) => {
//   return (
//     <div className={`flex flex-col items-center justify-top min-h-screen w-screen ${bgColor} ${padding} ${paddingX} ${shadow} ${rounded} ${border} ${marginX}`}>
//       {children}
//     </div>
//   );
// }; */

//  // src/components/common/Frame.jsx
// /* const Frame3 = ({
//   children,
//   bgColor = 'bg-gray-100',   // Default background color
//   paddingY = 'py-8',         // Vertical padding (top and bottom)
//   paddingX = 'px-8',         // Horizontal padding (left and right)
//   marginX = 'mx-2',          // Horizontal margin (left and right)
//   border = 'border border-red-700',  // Default border
//   rounded = 'rounded-lg',    // Default rounding
//   shadow = 'shadow-md',      // Default shadow
//   fullWidth = 'w-screen'           // Option for full-width layout
// }) => {
//   return (
//     <div className={`flex flex-col items-center justify-top min-h-screen ${fullWidth} ${bgColor} ${paddingY} ${paddingX} ${marginX}  ${rounded} ${shadow} ${border}`z}>
     
//         {children}
//       </div>
     
//   );
// }; */

// const Frame3 = ({
//   children,
//   bgColor = 'bg-gray-100',   // Default background color
//   paddingY = 'py-4',         // Vertical padding (top and bottom)
//   paddingX = 'px-8',         // Horizontal padding (left and right)
//   marginX = 'mx-2',          // Horizontal margin (left and right)
//   border = 'border border-red-700',  // Default border
//   rounded = 'rounded-lg',    // Default rounding
//   shadow = 'shadow-md',      // Default shadow
//   fullWidth = 'w-screen'     // Option for full-width layout
// }) => {
//   return (
//     <div 
//       className={`flex flex-col items-center justify-top min-h-screen ${fullWidth} ${bgColor} ${paddingY} ${paddingX} ${marginX} ${rounded} ${shadow} ${border}`}
//       style={{
//         position: 'relative', // or 'absolute', 'fixed' depending on your layout
//         zIndex: 2,           // Higher z-index to ensure it's on top
//       }}
//     >
//       {children}
//     </div>
//   );
// };



// const Frame5 = ({ children }) => {
//   return (
   
//       <div className="w-full  bg-blue-100  p-8 rounded-lg shadow-md border border-blue-700">
//        <div className="flex flex-col items-center justify-center min-h-screen    ">  {children}
//       </div>
//     </div>
//   );
// };

// const Frame6 = ({ children }) => {
//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
//       <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-md border border-gray-300">
//         {children}
//       </div>
//     </div>
//   );
// };
// export { Frame, Frame2,Frame3, Frame4,Frame5,Frame6 }; 

 