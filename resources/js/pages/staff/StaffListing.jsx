import { useLocation, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import axios from 'axios';
import { Link } from "react-router-dom";
import {
    Search, Filter, Pencil, Trash2, UserCheck, Users, UserMinus,
    ShieldCheck, Mail, Phone, SlidersHorizontal
} from 'lucide-react';
import { Api_url } from '../../helpers/api';
import CustomButton from '../../components/form/CustomButton'; 
import Input from '../../components/form/Input';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal';
import CustomSelect from '../../components/form/CustomSelect';
import AvatarLetter from '../../components/common/AvatarLetter';
import Stat from '../../components/common/StatCard';


const StaffListing = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [message, setMessage] = useState('');

    const [loading, setLoading] = useState(true);
    const [staff_data, setStaff] = useState([]);
    const [total_staff, setTotalStaff] = useState(0);
    const [active_staff, setActiveStaff] = useState(0);
    const [inactive_staff, setInactiveStaff] = useState(0);
    const [imgError, setImgError] = useState({});

    // PAGINATION STATES
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [paginationInfo, setPaginationInfo] = useState({ from: 0, to: 0 });

    // FILTER STATES
    const [searchQuery, setSearchQuery] = useState('');
    const [searchInput, setSearchInput] = useState("");
    const [appliedSearch, setAppliedSearch] = useState('');

    /* Filter Drawer States */
    const [filterOpen, setFilterOpen] = useState(false);
    const [filterEmail, setFilterEmail] = useState("");
    const [filterPhone, setFilterPhone] = useState("");
    const [roleFilter, setRoleFilter] = useState('');

    const roleOptions = [
        { label: "All", value: "" },
        { label: "Administrator", value: "Administrator" },
        { label: "Accountant", value: "Accountant" },
        { label: "Receptionist", value: "Receptionist" },
        { label: "Librarian", value: "Librarian" },
    ];

    const statusOptions = [
        { label: "Status (All)", value: "" },
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
    ];

    const fetchStaff = (page) => {
        setLoading(true);
        axios.get(`${Api_url.name}api/get_staff_data`, {
            params: {
                page: page,
                search: appliedSearch,
                role: roleFilter,
                email: filterEmail, // Added
                phone: filterPhone, // Added
            }
        })
            .then(res => {
                // ... existing logic ...
                setStaff(res.data.data || []);
                setTotalStaff(res.data.total || 0);
                setActiveStaff(res.data.active || 0);
                setInactiveStaff(res.data.inactive || 0);
                setCurrentPage(res.data.current_page || 1);
                setLastPage(res.data.last_page || 1);
                setPaginationInfo({
                    from: res.data.from || 0,
                    to: res.data.to || 0
                });
                setLoading(false);
            })
            .catch(err => {
                console.error("Fetch Error:", err);
                setStaff([]);
                setLoading(false);
            });
    };

    // TRIGGER FETCH ON FILTER CHANGE
    useEffect(() => {
        fetchStaff(currentPage);
    }, [currentPage, appliedSearch, roleFilter, filterEmail, filterPhone]);

    /* Add/edit success message */
    useEffect(() => {
        if (location.state?.message) {
        setMessage(location.state.message);

        const timer = setTimeout(() => {
            setMessage('');
        }, 5000);

        setTimeout(() => {
            navigate(location.pathname, { replace: true });
        }, 0);

        return () => clearTimeout(timer);
        }
    }, []);

    const handleSearchClick = () => {
        setAppliedSearch(searchQuery);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearchClick();
        }
    };

    /* ================= ACTIONS ================= */
    const applySearch = () => {

        setAppliedSearch(searchInput);
        setCurrentPage(1);
    };

   
    const handleDelete = async (id) => {
        try {
            setLoading(true);
            const { data: csrfData } = await axios.get(`${Api_url.name}api/csrf-token`);
            const response = await axios.post(`${Api_url.name}api/delete-staff/${id}`, {}, {
                headers: { 'X-CSRF-TOKEN': csrfData.token },
                withCredentials: true
            });

            if (response.data.status === 200) {
                fetchStaff(currentPage);
                setMessage('Deleted Successfully');
                setMessageClass('text-red-700 border-red-600 bg-red-50');

                const timer = setTimeout(() => {
                    setMessage('');
                    setMessageClass('');
                }, 5000);
            }
        } catch (error) {
            console.error("Delete Error:", error);
            setLoading(false);
        }
    
};


    const scrambleId = (id) => {
        if (!id) return '';
        const hex = id.toString(16);
        const salted = `st_${hex}_z1`;
        return btoa(salted).replace(/=/g, '');
    };

    const [open, setOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);

    const handleOpenModal = (staff) => {
        setSelectedStaff(staff);
        setOpen(true);
    };

    return (
        <AdminLayout>
            <DeleteConfirmModal
                isOpen={open}
                schoolName={selectedStaff ? selectedStaff.name : ""}
                onClose={() => {
                    setOpen(false);
                    setSelectedStaff(null);
                }}
                onDelete={() => {
                    handleDelete(selectedStaff.staff_id);
                    setOpen(false);
                    setSelectedStaff(null);
                }}
            />


            {/* OVERLAY */}
            {filterOpen && (
                <div
                    className="fixed inset-0 bg-black/30 z-40"
                    onClick={() => setFilterOpen(false)}
                />
            )}

            {/* FILTER DRAWER */}
            <div
                className={`fixed top-0 right-0 h-full w-[360px] bg-white z-50 shadow-xl transform transition-transform duration-300 flex flex-col
                ${filterOpen ? "translate-x-0" : "translate-x-full"}`}
            >
                {/* HEADER */}
                <div className="flex justify-between items-center p-5 border-b border-gray-200">
                    <h3 className="font-bold text-lg">Filters</h3>
                    <button onClick={() => setFilterOpen(false)} className="cursor-pointer">✕</button>
                </div>

                {/* BODY */}
                <div className="p-5 space-y-5 overflow-y-auto flex-1">
                    <Input
                        label="Email"
                        value={filterEmail}
                        onChange={(e) => setFilterEmail(e.target.value)}
                        placeholder="Search by email"
                    />

                    <Input
                        label="Phone"
                        value={filterPhone}
                        onChange={(e) => setFilterPhone(e.target.value)}
                        placeholder="Search by phone"
                    />

                    <CustomSelect label="Staff Role" options={roleOptions} value={roleFilter} onChange={setRoleFilter} placeholder="All Roles" />
                </div>

                {/* FOOTER */}
                <div className="p-5 border-t border-gray-200 bg-white flex gap-3">
                    <button
                        onClick={() => {
                            setFilterEmail("");
                            setFilterPhone("");
                            setRoleFilter("");
                            setAppliedSearch("");
                            setSearchQuery("");
                            setCurrentPage(1);
                        }}
                        className="flex-1 bg-gray-100 rounded-lg py-2 text-sm font-medium cursor-pointer"
                    >
                        Reset
                    </button>

                    <button
                        onClick={() => {
                            setCurrentPage(1);
                            // This manually triggers fetchStaff if page was already 1
                            if (currentPage === 1) {
                                fetchStaff(1);
                            }
                            setFilterOpen(false);
                        }}
                        className="flex-1 rounded-lg py-2 text-sm font-medium transition shadow-sm cursor-pointer bg-[#faae1c] text-white hover:bg-[#faae1c]/85"
                    >
                        Apply
                    </button>
                </div>
            </div>


            <div className="relative p-6 bg-gray-50 min-h-screen font-sans">
                {/* --- PAGE HEADER --- */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Staff Directory</h1>
                        <p className="text-sm text-gray-500">Manage non-teaching staff and administrative roles</p>
                    </div>
                    <CustomButton
                        text="Add Staff Member"
                        to="/staff/add"
                        className="bg-[#faae1c] text-white hover:bg-[#faae1c]/85"
                    />
                </div>

                {/* --- STATS CARDS --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Stat label="Total Staff" value={total_staff || 0} icon={<Users />} />
                    <Stat label="Active Staff" value={active_staff || 0} icon={<UserCheck />} color="green" />
                    <Stat label="Inactive Staff" value={inactive_staff || 0} icon={<UserMinus />} color="red" />
                </div>

                {/* --- FILTERS SECTION --- */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 ">
                    <div className="sm:flex gap-3">
                        <div className="mb-4 sm:mb-0 flex-1 min-w-[200px] sm:min-w-[300px] w-full">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Search by name, email or mobile..."
                                    className="w-full pl-10 pr-12 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
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

                    <div className="flex gap-2">
                    </div>
                </div>

                {/* ---- Success Messages ---- */}
                {message && (
                    <div className="flex items-center gap-2 rounded-lg border border-l-[3px] border-r-[3px] border-green-600 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 mb-3">
                    {message}
                    </div>
                )}

                {/* --- DATA TABLE --- */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase font-bold">
                                    <th className="px-6 py-4">Staff Member</th>
                                    <th className="px-6 py-4">Staff Role</th>
                                    <th className="px-6 py-4">Contact</th>
                                    <th className="px-6 py-4">School</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
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
                                ) : (staff_data && staff_data.length > 0) ? (
                                    staff_data.map((staff) => {
                                        const hasError = imgError[staff.staff_id];
                                        const hasUrl = staff.photo_url && staff.photo_url !== '';

                                        return (
                                            <tr key={staff.staff_id} className="hover:bg-gray-50 transition-colors">
                                                <td className="p-4 min-w-[150px] sm:min-w-[200px]">
                                                    <div className="flex items-center gap-3">
                                                        {/* IMAGE LOGIC - Laravel now returns full URLs */}
                                                        {hasUrl && !hasError ? (
                                                            <div className="relative">
                                                                <img
                                                                    src={`/uploads/staff_photos/${staff.photo_url}`}
                                                                    alt={`${staff.name}`}
                                                                    className="w-10 h-10 rounded-full border border-gray-200 object-cover shadow-sm"
                                                                    onError={(e) => {
                                                                        setImgError(prev => ({ ...prev, [staff.staff_id]: true }))
                                                                    }}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <AvatarLetter text={staff.name} size={40} />
                                                        )}

                                                        <div className="text-sm font-bold text-gray-800">{staff.name}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    <span className="flex items-center gap-1.5">
                                                        {staff.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-xs text-gray-500 flex items-center gap-1"> {staff.email}</div>
                                                    <div className="text-xs text-gray-500 flex items-center gap-1"> {staff.mobile}</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                                                    {staff.school_name || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${staff.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {staff.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-center items-center gap-3">
                                                        <Link to={`/staff/edit/${scrambleId(staff.staff_id)}`} className="text-amber-600 hover:text-amber-800" title="Edit">
                                                            <Pencil size={16} />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleOpenModal(staff)}
                                                            className="text-red-600 hover:text-red-800 cursor-pointer"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                            <p className="text-lg font-semibold">No staff found</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* --- PAGINATION --- */}
                    {!loading && staff_data?.length > 0 && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 sm:flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                                Showing {paginationInfo.from} to {paginationInfo.to} of {total_staff} staff members
                            </span>
                            <div className="flex gap-2 mt-2 sm:mt-0">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                    className={`px-2 sm:px-3 py-1 border rounded text-xs sm:text-sm ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50 cursor-pointer'}`}
                                >
                                    Prev
                                </button>
                                <div className="flex items-center px-2 sm:px-4 text-sm font-medium text-gray-700">
                                    Page {currentPage} of {lastPage}
                                </div>
                                <button
                                    disabled={currentPage === lastPage}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    className={`px-2 sm:px-3 py-1 border rounded text-xs sm:text-sm ${currentPage === lastPage ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50 cursor-pointer'}`}
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

export default StaffListing;