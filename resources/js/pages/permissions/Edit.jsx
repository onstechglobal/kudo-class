import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import AdminLayout from "@/layouts/AdminLayout";
import { ArrowLeft, Save, ShieldCheck } from "lucide-react";
import Input from "@/components/form/Input";
import Select from "@/components/form/Select";

export default function EditPermissions() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    const [form, setForm] = useState({
        module: "",
        status: "active"
    });

    useEffect(() => {
        axios.get(`/permissions/${id}`).then(res => {
            setForm({
                module: res.data.module || "",
                status: res.data.status || "active"
            });
            setLoading(false);
        });
    }, [id]);

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    function submit(e) {
        e.preventDefault();
        axios.put(`/permissions/${id}`, form)
            .then(() => navigate("/admin/permissions"));
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
            <div className="bg-[#F8FAFC] min-h-screen">

                {/* ===== SUB HEADER ===== */}
                <div className="bg-white border-b border-gray-200 px-8 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                to="/admin/permissions"
                                className="p-2 hover:bg-gray-100 rounded-full
                                text-gray-400 hover:text-gray-900"
                            >
                                <ArrowLeft size={20} />
                            </Link>

                            <div>
                                <div className="text-xs font-black text-blue-600 uppercase tracking-widest">
                                    Access Control / Permissions / Edit
                                </div>
                                <h1 className="text-2xl font-black text-gray-900">
                                    Edit Permission
                                </h1>
                            </div>
                        </div>

                        <button
                            onClick={submit}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700
                            text-white px-7 py-2.5 rounded-xl font-bold text-sm
                            shadow-lg shadow-blue-100 active:scale-95"
                        >
                            <Save size={18} /> Update Permission
                        </button>
                    </div>
                </div>

                {/* ===== CONTENT ===== */}
                <div className="p-8 max-w-4xl mx-auto">
                    <div className="bg-white rounded-[2.5rem] p-10 border border-gray-200 shadow-sm">

                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-black text-gray-900">
                                Permission Details
                            </h2>

                            <span className="flex items-center gap-2 text-indigo-600
                            text-xs font-black uppercase bg-indigo-50
                            px-3 py-1 rounded-full">
                                <ShieldCheck size={14} /> System Permission
                            </span>
                        </div>

                        <form
                            onSubmit={submit}
                            className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 max-w-2xl"
                        >
                            <Input
                                label="Permission Name"
                                name="module"
                                value={form.module}
                                onChange={handleChange}
                            />

                            <Select
                                label="Status"
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </Select>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
