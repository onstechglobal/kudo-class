import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import AdminLayout from "@/layouts/AdminLayout";
import AvatarLetter from "../../components/common/AvatarLetter";
import DeleteConfirmModal from "../../components/common/DeleteConfirmModal";
import Stat from "../../components/common/StatCard"
import { Users, UserCheck, UserMinus, Search, Filter, Trash2, Edit2 } from "lucide-react";

export default function SchoolUserListing() {
  const location = useLocation();
  const navigate = useNavigate();

  /* ================= STATES ================= */
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState({ from: 0, to: 0 });

  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [inactiveUsers, setInactiveUsers] = useState(0);

  const [message, setMessage] = useState('');
  const [messageClass, setMessageClass] = useState('');

  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserID, setSelectedUserID] = useState(null);

  const statusOptions = [
    { label: "Status (All)", value: "" },
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
  ];

  const user = JSON.parse(localStorage.getItem("user"));
  let schoolId = user?.school_id || 1;

  /* ================= FETCH USERS ================= */
  const fetchUsers = (page = 1) => {
    setLoading(true);
    axios.get("/api/school/users", {
      params: {
        page,
        schoolId,
        search: appliedSearch,
        status: statusFilter,
      }
    }).then(res => {
      const data = res.data.data ?? res.data ?? [];
      setUsers(data);
      setTotalUsers(res.data.total ?? data.length);
      setActiveUsers(res.data.active ?? data.filter(u => u.status === "active").length);
      setInactiveUsers(res.data.inactive ?? data.filter(u => u.status !== "active").length);
      setCurrentPage(res.data.current_page ?? 1);
      setLastPage(res.data.last_page ?? 1);
      setPaginationInfo({
        from: res.data.from ?? (data.length ? 1 : 0),
        to: res.data.to ?? data.length,
      });
      setLoading(false);
    });
  };

  useEffect(() => { fetchUsers(currentPage); }, [currentPage]);

  /* ================= SEARCH ================= */
  const applySearch = () => {
    setAppliedSearch(searchInput);
    setCurrentPage(1);
  };

  const filteredUsers = appliedSearch
    ? users.filter(u => u.username?.toLowerCase().includes(appliedSearch.toLowerCase()))
    : users;

  /* ================= DELETE ================= */
  const handleDelete = (id) => {
    axios.delete(`/api/users/${id}`).then(() => {
      if (filteredUsers.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
        setMessage('Deleted Successfully');
        setMessageClass('text-red-700 border-red-600 bg-red-50');
      } else {
        fetchUsers(currentPage);
        setMessage('Deleted Successfully');
        setMessageClass('text-red-700 border-red-600 bg-red-50');
      }
    });
  };

  const handleOpenModal = (user) => {
    setSelectedUser(user);
    setSelectedUserID(user.user_id);
    setOpen(true);
  };

  /* ================= MESSAGE EFFECT ================= */
  useEffect(() => {
    if (location.state?.message) {
      if(location.state.status === 'success') setMessageClass('text-green-700 border-green-600 bg-green-50');
      else if(location.state.status === 'failed') setMessageClass('text-red-700 border-red-600 bg-red-50');
      setMessage(location.state.message);

      const timer = setTimeout(() => { setMessage(''); setMessageClass(''); }, 5000);
      setTimeout(() => navigate(location.pathname, { replace: true }), 0);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
  <AdminLayout>
    <div className="relative p-6 bg-gray-50 min-h-screen font-sans">

      <DeleteConfirmModal
        isOpen={open}
        schoolName={selectedUser ? selectedUser.username : ""}
        onClose={() => { setOpen(false); setSelectedUser(null); }}
        onDelete={() => { handleDelete(selectedUserID); setOpen(false); setSelectedUser(null); }}
      />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            School Users
          </h1>
          <p className="text-sm text-gray-500">
            Manage all users in your school
          </p>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Stat label="Total Users" value={totalUsers.toString()} icon={<Users />} />
        <Stat label="Active Users" value={activeUsers.toString()} icon={<UserCheck />} color="green" />
        <Stat label="Inactive Users" value={inactiveUsers.toString()} icon={<UserMinus />} color="red" />
      </div>

      {/* SEARCH */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && applySearch()}
            placeholder="Search by username..."
            className="w-full pl-10 pr-12 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={applySearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#faae1c] hover:bg-[#faae1c]/90 text-white p-2 rounded-lg"
          >
            <Search size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* MESSAGE */}
      {message && (
        <div className={`flex items-center gap-2 rounded-lg border border-l-[3px] border-r-[3px] ${messageClass} px-4 py-3 text-sm font-medium mb-4`}>
          {message}
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase font-bold">
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
                      <p className="text-xs font-medium text-gray-600 animate-pulse tracking-widest">
                        Loading Data...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map(u => (
                  <tr key={u.user_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 flex items-center gap-3 text-sm font-medium text-gray-800">
                      <AvatarLetter text={u.username} size={36} />
                      {u.username}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {u.email}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {u.role_name}
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        u.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {u.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-center items-center gap-2">
                        <Link
                          to={`/school-users/${u.user_id}/edit`}
                          className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
                        >
                          <Edit2 size={16} />
                        </Link>

                        <button
                          onClick={() => handleOpenModal({ user_id: u.user_id, username: u.username })}
                          className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    <p className="text-lg font-semibold">No users found</p>
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

}
