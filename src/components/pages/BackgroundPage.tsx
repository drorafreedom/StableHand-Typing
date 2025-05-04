 
 // src/components/pages/BackgroundPage.tsx
/* import React from 'react';
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

export default BackgroundPage; */


import React from 'react';
import { Frame3 } from '../common/Frame';

// BackgroundPage: Provides context for the clinical trial, its goals, and how the typing tasks work.
// You can replace text and URLs below with your own copy and video links.

const BackgroundPage: React.FC = () => {
  return (
    <Frame3 bgColor="bg-green-500">
    {/* inner panel */}
    <div className="max-w-3xl mx-auto bg-green-100 p-6 rounded-lg shadow-md border border-gray-300">
      <h1 className="text-4xl font-bold text-center mb-6">Study Background</h1>
        <p>
          Parkinson’s disease is a progressive nervous system disorder that affects movement, muscle control,
          and balance. Early detection and continuous monitoring of motor symptoms are critical for personalized
          treatment planning.
        </p>
        <p>
          StableHand Typing uses a series of controlled typing exercises to capture subtle changes in fine motor control.
          By analyzing keystroke dynamics—timing, speed, and accuracy—we can track symptom progression over time.
        </p>
        <p>
          In this study, participants will complete typing tasks under various backgrounds and conditions. Your performance
          data helps researchers develop digital biomarkers for Parkinson’s and similar motor disorders.
        </p>

        {/* Optional Local Video */}
        <div>
          <h2 className="text-2xl font-semibold">Watch a Quick Overview</h2>
          <video controls className="w-full rounded-lg shadow-md">
            <source src="/videos/study-overview.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Optional YouTube Embed */}
        <div>
          <h2 className="text-2xl font-semibold">What to Expect</h2>
          <div className="aspect-video">
            <iframe
              className="w-full h-full rounded-lg shadow-md"
              src="https://www.youtube.com/embed/VIDEO_ID"
              title="StableHand Typing Overview"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>

        <p>
          If you have any questions about the study protocol, data privacy, or technical requirements,
          please consult the FAQ or contact the study coordinator via the Help link below.
        </p>
      </div>
    </Frame3>
  );
};

export default BackgroundPage;

 
 
 //+++++++++++JS version+++++++++++++++++
 //  \src\components\pages\BackgroundPage.jsx
  // JS version
/* import React from 'react';
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

export default BackgroundPage; */

//000000000000000000000000
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

