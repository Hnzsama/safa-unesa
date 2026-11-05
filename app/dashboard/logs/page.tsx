import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { History } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getAuditTrailLogsList } from "@/lib/actions/dashboard";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const instant = false;

export default async function AuditLogsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard/logs");
  }

  const logs = await getAuditTrailLogsList(50);

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return <Badge variant="outline" className="text-[10px]">Submitted</Badge>;
      case "verified":
        return <Badge className="bg-sky-500/10 text-sky-500 border border-sky-500/20 text-[10px]">Verified</Badge>;
      case "in_progress":
        return <Badge className="bg-primary/10 text-primary border border-primary/20 text-[10px]">In Progress</Badge>;
      case "resolved":
        return <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px]">Resolved</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="text-[10px]">Rejected</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">{status}</Badge>;
    }
  };

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

              {/* Table of Audit Logs */}
              <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead className="w-[180px] text-xs font-bold text-muted-foreground">WAKTU (WIB)</TableHead>
                      <TableHead className="min-w-[200px] text-xs font-bold text-muted-foreground">LAPORAN TERKAIT</TableHead>
                      <TableHead className="w-[180px] text-xs font-bold text-muted-foreground">TRANSISI STATUS</TableHead>
                      <TableHead className="text-xs font-bold text-muted-foreground">CATATAN OPERASIONAL</TableHead>
                      <TableHead className="w-[160px] text-right text-xs font-bold text-muted-foreground">PETUGAS / AKTOR</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((l) => (
                      <TableRow key={l.id} className="hover:bg-muted/30">
                        <TableCell className="text-xs font-mono text-muted-foreground">
                          {new Date(l.created_at).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-foreground">
                          {l.report ? (
                            <span className="line-clamp-1">{l.report.title}</span>
                          ) : (
                            <span className="text-muted-foreground italic">Laporan #{l.id.slice(0, 8)}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="flex items-center gap-1.5">
                            {l.previous_status ? renderStatusBadge(l.previous_status) : <span className="text-muted-foreground text-[10px]">Awal</span>}
                            <span className="text-muted-foreground text-[10px]">&rarr;</span>
                            {renderStatusBadge(l.new_status)}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground leading-relaxed">
                          {l.notes || "-"}
                        </TableCell>
                        <TableCell className="text-right text-xs">
                          <div className="space-y-0.5">
                            <span className="font-semibold text-foreground block truncate">
                              {l.changed_by_user?.name || "Sistem"}
                            </span>
                            <span className="text-[10px] text-muted-foreground uppercase block font-mono">
                              {l.changed_by_user?.role || "-"}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="p-3 border-t border-border bg-muted/20 text-xs text-muted-foreground flex justify-between">
                  <span>Menampilkan <strong>{logs.length}</strong> aktivitas mutasi status terbaru</span>
                  <span>Immutable Audit Log</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
