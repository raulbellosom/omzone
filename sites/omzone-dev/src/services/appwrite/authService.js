/**
 * authService.js — Appwrite Auth operations.
 * All functions use the client SDK (browser context).
 * Server-only operations (role/status writes) are handled by Functions.
 */
import { ID } from "appwrite";
import { account } from "./client";
import { APPWRITE_APP_URL } from "@/env";

/**
 * Register a new user.
 * Steps: create account → start session → send verification email.
 * @returns {Promise<object>} Appwrite Auth user object
 */
export async function registerWithEmailPassword({
  firstName,
  lastName,
  email,
  password,
  locale = "es",
}) {
  const fn = firstName.trim();
  const ln = lastName.trim();
  const fullName = [fn, ln].filter(Boolean).join(" ");
  const cleanEmail = email.trim().toLowerCase();

  // 1. Create user (triggers create-user-profile function via event)
  await account.create(ID.unique(), cleanEmail, password, fullName);

  // 2. Start session immediately so we can request email verification
  await account.createEmailPasswordSession(cleanEmail, password);

  // 3. Send verification email
  const appUrl = APPWRITE_APP_URL;
  await account.createVerification(`${appUrl}/auth/verify-email`);

  return account.get();
}

/**
 * Log in with email + password.
 * Silently clears any stale session before creating a new one so that
 * ghost sessions (deleted users, expired tokens, corrupt local storage)
 * never block the login flow.
 * @returns {Promise<object>} Appwrite Auth user object
 */
export async function loginWithEmailPassword(email, password) {
  const cleanEmail = email.trim().toLowerCase();

  // Step 1: Purge any stale/ghost session. A 401 here just means no active
  // session exists — that's fine, we swallow it.
  try {
    await account.deleteSession("current");
  } catch {
    // No active session — nothing to clean up, proceed normally.
  }

  // Step 2: Create the new session. If Appwrite still reports an existing
  // session (type: user_session_already_exists, code 409 — the SDK may have
  // cached its state), nuke ALL sessions and retry once.
  try {
    await account.createEmailPasswordSession(cleanEmail, password);
  } catch (err) {
    if (err?.type === "user_session_already_exists") {
      try {
        await account.deleteSessions();
      } catch {
        // Ignore — best-effort cleanup.
      }
      // Retry after hard-clearing all sessions.
      await account.createEmailPasswordSession(cleanEmail, password);
    } else {
      throw err;
    }
  }

  return account.get();
}

/**
 * Destroy current session.
 */
export async function logout() {
  await account.deleteSession("current");
}

/**
 * Return current Auth user or null if no active session.
 * Never throws — safe to call on page load.
 */
export async function getCurrentUser() {
  try {
    return await account.get();
  } catch {
    return null;
  }
}

/**
 * Send (or resend) email verification link to the current user.
 * User must be logged in.
 */
export async function sendEmailVerification() {
  const appUrl = APPWRITE_APP_URL;
  return account.createVerification(`${appUrl}/auth/verify-email`);
}

/**
 * Confirm email verification using the userId + secret from the link.
 * Called from VerifyEmailPage after reading URL query params.
 */
export async function confirmEmailVerification(userId, secret) {
  return account.updateVerification(userId, secret);
}

/**
 * Change the current user's password.
 * Requires the old (current) password for verification.
 */
export async function updatePassword(newPassword, currentPassword) {
  return account.updatePassword(newPassword, currentPassword);
}

/**
 * Send password recovery email.
 * Appwrite emails a link: REDIRECT_URL?userId=xxx&secret=yyy
 */
export async function sendPasswordRecovery(email) {
  const appUrl = APPWRITE_APP_URL;
  return account.createRecovery(
    email.trim().toLowerCase(),
    `${appUrl}/auth/reset-password`,
  );
}

/**
 * Confirm password recovery and set new password.
 * Called from ResetPasswordPage after reading userId + secret from URL params.
 */
export async function confirmPasswordRecovery(userId, secret, password) {
  return account.updateRecovery(userId, secret, password);
}
