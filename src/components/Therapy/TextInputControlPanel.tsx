// src\components\Therapy\TextInputControlPanel.jsx

import React, { useState } from 'react';  // Add this line
import { Collapse } from 'react-collapse';

const TextInputControlPanel = ({ inputSettings, setInputSettings }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="w-1/2 bg-red p-2 rounded shadow-lg z-50 h-full overflow-y-auto">
      <button onClick={() => setIsOpen(!isOpen)} className="mb-2 bg-gray-200 p-2 rounded w-full">
        {isOpen ? 'Collapse Controls' : 'Expand Controls'}
      </button>
      <Collapse isOpened={isOpen}>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <label>Font:</label>
            <select value={inputSettings.font} onChange={(e) => setInputSettings({ ...inputSettings, font: e.target.value })} className="border p-2 rounded">
              <option value="Arial">Arial</option>
              <option value="Verdana">Verdana</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
              <option value="Georgia">Georgia</option>
            </select>
          </div>
          <div className="flex space-x-2">
            <label>Text Color:</label>
            <input type="color" value={inputSettings.textColor} onChange={(e) => setInputSettings({ ...inputSettings, textColor: e.target.value })} className="border p-2 rounded" />
          </div>
          <div className="flex space-x-2">
            <label>Background Color:</label>
            <input type="color" value={inputSettings.backgroundColor} onChange={(e) => setInputSettings({ ...inputSettings, backgroundColor: e.target.value })} className="border p-2 rounded" />
          </div>
          <div className="flex space-x-2">
            <label>Background Opacity:</label>
            <input type="range" min="0" max="1" step="0.01" value={inputSettings.backgroundOpacity} onChange={(e) => setInputSettings({ ...inputSettings, backgroundOpacity: e.target.value })} className="border p-2 rounded" />
          </div>
          <div className="flex space-x-2">
            <label>Font Size:</label>
            <input type="number" value={parseInt(inputSettings.fontSize)} onChange={(e) => setInputSettings({ ...inputSettings, fontSize: `${e.target.value}px` })} className="border p-2 rounded" />
          </div>
          <div className="flex space-x-2">
            <label>Bold:</label>
            <input type="checkbox" checked={inputSettings.fontWeight === 'bold'} onChange={(e) => setInputSettings({ ...inputSettings, fontWeight: e.target.checked ? 'bold' : 'normal' })} className="border p-2 rounded" />
          </div>
        </div>
      </Collapse>
    </div>
  );
};

export default TextInputControlPanel;


/* import React, { useState } from 'react';
import { Collapse } from 'react-collapse';

const TextInputControlPanel = ({
  font, setFont,
  fontSize, setFontSize,
  isBold, setIsBold,
  textColor, setTextColor,
  backgroundColor, setBackgroundColor,
  backgroundOpacity, setBackgroundOpacity,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="fixed left-4 bottom-0 bg-white bg-opacity-50 p-2 rounded shadow-lg w-60 z-50">
      <button onClick={() => setIsOpen(!isOpen)} className="mb-2 bg-gray-200 p-2 rounded w-full">
        {isOpen ? 'Collapse Controls' : 'Expand Controls'}
      </button>
      <Collapse isOpened={isOpen}>
        <div className="space-y-4">
          <div className="control-group">
            <label className="block mb-2">Font:</label>
            <select value={font} onChange={(e) => setFont(e.target.value)} className="border p-2 rounded w-full">
              <option value="Arial">Arial</option>
              <option value="Verdana">Verdana</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
              <option value="Georgia">Georgia</option>
            </select>
          </div>
          <div className="control-group">
            <label className="block mb-2">Font Size:</label>
            <select value={fontSize} onChange={(e) => setFontSize(e.target.value)} className="border p-2 rounded w-full">
              <option value="12px">12px</option>
              <option value="14px">14px</option>
              <option value="16px">16px</option>
              <option value="18px">18px</option>
              <option value="20px">20px</option>
              <option value="24px">24px</option>
              <option value="28px">28px</option>
              <option value="32px">32px</option>
            </select>
          </div>
          <div className="control-group">
            <label className="block mb-2">Bold:</label>
            <input type="checkbox" checked={isBold} onChange={(e) => setIsBold(e.target.checked)} className="border p-2 rounded w-full" />
          </div>
          <div className="control-group">
            <label className="block mb-2">Text Color:</label>
            <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="border p-2 rounded w-full" />
          </div>
          <div className="control-group">
            <label className="block mb-2">Background Color:</label>
            <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="border p-2 rounded w-full" />
          </div>
          <div className="control-group">
            <label className="block mb-2">Background Opacity:</label>
            <input type="range" min="0" max="1" step="0.01" value={backgroundOpacity} onChange={(e) => setBackgroundOpacity(e.target.value)} className="border p-2 rounded w-full" />
          </div>
        </div>
      </Collapse>
    </div>
  );
};

export default TextInputControlPanel; */
