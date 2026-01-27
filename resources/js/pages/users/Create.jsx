import AdminLayout from "@/layouts/AdminLayout";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Save, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import Input from "@/components/form/Input";
import CustomSelect from "@/components/form/CustomSelect";
import CustomButton from "@/components/form/CustomButton";
import { Api_url } from "@/helpers/api";

/* ================= HELPERS ================= */
function generatePassword(length = 10) {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$!";
  return Array.from({ length }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
}

function slugify(text = "") {
  return text.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export default function CreateUser() {
  const navigate = useNavigate();

  /* ================= ROLES ================= */
  const roles = [
    { value: "2", label: "School" },
    { value: "3", label: "Teacher" },
    { value: "4", label: "Parent" },
  ];

  /* ================= STATE ================= */
  const [schools, setSchools] = useState([]);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [autoGenerate, setAutoGenerate] = useState(true);

  const [form, setForm] = useState({
    role_id: "",
    status: "active",

    name: "",      // Teacher / Parent name
    email: "",    
    username: "",
    password: generatePassword(),

    // school
    school_name: "",
    board: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    pincode: "",

    // teacher / parent
    school_id: "",
    qualification: "",
  });

  /* ================= FETCH SCHOOLS ================= */
  useEffect(() => {
    axios
      .get(`${Api_url.name}school`, { withCredentials: true })
      .then(res => {
        const response = res.data;
        const list =
          Array.isArray(response)
            ? response
            : Array.isArray(response.data)
            ? response.data
            : Array.isArray(response.schools)
            ? response.schools
            : [];
        setSchools(list);
      })
      .catch(() => setSchools([]));
  }, []);

  /* ================= AUTO USERNAME ================= */
  useEffect(() => {
  if (!autoGenerate) return;

  let username = "";

  if (form.role_id === "2" && form.school_name) {
    username = `sch_${slugify(form.school_name)}`;
  }

  if (form.role_id === "3" && form.phone) {
    username = `tr_${form.phone.replace(/\D/g, "")}`;
  }

  if (form.role_id === "4" && form.phone) {
    username = `par_${form.phone.replace(/\D/g, "")}`;
  }

  setForm(prev => ({
    ...prev,
    username,
    password: autoGenerate ? generatePassword() : prev.password,
  }));
}, [form.role_id, form.school_name, form.phone, autoGenerate]);


  /* ================= FIELD UPDATE ================= */
  function updateField(name, value) {
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  }

  /* ================= ROLE CHANGE ================= */
  function handleRoleChange(val) {
    setForm({
      role_id: val,
      status: "active",
      name: "",
      email: "",
      username: "",
      password: generatePassword(),

      school_name: "",
      board: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      country: "",
      pincode: "",

      school_id: "",
      qualification: "",
    });
    setErrors({});
  }

  /* ================= VALIDATION ================= */
  function validate() {
  const err = {};

  if (!form.role_id) err.role_id = "Role is required";
  
  if(!form.username){
    err.username = "Username is required";
  }else if(form.username.length < 4){
    err.username = "Username must be at least 4 characters";
  }

  if(!form.password){
    err.password = "Password is required";
  }else if(form.password.length < 8) {
    err.password = "Password must be at least 8 characters";
  }

  if (form.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      err.email = "Invalid email address";
    }
  }

  if (form.role_id === "2") {
    if (!form.school_name) err.school_name = "School name required";
    if (!form.board) err.board = "Board required";
    if (!form.phone) err.phone = "Phone required";
     if (!form.address) err.address = "Address required";
    if (!form.city) err.city = "City is required";
    if (!form.state) err.state = "State is required";
    if (!form.country) err.country = "Country is required";
    if (!form.pincode) err.pincode = "Pincode is required";
  }

  if (form.role_id === "3" || form.role_id === "4") {
    if (!form.school_id) err.school_id = "School required";
    if (!form.phone) err.phone = "Phone required";
    if (!form.name) err.name = "Name is required";
  }

  setErrors(err);
  return Object.keys(err).length === 0;
}


  /* ================= SUBMIT ================= */
  async function submit(e) {
    e.preventDefault();
    if (!validate()) return;

    try {
      const { data } = await axios.get(
        `${Api_url.name}csrf-token`,
        { withCredentials: true }
      );

      await axios.post(`${Api_url.name}users`, form, {
        headers: {
          "X-CSRF-TOKEN": data.csrfToken,
        },
        withCredentials: true,
      });

      navigate("/admin/users");
    } catch (err) {
      console.error("Create user failed", err);
    }
  }

  /* ================= UI ================= */
  return (
    <AdminLayout>
      <div className="bg-[#F8FAFC] min-h-screen p-6">

        {/* HEADER */}
        <div className="bg-white border-b border-gray-200 px-8 py-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Link to="/admin/users">
                  <button type="button" className="p-2 hover:bg-gray-100 rounded-full text-gray-400 cursor-pointer">
                    <ArrowLeft size={20} />
                  </button>
                </Link>
                <div>
                  <nav className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">
                    <Link to="/admin/users">Users</Link> / <Link>Add</Link>
                  </nav>
                  <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                    Add User
                  </h1>
                </div>
              </div>
              <CustomButton
                text="Save User"
                Icon={Save}
                className="bg-[#faae1c] text-white hover:bg-[#faae1c]/85"
                to="#"
                onClick={submit}
              />
            </div>
          </div>

        {/* CONTENT */}
        <div className="sm:p-8 max-w-[1600px] mx-auto">
          <div className="sm:grid sm:grid-cols-12 sm:gap-8">

            {/* LEFT CARD */}
            <div className="py-8 sm:py-0 col-span-12 md:col-span-4 xl:col-span-3">
              <div className="bg-white rounded-3xl p-6 border border-gray-200 text-center">
                <AvatarLetter text={form.username} />
                <p className="mt-4 text-s text-gray-400 uppercase">
                  {roles.find(r => r.value === form.role_id)?.label || "Role"}
                </p>
              </div>
            </div>

            {/* RIGHT FORM */}
            <div className="col-span-12 md:col-span-8 xl:col-span-9 bg-white rounded-[2.5rem] p-10 border border-gray-200">

              {/* BASIC DETAILS */}
              <h2 className="font-bold text-lg mb-6">Basic Details</h2>

              <div className="grid md:grid-cols-2 gap-8">
                <CustomSelect
                  label="Role"
                  value={form.role_id}
                  onChange={handleRoleChange}
                  error={errors.role_id}
                  options={roles}
                />

                <CustomSelect
                  label="Status"
                  value={form.status}
                  onChange={val => updateField("status", val)}
                  options={[
                    { value: "active", label: "Active" },
                    { value: "inactive", label: "Inactive" },
                  ]}
                />

                {/* ✅ EMAIL FIELD (OPTIONAL) */}
                <Input
                  label="Email (optional)"
                  value={form.email}
                  onChange={e => updateField("email", e.target.value)}
                  error={errors.email}
                />

                {form.role_id === "2" && (
                  <>
                    <Input label="School Name" value={form.school_name}
                      onChange={e => updateField("school_name", e.target.value)}
                      error={errors.school_name} />
                    <Input label="Phone" value={form.phone}
                      onChange={e => updateField("phone", e.target.value)}
                      error={errors.phone} />
                    
                    <CustomSelect
                      label="Board"
                      value={form.board}
                      onChange={val => updateField("board", val)}
                      error={errors.board}
                      options={[
                        { value: "CBSC", label: "CBSC" },
                        { value: "ICSE", label: "ICSE" },
                        { value: "State", label: "State Board" },
                      ]}
                    />

                    <Input label="Address" value={form.address}
                      onChange={e => updateField("address", e.target.value)} 
                       error={errors.address}
                    />

                    {/* ✅ NEW SCHOOL-ONLY FIELDS */}
                    <Input
                      label="Country"
                      value={form.country}
                      onChange={e => updateField("country", e.target.value)}
                      error={errors.country}
                    />

                    <Input
                      label="State"
                      value={form.state}
                      onChange={e => updateField("state", e.target.value)}
                      error={errors.state}
                    />

                    <Input
                      label="City"
                      value={form.city}
                      onChange={e => updateField("city", e.target.value)}
                      error={errors.city}
                    />

                    <Input
                      label="Pincode"
                      value={form.pincode}
                      onChange={e => updateField("pincode", e.target.value)}
                      error={errors.pincode}
                    />
                  </>
                )}

                {(form.role_id === "3" || form.role_id === "4") && (
                  <>
                    <CustomSelect
                      label="School"
                      value={form.school_id}
                      onChange={val => updateField("school_id", val)}
                      error={errors.school_id}
                      options={schools.map(s => ({
                        value: String(s.school_id),
                        label: s.school_name,
                      }))}
                    />

                    {form.role_id === "3" && (
                      <>
                        <Input
                          label="Teacher Name"
                          value={form.name}
                          onChange={e => updateField("name", e.target.value)}
                          error={errors.name}
                        />
                        <Input label="Qualification"
                          value={form.qualification}
                          onChange={e => updateField("qualification", e.target.value)}
                          error={errors.qualification}
                        />
                      </>
                    )}

                    {form.role_id === "4" && (
                      <Input
                        label="Parent Name"
                        value={form.name}
                        onChange={e => updateField("name", e.target.value)}
                        error={errors.name}
                      />
                    )}

                    <Input label="Mobile Number"
                      value={form.phone}
                      onChange={e => updateField("phone", e.target.value)}
                      error={errors.phone} />

                  </>
                )}
              </div>

              {/* CONFIGURATION */}
              <h2 className="font-bold text-lg mt-10 mb-6">Configuration</h2>

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
                  onChange={e => updateField("username", e.target.value)}
                  error={errors.username}
                />

                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={e => updateField("password", e.target.value)}
                    error={errors.password}
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

            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function AvatarLetter({ text }) {
  const letter = text?.trim()?.charAt(0)?.toUpperCase() || "U";

  return (
    <div
      className="w-32 h-32 mx-auto rounded-3xl flex items-center justify-center text-white text-5xl font-black shadow-sm border border-gray-200"
      style={{ backgroundColor: "#FAAE1C" }}
    >
      {letter}
    </div>
  );
}