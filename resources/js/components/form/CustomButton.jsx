import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
 
const CustomButton = ({
  text = "Add New",
  to = "#",
  className = "",
  Icon = Plus,
  ...props
}) => {
  return (
    <Link to={to}>
      <button
        {...props}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm cursor-pointer ${className}`}
      >
        {Icon && <Icon size={16} />}
        {text}
      </button>
    </Link>
  );
};

export default CustomButton;