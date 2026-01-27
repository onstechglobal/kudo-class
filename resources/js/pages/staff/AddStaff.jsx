import React, { useState, useEffect } from 'react'; // Added useEffect
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    UserCircle, Save, Camera, ArrowLeft, 
    Shield, Mail, Phone, Lock, School, 
    CheckCircle2, Loader2, UserPlus 
} from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import Input from '../../components/form/Input';
import CustomSelect from '../../components/form/CustomSelect';
import { Api_url } from '../../helpers/api';

function generatePassword(length = 10) {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$!";
    return Array.from({ length }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");
}

const AddStaff = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    
    // --- ADDED SCHOOLS STATE ---
    const [schoolOptions, setSchoolOptions] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        school_id: '',
        role: '',
        email: '',
        mobile: '',
        password_hash: generatePassword(),
        status: 'active'
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

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

    // --- FETCH SCHOOLS DATA (DYNAMICALY) ---
    useEffect(() => {
        const fetchSchools = async () => {
            try {
                const response = await axios.get(`${Api_url.name}school_data?all=1`);
                // Mapping the API response to the format CustomSelect needs
                const formattedSchools = response.data.data.map(school => ({
                    label: school.school_name,
                    value: school.school_id
                }));
                setSchoolOptions(formattedSchools);
            } catch (error) {
                console.error("Error fetching schools:", error);
            }
        };
        fetchSchools();
    }, []);

    const validateForm = () => {
        let newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Full name is required";
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email is invalid";
        }
        if (!formData.mobile.trim()) newErrors.mobile = "Mobile number is required";
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

        setLoading(true);

        const dataToSend = new FormData();
        Object.keys(formData).forEach(key => dataToSend.append(key, formData[key]));
        if (selectedFile) dataToSend.append('staff_photo', selectedFile);

        try {
            const { data: tokenData } = await axios.get(`${Api_url.name}csrf-token`);
            const response = await axios.post(`${Api_url.name}staffdata`, dataToSend, {
                headers: {
                    'X-CSRF-TOKEN': tokenData.token,
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true
            });

            if (response.data.status === 200) {
                setTimeout(() => {
                    navigate('/staff');
                }, 100);
            }
        } catch (error) {
            if (error.response?.data?.errors) setErrors(error.response.data.errors);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="bg-[#F8FAFC] min-h-screen">
                <form id="staff-reg-form" onSubmit={handleSubmit}>
                    
                    {/* --- HEADER --- */}
                    <div className="bg-white border-b border-gray-200 px-8 py-5">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <Link to="/staff">
                                    <button type="button" className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors cursor-pointer">
                                        <ArrowLeft size={20} />
                                    </button>
                                </Link>
                                <div>
                                    <nav className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">
                                        <Link to="/staff" className="hover:text-blue-800 transition-colors"> Staff Directory </Link>
                                        <span className="text-gray-400 mx-2">/</span>
                                        <button type="button" className="uppercase font-bold cursor-pointer hover:text-blue-800 transition-colors"> New Staff </button>
                                    </nav>
                                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Add New Staff Member</h1>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 bg-[#faae1c] hover:bg-[#faae1c]/90 text-white px-7 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-yellow-100 transition-all active:scale-95 disabled:opacity-70 cursor-pointer"
                            >
                                {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                Save Staff Record
                            </button>
                        </div>
                    </div>

                    {/* --- FORM BODY --- */}
                    <div className="p-8 max-w-[1600px] mx-auto">
                        <div className="grid grid-cols-12 gap-8">
                            
                            {/* Left Column: Avatar Upload */}
                            <div className="col-span-12 lg:col-span-4 xl:col-span-3">
                                <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm text-center sticky top-8">
                                    <div className="relative w-40 h-40 mx-auto mb-6">
                                        <div className="w-full h-full rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                                            {previewUrl ? (
                                                <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                                            ) : (
                                                <UserCircle size={64} className="text-gray-200" />
                                            )}
                                        </div>
                                        <label className="absolute bottom-0 right-0 p-3 bg-blue-600 text-white rounded-full shadow-lg border-4 border-white cursor-pointer hover:bg-blue-700 transition-colors">
                                            <Camera size={20} />
                                            <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                                        </label>
                                    </div>
                                    <h3 className="text-lg font-black text-gray-900">Staff Photo</h3>
                                    <p className="text-xs text-gray-400 mt-2">Upload a professional headshot</p>
                                </div>
                            </div>

                            {/* Right Column: Fields */}
                            <div className="col-span-12 lg:col-span-8 xl:col-span-9">
                                <div className="bg-white rounded-[2.5rem] p-10 border border-gray-200 shadow-sm space-y-12">
                                    
                                    {/* Section 1: Identity */}
                                    <section>
                                        <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                                            <UserPlus className="text-blue-600" size={24} /> Personal Details
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} error={errors.name} placeholder="" />
                                            <Input label="Email Address" name="email" value={formData.email} onChange={handleChange} error={errors.email} placeholder="" />
                                            <Input label="Mobile Number" name="mobile" value={formData.mobile} onChange={handleChange} error={errors.mobile} placeholder="" />
                                            <CustomSelect label="Assigned Role" options={roleOptions} value={formData.role} onChange={(val) => handleSelectChange('role', val)} error={errors.role} />
                                        </div>
                                    </section>

                                    {/* Section 2: Work Assignment */}
                                    <section className="pt-6 border-t border-gray-100">
                                        <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                                            <School className="text-blue-600" size={24} /> Assignment & Security
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Dynamic school options applied here */}
                                            <CustomSelect 
                                                label="Select School" 
                                                options={schoolOptions} 
                                                value={formData.school_id} 
                                                onChange={(val) => handleSelectChange('school_id', val)} 
                                                error={errors.school_id}
                                                placeholder="" 
                                            />
                                            <CustomSelect label="Account Status" options={statusOptions} value={formData.status} onChange={(val) => handleSelectChange('status', val)} />
                                            <div className="hidden">
                                                <Input type="hidden" name="password_hash" value={formData.password_hash} />
                                            </div>
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

export default AddStaff;