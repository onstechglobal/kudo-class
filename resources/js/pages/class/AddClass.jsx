import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Save, ArrowLeft, Loader2, School, LayoutGrid, ListOrdered, CheckCircle2, Layers, Hash, Bookmark } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import Input from '../../components/form/Input';
import CustomSelect from '../../components/form/CustomSelect';
import { Api_url } from '../../helpers/api';
import PageHeader from '../../components/common/PageHeader';

const AddClass = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [schools, setSchools] = useState([]); // To store schools from API
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    school_id: '',
    class_name: '',
    numeric_value: '', // Added: For logical sorting (e.g. 1, 2, 10)
    department: 'General', // Added: For grouping (Primary, Secondary, etc.)
    class_order: '', 
    status: 'active'
  });

  /* ---------------- OPTIONS ---------------- */
  const statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' }
  ];

  const departmentOptions = [
    { label: 'General', value: 'General' },
    { label: 'Pre-Primary', value: 'Pre-Primary' },
    { label: 'Primary', value: 'Primary' },
    { label: 'Secondary', value: 'Secondary' },
    { label: 'Higher Secondary', value: 'Higher Secondary' }
  ];

  /* ---------------- FETCH SCHOOLS ---------------- */
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await axios.get(`${Api_url.name}api/get-schools`);
        if (response.data.status === 200) {
          const schoolOpts = response.data.data.map(s => ({
            label: s.school_name,
            value: s.school_id
          }));
          setSchools(schoolOpts);
        }
      } catch (err) {
        console.error("Error fetching schools", err);
      }
    };
    fetchSchools();
  }, []);

  /* ---------------- VALIDATION ---------------- */
  const validateForm = () => {
    let newErrors = {};

    if (!formData.school_id) newErrors.school_id = 'Please select a school';
    if (!formData.class_name.trim()) newErrors.class_name = 'Class name is required';
    if (!formData.numeric_value) newErrors.numeric_value = 'Numeric value is required (e.g. 10 for Grade 10)';
    if (!formData.class_order) newErrors.class_order = 'Display order is required';

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
      const response = await axios.post(
        `${Api_url.name}api/save-class`, 
        formData,
        { withCredentials: true }
      );

      if (response.data.status === 200) {
        navigate('/classes', { state: { message: 'Class created successfully', status: 'success' } });
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
        <form onSubmit={handleSubmit} id="class-form-id">
          {/* ---------- HEADER ---------- */}
          <div className="bg-white border-b border-gray-200 px-8 py-5 rounded-t-[2.5rem]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <PageHeader
                prevRoute="/classes"
                breadcrumbParent="Classes"
                breadcrumbCurrent="New Class"
                title="Add New Class"
              />

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-[#faae1c] hover:bg-[#e89d10] text-white px-7 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all active:scale-95 disabled:opacity-70 cursor-pointer"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}  
                  Save Class
                </button>
              </div>
            </div>
          </div>

          {/* ---------- BODY ---------- */}
          <div className="p-0 sm:p-8 max-w-[1600px] mx-auto">
            <div className="bg-white rounded-[2.5rem] p-10 border border-gray-200 shadow-sm">
              
              <section className="space-y-8">
                <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                  <CheckCircle2 className="text-blue-600" size={24} />
                  Class Configuration
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* SCHOOL SELECTION */}
                  <CustomSelect
                    label="Select School"
                    options={schools}
                    value={formData.school_id}
                    onChange={(val) => handleSelectChange('school_id', val)}
                    error={errors.school_id}
                  />

                  {/* CLASS NAME */}
                  <Input
                    label="Class Name"
                    name="class_name"
                    placeholder="e.g. Grade 10"
                    value={formData.class_name}
                    onChange={handleChange}
                    error={errors.class_name}
                  />

                  {/* NUMERIC VALUE */}
                  <Input
                    label="Numeric Value"
                    name="numeric_value"
                    type="number"
                    placeholder="e.g. 10"
                    value={formData.numeric_value}
                    onChange={handleChange}
                    error={errors.numeric_value}
                    info="Used for student promotion logic"
                  />

                  {/* DEPARTMENT */}
                  <CustomSelect
                    label="Department/Category"
                    options={departmentOptions}
                    value={formData.department}
                    onChange={(val) => handleSelectChange('department', val)}
                    error={errors.department}
                  />

                  {/* DISPLAY ORDER */}
                  <Input
                    label="Display Order"
                    name="class_order"
                    type="number"
                    placeholder="e.g. 1"
                    value={formData.class_order}
                    onChange={handleChange}
                    error={errors.class_order}
                    info="Sequence in sidebar/lists"
                  />

                  {/* STATUS */}
                  <CustomSelect
                    label="Initial Status"
                    options={statusOptions}
                    value={formData.status}
                    onChange={(val) => handleSelectChange('status', val)}
                    error={errors.status}
                  />
                </div>
              </section>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AddClass;