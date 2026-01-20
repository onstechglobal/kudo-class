import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "@/layouts/AdminLayout";
import Stat from "../../components/StatCard";
import CustomButton from "@/components/form/CustomButton";
import CustomSelect from "@/components/form/CustomSelect";
import AvatarLetter from "@/components/AvatarLetter";
import {Search,Plus,Eye,Edit2,Users,UserCheck,UserMinus,Filter,Trash2} from "lucide-react";
import { Link } from "react-router-dom";

export default function UserListing() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/users")
      .then(res => setUsers(res.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    (u.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (u.email?.toLowerCase() || '').includes(search.toLowerCase())
  );
   function deleteUser(id) {
        if (!confirm("Are you sure you want to delete this user?")) return;

        axios.delete(`/users/${id}`).then(() => {
            setUsers(users.filter(u => u.user_id !== id));
        });
    }

  const total = users.length;
  const active = users.filter(u => u.status === "active").length;
  const inactive = total - active;

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-50 min-h-screen">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">User Directory</h1>
            <p className="text-sm text-gray-500">Manage all system users</p>
          </div>

          <div className="flex gap-3">
              <CustomButton
                  text="Add New User"
                  to="/admin/users/create"
                  className="bg-[#faae1c] text-white hover:bg-[#faae1c]/85"
              />
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Stat label="Total Users" value={total} icon={<Users />} />
          <Stat label="Active" value={active} icon={<UserCheck />} color="green" />
          <Stat label="Inactive" value={inactive} icon={<UserMinus />} color="red" />
        </div>

        {/* SEARCH */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 flex flex-wrap gap-4 items-center justify-between">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="pl-10 w-full py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="flex gap-3">
            <CustomSelect
              value=""
              onChange={() => {}}
              placeholder="School (All)"
              options={[
                { value: "", label: "School (All)" },
                { value: "school_a", label: "School A" },
                { value: "school_b", label: "School B" },
              ]}
            />
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
                <Filter size={16} /> More Filters
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl border border-gray-300 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-gray-300 text-gray-600 text-xs uppercase font-bold">
              <tr>
                <th className="p-4">Username</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role Name</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {loading && (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-gray-500">
                    Loading users...
                  </td>
                </tr>
              )}

              {!loading && filtered.map(u => (
                <tr key={u.user_id} className="border border-gray-200 hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {u.logo_url ? (
                        <img
                          src={`https://kudoclass.onstech.in/storage/${u.logo_url.replace(
                            "public/",
                            ""
                          )}`}
                          alt={u.username}
                          className="w-10 h-10 rounded-full border border-gray-200 object-cover shadow-sm"
                        />
                      ) : (
                        <AvatarLetter
                          text={u.username}
                          size={40}
                          className="rounded-full"
                        />
                      )}

                      <div>
                        <div className="text-sm font-bold text-gray-800">
                          {u.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{u.role_name ?? "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <span
                        className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${u.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                            }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center items-center gap-2">
                      <Link
                        to={`/admin/users/${u.user_id}/edit`}
                        className="text-amber-600"
                      >
                        <Edit2 size={16} />
                      </Link>
                      <button
                        onClick={() => deleteUser(u.user_id)}
                        className="text-red-600 cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && !filtered.length && (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-gray-500">
                    No users found
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

