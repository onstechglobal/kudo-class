import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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

export default function EditParent() {
  const navigate = useNavigate();
  const { id } = useParams();
  const submittingRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

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

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  /* ================= FETCH PARENT ================= */
  useEffect(() => {
    const fetchParent = async () => {
      try {
        const res = await axios.get(`${Api_url.name}parents/${id}`);
        if (res.data?.parent) {
          const data = res.data.parent;
          setForm({
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            email: data.email || "",
            mobile: data.mobile || "",
            alternate_mobile: data.alternate_mobile || "",
            status: data.status || "active",
          });
        }
      } catch (err) {
        console.error("Fetch parent failed:", err.response?.data || err.message);
        alert("Failed to fetch parent details. Please check the server.");
      } finally {
        setLoading(false);
      }
    };
    fetchParent();
  }, [id]);

  /* ================= VALIDATION ================= */
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

  /* ================= SUBMIT ================= */
  const submit = async (e) => {
    e.preventDefault();
    if (submittingRef.current) return;
    if (!validate()) return;

    submittingRef.current = true;
    setLoading(true);

    try {
      // === FIXED: Use POST + _method to simulate PUT (Laravel safe) ===
      const res = await axios.post(
        `${Api_url.name}update-parent/${id}`,
        {
          ...form,
          _method: "POST", // <-- key change here
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-CSRF-TOKEN": document
              .querySelector('meta[name="csrf-token"]')
              ?.getAttribute("content"), // optional if CSRF is enabled
          },
        }
      );

      if (res.data.status === 200) {
        setSuccess(true);
      } else {
        alert(res.data.message || "Update failed");
      }
    } catch (err) {
      console.error("Update error:", err.response?.data || err.message);
      if (err.response?.status === 422) {
        const validationErrors = err.response.data.errors;
        setErrors(validationErrors);
      } else {
        alert(err.response?.data?.message || "Failed to update parent. Please try again.");
      }
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
            <p className="text-sm font-medium text-gray-600">Loading parent details...</p>
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
                <Link to="/parents">
                  <button
                    type="button"
                    className="p-2 hover:bg-gray-100 rounded-full text-gray-400"
                  >
                    <ArrowLeft size={20} />
                  </button>
                </Link>

                <div>
                  <nav className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">
                    <Link to="/parents">Parents</Link> / <Link>Edit</Link>
                  </nav>
                  <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                    Edit Parent
                  </h1>
                </div>
              </div>

              <CustomButton
                text={loading ? "Updating..." : "Update Parent"}
                Icon={Save}
                onClick={submit}
                className="bg-[#faae1c] text-white hover:bg-[#faae1c]/85 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || submittingRef.current}
              />
            </div>
          </div>

          {/* BODY */}
          <div className="p-8 max-w-[1600px] mx-auto grid grid-cols-12 gap-8">
            {/* LEFT - AVATAR SECTION */}
            <div className="col-span-12 lg:col-span-3">
              <div className="bg-white rounded-3xl p-8 text-center">
                <div className="relative w-40 h-40 mx-auto mb-4">
                  <div className="w-full h-full rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                    <AvatarLetter text={`${form.first_name?.charAt(0) || "P"}`} />
                  </div>
                </div>
                <p className="text-xs text-gray-500">Parent Avatar (Initials)</p>
              </div>
            </div>

            {/* RIGHT - FORM FIELDS */}
            <div className="col-span-12 lg:col-span-9">
              <div className="bg-white rounded-[2.5rem] p-10">
                <section>
                  <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                    <User className="text-blue-600" /> Parent Details
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="First Name *"
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
                      label="Email *"
                      type="email"
                      value={form.email || ""}
                      onChange={(e) => updateField("email", e.target.value)}
                      error={errors.email}
                      required
                    />
                    <Input
                      label="Mobile Number *"
                      value={form.mobile || ""}
                      onChange={(e) => updateField("mobile", e.target.value)}
                      error={errors.mobile}
                      required
                    />
                    <Input
                      label="Alternate Mobile"
                      value={form.alternate_mobile || ""}
                      onChange={(e) => updateField("alternate_mobile", e.target.value)}
                      error={errors.alternate_mobile}
                    />
                    <CustomSelect
                      label="Status"
                      options={statusOptions}
                      value={form.status || ""}
                      onChange={(val) => updateField("status", val)}
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
                <h3 className="text-xl font-bold mt-4">Parent Updated Successfully</h3>
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
