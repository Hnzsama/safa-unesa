import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { History } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getAuditTrailLogsList } from "@/lib/actions/dashboard";
import { AuditLogsTable } from "@/components/dashboard/audit-logs-table";

export const instant = false;

export default async function AuditLogsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard/logs");
  }

  const logs = await getAuditTrailLogsList(100);

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
        <SiteHeader title="Log Riwayat &amp; Audit Trail Perubahan Status" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
              
              {/* Header Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-xs space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <History className="size-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Audit Trail Transparansi Sarpras</h2>
                    <p className="text-xs text-muted-foreground">
                      Rekam jejak seluruh mutasi status laporan, approval, penolakan, dan catatan teknisi lapangan.
                    </p>
                  </div>
                </div>
              </div>

              {/* TanStack Table Audit Logs */}
              <AuditLogsTable initialLogs={logs} />

            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
