/**
 * env.js — Fuente de verdad de todas las variables de entorno del frontend.
 *
 * Variables APPWRITE_* → sin prefijo VITE_ (mismo nombre en frontend, functions y Appwrite Console).
 * Variables VITE_*     → exclusivas del frontend (feature flags, config de app).
 *
 * vite.config.js carga APPWRITE_* desde .env vía loadEnv y los expone con define,
 * evitando que el build tome variables de sistema del entorno de Appwrite Sites
 * que pueden tener guiones en el nombre y romper esbuild.
 * APPWRITE_API_KEY nunca aparece aquí ni en .env — solo en Appwrite Console server-side.
 */

// ── App (frontend-only) ───────────────────────────────────────────────────────
export const APP_NAME = import.meta.env.VITE_APP_NAME ?? "Omzone";
export const APP_ENV = import.meta.env.VITE_APP_ENV ?? "production";
export const APP_BASE_URL =
  import.meta.env.VITE_APP_BASE_URL ?? "https://omzone.com";
export const APP_VERSION = import.meta.env.VITE_APP_VERSION ?? "1.0.0";

// ── Appwrite — conexión (shared con functions) ────────────────────────────────
export const APPWRITE_ENDPOINT = import.meta.env.APPWRITE_ENDPOINT;
export const APPWRITE_PROJECT_ID = import.meta.env.APPWRITE_PROJECT_ID;
export const APPWRITE_DATABASE_ID = import.meta.env.APPWRITE_DATABASE_ID;
/** URL base para links de verificación de email. */
export const APPWRITE_APP_URL =
  import.meta.env.APPWRITE_APP_URL ?? APP_BASE_URL;

// ── Appwrite — colecciones ────────────────────────────────────────────────────
export const COL_USERS_PROFILE = import.meta.env
  .APPWRITE_COLLECTION_USERS_PROFILE_ID;
export const COL_CONTACT_LEADS = import.meta.env
  .APPWRITE_COLLECTION_CONTACT_LEADS_ID;
export const COL_INSTRUCTORS = import.meta.env
  .APPWRITE_COLLECTION_INSTRUCTORS_ID;
export const COL_CLASS_TYPES = import.meta.env
  .APPWRITE_COLLECTION_CLASS_TYPES_ID;
export const COL_CLASSES = import.meta.env.APPWRITE_COLLECTION_CLASSES_ID;
export const COL_CLASS_SESSIONS = import.meta.env
  .APPWRITE_COLLECTION_CLASS_SESSIONS_ID;
export const COL_WELLNESS_PRODUCTS = import.meta.env
  .APPWRITE_COLLECTION_WELLNESS_PRODUCTS_ID;
export const COL_WELLNESS_PACKAGES = import.meta.env
  .APPWRITE_COLLECTION_WELLNESS_PACKAGES_ID;
export const COL_ORDERS = import.meta.env.APPWRITE_COLLECTION_ORDERS_ID;
export const COL_ORDER_ITEMS = import.meta.env
  .APPWRITE_COLLECTION_ORDER_ITEMS_ID;
export const COL_PAYMENTS = import.meta.env.APPWRITE_COLLECTION_PAYMENTS_ID;
export const COL_BOOKINGS = import.meta.env.APPWRITE_COLLECTION_BOOKINGS_ID;
export const COL_CLIENT_PACKAGES = import.meta.env
  .APPWRITE_COLLECTION_CLIENT_PACKAGES_ID;
export const COL_PACKAGE_USAGES = import.meta.env
  .APPWRITE_COLLECTION_PACKAGE_USAGES_ID;
export const COL_ACCESS_PASSES = import.meta.env
  .APPWRITE_COLLECTION_ACCESS_PASSES_ID;
export const COL_AUDIT_LOGS = import.meta.env.APPWRITE_COLLECTION_AUDIT_LOGS_ID;
export const COL_APP_SETTINGS = import.meta.env
  .APPWRITE_COLLECTION_APP_SETTINGS_ID;

// ── Appwrite — colecciones (Offerings model) ────────────────────────────────
export const COL_OFFERINGS = import.meta.env
  .APPWRITE_COLLECTION_OFFERINGS_ID;
export const COL_OFFERING_SLOTS = import.meta.env
  .APPWRITE_COLLECTION_OFFERING_SLOTS_ID;
export const COL_OFFERING_AVAILABILITY_RULES = import.meta.env
  .APPWRITE_COLLECTION_OFFERING_AVAILABILITY_RULES_ID;
export const COL_AVAILABILITY_BLOCKS = import.meta.env
  .APPWRITE_COLLECTION_AVAILABILITY_BLOCKS_ID;
export const COL_CONTENT_SECTIONS = import.meta.env
  .APPWRITE_COLLECTION_CONTENT_SECTIONS_ID;

// ── Appwrite — buckets ────────────────────────────────────────────────────────
export const BUCKET_PUBLIC_MEDIA = import.meta.env
  .APPWRITE_BUCKET_PUBLIC_MEDIA_ID;
export const BUCKET_PRIVATE_MEDIA = import.meta.env
  .APPWRITE_BUCKET_PRIVATE_MEDIA_ID;
export const BUCKET_AVATARS = import.meta.env.APPWRITE_BUCKET_AVATARS_ID;
export const BUCKET_STOCK_IMAGES = import.meta.env
  .APPWRITE_BUCKET_STOCK_IMAGES_ID;

// ── Appwrite — functions ──────────────────────────────────────────────────────
export const FN_CREATE_USER_PROFILE = import.meta.env
  .APPWRITE_FUNCTION_CREATE_USER_PROFILE_ID;
export const FN_SYNC_USER_PROFILE = import.meta.env
  .APPWRITE_FUNCTION_SYNC_USER_PROFILE_ID;
export const FN_SYNC_EMAIL_VERIFICATION = import.meta.env
  .APPWRITE_FUNCTION_SYNC_EMAIL_VERIFICATION_ID;
export const FN_ADMIN_WRITE_CATALOG = import.meta.env
  .APPWRITE_FUNCTION_ADMIN_WRITE_CATALOG_ID;
export const FN_ADMIN_WRITE_OFFERINGS = import.meta.env
  .APPWRITE_FUNCTION_ADMIN_WRITE_OFFERINGS_ID;
export const FN_SUBMIT_CONTACT = import.meta.env
  .APPWRITE_FUNCTION_SUBMIT_CONTACT_ID;
