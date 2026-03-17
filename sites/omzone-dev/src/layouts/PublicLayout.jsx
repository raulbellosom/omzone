import { Outlet, useLocation } from 'react-router-dom'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'

export default function PublicLayout() {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />
      <main className={isHome ? 'flex-1' : 'flex-1 pt-16'}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
