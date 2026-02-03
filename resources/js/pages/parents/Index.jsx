import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import axios from 'axios';
import { Link } from "react-router-dom";
import { Search, Filter, Pencil, Trash2, UserCheck, Users, UserX } from 'lucide-react';

import CustomButton from '../../components/form/CustomButton';
import Input from '../../components/form/Input';
import CustomSelect from '../../components/form/CustomSelect';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal';
import AvatarLetter from '../../components/common/AvatarLetter';
import Stat from '../../components/common/StatCard';
import { Api_url } from '../../helpers/api';

const ParentListing = () => {

    /* ================= STATES ================= */
    const [allParents, setAllParents] = useState([]);
    const [filteredParents, setFilteredParents] = useState([]);
    const [displayedParents, setDisplayedParents] = useState([]);
    const [loading, setLoading] = useState(true);

    /* Search */
    const [searchInput, setSearchInput] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");

    /* Pagination */
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [paginationInfo, setPaginationInfo] = useState({ from: 0, to: 0 });

    /* Stats */
    const [totalParents, setTotalParents] = useState(0);
    const [activeParents, setActiveParents] = useState(0);
    const [inactiveParents, setInactiveParents] = useState(0);

    /* Delete modal */
    const [open, setOpen] = useState(false);
    const [selectedParent, setSelectedParent] = useState(null);
    const [selectedParentID, setSelectedParentID] = useState(null);

    /* Filter Drawer */
    const [filterOpen, setFilterOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState("");
    const [filterEmail, setFilterEmail] = useState("");
    const [filterPhone, setFilterPhone] = useState("");

    /* ================= FETCH ================= */
    const fetchParents = () => {
        setLoading(true);

        axios.get(`${Api_url.name}api/parent`)
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : [];
                setAllParents(data);

                /* Stats */
                setTotalParents(data.length);
                setActiveParents(data.filter(p => p.status === "active").length);
                setInactiveParents(data.filter(p => p.status !== "active").length);

                let filtered = data;

                /* Top Search */
                if (appliedSearch) {
                    filtered = filtered.filter(p =>
                        p.first_name?.toLowerCase().includes(appliedSearch.toLowerCase()) ||
                        p.last_name?.toLowerCase().includes(appliedSearch.toLowerCase()) ||
                        p.email?.toLowerCase().includes(appliedSearch.toLowerCase()) ||
                        p.mobile?.includes(appliedSearch)
                    );
                }

                /* Filter Drawer */
                if (filterStatus) {
                    filtered = filtered.filter(p => p.status === filterStatus);
                }

                if (filterEmail) {
                    filtered = filtered.filter(p =>
                        p.email?.toLowerCase().includes(filterEmail.toLowerCase())
                    );
                }

                if (filterPhone) {
                    filtered = filtered.filter(p =>
                        p.mobile?.includes(filterPhone)
                    );
                }

                setFilteredParents(filtered);

                /* Pagination */
                const perPage = 10;
                const start = (currentPage - 1) * perPage;
                const end = start + perPage;

                setDisplayedParents(filtered.slice(start, end));
                setLastPage(Math.ceil(filtered.length / perPage));

                setPaginationInfo({
                    from: filtered.length ? start + 1 : 0,
                    to: Math.min(end, filtered.length)
                });

                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        fetchParents();
    }, [
        currentPage,
        appliedSearch,
        filterStatus,
        filterEmail,
        filterPhone
    ]);

    /* ================= ACTIONS ================= */
    // Function to trigger search
    const handleSearchClick = () => {
        setAppliedSearch(searchInput);
        setCurrentPage(1);
    };

    const handleDelete = (id) => {
        axios.post(`${Api_url.name}api/delete-parent/${id}`)
            .then(() => {
                fetchParents();
                setOpen(false);
            });
    };

    const handleOpenModal = (parent) => {
        setSelectedParent(parent);
        setSelectedParentID(parent.parent_id);
        setOpen(true);
    };

    return (
        <AdminLayout>

            <DeleteConfirmModal
                isOpen={open}
                schoolName={selectedParent ? `${selectedParent.first_name} ${selectedParent.last_name}` : ""}
                onClose={() => setOpen(false)}
                onDelete={() => handleDelete(selectedParentID)}
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
                    <button onClick={() => setFilterOpen(false)}>✕</button>
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

                    <CustomSelect
                        label="Status"
                        value={filterStatus}
                        onChange={setFilterStatus}
                        placeholder="Select status"
                        options={[
                            { label: "All", value: "" },
                            { label: "Active", value: "active" },
                            { label: "Inactive", value: "inactive" },
                        ]}
                    />
                </div>

                {/* FOOTER */}
                <div className="p-5 border-t border-gray-200 bg-white flex gap-3">
                    <button
                        onClick={() => {
                            setFilterStatus("");
                            setFilterEmail("");
                            setFilterPhone("");
                        }}
                        className="flex-1 bg-gray-100 rounded-lg py-2 text-sm font-medium"
                    >
                        Reset
                    </button>

                    <button
                        onClick={() => {
                            setCurrentPage(1);
                            setFilterOpen(false);
                        }}
                        className="flex-1 rounded-lg py-2 text-sm font-medium transition shadow-sm cursor-pointer bg-[#faae1c] text-white hover:bg-[#faae1c]/85"
                    >
                        Apply
                    </button>
                </div>
            </div>

            {/* PAGE CONTENT */}
            <div className="p-6 bg-gray-50 min-h-screen">

                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Parent Directory</h1>
                        <p className="text-sm text-gray-500">Manage all parents</p>
                    </div>

                    <CustomButton
                        text="Add New Parent"
                        to="/parents/create"
                        className="bg-[#faae1c] text-white"
                    />
                </div>

                {/* STATS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Stat label="Total Parents" value={totalParents} icon={<Users />} />
                    <Stat label="Active" value={activeParents} icon={<UserCheck />} color="green" />
                    <Stat label="Inactive" value={inactiveParents} icon={<UserX />} color="red" />
                </div>

                {/* --- FILTERS SECTION --- */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 ">
                    <div className="sm:flex gap-3">
                        <div className="mb-4 sm:mb-0 flex-1 min-w-[200px] sm:min-w-[300px] w-full">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    value={searchInput}
                                    onChange={e => setSearchInput(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && handleSearchClick()}
                                    placeholder="Search parents..."
                                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg"
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

                {/* TABLE */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            {/* Updated Table Header */}
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase font-bold">
                                    <th className="p-4">Parent Details</th>
                                    <th className="p-4">Contact Info</th>
                                    <th className="p-4">Location</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-center">Actions</th>
                                </tr>
                            </thead>

                            {/* Updated Table Body */}
                            <tbody className="divide-y divide-gray-200">
                                {!loading && displayedParents.map(p => (
                                    <tr key={p.parent_id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4 min-w-[150px] sm:min-w-[200px]">
                                            <div className="flex gap-3 items-center">
                                                <AvatarLetter text={`${p.first_name} ${p.last_name}`} size={40} />
                                                <div>
                                                    <div className="font-bold text-gray-800">{p.first_name} {p.last_name}</div>
                                                    <div className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded w-fit font-mono mt-1">
                                                        ID: {p.username}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm text-gray-700 font-medium">{p.email}</div>
                                            <div className="text-xs text-gray-500">{p.mobile}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm text-gray-700">{p.city || "N/A"}</div>
                                            <div className="text-[11px] text-gray-400 truncate max-w-[150px]">
                                                {p.address_line1}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full uppercase tracking-wider ${p.status === "active"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                                }`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex justify-center gap-2">
                                                <Link
                                                    to={`/parents/${p.parent_id}/edit`}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Pencil size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => handleOpenModal(p)}
                                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={18}/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION */}
                    {filteredParents.length > 0 && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 sm:flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                                Showing {paginationInfo.from} to {paginationInfo.to} of {filteredParents.length}
                            </span>

                            <div className="flex gap-2 mt-2 sm:mt-0">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(p => p - 1)}
                                    className={`px-2 sm:px-3 py-1 border rounded text-xs sm:text-sm ${currentPage === 1
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "bg-white hover:bg-gray-50"
                                        }`}
                                >
                                    Prev
                                </button>

                                <div className="flex items-center px-2 sm:px-4 text-sm font-medium text-gray-700">
                                    Page {currentPage} of {lastPage}
                                </div>

                                <button
                                    disabled={currentPage === lastPage}
                                    onClick={() => setCurrentPage(p => p + 1)}
                                    className={`px-2 sm:px-3 py-1 border rounded text-xs sm:text-sm ${currentPage === lastPage
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "bg-white hover:bg-gray-50"
                                        }`}
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

export default ParentListing;
