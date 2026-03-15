/**
 * Route guards para control de acceso.
 * roles válidos: 'client' | 'admin' | 'root'
 * En producción: sesión real de Appwrite Auth via useAuth.
 */
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth.jsx'

/**
 * RequireAuth — protege rutas que requieren autenticación y/o rol específico.
 * @param {string[]} roles - roles permitidos: ['client', 'admin', 'root']
 */
export function RequireAuth({ roles = [] }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="w-6 h-6 rounded-full border-2 border-sage border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles.length > 0 && !roles.includes(user.role_key)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
