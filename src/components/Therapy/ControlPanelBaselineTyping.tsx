import React, { useState, useEffect } from 'react';
import { Collapse } from 'react-collapse';
import { db, storage } from '../../firebase/firebase';
import { useAuth } from '../../data/AuthContext';
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';
import Papa from 'papaparse';
import Slider  from '../common/Slider';
 
interface ControlPanelBaselineTypingProps {
  settings: any; // Replace with an explicit interface for settings if available
  setSettings: React.Dispatch<React.SetStateAction<any>>; // Replace `any` with your settings type
  // startAnimation: () => void;
  // stopAnimation: () => void;
  // resetAnimation: () => void;
}

const ControlPanelBaselineTyping: React.FC<ControlPanelBaselineTypingProps> = ({
  settings,
  setSettings,
  // startAnimation,
  // stopAnimation,
  // resetAnimation,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const { currentUser } = useAuth();
  const [presetName, setPresetName] = useState<string>('');
  const [presetList, setPresetList] = useState<string[]>([]);
  const [message, setMessage] = useState<{ message: string; type: 'error' | 'success' }>({ message: '', type: 'success' });

  useEffect(() => {
    const fetchPresets = async () => {
      try {
        const userDocsRef = collection(db, `users/${currentUser.uid}/animation-settings`);
        const querySnapshot = await getDocs(userDocsRef);
        const presets = querySnapshot.docs.map((doc) => doc.id);
        setPresetList(presets);
      } catch (err) {
        console.error('Error fetching preset names:', err);
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
      localDateTime,
    };

    /* try {
      const userDocRef = doc(db, `users/${currentUser.uid}/animation-settings/current`);
      await setDoc(userDocRef, settingsWithTimestamp);

      const csvData = Object.keys(settingsWithTimestamp).map((key) => ({
        setting: key,
        value: settingsWithTimestamp[key],
      }));
      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

      const csvRef = ref(storage, `users/${currentUser.uid}/animation-settings/current.csv`);
      await uploadBytes(csvRef, blob);

      setMessage({ message: 'Current settings saved successfully!', type: 'success' });
    } catch (err) {
      console.error('Error saving current settings:', err);
      setMessage({ message: 'Error saving current settings. Please try again.', type: 'error' });
    } */
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
      localDateTime,
    };

    try {
      const userDocRef = doc(db, `users/${currentUser.uid}/animation-settings/${presetName}`);
      await setDoc(userDocRef, settingsWithTimestamp);

      const csvData = Object.keys(settingsWithTimestamp).map((key) => ({
        setting: key,
        value: settingsWithTimestamp[key],
      }));
      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

      const csvRef = ref(storage, `users/${currentUser.uid}/animation-settings/${presetName}.csv`);
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
      const userDocRef = doc(db, `users/${currentUser.uid}/animation-settings/current`);
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
      const userDocRef = doc(db, `users/${currentUser.uid}/animation-settings/${presetName}`);
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

  return (
    <div className="fixed right-4 top-2 p-4 rounded shadow-lg w-60 z-50  overflow-y-auto">
      <button onClick={() => setIsOpen(!isOpen)} className="mb-2 bg-gray-200 text-xs p-2 rounded w-full">
        {isOpen ? 'Collapse Controls' : 'Expand Controls'}
      </button>
      <Collapse isOpened={isOpen}>
        <div className="space-y-2 text-xs">
          <input
            type="text"
            placeholder="Preset Name"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            className="border p-2 rounded w-full"
          />
          <div className="flex space-x-2">
            <button onClick={savePresetSettings} className="bg-blue-500 text-white p-2 rounded w-1/2">
              Save Preset
            </button>
            <button onClick={loadPresetSettings} className="bg-yellow-500 text-white p-2 rounded w-1/2">
              Load Preset
            </button>
          </div>
          <select
            onChange={(e) => setPresetName(e.target.value)}
            value={presetName}
            className="border p-2 rounded w-full"
          >
            <option value="">Select Preset</option>
            {presetList.map((preset) => (
              <option key={preset} value={preset}>
                {preset}
              </option>
            ))}
          </select>

          <div className="control-group text-xs">
            <label className="block mb-2 text-xs">Background Color:</label>
            <input
              type="color"
              value={settings.bgColor}
              onChange={(e) => setSettings({ ...settings, bgColor: e.target.value })}
              className="w-full"
            />
          </div>

          {/* >>> ADDED: Background Opacity slider (0..100%) <<< */}
          <div className="control-group text-xs">
            <label className="block mb-2 text-xs">
              Background Opacity: {Math.round(((settings.bgOpacity ?? 1) * 100))}
            </label>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={Math.round((settings.bgOpacity ?? 1) * 100)}
              onChange={(e) =>
                setSettings({ ...settings, bgOpacity: Number(e.target.value) / 100 })
              }
              className="w-full"
            />
          </div>

          {message.message && (
            <div
              className={`text-white p-2 mt-2 rounded ${
                message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
              }`}
            >
              {message.message}
            </div>
          )}
        </div>
      </Collapse>
    </div>
  );
};

export default ControlPanelBaselineTyping;
