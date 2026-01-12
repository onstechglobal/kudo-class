import { NavLink } from "react-router-dom";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function Sidebar() {
    const [aclOpen, setAclOpen] = useState(false);

    const linkClass = ({ isActive }) =>
        `block px-4 py-2 rounded transition ${
            isActive
                ? "bg-blue-600 text-white"
                : "text-slate-200 hover:bg-slate-700"
        }`;

    return (
        <aside className="w-64 bg-slate-900 text-white min-h-screen">
            {/* LOGO */}
            <div className="flex justify-center py-4 border-b border-slate-700">
                <img
                    src="/images/app_logo.png"
                    alt="SchoolApp"
                    className="h-10"
                />
            </div>

            <nav className="p-4 space-y-1">
                <NavLink to="/dashboard" className={linkClass}>
                    Dashboard
                </NavLink>

                <NavLink to="/teachers" className={linkClass}>
                    Teachers
                </NavLink>

                <NavLink to="/students" className={linkClass}>
                    Students
                </NavLink>

                <NavLink to="/attendance" className={linkClass}>
                    Attendance
                </NavLink>

                {/* ACL */}
                <div className="mt-3">
                    <button
                        onClick={() => setAclOpen(!aclOpen)}
                        className="w-full flex items-center justify-between px-4 py-2 hover:bg-slate-700 rounded"
                    >
                        <span>Access Control</span>
                        <ChevronDown
                            size={16}
                            className={aclOpen ? "rotate-180" : ""}
                        />
                    </button>

                    {aclOpen && (
                        <div className="ml-4 space-y-1">
                            <NavLink to="/admin/users" className={linkClass}>
                                Users
                            </NavLink>
                            <NavLink to="/admin/roles" className={linkClass}>
                                Roles
                            </NavLink>
                            <NavLink to="/admin/permissions" className={linkClass}>
                                Permissions
                            </NavLink>
                        </div>
                    )}
                </div>
            </nav>
        </aside>
    );
}
