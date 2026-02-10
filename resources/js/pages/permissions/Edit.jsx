import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import AdminLayout from "@/layouts/AdminLayout";
import { ArrowLeft, Save, ShieldCheck } from "lucide-react";
import Input from "@/components/form/Input";
import CustomButton from "@/components/form/CustomButton";
import CustomSelect from "@/components/form/CustomSelect";
import StaticButtons from "../../components/common/StaticButtons";
import PageHeader from "../../components/common/PageHeader";


export default function EditPermissions() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({});

    const [form, setForm] = useState({
        module: "",
        status: "active"
    });

    useEffect(() => {
        axios.get(`/api/permissions/${id}`).then(res => {
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

    const validateForm = () => {
        let newErrors = {};
        if (!form.module.trim()) newErrors.module = "Permission name is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    function submit(e) {
        e.preventDefault();
        if (!validateForm()) return;
        axios.put(`/api/permissions/${id}`, form)
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
            <div className="bg-[#F8FAFC] min-h-screen p-6">

                {/* ===== SUB HEADER ===== */}
                <div className="bg-white border-b border-gray-200 px-8 py-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                        <PageHeader
                            prevRoute="/admin/permissions"
                            breadcrumbParent="Permissions"
                            breadcrumbCurrent="Edit"
                            title="Edit Permissions"
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
                        </div>

                        <form
                            onSubmit={submit}
                            className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8"
                        >
                            <Input
                                label="Permission Name"
                                name="module"
                                value={form.module}
                                onChange={handleChange}
                                error={errors.module}
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
                <StaticButtons saveText="Update Permission" saveClick={submit} />
            </div>
        </AdminLayout>
    );
}
