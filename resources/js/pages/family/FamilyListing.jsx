import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '../../layouts/AdminLayout';
import { ChevronLeft, ChevronRight, Search, Users, MapPin, Pencil, Trash2, Loader2, CheckCircle2 } from 'lucide-react';
import { Api_url } from '../../helpers/api';
import Stat from '../../components/common/StatCard';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal';
import { useLocation, useNavigate, Link } from 'react-router-dom';


const FamilyListing = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [families, setFamilies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // PAGINATION STATES
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);

    // MODAL STATES
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFamily, setSelectedFamily] = useState(null);

    const fetchFamilies = async (page = 1) => {
        setLoading(true);
        try {
            const response = await axios.get(`${Api_url.name}api/get-families`, {
                params: {
                    search: searchQuery,
                    page: page,        // Pass the requested page
                    per_page: 10       // You can make this dynamic if you want
                }
            });

            if (response.data.status === 200) {
                setFamilies(response.data.data);

                // UPDATE PAGINATION STATES
                setCurrentPage(response.data.meta.current_page);
                setLastPage(response.data.meta.last_page);
                setTotalRecords(response.data.meta.total);
            }
        } catch (error) {
            console.error("Error fetching families:", error);
        } finally {
            setLoading(false);
        }
    };

    // Create a helper for changing pages
    const changePage = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= lastPage) {
            setCurrentPage(pageNumber);
            fetchFamilies(pageNumber);
        }
    };


    const handleSearch = () => {
        fetchFamilies(1); // Always reset to page 1 on new search
    };



    // SOFT DELETE HANDLER
    const confirmDelete = async () => {
        try {
            const response = await axios.post(`${Api_url.name}api/delete-family`, {
                id: selectedFamily.id
            });
            if (response.data.status === 200) {
                setIsModalOpen(false);
                setSelectedFamily(null);
                fetchFamilies(); // Reloads the listing automatically
            }
        } catch (error) {
            console.error("Error deleting family:", error);
        }
    };

    useEffect(() => {
        // 4. Check if a message was passed from navigation
        if (location.state?.message) {
            setSuccessMsg(location.state.message);
            // Clear the message after 3 seconds
            navigate(location.pathname, { replace: true });
            const timer = setTimeout(() => setSuccessMsg(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [location.state]);

    useEffect(() => {
        fetchFamilies();
    }, []);

    const totalActive = families.length;
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


                {successMsg && (
                    <div className="mb-4 flex items-center justify-between bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl relative animate-in fade-in slide-in-from-top-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 size={18} />
                            <span className="text-sm font-bold">{successMsg}</span>
                        </div>
                        <button onClick={() => setSuccessMsg('')} className="text-green-700 font-bold">×</button>
                    </div>
                )}

                {/* STATS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Stat label="Total Families" value={families.length} icon={<Users />} />
                    <Stat label="Cities Covered" value={uniqueCities} icon={<MapPin />} color="blue" />
                    <Stat label="Active Families" value={totalActive} icon={<CheckCircle2 />} color="green" />
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
                                    <th className="px-6 py-4 text-center">S.No</th>
                                    <th className="px-6 py-4">Full Address</th>
                                    <th className="px-6 py-4">Contact</th>
                                    <th className="px-6 py-4">Parents Detail</th>
                                    <th className="px-6 py-4">Joined</th>
                                    <th className="px-6 py-4 text-center">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="p-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 className="animate-spin text-blue-600" size={32} />
                                                <p className="text-sm text-gray-500">Loading Families...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : families.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                            No families found
                                        </td>
                                    </tr>
                                ) : (
                                    families.map((family, index) => (
                                        <tr key={family.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-bold text-gray-400 text-center">
                                                {((currentPage - 1) * 10) + index + 1}
                                            </td>

                                            <td className="px-6 py-4 max-w-xs">
                                                <div className="text-sm font-medium text-gray-800 leading-tight">
                                                    {family.address_line1}
                                                    {family.address_line2 && `, ${family.address_line2}`}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-gray-500 "> City: {family.city}</span>
                                                    <span className="text-xs text-gray-500">
                                                        District:{family.district}{family.district && family.state ? ', ' : ''}{family.state}
                                                    </span>
                                                </div>
                                                <div className="text-xs  text-gray-500 uppercase tracking-tighter mt-1">
                                                    ID: #{family.id} | Pincode: {family.pincode || 'N/A'}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                                                        {family.phone_number}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-0.5">
                                                    {family.parent_details ? (
                                                        (() => {
                                                            const parents = family.parent_details.split('||');
                                                            const names = parents.map(p => p.split(':')[0]);
                                                            const firstMobile = parents[0].split(':')[1];
                                                            return (
                                                                <>
                                                                    {names.map((name, i) => (
                                                                        <span key={i} className="text-sm font-medium text-gray-800">
                                                                            {name}
                                                                        </span>
                                                                    ))}
                                                                    {firstMobile && (
                                                                        <span className="text-xs text-gray-500 mt-1">
                                                                            {firstMobile}
                                                                        </span>
                                                                    )}
                                                                </>
                                                            );
                                                        })()
                                                    ) : (
                                                        <span className="text-xs italic text-gray-400">No parents linked</span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-500 ">
                                                    {family.created_at ? new Date(family.created_at).toLocaleDateString() : 'N/A'}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <Link
                                                        to={`/families/edit/${family.id}`}
                                                        className="text-amber-600 hover:bg-amber-50 p-2 rounded-lg transition-colors cursor-pointer"
                                                    >
                                                        <Pencil size={16} />
                                                    </Link>
                                                    <button
                                                        title="Delete"
                                                        onClick={() => {
                                                            setSelectedFamily(family);
                                                            setIsModalOpen(true);
                                                        }}
                                                        className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors cursor-pointer"
                                                    >
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

                {/* PAGINATION CONTROLS (Now functional) */}
                <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-sm text-gray-500">
                        Showing <span className="font-semibold text-gray-800">{families.length}</span> of <span className="font-semibold text-gray-800">{totalRecords}</span> families
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={currentPage === 1 || loading}
                            onClick={() => changePage(currentPage - 1)}
                            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>

                        <div className="flex items-center gap-1">
                            <span className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-bold text-sm">
                                {currentPage}
                            </span>
                            <span className="text-gray-400">of</span>
                            <span className="px-4 py-2 text-gray-600 font-bold text-sm">
                                {lastPage}
                            </span>
                        </div>

                        <button
                            disabled={currentPage === lastPage || loading}
                            onClick={() => changePage(currentPage + 1)}
                            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {/* DELETE CONFIRMATION MODAL */}
                <DeleteConfirmModal
                    isOpen={isModalOpen}
                    title="Delete Family"
                    schoolName={selectedFamily ? `Family ID #${selectedFamily.id} at ${selectedFamily.address_line1}` : ""}
                    onClose={() => { setIsModalOpen(false); setSelectedFamily(null); }}
                    onDelete={confirmDelete}
                />
            </div>
        </AdminLayout>
    );
};

export default FamilyListing;