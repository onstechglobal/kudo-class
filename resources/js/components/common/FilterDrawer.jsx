import React, { useEffect } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';

const FilterDrawer = ({ 
    isOpen, 
    onClose, 
    onApply, 
    onReset, 
    children, 
    title = "Filters" 
}) => {
    // Close drawer on ESC key
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.keyCode === 27) onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <>
            {/* Overlay */}
            <div 
                className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-[1000] transition-opacity duration-300 ${
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={onClose}
            />

            {/* Drawer */}
            <div className={`fixed top-0 right-0 h-full bg-white w-[350px] shadow-2xl z-[1001] transition-transform duration-300 ease-in-out transform flex flex-col ${
                isOpen ? 'translate-x-0' : 'translate-x-full'
            }`}>
                {/* Header */}
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal size={18} className="text-blue-600" />
                        <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {children}
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-gray-100 bg-gray-50 flex gap-3">
                    <button 
                        onClick={onReset}
                        className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                        Reset
                    </button>
                    <button 
                        onClick={onApply}
                        className="flex-1 px-4 py-2.5 bg-[#0468C3] text-white rounded-lg font-medium hover:bg-[#0468C3]/90 shadow-md transition-all active:scale-95"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>
        </>
    );
};

export default FilterDrawer;