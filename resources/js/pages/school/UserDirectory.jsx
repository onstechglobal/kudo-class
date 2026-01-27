import React, { useState } from 'react';
import { SlidersHorizontal, X, Plus, LayoutDashboard, Users } from 'lucide-react';

const UserDirectory = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    role: 'All Roles',
    status: 'All Status',
    academicYear: '2025-26',
    dateJoined: '',
    department: 'All Departments'
  });

  const toggleFilter = () => setIsFilterOpen(!isFilterOpen);

  const handleReset = () => {
    setFilters({
      role: 'All Roles',
      status: 'All Status',
      academicYear: '2025-26',
      dateJoined: '',
      department: 'All Departments'
    });
  };

  return (
    <div className="flex h-screen bg-[#f4f7fe] overflow-hidden font-sans">
      {/* Sidebar Mockup */}
      <aside className="w-60 bg-[#1e5bb9] text-white p-5 hidden md:block">
        <h2 className="text-2xl font-bold mb-8">KudoClass</h2>
        <nav className="space-y-4">
          <div className="flex items-center gap-3 opacity-80 cursor-pointer hover:opacity-100 transition-opacity">
            <LayoutDashboard size={20} /> Dashboard
          </div>
          <div className="flex items-center gap-3 cursor-pointer font-semibold border-l-4 border-white pl-2">
            <Users size={20} /> Users
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 relative">
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-3xl font-bold text-[#333]">User Directory</h1>
          <button className="bg-[#f39c12] text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 hover:bg-opacity-90 transition-all active:scale-95 shadow-md">
            <Plus size={18} /> Add New User
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-3">
          <input
            type="text"
            placeholder="Search by name or email..."
            className="flex-1 p-2.5 border border-[#e0e6ed] rounded-lg outline-none focus:border-[#1e5bb9] transition-colors"
          />
          <button
            onClick={toggleFilter}
            className={`flex items-center gap-2 px-5 py-2.5 border rounded-lg transition-all duration-200 ${
              isFilterOpen 
                ? 'bg-[#f0f4ff] border-[#1e5bb9] text-[#1e5bb9]' 
                : 'bg-white border-[#e0e6ed] text-gray-600 hover:bg-gray-50'
            }`}
          >
            <SlidersHorizontal size={18} />
            More Filters
          </button>
        </div>

        <p className="mt-8 text-gray-400 italic">Table data would appear here...</p>

        {/* Overlay */}
        {isFilterOpen && (
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-[1px] z-[999] transition-opacity"
            onClick={toggleFilter}
          />
        )}

        {/* Filter Drawer */}
        <div className={`fixed top-0 right-0 w-[350px] h-full bg-white shadow-2xl z-[1000] flex flex-col transition-transform duration-300 ease-in-out transform ${isFilterOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          {/* Drawer Header */}
          <div className="p-5 border-b border-[#e0e6ed] flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800">Filters</h3>
            <button onClick={toggleFilter} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="p-6 flex-1 overflow-y-auto space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600">User Role</label>
              <select 
                value={filters.role}
                onChange={(e) => setFilters({...filters, role: e.target.value})}
                className="w-full p-2.5 border border-[#e0e6ed] rounded-lg text-sm outline-none focus:ring-2 ring-blue-100"
              >
                <option>All Roles</option>
                <option>Admin</option>
                <option>Teacher</option>
                <option>Student</option>
                <option>Parent</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600">Account Status</label>
              <select 
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full p-2.5 border border-[#e0e6ed] rounded-lg text-sm outline-none focus:ring-2 ring-blue-100"
              >
                <option>All Status</option>
                <option>Active</option>
                <option>Inactive</option>
                <option>Pending</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600">Academic Year</label>
              <select 
                value={filters.academicYear}
                onChange={(e) => setFilters({...filters, academicYear: e.target.value})}
                className="w-full p-2.5 border border-[#e0e6ed] rounded-lg text-sm outline-none focus:ring-2 ring-blue-100"
              >
                <option>2025-26</option>
                <option>2024-25</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600">Date Joined (From)</label>
              <input 
                type="date" 
                value={filters.dateJoined}
                onChange={(e) => setFilters({...filters, dateJoined: e.target.value})}
                className="w-full p-2.5 border border-[#e0e6ed] rounded-lg text-sm outline-none focus:ring-2 ring-blue-100"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600">Department</label>
              <select 
                value={filters.department}
                onChange={(e) => setFilters({...filters, department: e.target.value})}
                className="w-full p-2.5 border border-[#e0e6ed] rounded-lg text-sm outline-none focus:ring-2 ring-blue-100"
              >
                <option>All Departments</option>
                <option>Science</option>
                <option>Mathematics</option>
                <option>Arts</option>
              </select>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-5 border-t border-[#e0e6ed] flex gap-3">
            <button 
              onClick={handleReset}
              className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Reset
            </button>
            <button 
              onClick={toggleFilter}
              className="flex-1 py-3 bg-[#1e5bb9] text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDirectory;