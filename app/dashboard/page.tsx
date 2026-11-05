import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SafaReportsTable } from "@/components/reports/safa-reports-table";
import {
  getDashboardSummary,
  getAllReportsForStaff,
} from "@/lib/actions/dashboard";

export const instant = false;

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  // Dashboard ini dikhususkan 100% untuk Petugas / Staf Sarpras UNESA
  if (session.user.role !== "facility_staff") {
    redirect("/");
  }

  const [stats, reports] = await Promise.all([
    getDashboardSummary(),
    getAllReportsForStaff(),
  ]);

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
        <SiteHeader title="Dashboard Operasional Sarpras UNESA" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              
              {/* Metric Statistics Cards */}
              <SectionCards stats={stats} />

              {/* Area Chart Analytics */}
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>

              {/* Real Reports Data Table with Drawer & Staff Actions */}
              <SafaReportsTable
                initialReports={reports}
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
