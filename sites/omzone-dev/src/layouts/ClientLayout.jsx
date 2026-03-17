/**
 * ClientLayout — replaces the admin-style CustomerLayout for authenticated clients.
 *
 * Structure:
 *   - ClientNavbar (top: logo, search, user dropdown with zone links, hamburger for filter sidebar)
 *   - Main content with footer
 *   - ClientBottomNav (mobile: Home, Classes, Packages, Wellness)
 *   - Filter sidebar sheet (opened via hamburger on mobile, used by classes page)
 */
import { useState } from "react";
import { Outlet } from "react-router-dom";
import ClientNavbar from "@/components/shared/ClientNavbar";
import ClientBottomNav from "@/components/shared/ClientBottomNav";
import Footer from "@/components/shared/Footer";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

function ClientLayoutInner() {
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const sidebar = useSidebar();
  const filterPanel = sidebar?.filterPanel;

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <ClientNavbar onMenuClick={() => setFilterSheetOpen(true)} />
      <main className="flex-1 pt-0 pb-16 md:pb-0">
        <Outlet />
      </main>
      <div className="hidden md:block">
        <Footer />
      </div>
      <ClientBottomNav />

      {/* Filter sidebar sheet — mobile only */}
      <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
        <SheetContent side="left" className="w-72 p-0 flex flex-col">
          <SheetHeader className="h-14 flex-row items-center px-5 border-b border-warm-gray-dark/60 shrink-0 space-y-0">
            <SheetTitle className="text-sm font-semibold text-charcoal">
              Filtros
            </SheetTitle>
            <SheetDescription className="sr-only">
              Panel de filtros para navegar el contenido.
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {filterPanel || (
              <p className="text-sm text-charcoal-muted text-center py-8">
                No hay filtros disponibles en esta página.
              </p>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default function ClientLayout() {
  return (
    <SidebarProvider>
      <ClientLayoutInner />
    </SidebarProvider>
  );
}
