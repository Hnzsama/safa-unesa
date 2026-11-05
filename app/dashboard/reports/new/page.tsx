import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { PlusCircle } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getMasterData } from "@/lib/actions/reports";
import { PublicReportForm } from "@/components/reports/public-report-form";

export const instant = false;

export default async function NewReportPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard/reports/new");
  }

  const { locations, categories } = await getMasterData();
  const isLecturer = session.user.role === "lecturer";

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
        <SiteHeader
          title={
            isLecturer
              ? "Form Pengaduan Sarana Dosen · SAFA UNESA"
              : "Form Pengaduan Fasilitas Baru · SAFA UNESA"
          }
        />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6 max-w-4xl">
              
              {/* Header Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-xs space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <PlusCircle className="size-5" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-foreground">
                      {isLecturer
                        ? "Pengaduan Sarana Ruang Kuliah & Laboratorium"
                        : "Buat Laporan Fasilitas Baru"}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Sampaikan kendala fasilitas kampus dengan detail agar segera divalidasi dan ditindaklanjuti tim sarpras.
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Container */}
              <div className="p-5 sm:p-7 rounded-3xl border border-border bg-card shadow-xs">
                <PublicReportForm
                  locations={locations}
                  categories={categories}
                  defaultUser={{
                    name: session.user.name || "",
                    identityNumber: session.user.identity_number || "",
                    phone: session.user.phone_number || "",
                    role: session.user.role,
                  }}
                />
              </div>

            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
