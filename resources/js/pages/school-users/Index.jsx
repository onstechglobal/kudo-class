import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import AdminLayout from "@/layouts/AdminLayout";
import AvatarLetter from "../../components/common/AvatarLetter";
import DeleteConfirmModal from "../../components/common/DeleteConfirmModal";
import CustomButton from "../../components/form/CustomButton";
import CustomSelect from "../../components/form/CustomSelect";
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
      {/* OVERLAY */}
      {filterOpen && <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setFilterOpen(false)} />}

      {/* FILTER DRAWER */}
      <div className={`fixed top-0 right-0 h-full w-[360px] bg-white z-50 shadow-xl transform transition-transform duration-300 flex flex-col
          ${filterOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <h3 className="font-bold text-lg">Filters</h3>
          <button onClick={() => setFilterOpen(false)}>✕</button>
        </div>
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          <CustomSelect label="Status" options={statusOptions} value={statusFilter} onChange={setStatusFilter} placeholder="All Status" />
        </div>
        <div className="p-5 border-t border-gray-200 bg-white flex gap-3">
          <button
            onClick={() => setStatusFilter('')}
            className="flex-1 bg-gray-100 rounded-lg py-2 text-sm font-medium cursor-pointer"
          >
            Reset
          </button>
          <button
            onClick={() => { setCurrentPage(1); if(currentPage===1) fetchUsers(1); setFilterOpen(false); }}
            className="flex-1 rounded-lg py-2 text-sm font-medium transition shadow-sm cursor-pointer bg-[#faae1c] text-white hover:bg-[#faae1c]/85"
          >
            Apply
          </button>
        </div>
      </div>

      <div className="p-6 bg-gray-50 min-h-screen">

        <DeleteConfirmModal
          isOpen={open}
          schoolName={selectedUser ? selectedUser.username : ""}
          onClose={() => { setOpen(false); setSelectedUser(null); }}
          onDelete={() => { handleDelete(selectedUserID); setOpen(false); setSelectedUser(null); }}
        />

        {/* HEADER */}
        <div className="sm:flex justify-between items-center mb-6">
          <div className="mb-4">
            <h1 className="text-2xl font-bold">School Users</h1>
            <p className="text-sm text-gray-500">Manage all users in your school</p>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow flex items-center gap-2"><Users /> <span>Total: {totalUsers}</span></div>
          <div className="bg-white p-4 rounded-xl shadow flex items-center gap-2 text-green-600"><UserCheck /> <span>Active: {activeUsers}</span></div>
          <div className="bg-white p-4 rounded-xl shadow flex items-center gap-2 text-red-600"><UserMinus /> <span>Inactive: {inactiveUsers}</span></div>
        </div>

        {/* SEARCH */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6">
          <div className="sm:flex gap-3">
            <div className="mb-4 sm:mb-0 flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && applySearch()}
                placeholder="Search by username..."
                className="w-full pl-10 pr-12 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <button
                onClick={applySearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#faae1c] hover:bg-[#faae1c]/90 text-white p-2 rounded-lg cursor-pointer"
              >
                <Search size={18} strokeWidth={2.5} />
              </button>
            </div>

            <button
              onClick={() => setFilterOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg"
            >
              <Filter size={16} /> <span className="font-medium">Filters</span>
            </button>
          </div>
        </div>

        {/* MESSAGE */}
        {message && (
          <div className={`flex items-center gap-2 rounded-lg border border-l-[3px] border-r-[3px] ${messageClass} px-4 py-3 text-sm font-medium mb-3`}>
            {message}
          </div>
        )}

        {/* USER TABLE */}
        <div className="bg-white rounded-xl border border-gray-300 overflow-x-auto">
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
                <tr><td colSpan="5" className="p-6 text-center text-gray-500">Loading...</td></tr>
              )}
              {!loading && filteredUsers.map(u => (
                <tr key={u.user_id} className="border border-gray-200 hover:bg-gray-50">
                  <td className="p-4 flex items-center gap-3"><AvatarLetter text={u.username} size={40} />{u.username}</td>
                  <td className="p-4">{u.email}</td>
                  <td className="p-4">{u.role_name}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex justify-center items-center gap-2">
                    <Link to={`/school-users/${u.user_id}/edit`} className="text-amber-600"><Edit2 size={16} /></Link>
                    <button onClick={() => handleOpenModal({ user_id: u.user_id, username: u.username })} className="text-red-600 cursor-pointer"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {!loading && filteredUsers.length === 0 && (
                <tr><td colSpan="5" className="p-6 text-center text-gray-500">No users found</td></tr>
              )}
            </tbody>
          </table>

          {/* PAGINATION */}
          {filteredUsers.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between min-w-[fit-content]">
              <span className="text-sm text-gray-500 w-full sm:w-[fit-content] mb-2">
                Showing {paginationInfo.from} to {paginationInfo.to} of {totalUsers}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className={`px-3 py-1 border rounded text-sm ${currentPage === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white hover:bg-gray-50"}`}
                >Prev</button>
                <div className="flex items-center px-4 text-sm font-medium text-gray-700">Page {currentPage} of {lastPage}</div>
                <button
                  disabled={currentPage === lastPage}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className={`px-3 py-1 border rounded text-sm ${currentPage === lastPage ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white hover:bg-gray-50"}`}
                >Next</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </AdminLayout>
  );
}
