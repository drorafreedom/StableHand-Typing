import React from 'react';
import './Button.css'; // Assuming you use a separate CSS file for button styles

const Button = ({ children, onClick, variant = 'primary', className = '', isDisabled = false, isLoading = false, ...props }) => {
    // Generate CSS class dynamically based on the variant and additional custom class
    const buttonClass = `button ${variant} ${className}`;

    return (
        <button
            className={buttonClass}
            onClick={onClick}
            disabled={isDisabled || isLoading}
            {...props}
        >
            {isLoading ? 'Loading...' : children}
        </button>
    );
};

export default Button;
