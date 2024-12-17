// src/components/common/AutosizeInputField.jsx
/* import { Row } from "react-bootstrap";
import { Col } from "react-bootstrap";
import { Container } from "react-bootstrap"; */
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


