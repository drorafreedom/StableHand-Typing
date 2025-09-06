// src/components/pages/Welcome.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import welcomeImage from '../../assets/images/signed_stablehand_logo.png';
import { Frame3 } from '../common/Frame';

// === TWEAK HERE ===
const LOGO_SIZES =
  " w-90 h-90 lg:w-90 lg:h-90 md:w-90 md:h-90 lg:w-85 lg:h-85"; 
// ↑ Bigger circle? bump the numbers (e.g., w-60 h-60 … lg:w-80 lg:h-80)   
/*  those are just Tailwind size classes. Q 

w-44 h-44 = 11rem × 11rem (~176×176px)
sm:, md:, lg: apply at breakpoints (small/tablet/desktop)
twice as large:
11rem → 22rem, 13rem → 26rem, 15rem → 30rem, 18rem → 36rem */
/*  preset size? Use a class that exists (w-72, w-80, w-96, …).
 exact size? Use brackets: w-[24rem], h-[600px], w-[70vmin].
The last class wins if you stack conflicting ones.
If you want the logo to always fit without scrolling, consider viewport units:
Example: w-[min(80vmin,44rem)] h-[min(80vmin,44rem)] (keeps the circle within the viewport). */

const VERTICAL: "top" | "center" = "top";
// ↑ "top" keeps it high with padding; "center" vertically centers the whole page
// ===================

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(t);
  }, []);

  const verticalClasses =
    VERTICAL === "top"
      ? "justify-start pt-8 sm:pt-12 md:pt-16" // push content down a bit from top
      : "justify-center";                      // true vertical center

  return (
    <Frame3 bgColor="bg-gray-100">
      <div className={`flex flex-col items-center min-h-screen px-4 bg-gray-100 ${verticalClasses}`}>
        {/* Logo */}
        <div
          className={`relative mb-6 transition-opacity duration-700 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* <div
            className={`mx-auto rounded-full overflow-hidden bg-white shadow-xl ring-1 ring-black/5 ${LOGO_SIZES}`}
          > */}
          <div className="mx-auto rounded-full overflow-hidden bg-white shadow-xl w-[44rem] h-[44rem]">
            <img
              src={welcomeImage}
              alt="Stablehand logo"
              className="w-full h-full object-contain"
              loading="eager"
              draggable={false}
            />
          </div>
        </div>

        {/* Text */}
        <div className="text-center mb-6">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-2">
            Welcome to Stablehand
          </h1>
          <p className="text-red-500">
            A Unique Virtual Tool to Stabilize Tremor
          </p>
        </div>

        {/* Actions */}
        <div className="w-full p-4 bg-white rounded-lg shadow-lg max-w-md">
          <div className="mt-2 flex gap-4">
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/register')}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg"
            >
              Register
            </button>
          </div>
        </div>
      </div>
    </Frame3>
  );
};

export default Welcome;



// // src/components/pages/Welcome.tsx

// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import welcomeImage from '../../assets/images/signed_stablehand_logo.png';
// import { Frame3 } from '../common/Frame';

// const Welcome: React.FC = () => {
//   const navigate = useNavigate();
//   const [isVisible, setIsVisible] = useState<boolean>(false);

//   // Fade-in effect
//   useEffect(() => {
//     const timer = setTimeout(() => setIsVisible(true), 300); // Adjust for delay
//     return () => clearTimeout(timer);
//   }, []);

//   return (
//     <Frame3 bgColor="bg-gray-100">
//       <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
//         {/* Image and Arc Text Container */}
//         <div
//           className={`relative mb-3 transition-opacity duration-1000 ${
//             isVisible ? 'opacity-100' : 'opacity-0'
//           }`}
//         >
//           {/* Larger Circular Image */}
//           <img
//             src={welcomeImage}
//             alt="Welcome to StableGait, a unique therapy to relieve tremor"
//             className="w-100 h-100 object-cover rounded-full shadow-x3"
//           />
//         </div>

//         {/* Welcome Text */}
//         <div className="text-center mb-6">
//           <h1 className="text-5xl font-bold text-gray-800 mb-2">
//             Welcome to Stablehand
//           </h1>
//           <p  className="text-red-500 text-center">
//             A Unique Virtual Tool to Stabilize Tremor
//           </p>
//         </div>

//         {/* Login Form */}
//         <div className="w-full p-2 bg-white rounded-lg shadow-lg max-w-md">
//           {/* Redirect Buttons */}
//           <div className="mt-8 flex space-x-4">
//             <button
//               onClick={() => navigate('/login')}
//               className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
//             >
//               Login
//             </button>
//             <button
//               onClick={() => navigate('/register')}
//               className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg"
//             >
//               Register
//             </button>
//           </div>
//         </div>
//       </div>
//     </Frame3>
//   );
// };

// export default Welcome;

 // JS version
//+++++++++++JS version+++++++++++++++++
// // src/components/pages/Welcome.jsx


//    import React, { useEffect, useState } from 'react';
//  import { useNavigate } from 'react-router-dom';
//  import welcomeImage from '../../assets/images/signed_stablehand_logo.png';
//  import { Frame3 } from '../common/Frame';
//  import LoginForm from '../organisms/LoginForm';
 
//  const Welcome = () => {
//    const navigate = useNavigate();
//    const [isVisible, setIsVisible] = useState(false);
 
//    // Fade-in effect
//    useEffect(() => {
//      const timer = setTimeout(() => setIsVisible(true), 300); // Adjust for delay
//      return () => clearTimeout(timer);
//    }, []);
 
//    return (
//      <Frame3 bgColor="bg-gray-100">
//        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
         
//          {/* Image and Arc Text Container */}
//          <div
//            className={`relative mb-3 transition-opacity duration-1000 ${
//              isVisible ? 'opacity-100' : 'opacity-0'
//            }`}
//          >
//            {/* Larger Circular Image */}
//            <img
//              src={welcomeImage}
//              alt="Welcome to StableGait, a unique therapy to relieve tremor"
//              className="w-100 h-100 object-cover rounded-full  shadow-x3"
//            />
 
//            {/* SVG Arc Text Positioned on Top */}
//         {/*    <svg
//              className="absolute inset-0 w-96 h-96"
//              viewBox="0 0 300 300"
//              xmlns="http://www.w3.org/2000/svg"
//            >
//              <defs>
//                <path
//                  id="arcPath"
//                  d="M 150, 150 m -120, 0 a 120,120 0 1,1 240,0"
//                />
//              </defs>
//              <text fontSize="26" fill="#4a4a4a" fontWeight="bold">
//                <textPath
//                  href="#arcPath"
//                  startOffset="50%"
//                  textAnchor="middle"
//                >
//                  Welcome to StableGait
//                </textPath>
//              </text>
//            </svg> */}
//          </div>
 
//          {/* Welcome Text */}
//          <div className="text-center mb-6">
//            <h1 className="text-5xl font-bold text-gray-800 mb-2">
//              Welcome to Stablehand
//            </h1>
//            <p className="text-xl text-gray-600">
//              A Unique Virtual Tool to Stabilize Tremor
//            </p>
//          </div>
 
//          {/* Login Form */}
//          <div className="w-full p-2 bg-white rounded-lg shadow-lg max-w-md">
//            {/* <LoginForm /> */}
 
//              {/* Redirect Buttons */}
//          <div className="mt-8 flex space-x-4">
//            <button
//              onClick={() => navigate('/login')}
//              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
//            >
//              Login
//            </button>
//            <button
//              onClick={() => navigate('/register')}
//              className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg"
//            >
//              Register
//            </button>
//          </div>
//          </div>
//        </div>
//      </Frame3>
//    );
//  };
 
//  export default Welcome;  

//-------------------------------------
 
// import React from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// // import LoginForm from '../organisms/LoginForm';
// import LoginPage from '../pages/LoginPage';
// import welcomeImage from '../../assets/images/signed_stablehand_logo.png';
 
// import {Frame, Frame2, Frame3} from '../common/Frame';
// import LoginForm from '../organisms/LoginForm';
// const Welcome = () => {
//   const navigate = useNavigate();

//   const handleLogin = (email, password, callback) => {
//     // Add your login logic here, for now we simulate a login attempt
//     if (email === 'test@example.com' && password === 'password123') {
//       callback(true);
//       console.log('Login successful');
//     } else {
//       callback(false);
//       console.log('Login failed');
//     }
//   };

//   return (
 
//     <Frame3 bgColor="bg-gray-100" >
//     <div className="flex flex-col items-center justify-center min-h-screen p-2 bg-gray-100">
//         {/* Welcome Image */}
//       <div className="w-full max-w-md mb-8 opacity-90">
//         <img
//           src={welcomeImage}
//           alt="Welcome to stablehand, a unique therapy to relieve tremor"
//           className="w-full h-auto rounded-lg"
//         />
//       </div>

//        {/* Welcome Text */}
//        <div className="text-center mb-6">
//         <h1 className="text-4xl font-bold text-gray-800 mb-2">
//           Welcome to Stablehand
//         </h1>
//         <p className="text-xl text-gray-600">
//           A Unique Virtual Tool to Stabilize Tremor
//         </p>
//       </div>

//       {/* Login Form */}
//       <div className="w-full   p-2 bg-white rounded-lg shadow-lg">
//         <LoginForm />
//       </div> 
    
//     </div>
//     </Frame3> 
    
//   );
// };

// export default Welcome;


 // src/components/pages/Welcome.jsx
 

// // src/components/pages/Welcome.jsx
// import React, { useEffect, useState, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import welcomeImage from '../../assets/images/signed_stablehand_logo.png';
// import { Frame3 } from '../common/Frame';
// import LoginForm from '../organisms/LoginForm';

// const Welcome = () => {
//   const navigate = useNavigate();
//   const [isVisible, setIsVisible] = useState(false);
//   const [imageRadius, setImageRadius] = useState(350); // Initial image radius
//   const imageRef = useRef(); // Track image position

//   const arcPadding = 30; // Padding to position the arc outside the image
//   const arcRadius = imageRadius + arcPadding; // Radius of the arc

//   useEffect(() => {
//     const timer = setTimeout(() => setIsVisible(true), 500);
//     return () => clearTimeout(timer);
//   }, []);

//   // Correct arc path starting at 12 o'clock
//   const arcPath = `
//     M ${arcRadius}, ${arcPadding} 
//     a ${arcRadius},${arcRadius} 0 1,1 0,${arcRadius * 2} 
//     a ${arcRadius},${arcRadius} 0 1,1 0,-${arcRadius * 2}
//   `;

//   return (
//     <Frame3 bgColor="bg-gray-100">
//       <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">

//         {/* Slider to Adjust Image Radius */}
//         <div className="mb-4">
//           <label htmlFor="radius" className="block mb-2 text-lg font-medium text-gray-700">
//             Adjust Image Radius: {imageRadius}px
//           </label>
//           <input
//             id="radius"
//             type="range"
//             min="50"
//             max="500"
//             value={imageRadius}
//             onChange={(e) => setImageRadius(parseInt(e.target.value, 10))}
//             className="w-full"
//           />
//         </div>

//         {/* Circular Image with SVG Overlay */}
//         <div
//             className={`relative mb-3 transition-opacity duration-10000 ${
//                           isVisible ? 'opacity-100' : 'opacity-0'
//                     }`}
//           style={{
//             width: `${imageRadius * 3}px`,
//             height: `${imageRadius * 3}px`,
//             marginBottom: `${arcPadding * 2}px`, // Prevent overlap with other elements
//           }}
//         >
//           {/* Circular Image */}
//           <img
//             ref={imageRef}
//             src={welcomeImage}
//             alt="Welcome to StableGait"
//             className="object-cover w-full h-full rounded-full shadow-xl"
//           />

//           {/* SVG Arc Text Positioned Above the Image */}
//           <svg
//             className="absolute"
//             width={`${arcRadius * 2.2}px`}
//             height={`${arcRadius * 2.2}px`}
//             viewBox={`0 0 ${arcRadius * 3} ${arcRadius * 3}`}
//             xmlns="http://www.w3.org/2000/svg"
//             style={{ top: `+${arcPadding}px`, left: `0` }} // Shift arc upwards
//           >
//             <defs>
//               <path id="arcPath" d={arcPath} />
//             </defs>
//             <text fontSize="24" fill="#4a4a4a" fontWeight="bold">
//               <textPath href="#arcPath" startOffset="50%" textAnchor="middle" dominantBaseline="hanging">
//                 Welcome to StableGait
//               </textPath>
//             </text>
//           </svg>
//         </div>

//         {/* Welcome Text */}
//         <div className="text-center mb-6">
//           <h1 className="text-5xl font-bold text-gray-800 mb-2">
//             Welcome to Stablehand
//           </h1>
//           <p className="text-xl text-gray-600">
//             A Unique Virtual Tool to Stabilize Tremor
//           </p>
//         </div>

//         {/* Login Form */}
//         <div className="w-full p-2 bg-white rounded-lg shadow-lg max-w-md">
//           <LoginForm />
//         </div>
//       </div>
//     </Frame3>
//   );
// };

// export default Welcome;


