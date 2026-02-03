import { useLocation, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import axios from 'axios';
import { Link } from "react-router-dom";
import {
    Search, Filter, Calendar, CheckCircle2, History, Pencil, Trash2, Loader2
} from 'lucide-react';
import { Api_url } from '../../helpers/api';
import CustomButton from '../../components/form/CustomButton';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal';
import CustomSelect from '../../components/form/CustomSelect';
import AvatarLetter from '../../components/common/AvatarLetter';
import Stat from '../../components/common/StatCard';
import FilterDrawer from '../../components/common/FilterDrawer';
import { SlidersHorizontal } from 'lucide-react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const AcademicListing = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const [messageClass, setMessageClass] = useState('');

    const [loading, setLoading] = useState(true);
    const [academic_data, setAcademicData] = useState([]);
    const [total_years, setTotalYears] = useState(0);
    const [active_year, setActiveYear] = useState(0);
    const [past_years, setPastYears] = useState(0);

    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [paginationInfo, setPaginationInfo] = useState({ from: 0, to: 0 });

    const [searchQuery, setSearchQuery] = useState('');
    const [appliedSearch, setAppliedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [filterOpen, setFilterOpen] = useState(false);

    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Additional Filter States (Matching your HTML structure)
    const [tempStatus, setTempStatus] = useState(statusFilter);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [dept, setDept] = useState('');

    const handleApplyFilters = () => {
        setStatusFilter(tempStatus); // This will trigger the existing useEffect
        setIsFilterOpen(false);
    };

    const handleResetFilters = () => {
        setTempStatus('');
        setStatusFilter('');
        setDateFrom('');
        setDateTo('');
        setDept('');
        setIsFilterOpen(false);
    };

    const statusOptions = [
        { label: "Status (All)", value: "" },
        { label: "Active", value: "1" },
        { label: "Inactive", value: "0" },
    ];

    const fetchAcademicYears = (page) => {
        setLoading(true);
        axios.get(`${Api_url.name}api/academic-data`, {
            params: {
                page: page,
                search: appliedSearch,
                status: statusFilter,
                start_date: dateFrom,
                end_date: dateTo,
            }
        }).then(res => {
            const data = res.data?.data || [];
            setAcademicData(data);
            setTotalYears(res.data?.total || 0);
            setActiveYear(res.data?.active_count || 0);
            setPastYears(res.data?.past_count || 0);
            setCurrentPage(res.data?.current_page || 1);
            setLastPage(res.data?.last_page || 1);
            setPaginationInfo({
                from: res.data?.from || 0,
                to: res.data?.to || 0
            });
            setLoading(false);
        }).catch(() => {
            setAcademicData([]);
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchAcademicYears(currentPage);
    }, [currentPage, appliedSearch, statusFilter]);

    useEffect(() => {
        if (currentPage !== 1) setCurrentPage(1);
    }, [appliedSearch, statusFilter]);

    /* Add/edit success message */
    useEffect(() => {
       if (location.state?.message) {
            if(location.state.status && location.state.status=='success'){
                setMessageClass('text-green-700 border-green-600 bg-green-50');

            }else if(location.state.status && location.state.status=='failed'){
                setMessageClass('text-red-700 border-red-600 bg-red-50');

            }else{
                setMessageClass('');
            }
        setMessage(location.state.message);

        const timer = setTimeout(() => {
            setMessage('');
            setMessageClass('');
        }, 5000);

        setTimeout(() => {
            navigate(location.pathname, { replace: true });
        }, 0);

        return () => clearTimeout(timer);
        }
    }, []);

    const handleSearchClick = () => setAppliedSearch(searchQuery);
    const handleKeyPress = (e) => { if (e.key === 'Enter') handleSearchClick(); };

    const handleDelete = async (id) => {
        try {
            setLoading(true);
            const { data: csrfData } = await axios.get(`${Api_url.name}api/csrf-token`);
            const response = await axios.post(`${Api_url.name}api/delete-academic-year/${id}`, {}, {
                headers: { 'X-CSRF-TOKEN': csrfData.token },
                withCredentials: true
            });

            if (response.data.status === 200) {
                fetchAcademicYears(currentPage);
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
        const salted = `ay_${hex}_z2`;
        return btoa(salted).replace(/=/g, '');
    };

    const [open, setOpen] = useState(false);
    const [selectedYear, setSelectedYear] = useState(null);

    const handleOpenModal = (data) => {
        setSelectedYear(data);
        setOpen(true);
    };
    
    // Helper to format date to YYYY-MM-DD
    const formatDate = (date) => {
        if (!date) return "";
        const d = new Date(date);
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const year = d.getFullYear();
        return `${year}-${month}-${day}`;
    };

    const handleStartDate = (date) => {
        const formatted = formatDate(date);
        setDateFrom(formatted);
    };

    const handleEndDate = (date) => {
        const formatted = formatDate(date);
        setDateTo(formatted);
    };


    return (
        <AdminLayout>
            
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

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Start Date</label>
                        <div className="relative">
                            <DatePicker
                            selected={dateFrom ? new Date(dateFrom) : null}
                            onChange={handleStartDate}
                            dateFormat="yyyy-MM-dd"
                            placeholderText="Select Start Date"
                            // This prevents keyboard input but allows the click to open the calendar
                            onKeyDown={(e) => e.preventDefault()}
                            autoComplete="off"
                            className="w-full px-4 py-3 rounded-xl outline-none bg-gray-50 border cursor-pointer border-transparent focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                            wrapperClassName="w-full"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Start Date</label>
                        <div className="relative">
                            <DatePicker
                            selected={dateTo ? new Date(dateTo) : null}
                            onChange={handleEndDate}
                            dateFormat="yyyy-MM-dd"
                            placeholderText="Select Start Date"
                            // This prevents keyboard input but allows the click to open the calendar
                            onKeyDown={(e) => e.preventDefault()}
                            autoComplete="off"
                            className="w-full px-4 py-3 rounded-xl outline-none bg-gray-50 border cursor-pointer border-transparent focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                            wrapperClassName="w-full"
                            />
                        </div>
                    </div>

                    <CustomSelect
                        options={statusOptions}
                        value={statusFilter}
                        onChange={(val) => setStatusFilter(val)}
                        placeholder="Status"
                    />
                </div>

                {/* FOOTER */}
                <div className="p-5 border-t border-gray-200 bg-white flex gap-3">
                    <button
                        onClick={() => {
                            setStatusFilter("");
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
                                fetchAcademicYears(1);
                            }
                            setFilterOpen(false);
                        }}
                        className="flex-1 rounded-lg py-2 text-sm font-medium transition shadow-sm cursor-pointer bg-[#faae1c] text-white hover:bg-[#faae1c]/85"
                    >
                        Apply
                    </button>
                </div>
            </div>

            <DeleteConfirmModal
                isOpen={open}
                title="Delete Academic Year"
                schoolName={selectedYear ? selectedYear.name : ""}
                onClose={() => { setOpen(false); setSelectedYear(null); }}
                onDelete={() => {
                    handleDelete(selectedYear.id);
                    setOpen(false);
                }}
            />

            <div className="p-6 bg-gray-50 min-h-screen font-sans">
                {/* PAGE HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Academic Years</h1>
                        <p className="text-sm text-gray-500">Manage school sessions based on your database</p>
                    </div>
                    <CustomButton
                        text="Add Academic Year"
                        to="/academic-year/add"
                        className="bg-[#faae1c] text-white hover:bg-[#faae1c]/85"
                    />
                </div>

                {/* STATS CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Stat label="Total Cycles" value={total_years} icon={<Calendar />} />
                    <Stat label="Active" value={active_year} icon={<CheckCircle2 />} color="green" />
                    <Stat label="Inactive" value={past_years} icon={<History />} color="red" />
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
                                    placeholder="Search year name..."
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

                    <div className="flex gap-2">
                    </div>
                </div>

                {/* ---- Success Messages ---- */}
                {message && (
                    <div className={`flex items-center gap-2 rounded-lg border border-l-[3px] border-r-[3px] ${messageClass} px-4 py-3 text-sm font-medium mb-3`}>
                    {message}
                    </div>
                )}

                {/* TABLE SECTION */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm relative">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase font-bold">
                                <tr>
                                    <th className="px-6 py-4">School Name</th>
                                    <th className="px-6 py-4">Academic Year</th>
                                    <th className="px-6 py-4">Start Date</th>
                                    <th className="px-6 py-4">End Date</th>
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
                                ) : academic_data.length > 0 ? (
                                    academic_data.map((year) => (
                                        <tr key={year.academic_year_id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4 min-w-[150px] sm:min-w-[200px]">
                                                <div className="flex items-center gap-3">
                                                    <AvatarLetter text={year.school_name} size={40} />
                                                    <div className="text-sm font-bold ">{year.school_name}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-800">{year.year_name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{year.start_date}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{year.end_date}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${year.is_active == 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {year.is_active == 1 ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center items-center gap-3">
                                                    <Link to={`/academic-year/edit/${scrambleId(year.academic_year_id)}`} className="text-amber-600 hover:text-amber-800">
                                                        <Pencil size={16} />
                                                    </Link>
                                                    <button onClick={() => handleOpenModal({ id: year.academic_year_id, name: year.year_name })} className="text-red-600 hover:text-red-800 cursor-pointer">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                            <p className="text-lg font-semibold">No data found</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION */}
                    {!loading && academic_data?.length > 0 && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 sm:flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                                Showing {paginationInfo.from} to {paginationInfo.to} of {total_years} records
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

export default AcademicListing;