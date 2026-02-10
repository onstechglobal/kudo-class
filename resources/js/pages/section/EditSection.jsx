import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Save, BookOpen, Loader2 } from "lucide-react";

import AdminLayout from "@/layouts/AdminLayout";
import Input from "@/components/form/Input";
import CustomSelect from "@/components/form/CustomSelect";
import CustomButton from "@/components/form/CustomButton";
import { Api_url } from "@/helpers/api";
import PageHeader from "../../components/common/PageHeader";
import StaticButtons from "../../components/common/StaticButtons";

export default function EditSection() {
  const navigate = useNavigate();
  const { id } = useParams();
  const submittingRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [schoolId, setSchoolId] = useState(null);

  /* FORM STATE */
  const [form, setForm] = useState({
    school_id: "",
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

  /* INITIAL FETCH */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setSchoolId(user.school_id);

      // 1. Fetch Classes for this school
      axios.get(`${Api_url.name}api/get-classes`, { params: { school_id: user.school_id } })
        .then(res => {
          const classOptions = Array.isArray(res.data.data) ? res.data.data.map(c => ({
            label: c.class_name,
            value: c.class_id
          })) : [];
          setClasses(classOptions);
        })
        .catch(err => console.error("Error fetching classes:", err));

      // 2. Fetch Teachers for this school
      axios.get(`${Api_url.name}api/teacher`, { params: { school_id: user.school_id } })
        .then(res => {
          const teacherOptions = Array.isArray(res.data) ? res.data.map(t => ({
            label: `${t.first_name} ${t.last_name || ''}`,
            value: t.teacher_id,
            designation: t.designation
          })) : [];
          teacherOptions.unshift({ label: "Select Teacher", value: "", designation: null });
          setTeachers(teacherOptions);
        })
        .catch(err => console.error("Error fetching teachers:", err));

      // 3. Fetch specific section data
      fetchSection(user.school_id);
    }
  }, [id]);

  const fetchSection = async (sId) => {
    try {
      const res = await axios.get(`${Api_url.name}api/section/${id}`);
      if (res.data.section) {
        const data = res.data.section;
        setForm({
          school_id: sId,
          class_id: data.class_id || "",
          section_name: data.section_name || "",
          class_teacher_id: data.class_teacher_id || "",
          status: data.status || "active",
        });
      }
    } catch (err) {
      console.error("Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const err = {};
    if (!form.class_id) err.class_id = "Class is required";
    if (!form.section_name.trim()) err.section_name = "Section name is required";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (submittingRef.current || !validate()) return;

    submittingRef.current = true;
    setLoading(true);

    try {
      // Note: Endpoint changed to update-section/id
      const res = await axios.post(`${Api_url.name}api/update-section/${id}`, form);

      if (res.data.status === 200) {
        navigate('/sections', {
          state: { status: 'success', message: 'Section updated successfully!', activeTab: 'sections' } 
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update section.");
      submittingRef.current = false;
      setLoading(false);
    }
  };

  if (loading && !form.section_name) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <Loader2 className="animate-spin text-blue-600" size={40} />
          <p className="text-gray-500 font-medium">Loading details...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="bg-[#F8FAFC] min-h-screen p-6">
        <form onSubmit={submit}>
          <div className="bg-white border-b border-gray-200 px-8 py-5 rounded-t-[2.5rem]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <PageHeader
                prevRoute="/sections"
                breadcrumbParent="Academics"
                breadcrumbCurrent="Edit Section"
                title="Edit Section"
              />
            </div>
          </div>

          <div className="p-8 max-w-[1200px] mx-auto">
            <div className="bg-white rounded-[2.5rem] p-10 border border-gray-200 shadow-sm">
              <section>
                <h2 className="text-xl font-black mb-8 flex items-center gap-2">
                  <BookOpen className="text-blue-600" />
                  Section Configuration
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                  <CustomSelect 
                    label="Class *" 
                    options={classes} 
                    value={form.class_id} 
                    onChange={(val) => updateField("class_id", val)} 
                    error={errors.class_id} 
                  />
                  
                  <Input 
                    label="Section Name *" 
                    value={form.section_name} 
                    onChange={(e) => updateField("section_name", e.target.value)} 
                    error={errors.section_name} 
                    placeholder="e.g., A or Blue"
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
          <StaticButtons saveText="Update Section" saveClick={submit} dataLoading={submittingRef.current} />
        </form>
      </div>
    </AdminLayout>
  );
}