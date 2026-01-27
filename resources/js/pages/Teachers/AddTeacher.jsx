import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Save,
  User,
  Briefcase,
  Camera,
  CheckCircle2,
} from "lucide-react";

import AdminLayout from "@/layouts/AdminLayout";
import Input from "@/components/form/Input";
import CustomSelect from "@/components/form/CustomSelect";
import CustomButton from "@/components/form/CustomButton";
import { Api_url } from "@/helpers/api";

export default function AddTeacher() {
  const navigate = useNavigate();
  const submittingRef = useRef(false);

  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState(null);

  /* IMAGE */
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  /* FORM */
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    mobile: "",
    designation: "",
    joining_date: "",
    qualification: "",
    experience_years: "",
    status: "active",
  });

  const [errors, setErrors] = useState({});

  const statusOptions = [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
  ];

  /* UPDATE FIELD */
  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
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
      Object.keys(form).forEach((key) => payload.append(key, form[key]));

      if (selectedFile) {
        payload.append("teacher_photo", selectedFile);
      }

      const res = await axios.post(
        `${Api_url.name}teacher`,
        payload,
        { 
          headers: { 
            "Content-Type": "multipart/form-data",
            "Accept": "application/json"
          } 
        }
      );

      if (res.data.status === 200) {
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
      <div className="bg-[#F8FAFC] min-h-screen">
        <form onSubmit={submit}>
          {/* HEADER */}
          <div className="bg-white border-b border-gray-200 px-8 py-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Link to="/teachers">
                  <button type="button" className="p-2 hover:bg-gray-100 rounded-full text-gray-400 cursor-pointer">
                    <ArrowLeft size={20} />
                  </button>
                </Link>
                <div>
                  <nav className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">
                    <Link to="/teachers">Teachers</Link> / <Link>Add</Link>
                  </nav>
                  <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                    Add Teacher
                  </h1>
                </div>
              </div>
              <CustomButton
                text={loading ? "Saving..." : "Save Teacher"}
                Icon={Save}
                className="bg-[#faae1c] text-white hover:bg-[#faae1c]/85 disabled:opacity-50 disabled:cursor-not-allowed"
                to="#"
                onClick={submit}
                disabled={loading || submittingRef.current}
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
                      <Input 
                        label="Joining Date" 
                        type="date" 
                        value={form.joining_date} 
                        onChange={(e) => updateField("joining_date", e.target.value)} 
                        error={errors.joining_date} 
                        required
                      />
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>

          {/* SUCCESS MODAL */}
          {credentials && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-8 max-w-md text-center">
                <CheckCircle2 className="mx-auto text-[#faae1c]" size={48} />
                <h3 className="text-xl font-bold mt-4">
                  Teacher Added Successfully
                </h3>
                <p className="text-gray-600 mt-2">
                  Login credentials have been generated for the teacher.
                </p>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-left mb-2">
                    <strong>Username:</strong> <span className="font-mono">{credentials.username}</span>
                  </p>
                  <p className="text-left">
                    <strong>Password:</strong> <span className="font-mono">{credentials.password}</span>
                  </p>
                </div>

                <p className="text-sm text-red-500 mt-4">
                  Please save these credentials. They cannot be retrieved later.
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/teachers")}
                  className="mt-6 bg-[#faae1c] px-6 py-2 rounded-lg text-white font-bold hover:bg-[#faae1c]/90"
                >
                  OK
                </button>
              </div>
            </div>
          )}
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