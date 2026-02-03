import { useLocation, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import axios from 'axios';
import { Link } from "react-router-dom";
import { Search, Plus, Filter, Pencil, Trash2, UserCheck, Users, UserMinus, BookOpen, User } from 'lucide-react';
import CustomButton from '../../components/form/CustomButton';
import Input from '../../components/form/Input';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal';
import AvatarLetter from "@/components/common/AvatarLetter";
import { Api_url } from '../../helpers/api';
import Stat from '../../components/common/StatCard';

const SectionListing = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const [messageClass, setMessageClass] = useState('');

    /* ================= STATES ================= */
    const [allSections, setAllSections] = useState([]);
    const [filteredSections, setFilteredSections] = useState([]);
    const [displayedSections, setDisplayedSections] = useState([]);
    const [loading, setLoading] = useState(true);

    /* Filter Drawer States */
    const [filterOpen, setFilterOpen] = useState(false);
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
        axios.get(`${Api_url.name}api/section`)
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
    /* ================= SEARCH ================= */
    const applySearch = () => {
        setAppliedSearch(searchInput);
        setCurrentPage(1);
    };

    /* ================= DELETE ================= */
    const handleDelete = (id) => {
        axios.post(`api/delete-section/${id}`)
            .then(() => {
                fetchSections();
                setOpen(false);
                setMessage('Deleted Successfully');
                setMessageClass('text-red-700 border-red-600 bg-red-50');
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
                                fetchSections(1);
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
                    schoolName={selectedSection ? selectedSection.section_name : ""}
                    onClose={() => { setOpen(false); setSelectedSection(null); }}
                    onDelete={() => { handleDelete(selectedSectionID); }}
                />

                <div className="relative p-6 bg-gray-50 min-h-screen font-sans">

                    {/* HEADER */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <div>
                            <h1 className="text-2xl font-bold">Section Directory</h1>
                            <p className="text-sm text-gray-500">Manage all class section</p> {/* Changed from sections to section */}
                        </div>
                        <div className="flex gap-3">
                            <CustomButton
                                text="Add New Section"
                                to="/sections/create" // CHANGED FROM /sections/create
                                className="bg-[#faae1c] text-white hover:bg-[#faae1c]/85"
                            />
                        </div>
                    </div>

                    {/* STATS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <Stat label="Total Section" value={totalSections} icon={<BookOpen />} /> {/* Changed label */}
                        <Stat label="Active" value={activeSections} icon={<UserCheck />} color="green" />
                        <Stat label="Inactive" value={inactiveSections} icon={<UserMinus />} color="red" />
                    </div>

                    {/* SEARCH */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6">
                        <div className="sm:flex gap-3">
                            <div className="mb-4 sm:mb-0 flex-1 min-w-[200px] sm:min-w-[300px] w-full">
                                <div className="relative group">
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
                    <div className="bg-white rounded-xl border border-gray-300 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase font-bold">
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
                                                            Loading Data...
                                                        </p>
                                                    </div>
                                                </div> 
                                            </td>
                                        </tr>
                                    )}

                                    {!loading && displayedSections.map(s => (
                                        <tr key={s.section_id} className="border border-gray-200 hover:bg-gray-50">
                                            <td className="p-4 min-w-[150px] sm:min-w-[200px]">
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
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${s.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
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
                                            <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                                <p className="text-lg font-semibold">No section found</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINATION */}
                        {filteredSections.length > 0 && (
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 sm:flex items-center justify-between">
                                <span className="text-sm text-gray-500">
                                    Showing {paginationInfo.from} to {paginationInfo.to} of {filteredSections.length}
                                </span>

                                <div className="flex gap-2 mt-2 sm:mt-0">
                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => prev - 1)}
                                        className={`px-2 sm:px-3 py-1 border rounded text-xs sm:text-sm ${currentPage === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white hover:bg-gray-50"}`}
                                    >Prev</button>

                                    <div className="flex items-center px-2 sm:px-4 text-sm font-medium text-gray-700">
                                        Page {currentPage} of {lastPage}
                                    </div>

                                    <button
                                        disabled={currentPage === lastPage}
                                        onClick={() => setCurrentPage(prev => prev + 1)}
                                        className={`px-2 sm:px-3 py-1 border rounded text-xs sm:text-sm ${currentPage === lastPage ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white hover:bg-gray-50"}`}
                                    >Next</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default SectionListing;