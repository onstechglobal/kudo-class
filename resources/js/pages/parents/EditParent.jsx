import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Save, User, Home } from "lucide-react";

import AdminLayout from "@/layouts/AdminLayout";
import Input from "@/components/form/Input";
import CustomSelect from "@/components/form/CustomSelect";
import CustomButton from "@/components/form/CustomButton";
import { Api_url } from "@/helpers/api";
import PageHeader from "../../components/common/PageHeader";
import EditPreloader from '../../components/common/EditPreloader';

export default function EditParent() {
  const navigate = useNavigate();
  const { id } = useParams();
  const submittingRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  /* FORM STATE */
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    mobile: "",
    alternate_mobile: "",
    status: "active",
    address_line1: "",
    address_line2: "",
    country: "India",
    state: "",
    district: "",
    city: "",
    pincode: "",
  });

  const statusOptions = [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
  ];

  /* UPDATE FIELD */
  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  /* FETCH DATA */
  useEffect(() => {
    const fetchParent = async () => {
      try {
        const res = await axios.get(`${Api_url.name}api/parents/${id}`);
        if (res.data?.parent) {
          const data = res.data.parent;
          setForm({
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            email: data.email || "",
            mobile: data.mobile || "",
            alternate_mobile: data.alternate_mobile || "",
            status: data.status || "active",
            address_line1: data.address_line1 || "",
            address_line2: data.address_line2 || "",
            country: data.country || "India",
            state: data.state || "",
            district: data.district || "",
            city: data.city || "",
            pincode: data.pincode || "",
          });
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchParent();
  }, [id]);

  /* SUBMIT */
  const submit = async (e) => {
    if (e) e.preventDefault();
    if (submittingRef.current) return;

    submittingRef.current = true;
    setLoading(true);

    try {
      // Submitting as JSON since image upload is removed
      const res = await axios.post(`${Api_url.name}api/update-parent/${id}`, form);

      if (res.data.status === 200) {
        navigate("/parents");
      } else {
        alert(res.data.message || "Update failed");
      }
    } catch (err) {
      if (err.response?.status === 422) setErrors(err.response.data.errors);
      else alert("Update failed. Please try again.");
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
       {/* FIXED PRELOADER: Stays at the top of the viewport below the header */}
        {loading && (
          <EditPreloader />
        )}
      <div className="bg-[#F8FAFC] min-h-screen">
        <form onSubmit={submit}>
          <div className="bg-white border-b border-gray-200 px-8 py-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <PageHeader prevRoute="/parents" breadcrumbParent="Parents" breadcrumbCurrent="Edit" title="Edit Parent" />
              <CustomButton
                text={loading ? "Updating..." : "Update Parent"}
                Icon={Save}
                onClick={submit}
                className="bg-[#faae1c] text-white"
                disabled={loading}
              />
            </div>
          </div>

          <div className="p-8 max-w-[1600px] mx-auto grid grid-cols-12 gap-8">
            {/* LEFT - AVATAR SECTION */}
            <div className="col-span-12 lg:col-span-3">
              <div className="bg-white rounded-3xl p-8 text-center sticky top-8 shadow-sm">
                <div className="w-40 h-40 mx-auto mb-6 rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                  <AvatarLetter text={`${form.first_name?.trim().charAt(0).toUpperCase() || "P"}`} />
                </div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Parent Profile</p>
              </div>
            </div>

            {/* RIGHT - FORM FIELDS */}
            <div className="col-span-12 lg:col-span-9">
              <div className="bg-white rounded-[2.5rem] p-10 shadow-sm">
                <section>
                  <h2 className="text-xl font-black mb-6 flex items-center gap-2 text-gray-800">
                    <User className="text-blue-600" size={24} /> Parent Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="First Name *" value={form.first_name} onChange={(e) => updateField("first_name", e.target.value)} error={errors.first_name} />
                    <Input label="Last Name" value={form.last_name} onChange={(e) => updateField("last_name", e.target.value)} />
                    <Input label="Email *" value={form.email} onChange={(e) => updateField("email", e.target.value)} error={errors.email} />
                    <Input label="Mobile Number *" value={form.mobile} onChange={(e) => updateField("mobile", e.target.value)} error={errors.mobile} />
                    <Input label="Alternate Mobile" value={form.alternate_mobile} onChange={(e) => updateField("alternate_mobile", e.target.value)} />
                    <CustomSelect label="Status" options={statusOptions} value={form.status} onChange={(val) => updateField("status", val)} />
                  </div>
                </section>

                <section className="mt-12 pt-10 border-t border-gray-100">
                  <h2 className="text-xl font-black mb-6 flex items-center gap-2 text-gray-800">
                    <Home className="text-green-600" size={24} /> Family Address
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <Input label="Address Line 1 *" value={form.address_line1} onChange={(e) => updateField("address_line1", e.target.value)} error={errors.address_line1} />
                    </div>
                    
                    {/* UPDATED ORDER: Country, State, District, City */}
                    <Input label="Country *" value={form.country} onChange={(e) => updateField("country", e.target.value)} />
                    <Input label="State *" value={form.state} onChange={(e) => updateField("state", e.target.value)} error={errors.state} />
                    <Input label="District *" value={form.district} onChange={(e) => updateField("district", e.target.value)} error={errors.district} />
                    <Input label="City *" value={form.city} onChange={(e) => updateField("city", e.target.value)} error={errors.city} />
                    
                    <Input label="Pincode *" value={form.pincode} onChange={(e) => updateField("pincode", e.target.value)} error={errors.pincode} />
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

function AvatarLetter({ text }) {
  return (
    <div
      className="w-full h-full flex items-center justify-center text-white text-5xl font-black shadow-inner"
      style={{ backgroundColor: "#FAAE1C" }}
    >
      {text}
    </div>
  );
}