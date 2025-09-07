// src/components/common/Header.tsx
// TS version

import React from 'react';
import parkinsonLogo from '../../assets/logos/parkinson-tremors.gif';
import BrainLogo from '../../assets/logos/stock-vector.jpg';
import '../../index.css';   // tailwind (base, components, utilities)
import '../../App.css';     // ← your custom overrides should come last

// Define props interface
interface HeaderProps {
  toggleSidebar: () => void; // Callback function for toggling the sidebar
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  return (
    <header className="w-screen bg-gray-500 p-2 px-6 shadow-md flex items-center justify-between relative z-10">
      {/* Sidebar Toggle Button */}
  {/*     <button
        onClick={toggleSidebar}
        className="text-gray-200 hover:text-gray-400 focus:outline-none"
      >
        <img src={parkinsonLogo} alt="Caltech Logo" className="w-22 h-8 ml-4" />
      </button>
 */}
 <button
  onClick={toggleSidebar}
  aria-label="Open menu"
  className=" p-0 m-0 bg-transparent border-0 outline-none"
  
>
  <img
    src={parkinsonLogo}
    alt="Open sidebar"
    className="block w-10 h-10 ml-2 object-contain bg-transparent rounded-none shadow-none ring-0 mix-blend-multiply"
  />
</button>

      {/* Center Title Section */}
      <div className="flex-1 flex justify-center items-center space-x-8 relative">
        <span className="text-5xl font-bold text-white">Stable</span>
        <div className="relative flex justify-center items-center">
         <div className="mx-auto rounded-full overflow-hidden bg-white shadow-xl w-[4rem] h-[4rem]">
            <img 
              src={BrainLogo} 
              alt="StableHand Logo" 
              className="logo" 
            />
          </div>
        </div>
        <span className="text-5xl font-bold text-white">Hand</span>
      </div>

      {/* Placeholder for Flex Layout */}
      <div className="w-6"></div>
    </header>
  );
};

export default Header;



// // src\components\common\Header.tsx
// // JS version
// import React from 'react';
// import parkinsonLogo from '../../assets/logos/parkinson-tremors.webp';
// import BrainLogo from '../../assets/logos/stock-vector.jpg';

// const Header = ({ toggleSidebar }) => {
//   return (
//     <header className=" w-screen bg-gray-500 p-2 px-6 shadow-md flex items-center justify-between relative z-10">
//       <button onClick={toggleSidebar} className="text-gray-200 hover:text-gray-400 focus:outline-none">
//         <img src={parkinsonLogo} alt="Caltech Logo" className="w-22 h-8 ml-4" />
//       </button>
//       <div className="flex-1 flex justify-center items-center space-x-2 relative">
//         <span className="text-5xl font-bold text-white">Stable</span>
//         <div className="relative flex justify-center items-center">
//           <div className="logo-wrapper">
//             <img 
//               src={BrainLogo} 
//               alt="StableHand Logo" 
//               className="logo" 
//             />
//           </div>
//         </div>
//         <span className="text-5xl font-bold text-white">Hand</span>
//       </div>
//       <div className="w-6"></div> {/* Placeholder to balance the flex layout */}
//     </header>
//   );
// };


// export default Header;

 

/* const Header = ({ toggleSidebar }) => {
  return (
    <header className="bg-gray-500 p-4 shadow-md flex items-center justify-between relative z-40">
      <button onClick={toggleSidebar} className="text-gray-200 hover:text-gray-400 focus:outline-none">
        <img src={parkinsonLogo} alt="Caltech Logo" className="w-18 h-8 ml-4" />
      </button>
      <div className="flex-1 flex justify-center items-center space-x-2">
        <span className="text-2xl font-bold text-white">Stable</span>
        <img src={BrainLogo} alt="StableHand Logo" className="w-38 h-16" />
        <span className="text-2xl font-bold text-white">Hand</span>
      </div>
      <div className="w-6"></div> {/* Placeholder to balance the flex layout */ 
   
 

 
/*   return (
    <header className="bg-gray-400 p-1 shadow-md flex items-center justify-between">
      <button onClick={toggleSidebar} className="text-gray-800 hover:text-gray-600 focus:outline-none">
      <img src={parkinsonLogo} alt="Caltech Logo" className="w-18 h-8 ml-4" /> 
      </button>
      <div className="flex-1 flex justify-center items-center space-x-2">
        <span className="text-2xl font-bold">Stable</span>
        <img src={BrainLogo} alt="StableHand Logo" className="w-38 h-16" />
        <span className="text-2xl font-bold">Hand</span>
        /*  <img src={caltechLogo} alt="Caltech Logo" className="w-18 h-8 ml-4" /> */ 
     // </div>
    //  <div className="w-6"></div> {/* Placeholder to balance the flex layout */}
   // </header> */
  
 
 