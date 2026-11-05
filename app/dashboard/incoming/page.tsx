import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Inbox, Clock, ShieldCheck } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SafaReportsTable } from "@/components/reports/safa-reports-table";
import { getAllReportsForStaff } from "@/lib/actions/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const instant = false;

export default async function IncomingReportsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard/incoming");
  }

  if (session.user.role !== "facility_staff") {
    redirect("/");
  }

  // Ambil hanya laporan berstatus 'submitted'
  const submittedReports = await getAllReportsForStaff("submitted");

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
        <SiteHeader title="Antrean Laporan Masuk &amp; Verifikasi Staf" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              
              {/* Header Hero Section */}
              <div className="px-4 lg:px-6">
                <div className="p-5 sm:p-6 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                      <Clock className="size-3 animate-pulse" />
                      <span>Prioritas Verifikasi Awal</span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-foreground">
                      Antrean Laporan Fasilitas Baru ({submittedReports.length} Menunggu)
                    </h2>
                    <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
                      Laporan yang baru diajukan oleh mahasiswa dan dosen membutuhkan verifikasi kelayakan fisik. Segera <strong>Setujui (Approve)</strong> untuk menugaskan teknisi, atau <strong>Tolak (Reject)</strong> dengan alasan jelas jika di luar kewenangan.
                    </p>
                  </div>
                </div>
              </div>

              {/* Triage Mini Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-4 lg:px-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs">Antrean Menunggu Tinjauan</CardDescription>
                    <CardTitle className="text-2xl font-bold text-amber-500 flex items-center justify-between">
                      <span>{submittedReports.length}</span>
                      <Inbox className="size-5 text-amber-500/50" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground">
                    Perlu diverifikasi dalam &le; 24 jam kerja
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs">Target SLA Verifikasi</CardDescription>
                    <CardTitle className="text-2xl font-bold text-foreground flex items-center justify-between">
                      <span>&lt; 4 Jam</span>
                      <Clock className="size-5 text-primary/50" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground">
                    Standar Operasional Prosedur Sarpras UNESA
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs">Hak Otoritas</CardDescription>
                    <CardTitle className="text-2xl font-bold text-foreground flex items-center justify-between">
                      <span>Staf Sarpras</span>
                      <ShieldCheck className="size-5 text-emerald-500/60" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground">
                    Dapat menyetujui atau menolak laporan
                  </CardContent>
                </Card>
              </div>

              {/* Data Table Focused on Submitted Reports */}
              <SafaReportsTable
                initialReports={submittedReports}
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
