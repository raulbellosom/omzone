/**
 * env.js - Frontend environment variables.
 *
 * APPWRITE_* vars are shared between frontend and functions.
 * VITE_* vars are frontend-only.
 */

// App (frontend-only)
export const APP_NAME = import.meta.env.VITE_APP_NAME ?? "Omzone";
export const APP_ENV = import.meta.env.VITE_APP_ENV ?? "production";
export const APP_BASE_URL =
  import.meta.env.VITE_APP_BASE_URL ?? "https://omzone.com";
export const APP_VERSION = import.meta.env.VITE_APP_VERSION ?? "1.0.0";

// Appwrite connection
export const APPWRITE_ENDPOINT = import.meta.env.APPWRITE_ENDPOINT;
export const APPWRITE_PROJECT_ID = import.meta.env.APPWRITE_PROJECT_ID;
export const APPWRITE_DATABASE_ID = import.meta.env.APPWRITE_DATABASE_ID;
export const APPWRITE_APP_URL = import.meta.env.APPWRITE_APP_URL ?? APP_BASE_URL;

// Appwrite tables (active model)
export const COL_USERS_PROFILE =
  import.meta.env.APPWRITE_COLLECTION_USERS_PROFILE_ID;
export const COL_CONTACT_LEADS =
  import.meta.env.APPWRITE_COLLECTION_CONTACT_LEADS_ID;
export const COL_ORDERS = import.meta.env.APPWRITE_COLLECTION_ORDERS_ID;
export const COL_ORDER_ITEMS = import.meta.env.APPWRITE_COLLECTION_ORDER_ITEMS_ID;
export const COL_BOOKINGS = import.meta.env.APPWRITE_COLLECTION_BOOKINGS_ID;
export const COL_ACCESS_PASSES = import.meta.env.APPWRITE_COLLECTION_ACCESS_PASSES_ID;
export const COL_APP_SETTINGS = import.meta.env.APPWRITE_COLLECTION_APP_SETTINGS_ID;

// Appwrite tables (offerings)
export const COL_OFFERINGS = import.meta.env.APPWRITE_COLLECTION_OFFERINGS_ID;
export const COL_OFFERING_SLOTS =
  import.meta.env.APPWRITE_COLLECTION_OFFERING_SLOTS_ID;
export const COL_LOCATION_PROFILES =
  import.meta.env.APPWRITE_COLLECTION_LOCATION_PROFILES_ID;
export const COL_AVAILABILITY_BLOCKS =
  import.meta.env.APPWRITE_COLLECTION_AVAILABILITY_BLOCKS_ID;
export const COL_CONTENT_SECTIONS =
  import.meta.env.APPWRITE_COLLECTION_CONTENT_SECTIONS_ID;

// Appwrite buckets
export const BUCKET_PUBLIC_MEDIA = import.meta.env.APPWRITE_BUCKET_PUBLIC_MEDIA_ID;
export const BUCKET_PRIVATE_MEDIA = import.meta.env.APPWRITE_BUCKET_PRIVATE_MEDIA_ID;
export const BUCKET_AVATARS = import.meta.env.APPWRITE_BUCKET_AVATARS_ID;
export const BUCKET_STOCK_IMAGES = import.meta.env.APPWRITE_BUCKET_STOCK_IMAGES_ID;

// Appwrite functions
export const FN_CREATE_USER_PROFILE =
  import.meta.env.APPWRITE_FUNCTION_CREATE_USER_PROFILE_ID;
export const FN_SYNC_USER_PROFILE =
  import.meta.env.APPWRITE_FUNCTION_SYNC_USER_PROFILE_ID;
export const FN_SYNC_EMAIL_VERIFICATION =
  import.meta.env.APPWRITE_FUNCTION_SYNC_EMAIL_VERIFICATION_ID;
export const FN_ADMIN_WRITE_OFFERINGS =
  import.meta.env.APPWRITE_FUNCTION_ADMIN_WRITE_OFFERINGS_ID;
export const FN_SUBMIT_CONTACT = import.meta.env.APPWRITE_FUNCTION_SUBMIT_CONTACT_ID;
