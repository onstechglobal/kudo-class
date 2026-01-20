import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "@/layouts/AdminLayout";

import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Eye,
  Edit2,
  CreditCard,
  Download,
  UserCheck,
  Users,
  UserMinus,
  GraduationCap,
} from "lucide-react";

const StudentListing = () => {
  // Mock Data for UI demonstration

  const students = [
    {
      id: "STU001",
      name: "Arjun Mehta",
      class: "10-A",
      roll: "22",
      parent: "Suresh Mehta",
      contact: "+91 98765 43210",
      status: "Active",
      image: "https://i.pravatar.cc/150?u=1",
    },

    {
      id: "STU002",
      name: "Sana Khan",
      class: "10-B",
      roll: "45",
      parent: "Aamir Khan",
      contact: "+91 88765 12345",
      status: "Active",
      image: "https://i.pravatar.cc/150?u=2",
    },

    {
      id: "STU003",
      name: "Rohan Gupta",
      class: "9-C",
      roll: "12",
      parent: "Alok Gupta",
      contact: "+91 77765 98765",
      status: "Inactive",
      image: "https://i.pravatar.cc/150?u=3",
    },
  ];

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-50 min-h-screen font-sans">
        {/* --- PAGE HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Student Directory
            </h1>
            <p className="text-sm text-gray-500">
              Manage and view all enrolled students
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
              <Download size={16} /> Export
            </button>
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm">
              <Plus size={16} /> Add New Student
            </button>
          </div>
        </div>

        {/* --- STATS CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total Students",
              value: "1,250",
              icon: <Users className="text-blue-600" />,
              bg: "bg-blue-50",
            },

            {
              label: "Active",
              value: "1,180",
              icon: <UserCheck className="text-green-600" />,
              bg: "bg-green-50",
            },

            {
              label: "Inactive",
              value: "70",
              icon: <UserMinus className="text-red-600" />,
              bg: "bg-red-50",
            },

            {
              label: "New Admissions",
              value: "12",
              icon: <GraduationCap className="text-purple-600" />,
              bg: "bg-purple-50",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4"
            >
              <div className={`${stat.bg} p-3 rounded-lg`}>{stat.icon}</div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">
                  {stat.label}
                </p>
                <p className="text-xl font-bold text-gray-800">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* --- FILTERS SECTION --- */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 flex flex-wrap gap-4 items-center justify-between">
          <div className="relative flex-1 min-w-[300px]">
            <Search
              className="absolute left-3 top-1/2 -transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by name, ID or roll number..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-3">
            <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none bg-white">
              <option>Class (All)</option>
              <option>Grade 10</option>
              <option>Grade 9</option>
            </select>
            <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none bg-white">
              <option>Section (All)</option>
              <option>A</option>
              <option>B</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
              <Filter size={16} /> More Filters
            </button>
          </div>
        </div>

        {/* --- DATA TABLE --- */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase font-bold">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Roll No</th>
                  <th className="px-6 py-4">Class</th>
                  <th className="px-6 py-4">Parent / Contact</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={student.image}
                          alt=""
                          className="w-10 h-10 rounded-full border border-gray-200"
                        />
                        <div>
                          <div className="text-sm font-bold text-gray-800">
                            {student.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {student.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      #{student.roll}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                      {student.class}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-800">
                        {student.parent}
                      </div>
                      <div className="text-xs text-gray-500">
                        {student.contact}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          student.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          title="View"
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          title="Edit"
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          title="Fees"
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                        >
                          <CreditCard size={18} />
                        </button>
                        <button
                          title="More"
                          className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg"
                        >
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* --- PAGINATION --- */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Showing 1 to 10 of 1,250 entries
            </span>
            <div className="flex gap-2">
              <button className="px-3 py-1 border border-gray-300 rounded bg-white text-sm disabled:opacity-50">
                Prev
              </button>
              <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
                1
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded bg-white text-sm hover:bg-gray-50">
                2
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded bg-white text-sm hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default StudentListing;
