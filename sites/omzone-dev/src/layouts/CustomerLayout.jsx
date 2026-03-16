import { Outlet } from 'react-router-dom'
import Navbar from '@/components/shared/Navbar'
import BottomNav from '@/components/shared/BottomNav'
import CustomerSideNav from '@/components/shared/CustomerSideNav'
import { SidebarProvider } from '@/contexts/SidebarContext'

export default function CustomerLayout() {
  return (
    <div className="h-dvh flex flex-col bg-cream overflow-hidden">
      <Navbar />
      <SidebarProvider>
        <div className="flex flex-1 overflow-hidden">
          <CustomerSideNav className="border-r border-warm-gray-dark/30 bg-white overflow-y-auto" />
          <main className="flex-1 min-w-0 overflow-y-auto pb-20 md:pb-0">
            <Outlet />
          </main>
        </div>
      </SidebarProvider>
      <BottomNav />
    </div>
  )
}
