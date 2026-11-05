"use client";

import * as React from "react";
import {
  FileText,
  ShieldCheck,
  Wrench,
  CheckCircle2,
  XCircle,
  User,
  Clock,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ReportStatusLogItem {
  id: string;
  previous_status: string | null;
  new_status: string;
  notes: string | null;
  created_at: string;
  changed_by_user?: {
    name: string;
    role: string;
  } | null;
}

interface ReportTimelineProps {
  logs: ReportStatusLogItem[];
  className?: string;
}

interface StatusConfig {
  label: string;
  badgeClass: string;
  nodeBorder: string;
  nodeText: string;
  icon: React.ReactNode;
}

function getStatusConfig(status: string): StatusConfig {
  switch (status) {
    case "submitted":
      return {
        label: "Laporan Diajukan",
        badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
        nodeBorder: "border-blue-500/60",
        nodeText: "text-blue-500",
        icon: <FileText className="size-4" />,
      };
    case "verified":
      return {
        label: "Terverifikasi Valid",
        badgeClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30",
        nodeBorder: "border-sky-500/60",
        nodeText: "text-sky-500",
        icon: <ShieldCheck className="size-4" />,
      };
    case "in_progress":
      return {
        label: "Sedang Ditangani Teknisi",
        badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
        nodeBorder: "border-amber-500/60",
        nodeText: "text-amber-500",
        icon: <Wrench className="size-4" />,
      };
    case "resolved":
      return {
        label: "Selesai (Tuntas Diperbaiki)",
        badgeClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/35",
        nodeBorder: "border-emerald-500/60",
        nodeText: "text-emerald-500",
        icon: <CheckCircle2 className="size-4" />,
      };
    case "rejected":
      return {
        label: "Laporan Ditolak",
        badgeClass: "bg-destructive/10 text-destructive border-destructive/30",
        nodeBorder: "border-destructive/60",
        nodeText: "text-destructive",
        icon: <XCircle className="size-4" />,
      };
    default:
      return {
        label: status.toUpperCase(),
        badgeClass: "bg-muted text-foreground border-border",
        nodeBorder: "border-border",
        nodeText: "text-muted-foreground",
        icon: <Clock className="size-4" />,
      };
  }
}

function formatRoleLabel(role?: string): string {
  if (!role) return "Sistem";
  if (role === "facility_staff") return "Staf Sarpras";
  if (role === "student") return "Mahasiswa";
  if (role === "lecturer") return "Dosen";
  if (role === "admin") return "Admin Sarpras";
  return role;
}

export function ReportTimeline({ logs, className }: ReportTimelineProps) {
  // Deduplikasi log kembar (menghapus log trigger otomatis duplikat yang berdekatan)
  const cleanLogs = React.useMemo(() => {
    if (!logs || logs.length === 0) return [];

    // Urutkan dari terlama ke terbaru (kronologis)
    const sorted = [...logs].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    return sorted.filter((log, idx, arr) => {
      // Jika log ini tidak punya aktor (changed_by_user = null), cek apakah ada log lain dengan status sama dalam rentang 15 detik
      if (!log.changed_by_user) {
        const hasBetterLog = arr.some((other, otherIdx) => {
          if (otherIdx === idx) return false;
          if (other.new_status !== log.new_status) return false;
          const timeDiff = Math.abs(
            new Date(other.created_at).getTime() - new Date(log.created_at).getTime()
          );
          return Boolean(other.changed_by_user) && timeDiff < 15000;
        });
        if (hasBetterLog) return false;
      }
      return true;
    });
  }, [logs]);

  if (cleanLogs.length === 0) {
    return (
      <div className="p-4 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground">
        Belum ada riwayat aktivitas penanganan.
      </div>
    );
  }

  return (
    <div className={cn("space-y-0", className)}>
      {cleanLogs.map((log, index) => {
        const config = getStatusConfig(log.new_status);
        const isLatest = index === cleanLogs.length - 1;
        const isLast = index === cleanLogs.length - 1;

        return (
          <div key={log.id || index} className="flex gap-3.5 sm:gap-5 items-stretch group">
            {/* Kolom Kiri: Node Ikon Bulat + Garis Vertikal Terpisah */}
            <div className="flex flex-col items-center shrink-0 w-9 sm:w-10">
              {/* Node Ikon Lingkaran (Solid bg-card, garis tidak tembus) */}
              <div
                className={cn(
                  "size-8.5 sm:size-9.5 rounded-full border-2 flex items-center justify-center shrink-0 bg-card shadow-xs z-10 transition-transform",
                  config.nodeBorder,
                  config.nodeText,
                  isLatest && "ring-3 ring-primary/20 scale-105"
                )}
              >
                {config.icon}
              </div>

              {/* Garis Vertikal Penghubung Antar Node (Hanya jika bukan item terakhir) */}
              {!isLast && (
                <div className="w-[2px] grow bg-border/80 my-1 group-hover:bg-border transition-colors" />
              )}
            </div>

            {/* Kolom Kanan: Card Konten Linimasa dengan Jarak Lega */}
            <div className={cn("flex-1 min-w-0", !isLast ? "pb-5 sm:pb-6" : "pb-1")}>
              <div
                className={cn(
                  "p-3.5 sm:p-4.5 rounded-2xl border border-border/80 bg-card/75 hover:bg-card transition-all space-y-2.5 shadow-2xs",
                  isLatest && "border-primary/40 bg-card shadow-xs ring-1 ring-primary/10"
                )}
              >
                {/* Header: Status Badge + Jam */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-bold border",
                      config.badgeClass
                    )}
                  >
                    <span>{config.label}</span>
                    {isLatest && (
                      <span className="flex size-1.5 rounded-full bg-current animate-pulse" />
                    )}
                  </span>

                  <div className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
                    <Clock className="size-3" />
                    <span>
                      {new Date(log.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      WIB
                    </span>
                  </div>
                </div>

                {/* Isi Deskripsi / Catatan Progres */}
                <p className="text-xs sm:text-[13px] text-foreground/90 leading-relaxed font-normal whitespace-pre-line">
                  {log.notes || "Status laporan diperbarui oleh sistem sarpras."}
                </p>

                {/* Footer: Identitas Aktor */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40 text-[11px]">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <div className="size-4.5 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                      <User className="size-3" />
                    </div>
                    <span>
                      Oleh:{" "}
                      <strong className="text-foreground font-semibold">
                        {log.changed_by_user?.name || "Sistem Otomatis (SAFA)"}
                      </strong>{" "}
                      {log.changed_by_user && (
                        <span className="text-muted-foreground/80 font-normal">
                          ({formatRoleLabel(log.changed_by_user.role)})
                        </span>
                      )}
                    </span>
                  </div>

                  {isLatest && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md">
                      <Sparkles className="size-2.5" />
                      <span>Status Terkini</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
