// src/App.tsx

import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

import PublicLayout from "./components/ui/PublicLayout";
import UserLayout from "./layouts/UserLayout";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AccessGuard from "./components/AccessGuard";

import NotFound from "./pages/NotFound";
import Forbidden from "./pages/Forbidden";

// ══════════════════════════════════════════════════════════
// LAZY LOADING
// ══════════════════════════════════════════════════════════
const Home = lazy(() => import("./pages/Home/Home"));
const EntrenosOnline = lazy(() => import("./pages/OnlineTraining/OnlineTraining"));
const AccessGate = lazy(() => import("./pages/Auth/AccessGate"));
const Login = lazy(() => import("./pages/Auth/Login"));
const Register = lazy(() => import("./pages/Auth/Register"));
const ForgotPassword = lazy(() => import("./pages/Auth/ForgotPassword"));

const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard"));
const Profile = lazy(() => import("./user/Profile"));
const Tracking = lazy(() => import("./user/Tracking"));
const MyDiet = lazy(() => import("./user/MyDiet"));
const MyWorkouts = lazy(() => import("./user/MyWorkouts"));
const MyAppointments = lazy(() => import("./user/MyAppointments"));

const AdminUsersWeight = lazy(() => import("./pages/admin/AdminUsersWeight"));
const AdminWorkouts = lazy(() => import("./pages/admin/AdminWorkouts"));
const AdminDiets = lazy(() => import("./pages/admin/AdminDiets"));
const AdminIncidents = lazy(() => import("./pages/admin/AdminIncidents"));
const ServicesAdmin = lazy(() => import("./pages/admin/ServicesAdmin"));
const ExerciseLibrary = lazy(() => import("./pages/ExerciseLibrary"));

const LegalPages = lazy(() => import("./pages/Legal/LegalPages"));


function PageLoader() {
  return (
    <div className="route-loader" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      Cargando...
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ── RUTAS PÚBLICAS ── */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/entrenos-online" element={<EntrenosOnline />} />
          <Route path="/access" element={<AccessGate />} />
          <Route path="/login" element={<AccessGuard><Login /></AccessGuard>} />
          <Route path="/register" element={<AccessGuard><Register /></AccessGuard>} />
          <Route path="/forgot-password" element={<AccessGuard><ForgotPassword /></AccessGuard>} />
          <Route path="/legal/:page" element={<LegalPages />} />
        </Route>

        {/* ── RUTAS PRIVADAS ── */}
        <Route element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/my-profile" element={<Profile />} />
          <Route path="/my-tracking" element={<Tracking />} />
          <Route path="/my-workouts" element={<MyWorkouts />} />
          <Route path="/my-diet" element={<MyDiet />} />
          <Route path="/my-appointments" element={<MyAppointments />} />
          <Route path="/exercises" element={<ExerciseLibrary />} />

          <Route path="/admin/users-weight" element={<AdminRoute><AdminUsersWeight /></AdminRoute>} />
          <Route path="/admin/workouts" element={<AdminRoute><AdminWorkouts /></AdminRoute>} />
          <Route path="/admin/diets" element={<AdminRoute><AdminDiets /></AdminRoute>} />
          <Route path="/admin/incidents" element={<AdminRoute><AdminIncidents /></AdminRoute>} />
          <Route path="/admin/services" element={<AdminRoute><ServicesAdmin /></AdminRoute>} />
        </Route>

        {/* ── ERRORES ── */}
        <Route path="/forbidden" element={<Forbidden />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}