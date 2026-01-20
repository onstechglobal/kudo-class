import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { ChevronDown, LayoutDashboard, UserRound, GraduationCap, School, CalendarDays, ShieldAlert, Users, UserCog, Fingerprint } from "lucide-react";


export default function Sidebar() {
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
        `flex items-center gap-3 px-3 py-2 rounded text-sm transition transition-all duration-200 ${isActive
            ? "bg-blue-600 text-white shadow-md"
            : "text-slate-200 hover:bg-white/10"
        }`;

    return (
        <aside className="bg-[#0468C3] w-56 shrink-0 min-h-screen text-white">
            <div className="flex justify-center items-center pt-5 pb-4">
                <img src="/images/app_logo.png" alt="SchoolApp" className="h-10" />
                <div class="">
                    <span class="text-[22px] font-bold text-[#0558a0]">
                        Kudo
                    </span>
                    <span class="text-[22px] font-bold text-[#3096e5]">
                        Class
                    </span>
                </div>
            </div>

            <nav className="px-3 space-y-1">
                <NavLink to="/dashboard" className={linkClass}>
                    <LayoutDashboard size={20} strokeWidth={2} />
                    <span>Dashboard</span>
                </NavLink>

                <NavLink to="/teachers" className={linkClass}>
                    <UserRound size={20} strokeWidth={2} />
                    <span>Teachers</span>
                </NavLink>

                <NavLink to="/students" className={linkClass}>
                    <GraduationCap size={20} strokeWidth={2} />
                    <span>Students</span>
                </NavLink>

                <NavLink to="/schools" className={linkClass}>
                    <School size={20} strokeWidth={2} />
                    <span>Schools</span>
                </NavLink>

                <NavLink to="/academic-year" className={linkClass}>
                    <CalendarDays size={20} strokeWidth={2} />
                    <span>Academic Year</span>
                </NavLink>

                {/* --- ACCESS CONTROL DROPDOWN --- */}
                <div className="mt-4">
                    <button
                        onClick={() => setAclOpen(!aclOpen)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded transition whitespace-nowrap ${aclOpen ? "text-white bg-white/5" : "text-slate-100 hover:bg-white/10"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <ShieldAlert size={20} strokeWidth={2} />
                            <span>Access Control</span>
                        </div>
                        <ChevronDown
                            size={16}
                            className={`transition-transform duration-300 ${aclOpen ? "rotate-180" : ""}`}
                        />
                    </button>

                    {aclOpen && (
                        <div className="mt-1 ml-4 border-l-2 border-white/10 space-y-1">
                            <NavLink to="/admin/users" className={linkClass}>
                                <Users size={18} />
                                <span>Users</span>
                            </NavLink>
                            <NavLink to="/admin/roles" className={linkClass}>
                                <UserCog size={18} />
                                <span>Roles</span>
                            </NavLink>
                            <NavLink to="/admin/permissions" className={linkClass}>
                                <Fingerprint size={18} />
                                <span>Permissions</span>
                            </NavLink>
                        </div>
                    )}
                </div>
            </nav>
        </aside>
    );
}
