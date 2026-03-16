import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "@/components/shared/AdminSidebar";
import AdminTopbar from "@/components/shared/AdminTopbar";

export default function AdminLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-warm-gray">
      <AdminSidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar onMenuClick={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
