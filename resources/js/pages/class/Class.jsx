import React, { useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { Link } from "react-router-dom";
import { 
    Search, LayoutGrid, CheckCircle2, XCircle, Pencil, Trash2, 
    Layers, School, ArrowUpDown 
} from 'lucide-react';

import CustomButton from '../../components/form/CustomButton';
import CustomSelect from '../../components/form/CustomSelect';
import AvatarLetter from '../../components/AvatarLetter';
import Stat from '../../components/StatCard';

const ClassListing = () => {
    // Static Data matching tb_classes structure
    const STATIC_CLASSES = [
        { class_id: 1, school_id: 101, school_name: "Greenwood High", class_name: "Grade 1", class_order: 1, status: "active", created_at: "2024-01-10" },
        { class_id: 2, school_id: 101, school_name: "Greenwood High", class_name: "Grade 2", class_order: 2, status: "active", created_at: "2024-01-12" },
        { class_id: 3, school_id: 102, school_name: "Oakridge Academy", class_name: "Kindergarten", class_order: 0, status: "inactive", created_at: "2024-01-15" },
        { class_id: 4, school_id: 101, school_name: "Greenwood High", class_name: "Grade 3", class_order: 3, status: "active", created_at: "2024-01-20" },
    ];

    const [searchQuery, setSearchQuery] = useState('');

    const statusOptions = [
        { label: "All Status", value: "" },
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
    ];

    return (
        <AdminLayout>
            <div className="p-6 bg-gray-50 min-h-screen font-sans">
                
                {/* PAGE HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Class Management</h1>
                        <p className="text-sm text-gray-500">Define and organize classes across different schools</p>
                    </div>
                    <CustomButton
                        text="Add New Class"
                        to="/class/add"
                        className="bg-[#faae1c] text-white hover:bg-[#faae1c]/85 shadow-md"
                    />
                </div>

                {/* STATS CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Stat label="Total Classes" value={STATIC_CLASSES.length} icon={<Layers />} />
                    <Stat label="Active" value="3" icon={<CheckCircle2 />} color="green" />
                    <Stat label="Inactive" value="1" icon={<XCircle />} color="red" />
                </div>

                {/* FILTERS */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 flex flex-wrap gap-4 items-center justify-between shadow-sm">
                    <div className="flex-1 min-w-[300px] relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by class name or school..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="w-48">
                        <CustomSelect
                            options={statusOptions}
                            placeholder="Status"
                            onChange={() => {}}
                        />
                    </div>
                </div>

                {/* TABLE SECTION */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase font-bold">
                                <tr>
                                    <th className="px-6 py-4">School</th>
                                    <th className="px-6 py-4">Class Name</th>
                                    <th className="px-6 py-4 flex items-center gap-1">
                                        Order <ArrowUpDown size={14} className="text-gray-400" />
                                    </th>
                                    <th className="px-6 py-4">Created Date</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {STATIC_CLASSES.map((item) => (
                                    <tr key={item.class_id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <AvatarLetter text={item.school_name} size={35} />
                                                <span className="text-sm font-semibold text-gray-700">{item.school_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                                                    <LayoutGrid size={16} />
                                                </div>
                                                <span className="font-bold text-gray-900">{item.class_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-md text-xs font-mono font-bold">
                                                #{item.class_order}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {item.created_at}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                                item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center items-center gap-3">
                                                <button className="text-amber-600 hover:text-amber-800 transition-colors p-1 hover:bg-amber-50 rounded">
                                                    <Pencil size={16} />
                                                </button>
                                                <button className="text-red-600 hover:text-red-800 transition-colors p-1 hover:bg-red-50 rounded">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* STATIC FOOTER */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                            Showing 1 to {STATIC_CLASSES.length} of {STATIC_CLASSES.length} records
                        </span>
                        <div className="flex gap-2">
                            <button className="px-4 py-1.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-400 cursor-not-allowed" disabled>Prev</button>
                            <button className="px-4 py-1.5 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50 font-medium">Next</button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default ClassListing;