import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Layers, CheckCircle2, Tag } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getMasterCategoriesList } from "@/lib/actions/dashboard";
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

              {/* Table of Categories */}
              <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead className="w-[240px] text-xs font-bold text-muted-foreground">NAMA KATEGORI</TableHead>
                      <TableHead className="text-xs font-bold text-muted-foreground">DESKRIPSI &amp; CAKUPAN KERUSAKAN</TableHead>
                      <TableHead className="w-[120px] text-right text-xs font-bold text-muted-foreground">STATUS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((cat) => (
                      <TableRow key={cat.id} className="hover:bg-muted/30">
                        <TableCell className="text-xs font-bold text-foreground">
                          <div className="flex items-center gap-2">
                            <Tag className="size-3.5 text-primary shrink-0" />
                            <span>{cat.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground leading-relaxed">
                          {cat.description || "Tidak ada deskripsi rinci."}
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
                  <span>Total <strong>{categories.length}</strong> kategori sarpras aktif</span>
                  <span>SAFA UNESA Standards</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
