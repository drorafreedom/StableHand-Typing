// src/components/common/SidebarToggleButton.tsx

// just for the therapy page 
import React from 'react';
import parkinsonLogo from '../../assets/logos/parkinson-tremors.gif';

interface Props {
  onClick: () => void;
}

const SidebarToggleButton: React.FC<Props> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute top-2 left-2 z-50 p-1 focus:outline-none"
  >
    <img
      src={parkinsonLogo}
      alt="Toggle sidebar"
      className="w-8 h-8"
    />
  </button>
);

export default SidebarToggleButton;
