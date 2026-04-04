// src/App.tsx

import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import PublicLayout from "./components/ui/PublicLayout";
import UserLayout from "./layouts/UserLayout";        // ← Añade esta importación

// Páginas públicas
import Home from "./pages/Home/Home";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";

// Páginas privadas de Usuario
import Dashboard from "./pages/Dashboard/Dashboard";

// Páginas privadas de Admin (las que ya tienes)
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

      {/* ── RUTAS PRIVADAS PARA USUARIOS NORMALES (con Sidebar) ── */}
      <Route element={
        <ProtectedRoute>
          <UserLayout />
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Aquí puedes añadir más rutas de usuario en el futuro */}
        {/* Ejemplo: 
        <Route path="/workouts" element={<UserWorkouts />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/saved-exercises" element={<SavedExercisesUser />} />
        <Route path="/profile" element={<Profile />} />
        */}
      </Route>

      {/* ── RUTAS PRIVADAS PARA ADMIN ── */}
      <Route
        path="/admin/workouts"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <Workouts />
            </AdminRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/exercises"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <ExerciseLibrary />
            </AdminRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/saved-exercises"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <SavedExercises />
            </AdminRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/services"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <ServicesAdmin />
            </AdminRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/collaborators"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <CollaboratorsAdmin />
            </AdminRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/method"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <Method />
            </AdminRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <SiteSettingsPage />
            </AdminRoute>
          </ProtectedRoute>
        }
      />

      {/* Ruta por defecto */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}