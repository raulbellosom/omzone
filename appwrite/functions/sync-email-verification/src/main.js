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
 * Environment variables (Appwrite Console Global Variables — same names as frontend .env):
 *   APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID
 *   APPWRITE_API_KEY                          — server secret (never in frontend .env)
 *   APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_USERS_PROFILE_ID
 */

import { Client, Databases, Users } from "node-appwrite";

export default async ({ req, res, log, error }) => {
  const {
    APPWRITE_ENDPOINT,
    APPWRITE_PROJECT_ID,
    APPWRITE_API_KEY,
    APPWRITE_DATABASE_ID,
    APPWRITE_COLLECTION_USERS_PROFILE_ID,
  } = process.env;

  const APPWRITE_USERS_PROFILE_COLLECTION_ID =
    APPWRITE_COLLECTION_USERS_PROFILE_ID;

  if (
    !APPWRITE_API_KEY ||
    !APPWRITE_DATABASE_ID ||
    !APPWRITE_COLLECTION_USERS_PROFILE_ID
  ) {
    error("Missing required environment variables.");
    return res.json({ ok: false, error: "Misconfigured function" }, 500);
  }

  // ── Parse body ─────────────────────────────────────────────────────────────
  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return res.json({ ok: false, error: "Invalid JSON body" }, 400);
  }

  const requestedUserId = body?.userId;
  if (!requestedUserId) {
    return res.json({ ok: false, error: "Missing userId" }, 400);
  }

  // ── Authorization ──────────────────────────────────────────────────────────
  const callerUserId = req.headers?.["x-appwrite-user-id"];
  if (callerUserId && callerUserId !== requestedUserId) {
    error(
      `Unauthorized: caller ${callerUserId} attempted to sync ${requestedUserId}`,
    );
    return res.json({ ok: false, error: "Unauthorized" }, 401);
  }

  // ── Server client ──────────────────────────────────────────────────────────
  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

  const db = new Databases(client);
  const users = new Users(client);

  // ── Read authoritative verification state from Auth ───────────────────────
  let authUser;
  try {
    authUser = await users.get(requestedUserId);
  } catch (e) {
    error(`Failed to get Auth user: ${e.message}`);
    return res.json({ ok: false, error: e.message }, 500);
  }

  const emailVerified = authUser?.emailVerification ?? false;

  // ── Fetch profile — document $id === userId ─────────────────────────────
  let profile;
  try {
    profile = await db.getDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_USERS_PROFILE_COLLECTION_ID,
      requestedUserId,
    );
  } catch (e) {
    if (e.code === 404)
      return res.json({ ok: false, error: "Profile not found" }, 404);
    error(`Failed to fetch profile: ${e.message}`);
    return res.json({ ok: false, error: e.message }, 500);
  }

  // ── Build update payload ───────────────────────────────────────────────────
  const update = {
    emailVerified,
    updatedAt: new Date().toISOString(),
  };

  // Promote status from pending_verification → active when email is verified
  if (emailVerified && profile.status === "pending_verification") {
    update.status = "active";
  }

  // ── Persist to profile ─────────────────────────────────────────────────────
  try {
    await db.updateDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_USERS_PROFILE_COLLECTION_ID,
      profile.$id,
      update,
    );
  } catch (e) {
    error(`Failed to update profile: ${e.message}`);
    return res.json({ ok: false, error: e.message }, 500);
  }

  log(`Synced emailVerified=${emailVerified} for user ${requestedUserId}`);
  // Ensure the client label is set (idempotent — covers users registered before label sync was added).
  try {
    await users.updateLabels(requestedUserId, ["client"]);
  } catch (labelErr) {
    error(`Failed to assign label: ${labelErr.message}`);
    // Non-fatal.
  }
  return res.json({ ok: true, emailVerified, statusUpdated: !!update.status });
};
