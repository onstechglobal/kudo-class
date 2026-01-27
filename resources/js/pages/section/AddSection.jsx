import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Save,
  BookOpen,
  User,
  CheckCircle2,
} from "lucide-react";

import AdminLayout from "@/layouts/AdminLayout";
import Input from "@/components/form/Input";
import CustomSelect from "@/components/form/CustomSelect";
import CustomButton from "@/components/form/CustomButton";
import { Api_url } from "@/helpers/api";

export default function AddSection() {
  const navigate = useNavigate();
  const submittingRef = useRef(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);

  /* FORM */
  const [form, setForm] = useState({
    class_id: "",
    section_name: "",
    class_teacher_id: "",
    status: "active",
  });

  const [errors, setErrors] = useState({});

  const statusOptions = [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
  ];

  /* FETCH CLASSES AND TEACHERS */
  useEffect(() => {
    // CHANGED FROM sections/classes TO section/classes
    axios.get(`${Api_url.name}section/classes`)
      .then(res => {
        const classOptions = Array.isArray(res.data) ? res.data.map(c => ({
          label: c.class_name,
          value: c.class_id
        })) : [];
        setClasses(classOptions);
      })
      .catch(err => console.error("Error fetching classes:", err));

    // CHANGED FROM sections/teachers TO section/teachers
    axios.get(`${Api_url.name}section/teachers`)
      .then(res => {
        const teacherOptions = Array.isArray(res.data) ? res.data.map(t => ({
          label: t.name,
          value: t.teacher_id
        })) : [];
        teacherOptions.unshift({ label: "Select Teacher (Optional)", value: "" });
        setTeachers(teacherOptions);
      })
      .catch(err => console.error("Error fetching teachers:", err));
  }, []);

  /* UPDATE FIELD */
  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  /* VALIDATION */
  const validate = () => {
    const err = {};

    if (!form.class_id) err.class_id = "Class is required";
    if (!form.section_name.trim()) err.section_name = "Section name is required";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  /* SUBMIT */
  const submit = async (e) => {
    e.preventDefault();

    if (submittingRef.current) return;
    if (!validate()) return;

    submittingRef.current = true;
    setLoading(true);

    try {
      // CHANGED FROM sections TO section
      const res = await axios.post(
        `${Api_url.name}section`,
        form,
        { 
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          } 
        }
      );

      if (res.data.status === 200) {
        setSuccess(true);
      } else {
        alert(res.data.message || "Failed to add section");
      }
    } catch (err) {
      console.error("Add section error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to add section. Please try again.");
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
                {/* CHANGED FROM /sections TO /section */}
                <Link to="/sections">
                  <button type="button" className="p-2 hover:bg-gray-100 rounded-full text-gray-400 cursor-pointer">
                    <ArrowLeft size={20} />
                  </button>
                </Link>
                <div>
                  {/* CHANGED FROM Sections to Section */}
                  <nav className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">
                    <Link to="/sections">Section</Link> / <Link>Add</Link>
                  </nav>
                  <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                    Add Section
                  </h1>
                </div>
              </div>
              <CustomButton
                text={loading ? "Saving..." : "Save Section"}
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
                      <AvatarLetter text={form.section_name?.charAt(0) || 'S'} />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Section Avatar (Initials)
                  </p>
                </div>
              </div>

              {/* RIGHT - FORM FIELDS */}
              <div className="col-span-12 lg:col-span-9">
                <div className="bg-white rounded-[2.5rem] p-10 space-y-12">
                  {/* BASIC DETAILS */}
                  <section>
                    <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                      <BookOpen className="text-blue-600" />
                      Section Details
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <CustomSelect
                        label="Class *"
                        options={classes}
                        value={form.class_id}
                        onChange={(val) => updateField("class_id", val)}
                        error={errors.class_id}
                        required
                      />
                      
                      <Input 
                        label="Section Name *" 
                        value={form.section_name} 
                        onChange={(e) => updateField("section_name", e.target.value)} 
                        error={errors.section_name} 
                        required
                        placeholder="e.g., A, B, C or Section 1"
                      />
                      
                      <CustomSelect
                        label="Class Teacher"
                        options={teachers}
                        value={form.class_teacher_id}
                        onChange={(val) => updateField("class_teacher_id", val)}
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
          {success && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-8 max-w-md text-center">
                <CheckCircle2 className="mx-auto text-[#faae1c]" size={48} />
                <h3 className="text-xl font-bold mt-4">
                  Section Added Successfully
                </h3>
                <button
                  type="button"
                  // CHANGED FROM /sections TO /section
                  onClick={() => navigate("/sections")}
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