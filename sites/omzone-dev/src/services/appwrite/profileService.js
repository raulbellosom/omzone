/**
 * profileService.js — users_profile collection operations + normalization.
 *
 * Security model:
 *  - Frontend can read/update only its own profile (enforced by rowSecurity).
 *  - Sensitive fields (roleKey, status, emailVerified) are updated only via
 *    Appwrite Functions using a server API key.
 *  - Functions are called by profileService when appropriate.
 */
import { Query } from 'appwrite'
import { databases, functions } from './client'

const DB_ID         = import.meta.env.VITE_APPWRITE_DATABASE_ID
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_USERS_PROFILE_ID
const FN_SYNC_PROFILE = import.meta.env.VITE_APPWRITE_FUNCTION_SYNC_USER_PROFILE_ID
const FN_SYNC_VERIFY  = import.meta.env.VITE_APPWRITE_FUNCTION_SYNC_EMAIL_VERIFICATION_ID

/** Allowed fields the client can write directly. */
const CLIENT_WRITABLE = ['firstName', 'lastName', 'phone', 'locale', 'avatarId']

// ── Read ─────────────────────────────────────────────────────────────────────

/**
 * Fetch the users_profile document for a given Auth userId.
 * Returns null if no profile exists yet (e.g., right after registration
 * before the create-user-profile function has run).
 */
export async function getMyUserProfile(userId) {
  const result = await databases.listDocuments(DB_ID, COLLECTION_ID, [
    Query.equal('userId', userId),
    Query.limit(1),
  ])
  return result.documents[0] ?? null
}

// ── Write ─────────────────────────────────────────────────────────────────────

/**
 * Update editable profile fields.
 * Automatically recalculates fullName if firstName or lastName changes.
 * Triggers sync-user-profile Function when names change to update Auth.name.
 */
export async function updateMyUserProfile(userId, data) {
  const profile = await getMyUserProfile(userId)
  if (!profile) throw new Error('Profile not found')

  const update = {}
  CLIENT_WRITABLE.forEach((k) => {
    if (data[k] !== undefined) update[k] = data[k]
  })

  if (update.firstName !== undefined || update.lastName !== undefined) {
    const fn = (update.firstName  ?? profile.firstName  ?? '').trim()
    const ln = (update.lastName   ?? profile.lastName   ?? '').trim()
    update.fullName = [fn, ln].filter(Boolean).join(' ') || 'Usuario'
  }

  update.updatedAt = new Date().toISOString()

  const updated = await databases.updateDocument(DB_ID, COLLECTION_ID, profile.$id, update)

  // Sync Auth.name when display name changes
  if (update.firstName !== undefined || update.lastName !== undefined) {
    await _invokeFunction(FN_SYNC_PROFILE, { userId })
  }

  return updated
}

// ── Function bridges ──────────────────────────────────────────────────────────

/**
 * Invoke sync-user-profile Function.
 * Called after updating firstName/lastName so Auth.name stays in sync.
 */
export async function syncMyProfileToAuth(userId) {
  return _invokeFunction(FN_SYNC_PROFILE, { userId })
}

/**
 * Invoke sync-email-verification Function.
 * Called from VerifyEmailPage after account.updateVerification() succeeds.
 */
export async function syncEmailVerification(userId) {
  return _invokeFunction(FN_SYNC_VERIFY, { userId })
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
  if (!authUser && !profile) return null

  const fn = profile?.firstName ?? ''
  const ln = profile?.lastName  ?? ''
  const computedFullName = [fn, ln].filter(Boolean).join(' ')

  return {
    // Unique identifier — always the Auth $id
    $id:                  authUser?.$id      ?? profile?.userId ?? null,

    email:                authUser?.email    ?? profile?.email  ?? '',
    email_verified:       authUser?.emailVerification ?? profile?.emailVerified ?? false,

    // Normalized snake_case names (backwards-compat)
    first_name:           fn,
    last_name:            ln,
    full_name:            profile?.fullName  ?? computedFullName ?? authUser?.name ?? '',

    // Access control
    role_key:             profile?.roleKey   ?? 'client',

    // Account state
    status:               profile?.status    ?? 'pending_verification',
    onboarding_completed: profile?.onboardingCompleted ?? false,

    // Extended info
    phone:                profile?.phone     ?? null,
    avatar_id:            profile?.avatarId  ?? null,
    locale:               profile?.locale    ?? 'es',
    provider:             profile?.provider  ?? 'email',

    // Raw Appwrite objects for advanced use cases
    _profile:    profile    ?? null,
    _authUser:   authUser   ?? null,
  }
}

// ── Private helpers ───────────────────────────────────────────────────────────

async function _invokeFunction(functionId, payload) {
  if (!functionId) return  // Function ID not configured yet
  try {
    await functions.createExecution(
      functionId,
      JSON.stringify(payload),
      false,
      '/',
      'POST',
      { 'Content-Type': 'application/json' },
    )
  } catch (err) {
    // Non-fatal: log but don't break the main flow
    console.warn('[profileService] Function invocation failed:', err?.message)
  }
}
