import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";

// Layouts
import PublicLayout from "@/layouts/PublicLayout";
import AdminLayout from "@/layouts/AdminLayout";

// Guards
import { RequireAuth, RedirectIfAuthenticated } from "@/routes/guards";

// Páginas públicas (lazy)
const LandingPage = lazy(() => import("@/pages/public/LandingPage"));
const SessionsPage = lazy(() => import("@/pages/public/SessionsPage"));
const ImmersionsPage = lazy(() => import("@/pages/public/ImmersionsPage"));
const StaysPage = lazy(() => import("@/pages/public/StaysPage"));
const ServicesPage = lazy(() => import("@/pages/public/ServicesPage"));
const ExperiencesPage = lazy(() => import("@/pages/public/ExperiencesPage"));
const AgendaPage = lazy(() => import("@/pages/public/AgendaPage"));
const OfferingDetailPage = lazy(
  () => import("@/pages/public/OfferingDetailPage"),
);

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

// Área cliente (/account)
const CustomerBookingsPage = lazy(
  () => import("@/pages/customer/CustomerBookingsPage"),
);
const CustomerOrdersPage = lazy(
  () => import("@/pages/customer/CustomerOrdersPage"),
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
const AdminOfferingsPage = lazy(
  () => import("@/pages/admin/AdminOfferingsPage"),
);
const AdminAgendaPage = lazy(() => import("@/pages/admin/AdminAgendaPage"));
const AdminContentPage = lazy(() => import("@/pages/admin/AdminContentPage"));
const AdminOfferingFormPage = lazy(
  () => import("@/pages/admin/AdminOfferingFormPage"),
);
const AdminSlotFormPage = lazy(
  () => import("@/pages/admin/AdminSlotFormPage"),
);
const AdminBlockFormPage = lazy(
  () => import("@/pages/admin/AdminBlockFormPage"),
);
const AdminContentFormPage = lazy(
  () => import("@/pages/admin/AdminContentFormPage"),
);
const AdminOrdersPage = lazy(() => import("@/pages/admin/AdminOrdersPage"));
const AdminBookingsPage = lazy(() => import("@/pages/admin/AdminBookingsPage"));
const AdminPassesPage = lazy(() => import("@/pages/admin/AdminPassesPage"));
const AdminSettingsPage = lazy(() => import("@/pages/admin/AdminSettingsPage"));
const AdminStockImagesPage = lazy(
  () => import("@/pages/admin/AdminStockImagesPage"),
);

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
        {/* ── Landing (accesible para todos) ────────────────────────── */}
        <Route element={<PublicLayout />}>
          <Route index element={<LandingPage />} />

          {/* Login / Register: redirige si ya hay sesión */}
          <Route element={<RedirectIfAuthenticated />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
          </Route>
          <Route path="auth/check-email" element={<CheckEmailPage />} />
          <Route path="auth/verify-email" element={<VerifyEmailPage />} />
          <Route path="auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="auth/reset-password" element={<ResetPasswordPage />} />
        </Route>

        {/* ── Rutas públicas de offerings ──────────────────────────── */}
        <Route element={<PublicLayout />}>
          <Route path="sessions" element={<SessionsPage />} />
          <Route path="sessions/:slug" element={<OfferingDetailPage />} />
          <Route path="immersions" element={<ImmersionsPage />} />
          <Route path="immersions/:slug" element={<OfferingDetailPage />} />
          <Route path="stays" element={<StaysPage />} />
          <Route path="stays/:slug" element={<OfferingDetailPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="services/:slug" element={<OfferingDetailPage />} />
          <Route path="experiences" element={<ExperiencesPage />} />
          <Route path="experiences/:slug" element={<OfferingDetailPage />} />
          <Route path="agenda" element={<AgendaPage />} />
        </Route>

        {/* ── Flujos de compra ─────────────────────────────────────── */}
        <Route element={<PublicLayout />}>
          <Route path="booking/:id" element={<BookingPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="checkout/confirmation" element={<ConfirmationPage />} />
        </Route>

        {/* ── Área cliente (/account) ──────────────────────────────── */}
        <Route element={<RequireAuth roles={["client", "admin", "root"]} />}>
          <Route element={<PublicLayout />}>
            <Route
              path="account"
              element={<Navigate to="/account/bookings" replace />}
            />
            <Route
              path="account/bookings"
              element={<CustomerBookingsPage />}
            />
            <Route path="account/orders" element={<CustomerOrdersPage />} />
            <Route path="account/profile" element={<CustomerProfilePage />} />
          </Route>
        </Route>

        {/* ── Panel admin ──────────────────────────────────────────── */}
        <Route
          element={<RequireAuth roles={["admin", "root"]} fallback="/" />}
        >
          <Route element={<AdminLayout />}>
            <Route path="app" element={<AdminDashboardPage />} />
            <Route path="app/leads" element={<AdminLeadsPage />} />
            <Route path="app/clients" element={<AdminCustomersPage />} />
            <Route
              path="app/customers"
              element={<Navigate to="/app/clients" replace />}
            />
            <Route path="app/offerings" element={<AdminOfferingsPage />} />
            <Route
              path="app/offerings/new"
              element={<AdminOfferingFormPage />}
            />
            <Route
              path="app/offerings/:id/edit"
              element={<AdminOfferingFormPage />}
            />
            <Route path="app/agenda" element={<AdminAgendaPage />} />
            <Route
              path="app/agenda/slots/new"
              element={<AdminSlotFormPage />}
            />
            <Route
              path="app/agenda/slots/:id/edit"
              element={<AdminSlotFormPage />}
            />
            <Route
              path="app/agenda/blocks/new"
              element={<AdminBlockFormPage />}
            />
            <Route
              path="app/agenda/blocks/:id/edit"
              element={<AdminBlockFormPage />}
            />
            <Route path="app/content" element={<AdminContentPage />} />
            <Route path="app/content/new" element={<AdminContentFormPage />} />
            <Route
              path="app/content/:id/edit"
              element={<AdminContentFormPage />}
            />
            <Route path="app/orders" element={<AdminOrdersPage />} />
            <Route path="app/bookings" element={<AdminBookingsPage />} />
            <Route path="app/passes" element={<AdminPassesPage />} />
            {/* ── Root-only ─────────────────────────────────────── */}
            <Route element={<RequireAuth roles={["root"]} fallback="/app" />}>
              <Route
                path="app/stock-images"
                element={<AdminStockImagesPage />}
              />
              <Route path="app/settings" element={<AdminSettingsPage />} />
            </Route>
          </Route>
        </Route>

        {/* ── Compat redirects ─────────────────────────────────────── */}
        <Route path="zone" element={<Navigate to="/" replace />} />
        <Route path="zone/*" element={<Navigate to="/" replace />} />
        <Route path="classes" element={<Navigate to="/sessions" replace />} />
        <Route
          path="classes/:slug"
          element={<Navigate to="/sessions" replace />}
        />
        <Route path="packages" element={<Navigate to="/sessions" replace />} />
        <Route path="wellness" element={<Navigate to="/sessions" replace />} />
        <Route
          path="memberships"
          element={<Navigate to="/sessions" replace />}
        />

        {/* ── 404 ──────────────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
