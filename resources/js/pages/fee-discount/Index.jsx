import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import axios from 'axios';
import { Search, Percent, CheckCircle2, Filter } from 'lucide-react';
import { Api_url } from '../../helpers/api';
import Stat from '../../components/common/StatCard';

const Index = () => {
    const [loading, setLoading] = useState(true);
    const [discounts, setDiscounts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredDiscounts, setFilteredDiscounts] = useState([]);
    const [filterOpen, setFilterOpen] = useState(false); // State for the filter button

    const fetchDiscounts = () => {
        setLoading(true);
        const user = JSON.parse(localStorage.getItem("user"));
        let schoolId = user?.school_id;
        if (!schoolId || schoolId === 0) schoolId = 1;

        axios.get(`${Api_url.name}api/discounts`, {
            params: {
                schoolId: schoolId   // ✅ Added here
            }
        })
        .then(res => {
            const rows = res.data?.data || [];
            // Strictly show only active records
            const activeOnly = rows.filter(r => r.status === 'active');
            setDiscounts(activeOnly);
            setFilteredDiscounts(activeOnly);
            setLoading(false);
        })
        .catch(() => {
            setDiscounts([]);
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchDiscounts();
    }, []);

    // Logic for the Search Button Click
    const handleSearchClick = () => {
        const filtered = discounts.filter(d => 
            d.parent_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.applies_to_fee_type.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredDiscounts(filtered);
    };

    const handleKeyPress = (e) => e.key === 'Enter' && handleSearchClick();

    return (
        <AdminLayout>
            <div className="p-6 bg-gray-50 min-h-screen font-sans">
                
                {/* PAGE HEADER - No Add Button */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">Student Discounts</h1>
                    <p className="text-sm text-gray-500">View active fee concessions and payment benefits</p>
                </div>

                {/* STATS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <Stat label="Active Offers" value={discounts.length} icon={<Percent />} color="blue" />
                    <Stat label="Status" value="Verified Active" icon={<CheckCircle2 />} color="green" />
                </div>

                {/* SEARCH & FILTER BAR - Restored More Filters Button */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 shadow-sm">
                    <div className="sm:flex gap-3">
                        <div className="mb-4 sm:mb-0 flex-1 min-w-[200px] sm:min-w-[300px] w-full">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Search discount..."
                                    className="w-full pl-10 pr-12 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                                <button
                                    onClick={handleSearchClick}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#faae1c] hover:bg-[#faae1c]/90 text-white p-2 rounded-lg cursor-pointer transition-colors"
                                >
                                    <Search size={18} strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={() => setFilterOpen(true)}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors border border-gray-200"
                        >
                            <Filter size={16} /> 
                            <span className="font-medium">More Filters</span>
                        </button>
                    </div>
                </div>

                {/* TABLE - No Actions Column */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase font-bold text-gray-600">
                                <tr>
                                    <th className="px-6 py-4">Parent Type</th>
                                    <th className="px-6 py-4">Fee Type</th>
                                    <th className="px-6 py-4">Discount Type</th>
                                    <th className="px-6 py-4">Value</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="p-12 text-center text-gray-400">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
                                                <p className="text-sm">Loading data...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredDiscounts.length ? (
                                    filteredDiscounts.map((d) => (
                                        <tr key={d.discount_id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-semibold text-gray-800 capitalize">{d.parent_type}</td>
                                            <td className="px-6 py-4 text-gray-600 capitalize">{d.applies_to_fee_type}</td>
                                            <td className="px-6 py-4 text-gray-600 capitalize">{d.discount_type}</td>
                                            <td className="px-6 py-4 font-bold text-blue-700">
                                                {d.discount_type === 'percentage' 
                                                    ? `${d.discount_value}%` 
                                                    : `₹${d.discount_value}`}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">
                                                    Active
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="p-10 text-center text-gray-400">No active discounts found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Index;