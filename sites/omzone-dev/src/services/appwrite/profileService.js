/**
 * profileService.js — users_profile collection operations + normalization.
 *
 * Security model:
 *  - Frontend can read/update only its own profile (enforced by rowSecurity).
 *  - Sensitive fields (roleKey, status, emailVerified) are updated only via
 *    Appwrite Functions using a server API key.
 *  - Functions are called by profileService when appropriate.
 */
import { databases, functions, storage } from "./client";
import { ID, Permission, Role } from "appwrite";
import {
  APPWRITE_DATABASE_ID,
  COL_USERS_PROFILE,
  FN_SYNC_USER_PROFILE,
  FN_SYNC_EMAIL_VERIFICATION,
  BUCKET_AVATARS,
} from "@/env";

const DB_ID = APPWRITE_DATABASE_ID;
const COLLECTION_ID = COL_USERS_PROFILE;
const FN_SYNC_PROFILE = FN_SYNC_USER_PROFILE;
const FN_SYNC_VERIFY = FN_SYNC_EMAIL_VERIFICATION;

/** Allowed fields the client can write directly to the profile document. */
const CLIENT_WRITABLE = ["firstName", "lastName", "locale", "avatarId"];

// ── Read ─────────────────────────────────────────────────────────────────────

/**
 * Fetch the users_profile document for a given Auth userId.
 * Returns null if no profile exists yet (e.g., right after registration
 * before the create-user-profile function has run).
 */
export async function getMyUserProfile(userId) {
  try {
    return await databases.getDocument(DB_ID, COLLECTION_ID, userId);
  } catch (e) {
    if (e.code === 404) return null;
    throw e;
  }
}

// ── Write ─────────────────────────────────────────────────────────────────────

/**
 * Update editable profile fields.
 * Automatically recalculates fullName if firstName or lastName changes.
 * Triggers sync-user-profile Function when names change to update Auth.name.
 */
export async function updateMyUserProfile(userId, data) {
  const profile = await getMyUserProfile(userId);
  if (!profile) throw new Error("Profile not found");

  const update = {};
  CLIENT_WRITABLE.forEach((k) => {
    if (data[k] !== undefined) update[k] = data[k];
  });

  if (update.firstName !== undefined || update.lastName !== undefined) {
    const fn = (update.firstName ?? profile.firstName ?? "").trim();
    const ln = (update.lastName ?? profile.lastName ?? "").trim();
    update.fullName = [fn, ln].filter(Boolean).join(" ") || "Usuario";
  }

  update.updatedAt = new Date().toISOString();

  const updated = await databases.updateDocument(
    DB_ID,
    COLLECTION_ID,
    profile.$id,
    update,
  );

  // Sync Auth.name when display name changes
  if (update.firstName !== undefined || update.lastName !== undefined) {
    await _invokeFunction(FN_SYNC_PROFILE, { userId });
  }

  return updated;
}

// ── Function bridges ──────────────────────────────────────────────────────────

/**
 * Invoke sync-user-profile Function.
 * Called after updating firstName/lastName so Auth.name stays in sync.
 */
export async function syncMyProfileToAuth(userId) {
  return _invokeFunction(FN_SYNC_PROFILE, { userId });
}

/**
 * Update the phone number in Appwrite Auth directly.
 * Invokes sync-user-profile with the phone in the body —
 * no database write needed (phone no longer lives in users_profile).
 */
export async function updateMyPhone(userId, phone) {
  return _invokeFunction(FN_SYNC_PROFILE, { userId, phone: phone || null });
}

/**
 * Invoke sync-email-verification Function.
 * Called from VerifyEmailPage after account.updateVerification() succeeds.
 */
export async function syncEmailVerification(userId) {
  return _invokeFunction(FN_SYNC_VERIFY, { userId });
}

// ── Normalizer ────────────────────────────────────────────────────────────────

/**
 * Merge an Appwrite Auth user + users_profile document into the normalized
 * user shape used throughout the frontend.
 *
 * Snake_case field names maintain backwards-compatibility with existing
 * pages that were built against the mock service.
 *
 * @param {object|null} authUser   - Result of account.get()
 * @param {object|null} profile    - users_profile document (may be null right
 *                                   after registration before function runs)
 */
export function normalizeProfile(authUser, profile) {
  if (!authUser && !profile) return null;

  const fn = profile?.firstName ?? "";
  const ln = profile?.lastName ?? "";
  const computedFullName = [fn, ln].filter(Boolean).join(" ");

  return {
    // Unique identifier — always the Auth $id (== profile.$id)
    $id: authUser?.$id ?? profile?.$id ?? null,

    email: authUser?.email ?? "",
    email_verified:
      authUser?.emailVerification ?? profile?.emailVerified ?? false,

    // Normalized snake_case names (backwards-compat)
    first_name: fn,
    last_name: ln,
    full_name: profile?.fullName ?? computedFullName ?? authUser?.name ?? "",

    // Access control
    role_key: profile?.roleKey ?? "client",

    // Account state
    status: profile?.status ?? "pending_verification",
    onboarding_completed: profile?.onboardingCompleted ?? false,

    // Extended info — phone lives in Auth, not in users_profile
    phone: authUser?.phone ?? null,
    avatar_id: profile?.avatarId ?? null,
    locale: profile?.locale ?? "es",
    provider: profile?.provider ?? "email",

    // Raw Appwrite objects for advanced use cases
    _profile: profile ?? null,
    _authUser: authUser ?? null,
  };
}

// ── Avatar storage ────────────────────────────────────────────────────────────

/**
 * Upload a profile avatar for a user.
 * Sets file-level permissions so only the owner can update/delete it.
 * Returns the new file $id (avatarId).
 */
export async function uploadAvatar(userId, file) {
  const result = await storage.createFile(
    BUCKET_AVATARS,
    ID.unique(),
    file,
    [
      Permission.read(Role.any()),
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId)),
    ],
  )
  return result.$id
}

/**
 * Delete an avatar file. Non-fatal — silently ignores 404.
 */
export async function deleteAvatar(fileId) {
  if (!fileId || !BUCKET_AVATARS) return
  try {
    await storage.deleteFile(BUCKET_AVATARS, fileId)
  } catch {
    // File may already be deleted — ignore
  }
}

/**
 * Returns a preview URL for an avatar file (synchronous).
 * Returns null when avatarId or bucket is not configured.
 */
export function getAvatarUrl(avatarId, size = 128) {
  if (!avatarId || !BUCKET_AVATARS) return null
  return storage.getFilePreview(BUCKET_AVATARS, avatarId, size, size).href
}

// ── Private helpers ───────────────────────────────────────────────────────────

async function _invokeFunction(functionId, payload) {
  if (!functionId) return; // Function ID not configured yet
  try {
    await functions.createExecution(
      functionId,
      JSON.stringify(payload),
      false,
      "/",
      "POST",
      { "Content-Type": "application/json" },
    );
  } catch (err) {
    // Non-fatal: log but don't break the main flow
    console.warn("[profileService] Function invocation failed:", err?.message);
  }
}
