// src/components/Therapy/Controller.tsx

import React, { useState } from 'react';
import { Collapse } from 'react-collapse';

interface ControllerProps {
  waveType: string;
  setWaveType: (value: string) => void;
  direction: string;
  setDirection: (value: string) => void;
  angle: number;
  setAngle: (value: number) => void;
  amplitude: number;
  setAmplitude: (value: number) => void;
  frequency: number;
  setFrequency: (value: number) => void;
  speed: number;
  setSpeed: (value: number) => void;
  thickness: number;
  setThickness: (value: number) => void;
  phaseOffset: number;
  setPhaseOffset: (value: number) => void;
  numLines: number;
  setNumLines: (value: number) => void;
  distance: number;
  setDistance: (value: number) => void;
  bgColor: string;
  setBgColor: (value: string) => void;
  lineColor: string;
  setLineColor: (value: string) => void;
  selectedPalette: string;
  setSelectedPalette: (value: string) => void;
  rotationSpeed: number;
  setRotationSpeed: (value: number) => void;
  rotationRadius: number;
  setRotationRadius: (value: number) => void;
  startAnimation: () => void;
  stopAnimation: () => void;
  resetAnimation: () => void;
}

const Controller: React.FC<ControllerProps> = ({
  waveType,
  setWaveType,
  direction,
  setDirection,
  angle,
  setAngle,
  amplitude,
  setAmplitude,
  frequency,
  setFrequency,
  speed,
  setSpeed,
  thickness,
  setThickness,
  phaseOffset,
  setPhaseOffset,
  numLines,
  setNumLines,
  distance,
  setDistance,
  bgColor,
  setBgColor,
  lineColor,
  setLineColor,
  selectedPalette,
  setSelectedPalette,
  rotationSpeed,
  setRotationSpeed,
  rotationRadius,
  setRotationRadius,
  startAnimation,
  stopAnimation,
  resetAnimation,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  return (
    <div className="controller bg-red p-4 rounded shadow-lg fixed left-0 top-20">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="mb-4 bg-gray-200 p-2 rounded"
      >
        {isOpen ? 'Collapse Controls' : 'Expand Controls'}
      </button>
      <Collapse isOpened={isOpen}>
        <div className="control-group">
          <label>Wave Type:</label>
          <select
            value={waveType}
            onChange={(e) => setWaveType(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="sine">Sine</option>
            <option value="tan">Tan</option>
            <option value="cotan">Cotan</option>
            <option value="sawtooth">Sawtooth</option>
            <option value="square">Square</option>
            <option value="triangle">Triangle</option>
          </select>
        </div>
        <div className="control-group">
          <label>Direction:</label>
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value)}
            className="border p-2 rounded"
          >
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
        {direction === 'circular' && (
          <>
            <div className="control-group">
              <label>Rotation Speed:</label>
              <input
                type="range"
                min="0.01"
                max="1"
                step="0.01"
                value={rotationSpeed}
                onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="control-group">
              <label>Rotation Radius:</label>
              <input
                type="range"
                min="10"
                max="500"
                value={rotationRadius}
                onChange={(e) => setRotationRadius(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </>
        )}
        <div className="control-group">
          <label>Angle:</label>
          <input
            type="range"
            min="0"
            max="360"
            value={angle}
            step="1"
            onChange={(e) =>
              setAngle(parseFloat(e.target.value) * (Math.PI / 180))
            }
            className="w-full"
          />
        </div>
        <div className="control-group">
          <label>Amplitude:</label>
          <input
            type="range"
            max="360"
            min="0"
            step="1"
            value={amplitude}
            onChange={(e) =>
              setAmplitude(
                parseFloat(e.target.value) * (window.innerHeight / 4) / 100
              )
            }
            className="w-full"
          />
        </div>
        <div className="control-group">
          <label>Frequency:</label>
          <input
            type="range"
            min="1"
            max="300"
            value={frequency}
            step="1"
            onChange={(e) => setFrequency(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="control-group">
          <label>Speed:</label>
          <input
            type="range"
            min="1"
            max="500"
            value={speed}
            step="1"
            onChange={(e) => setSpeed(parseFloat(e.target.value) / 100)}
            className="w-full"
          />
        </div>
        <div className="control-group">
          <label>Line Thickness:</label>
          <input
            type="range"
            min="1"
            max="10"
            value={thickness}
            step="1"
            onChange={(e) => setThickness(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="control-group">
          <label>Phase Offset:</label>
          <input
            type="range"
            min="0"
            max="360"
            value={phaseOffset}
            step="1"
            onChange={(e) =>
              setPhaseOffset(
                (parseFloat(e.target.value) / 360) * (2 * Math.PI)
              )
            }
            className="w-full"
          />
        </div>
        <div className="control-group">
          <label>Number of Lines:</label>
          <input
            type="range"
            min="1"
            max="100"
            value={numLines}
            step="1"
            onChange={(e) => setNumLines(parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>
        <div className="control-group">
          <label>Distance Between Lines:</label>
          <input
            type="range"
            min="1"
            max="200"
            value={distance}
            step="1"
            onChange={(e) => setDistance(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="control-group">
          <label>Background Color:</label>
          <input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="control-group">
          <label>Line Color:</label>
          <input
            type="color"
            value={lineColor}
            onChange={(e) => setLineColor(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="control-group">
          <label>Use Palette:</label>
          <select
            value={selectedPalette}
            onChange={(e) => setSelectedPalette(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="none">None</option>
            <option value="rainbow">Rainbow</option>
            <option value="pastel">Pastel</option>
          </select>
        </div>
        <div className="animation-buttons">
          <button
            onClick={startAnimation}
            className="bg-green-500 text-white p-2 rounded mr-2"
          >
            Start
          </button>
          <button
            onClick={stopAnimation}
            className="bg-red-500 text-white p-2 rounded mr-2"
          >
            Stop
          </button>
          <button
            onClick={resetAnimation}
            className="bg-gray-500 text-white p-2 rounded"
          >
            Reset
          </button>
        </div>
      </Collapse>
    </div>
  );
};

export default Controller;


//+++++++++++JS version+++++++++++++++++
 
 // src/components/Therapy/Controller.jsx
  // JS version


/* 
import React, { useState } from 'react';
import { Collapse } from 'react-collapse';

const Controller = ({
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
    <div className="controller" bg-red p-4 rounded shadow-lg fixed left-0 top-20">
      <button onClick={() => setIsOpen(!isOpen)} className="mb-4 bg-gray-200 p-2 rounded">
        {isOpen ? 'Collapse Controls' : 'Expand Controls'}
      </button>
      <Collapse isOpened={isOpen}>
        <div className="control-group">
          <label>Wave Type:</label>
          <select value={waveType} onChange={(e) => setWaveType(e.target.value)} className="border p-2 rounded">
            <option value="sine">Sine</option>
            <option value="tan">Tan</option>
            <option value="cotan">Cotan</option>
            <option value="sawtooth">Sawtooth</option>
            <option value="square">Square</option>
            <option value="triangle">Triangle</option>
          </select>
        </div>
        <div className="control-group">
          <label>Direction:</label>
          <select value={direction} onChange={(e) => setDirection(e.target.value)} className="border p-2 rounded">
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
              <label>Rotation Speed:</label>
              <input type="range" min="0.01" max="1" step="0.01" value={rotationSpeed} onChange={(e) => setRotationSpeed(parseFloat(e.target.value))} className="w-full"/>
            </div>
            <div className="control-group">
              <label>Rotation Radius:</label>
              <input type="range" min="10" max="500" value={rotationRadius} onChange={(e) => setRotationRadius(parseFloat(e.target.value))} className="w-full"/>
            </div>
          </>
        )}
        <div className="control-group">
          <label>Angle:</label>
          <input type="range" min="0" max="360" value={angle} step="1" onChange={(e) => setAngle(parseFloat(e.target.value) * (Math.PI / 180))} className="w-full"/>
        </div>
        <div className="control-group">
          <label>Amplitude:</label>
          <input type="range" max="360" min="0" step="1" value={amplitude} onChange={(e) => setAmplitude(parseFloat(e.target.value) * (window.innerHeight / 4) / 100)} className="w-full"/>
        </div>
        <div className="control-group">
          <label>Frequency:</label>
          <input type="range" min="1" max="300" value={frequency} step="1" onChange={(e) => setFrequency(parseFloat(e.target.value))} className="w-full"/>
        </div>
        <div className="control-group">
          <label>Speed:</label>
          <input type="range" min="1" max="500" value={speed} step="1" onChange={(e) => setSpeed(parseFloat(e.target.value) / 100)} className="w-full"/>
        </div>
        <div className="control-group">
          <label>Line Thickness:</label>
          <input type="range" min="1" max="10" value={thickness} step="1" onChange={(e) => setThickness(parseFloat(e.target.value))} className="w-full"/>
        </div>
        <div className="control-group">
          <label>Phase Offset:</label>
          <input type="range" min="0" max="360" value={phaseOffset} step="1" onChange={(e) => setPhaseOffset((parseFloat(e.target.value) / 360) * (2 * Math.PI))} className="w-full"/>
        </div>
        <div className="control-group">
          <label>Number of Lines:</label>
          <input type="range" min="1" max="100" value={numLines} step="1" onChange={(e) => setNumLines(parseInt(e.target.value, 10))} className="w-full"/>
        </div>
        <div className="control-group">
          <label>Distance Between Lines:</label>
          <input type="range" min="1" max="200" value={distance} step="1" onChange={(e) => setDistance(parseFloat(e.target.value))} className="w-full"/>
        </div>
        <div className="control-group">
          <label>Background Color:</label>
          <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-full"/>
        </div>
        <div className="control-group">
          <label>Line Color:</label>
          <input type="color" value={lineColor} onChange={(e) => setLineColor(e.target.value)} className="w-full"/>
        </div>
        <div className="control-group">
          <label>Use Palette:</label>
          <select value={selectedPalette} onChange={(e) => setSelectedPalette(e.target.value)} className="border p-2 rounded">
            <option value="none">None</option>
            <option value="rainbow">Rainbow</option>
            <option value="pastel">Pastel</option>
          </select>
        </div>
        <div className="animation-buttons">
          <button onClick={startAnimation} className="bg-green-500 text-white p-2 rounded mr-2">Start</button>
          <button onClick={stopAnimation} className="bg-red-500 text-white p-2 rounded mr-2">Stop</button>
          <button onClick={resetAnimation} className="bg-gray-500 text-white p-2 rounded">Reset</button>
        </div>
      </Collapse>
    </div>
  );
};

export default Controller;
 */