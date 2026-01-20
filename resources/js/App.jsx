import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

import SchoolListing from "./pages/school/School";
import AddSchool from "./pages/school/AddSchool";
import EditSchool from "./pages/school/EditSchool";

import AcademicYear from "./pages/academic-year/AcademicYearList";

import Teachers from "./pages/Teachers/Index";
import Students from "./pages/Students/Index";
import UserListing from "./pages/users/Index";
import ShowUser from "./pages/users/Show";
import CreateUser from "./pages/users/Create";
import EditUser from "./pages/users/Edit";

import Roles from "./pages/roles/Index";
import ShowRole from "./pages/roles/Show";
import CreateRole from "./pages/roles/Create";
import EditRole from "./pages/roles/Edit";
 
import Permissions from "./pages/permissions/Index";
import CreatePermissions from "./pages/permissions/Create";
import EditPermissions from "./pages/permissions/Edit";

function ProtectedRoute({ children }) {
    const token = localStorage.getItem("token");
    return token ? children : <Navigate to="/" />;
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
               <Route path="/" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
				<Route path="/schools" element={<SchoolListing />} />
                <Route path="/add-school" element={<AddSchool />} />
                <Route path="/edit-school/:id" element={<EditSchool />} />
                
                <Route path="/academic-year" element={<AcademicYear />} />
				
                <Route path="/Teachers" element={<Teachers />} />
                <Route path="/Students" element={<Students />} />
                <Route path="/admin/users" element={<UserListing />}/>
                <Route path="/admin/users/:id" element={<ShowUser />} />
                <Route path="/admin/users/create" element={<CreateUser />} />
                <Route path="/admin/users/:id/edit" element={<EditUser />} />

                <Route path="/admin/roles" element={<Roles />} />
                <Route path="/admin/roles/:id" element={<ShowRole />} />
                <Route path="/admin/roles/create" element={<CreateRole />} />
                <Route path="/admin/roles/:id/edit" element={<EditRole />} />

                <Route path="/admin/permissions" element={<Permissions />} />
                <Route path="/admin/permissions/create" element={<CreatePermissions />} />
                <Route path="/admin/permissions/:id/edit" element={<EditPermissions />} />
            </Routes>
        </BrowserRouter>
    );
}
