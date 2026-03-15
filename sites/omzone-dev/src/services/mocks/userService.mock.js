/**
 * userService.mock.js
 * Adapter para usuarios, autenticación mock y perfiles.
 * En producción: reemplazar con Appwrite Auth + profileService.
 *
 * NOTA DE ROLES: el rol canónico en Appwrite es 'client' (no 'customer').
 * Este mock refleja el mismo valor.
 */
import { delay } from './_delay'

const users = [
  {
    $id: 'user_client_1',
    user_id: 'user_client_1',
    role_key: 'client',
    first_name: 'Valeria',
    last_name: 'Morales',
    full_name: 'Valeria Morales',
    email: 'valeria@example.com',
    email_verified: true,
    phone: '+52 55 1234 5678',
    avatar_id: null,
    status: 'active',
    onboarding_completed: true,
    locale: 'es',
    provider: 'email',
    enabled: true,
  },
  {
    $id: 'user_admin_1',
    user_id: 'user_admin_1',
    role_key: 'admin',
    first_name: 'Admin',
    last_name: 'Omzone',
    full_name: 'Admin Omzone',
    email: 'admin@omzone.com',
    email_verified: true,
    phone: '+52 55 9876 5432',
    avatar_id: null,
    status: 'active',
    onboarding_completed: true,
    locale: 'es',
    provider: 'email',
    enabled: true,
  },
]

// ── Estado de sesión simulado ─────────────────────────────────────────────────
let _currentUser = null

export async function getCurrentUser() {
  await delay(100)
  return _currentUser
}

export async function loginMock(email) {
  await delay()
  const user = users.find((u) => u.email === email)
  if (!user) throw new Error('Usuario no encontrado')
  _currentUser = user
  return user
}

export async function logoutMock() {
  await delay(100)
  _currentUser = null
}

export async function getUserProfile(userId) {
  await delay()
  const user = users.find((u) => u.user_id === userId)
  if (!user) throw new Error('User not found')
  return user
}

export async function updateProfileMock(userId, data) {
  await delay(800)
  const user = users.find((u) => u.$id === userId)
  if (!user) throw new Error('User not found')
  const allowed = ['first_name', 'last_name', 'phone']
  allowed.forEach((k) => {
    if (data[k] !== undefined) user[k] = data[k]
  })
  if (data.first_name !== undefined || data.last_name !== undefined) {
    user.full_name = [user.first_name, user.last_name].filter(Boolean).join(' ')
  }
  return { ...user }
}

export function isAdmin(user) {
  return user?.role_key === 'admin' || user?.role_key === 'root'
}

export function isClient(user) {
  return user?.role_key === 'client'
}

/** @deprecated Use isClient instead */
export function isCustomer(user) {
  return isClient(user)
}
