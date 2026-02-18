import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import api from "../../helpers/api";
import { SIDEBAR_MENU } from "./sidebarConfig";
import "../../style.css";

export default function Sidebar({ open, onClose }) {
	const location = useLocation();
	const userData = JSON.parse(localStorage.getItem("user") || "{}");
	const roleId = parseInt(userData.role_id);
	const permissions = userData.permissions || [];
	
	{/* 13-02-2026 */}
	// 1. Changed state to an object to track each menu independently
	{/* const [menuOpen, setMenuOpen] = useState({}); */}
	
	// 1. Initialize state once based on the CURRENT URL to avoid the "flash"
	const [menuOpen, setMenuOpen] = useState(() => {
	  const currentPath = window.location.pathname;
	  const initialState = {};
	  
	  Object.values(SIDEBAR_MENU).flat().forEach(menu => {
		if (menu.type === "dropdown" && menu.items.some(sub => currentPath.startsWith(sub.path))) {
		  initialState[menu.key] = true;
		}
	  });
	  return initialState;
	});
	{/* 13-02-2026 */}

	// 2. Auto-open logic: Detect active route on load/refresh and set that key to true
	useEffect(() => {
		const currentPath = location.pathname;
		const activeMenu = (SIDEBAR_MENU[roleId] || []).find(
		  (menu) =>
			menu.type === "dropdown" &&
			menu.items.some((sub) => currentPath.startsWith(sub.path))
		);

		if (activeMenu) {
		  setMenuOpen((prev) => ({
			...prev,
			[activeMenu.key]: true,
		  }));
		}
	}, [roleId]); // Only runs on initial load or role change

  const hasPermission = (moduleName) => {
    if (roleId === 1 || roleId === 2) return true;
    if (!moduleName) return true;
    return permissions.some((p) => p.module === moduleName);
  };

  const linkClass = ({ isActive }) =>
    `block px-3 py-3 rounded-xl font-medium text-[16px] transition-all duration-200 leading-none focus-visible:outline-none ${
      isActive
        ? "bg-white text-[#0468c3] shadow-md"
        : "text-slate-200 hover:bg-white/10"
    }`;

  const subLinkClass = ({ isActive }) =>
    `block px-3 py-3 rounded-xl font-medium text-[16px] transition-all duration-200 leading-none focus-visible:outline-none ${
      isActive
        ? "bg-white/10 text-white"
        : "text-slate-200 hover:bg-white/10"
    }`;

  const dropdownBtnClass = (isOpen) =>
    `w-full flex items-center justify-between px-3 py-3 text-[16px] rounded-xl transition cursor-pointer font-medium mt-1 ${
      isOpen
        ? "bg-white text-[#0468c3] shadow-md"
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
        className={`fixed left-0 top-0 z-[999] h-full w-[260px] bg-[#0468C3] transition-transform duration-300 pb-6 pt-6 flex flex-col ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="mb-8 flex items-center gap-2 text-2xl font-bold text-white px-6">
          <img src="/images/app_logo.png" alt="Header Logo" width="60px" />
          KudoClass
        </div>

        <nav className="flex-1 overflow-y-auto px-6 space-y-1 custom-scrollbar">
          {(SIDEBAR_MENU[roleId] || []).map((menu, idx) => {
            if (menu.permission && !hasPermission(menu.permission)) return null;

            // SINGLE LINK
            if (menu.type === "link") {
              return (
                <NavLink
                  key={idx}
                  to={menu.path}
                  onClick={onClose}
                  className={linkClass}
                >
                  {menu.title}
                </NavLink>
              );
            }

            // DROPDOWN
            if (menu.type === "dropdown") {
              const filteredSubItems = menu.items.filter((sub) =>
                hasPermission(sub.permission)
              );

              if (filteredSubItems.length === 0) return null;

              // 3. Check if this specific menu key is true in our state object
              const isOpen = !!menuOpen[menu.key];

              return (
                <div key={idx}>
                  <button
                    onClick={() =>
                      setMenuOpen((prev) => ({
                        ...prev,
                        [menu.key]: !prev[menu.key], // Toggle ONLY this key
                      }))
                    }
                    className={dropdownBtnClass(isOpen)}
                  >
                    <span>{menu.title}</span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
					{/* 13-02-2026 */}
					<div
					  className={`ml-4 border-l-2 border-white/10 transition-[grid-template-rows,opacity] duration-300 grid ${
						isOpen ? "grid-rows-[1fr] opacity-100 mt-1" : "grid-rows-[0fr] opacity-0"
					  }`}
					>
					  <div className="overflow-hidden">
						{filteredSubItems.map((sub, sIdx) => (
						  <NavLink key={sIdx} to={sub.path} className={subLinkClass}>
							{sub.title}
						  </NavLink>
						))}
					  </div>
					</div>
					{/* 13-02-2026 */}
					
					{/* <div
						className={`ml-4 border-l-2 border-white/10 overflow-hidden transition-all duration-300 ${
						  isOpen
							? "max-h-[500px] opacity-100 mt-1"
							: "max-h-0 opacity-0"
						}`}
					  >
						{filteredSubItems.map((sub, sIdx) => (
						  <NavLink
							key={sIdx}
							to={sub.path}
							onClick={onClose}
							className={subLinkClass}
						  >
							{sub.title}
						  </NavLink>
						))}
					</div> */}
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