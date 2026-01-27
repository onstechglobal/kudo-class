import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AdminLayout from "@/layouts/AdminLayout";
import { ArrowLeft, Save, ShieldPlus } from "lucide-react";
import Input from "@/components/form/Input";
import CustomButton from "@/components/form/CustomButton";
import CustomSelect from "@/components/form/CustomSelect";

export default function CreatePermissions() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        module: "",
        status: "active"
    });

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    function submit(e) {
        e.preventDefault();
        axios.post("/permissions", form)
            .then(() => navigate("/admin/permissions"))
            .catch(err => {
                if (err.response?.status === 422) {
                    alert(Object.values(err.response.data.errors)[0][0]);
                }
            });
    }

    return (
        <AdminLayout>
            <div className="bg-[#F8FAFC] min-h-screen p-6">

                {/* ===== SUB HEADER ===== */}
                <div className="bg-white border-b border-gray-200 px-8 py-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                        <div className="flex items-center gap-4">
                        <Link to="/admin/permissions">
                            <button
                            type="button"
                            className="p-2 hover:bg-gray-100 rounded-full text-gray-400"
                            >
                            <ArrowLeft size={20} />
                            </button>
                        </Link>

                        <div>
                            <nav className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">
                            <Link to="/admin/permissions">Permissions</Link> / <Link>Add</Link>
                            </nav>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                            Add Permissions
                            </h1>
                        </div>
                        </div>

                        <CustomButton
                        text="Save Permission"
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
                                Permission Details
                            </h2>

                            {/*
                            <span
                                className="flex items-center gap-2 text-indigo-600
                                text-xs font-black uppercase bg-indigo-50
                                px-3 py-1 rounded-full"
                            >
                                <ShieldPlus size={14} /> New Permission
                            </span>
                            */}
                        </div>

                        <form
                            onSubmit={submit}
                            className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 "
                        >
                            <Input
                                label="Permission Name"
                                name="module"
                                value={form.module}
                                onChange={handleChange}
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
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
