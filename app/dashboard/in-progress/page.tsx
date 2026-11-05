import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Wrench, Clock, ShieldCheck } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SafaReportsTable } from "@/components/reports/safa-reports-table";
import { getAllReportsForStaff } from "@/lib/actions/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const instant = false;

export default async function InProgressReportsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard/in-progress");
  }

  if (session.user.role !== "facility_staff") {
    redirect("/");
  }

  // Ambil laporan yang terverifikasi dan sedang dikerjakan teknisi
  const allReports = await getAllReportsForStaff();
  const activeReports = allReports.filter(
    (r) => r.current_status === "verified" || r.current_status === "in_progress"
  );

  const verifiedCount = activeReports.filter((r) => r.current_status === "verified").length;
  const inProgressCount = activeReports.filter((r) => r.current_status === "in_progress").length;

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
        <SiteHeader title="Pekerjaan Teknisi · Sedang Ditangani" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              
              {/* Header Hero Section */}
              <div className="px-4 lg:px-6">
                <div className="p-5 sm:p-6 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary/20 text-primary border border-primary/30">
                      <Wrench className="size-3" />
                      <span>Manajemen Pekerjaan Lapangan</span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-foreground">
                      Fasilitas Dalam Tahap Penanganan ({activeReports.length} Pekerjaan Aktif)
                    </h2>
                    <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
                      Pantau progres teknisi sarpras yang sedang bertugas di lapangan. Setelah perbaikan selesai, petugas dapat mengunggah <strong>foto bukti fisik perbaikan</strong> dan menandai laporan sebagai tuntas.
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Breakdown Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-4 lg:px-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs">Terverifikasi (Siap Ditangani)</CardDescription>
                    <CardTitle className="text-2xl font-bold text-sky-500 flex items-center justify-between">
                      <span>{verifiedCount}</span>
                      <ShieldCheck className="size-5 text-sky-500/50" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground">
                    Menunggu jadwal keberangkatan teknisi
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs">Sedang Dikerjakan di Lokasi</CardDescription>
                    <CardTitle className="text-2xl font-bold text-primary flex items-center justify-between">
                      <span>{inProgressCount}</span>
                      <Wrench className="size-5 text-primary/50" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground">
                    Teknisi aktif melakukan perbaikan fisik
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs">Total Pekerjaan Aktif</CardDescription>
                    <CardTitle className="text-2xl font-bold text-foreground flex items-center justify-between">
                      <span>{activeReports.length}</span>
                      <Clock className="size-5 text-muted-foreground/50" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground">
                    Akumulasi Kampus Ketintang &amp; Lidah Wetan
                  </CardContent>
                </Card>
              </div>

              {/* Active Reports Table */}
              <SafaReportsTable
                initialReports={activeReports}
                currentUserId={session.user.id}
                isStaff={true}
              />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
