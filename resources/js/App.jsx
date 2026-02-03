import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

import SchoolListing from "./pages/school/School";
import AddSchool from "./pages/school/AddSchool";
import EditSchool from "./pages/school/EditSchool";

import AcademicListing from "./pages/academic-year/AcademicListing";
import AddAcademicYear from "./pages/academic-year/AddAcademicYear";
import EditAcademicYear from "./pages/academic-year/EditAcademicYear";

import Students from "./pages/students/Index";
import AddStudent from "./pages/Students/AddStudent";
import EditStudent from "./pages/Students/EditStudent";

import ClassListing from "./pages/class/ClassListing";
import AddClass from "./pages/class/AddClass";
import EditClass from "./pages/class/editClass";

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

import Teachers from "./pages/teachers/Index";
import AddTeacher from "./pages/teachers/AddTeacher";
import EditTeacher from "./pages/teachers/EditTeacher";

import StaffListing from "./pages/staff/StaffListing";
import EditStaff from "./pages/staff/EditStaff";
import AddStaff from "./pages/staff/AddStaff";

import ParentListing from "./pages/parents/Index";
import AddParent from "./pages/parents/AddParent";
import EditParent from "./pages/parents/EditParent";

import SectionListing from "./pages/section/Index";
import AddSection from "./pages/section/AddSection";
import EditSection from "./pages/section/EditSection";

import TermsAndConditions from "./pages/Terms";
import PrivacyPolicy from "./pages/Privacy";

import Payment from "./pages/payment/Payment";

import Attendance from "./pages/attendance/Attendance";

import FeeStucture from "./pages/fee-structure/Index";
import CreateFee from "./pages/fee-structure/CreateFee";

import EditFee from "./pages/fee-structure/EditFee";


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

                <Route path="/school" element={<SchoolListing />} />
                <Route path="/school/add" element={<AddSchool />} />
                <Route path="/school/edit/:id" element={<EditSchool />} />

                <Route path="/academic-year" element={<AcademicListing />} />
                <Route path="/academic-year/add" element={<AddAcademicYear />} />
                <Route path="/academic-year/edit/:id" element={<EditAcademicYear />} />

                <Route path="/staff" element={<StaffListing />} />
                <Route path="/staff/edit/:id" element={<EditStaff />} />
                <Route path="/staff/add/" element={<AddStaff />} />

                <Route path="/teachers" element={<Teachers />} />
                <Route path="/teachers/create" element={<AddTeacher />} />
                <Route path="/teachers/:id/edit" element={<EditTeacher />} />

                <Route path="/classes" element={<ClassListing />} />
                <Route path="/classes/add" element={<AddClass />} />
                <Route path="/classes/edit/:id" element={<EditClass />} />

                <Route path="/parents" element={<ParentListing />} />
                <Route path="/parents/create" element={<AddParent />} />
                <Route path="/parents/:id/edit" element={<EditParent />} />

                <Route path="/sections" element={<SectionListing />} />
                <Route path="/sections/create" element={<AddSection />} />
                <Route path="/sections/:id/edit" element={<EditSection />} />

                <Route path="/students" element={<Students />} />
                <Route path="/students/add" element={<AddStudent />} />
                <Route path="/students/edit/:id" element={<EditStudent />} />

                <Route path="/admin/users" element={<UserListing />} />
                <Route path="/admin/users/:id" element={<ShowUser />} />
                <Route path="/admin/users/create" element={<CreateUser />} />
                <Route path="/admin/users/:id/edit" element={<EditUser />} />

                <Route path="/admin/roles" element={<Roles />} />
                <Route path="/admin/roles/:id" element={<ShowRole />} />
                <Route path="/admin/roles/create" element={<CreateRole />} />
                <Route path="/admin/roles/:id/edit" element={<EditRole />} />

                <Route path="/admin/permissions" element={<Permissions />} />
                <Route path="/admin/permissions" element={<Permissions />} />
                <Route path="/admin/permissions/create" element={<CreatePermissions />} />
                <Route path="/admin/permissions/:id/edit" element={<EditPermissions />} />

                <Route path="/payment" element={<Payment />} />

                <Route path="/terms-of-use" element={<TermsAndConditions />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />

                <Route path="/attendance" element={<Attendance />} />

                <Route path="/fee-structure" element={<FeeStucture />} />
                <Route path="/fee-structure/create" element={<CreateFee />} />
                <Route path="/fee-structure/edit/:id" element={<EditFee />} />


            </Routes>
        </BrowserRouter>
    );
}
