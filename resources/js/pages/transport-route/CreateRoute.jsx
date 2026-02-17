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
        route_name: "",
        driver_name: "",
        monthly_fee: "",
        status: "active",
        academic_year: "",
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
                setFormData(p => ({ ...p, academic_year: years[0].value }));
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
            const user = JSON.parse(localStorage.getItem("user"));
            let schoolId = user?.school_id;
            if (!schoolId || schoolId === 0) schoolId = 1;

            await api.post("/api/transport-routes", {
                ...formData,
                school_id: schoolId,
                monthly_fee: parseFloat(formData.monthly_fee),
            });

            setSuccess(true);
            setTimeout(() => navigate("/transport"), 1500);
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
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <PageHeader
                                prevRoute="/transport"
                                breadcrumbParent="Transport"
                                breadcrumbCurrent="Add"
                                title="Add Transport Route"
                            />
                            <div className="flex items-center gap-3">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-2 bg-[#faae1c] hover:bg-[#faae1c] text-white px-7 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all active:scale-95 disabled:opacity-70 cursor-pointer"
                                >
                                    {loading ? (
                                    <Loader2 className="animate-spin" size={18} />
                                    ) : (
                                    <Save size={18} />
                                    )}
                                    Save Route
                                </button>
                            </div>
                        </div>  
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
                            <span className="text-green-700">Transport route created successfully</span>
                        </div>
                    )}

                    <div className="max-w-[1400px] mx-auto mt-6 bg-white rounded-[2.5rem] p-10 border  border-gray-200 shadow-sm">
                        <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                            <Bus className="text-blue-600" /> Transport Route Details
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            <Input
                                label="Route Name *"
                                value={formData.route_name}
                                onChange={e => handleChange("route_name", e.target.value)}
                            />
                            <Input
                                label="Driver Name *"
                                value={formData.driver_name}
                                onChange={e => handleChange("driver_name", e.target.value)}
                            />
                            <Input
                                label="Monthly Amount (₹) *"
                                type="number"
                                value={formData.monthly_fee}
                                onChange={e => handleChange("monthly_fee", e.target.value)}
                            />
                            <CustomSelect
                                label="Status *"
                                options={statusOptions}
                                value={formData.status}
                                onChange={v => handleChange("status", v)}
                            />
                            <CustomSelect
                                label="Academic Year *"
                                options={academicYears}
                                value={formData.academic_year}
                                onChange={v => handleChange("academic_year", v)}
                            />
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
};

export default CreateTransport;
