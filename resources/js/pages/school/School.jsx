import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import axios from 'axios';
import { Link } from "react-router-dom";
import {
    Search, Plus, Filter, MoreVertical, Eye, Edit2, Pencil, Trash2,
    CreditCard, Download, UserCheck, Users, UserMinus, GraduationCap
} from 'lucide-react';
import { Api_url } from '../../helpers/api';
import CustomButton from '../../components/form/CustomButton';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal';
import CustomSelect from '../../components/form/CustomSelect';
import Input from '../../components/form/Input';
import AvatarLetter from '../../components/AvatarLetter';
import Stat from '../../components/StatCard';


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


    const boardOptions = [
        { label: "Board (All)", value: "" },
        { label: "CBSE", value: "CBSE" },
        { label: "ICSE", value: "ICSE" },
        { label: "State Board", value: "State Board" },
    ];

    const statusOptions = [
        { label: "Status (All)", value: "" },
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
    ];


    const fetchSchools = (page) => {
        setLoading(true);
        axios.get(`/school_data`, {
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
            setLoading(false);
        });
    };


    // 3. TRIGGER FETCH ON FILTER CHANGE
    useEffect(() => {
        fetchSchools(currentPage);
    }, [currentPage, appliedSearch, boardFilter, statusFilter]);

    // 3. Reset page to 1 when filters change (WITHOUT triggering an extra fetch)
    useEffect(() => {
        if (currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [appliedSearch, boardFilter, statusFilter]);


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
        try {
            setLoading(true);

            const { data: csrfData } = await axios.get(`${Api_url.name}csrf-token`);

            const response = await axios.post(`${Api_url.name}delete-school/${id}`, {}, {
                headers: { 'X-CSRF-TOKEN': csrfData.token },
                withCredentials: true
            });

            if (response.data.status === 200) {
                if (school_data.length === 1 && currentPage > 1) {
                    setCurrentPage(prev => prev - 1);
                } else {
                    fetchSchools(currentPage);
                }
            }
        } catch (error) {
            console.error("Delete Error:", error);
            setLoading(false);
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

    const [open, setOpen] = useState(false);
    const [selectedSchool, setSelectedSchool] = useState(null);
    const [selectedSchoolID, setSelectedSchoolID] = useState(null);

    const handleOpenModal = (school_data) => {
        setSelectedSchool(school_data);
        console.log(school_data.id)
        setSelectedSchoolID(school_data.id);
        setOpen(true);
    };

    return (

        <AdminLayout>

            <DeleteConfirmModal
                isOpen={open}
                schoolName={selectedSchool ? `${selectedSchool.name} (${selectedSchool.code})` : ""}
                onClose={() => {
                    setOpen(false);
                    setSelectedSchool(null);
                }}
                onDelete={() => {
                    // CALL THE DELETE FUNCTION HERE
                    handleDelete(selectedSchoolID);
                    setOpen(false);
                    setSelectedSchool(null);
                }}
            />

            <div className="relative p-6 bg-gray-50 min-h-screen font-sans">

                {/* --- PAGE HEADER --- */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">School Directory</h1>
                        <p className="text-sm text-gray-500">Manage and view all registered schools</p>
                    </div>
                    <div className="flex gap-3">
                        <CustomButton
                            text="Add New School"
                            to="/school/add"
                            className="bg-[#faae1c] text-white hover:bg-[#faae1c]/85"
                        />
                    </div>
                </div>

                {/* --- STATS CARDS --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Stat label="Total Schools" value={total_school ? total_school : 0 } icon={<Users />} />
                    <Stat label="Active Schools" value={active_school ? active_school : 0 } icon={<UserCheck />} color="green" />
                    <Stat label="Inactive Schools" value={inactive_school ? inactive_school : 0 } icon={<UserMinus />} color="red" />
                </div>

                {/* --- FILTERS SECTION --- */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex-1 min-w-[250px] sm:min-w-[300px] w-full">
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
                    <div className="flex flex-wrap flex-col sm:flex-row gap-3 sm:items-center min-w-[400px]">
                        {/* CustomSelect for Board */}
                        <div className="w-44">
                            <CustomSelect
                                options={boardOptions}
                                value={boardFilter}
                                onChange={(val) => setBoardFilter(val)}
                                placeholder="Board (All)"
                            />
                        </div>

                        {/* CustomSelect for Status */}
                        <div className="w-44 sm:w-40">
                            <CustomSelect
                                options={statusOptions}
                                value={statusFilter}
                                onChange={(val) => setStatusFilter(val)}
                                placeholder="Status (All)"
                            />
                        </div>

                        <button className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm hover:bg-gray-200 cursor-pointer transition-colors w-44 sm:w-40">
                            <Filter size={16} /> <span className="font-medium">More Filters</span>
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

                                {loading ? (
                                    /* --- PRELOADER INSIDE TABLE --- */
                                    <tr>
                                        <td colSpan="5" className="p-6 text-center text-gray-500">
                                            <div className=" inset-0 z-10 flex items-center justify-center rounded-xl">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
                                                    <p className="text-xs font-medium text-gray-600 animate-pulse tracking-widest">
                                                        Loading Data...
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : school_data.length > 0 ? (
                                    school_data.map((school) => (
                                        <tr key={school.school_id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <AvatarLetter text={school.school_name} size={40} />
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-800">{school.school_name}</div>
                                                        <div className="text-xs text-gray-500">{school.school_code}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{school.school_code}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{school.board}</td>
                                            <td className="px-6 py-4">
                                                <div className="text-xs text-gray-500">{school.phone}</div>
                                                <div className="text-xs text-gray-500">{school.email}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                                                <div className="text-xs text-gray-500">{school.address_line1}, {school.address_line2}</div>
                                                <div className="text-xs text-gray-500">{school.city}, {school.state}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${school.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {school.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center items-center gap-2">
                                                    <Link to={`/school/edit/${scrambleId(school.school_id)}`} className="text-amber-600 hover:text-amber-800" title="Edit">
                                                        <Pencil size={16} />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleOpenModal({ id: school.school_id, name: school.school_name, code: school.school_code })}
                                                        className="text-red-600 hover:text-red-800 cursor-pointer"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    /* --- NO DATA FOUND --- */
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                            <p className="text-lg font-semibold">No data found</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* --- PAGINATION --- */}
                    {school_data.length > 0 && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 sm:flex items-center justify-between">
                            <span className="text-sm text-gray-500 w-full sm:w-[fit-content] mb-2">
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
