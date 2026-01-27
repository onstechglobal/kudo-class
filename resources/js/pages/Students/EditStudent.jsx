import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { User, Save, Camera, ArrowLeft, MapPin, GraduationCap, School, Loader2 } from 'lucide-react';

import AdminLayout from '../../layouts/AdminLayout';
import Input from '../../components/form/Input';
import CustomSelect from '../../components/form/CustomSelect';
import { Api_url } from '../../helpers/api';

const EditStudent = () => {
  const navigate = useNavigate();
  const { id: scrambledId } = useParams();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errors, setErrors] = useState({});
  const [schools, setSchools] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const [formData, setFormData] = useState({
    school_id: '', admission_no: '', roll_no: '',
    first_name: '', last_name: '', gender: '', dob: '', blood_group: '',
    class_id: '', section_id: '', address: '', city: '', 
    pincode: '', emergency_contact: '', status: 'active'
  });

  const genderOptions = [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
    { label: "Other", value: "other" }
  ];

  const statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' }
  ];

  const unscrambleId = (scrambled) => {
    try {
      const decoded = atob(scrambled);
      const match = decoded.match(/std_(.*)_z2/); // Adjusted to match student salt
      return match ? parseInt(match[1], 16) : null;
    } catch (e) { return null; }
  };

  useEffect(() => {
    const loadData = async () => {
      setFetching(true);
      try {
        // 1. Fetch Schools for dropdown
        const schoolRes = await axios.get(`${Api_url.name}school_data?all=1`);
        setSchools(schoolRes.data.data.map(s => ({ label: s.school_name, value: s.school_id })));

        // 2. Fetch Student Data
        const realId = unscrambleId(scrambledId);
        if (realId) {
          const res = await axios.get(`${Api_url.name}get-student/${realId}`);
          const std = res.data.data;
          setFormData({ ...std });
          if (std.photo_url) setPreviewUrl(std.photo_url);
        }
      } catch (error) {
        console.error("Load Error:", error);
      } finally {
        setTimeout(() => setFetching(false), 200);
      }
    };
    loadData();
  }, [scrambledId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
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
    setLoading(true);
    const realId = unscrambleId(scrambledId);

    const dataToSend = new FormData();
    Object.keys(formData).forEach(key => dataToSend.append(key, formData[key]));
    if (selectedFile) dataToSend.append('photo_url', selectedFile);

    try {
      const { data: tokenData } = await axios.get(`${Api_url.name}csrf-token`);
      const response = await axios.post(`${Api_url.name}update-student/${realId}`, dataToSend, {
        headers: { 'X-CSRF-TOKEN': tokenData.token, 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      if (response.data.status === 200) navigate('/students');
    } catch (error) {
      if (error.response?.data?.errors) setErrors(error.response.data.errors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="bg-[#F8FAFC] min-h-screen font-sans p-6">
        <form onSubmit={handleSubmit}>
          
          {/* --- FIXED HEADER --- */}
          <div className="bg-white border-b border-gray-200 px-8 py-5 sticky top-0 z-30">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Link to="/students" className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                  <ArrowLeft size={20} />
                </Link>
                <div>
                  <nav className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">
                    <span>Students</span> <span className="text-gray-400 mx-2">/</span> <span>Edit Profile</span>
                  </nav>
                  <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                    {formData.first_name ? `${formData.first_name} ${formData.last_name}` : 'Loading...'}
                  </h1>
                </div>
              </div>
              <button type="submit" disabled={fetching || loading} className="flex items-center gap-2 bg-[#faae1c] text-white px-7 py-2.5 rounded-xl font-bold shadow-lg active:scale-95 disabled:opacity-70">
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Update Profile
              </button>
            </div>
          </div>

          <div className="relative p-0 sm:p-8 max-w-[1600px] mx-auto">
            
            {/* PRELOADER */}
            {fetching && (
              <div className="fixed top-[97px] left-0 right-0 bottom-0 z-50 flex flex-col items-center justify-center bg-[#F8FAFC]/90 backdrop-blur-sm">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-[#faae1c] mb-4"></div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest animate-pulse">Fetching Student Data...</p>
              </div>
            )}

            <div className="sm:grid sm:grid-cols-12 sm:gap-8">
              {/* Left Column: Photo */}
              <div className="col-span-12 lg:col-span-3">
                <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm text-center sticky top-28">
                  <div className="relative w-40 h-40 mx-auto mb-6">
                    <div className="w-full h-full rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                      {previewUrl ? (
                        <img src={previewUrl} className="w-full h-full object-cover" alt="Student" />
                      ) : (
                        <div className="text-5xl font-black text-white w-32 h-32 rounded-3xl flex items-center justify-center bg-[#FAAE1C]">S</div>
                      )}
                    </div>
                    <label className="absolute -bottom-2 -right-2 p-3 bg-blue-600 text-white rounded-xl cursor-pointer hover:bg-blue-700 transition shadow-lg">
                      <Camera size={20} /><input type="file" hidden accept="image/*" onChange={handleFileChange} />
                    </label>
                  </div>
                  <h3 className="text-lg font-black text-gray-900">Student Photo</h3>
                  <p className="text-xs text-gray-500 mt-2 uppercase font-bold tracking-tighter">ID: {formData.admission_no || 'N/A'}</p>
                </div>
              </div>

              {/* Right Column: Fields */}
              <div className="col-span-12 lg:col-span-9 space-y-8">
                <div className="bg-white rounded-[2.5rem] p-10 border border-gray-200 shadow-sm space-y-12">
                  
                  {/* Academic Info */}
                  <section>
                    <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2"><GraduationCap className="text-blue-600" size={24} /> Academic Record</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <CustomSelect label="Assigned School" options={schools} value={formData.school_id} onChange={(val) => handleSelectChange('school_id', val)} error={errors.school_id} />
                      <Input label="Admission No" name="admission_no" value={formData.admission_no} onChange={handleChange} error={errors.admission_no} />
                      <CustomSelect label="Current Status" options={statusOptions} value={formData.status} onChange={(val) => handleSelectChange('status', val)} />
                    </div>
                  </section>

                  {/* Personal Details */}
                  <section className="pt-8 border-t border-gray-100">
                    <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2"><User className="text-blue-600" size={24} /> Personal Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Input label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} error={errors.first_name} />
                      <Input label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} />
                      <CustomSelect label="Gender" options={genderOptions} value={formData.gender} onChange={(val) => handleSelectChange('gender', val)} />
                      <Input label="Date of Birth" type="date" name="dob" value={formData.dob} onChange={handleChange} />
                      <Input label="Roll No" name="roll_no" value={formData.roll_no} onChange={handleChange} />
                      <Input label="Emergency Contact" name="emergency_contact" value={formData.emergency_contact} onChange={handleChange} />
                    </div>
                  </section>

                  {/* Address */}
                  <section className="pt-8 border-t border-gray-100">
                    <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2"><MapPin className="text-blue-600" size={24} /> Contact Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2"><Input label="Full Residence Address" name="address" value={formData.address} onChange={handleChange} /></div>
                      <Input label="City" name="city" value={formData.city} onChange={handleChange} />
                      <Input label="Pincode" name="pincode" value={formData.pincode} onChange={handleChange} />
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

export default EditStudent;