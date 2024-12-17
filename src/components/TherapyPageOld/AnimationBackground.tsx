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
    {/*<PatternControl setPatternParams={this.props.setPatternParams} setPatternType={this.props.setPatternType} style={{ position: 'absolute', left: 0, top: '10%', zIndex: 10, width: '5%', maxWidth: '200px' }} />*/}
        <TextDisplay displayText={displayText} setDisplayText={setDisplayText} />
    <TextInput displayText={displayText} setDisplayText={setDisplayText} inputValue={inputValue} setInputValue={setInputValue} keystrokes={keystrokes} 
    setKeystrokes={setKeystrokes} placeholder="Type here..." />
   
   
   
    </div>;
  }
}

export default AnimationBackground;