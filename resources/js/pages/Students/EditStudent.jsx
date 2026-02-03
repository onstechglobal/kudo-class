import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { User, Save, Camera, GraduationCap, School, Loader2, XCircle } from 'lucide-react';

import AdminLayout from '../../layouts/AdminLayout';
import Input from '../../components/form/Input';
import CustomSelect from '../../components/form/CustomSelect';
import { Api_url } from '../../helpers/api';
import PageHeader from '../../components/common/PageHeader';

const EditStudent = () => {
  const navigate = useNavigate();
  const { id: scrambledId } = useParams();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errors, setErrors] = useState({});
  const [serverWarning, setServerWarning] = useState("");
  const [schools, setSchools] = useState([]);
  
  // Image states
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // Parent Suggestion State
  const [parentSearch, setParentSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [formData, setFormData] = useState({
    school_id: '', admission_no: '', roll_no: '',
    first_name: '', last_name: '', gender: '', dob: '', 
    status: 'active', parent_id: '', emergency_contact: ''
  });

  const unscrambleId = (scrambled) => {
    try {
      const decoded = atob(scrambled);
      const match = decoded.match(/std_(.*)_z2/);
      return match ? parseInt(match[1], 16) : null;
    } catch (e) { return null; }
  };

  // Fetch Initial Data
  useEffect(() => {
    const loadData = async () => {
      setFetching(true);
      try {
        const schoolRes = await axios.get(`${Api_url.name}school_data?all=1`);
        setSchools(schoolRes.data.data.map(s => ({ label: s.school_name, value: s.school_id })));

        const realId = unscrambleId(scrambledId);
        if (realId) {
          const res = await axios.get(`${Api_url.name}get-student/${realId}`);
          const std = res.data.data;
          setFormData({
             ...std,
             parent_id: std.parent_id || '' 
          });
          if (std.parent_name) setParentSearch(std.parent_name);
          if (std.photo_url) setPreviewUrl(std.photo_url);
        }
      } catch (error) {
        console.error("Load Error:", error);
      } finally {
        setFetching(false);
      }
    };
    loadData();
  }, [scrambledId]);

  // Parent Search Logic
  useEffect(() => {
    const fetchParents = async () => {
      if (parentSearch.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await axios.get(`${Api_url.name}api/parents/search?q=${parentSearch}`);
        setSuggestions(res.data);
      } catch (err) { console.error(err); }
    };
    const timer = setTimeout(fetchParents, 300);
    return () => clearTimeout(timer);
  }, [parentSearch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.first_name?.trim()) newErrors.first_name = "First name is required";
    if (!formData.admission_no?.trim()) newErrors.admission_no = "Admission number is required";
    if (!formData.school_id) newErrors.school_id = "Please select a school";
    if (!formData.parent_id) newErrors.parent_id = "Please select a parent";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setServerWarning("");
    const realId = unscrambleId(scrambledId);

    const dataToSend = new FormData();
    Object.keys(formData).forEach(key => dataToSend.append(key, formData[key]));
    if (selectedFile) dataToSend.append('photo_url', selectedFile);

    try {
      const response = await axios.post(`${Api_url.name}update-student/${realId}`, dataToSend);
      if (response.data.status === 200) navigate('/students');
      else setServerWarning(response.data.message);
    } catch (error) {
      setServerWarning("An error occurred during update.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="bg-[#F8FAFC] min-h-screen p-6">
        <form onSubmit={handleSubmit}>
          
          {/* HEADER */}
          <div className="bg-white border-b border-gray-200 px-8 py-5 sticky top-0 z-30">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <PageHeader prevRoute="/students" breadcrumbParent="Students" breadcrumbCurrent="Edit" title="Edit Profile" />
              <button type="submit" disabled={fetching || loading} className="flex items-center gap-2 bg-[#faae1c] text-white px-7 py-2.5 rounded-xl font-bold shadow-lg disabled:opacity-70">
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Update Profile
              </button>
            </div>
          </div>

          <div className="p-8 max-w-[1600px] mx-auto space-y-6">
            {serverWarning && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3"><XCircle size={20} /><span>{serverWarning}</span></div>
              </div>
            )}

            <div className="grid grid-cols-12 gap-8">
              {/* Photo Upload */}
              <div className="col-span-12 lg:col-span-3">
                <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm text-center">
                  <div className="relative w-40 h-40 mx-auto mb-6">
                    <div className="w-full h-full rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                      {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" alt="Student" /> : <div className="text-5xl font-black text-white bg-[#FAAE1C] w-full h-full flex items-center justify-center">S</div>}
                    </div>
                    <label className="absolute -bottom-2 -right-2 p-3 bg-blue-600 text-white rounded-xl cursor-pointer shadow-lg">
                      <Camera size={20} /><input type="file" hidden accept="image/*" onChange={(e) => { setSelectedFile(e.target.files[0]); setPreviewUrl(URL.createObjectURL(e.target.files[0])); }} />
                    </label>
                  </div>
                </div>
              </div>

              {/* Form Content */}
              <div className="col-span-12 lg:col-span-9 space-y-8">
                <div className="bg-white rounded-[2.5rem] p-10 border border-gray-200 shadow-sm space-y-12">
                  <section>
                    <h2 className="text-xl font-black mb-6 flex items-center gap-2"><GraduationCap className="text-blue-600" size={24} /> Academic & Parent</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <CustomSelect label="Assigned School *" options={schools} value={formData.school_id} onChange={(val) => setFormData({...formData, school_id: val})} error={errors.school_id} />
                      
                      {/* Parent Search */}
                      <div className="relative">
                        <Input label="Search Parent *" value={parentSearch} error={errors.parent_id} onChange={(e) => { setParentSearch(e.target.value); setShowSuggestions(true); }} />
                        {showSuggestions && suggestions.length > 0 && (
                          <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-xl mt-1 shadow-2xl max-h-48 overflow-y-auto">
                            {suggestions.map((p) => (
                              <div key={p.id} onClick={() => { setFormData({...formData, parent_id: p.id}); setParentSearch(`${p.first_name} ${p.last_name}`); setShowSuggestions(false); }} className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-0 flex justify-between">
                                <span className="font-bold">{p.first_name} {p.last_name}</span>
                                <span className="text-xs text-gray-500">{p.mobile}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </section>

                  <section className="pt-8 border-t border-gray-100">
                    <h2 className="text-xl font-black mb-6 flex items-center gap-2"><User className="text-blue-600" size={24} /> Personal Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Input label="First Name *" name="first_name" value={formData.first_name} onChange={handleChange} error={errors.first_name} />
                      <Input label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} />
                      <Input label="Admission No *" name="admission_no" value={formData.admission_no} onChange={handleChange} error={errors.admission_no} />
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