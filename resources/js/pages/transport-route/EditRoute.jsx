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
        Promise.all([
            api.get(`/api/fee-structures/${id}`),
            api.get("/api/academic-data"),
        ]).then(([routeRes, yearRes]) => {
            setFormData({
                ...routeRes.data.data,
                academic_year_id: routeRes.data.data.academic_year_id.toString(),
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
        await api.put(`/api/fee-structures/${id}`, {
            ...formData,
            amount: parseFloat(formData.amount),
        });
        setSuccess(true);
        setTimeout(() => navigate("/transport-routes"), 1500);
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
                    <PageHeader
                        prevRoute="/transport-routes"
                        breadcrumbParent="Transport Routes"
                        breadcrumbCurrent="Edit"
                        title="Edit Transport Route"
                    />

                    {success && (
                        <div className="mx-6 mt-6 p-4 bg-green-50 border rounded-xl flex gap-2">
                            <Check className="text-green-500" />
                            Route updated successfully
                        </div>
                    )}

                    <div className="max-w-[1400px] mx-auto mt-6 bg-white rounded-[2.5rem] p-10 border shadow-sm">
                        <h2 className="text-xl font-black mb-6 flex gap-2">
                            <Bus className="text-blue-600" /> Transport Route Details
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            <Input label="Route Name" value={formData.fee_name} onChange={e => handleChange("fee_name", e.target.value)} />
                            <Input label="Driver Name" value={formData.driver_name} onChange={e => handleChange("driver_name", e.target.value)} />
                            <Input label="Monthly Amount" type="number" value={formData.amount} onChange={e => handleChange("amount", e.target.value)} />
                            <CustomSelect label="Status" options={statusOptions} value={formData.status} onChange={v => handleChange("status", v)} />
                            <div className="md:col-span-2">
                                <CustomSelect
                                    label="Academic Year"
                                    options={academicYears}
                                    value={formData.academic_year_id}
                                    disabled
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
                                Update Route
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
};

export default EditTransport;
