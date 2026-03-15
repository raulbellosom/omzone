import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'

// Layouts
import PublicLayout from '@/layouts/PublicLayout'
import CustomerLayout from '@/layouts/CustomerLayout'
import AdminLayout from '@/layouts/AdminLayout'

// Guards
import { RequireAuth } from '@/routes/guards'

// Páginas públicas (lazy)
const LandingPage = lazy(() => import('@/pages/public/LandingPage'))
const ClassesPage = lazy(() => import('@/pages/public/ClassesPage'))
const ClassDetailPage = lazy(() => import('@/pages/public/ClassDetailPage'))
const MembershipsPage = lazy(() => import('@/pages/public/MembershipsPage'))
const PackagesPage = lazy(() => import('@/pages/public/PackagesPage'))
const WellnessPage = lazy(() => import('@/pages/public/WellnessPage'))

// Auth
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))

// Flujos de compra
const BookingPage = lazy(() => import('@/pages/booking/BookingPage'))
const CheckoutPage = lazy(() => import('@/pages/checkout/CheckoutPage'))
const ConfirmationPage = lazy(() => import('@/pages/checkout/ConfirmationPage'))

// Área cliente
const CustomerDashboardPage = lazy(() => import('@/pages/customer/CustomerDashboardPage'))
const CustomerBookingsPage = lazy(() => import('@/pages/customer/CustomerBookingsPage'))
const CustomerOrdersPage = lazy(() => import('@/pages/customer/CustomerOrdersPage'))
const CustomerMembershipPage = lazy(() => import('@/pages/customer/CustomerMembershipPage'))
const CustomerProfilePage = lazy(() => import('@/pages/customer/CustomerProfilePage'))

// Panel admin
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'))
const AdminLeadsPage = lazy(() => import('@/pages/admin/AdminLeadsPage'))
const AdminCustomersPage = lazy(() => import('@/pages/admin/AdminCustomersPage'))
const AdminClassesPage = lazy(() => import('@/pages/admin/AdminClassesPage'))
const AdminSessionsPage = lazy(() => import('@/pages/admin/AdminSessionsPage'))
const AdminMembershipsPage = lazy(() => import('@/pages/admin/AdminMembershipsPage'))
const AdminPackagesPage = lazy(() => import('@/pages/admin/AdminPackagesPage'))
const AdminProductsPage = lazy(() => import('@/pages/admin/AdminProductsPage'))
const AdminOrdersPage = lazy(() => import('@/pages/admin/AdminOrdersPage'))
const AdminBookingsPage = lazy(() => import('@/pages/admin/AdminBookingsPage'))
const AdminContentPage = lazy(() => import('@/pages/admin/AdminContentPage'))
const AdminSettingsPage = lazy(() => import('@/pages/admin/AdminSettingsPage'))

// Loading fallback
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-sage border-t-transparent animate-spin" />
        <p className="text-sm text-charcoal-muted">Cargando...</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ── Rutas públicas ──────────────────────────────────────────── */}
        <Route element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="classes" element={<ClassesPage />} />
          <Route path="classes/:slug" element={<ClassDetailPage />} />
          <Route path="memberships" element={<MembershipsPage />} />
          <Route path="packages" element={<PackagesPage />} />
          <Route path="wellness" element={<WellnessPage />} />

          {/* Auth (dentro del layout público para usar Navbar) */}
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>

        {/* ── Flujos de compra (autenticados o no) ───────────────────── */}
        <Route element={<PublicLayout />}>
          <Route path="booking/:sessionId" element={<BookingPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="checkout/confirmation" element={<ConfirmationPage />} />
        </Route>

        {/* ── Área cliente ────────────────────────────────────────────── */}
        <Route element={<RequireAuth roles={['customer', 'admin', 'root']} />}>
          <Route element={<CustomerLayout />}>
            <Route path="account" element={<CustomerDashboardPage />} />
            <Route path="account/bookings" element={<CustomerBookingsPage />} />
            <Route path="account/orders" element={<CustomerOrdersPage />} />
            <Route path="account/membership" element={<CustomerMembershipPage />} />
            <Route path="account/profile" element={<CustomerProfilePage />} />
          </Route>
        </Route>

        {/* ── Panel admin ─────────────────────────────────────────────── */}
        <Route element={<RequireAuth roles={['admin', 'root']} />}>
          <Route element={<AdminLayout />}>
            <Route path="app" element={<AdminDashboardPage />} />
            <Route path="app/leads" element={<AdminLeadsPage />} />
            <Route path="app/customers" element={<AdminCustomersPage />} />
            <Route path="app/classes" element={<AdminClassesPage />} />
            <Route path="app/sessions" element={<AdminSessionsPage />} />
            <Route path="app/memberships" element={<AdminMembershipsPage />} />
            <Route path="app/packages" element={<AdminPackagesPage />} />
            <Route path="app/products" element={<AdminProductsPage />} />
            <Route path="app/orders" element={<AdminOrdersPage />} />
            <Route path="app/bookings" element={<AdminBookingsPage />} />
            <Route path="app/content" element={<AdminContentPage />} />
            <Route path="app/settings" element={<AdminSettingsPage />} />
          </Route>
        </Route>

        {/* ── 404 ─────────────────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
