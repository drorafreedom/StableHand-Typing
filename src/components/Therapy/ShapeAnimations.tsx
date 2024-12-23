// src/components/Therapy/ShapeAnimations.tsx

import React, { useState } from 'react';
import ControlPanelShape from './ControlPanelShape';
import { ReactP5Wrapper } from 'react-p5-wrapper';

interface Settings {
  shapeType: 'circle' | 'square' | 'triangle' | 'chevron' | 'diamond';
  numShapes: number;
  size: number;
  direction: 'static' | 'up' | 'down' | 'left' | 'right' | 'oscillateUpDown' | 'oscillateRightLeft' | 'circular';
  angle: number;
  speed: number;
  rotationSpeed: number;
  rotationRadius: number;
  bgColor: string;
  shapeColor: string;
  secondColor: string;
  palette: 'none' | 'rainbow' | 'pastel';
  rowOffset: number;
  columnOffset: number;
  rowDistance: number;
  columnDistance: number;
  layoutSelect: 'random' | 'regular' | 'checkboard';
  oscillationRange: number;
}

const ShapeAnimations: React.FC = () => {
  const defaultSettings: Settings = {
    shapeType: 'circle',
    numShapes: 10,
    size: 50,
    direction: 'static',
    angle: 0,
    speed: 5,
    rotationSpeed: 0.02,
    rotationRadius: 150,
    bgColor: '#FFFFFF',
    shapeColor: '#007BFF',
    secondColor: '#FF0000',
    palette: 'none',
    rowOffset: 0,
    columnOffset: 0,
    rowDistance: 50,
    columnDistance: 50,
    layoutSelect: 'random',
    oscillationRange: 100,
  };

  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isAnimating, setIsAnimating] = useState<boolean>(true);

  const sketch = (p5: any) => {
    let shapes: Shape[] = [];

    p5.setup = () => {
      p5.createCanvas(p5.windowWidth, p5.windowHeight);
      createShapes();
    };

    p5.updateWithProps = (props: { settings: Settings; isAnimating: boolean }) => {
      if (props.settings) {
        setSettings(props.settings);
        createShapes();
      }
      if (props.isAnimating !== undefined) {
        props.isAnimating ? p5.loop() : p5.noLoop();
      }
    };

    p5.draw = () => {
      p5.background(settings.bgColor);
      for (let shape of shapes) {
        shape.move();
        shape.display();
      }
    };

    p5.windowResized = () => {
      p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
      createShapes();
    };

    function createShapes() {
      shapes = [];
      let totalShapes: number;
      let rows: number, cols: number;

      if (settings.layoutSelect === 'random') {
        totalShapes = settings.numShapes;
      } else {
        rows = Math.floor(p5.height / (settings.size + settings.rowDistance));
        cols = Math.floor(p5.width / (settings.size + settings.columnDistance));
        totalShapes = rows * cols;
      }

      for (let i = 0; i < totalShapes; i++) {
        shapes.push(new Shape(p5, settings, i, rows, cols));
      }
    }

    class Shape {
      private p5: any;
      private settings: Settings;
      private index: number;
      private rows: number;
      private cols: number;
      private x: number;
      private y: number;
      private angle: number;
      private speed: number;

      constructor(p5: any, settings: Settings, index: number, rows: number, cols: number) {
        this.p5 = p5;
        this.settings = settings;
        this.index = index;
        this.rows = rows;
        this.cols = cols;
        this.initPosition();
      }

      initPosition() {
        if (this.settings.layoutSelect === 'random') {
          this.x = this.p5.random(this.p5.width);
          this.y = this.p5.random(this.p5.height);
        } else {
          this.x = (this.index % this.cols) * (this.settings.size + this.settings.columnDistance) + this.settings.columnOffset;
          this.y = Math.floor(this.index / this.cols) * (this.settings.size + this.settings.rowDistance) + this.settings.rowOffset;
        }
        this.angle = this.settings.angle;
        this.speed = this.settings.speed;
      }

      move() {
        switch (this.settings.direction) {
          case 'up':
            this.y -= this.speed;
            break;
          case 'down':
            this.y += this.speed;
            break;
          case 'left':
            this.x -= this.speed;
            break;
          case 'right':
            this.x += this.speed;
            break;
          case 'oscillateUpDown':
            this.y += Math.sin(this.p5.frameCount * 0.05) * this.settings.speed * 0.01 * this.settings.oscillationRange;
            break;
          case 'oscillateRightLeft':
            this.x += Math.sin(this.p5.frameCount * 0.05) * this.settings.speed * 0.01 * this.settings.oscillationRange;
            break;
          case 'circular':
            this.x += Math.cos(this.p5.frameCount * this.settings.rotationSpeed * 0.001 + this.index) * this.settings.rotationRadius * 0.1;
            this.y += Math.sin(this.p5.frameCount * this.settings.rotationSpeed * 0.001 + this.index) * this.settings.rotationRadius * 0.1;
            break;
          default:
            break;
        }

        if (this.x > this.p5.width) this.x = 0;
        if (this.x < 0) this.x = this.p5.width;
        if (this.y > this.p5.height) this.y = 0;
        if (this.y < 0) this.y = this.p5.height;
      }

      display() {
        this.p5.push();
        this.p5.translate(this.x, this.y);
        this.p5.rotate(this.angle);

        let shapeColor = this.settings.palette === 'none' ? this.settings.shapeColor : '#000';
        this.p5.fill(shapeColor);

        switch (this.settings.shapeType) {
          case 'circle':
            this.p5.ellipse(0, 0, this.settings.size);
            break;
          case 'square':
            this.p5.rect(0, 0, this.settings.size, this.settings.size);
            break;
          case 'triangle':
            this.p5.triangle(
              -this.settings.size / 2, this.settings.size / 2,
              this.settings.size / 2, this.settings.size / 2,
              0, -this.settings.size / 2
            );
            break;
          case 'chevron':
            this.p5.beginShape();
            this.p5.vertex(-this.settings.size / 2, this.settings.size / 2);
            this.p5.vertex(0, -this.settings.size / 2);
            this.p5.vertex(this.settings.size / 2, this.settings.size / 2);
            this.p5.vertex(this.settings.size / 4, this.settings.size / 2);
            this.p5.vertex(0, 0);
            this.p5.vertex(-this.settings.size / 4, this.settings.size / 2);
            this.p5.endShape(this.p5.CLOSE);
            break;
          case 'diamond':
            this.p5.beginShape();
            this.p5.vertex(0, -this.settings.size / 2);
            this.p5.vertex(this.settings.size / 2, 0);
            this.p5.vertex(0, this.settings.size / 2);
            this.p5.vertex(-this.settings.size / 2, 0);
            this.p5.endShape(this.p5.CLOSE);
            break;
          default:
            break;
        }
        this.p5.pop();
      }
    }
  };

  const startAnimation = () => setIsAnimating(true);
  const stopAnimation = () => setIsAnimating(false);
  const resetAnimation = () => {
    setSettings(defaultSettings);
    setIsAnimating(true);
  };

  return (
    <div className="relative">
      <ControlPanelShape
        settings={settings}
        setSettings={setSettings}
        startAnimation={startAnimation}
        stopAnimation={stopAnimation}
        resetAnimation={resetAnimation}
      />
      <ReactP5Wrapper sketch={sketch} settings={settings} isAnimating={isAnimating} />
    </div>
  );
};

export default ShapeAnimations;

//+++++++++++JS version+++++++++++++++++
 /*  // src/components/Therapy/ShapeAnimations.jsx
  // JS version
//this is working . the oscllation is          3D .  
import React, { useState } from 'react';
import ControlPanelShape from './ControlPanelShape';
import { ReactP5Wrapper } from 'react-p5-wrapper';

const ShapeAnimations = () => {
  const [settings, setSettings] = useState({
    shapeType: 'circle',
    numShapes: 10,
    size: 50,
    direction: 'static',
    angle: 0,
    speed: 5,
    rotationSpeed: 0.02,
    rotationRadius: 150,
    bgColor: '#FFFFFF',
    shapeColor: '#007BFF',
    secondColor: '#FF0000', // For checkboard
    palette: 'none',
    rowOffset: 0,
    columnOffset: 0,
    rowDistance: 50,
    columnDistance: 50,
    layoutSelect: 'random',
    oscillationRange: 100
  });
 let xOffset = 0;
  let yOffset = 0;
 let  time = 0;
  const [isAnimating, setIsAnimating] = useState(true);
 
  const sketch = (p5) => {
    let shapes = [];

    p5.setup = () => {
      p5.createCanvas(p5.windowWidth, p5.windowHeight);
      createShapes();
    };

    p5.updateWithProps = (props) => {
      if (props.settings) {
        setSettings(props.settings);
        createShapes();
      }
      if (props.isAnimating !== undefined) {
        props.isAnimating ? p5.loop() : p5.noLoop();
      }
    };

    p5.draw = () => {
      p5.background(settings.bgColor);
      for (let shape of shapes) {
        shape.move();
        shape.display();
      }
    };

    p5.windowResized = () => {
      p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
      createShapes();
    };

    function createShapes() {
      shapes = [];
      let totalShapes;
      let rows, cols;

      if (settings.layoutSelect === 'random') {
        totalShapes = settings.numShapes;
      } else {
        rows = Math.floor(p5.height / (settings.size + settings.rowDistance));
        cols = Math.floor(p5.width / (settings.size + settings.columnDistance));
        totalShapes = rows * cols;
      }

      console.log(`Creating ${totalShapes} shapes for layout: ${settings.layoutSelect}`);

      for (let i = 0; i < totalShapes; i++) {
        shapes.push(new Shape(p5, settings, i, rows, cols));
      }
    }

    class Shape {
      constructor(p5, settings, index, rows, cols) {
        this.p5 = p5;
        this.settings = settings;
        this.index = index;
        this.rows = rows;
        this.cols = cols;
        this.initPosition();
      }

      initPosition() {
        if (this.settings.layoutSelect === 'random') {
          this.x = this.p5.random(this.p5.width);
          this.y = this.p5.random(this.p5.height);
        } else {
          this.x = (this.index % this.cols) * (this.settings.size + this.settings.columnDistance) + this.settings.columnOffset;
          this.y = Math.floor(this.index / this.cols) * (this.settings.size + this.settings.rowDistance) + this.settings.rowOffset;
        }
        this.angle = this.settings.angle;
        this.speed = this.settings.speed;
      }

      move() {
        const oscillationAmplitudeX = settings. oscillationRange ;
      const oscillationAmplitudeY = settings. oscillationRange ;

        switch (this.settings.direction) {
          case 'up':
            this.y -= this.speed;
            break;
          case 'down':
            this.y += this.speed;
            break;
          case 'left':
            this.x -= this.speed;
            break;
          case 'right':
            this.x += this.speed;
            break;
            case 'oscillateUpDown':
              this.y += Math.sin(this.p5.frameCount * 0.05)* this.settings.speed*.01  * this.settings.oscillationRange;
              break;
            case 'oscillateRightLeft':
              this.x += Math.sin(this.p5.frameCount  * 0.05)* this.settings.speed*.01 * this.settings.oscillationRange;
              break;
            case 'circular':
              this.x += Math.cos(this.p5.frameCount * this.settings.rotationSpeed*.001 + this.index) * this.settings.rotationRadius*.1;
              this.y += Math.sin(this.p5.frameCount * this.settings.rotationSpeed*.001 + this.index) * this.settings.rotationRadius*.1;
              break;
          default:
            break;
        }

        
        if (this.x > this.p5.width) this.x = 0;
        if (this.x < 0) this.x = this.p5.width;
        if (this.y > this.p5.height) this.y = 0;
        if (this.y < 0) this.y = this.p5.height;
      }

      display() {
        this.p5.push();
        this.p5.translate(this.x, this.y);
        this.p5.rotate(this.angle);

        const palettes = {
          rainbow: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'],
          pastel: ['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF'],
        };

        let shapeColor;
        if (this.settings.palette !== 'none' && palettes[this.settings.palette]) {
          shapeColor = palettes[this.settings.palette][this.index % palettes[this.settings.palette].length];
        } else if (this.settings.layoutSelect === 'checkboard') {
          const row = Math.floor(this.index / this.cols);
          const col = this.index % this.cols;
          shapeColor = (row % 2 === 0 && col % 2 === 0) || (row % 2 === 1 && col % 2 === 1) ? this.settings.shapeColor : this.settings.secondColor;
        } else {
          shapeColor = this.settings.shapeColor;
        }

        this.p5.fill(shapeColor);

        switch (this.settings.shapeType) {
          case 'circle':
            this.p5.ellipse(0, 0, this.settings.size);
            break;
          case 'square':
            this.p5.rect(0, 0, this.settings.size, this.settings.size);
            break;
          case 'triangle':
            this.p5.triangle(
              -this.settings.size / 2, this.settings.size / 2,
              this.settings.size / 2, this.settings.size / 2,
              0, -this.settings.size / 2
            );
            break;
          case 'chevron':
            this.p5.beginShape();
            this.p5.vertex(-this.settings.size / 2, this.settings.size / 2);
            this.p5.vertex(0, -this.settings.size / 2);
            this.p5.vertex(this.settings.size / 2, this.settings.size / 2);
            this.p5.vertex(this.settings.size / 4, this.settings.size / 2);
            this.p5.vertex(0, 0);
            this.p5.vertex(-this.settings.size / 4, this.settings.size / 2);
            this.p5.endShape(this.p5.CLOSE);
            break;
          case 'diamond':
            this.p5.beginShape();
            this.p5.vertex(0, -this.settings.size / 2);
            this.p5.vertex(this.settings.size / 2, 0);
            this.p5.vertex(0, this.settings.size / 2);
            this.p5.vertex(-this.settings.size / 2, 0);
            this.p5.endShape(this.p5.CLOSE);
            break;
          default:
            break;
        }
        this.p5.pop();
      }
    }
  };

  const startAnimation = () => {
    setIsAnimating(true);
  };

  const stopAnimation = () => {
    setIsAnimating(false);
  };

  const resetAnimation = () => {
    setSettings({
      shapeType: 'circle',
      numShapes: 10,
      size: 50,
      direction: 'static',
      angle: 0,
      speed: 5,
      rotationSpeed: 0.02,
      rotationRadius: 150,
      bgColor: '#FFFFFF',
      shapeColor: '#007BFF',
      secondColor: '#FF0000',
      palette: 'none',
      rowOffset: 0,
      columnOffset: 0,
      rowDistance: 50,
      columnDistance: 50,
      layoutSelect: 'random',
    });
    setIsAnimating(true);
  };

  return (
    <div className="relative">
      <ControlPanelShape
        settings={settings}
        setSettings={setSettings}
        startAnimation={startAnimation}
        stopAnimation={stopAnimation}
        resetAnimation={resetAnimation}
      />
      <ReactP5Wrapper sketch={sketch} settings={settings} isAnimating={isAnimating} />
    </div>
  );
};

export default ShapeAnimations;
 */


/*  
 import React, { useState } from 'react';
 import ControlPanelShape from './ControlPanelShape';
 import { ReactP5Wrapper } from 'react-p5-wrapper';
 
 const ShapeAnimations = () => {
   const [settings, setSettings] = useState({
     shapeType: 'circle',
     numShapes: 10,
     size: 50,
     direction: 'static',
     angle: 0,
     speed: 5,
     rotationSpeed: 0.02,
     rotationRadius: 150,
     bgColor: '#FFFFFF',
     shapeColor: '#007BFF',
     secondColor: '#FF0000', // For checkboard
     palette: 'none',
     rowOffset: 0,
     columnOffset: 0,
     rowDistance: 50,
     columnDistance: 50,
     layoutSelect: 'random',
   });
 
   const [isAnimating, setIsAnimating] = useState(true);
 
   const sketch = (p5) => {
     let shapes = [];
 
     p5.setup = () => {
       p5.createCanvas(p5.windowWidth, p5.windowHeight);
       createShapes();
     };
 
     p5.updateWithProps = (props) => {
       if (props.settings) {
         setSettings(props.settings);
         createShapes();
       }
       if (props.isAnimating !== undefined) {
         props.isAnimating ? p5.loop() : p5.noLoop();
       }
     };
 
     p5.draw = () => {
       p5.background(settings.bgColor);
       for (let shape of shapes) {
         shape.move();
         shape.display();
       }
     };
 
     p5.windowResized = () => {
       p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
       createShapes();
     };
 
     function createShapes() {
       shapes = [];
       const totalShapes = settings.layoutSelect === 'random' ? settings.numShapes : Math.ceil(p5.width / settings.columnDistance) * Math.ceil(p5.height / settings.rowDistance);
       for (let i = 0; i < totalShapes; i++) {
         shapes.push(new Shape(p5, settings, i));
       }
     }
 
     class Shape {
       constructor(p5, settings, index) {
         this.p5 = p5;
         this.settings = settings;
         this.index = index;
         this.initPosition();
       }
 
       initPosition() {
         if (this.settings.layoutSelect === 'random') {
           this.x = this.p5.random(this.p5.width);
           this.y = this.p5.random(this.p5.height);
         } else {
           this.x = (this.index % Math.ceil(this.p5.width / this.settings.columnDistance)) * this.settings.columnDistance + this.settings.columnOffset;
           this.y = Math.floor(this.index / Math.ceil(this.p5.width / this.settings.columnDistance)) * this.settings.rowDistance + this.settings.rowOffset;
         }
         this.angle = this.settings.angle;
         this.speed = this.settings.speed;
       }
 
       move() {
         switch (this.settings.direction) {
           case 'up':
             this.y -= this.speed;
             break;
           case 'down':
             this.y += this.speed;
             break;
           case 'left':
             this.x -= this.speed;
             break;
           case 'right':
             this.x += this.speed;
             break;
           case 'oscillateUpDown':
             this.y = this.p5.height / 2 + Math.sin(this.p5.frameCount * 0.05) * 100;
             break;
           case 'oscillateRightLeft':
             this.x = this.p5.width / 2 + Math.sin(this.p5.frameCount * 0.05) * 100;
             break;
           case 'circular':
             this.x = this.p5.width / 2 + Math.cos(this.p5.frameCount * this.settings.rotationSpeed + this.index * 0.1) * this.settings.rotationRadius;
             this.y = this.p5.height / 2 + Math.sin(this.p5.frameCount * this.settings.rotationSpeed + this.index * 0.1) * this.settings.rotationRadius;
             break;
           default:
             break;
         }
 
         if (this.x > this.p5.width) this.x = 0;
         if (this.x < 0) this.x = this.p5.width;
         if (this.y > this.p5.height) this.y = 0;
         if (this.y < 0) this.y = this.p5.height;
       }
 
       display() {
         this.p5.push();
         this.p5.translate(this.x, this.y);
         this.p5.rotate(this.angle);
 
         const palettes = {
           rainbow: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'],
           pastel: ['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF'],
         };
 
         let shapeColor;
         if (this.settings.palette !== 'none') {
           shapeColor = palettes[this.settings.palette][this.index % palettes[this.settings.palette].length];
         } else {
           shapeColor = (this.settings.layoutSelect === 'checkboard' && (Math.floor(this.index / Math.ceil(this.p5.width / this.settings.columnDistance)) % 2 === 0) !== (this.index % 2 === 0)) ? this.settings.secondColor : this.settings.shapeColor;
         }
 
         this.p5.fill(shapeColor);
 
         switch (this.settings.shapeType) {
           case 'circle':
             this.p5.ellipse(0, 0, this.settings.size);
             break;
           case 'square':
             this.p5.rect(0, 0, this.settings.size, this.settings.size);
             break;
           case 'triangle':
             this.p5.triangle(
               -this.settings.size / 2, this.settings.size / 2,
               this.settings.size / 2, this.settings.size / 2,
               0, -this.settings.size / 2
             );
             break;
           case 'chevron':
             this.p5.beginShape();
             this.p5.vertex(-this.settings.size / 2, this.settings.size / 2);
             this.p5.vertex(0, -this.settings.size / 2);
             this.p5.vertex(this.settings.size / 2, this.settings.size / 2);
             this.p5.vertex(this.settings.size / 4, this.settings.size / 2);
             this.p5.vertex(0, 0);
             this.p5.vertex(-this.settings.size / 4, this.settings.size / 2);
             this.p5.endShape(this.p5.CLOSE);
             break;
           case 'diamond':
             this.p5.beginShape();
             this.p5.vertex(0, -this.settings.size / 2);
             this.p5.vertex(this.settings.size / 2, 0);
             this.p5.vertex(0, this.settings.size / 2);
             this.p5.vertex(-this.settings.size / 2, 0);
             this.p5.endShape(this.p5.CLOSE);
             break;
           default:
             break;
         }
         this.p5.pop();
       }
     }
   };
 
   const startAnimation = () => {
     setIsAnimating(true);
   };
 
   const stopAnimation = () => {
     setIsAnimating(false);
   };
 
   const resetAnimation = () => {
     setSettings({
       shapeType: 'circle',
       numShapes: 10,
       size: 50,
       direction: 'static',
       angle: 0,
       speed: 5,
       rotationSpeed: 0.02,
       rotationRadius: 150,
       bgColor: '#FFFFFF',
       shapeColor: '#007BFF',
       secondColor: '#FF0000',
       palette: 'none',
       rowOffset: 0,
       columnOffset: 0,
       rowDistance: 50,
       columnDistance: 50,
       layoutSelect: 'random',
     });
     setIsAnimating(true);
   };
 
   return (
     <div className="relative">
       <div className="flex justify-center mb-4">
        <button
          onClick={() => setCurrentAnimation('multifunction')}
          className="p-2 mx-2 bg-gray-200"
        >
          Multifunction Animation
        </button>
        <button
          onClick={() => setCurrentAnimation('shape')}
          className="p-2 mx-2 bg-gray-200"
        >
          Shape Animation
        </button>
        <button
          onClick={() => setCurrentAnimation('color')}
          className="p-2 mx-2 bg-blue-500 text-white"
        >
          Color Animation
        </button>
      </div>
       <ControlPanelShape
         settings={settings}
         setSettings={setSettings}
         startAnimation={startAnimation}
         stopAnimation={stopAnimation}
         resetAnimation={resetAnimation}
       />
       <ReactP5Wrapper sketch={sketch} settings={settings} isAnimating={isAnimating} />
     </div>
   );
 };
 
 export default ShapeAnimations;
   
 */

/* import React, { useState, useEffect } from 'react';
import ControlPanelShape from './ControlPanelShape';
import { ReactP5Wrapper } from 'react-p5-wrapper';

const ShapeAnimation = () => {
  const defaultSettings = {
    shapeType: 'circle',
    direction: 'static',
    angle: 0,
    speed: 1,
    size: 50,
    numShapes: 10,
    bgColor: '#FFFFFF',
    shapeColor: '#FF0000',
    secondColor: '#0000FF',
    palette: 'none',
    rotationSpeed: 0.02,
    rotationRadius: 150,
     oscillationRange : 100,
    rowOffset: 0,
    columnOffset: 0,
    rowDistance: 50,
    columnDistance: 50,
    layoutSelect: 'random',
  };

  const [settings, setSettings] = useState(defaultSettings);
  const [isAnimating, setIsAnimating] = useState(true);
  let xOffset = 0;
  let yOffset = 0;
  let time = 0;

  const sketch = (p5) => {
    const palettes = {
      rainbow: ["#FF0000", "#FF7F00", "#FFFF00", "#7FFF00", "#00FF00", "#00FF7F", "#00FFFF", "#007FFF", "#0000FF", "#7F00FF", "#FF00FF", "#FF007F"],
      pastel: ["#FFD1DC", "#FFABAB", "#FFC3A0", "#FF677D", "#D4A5A5", "#392F5A", "#31A2AC", "#61C0BF", "#6B4226", "#ACD8AA"]
    };

    p5.setup = () => {
      p5.createCanvas(p5.windowWidth, p5.windowHeight);
      p5.noLoop();
    };

    p5.updateWithProps = (props) => {
      if (props.settings) {
        setSettings(props.settings);
      }
      if (props.isAnimating !== undefined) {
        setIsAnimating(props.isAnimating);
        if (props.isAnimating) {
          p5.loop();
        } else {
          p5.noLoop();
        }
      }
    };

    p5.draw = () => {
      if (!isAnimating) return;

      p5.clear();
      p5.background(p5.color(settings.bgColor));
      p5.noStroke();

      const oscillationAmplitudeX = settings. oscillationRange ;
      const oscillationAmplitudeY = settings. oscillationRange ;

      let shapeColor = p5.color(settings.shapeColor);
      let secondColor = p5.color(settings.secondColor);

      const rows = Math.ceil(p5.height / (settings.size + settings.rowDistance));
      const columns = Math.ceil(p5.width / (settings.size + settings.columnDistance));

      for (let i = 0; i <= rows; i++) {
        for (let j = 0; j <= columns; j++) {
          let x = j * (settings.size + settings.columnDistance) + (i * settings.columnOffset) - xOffset;
          let y = i * (settings.size + settings.rowDistance) + (j * settings.rowOffset) - yOffset;

          if (settings.layoutSelect === 'checkboard') {
            if ((i + j) % 2 === 0) {
              p5.fill(shapeColor);
            } else {
              p5.fill(secondColor);
            }
          } else {
            p5.fill(shapeColor);
          }

          switch (settings.shapeType) {
            case 'circle':
              p5.ellipse(x, y, settings.size, settings.size);
              break;
            case 'square':
              p5.rect(x, y, settings.size, settings.size);
              break;
            case 'triangle':
              p5.triangle(x, y - settings.size / 2, x - settings.size / 2, y + settings.size / 2, x + settings.size / 2, y + settings.size / 2);
              break;
            case 'chevron':
              p5.beginShape();
              p5.vertex(x, y - settings.size / 2);
              p5.vertex(x + settings.size / 2, y);
              p5.vertex(x, y + settings.size / 2);
              p5.vertex(x - settings.size / 2, y);
              p5.endShape(p5.CLOSE);
              break;
            case 'diamond':
              p5.beginShape();
              p5.vertex(x, y - settings.size / 2);
              p5.vertex(x + settings.size / 2, y);
              p5.vertex(x, y + settings.size / 2);
              p5.vertex(x - settings.size / 2, y);
              p5.endShape(p5.CLOSE);
              break;
            default:
              p5.ellipse(x, y, settings.size, settings.size);
          }
        }
      }

      switch (settings.direction) {
        case 'static':
          break;
        case 'up':
          yOffset -= settings.speed;
          break;
        case 'down':
          yOffset += settings.speed;
          break;
        case 'left':
          xOffset -= settings.speed;
          break;
        case 'right':
          xOffset += settings.speed;
          break;
          case 'oscillateUpDown':
            yOffset = oscillationAmplitudeY * p5.sin(time / 10); // Divide time for slower oscillation
            time += settings.speed / 10; // Adjust speed increment for smoother oscillation
            break;
          case 'oscillateRightLeft':
            x = oscillationAmplitudeX * p5.sin(time / 10); // Divide time for slower oscillation
            time += settings.speed / 10; // Adjust speed increment for smoother oscillation
            break;
        case 'circular':
          xOffset = settings.rotationRadius * p5.cos(time * settings.rotationSpeed);
          yOffset = settings.rotationRadius * p5.sin(time * settings.rotationSpeed);
          time += settings.speed;
          break;
        default:
          break;
      }

      if (xOffset > p5.width) {
        xOffset = 0;
      } else if (xOffset < -p5.width) {
        xOffset = 0;
      }

      if (yOffset > p5.height) {
        yOffset = 0;
      } else if (yOffset < -p5.height) {
        yOffset = 0;
      }
    };

    p5.windowResized = () => {
      p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
      p5.background(p5.color(settings.bgColor));
    };
  };

  const startAnimation = () => {
    setIsAnimating(true);
  };

  const stopAnimation = () => {
    setIsAnimating(false);
  };

  const resetAnimation = () => {
    setSettings(defaultSettings);
    xOffset = 0;
    yOffset = 0;
    time = 0;
    setIsAnimating(false);
    setTimeout(() => {
      setIsAnimating(true);
    }, 100);
  };

  useEffect(() => {
    startAnimation();
  }, []);

  return (
    <div className="relative">
    <div className="flex justify-center mb-4">
      <button
        onClick={() => setCurrentAnimation('multifunction')}
        className="p-2 mx-2 bg-gray-200"
      >
        Multifunction Animation
      </button>
      <button
        onClick={() => setCurrentAnimation('shape')}
        className="p-2 mx-2 bg-gray-200"
      >
        Shape Animation
      </button>
      <button
        onClick={() => setCurrentAnimation('color')}
        className="p-2 mx-2 bg-blue-500 text-white"
      >
        Color Animation
      </button>
    </div>
      <ControlPanelShape
        settings={settings}
        setSettings={setSettings}
        startAnimation={startAnimation}
        stopAnimation={stopAnimation}
        resetAnimation={resetAnimation}
      />
      <ReactP5Wrapper sketch={sketch} settings={settings} isAnimating={isAnimating} />
    </div>
  );
};

export default ShapeAnimation;
 */


/* import React, { useState, useEffect } from 'react';
import ControlPanelShape from './ControlPanelShape';
import { ReactP5Wrapper } from 'react-p5-wrapper';

const ShapeAnimation = () => {
  const defaultSettings = {
    shapeType: 'circle',
    direction: 'static',
    angle: 0,
    speed: 1,
    size: 50,
    numShapes: 10,
    bgColor: '#FFFFFF',
    shapeColor: '#FF0000',
    secondColor: '#0000FF',
    palette: 'none',
    rotationSpeed: 0.02,
    rotationRadius: 150,
     oscillationRange : 100,
    rowOffset: 0,
    columnOffset: 0,
    rowDistance: 50,
    columnDistance: 50,
    layoutSelect: 'regular',
  };

  const [settings, setSettings] = useState(defaultSettings);
  const [isAnimating, setIsAnimating] = useState(true);
  let xOffset = 0;
  let yOffset = 0;
  let time = 0;

  const sketch = (p5) => {
    const palettes = {
      rainbow: ["#FF0000", "#FF7F00", "#FFFF00", "#7FFF00", "#00FF00", "#00FF7F", "#00FFFF", "#007FFF", "#0000FF", "#7F00FF", "#FF00FF", "#FF007F"],
      pastel: ["#FFD1DC", "#FFABAB", "#FFC3A0", "#FF677D", "#D4A5A5", "#392F5A", "#31A2AC", "#61C0BF", "#6B4226", "#ACD8AA"]
    };

    p5.setup = () => {
      p5.createCanvas(p5.windowWidth, p5.windowHeight);
      p5.noLoop();
    };

    p5.updateWithProps = (props) => {
      if (props.settings) {
        setSettings(props.settings);
      }
      if (props.isAnimating !== undefined) {
        setIsAnimating(props.isAnimating);
        if (props.isAnimating) {
          p5.loop();
        } else {
          p5.noLoop();
        }
      }
    };

    p5.draw = () => {
      if (!isAnimating) return;

      p5.clear();
      p5.background(p5.color(settings.bgColor));
      p5.noStroke();

      const oscillationAmplitudeX = settings. oscillationRange ;
      const oscillationAmplitudeY = settings. oscillationRange ;

      let shapeColor = p5.color(settings.shapeColor);
      let secondColor = p5.color(settings.secondColor);

      const rows = Math.ceil(p5.height / (settings.size + settings.rowDistance));
      const columns = Math.ceil(p5.width / (settings.size + settings.columnDistance));

      for (let i = 0; i <= rows; i++) {
        for (let j = 0; j <= columns; j++) {
          let x = j * (settings.size + settings.columnDistance) + (i * settings.columnOffset) - xOffset;
          let y = i * (settings.size + settings.rowDistance) + (j * settings.rowOffset) - yOffset;

          if (settings.layoutSelect === 'checkboard') {
            if ((i + j) % 2 === 0) {
              p5.fill(shapeColor);
            } else {
              p5.fill(secondColor);
            }
          } else {
            p5.fill(shapeColor);
          }

          switch (settings.shapeType) {
            case 'circle':
              p5.ellipse(x, y, settings.size, settings.size);
              break;
            case 'square':
              p5.rect(x, y, settings.size, settings.size);
              break;
            case 'triangle':
              p5.triangle(x, y - settings.size / 2, x - settings.size / 2, y + settings.size / 2, x + settings.size / 2, y + settings.size / 2);
              break;
            case 'chevron':
              p5.beginShape();
              p5.vertex(x, y - settings.size / 2);
              p5.vertex(x + settings.size / 2, y);
              p5.vertex(x, y + settings.size / 2);
              p5.vertex(x - settings.size / 2, y);
              p5.endShape(p5.CLOSE);
              break;
            case 'diamond':
              p5.beginShape();
              p5.vertex(x, y - settings.size / 2);
              p5.vertex(x + settings.size / 2, y);
              p5.vertex(x, y + settings.size / 2);
              p5.vertex(x - settings.size / 2, y);
              p5.endShape(p5.CLOSE);
              break;
            default:
              p5.ellipse(x, y, settings.size, settings.size);
          }
        }
      }

      switch (settings.direction) {
        case 'static':
          break;
        case 'up':
          yOffset -= settings.speed;
          break;
        case 'down':
          yOffset += settings.speed;
          break;
        case 'left':
          xOffset -= settings.speed;
          break;
        case 'right':
          xOffset += settings.speed;
          break;
        case 'oscillateUpDown':
          yOffset = oscillationAmplitudeY * p5.sin(time);
          time += settings.speed;
          break;
        case 'oscillateRightLeft':
          xOffset = oscillationAmplitudeX * p5.sin(time);
          time += settings.speed;
          break;
        case 'circular':
          xOffset = settings.rotationRadius * p5.cos(time * settings.rotationSpeed);
          yOffset = settings.rotationRadius * p5.sin(time * settings.rotationSpeed);
          time += settings.speed;
          break;
        default:
          break;
      }

      if (xOffset > p5.width) {
        xOffset = 0;
      } else if (xOffset < -p5.width) {
        xOffset = 0;
      }

      if (yOffset > p5.height) {
        yOffset = 0;
      } else if (yOffset < -p5.height) {
        yOffset = 0;
      }
    };

    p5.windowResized = () => {
      p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
      p5.background(p5.color(settings.bgColor));
    };
  };

  const startAnimation = () => {
    setIsAnimating(true);
  };

  const stopAnimation = () => {
    setIsAnimating(false);
  };

  const resetAnimation = () => {
    setSettings(defaultSettings);
    xOffset = 0;
    yOffset = 0;
    time = 0;
    setIsAnimating(false);
    setTimeout(() => {
      setIsAnimating(true);
    }, 100);
  };

  useEffect(() => {
    startAnimation();
  }, []);

  return (
    <div className="w-full h-full bg-transparent">
      <ControlPanelShape
        settings={settings}
        setSettings={setSettings}
        startAnimation={startAnimation}
        stopAnimation={stopAnimation}
        resetAnimation={resetAnimation}
      />
      <ReactP5Wrapper sketch={sketch} settings={settings} isAnimating={isAnimating} />
    </div>
  );
};

export default ShapeAnimation;
 */


 