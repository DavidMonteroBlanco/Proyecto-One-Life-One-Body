// src/App.tsx

import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import PublicLayout from "./components/ui/PublicLayout";
import UserLayout from "./layouts/UserLayout";

// Páginas públicas
import Home from "./pages/Home/Home";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";

// Páginas privadas de Usuario
import Dashboard from "./pages/Dashboard/Dashboard";
import Profile from "./user/Profile";

// Páginas privadas de Admin
import Workouts from "./pages/Workouts";
import ExerciseLibrary from "./pages/ExerciseLibrary";
import SavedExercises from "./pages/SavedExercises";
import ServicesAdmin from "./pages/admin/ServicesAdmin";
import CollaboratorsAdmin from "./pages/admin/CollaboratorsAdmin";
import Method from "./pages/Method";
import SiteSettingsPage from "./pages/SiteSettings";

// Guards
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

export default function App() {
  return (
    <Routes>
      {/* ── RUTAS PÚBLICAS ── */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* ── RUTAS PRIVADAS (con Sidebar) ── */}
      <Route element={
        <ProtectedRoute>
          <UserLayout />
        </ProtectedRoute>
      }>
        {/* ── Usuario ── */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/my-profile" element={<Profile />} />
        {/* <Route path="/my-tracking" element={<Tracking />} /> */}

        {/* ── Admin ── */}
        <Route path="/admin/workouts" element={
          <AdminRoute><Workouts /></AdminRoute>
        } />
        <Route path="/admin/exercises" element={
          <AdminRoute><ExerciseLibrary /></AdminRoute>
        } />
        <Route path="/admin/saved-exercises" element={
          <AdminRoute><SavedExercises /></AdminRoute>
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