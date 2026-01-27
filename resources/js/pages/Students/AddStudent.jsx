import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Save, Camera, ArrowLeft, MapPin, GraduationCap, School, Loader2 } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import Input from '../../components/form/Input';
import CustomSelect from '../../components/form/CustomSelect';
import { Api_url } from '../../helpers/api';

const AddStudent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  
  // State for dynamic school listing
  const [schools, setSchools] = useState([]);

  const genderOptions = [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
    { label: "Other", value: "other" }
  ];

  const [formData, setFormData] = useState({
    school_id: '', academic_year_id: '1', admission_no: '', roll_no: '',
    first_name: '', last_name: '', gender: '', dob: '', blood_group: '',
    class_id: '', section_id: '', address: '', city: '', state: '',
    pincode: '', emergency_contact: '', status: 'active', 
    joined_date: new Date().toISOString().split('T')[0]
  });

  // Fetch schools on component mount
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await axios.get(`${Api_url.name}school_data?all=1`);
        const schoolOptions = response.data.map(sch => ({
          label: sch.school_name,
          value: sch.school_id
        }));
        setSchools(schoolOptions);
      } catch (error) {
        console.error("Error fetching schools:", error);
      }
    };
    fetchSchools();
  }, []);

  const validateForm = () => {
    let newErrors = {};
    if (!formData.school_id) newErrors.school_id = "Please select a school";
    if (!formData.first_name.trim()) newErrors.first_name = "First name is required";
    if (!formData.admission_no.trim()) newErrors.admission_no = "Admission No is required";
    if (!formData.class_id) newErrors.class_id = "Class is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    
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
    if (selectedFile) dataToSend.append('photo_url', selectedFile);

    try {
      const { data: tokenData } = await axios.get(`${Api_url.name}csrf-token`);
      const response = await axios.post(`${Api_url.name}studentdata`, dataToSend, {
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
      <div className="bg-[#F8FAFC] min-h-screen p-6">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-8 py-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Link to="/students" className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                  <ArrowLeft size={20} />
                </Link>
                <div>
                  <nav className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">
                    <span>Students</span> <span className="text-gray-400 mx-2">/</span> <span>New Admission</span>
                  </nav>
                  <h1 className="text-2xl font-black text-gray-900 tracking-tight">Add New Student</h1>
                </div>
              </div>
              <button type="submit" disabled={loading} className="flex items-center gap-2 bg-[#faae1c] text-white px-7 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all active:scale-95 disabled:opacity-70">
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Save Student Profile
              </button>
            </div>
          </div>

          <div className="py-8 max-w-[1600px] mx-auto sm:grid sm:grid-cols-12 sm:gap-8">
            {/* Left Column */}
            <div className="col-span-12 md:col-span-4 xl:col-span-3">
              <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm text-center">
                <div className="relative w-40 h-40 mx-auto mb-6">
                  <div className="w-full h-full rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                    {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" alt="Student" /> : <div className="text-5xl font-black text-white w-32 h-32 rounded-3xl flex items-center justify-center bg-[#FAAE1C]">S</div>}
                  </div>
                  <label className="absolute -bottom-2 -right-2 p-3 bg-blue-600 text-white rounded-xl cursor-pointer hover:bg-blue-700 transition">
                    <Camera size={20} /><input type="file" hidden accept="image/*" onChange={handleFileChange} />
                  </label>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Student Photo</h3>
              </div>
            </div>

            {/* Right Column */}
            <div className="col-span-12 md:col-span-8 xl:col-span-9">
              <div className="bg-white rounded-[2.5rem] p-10 border border-gray-200 shadow-sm space-y-12">
                
                {/* Academic Details - Added School Selection Here */}
                <section>
                  <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2"><GraduationCap className="text-blue-600" size={24} /> Academic Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                     <CustomSelect 
                        label="Select School" 
                        options={schools} 
                        value={formData.school_id} 
                        onChange={(val) => handleSelectChange('school_id', val)} 
                        error={errors.school_id} 
                        icon={<School size={18}/>}
                     />
                     <Input label="Admission No" name="admission_no" value={formData.admission_no} onChange={handleChange} error={errors.admission_no} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Input label="Roll No" name="roll_no" value={formData.roll_no} onChange={handleChange} />
                    <Input label="Class ID" name="class_id" value={formData.class_id} onChange={handleChange} error={errors.class_id} />
                    <Input label="Section ID" name="section_id" value={formData.section_id} onChange={handleChange} />
                  </div>
                </section>

                {/* Personal Details */}
                <section>
                  <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2"><User className="text-blue-600" size={24} /> Personal Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Input label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} error={errors.first_name} />
                    <Input label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} />
                    <CustomSelect label="Gender" options={genderOptions} value={formData.gender} onChange={(val) => handleSelectChange('gender', val)} error={errors.gender} />
                    <Input label="Date of Birth" type="date" name="dob" value={formData.dob} onChange={handleChange} />
                    <Input label="Blood Group" name="blood_group" value={formData.blood_group} onChange={handleChange} />
                    <Input label="Emergency Contact" name="emergency_contact" value={formData.emergency_contact} onChange={handleChange} />
                  </div>
                </section>

                {/* Address */}
                <section>
                  <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2"><MapPin className="text-blue-600" size={24} /> Address</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2"><Input label="Full Address" name="address" value={formData.address} onChange={handleChange} /></div>
                    <Input label="City" name="city" value={formData.city} onChange={handleChange} />
                    <Input label="Pincode" name="pincode" value={formData.pincode} onChange={handleChange} />
                  </div>
                </section>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AddStudent;