
// src/components/common/AutosizeInputField.tsx
//TS version
import React, { useRef, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";

// Define the props interface
interface AutosizeInputFieldProps {
  logText: string;
  logFileName: string;
}

const AutosizeInputField: React.FC<AutosizeInputFieldProps> = ({ logText, logFileName }) => {
  const textArea = useRef<HTMLTextAreaElement | null>(null);

  // After render, this scrolls the textArea to the bottom.
  useEffect(() => {
    const area = textArea.current;
    if (area) {
      area.scrollTop = area.scrollHeight;
    }
  }, [logText]); // Added dependency on `logText` to trigger the effect when it changes.

  return (
    <div>
      <Container fluid>
        <Row>&nbsp;</Row>
        <Row>&nbsp;</Row>
        <Row>
          <Col></Col>
          <Col>
            <h6>Current Log: {logFileName}</h6>
          </Col>
          <Col></Col>
        </Row>
        <Row>
          <Col>
            <textarea
              value={logText}
              readOnly={true}
              ref={textArea} // This links the useRef() hook to this object in the DOM
              className="w-100" // Optional: Ensure the textarea takes full width
            />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AutosizeInputField;


// src/components/common/AutosizeInputField.jsx
//JS verwsion
import { useRef, useEffect } from "react";

const AutosizeInputField = (props) => {
  const logText = props.logText;
  const logFileName = props.logFileName;
  const textArea = useRef();
  
  // After render, this scrolls the textArea to the bottom.
  useEffect(() => {
    const area = textArea.current;
    area.scrollTop = area.scrollHeight;
  });

  return (
    <div>
      <Container fluid>
        <Row>&nbsp;</Row>
        <Row>&nbsp;</Row>
        <Row>
          <Col></Col>
          <Col>
            <h6>Current Log: {logFileName}</h6>
          </Col>
          <Col></Col>
        </Row>
        <Row>
          <Col>
            <textarea                 
              value={logText}
              readOnly={true}
              ref={textArea}    // This links the useRef() hook to this object in the dom
            />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

 
export default AutosizeInputField;


