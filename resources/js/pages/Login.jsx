import { useState } from "react";
import api from "../helpers/api";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await api.post("/login", {
                email,
                password,
            });
            
            // redirect after successful login
            window.location.href = "/dashboard";

        } catch (err) {
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError("Invalid email or password");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-full max-w-lg bg-white rounded-xl shadow-md p-8">

                {/* LOGO */}
                <div className="flex justify-center mb-6">
                    <img
                        src="/images/app_logo.png"
                        alt="SchoolApp"
                        className="h-16 object-contain"
                    />
                </div>

                {/* TITLE */}
                <h2 className="text-center text-2xl font-semibold text-gray-800 mb-5">
                    Login
                </h2>

                {/* ERROR MESSAGE */}
                {error && (
                    <div className="mb-4 text-sm text-red-600 bg-red-100 p-3 rounded">
                        {error}
                    </div>
                )}

                {/* FORM */}
                <form onSubmit={submit} className="space-y-6">

                    {/* EMAIL */}
                    <div>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-2 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {/* PASSWORD */}
                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-2 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {/* LOGIN BUTTON */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-60"
                    >
                        {loading ? "Logging in..." : "Log In"}
                    </button>
                </form>
            </div>
        </div>
    );
}
