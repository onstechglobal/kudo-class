// resources/js/pages/transport-route/EditTransport.jsx
import AdminLayout from "../../layouts/AdminLayout";
import PageHeader from "../../components/common/PageHeader";
import Input from "../../components/form/Input";
import CustomSelect from "../../components/form/CustomSelect";
import api from "../../helpers/api";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Bus, Save, Loader2, Check } from "lucide-react";

const EditTransport = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [success, setSuccess] = useState(false);
    const [academicYears, setAcademicYears] = useState([]);

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
        Promise.all([
            api.get(`/api/transport-routes/${id}`),
            api.get("/api/academic-data"),
        ]).then(([routeRes, yearRes]) => {
            setFormData({
                route_name: routeRes.data.data.route_name,
                driver_name: routeRes.data.data.driver_name,
                monthly_fee: routeRes.data.data.monthly_fee,
                status: routeRes.data.data.status,
                academic_year: routeRes.data.data.academic_year,
            });

            setAcademicYears(
                yearRes.data.data
                    .filter(y => y.is_active == 1)
                    .map(y => ({
                        label: y.year_name,
                        value: y.academic_year_id.toString(),
                    }))
            );
        }).finally(() => setFetching(false));
    }, [id]);

    const handleChange = (n, v) => setFormData(p => ({ ...p, [n]: v }));

    const submit = async e => {
        e.preventDefault();
        setLoading(true);
        await api.put(`/api/transport-routes/${id}`, {
            ...formData,
            monthly_fee: parseFloat(formData.monthly_fee),
        });
        setSuccess(true);
        setTimeout(() => navigate("/transport"), 1500);
        setLoading(false);
    };

    if (fetching) {
        return (
            <AdminLayout>
                <div className="flex justify-center h-screen items-center">
                    <Loader2 className="animate-spin text-blue-600" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="bg-[#F8FAFC] min-h-screen p-6">
                <form onSubmit={submit}>
                    <div className="bg-white border-b border-gray-200 px-8 py-5">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <PageHeader
                                prevRoute="/transport"
                                breadcrumbParent="Transport"
                                breadcrumbCurrent="Edit"
                                title="Edit Transport Route"
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
                                    Update Route
                                </button>
                            </div>
                        </div>
                    </div>

                    {success && (
                        <div className="mx-6 mt-6 p-4 bg-green-50 border border-gray-200 rounded-xl flex gap-2">
                            <Check className="text-green-500" />
                            Route updated successfully
                        </div>
                    )}

                    <div className="max-w-[1400px] mx-auto mt-6 bg-white rounded-[2.5rem] p-10 border border-gray-200 shadow-sm">
                        <h2 className="text-xl font-black mb-6 flex gap-2">
                            <Bus className="text-blue-600" /> Transport Route Details
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            <Input
                                label="Route Name"
                                value={formData.route_name}
                                onChange={e => handleChange("route_name", e.target.value)}
                            />
                            <Input
                                label="Driver Name"
                                value={formData.driver_name}
                                onChange={e => handleChange("driver_name", e.target.value)}
                            />
                            <Input
                                label="Monthly Amount"
                                type="number"
                                value={formData.monthly_fee}
                                onChange={e => handleChange("monthly_fee", e.target.value)}
                            />
                            <CustomSelect
                                label="Status"
                                options={statusOptions}
                                value={formData.status}
                                onChange={v => handleChange("status", v)}
                            />
                            <div className="md:col-span-2">
                                <CustomSelect
                                    label="Academic Year"
                                    options={academicYears}
                                    value={formData.academic_year}
                                    disabled
                                />
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
};

export default EditTransport;
