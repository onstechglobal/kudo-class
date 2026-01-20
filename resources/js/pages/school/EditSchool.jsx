import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  School, Calendar, MapPin, Settings, Phone, Save, Camera, ArrowLeft, Mail, Loader2, BookOpen
} from 'lucide-react';
import AdminLayout from '../../Layouts/AdminLayout';
import InputField from '../../components/school/InputField';
import SelectField from '../../components/school/SelectField';
import CustomButton from '../../components/form/CustomButton';
import { Api_url } from '../../helpers/api';


const EditSchool = () => {

  const unscrambleId = (scrambled) => {
    try {
      // 1. Decode Base64
      const decoded = atob(scrambled);
      // 2. Extract the hex between 'sc_' and '_x9'
      const hex = decoded.split('_')[1];
      // 3. Convert back to Number
      return parseInt(hex, 16);
    } catch (e) {
      return null;
    }
  };

  const { id } = useParams();
  const decodedId = unscrambleId(id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [formData, setFormData] = useState({
    school_name: '',
    email: '',
    phone: '',
    alternate_phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    board: '',
    logo_url: '',
    academic_start_month: 4,
    status: 'active'
  });




  useEffect(() => {
    setLoading(true);
    const fetchSchool = async () => {
      try {
        const response = await axios.get(`${Api_url.name}get-school/${decodedId}`);
        if (response.data) {
          setFormData(response.data);
          if (response.data.logo_url) {
            setPreviewUrl(`${Api_url.name}storage/${response.data.logo_url}`);
          }
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setFetching(false);
        setTimeout(() => {
          setLoading(false);
        }, 200);
      }
    };
    fetchSchool();
  }, [id]);


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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    const dataToSend = new FormData();
    dataToSend.append('_method', 'PUT');

    Object.keys(formData).forEach((key) => {
      if (key !== 'logo_url' && formData[key] !== null) {
        dataToSend.append(key, formData[key]);
      }
    });

    if (selectedFile) {
      dataToSend.append('school_logo', selectedFile);
    }

    try {
      const { data: csrf } = await axios.get(`${Api_url.name}csrf-token`);
      const response = await axios.post(`${Api_url.name}update-school/${decodedId}`, dataToSend, {
        headers: {
          'X-CSRF-TOKEN': csrf.token,
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });

      if (response.data.status === 200) {
        alert("School Updated Successfully!");
        navigate('/schools');
      }

    } catch (error) {
      console.error("Error details:", error.response?.data);
      alert("Update failed.");
      setLoading(false);
    } finally {
      setLoading(true);
    }
  };
  //if (fetching) return <div className="p-10 text-center font-bold">Loading School Data...</div>;

  return (
    <AdminLayout>
      <div className={`bg-[#F8FAFC] min-h-screen relative ${loading ? 'overflow-hidden max-h-screen' : ''}`}>

        {/* --- IN-DIV PRELOADER --- */}
        {loading && (
          /* The z-index 50 ensures it stays above form content but below Sidebar (usually z-40) */
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#F8FAFC] min-h-[80vh]">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
              <p className="text-sm font-bold text-gray-600 animate-pulse tracking-widest uppercase">
                Please Wait...
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* --- HEADER --- */}
          <div className="bg-white border-b border-gray-200 px-8 py-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Link to="/schools">
                  <button type="button" className="p-2 hover:bg-gray-100 rounded-full text-gray-400 cursor-pointer">
                    <ArrowLeft size={20} />
                  </button>
                </Link>
                <div>
                  <nav className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">
                    Schools / Edit
                  </nav>
                  <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                    {formData.school_name || "Edit School"}
                  </h1>
                </div>
              </div>

              <CustomButton
                text="Update School Record"
                Icon={Save}
                className="bg-[#faae1c] text-white hover:bg-[#faae1c]/85"
                to="#"
                type="submit"
              />

            </div>
          </div>

          <div className=" relative p-8 max-w-[1600px] mx-auto">
            <div className="grid grid-cols-12 gap-8">

              {/* --- LEFT SIDE: LOGO --- */}
              <div className="col-span-12 lg:col-span-3">
                <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm text-center sticky top-8">
                  <div className="relative w-40 h-40 mx-auto mb-6 group">
                    <div className="w-full h-full rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                      {previewUrl ? (
                        <img src={previewUrl} className="w-full h-full object-cover" alt="Logo" />
                      ) : (
                        <School size={48} className="text-gray-200" />
                      )}
                    </div>
                    <label className="absolute -bottom-2 -right-2 p-3 bg-blue-600 text-white rounded-xl shadow-lg border-4 border-white cursor-pointer hover:bg-blue-700">
                      <Camera size={20} />
                      <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                    </label>
                  </div>
                  <h3 className="text-lg font-black text-gray-900">School Logo</h3>
                </div>
              </div>

              {/* --- RIGHT SIDE: FORM FIELDS --- */}
              <div className="col-span-12 lg:col-span-9">
                <div className="bg-white rounded-[2.5rem] p-10 border border-gray-200 shadow-sm space-y-12">

                  {/* Basic Details */}
                  <section>
                    <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                      <School className="text-blue-600" size={24} /> Basic Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputField label="School Name" name="school_name" value={formData.school_name} onChange={handleChange} />
                      <InputField label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} icon={<Mail size={16} />} />
                      <InputField label="Phone" name="phone" value={formData.phone} onChange={handleChange} icon={<Phone size={16} />} />
                      <InputField label="Alt. Phone" name="alternate_phone" value={formData.alternate_phone} onChange={handleChange} />

                      {/* BOARD FIELD */}
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Education Board</label>
                        <div className="relative">
                          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                            <BookOpen size={16} />
                          </div>
                          <select
                            name="board"
                            value={formData.board}
                            onChange={handleChange}
                            className="w-full pl-12 px-5 py-4 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold text-gray-800 focus:bg-white focus:border-blue-500 outline-none appearance-none cursor-pointer"
                          >
                            <option value="">Select Board</option>
                            <option value="CBSE">CBSE</option>
                            <option value="ICSE">ICSE</option>
                            <option value="STATE">State Board</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Address Section */}
                  <section>
                    <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                      <MapPin className="text-blue-600" size={24} /> Address Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <InputField label="Address Line 1" name="address_line1" value={formData.address_line1} onChange={handleChange} />
                      </div>
                      <div className="md:col-span-2">
                        <InputField label="Address Line 2" name="address_line2" value={formData.address_line2} onChange={handleChange} />
                      </div>
                      <InputField label="City" name="city" value={formData.city} onChange={handleChange} />
                      <InputField label="State" name="state" value={formData.state} onChange={handleChange} />
                      <div className="grid grid-cols-2 gap-4">
                        <InputField label="Country" name="country" value={formData.country} onChange={handleChange} />
                        <InputField label="Pincode" name="pincode" value={formData.pincode} onChange={handleChange} />
                      </div>
                    </div>
                  </section>

                  {/* Configuration Section */}
                  <section className="pt-8 border-t border-gray-100">
                    <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                      <Settings className="text-blue-600" size={24} /> Configuration
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Academic Start Month</label>
                        <div className="relative">
                          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                            <Calendar size={16} />
                          </div>
                          <select
                            name="academic_start_month"
                            value={formData.academic_start_month}
                            onChange={handleChange}
                            className="w-full pl-12 px-5 py-4 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold text-gray-800 focus:bg-white focus:border-blue-500 outline-none appearance-none cursor-pointer"
                          >
                            <option value="1">January</option>
                            <option value="2">February</option>
                            <option value="3">March</option>
                            <option value="4">April</option>
                            <option value="5">May</option>
                            <option value="6">June</option>
                            <option value="7">July</option>
                            <option value="8">August</option>
                            <option value="9">September</option>
                            <option value="10">October</option>
                            <option value="11">November</option>
                            <option value="12">December</option>
                            {/* add other months as needed */}
                          </select>
                        </div>
                      </div>
                      <SelectField label="Status" name="status" value={formData.status} onChange={handleChange} options={['Active', 'Inactive']} />
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

export default EditSchool;