
// src/components/pages/EndUserPage.tsx
import React from 'react';
import EndUserGuideText from '../organisms/EndUserGuideText';
import { Frame3 } from '../common/Frame';

const EndUserPage: React.FC = () => (
    <Frame3 bgColor="bg-teal-500">
    <EndUserGuideText />
  </Frame3>
);

export default EndUserPage;
