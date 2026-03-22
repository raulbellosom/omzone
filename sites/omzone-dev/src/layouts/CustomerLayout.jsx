import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import CustomerSideNav from "@/components/shared/CustomerSideNav";
import CustomerTopbar from "@/components/shared/CustomerTopbar";
import { SidebarProvider } from "@/contexts/SidebarContext";

export default function CustomerLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <SidebarProvider>
      <div className="h-dvh flex overflow-hidden bg-cream">
        <CustomerSideNav
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <CustomerTopbar onMenuClick={() => setMobileSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
