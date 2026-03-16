/**
 * sync-user-profile — Appwrite Function
 *
 * Trigger:  HTTP (called from frontend via functions.createExecution)
 * Runtime:  node-20.0
 * Scopes:   users.read, users.write, databases.read, databases.write
 *
 * Responsibility:
 *   Read firstName + lastName from users_profile and update Auth.name.
 *   Also recalculates fullName in the profile for consistency.
 *
 * Security:
 *   - Appwrite injects x-appwrite-user-id header when called by an
 *     authenticated client.
 *   - The function verifies that the caller is updating their OWN profile.
 *   - Role, status, and emailVerified are NOT updated here.
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
  const phoneFromBody = body?.phone !== undefined ? body.phone : undefined;
  if (!requestedUserId) {
    return res.json({ ok: false, error: "Missing userId" }, 400);
  }

  // ── Authorization: caller must be the same user ───────────────────────────
  // Appwrite sets x-appwrite-user-id when an authenticated user calls a function.
  const callerUserId = req.headers?.["x-appwrite-user-id"];
  if (callerUserId && callerUserId !== requestedUserId) {
    error(
      `Unauthorized: caller ${callerUserId} tried to sync profile for ${requestedUserId}`,
    );
    return res.json({ ok: false, error: "Unauthorized" }, 401);
  }

  // ── Appwrite server client ─────────────────────────────────────────────────
  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

  const db = new Databases(client);
  const users = new Users(client);

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

  // ── Build canonical name ───────────────────────────────────────────────────
  const fn = (profile.firstName ?? "").trim();
  const ln = (profile.lastName ?? "").trim();
  const fullName = [fn, ln].filter(Boolean).join(" ") || "Usuario";

  // ── Update Auth.name ───────────────────────────────────────────────────────
  try {
    await users.updateName(requestedUserId, fullName);
  } catch (e) {
    error(`Failed to update Auth.name: ${e.message}`);
    return res.json({ ok: false, error: e.message }, 500);
  }

  // ── Update profile.fullName + updatedAt ───────────────────────────────────
  try {
    await db.updateDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_USERS_PROFILE_COLLECTION_ID,
      profile.$id,
      { fullName, updatedAt: new Date().toISOString() },
    );
  } catch (e) {
    // Non-fatal: Auth.name is already updated; profile fullName is cosmetic.
    error(`Failed to update profile.fullName: ${e.message}`);
  }

  log(`Synced Auth.name="${fullName}" for user ${requestedUserId}`);

  // ── Sync Auth.phone if phone was provided in the request body ────────────────
  // phone is no longer stored in users_profile; it lives in Auth only.
  if (phoneFromBody !== undefined) {
    if (phoneFromBody) {
      try {
        await users.updatePhone(requestedUserId, phoneFromBody);
        log(`Synced Auth.phone for user ${requestedUserId}`);
      } catch (e) {
        error(`Failed to update Auth.phone: ${e.message}`);
      }
    }
    // null / empty means "clear" — no-op (Appwrite requires OTP to clear phone via client)
  }

  return res.json({ ok: true, fullName });
};
