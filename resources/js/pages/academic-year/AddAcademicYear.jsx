import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  CalendarDays,
  Save,
  Clock,
  Loader2,
  School,
  XCircle
} from 'lucide-react';

import AdminLayout from '../../layouts/AdminLayout';
import Input from '../../components/form/Input';
import CustomSelect from '../../components/form/CustomSelect';
import { Api_url } from '../../helpers/api';
import PageHeader from '../../components/common/PageHeader';
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

const AddAcademicYear = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverWarning, setServerWarning] = useState(""); // State for "Try again" msg
  const [schools, setSchools] = useState([]);

  const [formData, setFormData] = useState({
    school_id: '',
    year_name: '',
    start_date: '',
    end_date: '',
    status: 'active'
  });

  /* ---------------- OPTIONS ---------------- */
  const statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' }
  ];

  /* ---------------- FETCH SCHOOLS ---------------- */
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await axios.get(`${Api_url.name}api/school_data?all=1`);
        const schoolOptions = response.data.data.map(school => ({
          label: school.school_name,
          value: school.school_id
        }));
        setSchools(schoolOptions);
      } catch (error) {
        console.error("Error fetching schools:", error);
      }
    };
    fetchSchools();
  }, []);

  /* ---------------- VALIDATION ---------------- */
  const validateForm = () => {
    let newErrors = {};

    if (!formData.school_id) newErrors.school_id = 'School is required';
    if (!formData.year_name.trim())
      newErrors.year_name = 'Academic year name is required';
    if (!formData.start_date)
      newErrors.start_date = 'Start date is required';
    if (!formData.end_date)
      newErrors.end_date = 'End date is required';

    if (
      formData.start_date &&
      formData.end_date &&
      new Date(formData.start_date) >= new Date(formData.end_date)
    ) {
      newErrors.end_date = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  // Helper to format date to YYYY-MM-DD
  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const handleStartDate = (date) => {
    const formatted = formatDate(date);
    setFormData((prev) => ({ ...prev, start_date: formatted }));
    if (errors.start_date) setErrors((prev) => ({ ...prev, start_date: null }));
  };

  const handleEndDate = (date) => {
    const formatted = formatDate(date);
    setFormData((prev) => ({ ...prev, end_date: formatted }));
    if (errors.end_date) setErrors((prev) => ({ ...prev, end_date: null }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setServerWarning(""); // Reset warning on new attempt

    try {
      const { data: tokenData } = await axios.get(
        `${Api_url.name}api/csrf-token`,
        { withCredentials: true }
      );

      const response = await axios.post(
        `${Api_url.name}api/save-academic-year`,
        formData,
        {
          headers: { 'X-CSRF-TOKEN': tokenData.token },
          withCredentials: true
        }
      );

      if (response.data && response.data.status === 200) {
        navigate('/academic-year', {
          state: { status: 'success', message: 'Academic Year inserted successfully!' }
        });
      } else {
        // Handle PHP returning an error status
        setServerWarning(response.data.message || "Failed to save. Please try again.");
      }
    } catch (error) {
      // Handle Network/Server errors
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
      <div className="bg-[#F8FAFC] min-h-screen p-6">
        <form onSubmit={handleSubmit}>
          {/* ---------- HEADER ---------- */}
          <div className="bg-white border-b border-gray-200 px-8 py-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <PageHeader
                prevRoute="/academic-year"
                breadcrumbParent="Academic Years"
                breadcrumbCurrent="New"
                title="New Academic Year"
              />

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-[#faae1c] hover:bg-[#faae1c] text-white px-7 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all active:scale-95 disabled:opacity-70 cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Save size={18} />
                  )}
                  Save Academic Year
                </button>
              </div>
            </div>
          </div>

          {/* ---------- BODY ---------- */}
          <div className="p-8 max-w-[1600px] mx-auto">

            {/* Server Error Message */}
            {serverWarning && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-xl flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <XCircle size={20} />
                  <span className="font-medium">{serverWarning}</span>
                </div>
                <button type="button" onClick={() => setServerWarning("")} className="text-red-400 hover:text-red-600">×</button>
              </div>
            )}

            <div className="grid grid-cols-12">
              <div className="col-span-12">
                <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm space-y-12">
                  {/* BASIC */}
                  <section>
                    <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                      <School className="text-blue-600" size={24} />
                      Basic Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <CustomSelect
                        label="Select School"
                        options={schools}
                        value={formData.school_id}
                        onChange={(val) => handleSelectChange('school_id', val)}
                        error={errors.school_id}
                        placeholder="Choose a school..."
                      />

                      <CustomSelect
                        label="Status"
                        options={statusOptions}
                        value={formData.status}
                        onChange={(val) => handleSelectChange('status', val)}
                      />

                      <Input
                        label="Academic Year Name"
                        name="year_name"
                        placeholder="2026-27"
                        value={formData.year_name}
                        onChange={handleChange}
                        error={errors.year_name}
                      />
                    </div>
                  </section>

                  {/* DATES */}
                  <section className="pt-6 border-t border-gray-100">
                    <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                      <Clock className="text-blue-600" size={24} />
                      Session Duration
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

                      {/* START DATE */}
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Start Date</label>
                        <div className="relative">
                          <DatePicker
                            selected={formData.start_date ? new Date(formData.start_date) : null}
                            onChange={handleStartDate}
                            dateFormat="yyyy-MM-dd"
                            placeholderText="Select Start Date"
                            // This prevents keyboard input but allows the click to open the calendar
                            onKeyDown={(e) => e.preventDefault()}
                            autoComplete="off"
                            className={`w-full px-4 py-3 rounded-xl outline-none bg-gray-50 border cursor-pointer ${errors.start_date ? 'border-red-500' : 'border-transparent'
                              } focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all`}
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
                            dateFormat="yyyy-MM-dd"
                            placeholderText="Select End Date"
                            // This prevents keyboard input but allows the click to open the calendar
                            onKeyDown={(e) => e.preventDefault()}
                            autoComplete="off"
                            className={`w-full px-4 py-3 rounded-xl outline-none bg-gray-50 border cursor-pointer ${errors.end_date ? 'border-red-500' : 'border-transparent'
                              } focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all`}
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

export default AddAcademicYear;