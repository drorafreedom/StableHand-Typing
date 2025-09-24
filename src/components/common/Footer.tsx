
// src/components/common/Footer.tsx
// TS version

import React from 'react';
import caltechLogo from '../../assets/logos/caltech_logo.png';
import caltechLogo2 from '../../assets/logos/flameLogo.png';
import '../../App.css'; // Ensure custom CSS is loaded

const Footer: React.FC = () => (
  <footer className="w-screen bg-gradient-to-r from-blue-50 via-gray-500 to-blue-50 flex justify-between items-end relative">
    {/* Left Wedge with Flame */}
    <div className="footer-wedge relative flex items-end h-full">
      <div className="flame-logo mb-1 z-12">
        <img src={caltechLogo2} alt="Flame Logo" className="w-12 h-auto" />
      </div>
    </div>

    {/* Right Section with Logo and Text */}
    <div className="flex flex-col items-end text-right ml-auto mr-4">
      <img src={caltechLogo} alt="Caltech Logo" className="w-18 h-8 mb-2" />
      <p className="text-xs text-white">
        © 2024 StableHand, StableGait, StableGrip All Rights Reserved
      </p>
    </div>
  </footer>
);

export default Footer;


// //src\components\common\Footer.tsx
// //JS version
// import React from 'react';
// import caltechLogo from '../../assets/logos/caltech_logo.png';
// import caltechLogo2 from '../../assets/logos/flameLogo.png';
// import '../../App.css'; // Ensure custom CSS is loaded

// const Footer = () => (
//   <footer className="w-screen bg-gray-500 p-4 rounded-sm shadow-md flex justify-between items-end relative">
//     {/* Left Wedge with Flame */}
//     <div className="footer-wedge relative flex items-end h-full">
//       <div className="flame-logo mb-1 z-10">
//         <img src={caltechLogo2} alt="Flame Logo" className="w-10 h-auto" />
//       </div>
//     </div>

//     {/* Right Section with Logo and Text */}
//     <div className="flex flex-col items-end text-right ml-auto mr-4">
//       <img src={caltechLogo} alt="Caltech Logo" className="w-18 h-8 mb-2" />
//       <p className="text-xs text-white">
//         © 2024 StableHand, StableGait, StableGrip All Rights Reserved
//       </p>
//     </div>
//   </footer>
// );

// export default Footer;


 
