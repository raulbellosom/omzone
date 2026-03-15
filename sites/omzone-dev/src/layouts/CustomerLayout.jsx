import { Outlet } from 'react-router-dom'
import Navbar from '@/components/shared/Navbar'
import BottomNav from '@/components/shared/BottomNav'
import CustomerSideNav from '@/components/shared/CustomerSideNav'

export default function CustomerLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />
      <div className="flex flex-1">
        <CustomerSideNav className="border-r border-warm-gray-dark/30 bg-white" />
        <main className="flex-1 min-w-0 pb-20 md:pb-0">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
