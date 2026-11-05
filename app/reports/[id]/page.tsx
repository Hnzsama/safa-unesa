import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Layers,
  ShieldCheck,
  Wrench,
  XCircle,
  History,
  Camera,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getReportDetailWithLogs } from "@/lib/actions/reports";
import { ReportImageGallery } from "@/components/reports/report-image-gallery";
import { ReportTimeline } from "@/components/reports/report-timeline";
import { formatTicketCode } from "@/lib/utils";

export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const res = await getReportDetailWithLogs(id);

  if (!res.success || !res.report) {
    return {
      title: "Tiket Laporan Tidak Ditemukan",
      description: "Tiket laporan fasilitas yang Anda cari tidak ditemukan di database SAFA UNESA.",
    };
  }

  const report = res.report;
  const ticketCode = formatTicketCode(report.id);
  const locationText = report.location
    ? `${report.location.campus_name} - ${report.location.building_name} (${report.location.room_or_area})`
    : "Kampus UNESA";
  const title = `${report.title} (${ticketCode})`;
  const description = `Pantau progres penanganan fasilitas "${report.title}" di ${locationText}. Kategori: ${report.category?.name || "Sarpras"}. Status: ${report.current_status}.`;

  const ogImages = report.report_images?.length
    ? [report.report_images[0].storage_path]
    : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: `/reports/${id}`,
    },
    openGraph: {
      title: `${title} | SAFA UNESA`,
      description,
      images: ogImages,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | SAFA UNESA`,
      description,
      images: ogImages,
    },
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await getReportDetailWithLogs(id);

  if (!res.success || !res.report) {
    notFound();
  }

  const report = res.report;

  // Pisahkan foto bukti keluhan awal pelapor vs bukti perbaikan petugas
  const resolutionProofImages = (report.report_images || []).filter(
    (img) =>
      img.storage_path.includes("resolution_") ||
      img.mime_type?.includes("resolution")
  );

  const initialProofImages = (report.report_images || []).filter(
    (img) =>
      !img.storage_path.includes("resolution_") &&
      !img.mime_type?.includes("resolution")
  );

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return (
          <Badge variant="outline" className="gap-1 border-muted-foreground/30 text-muted-foreground">
            <Clock className="size-3.5" />
            <span>Menunggu Verifikasi Staf</span>
          </Badge>
        );
      case "verified":
        return (
          <Badge className="gap-1 bg-primary/10 text-primary border-primary/20">
            <ShieldCheck className="size-3.5" />
            <span>Terverifikasi (Valid)</span>
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="size-3.5" />
            <span>Laporan Ditolak</span>
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="secondary" className="gap-1 bg-accent text-accent-foreground border-border">
            <Wrench className="size-3.5" />
            <span>Sedang Ditangani Teknisi</span>
          </Badge>
        );
      case "resolved":
        return (
          <Badge className="gap-1 bg-primary text-primary-foreground">
            <CheckCircle2 className="size-3.5" />
            <span>Penanganan Selesai</span>
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-border bg-background/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className={buttonVariants({ variant: "ghost", size: "sm", className: "gap-1.5 text-xs sm:text-sm" })}
          >
            <ArrowLeft className="size-4" />
            <span>Kembali ke Beranda</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground font-semibold">
              KODE TIKET:
            </span>
            <span className="text-xs font-mono font-bold text-foreground bg-muted px-2.5 py-1 rounded-lg border border-border">
              {formatTicketCode(report.id)}
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 w-full space-y-6">
        {/* Header Title Card */}
        <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {renderStatusBadge(report.current_status)}
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="size-3.5" />
                {new Date(report.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              Pelapor: <strong>{report.reporter?.name || "Mahasiswa"}</strong> ({report.reporter?.identity_number || "-"})
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            {report.title}
          </h1>

          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {report.description}
          </p>

          {/* Alert jika ditolak */}
          {report.current_status === "rejected" && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs space-y-1">
              <span className="font-bold flex items-center gap-1.5 text-sm">
                <XCircle className="size-4" />
                Alasan Penolakan dari Staf Sarpras:
              </span>
              <p className="leading-relaxed pl-5">
                {report.rejection_reason || "Tidak memenuhi kriteria laporan perbaikan sarpras."}
              </p>
            </div>
          )}
        </div>

        {/* 2 Kolom: Detail Lokasi/Foto & Linimasa Audit Trail */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Kolom Kiri: Detail Lokasi & Bukti Foto */}
          <div className="md:col-span-5 space-y-6">
            <Card className="border border-border bg-card shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Building2 className="size-4 text-primary" />
                  <span>Lokasi & Fasilitas</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="space-y-1">
                  <span className="text-muted-foreground block text-[11px]">Kampus & Gedung:</span>
                  <span className="font-semibold text-foreground">
                    {report.location?.campus_name} - {report.location?.building_name}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground block text-[11px]">Ruang / Area:</span>
                  <span className="font-semibold text-foreground">
                    {report.location?.floor ? `${report.location.floor}, ` : ""}{report.location?.room_or_area}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground block text-[11px]">Kategori Kerusakan:</span>
                  <span className="font-semibold text-foreground flex items-center gap-1">
                    <Layers className="size-3.5 text-primary" />
                    {report.category?.name || "Umum"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* 1. Foto Bukti Hasil Perbaikan oleh Petugas Sarpras */}
            {resolutionProofImages.length > 0 && (
              <Card className="border border-emerald-500/40 bg-emerald-500/5 shadow-xs overflow-hidden">
                <CardHeader className="pb-3 bg-emerald-500/10 border-b border-emerald-500/20">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="size-4 shrink-0" />
                      <span>Bukti Hasil Perbaikan Petugas</span>
                    </CardTitle>
                    <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30 text-[10px] shrink-0 font-bold">
                      Tuntas Diperbaiki
                    </Badge>
                  </div>
                  <CardDescription className="text-xs text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed">
                    Dokumentasi fisik fasilitas yang telah selesai ditangani oleh tim teknisi sarpras UNESA.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <ReportImageGallery images={resolutionProofImages} />
                </CardContent>
              </Card>
            )}

            {/* 2. Foto Bukti Kerusakan Awal dari Pelapor */}
            {initialProofImages.length > 0 && (
              <Card className="border border-border bg-card shadow-xs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Camera className="size-4 text-primary" />
                    <span>Foto Bukti Kerusakan Awal</span>
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Dokumentasi kondisi fasilitas saat pertama kali dilaporkan oleh civitas kampus.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ReportImageGallery images={initialProofImages} />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Kolom Kanan: Linimasa Audit Trail */}
          <div className="md:col-span-7">
            <Card className="border border-border bg-card shadow-xs">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <History className="size-4 text-primary" />
                  <span>Linimasa Penanganan (Audit Trail)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ReportTimeline logs={report.report_status_logs} />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 bg-card text-xs text-muted-foreground mt-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div>&copy; 2026 Universitas Negeri Surabaya.</div>
          <Link href="/" className="hover:underline text-muted-foreground hover:text-foreground">
            Buat Laporan Baru
          </Link>
        </div>
      </footer>
    </div>
  );
}
