import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

const CustomButton = ({ text = "Add New", to, className = "", Icon = Plus, loading = false, ...props }) => {
  const buttonClasses = `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm cursor-pointer ${className}`;

  if (!to || props.type === "submit") {
    return (
      <button
        {...props}
        disabled={loading || props.disabled}
        className={buttonClasses}
      >
        {Icon && <Icon size={16} />}
        {text}
      </button>
    );
  }

  return (
    <Link to={to}>
      <button className={buttonClasses}>
        {Icon && <Icon size={16} />}
        {text}
      </button>
    </Link>
  );
};

export default CustomButton;
