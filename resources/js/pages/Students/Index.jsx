import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import axios from 'axios';
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    Search, User, Filter, CheckCircle2, XCircle, Pencil, Trash2, GraduationCap, Users
} from 'lucide-react';
import { Api_url } from '../../helpers/api';
import CustomButton from '../../components/form/CustomButton';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal';
import CustomSelect from '../../components/form/CustomSelect';
import AvatarLetter from '../../components/common/AvatarLetter';
import Stat from '../../components/common/StatCard';

const StudentListing = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    const [message, setMessage] = useState('');
    const [messageClass, setMessageClass] = useState('');
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState([]);
    const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [paginationInfo, setPaginationInfo] = useState({ from: 0, to: 0 });

    const [searchQuery, setSearchQuery] = useState('');
    const [appliedSearch, setAppliedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    /* Filter Drawer States */
    const [filterOpen, setFilterOpen] = useState(false);

    const statusOptions = [
        { label: "Status (All)", value: "" },
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
    ];

    const fetchStudents = (page) => {
        setLoading(true);
        axios.get(`${Api_url.name}api/get-students-list`, {
            params: {
                page: page,
                search: appliedSearch,
                status: statusFilter
            }
        }).then(res => {
            setStudents(res.data?.data || []);
            setStats({
                total: res.data?.total || 0,
                active: res.data?.active_count || 0,
                inactive: res.data?.inactive_count || 0
            });
            setCurrentPage(res.data?.current_page || 1);
            setLastPage(res.data?.last_page || 1);
            setPaginationInfo({ from: res.data?.from || 0, to: res.data?.to || 0 });
            setLoading(false);
        }).catch(() => {
            setStudents([]);
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchStudents(currentPage);
    }, [currentPage, appliedSearch, statusFilter]);

    useEffect(() => {
        if (currentPage !== 1) setCurrentPage(1);
    }, [appliedSearch, statusFilter]);

    // Handle Success/Error messages from navigation state
    useEffect(() => {
        if (location.state?.message) {
            if (location.state.status === 'success') {
                setMessageClass('text-green-700 border-green-600 bg-green-50');
            } else {
                setMessageClass('text-red-700 border-red-600 bg-red-50');
            }
            setMessage(location.state.message);
            const timer = setTimeout(() => { setMessage(''); setMessageClass(''); }, 5000);
            setTimeout(() => { navigate(location.pathname, { replace: true }); }, 0);
            return () => clearTimeout(timer);
        }
    }, [location.state, navigate, location.pathname]);

    const handleSearchClick = () => setAppliedSearch(searchQuery);
    const handleKeyPress = (e) => { if (e.key === 'Enter') handleSearchClick(); };

    const scrambleId = (id) => btoa(`std_${id}_z2`).replace(/=/g, '');

    const [open, setOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    const handleOpenModal = (student) => {
        setSelectedStudent(student);
        setOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            setLoading(true);
            const { data: csrfData } = await axios.get(`${Api_url.name}api/csrf-token`);
            await axios.post(`${Api_url.name}api/delete-student/${id}`, {}, {
                headers: { 'X-CSRF-TOKEN': csrfData.token },
                withCredentials: true
            });
            setMessage('Student deleted successfully');
            setMessageClass('text-red-700 border-red-600 bg-red-50');
            fetchStudents(currentPage);
            setTimeout(() => { setMessage(''); setMessageClass(''); }, 5000);
        } catch (error) { 
            console.error(error); 
            setLoading(false);
        }
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
                </div>

                {/* FOOTER */}
                <div className="p-5 border-t border-gray-200 bg-white flex gap-3">
                    <button
                        onClick={() => {
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
                                fetchStudents(1);
                            }
                            setFilterOpen(false);
                        }}
                        className="flex-1 rounded-lg py-2 text-sm font-medium transition shadow-sm cursor-pointer bg-[#faae1c] text-white hover:bg-[#faae1c]/85"
                    >
                        Apply
                    </button>
                </div>
            </div>

            <div className={`flex-1 ${open ? 'overflow-hidden' : 'overflow-auto'}`}>
                <DeleteConfirmModal
                    isOpen={open}
                    title="Delete Student Record"
                    schoolName={selectedStudent ? `${selectedStudent.first_name} ${selectedStudent.last_name}` : ""}
                    onClose={() => setOpen(false)}
                    onDelete={() => { handleDelete(selectedStudent.student_id); setOpen(false); }}
                />

                <div className="relative p-6 bg-gray-50 min-h-screen font-sans">
                    {/* HEADER */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Student Directory</h1>
                            <p className="text-sm text-gray-500">Manage student profiles and parent associations</p>
                        </div>
                        <CustomButton
                            text="New Admission"
                            to="/students/add"
                            className="bg-[#faae1c] text-white hover:bg-[#faae1c]/85"
                        />
                    </div>

                    {/* STATS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <Stat label="Total Students" value={stats.total} icon={<User />} />
                        <Stat label="Active" value={stats.active} icon={<CheckCircle2 />} color="green" />
                        <Stat label="Inactive/Left" value={stats.inactive} icon={<XCircle />} color="red" />
                    </div>

                    {/* --- FILTERS SECTION --- */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 ">
                        <div className="sm:flex gap-3">
                            <div className="mb-4 sm:mb-0 flex-1 min-w-[200px] sm:min-w-[300px] w-full">
                                <div className="relative group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search name, admission no or parent..."
                                        className="w-full pl-10 pr-12 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={handleKeyPress}
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

                    {/* Success Message */}
                    {message && (
                        <div className={`flex items-center gap-2 rounded-lg border border-l-[3px] border-r-[3px] ${messageClass} px-4 py-3 text-sm font-medium mb-3`}>
                            {message}
                        </div>
                    )}

                    {/* TABLE */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm relative">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase font-bold">
                                    <tr>
                                        <th className="p-4">Student Info</th>
                                        <th className="p-4">Admission Details</th>
                                        <th className="p-4">Parent Details</th>
                                        <th className="p-4">Class/Section</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 min-h-[400px]">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="6" className="p-12 text-center text-gray-500">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
                                                    <p className="text-xs font-medium text-gray-600 animate-pulse tracking-widest">Loading Records...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : students.length > 0 ? (
                                        students.map((std) => (
                                            <tr key={std.student_id} className="hover:bg-gray-50 transition-colors">
                                                <td className="p-4 min-w-[150px] sm:min-w-[200px]">
                                                    <div className="flex items-center gap-3">
                                                        <AvatarLetter text={std.first_name} size={40} />
                                                        <div>
                                                            <div className="text-sm font-bold text-gray-900">{std.first_name} {std.last_name}</div>
                                                            <div className="text-[11px] text-gray-500 uppercase">{std.gender}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-sm font-bold text-gray-800">No: {std.admission_no}</div>
                                                    <div className="text-xs text-gray-500 flex items-center gap-1"><GraduationCap size={12}/> Roll: {std.roll_no || '--'}</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
                                                        <Users size={14} />
                                                        {std.parent_first} {std.parent_last}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-sm text-gray-800 font-medium">Class: {std.class_id}</div>
                                                    <div className="text-xs text-gray-500">Sec: {std.section_id}</div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${std.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {std.status}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex justify-center items-center gap-3">
                                                        <Link to={`/students/edit/${scrambleId(std.student_id)}`} className="text-amber-600 hover:text-amber-800">
                                                            <Pencil size={16} />
                                                        </Link>
                                                        <button onClick={() => handleOpenModal(std)} className="text-red-600 hover:text-red-800 cursor-pointer">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                                <p className="text-lg font-semibold">No students found</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINATION */}
                        {!loading && students?.length > 0 && (
                            <div className="p-4 bg-gray-50 border-t border-gray-200 sm:flex items-center justify-between">
                                <span className="text-sm text-gray-500">
                                    Showing {paginationInfo.from} to {paginationInfo.to} of {stats.total} records
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
            </div>
        </AdminLayout>
    );
};

export default StudentListing;