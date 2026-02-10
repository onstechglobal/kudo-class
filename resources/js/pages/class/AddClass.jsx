import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Save, Loader2, CheckCircle2 } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import Input from '../../components/form/Input';
import CustomSelect from '../../components/form/CustomSelect';
import { Api_url } from '../../helpers/api';
import PageHeader from '../../components/common/PageHeader';
import StaticButtons from '../../components/common/StaticButtons';

const AddClass = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    school_id: '',
    class_name: '',
    numeric_value: '', 
    department: 'General',
    class_order: '1',
    status: 'active'
  });

  /* ---------------- OPTIONS ---------------- */
  const statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' }
  ];

  const departmentOptions = [
  { label: 'Pre-Primary (Playgroup - KG)', value: 'Pre-Primary' },
  { label: 'Primary (Class 1 - 5)', value: 'Primary' },
  { label: 'Middle / Secondary (Class 6 - 10)', value: 'Secondary' },
  { label: 'Higher Secondary (Class 11 - 12)', value: 'Higher Secondary' },
];

  /* ---------------- GET SCHOOL ID FROM STORAGE ---------------- */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setFormData(prev => ({
        ...prev,
        school_id: user.school_id
      }));
    }
  }, []);

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
    setLoading(true);
    try {
      const response = await axios.post(
        `${Api_url.name}api/save-class`, 
        formData
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
        <form onSubmit={handleSubmit}>
          
          {/* HIDDEN FIELDS */}
          <input type="hidden" name="school_id" value={formData.school_id} />
          <input type="hidden" name="class_order" value={formData.class_order} />

          {/* ---------- HEADER ---------- */}
          <div className="bg-white border-b border-gray-200 px-8 py-5 rounded-t-[2.5rem]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <PageHeader
                prevRoute="/classes"
                breadcrumbParent="Academics"
                breadcrumbCurrent="New Class"
                title="Add New Class"
              />
            </div>
          </div>

          {/* ---------- BODY ---------- */}
          <div className="p-0 sm:p-8 max-w-[1000px] mx-auto">
            <div className="bg-white rounded-[2.5rem] p-10 border border-gray-200 shadow-sm">
              
              <section className="space-y-8">
                <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                  <CheckCircle2 className="text-blue-600" size={24} />
                  Class Configuration
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
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
                    info="Used for sorting"
                  />

                  {/* DEPARTMENT */}
                  <CustomSelect
                    label="Department/Category"
                    options={departmentOptions}
                    value={formData.department}
                    onChange={(val) => handleSelectChange('department', val)}
                    error={errors.department}
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
          <StaticButtons saveText="Save Class" saveClick={handleSubmit} dataLoading={loading} />
        </form>
      </div>
    </AdminLayout>
  );
};

export default AddClass;