// PatternControl.js
import React from 'react';

class PatternControl extends React.Component {
  handlePatternTypeChange = (e) => {
    this.props.setPatternType(e.target.value);
  };

  handleParameterChange = (paramName, value) => {
    this.props.setPatternParams(prevParams => ({
      ...prevParams,
      [paramName]: value
    }));
  };

  render() {
    return (
      <div >
        <div style={{ marginBottom: '10px' }}>
          <label>Pattern Type:</label>
          <select onChange={this.handlePatternTypeChange}>
            <option value="sineWave">Sine Wave</option>
            <option value="chevrons">Chevrons</option>
            <option value="checkerboard">Checkerboard</option>
          </select>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Amplitude:</label>
          <input type="number" onChange={(e) => this.handleParameterChange('amplitude', parseInt(e.target.value, 10))} />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Frequency:</label>
          <input type="number" onChange={(e) => this.handleParameterChange('frequency', parseInt(e.target.value, 10))} />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Rotation:</label>
          <input type="number" onChange={(e) => this.handleParameterChange('rotation', parseInt(e.target.value, 10))} />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Duplicates:</label>
          <input type="number" onChange={(e) => this.handleParameterChange('duplicates', parseInt(e.target.value, 10))} />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Translate Speed:</label>
          <input type="number" onChange={(e) => this.handleParameterChange('translateSpeed', parseInt(e.target.value, 10))} />
        </div>
      </div>
    );
  }
}

export default PatternControl;