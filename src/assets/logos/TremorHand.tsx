//src/components/logos/TremorHand.tsx
import * as React from 'react';

const TremorHand = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    {/* “menu” hint lines (optional) */}
    <path d="M3.5 5.5h8.5" strokeWidth={2} strokeLinecap="round" opacity={0.45}/>
    <path d="M3.5 8.5h8.5" strokeWidth={2} strokeLinecap="round" opacity={0.45}/>

    {/* fingers */}
    <path d="M8 11V6a1 1 0 1 1 2 0v5" strokeWidth={1.8} strokeLinecap="round"/>
    <path d="M10 11V5a1 1 0 1 1 2 0v6" strokeWidth={1.8} strokeLinecap="round"/>
    <path d="M12 11V6a1 1 0 1 1 2 0v5" strokeWidth={1.8} strokeLinecap="round"/>
    <path d="M14 12V7a1 1 0 1 1 2 0v5" strokeWidth={1.8} strokeLinecap="round"/>

    {/* palm */}
    <path d="M8 13c0 3 2 5 5 5s5-2 5-5v-1" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>

    {/* tremor lines */}
    <path d="M5 12c-1 .2-1.8.8-2.4 1.6" strokeWidth={1.4} strokeLinecap="round"/>
    <path d="M4.6 16c-.6.6-1.2 1-2 1.2" strokeWidth={1.4} strokeLinecap="round"/>
  </svg>
);

export default TremorHand;
