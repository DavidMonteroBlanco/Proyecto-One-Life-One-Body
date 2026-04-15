// src/App.tsx

import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

// Layouts — se cargan siempre (son el shell)
import PublicLayout from "./components/ui/PublicLayout";
import UserLayout from "./layouts/UserLayout";

// Guards — se cargan siempre
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AccessGuard from "./components/AccessGuard";

// ══════════════════════════════════════════════════════════
// LAZY LOADING — cada página se carga solo cuando se visita
// Esto optimiza la carga inicial de la app (solo descarga
// el JS de la página que el usuario está viendo)
// ══════════════════════════════════════════════════════════

// Públicas
const Home = lazy(() => import("./pages/Home/Home"));
const EntrenosOnline = lazy(() => import("./pages/OnlineTraining/OnlineTraining"));
const AccessGate = lazy(() => import("./pages/Auth/AccessGate"));
const Login = lazy(() => import("./pages/Auth/Login"));
const Register = lazy(() => import("./pages/Auth/Register"));
const ForgotPassword = lazy(() => import("./pages/Auth/ForgotPassword"));

// Usuario
const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard"));
const Profile = lazy(() => import("./user/Profile"));
const Tracking = lazy(() => import("./user/Tracking"));

// Admin
const AdminUsersWeight = lazy(() => import("./pages/admin/AdminUsersWeight"));
const ServicesAdmin = lazy(() => import("./pages/admin/ServicesAdmin"));
const CollaboratorsAdmin = lazy(() => import("./pages/admin/CollaboratorsAdmin"));
const Method = lazy(() => import("./pages/Method"));
const SiteSettingsPage = lazy(() => import("./pages/SiteSettings"));

// ── Loading spinner mientras carga la página ──
function PageLoader() {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: "60vh", gap: "0.8rem",
      fontFamily: "var(--font-condensed)", color: "var(--text-muted)",
      fontSize: "0.9rem", letterSpacing: "0.1em",
    }}>
      <span style={{
        width: 18, height: 18, border: "2px solid var(--primary)",
        borderTopColor: "transparent", borderRadius: "50%",
        animation: "spin 0.6s linear infinite",
      }} />
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
        </Route>

        {/* ── RUTAS PRIVADAS (con Sidebar) ── */}
        <Route element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/my-profile" element={<Profile />} />
          <Route path="/my-tracking" element={<Tracking />} />

          <Route path="/admin/users-weight" element={<AdminRoute><AdminUsersWeight /></AdminRoute>} />
          <Route path="/admin/services" element={<AdminRoute><ServicesAdmin /></AdminRoute>} />
          <Route path="/admin/collaborators" element={<AdminRoute><CollaboratorsAdmin /></AdminRoute>} />
          <Route path="/admin/method" element={<AdminRoute><Method /></AdminRoute>} />
          <Route path="/admin/settings" element={<AdminRoute><SiteSettingsPage /></AdminRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}