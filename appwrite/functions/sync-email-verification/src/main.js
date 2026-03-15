/**
 * sync-email-verification — Appwrite Function
 *
 * Trigger:  HTTP (called from VerifyEmailPage after account.updateVerification)
 * Runtime:  node-20.0
 * Scopes:   users.read, databases.read, databases.write
 *
 * Responsibility:
 *   Read the real emailVerification state from Appwrite Auth (server SDK)
 *   and write it to users_profile.emailVerified.
 *   If emailVerified becomes true and status was 'pending_verification',
 *   it is upgraded to 'active'.
 *
 * Security:
 *   - Caller must be the same user (x-appwrite-user-id header check).
 *   - emailVerified and status are written ONLY by this function, not by
 *     the client SDK, preventing front-end manipulation.
 *
 * Request body (JSON): { "userId": "<auth_user_id>" }
 *
 * Environment variables:
 *   APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY
 *   APPWRITE_DATABASE_ID, APPWRITE_USERS_PROFILE_COLLECTION_ID
 */

import { Client, Databases, Users, Query } from 'node-appwrite'

export default async ({ req, res, log, error }) => {
  const {
    APPWRITE_ENDPOINT,
    APPWRITE_PROJECT_ID,
    APPWRITE_API_KEY,
    APPWRITE_DATABASE_ID,
    APPWRITE_USERS_PROFILE_COLLECTION_ID,
  } = process.env

  if (!APPWRITE_API_KEY || !APPWRITE_DATABASE_ID || !APPWRITE_USERS_PROFILE_COLLECTION_ID) {
    error('Missing required environment variables.')
    return res.json({ ok: false, error: 'Misconfigured function' }, 500)
  }

  // ── Parse body ─────────────────────────────────────────────────────────────
  let body
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  } catch {
    return res.json({ ok: false, error: 'Invalid JSON body' }, 400)
  }

  const requestedUserId = body?.userId
  if (!requestedUserId) {
    return res.json({ ok: false, error: 'Missing userId' }, 400)
  }

  // ── Authorization ──────────────────────────────────────────────────────────
  const callerUserId = req.headers?.['x-appwrite-user-id']
  if (callerUserId && callerUserId !== requestedUserId) {
    error(`Unauthorized: caller ${callerUserId} attempted to sync ${requestedUserId}`)
    return res.json({ ok: false, error: 'Unauthorized' }, 401)
  }

  // ── Server client ──────────────────────────────────────────────────────────
  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY)

  const db    = new Databases(client)
  const users = new Users(client)

  // ── Read authoritative verification state from Auth ───────────────────────
  let authUser
  try {
    authUser = await users.get(requestedUserId)
  } catch (e) {
    error(`Failed to get Auth user: ${e.message}`)
    return res.json({ ok: false, error: e.message }, 500)
  }

  const emailVerified = authUser?.emailVerification ?? false

  // ── Fetch profile ──────────────────────────────────────────────────────────
  let profile
  try {
    const result = await db.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_USERS_PROFILE_COLLECTION_ID,
      [Query.equal('userId', requestedUserId), Query.limit(1)],
    )
    profile = result.documents[0]
  } catch (e) {
    error(`Failed to fetch profile: ${e.message}`)
    return res.json({ ok: false, error: e.message }, 500)
  }

  if (!profile) {
    return res.json({ ok: false, error: 'Profile not found' }, 404)
  }

  // ── Build update payload ───────────────────────────────────────────────────
  const update = {
    emailVerified,
    updatedAt: new Date().toISOString(),
  }

  // Promote status from pending_verification → active when email is verified
  if (emailVerified && profile.status === 'pending_verification') {
    update.status = 'active'
  }

  // ── Persist to profile ─────────────────────────────────────────────────────
  try {
    await db.updateDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_USERS_PROFILE_COLLECTION_ID,
      profile.$id,
      update,
    )
  } catch (e) {
    error(`Failed to update profile: ${e.message}`)
    return res.json({ ok: false, error: e.message }, 500)
  }

  log(`Synced emailVerified=${emailVerified} for user ${requestedUserId}`)
  return res.json({ ok: true, emailVerified, statusUpdated: !!update.status })
}
