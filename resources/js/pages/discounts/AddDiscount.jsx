import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Percent,
  IndianRupee,
  Save,
  Loader2,
  Tag,
  Layers,
  XCircle
} from 'lucide-react';

import AdminLayout from '../../layouts/AdminLayout';
import Input from '../../components/form/Input';
import CustomSelect from '../../components/form/CustomSelect';
import { Api_url } from '../../helpers/api';
import PageHeader from '../../components/common/PageHeader';

const AddDiscount = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
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
    { label: 'Academic Fee', value: 'academic' }, // ✅ matches ENUM
    { label: 'Transport Fee', value: 'transport' },
    { label: 'Admission Fee', value: 'admission' },
    { label: 'All Fees', value: 'all' },
  ];

  const statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' }
  ];

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

      const response = await axios.post(
        `${Api_url.name}api/discounts`,
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
            message: 'Discount created successfully!'
          }
        });
      } else {
        setServerWarning(response.data.message || 'Failed to save discount');
      }
    } catch (error) {
        console.error("Discount submit error:", error);
        setServerWarning("Something went wrong. Please try again.");
        setServerWarning(
            error.response?.data?.message || 
            "Something went wrong. Please try again."
        );
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
                prevRoute="/discounts"
                breadcrumbParent="Discounts"
                breadcrumbCurrent="New"
                title="New Discount"
              />

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-[#faae1c] text-white px-7 py-2.5 rounded-xl font-bold text-sm shadow-lg active:scale-95 disabled:opacity-70 cursor-pointer"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Save Discount
              </button>
            </div>
          </div>

          {/* ---------- BODY ---------- */}
          <div className="p-8 max-w-[1600px] mx-auto">

            {/* Server Warning */}
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

              {/* BASIC INFO */}
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
                    placeholder="Select parent type"
                  />

                  <CustomSelect
                    label="Applies To Fee Type"
                    options={feeTypeOptions}
                    value={formData.applies_to_fee_type}
                    onChange={(val) => handleSelectChange('applies_to_fee_type', val)}
                    error={errors.applies_to_fee_type}
                    placeholder="Select fee type"
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

export default AddDiscount;
