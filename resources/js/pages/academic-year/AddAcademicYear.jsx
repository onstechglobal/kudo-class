import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  CalendarDays,
  Save,
  ArrowLeft,
  Clock,
  Loader2,
  School,
  Info
} from 'lucide-react';

import AdminLayout from '../../layouts/AdminLayout';
import Input from '../../components/form/Input';
import CustomSelect from '../../components/form/CustomSelect';
import { Api_url } from '../../helpers/api';

const AddAcademicYear = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
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
        const response = await axios.get(`${Api_url.name}school_data?all=1`);
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

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { data: tokenData } = await axios.get(
        `${Api_url.name}csrf-token`,
        { withCredentials: true }
      );

      const response = await axios.post(
        `${Api_url.name}save-academic-year`,
        formData,
        {
          headers: { 'X-CSRF-TOKEN': tokenData.token },
          withCredentials: true
        }
      );

      if (response.data.status === 200) {
        navigate('/academic-year');
      }
    } catch (error) {
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
              <div className="flex items-center gap-4">
                <Link to="/academic-year">
                  <button
                    type="button"
                    className="p-2 hover:bg-gray-100 rounded-full text-gray-400"
                  >
                    <ArrowLeft size={20} />
                  </button>
                </Link>

                <div>
                  <nav className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">
                    <Link
                      to="/academic-year"
                      className="hover:text-blue-800 transition-colors"
                    >
                      Academic Years
                    </Link>
                    <span className="text-gray-400 mx-2">/</span>
                    <button className="cursor-pointer uppercase font-bold">
                      New
                    </button>
                  </nav>
                  <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                    New Academic Year
                  </h1>
                </div>
              </div>

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
          <div className="p-0 sm:p-8 max-w-[1600px] mx-auto">
            <div className="sm:grid sm:grid-cols-12 sm:gap-8">
              {/* LEFT CARD */}
              <div className="py-8 sm:py-0 col-span-12 lg:col-span-3">
                <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm text-center sticky top-8">
                  <div className="w-32 h-32 mx-auto mb-6 bg-blue-50 rounded-3xl flex items-center justify-center">
                    <CalendarDays size={48} className="text-blue-600" />
                  </div>
                  <h3 className="text-lg font-black text-gray-900 mb-2">
                    Academic Session
                  </h3>
                  <p className="text-sm text-gray-500">
                    Define the academic cycle used for attendance, exams and
                    fees.
                  </p>

                </div>
              </div>

              {/* RIGHT FORM */}
              <div className="col-span-12 lg:col-span-9">
                <div className="bg-white rounded-[2.5rem] p-10 border border-gray-200 shadow-sm space-y-12">
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
                        onChange={(val) =>
                          handleSelectChange('status', val)
                        }
                      />

                      <Input
                        label="Academic Year Name"
                        name="year_name"
                        placeholder="2025-26"
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        type="date"
                        label="Start Date"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleChange}
                        error={errors.start_date}
                        className="cursor-pointer"
                      />

                      <Input
                        type="date"
                        label="End Date"
                        name="end_date"
                        value={formData.end_date}
                        onChange={handleChange}
                        error={errors.end_date}
                        className="cursor-pointer"
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

export default AddAcademicYear;
