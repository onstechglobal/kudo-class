// resources/js/pages/fee-structure/EditFee.jsx

import AdminLayout from "../../layouts/AdminLayout";
import PageHeader from "../../components/common/PageHeader";
import Input from "../../components/form/Input";
import CustomSelect from "../../components/form/CustomSelect";
import AppMultiSelect from "../../components/form/AppMultiSelect";
import api from "../../helpers/api";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { School, Save, Loader2, AlertCircle, Check } from "lucide-react";

const EditFee = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const [academicYears, setAcademicYears] = useState([]);
    const [classes, setClasses] = useState([]);

    const [formData, setFormData] = useState({
        fee_name: "",
        fee_type: "academic",
        amount: "",
        frequency: "monthly",
        status: "active",
        academic_year_id: "",
        class_ids: [],
    });

    const feeTypeOptions = [
        { label: "Academic Fee", value: "academic" },
        { label: "Exam Fee", value: "exam" },
        { label: "Sports Fee", value: "sports" },
        { label: "Library Fee", value: "library" },
    ];

    const frequencyOptions = [
        { label: "One Time", value: "one_time" },
        { label: "Monthly", value: "monthly" },
        { label: "Quarterly", value: "quarterly" },
        { label: "Annual", value: "annual" },
    ];

    const statusOptions = [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                setFetchingData(true);

                const academicResponse = await api.get("/api/academic-data");
                if (academicResponse.data?.data) {
                    const activeYears = academicResponse.data.data
                        .filter(year => year.is_active == 1)
                        .map(year => ({
                            label: year.year_name,
                            value: year.academic_year_id.toString()
                        }));
                    setAcademicYears(activeYears);
                }

                const user = JSON.parse(localStorage.getItem("user"));
                 let schoolId = user?.school_id;
                if (!schoolId || schoolId === 0) schoolId = 1;
                const classesResponse = await api.get("/api/get-classes", {
                    params: { school_id: schoolId }
                });
                if (classesResponse.data?.data) {
                    const formattedClasses = classesResponse.data.data.map(cls => ({
                        label: cls.class_name,
                        value: cls.class_id.toString()
                    }));
                    setClasses(formattedClasses);
                }

                const feeResponse = await api.get(`/api/fee-structures/${id}`);

                if (feeResponse.data?.success) {
                    const fee = feeResponse.data.data;

                    setFormData({
                        fee_name: fee.fee_name || "",
                        fee_type: fee.fee_type || "academic",
                        amount: fee.amount?.toString() || "",
                        frequency: fee.frequency || "monthly",
                        status: fee.status || "active",
                        academic_year_id: fee.academic_year_id?.toString() || "",
                        class_ids: Array.isArray(fee.class_ids)
                            ? fee.class_ids.map(cid => cid.toString())
                            : [],
                    });
                }

            } catch (err) {
                setError("Failed to load fee structure");
            } finally {
                setFetchingData(false);
            }
        };

        if (id) fetchData();
    }, [id]);

    const handleChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess(false);

        try {
            if (!formData.fee_name.trim())
                throw new Error("Fee name is required");

            if (!formData.amount || parseFloat(formData.amount) <= 0)
                throw new Error("Valid amount is required");

            if (!formData.academic_year_id)
                throw new Error("Academic year is required");

            if (!formData.class_ids.length)
                throw new Error("Please select at least one class");

            const payload = {
                fee_name: formData.fee_name,
                fee_type: formData.fee_type,
                amount: parseFloat(formData.amount),
                frequency: formData.frequency,
                status: formData.status,
                academic_year_id: formData.academic_year_id,
                class_ids: formData.class_ids.map(id => parseInt(id)),
            };

            const response = await api.put(`/api/fee-structures/${id}`, payload);

            if (response.data.success) {
                setSuccess(true);
                setTimeout(() => navigate("/fee-structure"), 1500);
            } else {
                throw new Error(response.data.message);
            }

        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    if (fetchingData) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-screen">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="bg-[#F8FAFC] min-h-screen p-6">
                <form onSubmit={handleSubmit}>
                    <div className="bg-white border-b border-gray-200 px-8 py-5">
                        <div className="flex justify-between">
                            <PageHeader
                                prevRoute="/fee-structure"
                                breadcrumbParent="Fee Structure"
                                breadcrumbCurrent="Edit"
                                title="Configure Fee Structure"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 bg-[#faae1c] hover:bg-[#faae1c] text-white px-7 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all active:scale-95 disabled:opacity-70 cursor-pointer"
                            >
                                {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                Update
                            </button>
                        </div>
                    </div>

                    <div className="p-8 max-w-[1600px] mx-auto">
                        {error && (
                            <div className="p-4 bg-red-50 text-red-700 rounded-xl mt-4 flex items-center gap-2">
                                <AlertCircle size={18} />
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="p-4 bg-green-50 text-green-700 rounded-xl mt-4 flex items-center gap-2">
                                <Check size={18} />
                                Fee structure updated successfully!
                            </div>
                        )}

                        <div className="grid grid-cols-12">
                            <div className="col-span-12">
                                <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm space-y-12">
                                    <section>
                                        <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                                            <School className="text-blue-600" size={24} />
                                            Academic Fee Details
                                        </h2>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                            <Input
                                                label="Fee Name *"
                                                value={formData.fee_name}
                                                onChange={e => handleChange("fee_name", e.target.value)}
                                            />

                                            <CustomSelect
                                                label="Fee Type *"
                                                options={feeTypeOptions}
                                                value={formData.fee_type}
                                                onChange={value => handleChange("fee_type", value)}
                                                disabled
                                            />

                                            <CustomSelect
                                                label="Frequency *"
                                                options={frequencyOptions}
                                                value={formData.frequency}
                                                onChange={value => handleChange("frequency", value)}
                                            />

                                            <Input
                                                label="Amount (₹) *"
                                                type="number"
                                                value={formData.amount}
                                                onChange={e => handleChange("amount", e.target.value)}
                                            />

                                            <CustomSelect
                                                label="Status *"
                                                options={statusOptions}
                                                value={formData.status}
                                                onChange={value => handleChange("status", value)}
                                            />

                                            <CustomSelect
                                                label="Academic Year *"
                                                options={academicYears}
                                                value={formData.academic_year_id}
                                                onChange={value => handleChange("academic_year_id", value)}
                                                disabled
                                            />

                                            <AppMultiSelect
                                                label="Select Classes"
                                                options={classes}
                                                value={formData.class_ids}
                                                onChange={(val) => handleChange("class_ids", val)}
                                                placeholder="Choose classes"
                                            />

                                        </div>
                                    </section>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
};

export default EditFee;
