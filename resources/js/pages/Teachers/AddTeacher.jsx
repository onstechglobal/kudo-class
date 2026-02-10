import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Save, User, Briefcase, Camera, MapPin, Eye, EyeOff } from "lucide-react";

import AdminLayout from "@/layouts/AdminLayout";
import Input from "@/components/form/Input";
import CustomSelect from "@/components/form/CustomSelect";
import CustomButton from "@/components/form/CustomButton";
import { Api_url } from "@/helpers/api";
import PageHeader from "../../components/common/PageHeader";
import StaticButtons from "../../components/common/StaticButtons";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
export default function AddTeacher() {

  const generatePassword = (length = 10) => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$!";
    return Array.from({ length }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");
  };

  const navigate = useNavigate();
  const submittingRef = useRef(false);

  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState(null);
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  React.useEffect(() => {
    if (autoGenerate) {
      setForm((prev) => ({
        ...prev,
        password: generatePassword(),
      }));
    }
  }, [autoGenerate]);

  React.useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        console.log(user);
        setForm(prev => ({
          ...prev,
          school_id: user.school_id
        }));
      }
    } catch (err) {
      console.error("Error parsing user data", err);
    }
  }, []);


  /* IMAGE */
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  /* FORM */
  const [form, setForm] = useState({
    school_id: "",
    first_name: "",
    last_name: "",
    father_name: "",
    mother_name: "",
    email: "",
    mobile: "",
    dob: "",
    designation: "",
    joining_date: "",
    qualification: "",
    experience_years: "",
    status: "active",
    address: "",
    country: "",
    state: "",
    district: "",
    city: "",
    pincode: "",
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const statusOptions = [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
  ];


  const handleDob = (d) => {
    setForm((prev) => ({ ...prev, dob: d }));
    if (errors["dob"]) setErrors((prev) => ({ ...prev, dob: null }));
  };

  const handleJoiningDate = (d) => {
    setForm((prev) => ({ ...prev, joining_date: d }));
    if (errors["joining_date"]) setErrors((prev) => ({ ...prev, joining_date: null }));
  };

  /* UPDATE FIELD */
  const updateField = (name, value) => {
    setForm((prev) => {
      const updated = { ...prev, [name]: value };

      // Auto-generate username from mobile
      if (autoGenerate && name === "mobile" && value.length === 10) {
        updated.username = `tr_${value}`;
      }

      return updated;
    });

    setErrors((prev) => ({ ...prev, [name]: "" }));
  };


  /* FILE */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  /* VALIDATION */
  const validate = () => {
    const err = {};
    if (!form.first_name.trim()) err.first_name = "First name is required";
    if (!form.last_name.trim()) err.last_name = "Last name is required";

    if (!form.email.trim())
      err.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      err.email = "Invalid email address";

    if (!form.mobile.trim())
      err.mobile = "Mobile number is required";
    else if (!/^[0-9]{10}$/.test(form.mobile))
      err.mobile = "Mobile must be 10 digits";

    if (!form.designation.trim())
      err.designation = "Designation is required";

    if (!form.joining_date)
      err.joining_date = "Joining date is required";

    setErrors(err);
    return Object.keys(err).length === 0;
  };


  /* SUBMIT (LOCKED – NO DOUBLE INSERT) */
  const submit = async (e) => {
    e.preventDefault();
    if (submittingRef.current || credentials) return;
    if (!validate()) return;
    submittingRef.current = true;
    setLoading(true);
    try {
      const payload = new FormData();

      Object.keys(form).forEach((key) => {
        // FIX: Check if the key is joining_date AND it's a valid Date object
        if (form[key] instanceof Date) {
          const d = form[key];
          const formatted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          payload.append(key, formatted);
        } else {
          payload.append(key, form[key]);
        }
      });

      if (selectedFile) {
        payload.append("teacher_photo", selectedFile);
      }

      const res = await axios.post(
        `${Api_url.name}api/saveteacher`,
        payload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "Accept": "application/json"
          }
        }
      );

      if (res.data.status === 200) {
        navigate('/teachers', {
          state: { status: res.data.status, message: res.data.message }
        });

        setCredentials({
          username: res.data.username,
          password: res.data.password,
        });
      } else {
        alert(res.data.message || "Failed to add teacher");
      }
    } catch (err) {
      console.error("Add teacher error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to add teacher. Please try again.");
      submittingRef.current = false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="bg-[#F8FAFC] min-h-screen p-6">
        <form onSubmit={submit}>
          {/* HEADER */}
          <div className="bg-white border-b border-gray-200 px-8 py-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

              <PageHeader
                prevRoute="/teachers"
                breadcrumbParent="Teachers"
                breadcrumbCurrent="Add"
                title="Add Teacher"
              />
            </div>
          </div>

          {/* BODY */}
          <div className="p-8 max-w-[1600px] mx-auto">
            <div className="grid grid-cols-12 gap-8">
              {/* LEFT */}
              <div className="col-span-12 lg:col-span-3">
                <div className="bg-white rounded-3xl p-8 text-center">
                  <div className="relative w-40 h-40 mx-auto mb-6">
                    <div className="w-full h-full rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <AvatarLetter text="T" />
                      )}
                    </div>

                    <label className="absolute -bottom-2 -right-2 p-3 bg-blue-600 text-white rounded-xl cursor-pointer hover:bg-blue-700 transition">
                      <Camera size={20} />
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Upload teacher photo (JPG, PNG, WebP, max 2MB)
                  </p>
                </div>
              </div>

              {/* RIGHT */}
              <div className="col-span-12 lg:col-span-9">
                <div className="bg-white rounded-[2.5rem] p-10 space-y-12">
                  {/* BASIC */}
                  <section>
                    <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                      <User className="text-blue-600" />
                      Basic Details
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                      {/* Hidden School ID Field */}
                      <input type="hidden" name="school_id" value={form.school_id} />

                      <Input
                        label="First Name"
                        value={form.first_name}
                        onChange={(e) => updateField("first_name", e.target.value)}
                        error={errors.first_name}
                        required
                      />
                      <Input
                        label="Last Name"
                        value={form.last_name}
                        onChange={(e) => updateField("last_name", e.target.value)}
                        error={errors.last_name}
                      />
                      <Input
                        label="Father Name"
                        value={form.father_name}
                        onChange={(e) => updateField("father_name", e.target.value)}
                      />
                      <Input
                        label="Mother Name"
                        value={form.mother_name}
                        onChange={(e) => updateField("mother_name", e.target.value)}
                      />

                      {/* 4. DATE OF BIRTH FIELD */}
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">
                          Date of Birth
                        </label>
                        <DatePicker
                          selected={form.dob instanceof Date ? form.dob : null}
                          onChange={handleDob}
                          dateFormat="yyyy-MM-dd"
                          maxDate={new Date()} // DOB cannot be in the future
                          showMonthDropdown
                          showYearDropdown
                          dropdownMode="select"
                          className="w-full px-4 py-3 rounded-lg outline-none bg-gray-50 border border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                          wrapperClassName="w-full"
                          placeholderText="Select Date of Birth"
                        />
                      </div>

                      <Input
                        label="Email"
                        type="email"
                        value={form.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        error={errors.email}
                        required
                      />
                      <Input
                        label="Mobile"
                        value={form.mobile}
                        onChange={(e) => updateField("mobile", e.target.value)}
                        error={errors.mobile}
                        required
                      />

                      <CustomSelect
                        label="Status"
                        options={statusOptions}
                        value={form.status}
                        onChange={(val) => updateField("status", val)}
                      />
                    </div>
                  </section>

                  {/* ADDRESS */}
                  <section>
                    <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                      <MapPin className="text-blue-600" />
                      Address Details
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Address"
                        value={form.address}
                        onChange={(e) => updateField("address", e.target.value)}
                        error={errors.address}
                        textarea
                        rows={3}
                      />

                      <Input
                        label="Country"
                        value={form.country}
                        onChange={(e) => updateField("country", e.target.value)}
                      />

                      <Input
                        label="State"
                        value={form.state}
                        onChange={(e) => updateField("state", e.target.value)}
                      />

                      <Input
                        label="District"
                        value={form.district}
                        onChange={(e) => updateField("district", e.target.value)}
                      />

                      <Input
                        label="City"
                        value={form.city}
                        onChange={(e) => updateField("city", e.target.value)}
                      />

                      <Input
                        label="Pincode"
                        value={form.pincode}
                        onChange={(e) => updateField("pincode", e.target.value)}
                        error={errors.pincode}
                      />
                    </div>
                  </section>

                  {/* PROFESSIONAL */}
                  <section>
                    <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                      <Briefcase className="text-blue-600" />
                      Professional Details
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Designation"
                        value={form.designation}
                        onChange={(e) => updateField("designation", e.target.value)}
                        error={errors.designation}
                        required
                      />
                      <Input
                        label="Qualification"
                        value={form.qualification}
                        onChange={(e) => updateField("qualification", e.target.value)}
                      />
                      <Input
                        label="Experience (Years)"
                        type="number"
                        value={form.experience_years}
                        onChange={(e) => updateField("experience_years", e.target.value)}
                      />
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">
                          Joining Date
                        </label>
                        <DatePicker
                          name="joining_date"
                          // Ensure we pass a Date object or null, never an empty string
                          selected={form.joining_date instanceof Date ? form.joining_date : null}
                          onChange={handleJoiningDate}
                          dateFormat="yyyy-MM-dd"
                          // RESTRICTIONS:
                          maxDate={new Date()} // Cannot select future dates
                          showYearDropdown   // Better UX for professional dates
                          scrollableYearDropdown
                          yearDropdownItemNumber={15}
                          className="w-full px-4 py-3 rounded-lg outline-none bg-gray-50 border border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                          wrapperClassName="w-full"
                          placeholderText="Select Joining Date"
                        />
                        {errors.joining_date && (
                          <p className="text-red-500 text-xs mt-1">{errors.joining_date}</p>
                        )}
                      </div>
                    </div>
                  </section>
                  <section>
                    <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                      <Briefcase className="text-blue-600" /> Login Credentials
                    </h2>

                    <div className="md:col-span-2 flex items-center gap-3 mb-4">
                      <input
                        type="checkbox"
                        checked={autoGenerate}
                        onChange={(e) => setAutoGenerate(e.target.checked)}
                        className="w-5 h-5 rounded"
                      />
                      <span className="font-semibold text-sm">
                        Auto-generate username & password
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      <Input
                        label="Username"
                        value={form.username}
                        onChange={(e) => updateField("username", e.target.value)}
                        required
                      />

                      <div className="relative">
                        <Input
                          label="Password"
                          type={showPassword ? "text" : "password"}
                          value={form.password}
                          onChange={(e) => updateField("password", e.target.value)}
                          required
                        />

                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-10 text-gray-500"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
          <StaticButtons saveText="Save Teacher" saveClick={submit} dataLoading={loading} />
        </form>
      </div>
    </AdminLayout>
  );
}

function AvatarLetter({ text }) {
  return (
    <div
      className="w-32 h-32 rounded-3xl flex items-center justify-center text-white text-5xl font-black"
      style={{ backgroundColor: "#FAAE1C" }}
    >
      {text}
    </div>
  );
}