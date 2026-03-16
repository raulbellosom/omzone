/**
 * useAuth — contexto de autenticación.
 * Usa Appwrite Auth SDK + profileService.
 *
 * El contexto expone:
 *   user        — objeto de usuario normalizado (snake_case, ver normalizeProfile)
 *   setUser     — setter directo (para compatibilidad con código existente)
 *   loading     — true mientras se resuelve la sesión inicial
 *   login       — iniciar sesión
 *   register    — registrar nuevo usuario
 *   logout      — cerrar sesión
 *   refreshUser — re-fetch del usuario + perfil desde Appwrite
 */
import { useState, useEffect, createContext, useContext } from "react";
import { useTranslation } from "react-i18next";
import * as realAuth from "@/services/appwrite/authService";
import * as profileSvc from "@/services/appwrite/profileService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { i18n } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Initialize session on mount ───────────────────────────────────────────
  useEffect(() => {
    _resolveSession();
  }, []);

  async function _resolveSession() {
    try {
      const authUser = await realAuth.getCurrentUser();
      // No session or email not yet verified → treat as logged-out.
      // The Appwrite session cookie stays alive so createVerification /
      // updateVerification still work from the browser.
      if (!authUser || !authUser.emailVerification) {
        setUser(null);
        return;
      }
      const profile = await profileSvc.getMyUserProfile(authUser.$id);
      setUser(profileSvc.normalizeProfile(authUser, profile));
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  // ── Auth actions ─────────────────────────────────────────────────────────

  async function login(email, password) {
    const authUser = await realAuth.loginWithEmailPassword(email, password);
    if (!authUser.emailVerification) {
      // Leave the Appwrite session alive so the resend button in LoginPage works,
      // but do NOT put the user in context — they are not truly "logged in".
      const err = new Error("email_not_verified");
      err.code = "email_not_verified";
      throw err;
    }
    const profile = await profileSvc.getMyUserProfile(authUser.$id);
    const normalized = profileSvc.normalizeProfile(authUser, profile);
    setUser(normalized);
    return normalized;
  }

  /**
   * Register a new user.
   * Creates Appwrite account, session, and sends verification email.
   * Returns the Appwrite Auth user.
   */
  async function register({ firstName, lastName, email, password }) {
    await realAuth.registerWithEmailPassword({
      firstName,
      lastName,
      email,
      password,
      locale: i18n.language ?? "es",
    });
    // Session exists in Appwrite (needed for createVerification / resend)
    // but we intentionally do NOT set user in context — the navbar should
    // show the logged-out state until email is verified.
  }

  /**
   * Destroy session and clear context.
   */
  async function logout() {
    await realAuth.logout();
    setUser(null);
  }

  /**
   * Re-fetch auth + profile from Appwrite and update context.
   * Useful after email verification, profile update, etc.
   */
  async function refreshUser() {
    try {
      const authUser = await realAuth.getCurrentUser();
      if (!authUser) {
        setUser(null);
        return null;
      }
      const profile = await profileSvc.getMyUserProfile(authUser.$id);
      const normalized = profileSvc.normalizeProfile(authUser, profile);
      setUser(normalized);
      return normalized;
    } catch {
      setUser(null);
      return null;
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
