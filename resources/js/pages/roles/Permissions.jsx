import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "@/layouts/AdminLayout";

export default function RolePermissions({ roleId }) {
    const [permissions, setPermissions] = useState([]);
    const [assigned, setAssigned] = useState([]);

    useEffect(() => {
        axios.get(`api/api/roles/${roleId}/permissions`)
            .then(res => {
                setPermissions(res.data.permissions);
                setAssigned(res.data.assigned);
            });
    }, [roleId]);

    function togglePermission(id) {
        if (assigned.includes(id)) {
            setAssigned(assigned.filter(p => p !== id));
        } else {
            setAssigned([...assigned, id]);
        }
    }

    function save() {
        axios.post(`/api/roles/${roleId}/permissions`, {
            permission_ids: assigned
        }).then(() => {
            alert("Permissions updated");
        });
    }

    return (
        <AdminLayout>
            <div className="p-6 bg-[#f5f7fb] min-h-screen">
                <div className="bg-white rounded-lg p-6 shadow">

                    <h2 className="text-xl font-semibold mb-4">
                        Role Permissions
                    </h2>

                    <div className="grid grid-cols-2 gap-3">
                        {permissions.map(p => (
                            <label
                                key={p.permission_id}
                                className="flex items-center gap-2"
                            >
                                <input
                                    type="checkbox"
                                    checked={assigned.includes(p.permission_id)}
                                    onChange={() => togglePermission(p.permission_id)}
                                />
                                <span>{p.module}</span>
                            </label>
                        ))}
                    </div>

                    <button
                        onClick={save}
                        className="mt-6 py-1 px-6 bg-[#4D85D7]
                        text-white text-lg rounded-md"
                    >
                        Save Permissions
                    </button>

                </div>
            </div>
        </AdminLayout>
    );
}
