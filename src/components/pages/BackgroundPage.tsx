 
 // src/components/pages/BackgroundPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Frame3 } from '../common/Frame';

const BackgroundPage: React.FC = () => {
  return (
    <Frame3>
      <div className="flex flex-col items-center justify-top min-h-screen p-4 bg-gray-100">
        <div className="w-full max-w-lg bg-green-100 p-8 rounded-lg shadow-md border border-gray-300">
          <h1 className="text-4xl font-bold mb-4">BackgroundPage</h1>
          <p className="text-lg mb-6">Coming Soon</p>
          <Link to="/login" className="text-blue-500 hover:text-blue-700">
            Go to Login
          </Link>
        </div>
      </div>
    </Frame3>
  );
};

export default BackgroundPage;

 
 
 //+++++++++++JS version+++++++++++++++++
 //  \src\components\pages\BackgroundPage.jsx
  // JS version
import React from 'react';
import { Link } from 'react-router-dom';
import { Frame2, Frame, Frame3 } from '../common/Frame';

const BackgroundPage = () => {
  return ( 
      <Frame3 >
    <div className="flex flex-col items-center justify-top min-h-screen p-4 bg-gray-100">
      <div className="w-full max-w-lg bg-green-100 p-8 rounded-lg shadow-md border border-gray-300">
        <h1 className="text-4xl font-bold mb-4">BackgroundPage</h1>
        <p className="text-lg mb-6">Coming Soon</p>
        <Link to="/login" className="text-blue-500 hover:text-blue-700">Go to Login</Link>
      </div>
    </div>
   </Frame3>  
    );
};

export default BackgroundPage;
// src/components/pages/BackgroundPage.jsx
/*import React from 'react';
import { Link } from 'react-router-dom';
import { Frame2, Frame,Frame3 } from '../common/Frame';
const BackgroundPage = () => {
  return (   <div className= "bg-green-700 w-full ">
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
    <div className="bg green -700 w-full max-w-lg bg-white p-8 rounded-lg shadow-md border border-gray-300">
        <h1 className="text-4xl font-bold mb-4">BackgroundPage</h1>
        <p className="text-lg mb-6">Coming Soon</p>
        <Link to="/login" className="text-blue-500 hover:text-blue-700">Go to Login</Link>
      </div>  
    </div>
 </div>  );
};
 
export default  BackgroundPage; 
 */

