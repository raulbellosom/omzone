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
  // Purge any stale/ghost session first. If there's no active session this
  // will throw a 401 which we intentionally swallow.
  try {
    await account.deleteSession("current");
  } catch {
    // No active session — nothing to clean up, proceed normally.
  }

  await account.createEmailPasswordSession(
    email.trim().toLowerCase(),
    password,
  );
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
