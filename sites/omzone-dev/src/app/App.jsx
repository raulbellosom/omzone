import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";

// Layouts
import PublicLayout from "@/layouts/PublicLayout";
import CustomerLayout from "@/layouts/CustomerLayout";
import SmartLayout from "@/layouts/SmartLayout";
import AdminLayout from "@/layouts/AdminLayout";

// Guards
import { RequireAuth, RedirectIfAuthenticated } from "@/routes/guards";

// Páginas públicas (lazy)
const LandingPage = lazy(() => import("@/pages/public/LandingPage"));
const ClassesPage = lazy(() => import("@/pages/public/ClassesPage"));
const ClassDetailPage = lazy(() => import("@/pages/public/ClassDetailPage"));
const MembershipsPage = lazy(() => import("@/pages/public/MembershipsPage"));
const PackagesPage = lazy(() => import("@/pages/public/PackagesPage"));
const WellnessPage = lazy(() => import("@/pages/public/WellnessPage"));

// Auth
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/auth/RegisterPage"));
const CheckEmailPage = lazy(() => import("@/pages/auth/CheckEmailPage"));
const VerifyEmailPage = lazy(() => import("@/pages/auth/VerifyEmailPage"));
const ForgotPasswordPage = lazy(
  () => import("@/pages/auth/ForgotPasswordPage"),
);
const ResetPasswordPage = lazy(() => import("@/pages/auth/ResetPasswordPage"));

// Flujos de compra
const BookingPage = lazy(() => import("@/pages/booking/BookingPage"));
const CheckoutPage = lazy(() => import("@/pages/checkout/CheckoutPage"));
const ConfirmationPage = lazy(
  () => import("@/pages/checkout/ConfirmationPage"),
);

// Área cliente
const CustomerDashboardPage = lazy(
  () => import("@/pages/customer/CustomerDashboardPage"),
);
const CustomerBookingsPage = lazy(
  () => import("@/pages/customer/CustomerBookingsPage"),
);
const CustomerOrdersPage = lazy(
  () => import("@/pages/customer/CustomerOrdersPage"),
);
const CustomerMembershipPage = lazy(
  () => import("@/pages/customer/CustomerMembershipPage"),
);
const CustomerProfilePage = lazy(
  () => import("@/pages/customer/CustomerProfilePage"),
);

// Panel admin
const AdminDashboardPage = lazy(
  () => import("@/pages/admin/AdminDashboardPage"),
);
const AdminLeadsPage = lazy(() => import("@/pages/admin/AdminLeadsPage"));
const AdminCustomersPage = lazy(
  () => import("@/pages/admin/AdminCustomersPage"),
);
const AdminClassesPage = lazy(() => import("@/pages/admin/AdminClassesPage"));
const AdminSessionsPage = lazy(() => import("@/pages/admin/AdminSessionsPage"));
const AdminPackagesPage = lazy(() => import("@/pages/admin/AdminPackagesPage"));
const AdminProductsPage = lazy(() => import("@/pages/admin/AdminProductsPage"));
const AdminOrdersPage = lazy(() => import("@/pages/admin/AdminOrdersPage"));
const AdminBookingsPage = lazy(() => import("@/pages/admin/AdminBookingsPage"));
const AdminPassesPage = lazy(() => import("@/pages/admin/AdminPassesPage"));
const AdminContentPage = lazy(() => import("@/pages/admin/AdminContentPage"));
const AdminSettingsPage = lazy(() => import("@/pages/admin/AdminSettingsPage"));

// Loading fallback
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-sage border-t-transparent animate-spin" />
        <p className="text-sm text-charcoal-muted">Cargando...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ── Rutas públicas ──────────────────────────────────────────── */}
        <Route element={<PublicLayout />}>
          {/* Landing: redirige a /app si el usuario ya está autenticado */}
          <Route element={<RedirectIfAuthenticated />}>
            <Route index element={<LandingPage />} />
          </Route>
          <Route path="memberships" element={<MembershipsPage />} />

          {/* Login / Register: redirige si ya hay sesión (verificada o no) */}
          <Route element={<RedirectIfAuthenticated />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
          </Route>
          <Route path="auth/check-email" element={<CheckEmailPage />} />
          <Route path="auth/verify-email" element={<VerifyEmailPage />} />
          <Route path="auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="auth/reset-password" element={<ResetPasswordPage />} />
        </Route>

        {/* ── Contenido con SmartLayout (público o cliente según auth) ── */}
        <Route element={<SmartLayout />}>
          <Route path="classes" element={<ClassesPage />} />
          <Route path="classes/:slug" element={<ClassDetailPage />} />
          <Route path="packages" element={<PackagesPage />} />
          <Route path="wellness" element={<WellnessPage />} />
        </Route>

        {/* ── Flujos de compra (autenticados o no) ───────────────────── */}
        <Route element={<PublicLayout />}>
          <Route path="booking/:sessionId" element={<BookingPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="checkout/confirmation" element={<ConfirmationPage />} />
        </Route>

        {/* ── Área cliente (/zone) ────────────────────────────────────── */}
        <Route element={<RequireAuth roles={["client", "admin", "root"]} />}>
          <Route element={<CustomerLayout />}>
            <Route path="zone" element={<CustomerDashboardPage />} />
            <Route path="zone/bookings" element={<CustomerBookingsPage />} />
            <Route path="zone/orders" element={<CustomerOrdersPage />} />
            <Route path="zone/profile" element={<CustomerProfilePage />} />
          </Route>
        </Route>

        {/* ── Compat redirect /account → /zone ────────────────────────── */}
        <Route path="account" element={<Navigate to="/zone" replace />} />
        <Route path="account/*" element={<Navigate to="/zone" replace />} />

        {/* ── Panel admin ─────────────────────────────────────────────── */}
        {/* fallback="/zone" → clientes que van a /app son redirigidos a su área */}
        <Route
          element={
            <RequireAuth roles={["admin", "root"]} fallback="/zone" />
          }
        >
          <Route element={<AdminLayout />}>
            <Route path="app" element={<AdminDashboardPage />} />
            <Route path="app/leads" element={<AdminLeadsPage />} />
            <Route path="app/customers" element={<AdminCustomersPage />} />
            <Route path="app/classes" element={<AdminClassesPage />} />
            <Route path="app/sessions" element={<AdminSessionsPage />} />
            <Route path="app/memberships" element={<Navigate to="/app/packages" replace />} />
            <Route path="app/packages" element={<AdminPackagesPage />} />
            <Route path="app/products" element={<AdminProductsPage />} />
            <Route path="app/orders" element={<AdminOrdersPage />} />
            <Route path="app/bookings" element={<AdminBookingsPage />} />
            <Route path="app/passes" element={<AdminPassesPage />} />
            <Route path="app/content" element={<AdminContentPage />} />
            <Route path="app/settings" element={<AdminSettingsPage />} />
          </Route>
        </Route>

        {/* ── 404 ─────────────────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
