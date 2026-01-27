import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Save,
  User,
  CheckCircle2,
} from "lucide-react";

import AdminLayout from "@/layouts/AdminLayout";
import Input from "@/components/form/Input";
import CustomSelect from "@/components/form/CustomSelect";
import CustomButton from "@/components/form/CustomButton";
import { Api_url } from "@/helpers/api";

export default function AddParent() {
  const navigate = useNavigate();
  const submittingRef = useRef(false);

  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState(null);
  const [errors, setErrors] = useState({});

  /* FORM - ONLY fields that exist in your table */
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    mobile: "",
    alternate_mobile: "",
    status: "active",
  });

  const statusOptions = [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
  ];

  /* UPDATE FIELD */
  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  /* VALIDATION */
  const validate = () => {
    const err = {};

    if (!form.first_name.trim()) err.first_name = "First name is required";
    if (!form.email.trim()) err.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) err.email = "Invalid email address";

    if (!form.mobile.trim()) err.mobile = "Mobile number is required";
    else if (!/^[0-9]{10}$/.test(form.mobile)) err.mobile = "Mobile must be 10 digits";

    if (form.alternate_mobile && !/^[0-9]{10}$/.test(form.alternate_mobile))
      err.alternate_mobile = "Alternate mobile must be 10 digits";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  /* SUBMIT */
  const submit = async (e) => {
    e.preventDefault();

    if (submittingRef.current || credentials) return;
    if (!validate()) return;

    submittingRef.current = true;
    setLoading(true);

    try {
      const res = await axios.post(
        `${Api_url.name}parents`,
        form,
        { 
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          } 
        }
      );

      if (res.data.status === 201) {
        setCredentials({
          username: res.data.username,
          password: res.data.password,
        });
      } else {
        alert(res.data.message || "Failed to add parent");
      }
    } catch (err) {
      console.error("Add parent error:", err.response?.data || err.message);
      
      if (err.response?.status === 422) {
        // Validation errors
        const validationErrors = err.response.data.errors;
        setErrors(validationErrors);
      } else {
        alert(err.response?.data?.message || "Failed to add parent. Please try again.");
      }
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
                <Link to="/parents">
                  <button type="button" className="p-2 hover:bg-gray-100 rounded-full text-gray-400 cursor-pointer">
                    <ArrowLeft size={20} />
                  </button>
                </Link>
                <div>
                  <nav className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">
                    <Link to="/parents">Parents</Link> / <Link>Add</Link>
                  </nav>
                  <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                    Add Parent
                  </h1>
                </div>
              </div>
              <CustomButton
                text={loading ? "Saving..." : "Save Parent"}
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
              {/* LEFT - AVATAR SECTION */}
              <div className="col-span-12 lg:col-span-3">
                <div className="bg-white rounded-3xl p-8 text-center">
                  <div className="relative w-40 h-40 mx-auto mb-6">
                    <div className="w-full h-full rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                      <AvatarLetter text={`${form.first_name?.charAt(0) || 'P'}`} />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Parent Avatar (Initials)
                  </p>
                </div>
              </div>

              {/* RIGHT - FORM FIELDS */}
              <div className="col-span-12 lg:col-span-9">
                <div className="bg-white rounded-[2.5rem] p-10">
                  {/* BASIC DETAILS */}
                  <section>
                    <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                      <User className="text-blue-600" />
                      Parent Details
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input 
                        label="First Name *" 
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
                        label="Email *" 
                        type="email"
                        value={form.email} 
                        onChange={(e) => updateField("email", e.target.value)} 
                        error={errors.email} 
                        required
                      />
                      <Input 
                        label="Mobile Number *" 
                        value={form.mobile} 
                        onChange={(e) => updateField("mobile", e.target.value)} 
                        error={errors.mobile} 
                        required
                      />
                      <Input 
                        label="Alternate Mobile" 
                        value={form.alternate_mobile} 
                        onChange={(e) => updateField("alternate_mobile", e.target.value)} 
                        error={errors.alternate_mobile} 
                      />
                      <CustomSelect
                        label="Status"
                        options={statusOptions}
                        value={form.status}
                        onChange={(val) => updateField("status", val)}
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
                  Parent Added Successfully
                </h3>
                <p className="text-gray-600 mt-2">
                  Login credentials have been generated for the parent.
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
                  onClick={() => navigate("/parents")}
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