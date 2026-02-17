import AdminLayout from "../../layouts/AdminLayout";
import PageHeader from "../../components/common/PageHeader";
import Input from "../../components/form/Input";
import CustomSelect from "../../components/form/CustomSelect";
import api from "../../helpers/api";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ShieldAlert, Save, Loader2, AlertCircle } from "lucide-react";

const EditPenalty = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState("");

    const [policies, setPolicies] = useState([]);

    const [formData, setFormData] = useState({
        policy_id: "",
        fee_type: "academic",
        penalty_type: "flat",
        penalty_value: "",
        grace_period_days: "",
        frequency: "per_month",
        status: "active"
    });

    /* ---------------- OPTIONS ---------------- */

    const feeTypeOptions = [
        { label: "Academic", value: "academic" },
        { label: "Transport", value: "transport" },
        { label: "Exam", value: "exam" },
        { label: "All Fees", value: "all" },
    ];

    const penaltyTypeOptions = [
        { label: "Flat Amount", value: "flat" },
        { label: "Percentage (%)", value: "percentage" },
    ];

    const frequencyOptions = [
        { label: "Once", value: "once" },
        { label: "Per Month", value: "per_month" },
    ];

    const statusOptions = [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
    ];

    /* ---------------- FETCH POLICIES + RULE ---------------- */

    useEffect(() => {
        const fetchData = async () => {
            try {
                const user = JSON.parse(localStorage.getItem("user"));
                let schoolId = user?.school_id;
                if (!schoolId || schoolId === 0) schoolId = 1;

                // Fetch policies
                const policyRes = await api.get(`/api/fees-policy?school_id=${schoolId}`);

                if (policyRes.data.success) {
                    const options = policyRes.data.data.map(policy => ({
                        label: policy.policy_name,
                        value: policy.policy_id
                    }));
                    setPolicies(options);
                }

                // Fetch rule
                const ruleRes = await api.get(`/api/penalty-rules/${id}`);

                if (ruleRes.data.status) {
                    const data = ruleRes.data.data;

                    setFormData({
                        policy_id: data.policy_id || "",
                        fee_type: data.fee_type || "academic",
                        penalty_type: data.penalty_type || "flat",
                        penalty_value: data.penalty_value || "",
                        grace_period_days: data.grace_period_days || "",
                        frequency: data.frequency || "per_month",
                        status: data.status || "active"
                    });
                }

            } catch (err) {
                setError("Failed to load data");
            } finally {
                setFetching(false);
            }
        };

        fetchData();
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
            if (!formData.policy_id)
                throw new Error("Please select a fee policy");

            if (!formData.penalty_value)
                throw new Error("Penalty value is required");

            const user = JSON.parse(localStorage.getItem("user"));
            let schoolId = user?.school_id;
            if (!schoolId || schoolId === 0) schoolId = 1;

            const payload = {
                ...formData,
                school_id: schoolId,
                grace_period_days: parseInt(formData.grace_period_days),
            };

            const response = await api.put(`/api/penalty-rules/${id}`, payload);

            if (response.data.status) {
                navigate("/penalty-rules", {
                    state: {
                        message: "Penalty rule updated successfully!",
                        status: "success"
                    }
                });
            } else {
                throw new Error(response.data.message);
            }

        } catch (err) {
            setError(err.response?.data?.message || err.message);
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

                    <div className="bg-white border-b border-gray-200 px-8 py-5 flex justify-between">
                        <PageHeader
                            prevRoute="/penalty-rules"
                            breadcrumbParent="Penalty Rules"
                            breadcrumbCurrent="Edit"
                            title="Edit Penalty Rule"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 bg-[#faae1c] text-white px-7 py-2.5 rounded-xl"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            Update
                        </button>
                    </div>

                    <div className="p-8 max-w-[1200px] mx-auto">
                        {error && (
                            <div className="p-4 bg-red-50 text-red-700 rounded-xl mt-4 flex gap-2">
                                <AlertCircle size={18} />
                                {error}
                            </div>
                        )}

                        <div className="bg-white rounded-[2.5rem] p-10 border border-gray-200 shadow-sm space-y-8">

                            <h2 className="text-xl font-black flex items-center gap-2">
                                <ShieldAlert className="text-blue-600" size={24} />
                                Penalty Configuration
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                <CustomSelect
                                    label="Fee Policy"
                                    options={policies}
                                    value={formData.policy_id}
                                    onChange={value => handleChange("policy_id", value)}
                                />

                                <CustomSelect
                                    label="Fee Type"
                                    options={feeTypeOptions}
                                    value={formData.fee_type}
                                    onChange={value => handleChange("fee_type", value)}
                                />

                                <CustomSelect
                                    label="Penalty Type"
                                    options={penaltyTypeOptions}
                                    value={formData.penalty_type}
                                    onChange={value => handleChange("penalty_type", value)}
                                />

                                <Input
                                    label="Penalty Value"
                                    type="number"
                                    value={formData.penalty_value}
                                    onChange={e => handleChange("penalty_value", e.target.value)}
                                />

                                <Input
                                    label="Grace Period (Days)"
                                    type="number"
                                    value={formData.grace_period_days}
                                    onChange={e => handleChange("grace_period_days", e.target.value)}
                                />

                                <CustomSelect
                                    label="Frequency"
                                    options={frequencyOptions}
                                    value={formData.frequency}
                                    onChange={value => handleChange("frequency", value)}
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

export default EditPenalty;
