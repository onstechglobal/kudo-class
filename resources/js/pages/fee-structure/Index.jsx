// C:\xampp\htdocs\kudoclass\resources\js\pages\fee-structure\Index.jsx
import React, { useState, useEffect } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import CustomButton from "../../components/form/CustomButton";
import Stat from "../../components/common/StatCard";
import CustomSelect from "../../components/form/CustomSelect";
import { Link } from "react-router-dom";
import api from "../../helpers/api";
import {
    Search,
    Plus,
    Filter,
    Pencil,
    Trash2,
    Users,
    CheckCircle2,
    Bus,
    Loader2,
    AlertCircle
} from "lucide-react";

const statusOptions = [
    { label: "Status (All)", value: "" },
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
];

const Index = () => {
    const [feeStructures, setFeeStructures] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [stats, setStats] = useState({
        total: 0,
        academic: 0,
        transport: 0
    });

    // Fetch fee structures
    const fetchFeeStructures = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await api.get('/api/fee-structures');
            
            if (response.data.success && response.data.data) {
                const data = response.data.data;
                setFeeStructures(data);
                setFilteredData(data);
                calculateStats(data);
            } else {
                setFeeStructures([]);
                setFilteredData([]);
                setError("No data received from server");
            }
            
        } catch (err) {
            console.error("Error fetching fee structures:", err);
            setError(err.response?.data?.message || "Failed to fetch fee structures");
            setFeeStructures([]);
            setFilteredData([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch stats
    const fetchStats = async () => {
        try {
            const response = await api.get('/api/fee-structures/stats/summary');
            if (response.data.success && response.data.data) {
                setStats({
                    total: response.data.data.total || 0,
                    academic: response.data.data.academic || 0,
                    transport: response.data.data.transport || 0
                });
            }
        } catch (err) {
            console.error("Error fetching stats:", err);
            // Use calculated stats as fallback
            calculateStats(feeStructures);
        }
    };

    // Calculate stats from data (fallback)
    const calculateStats = (data) => {
        const total = data.length;
        const academic = data.filter(item => item.fee_type !== 'transport').length;
        const transport = data.filter(item => item.fee_type === 'transport').length;
        
        setStats({
            total,
            academic,
            transport
        });
    };

    // Delete fee structure
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this fee structure?")) {
            return;
        }
        
        try {
            const response = await api.delete(`/api/fee-structures/${id}`);
            
            if (response.data.success) {
                // Refresh the list
                fetchFeeStructures();
                fetchStats();
            } else {
                alert(response.data.message || "Failed to delete");
            }
        } catch (err) {
            console.error("Delete error:", err);
            alert(err.response?.data?.message || "Failed to delete fee structure");
        }
    };

    // Apply filters
    useEffect(() => {
        let result = feeStructures;
        
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(item =>
                item.fee_name?.toLowerCase().includes(term) ||
                (item.classes && Array.isArray(item.classes) && 
                    item.classes.some(cls => cls.toLowerCase().includes(term))
                ) ||
                (item.driver_name && item.driver_name.toLowerCase().includes(term))
            );
        }
        
        if (statusFilter) {
            result = result.filter(item => item.status === statusFilter);
        }
        
        setFilteredData(result);
    }, [searchTerm, statusFilter, feeStructures]);

    useEffect(() => {
        fetchFeeStructures();
        fetchStats();
    }, []);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleStatusChange = (option) => {
        setStatusFilter(option.value);
    };

    // Safely get class names
    const getClassNames = (item) => {
        if (item.classes && Array.isArray(item.classes) && item.classes.length > 0) {
            return item.classes.join(", ");
        }
        
        if (item.class_ids && Array.isArray(item.class_ids) && item.class_ids.length > 0) {
            return `${item.class_ids.length} class(es) selected`;
        }
        
        return item.fee_type === 'transport' ? "Transport Route" : "No classes assigned";
    };

    // Get fee type display
    const getFeeTypeDisplay = (type) => {
        const types = {
            'transport': 'Transport',
            'academic': 'Academic',
            'exam': 'Exam',
            'sports': 'Sports',
            'library': 'Library',
            'other': 'Other'
        };
        return types[type] || (type?.charAt(0).toUpperCase() + type?.slice(1)) || 'Academic';
    };

    // Get frequency display
    const getFrequencyDisplay = (frequency) => {
        if (!frequency) return "-";
        return frequency.replace('_', ' ').toLowerCase();
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-screen">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="relative p-6 bg-gray-50 min-h-screen font-sans">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Fee Structures
                        </h1>
                        <p className="text-sm text-gray-500">
                            Manage and filter your fee structures
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <CustomButton
                            text="Create Fee Structure"
                            to="/fee-structure/create"
                            className="bg-[#faae1c] text-white hover:bg-[#faae1c]/85"
                            icon={<Plus size={18} />}
                        />
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                        <div className="flex items-center gap-3 mb-2">
                            <AlertCircle className="text-red-500" size={20} />
                            <span className="text-red-700 font-bold">Error</span>
                        </div>
                        <p className="text-red-600 ml-7">{error}</p>
                        <div className="mt-3 ml-7">
                            <button 
                                onClick={fetchFeeStructures} 
                                className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                            >
                                Retry
                            </button>
                            <button 
                                onClick={() => setError(null)} 
                                className="ml-3 px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Stat 
                        label="All Fee Structures" 
                        value={stats.total.toString()} 
                        icon={<Users />} 
                    />
                    <Stat
                        label="Academic Fees"
                        value={stats.academic.toString()}
                        icon={<CheckCircle2 />}
                        color="green"
                    />
                    <Stat
                        label="Transport Fees"
                        value={stats.transport.toString()}
                        icon={<Bus />}
                        color="red"
                    />
                </div>

                {/* Filters Section */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex-1 min-w-[250px] sm:min-w-[300px] w-full">
                        <div className="relative group">
                            <Search
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                size={18}
                            />
                            <input
                                type="text"
                                placeholder="Search by fee name, class, or driver..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="w-full pl-10 pr-12 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                        </div>
                    </div>
                    <div className="flex flex-wrap flex-col sm:flex-row gap-3 sm:items-center">
                        <div className="w-50 sm:w-50">
                            <CustomSelect
                                options={statusOptions}
                                placeholder="Status (All)"
                                onChange={handleStatusChange}
                                value={statusOptions.find(opt => opt.value === statusFilter)}
                            />
                        </div>
                        <button 
                            className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm hover:bg-gray-200 cursor-pointer transition-colors"
                            onClick={() => {
                                setSearchTerm("");
                                setStatusFilter("");
                            }}
                        >
                            <Filter size={16} />
                            <span className="font-medium">Clear Filters</span>
                        </button>
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase font-bold">
                                    <th className="px-6 py-4">Fee Name</th>
                                    <th className="px-6 py-4">Class/Route</th>
                                    <th className="px6 py-4">Fee Type</th>
                                    <th className="px-6 py-4">Frequency</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-400">
                                                {error ? (
                                                    <>
                                                        <AlertCircle size={48} className="mb-3" />
                                                        <p className="text-lg mb-2">Unable to load data</p>
                                                        <p className="text-sm">Please check your backend configuration</p>
                                                    </>
                                                ) : feeStructures.length === 0 ? (
                                                    <>
                                                        <p className="text-lg">No fee structures found</p>
                                                        <p className="text-sm mt-1">Create your first fee structure</p>
                                                        <Link
                                                            to="/fee-structure/create"
                                                            className="mt-3 px-4 py-2 bg-[#faae1c] text-white rounded-lg hover:bg-[#faae1c]/90"
                                                        >
                                                            Create Fee Structure
                                                        </Link>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Search size={48} className="mb-3" />
                                                        <p className="text-lg">No matching results</p>
                                                        <p className="text-sm mt-1">Try different search terms or filters</p>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredData.map((item) => (
                                        <tr key={item.fee_id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-bold text-gray-800">
                                                    {item.fee_name || "Unnamed Fee"}
                                                </div>
                                                {item.academic_year && (
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {item.academic_year}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {getClassNames(item)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                    item.fee_type === 'transport' 
                                                    ? "bg-blue-100 text-blue-800"
                                                    : item.fee_type === 'exam'
                                                    ? "bg-purple-100 text-purple-800"
                                                    : item.fee_type === 'sports'
                                                    ? "bg-orange-100 text-orange-800"
                                                    : "bg-green-100 text-green-800"
                                                }`}>
                                                    {getFeeTypeDisplay(item.fee_type)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                                                {getFrequencyDisplay(item.frequency)}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                                                ₹{parseFloat(item.amount || 0).toLocaleString('en-IN', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                    item.status === 'active'
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-100 text-red-800"
                                                }`}>
                                                    {item.status?.charAt(0).toUpperCase() + item.status?.slice(1) || "Unknown"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center items-center gap-2">
                                                    <Link
                                                        to={`/fee-structure/edit/${item.fee_id}`}
                                                        className="text-amber-600 hover:text-amber-800 p-1 hover:bg-amber-50 rounded"
                                                        title="Edit"
                                                    >
                                                        <Pencil size={16} />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(item.fee_id)}
                                                        className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded cursor-pointer"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Index;