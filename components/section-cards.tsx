"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Inbox,
  Clock,
  Wrench,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { DashboardStats } from "@/lib/actions/dashboard";

export function SectionCards({ stats }: { stats?: DashboardStats }) {
  const data = stats || {
    totalReports: 6,
    submittedCount: 2,
    inProgressCount: 2,
    resolvedCount: 1,
    rejectedCount: 1,
    avgResolutionDays: 1.8,
  };

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {/* 1. Total Laporan */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="text-xs font-medium">Total Laporan Fasilitas</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums @[250px]/card:text-3xl flex items-center justify-between">
            <span>{data.totalReports}</span>
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Inbox className="size-4" />
            </div>
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1 border-primary/20 text-primary text-[11px]">
              <TrendingUp className="size-3" />
              <span>Aktif</span>
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-xs">
          <div className="line-clamp-1 flex gap-1.5 font-medium text-foreground">
            Akumulasi seluruh kampus UNESA
          </div>
          <div className="text-muted-foreground">
            Ketintang &amp; Lidah Wetan
          </div>
        </CardFooter>
      </Card>

      {/* 2. Menunggu Verifikasi */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="text-xs font-medium">Menunggu Verifikasi</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums @[250px]/card:text-3xl flex items-center justify-between">
            <span className="text-amber-500 dark:text-amber-400">{data.submittedCount}</span>
            <div className="size-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <Clock className="size-4" />
            </div>
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1 border-amber-500/30 text-amber-600 dark:text-amber-400 text-[11px] bg-amber-500/5">
              <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>Prioritas</span>
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-xs">
          <div className="line-clamp-1 flex gap-1.5 font-medium text-foreground">
            Butuh tinjauan staf sarpras
          </div>
          <div className="text-muted-foreground">
            Segera validasi kelayakan laporan
          </div>
        </CardFooter>
      </Card>

      {/* 3. Sedang Ditangani */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="text-xs font-medium">Sedang Ditangani</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums @[250px]/card:text-3xl flex items-center justify-between">
            <span className="text-primary">{data.inProgressCount}</span>
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Wrench className="size-4" />
            </div>
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1 border-primary/20 text-primary text-[11px]">
              <Wrench className="size-3" />
              <span>Di Lapangan</span>
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-xs">
          <div className="line-clamp-1 flex gap-1.5 font-medium text-foreground">
            Pekerjaan teknisi aktif
          </div>
          <div className="text-muted-foreground">
            Dalam tahap inspeksi &amp; perbaikan
          </div>
        </CardFooter>
      </Card>

      {/* 4. Penanganan Selesai */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="text-xs font-medium">Penanganan Selesai</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums @[250px]/card:text-3xl flex items-center justify-between">
            <span className="text-emerald-600 dark:text-emerald-400">{data.resolvedCount}</span>
            <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <CheckCircle2 className="size-4" />
            </div>
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[11px] bg-emerald-500/5">
              <CheckCircle2 className="size-3" />
              <span>Tuntas</span>
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-xs">
          <div className="line-clamp-1 flex gap-1.5 font-medium text-foreground">
            Fasilitas normal kembali
          </div>
          <div className="text-muted-foreground">
            Rata-rata tuntas &le; 2 hari kerja
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
