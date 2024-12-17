import React from 'react';
import './Input.css'; // Assuming you use a separate CSS file for input styles

const Input = ({ type = 'text', onChange, placeholder, className = '', size = 'default', ...props }) => {
    // Generate CSS class dynamically based on the size and additional custom class
    const inputClass = `input ${size} ${className}`;

    return (
        <input
            type={type}
            onChange={onChange}
            placeholder={placeholder}
            className={inputClass}
            {...props}
        />
    );
};

export default Input;
