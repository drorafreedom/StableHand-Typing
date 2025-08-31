// src/components/Therapy/BaselineTyping.tsx
import React, { useEffect } from 'react';
import ControlPanelBaselineTyping, { BaselineTypingSettings } from './ControlPanelBaselineTyping';
import { hexToRgba } from '../../utils/color';

interface Props {
  // make props optional so it won’t crash if parent hasn’t wired them yet
  settings?: BaselineTypingSettings;
  setSettings?: React.Dispatch<React.SetStateAction<BaselineTypingSettings>>;
}

const DEFAULTS: BaselineTypingSettings = { bgColor: '#ffffff', bgOpacity: 1 };

const BaselineTyping: React.FC<Props> = ({ settings, setSettings }) => {
  // fallbacks so we always have valid values
  const s: BaselineTypingSettings = {
    bgColor: settings?.bgColor ?? DEFAULTS.bgColor,
    bgOpacity: typeof settings?.bgOpacity === 'number' ? settings!.bgOpacity : DEFAULTS.bgOpacity,
  };

  useEffect(() => {
    const prev = document.body.style.backgroundColor;
    document.body.style.backgroundColor = hexToRgba(s.bgColor, s.bgOpacity);
    return () => { document.body.style.backgroundColor = prev; };
  }, [s.bgColor, s.bgOpacity]);

  return (
    <>
      <ControlPanelBaselineTyping
        settings={s}
        setSettings={setSettings ?? (() => {}) as any} // no-op if parent didn’t pass one
      />
    </>
  );
};

export default BaselineTyping;



// import React, { useState, useEffect } from 'react';
// import ControlPanelBaselineTyping from './ControlPanelBaselineTyping';
// import { hexToRgba } from '../../utils/color';

// export interface BaselineTypingSettings {
//   bgColor: string;   // "#RRGGBB" or "#RGB"
//   bgOpacity: number; // 0..1
// }

// const BaselineTyping: React.FC = () => {
//   const [settings, setSettings] = useState<BaselineTypingSettings>({
//     bgColor: '#ffffff',
//     bgOpacity: 1,
//   });

//   // Apply the background UNDER everything (doesn't cover your content)
//   useEffect(() => {
//     const prev = document.body.style.backgroundColor;
//     document.body.style.backgroundColor = hexToRgba(settings.bgColor, settings.bgOpacity);
//     return () => {
//       // restore previous background when this component unmounts
//       document.body.style.backgroundColor = prev;
//     };
//   }, [settings.bgColor, settings.bgOpacity]);

//   return (
//     <>
//       {/* Your foreground UI goes here (typing area, text, etc.) */}
//       <ControlPanelBaselineTyping settings={settings} setSettings={setSettings} />
//     </>
//   );
// };

// export default BaselineTyping;



// // src/components/Therapy/BaselineTyping.tsx
// import React, { useState, useEffect } from 'react';
// import ControlPanelBaselineTyping from './ControlPanelBaselineTyping';
// import { hexToRgba } from '../../utils/color';

// export interface BaselineTypingSettings {
//   bgColor: string;   // "#RRGGBB" or "#RGB"
//   bgOpacity: number; // 0..1
// }

// const BaselineTyping: React.FC = () => {
//   const [settings, setSettings] = useState<BaselineTypingSettings>({
//     bgColor: '#ffffff',
//     bgOpacity: 1,
//   });

//   // Apply the background color UNDER everything (doesn't cover your content)
//   useEffect(() => {
//     const prev = document.body.style.backgroundColor;
//     document.body.style.backgroundColor = hexToRgba(settings.bgColor, settings.bgOpacity);
//     return () => {
//       // restore previous background when this component unmounts
//       document.body.style.backgroundColor = prev;
//     };
//   }, [settings.bgColor, settings.bgOpacity]);

//   return (
//     <>
//       {/* Your foreground UI goes here (typing area, text, etc.) */}

//       {/* Control panel floats; updates settings */}
//       <ControlPanelBaselineTyping
//         settings={settings}
//         setSettings={setSettings}
//       />
//     </>
//   );
// };

// export default BaselineTyping;

