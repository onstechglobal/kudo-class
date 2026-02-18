import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/layouts/AdminLayout";
import Stat from "../../components/common/StatCard";
import { Search, Users, CheckCircle2, AlertCircle,Eye } from "lucide-react";
import api from "../../helpers/api";

const StudentFees = () => {
    const [fees, setFees] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const [stats, setStats] = useState({
        total: 0,
        paid: 0,
        pending: 0
    });

    useEffect(() => {
        fetchFees();
    }, []);

    const fetchFees = async () => {
        try {
            setLoading(true);

            const user = JSON.parse(localStorage.getItem("user"));
            let schoolId = user?.school_id;
            let role_id = user?.role_id;
            let user_id = user?.id;

            if (!schoolId || schoolId === 0) schoolId = 1;

            const response = await api.get('/api/student-fees', {
                params: {
                    schoolId: schoolId,
                    role: role_id,
                    userId: user_id
                }
            });

            if (response.data.status) {
                const data = response.data.data;
                setFees(data);
                setFilteredData(data);
                calculateStats(data);
            }
        } catch (error) {
            console.error("Error fetching fees", error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data) => {
        const total = data.length;
        const paid = data.filter(f => f.status === "paid").length;
        const pending = data.filter(f => f.status !== "paid").length;

        setStats({ total, paid, pending });
    };

    useEffect(() => {
        let result = fees;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(item =>
                item.student_name?.toLowerCase().includes(term) ||
                item.admission_no?.toLowerCase().includes(term) ||
                item.class_name?.toLowerCase().includes(term)
            );
        }

        setFilteredData(result);
    }, [searchTerm, fees]);

    return (
        <AdminLayout>
            <div className="relative p-6 bg-gray-50 min-h-screen font-sans">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Student Fee Structure
                        </h1>
                        <p className="text-sm text-gray-500">
                            Manage and track student payments
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Stat label="Total Students" value={stats.total.toString()} icon={<Users />} />
                    <Stat label="Paid Students" value={stats.paid.toString()} icon={<CheckCircle2 />} color="green" />
                    <Stat label="Pending Students" value={stats.pending.toString()} icon={<AlertCircle />} color="red" />
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
                            placeholder="Search by student name, admission no or class..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase font-bold">
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Class</th>
                                    <th className="px-6 py-4">Section</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="p-4 text-center">Action</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="10" className="p-6 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
                                                <p className="text-xs text-gray-500 animate-pulse">
                                                    Loading Data...
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredData.length > 0 ? (
                                    filteredData.map((student) => (
                                        <tr key={student.student_id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4 text-sm font-bold text-gray-900">
                                                {student.student_name}
                                            </td>

                                            <td className="p-4 text-sm text-gray-600">
                                                {student.class_name}
                                            </td>

                                            <td className="p-4 text-sm text-gray-600">
                                                {student.section_name}
                                            </td>

                                            <td className="p-4 text-sm text-gray-600">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                student.total_balance == 0
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                                }`}>
                                                {student.total_balance == 0 ? "Paid" : "Pending"}
                                                </span>
                                            </td>

                                            <td className="p-4">
                                                <div className="flex justify-center items-center gap-3">
                                                    <Link
                                                        to={`/student-fees/${student.student_id}`}
                                                        className="text-blue-600 hover:text-blue-800 cursor-pointer"
                                                    >
                                                        <Eye size={16} />
                                                    </Link>
                                                </div>
                                            </td>

                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="10" className="px-6 py-8 text-center text-gray-500">
                                            No Data Found
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

export default StudentFees;
