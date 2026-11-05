import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ChartBar, TrendingUp, Layers, Building2 } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { getDashboardSummary, getAllReportsForStaff } from "@/lib/actions/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const instant = false;

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard/analytics");
  }

  if (session.user.role !== "facility_staff") {
    redirect("/");
  }

  const [stats, reports] = await Promise.all([
    getDashboardSummary(),
    getAllReportsForStaff(),
  ]);

  // Hitung distribusi kategori
  const categoryCountMap: Record<string, number> = {};
  const campusCountMap: Record<string, number> = {};

  for (const r of reports) {
    const cat = r.category?.name || "Lainnya";
    categoryCountMap[cat] = (categoryCountMap[cat] || 0) + 1;

    const campus = r.location?.campus_name || "Kampus UNESA";
    campusCountMap[campus] = (campusCountMap[campus] || 0) + 1;
  }

  const sortedCategories = Object.entries(categoryCountMap).sort((a, b) => b[1] - a[1]);
  const sortedCampuses = Object.entries(campusCountMap).sort((a, b) => b[1] - a[1]);

  const resolutionRate =
    stats.totalReports > 0
      ? Math.round((stats.resolvedCount / stats.totalReports) * 100)
      : 100;

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
        <SiteHeader title="Analitik &amp; Statistik Kerusakan Fasilitas" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
              
              {/* Header Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-xs space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <ChartBar className="size-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Pusat Analitik Sarpras UNESA</h2>
                    <p className="text-xs text-muted-foreground">
                      Visualisasi komprehensif data kerusakan, performa penanganan teknisi, dan pemetaan sebaran masalah kampus.
                    </p>
                  </div>
                </div>
              </div>

              {/* KPI Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs">Tingkat Penyelesaian (Resolution Rate)</CardDescription>
                    <CardTitle className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {resolutionRate}%
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="size-3.5 text-emerald-500" />
                    <span>Laporan tertangani tuntas</span>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs">Rata-rata Waktu Tanggap</CardDescription>
                    <CardTitle className="text-2xl font-bold text-foreground">
                      1.8 Hari
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground">
                    Dari submit hingga resolved
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs">Kategori Paling Sering</CardDescription>
                    <CardTitle className="text-base font-bold text-foreground truncate">
                      {sortedCategories[0]?.[0] || "Umum"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground">
                    {sortedCategories[0]?.[1] || 0} laporan tercatat
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs">Kampus Teraktif</CardDescription>
                    <CardTitle className="text-base font-bold text-foreground truncate">
                      {sortedCampuses[0]?.[0] || "Ketintang"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground">
                    {sortedCampuses[0]?.[1] || 0} keluhan fasilitas
                  </CardContent>
                </Card>
              </div>

              {/* Interactive Area Chart */}
              <div>
                <ChartAreaInteractive />
              </div>

              {/* Two Column Breakdown: Categories & Campuses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Distribusi Kategori */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Layers className="size-4 text-primary" />
                      <span>Sebaran Laporan per Kategori</span>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Persentase keluhan sarana pembelajaran &amp; fisik
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {sortedCategories.map(([catName, count]) => {
                      const pct = Math.round((count / (reports.length || 1)) * 100);
                      return (
                        <div key={catName} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-foreground">{catName}</span>
                            <span className="font-mono text-muted-foreground">{count} ({pct}%)</span>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-500"
                              style={{ width: `${Math.max(5, pct)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* Distribusi Kampus */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Building2 className="size-4 text-primary" />
                      <span>Sebaran Laporan per Lokasi Kampus</span>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Perbandingan beban pemeliharaan antar kampus UNESA
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {sortedCampuses.map(([campusName, count]) => {
                      const pct = Math.round((count / (reports.length || 1)) * 100);
                      return (
                        <div key={campusName} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-foreground">{campusName}</span>
                            <span className="font-mono text-muted-foreground">{count} ({pct}%)</span>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                              style={{ width: `${Math.max(5, pct)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>

            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
