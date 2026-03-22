/**
 * Rutas de la aplicación — fuente de verdad central.
 * Usar siempre estas constantes en lugar de strings hardcodeados.
 */
export const ROUTES = {
  // ── Públicas ────────────────────────────────────────────────────────────────
  HOME: "/",
  SESSIONS: "/sessions",
  SESSION_DETAIL: (slug) => `/sessions/${slug}`,
  IMMERSIONS: "/immersions",
  IMMERSION_DETAIL: (slug) => `/immersions/${slug}`,
  STAYS: "/stays",
  STAY_DETAIL: (slug) => `/stays/${slug}`,
  SERVICES: "/services",
  SERVICE_DETAIL: (slug) => `/services/${slug}`,
  EXPERIENCES: "/experiences",
  AGENDA: "/agenda",

  // ── Autenticación ──────────────────────────────────────────────────────────
  LOGIN: "/login",
  REGISTER: "/register",
  AUTH_CHECK_EMAIL: "/auth/check-email",
  AUTH_VERIFY_EMAIL: "/auth/verify-email",
  AUTH_FORGOT_PASSWORD: "/auth/forgot-password",
  AUTH_RESET_PASSWORD: "/auth/reset-password",

  // ── Flujos de compra ────────────────────────────────────────────────────────
  BOOKING: (id) => `/booking/${id}`,
  CHECKOUT: "/checkout",
  CHECKOUT_CONFIRMATION: "/checkout/confirmation",

  // ── Área cliente (/account) ────────────────────────────────────────────────
  ACCOUNT_BOOKINGS: "/account/bookings",
  ACCOUNT_ORDERS: "/account/orders",
  ACCOUNT_PROFILE: "/account/profile",

  // ── Panel admin (/app) ─────────────────────────────────────────────────────
  ADMIN: "/app",
  ADMIN_DASHBOARD: "/app",
  ADMIN_LEADS: "/app/leads",
  ADMIN_CLIENTS: "/app/clients",
  ADMIN_OFFERINGS: "/app/offerings",
  ADMIN_OFFERING_NEW: "/app/offerings/new",
  ADMIN_OFFERING_EDIT: (id) => `/app/offerings/${id}/edit`,
  ADMIN_AGENDA: "/app/agenda",
  ADMIN_SLOT_NEW: "/app/agenda/slots/new",
  ADMIN_SLOT_EDIT: (id) => `/app/agenda/slots/${id}/edit`,
  ADMIN_BLOCK_NEW: "/app/agenda/blocks/new",
  ADMIN_BLOCK_EDIT: (id) => `/app/agenda/blocks/${id}/edit`,
  ADMIN_CONTENT: "/app/content",
  ADMIN_CONTENT_NEW: "/app/content/new",
  ADMIN_CONTENT_EDIT: (id) => `/app/content/${id}/edit`,
  ADMIN_ORDERS: "/app/orders",
  ADMIN_BOOKINGS: "/app/bookings",
  ADMIN_PASSES: "/app/passes",
  ADMIN_STOCK_IMAGES: "/app/stock-images",
  ADMIN_SETTINGS: "/app/settings",
};

export default ROUTES;
