import React, { useState, useEffect } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';
import { Link } from "react-router-dom";
import { Plus, Calendar, Pencil, Trash2, CalendarDays, CheckCircle, Clock } from 'lucide-react';

const AcademicYear = () => {
    const [loading, setLoading] = useState(false);

    // Static data mapping exactly to your tb_academic_years columns
    const [academicData, setAcademicData] = useState([
        { 
            academic_year_id: 1, 
            school_id: 101, 
            year_name: '2024-2025', 
            start_date: '2024-04-01', 
            end_date: '2025-03-31', 
            is_active: 1 
        },
        { 
            academic_year_id: 2, 
            school_id: 101, 
            year_name: '2025-2026', 
            start_date: '2025-04-01', 
            end_date: '2026-03-31', 
            is_active: 0 
        }
    ]);

    return (
        <AdminLayout>
            <div className="p-6 bg-gray-50 min-h-screen">
                
                {/* --- HEADER --- */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Academic Sessions</h1>
                        <p className="text-sm text-gray-500">Configure and manage school year durations</p>
                    </div>
                    <Link to="/add-academic-year">
                        <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition shadow-sm">
                            <Plus size={16} /> Add New Year
                        </button>
                    </Link>
                </div>

                {/* --- STATS --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="bg-white p-5 rounded-xl border border-gray-200 flex items-center gap-4 shadow-sm">
                        <div className="bg-indigo-50 p-3 rounded-lg"><CalendarDays className="text-indigo-600" /></div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Active Year</p>
                            <p className="text-lg font-bold text-gray-800">
                                {academicData.find(y => y.is_active === 1)?.year_name || 'None Set'}
                            </p>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-gray-200 flex items-center gap-4 shadow-sm">
                        <div className="bg-emerald-50 p-3 rounded-lg"><CheckCircle className="text-emerald-600" /></div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Total Records</p>
                            <p className="text-lg font-bold text-gray-800">{academicData.length}</p>
                        </div>
                    </div>
                </div>

                {/* --- TABLE --- */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase font-bold">
                            <tr>
                                <th className="px-6 py-4">Session Name</th>
                                <th className="px-6 py-4">School Code </th>
                                <th className="px-6 py-4">Start Date</th>
                                <th className="px-6 py-4">End Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {academicData.map((year) => (
                                <tr key={year.academic_year_id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <Calendar className="text-indigo-500" size={18} />
                                            <span className="font-semibold text-gray-800">{year.year_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{year.school_id}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{year.start_date}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{year.end_date}</td>
                                    <td className="px-6 py-4">
                                        {year.is_active === 1 ? (
                                            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                                                Active Session
                                            </span>
                                        ) : (
                                            <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                                                Inactive
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center gap-4">
                                            <Link to={`/edit-academic-year/${year.academic_year_id}`} className="text-indigo-600 hover:scale-110 transition-transform">
                                                <Pencil size={16} />
                                            </Link>
                                            <button className="text-red-500 hover:scale-110 transition-transform">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AcademicYear;