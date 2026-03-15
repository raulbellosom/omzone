/**
 * useAuth — contexto de autenticación dual-mode.
 *
 * VITE_USE_MOCKS=true  → usa userService.mock (desarrollo sin Appwrite)
 * VITE_USE_MOCKS=false → usa Appwrite Auth SDK + profileService (producción)
 *
 * El contexto expone:
 *   user        — objeto de usuario normalizado (snake_case, ver normalizeProfile)
 *   setUser     — setter directo (para compatibilidad con código existente)
 *   loading     — true mientras se resuelve la sesión inicial
 *   login       — iniciar sesión (maneja ambos modos)
 *   register    — registrar nuevo usuario (maneja ambos modos)
 *   logout      — cerrar sesión
 *   refreshUser — re-fetch del usuario + perfil desde Appwrite
 */
import { useState, useEffect, createContext, useContext } from 'react'
import * as mockService from '@/services/mocks/userService.mock'
import * as realAuth    from '@/services/appwrite/authService'
import * as profileSvc  from '@/services/appwrite/profileService'

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  // ── Initialize session on mount ───────────────────────────────────────────
  useEffect(() => {
    _resolveSession()
  }, [])

  async function _resolveSession() {
    try {
      if (USE_MOCKS) {
        const u = await mockService.getCurrentUser()
        setUser(u)
      } else {
        const authUser = await realAuth.getCurrentUser()
        if (!authUser) { setUser(null); return }
        const profile = await profileSvc.getMyUserProfile(authUser.$id)
        setUser(profileSvc.normalizeProfile(authUser, profile))
      }
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  // ── Auth actions ─────────────────────────────────────────────────────────

  /**
   * Log in and populate auth context.
   * In mock mode: only email is required (password ignored).
   * In real mode: validates credentials against Appwrite Auth.
   */
  async function login(email, password) {
    if (USE_MOCKS) {
      const u = await mockService.loginMock(email)
      setUser(u)
      return u
    }

    const authUser = await realAuth.loginWithEmailPassword(email, password)
    const profile  = await profileSvc.getMyUserProfile(authUser.$id)
    const normalized = profileSvc.normalizeProfile(authUser, profile)
    setUser(normalized)
    return normalized
  }

  /**
   * Register a new user.
   * In mock mode: simulates success with no side effects.
   * In real mode: creates Appwrite account, session, and verification email.
   * Returns the Appwrite Auth user (real) or { success: true } (mock).
   */
  async function register({ firstName, lastName, email, password }) {
    if (USE_MOCKS) {
      await new Promise((r) => setTimeout(r, 800))
      return { success: true }
    }

    const authUser = await realAuth.registerWithEmailPassword({
      firstName, lastName, email, password,
    })
    // Profile document is created by the create-user-profile Function via event.
    // Set a minimal context so the user isn't null while the function runs.
    setUser(profileSvc.normalizeProfile(authUser, null))
    return authUser
  }

  /**
   * Destroy session and clear context.
   */
  async function logout() {
    if (USE_MOCKS) {
      await mockService.logoutMock()
    } else {
      await realAuth.logout()
    }
    setUser(null)
  }

  /**
   * Re-fetch auth + profile from Appwrite and update context.
   * Useful after email verification, profile update, etc.
   */
  async function refreshUser() {
    try {
      if (USE_MOCKS) {
        const u = await mockService.getCurrentUser()
        setUser(u)
        return u
      }
      const authUser = await realAuth.getCurrentUser()
      if (!authUser) { setUser(null); return null }
      const profile  = await profileSvc.getMyUserProfile(authUser.$id)
      const normalized = profileSvc.normalizeProfile(authUser, profile)
      setUser(normalized)
      return normalized
    } catch {
      setUser(null)
      return null
    }
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
