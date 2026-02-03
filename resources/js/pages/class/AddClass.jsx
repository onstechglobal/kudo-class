import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Save, ArrowLeft, Loader2, School, LayoutGrid, ListOrdered, CheckCircle2 } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import Input from '../../components/form/Input';
import CustomSelect from '../../components/form/CustomSelect';
import { Api_url } from '../../helpers/api';
import PageHeader from '../../components/common/PageHeader';

const AddClass = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Mapping state to match your tb_classes table fields
  const [formData, setFormData] = useState({
    school_id: '',
    class_name: '',
    class_order: '', // Added for sorting/display order
    status: 'active'
  });

  /* ---------------- OPTIONS ---------------- */
  const statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' }
  ];


  /* ---------------- VALIDATION ---------------- */
  const validateForm = () => {
    let newErrors = {};

    //if (!formData.school_id) newErrors.school_id = 'School selection is required';
    if (!formData.class_name.trim()) newErrors.class_name = 'Class name is required (e.g., Grade 10)';
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
      // Fetching CSRF if required by your backend
      const { data: tokenData } = await axios.get(
        `${Api_url.name}api/csrf-token`,
        { withCredentials: true }
      );

      const response = await axios.post(
        `${Api_url.name}api/save-class`, // Ensure this endpoint exists in your backend
        formData,
        {
          headers: { 'X-CSRF-TOKEN': tokenData.token },
          withCredentials: true
        }
      );

      if (response.data.status === 200) {
        navigate('/classes');
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
          <div className="bg-white border-b border-gray-200 px-8 py-5">
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
                  {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Save size={18} />
                  )}  Save Class
                </button>
              </div>
            </div>
          </div>


          {/* ---------- BODY ---------- */}
          <div className="p-0 sm:p-8 max-w-[1600px] mx-auto">
            <div className="sm:grid sm:grid-cols-12 sm:gap-8">
              {/* LEFT INFO CARD */}
              <div className="py-8 sm:py-0 col-span-12 lg:col-span-3">
                <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm text-center sticky top-8">
                  <div className="w-32 h-32 mx-auto mb-6 bg-indigo-50 rounded-3xl flex items-center justify-center">
                    <LayoutGrid size={48} className="text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-black text-gray-900 mb-2">
                    Class Configuration
                  </h3>
                </div>
              </div>

              {/* RIGHT FORM */}
              <div className="col-span-12 lg:col-span-9">
                <div className="bg-white rounded-[2.5rem] p-10 border border-gray-200 shadow-sm space-y-12">

                  {/* CLASS DETAILS */}
                  <section className="pt-6 border-t border-gray-100">
                    <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                      <CheckCircle2 className="text-blue-600" size={24} />
                      Class Details
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Class Name"
                        name="class_name"
                        placeholder="e.g. Class 10-A"
                        value={formData.class_name}
                        onChange={handleChange}
                        error={errors.class_name}
                      />

                      <Input
                        label="Display Order"
                        name="class_order"
                        type="number"
                        placeholder="e.g. 1"
                        value={formData.class_order}
                        onChange={handleChange}
                        error={errors.class_order}
                        info="Numerical order for lists"
                      />

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
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AddClass;