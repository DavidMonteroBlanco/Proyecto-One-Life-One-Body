import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Workouts from "./pages/Workouts";
import ExerciseLibrary from "./pages/ExerciseLibrary";
import SavedExercises from "./pages/SavedExercises";

import ServicesAdmin from "./pages/admin/ServicesAdmin";
import CollaboratorsAdmin from "./pages/admin/CollaboratorsAdmin";
import Method from "./pages/Method";
import SiteSettingsPage from "./pages/SiteSettings";

export default function App() {
  return (
    <div>
      <Navbar />

      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/workouts"
          element={
            <ProtectedRoute>
              <Workouts />
            </ProtectedRoute>
          }
        />

        <Route
          path="/exercises"
          element={
            <ProtectedRoute>
              <ExerciseLibrary />
            </ProtectedRoute>
          }
        />

        <Route
          path="/saved-exercises"
          element={
            <ProtectedRoute>
              <SavedExercises />
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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
