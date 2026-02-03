import { useState } from "react";
import api from "../helpers/api";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [passwordType, setPasswordType] = useState("password");

    const submit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await api.post("api/login", { email, password });
            localStorage.setItem("user", JSON.stringify(res.data.user));
            window.location.href = "/dashboard";
            console.log(res);
            console.log(res.data);
        } catch (err) {
            setError(
                err.response?.data?.message || "Invalid email or password"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex">

            {/* LEFT SIDE – LOGO + TEXT */}
            <div className="hidden lg:flex w-1/2 items-center justify-center
                bg-gradient-to-br from-blue-900 to-blue-500 relative px-10">

                {/* DECORATIVE CIRCLE */}
                <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/10 rounded-full" />

                <div className="relative z-10 flex flex-col items-center text-center text-white max-w-md">
                    <img
                        src="/images/app_logo.png"
                        alt="KudoClass Logo"
                        className="h-28 mb-6"
                    />

                    <h1 className="text-5xl font-extrabold tracking-tight mb-4">
                        KudoClass
                    </h1>

                    <p className="text-lg leading-relaxed opacity-90 px-5">
                        Empowering educators and students with a seamless digital
                        learning experience. Your gateway to smarter school management.
                    </p>
                </div>
            </div>


            {/* RIGHT SIDE – LOGIN + LOGO ONLY */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center bg-white px-6">

                {/* TOP LOGO */}

                <div className="w-full max-w-md">

                    {/* HEADER */}
                    <div className="mb-8">
                        <h2 className="text-4xl font-bold text-slate-800 mb-2">
                            Welcome Back
                        </h2>
                        <p className="text-slate-500 text-sm">
                            Enter your credentials to access your account.
                        </p>
                    </div>

                    {/* ERROR */}
                    {error && (
                        <div className="mb-5 text-sm text-red-700 bg-red-100 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* FORM */}
                    <form onSubmit={submit} className="space-y-6">

                        {/* EMAIL */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder=""
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl
                                    focus:outline-none focus:ring-4 focus:ring-blue-500/20
                                    focus:border-blue-500"
                                required
                            />
                        </div>

                        {/* PASSWORD */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={passwordType}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder=""
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl
                                        focus:outline-none focus:ring-4 focus:ring-blue-500/20
                                        focus:border-blue-500"
                                    required
                                />
                                
                                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                                    { passwordType=='password' ? (
                                        <Eye className="h-5 w-5 cursor-pointer text-gray-500" onClick={() => {setPasswordType('text')}} />
                                    ) : (
                                        <EyeOff className="h-5 w-5 cursor-pointer text-gray-500" onClick={() => {setPasswordType('password')}} />
                                    )}
                                </span>
                            </div>
                        </div>

                        {/* FORGOT */}
                        <div className="text-right">
                            <a
                                href="#"
                                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                            >
                                Forgot Password?
                            </a>
                        </div>

                        {/* BUTTON */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl font-bold text-white
                                bg-blue-900 hover:bg-blue-800 transition
                                disabled:opacity-60 cursor-pointer"
                        >
                            {loading ? "Signing In..." : "Sign In"}
                        </button>
                    </form>

                    {/* FOOTER */}
                    <p className="mt-12 text-center text-xs text-slate-400">
                        © 2026 KudoClass ERP System
                    </p>
                </div>
            </div>
        </div>
    );
}
