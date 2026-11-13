import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Layers,
  MapPin,
  Sparkles,
  ArrowRight,
  Camera,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { getResolvedReports } from "@/lib/actions/reports";
import { formatTicketCode } from "@/lib/utils";

export const instant = false;

export const metadata: Metadata = {
  title: "Laporan Selesai Ditangani - Transparansi Perbaikan Fasilitas SAFA UNESA",
  description:
    "Daftar rekam jejak fasilitas dan sarana prasarana UNESA yang telah berhasil diperbaiki dan dituntaskan oleh tim sarpras.",
};

export default async function ResolvedReportsPage() {
  const { reports = [] } = await getResolvedReports({ limit: 30 });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between relative selection:bg-primary selection:text-primary-foreground overflow-x-hidden">
      {/* Background ambient accents */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[90vw] max-w-[720px] h-[340px] bg-primary/10 blur-[110px] rounded-full" />
        <div className="absolute top-[480px] -right-24 w-80 h-80 bg-accent/30 blur-[100px] rounded-full" />
      </div>

      <main className="flex-1 max-w-5xl mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-10 w-full space-y-6 sm:space-y-8">
        {/* Top Header */}
        <header className="flex items-center justify-between gap-3 pb-2 border-b border-border/50">
          <Link
            href="/"
            className={buttonVariants({
              variant: "ghost",
              size: "sm",
              className: "gap-1.5 text-muted-foreground hover:text-foreground -ml-2",
            })}
          >
            <ArrowLeft className="size-4" />
            <span className="text-xs font-semibold">Kembali ke Beranda</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
              <CheckCircle2 className="size-3" />
              Transparansi Publik
            </span>
          </div>
        </header>

        {/* Hero Section */}
        <section className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold">
            <Sparkles className="size-3.5 text-primary" />
            <span>Katalog Hasil Penanganan Sarpras</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-foreground">
            Laporan Selesai Ditangani
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
            Bukti nyata respon cepat dan pemeliharaan fasilitas Universitas Negeri Surabaya. Setiap laporan yang telah tuntas diperbaiki oleh teknisi diverifikasi transparan beserta riwayat dan bukti hasil pengerjaan.
          </p>
        </section>

        {/* Reports Grid */}
        {reports.length === 0 ? (
          <Card className="border-dashed py-12 text-center">
            <CardContent className="space-y-3">
              <div className="mx-auto size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <CheckCircle2 className="size-6" />
              </div>
              <h3 className="text-base font-semibold">Belum ada laporan selesai</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Saat ini belum ada data perbaikan fasilitas yang telah ditandai tuntas. Laporan baru akan muncul di sini begitu staf menyelesaikan perbaikan.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {reports.map((report) => {
              const ticketCode = formatTicketCode(report.id);
              const formattedDate = new Date(report.updated_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              // Check for resolution proof image first, otherwise report evidence image
              const resolutionPhoto = report.report_images?.find(
                (img) =>
                  img.mime_type?.includes("type=resolution") ||
                  img.storage_path.includes("resolution_")
              );
              const displayImage = resolutionPhoto || report.report_images?.[0];
              const totalImages = report.report_images?.length || 0;

              return (
                <Card
                  key={report.id}
                  className="group flex flex-col justify-between overflow-hidden border-border/70 hover:border-primary/50 transition-all hover:shadow-md bg-card/60 backdrop-blur-sm"
                >
                  <div>
                    {/* Image Preview / Banner */}
                    <div className="relative aspect-[16/10] bg-muted overflow-hidden border-b border-border/50">
                      {displayImage ? (
                        <Image
                          src={displayImage.storage_path}
                          alt={report.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/50 gap-2">
                          <Camera className="size-8 stroke-[1.5]" />
                          <span className="text-[11px] font-medium">Tanpa Lampiran Foto</span>
                        </div>
                      )}

                      {/* Status Overlay Badge */}
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                        <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10px] px-2 py-0.5 shadow-sm inline-flex items-center gap-1">
                          <CheckCircle2 className="size-3" />
                          Selesai Diperbaiki
                        </Badge>
                      </div>

                      {resolutionPhoto && (
                        <div className="absolute top-2.5 right-2.5">
                          <Badge variant="secondary" className="text-[9px] bg-background/85 backdrop-blur-md border border-border/50 text-foreground font-semibold">
                            Foto Bukti Sarpras
                          </Badge>
                        </div>
                      )}

                      {totalImages > 1 && (
                        <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-background/80 backdrop-blur-md text-[10px] font-medium text-foreground border border-border/40">
                          +{totalImages - 1} foto
                        </div>
                      )}
                    </div>

                    <CardHeader className="p-4 pb-2 space-y-2">
                      <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                        <span className="font-mono font-bold text-primary tracking-wider">
                          {ticketCode}
                        </span>
                        <div className="flex items-center gap-1 text-[11px]">
                          <Calendar className="size-3" />
                          <span>{formattedDate}</span>
                        </div>
                      </div>

                      <CardTitle className="text-base font-bold line-clamp-2 group-hover:text-primary transition-colors">
                        {report.title}
                      </CardTitle>

                      <CardDescription className="text-xs line-clamp-2 leading-relaxed">
                        {report.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="p-4 pt-0 space-y-2 text-xs">
                      {/* Location Badge & Category */}
                      <div className="space-y-1.5 pt-1 text-muted-foreground">
                        {report.location && (
                          <div className="flex items-start gap-1.5">
                            <MapPin className="size-3.5 text-primary shrink-0 mt-0.5" />
                            <span className="line-clamp-1 text-[11px]">
                              {report.location.campus_name} · {report.location.building_name}
                              {report.location.room_or_area ? ` (${report.location.room_or_area})` : ""}
                            </span>
                          </div>
                        )}

                        {report.category && (
                          <div className="flex items-center gap-1.5">
                            <Layers className="size-3.5 text-accent shrink-0" />
                            <span className="text-[11px] font-medium text-foreground">
                              {report.category.name}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </div>

                  {/* Card Footer / Action */}
                  <div className="p-4 pt-2 border-t border-border/40 bg-muted/20">
                    <Link
                      href={`/reports/${report.id}`}
                      className={buttonVariants({
                        variant: "outline",
                        size: "sm",
                        className: "w-full justify-between text-xs h-8 group-hover:border-primary/50 group-hover:bg-primary group-hover:text-primary-foreground transition-all",
                      })}
                    >
                      <span>Lihat Riwayat &amp; Bukti</span>
                      <ArrowRight className="size-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/70 py-6 bg-card/60 backdrop-blur-md text-xs text-muted-foreground mt-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground">SAFA UNESA</span>
              <span className="text-muted-foreground font-normal text-[11px]">
                · Kampus Ketintang &amp; Lidah Wetan
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px]">
              <Link href="/" className="hover:underline text-muted-foreground hover:text-foreground">
                Ajukan Laporan
              </Link>
              <Link href="/docs/user" className="hover:underline text-muted-foreground hover:text-foreground">
                Panduan SOP
              </Link>
              <Link href="/docs" className="hover:underline text-muted-foreground hover:text-foreground">
                Dokumentasi
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
              >
                <span>Login Staf</span>
                <ArrowRight className="size-3" />
              </Link>
            </div>
          </div>

          <div className="text-[10px] sm:text-[11px] text-muted-foreground/80 flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-border/40">
            <span>&copy; {new Date().getFullYear()} Biro Sarana &amp; Prasarana Universitas Negeri Surabaya</span>
            <div className="flex items-center gap-1.5 text-foreground font-medium">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sistem Aktif &amp; Terbuka</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
