// C:\xampp\htdocs\kudoclass\resources\js\pages\fee-structure\EditFee.jsx
import AdminLayout from "../../layouts/AdminLayout";
import PageHeader from "../../components/common/PageHeader";
import Input from "../../components/form/Input";
import CustomSelect from "../../components/form/CustomSelect";
import api from "../../helpers/api";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { School, Save, Bus, Loader2, AlertCircle, Check } from "lucide-react";

const EditFee = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    
    // Dynamic data from API
    const [academicYears, setAcademicYears] = useState([]);
    const [classes, setClasses] = useState([]);
    
    const [formData, setFormData] = useState({
        fee_name: "",
        fee_type: "academic",
        amount: "",
        frequency: "monthly",
        status: "active",
        academic_year_id: "",
        driver_name: "",
        class_ids: [],
    });

    // Static options WITHOUT placeholder option
    const feeTypeOptions = [
        { label: "Academic Fee", value: "academic" },
        { label: "Exam Fee", value: "exam" },
        { label: "Sports Fee", value: "sports" },
        { label: "Library Fee", value: "library" },
        { label: "Transport Fee", value: "transport" },
        { label: "Other", value: "other" },
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

    // Fetch initial data
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setFetchingData(true);
                
                // Fetch active academic years
                const academicResponse = await api.get('/api/academic-data');
                
                if (academicResponse.data && academicResponse.data.data) {
                    const activeYears = academicResponse.data.data
                        .filter(year => year.is_active == 1)
                        .map(year => ({
                            label: year.year_name || "Unknown Year",
                            value: year.academic_year_id?.toString() || ""
                        }))
                        .filter(year => year.value);
                    
                    setAcademicYears(activeYears);
                }
                
                // Fetch classes
                const classesResponse = await api.get('/api/get-classes');
                
                if (classesResponse.data && classesResponse.data.data) {
                    const formattedClasses = classesResponse.data.data
                        .map(cls => ({
                            label: cls.class_name || "Unknown Class",
                            value: cls.class_id?.toString() || ""
                        }))
                        .filter(cls => cls.value);
                    
                    setClasses(formattedClasses);
                }
                
                // Fetch fee structure data
                const feeResponse = await api.get(`/api/fee-structures/${id}`);
                
                if (feeResponse.data.success && feeResponse.data.data) {
                    const feeData = feeResponse.data.data;
                    
                    setFormData({
                        fee_name: feeData.fee_name || "",
                        fee_type: feeData.fee_type || "academic",
                        amount: feeData.amount || "",
                        frequency: feeData.frequency || "monthly",
                        status: feeData.status || "active",
                        academic_year_id: feeData.academic_year_id?.toString() || "",
                        driver_name: feeData.driver_name || "",
                        class_ids: feeData.class_ids?.map(id => id.toString()) || [],
                    });
                } else {
                    setError("Fee structure not found");
                }
            } catch (err) {
                console.error("Error fetching initial data:", err);
                setError("Failed to load fee structure data");
            } finally {
                setFetchingData(false);
            }
        };
        
        if (id) {
            fetchInitialData();
        }
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
            // Validate required fields
            if (!formData.fee_name.trim()) {
                throw new Error("Fee name is required");
            }
            
            if (!formData.amount || parseFloat(formData.amount) <= 0) {
                throw new Error("Valid amount is required");
            }
            
            if (!formData.academic_year_id) {
                throw new Error("Academic year is required");
            }
            
            if (formData.fee_type !== 'transport' && (!formData.class_ids || formData.class_ids.length === 0)) {
                throw new Error("Please select at least one class");
            }
            
            if (formData.fee_type === 'transport' && !formData.driver_name.trim()) {
                throw new Error("Driver name is required for transport fee");
            }

            // Prepare payload
            const payload = {
                fee_name: formData.fee_name,
                amount: parseFloat(formData.amount),
                fee_type: formData.fee_type,
                status: formData.status,
                academic_year_id: formData.academic_year_id,
            };

            // Add conditional fields
            if (formData.fee_type !== 'transport') {
                payload.frequency = formData.frequency;
                payload.class_ids = formData.class_ids.map(id => parseInt(id));
            } else {
                payload.driver_name = formData.driver_name;
            }

            console.log("Updating payload:", payload);
            
            const response = await api.put(`/api/fee-structures/${id}`, payload);
            
            if (response.data.success) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/fee-structure');
                }, 1500);
            } else {
                throw new Error(response.data.message || "Failed to update fee structure");
            }
        } catch (err) {
            console.error("Update error:", err);
            console.error("Update error details:", err.response?.data);
            
            // Display validation errors if available
            if (err.response?.data?.errors) {
                const errorMessages = Object.values(err.response.data.errors).flat();
                setError(errorMessages.join(', ') || "Validation failed");
            } else {
                setError(err.response?.data?.message || err.message || "Failed to update fee structure");
            }
        } finally {
            setLoading(false);
        }
    };

    const renderTransportForm = () => (
        <section>
            <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <Bus className="text-blue-600" size={24} />
                Transport Fee Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                    label="Route Name *"
                    name="route_name"
                    value={formData.fee_name}
                    onChange={(e) => handleChange("fee_name", e.target.value)}
                    placeholder="Enter route name"
                    required
                />
                <Input
                    label="Driver Name *"
                    name="driver_name"
                    value={formData.driver_name}
                    onChange={(e) => handleChange("driver_name", e.target.value)}
                    placeholder="Enter driver name"
                    required
                />
                <Input
                    label="Monthly Amount (₹) *"
                    name="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => handleChange("amount", e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                />
                <CustomSelect
                    label="Status *"
                    options={statusOptions}
                    value={formData.status}
                    onChange={(value) => handleChange("status", value)}
                />
                <div className="col-span-1 md:col-span-2">
                    <CustomSelect
                        label="Academic Year *"
                        options={academicYears}
                        value={formData.academic_year_id}
                        onChange={(value) => handleChange("academic_year_id", value)}
                        required
                    />
                </div>
            </div>
        </section>
    );

    const renderAcademicForm = () => (
        <>
            <section>
                <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                    <School className="text-blue-600" size={24} />
                    Academic Fee Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        label="Fee Name *"
                        name="fee_name"
                        value={formData.fee_name}
                        onChange={(e) => handleChange("fee_name", e.target.value)}
                        placeholder="Enter fee name"
                        required
                    />
                    <CustomSelect
                        label="Fee Type *"
                        options={feeTypeOptions.filter(opt => opt.value !== 'transport')}
                        value={formData.fee_type}
                        onChange={(value) => handleChange("fee_type", value)}
                        disabled={true} // Fee type cannot be changed after creation
                    />
                    <CustomSelect
                        label="Frequency *"
                        options={frequencyOptions}
                        value={formData.frequency}
                        onChange={(value) => handleChange("frequency", value)}
                    />
                    <Input
                        label="Amount (₹) *"
                        name="amount"
                        type="number"
                        value={formData.amount}
                        onChange={(e) => handleChange("amount", e.target.value)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        required
                    />
                    <CustomSelect
                        label="Status *"
                        options={statusOptions}
                        value={formData.status}
                        onChange={(value) => handleChange("status", value)}
                    />
                    <CustomSelect
                        label="Academic Year *"
                        options={academicYears}
                        value={formData.academic_year_id}
                        onChange={(value) => handleChange("academic_year_id", value)}
                        required
                        disabled={true} // Academic year cannot be changed after creation
                    />
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Classes *
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {classes.map(cls => (
                                <div key={cls.value} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id={`class-${cls.value}`}
                                        checked={formData.class_ids.includes(cls.value)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                handleChange("class_ids", [...formData.class_ids, cls.value]);
                                            } else {
                                                handleChange("class_ids", formData.class_ids.filter(id => id !== cls.value));
                                            }
                                        }}
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label 
                                        htmlFor={`class-${cls.value}`}
                                        className="ml-2 text-sm text-gray-700"
                                    >
                                        {cls.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                        {formData.class_ids.length === 0 && (
                            <p className="text-sm text-red-600 mt-2">Please select at least one class</p>
                        )}
                    </div>
                </div>
            </section>

            {/* Selected Classes Info */}
            {formData.class_ids.length > 0 && (
                <section>
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-700 mb-2">
                            Selected Classes ({formData.class_ids.length}):
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {formData.class_ids.map(classId => {
                                const classInfo = classes.find(c => c.value === classId);
                                return (
                                    <span 
                                        key={classId}
                                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                                    >
                                        {classInfo?.label || `Class ${classId}`}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}
        </>
    );

    if (fetchingData) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-screen">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
            </AdminLayout>
        );
    }

    if (error && !fetchingData) {
        return (
            <AdminLayout>
                <div className="p-6">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <AlertCircle className="text-red-500" size={24} />
                            <h2 className="text-lg font-bold text-red-700">Error Loading Data</h2>
                        </div>
                        <p className="text-red-600 mb-4">{error}</p>
                        <button
                            onClick={() => navigate('/fee-structure')}
                            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                        >
                            Back to Fee Structures
                        </button>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="bg-[#F8FAFC] min-h-screen p-6">
                <form onSubmit={handleSubmit} id="fee-structure-form">
                    {/* Header */}
                    <div className="bg-white border-b border-gray-200 px-8 py-5">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <PageHeader
                                prevRoute="/fee-structure"
                                breadcrumbParent="Fee Structure"
                                breadcrumbCurrent="Edit"
                                title="Edit Fee Structure"
                            />

                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => navigate('/fee-structure')}
                                    className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || success}
                                    className="flex items-center gap-2 bg-[#faae1c] hover:bg-[#faae1c]/90 text-white px-7 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-100 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Updating...
                                        </>
                                    ) : success ? (
                                        <>
                                            <Check size={18} />
                                            Updated!
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            Update Structure
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    {error && (
                        <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                            <AlertCircle className="text-red-500" size={20} />
                            <span className="text-red-700">{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="mx-6 mt-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                            <Check className="text-green-500" size={20} />
                            <span className="text-green-700">
                                Fee structure updated successfully! Redirecting...
                            </span>
                        </div>
                    )}

                    {/* Fee Type Display (Cannot change type after creation) */}
                    <div className="flex gap-4 mb-8 mt-5 ml-7">
                        <div className={`px-8 py-3 rounded-xl font-black text-sm
                            flex items-center gap-2
                            ${formData.fee_type === "transport" 
                                ? "text-white bg-blue-600" 
                                : "text-white bg-[#0468C3]"
                            }`}
                        >
                            {formData.fee_type === "transport" ? (
                                <>
                                    <Bus size={24} />
                                    Transport Fee
                                </>
                            ) : (
                                <>
                                    <School size={24} />
                                    Academic Fee
                                </>
                            )}
                        </div>
                        <div className="px-4 py-3 bg-blue-50 text-blue-700 rounded-xl text-sm">
                            <span className="font-medium">Note:</span> Fee type cannot be changed after creation
                        </div>
                    </div>

                    {/* Form Body */}
                    <div className="py-0 sm:p-8 max-w-[1600px] mx-auto">
                        <div className="sm:grid sm:grid-cols-12 sm:gap-8">
                            {/* Info Card */}
                            <div className="py-8 sm:py-0 col-span-12 md:col-span-4 xl:col-span-3">
                                <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
                                    <div className="relative w-40 h-40 mx-auto mb-6">
                                        <div className="w-full h-full rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                                            <AvatarLetter 
                                                text={formData.fee_type === "transport" ? "T" : "A"} 
                                            />
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
                                        {formData.fee_type === "transport" ? "Transport Fee" : "Academic Fee"}
                                    </h3>
                                    <p className="text-sm text-gray-500 text-center">
                                        {formData.fee_type === "transport" 
                                            ? "Configure transport route fees"
                                            : "Configure academic fee structure"}
                                    </p>
                                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                        <p className="text-sm text-blue-700 font-medium">
                                            <strong>Academic Year:</strong> {
                                                academicYears.find(ay => ay.value === formData.academic_year_id)?.label || 
                                                "No academic year selected"
                                            }
                                        </p>
                                        {formData.fee_type !== 'transport' && formData.class_ids.length > 0 && (
                                            <p className="text-sm text-blue-700 font-medium mt-2">
                                                <strong>Classes:</strong> {formData.class_ids.length}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="col-span-12 md:col-span-8 xl:col-span-9">
                                <div className="bg-white rounded-[2.5rem] p-10 border border-gray-200 shadow-sm space-y-12">
                                    {formData.fee_type === "transport" 
                                        ? renderTransportForm() 
                                        : renderAcademicForm()
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
};

function AvatarLetter({ text }) {
    const letter = text?.trim()?.charAt(0)?.toUpperCase() || "U";
    return (
        <div
            className="w-32 h-32 mx-auto rounded-3xl flex items-center justify-center text-white text-5xl font-black"
            style={{ backgroundColor: "#FAAE1C" }}
        >
            {letter}
        </div>
    );
}

export default EditFee;