import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Save, ArrowLeft, Loader2, LayoutGrid, CheckCircle2 } from 'lucide-react';

import AdminLayout from '../../layouts/AdminLayout';
import Input from '../../components/form/Input';
import CustomSelect from '../../components/form/CustomSelect';
import { Api_url } from '../../helpers/api';
import PageHeader from '../../components/common/PageHeader';

const EditClass = () => {
  const { id } = useParams(); // Get class_id from URL
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    class_id: '',
    class_name: '',
    class_order: '',
    status: 'active'
  });

  const statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' }
  ];

  /* ---------------- FETCH EXISTING DATA ---------------- */
  useEffect(() => {
    const fetchClassData = async () => {
      try {
        const response = await axios.get(`${Api_url.name}api/get-class-by-id/${id}`);
        if (response.data.status === 200) {
          setFormData(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching class:", error);
      } finally {
        setFetching(false);
      }
    };
    fetchClassData();
  }, [id]);

  const validateForm = () => {
    let newErrors = {};
    if (!formData.class_name.trim()) newErrors.class_name = 'Class name is required';
    if (!formData.class_order) newErrors.class_order = 'Display order is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  /* ---------------- UPDATE SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { data: tokenData } = await axios.get(`${Api_url.name}api/csrf-token`, { withCredentials: true });

      const response = await axios.post(
        `${Api_url.name}api/update-class`,
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

  if (fetching) return (
    <AdminLayout><div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin text-blue-600" size={48} /></div></AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="bg-[#F8FAFC] min-h-screen p-6">
        <form onSubmit={handleSubmit}>
          <div className="bg-white border-b border-gray-200 px-8 py-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <PageHeader
                prevRoute="/classes"
                breadcrumbParent="Classes"
                breadcrumbCurrent="Edit"
                title="Edit Class"
              />
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-[#faae1c] hover:bg-[#e89d10] text-white px-7 py-2.5 rounded-xl font-bold shadow-lg transition-all active:scale-95 disabled:opacity-70"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Update Class
              </button>
            </div>
          </div>

          <div className="p-0 sm:p-8 max-w-[1600px] mx-auto">
            <div className="sm:grid sm:grid-cols-12 sm:gap-8">
              <div className="col-span-12 lg:col-span-3">
                <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm text-center sticky top-8">
                  <div className="w-32 h-32 mx-auto mb-6 bg-amber-50 rounded-3xl flex items-center justify-center">
                    <LayoutGrid size={48} className="text-amber-600" />
                  </div>
                  <h3 className="text-lg font-black text-gray-900 mb-2">Modify Record</h3>
                  <p className="text-sm text-gray-500">Update class name or display order</p>
                </div>
              </div>

              <div className="col-span-12 lg:col-span-9">
                <div className="bg-white rounded-[2.5rem] p-10 border border-gray-200 shadow-sm space-y-12">
                  <section className="pt-6">
                    <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                      <CheckCircle2 className="text-blue-600" size={24} />
                      Class Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Class Name"
                        name="class_name"
                        value={formData.class_name}
                        onChange={handleChange}
                        error={errors.class_name}
                      />
                      <Input
                        label="Display Order"
                        name="class_order"
                        type="number"
                        value={formData.class_order}
                        onChange={handleChange}
                        error={errors.class_order}
                      />
                      <CustomSelect
                        label="Status"
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

export default EditClass;