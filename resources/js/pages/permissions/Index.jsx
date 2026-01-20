import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import AdminLayout from "@/layouts/AdminLayout";
import Stat from "../../components/StatCard";
import {Search,Plus,Pencil,Trash2,ShieldCheck,Shield,ShieldOff} from "lucide-react";

export default function PermissionListing() {
  const [permissions, setPermissions] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/permissions")
      .then(res => setPermissions(res.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = permissions.filter(p =>
    p.module.toLowerCase().includes(search.toLowerCase())
  );

  const total = permissions.length;
  const active = permissions.filter(p => p.status === "active").length;
  const inactive = total - active;

  function deletePermission(id) {
    if (!confirm("Are you sure you want to delete this permission?")) return;

    axios.delete(`/permissions/${id}`).then(() => {
      setPermissions(prev => prev.filter(p => p.permission_id !== id));
    });
  }

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-50 min-h-screen">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Permission Directory</h1>
            <p className="text-sm text-gray-500">Manage system permissions</p>
          </div>

          <Link
            to="/admin/permissions/create"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            <Plus size={16} /> Add Permission
          </Link>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Stat label="Total Permissions" value={total} icon={<Shield />} />
          <Stat label="Active" value={active} icon={<ShieldCheck />} color="green" />
          <Stat label="Inactive" value={inactive} icon={<ShieldOff />} color="red" />
        </div>

        {/* SEARCH */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by permission name..."
              className="pl-10 w-full py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl border border-gray-300 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold">
              <tr>
                <th className="p-4">Permission</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {loading && (
                <tr>
                  <td colSpan="3" className="p-6 text-center text-gray-500">
                    Loading permissions...
                  </td>
                </tr>
              )}

              {!loading && filtered.map(p => (
                <tr
                  key={p.permission_id}
                  className="border border-gray-200 hover:bg-gray-50"
                >
                  <td className="p-4 font-semibold">
                    {p.module}
                  </td>

                  <td className="p-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        p.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>

                  <td className="p-4 flex justify-center gap-3">
                    <Link
                      to={`/admin/permissions/${p.permission_id}/edit`}
                      className="text-amber-600"
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </Link>

                    <button
                      onClick={() => deletePermission(p.permission_id)}
                      className="text-red-600"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}

              {!loading && !filtered.length && (
                <tr>
                  <td colSpan="3" className="p-6 text-center text-gray-500">
                    No permissions found
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
