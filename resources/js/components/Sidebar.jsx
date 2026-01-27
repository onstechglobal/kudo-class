import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { ChevronDown, Power } from "lucide-react";
import api from "../helpers/api";
import "../style.css";
 
export default function Sidebar({ open, onClose }) {
  const location = useLocation();
 
  const isAclRoute =
    location.pathname.startsWith("/admin/users") ||
    location.pathname.startsWith("/admin/roles") ||
    location.pathname.startsWith("/admin/permissions");
 
  const [aclOpen, setAclOpen] = useState(isAclRoute);
 
  useEffect(() => {
    if (isAclRoute) setAclOpen(true);
  }, [isAclRoute]);
 
  const linkClass = ({ isActive }) =>
    `block px-3 py-3 rounded-xl font-medium text-[18px] transition-all duration-200 leading-none focus-visible:outline-none ${isActive
      ? "bg-white text-[#0468c3] shadow-md"
      : "text-slate-200 hover:bg-white/10"
    }`;
 
  const aclLinkClass = ({ isActive }) =>
    `block px-3 py-3 rounded-xl font-medium text-[16px] transition-all duration-200 leading-none focus-visible:outline-none ${isActive
      ? "bg-white text-[#0468c3] shadow-md"
      : "text-slate-200 hover:bg-white/10"
    }`;
 
 
  const base =
    "block rounded-xl px-4 py-3 text-sm font-medium transition";
 
  const logout = async () => {
    try {
      await api.post("/logout"); // Laravel session destroy
    } catch (e) {
      console.error("Logout failed", e);
    }
 
    localStorage.removeItem("user");
    window.location.href = "/";
  };
 
  return (
    <>
      {/* OVERLAY */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden"
        />
      )}
 
      <aside
        className={`fixed left-0 top-0 z-[999] h-full w-[260px] bg-[#0468C3] transition-transform duration-300 pb-6 pt-8 flex flex-col
        ${open ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      >
        {/* LOGO */}
        <div className="mb-10 flex items-center gap-2 text-2xl font-bold text-white px-6">
          <img src="/images/app_logo.png" alt="Header Logo" width="60px" />
          KudoClass
        </div>
 
        {/* NAV */}
        <nav className="flex-1 overflow-y-auto px-6 space-y-1 custom-scrollbar">
          <NavLink to="/dashboard" onClick={onClose} className={linkClass}>
            Dashboard
          </NavLink>
 
          <NavLink to="/school" onClick={onClose} className={linkClass}>
            School
          </NavLink>
 
          <NavLink to="/academic-year" onClick={onClose} className={linkClass}>
            Academic Year
          </NavLink>
 
          <NavLink to="/teachers" onClick={onClose} className={linkClass}>
            Teachers
          </NavLink>
 
          <NavLink to="/staff" onClick={onClose} className={linkClass}>
            Staff
          </NavLink>
 
          <NavLink to="/students" onClick={onClose} className={linkClass}>
            Students
          </NavLink>
		  
		  <NavLink to="/classes" onClick={onClose} className={linkClass}>
            Classes
          </NavLink>

          <NavLink to="/sections" onClick={onClose} className={linkClass}>
            Sections
          </NavLink>
 
 
 
          {/* --- ACCESS CONTROL DROPDOWN --- */}
          <div className="">
            <button
              onClick={() => setAclOpen(!aclOpen)}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-[18px] rounded transition cursor-pointer font-medium ${aclOpen
                  ? "bg-white/10 text-white"
                  : "text-slate-200 hover:bg-white/10"
                }`}
            >
              <span>Access Control</span>
 
              <ChevronDown
                size={16}
                className={`transition-transform duration-300 ${aclOpen ? "rotate-180" : ""
                  }`}
              />
            </button>
 
            {aclOpen && (
				<div className="mt-1 ml-4 border-l-2 border-white/10 space-y-1">
					<NavLink to="/admin/users" onClick={onClose} className={aclLinkClass}>
						Users
					</NavLink>
					<NavLink to="/admin/roles" onClick={onClose} className={aclLinkClass}>
						Roles
					</NavLink>
					<NavLink to="/admin/permissions" onClick={onClose} className={aclLinkClass}>
						Permissions
					</NavLink>
				</div>
			)}
          </div>
        </nav>
		
		{/* LOGOUT - Changed from fixed to mt-auto within the flex container */}
		<div className="p-6 mt-auto shrink-0">
			<div className="flex items-center gap-3 px-3 py-2 rounded text-[18px] transition transition-all duration-200 text-slate-200 hover:bg-white/10 cursor-pointer">
				<button className="flex items-center gap-2 hover:text-blue-300 w-full" onClick={logout}>
					<Power size={18} />
					Logout
				</button>
			</div>
		</div>
      </aside>
    </>
  );
}