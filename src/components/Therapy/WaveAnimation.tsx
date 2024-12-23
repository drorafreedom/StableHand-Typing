
// src/components/Therapy/WaveAnimation.tsx

import React, { useRef, useEffect } from 'react';
import p5 from 'p5';

interface AnimationParams {
  waveType: 'sine' | 'tan' | 'cotan' | 'sawtooth' | 'square' | 'triangle';
  direction: 'static' | 'up' | 'down' | 'left' | 'right' | 'oscillateUpDown' | 'oscillateRightLeft' | 'circular';
  angle?: number;
  amplitude?: number;
  frequency?: number;
  speed?: number;
  thickness?: number;
  phaseOffset?: number;
  numLines?: number;
  distance?: number;
  bgColor?: string;
  lineColor?: string;
  selectedPalette?: 'none' | 'rainbow' | 'pastel';
  rotationSpeed?: number;
  rotationRadius?: number;
}

interface WaveAnimationProps {
  onParamsChange?: (params: AnimationParams) => void;
  animationParams: AnimationParams;
}

const WaveAnimation: React.FC<WaveAnimationProps> = ({ onParamsChange, animationParams }) => {
  const sketchRef = useRef<HTMLDivElement>(null);

  const Sketch = (p: p5) => {
    let x = 0;
    let yOffset = 0;
    let time = 0;
    let angle = animationParams.angle || 0;

    p.setup = () => {
      p.createCanvas(p.windowWidth - 300, p.windowHeight - 100);
      p.angleMode(p.RADIANS);
      p.noFill();
    };

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth - 300, p.windowHeight - 100);
    };

    p.draw = () => {
      p.clear();
      p.background(animationParams.bgColor || '#FFFFFF');
      p.strokeWeight(animationParams.thickness || 1);

      switch (animationParams.direction) {
        case 'up':
          yOffset -= animationParams.speed || 1;
          if (yOffset + animationParams.numLines! * animationParams.distance! < 0) {
            yOffset = p.height;
          }
          break;
        case 'down':
          yOffset += animationParams.speed || 1;
          if (yOffset > p.height) {
            yOffset = -animationParams.numLines! * animationParams.distance!;
          }
          break;
        case 'left':
          x -= animationParams.speed || 1;
          break;
        case 'right':
          x += animationParams.speed || 1;
          break;
        case 'oscillateUpDown':
          yOffset = (p.height / 2) * p.sin(time);
          time += 0.05;
          break;
        case 'oscillateRightLeft':
          x = (p.width / 2) * p.sin(time);
          time += 0.05;
          break;
        case 'circular':
          const currentAngle = angle + (animationParams.rotationSpeed || 0.02);
          x = (animationParams.rotationRadius || 150) * p.cos(currentAngle);
          yOffset = (animationParams.rotationRadius || 150) * p.sin(currentAngle) - p.height / 2;
          angle = currentAngle;
          break;
        default:
          break;
      }

      for (let i = 0; i < animationParams.numLines!; i++) {
        p.beginShape();
        for (let j = 0; j <= p.width; j++) {
          const k = ((j + x + (animationParams.phaseOffset || 0) * i) / (animationParams.frequency || 10));
          let sineValue;
          switch (animationParams.waveType) {
            case 'sine':
              sineValue = p.sin(k) * (animationParams.amplitude || 10);
              break;
            case 'tan':
              sineValue = p.tan(k) * (animationParams.amplitude || 10) / 4;
              break;
            case 'cotan':
              sineValue = (1 / p.tan(k)) * (animationParams.amplitude || 10) / 4;
              break;
            case 'sawtooth':
              sineValue = ((k / p.PI) % 2 - 1) * (animationParams.amplitude || 10);
              break;
            case 'square':
              sineValue = (Math.sign(p.sin(k)) * (animationParams.amplitude || 10) / 2);
              break;
            case 'triangle':
              sineValue = (2 * (animationParams.amplitude || 10) / p.PI) * p.asin(p.sin(k));
              break;
            default:
              sineValue = p.sin(k) * (animationParams.amplitude || 10);
          }

          const baseY = p.height / 2 + yOffset + i * animationParams.distance!;
          const rotatedX = (j - p.width / 2) * p.cos(angle) - sineValue * p.sin(angle) + p.width / 2;
          const rotatedY = (j - p.width / 2) * p.sin(angle) + (sineValue + baseY - p.height / 2) * p.cos(angle) + p.height / 2;

          p.vertex(rotatedX, rotatedY);
        }
        p.stroke(animationParams.selectedPalette !== 'none' ? animationParams.lineColor : animationParams.lineColor);
        p.endShape();
      }
    };
  };

  useEffect(() => {
    if (onParamsChange) {
      onParamsChange({
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
    }
  }, [onParamsChange]);

  useEffect(() => {
    const p5Instance = new p5(Sketch, sketchRef.current!);
    return () => {
      p5Instance.remove();
    };
  }, [animationParams]);

  return <div ref={sketchRef} className="wave-animation-container absolute w-full h-full top-0 left-0"></div>;
};

export default WaveAnimation;

//+++++++++++JS version+++++++++++++++++
 // src\components\Therapy\WaveAnimation.jsx
  // JS version
/* 

import React, { useRef, useEffect, useState } from 'react';
 
import p5 from 'p5';

const WaveAnimation = ({ onParamsChange, animationParams }) => {
  const sketchRef = useRef(null);

  const Sketch = (p) => {
    let x = 0;
    let yOffset = 0;
    let time = 0;
    let angle = animationParams.angle || 0;

    p.setup = () => {
      p.createCanvas(p.windowWidth - 300, p.windowHeight - 100);
      p.angleMode(p.RADIANS);
      p.noFill();
    };

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth - 300, p.windowHeight - 100);
    };

    p.draw = () => {
      p.clear();
      p.background(animationParams.bgColor || '#FFFFFF');
      p.strokeWeight(animationParams.thickness || 1);

      switch (animationParams.direction) {
        case 'up':
          yOffset -= animationParams.speed || 1;
          if (yOffset + animationParams.numLines * animationParams.distance < 0) {
            yOffset = p.height;
          }
          break;
        case 'down':
          yOffset += animationParams.speed || 1;
          if (yOffset > p.height) {
            yOffset = -animationParams.numLines * animationParams.distance;
          }
          break;
        case 'left':
          x -= animationParams.speed || 1;
          break;
        case 'right':
          x += animationParams.speed || 1;
          break;
        case 'oscillateUpDown':
          yOffset = (p.height / 2) * p.sin(time);
          time += 0.05;
          break;
        case 'oscillateRightLeft':
          x = (p.width / 2) * p.sin(time);
          time += 0.05;
          break;
        case 'circular':
          const currentAngle = angle + (animationParams.rotationSpeed || 0.02);
          x = (animationParams.rotationRadius || 150) * p.cos(currentAngle);
          yOffset = (animationParams.rotationRadius || 150) * p.sin(currentAngle) - p.height / 2;
          angle = currentAngle;
          break;
        default:
          break;
      }

      for (let i = 0; i < animationParams.numLines; i++) {
        p.beginShape();
        for (let j = 0; j <= p.width; j++) {
          const k = ((j + x + (animationParams.phaseOffset || 0) * i) / (animationParams.frequency || 10));
          let sineValue;
          switch (animationParams.waveType) {
            case 'sine':
              sineValue = p.sin(k) * (animationParams.amplitude || 10);
              break;
            case 'tan':
              sineValue = p.tan(k) * (animationParams.amplitude || 10) / 4;
              break;
            case 'cotan':
              sineValue = (1 / p.tan(k)) * (animationParams.amplitude || 10) / 4;
              break;
            case 'sawtooth':
              sineValue = ((k / p.PI) % 2 - 1) * (animationParams.amplitude || 10);
              break;
            case 'square':
              sineValue = (Math.sign(p.sin(k)) * (animationParams.amplitude || 10) / 2);
              break;
            case 'triangle':
              sineValue = (2 * (animationParams.amplitude || 10) / p.PI) * p.asin(p.sin(k));
              break;
            default:
              sineValue = p.sin(k) * (animationParams.amplitude || 10);
          }

          const baseY = p.height / 2 + yOffset + i * animationParams.distance;
          const rotatedX = (j - p.width / 2) * p.cos(angle) - sineValue * p.sin(angle) + p.width / 2;
          const rotatedY = (j - p.width / 2) * p.sin(angle) + (sineValue + baseY - p.height / 2) * p.cos(angle) + p.height / 2;

          p.vertex(rotatedX, rotatedY);
        }
        p.stroke(animationParams.selectedPalette !== 'none' ? palettes[animationParams.selectedPalette][i % palettes[animationParams.selectedPalette].length] : animationParams.lineColor);
        p.endShape();
      }
    };
  };

  useEffect(() => {
    const params = {
      waveType: 'sine', direction: 'right', angle: 0, amplitude: 10, frequency: 10, speed: 1, thickness: 1, phaseOffset: 0, numLines: 1, distance: 0, bgColor: '#FFFFFF', lineColor: '#FF0000', selectedPalette: 'none', rotationSpeed: 0.02, rotationRadius: 150
    };
    if (onParamsChange) {
      onParamsChange(params);
    }
  }, []);

  useEffect(() => {
    sketchRef.current = new p5(Sketch);
    return () => sketchRef.current.remove();
  }, [animationParams]);

  return (
    <div className="wave-animation-container absolute w-full h-full top-0 left-0">
      <div ref={sketchRef}></div>
    </div>
  );
};

export default WaveAnimation;
 */