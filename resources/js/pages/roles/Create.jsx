import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AdminLayout from "@/layouts/AdminLayout";
import { ArrowLeft, Save, Shield } from "lucide-react";
import Input from "@/components/form/Input";
import CustomSelect from "@/components/form/CustomSelect";
import MultiSelect from "@/components/form/MultiSelect";
import CustomButton from "@/components/form/CustomButton";
import PageHeader from "../../components/common/PageHeader";

/* ================= COMPONENT ================= */
export default function CreateRole() {
  const navigate = useNavigate();

  /* ================= STATE ================= */
  const [form, setForm] = useState({
    role_name: "",
    status: "active",
  });

  const [permissions, setPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [errors, setErrors] = useState({});

  /* ================= FETCH PERMISSIONS ================= */
  useEffect(() => {
    axios.get("/api/permissions").then(res => {
      setPermissions(res.data || []);
    });
  }, []);

  /* ================= HANDLERS ================= */
  function updateField(name, value) {
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  }

  async function submit(e) {
    e.preventDefault();
    setErrors({});

    try {
      await axios.post("/api/roles", {
        ...form,
        permissions: selectedPermissions.map(p => p.permission_id),
      });

      navigate("/admin/roles");
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {});
      }
    }
  }

  /* ================= UI ================= */
  return (
    <AdminLayout>
      <div className="bg-[#F8FAFC] min-h-screen p-6">

        {/* ================= HEADER ================= */}
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

            <PageHeader
              prevRoute="/admin/roles"
              breadcrumbParent="Roles"
              breadcrumbCurrent="Add"
              title="Add Role"
            />

            <CustomButton
              text="Save Role"
              Icon={Save}
              onClick={submit}
              className="bg-[#faae1c] text-white hover:bg-[#faae1c]/85"
            />
          </div>
        </div>

        {/* ================= CONTENT ================= */}
        <div className="py-8 sm:p-8 max-w-6xl mx-auto">

          <div className="bg-white rounded-[2.5rem] p-10 border border-gray-200">

            {/* TITLE BAR */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-black text-gray-900">
                Role Details
              </h2>

            {/*
              <span
                className="
                  flex items-center gap-2 text-indigo-600
                  text-xs font-black uppercase
                  bg-indigo-50 px-3 py-1 rounded-full
                "
              >
                <Shield size={14} />
                New Role
              </span>
            */}
            </div>

            {/* FORM */}
            <form
              onSubmit={submit}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {/* ROLE NAME */}
              <Input
                label="Role Name"
                value={form.role_name}
                onChange={e => updateField("role_name", e.target.value)}
                error={errors.role_name}
              />

              {/* STATUS */}
              <CustomSelect
                label="Status"
                value={form.status}
                onChange={val => updateField("status", val)}
                options={[
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]}
              />

            <MultiSelect
                label="Permissions"
                options={permissions}
                value={selectedPermissions}
                onChange={setSelectedPermissions}
            />
              
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
