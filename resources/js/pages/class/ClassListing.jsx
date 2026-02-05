import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '../../layouts/AdminLayout';
import { Link } from "react-router-dom";
import {
    Search, LayoutGrid, CheckCircle2, XCircle, Pencil, Trash2,
    Layers, ArrowUpDown, Loader2
} from 'lucide-react';

import CustomButton from '../../components/form/CustomButton';
import CustomSelect from '../../components/form/CustomSelect';
import AvatarLetter from '../../components/common/AvatarLetter';
import Stat from '../../components/common/StatCard';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal'; // Added this
import { Api_url } from '../../helpers/api';
import PageHeader from '../../components/common/PageHeader';


const ClassListing = () => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);

    /* ---------------- FETCH DATA ---------------- */
    const fetchClasses = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${Api_url.name}api/get-classes`);
            if (response.data.status === 200) {
                setClasses(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching classes:", error);
        } finally {
            setLoading(false);
        }
    };

    /* ---------------- DELETE LOGIC ---------------- */
    const handleOpenDeleteModal = (item) => {
        setSelectedClass({
            id: item.class_id,
            name: item.class_name
        });
        setIsModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedClass) return;

        try {
            setLoading(true);
            const response = await axios.post(`${Api_url.name}api/delete-class`, {
                class_id: selectedClass.id
            });

            if (response.data.status === 200) {
                setClasses(prev => prev.filter(item => item.class_id !== selectedClass.id));
                setIsModalOpen(false);
                setSelectedClass(null);
            }
        } catch (error) {
            console.error("Error deleting class:", error);
            alert("Failed to delete class. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClasses();
    }, []);

    /* ---------------- FILTER LOGIC ---------------- */
    const filteredData = classes.filter(item => {
        const matchesSearch = item.class_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.school_name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === '' || item.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const activeCount = classes.filter(c => c.status === 'active').length;
    const inactiveCount = classes.filter(c => c.status === 'inactive').length;

    const statusOptions = [
        { label: "All Status", value: "" },
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
    ];

    return (
        /* <AdminLayout> */
        <>
            {/* DELETE MODAL */}
            < DeleteConfirmModal
                isOpen={isModalOpen}
                title="Delete Class"
                schoolName={selectedClass ? selectedClass.name : ""}
                onClose={() => { setIsModalOpen(false); setSelectedClass(null); }}
                onDelete={confirmDelete}
            />

            <div className="p-6 bg-gray-50 min-h-screen font-sans">

                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Class Management</h1>
                        <p className="text-sm text-gray-500">Manage classes and their display order across schools</p>
                    </div>
                    <CustomButton
                        text="Add New Class"
                        to="/classes/add"
                        className="bg-[#faae1c] text-white hover:bg-[#faae1c]/85 shadow-md"
                    />
                </div>

                {/* STATS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Stat label="Total Classes" value={classes.length} icon={<Layers />} />
                    <Stat label="Active" value={activeCount} icon={<CheckCircle2 />} color="green" />
                    <Stat label="Inactive" value={inactiveCount} icon={<XCircle />} color="red" />
                </div>

                {/* FILTERS */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 flex flex-wrap gap-4 items-center justify-between shadow-sm">
                    <div className="flex-1 min-w-[300px] relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by class or school..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="w-48">
                        <CustomSelect
                            options={statusOptions}
                            value={statusFilter}
                            placeholder="Filter Status"
                            onChange={(val) => setStatusFilter(val)}
                        />
                    </div>
                </div>

                {/* TABLE */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase font-bold">
                                <tr>
                                    <th className="px-6 py-4">School</th>
                                    <th className="px-6 py-4">Class Name</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading && classes.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="p-6 text-center text-gray-500">
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
                                {!loading && classes.length !== 0 && filteredData.map(item => (
                                    <tr key={item.class_id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <AvatarLetter text={item.school_name} size={35} />
                                                <span className="text-sm font-semibold text-gray-700">{item.school_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-900">
                                            {item.class_name}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center gap-3">
                                                <Link to={`/classes/edit/${item.class_id}`} className="text-amber-600 hover:bg-amber-50 p-1.5 rounded-lg">
                                                    <Pencil size={16} />
                                                </Link>

                                                <button
                                                    onClick={() => handleOpenDeleteModal(item)}
                                                    className="text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {!loading && classes.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                            <p className="text-lg font-semibold">No class found</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
        /* </AdminLayout> */
    );
};

export default ClassListing;