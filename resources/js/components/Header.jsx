import { ChevronDown, LogOut } from "lucide-react";

export default function Header() {
    const user = JSON.parse(localStorage.getItem("user"));

    const today = new Date().toLocaleDateString("en-IN", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/";
    };

    return (
        <header className="w-full bg-gradient-to-r from-[#163b6c] to-[#1f4f8f] text-white shadow-md">
            <div className="flex items-center justify-between px-6 py-4">

                {/* LEFT */}
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold">
                        Greenwood International School
                    </h2>

                    <button className="bg-blue-900/40 rounded">
                        <ChevronDown size={18} />
                    </button>

                    <div className="text-sm opacity-90">
                        Today: {today}
                    </div>
                </div>

                {/* RIGHT */}
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="font-semibold">{user?.name || "Admin"}</p>
                        <p className="text-sm text-blue-200">
                            {user?.role || "Administrator"}
                        </p>
                    </div>

                    <div className="h-8 w-px bg-blue-300/60"></div>

                    <button
                        onClick={logout}
                        className="flex items-center gap-2 hover:text-red-300"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
}
