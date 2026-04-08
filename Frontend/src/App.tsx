// src/App.tsx

import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import PublicLayout from "./components/ui/PublicLayout";
import UserLayout from "./layouts/UserLayout";

// Páginas públicas
import Home from "./pages/Home/Home";
import AccessGate from "./pages/Auth/AccessGate";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword";

// Páginas privadas de Usuario
import Dashboard from "./pages/Dashboard/Dashboard";
import Profile from "./user/Profile";
import Tracking from "./user/Tracking";

// Páginas privadas de Admin
import AdminUsersWeight from "./pages/admin/AdminUsersWeight";
import ServicesAdmin from "./pages/admin/ServicesAdmin";
import CollaboratorsAdmin from "./pages/admin/CollaboratorsAdmin";
import Method from "./pages/Method";
import SiteSettingsPage from "./pages/SiteSettings";

// Guards
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AccessGuard from "./components/AccessGuard";

export default function App() {
  return (
    <Routes>
      {/* ── RUTAS PÚBLICAS ── */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />

        {/* Puerta de acceso — cualquiera puede verla */}
        <Route path="/access" element={<AccessGate />} />

        {/* Login/Register/Forgot — solo si tienes el código de acceso */}
        <Route path="/login" element={
          <AccessGuard><Login /></AccessGuard>
        } />
        <Route path="/register" element={
          <AccessGuard><Register /></AccessGuard>
        } />
        <Route path="/forgot-password" element={
          <AccessGuard><ForgotPassword /></AccessGuard>
        } />
      </Route>

      {/* ── RUTAS PRIVADAS (con Sidebar) ── */}
      <Route element={
        <ProtectedRoute>
          <UserLayout />
        </ProtectedRoute>
      }>
        {/* Usuario */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/my-profile" element={<Profile />} />
        <Route path="/my-tracking" element={<Tracking />} />

        {/* Admin */}
        <Route path="/admin/users-weight" element={
          <AdminRoute><AdminUsersWeight /></AdminRoute>
        } />
        <Route path="/admin/services" element={
          <AdminRoute><ServicesAdmin /></AdminRoute>
        } />
        <Route path="/admin/collaborators" element={
          <AdminRoute><CollaboratorsAdmin /></AdminRoute>
        } />
        <Route path="/admin/method" element={
          <AdminRoute><Method /></AdminRoute>
        } />
        <Route path="/admin/settings" element={
          <AdminRoute><SiteSettingsPage /></AdminRoute>
        } />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}