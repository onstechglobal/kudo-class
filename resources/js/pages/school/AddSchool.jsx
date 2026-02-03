import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { School, Save, Camera, ArrowLeft, Clock, MapPin, CheckCircle2, Loader2 } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import Input from '../../components/form/Input';
import CustomSelect from '../../components/form/CustomSelect';
import CustomButton from '../../components/form/CustomButton';
import StaticButtons from "../../components/common/StaticButtons";
import { Api_url } from '../../helpers/api';
import PageHeader from '../../components/common/PageHeader';


function generatePassword(length = 10) {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$!";
  return Array.from({ length }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
}

const AddSchool = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false); // Success Modal State
  const [errors, setErrors] = useState({});
  const [serverWarning, setServerWarning] = useState("");

  const [formData, setFormData] = useState({
    school_name: '', email: '', phone: '', alternate_phone: '',
    address_line1: '', address_line2: '', city: '', state: '',
    country: 'India', pincode: '', board: '', logo_url: '',
    password: generatePassword(),
    academic_start_month: 4, status: 'active'
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

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


  const validateForm = () => {
    let newErrors = {};
    if (!formData.school_name.trim()) newErrors.school_name = "School name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.board) newErrors.board = "Please select an education board";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.pincode.trim()) newErrors.pincode = "Pincode is required";

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
    setServerWarning(""); // Clear previous warnings
    if (!validateForm()) return;

    setLoading(true);
    const dataToSend = new FormData();
    Object.keys(formData).forEach(key => dataToSend.append(key, formData[key]));

    if (selectedFile) dataToSend.append('school_logo', selectedFile);

    try {
      const { data: tokenData } = await axios.get(`${Api_url.name}api/csrf-token`);
      const response = await axios.post(`${Api_url.name}api/schooldata`, dataToSend, {
        headers: {
          'X-CSRF-TOKEN': tokenData.token,
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true
      });

      if (response.data.status === 200) {
        navigate('/school', { 
          state: { status: 'success', message: 'Data inserted successfully!' } 
        });
      } else if (response.data.status === 409) {
        // Set the warning message instead of an alert
        setServerWarning(response.data.message);
      }
    } catch (error) {
      setServerWarning("An error occurred while saving. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <AdminLayout>
      <div className="bg-[#F8FAFC] min-h-screen p-6">
        <form id="school-reg-form" onSubmit={handleSubmit}>
          {/* Header */}
          {/* --- HEADER --- */}
          <div className="bg-white border-b border-gray-200 px-8 py-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

              <PageHeader
                prevRoute="/school"
                breadcrumbParent="Schools"
                breadcrumbCurrent="New"
                title="New School Registration"
              />
            </div>
          </div>

          {/* --- FORM BODY --- */}
          <div className="py-0 sm:p-8 max-w-[1600px] mx-auto">
            <div className="sm:grid sm:grid-cols-12 sm:gap-8">
              <div className="py-8 sm:py-0 col-span-12 md:col-span-4 xl:col-span-3">
                <div className="bg-white rounded-3xl p-4 border border-gray-200 shadow-sm text-center">

                  <div className="relative w-40 h-40 mx-auto mb-6">
                    <div className="w-full h-full rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <AvatarLetter text="School" />
                      )}
                    </div>

                    <label className="absolute -bottom-2 -right-2 p-3 bg-blue-600 text-white rounded-xl cursor-pointer hover:bg-blue-700 transition">
                      <Camera size={20} />
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mt-2">School Logo</h3>
                </div>
              </div>

              <div className="col-span-12 md:col-span-8 xl:col-span-9">
                <div className="bg-white rounded-[2.5rem] p-10 border border-gray-200 shadow-sm space-y-12">
                  <section>
                    <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2"><School className="text-blue-600" size={24} /> Basic Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input label="School Name" name="school_name" value={formData.school_name} onChange={handleChange} error={errors.school_name} />
                      <Input label="Email Address" name="email" value={formData.email} onChange={handleChange} error={errors.email} />
                      <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} error={errors.phone} />
                      <Input label="Alt. Phone" name="alternate_phone" value={formData.alternate_phone} onChange={handleChange} />
                      <CustomSelect label="Affiliated Board" options={boardOptions} value={formData.board} onChange={(val) => handleSelectChange('board', val)} error={errors.board} />
                    </div>
                    <div className="hidden">
                      <Input label="" type="hidden" name="password" value={formData.password} />
                    </div>
                  </section>

                  <section>
                    <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2"><MapPin className="text-blue-600" size={24} /> Address</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2"><Input label="Address Line 1" name="address_line1" value={formData.address_line1} onChange={handleChange} /></div>
                      <Input label="City" name="city" value={formData.city} onChange={handleChange} error={errors.city} />
                      <Input label="Pincode" name="pincode" value={formData.pincode} onChange={handleChange} error={errors.pincode} />
                      <Input label="State" name="state" value={formData.state} onChange={handleChange} />
                      <Input label="Country" name="country" value={formData.country} onChange={handleChange} />
                    </div>
                  </section>

                  <section className="pt-6 border-t border-gray-100">
                    <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2"><Clock className="text-blue-600" size={24} /> Configuration</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <CustomSelect label="Academic Start Month" options={monthOptions} value={formData.academic_start_month} onChange={(val) => handleSelectChange('academic_start_month', val)} />
                      <CustomSelect label="Status" options={statusOptions} value={formData.status} onChange={(val) => handleSelectChange('status', val)} />
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>

          {/* --- CUSTOM SUCCESS MODAL --- */}
          {/*{showSuccessModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-[2rem] p-10 max-w-sm w-full shadow-2xl text-center transform transition-all animate-in zoom-in duration-300">
                <div className="mx-auto mb-5 flex h-[60px] w-[60px] items-center justify-center rounded-full border-2 border-[#faae1c] bg-[#faae1c]/30 text-red-600 text-red-500">
                  <CheckCircle2 className="h-8 w-8 text-[#faae1c]" />
                </div>
                <h3 className="mb-2 text-2xl font-semibold text-neutral-900">Added Successfully!</h3>
                <p className="text-gray-500 mb-8 font-medium">
                  The school record has been successfully added to the system.
                </p>
                <button
                  onClick={() => navigate('/school')}
                  className="w-[50%] py-3 bg-[#faae1c] text-white font-bold hover:bg-[#faae1c]/90 transition-colors shadow-lg shadow-gray-200 rounded-lg  px-4 py-3 text-sm font-semibold cursor-pointer"
                >
                  OK
                </button>
              </div>
            </div>
          )} */}
          <StaticButtons saveText="Save School Record" saveClick={handleSubmit} dataLoading={loading} error={serverWarning} />
        </form>
      </div>
    </AdminLayout>
  );
};

export default AddSchool;

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
