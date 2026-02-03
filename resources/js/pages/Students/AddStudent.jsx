import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { School, Save, Camera, User, Search, Loader2, XCircle } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import Input from '../../components/form/Input';
import CustomSelect from '../../components/form/CustomSelect';
import CustomButton from '../../components/form/CustomButton';
import { Api_url } from '../../helpers/api';
import PageHeader from '../../components/common/PageHeader';

const AddStudent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverWarning, setServerWarning] = useState("");

  // Image states
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Parent Suggestion State
  const [parentSearch, setParentSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [formData, setFormData] = useState({
    admission_no: '',
    roll_no: '',
    first_name: '',
    last_name: '',
    gender: 'male',
    dob: '',
    blood_group: '',
    class_id: '',
    section_id: '',
    status: 'active',
    parent_id: ''
  });

  // Parent Auto-suggestion Logic
  useEffect(() => {
    const fetchParents = async () => {
      if (parentSearch.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await axios.get(`${Api_url.name}api/parents/search?q=${parentSearch}`);
        setSuggestions(res.data);
      } catch (err) {
        console.error("Search error", err);
      }
    };
    const timer = setTimeout(fetchParents, 300);
    return () => clearTimeout(timer);
  }, [parentSearch]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  /* ---------------- VALIDATION ---------------- */
  const validateForm = () => {
    let newErrors = {};

    if (!formData.first_name.trim()) newErrors.first_name = "First name is required";
    if (!formData.admission_no.trim()) newErrors.admission_no = "Admission number is required";
    if (!formData.dob) newErrors.dob = "Date of Birth is required";
    if (!formData.parent_id) newErrors.parent_id = "Please select a parent from search results";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    // Check validation before proceeding
    if (!validateForm()) return;

    setLoading(true);
    setServerWarning(""); 

    const dataToSend = new FormData();
    Object.keys(formData).forEach(key => dataToSend.append(key, formData[key]));
    if (selectedFile) dataToSend.append('photo_url', selectedFile);

    try {
      const res = await axios.post(`${Api_url.name}api/students`, dataToSend);

      if (res.data && res.data.status === 200) {
        navigate('/students');
      } else {
        setServerWarning(res.data.message || "Failed to save. Please try again.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setServerWarning("Something went wrong. Please try again.");
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="bg-[#F8FAFC] min-h-screen">
        <form onSubmit={handleSubmit}>
          
          {/* HEADER */}
          <div className="bg-white border-b border-gray-200 px-8 py-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <PageHeader
                prevRoute="/students"
                breadcrumbParent="Students"
                breadcrumbCurrent="New"
                title="Add Student"
              />
              <CustomButton
                text={loading ? "Saving..." : "Save Student"}
                Icon={Save}
                onClick={handleSubmit}
                className="bg-[#faae1c] text-white"
                disabled={loading}
              />
            </div>
          </div>

          <div className="p-8 max-w-[1600px] mx-auto">
            
            {/* Server Error Alert */}
            {serverWarning && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-xl flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <XCircle size={20} />
                  <span className="font-medium">{serverWarning}</span>
                </div>
                <button type="button" onClick={() => setServerWarning("")} className="text-red-500 font-bold cursor-pointer px-2">X</button>
              </div>
            )}

            <div className="grid grid-cols-12 gap-8">
              {/* LEFT - IMAGE SECTION */}
              <div className="col-span-12 lg:col-span-3">
                <div className="bg-white rounded-3xl p-8 text-center sticky top-8 shadow-sm border border-gray-100">
                  <div className="relative w-40 h-40 mx-auto mb-6">
                    <div className="w-full h-full rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                      {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <AvatarLetter text={`${formData.first_name?.trim().charAt(0).toUpperCase() || "S"}`} />
                      )}
                    </div>
                    <label className="absolute -bottom-2 -right-2 p-3 bg-blue-600 text-white rounded-xl cursor-pointer hover:bg-blue-700 transition shadow-lg">
                      <Camera size={20} />
                      <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Student Photo</p>
                </div>
              </div>

              {/* RIGHT - FORM FIELDS */}
              <div className="col-span-12 lg:col-span-9">
                <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 space-y-12">
                  
                  {/* BASIC DETAILS SECTION */}
                  <section>
                    <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                      <User className="text-blue-600" size={24} /> Basic Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input label="First Name *" name="first_name" value={formData.first_name} onChange={handleChange} error={errors.first_name} />
                      <Input label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} />
                      <Input label="Admission No *" name="admission_no" value={formData.admission_no} onChange={handleChange} error={errors.admission_no} />
                      <Input label="Roll No" name="roll_no" value={formData.roll_no} onChange={handleChange} />
                      <Input label="DOB *" type="date" name="dob" value={formData.dob} onChange={handleChange} error={errors.dob} />
                      <CustomSelect
                        label="Gender"
                        options={[{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }]}
                        value={formData.gender}
                        onChange={(val) => setFormData({ ...formData, gender: val })}
                      />

                      {/* PARENT AUTO-SUGGESTION */}
                      <div className="relative md:col-span-1">
                        <Input
                          label="Parent Name *"
                          placeholder="Type at least 2 characters to search..."
                          value={parentSearch}
                          error={errors.parent_id}
                          onChange={(e) => {
                            setParentSearch(e.target.value);
                            setShowSuggestions(true);
                            if(errors.parent_id) setErrors(prev => ({...prev, parent_id: null}));
                          }}
                        />

                        {showSuggestions && suggestions.length > 0 && (
                          <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-xl mt-1 shadow-2xl max-h-48 overflow-y-auto">
                            {suggestions.map((p) => (
                              <div
                                key={p.id}
                                onClick={() => {
                                  setFormData({ ...formData, parent_id: p.id });
                                  setParentSearch(`${p.first_name} ${p.last_name || ''}`);
                                  setShowSuggestions(false);
                                }}
                                className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-0 flex justify-between items-center transition-colors"
                              >
                                <span className="font-bold text-gray-700">{p.first_name} {p.last_name}</span>
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">{p.mobile}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </section>

                  {/* CONFIGURATION SECTION */}
                  <section className="pt-10 border-t border-gray-100">
                    <h2 className="text-xl font-black mb-6 flex items-center gap-2 text-gray-800">
                      <School className="text-green-600" size={24} /> Configuration
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <CustomSelect 
                        label="Status" 
                        options={[{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }]} 
                        value={formData.status} 
                        onChange={(val) => setFormData({ ...formData, status: val })} 
                      />
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

export default AddStudent;

function AvatarLetter({ text }) {
  return (
    <div className="w-full h-full flex items-center justify-center text-white text-5xl font-black shadow-inner" style={{ backgroundColor: "#FAAE1C" }}>
      {text}
    </div>
  );
}