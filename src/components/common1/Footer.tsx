import React from 'react';
import caltechLogo from '../../assets/logos/caltech_logo.png';
import caltechLogo2 from '../../assets/logos/flameLogo.png';
import '../../App.css'; // Ensure custom CSS is loaded

const Footer = () => (
  <footer className="w-screen bg-gray-500 p-4 rounded-sm shadow-md flex justify-between items-end relative">
    {/* Left Wedge with Flame */}
    <div className="footer-wedge relative flex items-end h-full">
      <div className="flame-logo mb-1 z-10">
        <img src={caltechLogo2} alt="Flame Logo" className="w-10 h-auto" />
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


/* import React from 'react';
import caltechLogo from '../../assets/logos/caltech_logo.png';
import caltechLogo2 from '../../assets/logos/flameLogo.png';
import '../../App.css'; // Ensure you import your custom CSS

const Footer = () => (
  <footer className="w-screen bg-gray-500 p-2 px-6  rounded-smshadow-md flex items-center justify-between relative ">
    <div className="footer-wedge ">
      <div className="flame-logo  ">
        <img src={caltechLogo2} alt="Flame Logo"  />  
      </div>
    </div>
    <div className="container mx-auto text-center flex flex-col items-center relative z-1">
      <p className="mb-4 text -xs">© 2024 StableHand, StableGait, StableGrip All Rights Reserved</p>
      <div className="flex justify-center space-x-4 z-1">
        <img src={caltechLogo} alt="Caltech Logo" className="w-18 h-8 relative z-10" />
      </div>
    </div>
  </footer>
);

export default Footer;
//----------------------------------------


 */

/* import React from 'react';
import caltechLogo from '../../assets/logos/caltech_logo.png';
import caltechLogo2 from '../../assets/logos/caltechlogo2.png';
import caltechLogo3 from '../../assets/logos/flameLogo.png';

 
const Footer = () => (
 //Lower z-index 
    <div className="container mx-auto text-center flex flex-col items-center">
      <p className="mb-4">© 2024 StableHand, StableGait, StableGrip All Rights Reserved</p>
      <div className="flex justify-center space-x-4">
        <img src={caltechLogo} alt="Caltech Logo" className="w-18 h-8" />
      </div>
    </div>
  </footer>
);

export default Footer; */
