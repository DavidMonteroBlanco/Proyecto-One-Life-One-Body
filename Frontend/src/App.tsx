import { Routes, Route, Navigate } from "react-router-dom";

// Layout público
import PublicLayout from "./components/ui/PublicLayout";

// Páginas públicas
import Home from "./pages/Home/Home";
import Auth from "./pages/Auth/Auth";

// Páginas privadas usuario
import Dashboard from "./pages/Dashboard/Dashboard";

// Páginas privadas admin (las que ya tienes)
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

      {/* ── RUTAS PÚBLICAS (web nueva con su propio layout) ── */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Auth />} />
      </Route>

      {/* ── RUTAS PRIVADAS USUARIO ── */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* ── RUTAS PRIVADAS ADMIN (las que ya tenías) ── */}
      <Route
        path="/admin/workouts"
        element={<ProtectedRoute><AdminRoute><Workouts /></AdminRoute></ProtectedRoute>}
      />
      <Route
        path="/admin/exercises"
        element={<ProtectedRoute><AdminRoute><ExerciseLibrary /></AdminRoute></ProtectedRoute>}
      />
      <Route
        path="/admin/saved-exercises"
        element={<ProtectedRoute><AdminRoute><SavedExercises /></AdminRoute></ProtectedRoute>}
      />
      <Route
        path="/admin/services"
        element={<ProtectedRoute><AdminRoute><ServicesAdmin /></AdminRoute></ProtectedRoute>}
      />
      <Route
        path="/admin/collaborators"
        element={<ProtectedRoute><AdminRoute><CollaboratorsAdmin /></AdminRoute></ProtectedRoute>}
      />
      <Route
        path="/admin/method"
        element={<ProtectedRoute><AdminRoute><Method /></AdminRoute></ProtectedRoute>}
      />
      <Route
        path="/admin/settings"
        element={<ProtectedRoute><AdminRoute><SiteSettingsPage /></AdminRoute></ProtectedRoute>}
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}