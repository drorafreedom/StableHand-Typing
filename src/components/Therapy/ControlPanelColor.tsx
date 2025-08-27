import React, { useState } from 'react';
import { Collapse } from 'react-collapse';
import { db, storage } from '../../firebase/firebase';
import { useAuth } from '../../data/AuthContext';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';
import Papa from 'papaparse';

interface Settings {
  colors: string[];
  duration: number;
  animationStyle: string;
  [key: string]: any;
}

interface Message {
  message: string;
  type: 'success' | 'error';
}

interface ControlPanelColorProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  startAnimation?: () => void;
  stopAnimation?: () => void;
  resetAnimation?: () => void;
}

const ControlPanelColor: React.FC<ControlPanelColorProps> = ({
  settings,
  setSettings,
  startAnimation,
  stopAnimation,
  resetAnimation,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const { currentUser } = useAuth();
  const [presetName, setPresetName] = useState<string>('');
  const [message, setMessage] = useState<Message>({ message: '', type: 'success' });

  const handleColorChange = (index: number, value: string) => {
    const newColors = [...settings.colors];
    newColors[index] = value;
    setSettings((prev) => ({ ...prev, colors: newColors }));
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings((prev) => ({ ...prev, duration: parseFloat(e.target.value) }));
  };

  const handleAnimationStyleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings((prev) => ({ ...prev, animationStyle: e.target.value }));
  };

  const saveSettings = async () => {
    if (!presetName) {
      setMessage({ message: 'Please provide a name for the preset.', type: 'error' });
      return;
    }

    const timestamp = new Date();
    const localDateTime = timestamp.toLocaleString();
    const settingsWithTimestamp = {
      ...settings,
      presetName,
      userId: currentUser?.uid,
      timestamp: timestamp.toISOString(),
      localDateTime,
    };

    try {
      const userDocRef = doc(collection(db, `users/${currentUser?.uid}/color-animation-settings`));
      await setDoc(userDocRef, settingsWithTimestamp);

      const csvData = Object.keys(settings).map((key) => ({
        setting: key,
        value: (settings as any)[key],
      }));
      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

      const csvRef = ref(storage, `users/${currentUser?.uid}/color-animation-settings/${timestamp.toISOString()}.csv`);
      await uploadBytes(csvRef, blob);

      setMessage({ message: 'Settings saved successfully!', type: 'success' });
    } catch (err) {
      console.error('Error saving settings:', err);
      setMessage({ message: 'Error saving settings. Please try again.', type: 'error' });
    }
  };

  const loadSettings = async () => {
    if (!presetName) {
      setMessage({ message: 'Please provide the name of the preset to load.', type: 'error' });
      return;
    }

    try {
      const userDocsRef = collection(db, `users/${currentUser?.uid}/color-animation-settings`);
      const q = query(userDocsRef, where('presetName', '==', presetName));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docSnapshot = querySnapshot.docs[0];
        const loadedSettings = docSnapshot.data() as Settings;
        setSettings(loadedSettings);
        setMessage({ message: 'Settings loaded successfully!', type: 'success' });
      } else {
        setMessage({ message: 'No settings found with that preset name.', type: 'error' });
      }
    } catch (err) {
      console.error('Error loading settings:', err);
      setMessage({ message: 'Error loading settings. Please try again.', type: 'error' });
    }
  };

  return (
    <div className={`fixed right-4 top-2 p-4 rounded ${isOpen ? 'shadow-lg bg-transparent' : ''} w-60 z-50`}>
         <button onClick={() => setIsOpen(!isOpen)} className="mb-2 bg-gray-200 text-xs p-2 border p-2 rounded w-full ">
        {isOpen ? 'Collapse Controls' : 'Expand Controls'}
      </button>

      <Collapse isOpened={isOpen}>
        <div className="space-y-4">
          <div className="text-xs flex space-x-2">
            <button onClick={startAnimation} className="bg-green-500 text-white p-2 rounded w-1/3">Start</button>
            <button onClick={stopAnimation} className="bg-red-500 text-white p-2 rounded w-1/3">Stop</button>
            <button onClick={resetAnimation} className="bg-gray-500 text-white p-2 rounded w-1/3">Reset</button>
          </div>

         <div className="text-xs flex space-x-2">
            <input
              type="text"
              placeholder="Preset Name"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>

          <div className="flex space-x-2 mt-2">
            <button onClick={saveSettings} className="bg-blue-500 text-xs -white p-2 rounded w-1/2">Save</button>
            <button onClick={loadSettings} className="bg-yellow-500 text-xs -white p-2 rounded w-1/2">Load</button>
          </div>
 
          {message.message && (
            <div className={`alert ${message.type === 'error' ? 'bg-red-500' : 'bg-green-500'} text-xs -white p-2 rounded`}>
              {message.message}
            </div>
          )}

          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="control-group">
              <label className="block mb-2 text-xs ">{`Color ${index + 1}:`}</label>
              <input
                type="color"
                value={settings.colors[index]}
                onChange={(e) => handleColorChange(index, e.target.value)}
                className="w-full"
              />
            </div>
          ))}

          <div className="control-group">
            <label className="block mb-2 text-xs ">Transition Duration (seconds):</label>
            <input type="range" min="0.5" max="10" value={settings.duration} onChange={handleDurationChange} className="w-full" />
          </div>

          <div className="control-group">
            <label className="block mb-2 text-xs ">Animation Style:</label>
            <select value={settings.animationStyle} onChange={handleAnimationStyleChange} className="border p-2  text-xs rounded w-full">
              <option value="sine">Sine</option>
              <option value="linear">Linear</option>
              <option value="circular">Circular</option>
              <option value="fractal">Fractal</option>
            </select>
          </div>
        </div>
      </Collapse>
    </div>
  );
};

export default ControlPanelColor;

//+++++++++++JS version+++++++++++++++++
//  // src/components/Therapy/ControlPanelColor.jsx 
//   // JS version


// import React, { useState } from 'react';
// import { Collapse } from 'react-collapse';
// import { db, storage } from '../../firebase/firebase';
// import { useAuth } from '../../data/AuthContext';
// import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
// import { ref, uploadBytes } from 'firebase/storage';
// import Papa from 'papaparse';
// import DateTimeDisplay from '../common/DateTimeDisplay';

// const ControlPanelColor = ({ settings, setSettings, startAnimation, stopAnimation, resetAnimation }) => {
//   const [isOpen, setIsOpen] = useState(true);
//   const { currentUser } = useAuth();
//   const [presetName, setPresetName] = useState('');
//   const [message, setMessage] = useState({ message: '', type: '' });

//   const handleColorChange = (index, value) => {
//     const newColors = [...settings.colors];
//     newColors[index] = value;
//     setSettings((prevSettings) => ({
//       ...prevSettings,
//       colors: newColors,
//     }));
//   };

//   const handleDurationChange = (e) => {
//     setSettings(prevSettings => ({ ...prevSettings, duration: parseFloat(e.target.value) }));
//   };

//   const handleAnimationStyleChange = (e) => {
//     setSettings(prevSettings => ({ ...prevSettings, animationStyle: e.target.value }));
//   };

//   const saveSettings = async () => {
//     if (!presetName) {
//       setMessage({ message: 'Please provide a name for the preset.', type: 'error' });
//       return;
//     }

//     const timestamp = new Date();
//     const localDateTime = timestamp.toLocaleString();
//     const settingsWithTimestamp = {
//       ...settings,
//       presetName,
//       userId: currentUser.uid,
//       timestamp: timestamp.toISOString(),
//       localDateTime
//     };

//     try {
//       // Save to Firestore
//       const userDocRef = doc(collection(db, `users/${currentUser.uid}/color-animation-settings`));
//       await setDoc(userDocRef, settingsWithTimestamp);
//       console.log('Document written with ID: ', userDocRef.id);

//       // Generate CSV data
//       const csvData = Object.keys(settings).map(key => ({
//         setting: key,
//         value: settings[key]
//       }));
//       const csv = Papa.unparse(csvData);
//       const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

//       const csvRef = ref(storage, `users/${currentUser.uid}/color-animation-settings/${timestamp.toISOString()}.csv`);
//       await uploadBytes(csvRef, blob);

//       setMessage({ message: 'Settings saved successfully!', type: 'success' });
//     } catch (err) {
//       console.error('Error saving settings:', err);
//       setMessage({ message: 'Error saving settings. Please try again.', type: 'error' });
//     }
//   };

//   const loadSettings = async () => {
//     if (!presetName) {
//       setMessage({ message: 'Please provide the name of the preset to load.', type: 'error' });
//       return;
//     }

//     try {
//       // Load the latest document with the given preset name from Firestore
//       const userDocsRef = collection(db, `users/${currentUser.uid}/color-animation-settings`);
//       const q = query(userDocsRef, where("presetName", "==", presetName));
//       const querySnapshot = await getDocs(q);

//       if (!querySnapshot.empty) {
//         const docSnapshot = querySnapshot.docs[0];
//         const loadedSettings = docSnapshot.data();
//         setSettings(loadedSettings);
//         setMessage({ message: 'Settings loaded successfully!', type: 'success' });
//       } else {
//         setMessage({ message: 'No settings found with that preset name.', type: 'error' });
//       }
//     } catch (err) {
//       console.error('Error loading settings:', err);
//       setMessage({ message: 'Error loading settings. Please try again.', type: 'error' });
//     }
//   };

//   return (
//     <div className={`fixed right-4 top-2 p-4 rounded ${isOpen ? 'shadow-lg bg-transparent' : ''} w-60 z-50 h-full overflow-y-auto`}>
//       {/* <DateTimeDisplay /> */}
//       <button onClick={() => setIsOpen(!isOpen)} className="mb-2 bg-gray-200 p-2 border p-2 rounded w-full">
//         {isOpen ? 'Collapse Controls' : 'Expand Controls'}
//       </button>
//       <Collapse isOpened={isOpen}>
//         <div className="space-y-4">
//           <div className="flex space-x-2">
//             <button onClick={startAnimation} className="bg-green-500 text-white p-2 rounded w-1/3">Start</button>
//             <button onClick={stopAnimation} className="bg-red-500 text-white p-2 rounded w-1/3">Stop</button>
//             <button onClick={resetAnimation} className="bg-gray-500 text-white p-2 rounded w-1/3">Reset</button>
//           </div>
//           <div className="flex space-x-2 mt-2">
//             <input
//               type="text"
//               placeholder="Preset Name"
//               value={presetName}
//               onChange={(e) => setPresetName(e.target.value)}
//               className="border p-2 rounded w-full"
//             />
//           </div>
//           <div className="flex space-x-2 mt-2">
//             <button onClick={saveSettings} className="bg-blue-500 text-white p-2 rounded w-1/2">Save</button>
//             <button onClick={loadSettings} className="bg-yellow-500 text-white p-2 rounded w-1/2">Load</button>
//           </div>
//           {message.message && (
//             <div className={`alert ${message.type === 'error' ? 'bg-red-500' : 'bg-green-500'} text-white p-2 rounded`}>
//               {message.message}
//             </div>
//           )}
//           <div className="control-group">
//             <label className="block mb-2">Color 1:</label>
//             <input type="color" value={settings.colors[0]} onChange={(e) => handleColorChange(0, e.target.value)} className="w-full" />
//           </div>
//           <div className="control-group">
//             <label className="block mb-2">Color 2:</label>
//             <input type="color" value={settings.colors[1]} onChange={(e) => handleColorChange(1, e.target.value)} className="w-full" />
//           </div>
//           <div className="control-group">
//             <label className="block mb-2">Color 3:</label>
//             <input type="color" value={settings.colors[2]} onChange={(e) => handleColorChange(2, e.target.value)} className="w-full" />
//           </div>
//           <div className="control-group">
//             <label className="block mb-2">Color 4:</label>
//             <input type="color" value={settings.colors[3]} onChange={(e) => handleColorChange(3, e.target.value)} className="w-full" />
//           </div>
//           <div className="control-group">
//             <label className="block mb-2">Transition Duration (seconds):</label>
//             <input type="range" min="1" max="60" value={settings.duration} onChange={handleDurationChange} className="w-full" />
//           </div>
//           <div className="control-group">
//             <label className="block mb-2">Animation Style:</label>
//             <select value={settings.animationStyle} onChange={handleAnimationStyleChange} className="border p-2 rounded w-full">
//             <option value="sine">Sine</option>
//   <option value="linear">Linear</option>
//   <option value="circular">Circular</option>
//   <option value="fractal">Fractal</option>
//               {/* Add more animation styles as needed */}
//             </select>
//           </div>
//         </div>
//       </Collapse>
//     </div>
//   );
// };

// export default ControlPanelColor;




/* // src/components/Therapy/ControlPanelColor.jsx
import React from 'react';
import { Collapse } from 'react-collapse';

const ControlPanelColor = ({ settings, setSettings }) => {
  const handleColorChange = (index, value) => {
    const newColors = [...settings.colors];
    newColors[index] = value;
    setSettings(prevSettings => ({ ...prevSettings, colors: newColors }));
  };

  const handleDurationChange = (e) => {
    setSettings(prevSettings => ({ ...prevSettings, duration: parseFloat(e.target.value) }));
  };

  return (
    <div className="fixed right-4 top-2 bg-transparent p-4 rounded shadow-lg w-60 z-50 h-full overflow-y-auto">
      <button onClick={() => setIsOpen(!isOpen)} className="mb-2 bg-gray-200 p-2 rounded w-full">
        {isOpen ? 'Collapse Controls' : 'Expand Controls'}
      </button>
      <Collapse isOpened={isOpen}>
        <div className="control-group">
          <label className="block mb-2">Color 1:</label>
          <input type="color" value={settings.colors[0]} onChange={(e) => handleColorChange(0, e.target.value)} className="w-full" />
        </div>
        <div className="control-group">
          <label className="block mb-2">Color 2:</label>
          <input type="color" value={settings.colors[1]} onChange={(e) => handleColorChange(1, e.target.value)} className="w-full" />
        </div>
        <div className="control-group">
          <label className="block mb-2">Color 3:</label>
          <input type="color" value={settings.colors[2]} onChange={(e) => handleColorChange(2, e.target.value)} className="w-full" />
        </div>
        <div className="control-group">
          <label className="block mb-2">Color 4:</label>
          <input type="color" value={settings.colors[3]} onChange={(e) => handleColorChange(3, e.target.value)} className="w-full" />
        </div>
        <div className="control-group">
          <label className="block mb-2">Transition Duration (seconds):</label>
          <input type="range" min="1" max="60" value={settings.duration} onChange={handleDurationChange} className="w-full" />
        </div>
      </Collapse>
    </div>
  );
};

export default ControlPanelColor; */
