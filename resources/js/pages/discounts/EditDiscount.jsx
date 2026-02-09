import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Save,
  Loader2,
  Tag,
  XCircle
} from 'lucide-react';

import AdminLayout from '../../layouts/AdminLayout';
import Input from '../../components/form/Input';
import CustomSelect from '../../components/form/CustomSelect';
import { Api_url } from '../../helpers/api';
import PageHeader from '../../components/common/PageHeader';

const EditDiscount = () => {
  const { id } = useParams(); // discount_id
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [serverWarning, setServerWarning] = useState("");

  const [formData, setFormData] = useState({
    parent_type: '',
    discount_type: 'percentage',
    discount_value: '',
    applies_to_fee_type: '',
    status: 'active'
  });

  /* ---------------- OPTIONS ---------------- */
  const parentTypeOptions = [
    { label: 'Teacher', value: 'teacher' },
    { label: 'Staff', value: 'staff' },
    { label: 'Student', value: 'student' },
    { label: 'Sibling', value: 'sibling' },
  ];

  const discountTypeOptions = [
    { label: 'Percentage (%)', value: 'percentage' },
    { label: 'Flat Amount (₹)', value: 'flat' }
  ];

  const feeTypeOptions = [
    { label: 'Academic Fee', value: 'academic' },
    { label: 'Transport Fee', value: 'transport' },
    { label: 'Admission Fee', value: 'admission' },
    { label: 'All Fees', value: 'all' },
  ];

  const statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' }
  ];

  /* ---------------- FETCH DISCOUNT ---------------- */
  useEffect(() => {
    const fetchDiscount = async () => {
      try {
        const res = await axios.get(`${Api_url.name}api/discounts/${id}`, {
          withCredentials: true
        });

        if (res.data.success) {
          setFormData(res.data.data);
        } else {
          setServerWarning('Failed to load discount');
        }
      } catch (error) {
        console.error(error);
        setServerWarning('Discount not found');
      } finally {
        setPageLoading(false);
      }
    };

    fetchDiscount();
  }, [id]);

  /* ---------------- VALIDATION ---------------- */
  const validateForm = () => {
    let newErrors = {};

    if (!formData.parent_type) newErrors.parent_type = 'Parent type is required';
    if (!formData.discount_type) newErrors.discount_type = 'Discount type is required';
    if (formData.discount_value === '' || formData.discount_value < 0)
      newErrors.discount_value = 'Enter valid discount value';
    if (!formData.applies_to_fee_type)
      newErrors.applies_to_fee_type = 'Fee type is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setServerWarning("");

    try {
      const { data: tokenData } = await axios.get(
        `${Api_url.name}api/csrf-token`,
        { withCredentials: true }
      );

      const response = await axios.put(
        `${Api_url.name}api/discounts/${id}`,
        formData,
        {
          headers: { 'X-CSRF-TOKEN': tokenData.token },
          withCredentials: true
        }
      );

      if (response.data.success) {
        navigate('/discounts', {
          state: {
            status: 'success',
            message: 'Discount updated successfully!'
          }
        });
      } else {
        setServerWarning(response.data.message || 'Failed to update discount');
      }
    } catch (error) {
        console.error("Discount update error:", error);
        setServerWarning("Something went wrong. Please try again.");
        setServerWarning(
            error.response?.data?.message || 
            "Something went wrong. Please try again."
        );
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="animate-spin" size={40} />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="bg-[#F8FAFC] min-h-screen p-6">
        <form onSubmit={handleSubmit}>

          {/* ---------- HEADER ---------- */}
          <div className="bg-white border-b border-gray-200 px-8 py-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <PageHeader
                prevRoute="/discounts"
                breadcrumbParent="Discounts"
                breadcrumbCurrent="Edit"
                title="Edit Discount"
              />

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-[#faae1c] text-white px-7 py-2.5 rounded-xl font-bold text-sm shadow-lg active:scale-95 disabled:opacity-70"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Update Discount
              </button>
            </div>
          </div>

          {/* ---------- BODY ---------- */}
          <div className="p-8 max-w-[1600px] mx-auto">

            {serverWarning && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-xl flex justify-between">
                <div className="flex items-center gap-3">
                  <XCircle size={20} />
                  <span className="font-medium">{serverWarning}</span>
                </div>
                <button type="button" onClick={() => setServerWarning("")}>×</button>
              </div>
            )}

            <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm space-y-12">
              <section>
                <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                  <Tag className="text-blue-600" size={24} />
                  Discount Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <CustomSelect
                    label="Parent Type"
                    options={parentTypeOptions}
                    value={formData.parent_type}
                    onChange={(val) => handleSelectChange('parent_type', val)}
                    error={errors.parent_type}
                  />

                  <CustomSelect
                    label="Applies To Fee Type"
                    options={feeTypeOptions}
                    value={formData.applies_to_fee_type}
                    onChange={(val) => handleSelectChange('applies_to_fee_type', val)}
                    error={errors.applies_to_fee_type}
                  />

                  <CustomSelect
                    label="Discount Type"
                    options={discountTypeOptions}
                    value={formData.discount_type}
                    onChange={(val) => handleSelectChange('discount_type', val)}
                  />

                  <Input
                    label={`Discount Value ${formData.discount_type === 'percentage' ? '(%)' : '(₹)'}`}
                    name="discount_value"
                    type="number"
                    value={formData.discount_value}
                    onChange={handleChange}
                    error={errors.discount_value}
                  />

                  <CustomSelect
                    label="Status"
                    options={statusOptions}
                    value={formData.status}
                    onChange={(val) => handleSelectChange('status', val)}
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

export default EditDiscount;
