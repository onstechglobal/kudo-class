import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
// Added Loader2 here
import { School, Settings, Save, Camera, ArrowLeft, MapPin, Loader2 } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import Input from '../../components/form/Input';
import CustomSelect from '../../components/form/CustomSelect';
import CustomButton from '../../components/form/CustomButton';
import { Api_url } from '../../helpers/api';
import PageHeader from '../../components/common/PageHeader';


const EditSchool = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [loading1, setLoading1] = useState(false);
  const [errors, setErrors] = useState({}); // Track validation errors
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [formData, setFormData] = useState({
    school_name: '', email: '', phone: '', alternate_phone: '',
    address_line1: '', address_line2: '', city: '', state: '',
    country: 'India', pincode: '', board: '', logo_url: '',
    academic_start_month: 4, status: 'active'
  });

  const unscrambleId = (scrambled) => {
    try {
      const decoded = atob(scrambled);
      const hex = decoded.split('_')[1];
      return parseInt(hex, 16);
    } catch (e) { return null; }
  };
  const decodedId = unscrambleId(id);

  const boardOptions = [
    { label: "CBSE", value: "CBSE" },
    { label: "ICSE", value: "ICSE" },
    { label: "State Board", value: "STATE" },
  ];

  const monthOptions = [
    { label: "January", value: 1 }, { label: "February", value: 2 },
    { label: "March", value: 3 }, { label: "April", value: 4 },
    { label: "May", value: 5 }, { label: "June", value: 6 },
    { label: "July", value: 7 }, { label: "August", value: 8 },
    { label: "September", value: 9 }, { label: "October", value: 10 },
    { label: "November", value: 11 }, { label: "December", value: 12 },
  ];

  const statusOptions = [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
  ];

  useEffect(() => {
    const fetchSchool = async () => {
      try {
        const response = await axios.get(`${Api_url.name}get-school/${decodedId}`);
        if (response.data) {
          setFormData(response.data);
          if (response.data.logo_url) {
            setPreviewUrl(`/uploads/schools/${response.data.logo_url}`);
          }
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setTimeout(() => setLoading(false), 100);
      }
    };
    fetchSchool();
  }, [decodedId]);

  // Validation Logic
  const validateForm = () => {
    let newErrors = {};
    if (!formData.school_name?.trim()) newErrors.school_name = "School name is required";
    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.phone?.trim()) newErrors.phone = "Phone number is required";
    if (!formData.board) newErrors.board = "Please select a board";
    if (!formData.city?.trim()) newErrors.city = "City is required";
    if (!formData.pincode?.trim()) newErrors.pincode = "Pincode is required";

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

  /* ================= REMOVE PHOTO ================= */
  const removePhoto = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setOriginalPhoto(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading1(true);
    const dataToSend = new FormData();
    dataToSend.append('_method', 'PUT');
    Object.keys(formData).forEach(key => {
      if (key !== 'logo_url' && formData[key] !== null) dataToSend.append(key, formData[key]);
    });
    if (selectedFile) dataToSend.append('school_logo', selectedFile);

    try {
      const { data: csrf } = await axios.get(`${Api_url.name}csrf-token`);
      const response = await axios.post(`${Api_url.name}update-school/${decodedId}`, dataToSend, {
        headers: { 'X-CSRF-TOKEN': csrf.token, 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      if (response.data.status === 200) {
        navigate('/school');
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

          {/* --- FIXED HEADER (Always Visible) --- */}
          <div className="bg-white border-b border-gray-200 px-8 py-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Link to="/school" className="cursor-pointer">
                  <button type="button" className="p-2 hover:bg-gray-100 rounded-full text-gray-400 cursor-pointer">
                    <ArrowLeft size={20} />
                  </button>
                </Link>
                <div>
                  <nav className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">
                    <Link to="/school" className="hover:text-blue-800 transition-colors"> Schools </Link>
                    <span className="text-gray-400 mx-2">/</span>
                    <button className="uppercase font-bold cursor-pointer"> Edit </button>
                  </nav>
                  <h1 className="text-2xl font-black text-gray-900 tracking-tight"> Edit School </h1>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-[#faae1c] hover:bg-[#faae1c] text-white px-7 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all active:scale-95 disabled:opacity-70 cursor-pointer"
                >
                  {loading1 ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  Update School Record
                </button>
              </div>
            </div>
          </div>

          {/* --- LOWER CONTENT AREA --- */}
          <div className="relative min-h-[calc(100vh-100px)]">

            {/* FIXED PRELOADER: Stays at the top of the viewport below the header */}
            {loading && (
              <div className="fixed top-[97px] left-0 right-0 bottom-0 z-50 flex flex-col items-center justify-center bg-[#F8FAFC]/90 backdrop-blur-md">
                <div className="flex flex-col items-center gap-4 -mt-32"> {/* -mt-32 pulls the spinner up slightly for better visual balance */}
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
                  <p className="text-sm font-bold text-gray-600 uppercase tracking-widest animate-pulse">
                    Loading Data...
                  </p>
                </div>
              </div>
            )}

            {/* Form Content */}
            <div className="p-0 sm:p-8 max-w-[1600px] mx-auto">
              <div className="sm:grid sm:grid-cols-12 sm:gap-8">

                {/* Sidebar: Logo Upload */}
                <div className="py-8 sm:py-0 col-span-12 md:col-span-4 xl:col-span-3 text-center py-8 sm:py-0">
                  <div className="bg-white rounded-3xl p-4 border border-gray-200 shadow-sm">
                    <div className="relative w-40 h-40 mx-auto mb-4">
                      <div className="w-full h-full rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                        {previewUrl ? (
                          <img 
                            src={previewUrl} 
                            alt="Teacher Preview" 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <AvatarLetter text={`${formData.school_name?.charAt(0) || 'T'}`} />
                        )}
                      </div>
                      
                      {/* Camera Icon */}
                      <label className="absolute -bottom-2 -right-2 p-3 bg-blue-600 text-white rounded-xl cursor-pointer hover:bg-blue-700 transition">
                        <Camera size={20} />
                        <input 
                          type="file" 
                          hidden 
                          accept="image/*" 
                          onChange={handleFileChange} 
                        />
                      </label>
                      
                      {/* Remove Icon (only show if there's a photo) */}
                      {previewUrl && (
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="absolute -bottom-2 -left-2 p-3 bg-red-500 text-white rounded-xl cursor-pointer hover:bg-red-600 transition"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Main Form Fields */}
                <div className="col-span-12 md:col-span-8 xl:col-span-9">
                  <div className="bg-white rounded-[2.5rem] p-10 border border-gray-200 shadow-sm space-y-12">
                    <section>
                      <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                        <School className="text-blue-600" /> Basic Details
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="School Name" name="school_name" value={formData.school_name} onChange={handleChange} error={errors.school_name} />
                        <Input label="Email" name="email" value={formData.email} onChange={handleChange} error={errors.email} />
                        <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} error={errors.phone} />
                        <Input label="Alt. Phone" name="alternate_phone" value={formData.alternate_phone} onChange={handleChange} />
                        <CustomSelect label="Education Board" options={boardOptions} value={formData.board} onChange={(val) => handleSelectChange('board', val)} error={errors.board} />
                      </div>
                    </section>

                    <section>
                      <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                        <MapPin className="text-blue-600" /> Address
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2"><Input label="Address 1" name="address_line1" value={formData.address_line1} onChange={handleChange} /></div>
                        <Input label="City" name="city" value={formData.city} onChange={handleChange} error={errors.city} />
                        <Input label="Pincode" name="pincode" value={formData.pincode} onChange={handleChange} error={errors.pincode} />
                        <Input label="State" name="state" value={formData.state} onChange={handleChange} />
                        <Input label="Country" name="country" value={formData.country} onChange={handleChange} />
                      </div>
                    </section>

                    <section className="pt-8 border-t border-gray-100">
                      <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                        <Settings className="text-blue-600" /> Config
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <CustomSelect label="Start Month" options={monthOptions} value={formData.academic_start_month} onChange={(val) => handleSelectChange('academic_start_month', val)} />
                        <CustomSelect label="Status" options={statusOptions} value={formData.status} onChange={(val) => handleSelectChange('status', val)} />
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

export default EditSchool;

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
