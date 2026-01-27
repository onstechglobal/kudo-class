import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import axios from 'axios';
import { Link } from "react-router-dom";
import {
    Search, User, CheckCircle2, XCircle, Pencil, Trash2, Loader2, GraduationCap, MapPin
} from 'lucide-react';
import { Api_url } from '../../helpers/api';
import CustomButton from '../../components/form/CustomButton';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal';
import CustomSelect from '../../components/form/CustomSelect';
import AvatarLetter from '../../components/AvatarLetter';
import Stat from '../../components/StatCard';

const StudentListing = () => {
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState([]);
    const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [paginationInfo, setPaginationInfo] = useState({ from: 0, to: 0 });

    const [searchQuery, setSearchQuery] = useState('');
    const [appliedSearch, setAppliedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const statusOptions = [
        { label: "All Status", value: "" },
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
    ];

    const fetchStudents = (page) => {
        setLoading(true);
        axios.get(`${Api_url.name}get-students-list`, {
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

    const handleSearchClick = () => setAppliedSearch(searchQuery);
    
    // Scramble ID for security (similar to your academic year logic)
    const scrambleId = (id) => btoa(`std_${id}_z2`).replace(/=/g, '');

    const [open, setOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    const handleOpenModal = (student) => {
        setSelectedStudent(student);
        setOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            const { data: csrfData } = await axios.get(`${Api_url.name}csrf-token`);
            await axios.post(`${Api_url.name}delete-student/${id}`, {}, {
                headers: { 'X-CSRF-TOKEN': csrfData.token },
                withCredentials: true
            });
            fetchStudents(currentPage);
        } catch (error) { console.error(error); }
    };

    return (
        <AdminLayout>
            <DeleteConfirmModal
                isOpen={open}
                title="Delete Student Record"
                schoolName={selectedStudent ? `${selectedStudent.first_name} ${selectedStudent.last_name}` : ""}
                onClose={() => setOpen(false)}
                onDelete={() => { handleDelete(selectedStudent.student_id); setOpen(false); }}
            />

            <div className="p-6 bg-gray-50 min-h-screen">
                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Student Directory</h1>
                        <p className="text-sm text-gray-500">Manage student profiles, admissions and academic status</p>
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

                {/* FILTERS */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex-1 min-w-[300px] relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name, admission no or city..."
                            className="w-full pl-10 pr-12 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
                        />
                        <button onClick={handleSearchClick} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-[#faae1c]/20 text-[#faae1c] rounded-md hover:bg-[#faae1c] hover:text-white transition-colors">
                            <Search size={18} />
                        </button>
                    </div>
                    <div className="w-48">
                        <CustomSelect options={statusOptions} value={statusFilter} onChange={setStatusFilter} placeholder="Filter Status" />
                    </div>
                </div>

                {/* TABLE */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase font-bold">
                                <tr>
                                    <th className="px-6 py-4">Student</th>
                                    <th className="px-6 py-4">Admission Details</th>
                                    <th className="px-6 py-4">Class/Section</th>
                                    <th className="px-6 py-4">Location</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan="6" className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" /></td></tr>
                                ) : students.length > 0 ? (
                                    students.map((std) => (
                                        <tr key={std.student_id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <AvatarLetter text={std.first_name} size={40} />
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-900">{std.first_name} {std.last_name}</div>
                                                        <div className="text-xs text-gray-500">{std.gender}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-semibold text-gray-800">No: {std.admission_no}</div>
                                                <div className="text-xs text-gray-500 flex items-center gap-1"><GraduationCap size={12}/> Roll: {std.roll_no || 'N/A'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-800">Class: {std.class_id}</div>
                                                <div className="text-xs text-gray-500">Sec: {std.section_id}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-600 flex items-center gap-1"><MapPin size={12}/> {std.city}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${std.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {std.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center gap-3">
                                                    <Link to={`/students/edit/${scrambleId(std.student_id)}`} className="text-amber-600 hover:text-amber-800"><Pencil size={16} /></Link>
                                                    <button onClick={() => handleOpenModal(std)} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="6" className="py-12 text-center text-gray-500">No students found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* PAGINATION (Same as your academic page) */}
                </div>
            </div>
        </AdminLayout>
    );
};

export default StudentListing;