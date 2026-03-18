/**
 * Rutas de la aplicación — fuente de verdad central.
 * Usar siempre estas constantes en lugar de strings hardcodeados.
 */
export const ROUTES = {
  // ── Públicas ────────────────────────────────────────────────────────────────
  HOME: "/",
  CLASSES: "/classes",
  CLASS_DETAIL: (slug) => `/classes/${slug}`,
  PACKAGES: "/packages",
  WELLNESS: "/wellness",

  // ── Autenticación ──────────────────────────────────────────────────────────
  LOGIN: "/login",
  REGISTER: "/register",
  AUTH_CHECK_EMAIL: "/auth/check-email",
  AUTH_VERIFY_EMAIL: "/auth/verify-email",
  AUTH_FORGOT_PASSWORD: "/auth/forgot-password",
  AUTH_RESET_PASSWORD: "/auth/reset-password",

  // ── Flujos de compra ────────────────────────────────────────────────────────
  BOOKING: (sessionId) => `/booking/${sessionId}`,
  CHECKOUT: "/checkout",
  CHECKOUT_CONFIRMATION: "/checkout/confirmation",

  // ── Área cliente (/zone) ────────────────────────────────────────────────────
  ZONE: "/zone",
  ZONE_DASHBOARD: "/zone/dashboard",
  ZONE_BOOKINGS: "/zone/bookings",
  ZONE_ORDERS: "/zone/orders",
  ZONE_PACKAGES: "/zone/packages",
  ZONE_PROFILE: "/zone/profile",

  // ── Panel admin (/app) ───────────────────────────────────────────────────────
  ADMIN: "/app",
  ADMIN_DASHBOARD: "/app",
  ADMIN_LEADS: "/app/leads",
  ADMIN_CLIENTS: "/app/clients",
  ADMIN_CUSTOMERS: "/app/customers",
  ADMIN_CLASSES: "/app/classes",
  ADMIN_SESSIONS: "/app/sessions",
  ADMIN_PACKAGES: "/app/packages",
  ADMIN_PRODUCTS: "/app/products",
  ADMIN_ORDERS: "/app/orders",
  ADMIN_BOOKINGS: "/app/bookings",
  ADMIN_PASSES: "/app/passes",
ADMIN_STOCK_IMAGES: "/app/stock-images",
  ADMIN_SETTINGS: "/app/settings",
};

export default ROUTES;
