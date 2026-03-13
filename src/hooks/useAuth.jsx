/**
 * useAuth — hook de autenticación.
 * Por ahora usa el userService mock.
 * En producción: conectar con Appwrite Auth SDK.
 */
import { useState, useEffect, createContext, useContext } from 'react'
import { getCurrentUser } from '@/services/mocks/userService.mock'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
