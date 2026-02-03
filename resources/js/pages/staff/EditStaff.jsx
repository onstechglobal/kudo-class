import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    UserCircle, Save, Camera, ArrowLeft,
    School, Loader2, UserPlus, Shield, Mail, Phone
} from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import Input from '../../components/form/Input';
import CustomSelect from '../../components/form/CustomSelect';
import { Api_url } from '../../helpers/api';
import PageHeader from '../../components/common/PageHeader';
import EditPreloader from '../../components/common/EditPreloader';

const EditStaff = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true); // Data fetching loader
    const [loading1, setLoading1] = useState(false); // Update button loader
    const [errors, setErrors] = useState({});
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [schoolOptions, setSchoolOptions] = useState([]);
    const [imgError, setImgError] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        school_id: '',
        role: '',
        email: '',
        mobile: '',
        status: 'active'
    });

    // Utility to decode the scrambled ID (Matching your School Edit logic)
    const unscrambleId = (scrambled) => {
        try {
            const decoded = atob(scrambled);
            const hex = decoded.split('_')[1];
            return parseInt(hex, 16);
        } catch (e) { return null; }
    };
    const decodedId = unscrambleId(id);

    const roleOptions = [
        { label: "Administrator", value: "Administrator" },
        { label: "Accountant", value: "Accountant" },
        { label: "Receptionist", value: "Receptionist" },
        { label: "Librarian", value: "Librarian" },
    ];

    const statusOptions = [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
    ];


    /* ---------------- FETCH DATA ---------------- */
    /* ---------------- FETCH DATA ---------------- */
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Schools
                const schoolRes = await axios.get(`${Api_url.name}api/school_data?all=1`);
                const formattedSchools = schoolRes.data.data.map(s => ({
                    label: s.school_name,
                    value: s.school_id.toString()
                }));
                setSchoolOptions(formattedSchools);

                // 2. Fetch Staff (CORRECTED ACCESS)
                const staffRes = await axios.get(`${Api_url.name}api/get-staff/${decodedId}`);

                // Since your controller returns { status: 200, data: {...} }
                if (staffRes.data && staffRes.data.data) {
                    const staff = staffRes.data.data; // Access the nested 'data' key

                    setFormData({
                        name: staff.name || '',
                        school_id: staff.school_id ? staff.school_id.toString() : '',
                        role: staff.role || '',
                        email: staff.email || '',
                        mobile: staff.mobile || '',
                        status: staff.status || 'active'
                    });

                    if (staff.photo_url) {
                        setPreviewUrl(`/uploads/staff_photos/${staff.photo_url}`);
                    }
                }
            } catch (error) {
                console.error("Error prefilling form:", error);
            } finally {
                setTimeout(() => setLoading(false), 300);
            }
        };

        if (decodedId) fetchData();
    }, [decodedId]);


    /* ---------------- HANDLERS ---------------- */
    const validateForm = () => {
        let newErrors = {};
        if (!formData.name?.trim()) newErrors.name = "Full name is required";
        if (!formData.email?.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Invalid email format";
        }
        if (!formData.mobile?.trim()) newErrors.mobile = "Mobile number is required";
        if (!formData.role) newErrors.role = "Please assign a role";
        if (!formData.school_id) newErrors.school_id = "Please select a school";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading1(true);
        const dataToSend = new FormData();
        dataToSend.append('_method', 'PUT'); // Laravel requirement for spoofing PUT in FormData

        Object.keys(formData).forEach(key => {
            if (key !== 'staff_photo' && formData[key] !== null) {
                dataToSend.append(key, formData[key]);
            }
        });

        if (selectedFile) dataToSend.append('staff_photo', selectedFile);

        try {
            const { data: csrf } = await axios.get(`${Api_url.name}api/csrf-token`);
            const response = await axios.post(`${Api_url.name}api/update-staff/${decodedId}`, dataToSend, {
                headers: { 'X-CSRF-TOKEN': csrf.token, 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });

            if (response.data.status === 200) {
                navigate('/staff', {
                    state: { message: 'Staff updated successfully!' }
                });
            }
        } catch (error) {
            if (error.response?.data?.errors) setErrors(error.response.data.errors);
            setLoading1(false);
        }
    };

    return (
        <AdminLayout>
            <div className="bg-[#F8FAFC] min-h-screen font-sans p-6">
                <form onSubmit={handleSubmit}>

                    {/* --- HEADER --- */}
                    <div className="bg-white border-b border-gray-200 px-8 py-5">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                           
                            <PageHeader
                                prevRoute="/staff"
                                breadcrumbParent="Staff Directory"
                                breadcrumbCurrent="Edit Staff"
                                title="Edit Staff Member"
                            />

                            <button
                                type="submit"
                                disabled={loading1}
                                className="flex items-center gap-2 bg-[#faae1c] hover:bg-[#faae1c]/90 text-white px-7 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all active:scale-95 disabled:opacity-70 cursor-pointer"
                            >
                                {loading1 ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                Update Staff Record
                            </button>
                        </div>
                    </div>

                    <div className="relative min-h-[calc(100vh-100px)]">
                        {/* --- PRELOADER --- */}
                        {loading && (
                            <EditPreloader />
                        )}

                        {/* --- FORM CONTENT --- */}
                        <div className="p-0 sm:p-8 max-w-[1600px] mx-auto">
                            <div className="sm:grid sm:grid-cols-12 sm:gap-8">

                                {/* Sidebar: Avatar Upload */}
                                <div className="col-span-12 lg:col-span-4 xl:col-span-3 text-center py-8 sm:py-0">
                                    <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
                                        <div className="relative w-40 h-40 mx-auto mb-6">
                                            <div className="w-full h-full rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                                                {previewUrl && !imgError ? (
                                                    <img 
                                                        src={previewUrl} 
                                                        className="w-full h-full object-cover" 
                                                        alt="Preview" 
                                                        onError={(e)=> {
                                                            setImgError(true)
                                                        }}
                                                    />
                                                ) : (
                                                    <AvatarLetter text={formData.name} size={40} />
                                                )}
                                            </div>
                                            <label className="absolute -bottom-2 right-0 p-3 bg-blue-600 text-white rounded-xl shadow-lg cursor-pointer hover:bg-blue-700 transition-colors">
                                                <Camera size={20} />
                                                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                                            </label>
                                            
                                        </div>
                                        <h3 className="text-lg font-black text-gray-900">Staff Photo</h3>
                                        <p className="text-xs text-gray-400 mt-2">Update professional headshot</p>
                                    </div>
                                </div>

                                {/* Main Form Fields */}
                                <div className="col-span-12 lg:col-span-8 xl:col-span-9">
                                    <div className="bg-white rounded-[2.5rem] p-10 border border-gray-200 shadow-sm space-y-12">

                                        {/* Section 1: Identity */}
                                        <section>
                                            <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                                                <UserPlus className="text-blue-600" size={24} /> Personal Details
                                            </h2>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} error={errors.name} />
                                                <Input label="Email Address" name="email" value={formData.email} onChange={handleChange} error={errors.email} />
                                                <Input label="Mobile Number" name="mobile" value={formData.mobile} onChange={handleChange} error={errors.mobile} />
                                                <CustomSelect label="Assigned Role" options={roleOptions} value={formData.role} onChange={(val) => handleSelectChange('role', val)} error={errors.role} />
                                            </div>
                                        </section>

                                        {/* Section 2: Assignment */}
                                        <section className="pt-8 border-t border-gray-100">
                                            <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                                                <School className="text-blue-600" size={24} /> Work Assignment
                                            </h2>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <CustomSelect
                                                    label="Select School"
                                                    options={schoolOptions}
                                                    value={formData.school_id}
                                                    onChange={(val) => handleSelectChange('school_id', val)}
                                                    error={errors.school_id}
                                                />
                                                <CustomSelect label="Account Status" options={statusOptions} value={formData.status} onChange={(val) => handleSelectChange('status', val)} />
                                            </div>
                                        </section>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
};

export default EditStaff;

/* ================= AVATAR ================= */
function AvatarLetter({ text }) {
  const letter = text?.trim()?.charAt(0)?.toUpperCase() || "U";
  return (
    <div
      className="w-32 h-32 mx-auto rounded-3xl flex items-center justify-center
      text-white text-5xl font-black"
      style={{ backgroundColor: "#FAAE1C" }}
    >
      {letter}
    </div>
  );
}
