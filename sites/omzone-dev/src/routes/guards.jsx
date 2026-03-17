/**
 * Route guards para control de acceso.
 * roles válidos: 'client' | 'admin' | 'root'
 * En producción: sesión real de Appwrite Auth via useAuth.
 *
 * Invariante: useAuth nunca pone un usuario no verificado en contexto,
 * así que aquí solo comprobamos !user y el rol.
 */
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth.jsx";
import ROUTES from "@/constants/routes";

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="w-6 h-6 rounded-full border-2 border-sage border-t-transparent animate-spin" />
    </div>
  );
}

/**
 * RequireAuth — protege rutas que requieren autenticación y/o rol específico.
 */
export function RequireAuth({ roles = [], fallback = "/" }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner />;

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role_key)) {
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}

/**
 * RedirectIfAuthenticated — redirige usuarios verificados fuera de páginas
 * públicas (landing, login, register) hacia su panel.
 */
export function RedirectIfAuthenticated({ to = "/zone" }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (user) return <Navigate to={to} replace />;
  return <Outlet />;
}
