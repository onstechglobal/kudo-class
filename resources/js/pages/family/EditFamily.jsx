import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Save, Loader2, Home, MapPin, Phone } from 'lucide-react';

import AdminLayout from '../../layouts/AdminLayout';
import Input from '../../components/form/Input';
import CustomSelect from '../../components/form/CustomSelect';
import { Api_url } from '../../helpers/api';
import PageHeader from '../../components/common/PageHeader';
import StaticButtons from '../../components/common/StaticButtons';

const EditFamily = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        id: '',
        address_line1: '',
        address_line2: '',
        phone_number: '',
        city: '',
        district: '',
        state: '',
        pincode: '',
        country: 'India',
        status: 'active'
    });

    const statusOptions = [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Deleted', value: 'deleted' }
    ];

    useEffect(() => {
        const fetchFamilyData = async () => {
            try {
                const response = await axios.get(`${Api_url.name}api/get-family-by-id/${id}`);
                if (response.data.status === 200) {
                    setFormData(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching family:", error);
            } finally {
                setFetching(false);
            }
        };
        fetchFamilyData();
    }, [id]);


    const validateForm = () => {
        let newErrors = {};

        // Mandatory Field Validations
        if (!formData.address_line1) newErrors.address_line1 = "Address is required";
        if (!formData.city) newErrors.city = "City is required";
        if (!formData.district) newErrors.district = "District is required";
        if (!formData.state) newErrors.state = "State is required";

        // Phone Validation: Exactly 10 digits
        if (!formData.phone_number) {
            newErrors.phone_number = "Phone number is required";
        } else if (formData.phone_number.length !== 10) {
            newErrors.phone_number = "Phone number must be exactly 10 digits";
        }

        // Pincode Validation: Exactly 6 digits (Standard for India)
        if (!formData.pincode) {
            newErrors.pincode = "Pincode is required";
        } else if (formData.pincode.length !== 6) {
            newErrors.pincode = "Pincode must be exactly 6 digits";
        }

        if (!formData.status) newErrors.status = "Status is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleChange = (e) => {
        const { name, value } = e.target;

        // --- HARD LIMITS ON TYPING ---

        // 1. Phone Number: Only digits and max 10 characters
        if (name === 'phone_number') {
            if (value !== '' && !/^\d+$/.test(value)) return; // Block non-digits
            if (value.length > 10) return; // Block typing more than 10
        }

        // 2. Pincode: Only digits and max 6 characters
        if (name === 'pincode') {
            if (value !== '' && !/^\d+$/.test(value)) return; // Block non-digits
            if (value.length > 6) return; // Block typing more than 6
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    };


    const handleSelectChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        // Trigger local validation
        if (!validateForm()) return;

        setLoading(true);
        try {
            const response = await axios.post(`${Api_url.name}api/update-family`, formData);
            if (response.data.status === 200) {
                navigate('/families', {
                    state: { message: 'Family updated successfully', status: 'success' }
                });
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
        <AdminLayout>
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Loader2 className="animate-spin text-[#faae1c] mb-4" size={48} />
                <p className="text-gray-500 font-medium animate-pulse">Loading Family Details...</p>
            </div>
        </AdminLayout>
    );

    return (
        <AdminLayout>
            <div className="bg-[#F8FAFC] min-h-screen p-6">
                <form onSubmit={handleSubmit}>

                    <input type="hidden" name="id" value={formData.id} />

                    {/* ---------- HEADER ---------- */}
                    <div className="bg-white border-b border-gray-200 px-8 py-5 rounded-t-[2.5rem]">
                        <PageHeader
                            prevRoute="/families"
                            breadcrumbParent="Management"
                            breadcrumbCurrent="Edit Family"
                            title={`Edit Family: #${formData.id}`}
                        />
                    </div>

                    {/* ---------- BODY ---------- */}
                    <div className="p-0 sm:p-8 max-w-[1100px] mx-auto">
                        <div className="bg-white rounded-[2.5rem] p-10 border border-gray-200 shadow-sm">

                            <section className="space-y-12">
                                {/* ADDRESS SECTION */}
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                                        <Home className="text-blue-600" size={24} />
                                        Address Information
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                                        <Input
                                            label="Address Line 1"
                                            name="address_line1"
                                            placeholder="Street address, P.O. box"
                                            value={formData.address_line1}
                                            onChange={handleChange}
                                            error={errors.address_line1}
                                        />
                                        <Input
                                            label="Address Line 2"
                                            name="address_line2"
                                            placeholder="Apartment, suite, unit, building"
                                            value={formData.address_line2}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                {/* LOCATION & CONTACT SECTION */}
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                                        <MapPin className="text-blue-600" size={24} />
                                        Location & Contact
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                        <Input
                                            label="City"
                                            name="city"
                                            required
                                            value={formData.city}
                                            onChange={handleChange}
                                            error={errors.city}
                                        />
                                        <Input
                                            label="District"
                                            name="district"
                                            required
                                            value={formData.district}
                                            onChange={handleChange}
                                            error={errors.district}
                                        />
                                        <Input
                                            label="State"
                                            name="state"
                                            required
                                            value={formData.state}
                                            onChange={handleChange}
                                            error={errors.state}
                                        />
                                        <Input
                                            label="Pincode"
                                            name="pincode"
                                            required
                                            placeholder="6-digit PIN"
                                            value={formData.pincode}
                                            onChange={handleChange}
                                            error={errors.pincode}
                                        />
                                        <Input
                                            label="Phone Number"
                                            name="phone_number"
                                            required
                                            placeholder="10-digit mobile"
                                            icon={<Phone size={16} />}
                                            value={formData.phone_number}
                                            onChange={handleChange}
                                            error={errors.phone_number}
                                        />
                                        <CustomSelect
                                            label="Status"
                                            options={statusOptions}
                                            value={formData.status}
                                            onChange={(val) => handleSelectChange('status', val)}
                                            error={errors.status}
                                        />
                                    </div>
                                </div>

                            </section>
                        </div>
                    </div>

                    <StaticButtons
                        saveText="Update Family"
                        saveClick={handleSubmit}
                        dataLoading={loading}
                    />
                </form>
            </div>
        </AdminLayout>
    );
};

export default EditFamily;