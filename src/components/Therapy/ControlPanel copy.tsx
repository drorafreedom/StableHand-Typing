//old style 

import React, { useState } from 'react';
import { Collapse } from 'react-collapse';
import MultifunctionAnimation from '../Therapy/MultifunctionAnimation';
import ShapeAnimations from '../Therapy/ShapeAnimations';
import ColorAnimation from '../Therapy/ColorAnimation';
import { db, storage } from '../../firebase/firebase';
import { useAuth } from '../../data/AuthContext';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Papa from 'papaparse';
 

const ControlPanel = ({
  settings, setSettings,
  startAnimation, stopAnimation, resetAnimation,
  currentAnimation, setCurrentAnimation
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const { currentUser } = useAuth();
  const [presetName, setPresetName] = useState('');
  const [message, setMessage] = useState({ message: '', type: '' });

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
      userId: currentUser.uid,
      timestamp: timestamp.toISOString(),
      localDateTime
    };

    try {
      // Save to Firestore
      const userDocRef = doc(collection(db, `users/${currentUser.uid}/animation-settings`));
      await setDoc(userDocRef, settingsWithTimestamp);
      console.log('Document written with ID: ', userDocRef.id);

      // Generate CSV data
      const csvData = Object.keys(settingsWithTimestamp).map(key => ({
        setting: key,
        value: settingsWithTimestamp[key]
      }));
      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

      const csvRef = ref(storage, `users/${currentUser.uid}/animation-settings/${timestamp.toISOString()}.csv`);
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
      // Load the latest document with the given preset name from Firestore
      const userDocsRef = collection(db, `users/${currentUser.uid}/animation-settings`);
      const q = query(userDocsRef, where("presetName", "==", presetName));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docSnapshot = querySnapshot.docs[0];
        const loadedSettings = docSnapshot.data();
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
    <div className={`fixed right-4 top-2 p-4 rounded ${isOpen ? 'shadow-lg bg-transparent' : ''} w-60 z-50 h-full overflow-y-auto`}>
      {/* <DateTimeDisplay /> */}
    {/*   <div className="flex justify-start mb-2">
        <button
          onClick={() => setCurrentAnimation('multifunction')}
          className={`p-2 mx-2 ${currentAnimation === 'multifunction' ? 'bg-blue-500 text-white p-2 mx-2 rounded' : 'bg-gray-200'}`}
        >
          Multifunction
        </button>
        <button
          onClick={() => setCurrentAnimation('shape')}
          className={`bg-gray-200 p-2 rounded mr-1 ${currentAnimation === 'shape' ? 'bg-blue-500 text-white' : ''}`}
          disabled={currentAnimation === 'shape'}
        >
          Shape
        </button>
        <button
          onClick={() => setCurrentAnimation('color')}
          className={`bg-gray-200 p-2 rounded ${currentAnimation === 'color' ? 'bg-blue-500 text-white' : ''}`}
          disabled={currentAnimation === 'color'}
        >
          Color
        </button>
        {currentAnimation === 'multifunction' && <MultifunctionAnimation settings={settings} setSettings={setSettings} />}
      {currentAnimation === 'shape' && <ShapeAnimations settings={settings} setSettings={setSettings} />}
      {currentAnimation === 'color' && <ColorAnimation settings={settings} setSettings={setSettings} />}
      </div> */}
      <button onClick={() => setIsOpen(!isOpen)} className="mb-2 bg-gray-200 p-2 border p-2 rounded w-full">
        
        {isOpen ? 'Collapse Controls' : 'Expand Controls'}
      </button>
      <Collapse isOpened={isOpen}>
        <div className="space-y-2">
          <div className="flex space-x-2">
            <button onClick={startAnimation} className="bg-green-500 text-white p-2 rounded w-1/3">Start</button>
            <button onClick={stopAnimation} className="bg-red-500 text-white p-2 rounded w-1/3">Stop</button>
            <button onClick={resetAnimation} className="bg-gray-500 text-white p-2 rounded w-1/3">Reset</button>
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Preset Name"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>
          <div className="flex space-x-2">
            <button onClick={saveSettings} className="bg-blue-500 text-white p-2 rounded w-1/2">Save</button>
            <button onClick={loadSettings} className="bg-yellow-500 text-white p-2 rounded w-1/2">Load</button>
          </div>
          {message.message && (
            <div className={`alert ${message.type === 'error' ? 'bg-red-500' : 'bg-green-500'} text-white p-2 rounded`}>
              {message.message}
            </div>
          )}
          <div className="control-group">
            <label className="block mb-2">Wave Type:</label>
            <select value={settings.waveType} onChange={(e) => setSettings({ ...settings, waveType: e.target.value })} className="border p-2 rounded w-full">
              <option value="sine">Sine</option>
              <option value="tan">Tan</option>
              <option value="cotan">Cotan</option>
              <option value="sawtooth">Sawtooth</option>
              <option value="square">Square</option>
              <option value="triangle">Triangle</option>
            </select>
          </div>
          <div className="control-group">
            <label className="block mb-2">Direction:</label>
            <select value={settings.direction} onChange={(e) => setSettings({ ...settings, direction: e.target.value })} className="border p-2 rounded w-full">
              <option value="static">Static</option>
              <option value="up">Up</option>
              <option value="down">Down</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="oscillateUpDown">Oscillate Up and Down</option>
              <option value="oscillateRightLeft">Oscillate Right and Left</option>
              <option value="circular">Circular</option>
            </select>
          </div>
          {settings.direction === 'circular' && (
            <>
              <div className="control-group">
                <label className="block mb-2">Rotation Speed:</label>
                <input type="range" min="0.01" max="1" step="0.01" value={settings.rotationSpeed} onChange={(e) => setSettings({ ...settings, rotationSpeed: parseFloat(e.target.value) })} className="w-full" />
              </div>
              <div className="control-group">
                <label className="block mb-2">Rotation Radius:</label>
                <input type="range" min="10" max="500" value={settings.rotationRadius} onChange={(e) => setSettings({ ...settings, rotationRadius: parseFloat(e.target.value) })} className="w-full" />
              </div>
            </>
          )}
          {['oscillateUpDown', 'oscillateRightLeft'].includes(settings.direction) && (
            <div className="control-group">
              <label className="block mb-2">Oscillation Range:</label>
              <input type="range" min="10" max={Math.min(window.innerWidth, window.innerHeight)} value={settings.oscillationRange} onChange={(e) => setSettings({ ...settings, oscillationRange: parseFloat(e.target.value) })} className="w-full" />
            </div>
          )}
          <div className="control-group">
            <label className="block mb-2">Angle:</label>
            <input type="range" min="0" max="360" value={settings.angle * (180 / Math.PI)} step="1" onChange={(e) => setSettings({ ...settings, angle: parseFloat(e.target.value) * (Math.PI / 180) })} className="w-full" />
          </div>
          <div className="control-group">
            <label className="block mb-2">Amplitude:</label>
            <input type="range" max="360" min="0" step="1" value={settings.amplitude} onChange={(e) => setSettings({ ...settings, amplitude: parseFloat(e.target.value) })} className="w-full" />
          </div>
          <div className="control-group">
            <label className="block mb-2">Frequency:</label>
            <input type="range" min="1" max="300" value={settings.frequency} step="1" onChange={(e) => setSettings({ ...settings, frequency: parseFloat(e.target.value) })} className="w-full" />
          </div>
          <div className="control-group">
            <label className="block mb-2">Speed:</label>
            <input type="range" min="1" max="100" value={settings.speed * 100} step="1" onChange={(e) => setSettings({ ...settings, speed: parseFloat(e.target.value) / 100 })} className="w-full" />
          </div>
          <div className="control-group">
            <label className="block mb-2">Line Thickness:</label>
            <input type="range" min="1" max="10" value={settings.thickness} step="1" onChange={(e) => setSettings({ ...settings, thickness: parseFloat(e.target.value) })} className="w-full" />
          </div>
          <div className="control-group">
            <label className="block mb-2">Phase Offset:</label>
            <input type="range" min="0" max="360" value={settings.phaseOffset * (180 / Math.PI)} step="1" onChange={(e) => setSettings({ ...settings, phaseOffset: (parseFloat(e.target.value) / 360) * (2 * Math.PI) })} className="w-full" />
          </div>
          <div className="control-group">
            <label className="block mb-2">Number of Lines:</label>
            <input type="range" min="1" max="100" value={settings.numLines} step="1" onChange={(e) => setSettings({ ...settings, numLines: parseInt(e.target.value, 10) })} className="w-full" />
          </div>
          <div className="control-group">
            <label className="block mb-2">Distance Between Lines:</label>
            <input type="range" min="1" max="200" value={settings.distance} step="1" onChange={(e) => setSettings({ ...settings, distance: parseFloat(e.target.value) })} className="w-full" />
          </div>
          <div className="control-group">
            <label className="block mb-2">Number of Groups:</label>
            <input type="range" min="1" max="10" value={settings.groups} step="1" onChange={(e) => setSettings({ ...settings, groups: parseInt(e.target.value, 10) })} className="w-full" />
          </div>
          <div className="control-group">
            <label className="block mb-2">Background Color:</label>
            <input type="color" value={settings.bgColor} onChange={(e) => setSettings({ ...settings, bgColor: e.target.value })} className="w-full" />
          </div>
          <div className="control-group">
            <label className="block mb-2">Line Color:</label>
            <input type="color" value={settings.lineColor} onChange={(e) => setSettings({ ...settings, lineColor: e.target.value })} className="w-full" />
          </div>
          <div className="control-group">
            <label className="block mb-2">Use Palette:</label>
            <select value={settings.selectedPalette} onChange={(e) => setSettings({ ...settings, selectedPalette: e.target.value })} className="border p-2 rounded w-full">
              <option value="none">None</option>
              <option value="rainbow">Rainbow</option>
              <option value="pastel">Pastel</option>
            </select>
          </div>
        </div>
      </Collapse>
    </div>
  );
};

export default ControlPanel;




/* // src/components/Therapy/ControlPanel.jsx
import React, { useState } from 'react';
import { Collapse } from 'react-collapse';
import MultifunctionAnimation from '../Therapy/MultifunctionAnimation';
import ShapeAnimations from '../Therapy/ShapeAnimations';
import ColorAnimation from '../Therapy/ColorAnimation';
import { db, storage } from '../../firebase/firebase';
import { useAuth } from '../../data/AuthContext';
//import { doc, setDoc, getDoc, collection } from 'firebase/firestore';
//import { ref, uploadBytes } from 'firebase/storage';
import Papa from 'papaparse';
import DateTimeDisplay from '../common/DateTimeDisplay';
  
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
 

const ControlPanel = ({
  settings, setSettings,
  startAnimation, stopAnimation, resetAnimation,
  currentAnimation, setCurrentAnimation
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const { currentUser } = useAuth();
  const [presetName, setPresetName] = useState('');
  const [message, setMessage] = useState({ message: '', type: '' });

  const saveSettings = async () => {
    if (!presetName) {
      alert('Please provide a name for the preset.');
      return;
    }

    const timestamp = new Date();
    const localDateTime = timestamp.toLocaleString();
    const settingsWithTimestamp = {
      ...settings,
      presetName,
      userId: currentUser.uid,
      timestamp: timestamp.toISOString(),
      localDateTime
    };

    try {
      // Save to Firestore
      const userDocRef = doc(collection(db, `users/${currentUser.uid}/animation-settings`));
      await setDoc(userDocRef, settingsWithTimestamp);
      console.log('Document written with ID: ', userDocRef.id);

      // Generate CSV data
      const csvData = Object.keys(settings).map(key => ({
        setting: key,
        value: settings[key]
      }));
      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

      const csvRef = ref(storage, `users/${currentUser.uid}/animation-settings/${timestamp.toISOString()}.csv`);
      await uploadBytes(csvRef, blob);

      alert('Settings saved successfully!');
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Error saving settings. Please try again.');
    }
  };

  const loadSettings = async () => {
    if (!presetName) {
      alert('Please provide the name of the preset to load.');
      return;
    }

    try {
      // Load the latest document with the given preset name from Firestore
      const userDocsRef = collection(db, `users/${currentUser.uid}/animation-settings`);
      const q = query(userDocsRef, where("presetName", "==", presetName));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docSnapshot = querySnapshot.docs[0];
        const loadedSettings = docSnapshot.data();
        setSettings(loadedSettings);
        alert('Settings loaded successfully!');
      } else {
        alert('No settings found with that preset name.');
      }
    } catch (err) {
      console.error('Error loading settings:', err);
      alert('Error loading settings. Please try again.');
    }
  };


  return (
    <div className="fixed right-4 top-2 bg-white bg-opacity-50 p-2 rounded shadow-lg w-80 z-50 h-full overflow-y-auto">
      <DateTimeDisplay />
      <div className="flex justify-start mb-2">
        {currentAnimation !== 'multifunction' && (
          <button
            onClick={() => setCurrentAnimation('multifunction')}
            className="bg-gray-200 p-2 rounded mr-1"
          >
            Multifunction
          </button>
        )}
        {currentAnimation !== 'shape' && (
          <button
            onClick={() => setCurrentAnimation('shape')}
            className="bg-gray-200 p-2 rounded mr-1"
          >
            Shape
          </button>
        )}
        {currentAnimation !== 'color' && (
          <button
            onClick={() => setCurrentAnimation('color')}
            className="bg-gray-200 p-2 rounded"
          >
            Color
          </button>
        )}
      </div>
      <button onClick={() => setIsOpen(!isOpen)} className="mb-2 bg-gray-200 p-2 border p-2 rounded w-full">
        {isOpen ? 'Collapse Controls' : 'Expand Controls'}
      </button>
      <Collapse isOpened={isOpen}>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <button onClick={startAnimation} className="bg-green-500 text-white p-2 rounded w-1/3">Start</button>
            <button onClick={stopAnimation} className="bg-red-500 text-white p-2 rounded w-1/3">Stop</button>
            <button onClick={resetAnimation} className="bg-gray-500 text-white p-2 rounded w-1/3">Reset</button>
          </div>
          <div className="flex space-x-2">
            <button onClick={saveSettings} className="bg-blue-500 text-white p-2 rounded w-1/2">Save</button>
            <button onClick={loadSettings} className="bg-yellow-500 text-white p-2 rounded w-1/2">Load</button>
          </div>
          {message.message && (
            <div className={`alert ${message.type === 'error' ? 'bg-red-500' : 'bg-green-500'} text-white p-2 rounded`}>
              {message.message}
            </div>
          )}
          {currentAnimation === 'multifunction' && <MultifunctionAnimation settings={settings} setSettings={setSettings} />}
          {currentAnimation === 'shape' && <ShapeAnimations settings={settings} setSettings={setSettings} />}
          {currentAnimation === 'color' && <ColorAnimation settings={settings} setSettings={setSettings} />}
          <div className="control-group">
            <label className="block mb-2">Wave Type:</label>
            <select value={settings.waveType} onChange={(e) => setSettings({ ...settings, waveType: e.target.value })} className="border p-2 rounded w-full">
              <option value="sine">Sine</option>
              <option value="tan">Tan</option>
              <option value="cotan">Cotan</option>
              <option value="sawtooth">Sawtooth</option>
              <option value="square">Square</option>
              <option value="triangle">Triangle</option>
            </select>
          </div>

          <div className="control-group">
            <label className="block mb-2">Direction:</label>
            <select value={settings.direction} onChange={(e) => setSettings({ ...settings, direction: e.target.value })} className="border p-2 rounded w-full">
              <option value="static">Static</option>
              <option value="up">Up</option>
              <option value="down">Down</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="oscillateUpDown">Oscillate Up and Down</option>
              <option value="oscillateRightLeft">Oscillate Right and Left</option>
              <option value="circular">Circular</option>
            </select>
          </div>

          {settings.direction === "circular" && (
            <>
              <div className="control-group">
                <label className="block mb-2">Rotation Speed:</label>
                <input type="range" min="0.01" max="1" step="0.01" value={settings.rotationSpeed} onChange={(e) => setSettings({ ...settings, rotationSpeed: parseFloat(e.target.value) })} className="w-full" />
              </div>
              <div className="control-group">
                <label className="block mb-2">Rotation Radius:</label>
                <input type="range" min="10" max="500" value={settings.rotationRadius} onChange={(e) => setSettings({ ...settings, rotationRadius: parseFloat(e.target.value) })} className="w-full" />
              </div>
            </>
          )}
          {['oscillateUpDown', 'oscillateRightLeft'].includes(settings.direction) && (
            <div className="control-group">
              <label className="block mb-2">Oscillation Range:</label>
              <input type="range" min="10" max={Math.min(window.innerWidth, window.innerHeight)} value={settings.oscillationRange} onChange={(e) => setSettings({ ...settings, oscillationRange: parseFloat(e.target.value) })} className="w-full" />
            </div>
          )}

          <div className="control-group">
            <label className="block mb-2">Angle:</label>
            <input type="range" min="0" max="360" value={settings.angle * (180 / Math.PI)} step="1" onChange={(e) => setSettings({ ...settings, angle: parseFloat(e.target.value) * (Math.PI / 180) })} className="w-full" />
          </div>

          <div className="control-group">
            <label className="block mb-2">Amplitude:</label>
            <input type="range" max="360" min="0" step="1" value={settings.amplitude} onChange={(e) => setSettings({ ...settings, amplitude: parseFloat(e.target.value) })} className="w-full" />
          </div>

          <div className="control-group">
            <label className="block mb-2">Frequency:</label>
            <input type="range" min="1" max="300" value={settings.frequency} step="1" onChange={(e) => setSettings({ ...settings, frequency: parseFloat(e.target.value) })} className="w-full" />
          </div>

          <div className="control-group">
            <label className="block mb-2">Speed:</label>
            <input type="range" min="1" max="100" value={settings.speed * 100} step="1" onChange={(e) => setSettings({ ...settings, speed: parseFloat(e.target.value) / 100 })} className="w-full" />
          </div>

          <div className="control-group">
            <label className="block mb-2">Line Thickness:</label>
            <input type="range" min="1" max="10" value={settings.thickness} step="1" onChange={(e) => setSettings({ ...settings, thickness: parseFloat(e.target.value) })} className="w-full" />
          </div>

          <div className="control-group">
            <label className="block mb-2">Phase Offset:</label>
            <input type="range" min="0" max="360" value={settings.phaseOffset * (180 / Math.PI)} step="1" onChange={(e) => setSettings({ ...settings, phaseOffset: (parseFloat(e.target.value) / 360) * (2 * Math.PI) })} className="w-full" />
          </div>

          <div className="control-group">
            <label className="block mb-2">Number of Lines:</label>
            <input type="range" min="1" max="100" value={settings.numLines} step="1" onChange={(e) => setSettings({ ...settings, numLines: parseInt(e.target.value, 10) })} className="w-full" />
          </div>

          <div className="control-group">
            <label className="block mb-2">Distance Between Lines:</label>
            <input type="range" min="1" max="200" value={settings.distance} step="1" onChange={(e) => setSettings({ ...settings, distance: parseFloat(e.target.value) })} className="w-full" />
          </div>

          <div className="control-group">
            <label className="block mb-2">Number of Groups:</label>
            <input type="range" min="1" max="10" value={settings.groups} step="1" onChange={(e) => setSettings({ ...settings, groups: parseInt(e.target.value, 10) })} className="w-full" />
          </div>

          <div className="control-group">
            <label className="block mb-2">Background Color:</label>
            <input type="color" value={settings.bgColor} onChange={(e) => setSettings({ ...settings, bgColor: e.target.value })} className="w-full" />
          </div>

          <div className="control-group">
            <label className="block mb-2">Line Color:</label>
            <input type="color" value={settings.lineColor} onChange={(e) => setSettings({ ...settings, lineColor: e.target.value })} className="w-full" />
          </div>

          <div className="control-group">
            <label className="block mb-2">Use Palette:</label>
            <select value={settings.selectedPalette} onChange={(e) => setSettings({ ...settings, selectedPalette: e.target.value })} className="border p-2 rounded w-full">
              <option value="none">None</option>
              <option value="rainbow">Rainbow</option>
              <option value="pastel">Pastel</option>
            </select>
          </div>
        </div>
      </Collapse>
    </div>
  );
};

export default ControlPanel;
 */
 
/*  // -----------------------with time adn animaton toggling . not functional yet 
import React, { useState } from 'react';
import { Collapse } from 'react-collapse';
import DateTimeDisplay from '../common/DateTimeDisplay';
import ShapeAnimations from '../Therapy/ShapeAnimations';
import ColorAnimation from '../Therapy/ColorAnimation';
const ControlPanel = ({
  waveType, setWaveType,
  direction, setDirection,
  angle, setAngle,
  amplitude, setAmplitude,
  frequency, setFrequency,
  speed, setSpeed,
  thickness, setThickness,
  phaseOffset, setPhaseOffset,
  numLines, setNumLines,
  distance, setDistance,
  bgColor, setBgColor,
  lineColor, setLineColor,
  selectedPalette, setSelectedPalette,
  rotationSpeed, setRotationSpeed,
  rotationRadius, setRotationRadius,
  oscillationRange, setOscillationRange,
  groups, setGroups,
  startAnimation, stopAnimation, resetAnimation,
  currentAnimation, setCurrentAnimation
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return ( 

    <div className="fixed right-4 top-2 bg-transparent p-2 rounded shadow-lg w-80 z-50 h-full overflow-y-auto">
      <DateTimeDisplay />
      <div className="flex justify-start mb-2">
        {currentAnimation !== 'multifunction' && (
          <button
            onClick={() => setCurrentAnimation('multifunction')}
            className="bg-gray-200 p-2 rounded mr-1"
          >
            Multifunction
          </button>
        )}
        {currentAnimation !== 'shape' && (
          <button
            onClick={() => setCurrentAnimation('shape')}
            className="bg-gray-200 p-2 rounded mr-1"
          >
            Shape
          </button>
        )}
        {currentAnimation !== 'color' && (
          <button
            onClick={() => setCurrentAnimation('color')}
            className="bg-gray-200 p-2 rounded"
          >
            Color
          </button>
        )}
      </div>
      <button onClick={() => setIsOpen(!isOpen)} className="mb-2 bg-gray-200 p-2 rounded w-full">
        {isOpen ? 'Collapse Controls' : 'Expand Controls'}
      </button>
      <Collapse isOpened={isOpen}>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <button onClick={startAnimation} className="bg-green-500 text-white p-2 rounded w-1/3">Start</button>
            <button onClick={stopAnimation} className="bg-red-500 text-white p-2 rounded w-1/3">Stop</button>
            <button onClick={resetAnimation} className="bg-gray-500 text-white p-2 rounded w-1/3">Reset</button>
          </div>

          <div className="control-group">
            <label className="block mb-2">Wave Type:</label>
            <select value={waveType} onChange={(e) => setWaveType(e.target.value)} className="border p-2 rounded w-full">
              <option value="sine">Sine</option>
              <option value="tan">Tan</option>
              <option value="cotan">Cotan</option>
              <option value="sawtooth">Sawtooth</option>
              <option value="square">Square</option>
              <option value="triangle">Triangle</option>
            </select>
          </div>
          
          <div className="control-group">
            <label className="block mb-2">Direction:</label>
            <select value={direction} onChange={(e) => setDirection(e.target.value)} className="border p-2 rounded w-full">
              <option value="static">Static</option>
              <option value="up">Up</option>
              <option value="down">Down</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="oscillateUpDown">Oscillate Up and Down</option>
              <option value="oscillateRightLeft">Oscillate Right and Left</option>
              <option value="circular">Circular</option>
            </select>
          </div>

          {direction === "circular" && (
            <>
              <div className="control-group">
                <label className="block mb-2">Rotation Speed:</label>
                <input type="range" min="0.01" max="1" step="0.01" value={rotationSpeed} onChange={(e) => setRotationSpeed(parseFloat(e.target.value))} className="w-full"/>
              </div>
              <div className="control-group">
                <label className="block mb-2">Rotation Radius:</label>
                <input type="range" min="10" max="500" value={rotationRadius} onChange={(e) => setRotationRadius(parseFloat(e.target.value))} className="w-full"/>
              </div>
            </>
          )}

          {['oscillateUpDown', 'oscillateRightLeft'].includes(direction) && (
            <div className="control-group">
              <label className="block mb-2">Oscillation Range:</label>
              <input type="range" min="10" max={Math.min(window.innerWidth, window.innerHeight) } value={oscillationRange} onChange={(e) => setOscillationRange(parseFloat(e.target.value))} className="w-full"/>
            </div>
          )}

          <div className="control-group">
            <label className="block mb-2">Angle:</label>
            <input type="range" min="0" max="360" value={angle * (180 / Math.PI)} step="1" onChange={(e) => setAngle(parseFloat(e.target.value) * (Math.PI / 180))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Amplitude:</label>
            <input type="range" max="360" min="0" step="1" value={amplitude} onChange={(e) => setAmplitude(parseFloat(e.target.value))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Frequency:</label>
            <input type="range" min="1" max="300" value={frequency} step="1" onChange={(e) => setFrequency(parseFloat(e.target.value))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Speed:</label>
            <input type="range" min="1" max="100" value={speed * 100} step="1" onChange={(e) => setSpeed(parseFloat(e.target.value) / 100)} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Line Thickness:</label>
            <input type="range" min="1" max="10" value={thickness} step="1" onChange={(e) => setThickness(parseFloat(e.target.value))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Phase Offset:</label>
            <input type="range" min="0" max="360" value={phaseOffset * (180 / Math.PI)} step="1" onChange={(e) => setPhaseOffset((parseFloat(e.target.value) / 360) * (2 * Math.PI))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Number of Lines:</label>
            <input type="range" min="1" max="100" value={numLines} step="1" onChange={(e) => setNumLines(parseInt(e.target.value, 10))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Distance Between Lines:</label>
            <input type="range" min="1" max="200" value={distance} step="1" onChange={(e) => setDistance(parseFloat(e.target.value))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Number of Groups:</label>
            <input type="range" min="1" max="10" value={groups} step="1" onChange={(e) => setGroups(parseInt(e.target.value, 10))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Background Color:</label>
            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Line Color:</label>
            <input type="color" value={lineColor} onChange={(e) => setLineColor(e.target.value)} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Use Palette:</label>
            <select value={selectedPalette} onChange={(e) => setSelectedPalette(e.target.value)} className="border p-2 rounded w-full">
              <option value="none">None</option>
              <option value="rainbow">Rainbow</option>
              <option value="pastel">Pastel</option>
            </select>
          </div>
        </div>
      </Collapse>
    </div>
  );
};

export default ControlPanel; 
 */

/*   import React, { useState } from 'react';
import { Collapse } from 'react-collapse';

const ControlPanel = ({
  waveType, setWaveType,
  direction, setDirection,
  angle, setAngle,
  amplitude, setAmplitude,
  frequency, setFrequency,
  speed, setSpeed,
  thickness, setThickness,
  phaseOffset, setPhaseOffset,
  numLines, setNumLines,
  distance, setDistance,
  bgColor, setBgColor,
  lineColor, setLineColor,
  selectedPalette, setSelectedPalette,
  rotationSpeed, setRotationSpeed,
  rotationRadius, setRotationRadius,
  oscillationRange, setOscillationRange,
  groups, setGroups,
  startAnimation, stopAnimation, resetAnimation
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={`fixed right-4 top-2 p-4 rounded ${isOpen ? 'shadow-lg bg-transparent' : ''} w-60 z-50 h-full overflow-y-auto`}>
      <button onClick={() => setIsOpen(!isOpen)} className="mb-2 bg-gray-200 p-2 rounded w-full">
        {isOpen ? 'Collapse Controls' : 'Expand Controls'}
      </button>
      <Collapse isOpened={isOpen}>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <button onClick={startAnimation} className="bg-green-500 text-white p-2 rounded w-1/3">Start</button>
            <button onClick={stopAnimation} className="bg-red-500 text-white p-2 rounded w-1/3">Stop</button>
            <button onClick={resetAnimation} className="bg-gray-500 text-white p-2 rounded w-1/3">Reset</button>
          </div>
          
          <div className="control-group">
            <label className="block mb-2">Wave Type:</label>
            <select value={waveType} onChange={(e) => setWaveType(e.target.value)} className="border p-2 rounded w-full">
              <option value="sine">Sine</option>
              <option value="tan">Tan</option>
              <option value="cotan">Cotan</option>
              <option value="sawtooth">Sawtooth</option>
              <option value="square">Square</option>
              <option value="triangle">Triangle</option>
            </select>
          </div>
          
          <div className="control-group">
            <label className="block mb-2">Direction:</label>
            <select value={direction} onChange={(e) => setDirection(e.target.value)} className="border p-2 rounded w-full">
              <option value="static">Static</option>
              <option value="up">Up</option>
              <option value="down">Down</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="oscillateUpDown">Oscillate Up and Down</option>
              <option value="oscillateRightLeft">Oscillate Right and Left</option>
              <option value="circular">Circular</option>
            </select>
          </div>

          {direction === "circular" && (
            <>
              <div className="control-group">
                <label className="block mb-2">Rotation Speed:</label>
                <input type="range" min="0.01" max="1" step="0.01" value={rotationSpeed} onChange={(e) => setRotationSpeed(parseFloat(e.target.value))} className="w-full"/>
              </div>
              <div className="control-group">
                <label className="block mb-2">Rotation Radius:</label>
                <input type="range" min="10" max="500" value={rotationRadius} onChange={(e) => setRotationRadius(parseFloat(e.target.value))} className="w-full"/>
              </div>
            </>
          )}
   {['oscillateUpDown', 'oscillateRightLeft'].includes(direction) && (
            <div className="control-group">
              <label className="block mb-2">Oscillation Range:</label>
              <input type="range" min="10" max={Math.min(window.innerWidth, window.innerHeight) } value={oscillationRange} onChange={(e) => setOscillationRange(parseFloat(e.target.value))} className="w-full"/>
            </div>
          )}

          <div className="control-group">
            <label className="block mb-2">Angle:</label>
            <input type="range" min="0" max="360" value={angle * (180 / Math.PI)} step="1" onChange={(e) => setAngle(parseFloat(e.target.value) * (Math.PI / 180))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Amplitude:</label>
            <input type="range" max="360" min="0" step="1" value={amplitude} onChange={(e) => setAmplitude(parseFloat(e.target.value))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Frequency:</label>
            <input type="range" min="1" max="300" value={frequency} step="1" onChange={(e) => setFrequency(parseFloat(e.target.value))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Speed:</label>
            <input type="range" min="1" max="100" value={speed * 100} step="1" onChange={(e) => setSpeed(parseFloat(e.target.value) / 100)} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Line Thickness:</label>
            <input type="range" min="1" max="10" value={thickness} step="1" onChange={(e) => setThickness(parseFloat(e.target.value))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Phase Offset:</label>
            <input type="range" min="0" max="360" value={phaseOffset * (180 / Math.PI)} step="1" onChange={(e) => setPhaseOffset((parseFloat(e.target.value) / 360) * (2 * Math.PI))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Number of Lines:</label>
            <input type="range" min="1" max="100" value={numLines} step="1" onChange={(e) => setNumLines(parseInt(e.target.value, 10))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Distance Between Lines:</label>
            <input type="range" min="1" max="200" value={distance} step="1" onChange={(e) => setDistance(parseFloat(e.target.value))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Number of Groups:</label>
            <input type="range" min="1" max="10" value={groups} step="1" onChange={(e) => setGroups(parseInt(e.target.value, 10))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Background Color:</label>
            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Line Color:</label>
            <input type="color" value={lineColor} onChange={(e) => setLineColor(e.target.value)} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Use Palette:</label>
            <select value={selectedPalette} onChange={(e) => setSelectedPalette(e.target.value)} className="border p-2 rounded w-full">
              <option value="none">None</option>
              <option value="rainbow">Rainbow</option>
              <option value="pastel">Pastel</option>
            </select>
          </div>
        </div>
      </Collapse>
    </div>
  );
};

export default ControlPanel;   */
 
 /* // -----------------------with time adn animaton toggling . not functional yet 
import React, { useState } from 'react';
import { Collapse } from 'react-collapse';
import DateTimeDisplay from '../common/DateTimeDisplay';
import ShapeAnimations from '../Therapy/ShapeAnimations';
import ColorAnimation from '../Therapy/ColorAnimation';
const ControlPanel = ({
  waveType, setWaveType,
  direction, setDirection,
  angle, setAngle,
  amplitude, setAmplitude,
  frequency, setFrequency,
  speed, setSpeed,
  thickness, setThickness,
  phaseOffset, setPhaseOffset,
  numLines, setNumLines,
  distance, setDistance,
  bgColor, setBgColor,
  lineColor, setLineColor,
  selectedPalette, setSelectedPalette,
  rotationSpeed, setRotationSpeed,
  rotationRadius, setRotationRadius,
  oscillationRange, setOscillationRange,
  groups, setGroups,
  startAnimation, stopAnimation, resetAnimation,
  currentAnimation, setCurrentAnimation
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return ( 

    <div className="fixed right-4 top-2 bg-transparent p-2 rounded shadow-lg w-80 z-50 h-full overflow-y-auto">
      <DateTimeDisplay />
      <div className="flex justify-start mb-2">
        {currentAnimation !== 'multifunction' && (
          <button
            onClick={() => setCurrentAnimation('multifunction')}
            className="bg-gray-200 p-2 rounded mr-1"
          >
            Multifunction
          </button>
        )}
        {currentAnimation !== 'shape' && (
          <button
            onClick={() => setCurrentAnimation('shape')}
            className="bg-gray-200 p-2 rounded mr-1"
          >
            Shape
          </button>
        )}
        {currentAnimation !== 'color' && (
          <button
            onClick={() => setCurrentAnimation('color')}
            className="bg-gray-200 p-2 rounded"
          >
            Color
          </button>
        )}
      </div>
      <button onClick={() => setIsOpen(!isOpen)} className="mb-2 bg-gray-200 p-2 rounded w-full">
        {isOpen ? 'Collapse Controls' : 'Expand Controls'}
      </button>
      <Collapse isOpened={isOpen}>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <button onClick={startAnimation} className="bg-green-500 text-white p-2 rounded w-1/3">Start</button>
            <button onClick={stopAnimation} className="bg-red-500 text-white p-2 rounded w-1/3">Stop</button>
            <button onClick={resetAnimation} className="bg-gray-500 text-white p-2 rounded w-1/3">Reset</button>
          </div>

          <div className="control-group">
            <label className="block mb-2">Wave Type:</label>
            <select value={waveType} onChange={(e) => setWaveType(e.target.value)} className="border p-2 rounded w-full">
              <option value="sine">Sine</option>
              <option value="tan">Tan</option>
              <option value="cotan">Cotan</option>
              <option value="sawtooth">Sawtooth</option>
              <option value="square">Square</option>
              <option value="triangle">Triangle</option>
            </select>
          </div>
          
          <div className="control-group">
            <label className="block mb-2">Direction:</label>
            <select value={direction} onChange={(e) => setDirection(e.target.value)} className="border p-2 rounded w-full">
              <option value="static">Static</option>
              <option value="up">Up</option>
              <option value="down">Down</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="oscillateUpDown">Oscillate Up and Down</option>
              <option value="oscillateRightLeft">Oscillate Right and Left</option>
              <option value="circular">Circular</option>
            </select>
          </div>

          {direction === "circular" && (
            <>
              <div className="control-group">
                <label className="block mb-2">Rotation Speed:</label>
                <input type="range" min="0.01" max="1" step="0.01" value={rotationSpeed} onChange={(e) => setRotationSpeed(parseFloat(e.target.value))} className="w-full"/>
              </div>
              <div className="control-group">
                <label className="block mb-2">Rotation Radius:</label>
                <input type="range" min="10" max="500" value={rotationRadius} onChange={(e) => setRotationRadius(parseFloat(e.target.value))} className="w-full"/>
              </div>
            </>
          )}

          {['oscillateUpDown', 'oscillateRightLeft'].includes(direction) && (
            <div className="control-group">
              <label className="block mb-2">Oscillation Range:</label>
              <input type="range" min="10" max={Math.min(window.innerWidth, window.innerHeight) } value={oscillationRange} onChange={(e) => setOscillationRange(parseFloat(e.target.value))} className="w-full"/>
            </div>
          )}

          <div className="control-group">
            <label className="block mb-2">Angle:</label>
            <input type="range" min="0" max="360" value={angle * (180 / Math.PI)} step="1" onChange={(e) => setAngle(parseFloat(e.target.value) * (Math.PI / 180))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Amplitude:</label>
            <input type="range" max="360" min="0" step="1" value={amplitude} onChange={(e) => setAmplitude(parseFloat(e.target.value))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Frequency:</label>
            <input type="range" min="1" max="300" value={frequency} step="1" onChange={(e) => setFrequency(parseFloat(e.target.value))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Speed:</label>
            <input type="range" min="1" max="100" value={speed * 100} step="1" onChange={(e) => setSpeed(parseFloat(e.target.value) / 100)} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Line Thickness:</label>
            <input type="range" min="1" max="10" value={thickness} step="1" onChange={(e) => setThickness(parseFloat(e.target.value))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Phase Offset:</label>
            <input type="range" min="0" max="360" value={phaseOffset * (180 / Math.PI)} step="1" onChange={(e) => setPhaseOffset((parseFloat(e.target.value) / 360) * (2 * Math.PI))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Number of Lines:</label>
            <input type="range" min="1" max="100" value={numLines} step="1" onChange={(e) => setNumLines(parseInt(e.target.value, 10))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Distance Between Lines:</label>
            <input type="range" min="1" max="200" value={distance} step="1" onChange={(e) => setDistance(parseFloat(e.target.value))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Number of Groups:</label>
            <input type="range" min="1" max="10" value={groups} step="1" onChange={(e) => setGroups(parseInt(e.target.value, 10))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Background Color:</label>
            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Line Color:</label>
            <input type="color" value={lineColor} onChange={(e) => setLineColor(e.target.value)} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Use Palette:</label>
            <select value={selectedPalette} onChange={(e) => setSelectedPalette(e.target.value)} className="border p-2 rounded w-full">
              <option value="none">None</option>
              <option value="rainbow">Rainbow</option>
              <option value="pastel">Pastel</option>
            </select>
          </div>
        </div>
      </Collapse>
    </div>
  );
};

export default ControlPanel; 
 */


/* //src\components\Therapy\ControlPanel.jsx
import React, { useState } from 'react';
import { Collapse } from 'react-collapse';

const ControlPanel = ({
  waveType, setWaveType,
  direction, setDirection,
  angle, setAngle,
  amplitude, setAmplitude,
  frequency, setFrequency,
  speed, setSpeed,
  thickness, setThickness,
  phaseOffset, setPhaseOffset,
  numLines, setNumLines,
  distance, setDistance,
  bgColor, setBgColor,
  lineColor, setLineColor,
  selectedPalette, setSelectedPalette,
  rotationSpeed, setRotationSpeed,
  rotationRadius, setRotationRadius,
  groups, setGroups,
  startAnimation, stopAnimation, resetAnimation
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="fixed right-4 top-2 bg-transparent p-4 rounded shadow-lg w-60 z-50 h-full overflow-y-auto">
      <button onClick={() => setIsOpen(!isOpen)} className="mb-2 bg-gray-200 p-2 rounded w-full">
        {isOpen ? 'Collapse Controls' : 'Expand Controls'}
      </button>
      <Collapse isOpened={isOpen}>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <button onClick={startAnimation} className="bg-green-500 text-white p-2 rounded w-1/3">Start</button>
            <button onClick={stopAnimation} className="bg-red-500 text-white p-2 rounded w-1/3">Stop</button>
            <button onClick={resetAnimation} className="bg-gray-500 text-white p-2 rounded w-1/3">Reset</button>
          </div>
          
          <div className="control-group">
            <label className="block mb-2">Wave Type:</label>
            <select value={waveType} onChange={(e) => setWaveType(e.target.value)} className="border p-2 rounded w-full">
              <option value="sine">Sine</option>
              <option value="tan">Tan</option>
              <option value="cotan">Cotan</option>
              <option value="sawtooth">Sawtooth</option>
              <option value="square">Square</option>
              <option value="triangle">Triangle</option>
            </select>
          </div>
          
          <div className="control-group">
            <label className="block mb-2">Direction:</label>
            <select value={direction} onChange={(e) => setDirection(e.target.value)} className="border p-2 rounded w-full">
              <option value="static">Static</option>
              <option value="up">Up</option>
              <option value="down">Down</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="oscillateUpDown">Oscillate Up and Down</option>
              <option value="oscillateRightLeft">Oscillate Right and Left</option>
              <option value="circular">Circular</option>
            </select>
          </div>

          {direction === "circular" && (
            <>
              <div className="control-group">
                <label className="block mb-2">Rotation Speed:</label>
                <input type="range" min="0.01" max="1" step="0.01" value={rotationSpeed} onChange={(e) => setRotationSpeed(parseFloat(e.target.value))} className="w-full"/>
              </div>
              <div className="control-group">
                <label className="block mb-2">Rotation Radius:</label>
                <input type="range" min="10" max="500" value={rotationRadius} onChange={(e) => setRotationRadius(parseFloat(e.target.value))} className="w-full"/>
              </div>
            </>
          )}

          <div className="control-group">
            <label className="block mb-2">Angle:</label>
            <input type="range" min="0" max="360" value={angle * (180 / Math.PI)} step="1" onChange={(e) => setAngle(parseFloat(e.target.value) * (Math.PI / 180))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Amplitude:</label>
            <input type="range" max="360" min="0" step="1" value={amplitude} onChange={(e) => setAmplitude(parseFloat(e.target.value))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Frequency:</label>
            <input type="range" min="1" max="300" value={frequency} step="1" onChange={(e) => setFrequency(parseFloat(e.target.value))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Speed:</label>
            <input type="range" min="1" max="100" value={speed * 100} step="1" onChange={(e) => setSpeed(parseFloat(e.target.value) / 100)} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Line Thickness:</label>
            <input type="range" min="1" max="10" value={thickness} step="1" onChange={(e) => setThickness(parseFloat(e.target.value))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Phase Offset:</label>
            <input type="range" min="0" max="360" value={phaseOffset * (180 / Math.PI)} step="1" onChange={(e) => setPhaseOffset((parseFloat(e.target.value) / 360) * (2 * Math.PI))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Number of Lines:</label>
            <input type="range" min="1" max="100" value={numLines} step="1" onChange={(e) => setNumLines(parseInt(e.target.value, 10))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Distance Between Lines:</label>
            <input type="range" min="1" max="200" value={distance} step="1" onChange={(e) => setDistance(parseFloat(e.target.value))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Number of Groups:</label>
            <input type="range" min="1" max="10" value={groups} step="1" onChange={(e) => setGroups(parseInt(e.target.value, 10))} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Background Color:</label>
            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Line Color:</label>
            <input type="color" value={lineColor} onChange={(e) => setLineColor(e.target.value)} className="w-full"/>
          </div>

          <div className="control-group">
            <label className="block mb-2">Use Palette:</label>
            <select value={selectedPalette} onChange={(e) => setSelectedPalette(e.target.value)} className="border p-2 rounded w-full">
              <option value="none">None</option>
              <option value="rainbow">Rainbow</option>
              <option value="pastel">Pastel</option>
            </select>
          </div>
        </div>
      </Collapse>
    </div>
  );
};

export default ControlPanel; */


/* // src/components/TherapyPage/ControlPanel.jsx
import React, { useState } from 'react';
import { Collapse } from 'react-collapse';

const ControlPanel = ({
  waveType, setWaveType,
  direction, setDirection,
  angle, setAngle,
  amplitude, setAmplitude,
  frequency, setFrequency,
  speed, setSpeed,
  thickness, setThickness,
  phaseOffset, setPhaseOffset,
  numLines, setNumLines,
  distance, setDistance,
  bgColor, setBgColor,
  lineColor, setLineColor,
  selectedPalette, setSelectedPalette,
  rotationSpeed, setRotationSpeed,
  rotationRadius, setRotationRadius,
  groups, setGroups,
  startAnimation, stopAnimation, resetAnimation
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="fixed right-4 top-2 bg-white p-2 rounded shadow-lg w-60 z-50 p-4  h-full overflow-y-auto  ">
      <button onClick={() => setIsOpen(!isOpen)} className="mb-1 bg-gray-200 p-1 rounded w-full">
        {isOpen ? 'Collapse Controls' : 'Expand Controls'}
      </button>
      <Collapse isOpened={isOpen}>
      
      <div className="animation-buttons mt-4">
          <button onClick={startAnimation} className="bg-green-500 text-white p-2 rounded mr-2 w-half">Start</button>
          <button onClick={stopAnimation} className="bg-red-500 text-white p-2 rounded mr-2 w-half">Stop</button>
          <button onClick={resetAnimation} className="bg-gray-500 text-white p-2 rounded w-half">Reset</button>
        </div>
        <div className="control-group">
          <label className="block mb-2">Wave Type:</label>
          <select value={waveType} onChange={(e) => setWaveType(e.target.value)} className="border p-2 rounded w-full">
            <option value="sine">Sine</option>
            <option value="tan">Tan</option>
            <option value="cotan">Cotan</option>
            <option value="sawtooth">Sawtooth</option>
            <option value="square">Square</option>
            <option value="triangle">Triangle</option>
          </select>
        </div>
        <div className="control-group">
          <label className="block mb-2">Direction:</label>
          <select value={direction} onChange={(e) => setDirection(e.target.value)} className="border p-2 rounded w-full">
            <option value="static">Static</option>
            <option value="up">Up</option>
            <option value="down">Down</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
            <option value="oscillateUpDown">Oscillate Up and Down</option>
            <option value="oscillateRightLeft">Oscillate Right and Left</option>
            <option value="circular">Circular</option>
          </select>
        </div>
        {direction === "circular" && (
          <>
            <div className="control-group">
              <label className="block mb-2">Rotation Speed:</label>
              <input type="range" min="0.01" max="1" step="0.01" value={rotationSpeed} onChange={(e) => setRotationSpeed(parseFloat(e.target.value))} className="w-full"/>
            </div>
            <div className="control-group">
              <label className="block mb-2">Rotation Radius:</label>
              <input type="range" min="10" max="500" value={rotationRadius} onChange={(e) => setRotationRadius(parseFloat(e.target.value))} className="w-full"/>
            </div>
          </>
        )}
        <div className="control-group">
          <label className="block mb-2">Angle:</label>
          <input type="range" min="0" max="360" value={angle * (180 / Math.PI)} step="1" onChange={(e) => setAngle(parseFloat(e.target.value) * (Math.PI / 180))} className="w-full"/>
        </div>
        <div className="control-group">
          <label className="block mb-2">Amplitude:</label>
          <input type="range" max="360" min="0" step="1" value={amplitude / (window.innerHeight / 4) * 100} onChange={(e) => setAmplitude(parseFloat(e.target.value) * (window.innerHeight / 4) / 100)} className="w-full"/>
        </div>
        <div className="control-group">
          <label className="block mb-2">Frequency:</label>
          <input type="range" min="1" max="300" value={frequency} step="1" onChange={(e) => setFrequency(parseFloat(e.target.value))} className="w-full"/>
        </div>
        <div className="control-group">
          <label className="block mb-2">Speed:</label>
          <input type="range" min="1" max="500" value={speed * 100} step="1" onChange={(e) => setSpeed(parseFloat(e.target.value) / 100)} className="w-full"/>
        </div>
        <div className="control-group">
          <label className="block mb-2">Line Thickness:</label>
          <input type="range" min="1" max="10" value={thickness} step="1" onChange={(e) => setThickness(parseFloat(e.target.value))} className="w-full"/>
        </div>
        <div className="control-group">
          <label className="block mb-2">Phase Offset:</label>
          <input type="range" min="0" max="360" value={phaseOffset * (180 / Math.PI)} step="1" onChange={(e) => setPhaseOffset((parseFloat(e.target.value) / 360) * (2 * Math.PI))} className="w-full"/>
        </div>
        <div className="control-group">
          <label className="block mb-2">Number of Lines:</label>
          <input type="range" min="1" max="100" value={numLines} step="1" onChange={(e) => setNumLines(parseInt(e.target.value, 10))} className="w-full"/>
        </div>
        <div className="control-group">
          <label className="block mb-2">Distance Between Lines:</label>
          <input type="range" min="1" max="200" value={distance} step="1" onChange={(e) => setDistance(parseFloat(e.target.value))} className="w-full"/>
        </div>
        <div className="control-group">
          <label className="block mb-2">Number of Groups:</label>
          <input type="range" min="1" max="10" value={groups} step="1" onChange={(e) => setGroups(parseInt(e.target.value, 10))} className="w-full"/>
        </div>
        
        <div className="control-group">
          <label className="block mb-2">Background Color:</label>
          <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-full"/>
        </div>
        <div className="control-group">
          <label className="block mb-2">Line Color:</label>
          <input type="color" value={lineColor} onChange={(e) => setLineColor(e.target.value)} className="w-full"/>
        </div>
        <div className="control-group">
          <label className="block mb-2">Use Palette:</label>
          <select value={selectedPalette} onChange={(e) => setSelectedPalette(e.target.value)} className="border p-2 rounded w-full">
            <option value="none">None</option>
            <option value="rainbow">Rainbow</option>

            <option value="pastel">Pastel</option>
        
          </select>
        </div>
       
      </Collapse>
    </div>
  );
};

export default ControlPanel; */

/* // src/components/TherapyPage/ControlPanel.jsx
import React, { useState } from 'react';
import { Collapse } from 'react-collapse';

const ControlPanel = ({
  waveType, setWaveType,
  direction, setDirection,
  angle, setAngle,
  amplitude, setAmplitude,
  frequency, setFrequency,
  speed, setSpeed,
  thickness, setThickness,
  phaseOffset, setPhaseOffset,
  numLines, setNumLines,
  distance, setDistance,
  bgColor, setBgColor,
  lineColor, setLineColor,
  selectedPalette, setSelectedPalette,
  rotationSpeed, setRotationSpeed,
  rotationRadius, setRotationRadius,
  startAnimation, stopAnimation, resetAnimation
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="fixed right-5 top-5 bg-white p-4 rounded shadow-lg w-80 z-50 flex-grow  h full overflow-y-auto">
      <button onClick={() => setIsOpen(!isOpen)} className="mb-4 bg-gray-200 p-2 rounded w-full">
        {isOpen ? 'Collapse Controls' : 'Expand Controls'}
      </button>
      <Collapse isOpened={isOpen}>
        <div className="control-group">
          <label className="block mb-2">Wave Type:</label>
          <select value={waveType} onChange={(e) => setWaveType(e.target.value)} className="border p-2 rounded w-full">
            <option value="sine">Sine</option>
            <option value="tan">Tan</option>
            <option value="cotan">Cotan</option>
            <option value="sawtooth">Sawtooth</option>
            <option value="square">Square</option>
            <option value="triangle">Triangle</option>
          </select>
        </div>
        <div className="control-group">
          <label className="block mb-2">Direction:</label>
          <select value={direction} onChange={(e) => setDirection(e.target.value)} className="border p-2 rounded w-full">
            <option value="static">Static</option>
            <option value="up">Up</option>
            <option value="down">Down</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
            <option value="oscillateUpDown">Oscillate Up and Down</option>
            <option value="oscillateRightLeft">Oscillate Right and Left</option>
            <option value="circular">Circular</option>
          </select>
        </div>
        {direction === "circular" && (
          <>
            <div className="control-group">
              <label className="block mb-2">Rotation Speed:</label>
              <input type="range" min="0.01" max="1" step="0.01" value={rotationSpeed} onChange={(e) => setRotationSpeed(parseFloat(e.target.value))} className="w-full"/>
            </div>
            <div className="control-group">
              <label className="block mb-2">Rotation Radius:</label>
              <input type="range" min="10" max="500" value={rotationRadius} onChange={(e) => setRotationRadius(parseFloat(e.target.value))} className="w-full"/>
            </div>
          </>
        )}
        <div className="control-group">
          <label className="block mb-2">Angle:</label>
          <input type="range" min="0" max="360" value={angle * (180 / Math.PI)} step="1" onChange={(e) => setAngle(parseFloat(e.target.value) * (Math.PI / 180))} className="w-full"/>
        </div>
        <div className="control-group">
          <label className="block mb-2">Amplitude:</label>
          <input type="range" max="360" min="0" step="1" value={amplitude / (window.innerHeight / 4) * 100} onChange={(e) => setAmplitude(parseFloat(e.target.value) * (window.innerHeight / 4) / 100)} className="w-full"/>
        </div>
        <div className="control-group">
          <label className="block mb-2">Frequency:</label>
          <input type="range" min="1" max="300" value={frequency} step="1" onChange={(e) => setFrequency(parseFloat(e.target.value))} className="w-full"/>
        </div>
        <div className="control-group">
          <label className="block mb-2">Speed:</label>
          <input type="range" min="1" max="500" value={speed * 100} step="1" onChange={(e) => setSpeed(parseFloat(e.target.value) / 100)} className="w-full"/>
        </div>
        <div className="control-group">
          <label className="block mb-2">Line Thickness:</label>
          <input type="range" min="1" max="10" value={thickness} step="1" onChange={(e) => setThickness(parseFloat(e.target.value))} className="w-full"/>
        </div>
        <div className="control-group">
          <label className="block mb-2">Phase Offset:</label>
          <input type="range" min="0" max="360" value={phaseOffset * (180 / Math.PI)} step="1" onChange={(e) => setPhaseOffset((parseFloat(e.target.value) / 360) * (2 * Math.PI))} className="w-full"/>
        </div>
        <div className="control-group">
          <label className="block mb-2">Number of Lines:</label>
          <input type="range" min="1" max="100" value={numLines} step="1" onChange={(e) => setNumLines(parseInt(e.target.value, 10))} className="w-full"/>
        </div>
        <div className="control-group">
          <label className="block mb-2">Distance Between Lines:</label>
          <input type="range" min="1" max="200" value={distance} step="1" onChange={(e) => setDistance(parseFloat(e.target.value))} className="w-full"/>
        </div>
        <div className="control-group">
          <label className="block mb-2">Background Color:</label>
          <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-full"/>
        </div>
        <div className="control-group">
          <label className="block mb-2">Line Color:</label>
          <input type="color" value={lineColor} onChange={(e) => setLineColor(e.target.value)} className="w-full"/>
        </div>
        <div className="control-group">
          <label className="block mb-2">Use Palette:</label>
          <select value={selectedPalette} onChange={(e) => setSelectedPalette(e.target.value)} className="border p-2 rounded w-full">
            <option value="none">None</option>
            <option value="rainbow">Rainbow</option>
            <option value="pastel">Pastel</option>
          </select>
        </div>
        <div className="animation-buttons mt-4">
          <button onClick={startAnimation} className="bg-green-500 text-white p-2 rounded mr-2 w-half">Start</button>
          <button onClick={stopAnimation} className="bg-red-500 text-white p-2 rounded mr-2 w-half">Stop</button>
          <button onClick={resetAnimation} className="bg-gray-500 text-white p-2 rounded w-half">Reset</button>
        </div>
      </Collapse>
    </div>
  );
};

export default ControlPanel; */
