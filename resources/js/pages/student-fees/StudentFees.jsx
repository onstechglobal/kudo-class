// C:\xampp\htdocs\kudoclass\resources\js\pages\student-fees\StudentFees.jsx

import React, { useEffect, useState } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import Stat from "../../components/common/StatCard";
import { Search, Users, CheckCircle2, AlertCircle } from "lucide-react";
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
                                    <th className="px-6 py-4">Fee Type</th>
                                    <th className="px-6 py-4">Net Amount</th>
                                    <th className="px-6 py-4">Paid</th>
                                    <th className="px-6 py-4">Balance</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Blocked</th>
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
                                    filteredData.map((fee) => (
                                        <tr key={fee.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                <div className="flex items-center gap-3">
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-800">{fee.student_name}</div>
                                                        {/* <div className="text-xs text-gray-500">#{fee.admission_no}</div> */}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {fee.class_name}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {fee.section_name}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {fee.fee_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                                                ₹{fee.net_amount}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-green-600 font-semibold">
                                                ₹{fee.paid_amount}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-red-600 font-semibold">
                                                ₹{fee.balance}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                    fee.status === "paid"
                                                        ? "bg-green-100 text-green-800"
                                                        : fee.status === "partial"
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : "bg-red-100 text-red-800"
                                                }`}>
                                                    {fee.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {fee.is_blocked == 1 ? (
                                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        Blocked
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Active
                                                    </span>
                                                )}
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
