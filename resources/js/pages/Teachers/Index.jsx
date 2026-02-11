import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { State, City } from "country-state-city";
import axios from 'axios';
import { Search, Plus, Filter, Pencil, Trash2, UserCheck, Users, UserMinus } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import Input from "@/components/form/Input";
import CustomButton from '../../components/form/CustomButton';
import CustomSelect from '../../components/form/CustomSelect';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal';
import AvatarLetter from '../../components/common/AvatarLetter';
import { Api_url } from '../../helpers/api';
import Stat from '../../components/common/StatCard';

const TeacherListing = () => {

    const states = State.getStatesOfCountry("IN");
    const statesOption = states.map(st => ({
        value: st.name,
        label: st.name
    }));

    const location = useLocation();
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const [messageClass, setMessageClass] = useState('');
    /* ================= STATES ================= */
    const [allTeachers, setAllTeachers] = useState([]);
    const [filteredTeachers, setFilteredTeachers] = useState([]);
    const [displayedTeachers, setDisplayedTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [imgError, setImgError] = useState({});

    /* Filter Drawer States */
    const [filterOpen, setFilterOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState("");
    const [stateFilter, setStateFilter] = useState("");
    const [searchAddress, setSearchAddress] = useState("");
    const [searchDesignation, setSearchDesignation] = useState("");
    const [searchQualification, setSearchQualification] = useState("");

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
    const fetchTeachers = (page) => {
        setLoading(true);
        axios.get(`${Api_url.name}api/teacher`, {
            params: {
                page: page,
                search: appliedSearch,
                qualification: searchQualification,
                designation: searchDesignation,
                address: searchAddress,
                state: stateFilter,
                status: statusFilter,
            }
        })
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
        fetchTeachers(currentPage);
    }, [currentPage, appliedSearch]);
    /* Add/edit success message */
    useEffect(() => {
        if (location.state?.message) {
            if (location.state.status && location.state.status == 'success') {
                setMessageClass('text-green-700 border-green-600 bg-green-50');

            } else if (location.state.status && location.state.status == 'failed') {
                setMessageClass('text-red-700 border-red-600 bg-red-50');

            } else {
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
    // Function to trigger search
    const handleSearchClick = () => {
        setAppliedSearch(searchInput);
        setCurrentPage(1);
    };

    /* ================= DELETE ================= */
    const handleDelete = async (id) => {
        try {
            setLoading(true);
            const { data: csrfData } = await axios.get(`${Api_url.name}api/csrf-token`);
            const response = await axios.post(`${Api_url.name}api/delete-teacher/${id}`, {}, {
                headers: { 'X-CSRF-TOKEN': csrfData.token },
                withCredentials: true
            });

            if (response.data.status === 200) {
                fetchTeachers(1);
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

    const handleOpenModal = (teacher) => {
        setSelectedTeacher(teacher);
        setSelectedTeacherID(teacher.id);
        setOpen(true);
    };

    const statusOptions = [
        { label: "Status (All)", value: "" },
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
    ];

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
                    <Input type="text" label="Qualification" value={searchQualification} onChange={e => setSearchQualification( e.target.value)} />
                    <Input type="text" label="Designation" value={searchDesignation} onChange={e => setSearchDesignation( e.target.value)} />
                    <Input type="text" label="Address" value={searchAddress} onChange={e => setSearchAddress( e.target.value)} />
                    <CustomSelect label="State" options={statesOption} value={stateFilter} onChange={setStateFilter} />
                    <CustomSelect label="Status" options={statusOptions} value={statusFilter} onChange={setStatusFilter} />
                </div>

                {/* FOOTER */}
                <div className="p-5 border-t border-gray-200 bg-white flex gap-3">
                    <button
                        onClick={() => {
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
                                fetchTeachers(1);
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
                    schoolName={selectedTeacher ? selectedTeacher.first_name : ""}
                    onClose={() => { setOpen(false); setSelectedTeacher(null); }}
                    onDelete={() => { handleDelete(selectedTeacherID); setOpen(false); setSelectedTeacher(null); }}
                />

                <div className="relative p-6 bg-gray-50 min-h-screen font-sans">

                    {/* HEADER */}
                    <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
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
                        <div className="sm:flex gap-3">
                            <div className="mb-4 sm:mb-0 flex-1 min-w-[200px] sm:min-w-[300px] w-full">
                                <div className="relative group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        value={searchInput}
                                        onChange={e => setSearchInput(e.target.value)}
                                        onKeyDown={e => e.key === "Enter" && applySearch()}
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
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg cursor-pointer"
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
                                        <th className="p-4">Teacher Name</th>
                                        <th className="p-4">Contact</th>
                                        <th className="p-4">School</th>
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

                                    {!loading && displayedTeachers.map(t => {
                                        const hasError = imgError[t.teacher_id];
                                        const hasUrl = t.photo_url && t.photo_url !== '';

                                        return (
                                            <tr key={t.teacher_id} className="border border-gray-200 hover:bg-gray-50">
                                                <td className="p-4 min-w-[150px] sm:min-w-[200px]">
                                                    <div className="flex items-center gap-3">
                                                        {/* IMAGE LOGIC - Laravel now returns full URLs */}
                                                        {hasUrl && !hasError ? (
                                                            <div className="relative">
                                                                <img
                                                                    src={t.photo_url}
                                                                    alt={`${t.first_name} ${t.last_name}`}
                                                                    className="min-w-[40px] min-h-[40px] max-w-[40px] max-h-[40px] rounded-full border border-gray-200 object-cover shadow-sm"
                                                                    onError={(e) => {
                                                                        setImgError(prev => ({ ...prev, [t.teacher_id]: true }))
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
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    <p> {t.email} </p> <p className="mt-2"> {t.mobile} </p></td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {t.school_name || '—'}
                                                </td>

                                                <td className="px-6 py-4 text-sm">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${t.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
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
                                        )
                                    }
                                    )}

                                    {!loading && displayedTeachers.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                                <p class="text-lg">No teachers found</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINATION */}
                        {filteredTeachers.length > 0 && (
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 sm:flex items-center justify-between">
                                <span className="text-sm text-gray-500 sm:w-[fit-content]">
                                    Showing {paginationInfo.from} to {paginationInfo.to} of {filteredTeachers.length}
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

export default TeacherListing;