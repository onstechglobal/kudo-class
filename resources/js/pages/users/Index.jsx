import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "@/layouts/AdminLayout";
import Stat from "../../components/StatCard";
import CustomButton from "@/components/form/CustomButton";
import AvatarLetter from "@/components/AvatarLetter";
import DeleteConfirmModal from '@/components/common/DeleteConfirmModal';

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
  /* ================= STATES ================= */
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search
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

    axios.get("/users", {
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
    axios.delete(`/users/${id}`).then(() => {
      if (filteredUsers.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        fetchUsers(currentPage);
      }
    });
  };

  const handleOpenModal = (user) => {
    setSelectedUser(user);
    setSelectedUserID(user.id);
    setOpen(true);
  };

  return (
    <AdminLayout>

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

      <div className="p-6 bg-gray-50 min-h-screen">

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
        <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6">
          <div className="flex gap-3 items-center flex-wrap">

            <div className="relative sm:flex-1 min-w-[250px] sm:min-w-[300px] w-full">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && applySearch()}
                placeholder="Search by username..."
                className="
                  w-full pl-12 pr-14 py-3 rounded-lg
                  border border-gray-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                "
              />

              <button
                onClick={applySearch}
                className="
                  absolute right-2 top-1/2 -translate-y-1/2
                  bg-[#faae1c] hover:bg-[#faae1c]/90
                  text-white p-2 rounded-lg transition cursor-pointer
                "
              >
                <Search size={18} strokeWidth={2.5} />
              </button>
            </div>

            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 cursor-pointer">
              <Filter size={16} /> More Filters
            </button>

          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl border border-gray-300 overflow-x-auto">
          <div class="overflow-x-auto">
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
                    <td colSpan="5" className="p-6 text-center text-gray-500">
                      <div className=" inset-0 z-10 flex items-center justify-center rounded-xl">
                          <div className="flex flex-col items-center gap-4">
                              <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
                              <p className="text-xs font-medium text-gray-600 animate-pulse tracking-widest">
                                  Loading Users...
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
                    <td colSpan="5" className="p-6 text-center text-gray-500">
                      No users found
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
