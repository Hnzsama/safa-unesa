import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { CheckCircle2, Award, Clock, Camera } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SafaReportsTable } from "@/components/reports/safa-reports-table";
import { getAllReportsForStaff } from "@/lib/actions/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const instant = false;

export default async function ResolvedReportsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard/resolved");
  }

  if (session.user.role !== "facility_staff") {
    redirect("/");
  }

  // Ambil hanya laporan yang sudah selesai
  const resolvedReports = await getAllReportsForStaff("resolved");

  const reportsWithProof = resolvedReports.filter((r) =>
    r.report_images?.some(
      (img) => img.storage_path.includes("resolution_") || img.mime_type?.includes("resolution")
    )
  ).length;

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
        <SiteHeader title="Arsip Laporan Selesai &amp; Bukti Perbaikan" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              
              {/* Header Hero Section */}
              <div className="px-4 lg:px-6">
                <div className="p-5 sm:p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="size-3" />
                      <span>Fasilitas Tuntas Diperbaiki</span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-foreground">
                      Rekapitulasi Layanan Selesai ({resolvedReports.length} Laporan Tuntas)
                    </h2>
                    <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
                      Seluruh fasilitas yang telah diperbaiki oleh tim teknisi sarpras UNESA. Dilengkapi transparansi dokumentasi <strong>foto bukti fisik sebelum dan sesudah perbaikan</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Resolved Mini Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-4 lg:px-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs">Total Fasilitas Tuntas</CardDescription>
                    <CardTitle className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                      <span>{resolvedReports.length}</span>
                      <Award className="size-5 text-emerald-500/50" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground">
                    Fasilitas berfungsi normal kembali
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs">Foto Bukti Perbaikan</CardDescription>
                    <CardTitle className="text-2xl font-bold text-foreground flex items-center justify-between">
                      <span>{reportsWithProof} / {resolvedReports.length}</span>
                      <Camera className="size-5 text-primary/50" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground">
                    Dokumentasi fisik teknisi terunggah
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs">Rata-rata Durasi Perbaikan</CardDescription>
                    <CardTitle className="text-2xl font-bold text-foreground flex items-center justify-between">
                      <span>&le; 2 Hari</span>
                      <Clock className="size-5 text-muted-foreground/50" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground">
                    Sesuai target standar mutu pelayanan UNESA
                  </CardContent>
                </Card>
              </div>

              {/* Resolved Reports Table */}
              <SafaReportsTable
                initialReports={resolvedReports}
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

