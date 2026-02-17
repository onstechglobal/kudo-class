import React, { useEffect, useState } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import CustomButton from "../../components/form/CustomButton";
import Stat from "../../components/common/StatCard";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    Settings,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";
import api from "../../helpers/api";

const Index = () => {

    const [policies, setPolicies] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const location = useLocation();
    const navigate = useNavigate();

    const [message, setMessage] = useState("");
    const [messageClass, setMessageClass] = useState("");

    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0
    });

    /* ---------------- FETCH POLICIES ---------------- */

    const fetchPolicies = async () => {
        try {
            setLoading(true);
            setError(null);

            const user = JSON.parse(localStorage.getItem("user"));
            let schoolId = user?.school_id;
            if (!schoolId || schoolId === 0) schoolId = 1;

            const response = await api.get(`/api/fees-policy?school_id=${schoolId}`);

            if (response.data.success) {
                const data = response.data.data;
                setPolicies(data);
                setFilteredData(data);
                calculateStats(data);
            } else {
                setPolicies([]);
                setFilteredData([]);
                setError("No data received from server");
            }

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to fetch policies");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPolicies();
    }, []);

    /* ---------------- SUCCESS MESSAGE ---------------- */

    useEffect(() => {
        if (location.state?.message) {

            if (location.state.status === "success") {
                setMessageClass("text-green-700 border-green-600 bg-green-50");
            } else {
                setMessageClass("text-red-700 border-red-600 bg-red-50");
            }

            setMessage(location.state.message);

            const timer = setTimeout(() => {
                setMessage("");
                setMessageClass("");
            }, 5000);

            navigate(location.pathname, { replace: true });

            return () => clearTimeout(timer);
        }
    }, []);

    /* ---------------- STATS ---------------- */

    const calculateStats = (data) => {
        const total = data.length;
        const active = data.filter(item => item.status === "active").length;

        setStats({
            total,
            active,
            inactive: total - active
        });
    };

    /* ---------------- DELETE ---------------- */

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this policy?")) return;

        try {
            const response = await api.delete(`/api/fees-policy/${id}`);

            if (response.data.success) {
                fetchPolicies();
            } else {
                alert(response.data.message || "Delete failed");
            }

        } catch (err) {
            alert(err.response?.data?.message || "Delete failed");
        }
    };

    /* ---------------- SEARCH ---------------- */

    useEffect(() => {
        let result = policies;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(item =>
                item.policy_name?.toLowerCase().includes(term)
            );
        }

        setFilteredData(result);
    }, [searchTerm, policies]);

    return (
        <AdminLayout>
            <div className="relative p-6 bg-gray-50 min-h-screen font-sans">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Fee Policies
                        </h1>
                        <p className="text-sm text-gray-500">
                            Manage fee policy configurations
                        </p>
                    </div>

                    <CustomButton
                        text="Create Fee Policy"
                        to="/fee-policies/create"
                        className="bg-[#faae1c] text-white hover:bg-[#faae1c]/85"
                        icon={<Plus size={18} />}
                    />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Stat label="All Policies" value={stats.total.toString()} icon={<Settings />} />
                    <Stat label="Active Policies" value={stats.active.toString()} icon={<CheckCircle2 />} color="green" />
                    <Stat label="Inactive Policies" value={stats.inactive.toString()} icon={<AlertCircle />} color="red" />
                </div>

                {/* Search */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6">
                    <div className="relative">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            size={18}
                        />
                        <input
                            type="text"
                            placeholder="Search by policy name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">

                    {message && (
                        <div className={`flex items-center gap-2 rounded-lg border border-l-[3px] border-r-[3px] ${messageClass} px-4 py-3 text-sm font-medium mb-4`}>
                            {message}
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase font-bold">
                                    <th className="px-6 py-4">Policy Name</th>
                                    <th className="px-6 py-4">Reminder</th>
                                    <th className="px-6 py-4">Reminder Frequency</th>
                                    <th className="px-6 py-4">Block After</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-center">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="p-6 text-center text-gray-500">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
                                                <p className="text-xs font-medium text-gray-600 animate-pulse tracking-widest">
                                                    Loading Data...
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredData.length > 0 ? (
                                    filteredData.map((policy) => (
                                        <tr key={policy.policy_id} className="hover:bg-gray-50">

                                            {/* Policy Name */}
                                            <td className="px-6 py-4 text-sm font-medium text-gray-800">
                                                {policy.policy_name}
                                            </td>

                                            {/* Reminder Enabled */}
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {policy.reminder_enabled ? "Enabled" : "Disabled"}
                                            </td>

                                            {/* Reminder Frequency */}
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {policy.reminder_frequency_days
                                                    ? `${policy.reminder_frequency_days} days`
                                                    : "-"}
                                            </td>

                                            {/* Block After */}
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {policy.block_after_months
                                                    ? `${policy.block_after_months} months`
                                                    : "-"}
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                        policy.status?.toLowerCase() === "active"
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-red-100 text-red-800"
                                                    }`}
                                                >
                                                    {policy.status?.toLowerCase() === "active"
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center items-center gap-2">
                                                    <Link
                                                        to={`/fee-policies/edit/${policy.policy_id}`}
                                                        className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded cursor-pointer"
                                                        title="Edit"
                                                    >
                                                        <Pencil size={16} />
                                                    </Link>

                                                    <button
                                                        onClick={() => handleDelete(policy.policy_id)}
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
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
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

export default Index;
