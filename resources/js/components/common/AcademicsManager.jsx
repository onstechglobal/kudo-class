import React, {useEffect, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import ClassListing from '../../pages/class/ClassListing';
import SectionListing from '../../pages/section/Index';
import { LayoutGrid, Layers } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const AcademicsManager = () => {
    // State to track which tab is active
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'classes');

    useEffect(() => {
        if (location.state?.activeTab) {
            setActiveTab(location.state.activeTab);
        }
    }, [location.state]);

    return (
        <AdminLayout>
            <div className="bg-gray-50 min-h-screen">
                {/* TAB NAVIGATION */}
                <div className="bg-white border-b border-gray-200 px-6 pt-4">
                    <div className="flex items-center gap-8">
                        <button
                            onClick={() => setActiveTab('classes')}
                            className={`flex items-center gap-2 pb-4 text-sm font-bold transition-all relative cursor-pointer ${activeTab === 'classes' ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
                                }`}
                        >
                            <LayoutGrid size={18} />
                            Classes
                            {activeTab === 'classes' && (
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full" />
                            )}
                        </button>

                        <button
                            onClick={() => setActiveTab('sections')}
                            className={`flex items-center gap-2 pb-4 text-sm font-bold transition-all relative cursor-pointer ${activeTab === 'sections' ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
                                }`}
                        >
                            <Layers size={18} />
                            Sections
                            {activeTab === 'sections' && (
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full" />
                            )}
                        </button>
                    </div>
                </div>

                {/* CONTENT AREA */}
                <div className="animate-in fade-in duration-500">
                    {activeTab === 'classes' ? (
                        <ClassListing isChildView={true} />
                    ) : (
                        <SectionListing isChildView={true} />
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AcademicsManager;