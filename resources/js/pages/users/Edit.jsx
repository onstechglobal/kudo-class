import AdminLayout from "@/layouts/AdminLayout";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowLeft, Save, Eye, EyeOff, Camera } from "lucide-react";
import CustomButton from "@/components/form/CustomButton"; 
import Input from "@/components/form/Input";
import CustomSelect from "@/components/form/CustomSelect";
import StaticButtons from "../../components/common/StaticButtons";
import { Api_url } from "@/helpers/api";
import PageHeader from "../../components/common/PageHeader";
import EditPreloader from '../../components/common/EditPreloader';

export default function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();

  /* ================= STATE ================= */
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [roles, setRoles] = useState([]);
  const [imgError, setImgError] = useState(false);
  const [userRole, setUserRole] = useState("User");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  
  /* ================= FETCH ROLES ================= */
  useEffect(() => {
    axios
      .get(`${Api_url.name}api/roles`, { withCredentials: true })
      .then(res => {
        const list = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
            ? res.data.data
            : [];

        setRoles(
          list
            .filter(r => r.role_name?.toLowerCase() !== "admin")
            .sort((a, b) => Number(a.role_id) - Number(b.role_id))
            .map(r => ({
              value: String(r.role_id),
              label: r.role_name
                .toLowerCase()
                .replace(/\b\w/g, c => c.toUpperCase()),
            }))
        );
      })
      .catch(() => setRoles([]));
  }, []);

  const [form, setForm] = useState({
    role_id: "",
    status: "active",

    name: "",
    email: "",
    phone: "",

    username: "",
    password: "",

    // School
    school_name: "",
    board: "",
    address: "",
    city: "",
    state: "",
    country: "",
    pincode: "",

    // Teacher / Parent
    school_id: "",
    qualification: "",
  });

  /* ================= LOAD USER & SCHOOLS ================= */
  useEffect(() => {
    Promise.all([
      axios.get(`${Api_url.name}api/users/${id}`, { withCredentials: true }),
      axios.get(`${Api_url.name}api/school`, { withCredentials: true }),
    ])
      .then(([userRes, schoolRes]) => {
        const u = userRes.data.user;
        
        setForm({
          role_id: String(u.role_id),
          status: u.status || "active",

          name: u.name || "",
          email: u.email || "",
          phone: u.phone || "",

          username: u.username || "",
          password: "",

          school_name: u.school_name || "",
          board: u.board || "",
          address: u.address || "",
          city: u.city || "",
          state: u.state || "",
          country: u.country || "",
          pincode: u.pincode || "",

          school_id: String(u.school_id || ""),
          qualification: u.qualification || "",
        });
        
        if (u.photo_url && u.photo_url !== '') {
          var folderName = "";
          if(u.role_name=="Teacher"){
            folderName = "teachers";
          }else if(u.role_name=="Parent"){
            folderName = "parent";
          }else{
            folderName = "school";
          }
          setPreviewUrl(`/uploads/${folderName}/${u.photo_url}`);
          console.log(`/uploads/${folderName}/${u.photo_url}`);
        }
        setUserRole(u.role_name);

        const list = Array.isArray(schoolRes.data)
          ? schoolRes.data
          : Array.isArray(schoolRes.data?.data)
            ? schoolRes.data.data
            : [];

        setSchools(list);
      })
      .finally(() => setLoading(false));
  }, [id]);

  /* ================= FIELD CHANGE ================= */
  function updateField(name, value) {
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
    if(name=="role_id"){
      roles.map((r) => {
        if(r.value==value){
          setUserRole(r.label);
        }
      })
    }

  }

  /* ================= VALIDATION ================= */
  function validate() {
    const err = {};

    if (!form.role_id) err.role_id = "Role is required";

    if (!form.username) err.username = "Username is required";
    else if (form.username.length < 4)
      err.username = "Username must be at least 4 characters";

    if (form.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) err.email = "Invalid email address";
    }

    if (form.phone && !/^\d{10}$/.test(form.phone))
      err.phone = "Mobile must be 10 digits";

    // School
    if (form.role_id === "2") {
      if (!form.school_name) err.school_name = "School name required";
      if (!form.board) err.board = "Board required";
      if (!form.address) err.address = "Address required";
      if (!form.city) err.city = "City required";
      if (!form.state) err.state = "State required";
      if (!form.country) err.country = "Country required";
      if (!form.pincode) err.pincode = "Pincode required";
      if (!form.phone) err.phone = "Phone required";
    }

    // Teacher / Parent
    if (form.role_id === "3" || form.role_id === "4") {
      if (!form.school_id) err.school_id = "School required";
      if (!form.name) err.name = "Name required";
      if (!form.phone) err.phone = "Phone required";
    }

    if (form.role_id === "3" && !form.qualification)
      err.qualification = "Qualification required";

    // Password (optional)
    if (form.password && form.password.length < 6)
      err.password = "Password must be at least 6 characters";

    setErrors(err);
    return Object.keys(err).length === 0;
  }

  /* ================= File Upload ================= */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  /* ================= SUBMIT ================= */
  async function submit(e) {
    e.preventDefault();
    if (!validate()) return;

    try {
      const { data } = await axios.get(`${Api_url.name}api/csrf-token`, {
        withCredentials: true,
      });

      const payload = { ...form };

      const formData = new FormData();

      formData.append('_method', 'PUT');

      // append normal form fields
      Object.keys(form).forEach((key) => {
        if (key === "password" && !form.password) return; // keep old password
        formData.append(key, form[key]);
      });

      // append file if selected
      if (selectedFile) {
        formData.append("profile", selectedFile); // "file" should match backend field name
      }

      // ✅ KEEP OLD PASSWORD IF EMPTY
      if (!payload.password) delete payload.password;

      const response = await axios.post(`${Api_url.name}api/users/${id}`, formData, {
        headers: { "X-CSRF-TOKEN": data.csrfToken },
        withCredentials: true,
      });
      if(response.status==200){
        navigate('/admin/users', {
          state: { status: response.data.status, message: response.data.message }
        });
      }
    } catch (err) {
      console.error("Update failed", err);
    }
  }
  
  /* ================= UI ================= */
  return (
    <AdminLayout>

      {/* FIXED PRELOADER: Stays at the top of the viewport below the header */}
      {loading && (
        <EditPreloader />
      )}

      <div className="bg-[#F8FAFC] min-h-screen p-6">

        {/* HEADER */}
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

            <PageHeader
              prevRoute="/admin/users"
              breadcrumbParent="Users"
              breadcrumbCurrent="Edit"
              title="Edit User"
            />
          </div>
        </div>

        {/* CONTENT */}
        <div className="sm:p-8 max-w-[1600px] mx-auto sm:grid sm:grid-cols-12 sm:gap-8">

          {/* LEFT CARD */}
          <div className="py-8 sm:py-0 col-span-12 md:col-span-4 xl:col-span-3">
            <div className="bg-white rounded-3xl p-4 border border-gray-200 shadow-sm text-center">

              <div className="relative w-40 h-40 mx-auto mb-6">
                <div className="w-full h-full rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                  {previewUrl && !imgError ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        setImgError(true)
                      }}
                    />
                  ) : (
                    <AvatarLetter text={userRole} />
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
              <h3 className="text-lg font-medium text-gray-900 mt-2">{userRole}</h3>
            </div>
          </div>

          {/* RIGHT */}
          <div className="col-span-12 md:col-span-8 xl:col-span-9 bg-white rounded-[2.5rem] p-10 border border-gray-200">

            <h2 className="font-bold text-lg mb-6">Basic Details</h2>

            <div className="grid md:grid-cols-2 gap-8">
              <CustomSelect label="Role" value={form.role_id}
                onChange={v => updateField("role_id", v)}
                error={errors.role_id} options={roles} />

              <CustomSelect label="Status" value={form.status}
                onChange={v => updateField("status", v)}
                options={[
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]} />

              <Input label="Email" value={form.email}
                onChange={e => updateField("email", e.target.value)}
                error={errors.email} />

              <Input label="Mobile" value={form.phone}
                onChange={e => updateField("phone", e.target.value)}
                error={errors.phone} />

              {form.role_id === "2" && (
                <>
                  <Input label="School Name" value={form.school_name}
                    onChange={e => updateField("school_name", e.target.value)}
                    error={errors.school_name} />

                  <CustomSelect label="Board" value={form.board}
                    onChange={v => updateField("board", v)}
                    error={errors.board}
                    options={[
                      { value: "CBSC", label: "CBSC" },
                      { value: "ICSE", label: "ICSE" },
                      { value: "State", label: "State Board" },
                    ]} />

                  <Input label="Address" value={form.address}
                    onChange={e => updateField("address", e.target.value)}
                    error={errors.address} />

                  <Input label="Country" value={form.country}
                    onChange={e => updateField("country", e.target.value)}
                    error={errors.country} />

                  <Input label="State" value={form.state}
                    onChange={e => updateField("state", e.target.value)}
                    error={errors.state} />

                  <Input label="City" value={form.city}
                    onChange={e => updateField("city", e.target.value)}
                    error={errors.city} />

                  <Input label="Pincode" value={form.pincode}
                    onChange={e => updateField("pincode", e.target.value)}
                    error={errors.pincode} />
                </>
              )}

              {(form.role_id === "3" || form.role_id === "4") && (
                <>
                  <CustomSelect label="School" value={form.school_id}
                    onChange={v => updateField("school_id", v)}
                    error={errors.school_id}
                    options={schools.map(s => ({
                      value: String(s.school_id),
                      label: s.school_name,
                    }))} />

                  <Input label={form.role_id === "3" ? "Teacher Name" : "Parent Name"}
                    value={form.name}
                    onChange={e => updateField("name", e.target.value)}
                    error={errors.name} />

                  {form.role_id === "3" && (
                    <Input label="Qualification"
                      value={form.qualification}
                      onChange={e => updateField("qualification", e.target.value)}
                      error={errors.qualification} />
                  )}
                </>
              )}
            </div>

            <h2 className="font-bold text-lg mt-10 mb-6">Configuration</h2>

            <div className="grid md:grid-cols-2 gap-8">
              <Input label="Username" value={form.username}
                onChange={e => updateField("username", e.target.value)}
                error={errors.username} />

              <div className="relative">
                <Input
                  label="Password (leave blank to keep old password)"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={e => updateField("password", e.target.value)}
                  error={errors.password}
                />
                <button type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-10 text-gray-500">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

          </div>
        </div>
        <StaticButtons saveText="Update User" saveClick={submit} />
      </div>
    </AdminLayout>
  );
}

/* ================= AVATAR ================= */
function AvatarLetter({ text }) {
  const letter = text?.trim()?.charAt(0)?.toUpperCase() || "U";
  return (
    <div
      className="w-32 h-32 mx-auto rounded-3xl flex items-center justify-center
      text-white text-5xl font-black"
      style={{ backgroundColor: "#FAAE1C" }}
    >
      {letter}
    </div>
  );
}
