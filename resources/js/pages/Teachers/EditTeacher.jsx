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
  MapPin,
  EyeOff,
  Eye
} from "lucide-react";

import AdminLayout from "@/layouts/AdminLayout";
import Input from "@/components/form/Input";
import CustomSelect from "@/components/form/CustomSelect";
import CustomButton from "@/components/form/CustomButton";
import { Api_url } from "@/helpers/api";
import PageHeader from "../../components/common/PageHeader";
import EditPreloader from '../../components/common/EditPreloader';
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

export default function EditTeacher() {
  const navigate = useNavigate();
  const { id } = useParams();
  const submittingRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [originalPhoto, setOriginalPhoto] = useState(null);
  const [imgError, setImgError] = useState(false);

  /* IMAGE */
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  /* FORM */
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    father_name: "",
    mother_name: "",
    email: "",
    mobile: "",
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
  const [showPassword, setShowPassword] = useState(false);

  const statusOptions = [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
  ];

  /* ================= FIELD UPDATE ================= */
  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };
    const handleJoiningDate = (d) => {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();

      const new_joining_date = `${year}-${month}-${day}`;
      setForm((prev) => ({ ...prev, ["joining_date"]: new_joining_date }));
      if (errors["joining_date"]) setErrors((prev) => ({ ...prev, ["joining_date"]: null }));
    };
  /* ================= FETCH TEACHER ================= */
  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const res = await axios.get(`${Api_url.name}api/teacher/${id}`);
        if (res.data.teacher) {
          const data = res.data.teacher;

          setForm({
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            email: data.email || "",
            mobile: data.mobile || "",
            designation: data.designation || "",
            joining_date: data.joining_date  || "",
            qualification: data.qualification || "",
            experience_years: data.experience_years || "",
            status: data.status || "active",

            father_name: data.father_name || "",
            mother_name: data.mother_name || "",

            address: data.address || "",
            country: data.country || "",
            state: data.state || "",
            district: data.district || "",
            city: data.city || "",
            pincode: data.pincode || "",
            username: data.username || "", 
            password: "",
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
      Object.keys(form).forEach((key) => {
        if (key === "password" && !form.password.trim()) return;
        payload.append(key, form[key]);
      });
      if (selectedFile) {
        payload.append("teacher_photo", selectedFile);
      } else if (originalPhoto) {
        // If no new file selected but original exists, keep the original
        payload.append("keep_original_photo", "true");
      }

      const res = await axios.post(
        `${Api_url.name}api/update-teacher/${id}`,
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
           state: { status: 'success', message: 'Teacher updated successfully!' } 
        });
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


  return (
    <AdminLayout>
       {/* FIXED PRELOADER: Stays at the top of the viewport below the header */}
        {loading && (
          <EditPreloader />
        )}
      <div className="bg-[#F8FAFC] min-h-screen p-6">
        <form onSubmit={submit}>
          {/* HEADER */}
          <div className="bg-white border-b border-gray-200 px-8 py-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             
              <PageHeader
                prevRoute="/teachers"
                breadcrumbParent="Teachers"
                breadcrumbCurrent="Edit"
                title="Edit Teacher"
              />

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
                    {previewUrl && !imgError ? (
                      <img
                        src={previewUrl}
                        alt="Teacher Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          setImgError(true);
                        }}
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
                      label="Father Name"
                      value={form.father_name}
                      onChange={(e) => updateField("father_name", e.target.value)}
                    />

                    <Input
                      label="Mother Name"
                      value={form.mother_name}
                      onChange={(e) => updateField("mother_name", e.target.value)}
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

                {/* ADDRESS DETAILS */}
                <section>
                  <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                    <MapPin className="text-blue-600" /> Address Details
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Address"
                      value={form.address}
                      onChange={(e) => updateField("address", e.target.value)}
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
                    
                    <div>
                      <label class="text-xs font-semibold text-gray-500 uppercase mb-1 block">Joining Date</label>
                     <DatePicker
                        name="joining_date"
                        selected={form.joining_date|| ""}
                        onChange={handleJoiningDate}
                        dateFormat="yyyy-mm-dd"
                        className="w-full px-4 py-3 rounded-lg outline-none bg-gray-50 border border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        wrapperClassName="w-full"
                      />
                    </div>
                  </div>
                </section>
                <section>
                  <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                    <Briefcase className="text-blue-600" /> Login Credentials
                  </h2>

                  <div className="grid md:grid-cols-2 gap-8">
                    <Input
                      label="Username"
                      value={form.username}
                      onChange={(e) => updateField("username", e.target.value)}
                      required
                    />

                    <div className="relative">
                      <Input
                        label="New Password"
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={(e) => updateField("password", e.target.value)}
                        placeholder="Leave blank to keep existing password"
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