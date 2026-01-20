import { ChevronDown, UserCircle, BellRing } from "lucide-react";
import api from "../helpers/api";

export default function Header() {
    const user = JSON.parse(localStorage.getItem("user"));

    const today = new Date().toLocaleDateString("en-IN", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });

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
        <header className="w-full bg-[#0468C3] text-white shadow-md">
            <div className="flex items-center justify-between px-6 py-4">

                {/* LEFT */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <h2 className="text-[1.25rem] font-semibold">
                            Greenwood International School
                        </h2>

                        <button className="rounded">
                            <ChevronDown size={18} />
                    </button>
                    </div>

                    <div className="text-sm opacity-90">
                        Today: {today}
                    </div>
                </div>

                {/* RIGHT */}
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="font-semibold text-[16px]">{user?.name || "Admin"}</p>
                        <p className="text-[13px] text-blue-200 font-sans">
                            {user?.role || "Administrator"}
                        </p>
                    </div>

                    <div className="h-8 w-px bg-blue-300/60"></div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={logout}
                            className="text-3xl hover:text-blue-300 cursor-pointer"
                        >
                            <BellRing size={26} strokeWidth={1.5} />
                        </button>
                        <button
                            onClick={logout}
                            className="text-3xl hover:text-blue-300 cursor-pointer"
                        >
                            <UserCircle size={26} strokeWidth={1.5} />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
