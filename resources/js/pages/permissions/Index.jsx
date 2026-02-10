import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import Stat from "../../components/common/StatCard";
import DeleteConfirmModal from "../../components/common/DeleteConfirmModal";
import CustomButton from "../../components/form/CustomButton";
import AvatarLetter from "../../components/common/AvatarLetter";
import { Search, Plus, Edit2, Trash2, Shield, ShieldCheck, ShieldOff } from "lucide-react";

export default function PermissionListing() {
  /* ================= STATES ================= */
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState({ from: 0, to: 0 });

  // Stats
  const [total, setTotal] = useState(0);
  const [active, setActive] = useState(0);
  const [inactive, setInactive] = useState(0);

  // Delete modal
  const [open, setOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [selectedPermissionID, setSelectedPermissionID] = useState(null);

  /* ================= FETCH PERMISSIONS ================= */
  const fetchPermissions = (page = 1) => {
    setLoading(true);

    axios.get("/api/permissions", {
      params: {
        page,
      },
    })
    .then(res => {
      const data = res.data.data ?? res.data ?? [];

      setPermissions(data);
      setTotal(res.data.total ?? data.length);
      setActive(res.data.active ?? data.filter(p => p.status === "active").length);
      setInactive(res.data.inactive ?? data.filter(p => p.status !== "active").length);

      setCurrentPage(res.data.current_page ?? page);
      setLastPage(res.data.last_page ?? 1);
      setPaginationInfo({
        from: res.data.from ?? (data.length ? 1 : 0),
        to: res.data.to ?? data.length,
      });
    })
    .finally(() => setLoading(false));
  };

  /* ================= EFFECTS ================= */
  useEffect(() => {
    fetchPermissions(currentPage);
  }, [currentPage]);

  // Reset page when search changes
  useEffect(() => {
    if (currentPage !== 1) setCurrentPage(1);
  }, [appliedSearch]);

  /* ================= SEARCH ================= */
  const applySearch = () => setAppliedSearch(searchInput);

  // Frontend filtered list
  const filteredPermissions = appliedSearch
    ? permissions.filter(p =>
        p.module?.toLowerCase().includes(appliedSearch.toLowerCase())
      )
    : permissions;

  /* ================= DELETE ================= */
  const handleDelete = (id) => {
    axios.delete(`/permissions/${id}`).then(() => {
      if (permissions.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        fetchPermissions(currentPage);
      }
    });
  };

  const handleOpenModal = (permission) => {
    setSelectedPermission(permission);
    setSelectedPermissionID(permission.id);
    setOpen(true);
  };

  return (
    <AdminLayout>
      {/* DELETE MODAL */}
      <DeleteConfirmModal
        isOpen={open}
        schoolName={selectedPermission ? selectedPermission.name : ""}
        onClose={() => { setOpen(false); setSelectedPermission(null); }}
        onDelete={() => { handleDelete(selectedPermissionID); setOpen(false); setSelectedPermission(null); }}
      />

      <div className="p-6 bg-gray-50 min-h-screen">

        {/* HEADER */}
        <div className="sm:flex justify-between items-center mb-6">
          <div className="mb-4">
            <h1 className="text-2xl font-bold">Permission Directory</h1>
            <p className="text-sm text-gray-500">Manage system permissions</p>
          </div>

          <CustomButton
            text="Add Permission"
            to="/admin/permissions/create"
            Icon={Plus}
            className="bg-[#faae1c] text-white hover:bg-[#faae1c]/85"
          />
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Stat label="Total Permissions" value={total} icon={<Shield />} />
          <Stat label="Active" value={active} icon={<ShieldCheck />} color="green" />
          <Stat label="Inactive" value={inactive} icon={<ShieldOff />} color="red" />
        </div>

        {/* SEARCH */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && applySearch()}
              placeholder="Search by permission name..."
              className="w-full pl-12 pr-14 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={applySearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#faae1c] hover:bg-[#faae1c]/90 text-white p-2 rounded-lg cursor-pointer"
            >
              <Search size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <div class="overflow-x-auto">
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
                    <td colSpan="5" className="p-6 text-center text-gray-500">
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

                {!loading && filteredPermissions.map(p => (
                  <tr key={p.permission_id} className="hover:bg-gray-50 border-gray-200">
                    <td className="p-4 flex items-center gap-3">
                      {p.logo_url ? (
                        <img
                          src={`https://kudoclass.onstech.in/storage/${p.logo_url.replace("public/", "")}`}
                          className="w-10 h-10 rounded-full border object-cover"
                        />
                      ) : (
                        <AvatarLetter text={p.module} size={40} />
                      )}
                      <span className="text-sm font-bold">{p.module}</span>
                    </td>

                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        p.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {p.status}
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <Link to={`/admin/permissions/${p.permission_id}/edit`} className="text-amber-600">
                          <Edit2 size={16} />
                        </Link>
                        <button
                          onClick={() => handleOpenModal({ id: p.permission_id, name: p.module })}
                          className="text-red-600 cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {!loading && filteredPermissions.length === 0 && (
                  <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                      <p className="text-lg font-semibold">No permission found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {filteredPermissions.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between min-w-[fit-content]">
              <span className="text-sm text-gray-500 w-full sm:w-[fit-content] mb-2">
                Showing {paginationInfo.from} to {paginationInfo.to} of {total} permissions
              </span>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className={`px-3 py-1 border rounded text-sm ${
                    currentPage === 1 ? "bg-gray-100 text-gray-400" : "bg-white hover:bg-gray-50"
                  }`}
                >
                  Prev
                </button>

                <div className="flex items-center px-4 text-sm font-medium text-gray-700">
                  Page {currentPage} of {lastPage}
                </div>

                <button
                  disabled={currentPage === lastPage}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className={`px-3 py-1 border rounded text-sm ${
                    currentPage === lastPage ? "bg-gray-100 text-gray-400" : "bg-white hover:bg-gray-50"
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
