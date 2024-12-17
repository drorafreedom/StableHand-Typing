// src/components/pages/TherapyPage.jsx
import React, { useState } from 'react';
import WaveAnimation from '../Therapy/WaveAnimation';
import TextInputComponent from '../Therapy/TextInputComponent';
import TextDisplay from '../Therapy/TextDisplay';
import Controller from '../Therapy/Controller';

const TherapyPage = () => {
  const [animationParams, setAnimationParams] = useState({
    waveType: 'sine',
    direction: 'right',
    angle: 0,
    amplitude: 10,
    frequency: 10,
    speed: 1,
    thickness: 1,
    phaseOffset: 0,
    numLines: 1,
    distance: 0,
    bgColor: '#FFFFFF',
    lineColor: '#FF0000',
    selectedPalette: 'none',
    rotationSpeed: 0.02,
    rotationRadius: 150,
  });
  const [text, setText] = useState('');
  const [keystrokes, setKeystrokes] = useState([]);

  const handleParamsChange = (params) => {
    setAnimationParams(params);
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-grow flex flex-col items-center justify-center relative">
        <WaveAnimation onParamsChange={handleParamsChange} animationParams={animationParams} />
        <div className="absolute top-1/2 transform -translate-y-1/2 flex flex-col items-center space-y-4">
          <TextInputComponent animationParams={animationParams} />
          <TextDisplay displayText={text} />
        </div>
      </div>
      <Controller 
        className="fixed top-20 right-10"
        waveType={animationParams.waveType} setWaveType={(value) => setAnimationParams({...animationParams, waveType: value})}
        direction={animationParams.direction} setDirection={(value) => setAnimationParams({...animationParams, direction: value})}
        angle={animationParams.angle} setAngle={(value) => setAnimationParams({...animationParams, angle: value})}
        amplitude={animationParams.amplitude} setAmplitude={(value) => setAnimationParams({...animationParams, amplitude: value})}
        frequency={animationParams.frequency} setFrequency={(value) => setAnimationParams({...animationParams, frequency: value})}
        speed={animationParams.speed} setSpeed={(value) => setAnimationParams({...animationParams, speed: value})}
        thickness={animationParams.thickness} setThickness={(value) => setAnimationParams({...animationParams, thickness: value})}
        phaseOffset={animationParams.phaseOffset} setPhaseOffset={(value) => setAnimationParams({...animationParams, phaseOffset: value})}
        numLines={animationParams.numLines} setNumLines={(value) => setAnimationParams({...animationParams, numLines: value})}
        distance={animationParams.distance} setDistance={(value) => setAnimationParams({...animationParams, distance: value})}
        bgColor={animationParams.bgColor} setBgColor={(value) => setAnimationParams({...animationParams, bgColor: value})}
        lineColor={animationParams.lineColor} setLineColor={(value) => setAnimationParams({...animationParams, lineColor: value})}
        selectedPalette={animationParams.selectedPalette} setSelectedPalette={(value) => setAnimationParams({...animationParams, selectedPalette: value})}
        rotationSpeed={animationParams.rotationSpeed} setRotationSpeed={(value) => setAnimationParams({...animationParams, rotationSpeed: value})}
        rotationRadius={animationParams.rotationRadius} setRotationRadius={(value) => setAnimationParams({...animationParams, rotationRadius: value})}
        startAnimation={() => {}}
        stopAnimation={() => {}}
        resetAnimation={() => setAnimationParams({
          waveType: 'sine',
          direction: 'right',
          angle: 0,
          amplitude: 10,
          frequency: 10,
          speed: 1,
          thickness: 1,
          phaseOffset: 0,
          numLines: 1,
          distance: 0,
          bgColor: '#FFFFFF',
          lineColor: '#FF0000',
          selectedPalette: 'none',
          rotationSpeed: 0.02,
          rotationRadius: 150,
        })}
      />
    </div>
  );
};

export default TherapyPage;
