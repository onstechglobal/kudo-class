import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import AdminLayout from "@/layouts/AdminLayout";
import { ArrowLeft, Save, Shield } from "lucide-react";
import Input from "@/components/form/Input";
import MultiSelect from "@/components/form/MultiSelect";
import CustomButton from "@/components/form/CustomButton";
import CustomSelect from "@/components/form/CustomSelect";

export default function EditRole() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [permissions, setPermissions] = useState([]);
    const [selectedPermissions, setSelectedPermissions] = useState([]);

    const [form, setForm] = useState({
        role_name: "",
        status: "active"
    });

    useEffect(() => {
        Promise.all([
            axios.get("/permissions"),
            axios.get(`/roles/${id}`)
        ]).then(([permRes, roleRes]) => {

            setPermissions(permRes.data);

            setForm({
                role_name: roleRes.data.role.role_name,
                status: roleRes.data.role.status
            });

            setSelectedPermissions(roleRes.data.permissions);

            setLoading(false);
        });
    }, [id]);

    function submit(e) {
        e.preventDefault();

        axios.put(`/roles/${id}`, {
            ...form,
            permissions: selectedPermissions.map(p => p.permission_id)
        }).then(() => {
            navigate("/admin/roles");
        });
    }

    if (loading) {
        return (
            <AdminLayout>
                <div className="p-8">Loading...</div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="bg-[#F8FAFC] min-h-screen p-6">

                {/* ===== SUB HEADER ===== */}
                <div className="bg-white border-b border-gray-200 px-8 py-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                        <div className="flex items-center gap-4">
                        <Link to="/admin/roles">
                            <button
                            type="button"
                            className="p-2 hover:bg-gray-100 rounded-full text-gray-400"
                            >
                            <ArrowLeft size={20} />
                            </button>
                        </Link>

                        <div>
                            <nav className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">
                                <Link to="/admin/roles">Roles</Link> / <Link>Edit</Link>
                            </nav>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                            Edit Role
                            </h1>
                        </div>
                        </div>

                        <CustomButton
                        text="Update Role"
                        Icon={Save}
                        onClick={submit}
                        className="bg-[#faae1c] text-white hover:bg-[#faae1c]/85"
                        />
                    </div>
                </div>

                {/* ===== CONTENT ===== */}
                <div className="py-8 sm:p-8 max-w-6xl mx-auto">
                    <div className="bg-white rounded-[2.5rem] p-10 border border-gray-200 shadow-sm">

                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-black text-gray-900">
                                Role Information
                            </h2>
                            {/*
                            <span className="flex items-center gap-2 text-indigo-600 text-xs font-black uppercase
                            bg-indigo-50 px-3 py-1 rounded-full">
                                <Shield size={14} /> System Role
                            </span>
                            */}
                        </div>

                        <form className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">

                            <Input
                                label="Role Name"
                                value={form.role_name}
                                onChange={e =>
                                    setForm({ ...form, role_name: e.target.value })
                                }
                            />

                            <CustomSelect
                                label="Status"
                                value={form.status}
                                onChange={(val) =>
                                    setForm(prev => ({ ...prev, status: val }))
                                }
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
