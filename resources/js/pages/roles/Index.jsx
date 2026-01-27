import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "@/layouts/AdminLayout";
import Stat from "@/components/StatCard";
import CustomButton from "@/components/form/CustomButton";
import AvatarLetter from "@/components/AvatarLetter";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import {
  Search,
  Edit2,
  Trash2,
  Users,
  UserCheck,
  UserMinus,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function RoleListing() {
  /* ================= STATES ================= */
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);

  // Search
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState({ from: 0, to: 0 });

  // Stats
  const [total_roles, setTotalRoles] = useState(0);
  const [active_roles, setActiveRoles] = useState(0);
  const [inactive_roles, setInactiveRoles] = useState(0);

  // Delete modal
  const [open, setOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedRoleID, setSelectedRoleID] = useState(null);

  /* ================= FETCH ROLES ================= */
  const fetchRoles = (page = 1) => {
    setLoading(true);

    axios
      .get("/roles", {
        params: { page },
      })
      .then((res) => {
        const response = res.data;
        const roleData = response.data ?? response ?? [];

        setRoles(roleData);
        setTotalRoles(response.total ?? roleData.length);
        setCurrentPage(response.current_page ?? page);
        setLastPage(response.last_page ?? 1);

        setActiveRoles(
          response.active ??
            roleData.filter((r) => r.status === "active").length
        );
        setInactiveRoles(
          response.inactive ??
            roleData.filter((r) => r.status !== "active").length
        );

        setPaginationInfo({
          from: response.from ?? (roleData.length ? 1 : 0),
          to: response.to ?? roleData.length,
        });
      })
      .finally(() => setLoading(false));
  };

  /* ================= EFFECTS ================= */
  useEffect(() => {
    fetchRoles(currentPage);
  }, [currentPage]);

  /* ================= SEARCH ================= */
  const applySearch = () => {
    setCurrentPage(1);
    setAppliedSearch(searchInput);
  };

  /* ================= FRONTEND SEARCH FILTER ================= */
  const filteredRoles = appliedSearch
    ? roles.filter((r) =>
        r.role_name
          ?.toLowerCase()
          .includes(appliedSearch.toLowerCase())
      )
    : roles;

  /* ================= DELETE ================= */
  const handleDelete = (id) => {
    axios.delete(`/roles/${id}`).then(() => {
      if (filteredRoles.length === 1 && currentPage > 1) {
        setCurrentPage((p) => p - 1);
      } else {
        fetchRoles(currentPage);
      }
    });
  };

  const handleOpenModal = (role) => {
    setSelectedRole(role);
    setSelectedRoleID(role.id);
    setOpen(true);
  };

  return (
    <AdminLayout>
      {/* DELETE MODAL */}
      <DeleteConfirmModal
        isOpen={open}
        schoolName={selectedRole ? selectedRole.name : ""}
        onClose={() => {
          setOpen(false);
          setSelectedRole(null);
        }}
        onDelete={() => {
          handleDelete(selectedRoleID);
          setOpen(false);
          setSelectedRole(null);
        }}
      />

      <div className="p-6 bg-gray-50 min-h-screen">
        {/* HEADER */}
        <div className="sm:flex justify-between items-center mb-6">
          <div className="mb-4">
            <h1 className="text-2xl font-bold">Role Directory</h1>
            <p className="text-sm text-gray-500">Manage system roles</p>
          </div>

          <CustomButton
            text="Add New Role"
            to="/admin/roles/create"
            className="bg-[#faae1c] text-white hover:bg-[#faae1c]/85"
          />
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Stat label="Total Roles" value={total_roles} icon={<Users />} />
          <Stat label="Active" value={active_roles} icon={<UserCheck />} color="green" />
          <Stat label="Inactive" value={inactive_roles} icon={<UserMinus />} color="red" />
        </div>

        {/* SEARCH */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />

            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applySearch()}
              placeholder="Search by role name"
              className="w-full pl-12 pr-14 py-3 rounded-lg border border-gray-200
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={applySearch}
              className="absolute right-2 top-1/2 -translate-y-1/2
                         bg-[#faae1c] hover:bg-[#faae1c]/90
                         text-white p-2 rounded-lg transition cursor-pointer"
            >
              <Search size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto shadow-sm">
          <div class="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold">
                <tr>
                  <th className="p-4">Role Name</th>
                  <th className="p-4">Permissions</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading && (
                  <tr>
                    <td colSpan="5" className="p-6 text-center text-gray-500">
                      <div className=" inset-0 z-10 flex items-center justify-center rounded-xl">
                          <div className="flex flex-col items-center gap-4">
                              <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
                              <p className="text-xs font-medium text-gray-600 animate-pulse tracking-widest">
                                  Loading Roles...
                              </p>
                          </div>
                        </div>
                    </td>
                  </tr>
                )}

                {!loading &&
                  filteredRoles.map((role) => (
                    <tr key={role.role_id} className="hover:bg-gray-50">
                      <td className="p-4 text-sm font-bold flex items-center gap-3">
                        <AvatarLetter text={role.role_name} size={40} />
                        {role.role_name}
                      </td>

                      <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {role.permissions && role.permissions.length > 0 ? (
                              role.permissions.map((perm, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 text-[10px] font-semibold rounded-full
                                            bg-blue-100 text-blue-700"
                                >
                                  {perm.module}
                                  {perm.action ? `:${perm.action}` : ""}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-gray-400 italic">
                                No permissions
                              </span>
                            )}
                          </div>
                        </td>

                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          role.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                          {role.status}
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-3">
                          <Link to={`/admin/roles/${role.role_id}/edit`} className="text-amber-600">
                            <Edit2 size={16} />
                          </Link>
                          <button
                            onClick={() =>
                              handleOpenModal({ id: role.role_id, name: role.role_name })
                            }
                            className="text-red-600 cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                {!loading && filteredRoles.length === 0 && (
                  <tr>
                    <td colSpan="3" className="p-6 text-center text-gray-500">
                      No roles found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {filteredRoles.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between min-w-[fit-content]">
              <span className="text-sm text-gray-500 w-full sm:w-[fit-content] mb-2">
                Showing {paginationInfo.from} to {paginationInfo.to} of {total_roles} roles
              </span>

              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
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
                  onClick={() => setCurrentPage((p) => p + 1)}
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
