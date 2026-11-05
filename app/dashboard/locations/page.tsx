import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Building2, MapPin, CheckCircle2 } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getMasterLocationsList } from "@/lib/actions/dashboard";
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

export default async function LocationsMasterPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard/locations");
  }

  const locations = await getMasterLocationsList();

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
              
              {/* Header Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-xs space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <Building2 className="size-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Direktori Lokasi &amp; Fasilitas UNESA</h2>
                    <p className="text-xs text-muted-foreground">
                      Daftar gedung fakultas, lantai, dan ruangan operasional di Kampus Ketintang dan Lidah Wetan.
                    </p>
                  </div>
                </div>
              </div>

              {/* Table of Locations */}
              <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead className="w-[180px] text-xs font-bold text-muted-foreground">KAMPUS</TableHead>
                      <TableHead className="text-xs font-bold text-muted-foreground">GEDUNG / FAKULTAS</TableHead>
                      <TableHead className="text-xs font-bold text-muted-foreground">LANTAI</TableHead>
                      <TableHead className="text-xs font-bold text-muted-foreground">RUANG / AREA SPESIFIK</TableHead>
                      <TableHead className="w-[120px] text-right text-xs font-bold text-muted-foreground">STATUS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {locations.map((loc) => (
                      <TableRow key={loc.id} className="hover:bg-muted/30">
                        <TableCell className="text-xs font-semibold">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted text-foreground">
                            <MapPin className="size-3 text-primary" />
                            {loc.campus_name}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs font-bold text-foreground">
                          {loc.building_name}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {loc.floor || "-"}
                        </TableCell>
                        <TableCell className="text-xs text-foreground font-medium">
                          {loc.room_or_area}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] gap-1">
                            <CheckCircle2 className="size-3" />
                            <span>Aktif</span>
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="p-3 border-t border-border bg-muted/20 text-xs text-muted-foreground flex justify-between">
                  <span>Total <strong>{locations.length}</strong> titik lokasi terdaftar</span>
                  <span>UNESA Sarpras Database</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
