// src/components/pages/TherapyPage.tsx

import React, { useState,useEffect } from 'react';
import MultifunctionAnimation from '../Therapy/MultifunctionAnimation';
import ShapeAnimations from '../Therapy/ShapeAnimations';
import ColorAnimation from '../Therapy/ColorAnimation';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../data/AuthContext';
import { doc, setDoc, collection } from 'firebase/firestore';
import DateTimeDisplay from '../common/DateTimeDisplay';
import TextDisplay from '../Therapy/TextDisplay';
import TextInput from '../Therapy/TextInput';

interface Message {
  message: string;
  type: 'success' | 'error';
}

interface Settings {
  [key: string]: any; // Replace `any` with the specific type for your settings if known
}

const TherapyPage: React.FC = () => {
  const [currentAnimation, setCurrentAnimation] = useState<'multifunction' | 'shape' | 'color'>('multifunction');
  const { currentUser } = useAuth();
  const [message, setMessage] = useState<Message | null>(null);
  const [settings, setSettings] = useState<Settings>({});
  const [displayText, setDisplayText] = useState<string>('');
 

  // Auto-clear the message after 3 seconds
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(null), 3000)
    return () => clearTimeout(timer)
  }, [message])

  const saveKeystrokeData = async (keyData: any) => {
    try {
      const timestamp = new Date().toISOString();
      const userDocRef = doc(collection(db, `users/${currentUser.uid}/keystroke-data`));
      await setDoc(userDocRef, { keyData, timestamp });
      setMessage({ message: 'Keystroke data saved successfully!', type: 'success' });
    } catch (error) {
      console.error('Error saving keystroke data:', error);
      setMessage({ message: 'Error saving keystroke data. Please try again.', type: 'error' });
    }
  };

  return (
    
    <div className="relative w-full">
      <div className="flex justify-center text-sm text-gray-600 rounded p-2 mb-4 w-full">
        <DateTimeDisplay />
        <button
          onClick={() => setCurrentAnimation('multifunction')}
          className={`p-2 mx-2 ${currentAnimation === 'multifunction' ? 'bg-blue-500 text-white rounded' : 'bg-gray-200'}`}
        >
          Multifunction Animation
        </button>
        <button
          onClick={() => setCurrentAnimation('shape')}
          className={`p-2 mx-2 ${currentAnimation === 'shape' ? 'bg-blue-500 text-white rounded' : 'bg-gray-200'}`}
        >
          Shape Animation
        </button>
        <button
          onClick={() => setCurrentAnimation('color')}
          className={`p-2 mx-2 ${currentAnimation === 'color' ? 'bg-blue-500 text-m-white rounded' : 'bg-gray-200'}`}
        >
          Color Animation
        </button>
      </div>

   {/*    {message && (
        <div className={`alert ${message.type === 'error' ? 'bg-red-500' : 'bg-green-500'} text-white p-2 rounded mb-4`}>
          {message.message}
        </div>
      )} */}

      {currentAnimation === 'multifunction' && (
        <MultifunctionAnimation settings={settings} setSettings={setSettings} />
      )}
      {currentAnimation === 'shape' && (
        <ShapeAnimations settings={settings} setSettings={setSettings} />
      )}
      {currentAnimation === 'color' && (
        <ColorAnimation settings={settings} setSettings={setSettings} />
      )}
{/* down where you render your TextInput/TextDisplay */}
<div className="relative w-full mt-4 ">
  {message && (
    <div className="mb-2 w-1/2 text-left">
      <div className={`
          inline-block text-white px-4 py-2 rounded shadow
          ${message.type === 'error' ? 'bg-red-500' : 'bg-green-500'}
        `}>
        {message.message}
      </div>
    </div>
  )}  
  
<TextInput
      placeholder="Type here…"
      displayText={displayText}
      setDisplayText={setDisplayText}       // ← pass it here
      saveKeystrokeData={saveKeystrokeData}
    />



      <div className="absolute center-1920 right-22 w-1/3 z-7 p-4">
        <TextDisplay displayText={displayText} setDisplayText={setDisplayText} />
      </div>
    </div>
    </div>
  );
};

export default TherapyPage;


//+++++++++++JS version+++++++++++++++++

// // src\components\pages\TherapyPage.jsx
//  // JS version
// import React, { useState } from 'react';
// import MultifunctionAnimation from '../Therapy/MultifunctionAnimation';
// import ShapeAnimations from '../Therapy/ShapeAnimations';
// import ColorAnimation from '../Therapy/ColorAnimation';
// import { db } from '../../firebase/firebase';
// import { useAuth } from '../../data/AuthContext';
// import { doc, setDoc, collection } from 'firebase/firestore';
// import DateTimeDisplay from '../common/DateTimeDisplay';
// import TextDisplay from '../Therapy/TextDisplay';
// import TextInput from '../Therapy/TextInput';

// const TherapyPage = () => {
//   const [currentAnimation, setCurrentAnimation] = useState('multifunction');
//   const { currentUser } = useAuth();
//   const [message, setMessage] = useState({ message: '', type: '' });
//   const [settings, setSettings] = useState({}); // Assuming settings structure is compatible across all animations
//   const [displayText, setDisplayText] = useState('');

//   const saveKeystrokeData = async (keyData) => {
//     try {
//       const timestamp = new Date().toISOString();
//       const userDocRef = doc(collection(db, `users/${currentUser.uid}/keystroke-data`));
//       await setDoc(userDocRef, { keyData, timestamp });
//       setMessage({ message: 'Keystroke data saved successfully!', type: 'success' });
//     } catch (error) {
//       console.error('Error saving keystroke data:', error);
//       setMessage({ message: 'Error saving keystroke data. Please try again.', type: 'error' });
//     }
//   };

//   return (
//     <div className="relative w-full">
//       <div className="flex justify-center text-sm text-gray-600 rounded p-2 mb-4 w-full">
//         <DateTimeDisplay />
//         <button
//           onClick={() => setCurrentAnimation('multifunction')}
//           className={`p-2 mx-2 ${currentAnimation === 'multifunction' ? 'bg-blue-500 text-white rounded' : 'bg-gray-200'}`}
//         >
//           Multifunction Animation
//         </button>
//         <button
//           onClick={() => setCurrentAnimation('shape')}
//           className={`p-2 mx-2 ${currentAnimation === 'shape' ? 'bg-blue-500 text-white rounded' : 'bg-gray-200'}`}
//         >
//           Shape Animation
//         </button>
//         <button
//           onClick={() => setCurrentAnimation('color')}
//           className={`p-2 mx-2 ${currentAnimation === 'color' ? 'bg-blue-500 text-white rounded' : 'bg-gray-200'}`}
//         >
//           Color Animation
//         </button>
//       </div>

//       {message.message && (
//         <div className={`alert ${message.type === 'error' ? 'bg-red-500' : 'bg-green-500'} text-white p-2 rounded mb-4`}>
//           {message.message}
//         </div>
//       )}

//       {currentAnimation === 'multifunction' && <MultifunctionAnimation settings={settings} setSettings={setSettings} />}
//       {currentAnimation === 'shape' && <ShapeAnimations settings={settings} setSettings={setSettings} />}
//       {currentAnimation === 'color' && <ColorAnimation settings={settings} setSettings={setSettings} />}
      
//       <div className="relative w-full z-25 p-4">
//   <TextInput placeholder="Type here..." displayText={displayText} saveKeystrokeData={saveKeystrokeData} />
// </div>
// {/* <div className="relative center-0 right-0 w-1/3   p-4">
//   <TextDisplay displayText={displayText} setDisplayText={setDisplayText} />
// </div> */}
// <div className="absolute center-820 right-0 w-1/3 z-225 p-4">
//   <TextDisplay displayText={displayText} setDisplayText={setDisplayText} />
// </div>
       
      
//     </div>
//   );
// };

// export default TherapyPage;





//--------------------------------------------
// // src/pages/TherapyPage.jsx
// import React, { useState } from 'react';
// import MultifunctionAnimation from '../Therapy/MultifunctionAnimation';
// import ShapeAnimations from '../Therapy/ShapeAnimations';
// import ColorAnimation from '../Therapy/ColorAnimation';
// import { db, storage } from '../../firebase/firebase';
// import { useAuth } from '../../data/AuthContext';
// import { doc, setDoc, getDocs, collection } from 'firebase/firestore';
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// import Papa from 'papaparse';
// import DateTimeDisplay from '../common/DateTimeDisplay';
// import AnimationTextDisplay from '../Therapy/AnimationTextDisplay';
// const TherapyPage = () => {
//   const [currentAnimation, setCurrentAnimation] = useState('multifunction');
//   const { currentUser } = useAuth();
//   const [message, setMessage] = useState({ message: '', type: '' });
//   const [settings, setSettings] = useState({}); // Assuming settings structure is compatible across all animations

//   /* const saveSettings = async () => {
//     try {
//       const timestamp = new Date().toISOString();
//       const userDocRef = doc(collection(db, `users/${currentUser.uid}/animation-settings`));
//       await setDoc(userDocRef, { ...settings, timestamp });
//       setMessage({ message: 'Settings saved successfully!', type: 'success' });
//     } catch (error) {
//       console.error('Error saving settings:', error);
//       setMessage({ message: 'Error saving settings. Please try again.', type: 'error' });
//     }
//   };

//   const loadSettings = async () => {
//     try {
//       const querySnapshot = await getDocs(collection(db, `users/${currentUser.uid}/animation-settings`));
//       const settingsList = [];
//       querySnapshot.forEach((doc) => {
//         settingsList.push(doc.data());
//       });
//       // For simplicity, we load the most recent settings
//       if (settingsList.length > 0) {
//         setSettings(settingsList[settingsList.length - 1]);
//         setMessage({ message: 'Settings loaded successfully!', type: 'success' });
//       } else {
//         setMessage({ message: 'No settings found.', type: 'error' });
//       }
//     } catch (error) {
//       console.error('Error loading settings:', error);
//       setMessage({ message: 'Error loading settings. Please try again.', type: 'error' });
//     }
//   };
//  */
//   return (
//     <div>
//         <div className="flex justify-center text-sm text-gray-600 rounded p-2  mb-4">
//         <DateTimeDisplay />
//         <button
//           onClick={() => setCurrentAnimation('multifunction')}
//           className={`p-2 mx-2 ${currentAnimation === 'multifunction' ? 'bg-blue-500 text-white p-2 mx-2 rounded' : 'bg-gray-200'}`}
//         >
//           Multifunction Animation
//         </button>
//         <button
//           onClick={() => setCurrentAnimation('shape')}
//           className={`p-2 mx-2 ${currentAnimation === 'shape' ?  'bg-blue-500 text-white p-2 mx-2 rounded': 'bg-gray-200'}`}
//         >
//           Shape Animation
//         </button>
//         <button
//           onClick={() => setCurrentAnimation('color')}
//           className={`p-2 mx-2 ${currentAnimation === 'color' ?  'bg-blue-500 text-white p-2 mx-2 rounded' : 'bg-gray-200'}`}
//         >
//           Color Animation
//         </button>
//     {/*   <div className="flex justify-center mb-4">
//         <button onClick={saveSettings} className="bg-green-500 text-white p-2 mx-2 rounded">Save Settings</button>
//         <button onClick={loadSettings} className="bg-yellow-500 text-white p-2 mx-2 rounded">Load Settings</button>
//       </div> */}
//       </div>
      
//     {/*   {message.message && (
//         <div className={`alert ${message.type === 'error' ? 'bg-red-500' : 'bg-green-500'} text-white p-2 rounded`}>
//           {message.message}
//         </div>
//       )} */}
//       {currentAnimation === 'multifunction' && <MultifunctionAnimation settings={settings} setSettings={setSettings} />}
//       {currentAnimation === 'shape' && <ShapeAnimations settings={settings} setSettings={setSettings} />}
//       {currentAnimation === 'color' && <ColorAnimation settings={settings} setSettings={setSettings} />}
  
   
//       </div>
      
//   );
// };

// export default TherapyPage;

 

//--------------------------------------
/*   // src/pages/TherapyPage.jsx
import React from 'react';
 import MultifunctionAnimation from '../Therapy/MultifunctionAnimation';
import ShapeAnimations from '../Therapy/ShapeAnimations';
  
  
  import ColorAnimation from '../Therapy/ColorAnimation';
  
const TherapyPage = () => {
  
  return (
    <div>
      <ColorAnimation  />
    </div>
  );
};

export default TherapyPage;  
  */
//------------------------------------------
/* // src/pages/TherapyPage.jsx
import React, { useState } from 'react';
import MultifunctionAnimation from '../Therapy/MultifunctionAnimation';
import ShapeAnimations from '../Therapy/ShapeAnimations';

const TherapyPage = () => {
  const [animationType, setAnimationType] = useState('wave');

  const toggleAnimationType = (type) => {
    setAnimationType(type);
  };

  return (
    <div>
      <nav id="MainNavigation">
        <div className="dropdown">
          <button className="dropbtn">
            <h1><strong>STABLE GAIT THERAPY</strong></h1>
            Please Choose Your Background
          </button>
          <div className="dropdown-content">
            <a href="#" onClick={() => toggleAnimationType('shapes')}>Shapes Animation</a>
            <a href="#" onClick={() => toggleAnimationType('wave')}>Wave Animation</a>
          </div>
        </div>
      </nav>
      {animationType === 'wave' ? <MultifunctionAnimation /> : <ShapeAnimations />}
    </div>
  );
};

export default TherapyPage;

 */
 
//------------------------------------------
/* // src/components/pages/TherapyPage.jsx
import React, { useState } from 'react';
import MultifunctionAnimation from '../Therapy/MultifunctionAnimation';
import ShapeAnimation from '../Therapy/ShapeAnimations';
import AnimationBackground from '../Therapy/AnimationBackground';
import ColorAnimation from '../Therapy/ColorAnimation';
import ControlPanelColor from '../Therapy/ControlPanelColor';

const TherapyPage = () => {
 /*  const [currentAnimation, setCurrentAnimation] = useState('multifunction');
  const [colorSettings, setColorSettings] = useState({
    colors: ['#630F8B', '#0000FF', '#EA11CF', '#000000'],
    duration: 5,
  }); */

/*   const renderAnimation = () => {
    switch (currentAnimation) {
      case 'multifunction':
        return <MultifunctionAnimation />;
      case 'shape':
        return <ShapeAnimation />;
      case 'background':
        return <AnimationBackground />;
      case 'color':
        return <ColorAnimation settings={colorSettings} />;
      default:
        return <MultifunctionAnimation />;
    }
  };

  const renderControlPanel = () => {
    switch (currentAnimation) {
      case 'color':
        return <ControlPanelColor settings={colorSettings} setSettings={setColorSettings} />;
      default:
        return null;
    }
  };

  return (
    <div className="therapy-page">
      <div className="flex justify-center mb-4">
        <button
          onClick={() => setCurrentAnimation('multifunction')}
          className={`p-2 mx-2 ${currentAnimation === 'multifunction' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Multifunction Animation
        </button>
        <button
          onClick={() => setCurrentAnimation('shape')}
          className={`p-2 mx-2 ${currentAnimation === 'shape' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Shape Animation
        </button>
        <button
          onClick={() => setCurrentAnimation('background')}
          className={`p-2 mx-2 ${currentAnimation === 'background' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Background Animation
        </button>
        <button
          onClick={() => setCurrentAnimation('color')}
          className={`p-2 mx-2 ${currentAnimation === 'color' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Color Animation
        </button>
      </div>
      {renderControlPanel()}
      {renderAnimation()}
    </div>
  );
};

export default TherapyPage; */
 

//--------------------------------------------------
  