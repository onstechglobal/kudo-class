import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

const CustomButton = ({ text = "Add New", to, className = "", Icon = Plus, type = "button", onClick, disabled = false, form }) => {
    const content = (
        <button 
            type={type} 
            form={form} // This is the key fix
            onClick={onClick}
            disabled={disabled}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
            {Icon && <Icon size={16} />}
            {text}
        </button>
    );

    return to ? <Link to={to}>{content}</Link> : content;
};

export default CustomButton;