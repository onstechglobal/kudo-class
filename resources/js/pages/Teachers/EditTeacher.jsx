import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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

export default function EditTeacher() {
  const navigate = useNavigate();
  const { id } = useParams();
  const submittingRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [originalPhoto, setOriginalPhoto] = useState(null);

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

  /* ================= FIELD UPDATE ================= */
  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  /* ================= FETCH TEACHER ================= */
  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const res = await axios.get(`${Api_url.name}teacher/${id}`);
        if (res.data.teacher) {
          const data = res.data.teacher;

          setForm({
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            email: data.email || "",
            mobile: data.mobile || "",
            designation: data.designation || "",
            joining_date: data.joining_date
              ? data.joining_date.split("T")[0]
              : "",
            qualification: data.qualification || "",
            experience_years: data.experience_years || "",
            status: data.status || "active",
          });

          // Set original photo URL (Laravel now returns full URL)
          if (data.photo_url) {
            setOriginalPhoto(data.photo_url);
            setPreviewUrl(data.photo_url);
          }
        }
      } catch (err) {
        console.error("Fetch teacher failed:", err.response?.data || err.message);
        alert("Failed to fetch teacher details. Please check the server.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeacher();
  }, [id]);

  /* ================= FILE CHANGE ================= */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      alert("File size should be less than 2MB");
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert("Only JPG, PNG, and WebP files are allowed");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  /* ================= VALIDATION ================= */
  const validate = () => {
    const err = {};
    if (!form.first_name.trim()) err.first_name = "First name is required";
    if (!form.last_name.trim()) err.last_name = "Last name is required";
    if (!form.email.trim()) err.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) err.email = "Invalid email address";
    if (!form.mobile.trim()) err.mobile = "Mobile number is required";
    else if (!/^[0-9]{10}$/.test(form.mobile)) err.mobile = "Mobile must be 10 digits";
    if (!form.designation.trim()) err.designation = "Designation is required";
    if (!form.joining_date) err.joining_date = "Joining date is required";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  /* ================= SUBMIT ================= */
  const submit = async (e) => {
    e.preventDefault();
    if (submittingRef.current) return;
    if (!validate()) return;

    submittingRef.current = true;
    setLoading(true);

    try {
      const payload = new FormData();
      Object.keys(form).forEach((key) => payload.append(key, form[key]));
      if (selectedFile) {
        payload.append("teacher_photo", selectedFile);
      } else if (originalPhoto) {
        // If no new file selected but original exists, keep the original
        payload.append("keep_original_photo", "true");
      }

      const res = await axios.post(
        `${Api_url.name}update-teacher/${id}`,
        payload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "Accept": "application/json"
          }
        }
      );

      if (res.data.status === 200) {
        setSuccess(true);
      } else {
        alert(res.data.message || "Update failed");
      }
    } catch (err) {
      console.error("Update error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to update teacher. Please try again.");
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  /* ================= REMOVE PHOTO ================= */
  const removePhoto = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setOriginalPhoto(null);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
            <p className="text-sm font-medium text-gray-600">Loading teacher details...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="bg-[#F8FAFC] min-h-screen">
        <form onSubmit={submit}>
          {/* HEADER */}
          <div className="bg-white border-b border-gray-200 px-8 py-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Link to="/teachers">
                  <button
                    type="button"
                    className="p-2 hover:bg-gray-100 rounded-full text-gray-400"
                  >
                    <ArrowLeft size={20} />
                  </button>
                </Link>

                <div>
                  <nav className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">
                    <Link to="/teachers">Teachers</Link> / <Link>Edit</Link>
                  </nav>
                  <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                    Edit Teacher
                  </h1>
                </div>
              </div>

              <CustomButton
                text={loading ? "Updating..." : "Update Teacher"}
                Icon={Save}
                onClick={submit}
                className="bg-[#faae1c] text-white hover:bg-[#faae1c]/85 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || submittingRef.current}
              />
            </div>
          </div>

          {/* BODY */}
          <div className="p-8 max-w-[1600px] mx-auto grid grid-cols-12 gap-8">
            {/* LEFT - PHOTO SECTION */}
            <div className="col-span-12 lg:col-span-3">
              <div className="bg-white rounded-3xl p-8 text-center">
                <div className="relative w-40 h-40 mx-auto mb-4">
                  <div className="w-full h-full rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                    {previewUrl ? (
                      <img 
                        src={previewUrl} 
                        alt="Teacher Preview" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <AvatarLetter text={`${form.first_name?.charAt(0) || 'T'}`} />
                    )}
                  </div>
                  
                  {/* Camera Icon */}
                  <label className="absolute -bottom-2 -right-2 p-3 bg-blue-600 text-white rounded-xl cursor-pointer hover:bg-blue-700 transition">
                    <Camera size={20} />
                    <input 
                      type="file" 
                      hidden 
                      accept="image/*" 
                      onChange={handleFileChange} 
                    />
                  </label>
                  
                  {/* Remove Icon (only show if there's a photo) */}
                  {previewUrl && (
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="absolute -bottom-2 -left-2 p-3 bg-red-500 text-white rounded-xl cursor-pointer hover:bg-red-600 transition"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
                
                <p className="text-xs text-gray-500">
                  {selectedFile ? "New photo selected" : "Click camera to upload new photo"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  JPG, PNG, WebP • Max 2MB
                </p>
              </div>
            </div>

            {/* RIGHT - FORM FIELDS */}
            <div className="col-span-12 lg:col-span-9">
              <div className="bg-white rounded-[2.5rem] p-10 space-y-12">
                {/* BASIC DETAILS */}
                <section>
                  <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                    <User className="text-blue-600" /> Basic Details
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input 
                      label="First Name" 
                      value={form.first_name || ""} 
                      onChange={(e) => updateField("first_name", e.target.value)} 
                      error={errors.first_name} 
                      required
                    />
                    <Input 
                      label="Last Name" 
                      value={form.last_name || ""} 
                      onChange={(e) => updateField("last_name", e.target.value)} 
                      error={errors.last_name} 
                    />
                    <Input 
                      label="Email" 
                      type="email"
                      value={form.email || ""} 
                      onChange={(e) => updateField("email", e.target.value)} 
                      error={errors.email} 
                      required
                    />
                    <Input 
                      label="Mobile" 
                      value={form.mobile || ""} 
                      onChange={(e) => updateField("mobile", e.target.value)} 
                      error={errors.mobile} 
                      required
                    />

                    <CustomSelect 
                      label="Status" 
                      options={statusOptions} 
                      value={form.status || ""} 
                      onChange={(val) => updateField("status", val)} 
                    />
                  </div>
                </section>

                {/* PROFESSIONAL DETAILS */}
                <section>
                  <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                    <Briefcase className="text-blue-600" /> Professional Details
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input 
                      label="Designation" 
                      value={form.designation || ""} 
                      onChange={(e) => updateField("designation", e.target.value)} 
                      error={errors.designation} 
                      required
                    />
                    <Input 
                      label="Qualification" 
                      value={form.qualification || ""} 
                      onChange={(e) => updateField("qualification", e.target.value)} 
                    />
                    <Input 
                      label="Experience (Years)" 
                      type="number"
                      value={form.experience_years || ""} 
                      onChange={(e) => updateField("experience_years", e.target.value)} 
                    />
                    <Input 
                      label="Joining Date" 
                      type="date" 
                      value={form.joining_date || ""} 
                      onChange={(e) => updateField("joining_date", e.target.value)} 
                      error={errors.joining_date} 
                      required
                    />
                  </div>
                </section>
              </div>
            </div>
          </div>

          {/* SUCCESS MODAL */}
          {success && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-8 max-w-md text-center">
                <CheckCircle2 className="mx-auto text-[#faae1c]" size={48} />
                <h3 className="text-xl font-bold mt-4">Teacher Updated Successfully</h3>
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

/* ================= AVATAR ================= */
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