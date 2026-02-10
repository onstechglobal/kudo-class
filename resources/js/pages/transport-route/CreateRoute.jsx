// resources/js/pages/transport-route/CreateTransport.jsx
import AdminLayout from "../../layouts/AdminLayout";
import PageHeader from "../../components/common/PageHeader";
import Input from "../../components/form/Input";
import CustomSelect from "../../components/form/CustomSelect";
import api from "../../helpers/api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bus, Save, Loader2, AlertCircle, Check } from "lucide-react";

const CreateTransport = () => {
    const navigate = useNavigate();
    const [academicYears, setAcademicYears] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        fee_name: "",
        driver_name: "",
        amount: "",
        status: "active",
        academic_year_id: "",
        fee_type: "transport",
    });

    const statusOptions = [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
    ];

    useEffect(() => {
        api.get("/api/academic-data").then(res => {
            const years = res.data.data
                .filter(y => y.is_active == 1)
                .map(y => ({
                    label: y.year_name,
                    value: y.academic_year_id.toString(),
                }));
            setAcademicYears(years);
            if (years.length) {
                setFormData(p => ({ ...p, academic_year_id: years[0].value }));
            }
        }).finally(() => setFetching(false));
    }, []);

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await api.post("/api/fee-structures", {
                ...formData,
                amount: parseFloat(formData.amount),
            });

            setSuccess(true);
            setTimeout(() => navigate("/transport-routes"), 1500);
        } catch (err) {
            setError("Failed to create transport route");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-screen">
                    <Loader2 className="animate-spin text-blue-600" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="bg-[#F8FAFC] min-h-screen p-6">
                <form onSubmit={handleSubmit}>
                    <div className="bg-white border-b border-gray-200 px-8 py-5">
                        <PageHeader
                            prevRoute="/transport-routes"
                            breadcrumbParent="Transport Routes"
                            breadcrumbCurrent="Add"
                            title="Add Transport Route"
                        />
                    </div>

                    {error && (
                        <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex gap-2">
                            <AlertCircle className="text-red-500" />
                            <span className="text-red-700">{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="mx-6 mt-6 p-4 bg-green-50 border border-green-200 rounded-xl flex gap-2">
                            <Check className="text-green-500" />
                            <span className="text-green-700">Route created successfully</span>
                        </div>
                    )}

                    <div className="max-w-[1400px] mx-auto mt-6 bg-white rounded-[2.5rem] p-10 border  border-gray-200 shadow-sm">
                        <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                            <Bus className="text-blue-600" /> Transport Route Details
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            <Input
                                label="Route Name *"
                                value={formData.fee_name}
                                onChange={e => handleChange("fee_name", e.target.value)}
                            />
                            <Input
                                label="Driver Name *"
                                value={formData.driver_name}
                                onChange={e => handleChange("driver_name", e.target.value)}
                            />
                            <Input
                                label="Monthly Amount (₹) *"
                                type="number"
                                value={formData.amount}
                                onChange={e => handleChange("amount", e.target.value)}
                            />
                            <CustomSelect
                                label="Status *"
                                options={statusOptions}
                                value={formData.status}
                                onChange={v => handleChange("status", v)}
                            />
                            <div className="md:col-span-2">
                                <CustomSelect
                                    label="Academic Year *"
                                    options={academicYears}
                                    value={formData.academic_year_id}
                                    onChange={v => handleChange("academic_year_id", v)}
                                />
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-[#faae1c] text-white px-8 py-3 rounded-xl font-bold flex gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <Save />}
                                Save Route
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
};

export default CreateTransport;
