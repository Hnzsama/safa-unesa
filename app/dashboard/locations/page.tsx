import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Building2 } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getMasterLocationsList } from "@/lib/actions/dashboard";
import { LocationsManager } from "@/components/dashboard/locations-manager";
import { TableContentSkeleton } from "@/components/dashboard/table-skeleton";

export const instant = false;

async function LocationsTableData() {
  const locations = await getMasterLocationsList();
  return <LocationsManager initialLocations={locations} />;
}

export default async function LocationsMasterPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard/locations");
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Master Data · Lokasi & Gedung Kampus UNESA" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
              
              {/* Header Card Tetap Diam & Langsung Ter-render */}
              <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-xs space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <Building2 className="size-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Direktori Lokasi &amp; Fasilitas UNESA</h2>
                    <p className="text-xs text-muted-foreground">
                      Kelola kampus, gedung, fakultas, lantai, dan ruangan operasional sarana prasarana secara terpusat.
                    </p>
                  </div>
                </div>
              </div>

              {/* Skeleton Khusus Konten Tabel Saja (Sidebar & Navbar Tetap Utuh) */}
              <Suspense fallback={<TableContentSkeleton rowCount={8} />}>
                <LocationsTableData />
              </Suspense>

            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
