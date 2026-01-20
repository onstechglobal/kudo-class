import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "@/layouts/AdminLayout";

export default function ShowUser() {
    const { id } = useParams();
    const [user, setUser] = useState(null);

    useEffect(() => {
        axios.get(`/users/${id}`)
            .then(res => setUser(res.data))
            .catch(err => console.error(err));
    }, [id]);

    if (!user) {
        return (
            <AdminLayout>
                <div className="p-6">Loading...</div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="p-6 bg-[#f5f7fb] min-h-screen">

                <div className="flex items-center justify-between px-6 py-4 ">
                    <div className="text-2xl font-semibold text-gray-800">
                        User Details
                    </div>

                    <Link
                        to="/admin/users"
                        className="py-1 px-6 text-[#4D85D7]
                        border border-[#4D85D7] text-lg font-medium
                        rounded-md hover:bg-[#3c73c7] hover:text-white transition"
                    >
                        Back
                    </Link>
                </div>

                <div className="bg-white shadow rounded-lg p-6 ">
                    <div className="mb-3 grid grid-cols-3">
                        <label className="text-sm text-gray-500">Name</label>
                        <div className="font-medium">{user.name}</div>
                    </div>

                    <div className="mb-3 grid grid-cols-3">
                        <label className="text-sm text-gray-500">Email</label>
                        <div className="font-medium">{user.email}</div>
                    </div>

                    <div className="mb-3 grid grid-cols-3">
                        <label className="text-sm text-gray-500">Mobile</label>
                        <div className="font-medium">{user.mobile ?? "-"}</div>
                    </div>

                    <div className="mb-3 grid grid-cols-3">
                        <label className="text-sm text-gray-500">Status</label>
                        <div className="font-medium text-green-600">
                            {user.status}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
