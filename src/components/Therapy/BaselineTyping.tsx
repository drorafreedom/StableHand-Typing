// src/components/Therapy/BaselineTyping.tsx
import React, { useState, useEffect } from 'react';
import ControlPanelBaselineTyping from './ControlPanelBaselineTyping';
import { hexToRgba } from '../../utils/color';

export interface BaselineTypingSettings {
  bgColor: string;   // "#RRGGBB" or "#RGB"
  bgOpacity: number; // 0..1
}

const BaselineTyping: React.FC = () => {
  const [settings, setSettings] = useState<BaselineTypingSettings>({
    bgColor: '#ffffff',
    bgOpacity: 1,
  });

  // Apply the background color UNDER everything (doesn't cover your content)
  useEffect(() => {
    const prev = document.body.style.backgroundColor;
    document.body.style.backgroundColor = hexToRgba(settings.bgColor, settings.bgOpacity);
    return () => {
      // restore previous background when this component unmounts
      document.body.style.backgroundColor = prev;
    };
  }, [settings.bgColor, settings.bgOpacity]);

  return (
    <>
      {/* Your foreground UI goes here (typing area, text, etc.) */}

      {/* Control panel floats; updates settings */}
      <ControlPanelBaselineTyping
        settings={settings}
        setSettings={setSettings}
      />
    </>
  );
};

export default BaselineTyping;

