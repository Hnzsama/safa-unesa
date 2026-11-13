import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Layers } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getMasterCategoriesList } from "@/lib/actions/dashboard";
import { CategoriesManager } from "@/components/dashboard/categories-manager";

export const instant = false;

export default async function CategoriesMasterPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard/categories");
  }

  const categories = await getMasterCategoriesList();

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
        <SiteHeader title="Master Data · Kategori Fasilitas Sarpras UNESA" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
              
              {/* Header Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-xs space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <Layers className="size-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Kategori Kerusakan &amp; Sarana</h2>
                    <p className="text-xs text-muted-foreground">
                      Klasifikasi jenis fasilitas untuk penugasan divisi teknisi yang tepat (Elektrikal, Sipil, Jaringan, Plumbing).
                    </p>
                  </div>
                </div>
              </div>

              {/* Interactive Categories CRUD Manager */}
              <CategoriesManager initialCategories={categories} />

            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
