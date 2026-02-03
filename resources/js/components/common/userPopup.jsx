import React from 'react';
import { User, Settings, Repeat, Power } from 'lucide-react';
import api from "../../helpers/api";

const UserPopup = () => {
  
  const logout = async () => {
    try {
      await api.post("/logout");
    } catch (e) {
      console.error("Logout failed", e);
    }
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div className="fixed right-4 top-[90px] z-[100] w-64 rounded-xl bg-white p-3 shadow-xl border border-gray-100">
      {/* Header */}
      <div className="px-2 pb-3">
        <h4 className="text-sm font-semibold text-gray-900">
          Arjun Sharma
        </h4>
        <p className="text-xs text-gray-500 mt-1">
          Administrator 
        </p>
      </div>

      {/* Menu */}
      <div className="flex flex-col gap-1">
        <button className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
          <span className="text-base"><User size={20} /></span>
          Edit Profile
        </button>

        <button className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
          <span className="text-base"><Settings size={20} /></span>
          Settings
        </button>

        <button className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
          <span className="text-base"><Repeat size={20} /></span>
          Switch Role
        </button>
      </div>

      {/* Divider */}
      <div className="my-2 h-px bg-gray-200" />

      {/* Logout */}
      <button className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm text-red-500 hover:bg-red-50 cursor-pointer" onClick={logout}>
        <span className="text-base"><Power size={20} /></span>
        Logout
      </button>
    </div>
  );
};

export default UserPopup;
