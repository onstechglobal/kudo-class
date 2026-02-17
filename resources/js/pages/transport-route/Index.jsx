import React, { useEffect, useState } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import CustomButton from "../../components/form/CustomButton";
import Stat from "../../components/common/StatCard";
import { Link } from "react-router-dom";
import api from "../../helpers/api";
import {
    Search,
    Plus,
    Filter,
    Pencil,
    Bus,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Trash2
} from "lucide-react";

const TransportRouteIndex = () => {
    const [routes, setRoutes] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0,
    });

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this transport route?")) {
            return;
        }
        
        try {
            const response = await api.delete(`/api/transport-routes/${id}`);
            
            if (response.data.success) {
                // Refresh the list
                fetchRoutes();
            } else {
                alert(response.data.message || "Failed to delete");
            }
        } catch (err) {
            console.error("Delete error:", err);
            alert(err.response?.data?.message || "Failed to delete fee structure");
        }
    };

    const fetchRoutes = async () => {
        try {
            setLoading(true);
            setError(null);
            const user = JSON.parse(localStorage.getItem("user"));
            let schoolId = user?.school_id;
            if (!schoolId || schoolId === 0) schoolId = 1;

            const res = await api.get('/api/transport-routes', {
                params: {
                    schoolId: schoolId
                }
            });

            if (res.data?.success) {
                const data = res.data.data || [];
                setRoutes(data);
                setFilteredData(data);
                calculateStats(data);
            } else {
                setError("Failed to load transport routes");
            }
        } catch (err) {
            setError("Unable to fetch transport routes");
        } finally {
            setLoading(false);
        }
    };


    const calculateStats = (data) => {
        setStats({
            total: data.length,
            active: data.filter(r => r.status === "active").length,
            inactive: data.filter(r => r.status === "inactive").length,
        });
    };

    useEffect(() => {
        let result = routes;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(item =>
                item.route_name?.toLowerCase().includes(term) ||
                item.driver_name?.toLowerCase().includes(term)
            );
        }

        if (statusFilter) {
            result = result.filter(item => item.status === statusFilter);
        }

        setFilteredData(result);
    }, [searchTerm, statusFilter, routes]);

    useEffect(() => {
        fetchRoutes();
    }, []);

    return (
        <AdminLayout>
            <div className="relative p-6 bg-gray-50 min-h-screen font-sans">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Transport Routes
                        </h1>
                        <p className="text-sm text-gray-500">
                            Manage transport routes and driver details
                        </p>
                    </div>

                    <CustomButton
                        text="Add Transport Route"
                        to="/transport/create"
                        className="bg-[#faae1c] text-white hover:bg-[#faae1c]/85"
                        icon={<Plus size={18} />}
                    />
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                        <div className="flex items-center gap-3 mb-2">
                            <AlertCircle className="text-red-500" size={20} />
                            <span className="text-red-700 font-bold">Error</span>
                        </div>
                        <p className="text-red-600 ml-7">{error}</p>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Stat label="Total Routes" value={(stats.total || 0).toString()} icon={<Bus />} />
                    <Stat label="Active Routes" value={stats.active.toString()} icon={<CheckCircle2 />} color="green" />
                    <Stat label="Inactive Routes" value={stats.inactive.toString()} icon={<AlertCircle />} color="red" />
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex-1 min-w-[250px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by route or driver..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            setSearchTerm("");
                            setStatusFilter("");
                        }}
                        className="flex items-center gap-2 px-4 py-3 bg-gray-100 rounded-xl text-sm hover:bg-gray-200"
                    >
                        <Filter size={16} /> More Filters
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase font-bold">
                                    <th className="px-6 py-4">Route Name</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-center">Action</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                 {loading ? (
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
                                ) : filteredData.length > 0 ? (
                                    filteredData.map(route => (
                                        <tr key={route.route_id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {route.route_name}
                                            </td>

                                            <td className="px-6 py-4 text-sm text-gray-600">
												₹{Number(route.monthly_fee || 0).toLocaleString("en-IN")}
											</td>

                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                    route.status === "active"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-100 text-red-800"
                                                }`}>
                                                    {route.status}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center items-center gap-2">
                                                    <Link
                                                        to={`/transport/edit/${route.route_id}`}
                                                        className="text-amber-600 hover:text-amber-800 p-1 hover:bg-amber-50 rounded"
                                                    >
                                                        <Pencil size={16} />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(route.route_id)}
                                                        className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded cursor-pointer"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                            <p className="text-lg font-semibold">No data found</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default TransportRouteIndex;
