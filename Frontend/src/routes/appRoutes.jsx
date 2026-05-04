// Force reload
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoutes";

// Layouts
import AdminLayout   from "../layouts/wardenLayout";
import StudentLayout from "../layouts/studentLayout";

// Admin Pages
import AdminDashboard   from "../pages/admin/dashboard";   // warden dashboard
import Students         from "../pages/admin/student";     // student CRUD
import RoomAllot        from "../pages/admin/roomAllot";   // room allotment
import Reports          from "../pages/admin/reports";     // warden reports view
import WardenPayments   from "../pages/admin/payments";   // warden payments

// Student Pages
import StudentDashboard from "../pages/student/dashboard";
import Payments         from "../pages/student/payments";
import MyRoom           from "../pages/student/Myroom";
import AddReport        from "../pages/student/addreport";

// Common
import Login  from "../pages/login";
import Signup from "../pages/signup";

const AppRoutes = () => {
  return (
    <Routes>

      {/* Public */}
      <Route path="/signup" element={<Signup />} />
      <Route path="/login"  element={<Login />} />
      <Route path="/"       element={<Navigate to="/signup" />} />

      {/* Warden Routes */}
      <Route
        path="/warden"
        element={
          <ProtectedRoute allowedRole="warden">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index            element={<AdminDashboard />} />
        <Route path="students"  element={<Students />} />
        <Route path="rooms"     element={<RoomAllot />} />
        <Route path="reports"   element={<Reports />} />
        <Route path="payments"  element={<WardenPayments />} />
      </Route>

      {/* Student Routes */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRole="student">
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index            element={<StudentDashboard />} />
        <Route path="payments"  element={<Payments />} />
        <Route path="room"      element={<MyRoom />} />
        <Route path="addreport" element={<AddReport />} />
      </Route>

    </Routes>
  );
};

export default AppRoutes;
