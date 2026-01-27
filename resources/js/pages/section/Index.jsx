import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import axios from 'axios';
import { Link } from "react-router-dom";
import {Search, Plus, Filter, Pencil, Trash2, UserCheck, Users, UserMinus, BookOpen, User} from 'lucide-react';
import CustomButton from '../../components/form/CustomButton';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal';
import AvatarLetter from "@/components/AvatarLetter";
import { Api_url } from '../../helpers/api';
import Stat from '../../components/StatCard';

const SectionListing = () => {
    /* ================= STATES ================= */
    const [allSections, setAllSections] = useState([]);
    const [filteredSections, setFilteredSections] = useState([]);
    const [displayedSections, setDisplayedSections] = useState([]);
    const [loading, setLoading] = useState(true);

    // Search
    const [searchInput, setSearchInput] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [paginationInfo, setPaginationInfo] = useState({ from: 0, to: 0 });

    // Stats
    const [totalSections, setTotalSections] = useState(0);
    const [activeSections, setActiveSections] = useState(0);
    const [inactiveSections, setInactiveSections] = useState(0);

    // Delete modal
    const [open, setOpen] = useState(false);
    const [selectedSection, setSelectedSection] = useState(null);
    const [selectedSectionID, setSelectedSectionID] = useState(null);

    /* ================= FETCH SECTIONS ================= */
    const fetchSections = () => {
        setLoading(true);
        // CHANGED FROM sections TO section
        axios.get(`${Api_url.name}section`)
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : [];
                console.log('Section data:', data);
                
                setAllSections(data);

                // Stats
                setTotalSections(data.length);
                setActiveSections(data.filter(s => s.status === "active").length);
                setInactiveSections(data.filter(s => s.status !== "active").length);

                // Apply search filter first
                let filtered = data;
                if (appliedSearch) {
                    filtered = data.filter(s =>
                        s.section_name?.toLowerCase().includes(appliedSearch.toLowerCase()) ||
                        s.class_name?.toLowerCase().includes(appliedSearch.toLowerCase()) ||
                        s.class_teacher_name?.toLowerCase().includes(appliedSearch.toLowerCase())
                    );
                }
                setFilteredSections(filtered);

                // Then apply pagination
                const perPage = 10;
                const start = (currentPage - 1) * perPage;
                const end = start + perPage;
                const paginated = filtered.slice(start, end);
                setDisplayedSections(paginated);

                setLastPage(Math.ceil(filtered.length / perPage));
                setPaginationInfo({
                    from: filtered.length > 0 ? start + 1 : 0,
                    to: Math.min(end, filtered.length)
                });

                setLoading(false);
            })
            .catch(err => {
                console.error("Fetch Section Error:", err);
                setAllSections([]);
                setFilteredSections([]);
                setDisplayedSections([]);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchSections();
    }, [currentPage, appliedSearch]);

    /* ================= SEARCH ================= */
    const applySearch = () => {
        setAppliedSearch(searchInput);
        setCurrentPage(1);
    };

    /* ================= DELETE ================= */
    const handleDelete = (id) => {
        axios.post(`/delete-section/${id}`)
            .then(() => {
                fetchSections();
                setOpen(false);
            })
            .catch(err => {
                console.error("Delete failed", err);
                alert(err.response?.data?.message || 'Failed to delete section');
            });
    };

    const handleOpenModal = (section) => {
        setSelectedSection(section);
        setSelectedSectionID(section.section_id);
        setOpen(true);
    };

    return (
        <AdminLayout>
            <DeleteConfirmModal
                isOpen={open}
                schoolName={selectedSection ? selectedSection.section_name : ""}
                onClose={() => { setOpen(false); setSelectedSection(null); }}
                onDelete={() => { handleDelete(selectedSectionID); }}
            />

            <div className="p-6 bg-gray-50 min-h-screen">

                {/* HEADER */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Section Directory</h1>
                        <p className="text-sm text-gray-500">Manage all class section</p> {/* Changed from sections to section */}
                    </div>
                    <CustomButton
                        text="Add New Section"
                        to="/sections/create" // CHANGED FROM /sections/create
                        className="bg-[#faae1c] text-white hover:bg-[#faae1c]/85"
                    />
                </div>

                {/* STATS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Stat label="Total Section" value={totalSections} icon={<BookOpen />} /> {/* Changed label */}
                    <Stat label="Active" value={activeSections} icon={<UserCheck />} color="green" />
                    <Stat label="Inactive" value={inactiveSections} icon={<UserMinus />} color="red" />
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
                                placeholder="Search by section name, class, teacher..."
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
                                <th className="p-4">Section Name</th>
                                <th className="p-4">Class</th>
                                <th className="p-4">Class Teacher</th>
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
                                                    Loading Section... {/* Changed from Sections */}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {!loading && displayedSections.map(s => (
                                <tr key={s.section_id} className="border border-gray-200 hover:bg-gray-50">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <AvatarLetter text={s.section_name?.charAt(0) || 'S'} size={40} />
                                            <div>
                                                <div className="text-sm font-bold text-gray-800">{s.section_name}</div>
                                                <div className="text-xs text-gray-500">ID: {s.section_id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{s.class_name || 'N/A'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{s.class_teacher_name || 'Not Assigned'}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                            s.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                        }`}>{s.status}</span>
                                    </td>
                                    <td className="px-6 py-4 flex justify-center items-center gap-2">
                                        {/* CHANGED FROM /sections/ TO /section/ */}
                                        <Link to={`/sections/${s.section_id}/edit`} className="text-amber-600"><Pencil size={16} /></Link>
                                        <button
                                            onClick={() => handleOpenModal(s)}
                                            className="text-red-600 cursor-pointer"
                                        ><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))}

                            {!loading && displayedSections.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-6 text-center text-gray-500">
                                        {appliedSearch ? "No section found matching your search" : "No section found"} {/* Changed */}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* PAGINATION */}
                    {filteredSections.length > 0 && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                                Showing {paginationInfo.from} to {paginationInfo.to} of {filteredSections.length}
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

export default SectionListing;