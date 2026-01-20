import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "@/layouts/AdminLayout";
import {Search, Plus, Eye, Edit2, Users, UserCheck, UserMinus} from "lucide-react";

export default function TeacherListing() {
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    axios.get("/teachers").then(res => setTeachers(res.data));
  }, []);

  const filtered = teachers.filter(t =>
    `${t.first_name} ${t.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    t.employee_code?.toLowerCase().includes(search.toLowerCase())
  );

  const total = teachers.length;
  const active = teachers.filter(t => t.status === "active").length;
  const inactive = total - active;

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-50 min-h-screen">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Teacher Directory</h1>
            <p className="text-sm text-gray-500">Manage all teachers</p>
          </div>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg">
            <Plus size={16} /> Add Teacher
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Stat label="Total Teachers" value={total} icon={<Users />} />
          <Stat label="Active" value={active} icon={<UserCheck />} color="green" />
          <Stat label="Inactive" value={inactive} icon={<UserMinus />} color="red" />
        </div>

        {/* SEARCH */}
        <div className="bg-white p-4 rounded-xl border border-gray-300 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or employee code..."
              className="pl-10 w-full py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl border border-gray-300 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase font-bold">
              <tr>
                <th className="p-4 text-left">Teacher</th>
                <th className="p-4">Emp Code</th>
                <th className="p-4">Designation</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(t => (
                <tr key={t.teacher_id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="font-semibold">
                      {t.first_name} {t.last_name}
                    </div>
                    <div className="text-xs text-gray-500">{t.email}</div>
                  </td>
                  <td className="p-4">{t.employee_code}</td>
                  <td className="p-4">{t.designation}</td>
                  <td className="p-4">{t.mobile}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      t.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="p-4 flex justify-center gap-2">
                    <button className="text-blue-600"><Eye size={16} /></button>
                    <button className="text-amber-600"><Edit2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-gray-500">
                    No teachers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

/* STAT CARD */
function Stat({ label, value, icon, color = "blue" }) {
  const colors = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700"
  };
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-300 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-xs text-gray-500 uppercase">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}
