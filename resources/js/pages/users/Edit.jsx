import AdminLayout from "@/layouts/AdminLayout";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowLeft, Save, Eye, EyeOff } from "lucide-react";
import CustomButton from "@/components/form/CustomButton";
import Input from "@/components/form/Input";
import CustomSelect from "@/components/form/CustomSelect";
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

export default function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();

  /* ================= ROLES ================= */
  const roles = [
    { value: "2", label: "School" },
    { value: "3", label: "Teacher" },
    { value: "4", label: "Parent" },
  ];

  /* ================= STATE ================= */
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    role_id: "",
    status: "active",

    name: "", // Teacher/Parent Name
    username: "",
    password: "",
    email: "",
    phone: "",

    // School
    school_name: "",
    board: "",
    address: "",

    // Teacher / Parent
    school_id: "",
    qualification: "",
  });

  /* ================= LOAD USER & SCHOOLS ================= */
  useEffect(() => {
    Promise.all([
      axios.get(`${Api_url.name}users/${id}`, { withCredentials: true }),
      axios.get(`${Api_url.name}school`, { withCredentials: true }),
    ])
      .then(([userRes, schoolRes]) => {
        const u = userRes.data;

        setForm({
          role_id: String(u.role_id),
          status: u.status || "active",

          name: u.name || "",
          username: u.username || "",
          password: generatePassword(),
          email: u.email || "",
          phone: u.phone || "",

          school_name: u.school_name || "",
          board: u.board || "",
          address: u.address || "", // <-- FIXED

          school_id: String(u.school_id || ""),
          qualification: u.qualification || "",
        });

        const list =
          Array.isArray(schoolRes.data)
            ? schoolRes.data
            : Array.isArray(schoolRes.data?.data)
            ? schoolRes.data.data
            : [];
        setSchools(list);
      })
      .finally(() => setLoading(false));
  }, [id]);

  /* ================= AUTO USERNAME ================= */
  useEffect(() => {
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

    setForm(prev => ({ ...prev, username }));
  }, [form.role_id, form.school_name, form.phone]);

  /* ================= FIELD CHANGE ================= */
  function updateField(name, value) {
    setForm(prev => ({ ...prev, [name]: value }));
  }

  /* ================= SUBMIT ================= */
  async function submit(e) {
    e.preventDefault();
    try {
      const { data } = await axios.get(`${Api_url.name}csrf-token`, {
        withCredentials: true,
      });

      await axios.put(`${Api_url.name}users/${id}`, form, {
        headers: { "X-CSRF-TOKEN": data.csrfToken },
        withCredentials: true,
      });

      navigate("/admin/users");
    } catch (err) {
      console.error("Update failed", err);
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8">Loading...</div>
      </AdminLayout>
    );
  }

  /* ================= UI ================= */
  return (
    <AdminLayout>
      <div className="bg-[#F8FAFC] min-h-screen">

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
                    Users / Edit User
                  </nav>
                  <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                    Edit User
                  </h1>
                </div>
              </div>
              <CustomButton
				  text="Update User"
				  Icon={Save}
				  className="bg-[#faae1c] text-white hover:bg-[#faae1c]/85"
				  to="#"
				  onClick={submit}
				/>
            </div>
          </div>

        {/* CONTENT */}
        <div className="p-8 max-w-[1600px] mx-auto">
          <div className="grid grid-cols-12 gap-8">

            {/* LEFT CARD */}
            <div className="col-span-12 lg:col-span-3 xl:col-span-2">
              <div className="bg-white rounded-3xl p-6 border border-gray-200 text-center">
                <AvatarLetter text={form.username} />

                <h3 className="mt-4 font-black">{form.username || "User"}</h3>

                <p className="text-xs text-gray-400 uppercase">
                  {roles.find(r => r.value === form.role_id)?.label || "Role"}
                </p>
              </div>
            </div>

            {/* RIGHT FORM */}
            <div className="col-span-12 lg:col-span-9 xl:col-span-10 bg-white rounded-[2.5rem] p-10 border border-gray-300">

              {/* BASIC DETAILS */}
              <h2 className="font-bold text-lg mb-6">Basic Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <CustomSelect
                  label="Role"
                  value={form.role_id}
                  onChange={val => updateField("role_id", val)}
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

                <Input
                  label="Email"
                  value={form.email}
                  onChange={e => updateField("email", e.target.value)}
                />

                <Input
                  label="Mobile"
                  value={form.phone}
                  onChange={e => updateField("phone", e.target.value)}
                />

                {form.role_id === "2" && (
                  <>
                    <Input
                      label="School Name"
                      value={form.school_name}
                      onChange={e =>
                        updateField("school_name", e.target.value)
                      }
                    />
                    <Input
                      label="Board"
                      value={form.board}
                      onChange={e => updateField("board", e.target.value)}
                    />
                    <Input
                      label="Address"
                      value={form.address}
                      onChange={e => updateField("address", e.target.value)}
                    />
                  </>
                )}

                {(form.role_id === "3" || form.role_id === "4") && (
                  <>
                    <CustomSelect
                      label="School"
                      value={form.school_id}
                      onChange={val => updateField("school_id", val)}
                      options={[
                        { value: "", label: "Select School" },
                        ...schools.map(s => ({
                          value: String(s.school_id),
                          label: s.school_name,
                        })),
                      ]}
                    />

                    {form.role_id === "3" && (
                      <>
                        <Input
                          label="Teacher Name"
                          value={form.name}
                          onChange={e => updateField("name", e.target.value)}
                        />
                        <Input
                          label="Qualification"
                          value={form.qualification}
                          onChange={e =>
                            updateField("qualification", e.target.value)
                          }
                        />
                      </>
                    )}

                    {form.role_id === "4" && (
                      <Input
                        label="Parent Name"
                        value={form.name}
                        onChange={e => updateField("name", e.target.value)}
                      />
                    )}
                  </>
                )}
              </div>

              {/* CONFIGURATION */}
              <h2 className="font-bold text-lg mt-10 mb-6">Configuration</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Input label="Username" value={form.username} disabled />

                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    disabled
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-10 text-gray-500"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
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