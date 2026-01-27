import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { CalendarDays, Save, ArrowLeft, Clock, Loader2, School } from 'lucide-react';

import AdminLayout from '../../layouts/AdminLayout';
import Input from '../../components/form/Input';
import CustomSelect from '../../components/form/CustomSelect';
import { Api_url } from '../../helpers/api';

const EditAcademicYear = () => {
  const navigate = useNavigate();
  const { id: scrambledId } = useParams();

  const [loading, setLoading] = useState(false);
  const [loading1, setLoading1] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errors, setErrors] = useState({});
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
        const schoolRes = await axios.get(`${Api_url.name}school_data?all=1`);
        const schoolOptions = schoolRes.data.data.map(school => ({
          label: school.school_name,
          value: school.school_id
        }));
        setSchools(schoolOptions);

        const realId = unscrambleId(scrambledId);
        if (realId) {
          const res = await axios.get(`${Api_url.name}get-academic-year/${realId}`);
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
        // Short delay for smooth transition
        setTimeout(() => setFetching(false), 100);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading1(true);
    const realId = unscrambleId(scrambledId);

    try {
      const { data: tokenData } = await axios.get(`${Api_url.name}csrf-token`, { withCredentials: true });
      const response = await axios.post(`${Api_url.name}update-academic-year/${realId}`, formData, {
        headers: { 'X-CSRF-TOKEN': tokenData.token },
        withCredentials: true
      });
      if (response.data.status === 200) navigate('/academic-year');
    } catch (error) {
      if (error.response?.data?.errors) setErrors(error.response.data.errors);
    } finally {
      setLoading1(false);
    }
  };

  // We combine fetching and loading to show the same preloader style
  const isGlobalLoading = fetching || loading;
  const isGlobalLoading1 = loading1;

  return (
    <AdminLayout>
      <div className="bg-[#F8FAFC] min-h-screen font-sans p-6">
        <form onSubmit={handleSubmit}>

          {/* --- FIXED HEADER --- */}
          <div className="bg-white border-b border-gray-200 px-8 py-5 sticky top-0 z-30">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Link to="/academic-year">
                  <button type="button" className="p-2 hover:bg-gray-100 rounded-full text-gray-400 cursor-pointer">
                    <ArrowLeft size={20} />
                  </button>
                </Link>
                <div>
                  <nav className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">
                    <Link to="/academic-year" className="cursor-pointer hover:text-blue-800 transition-colors"> Academic Years </Link>
                    <span className="text-gray-400 mx-2">/</span>
                    <button className="cursor-pointer uppercase font-bold">EDIT</button>
                  </nav>
                  <h1 className="text-2xl font-black text-gray-900 tracking-tight">Edit Academic Year</h1>
                </div>
              </div>
              <button
                type="submit"
                disabled={isGlobalLoading}
                className="flex items-center gap-2 bg-[#faae1c] text-white px-7 py-2.5 rounded-xl font-bold shadow-lg active:scale-95 disabled:opacity-70 cursor-pointer"
              >
                {isGlobalLoading1 ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Update Academic Year
              </button>
            </div>
          </div>

          {/* --- LOWER CONTENT AREA --- */}
          <div className="relative min-h-[calc(100vh-100px)]">

            {/* FIXED PRELOADER: Visible even while scrolling, below the header */}
            {isGlobalLoading && (
              <div className="fixed top-[97px] left-0 right-0 bottom-0 z-50 flex flex-col items-center justify-center bg-[#F8FAFC]/90 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-4 -mt-32">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-[#faae1c]"></div>
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-widest animate-pulse">
                    Please Wait...
                  </p>
                </div>
              </div>
            )}

            <div className="p-0 sm:p-8 max-w-[1600px] mx-auto">
              <div className="sm:grid sm:grid-cols-12 sm:gap-8">
                <div className="py-8 sm:py-0 col-span-12 lg:col-span-3">
                  <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm text-center sticky top-28">
                    <div className="w-32 h-32 mx-auto mb-6 bg-blue-50 rounded-3xl flex items-center justify-center">
                      <CalendarDays size={48} className="text-blue-600" />
                    </div>
                    <h3 className="text-lg font-black text-gray-900 mb-2">Modify Session</h3>
                    <p className="text-sm text-gray-500">Update the dates or name for this specific school cycle.</p>
                  </div>
                </div>

                <div className="col-span-12 lg:col-span-9">
                  <div className="bg-white rounded-[2.5rem] p-10 border border-gray-200 shadow-sm space-y-12">
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input type="date" label="Start Date" name="start_date" value={formData.start_date} onChange={handleChange} error={errors.start_date} className="cursor-pointer" />
                        <Input type="date" label="End Date" name="end_date" value={formData.end_date} onChange={handleChange} error={errors.end_date} className="cursor-pointer" />
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

export default EditAcademicYear;