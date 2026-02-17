import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '../../layouts/AdminLayout';
import { Search, Users, MapPin, Phone, Pencil, Trash2, Filter, Loader2, CheckCircle2 } from 'lucide-react';
import { Api_url } from '../../helpers/api';
import Stat from '../../components/common/StatCard';
import CustomButton from '../../components/form/CustomButton';

const FamilyListing = () => {
    const [families, setFamilies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterOpen, setFilterOpen] = useState(false);

    const fetchFamilies = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${Api_url.name}api/get-families`, {
                params: { search: searchQuery }
            });
            if (response.data.status === 200) {
                setFamilies(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching families:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFamilies();
    }, []);

    // Stats calculation
    const uniqueCities = [...new Set(families.map(f => f.city))].length;

    return (
        <AdminLayout>
            <div className="p-6 bg-gray-50 min-h-screen">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Family Management</h1>
                        <p className="text-sm text-gray-500">Directory of registered student families and addresses</p>
                    </div>
                    
                </div>

                {/* STATS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <Stat label="Total Families" value={families.length} icon={<Users />} />
                    <Stat label="Cities Covered" value={uniqueCities} icon={<MapPin />} color="blue" />
                </div>

                {/* FILTERS */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 flex flex-wrap gap-4 items-center justify-between shadow-sm">
                    <div className="flex-1 min-w-[300px] relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by Phone, City or Address..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && fetchFamilies()}
                        />
                        <button
                            onClick={fetchFamilies}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#faae1c] text-white p-2 rounded-lg cursor-pointer"
                        >
                            <Search size={18} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>

                {/* TABLE */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase font-bold">
                                <tr>
                                    <th className="px-6 py-4 text-center">ID</th>
                                    <th className="px-6 py-4">Address</th>
                                    <th className="px-6 py-4">Primary Phone</th>
                                    <th className="px-6 py-4">City</th>
                                    <th className="px-6 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="p-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 className="animate-spin text-blue-600" size={32} />
                                                <p className="text-sm text-gray-500">Loading Families...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : families.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No families found</td>
                                    </tr>
                                ) : (
                                    families.map((family) => (
                                        <tr key={family.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-bold text-gray-400 text-center">#{family.id}</td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-800">{family.address_line1}</div>
                                                <div className="text-[10px] text-gray-400 uppercase tracking-tighter">Registered: {new Date(family.created_at).toLocaleDateString()}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                                    <Phone size={14} className="text-gray-400" />
                                                    {family.phone_number}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
                                                    {family.city}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <button className="text-amber-600 hover:bg-amber-50 p-2 rounded-lg transition-colors">
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default FamilyListing;