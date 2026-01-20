import React, { useState, useEffect } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';
import { Link } from "react-router-dom";
import {
    Search, Plus, Filter, MoreVertical, Eye, Edit2, Pencil, Trash2,
    CreditCard, Download, UserCheck, Users, UserMinus, GraduationCap
} from 'lucide-react';
import { Api_url } from '../../helpers/api';
import CustomButton from '../../components/form/CustomButton';


const SchoolListing = () => {

    const [loading, setLoading] = useState(true);
    const [school_data, setSchool] = useState([]);
    const [total_school, setTotalSchools] = useState();
    const [active_school, setActiveSchool] = useState();
    const [inactive_school, setInactiveSchool] = useState();


    // NEW PAGINATION STATES
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [paginationInfo, setPaginationInfo] = useState({ from: 0, to: 0 });

    // 1. ADD FILTER STATES
    const [searchQuery, setSearchQuery] = useState('');
    const [appliedSearch, setAppliedSearch] = useState('');
    const [boardFilter, setBoardFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');


    const fetchSchools = (page) => {
        setLoading(true);
        axios.get(`/school`, {
            params: {
                page: page,
                search: appliedSearch,
                board: boardFilter,
                status: statusFilter
            }
        }).then(res => {
            setSchool(res.data.data);
            setTotalSchools(res.data.total);
            setActiveSchool(res.data.active);
            setInactiveSchool(res.data.inactive);
            setCurrentPage(res.data.current_page);
            setLastPage(res.data.last_page);
            setPaginationInfo({ from: res.data.from, to: res.data.to });
            // setLoading(false);
            setTimeout(() => {
                setLoading(false);
            }, 500);

        });
    };


    // Single effect to handle all data fetching
    useEffect(() => {
        fetchSchools(currentPage);
    }, [currentPage, appliedSearch, boardFilter, statusFilter]);

    // Separate handler for filter changes to avoid double-fetching
    const handleFilterChange = (setter) => (e) => {
        setter(e.target.value);
        setCurrentPage(1); // Reset page manually when user interacts with filters
    };


    // Function to trigger search
    const handleSearchClick = () => {
        setAppliedSearch(searchQuery);
    };

    // Also trigger search when "Enter" key is pressed
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearchClick();
        }
    };


    const handleDelete = async (id) => {
        // 1. Show Confirmation
        if (window.confirm("Are you sure you want to delete this school record? This action cannot be undone.")) {
            try {
                setLoading(true); // Show your preloader

                // 2. Get CSRF Token
                const { data: csrfData } = await axios.get(`${Api_url.name}csrf-token`);

                // 3. Send Delete Request
                const response = await axios.post(`${Api_url.name}delete-school/${id}`, {}, {
                    headers: { 'X-CSRF-TOKEN': csrfData.token },
                    withCredentials: true
                });

                if (response.data.status === 200) {
                    // 4. Update UI: Remove the deleted school from the state
                    setSchool(prevData => prevData.filter(school => school.school_id !== id));

                    // Optional: Update the "Total Schools" count at the top
                    setTotalSchools(prev => prev - 1);

                    alert("School deleted successfully.");
                }
            } catch (error) {
                console.error("Delete Error:", error);
                alert("Failed to delete the school. Please try again.");
            } finally {
                setLoading(false);
            }
        }
    };


    const scrambleId = (id) => {
        if (!id) return '';
        // 1. Convert number to hex (e.g., 14 -> 'e')
        const hex = id.toString(16);
        // 2. Add a static prefix/suffix to hide the length
        const salted = `sc_${hex}_x9`;
        // 3. Convert to Base64 but remove the "=="
        return btoa(salted).replace(/=/g, '');
    };

    return (
        <AdminLayout>
            <div className={`relative p-6 bg-gray-50 min-h-screen font-sans ${loading ? 'overflow-hidden max-h-screen' : ''}`}>

                {/* --- IN-DIV PRELOADER --- */}
                {loading && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#F8FAFC] min-h-[80vh]">
                        <div className="flex flex-col items-center gap-4">
                            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
                            <p className="text-sm font-bold text-gray-600 animate-pulse tracking-widest uppercase">
                                Please Wait...
                            </p>
                        </div>
                    </div>
                )}

                {/* --- PAGE HEADER --- */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">School Directory</h1>
                        <p className="text-sm text-gray-500">Manage and view all registered schools</p>
                    </div>
                    <div className="flex gap-3">
                        <CustomButton
                            text="Add New School"
                            to="/add-school"
                            className="bg-[#faae1c] text-white hover:bg-[#faae1c]/85"
                        />
                    </div>
                </div>


                {/* --- STATS CARDS --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
                    {[
                        { label: 'Total Schools', value: total_school ? total_school : 0, icon: <Users className="text-blue-600" />, bg: 'bg-blue-50' },
                        { label: 'Active Schools', value: active_school ? active_school : 0, icon: <UserCheck className="text-green-600" />, bg: 'bg-green-50' },
                        { label: 'Inactive Schools', value: inactive_school ? inactive_school : 0, icon: <UserMinus className="text-red-600" />, bg: 'bg-red-50' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4">
                            <div className={`${stat.bg} p-3 rounded-lg`}>{stat.icon}</div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">{stat.label}</p>
                                <p className="text-xl font-bold text-gray-800">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* --- FILTERS SECTION --- */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex-1 min-w-[300px]">
                        <div className="relative group">
                            {/* Left Side: Decorative Icon */}
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />

                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Search by name, ID or email..."
                                /* Notice: pr-12 (right padding) ensures text doesn't go under the button */
                                className="w-full pl-10 pr-12 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            />

                            {/* Right Side: Clickable Search Button Icon */}
                            <button
                                onClick={handleSearchClick}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 
                                bg-[#faae1c]/20 text-[#faae1c] 
                                rounded-md 
                                hover:bg-[#faae1c] hover:text-white
                                transition-colors cursor-pointer"
                                title="Click to search"
                            >
                                <Search size={18} strokeWidth={2.5} className="text-current" />
                            </button>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <select
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                            //onChange={(e) => setBoardFilter(e.target.value)}
                            onChange={handleFilterChange(setBoardFilter)}
                        >
                            <option value="">Board (All)</option>
                            <option value="CBSE">CBSE</option>
                            <option value="ICSE">ICSE</option>
                            <option value="State Board">State Board</option>
                        </select>
                        <select
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                            //onChange1={(e) => setStatusFilter(e.target.value)}
                            onChange={handleFilterChange(setStatusFilter)}
                        >
                            <option value="">Status (All)</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>

                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
                            <Filter size={16} /> More Filters
                        </button>
                    </div>
                </div>


                {/* --- DATA TABLE --- */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase font-bold">
                                    <th className="px-6 py-4">School Name </th>
                                    <th className="px-6 py-4">School Code</th>
                                    <th className="px-6 py-4">Board</th>
                                    <th className="px-6 py-4">Contact</th>
                                    <th className="px-6 py-4">Address</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {school_data.length > 0 ? (
                                    school_data.map((school) => {
                                        //const encodedId = btoa(school.school_id.toString());

                                        return (
                                            <tr key={school.school_id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {/* --- UPDATED IMAGE LOGIC --- */}
                                                        <img
                                                            src={
                                                                school.logo_url
                                                                    ? `${Api_url.name}storage/${school.logo_url.replace('public/', '')}`
                                                                    : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(school.school_name) + '&background=random'
                                                            }
                                                            alt={school.school_name}
                                                            className="w-10 h-10 rounded-full border border-gray-200 object-cover shadow-sm"
                                                            onError={(e) => {
                                                                // Fallback if the server path is broken
                                                                e.target.onerror = null;
                                                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(school.school_name)}&background=EBF4FF&color=7F9CF5`;
                                                            }}
                                                        />
                                                        <div>
                                                            <div className="text-sm font-bold text-gray-800">{school.school_name}</div>
                                                            <div className="text-xs text-gray-500">{school.school_code}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{school.school_code}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{school.board}</td>
                                                <td className="px-6 py-4">
                                                    <div className="text-xs text-gray-500"> {school.phone} </div>
                                                    <div className="text-xs text-gray-500"> {school.email} </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                                                    <div className="text-xs text-gray-500"> {school.address_line1}, {school.address_line2} </div>
                                                    <div className="text-xs text-gray-500"> {school.city}, {school.state} </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${school.status === 'active'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-red-100 text-red-700'
                                                            }`}
                                                    >
                                                        {school.status}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="flex justify-center items-center gap-2">

                                                        <Link
                                                            to={`/edit-school/${scrambleId(school.school_id)}`}
                                                            className="text-amber-600 hover:text-amber-800  "
                                                            title="Edit"
                                                        >
                                                            <Pencil size={16} />
                                                        </Link>

                                                        <button
                                                            onClick={() => handleDelete(school.school_id)}
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
                                    !loading && (
                                        <tr>
                                            <td colspan="7" className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center text-gray-500">
                                                    <p className="text-lg font-semibold">No data found</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* --- PAGINATION --- */}
                    {school_data.length > 0 && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                                Showing {paginationInfo.from} to {paginationInfo.to} of {total_school} schools
                            </span>
                            <div className="flex gap-2">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                    className={`px-3 py-1 border rounded text-sm ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50 cursor-pointer'}`}
                                >
                                    Prev
                                </button>

                                {/* Simple page indicator */}
                                <div className="flex items-center px-4 text-sm font-medium text-gray-700">
                                    Page {currentPage} of {lastPage}
                                </div>

                                <button
                                    disabled={currentPage === lastPage}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    className={`px-3 py-1 border rounded text-sm ${currentPage === lastPage ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50 cursor-pointer'}`}
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

export default SchoolListing;
