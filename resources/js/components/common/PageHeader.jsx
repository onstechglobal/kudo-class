import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import CustomButton from '../form/CustomButton';


const PageHeader = ({ prevRoute, breadcrumbParent = "Schools", breadcrumbCurrent, title }) => {
    return (
            <div className="flex items-center gap-4">
                <Link to={prevRoute}>
                    <button type="button" className="p-2 hover:bg-gray-100 rounded-full text-gray-400 cursor-pointer transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                </Link>

                <div>
                    <nav className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">
                        <Link to={prevRoute} className="hover:text-blue-800 transition-colors"> 
                            {breadcrumbParent} 
                        </Link>
                        <span className="text-gray-400 mx-2">/</span>
                        <span className="cursor-pointer uppercase font-bold">  {breadcrumbCurrent} </span>
                    </nav>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight"> 
                        {title} 
                    </h1>
                </div>
            </div>
    );
};

export default PageHeader;