 // src/components/TherapyPage/AnimationBackground.tsx

import React, { Component } from 'react';
import p5 from 'p5';
import TextInput from './TextInput';

interface AnimationBackgroundProps {
  patternType: string;
  patterns: {
    sineWave: {
      translateSpeed: number;
      amplitude: number;
      frequency: number;
      rotation: number;
      duplicates: number;
    };
    chevrons: any; // Replace `any` with the correct type if known
    checkerboard: any; // Replace `any` with the correct type if known
  };
  inputValue: string;
  setInputValue: (value: string) => void;
  keystrokes: string[];
  setKeystrokes: (keystrokes: string[]) => void;
  displayText: string;
  setDisplayText: (text: string) => void;
}

class AnimationBackground extends Component<AnimationBackgroundProps> {
  private myRef = React.createRef<HTMLDivElement>();
  private myP5: p5 | null = null;

  constructor(props: AnimationBackgroundProps) {
    super(props);
  }

  Sketch = (p: p5) => {
    const { patternType, patterns } = this.props;

    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight);
      p.angleMode(p.DEGREES);
    };

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
    };

    p.draw = () => {
      p.clear();
      p.background(0, 0, 0, 0);

      switch (patternType) {
        case 'sineWave':
          this.drawSineWaves(p, patterns.sineWave);
          break;
        case 'chevrons':
          this.drawChevrons(p, patterns.chevrons);
          break;
        case 'checkerboard':
          this.drawCheckerboard(p, patterns.checkerboard);
          break;
        default:
          p.text('Select a pattern', p.width / 2, p.height / 2);
      }
    };
  };

  drawSineWaves = (
    p: p5,
    { translateSpeed, amplitude, frequency, rotation, duplicates }: AnimationBackgroundProps['patterns']['sineWave']
  ) => {
    p.translate(p.width / 2, p.height / 2);
    p.rotate(rotation);

    for (let i = 0; i < duplicates; i++) {
      p.beginShape();
      for (let x = -p.width / 2; x < p.width / 2; x++) {
        const y = amplitude * p.sin(frequency * (x + p.frameCount));
        p.vertex(x, y);
      }
      p.endShape();
    }
  };

  drawChevrons = (p: p5, config: any) => {
    // Implement chevron drawing logic
  };

  drawCheckerboard = (p: p5, config: any) => {
    // Implement checkerboard drawing logic
  };

  componentDidMount() {
    this.myP5 = new p5(this.Sketch, this.myRef.current!);
  }

  componentDidUpdate() {
    this.myP5?.remove();
    this.myP5 = new p5(this.Sketch, this.myRef.current!);
  }

  componentWillUnmount() {
    this.myP5?.remove();
  }

  render() {
    const {
      inputValue,
      setInputValue,
      keystrokes,
      setKeystrokes,
      displayText,
      setDisplayText,
    } = this.props;

    return (
      <div ref={this.myRef}>
        {this.props.children}
        <TextInput
          displayText={displayText}
          setDisplayText={setDisplayText}
          inputValue={inputValue}
          setInputValue={setInputValue}
          keystrokes={keystrokes}
          setKeystrokes={setKeystrokes}
          placeholder="Type here..."
        />
      </div>
    );
  }
}

export default AnimationBackground;

 //+++++++++++JS version+++++++++++++++++
 // src/components/TherapyPage/AnimationBackground.jsx
 // JS version
/* 
 import React, { Component } from 'react';
import p5 from 'p5';
import TextInput from './TextInput'; 
import TextDisplay from './TextDisplay';
import PatternControl from './PatternControl';


class AnimationBackground extends Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
  }

  Sketch = (p) => {
    // Destructure props for ease of use
    const { patternType, patterns } = this.props;

    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight);
      p.angleMode(p.DEGREES);
    };

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
    }

    p.draw = () => {
      p.clear();
      p.background(0, 0, 0, 0);

      // Switch between different patterns
      switch (patternType) {
        case 'sineWave':
          this.drawSineWaves(p, patterns.sineWave);
          break;
        case 'chevrons':
          this.drawChevrons(p, patterns.chevrons);
          break;
        case 'checkerboard':
          this.drawCheckerboard(p, patterns.checkerboard);
          break;
        default:
          // Default pattern can be anything you choose
          p.text('Select a pattern', p.width / 2, p.height / 2);
      }
    };
  }

  drawSineWaves = (p, { translateSpeed, amplitude, frequency, rotation, duplicates }) => {
    p.translate(p.width / 2, p.height / 2);
    p.rotate(rotation);

    for (let i = 0; i < duplicates; i++) {
      p.beginShape();
      for (let x = -p.width / 2; x < p.width / 2; x++) {
        let y = amplitude * p.sin(frequency * (x + p.frameCount));
        p.vertex(x, y);
      }
      p.endShape();
    }
  }

  drawChevrons = (p, config) => {
    // Implement chevron drawing logic
  }

  drawCheckerboard = (p, config) => {
    // Implement checkerboard drawing logic
  }

  componentDidMount() {
    this.myP5 = new p5(this.Sketch, this.myRef.current);
  }

  componentDidUpdate() {
    this.myP5.remove();
    this.myP5 = new p5(this.Sketch, this.myRef.current);
  }

  componentWillUnmount() {
    this.myP5.remove();
  }
  
  render() {

    const { inputValue, setInputValue, keystrokes, setKeystrokes, displayText, setDisplayText } = this.props;


    return <div ref={this.myRef}>{this.props.children}
     
    <TextInput displayText={displayText} setDisplayText={setDisplayText} inputValue={inputValue} setInputValue={setInputValue} keystrokes={keystrokes} 
    setKeystrokes={setKeystrokes} placeholder="Type here..." />
   
   
   
    </div>;
  }
}

export default AnimationBackground */;  


/* // src/components/TherapyPage/AnimationBackground.jsx
import React, { Component } from 'react';
import p5 from 'p5';
import ControlPanel from './ControlPanel';

class AnimationBackground extends Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
    this.state = {
      settings: {
        waveType: 'sine',
        direction: 'static',
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
        groups: 1,
      },
      isAnimating: true,
    };
    this.x = 0;
    this.yOffset = 0;
    this.time = 0;
  }

  Sketch = (p) => {
    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight);
      p.angleMode(p.DEGREES);
      p.clear(); // Ensures the canvas starts clear/transparent
    };

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
      p.clear();
    };

    p.draw = () => {
      if (!this.state.isAnimating) return;

      p.clear(); // Clear the canvas to maintain transparency
      p.noFill(); // No fill to maintain transparency

      this.drawSineWaves(p);
    };
  };

  drawSineWaves = (p) => {
    p.translate(p.width / 2, p.height / 2);
    p.rotate(this.state.settings.angle);

    const { amplitude, frequency, thickness, numLines, distance, lineColor, selectedPalette } = this.state.settings;

    p.strokeWeight(thickness);

    const palettes = {
      rainbow: ["#FF0000", "#FF7F00", "#FFFF00", "#7FFF00", "#00FF00", "#00FF7F", "#00FFFF", "#007FFF", "#0000FF", "#7F00FF", "#FF00FF", "#FF007F"],
      pastel: ["#FFD1DC", "#FFABAB", "#FFC3A0", "#FF677D", "#D4A5A5", "#392F5A", "#31A2AC", "#61C0BF", "#6B4226", "#ACD8AA"]
    };

    for (let i = 0; i < numLines; i++) {
      p.beginShape();
      for (let x = -p.width / 2; x < p.width / 2; x++) {
        let y = amplitude * p.sin(frequency * (x + this.x + this.state.settings.phaseOffset * i));
        let baseY = y + i * distance;

        p.vertex(x, baseY);
      }
      if (selectedPalette !== 'none') {
        p.stroke(p.color(palettes[selectedPalette][i % palettes[selectedPalette].length]));
      } else {
        p.stroke(p.color(lineColor));
      }
      p.endShape();
    }

    switch (this.state.settings.direction) {
      case 'static':
        break;
      case 'up':
        this.yOffset -= this.state.settings.speed;
        break;
      case 'down':
        this.yOffset += this.state.settings.speed;
        break;
      case 'left':
        this.x -= this.state.settings.speed;
        break;
      case 'right':
        this.x += this.state.settings.speed;
        break;
      case 'oscillateUpDown':
        this.yOffset = (p.height / 12) * p.sin(this.time);
        this.time += this.state.settings.speed;
        break;
      case 'oscillateRightLeft':
        this.x = (p.width / 12) * p.sin(this.time);
        this.time += this.state.settings.speed;
        break;
      case 'circular':
        this.x = this.state.settings.rotationRadius * p.cos(this.time * this.state.settings.rotationSpeed);
        this.yOffset = this.state.settings.rotationRadius * p.sin(this.time * this.state.settings.rotationSpeed);
        this.time += this.state.settings.speed;
        break;
      default:
        break;
    }
  };

  componentDidMount() {
    this.myP5 = new p5(this.Sketch, this.myRef.current);
  }

  componentDidUpdate() {
    this.myP5.remove();
    this.myP5 = new p5(this.Sketch, this.myRef.current);
  }

  componentWillUnmount() {
    this.myP5.remove();
  }

  startAnimation = () => {
    this.setState({ isAnimating: true });
  };

  stopAnimation = () => {
    this.setState({ isAnimating: false });
  };

  resetAnimation = () => {
    this.setState({
      settings: {
        waveType: 'sine',
        direction: 'static',
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
        groups: 1,
      },
      isAnimating: true,
    });
    this.x = 0;
    this.yOffset = 0;
    this.time = 0;
  };

  updateSettings = (newSettings) => {
    this.setState({ settings: { ...this.state.settings, ...newSettings } });
  };

  render() {
    return (
      <div className="w-full h-full bg-transparent relative">
        <ControlPanel
          waveType={this.state.settings.waveType} setWaveType={(value) => this.updateSettings({ waveType: value })}
          direction={this.state.settings.direction} setDirection={(value) => this.updateSettings({ direction: value })}
          angle={this.state.settings.angle} setAngle={(value) => this.updateSettings({ angle: value })}
          amplitude={this.state.settings.amplitude} setAmplitude={(value) => this.updateSettings({ amplitude: value })}
          frequency={this.state.settings.frequency} setFrequency={(value) => this.updateSettings({ frequency: value })}
          speed={this.state.settings.speed} setSpeed={(value) => this.updateSettings({ speed: value })}
          thickness={this.state.settings.thickness} setThickness={(value) => this.updateSettings({ thickness: value })}
          phaseOffset={this.state.settings.phaseOffset} setPhaseOffset={(value) => this.updateSettings({ phaseOffset: value })}
          numLines={this.state.settings.numLines} setNumLines={(value) => this.updateSettings({ numLines: value })}
          distance={this.state.settings.distance} setDistance={(value) => this.updateSettings({ distance: value })}
          bgColor={this.state.settings.bgColor} setBgColor={(value) => this.updateSettings({ bgColor: value })}
          lineColor={this.state.settings.lineColor} setLineColor={(value) => this.updateSettings({ lineColor: value })}
          selectedPalette={this.state.settings.selectedPalette} setSelectedPalette={(value) => this.updateSettings({ selectedPalette: value })}
          rotationSpeed={this.state.settings.rotationSpeed} setRotationSpeed={(value) => this.updateSettings({ rotationSpeed: value })}
          rotationRadius={this.state.settings.rotationRadius} setRotationRadius={(value) => this.updateSettings({ rotationRadius: value })}
          groups={this.state.settings.groups} setGroups={(value) => this.updateSettings({ groups: value })}
          startAnimation={this.startAnimation}
          stopAnimation={this.stopAnimation}
          resetAnimation={this.resetAnimation}
        />
        <div ref={this.myRef} className="preview-iframe" />
      </div>
    );
  }
}

export default AnimationBackground;

 */
