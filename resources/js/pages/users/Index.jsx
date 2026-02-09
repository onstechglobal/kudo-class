import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "@/layouts/AdminLayout";
import Stat from "../../components/common/StatCard";
import CustomButton from "../../components/form/CustomButton";
import CustomSelect from "../../components/form/CustomSelect";
import Input from "../../components/form/Input";
import AvatarLetter from "../../components/common/AvatarLetter";
import DeleteConfirmModal from "../../components/common/DeleteConfirmModal";
import { Api_url } from "@/helpers/api";

import {
  Search,
  Edit2,
  Users,
  UserCheck,
  UserMinus,
  Filter,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function UserListing() {
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [messageClass, setMessageClass] = useState('');
  const [filterOpen, setFilterOpen] = useState('');

  /* ================= STATES ================= */
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState({ from: 0, to: 0 });

  // Stats
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [inactiveUsers, setInactiveUsers] = useState(0);

  // Delete modal
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserID, setSelectedUserID] = useState(null);

  /* ================= FETCH USERS ================= */
  const fetchUsers = (page = 1) => {
    setLoading(true);

    axios.get("/api/users", {
      params: { page }
    }).then(res => {
      const data = res.data.data ?? res.data ?? [];

      setUsers(data);

      setTotalUsers(res.data.total ?? data.length);
      setActiveUsers(
        res.data.active ?? data.filter(u => u.status === "active").length
      );
      setInactiveUsers(
        res.data.inactive ?? data.filter(u => u.status !== "active").length
      );

      setCurrentPage(res.data.current_page ?? 1);
      setLastPage(res.data.last_page ?? 1);
      setPaginationInfo({
        from: res.data.from ?? (data.length ? 1 : 0),
        to: res.data.to ?? data.length,
      });

      setLoading(false);
    });
  };

  /* ================= EFFECTS ================= */
  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);
  /* Add/edit success message */
  useEffect(() => {
      if (location.state?.message) {
          if(location.state.status && location.state.status=='success'){
              setMessageClass('text-green-700 border-green-600 bg-green-50');

          }else if(location.state.status && location.state.status=='failed'){
              setMessageClass('text-red-700 border-red-600 bg-red-50');

          }else{
              setMessageClass('');
          }
      setMessage(location.state.message);

      const timer = setTimeout(() => {
          setMessage('');
          setMessageClass('');
      }, 5000);

      setTimeout(() => {
          navigate(location.pathname, { replace: true });
      }, 0);

      return () => clearTimeout(timer);
      }
  }, []);
  /* ================= SEARCH ================= */
  const applySearch = () => {
    setAppliedSearch(searchInput);
    setCurrentPage(1);
  };

  // Frontend filtering for search
  const filteredUsers = appliedSearch
    ? users.filter(u =>
        u.username?.toLowerCase().includes(appliedSearch.toLowerCase())
      )
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
    setSelectedUserID(user.id);
    setOpen(true);
  };
  
  const statusOptions = [
      { label: "Status (All)", value: "" },
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
  ];

  /* ================= FETCH ROLES ================= */
  const [roleOptions, setRoleOptions] = useState([]);
  
  useEffect(() => {
    axios
      .get('/api/roles')
      .then(res => {
        const response = res.data;

        const list =
          Array.isArray(response)
            ? response
            : Array.isArray(response.data)
              ? response.data
              : [];
        console.log(list)

        const formattedRoles = list
          // ❌ hide admin role
          .filter(r => r.role_name?.toLowerCase() !== "admin")

          // ✅ sort by role_id ASC
          .sort((a, b) => Number(a.role_id) - Number(b.role_id))

          // ✅ format for select + Capitalize
          .map(r => ({
            value: String(r.role_id),
            label: r.role_name
              .toLowerCase()
              .replace(/\b\w/g, char => char.toUpperCase()),
          }));

        setRoleOptions(formattedRoles);
      })
      .catch(() => setRoleOptions([]));
  }, []);
console.log(roleOptions);


  return (
    <AdminLayout>

      {/* OVERLAY */}
      {filterOpen && (
          <div
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setFilterOpen(false)}
          />
      )}

      {/* FILTER DRAWER */}
      <div
          className={`fixed top-0 right-0 h-full w-[360px] bg-white z-50 shadow-xl transform transition-transform duration-300 flex flex-col
          ${filterOpen ? "translate-x-0" : "translate-x-full"}`}
      >
          {/* HEADER */}
          <div className="flex justify-between items-center p-5 border-b border-gray-200">
              <h3 className="font-bold text-lg">Filters</h3>
              <button onClick={() => setFilterOpen(false)} className="cursor-pointer">✕</button>
          </div>

          {/* BODY */}
          <div className="p-5 space-y-5 overflow-y-auto flex-1">
              <CustomSelect label="User Status" options={roleOptions} value={roleFilter} onChange={setRoleFilter} placeholder="All Roles" />
              <CustomSelect label="User Status" options={statusOptions} value={statusFilter} onChange={setStatusFilter} placeholder="Status" />
          </div>

          {/* FOOTER */}
          <div className="p-5 border-t border-gray-200 bg-white flex gap-3">
              <button
                  onClick={() => {
                  }}
                  className="flex-1 bg-gray-100 rounded-lg py-2 text-sm font-medium cursor-pointer"
              >
                  Reset
              </button>

              <button
                  onClick={() => {
                      setCurrentPage(1);
                      // This manually triggers fetchStaff if page was already 1
                      if (currentPage === 1) {
                          //fetchSchools(1);
                      }
                      setFilterOpen(false);
                  }}
                  className="flex-1 rounded-lg py-2 text-sm font-medium transition shadow-sm cursor-pointer bg-[#faae1c] text-white hover:bg-[#faae1c]/85"
              >
                  Apply
              </button>
          </div>
      </div>

      <div className="p-6 bg-gray-50 min-h-screen">

        <DeleteConfirmModal
          isOpen={open}
          schoolName={selectedUser ? selectedUser.name : ""}
          onClose={() => {
            setOpen(false);
            setSelectedUser(null);
          }}
          onDelete={() => {
            handleDelete(selectedUserID);
            setOpen(false);
            setSelectedUser(null);
          }}
        />

        {/* HEADER */}
        <div className="sm:flex justify-between items-center mb-6">
          <div className="mb-4">
            <h1 className="text-2xl font-bold">User Directory</h1>
            <p className="text-sm text-gray-500">Manage all system users</p>
          </div>

          <CustomButton
            text="Add New User"
            to="/admin/users/create"
            className="bg-[#faae1c] text-white hover:bg-[#faae1c]/85"
          />
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Stat label="Total Users" value={totalUsers} icon={<Users />} />
          <Stat label="Active" value={activeUsers} icon={<UserCheck />} color="green" />
          <Stat label="Inactive" value={inactiveUsers} icon={<UserMinus />} color="red" />
        </div>

        {/* SEARCH */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 ">
            <div className="sm:flex gap-3">
                <div className="mb-4 sm:mb-0 flex-1 min-w-[200px] sm:min-w-[300px] w-full">
                    <div className="relative group">
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
                </div>

                <button
                    onClick={() => setFilterOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg"
                >
                    <Filter size={16} /> <span className="font-medium">More Filters</span>
                </button>
            </div>
        </div>

        
        {/* ---- Success Messages ---- */}
          {message && (
              <div className={`flex items-center gap-2 rounded-lg border border-l-[3px] border-r-[3px] ${messageClass} px-4 py-3 text-sm font-medium mb-3`}>
              {message}
              </div>
          )}
        {/* TABLE */}
        <div className="bg-white rounded-xl border border-gray-300 overflow-x-auto">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-gray-300 text-gray-600 text-xs uppercase font-bold">
                <tr>
                  <th className="p-4">Username</th>
                  <th className="p-4">Role Name</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {loading && (
                  <tr>
                    <td colSpan="4" className="p-6 text-center text-gray-500">
                      <div className="inset-0 z-10 flex items-center justify-center rounded-xl">
                          <div className="flex flex-col items-center gap-4">
                              <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
                              <p className="text-xs font-medium text-gray-600 animate-pulse tracking-widest">
                                  Loading Data...
                              </p>
                          </div>
                      </div>
                    </td>
                  </tr>
                )} 

                {!loading && filteredUsers.map(u => (
                  <tr key={u.user_id} className="border border-gray-200 hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <AvatarLetter text={u.username} size={40} />
                        <div className="text-sm font-bold ">{u.username}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{u.role_name ?? "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        u.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}>
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
                          onClick={() => handleOpenModal({ id: u.user_id, name: u.username })}
                          className="text-red-600 cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {!loading && filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                        <p className="text-lg font-semibold">No user found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

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
                  className={`px-3 py-1 border rounded text-sm ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  Prev
                </button>

                <div className="flex items-center px-4 text-sm font-medium text-gray-700">
                  Page {currentPage} of {lastPage}
                </div>

                <button
                  disabled={currentPage === lastPage}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className={`px-3 py-1 border rounded text-sm ${
                    currentPage === lastPage
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </AdminLayout>
  );
}
