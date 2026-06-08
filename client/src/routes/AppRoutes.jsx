import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Doctors from "../pages/Doctors";
import Appointment from "../pages/Appointment";
import QueueTracker from "../pages/QueueTracker";
import Profile from "../pages/Profile";
import AdminLogin from "../pages/AdminLogin";
import AIAssistant from "../pages/AIAssistant";
import VideoCall from "../pages/VideoCall";
import MyAppointments from "../pages/MyAppointments";

import AdminRoute from "../components/AdminRoute";

// Admin Pages
import AdminDashboardNew from "../pages/admin/AdminDashboardNew";
import AdminManageDoctors from "../pages/admin/AdminManageDoctors";
import AdminManageAppointments from "../pages/admin/AdminManageAppointments";
import AdminQueueManagement from "../pages/admin/AdminQueueManagement";
import AdminAnalytics from "../pages/admin/AdminAnalytics";
import AdminSettings from "../pages/admin/AdminSettings";

function AppRoutes() {
  return (
    <Routes>
      {/* ================= PUBLIC ROUTES ================= */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin-login" element={<AdminLogin />} />

      {/* ================= PATIENT ROUTES ================= */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/doctors" element={<Doctors />} />
      <Route path="/appointment" element={<Appointment />} />
      <Route path="/queue" element={<QueueTracker />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/ai-assistant" element={<AIAssistant />} />
      <Route path="/my-appointments" element={<MyAppointments />} />
      <Route path="/video-call/:appointmentId" element={<VideoCall />} />

      {/* ================= ADMIN ROUTES ================= */}
      <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboardNew /></AdminRoute>} />
      <Route path="/admin/doctors" element={<AdminRoute><AdminManageDoctors /></AdminRoute>} />
      <Route path="/admin/appointments" element={<AdminRoute><AdminManageAppointments /></AdminRoute>} />
      <Route path="/admin/queues" element={<AdminRoute><AdminQueueManagement /></AdminRoute>} />
      <Route path="/admin/analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
      <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
    </Routes>
  );
}

export default AppRoutes;