import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { ChevronDown, Power } from "lucide-react";
import api from "../../helpers/api";
import { SIDEBAR_MENU } from "./sidebarConfig";
import "../../style.css";

export default function Sidebar({ open, onClose }) {
  const location = useLocation();
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const roleId = parseInt(userData.role_id);
  const permissions = userData.permissions || [];
  const isDevAdmin = roleId === 1;

  // Track dropdown state as a single string (the key of the open menu)
  const [menuOpen, setMenuOpen] = useState(null);

  // Auto-open dropdown if child link is active on load
  useEffect(() => {
    const currentMenu = SIDEBAR_MENU[roleId] || [];
    currentMenu.forEach(menu => {
      if (menu.type === 'dropdown') {
        const hasActiveChild = menu.items.some(item => location.pathname.includes(item.path));
        if (hasActiveChild) {
          setMenuOpen(menu.key); // Set the specific key to open
        }
      }
    });
  }, [location.pathname, roleId]);

  // Updated toggle logic: if it's already open, close it; otherwise, set it as the only open menu
  const toggleMenu = (key) => {
    setMenuOpen(prevKey => (prevKey === key ? null : key));
  };

  const hasPermission = (moduleName) => {
    if (roleId === 1 || roleId === 2) return true;
    if (!moduleName) return true;
    return permissions.some(p => p.module === moduleName);
  };

  // Styles
  const linkClass = ({ isActive }) =>
    `block px-3 py-3 rounded-xl font-medium text-[16px] transition-all duration-200 leading-none focus-visible:outline-none ${isActive ? "bg-white text-[#0468c3] shadow-md active" : "text-slate-200 hover:bg-white/10"}`;

  const subLinkClass = ({ isActive }) =>
    `block px-3 py-3 rounded-xl font-medium text-[16px] transition-all duration-200 leading-none focus-visible:outline-none ${isActive ? "bg-white/10 text-white" : "text-slate-200 hover:bg-white/10"}`;

  const dropdownBtnClass = (isOpen) =>
    `w-full flex items-center justify-between px-3 py-3 text-[16px] rounded-xl transition cursor-pointer font-medium mt-1 ${isOpen ? "bg-white text-[#0468c3] shadow-md" : "text-slate-200 hover:bg-white/10"}`;

  const logout = async () => {
    try { await api.post("api/logout"); } catch (e) { console.error("Logout failed", e); }
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <>
      {open && <div onClick={onClose} className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden" />}

      <aside className={`fixed left-0 top-0 z-[999] h-full w-[260px] bg-[#0468C3] transition-transform duration-300 pb-6 pt-6 flex flex-col ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="mb-8 flex items-center gap-2 text-2xl font-bold text-white px-6">
          <img src="/images/app_logo.png" alt="Header Logo" width="60px" />
          KudoClass
        </div>

        <nav className="flex-1 overflow-y-auto px-6 space-y-1 custom-scrollbar">
          {(SIDEBAR_MENU[roleId] || []).map((menu, idx) => {
            if (menu.permission && !hasPermission(menu.permission)) return null;

            // Render Single Link
            if (menu.type === 'link') {
              return (
                <NavLink 
                  key={idx} 
                  to={menu.path} 
                  onClick={() => {
                    setMenuOpen(null); // Close any open dropdowns when clicking a single link
                    onClose();
                  }} 
                  className={linkClass}
                >
                  {menu.title}
                </NavLink>
              );
            }

            // Render Dropdown
            if (menu.type === 'dropdown') {
              const isOpen = menuOpen === menu.key; // Check if this specific key is the active one
              const filteredSubItems = menu.items.filter(sub => hasPermission(sub.permission));

              if (filteredSubItems.length === 0) return null;

              return (
                <div key={idx}>
                  <button onClick={() => toggleMenu(menu.key)} className={dropdownBtnClass(isOpen)}>
                    <span>{menu.title}</span>
                    <ChevronDown size={16} className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  <div className={`ml-4 border-l-2 border-white/10 overflow-hidden transition-all duration-300 ${isOpen ? "max-h-[500px] opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
                    {filteredSubItems.map((sub, sIdx) => (
                      <NavLink key={sIdx} to={sub.path} onClick={onClose} className={subLinkClass}>
                        {sub.title}
                      </NavLink>
                    ))}
                  </div>
                </div>
              );
            }
            return null;
          })}
        </nav>
      </aside>
    </>
  );
}