/**
 * SmartLayout — renders CustomerLayout for authenticated users,
 * PublicLayout for guests. Used on content routes (/classes, /packages, /wellness)
 * so logged-in clients get the sidebar experience without a URL change.
 */
import { useAuth } from '@/hooks/useAuth.jsx'
import CustomerLayout from './CustomerLayout'
import PublicLayout from './PublicLayout'

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="w-8 h-8 rounded-full border-2 border-sage border-t-transparent animate-spin" />
    </div>
  )
}

export default function SmartLayout() {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader />
  return user ? <CustomerLayout /> : <PublicLayout />
}
