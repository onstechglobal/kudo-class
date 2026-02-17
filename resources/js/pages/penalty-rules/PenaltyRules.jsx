import React, { useEffect, useState } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import CustomButton from "../../components/form/CustomButton";
import Stat from "../../components/common/StatCard";
import { Link } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { Plus, Search, Pencil, Trash2, ShieldAlert, CheckCircle2, AlertCircle, } from "lucide-react";
import api from "../../helpers/api";

const PenaltyRules = () => {

    const [rules, setRules] = useState([]);
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

    // Fetch Rules
    const fetchRules = async () => {
        try {
            setLoading(true);
            setError(null);

            const user = JSON.parse(localStorage.getItem("user"));
            let schoolId = user?.school_id;
            if (!schoolId || schoolId === 0) schoolId = 1;

            const response = await api.get(`/api/penalty-rules?school_id=${schoolId}`);

            if (response.data.status) {
                const data = response.data.data;
                setRules(data);
                setFilteredData(data);
                calculateStats(data);
            } else {
                setRules([]);
                setFilteredData([]);
                setError("No data received from server");
            }

        } catch (err) {
            console.error("Error fetching penalty rules:", err);
            setError(err.response?.data?.message || "Failed to fetch penalty rules");
            setRules([]);
            setFilteredData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRules();
    }, []);

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

            // Clear location state
            navigate(location.pathname, { replace: true });

            return () => clearTimeout(timer);
        }
    }, []);

    // Calculate Stats
    const calculateStats = (data) => {
        const total = data.length;
        const active = data.filter(item => item.status === "active").length;

        setStats({
            total,
            active,
            inactive: total - active
        });
    };


    // Delete Rule
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this rule?")) {
            return;
        }

        try {
            const response = await api.delete(`/api/penalty-rules/${id}`);

            if (response.data.status) {
                fetchRules();
            } else {
                alert(response.data.message || "Failed to delete");
            }

        } catch (err) {
            console.error("Delete error:", err);
            alert(err.response?.data?.message || "Failed to delete rule");
        }
    };

    // Search filter
    useEffect(() => {
        let result = rules;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(item =>
                item.fee_type?.toLowerCase().includes(term) ||
                item.penalty_type?.toLowerCase().includes(term)
            );
        }

        setFilteredData(result);
    }, [searchTerm, rules]);

    const getPenaltyDisplay = (rule) => {
        if (rule.penalty_type === "flat") {
            return `₹${parseFloat(rule.penalty_value).toLocaleString('en-IN')}`;
        }
        return `${rule.penalty_value}%`;
    };

    const getFrequencyDisplay = (frequency) => {
        if (!frequency) return "-";
        return frequency.replace('_', ' ').toLowerCase();
    };

    return (
        <AdminLayout>
            <div className="relative p-6 bg-gray-50 min-h-screen font-sans">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Penalty Rules
                        </h1>
                        <p className="text-sm text-gray-500">
                            Manage fee penalty configurations
                        </p>
                    </div>

                    <CustomButton
                        text="Create Penalty Rule"
                        to="/penalty-rules/create"
                        className="bg-[#faae1c] text-white hover:bg-[#faae1c]/85"
                        icon={<Plus size={18} />}
                    />
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
                                onClick={fetchRules}
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

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Stat label="All Rules" value={stats.total.toString()} icon={<ShieldAlert />} />
                    <Stat label="Active Rules" value={stats.active.toString()} icon={<CheckCircle2 />} color="green" />
                    <Stat label="Inactive Rules" value={stats.inactive.toString()} icon={<AlertCircle />} color="red" />
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
                            placeholder="Search by fee type or penalty type..."
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
                                    <th className="px-6 py-4">Fee Type</th>
                                    <th className="px-6 py-4">Policy</th>
                                    <th className="px-6 py-4">Penalty</th>
                                    <th className="px-6 py-4">After Days</th>
                                    <th className="px-6 py-4">Frequency</th>
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
                                    filteredData.map((rule) => (
                                        <tr key={rule.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 capitalize text-sm font-medium text-gray-800">
                                                {rule.fee_type}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-800">
                                                {rule.policy?.policy_name || "-"}
                                            </td>

                                            <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                                                {getPenaltyDisplay(rule)}
                                            </td>

                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {rule.grace_period_days} days
                                            </td>

                                            <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                                                {getFrequencyDisplay(rule.frequency)}
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                    rule.status === "active"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-100 text-red-800"
                                                }`}>
                                                    {rule.status === "active" ? "Active" : "Inactive"}
                                                </span>
                                            </td>


                                            <td className="px-6 py-4">
                                                <div className="flex justify-center items-center gap-2">
                                                     <Link
                                                        to={`/penalty-rules/edit/${rule.id}`}
                                                        className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded cursor-pointer"
                                                        title="Edit"
                                                    >
                                                        <Pencil size={16} />
                                                     </Link>

                                                    <button
                                                        onClick={() => handleDelete(rule.id)}
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

export default PenaltyRules;
