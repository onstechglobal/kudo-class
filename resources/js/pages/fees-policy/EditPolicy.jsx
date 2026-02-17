import AdminLayout from "../../layouts/AdminLayout";
import PageHeader from "../../components/common/PageHeader";
import Input from "../../components/form/Input";
import CustomSelect from "../../components/form/CustomSelect";
import api from "../../helpers/api";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Settings, Save, Loader2, AlertCircle } from "lucide-react";

const EditFeePolicy = () => {

    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        policy_name: "",
        reminder_enabled: 1,
        reminder_frequency_days: "",
        block_after_months: "",
        status: "active",
    });

    const yesNoOptions = [
        { label: "Yes", value: 1 },
        { label: "No", value: 0 },
    ];

    const statusOptions = [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
    ];

    /* ---------------- FETCH POLICY ---------------- */

    useEffect(() => {
        const fetchPolicy = async () => {
            try {
                const res = await api.get(`/api/fees-policy/${id}`);

                if (res.data.success) {
                    const data = res.data.data;

                    setFormData({
                        policy_name: data.policy_name || "",
                        reminder_enabled: Number(data.reminder_enabled ?? 1),
                        reminder_frequency_days: data.reminder_frequency_days || "",
                        block_after_months: data.block_after_months || "",
                        status: data.status || "active",
                    });
                }

            } catch (err) {
                setError("Failed to load policy");
            } finally {
                setFetching(false);
            }
        };

        fetchPolicy();
    }, [id]);

    const handleChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    /* ---------------- UPDATE ---------------- */

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {

            const user = JSON.parse(localStorage.getItem("user"));
            let schoolId = user?.school_id;
            if (!schoolId || schoolId === 0) schoolId = 1;

            const payload = {
                ...formData,
                school_id: schoolId,
                reminder_enabled: Number(formData.reminder_enabled),
                reminder_frequency_days: parseInt(formData.reminder_frequency_days || 0),
                block_after_months: parseInt(formData.block_after_months || 0),
            };

            const response = await api.put(`/api/fees-policy/${id}`, payload);

            if (response.data.success) {
                navigate("/fee-policies", {
                    state: {
                        message: "Fee policy updated successfully!",
                        status: "success"
                    }
                });
            } else {
                throw new Error(response.data.message);
            }

        } catch (err) {
            setError(err.response?.data?.message || "Update failed");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <AdminLayout>
                <div className="flex justify-center items-center h-screen">
                    <Loader2 className="animate-spin text-blue-500" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="bg-[#F8FAFC] min-h-screen p-6">
                <form onSubmit={handleSubmit}>

                    {/* Header */}
                    <div className="bg-white border-b border-gray-200 px-8 py-5 flex justify-between">
                        <PageHeader
                            prevRoute="/fee-policies"
                            breadcrumbParent="Fee Policies"
                            breadcrumbCurrent="Edit"
                            title="Edit Fee Policy"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 bg-[#faae1c] text-white px-7 py-2.5 rounded-xl"
                        >
                            {loading
                                ? <Loader2 className="animate-spin" size={18} />
                                : <Save size={18} />}
                            Update
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-8 max-w-[1200px] mx-auto">

                        {error && (
                            <div className="p-4 bg-red-50 text-red-700 rounded-xl mt-4 flex gap-2">
                                <AlertCircle size={18} />
                                {error}
                            </div>
                        )}

                        <div className="bg-white rounded-[2.5rem] p-10 border border-gray-200 shadow-sm space-y-8">

                            <h2 className="text-xl font-black flex items-center gap-2">
                                <Settings className="text-blue-600" size={24} />
                                Policy Configuration
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                <Input
                                    label="Policy Name"
                                    value={formData.policy_name}
                                    onChange={e => handleChange("policy_name", e.target.value)}
                                />

                                <CustomSelect
                                    label="Enable Reminder"
                                    options={yesNoOptions}
                                    value={formData.reminder_enabled}
                                    onChange={value => handleChange("reminder_enabled", value)}
                                />

                                <Input
                                    label="Reminder Frequency (Days)"
                                    type="number"
                                    value={formData.reminder_frequency_days}
                                    onChange={e => handleChange("reminder_frequency_days", e.target.value)}
                                />

                                <Input
                                    label="Block After Months"
                                    type="number"
                                    value={formData.block_after_months}
                                    onChange={e => handleChange("block_after_months", e.target.value)}
                                />

                                <CustomSelect
                                    label="Status"
                                    options={statusOptions}
                                    value={formData.status}
                                    onChange={value => handleChange("status", value)}
                                />

                            </div>

                        </div>
                    </div>

                </form>
            </div>
        </AdminLayout>
    );
};

export default EditFeePolicy;
