/**
 * create-user-profile — Appwrite Function
 *
 * Trigger:  Event → users.*.create
 * Runtime:  node-20.0
 * Scopes:   users.read, databases.read, databases.write
 *
 * Responsibility:
 *   Create (or ensure) a users_profile document when a new Appwrite Auth
 *   user is created. The document is idempotent: if it already exists the
 *   function exits cleanly without duplicating data.
 *
 * Name parsing:
 *   Appwrite Auth stores a single `name` field. During registration the
 *   frontend sets name = `${firstName} ${lastName}`. This function splits
 *   that value to populate firstName/lastName. If the name has no space,
 *   firstName = name and lastName = ''.
 *
 * Environment variables (Appwrite Console Global Variables — same names as frontend .env):
 *   APPWRITE_ENDPOINT                       — https://appwrite.racoondevs.com/v1
 *   APPWRITE_PROJECT_ID                     — project ID
 *   APPWRITE_API_KEY                        — server API key (secret, never in frontend .env)
 *   APPWRITE_DATABASE_ID                    — main
 *   APPWRITE_COLLECTION_USERS_PROFILE_ID    — users_profile
 */

import { Client, Databases, Users, ID, Permission, Role } from "node-appwrite";

export default async ({ req, res, log, error }) => {
  // ── Environment ────────────────────────────────────────────────────────────
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

  // ── Appwrite server client ─────────────────────────────────────────────────
  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

  const db = new Databases(client);
  const users = new Users(client);

  // ── Parse event payload ────────────────────────────────────────────────────
  // When triggered by users.*.create the request body IS the user object.
  let user;
  try {
    user = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    error("Failed to parse request body.");
    return res.json({ ok: false, error: "Invalid payload" }, 400);
  }

  const userId = user?.$id;
  const name = (user?.name ?? "").trim();

  if (!userId) {
    error("No userId in payload.");
    return res.json({ ok: false, error: "No userId" }, 400);
  }

  // ── Idempotency check — document $id === userId ──────────────────────────
  try {
    await db.getDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_USERS_PROFILE_COLLECTION_ID,
      userId,
    );
    log(`Profile already exists for user ${userId}. Skipping.`);
    return res.json({ ok: true, skipped: true });
  } catch (e) {
    if (e.code !== 404) {
      error(`Failed idempotency check: ${e.message}`);
      return res.json({ ok: false, error: e.message }, 500);
    }
    // 404 => no profile yet, proceed to create
  }

  // ── Parse name into firstName / lastName ───────────────────────────────────
  const parts = name.split(/\s+/).filter(Boolean);
  const firstName = parts[0] ?? "";
  const lastName = parts.slice(1).join(" ") ?? "";
  const fullName =
    [firstName, lastName].filter(Boolean).join(" ") || name || "Usuario";

  // ── Create profile document ────────────────────────────────────────────────
  const now = new Date().toISOString();

  try {
    const doc = await db.createDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_USERS_PROFILE_COLLECTION_ID,
      userId,
      {
        firstName,
        lastName,
        fullName,
        emailVerified: user?.emailVerification ?? false,
        roleKey: "client",
        status: "pending_verification",
        onboardingCompleted: false,
        provider: "email",
        locale: "es",
        isSystemUser: false,
        enabled: true,
        createdAt: now,
        updatedAt: now,
      },
      // Document-level permissions: owner can read + update their own profile.
      // Server SDK (API key) bypasses these for admin/function operations.
      [
        Permission.read(Role.user(userId)),
        Permission.update(Role.user(userId)),
      ],
    );

    log(`Profile created for user ${userId} — document ${doc.$id}`);
    // Assign 'client' label so collection-level label:client permissions work.
    try {
      await users.updateLabels(userId, ["client"]);
    } catch (labelErr) {
      error(`Failed to assign label: ${labelErr.message}`);
      // Non-fatal: profile exists; label can be set manually in Appwrite Console.
    }
    return res.json({ ok: true, documentId: doc.$id });
  } catch (e) {
    error(`Failed to create profile: ${e.message}`);
    return res.json({ ok: false, error: e.message }, 500);
  }
};
