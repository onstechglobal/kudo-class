import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import axios from 'axios';
import { Link } from "react-router-dom";
import {Search, Plus, Filter, Pencil, Trash2,UserCheck, Users, UserMinus} from 'lucide-react';
import CustomButton from '../../components/form/CustomButton';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal';
import AvatarLetter from "@/components/AvatarLetter";
import { Api_url } from '../../helpers/api';
import Stat from '../../components/StatCard';

const TeacherListing = () => {
    /* ================= STATES ================= */
    const [allTeachers, setAllTeachers] = useState([]);
    const [filteredTeachers, setFilteredTeachers] = useState([]);
    const [displayedTeachers, setDisplayedTeachers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Search
    const [searchInput, setSearchInput] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [paginationInfo, setPaginationInfo] = useState({ from: 0, to: 0 });

    // Stats
    const [totalTeachers, setTotalTeachers] = useState(0);
    const [activeTeachers, setActiveTeachers] = useState(0);
    const [inactiveTeachers, setInactiveTeachers] = useState(0);

    // Delete modal
    const [open, setOpen] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [selectedTeacherID, setSelectedTeacherID] = useState(null);

    /* ================= FETCH TEACHERS ================= */
    const fetchTeachers = () => {
        setLoading(true);
        axios.get(`${Api_url.name}teacher`)
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : [];
                console.log('Teachers with full URLs:', data); // Debug log
                
                setAllTeachers(data);

                // Stats
                setTotalTeachers(data.length);
                setActiveTeachers(data.filter(t => t.status === "active").length);
                setInactiveTeachers(data.filter(t => t.status !== "active").length);

                // Apply search filter first
                let filtered = data;
                if (appliedSearch) {
                    filtered = data.filter(t =>
                        t.first_name?.toLowerCase().includes(appliedSearch.toLowerCase()) ||
                        t.last_name?.toLowerCase().includes(appliedSearch.toLowerCase()) ||
                        t.email?.toLowerCase().includes(appliedSearch.toLowerCase()) ||
                        t.mobile?.includes(appliedSearch)
                    );
                }
                setFilteredTeachers(filtered);

                // Then apply pagination
                const perPage = 10;
                const start = (currentPage - 1) * perPage;
                const end = start + perPage;
                const paginated = filtered.slice(start, end);
                setDisplayedTeachers(paginated);

                setLastPage(Math.ceil(filtered.length / perPage));
                setPaginationInfo({
                    from: filtered.length > 0 ? start + 1 : 0,
                    to: Math.min(end, filtered.length)
                });

                setLoading(false);
            })
            .catch(err => {
                console.error("Fetch Teachers Error:", err);
                setAllTeachers([]);
                setFilteredTeachers([]);
                setDisplayedTeachers([]);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchTeachers();
    }, [currentPage, appliedSearch]);

    /* ================= SEARCH ================= */
    const applySearch = () => {
        setAppliedSearch(searchInput);
        setCurrentPage(1);
    };

    /* ================= DELETE ================= */
    const handleDelete = (id) => {
        axios.post(`/delete-teacher/${id}`)
            .then(() => {
                fetchTeachers();
            })
            .catch(err => {
                console.error("Delete failed", err);
            });
    };

    const handleOpenModal = (teacher) => {
        setSelectedTeacher(teacher);
        setSelectedTeacherID(teacher.id);
        setOpen(true);
    };

    return (
        <AdminLayout>
            <DeleteConfirmModal
                isOpen={open}
                schoolName={selectedTeacher ? selectedTeacher.first_name : ""}
                onClose={() => { setOpen(false); setSelectedTeacher(null); }}
                onDelete={() => { handleDelete(selectedTeacherID); setOpen(false); setSelectedTeacher(null); }}
            />

            <div className="p-6 bg-gray-50 min-h-screen">

                {/* HEADER */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Teacher Directory</h1>
                        <p className="text-sm text-gray-500">Manage all teachers</p>
                    </div>
                    <CustomButton
                        text="Add New Teacher"
                        to="/teachers/create"
                        className="bg-[#faae1c] text-white hover:bg-[#faae1c]/85"
                    />
                </div>

                {/* STATS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Stat label="Total Teachers" value={totalTeachers} icon={<Users />} />
                    <Stat label="Active" value={activeTeachers} icon={<UserCheck />} color="green" />
                    <Stat label="Inactive" value={inactiveTeachers} icon={<UserMinus />} color="red" />
                </div>

                {/* SEARCH */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6">
                    <div className="flex gap-3 items-center flex-wrap">
                        <div className="relative flex-1 min-w-[300px]">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                value={searchInput}
                                onChange={e => setSearchInput(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && applySearch()}
                                placeholder="Search by name, email, phone..."
                                className="w-full pl-12 pr-14 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={applySearch}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#faae1c] hover:bg-[#faae1c]/90 text-white p-2 rounded-lg cursor-pointer"
                            >
                                <Search size={18} strokeWidth={2.5} />
                            </button>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 cursor-pointer">
                            <Filter size={16} /> More Filters
                        </button>
                    </div>
                </div>

                {/* TABLE */}
                <div className="bg-white rounded-xl border border-gray-300 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-gray-300 text-gray-600 text-xs uppercase font-bold">
                            <tr>
                                <th className="p-4">Teacher Name</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Phone</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y">
                            {loading && (
                                <tr>
                                    <td colSpan="5" className="p-6 text-center text-gray-500">
                                        <div className="inset-0 z-10 flex items-center justify-center rounded-xl">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
                                                <p className="text-xs font-medium text-gray-600 animate-pulse tracking-widest">
                                                    Loading Teachers...
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {!loading && displayedTeachers.map(t => (
                                <tr key={t.teacher_id} className="border border-gray-200 hover:bg-gray-50">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            {/* IMAGE LOGIC - Laravel now returns full URLs */}
                                            {t.photo_url ? (
                                                <div className="relative">
                                                    <img
                                                        src={t.photo_url}
                                                        alt={`${t.first_name} ${t.last_name}`}
                                                        className="w-10 h-10 rounded-full border border-gray-200 object-cover shadow-sm"
                                                        onError={(e) => {
                                                            // Image failed to load, show AvatarLetter
                                                            e.target.style.display = 'none';
                                                            const fallback = document.createElement('div');
                                                            fallback.className = 'w-10 h-10';
                                                            const initials = `${t.first_name?.charAt(0) || ''}${t.last_name?.charAt(0) || ''}`;
                                                            fallback.innerHTML = `
                                                                <div class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 border border-gray-200">
                                                                    <span class="text-sm font-bold text-blue-600">${initials}</span>
                                                                </div>
                                                            `;
                                                            e.target.parentNode.appendChild(fallback);
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <AvatarLetter text={`${t.first_name} ${t.last_name}`} size={40} />
                                            )}
                                            <div>
                                                <div className="text-sm font-bold text-gray-800">{t.first_name} {t.last_name}</div>
                                                <div className="text-xs text-gray-500">{t.employee_code || 'No code'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{t.email}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{t.mobile}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                            t.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                        }`}>{t.status}</span>
                                    </td>
                                    <td className="px-6 py-4 flex justify-center items-center gap-2">
                                        <Link to={`/teachers/${t.teacher_id}/edit`} className="text-amber-600"><Pencil size={16} /></Link>
                                        <button
                                            onClick={() => handleOpenModal({ id: t.teacher_id, first_name: t.first_name })}
                                            className="text-red-600 cursor-pointer"
                                        ><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))}

                            {!loading && displayedTeachers.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-6 text-center text-gray-500">
                                        {appliedSearch ? "No teachers found matching your search" : "No teachers found"}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* PAGINATION */}
                    {filteredTeachers.length > 0 && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                                Showing {paginationInfo.from} to {paginationInfo.to} of {filteredTeachers.length}
                            </span>

                            <div className="flex gap-2">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                    className={`px-3 py-1 border rounded text-sm ${currentPage === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white hover:bg-gray-50"}`}
                                >Prev</button>

                                <div className="flex items-center px-4 text-sm font-medium text-gray-700">
                                    Page {currentPage} of {lastPage}
                                </div>

                                <button
                                    disabled={currentPage === lastPage}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    className={`px-3 py-1 border rounded text-sm ${currentPage === lastPage ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white hover:bg-gray-50"}`}
                                >Next</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default TeacherListing;