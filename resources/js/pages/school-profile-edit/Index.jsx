import React, { useState, useEffect } from "react";
import axios from "axios";
import { Camera } from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import Input from "../../components/form/Input";
import CustomSelect from "../../components/form/CustomSelect";
import { Api_url } from "../../helpers/api";

const EditSchoolProfile = () => {
    const [activeTab, setActiveTab] = useState("basicDetail");
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({});
    const [loading1, setLoading1] = useState(false);

    const [formData, setFormData] = useState({
        school_name: "",
        email: "",
        phone: "",
        alternate_phone: "",
        address_line1: "",
        address_line2: "",
        city: "",
        state: "",
        country: "India",
        pincode: "",
        board: "",
        logo_url: "",
    });

    /* ================= FETCH SCHOOL ================= */
    const fetchSchool = async (schoolId) => {
        try {
            const response = await axios.get(
                `${Api_url.name}api/get-school/${schoolId}`,
            );

            if (response.data) {
                setFormData(response.data);

                console.log("Console_data: ", response);
            }
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user?.school_id) {
            fetchSchool(user.school_id);
        }
    }, []);

    /* ================= HANDLERS ================= */

    const validateForm = () => {
        let newErrors = {};

        if (!formData.school_name?.trim()) {
            newErrors.school_name = "School name is required";
        }

        if (!formData.email?.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Invalid email format";
        }

        if (!formData.phone?.trim()) {
            newErrors.phone = "Phone number is required";
        }

        if (!formData.board) {
            newErrors.board = "Please select a board";
        }
        if (!formData.city?.trim()) {
            newErrors.city = "City is required";
        }

        if (!formData.pincode?.trim()) {
            newErrors.pincode = "Pincode is required";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSelectChange = (name, value) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading1(true);

        if (!validateForm()) {
            setLoading1(false);
            return;
        }

        try {
            const dataToSend = new FormData();

            Object.keys(formData).forEach((key) => {
                dataToSend.append(key, formData[key]);
            });

            const user = JSON.parse(localStorage.getItem("user"));

            await axios.post(
                `${Api_url.name}api/update-school/${user.school_id}`,
                dataToSend,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                },
            );
        } catch (error) {
            console.error("Submit error:", error);
            alert("Something went wrong ❌");
        } finally {
            setLoading1(false);
        }
    };

    /* ================= OPTIONS ================= */
    const boardOptions = [
        { label: "CBSE", value: "CBSE" },
        { label: "ICSE", value: "ICSE" },
        { label: "State Board", value: "STATE" },
    ];

    const tabs = [
        { id: "basicDetail", label: "Basic Details" },
        { id: "Address", label: "Address" },
    ];


    return (
        <AdminLayout>
            <div className="min-h-screen">
                <form onSubmit={handleSubmit}>
                    <div className=" bg-[#F4F7FE] flex justify-center p-6">
                        <div className="w-full max-w-6xl bg-white rounded-2xl shadow-sm overflow-hidden">
                            {/* ===== HEADER ===== */}
                            <div className="flex items-center gap-5 px-10 py-8 border-b border-gray-200">
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-full bg-[#0061FF] flex items-center justify-center text-white text-2xl font-bold">
                                        {formData.school_name
                                            .slice(0, 1)
                                            .toUpperCase()}
                                    </div>
                                    <label className="absolute bottom-0 right-0 w-6 h-6 bg-white border rounded-full flex items-center justify-center cursor-pointer">
                                        <Camera size={12} />
                                        <input type="file" hidden />
                                    </label>
                                </div>

                                <div>
                                    <h1 className="text-lg font-semibold text-[#1B2559]">
                                        {formData.school_name || "School"}
                                    </h1>
                                    <p className="text-sm text-[#A3AED0]">
                                        {formData.school_code}
                                    </p>
                                </div>
                            </div>

                            {/* ===== TABS ===== */}
                            <div className="flex px-10 bg-[#FAFBFF] border-b border-gray-200">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`px-6 py-4 text-sm font-semibold border-b-2 ${
                                            activeTab === tab.id
                                                ? "text-[#0061FF] border-[#0061FF]"
                                                : "text-[#A3AED0] border-transparent"
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* ===== FORM ===== */}
                            <div className="px-10 py-10">
                                {activeTab === "basicDetail" && (
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <Input
                                            label="School Name"
                                            name="school_name"
                                            value={formData.school_name}
                                            onChange={handleChange}
                                            error={errors.school_name}
                                        />
                                        <Input
                                            label="Email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            error={errors.email}
                                        />
                                        <Input
                                            label="Phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            error={errors.phone}
                                        />
                                        <Input
                                            label="Alt. Phone"
                                            name="alternate_phone"
                                            value={formData.alternate_phone}
                                            onChange={handleChange}
                                        />
                                        <CustomSelect
                                            label="Education Board"
                                            options={boardOptions}
                                            value={formData.board}
                                            onChange={(val) =>
                                                handleSelectChange("board", val)
                                            }
                                            error={errors.board}
                                        />
                                    </div>
                                )}

                                {activeTab === "Address" && (
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <Input
                                                label="Address 1"
                                                name="address_line1"
                                                value={formData.address_line1}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <Input
                                            label="City"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            error={errors.city}
                                        />
                                        <Input
                                            label="Pincode"
                                            name="pincode"
                                            value={formData.pincode}
                                            onChange={handleChange}
                                            error={errors.pincode}
                                        />
                                        <Input
                                            label="State"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                        />
                                        <Input
                                            label="Country"
                                            name="country"
                                            value={formData.country}
                                            onChange={handleChange}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* ===== FOOTER ===== */}
                            <div className="flex justify-end gap-6 px-10 py-6 bg-[#FAFBFF] border-t border-gray-200">
                                <button
                                    type="button"
                                    className="text-sm font-semibold text-[#A3AED0]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading1}
                                    className={`px-6 py-2 rounded-lg text-sm font-semibold ${
                                        loading1
                                            ? "bg-gray-300 cursor-not-allowed"
                                            : "bg-[#FFB800] text-white"
                                    }`}
                                >
                                    {loading1
                                        ? "Saving..."
                                        : "Save All Changes"}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
};

export default EditSchoolProfile;
