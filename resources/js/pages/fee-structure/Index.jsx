import React, { useState, useEffect } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import CustomButton from "../../components/form/CustomButton";
import Stat from "../../components/common/StatCard";
import Input from "../../components/form/Input";
import CustomSelect from "../../components/form/CustomSelect";
import { Link } from "react-router-dom";

import {
    Search,
    Plus,
    Filter,
    MoreVertical,
    Eye,
    Edit2,
    Pencil,
    Trash2,
    CreditCard,
    Download,
    UserCheck,
    Users,
    UserMinus,
    GraduationCap,
    CheckCircle2,
    History,
    Bus,
} from "lucide-react";

const statusOptions = [
    { label: "Status (All)", value: "" },
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
];

const staticSchools = [
    {
        id: 1,
        name: "Academic Fee",
        class: "Class 1",
        type: "Monthly",
        amount: "₹2000",
    },
    {
        id: 2,
        name: "Transport Fee",
        class: "Class 2",
        type: "Yearly",
        amount: "₹12000",
    },
    {
        id: 3,
        name: "Sports Fee",
        class: "Class 3",
        type: "Monthly",
        amount: "₹1500",
    },
    {
        id: 4,
        name: "Library Fee",
        class: "Class 4",
        type: "Yearly",
        amount: "₹3000",
    },
    {
        id: 5,
        name: "Exam Fee",
        class: "Class 5",
        type: "One Time",
        amount: "₹2500",
    },
];

const FeeStucture = () => {
    return (
        <>
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
                            />
                        </div>
                    </div>

                    {/* --- STATS CARDS --- */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <Stat label="All" value="10" icon={<Users />} />
                        <Stat
                            label="Academic Fees"
                            value="10"
                            icon={<CheckCircle2 />}
                            color="green"
                        />
                        <Stat
                            label="Transport Fees"
                            value="10"
                            icon={<Bus />}
                            color="red"
                        />
                    </div>

                    {/* --- FILTERS SECTION --- */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex-1 min-w-[250px] sm:min-w-[300px] w-full">
                            <div className="relative group">
                                <Search
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    size={18}
                                />

                                <input
                                    type="text"
                                    placeholder="Search by name, ID or email..."
                                    className="w-full pl-10 pr-12 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                />

                                <button
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 
                                bg-[#faae1c]/20 text-[#faae1c] 
                                rounded-md 
                                hover:bg-[#faae1c] hover:text-white
                                transition-colors cursor-pointer"
                                    title="Click to search"
                                >
                                    <Search
                                        size={18}
                                        strokeWidth={2.5}
                                        className="text-current"
                                    />
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-wrap flex-col sm:flex-row gap-3 sm:items-center min-w-[400px]">
                            {/* CustomSelect for Status */}
                            <div className="w-50 sm:w-50">
                                <CustomSelect
                                    options={statusOptions}
                                    placeholder="Status (All)"
                                />
                            </div>
                            <button className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm hover:bg-gray-200 cursor-pointer transition-colors w-44 sm:w-40">
                                <Filter size={16} />{" "}
                                <span className="font-medium">
                                    More Filters
                                </span>
                            </button>
                        </div>
                    </div>
                    {/* --- DATA TABLE --- */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase font-bold">
                                        <th className="px-6 py-4">
                                            Structure Name
                                        </th>
                                        <th className="px-6 py-4">Class</th>
                                        <th className="px-6 py-4">Fee Type</th>
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4 text-center">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100">
                                    {staticSchools.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4 text-sm font-bold text-gray-800">
                                                {item.name}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {item.class}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {item.type}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {item.amount}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center items-center gap-2">
                                                    <Link
                                                        to=""
                                                        className="text-amber-600 hover:text-amber-800"
                                                        title="Edit"
                                                    >
                                                        <Pencil size={16} />
                                                    </Link>
                                                    <button
                                                        className="text-red-600 hover:text-red-800 cursor-pointer"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* --- PAGINATION --- */}

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 sm:flex items-center justify-between">
                            <span className="text-sm text-gray-500 w-full sm:w-[fit-content] mb-2">
                                Showing of
                            </span>

                            <div className="flex gap-2">
                                <button className="px-3 py-1 border rounded text-sm bg-gray-100 text-gray-400 cursor-not-allowed">
                                    Prev
                                </button>

                                <div className="flex items-center px-4 text-sm font-medium text-gray-700">
                                    Page 1 of 5
                                </div>

                                <button className="px-3 py-1 border rounded text-sm bg-white hover:bg-gray-50 cursor-pointer">
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        </>
    );
};

export default FeeStucture;
