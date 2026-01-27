import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import CustomButton from '../form/CustomButton';


const PageHeader = ({ prevRoute, breadcrumbCurrent, title, buttonText, buttonIcon, onButtonClick, onBreadcrumbClick, loading = false, form }) => {
    return (
        <div className="bg-white border-b border-gray-200 px-8 py-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link to={prevRoute}>
                        <button type="button" className="p-2 hover:bg-gray-100 rounded-full text-gray-400 cursor-pointer transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                    </Link>

                    <div>
                        <nav className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">
                            <Link to={prevRoute} className="hover:text-blue-800 transition-colors"> Schools </Link>
                            <span className="text-gray-400 mx-2">/</span>
                            <button type="button" onClick={onBreadcrumbClick} className="hover:text-blue-800 transition-colors cursor-pointer uppercase font-bold"> {breadcrumbCurrent} </button>
                        </nav>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight"> {title}  </h1>
                    </div>
                </div>

                {buttonText && (
                    <CustomButton
                        text={loading ? "Processing..." : buttonText}
                        Icon={buttonIcon}
                        className="bg-[#faae1c] text-white hover:bg-[#faae1c]/90"
                        type="submit"
                        form={form} // Pass it here
                        onClick={onButtonClick}
                        disabled={loading}
                    />
                )}
            </div>
        </div>
    );
};

export default PageHeader;