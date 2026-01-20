import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "@/layouts/AdminLayout";

export default function ShowRole() {
    const { id } = useParams();
    const [role, setRole] = useState(null);

    useEffect(() => {
        axios.get("/roles") 
            .then(res => {
                const found = res.data.find(r => r.role_id == id);
                setRole(found);
            })
            .catch(err => console.error(err));
    }, [id]);

    if (!role) {
        return (
            <AdminLayout>
                <div className="p-6">Loading...</div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="p-6 bg-[#f5f7fb] min-h-screen">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="text-2xl font-semibold text-gray-800">
                        Role Details
                    </div>

                    <Link
                        to="/admin/roles"
                        className="py-1 px-6 text-[#4D85D7]
                        border border-[#4D85D7] text-lg font-medium
                        rounded-md hover:bg-[#3c73c7] hover:text-white transition"
                    >
                        Back
                    </Link>
                </div>

                {/* Content */}
                <div className="bg-white shadow rounded-lg p-6 max-w-xl">
                    <div className="grid grid-cols-3 mb-3">
                        <label className="text-sm text-gray-500">Role ID</label>
                        <div className="font-medium">{role.role_id}</div>
                    </div>

                    <div className="grid grid-cols-3">
                        <label className="text-sm text-gray-500">Role Name</label>
                        <div className="font-medium">{role.role_name}</div>
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}
