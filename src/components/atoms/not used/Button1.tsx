import React from 'react';

import "../../styles/components.css";
const Button = ({ children, onClick, type = 'button' }) => (
    <button onClick={onClick} type={type} className="button">
        {children}
    </button>
);

export default Button;
