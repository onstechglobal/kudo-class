import { useLocation, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import axios from 'axios';
import { Link } from "react-router-dom";
import {
    Search, Filter, Percent, IndianRupee, CheckCircle2, XCircle, Pencil, Trash2
} from 'lucide-react';
import { Api_url } from '../../helpers/api';
import CustomButton from '../../components/form/CustomButton';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal';
import Stat from '../../components/common/StatCard';

const Index = () => {
    const location = useLocation();
    const [message, setMessage] = useState('');
    const [messageClass, setMessageClass] = useState('');
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [discounts, setDiscounts] = useState([]);

    const [total, setTotal] = useState(0);
    const [active, setActive] = useState(0);
    const [inactive, setInactive] = useState(0);

    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [paginationInfo, setPaginationInfo] = useState({ from: 0, to: 0 });

    const [searchQuery, setSearchQuery] = useState('');
    const [appliedSearch, setAppliedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [filterOpen, setFilterOpen] = useState(false);

    const [open, setOpen] = useState(false);
    const [selectedDiscount, setSelectedDiscount] = useState(null);

    const statusOptions = [
        { label: "Status (All)", value: "" },
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
    ];

    const fetchDiscounts = (page) => {
        setLoading(true);
        const user = JSON.parse(localStorage.getItem("user"));
        let schoolId = user?.school_id;
        if (!schoolId || schoolId === 0) schoolId = 1;

        axios.get(`${Api_url.name}api/discounts`, {
            params: {
                schoolId: schoolId,
                page,
                search: appliedSearch,
                status: statusFilter,
            }
        }).then(res => {
            const rows = res.data?.data || [];
            setDiscounts(rows);
            setTotal(rows.length);
            setActive(rows.filter(r => r.status === 'active').length);
            setInactive(rows.filter(r => r.status === 'inactive').length);
            setCurrentPage(1);
            setLastPage(1);
            setPaginationInfo({
                from: rows.length ? 1 : 0,
                to: rows.length
            });
            setLoading(false);
        }).catch(() => {
            setDiscounts([]);
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchDiscounts(currentPage);
    }, [currentPage, appliedSearch, statusFilter]);

    useEffect(() => {
        if (currentPage !== 1) setCurrentPage(1);
    }, [appliedSearch, statusFilter]);

    /* Add/edit/delete success message */
    useEffect(() => {
        if (location.state?.message) {

            if (location.state.status && location.state.status === 'success') {
                setMessageClass('text-green-700 border-green-600 bg-green-50');

            } else if (location.state.status && location.state.status === 'failed') {
                setMessageClass('text-red-700 border-red-600 bg-red-50');

            } else {
                setMessageClass('');
            }

            setMessage(location.state.message);

            const timer = setTimeout(() => {
                setMessage('');
                setMessageClass('');
            }, 5000);

            // 🔥 clear router state (same as academic)
            setTimeout(() => {
                navigate(location.pathname, { replace: true });
            }, 0);

            return () => clearTimeout(timer);
        }
    }, []);


    const handleSearchClick = () => setAppliedSearch(searchQuery);
    const handleKeyPress = (e) => e.key === 'Enter' && handleSearchClick();

    const handleDelete = async (id) => {
        try {
            const response = await axios.delete(
                `${Api_url.name}api/discounts/${id}`,
                { withCredentials: true }
            );

            if (response.data.success) {

                setDiscounts(prev => {
                    const updated = prev.filter(d => d.discount_id !== id);

                    // 🔥 FIX COUNTS & PAGINATION
                    setTotal(updated.length);
                    setActive(updated.filter(d => d.status === 'active').length);
                    setInactive(updated.filter(d => d.status === 'inactive').length);
                    setPaginationInfo({
                        from: updated.length ? 1 : 0,
                        to: updated.length
                    });

                    return updated;
                });

                setMessage('Discount deleted successfully!');
                setMessageClass('bg-green-50 text-green-700 border-green-500');

                setTimeout(() => setMessage(''), 5000);
            }
        } catch (error) {
            console.error("Delete Error:", error);
            setLoading(false);
        }
    };



    return (
        <AdminLayout>
            <DeleteConfirmModal
                isOpen={open}
                title="Delete Discount"
                schoolName={selectedDiscount?.name || ""}
                onClose={() => setOpen(false)}
                onDelete={() => {
                    handleDelete(selectedDiscount?.id);
                    setOpen(false);
                }}
            />

            <div className="p-6 bg-gray-50 min-h-screen font-sans">

                {/* PAGE HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Discounts</h1>
                        <p className="text-sm text-gray-500">Manage fee & payment discounts</p>
                    </div>
                    <CustomButton
                        text="Add Discount"
                        to="/discounts/add"
                        className="bg-[#faae1c] text-white hover:bg-[#faae1c]/85"
                    />
                </div>

                {/* STATS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Stat label="Total Discounts" value={total} icon={<Percent />} />
                    <Stat label="Active" value={active} icon={<CheckCircle2 />} color="green" />
                    <Stat label="Inactive" value={inactive} icon={<XCircle />} color="red" />
                </div>

                {/* FILTER BAR */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6">
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
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#faae1c] hover:bg-[#faae1c]/90 text-white p-2 rounded-lg cursor-pointer"
                                >
                                    <Search size={18} strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={() => setFilterOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg"
                        >
                            <Filter size={16} /> <span className="font-medium">More Filters</span>
                        </button>
                    </div>
                </div>

                {/* ---- Success Messages ---- */}
                {message && (
                    <div className={`flex items-center gap-2 rounded-lg border border-l-[3px] border-r-[3px] ${messageClass} px-4 py-3 text-sm font-medium mb-3`}>
                    {message}
                    </div>
                )}

                {/* TABLE */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase font-bold">
                                <tr>
                                    <th className="px-6 py-4">Parent Type</th>
                                    <th className="px-6 py-4">Fee Type</th>
                                    <th className="px-6 py-4">Discount Type</th>
                                    <th className="px-6 py-4">Value</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 min-h-[400px]">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="p-6 text-center text-gray-500">
                                            <div className="inset-0 z-10 flex items-center justify-center rounded-xl">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
                                                    <p className="text-xs font-medium text-gray-600 animate-pulse tracking-widest">
                                                        Loading Data...
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : discounts.length ? (
                                    discounts.map((d) => (
                                        <tr key={d.discount_id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium capitalize">{d.parent_type}</td>
                                            <td className="px-6 py-4 capitalize">{d.applies_to_fee_type}</td>
                                            <td className="px-6 py-4 capitalize">{d.discount_type}</td>
                                            <td className="px-6 py-4 font-bold">
                                                {d.discount_type === 'percentage'
                                                    ? `${d.discount_value}%`
                                                    : `₹${d.discount_value}`}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${d.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {d.status === 'active' ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center gap-3">
                                                    <Link to={`/discounts/edit/${d.discount_id}`} className="text-amber-600">
                                                        <Pencil size={16} />
                                                    </Link>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedDiscount({ id: d.discount_id, name: d.parent_type });
                                                            setOpen(true);
                                                        }}
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="p-8 text-center">No data found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION */}
                    {!loading && discounts.length > 0 && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 sm:flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                                Showing {paginationInfo.from} to {paginationInfo.to} of {total} records
                            </span>
                            <div className="flex gap-2 mt-2 sm:mt-0">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                    className={`px-2 sm:px-3 py-1 border rounded text-xs sm:text-sm ${currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white hover:bg-gray-50 cursor-pointer'}`}
                                >
                                    Prev
                                </button>
                                <div className="flex items-center px-2 sm:px-4 text-sm font-medium">
                                    Page {currentPage} of {lastPage}
                                </div>
                                <button
                                    disabled={currentPage === lastPage}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    className={`px-2 sm:px-3 py-1 border rounded text-xs sm:text-sm ${currentPage === lastPage ? 'bg-gray-100 text-gray-400' : 'bg-white hover:bg-gray-50 cursor-pointer'}`}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default Index;
