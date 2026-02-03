import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Power } from "lucide-react";
import api from "../../helpers/api";
import "../../style.css";

export default function Sidebar({ open, onClose }) {
  const location = useLocation();

  // 1. Get user data
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const permissions = userData.permissions || [];
  
  // 2. Robust Admin Check (handles both string "1" and number 1)
  const isAdmin = userData.role_id == 1; 

  // Debugging: Remove this once it works
  console.log("Current Role ID:", userData.role_id, "Is Admin:", isAdmin);

  // 3. Permission Helper
  const hasPermission = (moduleName) => {
    if (isAdmin) return true; 
    return permissions.some(p => p.module === moduleName);
  };

  /* Classes & sections Routes and data */
  const isLevelsRoute =
    location.pathname.startsWith("/classes") ||
    location.pathname.startsWith("/sections");

  const [levelOpen, setLevelOpen] = useState(isLevelsRoute);
  const levelRef = useRef(null);

  useEffect(() => {
    if (isLevelsRoute) setLevelOpen(true);
  }, [isLevelsRoute]);

  useEffect(() => {
    if (levelOpen && levelRef.current) {
      levelRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: 'nearest',
      });
    }
  }, [levelOpen]);

  /* Acl Routes and data */
  const isAclRoute =
    location.pathname.startsWith("/admin/users") ||
    location.pathname.startsWith("/admin/roles") ||
    location.pathname.startsWith("/admin/permissions");

  const [aclOpen, setAclOpen] = useState(isAclRoute);
  const aclRef = useRef(null);
  const navRef = useRef(null);

  useEffect(() => {
    if (isAclRoute) setAclOpen(true);
  }, [isAclRoute]);

  useEffect(() => {
    if (aclOpen && aclRef.current) {
      aclRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: 'nearest',
      });
    }
  }, [aclOpen]);

  useEffect(() => {
    if (navRef.current) {
      const activeLink = navRef.current.querySelector(".active");
      if (activeLink) {
        activeLink.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
      }
    }
  }, [location.pathname]);

  const linkClass = ({ isActive }) =>
    `block px-3 py-3 rounded-xl font-medium text-[18px] transition-all duration-200 leading-none focus-visible:outline-none ${isActive
      ? "bg-white text-[#0468c3] shadow-md active"
      : "text-slate-200 hover:bg-white/10"
    }`;

  const aclLinkClass = ({ isActive }) =>
    `block px-3 py-3 rounded-xl font-medium text-[16px] transition-all duration-200 leading-none focus-visible:outline-none ${isActive
      ? "bg-white text-[#0468c3] shadow-md active"
      : "text-slate-200 hover:bg-white/10"
    }`;

  const logout = async () => {
    try {
      await api.post("api/logout");
    } catch (e) {
      console.error("Logout failed", e);
    }
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-[999] h-full w-[260px] bg-[#0468C3]
        transition-transform duration-300 pb-6 pt-6 flex flex-col
        ${open ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      >
        <div className="mb-8 flex items-center gap-2 text-2xl font-bold text-white px-6">
          <img src="/images/app_logo.png" alt="Header Logo" width="60px" />
          KudoClass
        </div>

        <nav ref={navRef} className="flex-1 overflow-y-auto px-6 space-y-1 custom-scrollbar">
          
          <NavLink to="/dashboard" onClick={onClose} className={linkClass}>
            Dashboard
          </NavLink>

          {hasPermission("School") && (
            <NavLink to="/school" onClick={onClose} className={linkClass}>
              School
            </NavLink>
          )}

          {hasPermission("Academic Year") && (
            <NavLink to="/academic-year" onClick={onClose} className={linkClass}>
              Academic Year
            </NavLink>
          )}

          {hasPermission("Teachers") && (
            <NavLink to="/teachers" onClick={onClose} className={linkClass}>
              Teachers
            </NavLink>
          )}

          {hasPermission("Staff") && (
            <NavLink to="/staff" onClick={onClose} className={linkClass}>
              Staff
            </NavLink>
          )}

          {hasPermission("Parents") && (
            <NavLink to="/parents" onClick={onClose} className={linkClass}>
              Parents
            </NavLink>
          )}

          {hasPermission("Students") && (
            <NavLink to="/students" onClick={onClose} className={linkClass}>
              Students
            </NavLink>
          )}

          {hasPermission("Fee Structure") && (
            <NavLink to="/fee-structure" onClick={onClose} className={linkClass}>
              Fee Structure
            </NavLink>
          )}

          {/* --- Academics Group --- */}
          {(hasPermission("Classes") || hasPermission("Sections")) && (
            <div ref={levelRef}>
              <button
                onClick={() => {
                  setLevelOpen(!levelOpen)
                  setAclOpen(false)
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5
                text-[18px] rounded transition cursor-pointer font-medium ${levelOpen
                    ? "bg-white/10 text-white"
                    : "text-slate-200 hover:bg-white/10"
                  }`}
              >
                <span>Academics</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-300 ${levelOpen ? "rotate-180" : ""}`}
                />
              </button>

              {levelOpen && (
                <div className={`ml-4 border-l-2 border-white/10 overflow-hidden transition-all duration-300 ease-in-out ${levelOpen ? "max-h-40 opacity-100 mt-1" : "max-h-0 opacity-0 mt-0"}`}>
                  {hasPermission("Classes") && (
                    <NavLink to="/classes" onClick={onClose} className={aclLinkClass}>
                      Classes
                    </NavLink>
                  )}
                  {hasPermission("Sections") && (
                    <NavLink to="/sections" onClick={onClose} className={aclLinkClass}>
                      Sections
                    </NavLink>
                  )}
                </div>
              )}
            </div>
          )}

          {hasPermission("Attendance") && (
            <NavLink to="/attendance" onClick={onClose} className={linkClass}>
              Attendance
            </NavLink>
          )}

          {hasPermission("Payment") && (
            <NavLink to="/payment" onClick={onClose} className={linkClass}>
              Payment
            </NavLink>
          )}

          {/* --- ACCESS CONTROL --- */}
          {(hasPermission("Users") || hasPermission("Roles") || hasPermission("Permissions")) && (
            <div ref={aclRef}>
              <button
                onClick={() => {
                  setAclOpen(!aclOpen)
                  setLevelOpen(false)
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5
                text-[18px] rounded transition cursor-pointer font-medium ${aclOpen
                    ? "bg-white/10 text-white"
                    : "text-slate-200 hover:bg-white/10"
                  }`}
              >
                <span>Access Control</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-300 ${aclOpen ? "rotate-180" : ""}`}
                />
              </button>

              {aclOpen && (
                <div className={`ml-4 border-l-2 border-white/10 overflow-hidden transition-all duration-300 ease-in-out ${aclOpen ? "max-h-40 opacity-100 mt-1" : "max-h-0 opacity-0 mt-0"}`}>
                  {hasPermission("Users") && (
                    <NavLink to="/admin/users" onClick={onClose} className={aclLinkClass}>
                      Users
                    </NavLink>
                  )}
                  {hasPermission("Roles") && (
                    <NavLink to="/admin/roles" onClick={onClose} className={aclLinkClass}>
                      Roles
                    </NavLink>
                  )}
                  {hasPermission("Permissions") && (
                    <NavLink to="/admin/permissions" onClick={onClose} className={aclLinkClass}>
                      Permissions
                    </NavLink>
                  )}
                </div>
              )}
            </div>
          )}
        </nav>

        <div className="p-6 pb-0 mt-auto shrink-0">
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2
            text-[18px] text-slate-200 rounded-xl hover:bg-white/10 transition cursor-pointer"
          >
            <Power size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

