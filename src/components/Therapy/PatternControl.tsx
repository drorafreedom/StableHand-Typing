// src/components/TherapyPage/PatternControl.jsx
import React from 'react';

const PatternControl = ({ setPatternParams, patternParams }) => {
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setPatternParams((prevParams) => ({
      ...prevParams,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };

  return (
    <div  className="fixed top-0 right-0   bg-transparent w-4 z-20">
      <div className="flex flex-wrap">
        <div className="mr-4">
          <label>Wave Type:</label>
          <select name="waveType" onChange={handleInputChange} value={patternParams.waveType}>
            <option value="sine">Sine</option>
            <option value="tan">Tan</option>
            <option value="cotan">Cotan</option>
            <option value="sawtooth">Sawtooth</option>
            <option value="square">Square</option>
            <option value="triangle">Triangle</option>
          </select>
        </div>
        <div className="mr-4">
          <label>Direction:</label>
          <select name="direction" onChange={handleInputChange} value={patternParams.direction}>
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
        <div className="mr-4">
          <label>Rotation Speed:</label>
          <input type="range" name="rotationSpeed" min="0.01" max="0.1" step="0.01" value={patternParams.rotationSpeed} onChange={handleInputChange} />
        </div>
        <div className="mr-4">
          <label>Rotation Radius:</label>
          <input type="range" name="rotationRadius" min="10" max="300" value={patternParams.rotationRadius} onChange={handleInputChange} />
        </div>
        <div className="mr-4">
          <label>Angle:</label>
          <input type="range" name="angle" min="0" max="360" step="45" value={patternParams.angle} onChange={handleInputChange} />
        </div>
        <div className="mr-4">
          <label>Amplitude:</label>
          <input type="range" name="amplitude" min="0" max="360" value={patternParams.amplitude} onChange={handleInputChange} />
        </div>
        <div className="mr-4">
          <label>Frequency:</label>
          <input type="range" name="frequency" min="1" max="150" value={patternParams.frequency} onChange={handleInputChange} />
        </div>
        <div className="mr-4">
          <label>Speed:</label>
          <input type="range" name="speed" min="1" max="200" value={patternParams.speed} onChange={handleInputChange} />
        </div>
        <div className="mr-4">
          <label>Line Thickness:</label>
          <input type="range" name="thickness" min="1" max="10" value={patternParams.thickness} onChange={handleInputChange} />
        </div>
        <div className="mr-4">
          <label>Phase Offset:</label>
          <input type="range" name="phaseOffset" min="0" max="360" value={patternParams.phaseOffset} onChange={handleInputChange} />
        </div>
        <div className="mr-4">
          <label>Number of Lines:</label>
          <input type="range" name="numLines" min="1" max="100" value={patternParams.numLines} onChange={handleInputChange} />
        </div>
        <div className="mr-4">
          <label>Distance Between Lines:</label>
          <input type="range" name="distance" min="1" max="100" value={patternParams.distance} onChange={handleInputChange} />
        </div>
        <div className="mr-4">
          <label>Background Color:</label>
          <input type="color" name="bgColor" value={patternParams.bgColor} onChange={handleInputChange} />
        </div>
        <div className="mr-4">
          <label>Line Color:</label>
          <input type="color" name="lineColor" value={patternParams.lineColor} onChange={handleInputChange} />
        </div>
        <div className="mr-4">
          <label>Use Palette:</label>
          <select name="palette" onChange={handleInputChange} value={patternParams.palette}>
            <option value="none">None</option>
            <option value="rainbow">Rainbow</option>
            <option value="pastel">Pastel</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default PatternControl;
