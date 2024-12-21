// src/components/pages/DisclaimerPage.tsx

import React from 'react';
import DisclaimerForm from '../organisms/DisclaimerForm';
import { Frame2, Frame, Frame3 } from '../common/Frame';

const DisclaimerPage: React.FC = () => {
  return (
    <Frame3>
      <DisclaimerForm />
    </Frame3>
  );
};

export default DisclaimerPage;


//+++++++++++JS version+++++++++++++++++
//src\components\pages\DisclaimerPage.jsx
 // JS version
import React from 'react';
import DisclaimerForm from '../organisms/DisclaimerForm';
import { Frame2, Frame,Frame3 } from '../common/Frame';

const DisclaimerPage = () => {
  return (
   
      <Frame3> 
        <DisclaimerForm />
      </Frame3>
  
 );
};

export default DisclaimerPage;
