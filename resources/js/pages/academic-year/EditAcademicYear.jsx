import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { CalendarDays, Save, Clock, Loader2, School, XCircle } from 'lucide-react';

import AdminLayout from '../../layouts/AdminLayout';
import Input from '../../components/form/Input';
import CustomSelect from '../../components/form/CustomSelect';
import { Api_url } from '../../helpers/api';
import PageHeader from '../../components/common/PageHeader';
import EditPreloader from '../../components/common/EditPreloader';
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

const EditAcademicYear = () => {
  const navigate = useNavigate();
  const { id: scrambledId } = useParams();

  const [loading, setLoading] = useState(false);
  const [loading1, setLoading1] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errors, setErrors] = useState({});
  const [serverWarning, setServerWarning] = useState(""); // Try again msg state
  const [schools, setSchools] = useState([]);

  const [formData, setFormData] = useState({
    school_id: '',
    year_name: '',
    start_date: '',
    end_date: '',
    status: 'active'
  });

  const statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' }
  ];

  const unscrambleId = (scrambled) => {
    try {
      const decoded = atob(scrambled);
      const match = decoded.match(/ay_(.*)_z2/);
      if (match && match[1]) {
        return parseInt(match[1], 16);
      }
    } catch (e) {
      console.error("Failed to unscramble ID", e);
      return null;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setFetching(true);
      try {
        const schoolRes = await axios.get(`${Api_url.name}api/school_data?all=1`);
        const schoolOptions = schoolRes.data.data.map(school => ({
          label: school.school_name,
          value: school.school_id
        }));
        setSchools(schoolOptions);

        const realId = unscrambleId(scrambledId);
        if (realId) {
          const res = await axios.get(`${Api_url.name}api/get-academic-year/${realId}`);
          const yearData = res.data.data;
          setFormData({
            school_id: yearData.school_id,
            year_name: yearData.year_name,
            start_date: yearData.start_date,
            end_date: yearData.end_date,
            status: yearData.is_active == 1 ? 'active' : 'inactive'
          });
        }
      } catch (error) {
        console.error("Load Error:", error);
      } finally {
        setTimeout(() => setFetching(false), 100);
      }
    };
    loadData();
  }, [scrambledId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  // Date Formatting Helper
  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const handleStartDate = (d) => {
    const formatted = formatDate(d);
    setFormData((prev) => ({ ...prev, "start_date": formatted }));
    if (errors["start_date"]) setErrors((prev) => ({ ...prev, "start_date": null }));
  };

  const handleEndDate = (d) => {
    const formatted = formatDate(d);
    setFormData((prev) => ({ ...prev, "end_date": formatted }));
    if (errors["end_date"]) setErrors((prev) => ({ ...prev, "end_date": null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading1(true);
    setServerWarning(""); 
    const realId = unscrambleId(scrambledId);

    try {
      const { data: tokenData } = await axios.get(`${Api_url.name}api/csrf-token`, { withCredentials: true });
      const response = await axios.post(`${Api_url.name}api/update-academic-year/${realId}`, formData, {
        headers: { 'X-CSRF-TOKEN': tokenData.token },
        withCredentials: true
      });

      if (response.data.status === 200) {
        navigate('/academic-year', {
          state: { status: 'success', message: 'Academic year updated successfully!' }
        });
      } else {
        setServerWarning(response.data.message || "Update failed. Please try again.");
      }
    } catch (error) {
      setServerWarning("Something went wrong. Please try again.");
      if (error.response?.data?.errors) setErrors(error.response.data.errors);
    } finally {
      setLoading1(false);
    }
  };

  const isGlobalLoading = fetching || loading;

  return (
    <AdminLayout>
      <div className="bg-[#F8FAFC] min-h-screen font-sans p-6">
        <form onSubmit={handleSubmit}>
          {/* HEADER */}
          <div className="bg-white border-b border-gray-200 px-8 py-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <PageHeader
                prevRoute="/academic-year"
                breadcrumbParent="Academic Years"
                breadcrumbCurrent="Edit"
                title="Edit Academic Year"
              />
              <button
                type="submit"
                disabled={isGlobalLoading || loading1}
                className="flex items-center gap-2 bg-[#faae1c] text-white px-7 py-2.5 rounded-xl font-bold shadow-lg active:scale-95 disabled:opacity-70 cursor-pointer"
              >
                {loading1 ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Update Academic Year
              </button>
            </div>
          </div>

          <div className="relative min-h-[calc(100vh-100px)] p-8 max-w-[1600px] mx-auto">
            {isGlobalLoading && <EditPreloader />}

            {/* Error Message */}
            {serverWarning && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-xl flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <XCircle size={20} />
                  <span className="font-medium">{serverWarning}</span>
                </div>
                <button type="button" onClick={() => setServerWarning("")} className="text-red-400 hover:text-red-600">×</button>
              </div>
            )}

            <div className="sm:grid sm:grid-cols-12 sm:gap-8">
              <div className="col-span-12">
                <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm space-y-12">
                  <section>
                    <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                      <School className="text-blue-600" size={24} /> Basic Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <CustomSelect label="Select School" options={schools} value={formData.school_id} onChange={(val) => handleSelectChange('school_id', val)} error={errors.school_id} />
                      <CustomSelect label="Status" options={statusOptions} value={formData.status} onChange={(val) => handleSelectChange('status', val)} />
                      <Input label="Academic Year Name" name="year_name" value={formData.year_name} onChange={handleChange} error={errors.year_name} />
                    </div>
                  </section>

                  <section className="pt-6 border-t border-gray-100">
                    <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                      <Clock className="text-blue-600" size={24} /> Session Duration
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                      {/* START DATE */}
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Start Date</label>
                        <div className="relative">
                          <DatePicker
                            selected={formData.start_date ? new Date(formData.start_date) : null}
                            onChange={handleStartDate}
                            onKeyDown={(e) => e.preventDefault()} // Disables typing
                            dateFormat="yyyy-MM-dd"
                            placeholderText="Select Start Date"
                            autoComplete="off"
                            className={`w-full px-4 py-3 rounded-xl outline-none bg-gray-50 border cursor-pointer ${errors.start_date ? 'border-red-500' : 'border-transparent'} focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all`}
                            wrapperClassName="w-full"
                          />
                        </div>
                        {errors.start_date && <p className="text-red-500 text-xs mt-1 ml-1">{errors.start_date}</p>}
                      </div>

                      {/* END DATE */}
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">End Date</label>
                        <div className="relative">
                          <DatePicker
                            selected={formData.end_date ? new Date(formData.end_date) : null}
                            onChange={handleEndDate}
                            onKeyDown={(e) => e.preventDefault()} // Disables typing
                            dateFormat="yyyy-MM-dd"
                            placeholderText="Select End Date"
                            autoComplete="off"
                            className={`w-full px-4 py-3 rounded-xl outline-none bg-gray-50 border cursor-pointer ${errors.end_date ? 'border-red-500' : 'border-transparent'} focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all`}
                            wrapperClassName="w-full"
                          />
                        </div>
                        {errors.end_date && <p className="text-red-500 text-xs mt-1 ml-1">{errors.end_date}</p>}
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

export default EditAcademicYear;