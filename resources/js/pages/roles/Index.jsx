import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "@/layouts/AdminLayout";
import Stat from "../../components/StatCard";
import {Search,Plus,Eye,Edit2,Trash2,Users,UserCheck,UserMinus} from "lucide-react";
import { Link } from "react-router-dom";

export default function RoleListing() {
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/roles")
      .then(res => setRoles(res.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = roles.filter(r =>
    r.role_name.toLowerCase().includes(search.toLowerCase())
  );

  const total = roles.length;
  const active = roles.filter(r => r.status === "active").length;
  const inactive = total - active;

  function deleteRole(id) {
    if (!confirm("Delete this role?")) return;

    axios.delete(`/roles/${id}`).then(() => {
      setRoles(roles.filter(r => r.role_id !== id));
    });
  }

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-50 min-h-screen">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Role Directory</h1>
            <p className="text-sm text-gray-500">Manage system roles</p>
          </div>

          <Link
            to="/admin/roles/create"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            <Plus size={16} /> Add Role
          </Link>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Stat label="Total Roles" value={total} icon={<Users />} />
          <Stat label="Active" value={active} icon={<UserCheck />} color="green" />
          <Stat label="Inactive" value={inactive} icon={<UserMinus />} color="red" />
        </div>

        {/* SEARCH */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-xl mb-6 flex items-center">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by role name..."
              className="pl-10 w-full py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-gray-300 text-gray-600 text-xs uppercase font-bold">
              <tr>
                <th className="p-4">Role Name</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {loading && (
                <tr>
                  <td colSpan="3" className="p-6 text-center text-gray-500">
                    Loading roles...
                  </td>
                </tr>
              )}

              {!loading && filtered.map(role => (
                <tr
                  key={role.role_id}
                  className="border border-gray-100 shadow-sm hover:bg-gray-50"
                >
                  <td className="p-4 font-semibold">
                    {role.role_name}
                  </td>

                  <td className="p-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        role.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {role.status}
                    </span>
                  </td>

                  <td className="p-4 flex justify-center gap-3">
                    <Link
                      to={`/admin/roles/${role.role_id}`}
                      className="text-blue-600"
                      title="View"
                    >
                      <Eye size={16} />
                    </Link>

                    <Link
                      to={`/admin/roles/${role.role_id}/edit`}
                      className="text-amber-600"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </Link>

                    <button
                      onClick={() => deleteRole(role.role_id)}
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
                    No roles found
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
