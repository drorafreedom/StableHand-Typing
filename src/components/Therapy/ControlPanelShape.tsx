// src/components/Therapy/ControlPanelShape.tsx

import React, { useState, useEffect } from 'react';
import { Collapse } from 'react-collapse';
import { db, storage } from '../../firebase/firebase';
import { useAuth } from '../../data/AuthContext';
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';
import Papa from 'papaparse';
import Slider from '../common/Slider';

interface Settings {
  shapeType: string;
  direction: string;
  rotationSpeed: number;
  rotationRadius: number;
  oscillationRange: number;
  angle: number;
  speed: number;
  size: number;
  numShapes: number;
  bgColor: string;
  shapeColor: string;
  secondColor?: string;
  palette: string;
  layoutSelect: string;
  rowOffset: number;
  columnOffset: number;
  rowDistance: number;
  columnDistance: number;
  [key: string]: any; // Extendable for additional properties
}

interface Message {
  message: string;
  type: 'success' | 'error';
}

interface ControlPanelShapeProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  startAnimation: () => void;
  stopAnimation: () => void;
  resetAnimation: () => void;
}

const ControlPanelShape: React.FC<ControlPanelShapeProps> = ({
  settings,
  setSettings,
  startAnimation,
  stopAnimation,
  resetAnimation,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const { currentUser } = useAuth();
  const [presetName, setPresetName] = useState<string>('');
  const [presetList, setPresetList] = useState<string[]>([]);
  const [message, setMessage] = useState<Message>({ message: '', type: 'success' });

  useEffect(() => {
    const fetchPresets = async () => {
      if (currentUser) {
        try {
          const userDocsRef = collection(db, `users/${currentUser.uid}/shape-animation-settings`);
          const querySnapshot = await getDocs(userDocsRef);
          const presets = querySnapshot.docs.map((doc) => doc.id);
          setPresetList(presets);
        } catch (err) {
          console.error('Error fetching preset names:', err);
        }
      }
    };
    fetchPresets();
  }, [currentUser]);

  const saveCurrentSettings = async () => {
    if (!currentUser) return;

    const timestamp = new Date();
    const localDateTime = timestamp.toLocaleString();
    const settingsWithTimestamp = {
      ...settings,
      userId: currentUser.uid,
      timestamp: timestamp.toISOString(),
      localDateTime,
    };

    try {
      const userDocRef = doc(db, `users/${currentUser.uid}/shape-animation-settings/current`);
      await setDoc(userDocRef, settingsWithTimestamp);

      const csvData = Object.keys(settingsWithTimestamp).map((key) => ({
        setting: key,
        value: settingsWithTimestamp[key],
      }));
      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

      const csvRef = ref(storage, `users/${currentUser.uid}/shape-animation-settings/current.csv`);
      await uploadBytes(csvRef, blob);

      setMessage({ message: 'Current settings saved successfully!', type: 'success' });
    } catch (err) {
      console.error('Error saving current settings:', err);
      setMessage({ message: 'Error saving current settings. Please try again.', type: 'error' });
    }
  };

  const savePresetSettings = async () => {
    if (!presetName || !currentUser) {
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
      localDateTime,
    };

    try {
      const userDocRef = doc(db, `users/${currentUser.uid}/shape-animation-settings/${presetName}`);
      await setDoc(userDocRef, settingsWithTimestamp);

      const csvData = Object.keys(settingsWithTimestamp).map((key) => ({
        setting: key,
        value: settingsWithTimestamp[key],
      }));
      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

      const csvRef = ref(storage, `users/${currentUser.uid}/shape-animation-settings/${presetName}.csv`);
      await uploadBytes(csvRef, blob);

      setMessage({ message: 'Preset settings saved successfully!', type: 'success' });
      if (!presetList.includes(presetName)) {
        setPresetList([...presetList, presetName]);
      }
    } catch (err) {
      console.error('Error saving preset settings:', err);
      setMessage({ message: 'Error saving preset settings. Please try again.', type: 'error' });
    }
  };

  const loadCurrentSettings = async () => {
    if (!currentUser) return;

    try {
      const userDocRef = doc(db, `users/${currentUser.uid}/shape-animation-settings/current`);
      const docSnapshot = await getDoc(userDocRef);

      if (docSnapshot.exists()) {
        const loadedSettings = docSnapshot.data() as Settings;
        setSettings(loadedSettings);
        setMessage({ message: 'Current settings loaded successfully!', type: 'success' });
      } else {
        setMessage({ message: 'No current settings found.', type: 'error' });
      }
    } catch (err) {
      console.error('Error loading current settings:', err);
      setMessage({ message: 'Error loading current settings. Please try again.', type: 'error' });
    }
  };

  const loadPresetSettings = async () => {
    if (!presetName || !currentUser) {
      setMessage({ message: 'Please provide the name of the preset to load.', type: 'error' });
      return;
    }

    try {
      const userDocRef = doc(db, `users/${currentUser.uid}/shape-animation-settings/${presetName}`);
      const docSnapshot = await getDoc(userDocRef);

      if (docSnapshot.exists()) {
        const loadedSettings = docSnapshot.data() as Settings;
        setSettings(loadedSettings);
        setMessage({ message: 'Preset settings loaded successfully!', type: 'success' });
      } else {
        setMessage({ message: 'No settings found with that preset name.', type: 'error' });
      }
    } catch (err) {
      console.error('Error loading preset settings:', err);
      setMessage({ message: 'Error loading preset settings. Please try again.', type: 'error' });
    }
  };

  return (
    <div className={`fixed right-4 top-2 p-4 rounded ${isOpen ? 'shadow-lg bg-transparent' : ''} w-60 z-50 h-full overflow-y-auto`}>
      <button onClick={() => setIsOpen(!isOpen)} className="mb-2 bg-gray-200 p-2 border rounded w-full">
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
            <button onClick={saveCurrentSettings} className="bg-blue-500 text-white p-2 rounded w-1/2">Save Current</button>
            <button onClick={loadCurrentSettings} className="bg-yellow-500 text-white p-2 rounded w-1/2">Load Current</button>
          </div>
          <div className="flex space-x-2">
            <button onClick={savePresetSettings} className="bg-blue-500 text-white p-2 rounded w-1/2">Save Preset</button>
            <button onClick={loadPresetSettings} className="bg-yellow-500 text-white p-2 rounded w-1/2">Load Preset</button>
          </div>
          <div className="flex space-x-2">
            <select onChange={(e) => setPresetName(e.target.value)} value={presetName} className="border p-2 rounded w-full">
              <option value="">Select Preset</option>
              {presetList.map((preset, index) => (
                <option key={index} value={preset}>{preset}</option>
              ))}
            </select>
          </div>
          {message.message && (
            <div className={`alert ${message.type === 'error' ? 'bg-red-500' : 'bg-green-500'} text-white p-2 rounded`}>
              {message.message}
            </div>
          )}
        </div>
      </Collapse>
    </div>
  );
};

export default ControlPanelShape;



//+++++++++++JS version+++++++++++++++++
 // src/components/Therapy/ControlPanelShape.jsx 
  // JS version

/* import React, { useState, useEffect } from 'react';
import { Collapse } from 'react-collapse';
import { db, storage } from '../../firebase/firebase';
import { useAuth } from '../../data/AuthContext';
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';
import Papa from 'papaparse';
import Slider from '../common/Slider';

const ControlPanelShape = ({
  settings, setSettings,
  startAnimation, stopAnimation, resetAnimation
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const { currentUser } = useAuth();
  const [presetName, setPresetName] = useState('');
  const [presetList, setPresetList] = useState([]);
  const [message, setMessage] = useState({ message: '', type: '' });

  useEffect(() => {
    const fetchPresets = async () => {
      if (currentUser) {
        try {
          const userDocsRef = collection(db, `users/${currentUser.uid}/shape-animation-settings`);
          const querySnapshot = await getDocs(userDocsRef);
          const presets = querySnapshot.docs.map(doc => doc.id);
          setPresetList(presets);
        } catch (err) {
          console.error('Error fetching preset names:', err);
        }
      }
    };
    fetchPresets();
  }, [currentUser]);

  const saveCurrentSettings = async () => {
    const timestamp = new Date();
    const localDateTime = timestamp.toLocaleString();
    const settingsWithTimestamp = {
      ...settings,
      userId: currentUser.uid,
      timestamp: timestamp.toISOString(),
      localDateTime
    };

    try {
      const userDocRef = doc(db, `users/${currentUser.uid}/shape-animation-settings/current`);
      await setDoc(userDocRef, settingsWithTimestamp);

      const csvData = Object.keys(settingsWithTimestamp).map(key => ({
        setting: key,
        value: settingsWithTimestamp[key]
      }));
      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

      const csvRef = ref(storage, `users/${currentUser.uid}/shape-animation-settings/current.csv`);
      await uploadBytes(csvRef, blob);

      setMessage({ message: 'Current settings saved successfully!', type: 'success' });
    } catch (err) {
      console.error('Error saving current settings:', err);
      setMessage({ message: 'Error saving current settings. Please try again.', type: 'error' });
    }
  };

  const savePresetSettings = async () => {
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
      const userDocRef = doc(db, `users/${currentUser.uid}/shape-animation-settings/${presetName}`);
      await setDoc(userDocRef, settingsWithTimestamp);

      const csvData = Object.keys(settingsWithTimestamp).map(key => ({
        setting: key,
        value: settingsWithTimestamp[key]
      }));
      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

      const csvRef = ref(storage, `users/${currentUser.uid}/shape-animation-settings/${presetName}.csv`);
      await uploadBytes(csvRef, blob);

      setMessage({ message: 'Preset settings saved successfully!', type: 'success' });
      if (!presetList.includes(presetName)) {
        setPresetList([...presetList, presetName]);
      }
    } catch (err) {
      console.error('Error saving preset settings:', err);
      setMessage({ message: 'Error saving preset settings. Please try again.', type: 'error' });
    }
  };

  const loadCurrentSettings = async () => {
    try {
      const userDocRef = doc(db, `users/${currentUser.uid}/shape-animation-settings/current`);
      const docSnapshot = await getDoc(userDocRef);

      if (docSnapshot.exists()) {
        const loadedSettings = docSnapshot.data();
        setSettings(loadedSettings);
        setMessage({ message: 'Current settings loaded successfully!', type: 'success' });
      } else {
        setMessage({ message: 'No current settings found.', type: 'error' });
      }
    } catch (err) {
      console.error('Error loading current settings:', err);
      setMessage({ message: 'Error loading current settings. Please try again.', type: 'error' });
    }
  };

  const loadPresetSettings = async () => {
    if (!presetName) {
      setMessage({ message: 'Please provide the name of the preset to load.', type: 'error' });
      return;
    }

    try {
      const userDocRef = doc(db, `users/${currentUser.uid}/shape-animation-settings/${presetName}`);
      const docSnapshot = await getDoc(userDocRef);

      if (docSnapshot.exists()) {
        const loadedSettings = docSnapshot.data();
        setSettings(loadedSettings);
        setMessage({ message: 'Preset settings loaded successfully!', type: 'success' });
      } else {
        setMessage({ message: 'No settings found with that preset name.', type: 'error' });
      }
    } catch (err) {
      console.error('Error loading preset settings:', err);
      setMessage({ message: 'Error loading preset settings. Please try again.', type: 'error' });
    }
  };

  const handleColorChange = (e) => {
    const { name, value } = e.target;
    setSettings((prevSettings) => ({
      ...prevSettings,
      [name]: value,
    }));
  };

  return (
    <div className={`fixed right-4 top-2 p-4 rounded ${isOpen ? 'shadow-lg bg-transparent' : ''} w-60 z-50 h-full overflow-y-auto`}>
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
            <button onClick={saveCurrentSettings} className="bg-blue-500 text-white p-2 rounded w-1/2">Save Current</button>
            <button onClick={loadCurrentSettings} className="bg-yellow-500 text-white p-2 rounded w-1/2">Load Current</button>
          </div>
          <div className="flex space-x-2">
            <button onClick={savePresetSettings} className="bg-blue-500 text-white p-2 rounded w-1/2">Save Preset</button>
            <button onClick={loadPresetSettings} className="bg-yellow-500 text-white p-2 rounded w-1/2">Load Preset</button>
          </div>
          <div className="flex space-x-2">
            <select onChange={(e) => setPresetName(e.target.value)} value={presetName} className="border p-2 rounded w-full">
              <option value="">Select Preset</option>
              {presetList.map((preset, index) => (
                <option key={index} value={preset}>{preset}</option>
              ))}
            </select>
          </div>
          {message.message && (
            <div className={`alert ${message.type === 'error' ? 'bg-red-500' : 'bg-green-500'} text-white p-2 rounded`}>
              {message.message}
            </div>
          )}
          <div className="control-group">
            <label className="block mb-2">Select Shape:</label>
            <select name="shapeType" value={settings.shapeType} onChange={(e) => setSettings({ ...settings, shapeType: e.target.value })} className="border p-2 rounded w-full">
              <option value="circle">Circle</option>
              <option value="square">Square</option>
              <option value="triangle">Triangle</option>
              <option value="chevron">Chevron</option>
              <option value="diamond">Diamond</option>
            </select>
          </div>
          <div className="control-group">
            <label className="block mb-2">Direction:</label>
            <select name="direction" value={settings.direction} onChange={(e) => setSettings({ ...settings, direction: e.target.value })} className="border p-2 rounded w-full">
              <option value="static">Static</option>
              <option value="up">Up</option>
              <option value="down">Down</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="oscillateUpDown">Oscillate Up and Down</option>
              <option value="oscillateRightLeft">Oscillate Right and Left</option>
              <option value="circular">Circular</option>
              <option value="3DVertical">3D Vertical</option>
              <option value="3DHorizontal">3D Horizontal</option>
            </select>
          </div>

          {settings.direction === 'circular' && (
            <>
              <div className="control-group">
                <label className="block mb-2">Rotation Speed:</label>
                <Slider
                  min={0.01}
                  max={1}
                  step={0.01}
                  value={settings.rotationSpeed}
                  onChange={(value) => setSettings({ ...settings, rotationSpeed: value })}
                  listId="rotationSpeedSteps"
                />
              </div>
              <div className="control-group">
                <label className="block mb-2">Rotation Radius:</label>
                <Slider
                  min={10}
                  max={500}
                  value={settings.rotationRadius}
                  onChange={(value) => setSettings({ ...settings, rotationRadius: value })}
                  listId="rotationRadiusSteps"
                />
              </div>
            </>
          )}

          {['oscillateUpDown', 'oscillateRightLeft', '3DVertical', '3DHorizontal'].includes(settings.direction) && (
            <div className="control-group">
              <label className="block mb-2">Oscillation Range:</label>
              <Slider
                min={0}
                max={settings.direction === 'oscillateUpDown' || settings.direction === '3DVertical' ? window.innerHeight / 4 : window.innerWidth / 4}
                value={settings.oscillationRange}
                onChange={(value) => setSettings({ ...settings, oscillationRange: value })}
                listId="oscillationRangeSteps"
              />
            </div>
          )}

          <div className="control-group">
            <label className="block mb-2">Angle:</label>
            <Slider
              min={0}
              max={360}
              step={1}
              value={settings.angle * (180 / Math.PI)}
              onChange={(value) => setSettings({ ...settings, angle: value * (Math.PI / 180) })}
              listId="angleSteps"
            />
          </div>

          <div className="control-group">
            <label className="block mb-2">Speed:</label>
            <Slider
              min={1}
              max={20}
              value={settings.speed}
              onChange={(value) => setSettings({ ...settings, speed: value })}
              listId="speedSteps"
            />
          </div>

          <div className="control-group">
            <label className="block mb-2">Size:</label>
            <Slider
              min={20}
              max={200}
              value={settings.size}
              onChange={(value) => setSettings({ ...settings, size: value })}
              listId="sizeSteps"
            />
          </div>

          {settings.layoutSelect === 'random' && (
            <div className="control-group">
              <label className="block mb-2">Number of Shapes:</label>
              <Slider
                min={1}
                max={100}
                value={settings.numShapes}
                onChange={(value) => setSettings({ ...settings, numShapes: value })}
                listId="numShapesSteps"
              />
            </div>
          )}

          <div className="control-group">
            <label className="block mb-2">Background Color:</label>
            <input
              type="color"
              name="bgColor"
              value={settings.bgColor}
              onChange={handleColorChange}
              className="w-full"
            />
          </div>

          <div className="control-group">
            <label className="block mb-2">Shape Color:</label>
            <input
              type="color"
              name="shapeColor"
              value={settings.shapeColor}
              onChange={handleColorChange}
              className="w-full"
            />
          </div>

          {settings.layoutSelect === 'checkboard' && (
            <div className="control-group">
              <label className="block mb-2">Second Shape Color:</label>
              <input
                type="color"
                name="secondColor"
                value={settings.secondColor}
                onChange={handleColorChange}
                className="w-full"
              />
            </div>
          )}

          <div className="control-group">
            <label className="block mb-2">Use Palette:</label>
            <select value={settings.palette} onChange={(e) => setSettings({ ...settings, palette: e.target.value })} className="border p-2 rounded w-full">
              <option value="none">None</option>
              <option value="rainbow">Rainbow</option>
              <option value="pastel">Pastel</option>
            </select>
          </div>
          <div className="control-group">
            <label className="block mb-2">Select Layout:</label>
            <select value={settings.layoutSelect} onChange={(e) => setSettings({ ...settings, layoutSelect: e.target.value })} className="border p-2 rounded w-full">
              <option value="random">random</option>
              <option value="regular">regular</option>
              <option value="checkboard">checkboard</option>
            </select>
          </div>
          {settings.layoutSelect !== 'random' && (
            <>
              <div className="control-group">
                <label className="block mb-2">Layout:</label>
                <select value={settings.layoutSelect} onChange={(e) => setSettings({ ...settings, layoutSelect: e.target.value })} className="border p-2 rounded w-full">
                  <option value="regular">Regular</option>
                  <option value="checkboard">Checkboard</option>
                </select>
              </div>
              
              <div className="control-group">
                <label className="block mb-2">Row Offset:</label>
                <Slider
                  min={0}
                  max={100}
                  value={settings.rowOffset}
                  onChange={(value) => setSettings({ ...settings, rowOffset: value })}
                  listId="rowOffsetSteps"
                />
              </div>

              <div className="control-group">
                <label className="block mb-2">Column Offset:</label>
                <Slider
                  min={0}
                  max={100}
                  value={settings.columnOffset}
                  onChange={(value) => setSettings({ ...settings, columnOffset: value })}
                  listId="columnOffsetSteps"
                />
              </div>

              <div className="control-group">
                <label className="block mb-2">Row Distance:</label>
                <Slider
                  min={0}
                  max={100}
                  value={settings.rowDistance}
                  onChange={(value) => setSettings({ ...settings, rowDistance: value })}
                  listId="rowDistanceSteps"
                />
              </div>

              <div className="control-group">
                <label className="block mb-2">Column Distance:</label>
                <Slider
                  min={0}
                  max={100}
                  value={settings.columnDistance}
                  onChange={(value) => setSettings({ ...settings, columnDistance: value })}
                  listId="columnDistanceSteps"
                />
              </div>
            </>
          )}
        </div>
      </Collapse>
    </div>
  );
};

export default ControlPanelShape; */

/* 
//last good one with all the saving presets 
import { Collapse } from 'react-collapse';
import { db, storage } from '../../firebase/firebase';
import { useAuth } from '../../data/AuthContext';
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';
import Papa from 'papaparse';
import Slider from '../common/Slider';

const ControlPanelShape = ({
  settings, setSettings,
  startAnimation, stopAnimation, resetAnimation
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const { currentUser } = useAuth();
  const [presetName, setPresetName] = useState('');
  const [presetList, setPresetList] = useState([]);
  const [message, setMessage] = useState({ message: '', type: '' });

  useEffect(() => {
    const fetchPresets = async () => {
      if (currentUser) {
        try {
          const userDocsRef = collection(db, `users/${currentUser.uid}/shape-animation-settings`);
          const querySnapshot = await getDocs(userDocsRef);
          const presets = querySnapshot.docs.map(doc => doc.id);
          setPresetList(presets);
        } catch (err) {
          console.error('Error fetching preset names:', err);
        }
      }
    };
    fetchPresets();
  }, [currentUser]);

  // Save current settings to Firestore
  const saveCurrentSettings = async () => {
    const timestamp = new Date();
    const localDateTime = timestamp.toLocaleString();
    const settingsWithTimestamp = {
      ...settings,
      userId: currentUser.uid,
      timestamp: timestamp.toISOString(),
      localDateTime
    };

    try {
      const userDocRef = doc(db, `users/${currentUser.uid}/shape-animation-settings/current`);
      await setDoc(userDocRef, settingsWithTimestamp);

      const csvData = Object.keys(settingsWithTimestamp).map(key => ({
        setting: key,
        value: settingsWithTimestamp[key]
      }));
      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

      const csvRef = ref(storage, `users/${currentUser.uid}/shape-animation-settings/current.csv`);
      await uploadBytes(csvRef, blob);

      setMessage({ message: 'Current settings saved successfully!', type: 'success' });
    } catch (err) {
      console.error('Error saving current settings:', err);
      setMessage({ message: 'Error saving current settings. Please try again.', type: 'error' });
    }
  };

  // Save settings as preset to Firestore
  const savePresetSettings = async () => {
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
      const userDocRef = doc(db, `users/${currentUser.uid}/shape-animation-settings/${presetName}`);
      await setDoc(userDocRef, settingsWithTimestamp);

      const csvData = Object.keys(settingsWithTimestamp).map(key => ({
        setting: key,
        value: settingsWithTimestamp[key]
      }));
      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

      const csvRef = ref(storage, `users/${currentUser.uid}/shape-animation-settings/${presetName}.csv`);
      await uploadBytes(csvRef, blob);

      setMessage({ message: 'Preset settings saved successfully!', type: 'success' });
      if (!presetList.includes(presetName)) {
        setPresetList([...presetList, presetName]);
      }
    } catch (err) {
      console.error('Error saving preset settings:', err);
      setMessage({ message: 'Error saving preset settings. Please try again.', type: 'error' });
    }
  };

  // Load current settings from Firestore
  const loadCurrentSettings = async () => {
    try {
      const userDocRef = doc(db, `users/${currentUser.uid}/shape-animation-settings/current`);
      const docSnapshot = await getDoc(userDocRef);

      if (docSnapshot.exists()) {
        const loadedSettings = docSnapshot.data();
        setSettings(loadedSettings);
        setMessage({ message: 'Current settings loaded successfully!', type: 'success' });
      } else {
        setMessage({ message: 'No current settings found.', type: 'error' });
      }
    } catch (err) {
      console.error('Error loading current settings:', err);
      setMessage({ message: 'Error loading current settings. Please try again.', type: 'error' });
    }
  };

  // Load preset settings from Firestore
  const loadPresetSettings = async () => {
    if (!presetName) {
      setMessage({ message: 'Please provide the name of the preset to load.', type: 'error' });
      return;
    }

    try {
      const userDocRef = doc(db, `users/${currentUser.uid}/shape-animation-settings/${presetName}`);
      const docSnapshot = await getDoc(userDocRef);

      if (docSnapshot.exists()) {
        const loadedSettings = docSnapshot.data();
        setSettings(loadedSettings);
        setMessage({ message: 'Preset settings loaded successfully!', type: 'success' });
      } else {
        setMessage({ message: 'No settings found with that preset name.', type: 'error' });
      }
    } catch (err) {
      console.error('Error loading preset settings:', err);
      setMessage({ message: 'Error loading preset settings. Please try again.', type: 'error' });
    }
  };

  const handleColorChange = (e) => {
    const { name, value } = e.target;
    setSettings((prevSettings) => ({
      ...prevSettings,
      [name]: value,
    }));
  };

  return (
    <div className={`fixed right-4 top-2 p-4 rounded ${isOpen ? 'shadow-lg bg-transparent' : ''} w-60 z-50 h-full overflow-y-auto`}>
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
            <button onClick={saveCurrentSettings} className="bg-blue-500 text-white p-2 rounded w-1/2">Save Current</button>
            <button onClick={loadCurrentSettings} className="bg-yellow-500 text-white p-2 rounded w-1/2">Load Current</button>
          </div>
          <div className="flex space-x-2">
            <button onClick={savePresetSettings} className="bg-blue-500 text-white p-2 rounded w-1/2">Save Preset</button>
            <button onClick={loadPresetSettings} className="bg-yellow-500 text-white p-2 rounded w-1/2">Load Preset</button>
          </div>
          <div className="flex space-x-2">
            <select onChange={(e) => setPresetName(e.target.value)} value={presetName} className="border p-2 rounded w-full">
              <option value="">Select Preset</option>
              {presetList.map((preset, index) => (
                <option key={index} value={preset}>{preset}</option>
              ))}
            </select>
          </div>
          {message.message && (
            <div className={`alert ${message.type === 'error' ? 'bg-red-500' : 'bg-green-500'} text-white p-2 rounded`}>
              {message.message}
            </div>
          )}
          <div className="control-group">
            <label className="block mb-1 text-xs">Select Shape:</label>
            <select name="shapeType" value={settings.shapeType} onChange={(e) => setSettings({ ...settings, shapeType: e.target.value })} className="border p-2 rounded w-full">
              <option value="circle">Circle</option>
              <option value="square">Square</option>
              <option value="triangle">Triangle</option>
              <option value="chevron">Chevron</option>
              <option value="diamond">Diamond</option>
            </select>
          </div>
          <div className="control-group">
            <label className="block mb-1 text-xs">Direction:</label>
            <select name="direction" value={settings.direction} onChange={(e) => setSettings({ ...settings, direction: e.target.value })} className="border p-2 rounded w-full">
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
                <Slider
                  min={0.01}
                  max={1}
                  step={0.01}
                  value={settings.rotationSpeed}
                  onChange={(value) => setSettings({ ...settings, rotationSpeed: value })}
                  listId="rotationSpeedSteps"
                />
              </div>
              <div className="control-group">
                <label className="block mb-2">Rotation Radius:</label>
                <Slider
                  min={10}
                  max={500}
                  value={settings.rotationRadius}
                  onChange={(value) => setSettings({ ...settings, rotationRadius: value })}
                  listId="rotationRadiusSteps"
                />
              </div>
            </>
          )}

          {['oscillateUpDown', 'oscillateRightLeft'].includes(settings.direction) && (
            <div className="control-group">
              <label className="block mb-2">Oscillation Range:</label>
              <Slider
                min={0}
                max={settings.direction === 'oscillateUpDown' ? window.innerHeight / 2 : window.innerWidth / 2}
                value={settings.oscillationRange}
                onChange={(value) => setSettings({ ...settings, oscillationRange: value })}
                listId="oscillationRangeSteps"
              />
            </div>
          )}

          <div className="control-group">
            <label className="block mb-2">Angle:</label>
            <Slider
              min={0}
              max={360}
              step={1}
              value={settings.angle * (180 / Math.PI)}
              onChange={(value) => setSettings({ ...settings, angle: value * (Math.PI / 180) })}
              listId="angleSteps"
            />
          </div>

          <div className="control-group">
            <label className="block mb-2">Speed:</label>
            <Slider
              min={1}
              max={20}
              value={settings.speed}
              onChange={(value) => setSettings({ ...settings, speed: value })}
              listId="speedSteps"
            />
          </div>

          <div className="control-group">
            <label className="block mb-2">Size:</label>
            <Slider
              min={20}
              max={200}
              value={settings.size}
              onChange={(value) => setSettings({ ...settings, size: value })}
              listId="sizeSteps"
            />
          </div>

          {settings.layoutSelect === 'random' && (
            <div className="control-group">
              <label className="block mb-2">Number of Shapes:</label>
              <Slider
                min={1}
                max={100}
                value={settings.numShapes}
                onChange={(value) => setSettings({ ...settings, numShapes: value })}
                listId="numShapesSteps"
              />
            </div>
          )}

          <div className="control-group">
            <label className="block mb-2">Background Color:</label>
            <input
              type="color"
              name="bgColor"
              value={settings.bgColor}
              onChange={handleColorChange}
              className="w-full"
            />
          </div>

          <div className="control-group">
            <label className="block mb-2">Shape Color:</label>
            <input
              type="color"
              name="shapeColor"
              value={settings.shapeColor}
              onChange={handleColorChange}
              className="w-full"
            />
          </div>

          {settings.layoutSelect === 'checkboard' && (
            <div className="control-group">
              <label className="block mb-2">Second Shape Color:</label>
              <input
                type="color"
                name="secondColor"
                value={settings.secondColor}
                onChange={handleColorChange}
                className="w-full"
              />
            </div>
          )}

          <div className="control-group">
            <label className="block mb-2">Use Palette:</label>
            <select value={settings.palette} onChange={(e) => setSettings({ ...settings, palette: e.target.value })} className="border p-2 rounded w-full">
              <option value="none">None</option>
              <option value="rainbow">Rainbow</option>
              <option value="pastel">Pastel</option>
            </select>
          </div>
          <div className="control-group">
            <label className="block mb-2">Select Layout:</label>
            <select value={settings.layoutSelect} onChange={(e) => setSettings({ ...settings, palette: e.target.value })} className="border p-2 rounded w-full">
              <option value="random">random</option>
              <option value="regular">regular</option>
              <option value="checkboard">checkboard</option>
            </select>
          </div>
          {settings.layoutSelect !== 'random' && (
            <>
              <div className="control-group">
                <label className="block mb-2">Layout:</label>
                <select value={settings.layoutSelect} onChange={(e) => setSettings({ ...settings, layoutSelect: e.target.value })} className="border p-2 rounded w-full">
                  <option value="regular">Regular</option>
                  <option value="checkboard">Checkboard</option>
                </select>
              </div>
              
              <div className="control-group">
                <label className="block mb-2">Row Offset:</label>
                <Slider
                  min={0}
                  max={100}
                  value={settings.rowOffset}
                  onChange={(value) => setSettings({ ...settings, rowOffset: value })}
                  listId="rowOffsetSteps"
                />
              </div>

              <div className="control-group">
                <label className="block mb-2">Column Offset:</label>
                <Slider
                  min={0}
                  max={100}
                  value={settings.columnOffset}
                  onChange={(value) => setSettings({ ...settings, columnOffset: value })}
                  listId="columnOffsetSteps"
                />
              </div>

              <div className="control-group">
                <label className="block mb-2">Row Distance:</label>
                <Slider
                  min={0}
                  max={100}
                  value={settings.rowDistance}
                  onChange={(value) => setSettings({ ...settings, rowDistance: value })}
                  listId="rowDistanceSteps"
                />
              </div>

              <div className="control-group">
                <label className="block mb-2">Column Distance:</label>
                <Slider
                  min={0}
                  max={100}
                  value={settings.columnDistance}
                  onChange={(value) => setSettings({ ...settings, columnDistance: value })}
                  listId="columnDistanceSteps"
                />
              </div>
            </>
          )}
        </div>
      </Collapse>
    </div>
  );
};

export default ControlPanelShape;
 */







/* import React, { useState } from 'react';
import { Collapse } from 'react-collapse';

const ControlPanelShape = ({ settings, setSettings, startAnimation, stopAnimation, resetAnimation }) => {
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
            <label className="block mb-2">Select Shape:</label>
            <select value={settings.shapeType} onChange={(e) => setSettings({ ...settings, shapeType: e.target.value })} className="border p-2 rounded w-full">
              <option value="circle">Circle</option>
              <option value="square">Square</option>
              <option value="triangle">Triangle</option>
              <option value="chevron">Chevron</option>
              <option value="diamond">Diamond</option>
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
                <input type="range" min="0.01" max="1" step="0.01" value={settings.rotationSpeed} onChange={(e) => setSettings({ ...settings, rotationSpeed: parseFloat(e.target.value) })} className="w-full"/>
                <span>{settings.rotationSpeed.toFixed(2)}</span>
              </div>
              <div className="control-group">
                <label className="block mb-2">Rotation Radius:</label>
                <input type="range" min="10" max="500" value={settings.rotationRadius} onChange={(e) => setSettings({ ...settings, rotationRadius: parseFloat(e.target.value) })} className="w-full"/>
                <span>{settings.rotationRadius}</span>
              </div>
            </>
          )}
          {(settings.direction === 'oscillateUpDown' || settings.direction === 'oscillateRightLeft') && (
            <div className="control-group">
              <label className="block mb-2">Oscillation Range :</label>
              <input type="range" min="0" max={Math.min(window.innerWidth / 2, window.innerHeight / 2)} value={settings. oscillationRange } onChange={(e) => setSettings({ ...settings,  oscillationRange : parseFloat(e.target.value) })} className="w-full"/>
              <span>{settings. oscillationRange }</span>
            </div>
          )}
          
          <div className="control-group">
            <label className="block mb-2">Angle:</label>
            <input type="range" min="0" max="360" value={settings.angle} step="1" onChange={(e) => setSettings({ ...settings, angle: parseFloat(e.target.value) })} className="w-full"/>
            <span>{settings.angle}</span>
          </div>
          <div className="control-group">
            <label className="block mb-2">Speed:</label>
            <input type="range" min="1" max="20" value={settings.speed} onChange={(e) => setSettings({ ...settings, speed: parseFloat(e.target.value) })} className="w-full"/>
            <span>{settings.speed}</span>
          </div>
          <div className="control-group">
            <label className="block mb-2">Size:</label>
            <input type="range" min="20" max="200" value={settings.size} onChange={(e) => setSettings({ ...settings, size: parseFloat(e.target.value) })} className="w-full"/>
            <span>{settings.size}</span>
          </div>
          {settings.layoutSelect !== 'random' && (
            <>
              <div className="control-group">
                <label className="block mb-2">Row Offset:</label>
                <input type="range" min="0" max="100" value={settings.rowOffset} onChange={(e) => setSettings({ ...settings, rowOffset: parseFloat(e.target.value) })} className="w-full"/>
                <span>{settings.rowOffset}</span>
              </div>
              <div className="control-group">
                <label className="block mb-2">Column Offset:</label>
                <input type="range" min="0" max="100" value={settings.columnOffset} onChange={(e) => setSettings({ ...settings, columnOffset: parseFloat(e.target.value) })} className="w-full"/>
                <span>{settings.columnOffset}</span>
              </div>
              <div className="control-group">
                <label className="block mb-2">Row Distance:</label>
                <input type="range" min="0" max="100" value={settings.rowDistance} onChange={(e) => setSettings({ ...settings, rowDistance: parseFloat(e.target.value) })} className="w-full"/>
                <span>{settings.rowDistance}</span>
              </div>
              <div className="control-group">
                <label className="block mb-2">Column Distance:</label>
                <input type="range" min="0" max="100" value={settings.columnDistance} onChange={(e) => setSettings({ ...settings, columnDistance: parseFloat(e.target.value) })} className="w-full"/>
                <span>{settings.columnDistance}</span>
              </div>
            </>
          )}
          <div className="control-group">
            <label className="block mb-2">Background Color:</label>
            <input type="color" value={settings.bgColor} onChange={(e) => setSettings({ ...settings, bgColor: e.target.value })} className="w-full"/>
          </div>
          <div className="control-group">
            <label className="block mb-2">Shape Color:</label>
            <input type="color" value={settings.shapeColor} onChange={(e) => setSettings({ ...settings, shapeColor: e.target.value })} className="w-full"/>
          </div>
          {settings.layoutSelect === 'checkboard' && (
            <div className="control-group">
              <label className="block mb-2">Second Shape Color:</label>
              <input type="color" value={settings.secondColor} onChange={(e) => setSettings({ ...settings, secondColor: e.target.value })} className="w-full"/>
            </div>
          )}
          <div className="control-group">
            <label className="block mb-2">Use Palette:</label>
            <select value={settings.palette} onChange={(e) => setSettings({ ...settings, palette: e.target.value })} className="border p-2 rounded w-full">
              <option value="none">None</option>
              <option value="rainbow">Rainbow</option>
              <option value="pastel">Pastel</option>
            </select>
          </div>
          {settings.layoutSelect !== 'random' && (
            <div className="control-group">
              <label className="block mb-2">Layout:</label>
              <select value={settings.layoutSelect} onChange={(e) => setSettings({ ...settings, layoutSelect: e.target.value })} className="border p-2 rounded w-full">
                <option value="regular">Regular</option>
                <option value="checkboard">Checkboard</option>
              </select>
            </div>
          )}
        </div>
      </Collapse>
    </div>

    
  );
};

export default ControlPanelShape; */


/* 
 import React, { useState } from 'react';
import { Collapse } from 'react-collapse';

const ControlPanelShape = ({ settings, setSettings, startAnimation, stopAnimation, resetAnimation }) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    const parsedValue = type === 'number' ? parseFloat(value) : value;
    setSettings((prevSettings) => ({
      ...prevSettings,
      [name]: parsedValue,
    }));
  };

  const handleColorChange = (e) => {
    const { name, value } = e.target;
    setSettings((prevSettings) => ({
      ...prevSettings,
      [name]: value,
    }));
  };

  const showRotationControls = settings.direction === 'circular';
  const showOscillationControls = settings.direction === 'oscillateUpDown' || settings.direction === 'oscillateRightLeft';
  const showRowColumnControls = settings.layoutSelect !== 'random';
  const showSecondColor = settings.layoutSelect === 'checkboard';

  return (
    <div className={`fixed right-4 top-2 p-4 rounded ${isOpen ? 'shadow-lg bg-transparent' : ''} w-60 z-50 h-full overflow-y-auto`}>
      <button onClick={() => setIsOpen(!isOpen)} className="mb-2 bg-gray-200 p-2 border p-2 rounded w-full">
        {isOpen ? 'Collapse Controls' : 'Expand Controls'}
      </button>
      <Collapse isOpened={isOpen}>
         <div className="animation-buttons mt-4">
          <button onClick={startAnimation} className="bg-green-500 text-s--white p-2 rounded mr-2 w-half">Start</button>
          <button onClick={stopAnimation} className="bg-red-500 text-s-white p-2 rounded mr-2 w-half">Stop</button>
          <button onClick={resetAnimation} className="bg-gray-500 text-s-white p-2 rounded w-half">Reset</button>
        </div>
         <div className="control-group">
          <label className=" block mb-1 text-xs">Select Shape:</label>
          <select name="shapeType" value={settings.shapeType} onChange={handleInputChange} className="border p-2 rounded w-full">
            <option value="circle">Circle</option>
            <option value="square">Square</option>
            <option value="triangle">Triangle</option>
            <option value="chevron">Chevron</option>
            <option value="diamond">Diamond</option>
          </select>
        </div>
        <div className="control-group">
          <label className=" block mb-1 text-xs">Direction:</label>
          <select name="direction" value={settings.direction} onChange={handleInputChange} className="border p-2 rounded w-full">
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
        {showRotationControls && (
          <>
            <div className="control-group">
              <label className=" block mb-1 text-xs">Rotation Speed:</label>
              <input type="range" name="rotationSpeed" min="0.01" max="0.1" step="0.01" value={settings.rotationSpeed} onChange={handleInputChange} className="w-full" />
            </div>
            <div className="control-group">
              <label className=" block mb-1 text-xs">Rotation Radius:</label>
              <input type="range" name="rotationRadius" min="10" max="300" value={settings.rotationRadius} onChange={handleInputChange} className="w-full" />
            </div>
          </>
        )}
        {showOscillationControls && (
          <div className="control-group">
            <label className=" block mb-1 text-xs">Oscillation Range :</label>
            <input type="range" name=" oscillationRange " min="0" max={Math.min(window.innerWidth / 2, window.innerHeight / 2)} value={settings. oscillationRange } onChange={handleInputChange} className="w-full" />
          </div>
        )}
        <div className="control-group">
          <label className=" block mb-1 text-xs">Angle:</label>
          <input type="range" name="angle" min="0" max="360" value={settings.angle} step="1" onChange={handleInputChange} className="w-full" />
        </div>
        <div className="control-group">
          <label className=" block mb-1 text-xs">Speed:</label>
          <input type="range" name="speed" min="1" max="20" value={settings.speed} onChange={handleInputChange} className="w-full" />
        </div>
        <div className="control-group">
          <label className=" block mb-1 text-xs">Size:</label>
          <input type="range" name="size" min="20" max="200" value={settings.size} onChange={handleInputChange} className="w-full" />
        </div>
        {!showRowColumnControls && (
          <div className="control-group">
            <label className=" block mb-1 text-xs">Number of Shapes:</label>
            <input type="range" name="numShapes" min="1" max="100" value={settings.numShapes} onChange={handleInputChange} className="w-full" />
          </div>
        )}
        <div className="control-group">
          <label className=" block mb-1 text-xs">Background Color:</label>
          <input type="color" name="bgColor" value={settings.bgColor} onChange={handleColorChange} className="w-full" />
        </div>
        <div className="control-group">
          <label className=" block mb-1 text-xs">Shape Color:</label>
          <input type="color" name="shapeColor" value={settings.shapeColor} onChange={handleColorChange} className="w-full" />
        </div>
        {showSecondColor && (
          <div className="control-group">
            <label className=" block mb-1 text-xs">Second Shape Color:</label>
            <input type="color" name="secondColor" value={settings.secondColor} onChange={handleColorChange} className="w-full" />
          </div>
        )}
        <div className="control-group">
          <label className=" block mb-1 text-xs">Use Palette:</label>
          <select name="palette" value={settings.palette} onChange={handleInputChange} className="border p-2 rounded w-full">
            <option value="none">None</option>
            <option value="rainbow">Rainbow</option>
            <option value="pastel">Pastel</option>
          </select>
        </div>
        {showRowColumnControls && (
          <>
            <div className="control-group">
              <label className=" block mb-1 text-xs">Row Offset:</label>
              <input type="range" name="rowOffset" min="0" max="100" value={settings.rowOffset} onChange={handleInputChange} className="w-full" />
            </div>
            <div className="control-group">
              <label className=" block mb-1 text-xs">Column Offset:</label>
              <input type="range" name="columnOffset" min="0" max="100" value={settings.columnOffset} onChange={handleInputChange} className="w-full" />
            </div>
            <div className="control-group">
              <label className=" block mb-1 text-xs">Row Distance:</label>
              <input type="range" name="rowDistance" min="0" max="100" value={settings.rowDistance} onChange={handleInputChange} className="w-full" />
            </div>
            <div className="control-group">
              <label className=" block mb-1 text-xs">Column Distance:</label>
              <input type="range" name="columnDistance" min="0" max="100" value={settings.columnDistance} onChange={handleInputChange} className="w-full" />
            </div>
          </>
        )}
        <div className="control-group">
          <label className=" block mb-1 text-xs">Layout:</label>
          <select name="layoutSelect" value={settings.layoutSelect} onChange={handleInputChange} className="border p-2 rounded w-full">
            <option value="random">Random</option>
            <option value="regular">Regular</option>
            <option value="checkboard">Checkboard</option>
          </select>
        </div>
      
      </Collapse>
    </div>
  );
};

export default ControlPanelShape;
  */